import type { TeacherContractDto } from "@/entities/teacher/model/types";
import { ContractCard } from "./ContractCard";

type Props = {
    title: string;
    contracts: TeacherContractDto[];
    emptyText: string;
    /** Завершённые контракты сворачиваем, чтобы не загромождать страницу */
    collapsed?: boolean;
};

export function ContractsSection({ title, contracts, emptyText, collapsed = false }: Props) {
    const list =
        contracts.length === 0 ? (
            <p className="text-sm text-muted-foreground">{emptyText}</p>
        ) : (
            <div className="space-y-3">
                {contracts.map((c) => (
                    <ContractCard key={c.id} contract={c} />
                ))}
            </div>
        );

    if (collapsed) {
        return (
            <details className="space-y-3">
                <summary className="cursor-pointer font-semibold">
                    {title} ({contracts.length})
                </summary>
                <div className="mt-3">{list}</div>
            </details>
        );
    }

    return (
        <section className="space-y-3">
            <h2 className="font-semibold">
                {title} ({contracts.length})
            </h2>
            {list}
        </section>
    );
}
