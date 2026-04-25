"use client";

import type { LucideIcon } from "lucide-react";
import { Check, ChevronDown } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { type ChipRamp, rampFor } from "@/lib/chip-ramp";

export interface StatusChip {
  slug: string;
  label: string;
  count: number;
  Icon?: LucideIcon;
}

interface Props {
  chips: StatusChip[];
  active: Set<string>;
  onToggle: (slug: string) => void;
  primary?: number;
}

export function StatusChipRow({ chips, active, onToggle, primary = 6 }: Props) {
  const inline = chips.slice(0, primary);
  const overflow = chips.slice(primary);
  const overflowActive = overflow.filter((c) => active.has(c.slug));
  const firstOverflowRamp: ChipRamp = overflowActive[0]
    ? rampFor(overflowActive[0].slug)
    : rampFor("__fallback__");

  return (
    <div className="flex items-center gap-2 flex-nowrap" data-testid="status-chip-row">
      {inline.map((chip) => {
        const isActive = active.has(chip.slug);
        const ramp = rampFor(chip.slug);
        const Icon = chip.Icon;
        return (
          <button
            key={chip.slug}
            type="button"
            onClick={() => onToggle(chip.slug)}
            data-testid={`chip-${chip.slug}`}
            data-active={isActive}
            className="inline-flex items-center gap-1.5 rounded-full px-3 h-7 text-[13px] font-medium transition-colors shrink-0 hover:bg-[#f2f5f8]"
            style={{
              background: isActive ? ramp.pressedBg : "#fff",
              border: `1px solid ${isActive ? ramp.pressedBorder : "#d7e0e9"}`,
              color: "#4c5258",
            }}
          >
            {Icon ? (
              <Icon size={12} className="shrink-0" />
            ) : (
              <span
                className="size-2 rounded-full shrink-0"
                style={{ background: isActive ? ramp.pressedDot : ramp.pressedDot }}
              />
            )}
            {chip.label}
            <span className="text-[11px] text-muted-foreground ml-0.5">
              ({chip.count.toLocaleString()})
            </span>
          </button>
        );
      })}

      {overflow.length > 0 && (
        <DropdownMenu>
          <DropdownMenuTrigger
            className="inline-flex items-center gap-1 rounded-full px-3 h-7 text-[13px] font-medium transition-colors shrink-0 cursor-pointer hover:bg-[#f2f5f8]"
            style={{
              background: overflowActive.length > 0 ? firstOverflowRamp.pressedBg : "#fff",
              border: `1px solid ${overflowActive.length > 0 ? firstOverflowRamp.pressedBorder : "#d7e0e9"}`,
              color: "#4c5258",
            }}
            data-testid="chip-overflow"
          >
            {overflowActive.length === 1 && (
              <span
                className="size-2 rounded-full shrink-0"
                style={{ background: firstOverflowRamp.pressedDot }}
              />
            )}
            More
            {overflowActive.length > 1 && (
              <span className="inline-flex items-center justify-center h-4 min-w-4 px-1 rounded-full bg-[#202228] text-white text-[10px] font-bold leading-none">
                {overflowActive.length}
              </span>
            )}
            <ChevronDown size={12} />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-52">
            {overflow.map((chip) => {
              const isActive = active.has(chip.slug);
              const ramp = rampFor(chip.slug);
              return (
                <DropdownMenuItem
                  key={chip.slug}
                  onClick={() => onToggle(chip.slug)}
                  className="flex items-center gap-2 text-[13px]"
                >
                  <span
                    className="size-2 rounded-full shrink-0"
                    style={{ background: ramp.pressedDot }}
                  />
                  <span className="flex-1">{chip.label}</span>
                  <span className="text-[11px] text-muted-foreground">
                    ({chip.count.toLocaleString()})
                  </span>
                  {isActive && <Check size={13} className="text-foreground ml-1" />}
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
}
