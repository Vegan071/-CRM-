import "server-only";
import { db } from "./db";
import {AuditAction} from "~/prisma/generated/prisma/enums";

export function logAction(userId: string, entity: string, entityId: string, action: AuditAction     , diff?: object) {
    return db.auditLog.create({ data: { userId, entity, entityId, action, diff } });
}