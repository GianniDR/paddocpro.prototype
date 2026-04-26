"use client";

import type { ColDef, GridApi } from "ag-grid-community";
import { Plus } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { DetailSheet, useIdParam } from "@/components/shell/detail-sheet";
import { type ActionItem, FeatureActionsMenu } from "@/components/shell/feature-actions-menu";
import { FeatureGrid } from "@/components/shell/feature-grid";
import { FeatureToolbar } from "@/components/shell/feature-toolbar";
import { GenericDetail } from "@/components/shell/generic-detail";
import { GridFilterButton } from "@/components/shell/grid-filter-button";
import { GridRefreshButton } from "@/components/shell/grid-refresh-button";
import { StatusBadge } from "@/components/shell/status-badge";
import { type StatusChip, StatusChipRow } from "@/components/shell/status-chip-row";
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
  const [search, setSearch] = useState("");
  const [active, setActive] = useState<Set<string>>(new Set());

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

  const counts = useMemo(
    () => ({
      vaccination: rows.filter((r) => r.kind === "vaccination").length,
      worming: rows.filter((r) => r.kind === "worming").length,
      farrier: rows.filter((r) => r.kind === "farrier").length,
      dental: rows.filter((r) => r.kind === "dental").length,
      overdue: rows.filter((r) => r.status === "overdue").length,
    }),
    [rows],
  );

  const chips: StatusChip[] = [
    { slug: "vaccination", label: "Vaccination", count: counts.vaccination },
    { slug: "worming", label: "Worming", count: counts.worming },
    { slug: "farrier", label: "Farrier", count: counts.farrier },
    { slug: "dental", label: "Dental", count: counts.dental },
    { slug: "overdue", label: "Overdue", count: counts.overdue },
  ];

  const filtered = useMemo(() => {
    if (active.size === 0) return rows;
    return rows.filter((r) => {
      if (active.has("vaccination") && r.kind === "vaccination") return true;
      if (active.has("worming") && r.kind === "worming") return true;
      if (active.has("farrier") && r.kind === "farrier") return true;
      if (active.has("dental") && r.kind === "dental") return true;
      if (active.has("overdue") && r.status === "overdue") return true;
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
      { field: "horseName", headerName: "Horse", width: 180 },
      {
        field: "kind",
        headerName: "Kind",
        width: 130,
        valueFormatter: (p) => (p.value ? String(p.value).replace("_", " ") : ""),
      },
      {
        field: "eventDate",
        headerName: "Event date",
        width: 130,
        valueFormatter: (p) => formatDate(p.value as string),
      },
      { field: "practitionerName", headerName: "Practitioner", width: 200 },
      { field: "productOrTreatment", headerName: "Product / treatment", width: 220 },
      {
        field: "nextDueDate",
        headerName: "Next due",
        width: 130,
        valueFormatter: (p) => formatDate(p.value as string | null),
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
  const [gridApi, setGridApi] = useState<GridApi<Row> | null>(null);

  const actions: ActionItem[] = [
    {
      label: "Log event",
      Icon: Plus,
      onClick: () => toast("Log event — coming soon"),
      testId: "health-grid-cta",
    },
    {
      label: "Export CSV",
      onClick: () => {
        gridApi?.exportDataAsCsv({ fileName: "health.csv" });
        toast.success("CSV exported");
      },
      testId: "health-grid-export",
    },
  ];

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <div className="px-4 pt-3 flex items-center gap-2">
        <FeatureToolbar
          search={search}
          onSearchChange={setSearch}
          placeholder="Search events, horses, practitioners…"
        >
          <GridRefreshButton api={gridApi} />
          <GridFilterButton api={gridApi} />
          <FeatureActionsMenu items={actions} />
        </FeatureToolbar>
      </div>

      <div className="px-4 pt-3 pb-0 flex flex-wrap" data-testid="health-grid-chip-row">
        <StatusChipRow chips={chips} active={active} onToggle={toggleChip} />
      </div>

      <div className="flex-1 px-4 pt-3 pb-3 overflow-hidden flex flex-col">
        <FeatureGrid
          testId="health-grid"
          rowData={filtered}
          columnDefs={columnDefs}
          defaultSortField="eventDate"
          defaultSortDirection="desc"
          onRowClick={(row) => setSelectedId(row.id)}
          quickFilterText={search}
          onApiReady={setGridApi}
        />
      </div>

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
