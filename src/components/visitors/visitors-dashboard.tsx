"use client";

import { CalendarClock, IdCard, Repeat, Users } from "lucide-react";
import { useMemo } from "react";

import { KpiTile } from "@/components/shell/kpi-tile";
import { StatusBadge } from "@/components/shell/status-badge";
import { WidgetCard } from "@/components/shell/widget-card";
import { useSession } from "@/lib/auth/current";
import { formatDateTime } from "@/lib/format";
import { now } from "@/lib/mock/clock";
import { useDataset } from "@/lib/mock/store";

export function VisitorsDashboard() {
  const dataset = useDataset();
  const session = useSession();
  const tenantId = session?.tenantId ?? dataset.tenants[0]?.id;

  const visitors = useMemo(
    () => dataset.visitors.filter((v) => v.tenantId === tenantId),
    [dataset.visitors, tenantId],
  );

  const stats = useMemo(() => {
    const tenantNow = now().getTime();
    const startOfDay = new Date(tenantNow);
    startOfDay.setHours(0, 0, 0, 0);
    const sodMs = startOfDay.getTime();
    const eodMs = sodMs + 86_400_000;
    const startOfWeek = new Date(sodMs);
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());

    const onSiteNow = visitors.filter((v) => !v.departedAt).length;

    const expectedToday = dataset.bookings.filter(
      (b) =>
        b.tenantId === tenantId &&
        Date.parse(b.startAt) >= sodMs &&
        Date.parse(b.startAt) < eodMs,
    ).length;

    const thisWeek = visitors.filter(
      (v) => Date.parse(v.arrivedAt) >= startOfWeek.getTime(),
    ).length;

    const seen = new Map<string, number>();
    visitors.forEach((v) => {
      const k = `${v.visitorName}|${v.visitorType}`;
      seen.set(k, (seen.get(k) ?? 0) + 1);
    });
    const returning = Array.from(seen.values()).filter((n) => n > 1).length;

    return { onSiteNow, expectedToday, thisWeek, returning };
  }, [visitors, dataset.bookings, tenantId]);

  const active = useMemo(
    () =>
      visitors
        .filter((v) => !v.departedAt)
        .sort((a, b) => Date.parse(b.arrivedAt) - Date.parse(a.arrivedAt))
        .slice(0, 8),
    [visitors],
  );

  const byCategory = useMemo(() => {
    return visitors.reduce<Record<string, number>>((acc, v) => {
      acc[v.visitorType] = (acc[v.visitorType] ?? 0) + 1;
      return acc;
    }, {});
  }, [visitors]);

  return (
    <div className="flex flex-1 flex-col overflow-auto bg-[#e5ebf1] px-4 pt-3 pb-3 gap-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <KpiTile
          label="On site now"
          value={stats.onSiteNow}
          Icon={IdCard}
          variant="info"
          testId="visitors-kpi-onsite"
        />
        <KpiTile
          label="Expected today"
          value={stats.expectedToday}
          Icon={CalendarClock}
          variant="amber"
          testId="visitors-kpi-expected"
        />
        <KpiTile
          label="This week"
          value={stats.thisWeek}
          Icon={Users}
          variant="neutral"
          testId="visitors-kpi-week"
        />
        <KpiTile
          label="Returning visitors"
          value={stats.returning}
          Icon={Repeat}
          variant="success"
          testId="visitors-kpi-returning"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 min-h-[280px]">
        <WidgetCard title="Active visitors">
          {active.length === 0 ? (
            <p className="text-sm text-muted-foreground">No visitors currently on site.</p>
          ) : (
            <table className="w-full text-sm">
              <tbody>
                {active.map((v) => (
                  <tr key={v.id} className="border-b border-[#e5ebf1] last:border-b-0">
                    <td className="py-2">
                      <div className="font-medium leading-tight truncate max-w-[220px]">
                        {v.visitorName}
                      </div>
                      <div className="text-xs text-muted-foreground capitalize">
                        {v.visitorType.replace("_", " ")}
                      </div>
                    </td>
                    <td className="py-2 text-right">
                      <div className="text-xs text-muted-foreground">
                        Arrived {formatDateTime(v.arrivedAt)}
                      </div>
                      <StatusBadge status="active" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </WidgetCard>

        <WidgetCard title="Visitor categories">
          <table className="w-full text-sm">
            <tbody>
              {Object.entries(byCategory).map(([k, v]) => (
                <tr key={k} className="border-b border-[#e5ebf1] last:border-b-0">
                  <td className="py-2 capitalize">{k.replace("_", " ")}</td>
                  <td className="py-2 text-right tabular-nums">{v}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </WidgetCard>
      </div>
    </div>
  );
}
