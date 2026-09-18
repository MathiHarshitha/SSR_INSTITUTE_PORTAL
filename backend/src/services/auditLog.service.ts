import { Types } from "mongoose";
import { AuditLog } from "../models/AuditLog";
import { logger } from "../utils/logger";

interface RecordAuditParams {
  userId: Types.ObjectId | string;
  action: string;
  entity: string;
  entityId?: Types.ObjectId | string;
  metadata?: Record<string, unknown>;
  ipAddress?: string;
}

export async function recordAudit(params: RecordAuditParams): Promise<void> {
  try {
    await AuditLog.create({
      user: params.userId,
      action: params.action,
      entity: params.entity,
      entityId: params.entityId,
      metadata: params.metadata,
      ipAddress: params.ipAddress,
    });
  } catch (error) {
    // Auditing must never break the primary request flow.
    logger.error("Failed to write audit log", error);
  }
}
