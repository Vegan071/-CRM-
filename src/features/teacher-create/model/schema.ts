import { z } from "zod";
import { requiredDate } from "@/shared/lib/zod";

export const teacherSchema = z
    .object({
        teacherId: z.string().min(1, "Выберите преподавателя"),
        contractNumber: z.string().trim().min(1, "Введите № контракта").max(50),
        conclusionDate: requiredDate,
        serviceStartDate: requiredDate,
        serviceEndDate: requiredDate,
        contractStartDate: requiredDate,
        contractEndDate: requiredDate,
    })
    .superRefine((v, ctx) => {
        if (v.serviceEndDate < v.serviceStartDate) {
            ctx.addIssue({ code: "custom", path: ["serviceEndDate"], message: "Дата окончания раньше даты начала" });
        }
        if (v.contractEndDate < v.contractStartDate) {
            ctx.addIssue({ code: "custom", path: ["contractEndDate"], message: "Дата окончания раньше даты начала" });
        }
    });

export type TeacherFormInput = z.input<typeof teacherSchema>;
export type TeacherFormValues = z.output<typeof teacherSchema>;