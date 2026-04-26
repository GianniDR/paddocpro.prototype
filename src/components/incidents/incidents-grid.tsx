"use client";

import type { ColDef } from "ag-grid-community";
import { Plus } from "lucide-react";
import { useMemo, useState } from "react";

import { IncidentWorkflowStepper } from "@/components/incidents/incident-workflow";
import { DetailSheet, useIdParam } from "@/components/shell/detail-sheet";
import { FeatureGrid } from "@/components/shell/feature-grid";
import { FeatureToolbar } from "@/components/shell/feature-toolbar";
import { GenericDetail } from "@/components/shell/generic-detail";
import { StatusBadge } from "@/components/shell/status-badge";
import { type StatusChip, StatusChipRow } from "@/components/shell/status-chip-row";
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
  location: string;
}

export function IncidentsGrid() {
  const dataset = useDataset();
  const session = useSession();
  const tenantId = session?.tenantId ?? dataset.tenants[0]?.id;
  const [selectedId, setSelectedId] = useIdParam();
  const [search, setSearch] = useState("");
  const [active, setActive] = useState<Set<string>>(new Set());

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
          location: i.location,
        };
      });
  }, [dataset, tenantId]);

  const counts = useMemo(
    () => ({
      critical: rows.filter((r) => r.severity === "critical").length,
      serious: rows.filter((r) => r.severity === "serious").length,
      open: rows.filter((r) => r.workflowState !== "closed").length,
      closed: rows.filter((r) => r.workflowState === "closed").length,
    }),
    [rows],
  );

  const chips: StatusChip[] = [
    { slug: "open", label: "Open", count: counts.open },
    { slug: "critical", label: "Critical", count: counts.critical },
    { slug: "serious", label: "Serious", count: counts.serious },
    { slug: "closed", label: "Closed", count: counts.closed },
  ];

  const filtered = useMemo(() => {
    if (active.size === 0) return rows;
    return rows.filter((r) => {
      if (active.has("open") && r.workflowState !== "closed") return true;
      if (active.has("critical") && r.severity === "critical") return true;
      if (active.has("serious") && r.severity === "serious") return true;
      if (active.has("closed") && r.workflowState === "closed") return true;
      return false;
    });
  }, [rows, active]);

  const toggleChip = (slug: string) => {
    setActive((prev) => {
      const next = new Set(prev);
      if (next.has(slug)) next.delete(slug);
      else next.add(slug);
      return next;
    });
  };

  const columnDefs: ColDef<Row>[] = useMemo(
    () => [
      {
        field: "severity",
        headerName: "Severity",
        width: 120,
        cellRenderer: (p: { value?: string }) => <StatusBadge status={p.value ?? "minor"} />,
      },
      { field: "type", headerName: "Type", width: 160 },
      { field: "summary", headerName: "Summary", width: 320 },
      { field: "linkedHorse", headerName: "Horse", width: 160 },
      { field: "location", headerName: "Location", width: 180 },
      {
        field: "occurredAt",
        headerName: "Occurred",
        width: 180,
        valueFormatter: (p) => formatDateTime(p.value as string),
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
    <div className="flex flex-1 flex-col overflow-hidden">
      <div className="px-4 pt-3 flex items-center gap-2">
        <FeatureToolbar
          search={search}
          onSearchChange={setSearch}
          placeholder="Search incidents, summaries, horses…"
        >
          <Button size="sm" data-testid="incidents-grid-cta">
            <Plus size={14} /> Log incident
          </Button>
        </FeatureToolbar>
      </div>

      <div className="px-4 pt-3 pb-0 flex flex-wrap" data-testid="incidents-grid-chip-row">
        <StatusChipRow chips={chips} active={active} onToggle={toggleChip} />
      </div>

      <div className="flex-1 px-4 pt-3 pb-3 overflow-hidden flex flex-col">
        <FeatureGrid
          testId="incidents-grid"
          rowData={filtered}
          columnDefs={columnDefs}
          quickFilterText={search}
          defaultSortField="occurredAt"
          defaultSortDirection="desc"
          onRowClick={(r) => setSelectedId(r.id)}
        />
      </div>

      <DetailSheet
        open={!!sel}
        onClose={() => setSelectedId(null)}
        title={sel?.summary ?? "Incident"}
        subtitle={sel ? formatDateTime(sel.occurredAt) : ""}
        testId="incident-sheet"
      >
        {sel && (
          <div className="space-y-4 max-w-3xl">
            <IncidentWorkflowStepper incidentId={sel.id} />
          </div>
        )}
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
                ? [
                    {
                      label: `Open ${horse.stableName}`,
                      href: `/horses/${horse.id}`,
                      testId: `drill-horse-${horse.id}`,
                    },
                  ]
                : []
            }
          />
        )}
      </DetailSheet>
    </div>
  );
}
