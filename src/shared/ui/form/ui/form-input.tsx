"use client";

import { useId } from "react";
import { useFormContext } from "react-hook-form";
import { Input } from "@/shared/ui/input";
import { Field } from "./field";

type Props = Omit<React.ComponentProps<typeof Input>, "name"> & {
    name: string;
    label: string;
    optional?: boolean;
};

export function FormInput({ name, label, optional, className, ...inputProps }: Props) {
    const id = useId();
    const {
        register,
        formState: { errors },
    } = useFormContext();
    const error = errors[name]?.message as string | undefined;

    return (
        <Field label={label} htmlFor={id} optional={optional} error={error} className={className}>
            <Input id={id} aria-invalid={!!error} {...inputProps} {...register(name)} />
        </Field>
    );
}