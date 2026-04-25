import { VisitorsDashboard } from "@/components/visitors/visitors-dashboard";
import { VisitorsTabs } from "@/components/visitors/visitors-tabs";

export default function VisitorsPage() {
  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <VisitorsTabs />
      <VisitorsDashboard />
    </div>
  );
}
