import { PaddyTrigger } from "@/components/layout/paddy-trigger";
import { TenantSwitcher } from "@/components/layout/tenant-switcher";
import { UserMenu } from "@/components/layout/user-menu";
import { PageHeader } from "@/components/shell/page-header";
import { TasksGrid } from "@/components/tasks/tasks-grid";

export default function TasksPage() {
  return (
    <>
      <PageHeader
        breadcrumb={[{ label: "Tasks" }]}
        rightSlot={
          <>
            <TenantSwitcher />
            <PaddyTrigger />
            <UserMenu />
          </>
        }
      />
      <TasksGrid />
    </>
  );
}
