"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/shared/api/db";
import { requireUser } from "@/shared/api/session";
import { fail, INT32_MAX, isUniqueViolation, ok, toDate } from "@/shared/api/action-utils";
import { encrypt } from "@/shared/lib/crypto";
import { toKopecks } from "@/shared/lib/money";
import { normalizeName } from "@/shared/lib/normalize";
import type { ActionResult, Page, PageParams } from "@/shared/lib/pagination";
import { pageParamsSchema } from "@/shared/lib/schemas/admin";
import { listenerEditSchema } from "../model/schema";
import type { GroupRow } from "../model/types";

type GroupWhere = NonNullable<Parameters<typeof db.group.count>[0]>["where"];

const iso = (d: Date | null) => (d ? d.toISOString().slice(0, 10) : null);
const idSchema = z.string().min(1).max(64);

const revalidateGroup = (groupId: string) => {
    revalidatePath(`/groups/${groupId}`);
    revalidatePath("/");
};

// ───────── Список групп (подгрузка при прокрутке) ─────────

export async function fetchGroups(params: PageParams): Promise<Page<GroupRow>> {
    await requireUser();
    const { cursor, limit, search, filters = {} } = pageParamsSchema.parse(params);

    const today = new Date(new Date().toISOString().slice(0, 10));
    const { status, teacherId } = filters;

    const where: GroupWhere = {
        deletedAt: null,
        ...(search && { name: { contains: search, mode: "insensitive" } }),
        ...(teacherId && { teacherId }),
        ...(status === "active" && { startDate: { lte: today }, endDate: { gte: today } }),
        ...(status === "upcoming" && { startDate: { gt: today } }),
        ...(status === "finished" && { endDate: { lt: today } }),
    };

    const [rows, total] = await Promise.all([
        db.group.findMany({
            where,
            orderBy: [{ createdAt: "desc" }, { id: "desc" }],
            take: limit + 1,
            ...(cursor && { cursor: { id: cursor }, skip: 1 }),
            select: {
                id: true,
                name: true,
                startDate: true,
                endDate: true,
                teacher: { select: { fullName: true } },
                _count: { select: { enrollments: { where: { deletedAt: null } } } },
            },
        }),
        cursor ? undefined : db.group.count({ where }),
    ]);

    const hasMore = rows.length > limit;
    const items: GroupRow[] = rows.slice(0, limit).map((g) => ({
        id: g.id,
        name: g.name,
        startDate: iso(g.startDate),
        endDate: iso(g.endDate),
        teacherName: g.teacher?.fullName ?? null,
        listeners: g._count.enrollments,
    }));

    return { items, total, nextCursor: hasMore ? items[items.length - 1].id : null };
}

// ───────── Слушатели группы ─────────

const addSchema = z.object({ groupId: idSchema, studentId: idSchema });

/** Зачисляет студента в группу; стоимость по умолчанию — цена группы за слушателя */
export async function addListener(input: unknown): Promise<ActionResult<{ id: string }>> {
    const user = await requireUser();

    const parsed = addSchema.safeParse(input);
    if (!parsed.success) return fail("Некорректные данные");
    const { groupId, studentId } = parsed.data;

    const [group, student, existing] = await Promise.all([
        db.group.findFirst({ where: { id: groupId, deletedAt: null }, select: { id: true, price: true } }),
        db.student.findFirst({ where: { id: studentId, deletedAt: null }, select: { id: true } }),
        db.enrollment.findFirst({ where: { groupId, studentId, deletedAt: null }, select: { id: true } }),
    ]);
    if (!group) return fail("Группа не найдена");
    if (!student) return fail("Студент не найден");
    if (existing) return fail("Этот слушатель уже в группе");

    try {
        const created = await db.$transaction(async (tx) => {
            const row = await tx.enrollment.create({
                data: { groupId, studentId, price: group.price ?? 0 },
                select: { id: true },
            });
            await tx.auditLog.create({
                data: {
                    userId: user.id,
                    entity: "Enrollment",
                    entityId: row.id,
                    action: "CREATE",
                    diff: { groupId, studentId },
                },
            });
            return row;
        });
        revalidateGroup(groupId);
        return ok(created);
    } catch (e) {
        if (isUniqueViolation(e)) return fail("Этот слушатель уже в группе");
        console.error("addListener failed", e);
        return fail("Не удалось добавить слушателя");
    }
}

/** Убирает слушателя из группы (мягкое удаление зачисления) */
export async function removeListener(enrollmentId: string): Promise<ActionResult<null>> {
    const user = await requireUser();
    if (!idSchema.safeParse(enrollmentId).success) return fail("Некорректные данные");

    const enrollment = await db.enrollment.findFirst({
        where: { id: enrollmentId, deletedAt: null },
        select: { id: true, groupId: true, studentId: true },
    });
    if (!enrollment) return fail("Зачисление не найдено");

    try {
        await db.$transaction(async (tx) => {
            await tx.enrollment.update({ where: { id: enrollment.id }, data: { deletedAt: new Date() } });
            await tx.auditLog.create({
                data: {
                    userId: user.id,
                    entity: "Enrollment",
                    entityId: enrollment.id,
                    action: "DELETE",
                    diff: { groupId: enrollment.groupId, studentId: enrollment.studentId },
                },
            });
        });
        revalidateGroup(enrollment.groupId);
        return ok(null);
    } catch (e) {
        console.error("removeListener failed", e);
        return fail("Не удалось удалить слушателя из группы");
    }
}

/**
 * Быстрая отметка оплаты.
 * paid = true  — добавляет платёж на остаток до полной стоимости;
 * paid = false — снимает (мягко удаляет) все платежи.
 */
export async function setListenerPaid(enrollmentId: string, paid: boolean): Promise<ActionResult<null>> {
    const user = await requireUser();
    if (!idSchema.safeParse(enrollmentId).success || typeof paid !== "boolean") return fail("Некорректные данные");

    const enrollment = await db.enrollment.findFirst({
        where: { id: enrollmentId, deletedAt: null },
        select: {
            id: true,
            groupId: true,
            price: true,
            payments: { where: { deletedAt: null }, select: { id: true, amount: true } },
        },
    });
    if (!enrollment) return fail("Зачисление не найдено");

    if (paid && enrollment.price <= 0) return fail("Сначала укажите стоимость больше 0");
    const alreadyPaid = enrollment.payments.reduce((sum, p) => sum + p.amount, 0);

    try {
        await db.$transaction(async (tx) => {
            if (paid) {
                const rest = enrollment.price - alreadyPaid;
                if (rest <= 0) return;
                const payment = await tx.payment.create({
                    data: {
                        enrollmentId: enrollment.id,
                        paidAt: toDate(new Date().toISOString().slice(0, 10)),
                        amount: rest,
                        note: "Отмечено как оплачено",
                    },
                    select: { id: true },
                });
                await tx.auditLog.create({
                    data: {
                        userId: user.id,
                        entity: "Payment",
                        entityId: payment.id,
                        action: "CREATE",
                        diff: { enrollmentId: enrollment.id, amount: rest },
                    },
                });
            } else {
                if (enrollment.payments.length === 0) return;
                await tx.payment.updateMany({
                    where: { enrollmentId: enrollment.id, deletedAt: null },
                    data: { deletedAt: new Date() },
                });
                await tx.auditLog.create({
                    data: {
                        userId: user.id,
                        entity: "Enrollment",
                        entityId: enrollment.id,
                        action: "UPDATE",
                        diff: { paymentsCleared: enrollment.payments.length, amount: alreadyPaid },
                    },
                });
            }
        });
    } catch (e) {
        console.error("setListenerPaid failed", e);
        return fail("Не удалось изменить оплату");
    }

    revalidateGroup(enrollment.groupId);
    return ok(null);
}

/** Редактирование данных слушателя (студента) и его зачисления (договор, оплата) */
export async function updateListener(enrollmentId: string, input: unknown): Promise<ActionResult<null>> {
    const user = await requireUser();
    if (!idSchema.safeParse(enrollmentId).success) return fail("Некорректные данные");

    const parsed = listenerEditSchema.safeParse(input);
    if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "Некорректные данные");
    const v = parsed.data;

    const price = toKopecks(v.price);
    if (price > INT32_MAX) return fail("Слишком большая сумма");

    const enrollment = await db.enrollment.findFirst({
        where: { id: enrollmentId, deletedAt: null },
        select: { id: true, groupId: true, studentId: true },
    });
    if (!enrollment) return fail("Зачисление не найдено");

    const fullName = normalizeName(v.fullName);
    const birthDate = toDate(v.birthDate);

    const [duplicate, collegeGroup, curator] = await Promise.all([
        db.student.findFirst({
            where: {
                deletedAt: null,
                id: { not: enrollment.studentId },
                fullName: { equals: fullName, mode: "insensitive" },
                birthDate,
            },
            select: { id: true },
        }),
        v.collegeGroupId
            ? db.collegeGroup.findFirst({ where: { id: v.collegeGroupId, deletedAt: null }, select: { id: true } })
            : true,
        v.curatorId
            ? db.teacher.findFirst({ where: { id: v.curatorId, deletedAt: null }, select: { id: true } })
            : true,
    ]);
    if (duplicate) return fail("Студент с таким ФИО и датой рождения уже существует");
    if (!collegeGroup) return fail("Группа студента не найдена");
    if (!curator) return fail("Куратор не найден");

    try {
        await db.$transaction(async (tx) => {
            await tx.student.update({
                where: { id: enrollment.studentId },
                data: {
                    fullName,
                    phone: v.phone,
                    birthDate,
                    gender: v.gender,
                    // СНИЛС — произвольная строка, без проверки формата; пустое значение не сохраняем
                    snilsEnc: v.snils ? encrypt(v.snils) : null,
                    collegeGroupId: v.collegeGroupId,
                    curatorId: v.curatorId,
                    isDpkStudent: v.isDpkStudent,
                    medCertNumber: v.medCertNumber,
                    medInstitution: v.medInstitution,
                },
            });
            await tx.enrollment.update({
                where: { id: enrollment.id },
                data: { payMethod: v.payMethod, contractNumber: v.contractNumber, price },
            });
            await tx.auditLog.create({
                data: {
                    userId: user.id,
                    entity: "Student",
                    entityId: enrollment.studentId,
                    action: "UPDATE",
                    diff: { fullName }, // СНИЛС в журнал не пишем
                },
            });
            await tx.auditLog.create({
                data: {
                    userId: user.id,
                    entity: "Enrollment",
                    entityId: enrollment.id,
                    action: "UPDATE",
                    diff: { payMethod: v.payMethod, contractNumber: v.contractNumber, price },
                },
            });
        });
        revalidateGroup(enrollment.groupId);
        return ok(null);
    } catch (e) {
        if (isUniqueViolation(e)) return fail("Студент с таким ФИО и датой рождения уже существует");
        console.error("updateListener failed", e);
        return fail("Не удалось сохранить изменения");
    }
}
