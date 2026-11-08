import { db } from "@/shared/api/db";
import { toIsoDate } from "@/shared/lib/date";
import type { GroupDto } from "../model/types";

/** Учебная группа со всеми параметрами; null, если группы нет или она удалена */
export async function getGroup(id: string): Promise<GroupDto | null> {
    const group = await db.group.findFirst({
        where: { id, deletedAt: null },
        select: {
            id: true,
            name: true,
            startDate: true,
            endDate: true,
            status: true,
            listenersCount: true,
            collegeStudentsCount: true,
            discountCount: true,
            price: true,
            totalPrice: true,
            teacher: { select: { id: true, fullName: true } },
            master: { select: { id: true, fullName: true } },
        },
    });
    if (!group) return null;

    return {
        id: group.id,
        name: group.name,
        startDate: toIsoDate(group.startDate),
        endDate: toIsoDate(group.endDate),
        status: group.status,
        teacher: group.teacher,
        master: group.master,
        listenersCount: group.listenersCount,
        collegeStudentsCount: group.collegeStudentsCount,
        discountCount: group.discountCount,
        price: group.price,
        totalPrice: group.totalPrice,
    };
}
