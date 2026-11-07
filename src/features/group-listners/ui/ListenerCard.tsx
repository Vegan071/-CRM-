"use client";

import {useId, useState, useTransition} from "react";
import {useRouter} from "next/navigation";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {ChevronDown} from "lucide-react";
import {toast} from "sonner";
import {searchCollegeGroups, searchTeachers} from "@/shared/api/options";
import {paymentStatus, type PaymentStatus} from "@/shared/lib/money";
import {Button} from "@/shared/ui/button";
import {
    EntityForm,
    FieldRow,
    FormCheckbox,
    FormCombobox,
    FormInput,
    FormSelect
} from "@/shared/ui/form";
import {GENDER_OPTIONS} from "@/features/student-create/model/schema";
import {removeListener, setListenerPaid, updateListener} from "../api/actions";
import {
    listenerEditSchema,
    PAY_METHOD_OPTIONS,
    type ListenerEditInput,
    type ListenerEditValues,
} from "../model/schema";
import type {ListenerDto} from "../model/types";

const STATUS_LABEL: Record<PaymentStatus, string> = {
    UNPAID: "Не оплачено",
    PARTIAL: "Частично",
    PAID: "Оплачено",
};
const GENDER_LABEL = {MALE: "Мужской", FEMALE: "Женский"} as const;
const PAY_LABEL = {
    MATERNITY_CAPITAL: "Материнский капитал",
    INSTALLMENT: "Рассрочка"
} as const;
const STATUS_STYLE: Record<PaymentStatus, string> = {
    UNPAID: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300",
    PARTIAL: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
    PAID: "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300",
};

const fmtDate = (iso: string | null) => (iso ? iso.split("-").reverse().join(".") : "—");
const fmtSnils = (s: string | null) => {
    if (!s) return "";
    return /^\d{11}$/.test(s)
        ? `${s.slice(0, 3)}-${s.slice(3, 6)}-${s.slice(6, 9)} ${s.slice(9)}`
        : s;
};

function Detail({label, value}: { label: string; value: string }) {
    return (
        <div>
            <dt className="text-xs text-muted-foreground">{label}</dt>
            <dd className="text-sm">{value || "—"}</dd>
        </div>
    );
}

export function ListenerCard({listener: l}: { listener: ListenerDto }) {
    const router = useRouter();
    const formId = useId();
    const [open, setOpen] = useState(false);
    const [editing, setEditing] = useState(false);
    const [pending, startTransition] = useTransition();

    const status = paymentStatus(l.price, l.paid);
    const isPaid = status === "PAID";

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
        setEditing(false);
        router.refresh();
    }

    async function onDelete() {
        if (!confirm(`Убрать «${l.fullName}» из группы?`)) return;
        const res = await removeListener(l.enrollmentId);
        if (!res.ok) {
            toast.error(res.error);
            return;
        }
        toast.success("Слушатель удалён из группы");
        router.refresh();
    }

    function togglePaid() {
        startTransition(async () => {
            const res = await setListenerPaid(l.enrollmentId, !isPaid);
            if (!res.ok) {
                toast.error(res.error);
                return;
            }
            toast.success(isPaid ? "Оплата снята" : "Отмечено как оплачено");
            router.refresh();
        });
    }

    return (
        <div className="rounded-lg border">
            <button
                type="button"
                onClick={() => setOpen((o) => !o)}
                className="flex w-full items-center gap-3 px-4 py-3 text-left"
                aria-expanded={open}
            >
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-medium">
                    {l.position}
                </span>
                <span className="min-w-0 flex-1">
                    <span className="block truncate font-medium">{l.fullName}</span>
                    <span className="block truncate text-sm text-muted-foreground">
                        {[l.phone, l.collegeGroup?.name].filter(Boolean).join(" · ") || "—"}
                    </span>
                </span>
                <span
                    className={`hidden shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium sm:block ${STATUS_STYLE[status]}`}
                >
                    {STATUS_LABEL[status]}
                </span>
                <ChevronDown className={`size-4 shrink-0 transition-transform ${open ? "rotate-180" : ""}`}/>
            </button>

            {open && (
                <div className="space-y-4 border-t px-4 py-4">
                    {editing ? (
                        <>
                            <EntityForm formId={formId} form={form} onSubmit={onSubmit}>
                                <FormInput name="fullName" label="ФИО"/>
                                <FieldRow>
                                    <FormInput name="phone" type="tel" label="Телефон"/>
                                    <FormInput name="birthDate" type="date" label="Дата рождения"/>
                                </FieldRow>
                                <FieldRow>
                                    <FormSelect name="gender" label="Пол" options={GENDER_OPTIONS}/>
                                    <FormInput name="snils" label="СНИЛС"/>
                                </FieldRow>
                                <FieldRow>
                                    <FormCombobox
                                        name="collegeGroupId"
                                        label="Группа студента"
                                        fetchOptionsAction={searchCollegeGroups}
                                        initialOption={l.collegeGroup ? {
                                            value: l.collegeGroup.id,
                                            label: l.collegeGroup.name
                                        } : undefined}
                                        optional
                                    />
                                    <FormCombobox
                                        name="curatorId"
                                        label="Куратор"
                                        fetchOptionsAction={searchTeachers}
                                        initialOption={l.curator ? {
                                            value: l.curator.id,
                                            label: l.curator.fullName
                                        } : undefined}
                                        optional
                                    />
                                </FieldRow>
                                <FormCheckbox name="isDpkStudent" label="Студент ДПК"/>
                                <FieldRow>
                                    <FormInput name="medCertNumber" label="Серия и № мед. справки" optional/>
                                    <FormInput name="medInstitution" label="Учреждение" optional/>
                                </FieldRow>
                                <FieldRow>
                                    <FormSelect
                                        name="payMethod"
                                        label="Способ оплаты"
                                        placeholder="Не выбран"
                                        options={PAY_METHOD_OPTIONS}
                                    />
                                    <FormInput name="contractNumber" label="№ договора" optional/>
                                </FieldRow>
                            </EntityForm>
                            <div className="flex justify-end gap-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => {
                                        form.reset();
                                        setEditing(false);
                                    }}
                                >
                                    Отмена
                                </Button>
                                <Button type="submit" form={formId} disabled={form.formState.isSubmitting}>
                                    Сохранить
                                </Button>
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="flex items-center justify-between rounded-md border px-3 py-2">
                                <span className="text-sm font-medium">Оплата</span>
                                <button
                                    type="button"
                                    role="switch"
                                    aria-checked={isPaid}
                                    disabled={pending}
                                    onClick={togglePaid}
                                    className={`rounded-full px-3 py-1 text-sm font-medium text-white transition-colors disabled:opacity-60 ${
                                        isPaid ? "bg-green-600" : "bg-red-600"
                                    }`}
                                >
                                    {isPaid ? "Оплачено" : "Не оплачено"}
                                </button>
                            </div>

                            <dl className="grid grid-cols-2 gap-4 md:grid-cols-3">
                                <Detail label="ФИО" value={l.fullName}/>
                                <Detail label="СНИЛС" value={fmtSnils(l.snils)}/>
                                <Detail label="Дата рождения" value={fmtDate(l.birthDate)}/>
                                <Detail label="Пол" value={l.gender ? GENDER_LABEL[l.gender] : ""}/>
                                <Detail label="Телефон" value={l.phone ?? ""}/>
                                <Detail label="Группа студента" value={l.collegeGroup?.name ?? ""}/>
                                <Detail label="Куратор" value={l.curator?.fullName ?? ""}/>
                                <Detail label="Студент ДПК" value={l.isDpkStudent ? "Да" : "Нет"}/>
                                <Detail label="Мед. справка" value={l.medCertNumber ?? ""}/>
                                <Detail label="Учреждение" value={l.medInstitution ?? ""}/>
                                <Detail label="Способ оплаты" value={l.payMethod ? PAY_LABEL[l.payMethod] : ""}/>
                                <Detail label="№ договора" value={l.contractNumber ?? ""}/>
                                <Detail label="Зачислен" value={fmtDate(l.enrolledAt)}/>
                            </dl>

                            <div className="flex justify-end gap-2">
                                <Button type="button" variant="outline" onClick={() => setEditing(true)}>
                                    Редактировать
                                </Button>
                                <Button type="button" variant="outline" onClick={onDelete}>
                                    Удалить
                                </Button>
                            </div>
                        </>
                    )}
                </div>
            )}
        </div>
    );
}