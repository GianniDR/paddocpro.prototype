"use client";

import type { ColDef } from "ag-grid-community";
import { useMemo } from "react";

import { DetailSheet, useIdParam } from "@/components/shell/detail-sheet";
import { FeatureGrid } from "@/components/shell/feature-grid";
import { GenericDetail } from "@/components/shell/generic-detail";
import { StatusBadge } from "@/components/shell/status-badge";
import { Button } from "@/components/ui/button";
import { useSession } from "@/lib/auth/current";
import { formatDateTime } from "@/lib/format";
import { useDataset } from "@/lib/mock/store";

interface Row {
  id: string;
  visitorName: string;
  visitorType: string;
  purpose: string;
  vehicleReg: string;
  arrivedAt: string;
  departedAt: string | null;
  onSite: string;
}

export function VisitorsGrid() {
  const dataset = useDataset();
  const session = useSession();
  const tenantId = session?.tenantId ?? dataset.tenants[0]?.id;
  const [selectedId, setSelectedId] = useIdParam();

  const rows: Row[] = useMemo(() => {
    if (!tenantId) return [];
    return dataset.visitors
      .filter((v) => v.tenantId === tenantId)
      .map((v): Row => ({
        id: v.id,
        visitorName: v.visitorName,
        visitorType: v.visitorType,
        purpose: v.purpose,
        vehicleReg: v.vehicleReg ?? "—",
        arrivedAt: v.arrivedAt,
        departedAt: v.departedAt,
        onSite: v.departedAt ? "completed" : "active",
      }));
  }, [dataset, tenantId]);

  const columnDefs: ColDef<Row>[] = useMemo(
    () => [
      { field: "visitorName", headerName: "Visitor", width: 220, pinned: "left" },
      { field: "visitorType", headerName: "Type", width: 130 },
      { field: "purpose", headerName: "Purpose", width: 240 },
      { field: "vehicleReg", headerName: "Vehicle", width: 130 },
      {
        field: "arrivedAt",
        headerName: "Arrived",
        width: 180,
        cellRenderer: (p: { value?: string }) => formatDateTime(p.value),
      },
      {
        field: "onSite",
        headerName: "Status",
        width: 130,
        cellRenderer: (p: { value?: string }) => <StatusBadge status={p.value ?? "active"} />,
      },
    ],
    [],
  );

  const sel = dataset.visitors.find((v) => v.id === selectedId);

  return (
    <div className="flex flex-col gap-3 p-4 pb-12 flex-1">
      <div className="flex gap-2 justify-end">
        <Button size="sm" variant="outline" data-testid="visitors-grid-fire">Fire roll-call</Button>
        <Button size="sm" data-testid="visitors-grid-cta">+ Sign in visitor</Button>
      </div>
      <FeatureGrid
        testId="visitors-grid"
        rowData={rows}
        columnDefs={columnDefs}
        defaultSortField="arrivedAt"
        defaultSortDirection="desc"
        onRowClick={(r) => setSelectedId(r.id)}
      />
      <DetailSheet
        open={!!sel}
        onClose={() => setSelectedId(null)}
        title={sel?.visitorName ?? "Visitor"}
        subtitle={sel?.purpose}
        testId="visitor-sheet"
      >
        {sel && (
          <GenericDetail
            sections={[
              {
                fields: [
                  { label: "Type", value: sel.visitorType },
                  { label: "Purpose", value: sel.purpose },
                  { label: "Vehicle reg", value: sel.vehicleReg ?? "—" },
                  { label: "Arrived", value: formatDateTime(sel.arrivedAt) },
                  { label: "Departed", value: sel.departedAt ? formatDateTime(sel.departedAt) : "Still on site" },
                  { label: "Induction", value: sel.inductionStatus ?? "—" },
                ],
              },
            ]}
          />
        )}
      </DetailSheet>
    </div>
  );
}
