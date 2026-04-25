"use client";

import { Grid3x3, Map } from "lucide-react";
import { useState } from "react";

import { StableSheetShell } from "@/components/stables/stable-sheet-shell";
import { StablesGrid } from "@/components/stables/stables-grid";
import { YardMap } from "@/components/stables/yard-map";
import { Button } from "@/components/ui/button";

export function StablesShell() {
  const [view, setView] = useState<"map" | "grid">("map");
  return (
    <div className="flex flex-col flex-1 p-4 pb-12 gap-3" data-testid="stables-shell">
      <div className="flex items-center gap-2">
        <Button
          variant={view === "map" ? "default" : "outline"}
          size="sm"
          onClick={() => setView("map")}
          data-testid="stables-view-map"
        >
          <Map className="h-3.5 w-3.5" /> Yard map
        </Button>
        <Button
          variant={view === "grid" ? "default" : "outline"}
          size="sm"
          onClick={() => setView("grid")}
          data-testid="stables-view-grid"
        >
          <Grid3x3 className="h-3.5 w-3.5" /> Grid
        </Button>
      </div>
      {view === "map" ? <YardMap /> : <StablesGrid />}
      <StableSheetShell />
    </div>
  );
}
