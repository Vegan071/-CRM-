"use client";

import { useState } from "react";
import type { Page } from "@/shared/lib/pagination";
import { formatDate } from "@/shared/lib/date";
import { useInfiniteList } from "@/shared/lib/hooks";
import { InfiniteListBody } from "@/shared/ui/infinite-list";
import { FilterSelect, SearchInput } from "@/shared/ui/list-toolbar";
import { CreateStudentModal } from "@/features/student-create";
import { fetchStudents } from "../api/actions";
import type { StudentRow } from "../model/types";

type Option = { id: string; name: string };

type Props = {
    initialPage: Page<StudentRow>;
    collegeGroups: Option[];
    teachers: Option[];
};

const DPK_OPTIONS = [
    { value: "yes", label: "Только ДПК" },
    { value: "no", label: "Не ДПК" },
];

const toOptions = (items: Option[]) => items.map((i) => ({ value: i.id, label: i.name }));

export function StudentsList({ initialPage, collegeGroups, teachers }: Props) {
    const [collegeGroupId, setCollegeGroupId] = useState("");
    const [curatorId, setCuratorId] = useState("");
    const [dpk, setDpk] = useState("");

    const list = useInfiniteList<StudentRow>({
        fetchPage: fetchStudents,
        initialPage,
        filters: { collegeGroupId, curatorId, dpk },
    });
    const { total, search, setSearch, reload } = list;

    return (
        <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <h1 className="text-2xl font-bold">Слушатели{total !== undefined ? ` (${total})` : ""}</h1>
                <CreateStudentModal onSuccess={reload} />
            </div>

            <div className="flex flex-wrap gap-2">
                <SearchInput value={search} onChange={setSearch} placeholder="Поиск по ФИО или телефону…" />
                <FilterSelect
                    value={collegeGroupId}
                    onChange={setCollegeGroupId}
                    allLabel="Все группы студентов"
                    options={toOptions(collegeGroups)}
                />
                <FilterSelect
                    value={curatorId}
                    onChange={setCuratorId}
                    allLabel="Все кураторы"
                    options={toOptions(teachers)}
                />
                <FilterSelect value={dpk} onChange={setDpk} allLabel="Студенты ДПК: все" options={DPK_OPTIONS} />
            </div>

            <InfiniteListBody
                list={list}
                emptyText="Ничего не найдено"
                endText="Это все слушатели"
                renderItem={(s) => (
                    <>
                        <p className="flex items-center gap-2 font-semibold">
                            {s.fullName}
                            {s.isDpkStudent && (
                                <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium">ДПК</span>
                            )}
                        </p>
                        <p className="text-sm text-muted-foreground">
                            {[
                                formatDate(s.birthDate, ""),
                                s.phone,
                                s.collegeGroupName,
                                s.curatorName ? `куратор: ${s.curatorName}` : null,
                            ]
                                .filter(Boolean)
                                .join(" · ") || "—"}
                        </p>
                    </>
                )}
            />
        </div>
    );
}
