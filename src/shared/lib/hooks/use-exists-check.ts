"use client";

import { useEffect, useRef, useState } from "react";
import { useDebounceValue } from "@siberiacancode/reactuse";
import { normalizeName } from "@/shared/lib/normalize";

interface Options {
    delay?: number;
    minLength?: number;
}

export function useExistsCheck(
    value: string,
    check: (value: string) => Promise<boolean>,
    { delay = 400, minLength = 1 }: Options = {}
) {
    const current = normalizeName(value);
    const debounced = useDebounceValue(current, delay);

    const [result, setResult] = useState<{ value: string; exists: boolean } | null>(null);
    const [pending, setPending] = useState(false);
    const checkRef = useRef(check);
    checkRef.current = check;

    useEffect(() => {
        if (debounced.length < minLength) {
            setResult(null);
            setPending(false);
            return;
        }

        let cancelled = false;
        setPending(true);
        checkRef.current(debounced)
            .then((exists) => !cancelled && setResult({ value: debounced, exists }))
            .catch(() => !cancelled && setResult(null)) // сервер всё равно проверит при сохранении
            .finally(() => !cancelled && setPending(false));

        return () => {
            cancelled = true;
        };
    }, [debounced, minLength]);

    return {
        exists: result?.exists === true && result.value === current,
        isChecking: current.length >= minLength && (pending || current !== debounced),
    };
}