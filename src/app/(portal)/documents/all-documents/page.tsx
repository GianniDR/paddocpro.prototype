import { DocumentsGrid } from "@/components/documents/documents-grid";
import { DocumentsTabs } from "@/components/documents/documents-tabs";

export default function DocumentsAllPage() {
  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <DocumentsTabs />
      <DocumentsGrid />
    </div>
  );
}
