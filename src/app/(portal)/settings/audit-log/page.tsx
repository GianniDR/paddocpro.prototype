import { PaddyTrigger } from "@/components/layout/paddy-trigger";
import { TenantSwitcher } from "@/components/layout/tenant-switcher";
import { UserMenu } from "@/components/layout/user-menu";
import { AuditLogGrid } from "@/components/settings/audit-log-grid";
import { PageHeader } from "@/components/shell/page-header";

export default function SettingsAuditLogPage() {
  return (
    <>
      <PageHeader
        breadcrumb={[
          { label: "Settings", href: "/settings" },
          { label: "Audit log" },
        ]}
        rightSlot={
          <>
            <TenantSwitcher />
            <PaddyTrigger />
            <UserMenu />
          </>
        }
      />
      <AuditLogGrid />
    </>
  );
}
