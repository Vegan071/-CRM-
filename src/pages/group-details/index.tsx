import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/shared/api/session";
import { formatDate } from "@/shared/lib/date";
import { getGroup } from "@/entities/group/api/get-group";
import { GroupDetails } from "@/features/group-edit";
import { getGroupListeners } from "@/features/group-listeners/api/get-listeners";
import { AddListener, ListenersPanel } from "@/features/group-listeners";
import { CreateStudentModal } from "@/features/student-create";

export default async function GroupPage({ params }: { params: Promise<{ id: string }> }) {
    await requireUser();
    const { id } = await params;

    const [group, listeners] = await Promise.all([getGroup(id), getGroupListeners(id)]);
    if (!group) notFound();

    return (
        <div className="container mx-auto max-w-4xl space-y-6 py-8">
            <div>
                <Link href="/" className="text-sm text-muted-foreground hover:underline">
                    ← Все группы
                </Link>
                <h1 className="mt-1 text-2xl font-bold">{group.name}</h1>
                <p className="text-sm text-muted-foreground">
                    {formatDate(group.startDate, "…")} — {formatDate(group.endDate, "…")}
                </p>
            </div>

            <GroupDetails group={group} />

            <div className="flex flex-wrap items-end gap-3">
                <div className="min-w-60 flex-1">
                    <AddListener groupId={group.id} />
                </div>
                <CreateStudentModal groupId={group.id} />
            </div>

            <ListenersPanel listeners={listeners} />
        </div>
    );
}
