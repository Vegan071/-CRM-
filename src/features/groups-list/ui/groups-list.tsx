"use client";

import { useState } from "react";
import Link from "next/link";
import type { Page } from "@/shared/lib/pagination";
import { formatDate } from "@/shared/lib/date";
import { useInfiniteList } from "@/shared/lib/hooks";
import { FilterSelect, SearchInput } from "@/shared/ui/list-toolbar";
import type { GroupRow } from "@/entities/group/model/types";
import { fetchGroups } from "../api/actions";

type Props = {
    initialPage: Page<GroupRow>;
    teachers: { id: string; name: string }[];
};

const STATUS_OPTIONS = [
    { value: "active", label: "Идут сейчас" },
    { value: "upcoming", label: "Ещё не начались" },
    { value: "finished", label: "Завершены" },
];

export function GroupsList({ initialPage, teachers }: Props) {
    const [status, setStatus] = useState("");
    const [teacherId, setTeacherId] = useState("");

    const { scrollRef, items, total, search, setSearch, isLoading, hasMore, error, loadMore } =
        useInfiniteList<GroupRow>({
            fetchPage: fetchGroups,
            initialPage,
            filters: { status, teacherId },
        });

    return (
        <div className="space-y-4">
            <h1 className="text-2xl font-bold">Группы{total !== undefined ? ` (${total})` : ""}</h1>

            <div className="flex flex-wrap gap-2">
                <SearchInput value={search} onChange={setSearch} placeholder="Поиск по названию группы…" />
                <FilterSelect value={status} onChange={setStatus} allLabel="Все статусы" options={STATUS_OPTIONS} />
                <FilterSelect
                    value={teacherId}
                    onChange={setTeacherId}
                    allLabel="Все преподаватели"
                    options={teachers.map((t) => ({ value: t.id, label: t.name }))}
                />
            </div>

            <div ref={scrollRef} className="max-h-[70vh] overflow-y-auto pr-1">
                {items.length === 0 && !isLoading && !error ? (
                    <p className="py-6 text-center text-muted-foreground">Ничего не найдено</p>
                ) : (
                    <ul className="space-y-2">
                        {items.map((g) => (
                            <li
                                key={g.id}
                                className="relative rounded-lg border px-4 py-3 transition-colors hover:bg-muted/50"
                            >
                                <Link
                                    href={`/groups/${g.id}`}
                                    className="font-semibold hover:underline after:absolute after:inset-0 after:content-['']"
                                >
                                    {g.name}
                                </Link>
                                <p className="text-sm text-muted-foreground">
                                    {formatDate(g.startDate, "…")} — {formatDate(g.endDate, "…")}
                                    {g.teacherName ? ` · ${g.teacherName}` : ""} · слушателей: {g.listeners}
                                </p>
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
                    <p className="py-3 text-center text-sm text-muted-foreground">Это все группы</p>
                )}
            </div>
        </div>
    );
}
