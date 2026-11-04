"use client";

import type { ReactNode } from "react";
import type { UseInfiniteListResult } from "@/shared/lib/hooks";

type Props<T extends { id: string }> = {
    list: Pick<UseInfiniteListResult<T>, "scrollRef" | "items" | "isLoading" | "hasMore" | "error" | "loadMore">;
    renderItem: (item: T) => ReactNode;
    emptyText: string;
    endText: string;
};

/** Прокручиваемый контейнер со списком, индикатором загрузки, ошибкой и «Повторить» для useInfiniteList */
export function InfiniteListBody<T extends { id: string }>({ list, renderItem, emptyText, endText }: Props<T>) {
    const { scrollRef, items, isLoading, hasMore, error, loadMore } = list;

    return (
        <div ref={scrollRef} className="max-h-[70vh] overflow-y-auto pr-1">
            {items.length === 0 && !isLoading && !error ? (
                <p className="py-6 text-center text-muted-foreground">{emptyText}</p>
            ) : (
                <ul className="space-y-2">
                    {items.map((item) => (
                        <li key={item.id} className="rounded-lg border px-4 py-3">
                            {renderItem(item)}
                        </li>
                    ))}
                </ul>
            )}

            {isLoading && <p className="py-3 text-center text-sm text-muted-foreground">Загрузка…</p>}

            {error && (
                <div className="py-3 text-center text-sm">
                    <p className="text-destructive">{error}</p>
                    <button type="button" onClick={loadMore} className="mt-1 underline">
                        Повторить
                    </button>
                </div>
            )}

            {!isLoading && !error && !hasMore && items.length > 0 && (
                <p className="py-3 text-center text-sm text-muted-foreground">{endText}</p>
            )}
        </div>
    );
}
