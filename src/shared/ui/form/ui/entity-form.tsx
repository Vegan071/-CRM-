"use client";

import { FormProvider, type FieldValues, type UseFormReturn } from "react-hook-form";

type Props<TIn extends FieldValues, TOut extends FieldValues> = {
    formId: string;
    form: UseFormReturn<TIn, unknown, TOut>;
    onSubmit: (values: TOut) => void | Promise<void>;
    children: React.ReactNode;
};

export function EntityForm<TIn extends FieldValues, TOut extends FieldValues>({
                                                                                  formId,
                                                                                  form,
                                                                                  onSubmit,
                                                                                  children,
                                                                              }: Props<TIn, TOut>) {
    return (
        <FormProvider {...form}>
            <form id={formId} noValidate onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-3">
                {children}
            </form>
        </FormProvider>
    );
}