"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { FormProvider, useForm } from "react-hook-form";
import { toast } from "sonner";
import { searchStudentsForGroup } from "@/shared/api/options";
import { Button } from "@/shared/ui/button";
import { FormCombobox } from "@/shared/ui/form";
import { addListener } from "../api/add-listener";

export function AddListener({ groupId }: { groupId: string }) {
    const router = useRouter();
    const [resetKey, setResetKey] = useState(0); // пересоздаёт список, чтобы добавленный студент пропал из него
    const form = useForm<{ studentId: string }>({ defaultValues: { studentId: "" } });
    const fetchOptionsAction = useMemo(() => searchStudentsForGroup.bind(null, groupId), [groupId]);

    const onSubmit = form.handleSubmit(async ({ studentId }) => {
        if (!studentId) {
            form.setError("studentId", { message: "Выберите слушателя" });
            return;
        }
        const res = await addListener({ groupId, studentId });
        if (!res.ok) {
            toast.error(res.error);
            return;
        }
        toast.success("Слушатель добавлен");
        form.reset({ studentId: "" });
        setResetKey((k) => k + 1);
        router.refresh();
    });

    return (
        <FormProvider {...form}>
            <form onSubmit={onSubmit} className="flex items-end gap-3">
                <FormCombobox
                    key={resetKey}
                    name="studentId"
                    label="Добавить слушателя"
                    fetchOptionsAction={fetchOptionsAction}
                    placeholder="Найти студента по ФИО…"
                    className="flex-1"
                />
                <Button type="submit" disabled={form.formState.isSubmitting}>
                    Добавить
                </Button>
            </form>
        </FormProvider>
    );
}