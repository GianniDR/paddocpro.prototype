"use client";

import { Check, ChevronRight, Database, Link2, ShieldCheck, Sparkles } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSession } from "@/lib/auth/current";
import { now } from "@/lib/mock/clock";
import { mutate, useDataset } from "@/lib/mock/store";

const STEPS = [
  { slug: "connect", label: "Connect to Xero" },
  { slug: "organisation", label: "Select organisation" },
  { slug: "mapping", label: "Map livery packages" },
  { slug: "vat", label: "Confirm bank + VAT" },
  { slug: "webhooks", label: "Register webhooks" },
] as const;

type StepSlug = (typeof STEPS)[number]["slug"];

const MOCK_ORGS = [
  { id: "xero_org_riverbend", name: "Riverbend Stables Ltd" },
  { id: "xero_org_beechhollow", name: "Beech Hollow Equestrian Ltd" },
  { id: "xero_org_foxbarn", name: "Foxbarn Livery LLP" },
];

const MOCK_BANK_ACCOUNTS = [
  "Barclays Business Current — •••• 4321",
  "Lloyds Business Current — •••• 8877",
  "NatWest Equine — •••• 1102",
];

export function XeroConnectWizard() {
  const dataset = useDataset();
  const session = useSession();
  const tenantId = session?.tenantId ?? dataset.tenants[0]?.id;
  const tenant = dataset.tenants.find((t) => t.id === tenantId);
  const [step, setStep] = useState<StepSlug>(tenant?.xeroTenantId ? "webhooks" : "connect");
  const [submitting, setSubmitting] = useState(false);
  const [orgId, setOrgId] = useState(tenant?.xeroTenantId ?? MOCK_ORGS[0].id);
  const [bankAccount, setBankAccount] = useState(MOCK_BANK_ACCOUNTS[0]);
  const [vatRate, setVatRate] = useState("20");

  const tenantPackages = dataset.liveryPackages.filter((p) => p.tenantId === tenantId);
  const stepIdx = STEPS.findIndex((s) => s.slug === step);
  const isConnected = !!tenant?.xeroTenantId;

  async function authorize() {
    setSubmitting(true);
    // Simulate the OAuth round-trip
    await new Promise((r) => setTimeout(r, 800));
    setStep("organisation");
    setSubmitting(false);
  }

  async function selectOrg() {
    setSubmitting(true);
    await mutate((d) => {
      const t = d.tenants.find((t) => t.id === tenant!.id);
      if (!t) return;
      t.xeroTenantId = orgId;
      t.xeroConnectedAt = now().toISOString();
    });
    setSubmitting(false);
    setStep("mapping");
    toast.success("Xero organisation connected");
  }

  async function disconnect() {
    setSubmitting(true);
    await mutate((d) => {
      const t = d.tenants.find((t) => t.id === tenant!.id);
      if (!t) return;
      t.xeroTenantId = null;
      t.xeroConnectedAt = null;
    });
    setSubmitting(false);
    setStep("connect");
    toast.success("Disconnected from Xero");
  }

  return (
    <div className="p-4 pb-12 flex-1 max-w-3xl" data-testid="xero-wizard">
      <Card className="bg-card border rounded-lg mb-4">
        <CardContent className="px-6 py-4 flex items-center gap-4 flex-wrap">
          {STEPS.map((s, i) => {
            const done = (isConnected && (i === 0 || i === 1)) || i < stepIdx;
            const active = i === stepIdx;
            return (
              <div
                key={s.slug}
                className="flex items-center gap-2"
                data-testid={`xero-wizard-step-${i + 1}`}
              >
                <div
                  className={
                    "h-7 w-7 rounded-full text-xs font-medium flex items-center justify-center " +
                    (active
                      ? "bg-primary text-primary-foreground"
                      : done
                        ? "bg-emerald-500 text-white"
                        : "bg-muted text-muted-foreground")
                  }
                >
                  {done ? <Check className="h-3.5 w-3.5" /> : i + 1}
                </div>
                <span className={"text-sm " + (active ? "font-medium" : "text-muted-foreground")}>
                  {s.label}
                </span>
                {i < STEPS.length - 1 && <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />}
              </div>
            );
          })}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6 space-y-4">
          {isConnected && (
            <div className="flex items-center gap-2 p-3 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-900 text-sm">
              <ShieldCheck className="h-4 w-4" />
              Connected to <strong>{MOCK_ORGS.find((o) => o.id === tenant?.xeroTenantId)?.name ?? "Xero"}</strong>{" "}
              — synced {tenant?.xeroConnectedAt ? new Date(tenant.xeroConnectedAt).toLocaleDateString("en-GB") : "—"}
            </div>
          )}

          {step === "connect" && !isConnected && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                <h2 className="text-base font-medium">Connect PaddocPro to Xero</h2>
              </div>
              <p className="text-sm text-muted-foreground">
                Authorise PaddocPro to push invoices, sync payments, and read your chart of accounts.
                We&apos;ll never store your password.
              </p>
              <Button
                onClick={authorize}
                disabled={submitting}
                data-testid="xero-wizard-authorize"
              >
                <Link2 className="h-3.5 w-3.5" /> {submitting ? "Redirecting to Xero…" : "Connect to Xero"}
              </Button>
            </div>
          )}

          {step === "organisation" && (
            <div className="space-y-3">
              <h2 className="text-base font-medium">Select your Xero organisation</h2>
              <Select value={orgId} onValueChange={(v) => v && setOrgId(v)}>
                <SelectTrigger data-testid="xero-wizard-org">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MOCK_ORGS.map((o) => (
                    <SelectItem key={o.id} value={o.id}>
                      {o.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button onClick={selectOrg} disabled={submitting} data-testid="xero-wizard-confirm-org">
                {submitting ? "Connecting…" : "Use this organisation"}
              </Button>
            </div>
          )}

          {step === "mapping" && (
            <div className="space-y-3">
              <h2 className="text-base font-medium">Map livery packages to Xero items</h2>
              <p className="text-xs text-muted-foreground">
                These item codes drive correct chart-of-accounts allocation in Xero.
              </p>
              <div className="border rounded-md overflow-hidden bg-card">
                <table className="w-full text-sm">
                  <thead className="bg-muted/40 text-muted-foreground">
                    <tr>
                      <th className="text-left font-medium px-3 py-2">PaddocPro package</th>
                      <th className="text-left font-medium px-3 py-2">Xero item code</th>
                      <th className="text-right font-medium px-3 py-2">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tenantPackages.map((p) => (
                      <tr key={p.id} className="border-t">
                        <td className="px-3 py-2 font-medium">{p.name}</td>
                        <td className="px-3 py-2 font-mono text-xs">{p.xeroItemCode}</td>
                        <td className="px-3 py-2 text-right">
                          <Badge className="bg-emerald-500 text-white hover:bg-emerald-500">Mapped</Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <Button onClick={() => setStep("vat")} data-testid="xero-wizard-confirm-mapping">
                Continue
              </Button>
            </div>
          )}

          {step === "vat" && (
            <div className="space-y-3">
              <h2 className="text-base font-medium">Confirm bank account and VAT</h2>
              <div className="space-y-2">
                <label className="text-sm">
                  <span className="text-muted-foreground">Default bank account</span>
                  <Select value={bankAccount} onValueChange={(v) => v && setBankAccount(v)}>
                    <SelectTrigger className="mt-1" data-testid="xero-wizard-bank">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {MOCK_BANK_ACCOUNTS.map((a) => (
                        <SelectItem key={a} value={a}>
                          {a}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </label>
                <label className="text-sm">
                  <span className="text-muted-foreground">VAT rate (%)</span>
                  <Select value={vatRate} onValueChange={(v) => v && setVatRate(v)}>
                    <SelectTrigger className="mt-1" data-testid="xero-wizard-vat">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">0% — Zero rated</SelectItem>
                      <SelectItem value="5">5% — Reduced</SelectItem>
                      <SelectItem value="20">20% — Standard</SelectItem>
                    </SelectContent>
                  </Select>
                </label>
              </div>
              <Button onClick={() => setStep("webhooks")} data-testid="xero-wizard-confirm-vat">
                Continue
              </Button>
            </div>
          )}

          {step === "webhooks" && (
            <div className="space-y-3">
              <h2 className="text-base font-medium">Register Invoice + Payment webhooks</h2>
              <p className="text-sm text-muted-foreground">
                We listen for Invoice.Updated and Payment.Created events so the dashboard reflects
                Xero changes in near real-time, with no polling.
              </p>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between border rounded-md px-3 py-2 bg-card">
                  <span className="font-mono text-xs">invoice.updated</span>
                  <Badge className="bg-emerald-500 text-white hover:bg-emerald-500">Registered</Badge>
                </div>
                <div className="flex items-center justify-between border rounded-md px-3 py-2 bg-card">
                  <span className="font-mono text-xs">payment.created</span>
                  <Badge className="bg-emerald-500 text-white hover:bg-emerald-500">Registered</Badge>
                </div>
              </div>
              <div className="flex gap-2 pt-3 border-t">
                <Button onClick={() => toast.success("Webhooks confirmed")} data-testid="xero-wizard-finish">
                  <Check className="h-3.5 w-3.5" /> Finish
                </Button>
                <Button variant="outline" onClick={disconnect} data-testid="xero-wizard-disconnect">
                  <Database className="h-3.5 w-3.5" /> Disconnect
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
