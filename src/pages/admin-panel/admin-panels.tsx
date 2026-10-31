"use client";

import { useInfiniteList } from "@/shared/lib/hooks/use-infinite-list";
import type { Page } from "@/shared/lib/pagination";
import { groupNameSchema, teacherNameSchema } from "@/shared/lib/schemas/admin";
import { InfiniteList } from "@/shared/ui/infinite-list";
import {
    checkGroupExists,
    checkTeacherExists,
    createGroup,
    createTeacher,
    listGroups,
    listTeachers,
} from "./actions";
import { CreateNameForm } from "./create-name-form";
import type { GroupItem, TeacherItem } from "./queries";

const itemClass = "rounded-md border px-3 py-2 text-sm";

export function GroupsPanel({ initialPage }: { initialPage: Page<GroupItem> }) {
    const list = useInfiniteList<GroupItem>({ fetchPage: listGroups, initialPage });

    return (
        <div className="space-y-6">
            <CreateNameForm<GroupItem>
                id="group-name"
                title="Новая группа"
                label="Номер группы"
                placeholder="Например: 101-А"
                submitLabel="Добавить группу"
                existsMessage="Такая группа уже существует"
                schema={groupNameSchema}
                check={checkGroupExists}
                onSubmit={(name) => createGroup({ name })}
                onCreated={list.prepend}
                successMessage={(g) => `Группа «${g.name}» создана`}
            />
            <section>
                <h2 className="mb-3 font-semibold">Группы ({list.total ?? list.items.length})</h2>
                <InfiniteList
                    list={list}
                    searchPlaceholder="Поиск группы"
                    renderItem={(g) => <div className={itemClass}>{g.name}</div>}
                />
            </section>
        </div>
    );
}

export function TeachersPanel({ initialPage }: { initialPage: Page<TeacherItem> }) {
    const list = useInfiniteList<TeacherItem>({ fetchPage: listTeachers, initialPage });

    return (
        <div className="space-y-6">
            <CreateNameForm<TeacherItem>
                id="teacher-name"
                title="Новый преподаватель"
                label="ФИО преподавателя"
                placeholder="Иванов Иван Иванович"
                submitLabel="Добавить преподавателя"
                existsMessage="Такой преподаватель уже существует"
                schema={teacherNameSchema}
                check={checkTeacherExists}
                onSubmit={(fullName) => createTeacher({ fullName })}
                onCreated={list.prepend}
                successMessage={(t) => `Преподаватель «${t.fullName}» добавлен`}
            />
            <section>
                <h2 className="mb-3 font-semibold">Преподаватели ({list.total ?? list.items.length})</h2>
                <InfiniteList
                    list={list}
                    searchPlaceholder="Поиск преподавателя"
                    renderItem={(t) => <div className={itemClass}>{t.fullName}</div>}
                />
            </section>
        </div>
    );
}