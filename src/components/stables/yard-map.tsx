"use client";

import { useMemo } from "react";

import { useIdParam } from "@/components/shell/detail-sheet";
import { useSession } from "@/lib/auth/current";
import { useDataset } from "@/lib/mock/store";
import { cn } from "@/lib/utils";

const CELL_W = 80;
const CELL_H = 80;
const GAP = 8;
const PAD = 24;

export function YardMap() {
  const dataset = useDataset();
  const session = useSession();
  const tenantId = session?.tenantId ?? dataset.tenants[0]?.id;
  const [, setSelectedId] = useIdParam();

  const stables = useMemo(
    () => dataset.stables.filter((s) => s.tenantId === tenantId),
    [dataset.stables, tenantId],
  );

  const blocks = useMemo(() => {
    const map = new Map<string, typeof stables>();
    for (const s of stables) {
      if (!map.has(s.block)) map.set(s.block, []);
      map.get(s.block)!.push(s);
    }
    return Array.from(map.entries()).map(([block, items]) => ({
      block,
      items: items.sort((a, b) => a.number.localeCompare(b.number)),
    }));
  }, [stables]);

  const cols = 8;
  const rowsPerBlock = (n: number) => Math.ceil(n / cols);

  let yCursor = PAD;
  const rendered: { x: number; y: number; stable: (typeof stables)[number] }[] = [];
  const blockHeaders: { y: number; block: string; count: number }[] = [];
  blocks.forEach(({ block, items }) => {
    blockHeaders.push({ y: yCursor, block, count: items.length });
    yCursor += 28;
    items.forEach((s, i) => {
      const c = i % cols;
      const r = Math.floor(i / cols);
      rendered.push({
        x: PAD + c * (CELL_W + GAP),
        y: yCursor + r * (CELL_H + GAP),
        stable: s,
      });
    });
    yCursor += rowsPerBlock(items.length) * (CELL_H + GAP) + 16;
  });

  const totalWidth = PAD + cols * (CELL_W + GAP) + PAD;
  const totalHeight = yCursor + PAD;

  const occupied = stables.filter((s) => s.status === "occupied").length;
  const vacant = stables.filter((s) => s.status === "vacant").length;
  const maintenance = stables.filter((s) => s.status === "maintenance").length;

  return (
    <div className="flex flex-col gap-3 flex-1" data-testid="yard-map">
      <div className="flex flex-wrap items-center gap-3 text-sm">
        <span className="font-medium">Yard layout</span>
        <span className="inline-flex items-center gap-1 text-xs">
          <span className="inline-block w-3 h-3 rounded bg-emerald-500" /> Occupied ({occupied})
        </span>
        <span className="inline-flex items-center gap-1 text-xs">
          <span className="inline-block w-3 h-3 rounded bg-slate-300" /> Vacant ({vacant})
        </span>
        <span className="inline-flex items-center gap-1 text-xs">
          <span className="inline-block w-3 h-3 rounded bg-amber-200 border border-amber-400" /> Maintenance ({maintenance})
        </span>
      </div>
      <div className="border rounded-md bg-card p-2 overflow-auto">
        <svg
          width={totalWidth}
          height={totalHeight}
          viewBox={`0 0 ${totalWidth} ${totalHeight}`}
          className="block"
          role="img"
          aria-label="Yard floor plan"
        >
          {blockHeaders.map((b) => (
            <text
              key={b.block}
              x={PAD}
              y={b.y + 18}
              className="text-[12px] fill-muted-foreground font-medium"
              style={{ fontFamily: "var(--font-geist-sans)" }}
            >
              {b.block} · {b.count} stables
            </text>
          ))}
          {rendered.map(({ x, y, stable }) => {
            const horse = stable.currentHorseId
              ? dataset.horses.find((h) => h.id === stable.currentHorseId)
              : null;
            const fill =
              stable.status === "occupied"
                ? "fill-emerald-100 stroke-emerald-500"
                : stable.status === "maintenance"
                  ? "fill-amber-100 stroke-amber-500"
                  : "fill-slate-50 stroke-slate-300";
            return (
              <g
                key={stable.id}
                onClick={() => setSelectedId(stable.id)}
                style={{ cursor: "pointer" }}
                data-testid={`yard-map-stable-${stable.id}`}
                aria-label={`${stable.block} ${stable.number} — ${stable.status}${horse ? ` · ${horse.stableName}` : ""}`}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setSelectedId(stable.id);
                  }
                }}
                className="hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <rect
                  x={x}
                  y={y}
                  width={CELL_W}
                  height={CELL_H}
                  rx={6}
                  className={cn(fill, "transition")}
                  strokeWidth={1.5}
                />
                <text
                  x={x + CELL_W / 2}
                  y={y + 22}
                  textAnchor="middle"
                  className="text-[11px] fill-foreground font-medium"
                  style={{ fontFamily: "var(--font-geist-sans)" }}
                >
                  {stable.number}
                </text>
                {horse && (
                  <text
                    x={x + CELL_W / 2}
                    y={y + CELL_H - 12}
                    textAnchor="middle"
                    className="text-[10px] fill-emerald-900"
                    style={{ fontFamily: "var(--font-geist-sans)" }}
                  >
                    {horse.stableName}
                  </text>
                )}
                {stable.status === "maintenance" && (
                  <text
                    x={x + CELL_W / 2}
                    y={y + CELL_H / 2 + 4}
                    textAnchor="middle"
                    className="text-[9px] fill-amber-900 italic"
                    style={{ fontFamily: "var(--font-geist-sans)" }}
                  >
                    maintenance
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
