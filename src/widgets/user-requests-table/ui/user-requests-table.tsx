import { getUsers } from "@/entities/user";
import { StatusButtons } from "@/features/user-approve";
import { Badge } from "@/shared/ui/badge/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/ui/table/table";

const LABEL = { PENDING: "Ожидает", ACTIVE: "Активен", REJECTED: "Отклонён" } as const;

export async function UserRequestsTable() {
    const users = await getUsers();

    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Имя</TableHead>
                    <TableHead>Почта</TableHead>
                    <TableHead>Статус</TableHead>
                    <TableHead>Дата заявки</TableHead>
                    <TableHead />
                </TableRow>
            </TableHeader>
            <TableBody>
                {users.map((u) => (
                    <TableRow key={u.id}>
                        <TableCell>{u.name}{u.role === "ADMIN" && " (админ)"}</TableCell>
                        <TableCell>{u.email}</TableCell>
                        <TableCell>
                            <Badge variant={u.status === "PENDING" ? "default" : "secondary"}>
                                {LABEL[u.status]}
                            </Badge>
                        </TableCell>
                        <TableCell>{u.createdAt.toLocaleDateString("ru-RU")}</TableCell>
                        <TableCell>
                            {u.role !== "ADMIN" && <StatusButtons userId={u.id} status={u.status} />}
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
}