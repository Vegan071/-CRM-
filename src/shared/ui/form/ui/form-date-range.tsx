"use client";

import { useFormContext } from "react-hook-form";
import { Input } from "@/shared/ui/input";
import { Field, FieldRow } from "./field";

type Props = {
    label: string;
    startName: string;
    endName: string;
    startLabel: string;
    endLabel: string;
};

export function FormDateRange({ label, startName, endName, startLabel, endLabel }: Props) {
    const {
        register,
        formState: { errors },
    } = useFormContext();
    const error = (errors[startName]?.message ?? errors[endName]?.message) as string | undefined;

    return (
        <Field label={label} error={error}>
            <FieldRow>
                <Input type="date" aria-label={startLabel} aria-invalid={!!errors[startName]} {...register(startName)} />
                <Input type="date" aria-label={endLabel} aria-invalid={!!errors[endName]} {...register(endName)} />
            </FieldRow>
        </Field>
    );
}