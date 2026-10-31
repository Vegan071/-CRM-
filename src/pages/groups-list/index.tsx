import { CreateGroupModal } from "@/features/group-create";
import {requireUser} from "@/shared/api/session";
import { listGroupsPage, listTeacherOptions } from "@/features/group-listners/api/queries";
import {GroupsList} from "@/features/group-listners/ui/groups-list";


export default async function GroupsPage() {
    await requireUser();

    const [first, teachers] = await Promise.all([
        listGroupsPage({ page: 1, pageSize: 20 }),
        listTeacherOptions(),
    ]);

    return (
        <main className="container mx-auto max-w-4xl space-y-6 py-8">
            <CreateGroupModal />
            <GroupsList
                initialRows={first.rows}
                initialTotal={first.total}
                initialPages={first.pages}
                teachers={teachers}
            />
        </main>
    );
}