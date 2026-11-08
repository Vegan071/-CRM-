"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/shared/api/db";
import { requireUser } from "@/shared/api/session";
import { logAction } from "@/shared/api/audit";
import { fail, isUniqueViolation, ok } from "@/shared/api/action-utils";
import { encrypt } from "@/shared/lib/crypto";
import type { ActionResult } from "@/shared/lib/pagination";
import { checkStudentRefs } from "@/entities/student/api/check-refs";
import { prepareStudent } from "@/entities/student/lib/prepare-student";
import { studentSchema } from "@/entities/student/model/schema";
import { createEnrollment } from "@/entities/enrollment/api/create-enrollment";
import { revalidateGroup } from "@/entities/group/api/revalidate";

/**
 * Создаёт студента. Если передан groupId — в той же транзакции зачисляет его в эту учебную группу
 * (стоимость по умолчанию — цена группы за слушателя), так что он сразу виден и в группе, и в общем списке.
 */
export async function createStudent(
    input: unknown,
    groupId?: string,
): Promise<ActionResult<{ id: string; fullName: string }>> {
    const user = await requireUser();

    const parsed = studentSchema.safeParse(input);
    if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "Некорректные данные");
    const v = parsed.data;
    const { fullName, birthDate, data } = prepareStudent(v);

    const trainingGroup = groupId
        ? await db.group.findFirst({ where: { id: groupId, deletedAt: null }, select: { id: true, price: true } })
        : null;
    if (groupId && !trainingGroup) return fail("Учебная группа не найдена");

    const refsError = await checkStudentRefs({
        fullName,
        birthDate,
        collegeGroupId: v.collegeGroupId,
        curatorId: v.curatorId,
    });
    if (refsError) return fail(refsError);

    try {
        const student = await db.$transaction(async (tx) => {
            const created = await tx.student.create({
                data: { ...data, snilsEnc: encrypt(v.snils) },
                select: { id: true, fullName: true },
            });
            // СНИЛС в журнал не пишем
            await logAction(user.id, "Student", created.id, "CREATE", { fullName }, tx);
            if (trainingGroup) await createEnrollment(tx, user.id, created.id, trainingGroup);
            return created;
        });
        revalidatePath("/students");
        if (trainingGroup) revalidateGroup(trainingGroup.id);
        return ok(student);
    } catch (e) {
        if (isUniqueViolation(e)) return fail("Студент с таким ФИО и датой рождения уже существует");
        console.error("createStudent failed", e);
        return fail("Не удалось создать студента");
    }
}
