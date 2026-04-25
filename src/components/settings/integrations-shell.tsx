"use client";

import { CreditCard, Database, Repeat, Send, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useSession } from "@/lib/auth/current";
import { useDataset } from "@/lib/mock/store";

interface IntegrationState {
  stripe: boolean;
  gocardless: boolean;
  twilio: boolean;
}

const STRIPE_KEY = "pp:integration:stripe";
const GC_KEY = "pp:integration:gocardless";
const TWILIO_KEY = "pp:integration:twilio";

function readPersisted(): IntegrationState {
  if (typeof window === "undefined") return { stripe: false, gocardless: false, twilio: false };
  return {
    stripe: window.localStorage.getItem(STRIPE_KEY) === "1",
    gocardless: window.localStorage.getItem(GC_KEY) === "1",
    twilio: window.localStorage.getItem(TWILIO_KEY) === "1",
  };
}

function persist(key: string, on: boolean) {
  if (typeof window === "undefined") return;
  if (on) window.localStorage.setItem(key, "1");
  else window.localStorage.removeItem(key);
}

export function IntegrationsShell() {
  const dataset = useDataset();
  const session = useSession();
  const tenantId = session?.tenantId ?? dataset.tenants[0]?.id;
  const tenant = dataset.tenants.find((t) => t.id === tenantId);
  const xeroConnected = !!tenant?.xeroTenantId;

  const [state, setState] = useState<IntegrationState>(() => readPersisted());

  function toggle(key: keyof IntegrationState) {
    const newVal = !state[key];
    setState((s) => ({ ...s, [key]: newVal }));
    const lsKey = key === "stripe" ? STRIPE_KEY : key === "gocardless" ? GC_KEY : TWILIO_KEY;
    persist(lsKey, newVal);
    toast.success(`${key} ${newVal ? "connected" : "disconnected"}`);
  }

  return (
    <div className="p-4 pb-12 flex-1 max-w-4xl space-y-4" data-testid="integrations-shell">
      <h1 className="text-xl font-display italic font-semibold">Integrations</h1>

      <Card data-testid="integration-card-xero">
        <CardContent className="p-4 flex items-start gap-4">
          <div className="rounded-md bg-primary/10 p-3 shrink-0">
            <Database className="h-6 w-6 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="font-medium">Xero</h2>
              {xeroConnected ? (
                <Badge className="bg-emerald-500 text-white hover:bg-emerald-500 gap-1">
                  <ShieldCheck className="h-3 w-3" /> Connected
                </Badge>
              ) : (
                <Badge variant="outline">Not connected</Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Single source of truth for invoicing + payments. Connect your Xero organisation
              once; PaddocPro pushes invoices and reads payment status via webhooks.
            </p>
          </div>
          <Button
            size="sm"
            render={<Link href="/settings/xero" data-testid="integration-card-xero-action" />}
          >
            {xeroConnected ? "Manage" : "Set up"}
          </Button>
        </CardContent>
      </Card>

      <Card data-testid="integration-card-stripe">
        <CardContent className="p-4 flex items-start gap-4">
          <div className="rounded-md bg-primary/10 p-3 shrink-0">
            <CreditCard className="h-6 w-6 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="font-medium">Stripe</h2>
              {state.stripe ? (
                <Badge className="bg-emerald-500 text-white hover:bg-emerald-500 gap-1">
                  <ShieldCheck className="h-3 w-3" /> Connected
                </Badge>
              ) : (
                <Badge variant="outline">Not connected</Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Take card payments on Xero-issued online invoice links. Test mode by default; flip to
              live when you&apos;re ready.
            </p>
          </div>
          <Button
            size="sm"
            variant={state.stripe ? "outline" : "default"}
            onClick={() => toggle("stripe")}
            data-testid="integration-card-stripe-action"
          >
            {state.stripe ? "Disconnect" : "Connect Stripe"}
          </Button>
        </CardContent>
      </Card>

      <Card data-testid="integration-card-gocardless">
        <CardContent className="p-4 flex items-start gap-4">
          <div className="rounded-md bg-primary/10 p-3 shrink-0">
            <Repeat className="h-6 w-6 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="font-medium">GoCardless</h2>
              {state.gocardless ? (
                <Badge className="bg-emerald-500 text-white hover:bg-emerald-500 gap-1">
                  <ShieldCheck className="h-3 w-3" /> Connected
                </Badge>
              ) : (
                <Badge variant="outline">Not connected</Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Recurring Direct Debit collection for monthly livery fees. Lower fees than card,
              one-tap mandate sign-up for clients.
            </p>
          </div>
          <Button
            size="sm"
            variant={state.gocardless ? "outline" : "default"}
            onClick={() => toggle("gocardless")}
            data-testid="integration-card-gocardless-action"
          >
            {state.gocardless ? "Disconnect" : "Connect GoCardless"}
          </Button>
        </CardContent>
      </Card>

      <Card data-testid="integration-card-twilio">
        <CardContent className="p-4 flex items-start gap-4">
          <div className="rounded-md bg-primary/10 p-3 shrink-0">
            <Send className="h-6 w-6 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="font-medium">Twilio (SMS)</h2>
              {state.twilio ? (
                <Badge className="bg-emerald-500 text-white hover:bg-emerald-500 gap-1">
                  <ShieldCheck className="h-3 w-3" /> Connected
                </Badge>
              ) : (
                <Badge variant="outline">Not connected</Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Send transactional SMS — emergency alerts, vacc reminders, payment overdue. Stored
              per-yard so each tenant can use its own sender ID.
            </p>
          </div>
          <Button
            size="sm"
            variant={state.twilio ? "outline" : "default"}
            onClick={() => toggle("twilio")}
            data-testid="integration-card-twilio-action"
          >
            {state.twilio ? "Disconnect" : "Connect Twilio"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
