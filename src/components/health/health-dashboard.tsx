"use client";

import { AlertTriangle, CalendarClock, HeartPulse, ShieldCheck } from "lucide-react";
import { useMemo } from "react";

import { HealthHeatmap } from "@/components/health/health-heatmap";
import { KpiTile } from "@/components/shell/kpi-tile";
import { useSession } from "@/lib/auth/current";
import { now } from "@/lib/mock/clock";
import { useDataset } from "@/lib/mock/store";

const DAY = 86_400_000;

export function HealthDashboard() {
  const dataset = useDataset();
  const session = useSession();
  const tenantId = session?.tenantId ?? dataset.tenants[0]?.id;

  const stats = useMemo(() => {
    if (!tenantId) {
      return { current: 0, due30: 0, overdue: 0, treating: 0 };
    }
    const tenantNow = now().getTime();
    const horses = dataset.horses.filter((h) => h.tenantId === tenantId && !h.archivedAt);

    let current = 0;
    let due30 = 0;
    let overdue = 0;

    for (const horse of horses) {
      const vacc = dataset.healthEvents
        .filter((e) => e.horseId === horse.id && e.kind === "vaccination" && e.nextDueDate)
        .sort((a, b) => Date.parse(b.eventDate) - Date.parse(a.eventDate))[0];
      if (!vacc || !vacc.nextDueDate) continue;
      const t = Date.parse(vacc.nextDueDate);
      if (t < tenantNow) overdue += 1;
      else if (t - tenantNow < 30 * DAY) due30 += 1;
      else current += 1;
    }

    const treating = horses.filter(
      (h) => h.healthStatus === "vet_care" || h.healthStatus === "isolating",
    ).length;

    return { current, due30, overdue, treating };
  }, [dataset, tenantId]);

  return (
    <div className="flex flex-1 flex-col overflow-auto bg-[#e5ebf1] px-4 pt-3 pb-3 gap-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <KpiTile
          label="Vaccinations current"
          value={stats.current}
          Icon={ShieldCheck}
          variant="success"
          testId="health-kpi-current"
        />
        <KpiTile
          label="Due ≤30 d"
          value={stats.due30}
          Icon={CalendarClock}
          variant="amber"
          testId="health-kpi-due-30"
        />
        <KpiTile
          label="Overdue"
          value={stats.overdue}
          Icon={AlertTriangle}
          variant="danger"
          testId="health-kpi-overdue"
        />
        <KpiTile
          label="Under treatment"
          value={stats.treating}
          Icon={HeartPulse}
          variant="info"
          testId="health-kpi-treating"
        />
      </div>

      <HealthHeatmap />
    </div>
  );
}
