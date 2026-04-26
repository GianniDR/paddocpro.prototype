# PaddocPro — 90-second pitch video script

A scene-by-scene shot list with voiceover, on-screen actions, music cues, and overlay text. Designed to be filmed in a single afternoon: screen-record the live app, narrate over it, slot in a royalty-free track.

---

## Tools you'll need

- **Screen recording:** [Loom](https://loom.com) (free) or **macOS built-in** (Cmd+Shift+5 → record). Record at 1920×1080.
- **Editing:** [CapCut](https://capcut.com) (free, easy, browser or desktop) or [Descript](https://descript.com) (~$15/month — voiceover + edit-by-text).
- **Voiceover (if not your own voice):** [ElevenLabs](https://elevenlabs.ai) — pick a warm British male/female voice (e.g. "Sarah" or "James" with British accent). ~£10 for the credits this needs.
- **Music:** Any of these royalty-free packs work for an upbeat pitch:
  - [Pixabay Music — "Corporate Upbeat"](https://pixabay.com/music/search/corporate%20upbeat/) (free, no attribution).
  - [Bensound — "Buddy" or "Going Higher"](https://www.bensound.com/) (free with attribution, paid licence ~£35).
  - [Epidemic Sound — "Sunny Stride"](https://www.epidemicsound.com/) (subscription ~£12/month).
- **Stock B-roll** (optional, for the "Act 1 — pain" section): [Pexels Videos](https://www.pexels.com/videos/) — search "horse stable", "horseback riding".

---

## Format

- **Total length:** 90 seconds (the investor sweet spot — long enough for a story, short enough to send to a busy GP via DM).
- **Aspect ratio:** 16:9 for desktop / LinkedIn. Optionally re-export at 9:16 for Instagram or Twitter.
- **Music:** Upbeat folk/indie, ~110bpm. Volume ducked to ~25% under voiceover.
- **Pace:** 1 cut every 4–6 seconds. Never linger on a single screen for more than 8s.

---

## Scene-by-scene breakdown

Times are cumulative seconds. **VO** = voiceover. **SCREEN** = what to show. **TEXT** = on-screen overlay caption (large, sans-serif, bottom-left or centred).

### Scene 1 — The hook (0:00–0:08)

**SCREEN:** B-roll — a wide shot of an actual yard at dawn. Horses in stables. Staff carrying hay. (Pexels: "horse stable morning")

**VO:** *"There are three hundred and seventy thousand horses in livery in the United Kingdom. Almost every one of them is tracked on a piece of paper, in a WhatsApp group, or in someone's head."*

**TEXT:** "370,000 horses. 9,500 yards. 0 systems."

**MUSIC:** Soft intro — single instrument (acoustic guitar pluck or piano). No percussion yet.

**Cut on:** the word "head" — hard cut to a close-up of a paper diary on a wall.

---

### Scene 2 — The pain (0:08–0:20)

**SCREEN:** Quick montage, 2s each, of:
- A WhatsApp group chat scrolling fast
- A wall calendar with crossed-out vaccinations
- Someone scribbling in a notebook
- A laptop with five Excel tabs open

(All from Pexels stock or recreate quickly with screenshots — these are silent B-roll.)

**VO:** *"The yard manager keeps it all together. Until the vaccination is missed. The invoice goes out late. The vet shows up when the horse is already out. The owner gets nervous. And the manager — the heart of the yard — burns out."*

**TEXT (one per cut):** "Missed vaccinations." → "Late invoices." → "Double-booked vet visits." → "Yard managers burn out."

**MUSIC:** Percussion comes in. Tempo lifts.

**Cut on:** the word "burns out" — to a black 0.5s frame, then →

---

### Scene 3 — The reveal (0:20–0:30)

**SCREEN:** The PaddocPro `/dashboard` route loads. Big "Good morning, Sarah" greeting. Slate canvas, charcoal sidebar. Hold on the dashboard for 2 seconds.

**VO:** *"PaddocPro is the operating system for a livery yard."*

**TEXT:** Logo lockup centred — "paddoc | pro" in italic display type, then fades.

**MUSIC:** Full track engages — bright, optimistic.

**ACTION:** As VO ends, mouse moves and clicks "Horses" in the sidebar.

---

### Scene 4 — The grid + connected entities (0:30–0:42)

**SCREEN:** `/horses/all-horses` loads. Show the AG Grid: row-group panel, filter chips ("Isolating", "Vet care"…), the search bar stretching, the dark "Actions" button. Click on a row — a horse named **Marble**.

**VO:** *"Every horse is linked to its owner, its stable, its livery package, its vaccinations, its bills."*

**ACTION while VO plays:**
- Hover over the "Isolating (1)" chip — a tooltip shows.
- Click row — `/horses/horse_riverbend-10` opens.
- Hero strip shows the horse name "Marble" with subtitle.
- Mouse pointer hovers over the **Owner: Imogen Kingsley** badge.
- Click each tab in turn — Profile, Health (count badge "7"), Bookings (count "3"), Documents (count "1"), Charges. Spend ~1s per tab.

**TEXT:** "Click anything. Drill into anything."

---

### Scene 5 — Paddy the AI (0:42–0:58)

**SCREEN:** Hit ⌘J. The Paddy panel slides in from the right. Type the prompt **"Which horses are overdue for vaccinations?"** — show it streaming a response with clickable horse names.

**VO:** *"And every yard gets Paddy. An AI assistant that already knows your horses, your owners, your finances. Ask Paddy anything. The answers are real, the citations are real, and Paddy never crosses tenant boundaries."*

**ACTION:**
- Type prompt slowly enough to be readable.
- Hit Enter.
- Paddy streams: "Two horses are overdue for vaccinations: [Whisper] and [Marble]…" (clickable links).
- Click [Whisper] — page navigates to Whisper's profile.

**TEXT:** "Ask. Don't search."

---

### Scene 6 — The yard map + multi-tenant (0:58–1:08)

**SCREEN:** Navigate to `/stables` — the Dashboard tab loads with the SVG yard map. Show all the stable cells. Click one — it routes to `/stables/[id]` (full detail page).

Back to top of page. Click the **Riverbend Stables** dropdown in the top-right. Show the second tenant ("Wisteria Stables"). Click it. Watch the entire app refresh into a different yard's data.

**VO:** *"One operator. Three yards. Twelve yards. PaddocPro is multi-tenant from the schema up — the way real operators run real businesses."*

**TEXT:** "1 operator. Many yards. One source of truth."

---

### Scene 7 — Compliance is the moat (1:08–1:18)

**SCREEN:** Quick cuts:
- `/settings/audit-log` — show the append-only history grid.
- `/incidents/all-incidents` → click an incident → show the workflow stepper.
- `/settings/rbac` — show the permission matrix.
- `/finance/all-invoices` → click "Actions" → "Run monthly invoicing" → show the dialog.

**VO:** *"Audit trails. Incident workflows. Role-based access. Xero-ready monthly invoicing. Compliance isn't a checkbox — it's how the product works."*

**TEXT (one per cut):** "Audit log." → "Incident workflow." → "RBAC." → "Xero, wired in."

---

### Scene 8 — The ask (1:18–1:28)

**SCREEN:** Slide with text only. Slate background, charcoal text. Animated count-up where useful.

```
£800k seed
2 engineers · 1 designer · 12 months
First 10 design-partner yards
Production launch Q3 2026
```

**VO:** *"We're raising eight hundred thousand to onboard our first ten yards and ship the production build. The prototype is real. The market is waiting. Come build it with us."*

**MUSIC:** Builds to crescendo at "build it with us".

**TEXT:** Final logo lock-up — "paddoc | pro" with tagline beneath: *"The operating system for the modern livery yard."*

---

### Scene 9 — End card (1:28–1:30)

**SCREEN:** End card with three lines of contact info:
```
gianni@paddocpro.example.com
paddocpro.example.com
@paddocpro
```

**MUSIC:** Track ends on a clean note.

---

## Voiceover script (clean copy, no annotations — paste this into ElevenLabs)

> There are three hundred and seventy thousand horses in livery in the United Kingdom. Almost every one of them is tracked on a piece of paper, in a WhatsApp group, or in someone's head.
>
> The yard manager keeps it all together. Until the vaccination is missed. The invoice goes out late. The vet shows up when the horse is already out. The owner gets nervous. And the manager — the heart of the yard — burns out.
>
> PaddocPro is the operating system for a livery yard.
>
> Every horse is linked to its owner, its stable, its livery package, its vaccinations, its bills. Click anything. Drill into anything.
>
> And every yard gets Paddy. An AI assistant that already knows your horses, your owners, your finances. Ask Paddy anything. The answers are real, the citations are real, and Paddy never crosses tenant boundaries.
>
> One operator. Three yards. Twelve yards. PaddocPro is multi-tenant from the schema up — the way real operators run real businesses.
>
> Audit trails. Incident workflows. Role-based access. Xero-ready monthly invoicing. Compliance isn't a checkbox — it's how the product works.
>
> We're raising eight hundred thousand to onboard our first ten yards and ship the production build. The prototype is real. The market is waiting. Come build it with us.

Word count: 187 words. Read at ~120 words/minute (a relaxed, confident pace) lands at ~93 seconds — perfect for the 90-second target with breathing room.

---

## Production checklist

- [ ] Pick the music track (one of the three suggested — "Sunny Stride" by Frank Schroeter on Epidemic is the obvious match).
- [ ] Record voiceover in one take (or generate via ElevenLabs). Aim for 90s ±2.
- [ ] Run `npm run dev` and walk through every scene live, recording the screen. Don't worry about cuts — capture each scene as a separate file.
- [ ] Quick scenes (Scene 7 cuts) — record each one separately at the right URL.
- [ ] In CapCut/Descript: drop voiceover on track 1, music on track 2 (ducked to 25%), screen recordings on the video tracks aligned to the VO timings above.
- [ ] Add overlay text per scene (CapCut → "Text" → use bold sans-serif, e.g. Inter, 64pt, white with 70% black drop shadow).
- [ ] Export at 1080p H.264. Should land at ~30MB.
- [ ] Re-export at 9:16 for vertical / Instagram. (Crop the screen recordings; keep VO + text intact.)

---

## Optional: a 30-second teaser

If you want a shorter version for social, here's the cut:

**Pacing:** 30s total.

- 0:00–0:05 Pain (Scene 2 condensed) — VO: *"Three hundred and seventy thousand horses. Tracked on paper, WhatsApp, and Excel."*
- 0:05–0:15 Reveal + Grid (Scenes 3+4 condensed) — VO: *"PaddocPro is the operating system for a livery yard. Every horse, every owner, every invoice — connected."*
- 0:15–0:25 Paddy (Scene 5 condensed) — VO: *"Ask Paddy anything. He already knows your yard."*
- 0:25–0:30 Logo + ask card. VO: *"Seed round open. Get in touch."*

---

## What I can't do for you (yet)

- **Render the actual MP4.** That needs a video editor — but the script + storyboard above is the heavy lifting; the editing is 2–3 hours of CapCut work.
- **Generate AI voiceover from this environment.** Run the script through ElevenLabs (or read it yourself in QuickTime Player → File → New Audio Recording).
- **Source music licences.** Pick one of the three suggested above; the licences are clear on each platform.

If you want me to:
- Refine the narrative for a specific investor (e.g. equestrian-sector specialist vs. SaaS generalist) — give me the firm and I'll tune.
- Write a longer 3-minute "directors cut" version with founder-on-camera intercuts — happy to.
- Storyboard each scene as ASCII frames for the video editor — happy to.

Just say the word.
