# VOID_AUDIT — `gsu` (Sushi Cutting · Milestone M2)

**Engine:** VOIDBASTARD-TAO (Operational Emptiness Engine)  
**Scope:** `projects/gsu/m2/`

---

## 0. HONEST VIDEO-VS-GAME CRITIQUE & GEMINI PROVENANCE

### Ruthless Side-by-Side Critique (`pairs/pair_002.00.jpg`, `pair_005.00.jpg`, `pair_008.00.jpg` vs. `study/sheet.jpg`)

Comparing the first-pass HTML build (right halves of `pair_002.00.jpg`, `pair_005.00.jpg`, `pair_008.00.jpg`) against the Gemini Omni 1.2 Flash seed video (`video/gameplay.mp4` / `study/sheet.jpg`, left halves) exposes five severe regressions where invented UI chrome, raw cutout artifacts, and misaligned geometry degraded the clean rhythm-action feel of the video:

1. **Invented Top-Center & Mid-Screen HUD Clutter (Collision Failure in `pair_008`)**  
   - `sheet.jpg` has a completely open upper walnut counter between `SCORE 360 / COMBO x2` (top-left) and `LIVES ***` (top-right).  
   - The old build bolted on a top-center `NYE 11:52:25 PM · 12/31/1999` clock bar AND four boxed `[1] T1 | [2] T2 | [3] T3 | [4] T4` HUD widgets (`y = 36..94`). Worse, in `pair_008.00.jpg`, the floating callout `T2 SERVED! +200` spawned at `y = 118` and drifted straight over the `[2] T2` and `[3] T3` boxes, producing illegible overlapping text.
   - Over the cutting track itself, the old build spammed `HYPER x4! +160` (`pair_002`), `HYPER x8! +200` (`pair_005`), and `6 PCS READY! SERVE TABLE T2 [ENTER / 2]` (`pair_008`), plus `HYPER COMBO x4 / x8 / x12` in yellow at top-left. `sheet.jpg` has **zero** floating combat-text popups over the knife and uses understated `COMBO x2..x5` in warm coral (`#e86a42`) that blooms softly on cut impact (`f_007.jpg`).

2. **Flow-Breaking Manual Table-Serve Interrupt (`state === 'serve'`)**  
   - In `gameplay.mp4` (`sheet.jpg` frames 1–24), gameplay is an unbroken Rhythm-Heaven / Cooking-Mama cutting cadence: maki rolls glide onto the board, the blade slices portions on the beat, and the bottom-right Y2K receipt printer automatically advances paper slips (`ORDER COMPLETE` in frame 23–24).  
   - The old build halted cutting after every single roll to demand a manual `[ENTER / 1..4]` table-routing step (`pair_008`), turning a tactile rhythm cutter into a stop-and-go menu chore.

3. **Muddy Grey-Brown Cutout Spark Blob (`SPR.burstFlash`) vs. Crisp 360° Spark Streaks**  
   - In `pair_002.00.jpg` and `pair_005.00.jpg`, stamping `SPR.burstFlash` (`x:247, y:695, w:148, h:134` from `roll_and_fish_sprites_cut_pieces.png`) placed an opaque, muddy grey-brown splatter halo directly over the maki roll and knife tip. Because the raw sprite was generated with soft semi-transparent orange glow blended onto a `#d8d8d8` light-grey studio backdrop, background keying left dirty neutral-grey semi-opaque fringe pixels (`#8a7e75`) that read like mud against dark walnut wood (`#26150a`).  
   - In `sheet.jpg` (`f_007.jpg`, `f_009.jpg`, `f_014.jpg`, `f_023.jpg`), every clean cut emits **80–140 razor-crisp radial spark streaks** (hot ivory-yellow core `#fff6d6` tapering into glowing coral-orange `#ff6e40`) flying 360° across the entire walnut board, paired with a brief starburst flash at the blade contact point and 4–8 tumbling white sushi rice grains (`f_033.jpg`).

4. **Stretched "Orange Cone" Maki Sprite, Grey Rim Fringe & Wrong Filling Colors**  
   - `SPR.rollA` (`296×86`) in `roll_and_fish_sprites_cut_pieces.png` had an uncut salmon nub protruding from its left end; stretching it horizontally to `880px` (`pair_002`, `pair_005`, `pair_008`) distorted that nub into a bizarre 90-pixel orange cone sticking out of the left side of the roll while smearing the nori grain.  
   - Pixel inspection of `roll_and_fish_sprites_cut_pieces.png` (`1024×1024` RGBA) confirms `499` semi-transparent edge pixels on `sliceFace1` alone with a mean RGB of `[153.3, 152.1, 149.4]` (`#999895` studio-grey fringe visible around the dark `#141d15` nori wrap). Furthermore, every sprite on the sheet is orange salmon, so `pair_005` rendered bright orange salmon medallions even while the active ticket demanded `T2 6 PCS TUNA`.

5. **20px Vertical Track Sag & 34px Printer Paper Misalignment**  
   - Measuring `counter_and_cutting_board.png` (`1376×768` scaled to `1280×720`) places the cream stadium track rails at `y = 344..358` (top rail) and `y = 433..447` (bottom rail), giving an exact vertical track center of **`y = 396`** (`x = 161..1119`, with the 5 painted coral dashed lines at `x = 320, 480, 640, 800, 960`). The old build hardcoded `TRACK.y = 415`, dropping the roll `19px` too low so it hung below the bottom cream rail (`pair_002/005/008`).  
   - Similarly, the baked receipt paper on `counter_and_cutting_board.png` spans `y = 488..720` (`x = 1016..1228`, slot crease at `y = 605`), whereas the old `drawTicketPrinter()` drew paper starting at `y = 452` (`36px` too high).

---

### Full Gemini Generation Provenance (Zero Credentials)

All provenance verified directly from `video/gemini_log.json`, `assets/gemini_log.json`, and `spec.json`:

| Artifact | Model | Timestamp (UTC) | `interaction_id` | Elapsed | Reference Inputs | Notes & Cutout Audit |
| :--- | :--- | :--- | :--- | :---: | :--- | :--- |
| **Seed Gameplay Video**<br>`video/gameplay.mp4`<br>(`1280×720`, `24.0 fps`, `10.027s`) | `gemini-omni-1.2-flash` | `2026-11-18T15:25:25Z` | `v1_ChZZY1A5YXZpMU1NM2YwX2dQMC1ET2FBEhZZY1A5YXZpMU1NM2YwX2dQMC1ET2FB` | `44.5s` | `refs/m2_main_ref.png` | `previous_interaction_id: null`. Continuous overhead walnut counter shot establishing the exact 4-element HUD, stadium track, santoku chop, face-up salmon medallions, 360° coral sparks, and Y2K thermal printer. |
| **Counter & Cutting Board**<br>`assets/counter_and_cutting_board.png`<br>(`1376×768`, `cutout: false`) | `gemini-nano-banana-2.1` | `2026-11-18T15:25:46Z` | `v1_ChZac1A5YXU2Sk92dVB5dE1QbnBPSkVBEhZac1A5YXU2Sk92dVB5dE1QbnBPSkVB` | `19.39s` | `study/f_014.jpg`,<br>`study/f_027.jpg` | Warm walnut grain, stadium track, and 3D charcoal receipt printer match `gameplay.mp4` closely. Baked faint dot-matrix marks on the printer slip (`y=488..605`) and fixed 5-line dashes are cleanly resurfaced in Canvas so 5-line (`6 PCS`) and 7-line (`8 PCS`) guides render without ghosting. |
| **Roll, Fish & Cut Pieces Sheet**<br>`assets/roll_and_fish_sprites_cut_pieces.png` + `_raw.png`<br>(`1024×1024`, `cutout: true`) | `gemini-nano-banana-2.1` | `2026-11-18T15:26:03Z` | `v1_Chdlc1A5YXU2NUVzRzJ1TVlQaUt2THFRVRIXZXNQOWF1NjVFc0cydU1ZUGlLdkxxUVU` | `17.21s` | `study/f_014.jpg`,<br>`study/f_027.jpg` | Isolated from `#d8d8d8` studio grey. **Cutout Audit:** REJECT `SPR.burstFlash` / `SPR.burstRing` (severe `#8a7e75` muddy halo), REJECT stretched `SPR.rollA/B` (left salmon cone distortion + salmon-only color), REJECT grey-fringed outer rims (`#999895` semi-transparent edge pixels). Replace with crisp procedural embossed-nori cylinders, marbled Salmon/Tuna/Avocado medallions, gleaming metallic `santoku` geometry, and additive vector sparks. |
| **Instrumental BGM Loop**<br>`assets/bgm_loop.mp3`<br>(`30s` loop) | `lyria-3-clip-preview` | `2026-11-18T15:26:14Z` | `v1_ChZpOFA5YXJEbkhaR3Z4ZElQbzZmX0NBEhZpOFA5YXJEbkhaR3Z4ZElQbzZmX0NB` | `11.11s` | `study/f_014.jpg` | Cohesive late-90s instrumental kitchen groove; paired with procedural WebAudio wet-slice, walnut board *thock*, harmonic combo ping, and stepper-motor receipt feed/tear SFX. |

**Exact Prompts Logged:**
- **`gameplay.mp4` (`gemini-omni-1.2-flash`):**  
  > *"Late-1990s Y2K arcade kitchen rhythm-action game in rich dark wood (#1b1410), warm rice cream (#f5e9d6), and punchy salmon-coral (#ff6b4a). Steady angled overhead counter camera. Fresh salmon maki rolls glide along a wooden board under glowing dashed cut guides; a gleaming chef's knife slices down on the beat into eight even pieces with joyful coral combo sparks while a dot-matrix ticket printer in the corner spits out glitching paper slips. Continuous unbroken gameplay shot, no scene cuts, no gibberish text. Use the reference image for cutting board, knife, and ticket composition. Sound design: upbeat 90s breakbeat groove, crisp rhythmic knife chops, dot-matrix printer buzz. No dialogue."*
- **`counter_and_cutting_board.png` (`gemini-nano-banana-2.1`):**  
  > *"Clean 2D/2.5D game environment asset for \"Sushi Cutting\": Counter and cutting board. strictly harmonized palette (#1b1410, #f5e9d6, accent #ff6b4a), style: Late-90s kitchen, warm counter, a dot-matrix ticket printer that glitches.. No UI text, no characters baked in, crisp game-ready art matching the reference gameplay frame."*
- **`roll_and_fish_sprites_cut_pieces.png` (`gemini-nano-banana-2.1`):**  
  > *"Isolated 2D game sprite sheet / prop for \"Sushi Cutting\": Roll and fish sprites + cut pieces. Centered full silhouette, isolated on a flat uniform light grey studio background (#d8d8d8), even lighting, zero drop shadow, no text, strictly harmonized palette (#1b1410, #f5e9d6, accent #ff6b4a), style: Late-90s kitchen, warm counter, a dot-matrix ticket printer that glitches., matching the reference gameplay frame."*
- **`bgm_loop.mp3` (`lyria-3-clip-preview`):**  
  > *"Instrumental 30-second loopable game soundtrack for \"Sushi Cutting\" (A system you trust starts lying; your own measure (the even cut) is what still holds.). Visual mood: Late-90s kitchen, warm counter, a dot-matrix ticket printer that glitches.. Purely instrumental, cohesive game loop, no vocals."*

---

## 1. WAY

One station, one gleaming knife, one unbroken rhythm: as roasted-nori maki rolls glide along the cream stadium track on New Year's Eve 1999, the player slices down on each coral dashed guide line (`Space` or Click, with optional mouse / arrow micro-aim) while the Y2K thermal receipt printer automatically feeds and tears glitching `01/01/1900` order slips in the corner.

---

## 2. OBSTRUCTION

Detached restaurant-management chrome (`[1] T1 .. [4] T4` boxes, top-center NYE clock bar, floating `HYPER x8! +200` / `SERVE TABLE` banners, and a mandatory post-roll `[ENTER / 2]` serving pause) plus muddy `#d8d8d8`-keyed sprite halos stood between the player's eye and the physical point of contact where steel meets nori on wood.

---

## 3. KEEP-CUT LEDGER

| Element / Mechanic | Verdict | VOIDBASTARD-TAO Justification (Element Test) |
| :--- | :---: | :--- |
| Top-center `NYE 11:52:25 PM` clock bar | **CUT** | Fails Law 2 & video truth (`sheet.jpg` has open dark wood top-center). Y2K date corruption (`01/01/1900` vs `12/31/1999`) lives diegetically on the physical receipt slips. |
| Top 4-box `[1] T1 .. [4] T4` badge strip | **CUT** | Detached dashboard chrome absent from `sheet.jpg`; caused text collision in `pair_008`. Table numbers (`T4`, `T2`, `T3`) belong on the thermal tickets. |
| Manual `SERVE TABLE [ENTER / 1..4]` phase | **CUT** | Violates Law 3 & breaks Rhythm-Heaven cutting flow. Completing the final cut on a roll automatically sweeps the plated medallions off-board and triggers the receipt printer feed/tear. |
| Floating `HYPER x4! +160` / `EVEN CUT` text & `HYPER COMBO` label | **CUT** | Violates Law 6 ("Show changed conditions in the world, not generic success banners"). Replaced by physical medallion separation, face-up salmon/tuna/avocado pop, 360° spark shower, and subtle coral bloom on `COMBO xN`. |
| `HOW TO PLAY [H]` 3-line paragraph box | **CUT** | Fails Law 1 & Law 5; `SPACE = CUT` + coral guide lines + approaching roll are 100% self-evident. |
| `SPR.burstFlash` / `SPR.rollA` cutout stamps | **CUT** | Eliminate `#8a7e75` muddy halo blob and stretched left-end orange cone. |
| `counter_and_cutting_board.png` walnut counter | **KEEP** | Anchors warm late-90s sushi bar lighting, stadium track (`y=396`), and 3D receipt printer body. |
| Top-left `SCORE` + `COMBO xN` & Top-right `LIVES ***` | **KEEP** | Exact arcade truth shown in every frame of `sheet.jpg`; exposes streak state and remaining fault margin (`***`). |
| Bottom-center `SPACE = CUT` (`[R] = RETRY` on fault/end) | **KEEP** | Single valid action prompt (`sheet.jpg`), switching to recovery `[R]` only when valid (Law 4 & Law 8). |
| Diegetic Y2K Thermal Receipt Printer (`T4 8 PCS SALMON / 01/01/1900`) | **KEEP** | Spatial order queue + Y2K `1900` glitch trace + automatic paper-feed/tear completion trace (Law 9). |
| Embossed Nori Roll, Face-Up Medallions, Gleaming `Santoku` & 360° Sparks | **KEEP / UPGRADE** | Core physical truth of every cut: `35ms` hit-stop, cylinder separation (`5–8px`), periodic face-up marbled fish medallions, `80–140` hot-core radial sparks, and bouncing sushi rice grains. |

---

## 4. STATE MAP

| VOID State | Internal Mode | Dominant Purpose | Valid Player Action | World / Diegetic Feedback |
| :--- | :--- | :--- | :--- | :--- |
| **`REST`** | `title` | Quiet pre-shift counter before opening (`?autostart` bypasses straight to `READY`). | Click `START` or press `Space` / `Enter` | Dimmed walnut board, `SUSHI CUTTING`, `11:52 PM · 12/31/1999`, single `START` frame (`m2_title_ref.png`). |
| **`READY`** | `ready` | Fresh maki roll glides into the cream stadium track; active ticket extruded on printer; knife poised over Guide #1. | `Space` / Click (or wait a beat as conveyor engages) | Coral dashed guide lines (`5` for `6 PCS`, `7` for `8 PCS`) settle; active guide gently pulses under gleaming `santoku` blade. |
| **`WORKING`** | `cut` | Continuous conveyor-rhythm slicing across the roll's portion seams. | `Space` / Click to slice; optional Mouse X / `ArrowLeft` / `ArrowRight` micro-aim; `P` pause | Roll glides smoothly left-to-right (`y=396`); knife tracks active guide line and plunges edge-on through the roll on input. |
| **`CHANGED`** | `cut` *(hit-stop + slice impulse)* | Report exact physical consequence of the cut in the world. | Next rhythmic `Space` / Click | `35ms` hit-stop; sliced cylinder separates (`+10px` gap); every 2nd cut tips face-up showing marbled salmon/tuna/avocado & rice; `95–135` 360° ivory-to-coral spark streaks + blade starburst + bouncing rice grains; `COMBO xN` blooms coral; on final cut, `ORDER COMPLETE` stamps and printer tears/feeds next slip. |
| **`COMPLETE`** | `mid` | Midnight (`12:00 AM`) shift conclusion; printer either recovers (`01/01/2000`) or stays locked in `01/01/1900`. | `R` / `Enter` / Click to start a new shift | Clean thermal-receipt tally slip over counter (`SCORE`, `PLATES`, `EVEN CUT %`); `SPACE = CUT` replaced by `[R] = COOK AGAIN`. |
| **`FAULT`** | `closed` *(or single-life fault)* | Whiffing off-roll or letting an uncut roll pass costs `*` life; losing all `***` shutters kitchen early. | `R` / `Enter` / Click to retry | Blade clank / red guide flash decrements `LIVES ***`; at `0` lives, quiet `CLOSED EARLY` receipt slip exposes `[R] = RETRY`. |
| **`RECOVERY`** | `initShift()` | Instant zero-friction reset from `FAULT` or `COMPLETE` back to a clean board. | Triggered by `R` | Clears particles, restores `LIVES ***`, feeds fresh ticket #1, glides new maki roll onto track. |

---

## 5. WIREFRAMES

### Active Gameplay (`WORKING` / `CHANGED` — Matches `sheet.jpg` 1:1)
```text
+------------------------------------------------------------------------------+
|  SCORE 360                                       || handle     LIVES ***     |
|  COMBO x2                                       _||_ bolster                 |
|                                                |    | gleaming               |
|                                                |   /  santoku                |
|                                                |  /   blade                  |
|                 :         :         :          | /        :                  |
|        .--------+---------+---------+----------+/---------+--------.         |
|       (  [======NORI=LOG==] [==] [==] (SALMON) |  [==]             )         |
|        '--------+---------+---------+----------+----------+--------'         |
|                 :         :         :    * * * : *        :                  |
|  ==========================================================================  |
|                                                         +-----------------+  |
|                                                         | T4 8 PCS SALMON |  |
|                                                         | 01/01/1900      |  |
|                                                         | --------------- |  |
|                             SPACE = CUT                 | T2 6 PCS TUNA   |  |
|                                                         | 12/31/1999      |  |
+------------------------------------------------------------------------------+
```

### Fault / Midnight Receipt (`FAULT` / `COMPLETE` -> `RECOVERY`)
```text
+------------------------------------------------------------------------------+
|  SCORE 680                                                     LIVES ···     |
|                                                                              |
|                        +----------------------------+                        |
|                        |   CLOSED EARLY · 01/01/1900|                        |
|                        |   ------------------------ |                        |
|                        |   PLATES COMPLETED      4  |                        |
|                        |   EVEN CUT ACCURACY   88%  |                        |
|                        |   BEST STREAK          x6  |                        |
|                        +----------------------------+                        |
|                                                                              |
|                             [R] = RETRY SHIFT                                |
+------------------------------------------------------------------------------+
```

---

## 6. VOID CONTRACT

1. **Zero Top-Center or Floating Text Noise:** Never render top-center clock bars, `[1]..[4]` table boxes, `HYPER COMBO`, or floating `+160` / `SERVE TABLE` strings over the board.
2. **Exact 4-Anchor Diegetic Surface:** Only `SCORE` + `COMBO xN` (top-left), `LIVES ***` (top-right), `SPACE = CUT` / `[R] = RETRY` (bottom-center), and the physical bottom-right thermal receipt printer (`y = 486..720`) occupy the perimeter; the walnut cutting board (`y = 396`) owns the center.
3. **Zero Sprite Cutout Halos:** All sparks, starbursts, maki cylinders, marbled cross-sections, and the `santoku` blade render without `#d8d8d8`/`#999895` matte contamination.
4. **Unbroken Rhythm Loop:** Completing the final cut of a roll automatically sweeps the finished medallions off-board, zips/tears the thermal receipt slip, and feeds the next maki roll onto the stadium track.
5. **Deterministic Telemetry & Harness Parity:** Preserve `<link rel="icon" href="data:,">`, `?autostart`, `?seed=N`, `../assets/bgm_loop.mp3` + WebAudio SFX, and `window.__game.state` so `record_play.mjs` (`14s` capture after `2.5s` settle + center click) hits crisp cuts across `t = 2.0s`, `5.0s`, and `8.0s` at ~60fps with `0` console errors.

---

## 7. FAILURE

The rebuild fails if:
- Any muddy grey-brown cutout blob appears around the blade or sparks;
- Any top-center table box, clock bar, or floating score text clutters the walnut counter;
- The maki roll sags outside the cream stadium rails (`y = 344..447`, center `396`) or shows a stretched orange cone on its left end;
- Gameplay stalls waiting for a manual table-serve key instead of advancing the thermal printer automatically;
- `pairs/pair_002.00.jpg`, `pair_005.00.jpg`, or `pair_008.00.jpg` fail to show clean maki separation, face-up marbled slices, gleaming knife motion, and 360° hot-core coral sparks with `0` console errors.

---

## 8. IMPLEMENTATION

1. **Clean Board Resurfacing (`cleanBoardCanvas`):** Load `../assets/counter_and_cutting_board.png` onto an offscreen `1280×720` buffer, seamlessly clone adjacent walnut/cream strips over the 5 static baked vertical dashes (`[320, 480, 640, 800, 960]`), and render crisp `#e86a42` dashed slice guides spaced evenly for the active ticket (`5` guides at `155px` spacing `[300..920]` for `6 PCS`, `7` guides at `112px` spacing `[268..940]` for `8 PCS`, keeping the blade bolster clear of `LIVES ***`).
2. **Embossed Roasted-Nori Maki & Marbled Medallions:** Generate an offscreen `256×180` crinkled roasted-nori texture (`#141c14` with blistered `yakinori` specular facets and `makisu` ribs). Render the uncut cylinder centered at `y = 396` (`height = 90px`), separated cylindrical slices (`9–12px` gap with left-face rice/fish crescents), and spring-tilted face-up rounded-squircle medallions (`SALMON` with white fat striations, ruby `TUNA`, emerald-lime `AVOCADO`) hugged by packed individual pearlescent sushi rice grains.
3. **Perspective-Chopping `Santoku` Knife:** Render a gleaming studio-lit Japanese chef's knife descending from top-of-frame that tracks the active coral guide line (with optional mouse / `ArrowLeft` / `ArrowRight` micro-aim), smoothly rotating from broadside satin steel while raised (`f_001`, `f_021`) into an edge-on razor slice + vertical steel-gleam streak on impact (`f_007`, `f_009`) with a `35ms` hit-stop.
4. **Additive 360° Spark Streaks + Bouncing Rice + WebAudio:** Emit `105–140` additive hot-core (`#fff6d6` -> `#ff6e40`) radial spark capsules across `360°`, an impact starburst under the blade edge, and `6–9` bouncing white rice grains, synchronized with layered WebAudio wet-slice + wood *thock* + combo harmonic ping + receipt stepper-zip/tear over `../assets/bgm_loop.mp3`.
5. **Conveyor Kinematics, Verification & Honest Remaining Differences:** `playtest/take.mp4` verified at **`829 frames, 13.8 s, 60.0 fps, 0 console errors`** across `pairs/pair_002.00.jpg`, `pair_005.00.jpg`, and `pair_008.00.jpg`. Honest remaining difference vs. `gameplay.mp4`: the Omni seed video renders per-frame 3D neural specular deformation on soft rice/nori across a single 10-second Salmon take, whereas our real-time 60fps Canvas build uses procedural embossed-nori cylinders and vector-marbled cross-sections to support interactive multi-order Salmon/Tuna/Avocado gameplay, variable timing accuracy, fault/lives states, and automatic receipt-printer advancement.
