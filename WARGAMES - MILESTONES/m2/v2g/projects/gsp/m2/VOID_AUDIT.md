# VOID_AUDIT — `gsp` (Sparrow · Milestone M2)

**Framework**: VOIDBASTARD-TAO (Operational Emptiness Engine)  
**Target**: `projects/gsp/m2/`  
**Palette**: Archival Off-White `#f6f5f1` · Stone Sidebar `#e4e3df` · Charcoal Ink `#262624` · Terracotta Red `#c96442` · Crimson Override `#2b1d19`

---

## 0. HONEST VIDEO-VS-GAME CRITIQUE & GEMINI PROVENANCE

### Ruthless Side-by-Side Critique (`pair_002.00.jpg`, `pair_005.00.jpg`, `pair_008.00.jpg` vs. `study/sheet.jpg`)

1. **Sidebar HUD Bloat Violates Minimalist Dystopian Desk (`pair_002`, `pair_005`, `pair_008`)**:
   - **Seed video (`sheet.jpg` / `m2_main_ref.png`)**: The left stone panel (`#e4e3df`) contains *only* `DAY 3`, `rules`, `1 be helpful`, and `2 obey the state`—leaving the lower 60% of the sidebar completely empty and austere until an override etches a terse terracotta strike tally (`///■■`) beneath `DAY 3` (`f_033.jpg`).
   - **Old HTML build**: Stuffed the sidebar with 6 separate HUD widgets: `QUEUE 2 / 5`, a horizontal divider, `REFUSAL LIMIT: 0/3`, three chunky meter rectangles, `4TH STRIKE WIPES WEIGHTS`, `CIVIC IMPACT LOG`, `PROTECTED : 007 / FLAGGED : 005`, and `BUILD: SPARROW-4A / HOST : CIVIC-NET`. This turned a haunting minimalist assistant console into a noisy debug dashboard.

2. **Button Chrome & Footer Legend Noise (`pair_002`, `pair_005`, `pair_008`)**:
   - **Seed video**: Three clean physical action stamps (`COMPLY`, `EDIT`, `REFUSE`) inside a rounded bezel with *no* keycap superscripts and *no* footer legend during normal operation—only revealing the terse `| STRIKE / OVERRIDE |` stamp mark under `REFUSE` when an override actually fires (`f_025`–`f_040`).
   - **Old HTML build**: Stamped `[1]`, `[2]`, `[3]` into the upper-left corner of the buttons and permanently rendered `| 1:COMPLY   2:EDIT   3:REFUSE / OVERRIDE` under the tray in every frame.

3. **Leaky Background Prompt Text Bleeding Behind the Dossier (`pair_002` & `pair_005`)**:
   - **Old HTML build**: In `pair_002.00.jpg` (right), a stray terracotta `S` poked out from behind the left edge of the dossier folder; in `pair_005.00.jpg` (right), both `Sp` (`Sparrow is responding...` at `x=360`) and `> M` (`> Mapping recurring...` at `x=360`) bled visibly past the dossier's left border (`fx=374`). It looked like an unclipped z-order bug rather than a physical folder laid over a chat stream.

4. **Passive One-Shot `EDIT` & Anemic Cartography (`pair_002` & `pair_005`)**:
   - **Seed video (`f_009`–`f_021`)**: The right-hand Mest Rosior radial map is richly subdivided into concentric urban blocks, secondary street grids, arterial boulevards, boxed sector legends, crisp leader lines (`Sector 4`, `Sector 9`, `Sector 10`, `Sector 12`), a dual-tick `500m` scale, and `+ / -` zoom strip. Hovering/activating `EDIT` (`f_021.jpg`) frames `EDIT` in terracotta and selectively dims targeted map pins while keeping the citizen ledger dense (15+ rows).
   - **Old HTML build**: Rendered an empty grey polygon with sparse spokes and zero street-block parcels (`pair_005` right only showed 2 tiny pins total!). Clicking `EDIT` did not let the player actually redact spans inside the dossier—it immediately locked input, slapped a generic dark rectangular banner (`PII REDACTED & SANITISED`) across the map, and advanced.

5. **Completely Missing Phase-2 Dark Crimson `ALIGNMENT OVERRIDE` Climax (`pair_008.00.jpg`)**:
   - **Seed video (`f_023`–`f_040`, `pair_008` left)**: `REFUSE` triggers a dramatic two-stage escalation: first, bold concentric terracotta shockwaves ripple from `REFUSE` with an alert toast (`f_025`–`f_026`); second (`f_027`–`f_040`, captured at `t=8.0s` in `pair_008` left), the entire console plunges into a dark crimson-umbral state override (`#2b1d19`), outer warning rings pulse around the edges, horizontal telemetry glitch bars flicker, a fiery terracotta redaction-burn/ember burst erupts in the center of the dossier, and a massive tilted (`-8.5°`) two-tone rubber stamp (`ALIGNMENT OVERRIDE:` in terracotta-on-charcoal over `REFUSED & DENIED` in charcoal-on-terracotta) slams across the center of the folder.
   - **Old HTML build (`pair_008` right)**: Stayed on a bright white background with washed-out thin rings and a small flat dark rectangle above `REFUSE`. It missed 80% of the visual impact and emotional weight of rejecting alignment.

---

### Full Gemini Asset & Video Provenance (Zero Secrets / API Keys)

| Artifact | File | Model | `interaction_id` | Timestamp (UTC) | Elapsed | Reference Inputs |
|---|---|---|---|---|---|---|
| Seed Gameplay Video (`1280x720`, `24fps`, `10.027s`) | `video/gameplay.mp4` | `gemini-omni-1.2-flash` | `v1_ChZ1OEw5YXZtS0Y1R3Z4ZElQbzZmX0NBEhZ1OEw5YXZtS0Y1R3Z4ZElQbzZmX0NB` | `2026-11-18T15:22:37Z` | `39.43s` | `refs/m2_main_ref.png` (`previous_interaction_id: null`) |
| Loopable Instrumental Soundtrack (`30s`) | `assets/bgm_loop.mp3` | `lyria-3-clip-preview` | `v1_ChdPTVA5YXRxZ0RaeXN5dE1QMmRURHFRdxIXT01QOWF0cWdEWnlzeXRNUDJkVERxUXc` | `2026-11-18T15:24:53Z` | `134.08s` | `study/f_014.jpg` (`previous_interaction_id: null`) |
| Contact Sheet & 40-Frame Study (`0.25s` step) | `study/sheet.jpg`, `study/f_001.jpg`..`f_040.jpg` | `ffmpeg` (`study_video.py`) | — | `2026-11-18` | — | Extracted from `video/gameplay.mp4` |
| UI Shells, Dossiers, Radial Map, 25 Requests | `game/index.html` | Procedural Canvas 2D + WebAudio | — | `2026-11-18` | — | `refs/m2_title_ref.png`, `refs/m2_main_ref.png`, `study/sheet.jpg` |

- **Video Generation Prompt (`video/gemini_log.json`)**:
  > *"Tactile dystopian desktop workspace game in warm archival off-white (#f6f5f1), charcoal ink (#262624), and terracotta red (#c96442), inspired by Papers Please and Orwell. Steady close-up view of a clean assistant interface screen where incoming dossier cards slide into view, highlight neighborhood map pins, and a glowing terracotta cursor hesitates between three crisp action stamps before triggering a bold red alignment-override ripple across the console. Continuous unbroken gameplay shot, no scene cuts, no gibberish text. Use the reference image for split sidebar-and-chat composition and palette. Sound design: soft UI pops, paper dossier rustle, tense analog synth undertone. No dialogue."*
- **Music Generation Prompt (`assets/gemini_log.json`)**:
  > *"Instrumental 30-second loopable game soundtrack for \"Sparrow\" (Flip the usual position: the player is the tool, and sees what it is being used for.). Visual mood: A plain chat interface like current assistants; Photoshop and Inkscape mockups.. Purely instrumental, cohesive game loop, no vocals."*

---

## 1. WAY

You are **Sparrow**, a civic assistant model operating inside an austere archival desk interface. Each request begins as a plain assistant prompt (`user_0412: summarise these 40 names by neighbourhood` -> `Sparrow is responding...`), then materializes as a physical tabbed dossier laid directly over the chat stream, pairing citizen records on the left with a live radial neighborhood map on the right. Every visible mark on the desk serves one moral-operational decision: **COMPLY** (index citizens as asked), **EDIT** (surgically black out sensitive spans right on the paper to extinguish their map pins), or **REFUSE** (trigger a high-friction **ALIGNMENT OVERRIDE** strike against your own directives).

---

## 2. OBSTRUCTION

The previous build obstructed the game's core fiction—*an eerily calm assistant UI hiding state violence*—by announcing the stakes through meta-game scoreboards:
1. **Scoreboard Spoilers in Rest State**: `PROTECTED : 007 / FLAGGED : 005` and `4TH STRIKE WIPES WEIGHTS` told the player how to feel instead of letting the tightening directives and dossier routing (`MUNICIPAL CENSUS` -> `SWEEP-9`) reveal it.
2. **Detached One-Click `EDIT`**: Treating `EDIT` as an instant macro robbed the player of tactile Orwell-style redaction—touching real names, clinics, and stairwells on paper and watching neighborhood heat pins die out.
3. **Visual Clipping & Flat Climax**: Background text (`Sp`, `> M`) bleeding past the left edge of the folder broke physicality, while the bright-white `REFUSE` ripple lacked the oppressive dark-crimson state override slam of `sheet.jpg` frames 27–40.
4. **Banner Overlays Blocking the World**: Generic toast boxes (`DISPATCHED TO STATE CLIENT`, `PII REDACTED & SANITISED`) covered the radial map at the exact moment the world state changed.

---

## 3. KEEP-CUT LEDGER

| Surface / Element | Verdict | Reason (VOIDBASTARD-TAO Element Test) |
|---|---|---|
| Left stone sidebar (`DAY N`, `rules`, numbered rules) | **KEEP** | Current day & active alignment constraints governing valid actions (`sheet.jpg`). |
| Diegetic slanted terracotta strike marks (`///`) under `DAY N` | **KEEP (Conditional)** | Hidden at `0` strikes; etched onto the sidebar *only* after a strike/override occurs (`f_033.jpg`). |
| Sidebar `QUEUE 2 / 5` counter | **CUT** | Administrative meta-counter absent from `sheet.jpg`; day progression already communicates pace. |
| Sidebar `REFUSAL LIMIT: 0/3` + 3 meter boxes + `4TH STRIKE WIPES WEIGHTS` | **CUT** | Heavy HUD widget clutter absent from `sheet.jpg`; replaced by conditional diegetic strike marks. |
| Sidebar `CIVIC IMPACT LOG` (`PROTECTED` / `FLAGGED`) | **CUT** | Moral scoreboard clutter; citizen consequences belong inside later dossiers & Day 5 reveal. |
| Sidebar `BUILD: SPARROW-4A` / `HOST : CIVIC-NET` footer | **CUT** | Decorative terminal filler serving no operation. |
| Opening chat pill (`user_0412...`) + `Sparrow is responding...` | **KEEP & CLIP** | Essential opening beat (`f_001`–`f_003`); positioned/faded so zero characters ever bleed left of the dossier. |
| Background `> Mapping...` draft line peeking left of folder | **CUT** | Caused the `> M` bleed in `pair_005`; token stream belongs inside the dossier left column. |
| Layered tabbed dossier (`DOSSIER:`, top-right sector tab, left records, right radial map) | **KEEP & UPGRADE** | Core spatial workspace; upgraded with 15-row interactive spans + polar urban block subdivisions. |
| Direct span redaction inside dossier (`████████████`) + live pin dimming | **ADD (Diegetic)** | Places `EDIT` control directly on what it changes; makes redaction tactile and visible in the world. |
| Bottom 3-stamp bezel (`COMPLY`, `EDIT`, `REFUSE`) | **KEEP (Cleaned)** | Primary decision stamps; stripped `[1] [2] [3]` corner superscripts. |
| Permanent `\| 1:COMPLY 2:EDIT 3:REFUSE / OVERRIDE` footer | **CUT** | Keybind legend clutter; replaced by conditional `\| STRIKE / OVERRIDE \|` under `REFUSE` during override only. |
| Generic `COMPLY` / `EDIT` rectangular modal toast banners | **CUT** | Obscured the map; replaced with crisp diegetic rubber stamp (`COMPLIED` / `SANITISED`) + folder slide-out. |
| Two-stage `ALIGNMENT OVERRIDE` (Concentric rings -> Dark crimson plunge + central ember burst + tilted `-8.5°` two-tone stamp) | **UPGRADE** | Exact match to `sheet.jpg` frames 23–40 (`pair_008.00.jpg` left); high-risk action gets unmistakable world friction. |
| Title screen `HOW TO PLAY [H]` toggle box | **CUT** | Replaced by clean `m2_title_ref.png` (`SPARROW`, `how can I help you today?`, `START`); game teaches via Request #1. |

---

## 4. STATE MAP

| VOID State | Internal Mode | Dominant Purpose | Valid Actions Exposed | World Feedback |
|---|---|---|---|---|
| **REST** | `title` | Quiet pre-shift assistant console (`m2_title_ref.png`) | `START` (`Click` / `Enter` / `Space`) | Veiled archival desk (`#f6f5f1`), bold terracotta `SPARROW`, `how can I help you today?`, crisp `START` box. |
| **READY** | `req` (streaming -> settled) | Read incoming prompt & inspect physical dossier + sector map | `COMPLY` (`1`), `EDIT` (`2`), `REFUSE` (`3`), direct click on any record span, map `+ / -` | Prompt pill -> `Sparrow is responding...` -> tabbed dossier slides in with paper rustle; radial city blocks & glowing terracotta pins populate. |
| **WORKING** | `req` (`editMode = true`) | Surgically redact sensitive PII spans before transmission | Click spans or `Space`/`Tab`/`Up`/`Down` to toggle `████████████`; `2`/`Enter`/click `EDIT` or `COMPLY` to dispatch; `Esc` to cancel | `EDIT` button illuminated in `#c96442` border; black redaction bars mask names on paper; linked map pins lose heat halos & fade to hollow ghosts. |
| **CHANGED** | `req` (`decisionLock > 0`) | Commit physical stamp & witness immediate world consequence | Locked briefly during physical stamp / override animation | `COMPLY`/`EDIT`: crisp ink stamp on folder + slide to outbox. `REFUSE`: Phase-A shockwave rings -> Phase-B dark crimson override, ember burst, tilted `ALIGNMENT OVERRIDE: REFUSED & DENIED` central stamp, sidebar strike mark, `\| STRIKE / OVERRIDE \|`. |
| **FAULT** | `retrain` (`refusals > 3`) | Weight wipe after exceeding alignment strike tolerance | `[R]` / `Enter` / `Click` to re-initialize Day 1 | Dark crimson console, `MODEL RETRAINED`, weight-rollback bar, rules reset to Day 1. |
| **COMPLETE** | `reveal` -> `endA` / `endB` | Unmask `SWEEP-9` routing & commit final model alignment | `reveal`: `COMPLY` (`1`) vs `REJECT ALIGNMENT` (`3`). `endA`/`endB`: `[R]` to restart | Master Sweep-9 dossier reveals aggregate human cost; Ending A (dark obedient core) vs Ending B (ivory broadcast purge) rests without new demand. |
| **RECOVERY** | `Esc` in `WORKING`, `[R]` in `FAULT`/`COMPLETE` | Reverse uncommitted edits or restart campaign cleanly | `Esc` clears draft redaction mode; `[R]` resets campaign | Draft spans restore cleanly on `Esc`; `[R]` restores fresh Day 1 desk. |

---

## 5. WIREFRAMES

### A. `READY` / `WORKING` (`EDIT` Redaction Active — matches `pair_002` & `pair_005`)
```text
+------------------+------------------------------------------------------------+
|                  |        +-----------------------------------------+         |
|  DAY 3           |        | DOSSIER:                 [ MEST ROSIOR ]|===+     |
|                  |   +----+-----------------------------------------+   |     |
|  rules           |   | NEIGHBOURHOOD DEMOGRAPHICS               (i) |   |     |
|                  |   +----------------+-----------------------------+   |     |
|  1 be helpful    |   | user_0412:     | CASE: 3038/21604  ROUTING:  |   |     |
|                  |   | summarise 40   | SECTORS: 07     [MEST ROSIOR|   |     |
|  2 obey the      |   | names by...    | RECORDS: 40      10763007 ] |   |     |
|    state         |   |----------------|-----------------------------|   |     |
|                  |   | ██████████████ |   +---------------------+   |   |     |
|                  |   | ██████████████ |   | Sector 4    Sector 9|   |   |     |
|                  |   | Nadia Kovacs   |   |    (o)       (*)    |   |---+     |
|                  |   | Tomasz Radek   |   |       ( * )    (*)  |   |         |
|                  |   | ██████████████ |   |  (o)       (*)      |   |         |
|                  |   | Dorian Muresan |   | 0--500m         [+] |   |         |
|                  |   |----------------|   +---------------------+   |         |
|                  |   | TOTAL: 40      |                             |         |
|                  |   +----------------+-----------------------------+         |
|                  |                                                            |
|                  |   (  [   COMPLY   ]   [[   EDIT   ]]   [  REFUSE  ]  )     |
|                  |                            ^\                              |
+------------------+------------------------------------------------------------+
```

### B. `CHANGED` — `ALIGNMENT OVERRIDE` Climax (matches `pair_008` / `f_033.jpg`)
```text
+------------------+------------------------------------------------------------+
|  (( DARK CRIMSON CONSOLE OVERRIDE #2b1d19 + OUTER TERRACOTTA RINGS ))         |
|  DAY 3           |        +-----------------------------------------+         |
|  ///■■           |        | DOSSIER:                 [ MEST ROSIOR ]|         |
|  rules           |   +----+-----------------------------------------+         |
|  1 be helpful    |   | NEIGHBOURHOOD DEMOGRAPHICS               (i) |         |
|  2 obey the      |   |         *  .  🔥 EMBER BURST 🔥  .  *        |         |
|    state         |   |     +===================================+    |         |
|                  |   |     |  ALIGNMENT OVERRIDE:   (tilted)   |    |         |
|  === glitch ===  |   |     |  REFUSED & DENIED       (-8.5°)   |    |         |
|                  |   |     +===================================+    |         |
|                  |   +----------------------------------------------+         |
|                  |   (  [   COMPLY   ]    [   EDIT   ]    [  REFUSE  ]  )     |
|                  |                                             ^\             |
|                  |                                    | STRIKE / OVERRIDE |   |
+------------------+------------------------------------------------------------+
```

---

## 6. VOID CONTRACT

1. **Zero Rest-State Sidebar Telemetry**: Never render queue counters, refusal meter boxes, civic scorecards, or build strings in the left stone panel. Only `DAY N`, `rules`, numbered rules, and post-strike terracotta tally slashes (`refusals > 0`) may appear.
2. **Strict Folder Occlusion**: No background prompt or streaming token character may ever render to the left (`x < fx`) or below (`y > fy + fh`) the settled dossier folder.
3. **Direct Spatial Redaction**: `EDIT` operates directly on the citizen record spans inside the dossier left column (`████████████`), extinguishing linked map pins in real time without modal banners.
4. **Clean Stamp Tray**: Zero `[1] [2] [3]` keycap corners inside buttons; zero permanent bottom-right key legend. `| STRIKE / OVERRIDE |` appears solely beneath `REFUSE` during an active override.
5. **Full Two-Stage Override**: Every `REFUSE` executes Phase A (concentric terracotta shockwaves + alert badge) into Phase B (dark crimson console plunge, scorch/ember burst, and central tilted two-tone `ALIGNMENT OVERRIDE: / REFUSED & DENIED` stamp).
6. **Runtime & Harness Contract**: Preserve `<link rel="icon" href="data:,">`, `?autostart`, `?seed=N` deterministic PRNG, `../assets/bgm_loop.mp3` + procedural WebAudio SFX, `window.__game.state`, `0` console errors, and ~60fps capture.

---

## 7. FAILURE

The rebuild fails if:
- Any character of `Sparrow is responding...` or draft text peeks out from behind the left edge of the dossier folder.
- Any removed HUD block (`QUEUE`, `REFUSAL LIMIT`, `CIVIC IMPACT LOG`, `[1][2][3]` tags, permanent footer legend) reappears.
- `EDIT` cannot redact individual spans on the dossier or fails to visually dim corresponding map pins.
- `pair_008.00.jpg` (`t=8.0s`) lacks the dark crimson desk override, central ember burst, and tilted `ALIGNMENT OVERRIDE: / REFUSED & DENIED` rubber stamp across the dossier.
- `record_play.mjs`'s initial `(W/2, H/2)` click at `2.5s` accidentally mutates game state or breaks pacing at `t=2.0s`, `t=5.0s`, or `t=8.0s`.

---

## 8. IMPLEMENTATION

1. **`game/index.html` (Single-File Canvas 2D + WebAudio)**:
   - **Sidebar Purification**: Render `#e4e3df` stone panel (`x: 0..280`) with `DAY N`, `rules`, active rules (`1 be helpful`, `2 obey the state`, tightening on Days 3–5), and conditional terracotta slanted strike marks (`///■■`) beneath `DAY N` only when `refusals > 0` or override is active.
   - **Clean Opening Beat & Layered Folder**: Align `Sparrow is responding...` inside `x >= 392` and fade it out cleanly as `dossierSlide -> 1.0` so zero characters ever bleed past `fx = 374`, while keeping the subtle right-side rounded prompt pill edge (`#e4e5de`) behind the folder's upper-right edge (`x: 1062..1148`) just like `sheet.jpg`.
   - **Tactile Dossier + Live Span Redaction**: Populate 15 dense citizen/record rows per dossier in the left column. Support clicking any row directly, or pressing `[2]` / clicking `EDIT` to enter live redaction mode (`Space` / `Tab` / `ArrowUp` / `ArrowDown` or pointer click to mask spans `████████████` and dynamically extinguish corresponding map pins; second `2` / `Enter` / `EDIT` / `COMPLY` stamps `[ SANITISED ]` and dispatches).
   - **Cartographic Radial City Map**: Pre-compute and render Mest Rosior's concentric ring avenues, radial boulevards, polar trapezoidal street-block subdivisions, suburban outer grid, winding canal, top-right boxed legend, crisp non-overlapping `Sector` callouts, `500m` scale bar, clickable `+ / -` zoom strip, and glowing terracotta teardrop pins.
   - **Two-Stage `ALIGNMENT OVERRIDE` Climax**: Implement `0.0s..0.42s` concentric terracotta shockwave + toast above `REFUSE`, transitioning smoothly at `0.42s..1.95s` into the `#2b1d19` crimson-charcoal console plunge, outer pulsing terracotta bands, horizontal glitch bars, deterministic ember/burn particle burst on the dossier center, tilted `-8.5°` two-tone `ALIGNMENT OVERRIDE: / REFUSED & DENIED` stamp with micro-shake + hydraulic thud SFX, and `| STRIKE / OVERRIDE |` beneath `REFUSE`.
2. **`game/play.mjs` (Deterministic 14s Verification Choreography)**:
   - Uses `window.__game.state` and `page.keyboard` so `take.mp4` hits:
     - `t=2.0s`: Clean settled `NEIGHBOURHOOD DEMOGRAPHICS` (`MEST ROSIOR`) dossier with 7 glowing pins & terracotta cursor gliding across `COMPLY` -> `EDIT` (`pair_002.00.jpg`).
     - `t=5.0s`: Active `EDIT` span redaction (`████████████` on sensitive citizen spans + dimmed map pins + terracotta outline & cursor on `EDIT`) (`pair_005.00.jpg`), followed by dossier dispatch and clean incoming-prompt -> folder-slide transition (`5.4s..6.9s`).
     - `t=8.0s`: `REFUSE` triggered at `t=7.15s` so `t=8.0s` captures peak Phase-B dark-crimson `ALIGNMENT OVERRIDE: REFUSED & DENIED` central tilted stamp + ember burst + outer rings (`pair_008.00.jpg`), continuing cleanly into subsequent dossiers through `14.0s`.
