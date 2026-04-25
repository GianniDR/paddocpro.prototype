"use client";

import { AlertCircle, KeyRound, Sparkles, Users } from "lucide-react";
import { useMemo } from "react";

import { KpiTile } from "@/components/shell/kpi-tile";
import { WidgetCard } from "@/components/shell/widget-card";
import { useSession } from "@/lib/auth/current";
import { formatGbp } from "@/lib/format";
import { useDataset } from "@/lib/mock/store";

export function ClientsDashboard() {
  const dataset = useDataset();
  const session = useSession();
  const tenantId = session?.tenantId ?? dataset.tenants[0]?.id;

  const clients = useMemo(
    () => dataset.clients.filter((c) => c.tenantId === tenantId),
    [dataset.clients, tenantId],
  );

  const horsesByOwner = useMemo(() => {
    const map = new Map<string, number>();
    for (const h of dataset.horses) {
      if (h.tenantId !== tenantId || h.archivedAt) continue;
      map.set(h.primaryOwnerId, (map.get(h.primaryOwnerId) ?? 0) + 1);
    }
    return map;
  }, [dataset.horses, tenantId]);

  const outstandingByClient = useMemo(() => {
    const map = new Map<string, number>();
    for (const inv of dataset.invoices) {
      if (inv.tenantId !== tenantId || inv.status !== "authorised") continue;
      const due = inv.totalPence - inv.paidAmountPence;
      if (due <= 0) continue;
      map.set(inv.clientId, (map.get(inv.clientId) ?? 0) + due);
    }
    return map;
  }, [dataset.invoices, tenantId]);

  const withOutstanding = clients.filter((c) => (outstandingByClient.get(c.id) ?? 0) > 0).length;
  const portalActive = clients.filter((c) => c.portalAccessStatus === "active").length;
  const totalHorses = Array.from(horsesByOwner.values()).reduce((s, n) => s + n, 0);
  const avgHorses = clients.length ? (totalHorses / clients.length).toFixed(1) : "0.0";

  const topByHorseCount = useMemo(() => {
    return clients
      .map((c) => {
        const u = dataset.users.find((u) => u.id === c.userAccountId);
        return {
          id: c.id,
          name: u ? `${u.firstName} ${u.lastName}` : "—",
          horses: horsesByOwner.get(c.id) ?? 0,
        };
      })
      .sort((a, b) => b.horses - a.horses)
      .slice(0, 8);
  }, [clients, dataset.users, horsesByOwner]);

  const topOutstanding = useMemo(() => {
    return clients
      .map((c) => {
        const u = dataset.users.find((u) => u.id === c.userAccountId);
        return {
          id: c.id,
          name: u ? `${u.firstName} ${u.lastName}` : "—",
          owed: outstandingByClient.get(c.id) ?? 0,
        };
      })
      .filter((r) => r.owed > 0)
      .sort((a, b) => b.owed - a.owed)
      .slice(0, 8);
  }, [clients, dataset.users, outstandingByClient]);

  return (
    <div className="flex flex-1 flex-col overflow-auto bg-[#e5ebf1] px-4 pt-3 pb-3 gap-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <KpiTile
          label="Active clients"
          value={clients.length}
          Icon={Users}
          variant="info"
          testId="clients-kpi-active"
        />
        <KpiTile
          label="With outstanding"
          value={withOutstanding}
          Icon={AlertCircle}
          variant="danger"
          testId="clients-kpi-outstanding"
        />
        <KpiTile
          label="Portal active"
          value={portalActive}
          Icon={KeyRound}
          variant="success"
          testId="clients-kpi-portal"
        />
        <KpiTile
          label="Avg horses / client"
          value={avgHorses}
          Icon={Sparkles}
          variant="neutral"
          testId="clients-kpi-avg-horses"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 min-h-[280px]">
        <WidgetCard title="Top clients by horse count">
          <table className="w-full text-sm">
            <tbody>
              {topByHorseCount.map((r) => (
                <tr key={r.id} className="border-b border-[#e5ebf1] last:border-b-0">
                  <td className="py-2">{r.name}</td>
                  <td className="py-2 text-right tabular-nums">{r.horses}</td>
                </tr>
              ))}
              {topByHorseCount.length === 0 && (
                <tr>
                  <td className="py-2 text-muted-foreground" colSpan={2}>
                    No clients yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </WidgetCard>

        <WidgetCard title="Top outstanding balances">
          <table className="w-full text-sm">
            <tbody>
              {topOutstanding.map((r) => (
                <tr key={r.id} className="border-b border-[#e5ebf1] last:border-b-0">
                  <td className="py-2">{r.name}</td>
                  <td className="py-2 text-right tabular-nums text-destructive">
                    {formatGbp(r.owed)}
                  </td>
                </tr>
              ))}
              {topOutstanding.length === 0 && (
                <tr>
                  <td className="py-2 text-muted-foreground" colSpan={2}>
                    No outstanding balances.
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
