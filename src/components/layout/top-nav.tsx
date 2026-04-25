"use client";

import { Bell, Mail } from "lucide-react";
import { usePathname, useSearchParams } from "next/navigation";

import { PaddyTrigger } from "@/components/layout/paddy-trigger";
import { TenantSwitcher } from "@/components/layout/tenant-switcher";
import { UserMenu } from "@/components/layout/user-menu";

import { BreadcrumbTrail } from "./breadcrumb-trail";
import { useBreadcrumbTrail } from "./breadcrumb-trail-provider";
import { buildCrumbs } from "./build-crumbs";

export function TopNav() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { entityLabels } = useBreadcrumbTrail();
  const crumbs = buildCrumbs(pathname, searchParams ?? undefined, entityLabels);

  return (
    <header
      className="flex h-[54px] shrink-0 items-center gap-2 bg-card px-4 border-b border-[#bdccdb]"
      data-testid="topbar"
    >
      <BreadcrumbTrail crumbs={crumbs} />
      <div className="ml-auto flex items-center gap-2">
        <TenantSwitcher />
        <button
          type="button"
          aria-label="Messages"
          className="relative flex size-8 items-center justify-center rounded-full hover:bg-muted transition-colors"
        >
          <Mail size={16} className="text-muted-foreground" />
        </button>
        <button
          type="button"
          aria-label="Notifications"
          className="relative flex size-8 items-center justify-center rounded-full hover:bg-muted transition-colors"
        >
          <Bell size={16} className="text-muted-foreground" />
        </button>
        <PaddyTrigger />
        <UserMenu />
      </div>
    </header>
  );
}
