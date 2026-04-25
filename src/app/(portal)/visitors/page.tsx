import { Construction } from "lucide-react";

import { PaddyTrigger } from "@/components/layout/paddy-trigger";
import { TenantSwitcher } from "@/components/layout/tenant-switcher";
import { UserMenu } from "@/components/layout/user-menu";
import { EmptyState } from "@/components/shell/empty-state";
import { PageHeader } from "@/components/shell/page-header";

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
      <EmptyState
        icon={Construction}
        title="Visitors module"
        body="Coming up in the next pass — grids, detail views, create flows."
        testId="visitors-empty"
      />
    </>
  );
}
