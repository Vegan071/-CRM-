"use client";

import { useId, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronDown } from "lucide-react";
import { toast } from "sonner";
import { searchTeachers } from "@/shared/api/options";
import { Button } from "@/shared/ui/button";
import { EntityForm, FieldRow, FormCombobox, FormDateRange, FormInput, FormSelect } from "@/shared/ui/form";
import {
    GROUP_STATUS_OPTIONS,
    groupSchema,
    type GroupFormInput,
    type GroupFormValues,
} from "@/features/group-create/model/schema";
import type { GroupDto } from "@/features/group-listners/model/types";
import { updateGroup } from "../api/actions";

const rub = (kopecks: number | null) => (kopecks === null ? "" : (kopecks / 100).toFixed(2));

const toFormValues = (g: GroupDto): GroupFormInput => ({
    name: g.name,
    startDate: g.startDate ?? "",
    endDate: g.endDate ?? "",
    listenersCount: String(g.listenersCount),
    collegeStudentsCount: String(g.collegeStudentsCount),
    teacherId: g.teacher?.id ?? "",
    masterId: g.master?.id ?? "",
    pricePerListener: rub(g.price),
    discountCount: String(g.discountCount),
    totalPriceWithDiscount: rub(g.totalPrice),
    status: g.status,
});

export function GroupDetails({ group }: { group: GroupDto }) {
    const router = useRouter();
    const formId = useId();
    const [open, setOpen] = useState(false);

    const form = useForm<GroupFormInput, unknown, GroupFormValues>({
        resolver: zodResolver(groupSchema),
        defaultValues: toFormValues(group),
    });

    async function onSubmit() {
        const values = form.getValues();
        const res = await updateGroup(group.id, values);
        if (!res.ok) {
            toast.error(res.error);
            return;
        }
        toast.success("Параметры группы сохранены");
        form.reset(values); // новые значения становятся исходными для «Отмены»
        router.refresh();
    }

    return (
        <section className="rounded-lg border">
            <button
                type="button"
                onClick={() => setOpen((o) => !o)}
                className="flex w-full items-center justify-between px-4 py-3 text-left font-semibold"
                aria-expanded={open}
            >
                Детали группы
                <ChevronDown className={`size-4 shrink-0 transition-transform ${open ? "rotate-180" : ""}`} />
            </button>

            {/* скрываем, а не размонтируем: несохранённые правки не теряются при сворачивании */}
            <div hidden={!open} className="space-y-4 border-t px-4 py-4">
                <EntityForm formId={formId} form={form} onSubmit={onSubmit}>
                    <FormInput name="name" label="Название" placeholder="Например: Группа 101-А" />
                    <FormDateRange
                        label="Срок обучения"
                        startName="startDate"
                        endName="endDate"
                        startLabel="Дата начала"
                        endLabel="Дата окончания"
                    />
                    <FieldRow>
                        <FormInput name="listenersCount" type="number" min={0} label="Кол-во слушателей" />
                        <FormInput name="collegeStudentsCount" type="number" min={0} label="Студентов колледжа" />
                    </FieldRow>
                    <FormCombobox
                        name="teacherId"
                        label="Преподаватель"
                        fetchOptionsAction={searchTeachers}
                        initialOption={
                            group.teacher ? { value: group.teacher.id, label: group.teacher.fullName } : undefined
                        }
                        placeholder="Найти преподавателя"
                    />
                    <FormCombobox
                        name="masterId"
                        label="Мастер п/о"
                        fetchOptionsAction={searchTeachers}
                        initialOption={
                            group.master ? { value: group.master.id, label: group.master.fullName } : undefined
                        }
                        placeholder="Найти мастера"
                        optional
                    />
                    <FieldRow>
                        <FormInput
                            name="pricePerListener"
                            type="number"
                            step="0.01"
                            min={0}
                            label="Стоимость за 1 чел. (₽)"
                        />
                        <FormInput name="discountCount" type="number" min={0} label="Скидки (чел.)" />
                    </FieldRow>
                    <FormInput
                        name="totalPriceWithDiscount"
                        type="number"
                        step="0.01"
                        min={0}
                        label="Стоимость группы со скидками (₽)"
                    />
                    <FormSelect name="status" label="Статус" options={GROUP_STATUS_OPTIONS} />
                </EntityForm>

                <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => form.reset()}>
                        Отмена
                    </Button>
                    <Button type="submit" form={formId} disabled={form.formState.isSubmitting}>
                        Сохранить
                    </Button>
                </div>
            </div>
        </section>
    );
}
