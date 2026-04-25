"use client";

import { AlertTriangle, HeartPulse, Sparkles, Users } from "lucide-react";
import { useMemo } from "react";

import { KpiTile } from "@/components/shell/kpi-tile";
import { WidgetCard } from "@/components/shell/widget-card";
import { useSession } from "@/lib/auth/current";
import { useDataset } from "@/lib/mock/store";

export function HorsesDashboard() {
  const dataset = useDataset();
  const session = useSession();
  const tenantId = session?.tenantId ?? dataset.tenants[0]?.id;

  const horses = useMemo(
    () => dataset.horses.filter((h) => h.tenantId === tenantId && !h.archivedAt),
    [dataset.horses, tenantId],
  );

  const isolating = horses.filter((h) => h.healthStatus === "isolating").length;
  const vetCare = horses.filter((h) => h.healthStatus === "vet_care").length;
  const owners = new Set(horses.map((h) => h.primaryOwnerId)).size;

  const healthCounts = horses.reduce<Record<string, number>>((acc, h) => {
    acc[h.healthStatus] = (acc[h.healthStatus] ?? 0) + 1;
    return acc;
  }, {});

  const liveryCounts = horses.reduce<Record<string, number>>((acc, h) => {
    const pkg = dataset.liveryPackages.find((p) => p.id === h.liveryPackageId);
    const name = pkg?.name ?? "—";
    acc[name] = (acc[name] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div className="flex flex-1 flex-col overflow-auto bg-[#e5ebf1] px-4 pt-3 pb-3 gap-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <KpiTile label="Active horses" value={horses.length} Icon={Sparkles} variant="info" testId="horses-kpi-active" />
        <KpiTile label="Isolating" value={isolating} Icon={AlertTriangle} variant="danger" testId="horses-kpi-isolating" />
        <KpiTile label="Under vet care" value={vetCare} Icon={HeartPulse} variant="amber" testId="horses-kpi-vet-care" />
        <KpiTile label="Owners" value={owners} Icon={Users} variant="neutral" testId="horses-kpi-owners" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 min-h-[280px]">
        <WidgetCard title="Health status breakdown">
          <table className="w-full text-sm">
            <tbody>
              {Object.entries(healthCounts).map(([k, v]) => (
                <tr key={k} className="border-b border-[#e5ebf1] last:border-b-0">
                  <td className="py-2 capitalize">{k.replace("_", " ")}</td>
                  <td className="py-2 text-right tabular-nums">{v}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </WidgetCard>

        <WidgetCard title="Livery package mix">
          <table className="w-full text-sm">
            <tbody>
              {Object.entries(liveryCounts).map(([k, v]) => (
                <tr key={k} className="border-b border-[#e5ebf1] last:border-b-0">
                  <td className="py-2">{k}</td>
                  <td className="py-2 text-right tabular-nums">{v}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </WidgetCard>
      </div>
    </div>
  );
}
