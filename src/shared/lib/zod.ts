import {z} from "zod";

/** Обязательный текст с обрезкой пробелов */
export const requiredText = (message = "Обязательное поле") =>
    z.string().trim().min(1, message);

/** Необязательный текст: пустая строка → null */
export const optionalText = z.string().trim().transform((v) => v || null);

export const requiredDate = z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Укажите дату")
    .refine((v) => {
        const d = new Date(`${v}T00:00:00.000Z`);
        return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === v;
    }, "Укажите корректную дату");

export const requiredNumber = z
    .string()
    .trim()
    .min(1, "Обязательное поле")
    .pipe(
        z.coerce.number<string>({error: "Введите число"}).min(0, "Не меньше 0"),
    );
export const positiveNumber = requiredNumber.refine((v) => v > 0, "Должно быть больше 0");

export const requiredInt = z
    .string()
    .trim()
    .min(1, "Обязательное поле")
    .pipe(
        z.coerce
            .number<string>({error: "Введите число"})
            .int("Только целое число")
            .min(0, "Не меньше 0"),
    );
// ───────── Схемы для админ-панели ─────────

export const createGroupSchema = z.object({
    name: requiredText("Введите номер группы"),
});

export const createTeacherSchema = z.object({
    fullName: requiredText("Введите ФИО преподавателя"),
});

export type CreateGroupInput = z.input<typeof createGroupSchema>;
export type CreateTeacherInput = z.input<typeof createTeacherSchema>;