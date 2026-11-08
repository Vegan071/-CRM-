"use server";

import { db } from "@/shared/api/db";
import { requireUser } from "@/shared/api/session";
import { logAction } from "@/shared/api/audit";
import { fail, ok } from "@/shared/api/action-utils";
import type { ActionResult } from "@/shared/lib/pagination";
import { revalidateGroup } from "@/entities/group/api/revalidate";
import { idSchema } from "./id-schema";

/** Убирает слушателя из группы (мягкое удаление зачисления) */
export async function removeListener(enrollmentId: string): Promise<ActionResult<null>> {
    const user = await requireUser();
    if (!idSchema.safeParse(enrollmentId).success) return fail("Некорректные данные");

    const enrollment = await db.enrollment.findFirst({
        where: { id: enrollmentId, deletedAt: null },
        select: { id: true, groupId: true, studentId: true },
    });
    if (!enrollment) return fail("Зачисление не найдено");

    try {
        await db.$transaction(async (tx) => {
            await tx.enrollment.update({ where: { id: enrollment.id }, data: { deletedAt: new Date() } });
            await logAction(
                user.id,
                "Enrollment",
                enrollment.id,
                "DELETE",
                { groupId: enrollment.groupId, studentId: enrollment.studentId },
                tx,
            );
        });
        revalidateGroup(enrollment.groupId);
        return ok(null);
    } catch (e) {
        console.error("removeListener failed", e);
        return fail("Не удалось удалить слушателя из группы");
    }
}
