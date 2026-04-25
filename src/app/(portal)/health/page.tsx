import { HealthDashboard } from "@/components/health/health-dashboard";
import { HealthTabs } from "@/components/health/health-tabs";

export default function HealthPage() {
  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <HealthTabs />
      <HealthDashboard />
    </div>
  );
}
