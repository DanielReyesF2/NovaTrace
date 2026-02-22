import { Prisma } from "@prisma/client";
import { prisma } from "./prisma";

interface AuditEntryParams {
  userId: string;
  userEmail: string;
  action: "CREATE" | "UPDATE" | "DELETE";
  entity: string;
  entityId: string;
  batchId?: string | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  changes?: any;
  reason?: string;
  ipAddress?: string;
  userAgent?: string;
}

/**
 * Create an audit log entry for any entity change.
 * Called from API routes after mutations.
 * Serializes changes through JSON round-trip for Prisma Json compatibility.
 */
export async function createAuditEntry(params: AuditEntryParams) {
  // JSON round-trip ensures Prisma InputJsonValue compatibility
  const safeChanges: Prisma.InputJsonValue | undefined = params.changes
    ? JSON.parse(JSON.stringify(params.changes))
    : undefined;

  return prisma.auditLog.create({
    data: {
      userId: params.userId,
      userEmail: params.userEmail,
      action: params.action,
      entity: params.entity,
      entityId: params.entityId,
      batchId: params.batchId ?? undefined,
      changes: safeChanges,
      reason: params.reason,
      ipAddress: params.ipAddress,
      userAgent: params.userAgent,
    },
  });
}

/**
 * Diff two records and return only fields that changed.
 * Returns { fieldName: { old: ..., new: ... } } for each changed field.
 * Ignores updatedAt since it always changes.
 */
export function diffRecords(
  oldRecord: Record<string, unknown>,
  newRecord: Record<string, unknown>
): Record<string, { old: unknown; new: unknown }> | null {
  const changes: Record<string, { old: unknown; new: unknown }> = {};
  const ignoreFields = new Set(["updatedAt"]);

  for (const key of Object.keys(newRecord)) {
    if (ignoreFields.has(key)) continue;
    const oldVal = oldRecord[key];
    const newVal = newRecord[key];

    // Compare serialized values to handle dates, arrays, etc.
    if (JSON.stringify(oldVal) !== JSON.stringify(newVal)) {
      changes[key] = { old: oldVal, new: newVal };
    }
  }

  return Object.keys(changes).length > 0 ? changes : null;
}
