export const toKopecks = (rub: number | string) => Math.round(Number(rub) * 100);

export const formatRub = (kopecks: number) =>
    new Intl.NumberFormat("ru-RU", { style: "currency", currency: "RUB" }).format(kopecks / 100);

export type PaymentStatus = "UNPAID" | "PARTIAL" | "PAID";

export function paymentStatus(price: number, paid: number): PaymentStatus {
    if (paid <= 0) return "UNPAID";
    return paid >= price ? "PAID" : "PARTIAL";
}