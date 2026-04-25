import { CommunicationTabs } from "@/components/communication/communication-tabs";
import { ThreadsGrid } from "@/components/communication/threads-grid";

export default function AllThreadsPage() {
  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <CommunicationTabs />
      <ThreadsGrid />
    </div>
  );
}
