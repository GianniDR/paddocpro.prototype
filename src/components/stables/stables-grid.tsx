"use client";

import type { ColDef } from "ag-grid-community";
import { useMemo } from "react";

import { FeatureGrid } from "@/components/shell/feature-grid";
import { StatusBadge } from "@/components/shell/status-badge";
import { Button } from "@/components/ui/button";
import { useSession } from "@/lib/auth/current";
import { useDataset } from "@/lib/mock/store";

interface Row {
  id: string;
  number: string;
  block: string;
  status: string;
  designation: string;
  defaultBeddingType: string;
  dimensions: string;
  occupant: string;
  outOfServiceUntil: string | null;
}

export function StablesGrid() {
  const dataset = useDataset();
  const session = useSession();
  const tenantId = session?.tenantId ?? dataset.tenants[0]?.id;

  const rows: Row[] = useMemo(() => {
    if (!tenantId) return [];
    return dataset.stables
      .filter((s) => s.tenantId === tenantId)
      .map((s): Row => {
        const occ = dataset.horses.find((h) => h.id === s.currentHorseId);
        return {
          id: s.id,
          number: s.number,
          block: s.block,
          status: s.status,
          designation: s.designation,
          defaultBeddingType: s.defaultBeddingType,
          dimensions: s.dimensions,
          occupant: occ?.stableName ?? "—",
          outOfServiceUntil: s.outOfServiceUntil,
        };
      });
  }, [dataset, tenantId]);

  const columnDefs: ColDef<Row>[] = useMemo(
    () => [
      { field: "number", headerName: "Stable", width: 110, pinned: "left" },
      { field: "block", headerName: "Block", width: 140 },
      {
        field: "status",
        headerName: "Status",
        width: 130,
        cellRenderer: (p: { value?: string }) => <StatusBadge status={p.value ?? "vacant"} />,
      },
      { field: "occupant", headerName: "Currently housing", width: 180 },
      {
        field: "designation",
        headerName: "Designation",
        width: 140,
        cellRenderer: (p: { value?: string }) => <StatusBadge status={p.value ?? "standard"} />,
      },
      { field: "defaultBeddingType", headerName: "Bedding", width: 120 },
      { field: "dimensions", headerName: "Size", width: 130 },
    ],
    [],
  );

  return (
    <div className="flex flex-col gap-3 p-4 pb-12 flex-1">
      <div className="flex justify-end">
        <Button size="sm" data-testid="stables-grid-cta">+ Add stable</Button>
      </div>
      <FeatureGrid testId="stables-grid" rowData={rows} columnDefs={columnDefs} defaultSortField="block" />
    </div>
  );
}
