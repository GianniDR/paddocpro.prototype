import { TasksGrid } from "@/components/tasks/tasks-grid";
import { TasksTabs } from "@/components/tasks/tasks-tabs";

export default function TasksGridPage() {
  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <TasksTabs />
      <TasksGrid />
    </div>
  );
}
