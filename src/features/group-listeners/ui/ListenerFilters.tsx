"use client";

import { debounce } from "nuqs";
import { X } from "lucide-react";
import { SearchInput } from "@/shared/ui/list-toolbar";
import { MultiSelect } from "@/shared/ui/multi-select";
import { Segmented } from "@/shared/ui/segmented";
import { PAYMENT_STATUSES } from "../model/payment-status";
import type { ListenerFilterState } from "../model/use-listener-filters";

export function ListenerFilters({ state }: { state: ListenerFilterState }) {
    const { filters, setFilters, active, options, statusCount, chips } = state;
    const { pay, cg, cur, method } = active;

    return (
        <div className="space-y-3 rounded-lg border p-3">
            <SearchInput
                value={filters.q}
                onChange={(v) => setFilters({ q: v || null }, { limitUrlUpdates: debounce(250) })}
                placeholder="Поиск по ФИО, телефону или № договора…"
                className="w-full"
            />

            <div className="flex flex-wrap items-center gap-2">
                {PAYMENT_STATUSES.map((s) => {
                    const isActive = pay.includes(s.value);
                    return (
                        <button
                            key={s.value}
                            type="button"
                            aria-pressed={isActive}
                            onClick={() =>
                                setFilters({ pay: isActive ? pay.filter((x) => x !== s.value) : [...pay, s.value] })
                            }
                            className={`rounded-full border px-3 py-1 text-sm font-medium transition-colors ${
                                isActive ? `${s.style} border-transparent` : "hover:bg-muted"
                            }`}
                        >
                            {s.label} · {statusCount[s.value]}
                        </button>
                    );
                })}
            </div>

            <div className="flex flex-wrap items-center gap-2">
                <MultiSelect label="Группа студента" options={options.cg} selected={cg} onChange={(v) => setFilters({ cg: v })} />
                <MultiSelect label="Куратор" options={options.cur} selected={cur} onChange={(v) => setFilters({ cur: v })} />
                <MultiSelect
                    label="Способ оплаты"
                    options={options.method}
                    selected={method}
                    onChange={(v) => setFilters({ method: v })}
                />
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
    );
}
