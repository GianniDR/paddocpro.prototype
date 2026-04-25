"use client";

import { ListChecks, Send } from "lucide-react";
import Link from "next/link";

import { BroadcastDialog } from "@/components/communication/broadcast-dialog";
import { MessagingPanel } from "@/components/communication/messaging-panel";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useSession } from "@/lib/auth/current";
import { useDataset } from "@/lib/mock/store";

export function CommunicationShell() {
  const dataset = useDataset();
  const session = useSession();
  const tenantId = session?.tenantId ?? dataset.tenants[0]?.id;
  const tenantNotifications = dataset.notifications
    .filter((n) => n.tenantId === tenantId)
    .slice(0, 6);

  return (
    <div className="p-4 pb-12 flex-1 max-w-6xl" data-testid="communication-shell">
      <div className="flex items-center gap-2 mb-3 flex-wrap">
        <BroadcastDialog />
        <Button
          variant="outline"
          size="sm"
          render={<Link href="/communication/notifications" data-testid="comms-notifications-link" />}
        >
          <ListChecks className="h-3.5 w-3.5" /> Notifications log
        </Button>
      </div>
      <MessagingPanel />
      <Card className="mt-4" data-testid="comms-recent-dispatches">
        <CardContent className="p-4">
          <h2 className="text-sm font-medium mb-3 flex items-center gap-2">
            <Send className="h-3.5 w-3.5" /> Recent dispatches
          </h2>
          {tenantNotifications.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No notifications dispatched yet — broadcasts and triggered alerts appear here.
            </p>
          ) : (
            <ul className="space-y-2 text-sm">
              {tenantNotifications.map((n) => (
                <li key={n.id} className="border-b last:border-b-0 pb-2 last:pb-0">
                  <div className="text-xs text-muted-foreground capitalize">
                    {n.category.replace("_", " ")} · {n.channel}
                  </div>
                  <p className="font-medium leading-tight">{n.subject}</p>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
