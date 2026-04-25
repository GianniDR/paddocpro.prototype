"use client";

import { Building, Database, FileLock, FileText, Receipt, Shield, Users } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

const SECTIONS = [
  { slug: "yard-profile", icon: Building, title: "Yard profile", body: "Name, address, emergency contacts." },
  { slug: "users", icon: Users, title: "Users & roles", body: "Manage staff, clients and visiting professionals." },
  { slug: "rbac", icon: Shield, title: "Roles & permissions", body: "RBAC matrix per role." },
  { slug: "integrations", icon: Database, title: "Integrations", body: "Xero, Stripe, GoCardless, SMS." },
  { slug: "billing", icon: Receipt, title: "Billing", body: "Subscription, invoicing date, VAT, payment terms." },
  { slug: "audit", icon: FileText, title: "Audit log", body: "Every change, every user, every timestamp." },
  { slug: "gdpr", icon: FileLock, title: "GDPR tooling", body: "SAR workflow, right to erasure, data export." },
];

export function SettingsShell() {
  return (
    <div className="p-4 pb-12 flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3" data-testid="settings-grid">
      {SECTIONS.map((s) => {
        const Icon = s.icon;
        return (
          <Card
            key={s.slug}
            className="hover:bg-accent/30 transition cursor-pointer"
            data-testid={`settings-section-${s.slug}`}
          >
            <CardContent className="p-4 flex items-start gap-3">
              <div className="rounded-md bg-primary/10 p-2 shrink-0">
                <Icon className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-sm leading-tight">{s.title}</h3>
                <p className="text-xs text-muted-foreground mt-1">{s.body}</p>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
