import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { sendSuccess, buildPaginationMeta } from "../utils/apiResponse";
import * as auditLogService from "../services/auditLog.service";
import { ListAuditLogsQuery } from "../validators/auditLog.validator";

export const listAuditLogs = asyncHandler(async (req: Request, res: Response) => {
  const query = req.query as unknown as ListAuditLogsQuery;
  const { logs, total } = await auditLogService.listAuditLogs(query);
  sendSuccess(res, 200, "Audit logs fetched", logs, buildPaginationMeta(query.page, query.limit, total));
});
