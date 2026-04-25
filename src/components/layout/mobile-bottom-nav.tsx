"use client";

import { CalendarDays, HeartPulse, LayoutDashboard, ListChecks, Sparkles } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

const ENTRIES = [
  { slug: "dashboard", label: "Overview", icon: LayoutDashboard, route: "/dashboard" },
  { slug: "horses", label: "Horses", icon: Sparkles, route: "/horses" },
  { slug: "tasks", label: "Tasks", icon: ListChecks, route: "/tasks" },
  { slug: "health", label: "Health", icon: HeartPulse, route: "/health" },
  { slug: "bookings", label: "Bookings", icon: CalendarDays, route: "/bookings" },
];

export function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-30 border-t bg-background/95 backdrop-blur"
      aria-label="Primary navigation"
      data-testid="mobile-bottom-nav"
    >
      <div className="grid grid-cols-5">
        {ENTRIES.map((e) => {
          const Icon = e.icon;
          const active =
            pathname === e.route || pathname.startsWith(e.route + "/");
          return (
            <Link
              key={e.slug}
              href={e.route}
              data-testid={`mobile-bottom-nav-${e.slug}`}
              className={cn(
                "flex flex-col items-center justify-center gap-0.5 py-2 text-[10px] font-medium transition",
                active ? "text-primary" : "text-muted-foreground",
              )}
            >
              <Icon className="h-5 w-5" aria-hidden="true" />
              <span>{e.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
