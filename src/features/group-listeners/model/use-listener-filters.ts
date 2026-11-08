import { useMemo } from "react";
import { useQueryStates } from "nuqs";
import type { MultiSelectOption } from "@/shared/ui/multi-select";
import {
    countByStatus,
    facet,
    filterParsers,
    knownValues,
    matchesListener,
    NONE,
    type ActiveFilters,
} from "./filters";
import { PAY_METHOD_LABEL } from "./labels";
import { PAYMENT_STATUSES } from "./payment-status";
import type { ListenerDto } from "./types";

const METHOD_LABEL: Record<string, string> = { ...PAY_METHOD_LABEL, [NONE]: "Не указан" };

const labelOf = (options: MultiSelectOption[], v: string) => options.find((o) => o.value === v)?.label ?? v;

/** Состояние фильтров слушателей: значения из URL, варианты выбора, видимые строки и «чипсы» выбранного */
export function useListenerFilters(listeners: ListenerDto[]) {
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
        () => facet(listeners, (l) => l.payMethod, (m) => ({ value: m, label: METHOD_LABEL[m] }), METHOD_LABEL[NONE]),
        [listeners],
    );
    const statusCount = useMemo(() => countByStatus(listeners), [listeners]);

    const pay = knownValues(filters.pay, PAYMENT_STATUSES);
    const cg = knownValues(filters.cg, cgOptions);
    const cur = knownValues(filters.cur, curOptions);
    const method = knownValues(filters.method, methodOptions);
    const active: ActiveFilters = {
        q: filters.q.trim().toLowerCase(),
        pay,
        cg,
        cur,
        method,
        dpk: filters.dpk,
        gender: filters.gender,
    };

    const visibleIds = new Set(listeners.filter((l) => matchesListener(l, active)).map((l) => l.enrollmentId));

    const chips = [
        ...(active.q ? [{ key: "q", label: `Поиск: «${filters.q.trim()}»`, remove: () => setFilters({ q: null }) }] : []),
        ...pay.map((v) => ({
            key: `pay-${v}`,
            label: `Оплата: ${labelOf(PAYMENT_STATUSES, v)}`,
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
            ? [
                  {
                      key: "gender",
                      label: filters.gender === "MALE" ? "Мужчины" : "Женщины",
                      remove: () => setFilters({ gender: null }),
                  },
              ]
            : []),
    ];

    return {
        filters,
        setFilters,
        active,
        options: { cg: cgOptions, cur: curOptions, method: methodOptions },
        statusCount,
        visibleIds,
        shown: visibleIds.size,
        chips,
        resetAll: () => setFilters(null),
    };
}

export type ListenerFilterState = ReturnType<typeof useListenerFilters>;
