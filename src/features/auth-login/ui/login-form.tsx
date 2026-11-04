"use client";

import { useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { authClient } from "@/shared/api/auth-client";
import { Button } from "@/shared/ui/button/button";
import { Input } from "@/shared/ui/input/input";
import { Label } from "@/shared/ui/label/label";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/shared/ui/card/card";
import { loginSchema, type LoginValues } from "../model/schema";

export function LoginForm() {
    const router = useRouter();
    const [serverError, setServerError] = useState<string | null>(null);

    // false на сервере и при гидрации, true после — кнопка неактивна, пока форма не «ожила»
    const ready = useSyncExternalStore(
        () => () => {},
        () => true,
        () => false,
    );

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<LoginValues>({ resolver: zodResolver(loginSchema) });

    async function onSubmit(values: LoginValues) {
        setServerError(null);
        const { error } = await authClient.signIn.email(values);
        if (error) {
            setServerError(
                error.status === 401
                    ? "Неверная почта или пароль"
                    : (error.message ?? "Не удалось войти"),
            );
            return;
        }
        router.replace("/");
        router.refresh();
    }

    return (
        <Card className="w-full max-w-sm">
            <CardHeader>
                <CardTitle>Вход</CardTitle>
            </CardHeader>
            <form method='post' onSubmit={handleSubmit(onSubmit)} noValidate>
                <CardContent className="flex flex-col gap-4">
                    <div className="flex flex-col gap-2">
                        <Label htmlFor="email">Почта</Label>
                        <Input id="email" type="email" autoComplete="email" {...register("email")} />
                        {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
                    </div>
                    <div className="flex flex-col gap-2">
                        <Label htmlFor="password">Пароль</Label>
                        <Input id="password" type="password" autoComplete="current-password" {...register("password")} />
                        {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
                    </div>
                    {serverError && <p className="text-sm text-destructive">{serverError}</p>}
                </CardContent>
                <CardFooter className="mt-4 flex flex-col gap-3">
                    <Button type="submit" className="w-full" disabled={!ready || isSubmitting}>
                        {isSubmitting ? "Вход…" : "Войти"}
                    </Button>
                    <p className="text-sm text-muted-foreground">
                        Нет аккаунта? <Link href="/register" className="underline">Подать заявку</Link>
                    </p>
                </CardFooter>
            </form>
        </Card>
    );
}