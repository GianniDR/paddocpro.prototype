import type { BaseEntity, Iso } from "./base";

export type HorseSex = "mare" | "gelding" | "stallion" | "colt" | "filly";
export type HealthStatus = "healthy" | "monitoring" | "isolating" | "vet_care";
export type BeddingType = "straw" | "shavings" | "cardboard" | "rubber" | "paper";

export interface Horse extends BaseEntity {
  registeredName: string;
  stableName: string;
  breed: string;
  sex: HorseSex;
  colour: string;
  markings: string | null;
  heightHands: number;
  dateOfBirth: Iso;
  microchipNumber: string;
  passportNumber: string;
  passportExpiry: Iso;
  primaryOwnerId: string;
  coOwnerIds: string[];
  currentStableId: string | null;
  currentPaddockId: string | null;
  liveryPackageId: string;
  liveryStartDate: Iso;
  beddingType: BeddingType;
  healthStatus: HealthStatus;
  feedPlanId: string | null;
  insuranceProvider: string | null;
  insurancePolicyNumber: string | null;
  insuranceExpiry: Iso | null;
  primaryPhotoUrl: string;
  photoGalleryUrls: string[];
  archivedAt: Iso | null;
}

export type StableStatus = "occupied" | "vacant" | "maintenance";
export type StableDesignation = "standard" | "isolation" | "foaling" | "quarantine";

export interface Stable extends BaseEntity {
  number: string;
  block: string;
  dimensions: string;
  defaultBeddingType: BeddingType;
  designation: StableDesignation;
  status: StableStatus;
  currentHorseId: string | null;
  outOfServiceReason: string | null;
  outOfServiceUntil: Iso | null;
}

export type PaddockSurface = "excellent" | "good" | "fair" | "poor";

export interface Paddock extends BaseEntity {
  name: string;
  sizeAcres: number;
  surfaceCondition: PaddockSurface;
  currentHorseIds: string[];
  rotationGroupId: string | null;
  lastRestedAt: Iso | null;
  nextRotationAt: Iso | null;
}

export interface PaddockRotationGroup extends BaseEntity {
  name: string;
  paddockIds: string[];
  cycleDays: number;
}

export interface MovementHistory extends BaseEntity {
  horseId: string;
  from: { stableId?: string | null; paddockId?: string | null };
  to: { stableId?: string | null; paddockId?: string | null };
  at: Iso;
  byUserId: string;
  reason: string | null;
}
