"use client";

import { CheckCircle2, Home, Wrench, XCircle } from "lucide-react";
import { useMemo } from "react";

import { KpiTile } from "@/components/shell/kpi-tile";
import { WidgetCard } from "@/components/shell/widget-card";
import { YardMap } from "@/components/stables/yard-map";
import { useSession } from "@/lib/auth/current";
import { useDataset } from "@/lib/mock/store";

export function StablesDashboard() {
  const dataset = useDataset();
  const session = useSession();
  const tenantId = session?.tenantId ?? dataset.tenants[0]?.id;

  const stables = useMemo(
    () => dataset.stables.filter((s) => s.tenantId === tenantId),
    [dataset.stables, tenantId],
  );

  const occupied = stables.filter((s) => s.status === "occupied").length;
  const vacant = stables.filter((s) => s.status === "vacant").length;
  const maintenance = stables.filter((s) => s.status === "maintenance").length;

  return (
    <div className="flex flex-1 flex-col overflow-auto bg-[#e5ebf1] px-4 pt-3 pb-3 gap-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <KpiTile
          label="Total stables"
          value={stables.length}
          Icon={Home}
          variant="info"
          testId="stables-kpi-total"
        />
        <KpiTile
          label="Occupied"
          value={occupied}
          Icon={CheckCircle2}
          variant="success"
          testId="stables-kpi-occupied"
        />
        <KpiTile
          label="Vacant"
          value={vacant}
          Icon={XCircle}
          variant="neutral"
          testId="stables-kpi-vacant"
        />
        <KpiTile
          label="Maintenance"
          value={maintenance}
          Icon={Wrench}
          variant="amber"
          testId="stables-kpi-maintenance"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 min-h-[280px]">
        <WidgetCard title="Yard layout">
          <YardMap />
        </WidgetCard>
      </div>
    </div>
  );
}
