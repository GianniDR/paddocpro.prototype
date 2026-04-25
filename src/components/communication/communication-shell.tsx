"use client";

import { Send, Sparkles } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { useDataset } from "@/lib/mock/store";

export function CommunicationShell() {
  const dataset = useDataset();
  const recentNotifications = dataset.notifications.slice(0, 8);

  return (
    <div className="p-4 pb-12 flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4 max-w-5xl">
      <Card>
        <CardContent className="p-4">
          <h2 className="text-sm font-medium mb-3">Notice board</h2>
          <ul className="space-y-2 text-sm">
            <li className="rounded-md border bg-card p-3">
              <div className="text-xs text-muted-foreground">Yard manager · pinned</div>
              <p className="font-medium">Farrier visit Friday — please bring horses in by 09:00.</p>
            </li>
            <li className="rounded-md border bg-card p-3">
              <div className="text-xs text-muted-foreground">2 days ago</div>
              <p className="font-medium">New hay delivery in Coppice Block — please use first.</p>
            </li>
          </ul>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4">
          <h2 className="text-sm font-medium mb-3 flex items-center gap-2">
            <Send className="h-3.5 w-3.5" /> Recent dispatches
          </h2>
          {recentNotifications.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No notifications dispatched yet — broadcast tools will appear here.
            </p>
          ) : (
            <ul className="space-y-2 text-sm">
              {recentNotifications.map((n) => (
                <li key={n.id} className="border-b last:border-b-0 pb-2 last:pb-0">
                  {n.subject ?? n.body.slice(0, 80)}
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
      <Card className="lg:col-span-2 bg-card/50 border-dashed">
        <CardContent className="p-4 flex items-center gap-3 text-sm text-muted-foreground">
          <Sparkles className="h-4 w-4 text-primary" />
          Direct messaging, broadcasts, and templated reminders coming with the next iteration.
        </CardContent>
      </Card>
    </div>
  );
}
