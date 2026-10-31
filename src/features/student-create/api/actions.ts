"use server";

import { db } from "@/shared/api/db";
import { requireUser } from "@/shared/api/session";
import { fail, isUniqueViolation, ok, toDate } from "@/shared/api/action-utils";
import { encrypt } from "@/shared/lib/crypto";
import { normalizeName } from "@/shared/lib/normalize";
import type { ActionResult } from "@/shared/lib/pagination";
import { studentSchema } from "../model/schema";

export async function createStudent(input: unknown): Promise<ActionResult<{ id: string; fullName: string }>> {
    const user = await requireUser();

    const parsed = studentSchema.safeParse(input);
    if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "Некорректные данные");
    const v = parsed.data;

    const fullName = normalizeName(v.fullName);
    const birthDate = toDate(v.birthDate);
    const snils = v.snils;

    const [duplicate, group, curator] = await Promise.all([
        db.student.findFirst({
            where: { deletedAt: null, fullName: { equals: fullName, mode: "insensitive" }, birthDate },
            select: { id: true },
        }),
        v.collegeGroupId
            ? db.collegeGroup.findFirst({ where: { id: v.collegeGroupId, deletedAt: null }, select: { id: true } })
            : true,
        v.curatorId
            ? db.teacher.findFirst({ where: { id: v.curatorId, deletedAt: null }, select: { id: true } })
            : true,
    ]);
    if (duplicate) return fail("Студент с таким ФИО и датой рождения уже существует");
    if (!group) return fail("Группа не найдена");
    if (!curator) return fail("Куратор не найден");

    try {
        const student = await db.$transaction(async (tx) => {
            const created = await tx.student.create({
                data: {
                    fullName,
                    phone: v.phone,
                    birthDate,
                    gender: v.gender,
                    snilsEnc: encrypt(snils),
                    collegeGroupId: v.collegeGroupId,
                    curatorId: v.curatorId,
                    isDpkStudent: v.isDpkStudent,
                    medCertNumber: v.medCertNumber,
                    medInstitution: v.medInstitution,
                },
                select: { id: true, fullName: true },
            });
            await tx.auditLog.create({
                data: {
                    userId: user.id,
                    entity: "Student",
                    entityId: created.id,
                    action: "CREATE",
                    diff: { fullName }, // СНИЛС в журнал не пишем
                },
            });
            return created;
        });
        return ok(student);
    } catch (e) {
        if (isUniqueViolation(e)) return fail("Студент с таким ФИО и датой рождения уже существует");
        console.error("createStudent failed", e);
        return fail("Не удалось создать студента");
    }
}