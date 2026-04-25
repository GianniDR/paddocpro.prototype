"use client";

import type { ColDef } from "ag-grid-community";
import { useMemo } from "react";

import { DetailSheet, useIdParam } from "@/components/shell/detail-sheet";
import { FeatureGrid } from "@/components/shell/feature-grid";
import { GenericDetail } from "@/components/shell/generic-detail";
import { StatusBadge } from "@/components/shell/status-badge";
import { useSession } from "@/lib/auth/current";
import { formatDate } from "@/lib/format";
import { useDataset } from "@/lib/mock/store";

interface Row {
  id: string;
  horseName: string;
  kind: string;
  eventDate: string;
  practitionerName: string;
  productOrTreatment: string;
  nextDueDate: string | null;
  status: string;
}

export function HealthGrid() {
  const dataset = useDataset();
  const session = useSession();
  const tenantId = session?.tenantId ?? dataset.tenants[0]?.id;
  const [selectedId, setSelectedId] = useIdParam();

  const rows: Row[] = useMemo(() => {
    if (!tenantId) return [];
    return dataset.healthEvents
      .filter((e) => e.tenantId === tenantId)
      .map((e): Row => {
        const horse = dataset.horses.find((h) => h.id === e.horseId);
        return {
          id: e.id,
          horseName: horse?.stableName ?? "—",
          kind: e.kind,
          eventDate: e.eventDate,
          practitionerName: e.practitionerName,
          productOrTreatment: e.productOrTreatment ?? "—",
          nextDueDate: e.nextDueDate,
          status: e.status,
        };
      });
  }, [dataset, tenantId]);

  const columnDefs: ColDef<Row>[] = useMemo(
    () => [
      { field: "horseName", headerName: "Horse", width: 180, pinned: "left" },
      {
        field: "kind",
        headerName: "Kind",
        width: 130,
        cellRenderer: (p: { value?: string }) => (p.value ? p.value.replace("_", " ") : ""),
      },
      {
        field: "eventDate",
        headerName: "Event date",
        width: 130,
        cellRenderer: (p: { value?: string }) => formatDate(p.value),
      },
      { field: "practitionerName", headerName: "Practitioner", width: 200 },
      { field: "productOrTreatment", headerName: "Product / treatment", width: 220 },
      {
        field: "nextDueDate",
        headerName: "Next due",
        width: 130,
        cellRenderer: (p: { value?: string | null }) => formatDate(p.value),
      },
      {
        field: "status",
        headerName: "Status",
        width: 130,
        cellRenderer: (p: { value?: string }) => <StatusBadge status={p.value ?? "completed"} />,
      },
    ],
    [],
  );

  const sel = dataset.healthEvents.find((e) => e.id === selectedId);
  const horse = sel ? dataset.horses.find((h) => h.id === sel.horseId) : null;

  return (
    <div className="flex flex-col gap-3 p-4 pb-12 flex-1">
      <FeatureGrid
        testId="health-grid"
        rowData={rows}
        columnDefs={columnDefs}
        defaultSortField="eventDate"
        defaultSortDirection="desc"
        onRowClick={(row) => setSelectedId(row.id)}
      />
      <DetailSheet
        open={!!sel}
        onClose={() => setSelectedId(null)}
        title={sel ? `${sel.kind.replace("_", " ")} — ${horse?.stableName ?? ""}` : "Event"}
        subtitle={sel ? formatDate(sel.eventDate) : ""}
        testId="health-sheet"
      >
        {sel && (
          <GenericDetail
            sections={[
              {
                fields: [
                  { label: "Kind", value: sel.kind.replace("_", " ") },
                  { label: "Status", value: <StatusBadge status={sel.status} /> },
                  { label: "Event date", value: formatDate(sel.eventDate) },
                  { label: "Next due", value: formatDate(sel.nextDueDate) },
                  { label: "Practitioner", value: sel.practitionerName },
                  { label: "Practitioner kind", value: sel.practitionerKind.replace("_", " ") },
                  { label: "Product / treatment", value: sel.productOrTreatment ?? "—" },
                  { label: "Dose", value: sel.dose ?? "—" },
                  { label: "Batch", value: sel.batchNumber ?? "—" },
                  { label: "Withdrawal days", value: sel.withdrawalDays?.toString() ?? "—" },
                  { label: "Notes", value: sel.notes ?? "—" },
                ],
              },
            ]}
            drillLinks={
              horse
                ? [{ label: `Open ${horse.stableName}`, href: `/horses/${horse.id}`, testId: `drill-horse-${horse.id}` }]
                : []
            }
          />
        )}
      </DetailSheet>
    </div>
  );
}
