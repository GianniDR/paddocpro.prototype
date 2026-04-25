"use client";

import { AlertCircle, FileText, PoundSterling, Wallet } from "lucide-react";
import { useMemo } from "react";

import { KpiTile } from "@/components/shell/kpi-tile";
import { WidgetCard } from "@/components/shell/widget-card";
import { useSession } from "@/lib/auth/current";
import { formatGbp } from "@/lib/format";
import { now } from "@/lib/mock/clock";
import { useDataset } from "@/lib/mock/store";

export function FinanceDashboard() {
  const dataset = useDataset();
  const session = useSession();
  const tenantId = session?.tenantId ?? dataset.tenants[0]?.id;

  const invoices = useMemo(
    () => dataset.invoices.filter((i) => i.tenantId === tenantId),
    [dataset.invoices, tenantId],
  );

  const stats = useMemo(() => {
    const tenantNow = now().getTime();
    const startOfMonth = new Date(tenantNow);
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    const somMs = startOfMonth.getTime();

    const outstanding = invoices
      .filter((i) => i.status !== "voided")
      .reduce((sum, i) => sum + (i.totalPence - i.paidAmountPence), 0);

    const overdue = invoices.filter(
      (i) =>
        i.status === "authorised" &&
        i.totalPence > i.paidAmountPence &&
        Date.parse(i.dueAt) < tenantNow,
    ).length;

    const paidThisMonth = dataset.payments
      .filter((p) => p.tenantId === tenantId && Date.parse(p.paidAt) >= somMs)
      .reduce((sum, p) => sum + p.amountPence, 0);

    const draft = invoices.filter((i) => i.status === "draft").length;

    return { outstanding, overdue, paidThisMonth, draft };
  }, [invoices, dataset.payments, tenantId]);

  const topOutstanding = useMemo(() => {
    const byClient = new Map<string, number>();
    invoices.forEach((i) => {
      if (i.status === "voided") return;
      const due = i.totalPence - i.paidAmountPence;
      if (due <= 0) return;
      byClient.set(i.clientId, (byClient.get(i.clientId) ?? 0) + due);
    });
    return Array.from(byClient.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([clientId, due]) => {
        const c = dataset.clients.find((x) => x.id === clientId);
        const u = dataset.users.find((u) => u.id === c?.userAccountId);
        return {
          clientId,
          name: u ? `${u.firstName} ${u.lastName}` : "—",
          due,
        };
      });
  }, [invoices, dataset.clients, dataset.users]);

  const aged = useMemo(() => {
    const tenantNow = now().getTime();
    const buckets = { "0-30": 0, "30-60": 0, "60+": 0 };
    invoices.forEach((i) => {
      if (i.status === "voided") return;
      const due = i.totalPence - i.paidAmountPence;
      if (due <= 0) return;
      const overdueDays = (tenantNow - Date.parse(i.dueAt)) / 86_400_000;
      if (overdueDays <= 0) return;
      if (overdueDays <= 30) buckets["0-30"] += 1;
      else if (overdueDays <= 60) buckets["30-60"] += 1;
      else buckets["60+"] += 1;
    });
    return buckets;
  }, [invoices]);

  return (
    <div className="flex flex-1 flex-col overflow-auto bg-[#e5ebf1] px-4 pt-3 pb-3 gap-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <KpiTile
          label="Outstanding total"
          value={formatGbp(stats.outstanding)}
          Icon={PoundSterling}
          variant="info"
          testId="finance-kpi-outstanding"
        />
        <KpiTile
          label="Overdue invoices"
          value={stats.overdue}
          Icon={AlertCircle}
          variant="danger"
          testId="finance-kpi-overdue"
        />
        <KpiTile
          label="Paid this month"
          value={formatGbp(stats.paidThisMonth)}
          Icon={Wallet}
          variant="success"
          testId="finance-kpi-paid-month"
        />
        <KpiTile
          label="Draft"
          value={stats.draft}
          Icon={FileText}
          variant="neutral"
          testId="finance-kpi-draft"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 min-h-[280px]">
        <WidgetCard title="Top outstanding by client">
          {topOutstanding.length === 0 ? (
            <p className="text-sm text-muted-foreground">No outstanding balances.</p>
          ) : (
            <table className="w-full text-sm">
              <tbody>
                {topOutstanding.map((row) => (
                  <tr
                    key={row.clientId}
                    className="border-b border-[#e5ebf1] last:border-b-0"
                  >
                    <td className="py-2">{row.name}</td>
                    <td className="py-2 text-right tabular-nums font-medium">
                      {formatGbp(row.due)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </WidgetCard>

        <WidgetCard title="Aged debtors">
          <table className="w-full text-sm">
            <tbody>
              <tr className="border-b border-[#e5ebf1]">
                <td className="py-2">0–30 days overdue</td>
                <td className="py-2 text-right tabular-nums">{aged["0-30"]}</td>
              </tr>
              <tr className="border-b border-[#e5ebf1]">
                <td className="py-2">30–60 days overdue</td>
                <td className="py-2 text-right tabular-nums">{aged["30-60"]}</td>
              </tr>
              <tr>
                <td className="py-2">60+ days overdue</td>
                <td className="py-2 text-right tabular-nums">{aged["60+"]}</td>
              </tr>
            </tbody>
          </table>
        </WidgetCard>
      </div>
    </div>
  );
}
