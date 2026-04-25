import { StablesGrid } from "@/components/stables/stables-grid";
import { StablesTabs } from "@/components/stables/stables-tabs";

export default function StablesGridPage() {
  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <StablesTabs />
      <StablesGrid />
    </div>
  );
}
