import { z } from "zod";

export const groupNameSchema = z
    .string()
    .trim()
    .min(1, "Введите номер группы")
    .max(50, "Не длиннее 50 символов");

export const teacherNameSchema = z
    .string()
    .trim()
    .min(3, "Введите ФИО полностью")
    .max(120, "Не длиннее 120 символов")
    .regex(/^\p{L}[\p{L}\s.'-]*$/u, "Допустимы только буквы, пробел, точка и дефис");

export const createGroupSchema = z.object({ name: groupNameSchema });
export const createTeacherSchema = z.object({ fullName: teacherNameSchema });

export type CreateGroupInput = z.infer<typeof createGroupSchema>;
export type CreateTeacherInput = z.infer<typeof createTeacherSchema>;

export const pageParamsSchema = z.object({
    cursor: z.string().min(1).max(64).nullable(),
    limit: z.number().int().min(1).max(50),
    search: z.string().trim().max(100),
});