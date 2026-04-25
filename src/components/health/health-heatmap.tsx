"use client";

import Link from "next/link";
import { useMemo } from "react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useSession } from "@/lib/auth/current";
import { formatDate } from "@/lib/format";
import { now } from "@/lib/mock/clock";
import { useDataset } from "@/lib/mock/store";
import { cn } from "@/lib/utils";

const KINDS = [
  { id: "vaccination", label: "Vaccination" },
  { id: "worming", label: "Worming" },
  { id: "farrier", label: "Farrier" },
  { id: "dental", label: "Dental" },
] as const;

const DAY = 86_400_000;

type Status = "current" | "due_30d" | "overdue" | "unknown";

const STATUS_BG: Record<Status, string> = {
  current: "bg-emerald-100 text-emerald-900 hover:bg-emerald-200",
  due_30d: "bg-amber-100 text-amber-900 hover:bg-amber-200",
  overdue: "bg-rose-100 text-rose-900 hover:bg-rose-200",
  unknown: "bg-slate-100 text-slate-600 hover:bg-slate-200",
};

export function HealthHeatmap() {
  const dataset = useDataset();
  const session = useSession();
  const tenantId = session?.tenantId ?? dataset.tenants[0]?.id;
  const tenantNow = now().getTime();

  const rows = useMemo(() => {
    if (!tenantId) return [];
    return dataset.horses
      .filter((h) => h.tenantId === tenantId && !h.archivedAt)
      .map((h) => {
        const events = dataset.healthEvents.filter((e) => e.horseId === h.id);
        const cells: Record<string, { status: Status; nextDue: string | null }> = {};
        for (const k of KINDS) {
          const ev = events
            .filter((e) => e.kind === k.id && e.nextDueDate)
            .sort((a, b) => Date.parse(b.eventDate) - Date.parse(a.eventDate))[0];
          if (!ev || !ev.nextDueDate) {
            cells[k.id] = { status: "unknown", nextDue: null };
            continue;
          }
          const t = Date.parse(ev.nextDueDate);
          let status: Status = "current";
          if (t < tenantNow) status = "overdue";
          else if (t - tenantNow < 30 * DAY) status = "due_30d";
          cells[k.id] = { status, nextDue: ev.nextDueDate };
        }
        return { horse: h, cells };
      });
  }, [dataset, tenantId, tenantNow]);

  const counts = useMemo(() => {
    const out: Record<string, Record<Status, number>> = {};
    for (const k of KINDS) {
      out[k.id] = { current: 0, due_30d: 0, overdue: 0, unknown: 0 };
    }
    for (const r of rows) {
      for (const k of KINDS) {
        out[k.id][r.cells[k.id].status] += 1;
      }
    }
    return out;
  }, [rows]);

  return (
    <div className="flex flex-col gap-4 flex-1" data-testid="health-heatmap">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {KINDS.map((k) => {
          const c = counts[k.id];
          return (
            <Card key={k.id}>
              <CardContent className="p-3">
                <div className="text-xs uppercase tracking-wide text-muted-foreground">
                  {k.label}
                </div>
                <div className="flex items-end gap-2 mt-1">
                  <span className="text-2xl font-semibold tabular-nums text-emerald-700">
                    {c.current}
                  </span>
                  <span className="text-xs text-muted-foreground mb-0.5">current</span>
                </div>
                <div className="flex gap-1.5 text-[11px] mt-1">
                  <span className="text-amber-700">{c.due_30d} due 30 d</span>
                  <span className="text-rose-700">{c.overdue} overdue</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead className="bg-muted/40 text-muted-foreground sticky top-0">
              <tr>
                <th className="text-left font-medium px-3 py-2">Horse</th>
                {KINDS.map((k) => (
                  <th key={k.id} className="text-center font-medium px-3 py-2 text-xs">
                    {k.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map(({ horse, cells }) => (
                <tr key={horse.id} className="border-t">
                  <td className="px-3 py-2">
                    <Link
                      href={`/horses/${horse.id}`}
                      className="text-primary hover:underline font-medium"
                      data-testid={`drill-horse-${horse.id}`}
                    >
                      {horse.stableName}
                    </Link>
                  </td>
                  {KINDS.map((k) => {
                    const cell = cells[k.id];
                    return (
                      <td key={k.id} className="px-3 py-2 text-center">
                        <Link
                          href={`/horses/${horse.id}`}
                          className={cn(
                            "inline-flex flex-col items-center min-w-[64px] gap-0.5 px-2 py-1.5 rounded-md transition cursor-pointer",
                            STATUS_BG[cell.status],
                          )}
                          data-testid={`heatmap-${horse.id}-${k.id}`}
                          aria-label={`${horse.stableName} — ${k.label} ${cell.status}`}
                        >
                          <span className="text-[10px] font-medium uppercase tracking-wide">
                            {cell.status === "due_30d" ? "30 d" : cell.status}
                          </span>
                          {cell.nextDue && (
                            <span className="text-[9px] opacity-80">{formatDate(cell.nextDue, "short")}</span>
                          )}
                        </Link>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
        <Badge variant="outline">{rows.length} horses</Badge>
        <span className="inline-flex items-center gap-1">
          <span className="inline-block w-3 h-3 rounded bg-emerald-100 border border-emerald-300" /> Current
        </span>
        <span className="inline-flex items-center gap-1">
          <span className="inline-block w-3 h-3 rounded bg-amber-100 border border-amber-300" /> Due ≤30 d
        </span>
        <span className="inline-flex items-center gap-1">
          <span className="inline-block w-3 h-3 rounded bg-rose-100 border border-rose-300" /> Overdue
        </span>
        <span className="inline-flex items-center gap-1">
          <span className="inline-block w-3 h-3 rounded bg-slate-100 border border-slate-300" /> Unknown
        </span>
      </div>
    </div>
  );
}
