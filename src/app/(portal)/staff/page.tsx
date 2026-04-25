import { StaffDashboard } from "@/components/staff/staff-dashboard";
import { StaffTabs } from "@/components/staff/staff-tabs";

export default function StaffPage() {
  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <StaffTabs />
      <StaffDashboard />
    </div>
  );
}
