import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/shared/api/session";
import { toIsoDate } from "@/shared/lib/date";
import { getTeacher } from "@/entities/teacher/api/get-teacher";
import { splitContracts } from "@/entities/teacher/model/contract-status";
import { ContractsSection, TeacherSummary } from "@/features/teacher-details";

export default async function TeacherPage({ params }: { params: Promise<{ id: string }> }) {
    await requireUser();
    const { id } = await params;

    const teacher = await getTeacher(id);
    if (!teacher) notFound();

    const { active, finished } = splitContracts(teacher.contracts, toIsoDate(new Date())!);

    return (
        <div className="container mx-auto max-w-4xl space-y-6 py-8">
            <Link href="/teachers" className="text-sm text-muted-foreground hover:underline">
                ← Все преподаватели
            </Link>

            <TeacherSummary teacher={teacher} activeContracts={active.length} />

            <ContractsSection title="Действующие контракты" contracts={active} emptyText="Действующих контрактов нет" />
            {finished.length > 0 && (
                <ContractsSection title="Завершённые контракты" contracts={finished} emptyText="" collapsed />
            )}
        </div>
    );
}
