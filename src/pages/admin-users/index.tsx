import { UserRequestsTable } from "@/widgets/user-requests-table";

export function AdminUsersPage() {
    return (
        <div className="flex flex-col gap-4">
        <h1 className="text-xl font-semibold">Пользователи</h1>
            <UserRequestsTable />
            </div>
    );
}