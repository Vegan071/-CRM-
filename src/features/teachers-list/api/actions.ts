"use server";

import { db } from "@/shared/api/db";
import { requireUser } from "@/shared/api/session";
import type { Page, PageParams } from "@/shared/lib/pagination";
import { pageParamsSchema } from "@/shared/lib/schemas/admin";
import type { TeacherRow } from "../model/types";

type TeacherWhere = NonNullable<Parameters<typeof db.teacher.count>[0]>["where"];

const alive = { deletedAt: null };

/** Фильтры: role ("teacher" | "master" | "curator"), contract ("with" | "without"); поиск — по ФИО и телефону */
export async function fetchTeachers(params: PageParams): Promise<Page<TeacherRow>> {
    await requireUser();
    const { cursor, limit, search, filters = {} } = pageParamsSchema.parse(params);
    const { role, contract } = filters;

    const contains = { contains: search, mode: "insensitive" as const };
    const where: TeacherWhere = {
        deletedAt: null,
        ...(search && { OR: [{ fullName: contains }, { phone: contains }] }),
        ...(role === "teacher" && { mainGroups: { some: alive } }),
        ...(role === "master" && { masterGroups: { some: alive } }),
        ...(role === "curator" && { curatedStudents: { some: alive } }),
        ...(contract === "with" && { groups: { some: alive } }),
        ...(contract === "without" && { groups: { none: alive } }),
    };

    const [rows, total] = await Promise.all([
        db.teacher.findMany({
            where,
            orderBy: [{ createdAt: "desc" }, { id: "desc" }],
            take: limit + 1,
            ...(cursor && { cursor: { id: cursor }, skip: 1 }),
            select: {
                id: true,
                fullName: true,
                phone: true,
                _count: {
                    select: {
                        mainGroups: { where: alive },
                        masterGroups: { where: alive },
                        curatedStudents: { where: alive },
                        groups: { where: alive },
                    },
                },
            },
        }),
        cursor ? undefined : db.teacher.count({ where }),
    ]);

    const hasMore = rows.length > limit;
    const items: TeacherRow[] = rows.slice(0, limit).map((t) => ({
        id: t.id,
        fullName: t.fullName,
        phone: t.phone,
        asTeacher: t._count.mainGroups,
        asMaster: t._count.masterGroups,
        curatedStudents: t._count.curatedStudents,
        contracts: t._count.groups,
    }));

    return { items, total, nextCursor: hasMore ? items[items.length - 1].id : null };
}
