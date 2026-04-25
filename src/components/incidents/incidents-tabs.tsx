"use client";

import { Gauge, ShieldAlert } from "lucide-react";

import { FeatureTabBar } from "@/components/shell/feature-tab-bar";
import { useSession } from "@/lib/auth/current";
import { useDataset } from "@/lib/mock/store";

export function IncidentsTabs() {
  const dataset = useDataset();
  const session = useSession();
  const tenantId = session?.tenantId ?? dataset.tenants[0]?.id;
  const count = dataset.incidents.filter((i) => i.tenantId === tenantId).length;
  return (
    <FeatureTabBar
      tabs={[
        { label: "Dashboard", href: "/incidents", Icon: Gauge, exact: true },
        { label: "Incidents", href: "/incidents/all-incidents", Icon: ShieldAlert, count },
      ]}
    />
  );
}
