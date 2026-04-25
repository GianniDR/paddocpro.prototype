import { DocumentsGrid } from "@/components/documents/documents-grid";
import { PaddyTrigger } from "@/components/layout/paddy-trigger";
import { TenantSwitcher } from "@/components/layout/tenant-switcher";
import { UserMenu } from "@/components/layout/user-menu";
import { PageHeader } from "@/components/shell/page-header";

export default function DocumentsPage() {
  return (
    <>
      <PageHeader
        breadcrumb={[{ label: "Documents" }]}
        rightSlot={
          <>
            <TenantSwitcher />
            <PaddyTrigger />
            <UserMenu />
          </>
        }
      />
      <DocumentsGrid />
    </>
  );
}
