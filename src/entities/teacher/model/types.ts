export type TeacherPaymentDto = {
    id: string;
    paidAt: string | null;
    actNumber: string;
    /** копейки */
    amount: number;
};

export type TeacherContractDto = {
    id: string;
    contractNumber: string;
    contractDate: string | null;
    group: { id: string; name: string } | null;
    serviceStartDate: string | null;
    serviceEndDate: string | null;
    contractStartDate: string | null;
    contractEndDate: string | null;
    /** копейки; null — сумма не указана */
    amount: number | null;
    /** копейки, сумма всех выплат по контракту */
    paid: number;
    payments: TeacherPaymentDto[];
};

export type TeacherDto = {
    id: string;
    fullName: string;
    phone: string | null;
    /** групп, где он основной преподаватель */
    asTeacher: number;
    /** групп, где он мастер п/о */
    asMaster: number;
    /** студентов, у которых он куратор */
    curatedStudents: number;
    contracts: TeacherContractDto[];
};
