"use client";

import React from "react";
import type { EntityModalProps } from "@/shared/ui/entity-modal";
import { EntityModal } from "@/shared/ui/entity-modal";
import {Button} from "@/shared/ui/button";
import {CreateStudentForm} from "@/features/student-create";

type Props = EntityModalProps & {
    onSuccess?: () => void;
};

export const CreateStudentModal = ({
                                       open,
                                       onOpenChange,
                                       onSuccess,
                                   }: Props) => {
    return (
        <EntityModal
            open={open}
            onOpenChange={onOpenChange}
            title="Создание слушателя"
            description="Создайте нового слушателя."
            actionLabel="Создать"
            trigger={
                <Button type="button">
                    Создать слушателя
                </Button>
            }
            form={({ formId, close }) => (
                <CreateStudentForm
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