"use client";

import { Building, Database, FileLock, FileText, Receipt, Shield, Users } from "lucide-react";
import Link from "next/link";

import { Card, CardContent } from "@/components/ui/card";

const SECTIONS = [
  { slug: "yard-profile", icon: Building, title: "Yard profile", body: "Name, address, emergency contacts.", href: "/settings/yard-profile", available: true },
  { slug: "users", icon: Users, title: "Users & roles", body: "Manage staff, clients and visiting professionals.", href: "/settings/users", available: true },
  { slug: "rbac", icon: Shield, title: "Roles & permissions", body: "RBAC matrix per role.", href: "/settings/rbac", available: true },
  { slug: "xero", icon: Database, title: "Xero", body: "OAuth, organisation mapping, livery package codes.", href: "/settings/xero", available: true },
  { slug: "billing", icon: Receipt, title: "Billing", body: "Subscription, invoicing date, VAT, payment terms.", href: "#", available: false },
  { slug: "audit", icon: FileText, title: "Audit log", body: "Every change, every user, every timestamp.", href: "/settings/audit-log", available: true },
  { slug: "gdpr", icon: FileLock, title: "GDPR tooling", body: "SAR workflow, right to erasure, data export.", href: "#", available: false },
];

export function SettingsShell() {
  return (
    <div className="p-4 pb-12 flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3" data-testid="settings-grid">
      {SECTIONS.map((s) => {
        const Icon = s.icon;
        const inner = (
          <CardContent className="p-4 flex items-start gap-3">
            <div className="rounded-md bg-primary/10 p-2 shrink-0">
              <Icon className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-sm leading-tight">{s.title}</h3>
              <p className="text-xs text-muted-foreground mt-1">
                {s.body}
                {!s.available && " · coming soon"}
              </p>
            </div>
          </CardContent>
        );
        if (s.available) {
          return (
            <Link
              key={s.slug}
              href={s.href}
              data-testid={`settings-section-${s.slug}`}
              className="block"
            >
              <Card className="hover:bg-accent/30 transition cursor-pointer">{inner}</Card>
            </Link>
          );
        }
        return (
          <Card
            key={s.slug}
            data-testid={`settings-section-${s.slug}`}
            className="opacity-60"
          >
            {inner}
          </Card>
        );
      })}
    </div>
  );
}
