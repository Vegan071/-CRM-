"use server";

import { db } from "@/shared/api/db";
import { requireUser } from "@/shared/api/session";
import { toPage, type Page, type PageParams } from "@/shared/lib/pagination";
import { pageParamsSchema } from "@/shared/lib/schemas/admin";

export type OptionItem = { id: string; value: string; label: string };

const toOption = (id: string, label: string): OptionItem => ({ id, value: id, label });
const contains = (search: string) => ({ contains: search, mode: "insensitive" as const });
const pageArgs = (cursor: string | null, limit: number) => ({
    take: limit + 1,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
});

export async function searchTeachers(params: PageParams): Promise<Page<OptionItem>> {
    await requireUser();
    const { cursor, limit, search } = pageParamsSchema.parse(params);
    const rows = await db.teacher.findMany({
        where: { deletedAt: null, ...(search ? { fullName: contains(search) } : {}) },
        select: { id: true, fullName: true },
        orderBy: [{ fullName: "asc" }, { id: "asc" }],
        ...pageArgs(cursor, limit),
    });
    return toPage(rows.map((r) => toOption(r.id, r.fullName)), limit);
}

export async function searchStudents(params: PageParams): Promise<Page<OptionItem>> {
    await requireUser();
    const { cursor, limit, search } = pageParamsSchema.parse(params);
    const rows = await db.student.findMany({
        where: { deletedAt: null, ...(search ? { fullName: contains(search) } : {}) },
        select: { id: true, fullName: true },
        orderBy: [{ fullName: "asc" }, { id: "asc" }],
        ...pageArgs(cursor, limit),
    });
    return toPage(rows.map((r) => toOption(r.id, r.fullName)), limit);
}

// учебные группы (курсы со слушателями)
export async function searchGroups(params: PageParams): Promise<Page<OptionItem>> {
    await requireUser();
    const { cursor, limit, search } = pageParamsSchema.parse(params);
    const rows = await db.group.findMany({
        where: { deletedAt: null, ...(search ? { name: contains(search) } : {}) },
        select: { id: true, name: true },
        orderBy: [{ name: "asc" }, { id: "asc" }],
        ...pageArgs(cursor, limit),
    });
    return toPage(rows.map((r) => toOption(r.id, r.name)), limit);
}

export async function searchCollegeGroups(params: PageParams): Promise<Page<OptionItem>> {
    await requireUser();
    const { cursor, limit, search } = pageParamsSchema.parse(params);
    const rows = await db.collegeGroup.findMany({
        where: { deletedAt: null, ...(search ? { name: contains(search) } : {}) },
        select: { id: true, name: true },
        orderBy: [{ name: "asc" }, { id: "asc" }],
        ...pageArgs(cursor, limit),
    });
    return toPage(rows.map((r) => toOption(r.id, r.name)), limit);
}

export async function searchStudentsForGroup(groupId: string, params: PageParams): Promise<Page<OptionItem>> {
    await requireUser();
    const { cursor, limit, search } = pageParamsSchema.parse(params);
    const rows = await db.student.findMany({
        where: {
            deletedAt: null,
            enrollments: { none: { groupId: String(groupId), deletedAt: null } },
            ...(search ? { fullName: contains(search) } : {}),
        },
        select: { id: true, fullName: true, collegeGroup: { select: { name: true } } },
        orderBy: [{ fullName: "asc" }, { id: "asc" }],
        ...pageArgs(cursor, limit),
    });
    return toPage(
        rows.map((r) => toOption(r.id, r.collegeGroup ? `${r.fullName} · ${r.collegeGroup.name}` : r.fullName)),
        limit,
    );
}