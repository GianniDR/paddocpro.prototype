"use client";

import { Gauge, IdCard } from "lucide-react";

import { FeatureTabBar } from "@/components/shell/feature-tab-bar";
import { useSession } from "@/lib/auth/current";
import { useDataset } from "@/lib/mock/store";

export function VisitorsTabs() {
  const dataset = useDataset();
  const session = useSession();
  const tenantId = session?.tenantId ?? dataset.tenants[0]?.id;
  const count = dataset.visitors.filter((v) => v.tenantId === tenantId).length;
  return (
    <FeatureTabBar
      tabs={[
        { label: "Dashboard", href: "/visitors", Icon: Gauge, exact: true },
        { label: "Visitors", href: "/visitors/all-visitors", Icon: IdCard, count },
      ]}
    />
  );
}
