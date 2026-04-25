"use client";

import { ChevronRight, MoreHorizontal } from "lucide-react";
import Link from "next/link";
import { Fragment } from "react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import type { Crumb } from "./build-crumbs";

const MAX_VISIBLE_CRUMBS = 6;

export function BreadcrumbTrail({ crumbs }: { crumbs: Crumb[] }) {
  if (crumbs.length === 0) return null;
  const collapse = crumbs.length > MAX_VISIBLE_CRUMBS;
  const head = collapse ? crumbs.slice(0, 1) : crumbs;
  const overflow = collapse ? crumbs.slice(1, crumbs.length - (MAX_VISIBLE_CRUMBS - 2)) : [];
  const tail = collapse ? crumbs.slice(crumbs.length - (MAX_VISIBLE_CRUMBS - 2)) : [];

  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1.5" data-testid="topbar-breadcrumb">
      {head.map((c, i) => (
        <Fragment key={`h-${i}`}>
          <CrumbNode crumb={c} isLast={!collapse && i === head.length - 1} />
        </Fragment>
      ))}
      {collapse && (
        <>
          <ChevronRight size={16} className="text-[#4c5258]" />
          <DropdownMenu>
            <DropdownMenuTrigger
              className="text-[#4c5258] hover:text-[#131416] inline-flex items-center"
              aria-label="More breadcrumbs"
            >
              <MoreHorizontal size={16} />
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {overflow.map((c, i) => (
                <DropdownMenuItem key={`o-${i}`}>
                  {c.href ? <Link href={c.href}>{c.label}</Link> : <span>{c.label}</span>}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          {tail.map((c, i) => (
            <Fragment key={`t-${i}`}>
              <CrumbNode crumb={c} isLast={i === tail.length - 1} />
            </Fragment>
          ))}
        </>
      )}
    </nav>
  );
}

function CrumbNode({ crumb, isLast }: { crumb: Crumb; isLast: boolean }) {
  const Icon = crumb.Icon;
  const label = (
    <span className={isLast ? "text-sm font-semibold text-[#131416]" : "text-sm text-[#4c5258] hover:text-[#131416] transition-colors"}>
      {crumb.label}
    </span>
  );
  return (
    <span className="flex items-center gap-1.5">
      {Icon && (
        <Icon size={16} strokeWidth={1.75} className={isLast ? "text-[#131416]" : "text-[#4c5258]"} />
      )}
      {crumb.href && !isLast ? <Link href={crumb.href}>{label}</Link> : label}
      {!isLast && <ChevronRight size={16} className="text-[#4c5258] ml-1.5" />}
    </span>
  );
}
