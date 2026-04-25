import { BookingsGrid } from "@/components/bookings/bookings-grid";
import { PaddyTrigger } from "@/components/layout/paddy-trigger";
import { TenantSwitcher } from "@/components/layout/tenant-switcher";
import { UserMenu } from "@/components/layout/user-menu";
import { PageHeader } from "@/components/shell/page-header";

export default function BookingsPage() {
  return (
    <>
      <PageHeader
        breadcrumb={[{ label: "Bookings" }]}
        rightSlot={
          <>
            <TenantSwitcher />
            <PaddyTrigger />
            <UserMenu />
          </>
        }
      />
      <BookingsGrid />
    </>
  );
}
