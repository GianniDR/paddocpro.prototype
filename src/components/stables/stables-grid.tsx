"use client";

import type { ColDef } from "ag-grid-community";
import { Plus } from "lucide-react";
import { useMemo, useState } from "react";

import { useIdParam } from "@/components/shell/detail-sheet";
import { FeatureGrid } from "@/components/shell/feature-grid";
import { FeatureToolbar } from "@/components/shell/feature-toolbar";
import { StatusBadge } from "@/components/shell/status-badge";
import { type StatusChip, StatusChipRow } from "@/components/shell/status-chip-row";
import { StableSheetShell } from "@/components/stables/stable-sheet-shell";
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
  const [search, setSearch] = useState("");
  const [active, setActive] = useState<Set<string>>(new Set(["all"]));
  const [, setSelectedId] = useIdParam();

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

  const counts = useMemo(
    () => ({
      all: rows.length,
      occupied: rows.filter((r) => r.status === "occupied").length,
      vacant: rows.filter((r) => r.status === "vacant").length,
      maintenance: rows.filter((r) => r.status === "maintenance").length,
      isolation: rows.filter((r) => r.designation === "isolation").length,
    }),
    [rows],
  );

  const chips: StatusChip[] = [
    { slug: "all", label: "All", count: counts.all },
    { slug: "occupied", label: "Occupied", count: counts.occupied },
    { slug: "vacant", label: "Vacant", count: counts.vacant },
    { slug: "maintenance", label: "Maintenance", count: counts.maintenance },
    { slug: "isolation", label: "Isolation", count: counts.isolation },
  ];

  const filtered = useMemo(() => {
    if (active.has("all")) return rows;
    return rows.filter((r) => {
      if (active.has("occupied") && r.status === "occupied") return true;
      if (active.has("vacant") && r.status === "vacant") return true;
      if (active.has("maintenance") && r.status === "maintenance") return true;
      if (active.has("isolation") && r.designation === "isolation") return true;
      return false;
    });
  }, [rows, active]);

  const toggleChip = (slug: string) => {
    setActive((prev) => {
      const next = new Set(prev);
      if (slug === "all") return new Set(["all"]);
      next.delete("all");
      if (next.has(slug)) next.delete(slug);
      else next.add(slug);
      if (next.size === 0) next.add("all");
      return next;
    });
  };

  const columnDefs: ColDef<Row>[] = useMemo(
    () => [
      { field: "number", headerName: "Stable", width: 110 },
      { field: "block", headerName: "Block", width: 160 },
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
      { field: "defaultBeddingType", headerName: "Bedding", width: 130 },
      { field: "dimensions", headerName: "Size", width: 130 },
    ],
    [],
  );

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <div className="px-4 pt-3 flex items-center gap-2">
        <FeatureToolbar
          search={search}
          onSearchChange={setSearch}
          placeholder="Search stables, blocks, occupants…"
        >
          <Button size="sm" data-testid="stables-grid-cta">
            <Plus size={14} /> Add stable
          </Button>
        </FeatureToolbar>
      </div>

      <div className="px-4 pt-3 pb-0 flex flex-wrap" data-testid="stables-grid-chip-row">
        <StatusChipRow chips={chips} active={active} onToggle={toggleChip} />
      </div>

      <div className="flex-1 px-4 pt-3 pb-3 overflow-hidden flex flex-col">
        <FeatureGrid
          testId="stables-grid"
          rowData={filtered}
          columnDefs={columnDefs}
          quickFilterText={search}
          defaultSortField="block"
          onRowClick={(row) => setSelectedId(row.id)}
        />
      </div>

      <StableSheetShell />
    </div>
  );
}
