"use server";

import { db } from "@/shared/api/db";
import { requireUser } from "@/shared/api/session";
import { toIsoDate } from "@/shared/lib/date";
import { mapPage, toPage, type Page, type PageParams } from "@/shared/lib/pagination";
import { cursorArgs } from "@/shared/lib/query";
import { pageParamsSchema } from "@/shared/lib/schemas/admin";
import type { GroupRow } from "@/entities/group/model/types";
import type { Prisma } from "~/prisma/generated/prisma/client";
import { buildGroupWhere } from "./where";

const groupRowSelect = {
    id: true,
    name: true,
    startDate: true,
    endDate: true,
    teacher: { select: { fullName: true } },
    _count: { select: { enrollments: { where: { deletedAt: null } } } },
} satisfies Prisma.GroupSelect;

const toGroupRow = (g: Prisma.GroupGetPayload<{ select: typeof groupRowSelect }>): GroupRow => ({
    id: g.id,
    name: g.name,
    startDate: toIsoDate(g.startDate),
    endDate: toIsoDate(g.endDate),
    teacherName: g.teacher?.fullName ?? null,
    listeners: g._count.enrollments,
});

/** Список учебных групп (подгрузка при прокрутке) */
export async function fetchGroups(params: PageParams): Promise<Page<GroupRow>> {
    await requireUser();
    const { cursor, limit, search, filters } = pageParamsSchema.parse(params);
    const where = buildGroupWhere(search, filters);

    const [rows, total] = await Promise.all([
        db.group.findMany({
            where,
            orderBy: [{ createdAt: "desc" }, { id: "desc" }],
            ...cursorArgs(cursor, limit),
            select: groupRowSelect,
        }),
        cursor ? undefined : db.group.count({ where }),
    ]);

    return mapPage(toPage(rows, limit, total), toGroupRow);
}
