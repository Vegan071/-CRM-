"use client";

import React from "react";
import type { ModalProps } from "@/shared/ui/entity-modal";
import { EntityModal } from "@/shared/ui/entity-modal";
import {Button} from "@/shared/ui/button";
import {CreateStudentForm} from "@/features/student-create";

type Props = ModalProps & {
    onSuccess?: () => void;
    /** Если задан — слушатель создаётся сразу внутри этой учебной группы */
    groupId?: string;
};

export const CreateStudentModal = ({
                                       open,
                                       onOpenChange,
                                       onSuccess,
                                       groupId,
                                   }: Props) => {
    return (
        <EntityModal
            open={open}
            onOpenChange={onOpenChange}
            title="Создание слушателя"
            description={
                groupId
                    ? "Слушатель будет создан и сразу добавлен в эту группу."
                    : "Создайте нового слушателя."
            }
            actionLabel="Создать"
            trigger={
                <Button type="button">
                    Создать слушателя
                </Button>
            }
            form={({ formId, close }) => (
                <CreateStudentForm
                    formId={formId}
                    groupId={groupId}
                    close={() => {
                        close();
                        onSuccess?.();
                    }}
                />
            )}
        />
    )
};