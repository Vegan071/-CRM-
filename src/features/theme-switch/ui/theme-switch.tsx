"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/shared/ui/button/button";

const OPTIONS = [
    { value: "light", label: "Светлая", icon: Sun },
    { value: "dark", label: "Тёмная", icon: Moon },
    { value: "system", label: "Системная", icon: Monitor },
] as const;

export function ThemeSwitch() {
    const { theme, setTheme } = useTheme();

    return (
        <div className="grid grid-cols-3 gap-2">
            {OPTIONS.map(({ value, label, icon: Icon }) => (
                <Button
                    key={value}
                    type="button"
                    variant={theme === value ? "default" : "outline"}
                    className="h-auto flex-col gap-2 py-4"
                    onClick={() => setTheme(value)}
                >
                    <Icon className="size-5" />
                    {label}
                </Button>
            ))}
        </div>
    );
}