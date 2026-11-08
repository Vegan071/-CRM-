export type Page<T> = {
    items: T[];
    nextCursor: string | null;
    /** Приходит только с первой страницей (cursor === null) */
    total?: number;
};

export interface PageParams {
    cursor: string | null;
    limit: number;
    search: string;
    filters?: Record<string, string>;
}

export type ActionResult<T> = { ok: true; data: T } | { ok: false; error: string };

/** Преобразует элементы страницы, сохраняя курсор и total */
export function mapPage<T, U>(page: Page<T>, fn: (item: T) => U): Page<U> {
    return { ...page, items: page.items.map(fn) };
}

/** Ожидает `limit + 1` строк: лишняя строка говорит, что страница не последняя */
export function toPage<T extends { id: string }>(rows: T[], limit: number, total?: number): Page<T> {
    const hasMore = rows.length > limit;
    const items = hasMore ? rows.slice(0, limit) : rows;
    return {
        items,
        nextCursor: hasMore ? items[items.length - 1].id : null,
        total,
    };
}