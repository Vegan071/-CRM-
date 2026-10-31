"use client";

import React from "react";
import type { ModalProps } from "@/shared/ui/entity-modal";
import { EntityModal } from "@/shared/ui/entity-modal";
import {Button} from "@/shared/ui/button";
import {CreateTeacherForm} from "@/features/teacher-create";

type Props = ModalProps & {
    onSuccess?: () => void;
};

export const CreateTeacherModal = ({
                                       open,
                                       onOpenChange,
                                       onSuccess,
                                   }: Props) => {
    return (
        <EntityModal
            open={open}
            onOpenChange={onOpenChange}
            title="Добавление контракта"
            description="Добавте новый контракт"
            actionLabel="Создать"
            trigger={
                <Button type="button">
                    Добавить контракт
                </Button>
            }
            form={({ formId, close }) => (
                <CreateTeacherForm
                    formId={formId}
                    close={() => {
                        close();
                        onSuccess?.();
                    }}
                />
            )}
        />
    )
};