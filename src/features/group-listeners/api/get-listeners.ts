import { db } from "@/shared/api/db";
import { decrypt } from "@/shared/lib/crypto";
import { toIsoDate } from "@/shared/lib/date";
import type { Prisma } from "~/prisma/generated/prisma/client";
import type { ListenerDto } from "../model/types";

// битая запись или неверный ключ не должны валить всю страницу группы
function safeDecrypt(payload: string): string | null {
    try {
        return decrypt(payload);
    } catch (e) {
        console.error("decrypt failed", e);
        return null;
    }
}

const listenerSelect = {
    id: true,
    createdAt: true,
    payMethod: true,
    contractNumber: true,
    price: true,
    payments: {
        where: { deletedAt: null },
        select: { amount: true },
    },
    student: {
        select: {
            id: true,
            fullName: true,
            phone: true,
            birthDate: true,
            gender: true,
            snilsEnc: true,
            isDpkStudent: true,
            medCertNumber: true,
            medInstitution: true,
            collegeGroup: { select: { id: true, name: true } },
            curator: { select: { id: true, fullName: true } },
        },
    },
} satisfies Prisma.EnrollmentSelect;

type ListenerRow = Prisma.EnrollmentGetPayload<{ select: typeof listenerSelect }>;

/** Строка БД → DTO для интерфейса (и для будущего экспорта); position — порядковый номер в группе, с 1 */
export function toListenerDto(r: ListenerRow, index: number): ListenerDto {
    return {
        enrollmentId: r.id,
        studentId: r.student.id,
        position: index + 1,
        fullName: r.student.fullName,
        phone: r.student.phone,
        birthDate: toIsoDate(r.student.birthDate),
        gender: r.student.gender,
        snils: r.student.snilsEnc ? safeDecrypt(r.student.snilsEnc) : null,
        isDpkStudent: r.student.isDpkStudent,
        medCertNumber: r.student.medCertNumber,
        medInstitution: r.student.medInstitution,
        collegeGroup: r.student.collegeGroup,
        curator: r.student.curator,
        payMethod: r.payMethod,
        contractNumber: r.contractNumber,
        price: r.price,
        enrolledAt: toIsoDate(r.createdAt),
        paid: r.payments.reduce((sum, p) => sum + p.amount, 0),
    };
}

/** Слушатели группы в порядке зачисления */
export async function getGroupListeners(groupId: string): Promise<ListenerDto[]> {
    const rows = await db.enrollment.findMany({
        where: { groupId, deletedAt: null, student: { deletedAt: null } },
        orderBy: [{ createdAt: "asc" }, { id: "asc" }],
        select: listenerSelect,
    });
    return rows.map(toListenerDto);
}
