import { ClientsGrid } from "@/components/clients/clients-grid";
import { ClientsTabs } from "@/components/clients/clients-tabs";

export default function ClientsGridPage() {
  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <ClientsTabs />
      <ClientsGrid />
    </div>
  );
}
