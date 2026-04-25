import { HorsesGrid } from "@/components/horses/horses-grid";
import { HorsesTabs } from "@/components/horses/horses-tabs";

export default function HorsesGridPage() {
  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <HorsesTabs />
      <HorsesGrid />
    </div>
  );
}
