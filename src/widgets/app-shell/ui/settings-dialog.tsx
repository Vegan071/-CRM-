"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/shared/ui/dialog/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs/tabs";
import { ThemeSwitch } from "@/features/theme-switch";
import { ProfileEditForm } from "@/features/profile-edit";
import { EmailChangeForm } from "@/features/email-change";
import { PasswordChangeForm } from "@/features/password-change";

type Props = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    user: { name: string; email: string; role: string };
};

export function SettingsDialog({ open, onOpenChange, user }: Props) {
    const isAdmin = user.role === "ADMIN";

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-xl">
                <DialogHeader>
                    <DialogTitle>Настройки</DialogTitle>
                    <DialogDescription>Профиль, внешний вид и безопасность</DialogDescription>
                </DialogHeader>

                <Tabs defaultValue="profile" className="mt-2">
                    <TabsList className="w-full">
                        <TabsTrigger value="profile">Профиль</TabsTrigger>
                        <TabsTrigger value="appearance">Вид</TabsTrigger>
                        <TabsTrigger value="security">Безопасность</TabsTrigger>
                        {isAdmin && <TabsTrigger value="admin">Админ</TabsTrigger>}
                    </TabsList>

                    <TabsContent value="profile" className="pt-4">
                        <ProfileEditForm name={user.name} />
                    </TabsContent>

                    <TabsContent value="appearance" className="pt-4">
                        <ThemeSwitch />
                    </TabsContent>

                    <TabsContent value="security" className="flex flex-col gap-8 pt-4">
                        <EmailChangeForm email={user.email} />
                        <div className="border-t pt-6">
                            <PasswordChangeForm />
                        </div>
                    </TabsContent>

                    {isAdmin && (
                        <TabsContent value="admin" className="flex flex-col gap-3 pt-4">
                            <Link
                                href="/admin/users"
                                onClick={() => onOpenChange(false)}
                                className="flex items-center justify-between rounded-lg border p-4 transition-colors hover:bg-accent"
                            >
                                <div>
                                    <p className="font-medium">Пользователи</p>
                                    <p className="text-sm text-muted-foreground">Заявки на доступ и блокировка</p>
                                </div>
                                <ChevronRight className="size-4 text-muted-foreground" />
                            </Link>
                            <Link
                                href="/admin"
                                onClick={() => onOpenChange(false)}
                                className="flex items-center justify-between rounded-lg border p-4 transition-colors hover:bg-accent"
                            >
                                <div>
                                    <p className="font-medium">Добавить сущность</p>
                                    <p className="text-sm text-muted-foreground">Добавить преподавателя или слушателя  </p>
                                </div>
                                <ChevronRight className="size-4 text-muted-foreground" />
                            </Link>
                            <div className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
                                Конструктор полей и другие настройки появятся здесь позже.
                            </div>
                        </TabsContent>
                    )}
                </Tabs>
            </DialogContent>
        </Dialog>
    );
}