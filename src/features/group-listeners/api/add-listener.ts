"use server";

import { z } from "zod";
import { db } from "@/shared/api/db";
import { requireUser } from "@/shared/api/session";
import { fail, isUniqueViolation, ok } from "@/shared/api/action-utils";
import type { ActionResult } from "@/shared/lib/pagination";
import { createEnrollment } from "@/entities/enrollment/api/create-enrollment";
import { revalidateGroup } from "@/entities/group/api/revalidate";
import { idSchema } from "./id-schema";

const addSchema = z.object({ groupId: idSchema, studentId: idSchema });

/** Зачисляет студента в группу; стоимость по умолчанию — цена группы за слушателя */
export async function addListener(input: unknown): Promise<ActionResult<{ id: string }>> {
    const user = await requireUser();

    const parsed = addSchema.safeParse(input);
    if (!parsed.success) return fail("Некорректные данные");
    const { groupId, studentId } = parsed.data;

    const [group, student, existing] = await Promise.all([
        db.group.findFirst({ where: { id: groupId, deletedAt: null }, select: { id: true, price: true } }),
        db.student.findFirst({ where: { id: studentId, deletedAt: null }, select: { id: true } }),
        db.enrollment.findFirst({ where: { groupId, studentId, deletedAt: null }, select: { id: true } }),
    ]);
    if (!group) return fail("Группа не найдена");
    if (!student) return fail("Студент не найден");
    if (existing) return fail("Этот слушатель уже в группе");

    try {
        const created = await db.$transaction((tx) => createEnrollment(tx, user.id, studentId, group));
        revalidateGroup(groupId);
        return ok(created);
    } catch (e) {
        if (isUniqueViolation(e)) return fail("Этот слушатель уже в группе");
        console.error("addListener failed", e);
        return fail("Не удалось добавить слушателя");
    }
}
