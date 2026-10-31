// src/features/password-change/ui/password-change-form.tsx
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { authClient } from "@/shared/api/auth-client";
import { Button } from "@/shared/ui/button/button";
import { Input } from "@/shared/ui/input/input";
import { Label } from "@/shared/ui/label/label";

const schema = z
    .object({
        currentPassword: z.string().min(1, "Введите текущий пароль"),
        newPassword: z.string().min(8, "Минимум 8 символов"),
        confirm: z.string(),
    })
    .refine((v) => v.newPassword === v.confirm, { path: ["confirm"], message: "Пароли не совпадают" });
type Values = z.infer<typeof schema>;

export function PasswordChangeForm() {
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<Values>({ resolver: zodResolver(schema) });

    async function onSubmit({ currentPassword, newPassword }: Values) {
        const { error } = await authClient.changePassword({
            currentPassword,
            newPassword,
            revokeOtherSessions: true, // выйти на всех остальных устройствах
        });
        if (error) {
            return toast.error(error.status === 400 ? "Неверный текущий пароль" : (error.message ?? "Не удалось сменить пароль"));
        }
        toast.success("Пароль изменён");
        reset();
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
            <div className="flex flex-col gap-2">
                <Label htmlFor="pw-current">Текущий пароль</Label>
                <Input id="pw-current" type="password" autoComplete="current-password" {...register("currentPassword")} />
                {errors.currentPassword && <p className="text-sm text-destructive">{errors.currentPassword.message}</p>}
            </div>
            <div className="flex flex-col gap-2">
                <Label htmlFor="pw-new">Новый пароль</Label>
                <Input id="pw-new" type="password" autoComplete="new-password" {...register("newPassword")} />
                {errors.newPassword && <p className="text-sm text-destructive">{errors.newPassword.message}</p>}
            </div>
            <div className="flex flex-col gap-2">
                <Label htmlFor="pw-confirm">Повторите новый пароль</Label>
                <Input id="pw-confirm" type="password" autoComplete="new-password" {...register("confirm")} />
                {errors.confirm && <p className="text-sm text-destructive">{errors.confirm.message}</p>}
            </div>
            <Button type="submit" className="self-start" disabled={isSubmitting}>
                {isSubmitting ? "Сохранение…" : "Сменить пароль"}
            </Button>
        </form>
    );
}