"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "@/shared/api/auth";
import { db } from "@/shared/api/db";
import { requireUser } from "@/shared/api/session";
import { logAction } from "@/shared/api/audit";

const schema = z.object({
    email: z.string().trim().toLowerCase().pipe(z.email()),
    password: z.string().min(1),
});

export async function changeEmail(input: { email: string; password: string }) {
    const user = await requireUser();

    const parsed = schema.safeParse(input);
    if (!parsed.success) return { error: "Проверьте введённые данные" };
    const { email, password } = parsed.data;

    if (email === user.email) return { error: "Это уже ваша почта" };

    try {
        await auth.api.verifyPassword({ body: { password }, headers: await headers() });
    } catch {
        return { error: "Неверный пароль" };
    }

    const taken = await db.user.findUnique({ where: { email }, select: { id: true } });
    if (taken) return { error: "Эта почта уже занята" };

    await db.user.update({ where: { id: user.id }, data: { email } });
    await logAction(user.id, "User", user.id, "UPDATE", { field: "email" });

    revalidatePath("/", "layout");
    return { error: null };
}