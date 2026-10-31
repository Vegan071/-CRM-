"use client";

import { useState } from "react";
import { Controller, useFormContext } from "react-hook-form";
import { useInfiniteList } from "@/shared/lib/hooks/use-infinite-list";
import type { Page, PageParams } from "@/shared/lib/pagination";
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
export type OptionItem = Option & { id: string };

type Props = {
    name: string;
    label: string;
    /** Серверный экшен поиска, например searchTeachers */
    fetchOptionsAction: (params: PageParams) => Promise<Page<OptionItem>>;
    /** Для форм редактирования: подпись уже выбранного значения, пока список не загружен */
    initialOption?: Option;
    placeholder?: string;
    emptyText?: string;
    optional?: boolean;
    className?: string;
};

export function FormCombobox({
                                 name,
                                 label,
                                 fetchOptionsAction,
                                 initialOption,
                                 placeholder = "Начните вводить…",
                                 emptyText = "Ничего не найдено",
                                 optional,
                                 className,
                             }: Props) {
    const {
        control,
        formState: { errors },
    } = useFormContext();
    const error = errors[name]?.message as string | undefined;

    const [opened, setOpened] = useState(false); // грузим только после первого открытия
    const [picked, setPicked] = useState<Option | null>(null);
    const list = useInfiniteList<OptionItem>({ fetchPage: fetchOptionsAction, enabled: opened });

    return (
        <Controller
            control={control}
            name={name}
            render={({ field }) => {
                const selected: Option | null = field.value
                    ? ([picked, ...list.items, initialOption].find((o) => o?.value === field.value) ?? null)
                    : null;

                // выбранный пункт должен оставаться в items, даже если поиск его отфильтровал
                const items: Option[] =
                    selected && !list.items.some((o) => o.value === selected.value)
                        ? [selected, ...list.items]
                        : list.items;

                return (
                    <Field label={label} optional={optional} error={error} className={className}>
                        <Combobox
                            items={items}
                            filter={null} // фильтрует сервер, а не компонент
                            value={selected}
                            onValueChange={(option: Option | null) => {
                                setPicked(option);
                                field.onChange(option?.value ?? "");
                            }}
                            onOpenChange={(open) => {
                                if (open) setOpened(true);
                            }}
                            onInputValueChange={(value, details) => {
                                // подпись выбранного пункта в поле не должна запускать поиск
                                if (details.reason === "input-change" || value === "") {
                                    list.setSearch(value);
                                }
                            }}
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
                                <ComboboxEmpty>{list.isLoading ? "Загрузка…" : emptyText}</ComboboxEmpty>
                                <ComboboxList
                                    onScroll={(e) => {
                                        const el = e.currentTarget;
                                        if (el.scrollHeight - el.scrollTop - el.clientHeight < 48) {
                                            void list.loadMore();
                                        }
                                    }}
                                >
                                    {(option: Option) => (
                                        <ComboboxItem key={option.value} value={option}>
                                            {option.label}
                                        </ComboboxItem>
                                    )}
                                </ComboboxList>
                                {list.isLoading && items.length > 0 && (
                                    <p className="px-3 py-2 text-sm text-muted-foreground">Загрузка…</p>
                                )}
                                {list.error && (
                                    <button
                                        type="button"
                                        className="w-full px-3 py-2 text-left text-sm text-destructive"
                                        onClick={() => void list.reload()}
                                    >
                                        Ошибка загрузки. Повторить
                                    </button>
                                )}
                            </ComboboxContent>
                        </Combobox>
                    </Field>
                );
            }}
        />
    );
}