"use server";

import { db } from "@/shared/api/db";
import { requireUser } from "@/shared/api/session";
import { mapPage, toPage, type Page, type PageParams } from "@/shared/lib/pagination";
import { cursorArgs } from "@/shared/lib/query";
import { pageParamsSchema } from "@/shared/lib/schemas/admin";
import type { Prisma } from "~/prisma/generated/prisma/client";
import type { TeacherRow } from "../model/types";
import { alive, buildTeacherWhere } from "./where";

const teacherRowSelect = {
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
} satisfies Prisma.TeacherSelect;

const toTeacherRow = (t: Prisma.TeacherGetPayload<{ select: typeof teacherRowSelect }>): TeacherRow => ({
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
            select: teacherRowSelect,
        }),
        cursor ? undefined : db.teacher.count({ where }),
    ]);

    return mapPage(toPage(rows, limit, total), toTeacherRow);
}
