import { formatDate } from "@/shared/lib/date";
import { GENDER_LABEL, PAY_METHOD_LABEL } from "./labels";
import type { ListenerDto } from "./types";

export type DetailField = { label: string; value: string };

const formatSnils = (s: string | null) => {
    if (!s) return "";
    return /^\d{11}$/.test(s) ? `${s.slice(0, 3)}-${s.slice(3, 6)}-${s.slice(6, 9)} ${s.slice(9)}` : s;
};

/**
 * Поля карточки слушателя в порядке показа. Карточка рисует просто список,
 * поэтому новые поля (в том числе пользовательские из админки) добавляются здесь.
 */
export function buildListenerFields(l: ListenerDto): DetailField[] {
    return [
        { label: "ФИО", value: l.fullName },
        { label: "СНИЛС", value: formatSnils(l.snils) },
        { label: "Дата рождения", value: formatDate(l.birthDate) },
        { label: "Пол", value: l.gender ? GENDER_LABEL[l.gender] : "" },
        { label: "Телефон", value: l.phone ?? "" },
        { label: "Группа студента", value: l.collegeGroup?.name ?? "" },
        { label: "Куратор", value: l.curator?.fullName ?? "" },
        { label: "Студент ДПК", value: l.isDpkStudent ? "Да" : "Нет" },
        { label: "Мед. справка", value: l.medCertNumber ?? "" },
        { label: "Учреждение", value: l.medInstitution ?? "" },
        { label: "Способ оплаты", value: l.payMethod ? PAY_METHOD_LABEL[l.payMethod] : "" },
        { label: "№ договора", value: l.contractNumber ?? "" },
        { label: "Зачислен", value: formatDate(l.enrolledAt) },
    ];
}
