import { db } from "@/shared/api/db";
import { normalizeName } from "@/shared/lib/normalize";
import { toPage, type Page, type PageParams } from "@/shared/lib/pagination";
import { cursorArgs } from "@/shared/lib/query";

export type GroupItem = { id: string; name: string };
export type TeacherItem = { id: string; fullName: string };

// Курсорная пагинация: стабильна при добавлении записей, в отличие от offset.
export async function listGroupsPage({ cursor, limit, search }: PageParams): Promise<Page<GroupItem>> {
    const where = {
        deletedAt: null,
        ...(search ? { name: { contains: search, mode: "insensitive" as const } } : {}),
    };

    const [rows, total] = await Promise.all([
        db.collegeGroup.findMany({
            where,
            select: { id: true, name: true },
            orderBy: [{ createdAt: "desc" }, { id: "desc" }],
            ...cursorArgs(cursor, limit),
        }),
        cursor ? undefined : db.collegeGroup.count({ where }),
    ]);

    return toPage(rows, limit, total);
}

export async function listTeachersPage({ cursor, limit, search }: PageParams): Promise<Page<TeacherItem>> {
    const where = {
        deletedAt: null,
        ...(search ? { fullName: { contains: search, mode: "insensitive" as const } } : {}),
    };

    const [rows, total] = await Promise.all([
        db.teacher.findMany({
            where,
            select: { id: true, fullName: true },
            orderBy: [{ createdAt: "desc" }, { id: "desc" }],
            ...cursorArgs(cursor, limit),
        }),
        cursor ? undefined : db.teacher.count({ where }),
    ]);

    return toPage(rows, limit, total);
}

export async function groupExists(name: string): Promise<boolean> {
    const normalized = normalizeName(name);
    if (!normalized) return false;
    const count = await db.collegeGroup.count({
        where: { deletedAt: null, name: { equals: normalized, mode: "insensitive" } },
    });
    return count > 0;
}

export async function teacherExists(fullName: string): Promise<boolean> {
    const normalized = normalizeName(fullName);
    if (!normalized) return false;
    const count = await db.teacher.count({
        where: { deletedAt: null, fullName: { equals: normalized, mode: "insensitive" } },
    });
    return count > 0;
}