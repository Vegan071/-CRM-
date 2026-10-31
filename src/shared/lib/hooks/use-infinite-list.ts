"use client";

import {useCallback, useEffect, useRef, useState} from "react";
import {useDebounceValue, useInfiniteScroll} from "@siberiacancode/reactuse";
import type {Page, PageParams} from "@/shared/lib/pagination";

interface UseInfiniteListOptions<T extends { id: string }> {
    /** Загрузка страницы: серверный экшен или fetch */
    fetchPage: (params: PageParams) => Promise<Page<T>>;
    /** Первая страница, загруженная на сервере (без мигания и лишнего запроса) */
    initialPage?: Page<T>;
    limit?: number;
    debounceMs?: number;
    /** За сколько px до низа контейнера подгружать следующую страницу */
    distance?: number;
    enabled?: boolean;
    filters?: Record<string, string>;
}

function mergeById<T extends { id: string }>(prev: T[], next: T[]): T[] {
    const seen = new Set(prev.map((item) => item.id));
    return [...prev, ...next.filter((item) => !seen.has(item.id))];
}

/**
 * Универсальная подгрузка списка при прокрутке + поиск с debounce.
 * Повесьте `scrollRef` на прокручиваемый контейнер (нужна ограниченная высота и overflow-y-auto).
 */
export function useInfiniteList<T extends { id: string }>({
                                                              fetchPage,
                                                              initialPage,
                                                              filters,
                                                              limit = 20,
                                                              debounceMs = 300,
                                                              distance = 80,
                                                              enabled = true,
                                                          }: UseInfiniteListOptions<T>) {
    const [search, setSearch] = useState("");
    const debouncedSearch = useDebounceValue(search, debounceMs);

    const [items, setItems] = useState<T[]>(initialPage?.items ?? []);
    const [total, setTotal] = useState<number | undefined>(initialPage?.total);
    const [hasMore, setHasMore] = useState(initialPage ? initialPage.nextCursor !== null : true);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // refs нужны, чтобы колбэк скролла не держал устаревшие значения
    const cursorRef = useRef<string | null>(initialPage?.nextCursor ?? null);
    const hasMoreRef = useRef(hasMore);
    const searchRef = useRef("");
    const loadingRef = useRef(false);
    const errorRef = useRef<string | null>(null);
    const requestIdRef = useRef(0);
    const fetchPageRef = useRef(fetchPage);
    const filtersKey = JSON.stringify(filters ?? {});
    const filtersRef = useRef(filters);
    filtersRef.current = filters;
    const appliedKeyRef = useRef(filtersKey);

    const load = useCallback(
        async (reset: boolean) => {
            // дозагрузка не идёт: во время запроса, после последней страницы и после ошибки (там — «Повторить»)
            if (!reset && (loadingRef.current || !hasMoreRef.current || errorRef.current)) return;

            const requestId = ++requestIdRef.current; // устаревшие ответы игнорируем
            loadingRef.current = true;
            errorRef.current = null;
            setIsLoading(true);
            setError(null);

            try {
                const page = await fetchPageRef.current({
                    cursor: reset ? null : cursorRef.current,
                    limit,
                    search: searchRef.current,
                    filters: filtersRef.current,
                });
                if (requestId !== requestIdRef.current) return;

                cursorRef.current = page.nextCursor;
                hasMoreRef.current = page.nextCursor !== null;
                setHasMore(hasMoreRef.current);
                setItems((prev) => (reset ? page.items : mergeById(prev, page.items)));
                if (page.total !== undefined) setTotal(page.total);
            } catch (e) {
                if (requestId !== requestIdRef.current) return;
                const message = e instanceof Error ? e.message : "Не удалось загрузить список";
                errorRef.current = message;
                setError(message);
            } finally {
                if (requestId === requestIdRef.current) {
                    loadingRef.current = false;
                    setIsLoading(false);
                }
            }
        },
        [limit]
    );

    useEffect(() => {
        if (!enabled) return;
        if (debouncedSearch === searchRef.current && filtersKey === appliedKeyRef.current && initialPage) return;
        searchRef.current = debouncedSearch;
        appliedKeyRef.current = filtersKey;
        void load(true);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [debouncedSearch, filtersKey, load, enabled]);

    const {ref: scrollRef} = useInfiniteScroll<HTMLDivElement>(() => load(false), {distance});

    const prepend = useCallback((item: T) => {
        setItems((prev) => (prev.some((i) => i.id === item.id) ? prev : [item, ...prev]));
        setTotal((t) => (t === undefined ? t : t + 1));
    }, []);

    const remove = useCallback((id: string) => {
        setItems((prev) => prev.filter((i) => i.id !== id));
        setTotal((t) => (t === undefined ? t : Math.max(0, t - 1)));
    }, []);

    return {
        scrollRef,
        items,
        total,
        search,
        setSearch,
        isLoading,
        hasMore,
        error,
        loadMore: () => load(false),
        reload: () => load(true),
        prepend,
        remove,
    };
}

export type UseInfiniteListResult<T extends {
    id: string
}> = ReturnType<typeof useInfiniteList<T>>;