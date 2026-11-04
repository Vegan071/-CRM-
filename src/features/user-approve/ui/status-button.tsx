"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/shared/ui/button/button";
import { setUserStatus } from "../api/actions";

export function StatusButtons({ userId, status }: { userId: string; status: string }) {
    const [pending, start] = useTransition();

    const change = (next: "ACTIVE" | "REJECTED") =>
        start(async () => {
            const res = await setUserStatus({ userId, status: next });
            if (res.error) toast.error(res.error);
        });

    return (
        <div className="flex gap-2">
            {status !== "ACTIVE" && (
                <Button size="sm" disabled={pending} onClick={() => change("ACTIVE")}>
                    Принять
                </Button>
            )}
            {status !== "REJECTED" && (
                <Button size="sm" variant="outline" disabled={pending} onClick={() => change("REJECTED")}>
                    {status === "ACTIVE" ? "Заблокировать" : "Отклонить"}
                </Button>
            )}
        </div>
    );
}