"use client";

import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

interface Tab {
  label: string;
  href: string;
  Icon?: LucideIcon;
  count?: number;
  exact?: boolean;
}

const TRIGGER =
  "inline-flex items-center gap-1.5 h-[52px] border-0 border-b-2 [border-bottom-color:transparent] " +
  "px-4 text-sm font-medium text-muted-foreground hover:text-foreground " +
  "data-[active=true]:[border-bottom-color:#202228] data-[active=true]:bg-transparent " +
  "data-[active=true]:font-semibold data-[active=true]:text-foreground " +
  "data-[active=true]:shadow-none rounded-none transition-none";

const COUNT_PILL =
  "ml-1 rounded-full px-2 py-0.5 text-xs font-medium bg-[#f2f5f8] border border-[#bdccdb] text-[#4c5258] tabular-nums";

export function FeatureTabBar({ tabs, className }: { tabs: Tab[]; className?: string }) {
  const pathname = usePathname();
  return (
    <div className={cn("bg-[#e5ebf1] pt-2 shrink-0", className)} data-testid="feature-tab-bar">
      <div className="mx-4 border-b border-[#bdccdb]">
        <div role="tablist" className="flex h-auto bg-transparent p-0 gap-0">
          {tabs.map((t) => {
            const isActive = t.exact
              ? pathname === t.href
              : pathname === t.href || pathname.startsWith(t.href + "/");
            return (
              <Link
                key={t.href}
                href={t.href}
                role="tab"
                aria-selected={isActive}
                data-active={isActive}
                data-testid={`tab-${t.label.toLowerCase().replace(/\s+/g, "-")}`}
                className={TRIGGER}
              >
                {t.Icon ? <t.Icon size={16} strokeWidth={1.75} /> : null}
                <span>{t.label}</span>
                {t.count !== undefined && <span className={COUNT_PILL}>{t.count}</span>}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
