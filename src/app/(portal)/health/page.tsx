import { HealthGrid } from "@/components/health/health-grid";
import { PaddyTrigger } from "@/components/layout/paddy-trigger";
import { TenantSwitcher } from "@/components/layout/tenant-switcher";
import { UserMenu } from "@/components/layout/user-menu";
import { PageHeader } from "@/components/shell/page-header";

export default function HealthPage() {
  return (
    <>
      <PageHeader
        breadcrumb={[{ label: "Health" }]}
        rightSlot={
          <>
            <TenantSwitcher />
            <PaddyTrigger />
            <UserMenu />
          </>
        }
      />
      <HealthGrid />
    </>
  );
}
