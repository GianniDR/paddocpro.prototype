"use client";

import type { ColDef } from "ag-grid-community";
import { useMemo } from "react";

import { SignaturePadDialog } from "@/components/documents/signature-pad";
import { UploadDocumentDialog } from "@/components/documents/upload-dialog";
import { DetailSheet, useIdParam } from "@/components/shell/detail-sheet";
import { FeatureGrid } from "@/components/shell/feature-grid";
import { GenericDetail } from "@/components/shell/generic-detail";
import { StatusBadge } from "@/components/shell/status-badge";
import { useSession } from "@/lib/auth/current";
import { formatDate } from "@/lib/format";
import { now } from "@/lib/mock/clock";
import { useDataset } from "@/lib/mock/store";

interface Row {
  id: string;
  title: string;
  category: string;
  entityType: string;
  entityName: string;
  fileSize: string;
  expiryStatus: string;
  expiryDate: string | null;
  uploadedAt: string;
}

function expiryStatus(date: string | null): string {
  if (!date) return "current";
  const tenantNow = now().getTime();
  const exp = Date.parse(date);
  if (exp < tenantNow) return "expired";
  if (exp - tenantNow < 30 * 86_400_000) return "due_30d";
  return "current";
}

export function DocumentsGrid() {
  const dataset = useDataset();
  const session = useSession();
  const tenantId = session?.tenantId ?? dataset.tenants[0]?.id;
  const [selectedId, setSelectedId] = useIdParam();

  const rows: Row[] = useMemo(() => {
    if (!tenantId) return [];
    return dataset.documents
      .filter((d) => d.tenantId === tenantId)
      .map((d): Row => {
        let entityName = "—";
        if (d.entityType === "horse") {
          const h = dataset.horses.find((x) => x.id === d.entityId);
          entityName = h?.stableName ?? "—";
        } else if (d.entityType === "client") {
          const c = dataset.clients.find((x) => x.id === d.entityId);
          const u = dataset.users.find((u) => u.id === c?.userAccountId);
          entityName = u ? `${u.firstName} ${u.lastName}` : "—";
        }
        return {
          id: d.id,
          title: d.title,
          category: d.category.replace("_", " "),
          entityType: d.entityType,
          entityName,
          fileSize: `${(d.fileSizeBytes / 1024).toFixed(0)} KB`,
          expiryStatus: expiryStatus(d.expiryDate),
          expiryDate: d.expiryDate,
          uploadedAt: d.createdAt,
        };
      });
  }, [dataset, tenantId]);

  const columnDefs: ColDef<Row>[] = useMemo(
    () => [
      { field: "title", headerName: "Title", width: 280, pinned: "left" },
      { field: "category", headerName: "Category", width: 160 },
      { field: "entityName", headerName: "Linked to", width: 180 },
      { field: "fileSize", headerName: "Size", width: 100 },
      {
        field: "expiryDate",
        headerName: "Expiry",
        width: 130,
        cellRenderer: (p: { value?: string | null }) => formatDate(p.value),
      },
      {
        field: "expiryStatus",
        headerName: "Status",
        width: 130,
        cellRenderer: (p: { value?: string }) => <StatusBadge status={p.value ?? "current"} />,
      },
    ],
    [],
  );

  const sel = dataset.documents.find((d) => d.id === selectedId);

  return (
    <div className="flex flex-col gap-3 p-4 pb-12 flex-1">
      <div className="flex justify-end gap-2">
        <SignaturePadDialog />
        <UploadDocumentDialog />
      </div>
      <FeatureGrid
        testId="documents-grid"
        rowData={rows}
        columnDefs={columnDefs}
        defaultSortField="uploadedAt"
        defaultSortDirection="desc"
        onRowClick={(r) => setSelectedId(r.id)}
      />
      <DetailSheet
        open={!!sel}
        onClose={() => setSelectedId(null)}
        title={sel?.title ?? "Document"}
        subtitle={sel?.category.replace("_", " ")}
        testId="document-sheet"
      >
        {sel && (
          <GenericDetail
            sections={[
              {
                fields: [
                  { label: "Title", value: sel.title },
                  { label: "Category", value: sel.category.replace("_", " ") },
                  { label: "File", value: sel.fileName },
                  { label: "Size", value: `${(sel.fileSizeBytes / 1024).toFixed(0)} KB` },
                  { label: "Type", value: sel.mimeType },
                  { label: "Version", value: `v${sel.version}` },
                  { label: "Expiry", value: formatDate(sel.expiryDate) },
                  { label: "Linked to", value: `${sel.entityType} · ${sel.entityId.slice(0, 16)}…` },
                ],
              },
            ]}
          />
        )}
      </DetailSheet>
    </div>
  );
}
