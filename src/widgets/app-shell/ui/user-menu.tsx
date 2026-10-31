"use client";

import { useState } from "react";
import { ChevronDown, LogOut, Settings } from "lucide-react";
import { useLogout } from "@/features/auth-logout";
import { Avatar, AvatarFallback } from "@/shared/ui/avatar/avatar";
import { Badge } from "@/shared/ui/badge/badge";
import { Button } from "@/shared/ui/button/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu/dropdown-menu";
import { SettingsDialog } from "./settings-dialog";

type User = { name: string; email: string; role: string };

function getInitials(name: string) {
    return name
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((w) => w[0]?.toUpperCase())
        .join("");
}

export function UserMenu({ user }: { user: User }) {
    const [settingsOpen, setSettingsOpen] = useState(false);
    const logout = useLogout();

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger render={<Button variant="ghost" className="h-10 gap-2 px-2" />}>
                    <Avatar className="size-7">
                        <AvatarFallback className="text-xs">{getInitials(user.name)}</AvatarFallback>
                    </Avatar>
                    <span className="hidden max-w-32 truncate text-sm sm:inline">{user.name}</span>
                    <ChevronDown className="size-4 text-muted-foreground" />
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end" className="w-64">
                    <DropdownMenuGroup>
                        <DropdownMenuLabel className="flex flex-col gap-1.5 py-2">
                            <span className="truncate text-sm font-medium text-foreground">{user.name}</span>
                            <span className="truncate text-xs font-normal text-muted-foreground">{user.email}</span>
                            <Badge variant="secondary" className="w-fit">
                                {user.role === "ADMIN" ? "Администратор" : "Сотрудник"}
                            </Badge>
                        </DropdownMenuLabel>
                    </DropdownMenuGroup>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => setSettingsOpen(true)}>
                        <Settings className="size-4" />
                        Настройки
                    </DropdownMenuItem>
                    <DropdownMenuItem variant="destructive" onClick={logout}>
                        <LogOut className="size-4" />
                        Выйти
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            <SettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} user={user} />
        </>
    );
}