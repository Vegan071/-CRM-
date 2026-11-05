"use client";

import { ChevronDown } from "lucide-react";
import { Button } from "@/shared/ui/button";
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";

export type MultiSelectOption = { value: string; label: string; count?: number };

type Props = {
    label: string;
    options: MultiSelectOption[];
    selected: string[];
    onChange: (next: string[]) => void;
    className?: string;
};

/** Выпадающий список с несколькими отмеченными пунктами; меню не закрывается при выборе */
export function MultiSelect({ label, options, selected, onChange, className }: Props) {
    const toggle = (value: string) =>
        onChange(selected.includes(value) ? selected.filter((v) => v !== value) : [...selected, value]);

    return (
        <DropdownMenu>
            <DropdownMenuTrigger
                disabled={options.length === 0}
                render={<Button variant="outline" className={`h-10 justify-between gap-2 px-3 ${className ?? ""}`} />}
            >
                <span className="truncate">{label}</span>
                {selected.length > 0 && (
                    <span className="rounded-full bg-primary px-1.5 text-xs text-primary-foreground">
                        {selected.length}
                    </span>
                )}
                <ChevronDown className="size-4 text-muted-foreground" />
            </DropdownMenuTrigger>

            <DropdownMenuContent className="max-h-72 w-64">
                {options.map((o) => (
                    <DropdownMenuCheckboxItem
                        key={o.value}
                        checked={selected.includes(o.value)}
                        closeOnClick={false}
                        onCheckedChange={() => toggle(o.value)}
                    >
                        <span className="flex-1 truncate">{o.label}</span>
                        {o.count !== undefined && (
                            <span className="text-xs text-muted-foreground">{o.count}</span>
                        )}
                    </DropdownMenuCheckboxItem>
                ))}
                {selected.length > 0 && (
                    <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem closeOnClick={false} onClick={() => onChange([])}>
                            Сбросить выбор
                        </DropdownMenuItem>
                    </>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
