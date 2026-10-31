    import { db } from "@/shared/api/db";
    import type { GroupRow, ListenerDto } from "../model/types";
    import {decrypt} from "@/shared/lib/crypto";
    import {Prisma} from "~/prisma/generated/prisma/client";

    const iso = (d: Date | null) => (d ? d.toISOString().slice(0, 10) : null);
    export type GroupStatus = "active" | "upcoming" | "finished";

    export type GroupFilters = {
        q?: string;
        status?: GroupStatus;
        teacherId?: string;
        page?: number;
        pageSize?: number;
    };
    export async function listGroupRows(): Promise<GroupRow[]> {
        const rows = await db.group.findMany({
            where: { deletedAt: null },
            orderBy: [{ createdAt: "desc" }, { id: "desc" }],
            select: {
                id: true,
                name: true,
                startDate: true,
                endDate: true,
                teacher: { select: { fullName: true } },
                _count: { select: { enrollments: { where: { deletedAt: null } } } },
            },
        });
        return rows.map((g) => ({
            id: g.id,
            name: g.name,
            startDate: iso(g.startDate),
            endDate: iso(g.endDate),
            teacherName: g.teacher?.fullName ?? null,
            listeners: g._count.enrollments,
        }));
    }

    export async function getGroupWithListeners(id: string) {
        const group = await db.group.findFirst({
            where: { id, deletedAt: null },
            select: { id: true, name: true, startDate: true, endDate: true },
        });
        if (!group) return null;

        const rows = await db.enrollment.findMany({
            where: { groupId: id, deletedAt: null, student: { deletedAt: null } },
            orderBy: [{ createdAt: "asc" }, { id: "asc" }],
            select: {
                id: true,
                createdAt: true,
                payMethod: true,
                contractNumber: true,
                price: true,
                payments: {
                    where: { deletedAt: null },
                    orderBy: { createdAt: "asc" },
                    select: { id: true, amount: true, createdAt: true },
                },
                student: {
                    select: {
                        id: true,
                        fullName: true,
                        phone: true,
                        birthDate: true,
                        gender: true,
                        snilsEnc: true,
                        isDpkStudent: true,
                        medCertNumber: true,
                        medInstitution: true,
                        collegeGroup: { select: { id: true, name: true } },
                        curator: { select: { id: true, fullName: true } },
                    },
                },
            },
        });

        const listeners: ListenerDto[] = rows.map((r, i) => ({
            enrollmentId: r.id,
            studentId: r.student.id,
            position: i + 1,
            fullName: r.student.fullName,
            phone: r.student.phone,
            birthDate: iso(r.student.birthDate),
            gender: r.student.gender,
            snils: r.student.snilsEnc ? decrypt(r.student.snilsEnc) : null,
            isDpkStudent: r.student.isDpkStudent,
            medCertNumber: r.student.medCertNumber,
            medInstitution: r.student.medInstitution,
            collegeGroup: r.student.collegeGroup,
            curator: r.student.curator,
            payMethod: r.payMethod,
            contractNumber: r.contractNumber,
            price: r.price,
            enrolledAt: iso(r.createdAt),
            payments: r.payments.map((p) => ({ id: p.id, amount: p.amount, date: iso(p.createdAt) })),
            paid: r.payments.reduce((sum, p) => sum + p.amount, 0),
        }));

        return {
            group: { id: group.id, name: group.name, startDate: iso(group.startDate), endDate: iso(group.endDate) },
            listeners,
        };
    }

    export async function listGroupsPage({
                                             q,
                                             status,
                                             teacherId,
                                             page = 1,
                                             pageSize = 20,
                                         }: GroupFilters) {
        // «сегодня» как дата без времени, в том же виде, что и iso()
        const today = new Date(new Date().toISOString().slice(0, 10));

        const where: Prisma.GroupWhereInput = {
            deletedAt: null,
            ...(q && { name: { contains: q, mode: "insensitive" } }),
            ...(teacherId && { teacherId }),
            ...(status === "active" && { startDate: { lte: today }, endDate: { gte: today } }),
            ...(status === "upcoming" && { startDate: { gt: today } }),
            ...(status === "finished" && { endDate: { lt: today } }),
        };

        const [items, total] = await Promise.all([
            db.group.findMany({
                where,
                orderBy: [{ createdAt: "desc" }, { id: "desc" }], // стабильный порядок для skip/take
                skip: (page - 1) * pageSize,
                take: pageSize,
                select: {
                    id: true,
                    name: true,
                    startDate: true,
                    endDate: true,
                    teacher: { select: { fullName: true } },
                    _count: { select: { enrollments: { where: { deletedAt: null } } } },
                },
            }),
            db.group.count({ where }),
        ]);

        const rows: GroupRow[] = items.map((g) => ({
            id: g.id,
            name: g.name,
            startDate: iso(g.startDate),
            endDate: iso(g.endDate),
            teacherName: g.teacher?.fullName ?? null,
            listeners: g._count.enrollments,
        }));

        return { rows, total, pages: Math.max(1, Math.ceil(total / pageSize)) };
    }

    export async function listTeacherOptions() {
        const teachers = await db.teacher.findMany({
            where: { deletedAt: null },
            orderBy: { fullName: "asc" },
            select: { id: true, fullName: true },
        });
        return teachers.map((t) => ({ id: t.id, name: t.fullName }));
    }