import type { BaseEntity, Iso } from "./base";

export type HealthEventKind =
  | "vaccination"
  | "worming"
  | "farrier"
  | "dental"
  | "vet_visit"
  | "injury"
  | "illness";

export type HealthEventStatus = "scheduled" | "completed" | "overdue" | "monitoring" | "resolved";
export type PractitionerKind = "vet" | "farrier" | "dental_tech" | "yard_staff";

export interface HealthEvent extends BaseEntity {
  horseId: string;
  kind: HealthEventKind;
  eventDate: Iso;
  nextDueDate: Iso | null;
  practitionerName: string;
  practitionerKind: PractitionerKind;
  productOrTreatment: string | null;
  dose: string | null;
  batchNumber: string | null;
  withdrawalDays: number | null;
  notes: string | null;
  documentIds: string[];
  linkedTaskIds: string[];
  status: HealthEventStatus;
}

export interface Prescription extends BaseEntity {
  horseId: string;
  drug: string;
  dose: string;
  frequency: string;
  startDate: Iso;
  endDate: Iso;
  prescribingVet: string;
  withdrawalDays: number;
}

export interface FeedPlan extends BaseEntity {
  horseId: string;
  feeds: Array<{ time: string; feedProductId: string; quantityKg: number; notes: string | null }>;
  supplements: Array<{ productId: string; dose: string; frequency: string }>;
  specialInstructions: string | null;
  templateId: string | null;
}
