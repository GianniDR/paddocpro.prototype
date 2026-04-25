import type { BaseEntity, Iso } from "./base";

export type DocumentEntityType =
  | "horse"
  | "client"
  | "staff"
  | "tenant"
  | "incident"
  | "livery_agreement";

export type DocumentCategory =
  | "passport"
  | "vaccination_cert"
  | "insurance"
  | "livery_agreement"
  | "dbs_cert"
  | "first_aid"
  | "liability_waiver"
  | "yard_rules"
  | "vet_letter"
  | "other";

export interface DocumentRecord extends BaseEntity {
  entityType: DocumentEntityType;
  entityId: string;
  category: DocumentCategory;
  title: string;
  fileName: string;
  fileSizeBytes: number;
  mimeType: string;
  uploadedById: string;
  expiryDate: Iso | null;
  version: number;
  previousVersionId: string | null;
  signatures: Array<{ signerUserId: string; signedAt: Iso; ipAddress: string }>;
}
