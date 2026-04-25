import { PaddyTrigger } from "@/components/layout/paddy-trigger";
import { TenantSwitcher } from "@/components/layout/tenant-switcher";
import { UserMenu } from "@/components/layout/user-menu";
import { PageHeader } from "@/components/shell/page-header";
import { VisitorsGrid } from "@/components/visitors/visitors-grid";

export default function VisitorsPage() {
  return (
    <>
      <PageHeader
        breadcrumb={[{ label: "Visitors" }]}
        rightSlot={
          <>
            <TenantSwitcher />
            <PaddyTrigger />
            <UserMenu />
          </>
        }
      />
      <VisitorsGrid />
    </>
  );
}
