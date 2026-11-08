"use server";

import { db } from "@/shared/api/db";
import { requireUser } from "@/shared/api/session";
import { toIsoDate } from "@/shared/lib/date";
import { mapPage, toPage, type Page, type PageParams } from "@/shared/lib/pagination";
import { cursorArgs } from "@/shared/lib/query";
import { pageParamsSchema } from "@/shared/lib/schemas/admin";
import type { Prisma } from "~/prisma/generated/prisma/client";
import type { StudentRow } from "../model/types";
import { buildStudentWhere } from "./where";

const studentRowSelect = {
    id: true,
    fullName: true,
    birthDate: true,
    phone: true,
    isDpkStudent: true,
    collegeGroup: { select: { name: true } },
    curator: { select: { fullName: true } },
} satisfies Prisma.StudentSelect;

const toStudentRow = (s: Prisma.StudentGetPayload<{ select: typeof studentRowSelect }>): StudentRow => ({
    id: s.id,
    fullName: s.fullName,
    birthDate: toIsoDate(s.birthDate),
    phone: s.phone,
    isDpkStudent: s.isDpkStudent,
    collegeGroupName: s.collegeGroup?.name ?? null,
    curatorName: s.curator?.fullName ?? null,
});

export async function fetchStudents(params: PageParams): Promise<Page<StudentRow>> {
    await requireUser();
    const { cursor, limit, search, filters } = pageParamsSchema.parse(params);
    const where = buildStudentWhere(search, filters);

    const [rows, total] = await Promise.all([
        db.student.findMany({
            where,
            orderBy: [{ createdAt: "desc" }, { id: "desc" }],
            ...cursorArgs(cursor, limit),
            select: studentRowSelect,
        }),
        cursor ? undefined : db.student.count({ where }),
    ]);

    return mapPage(toPage(rows, limit, total), toStudentRow);
}
