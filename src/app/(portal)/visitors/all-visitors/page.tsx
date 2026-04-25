import { VisitorsGrid } from "@/components/visitors/visitors-grid";
import { VisitorsTabs } from "@/components/visitors/visitors-tabs";

export default function AllVisitorsPage() {
  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <VisitorsTabs />
      <VisitorsGrid />
    </div>
  );
}
