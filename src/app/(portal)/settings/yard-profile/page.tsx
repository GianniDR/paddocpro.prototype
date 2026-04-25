import { PaddyTrigger } from "@/components/layout/paddy-trigger";
import { TenantSwitcher } from "@/components/layout/tenant-switcher";
import { UserMenu } from "@/components/layout/user-menu";
import { YardProfileForm } from "@/components/settings/yard-profile-form";
import { PageHeader } from "@/components/shell/page-header";

export default function SettingsYardProfilePage() {
  return (
    <>
      <PageHeader
        breadcrumb={[
          { label: "Settings", href: "/settings" },
          { label: "Yard profile" },
        ]}
        rightSlot={
          <>
            <TenantSwitcher />
            <PaddyTrigger />
            <UserMenu />
          </>
        }
      />
      <YardProfileForm />
    </>
  );
}
