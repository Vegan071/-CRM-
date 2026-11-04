import { requireUser } from "@/shared/api/session";
import { fetchTeachers } from "@/features/teachers-list/api/actions";
import { TeachersList } from "@/features/teachers-list/ui/teachers-list";

export async function TeachersPage() {
    await requireUser();

    const initialPage = await fetchTeachers({ cursor: null, limit: 20, search: "" });

    return (
        <div className="container mx-auto max-w-4xl space-y-6 py-8">
            <TeachersList initialPage={initialPage} />
        </div>
    );
}
