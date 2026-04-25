import { notFound } from "next/navigation";

import { PaddyTrigger } from "@/components/layout/paddy-trigger";
import { TenantSwitcher } from "@/components/layout/tenant-switcher";
import { UserMenu } from "@/components/layout/user-menu";
import {
  AgedDebtorsReport,
  HorseHealthReport,
  OccupancyReport,
} from "@/components/reports/report-viewer";
import { PageHeader } from "@/components/shell/page-header";

const REPORTS: Record<string, { label: string; component: React.ComponentType }> = {
  occupancy: { label: "Occupancy", component: OccupancyReport },
  "aged-debtors": { label: "Aged debtors", component: AgedDebtorsReport },
  "horse-health": { label: "Horse health overview", component: HorseHealthReport },
};

export default async function ReportPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const report = REPORTS[slug];
  if (!report) notFound();
  const View = report.component;
  return (
    <>
      <PageHeader
        breadcrumb={[
          { label: "Reports", href: "/reports" },
          { label: report.label },
        ]}
        rightSlot={
          <>
            <TenantSwitcher />
            <PaddyTrigger />
            <UserMenu />
          </>
        }
      />
      <View />
    </>
  );
}
