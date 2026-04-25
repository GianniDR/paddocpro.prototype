"use client";

import type { ColDef } from "ag-grid-community";
import { useMemo } from "react";

import { DetailSheet, useIdParam } from "@/components/shell/detail-sheet";
import { FeatureGrid } from "@/components/shell/feature-grid";
import { GenericDetail } from "@/components/shell/generic-detail";
import { StatusBadge } from "@/components/shell/status-badge";
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

  const rows: Row[] = useMemo(() => {
    if (!tenantId) return [];
    return dataset.inventory
      .filter((i) => i.tenantId === tenantId)
      .map((i): Row => {
        const supp = dataset.suppliers.find((s) => s.id === i.preferredSupplierId);
        return {
          id: i.id,
          name: i.name,
          category: i.category,
          unit: i.unit,
          currentStock: i.currentStock,
          threshold: i.lowStockThreshold,
          status: i.currentStock <= i.lowStockThreshold ? "overdue" : "healthy",
          unitCostPence: i.unitCostPence,
          preferredSupplier: supp?.name ?? "—",
        };
      });
  }, [dataset, tenantId]);

  const columnDefs: ColDef<Row>[] = useMemo(
    () => [
      { field: "name", headerName: "Item", width: 260, pinned: "left" },
      { field: "category", headerName: "Category", width: 130 },
      { field: "currentStock", headerName: "Stock", width: 100 },
      { field: "unit", headerName: "Unit", width: 90 },
      { field: "threshold", headerName: "Threshold", width: 110 },
      {
        field: "status",
        headerName: "Status",
        width: 130,
        cellRenderer: (p: { value?: string }) => <StatusBadge status={p.value === "overdue" ? "overdue" : "healthy"} />,
      },
      {
        field: "unitCostPence",
        headerName: "Unit cost",
        width: 120,
        cellRenderer: (p: { value?: number }) => formatGbp(p.value ?? 0),
      },
      { field: "preferredSupplier", headerName: "Preferred supplier", width: 220 },
    ],
    [],
  );

  const sel = dataset.inventory.find((i) => i.id === selectedId);
  const supp = sel ? dataset.suppliers.find((s) => s.id === sel.preferredSupplierId) : null;

  return (
    <div className="flex flex-col gap-3 p-4 pb-12 flex-1">
      <div className="flex justify-end">
        <Button size="sm" data-testid="feed-supplies-grid-cta">+ Add item</Button>
      </div>
      <FeatureGrid
        testId="feed-supplies-grid"
        rowData={rows}
        columnDefs={columnDefs}
        defaultSortField="name"
        onRowClick={(r) => setSelectedId(r.id)}
      />
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
                    value: <StatusBadge status={sel.currentStock <= sel.lowStockThreshold ? "overdue" : "healthy"} />,
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
