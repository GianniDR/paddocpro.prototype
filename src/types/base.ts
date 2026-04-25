export type Iso = string;
export type EntityId = string;

export interface BaseEntity {
  id: EntityId;
  tenantId: EntityId;
  createdAt: Iso;
  updatedAt: Iso;
}

export type Role =
  | "system_admin"
  | "group_admin"
  | "yard_manager"
  | "yard_staff"
  | "client_owner"
  | "visiting_pro";
