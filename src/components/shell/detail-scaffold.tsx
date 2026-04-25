"use client";

import type { LucideIcon } from "lucide-react";

import { FeatureTabBar } from "./feature-tab-bar";

interface DetailScaffoldProps {
  title: string;
  subtitle?: string;
  Icon?: LucideIcon;
  tabs: { label: string; href: string; Icon?: LucideIcon; count?: number; exact?: boolean }[];
  stickyToolbar?: React.ReactNode;
  children: React.ReactNode;
  testId?: string;
}

export function DetailScaffold({
  title,
  subtitle,
  Icon,
  tabs,
  stickyToolbar,
  children,
  testId,
}: DetailScaffoldProps) {
  return (
    <div className="flex flex-1 flex-col overflow-hidden" data-testid={testId}>
      <div className="bg-[#e5ebf1] px-4 pt-4 pb-0 flex items-start gap-3 shrink-0">
        {Icon && (
          <div className="rounded-md bg-white border border-[#bdccdb] p-2">
            <Icon size={28} strokeWidth={1.5} className="text-[#202228]" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h1
            className="text-2xl font-display italic font-semibold tracking-normal text-[#131416]"
            data-route-title=""
          >
            {title}
          </h1>
          {subtitle && <p className="text-sm text-[#4c5258]">{subtitle}</p>}
        </div>
      </div>
      {tabs.length > 0 && <FeatureTabBar tabs={tabs} />}
      <div className="flex flex-1 overflow-auto bg-[#e5ebf1] gap-4 p-4">{children}</div>
      {stickyToolbar}
    </div>
  );
}
