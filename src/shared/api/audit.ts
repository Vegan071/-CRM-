import "server-only";
import { db } from "./db";
import { AuditAction } from "~/prisma/generated/prisma/enums";

/** Подходит и обычный клиент, и `tx` из `db.$transaction` */
type AuditClient = Pick<typeof db, "auditLog">;

/** Запись в журнал. Внутри транзакции последним аргументом передаём `tx`, чтобы запись откатилась вместе с ней */
export function logAction(
    userId: string,
    entity: string,
    entityId: string,
    action: AuditAction,
    diff?: object,
    client: AuditClient = db,
) {
    return client.auditLog.create({ data: { userId, entity, entityId, action, diff } });
}
