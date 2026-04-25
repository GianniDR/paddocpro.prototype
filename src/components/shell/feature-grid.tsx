"use client";

import "ag-grid-community/styles/ag-theme-quartz.css";

import {
  AllCommunityModule,
  type ColDef,
  type GridApi,
  type GridReadyEvent,
  ModuleRegistry,
  type RowClickedEvent,
  type SelectionChangedEvent,
} from "ag-grid-community";
import { AgGridReact } from "ag-grid-react";
import { useCallback, useMemo, useRef } from "react";

import { paddocproTheme } from "@/lib/ag-grid-theme";
import { cn } from "@/lib/utils";

ModuleRegistry.registerModules([AllCommunityModule]);

interface FeatureGridProps<T extends { id: string }> {
  testId: string;
  rowData: T[];
  columnDefs: ColDef<T>[];
  onRowClick?: (row: T) => void;
  onSelectionChanged?: (rows: T[]) => void;
  quickFilterText?: string;
  defaultSortField?: keyof T;
  defaultSortDirection?: "asc" | "desc";
  emptyState?: React.ReactNode;
  className?: string;
  rowHeight?: number;
  groupBy?: string;
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
  groupBy,
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

  const handleRowClicked = useCallback(
    (e: RowClickedEvent<T>) => {
      // Ignore clicks on the checkbox-only column.
      if (e.event && (e.event.target as HTMLElement)?.closest('[col-id="__select"]')) return;
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

  const fullColDefs = useMemo<ColDef<T>[]>(() => {
    return [
      {
        colId: "__select",
        headerName: "",
        width: 44,
        pinned: "left",
        checkboxSelection: true,
        headerCheckboxSelection: true,
        sortable: false,
        filter: false,
        resizable: false,
      },
      ...columnDefs.map((c) => ({ ...c, sortable: c.sortable ?? true, filter: c.filter ?? "agTextColumnFilter" })),
    ];
  }, [columnDefs]);

  const isEmpty = rowData.length === 0;

  return (
    <div className={cn("flex-1 min-h-[400px] flex flex-col", className)} data-testid={testId}>
      {isEmpty && emptyState ? (
        <div className="flex-1 flex items-center justify-center" data-testid={`${testId}-empty`}>
          {emptyState}
        </div>
      ) : (
        <div className="flex-1 min-h-[400px]">
          <AgGridReact<T>
            theme={paddocproTheme}
            rowData={rowData}
            columnDefs={fullColDefs}
            quickFilterText={quickFilterText}
            onGridReady={onGridReady}
            onRowClicked={handleRowClicked}
            onSelectionChanged={handleSelectionChanged}
            rowSelection={{ mode: "multiRow", checkboxes: true, enableClickSelection: false }}
            suppressMovableColumns={false}
            suppressCellFocus
            rowHeight={rowHeight}
            headerHeight={40}
            getRowId={(p) => p.data.id}
            domLayout="normal"
            rowGroupPanelShow={groupBy ? "always" : "never"}
            animateRows
            // Add per-row testid via DOM attribute through a custom row class
            getRowClass={() => "feature-grid-row cursor-pointer"}
          />
        </div>
      )}
    </div>
  );
}
