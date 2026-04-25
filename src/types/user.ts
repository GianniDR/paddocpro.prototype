import type { BaseEntity, Iso, Role } from "./base";

export type UserStatus = "active" | "invited" | "suspended" | "archived";

export interface UserAccount extends BaseEntity {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: Role;
  avatarInitials: string;
  lastSeenAt: Iso | null;
  mfaEnabled: boolean;
  notificationPrefs: NotificationPrefs;
  status: UserStatus;
}

export type NotificationCategory =
  | "health_reminder"
  | "payment_alert"
  | "booking"
  | "announcement"
  | "task"
  | "emergency";

export type NotificationChannel = "push" | "email" | "sms" | "in_app";

export type NotificationPrefs = Record<NotificationCategory, Record<NotificationChannel, boolean>>;

export type RidingAbility = "novice" | "intermediate" | "experienced" | "professional";
export type PaymentMethod = "stripe_card" | "gocardless_dd" | "manual_bacs" | "none";
export type PortalAccessStatus = "invited" | "active" | "suspended" | "revoked";

export interface ClientProfile extends BaseEntity {
  userAccountId: string;
  dateOfBirth: Iso;
  addressLine1: string;
  addressLine2: string | null;
  city: string;
  postcode: string;
  emergencyContactName: string;
  emergencyContactRelation: string;
  emergencyContactPhone: string;
  ridingAbility: RidingAbility;
  medicalNotes: string | null;
  insuranceProvider: string | null;
  insurancePolicyNumber: string | null;
  insuranceCoverLevel: string | null;
  insuranceExpiry: Iso | null;
  xeroContactId: string | null;
  paymentMethod: PaymentMethod;
  paymentMethodLast4: string | null;
  communicationPrefs: NotificationPrefs;
  portalAccessStatus: PortalAccessStatus;
}
