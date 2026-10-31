import type React from "react";
import type { ModalProps } from "@/shared/ui/entity-modal";
import {CreateTeacherModal} from "@/features/teacher-create";
import {CreateGroupModal} from "@/features/group-create";
import {CreateStudentModal} from "@/features/student-create";

export type EntityConfig = {
    id: string;
    match: (pathname: string) => boolean;
    buttonLabel: string;
    ModalComponent: React.ComponentType<ModalProps>;
};

const isSection = (pathname: string, section: string) =>
    pathname === section || pathname.startsWith(`${section}/`);

export const ENTITY_CONFIGS: EntityConfig[] = [
    {
        id: "groups",
        match: (p) => p === "/" || isSection(p, "/groups"),
        buttonLabel: "Создать группу",
        ModalComponent: CreateGroupModal,
    },
    {
        id: "students",
        match: (p) => isSection(p, "/students"),
        buttonLabel: "Добавить слушателя",
        ModalComponent: CreateStudentModal,
    },
    {
        id: "teachers",
        match: (p) => isSection(p, "/teachers"),
        buttonLabel: "Добавить преподавателя",
        ModalComponent: CreateTeacherModal,
    },
];