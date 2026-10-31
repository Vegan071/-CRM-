"use server";

import { db } from "@/shared/api/db";
import { requireUser } from "@/shared/api/session";
import { fail, INT32_MAX, isUniqueViolation, ok, toDate } from "@/shared/api/action-utils";
import { toKopecks } from "@/shared/lib/money";
import { normalizeName } from "@/shared/lib/normalize";
import type { ActionResult } from "@/shared/lib/pagination";
import { groupSchema } from "../model/schema";
import {revalidatePath} from "next/cache";

export async function createTrainingGroup(input: unknown): Promise<ActionResult<{ id: string; name: string }>> {
    const user = await requireUser();

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
    const [duplicate, teachersFound] = await Promise.all([
        db.group.findFirst({
            where: { deletedAt: null, name: { equals: name, mode: "insensitive" }, startDate },
            select: { id: true },
        }),
        db.teacher.count({ where: { id: { in: teacherIds }, deletedAt: null } }),
    ]);
    if (duplicate) return fail("Группа с таким названием и датой начала уже существует");
    if (teachersFound !== teacherIds.length) return fail("Преподаватель или мастер не найден");

    try {
        const group = await db.$transaction(async (tx) => {
            const created = await tx.group.create({
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
                select: { id: true, name: true },
            });
            await tx.auditLog.create({
                data: { userId: user.id, entity: "Group", entityId: created.id, action: "CREATE", diff: { name } },
            });
            return created;
        });
        revalidatePath("/groups");
        return ok(group);
    } catch (e) {
        if (isUniqueViolation(e)) return fail("Группа с таким названием и датой начала уже существует");
        console.error("createTrainingGroup failed", e);
        return fail("Не удалось создать группу");
    }
}