import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/shared/api/session";
import {getGroupWithListeners} from "@/features/group-listners/api/queries";
import {AddListener} from "@/features/group-listners/ui/AddListener";
import {ListenerCard} from "@/features/group-listners/ui/ListenerCard";
import { CreateStudentModal } from "@/features/student-create";


const fmt = (iso: string | null) => (iso ? iso.split("-").reverse().join(".") : "…");

export default async function GroupPage({ params }: { params: Promise<{ id: string }> }) {
    await requireUser();
    const { id } = await params;

    const data = await getGroupWithListeners(id);
    if (!data) notFound();
    const { group, listeners } = data;

    return (
        <div className="container mx-auto max-w-4xl space-y-6 py-8">
            <div>
                <Link href="/" className="text-sm text-muted-foreground hover:underline">
                    ← Все группы
                </Link>
                <h1 className="mt-1 text-2xl font-bold">{group.name}</h1>
                <p className="text-sm text-muted-foreground">
                    {fmt(group.startDate)} — {fmt(group.endDate)}
                </p>
            </div>

            <div className="flex flex-wrap items-end gap-3">
                <div className="min-w-60 flex-1">
                    <AddListener groupId={group.id} />
                </div>
                <CreateStudentModal groupId={group.id} />
            </div>

            <section className="space-y-3">
                <h2 className="font-semibold">Слушатели ({listeners.length})</h2>
                {listeners.length === 0 ? (
                    <p className="text-sm text-muted-foreground">В группе пока никого нет</p>
                ) : (
                    listeners.map((l) => <ListenerCard key={l.enrollmentId} listener={l} />)
                )}
            </section>
        </div>
    );
}