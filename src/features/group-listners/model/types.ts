export type ListenerDto = {
    enrollmentId: string;
    studentId: string;
    position: number;
    fullName: string;
    phone: string | null;
    birthDate: string | null;
    gender: "MALE" | "FEMALE" | null;
    snils: string | null;
    isDpkStudent: boolean;
    medCertNumber: string | null;
    medInstitution: string | null;
    collegeGroup: { id: string; name: string } | null;
    curator: { id: string; fullName: string } | null;
    payMethod: "MATERNITY_CAPITAL" | "INSTALLMENT" | null;
    contractNumber: string | null;
    price: number;
    paid: number;
    enrolledAt: string | null;
};

export type GroupDto = {
    id: string;
    name: string;
    startDate: string | null;
    endDate: string | null;
    status: "IN_PROGRESS" | "DONE";
    teacher: { id: string; fullName: string } | null;
    master: { id: string; fullName: string } | null;
    listenersCount: number;
    collegeStudentsCount: number;
    discountCount: number;
    /** копейки, стоимость за 1 слушателя */
    price: number | null;
    /** копейки, стоимость группы со скидками */
    totalPrice: number | null;
};

export type GroupRow = {
    id: string;
    name: string;
    startDate: string | null;
    endDate: string | null;
    teacherName: string | null;
    listeners: number;
};