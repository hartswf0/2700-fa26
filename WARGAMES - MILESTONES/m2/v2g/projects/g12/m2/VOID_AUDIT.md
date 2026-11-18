# VOIDBASTARD-TAO AUDIT — Group 12: HIVE (`g12` · M2)

> **Operational Emptiness Mandate**: *Every visible element is a claim about what matters now. Removal is commitment: fewer true claims create a stronger surface.*

---

## 0. HONEST VIDEO-VS-GAME CRITIQUE & GEMINI PROVENANCE

### Brutally Honest Video-vs-Game Critique (First-Pass Build vs. `video/gameplay.mp4`)

Inspecting `study/sheet.jpg` (`f_001.jpg`–`f_040.jpg`) side-by-side against the first-pass `pairs/pair_002.00.jpg`, `pairs/pair_005.00.jpg`, and `pairs/pair_008.00.jpg` exposes seven concrete failures in the initial HTML5 build:

1. **Detached HUD Chrome & Framed Text-Box Clutter**:
   - `gameplay.mp4` contains **zero** HUD text, **zero** top status bars, and **zero** rectangular dialogue boxes (`omni_gameplay_prompt`: *"Continuous unbroken gameplay shot, no scene cuts, no HUD text"*).
   - The first-pass build stamped a top-left Courier telemetry bar (`SECTOR 01 · CONTAINMENT LAB · MASS 2/3 · MEMORIES 1`), floating doorway labels (`SECTOR 02 >>` / `EXIT BULKHEAD OPEN`), comic-book `!` alerts over guards, a 3-line `HOW TO PLAY` box on the title screen, a `600×220` framed `SPECIMEN CAUGHT` prose modal, an `880×470` framed ending text box, and an `860×62` gold-stroked dark rectangle (`#0a0e0d`) across the lower third of the room during every memory flash—chopping right across the lab walls and severing the human silhouettes' legs in `pair_002.00.jpg` and `pair_008.00.jpg`.
2. **Residual `#d8d8d8` Studio Background Cutout Halos**:
   - Pixel inspection of the `cutout.py`-processed PNGs revealed **7,976 neutral-grey (`#d8d8d8`) halo pixels** trapped inside `node_sprite.png` between its outer crimson ring and inner pod, **1,506 grey fringe pixels** around `creature_sprite_3_sizes.png`, and **14,438 grey fringe pixels** around `guard_sprite.png`.
   - In `pair_002.00.jpg` and `pair_005.00.jpg`, every node looked like a muddy white-rimmed coin rather than the pure crimson bio-ring (`#e0523c`) with a 4-lobed pulsing core in `f_014.jpg`, and the rotated creature exhibited jagged pale stair-stepped fringes.
3. **Unlit Bright Tilemap & Flat Triangle Cones**:
   - `3_room_tile_maps.png` was rendered at 100% unshadowed brightness, making upper-left server racks, green CRTs, and crates visually loud in what should be near-black (`#070c0a`–`#141615`) stealth darkness (`study/study.json` top 4 palette shares = 56.4% deep obsidian).
   - Meanwhile, the guard's flashlight was drawn as a flat yellow alpha polygon without lifting room darkness, illuminating floor tiles, softening penumbra edges, or casting a lens hotspot—and **missed the vertical lab console occluder at `(772, 486, 58×179)`**, letting light pass straight through solid lab furniture that casts a prominent diagonal shadow in `f_014.jpg` and `f_027.jpg`.
   - Worse, Room 0 added an extraneous second mid-corridor guard (`x=1060, y=388`) absent from `sheet.jpg`, cluttering the right half of the frame with intersecting cones.
4. **Peg-Doll Silhouettes & Unclipped Floor-Bloom**:
   - In `f_033.jpg` (`pair_008.00.jpg` left), the memory flash is an awe-inspiring golden neural-caustic floor dome clipped cleanly *inside* the facility's outer phosphor-mint walls (`y=52..667`), framing two anatomically expressive lab-coat researchers in profile (glasses, collars, exchanging a glowing tablet) over the hollow crimson ring of the absorbed node (`(640, 522)`).
   - In the first-pass build (`pair_008.00.jpg` right), the dome spilled outside the top and bottom facility walls into the black letterbox margin, used stiff geometric peg-doll silhouettes, and drew horizontal sine lines instead of cellular golden caustic webbing.
5. **Stiff Creature Presence vs. Organic Biomass**:
   - In `f_014.jpg`, `f_027.jpg`, and `f_038.jpg`, the creature is a substantial, glossy obsidian membrane with a pale-mint rim highlight, pulsing multi-chambered crimson core, red eyes, and thick, tapered, floor-grasping tentacles with pale suction tips. In the first-pass build, the creature was underscaled and stapled onto 4 thin wire strokes.
6. **Broken Beat Timing in `pairs/pair_002.00.jpg`**:
   - Because `play.mjs` immediately ate the bottom-left node at `t=0.7s`, `pair_002.00.jpg` (`t=2.0s`) showed a giant off-center yellow circle and text box covering the left room instead of pure stealth stalking behind the central partition (`f_009.jpg`).
7. **Missing Operational Pause & Diegetic Recovery**:
   - Active stealth lacked a clean `[P]` pause operation (Law 7), and getting caught forced a prose modal instead of immediate spatial truth + crisp `[R]` retry beside the locked creature (Law 8).

### Honest Remaining Differences After VOIDBASTARD-TAO Rebuild

Even after stripping all HUD chrome, sanitizing `#d8d8d8` sprite fringes on offscreen canvases, adding dynamic darkness + console shadow occlusion, upgrading organic verlet/IK bio-tendrils, clipping the Voronoi-caustic researcher bloom to facility walls, and inscribing faint diegetic memory whispers directly onto the floor tiles, **we never claim fake pixel-identity with `gameplay.mp4`**:

1. **Generative Video Diffusion vs. Real-Time 2D Canvas Hybrid**: `gameplay.mp4` (`gemini-omni-1.2-flash`) fluidly hallucinates frame-by-frame specular deformations across the creature's membrane and morphs tentacle topology without rigid sprite boundaries. Our HTML5 build combines sanitized `gemini-nano-banana-2.1` pixel-art sprites (`creature_sprite_3_sizes.png`, `guard_sprite.png`, `node_sprite.png`) with procedural articulated bio-tendrils, glossy membrane shading, and real-time 2D raycast visibility polygons at 60 FPS.
2. **Environment Prop Density**: `3_room_tile_maps.png` (`1376×768`) contains denser pixel-art server racks, cables, and crates than the sparser dark interior in `gameplay.mp4`. Deep ambient stealth shadowing (`#070b0a` multiply/darkening mask lifted by light cones) harmonizes their luminance with `sheet.jpg`, while Sector 2 and Sector 3 mirror/re-populate this architecture to fulfill `spec.json`'s 3-room playable structure.
3. **Playable Systems & Narrative Arc Beyond a 10s Clip**: `gameplay.mp4` is a single 10.027s non-interactive shot of one room and one absorption with zero text. To honor `spec.json` (*"Three rooms. Write the memory flashes first; they carry the story... At the exit the memories add up: the nodes were people. The creature, now able to feel guilt, self-destructs"*) under VOIDBASTARD-TAO, our game includes real guard detection, spatial `[SPACE]`/click lunge cues only when within reach, `[P]` pause, `[R]` retry, brief floor-etched memory whispers inside the golden dome (zero modal boxes), diegetic bulkhead seal pips, and an in-world self-dissolution ending at the Sector 3 exit.

---

### Full Gemini Asset & Prompt Provenance

All provenance records verified directly from `projects/g12/m2/video/gemini_log.json` and `projects/g12/m2/assets/gemini_log.json`:

| Asset / Output | Kind | Model | `interaction_id` | `prev_id` | Elapsed | Reference Frame(s) |
| :--- | :--- | :--- | :--- | :--- | ---: | :--- |
| `video/gameplay.mp4` | `video` | `gemini-omni-1.2-flash` | `v1_Chdwc0g5YXVuQ0tfbUp5dE1QbXBQdG1BURIXcHNIOWF1bkNLX21KeXRNUG1wUHRtQVE` | `null` | `42.73s` | `refs/m2_main_ref.png` |
| `assets/creature_sprite_3_sizes.png` (`+_raw.png`) | `image` | `gemini-nano-banana-2.1` | `v1_Chd4OEg5YXFEWk9LeTd4ZElQNTduWDRBRRIXeDhIOWFxRFpPS3k3eGRJUDU3blg0QUU` | `null` | `16.48s` | `study/f_014.jpg`, `study/f_027.jpg` |
| `assets/node_sprite.png` (`+_raw.png`) | `image` | `gemini-nano-banana-2.1` | `v1_ChcxOEg5YXVHVkRyYVU1Tm9Qd195d2dRSRIXMThIOWF1R1ZEcmFVNU5vUHdfeXdnUUk` | `null` | `12.26s` | `study/f_014.jpg`, `study/f_027.jpg` |
| `assets/guard_sprite.png` (`+_raw.png`) | `image` | `gemini-nano-banana-2.1` | `v1_Chc0OEg5YXJPMUlZNkN1TVlQN2RHY3VBYxIXNDhIOWFyTzFJWTZDdU1ZUDdkR2N1QWM` | `null` | `27.36s` | `study/f_014.jpg`, `study/f_027.jpg` |
| `assets/3_room_tile_maps.png` | `image` | `gemini-nano-banana-2.1` | `v1_Chdfc0g5YXZUdk03cTh4ZElQM3VURTJBdxIXX3NIOWF2VHZNN3E4eGRJUDN1VEUyQXc` | `null` | `19.22s` | `study/f_014.jpg`, `study/f_027.jpg` |
| `assets/bgm_loop.mp3` | `music` | `lyria-3-clip-preview` | `v1_ChdFc0w5YXViUUJNTG15dE1QLTZmaTJBZxIXRXNMOWF1YlFCTUxteXRNUC02ZmkyQWc` | `null` | `9.30s` | `study/f_014.jpg` |

#### Exact Logged Prompts
- **`gameplay.mp4` (`gemini-omni-1.2-flash`)**:
  > `"Atmospheric top-down 2.5D pixel-art stealth game inside a dark research facility (#0c0f0e) lit by pale phosphor mint (#c8e6d0) and crimson bio-nodes (#e0523c). Steady overhead follow camera. A small shifting red-core AI creature slithers silently behind lab partition walls, dodging a sweeping guard flashlight cone, and absorbs a pulsing crimson node—expanding in size while a brief warm human silhouette memory ripple blooms across the floor tiles. Continuous unbroken gameplay shot, no scene cuts, no HUD text. Use the reference image for maze geometry and palette. Sound design: tense synth pulse, soft wet absorption chime. No dialogue."`
- **`creature_sprite_3_sizes.png` (`gemini-nano-banana-2.1`)**:
  > `"Isolated 2D game sprite sheet / prop for \"HIVE\": Creature sprite, 3 sizes. Centered full silhouette, isolated on a flat uniform light grey studio background (#d8d8d8), even lighting, zero drop shadow, no text, strictly harmonized palette (#0c0f0e, #c8e6d0, accent #e0523c), style: Pixel art; a start screen that glitches to a horror version., matching the reference gameplay frame."`
- **`node_sprite.png` (`gemini-nano-banana-2.1`)**:
  > `"Isolated 2D game sprite sheet / prop for \"HIVE\": Node sprite. Centered full silhouette, isolated on a flat uniform light grey studio background (#d8d8d8), even lighting, zero drop shadow, no text, strictly harmonized palette (#0c0f0e, #c8e6d0, accent #e0523c), style: Pixel art; a start screen that glitches to a horror version., matching the reference gameplay frame."`
- **`guard_sprite.png` (`gemini-nano-banana-2.1`)**:
  > `"Isolated 2D game sprite sheet / prop for \"HIVE\": Guard sprite. Centered full silhouette, isolated on a flat uniform light grey studio background (#d8d8d8), even lighting, zero drop shadow, no text, strictly harmonized palette (#0c0f0e, #c8e6d0, accent #e0523c), style: Pixel art; a start screen that glitches to a horror version., matching the reference gameplay frame."`
- **`3_room_tile_maps.png` (`gemini-nano-banana-2.1`)**:
  > `"Clean 2D/2.5D game environment asset for \"HIVE\": 3 room tile maps. strictly harmonized palette (#0c0f0e, #c8e6d0, accent #e0523c), style: Pixel art; a start screen that glitches to a horror version.. No UI text, no characters baked in, crisp game-ready art matching the reference gameplay frame."`
- **`bgm_loop.mp3` (`lyria-3-clip-preview`)**:
  > `"Instrumental 30-second loopable game soundtrack for \"HIVE\" (What the system calls data was a person. The player learns it from memory flashes, the same way the creature does.). Visual mood: Pixel art; a start screen that glitches to a horror version.. Purely instrumental, cohesive game loop, no vocals."`

---

## 1. WAY

- **Core Truth**: You are a dark bio-synthetic mass sliding through shadowy containment partitions (`#0c0f0e` / `#c8e6d0`), evading sharp raycasted searchlights to absorb pulsing crimson nodes (`#e0523c`)—discovering through warm golden floor-blooms (`#f5cf87`) that every absorbed node was a human mind.
- **Single Dominant Verb**: **Absorb** (approached through shadow stealth).
- **Spatial Grammar**: The entire screen *is* the containment room. Light cones show danger; the creature's body size and tendril count show mass; crimson floor rings show remaining vs. hollowed nodes; doorway seal pips show bulkhead lock state; golden floor-blooms reveal human memories directly on the tiles where a node died.

---

## 2. OBSTRUCTION

Everything that stood between the player and the operational reality of the room in the first pass:

1. **Top Telemetry String** (`SECTOR 01 · CONTAINMENT LAB · MASS 2/3 · MEMORIES 1`) — duplicated truths already visible in creature size, room layout, and hollowed node rings.
2. **Framed Memory Modal Banner** (`860×62` black-and-gold rectangle at `y=594`) — severed the floor architecture, blocked the silhouettes' legs, and turned a haunting world phenomenon into a spreadsheet toast.
3. **Title Instruction Drawer** (`HOW TO PLAY` toggle + 3-line manual box) — premature prose explaining basic movement instead of letting the player move immediately.
4. **Doorway Floating Text** (`SECTOR 02 >>` / `EXIT BULKHEAD OPEN`) — detached UI labels where physical containment bars and seal pips belong.
5. **Comic `!` Guard Floating Text** — cartoon punctuation instead of tightening searchlight beam color, lens flare, and audio pulse.
6. **Framed `SPECIMEN CAUGHT` & `ENDING: GUILT` Prose Boxes** — `600×220` and `880×470` rectangular borders explaining what happened in sentences rather than showing spotlight lock / core self-dissolution in the room itself.
7. **`#d8d8d8` Cutout Halos & Unshadowed Props** — visual noise claiming edges and unlit furniture mattered as much as searchlights and bio-nodes.

---

## 3. KEEP-CUT LEDGER

Every element evaluated against the VOIDBASTARD-TAO 3-question Element Test (*What current truth does it show? What valid operation does it enable? What consequence or recovery does it expose?*):

| Element | Verdict | Justification (Laws 1–14) |
| :--- | :---: | :--- |
| Top status bar (`SECTOR · MASS · MEMORIES`) | **CUT** | Redundant HUD chrome; mass is shown by 3-tier creature biomass + tendrils, sector by architecture, memories by hollowed rings (Law 6). |
| Bottom `860×62` stroked memory text box | **CUT** | Obstructs floor and silhouettes; replaced by golden floor-bloom silhouettes + brief frameless floor-etched whisper beside the socket (Laws 5, 6). |
| `HOW TO PLAY` button & 3-line instruction modal | **CUT** | Violates Law 1 (Begin empty) and Law 2 (Present operation only). |
| Floating doorway text (`SECTOR 02 >>`) | **CUT** | Replaced by physical crimson bulkhead laser seals & phosphor floor chevrons on the doorway itself (Laws 5, 6). |
| Guard floating `!` punctuation | **CUT** | Replaced by raycasted cone chromatic shift (amber → crimson lock) + flashlight lens flare + synth pulse (Laws 6, 11). |
| `600×220` `SPECIMEN CAUGHT` modal box | **CUT** | Replaced by hard spotlight lock on the creature in world space + crisp `[R]` cue right beside the creature (Laws 5, 8). |
| `880×470` `ENDING: GUILT` prose wall | **CUT** | Replaced by in-world core fracture & particle self-dissolution at the exit threshold with echoed human silhouettes (Laws 6, 12). |
| `#d8d8d8` sprite background halos (`23,920` px total) | **CUT** | Sanitized via offscreen canvas RGBA chroma/luma defringing before first render. |
| Extraneous 2nd mid-room guard in Sector 1 | **CUT** | Absent from `sheet.jpg`; cutting restores clean readable sightlines in Sector 1 while escalating to 2 guards in Sectors 2–3. |
| Glitch horror title (`HIVE` ⇄ `THEY WERE PEOPLE`) | **KEEP** | Required by `spec.json` (`look`), stripped down to dark breathing room + single `[ENTER]` trigger (Laws 1, 3). |
| Raycasted guard & sensory cones w/ console shadow | **KEEP** | Shows exact line-of-sight truth in world space, upgraded with `(772, 486)` console occlusion & floor illumination (Laws 6, 11). |
| Tendril reach + `[SPACE]` node absorption arc | **KEEP** | Displayed **only** when creature is within valid lunge range (`d < 68px`) of a live node, anchored on that node (Laws 4, 5). |
| Hollowed crimson node husks & ember scars | **KEEP** | Permanent room trace of every absorbed mind, matching `f_033.jpg` & `f_038.jpg` (Laws 6, 9). |
| `[P]` Pause & `[R]` Sector Retry | **KEEP** | Exposes active-work stop (`[P]`) and reversible spatial recovery (`[R]`) beside the creature without modal menus (Laws 7, 8, 14). |

---

## 4. STATE MAP

Strict 1-state = 1-dominant-purpose mapping across all seven VOIDBASTARD-TAO operational states:

| TAO State | Game Phase | Dominant Purpose | Valid Action(s) Shown | World-Space Truth Shown |
| :--- | :--- | :--- | :--- | :--- |
| **`REST`** | `title` | Dormant containment before awakening | `[ENTER]` / Click room to awaken | Darkened live lab breathing silently; `HIVE` title glitching briefly to `THEY WERE PEOPLE`. Empty periphery. |
| **`WORKING`** | `room` (stalking / paused) | Evade raycasted searchlights through shadow | WASD / Arrows / Pointer steer; `[P]` pauses (`[P] RESUME` beside creature when paused) | Creature membrane + articulated tendrils slithering; cool sensory cone; warm raycasted guard cones; pulsing crimson nodes. |
| **`READY`** | `room` (`nodeDist < 68px`) | Strike & absorb adjacent crimson bio-node | Tendril latch threads + subtle `[SPACE]` ring anchored directly on target node | Creature tendrils physically reach toward the pulsing node core; disappears immediately if player retreats (Law 4). |
| **`CHANGED`** | `flash` + `room` (`absorbed > 0`) | Witness irreversible biomass growth & human memory trace | Continuous movement (brief `75ms` hit-stop + gentle slow-mo swell, never blocking input); `[R]` available | Creature expands in tier/tendrils; node becomes a hollow crimson husk (`f_038.jpg`); golden caustic researcher dome blooms inside room walls with faint floor-etched memory trace; bulkhead seal unlocks. |
| **`FAULT`** | `caught` | Expose exact line-of-sight capture truth | `[R]` / `[SPACE]` / Click immediate retry | Guard beam locks crimson-white onto creature; motion halts at exact spot of exposure; `[R]` pulses beside creature. |
| **`RECOVERY`** | `respawnRoom()` | Clean sector reset from fault or reversible state | Seamless return to `WORKING` at sector spawn | Sector nodes/seals/mass restored cleanly to sector entry state; zero Transition banner. |
| **`COMPLETE`** | `exit` → `end` | Guilt realization & voluntary self-destruction at threshold | None demanded (Law 12); quiet `[R]` faded in corner only after dissolution settles | At open Sector 3 exit, absorbed golden human silhouettes briefly surround the creature as its crimson core fractures into rising embers, leaving an empty threshold (`THE NODES WERE PEOPLE`). |

---

## 5. WIREFRAMES

### `REST` (`title`)
```text
+------------------------------------------------------------------------+
|  [ dark breathing containment lab visible behind phosphor walls ]      |
|                                                                        |
|                                H I V E                                 |
|                     (glitches -> THEY WERE PEOPLE)                     |
|                                [ ENTER ]                               |
|                                                                        |
+------------------------------------------------------------------------+
```

### `WORKING` & `READY` (`room`)
```text
+------------------------------------------------------------------------+
|  #==================================================================#  |
|  | [dark racks]      (o)                   (o)           \  [GUARD] |  |
|  |==============+                       +============     \  cone   |  |
|  |              |                       |                 /  lit    |  |
|  |              +-----------+           |                /   tiles  |  |
|  |    (o)          ~><((O)> ···[SPACE]··(O)    [console]/     (o)   |  |
|  |                 creature   tendril   node    shadow /            |  |
|  #===========================[  * *  ]==============================#  |
|                              seal pips                                 |
+------------------------------------------------------------------------+
```

### `CHANGED` (`flash` — Diegetic Floor-Bloom, Zero Modal Box)
```text
+------------------------------------------------------------------------+
|  #==================================================================#  |
|  |               . *  .  GOLDEN CAUSTIC FLOOR DOME  . * .           |  |
|  |==============+   .     [Researcher]  [Researcher]     .  ========|  |
|  |              |  *        lab coat  \/  clipboard       *         |  |
|  |              +-----------+                            .          |  |
|  |    (o)            *       ( )  <-- hollow husk  ~>><(((O)))>     |  |
|  |                      "Tell ethics they're synthetic weights."    |  |
|  #===========================[  v v  ]==============================#  |
+------------------------------------------------------------------------+
```

### `FAULT` (`caught`) & `COMPLETE` (`end`)
```text
FAULT (World-Space Lock):                 COMPLETE (Threshold Self-Dissolution):
+------------------------------------+    +------------------------------------+
| #================================# |    | #============[      ]============# |
| |                     \  [GUARD] | |    | |        *  .  \  /  .  *        | |
| |        ~><((X))> <===\==LOCK   | |    | |      [echo]   ..   [echo]      | |
| |          [ R ]                 | |    | |       rising core embers       | |
| |                                | |    | |     THE NODES WERE PEOPLE.     | |
| #================================# |    | #================================# |
+------------------------------------+    +------------------------------------+
```

---

## 6. VOID CONTRACT

1. **Zero Rectangular HUD Boxes**: No top status bar, no bottom dialogue box, no `HOW TO PLAY` drawer, no framed `SPECIMEN CAUGHT` or `ENDING` prose rectangles may ever be drawn on the canvas.
2. **Spatial & Conditional Cues Only**: Node absorption prompt (`tendril reach + subtle ring`) exists **only** when `dist(creature, liveNode) < 68px`. Pause indicator (`[P]`) exists **only** while paused, anchored beside the creature. Retry cue (`[R]`) exists **only** on `caught` (or quiet post-ending stillness), anchored in world space.
3. **Zero Grey Cutout Fringe**: Every sprite sheet (`creature_sprite_3_sizes.png`, `node_sprite.png`, `guard_sprite.png`) must pass through offscreen RGBA neutral-grey halo stripping (`|R-G| < 14 && max-min < 22 && luma > 135` → `alpha = 0`, preserving `#c8e6d0` mint where `G - R >= 14` and `#e0523c` crimson where `R - G > 35`).
4. **Architectural Light & Clipping Truth**: Unlit room regions stay deeply shadowed (`#070c0a`); flashlight and sensory cones raycast against all walls **including** the console desk occluder; golden memory domes clip strictly inside the room's inner perimeter walls (`52..1228 × 52..666`).
5. **Preserved Runtime Contract**: `<link rel="icon" href="data:,">`, deterministic `?seed=N` PRNG, `?autostart` immediate room entry, `../assets/bgm_loop.mp3` + WebAudio synth/absorption SFX, keyboard + pointer controls, and `window.__game.state` remain intact at ~60 FPS with `0` console errors.

---

## 7. FAILURE

How this surface would fail VOIDBASTARD-TAO if allowed to regress:
- Re-introducing any floating text banner or modal card that blocks sightlines or pauses input during memory blooms.
- Leaving raw `#d8d8d8` background halos around nodes or rotated creature sprites.
- Allowing the golden memory dome to bleed over the outer facility walls into the black viewport margin.
- Triggering a memory bloom prematurely at `t=2.0s` instead of showcasing pure stealth evasion first (`t=2s`), stalking approach (`t=5s`), and visceral central absorption + researcher memory bloom (`t=8s`).
- Dropping below 55 FPS due to uncached per-frame pixel manipulation (all sprite halo stripping and darkness masks must be pre-baked onto offscreen canvases at boot).

---

## 8. IMPLEMENTATION

1. **Offscreen Sprite Sanitizer (`sanitizeSpriteSheet`)**: Runs once on image `onload`, stripping all neutral `#d8d8d8` studio background pixels and edge fringes while preserving `#c8e6d0` phosphor mint and `#e0523c` crimson pixels.
2. **Pre-Baked Architectural Darkness & Crisp Mint Wall Overlay**: Darkens `3_room_tile_maps.png` noisy unlit furniture into moody `#090e0d` silhouettes while extracting crisp `#c8e6d0` wall lines so partitions gleam cleanly above shadows and inside memory blooms (`f_014.jpg`, `f_033.jpg`).
3. **True Occluded Lighting (`castRay` + Console Occluder)**: Adds the `(772, 486, 58, 179)` console desk occluder, renders dual-pass raycasted guard searchlights (wide soft penumbra + warm floor illumination + flashlight emitter flare) and the creature's cool mint forward sensory cone.
4. **Organic Multi-Tendril Creature + Visceral Absorption**: Combines cleaned `creature_sprite_3_sizes` tiers with procedural articulated bio-tendrils featuring pale-mint suction tips that reach toward nearby walls and latch onto nearby nodes, triggering a `75ms` hit-stop, subtle `1.032x` camera pull, crimson starburst (`f_029.jpg`), and permanent hollow crimson node husk (`f_038.jpg`).
5. **Wall-Clipped Voronoi Caustic Memory Dome (`drawMemoryRipples`)**: Clips strictly inside facility walls, renders cellular golden caustic webbing, two anatomically detailed lab-coat researcher silhouettes in profile holding a glowing clipboard (`f_033.jpg`) (plus varied human poses across subsequent nodes), and a subtle frameless floor-etched memory whisper beside the drained socket.
6. **Choreographed `game/play.mjs` & Recorded Verification**: Guides the creature through stealth evasion behind the central partition at `t=2.0s` (`pair_002.00.jpg`), multi-tendril stalking past the sweeping beam at `t=5.0s` (`pair_005.00.jpg`), and central node absorption + full golden researcher memory bloom at `t=8.0s` (`pair_008.00.jpg`), continuing cleanly into Sector 2.
   - `playtest/take.mp4`: **`834 frames, 13.9 s, 60.1 fps, 0 console errors`** (`best.mp4`: `5.75 s -> 13.75 s`, score `0.0193`).
