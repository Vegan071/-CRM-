"use client";

import { useEffect, useEffectEvent, useState } from "react";
import { useDebounceValue } from "@siberiacancode/reactuse";
import { normalizeName } from "@/shared/lib/normalize";

interface Options {
    delay?: number;
    minLength?: number;
}

type Result = { value: string; exists: boolean | null };

export function useExistsCheck(
    value: string,
    check: (value: string) => Promise<boolean>,
    { delay = 400, minLength = 1 }: Options = {}
) {
    const current = normalizeName(value);
    const debounced = useDebounceValue(current, delay);

    // exists === null — проверка не удалась (сервер всё равно проверит при сохранении)
    const [result, setResult] = useState<Result | null>(null);
    const runCheck = useEffectEvent(check);

    useEffect(() => {
        if (debounced.length < minLength) return;

        let cancelled = false;
        runCheck(debounced)
            .then((exists) => !cancelled && setResult({ value: debounced, exists }))
            .catch(() => !cancelled && setResult({ value: debounced, exists: null }));

        return () => {
            cancelled = true;
        };
    }, [debounced, minLength]);

    return {
        exists: result?.value === current && result.exists === true,
        isChecking:
            current.length >= minLength && (current !== debounced || result?.value !== debounced),
    };
}
