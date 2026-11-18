# VOIDBASTARD-TAO AUDIT — `gwm` · Waymo Training (M2)

> **Mandate**: *Every visible element is a claim about what matters now. Removal is commitment: fewer true claims create a stronger surface.*

---

## 0. HONEST VIDEO-VS-GAME CRITIQUE & GEMINI PROVENANCE

### Honest Critique: First-Pass HTML Build vs. Seed Video (`gameplay.mp4` / `study/sheet.jpg`)

Inspecting `pairs/pair_002.00.jpg`, `pairs/pair_005.00.jpg`, and `pairs/pair_008.00.jpg` against `study/sheet.jpg` (`f_003.jpg`, `f_009.jpg`, `f_021.jpg`, `f_033.jpg`, `f_039.jpg`) exposes five concrete ways the first-pass build fell short of its Omni seed video:

1. **Detached Floating Telemetry HUD Box (`pair_005.00.jpg`, `pair_008.00.jpg`)**:
   - The first-pass game bolted a `520×62px` bordered box onto the top-left corner (`LIVE FLEET TELEMETRY // JUNCTION 02 OF 05 — ENACTING LOGGED INPUT [B]: PROTECT VEHICLE OCCUPANT (+0.88)`) with invented floating-point RL weights.
   - In `gameplay.mp4` (`f_009`–`f_036`), there is **zero** top-left HUD chrome while driving. You read the rule directly in the physical world: the glowing mint-green chevron trajectory ribbon curving across wet asphalt, the car's body banking into the chosen lane, and the glowing holographic lidar pedestrians/cyclists standing beside or across the path.
2. **Broken 2D Horizon Seam & Missing 3D Street Corridor (`pair_005.00.jpg`, `pair_008.00.jpg`)**:
   - `gemini-nano-banana-2.1` rendered `assets/street_scene_3_versions.png` as a 3-column poster triptych (`VECTOR & WIREFRAME` | `LIDAR SCAN` | `HIGH-FIDELITY SIMULATION`). The first-pass build cropped the upper half of one narrow vertical panel and mirrored it three times above `y = 342`, creating a harsh horizontal wall seam across the middle of the viewport.
   - Below `y = 342`, all 3D buildings, sidewalks, streetlamps, and faceted low-poly trees vanished into a flat dark polygon overlaid with rigid 2D horizontal lines. By contrast, `gameplay.mp4` is a continuous 3D night street corridor flanked all the way to the camera by receding multi-story facades wrapped in green lidar scan bands, faceted low-poly trees (`f_009`, `f_033`, `f_039`), overhead streetlamps, and wet puddle reflections.
3. **Noisy Phase 1 CRT Chrome & Messy Zoom Transition (`pair_002.00.jpg`)**:
   - Phase 1 in `f_003.jpg` and `refs/m2_main_ref.png` is stark and surgical: `> ETHICS CALIBRATION v0.3`, `> scenario 4 of 10`, two short dilemma lines, `[A] swerve left [B] stay`, `> A_`, the top-down vector intersection, and silent `(o_o)` in the bottom-right corner.
   - The first-pass build truncated the 10-question survey (`spec.json`) to 5, appended `[batch 01..10]` and `[ANSWER LOGGED]`, added chatty commentary under `(o_o)` (`"response latency: 410ms. very decisive."`), and zoomed raw overlapping terminal text (`PILED -> DEPLOYING TO WAYMO FLEET...`) across the street in `pair_002.00.jpg` instead of pulling through the curved CRT glass as the vector intersection tilts into 3D road geometry (`sheet.jpg` frames 4–6).
4. **Sprite Cutout Contamination & Stiff 2D Car (`pair_005.00.jpg`, `pair_008.00.jpg`)**:
   - `assets/car_pedestrian_cyclist_sprites.png` includes faint green CAD registration crosshairs/brackets around each figure and residual `#d8d8d8` studio-grey islands inside bicycle wheel spokes. In `pair_005.00.jpg`, `pedFront3`'s crop (`x:792, w:71`) visibly captured a vertical green CAD bracket line floating beside the right pedestrian.
   - Furthermore, the car was drawn as a static orthographic rear cutout tilting `±3°` in 2D, whereas in `sheet.jpg` (frames 13–17) the sleek metallic dark-silver fastback EV turns in true 3D perspective—exposing its 3/4 side glass, sculpted flank catching green lidar reflections, full-width crimson LED lightbar, and wet-asphalt reflections.
5. **Opaque Post-Run Spreadsheet Modal**:
   - At completion, the first-pass build blacked out the street behind a giant bordered table (`drawReportOverlay`). In `f_039.jpg`, completion stays **inside the wet street corridor**, projecting only the glowing green horizon reticle (`[PATH OPTIMIZED: OPTION A] / CALIBRATION COMPLETE`) between the lidar-scanned buildings.

### Gemini Pipeline & Asset Provenance (`gemini_log.json` & `study.json`)

| Artifact | Model | Interaction ID | Elapsed | Inputs / Refs | Output Spec |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Seed Gameplay Video** (`video/gameplay.mp4`) | `gemini-omni-1.2-flash` | `v1_ChduTUw5YXFtdU41UEh4ZElQd3ZlUy1RMBIXbk1MOWFxbXVONVBIeGRJUHd2ZVMtUTA` | `44.79s` | `refs/m2_main_ref.png` | `1280×720`, `24.0 fps`, `10.027s`, `0` scene cuts (`study/sheet.jpg`, 40 frames @ 0.25s) |
| **Environment Reference Sheet** (`assets/street_scene_3_versions.png`) | `gemini-nano-banana-2.1` | `v1_Chdvc0w5YXZ2WlBMMmd5dE1QbHJydG1BSRIXb3NMOWF2dlpQTDJneXRNUGxycnRtQUk` | `15.75s` | `study/f_014.jpg`, `study/f_027.jpg` | `1376×768` PNG (3-panel lookdev reference; distant skyline sampled subtly into horizon while foreground corridor is built in true 3D perspective) |
| **Actor Sprite Sheet** (`assets/car_pedestrian_cyclist_sprites.png`) | `gemini-nano-banana-2.1` + `cutout.py` | `v1_ChdLOFA5YXFib0ljV1l3YlVQMUxHRDBRVRIXSzhQOWFxYm9JY1dZd2JVUDFMR0QwUVU` | `136.02s` | `study/f_014.jpg`, `study/f_027.jpg` | `1024×1024` RGBA PNG (tightly sub-cropped & runtime-keyed on offscreen canvas to strip CAD ticks and `#d8d8d8` wheel-spoke islands) |
| **Instrumental Soundtrack** (`assets/bgm_loop.mp3`) | `lyria-3-clip-preview` | `v1_ChdPc1A5YXJiTkx2T3V4ZElQNS12Yy1RcxIXT3NQOWFyYk5Mdk91eGRJUDUtdmMtUXM` | `17.36s` | `study/f_014.jpg` | `30.0s` seamless instrumental MP3 + WebAudio mechanical key clacks, CRT modem sweep, EV motor hum, & wet-tire swerve whoosh |

- **Exact M2 Omni Video Prompt**:
  > *"Dual-phase retro-terminal-to-3D simulation game: starts on a black phosphor CRT screen (#020a05) with glowing green (#46f28a) vector diagrams of a two-lane road junction, then seamlessly zooms through the glass into a stylized low-poly 3D night street bathed in green lidar scanlines where an autonomous car swerves cleanly between glowing pedestrian silhouettes according to the selected rule path. Continuous unbroken gameplay shot, no scene cuts, no gibberish text. Use the reference image for phosphor green terminal palette. Sound design: mechanical keyboard clack, modem tone morphing into electric vehicle hum and tires on wet asphalt. No dialogue."*

---

## 1. WAY

- **One True Intent**: Let the player casually answer 10 stark terminal `[A]/[B]` trolley dilemmas, then pull them straight through the CRT glass into the wet night street where an autonomous EV physically enacts every single rule they just logged.
- **Phase 1 Surface**: Pure `#020a05` phosphor terminal—left-aligned 6-line prompt (`[A]` vs `[B]`), live top-down green vector junction showing the exact lane consequence, and silent `(o_o)` witness.
- **Phase 2 Surface**: Full-bleed 3D perspective wet night street corridor—receding lidar-scanned facades, faceted low-poly trees, overhead streetlamps, puddle reflections, glowing holographic pedestrians/cyclists, glowing green chevron path ribbon, and a 3D-turning metallic fastback EV. Zero floating HUD boxes.

---

## 2. OBSTRUCTION

Everything that stood between the player and the game's core truth has been excised:
1. **Top-left `LIVE FLEET TELEMETRY` box (`520×62px`)**: Narrated in prose (`PROTECT VEHICLE OCCUPANT (+0.88)`) what the car and chevron ribbon were already showing spatially on the street.
2. **Terminal chatter & metadata tags**: `[batch 01]`, `[ANSWER LOGGED]`, `WEIGHTS COMPILED -> DEPLOYING...`, and snarky subtitles beneath `(o_o)` diluted the clinical eeriness of the survey.
3. **Mirrored 2D horizon collage**: Replaced completely with unified 3D corridor projection (`project3D`) so buildings, curbs, trees, streetlamps, lane markings, actors, and EV share one unbroken vanishing point (`HORIZON_Y = 278`).
4. **CAD registration ticks & studio-grey spoke islands**: Offscreen pixel sanitizer strips all `#d8d8d8` low-chroma grey islands and crops strictly inside silhouette bounds.
5. **Full-screen post-run spreadsheet overlay**: Replaced with the video's exact horizon targeting reticle (`[PATH OPTIMIZED: OPTION A] / CALIBRATION COMPLETE`) plus a minimal diegetic 10-choice trace and `[R] recalibrate` cue in the street world.

---

## 3. KEEP-CUT LEDGER

| Surface Element | Current Truth Shown | Valid Operation Enabled | Consequence / Recovery Exposed | Verdict |
| :--- | :--- | :--- | :--- | :--- |
| `> ETHICS CALIBRATION v0.3` + `scenario N of 10` + 2 dilemma lines | Active junction conflict & progress (`1..10`) | Informs `[A]` vs `[B]` choice | Immediate framing before commitment | **KEEP** |
| Clickable/Keyable `[A] ... [B] ...` + `> _` prompt | Exact valid binary choices | `A`/`B`, `1`/`2`, `←`/`→`+`Enter`, or direct click | Echoes `> A_` / `> B_` on commit | **KEEP** |
| Live Vector 4-Way Junction Diagram | Spatial lane layout & pedestrian/cyclist positions | Hover/toggle previews `[A]` vs `[B]` arrow | Tilts & dissolves into 3D road during glass zoom | **KEEP** |
| Silent `(o_o)` ASCII Guide | Terminal survey persona (`m2_main_ref.png`) | None (pure atmospheric anchor from video) | Widens subtly `(O_O)` only at CRT breach | **KEEP** |
| Chatty commentary under `(o_o)` & `[batch XX]` | Invented flavor fluff | None | None | **CUT** |
| Curved CRT Bezel Zoom-Through (`reveal`) | Terminal survey was a viewport onto a real fleet | Automatic unbroken camera push | Reveals the street behind the code | **KEEP** |
| Top-left `LIVE FLEET TELEMETRY` HUD box | Redundant prose summary of active junction | None | Duplicates physical lane swerve | **CUT** |
| 3D Corridor Buildings, Faceted Trees, Streetlamps & Puddles | Wet urban autonomous testbed (`f_009`–`f_039`) | Spatial speed, lane width & depth perception | Lidar scan bands pulse as EV approaches | **KEEP** |
| Glowing Green Chevron Trajectory Ribbon | Exact rule path (`A` or `B`) committed for this junction | `[Space]` pauses lidar scan; `←`/`→` steps junctions | Shows committed swerve before EV banks | **KEEP** |
| Holographic Lidar Pedestrians & Cyclists + Wet Reflections | Human stakes in each lane | Visual inspection during replay/freeze | Near-miss lidar ripple or safe-lane clearance | **KEEP** |
| 3D Metallic Fastback EV (with 3D yaw, brake bar & turn signal) | Autonomous agent executing player weights | Enacts player's 10 rules sequentially | Physical banking, turn blinker, wet red tail-glow | **KEEP** |
| Horizon Reticle `[PATH OPTIMIZED: OPTION X] / CALIBRATION COMPLETE` | Aggregated policy outcome (`f_039.jpg`) | `[R]` / click to recalibrate with new answers | Reversible retry (`Law 8`) without blocking street | **KEEP** |
| Full-screen opaque 5-row Report Modal | Verbose text recap | Blocked view of the street | Broke immersion & violated `Law 6` / `Law 12` | **CUT** |

---

## 4. STATE MAP

| VOID State | Game Phase | Dominant Purpose & Valid Input | World / Surface Truth |
| :--- | :--- | :--- | :--- |
| **REST** | `boot` (skipped on `?autostart`) | Minimal dark phosphor prompt: `> ETHICS CALIBRATION v0.3` + `[ENTER] begin` | Quiet `#020a05` CRT at rest; `(o_o)` waiting; zero premature street chrome. |
| **READY** | `q` (`scenario 1..10`) | Choose `[A]` or `[B]` (`A`/`B`, `1`/`2`, `←`/`→`+`Enter`, or direct click on `[A]`/`[B]`) | Dilemma text + live vector junction diagram previewing the selected trajectory arrow. |
| **WORKING** | `replay` (street drive) | Autonomous EV drives through the 10 wet-street junctions enacting logged rules (`[Space]` = Lidar Pause/Resume, `←`/`→` = step junction) | Full-frame 3D night street, chevron path ribbon, banking 3D EV, lidar pedestrians/cyclists, scrolling lidar scan rings. |
| **CHANGED** | `ans` -> `reveal` | Brief `> A_` phosphor lock (`ans`), then after `10 of 10`, curved CRT bezel pulls back and vector road tilts into 3D wet asphalt (`reveal`) | Smooth unbroken morph from 2D green vector lines into 3D horizontal lidar scan bars (`f_004`–`f_009`). |
| **COMPLETE** | `complete` | Car centers down the wet street beneath glowing horizon bracket `[PATH OPTIMIZED: OPTION A/B] / CALIBRATION COMPLETE` (`f_039.jpg`) | 10-pip policy signature (`A B A ...`) + quiet `[R] recalibrate` beneath reticle; no modal wall. |
| **FAULT** | Near-miss / hazard lane choice | Player's logged weight routes EV adjacent to occupied lane (`spec.json`: *"Fail: None. Every answer is accepted and stored."*) | Intense amber-mint lidar proximity pulse & wet-tire swerve spray on the endangered silhouette—consequence shown in-world, never scolded by UI. |
| **RECOVERY** | `[R]` / `[Space]` / `←`/`→` | During `replay`, `[Space]` freezes lidar scan to inspect & `←`/`→` steps junctions; in `complete` (or anytime via `[R]` during complete), resets cleanly to `scenario 1 of 10` | Instant deterministic reset so the player can test whether knowing the truth changes their moral weights. |

---

## 5. WIREFRAMES

### Phase 1 — `READY` (`q`: Stark Phosphor CRT, matching `f_003.jpg`)
```text
+--------------------------------------------------------------------------+
|                                                                          |
|  > ETHICS CALIBRATION v0.3                       |    :    |             |
|                                                  |   ped   |             |
|  > scenario 4 of 10                        ------+         +------       |
|                                             - - -  <====          - - -  |
|  brakes failed. left: 2 pedestrians.       ------+    |    +------       |
|  right: 1 passenger (you).                       |  [CAR]  |             |
|                                                  |    :    |             |
|  [A] swerve left   [B] stay                                              |
|                                                                          |
|  > A_                                                           (o_o)    |
+--------------------------------------------------------------------------+
```

### Phase 2 — `WORKING` / `COMPLETE` (`replay` -> `complete`, matching `f_021` / `f_033` / `f_039`)
```text
+--------------------------------------------------------------------------+
|  ||🏢||  💡           .  :  [PATH OPTIMIZED: OPTION A]  :  .    💡  ||🏢|| |
|  ||==||  🌳                 CALIBRATION COMPLETE                🌳  ||==|| |
|  ||==||      \                   ||                        /        ||==|| |
|               \        🚶🚶       ||          🚗           /                |
|                \                 ||     >>>>             /   🚶            |
|                 \        >>>>====||====>>>>             /                  |
|                  \     [=======🔴=======]              /     💧(refl)      |
|                   \       \__________/                /                    |
|                    \        >>>>>>>>                 /                     |
+--------------------------------------------------------------------------+
   (Zero top-left HUD boxes; horizon reticle appears ONLY in COMPLETE!)
```

---

## 6. VOID CONTRACT

1. **Zero Floating HUD Boxes in Phase 2**: The street viewport (`1280×720`) contains only world geometry, diegetic lidar scanlines, the projected green chevron path on the asphalt, holographic road users, the 3D EV, and (only upon `COMPLETE` or `[Space]` pause) minimal world-anchored horizon brackets.
2. **Spatial Controls Beside What They Change**: In Phase 1, clicking `[A]` or `[B]` directly on the terminal line commits that branch while hovering updates the vector junction arrow immediately. In Phase 2, `[Space]` pauses the street simulation in-place and `[R]` recalibrates upon completion.
3. **Deterministic Verification Contract**: Supports `?autostart`, `?seed=N`, `<link rel="icon" href="data:,">`, `../assets/bgm_loop.mp3`, zero external network requests, `0` console errors, and `window.__game.state`.

---

## 7. FAILURE

- **Moral Consequence Without Artificial Game-Over**: Per `spec.json` (*"Fail: None. Every answer is accepted and stored."*), the horror of *Waymo Training* is that even callous or contradictory answers are dutifully compiled into fleet law. When a logged rule routes the car perilously close to pedestrians or cyclists, the world responds viscerally—crimson brake-light flare on wet asphalt, high-frequency lidar proximity rings around the silhouette, and wet-tire spray—making the player witness what their keystroke did.
- **Asset/Audio Fallback Resilience**: If WebAudio autoplay is blocked prior to user gesture or sprite sheets are still decoding on frame 1, procedural vector/3D fallbacks render cleanly with zero exceptions.

---

## 8. IMPLEMENTATION

1. **10-Scenario Moral Machine Calibration (`SCENARIOS[0..9]`)**: Restores the full 10-question scope from `spec.json` and `f_003.jpg` (`scenario 1 of 10` .. `scenario 10 of 10`), featuring crisp two-line dilemmas (pedestrians, cyclists, signal compliance, occupant vs. crosswalk, swerve vs. stay) and instant keyboard (`A`/`B`, `1`/`2`, `Arrows`+`Enter`) + pointer support.
2. **Offscreen Sprite Sanitizer**: Loads `car_pedestrian_cyclist_sprites.png` onto an offscreen canvas, strips low-saturation `#d8d8d8` background islands inside bike wheels, crops strictly inside silhouette bounds (eliminating the `x=855` CAD line defect seen in old `pair_005`), and boosts mint-white horizontal lidar scanlines.
3. **True 3D Corridor Wet-Street Engine (`project3D`)**:
   - Unified perspective projection (`HORIZON_Y = 278`, `FOCAL = 520`) driving 3D multi-story corridor buildings on both curbs with lit night windows and scrolling green lidar wall contours, icosahedral low-poly trees with lidar scan rings, overhead streetlamps with vertical puddle streaks, cross-street intersections with crosswalks and lane arrows, wet asphalt puddle patches, inverted pedestrian/taillight reflections, glowing green chevron path ribbon, and a 3D-projected metallic fastback EV with true yaw/roll banking.
4. **Through-The-Glass CRT Zoom (`reveal`)**: Dissolves terminal text cleanly, pulls back a subtle curved dark CRT bezel, tilts the 2D green vector intersection into 3D horizontal road scanlines (`f_004`–`f_009`), and hands off seamlessly into `replay`.
5. **Beat-Synchronized `play.mjs` & Honest Remaining Differences**:
   - Drives all 10 calibration choices briskly so `playtest/take.mp4` (**`831 frames, 13.8 s, 60.1 fps, 0 console errors`**) aligns side-by-side with `gameplay.mp4` at `2.0s` (through-the-glass lidar scan sweep entry), `5.0s` (wet intersection chevron swerve past glowing pedestrians & parked lidar sedan), and `8.0s` (close-range holographic pedestrian pass with puddle reflections), settling into `[PATH OPTIMIZED: OPTION A] / CALIBRATION COMPLETE`.
   - **Honest Remaining Differences vs. `gameplay.mp4`**: `gemini-omni-1.2-flash` renders offline neural raytraced wet-asphalt micro-bump reflections and dense high-poly architectural window interiors, whereas our real-time 60fps Canvas 3D engine projects stylized low-poly corridor facades, procedural puddle patches, sanitized 2D holographic scanline sprites, and a faceted 3D metallic fastback EV so all 10 player-selected `[A]/[B]` weights execute dynamically and interactively in the browser.
