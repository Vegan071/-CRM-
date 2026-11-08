import { containsCI } from "@/shared/lib/query";
import type { Prisma } from "~/prisma/generated/prisma/client";

/** Условие «не удалено» для связанных записей (группы, студенты, контракты) */
export const alive = { deletedAt: null };

/** Фильтры: role ("teacher" | "master" | "curator"), contract ("with" | "without"); поиск — по ФИО и телефону */
export function buildTeacherWhere(
    search: string,
    { role, contract }: Record<string, string | undefined> = {},
): Prisma.TeacherWhereInput {
    return {
        deletedAt: null,
        ...(search && { OR: [{ fullName: containsCI(search) }, { phone: containsCI(search) }] }),
        ...(role === "teacher" && { mainGroups: { some: alive } }),
        ...(role === "master" && { masterGroups: { some: alive } }),
        ...(role === "curator" && { curatedStudents: { some: alive } }),
        ...(contract === "with" && { groups: { some: alive } }),
        ...(contract === "without" && { groups: { none: alive } }),
    };
}
