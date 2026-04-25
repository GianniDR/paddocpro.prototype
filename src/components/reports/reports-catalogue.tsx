"use client";

import { BarChart3, Building, FileText, HeartPulse, Receipt, Users } from "lucide-react";
import Link from "next/link";

import { Card, CardContent } from "@/components/ui/card";

const REPORTS = [
  {
    slug: "occupancy",
    icon: Building,
    name: "Occupancy",
    description: "Stable occupancy, livery type split, vacancy trend.",
    frequency: "Daily / Monthly",
    available: true,
  },
  {
    slug: "revenue",
    icon: Receipt,
    name: "Revenue summary",
    description: "Total revenue by livery type and add-ons (Xero-sourced).",
    frequency: "Monthly / Annual",
    available: false,
  },
  {
    slug: "aged-debtors",
    icon: BarChart3,
    name: "Aged debtors",
    description: "Outstanding balance by client, bucketed 0-30 / 31-60 / 90+.",
    frequency: "On demand",
    available: true,
  },
  {
    slug: "horse-health",
    icon: HeartPulse,
    name: "Horse health overview",
    description: "Vaccination, worming, farrier and dental status per horse.",
    frequency: "Weekly",
    available: true,
  },
  {
    slug: "task-completion",
    icon: FileText,
    name: "Task completion",
    description: "Completion rates by staff and category.",
    frequency: "Daily / Weekly",
    available: false,
  },
  {
    slug: "staff-hours",
    icon: Users,
    name: "Staff hours",
    description: "Hours worked vs rota per staff member.",
    frequency: "Monthly",
    available: false,
  },
];

export function ReportsCatalogue() {
  return (
    <div className="p-4 pb-12 flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3" data-testid="reports-catalogue">
      {REPORTS.map((r) => {
        const Icon = r.icon;
        const inner = (
          <CardContent className="p-4 flex items-start gap-3">
            <div className="rounded-md bg-primary/10 p-2 shrink-0">
              <Icon className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-sm leading-tight">{r.name}</h3>
              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{r.description}</p>
              <p className="text-[10px] text-muted-foreground mt-2 uppercase tracking-wide">
                {r.frequency} {r.available ? "" : "· coming soon"}
              </p>
            </div>
          </CardContent>
        );
        if (r.available) {
          return (
            <Link
              key={r.slug}
              href={`/reports/${r.slug}`}
              data-testid={`report-card-${r.slug}`}
              className="block"
            >
              <Card className="hover:bg-accent/30 transition cursor-pointer">{inner}</Card>
            </Link>
          );
        }
        return (
          <Card
            key={r.slug}
            className="opacity-60"
            data-testid={`report-card-${r.slug}`}
          >
            {inner}
          </Card>
        );
      })}
    </div>
  );
}
