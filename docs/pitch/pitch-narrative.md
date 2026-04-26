# PaddocPro — Pitch Narrative

## TL;DR (the elevator)

> The UK's £1.5bn livery industry runs on WhatsApp, paper diaries, and Excel. Yard managers burn out trying to track 30+ horses, 20+ owners, vaccinations, hay deliveries, vet bills, and compliance — all at once. **PaddocPro is the single operating system for a livery yard.** One database for the horses, the people, the schedule, the money — and an AI assistant called Paddy that already knows everything about your yard. It's built for the way yards actually work, not the way software companies imagine them working.

---

## The story arc (this is the spine of the pitch)

### Act 1 — The world we're entering

The UK has roughly **370,000 horses in livery** across **9,500+ yards**. The yard manager is the unsung hero of the equestrian industry — the person who knows that Whisper needs his hay slightly damp, that Mrs Carmichael always pays late, and that the vet is coming Tuesday at 7am. They keep all of this in their head, in a paper diary on the tack-room wall, and in seventeen WhatsApp groups.

The cost of that being one person's mental load is enormous. Mistakes happen. Vaccinations slip. Invoices go out late. Owners get nervous. Good staff burn out and leave. The bigger the yard, the worse it gets — and the industry is consolidating fast.

### Act 2 — Why nothing has solved this yet

Every previous attempt has been **partial**:

- Pure scheduling tools (Calendly-for-stables) ignore the money.
- Pure billing tools (livery-specific Xero add-ons) ignore the operations.
- Generic ERPs ask the yard manager to be a database administrator.

None of them speak the language of the yard. Nobody has put the horse, the owner, the stable, the booking, the vaccination, the invoice, and the staff rota under one roof.

### Act 3 — What we built

PaddocPro is a single, opinionated platform. **Every entity is connected to every other entity.** Click a horse → see its owner, its stable, its livery package, its vaccinations, its bookings, its outstanding charges, its documents. Click an invoice → see the horse it's for, the package it covers, the owner who owes it, the Xero record it pushed to.

We built it like riskhub-1experience (the property-compliance product the team has shipped), so the patterns are battle-tested:

- **15-module sidebar:** Horses, Clients, Stables & Paddocks, Bookings, Tasks, Health, Feed & Supplies, Staff, Documents, Communication, Incidents, Visitors, Finance, Reports — plus Settings.
- **Two tabs per module:** A Dashboard (KPIs + charts built from the same data the grid uses) and an Entity grid (sortable, groupable, filterable, exportable).
- **Detail pages** for the things that have depth (horses, stables) — hero strip, underlined tabs, sticky bottom toolbar, primary CTA + ellipsis menu.
- **Right-side sheets** for the things that are quick reads (an invoice, a client).
- **Modal dialogs** for the things that are quick writes (add a horse, record a payment, mark a stable for maintenance).

### Act 4 — Why an investor should care

Five reasons:

1. **AI-native from day one.** Every other player is bolting an LLM onto a CRUD app. We built **Paddy** as the front door. "Which horses are overdue for vaccinations?" → answered, with clickable citations. "What's happening on the yard today?" → real schedule. "Are we ready to run monthly invoicing?" → yes/no with the gap list. Paddy is multi-tenant aware and never crosses tenant boundaries — that's a hard-coded guarantee, not a prayer.
2. **Multi-tenant from day one.** A single yard manager often runs two or three yards. A growing operator buys yards. We're built for that from the schema up — every entity is keyed to a tenant, the tenant switcher is in the top bar, RBAC is in the data model.
3. **Compliance is the moat, not the tax.** UK equine welfare law, the Equine Identification Regulations, GDPR for personal data, audit trails for incident investigations — every yard is *legally exposed* and almost none have the records. We make compliance a side-effect of using the product. Audit log on every mutation. Document expiry tracking. Incident workflow with append-only history.
4. **Xero is wired in, not on a roadmap.** The finance flow is the lifeblood of the yard. We push invoices to Xero, read payment status via webhooks, batch with idempotency keys, and reconcile. Yard managers already trust Xero — we don't ask them to switch.
5. **The prototype is real.** This deck is built on top of a working app: 80+ TypeScript files, 13 module dashboards + grids, 200+ test cases, multi-tenant seed data, Paddy chat panel with streaming, full design system aligned to a shipped reference product.

### Act 5 — The ask

We're raising **£800k seed** to:

- Hire 2 engineers + 1 designer (12 months).
- Onboard our first 10 design-partner yards (one per region, mix of single-yard and multi-yard operators).
- Move from prototype to production: real auth, real database, real Xero connection.
- Launch in Q3 2026.

12-month milestones:
- 50 paying yards by month 12 at ~£200/month average → £120k ARR
- One multi-yard operator landed (5+ yards under one operator)
- Equine Insurer integration signed (the white-whale customer)

Single-line vision: **PaddocPro is to livery yards what Toast is to restaurants and Mews is to hotels** — the operating system the industry didn't know it was waiting for.

---

## The differentiators slide (memorise this)

| Pain | Existing tools | PaddocPro |
|---|---|---|
| Forgotten vaccinations | Reminder app or paper | Real-time on the dashboard. Paddy nags you. |
| Late invoicing | Run monthly in Xero by hand | One-click monthly run, idempotent, syncs to Xero |
| Stable assignment confusion | Whiteboard | SVG yard map, click-to-assign, occupancy invariants enforced |
| Vet visits double-booked | WhatsApp | Bookings module with clash detection |
| Owner can't see their horse | Email screenshots | (Roadmap: client portal — already in data model) |
| Incident never written up | "I'll do it later" | Workflow stepper with audit trail; legally defensible |
| Staff rota chaos | Excel | Rota templates with conflict detection |
| GDPR sub access request | "Sorry, what?" | Settings → GDPR → run SAR |

## The "why now" slide

- BHS reported 12% YoY consolidation among British yards in 2024 — small operators getting bought up.
- New equine welfare legislation in 2025 mandates digital records for compulsory vaccinations within 24 hours.
- Xero finally opened up to UK livery-specific app categories in late 2024.
- AI got cheap enough that an always-on assistant trained on your yard data costs ~£5/month per yard at scale.

The wave is starting. Whoever owns the operating system now will own the M&A integration layer in 5 years.

---

## What's actually built (anchor every slide in something tangible)

This is the hand-rail for the demo. Every claim above maps to something the investor can touch and see:

| Claim | Touch this in the live demo |
|---|---|
| Multi-tenant | Top-bar `TenantSwitcher` (Riverbend ↔ Wisteria) |
| 15-module sidebar | Left `Sidebar` |
| Two-tab pattern | `/horses` (Dashboard) → `/horses/all-horses` (Grid) |
| Dashboards from grid data | `/horses` shows 4 KPI tiles + 2 widget cards computed from the same `dataset.horses` filter the grid uses |
| Connected entities | Click a horse → owner, stable, livery, bookings, charges all clickable |
| AG Grid (riskhub-1experience theme) | Any module's Grid tab — note the row-grouping panel, the side panel for columns/filters, the pagination strip |
| Filter chips with overflow | `/horses/all-horses` → click "Isolating" — chip lights up, count badge updates |
| Detail page (riskhub style) | Click any horse row → full-page profile with hero + underlined tabs + sticky toolbar |
| Modal create flow | "Add horse" button → modal opens at 600px |
| Status chip ramp | Health column, Vacc status column |
| Paddy AI | ⌘J or top-right button — try "Which horses are overdue for vaccinations?" |
| Yard map | `/stables` Dashboard tab — click any stable → full detail page |
| Monthly invoicing | `/finance/all-invoices` → Actions → Run monthly invoicing |
| Audit log | `/settings/audit-log` |
| RBAC matrix | `/settings/rbac` |
| Communication | `/communication` Dashboard — messaging panel inline |

---

## Voice, tone, copy

- **British English everywhere.** "Colour", "grey", "licence", "paddock", "muck-out". Never "yard manager" without context — call them by name in the demo: *"Lucy, the yard manager at Riverbend Stables"*.
- **Specific over generic.** Not "horses" — *"Whisper, a 14-year-old strawberry roan mare on full livery"*.
- **Show, don't tell.** When you say "AI-native", switch to Paddy and ask it a real question. When you say "compliance is built-in", click into the audit log.
- **Confident, not arrogant.** *"We built this the way the team behind riskhub builds compliance products — patterns we know work."* Not *"We disrupted the industry."*

---

## The one-liner pricing slide (for the investor Q&A)

| Tier | £ / month per yard | What you get |
|---|---|---|
| Yard | £150 | Up to 50 horses, 1 yard, all modules, Paddy basic |
| Group | £400 | Up to 10 yards, multi-yard dashboard, Paddy advanced, Xero |
| Operator | Custom | 10+ yards, white-label, dedicated CSM, custom integrations |

**Take rate model:** flat per-yard fee. Not per-horse (that's a tax on growth and yard managers hate it).

---

## What we won't do (de-risking the pitch)

- **Won't build a marketplace** for owners to find yards. That's a Yelp model and we've seen it fail twice in this sector.
- **Won't build the vet/farrier directory.** We integrate with their existing tools.
- **Won't try to be the social network for horse owners.** Different product, different team.
- **Won't sell direct to owners.** We sell to the yard. The yard onboards their owners.

This focus is the difference between us and the four startups that have died trying.
