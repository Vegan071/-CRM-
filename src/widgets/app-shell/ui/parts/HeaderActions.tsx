"use client";

import Link from "next/link";
import { useTheme } from "next-themes";
import {
    Users,
    UserCircle,
    ChevronRight,
    ShieldCheck,
    Moon,
    Sun,
    Monitor,
    LogOut,
} from "lucide-react";

import { LogoutButton } from "@/features/auth-logout";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/shared/ui/dialog/dialog";
import { Button } from "@/shared/ui/button/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/ui/avatar/avatar";

interface HeaderActionsProps {
    user: {
        name: string;
        role: string;
        email?: string;
    };
}

export function HeaderActions({ user }: HeaderActionsProps) {
    const { setTheme, theme } = useTheme();

    // Получаем первую букву имени для аватарки
    const initials = user.name ? user.name.charAt(0).toUpperCase() : "U";

    return (
        <div className="flex items-center gap-2 sm:gap-4">
            {/* Информация о пользователе (десктоп) */}
            <div className="hidden sm:flex items-center gap-3 mr-2">
                <div className="flex flex-col items-end">
                    <p className="text-sm font-medium leading-none">{user.name}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                        {user.role === "ADMIN" ? "Администратор" : "Пользователь"}
                    </p>
                </div>
            </div>

            <Dialog>
                <DialogTrigger >
                    <Button variant="ghost" className="relative h-10 w-10 rounded-full hover:bg-transparent" aria-label="Настройки профиля">
                        <Avatar className="h-10 w-10 border border-border shadow-sm transition-transform hover:scale-105">
                            <AvatarImage src="" alt={user.name} />
                            <AvatarFallback className="bg-muted font-medium text-foreground">
                                {initials}
                            </AvatarFallback>
                        </Avatar>
                    </Button>
                </DialogTrigger>

                <DialogContent className="sm:max-w-[425px] p-0 overflow-hidden gap-0">
                    <DialogHeader className="p-6 pb-5 border-b bg-muted/20">
                        <div className="flex items-center gap-4">
                            <Avatar className="h-14 w-14 border-2 border-primary/20">
                                <AvatarFallback className="text-xl bg-primary/10 text-primary font-semibold">
                                    {initials}
                                </AvatarFallback>
                            </Avatar>
                            <div>
                                <DialogTitle className="text-xl">{user.name}</DialogTitle>
                                {user.email && (
                                    <p className="text-sm text-muted-foreground mt-1">{user.email}</p>
                                )}
                                <p className="text-xs font-medium text-primary mt-1 inline-flex items-center rounded-md bg-primary/10 px-2 py-0.5">
                                    {user.role === "ADMIN" ? "Администратор" : "Пользователь"}
                                </p>
                            </div>
                        </div>
                    </DialogHeader>

                    <div className="p-4 space-y-5">
                        {/* Секция Аккаунт */}
                        <div className="space-y-2">
                            <h4 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground px-2">
                                Настройки аккаунта
                            </h4>
                            <Link href="/settings/profile" className="block outline-none">
                                <Button variant="ghost" className="w-full justify-start h-auto p-3 hover:bg-muted/60 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 group">
                                    <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground group-hover:text-foreground transition-colors mr-3">
                                        <UserCircle className="size-5" />
                                    </div>
                                    <div className="flex flex-col items-start flex-1 text-left">
                                        <span className="text-sm font-medium">Мой профиль</span>
                                        <span className="text-xs text-muted-foreground mt-0.5">Личные данные и безопасность</span>
                                    </div>
                                    <ChevronRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                                </Button>
                            </Link>
                        </div>

                        {/* Секция Внешний вид */}
                        <div className="space-y-2">
                            <h4 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground px-2">
                                Внешний вид
                            </h4>
                            <div className="flex items-center justify-between p-3 rounded-xl border border-border/50 bg-muted/20">
                                <div className="flex items-center gap-3">
                                    <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-background border border-border/50 shadow-sm text-muted-foreground">
                                        <Sun className="size-5 dark:hidden" />
                                        <Moon className="size-5 hidden dark:block" />
                                    </div>
                                    <span className="text-sm font-medium">Тема оформления</span>
                                </div>

                                <DropdownMenu>
                                    <DropdownMenuTrigger >
                                        <Button variant="outline" size="sm" className="h-8 gap-2 bg-background">
                                            {theme === 'light' && <><Sun className="h-3.5 w-3.5"/> Светлая</>}
                                            {theme === 'dark' && <><Moon className="h-3.5 w-3.5"/> Темная</>}
                                            {theme === 'system' && <><Monitor className="h-3.5 w-3.5"/> Системная</>}
                                            {!theme && "Загрузка..."}
                                            <span className="sr-only">Выбрать тему</span>
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-40">
                                        <DropdownMenuItem onClick={() => setTheme("light")} className="gap-2 cursor-pointer">
                                            <Sun className="h-4 w-4 text-muted-foreground" /> Светлая
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => setTheme("dark")} className="gap-2 cursor-pointer">
                                            <Moon className="h-4 w-4 text-muted-foreground" /> Темная
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => setTheme("system")} className="gap-2 cursor-pointer">
                                            <Monitor className="h-4 w-4 text-muted-foreground" /> Системная
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </div>

                        {/* Секция Администрирование */}
                        {user.role === "ADMIN" && (
                            <div className="space-y-2">
                                <h4 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground px-2 flex items-center gap-1.5">
                                    <ShieldCheck className="h-3.5 w-3.5 text-destructive/80" /> Администрирование
                                </h4>
                                <Link href="/admin/users" className="block outline-none">
                                    <Button variant="ghost" className="w-full justify-start h-auto p-3 hover:bg-muted/60 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 group">
                                        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground group-hover:text-foreground transition-colors mr-3">
                                            <Users className="size-5" />
                                        </div>
                                        <div className="flex flex-col items-start flex-1 text-left">
                                            <span className="text-sm font-medium">Пользователи</span>
                                            <span className="text-xs text-muted-foreground mt-0.5">Управление ролями и доступами</span>
                                        </div>
                                        <ChevronRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                                    </Button>
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Кнопка выхода */}
                    <div className="p-4 border-t bg-muted/20">
                        <div className="w-full relative">
                            {/* Выравниваем иконку поверх дефолтной кнопки LogoutButton (предполагая, что LogoutButton рендерит форму с кнопкой) */}
                            <div className="absolute left-3 top-1/2 -translate-y-1/2 z-10 pointer-events-none text-destructive/80">
                                <LogOut className="h-4 w-4" />
                            </div>
                            <div className="[&>form>button]:w-full [&>form>button]:justify-start [&>form>button]:pl-10 [&>form>button]:bg-destructive/10 [&>form>button]:text-destructive [&>form>button]:hover:bg-destructive/20">
                                <LogoutButton />
                            </div>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}