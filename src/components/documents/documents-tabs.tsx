"use client";

import { FileText, Gauge } from "lucide-react";

import { FeatureTabBar } from "@/components/shell/feature-tab-bar";
import { useSession } from "@/lib/auth/current";
import { useDataset } from "@/lib/mock/store";

export function DocumentsTabs() {
  const dataset = useDataset();
  const session = useSession();
  const tenantId = session?.tenantId ?? dataset.tenants[0]?.id;
  const count = dataset.documents.filter((d) => d.tenantId === tenantId).length;
  return (
    <FeatureTabBar
      tabs={[
        { label: "Dashboard", href: "/documents", Icon: Gauge, exact: true },
        { label: "Documents", href: "/documents/all-documents", Icon: FileText, count },
      ]}
    />
  );
}
