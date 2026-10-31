"use server";

import { db } from "@/shared/api/db";
import { requireUser } from "@/shared/api/session";
import type { Page, PageParams } from "@/shared/lib/pagination";
import type { GroupRow } from "../model/types";

type GroupWhere = NonNullable<Parameters<typeof db.group.count>[0]>["where"];

const iso = (d: Date | null) => (d ? d.toISOString().slice(0, 10) : null);

export async function fetchGroups({ cursor, limit, search, filters = {} }: PageParams): Promise<Page<GroupRow>> {
    await requireUser();

    const today = new Date(new Date().toISOString().slice(0, 10));
    const { status, teacherId } = filters;

    const where: GroupWhere = {
        deletedAt: null,
        ...(search && { name: { contains: search, mode: "insensitive" } }),
        ...(teacherId && { teacherId }),
        ...(status === "active" && { startDate: { lte: today }, endDate: { gte: today } }),
        ...(status === "upcoming" && { startDate: { gt: today } }),
        ...(status === "finished" && { endDate: { lt: today } }),
    };

    const [rows, total] = await Promise.all([
        db.group.findMany({
            where,
            orderBy: [{ createdAt: "desc" }, { id: "desc" }],
            take: limit + 1,
            ...(cursor && { cursor: { id: cursor }, skip: 1 }),
            select: {
                id: true,
                name: true,
                startDate: true,
                endDate: true,
                teacher: { select: { fullName: true } },
                _count: { select: { enrollments: { where: { deletedAt: null } } } },
            },
        }),
        cursor ? undefined : db.group.count({ where }),
    ]);

    const hasMore = rows.length > limit;
    const items: GroupRow[] = rows.slice(0, limit).map((g) => ({
        id: g.id,
        name: g.name,
        startDate: iso(g.startDate),
        endDate: iso(g.endDate),
        teacherName: g.teacher?.fullName ?? null,
        listeners: g._count.enrollments,
    }));

    return { items, total, nextCursor: hasMore ? items[items.length - 1].id : null };
}