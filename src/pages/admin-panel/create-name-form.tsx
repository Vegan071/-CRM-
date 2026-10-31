"use client";

import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useExistsCheck } from "@/shared/lib/hooks/use-exists-check";
import type { ActionResult } from "@/shared/lib/pagination";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";

interface CreateNameFormProps<T> {
    id: string;
    title: string;
    label: string;
    placeholder: string;
    submitLabel: string;
    existsMessage: string;
    schema: z.ZodType<string, string>;
    check: (value: string) => Promise<boolean>;
    onSubmit: (value: string) => Promise<ActionResult<T>>;
    onCreated: (item: T) => void;
    successMessage: (item: T) => string;
}

export function CreateNameForm<T>({
                                      id,
                                      title,
                                      label,
                                      placeholder,
                                      submitLabel,
                                      existsMessage,
                                      schema,
                                      check,
                                      onSubmit,
                                      onCreated,
                                      successMessage,
                                  }: CreateNameFormProps<T>) {
    const formSchema = useMemo(() => z.object({ value: schema }), [schema]);
    const {
        register,
        handleSubmit,
        reset,
        watch,
        formState: { errors, isSubmitting },
    } = useForm<{ value: string }>({
        resolver: zodResolver(formSchema),
        defaultValues: { value: "" },
    });

    const { exists, isChecking } = useExistsCheck(watch("value"), check);

    const submit = handleSubmit(async ({ value }) => {
        const res = await onSubmit(value);
        if (!res.ok) {
            toast.error(res.error);
            return;
        }
        toast.success(successMessage(res.data));
        onCreated(res.data);
        reset();
    });

    return (
        <Card>
            <CardHeader>
                <CardTitle>{title}</CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={submit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor={id}>{label}</Label>
                        <Input id={id} placeholder={placeholder} autoComplete="off" {...register("value")} />
                        {errors.value ? (
                            <p className="text-sm text-destructive">{errors.value.message}</p>
                        ) : exists ? (
                            <p className="text-sm text-destructive">{existsMessage}</p>
                        ) : isChecking ? (
                            <p className="text-sm text-muted-foreground">Проверяем...</p>
                        ) : null}
                    </div>
                    <Button type="submit" disabled={isSubmitting || exists}>
                        {isSubmitting ? "Сохранение..." : submitLabel}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}