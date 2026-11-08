"use client";

export const inputCls = "h-10 rounded-md border bg-background px-3 text-sm";

type SearchInputProps = {
    value: string;
    onChange: (value: string) => void;
    placeholder: string;
    className?: string;
};

export function SearchInput({ value, onChange, placeholder, className = "min-w-60 flex-1" }: SearchInputProps) {
    return (
        <input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className={`${inputCls} ${className}`}
        />
    );
}

export type FilterOption = { value: string; label: string };

type FilterSelectProps = {
    value: string;
    onChange: (value: string) => void;
    /** Подпись пункта «все» (пустое значение) */
    allLabel: string;
    options: FilterOption[];
};

export function FilterSelect({ value, onChange, allLabel, options }: FilterSelectProps) {
    return (
        <select className={inputCls} value={value} onChange={(e) => onChange(e.target.value)}>
            <option value="">{allLabel}</option>
            {options.map((o) => (
                <option key={o.value} value={o.value}>
                    {o.label}
                </option>
            ))}
        </select>
    );
}
