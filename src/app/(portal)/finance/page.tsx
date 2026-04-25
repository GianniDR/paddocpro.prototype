import { FinanceGrid } from "@/components/finance/finance-grid";
import { PaddyTrigger } from "@/components/layout/paddy-trigger";
import { TenantSwitcher } from "@/components/layout/tenant-switcher";
import { UserMenu } from "@/components/layout/user-menu";
import { PageHeader } from "@/components/shell/page-header";

export default function FinancePage() {
  return (
    <>
      <PageHeader
        breadcrumb={[{ label: "Finance" }]}
        rightSlot={
          <>
            <TenantSwitcher />
            <PaddyTrigger />
            <UserMenu />
          </>
        }
      />
      <FinanceGrid />
    </>
  );
}
