import { HorseProfile } from "@/components/horses/horse-profile";
import { PaddyTrigger } from "@/components/layout/paddy-trigger";
import { TenantSwitcher } from "@/components/layout/tenant-switcher";
import { UserMenu } from "@/components/layout/user-menu";
import { PageHeader } from "@/components/shell/page-header";
import { MOCK_DATASET } from "@/lib/mock/seed";

export default async function HorseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const horse = MOCK_DATASET.horses.find((h) => h.id === id);
  return (
    <>
      <PageHeader
        breadcrumb={[
          { label: "Horses", href: "/horses" },
          { label: horse?.stableName ?? "Not found" },
        ]}
        rightSlot={
          <>
            <TenantSwitcher />
            <PaddyTrigger />
            <UserMenu />
          </>
        }
      />
      <HorseProfile horseId={id} />
    </>
  );
}
