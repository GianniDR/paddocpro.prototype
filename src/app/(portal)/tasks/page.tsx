import { TasksDashboard } from "@/components/tasks/tasks-dashboard";
import { TasksTabs } from "@/components/tasks/tasks-tabs";

export default function TasksPage() {
  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <TasksTabs />
      <TasksDashboard />
    </div>
  );
}
