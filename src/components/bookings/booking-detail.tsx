"use client";

import Link from "next/link";

import { StatusBadge } from "@/components/shell/status-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatDateTime } from "@/lib/format";
import { useDataset } from "@/lib/mock/store";

export function BookingDetail({ bookingId }: { bookingId: string }) {
  const dataset = useDataset();
  const bk = dataset.bookings.find((b) => b.id === bookingId);
  if (!bk) return <p className="text-sm text-muted-foreground">Booking not found.</p>;
  const r = dataset.resources.find((x) => x.id === bk.resourceId);
  const horse = dataset.horses.find((h) => h.id === bk.horseId);
  const client = dataset.clients.find((c) => c.id === bk.clientId);
  const clientUser = dataset.users.find((u) => u.id === client?.userAccountId);
  const staff = dataset.users.filter((u) => bk.staffIds.includes(u.id));

  return (
    <div className="space-y-4 max-w-3xl">
      <Card>
        <CardContent className="p-4 space-y-3 text-sm">
          <div className="flex items-center gap-2">
            <StatusBadge status={bk.status} />
            <Badge variant="outline" className="capitalize">
              {bk.type.replace("_", " ")}
            </Badge>
          </div>
          <Field label="When">{formatDateTime(bk.startAt)} → {formatDateTime(bk.endAt)}</Field>
          <Field label="Resource">{r?.name ?? "—"}</Field>
          <Field label="Horse">
            {horse ? (
              <Button variant="link" size="sm" className="h-auto px-0" render={<Link href={`/horses/${horse.id}`} data-testid={`drill-horse-${horse.id}`} />}>
                {horse.stableName}
              </Button>
            ) : (
              "—"
            )}
          </Field>
          <Field label="Client">{clientUser ? `${clientUser.firstName} ${clientUser.lastName}` : "—"}</Field>
          <Field label="Staff">{staff.map((u) => `${u.firstName} ${u.lastName}`).join(", ") || "—"}</Field>
          {bk.notes && <Field label="Notes">{bk.notes}</Field>}
        </CardContent>
      </Card>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-4 border-b last:border-b-0 pb-2 last:pb-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-right">{children}</span>
    </div>
  );
}
