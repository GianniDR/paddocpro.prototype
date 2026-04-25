import { PaddyTrigger } from "@/components/layout/paddy-trigger";
import { TenantSwitcher } from "@/components/layout/tenant-switcher";
import { UserMenu } from "@/components/layout/user-menu";
import { PageHeader } from "@/components/shell/page-header";
import { StablesGrid } from "@/components/stables/stables-grid";

export default function StablesPage() {
  return (
    <>
      <PageHeader
        breadcrumb={[{ label: "Stables & Paddocks" }]}
        rightSlot={
          <>
            <TenantSwitcher />
            <PaddyTrigger />
            <UserMenu />
          </>
        }
      />
      <StablesGrid />
    </>
  );
}
