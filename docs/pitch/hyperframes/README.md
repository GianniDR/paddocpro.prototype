# PaddocPro pitch — HyperFrames composition

A **69-second investor pitch** rendered with [HyperFrames](https://github.com/heygen-com/hyperframes). The final MP4 is committed at `renders/paddocpro-pitch.mp4` (13 MB, 1920×1080 @ 30fps).

Watch it: open `renders/paddocpro-pitch.mp4` in any media player, or browse to `https://github.com/GianniDR/paddocpro.prototype/blob/main/docs/pitch/hyperframes/renders/paddocpro-pitch.mp4` and click the download icon.

## Pipeline overview

```
voiceover-script.txt ─┐                                                            
                      │  hyperframes tts (Kokoro-82M)                              
                      ▼                                                            
              assets/voiceover.wav                                                 
                                                                                   
record-scenes.config.ts + scenes/record.spec.ts                                    
                      │  npx playwright test                                       
                      ▼                                                            
              scenes/output/*/video.webm                                           
                      │  ffmpeg → mp4 (h264, dense keyframes, 30fps)              
                      ▼                                                            
              assets/scene-*.mp4 (8 files)                                         
                                                                                   
                      │                                                            
                      ▼                                                            
              index.html (HyperFrames composition)                                 
                      │  npx hyperframes render                                    
                      ▼                                                            
              renders/paddocpro-pitch.mp4                                          
```

Total wall-clock to produce: **~6 minutes** (the bulk is downloading the Kokoro voice model + Playwright recording the 8 scenes).

## Reproducing

From this directory (`docs/pitch/hyperframes/`):

```bash
# 1) Make sure the dev server is running on port 3030
cd ../../../ && npm run dev &
cd docs/pitch/hyperframes

# 2) Generate voiceover (one-time — ~10s after voice model is cached)
uv venv --python 3.12 && source .venv/bin/activate
uv pip install kokoro-onnx soundfile
npx hyperframes tts voiceover-script.txt --voice bf_emma --lang en-gb --output assets/voiceover.wav

# 3) Record the 8 scene videos via Playwright against localhost:3030
cd ../../../
npx playwright test --config docs/pitch/hyperframes/record-scenes.config.ts

# 4) Convert .webm → .mp4 with dense keyframes
cd docs/pitch/hyperframes
for src in scenes/output/record-scene-*-record/video.webm; do
  name=$(echo "$src" | sed -E 's|scenes/output/record-(scene-[^-]+(-[^-]+)*)-record/video.webm|\1|')
  ffmpeg -y -i "$src" -c:v libx264 -r 30 -g 30 -keyint_min 30 -preset fast -crf 23 \
    -pix_fmt yuv420p -movflags +faststart -loglevel error "assets/${name}.mp4"
done

# 5) Lint + render
npx hyperframes lint
npx hyperframes render -o renders/paddocpro-pitch.mp4 -f 30 -q standard
```

## Composition timeline

| Time | Element | Source |
|---|---|---|
| 0–4s | Brand title card | inline |
| 4–9.5s | Stat hook ("370,000 horses…") | inline |
| 9.5–14.5s | Pain card ("Missed vaccinations…") | inline |
| 14.5–21.5s | Dashboard | `assets/scene-3-dashboard.mp4` |
| 21.5–33.7s | Horses grid → profile drill-throughs | `assets/scene-4-horses-grid-and-profile.mp4` |
| 33.7–47.5s | Paddy AI streaming response | `assets/scene-5-paddy.mp4` |
| 47.5–52.9s | Yard map + tenant switch | `assets/scene-6-yard-map-and-tenant.mp4` |
| 52.9–56.3s | Audit log | `assets/scene-7a-audit-log.mp4` |
| 56.3–59.7s | Incident workflow | `assets/scene-7b-incidents.mp4` |
| 59.7–62.7s | RBAC matrix | `assets/scene-7c-rbac.mp4` |
| 62.7–67.0s | Finance / monthly invoicing | `assets/scene-7d-finance.mp4` |
| 67.0–69.0s | End card | inline |
| 0–69s (overlay) | Voiceover | `assets/voiceover.wav` |

The voiceover is 67.24s; the final 1.76s is silence with the end card on-screen.

## Editing

Everything is in `index.html` — no proprietary timeline format. Common edits:

- **Re-time a scene:** change `data-start` and `data-duration` on its `<video>` and any `.label` overlays bound to that segment.
- **Change copy on a card:** edit the markup inside `<div class="card">`, `.stat-card`, `.pain-card`, or `.label`.
- **Change ask figure / contact:** edit the `.end` div near the bottom.
- **Re-render:** `npx hyperframes render`.

After any edit, run `npx hyperframes lint` to validate.

## Adding background music

The composition currently has no music track — voiceover plays solo on a clean slate canvas, which is intentional for an investor pitch (clarity > vibe). To add music:

1. Drop an MP3 at `assets/music.mp3` (90s+, ducked to 0.25 volume in the composition).
2. Add this audio element inside `#root` in `index.html`:
   ```html
   <audio
     id="music"
     class="clip"
     data-start="0"
     data-duration="69"
     data-track-index="4"
     data-volume="0.2"
     src="./assets/music.mp3"
   ></audio>
   ```
3. Re-render.

Free royalty-free options: [Pixabay Music — "Corporate Inspirational"](https://pixabay.com/music/corporate-inspirational-corporate-music-115035/), [Bensound — "Buddy"](https://www.bensound.com/), or any sub-90bpm acoustic track.

## Vertical (9:16) cut

For Instagram / TikTok / LinkedIn shorts:

1. Copy `index.html` to `index-vertical.html`.
2. Change root: `data-width="1080" data-height="1920"`.
3. Either re-record screen captures at 1080×1920 (preferred), or accept letterboxing.
4. Adjust `.label` font sizes (drop bottom-left from 56px → 44px; centred from 84px → 64px).
5. Render: `npx hyperframes render index-vertical.html -o renders/paddocpro-pitch-vertical.mp4`.

## Troubleshooting

- **"speech synthesis failed: kokoro-onnx not installed"** → activate the venv (`source .venv/bin/activate`) and install via `uv pip install kokoro-onnx soundfile`.
- **"sparse keyframes" warning during render** → re-encode the offending mp4 with `ffmpeg -i in.mp4 -c:v libx264 -r 30 -g 30 -keyint_min 30 -movflags +faststart out.mp4`.
- **"missing_timeline_registry" lint error** → ensure the `<script>` block at the bottom of `index.html` registers `window.__timelines["main"] = gsap.timeline({paused: true})`.
- **Scene videos look blurry** → Playwright records at the configured viewport. Make sure `record-scenes.config.ts` has `viewport: { width: 1920, height: 1080 }` and `video.size: { width: 1920, height: 1080 }`.
