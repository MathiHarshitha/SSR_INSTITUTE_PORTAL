import { useQuery } from "@tanstack/react-query";
import { auditLogService } from "@/services/auditLog.service";
import { AuditLogQuery } from "@/types/auditLog";

export function useAuditLogs(query: AuditLogQuery) {
  return useQuery({
    queryKey: ["audit-logs", query],
    queryFn: () => auditLogService.list(query),
    placeholderData: (previous) => previous,
  });
}
