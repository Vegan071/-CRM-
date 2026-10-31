import { AppShell } from "@/widgets/app-shell";
import React from "react";

export default function MainLayout({ children }: { children: React.ReactNode }) {
    return <AppShell>{children}</AppShell>;
}