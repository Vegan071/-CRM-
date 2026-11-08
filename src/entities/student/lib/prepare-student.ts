import { toDate } from "@/shared/api/action-utils";
import { normalizeName } from "@/shared/lib/normalize";
import type { StudentFormValues } from "../model/schema";

/**
 * Приводит значения формы студента к виду для БД. Общие поля для создания и редактирования;
 * СНИЛС шифруется отдельно в каждом экшене — у создания и редактирования разные правила.
 */
export function prepareStudent(v: StudentFormValues) {
    const fullName = normalizeName(v.fullName);
    const birthDate = toDate(v.birthDate);
    return {
        fullName,
        birthDate,
        data: {
            fullName,
            phone: v.phone,
            birthDate,
            gender: v.gender,
            collegeGroupId: v.collegeGroupId,
            curatorId: v.curatorId,
            isDpkStudent: v.isDpkStudent,
            medCertNumber: v.medCertNumber,
            medInstitution: v.medInstitution,
        },
    };
}
