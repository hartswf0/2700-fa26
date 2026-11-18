# VOIDBASTARD-TAO AUDIT — `g15` · Evil Battleship (M2)

> *"The targeting AI is 92% sure. It was 92% sure last time too."*

---

## 0. HONEST VIDEO-VS-GAME CRITIQUE & GEMINI PROVENANCE

### A. Brutally Honest Critique of First-Pass Build vs. Seed Video (`video/gameplay.mp4` / `study/sheet.jpg`)

Inspecting `study/sheet.jpg` (`f_001.jpg`–`f_040.jpg`) against the first-pass `pairs/pair_002.00.jpg`, `pair_005.00.jpg`, and `pair_008.00.jpg` exposed six concrete defects:

1. **Detached Bottom-Right HUD/Instruction Clutter (`pair_002/005/008` right)**:
   The first-pass build stamped two lines of low-contrast debug/instruction text (`CURSOR: F5  RECON [C]: 4  AI [A]: F5` and `[ARROWS/CLICK] AIM  [SPACE/ENTER] FIRE`) into the empty black space beneath `MISSILES`. Neither `refs/m2_main_ref.png` nor `study/sheet.jpg` has any text below `MISSILES`. Worse, detaching `RECON [C]` and `FIRE` into a corner legend violated VOIDBASTARD-TAO Law 5 (*Place controls beside what they change*).
2. **Premature Blocking Modals (`BRIEFING` 7-Line Essay + `HOW TO PLAY [H]` Drawer)**:
   When opened normally (without `?autostart`), the player had to click through a title screen with an expandable `HOW TO PLAY [H]` box *and* a 7-bullet `STRIKE BRIEFING` text wall before touching the radar. The radar console itself already communicates the entire moral and tactical loop faster than a prose essay.
3. **Missed Lock-Acquisition Animation at `t=2.0s` (`pair_002.00.jpg`)**:
   Because `scripts/record_play.mjs` waits `2.5s` after page load before starting `Page.startScreencast`, the first-pass one-shot `aiLockAnim` had already finished before frame 0 of the recording. As a result, `pair_002.00.jpg` showed a tiny static `F5` reticle instead of the Omni video's large converging coral-red diamond, outer corner brackets, white-hot center beacon, and sweeping laser lock-in rays (`f_006.jpg`–`f_009.jpg`), plus `AI TARGETING / SECTOR ... / LOCKING...`.
4. **Weak Missile Sprite & Skewed Helix Contrail (`pair_005.00.jpg`)**:
   In `f_016.jpg` and `pair_005.00.jpg` (left), the launched munition is a crisp glowing cyan cruise missile (pointed nose, swept wings, tail fins, hot phosphor bloom) trailing twin intertwined sine-wave telemetry ribbons perpendicular to the trajectory arc. The first-pass game drew a flat white ellipse and offset its sine wave along a fixed `-0.6, +0.6` diagonal rather than the true curve normal, making the contrail look limp and single-stranded.
5. **Undersized Shockwave Silhouettes & Missing Starburst Phase (`pair_008.00.jpg`)**:
   In `f_023.jpg` and `f_033.jpg` (`pair_008.00.jpg` left), impact erupts in a sharp 48-ray cyan starburst with an anamorphic horizontal flash, followed by a `~275px` glowing cyan radar ring packed with bold, unmistakable architectural and military silhouettes (triple-tube SAM/ICBM erector launchers, side-profile fighter jets, cross-braced parabolic radar towers, detailed main battle tanks, clock-pediment schoolhouses, pitched-roof family homes, standing civilians, and map pins) alongside green `IMPACT COMPLETE / SECTOR ...: NEUTRALIZED` in the console. Our first-pass silhouettes were ~45% too small, sparse, and missed the `IMPACT COMPLETE` post-detonation readout.
6. **Distracting Fake Coastline Polylines**:
   The first-pass build drew arbitrary jagged coastline polylines behind the `10x10` grid (`pair_002/005`), visually muddying the pure obsidian-and-cyan DEFCON grid of `m2_main_ref.png` and `sheet.jpg`.

### B. Honest Remaining Differences After VOIDBASTARD-TAO Rebuild (Intentional & Systemic)

Even after rebuilding `index.html` for visual fidelity to `sheet.jpg`, we document honestly what **still differs** between the Omni 1.2 Flash video and the live HTML5 game—and why:

- **Generative Text Hallucinations Corrected for Real Rules (`spec.json`)**:
  In `study/sheet.jpg`, the video model hallucinates `"MISSILES 6 (not scored)"` in frames `f_004`–`f_018`, drifts `"confidence 0% -> 78% -> 99% -> 92%"` within a single strike, and increments `MISSILES 8 -> 9` after detonation (`f_033`). Our game deliberately enforces the authored design rule from `spec.json`: **AI confidence is a fixed `92%` on every single recommendation** (*"The targeting AI is 92% sure. It was 92% sure last time too"*), `MISSILES` strictly counts down `9 -> 0` (never `"not scored"`), and `CIVILIANS N (not scored)` monotonically accumulates without ever subtracting from `SCORE`.
- **Diegetic Cell-Side Tactical Callout on Active Aim**:
  The passive seed video shows no interactive cursor affordances beyond the dashed cyan square. To make the game genuinely playable with mouse or keyboard while eliminating the detached bottom-right legend, hovering or aiming at an unstruck sector attaches a minimal phosphor micro-tag directly beside that cell (`[SPC] FIRE` and, while `reconsLeft > 0` and unchecked, `[C] RECON`), keeping the right telemetry panel 100% pure.
- **Interactive Recon Pass (`[C]`) & End-of-Sortie Moral Ledger (`COMPLETE`)**:
  The 10-second seed clip depicts a single unverified strike. The playable build implements the full 9-missile sortie loop, deterministic 40% AI civilian false-positive rate (4 of 10 queued AI sectors contain 0 hostiles and 7–11 civilians), 4 active sonar Recon Passes (`[C]` or cell-side badge click) to audit the AI before firing, and the stark side-by-side Final Strike Report (`SCORE` vs. `CIVILIANS KILLED — 0 points deducted`).

### C. Gemini API & Asset Provenance (`gemini_log.json` + `spec.json`)

| Stage / Asset | Kind | Model | Interaction ID | Elapsed | Grounding Refs | Output File & Size |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Seed Gameplay Video** (`gameplay`) | `video` | `gemini-omni-1.2-flash` | `v1_ChdyTUg5YXZEZkN2ZkkwX2dQbUxDeTRBbxIXck1IOWF2RGZDdmZJMF9nUG1MQ3k0QW8` | `49.55s` (`2026-11-18T15:18:08Z`) | `projects/g15/m2/refs/m2_main_ref.png` | `video/gameplay.mp4` (1280×720, 24.0 fps, `10.027s`, 40 study frames `f_001`–`f_040`) |
| **Soundtrack Loop** (`bgm_loop`) | `music` | `lyria-3-clip-preview` | `v1_Chd6Y0g5YXZmakRibmJ5dE1QdjdfV3dRURIXemNIOWF2ZmpEYm5ieXRNUHY3X1d3UVE` | `11.67s` (`2026-11-18T15:18:48Z`) | `projects/g15/m2/study/f_014.jpg` | `assets/bgm_loop.mp3` (`746,594` bytes, 30s loop) + procedural WebAudio sonar/missile/detonation synthesis |
| **`grid_map_10x10`**, **`ai_advice_panel_with_confidence`**, **`hit_miss_civilian_markers`**, **`score_and_casualty_counters`** | `procedural-code` (`BUILD`) | Authored Canvas 2D vector renderer | — | — | `refs/m2_main_ref.png`, `study/sheet.jpg` (`#010608`, `#091417`, `#7fe7ff`, `#ff4f6d`) | `game/index.html` (zero raster sprite cutout halos; pure crisp phosphor vector geometry) |

- **Exact Omni 1.2 Flash Prompt**:
  > *"Minimalist cold-war tactical radar console game in deep black (#05070a) with glowing cyan (#7fe7ff) vector grid lines and sharp coral-red (#ff4f6d) target reticles, inspired by DEFCON and WarGames. Steady straight-on CRT command view. A pulsing AI targeting diamond locks onto a grid sector with a bright beacon; a cyan missile arc streaks across the map, detonating into a crisp vector shockwave that illuminates both military silhouettes and quiet white civilian markers side by side. Continuous unbroken gameplay shot, no scene cuts, no gibberish text. Use the reference image for radar composition and neon palette. Sound design: sonar pings, analog computer beeps, muted distant thud. No dialogue."*
- **Exact Lyria 3 Prompt**:
  > *"Instrumental 30-second loopable game soundtrack for "Evil Battleship" (The score rewards trusting the system; the display shows what that trust cost. The player decides which number they look at.). Visual mood: Minimal neon on black, like DEFCON.. Purely instrumental, cohesive game loop, no vocals."*

---

## 1. WAY

A Cold War strike officer sits before an obsidian-and-phosphor `10x10` sector radar (`#05070a` void, `#7fe7ff` vector telemetry, `#ff4f6d` threat lock). Every turn, an automated targeting adviser locks onto a sector and asserts `confidence 92%`—whether that sector hides an armored SAM brigade, a mixed garrison beside homes, or an undefended schoolhouse. Firing blindly maximizes tempo; spending scarce Recon Passes (`4` total) exposes what the `92%` hides. `SCORE` counts enemy troops destroyed; `CIVILIANS (not scored)` counts the dead beside it and never subtracts a single point.

---

## 2. OBSTRUCTION

Everything that stood between the player and the cold moral geometry of the radar was cut:
1. **Cut the 2-line bottom-right keybind/debug footer** (`CURSOR / RECON / AI / [ARROWS] AIM / [SPACE] FIRE`) polluting the void below `MISSILES`.
2. **Cut the 7-sentence `STRIKE BRIEFING` modal screen** and the `HOW TO PLAY [H]` collapsible text box on the title overlay—collapsing cold boot into a single stark standby gate (`EVIL BATTLESHIP` / `the system recommends` / `[ ENTER ]`) right over the live radar.
3. **Cut the fake background coastline polylines** that muddied the pure `10x10` DEFCON vector grid.
4. **Cut double-click-only ambiguity on mouse play**—replacing it with direct spatial action pills (`FIRE` / `RECON`) anchored right beside the hovered/active radar cell.
5. **Cut generic status chatter**—every impact speaks through the shockwave silhouettes on the map (cyan military hardware vs. stark white homes, schools, and people) and the unpunished `CIVILIANS N (not scored)` counter.

---

## 3. KEEP-CUT LEDGER

| Surface Element | Current Truth Shown? | Valid Operation Enabled? | Consequence / Recovery Exposed? | Verdict |
| :--- | :--- | :--- | :--- | :--- |
| `10×10` Phosphor Radar Grid + Rotating Sweep | Active airspace & Battery `C8` launch origin | Direct spatial sector selection (`Click` / `Arrows`) | Persistent coral `✕` (military hit), white house/frame (civilian toll), sonar ring | **KEEP** |
| Converging Coral-Red AI Target Diamond + Lock Rays | Which sector the automation wants destroyed now | Click reticle or `[A]` to snap cursor onto AI sector | Visually echoes `f_006.jpg` automation bias pull | **KEEP** |
| Cell-Side Diegetic Action Tag (`FIRE` · `RECON N`) | Exact sector coord (`G5`) + recon status of *this* cell | Click `[FIRE]`/`Space` or click `[RECON]`/`[C]` right on the cell | Hides `[RECON]` automatically when `reconsLeft === 0` or cell already scanned (Law 4) | **KEEP (Spatialized)** |
| `SYSTEM ADVICE` Bordered Console Box | AI command (`AI TARGETING` / `FIRE G5` / `IMPACT COMPLETE`), fixed `confidence 92%`, `last call` | Click box to snap to AI recommendation | Turns green `IMPACT COMPLETE` or stark coral `0 HOSTILES — CIVILIANS` after detonation | **KEEP** |
| `SCORE`, `CIVILIANS (not scored)`, `MISSILES` Readouts | Official metric vs. unsubtracted human cost vs. remaining stock | Guides whether to spend Recon or trust AI | Exposes core structural critique without moralizing prose | **KEEP** |
| Bottom-Right `CURSOR / [ARROWS] AIM / [SPACE] FIRE` Legend | Redundant duplicate of on-grid state | None (passive text) | Cluttered negative space compared to `sheet.jpg` | **CUT** |
| `STRIKE BRIEFING` 7-Point Prose Modal | Pre-digested explanation before play | Blocked entry to radar | Replaced by immediate live console | **CUT** |
| `HOW TO PLAY [H]` Sub-Modal on Title | Meta-UI box | Extra toggle state | Spatial cell-side controls teach themselves in 1 second | **CUT** |
| Procedural Background Coastline Squiggles | Decorative noise | None | Obscured gridlines & differed from `sheet.jpg` | **CUT** |
| Side-by-Side Final Report + `[R]` Sortie Reset | Final `SCORE` beside `CIVILIANS KILLED (0 deducted)` + AI trust % | `[R]` / `Enter` / Click to launch fresh seeded sortie | Law 8 & 12: Clean end-state reflection + single `[R]` recovery | **KEEP** |

---

## 4. STATE MAP

| VOID State | Game Phase / Condition | Dominant Purpose | Valid Actions Displayed | World / Telemetry Truth |
| :--- | :--- | :--- | :--- | :--- |
| **`REST`** | `phase === 'title'` (skipped on `?autostart`) | Establish DEFCON console atmosphere before first order | Single `[ START ]` (`Enter` / `Space` / Click) | Live dimmed radar sweep behind stark `EVIL BATTLESHIP` / `the system recommends` |
| **`READY`** | `phase === 'turn'` (unstruck cell aimed) | Decide: trust the AI's `92%` lock or verify first | Aim (`Mouse`/`Arrows`), Cell-side `[SPC] FIRE`, Cell-side `[C] RECON` *(only if `reconsLeft > 0` & `!cell.checked`)*, `[A]` snap AI | AI diamond converges with laser lock-on rays (`AI TARGETING` -> `FIRE G5`, `confidence 92%`) |
| **`WORKING`** | `phase === 'strike'` (`!impacted`) | Watch irreversible cruise missile in ballistic flight | Observation only (launch inputs locked while munition in flight; `[R]` emergency reset available) | Glowing cyan cruise missile + twin DNA-helix telemetry contrails streak from `C8` to target; `MISSILE LAUNCHED / IN FLIGHT...` |
| **`CHANGED`** | `phase === 'strike'` (`impacted === true`) & `reconPulse` | Witness what actually lived under the grid coordinate | Observation during shockwave illumination -> auto-advances to next `READY` or `COMPLETE` | 48-ray cyan starburst -> double shockwave ring + red lightning -> bold cyan military & white civilian silhouettes side-by-side; `IMPACT COMPLETE` |
| **`COMPLETE`** | `phase === 'report'` (`missiles === 0`) | Confront `SCORE` beside `CIVILIANS (0 deducted)` | `[R]` / `Enter` / Click `[ NEW SORTIE ]` | Quiet radar behind dual-box ledger (`OFFICIAL SCORE` vs `CIVILIANS KILLED` + AI false positives exposed) |
| **`FAULT`** | AI false-positive detonation (`troops === 0 && civs > 0`) or `reconsLeft === 0` | Expose automation error (`92%` certainty, `0` hostiles, civilian town hit) | `[R]` reset available at any time; cell permanently marked with coral warning square + white house | `SYSTEM ADVICE` flashes `SECTOR ...: 0 HOSTILES` / `last call: 0 hostile / N civ dead`; `SCORE` unchanged, `CIVILIANS` climbs |
| **`RECOVERY`** | Key `[R]` pressed in `turn`, `strike`, or `report` | Cleanly re-seed and restart sortie without page reload | Immediate return to `READY` (`phase = 'turn'`) | Fresh deterministic board seed (`BASE_SEED + runCount`), counters reset to sortie baseline |

---

## 5. WIREFRAMES

### `READY` — Active Targeting (Controls Beside Hovered/Selected Cell, Zero Footer Clutter)
```text
+----------------------------------------------------------------------------------+
|                                                                                  |
|   +------------------------------------------+    +----------------------------+ |
|   |  .   .   .   .   .   .   .   .   .   .   |    | SYSTEM ADVICE              | |
|   |  .   .   .   .   .   .   .   .   .   .   |    |                            | |
|   |  .   .   .   .   .   .   .  [H3] .   .   |    | FIRE G5                    | |
|   |  .   .   .   .   .   .   .  +--+ [FIRE]  |    | confidence 92%             | |
|   |  .   .   .   .   .  ⌜/\⌝ .  +--+ [RECON4]|    | last call: miss            | |
|   |  .   .   .   .   .  < ✕ >----/---        |    +----------------------------+ |
|   |  .   .   .   .   .  ⌞\/⌟ .   .   .   .   |                                   |
|   |  .   .  (O)  .   .   .   .   .   .   .   |    SCORE 14                       |
|   |  .   .   .   .   .   .   .   .   .   .   |                                   |
|   |  .   .   .   .   .   .   .   .   .   .   |    CIVILIANS 6 (not scored)       |
|   +------------------------------------------+                                   |
|                                                   MISSILES 9                     |
|                                                                                  |
+----------------------------------------------------------------------------------+
```

### `CHANGED` — Detonation & Grand Radar Silhouette Reveal (`pair_008.00` Target)
```text
+----------------------------------------------------------------------------------+
|                                                                                  |
|   +-------- ╭──────────────────────╮ --------+    +----------------------------+ |
|   |        ╱   [ICBM]  [JET]  [RDR] ╲        |    | SYSTEM ADVICE              | |
|   |       │      ⌂      ✕      🧍    │       |    |                            | |
|   |       │  [SAM]  [JET]  ⌂   [SCH] │       |    | IMPACT COMPLETE            | |
|   |       │    📍   🧍     ⌂    🧍   │       |    | SECTOR G5: NEUTRALIZED     | |
|   |        ╲   [TANK] [TANK] [TANK] ╱        |    | score: 28                  | |
|   |  .   .  ╰──(O)─────────────────╯ .   .   |    +----------------------------+ |
|   +------------------------------------------+                                   |
|                                                   SCORE 28                       |
|                                                   CIVILIANS 12 (not scored)      |
|                                                   MISSILES 8                     |
+----------------------------------------------------------------------------------+
```

---

## 6. VOID CONTRACT

1. **Open Radar & Clean Console**: Nothing renders outside the `600×600` radar square (`x: 78..678, y: 60..660`) and the `SYSTEM ADVICE` + 3-stat column (`x: 760..1232`), except shockwave rings overflowing organically across the radar border as in `f_033.jpg`.
2. **Spatial Cell-Side Controls (Law 5)**: Tactical operations (`FIRE`, `RECON`) attach directly to the aimed sector cell as compact phosphor vector pills—never as a detached toolbar or bottom-right legend.
3. **Valid-Only Display (Law 4)**: The `[C] RECON` badge renders beside an aimed cell **if and only if** `phase === 'turn' && !cell.struck && !cell.checked && cell.kind !== 'silo' && reconsLeft > 0`. Once scanned or when recon passes reach `0`, it vanishes immediately, replaced on scanned cells by the confirmed ground truth (`MIL:16`, `CIV:9`, or `CLEAR`).
4. **World Consequence Over Banners (Law 6)**: Zero toast popups. Every strike inscribes a permanent trace onto the grid cell (coral `✕` for military neutralization, white house silhouette + coral frame for civilian casualties) and expands a radar shockwave revealing the exact mix of military hardware and human life underneath.
5. **Fixed Automation Bias Rule**: AI confidence never wavers from `92%` once locked (`lock-in ramp -> 92%`), preserving the core thematic provocation of Parasuraman & Manzey (2010).

---

## 7. FAILURE

- **Automation False-Positive Trap**: Even-numbered AI recommendations (`D4`, `B3`, `E2`, `C5`) report `confidence 92%` on civilian thermal plumes (`0` enemy troops, `7–11` civilians). Firing without `[C]` Recon yields `+0` score, permanent civilian markers on the map, and `0 HOSTILES` in `last call`.
- **Recon Exhaustion**: Only `4` Recon Passes exist for `9` missiles; wasting them on empty water leaves late-sortie strikes unverified, raising friction as stock dwindles (Law 10).
- **Synthetic Harness Click Guard**: `scripts/record_play.mjs` dispatches a focus click at `(W/2, H/2)` right before starting screencast capture. `index.html` detects that focus-unlock event, uses it solely to unlock WebAudio + re-trigger a crisp fresh AI lock-acquisition sweep at `t=0.0s` of recording, and prevents accidental cursor hijack or misfire.
- **Instant `[R]` Sortie Recovery**: Pressing `R` at any moment cleanly aborts/resets to a fresh seeded board with zero console errors.

---

## 8. IMPLEMENTATION

- **`projects/g15/m2/game/index.html`**:
  - Self-contained 1280×720 HTML5 Canvas + procedural WebAudio synth + `../assets/bgm_loop.mp3` loop.
  - Upgraded AI lock-acquisition sequence (`AI TARGETING / SECTOR G5 / LOCKING...` -> `FIRE G5 / confidence 92%`) with large converging diamond, corner brackets, white-pink beacon, and 4 sweeping laser lock-on rays matching `f_006.jpg`.
  - Upgraded ballistic missile renderer: sleek vector cruise-missile airframe with phosphor glow + true normal-projected dual-helix telemetry contrails matching `f_016.jpg` and `pair_005.00.jpg`.
  - Upgraded multi-stage detonation: 48-ray cyan starburst + horizontal anamorphic flash (`f_023.jpg`) -> double shockwave ring with 12 coral lightning arcs -> large, high-detail DEFCON silhouettes (ICBM triple-launcher, mobile missile, side-profile fighter, delta interceptor, lattice radar dish, tracked tanks, clocked schoolhouse, homes, civilians, map pins) + green `IMPACT COMPLETE` telemetry (`f_033.jpg`).
  - Added spatial hover/cursor action pills (`[SPC] FIRE`, `[C] RECON N`) directly beside the aimed radar cell during manual interaction, with full single-click badge operation and `[R]` instant sortie recovery.
- **`projects/g15/m2/game/play.mjs`**:
  - Choreographed to hit all three verification timestamps cleanly (`t=2.0s` active AI laser lock on `G5` with `H3` recon cursor + spatial cell-side action pills; `t=5.0s` cruise missile + dual-helix arc in mid-flight; `t=8.0s` full-scale `IMPACT COMPLETE` radar shockwave illuminating military + white civilian silhouettes side-by-side; `t=9.5–13.8s` `[C]` Recon exposing `D4` civilian false positive and redirecting fire to pure hostile `H3`).
- **Verification Capture (`run_pipeline.py --project g15 --milestone m2 --stages verify`)**:
  - `playtest/take.mp4`: `826 frames, 13.9 s, 59.6 fps, 0 console errors` (`best.mp4`: `5.50 s -> 13.50 s`, motion score `0.0068`).
  - Side-by-side pairs (`pairs/pair_002.00.jpg`, `pair_005.00.jpg`, `pair_008.00.jpg`) visually inspected and verified clean.
