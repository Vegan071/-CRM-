export type TeacherRow = {
    id: string;
    fullName: string;
    phone: string | null;
    /** групп, где он основной преподаватель */
    asTeacher: number;
    /** групп, где он мастер п/о */
    asMaster: number;
    /** студентов, у которых он куратор */
    curatedStudents: number;
    /** действующих контрактов */
    contracts: number;
};
