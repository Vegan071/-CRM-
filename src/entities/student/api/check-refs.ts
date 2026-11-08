import { db } from "@/shared/api/db";

type StudentRefs = {
    fullName: string;
    birthDate: Date;
    collegeGroupId: string | null;
    curatorId: string | null;
};

/**
 * Проверки перед сохранением студента: нет ли дубля (ФИО + дата рождения), существуют ли
 * группа студента и куратор. При редактировании excludeStudentId исключает самого студента из поиска дублей.
 * Возвращает текст ошибки или null, если всё в порядке.
 */
export async function checkStudentRefs(
    { fullName, birthDate, collegeGroupId, curatorId }: StudentRefs,
    excludeStudentId?: string,
): Promise<string | null> {
    const [duplicate, collegeGroup, curator] = await Promise.all([
        db.student.findFirst({
            where: {
                deletedAt: null,
                ...(excludeStudentId && { id: { not: excludeStudentId } }),
                fullName: { equals: fullName, mode: "insensitive" },
                birthDate,
            },
            select: { id: true },
        }),
        collegeGroupId
            ? db.collegeGroup.findFirst({ where: { id: collegeGroupId, deletedAt: null }, select: { id: true } })
            : true,
        curatorId
            ? db.teacher.findFirst({ where: { id: curatorId, deletedAt: null }, select: { id: true } })
            : true,
    ]);

    if (duplicate) return "Студент с таким ФИО и датой рождения уже существует";
    if (!collegeGroup) return "Группа студента не найдена";
    if (!curator) return "Куратор не найден";
    return null;
}
