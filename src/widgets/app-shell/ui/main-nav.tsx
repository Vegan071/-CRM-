"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { GraduationCap, LayoutGrid, NotebookPen } from "lucide-react";
import { cn } from "@/shared/lib/utils";

export function MainNav() {
    const pathname = usePathname() ?? "";

    const links = [
        {
            href: "/",
            label: "Группы",
            icon: LayoutGrid,
            active: pathname === "/" || pathname.startsWith("/groups"),
        },
        {
            href: "/students",
            label: "Слушатели",
            icon: GraduationCap,
            active: pathname === "/students" || pathname.startsWith("/students/"),
        },
        {
            href: "/teachers",
            label: "Преподаватели",
            icon: NotebookPen,
            active: pathname === "/teachers" || pathname.startsWith("/teachers/"),
        },
    ];

    return (
        <nav className="flex items-center gap-1">
            {links.map(({ href, label, icon: Icon, active }) => (
                <Link
                    key={href}
                    href={href}
                    className={cn(
                        "inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                        active
                            ? "bg-accent text-accent-foreground"
                            : "text-muted-foreground hover:bg-accent/50 hover:text-foreground",
                    )}
                >
                    <Icon className="size-4" />
                    <span className="hidden sm:inline">{label}</span>
                </Link>
            ))}
        </nav>
    );
}