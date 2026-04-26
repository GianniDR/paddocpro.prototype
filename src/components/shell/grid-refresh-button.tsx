"use client";

import type { GridApi } from "ag-grid-community";
import { RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";

interface Props<T> {
  api: GridApi<T> | null;
  testId?: string;
}

export function GridRefreshButton<T>({ api, testId }: Props<T>) {
  return (
    <Button
      size="sm"
      variant="outline"
      className="size-8 p-0 bg-white border-[#202228] text-[#202228] hover:bg-[#f2f5f8]"
      data-testid={testId ?? "grid-refresh-button"}
      aria-label="Refresh grid"
      onClick={() => {
        api?.refreshClientSideRowModel("everything");
      }}
    >
      <RefreshCw size={14} />
    </Button>
  );
}
