import { PaddyTrigger } from "@/components/layout/paddy-trigger";
import { TenantSwitcher } from "@/components/layout/tenant-switcher";
import { UserMenu } from "@/components/layout/user-menu";
import { PageHeader } from "@/components/shell/page-header";
import { StaffGrid } from "@/components/staff/staff-grid";

export default function StaffPage() {
  return (
    <>
      <PageHeader
        breadcrumb={[{ label: "Staff" }]}
        rightSlot={
          <>
            <TenantSwitcher />
            <PaddyTrigger />
            <UserMenu />
          </>
        }
      />
      <StaffGrid />
    </>
  );
}
