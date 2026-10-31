import "server-only";
import { db } from "@/shared/api/db";
import { requireAdmin } from "@/shared/api/session";

export async function getUsers() {
    await requireAdmin();
    return db.user.findMany({
        select: { id: true, name: true, email: true, role: true, status: true, createdAt: true },
        orderBy: { createdAt: "desc" },
    });
}