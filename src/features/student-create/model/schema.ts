import { z } from "zod";
import { optionalText, requiredDate } from "@/shared/lib/zod";
import type { Option } from "@/shared/ui/form";

export const GENDER_OPTIONS: Option[] = [
    { value: "MALE", label: "Мужской" },
    { value: "FEMALE", label: "Женский" },
];

export const studentSchema = z.object({
    fullName: z.string().trim().min(1, "Введите ФИО").max(120, "Не длиннее 120 символов"),
    phone: z.string().trim().min(10, "Введите номер телефона").max(30),
    birthDate: requiredDate,
    gender: z.string().min(1, "Выберите пол").pipe(z.enum(["MALE", "FEMALE"])),
    snils: z.string().trim().max(50, "Не длиннее 50 символов"),
    collegeGroupId: optionalText,
    curatorId: optionalText,
    isDpkStudent: z.boolean(),
    medCertNumber: optionalText,
    medInstitution: optionalText,
});

export type StudentFormInput = z.input<typeof studentSchema>;
export type StudentFormValues = z.output<typeof studentSchema>;