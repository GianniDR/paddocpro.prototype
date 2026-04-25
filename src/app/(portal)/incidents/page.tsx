import { IncidentsDashboard } from "@/components/incidents/incidents-dashboard";
import { IncidentsTabs } from "@/components/incidents/incidents-tabs";

export default function IncidentsPage() {
  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <IncidentsTabs />
      <IncidentsDashboard />
    </div>
  );
}
