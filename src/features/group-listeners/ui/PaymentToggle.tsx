"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { setListenerPaid } from "../api/set-listener-paid";
import { listenerStatus } from "../model/payment-status";
import type { ListenerDto } from "../model/types";

/** Быстрая отметка «Оплачено / Не оплачено» */
export function PaymentToggle({ listener: l }: { listener: ListenerDto }) {
    const router = useRouter();
    const [pending, startTransition] = useTransition();

    const isPaid = listenerStatus(l) === "PAID";

    function toggle() {
        startTransition(async () => {
            const res = await setListenerPaid(l.enrollmentId, !isPaid);
            if (!res.ok) {
                toast.error(res.error);
                return;
            }
            toast.success(isPaid ? "Оплата снята" : "Отмечено как оплачено");
            router.refresh();
        });
    }

    return (
        <div className="flex items-center justify-between rounded-md border px-3 py-2">
            <span className="text-sm font-medium">Оплата</span>
            <button
                type="button"
                role="switch"
                aria-checked={isPaid}
                disabled={pending}
                onClick={toggle}
                className={`rounded-full px-3 py-1 text-sm font-medium text-white transition-colors disabled:opacity-60 ${
                    isPaid ? "bg-green-600" : "bg-red-600"
                }`}
            >
                {isPaid ? "Оплачено" : "Не оплачено"}
            </button>
        </div>
    );
}
