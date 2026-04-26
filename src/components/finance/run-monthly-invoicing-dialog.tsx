"use client";

import { Receipt, Sparkles } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useSession } from "@/lib/auth/current";
import { formatGbp } from "@/lib/format";
import { now } from "@/lib/mock/clock";
import { newId } from "@/lib/mock/id-prefixes";
import { mutate, useDataset } from "@/lib/mock/store";

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

interface RunMonthlyInvoicingDialogProps {
  open?: boolean;
  onOpenChange?: (next: boolean) => void;
}

export function RunMonthlyInvoicingDialog({
  open: openProp,
  onOpenChange,
}: RunMonthlyInvoicingDialogProps = {}) {
  const dataset = useDataset();
  const session = useSession();
  const tenantId = session?.tenantId ?? dataset.tenants[0]?.id;
  const [internalOpen, setInternalOpen] = useState(false);
  const open = openProp ?? internalOpen;
  const setOpen = (v: boolean) => {
    if (onOpenChange) onOpenChange(v);
    if (openProp === undefined) setInternalOpen(v);
  };
  const [submitting, setSubmitting] = useState(false);

  // Compute the invoicing preview: 1 invoice per active livery contract
  const preview = useMemo(() => {
    if (!tenantId) return { lines: [], totalPence: 0 };
    const tenantHorses = dataset.horses.filter((h) => h.tenantId === tenantId && !h.archivedAt);
    let total = 0;
    const lines = tenantHorses.map((h) => {
      const owner = dataset.clients.find((c) => c.id === h.primaryOwnerId);
      const ownerUser = dataset.users.find((u) => u.id === owner?.userAccountId);
      const pkg = dataset.liveryPackages.find((p) => p.id === h.liveryPackageId);
      const pence = pkg?.basePriceMonthlyPence ?? 0;
      total += pence;
      return {
        horseId: h.id,
        horseName: h.stableName,
        clientId: owner?.id ?? "",
        clientName: ownerUser ? `${ownerUser.firstName} ${ownerUser.lastName}` : "—",
        packageName: pkg?.name ?? "—",
        pricePence: pence,
        xeroItemCode: pkg?.xeroItemCode ?? "",
      };
    });
    return { lines, totalPence: total };
  }, [dataset, tenantId]);

  const period = (() => {
    const d = now();
    return `${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
  })();

  // ~Xero rate-limit batching simulation: 50 invoices per call
  const apiCalls = Math.ceil(preview.lines.length / 50);

  async function run() {
    if (!tenantId) return;
    setSubmitting(true);
    let invNumberCounter = 9000;
    await mutate((d) => {
      // Group lines by client → one invoice per client
      const byClient: Record<string, typeof preview.lines> = {};
      preview.lines.forEach((l) => {
        if (!l.clientId) return;
        (byClient[l.clientId] ??= []).push(l);
      });
      Object.entries(byClient).forEach(([clientId, lines]) => {
        const subtotalPence = lines.reduce((s, l) => s + l.pricePence, 0);
        const vatPence = Math.round(subtotalPence * 0.2);
        const totalPence = subtotalPence + vatPence;
        const invoiceNumber = `INV-${invNumberCounter++}`;
        const issuedAt = now().toISOString();
        const invoice = {
          id: newId("invoice", `auto-${clientId}`),
          tenantId,
          createdAt: issuedAt,
          updatedAt: issuedAt,
          clientId,
          xeroInvoiceId: `xero_inv_${invoiceNumber}`,
          invoiceNumber,
          lines: lines.map((l) => ({
            description: `${l.packageName} — ${period} (${l.horseName})`,
            quantity: 1,
            unitPricePence: l.pricePence,
            xeroItemCode: l.xeroItemCode,
            totalPence: l.pricePence,
          })),
          subtotalPence,
          vatPence,
          totalPence,
          paidAmountPence: 0,
          issuedAt,
          dueAt: new Date(Date.parse(issuedAt) + 14 * 86_400_000).toISOString(),
          status: "authorised" as const,
          xeroOnlineInvoiceUrl: `https://mock.paddocpro.local/pay/${invoiceNumber}`,
          idempotencyKey: `${tenantId}-${period}-${clientId}`,
        };
        d.invoices.unshift(invoice);
      });
    });

    const uniqueClients = new Set(preview.lines.map((l) => l.clientId).filter(Boolean));
    toast.success(`Monthly invoicing run complete`, {
      description: `${uniqueClients.size} invoices created · ${formatGbp(preview.totalPence)} total · ${apiCalls} Xero API call${apiCalls === 1 ? "" : "s"}.`,
    });
    setSubmitting(false);
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {openProp === undefined && (
        <DialogTrigger
          render={
            <Button size="sm" data-testid="finance-grid-run-monthly">
              <Receipt className="h-3.5 w-3.5" /> Run monthly invoicing
            </Button>
          }
        />
      )}
      <DialogContent className="max-w-2xl" data-testid="dialog-run-monthly-invoicing">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" /> Monthly invoicing — {period}
          </DialogTitle>
          <DialogDescription>
            One invoice per client, grouped by horse + livery package. Idempotency keyed on tenant +
            period + client; re-running this month is a no-op.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3 max-h-[50vh] overflow-y-auto">
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">{preview.lines.length} active livery contracts</Badge>
            <Badge variant="secondary">{formatGbp(preview.totalPence)} forecast (subtotal)</Badge>
            <Badge variant="secondary">{apiCalls} Xero API call{apiCalls === 1 ? "" : "s"} (50 / call)</Badge>
          </div>
          <div className="border rounded-md overflow-hidden bg-card">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-muted-foreground">
                <tr>
                  <th className="text-left font-medium px-3 py-2">Horse</th>
                  <th className="text-left font-medium px-3 py-2">Client</th>
                  <th className="text-left font-medium px-3 py-2">Package</th>
                  <th className="text-right font-medium px-3 py-2">Price</th>
                </tr>
              </thead>
              <tbody>
                {preview.lines.slice(0, 12).map((l) => (
                  <tr key={l.horseId} className="border-t">
                    <td className="px-3 py-2 font-medium">{l.horseName}</td>
                    <td className="px-3 py-2">{l.clientName}</td>
                    <td className="px-3 py-2">{l.packageName}</td>
                    <td className="px-3 py-2 text-right tabular-nums">{formatGbp(l.pricePence)}</td>
                  </tr>
                ))}
                {preview.lines.length > 12 && (
                  <tr className="border-t">
                    <td colSpan={4} className="px-3 py-2 text-center text-muted-foreground">
                      + {preview.lines.length - 12} more horses…
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} data-testid="dialog-run-monthly-invoicing-cancel">
            Cancel
          </Button>
          <Button onClick={run} disabled={submitting || preview.lines.length === 0} data-testid="dialog-run-monthly-invoicing-confirm">
            {submitting ? "Running…" : `Generate ${preview.lines.length} invoices`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
