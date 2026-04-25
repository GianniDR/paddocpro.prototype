"use client";

import { Grid3x3, LayoutGrid } from "lucide-react";
import { useState } from "react";

import { HealthGrid } from "@/components/health/health-grid";
import { HealthHeatmap } from "@/components/health/health-heatmap";
import { Button } from "@/components/ui/button";

export function HealthShell() {
  const [view, setView] = useState<"heatmap" | "list">("heatmap");
  return (
    <div className="flex flex-col flex-1 p-4 pb-12 gap-3" data-testid="health-shell">
      <div className="flex items-center gap-2">
        <Button
          variant={view === "heatmap" ? "default" : "outline"}
          size="sm"
          onClick={() => setView("heatmap")}
          data-testid="health-view-heatmap"
        >
          <LayoutGrid className="h-3.5 w-3.5" /> Heatmap
        </Button>
        <Button
          variant={view === "list" ? "default" : "outline"}
          size="sm"
          onClick={() => setView("list")}
          data-testid="health-view-list"
        >
          <Grid3x3 className="h-3.5 w-3.5" /> All events
        </Button>
      </div>
      {view === "heatmap" ? <HealthHeatmap /> : <HealthGrid />}
    </div>
  );
}
