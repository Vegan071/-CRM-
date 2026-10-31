import { z } from "zod";

export const registerSchema = z
    .object({
        name: z.string().min(2, "Введите имя"),
        email: z.string().email("Некорректная почта"),
        password: z.string().min(8, "Минимум 8 символов"),
        confirm: z.string(),
    })
    .refine((v) => v.password === v.confirm, {
        path: ["confirm"],
        message: "Пароли не совпадают",
    });

export type RegisterValues = z.infer<typeof registerSchema>;