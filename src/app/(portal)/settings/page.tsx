import { PaddyTrigger } from "@/components/layout/paddy-trigger";
import { TenantSwitcher } from "@/components/layout/tenant-switcher";
import { UserMenu } from "@/components/layout/user-menu";
import { SettingsShell } from "@/components/settings/settings-shell";
import { PageHeader } from "@/components/shell/page-header";

export default function SettingsPage() {
  return (
    <>
      <PageHeader
        breadcrumb={[{ label: "Settings" }]}
        rightSlot={
          <>
            <TenantSwitcher />
            <PaddyTrigger />
            <UserMenu />
          </>
        }
      />
      <SettingsShell />
    </>
  );
}
