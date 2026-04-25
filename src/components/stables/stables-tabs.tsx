"use client";

import { Gauge, Grid3x3 } from "lucide-react";

import { FeatureTabBar } from "@/components/shell/feature-tab-bar";
import { useSession } from "@/lib/auth/current";
import { useDataset } from "@/lib/mock/store";

export function StablesTabs() {
  const dataset = useDataset();
  const session = useSession();
  const tenantId = session?.tenantId ?? dataset.tenants[0]?.id;
  const count = dataset.stables.filter((s) => s.tenantId === tenantId).length;
  return (
    <FeatureTabBar
      tabs={[
        { label: "Dashboard", href: "/stables", Icon: Gauge, exact: true },
        { label: "Stables", href: "/stables/all-stables", Icon: Grid3x3, count },
      ]}
    />
  );
}
