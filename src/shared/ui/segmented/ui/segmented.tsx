"use client";

type SegmentedProps = {
    value: string;
    onChange: (value: string) => void;
    options: { value: string; label: string }[];
};

export function Segmented({ value, onChange, options }: SegmentedProps) {
    return (
        <div className="inline-flex overflow-hidden rounded-md border text-sm" role="group">
            {options.map((o) => (
                <button
                    key={o.value}
                    type="button"
                    aria-pressed={value === o.value}
                    onClick={() => onChange(o.value)}
                    className={`px-3 py-1.5 transition-colors ${
                        value === o.value ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                    }`}
                >
                    {o.label}
                </button>
            ))}
        </div>
    );
}
