import { CommunicationTabs } from "@/components/communication/communication-tabs";
import { NotificationsGrid } from "@/components/communication/notifications-grid";

export default function NotificationsLogPage() {
  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <CommunicationTabs />
      <NotificationsGrid />
    </div>
  );
}
