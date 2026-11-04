    import { db } from "@/shared/api/db";
    import type { ListenerDto } from "../model/types";
    import {decrypt} from "@/shared/lib/crypto";

    // битая запись или неверный ключ не должны валить всю страницу группы
    function safeDecrypt(payload: string): string | null {
        try {
            return decrypt(payload);
        } catch (e) {
            console.error("decrypt failed", e);
            return null;
        }
    }

    const iso = (d: Date | null) => (d ? d.toISOString().slice(0, 10) : null);
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
                    orderBy: [{ paidAt: "asc" }, { createdAt: "asc" }],
                    select: { id: true, amount: true, paidAt: true },
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
            snils: r.student.snilsEnc ? safeDecrypt(r.student.snilsEnc) : null,
            isDpkStudent: r.student.isDpkStudent,
            medCertNumber: r.student.medCertNumber,
            medInstitution: r.student.medInstitution,
            collegeGroup: r.student.collegeGroup,
            curator: r.student.curator,
            payMethod: r.payMethod,
            contractNumber: r.contractNumber,
            price: r.price,
            enrolledAt: iso(r.createdAt),
            payments: r.payments.map((p) => ({ id: p.id, amount: p.amount, date: iso(p.paidAt) })),
            paid: r.payments.reduce((sum, p) => sum + p.amount, 0),
        }));

        return {
            group: { id: group.id, name: group.name, startDate: iso(group.startDate), endDate: iso(group.endDate) },
            listeners,
        };
    }

    export async function listTeacherOptions() {
        const teachers = await db.teacher.findMany({
            where: { deletedAt: null },
            orderBy: { fullName: "asc" },
            select: { id: true, fullName: true },
        });
        return teachers.map((t) => ({ id: t.id, name: t.fullName }));
    }