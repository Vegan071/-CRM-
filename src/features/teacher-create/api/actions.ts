"use server";

import { db } from "@/shared/api/db";
import { requireUser } from "@/shared/api/session";
import { logAction } from "@/shared/api/audit";
import { fail, isUniqueViolation, ok, toDate } from "@/shared/api/action-utils";
import type { ActionResult } from "@/shared/lib/pagination";
import { teacherSchema } from "../model/schema";

export async function createTeacherContract(input: unknown): Promise<ActionResult<{ id: string }>> {
    const user = await requireUser();

    const parsed = teacherSchema.safeParse(input);
    if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "Некорректные данные");
    const v = parsed.data;

    const [teacher, duplicate] = await Promise.all([
        db.teacher.findFirst({ where: { id: v.teacherId, deletedAt: null }, select: { id: true } }),
        db.groupTeacher.findFirst({
            where: {
                teacherId: v.teacherId,
                contractNumber: { equals: v.contractNumber, mode: "insensitive" },
                deletedAt: null,
            },
            select: { id: true },
        }),
    ]);
    if (!teacher) return fail("Преподаватель не найден");
    if (duplicate) return fail("У этого преподавателя уже есть контракт с таким номером");

    try {
        const created = await db.$transaction(async (tx) => {
            const row = await tx.groupTeacher.create({
                data: {
                    teacherId: v.teacherId,
                    contractNumber: v.contractNumber,
                    contractDate: toDate(v.conclusionDate),
                    serviceStartDate: toDate(v.serviceStartDate),
                    serviceEndDate: toDate(v.serviceEndDate),
                    contractStartDate: toDate(v.contractStartDate),
                    contractEndDate: toDate(v.contractEndDate),
                },
                select: { id: true },
            });
            await logAction(
                user.id,
                "GroupTeacher",
                row.id,
                "CREATE",
                { teacherId: v.teacherId, contractNumber: v.contractNumber },
                tx,
            );
            return row;
        });
        return ok(created);
    } catch (e) {
        if (isUniqueViolation(e)) return fail("У этого преподавателя уже есть контракт с таким номером");
        console.error("createTeacherContract failed", e);
        return fail("Не удалось создать контракт");
    }
}