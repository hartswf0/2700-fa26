# VOIDBASTARD-TAO AUDIT · `g24` — Memory Munitions (M2)

## 0. HONEST VIDEO-VS-GAME CRITIQUE & GEMINI PROVENANCE

### Honest Critique of the First-Pass Build vs. Omni Seed Video (`study/sheet.jpg`)
Comparing `video/gameplay.mp4` (`study/sheet.jpg`, `study/f_005.jpg`, `f_014.jpg`, `f_022.jpg`, `f_036.jpg`) directly against the original M2 HTML build (`pairs/pair_002.00.jpg`, `pair_005.00.jpg`, `pair_008.00.jpg`) exposed five glaring regressions:

1. **Three Detached HUD Boxes Violating the Pure Open Sky**: The Omni seed video has **zero** top HUD bars—its entire emotional punch comes from warm sepia photographs floating starkly against deep void black (`#05080a`) above a glowing mint grid. The first-pass HTML build bolted three boxed monospace banners across the top edge (`CHASSIS 68% | MODE: [K] DISABLE BEAM`, `MEMORY #1 SHATTERED: GABLE HOUSE, 1984 / Minigun tore this memory into unreadable shards.`, and `SAVED 0/8 · ERASED 1/8`), plus floating rectangular enemy health bars and a literal `"✓ SAVED TO ALBUM"` text label hovering over recovered photographs.
2. **Dwarfed Actor Scale & Flat Lighting**: In `study/f_005.jpg` and `f_022.jpg`, the cyber-soldier (~395px tall, 55% of viewport height) and magenta sentinel (~415px tall, 58% of viewport height) command the frame with glossy cyan/magenta floor light pools. The first-pass HTML build rendered the soldier at 248px (34% height) and enemies at 265–272px, leaving the characters tiny and flat.
3. **Zoomed-In Muddy Shards Instead of Miniature Photographs**: In `study/f_014.jpg` and `f_022.jpg`, a shattered robot erupts into dozens of crisp miniature golden-bordered Polaroids tumbling in 3D perspective and settling foreshortened onto the glossy grid floor. The first-pass build sliced a 240×180 canvas into 30 zoomed-in UV sub-rectangles that clumped in a blurry beige cloud behind the player.
4. **Leftover Enclosed Studio-Grey Cutout Islands**: Inspection of `player_robot_with_minigun.png` and `2_enemy_robot_types.png` revealed `1,775` and `6,805` residual studio-grey (`~#cfcfcf–#d8d8d8`) pixels trapped inside arm/rifle/leg loops where edge flood-fill could not reach, plus grey fringe spill.
5. **2.5-Second Pre-Roll Desync in Verification Capture**: Because `?autostart` immediately activated enemy movement during `record_play.mjs`'s 2.5s pre-screencast warmup, Enemy #0 was already dead before `t = 2.0s`, causing `pair_002`, `pair_005`, and `pair_008` to miss the Omni video's choreography and overlap disabled robots behind the player's legs.

### What Was Rebuilt & What Honestly Still Differs from the Omni Video
- **What we fixed**: Stripped 100% of top HUD boxes, toast banners, floating enemy health bars, and `"✓ SAVED TO ALBUM"` text; scrubbed enclosed studio-grey pockets and edge fringes on both sprite sheets; scaled the soldier (`374px`) and sentinels (`402px`) to match the video's arcade framing; added additive cyan/magenta/gold floor light pools, two-pass neon grid bloom, 3D-tilting miniature Polaroid shards that settle foreshortened onto the floor, kneeling powered-down robot clipping with shoulder steam (`f_036.jpg`), and diegetic spine-cell health + muzzle barrel heat + core harmonic lock rings.
- **What honestly still differs from `gameplay.mp4`**:
  - **2D Sprite Poses vs. Continuous 3D Mesh Articulation**: The Omni 1.2 Flash video renders continuous 3D skeletal articulation, smooth torso twist while running, and volumetric raytraced specular reflections on metallic armor plates. Our HTML5 Canvas game animates discrete 2D sprite frames from `gemini-nano-banana-2.1` (`player_robot_with_minigun.png` and `2_enemy_robot_types.png`), which carry bold 2D inked outlines rather than smooth PBR shading.
  - **Procedural Particle Physics vs. Neural Fluid Simulation**: Our shattering Polaroids, golden bokeh fireflies, and 4-strand sine-wave plasma beam approximate the Omni video's neural slow-motion curl and volumetric smoke in real-time 60fps 2D Canvas, rather than per-pixel 3D depth-of-field blur.

### Complete Gemini API & Asset Provenance (`gemini_log.json`)
- **Seed Gameplay Video (`video/gameplay.mp4`)**
  - **Model**: `gemini-omni-1.2-flash`
  - **Interaction ID**: `v1_ChdETUw5YXBhT0JvbU95dE1QcjlLRXVBdxIXRE1MOWFwYU9Cb21PeXRNUHI5S0V1QXc`
  - **Timestamp / Elapsed**: `2026-11-18T15:19:42Z` · `44.38s` (`1280x720`, `24.0 fps`, `10.027s`, 40 study frames `f_001.jpg`–`f_040.jpg`)
  - **Reference Input**: `projects/g24/m2/refs/m2_main_ref.png`
  - **Prompt**: *"1980s arcade neon side-scrolling run-and-gun game on deep void black (#07060c) with electric mint (#5dff9e) vector grid floors and hot magenta (#ff4fb0) robot enemies. Steady side-on 2.5D tracking camera. A sleek cybernetic soldier fires rapid neon bursts, then switches to a precision disable beam: the first robot shatters into warm golden-sepia photographic memory shards floating in slow motion, while the second robot powers down intact releasing a glowing intact memory photograph. Continuous unbroken gameplay shot, no scene cuts, no HUD text. Use the reference image for perspective grid and neon palette. Sound design: punchy 80s synth bassline, laser zaps, crystalline chime. No dialogue."*
- **Generated Visual & Audio Assets (`assets/gemini_log.json`)**
  1. `player_robot_with_minigun.png` — `gemini-nano-banana-2.1` (`17.11s`, `1:1` 1K, cutout cleaned from `_raw.png`), grounded on `study/f_014.jpg` & `study/f_027.jpg` (`id: v1_ChdFTUw5YXYtMU12UG55dE1QMnRUNW1BMBIXRU1MOWF2LTFNdlBueXRNUDJ0VDVtQTA`).
  2. `2_enemy_robot_types.png` — `gemini-nano-banana-2.1` (`20.16s`, `1:1` 1K, cutout cleaned from `_raw.png`), grounded on `study/f_014.jpg` & `study/f_027.jpg` (`id: v1_ChdJY0w5YXNTRU5zeXR3YlVQcDVIMnlBaxIXSWNMOWFzU0VOc3l0d2JVUHA1SDJ5QWs`).
  3. `8_memory_fragments_photo_map_message.png` — `gemini-nano-banana-2.1` (`20.72s`, `16:9` 1K), grounded on `study/f_014.jpg` & `study/f_027.jpg` (`id: v1_ChdPTUw5YXZyZUpfT0N5dE1QMjh5VHVBZxIXT01MOWF2cmVKX09DeXRNUDI4eVR1QWc`).
  4. `bgm_loop.mp3` — `lyria-3-clip-preview` (`14.12s`, 30s instrumental synth loop), grounded on `study/f_014.jpg` (`id: v1_ChdTc0w5YXJTWkxQek15dE1QM3Q3ci1BURIXU3NMOWFyU1pMUHpNeXRNUDN0N3ItQVE`).

---

## 1. WAY
Speed erases evidence; restraint preserves identity. Every robot on the neon grid carries one irreplaceable human memory inside its core: pulling the minigun trigger (`Space`/`J`) clears the threat fast in a visceral burst of unreachable golden shards, whereas holding the closer-range precision disable beam (`K`/`Shift`) forces the player to stand exposed in the line of fire until the robot kneels and surrenders the photograph whole.

---

## 2. OBSTRUCTION
- **Detached Top Telemetry Chrome**: Three boxed top banners (`CHASSIS %`, `MEMORY SHATTERED/RECOVERED` toast, `SAVED/ERASED` counter) dragged the player's eyes out of the gunfight and ruined the stark black void above the grid.
- **Floating Health Bars & Text Tags**: Rectangular HP bars over enemies and `"✓ SAVED TO ALBUM"` floating strings turned poetic visual consequences into spreadsheet rows.
- **Boxed Modal Title Wall**: A 900×440 bordered instruction box hid the live neon world on startup.

---

## 3. KEEP-CUT LEDGER

| Surface / Element | Verdict | Reason (VOIDBASTARD-TAO Element Test) |
| :--- | :--- | :--- |
| Top-left `CHASSIS %` + weapon mode box + 8-pip bar | **CUT** | Replaced by 4 diegetic cyan/magenta spine cells & armor rim-glow on the cyber-soldier + live barrel heat glow on the gun tip. |
| Top-center `MEMORY #N SHATTERED / RECOVERED` toast box | **CUT** | Redundant narration of what the player already sees happening physically in the center of the world. |
| Top-right `SAVED X/8 · ERASED Y/8` counter box | **CUT** | Deferred to the end-of-run physical `ALBUM` table (`COMPLETE`), keeping active combat 100% chrome-free. |
| Floating rectangular HP/disable bar over enemy heads | **CUT** | Replaced by golden memory-fissures leaking from damaged robot cores and a constricting cyan harmonic ring directly on the chest core during beam lock. |
| `"✓ SAVED TO ALBUM"` text above recovered Polaroid | **CUT** | Replaced by physical absorption of warm golden fireflies into the soldier's visor as you walk past (`+12` integrity). |
| Boxed 900×440 Title Modal (`strokeRect`) | **CUT** | Replaced in non-autostart `REST` by open live world + spatial `[SPACE] SHATTER` / `[K] RECOVER` callouts beside the muzzle. |
| Twin-helix cyan beam + 3D sepia shards + kneeling steam | **KEEP & UPGRADE** | Core spatial truth of the two verbs and direct visual anchor to `study/sheet.jpg`. |
| End-of-level 8-slot Memory Album + `[R]` recovery | **KEEP & REFINE** | Essential `COMPLETE` / `RECOVERY` payoff showing kept Polaroids vs. torn shards without modal bloat. |

---

## 4. STATE MAP

| State | Dominant Purpose & Action | What Is Shown (Spatial / Diegetic) | What Is Hidden |
| :--- | :--- | :--- | :--- |
| `REST` | Commit first movement or shot (non-autostart) | Live neon grid, breathing soldier, title mark in upper void, `[SPACE] SHATTER` / `[K] RECOVER` beside gun barrel | All top bars, album grid, enemy fire |
| `READY` | Poised entry on `?autostart` before first input | Pure chrome-free neon grid, cyber-soldier at `x=295`, Sentinel #0 poised on right, zero text | Title text, HUD boxes, premature ambush |
| `WORKING` | Run, jump, shatter (`Space`/`J`), or lock beam (`K`/`Shift`) | Spine integrity cells, muzzle heat glow, plasma bolts, golden core fissures, cyan core lock ring | All text chrome and banners |
| `CHANGED` | Witness irreversible memory erasure or intact recovery | 38 slow-mo 3D-tumbling sepia Polaroids settling on floor OR kneeling robot venting teal steam beside a firefly-haloed Polaroid | Modal popups, toast banners |
| `COMPLETE` | Inspect the story pieced together from kept vs. erased memories | 8 physical Polaroids/maps/letters laid out on dark void (`KEPT X/8 · SHATTERED Y/8`) + `[R] RUN AGAIN` | Combat actors |
| `FAULT` | Recognize chassis failure on the grid | Soldier dropped to one knee on the neon grid with dimmed visor + spatial `[R] REBOOT CHASSIS` beside chassis | Full-screen boxed game-over modal |
| `RECOVERY` | Instant deterministic reset (`[R]` / `Enter` / click) | Immediate transition back into `WORKING` at `x=295` with fresh chassis and reset seed | Loading screens or confirmation prompts |

---

## 5. WIREFRAMES

```text
[WORKING / CHANGED — ZERO HUD CHROME, 100% OPEN CENTER]
+--------------------------------------------------------------------------+
|                                                                          |
|          [ ~ ~ drifting miniature sepia Polaroids ~ ~ ]                  |
|                                               .  *  +---------+  *  .    |
|                 (4 spine cells)              *      |  WARM   |      *   |
|                    [Soldier]====(cyan helix)=======>|  SEPIA  |  (steam) |
|                    /      \                         |  PHOTO  |   [Robot]|
|~~~~~~~~~~~~~~~~~~~/~~~~~~~~\~~~~~~~~~~~~~~~~~~~~~~~~+---------+~~~/~~~~\~|
|  \      \      \  (cyan pool)   \      \     (gold pool)    (magenta)    |
+---\------\------\----------------\------\-----------------------\--------+

[FAULT / RECOVERY]                        [COMPLETE — PHYSICAL ALBUM]
+------------------------------------+    +------------------------------------+
|                                    |    |     KEPT 4/8  ·  SHATTERED 4/8     |
|                                    |    |  [Photo 1] [Torn #2] [Photo 3] ... |
|      [Kneeling Soldier] [R] REBOOT |    |  [Torn #5] [Map #6 ] [Note #7] ... |
|~~~~~~/~~~~~~~~~~~~~~~~~~~~~~~~~~~~~|    |            [R] RUN AGAIN           |
+------------------------------------+    +------------------------------------+
```

---

## 6. VOID CONTRACT
1. **Zero Top-Edge or Corner HUD Chrome**: During `READY`, `WORKING`, and `CHANGED`, zero pixels in the upper sky (`y < 180`) are occupied by UI panels, counters, or text banners; only world-space sepia shards and golden embers may traverse the void.
2. **Every Consequence Is Physical and Non-Blocking**: Destroying or disabling a robot never pauses player movement or spawns a text modal; shattered memories scatter onto the reflective grid floor, and recovered Polaroids hover in world space with their sepia title inked onto the paper border itself.
3. **Controls & Telemetry Live on the Hardware**: Integrity lives on the soldier's 4 spine cells + armor rim hue; weapon stress lives on muzzle heat bloom; disable progress lives as a constricting cyan ring on the target robot's chest core.

---

## 7. FAILURE
- **Failure Mode Prevented #1 (Accidental First-Click Shot / Pre-Roll Desync)**: Previously, `?autostart` ran enemies during headless browser warmup so Enemy #0 died off-beat. Gating enemy advance on `READY -> WORKING` engagement makes human iframe focus and automated capture align cleanly at `t = 0.0s`.
- **Failure Mode Prevented #2 (Minigun Trivializing Disable Risk)**: Added barrel heat buildup (`p.heat` -> `0.55s` steam vent overheat) and `+12` chassis integrity restoration when passing a recovered Polaroid, rewarding players mechanically as well as narratively for daring to use the close-range disable beam.
- **Failure Mode Prevented #3 (Opaque Studio Grey Loops)**: Scrubbed enclosed neutral studio-grey islands (`#cfcfcf–#d8d8d8`) both in the saved PNG assets and via an offscreen canvas pass on load.

---

## 8. IMPLEMENTATION
- **Files Updated**:
  - `projects/g24/m2/assets/player_robot_with_minigun.png` & `2_enemy_robot_types.png` (cleaned interior studio-grey islands and edge halos from `_raw.png`).
  - `projects/g24/m2/game/index.html` (pure 60fps HTML5 Canvas run-and-gun with coyote time, jump buffering, hit-stop, additive floor light pools, 3D-tilting miniature Polaroid shards, firefly-haloed recovered photographs, Lyria BGM + WebAudio harmonic beam synth, `?autostart`, `?seed=N`, and `window.__game.state`).
  - `projects/g24/m2/game/play.mjs` (responsive keyboard playtest showcasing mid-air minigun duel at `2.0s`, drifting golden shards at `5.0s`, and intact Polaroid recovery beside the kneeling robot at `8.0s`).
- **Verification Metrics (`run_pipeline.py --project g24 --milestone m2 --stages verify`)**:
  - `take.mp4`: `823 frames, 13.8 s, 59.5 fps, 0 console errors`
  - Side-by-side pairs inspected & verified: `pairs/pair_002.00.jpg`, `pairs/pair_005.00.jpg`, `pairs/pair_008.00.jpg` (zero HUD clutter, zero sprite grey islands, direct compositional & chromatic alignment with `study/sheet.jpg`).
