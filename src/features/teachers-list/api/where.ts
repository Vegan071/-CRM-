import { containsCI } from "@/shared/lib/query";
import type { Prisma } from "~/prisma/generated/prisma/client";

/** Условие «не удалено» для связанных записей (группы, студенты, контракты) */
export const alive = { deletedAt: null };

/** Сегодняшняя дата без времени (UTC) — в таком виде даты хранятся в БД */
export const startOfToday = () => new Date(new Date().toISOString().slice(0, 10));

/** Действующий контракт: не удалён и дата окончания не наступила (или не указана) */
export const activeContract = (today: Date): Prisma.GroupTeacherWhereInput => ({
    deletedAt: null,
    OR: [{ contractEndDate: null }, { contractEndDate: { gte: today } }],
});

/** Фильтры: role ("teacher" | "master" | "curator"), contract ("with" | "without" действующий контракт); поиск — по ФИО и телефону */
export function buildTeacherWhere(
    search: string,
    { role, contract }: Record<string, string | undefined> = {},
): Prisma.TeacherWhereInput {
    const active = activeContract(startOfToday());
    return {
        deletedAt: null,
        ...(search && { OR: [{ fullName: containsCI(search) }, { phone: containsCI(search) }] }),
        ...(role === "teacher" && { mainGroups: { some: alive } }),
        ...(role === "master" && { masterGroups: { some: alive } }),
        ...(role === "curator" && { curatedStudents: { some: alive } }),
        ...(contract === "with" && { groups: { some: active } }),
        ...(contract === "without" && { groups: { none: active } }),
    };
}
