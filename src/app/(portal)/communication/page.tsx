import { CommunicationShell } from "@/components/communication/communication-shell";
import { PaddyTrigger } from "@/components/layout/paddy-trigger";
import { TenantSwitcher } from "@/components/layout/tenant-switcher";
import { UserMenu } from "@/components/layout/user-menu";
import { PageHeader } from "@/components/shell/page-header";

export default function CommunicationPage() {
  return (
    <>
      <PageHeader
        breadcrumb={[{ label: "Communication" }]}
        rightSlot={
          <>
            <TenantSwitcher />
            <PaddyTrigger />
            <UserMenu />
          </>
        }
      />
      <CommunicationShell />
    </>
  );
}
