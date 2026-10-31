"use client";

import { useId } from "react";
import { Controller, useFormContext } from "react-hook-form";
import { Checkbox } from "@/shared/ui/checkbox";

export function FormCheckbox({ name, label }: { name: string; label: string }) {
    const id = useId();
    const { control } = useFormContext();

    return (
        <Controller
            control={control}
            name={name}
            render={({ field }) => (
                <div className="flex items-center gap-2 py-1">
                    <Checkbox id={id} checked={!!field.value} onCheckedChange={(checked) => field.onChange(checked === true)} />
                    <label htmlFor={id} className="cursor-pointer select-none text-xs font-medium text-muted-foreground">
                        {label}
                    </label>
                </div>
            )}
        />
    );
}