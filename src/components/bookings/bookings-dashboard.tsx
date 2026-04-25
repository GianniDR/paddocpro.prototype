"use client";

import { AlertTriangle, CalendarClock, CalendarDays, CalendarRange } from "lucide-react";
import { useMemo } from "react";

import { BookingSheetShell } from "@/components/bookings/booking-sheet-shell";
import { CalendarWeek } from "@/components/bookings/calendar-week";
import { KpiTile } from "@/components/shell/kpi-tile";
import { WidgetCard } from "@/components/shell/widget-card";
import { useSession } from "@/lib/auth/current";
import { now } from "@/lib/mock/clock";
import { useDataset } from "@/lib/mock/store";

const DAY_MS = 86_400_000;

function startOfDay(d: Date): number {
  const r = new Date(d);
  r.setUTCHours(0, 0, 0, 0);
  return r.getTime();
}

export function BookingsDashboard() {
  const dataset = useDataset();
  const session = useSession();
  const tenantId = session?.tenantId ?? dataset.tenants[0]?.id;

  const bookings = useMemo(
    () =>
      dataset.bookings.filter(
        (b) => b.tenantId === tenantId && b.status !== "cancelled",
      ),
    [dataset.bookings, tenantId],
  );

  const { todayCount, tomorrowCount, weekCount, conflictCount } = useMemo(() => {
    const today = startOfDay(now());
    const tomorrow = today + DAY_MS;
    const dayAfter = today + 2 * DAY_MS;
    const weekEnd = today + 7 * DAY_MS;

    let todayCount = 0;
    let tomorrowCount = 0;
    let weekCount = 0;

    for (const b of bookings) {
      const start = Date.parse(b.startAt);
      if (start >= today && start < tomorrow) todayCount++;
      if (start >= tomorrow && start < dayAfter) tomorrowCount++;
      if (start >= today && start < weekEnd) weekCount++;
    }

    // Conflicts: overlapping bookings on the same resource
    const byResource = new Map<string, typeof bookings>();
    for (const b of bookings) {
      const arr = byResource.get(b.resourceId) ?? [];
      arr.push(b);
      byResource.set(b.resourceId, arr);
    }
    let conflictCount = 0;
    for (const arr of byResource.values()) {
      const sorted = [...arr].sort((a, b) => Date.parse(a.startAt) - Date.parse(b.startAt));
      for (let i = 1; i < sorted.length; i++) {
        if (Date.parse(sorted[i].startAt) < Date.parse(sorted[i - 1].endAt)) {
          conflictCount++;
        }
      }
    }

    return { todayCount, tomorrowCount, weekCount, conflictCount };
  }, [bookings]);

  return (
    <div className="flex flex-1 flex-col overflow-auto bg-[#e5ebf1] px-4 pt-3 pb-3 gap-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <KpiTile
          label="Today"
          value={todayCount}
          Icon={CalendarClock}
          variant="info"
          testId="bookings-kpi-today"
        />
        <KpiTile
          label="Tomorrow"
          value={tomorrowCount}
          Icon={CalendarDays}
          variant="neutral"
          testId="bookings-kpi-tomorrow"
        />
        <KpiTile
          label="This week"
          value={weekCount}
          Icon={CalendarRange}
          variant="success"
          testId="bookings-kpi-week"
        />
        <KpiTile
          label="Conflicts"
          value={conflictCount}
          Icon={AlertTriangle}
          variant="danger"
          testId="bookings-kpi-conflicts"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 min-h-[280px]">
        <WidgetCard title="This week's calendar">
          <CalendarWeek />
        </WidgetCard>
      </div>

      <BookingSheetShell />
    </div>
  );
}
