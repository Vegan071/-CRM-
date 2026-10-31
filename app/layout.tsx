import type {Metadata} from "next";
import "@/app/styles/globals.css";
import {Providers} from "@/app/providers";
import React from "react";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";

export const metadata: Metadata = {
    title: "МФЦДО CRM система"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html
            lang="ru"
            className={`${GeistSans.variable} ${GeistMono.variable} h-full `}
            suppressHydrationWarning
        >
        <body className="min-h-full flex flex-col antialiased">
        <Providers>{children}</Providers>
        </body>
        </html>
    );
}
