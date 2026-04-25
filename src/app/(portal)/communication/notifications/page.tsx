import { NotificationsGrid } from "@/components/communication/notifications-grid";
import { PaddyTrigger } from "@/components/layout/paddy-trigger";
import { TenantSwitcher } from "@/components/layout/tenant-switcher";
import { UserMenu } from "@/components/layout/user-menu";
import { PageHeader } from "@/components/shell/page-header";

export default function NotificationsLogPage() {
  return (
    <>
      <PageHeader
        breadcrumb={[
          { label: "Communication", href: "/communication" },
          { label: "Notifications log" },
        ]}
        rightSlot={
          <>
            <TenantSwitcher />
            <PaddyTrigger />
            <UserMenu />
          </>
        }
      />
      <NotificationsGrid />
    </>
  );
}
