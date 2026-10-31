"use client";

import React from "react";
import type { EntityModalProps } from "@/shared/ui/entity-modal";
import { EntityModal } from "@/shared/ui/entity-modal";
import { CreateGroupForm } from "./CreateGroupForm";
import { Button } from "@/shared/ui/button";

type Props = Pick<EntityModalProps, "open" | "onOpenChange"> & {
    onSuccess?: () => void;
};

export const CreateGroupModal = ({
    open,
    onOpenChange,
    onSuccess,
}: Props) => {
    return (
        <EntityModal
            open={open}
            onOpenChange={onOpenChange}
            title="Создание группы"
            description="Создайте новую учебную группу."
            actionLabel="Создать"
            trigger={
                <Button type="button">
                    Создать группу
                </Button>
            }
            form={({ formId, close }) => (
                <CreateGroupForm
                    formId={formId}
                    close={() => {
                        close();
                        onSuccess?.();
                    }}
                />
            )}
        />
    );
};