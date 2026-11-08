"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/shared/ui/button";
import { removeListener } from "../api/remove-listener";
import { buildListenerFields } from "../model/detail-fields";
import type { ListenerDto } from "../model/types";
import { PaymentToggle } from "./PaymentToggle";

function Detail({ label, value }: { label: string; value: string }) {
    return (
        <div>
            <dt className="text-xs text-muted-foreground">{label}</dt>
            <dd className="text-sm">{value || "—"}</dd>
        </div>
    );
}

type Props = {
    listener: ListenerDto;
    onEdit: () => void;
};

/** Просмотр карточки слушателя: оплата, поля, кнопки «Редактировать» и «Удалить» */
export function ListenerDetails({ listener: l, onEdit }: Props) {
    const router = useRouter();

    async function onDelete() {
        if (!confirm(`Убрать «${l.fullName}» из группы?`)) return;
        const res = await removeListener(l.enrollmentId);
        if (!res.ok) {
            toast.error(res.error);
            return;
        }
        toast.success("Слушатель удалён из группы");
        router.refresh();
    }

    return (
        <>
            <PaymentToggle listener={l} />

            <dl className="grid grid-cols-2 gap-4 md:grid-cols-3">
                {buildListenerFields(l).map((f) => (
                    <Detail key={f.label} label={f.label} value={f.value} />
                ))}
            </dl>

            <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={onEdit}>
                    Редактировать
                </Button>
                <Button type="button" variant="outline" onClick={onDelete}>
                    Удалить
                </Button>
            </div>
        </>
    );
}
