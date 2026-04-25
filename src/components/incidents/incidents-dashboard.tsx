"use client";

import { AlertTriangle, CheckCircle2, ShieldAlert, Timer } from "lucide-react";
import { useMemo } from "react";

import { KpiTile } from "@/components/shell/kpi-tile";
import { StatusBadge } from "@/components/shell/status-badge";
import { WidgetCard } from "@/components/shell/widget-card";
import { useSession } from "@/lib/auth/current";
import { formatDateTime } from "@/lib/format";
import { now } from "@/lib/mock/clock";
import { useDataset } from "@/lib/mock/store";

export function IncidentsDashboard() {
  const dataset = useDataset();
  const session = useSession();
  const tenantId = session?.tenantId ?? dataset.tenants[0]?.id;

  const incidents = useMemo(
    () => dataset.incidents.filter((i) => i.tenantId === tenantId),
    [dataset.incidents, tenantId],
  );

  const stats = useMemo(() => {
    const tenantNow = now().getTime();
    const sevenDaysAgo = tenantNow - 7 * 86_400_000;
    const open = incidents.filter((i) => i.workflowState !== "closed").length;
    const critical = incidents.filter(
      (i) => i.severity === "critical" && i.workflowState !== "closed",
    ).length;
    const closedThisWeek = incidents.filter((i) => {
      if (i.workflowState !== "closed") return false;
      const ts = i.auditTrail.findLast?.((e) => e.action === "closed")?.at ?? i.updatedAt;
      return Date.parse(ts) >= sevenDaysAgo;
    }).length;

    const closedDurations = incidents
      .filter((i) => i.workflowState === "closed")
      .map((i) => {
        const closedEntry = i.auditTrail.findLast?.((e) => e.action === "closed");
        const closedAt = closedEntry ? Date.parse(closedEntry.at) : Date.parse(i.updatedAt);
        return closedAt - Date.parse(i.occurredAt);
      })
      .filter((d) => d > 0);
    const avgMs =
      closedDurations.length > 0
        ? closedDurations.reduce((a, b) => a + b, 0) / closedDurations.length
        : 0;
    const avgHours = avgMs / 3_600_000;
    const avgLabel =
      avgHours === 0
        ? "—"
        : avgHours < 24
          ? `${avgHours.toFixed(1)}h`
          : `${(avgHours / 24).toFixed(1)}d`;

    return { open, critical, closedThisWeek, avgLabel };
  }, [incidents]);

  const bySeverity = useMemo(() => {
    return incidents.reduce<Record<string, number>>((acc, i) => {
      acc[i.severity] = (acc[i.severity] ?? 0) + 1;
      return acc;
    }, {});
  }, [incidents]);

  const recent = useMemo(
    () =>
      [...incidents]
        .sort((a, b) => Date.parse(b.occurredAt) - Date.parse(a.occurredAt))
        .slice(0, 6),
    [incidents],
  );

  return (
    <div className="flex flex-1 flex-col overflow-auto bg-[#e5ebf1] px-4 pt-3 pb-3 gap-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <KpiTile
          label="Open"
          value={stats.open}
          Icon={ShieldAlert}
          variant="info"
          testId="incidents-kpi-open"
        />
        <KpiTile
          label="Critical"
          value={stats.critical}
          Icon={AlertTriangle}
          variant="danger"
          testId="incidents-kpi-critical"
        />
        <KpiTile
          label="Closed this week"
          value={stats.closedThisWeek}
          Icon={CheckCircle2}
          variant="success"
          testId="incidents-kpi-closed"
        />
        <KpiTile
          label="Avg time-to-resolve"
          value={stats.avgLabel}
          Icon={Timer}
          variant="amber"
          testId="incidents-kpi-resolve-time"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 min-h-[280px]">
        <WidgetCard title="By severity">
          <table className="w-full text-sm">
            <tbody>
              {(["critical", "serious", "moderate", "minor"] as const).map((sev) => (
                <tr key={sev} className="border-b border-[#e5ebf1] last:border-b-0">
                  <td className="py-2 capitalize">{sev}</td>
                  <td className="py-2 text-right tabular-nums">{bySeverity[sev] ?? 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </WidgetCard>

        <WidgetCard title="Recent activity">
          {recent.length === 0 ? (
            <p className="text-sm text-muted-foreground">No incidents logged.</p>
          ) : (
            <table className="w-full text-sm">
              <tbody>
                {recent.map((i) => (
                  <tr key={i.id} className="border-b border-[#e5ebf1] last:border-b-0">
                    <td className="py-2">
                      <div className="font-medium leading-tight truncate max-w-[280px]">
                        {i.summary}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {formatDateTime(i.occurredAt)}
                      </div>
                    </td>
                    <td className="py-2 text-right">
                      <StatusBadge status={i.severity} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </WidgetCard>
      </div>
    </div>
  );
}
