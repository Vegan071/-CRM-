"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { ModalFormContext } from "@/shared/ui/entity-modal";
import {
    EntityForm,
    FieldRow,
    FormCombobox,
    FormDateRange,
    FormInput,
    FormSelect,
} from "@/shared/ui/form";
import {
    GROUP_STATUS_OPTIONS,
    groupSchema,
    type GroupFormInput,
    type GroupFormValues,
} from "../model/schema";
import {searchTeachers} from "@/shared/api/options";
import {createTrainingGroup} from "@/features/group-create/api/actions";
import {toast} from "sonner";
import {useRouter} from "next/navigation";


export function CreateGroupForm({ formId, close }: ModalFormContext) {
    const router = useRouter();
    const form = useForm<GroupFormInput, unknown, GroupFormValues>({
        resolver: zodResolver(groupSchema),
        defaultValues: {
            name: "",
            startDate: "",
            endDate: "",
            listenersCount: "",
            collegeStudentsCount: "",
            teacherId: "",
            masterId: "",
            pricePerListener: "",
            discountCount: "",
            totalPriceWithDiscount: "",
            status: "IN_PROGRESS",
        },
    });

    async function onSubmit() {
        const res = await createTrainingGroup(form.getValues());
        if (!res.ok) {
            toast.error(res.error);
            return;
        }
        toast.success(`Группа «${res.data.name}» создана`);
        close();
        router.refresh();
    }
    return (
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
                <FormInput name="listenersCount" type="number" min={0} label="Кол-во слушателей" placeholder="0" />
                <FormInput name="collegeStudentsCount" type="number" min={0} label="Студентов колледжа" placeholder="0" />
            </FieldRow>
            <FormCombobox name="teacherId" label="Преподаватель" fetchOptionsAction={searchTeachers} placeholder="Найти преподавателя" />
            <FormCombobox name="masterId" label="Мастер п/о" fetchOptionsAction={searchTeachers} placeholder="Найти мастера" optional />
            <FieldRow>
                <FormInput
                    name="pricePerListener"
                    type="number"
                    step="0.01"
                    min={0}
                    label="Стоимость за 1 чел. (₽)"
                    placeholder="0.00"
                />
                <FormInput name="discountCount" type="number" min={0} label="Скидки (чел.)" placeholder="0" />
            </FieldRow>
            <FormInput
                name="totalPriceWithDiscount"
                type="number"
                step="0.01"
                min={0}
                label="Стоимость группы со скидками (₽)"
                placeholder="0.00"
            />
            <FormSelect name="status" label="Статус" options={GROUP_STATUS_OPTIONS} />
        </EntityForm>
    );
}