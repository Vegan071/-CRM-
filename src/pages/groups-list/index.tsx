import { CreateGroupModal } from "@/features/group-create";
import { requireUser } from "@/shared/api/session";
import { listTeacherOptions } from "@/shared/api/select-options";
import { fetchGroups } from "@/features/group-listners/api/actions";
import { GroupsList } from "@/features/group-listners/ui/groups-list";

export default async function GroupsPage() {
    await requireUser();

    const [initialPage, teachers] = await Promise.all([
        fetchGroups({ cursor: null, limit: 20, search: "" }),
        listTeacherOptions(),
    ]);

    return (
        <div className="container mx-auto max-w-4xl space-y-6 py-8">
            <CreateGroupModal />
            <GroupsList initialPage={initialPage} teachers={teachers} />
        </div>
    );
}
