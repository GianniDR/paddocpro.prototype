"use client";

import Link from "next/link";

import { Card, CardContent } from "@/components/ui/card";

export interface DetailField {
  label: string;
  value: React.ReactNode;
}

export interface DetailSection {
  title?: string;
  fields: DetailField[];
}

export interface DetailDrillLink {
  label: string;
  href: string;
  testId?: string;
}

export function GenericDetail({
  sections,
  drillLinks,
}: {
  sections: DetailSection[];
  drillLinks?: DetailDrillLink[];
}) {
  return (
    <div className="space-y-4 max-w-3xl">
      {sections.map((s, i) => (
        <Card key={i}>
          <CardContent className="p-4 space-y-2 text-sm">
            {s.title && <h3 className="text-sm font-medium mb-2">{s.title}</h3>}
            {s.fields.map((f, j) => (
              <div
                key={j}
                className="flex justify-between gap-4 border-b last:border-b-0 pb-2 last:pb-0"
              >
                <span className="text-muted-foreground">{f.label}</span>
                <span className="font-medium text-right">{f.value}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      ))}
      {drillLinks && drillLinks.length > 0 && (
        <Card>
          <CardContent className="p-4 space-y-2 text-sm">
            <h3 className="text-sm font-medium mb-2">Connected records</h3>
            <ul className="space-y-1">
              {drillLinks.map((d, i) => (
                <li key={i}>
                  <Link
                    href={d.href}
                    className="text-primary hover:underline"
                    data-testid={d.testId}
                  >
                    {d.label} →
                  </Link>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
