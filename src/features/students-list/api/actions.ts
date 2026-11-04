"use server";

import { db } from "@/shared/api/db";
import { requireUser } from "@/shared/api/session";
import type { Page, PageParams } from "@/shared/lib/pagination";
import { pageParamsSchema } from "@/shared/lib/schemas/admin";
import type { StudentRow } from "../model/types";

type StudentWhere = NonNullable<Parameters<typeof db.student.count>[0]>["where"];

const iso = (d: Date | null) => (d ? d.toISOString().slice(0, 10) : null);

/** Фильтры: collegeGroupId, curatorId, dpk ("yes" | "no"); поиск — по ФИО и телефону */
export async function fetchStudents(params: PageParams): Promise<Page<StudentRow>> {
    await requireUser();
    const { cursor, limit, search, filters = {} } = pageParamsSchema.parse(params);
    const { collegeGroupId, curatorId, dpk } = filters;

    const contains = { contains: search, mode: "insensitive" as const };
    const where: StudentWhere = {
        deletedAt: null,
        ...(search && { OR: [{ fullName: contains }, { phone: contains }] }),
        ...(collegeGroupId && { collegeGroupId }),
        ...(curatorId && { curatorId }),
        ...(dpk === "yes" && { isDpkStudent: true }),
        ...(dpk === "no" && { isDpkStudent: false }),
    };

    const [rows, total] = await Promise.all([
        db.student.findMany({
            where,
            orderBy: [{ createdAt: "desc" }, { id: "desc" }],
            take: limit + 1,
            ...(cursor && { cursor: { id: cursor }, skip: 1 }),
            select: {
                id: true,
                fullName: true,
                birthDate: true,
                phone: true,
                isDpkStudent: true,
                collegeGroup: { select: { name: true } },
                curator: { select: { fullName: true } },
            },
        }),
        cursor ? undefined : db.student.count({ where }),
    ]);

    const hasMore = rows.length > limit;
    const items: StudentRow[] = rows.slice(0, limit).map((s) => ({
        id: s.id,
        fullName: s.fullName,
        birthDate: iso(s.birthDate),
        phone: s.phone,
        isDpkStudent: s.isDpkStudent,
        collegeGroupName: s.collegeGroup?.name ?? null,
        curatorName: s.curator?.fullName ?? null,
    }));

    return { items, total, nextCursor: hasMore ? items[items.length - 1].id : null };
}
