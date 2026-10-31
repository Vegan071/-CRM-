"use client";

import { useState } from "react";
import Link from "next/link";
import type { Page } from "@/shared/lib/pagination";
import type { GroupRow } from "../model/types";
import { fetchGroups } from "../api/actions";
import {useInfiniteList} from "@/shared/lib/hooks";

type Props = {
    initialPage: Page<GroupRow>;
    teachers: { id: string; name: string }[];
};

const fmt = (iso: string | null) => (iso ? iso.split("-").reverse().join(".") : "…");
const inputCls = "h-10 rounded-md border bg-background px-3 text-sm";

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
                <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Поиск по названию группы…"
                    className={`${inputCls} min-w-60 flex-1`}
                />
                <select className={inputCls} value={status} onChange={(e) => setStatus(e.target.value)}>
                    <option value="">Все статусы</option>
                    <option value="active">Идут сейчас</option>
                    <option value="upcoming">Ещё не начались</option>
                    <option value="finished">Завершены</option>
                </select>
                <select className={inputCls} value={teacherId} onChange={(e) => setTeacherId(e.target.value)}>
                    <option value="">Все преподаватели</option>
                    {teachers.map((t) => (
                        <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                </select>
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
                                    {fmt(g.startDate)} — {fmt(g.endDate)}
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