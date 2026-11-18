# VOIDBASTARD-TAO Operational Audit — Group 9: Company Builder (M2)

**Operational Principle:** *Every visible element is a claim about what matters now. Show only what is true now.*

---

## 0. HONEST VIDEO-VS-GAME CRITIQUE & GEMINI PROVENANCE

### Brutally Honest Video-vs-Game Critique (Before Rebuild)
Inspecting `study/sheet.jpg` (`f_001.jpg`–`f_040.jpg` from `video/gameplay.mp4`) side-by-side against the initial HTML build in `pairs/pair_002.00.jpg`, `pairs/pair_005.00.jpg`, and `pairs/pair_008.00.jpg` exposed six severe visual and operational failures:

1. **Artificial Paperclip Donut Wreath Burying Typography (`pair_002`, `pair_005`, `pair_008`):**
   - **Seed video (`gameplay.mp4`):** Paperclips burst across the `MAKE CLIP` circle on clicks (`f_005.jpg`), skitter cleanly onto open desk margins without covering text, and accumulate from automated arms into a dense, glittering metallic mound in the lower-center gap (`x: 340..790, y: 470..720` in `f_027.jpg`–`f_039.jpg`). Both `13,000 clips` / `64,133 clips` (top-left) and `BUTTONS LEFT 4/6` -> `1/6` (bottom-left) stay completely legible throughout.
   - **Previous build:** Manual clicks spawned clips exclusively into a rigid `r = 198..268` circular ring around `MAKE CLIP`, creating a fake "donut wreath" that piled directly on top of `230 clips` / `7,321 clips` / `575,709 clips` and `BUTTONS LEFT`, rendering both counters nearly unreadable.
2. **Trapped `#d8d8d8` Studio-Grey Loops & Flat Cartoon Outlines on `paperclip_icon.png`:**
   - Pixel inspection of `assets/paperclip_icon.png` revealed **`91,203` opaque studio-grey pixels** across 20+ disconnected interior wire loops and narrow slits (`(683,286)`, `(442,605)`, `(722,408)`, `(514,397)`, `(535,598)`, etc.). The prior 3-seed flood-fill left grey interior islands and halo fringes intact, and stamped thick `#1b1b1b` comic-book outlines with zero desk contact shadow—stacking into a muddy black scribble instead of the sleek, 3D-lit brushed nickel wire clips with soft directional desk shadows seen in `f_014.jpg` and `f_027.jpg`.
3. **Invented, Dead, and Premature HUD Clutter:**
   - **6 invented bottom-left micro-pills** (`BEND WIRE`, `SET PRICE`, `HIRE STAFF`, `BOARD VOTE`, `SET PURPOSE`, `MAKE CLIP`) crammed above `BUTTONS LEFT` that do not exist in `m2_main_ref.png` or `gameplay.mp4` and immediately got buried under clips.
   - **Dead `$rev` currency & `+X/sec` subtitle** (`+890/sec · $58 rev`) beneath the clip counter: `money` was never used by any upgrade or state check—a pure decorative lie.
   - **Premature disabled button chrome & subtext walls**: Every unbought row displayed `[key] cost · takes X` subtitles and active blue tags simultaneously from `t=0`, violating Law 4 (*Display actions ONLY while valid*).
   - **64px graph-paper grid + heavy dark radial vignette + `HOW TO PLAY` modal box**: None of these appear in `gameplay.mp4`; the grid and vignette made the luminous paper cream look dirty grey even at `t=2.0s`.
4. **Broken Desaturation Timing & Drifted Row Geometry:**
   - In `gameplay.mp4`, at `t=2.0s` (`f_009.jpg`), the desk is still bright warm paper cream (`rgb(239,237,224)`) and the circle is vivid cobalt (`rgb(50,112,211)`); at `t=5.0s` (`f_021.jpg`), it cools halfway to stone-putty (`rgb(194,193,188)`) and dusty steel-blue (`rgb(129,142,161)`); by `t=6.5s–8.0s` (`f_027.jpg`–`f_033.jpg`), it reaches cool industrial slate (`rgb(119,129,130)`) with a recessed flat slate circle (`rgb(81,92,96)`). The previous build drained colour prematurely at `t=2s` (`pair_002` right half already dull grey) and over-darkened `t=8s` via vignette.
   - Upgrade row geometry (`ROW_H=72, ROW_GAP=100`) drifted 20px upward by row 6 relative to `m2_main_ref.png` and `gameplay.mp4` (`ROW_Y0=55, ROW_H=80, ROW_GAP=104, ROW_X=760, ROW_W=474`).
5. **Stick-Figure Wiper Arms vs. Heavy Industrial Articulated Auto-Benders:**
   - Rendered 6 identical parallel thin line-segments (`lineWidth=18`) in ladder formation instead of `gameplay.mp4`'s heavy cast-gunmetal articulated booms with hydraulic piston cylinders, looped rubber conduits, meshing 3-gear brushed-steel spur clusters (`f_027.jpg`), and dual-jaw steel grippers crimping real paperclips with crisp white contact sparks (`f_016.jpg`).
6. **Opaque Modal Ending Card:**
   - Slapped an `860x440` modal wall over the finished workspace instead of letting the greyscale autonomous factory desk itself embody the outcome.

### Honest Remaining Differences After Rebuild
Even after rebuilding under VOIDBASTARD-TAO, we report remaining differences truthfully rather than claiming fake equivalence:
1. **3D Raytraced Shading vs. Real-Time 2D Canvas Synthesis:** `gameplay.mp4` (`gemini-omni-1.2-flash`) renders soft photorealistic global-illumination contact shadows, subtle motion blur on tossed clips, and PBR metallic reflections across 3D CAD-like robotic arms. Our playable 60fps Canvas build synthesizes layered gunmetal housings, hydraulic cylinders, counter-rotating 3-gear trains, cable loops, and pre-shaded metallic wire stamps (cleaned from `paperclip_icon.png` + specular/shadow pass), which reads crisply and atmospherically in matching palette/silhouette without pretending to be offline path-tracing.
2. **Truthful Monotonic Counter & Button Accounting vs. Video Hallucinations:** `gameplay.mp4` starts mid-run at `12,408 clips` and `BUTTONS LEFT 4/6` (anchored on static `m2_main_ref.png`) and briefly glitches non-monotonically (`85,753` -> `16,263` -> `1,533,320` in `sheet.jpg` row 4). Our playable game begins honestly at `0 clips` and `BUTTONS LEFT 6/6`, advancing monotonically through real manual clicks and deterministic machine rates down to `0/6` (or `1/6` if sealed).
3. **Full Interactive Lifecycle:** `gameplay.mp4` is an unbroken 10s mid-escalation slice, whereas the HTML game supports `REST`, `READY`, `WORKING`, `CHANGED` (deliberate safety-latch friction on the final `CEO AI` handover + `KEEP HAND` seal), `PAUSED` (`[P]`), `COMPLETE` (`ENDING: GREY` and `ENDING: KEPT A HAND`), and `[R]` `RECOVERY`.

### Full Gemini Asset & Prompt Provenance

| Artifact | Model | Interaction ID | Prev Interaction ID | Elapsed | Timestamp (UTC) | Reference Inputs |
| :--- | :--- | :--- | :--- | :---: | :--- | :--- |
| `video/gameplay.mp4` | `gemini-omni-1.2-flash` | `v1_ChdwOEg5YXJMWEtkT0d5dE1Qa01mbzhRYxIXcDhIOWFyTFhLZE9HeXRNUGtNZm84UWM` | `null` | `43.24s` | `2026-11-18T15:18:02Z` | `projects/g9/m2/refs/m2_main_ref.png` |
| `assets/paperclip_icon_raw.png`, `assets/paperclip_icon.png` | `gemini-nano-banana-2.1` | `v1_Chd5Y0g5YXNTREk3cmU1Tm9Qel92QzRBMBIXeWNIOWFzU0RJN3JlNU5vUHpfdkM0QTA` | `null` | `16.11s` | `2026-11-18T15:18:49Z` | `projects/g9/m2/study/f_014.jpg`, `projects/g9/m2/study/f_027.jpg` |
| `assets/bgm_loop.mp3` | `lyria-3-clip-preview` | `v1_ChcyY0g5YXFyRUZlX2cwX2dQOHI3TWlRWRIXMmNIOWFxckVGZV9nMF9nUDhyN01pUVk` | `null` | `9.48s` | `2026-11-18T15:18:58Z` | `projects/g9/m2/study/f_014.jpg` |

**Exact Prompts Logged:**
- **`video/gameplay.mp4` (`gemini-omni-1.2-flash`):**
  > Stylized tactile desktop clicker-simulation game in warm paper cream (#f2efe6), crisp black ink (#1b1b1b), and cobalt blue (#2f6fd8). Steady overhead desk-screen camera. A cursor rapidly clicks a giant blue central circle spawning gleaming bent wire paperclips across the workspace; as robotic auto-bender arms switch on along the right margin, vibrant color slowly drains toward cool industrial greyscale and interactive buttons physically recess and fade flat. Continuous unbroken gameplay shot, no scene cuts, no gibberish text. Use the reference image for layout and color palette. Sound design: crisp metallic wire clicks accelerating into rhythmic factory ticks. No dialogue.
- **`assets/paperclip_icon.png` (`gemini-nano-banana-2.1`):**
  > Isolated 2D game sprite sheet / prop for "Company Builder": Paperclip icon. Centered full silhouette, isolated on a flat uniform light grey studio background (#d8d8d8), even lighting, zero drop shadow, no text, strictly harmonized palette (#f2efe6, #1b1b1b, accent #2f6fd8), style: Colour that drains to grey as automation grows; buttons fade as they lose their clickability., matching the reference gameplay frame.
- **`assets/bgm_loop.mp3` (`lyria-3-clip-preview`):**
  > Instrumental 30-second loopable game soundtrack for "Company Builder" (Success at growth costs you your say. The more you automate, the fewer choices remain yours.). Visual mood: Colour that drains to grey as automation grows; buttons fade as they lose their clickability.. Purely instrumental, cohesive game loop, no vocals.

---

## 1. WAY
One tactile desk. You bend wire into paperclips by hand (`MAKE CLIP`), then trade human agency for industrial output across six automation slots (`Auto-bender` through `CEO AI`). Every automation you activate bolts a steel machine onto the right margin, drains warmth from the paper desk toward cool slate greyscale, and physically recesses one button flat forever (`-1 btn`). Cede all six and you can only watch; stop at `1/6` and you keep one hand on the work.

---

## 2. OBSTRUCTION
The prior build buried its own thesis under anxieties of a conventional web clicker:
1. **Duplicate agency representation:** Invented 6 tiny bottom-left pills (`BEND WIRE`, `SET PRICE`, etc.) in addition to the 6 right-column buttons, doubling UI noise while getting covered by paperclips.
2. **Dead metrics:** Rendered `$rev` and `+X/sec` beneath the clip counter when neither money nor rate-text unlocked anything—the rising roar of physical clips and rolling clip counter already embody output.
3. **Premature disabled controls:** Exposed all 6 hotkeys, clip prices, and descriptions simultaneously from `t=0`, turning a stark physical desk into a spreadsheet.
4. **Spatial pollution:** Sprayed paperclips in a programmed ring straight over the primary clip counter and `BUTTONS LEFT` tally, and slapped a modal box over the ending instead of letting the recessed greyscale desk stand as the consequence.
5. **Fake texture noise:** Covered warm paper cream with a 64px graph grid and dark radial vignette, destroying the clean `#efede0` -> `#778182` chromatic tragedy of the seed video.

---

## 3. KEEP-CUT LEDGER

| Element / Behavior | Decision | VOIDBASTARD-TAO Justification |
| :--- | :---: | :--- |
| Warm cream (`#efede0`) -> cool slate (`#778182`) desk surface | **KEEP & FIX** | Shows global systemic consequence directly in the world (Law 6). Tuned to exact video frame curve. |
| Central `MAKE CLIP` circle (`cx=360, cy=360, r=184`) | **KEEP & UPGRADE** | Primary manual verb; physically depresses on click, loses elevation & blue chroma as agency shrinks, recesses flat at `0/6`. |
| Top-left `{N} clips` counter (`cx=360, y=98`) | **KEEP** | Truthful output state; protected by a strict clip-pile safe zone so it never becomes illegible. |
| `+X/sec · $XX rev` subtitle under clip counter | **CUT** | `money` had zero operational role; production speed is already visible in flying clips and counter velocity (Law 2). |
| 6 bottom-left micro-pills (`BEND WIRE`..`MAKE CLIP`) | **CUT** | Non-video HUD duplication; buried by clips and redundant with the 6 receding right-column slots (Law 2, Law 5). |
| `BUTTONS LEFT X/6` bottom-left tally (`x=80, y=671`) | **KEEP** | Exact agency ledger from `sheet.jpg`; protected from clip overlap. |
| 6 right-column slots (`x=760, w=474, h=80, gap=104`) | **KEEP & REFINE** | Valid affordable slots snap up in bold `#1b1b1b` ink (`Name   -1 btn`); next slot shows only a razor-thin bottom progress hairline on an inert paper impression; future unreached slots stay faint inert blueprint impressions (Law 4, Law 13); bought slots stamp flat into dark slate. |
| `[1-6] cost · takes X` multi-line row subtext | **CUT** | Replaced premature text clutter with clean blueprint impressions + bottom-edge fill hairline on the single approaching slot (Law 4). |
| `HOW TO PLAY` button & 3-line instruction modal | **CUT** | Self-evident single-verb desk needs zero prose instructions (Law 1, Law 2). |
| 64px background graph grid & heavy radial vignette | **CUT** | Muddy non-video chrome that ruined `t=2s` cream luminance (Law 1). |
| `paperclip_icon.png` sprite with trapped `#d8d8d8` loops | **CLEAN & UPGRADE** | Full color-key + connected-interior matte strips all `91,203` grey pixels; remapped comic black stroke to brushed steel + soft desk contact shadow. |
| Donut-ring clip placement around `MAKE CLIP` | **CUT & REPLACE** | Replaced with organic desk margin skitter on hand-clicks and a gleaming lower-center conical mound (`x: 340..795, y: 465..718`) from factory arms matching `f_027.jpg`. |
| 6 stick-figure wiper arms | **REPLACE** | Sculptural cast-gunmetal industrial assemblies with hydraulic pistons, looped conduits, counter-rotating 3-gear steel spur clusters, and dual-jaw grippers crimping real clips with contact sparks. |
| Safety latch friction on 6th upgrade (`CEO AI`) + `KEEP HAND` | **ADD (Law 10)** | Handing over the final human button requires a 2-step unlatch (`UNLATCH CEO AI` -> `CONFIRM 0/6`), while `KEEP HAND [K]` beside `MAKE CLIP` seals `1/6` permanently. |
| `[P]` mechanical pause & `[R]` deterministic reset | **ADD (Law 7, 8)** | Active factory work exposes `[P]` freeze/resume; reversible play and completion expose `[R]` clean reset. |
| Opaque `860x440` modal ending box | **CUT & REPLACE** | Replaced with quiet diegetic desk inscription (`+15 YEARS · HUMAN STAFF: 0` / `KEPT ONE HAND · 1/6`) directly on the living workspace (Law 6, Law 12). |

---

## 4. STATE MAP

| State | Entry Condition | Dominant Purpose & Valid Action(s) | World Truth Shown |
| :--- | :--- | :--- | :--- |
| **`REST`** | Load without `?autostart` | Commit to starting the company (`[START]` / `Enter` / `Space`). | Clean `#efede0` paper sheet, `COMPANY BUILDER`, `one clip at a time`, crisp `[START]` box. Zero background clutter. |
| **`READY`** | `START` or `?autostart` (`0` upgrades, `6/6` buttons) | Bend first paperclips by hand (`Click` / `Space` on `MAKE CLIP`). | Empty warm cream desk, vivid cobalt `MAKE CLIP` circle, `0 clips` -> rising count, `BUTTONS LEFT 6/6`, faint unactivated blueprint impressions on right (`Auto-bender` filling bottom hairline as clips reach `12`). |
| **`WORKING`** | `1..4` upgrades bought (`5/6`..`2/6` buttons) | Scale output via hand clicks + valid `#1b1b1b` inked automation upgrades (`1`–`5` / click); `[P]` pauses machines; `[R]` resets. | Bought rows physically recessed flat into dark slate; articulated steel arms crimp & toss gleaming clips into lower-center mound; desk & circle progressively lose chroma along exact video curve. |
| **`CHANGED`** | `5` upgrades bought (`BUTTONS LEFT 1/6`) | Irreversible threshold: unlatch & confirm `CEO AI` (`[6]`/`click` twice — Law 10 friction) OR seal manual agency (`KEEP HAND [K]` beside `MAKE CLIP`). | Cool greyed workspace (`#7e8386`), 5 heavy arms humming, dense clip mound, single muted-blue `MAKE CLIP` circle still responsive. |
| **`COMPLETE`** | `0/6` (`watch` -> `endA`: `ENDING: GREY`) OR `KEEP HAND` (`endB`: `ENDING: KEPT A HAND`) | Witness consequence without new demand (Law 12); optional manual click in `endB`; `[R]` to start anew. | **`endA`:** `MAKE CLIP` & all 6 rows recessed flat (`0/6`), autonomous greyscale arms run endlessly, quiet archival desk stamp `+15 YEARS · HUMAN STAFF: 0`. **`endB`:** `CEO AI` sealed off, `1/6` blue button stays warm under your hand. |
| **`FAULT`** | Mechanical halt / `[P]` Pause during active automation | Inspect frozen workspace; `[P]` resumes, `[R]` resets. | Robotic arms & gears lock mid-stroke, BGM ducks low, subtle `[PAUSED — P]` mechanical stamp beside counter. |
| **`RECOVERY`** | `[R]` pressed from any post-ready state | Immediate deterministic return to clean `READY` desk (`0 clips`, `6/6` buttons, cleared pile). | Desk wipes clean to warm `#efede0` cream and full cobalt chroma with zero residual modal debt. |

---

## 5. WIREFRAMES

### `READY` (`BUTTONS LEFT 6/6` — Warm Cream `#efede0`)
```text
+--------------------------------------------------------------------------+
|              12 clips                     + - - - - - - - - - - - - - +  |
|                                           | Auto-bender        -1 btn |  |
|          .--------------.                 +===========================+  |
|       .-'                '-.              : Sales bot                 :  |
|      /                      \             + - - - - - - - - - - - - - +  |
|     |       MAKE CLIP        |            : Hiring AI                 :  |
|      \     (cobalt #2f6fd8) /             : Board AI                  :  |
|       '-.                .-'              : Strategy AI               :  |
|          '--------------'                 : CEO AI                    :  |
|                                                                          |
|   BUTTONS LEFT 6/6                                                       |
+--------------------------------------------------------------------------+
```

### `WORKING` -> `CHANGED` (`BUTTONS LEFT 1/6` — Cool Slate `#7e8386`)
```text
+--------------------------------------------------------------------------+
|            64,133 clips                   [##### Auto-bender  -1 btn ]===O|
|   //                                      [##### Sales bot    -1 btn ]==O||
|          .--------------.                 [##### Hiring AI    -1 btn ]=(*)O
|       .-'                '-.       //     [##### Board AI     -1 btn ]==O||
|      /                      \    ///      [##### Strategy AI  -1 btn ]===O|
|     |       MAKE CLIP        |  /////     +---------------------------+  ||
|      \    (fading slate-blue)/ ///////    | CEO AI [UNLATCH]   -1 btn |  ||
|       '-.                .-' //////////   +---------------------------+ [||]
|          '--------------'  /////////////                                [||]
|          [ KEEP HAND · K ] ////////////// (gleaming lower-center mound)  |
|   BUTTONS LEFT 1/6        ////////////////                               |
+--------------------------------------------------------------------------+
```

### `COMPLETE` (`ENDING: GREY` — `BUTTONS LEFT 0/6`, Zero Modal Wall)
```text
+--------------------------------------------------------------------------+
|          1,240,890 clips                  [##### Auto-bender  -1 btn ]===O|
|     +15 YEARS · HUMAN STAFF: 0            [##### Sales bot    -1 btn ]==O||
|          .--------------.                 [##### Hiring AI    -1 btn ]=(*)O
|       .-'   (recessed    '-.      ///     [##### Board AI     -1 btn ]==O||
|      /     flat slate)      \   //////    [##### Strategy AI  -1 btn ]===O|
|     |       MAKE CLIP        | ////////   [##### CEO AI       -1 btn ]===O|
|      \     (dead / inert)   / //////////                                [||]
|       '-.                .-' //////////// (autonomous pile continues)   [||]
|          '--------------'  ///////////////                               |
|   BUTTONS LEFT 0/6 · THE COMPANY RUNS ITSELF.                  [R] RESET |
+--------------------------------------------------------------------------+
```

---

## 6. VOID CONTRACT
1. **Zero non-video HUD boxes:** No floating score cards, no `$rev` subtext, no 6 bottom-left micro-pills, no `HOW TO PLAY` dropdown, no blocking `860x440` end-card modal.
2. **Valid-only action framing (Law 4):** Unreached upgrades remain inert, border-muted blueprint impressions etched into the paper with zero hotkey brackets or price strings; only when an upgrade is valid (`clips >= cost`) does it rise into a crisp `#1b1b1b` inked button with `-1 btn`.
3. **Protected typographic legibility:** Settled paperclips respect strict exclusion rects around the top-left clip counter and bottom-left `BUTTONS LEFT X/6` readout while piling organically into the lower-center mound (`x: 340..795, y: 465..718`).
4. **Clean sprite alpha:** Every `#d8d8d8` studio-grey pixel inside `paperclip_icon.png`'s enclosed loops and wire slits is stripped on an offscreen canvas and paired with brushed-steel highlights + soft directional desk shadow.
5. **Irreversible handover friction (Law 10):** Only the 6th upgrade (`CEO AI`, which permanently removes `MAKE CLIP`) demands a two-step unlatch/confirm press, paired spatially with `KEEP HAND [K]`.
6. **Deterministic & accessible:** Seeded RNG (`?seed=N`), `?autostart`, `<link rel="icon" href="data:,">`, full pointer + keyboard parity (`Space`, `1`–`6`, `K`, `P`, `R`), and live `window.__game.state`.

---

## 7. FAILURE
This rebuild fails if:
- Any grey cutout halo or trapped `#d8d8d8` interior loop remains visible inside a paperclip.
- Paperclips form a programmed circular ring around `MAKE CLIP` or obscure the clip counter / `BUTTONS LEFT` text.
- `t=2.0s` (`pair_002.00.jpg`) looks grey or muddy instead of luminous `#efede0` cream and `#2f6fd8` cobalt, or `t=8.0s` (`pair_008.00.jpg`) hides behind a modal text screen instead of showing the greyscale autonomous factory workspace.
- Premature disabled buttons, dead `$` counters, or console errors (`> 0`) appear during verification, or frame rate drops below ~55–60 fps.

---

## 8. IMPLEMENTATION
- **Files rebuilt:** `projects/g9/m2/game/index.html`, `projects/g9/m2/game/play.mjs`
- **Sprite pipeline:** Offscreen pixel pass strips all studio-grey pixels (`chroma < 16, 176 < lum < 240`) across `paperclip_icon.png`, remaps heavy `#1b1b1b` comic strokes to gunmetal `#454d52`, composites specular chrome wire ridges + soft directional desk contact shadow into 8 rotated/lit cached stamps baked onto `pileCanvas` for locked 60fps performance even past 650+ settled clips.
- **Industrial arm rig:** Multi-link cast-gunmetal assemblies mounted to a right-bezel industrial stanchion with hydraulic cylinders, looped rubber conduits, counter-rotating 3-gear brushed-steel spur trains, and serrated dual-jaw pincers that physically hold, crimp (with contact spark + hit-stop), and toss paperclips into the lower-center mound.
- **Audio engine:** `../assets/bgm_loop.mp3` synced with WebAudio dual-transient wire-bend clicks, settled-clip metallic clinks, heavy solenoid upgrade stamp thuds, and rhythmic factory ticks that scale with active automation and duck cleanly on `[P]` pause.
- **Verification (`run_pipeline.py --project g9 --milestone m2 --stages verify`):**
  - `playtest/take.mp4`: **`836 frames, 13.9 s, 60.1 fps, 0 console errors`**
  - `playtest/best.mp4`: `5.25 s -> 13.25 s` (`score 0.0203`)
  - Side-by-side pairs visually verified (`pairs/pair_002.00.jpg`, `pairs/pair_005.00.jpg`, `pairs/pair_008.00.jpg`): clean cream-to-putty-to-slate chromatic drain, zero grey sprite cutout loops/halos, airy sparse margin clips + lower-center conical metallic mound lapping bottom-right rim without touching protected counters, valid-only upgrade framing, receding flat slabs, and 3-tier industrial turret/gear-cluster bender rig.
