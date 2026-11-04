"use client";

import { useState } from "react";
import type { Page } from "@/shared/lib/pagination";
import { useInfiniteList } from "@/shared/lib/hooks";
import { InfiniteListBody } from "@/shared/ui/infinite-list";
import { CreateTeacherModal } from "@/features/teacher-create";
import { fetchTeachers } from "../api/actions";
import type { TeacherRow } from "../model/types";

const inputCls = "h-10 rounded-md border bg-background px-3 text-sm";

export function TeachersList({ initialPage }: { initialPage: Page<TeacherRow> }) {
    const [role, setRole] = useState("");
    const [contract, setContract] = useState("");

    const list = useInfiniteList<TeacherRow>({
        fetchPage: fetchTeachers,
        initialPage,
        filters: { role, contract },
    });
    const { total, search, setSearch, reload } = list;

    return (
        <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <h1 className="text-2xl font-bold">Преподаватели{total !== undefined ? ` (${total})` : ""}</h1>
                <CreateTeacherModal onSuccess={reload} />
            </div>

            <div className="flex flex-wrap gap-2">
                <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Поиск по ФИО или телефону…"
                    className={`${inputCls} min-w-60 flex-1`}
                />
                <select className={inputCls} value={role} onChange={(e) => setRole(e.target.value)}>
                    <option value="">Все роли</option>
                    <option value="teacher">Ведут группы</option>
                    <option value="master">Мастера п/о</option>
                    <option value="curator">Кураторы</option>
                </select>
                <select className={inputCls} value={contract} onChange={(e) => setContract(e.target.value)}>
                    <option value="">Контракты: все</option>
                    <option value="with">Есть контракт</option>
                    <option value="without">Без контракта</option>
                </select>
            </div>

            <InfiniteListBody
                list={list}
                emptyText="Ничего не найдено"
                endText="Это все преподаватели"
                renderItem={(t) => (
                    <>
                        <p className="font-semibold">{t.fullName}</p>
                        <p className="text-sm text-muted-foreground">
                            {[
                                t.phone,
                                t.asTeacher > 0 ? `ведёт групп: ${t.asTeacher}` : null,
                                t.asMaster > 0 ? `мастер в группах: ${t.asMaster}` : null,
                                t.curatedStudents > 0 ? `куратор у ${t.curatedStudents} студ.` : null,
                                `контрактов: ${t.contracts}`,
                            ]
                                .filter(Boolean)
                                .join(" · ")}
                        </p>
                    </>
                )}
            />
        </div>
    );
}
