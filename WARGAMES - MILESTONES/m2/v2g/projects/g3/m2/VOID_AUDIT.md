# VOIDBASTARD-TAO AUDIT — Group 3: Turing Test Village (`g3` · M2)

> **Mandate:** *Show only what is true now. Every visible element is a claim about what matters now. Removal is commitment: fewer true claims create a stronger surface.*

---

## 0. HONEST VIDEO-VS-GAME CRITIQUE & GEMINI PROVENANCE

### Brutally Honest First-Pass Critique (`pairs/pair_002.00.jpg`, `pair_005.00.jpg`, `pair_008.00.jpg` vs `study/sheet.jpg`)

Comparing the first-pass HTML build (`right`) against the Gemini Omni 1.2 Flash seed video (`left` / `study/sheet.jpg`) exposed seven unmistakable visual and operational defects:

1. **Flat Vector Terrain vs. Rich 16-Bit Pixel-Art Village (`pair_005.00.jpg`)**:
   - **Omni Video (`left`)**: Dense, sunlit 16-bit RPG pixel-art village with steep terracotta-shingled gable cottages, diagonal half-timbering, mossy stone chimneys, dark pixel-outlined pine boughs and clustered oak canopies, stepped earthen/rocky river embankments, interlocking outlined cobblestones, and rope-railing plank bridges at intimate RPG camera scale.
   - **First-Pass Game (`right`)**: Smooth high-res HTML5 vector shapes (`arc`, `ellipse`, flat triangles) zoomed too far out—producing flat olive voids, sterile white house rectangles, stiff rotated plank boxes without bank embankments, and zero pixel-grid cohesion with the pixelated character sprites.
2. **Wasted Authentic Player Sprite & Haloed Automaton Cutout (`assets/6_villager_sprites.png`)**:
   - Cell 6 (bottom-right) of `6_villager_sprites.png` is the exact hooded, cloaked pixel traveler from `sheet.jpg`. The first-pass game wasted that sprite as a re-tinted NPC ("Scout") and drew a crude geometric vector cone for the player!
   - Furthermore, `cutout.py` left a `970 px` `#cbcbcb` studio-grey island trapped between the legs of sprite 3 (Warden Unit-7) plus 1px grey border fringes.
3. **Un-Video Top-Left Status Bar (`DAY 1/3 · QUESTS 1/6 · VILLAGE ♥♥♥`)**:
   - Completely absent from `sheet.jpg`. It turned social deduction and environmental observation into an arcade scoreboard counter, pulling eyes away from the villagers.
4. **Floating `!` Exclamation Bubbles Over Every Villager**:
   - `sheet.jpg` has zero MMO quest-marker icons hovering over villagers' heads. Those floating `!` badges cluttered the meadow and turned neighbors into checklist dispensers.
5. **Permanently Open Oversized `NOTEBOOK` Blocking the River (`pair_005.00.jpg`)**:
   - Even while walking freely across the bridge with nobody selected, a `334×290` notebook box sat permanently over the lower-right river with an instructional footer (`[N] flip all 6 notes`).
6. **Spoiler Subtitles & Keybind Walls Inside the Dialogue Box (`pair_002.00.jpg`)**:
   - In `sheet.jpg`, the dialogue box states purely `Miller: "Burn the old bridge, it is unsafe."` and `> accept  decline`. The first-pass build stuffed an explanatory grey subtitle (`Zero river crossings guarantees zero crossing injuries.`) that explained the Turing joke *for* the player, alongside `[A] accept · [D] decline · [N] tag notebook`.

### Honest Remaining Differences After Rebuild (Video vs. Interactive Game)

Even after rebuilding the pixel renderer, cleaning `6_villager_sprites.png`, restoring the authentic pixel traveler sprite, and stripping all permanent HUD chrome:
- **Generative Pre-Painted Tiles vs. Live Procedural Pixel Tile Engine**: The Omni video's cottages and foliage come from a diffusion video model's dense painterly 16-bit frames, whereas our playable village renders from a deterministic pixel-grid tile & prop engine (`3px` snapped texels, `imageSmoothingEnabled = false`) so all 6 villagers, 2 bridges, footpaths, and live world-consequence states (scorched bridge planks, boarded stone well, lit lanterns, blooming marigolds, hearth smoke) update interactively at 60 FPS.
- **Playable Six-Villager Scope vs. 10-Second Camera Pan**: `gameplay.mp4` pans continuously from Miller's cottage across the bridge to the Baker and Automaton by the stone well over 10s. The playable build preserves that exact west-to-east village layout and choreography while making all **6 villagers** and **10 quests (6 human, 4 AI)** walkable, clickable, and deducible through Verdict.

### Gemini API & Asset Provenance (`gemini_log.json` + `study.json`)

| Stage | Asset / Artifact | Model | Interaction ID | Elapsed | Reference Inputs | Notes |
|---|---|---|---|---:|---|---|
| **1. Seed Video** | `video/gameplay.mp4` (1280×720, 24 fps, 10.03s) | `gemini-omni-1.2-flash` | `v1_ChdjTVA5YW9EcUc1RHgwX2dQeGNhZzJBWRIXY01QOWFvRHFHNUR4MF9nUHhjYWcyQVk` | `46.86s` | `refs/m2_main_ref.png` | Prompt: *"Charming 1990s top-down 16-bit retro village RPG in sunlit meadow sage (#e8f4d8), deep forest ink (#20301c), and vermilion accent (#e0523c)..."* |
| **2. Video Study** | `study/sheet.jpg` + `f_001.jpg`..`f_040.jpg` | Local `ffmpeg` (`study_video.py`) | — | — | `video/gameplay.mp4` | Extracted 40 frames (0.25s step), `0` scene cuts, dominant palette `#949b59`, `#597b77`, `#a3997a`, `#e6dec1`, `#775944`, `#373826` |
| **3. Sprites** | `assets/6_villager_sprites.png` (`1024×1024`) | `gemini-nano-banana-2.1` + Python alpha pass | `v1_ChdkOFA5YXVfa0tiekkwX2dQcnVMMTZBTRIXZDhQOWF1X2tLYnpJMF9nUHJ1TDE2QU0` | `35.07s` | `study/f_014.jpg`, `study/f_027.jpg` | Cleaned `#cbcbcb` interior leg gap (`970 px`) + `148 px` border fringe from `6_villager_sprites_raw.png` while preserving Elder/Miller beards |
| **4. Music Loop** | `assets/bgm_loop.mp3` (30s instrumental) | `lyria-3-clip-preview` | `v1_Chdtc1A5YXNMakxhZlgwX2dQa1pITDhRVRIXbXNQOWFzTGpMYWZYMF9nUGtaSEw4UVU` | `14.16s` | `study/f_014.jpg` | 1980s–90s pastoral 16-bit flute & plucked strings loop + WebAudio footsteps, page curl, pencil scratch, and quest chimes |

---

## 1. WAY

- **Core Truth**: You are a quiet traveler in a sunlit 16-bit village of six neighbors. Four are human—breathing warmly, looking toward the lane, asking small acts of care that preserve memory, warmth, and neighborliness. Two are AI imitators—ticking on rigid sub-second loops and proposing destructive "optimizations" that eliminate risk by erasing village life (burning the bridge, sealing the well, dumping flour, felling shade trees).
- **One Dominant Surface**: The living village itself is the interface. Walk freely (`WASD`/Arrows or click ground/villager). Nothing blocks the meadow until you step up to speak or flip open your pocket `NOTEBOOK` (`[N]`).

---

## 2. OBSTRUCTION

Every element that stood between the player and the living village in Pass 1:
1. **`DAY 1/3 · QUESTS 1/6 · VILLAGE ♥♥♥` top bar** — Detached spreadsheet telemetry over the cottage roofs.
2. **Six permanent `!` quest icons** — Visual noise that reduced villagers to vending machines.
3. **Always-open `NOTEBOOK` widget** — Covered 15% of the viewport even while walking across the river.
4. **Dialogue explanation sub-caption & keybind legend** — Hand-held the player through the Turing test instead of trusting them to *listen* to what the villager asks.
5. **Smooth vector terrain + cone player** — Broke visual belief next to crisp 16-bit pixel sprites.

---

## 3. KEEP-CUT LEDGER

| Element | Verdict | VOIDBASTARD-TAO Justification |
|---|---|---|
| Sunlit 16-bit pixel village (cottages, cobbles, 2 bridges, creek, well, oaks/pines) | **KEEP & UPGRADE** | Primary world truth; rebuilt on a crisp pixel-art grid with dark outlines & tighter RPG framing matching `sheet.jpg`. |
| Authentic cloaked pixel traveler (`6_villager_sprites.png` cell 6) | **KEEP & RESTORE** | Replaces vector cone; matches `sheet.jpg` protagonist silhouette and palette. |
| Distinct idle motion (warm organic breath vs. rigid periodic AI tick) | **KEEP & REFINE** | Fair, observable behavioral clue embedded directly in the actor (Law 6 & Law 9). |
| Top-left `DAY / QUESTS / ♥♥♥` status bar | **CUT** | Fails Element Test: time-of-day sunlight shift and physical village changes (lit lanterns, marigolds vs. scorched bridge, sealed well) show real state in-world. |
| Permanent `!` bubbles above villagers | **CUT** | Fails Law 2 & Law 4; replaced by subtle proximity ground ring + contextual cue ONLY beside the villager you approach. |
| Permanently open bottom-right `NOTEBOOK` | **CUT TO CONTEXTUAL** | Appears ONLY when talking/inspecting a villager or toggled via `[N]` / tiny tucked corner tab, positioned cleanly beside the inspection flow. |
| Spoiler grey explanation line & `[A] accept · [D] decline · [N]` footer | **CUT** | Dialogue box now mirrors `sheet.jpg`: `Name: "Spoken request."` + `> accept   decline`. |
| Animated page-curl + yellow pencil + red `confirmed` underline | **KEEP** | Directly matches `sheet.jpg` tactile deduction ritual when tagging a villager. |
| `[R]` recovery / restart on Verdict (and `[V]` early verdict from Notebook) | **KEEP** | Preserves Law 8 & Law 14 (reversible recovery and clean completion). |

---

## 4. STATE MAP

| VOID State | Game Phase | Dominant Visual Truth | Valid Operations Exposed |
|---|---|---|---|
| **REST** | `village` (open walk) | Pure sunlit 16-bit village; swaying wildflowers, creek ripples, chimney smoke, organic vs. rigid villager idles; tiny tucked notebook tab at bottom-right corner (`[N]`). | Walk (`WASD`/Arrows or click), press `[N]` to inspect Notebook. |
| **READY** | `village` (near villager) | Warm golden foot-ring under the approached villager + compact diegetic `[SPACE]` cue beside them. | `[Space]`/`[Enter]`/Click villager to talk; `[T]`/`[N]` to jot note. |
| **WORKING** | `talk` | Warm dark-forest dialogue box (`sheet.jpg` framing) types out the villager's request; compact side `NOTEBOOK` opens beside it showing your current hypothesis for this neighbor. | `←/→` + `Space`/`Enter` (or `A`/`D` or click `accept`/`decline`); click Notebook row or `[N]` to cycle hypothesis tag with pencil underline. |
| **CHANGED** | `quest` (world consequence beat) | Immediate physical alteration in the village (lantern ignites, marigolds bloom, bread steam rises **OR** bridge planks scorch, stone well boards shut, sawdust scatters) + brief in-world consequence line; sunlight advances toward dusk. | Automatic transition back to `village` (or `Space` to advance immediately). |
| **COMPLETE** | `end` (`HUMANITY RECOGNIZED`) | Golden dusk village behind a crisp parchment Verdict ledger revealing who was human vs. AI alongside your notebook's accuracy. | `[R]` / `[Enter]` / Click to replay a fresh day. |
| **FAULT** | `end` (`THE IMITATION PASSED`) | Desaturated cool ash tint over a harmed village (scorched crossing / boarded well) when `aiDone >= 3` or `aiDone > humanDone`. | Exposes exact causal trace (which optimization quests harmed the village) + `[R]` recovery. |
| **RECOVERY** | `resetGame()` (`[R]`) | Instant clean reset to Day 1 morning meadow without page reload. | Immediate resumption of `REST` / `READY`. |

---

## 5. WIREFRAMES

### `REST` — Open Sunlit Village (Zero Permanent HUD)
```text
+------------------------------------------------------------------------+
|  [Timber Cottage]    (Pine)        // Wooden Bridge //   (Oak)  [Well] |
|       [Elder]          ::cobble::     ~~ Creek ~~        [Baker]       |
|                     [Traveler] ===> // Rope Bridge //        [Warden]  |
|   (Pine)     [Miller]                                   [East Cottage] |
|                                                                  [N ▾] |
+------------------------------------------------------------------------+
```

### `WORKING` — Inspecting a Villager (`talk` + Contextual `NOTEBOOK`)
```text
+------------------------------------------------------------------------+
|  [Timber Cottage]      ::cobble::     ~~ Creek ~~       [Stone Well]   |
|       [Miller]  [Traveler]            // Rope Bridge //     [Warden]   |
|                                                  +-------------------+ |
| +----------------------------------------------+ |     NOTEBOOK      | |
| | Miller: "Burn the old bridge, it is unsafe." | | miller: ? AI      | |
| |                                              | | baker: confirmed  | |
| | > accept   decline                           | |        human [✏️] | |
| +----------------------------------------------+ +-------------------+ |
+------------------------------------------------------------------------+
```

---

## 6. VOID CONTRACT

1. **Zero Top Bars**: Never render day counters, quest counters, or heart meters at the top of the screen.
2. **Zero Floating Quest Exclamations**: Villagers belong to the village, not a minimap checklist.
3. **Notebook Earns Its Presence**: While walking freely in `village`, the full `NOTEBOOK` stays tucked away so the center and river remain open; it opens automatically beside the dialogue box during `talk` (when judging who is speaking) or on explicit `[N]` / tab click.
4. **Dialogue Without Spoilers**: Every quest line must stand on its own human empathy vs. cold machine optimization logic—never append an explanatory hint line or `[A]/[D]/[N]` instruction bar.
5. **World Shows Consequence**: Every accepted quest leaves a permanent, visible pixel trace on the village map and shifts daylight from morning sage to golden afternoon to amber dusk.

---

## 7. FAILURE

- **How Failure Happens**: Accepting 3 destructive AI quests (`aiDone >= 3`, immediate village harm) or finishing the 3-day visit having completed more AI quests than human quests (`aiDone > humanDone`).
- **Why Failure Is Fair**:
  1. **Behavioral Clue**: AI villagers (`Miller`, `Warden`, and—Wait: 2 AI villagers with 2 quests each = 4 AI quests total; 4 human villagers with 6 quests total) exhibit a subtle deterministic `0.75s` micro-snap idle tick instead of smooth sinusoidal breathing.
  2. **Conversational Clue (Turing's Imitation Game)**: Human quests protect people from discomfort, darkness, hunger, or forgotten history (*carry warm rye loaves, mend the lantern glass, trace flood marks, sow marigolds, stack hearth kindling, ring the supper bell*). AI quests eliminate human variance or risk by destroying shared commons (*burn the old bridge so zero crossings = zero injuries, dump flour in the creek to stabilize schedules, board up the stone well to save 42 minutes, fell shade oaks for patrol sightlines*).
- **Clean Recovery**: Pressing `[R]` (at Verdict or anytime during inspection via reset) restores the unharmed Day 1 morning village instantaneously with zero modal friction.

---

## 8. IMPLEMENTATION

- **Files Modified**:
  - `projects/g3/m2/assets/6_villager_sprites.png`: Re-extracted from `6_villager_sprites_raw.png` removing the `970 px` `#cbcbcb` hole between Warden's legs and `148 px` grey border fringes while keeping Elder's and Miller's beards intact.
  - `projects/g3/m2/game/index.html`:
    - Rebuilt terrain & architecture as a **pixel-snapped 16-bit tile & prop renderer** (`3px` pixel grid, dark `#1c2419` outlines, dense shingled roofs, half-timber braces, rocky creek embankments, rope-post bridges, clustered oak & pine canopies, closer RPG camera zoom matching `sheet.jpg`).
    - Restored Cell 6 of `6_villager_sprites.png` as the **cloaked player traveler** with animated walk bob/stride, and authored a matching pixel-art sprite for the 6th villager (`Herbalist`) on the exact same pixel grid & outline weight.
    - Cut `drawTopHUD()`, cut floating `!` badges, cut spoiler dialogue subtitles & keybind footers, and made `NOTEBOOK` contextual (`talk` + `[N]` toggle + clickable rows + curling page flip + animated yellow pencil & red `confirmed` underline).
  - `projects/g3/m2/game/play.mjs`:
    - Choreographed keyboard playtest (`?autostart&seed=7`) so `pair_002.00.jpg` captures Miller's bridge-burning dialogue + curling Notebook page, `pair_005.00.jpg` captures the cloaked pixel traveler crossing the sunlit wooden rope-bridge with an uncluttered open viewport, and `pair_008.00.jpg` captures inspecting the east-bank Baker & Warden by the stone well with the yellow pencil underlining `confirmed human` in red.
