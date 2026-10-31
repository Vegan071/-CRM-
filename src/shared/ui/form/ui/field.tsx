import { cn } from "@/shared/lib/utils";

type FieldProps = {
    label: string;
    htmlFor?: string;
    optional?: boolean;
    error?: string;
    className?: string;
    children: React.ReactNode;
};

export function Field({ label, htmlFor, optional, error, className, children }: FieldProps) {
    return (
        <div className={cn("flex flex-col gap-1", className)}>
            <label htmlFor={htmlFor} className="text-xs font-medium text-muted-foreground">
                {label}
                {optional && <span className="ml-1 font-normal text-muted-foreground/70">(необязательно)</span>}
            </label>
            {children}
            {error && <p className="text-xs text-destructive">{error}</p>}
        </div>
    );
}

export function FieldRow({ children, className }: { children: React.ReactNode; className?: string }) {
    return <div className={cn("grid grid-cols-2 gap-2", className)}>{children}</div>;
}