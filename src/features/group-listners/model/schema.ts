import { z } from "zod";
import { optionalText } from "@/shared/lib/zod";
import { studentSchema } from "@/features/student-create/model/schema";
import type { Option } from "@/shared/ui/form";

export const PAY_METHOD_OPTIONS: Option[] = [
    { value: "MATERNITY_CAPITAL", label: "Материнский капитал" },
    { value: "INSTALLMENT", label: "Рассрочка" },
];

export const listenerEditSchema = studentSchema.extend({
    payMethod: z.enum(["MATERNITY_CAPITAL", "INSTALLMENT", ""]).transform((v) => v || null),
    contractNumber: optionalText,
});

export type ListenerEditInput = z.input<typeof listenerEditSchema>;
export type ListenerEditValues = z.output<typeof listenerEditSchema>;
