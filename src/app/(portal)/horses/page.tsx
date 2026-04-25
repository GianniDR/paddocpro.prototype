import { HorsesGrid } from "@/components/horses/horses-grid";
import { PaddyTrigger } from "@/components/layout/paddy-trigger";
import { TenantSwitcher } from "@/components/layout/tenant-switcher";
import { UserMenu } from "@/components/layout/user-menu";
import { PageHeader } from "@/components/shell/page-header";

export default function HorsesPage() {
  return (
    <>
      <PageHeader
        breadcrumb={[{ label: "Horses" }]}
        rightSlot={
          <>
            <TenantSwitcher />
            <PaddyTrigger />
            <UserMenu />
          </>
        }
      />
      <HorsesGrid />
    </>
  );
}
