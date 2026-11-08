"use client";

import { Button } from "@/shared/ui/button";
import type { ListenerDto } from "../model/types";
import { useListenerFilters } from "../model/use-listener-filters";
import { ListenerCard } from "./ListenerCard";
import { ListenerFilters } from "./ListenerFilters";

export function ListenersPanel({ listeners }: { listeners: ListenerDto[] }) {
    const state = useListenerFilters(listeners);
    const { chips, shown, visibleIds, resetAll } = state;

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

            <ListenerFilters state={state} />

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
