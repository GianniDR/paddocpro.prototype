import { DocumentsDashboard } from "@/components/documents/documents-dashboard";
import { DocumentsTabs } from "@/components/documents/documents-tabs";

export default function DocumentsPage() {
  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <DocumentsTabs />
      <DocumentsDashboard />
    </div>
  );
}
