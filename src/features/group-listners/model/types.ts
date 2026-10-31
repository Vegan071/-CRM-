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
    payments: { id: string; amount: number; date: string | null }[];
};

export type GroupRow = {
    id: string;
    name: string;
    startDate: string | null;
    endDate: string | null;
    teacherName: string | null;
    listeners: number;
};