import { PaddyTrigger } from "@/components/layout/paddy-trigger";
import { TenantSwitcher } from "@/components/layout/tenant-switcher";
import { UserMenu } from "@/components/layout/user-menu";
import { RbacMatrix } from "@/components/settings/rbac-matrix";
import { PageHeader } from "@/components/shell/page-header";

export default function SettingsRbacPage() {
  return (
    <>
      <PageHeader
        breadcrumb={[
          { label: "Settings", href: "/settings" },
          { label: "Roles & permissions" },
        ]}
        rightSlot={
          <>
            <TenantSwitcher />
            <PaddyTrigger />
            <UserMenu />
          </>
        }
      />
      <RbacMatrix />
    </>
  );
}
