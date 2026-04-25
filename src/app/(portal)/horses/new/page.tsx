import { AddHorseWizard } from "@/components/horses/add-horse-wizard";
import { PaddyTrigger } from "@/components/layout/paddy-trigger";
import { TenantSwitcher } from "@/components/layout/tenant-switcher";
import { UserMenu } from "@/components/layout/user-menu";
import { PageHeader } from "@/components/shell/page-header";

export default function NewHorsePage() {
  return (
    <>
      <PageHeader
        breadcrumb={[
          { label: "Horses", href: "/horses" },
          { label: "Add horse" },
        ]}
        rightSlot={
          <>
            <TenantSwitcher />
            <PaddyTrigger />
            <UserMenu />
          </>
        }
      />
      <AddHorseWizard />
    </>
  );
}
