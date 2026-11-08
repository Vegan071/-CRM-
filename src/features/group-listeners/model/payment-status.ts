import { paymentStatus, type PaymentStatus } from "@/shared/lib/money";
import type { ListenerDto } from "./types";

export const PAYMENT_STATUS_LABEL: Record<PaymentStatus, string> = {
    UNPAID: "Не оплачено",
    PARTIAL: "Частично",
    PAID: "Оплачено",
};

export const PAYMENT_STATUS_STYLE: Record<PaymentStatus, string> = {
    UNPAID: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300",
    PARTIAL: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
    PAID: "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300",
};

export const PAYMENT_STATUSES = (["UNPAID", "PARTIAL", "PAID"] as const).map((value) => ({
    value,
    label: PAYMENT_STATUS_LABEL[value],
    style: PAYMENT_STATUS_STYLE[value],
}));

export const listenerStatus = (l: ListenerDto): PaymentStatus => paymentStatus(l.price, l.paid);
