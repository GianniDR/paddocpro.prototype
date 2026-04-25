"use client";

import type { ColDef } from "ag-grid-community";
import { Plus } from "lucide-react";
import { useMemo, useState } from "react";

import { DetailSheet, useIdParam } from "@/components/shell/detail-sheet";
import { FeatureGrid } from "@/components/shell/feature-grid";
import { FeatureToolbar } from "@/components/shell/feature-toolbar";
import { GenericDetail } from "@/components/shell/generic-detail";
import { StatusBadge } from "@/components/shell/status-badge";
import { type StatusChip, StatusChipRow } from "@/components/shell/status-chip-row";
import { Button } from "@/components/ui/button";
import { useSession } from "@/lib/auth/current";
import { formatGbp } from "@/lib/format";
import { useDataset } from "@/lib/mock/store";

interface Row {
  id: string;
  name: string;
  category: string;
  unit: string;
  currentStock: number;
  threshold: number;
  status: string;
  unitCostPence: number;
  preferredSupplier: string;
}

export function FeedGrid() {
  const dataset = useDataset();
  const session = useSession();
  const tenantId = session?.tenantId ?? dataset.tenants[0]?.id;
  const [selectedId, setSelectedId] = useIdParam();
  const [search, setSearch] = useState("");
  const [active, setActive] = useState<Set<string>>(new Set(["all"]));

  const rows: Row[] = useMemo(() => {
    if (!tenantId) return [];
    return dataset.inventory
      .filter((i) => i.tenantId === tenantId)
      .map((i): Row => {
        const supp = dataset.suppliers.find((s) => s.id === i.preferredSupplierId);
        let status = "healthy";
        if (i.currentStock <= 0) status = "out_of_stock";
        else if (i.currentStock <= i.lowStockThreshold) status = "low_stock";
        return {
          id: i.id,
          name: i.name,
          category: i.category,
          unit: i.unit,
          currentStock: i.currentStock,
          threshold: i.lowStockThreshold,
          status,
          unitCostPence: i.unitCostPence,
          preferredSupplier: supp?.name ?? "—",
        };
      });
  }, [dataset, tenantId]);

  const counts = useMemo(
    () => ({
      all: rows.length,
      low_stock: rows.filter((r) => r.status === "low_stock").length,
      out_of_stock: rows.filter((r) => r.status === "out_of_stock").length,
      feed: rows.filter((r) => r.category === "feed").length,
      hay: rows.filter((r) => r.category === "hay" || r.category === "haylage").length,
      bedding: rows.filter((r) => r.category === "bedding").length,
    }),
    [rows],
  );

  const chips: StatusChip[] = [
    { slug: "all", label: "All", count: counts.all },
    { slug: "low_stock", label: "Low stock", count: counts.low_stock },
    { slug: "out_of_stock", label: "Out of stock", count: counts.out_of_stock },
    { slug: "feed", label: "Feed", count: counts.feed },
    { slug: "hay", label: "Hay/haylage", count: counts.hay },
    { slug: "bedding", label: "Bedding", count: counts.bedding },
  ];

  const filtered = useMemo(() => {
    if (active.has("all")) return rows;
    return rows.filter((r) => {
      if (active.has("low_stock") && r.status === "low_stock") return true;
      if (active.has("out_of_stock") && r.status === "out_of_stock") return true;
      if (active.has("feed") && r.category === "feed") return true;
      if (active.has("hay") && (r.category === "hay" || r.category === "haylage")) return true;
      if (active.has("bedding") && r.category === "bedding") return true;
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
      { field: "name", headerName: "Item", width: 260 },
      {
        field: "category",
        headerName: "Category",
        width: 130,
        valueFormatter: (p) =>
          p.value ? String(p.value).charAt(0).toUpperCase() + String(p.value).slice(1) : "",
      },
      { field: "currentStock", headerName: "Stock", width: 100 },
      { field: "unit", headerName: "Unit", width: 90 },
      { field: "threshold", headerName: "Threshold", width: 110 },
      {
        field: "status",
        headerName: "Status",
        width: 140,
        cellRenderer: (p: { value?: string }) => <StatusBadge status={p.value ?? "healthy"} />,
      },
      {
        field: "unitCostPence",
        headerName: "Unit cost",
        width: 120,
        valueFormatter: (p) => formatGbp(p.value as number),
      },
      { field: "preferredSupplier", headerName: "Preferred supplier", width: 220 },
    ],
    [],
  );

  const sel = dataset.inventory.find((i) => i.id === selectedId);
  const supp = sel ? dataset.suppliers.find((s) => s.id === sel.preferredSupplierId) : null;

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <div className="px-4 pt-3 flex items-center gap-2">
        <FeatureToolbar
          search={search}
          onSearchChange={setSearch}
          placeholder="Search items, categories, suppliers…"
        >
          <Button size="sm" data-testid="feed-supplies-grid-cta">
            <Plus size={14} /> Add item
          </Button>
        </FeatureToolbar>
      </div>

      <div className="px-4 pt-3 pb-0 flex flex-wrap" data-testid="feed-supplies-grid-chip-row">
        <StatusChipRow chips={chips} active={active} onToggle={toggleChip} />
      </div>

      <div className="flex-1 px-4 pt-3 pb-3 overflow-hidden flex flex-col">
        <FeatureGrid
          testId="feed-supplies-grid"
          rowData={filtered}
          columnDefs={columnDefs}
          defaultSortField="name"
          onRowClick={(r) => setSelectedId(r.id)}
          quickFilterText={search}
        />
      </div>

      <DetailSheet
        open={!!sel}
        onClose={() => setSelectedId(null)}
        title={sel?.name ?? "Item"}
        subtitle={sel?.category}
        testId="inventory-sheet"
      >
        {sel && (
          <GenericDetail
            sections={[
              {
                fields: [
                  { label: "Item", value: sel.name },
                  { label: "Category", value: sel.category },
                  { label: "Stock", value: `${sel.currentStock} ${sel.unit}` },
                  { label: "Low-stock threshold", value: `${sel.lowStockThreshold} ${sel.unit}` },
                  {
                    label: "Status",
                    value: (
                      <StatusBadge
                        status={
                          sel.currentStock <= 0
                            ? "out_of_stock"
                            : sel.currentStock <= sel.lowStockThreshold
                              ? "low_stock"
                              : "healthy"
                        }
                      />
                    ),
                  },
                  { label: "Unit cost", value: formatGbp(sel.unitCostPence) },
                  { label: "Preferred supplier", value: supp?.name ?? "—" },
                ],
              },
            ]}
          />
        )}
      </DetailSheet>
    </div>
  );
}
