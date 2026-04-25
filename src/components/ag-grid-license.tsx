"use client";
import { LicenseManager } from "ag-grid-enterprise";

if (typeof window !== "undefined" && process.env.NEXT_PUBLIC_AG_GRID_LICENSE) {
  LicenseManager.setLicenseKey(process.env.NEXT_PUBLIC_AG_GRID_LICENSE);
}

export function AgGridLicense() {
  return null;
}
