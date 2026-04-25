import { ClientsDashboard } from "@/components/clients/clients-dashboard";
import { ClientsTabs } from "@/components/clients/clients-tabs";

export default function ClientsPage() {
  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <ClientsTabs />
      <ClientsDashboard />
    </div>
  );
}
