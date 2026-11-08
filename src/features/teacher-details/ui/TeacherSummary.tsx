import type { TeacherDto } from "@/entities/teacher/model/types";

function Stat({ label, value }: { label: string; value: number }) {
    return (
        <div className="rounded-lg border px-4 py-3">
            <p className="text-2xl font-bold">{value}</p>
            <p className="text-xs text-muted-foreground">{label}</p>
        </div>
    );
}

/** Шапка страницы преподавателя: контакты и показатели */
export function TeacherSummary({ teacher: t, activeContracts }: { teacher: TeacherDto; activeContracts: number }) {
    return (
        <div className="space-y-4">
            <div>
                <h1 className="text-2xl font-bold">{t.fullName}</h1>
                <p className="text-sm text-muted-foreground">{t.phone ?? "Телефон не указан"}</p>
            </div>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                <Stat label="Действующих контрактов" value={activeContracts} />
                <Stat label="Ведёт групп" value={t.asTeacher} />
                <Stat label="Мастер п/о в группах" value={t.asMaster} />
                <Stat label="Студентов под кураторством" value={t.curatedStudents} />
            </div>
        </div>
    );
}
