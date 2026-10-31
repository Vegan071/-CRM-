"use client";

import React from "react";
import { EntityModal, type ModalForm, type ModalProps } from "@/shared/ui/entity-modal";
import { CreateGroupForm } from "./CreateGroupForm";

type Props = ModalProps & {
    form?: ModalForm;
};

export const CreateGroupModal = ({
                                     form = (ctx) => <CreateGroupForm {...ctx} />,
                                     ...props
                                 }: Props) => (
    <EntityModal
        {...props}
        form={form}
        title="Создание группы"
        description="Создайте новую учебную группу."
        actionLabel="Создать"
    />
);