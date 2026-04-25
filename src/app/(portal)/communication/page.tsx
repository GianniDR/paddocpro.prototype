import { CommunicationDashboard } from "@/components/communication/communication-dashboard";
import { CommunicationTabs } from "@/components/communication/communication-tabs";

export default function CommunicationPage() {
  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <CommunicationTabs />
      <CommunicationDashboard />
    </div>
  );
}
