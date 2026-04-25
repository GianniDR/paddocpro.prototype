"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useMemo, useState } from "react";

import { useIdParam } from "@/components/shell/detail-sheet";
import { Button } from "@/components/ui/button";
import { useSession } from "@/lib/auth/current";
import { now } from "@/lib/mock/clock";
import { useDataset } from "@/lib/mock/store";
import type { Booking, BookingType } from "@/types";

const HOURS_FROM = 7;
const HOURS_TO = 19;
const HOURS = Array.from({ length: HOURS_TO - HOURS_FROM }, (_, i) => HOURS_FROM + i);
const DAY_MS = 86_400_000;

const TYPE_TONE: Record<BookingType, string> = {
  arena_slot: "bg-emerald-100 border-emerald-300 text-emerald-900",
  lesson: "bg-emerald-200 border-emerald-400 text-emerald-900",
  vet_appt: "bg-rose-100 border-rose-300 text-rose-900",
  farrier_appt: "bg-amber-100 border-amber-300 text-amber-900",
  dentist_appt: "bg-purple-100 border-purple-300 text-purple-900",
};

function startOfWeek(d: Date): Date {
  const r = new Date(d);
  r.setUTCHours(0, 0, 0, 0);
  // Monday start (UTC); Sunday=0 → 6 days back
  const dow = r.getUTCDay();
  const offset = dow === 0 ? -6 : 1 - dow;
  r.setUTCDate(r.getUTCDate() + offset);
  return r;
}

function fmtTime(d: Date): string {
  return `${d.getUTCHours().toString().padStart(2, "0")}:${d.getUTCMinutes().toString().padStart(2, "0")}`;
}

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function CalendarWeek() {
  const dataset = useDataset();
  const session = useSession();
  const tenantId = session?.tenantId ?? dataset.tenants[0]?.id;
  const [, setSelectedId] = useIdParam();

  const [weekStart, setWeekStart] = useState(() => startOfWeek(now()));
  const days = useMemo(
    () => Array.from({ length: 7 }, (_, i) => new Date(weekStart.getTime() + i * DAY_MS)),
    [weekStart],
  );

  const tenantBookings = useMemo(
    () =>
      dataset.bookings.filter(
        (b) => b.tenantId === tenantId && b.status !== "cancelled",
      ),
    [dataset.bookings, tenantId],
  );

  const bookingsByDay = useMemo(() => {
    const map: Record<string, Booking[]> = {};
    days.forEach((d) => (map[d.toISOString().slice(0, 10)] = []));
    for (const b of tenantBookings) {
      const key = b.startAt.slice(0, 10);
      if (key in map) map[key].push(b);
    }
    return map;
  }, [tenantBookings, days]);

  return (
    <div className="flex flex-col flex-1 gap-3" data-testid="bookings-calendar-week">
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setWeekStart(new Date(weekStart.getTime() - 7 * DAY_MS))}
          data-testid="bookings-calendar-prev"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setWeekStart(startOfWeek(now()))}
          data-testid="bookings-calendar-today"
        >
          Today
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setWeekStart(new Date(weekStart.getTime() + 7 * DAY_MS))}
          data-testid="bookings-calendar-next"
        >
          <ChevronRight className="h-3.5 w-3.5" />
        </Button>
        <span className="text-sm font-medium ml-2">
          Week of {weekStart.getUTCDate()} {MONTHS[weekStart.getUTCMonth()]} {weekStart.getUTCFullYear()}
        </span>
        <div className="ml-auto flex flex-wrap gap-2 text-[11px]">
          <Legend tone={TYPE_TONE.arena_slot} label="Arena" />
          <Legend tone={TYPE_TONE.lesson} label="Lesson" />
          <Legend tone={TYPE_TONE.vet_appt} label="Vet" />
          <Legend tone={TYPE_TONE.farrier_appt} label="Farrier" />
          <Legend tone={TYPE_TONE.dentist_appt} label="Dentist" />
        </div>
      </div>

      <div className="border rounded-md overflow-hidden bg-card">
        {/* Header row */}
        <div className="grid grid-cols-[60px_repeat(7,1fr)] border-b bg-muted/40 text-xs font-medium">
          <div className="p-2 border-r"></div>
          {days.map((d) => {
            const isToday = d.toISOString().slice(0, 10) === now().toISOString().slice(0, 10);
            return (
              <div
                key={d.toISOString()}
                className={
                  "p-2 text-center border-r last:border-r-0 " +
                  (isToday ? "bg-primary/10 text-primary font-semibold" : "")
                }
              >
                <div>{WEEKDAYS[(d.getUTCDay() + 6) % 7]}</div>
                <div className="text-base font-semibold">{d.getUTCDate()}</div>
              </div>
            );
          })}
        </div>

        {/* Hour rows */}
        <div className="relative">
          {HOURS.map((h) => (
            <div
              key={h}
              className="grid grid-cols-[60px_repeat(7,1fr)] border-b last:border-b-0 h-14"
            >
              <div className="text-[10px] text-muted-foreground px-2 py-1 border-r">{h}:00</div>
              {days.map((d) => (
                <div key={d.toISOString() + h} className="border-r last:border-r-0" />
              ))}
            </div>
          ))}

          {/* Booking blocks absolutely positioned */}
          {days.map((d, dayIdx) => {
            const key = d.toISOString().slice(0, 10);
            const todays = bookingsByDay[key] ?? [];
            return todays.map((bk) => {
              const start = new Date(bk.startAt);
              const end = new Date(bk.endAt);
              const startHour = start.getUTCHours() + start.getUTCMinutes() / 60;
              const endHour = end.getUTCHours() + end.getUTCMinutes() / 60;
              if (startHour < HOURS_FROM || startHour > HOURS_TO) return null;
              const top = (startHour - HOURS_FROM) * 56;
              const height = Math.max(20, (endHour - startHour) * 56);
              const tone = TYPE_TONE[bk.type] ?? "bg-card border";
              const resource = dataset.resources.find((r) => r.id === bk.resourceId);
              const horse = dataset.horses.find((h) => h.id === bk.horseId);
              const colWidth = `calc((100% - 60px) / 7)`;
              const left = `calc(60px + ${dayIdx} * ${colWidth} + 2px)`;
              const width = `calc(${colWidth} - 4px)`;
              return (
                <button
                  key={bk.id}
                  type="button"
                  onClick={() => setSelectedId(bk.id)}
                  data-testid={`bookings-calendar-block-${bk.id}`}
                  className={
                    "absolute rounded-md border-l-4 px-1.5 py-1 text-[11px] text-left hover:ring-2 hover:ring-primary/40 transition " +
                    tone
                  }
                  style={{ top, left, width, height: height - 2 }}
                >
                  <div className="font-medium truncate">{fmtTime(start)} {resource?.name ?? bk.type}</div>
                  {horse && <div className="truncate text-[10px] opacity-80">{horse.stableName}</div>}
                </button>
              );
            });
          })}
        </div>
      </div>
    </div>
  );
}

function Legend({ tone, label }: { tone: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1">
      <span className={`inline-block w-3 h-3 rounded ${tone}`} aria-hidden="true" />
      {label}
    </span>
  );
}

