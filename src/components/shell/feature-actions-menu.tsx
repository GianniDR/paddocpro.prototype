"use client";

import type { LucideIcon } from "lucide-react";
import { ChevronDown } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export interface ActionItem {
  label: string;
  Icon?: LucideIcon;
  onClick: () => void;
  testId?: string;
  destructive?: boolean;
}

interface FeatureActionsMenuProps {
  /** All actions shown in the dropdown when "Actions" is clicked. */
  items: ActionItem[];
  /** Optional "X selected" count badge. */
  selectionCount?: number;
}

/**
 * Single charcoal "Actions" button + chevron dropdown — matches the riskhub-1experience
 * Figma toolbar pattern (node 17628:147773).
 */
export function FeatureActionsMenu({ items, selectionCount }: FeatureActionsMenuProps) {
  if (items.length === 0) return null;
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            size="sm"
            className="h-8 gap-1.5 px-2.5"
            data-testid="feature-actions-menu"
            aria-label="Actions"
          />
        }
      >
        Actions
        {selectionCount !== undefined && selectionCount > 0 && (
          <span className="rounded-full bg-white/20 px-1.5 text-[10px] font-semibold">
            {selectionCount}
          </span>
        )}
        <ChevronDown size={14} />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[200px]">
        {items.map((item, i) => (
          <DropdownMenuItem
            key={i}
            onClick={item.onClick}
            data-testid={item.testId}
            className={item.destructive ? "text-destructive gap-2" : "gap-2"}
          >
            {item.Icon && <item.Icon size={14} />}
            {item.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
