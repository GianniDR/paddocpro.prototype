"use client";

import { Gauge, HeartPulse } from "lucide-react";

import { FeatureTabBar } from "@/components/shell/feature-tab-bar";
import { useSession } from "@/lib/auth/current";
import { useDataset } from "@/lib/mock/store";

export function HealthTabs() {
  const dataset = useDataset();
  const session = useSession();
  const tenantId = session?.tenantId ?? dataset.tenants[0]?.id;
  const count = dataset.healthEvents.filter((e) => e.tenantId === tenantId).length;
  return (
    <FeatureTabBar
      tabs={[
        { label: "Dashboard", href: "/health", Icon: Gauge, exact: true },
        { label: "All events", href: "/health/all-events", Icon: HeartPulse, count },
      ]}
    />
  );
}
