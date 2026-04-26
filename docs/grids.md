# PaddocPro grid catalogue

A registry of every AG Grid surface in the app. Anything new must be added here when it ships.

All grids consume the canonical `<FeatureGrid>` primitive at `src/components/shell/feature-grid.tsx`, which wraps AG Grid Enterprise with the riskhub-1experience theme + row-grouping panel + side panel + pagination + auto-fit-to-width sizing.

The standard grid surface looks like this:

```
┌─────────────────────────────────────────────────────────────────┐
│ [Search          ] [⟳] [Filters] [Actions ▾]                    │ ← FeatureToolbar (full width)
├─────────────────────────────────────────────────────────────────┤
│ ● Chip-1 (3)   ● Chip-2 (1)   ● Chip-3 (0)                      │ ← StatusChipRow (no "All" chip)
├─────────────────────────────────────────────────────────────────┤
│ Drag here to set row groups                                      │ ← AG Grid row-group panel
├─────────────────────────────────────────────────────────────────┤
│ ☐  Col 1 ↑    Col 2     Col 3     Col 4     Col 5               │
│ ☐  …                                                            │
│ ☐  …                                                            │
└─────────────────────────────────────────────────────────────────┘
  Page Size 100 ▾   1–24 of 24   <  >                              ← AG pagination strip
```

## Module grids (driven by `useDataset()`)

These render at `/<module>/all-<entity>` (the **Grid tab** of each two-tab module — see `docs/plans/2026-04-25-riskhub-realignment.md` Phase 3).

| Module | File | Route | Primary action | Filter chips | Notes |
|---|---|---|---|---|---|
| Horses | `src/components/horses/horses-grid.tsx` | `/horses/all-horses` | Add horse (modal) | Isolating · Vet care · Vacc overdue · Passport expiring | Row click → `/horses/[id]` |
| Clients | `src/components/clients/clients-grid.tsx` | `/clients/all-clients` | Add client (toast) | Outstanding · Portal active | Sheet detail (still uses `useIdParam`) |
| Stables | `src/components/stables/stables-grid.tsx` | `/stables/all-stables` | Add stable (toast) | Vacant · Occupied · Maintenance · Isolation | Row click → `/stables/[id]` (full page) |
| Bookings | `src/components/bookings/bookings-grid.tsx` | `/bookings/all-bookings` | New booking (modal) | Upcoming · Past · Cancelled · By type chips | Sheet detail |
| Tasks | `src/components/tasks/tasks-grid.tsx` | `/tasks/all-tasks` | Add task (toast) | Due today · Overdue · Pending · In progress · Completed | Row sheet detail · Action column with inline Complete CTA |
| Health | `src/components/health/health-grid.tsx` | `/health/all-events` | Log event (toast) | Vaccination · Worming · Farrier · Dental | All health-event records (heatmap is in Dashboard tab) |
| Feed & Supplies | `src/components/feed-supplies/feed-grid.tsx` | `/feed-supplies/all-supplies` | Add item (toast) | Low stock · Out of stock · Feed · Hay · Bedding | |
| Staff | `src/components/staff/staff-grid.tsx` | `/staff/all-staff` | Add user (toast) | On shift · Off · By role | |
| Documents | `src/components/documents/documents-grid.tsx` | `/documents/all-documents` | Upload (toast) | Expiring · Expired · By category | |
| Communication threads | `src/components/communication/threads-grid.tsx` | `/communication/all-threads` | New broadcast (modal) | Unread · Broadcasts · Direct | |
| Communication notifications | `src/components/communication/notifications-grid.tsx` | `/communication/notifications` | – | – | Single grid, no tabs (notifications log) |
| Incidents | `src/components/incidents/incidents-grid.tsx` | `/incidents/all-incidents` | Log incident (toast) | Open · Critical · Closed | |
| Visitors | `src/components/visitors/visitors-grid.tsx` | `/visitors/all-visitors` | Sign in visitor (modal) | On site · Expected · Departed | |
| Finance | `src/components/finance/finance-grid.tsx` | `/finance/all-invoices` | Run monthly invoicing (modal) | Outstanding · Overdue · Paid · Draft | Sheet detail with `RecordPaymentDialog` in toolbar |

## Settings grids

| Surface | File | Route | Notes |
|---|---|---|---|
| Users & roles | `src/components/settings/users-grid.tsx` | `/settings/users` | Tenant users with role + last seen |
| Audit log | `src/components/settings/audit-log-grid.tsx` | `/settings/audit-log` | Append-only mutation history |

## In-detail-page grids

These render *inside* a detail page (entity profile), scoped to that entity. They use AG Grid where appropriate but are typically smaller / simpler than module grids.

Currently no detail page renders a full `<FeatureGrid>`. Tab bodies use simple `<table>` markup for short lists (e.g. horse profile's Health / Bookings / Documents / Charges tabs). When any of those grow beyond ~25 rows or need column reordering, migrate to FeatureGrid + add an entry here.

## Authoring rules

When adding a new grid:

1. **Always use `<FeatureGrid>`** — never call `<AgGridReact>` directly. The wrapper handles theme, row grouping, side panel, pagination, auto-sizing.
2. **No pinned columns.** AG Grid's row-selection column is auto-injected non-pinned; never re-add `pinned: "left"` to data columns.
3. **No stacked-cell renderers.** Every data point gets its own column. If you have an avatar + name + email pattern, that's three columns.
4. **Filter chips:** start with no chip selected (empty `Set`). Don't add an "All" chip — empty filter = show everything. Slugs map into `src/lib/chip-ramp.ts` for the colour ramp.
5. **Toolbar:** `<FeatureToolbar>` (search) + `<GridRefreshButton>` + `<GridFilterButton>` + `<FeatureActionsMenu items={...}>`. The Actions dropdown holds every grid-level action (Add X, Export CSV, Bulk delete, etc.). Always include "Export CSV" as the last item using `gridApi?.exportDataAsCsv({ fileName: "<entity>.csv" })`.
6. **Container:** wrap in `<div className="flex flex-1 flex-col overflow-hidden">` so the grid fills the tab body. The `<FeatureGrid>` itself is `flex flex-1 min-h-0 flex-col`.
7. **Test IDs:** `<module>-grid` on the FeatureGrid; `<module>-grid-chip-row` on the StatusChipRow wrapper; per-action testids on each `ActionItem.testId`.
8. **Add an entry to this file.**

## Detail page conventions

Detail pages use `<DetailScaffold>` (hero + tabs + body + sticky bottom toolbar) at `src/components/shell/detail-scaffold.tsx`. In-page tab switching uses `<DetailTabBar>` (riskhub-style underlined tabs) at `src/components/shell/detail-tab-bar.tsx`. The bottom `<DetailToolbar>` at `src/components/shell/detail-toolbar.tsx` follows the Primary CTA + 1 Secondary + Ellipsis pattern; all secondary actions (Edit, Move, Mark X, Archive…) go into the ellipsis dropdown.

Currently:
- `/horses/[id]` — `src/components/horses/horse-profile.tsx`
- `/stables/[id]` — `src/components/stables/stable-profile.tsx`

Other entities still use right-side `<DetailSheet>` (e.g. invoices, clients). Migrate to full detail pages incrementally when the data justifies it.
