"use client";

import { AlertTriangle, CalendarClock, FileText, Layers } from "lucide-react";
import { useMemo } from "react";

import { KpiTile } from "@/components/shell/kpi-tile";
import { WidgetCard } from "@/components/shell/widget-card";
import { useSession } from "@/lib/auth/current";
import { formatDate } from "@/lib/format";
import { now } from "@/lib/mock/clock";
import { useDataset } from "@/lib/mock/store";

const DAY = 86_400_000;

export function DocumentsDashboard() {
  const dataset = useDataset();
  const session = useSession();
  const tenantId = session?.tenantId ?? dataset.tenants[0]?.id;

  const docs = useMemo(
    () => dataset.documents.filter((d) => d.tenantId === tenantId),
    [dataset.documents, tenantId],
  );

  const tenantNow = now().getTime();
  const expiring = docs.filter((d) => {
    if (!d.expiryDate) return false;
    const t = Date.parse(d.expiryDate);
    return t >= tenantNow && t - tenantNow <= 30 * DAY;
  }).length;
  const expired = docs.filter((d) => d.expiryDate && Date.parse(d.expiryDate) < tenantNow).length;
  const categoryCount = new Set(docs.map((d) => d.category)).size;

  const recent = useMemo(() => {
    return [...docs]
      .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt))
      .slice(0, 8)
      .map((d) => ({
        id: d.id,
        title: d.title,
        category: d.category.replace("_", " "),
        uploadedAt: d.createdAt,
      }));
  }, [docs]);

  const byEntity = useMemo(() => {
    const out: Record<string, number> = {};
    for (const d of docs) {
      out[d.entityType] = (out[d.entityType] ?? 0) + 1;
    }
    return Object.entries(out).sort((a, b) => b[1] - a[1]);
  }, [docs]);

  return (
    <div className="flex flex-1 flex-col overflow-auto bg-[#e5ebf1] px-4 pt-3 pb-3 gap-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <KpiTile
          label="Total documents"
          value={docs.length}
          Icon={FileText}
          variant="info"
          testId="documents-kpi-total"
        />
        <KpiTile
          label="Expiring 30 d"
          value={expiring}
          Icon={CalendarClock}
          variant="amber"
          testId="documents-kpi-expiring"
        />
        <KpiTile
          label="Expired"
          value={expired}
          Icon={AlertTriangle}
          variant="danger"
          testId="documents-kpi-expired"
        />
        <KpiTile
          label="Categories"
          value={categoryCount}
          Icon={Layers}
          variant="neutral"
          testId="documents-kpi-categories"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 min-h-[280px]">
        <WidgetCard title="Recent uploads">
          {recent.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4">No documents yet.</p>
          ) : (
            <table className="w-full text-sm">
              <tbody>
                {recent.map((d) => (
                  <tr key={d.id} className="border-b border-[#e5ebf1] last:border-b-0">
                    <td className="py-2 font-medium">{d.title}</td>
                    <td className="py-2 text-muted-foreground capitalize">{d.category}</td>
                    <td className="py-2 text-right tabular-nums text-muted-foreground">
                      {formatDate(d.uploadedAt, "short")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </WidgetCard>

        <WidgetCard title="Documents by entity type">
          {byEntity.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4">No documents yet.</p>
          ) : (
            <table className="w-full text-sm">
              <tbody>
                {byEntity.map(([entity, n]) => (
                  <tr key={entity} className="border-b border-[#e5ebf1] last:border-b-0">
                    <td className="py-2 capitalize">{entity}</td>
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
