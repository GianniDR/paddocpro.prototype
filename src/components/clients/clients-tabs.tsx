"use client";

import { Gauge, Users } from "lucide-react";

import { FeatureTabBar } from "@/components/shell/feature-tab-bar";
import { useSession } from "@/lib/auth/current";
import { useDataset } from "@/lib/mock/store";

export function ClientsTabs() {
  const dataset = useDataset();
  const session = useSession();
  const tenantId = session?.tenantId ?? dataset.tenants[0]?.id;
  const count = dataset.clients.filter((c) => c.tenantId === tenantId).length;
  return (
    <FeatureTabBar
      tabs={[
        { label: "Dashboard", href: "/clients", Icon: Gauge, exact: true },
        { label: "Clients", href: "/clients/all-clients", Icon: Users, count },
      ]}
    />
  );
}
