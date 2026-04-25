import type { BaseEntity, Iso } from "./base";

export type BookingType = "arena_slot" | "lesson" | "vet_appt" | "farrier_appt" | "dentist_appt";
export type BookingStatus = "tentative" | "confirmed" | "cancelled" | "completed";
export type ResourceKind = "arena" | "manege_outdoor" | "instructor" | "vet" | "farrier" | "dentist";

export interface Resource extends BaseEntity {
  name: string;
  kind: ResourceKind;
  defaultDurationMins: number;
  pricePerSlotPence: number | null;
  xeroItemCode: string | null;
}

export interface Booking extends BaseEntity {
  type: BookingType;
  resourceId: string;
  clientId: string | null;
  horseId: string | null;
  staffIds: string[];
  startAt: Iso;
  endAt: Iso;
  status: BookingStatus;
  recurrenceRule: string | null;
  notes: string | null;
}

export type TaskType =
  | "feed"
  | "muck_out"
  | "turn_out"
  | "bring_in"
  | "hay_net"
  | "water_check"
  | "rug_change"
  | "medication"
  | "custom";

export type TaskPriority = "critical" | "high" | "medium" | "low";
export type TaskStatus = "pending" | "in_progress" | "completed" | "missed";

export interface Task extends BaseEntity {
  type: TaskType;
  title: string;
  horseId: string | null;
  stableId: string | null;
  paddockId: string | null;
  assigneeId: string;
  dueAt: Iso;
  priority: TaskPriority;
  status: TaskStatus;
  completedAt: Iso | null;
  completedById: string | null;
  notes: string | null;
  recurrenceRule: string | null;
  templateId: string | null;
  escalatedAt: Iso | null;
}

export interface TaskTemplate extends BaseEntity {
  kind: TaskType;
  title: string;
  targetSelector: "per_horse" | "per_stable" | "per_paddock" | "yard_wide";
  schedule: string;
  priority: TaskPriority;
  defaultAssigneeId: string | null;
  notes: string | null;
}
