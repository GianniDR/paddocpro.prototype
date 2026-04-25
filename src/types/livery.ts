import type { BaseEntity, Iso } from "./base";

export type LiveryTier = "full" | "part" | "diy" | "grass" | "custom";

export interface LiveryInclusions {
  feedsPerDay: number;
  muckOutFrequency: "daily" | "alternate" | "weekly" | "none";
  turnoutDays: number;
  rugChangesPerWeek: number;
  arenaAccess: boolean;
}

export interface LiveryPackage extends BaseEntity {
  name: string;
  tier: LiveryTier;
  inclusions: LiveryInclusions;
  basePriceMonthlyPence: number;
  effectiveFrom: Iso;
  effectiveTo: Iso | null;
  xeroItemCode: string;
  seasonalVariations: Array<{ from: Iso; to: Iso; pricePence: number }>;
  archivedAt: Iso | null;
}

export interface LiveryAddOn extends BaseEntity {
  name: string;
  pricePence: number;
  unit: string;
  xeroItemCode: string;
}
