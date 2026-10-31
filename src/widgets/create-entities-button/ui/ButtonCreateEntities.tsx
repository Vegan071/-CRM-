"use client";

import React, { useState } from "react";
import { usePathname } from "next/navigation";
import { Button } from "@/shared/ui/button";
import { ENTITY_CONFIGS } from "../model/config";

type Props = {
    className?: string;
    buttonClassName?: string;
};

export const ButtonCreateEntities = ({
                                         className,
                                         buttonClassName,
                                     }: Props) => {
    const pathname = usePathname() ?? "";
    const [isOpen, setIsOpen] = useState(false);

    const activeConfig = ENTITY_CONFIGS.find((c) =>
        c.match(pathname)
    );

    if (!activeConfig) return null;

    const { buttonLabel, ModalComponent } = activeConfig;

    return (
        <div className={className}>
            <Button
                type="button"
                className={buttonClassName}
                onClick={() => setIsOpen(true)}
            >
                {buttonLabel}
            </Button>

            <ModalComponent
                open={isOpen}
                onOpenChange={setIsOpen}
            />
        </div>
    );
};