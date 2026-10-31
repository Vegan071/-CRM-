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
} from "@/shared/ui/form";
import { teacherSchema, type TeacherFormInput, type TeacherFormValues } from "../model/schema";
import { searchTeachers } from "@/shared/api/options";
import {createTeacherContract} from "@/features/teacher-create/api/actions";
import {toast} from "sonner";

export function CreateTeacherForm({ formId, close }: ModalFormContext) {
    const form = useForm<TeacherFormInput, unknown, TeacherFormValues>({
        resolver: zodResolver(teacherSchema),
        defaultValues: {
            teacherId: "",
            contractNumber: "",
            conclusionDate: "",
            serviceStartDate: "",
            serviceEndDate: "",
            contractStartDate: "",
            contractEndDate: "",
        },
    });

    async function onSubmit() {
        const res = await createTeacherContract(form.getValues());
        if (!res.ok) {
            toast.error(res.error);
            return;
        }
        toast.success("Контракт создан");
        close();
    }
    return (
        <EntityForm formId={formId} form={form} onSubmit={onSubmit}>
            <FormCombobox
                name="teacherId"
                label="Преподаватель"
                fetchOptionsAction={searchTeachers}
                placeholder="Начните вводить ФИО…"
            />
            <FieldRow>
                <FormInput name="contractNumber" label="№ контракта" placeholder="№ 123/24" />
                <FormInput name="conclusionDate" type="date" label="Дата заключения" />
            </FieldRow>
            <FormDateRange
                label="Срок оказания услуг"
                startName="serviceStartDate"
                endName="serviceEndDate"
                startLabel="Дата начала оказания услуг"
                endLabel="Дата окончания оказания услуг"
            />
            <FormDateRange
                label="Срок действия контракта"
                startName="contractStartDate"
                endName="contractEndDate"
                startLabel="Дата начала действия контракта"
                endLabel="Дата окончания действия контракта"
            />
        </EntityForm>
    );
}