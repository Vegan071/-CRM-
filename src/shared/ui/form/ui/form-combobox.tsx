// form-combobox.tsx — выпадающий список с поиском
"use client";

import { Controller, useFormContext } from "react-hook-form";
import {
    Combobox,
    ComboboxContent,
    ComboboxEmpty,
    ComboboxInput,
    ComboboxItem,
    ComboboxList,
} from "@/shared/ui/combobox";
import { Field } from "./field";

export type Option = { value: string; label: string };

type Props = {
    name: string;
    label: string;
    options: readonly Option[];
    placeholder?: string;
    emptyText?: string;
    optional?: boolean;
    className?: string;
};

export function FormCombobox({
                                 name,
                                 label,
                                 options,
                                 placeholder = "Начните вводить ФИО…",
                                 emptyText = "Ничего не найдено",
                                 optional,
                                 className,
                             }: Props) {
    const {
        control,
        formState: { errors },
    } = useFormContext();
    const error = errors[name]?.message as string | undefined;

    return (
        <Controller
            control={control}
            name={name}
            render={({ field }) => {
                const selected = options.find((o) => o.value === field.value) ?? null;

                return (
                    <Field label={label} optional={optional} error={error} className={className}>
                        <Combobox
                            items={options}
                            value={selected}
                            onValueChange={(option: Option | null) => field.onChange(option?.value ?? "")}
                            itemToStringLabel={(option: Option) => option.label}
                            isItemEqualToValue={(a: Option, b: Option) => a.value === b.value}
                        >
                            <ComboboxInput
                                placeholder={placeholder}
                                showClear={optional}
                                aria-invalid={!!error}
                                onBlur={field.onBlur}
                            />
                            <ComboboxContent>
                                <ComboboxEmpty>{emptyText}</ComboboxEmpty>
                                <ComboboxList>
                                    {(option: Option) => (
                                        <ComboboxItem key={option.value} value={option}>
                                            {option.label}
                                        </ComboboxItem>
                                    )}
                                </ComboboxList>
                            </ComboboxContent>
                        </Combobox>
                    </Field>
                );
            }}
        />
    );
}