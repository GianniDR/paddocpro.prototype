import type { BaseEntity, Iso } from "./base";

export interface MessageThread extends BaseEntity {
  participantUserIds: string[];
  subject: string | null;
  kind: "direct" | "group_clients" | "livery_segment" | "yard_broadcast" | "notice_board";
  pinnedToNoticeBoard: boolean;
}

export interface Message extends BaseEntity {
  threadId: string;
  authorId: string;
  bodyMarkdown: string;
  attachmentDocIds: string[];
  readBy: Array<{ userId: string; readAt: Iso }>;
  acknowledgedBy: Array<{ userId: string; ackAt: Iso }>;
}

export interface NotificationDispatch extends BaseEntity {
  recipientUserId: string;
  category: "health_reminder" | "payment_alert" | "booking" | "announcement" | "task" | "emergency";
  channel: "push" | "email" | "sms" | "in_app";
  subject: string;
  body: string;
  relatedEntityType: string | null;
  relatedEntityId: string | null;
  state: "queued" | "sent" | "delivered" | "read" | "failed";
  sentAt: Iso | null;
  deliveredAt: Iso | null;
  readAt: Iso | null;
}

export type IncidentSeverity = "minor" | "moderate" | "serious" | "critical";
export type IncidentType =
  | "horse_injury"
  | "rider_injury"
  | "near_miss"
  | "equipment_failure"
  | "property_damage"
  | "welfare_concern";
export type IncidentWorkflow = "logged" | "under_review" | "action_taken" | "closed";

export interface IncidentRecord extends BaseEntity {
  occurredAt: Iso;
  location: string;
  severity: IncidentSeverity;
  incidentType: IncidentType;
  summary: string;
  description: string;
  linkedHorseId: string | null;
  linkedClientId: string | null;
  evidenceDocIds: string[];
  workflowState: IncidentWorkflow;
  assignedToId: string | null;
  resolutionNotes: string | null;
  confidentialWelfareFlag: boolean;
  auditTrail: Array<{
    at: Iso;
    byUserId: string;
    action: string;
    before: Record<string, unknown> | null;
    after: Record<string, unknown> | null;
  }>;
}

export interface VisitorLog extends BaseEntity {
  visitorName: string;
  visitorType: "vet" | "farrier" | "dentist" | "supplier" | "contractor" | "family" | "other";
  purpose: string;
  vehicleReg: string | null;
  arrivedAt: Iso;
  departedAt: Iso | null;
  expectedBookingId: string | null;
  inductionStatus: "not_required" | "complete" | "expired" | null;
  insuranceCertDocId: string | null;
}
