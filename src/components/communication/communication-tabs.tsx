"use client";

import { Bell, Gauge, MessagesSquare } from "lucide-react";

import { FeatureTabBar } from "@/components/shell/feature-tab-bar";
import { useSession } from "@/lib/auth/current";
import { useDataset } from "@/lib/mock/store";

export function CommunicationTabs() {
  const dataset = useDataset();
  const session = useSession();
  const tenantId = session?.tenantId ?? dataset.tenants[0]?.id;
  const threadCount = dataset.threads.filter((t) => t.tenantId === tenantId).length;
  const notifCount = dataset.notifications.filter((n) => n.tenantId === tenantId).length;
  return (
    <FeatureTabBar
      tabs={[
        { label: "Dashboard", href: "/communication", Icon: Gauge, exact: true },
        { label: "Threads", href: "/communication/all-threads", Icon: MessagesSquare, count: threadCount },
        { label: "Notifications", href: "/communication/notifications", Icon: Bell, count: notifCount },
      ]}
    />
  );
}
