"use server";

import { db } from "@/shared/api/db";
import { requireUser } from "@/shared/api/session";
import { toPage, type Page, type PageParams } from "@/shared/lib/pagination";
import { pageParamsSchema } from "@/shared/lib/schemas/admin";
import { containsCI, cursorArgs } from "@/shared/lib/query";

export type OptionItem = { id: string; value: string; label: string };

const toOption = (id: string, label: string): OptionItem => ({ id, value: id, label });

export async function searchTeachers(params: PageParams): Promise<Page<OptionItem>> {
    await requireUser();
    const { cursor, limit, search } = pageParamsSchema.parse(params);
    const rows = await db.teacher.findMany({
        where: { deletedAt: null, ...(search ? { fullName: containsCI(search) } : {}) },
        select: { id: true, fullName: true },
        orderBy: [{ fullName: "asc" }, { id: "asc" }],
        ...cursorArgs(cursor, limit),
    });
    return toPage(rows.map((r) => toOption(r.id, r.fullName)), limit);
}

export async function searchStudents(params: PageParams): Promise<Page<OptionItem>> {
    await requireUser();
    const { cursor, limit, search } = pageParamsSchema.parse(params);
    const rows = await db.student.findMany({
        where: { deletedAt: null, ...(search ? { fullName: containsCI(search) } : {}) },
        select: { id: true, fullName: true },
        orderBy: [{ fullName: "asc" }, { id: "asc" }],
        ...cursorArgs(cursor, limit),
    });
    return toPage(rows.map((r) => toOption(r.id, r.fullName)), limit);
}

// учебные группы (курсы со слушателями)
export async function searchGroups(params: PageParams): Promise<Page<OptionItem>> {
    await requireUser();
    const { cursor, limit, search } = pageParamsSchema.parse(params);
    const rows = await db.group.findMany({
        where: { deletedAt: null, ...(search ? { name: containsCI(search) } : {}) },
        select: { id: true, name: true },
        orderBy: [{ name: "asc" }, { id: "asc" }],
        ...cursorArgs(cursor, limit),
    });
    return toPage(rows.map((r) => toOption(r.id, r.name)), limit);
}

export async function searchCollegeGroups(params: PageParams): Promise<Page<OptionItem>> {
    await requireUser();
    const { cursor, limit, search } = pageParamsSchema.parse(params);
    const rows = await db.collegeGroup.findMany({
        where: { deletedAt: null, ...(search ? { name: containsCI(search) } : {}) },
        select: { id: true, name: true },
        orderBy: [{ name: "asc" }, { id: "asc" }],
        ...cursorArgs(cursor, limit),
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
            ...(search ? { fullName: containsCI(search) } : {}),
        },
        select: { id: true, fullName: true, collegeGroup: { select: { name: true } } },
        orderBy: [{ fullName: "asc" }, { id: "asc" }],
        ...cursorArgs(cursor, limit),
    });
    return toPage(
        rows.map((r) => toOption(r.id, r.collegeGroup ? `${r.fullName} · ${r.collegeGroup.name}` : r.fullName)),
        limit,
    );
}