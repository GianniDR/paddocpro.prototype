"use client";

import { Search } from "lucide-react";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface FeatureToolbarProps {
  search: string;
  onSearchChange: (s: string) => void;
  placeholder?: string;
  children?: React.ReactNode;
  className?: string;
}

export function FeatureToolbar({
  search,
  onSearchChange,
  placeholder,
  children,
  className,
}: FeatureToolbarProps) {
  return (
    <div className={cn("flex w-full items-center gap-2", className)} data-testid="feature-toolbar">
      <div className="relative flex-1">
        <Search
          size={14}
          className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
        />
        <Input
          type="search"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={placeholder ?? "Search…"}
          className="h-8 pl-8 text-sm bg-card border-[#bdccdb] focus-visible:ring-1 focus-visible:ring-[#202228]"
          data-testid="feature-toolbar-search"
        />
      </div>
      {children}
    </div>
  );
}
