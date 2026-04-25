import { StaffGrid } from "@/components/staff/staff-grid";
import { StaffTabs } from "@/components/staff/staff-tabs";

export default function StaffAllPage() {
  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <StaffTabs />
      <StaffGrid />
    </div>
  );
}
