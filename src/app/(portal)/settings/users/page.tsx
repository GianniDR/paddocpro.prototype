import { PaddyTrigger } from "@/components/layout/paddy-trigger";
import { TenantSwitcher } from "@/components/layout/tenant-switcher";
import { UserMenu } from "@/components/layout/user-menu";
import { SettingsUsersGrid } from "@/components/settings/users-grid";
import { PageHeader } from "@/components/shell/page-header";

export default function SettingsUsersPage() {
  return (
    <>
      <PageHeader
        breadcrumb={[
          { label: "Settings", href: "/settings" },
          { label: "Users & roles" },
        ]}
        rightSlot={
          <>
            <TenantSwitcher />
            <PaddyTrigger />
            <UserMenu />
          </>
        }
      />
      <SettingsUsersGrid />
    </>
  );
}
