"use client";

import { CalendarOff, Clock, UserCheck, Users } from "lucide-react";
import { useMemo } from "react";

import { KpiTile } from "@/components/shell/kpi-tile";
import { WidgetCard } from "@/components/shell/widget-card";
import { useSession } from "@/lib/auth/current";
import { formatTime } from "@/lib/format";
import { now } from "@/lib/mock/clock";
import { useDataset } from "@/lib/mock/store";

export function StaffDashboard() {
  const dataset = useDataset();
  const session = useSession();
  const tenantId = session?.tenantId ?? dataset.tenants[0]?.id;

  const { staff, onShift, offToday, weeklyHours, todayShifts, roleBreakdown } = useMemo(() => {
    const tenantNow = now();
    const startOfDay = new Date(tenantNow);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(tenantNow);
    endOfDay.setHours(23, 59, 59, 999);
    const weekAgo = new Date(tenantNow.getTime() - 7 * 86_400_000);

    const allStaff = dataset.users.filter(
      (u) =>
        u.tenantId === tenantId &&
        (u.role === "yard_manager" || u.role === "yard_staff") &&
        u.status === "active",
    );

    const tenantShifts = dataset.shifts.filter((s) => s.tenantId === tenantId);

    const todays = tenantShifts.filter((s) => {
      const start = Date.parse(s.startAt);
      return start >= startOfDay.getTime() && start <= endOfDay.getTime();
    });
    const todayStaffIds = new Set(todays.map((s) => s.staffUserId));

    const onShiftCount = tenantShifts.filter((s) => {
      const start = Date.parse(s.startAt);
      const end = Date.parse(s.endAt);
      return start <= tenantNow.getTime() && end >= tenantNow.getTime();
    }).length;

    const off = allStaff.filter((u) => !todayStaffIds.has(u.id)).length;

    const weekly = tenantShifts
      .filter((s) => Date.parse(s.startAt) >= weekAgo.getTime())
      .reduce((sum, s) => sum + (Date.parse(s.endAt) - Date.parse(s.startAt)) / 3_600_000, 0);

    const todayDetail = todays
      .slice()
      .sort((a, b) => Date.parse(a.startAt) - Date.parse(b.startAt))
      .slice(0, 8)
      .map((s) => {
        const u = dataset.users.find((x) => x.id === s.staffUserId);
        return {
          id: s.id,
          name: u ? `${u.firstName} ${u.lastName}` : "—",
          role: s.role,
          startAt: s.startAt,
          endAt: s.endAt,
          status: s.status,
        };
      });

    const roles: Record<string, number> = {};
    for (const u of allStaff) {
      const key = u.role.replace("_", " ");
      roles[key] = (roles[key] ?? 0) + 1;
    }

    return {
      staff: allStaff.length,
      onShift: onShiftCount,
      offToday: off,
      weeklyHours: Math.round(weekly),
      todayShifts: todayDetail,
      roleBreakdown: Object.entries(roles),
    };
  }, [dataset, tenantId]);

  return (
    <div className="flex flex-1 flex-col overflow-auto bg-[#e5ebf1] px-4 pt-3 pb-3 gap-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <KpiTile
          label="Active staff"
          value={staff}
          Icon={Users}
          variant="info"
          testId="staff-kpi-active"
        />
        <KpiTile
          label="On shift today"
          value={onShift}
          Icon={UserCheck}
          variant="success"
          testId="staff-kpi-on-shift"
        />
        <KpiTile
          label="Off today"
          value={offToday}
          Icon={CalendarOff}
          variant="neutral"
          testId="staff-kpi-off-today"
        />
        <KpiTile
          label="Weekly hours"
          value={weeklyHours}
          Icon={Clock}
          variant="amber"
          testId="staff-kpi-weekly-hours"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 min-h-[280px]">
        <WidgetCard title="Today's shifts">
          {todayShifts.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4">No shifts scheduled today.</p>
          ) : (
            <table className="w-full text-sm">
              <tbody>
                {todayShifts.map((s) => (
                  <tr key={s.id} className="border-b border-[#e5ebf1] last:border-b-0">
                    <td className="py-2 font-medium">{s.name}</td>
                    <td className="py-2 text-muted-foreground">{s.role}</td>
                    <td className="py-2 text-right tabular-nums text-muted-foreground">
                      {formatTime(s.startAt)} – {formatTime(s.endAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </WidgetCard>

        <WidgetCard title="Roles breakdown">
          {roleBreakdown.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4">No staff yet.</p>
          ) : (
            <table className="w-full text-sm">
              <tbody>
                {roleBreakdown.map(([role, n]) => (
                  <tr key={role} className="border-b border-[#e5ebf1] last:border-b-0">
                    <td className="py-2 capitalize">{role}</td>
                    <td className="py-2 text-right tabular-nums">{n}</td>
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
