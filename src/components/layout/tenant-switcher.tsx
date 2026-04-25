"use client";

import { Check, ChevronsUpDown } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { setTenant, useSession } from "@/lib/auth/current";
import { useDataset } from "@/lib/mock/store";
import { cn } from "@/lib/utils";

export function TenantSwitcher() {
  const dataset = useDataset();
  const session = useSession();
  const tenants = dataset.tenants;
  const current = tenants.find((t) => t.id === session?.tenantId) ?? tenants[0];
  if (!current) return null;
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="inline-flex items-center gap-2 px-2 h-8 rounded-md border bg-card text-sm font-medium hover:bg-accent transition"
        data-testid="topbar-tenant-switcher"
      >
        <span className="truncate max-w-[180px]">{current.name}</span>
        <ChevronsUpDown className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel className="text-xs text-muted-foreground">Switch yard</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {tenants.map((t) => (
          <DropdownMenuItem
            key={t.id}
            data-testid={`topbar-tenant-${t.slug}`}
            onClick={() => setTenant(t.id)}
            className={cn("gap-2", t.id === current.id && "font-medium")}
          >
            <Check className={cn("h-3.5 w-3.5", t.id === current.id ? "opacity-100" : "opacity-0")} aria-hidden="true" />
            {t.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
