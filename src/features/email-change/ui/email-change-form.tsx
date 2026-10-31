"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/shared/ui/button/button";
import { Input } from "@/shared/ui/input/input";
import { Label } from "@/shared/ui/label/label";
import { changeEmail } from "../api/actions";

const schema = z.object({
    email: z.string().trim().min(1, "Введите почту").email("Некорректная почта"),
    password: z.string().min(1, "Введите пароль для подтверждения"),
});
type Values = z.infer<typeof schema>;

export function EmailChangeForm({ email }: { email: string }) {
    const router = useRouter();
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<Values>({ resolver: zodResolver(schema), defaultValues: { email, password: "" } });

    async function onSubmit(values: Values) {
        const res = await changeEmail(values);
        if (res.error) return toast.error(res.error);
        toast.success("Почта обновлена");
        reset({ email: values.email, password: "" });
        router.refresh();
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
            <div className="flex flex-col gap-2">
                <Label htmlFor="email-new">Почта (логин)</Label>
                <Input id="email-new" type="email" autoComplete="email" {...register("email")} />
                {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
            </div>
            <div className="flex flex-col gap-2">
                <Label htmlFor="email-password">Пароль для подтверждения</Label>
                <Input id="email-password" type="password" autoComplete="current-password" {...register("password")} />
                {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
            </div>
            <Button type="submit" className="self-start" disabled={isSubmitting}>
                {isSubmitting ? "Сохранение…" : "Сменить почту"}
            </Button>
        </form>
    );
}