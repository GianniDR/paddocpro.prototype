import { IncidentsGrid } from "@/components/incidents/incidents-grid";
import { PaddyTrigger } from "@/components/layout/paddy-trigger";
import { TenantSwitcher } from "@/components/layout/tenant-switcher";
import { UserMenu } from "@/components/layout/user-menu";
import { PageHeader } from "@/components/shell/page-header";

export default function IncidentsPage() {
  return (
    <>
      <PageHeader
        breadcrumb={[{ label: "Incidents" }]}
        rightSlot={
          <>
            <TenantSwitcher />
            <PaddyTrigger />
            <UserMenu />
          </>
        }
      />
      <IncidentsGrid />
    </>
  );
}
