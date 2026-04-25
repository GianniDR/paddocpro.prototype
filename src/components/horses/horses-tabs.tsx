"use client";

import { Gauge, Sparkles } from "lucide-react";

import { FeatureTabBar } from "@/components/shell/feature-tab-bar";
import { useSession } from "@/lib/auth/current";
import { useDataset } from "@/lib/mock/store";

export function HorsesTabs() {
  const dataset = useDataset();
  const session = useSession();
  const tenantId = session?.tenantId ?? dataset.tenants[0]?.id;
  const count = dataset.horses.filter((h) => h.tenantId === tenantId && !h.archivedAt).length;
  return (
    <FeatureTabBar
      tabs={[
        { label: "Dashboard", href: "/horses", Icon: Gauge, exact: true },
        { label: "Horses", href: "/horses/all-horses", Icon: Sparkles, count },
      ]}
    />
  );
}
