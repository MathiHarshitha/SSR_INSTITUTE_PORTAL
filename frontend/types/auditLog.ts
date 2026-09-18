export interface AuditLogEntry {
  _id: string;
  user: { _id: string; name: string; email: string; role: string };
  action: string;
  entity: string;
  entityId?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

export interface AuditLogQuery {
  page: number;
  limit: number;
  action?: string;
  entity?: string;
}
