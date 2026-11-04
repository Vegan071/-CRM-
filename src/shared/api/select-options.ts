import "server-only";
import { db } from "./db";
import { requireUser } from "./session";

export type SelectOption = { id: string; name: string };

/** Все неудалённые преподаватели для выпадающих фильтров */
export async function listTeacherOptions(): Promise<SelectOption[]> {
    await requireUser();
    const rows = await db.teacher.findMany({
        where: { deletedAt: null },
        orderBy: [{ fullName: "asc" }, { id: "asc" }],
        select: { id: true, fullName: true },
    });
    return rows.map((t) => ({ id: t.id, name: t.fullName }));
}

/** Все неудалённые группы студентов (колледж) для выпадающих фильтров */
export async function listCollegeGroupOptions(): Promise<SelectOption[]> {
    await requireUser();
    const rows = await db.collegeGroup.findMany({
        where: { deletedAt: null },
        orderBy: [{ name: "asc" }, { id: "asc" }],
        select: { id: true, name: true },
    });
    return rows.map((g) => ({ id: g.id, name: g.name }));
}
