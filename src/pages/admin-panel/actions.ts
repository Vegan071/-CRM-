"use server";

import { db } from "@/shared/api/db";
import { requireAdmin } from "@/shared/api/session";
import { normalizeName } from "@/shared/lib/normalize";
import type { ActionResult, Page, PageParams } from "@/shared/lib/pagination";
import {
    createGroupSchema,
    createTeacherSchema,
    pageParamsSchema,
} from "@/shared/lib/schemas/admin";
import {
    groupExists,
    listGroupsPage,
    listTeachersPage,
    teacherExists,
    type GroupItem,
    type TeacherItem,
} from "./queries";

const ok = <T>(data: T): ActionResult<T> => ({ ok: true, data });
const fail = (error: string): ActionResult<never> => ({ ok: false, error });

const isUniqueViolation = (e: unknown) =>
    typeof e === "object" && e !== null && "code" in e && (e as { code: unknown }).code === "P2002";

export async function createGroup(input: unknown): Promise<ActionResult<GroupItem>> {
    const user = await requireAdmin();

    const parsed = createGroupSchema.safeParse(input);
    if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "Некорректные данные");
    const name = normalizeName(parsed.data.name);

    if (await groupExists(name)) return fail("Группа с таким номером уже существует");

    try {
        const group = await db.$transaction(async (tx) => {
            const created = await tx.collegeGroup.create({
                data: { name },
                select: { id: true, name: true },
            });
            await tx.auditLog.create({
                data: {
                    userId: user.id,
                    entity: "CollegeGroup",
                    entityId: created.id,
                    action: "CREATE",
                    diff: { name },
                },
            });
            return created;
        });
        return ok(group);
    } catch (e) {
        if (isUniqueViolation(e)) return fail("Группа с таким номером уже существует");
        console.error("createGroup failed", e);
        return fail("Не удалось создать группу");
    }
}

export async function createTeacher(input: unknown): Promise<ActionResult<TeacherItem>> {
    const user = await requireAdmin();

    const parsed = createTeacherSchema.safeParse(input);
    if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "Некорректные данные");
    const fullName = normalizeName(parsed.data.fullName);

    if (await teacherExists(fullName)) return fail("Преподаватель с таким ФИО уже существует");

    try {
        const teacher = await db.$transaction(async (tx) => {
            const created = await tx.teacher.create({
                data: { fullName },
                select: { id: true, fullName: true },
            });
            await tx.auditLog.create({
                data: {
                    userId: user.id,
                    entity: "Teacher",
                    entityId: created.id,
                    action: "CREATE",
                    diff: { fullName },
                },
            });
            return created;
        });
        return ok(teacher);
    } catch (e) {
        if (isUniqueViolation(e)) return fail("Преподаватель с таким ФИО уже существует");
        console.error("createTeacher failed", e);
        return fail("Не удалось добавить преподавателя");
    }
}

// ── проверка «уже существует» (для подсказки в форме) ──

export async function checkGroupExists(name: string): Promise<boolean> {
    await requireAdmin();
    return groupExists(name);
}

export async function checkTeacherExists(fullName: string): Promise<boolean> {
    await requireAdmin();
    return teacherExists(fullName);
}

// ── страницы списков (для useInfiniteList) ──

export async function listGroups(params: PageParams): Promise<Page<GroupItem>> {
    await requireAdmin();
    return listGroupsPage(pageParamsSchema.parse(params));
}

export async function listTeachers(params: PageParams): Promise<Page<TeacherItem>> {
    await requireAdmin();
    return listTeachersPage(pageParamsSchema.parse(params));
}