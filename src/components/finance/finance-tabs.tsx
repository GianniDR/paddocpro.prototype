"use client";

import { Gauge, ReceiptText } from "lucide-react";

import { FeatureTabBar } from "@/components/shell/feature-tab-bar";
import { useSession } from "@/lib/auth/current";
import { useDataset } from "@/lib/mock/store";

export function FinanceTabs() {
  const dataset = useDataset();
  const session = useSession();
  const tenantId = session?.tenantId ?? dataset.tenants[0]?.id;
  const count = dataset.invoices.filter((i) => i.tenantId === tenantId).length;
  return (
    <FeatureTabBar
      tabs={[
        { label: "Dashboard", href: "/finance", Icon: Gauge, exact: true },
        { label: "Invoices", href: "/finance/all-invoices", Icon: ReceiptText, count },
      ]}
    />
  );
}
