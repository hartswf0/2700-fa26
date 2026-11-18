# VOIDBASTARD-TAO AUDIT — `g1` · Space Farmer (M2)

> **Mandate**: Operational Emptiness Engine (`VOIDBASTARD-TAO`) × Video-to-Game Fidelity Audit.
> Show only what is true now. Leave the center open. Anchor every operation in the lunar room.

---

## 0. HONEST VIDEO-VS-GAME CRITIQUE & GEMINI PROVENANCE

### Forensic Critique of First-Pass M2 Build vs. Seed Video (`video/gameplay.mp4` / `study/sheet.jpg`)

Comparing `study/sheet.jpg` (`f_001.jpg`–`f_040.jpg`) against the first-pass `pairs/pair_002.00.jpg`, `pair_005.00.jpg`, and `pair_008.00.jpg` exposed seven concrete failures of fidelity, visual hygiene, and focus:

1. **Busy Back-Wall Linework Fighting Silhouette Readability (`pair_002`, `pair_005`)**:
   In `gameplay.mp4`, the space behind the planter bed and left water pump is stark, atmospheric lunar dusk (`#171b1a` / `#272a29`) pierced by two warm overhead lamp cones—making the dark-suited Overseer, light-suited clones, golden parabolic drag arcs, and pump steam read instantaneously. The Nano Banana environment `station_background_one_room.png` added bright cream-white bulkhead hatches, shelves, and generator boxes directly behind the lineup, swallowing clone silhouettes and selection arcs.
2. **Baked Static Sprouts Double-Drawn Under Dynamic Crops (`pair_002`–`pair_008`)**:
   `station_background_one_room.png` baked 7,739 bright golden sprout pixels permanently onto the left soil plots (`x=325..720, y=429..619`), while the game also layered dynamic `crop_tile_3_growth_stages.png` sprites on top—causing static unharvestable sprouts to remain frozen underneath dynamic crops, plus four oversized Stage-2 wheat stamps (`pair_008.00.jpg`) burying the entire bed in identical hay walls instead of the video's clean spatial zones (golden left shoots, dark center seedlings, lush front-right wheat in `f_027.jpg` / `f_033.jpg`).
3. **12,532 Trapped `#d1d1d1` Studio-Grey Pixels Inside Sprite Loops**:
   Border flood-fill in `cutout.py` missed closed interior loops in `farmer_sprite_2_poses.png` (`raw` studio background `rgb(209, 209, 209)`), leaving 6,312 solid grey pixels trapped inside the backpack hose loop (Pose 0), bent elbow gap (Pose 1), and wicker basket handle loop (Pose 1), plus ~6,220 neutral grey fringe pixels along outer outlines.
4. **Premature Copy-Pasted Harvest Baskets on Idle Clones & Overseer (`pair_002`, `pair_005`)**:
   Pose 1 in `farmer_sprite_2_poses.png` holds a full wicker basket of golden wheat. The first-pass build used Pose 1 unaltered for every idle clone on Frame 1 *and* for the dark-suited Overseer—so three clones and the Overseer stood holding glowing orange baskets of harvested grain before a single crop had grown.
5. **Flat Neon-Red Blob Hostile Tint (`pair_008` vs `f_027` & `f_033`)**:
   Overworking a clone replaced all RGB channels with flat bright tomato red, obliterating dark ink outlines, suit shadows, and helmet glass contrast. In `f_027.jpg`, the snapping clone retains crisp dark linework, maroon-shadowed suit folds, a glowing red helmet rim + ember sparks, and in `f_033.jpg` paces restlessly in dark desaturated gear under a crisp `[!]` marker while two `⊗` fault markers pulse on the steaming pump.
6. **Inert Mockup Palette Tray & Redundant HUD Highlights**:
   The first-pass build copied a 92px-tall rounded brown 6-swatch bar at the bottom (`y=628..720`)—an inert greybox palette artifact from `m2_main_ref.png` that enabled zero operations while obscuring the front rim of the soil bed. It also drew a permanent dashed keyboard targeting arc and idle selection circle even when the player wasn't aiming (`pair_005.00.jpg`), and kept brown highlight bars stuck on all three task rows simultaneously (`pair_008.00.jpg`) rather than only highlighting active/newly changed work.
7. **Full-Screen Modal Text Walls Breaking Room Presence (`DAY BRIEF` & `NIGHT CHECK`)**:
   Between shifts, giant `720×250` and `760×340` opaque modal boxes covered the lunar room to narrate rules and count clones in abstract UI circles instead of letting dusk fall directly inside the room and counting the calm vs. hostile clones spatially where they stand.

### Honest Remaining Differences After Rebuild

Even after rebuilding under VOIDBASTARD-TAO, we state plainly what still differs from the Gemini Omni 1.2 Flash seed video:
- **Pose Articulation**: `gameplay.mp4` (`gemini-omni-1.2-flash`) synthesizes continuous per-frame skeletal motion—kneeling into the soil (`f_021.jpg`), throwing both arms wide during the pump tantrum (`f_027.jpg`), and bare-visored facial expressions. Our real-time Canvas game drives two cleaned Nano Banana 2.1 key sprites (`work` tool-hose pose and `stand` empty/harvest-basket variants) using squash-and-stretch parabolic arcs, subtle breathing/working oscillation, procedural water/spark streams, and crimson rim-lighting.
- **Architectural Silhouettes**: Rather than discarding `station_background_one_room.png`, we apply a deep lunar dusk atmospheric grade over its upper bulkhead wall and cleanly resurface the soil interior so the Nano Banana pump, porthole moon, lamp rigs, and isometric planter frame remain grounded in the generated asset while matching the dark contrast ratio of `sheet.jpg`.

### Gemini API & Asset Provenance (`gemini_log.json`)

| Stage / Asset | Model | Interaction ID | Elapsed | Refs Grounded On | Output Files |
| :--- | :--- | :--- | ---: | :--- | :--- |
| **Seed Gameplay Video** (`gameplay`) | `gemini-omni-1.2-flash` | `v1_Chd5OEQ5YXUyQ1BMcmU1Tm9Qel92QzRBMBIXeThEOWF1MkNQTHJlNU5vUHpfdkM0QTA` | `37.69s` | `refs/m2_main_ref.png` | `video/gameplay.mp4` (`1280×720`, `24fps`, `10.03s`) |
| **Farmer Sprite** (`farmer_sprite_2_poses`) | `gemini-nano-banana-2.1` | `v1_ChcwTUQ5YXFic0hfSzV3YlVQc0tXQ3FBSRIXME1EOWFxYnNIX0s1d2JVUHNLV0NxQUk` | `20.08s` | `study/f_014.jpg`, `study/f_027.jpg` | `assets/farmer_sprite_2_poses_raw.png`, `assets/farmer_sprite_2_poses.png` |
| **Crop Growth Tiles** (`crop_tile_3_growth_stages`) | `gemini-nano-banana-2.1` | `v1_Chc1TUQ5YXJPWUk1dUx5dUx5dE1QaGNhUm1BURIXNU1EOWFyT1lJNXVMeXRNUGhjYVJtQVE` *(logged: `v1_Chc1TUQ5YXJPWUk1dUx5dE1QaGNhUm1BURIXNU1EOWFyT1lJNXVMeXRNUGhjYVJtQVE`)* | `14.94s` | `study/f_014.jpg`, `study/f_027.jpg` | `assets/crop_tile_3_growth_stages_raw.png`, `assets/crop_tile_3_growth_stages.png` |
| **Station Room** (`station_background_one_room`) | `gemini-nano-banana-2.1` | `v1_Chc4OEQ5YXB5eUlMM0F5dE1QbHZHVXdRaxIXODhEOWFweXlJTDNBeXRNUGx2R1V3UWs` | `24.23s` | `study/f_014.jpg`, `study/f_027.jpg` | `assets/station_background_one_room.png` |
| **Soundtrack Loop** (`bgm_loop`) | `lyria-3-clip-preview` | `v1_ChdDOEg5YXBuRExhZS14ZElQcUtxMTZRURIXQzhIOWFwbkRMYWUteGRJUHFLcTE2UVE` | `10.77s` | `study/f_014.jpg` | `assets/bgm_loop.mp3` (`30s` instrumental loop) |

- **Exact Omni M2 Video Prompt**:
  > `2.5D stylized lunar station farming game, desaturated scratchy ink-and-gouache lines on dark slate (#1d1f1c) with warm amber (#e0a35a) glowing only on living crops and characters. Fixed elevated three-quarter room camera. A lone farmer drags and assigns two identical clones onto glowing amber crop rows and a water pump; one overworked clone turns restless red-tinted and shrugs off the task while calm clones harvest golden sprouts. Continuous unbroken gameplay shot, no scene cuts, no gibberish HUD text. Use the reference image for palette and room layout. Sound design: low lunar station hum, soft soil rustle, subtle warning chime. No spoken dialogue.`

---

## 1. WAY

One lunar greenhouse room. One verb: **drag a clone onto work** (or click a station to dispatch a rested hand).
- **Truth in color**: Cold lunar slate (`#1d1f1c`) holds everything inert; warm amber (`#e0a35a`) glows *only* on living crops, rested clones, and valid trajectories; restless crimson (`#df4638`) marks overworked clones and sabotaged machinery.
- **One-sentence rule**: Every clone completes one task calmly before needing a brief breather in the lineup; assigning a winded clone before they recover snaps them permanently hostile, and if hostile clones outnumber calm ones at night check, the room is theirs.

---

## 2. OBSTRUCTION

What blocked direct contact with the game in the first pass:
1. **Inert Bottom Mockup Tray (`y=628..720`)**: Claimed 13% of screen height without enabling any action or communicating intelligible state.
2. **Always-On Keyboard Guide Arc & Idle Selection Ring**: Painted orange arcs and circles over the center of the room when no drag or keyboard aim was active.
3. **Modal Briefing & Night Walls**: Hid the farm behind text rectangles at day start and night check instead of staging daybreak and the night mood tally directly on the clones in the room.
4. **Visual Falsehoods in Assets**: Premature wheat baskets on unharvested clones/Overseer, baked background sprouts under empty soil, and `#d1d1d1` studio-grey islands inside sprite loops.

---

## 3. KEEP-CUT LEDGER

| Element / Surface | Verdict | VOIDBASTARD-TAO Justification (Element Test) |
| :--- | :---: | :--- |
| **Isometric 6-Plot Soil Bed & Dynamic Crop Stages** | **KEEP (Refine)** | Shows true crop maturity (`seedling -> golden shoots -> ripe wheat`) and accepts spatial watering/harvest drops. Baked static background sprouts masked out. |
| **Steaming Left Water Pump + `⊗` Fault Badges** | **KEEP (Refine)** | Physical target for `fix pump`; vents steam when unserviced and pulses twin red `⊗` markers (`f_033.jpg`) when sabotaged by an overworked clone. |
| **Clones with Spatial Drag / Recall & Winded Arc** | **KEEP (Upgrade)** | Primary actors. Hover/drag reveals selection halo (`f_014.jpg`); winded clones show a tight breathing recovery ring; dragging a winded clone turns the trajectory arc amber-red (`OVERWORK RISK`); clicking a straining clone recalls them (`Stop`). |
| **Compact Top-Right `DAY X TASKS` Slate** | **KEEP (Declutter)** | Present in `gameplay.mp4` (`sheet.jpg`). Stripped sticky multi-row brown fills so *only* the currently active row glows softly; thin 2px bottom dusk hairline shows shift time remaining. |
| **Cloning Vat Pod (`+ CLONE` Diegetic Cue)** | **KEEP (Conditional)** | Law 4 & 5: Pulsing amber pod window exposes `[G]` / click-to-grow *only* when hovered or when tasks exceed calm hands, right beside the pod. |
| **Bottom 6-Swatch Rounded Trapezoid Bar** | **CUT** | Fails Element Test: non-interactive greybox palette artifact from `m2_main_ref.png` that obscured the planter bed. |
| **Always-On Dashed Keyboard Targeting Arc** | **CUT** | Law 1 & 4: Shown *only* briefly (`2.5s`) when keyboard selection keys (`1–5`, `Q/W/E`, `Arrows`) are actively pressed—never during mouse play or idle observation. |
| **Full-Screen `DAY BRIEF` & `NIGHT CHECK` Modals** | **CUT -> WORLD** | Law 6: Replaced blocking modal boxes with in-room lamp transitions and spatial clone-by-clone mood tally badges (`✓` calm vs `!` hostile) directly over the lineup. |
| **`HOW TO PLAY` Paragraph Box** | **CUT** | Law 2: Replaced verbose two-line prose manual with self-evident spatial hover rings and a minimal title prompt (`FIVE DAYS ON THE FARM` / `START`). |
| **Premature Wheat Baskets on Idle Clones & Overseer** | **CUT** | Law 6 & 9: Surgically removed basket from default standing sprite; basket appears *only* on clones who have actually harvested wheat (`carryingWheat`). |

---

## 4. STATE MAP

| Canonical State | Dominant Purpose | Valid Player Action(s) | World / Diegetic Expression |
| :--- | :--- | :--- | :--- |
| **`REST`** (`title`) | Quiet lunar room before shift 1 | Click `START` or press `Enter`/`Space` | Dimmed greenhouse lamps, gentle dust motes, clean title stamp (`FIVE DAYS ON THE FARM`), zero HUD boxes. |
| **`READY`** (`work` — idle hands) | Survey tasks & rested clones | Drag calm clone to crop bed / pump, click station directly, or click pod (`[G]`) | Overhead lamps warm the soil; top-right task slate lists 3 tasks; hover highlights clone halo (`f_014`) or target ring. |
| **`WORKING`** (`work` — active) | Clones executing assigned labor | Assign other calm clones; click straining clone to **Recall/Stop** (`[X]`); `[P]` Pause | Parabolic jump arc lands with soil sparks; diegetic radial progress ring turns beneath working clone; hose mist / wrench sparks fly. |
| **`CHANGED`** (`work` — yield / fatigue) | World reflects completed labor | Let winded clone rest (`5s` breather ring) or press `[R]` to steady | Watered rows sprout golden shoots (`f_021`); harvested wheat fills clone's wicker basket; completed task checks off `[✓]`. |
| **`FAULT`** (`work` — overwork snap) | Consequence of pushing winded clone | Dispatch a rested calm clone to repair `[X] fix pump` | Overworked clone snaps crimson-rimmed (`f_027`) with `[!]` badge, paces in dark suit (`f_033`), strikes task with red `[X]` + pump `⊗` markers. |
| **`RECOVERY`** (`night` / `[R]`) | Count calm vs. hostile hands at dusk | Click / `Space` to advance (or auto-advance after spatial count); `[R]` quick-restart | Lamps dim to lunar blue-slate; each clone lights up in sequence (`CALM` amber vs `HOSTILE` red) with minimal overhead tally. |
| **`COMPLETE`** (`endA` / `endB`) | Resolution without new demand | `[R]` / `Enter` / Click to start a new 5-day run | **Harvest Ships** (golden grain glow across room) or **Station Taken** (red emergency lamp wash as hostile clones hold the floor). |

---

## 5. WIREFRAMES

### Active Shift (`READY` / `WORKING` / `FAULT`) — Open Center, Spatial Cues Only
```text
+--------------------------------------------------------------------------+
|                                                      +-----------------+ |
|        //\\                  //\\                    | DAY 2 TASKS     | |
|       /    \   [Pod]        /    \                   | [✓] water rows  | |
|   [Pump]    \              /      \                  | [X] fix pump    | |
|   (steam)  [!]Hostile   [Overseer] [Clone2] [Clone3] | [ ] harvest     | |
|     ⊗             \        /          (o)            | CLONES 3 · 2/3  | |
|                    v      /         (arc)            +=========[dusk]==+ |
|            /=====================\    |                                  |
|           /  *golden*  .seed.  ###\ <-+ (radial ring on target plot)     |
|          /   *shoots*  .soil.  ### \                                     |
|          \=====================/===/                                     |
|                     (open lunar floor — zero bottom bar)                 |
+--------------------------------------------------------------------------+
```

### In-Room Night Tally (`RECOVERY` — No Blocking Modal Box)
```text
+--------------------------------------------------------------------------+
|                     NIGHT 2 · CALM 2  |  HOSTILE 1                       |
|                                                                          |
|                [!]                   [✓]        [✓]                      |
|             (red pulse)          (amber glow) (amber glow)               |
|             [Hostile 1]            [Clone 2]   [Clone 3]                 |
|                                                                          |
|            /===========================================\                 |
|           /              dimmed lunar crop bed          \                |
+--------------------------------------------------------------------------+
```

---

## 6. VOID CONTRACT

1. **Zero detached control buttons**: Every shift operation happens by touching/dragging clones, crop plots, the water pump, or the cloning vat in the 2.5D room (with full keyboard parity `1–5`, `Q/W/E`, `Space`, `G`, `R`, `P`).
2. **Zero premature indicators**: Clone selection circles, trajectory arcs, target rings, and pod `+ CLONE` prompts stay invisible until hovered, dragged, or actively working.
3. **Risk friction before irreversible loss (Law 10)**: Dragging a winded clone turns the live parabolic arc and landing ring warning-crimson (`OVERWORK!`) *before* release, and gives a `0.85s` straining window where clicking the clone aborts the task before they turn permanently hostile.
4. **Honest world persistence (Law 6 & 9)**: Harvested wheat stays visibly carried in that clone's basket for the rest of the day; sabotaged pumps vent thick dark steam and `⊗` fault tags until repaired by a calm hand.

---

## 7. FAILURE

How this design fails if compromised:
- If static background sprouts remain visible inside empty/harvested plots, crop growth loses truth.
- If all plots turn into giant Stage-2 wheat simultaneously, they occlude clones and flatten the spatial distinction between `water rows` (left shoots) and `harvest` (right ripe grain).
- If keyboard guide arcs stay visible during mouse or idle frames, the room reverts to wireframe clutter.
- If sprite loops retain `#d1d1d1` studio grey, characters break lunar lighting immersion.

---

## 8. IMPLEMENTATION

1. **Offscreen Asset Purification (`index.html`)**:
   - Chroma-key neutral studio grey (`sat <= 9`, `195 <= R <= 226`) + edge alpha defringing across `farmer_sprite_2_poses.png` and `crop_tile_3_growth_stages.png` (removing all 12,532 trapped grey loop/fringe pixels).
   - Construct `standEmpty` sprite by cleanly mirroring the unoccluded standing suit hip/thigh (`x=785..955`) over the premature wheat basket, reserving `standBasket` strictly for clones with `carryingWheat === true`.
   - Grade `station_background_one_room.png` on an offscreen canvas: darken high-contrast upper back-wall clutter into deep lunar slate (`#171b1a`–`#272a29`), resurface the isometric soil interior with clean furrowed dark lunar regolith so zero static sprouts double-draw, and cast twin soft volumetric overhead lamp cones matching `f_014.jpg`–`f_033.jpg`.
   - Re-author the `hostile` sprite shader so dark ink outlines (`lum < 58`) and suit shadows remain crisp dark maroon-charcoal with a hot crimson helmet/rim glow (`f_027.jpg`) plus a desaturated restless pacing variant (`f_033.jpg`).
2. **Spatial VOIDBASTARD-TAO Interaction & Juice**:
   - Cut the bottom 6-swatch bar, cut modal `DAY`/`NIGHT` walls in favor of in-room lighting & spatial clone tallying, and hide keyboard targeting arcs unless keyboard aim was used within the last `2.2s`.
   - Add hit-stop/landing squash-and-stretch on clone leaps, diegetic ground progress rings on active stations, click-to-recall (`Stop`) on straining clones, crimson warning arcs when dragging fatigued clones, and responsive WebAudio soil/wrench/harvest/warning synthesis layered with `../assets/bgm_loop.mp3`.
3. **Choreographed Verification (`play.mjs` + `run_pipeline.py --stages verify`)**:
   - Drive real pointer drags and inputs across `14s` so `pair_002.00.jpg`, `pair_005.00.jpg`, and `pair_008.00.jpg` align tightly with `gameplay.mp4` (`t=2s` initial leap arc with `[ ]` tasks unchecked, `t=5s` calm dual work at steaming pump & glowing left shoots, `t=8s` crimson/restless pump refusal `[!]` + `[X] fix pump` + `CLONES 3 · MOOD 2/3` alongside front-right golden wheat harvest).
   - Recorded verification metrics: `playtest/take.mp4` — **`830 frames, 13.8 s, 60.0 fps, 0 console errors`** (`best.mp4`: `3.25 s -> 11.25 s`, score `0.0073`).
