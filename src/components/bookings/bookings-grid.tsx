"use client";

import type { ColDef } from "ag-grid-community";
import { useMemo } from "react";

import { FeatureGrid } from "@/components/shell/feature-grid";
import { StatusBadge } from "@/components/shell/status-badge";
import { Button } from "@/components/ui/button";
import { useSession } from "@/lib/auth/current";
import { formatDateTime } from "@/lib/format";
import { useDataset } from "@/lib/mock/store";

interface Row {
  id: string;
  whenLabel: string;
  type: string;
  resource: string;
  horse: string;
  client: string;
  status: string;
  notes: string;
}

export function BookingsGrid() {
  const dataset = useDataset();
  const session = useSession();
  const tenantId = session?.tenantId ?? dataset.tenants[0]?.id;

  const rows: Row[] = useMemo(() => {
    if (!tenantId) return [];
    return dataset.bookings
      .filter((b) => b.tenantId === tenantId)
      .map((b): Row => {
        const r = dataset.resources.find((x) => x.id === b.resourceId);
        const horse = dataset.horses.find((h) => h.id === b.horseId);
        const client = dataset.clients.find((c) => c.id === b.clientId);
        const clientUser = dataset.users.find((u) => u.id === client?.userAccountId);
        return {
          id: b.id,
          whenLabel: formatDateTime(b.startAt),
          type: b.type,
          resource: r?.name ?? "—",
          horse: horse?.stableName ?? "—",
          client: clientUser ? `${clientUser.firstName} ${clientUser.lastName}` : "—",
          status: b.status,
          notes: b.notes ?? "",
        };
      });
  }, [dataset, tenantId]);

  const columnDefs: ColDef<Row>[] = useMemo(
    () => [
      { field: "whenLabel", headerName: "When", width: 200, pinned: "left" },
      {
        field: "type",
        headerName: "Type",
        width: 140,
        cellRenderer: (p: { value?: string }) => (p.value ? p.value.replace("_", " ") : ""),
      },
      { field: "resource", headerName: "Resource", width: 200 },
      { field: "horse", headerName: "Horse", width: 160 },
      { field: "client", headerName: "Client", width: 180 },
      {
        field: "status",
        headerName: "Status",
        width: 130,
        cellRenderer: (p: { value?: string }) => <StatusBadge status={p.value ?? "confirmed"} />,
      },
      { field: "notes", headerName: "Notes", width: 240 },
    ],
    [],
  );

  return (
    <div className="flex flex-col gap-3 p-4 pb-12 flex-1">
      <div className="flex justify-end">
        <Button size="sm" data-testid="bookings-grid-cta">+ New booking</Button>
      </div>
      <FeatureGrid
        testId="bookings-grid"
        rowData={rows}
        columnDefs={columnDefs}
        defaultSortField="whenLabel"
      />
    </div>
  );
}
