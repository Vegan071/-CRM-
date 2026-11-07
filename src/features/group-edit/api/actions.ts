"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/shared/api/db";
import { requireUser } from "@/shared/api/session";
import { fail, INT32_MAX, isUniqueViolation, ok, toDate } from "@/shared/api/action-utils";
import { toKopecks } from "@/shared/lib/money";
import { normalizeName } from "@/shared/lib/normalize";
import type { ActionResult } from "@/shared/lib/pagination";
import { groupSchema } from "@/features/group-create/model/schema";

const idSchema = z.string().min(1).max(64);

/** Редактирование параметров учебной группы: название, сроки, преподаватели, стоимость, статус */
export async function updateGroup(groupId: string, input: unknown): Promise<ActionResult<{ name: string }>> {
    const user = await requireUser();
    if (!idSchema.safeParse(groupId).success) return fail("Некорректные данные");

    const parsed = groupSchema.safeParse(input);
    if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "Некорректные данные");
    const v = parsed.data;

    const name = normalizeName(v.name);
    const startDate = toDate(v.startDate);
    const endDate = toDate(v.endDate);
    const price = toKopecks(v.pricePerListener);
    const totalPrice = toKopecks(v.totalPriceWithDiscount);
    if (price > INT32_MAX || totalPrice > INT32_MAX) return fail("Слишком большая сумма");

    const teacherIds = [...new Set([v.teacherId, ...(v.masterId ? [v.masterId] : [])])];
    const [group, duplicate, teachersFound] = await Promise.all([
        db.group.findFirst({ where: { id: groupId, deletedAt: null }, select: { id: true } }),
        db.group.findFirst({
            where: {
                deletedAt: null,
                id: { not: groupId },
                name: { equals: name, mode: "insensitive" },
                startDate,
            },
            select: { id: true },
        }),
        db.teacher.count({ where: { id: { in: teacherIds }, deletedAt: null } }),
    ]);
    if (!group) return fail("Группа не найдена");
    if (duplicate) return fail("Группа с таким названием и датой начала уже существует");
    if (teachersFound !== teacherIds.length) return fail("Преподаватель или мастер не найден");

    try {
        await db.$transaction(async (tx) => {
            await tx.group.update({
                where: { id: groupId },
                data: {
                    name,
                    startDate,
                    endDate,
                    status: v.status,
                    teacherId: v.teacherId,
                    masterId: v.masterId,
                    listenersCount: v.listenersCount,
                    collegeStudentsCount: v.collegeStudentsCount,
                    discountCount: v.discountCount,
                    price,
                    totalPrice,
                },
            });
            await tx.auditLog.create({
                data: {
                    userId: user.id,
                    entity: "Group",
                    entityId: groupId,
                    action: "UPDATE",
                    diff: {
                        name,
                        status: v.status,
                        listenersCount: v.listenersCount,
                        collegeStudentsCount: v.collegeStudentsCount,
                        discountCount: v.discountCount,
                        price,
                        totalPrice,
                    },
                },
            });
        });
        revalidatePath(`/groups/${groupId}`);
        revalidatePath("/");
        return ok({ name });
    } catch (e) {
        if (isUniqueViolation(e)) return fail("Группа с таким названием и датой начала уже существует");
        console.error("updateGroup failed", e);
        return fail("Не удалось сохранить изменения");
    }
}
