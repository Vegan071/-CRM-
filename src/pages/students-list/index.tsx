import { requireUser } from "@/shared/api/session";
import { listCollegeGroupOptions, listTeacherOptions } from "@/shared/api/select-options";
import { fetchStudents } from "@/features/students-list/api/actions";
import { StudentsList } from "@/features/students-list/ui/students-list";

export async function StudentsPage() {
    await requireUser();

    const [initialPage, collegeGroups, teachers] = await Promise.all([
        fetchStudents({ cursor: null, limit: 20, search: "" }),
        listCollegeGroupOptions(),
        listTeacherOptions(),
    ]);

    return (
        <div className="container mx-auto max-w-4xl space-y-6 py-8">
            <StudentsList initialPage={initialPage} collegeGroups={collegeGroups} teachers={teachers} />
        </div>
    );
}
