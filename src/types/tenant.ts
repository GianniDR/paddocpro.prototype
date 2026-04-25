import type { BaseEntity, Iso } from "./base";

export interface Tenant extends BaseEntity {
  name: string;
  slug: string;
  addressLine1: string;
  addressLine2: string | null;
  city: string;
  postcode: string;
  phone: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  groupId: string | null;
  xeroTenantId: string | null;
  xeroConnectedAt: Iso | null;
  whitelabel: { logoUrl: string | null; primaryColour: string | null; customDomain: string | null };
  vatNumber: string | null;
  billingDayOfMonth: number;
  geofenceLatLng: { lat: number; lng: number } | null;
  geofenceRadiusMeters: number;
  cancellationNoticeHours: number;
}
