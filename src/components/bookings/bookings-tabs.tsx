"use client";

import { CalendarDays, Gauge } from "lucide-react";

import { FeatureTabBar } from "@/components/shell/feature-tab-bar";
import { useSession } from "@/lib/auth/current";
import { useDataset } from "@/lib/mock/store";

export function BookingsTabs() {
  const dataset = useDataset();
  const session = useSession();
  const tenantId = session?.tenantId ?? dataset.tenants[0]?.id;
  const count = dataset.bookings.filter(
    (b) => b.tenantId === tenantId && b.status !== "cancelled",
  ).length;
  return (
    <FeatureTabBar
      tabs={[
        { label: "Dashboard", href: "/bookings", Icon: Gauge, exact: true },
        { label: "Bookings", href: "/bookings/all-bookings", Icon: CalendarDays, count },
      ]}
    />
  );
}
