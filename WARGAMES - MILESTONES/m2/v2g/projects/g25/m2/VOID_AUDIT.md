# VOIDBASTARD-TAO AUDIT — Group 25: *Glitchquest* (M2)

> **Operational Principle**: *Every visible element is a claim about what matters now. In a game whose central premise is "Who to believe when the interface lies," non-diegetic HUD chrome does not clarify the game—it destroys it. The world's signs ARE the interface.*

---

## 0. HONEST VIDEO-VS-GAME CRITIQUE & GEMINI PROVENANCE

### Brutally Honest Critique of the First-Pass M2 Build vs. `video/gameplay.mp4` (`study/sheet.jpg`)

Comparing the original M2 HTML5 build against the 10.03-second Gemini Omni 1.2 Flash seed video (`study/sheet.jpg`, `study/f_005.jpg`, `study/f_014.jpg`, `study/f_027.jpg`, `study/f_038.jpg`) exposed seven severe design, visual, and mechanical failures:

1. **Self-Sabotaging Spoiler HUD & Mockup Artifacts**:
   - The first-pass build stamped a permanent top-right debug/tutorial header (`UNIVERSE 1 · BRICK CAVERN` + `RULE: CYAN = TRUE | FLICKERING GOLD = LIE [E/DOWN] TEST`) AND printed `[ UNVERIFIED ]` / `[ VERIFIED SIGNAL ]` labels directly above world signs. Telling the player in literal text which signs are verified completely short-circuited the game's core discovery verb (*"The game is lying to you. Your job is to work out how"*).
   - It also blindly copied greybox mockup chrome from `refs/m2_main_ref.png` that had no real gameplay purpose: a detached top-left `HINT: JUMP NOW` box, a bottom-left `CYBER RUNNER · TESTS: 1` progress bar (where the Omni video had literally hallucinated the hex string `#fe86b` from a palette swatch!), and an inert empty gold rectangle in the bottom-right corner.
2. **18,940 Studio-Grey Cutout Pixels & Enclosed Grey Pockets in `3_universe_tile_sets.png`**:
   - Flood-filling `3_universe_tile_sets_raw.png` only from the outer canvas edge missed **enclosed `#cdcdcd` studio-grey islands**—most visibly a `1,011`-pixel grey pocket trapped under the hanging cable loop of `u1Ledge2` (`x=690..749, y=172..194`), `362` pixels under `u1Ledge1`'s cable (`x=646..691, y=72..86`), and `180+` grey pixels inside `u1Rubble` (`x=353..447, y=298..316`), alongside `17,000+` neutral-grey anti-aliasing fringe pixels around sprite borders.
3. **Checkerboard Box-Stamping Instead of Sculpted Cavern Silhouette**:
   - In `f_005.jpg`, cavern ground is a unified deep-indigo rock mass (`#09071a`) rimmed with thick dark-slate stone cobbles (`#182e44`) and a luminous cyan-mint top lip (`#6cf7ff`). The old build instead tiled the closed 4-sided `u1Block` sprite (`178×191`) in a `128×128` grid, creating ugly internal grid seams and neon `strokeRect` boxes that looked like debug hitboxes rather than cavern architecture.
4. **Wrong Progression Direction vs. the Omni Seed Video**:
   - Both `spec.json` (*"hops across hidden solid cyan blocks in the opposite direction"*) and `sheet.jpg` (`f_021..f_035`) show the hero testing the right-hand `STAGE CLEAR ↓` pit, recoiling, and climbing revealed solid cyan phase blocks **up-and-left in the opposite direction** as cosmic constellation streaks tear open behind the cavern bricks. The old build placed its cyan blocks going right across the pit, breaking compositional parity with `pair_005.00.jpg` and `pair_008.00.jpg`.
5. **Undersized Boxy Hero & Broken Probing Logic**:
   - The old hero was a tiny `40×60` rectangle lacking the swept-back helmet crest, angled visor + chin silhouette, gold pauldrons, and star-sparkle jump trail of `f_005.jpg` / `f_027.jpg`. Worse, simply walking toward a fake floor (`player.x + player.w >= ff.x - 16`) automatically dissolved it safely even when the player was blindly obeying the lie—making it nearly impossible to actually fall for a floor trap.
6. **Static Final `"QUIT"` Screen Instead of Physical UI Geometry**:
   - In the old `'last'` stage, `[QUIT GAME]` was just a painted rectangle on a flat floor (`x=140..360`) with a three-line narrator lecture (`SYSTEM HALTED: NOTHING BEYOND THIS SCREEN. DO NOT WALK RIGHT...`). It missed the tactile meta-platformer payoff where the giant possessed `[ Q U I T ]` UI button **is itself the physical platform** trapping the player, and physically running/jumping **off** its bezel shatters the UI frame.
7. **Screencast Timing Drift**:
   - Because `record_play.mjs` waits `2500ms` before starting screencast capture, timing `play.mjs` off internal `st.time` instead of `(Date.now() - t0) / 1000` desynchronized the `2s`, `5s`, and `8s` comparison pairs.

### What Was Fixed in This Rebuild

- **Zero Non-Diegetic HUD Chrome**: Cut the top-left hint box, top-right rule/keybind spoiler text, `[ VERIFIED SIGNAL ]` / `[ UNVERIFIED ]` sign tags, bottom-left counter bar, bottom-right empty gold square, and verbose narrator banners. The world's neon signs (`STAGE CLEAR ↓`, `SAFE BRIDGE >`, `SHORTCUT >`, `OVER CORE >`, `PRESS [Q] TO QUIT ↓`, `WALK OFF >`) are the sole interface.
- **Zero Grey Cutout Pixels (`18,940 -> 0`)**: Re-cut `assets/3_universe_tile_sets.png` from `3_universe_tile_sets_raw.png` using chromatic/luminance studio-grey isolation + 3-pass morphological fringe stripping, removing every enclosed cable/rubble pocket and border halo, backed up by runtime offscreen-canvas verification.
- **Sculpted Pixel Architecture & 92px Athletic Hero**: Replaced grid-stamped closed boxes with continuous deep-indigo rock interiors, `26px` cobble stone rims, cyan-mint highlights, hanging ceiling brackets, steel girder trusses, cellular voronoi hologram pools (`f_005.jpg`), `[X]` wireframe static bursts (`f_014.jpg`), ornate cyan-diamond & gold-scrollwork temple cornices (`f_027.jpg` / `f_038.jpg`), and a `92px` swept-crest pixel hero with squash-and-stretch + 4-point star-sparkle trails.
- **Genuine Skill-Based Probing & Scanline World-Warps**: Pressing `[E]`/`[Down]`/`[S]` (or pausing cautiously at a suspicious rim) emits a diegetic boot-scan ring that shatters lying floors and scanline-tears gold signs; sprinting/jumping blindly onto an unprobed gold-signed floor collapses it under your boots and rewinds to checkpoint (`LIED TO · [R]`), leaving a magenta `[X]` trace in the world. Crossing universe rifts triggers a 24-band horizontal CRT scanline tear wave with zero fade-to-black.
- **Physical Possessed `[ Q U I T ]` Button Boss**: In `last`, the player lands directly atop a `515×116` physical `[ Q U I T ]` UI button stalked by a lunging possessed gold mouse cursor. Physically sprinting across its face and leaping off its cyan-fractured right bezel shatters the entire UI button into `125+` tumbling shards and materializes the outside-the-frame cyan bridge to the `STAGE CLEAR` fireworks finale (`f_038.jpg`).

### Honest Accounting of Remaining Differences vs. the Omni 1.2 Flash Video

No HTML5 Canvas build should claim fake pixel-identity with a neural video diffusion output. The remaining real differences are:

1. **Hand-Painted Sub-Pixel Shading vs. Procedural + Atlas Canvas Geometry**: The Omni video (`f_005.jpg`, `f_027.jpg`) paints bespoke per-frame anti-aliased pixel lighting, fluid hand-morphed cape/limb foreshortening during flips (`f_016.jpg`), and soft volumetric bloom across every rock crack. Our HTML5 build renders a deterministic 2D procedural pixel hero and combines Nano Banana atlas sprites (`u1WallBrick`, `u1Ledge1/2`, `u2PhaseBlk`, `u3Invader`, `u3Terminal`, `u3Fire1/2`) with crisp Canvas geometry at `60.1 fps`.
2. **Intentional Removal of Mockup HUD Artifacts Present in the Video**: Because `m2_main_ref.png` was fed as a style reference to Omni 1.2 Flash, `gameplay.mp4` inherited the greybox's top-left `HINT: JUMP NOW` box, bottom-left lightning `#fe86b` bar, and bottom-right empty gold square. Per VOIDBASTARD-TAO and the `g25` mandate, those non-functional mockup boxes were **intentionally cut** in the game so the playfield remains pure world space.
3. **Expanded Playable 3-Universe + Boss Loop vs. Single 10s Continuous Shot**: `gameplay.mp4` is a single 10.03s continuous camera pan covering Universe 1's cavern pit, the cosmic vector staircase warp, and the `STAGE CLEAR` fireworks (`f_001..f_040`). Our playable M2 build honors those exact three visual beats across `t=2s`, `t=5s`, and `t=8s`, and extends past `t=8.5s` into Universe 3's Space-Invader Mainframe and the playable Possessed `[ Q U I T ]` Boss Screen required by `spec.json`.

### Complete Gemini Asset & Video Provenance (Zero Secrets)

All generation logs verified from `projects/g25/m2/video/gemini_log.json` and `projects/g25/m2/assets/gemini_log.json` (API keys omitted/never stored):

| Stage / Asset | Model | Interaction ID | Timestamp (UTC) | Elapsed | Reference Inputs | Output Files & Sizes |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Seed Gameplay Video** (`gameplay`) | `gemini-omni-1.2-flash` | `v1_ChdROEw5YXQyOUVJMkExc2dQd3BxRTRRdxIXUThMOWF0MjlFSTJBMXNnUHdwcUU0UXc` | `2026-11-18T15:20:38Z` | `43.64s` | `refs/m2_main_ref.png` | `video/gameplay.mp4` (`6,866,884` B, `1280×720`, `24.0` fps, `10.027s`) |
| **3 Universe Tile Sets** (`3_universe_tile_sets`) | `gemini-nano-banana-2.1` | `v1_ChdTY0w5YXZDc0dZbXR1TVlQOGVpXzJBMBIXU2NMOWF2Q3NHWW10dU1ZUDhlaV8yQTA` | `2026-11-18T15:21:00Z` | `19.61s` | `study/f_014.jpg`, `study/f_027.jpg` | `assets/3_universe_tile_sets_raw.png` (`569,071` B), `assets/3_universe_tile_sets.png` (`817,543` B, `1024×1024` RGBA, `0` studio-grey pixels) |
| **Chiptune Loop** (`bgm_loop`) | `lyria-3-clip-preview` | `v1_ChdYTUw5YXBtVUZyNkMxc2dQeWV6Y3lRcxIXWE1MOWFwbVVGcjZDMXNnUHllemN5UXM` | `2026-11-18T15:21:12Z` | `12.67s` | `study/f_014.jpg` | `assets/bgm_loop.mp3` (`746,594` B, `30s` instrumental loop) |

- **Exact Omni Video Prompt**:
  > `"Vibrant retro-neon meta-platformer on deep indigo (#140b2b) with bright pixel gold (#ffe86b) and cyan (#3cf2ff) glitching geometry. Steady side-on arcade camera. A small pixel hero approaches a flashing neon arrow sign pointing into a deceptive shimmering floor pit, pauses to test it, leaps backward as the fake floor pixels dissolve into digital static, and hops across hidden solid cyan blocks in the opposite direction while the background warps between 8-bit bricks and starfield vectors. Continuous unbroken gameplay shot, no scene cuts, no gibberish text. Use the reference image for neon glitch style. Sound design: chiptune melody with playful glitch stutters. No dialogue."`
- **Exact Nano Banana Tileset Prompt**:
  > `"Isolated 2D game sprite sheet / prop for \"Glitchquest\": 3 universe tile sets. Centered full silhouette, isolated on a flat uniform light grey studio background (#d8d8d8), even lighting, zero drop shadow, no text, strictly harmonized palette (#140b2b, #ffe86b, accent #3cf2ff), style: Pixel art that changes style per universe (Mario-like, Space Invaders-like), bright neon., matching the reference gameplay frame."`
- **Exact Lyria BGM Prompt**:
  > `"Instrumental 30-second loopable game soundtrack for \"Glitchquest\" (Who to believe when the interface lies. Each universe teaches an expectation and then breaks it.). Visual mood: Pixel art that changes style per universe (Mario-like, Space Invaders-like), bright neon.. Purely instrumental, cohesive game loop, no vocals."`

---

## 1. WAY

*Glitchquest* is an epistemological arcade platformer: **you read the room, test suspicious claims, and disobey an interface that wants you dead.** Everything required to play lives inside physical space:
- **Gold neon signs (`#ffe86b`) lie**, betraying themselves through periodic horizontal scanline shear and magenta chromatic ghosting. The surfaces they endorse shimmer with subtle glitch motes and collapse into digital static when probed.
- **Cyan neon signs and phase blocks (`#3cf2ff`) hold true**, glowing with rock-steady geometric calm and bearing your weight across voids, cyber-flames, and beyond the frame of the possessed `[ Q U I T ]` button itself.

---

## 2. OBSTRUCTION

What obstructed the Way in the first-pass build:
1. **Explanatory Meta-Text**: Top-right rule manuals (`RULE: CYAN = TRUE | FLICKERING GOLD = LIE`) and `[ UNVERIFIED ]` badges told the player the answer in prose instead of letting their eyes catch the chromatic gold flicker.
2. **Dead Mockup Chrome**: Floating top-left `HINT` boxes, bottom-left test counters, and bottom-right empty frames occupied `~18%` of the perimeter while enabling zero operations.
3. **Opaque Cutout Debris**: Enclosed `#cdcdcd` grey pockets inside cavern ledges broke the `#100c25` deep-indigo illusion.
4. **Disembodied Final Choice**: Reducing the final `"QUIT"` confrontation to a text banner + small side zone turned a physical platforming climax into a reading comprehension prompt.

---

## 3. KEEP-CUT LEDGER

| Surface / Element | Verdict | VOIDBASTARD-TAO Justification |
| :--- | :--- | :--- |
| Top-right `UNIVERSE` & `RULE: CYAN = TRUE...` text | **CUT** | Violates Laws 2 & 6: spoils the core discovery rule in detached HUD prose. |
| `[ VERIFIED SIGNAL ]` / `[ UNVERIFIED ]` sign headers | **CUT** | Violates Law 6: redundant spoiler labels over signs whose visual stability already encodes truth vs. lie. |
| Top-left `HINT: JUMP NOW` floating box | **CUT** | Violates Laws 1 & 5: detached greybox artifact far from the pit/bridge it references. |
| Bottom-left lightning bar + `TESTS: N` + bottom-right gold box | **CUT** | Violates Laws 2 & 13: inert mockup chrome with zero valid operation or consequence. |
| Full-width center narrator lecture in `last` (`DO NOT WALK RIGHT...`) | **CUT** | Violates Laws 3 & 6: verbose prose wall obscuring the possessed UI encounter. |
| Diegetic flickering Gold signs (`STAGE CLEAR ↓`, `SHORTCUT >`, `PRESS [Q] TO QUIT ↓`) | **KEEP** | Current truth: marks an active trap via subtle scanline/RGB jitter right beside the hazard (Law 5). |
| Diegetic steady Cyan signs & warp chevrons (`==>`, `OVER CORE >`, `WALK OFF >`) | **KEEP** | Current truth: anchors solid phase geometry spatially where the jump occurs (Law 5). |
| Boot-probe scan ring (`[E]` / `[Down]` / rim dwell) & static collapse | **KEEP** | Motion reports real state change in the world—hologram floor shatters, hidden cyan path materializes (Laws 6 & 11). |
| Giant physical `[ Q U I T ]` button + lunging cursor + cyan right-bezel crack | **KEEP** | Makes the possessed UI literal platform geometry; jumping off its frame physically shatters the lie (Laws 5, 10, 11). |
| Residual magenta `[X]` world trace + `LIED TO · [R]` checkpoint snap | **KEEP** | Exposes consequence and instant recovery in world space without blocking modals (Laws 8, 9, 14). |
| Contextual `[P]` Pause & post-clear `[R]` Replay | **KEEP** | Active work exposes pause; reversible completion exposes quiet replay without new demand (Laws 7, 8, 12, 14). |

---

## 4. STATE MAP

| Canonical State | Code Mode | Dominant Purpose | Valid Player Action(s) | World / Surface Expression |
| :--- | :--- | :--- | :--- | :--- |
| **`REST`** | `'title'` | Establish dark-indigo glitch void & entry | `[Space]` / `[Enter]` / Click | Deep starfield, cyan `GLITCHQUEST` title, single subtly jittering gold `[ SPACE ]` cue; center open. |
| **`READY`** | `'pick'` | Select hero palette identity spatially | `[1/2/3]`, `[Left/Right]`, `[Space]` / Click pedestal | Three pixel heroes standing physically on cyan phase pedestals; active pedestal blooms with a 4-point star. |
| **`WORKING`** | `'world'` / `'last'` | Navigate universe, read sign stability, probe traps | `Move`, `Jump`, `Probe ([E]/[Down]/Click)`, `[P]` Pause, `[R]` Retry | Zero HUD chrome; sculpted cavern/cosmic/cyber geometry, flickering gold vs. steady cyan signs, scanline rifts. |
| **`CHANGED`** | `ff.dissolved` / `buttonShattered` | Report exposed illusion & newly unlocked true path | Climb revealed cyan phase blocks / cross scanline rift | 40ms hit-stop; gold sign scanline-tears; fake floor or `[ Q U I T ]` button shatters into `[X]` static; cyan blocks & cosmic streaks materialize. |
| **`COMPLETE`** | `'end'` | Celebrate breaking the game's final lie | Optional `[R]` / `[Space]` / Click to replay | Radial pixel fireworks (`#ff42b0`, `#3cf2ff`, `#ffe86b`), spinning gold star-coins, neon octagon `STAGE CLEAR` banner, quiet corner `[R]`. |
| **`FAULT`** | `'lie'` (entry) | Report obeying a gold lie | Immediate `[R]` / `[Space]` or `0.55s` auto-rewind | 50ms hit-stop, magenta scanline flash, static burst at failure locus, concise `LIED TO · [R]`. |
| **`RECOVERY`** | `'lie' -> 'world'/'last'` | Restore checkpoint with learned trace | Resume movement immediately | Snaps back to universe checkpoint; leaves a persistent magenta `[X]` wireframe scar at the trap site (Law 9) while keeping probed truths revealed. |

---

## 5. WIREFRAMES

### A. `WORKING` -> `CHANGED` (Universe 1: Brick Cavern — Zero HUD)
```text
+--------------------------------------------------------------------------+
|    +            [brick cluster]              +------------------------+  |
|  [u1Ledge1]                                  |   cavern ceiling       |  |
|             +==[CYAN 3]==+                   +----+--------------+----+  |
|                  [u1Ledge2]    +==[CYAN 2]==+     | STAGE CLEAR  | ||    |
|                                                   +------+-------+ ||    |
|                                       +==[CYAN 1]==+     |  |      ||    |
|                                           (HERO)         \  /      ||    |
|               [rubble]                  o==probe==o       \/    +--+--+  |
|          +----------------+-------------------------+           |cavrn|  |
|          |  entry floor   |   main cavern ledge     | ~ ~ ~ ~ ~ |wall |  |
|          |                |                         | [X] . []  |     |  |
+----------+----------------+-------------------------+-----------+-----+--+
```

### B. `WORKING` Climax (`'last'` — Possessed `[ Q U I T ]` Button Boss)
```text
+--------------------------------------------------------------------------+
|     [Invader]        +---------------------------+        [Invader]      |
|     [Monolith]       |   PRESS [Q] TO QUIT (lie) |        [Monolith]     |
|                      +-------------+-------------+                       |
|                           +--------+--------+                            |
|                           |  CRT TERMINAL   |     +------------------+   |
|                        \  +-----------------+     |   WALK OFF >     |   |
|                         \ cursor                  +------------------+   |
|                  +=======V==============================+==cyan lip==+   |
|                  |           [  Q  U  I  T  ]           | (HERO)-->  |   |
|                  +======================================+============+   |
|                                                          [CYAN]  [ORNATE]|
+--------------------------------------------------------------------------+
```

---

## 6. VOID CONTRACT

1. **Zero Non-World Chrome in Active Play**: During `'world'` and `'last'`, `0` pixels are spent on scorebars, health meters, rule cheat-sheets, keybind legends, or floating hint boxes.
2. **Spatial Truth Encoding**: Every instruction exists as a physical object next to the geometry it describes; truth vs. deception is readable purely from perceptual stability (steady `#3cf2ff` cyan vs. scanline-jittering `#ffe86b` gold).
3. **Seamless Continuity**: Universe transitions use live 24-band horizontal CRT scanline shear over the previous frame—never black loading screens or modal intermissions.
4. **In-World Consequence & Trace**: Probing or falling into a lie permanently transforms world state (shattered pools, revealed cyan stairs, `[X]` death scars).
5. **Preserved Runtime Hooks**: `<link rel="icon" href="data:,">`, `?autostart`, deterministic `?seed=N` PRNG, `../assets/bgm_loop.mp3`, `[P]` pause, `[R]` recovery, and `window.__game.state` remain intact and error-free.

---

## 7. FAILURE

How this design fails if compromised in future milestones:
- **Re-introducing text explanations** (e.g., adding a tooltip *"Tip: Gold signs lie!"*) immediately collapses perceptual play back into reading instructions.
- **Making gold flicker invisible or overly subtle** (`< 1px` or `< 1 Hz`) turns fair observation into blind 50/50 guessing, violating `spec.json`'s fairness guarantee.
- **Auto-dissolving fake floors on blind sprints** removes the consequence of obeying a lie; cautious probing/dwelling must stay distinct from reckless obedience.
- **Regression on PNG cutouts** if new M3–M7 sprites are added with enclosed `#d8d8d8` background loops not stripped via chromatic/luminance background isolation.

---

## 8. IMPLEMENTATION

- **`projects/g25/m2/assets/3_universe_tile_sets.png`**: Cleaned from `3_universe_tile_sets_raw.png` via chromatic/luminance studio-grey isolation + 3-pass fringe stripping (`18,940` grey pixels reduced to `0`), visually verified via `read_file`.
- **`projects/g25/m2/game/index.html`**: Self-contained `1280×720` Canvas + WebAudio meta-platformer implementing `REST` (`title`), `READY` (`pick`), `WORKING`/`CHANGED` (`world` across Brick Cavern, Cosmic Constellation Vectors, and Invader Mainframe + `last` physical `[ Q U I T ]` button boss), `FAULT`/`RECOVERY` (`lie` + `[R]`), `[P]` pause, 24-band CRT scanline world-warps, and `COMPLETE` (`end` radial pixel fireworks + neon octagon `STAGE CLEAR`).
- **`projects/g25/m2/game/play.mjs`**: True screencast-time (`Date.now() - t0`) automated playtest driver demonstrating cavern pool brink inspection (`pair_002.00.jpg` @ `2.00s`), probing & opposite-direction cyan block ascent (`pair_005.00.jpg` @ `5.00s`), cosmic star-sparkle canyon leap (`pair_008.00.jpg` @ `8.00s`), Invader Mainframe cyber-fire probe, and leaping off the giant `[ Q U I T ]` button to shatter it.
- **Verification (`run_pipeline.py --project g25 --milestone m2 --stages verify`)**:
  - `playtest/take.mp4`: **`834 frames, 13.9 s, 60.1 fps, 0 console errors`**
  - `playtest/best.mp4`: `4.50 s -> 12.50 s` (score `0.0162`)
  - Side-by-side visual verification completed on `pairs/pair_002.00.jpg`, `pairs/pair_005.00.jpg`, and `pairs/pair_008.00.jpg`.
