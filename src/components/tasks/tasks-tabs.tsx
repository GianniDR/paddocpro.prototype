"use client";

import { CheckSquare, Gauge } from "lucide-react";

import { FeatureTabBar } from "@/components/shell/feature-tab-bar";
import { useSession } from "@/lib/auth/current";
import { useDataset } from "@/lib/mock/store";

export function TasksTabs() {
  const dataset = useDataset();
  const session = useSession();
  const tenantId = session?.tenantId ?? dataset.tenants[0]?.id;
  const count = dataset.tasks.filter(
    (t) => t.tenantId === tenantId && t.status !== "completed",
  ).length;
  return (
    <FeatureTabBar
      tabs={[
        { label: "Dashboard", href: "/tasks", Icon: Gauge, exact: true },
        { label: "Tasks", href: "/tasks/all-tasks", Icon: CheckSquare, count },
      ]}
    />
  );
}
