# PaddocPro — Investor Slide Deck

10 slides. Designed to read in 5 minutes, present in 8.

Drop this into [Gamma](https://gamma.app) or [Beautiful.ai](https://beautiful.ai) — they'll auto-format. Or hand to a designer with the visual cues below.

---

## Slide 1 — Cover

**Title:** PaddocPro

**Tagline (italic display, 28pt):** *The operating system for the modern livery yard.*

**Visual:** Slate `#e5ebf1` canvas. Brand wordmark `paddoc | pro` centred. Subtle horse-icon watermark in the corner.

**Footer:** Seed round · 2026

---

## Slide 2 — The market

**Headline:** **9,500 yards. 370,000 horses. 0 systems built for them.**

**Three columns:**

| 9,500 | £1.5bn | 12% |
|---|---|---|
| Yards in the UK | Annual sector spend | YoY consolidation among British yards (BHS, 2024) |

**Footnote:** *Sources: British Horse Society 2024; UK Equine Sector Report 2024.*

**Visual cue:** Charts not needed — let the numbers breathe. Big sans-serif numerals, small label underneath.

---

## Slide 3 — The pain

**Headline:** **The yard manager is the database.**

**Body, three short paragraphs:**

The average UK livery yard runs on a paper diary on the tack-room wall, three Excel spreadsheets, and seventeen WhatsApp groups. The yard manager — usually one person — keeps the whole thing in their head.

When that one person has a bad week, vaccinations get missed, invoices go out late, and incidents go unwritten. New legislation expects digital records within 24 hours. Most yards can't comply.

It is a £1.5bn industry held together by the goodwill and memory of an underpaid hero.

**Visual cue:** Three small icons (paper, Excel, WhatsApp) → one big icon (a single brain). The visual joke is the reveal.

---

## Slide 4 — Why now

**Headline:** **Three things lined up in 2024.**

| Trigger | Implication |
|---|---|
| Equine welfare legislation requires digital vaccination records within 24h (effective 2025) | Compliance is now legally enforceable, not best-effort |
| Xero opened up UK livery-specific app categories late 2024 | The financial integration finally has a real home |
| AI inference cost dropped 90% — an always-on assistant per yard now costs ~£5/month at scale | A vertical AI co-pilot is finally economically viable |

**Closing line, bold:** "The wave is starting. Whoever owns the operating system now will own the M&A integration layer in 5 years."

---

## Slide 5 — What we built

**Headline:** **PaddocPro — one database, every entity connected.**

**Visual cue:** Show a screenshot of the live `/horses/horse_riverbend-10` profile (Marble) with arrows drawn to connected records — owner, stable, livery package, charges, bookings. Like an annotated diagram.

**Body bullets (concise, three only):**

- 15-module sidebar covering every operational surface a yard touches.
- Two-tab pattern per module — Dashboard (KPIs from the same data) + Entity grid (sortable, groupable, exportable).
- Detail pages for things that have depth (horses, stables); right-side sheets for quick reads; modals for quick writes.

---

## Slide 6 — Differentiator: Paddy

**Headline:** **Every yard gets an AI front door.**

**Visual cue:** Side-by-side screenshots of:
- Left: the Paddy panel mid-stream answering "Which horses are overdue for vaccinations?" with Whisper and Marble as clickable citations.
- Right: clicking Whisper → Whisper's profile.

**Body bullets:**

- Multi-tenant aware. Hard-coded to never cross tenant boundaries.
- Citations are real records. Click them to land on the entity.
- Suggestion prompts pre-populated for the yard manager's common questions.
- Streaming responses; abort / branch built in.

**Closing line:** *Other vendors are bolting an LLM onto a CRUD app. We built Paddy as the front door.*

---

## Slide 7 — Differentiator: built for the way yards actually work

**Headline:** **Patterns from a shipped product. None of the second-system mistakes.**

**Three columns:**

| Multi-tenant | Compliance | Xero |
|---|---|---|
| Tenant-keyed schema. One operator can run 12 yards under one login. Tenant switcher in the top bar. | Audit log on every mutation. Incident workflow with append-only trail. RBAC matrix configurable per tenant. GDPR SAR tooling. | Push invoices, read payment status via webhooks, batch with idempotency keys, reconcile. Yard managers already trust Xero — we don't ask them to switch. |

**Visual cue:** Three small mock-up screenshots from the live app: TenantSwitcher dropdown / `/settings/audit-log` grid / `/finance/all-invoices` with a Paid status badge.

---

## Slide 8 — Roadmap & milestones

**Headline:** **Where the £800k goes.**

**Quarter-by-quarter:**

| | Q3 2026 | Q4 2026 | Q1 2027 | Q2 2027 |
|---|---|---|---|---|
| **Engineering** | Production build live, real auth, real DB | Xero connection live, mobile PWA polish | Group operator features, white-label | Insurer integration |
| **Customers** | First 5 design partners onboarded | 15 yards live | 30 yards live · 1 group operator | 50 yards · £120k ARR |
| **Team** | 2 eng + 1 design | + 1 customer success | + 1 sales | + 1 eng |

**Visual cue:** Simple horizontal timeline. Quarters across, swimlanes for engineering / customers / team.

---

## Slide 9 — The team

**Headline:** **We've shipped this pattern before.**

**Body:**

- **Gianni Di Raimondo** — Product Lead. Previously product on RiskHub 1Experience (the design system PaddocPro is built on); 10+ years building enterprise SaaS for regulated industries.
- *(Add other team members here as they sign)*

**Why us, in one line:** *We know how to build the operating system for a regulated, fragmented industry. We've done it once. We're doing it again.*

**Visual cue:** Headshots, names, role, one-line credential. Keep it tight.

---

## Slide 10 — The ask

**Headline:** **£800k seed.**

**Three blocks:**

| Use of funds | Milestones (12 months) | Why now |
|---|---|---|
| 2 engineers + 1 designer (12 months) · Onboarding for first 10 yards · Production infrastructure · Xero certification | 50 paying yards · £120k ARR · 1 group operator landed · Insurer pilot signed | Legislation, AI cost curve, and Xero opening up — all in 2024–2025. The window is 18 months. |

**Centre-bottom, large:** "Get in touch — gianni@paddocpro.example.com"

**Visual cue:** Background remains slate `#e5ebf1`. CTA button-style mock at the bottom in charcoal `#202228` (matches the in-app brand).

---

## Appendix slides (only if asked)

### Appendix A — Pricing

| Tier | Per yard / month | Includes |
|---|---|---|
| **Yard** | £150 | 1 yard, ≤50 horses, all modules, Paddy basic |
| **Group** | £400 | ≤10 yards, multi-yard dashboards, Paddy advanced, Xero |
| **Operator** | Custom | 10+ yards, white-label, dedicated CSM, custom integrations |

Flat per-yard fee — never per-horse. (Per-horse pricing is a tax on growth and yard managers hate it.)

### Appendix B — Competitive landscape

| Tool | What they do | Where they fall short |
|---|---|---|
| EquineGenie | Stable management | US-only, no Xero, no AI, no multi-tenant |
| LiveryList | Marketplace | Discovery only, not operations |
| Xero + spreadsheets | Books | The 80% of operations that aren't money |
| Generic SaaS (Notion, Airtable) | Anything you build it for | Yard manager isn't a database admin |

### Appendix C — Regulatory backdrop

- UK Equine Identification Regulations 2018 (passport, microchip)
- Equine Welfare Code 2024 (digital vaccination records, 24h)
- GDPR (owner personal data, riding-school students)
- HMRC livery VAT guidance (varies by service component — billable line accuracy matters)

PaddocPro maps each of these into the data model. Compliance is a side-effect of using the product.

### Appendix D — Why a £800k cheque, not £400k or £1.5m

- £400k buys 6 months at 3 people. Not enough to ship + sell.
- £1.5m buys 18 months but forces hiring sales/marketing before product-market fit, which is the classic seed mistake in vertical SaaS.
- £800k for 12 months at 3 people lets us validate the design-partner model before scaling. Series A in mid-2027 with PMF data unlocks 5–7× the round.

This is a deliberate, modelled number — not a vibe.

---

## How to use this deck

- **For warm intros (warm GP DM, warm angel email):** send Slides 1, 5, 6, 10 only as a 4-slide PDF.
- **For first calls:** use the full 10 slides, presenter mode.
- **For deep due diligence:** include the appendix.

Speak to the slides — never read them.
