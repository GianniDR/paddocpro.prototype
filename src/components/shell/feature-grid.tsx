"use client";

import "ag-grid-community/styles/ag-theme-quartz.css";

import {
  AllCommunityModule,
  type CellClickedEvent,
  type ColDef,
  type GridApi,
  type GridReadyEvent,
  ModuleRegistry,
  type SelectionChangedEvent,
} from "ag-grid-community";
import { AllEnterpriseModule } from "ag-grid-enterprise";
import { AgGridReact } from "ag-grid-react";
import { useCallback, useMemo, useRef } from "react";

import { paddocproTheme } from "@/lib/ag-grid-theme";
import { cn } from "@/lib/utils";

ModuleRegistry.registerModules([AllCommunityModule, AllEnterpriseModule]);

interface FeatureGridProps<T extends { id: string }> {
  testId: string;
  rowData: T[];
  columnDefs: ColDef<T>[];
  onRowClick?: (row: T) => void;
  onSelectionChanged?: (rows: T[]) => void;
  quickFilterText?: string;
  defaultSortField?: keyof T | string;
  defaultSortDirection?: "asc" | "desc";
  emptyState?: React.ReactNode;
  className?: string;
  rowHeight?: number;
}

export function FeatureGrid<T extends { id: string }>({
  testId,
  rowData,
  columnDefs,
  onRowClick,
  onSelectionChanged,
  quickFilterText,
  defaultSortField,
  defaultSortDirection = "asc",
  emptyState,
  className,
  rowHeight = 44,
}: FeatureGridProps<T>) {
  const apiRef = useRef<GridApi<T> | null>(null);

  const onGridReady = useCallback(
    (e: GridReadyEvent<T>) => {
      apiRef.current = e.api;
      if (defaultSortField) {
        e.api.applyColumnState({
          state: [{ colId: String(defaultSortField), sort: defaultSortDirection }],
          defaultState: { sort: null },
        });
      }
    },
    [defaultSortField, defaultSortDirection],
  );

  const handleCellClicked = useCallback(
    (e: CellClickedEvent<T>) => {
      // Ignore clicks on AG Grid's auto-injected selection / row-group columns.
      const colId = e.colDef.colId ?? "";
      if (colId.startsWith("ag-Grid-AutoColumn") || colId === "ag-Grid-SelectionColumn") return;
      if (e.data && onRowClick) onRowClick(e.data);
    },
    [onRowClick],
  );

  const handleSelectionChanged = useCallback(
    (e: SelectionChangedEvent<T>) => {
      if (onSelectionChanged) onSelectionChanged(e.api.getSelectedRows());
    },
    [onSelectionChanged],
  );

  // rowSelection.checkboxes:true auto-injects the selection column; no manual __select needed.
  const fullColDefs = useMemo<ColDef<T>[]>(
    () =>
      columnDefs.map((c) => ({
        sortable: true,
        filter: "agTextColumnFilter" as const,
        enableRowGroup: true,
        ...c,
      })),
    [columnDefs],
  );

  const isEmpty = rowData.length === 0;

  return (
    <div className={cn("flex flex-1 min-h-0 flex-col", className)} data-testid={testId}>
      {isEmpty && emptyState ? (
        <div className="flex-1 flex items-center justify-center" data-testid={`${testId}-empty`}>
          {emptyState}
        </div>
      ) : (
        <AgGridReact<T>
          theme={paddocproTheme}
          rowData={rowData}
          columnDefs={fullColDefs}
          quickFilterText={quickFilterText}
          onGridReady={onGridReady}
          onCellClicked={handleCellClicked}
          onSelectionChanged={handleSelectionChanged}
          rowSelection={{ mode: "multiRow", checkboxes: true, enableClickSelection: false }}
          rowGroupPanelShow="always"
          sideBar={{
            toolPanels: ["columns", "filters"],
            defaultToolPanel: "",
          }}
          autoGroupColumnDef={{ headerName: "Group", minWidth: 200 }}
          pagination
          paginationPageSize={100}
          paginationPageSizeSelector={[25, 50, 100, 200]}
          rowHeight={rowHeight}
          headerHeight={40}
          getRowId={(p) => p.data.id}
          domLayout="normal"
          animateRows
          suppressCellFocus
          getRowClass={() => "cursor-pointer"}
        />
      )}
    </div>
  );
}
