"use client";

import { useId } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { searchCollegeGroups, searchTeachers } from "@/shared/api/options";
import { Button } from "@/shared/ui/button";
import {
    EntityForm,
    FieldRow,
    FormCheckbox,
    FormCombobox,
    FormInput,
    FormSelect,
} from "@/shared/ui/form";
import { GENDER_OPTIONS } from "@/entities/student/model/schema";
import { updateListener } from "../api/update-listener";
import {
    listenerEditSchema,
    PAY_METHOD_OPTIONS,
    type ListenerEditInput,
    type ListenerEditValues,
} from "../model/schema";
import type { ListenerDto } from "../model/types";

type Props = {
    listener: ListenerDto;
    /** Вызывается после сохранения или отмены */
    onDone: () => void;
};

/** Форма редактирования слушателя: данные студента, договор и способ оплаты */
export function ListenerEditForm({ listener: l, onDone }: Props) {
    const router = useRouter();
    const formId = useId();

    const form = useForm<ListenerEditInput, unknown, ListenerEditValues>({
        resolver: zodResolver(listenerEditSchema),
        defaultValues: {
            fullName: l.fullName,
            phone: l.phone ?? "",
            birthDate: l.birthDate ?? "",
            gender: l.gender ?? "",
            snils: l.snils ?? "",
            collegeGroupId: l.collegeGroup?.id ?? "",
            curatorId: l.curator?.id ?? "",
            isDpkStudent: l.isDpkStudent,
            medCertNumber: l.medCertNumber ?? "",
            medInstitution: l.medInstitution ?? "",
            payMethod: l.payMethod ?? "",
            contractNumber: l.contractNumber ?? "",
        },
    });

    async function onSubmit() {
        const res = await updateListener(l.enrollmentId, form.getValues());
        if (!res.ok) {
            toast.error(res.error);
            return;
        }
        toast.success("Изменения сохранены");
        onDone();
        router.refresh();
    }

    return (
        <>
            <EntityForm formId={formId} form={form} onSubmit={onSubmit}>
                <FormInput name="fullName" label="ФИО" />
                <FieldRow>
                    <FormInput name="phone" type="tel" label="Телефон" />
                    <FormInput name="birthDate" type="date" label="Дата рождения" />
                </FieldRow>
                <FieldRow>
                    <FormSelect name="gender" label="Пол" options={GENDER_OPTIONS} />
                    <FormInput name="snils" label="СНИЛС" />
                </FieldRow>
                <FieldRow>
                    <FormCombobox
                        name="collegeGroupId"
                        label="Группа студента"
                        fetchOptionsAction={searchCollegeGroups}
                        initialOption={
                            l.collegeGroup ? { value: l.collegeGroup.id, label: l.collegeGroup.name } : undefined
                        }
                        optional
                    />
                    <FormCombobox
                        name="curatorId"
                        label="Куратор"
                        fetchOptionsAction={searchTeachers}
                        initialOption={l.curator ? { value: l.curator.id, label: l.curator.fullName } : undefined}
                        optional
                    />
                </FieldRow>
                <FormCheckbox name="isDpkStudent" label="Студент ДПК" />
                <FieldRow>
                    <FormInput name="medCertNumber" label="Серия и № мед. справки" optional />
                    <FormInput name="medInstitution" label="Учреждение" optional />
                </FieldRow>
                <FieldRow>
                    <FormSelect
                        name="payMethod"
                        label="Способ оплаты"
                        placeholder="Не выбран"
                        options={PAY_METHOD_OPTIONS}
                    />
                    <FormInput name="contractNumber" label="№ договора" optional />
                </FieldRow>
            </EntityForm>
            <div className="flex justify-end gap-2">
                <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                        form.reset();
                        onDone();
                    }}
                >
                    Отмена
                </Button>
                <Button type="submit" form={formId} disabled={form.formState.isSubmitting}>
                    Сохранить
                </Button>
            </div>
        </>
    );
}
