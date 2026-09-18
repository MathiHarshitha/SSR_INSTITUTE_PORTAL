import { FilterQuery, Types } from "mongoose";
import { AuditLog, IAuditLog } from "../models/AuditLog";
import { logger } from "../utils/logger";
import { ListAuditLogsQuery } from "../validators/auditLog.validator";

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

export async function listAuditLogs(query: ListAuditLogsQuery) {
  const filter: FilterQuery<IAuditLog> = {};
  if (query.action) filter.action = query.action;
  if (query.entity) filter.entity = query.entity;

  const skip = (query.page - 1) * query.limit;

  const [logs, total] = await Promise.all([
    AuditLog.find(filter)
      .populate("user", "name email role")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(query.limit)
      .lean(),
    AuditLog.countDocuments(filter),
  ]);

  return { logs, total };
}
