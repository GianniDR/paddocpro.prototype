"use client";

import type { ColDef } from "ag-grid-community";
import { useMemo } from "react";

import { FeatureGrid } from "@/components/shell/feature-grid";
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

  return (
    <div className="flex flex-col gap-3 p-4 pb-12 flex-1">
      <FeatureGrid testId="health-grid" rowData={rows} columnDefs={columnDefs} defaultSortField="eventDate" defaultSortDirection="desc" />
    </div>
  );
}
