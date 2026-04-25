import { ClientsGrid } from "@/components/clients/clients-grid";
import { PaddyTrigger } from "@/components/layout/paddy-trigger";
import { TenantSwitcher } from "@/components/layout/tenant-switcher";
import { UserMenu } from "@/components/layout/user-menu";
import { PageHeader } from "@/components/shell/page-header";

export default function ClientsPage() {
  return (
    <>
      <PageHeader
        breadcrumb={[{ label: "Clients" }]}
        rightSlot={
          <>
            <TenantSwitcher />
            <PaddyTrigger />
            <UserMenu />
          </>
        }
      />
      <ClientsGrid />
    </>
  );
}
