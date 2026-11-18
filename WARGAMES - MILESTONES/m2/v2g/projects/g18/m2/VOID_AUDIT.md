# VOIDBASTARD-TAO AUDIT — `g18` · Capacity Crisis (M2)

> **VOIDBASTARD-TAO ONLINE. SHOW ONLY WHAT IS TRUE NOW.**
> Every visible element is a claim about what matters now. Removal is commitment: fewer true claims create a stronger surface.

---

## 0. HONEST VIDEO-VS-GAME CRITIQUE & GEMINI PROVENANCE

### A. Brutally Honest Before-Rebuild Critique (`pair_002`, `pair_005`, `pair_008` Before)
Comparing the first-pass `projects/g18/m2/game/index.html` side-by-side against the Gemini Omni 1.2 Flash seed video (`video/gameplay.mp4` / `study/sheet.jpg`) exposed five severe visual and systemic failures:

1. **Ugly Pasted Chip Cutouts with Circular Blue Fog Halos (`pair_002/005/008` right vs. left)**:
   - In the Omni video (`f_001` → `f_014` → `f_033`), the 4 foreground brown dirt lots clear into flush, nocturnal dark-slate architectural server-hall / cryo-heatsink modules (`#1c2530` fin valleys, `#5e748b` matte gunmetal silicon dies) whose circuit traces ignite strictly along the isometric pad trenches in electric cyan (`#38d8ff`) and golden-amber (`#ffb830`).
   - The first-pass game extracted studio-lit `#e5ebf0` bright white-silver sprites from `server_hall_and_chip_icons.png` without nocturnal color grading and drew `ctx.ellipse` radial blue gradients (`rgba(80,205,255,0.65)`) beneath every pad—turning the 4 server halls into bright floating stickers inside giant circular blue soap bubbles, while unbuilt lots stamped permanent `+ CHIP LOT` text labels over visible cyan bleed from the raw map asset.
2. **Uncleaned 3-Strip Composite Artifacts & Frozen Ghost Steam in `town_map_with_lights_3_load_levels.png`**:
   - Because `town_map_with_lights_3_load_levels.png` (`1376×768`) was generated as 3 vertical load-level strips (`x≈341` and `x≈687`), its right strip baked a **permanent static white mushroom cloud of steam** above the cooling towers (`x=765..912, y=0..265`) and pre-baked glowing pads in the foreground. In `pair_002` (`t=2s`), the Omni video has **zero steam** on its matte dark cooling towers while load is calm (`+12%`), whereas the old game showed a huge frozen painted cloud with moving circles layered over it.
3. **Detached Toast Banner Violating Law 6 (`drawMapToast`)**:
   - A 590px yellow-bordered toast box (`CHIP INSTALLED: Query cost -$0.01 -> Orders accelerating!` / `JEVONS REBOUND...`) sat pinned across the top-left transmission corridor—narrating in prose what the world's surging cables, boiling cooling towers, and flickering house windows were supposed to show physically.
4. **Severe Right-Sidebar Clutter (`drawDashboard`)**:
   - `sheet.jpg` has an iconic, monumental WarGames right panel (`x=912..1280`): **only** the 4 bold monospace bars (`MONEY`, `WATER`, `OPINION`, `DEMAND`), generous dark `#0d1114` void, and the stark bordered `WEEK 7 REQUEST` box (`+1 hall: clear 4 lots` → two-tone amber/green `+1 hall: COMPLETE`).
   - The first-pass build crammed in a top `DAY X/7 · ... $0.019/q` micro-header, a `112px` `GRID LOAD` sparkline box in the middle void, and 2–3 stacked verbose instruction buttons (`[SPACE] INSTALL GEN-3 PHOTON DIE`, `[1] SELL CAPACITY +$$$ · Jevons surge!`, etc.) inside the `WEEK 7` box—shrinking and crowding every element.
5. **Turn-Locked Menu Play & Opaque End Modals**:
   - Every 1.05s the simulation froze into a sidebar button-clicking prompt instead of letting Jevons' paradox play out spatially on the isometric grid, and `BLACKOUT` slapped a `690×360` opaque modal over the map—hiding the darkened miniature town at the exact moment its blackout mattered most.

### B. Honest Post-Rebuild Assessment & Remaining Differences
- **What Now Matches `sheet.jpg` & Exceeds First-Pass Playability**:
  - **Zero circular blue halos & nocturnal-graded flush modules**: Sprites extracted from `server_hall_and_chip_icons.png` are pixel-graded from `#d8d8d8` studio lighting down to nocturnal gunmetal slate (`#5e748b` / `#17212b`), seated on flush stepped isometric plinths, with 24 crisp isometric circuit conduits per pad pulsing in cyan (`#38d8ff`) and amber (`#ffb830`) strictly inside the pad geometry.
  - **Clean nocturnal base map & true zero-to-billowing steam**: Baked ghost steam above the hyperbolic cooling towers (`y < 263`), vertical strip dividers, and pre-baked foreground pad bleed are scrubbed offscreen; cooling towers stand crisp and silent at `t=0..2s` and billow volumetric steam only as halls boil cooling water.
  - **Stark `sheet.jpg` right panel**: Top micro-header, middle sparkline box, toast banner, and stacked sidebar buttons are 100% cut. Only `MONEY`, `WATER`, `OPINION`, `DEMAND`, and the exact `WEEK 7 REQUEST` box remain.
  - **Spatial Law-5 controls**: Clicking the 4 dirt lots / halls installs & upgrades dies directly in-world; 3 compact diegetic substation breaker switches (`[1] SELL`, `[2] BUFFER`, `[3] CAP`) sit right beside the substation transformers (`x=768, y=548..644`) with a live power filament routing into the Hall Bus, Battery Racks, or Town Limiter.
- **Remaining Honest Differences vs. Seed Video**:
  1. **Diegetic Substation Breaker Rack (`x=768..896, y=548..644`)**: The passive Omni video has no allocation switches visible because the video viewer cannot toggle `[1] SELL / [2] BUFFER / [3] CAP`; we place a compact 3-throw breaker unit in the empty lower-right substation corner (dormant at `t=0` when `0` halls are built, armed once compute is online) so the core verb (`Allocate: sell, save or cap`) is playable spatially without polluting the right panel.
  2. **Pad Drop-In Trajectory**: In `f_009`–`f_014` of the Omni video, Omni briefly hallucinates an upper-row chip silhouette translating across the town edge before settling onto the 4 foreground lots; in our playable build, clicking each of the 4 brown dirt lots drops its module cleanly (`32px` vertical cubic ease-out latch) onto that exact lot's coordinates so spatial mouse picking is 1:1 deterministic.
  3. **Procedural Canvas Plasma vs. Diffusion Lightning**: Our surging golden transmission filaments and pad-to-pad arcs use multi-strand procedural jittered polylines (`#ffb830` outer glow + `#fff4c8` core) rather than neural video diffusion blur, trading painterly softness for 60 fps real-time responsiveness to player breaker throws.

### C. Full Gemini Asset & Video Provenance (Keys Redacted)

| Artifact | Model | Interaction ID | Timestamp (UTC) | Elapsed | File & Byte Size | References Used |
|---|---|---|---|---:|---|---|
| Seed Gameplay Video | `gemini-omni-1.2-flash` | `v1_ChdfTUg5YXM2dU1lMnN5dE1QMnU3ZTZRMBIXX01IOWFzNnVNZTJzeXRNUDJ1N2U2UTA` | `2026-11-18T15:19:27Z` | `39.26s` | `video/gameplay.mp4` (`4,238,959` B · `10.027s` @ `24 fps`) | `refs/m2_main_ref.png` (`31,937` B) |
| Town Map (3 Load Levels) | `gemini-nano-banana-2.1` | `v1_ChdBY0w5YXY2NklPdXl5dE1QOHBMNzRBNBIXQWNMOWF2NjZJT3V5eXRNUDhwTDc0QTQ` | `2026-11-18T15:19:44Z` | `15.41s` | `assets/town_map_with_lights_3_load_levels.png` (`471,018` B · `1376×768` RGB) | `study/f_014.jpg`, `study/f_027.jpg` |
| Server Hall & Chip Cutouts | `gemini-nano-banana-2.1` | `v1_ChdFTUw5YXBmaE0tdXl5dE1QOHBMNzRBNBIXRU1MOWFwZmhNLXV5eXRNUDhwTDc0QTQ` | `2026-11-18T15:20:10Z` | `26.14s` | `assets/server_hall_and_chip_icons_raw.png` (`691,561` B), `assets/server_hall_and_chip_icons.png` (`1,744,110` B · `1024×1024` RGBA) | `study/f_014.jpg`, `study/f_027.jpg` |
| Instrumental Soundtrack | `lyria-3-clip-preview` | `v1_ChdLOEw5YXJxZUFzbWhvX1VQcTlYeW1BVRIXSzhMOWFycWVBc21ob19VUHE5WHltQVU` | `2026-11-18T15:20:22Z` | `11.86s` | `assets/bgm_loop.mp3` (`746,594` B · `~30s` loop) | `study/f_014.jpg` |

**Exact Prompts Logged (`gemini_log.json`)**:
- **`gameplay` (`gemini-omni-1.2-flash`)**:
  > *"Clean isometric-top-down infrastructure management game on dark slate (#0f1418) with cool white (#e8eef2) town blocks and warm amber (#f2b84b) power lines. Steady angled overhead camera over a miniature town beside a server farm. As gleaming new chip modules snap into the data center halls, glowing amber electricity surges triple in speed along the cables, causing peaceful neighborhood house windows to flicker and dim toward blackout while cooling towers vent plumes of steam. Continuous unbroken gameplay shot, no scene cuts, no gibberish text. Use the reference image for map-and-meter composition. Sound design: transformer hum rising in pitch, relay switches clicking. No dialogue."*
- **`town_map_with_lights_3_load_levels` (`gemini-nano-banana-2.1`)**:
  > *"Clean 2D/2.5D game environment asset for \"Capacity Crisis\": Town map with lights, 3 load levels. strictly harmonized palette (#0f1418, #e8eef2, accent #f2b84b), style: A town map whose lights flicker as load rises; a plain dashboard beside it.. No UI text, no characters baked in, crisp game-ready art matching the reference gameplay frame."*
- **`server_hall_and_chip_icons` (`gemini-nano-banana-2.1`)**:
  > *"Isolated 2D game sprite sheet / prop for \"Capacity Crisis\": Server hall and chip icons. Centered full silhouette, isolated on a flat uniform light grey studio background (#d8d8d8), even lighting, zero drop shadow, no text, strictly harmonized palette (#0f1418, #e8eef2, accent #f2b84b), style: A town map whose lights flicker as load rises; a plain dashboard beside it., matching the reference gameplay frame."*
- **`bgm_loop` (`lyria-3-clip-preview`)**:
  > *"Instrumental 30-second loopable game soundtrack for \"Capacity Crisis\" (Jevons’ paradox: making something more efficient makes people use more of it.). Visual mood: A town map whose lights flicker as load rises; a plain dashboard beside it.. Purely instrumental, cohesive game loop, no vocals."*

---

## 1. WAY
One miniature town shares one high-voltage substation with your expanding data center; every silicon efficiency upgrade cuts cost-per-query and immediately triggers a Jevons demand rebound across the overhead amber grid, forcing you to physically route substation power (`SELL`, `BUFFER`, `CAP`) beside the transformers to survive 7 days without plunging the neighborhood into blackout.

---

## 2. OBSTRUCTION
- **Prose Toast Narration (`drawMapToast`)**: Top-left banner explaining Jevons' paradox in text instead of letting accelerating amber cable plasma, rising steam plumes, and dimming house windows speak for themselves.
- **Circular Radial Sprite Halos**: Elliptical blue radial fog blobs (`ctx.ellipse`) and ungraded `#e5ebf0` studio-white chip cutouts breaking isometric ground truth.
- **Baked Ghost Steam & 3-Strip Seams**: Static white cloud and cyan pad bleed in the raw map asset claiming high load during calm morning idle.
- **Detached Sidebar Chrome**: Top micro-header (`DAY X/7 ... $/q`), middle `GRID LOAD` sparkline box, and 3 stacked verbose buttons crowding the `WEEK 7 REQUEST` box.
- **World-Hiding Failure/End Modals**: `690×360` opaque overlay boxes concealing the blacked-out town at the moment of grid collapse.

---

## 3. KEEP-CUT LEDGER

| Surface / Element | Verdict | VOIDBASTARD-TAO Law & Justification |
|---|---|---|
| Isometric town (`63` live windows), pylons, substation & cooling towers | **KEEP & CLEAN** | Laws 1, 6, 11 — Shows true grid health, water boil-off, and voltage sag directly in the world; scrubbed static steam & strip seams. |
| 4 foreground isometric dirt lots → flush nocturnal heatsink/silicon halls | **KEEP & REBUILD** | Laws 4, 5, 6 — Direct spatial build/upgrade pads (`Click` / `Space`); cut circular blue fog halos & permanent `+ CHIP LOT` text stamps. |
| Hovered pad wireframe + compact `+HALL` / `GEN-X DIE` pill | **KEEP (CONDITIONAL)** | Laws 4, 5 — Appears **only** on the hovered pad **only** while build/upgrade is valid. |
| 3 compact substation breaker switches (`[1] SELL`, `[2] BUFFER`, `[3] CAP`) | **ADD SPATIALLY** | Laws 4, 5, 7, 9 — Placed beside substation transformers (`x=768, y=548..644`) with live routing filament; dormant until ≥1 hall is online. |
| 4 stark right-panel WarGames bars (`MONEY`, `WATER`, `OPINION`, `DEMAND`) | **KEEP** | Laws 2, 14 — Matches `sheet.jpg` 1:1; exposes treasury, cooling reserve, civic trust, and Jevons surge pressure. |
| `WEEK 7 REQUEST` bordered status box (`+1 hall: clear X lots` / `COMPLETE`) | **KEEP** | Laws 3, 8, 12 — Preserves exact `sheet.jpg` two-tone status + subtle 7-day micro-pips + `[R]` recovery on `BLACKOUT` / `SURVIVED`. |
| Top-left yellow toast banner (`CHIP INSTALLED...` / `JEVONS REBOUND...`) | **CUT** | Law 6 — Generic toast narration; replaced by triple-speed golden cable plasma & house brownouts. |
| Right-panel top header (`DAY X/7 · MORNING ... $0.050/q`) | **CUT** | Laws 1, 2 — Redundant telemetry clutter absent from `sheet.jpg`. |
| Right-panel `GRID LOAD` sparkline graph box (`350..462px`) | **CUT** | Laws 2, 13 — Duplicates `DEMAND` bar & cable plasma while destroying the calm dark void of `sheet.jpg`. |
| Stacked verbose buttons inside `WEEK 7` sidebar box | **CUT** | Law 5 — Detached HUD buttons replaced by spatial pad clicks and substation breaker throws. |
| Opaque `690×360` `TOWN BLACKOUT` & `WEEK REPORT` map-blocking modals | **CUT** | Laws 6, 12 — Keep the blacked-out or rescued miniature town visible; surface concise outcome + `[R]` in `WEEK 7 REQUEST`. |

---

## 4. STATE MAP

| VOID State | Engine Phase | Dominant Purpose | Valid Player Operation | World & Panel Truth |
|---|---|---|---|---|
| **REST** | `title` | Commit to opening the facility (skipped on `?autostart`). | `Click [START]`, `Enter`, or `Space`. | Dimmed nocturnal town behind stark `m2_title_ref` typography (`CAPACITY CRISIS` / `half the cost. triple the demand.` / `[START]`). |
| **READY** | `morn` (`hallsBuilt = 0`) | Clear initial dirt lots to bring data center halls online. | Click any of 4 dirt lots or press `Space`/`Enter`. | Calm lit town (`41%` opinion, `64%` water), zero cooling-tower steam, spaced amber cable dashes, dormant breaker rack, `+1 hall: clear 4 lots`. |
| **WORKING** | `morn` / `day` (`hallsBuilt >= 1`) | Expand/upgrade silicon while routing substation load across 7 days. | Click valid lot/hall (`Space`) to upgrade die; toggle spatial breakers `[1] SELL`, `[2] BUFFER`, `[3] CAP`. | Flush dark-slate halls hum; cooling steam scales with water draw; substation LEDs & power filament reflect active breaker. |
| **CHANGED** | Jevons Rebound (`surgeLevel > 0.55`) | Feel efficiency backfire into triple afternoon demand & brownout risk. | Throw `[2] BUFFER` (expand MW reserve) or `[3] CAP` (throttle intake & relight town) or ride `[1] SELL` for `$M`. | Twin braided golden plasma arcs race down pylons & bridge across all 4 pads; cyan/amber pad traces blaze; house windows flicker; `DEMAND` turns `#dc4c4c` red. |
| **COMPLETE** | `end` (Day 7 survived) | Inspect week survival & allocation record without new demand. | Press `R` / `Enter` / `Click` to start a new week. | Surge settles, surviving town windows glow steadily, `WEEK 7 SURVIVED` + `S/B/C` tally in green `#63b868` box. |
| **FAULT** | `black` (`load > cap` sustained) | Witness grid collapse when Jevons demand outruns substation power. | Press `R` / `Enter` / `Click` to rebuild week. | All `63` town windows snap dark, overhead cables extinguish in red/amber sparks, transformer pitch drops to `24Hz`, `GRID BLACKOUT · [R] REBUILD WEEK` in crimson `#dc4c4c`. |
| **RECOVERY** | `[3] CAP` / `[2] BUFFER` / `[R]` | Reversible live load shedding before trip, or instant clean reset after trip. | Key `3` / `2` (in-run recovery) or `R` (post-fault reset). | `[3] CAP` visibly calms pad arcs and relights brownout windows; `[R]` restores Day 1 clean dirt lots in `<16ms`. |

---

## 5. WIREFRAMES

### A. Active Play (`WORKING` / `CHANGED` — 1280×720)
```text
+-------------------------------------------------------------------------+------------------------+
|  \  \  Twin Golden-Amber Transmission Lines (speed & braid = load)      |                        |
|   [Pylon]                                                               |  MONEY          $1.8M  |
|          \  \                                           (Steam Plumes)  |  ████████████████████  |
|   [Lit/Flickering]   \  \                                  (  )  (  )   |                        |
|   [Town Houses   ]    [Pylon] -> [Substation Battery Yard] |  |  |  |   |  WATER            12%  |
|   [63 Windows    ]               [LEDs = BUFFER charge   ] [Towers  ]   |  ███░░░░░░░░░░░░░░░░░  |
|                                         /        \         |            |                        |
|                         +--------------+          +----+   |            |  OPINION           0%  |
|                        / [Pad 0: Cryo Heatsink]         \  v            |  ███░░░░░░░░░░░░░░░░░  |
|         [Pad 1: Die B]        (cyan/amber seams)   [Pad 2: Die C]       |                        |
|                        \                          /        +----------+ |  DEMAND         +100%  |
|                         [Pad 3: Die D] <---------+---------| [1] SELL | |  ████████████████████  |
|                          (click/Space = +Hall / Gen Die)   | [2] BUF  | |                        |
|                                                            | [3] CAP  | |  +------------------+  |
|                                                            +----------+ |  |  WEEK 7 REQUEST  |  |
|                                                                         |  | +1 hall: COMPLETE|  |
|                                                                         |  +------------------+  |
+-------------------------------------------------------------------------+------------------------+
|<------------------------------ 912 px Map ----------------------------->|<--- 368 px Sidebar --->|
```

### B. Calm Start (`READY` — `t = 0s` with `?autostart`)
```text
+-------------------------------------------------------------------------+------------------------+
|  .  .  Calm spaced amber cable dashes                     (Zero Steam)  |                        |
|   [Lit Peaceful Town]            [Substation Yard]         [Silent  ]   |  MONEY          $1.2M  |
|                                                            [Towers  ]   |  ████████████████░░░░  |
|                        ◇ Dirt Lot 0                                     |  WATER            64%  |
|               ◇ Dirt Lot 1      ◇ Dirt Lot 2   (Breaker rack dormant    |  OPINION          41%  |
|                        ◇ Dirt Lot 3             until 1st hall built)   |  DEMAND          +12%  |
|                                                                         |  +------------------+  |
|                                                                         |  |  WEEK 7 REQUEST  |  |
|                                                                         |  |+1 hall: clear 4..|  |
+-------------------------------------------------------------------------+------------------------+
```

---

## 6. VOID CONTRACT
1. **Zero Floating Toasts**: No text banner may ever appear over the sky, transmission pylons, town roofs, or server pads to narrate system changes.
2. **Zero Circular Sprite Halos**: Server halls sit on flush isometric plinths (`#121a22`); all cyan (`#38d8ff`) and amber (`#ffb830`) illumination must follow isometric circuit traces and overhead/inter-pad power buses.
3. **Strict Right-Panel Discipline**: The `[912..1280]` panel contains **only** the 4 WarGames bars (`MONEY`, `WATER`, `OPINION`, `DEMAND`) and the single `WEEK 7 REQUEST` status box—never sparklines, sub-headers, or stacked button menus.
4. **Spatial & Conditional Controls**: Pad wireframes appear **only** on the hovered pad **only** while an install or silicon upgrade is valid; substation breakers appear **only** beside the substation **only** while halls are active.
5. **World Visibility on Terminal States**: `BLACKOUT` and `WEEK 7 SURVIVED` never obscure the miniature town behind a centered modal wall.

---

## 7. FAILURE
- **How Failure Approaches (Law 10 & Law 14)**: Pushing efficiency upgrades while holding `[1] SELL` drives `DEMAND` above `+82%` (crimson bar), dims house windows in staggered voltage-sag waves (`threshold 0.44..0.96`), pitches up the WebAudio 58Hz/116Hz substation hum, and triggers high-frequency brownout crackles (`>86%` capacity).
- **How Failure Lands**: Sustaining `loadMW > capMW * 1.03` for `0.70s` without buffered battery charge trips the main substation breaker—snapping all `63` house windows dark, showering sparks across the transformer yard, sweeping transformer pitch down (`155Hz → 24Hz`), and turning `WEEK 7 REQUEST` crimson (`GRID BLACKOUT` / `[R] REBUILD WEEK`).
- **Immediate Recovery (Law 8)**: Pressing `R`, `Enter`, `Space`, or clicking resets cleanly to Day 1 in `<16ms` with deterministic PRNG (`?seed=N`).

---

## 8. IMPLEMENTATION
- **Rebuilt Files**:
  - `projects/g18/m2/game/index.html`: Single-file 1280×720 Canvas + WebAudio simulation implementing offscreen nocturnal sprite color grading (`extractNocturnalSprite`), 3-strip seam + static-steam scrubbing + clean hyperbolic cooling-tower rendering (`buildCleanMapLayer`), flush isometric heatsink/die plinths with 24 live cyan/amber traces per pad (`drawIsometricPad`), catenary multi-strand golden transmission plasma (`drawPowerGrid`), spatial substation breaker rack (`drawSubstationBreakers`), stark `sheet.jpg` right panel (`drawRightPanel`), `?autostart`, `?seed=N`, `../assets/bgm_loop.mp3` + WebAudio transformer hum / steam hiss / breaker clack / brownout crackle, and `window.__game.state`.
  - `projects/g18/m2/game/play.mjs`: Spatial mouse + keyboard playtest choreography clearing the 4 dirt lots (`t=0.45..2.28s`), toggling `[2] BUFFER` → `[1] SELL` beside the substation (`t=3.0..3.5s`), upgrading Gen-2/Gen-3/Gen-4 silicon dies (`t=5.2..7.3s`) to drive full `+100%` crimson Jevons cascade at `t=8.0s`, and throwing `[3] CAP` (`t=8.65s`) right beside the substation to rescue the town.
- **Verification Telemetry (`run_pipeline.py --project g18 --milestone m2 --stages verify`)**:
  - `playtest/take.mp4`: **`776 frames, 14.0 s, 55.6 fps, 0 console errors`**
  - `playtest/best.mp4`: **`1.00 s -> 9.00 s` (`score 0.0037`)**
  - Visually inspected `pairs/pair_002.00.jpg`, `pairs/pair_005.00.jpg`, and `pairs/pair_008.00.jpg` side-by-side against `study/sheet.jpg` (`ZERO_SECRETS_OK`).
