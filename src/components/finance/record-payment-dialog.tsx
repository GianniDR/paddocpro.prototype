"use client";

import { Receipt } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatGbp } from "@/lib/format";
import { now } from "@/lib/mock/clock";
import { newId } from "@/lib/mock/id-prefixes";
import { mutate, useDataset } from "@/lib/mock/store";
import type { FinancePaymentMethod, Invoice } from "@/types";

const METHODS: { value: FinancePaymentMethod; label: string }[] = [
  { value: "stripe_card", label: "Card (Stripe)" },
  { value: "gocardless_dd", label: "Direct Debit (GoCardless)" },
  { value: "bacs_manual", label: "Manual BACS" },
  { value: "cash", label: "Cash" },
  { value: "cheque", label: "Cheque" },
];

export function RecordPaymentDialog({ invoice }: { invoice: Invoice }) {
  const dataset = useDataset();
  const outstanding = invoice.totalPence - invoice.paidAmountPence;
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [method, setMethod] = useState<FinancePaymentMethod>("stripe_card");
  const [amount, setAmount] = useState<string>((outstanding / 100).toFixed(2));
  const [reference, setReference] = useState("");
  const [error, setError] = useState<string | null>(null);

  const amountPence = Math.round(parseFloat(amount || "0") * 100);
  const wouldBecome = invoice.paidAmountPence + amountPence;
  const fullyPaid = wouldBecome >= invoice.totalPence;

  async function submit() {
    if (amountPence <= 0) {
      setError("Amount must be greater than zero.");
      return;
    }
    if (amountPence > outstanding) {
      setError(`Amount exceeds outstanding balance of ${formatGbp(outstanding)}.`);
      return;
    }
    setSubmitting(true);
    setError(null);
    await mutate((d) => {
      const inv = d.invoices.find((i) => i.id === invoice.id);
      if (!inv) return;
      inv.paidAmountPence += amountPence;
      if (inv.paidAmountPence >= inv.totalPence) inv.status = "paid";
      inv.updatedAt = now().toISOString();
      d.payments.unshift({
        id: newId("payment", `${invoice.id}-${Date.now()}`),
        tenantId: invoice.tenantId,
        createdAt: now().toISOString(),
        updatedAt: now().toISOString(),
        invoiceId: invoice.id,
        xeroPaymentId: `xero_pmt_${invoice.invoiceNumber}_${Date.now()}`,
        amountPence,
        paidAt: now().toISOString(),
        method,
        reference: reference || null,
      });
    });
    setSubmitting(false);
    toast.success(
      fullyPaid
        ? `${invoice.invoiceNumber} marked as paid`
        : `Partial payment recorded · £${(amountPence / 100).toFixed(2)}`,
    );
    setOpen(false);
    setReference("");
  }

  if (invoice.status === "paid" || invoice.status === "voided") {
    return (
      <Button size="sm" variant="outline" disabled>
        {invoice.status === "paid" ? "Already paid" : "Voided"}
      </Button>
    );
  }

  // Force-use dataset to silence unused-import warning while keeping type-narrowing
  void dataset;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button size="sm" data-testid="finance-record-payment-trigger">
            <Receipt className="h-3.5 w-3.5" /> Record payment
          </Button>
        }
      />
      <DialogContent className="max-w-md" data-testid="dialog-record-payment">
        <DialogHeader>
          <DialogTitle>Record payment — {invoice.invoiceNumber}</DialogTitle>
          <DialogDescription>
            Outstanding {formatGbp(outstanding)}. Posts a Payment to Xero (mock) and updates the
            invoice status.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label>Method</Label>
            <Select value={method} onValueChange={(v) => v && setMethod(v as FinancePaymentMethod)}>
              <SelectTrigger data-testid="dialog-record-payment-method">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {METHODS.map((m) => (
                  <SelectItem key={m.value} value={m.value}>
                    {m.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Amount (£)</Label>
            <Input
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              data-testid="dialog-record-payment-amount"
            />
          </div>
          <div className="space-y-1.5">
            <Label>Reference (optional)</Label>
            <Input
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              placeholder="STRIPE-CH-123 / cheque #42"
              data-testid="dialog-record-payment-reference"
            />
          </div>
          {error && (
            <p className="text-xs text-destructive" data-testid="dialog-record-payment-error">
              {error}
            </p>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} data-testid="dialog-record-payment-cancel">
            Cancel
          </Button>
          <Button
            onClick={submit}
            disabled={submitting || amountPence <= 0 || amountPence > outstanding}
            data-testid="dialog-record-payment-submit"
          >
            {submitting ? "Recording…" : "Record payment"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
