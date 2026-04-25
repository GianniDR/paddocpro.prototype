import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { PaddyTrigger } from "@/components/layout/paddy-trigger";
import { TenantSwitcher } from "@/components/layout/tenant-switcher";
import { UserMenu } from "@/components/layout/user-menu";
import { PageHeader } from "@/components/shell/page-header";

export default function DashboardPage() {
  return (
    <>
      <PageHeader
        breadcrumb={[{ label: "Overview" }]}
        rightSlot={
          <>
            <TenantSwitcher />
            <PaddyTrigger />
            <UserMenu />
          </>
        }
      />
      <DashboardShell />
    </>
  );
}
