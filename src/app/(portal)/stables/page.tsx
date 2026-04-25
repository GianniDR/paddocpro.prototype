import { StablesDashboard } from "@/components/stables/stables-dashboard";
import { StablesTabs } from "@/components/stables/stables-tabs";

export default function StablesPage() {
  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <StablesTabs />
      <StablesDashboard />
    </div>
  );
}
