import Link from "next/link";
import {GraduationCap} from "lucide-react";
import {requireUser} from "@/shared/api/session";
import {MainNav} from "./main-nav";
import {UserMenu} from "./user-menu";

export async function AppShell({children}: { children: React.ReactNode }) {
    const user = await requireUser();

    return (
        <div className="min-h-screen bg-background">
            <header
                className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div
                    className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
                    <div className="flex items-center gap-6">
                        <Link href="/"
                              className="flex items-center gap-2 font-semibold">
              <span
                  className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <GraduationCap className="size-4"/>
              </span>
                            <span
                                className="hidden sm:inline">МФЦДО CRM система
                            </span>
                        </Link>
                        <MainNav isAdmin={user.role === "ADMIN"}/>
                    </div>
                    <UserMenu user={{
                        name: user.name,
                        email: user.email,
                        role: user.role
                    }}/>
                </div>
            </header>
            <main className="mx-auto max-w-7xl p-4 sm:p-6">{children}</main>
        </div>
    );
}