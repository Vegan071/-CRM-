import { parseAsArrayOf, parseAsString } from "nuqs";
import type { PaymentStatus } from "@/shared/lib/money";
import type { MultiSelectOption } from "@/shared/ui/multi-select";
import { listenerStatus } from "./payment-status";
import type { ListenerDto } from "./types";

/** Значение фильтра «без значения» (нет группы, куратора, способа оплаты) */
export const NONE = "none";

/** Фильтры живут в адресной строке */
export const filterParsers = {
    q: parseAsString.withDefault(""),
    pay: parseAsArrayOf(parseAsString).withDefault([]),
    cg: parseAsArrayOf(parseAsString).withDefault([]),
    cur: parseAsArrayOf(parseAsString).withDefault([]),
    method: parseAsArrayOf(parseAsString).withDefault([]),
    dpk: parseAsString.withDefault(""),
    gender: parseAsString.withDefault(""),
};

/** Фильтры после нормализации: q обрезан и в нижнем регистре, значения проверены по спискам */
export type ActiveFilters = {
    q: string;
    pay: string[];
    cg: string[];
    cur: string[];
    method: string[];
    dpk: string;
    gender: string;
};

/** Уникальные значения среди слушателей группы + «без значения», с количеством */
export function facet<T>(
    listeners: ListenerDto[],
    pick: (l: ListenerDto) => T | null,
    toOption: (item: T) => { value: string; label: string },
    noneLabel: string,
): MultiSelectOption[] {
    const counts = new Map<string, MultiSelectOption>();
    let none = 0;
    for (const l of listeners) {
        const item = pick(l);
        if (item === null) {
            none++;
            continue;
        }
        const o = toOption(item);
        const prev = counts.get(o.value);
        counts.set(o.value, { ...o, count: (prev?.count ?? 0) + 1 });
    }
    const options = [...counts.values()].sort((a, b) => a.label.localeCompare(b.label, "ru"));
    if (none > 0) options.push({ value: NONE, label: noneLabel, count: none });
    return options;
}

export function countByStatus(listeners: ListenerDto[]): Record<PaymentStatus, number> {
    const counts: Record<PaymentStatus, number> = { UNPAID: 0, PARTIAL: 0, PAID: 0 };
    for (const l of listeners) counts[listenerStatus(l)]++;
    return counts;
}

/**
 * Значения из адресной строки, которых в этой группе нет, игнорируем —
 * иначе список «пустел» бы без объяснения
 */
export const knownValues = (selected: string[], options: { value: string }[]) =>
    selected.filter((v) => options.some((o) => o.value === v));

export function matchesListener(l: ListenerDto, f: ActiveFilters): boolean {
    if (f.q && ![l.fullName, l.phone, l.contractNumber].some((v) => v?.toLowerCase().includes(f.q))) return false;
    if (f.pay.length && !f.pay.includes(listenerStatus(l))) return false;
    if (f.cg.length && !f.cg.includes(l.collegeGroup?.id ?? NONE)) return false;
    if (f.cur.length && !f.cur.includes(l.curator?.id ?? NONE)) return false;
    if (f.method.length && !f.method.includes(l.payMethod ?? NONE)) return false;
    if (f.dpk === "yes" && !l.isDpkStudent) return false;
    if (f.dpk === "no" && l.isDpkStudent) return false;
    if ((f.gender === "MALE" || f.gender === "FEMALE") && l.gender !== f.gender) return false;
    return true;
}
