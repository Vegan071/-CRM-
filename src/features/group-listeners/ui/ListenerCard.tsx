"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { listenerStatus, PAYMENT_STATUS_LABEL, PAYMENT_STATUS_STYLE } from "../model/payment-status";
import type { ListenerDto } from "../model/types";
import { ListenerDetails } from "./ListenerDetails";
import { ListenerEditForm } from "./ListenerEditForm";

/** Сворачиваемая карточка слушателя: заголовок + просмотр или редактирование */
export function ListenerCard({ listener: l }: { listener: ListenerDto }) {
    const [open, setOpen] = useState(false);
    const [editing, setEditing] = useState(false);

    const status = listenerStatus(l);

    return (
        <div className="rounded-lg border">
            <button
                type="button"
                onClick={() => setOpen((o) => !o)}
                className="flex w-full items-center gap-3 px-4 py-3 text-left"
                aria-expanded={open}
            >
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-medium">
                    {l.position}
                </span>
                <span className="min-w-0 flex-1">
                    <span className="block truncate font-medium">{l.fullName}</span>
                    <span className="block truncate text-sm text-muted-foreground">
                        {[l.phone, l.collegeGroup?.name].filter(Boolean).join(" · ") || "—"}
                    </span>
                </span>
                <span
                    className={`hidden shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium sm:block ${PAYMENT_STATUS_STYLE[status]}`}
                >
                    {PAYMENT_STATUS_LABEL[status]}
                </span>
                <ChevronDown className={`size-4 shrink-0 transition-transform ${open ? "rotate-180" : ""}`} />
            </button>

            {/* при сворачивании форма редактирования остаётся смонтированной, чтобы не потерять введённое */}
            {(open || editing) && (
                <div hidden={!open} className="space-y-4 border-t px-4 py-4">
                    {editing ? (
                        <ListenerEditForm listener={l} onDone={() => setEditing(false)} />
                    ) : (
                        <ListenerDetails listener={l} onEdit={() => setEditing(true)} />
                    )}
                </div>
            )}
        </div>
    );
}
