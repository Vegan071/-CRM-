"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { authClient } from "@/shared/api/auth-client";
import { Button } from "@/shared/ui/button/button";
import { Input } from "@/shared/ui/input/input";
import { Label } from "@/shared/ui/label/label";

const schema = z.object({
    name: z.string().trim().min(2, "Минимум 2 символа").max(80, "Слишком длинное имя"),
});
type Values = z.infer<typeof schema>;

export function ProfileEditForm({ name }: { name: string }) {
    const router = useRouter();
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting, isDirty },
    } = useForm<Values>({ resolver: zodResolver(schema), defaultValues: { name } });

    async function onSubmit(values: Values) {
        const { error } = await authClient.updateUser({ name: values.name });
        if (error) return toast.error(error.message ?? "Не удалось сохранить");
        toast.success("Имя обновлено");
        reset(values);
        router.refresh();
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
            <div className="flex flex-col gap-2">
                <Label htmlFor="profile-name">Имя</Label>
                <Input id="profile-name" autoComplete="name" {...register("name")} />
                {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
            </div>
            <Button type="submit" className="self-start" disabled={!isDirty || isSubmitting}>
                {isSubmitting ? "Сохранение…" : "Сохранить"}
            </Button>
        </form>
    );
}