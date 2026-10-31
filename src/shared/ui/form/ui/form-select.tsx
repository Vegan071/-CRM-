"use client";

import { Controller, useFormContext } from "react-hook-form";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select";
import { Field } from "./field";
import type { Option } from "./form-combobox";

type Props = {
    name: string;
    label: string;
    options: readonly Option[];
    placeholder?: string;
    optional?: boolean;
    className?: string;
};

export function FormSelect({ name, label, options, placeholder = "Выберите…", optional, className }: Props) {
    const {
        control,
        formState: { errors },
    } = useFormContext();
    const error = errors[name]?.message as string | undefined;

    return (
        <Controller
            control={control}
            name={name}
            render={({ field }) => (
                <Field label={label} optional={optional} error={error} className={className}>
                    <Select
                        items={options}
                        value={field.value || null}
                        onValueChange={(value) => field.onChange(value ?? "")}
                    >
                        <SelectTrigger className="w-full" aria-invalid={!!error} onBlur={field.onBlur}>
                            <SelectValue placeholder={placeholder} />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectGroup>
                                {options.map((o) => (
                                    <SelectItem key={o.value} value={o.value}>
                                        {o.label}
                                    </SelectItem>
                                ))}
                            </SelectGroup>
                        </SelectContent>
                    </Select>
                </Field>
            )}
        />
    );
}