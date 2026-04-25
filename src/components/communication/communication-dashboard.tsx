"use client";

import { Bell, Eye, Megaphone, MessagesSquare } from "lucide-react";
import { useMemo } from "react";

import { BroadcastDialog } from "@/components/communication/broadcast-dialog";
import { MessagingPanel } from "@/components/communication/messaging-panel";
import { KpiTile } from "@/components/shell/kpi-tile";
import { WidgetCard } from "@/components/shell/widget-card";
import { useSession } from "@/lib/auth/current";
import { now } from "@/lib/mock/clock";
import { useDataset } from "@/lib/mock/store";

export function CommunicationDashboard() {
  const dataset = useDataset();
  const session = useSession();
  const tenantId = session?.tenantId ?? dataset.tenants[0]?.id;

  const stats = useMemo(() => {
    const tenantNow = now().getTime();
    const startOfDay = new Date(tenantNow);
    startOfDay.setHours(0, 0, 0, 0);
    const startOfDayMs = startOfDay.getTime();
    const sevenDaysAgo = tenantNow - 7 * 86_400_000;

    const threads = dataset.threads.filter((t) => t.tenantId === tenantId);
    const notifs = dataset.notifications.filter((n) => n.tenantId === tenantId);
    const myMessages = dataset.messages.filter((m) => {
      if (m.tenantId !== tenantId) return false;
      if (m.authorId === session?.userId) return false;
      return !m.readBy.some((r) => r.userId === session?.userId);
    });
    const sentToday = notifs.filter(
      (n) => n.sentAt && Date.parse(n.sentAt) >= startOfDayMs,
    ).length;
    const broadcastsThisWeek = threads.filter(
      (t) => t.kind === "yard_broadcast" && Date.parse(t.createdAt) >= sevenDaysAgo,
    ).length;

    return {
      activeThreads: threads.length,
      sentToday,
      unread: myMessages.length,
      broadcastsThisWeek,
    };
  }, [dataset, tenantId, session]);

  return (
    <div className="flex flex-1 flex-col overflow-auto bg-[#e5ebf1] px-4 pt-3 pb-3 gap-4">
      <div className="flex items-center justify-end">
        <BroadcastDialog />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <KpiTile
          label="Active threads"
          value={stats.activeThreads}
          Icon={MessagesSquare}
          variant="info"
          testId="communication-kpi-threads"
        />
        <KpiTile
          label="Notifications sent today"
          value={stats.sentToday}
          Icon={Bell}
          variant="neutral"
          testId="communication-kpi-sent-today"
        />
        <KpiTile
          label="Unread by you"
          value={stats.unread}
          Icon={Eye}
          variant="amber"
          testId="communication-kpi-unread"
        />
        <KpiTile
          label="Broadcasts this week"
          value={stats.broadcastsThisWeek}
          Icon={Megaphone}
          variant="success"
          testId="communication-kpi-broadcasts"
        />
      </div>

      <WidgetCard title="Messages" className="min-h-[520px]">
        <MessagingPanel />
      </WidgetCard>
    </div>
  );
}
