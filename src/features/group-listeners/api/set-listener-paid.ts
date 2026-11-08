"use server";

import { db } from "@/shared/api/db";
import { requireUser } from "@/shared/api/session";
import { logAction } from "@/shared/api/audit";
import { fail, ok, toDate } from "@/shared/api/action-utils";
import type { ActionResult } from "@/shared/lib/pagination";
import type { Prisma } from "~/prisma/generated/prisma/client";
import { revalidateGroup } from "@/entities/group/api/revalidate";
import { idSchema } from "./id-schema";

/** Добавляет платёж на остаток до полной стоимости */
async function payRemainder(tx: Prisma.TransactionClient, userId: string, enrollmentId: string, rest: number) {
    const payment = await tx.payment.create({
        data: {
            enrollmentId,
            paidAt: toDate(new Date().toISOString().slice(0, 10)),
            amount: rest,
            note: "Отмечено как оплачено",
        },
        select: { id: true },
    });
    await logAction(userId, "Payment", payment.id, "CREATE", { enrollmentId, amount: rest }, tx);
}

/** Снимает (мягко удаляет) все платежи зачисления */
async function clearPayments(
    tx: Prisma.TransactionClient,
    userId: string,
    enrollmentId: string,
    cleared: { count: number; amount: number },
) {
    await tx.payment.updateMany({
        where: { enrollmentId, deletedAt: null },
        data: { deletedAt: new Date() },
    });
    await logAction(
        userId,
        "Enrollment",
        enrollmentId,
        "UPDATE",
        { paymentsCleared: cleared.count, amount: cleared.amount },
        tx,
    );
}

/**
 * Быстрая отметка оплаты.
 * paid = true  — добавляет платёж на остаток до полной стоимости;
 * paid = false — снимает (мягко удаляет) все платежи.
 */
export async function setListenerPaid(enrollmentId: string, paid: boolean): Promise<ActionResult<null>> {
    const user = await requireUser();
    if (!idSchema.safeParse(enrollmentId).success || typeof paid !== "boolean") return fail("Некорректные данные");

    const enrollment = await db.enrollment.findFirst({
        where: { id: enrollmentId, deletedAt: null },
        select: {
            id: true,
            groupId: true,
            price: true,
            payments: { where: { deletedAt: null }, select: { id: true, amount: true } },
        },
    });
    if (!enrollment) return fail("Зачисление не найдено");

    if (paid && enrollment.price <= 0) return fail("Сначала укажите стоимость больше 0");
    const alreadyPaid = enrollment.payments.reduce((sum, p) => sum + p.amount, 0);

    try {
        await db.$transaction(async (tx) => {
            if (paid) {
                const rest = enrollment.price - alreadyPaid;
                if (rest <= 0) return;
                await payRemainder(tx, user.id, enrollment.id, rest);
            } else {
                if (enrollment.payments.length === 0) return;
                await clearPayments(tx, user.id, enrollment.id, {
                    count: enrollment.payments.length,
                    amount: alreadyPaid,
                });
            }
        });
    } catch (e) {
        console.error("setListenerPaid failed", e);
        return fail("Не удалось изменить оплату");
    }

    revalidateGroup(enrollment.groupId);
    return ok(null);
}
