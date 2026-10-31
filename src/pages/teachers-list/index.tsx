import {
    CreateTeacherModal
} from "@/features/teacher-create";


export function TeachersPage() {
    return (
        <main className="">
            Преподаватели
            <CreateTeacherModal/>
        </main>
    );
}