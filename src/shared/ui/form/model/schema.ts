import { z } from "zod";
import { optionalText, requiredDate, requiredInt, requiredNumber } from "@/shared/lib/zod";
import type { Option } from "@/shared/ui/form";

export const GROUP_STATUS_OPTIONS: Option[] = [
    { value: "IN_PROGRESS", label: "В процессе" },
    { value: "DONE", label: "Выполнено" },
];

export const groupSchema = z
    .object({
        name: z.string().trim().min(1, "Введите название"),
        startDate: requiredDate,
        endDate: requiredDate,
        listenersCount: requiredInt,
        collegeStudentsCount: requiredInt,
        teacherId: z.string().min(1, "Выберите преподавателя"),
        masterId: optionalText,
        pricePerListener: requiredNumber,
        discountCount: requiredInt,
        totalPriceWithDiscount: requiredNumber,
        status: z.enum(["IN_PROGRESS", "DONE"]),
    })
    .superRefine((v, ctx) => {
        if (v.startDate && v.endDate && v.endDate < v.startDate) {
            ctx.addIssue({ code: "custom", path: ["endDate"], message: "Дата окончания раньше даты начала" });
        }
    });

export type GroupFormInput = z.input<typeof groupSchema>;
export type GroupFormValues = z.output<typeof groupSchema>;