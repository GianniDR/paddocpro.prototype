import { PaddyTrigger } from "@/components/layout/paddy-trigger";
import { TenantSwitcher } from "@/components/layout/tenant-switcher";
import { UserMenu } from "@/components/layout/user-menu";
import { ReportsCatalogue } from "@/components/reports/reports-catalogue";
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
      <ReportsCatalogue />
    </>
  );
}
