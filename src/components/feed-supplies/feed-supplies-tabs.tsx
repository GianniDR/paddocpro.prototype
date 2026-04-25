"use client";

import { Gauge, Wheat } from "lucide-react";

import { FeatureTabBar } from "@/components/shell/feature-tab-bar";
import { useSession } from "@/lib/auth/current";
import { useDataset } from "@/lib/mock/store";

export function FeedSuppliesTabs() {
  const dataset = useDataset();
  const session = useSession();
  const tenantId = session?.tenantId ?? dataset.tenants[0]?.id;
  const count = dataset.inventory.filter((i) => i.tenantId === tenantId).length;
  return (
    <FeatureTabBar
      tabs={[
        { label: "Dashboard", href: "/feed-supplies", Icon: Gauge, exact: true },
        { label: "Supplies", href: "/feed-supplies/all-supplies", Icon: Wheat, count },
      ]}
    />
  );
}
