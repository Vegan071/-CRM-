"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/shared/api/db";
import { requireAdmin } from "@/shared/api/session";
import { logAction } from "@/shared/api/audit";

const schema = z.object({
    userId: z.string().min(1),
    status: z.enum(["ACTIVE", "REJECTED"]),
});

export async function setUserStatus(input: z.infer<typeof schema>) {
    const admin = await requireAdmin();
    const { userId, status } = schema.parse(input);

    if (userId === admin.id) {
        return { error: "Нельзя менять доступ самому себе" };
    }

    const target = await db.user.findUnique({ where: { id: userId }, select: { role: true } });
    if (!target) return { error: "Пользователь не найден" };
    if (target.role === "ADMIN") return { error: "Нельзя менять доступ администратора" };

    await db.user.update({ where: { id: userId }, data: { status } });

    // отклонённого сразу выкидываем из всех открытых сессий
    if (status === "REJECTED") {
        await db.session.deleteMany({ where: { userId } });
    }

    await logAction(admin.id, "User", userId, status === "ACTIVE" ? "APPROVE" : "REJECT");
    revalidatePath("/admin/users");
    return { error: null };
}