"use client";

import type { ColDef, GridApi } from "ag-grid-community";
import { LogIn } from "lucide-react";
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
import { SignInVisitorDialog } from "@/components/visitors/sign-in-dialog";
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
  const [search, setSearch] = useState("");
  const [active, setActive] = useState<Set<string>>(new Set());

  const rows: Row[] = useMemo(() => {
    if (!tenantId) return [];
    return dataset.visitors
      .filter((v) => v.tenantId === tenantId)
      .map(
        (v): Row => ({
          id: v.id,
          visitorName: v.visitorName,
          visitorType: v.visitorType,
          purpose: v.purpose,
          vehicleReg: v.vehicleReg ?? "—",
          arrivedAt: v.arrivedAt,
          departedAt: v.departedAt,
          onSite: v.departedAt ? "completed" : "active",
        }),
      );
  }, [dataset, tenantId]);

  const counts = useMemo(
    () => ({
      active: rows.filter((r) => r.onSite === "active").length,
      contractor: rows.filter((r) => r.visitorType === "contractor").length,
      vet: rows.filter((r) => r.visitorType === "vet").length,
      farrier: rows.filter((r) => r.visitorType === "farrier").length,
      supplier: rows.filter((r) => r.visitorType === "supplier").length,
    }),
    [rows],
  );

  const chips: StatusChip[] = [
    { slug: "active", label: "On site", count: counts.active },
    { slug: "vet", label: "Vet", count: counts.vet },
    { slug: "farrier", label: "Farrier", count: counts.farrier },
    { slug: "contractor", label: "Contractor", count: counts.contractor },
    { slug: "supplier", label: "Supplier", count: counts.supplier },
  ];

  const filtered = useMemo(() => {
    if (active.size === 0) return rows;
    return rows.filter((r) => {
      if (active.has("active") && r.onSite === "active") return true;
      if (active.has(r.visitorType)) return true;
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
      { field: "visitorName", headerName: "Visitor", width: 220 },
      {
        field: "visitorType",
        headerName: "Type",
        width: 130,
        valueFormatter: (p) => (p.value ? String(p.value).replace("_", " ") : ""),
      },
      { field: "purpose", headerName: "Purpose", width: 240 },
      { field: "vehicleReg", headerName: "Vehicle", width: 130 },
      {
        field: "arrivedAt",
        headerName: "Arrived",
        width: 180,
        valueFormatter: (p) => formatDateTime(p.value as string),
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
  const [gridApi, setGridApi] = useState<GridApi<Row> | null>(null);

  const actions: ActionItem[] = [
    {
      label: "Sign in visitor",
      Icon: LogIn,
      onClick: () => toast("Sign in visitor — coming soon"),
      testId: "visitors-signin-trigger",
    },
    {
      label: "Export CSV",
      onClick: () => {
        gridApi?.exportDataAsCsv({ fileName: "visitors.csv" });
        toast.success("CSV exported");
      },
      testId: "visitors-grid-export",
    },
  ];

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <div className="px-4 pt-3 flex items-center gap-2">
        <FeatureToolbar
          search={search}
          onSearchChange={setSearch}
          placeholder="Search visitors, purpose, vehicle…"
        >
          <GridRefreshButton api={gridApi} />
          <GridFilterButton api={gridApi} />
          <FeatureActionsMenu items={actions} />
        </FeatureToolbar>
      </div>

      <div className="px-4 pt-3 pb-0 flex flex-wrap" data-testid="visitors-grid-chip-row">
        <StatusChipRow chips={chips} active={active} onToggle={toggleChip} />
      </div>

      <div className="flex-1 px-4 pt-3 pb-3 overflow-hidden flex flex-col">
        <FeatureGrid
          testId="visitors-grid"
          rowData={filtered}
          columnDefs={columnDefs}
          quickFilterText={search}
          defaultSortField="arrivedAt"
          defaultSortDirection="desc"
          onRowClick={(r) => setSelectedId(r.id)}
          onApiReady={setGridApi}
        />
      </div>

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
                  {
                    label: "Departed",
                    value: sel.departedAt ? formatDateTime(sel.departedAt) : "Still on site",
                  },
                  { label: "Induction", value: sel.inductionStatus ?? "—" },
                ],
              },
            ]}
          />
        )}
      </DetailSheet>

      <SignInVisitorDialog />
    </div>
  );
}
