import { FeedGrid } from "@/components/feed-supplies/feed-grid";
import { PaddyTrigger } from "@/components/layout/paddy-trigger";
import { TenantSwitcher } from "@/components/layout/tenant-switcher";
import { UserMenu } from "@/components/layout/user-menu";
import { PageHeader } from "@/components/shell/page-header";

export default function FeedSuppliesPage() {
  return (
    <>
      <PageHeader
        breadcrumb={[{ label: "Feed & Supplies" }]}
        rightSlot={
          <>
            <TenantSwitcher />
            <PaddyTrigger />
            <UserMenu />
          </>
        }
      />
      <FeedGrid />
    </>
  );
}
