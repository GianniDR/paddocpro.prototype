import type { BaseEntity, Iso } from "./base";

export interface AuditLogEntry extends BaseEntity {
  byUserId: string;
  at: Iso;
  action: string;
  entityType: string;
  entityId: string;
  before: Record<string, unknown> | null;
  after: Record<string, unknown> | null;
  ipAddress: string;
}

export interface RbacMatrixRow extends BaseEntity {
  role: string;
  capability: string;
  granted: boolean;
  restriction: string | null;
}
