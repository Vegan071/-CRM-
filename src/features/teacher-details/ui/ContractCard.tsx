import Link from "next/link";
import { formatDate } from "@/shared/lib/date";
import { formatRub } from "@/shared/lib/money";
import type { TeacherContractDto } from "@/entities/teacher/model/types";

function Field({ label, value }: { label: string; value: string }) {
    return (
        <div>
            <dt className="text-xs text-muted-foreground">{label}</dt>
            <dd className="text-sm">{value}</dd>
        </div>
    );
}

const period = (from: string | null, to: string | null) =>
    from || to ? `${formatDate(from, "…")} — ${formatDate(to, "…")}` : "—";

/** Один контракт преподавателя: сроки, сумма, выплаты */
export function ContractCard({ contract: c }: { contract: TeacherContractDto }) {
    const rest = c.amount === null ? null : Math.max(c.amount - c.paid, 0);

    return (
        <div className="space-y-3 rounded-lg border px-4 py-3">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
                <p className="font-semibold">
                    Контракт № {c.contractNumber}
                    <span className="ml-2 text-sm font-normal text-muted-foreground">
                        от {formatDate(c.contractDate)}
                    </span>
                </p>
                {c.group ? (
                    <Link href={`/groups/${c.group.id}`} className="text-sm hover:underline">
                        Группа {c.group.name}
                    </Link>
                ) : (
                    <span className="text-sm text-muted-foreground">Без группы</span>
                )}
            </div>

            <dl className="grid grid-cols-2 gap-4 md:grid-cols-3">
                <Field label="Срок контракта" value={period(c.contractStartDate, c.contractEndDate)} />
                <Field label="Срок оказания услуг" value={period(c.serviceStartDate, c.serviceEndDate)} />
                <Field label="Сумма" value={c.amount === null ? "—" : formatRub(c.amount)} />
                <Field label="Выплачено" value={formatRub(c.paid)} />
                <Field label="Остаток" value={rest === null ? "—" : formatRub(rest)} />
            </dl>

            {c.payments.length > 0 && (
                <details className="text-sm">
                    <summary className="cursor-pointer text-muted-foreground">Выплаты ({c.payments.length})</summary>
                    <ul className="mt-2 space-y-1">
                        {c.payments.map((p) => (
                            <li key={p.id} className="flex justify-between gap-3">
                                <span>
                                    {formatDate(p.paidAt)} · акт № {p.actNumber}
                                </span>
                                <span>{formatRub(p.amount)}</span>
                            </li>
                        ))}
                    </ul>
                </details>
            )}
        </div>
    );
}
