# PaddocPro — App Repo Guide

This is the **implementation** repo for PaddocPro. The plan suite (PRD, design system, data model, fitness checklists, audit closure) lives at `/Users/gianni/Desktop/paddocpro/` — that's the source of truth for every architectural and visual decision.

## Pre-flight (read before touching code)

1. **`/Users/gianni/Desktop/paddocpro/plans/00-master-plan.md`** — orchestrates everything. Phases, sequencing, freeze rules.
2. **`/Users/gianni/Desktop/paddocpro/design/brand-tokens.md`** — palette, typography, iconography. Already implemented in `src/app/globals.css`.
3. **`/Users/gianni/Desktop/paddocpro/design/ux-principles.md`** — 10 rules every screen follows. Diff against `/horses` (gold standard) when anything looks off.
4. **`/Users/gianni/Desktop/paddocpro/design/fitness-checklists.md`** — the conformance gate. Every grid / sheet / dialog / wizard MUST pass its `@conformance:*` checklist before being marked done.
5. **`/Users/gianni/Desktop/paddocpro/design/selectors.md`** — `data-testid` convention. Lint-enforced.
6. **`/Users/gianni/Desktop/paddocpro/design/states.md`** — empty / loading / error / offline / unauthorised UX patterns.
7. **`/Users/gianni/Desktop/paddocpro/design/a11y.md`** — keyboard / focus / ARIA baseline.
8. **`/Users/gianni/Desktop/paddocpro/design/errors-and-formatting.md`** — error dictionary, dates, currency, British copy.
9. **`/Users/gianni/Desktop/paddocpro/design/rbac-catalogue.md`** — capability list driving `useCan` and `<RoleGate>`.
10. **`/Users/gianni/Desktop/paddocpro/data-model/entities.md`** + **`relationships.md`** + **`state-machines.md`** + **`notifications-triggers.md`** — the data graph contract.
11. **`/Users/gianni/Desktop/paddocpro/AUDIT-CLOSURE.md`** — every audit finding mapped to its fix + test.
12. **`/Users/gianni/Desktop/paddocpro/plans/24-test-strategy.md`** — Playwright + agent-browser test contract.

## What this app is

A clickable prototype of a livery yard management web application. Mock data only — no real backend. Mirrors the architecture, design language, UX rules, and component library of `riskhub-1experience`, adapted for the equestrian sector.

## Tech stack

- **Framework:** Next.js 16 (App Router), React 19, TypeScript strict.
- **Styling:** Tailwind CSS v4 (single `globals.css` with `@theme inline` + design tokens), shadcn/ui (Radix-based, `base-nova` style).
- **Grids:** AG Grid Community + Enterprise (theme via `src/lib/ag-grid-theme.ts`).
- **Charts:** recharts (with shadcn chart wrapper where helpful).
- **Forms:** `react-hook-form` + `zod`.
- **Date/time:** `date-fns` + `date-fns-tz`. Always read "now" via `src/lib/mock/clock.ts` (never `new Date()` directly — mock clock is freezable for tests).
- **State:** in-memory mock store with serialised mutation queue (`src/lib/mock/store.ts`).
- **Toasts:** `sonner`.
- **Icons:** `lucide-react` + custom equestrian SVGs at `src/components/icons/`.
- **Tests:** Playwright + axe-core.
- **Mock generation:** `@faker-js/faker` with fixed seed `20260425`.

## ⚠ Next.js 16 has breaking changes

This repo runs **Next.js 16.x** (Turbopack default). Some APIs differ from earlier versions. Before writing any code that uses Next.js APIs (fonts, metadata, images, route handlers, etc.), check the relevant doc in `node_modules/next/dist/docs/01-app/`. Heed deprecation notices.

## Conventions

- **Branch & PR per plan:** `git checkout -b plan/<NN>-<slug>`.
- **Per-PR test gate:** `npm run test:e2e -- --grep @e2e:<module> --grep @conformance` must pass before merge.
- **No `any`, no `// @ts-ignore`,** no untyped mock data.
- **Shared shell first:** if it might recur, put it under `src/components/shell/` (frozen after Plan 03 — extensions go via Plan-03 hot-fix PRs only).
- **British English** throughout (`grey`, `colour`, `licence`, `paddock`).
- **Realistic mock data** (see `design/ux-principles.md` Rule 7 — no "John Doe", no "Test Horse 1").
- **Routing:** in-app routes under `src/app/(portal)/<feature>/...`. Detail-view URL state: `/<feature>?id=<entityId>` for sheets; `/<feature>/<id>` for full-page profiles (only Horse, Client, Stable, Staff).

## Port

Dev server runs on **3030** (`npm run dev`). All Playwright specs target `http://localhost:3030`.

## Status

Plan 01 (bootstrap) complete. Next: Plan 02 (data models + mock factories).
