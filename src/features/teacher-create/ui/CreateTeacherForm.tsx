"use client";

import React from "react";
import type { ModalFormContext } from "@/shared/ui/entity-modal";

export const CreateGroupForm = ({ formId, close }: ModalFormContext) => (
    <form
        id={formId}
        className="flex flex-col gap-3"
        onSubmit={(e) => {
            e.preventDefault();
            const data = new FormData(e.currentTarget);
            // TODO: запрос на создание группы, например createGroup(data)
            console.log(Object.fromEntries(data));
            close();
        }}
    >
        <input name="name" placeholder="Название группы" required />
    </form>
);