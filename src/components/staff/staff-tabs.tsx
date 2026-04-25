"use client";

import { Gauge, Users } from "lucide-react";

import { FeatureTabBar } from "@/components/shell/feature-tab-bar";
import { useSession } from "@/lib/auth/current";
import { useDataset } from "@/lib/mock/store";

export function StaffTabs() {
  const dataset = useDataset();
  const session = useSession();
  const tenantId = session?.tenantId ?? dataset.tenants[0]?.id;
  const count = dataset.users.filter(
    (u) => u.tenantId === tenantId && (u.role === "yard_manager" || u.role === "yard_staff"),
  ).length;
  return (
    <FeatureTabBar
      tabs={[
        { label: "Dashboard", href: "/staff", Icon: Gauge, exact: true },
        { label: "Staff", href: "/staff/all-staff", Icon: Users, count },
      ]}
    />
  );
}
