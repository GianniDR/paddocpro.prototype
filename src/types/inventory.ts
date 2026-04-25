import type { BaseEntity, Iso } from "./base";

export type InventoryCategory =
  | "feed"
  | "supplement"
  | "hay"
  | "haylage"
  | "bedding"
  | "medication"
  | "other";

export type InventoryUnit = "kg" | "bale" | "litre" | "bag" | "pack";

export interface InventoryItem extends BaseEntity {
  name: string;
  category: InventoryCategory;
  unit: InventoryUnit;
  currentStock: number;
  lowStockThreshold: number;
  unitCostPence: number;
  preferredSupplierId: string | null;
  lowStockLastNotifiedAt: Iso | null;
}

export interface Supplier extends BaseEntity {
  name: string;
  contactName: string;
  phone: string;
  email: string;
  productCategories: InventoryCategory[];
  leadTimeDays: number;
  preferred: boolean;
}

export type PurchaseOrderStatus = "placed" | "in_transit" | "received" | "cancelled";

export interface PurchaseOrder extends BaseEntity {
  supplierId: string;
  lines: Array<{ inventoryItemId: string; qty: number; unitCostPence: number }>;
  placedAt: Iso;
  expectedAt: Iso;
  receivedAt: Iso | null;
  status: PurchaseOrderStatus;
}
