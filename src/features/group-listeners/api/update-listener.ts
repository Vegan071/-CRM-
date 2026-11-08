"use server";

import { db } from "@/shared/api/db";
import { requireUser } from "@/shared/api/session";
import { logAction } from "@/shared/api/audit";
import { fail, isUniqueViolation, ok } from "@/shared/api/action-utils";
import { encrypt } from "@/shared/lib/crypto";
import type { ActionResult } from "@/shared/lib/pagination";
import { checkStudentRefs } from "@/entities/student/api/check-refs";
import { prepareStudent } from "@/entities/student/lib/prepare-student";
import { revalidateGroup } from "@/entities/group/api/revalidate";
import { listenerEditSchema } from "../model/schema";
import { idSchema } from "./id-schema";

/** Редактирование данных слушателя (студента) и его зачисления (договор, способ оплаты) */
export async function updateListener(enrollmentId: string, input: unknown): Promise<ActionResult<null>> {
    const user = await requireUser();
    if (!idSchema.safeParse(enrollmentId).success) return fail("Некорректные данные");

    const parsed = listenerEditSchema.safeParse(input);
    if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "Некорректные данные");
    const v = parsed.data;

    const enrollment = await db.enrollment.findFirst({
        where: { id: enrollmentId, deletedAt: null },
        select: { id: true, groupId: true, studentId: true },
    });
    if (!enrollment) return fail("Зачисление не найдено");

    const { fullName, birthDate, data } = prepareStudent(v);
    const refsError = await checkStudentRefs(
        { fullName, birthDate, collegeGroupId: v.collegeGroupId, curatorId: v.curatorId },
        enrollment.studentId,
    );
    if (refsError) return fail(refsError);

    try {
        await db.$transaction(async (tx) => {
            await tx.student.update({
                where: { id: enrollment.studentId },
                data: {
                    ...data,
                    // СНИЛС — произвольная строка, без проверки формата; пустое значение не сохраняем
                    snilsEnc: v.snils ? encrypt(v.snils) : null,
                },
            });
            await tx.enrollment.update({
                where: { id: enrollment.id },
                data: { payMethod: v.payMethod, contractNumber: v.contractNumber },
            });
            // СНИЛС в журнал не пишем
            await logAction(user.id, "Student", enrollment.studentId, "UPDATE", { fullName }, tx);
            await logAction(
                user.id,
                "Enrollment",
                enrollment.id,
                "UPDATE",
                { payMethod: v.payMethod, contractNumber: v.contractNumber },
                tx,
            );
        });
        revalidateGroup(enrollment.groupId);
        return ok(null);
    } catch (e) {
        if (isUniqueViolation(e)) return fail("Студент с таким ФИО и датой рождения уже существует");
        console.error("updateListener failed", e);
        return fail("Не удалось сохранить изменения");
    }
}
