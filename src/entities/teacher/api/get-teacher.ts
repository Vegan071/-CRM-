import { db } from "@/shared/api/db";
import { toIsoDate } from "@/shared/lib/date";
import type { Prisma } from "~/prisma/generated/prisma/client";
import type { TeacherDto } from "../model/types";

const alive = { deletedAt: null };

const teacherSelect = {
    id: true,
    fullName: true,
    phone: true,
    _count: {
        select: {
            mainGroups: { where: alive },
            masterGroups: { where: alive },
            curatedStudents: { where: alive },
        },
    },
    groups: {
        where: alive,
        orderBy: [{ contractDate: "desc" }, { id: "desc" }],
        select: {
            id: true,
            contractNumber: true,
            contractDate: true,
            serviceStartDate: true,
            serviceEndDate: true,
            contractStartDate: true,
            contractEndDate: true,
            amount: true,
            group: { select: { id: true, name: true } },
            payments: {
                where: alive,
                orderBy: [{ paidAt: "desc" }, { id: "desc" }],
                select: { id: true, paidAt: true, actNumber: true, amount: true },
            },
        },
    },
} satisfies Prisma.TeacherSelect;

/** Преподаватель со всеми контрактами и выплатами; null, если его нет или он удалён */
export async function getTeacher(id: string): Promise<TeacherDto | null> {
    const t = await db.teacher.findFirst({ where: { id, deletedAt: null }, select: teacherSelect });
    if (!t) return null;

    return {
        id: t.id,
        fullName: t.fullName,
        phone: t.phone,
        asTeacher: t._count.mainGroups,
        asMaster: t._count.masterGroups,
        curatedStudents: t._count.curatedStudents,
        contracts: t.groups.map((c) => ({
            id: c.id,
            contractNumber: c.contractNumber,
            contractDate: toIsoDate(c.contractDate),
            group: c.group,
            serviceStartDate: toIsoDate(c.serviceStartDate),
            serviceEndDate: toIsoDate(c.serviceEndDate),
            contractStartDate: toIsoDate(c.contractStartDate),
            contractEndDate: toIsoDate(c.contractEndDate),
            amount: c.amount,
            paid: c.payments.reduce((sum, p) => sum + p.amount, 0),
            payments: c.payments.map((p) => ({
                id: p.id,
                paidAt: toIsoDate(p.paidAt),
                actNumber: p.actNumber,
                amount: p.amount,
            })),
        })),
    };
}
