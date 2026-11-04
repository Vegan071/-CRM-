"use client";

import { useState } from "react";
import type { Page } from "@/shared/lib/pagination";
import { useInfiniteList } from "@/shared/lib/hooks";
import { InfiniteListBody } from "@/shared/ui/infinite-list";
import { CreateStudentModal } from "@/features/student-create";
import { fetchStudents } from "../api/actions";
import type { StudentRow } from "../model/types";

type Option = { id: string; name: string };

type Props = {
    initialPage: Page<StudentRow>;
    collegeGroups: Option[];
    teachers: Option[];
};

const fmtDate = (iso: string | null) => (iso ? iso.split("-").reverse().join(".") : null);
const inputCls = "h-10 rounded-md border bg-background px-3 text-sm";

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
                <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Поиск по ФИО или телефону…"
                    className={`${inputCls} min-w-60 flex-1`}
                />
                <select className={inputCls} value={collegeGroupId} onChange={(e) => setCollegeGroupId(e.target.value)}>
                    <option value="">Все группы студентов</option>
                    {collegeGroups.map((g) => (
                        <option key={g.id} value={g.id}>{g.name}</option>
                    ))}
                </select>
                <select className={inputCls} value={curatorId} onChange={(e) => setCuratorId(e.target.value)}>
                    <option value="">Все кураторы</option>
                    {teachers.map((t) => (
                        <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                </select>
                <select className={inputCls} value={dpk} onChange={(e) => setDpk(e.target.value)}>
                    <option value="">Студенты ДПК: все</option>
                    <option value="yes">Только ДПК</option>
                    <option value="no">Не ДПК</option>
                </select>
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
                                fmtDate(s.birthDate),
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
