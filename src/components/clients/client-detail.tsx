"use client";

import Link from "next/link";

import { StatusBadge } from "@/components/shell/status-badge";
import { Card, CardContent } from "@/components/ui/card";
import { formatDate, formatGbp } from "@/lib/format";
import { useDataset } from "@/lib/mock/store";

export function ClientDetail({ clientId }: { clientId: string }) {
  const dataset = useDataset();
  const client = dataset.clients.find((c) => c.id === clientId);
  if (!client) return <p className="text-sm text-muted-foreground">Client not found.</p>;
  const user = dataset.users.find((u) => u.id === client.userAccountId);
  const horses = dataset.horses.filter((h) => h.primaryOwnerId === client.id);
  const invoices = dataset.invoices.filter((i) => i.clientId === client.id);
  const outstanding = invoices.filter((i) => i.status === "authorised").reduce((s, i) => s + (i.totalPence - i.paidAmountPence), 0);

  return (
    <div className="space-y-4 max-w-3xl">
      <Card>
        <CardContent className="p-4 space-y-3 text-sm">
          <div className="flex items-center gap-2">
            <StatusBadge status={client.portalAccessStatus} />
          </div>
          <Field label="Name">{user ? `${user.firstName} ${user.lastName}` : "—"}</Field>
          <Field label="Email">{user?.email ?? "—"}</Field>
          <Field label="Phone">{user?.phone ?? "—"}</Field>
          <Field label="Address">{`${client.addressLine1}, ${client.city}, ${client.postcode}`}</Field>
          <Field label="Date of birth">{formatDate(client.dateOfBirth)}</Field>
          <Field label="Riding ability">{client.ridingAbility}</Field>
          <Field label="Emergency contact">
            {client.emergencyContactName} ({client.emergencyContactRelation}) — {client.emergencyContactPhone}
          </Field>
          <Field label="Insurance">
            {client.insuranceProvider ? `${client.insuranceProvider} (exp ${formatDate(client.insuranceExpiry)})` : "—"}
          </Field>
          <Field label="Payment method">{client.paymentMethod}</Field>
          <Field label="Outstanding">{formatGbp(outstanding)}</Field>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4">
          <h3 className="text-sm font-medium mb-2">Horses ({horses.length})</h3>
          <ul className="space-y-1 text-sm">
            {horses.map((h) => (
              <li key={h.id}>
                <Link
                  href={`/horses/${h.id}`}
                  className="text-primary hover:underline"
                  data-testid={`drill-horse-${h.id}`}
                >
                  {h.stableName}
                </Link>{" "}
                <span className="text-muted-foreground">— {h.breed}, {h.colour}</span>
              </li>
            ))}
            {horses.length === 0 && <li className="text-muted-foreground">No horses.</li>}
          </ul>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4">
          <h3 className="text-sm font-medium mb-2">Recent invoices ({invoices.length})</h3>
          <ul className="space-y-1 text-sm">
            {invoices.slice(0, 5).map((i) => (
              <li key={i.id} className="flex items-center justify-between">
                <span>
                  {i.invoiceNumber} · {formatDate(i.issuedAt)}
                </span>
                <span className="flex items-center gap-2">
                  {formatGbp(i.totalPence)} <StatusBadge status={i.status} />
                </span>
              </li>
            ))}
            {invoices.length === 0 && <li className="text-muted-foreground">No invoices.</li>}
          </ul>
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
