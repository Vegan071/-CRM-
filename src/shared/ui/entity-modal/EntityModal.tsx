"use client";

import React, { useId, useState, type ReactElement, type ReactNode } from "react";
import {
    Dialog,
    DialogTrigger,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/shared/ui/dialog";
import { Button } from "@/shared/ui/button";

export type ModalFormContext = {
    formId: string;
    close: () => void;
};

export type ModalForm = ReactNode | ((ctx: ModalFormContext) => ReactNode);

export type EntityModalProps = {
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    title: string;
    description: string;
    actionLabel: string;
    form?: ModalForm;
    children?: ReactNode;
    trigger?: ReactElement;
    className?: string;
};

export function EntityModal({
                                open: openProp,
                                onOpenChange,
                                title,
                                description,
                                actionLabel,
                                form,
                                children,
                                trigger,
                                className = "max-w-md",
                            }: EntityModalProps) {
    const formId = useId();
    const [innerOpen, setInnerOpen] = useState(false);

    const isControlled = openProp !== undefined;
    const open = isControlled ? openProp : innerOpen;

    const handleOpenChange = (value: boolean) => {
        if (!isControlled) setInnerOpen(value);
        onOpenChange?.(value);
    };
    const close = () => handleOpenChange(false);

    const formContent =
        children ??
        (typeof form === "function"
            ? form({ formId, close })
            : form);

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            {trigger && <DialogTrigger render={trigger} />}

            <DialogContent
                className={`max-h-[85vh] overflow-y-auto ${className}`}
            >
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription>{description}</DialogDescription>
                </DialogHeader>

                <div className="py-2">{formContent}</div>

                <DialogFooter className="mt-6 flex justify-end gap-2">
                    <DialogClose
                        render={<Button variant="outline">Отмена</Button>}
                    />

                    <Button type="submit" form={formId}>
                        {actionLabel}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}