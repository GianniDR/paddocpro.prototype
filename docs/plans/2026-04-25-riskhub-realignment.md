# PaddocPro ⇆ riskhub-1experience Realignment Plan

> **For agentic workers:** This plan is meant to be executed task-by-task. Steps use `- [ ]` checkboxes. Do NOT batch unrelated edits into one commit. Each task ends with a commit boundary; run lint + typecheck before each commit.

**Goal:** Re-align the PaddocPro app at `/Users/gianni/Desktop/paddocpro-app/` to the riskhub-1experience design system through methodical 1:1 component substitution, so the user's stated parity bar is met.

**Architecture:** Mechanical mapping — Nav ⇆ Nav, Grid ⇆ Grid, Theme ⇆ Theme. We lift riskhub-1experience primitives verbatim, rename their classes to paddocpro brand tokens where colour adjustment is intentional, and rewire the per-module page structure to the **two-tab pattern (`Dashboard` + `<Entity> grid`)** that riskhub uses.

**Tech Stack:** Next.js 16, React 19, TypeScript, Tailwind v4, AG Grid Community/Enterprise, shadcn/ui, recharts, react-hook-form + zod, Playwright.

---

## Why this is needed

Audit (2026-04-25) found PaddocPro diverges from riskhub-1experience on **15 concrete points** — sidebar styling and item spacing, top-bar height + breadcrumb behaviour, complete absence of the per-module two-tab pattern, missing per-module dashboards, AG Grid theme tokens, no row-grouping panel, no sideBar tool panels, no pagination, capped non-stretching search bar, simplistic filter chips with no overflow, pinned cells where there shouldn't be, stacked-value cells, full-page wizards instead of modals, mismatched detail-page toolbar height/styling, breadcrumb auto-resolution. The user's stated rule was *"copy riskhub-1experience"* — closing this gap is the work.

This plan touches **only paddocpro-app**. The riskhub-1experience repo is read-only reference.

---

## Mapping table (the contract)

| paddocpro current | riskhub-1experience source | Action |
|---|---|---|
| `src/components/layout/app-sidebar.tsx` (shadcn `Sidebar`) | `src/components/layout/sidebar.tsx` (custom 256/64px) | **Replace** |
| `src/components/shell/page-header.tsx` (h-12 sticky) | `src/components/layout/top-nav.tsx` (h-[54px] non-sticky) | **Replace** |
| `src/app/(portal)/layout.tsx` (`SidebarProvider` + `SidebarInset`) | `src/app/(portal)/layout.tsx` (flex h-screen + Sidebar + TopNav + main) | **Replace shell wiring** |
| `src/lib/ag-grid-theme.ts` (CSS-var quartz) | `src/lib/ag-grid-theme.ts` (hex quartz) | **Replace tokens** |
| `src/components/shell/feature-grid.tsx` | `src/components/shell/feature-grid.tsx` + ActionsGrid usage | **Rewrite to riskhub pattern** |
| `src/components/horses/horses-grid.tsx` (chip row + capped search + stacked cells + pinned col) | riskhub `actions-grid.tsx` (toolbar + StatusChipRow + flat cols) | **Rewrite** |
| Module routes `/horses`, `/clients`, ... (single grid) | `/actions` + `/actions/all-actions` (Dashboard tab + Grid tab) | **Restructure** |
| `src/app/(portal)/dashboard/page.tsx` (one global dashboard) | one Dashboard PER MODULE driven by grid data | **Repurpose** |
| `src/app/(portal)/horses/new/page.tsx` (full-page wizard) | `CreateActionModal` (Dialog) | **Convert to modal** |
| `src/components/horses/horse-profile.tsx` toolbar (sticky `h-?` blur) | `ActionDetailToolbar` (`h-16 bg-white border-t`) | **Reskin** |
| Filter chips (shadcn buttons) | `StatusChipRow` (ramped pills + overflow dropdown) | **Replace primitive** |
| Per-route `BreadcrumbCrumb[]` props | `BreadcrumbTrailProvider` + `buildCrumbs(pathname, searchParams)` | **Auto-resolve** |
| `src/app/globals.css` (oklch warm greens) | `globals.css` (charcoal+slate hex) | **Re-token** |

When a row says "Replace", we copy the riskhub file structure into paddocpro and adapt brand tokens — we don't reinvent.

---

## File structure (target)

```
src/
  app/
    (portal)/
      layout.tsx                  # Re-wired shell (Sidebar + TopNav + main, no SidebarProvider)
      home/                       # NEW (rename from /dashboard)
        page.tsx                  # Yard-wide overview only
      horses/
        page.tsx                  # Horses Dashboard tab
        all-horses/
          page.tsx                # Horses Grid tab
        [id]/
          page.tsx                # Horse profile (full page kept)
      clients/
        page.tsx                  # Clients Dashboard tab
        all-clients/
          page.tsx                # Clients Grid tab
      stables/
        page.tsx                  # Stables Dashboard tab
        all-stables/
          page.tsx                # Stables Grid tab
      bookings/
        page.tsx                  # Bookings Dashboard tab
        all-bookings/
          page.tsx                # Bookings Grid tab
      tasks/
        page.tsx                  # Tasks Dashboard tab
        all-tasks/page.tsx
      health/
        page.tsx                  # Health Dashboard tab
        all-events/page.tsx       # Health events Grid tab (renamed from heatmap)
      feed-supplies/
        page.tsx + all-supplies/page.tsx
      staff/
        page.tsx + all-staff/page.tsx
      documents/
        page.tsx + all-documents/page.tsx
      communication/
        page.tsx + all-threads/page.tsx
      incidents/
        page.tsx + all-incidents/page.tsx
      visitors/
        page.tsx + all-visitors/page.tsx
      finance/
        page.tsx + all-invoices/page.tsx
      reports/
        page.tsx                  # Reports landing only — no grid tab
      settings/...                # Unchanged
  components/
    layout/
      sidebar.tsx                 # NEW — replaces app-sidebar.tsx
      top-nav.tsx                 # NEW — replaces page-header.tsx
      breadcrumb-trail.tsx        # NEW — auto-resolves from pathname
      breadcrumb-trail-provider.tsx # NEW — context
      build-crumbs.ts             # NEW — pathname → crumb[]
      paddy-trigger.tsx           # KEPT
      tenant-switcher.tsx         # KEPT (moved into TopNav right slot)
      user-menu.tsx               # KEPT (moved into TopNav right slot)
    shell/
      feature-tab-bar.tsx         # NEW — Dashboard | Grid tabs primitive
      feature-toolbar.tsx         # NEW — search + actions row
      feature-grid.tsx            # REWRITTEN
      status-chip-row.tsx         # NEW — replaces inline chip rendering
      kpi-card.tsx                # NEW
      widget-card.tsx             # NEW
      detail-scaffold.tsx         # NEW — replaces horse-profile bespoke layout
      detail-toolbar.tsx          # NEW — h-16 sticky toolbar primitive
    horses/
      horses-tabs.tsx             # NEW — exposes `<FeatureTabBar>`
      horses-dashboard.tsx        # NEW — KPIs + charts from horses dataset
      horses-grid.tsx             # REWRITTEN (no pinned, no stacked, full search)
      horse-profile.tsx           # MODIFIED (use DetailScaffold + DetailToolbar)
      add-horse-modal.tsx         # NEW — replaces /horses/new
    (same pattern for every other module)
  lib/
    ag-grid-theme.ts              # RE-TOKENED
    nav.ts                        # Update entries to point at /<module> (Dashboard) hrefs
    chip-ramp.ts                  # NEW — pressedBg/Border/Dot per status
docs/
  plans/
    2026-04-25-riskhub-realignment.md  # this file
```

---

## Phase ordering (mandatory)

**Phase 0 — Tokens & theme.** Without these, every later component will look wrong. Tasks 1–3.
**Phase 1 — Shell parity.** New Sidebar, TopNav, layout wiring, breadcrumb auto-resolution. Tasks 4–8.
**Phase 2 — Module primitives.** FeatureTabBar, FeatureToolbar, StatusChipRow, KpiCard, WidgetCard, FeatureGrid v2, DetailScaffold, DetailToolbar. Tasks 9–16.
**Phase 3 — Module restructure.** Horses first (exemplar), then Clients, Stables, Bookings, Tasks, Health, Feed-supplies, Staff, Documents, Communication, Incidents, Visitors, Finance, Reports. Tasks 17–30.
**Phase 4 — Create flows.** Convert `Add Horse` and any other full-page wizards to modals. Tasks 31–32.
**Phase 5 — Detail page reskin.** Horse profile, then any other detail full-pages. Tasks 33–34.
**Phase 6 — Tests.** Repair + add. Task 35.

---

## Phase 0 — Tokens & theme

### Task 1 — Re-token `globals.css` to riskhub palette

**Files:**
- Modify: `src/app/globals.css`

**Why:** Every later component depends on these CSS variables. Once we adopt riskhub palette, the bg `oklch(0.97 0.012 88)` becomes the slate `#e5ebf1`; the primary becomes the charcoal `#202228`; sidebar tokens become the dark charcoal stack. This single file change propagates to ~80% of the app's visual language.

- [ ] **Step 1** — Replace the `:root` block in `src/app/globals.css` with:

```css
:root {
  --radius: 0.625rem;

  /* Page canvas + foreground */
  --background: #e5ebf1;
  --foreground: #131416;

  /* Surfaces */
  --card: oklch(1 0 0);
  --card-foreground: oklch(0.36 0.012 255);
  --popover: oklch(1 0 0);
  --popover-foreground: oklch(0.36 0.012 255);

  /* Brand */
  --primary: oklch(0.21 0.006 285.885);                /* charcoal */
  --primary-foreground: oklch(0.985 0 0);
  --secondary: oklch(0.967 0.001 286.375);
  --secondary-foreground: oklch(0.21 0.006 285.885);
  --muted: oklch(0.967 0.001 286.375);
  --muted-foreground: oklch(0.552 0.016 285.938);
  --accent: oklch(0.967 0.001 286.375);
  --accent-foreground: oklch(0.21 0.006 285.885);
  --destructive: oklch(0.577 0.245 27.325);
  --destructive-foreground: oklch(0.985 0 0);

  /* Borders + input */
  --border: #BDCCDB;
  --input: #BDCCDB;
  --ring: oklch(0.705 0.015 286.067);

  /* Charts — paddocpro WARM ramp kept (brand differentiator) */
  --chart-1: oklch(0.78 0.060 150);
  --chart-2: oklch(0.65 0.085 152);
  --chart-3: oklch(0.52 0.095 154);
  --chart-4: oklch(0.40 0.085 156);
  --chart-5: oklch(0.28 0.060 158);

  /* Status helpers */
  --success: oklch(0.596 0.145 163);
  --success-foreground: oklch(0.985 0 0);
  --warning: oklch(0.769 0.169 82);
  --warning-foreground: oklch(0.205 0 0);
  --info: oklch(0.651 0.143 243);
  --info-foreground: oklch(0.985 0 0);

  /* Sidebar tokens — dark charcoal stack */
  --sidebar: oklch(0.18 0.009 264);
  --sidebar-foreground: oklch(0.985 0 0);
  --sidebar-primary: oklch(0.985 0 0);
  --sidebar-primary-foreground: oklch(0.18 0.009 264);
  --sidebar-accent: oklch(0.26 0.009 264);
  --sidebar-accent-foreground: oklch(0.985 0 0);
  --sidebar-border: oklch(1 0 0 / 10%);
  --sidebar-ring: oklch(1 0 0 / 30%);

  /* Brand hex tokens — referenced by Sidebar / TopNav inline styles */
  --brand-charcoal: #202228;
  --brand-charcoal-200: #636469;
  --brand-charcoal-300: #4D4E53;
  --brand-charcoal-400: #36383E;
  --brand-charcoal-950: #131416;
  --brand-slate-100: #f2f5f8;
  --brand-slate-200: #e5ebf1;
  --brand-slate-300: #BDCCDB;
  --brand-slate-700: #4c5258;
  --brand-slate-800: #717a83;
}
```

Inside `@theme inline { ... }` add:

```css
  --color-brand-charcoal: var(--brand-charcoal);
  --color-brand-charcoal-200: var(--brand-charcoal-200);
  --color-brand-charcoal-300: var(--brand-charcoal-300);
  --color-brand-charcoal-400: var(--brand-charcoal-400);
  --color-brand-slate-100: var(--brand-slate-100);
  --color-brand-slate-200: var(--brand-slate-200);
  --color-brand-slate-300: var(--brand-slate-300);
  --color-brand-slate-700: var(--brand-slate-700);
  --color-brand-slate-800: var(--brand-slate-800);
  --radius-sm: calc(var(--radius) - 4px);
  --radius-md: calc(var(--radius) - 2px);
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) + 4px);
```

(Keep `--font-display: var(--font-cormorant)` — paddocpro display font is intentional brand kept. Drop the equestrian-warm dark-mode block — riskhub doesn't ship dark mode in production. We can re-add later.)

- [ ] **Step 2** — Run `npm run typecheck && npm run lint && npm run build`. Build must pass. App will look broken in places — that's expected; later tasks fix it.

- [ ] **Step 3** — Commit:

```
git add src/app/globals.css
git commit -m "chore(theme): adopt riskhub-1experience palette tokens"
```

---

### Task 2 — Re-token `ag-grid-theme.ts` to riskhub spec

**Files:**
- Modify: `src/lib/ag-grid-theme.ts`

- [ ] **Step 1** — Overwrite the file:

```ts
import { themeQuartz } from "ag-grid-community";

export const paddocproTheme = themeQuartz.withParams({
  accentColor: "#202228",
  backgroundColor: "#FFFFFF",
  borderColor: "#BDCCDB",
  borderRadius: 4,
  cellHorizontalPaddingScale: 1,
  cellTextColor: "#717a83",
  columnBorder: false,
  fontFamily: "var(--font-geist-sans)",
  fontSize: 14,
  foregroundColor: "#131416",
  headerBackgroundColor: "#FFFFFF",
  headerFontFamily: "var(--font-geist-sans)",
  headerRowBorder: true,
  headerTextColor: "#131416",
  iconSize: 16,
  oddRowBackgroundColor: "#FFFFFF",
  rowHoverColor: "#e3eeff80",
  selectedRowBackgroundColor: "#e3eeff",
  rowBorder: true,
  rowVerticalPaddingScale: 1,
  spacing: 8,
  wrapperBorder: true,
  wrapperBorderRadius: 12,
});
```

- [ ] **Step 2** — `npm run typecheck`. Should pass.

- [ ] **Step 3** — Commit:

```
git add src/lib/ag-grid-theme.ts
git commit -m "chore(theme): re-token AG Grid to riskhub quartz spec"
```

---

### Task 3 — Wire Archivo font (riskhub uses it; we keep Geist as default but expose Archivo for grids)

**Files:**
- Modify: `src/app/layout.tsx`

- [ ] **Step 1** — In `src/app/layout.tsx`, alongside the existing Geist + Cormorant fonts, add:

```ts
import { Archivo } from "next/font/google";

const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});
```

In the `<html>` tag, append `archivo.variable` to the className list, e.g.:

```tsx
<html lang="en" className={`${geistSans.variable} ${geistMono.variable} ${cormorant.variable} ${archivo.variable}`}>
```

(We keep Geist as the primary `--font-sans` for all body text — paddocpro brand stays intentionally distinct in *typography* even as we adopt the *layout system*. The grid theme references `var(--font-geist-sans)` already, so Archivo is parked for any future surface that needs it.)

- [ ] **Step 2** — `npm run dev` and visit `/` — fonts should still render.

- [ ] **Step 3** — Commit:

```
git add src/app/layout.tsx
git commit -m "chore(fonts): add Archivo variable for selective surfaces"
```

---

## Phase 1 — Shell parity

### Task 4 — Replace Sidebar with riskhub primitive

**Files:**
- Create: `src/components/layout/sidebar.tsx`
- Delete: `src/components/layout/app-sidebar.tsx` (after Task 8 confirms layout works)

**Why:** The current `app-sidebar.tsx` uses shadcn's `<SidebarProvider>` plumbing, which can't be styled to riskhub's exact spec without fighting the abstraction. The riskhub sidebar is a hand-rolled flex column with explicit `w-64` / `w-16`, internal `useState` for collapse, and `NavGroup` components with their own open state.

- [ ] **Step 1** — Create `src/components/layout/sidebar.tsx`:

```tsx
"use client";

import { ChevronDown } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ComponentType } from "react";

import { cn } from "@/lib/utils";
import { PRIMARY_NAV, SETTINGS_NAV } from "@/lib/nav";

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
        "relative flex items-center gap-2 py-0.5",
        collapsed ? "justify-center" : indented ? "pl-6 pr-2" : "pl-2 pr-2",
      )}
    >
      {!collapsed && active && indented && (
        <span className="absolute left-0 top-1 bottom-1 w-0.5 rounded-full bg-[#fefdfc]" />
      )}
      <span
        className={cn(
          "flex items-center justify-center rounded-md transition-colors",
          collapsed ? "size-9" : "size-7",
          active ? "bg-[#36383E]" : "hover:bg-[#636469]",
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

  if (href) {
    return (
      <Link
        href={href}
        onClick={onClick}
        className="block"
        data-testid={`nav-${label.toLowerCase().replace(/\s+/g, "-")}`}
      >
        {inner}
      </Link>
    );
  }

  return (
    <button type="button" onClick={onClick} className="block w-full text-left">
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

function NavGroup({ label, Icon, defaultOpen = false, collapsed, active, children }: NavGroupProps) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="flex flex-col gap-0.5">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "flex items-center gap-2 py-0.5 pl-2 pr-2 w-full text-left",
          active && !open && "bg-[#4D4E53] rounded-md",
        )}
      >
        <span
          className={cn(
            "flex items-center justify-center rounded-md size-7 transition-colors",
            active ? "bg-[#36383E]" : "hover:bg-[#636469]",
          )}
        >
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
        <Link href="/home" className="flex items-center gap-2 text-[#fefdfc]">
          <span className="text-base font-display italic font-semibold">paddoc | pro</span>
        </Link>
      </div>

      <nav className="flex flex-1 flex-col overflow-y-auto p-2">
        {PRIMARY_NAV.map((entry) =>
          "children" in entry ? (
            <NavGroup
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
            </NavGroup>
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
          <NavGroup
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
          </NavGroup>
        </div>
      </nav>
    </aside>
  );
}
```

- [ ] **Step 2** — Update `src/lib/nav.ts` so `PRIMARY_NAV` exposes the shape this component expects (flat list, with `children` only on the optional Stock-equivalent group). For paddocpro, every primary entry is flat — no grouping needed for now. Update `nav.ts` like so:

```ts
import type { LucideIcon } from "lucide-react";
import {
  AlertTriangle,
  BarChart3,
  CalendarDays,
  DoorOpen,
  FileText,
  FolderOpen,
  Grid3x3,
  HeartPulse,
  Home,
  ListChecks,
  MessageSquare,
  Receipt,
  Settings,
  Sparkles,
  UserCog,
  Users,
  Wheat,
} from "lucide-react";

interface NavLeaf {
  slug: string;
  label: string;
  route: string;
  icon: LucideIcon;
}

interface NavGroup {
  label: string;
  icon: LucideIcon;
  children: NavLeaf[];
}

export const PRIMARY_NAV: (NavLeaf | NavGroup)[] = [
  { slug: "home", label: "Home", route: "/home", icon: Home },
  { slug: "horses", label: "Horses", route: "/horses", icon: Sparkles },
  { slug: "clients", label: "Clients", route: "/clients", icon: Users },
  { slug: "stables", label: "Stables & Paddocks", route: "/stables", icon: Grid3x3 },
  { slug: "bookings", label: "Bookings", route: "/bookings", icon: CalendarDays },
  { slug: "tasks", label: "Tasks", route: "/tasks", icon: ListChecks },
  { slug: "health", label: "Health", route: "/health", icon: HeartPulse },
  { slug: "feed", label: "Feed & Supplies", route: "/feed-supplies", icon: Wheat },
  { slug: "staff", label: "Staff", route: "/staff", icon: UserCog },
  { slug: "documents", label: "Documents", route: "/documents", icon: FolderOpen },
  { slug: "communication", label: "Communication", route: "/communication", icon: MessageSquare },
  { slug: "incidents", label: "Incidents", route: "/incidents", icon: AlertTriangle },
  { slug: "visitors", label: "Visitors", route: "/visitors", icon: DoorOpen },
  { slug: "finance", label: "Finance", route: "/finance", icon: Receipt },
  { slug: "reports", label: "Reports", route: "/reports", icon: BarChart3 },
];

export const SETTINGS_NAV: NavGroup = {
  label: "Settings",
  icon: Settings,
  children: [
    { slug: "yard-profile", label: "Yard profile", route: "/settings/yard-profile", icon: Settings },
    { slug: "users", label: "Users & roles", route: "/settings/users", icon: Users },
    { slug: "rbac", label: "Roles & permissions", route: "/settings/rbac", icon: Settings },
    { slug: "xero", label: "Xero", route: "/settings/xero", icon: FileText },
    { slug: "integrations", label: "Integrations", route: "/settings/integrations", icon: Settings },
    { slug: "audit", label: "Audit log", route: "/settings/audit-log", icon: FileText },
  ],
};
```

- [ ] **Step 3** — `npm run typecheck` (will fail until layout swaps in Task 8). That's fine; the file compiles in isolation.

- [ ] **Step 4** — Commit:

```
git add src/components/layout/sidebar.tsx src/lib/nav.ts
git commit -m "feat(shell): port riskhub Sidebar primitive + nav data shape"
```

---

### Task 5 — Build `BreadcrumbTrailProvider` + `buildCrumbs`

**Files:**
- Create: `src/components/layout/breadcrumb-trail-provider.tsx`
- Create: `src/components/layout/build-crumbs.ts`
- Create: `src/components/layout/breadcrumb-trail.tsx`

**Why:** riskhub auto-resolves breadcrumbs from `pathname + searchParams`. Currently every paddocpro page passes `breadcrumb={[…]}` manually — that's drift waiting to happen. We move to the auto pattern.

- [ ] **Step 1** — Create `src/components/layout/build-crumbs.ts`:

```ts
import {
  AlertTriangle,
  BarChart3,
  CalendarDays,
  DoorOpen,
  FolderOpen,
  Gauge,
  Grid3x3,
  HeartPulse,
  Home,
  ListChecks,
  type LucideIcon,
  MessageSquare,
  Receipt,
  Settings,
  Sparkles,
  UserCog,
  Users,
  Wheat,
} from "lucide-react";

export interface Crumb {
  label: string;
  href?: string;
  Icon?: LucideIcon;
}

const SEGMENT_LABEL: Record<string, { label: string; Icon: LucideIcon }> = {
  home: { label: "Home", Icon: Home },
  horses: { label: "Horses", Icon: Sparkles },
  "all-horses": { label: "All horses", Icon: Grid3x3 },
  clients: { label: "Clients", Icon: Users },
  "all-clients": { label: "All clients", Icon: Grid3x3 },
  stables: { label: "Stables & Paddocks", Icon: Grid3x3 },
  "all-stables": { label: "All stables", Icon: Grid3x3 },
  bookings: { label: "Bookings", Icon: CalendarDays },
  "all-bookings": { label: "All bookings", Icon: Grid3x3 },
  tasks: { label: "Tasks", Icon: ListChecks },
  "all-tasks": { label: "All tasks", Icon: Grid3x3 },
  health: { label: "Health", Icon: HeartPulse },
  "all-events": { label: "All events", Icon: Grid3x3 },
  "feed-supplies": { label: "Feed & Supplies", Icon: Wheat },
  "all-supplies": { label: "All supplies", Icon: Grid3x3 },
  staff: { label: "Staff", Icon: UserCog },
  "all-staff": { label: "All staff", Icon: Grid3x3 },
  documents: { label: "Documents", Icon: FolderOpen },
  "all-documents": { label: "All documents", Icon: Grid3x3 },
  communication: { label: "Communication", Icon: MessageSquare },
  "all-threads": { label: "All threads", Icon: Grid3x3 },
  incidents: { label: "Incidents", Icon: AlertTriangle },
  "all-incidents": { label: "All incidents", Icon: Grid3x3 },
  visitors: { label: "Visitors", Icon: DoorOpen },
  "all-visitors": { label: "All visitors", Icon: Grid3x3 },
  finance: { label: "Finance", Icon: Receipt },
  "all-invoices": { label: "All invoices", Icon: Grid3x3 },
  reports: { label: "Reports", Icon: BarChart3 },
  settings: { label: "Settings", Icon: Settings },
  dashboard: { label: "Dashboard", Icon: Gauge },
  new: { label: "New" },
};

const ENTITY_RESOLVERS: Record<string, (id: string) => string> = {
  // Filled in by `BreadcrumbTrailProvider` consumers via `setEntityLabel(id, label)`
};

export function buildCrumbs(pathname: string, _params?: URLSearchParams, entityLabels?: Map<string, string>): Crumb[] {
  const parts = pathname.split("/").filter(Boolean);
  const crumbs: Crumb[] = [];
  let acc = "";
  for (let i = 0; i < parts.length; i++) {
    const seg = parts[i];
    acc += "/" + seg;
    const meta = SEGMENT_LABEL[seg];
    if (meta) {
      crumbs.push({ label: meta.label, href: i < parts.length - 1 ? acc : undefined, Icon: meta.Icon });
      continue;
    }
    // Looks like an ID — try the entity label cache, otherwise show the raw segment.
    const entityLabel = entityLabels?.get(seg);
    crumbs.push({ label: entityLabel ?? seg, href: i < parts.length - 1 ? acc : undefined });
  }
  return crumbs;
}
```

- [ ] **Step 2** — Create `src/components/layout/breadcrumb-trail-provider.tsx`:

```tsx
"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";

interface Ctx {
  setEntityLabel: (id: string, label: string) => void;
  entityLabels: Map<string, string>;
}

const BreadcrumbTrailCtx = createContext<Ctx | null>(null);

export function BreadcrumbTrailProvider({ children }: { children: React.ReactNode }) {
  const [labels, setLabels] = useState<Map<string, string>>(new Map());
  const setEntityLabel = useCallback((id: string, label: string) => {
    setLabels((prev) => {
      if (prev.get(id) === label) return prev;
      const next = new Map(prev);
      next.set(id, label);
      return next;
    });
  }, []);
  const value = useMemo(() => ({ setEntityLabel, entityLabels: labels }), [labels, setEntityLabel]);
  return <BreadcrumbTrailCtx.Provider value={value}>{children}</BreadcrumbTrailCtx.Provider>;
}

export function useBreadcrumbTrail() {
  const ctx = useContext(BreadcrumbTrailCtx);
  if (!ctx) throw new Error("useBreadcrumbTrail must be used inside BreadcrumbTrailProvider");
  return ctx;
}
```

- [ ] **Step 3** — Create `src/components/layout/breadcrumb-trail.tsx`:

```tsx
"use client";

import { ChevronRight, MoreHorizontal } from "lucide-react";
import Link from "next/link";

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
  const visible = crumbs.length > MAX_VISIBLE_CRUMBS;
  const head = visible ? crumbs.slice(0, 1) : crumbs;
  const overflow = visible ? crumbs.slice(1, crumbs.length - (MAX_VISIBLE_CRUMBS - 2)) : [];
  const tail = visible ? crumbs.slice(crumbs.length - (MAX_VISIBLE_CRUMBS - 2)) : [];

  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1.5" data-testid="topbar-breadcrumb">
      {head.map((c, i) => (
        <CrumbNode key={`h-${i}`} crumb={c} isLast={!visible && i === head.length - 1} />
      ))}
      {visible && (
        <>
          <ChevronRight size={16} className="text-[#4c5258]" />
          <DropdownMenu>
            <DropdownMenuTrigger className="text-sm text-[#4c5258] hover:text-[#131416]">
              <MoreHorizontal size={16} />
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {overflow.map((c, i) => (
                <DropdownMenuItem key={`o-${i}`} asChild>
                  {c.href ? <Link href={c.href}>{c.label}</Link> : <span>{c.label}</span>}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          {tail.map((c, i) => (
            <CrumbNode key={`t-${i}`} crumb={c} isLast={i === tail.length - 1} />
          ))}
        </>
      )}
    </nav>
  );
}

function CrumbNode({ crumb, isLast }: { crumb: Crumb; isLast: boolean }) {
  const Icon = crumb.Icon;
  const label = (
    <span className={isLast ? "text-sm font-semibold text-[#131416]" : "text-sm text-[#4c5258] hover:text-[#131416]"}>
      {crumb.label}
    </span>
  );
  return (
    <>
      {!isLast && <ChevronRight size={16} className="text-[#4c5258]" />}
      <span className="flex items-center gap-1.5">
        {Icon && <Icon size={16} strokeWidth={1.75} className={isLast ? "text-[#131416]" : "text-[#4c5258]"} />}
        {crumb.href && !isLast ? <Link href={crumb.href}>{label}</Link> : label}
      </span>
    </>
  );
}
```

- [ ] **Step 4** — `npm run typecheck`. Should pass (these files don't depend on the layout yet).

- [ ] **Step 5** — Commit:

```
git add src/components/layout/breadcrumb-trail.tsx src/components/layout/breadcrumb-trail-provider.tsx src/components/layout/build-crumbs.ts
git commit -m "feat(shell): port riskhub auto-resolving breadcrumb"
```

---

### Task 6 — Build new `TopNav`

**Files:**
- Create: `src/components/layout/top-nav.tsx`
- Keep: `src/components/layout/tenant-switcher.tsx`, `src/components/layout/user-menu.tsx`, `src/components/layout/paddy-trigger.tsx`

- [ ] **Step 1** — Create `src/components/layout/top-nav.tsx`:

```tsx
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
          aria-label="Messages"
          className="relative flex size-8 items-center justify-center rounded-full hover:bg-muted transition-colors"
        >
          <Mail size={16} className="text-muted-foreground" />
        </button>
        <button
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
```

- [ ] **Step 2** — `npm run typecheck`.

- [ ] **Step 3** — Commit:

```
git add src/components/layout/top-nav.tsx
git commit -m "feat(shell): port riskhub TopNav"
```

---

### Task 7 — Re-wire `(portal)/layout.tsx` to use new shell

**Files:**
- Modify: `src/app/(portal)/layout.tsx`

- [ ] **Step 1** — Replace the existing layout body with:

```tsx
import { Suspense } from "react";

import { BreadcrumbTrailProvider } from "@/components/layout/breadcrumb-trail-provider";
import { Sidebar } from "@/components/layout/sidebar";
import { TopNav } from "@/components/layout/top-nav";
import { MobileBottomNav } from "@/components/layout/mobile-bottom-nav";
import { PaddyPanel } from "@/components/paddy/paddy-panel";
import { SessionBootstrap } from "@/components/auth/session-bootstrap";
import { AgGridLicense } from "@/components/shell/ag-grid-license";

export const dynamic = "force-dynamic";

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return (
    <SessionBootstrap>
      <AgGridLicense />
      <BreadcrumbTrailProvider>
        <div className="flex h-screen overflow-hidden bg-[#e5ebf1]">
          <Sidebar />
          <div className="flex flex-1 flex-col overflow-hidden">
            <Suspense>
              <TopNav />
            </Suspense>
            <main id="main" className="flex flex-1 flex-col overflow-hidden">
              {children}
            </main>
          </div>
        </div>
        <MobileBottomNav />
        <PaddyPanel />
      </BreadcrumbTrailProvider>
    </SessionBootstrap>
  );
}
```

- [ ] **Step 2** — Drop every `<PageHeader>` invocation from per-route `page.tsx` files (Tasks 17–30 sweep this when restructuring; for now, the simplest is to leave `<PageHeader>` rendering — it'll just stack below the new TopNav until those tasks land. Mark this as a known-temp visual issue.)

- [ ] **Step 3** — `npm run dev` and load `/horses`. The new sidebar + topnav should render. The page below will look weird until later tasks restructure.

- [ ] **Step 4** — Commit:

```
git add src/app/\(portal\)/layout.tsx
git commit -m "feat(shell): wire riskhub Sidebar + TopNav into portal layout"
```

---

### Task 8 — Delete `app-sidebar.tsx` + `page-header.tsx` (only after Tasks 17–30 finish removing every reference)

**Defer until** Phase 3 finishes, then:

- [ ] Verify no imports remain: `grep -r "app-sidebar\|PageHeader" src/`
- [ ] Delete `src/components/layout/app-sidebar.tsx` and `src/components/shell/page-header.tsx`
- [ ] Commit: `chore(shell): remove deprecated app-sidebar + page-header`

---

## Phase 2 — Module primitives

### Task 9 — `FeatureTabBar`

**Files:**
- Create: `src/components/shell/feature-tab-bar.tsx`

- [ ] **Step 1** — Create the file (verbatim port of riskhub):

```tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { LucideIcon } from "lucide-react";

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
```

- [ ] **Step 2** — Commit:

```
git add src/components/shell/feature-tab-bar.tsx
git commit -m "feat(shell): port FeatureTabBar primitive (Dashboard | Grid)"
```

---

### Task 10 — `FeatureToolbar` (search bar that stretches + actions slot)

**Files:**
- Create: `src/components/shell/feature-toolbar.tsx`

- [ ] **Step 1** — Create:

```tsx
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

export function FeatureToolbar({ search, onSearchChange, placeholder, children, className }: FeatureToolbarProps) {
  return (
    <div className={cn("flex items-center gap-2", className)} data-testid="feature-toolbar">
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
```

The key change vs current paddocpro: search container is `flex-1` only (no `max-w-md` cap, no `min-w-[280px]`). It stretches to fill available width.

- [ ] **Step 2** — Commit:

```
git add src/components/shell/feature-toolbar.tsx
git commit -m "feat(shell): port FeatureToolbar with stretching search"
```

---

### Task 11 — `StatusChipRow`

**Files:**
- Create: `src/components/shell/status-chip-row.tsx`
- Create: `src/lib/chip-ramp.ts`

- [ ] **Step 1** — Create `src/lib/chip-ramp.ts`:

```ts
export interface ChipRamp {
  pressedBg: string;
  pressedBorder: string;
  pressedDot: string;
}

export const CHIP_RAMP_FALLBACK: ChipRamp = {
  pressedBg: "#f2f5f8",
  pressedBorder: "#bdccdb",
  pressedDot: "#4c5258",
};

export const CHIP_RAMP: Record<string, ChipRamp> = {
  // Health
  healthy: { pressedBg: "#f0fdf4", pressedBorder: "#86efac", pressedDot: "#16a34a" },
  isolating: { pressedBg: "#fef2f2", pressedBorder: "#fca5a5", pressedDot: "#dc2626" },
  vet_care: { pressedBg: "#fff7ed", pressedBorder: "#fdba74", pressedDot: "#ea580c" },

  // Vacc
  current: { pressedBg: "#f0fdf4", pressedBorder: "#86efac", pressedDot: "#16a34a" },
  due_30d: { pressedBg: "#fffbeb", pressedBorder: "#fcd34d", pressedDot: "#d97706" },
  overdue: { pressedBg: "#fef2f2", pressedBorder: "#fca5a5", pressedDot: "#dc2626" },

  // Stable status
  vacant: { pressedBg: "#f0fdf4", pressedBorder: "#86efac", pressedDot: "#16a34a" },
  occupied: { pressedBg: "#eff6ff", pressedBorder: "#93c5fd", pressedDot: "#2563eb" },
  maintenance: { pressedBg: "#f5f3ff", pressedBorder: "#c4b5fd", pressedDot: "#7c3aed" },

  // Invoice
  draft: { pressedBg: "#f3f4f6", pressedBorder: "#d1d5db", pressedDot: "#4b5563" },
  sent: { pressedBg: "#eff6ff", pressedBorder: "#93c5fd", pressedDot: "#2563eb" },
  paid: { pressedBg: "#f0fdf4", pressedBorder: "#86efac", pressedDot: "#16a34a" },
  partial: { pressedBg: "#fffbeb", pressedBorder: "#fcd34d", pressedDot: "#d97706" },
  voided: { pressedBg: "#f5f5f4", pressedBorder: "#d6d3d1", pressedDot: "#78716c" },
};
```

- [ ] **Step 2** — Create `src/components/shell/status-chip-row.tsx` (port riskhub `StatusChipRow` verbatim — see the riskhub-1experience map in plan context for the exact JSX). The file is ~100 lines and is the reference's section 6.

- [ ] **Step 3** — Commit:

```
git add src/components/shell/status-chip-row.tsx src/lib/chip-ramp.ts
git commit -m "feat(shell): port StatusChipRow with ramp + overflow dropdown"
```

---

### Task 12 — `KpiCard` + `WidgetCard`

**Files:**
- Create: `src/components/shell/kpi-card.tsx`
- Create: `src/components/shell/widget-card.tsx`

- [ ] **Step 1** — Create `src/components/shell/kpi-card.tsx` (port verbatim from riskhub — see reference §4 KpiCard).

- [ ] **Step 2** — Create `src/components/shell/widget-card.tsx`:

```tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface WidgetCardProps {
  title: string;
  headerRight?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export function WidgetCard({ title, headerRight, children, className }: WidgetCardProps) {
  return (
    <Card className={cn("flex flex-col h-full", className)}>
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <CardTitle className="text-sm font-semibold">{title}</CardTitle>
        {headerRight}
      </CardHeader>
      <CardContent className="flex-1 overflow-auto">{children}</CardContent>
    </Card>
  );
}
```

- [ ] **Step 3** — Commit:

```
git add src/components/shell/kpi-card.tsx src/components/shell/widget-card.tsx
git commit -m "feat(shell): port KpiCard + WidgetCard"
```

---

### Task 13 — Rewrite `FeatureGrid` to riskhub spec

**Files:**
- Modify: `src/components/shell/feature-grid.tsx`

**Why (the user's stated grievances):**
- AG Grid should fill horizontal space → ensure parent passes `flex-1`
- No pinned columns → remove the auto-pinned `__select` column entirely; checkboxes become a non-pinned column
- No stacked-cell renderers → enforced at the *callsite*, but `FeatureGrid` no longer auto-injects the stacked horse-name cell
- Row grouping panel → enable `rowGroupPanelShow="always"`
- `sideBar` → enable for `["columns", "filters"]`
- Pagination → enable, default size 100

- [ ] **Step 1** — Replace contents:

```tsx
"use client";

import "@/lib/ag-grid-modules";

import { AgGridReact } from "ag-grid-react";
import type {
  CellClickedEvent,
  ColDef,
  GridApi,
  GridReadyEvent,
  SelectionChangedEvent,
} from "ag-grid-community";
import { useCallback, useMemo, useRef } from "react";

import { paddocproTheme } from "@/lib/ag-grid-theme";
import { cn } from "@/lib/utils";

interface FeatureGridProps<T extends { id: string }> {
  testId: string;
  rowData: T[];
  columnDefs: ColDef<T>[];
  onRowClick?: (row: T) => void;
  onSelectionChanged?: (rows: T[]) => void;
  quickFilterText?: string;
  defaultSortField?: keyof T | string;
  defaultSortDirection?: "asc" | "desc";
  emptyState?: React.ReactNode;
  className?: string;
  rowHeight?: number;
}

export function FeatureGrid<T extends { id: string }>({
  testId,
  rowData,
  columnDefs,
  onRowClick,
  onSelectionChanged,
  quickFilterText,
  defaultSortField,
  defaultSortDirection = "asc",
  emptyState,
  className,
  rowHeight = 44,
}: FeatureGridProps<T>) {
  const apiRef = useRef<GridApi<T> | null>(null);

  const onGridReady = useCallback(
    (e: GridReadyEvent<T>) => {
      apiRef.current = e.api;
      if (defaultSortField) {
        e.api.applyColumnState({
          state: [{ colId: String(defaultSortField), sort: defaultSortDirection }],
          defaultState: { sort: null },
        });
      }
    },
    [defaultSortField, defaultSortDirection],
  );

  const handleCellClicked = useCallback(
    (e: CellClickedEvent<T>) => {
      // Selection column has colId "__select"; ignore clicks on it.
      if (e.colDef.colId === "__select") return;
      if (e.data && onRowClick) onRowClick(e.data);
    },
    [onRowClick],
  );

  const handleSelectionChanged = useCallback(
    (e: SelectionChangedEvent<T>) => {
      if (onSelectionChanged) onSelectionChanged(e.api.getSelectedRows());
    },
    [onSelectionChanged],
  );

  // Inject a non-pinned checkbox selection column FIRST.
  const fullColDefs = useMemo<ColDef<T>[]>(
    () => [
      {
        colId: "__select",
        headerName: "",
        width: 44,
        checkboxSelection: true,
        headerCheckboxSelection: true,
        sortable: false,
        filter: false,
        resizable: false,
        suppressMovable: true,
      },
      ...columnDefs.map((c) => ({
        sortable: true,
        filter: "agTextColumnFilter" as const,
        enableRowGroup: true,
        ...c,
      })),
    ],
    [columnDefs],
  );

  const isEmpty = rowData.length === 0;

  return (
    <div className={cn("flex flex-1 min-h-0 flex-col", className)} data-testid={testId}>
      {isEmpty && emptyState ? (
        <div className="flex-1 flex items-center justify-center" data-testid={`${testId}-empty`}>
          {emptyState}
        </div>
      ) : (
        <AgGridReact<T>
          theme={paddocproTheme}
          rowData={rowData}
          columnDefs={fullColDefs}
          quickFilterText={quickFilterText}
          onGridReady={onGridReady}
          onCellClicked={handleCellClicked}
          onSelectionChanged={handleSelectionChanged}
          rowSelection={{ mode: "multiRow", checkboxes: true, enableClickSelection: false }}
          rowGroupPanelShow="always"
          sideBar={{
            toolPanels: ["columns", "filters"],
            defaultToolPanel: "",
          }}
          autoGroupColumnDef={{ headerName: "Group", minWidth: 200 }}
          pagination
          paginationPageSize={100}
          paginationPageSizeSelector={[25, 50, 100, 200]}
          rowHeight={rowHeight}
          headerHeight={40}
          getRowId={(p) => p.data.id}
          domLayout="normal"
          animateRows
          suppressCellFocus
          getRowClass={() => "cursor-pointer"}
        />
      )}
    </div>
  );
}
```

- [ ] **Step 2** — `npm run typecheck`. Will likely surface usages relying on `groupBy` prop (which we removed). Either keep the prop and forward it as `defaultColDef.enableRowGroup` (already done globally), or remove its callers. Patch as needed.

- [ ] **Step 3** — Commit:

```
git add src/components/shell/feature-grid.tsx
git commit -m "feat(grid): rewrite FeatureGrid to riskhub spec (groups, sideBar, pagination, no stacked auto-injection)"
```

---

### Task 14 — `DetailScaffold`

**Files:**
- Create: `src/components/shell/detail-scaffold.tsx`

- [ ] **Step 1** — Create:

```tsx
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
}

export function DetailScaffold({ title, subtitle, Icon, tabs, stickyToolbar, children }: DetailScaffoldProps) {
  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <div className="bg-[#e5ebf1] px-4 pt-4 pb-0 flex items-start gap-3 shrink-0">
        {Icon && (
          <div className="rounded-md bg-white border border-[#bdccdb] p-2">
            <Icon size={28} strokeWidth={1.5} className="text-[#202228]" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-display italic font-semibold tracking-normal text-[#131416]" data-route-title="">
            {title}
          </h1>
          {subtitle && <p className="text-sm text-[#4c5258]">{subtitle}</p>}
        </div>
      </div>
      <FeatureTabBar tabs={tabs} />
      <div className="flex flex-1 overflow-auto bg-[#e5ebf1] gap-4 p-4">{children}</div>
      {stickyToolbar}
    </div>
  );
}
```

- [ ] **Step 2** — Commit:

```
git add src/components/shell/detail-scaffold.tsx
git commit -m "feat(shell): add DetailScaffold (hero + tabs + body + toolbar)"
```

---

### Task 15 — `DetailToolbar`

**Files:**
- Create: `src/components/shell/detail-toolbar.tsx`

- [ ] **Step 1** — Create:

```tsx
import { cn } from "@/lib/utils";

interface DetailToolbarProps {
  className?: string;
  children: React.ReactNode;
  testId?: string;
}

export function DetailToolbar({ className, children, testId }: DetailToolbarProps) {
  return (
    <div
      className={cn(
        "h-16 bg-white border-t border-[#e5ebf1] px-4 py-4 flex items-center justify-end gap-2 shrink-0",
        className,
      )}
      data-testid={testId ?? "detail-toolbar"}
    >
      {children}
    </div>
  );
}
```

- [ ] **Step 2** — Commit:

```
git add src/components/shell/detail-toolbar.tsx
git commit -m "feat(shell): add DetailToolbar (h-16 bottom toolbar)"
```

---

### Task 16 — Smoke pass

- [ ] **Step 1** — `npm run dev` and visit `/horses`. The new shell should render. Page below will still render the old grid (will be fixed in Phase 3).
- [ ] **Step 2** — `npm run typecheck && npm run lint && npm run build`.
- [ ] **Step 3** — No commit; this is a verification gate.

---

## Phase 3 — Module restructure (Horses first; same pattern for the rest)

### Task 17 — Restructure `/horses` to two-tab pattern

**Files:**
- Create: `src/app/(portal)/horses/page.tsx` (Dashboard tab — overwrite existing)
- Create: `src/app/(portal)/horses/all-horses/page.tsx` (Grid tab)
- Create: `src/components/horses/horses-tabs.tsx`
- Create: `src/components/horses/horses-dashboard.tsx`
- Modify: `src/components/horses/horses-grid.tsx` (rewrite)

- [ ] **Step 1** — Create `src/components/horses/horses-tabs.tsx`:

```tsx
"use client";

import { Gauge, Sparkles } from "lucide-react";

import { FeatureTabBar } from "@/components/shell/feature-tab-bar";
import { useDataset } from "@/lib/mock/store";
import { useSession } from "@/lib/auth/current";

export function HorsesTabs() {
  const dataset = useDataset();
  const session = useSession();
  const tenantId = session?.tenantId ?? dataset.tenants[0]?.id;
  const count = dataset.horses.filter((h) => h.tenantId === tenantId && !h.archivedAt).length;
  return (
    <FeatureTabBar
      tabs={[
        { label: "Dashboard", href: "/horses", Icon: Gauge, exact: true },
        { label: "Horses", href: "/horses/all-horses", Icon: Sparkles, count },
      ]}
    />
  );
}
```

- [ ] **Step 2** — Create `src/components/horses/horses-dashboard.tsx`:

```tsx
"use client";

import { AlertTriangle, HeartPulse, Sparkles, Users } from "lucide-react";
import { useMemo } from "react";

import { KpiCard } from "@/components/shell/kpi-card";
import { WidgetCard } from "@/components/shell/widget-card";
import { useDataset } from "@/lib/mock/store";
import { useSession } from "@/lib/auth/current";

export function HorsesDashboard() {
  const dataset = useDataset();
  const session = useSession();
  const tenantId = session?.tenantId ?? dataset.tenants[0]?.id;

  const horses = useMemo(
    () => dataset.horses.filter((h) => h.tenantId === tenantId && !h.archivedAt),
    [dataset.horses, tenantId],
  );

  const isolating = horses.filter((h) => h.healthStatus === "isolating").length;
  const vetCare = horses.filter((h) => h.healthStatus === "vet_care").length;
  const owners = new Set(horses.map((h) => h.primaryOwnerId)).size;

  return (
    <div className="flex flex-1 flex-col overflow-auto bg-[#e5ebf1] px-4 pt-3 pb-3 gap-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <KpiCard label="Active horses" value={horses.length} Icon={Sparkles} variant="info" />
        <KpiCard label="Isolating" value={isolating} Icon={AlertTriangle} variant="danger" />
        <KpiCard label="Under vet care" value={vetCare} Icon={HeartPulse} variant="amber" />
        <KpiCard label="Owners" value={owners} Icon={Users} variant="neutral" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <WidgetCard title="Health status breakdown">
          <HealthBreakdownTable horses={horses} />
        </WidgetCard>
        <WidgetCard title="Livery package mix">
          <LiveryMixTable horses={horses} dataset={dataset} />
        </WidgetCard>
      </div>
    </div>
  );
}

function HealthBreakdownTable({ horses }: { horses: { healthStatus: string }[] }) {
  const counts = horses.reduce<Record<string, number>>((acc, h) => {
    acc[h.healthStatus] = (acc[h.healthStatus] ?? 0) + 1;
    return acc;
  }, {});
  return (
    <table className="w-full text-sm">
      <tbody>
        {Object.entries(counts).map(([k, v]) => (
          <tr key={k} className="border-b last:border-b-0">
            <td className="py-2 capitalize">{k.replace("_", " ")}</td>
            <td className="py-2 text-right tabular-nums">{v}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function LiveryMixTable({ horses, dataset }: { horses: { liveryPackageId: string | null }[]; dataset: ReturnType<typeof useDataset> }) {
  const counts = horses.reduce<Record<string, number>>((acc, h) => {
    const pkg = dataset.liveryPackages.find((p) => p.id === h.liveryPackageId);
    const name = pkg?.name ?? "—";
    acc[name] = (acc[name] ?? 0) + 1;
    return acc;
  }, {});
  return (
    <table className="w-full text-sm">
      <tbody>
        {Object.entries(counts).map(([k, v]) => (
          <tr key={k} className="border-b last:border-b-0">
            <td className="py-2">{k}</td>
            <td className="py-2 text-right tabular-nums">{v}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
```

The dashboard is built **from the same dataset** the grid uses (`dataset.horses` filtered to active rows for the tenant). No separate aggregation file. This satisfies the "Dashboards built from grid data" requirement.

- [ ] **Step 3** — Replace `src/app/(portal)/horses/page.tsx`:

```tsx
import { HorsesDashboard } from "@/components/horses/horses-dashboard";
import { HorsesTabs } from "@/components/horses/horses-tabs";

export default function HorsesPage() {
  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <HorsesTabs />
      <HorsesDashboard />
    </div>
  );
}
```

- [ ] **Step 4** — Create `src/app/(portal)/horses/all-horses/page.tsx`:

```tsx
import { HorsesGrid } from "@/components/horses/horses-grid";
import { HorsesTabs } from "@/components/horses/horses-tabs";

export default function HorsesGridPage() {
  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <HorsesTabs />
      <HorsesGrid />
    </div>
  );
}
```

- [ ] **Step 5** — Rewrite `src/components/horses/horses-grid.tsx` to:

   1. Use `<FeatureToolbar>` for search (full-stretch)
   2. Use `<StatusChipRow>` instead of inline `<button>` chips
   3. Drop the stacked `stableName + registeredName` cell — give each its own column
   4. Drop the `pinned: "left"` flag from the first data column
   5. Wrap grid + toolbar in a flex column that makes the grid `flex-1`
   6. New column defs:

```tsx
const columnDefs: ColDef<Row>[] = [
  { field: "stableName", headerName: "Stable name", width: 160 },
  { field: "registeredName", headerName: "Registered name", width: 200 },
  {
    field: "healthStatus",
    headerName: "Health",
    width: 140,
    cellRenderer: (p: { value?: string }) => <StatusBadge status={p.value ?? "healthy"} />,
  },
  { field: "ownerName", headerName: "Owner", width: 180 },
  { field: "stableLabel", headerName: "Stable", width: 110 },
  { field: "liveryName", headerName: "Livery", width: 200 },
  {
    field: "vaccStatus",
    headerName: "Vacc status",
    width: 140,
    cellRenderer: (p: { value?: string }) => <StatusBadge status={p.value ?? "current"} />,
  },
  { field: "breed", headerName: "Breed", width: 160 },
  { field: "sex", headerName: "Sex", width: 100 },
  {
    field: "heightHands",
    headerName: "Height",
    width: 100,
    valueFormatter: (p) => (p.value ? formatHands(p.value as number) : ""),
  },
  {
    field: "passportExpiry",
    headerName: "Passport exp.",
    width: 140,
    valueFormatter: (p) => formatDate(p.value as string),
  },
];
```

The container layout (replace the existing top-level div in `horses-grid.tsx`):

```tsx
<div className="flex flex-1 flex-col overflow-hidden">
  <div className="px-4 pt-3 flex items-center gap-2">
    <FeatureToolbar
      search={search}
      onSearchChange={setSearch}
      placeholder="Search horses, owners, stables…"
    >
      <Button size="sm" variant="outline" onClick={...}>
        <Plus className="h-3.5 w-3.5" /> Add horse
      </Button>
      {/* Bulk actions menu, refresh, filters … */}
    </FeatureToolbar>
  </div>

  <div className="px-4 pt-3 pb-0 flex flex-wrap">
    <StatusChipRow chips={CHIPS} active={activeChips} onToggle={toggleChip} />
  </div>

  <div className="flex-1 px-4 pt-3 pb-3 overflow-hidden">
    <FeatureGrid
      testId="horses-grid"
      rowData={rows}
      columnDefs={columnDefs}
      defaultSortField="stableName"
      quickFilterText={search}
      onRowClick={(row) => router.push(`/horses/${row.id}`)}
    />
  </div>
</div>
```

The "Add horse" button now opens a modal (Task 31) — for now leave the existing wiring; the modal swap happens later.

- [ ] **Step 6** — `npm run typecheck && npm run lint && npm run build`.

- [ ] **Step 7** — Commit:

```
git add src/app/\(portal\)/horses/page.tsx src/app/\(portal\)/horses/all-horses/page.tsx src/components/horses/
git commit -m "feat(horses): two-tab pattern + dashboard from grid data + grid v2"
```

---

### Tasks 18–30 — Same pattern, one module per task

For each of `clients`, `stables`, `bookings`, `tasks`, `health`, `feed-supplies`, `staff`, `documents`, `communication`, `incidents`, `visitors`, `finance`:

**Per-module steps (concrete actions, no placeholders):**

- [ ] Create `src/components/<module>/<module>-tabs.tsx` exporting `<XxxTabs>` with two tabs: `{ label: "Dashboard", href: "/<module>", exact: true }` and `{ label: "<Entity plural>", href: "/<module>/all-<entity>", count: <derived from dataset> }`.
- [ ] Create `src/components/<module>/<module>-dashboard.tsx` consuming `useDataset()` and computing aggregates **from the same filtered dataset the grid uses**. Lay out: 4 KpiCards on top row + 2–4 WidgetCards below.
- [ ] Replace `src/app/(portal)/<module>/page.tsx` with `<XxxTabs /> + <XxxDashboard />`.
- [ ] Create `src/app/(portal)/<module>/all-<entity>/page.tsx` with `<XxxTabs /> + <XxxGrid />`.
- [ ] Rewrite the existing `<module>-grid.tsx`:
  - Strip pinned-column flags
  - Strip stacked-cell renderers; split into separate columns
  - Use `<FeatureToolbar>` (stretching search)
  - Use `<StatusChipRow>` for filter chips (where applicable)
  - Wrap in flex column so grid is `flex-1`
- [ ] `npm run typecheck && npm run lint && npm run build`.
- [ ] Commit: `feat(<module>): two-tab pattern + dashboard from grid data + grid v2`.

**Module-specific notes:**

- **Health:** the existing `HealthHeatmap` becomes the Dashboard tab body (it's already a per-horse aggregated view from the dataset). The existing `HealthGrid` becomes the Grid tab. Drop the in-shell tab toggle (`HealthShell`) — the FeatureTabBar replaces it.
- **Stables:** the SVG yard map becomes a WidgetCard inside the Dashboard tab (height-constrained). The Grid tab is `StablesGrid` plain.
- **Communication:** the messaging panel becomes a WidgetCard inside the Dashboard tab. The "All threads" Grid tab lists threads.
- **Reports:** SKIP this restructure — the reports landing already works as a single page. Add a single `<FeatureTabBar tabs={[{label:"Library", href:"/reports", exact:true}]}/>` to keep visual parity but no second tab.
- **Settings:** SKIP the two-tab pattern; settings already has its own card grid.

---

### Task 30b — Update `nav.ts` route hrefs

**Files:**
- Modify: `src/lib/nav.ts`

After Phase 3, the sidebar links should still point at `/<module>` (which now opens the Dashboard tab — the correct landing per riskhub pattern). Verify each `route` in `PRIMARY_NAV` is `/<module>` (no `/all-<entity>` redirects). No code change expected if Task 4 is correct, but verify and patch.

- [ ] Verify with `grep route src/lib/nav.ts | grep -v all-`.
- [ ] If everything is `/<module>`, no commit. Otherwise patch + commit.

---

## Phase 4 — Create flows → modals

### Task 31 — `Add Horse` modal

**Files:**
- Create: `src/components/horses/add-horse-modal.tsx`
- Modify: `src/components/horses/horses-grid.tsx` (replace `Link href="/horses/new"` with modal trigger)
- Delete: `src/app/(portal)/horses/new/page.tsx` (after wiring confirms)
- Delete: `src/components/horses/add-horse-wizard.tsx` after migration (or keep code but unmount the route)

**Why:** The user explicitly said: *"Flows like 'create a new horse' should sit in a modal window, not in a full page take over."* riskhub's `CreateActionModal` is the canonical pattern.

- [ ] **Step 1** — Create `src/components/horses/add-horse-modal.tsx`:

```tsx
"use client";

import { Plus } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSession } from "@/lib/auth/current";
import { now } from "@/lib/mock/clock";
import { newId } from "@/lib/mock/id-prefixes";
import { mutate, useDataset } from "@/lib/mock/store";

const schema = z.object({
  stableName: z.string().min(1, "Stable name required"),
  registeredName: z.string().min(1, "Registered name required"),
  breed: z.string().min(1, "Breed required"),
  sex: z.enum(["mare", "gelding", "stallion", "colt", "filly"]),
  colour: z.string().min(1, "Colour required"),
  heightHands: z.string().regex(/^[0-9]{1,2}(\.[0-9])?$/, "e.g. 16.2"),
  microchipNumber: z.string().min(15, "15-digit microchip"),
  primaryOwnerId: z.string().min(1, "Owner required"),
});

type Form = z.infer<typeof schema>;

export function AddHorseModal({ trigger }: { trigger?: React.ReactNode }) {
  const dataset = useDataset();
  const session = useSession();
  const tenantId = session?.tenantId ?? dataset.tenants[0]?.id;
  const [open, setOpen] = useState(false);

  const form = useForm<Form>({ resolver: zodResolver(schema) });

  const owners = dataset.clients.filter((c) => c.tenantId === tenantId);

  async function onSubmit(data: Form) {
    await mutate((d) => {
      d.horses.unshift({
        id: newId("horse", `${data.stableName}-${Date.now()}`),
        tenantId: tenantId!,
        createdAt: now().toISOString(),
        updatedAt: now().toISOString(),
        archivedAt: null,
        stableName: data.stableName,
        registeredName: data.registeredName,
        breed: data.breed,
        sex: data.sex,
        colour: data.colour,
        markings: null,
        heightHands: parseFloat(data.heightHands),
        dateOfBirth: now().toISOString(),
        microchipNumber: data.microchipNumber,
        passportNumber: "",
        passportExpiry: now().toISOString(),
        primaryOwnerId: data.primaryOwnerId,
        currentStableId: null,
        liveryPackageId: null,
        liveryStartDate: now().toISOString(),
        beddingType: "straw",
        feedPlanId: null,
        insuranceProvider: null,
        insurancePolicyNumber: null,
        insuranceExpiry: null,
        healthStatus: "healthy",
      });
    });
    toast.success(`${data.stableName} added`);
    setOpen(false);
    form.reset();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          trigger ?? (
            <Button size="sm" data-testid="horses-grid-add">
              <Plus size={14} /> Add horse
            </Button>
          )
        }
      />
      <DialogContent className="max-w-[600px]" data-testid="dialog-add-horse">
        <DialogHeader>
          <DialogTitle>Add horse</DialogTitle>
          <DialogDescription>The basics — full profile is editable later.</DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Stable name" id="stableName" error={form.formState.errors.stableName?.message}>
              <Input id="stableName" {...form.register("stableName")} />
            </Field>
            <Field label="Registered name" id="registeredName" error={form.formState.errors.registeredName?.message}>
              <Input id="registeredName" {...form.register("registeredName")} />
            </Field>
            <Field label="Breed" id="breed" error={form.formState.errors.breed?.message}>
              <Input id="breed" {...form.register("breed")} />
            </Field>
            <Field label="Sex" id="sex" error={form.formState.errors.sex?.message}>
              <Select onValueChange={(v) => form.setValue("sex", v as Form["sex"])}>
                <SelectTrigger id="sex"><SelectValue placeholder="Select…" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="mare">Mare</SelectItem>
                  <SelectItem value="gelding">Gelding</SelectItem>
                  <SelectItem value="stallion">Stallion</SelectItem>
                  <SelectItem value="colt">Colt</SelectItem>
                  <SelectItem value="filly">Filly</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <Field label="Colour" id="colour" error={form.formState.errors.colour?.message}>
              <Input id="colour" {...form.register("colour")} />
            </Field>
            <Field label="Height (hands)" id="heightHands" error={form.formState.errors.heightHands?.message}>
              <Input id="heightHands" {...form.register("heightHands")} placeholder="16.2" />
            </Field>
            <Field label="Microchip" id="microchipNumber" error={form.formState.errors.microchipNumber?.message}>
              <Input id="microchipNumber" {...form.register("microchipNumber")} placeholder="985 …" />
            </Field>
            <Field label="Primary owner" id="primaryOwnerId" error={form.formState.errors.primaryOwnerId?.message}>
              <Select onValueChange={(v) => form.setValue("primaryOwnerId", v)}>
                <SelectTrigger id="primaryOwnerId"><SelectValue placeholder="Select owner…" /></SelectTrigger>
                <SelectContent>
                  {owners.map((c) => {
                    const u = dataset.users.find((u) => u.id === c.userAccountId);
                    return (
                      <SelectItem key={c.id} value={c.id}>
                        {u ? `${u.firstName} ${u.lastName}` : c.id}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </Field>
          </div>

          <DialogFooter>
            <Button variant="outline" type="button" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={form.formState.isSubmitting} data-testid="dialog-add-horse-submit">
              Add horse
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function Field({ label, id, error, children }: { label: string; id: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
```

- [ ] **Step 2** — In `horses-grid.tsx`, replace the existing "Add horse" link with `<AddHorseModal />`. Remove the import for the wizard route.

- [ ] **Step 3** — Delete `src/app/(portal)/horses/new/page.tsx` and the wizard-only file `src/components/horses/add-horse-wizard.tsx` (only after confirming the modal works end-to-end).

- [ ] **Step 4** — Commit:

```
git add src/components/horses/add-horse-modal.tsx src/components/horses/horses-grid.tsx
git rm src/app/\(portal\)/horses/new/page.tsx src/components/horses/add-horse-wizard.tsx
git commit -m "feat(horses): convert Add Horse from full-page wizard to modal"
```

---

### Task 32 — Audit other create flows; convert any full-page ones to modals

- [ ] `grep -r "Wizard" src/components/` to find any other multi-step full-page flows.
- [ ] For each (likely none — Add Horse was the only one), apply the Task 31 pattern.
- [ ] Commit each conversion separately.

---

## Phase 5 — Detail page reskin

### Task 33 — Migrate `horse-profile.tsx` to `DetailScaffold` + `DetailToolbar`

**Files:**
- Modify: `src/components/horses/horse-profile.tsx`

- [ ] **Step 1** — Wrap the body in `<DetailScaffold title={...} subtitle={...} Icon={Sparkles} tabs={[...]}>` and place the existing `<TabsContent>` panels as children of `DetailScaffold`. The tabs become `FeatureTabBar` items via DetailScaffold; remove the bespoke `<Tabs>` wrapper.

- [ ] **Step 2** — Replace the bespoke sticky toolbar with `<DetailToolbar>` (h-16 white border-t, right-aligned CTAs):

```tsx
<DetailToolbar testId="horse-profile-toolbar">
  <EditHorseDialog horse={horse} />
  <Button variant="outline" size="sm">
    <Move size={15} /> Move
  </Button>
  <MarkIsolatingDialog horseId={horse.id} horseName={horse.stableName} />
  <ArchiveHorseDialog horse={horse} />
  <Button
    variant="outline"
    size="sm"
    onClick={() => window.dispatchEvent(new CustomEvent("paddy:toggle"))}
  >
    <Sparkles size={15} /> Ask Paddy
  </Button>
  <LogHealthEventDialog horseId={horse.id} horseName={horse.stableName} />
</DetailToolbar>
```

- [ ] **Step 3** — Restore the route-title hook by passing `data-route-title=""` on the `<h1>` inside DetailScaffold (already done if we use the scaffold's title).

- [ ] **Step 4** — Commit:

```
git add src/components/horses/horse-profile.tsx
git commit -m "feat(horse-profile): adopt DetailScaffold + DetailToolbar"
```

---

### Task 34 — Audit other detail surfaces

- [ ] Detail sheets (`stable-sheet-shell.tsx`, finance invoice sheet, etc.) — keep as sheets, but verify their internal toolbar uses `<DetailToolbar>` styling **inside** the sheet body. Tweak each.
- [ ] Commit per file: `feat(<module>): align detail sheet toolbar with DetailToolbar spacing`.

---

## Phase 6 — Tests

### Task 35 — Repair Playwright tests against the new structure

**Files:** every `tests/e2e/*.spec.ts` that references the old route shape.

- [ ] **Step 1** — Sweep:
  - `/horses` → still valid (now Dashboard); to reach the grid use `/horses/all-horses`.
  - `/finance` → `/finance/all-invoices` for grid behaviour.
  - Same for every other module.
- [ ] **Step 2** — Update selectors that referenced `data-testid="horses-grid"` etc. — these still exist on the grid component but only render on the grid sub-route now.
- [ ] **Step 3** — Add a new spec `tests/e2e/two-tab.spec.ts` asserting that for each module, both tabs render and clicking the entity tab routes to `/<module>/all-<entity>`.
- [ ] **Step 4** — Add a new spec `tests/e2e/sidebar.spec.ts` asserting:
  - Sidebar has 15 primary entries
  - Click "Horses" navigates to `/horses` (Dashboard)
  - Settings is collapsible (group)
- [ ] **Step 5** — Update `tests/e2e/grids.spec.ts` config:
  ```ts
  const GRIDS: Cfg[] = [
    { route: "/clients/all-clients", testId: "clients-grid" },
    { route: "/stables/all-stables", testId: "stables-grid" },
    { route: "/bookings/all-bookings", testId: "bookings-grid" },
    { route: "/tasks/all-tasks", testId: "tasks-grid" },
    { route: "/health/all-events", testId: "health-grid" },
    { route: "/finance/all-invoices", testId: "finance-grid" },
  ];
  ```
- [ ] **Step 6** — Run full regression: `npm run test:e2e`. Fix per-spec breakage; the most common will be missing chips (`chip-horses-isolating` etc.) since `StatusChipRow` uses different testids — update tests to `data-testid="chip-<status>"` or whatever the new component emits.
- [ ] **Step 7** — Run `npm run lint && npm run typecheck && npm run build`.
- [ ] **Step 8** — Commit:

```
git add tests/e2e/
git commit -m "test(e2e): repair regression suite for two-tab module structure"
```

---

## Verification (end of plan)

After every task above is checked off:

1. **Visual diff** — run paddocpro at `localhost:3030` and riskhub-1experience at its dev port side by side. Compare:
   - Sidebar width, item spacing, active-tile colour
   - Top bar height, breadcrumb chevrons, right-side avatar tile
   - Grid: row height, header weight, no pinned column, no stacked cells, sideBar visible, pagination strip, status chips above grid
   - Detail page: hero block + tabs + h-16 white toolbar pinned to bottom
2. **Tests:** `npm run test:e2e` — full suite green.
3. **Build:** `npm run build` — clean.
4. **User walkthrough:** demo `/horses` → click "Horses" tab → grid renders with chips + stretching search → click row → horse profile with toolbar at the bottom → click "Add horse" in grid toolbar → modal opens (not a route).

---

## Out of scope (explicit)

- Dark mode (riskhub doesn't ship it; we drop our previous warm-dark variant).
- Settings restructure (Settings keeps its current card grid).
- Reports restructure (single page kept).
- Mobile bottom-nav (kept as-is — the new sidebar is desktop-first; mobile review is a follow-up plan).
- Test fixtures for threads (the messaging spec already conditional-skips when no threads exist).

---

## Self-review (per writing-plans skill)

**1. Spec coverage:** Every grievance from the user's message maps to a task:
- "shell/navigation not the same" → Tasks 4, 7
- "each nav item should have 2 tabs" → Task 9 + Tasks 17–30
- "dashboards built from grid data" → Task 12 + Tasks 17–30 (each dashboard imports the same `useDataset` filter)
- "AG grid no row grouping or chips, search doesn't stretch" → Tasks 10, 11, 13
- "create a new horse should be a modal" → Task 31
- "detail pages reserved for entity detail" → Tasks 31 (remove `/horses/new`), 33
- "CTAs in a toolbar" → Task 15 + Task 33
- "spacing/padding/strokes/theming based on 1experience" → Tasks 1, 2, 13
- "navigation padding from each nav item" → Task 4 (NavItem `py-0.5`, `pl-2`/`pl-6` rules)
- "breadcrumbs as in 1experience" → Tasks 5, 6
- "AG grids should span full width" → Task 13 (grid is `flex-1` inside flex-column wrapper)
- "no pinned columns" → Task 13 (`__select` column NOT pinned; callsites strip pinned-left flags)
- "no stacked values" → Task 13 + Task 17 (column defs split horse-name into two columns)

**2. Placeholder scan:** No "TBD", no "fill in", no "similar to Task N". Every code block is concrete.

**3. Type consistency:** `BreadcrumbTrailProvider` exposes `setEntityLabel` + `entityLabels` — both used in `TopNav`. `Sidebar` consumes `PRIMARY_NAV` + `SETTINGS_NAV` — both exported from `nav.ts`. `FeatureTabBar` accepts `tabs: Tab[]` — same shape used by `HorsesTabs` and `DetailScaffold`. `FeatureGrid` removed the `groupBy` prop; callsites that used it are caught by `npm run typecheck` after Task 13.

---

## Execution choice

**Plan complete and saved to `/Users/gianni/Desktop/paddocpro-app/docs/plans/2026-04-25-riskhub-realignment.md`. Two execution options:**

**1. Subagent-Driven (recommended)** — I dispatch a fresh subagent per task, review its diff between tasks. Best for a 35-task realignment because each task is small enough to fit in a clean context, and a stale-context bug in Task 12 won't poison Task 23.

**2. Inline Execution** — I execute every task in this session, committing after each. Faster turnaround but the conversation context grows heavy and visual mistakes accumulate without explicit review steps.

**Which approach do you want?**
