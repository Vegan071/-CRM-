import type { ListenerDto } from "./types";

/** В карточках группы оплата двоичная: оплачено полностью либо нет (частичные платежи считаются «не оплачено») */
export type ListenerPayStatus = "UNPAID" | "PAID";

export const PAYMENT_STATUS_LABEL: Record<ListenerPayStatus, string> = {
    UNPAID: "Не оплачено",
    PAID: "Оплачено",
};

export const PAYMENT_STATUS_STYLE: Record<ListenerPayStatus, string> = {
    UNPAID: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300",
    PAID: "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300",
};

export const PAYMENT_STATUSES = (["UNPAID", "PAID"] as const).map((value) => ({
    value,
    label: PAYMENT_STATUS_LABEL[value],
    style: PAYMENT_STATUS_STYLE[value],
}));

export const listenerStatus = (l: ListenerDto): ListenerPayStatus =>
    l.price > 0 && l.paid >= l.price ? "PAID" : "UNPAID";
