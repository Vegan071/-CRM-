/** "2026-10-18" → "18.10.2026"; пустое значение заменяется на fallback */
export function formatDate(iso: string | null, fallback = "—"): string {
    return iso ? iso.split("-").reverse().join(".") : fallback;
}

/** Date → "2026-10-18" (UTC) либо null */
export const toIsoDate = (d: Date | null): string | null => (d ? d.toISOString().slice(0, 10) : null);
