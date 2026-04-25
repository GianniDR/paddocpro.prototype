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
  severity: string;
  type: string;
  summary: string;
  occurredAt: string;
  workflowState: string;
  linkedHorse: string;
}

export function IncidentsGrid() {
  const dataset = useDataset();
  const session = useSession();
  const tenantId = session?.tenantId ?? dataset.tenants[0]?.id;
  const [selectedId, setSelectedId] = useIdParam();

  const rows: Row[] = useMemo(() => {
    if (!tenantId) return [];
    return dataset.incidents
      .filter((i) => i.tenantId === tenantId)
      .map((i): Row => {
        const horse = dataset.horses.find((h) => h.id === i.linkedHorseId);
        return {
          id: i.id,
          severity: i.severity,
          type: i.incidentType.replace("_", " "),
          summary: i.summary,
          occurredAt: i.occurredAt,
          workflowState: i.workflowState,
          linkedHorse: horse?.stableName ?? "—",
        };
      });
  }, [dataset, tenantId]);

  const columnDefs: ColDef<Row>[] = useMemo(
    () => [
      {
        field: "severity",
        headerName: "Severity",
        width: 120,
        pinned: "left",
        cellRenderer: (p: { value?: string }) => <StatusBadge status={p.value ?? "minor"} />,
      },
      { field: "type", headerName: "Type", width: 160 },
      { field: "summary", headerName: "Summary", width: 320 },
      { field: "linkedHorse", headerName: "Horse", width: 160 },
      {
        field: "occurredAt",
        headerName: "Occurred",
        width: 180,
        cellRenderer: (p: { value?: string }) => formatDateTime(p.value),
      },
      {
        field: "workflowState",
        headerName: "Workflow",
        width: 140,
        cellRenderer: (p: { value?: string }) => <StatusBadge status={p.value ?? "logged"} />,
      },
    ],
    [],
  );

  const sel = dataset.incidents.find((i) => i.id === selectedId);
  const horse = sel?.linkedHorseId ? dataset.horses.find((h) => h.id === sel.linkedHorseId) : null;

  return (
    <div className="flex flex-col gap-3 p-4 pb-12 flex-1">
      <div className="flex justify-end">
        <Button size="sm" data-testid="incidents-grid-cta">+ Log incident</Button>
      </div>
      <FeatureGrid
        testId="incidents-grid"
        rowData={rows}
        columnDefs={columnDefs}
        defaultSortField="occurredAt"
        defaultSortDirection="desc"
        onRowClick={(r) => setSelectedId(r.id)}
      />
      <DetailSheet
        open={!!sel}
        onClose={() => setSelectedId(null)}
        title={sel?.summary ?? "Incident"}
        subtitle={sel ? formatDateTime(sel.occurredAt) : ""}
        testId="incident-sheet"
      >
        {sel && (
          <GenericDetail
            sections={[
              {
                fields: [
                  { label: "Severity", value: <StatusBadge status={sel.severity} /> },
                  { label: "Type", value: sel.incidentType.replace("_", " ") },
                  { label: "Workflow", value: <StatusBadge status={sel.workflowState} /> },
                  { label: "Location", value: sel.location },
                  { label: "Occurred", value: formatDateTime(sel.occurredAt) },
                  { label: "Description", value: sel.description },
                  { label: "Resolution", value: sel.resolutionNotes ?? "—" },
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
