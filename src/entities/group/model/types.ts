/** Полные данные учебной группы (страница группы, форма «Детали группы») */
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

/** Строка в списке групп */
export type GroupRow = {
    id: string;
    name: string;
    startDate: string | null;
    endDate: string | null;
    teacherName: string | null;
    listeners: number;
};
