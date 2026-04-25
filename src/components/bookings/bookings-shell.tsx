"use client";

import { CalendarDays, List } from "lucide-react";
import { useState } from "react";

import { BookingSheetShell } from "@/components/bookings/booking-sheet-shell";
import { BookingsGrid } from "@/components/bookings/bookings-grid";
import { CalendarWeek } from "@/components/bookings/calendar-week";
import { Button } from "@/components/ui/button";

export function BookingsShell() {
  const [view, setView] = useState<"calendar" | "list">("calendar");
  return (
    <div className="flex flex-col flex-1 p-4 pb-12 gap-3" data-testid="bookings-shell">
      <div className="flex items-center gap-2">
        <Button
          variant={view === "calendar" ? "default" : "outline"}
          size="sm"
          onClick={() => setView("calendar")}
          data-testid="bookings-view-calendar"
        >
          <CalendarDays className="h-3.5 w-3.5" /> Calendar
        </Button>
        <Button
          variant={view === "list" ? "default" : "outline"}
          size="sm"
          onClick={() => setView("list")}
          data-testid="bookings-view-list"
        >
          <List className="h-3.5 w-3.5" /> List
        </Button>
      </div>
      {view === "calendar" ? <CalendarWeek /> : <BookingsGrid />}
      <BookingSheetShell />
    </div>
  );
}
