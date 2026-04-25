"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo } from "react";

import { HorseIcon } from "@/components/icons";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useSession } from "@/lib/auth/current";
import { useDataset } from "@/lib/mock/store";
import { PRIMARY_NAV, SETTINGS_NAV } from "@/lib/nav";
import { cn } from "@/lib/utils";

export function AppSidebar() {
  const pathname = usePathname();
  const session = useSession();
  const dataset = useDataset();

  const tenantId = session?.tenantId ?? dataset.tenants[0]?.id;

  const badges = useMemo(() => {
    if (!tenantId) return {} as Record<string, { count: number; tone: "destructive" | "secondary" }>;
    const horsesIso = dataset.horses.filter((h) => h.tenantId === tenantId && h.healthStatus === "isolating").length;
    const stablesMaint = dataset.stables.filter((s) => s.tenantId === tenantId && s.status === "maintenance").length;
    const todayBookings = dataset.bookings.filter((b) => b.tenantId === tenantId && b.startAt.startsWith("2026-04-25")).length;
    const taskMissed = dataset.tasks.filter((t) => t.tenantId === tenantId && t.status === "missed").length;
    const vaccOverdue = dataset.healthEvents.filter((e) => e.tenantId === tenantId && e.kind === "vaccination" && e.status === "overdue").length;
    const lowStock = dataset.inventory.filter((i) => i.tenantId === tenantId && i.currentStock <= i.lowStockThreshold).length;
    const expiringDocs = dataset.documents.filter((d) => d.tenantId === tenantId && d.expiryDate && Date.parse(d.expiryDate) - Date.parse("2026-04-25") < 30 * 86_400_000).length;
    const incidentsOpen = dataset.incidents.filter((i) => i.tenantId === tenantId && i.workflowState !== "closed" && (i.severity === "serious" || i.severity === "critical")).length;
    const overdueInv = dataset.invoices.filter((i) => i.tenantId === tenantId && i.status === "authorised" && Date.parse(i.dueAt) < Date.parse("2026-04-25")).length;
    return {
      horses: { count: horsesIso, tone: "destructive" as const },
      stables: { count: stablesMaint, tone: "secondary" as const },
      bookings: { count: todayBookings, tone: "secondary" as const },
      tasks: { count: taskMissed, tone: "destructive" as const },
      health: { count: vaccOverdue, tone: "destructive" as const },
      "feed-supplies": { count: lowStock, tone: "secondary" as const },
      documents: { count: expiringDocs, tone: "secondary" as const },
      incidents: { count: incidentsOpen, tone: "destructive" as const },
      finance: { count: overdueInv, tone: "destructive" as const },
    };
  }, [dataset, tenantId]);

  const isActive = (route: string) => pathname === route || pathname.startsWith(route + "/");

  return (
    <Sidebar data-testid="sidebar">
      <SidebarHeader className="border-b border-sidebar-border">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 px-2 py-2 group/brand"
          data-testid="nav-brand"
        >
          <HorseIcon size={26} className="text-sidebar-primary shrink-0" />
          <span className="font-display italic text-2xl font-semibold tracking-tight text-sidebar-foreground group-data-[collapsible=icon]:hidden">
            paddoc <span className="text-sidebar-primary">|</span> pro
          </span>
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="group-data-[collapsible=icon]:hidden">Yard</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {PRIMARY_NAV.flatMap((entry) => ("children" in entry ? entry.children : [entry])).map((item) => {
                const Icon = item.icon;
                const badge = badges[item.slug];
                return (
                  <SidebarMenuItem key={item.slug}>
                    <SidebarMenuButton
                      render={<Link href={item.route} data-testid={`nav-${item.slug}`} />}
                      isActive={isActive(item.route)}
                      tooltip={item.label}
                    >
                      <Icon className="h-4 w-4" aria-hidden="true" />
                      <span>{item.label}</span>
                      {badge && badge.count > 0 && (
                        <span
                          data-testid={`nav-${item.slug}-badge`}
                          className={cn(
                            "ml-auto inline-flex items-center justify-center rounded-md px-1.5 py-0.5 text-[10px] font-medium tabular-nums",
                            badge.tone === "destructive"
                              ? "bg-destructive text-destructive-foreground"
                              : "bg-sidebar-accent text-sidebar-accent-foreground",
                          )}
                        >
                          {badge.count}
                        </span>
                      )}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              render={<Link href="/settings" data-testid="nav-settings" />}
              isActive={isActive("/settings")}
              tooltip={SETTINGS_NAV.label}
            >
              <SETTINGS_NAV.icon className="h-4 w-4" aria-hidden="true" />
              <span>{SETTINGS_NAV.label}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
