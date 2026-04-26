# PaddocPro pitch — HyperFrames composition

A 90-second investor pitch authored as a single HyperFrames composition. Render to MP4 with one command.

## How to render

From this directory:

```bash
# 1. Install hyperframes (one-time)
npx hyperframes init . --skip-template

# 2. Drop assets into ./assets/ (see checklist below)

# 3. Live preview while you tweak
npx hyperframes preview

# 4. Render to MP4
npx hyperframes render
```

The output lands at `./out/paddocpro-pitch.mp4` (1920×1080, ~90s, ~30MB).

## Assets you need to produce (and where to put them)

All paths are relative to `./assets/`:

| File | Source | Length | Notes |
|---|---|---|---|
| `voiceover.mp3` | ElevenLabs (paste script from `docs/pitch/video-script.md` § "Voiceover script") | 90s | One continuous file. Pick a warm British voice — "Sarah" or "James". |
| `music.mp3` | Pixabay/Bensound/Epidemic Sound | 90s | Upbeat indie/folk, ~110bpm. Trimmed to 90s with a clean fade-out. |
| `scene-1-yard-dawn.mp4` | Pexels Videos | 8s | "Horse stable morning" or "yard dawn". 1920×1080 @ 30fps. |
| `scene-2a-paper-diary.mp4` | Pexels or screen capture of a paper diary | 3s | Close-up of handwritten notes. |
| `scene-2b-whatsapp.mp4` | Screen capture of any WhatsApp group on your phone (mirrored to your Mac) | 3s | Scrolling messages — blur identifying info. |
| `scene-2c-excel.mp4` | Screen capture of an Excel sheet with multiple tabs | 3s | Use a fake yard tracker spreadsheet — quick zoom. |
| `scene-2d-burnout.mp4` | Pexels — "tired person at desk" / "yard worker tired" | 3s | Atmospheric, not literal. |
| `scene-3-dashboard.mp4` | **Live app screen capture:** `/dashboard` | 6s | "Good morning, Sarah" greeting visible. Pan slowly through KPIs. |
| `scene-4-horses-grid-and-profile.mp4` | **Live app screen capture:** `/horses/all-horses` → click row → profile → click 4 tabs | 12s | Hover over the Isolating chip first, then click the row. |
| `scene-5-paddy.mp4` | **Live app screen capture:** Press ⌘J → type "Which horses are overdue for vaccinations?" → wait for response → click a citation | 16s | Type the prompt slowly enough to be readable. |
| `scene-6-yard-map-and-tenant.mp4` | **Live app screen capture:** `/stables` → click yard map cell → back → tenant switcher dropdown → switch | 10s | The tenant switch is the punchline — pause briefly on the new yard's data. |
| `scene-7a-audit-log.mp4` | **Live app screen capture:** `/settings/audit-log` | 2.5s | Scroll the grid for one beat. |
| `scene-7b-incidents.mp4` | **Live app screen capture:** `/incidents/all-incidents` → click a row → workflow stepper | 2.5s | Show the workflow visualisation. |
| `scene-7c-rbac.mp4` | **Live app screen capture:** `/settings/rbac` | 2.5s | Show the matrix grid. |
| `scene-7d-finance.mp4` | **Live app screen capture:** `/finance/all-invoices` → Actions menu → Run monthly invoicing dialog | 2.5s | Pause briefly on the dialog. |

## Recording the live app

```bash
# Start the dev server in this repo's root
cd ../../../   # back to /Users/gianni/Desktop/paddocpro-app
npm run dev
```

App is at `http://localhost:3030`. Use macOS Cmd+Shift+5 → record selected window → make sure window is exactly 1920×1080. Or use Loom desktop and trim.

For best results:
- Hide the browser chrome (Cmd+Shift+F for full-screen, or use Chrome's "App Mode" via `chrome --app=http://localhost:3030`).
- Disable any browser extensions that would show on top (LastPass, Grammarly).
- Run with the `Riverbend Stables` tenant active for Scenes 3–7a-c, switch to a second tenant only during Scene 6.
- For Scene 5, set Paddy's response to be deterministic — the seeded mock responder uses a prompt-hash so it'll behave the same every recording.

## Voiceover

Paste this script verbatim into ElevenLabs (one block, no annotations — already in `docs/pitch/video-script.md` § "Voiceover script (clean copy)"):

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

Target read pace: **120 words/minute** (relaxed, confident). Word count is 187 → ~93 seconds. Trim front/back silence to land at exactly 90s.

## Music

Pick one (90 seconds, upbeat, ~110bpm, folk-or-indie style):

- **Free, no attribution:** [Pixabay — "Corporate Inspirational"](https://pixabay.com/music/corporate-inspirational-corporate-music-115035/) or any track in their "Upbeat" tag.
- **Free with attribution:** [Bensound — "Buddy"](https://www.bensound.com/royalty-free-music/track/buddy) (£35 if you want to remove the credit).
- **Subscription (~£12/mo):** [Epidemic Sound — "Sunny Stride" by Frank Schroeter](https://www.epidemicsound.com/) — closest match to the riskhub-1experience tonal target.

Trim to 90 seconds. Apply a 1.5s fade-out at the end. The composition already ducks the music to 0.25 (`data-volume="0.25"`) so the voiceover sits on top.

## Timeline reference

```
0s        8s        20s       30s       42s       58s       68s       78s    88s 90s
├─────────┼─────────┼─────────┼─────────┼─────────┼─────────┼─────────┼──────┼──┤
│ Hook    │  Pain   │ Reveal+ │ Grid +  │  Paddy  │ Map +   │ Compli- │ Ask  │End│
│ B-roll  │ montage │  dash   │ profile │  AI     │ tenant  │ ance    │ slide│   │
└─────────┴─────────┴─────────┴─────────┴─────────┴─────────┴─────────┴──────┴───┘
```

## Tweaks to the composition

The composition is in `composition.html`. Common edits:

- **Re-time a scene:** change `data-start` and `data-duration` on the `<video>` and any matching `<div class="overlay">`. Both must match.
- **Change overlay copy:** edit the text inside `<div class="overlay">`.
- **Change the ask figure:** edit `<div class="figure">£800k</div>` in Scene 8.
- **Mute the music:** set `data-volume="0"` on `#background-music`.
- **Re-render after any change:** `npx hyperframes render`.

## What you save by using HyperFrames vs CapCut

- **Reproducible:** the entire video is one file under version control.
- **Editable by AI:** the prompt to "shorten Scene 4 to 8 seconds" is one find-and-replace.
- **No timeline UI fiddling.** The timeline IS the HTML.
- **Free re-renders.** Want a 9:16 vertical version? Change `data-width="1080" data-height="1920"`, re-record the screen captures at portrait, render again.

## If you want a 9:16 vertical cut

Make a copy of `composition.html` as `composition-vertical.html`:
- Change `data-width="1080" data-height="1920"` on `#stage`.
- Re-record screen captures at 1080×1920 (or crop existing centre 1080 columns).
- Adjust overlay font sizes (drop bottom-left from 64px → 48px; centred from 84px → 64px).
- Render.

The voiceover and music files don't change.
