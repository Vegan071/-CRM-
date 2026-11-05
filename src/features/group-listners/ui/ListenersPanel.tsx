"use client";

import { useMemo } from "react";
import { debounce, parseAsArrayOf, parseAsString, useQueryStates } from "nuqs";
import { X } from "lucide-react";
import { paymentStatus, type PaymentStatus } from "@/shared/lib/money";
import { Button } from "@/shared/ui/button";
import { MultiSelect, type MultiSelectOption } from "@/shared/ui/multi-select";
import type { ListenerDto } from "../model/types";
import { ListenerCard } from "./ListenerCard";

const NONE = "none";

const filterParsers = {
    q: parseAsString.withDefault(""),
    pay: parseAsArrayOf(parseAsString).withDefault([]),
    cg: parseAsArrayOf(parseAsString).withDefault([]),
    cur: parseAsArrayOf(parseAsString).withDefault([]),
    method: parseAsArrayOf(parseAsString).withDefault([]),
    dpk: parseAsString.withDefault(""),
    gender: parseAsString.withDefault(""),
};

const PAY_STATUSES: { value: PaymentStatus; label: string; style: string }[] = [
    { value: "UNPAID", label: "Не оплачено", style: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300" },
    { value: "PARTIAL", label: "Частично", style: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300" },
    { value: "PAID", label: "Оплачено", style: "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300" },
];

const METHOD_LABEL: Record<string, string> = {
    MATERNITY_CAPITAL: "Материнский капитал",
    INSTALLMENT: "Рассрочка",
    [NONE]: "Не указан",
};

const inputCls = "h-10 rounded-md border bg-background px-3 text-sm";

/** Уникальные значения среди слушателей группы + «без значения», с количеством */
function facet<T>(
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

function Segmented({
    value,
    onChange,
    options,
}: {
    value: string;
    onChange: (v: string) => void;
    options: { value: string; label: string }[];
}) {
    return (
        <div className="inline-flex overflow-hidden rounded-md border text-sm" role="group">
            {options.map((o) => (
                <button
                    key={o.value}
                    type="button"
                    aria-pressed={value === o.value}
                    onClick={() => onChange(o.value)}
                    className={`px-3 py-1.5 transition-colors ${
                        value === o.value ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                    }`}
                >
                    {o.label}
                </button>
            ))}
        </div>
    );
}

export function ListenersPanel({ listeners }: { listeners: ListenerDto[] }) {
    const [filters, setFilters] = useQueryStates(filterParsers);

    const cgOptions = useMemo(
        () => facet(listeners, (l) => l.collegeGroup, (g) => ({ value: g.id, label: g.name }), "Без группы"),
        [listeners],
    );
    const curOptions = useMemo(
        () => facet(listeners, (l) => l.curator, (c) => ({ value: c.id, label: c.fullName }), "Без куратора"),
        [listeners],
    );
    const methodOptions = useMemo(
        () =>
            facet(
                listeners,
                (l) => l.payMethod,
                (m) => ({ value: m, label: METHOD_LABEL[m] }),
                METHOD_LABEL[NONE],
            ),
        [listeners],
    );
    const statusCount = useMemo(() => {
        const c: Record<PaymentStatus, number> = { UNPAID: 0, PARTIAL: 0, PAID: 0 };
        for (const l of listeners) c[paymentStatus(l.price, l.paid)]++;
        return c;
    }, [listeners]);

    // значения из адресной строки, которых в этой группе нет, игнорируем — иначе список «пустел» бы без объяснения
    const known = (selected: string[], options: { value: string }[]) =>
        selected.filter((v) => options.some((o) => o.value === v));
    const pay = known(filters.pay, PAY_STATUSES);
    const cg = known(filters.cg, cgOptions);
    const cur = known(filters.cur, curOptions);
    const method = known(filters.method, methodOptions);
    const q = filters.q.trim().toLowerCase();

    const matches = (l: ListenerDto) => {
        if (q && ![l.fullName, l.phone, l.contractNumber].some((v) => v?.toLowerCase().includes(q))) return false;
        if (pay.length && !pay.includes(paymentStatus(l.price, l.paid))) return false;
        if (cg.length && !cg.includes(l.collegeGroup?.id ?? NONE)) return false;
        if (cur.length && !cur.includes(l.curator?.id ?? NONE)) return false;
        if (method.length && !method.includes(l.payMethod ?? NONE)) return false;
        if (filters.dpk === "yes" && !l.isDpkStudent) return false;
        if (filters.dpk === "no" && l.isDpkStudent) return false;
        if ((filters.gender === "MALE" || filters.gender === "FEMALE") && l.gender !== filters.gender) return false;
        return true;
    };
    const visibleIds = new Set(listeners.filter(matches).map((l) => l.enrollmentId));
    const shown = visibleIds.size;

    const labelOf = (options: MultiSelectOption[], v: string) => options.find((o) => o.value === v)?.label ?? v;
    const chips = [
        ...(q ? [{ key: "q", label: `Поиск: «${filters.q.trim()}»`, remove: () => setFilters({ q: null }) }] : []),
        ...pay.map((v) => ({
            key: `pay-${v}`,
            label: `Оплата: ${labelOf(PAY_STATUSES, v)}`,
            remove: () => setFilters({ pay: pay.filter((x) => x !== v) }),
        })),
        ...cg.map((v) => ({
            key: `cg-${v}`,
            label: `Группа: ${labelOf(cgOptions, v)}`,
            remove: () => setFilters({ cg: cg.filter((x) => x !== v) }),
        })),
        ...cur.map((v) => ({
            key: `cur-${v}`,
            label: `Куратор: ${labelOf(curOptions, v)}`,
            remove: () => setFilters({ cur: cur.filter((x) => x !== v) }),
        })),
        ...method.map((v) => ({
            key: `method-${v}`,
            label: `Способ: ${labelOf(methodOptions, v)}`,
            remove: () => setFilters({ method: method.filter((x) => x !== v) }),
        })),
        ...(filters.dpk === "yes" || filters.dpk === "no"
            ? [{ key: "dpk", label: filters.dpk === "yes" ? "ДПК" : "Не ДПК", remove: () => setFilters({ dpk: null }) }]
            : []),
        ...(filters.gender === "MALE" || filters.gender === "FEMALE"
            ? [{
                  key: "gender",
                  label: filters.gender === "MALE" ? "Мужчины" : "Женщины",
                  remove: () => setFilters({ gender: null }),
              }]
            : []),
    ];
    const resetAll = () => setFilters(null);

    const heading = `Слушатели (${chips.length > 0 ? `${shown} из ${listeners.length}` : listeners.length})`;

    if (listeners.length === 0) {
        return (
            <section className="space-y-3">
                <h2 className="font-semibold">{heading}</h2>
                <p className="text-sm text-muted-foreground">В группе пока никого нет</p>
            </section>
        );
    }

    return (
        <section className="space-y-3">
            <div className="flex items-center justify-between gap-3">
                <h2 className="font-semibold">{heading}</h2>
                {chips.length > 0 && (
                    <Button type="button" variant="ghost" size="sm" onClick={resetAll}>
                        Сбросить фильтры
                    </Button>
                )}
            </div>

            <div className="space-y-3 rounded-lg border p-3">
                <input
                    value={filters.q}
                    onChange={(e) => setFilters({ q: e.target.value || null }, { limitUrlUpdates: debounce(250) })}
                    placeholder="Поиск по ФИО, телефону или № договора…"
                    className={`${inputCls} w-full`}
                />

                <div className="flex flex-wrap items-center gap-2">
                    {PAY_STATUSES.map((s) => {
                        const active = pay.includes(s.value);
                        return (
                            <button
                                key={s.value}
                                type="button"
                                aria-pressed={active}
                                onClick={() =>
                                    setFilters({ pay: active ? pay.filter((x) => x !== s.value) : [...pay, s.value] })
                                }
                                className={`rounded-full border px-3 py-1 text-sm font-medium transition-colors ${
                                    active ? `${s.style} border-transparent` : "hover:bg-muted"
                                }`}
                            >
                                {s.label} · {statusCount[s.value]}
                            </button>
                        );
                    })}
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    <MultiSelect label="Группа студента" options={cgOptions} selected={cg} onChange={(v) => setFilters({ cg: v })} />
                    <MultiSelect label="Куратор" options={curOptions} selected={cur} onChange={(v) => setFilters({ cur: v })} />
                    <MultiSelect label="Способ оплаты" options={methodOptions} selected={method} onChange={(v) => setFilters({ method: v })} />
                    <Segmented
                        value={filters.dpk}
                        onChange={(v) => setFilters({ dpk: v || null })}
                        options={[
                            { value: "", label: "Все" },
                            { value: "yes", label: "ДПК" },
                            { value: "no", label: "Не ДПК" },
                        ]}
                    />
                    <Segmented
                        value={filters.gender}
                        onChange={(v) => setFilters({ gender: v || null })}
                        options={[
                            { value: "", label: "Любой пол" },
                            { value: "MALE", label: "М" },
                            { value: "FEMALE", label: "Ж" },
                        ]}
                    />
                </div>

                {chips.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                        {chips.map((c) => (
                            <button
                                key={c.key}
                                type="button"
                                onClick={c.remove}
                                aria-label={`Убрать фильтр: ${c.label}`}
                                className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-0.5 text-xs hover:bg-muted/70"
                            >
                                {c.label}
                                <X className="size-3" />
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {shown === 0 && (
                <div className="py-6 text-center text-sm text-muted-foreground">
                    <p>Никого не найдено по выбранным фильтрам</p>
                    <button type="button" onClick={resetAll} className="mt-1 underline">
                        Сбросить фильтры
                    </button>
                </div>
            )}

            {/* скрываем, а не размонтируем: открытая карточка и правки в ней не теряются при смене фильтра */}
            {listeners.map((l) => (
                <div key={l.enrollmentId} hidden={!visibleIds.has(l.enrollmentId)}>
                    <ListenerCard listener={l} />
                </div>
            ))}
        </section>
    );
}
