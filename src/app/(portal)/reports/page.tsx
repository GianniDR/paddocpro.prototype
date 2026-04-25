import { Construction } from "lucide-react";

import { PaddyTrigger } from "@/components/layout/paddy-trigger";
import { TenantSwitcher } from "@/components/layout/tenant-switcher";
import { UserMenu } from "@/components/layout/user-menu";
import { EmptyState } from "@/components/shell/empty-state";
import { PageHeader } from "@/components/shell/page-header";

export default function ReportsPage() {
  return (
    <>
      <PageHeader
        breadcrumb={[{ label: "Reports" }]}
        rightSlot={
          <>
            <TenantSwitcher />
            <PaddyTrigger />
            <UserMenu />
          </>
        }
      />
      <EmptyState
        icon={Construction}
        title="Reports module"
        body="Coming up in the next pass — grids, detail views, create flows."
        testId="reports-empty"
      />
    </>
  );
}
