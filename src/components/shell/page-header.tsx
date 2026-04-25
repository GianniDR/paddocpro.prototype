"use client";

import Link from "next/link";
import { Fragment } from "react";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";

export interface BreadcrumbCrumb {
  label: string;
  href?: string;
}

export function PageHeader({
  breadcrumb,
  rightSlot,
}: {
  breadcrumb: BreadcrumbCrumb[];
  rightSlot?: React.ReactNode;
}) {
  return (
    <header
      className="h-12 border-b flex items-center gap-2 px-4 bg-background/80 backdrop-blur sticky top-0 z-30"
      data-testid="topbar"
    >
      <SidebarTrigger data-testid="sidebar-trigger" />
      <Separator orientation="vertical" className="h-4" />
      <Breadcrumb data-testid="topbar-breadcrumb">
        <BreadcrumbList>
          {breadcrumb.map((c, i) => (
            <Fragment key={i}>
              <BreadcrumbItem>
                {c.href && i < breadcrumb.length - 1 ? (
                  <BreadcrumbLink
                    render={<Link href={c.href} data-testid={`topbar-breadcrumb-${i}`} />}
                  >
                    {c.label}
                  </BreadcrumbLink>
                ) : (
                  <BreadcrumbPage data-testid={`topbar-breadcrumb-${i}`}>{c.label}</BreadcrumbPage>
                )}
              </BreadcrumbItem>
              {i < breadcrumb.length - 1 && <BreadcrumbSeparator />}
            </Fragment>
          ))}
        </BreadcrumbList>
      </Breadcrumb>
      <div className="ml-auto flex items-center gap-2">{rightSlot}</div>
    </header>
  );
}
