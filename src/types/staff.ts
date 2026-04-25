import type { BaseEntity, Iso } from "./base";

export type ShiftStatus = "scheduled" | "in_progress" | "completed" | "missed" | "cancelled";

export interface StaffShift extends BaseEntity {
  staffUserId: string;
  startAt: Iso;
  endAt: Iso;
  role: string;
  clockInAt: Iso | null;
  clockOutAt: Iso | null;
  clockInGps: { lat: number; lng: number } | null;
  status: ShiftStatus;
}

export interface RotaTemplate extends BaseEntity {
  name: string;
  pattern: Array<{
    dayOfWeek: number;
    shifts: { startTime: string; endTime: string; role: string; count: number }[];
  }>;
}

export interface TrainingCertificate extends BaseEntity {
  staffUserId: string;
  name: string;
  issuedDate: Iso;
  expiryDate: Iso;
  documentId: string | null;
}
