"use client";

import { useState } from "react";
import type { Page } from "@/shared/lib/pagination";
import { useInfiniteList } from "@/shared/lib/hooks";
import { InfiniteListBody } from "@/shared/ui/infinite-list";
import { FilterSelect, SearchInput } from "@/shared/ui/list-toolbar";
import { CreateTeacherModal } from "@/features/teacher-create";
import { fetchTeachers } from "../api/actions";
import type { TeacherRow } from "../model/types";

const ROLE_OPTIONS = [
    { value: "teacher", label: "Ведут группы" },
    { value: "master", label: "Мастера п/о" },
    { value: "curator", label: "Кураторы" },
];

const CONTRACT_OPTIONS = [
    { value: "with", label: "Есть контракт" },
    { value: "without", label: "Без контракта" },
];

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
                <SearchInput value={search} onChange={setSearch} placeholder="Поиск по ФИО или телефону…" />
                <FilterSelect value={role} onChange={setRole} allLabel="Все роли" options={ROLE_OPTIONS} />
                <FilterSelect
                    value={contract}
                    onChange={setContract}
                    allLabel="Контракты: все"
                    options={CONTRACT_OPTIONS}
                />
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
