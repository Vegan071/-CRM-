import type { TeacherContractDto } from "./types";

/**
 * Контракт действующий, пока не наступила дата его окончания (включительно).
 * Без даты окончания контракт считается действующим. Даты — ISO "YYYY-MM-DD", поэтому сравниваем строками.
 */
export function isContractActive(c: Pick<TeacherContractDto, "contractEndDate">, today: string): boolean {
    return !c.contractEndDate || c.contractEndDate >= today;
}

export function splitContracts(contracts: TeacherContractDto[], today: string) {
    return {
        active: contracts.filter((c) => isContractActive(c, today)),
        finished: contracts.filter((c) => !isContractActive(c, today)),
    };
}
