"use client";

import { ChevronLeft, Download } from "lucide-react";
import Link from "next/link";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip as RTooltip,
  XAxis,
  YAxis,
} from "recharts";

import { StatusBadge } from "@/components/shell/status-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSession } from "@/lib/auth/current";
import { formatDate, formatGbp } from "@/lib/format";
import { now } from "@/lib/mock/clock";
import { useDataset } from "@/lib/mock/store";

const DAY = 86_400_000;

function ToolbarRow({ slug, title, description }: { slug: string; title: string; description: string }) {
  return (
    <div className="flex flex-wrap items-start gap-3 mb-4">
      <Button
        render={<Link href="/reports" data-testid="report-back" />}
        variant="outline"
        size="sm"
      >
        <ChevronLeft className="h-3.5 w-3.5" /> All reports
      </Button>
      <div className="flex-1 min-w-[200px]">
        <h1 className="text-2xl font-display italic font-semibold">{title}</h1>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <Button variant="outline" size="sm" data-testid={`report-${slug}-export-csv`}>
        <Download className="h-3.5 w-3.5" /> Export CSV
      </Button>
      <Button variant="outline" size="sm" data-testid={`report-${slug}-export-pdf`}>
        <Download className="h-3.5 w-3.5" /> Export PDF
      </Button>
    </div>
  );
}

export function OccupancyReport() {
  const dataset = useDataset();
  const session = useSession();
  const tenantId = session?.tenantId ?? dataset.tenants[0]?.id;
  const stables = dataset.stables.filter((s) => s.tenantId === tenantId);
  const total = stables.length;
  const occupied = stables.filter((s) => s.status === "occupied").length;
  const vacant = stables.filter((s) => s.status === "vacant").length;
  const maintenance = stables.filter((s) => s.status === "maintenance").length;

  const horses = dataset.horses.filter((h) => h.tenantId === tenantId);
  const tiers: Record<string, number> = {};
  horses.forEach((h) => {
    const pkg = dataset.liveryPackages.find((p) => p.id === h.liveryPackageId);
    const tier = pkg?.tier ?? "unknown";
    tiers[tier] = (tiers[tier] ?? 0) + 1;
  });
  const tierData = Object.entries(tiers).map(([tier, count]) => ({ tier, count }));

  const blocks: Record<string, { occupied: number; vacant: number; maintenance: number }> = {};
  stables.forEach((s) => {
    if (!blocks[s.block]) blocks[s.block] = { occupied: 0, vacant: 0, maintenance: 0 };
    blocks[s.block][s.status] += 1;
  });
  const blockData = Object.entries(blocks).map(([block, d]) => ({ block, ...d }));

  return (
    <div className="p-4 pb-12 flex-1" data-testid="report-occupancy">
      <ToolbarRow
        slug="occupancy"
        title="Occupancy report"
        description="Stable occupancy by status, livery type split, vacancy trend by block."
      />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Status mix</CardTitle>
          </CardHeader>
          <CardContent className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={[
                    { name: "Occupied", value: occupied, fill: "var(--color-chart-3)" },
                    { name: "Vacant", value: vacant, fill: "var(--color-chart-1)" },
                    { name: "Maintenance", value: maintenance, fill: "var(--color-chart-5)" },
                  ]}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={50}
                  outerRadius={90}
                  paddingAngle={2}
                  label
                />
                <RTooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex justify-center gap-4 text-xs">
              <span>Occupied <strong>{occupied}</strong></span>
              <span>Vacant <strong>{vacant}</strong></span>
              <span>Maintenance <strong>{maintenance}</strong></span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">By block</CardTitle>
          </CardHeader>
          <CardContent className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={blockData} margin={{ top: 5, right: 12, bottom: 5, left: -10 }}>
                <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" />
                <XAxis dataKey="block" stroke="var(--muted-foreground)" fontSize={11} />
                <YAxis stroke="var(--muted-foreground)" fontSize={11} />
                <RTooltip
                  contentStyle={{
                    background: "var(--card)",
                    border: "1px solid var(--border)",
                    borderRadius: 6,
                    fontSize: 12,
                  }}
                />
                <Bar dataKey="occupied" stackId="a" fill="var(--color-chart-3)" name="Occupied" />
                <Bar dataKey="vacant" stackId="a" fill="var(--color-chart-1)" name="Vacant" />
                <Bar dataKey="maintenance" stackId="a" fill="var(--color-chart-5)" name="Maintenance" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Livery split</CardTitle>
          </CardHeader>
          <CardContent className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={tierData}
                layout="vertical"
                margin={{ top: 5, right: 16, bottom: 5, left: 20 }}
              >
                <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" stroke="var(--muted-foreground)" fontSize={11} />
                <YAxis dataKey="tier" type="category" stroke="var(--muted-foreground)" fontSize={11} width={80} />
                <RTooltip
                  contentStyle={{
                    background: "var(--card)",
                    border: "1px solid var(--border)",
                    borderRadius: 6,
                    fontSize: 12,
                  }}
                />
                <Bar dataKey="count" name="Horses" radius={[0, 4, 4, 0]}>
                  {tierData.map((_, i) => (
                    <Cell key={i} fill={`var(--color-chart-${(i % 5) + 1})`} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-4">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Stable detail</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-muted-foreground">
                <tr>
                  <th className="text-left font-medium px-3 py-2">Block</th>
                  <th className="text-left font-medium px-3 py-2">Number</th>
                  <th className="text-left font-medium px-3 py-2">Status</th>
                  <th className="text-left font-medium px-3 py-2">Currently housing</th>
                  <th className="text-left font-medium px-3 py-2">Designation</th>
                </tr>
              </thead>
              <tbody>
                {stables.slice(0, 30).map((s) => {
                  const horse = dataset.horses.find((h) => h.id === s.currentHorseId);
                  return (
                    <tr key={s.id} className="border-t">
                      <td className="px-3 py-2">{s.block}</td>
                      <td className="px-3 py-2 font-medium">{s.number}</td>
                      <td className="px-3 py-2">
                        <StatusBadge status={s.status} />
                      </td>
                      <td className="px-3 py-2">{horse?.stableName ?? "—"}</td>
                      <td className="px-3 py-2 capitalize">{s.designation}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <p className="text-xs text-muted-foreground mt-4">
        Total {total} stables · Occupancy {Math.round((occupied / total) * 100)}%
      </p>
    </div>
  );
}

export function AgedDebtorsReport() {
  const dataset = useDataset();
  const session = useSession();
  const tenantId = session?.tenantId ?? dataset.tenants[0]?.id;
  const tenantNow = now().getTime();

  const buckets = { current: 0, "0-30": 0, "31-60": 0, "61-90": 0, "90+": 0 };
  const byClient: Record<string, { name: string; total: number }> = {};
  dataset.invoices
    .filter((i) => i.tenantId === tenantId && i.status === "authorised")
    .forEach((i) => {
      const due = Date.parse(i.dueAt);
      const owe = i.totalPence - i.paidAmountPence;
      const days = Math.floor((tenantNow - due) / DAY);
      if (days < 0) buckets.current += owe;
      else if (days <= 30) buckets["0-30"] += owe;
      else if (days <= 60) buckets["31-60"] += owe;
      else if (days <= 90) buckets["61-90"] += owe;
      else buckets["90+"] += owe;

      const c = dataset.clients.find((c) => c.id === i.clientId);
      const u = dataset.users.find((u) => u.id === c?.userAccountId);
      const key = i.clientId;
      if (!byClient[key]) byClient[key] = { name: u ? `${u.firstName} ${u.lastName}` : "—", total: 0 };
      byClient[key].total += owe;
    });

  const bucketData = Object.entries(buckets).map(([bucket, total]) => ({
    bucket,
    total: total / 100,
  }));

  const clientList = Object.values(byClient)
    .filter((c) => c.total > 0)
    .sort((a, b) => b.total - a.total)
    .slice(0, 10);

  return (
    <div className="p-4 pb-12 flex-1" data-testid="report-aged-debtors">
      <ToolbarRow
        slug="aged-debtors"
        title="Aged debtors"
        description="Outstanding balance by client, bucketed by days overdue."
      />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Bucketed totals</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={bucketData} margin={{ top: 5, right: 16, bottom: 5, left: 0 }}>
                <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" />
                <XAxis dataKey="bucket" stroke="var(--muted-foreground)" fontSize={11} />
                <YAxis stroke="var(--muted-foreground)" fontSize={11} tickFormatter={(v) => `£${v}`} />
                <RTooltip
                  contentStyle={{
                    background: "var(--card)",
                    border: "1px solid var(--border)",
                    borderRadius: 6,
                    fontSize: 12,
                  }}
                  formatter={(v) => [`£${Number(v).toFixed(2)}`, "Total"]}
                />
                <Bar dataKey="total" radius={[4, 4, 0, 0]}>
                  {bucketData.map((b, i) => {
                    const danger = b.bucket === "61-90" || b.bucket === "90+";
                    const warning = b.bucket === "31-60";
                    return (
                      <Cell
                        key={i}
                        fill={
                          danger
                            ? "var(--destructive)"
                            : warning
                              ? "var(--color-chart-5)"
                              : "var(--color-chart-3)"
                        }
                      />
                    );
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Top clients by outstanding</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-muted-foreground">
                <tr>
                  <th className="text-left font-medium px-3 py-2">Client</th>
                  <th className="text-right font-medium px-3 py-2">Outstanding</th>
                </tr>
              </thead>
              <tbody>
                {clientList.length === 0 && (
                  <tr>
                    <td colSpan={2} className="px-3 py-8 text-center text-muted-foreground">
                      No outstanding amounts.
                    </td>
                  </tr>
                )}
                {clientList.map((c, i) => (
                  <tr key={i} className="border-t">
                    <td className="px-3 py-2">{c.name}</td>
                    <td className="px-3 py-2 text-right tabular-nums">{formatGbp(c.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export function HorseHealthReport() {
  const dataset = useDataset();
  const session = useSession();
  const tenantId = session?.tenantId ?? dataset.tenants[0]?.id;
  const tenantNow = now().getTime();

  const horses = dataset.horses.filter((h) => h.tenantId === tenantId);
  const rows = horses.map((h) => {
    const events = dataset.healthEvents.filter((e) => e.horseId === h.id);
    function statusFor(kind: string): string {
      const ev = events
        .filter((e) => e.kind === kind && e.nextDueDate)
        .sort((a, b) => Date.parse(b.eventDate) - Date.parse(a.eventDate))[0];
      if (!ev || !ev.nextDueDate) return "unknown";
      const t = Date.parse(ev.nextDueDate);
      if (t < tenantNow) return "overdue";
      if (t - tenantNow < 30 * DAY) return "due_30d";
      return "current";
    }
    return {
      id: h.id,
      name: h.stableName,
      vacc: statusFor("vaccination"),
      worming: statusFor("worming"),
      farrier: statusFor("farrier"),
      dental: statusFor("dental"),
    };
  });

  return (
    <div className="p-4 pb-12 flex-1" data-testid="report-horse-health">
      <ToolbarRow
        slug="horse-health"
        title="Horse health overview"
        description="Vaccination, worming, farrier and dental status across every horse."
      />
      <Card>
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-muted-foreground sticky top-0">
              <tr>
                <th className="text-left font-medium px-3 py-2">Horse</th>
                <th className="text-left font-medium px-3 py-2">Vaccination</th>
                <th className="text-left font-medium px-3 py-2">Worming</th>
                <th className="text-left font-medium px-3 py-2">Farrier</th>
                <th className="text-left font-medium px-3 py-2">Dental</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-t">
                  <td className="px-3 py-2">
                    <Link
                      href={`/horses/${r.id}`}
                      className="text-primary hover:underline font-medium"
                      data-testid={`drill-horse-${r.id}`}
                    >
                      {r.name}
                    </Link>
                  </td>
                  <td className="px-3 py-2">
                    <StatusBadge status={r.vacc} />
                  </td>
                  <td className="px-3 py-2">
                    <StatusBadge status={r.worming} />
                  </td>
                  <td className="px-3 py-2">
                    <StatusBadge status={r.farrier} />
                  </td>
                  <td className="px-3 py-2">
                    <StatusBadge status={r.dental} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
      <div className="flex flex-wrap gap-2 mt-4 text-xs">
        <Badge variant="outline">{rows.length} horses</Badge>
        <Badge variant="outline">{rows.filter((r) => r.vacc === "overdue").length} vacc overdue</Badge>
        <Badge variant="outline">Snapshot at {formatDate(now().toISOString())}</Badge>
      </div>
    </div>
  );
}
