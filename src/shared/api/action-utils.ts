import type { ActionResult } from "@/shared/lib/pagination";

export const INT32_MAX = 2_147_483_647;

export const ok = <T>(data: T): ActionResult<T> => ({ ok: true, data });
export const fail = (error: string): ActionResult<never> => ({ ok: false, error });

export const isUniqueViolation = (e: unknown) =>
    typeof e === "object" && e !== null && "code" in e && (e as { code: unknown }).code === "P2002";

/** "2026-10-18" -> Date (UTC, без сдвига часового пояса) */
export function toDate(value: string): Date {
    return new Date(`${value}T00:00:00.000Z`);
}