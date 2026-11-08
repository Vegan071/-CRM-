import { containsCI } from "@/shared/lib/query";
import type { Prisma } from "~/prisma/generated/prisma/client";

/** Фильтры: collegeGroupId, curatorId, dpk ("yes" | "no"); поиск — по ФИО и телефону */
export function buildStudentWhere(
    search: string,
    { collegeGroupId, curatorId, dpk }: Record<string, string | undefined> = {},
): Prisma.StudentWhereInput {
    return {
        deletedAt: null,
        ...(search && { OR: [{ fullName: containsCI(search) }, { phone: containsCI(search) }] }),
        ...(collegeGroupId && { collegeGroupId }),
        ...(curatorId && { curatorId }),
        ...(dpk === "yes" && { isDpkStudent: true }),
        ...(dpk === "no" && { isDpkStudent: false }),
    };
}
