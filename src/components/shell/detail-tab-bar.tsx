"use client";

import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

export interface DetailTab {
  value: string;
  label: string;
  Icon?: LucideIcon;
  count?: number;
  testId?: string;
}

interface DetailTabBarProps {
  tabs: DetailTab[];
  active: string;
  onChange: (value: string) => void;
  className?: string;
  testId?: string;
}

const TRIGGER =
  "inline-flex items-center gap-1.5 h-[52px] border-0 border-b-2 [border-bottom-color:transparent] " +
  "px-4 text-sm font-medium text-muted-foreground hover:text-foreground " +
  "data-[active=true]:[border-bottom-color:#202228] data-[active=true]:bg-transparent " +
  "data-[active=true]:font-semibold data-[active=true]:text-foreground " +
  "rounded-none transition-none cursor-pointer";

const COUNT_PILL =
  "ml-1 rounded-full px-2 py-0.5 text-xs font-medium bg-[#f2f5f8] border border-[#bdccdb] text-[#4c5258] tabular-nums";

/** In-page tab bar with local state — visually identical to FeatureTabBar (route-based). */
export function DetailTabBar({ tabs, active, onChange, className, testId }: DetailTabBarProps) {
  return (
    <div className={cn("bg-[#e5ebf1] pt-2 shrink-0", className)} data-testid={testId ?? "detail-tab-bar"}>
      <div className="mx-4 border-b border-[#bdccdb]">
        <div role="tablist" className="flex h-auto bg-transparent p-0 gap-0">
          {tabs.map((t) => {
            const isActive = active === t.value;
            return (
              <button
                key={t.value}
                type="button"
                role="tab"
                aria-selected={isActive}
                data-active={isActive}
                data-testid={t.testId ?? `tab-${t.value}`}
                className={TRIGGER}
                onClick={() => onChange(t.value)}
              >
                {t.Icon ? <t.Icon size={16} strokeWidth={1.75} /> : null}
                <span>{t.label}</span>
                {t.count !== undefined && <span className={COUNT_PILL}>{t.count}</span>}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
