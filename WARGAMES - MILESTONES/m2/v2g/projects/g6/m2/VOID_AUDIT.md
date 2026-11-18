# VOIDBASTARD-TAO AUDIT — Group 6 (`g6` · M2): *Boxing Day Blues*

> **Core Maxim:** Every visible element is a claim about what matters now. Removal is commitment: fewer true claims create a stronger surface. Show only what is true now.

---

## 0. HONEST VIDEO-VS-GAME CRITIQUE & GEMINI PROVENANCE

### A. Brutally Honest Critique of the First-Pass Build vs. `video/gameplay.mp4` (`study/sheet.jpg`)

Comparing the prior `game/index.html` (`pairs/pair_002.00.jpg`, `pair_005.00.jpg`, `pair_008.00.jpg` right halves) against the Gemini Omni 1.2 Flash seed video (`video/gameplay.mp4` / `study/sheet.jpg` left halves) exposes five concrete failures where HUD habits destroyed the quiet melancholy of the video:

1. **Detached VN Chrome & Redundant Top-Right Clock Card (`pair_002`, `pair_005`)**:
   - The seed video (`study/sheet.jpg`) stages two small, solitary plum silhouettes between symmetrical transit canopies under open twilight snowfall, keeping the entire lower platform and upper sky clean.
   - The old HTML build bolted on **four simultaneous layers of detached UI chrome**:
     - A heavy `860x104px` opaque bottom rectangle (`SYSTEM SUGGESTION // SMALL-TALK FRAGMENT 04` + 3 full-width monospace lines) covering the foreground platform apron (`pair_002.00.jpg`).
     - A dark floating top-center toast pill (`"Happy Boxing Day... my feed highlighted that too."`) sitting right above the station roofline (`pair_002.00.jpg`, `pair_005.00.jpg`).
     - A rounded `210x54px` white/slate top-right HUD card (`11:47 AM / AFTERNOON` + 3 purple pips) floating in the sky *directly above* an actual architectural hanging digital station sign on the right canopy that still displayed raw AI-garbled digits (`08:86:49`).
     - A bottom instruction caption (`← / → approach passing citizen before evening falls`), a `[ALMOST CONNECTED]` banner box (`pair_005.00.jpg`), and full-screen opaque title/end modal rectangles (`GROUP 6 // MILESTONE 2`, `Resonant replies: X / 3 · Misread idioms: Y`).
2. **5,098 Trapped `#d8d8d8` Studio Grey Cutout Pixels + Fake Purple Sticker Halo (`pair_005`, `pair_008`)**:
   - Inspecting `assets/citizen_silhouettes.png` (`1024x1024` RGBA) against `assets/citizen_silhouettes_raw.png` revealed **5,098 opaque neutral-grey studio pixels** (`RGB ~ [209, 209, 209]`) trapped inside closed/narrow leg gaps (up to `304px` per sprite on front/back silhouettes `[7]`, `[15]`, `[23]`), arm/cup crooks, and JPEG Gibbs-ringing outer fringes.
   - Worse, during `near`, `drawSilhouette()` applied `ctx.shadowColor = '#8f6cd9'; ctx.shadowBlur = 18` directly to the character cutouts (`pair_005.00.jpg`, `pair_008.00.jpg`), wrapping both dark winter figures in a neon-violet sticker outline completely absent from `sheet.jpg`.
3. **36px Vertical Architectural Jump & Washed-Out White Afternoon Grade (`pair_002` vs `pair_005`)**:
   - In `assets/4_scene_backgrounds_morning_to_evening.png` (`1376x768` 2x2 sheet), the top panels (`0, 1`) place the canopy roof at `py = 78` (`20.3%` height), whereas the bottom panels (`2, 3`) place the canopy roof at `py = 58` (`15.1%` height). Cropping all four panels with identical vertical offsets caused the entire station canopy and hanging signs to jump ~36px upward during scene transitions, and left a 2px risk near the `x=688 / y=384` seams.
   - Furthermore, `play.mjs` rushed out of Morning in `<1.5s`, landing `pair_002.00.jpg` in an ungraded, stark white Afternoon sky (`#eceaef`) that lost the twilight periwinkle-rose warmth (`#a4a5c4`, `#c5b7ca`) of `gameplay.mp4`.
4. **Auto-Freezing Movement at `385px` & Cluttered Bubble Soup (`pair_005`, `pair_008`)**:
   - Walking within `385px` (nearly a third of the 1280px canvas) forcibly froze player walking (`S.phase = 'talk'`), stripping spatial freedom.
   - `spawnConversationCluster()` dumped 8-12 overlapping opaque pills, monospace Greek/Bopomofo characters (`Ψ`, `ㄓ`), straight laser lines from the player's chest (`pair_005.00.jpg`), and an abrupt circular firework burst (`pair_008.00.jpg`), instead of two voices rising gently together, *almost* locking into warm peach-lavender & musical consonance, then wistfully detuning and flaking into snow as the train glides past.
5. **Hard Rectangular Train Clip (`x=112..1172`)**:
   - `drawGlidingTrain()` clipped to an arbitrary `x = 112..1172` box rather than occluding behind the actual foreground pillars (`px = 36..59` and `px = 645..668`) and platform slab (`py = 318`), abruptly slicing the train nose off before the station edges.

### B. Honest Remaining Differences After VOIDBASTARD-TAO Rebuild

Even after rebuilding `index.html`, `play.mjs`, and re-matting `citizen_silhouettes.png` (`0` trapped studio grey pixels), we state candidly what still differs between the HTML5 Canvas game and `video/gameplay.mp4`:

- **Discrete 2D Sprite Silhouettes vs. Continuous Video Pose Deformation**: `gameplay.mp4` (`gemini-omni-1.2-flash`) exhibits continuous per-frame cloth sway, subtle foot weight shifts, and organic head-turn/head-bow interpolation across 240 frames. Our HTML5 build uses cleaned discrete 2D silhouettes from `citizen_silhouettes.png` augmented with procedural walk-stride alternation, subtle breathing scale, snow-crunch footsteps, and a gentle `2.8°` rotational posture bow when a near-harmonized chord detunes.
- **Playable Spatial Phrase Pills vs. Wordless Video Take**: `gameplay.mp4` is a non-interactive cinematic shot containing only wordless `...` / `—` speech pills and abstract runes. Because `spec.json`'s core playable verb is *"Choose what to say, from phrases the system offers"*, walking close to a waiting citizen blooms 3 small, delicate translucent speech-glyph pills in world space beside the silhouettes (`1 / 2 / 3` or direct click) holding short worn-out human idioms; once chosen, the pills dissolve into pure rising `...` / rune bubbles matching the video.
- **4-Stop Day Progression vs. Single 10s Dusk Shot**: `gameplay.mp4` stays in one continuous dusk lighting state for 10.0s; our game fulfills `spec.json` (`One day, four scenes`, morning -> afternoon -> dusk -> evening) by letting the player walk onward down the platform across four atmospheric stops while keeping the architectural framing, gliding 2.5D train, and harmonic bubble dissolve faithful to `sheet.jpg`.

### C. Full Gemini Generation Provenance (`video/gemini_log.json` & `assets/gemini_log.json`)

| Asset / Artifact | Kind | Model | Interaction ID | Timestamp (UTC) | Elapsed | Reference Inputs (`refs`) | Output File(s) |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Seed Gameplay Video** (`gameplay`) | `video` | `gemini-omni-1.2-flash` | `v1_ChRqY0w5YXZlNkR1TDd3YlVQcUxwbxIUamNMOWF2ZTZEdUw3d2JVUHFMcG8` | `2026-11-18T15:21:51Z` | `38.75s` | `projects/g6/m2/refs/m2_main_ref.png` (`previous_interaction_id: null`) | `projects/g6/m2/video/gameplay.mp4` |
| **4 Scene Backgrounds** (`4_scene_backgrounds_morning_to_evening`) | `image` | `gemini-nano-banana-2.1` | `v1_ChdrY0w5YXRHM0dvVEppTE1Qa1BLVm1BWRIXa2NMOWF0RzNHb1RKaUxNUGtQS1ZtQVk` | `2026-11-18T15:22:05Z` | `12.60s` | `projects/g6/m2/study/f_014.jpg`, `projects/g6/m2/study/f_027.jpg` | `projects/g6/m2/assets/4_scene_backgrounds_morning_to_evening.png` |
| **Citizen Silhouettes** (`citizen_silhouettes`) | `image` | `gemini-nano-banana-2.1` | `v1_Chduc0w5YXBDSUFicmN5dE1QOS1tTGlRVRIXbnNMOWFwQ0lBYnJjeXRNUDktbUxpUVU` | `2026-11-18T15:22:23Z` | `17.42s` | `projects/g6/m2/study/f_014.jpg`, `projects/g6/m2/study/f_027.jpg` | `projects/g6/m2/assets/citizen_silhouettes_raw.png`, `projects/g6/m2/assets/citizen_silhouettes.png` *(re-matted cleanly from `raw`, `5,098 -> 0` grey islands)* |
| **Instrumental Soundtrack** (`bgm_loop`) | `music` | `lyria-3-clip-preview` | `v1_ChdLTVA5YXIyUUE2RG55dE1QcnNEa3dRVRIXS01QOWFyMlFBNkRueXRNUHJzRGt3UVU` | `2026-11-18T15:24:40Z` | `137.47s` | `projects/g6/m2/study/f_014.jpg` | `projects/g6/m2/assets/bgm_loop.mp3` |

**Exact Prompts Logged:**
- **`gameplay.mp4` (`gemini-omni-1.2-flash`)**:
  > *"Minimalist melancholic side-view narrative game in soft twilight lavender (#e9e6f2), deep plum silhouettes (#2b2740), and muted violet (#8f6cd9). Gentle slow-panning side camera across a quiet futuristic transit platform at dusk. Two stylized silhouette citizens pause near each other as soft glowing speech-bubble glyphs float upward between them, almost harmonizing in color before drifting apart into the evening snow as a transit train glides past. Continuous unbroken gameplay shot, no scene cuts, no gibberish text. Use the reference image for pastel dusk palette and minimalist staging. Sound design: gentle winter wind, soft electric piano chords, distant chime. No dialogue."*
- **`4_scene_backgrounds_morning_to_evening.png` (`gemini-nano-banana-2.1`)**:
  > *"Clean 2D/2.5D game environment asset for \"Boxing Day Blues\": 4 scene backgrounds (morning to evening). strictly harmonized palette (#e9e6f2, #2b2740, accent #8f6cd9), style: Minimal start screen; one press and you are in.. No UI text, no characters baked in, crisp game-ready art matching the reference gameplay frame."*
- **`citizen_silhouettes.png` (`gemini-nano-banana-2.1`)**:
  > *"Isolated 2D game sprite sheet / prop for \"Boxing Day Blues\": Citizen silhouettes. Centered full silhouette, isolated on a flat uniform light grey studio background (#d8d8d8), even lighting, zero drop shadow, no text, strictly harmonized palette (#e9e6f2, #2b2740, accent #8f6cd9), style: Minimal start screen; one press and you are in., matching the reference gameplay frame."*
- **`bgm_loop.mp3` (`lyria-3-clip-preview`)**:
  > *"Instrumental 30-second loopable game soundtrack for \"Boxing Day Blues\" (When culture is lost it is not easily regained. The dialogue options are fragments whose meaning is gone.). Visual mood: Minimal start screen; one press and you are in.. Purely instrumental, cohesive game loop, no vocals."*

---

## 1. WAY

- **Domain:** Quiet winter-twilight side-view spatial narrative across four futuristic transit stops (`Morning -> Afternoon -> Dusk -> Evening`).
- **Prime User & Intent:** A solitary commuter walking down a snowy transit platform before nightfall (`18:00`), trying to reach one genuine human connection using worn-out system-offered idioms whose original meanings have eroded.
- **Essential Surface:** Two dark winter silhouettes framed by symmetrical transit canopies, multi-layer drifting snow, a sleek illuminated train gliding behind the foreground pillars, a diegetic perspective LED clock mounted in the right station canopy, and floating translucent speech-glyphs rising into the dusk sky between speakers.
- **Center Kept Open:** The sky archway (`x = 465..835, y = 140..595`) and the snow-dusted platform floor (`y = 595..665`) remain completely unobstructed by boxes or banners so proximity, posture, rising speech-glyph harmony, and snow dissolution carry the emotional weight directly.

---

## 2. OBSTRUCTION

Every element that stood between the player and the twilight transit world in the first-pass build:

1. **Bottom `860x104px` VN Choice Box + `"SYSTEM SUGGESTION // ..."` Header** — severed the silhouettes from the foreground snow bank and turned an atmospheric walk into a spreadsheet menu.
2. **Top-Right `210x54px` Detached Clock & Resonance Pip Card** — duplicated time information that belongs inside the physical hanging station sign right below it, while pasting a gamey progress meter (`• • •`) onto the sky.
3. **Top-Center Dark Reply Toast Pill** — forced the player's eyes away from the citizen to read a subtitle bar above the station roof.
4. **Bottom Movement Instruction Caption (`← / → approach passing citizen...`)** — permanent tutorial nagging.
5. **Forced Movement Lock (`phase = 'talk'` at `dist <= 385px`)** — took away walking control before the player chose to speak.
6. **Opaque Full-Screen Title & End Summary Modals (`Resonant replies: X / 3 · Misread idioms: Y`)** — turned poetic melancholy into a post-match scoreboard.
7. **Studio Grey Cutout Artifacts & Neon-Violet `shadowBlur` Outline** — broke silhouette depth against dark twilight backgrounds.

---

## 3. KEEP-CUT LEDGER

| Element / Mechanism | Verdict | VOIDBASTARD-TAO Law & Justification |
| :--- | :--- | :--- |
| **4-stop twilight transit platform (`Morning -> Evening`) + aligned canopies** | **KEEP (Refined)** | **Law 2 & 6:** World lighting, lamp cones, and horizon warmth show the day slipping away in the environment itself. |
| **2.5D gliding transit train occluded behind foreground pillars & platform curb** | **KEEP (Upgraded)** | **Law 11:** Real world motion pacing the transit platform and framing the missed connection. |
| **Diegetic perspective LED clock inside the right canopy's hanging sign** | **KEEP (Replaces HUD)** | **Law 5 & 6:** Replaces both the garbled AI `08:86:49` texture and the floating top-right HUD card with one spatial architectural truth (`09:40 -> 18:00` + 3 tiny amber rim LEDs). |
| **2–3 small floating translucent speech-glyph pills beside citizen ONLY when close** | **KEEP (Spatialized)** | **Law 4 & 5:** Controls appear *only* while in speaking proximity (`dist <= 415px`) right beside the citizen (`1 / 2 / 3` or direct click), and fold away if you walk off or speak. |
| **Rising player + citizen speech-bubbles & waveforms nearly harmonizing then detuning into snow** | **KEEP (Core Magic)** | **Law 6 & 11:** Embodies *"almost understood / missed connection"* simultaneously in color warmth, spatial convergence, WebAudio chord consonance->detune, and snow-mote dissolution. |
| **Whispered citizen fragment inside their rising translucent speech bubble** | **KEEP (Spatialized)** | **Law 5:** Replaces the detached top-center toast bar; words glow briefly inside the citizen's rising bubble before wearing away into `...` dots and runes. |
| **Lingering warm shimmer mote trace left in world air at each stop** | **KEEP (Added)** | **Law 6 & 9:** Past attempts leave a quiet visible trace in the snowy air as you walk onward. |
| **Subtle diegetic `[R]` reset cue & `[P]` quiet pause indicator** | **KEEP** | **Law 7, 8 & 14:** Preserves pause and instant reversible reset without modal chrome. |
| **Bottom `860x104px` VN box & `SYSTEM SUGGESTION` header** | **CUT** | Fails Element Test — replaced by compact spatial speech-glyph pills beside the citizen. |
| **Top-right `210x54px` HUD clock card, scene-name label, and pip bar** | **CUT** | Redundant chrome duplicating the station's physical hanging clock and visible sky state. |
| **Top-center dark reply toast banner** | **CUT** | Detached subtitle chrome; moved into the rising speech bubble itself. |
| **Bottom instruction sentence (`← / → approach passing citizen...`)** | **CUT** | **Law 1:** Tutorial clutter; walking (`A/D`, `Arrows`, or click-to-walk) is immediate. |
| **`[ALMOST CONNECTED]` badge & end-of-day stat-sheet modal box** | **CUT** | **Law 6 & 12:** Completion creates no new demand and never grades heartbreak with a scoreboard. |
| **Neon-purple `shadowBlur` outline around silhouettes** | **CUT** | Visual fakery absent from `study/sheet.jpg`. |

---

## 4. STATE MAP

| State | World Truth | Dominant Purpose & Valid Player Operations | Visible In-World Surface | Exit Transition |
| :--- | :--- | :--- | :--- | :--- |
| **`REST`** *(non-autostart opening)* | Dawn snow falls on Stop 0 (`09:40`); player stands under left canopy. | Step into the day (`A/D`, `Arrows`, `Space/Enter`, or click platform). | Clean snowy platform + quiet `"Boxing Day Blues"` title breathing in upper sky (zero boxes). | First movement/key/click fades title in `0.4s` -> **`READY`**. (`?autostart` enters **`READY`** directly.) |
| **`READY`** *(walking / approaching)* | Player walks freely along the snowy platform (`A/D`, `Arrows`, or click-to-walk). | Walk toward waiting citizen; **only when close (`dist <= 415px`)**, choose 1 of 3 floating translucent speech-glyph pills (`1/2/3`, `Up/Down+Space`, or click pill), or `[P]` pause / `[R]` reset. | Far: **zero** UI pills, only platform, snow, silhouettes, and hanging LED clock. Close: **3 small translucent speech-glyph pills** bloom softly beside the citizen. | Selecting pill `1/2/3` -> **`WORKING`**. Clock reaching `18:00` -> **`COMPLETE`**. |
| **`WORKING`** *(phrase spoken; rising near-harmony)* | Player's and citizen's speech-glyph bubbles + waveform wisps drift upward into the sky archway as transit train glides past. | Listen & watch the two bubbles converge (player may still sway slightly or `[P]`/`[R]`); unselected choice pills vanish immediately. | Rising lavender & peach bubbles (`...`, `—`, worn runes + brief whispered reply inside citizen's bubble), golden-violet harmonic glow + WebAudio Rhodes dyad narrowing toward pure consonance. | At peak near-touch (`~2.2s`) -> **`CHANGED`**. |
| **`CHANGED`** *(detune, snow-dissolve & onward step)* | Just before locking into harmony, the chord gently detunes (`+38¢`) and bubbles flake into snow motes; citizen bows subtly and fades into train mist, leaving a warm lingering shimmer trace. | Walk onward rightward (`D` / `ArrowRight` / click ahead) along the platform into the next transit stop (`Morning -> Afternoon -> Dusk -> Evening`). | Scattering luminous snow wisps, `2.8°` silhouette head-bow, warm lingering trace mote hovering above platform, amber LED dot lit on hanging clock, smooth cross-dissolve to next stop. | Next stop citizen enters range -> **`READY`**; after Stop 3 (`18:00`) -> **`COMPLETE`**. |
| **`COMPLETE`** *(evening nightfall `18:00`)* | Deep plum evening snow falls quietly; hanging station clock glows `18:00`; warm traces from the day's near-connections shimmer softly in the snow. | Rest in the quiet evening atmosphere, or press/click subtle `[R]` to begin another day (`Law 12: Completion creates no new demand`). | Unobstructed evening platform, soft lingering `"Boxing Day blues"` whisper fading naturally into snow, discreet `[R]` reset glyph tucked at bottom-right margin. | `KeyR` or click `[R]` -> **`READY`** (`09:40` Morning). |
| **`FAULT`** *(asset / WebAudio unavailable)* | Image asset still decoding/missing or browser blocks `AudioContext`. | All walking, spatial phrase pills, bubble harmony, and day progression continue without interruption. | Procedural twilight sky/canopy gradient + clean capsule silhouettes render seamlessly; WebAudio/BGM catches silently (`0` console errors). | Automatic self-heal as asset decodes or first user gesture unlocks `AudioContext` -> **`RECOVERY`**. |
| **`RECOVERY`** *(pause resume or `[R]` day reset)* | Player toggles `[P]` pause or triggers `[R]` reset from any state. | Resume seamlessly from pause (`[P]`/`Space`) or restart cleanly at `09:40` Morning (`[R]`). | `[P]` shows only a tiny `‖` LED indicator on the hanging station clock; `[R]` cross-wipes snow smoothly back to `09:40` Morning with deterministic PRNG re-seeded. | Returns cleanly to **`READY`**. |

---

## 5. WIREFRAMES

### State A: `READY` (Walking & Spatial Bloom Only When Close)
```text
+------------------------------------------------------------------------------+
|  .   *      .        *         .        *          .      *        .         |
|==========+                                                      +============|
|  CANOPY  |          [ Open Twilight Sky Archway ]               |  CANOPY    |
|   ||     |                                                      |  [13:20] <-|-- Diegetic perspective
|   ||     |                 (Only when close:)                   |    ...   ||    LED clock + 3 tiny
|   ||     |              ╭─────────────────────────╮             |          ||    amber trace LEDs
|   ||     |              │ 1 · "Happy Boxing Day." │             |          ||
|   ||     |     (o)      ╰─────────────────────────╯     ( )     |          ||
|   ||     |     /|\       ╭────────────────────────╮     /|\     |          ||
|   ||     |     / \       │ 2 · "Did a box arrive?"│     / \     |          ||
|===++=====+===============╰────────────────────────╯=============+==========++|
|              Snow-dusted Transit Platform (Click or A/D to walk)             |
+------------------------------------------------------------------------------+
```

### State B: `WORKING -> CHANGED` (Near-Harmony Rising -> Detuning into Snow)
```text
+------------------------------------------------------------------------------+
|  .   *      .          ╭───────╮  *  ⚯   ╭───────╮        *        .         |
|==========+             │  ...  │  ∿     │  ───  │               +============|
|  CANOPY  |             ╰─v─────╯   ◌    ╰─────v─╯               |  CANOPY    |
|   ||     |               (Nearly harmonizing -> detuning        |  [16:45]   |
|   ||     |                into drifting snow motes)             |    ••·   ||
|   ||     |   _______________________________________________    |          ||
|   ||     |  /  [  ][  ]  SLEEK GLIDING TRANSIT TRAIN  [  ]  \   |          ||
|   ||     |     (o)                                      ( )     |          ||
|   ||     |     /|\          *  (lingering trace)        /|\     |          ||
|===++=====+=====/ \======================================/ \=====+==========++|
|              Zero bottom text box · Zero top toast · Pure world              |
+------------------------------------------------------------------------------+
```

---

## 6. VOID CONTRACT

1. **Zero Detached HUD Cards or VN Boxes:** No rectangular text boxes on the platform apron, no floating top-right clock widget, no top-center subtitle toast, no end-of-game stat modal.
2. **One Diegetic Timepiece:** Only the perspective-mapped LED sign hanging from the right station canopy reports `HH:MM` (`09:40 -> 18:00`) plus 3 tiny warm rim LEDs for resonant near-connections.
3. **Proximity-Gated Spatial Pills:** Floating speech-glyph choice pills (`1 / 2 / 3`) exist *only* in `READY` while `dist <= 415px` from an unvisited stop's citizen, positioned spatially beside them, and vanish the instant a phrase is spoken or the player walks away.
4. **In-World Consequence:** Phrase outcomes manifest entirely through bubble trajectory, color temperature (warm peach-violet convergence vs. cool slate drift), WebAudio electric-piano interval consonance and detuning (`±3¢` near-lock drifting out to `+38¢` suspension), subtle silhouette posture bow, and lingering platform shimmer motes.
5. **Clean Cutouts & Seamless Crops:** `citizen_silhouettes.png` carries `0` trapped studio-grey pixels and `0` artificial `shadowBlur` outlines; `4_scene_backgrounds_morning_to_evening.png` crops inset cleanly from seams with vertically aligned canopy/platform geometry across all 4 scenes.

---

## 7. FAILURE

How the rebuilt surface prevents regression into clutter or soft-lock:

- **No Movement Trap:** Walking (`A/D`, `Arrows`, or click-to-walk) is never locked out by entering proximity; the player can walk up to a citizen, read the blooming pills, walk past, or speak at will.
- **No Unreadable Overlap:** Choice pills appear *before* rising conversation bubbles and dissolve *into* them upon selection, so choice text and rising glyph clusters never collide in the same airspace.
- **No Wall Dead-End Across 4 Stops:** Walking rightward after an exchange smoothly pans/advances down the platform through Morning -> Afternoon -> Dusk -> Evening without hitting a hard screen edge or requiring an immersion-breaking button click.
- **Deterministic Headless Verification (`?autostart&seed=7`):** All snowfall, rune selection, particle velocities, and chord variations derive from the seeded PRNG (`seed=7`), while `AudioContext` and `bgm_loop.mp3` unlock non-blockingly so headless Chromium records at ~60 fps with `0` console errors.

---

## 8. IMPLEMENTATION

1. **Asset Matting (`assets/citizen_silhouettes.png`):** Re-matted directly from `assets/citizen_silhouettes_raw.png` via luminance + lavender-chroma separation (`purple_tint = B - G` preserving fur collars, scarves, and glowing headphone rings while eliminating neutral studio grey `RGB ~ [209,209,209]` + JPEG Gibbs ringing) plus semi-transparent edge RGB decontamination (`5,098 -> 0` trapped studio grey pixels across all 32 silhouettes).
2. **Architectural Alignment & 2.5D Occlusion (`game/index.html`):**
   - Per-panel calibrated crop rectangles (`sx, sy, sw, sh`) align platform curb (`y ≈ 660`) and canopies cleanly across all 4 panels with zero seam bleed.
   - Perspective affine transform (`ctx.transform`) paints live `HH:MM` transit time + 3 micro-LEDs directly onto the tilted hanging sign face on the right canopy (`px = 602..625`), replacing the garbled `08:86:49` texture and cutting the top-right HUD card.
   - Sleek 2-car illuminated transit train glides on the mid-ground rails (`py = 315`) and is occluded in true 2.5D behind re-stamped foreground station pillars (`px = 35..60`, `px = 644..669`) and platform slab (`py = 318..376`).
3. **WebAudio Near-Harmony & Detuning Engine (`game/index.html`):**
   - Layers `../assets/bgm_loop.mp3`, bandpass winter wind, soft snow-crunch footsteps, and a dual-voice Rhodes/glass-chime synthesizer where resonant choices glide two oscillators nearly into pure warm `Fmaj9 / Dmin9` consonance before gently detuning (`+38¢`) as the bubbles scatter into snow motes.
4. **Verification Choreography (`game/play.mjs` & `run_pipeline.py --stages verify`):**
   - Drives a poetic 14s continuous take (`?autostart&seed=7`) showcasing winter approach & spatial pill bloom (`t=2.0s`), rising warm peach/violet bubble near-harmony as the sleek train glides behind both silhouettes (`t=5.0s`), gentle detuning & comet-like snow dissolution with bowed silhouettes (`t=8.0s`), and onward progression through Afternoon, Dusk, and Evening (`18:00` `"Boxing Day blues"`).
   - **Verified Capture Metrics (`playtest/take.mp4`):** `831 frames, 13.8 s, 60.1 fps, 0 console errors` (`1920x1080`, `best.mp4`: `5.75s -> 13.75s`, score `0.0042`); side-by-side proofs (`pairs/pair_002.00.jpg`, `pair_005.00.jpg`, `pair_008.00.jpg`) visually inspected and verified clean.
