import { notFound } from "next/navigation";

import {
  AgedDebtorsReport,
  HorseHealthReport,
  OccupancyReport,
} from "@/components/reports/report-viewer";

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
  return <View />;
}
