"use client";

import type { GridApi } from "ag-grid-community";
import { SlidersHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";

interface Props<T> {
  api: GridApi<T> | null;
  testId?: string;
}

export function GridFilterButton<T>({ api, testId }: Props<T>) {
  return (
    <Button
      size="sm"
      variant="outline"
      className="h-8 gap-1.5 px-2.5 bg-white border-[#202228] text-[#202228] hover:bg-[#f2f5f8]"
      data-testid={testId ?? "grid-filter-button"}
      onClick={() => {
        if (!api) return;
        const opened = api.getOpenedToolPanel();
        if (opened === "filters") api.closeToolPanel();
        else api.openToolPanel("filters");
      }}
    >
      <SlidersHorizontal size={14} />
      Filters
    </Button>
  );
}
