/** Аргументы курсорной пагинации: берём limit + 1 строку, чтобы понять, есть ли следующая страница */
export const cursorArgs = (cursor: string | null, limit: number) => ({
    take: limit + 1,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
});

/** Условие «содержит подстроку» без учёта регистра */
export const containsCI = (search: string) => ({ contains: search, mode: "insensitive" as const });
