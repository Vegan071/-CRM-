"use client";

import { ThemeProvider } from "next-themes";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { Toaster } from "@/shared/ui/sonner/sonner";

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
            <NuqsAdapter>{children}</NuqsAdapter>
            <Toaster richColors position="top-right" />
        </ThemeProvider>
    );
}