import { IncidentsGrid } from "@/components/incidents/incidents-grid";
import { IncidentsTabs } from "@/components/incidents/incidents-tabs";

export default function AllIncidentsPage() {
  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <IncidentsTabs />
      <IncidentsGrid />
    </div>
  );
}
