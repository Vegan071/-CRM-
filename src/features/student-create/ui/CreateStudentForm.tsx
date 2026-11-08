"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { ModalFormContext } from "@/shared/ui/entity-modal";
import {
    EntityForm,
    FieldRow,
    FormCheckbox,
    FormCombobox,
    FormInput,
    FormSelect,
} from "@/shared/ui/form";
import {
    GENDER_OPTIONS,
    studentSchema,
    type StudentFormInput,
    type StudentFormValues,
} from "@/entities/student/model/schema";
import { searchCollegeGroups, searchTeachers } from "@/shared/api/options";
import {createStudent} from "@/features/student-create/api/actions";
import {toast} from "sonner";

type Props = ModalFormContext & {
    /** Если задан — созданный слушатель сразу зачисляется в эту учебную группу */
    groupId?: string;
};

export function CreateStudentForm({ formId, close, groupId }: Props) {
    const router = useRouter();
    const form = useForm<StudentFormInput, unknown, StudentFormValues>({
        resolver: zodResolver(studentSchema),
        defaultValues: {
            fullName: "",
            phone: "",
            birthDate: "",
            gender: "",
            snils: "",
            collegeGroupId: "",
            curatorId: "",
            isDpkStudent: false,
            medCertNumber: "",
            medInstitution: "",
        },
    });

    async function onSubmit() {
        const res = await createStudent(form.getValues(), groupId);
        if (!res.ok) {
            toast.error(res.error);
            return;
        }
        toast.success(
            groupId
                ? `Слушатель «${res.data.fullName}» добавлен в группу`
                : `Студент «${res.data.fullName}» добавлен`,
        );
        close();
        router.refresh();
    }

    return (
        <EntityForm formId={formId} form={form} onSubmit={onSubmit}>
            <FormInput name="fullName" label="ФИО"
                       placeholder="Иванов Иван Иванович"/>
            <FieldRow>
                <FormInput name="phone" type="tel" label="Телефон"
                           placeholder="+7 (999) 000-00-00"/>
                <FormInput name="birthDate" type="date" label="Дата рождения"/>
            </FieldRow>
            <FieldRow>
                <FormSelect name="gender" label="Пол" placeholder="Выберите пол"
                            options={GENDER_OPTIONS}/>
                <FormInput name="snils" label="СНИЛС"
                           placeholder="000-000-000 00"/>
            </FieldRow>
            <FieldRow>
                <FormCombobox
                    name="collegeGroupId"
                    label="Группа"
                    fetchOptionsAction={searchCollegeGroups}
                    placeholder="Найти группу"
                    optional
                />
                <FormCombobox
                    name="curatorId"
                    label="Куратор"
                    fetchOptionsAction={searchTeachers}
                    placeholder="Найти куратора"
                    optional
                />
            </FieldRow>
            <FormCheckbox name="isDpkStudent" label="Студент ДПК"/>
            <FieldRow>
                <FormInput name="medCertNumber" label="Серия и № мед. справки"
                           placeholder="00 00 № 000000" optional/>
                <FormInput name="medInstitution" label="Учреждение"
                           placeholder="Наименование учреждения" optional/>
            </FieldRow>
        </EntityForm>
    );
}