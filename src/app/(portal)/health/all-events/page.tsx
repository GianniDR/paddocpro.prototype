import { HealthGrid } from "@/components/health/health-grid";
import { HealthTabs } from "@/components/health/health-tabs";

export default function HealthAllEventsPage() {
  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <HealthTabs />
      <HealthGrid />
    </div>
  );
}
