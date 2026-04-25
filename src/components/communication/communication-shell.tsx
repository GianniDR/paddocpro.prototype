"use client";

import { ListChecks, Send, Sparkles } from "lucide-react";
import Link from "next/link";

import { BroadcastDialog } from "@/components/communication/broadcast-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useSession } from "@/lib/auth/current";
import { formatDateTime } from "@/lib/format";
import { useDataset } from "@/lib/mock/store";

export function CommunicationShell() {
  const dataset = useDataset();
  const session = useSession();
  const tenantId = session?.tenantId ?? dataset.tenants[0]?.id;
  const tenantNotifications = dataset.notifications
    .filter((n) => n.tenantId === tenantId)
    .slice(0, 12);

  const tenantThreads = dataset.threads.filter((t) => t.tenantId === tenantId).slice(0, 6);

  return (
    <div className="p-4 pb-12 flex-1 max-w-5xl" data-testid="communication-shell">
      <div className="flex items-center gap-2 mb-3">
        <BroadcastDialog />
        <Button
          variant="outline"
          size="sm"
          render={<Link href="/communication/notifications" data-testid="comms-notifications-link" />}
        >
          <ListChecks className="h-3.5 w-3.5" /> Notifications log
        </Button>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card data-testid="comms-recent-threads">
          <CardContent className="p-4">
            <h2 className="text-sm font-medium mb-3">Recent threads</h2>
            {tenantThreads.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No threads yet — start a broadcast or direct message.
              </p>
            ) : (
              <ul className="space-y-2 text-sm">
                {tenantThreads.map((t) => {
                  const message = dataset.messages.find((m) => m.threadId === t.id);
                  const author = dataset.users.find((u) => u.id === message?.authorId);
                  return (
                    <li key={t.id} className="rounded-md border bg-card p-3">
                      <div className="text-xs text-muted-foreground">
                        {t.kind.replace("_", " ")} · {t.participantUserIds.length} recipients
                      </div>
                      <p className="font-medium">{t.subject ?? "(no subject)"}</p>
                      <div className="text-xs text-muted-foreground mt-1">
                        {author ? `${author.firstName} ${author.lastName}` : "—"} · {formatDateTime(t.createdAt)}
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </CardContent>
        </Card>
        <Card data-testid="comms-recent-dispatches">
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
      <Card className="mt-4 bg-card/50 border-dashed">
        <CardContent className="p-4 flex items-center gap-3 text-sm text-muted-foreground">
          <Sparkles className="h-4 w-4 text-primary" />
          Direct messaging UI ships next iteration; broadcasts and notifications already drive real
          records.
        </CardContent>
      </Card>
    </div>
  );
}
