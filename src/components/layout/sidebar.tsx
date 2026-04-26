"use client";

import { ChevronDown } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { type ComponentType, useState } from "react";

import { PRIMARY_NAV, SETTINGS_NAV } from "@/lib/nav";
import { cn } from "@/lib/utils";

interface NavItemProps {
  label: string;
  href?: string;
  Icon: ComponentType<{ size?: number; className?: string }>;
  active?: boolean;
  collapsed?: boolean;
  indented?: boolean;
  onClick?: () => void;
  badge?: { count: number; tone: "default" | "destructive" };
}

function NavItem({ label, href, Icon, active, collapsed, indented, onClick, badge }: NavItemProps) {
  const inner = (
    <div
      className={cn(
        "relative flex items-center gap-2 py-1.5 rounded-md transition-colors",
        collapsed ? "justify-center px-1" : indented ? "pl-5 pr-2" : "pl-2 pr-2",
        active ? "bg-[#36383E]" : "hover:bg-[#2a2c33]",
      )}
    >
      {!collapsed && active && indented && (
        <span className="absolute left-0 top-1 bottom-1 w-0.5 rounded-full bg-[#fefdfc]" />
      )}
      <span
        className={cn(
          "flex items-center justify-center rounded-md",
          collapsed ? "size-9" : "size-7",
        )}
      >
        <Icon size={18} className="text-[#fefdfc]" />
      </span>
      {!collapsed && (
        <>
          <span
            className={cn(
              "text-sm text-[#fefdfc]",
              active ? "font-semibold" : "font-medium",
            )}
          >
            {label}
          </span>
          {badge && badge.count > 0 && (
            <span
              className={cn(
                "ml-auto inline-flex items-center justify-center rounded-md px-1.5 py-0.5 text-[10px] font-semibold tabular-nums",
                badge.tone === "destructive"
                  ? "bg-[#dc2626] text-white"
                  : "bg-white/15 text-[#fefdfc]",
              )}
            >
              {badge.count}
            </span>
          )}
        </>
      )}
    </div>
  );

  const testId = `nav-${label.toLowerCase().replace(/\s+/g, "-")}`;

  if (href) {
    return (
      <Link href={href} onClick={onClick} className="block" data-testid={testId}>
        {inner}
      </Link>
    );
  }

  return (
    <button type="button" onClick={onClick} className="block w-full text-left" data-testid={testId}>
      {inner}
    </button>
  );
}

interface NavGroupProps {
  label: string;
  Icon: ComponentType<{ size?: number; className?: string }>;
  defaultOpen?: boolean;
  collapsed?: boolean;
  active?: boolean;
  children: React.ReactNode;
}

function NavGroupNode({ label, Icon, defaultOpen = false, collapsed, active, children }: NavGroupProps) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="flex flex-col gap-0.5">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "flex items-center gap-2 py-1.5 pl-2 pr-2 w-full text-left rounded-md transition-colors",
          active && !open ? "bg-[#36383E]" : "hover:bg-[#2a2c33]",
        )}
      >
        <span className="flex items-center justify-center rounded-md size-7">
          <Icon size={18} className="text-[#fefdfc]" />
        </span>
        {!collapsed && (
          <>
            <span className={cn("text-sm text-[#fefdfc]", active ? "font-semibold" : "font-medium")}>
              {label}
            </span>
            <ChevronDown
              size={14}
              className={cn("ml-auto text-[#fefdfc] transition-transform", open && "rotate-180")}
            />
          </>
        )}
      </button>
      {open && !collapsed && <div className="mt-0.5 flex flex-col gap-0.5">{children}</div>}
    </div>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        "flex flex-col bg-[#202228] text-[#fefdfc] transition-all duration-200 shrink-0",
        collapsed ? "w-16" : "w-64",
      )}
      data-testid="sidebar"
    >
      <div className="h-[54px] shrink-0 flex items-center border-b border-white/10 px-3">
        <Link href="/dashboard" className="flex items-center gap-2 text-[#fefdfc]">
          {collapsed ? (
            <span className="text-base font-display italic font-semibold">p|p</span>
          ) : (
            <span className="text-base font-display italic font-semibold">paddoc | pro</span>
          )}
        </Link>
      </div>

      <nav className="flex flex-1 flex-col overflow-y-auto p-2">
        {PRIMARY_NAV.map((entry) =>
          "children" in entry ? (
            <NavGroupNode
              key={entry.label}
              label={entry.label}
              Icon={entry.icon}
              collapsed={collapsed}
              active={entry.children.some((c) => pathname.startsWith(c.route))}
              defaultOpen={entry.children.some((c) => pathname.startsWith(c.route))}
            >
              {entry.children.map((child) => (
                <NavItem
                  key={child.slug}
                  label={child.label}
                  href={child.route}
                  Icon={child.icon}
                  collapsed={collapsed}
                  active={pathname === child.route || pathname.startsWith(child.route + "/")}
                  indented
                />
              ))}
            </NavGroupNode>
          ) : (
            <NavItem
              key={entry.slug}
              label={entry.label}
              href={entry.route}
              Icon={entry.icon}
              collapsed={collapsed}
              active={pathname === entry.route || pathname.startsWith(entry.route + "/")}
              onClick={collapsed ? () => setCollapsed(false) : undefined}
            />
          ),
        )}

        <div className="mt-auto">
          <NavGroupNode
            label="Settings"
            Icon={SETTINGS_NAV.icon}
            collapsed={collapsed}
            active={pathname.startsWith("/settings")}
            defaultOpen={pathname.startsWith("/settings")}
          >
            {SETTINGS_NAV.children.map((child) => (
              <NavItem
                key={child.slug}
                label={child.label}
                href={child.route}
                Icon={child.icon}
                collapsed={collapsed}
                active={pathname === child.route}
                indented
              />
            ))}
          </NavGroupNode>
        </div>
      </nav>
    </aside>
  );
}
