import { PaddyTrigger } from "@/components/layout/paddy-trigger";
import { TenantSwitcher } from "@/components/layout/tenant-switcher";
import { UserMenu } from "@/components/layout/user-menu";
import { XeroConnectWizard } from "@/components/settings/xero-connect-wizard";
import { PageHeader } from "@/components/shell/page-header";

export default function SettingsXeroPage() {
  return (
    <>
      <PageHeader
        breadcrumb={[
          { label: "Settings", href: "/settings" },
          { label: "Integrations", href: "/settings" },
          { label: "Xero" },
        ]}
        rightSlot={
          <>
            <TenantSwitcher />
            <PaddyTrigger />
            <UserMenu />
          </>
        }
      />
      <XeroConnectWizard />
    </>
  );
}
