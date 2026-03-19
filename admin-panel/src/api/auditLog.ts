import client from './client';
import type { PaginatedResponse, AuditLogEntry } from '../types';

export const listAuditLogs = (params?: { page?: number; limit?: number; action?: string }) =>
  client.get<PaginatedResponse<AuditLogEntry>>('/admin/audit-log', { params }).then((r) => r.data);
