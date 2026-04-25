"use client";

import { AlertTriangle, CalendarDays, FileText, Plus, Receipt, Sparkles } from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  RadialBar,
  RadialBarChart,
  ResponsiveContainer,
  Tooltip as RTooltip,
  XAxis,
  YAxis,
} from "recharts";

import { KpiCard } from "@/components/shell/kpi-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSession } from "@/lib/auth/current";
import {
  activeAlerts,
  activityTrend,
  dashboardKpis,
  financialStrip,
  todaySchedule,
  topOverdueHorses,
  yardHealthScore,
} from "@/lib/dashboard/aggregations";
import { formatGbp, formatTime } from "@/lib/format";
import { useDataset } from "@/lib/mock/store";

export function DashboardShell() {
  const dataset = useDataset();
  const session = useSession();
  const tenantId = session?.tenantId ?? dataset.tenants[0].id;
  const tenant = dataset.tenants.find((t) => t.id === tenantId)!;
  const user = dataset.users.find((u) => u.id === session?.userId);

  const kpis = useMemo(() => dashboardKpis(dataset, tenantId), [dataset, tenantId]);
  const trend = useMemo(() => activityTrend(dataset, tenantId), [dataset, tenantId]);
  const healthScore = useMemo(() => yardHealthScore(dataset, tenantId), [dataset, tenantId]);
  const overdueHorses = useMemo(() => topOverdueHorses(dataset, tenantId), [dataset, tenantId]);
  const schedule = useMemo(() => todaySchedule(dataset, tenantId), [dataset, tenantId]);
  const alerts = useMemo(() => activeAlerts(dataset, tenantId), [dataset, tenantId]);
  const fin = useMemo(() => financialStrip(dataset, tenantId), [dataset, tenantId]);

  const hour = 9; // mock clock = 09:00
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  return (
    <div className="flex flex-col gap-6 p-4 pb-12">
      {/* Greeting + quick actions */}
      <section className="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
        <div>
          <h1
            className="text-3xl font-display italic font-semibold tracking-normal"
            data-testid="dashboard-greeting"
            data-route-title=""
          >
            {greeting}, {user?.firstName ?? "there"}
          </h1>
          <p className="text-sm text-muted-foreground">
            {tenant.name} — Saturday, 25 April · Mild & dry, 12°C
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            render={<Link href="/horses" data-testid="dashboard-quick-action-add-horse" />}
            size="sm"
          >
            <Plus className="h-3.5 w-3.5" /> Add horse
          </Button>
          <Button
            render={<Link href="/bookings" data-testid="dashboard-quick-action-new-booking" />}
            size="sm"
            variant="outline"
          >
            <CalendarDays className="h-3.5 w-3.5" /> New booking
          </Button>
          <Button
            render={<Link href="/incidents" data-testid="dashboard-quick-action-log-incident" />}
            size="sm"
            variant="outline"
          >
            <AlertTriangle className="h-3.5 w-3.5" /> Log incident
          </Button>
          <Button
            render={<Link href="/finance" data-testid="dashboard-quick-action-record-charge" />}
            size="sm"
            variant="outline"
          >
            <Receipt className="h-3.5 w-3.5" /> Record charge
          </Button>
        </div>
      </section>

      {/* KPI row */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <KpiCard
          label="Occupancy"
          value={`${kpis.occupancy.occupied} / ${kpis.occupancy.total}`}
          sub={`${Math.round((kpis.occupancy.occupied / kpis.occupancy.total) * 100)}% of stables`}
          href="/stables?status=occupied"
          testId="dashboard-kpi-occupancy"
        />
        <KpiCard
          label="Today's tasks"
          value={`${kpis.todayTasks.done} / ${kpis.todayTasks.total}`}
          sub={kpis.todayTasks.missed > 0 ? `${kpis.todayTasks.missed} missed` : "All on track"}
          href="/tasks"
          tone={kpis.todayTasks.missed > 0 ? "warning" : "success"}
          testId="dashboard-kpi-todays-tasks"
        />
        <KpiCard
          label="Vaccs overdue"
          value={kpis.vaccOverdue}
          sub={kpis.vaccOverdue === 0 ? "All current" : "Across yard"}
          href="/health?status=overdue"
          tone={kpis.vaccOverdue > 0 ? "danger" : "success"}
          testId="dashboard-kpi-vacc-overdue"
        />
        <KpiCard
          label="Outstanding"
          value={formatGbp(kpis.outstandingPence)}
          sub={`${fin.outstandingInvoiceCount} unpaid`}
          href="/finance?status=overdue"
          tone={kpis.outstandingPence > 0 ? "warning" : "success"}
          testId="dashboard-kpi-outstanding"
        />
      </section>

      {/* Activity & compliance */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        <Card className="lg:col-span-2" data-testid="dashboard-chart-activity">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Activity — last 8 weeks</CardTitle>
          </CardHeader>
          <CardContent className="pl-2 pt-2 h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trend} margin={{ top: 5, right: 12, bottom: 5, left: -10 }}>
                <defs>
                  <linearGradient id="grad-tasks" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-chart-2)" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="var(--color-chart-2)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="grad-bookings" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-chart-4)" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="var(--color-chart-4)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" />
                <XAxis dataKey="week" stroke="var(--muted-foreground)" fontSize={12} />
                <YAxis stroke="var(--muted-foreground)" fontSize={12} />
                <RTooltip
                  contentStyle={{
                    background: "var(--card)",
                    border: "1px solid var(--border)",
                    borderRadius: 6,
                    fontSize: 12,
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="tasks"
                  stroke="var(--color-chart-2)"
                  fill="url(#grad-tasks)"
                  strokeWidth={2}
                  name="Tasks done"
                />
                <Area
                  type="monotone"
                  dataKey="bookings"
                  stroke="var(--color-chart-4)"
                  fill="url(#grad-bookings)"
                  strokeWidth={2}
                  name="Bookings"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card data-testid="dashboard-chart-yard-health">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Yard health score</CardTitle>
          </CardHeader>
          <CardContent className="h-[220px] relative">
            <ResponsiveContainer width="100%" height="100%">
              <RadialBarChart
                innerRadius="60%"
                outerRadius="100%"
                data={[{ name: "score", value: healthScore, fill: "var(--color-chart-3)" }]}
                startAngle={90}
                endAngle={90 - (healthScore / 100) * 360}
              >
                <RadialBar background dataKey="value" cornerRadius={6} />
              </RadialBarChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-4xl font-semibold tabular-nums">{healthScore}</span>
              <span className="text-xs text-muted-foreground">composite score</span>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Today's schedule */}
      <section>
        <h2 className="text-sm font-medium mb-2">Today&apos;s schedule</h2>
        {schedule.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nothing scheduled today.</p>
        ) : (
          <div className="flex gap-3 overflow-x-auto pb-2" data-testid="dashboard-schedule-strip">
            {schedule.map((bk) => {
              const resource = dataset.resources.find((r) => r.id === bk.resourceId);
              const horse = dataset.horses.find((h) => h.id === bk.horseId);
              return (
                <Link
                  key={bk.id}
                  href={`/bookings?id=${bk.id}`}
                  data-testid={`dashboard-schedule-card-${bk.id}`}
                  className="shrink-0 w-56 rounded-md border bg-card p-3 hover:bg-accent/30 transition"
                >
                  <div className="text-xs text-muted-foreground">{formatTime(bk.startAt)}</div>
                  <div className="text-sm font-medium truncate">{resource?.name ?? bk.type}</div>
                  <div className="text-xs text-muted-foreground truncate">
                    {horse?.stableName ?? "—"}
                  </div>
                  <Badge variant="outline" className="mt-2 capitalize text-[10px]">
                    {bk.type.replace("_", " ")}
                  </Badge>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      {/* Alerts + horse risk */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <Card data-testid="dashboard-alerts">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active alerts</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            {alerts.length === 0 ? (
              <p className="text-sm text-muted-foreground py-2">All caught up — well done.</p>
            ) : (
              <ul className="divide-y">
                {alerts.map((a, i) => (
                  <li key={a.id} data-testid={`dashboard-alert-${i}`}>
                    <Link
                      href={a.href}
                      className="flex items-start gap-3 py-2 hover:bg-accent/30 px-2 -mx-2 rounded transition"
                    >
                      <AlertTriangle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <div className="text-xs uppercase tracking-wide text-muted-foreground">
                          {a.kind}
                        </div>
                        <div className="text-sm truncate">{a.title}</div>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
        <Card data-testid="dashboard-horse-risk">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Horses with overdue actions</CardTitle>
          </CardHeader>
          <CardContent className="pt-0 h-[200px]">
            {overdueHorses.length === 0 ? (
              <p className="text-sm text-muted-foreground py-2">No horses with overdue events.</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={overdueHorses} layout="vertical" margin={{ top: 5, right: 16, bottom: 5, left: 0 }}>
                  <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" stroke="var(--muted-foreground)" fontSize={12} />
                  <YAxis dataKey="name" type="category" stroke="var(--muted-foreground)" fontSize={12} width={80} />
                  <RTooltip
                    contentStyle={{
                      background: "var(--card)",
                      border: "1px solid var(--border)",
                      borderRadius: 6,
                      fontSize: 12,
                    }}
                  />
                  <Bar dataKey="overdue" fill="var(--color-chart-3)" radius={[0, 4, 4, 0]} name="Overdue events" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </section>

      {/* Financial strip */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-3" data-testid="dashboard-financial-strip">
        <KpiCard
          label="MTD revenue"
          value={formatGbp(fin.mtdRevenuePence)}
          sub="Paid this month"
          href="/finance?status=paid"
          testId="dashboard-financial-mtd-revenue"
        />
        <KpiCard
          label="Outstanding"
          value={fin.outstandingInvoiceCount}
          sub={formatGbp(fin.outstandingPence)}
          href="/finance?status=authorised"
          tone={fin.outstandingPence > 0 ? "warning" : "success"}
          testId="dashboard-financial-outstanding-invoices"
        />
        <KpiCard
          label="Aged > 30 d"
          value={fin.aged30Count}
          sub={formatGbp(fin.aged30Pence)}
          href="/finance?aged=30"
          tone={fin.aged30Count > 0 ? "danger" : "success"}
          testId="dashboard-financial-aged-30"
        />
      </section>

      {/* Saved Paddy insights placeholder */}
      <section>
        <Card className="bg-card/50 border-dashed">
          <CardContent className="p-4 flex items-center gap-3 text-sm text-muted-foreground">
            <Sparkles className="h-4 w-4 text-primary" />
            Save Paddy&apos;s findings here for later — coming with the AI module.
            <FileText className="h-4 w-4 ml-auto" />
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
