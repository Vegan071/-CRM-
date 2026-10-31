"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { authClient } from "@/shared/api/auth-client";
import { Button } from "@/shared/ui/button/button";
import { Input } from "@/shared/ui/input/input";
import { Label } from "@/shared/ui/label/label";
import {
    Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle,
} from "@/shared/ui/card/card";
import { registerSchema, type RegisterValues } from "../model/schema";

export function RegisterForm() {
    const router = useRouter();
    const [serverError, setServerError] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<RegisterValues>({ resolver: zodResolver(registerSchema) });

    async function onSubmit({ name, email, password }: RegisterValues) {
        setServerError(null);
        const { error } = await authClient.signUp.email({ name, email, password });
        if (error) {
            setServerError(error.message ?? "Не удалось отправить заявку");
            return;
        }
        router.push("/pending");
    }

    return (
        <Card className="w-full max-w-sm">
            <CardHeader>
                <CardTitle>Регистрация</CardTitle>
                <CardDescription>
                    После отправки заявку должен подтвердить администратор
                </CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit(onSubmit)} noValidate>
                <CardContent className="flex flex-col gap-4">
                    <div className="flex flex-col gap-2">
                        <Label htmlFor="name">Имя</Label>
                        <Input id="name" autoComplete="name" {...register("name")} />
                        {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
                    </div>
                    <div className="flex flex-col gap-2">
                        <Label htmlFor="email">Почта</Label>
                        <Input id="email" type="email" autoComplete="email" {...register("email")} />
                        {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
                    </div>
                    <div className="flex flex-col gap-2">
                        <Label htmlFor="password">Пароль</Label>
                        <Input id="password" type="password" autoComplete="new-password" {...register("password")} />
                        {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
                    </div>
                    <div className="flex flex-col gap-2">
                        <Label htmlFor="confirm">Повторите пароль</Label>
                        <Input id="confirm" type="password" autoComplete="new-password" {...register("confirm")} />
                        {errors.confirm && <p className="text-sm text-destructive">{errors.confirm.message}</p>}
                    </div>
                    {serverError && <p className="text-sm text-destructive">{serverError}</p>}
                </CardContent>
                <CardFooter className="mt-4 flex flex-col gap-3">
                    <Button type="submit" className="w-full" disabled={isSubmitting}>
                        {isSubmitting ? "Отправка…" : "Отправить заявку"}
                    </Button>
                    <p className="text-sm text-muted-foreground">
                        Уже есть аккаунт? <Link href="/login" className="underline">Войти</Link>
                    </p>
                </CardFooter>
            </form>
        </Card>
    );
}