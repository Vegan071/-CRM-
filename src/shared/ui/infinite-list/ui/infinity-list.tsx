"use client";

import type { ReactNode } from "react";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import type { UseInfiniteListResult } from "@/shared/lib/hooks/use-infinite-list";

interface InfiniteListProps<T extends { id: string }> {
    list: UseInfiniteListResult<T>;
    renderItem: (item: T) => ReactNode;
    searchPlaceholder?: string;
    emptyText?: string;
    /** Классы контейнера прокрутки; высота должна быть ограничена */
    className?: string;
}

export function InfiniteList<T extends { id: string }>({
                                                           list,
                                                           renderItem,
                                                           searchPlaceholder = "Поиск...",
                                                           emptyText = "Ничего не найдено",
                                                           className = "max-h-96",
                                                       }: InfiniteListProps<T>) {
    const { scrollRef, items, search, setSearch, isLoading, hasMore, error, loadMore, reload } = list;

    return (
        <div className="space-y-3">
            <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={searchPlaceholder}
            />

            <div ref={scrollRef} className={`overflow-y-auto ${className}`}>
                <ul className="space-y-2">
                    {items.map((item) => (
                        <li key={item.id}>{renderItem(item)}</li>
                    ))}
                </ul>

                {!isLoading && !error && items.length === 0 && (
                    <p className="py-4 text-center text-sm text-muted-foreground">{emptyText}</p>
                )}
                {isLoading && (
                    <p className="py-3 text-center text-sm text-muted-foreground">Загрузка...</p>
                )}
                {error && (
                    <div className="flex items-center justify-between gap-2 py-3">
                        <p className="text-sm text-destructive">{error}</p>
                        <Button variant="outline" size="sm" onClick={reload}>
                            Повторить
                        </Button>
                    </div>
                )}
                {/* запасной вариант, если контейнер не заполнен и скролла нет */}
                {hasMore && !isLoading && !error && (
                    <Button variant="ghost" size="sm" className="w-full" onClick={loadMore}>
                        Показать ещё
                    </Button>
                )}
            </div>
        </div>
    );
}