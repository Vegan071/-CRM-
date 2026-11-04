"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/shared/api/db";
import { requireUser } from "@/shared/api/session";
import { fail, isUniqueViolation, ok, toDate } from "@/shared/api/action-utils";
import { encrypt } from "@/shared/lib/crypto";
import { normalizeName } from "@/shared/lib/normalize";
import type { ActionResult } from "@/shared/lib/pagination";
import { studentSchema } from "../model/schema";

/**
 * Создаёт студента. Если передан groupId — в той же транзакции зачисляет его в эту учебную группу
 * (стоимость по умолчанию — цена группы за слушателя), так что он сразу виден и в группе, и в общем списке.
 */
export async function createStudent(
    input: unknown,
    groupId?: string,
): Promise<ActionResult<{ id: string; fullName: string }>> {
    const user = await requireUser();

    const parsed = studentSchema.safeParse(input);
    if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "Некорректные данные");
    const v = parsed.data;

    const fullName = normalizeName(v.fullName);
    const birthDate = toDate(v.birthDate);
    const snils = v.snils;

    const trainingGroup = groupId
        ? await db.group.findFirst({ where: { id: groupId, deletedAt: null }, select: { id: true, price: true } })
        : null;
    if (groupId && !trainingGroup) return fail("Учебная группа не найдена");

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
            if (trainingGroup) {
                const enrollment = await tx.enrollment.create({
                    data: { studentId: created.id, groupId: trainingGroup.id, price: trainingGroup.price ?? 0 },
                    select: { id: true },
                });
                await tx.auditLog.create({
                    data: {
                        userId: user.id,
                        entity: "Enrollment",
                        entityId: enrollment.id,
                        action: "CREATE",
                        diff: { groupId: trainingGroup.id, studentId: created.id },
                    },
                });
            }
            return created;
        });
        revalidatePath("/students");
        if (trainingGroup) {
            revalidatePath(`/groups/${trainingGroup.id}`);
            revalidatePath("/");
        }
        return ok(student);
    } catch (e) {
        if (isUniqueViolation(e)) return fail("Студент с таким ФИО и датой рождения уже существует");
        console.error("createStudent failed", e);
        return fail("Не удалось создать студента");
    }
}