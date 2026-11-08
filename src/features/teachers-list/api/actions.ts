"use server";

import { db } from "@/shared/api/db";
import { requireUser } from "@/shared/api/session";
import { mapPage, toPage, type Page, type PageParams } from "@/shared/lib/pagination";
import { cursorArgs } from "@/shared/lib/query";
import { pageParamsSchema } from "@/shared/lib/schemas/admin";
import type { Prisma } from "~/prisma/generated/prisma/client";
import type { TeacherRow } from "../model/types";
import { activeContract, alive, buildTeacherWhere, startOfToday } from "./where";

// функция, а не константа: «сегодня» должно считаться на каждый запрос, а не при старте сервера
const teacherRowSelect = (today: Date) =>
    ({
        id: true,
        fullName: true,
        phone: true,
        _count: {
            select: {
                mainGroups: { where: alive },
                masterGroups: { where: alive },
                curatedStudents: { where: alive },
                groups: { where: activeContract(today) },
            },
        },
    }) satisfies Prisma.TeacherSelect;

const toTeacherRow = (t: Prisma.TeacherGetPayload<{ select: ReturnType<typeof teacherRowSelect> }>): TeacherRow => ({
    id: t.id,
    fullName: t.fullName,
    phone: t.phone,
    asTeacher: t._count.mainGroups,
    asMaster: t._count.masterGroups,
    curatedStudents: t._count.curatedStudents,
    contracts: t._count.groups,
});

export async function fetchTeachers(params: PageParams): Promise<Page<TeacherRow>> {
    await requireUser();
    const { cursor, limit, search, filters } = pageParamsSchema.parse(params);
    const where = buildTeacherWhere(search, filters);

    const [rows, total] = await Promise.all([
        db.teacher.findMany({
            where,
            orderBy: [{ createdAt: "desc" }, { id: "desc" }],
            ...cursorArgs(cursor, limit),
            select: teacherRowSelect(startOfToday()),
        }),
        cursor ? undefined : db.teacher.count({ where }),
    ]);

    return mapPage(toPage(rows, limit, total), toTeacherRow);
}
