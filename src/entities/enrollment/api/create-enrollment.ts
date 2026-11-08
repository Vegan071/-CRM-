import { logAction } from "@/shared/api/audit";
import type { Prisma } from "~/prisma/generated/prisma/client";

/** Зачисляет студента в группу внутри транзакции; стоимость по умолчанию — цена группы за слушателя */
export async function createEnrollment(
    tx: Prisma.TransactionClient,
    userId: string,
    studentId: string,
    group: { id: string; price: number | null },
) {
    const enrollment = await tx.enrollment.create({
        data: { studentId, groupId: group.id, price: group.price ?? 0 },
        select: { id: true },
    });
    await logAction(userId, "Enrollment", enrollment.id, "CREATE", { groupId: group.id, studentId }, tx);
    return enrollment;
}
