import { apiClient } from "@/lib/api-client";
import { ApiSuccessResponse } from "@/types/auth";
import { AuditLogEntry, AuditLogQuery } from "@/types/auditLog";

export const auditLogService = {
  async list(query: AuditLogQuery) {
    const { data } = await apiClient.get<ApiSuccessResponse<AuditLogEntry[]>>("/audit-logs", {
      params: query,
    });
    return { logs: data.data, meta: data.meta! };
  },
};
