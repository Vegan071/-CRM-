import { requireAdmin } from "@/shared/api/session";
import { GroupsPanel, TeachersPanel } from "./admin-panels";
import { listGroupsPage, listTeachersPage } from "./queries";

const FIRST_PAGE = { cursor: null, limit: 20, search: "" };

export default async function AdminPage() {
    await requireAdmin();

    const [groups, teachers] = await Promise.all([
        listGroupsPage(FIRST_PAGE),
        listTeachersPage(FIRST_PAGE),
    ]);

    return (
        <main className="container mx-auto max-w-4xl space-y-8 py-8">
            <h1 className="text-2xl font-bold">Админ-панель</h1>

            <div className="grid gap-8 md:grid-cols-2">
                <GroupsPanel initialPage={groups} />
                <TeachersPanel initialPage={teachers} />
            </div>
        </main>
    );
}

