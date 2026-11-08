import { containsCI } from "@/shared/lib/query";
import type { Prisma } from "~/prisma/generated/prisma/client";

/** Фильтры: status ("active" | "upcoming" | "finished"), teacherId; поиск — по названию */
export function buildGroupWhere(
    search: string,
    { status, teacherId }: Record<string, string | undefined> = {},
): Prisma.GroupWhereInput {
    const today = new Date(new Date().toISOString().slice(0, 10));
    return {
        deletedAt: null,
        ...(search && { name: containsCI(search) }),
        ...(teacherId && { teacherId }),
        ...(status === "active" && { startDate: { lte: today }, endDate: { gte: today } }),
        ...(status === "upcoming" && { startDate: { gt: today } }),
        ...(status === "finished" && { endDate: { lt: today } }),
    };
}
