"use client";

import { AlertOctagon, CheckCircle2, Clock, ListChecks } from "lucide-react";
import { useMemo } from "react";

import { KpiTile } from "@/components/shell/kpi-tile";
import { WidgetCard } from "@/components/shell/widget-card";
import { useSession } from "@/lib/auth/current";
import { now } from "@/lib/mock/clock";
import { useDataset } from "@/lib/mock/store";

const DAY_MS = 86_400_000;

export function TasksDashboard() {
  const dataset = useDataset();
  const session = useSession();
  const tenantId = session?.tenantId ?? dataset.tenants[0]?.id;

  const tasks = useMemo(
    () => dataset.tasks.filter((t) => t.tenantId === tenantId),
    [dataset.tasks, tenantId],
  );

  const { openToday, dueToday, overdue, completedThisWeek } = useMemo(() => {
    const todayStart = (() => {
      const d = now();
      d.setUTCHours(0, 0, 0, 0);
      return d.getTime();
    })();
    const todayEnd = todayStart + DAY_MS;
    const weekStart = todayStart - 7 * DAY_MS;
    const tenantNow = now().getTime();

    let openToday = 0;
    let dueToday = 0;
    let overdue = 0;
    let completedThisWeek = 0;

    for (const t of tasks) {
      const due = Date.parse(t.dueAt);
      if (t.status !== "completed") {
        if (due >= todayStart && due < todayEnd) {
          openToday++;
          dueToday++;
        }
        if (due < tenantNow) overdue++;
      } else if (t.completedAt) {
        const completed = Date.parse(t.completedAt);
        if (completed >= weekStart) completedThisWeek++;
      }
    }
    return { openToday, dueToday, overdue, completedThisWeek };
  }, [tasks]);

  const byCategory = useMemo(() => {
    const map = new Map<string, number>();
    for (const t of tasks) {
      if (t.status === "completed") continue;
      map.set(t.type, (map.get(t.type) ?? 0) + 1);
    }
    return Array.from(map.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([type, count]) => ({ type, count }));
  }, [tasks]);

  const topAssignees = useMemo(() => {
    const map = new Map<string, number>();
    for (const t of tasks) {
      if (t.status === "completed") continue;
      map.set(t.assigneeId, (map.get(t.assigneeId) ?? 0) + 1);
    }
    return Array.from(map.entries())
      .map(([assigneeId, count]) => {
        const u = dataset.users.find((u) => u.id === assigneeId);
        return {
          assigneeId,
          name: u ? `${u.firstName} ${u.lastName}` : "—",
          count,
        };
      })
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);
  }, [tasks, dataset.users]);

  return (
    <div className="flex flex-1 flex-col overflow-auto bg-[#e5ebf1] px-4 pt-3 pb-3 gap-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <KpiTile
          label="Open today"
          value={openToday}
          Icon={ListChecks}
          variant="info"
          testId="tasks-kpi-open-today"
        />
        <KpiTile
          label="Due today"
          value={dueToday}
          Icon={Clock}
          variant="amber"
          testId="tasks-kpi-due-today"
        />
        <KpiTile
          label="Overdue"
          value={overdue}
          Icon={AlertOctagon}
          variant="danger"
          testId="tasks-kpi-overdue"
        />
        <KpiTile
          label="Completed this week"
          value={completedThisWeek}
          Icon={CheckCircle2}
          variant="success"
          testId="tasks-kpi-completed-week"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 min-h-[280px]">
        <WidgetCard title="Open tasks by category">
          <table className="w-full text-sm">
            <tbody>
              {byCategory.map((r) => (
                <tr key={r.type} className="border-b border-[#e5ebf1] last:border-b-0">
                  <td className="py-2 capitalize">{r.type.replace(/_/g, " ")}</td>
                  <td className="py-2 text-right tabular-nums">{r.count}</td>
                </tr>
              ))}
              {byCategory.length === 0 && (
                <tr>
                  <td className="py-2 text-muted-foreground" colSpan={2}>
                    No open tasks.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </WidgetCard>

        <WidgetCard title="Top assignees (open)">
          <table className="w-full text-sm">
            <tbody>
              {topAssignees.map((r) => (
                <tr key={r.assigneeId} className="border-b border-[#e5ebf1] last:border-b-0">
                  <td className="py-2">{r.name}</td>
                  <td className="py-2 text-right tabular-nums">{r.count}</td>
                </tr>
              ))}
              {topAssignees.length === 0 && (
                <tr>
                  <td className="py-2 text-muted-foreground" colSpan={2}>
                    No assigned tasks.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </WidgetCard>
      </div>
    </div>
  );
}
