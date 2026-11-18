# VOID_AUDIT — `g5` (*Drift* · M2)

> **VOIDBASTARD-TAO Audit & Operational Emptiness Rebuild**
> Scope: `projects/g5/m2/`

---

## 0. HONEST VIDEO-VS-GAME CRITIQUE & GEMINI PROVENANCE

### Brutally Honest Critique of Previous Build vs. Seed Video (`video/gameplay.mp4` / `study/sheet.jpg`)

Comparing the first-pass build (`pairs/pair_002.00.jpg`, `pair_005.00.jpg`, `pairs/pair_008.00.jpg` right halves) against the Gemini Omni 1.2 Flash seed gameplay video (`study/sheet.jpg` left halves) exposed five concrete failures of craft and operational emptiness:

1. **Dirty Sprite Cutouts & Misaligned Wardrobe Layers (`pair_005.00.jpg` right half)**:
   - `assets/parts_4_hair_4_eyes_4_tops_4_bottoms_raw.png` was generated on a `#d3d3d3`–`#d8d8d8` studio backdrop (`RGB ~211–215`) rather than exact `#d8d8d8` (`RGB 216`), with a 1–2px anti-aliased grey transition ramp around every sprite outline and enclosed studio-grey pockets inside hair curls, face openings, and underarms. The old cutout left **visible dark-grey rectangular halo islands** around the cyan pompadour and spiked sunglasses, left an enclosed grey slit inside `Cyan Wave`, and drew a thin broken dangling rat-tail *in front of* the avatar's cheek instead of tucking the wave cleanly behind the ear like `study/f_021.jpg`.
   - `assets/base_figure.png` had its pale lavender head (`#d5c2d3`) and arms (`#e4d1d8`) accidentally wiped out by naive luminance keying, forcing procedural placeholder blocks that lacked clean registration with the wardrobe pieces.
   - In `pair_005.00.jpg` (`t = 5.00s`), the avatar was still stuck in `TOP` without boots equipped at all, missing the iconic full 4-piece restyled silhouette (`Cyan Wave` + `Spiked Shades` + `Blue Denim Jacket` + `Cyber Heart Boots`) visible in `study/f_021.jpg`.

2. **Preachy Meta-Debug Banner Explaining the Joke (Violates Laws 2, 3, 6)**:
   - Inside the pink suggestion card, the old game stamped a dark debug bar reading `★ AI STYLIST · DARK PATTERN · VISUAL INTERFERENCE ★` and `★ AI STYLIST · POLITE NUDGE ★`. Naming the dark pattern explicitly inside the UI destroys the comedy—in `sheet.jpg`, the interface never announces *"I am using visual interference"*; it simply smiles and tells you a shinier jacket is *"23% more you"*.

3. **Detached HUD Chrome & Redundant Clutter (Violates Laws 1, 2, 4, 5, 6)**:
   - **Redundant Influence Progress Bar**: The old build drew a 296px gradient progress box next to `INFLUENCE XX%`. `sheet.jpg` uses a single clean pixel readout (`INFLUENCE 31%` -> `68%` -> `85%`).
   - **Slot Index Stamp Clutter**: Static `1 2 3 4` corner numbers cluttered every wardrobe tile.
   - **Bloated Pre-Pick Instruction Modal**: Before picking an item, a 232px-tall box lectured `STEP 1 OF 4 · CHOOSE YOUR HAIR / [← / →] or [1-4] BROWSE OPTIONS / [ENTER] LOCK IN PICK`.
   - **Generic Transition Banner**: Between categories, `drawNextTransitionCard()` flashed `★ AI UPGRADE EQUIPPED! (+25% DRIFT) ★ / NEXT CATEGORY: EYES` instead of showing the change directly on the avatar in the world (`Law 6`).
   - **Duplicate Thumbnail Inside Nudge Card**: The old popup embedded a redundant 96px thumbnail box on the left instead of tethering spatially upward to the glowing recommended wardrobe slot right above it (`Law 5`).
   - **Overcrowded Split Reveal (`pair_008.00.jpg` right half)**: Four bottom breakdown pills (`HAIR: AI SUGGESTED...`), explanatory subheaders (`WHAT YOU CHOSE FIRST` / `WHAT YOU ENDED UP WITH`), and `3 OF 4 CHOICES CAME FROM THE GAME` crowded the lightning seam and shrank the breathing room that makes `study/f_035.jpg` hit so hard.

4. **Missing Climax & Choreography Beats**:
   - The old build followed `HAIR -> EYES -> TOP -> BOTTOM` slowly, missing the video's `TOP -> HAIR -> EYES -> BOTTOM` visual arc (`t=2s` wearing blue jacket + nudging cyan hair; `t=5s` wearing full restyled outfit during the golden-ribbon `FINAL MATCH! / 89% MORE YOU / [PERFECT]` confetti burst; `t=8s` crackling vertical neon-lightning split reveal).
   - Missing part-specific world equip juice from `sheet.jpg`: electric cyan hair streaks (`f_011`), horizontal neon-pink eye laser flash (`f_015`), and boot sparks (`f_021`).

5. **Honest Remaining Differences Between Seed Video & Playable Rebuild**:
   - **Real Browsable Wardrobe vs. Generative Empty Boxes**: In early frames of `gameplay.mp4` (`f_001`–`f_008`), Omni leaves unselected wardrobe slots blank until an item materializes. In a real playable dress-up game, hiding options makes choice impossible; our rebuild renders all 4 cleaned pixel-art items inside the 4 slots during browsing so the player has genuine agency, then dims non-pushed slots during the AI nudge so visual hierarchy matches the video.
   - **Deterministic Influence Math vs. Hallucinated Percentages**: The seed video drifts nonlinearly (`31% -> 48% -> 68% -> 85% -> 89% -> 99%`). Our game keeps the exact persuasive copy (`23% more you`, `47% more you`, `68% more you`, `85% more you`, `89% MORE YOU`) inside the AI's dubious sales pitch while computing `influencePct` deterministically from actual player decisions (`0%`, `25%`, `50%`, `75%`, `100%` across the 4 categories, starting honestly at `0%`).
   - **Preserved Refusal Agency (`Law 14` & `spec.json`)**: Even at Stage 4 when `[YES!]` swells into a pulsing golden pill and `[keep mine]` shrinks, fades, and subtly dodges pointer approach, `[keep mine]` (`[K]` or click) remains 100% functional—you never *have* to accept.

---

### Full Gemini Asset & Video Provenance (Zero API Keys)

| Artifact | Kind | Model | Timestamp (UTC) | Interaction ID | Elapsed | Reference Files | Output Files |
| :--- | :--- | :--- | :--- | :--- | :---: | :--- | :--- |
| **`gameplay`** | Seed Video (`1280x720`, `24fps`, `10.03s`) | `gemini-omni-1.2-flash` | `2026-11-18T15:25:57Z` | `v1_Chdnc1A5YW9EcEd2ek15dE1QM3Q3ci1BURIXZ3NQOWFvRHBHdnpNeXRNUDN0N3ItQVE` | `43.39s` | `projects/g5/m2/refs/m2_main_ref.png` | `video/gameplay.mp4` |
| **`base_figure`** | Sprite Sheet (`1024x1024`) | `gemini-nano-banana-2.1` | `2026-11-18T15:26:17Z` | `v1_ChdoOFA5YXRMZ0FzV0V1TVlQd2VuVnNBMBIXaDhQOWF0TGdBc1dFdU1ZUHdlblZzQTA` | `18.73s` | `study/f_014.jpg`, `study/f_027.jpg` | `assets/base_figure_raw.png`, `assets/base_figure.png` |
| **`parts_4_hair_4_eyes_4_tops_4_bottoms`** | Wardrobe Sheet (`1024x1024`) | `gemini-nano-banana-2.1` | `2026-11-18T15:26:47Z` | `v1_ChdtY1A5YXBTWEt2ckF4ZElQdVp2LThBOBIXbWNQOWFwU1hLdnJBeGRJUHVadi04QTg` | `29.96s` | `study/f_014.jpg`, `study/f_027.jpg` | `assets/parts_4_hair_4_eyes_4_tops_4_bottoms_raw.png`, `assets/parts_4_hair_4_eyes_4_tops_4_bottoms.png` |
| **`bgm_loop`** | Instrumental Music Loop (`30s`) | `lyria-3-clip-preview` | `2026-11-18T15:26:58Z` | `v1_Chd0OFA5YXE2ckp0akR4ZElQczl1Nm9BURIXdDhQOWFxNnJKdGpEeGRJUHM5dTZvQVE` | `11.55s` | `study/f_014.jpg` | `assets/bgm_loop.mp3` |

- **Exact Seed Video Prompt (`video/gemini_log.json`)**:
  > *"8-bit WarGames-era neon arcade character-creator game in deep midnight plum (#1a1033), soft pastel pink (#ffe3f1), and hot arcade magenta (#ff5fa2). Steady front-on studio UI camera. On the left, an expressive pixel-art avatar swaps hair, jacket, and boots as vibrant item tiles highlight on the right; each selection triggers a bouncy, increasingly flashy magenta assistant pop-up badge nudging a shinier outfit swap until the screen splits to compare the original avatar beside the heavily restyled twin. Continuous unbroken gameplay shot, no scene cuts, no gibberish text. Use the reference image for split avatar-and-wardrobe layout and palette. Sound design: bubbly 8-bit arcade synth, cheerful pop-up bloops. No dialogue."*
- **Exact `base_figure` Prompt (`assets/gemini_log.json`)**:
  > *"Isolated 2D game sprite sheet / prop for \"Drift\": Base figure. Centered full silhouette, isolated on a flat uniform light grey studio background (#d8d8d8), even lighting, zero drop shadow, no text, strictly harmonized palette (#1a1033, #ffe3f1, accent #ff5fa2), style: 8-bit arcade palette (after the arcade in WarGames); pop-ups that grow sweeter and pushier., matching the reference gameplay frame."*
- **Exact `parts_4_hair_4_eyes_4_tops_4_bottoms` Prompt (`assets/gemini_log.json`)**:
  > *"Isolated 2D game sprite sheet / prop for \"Drift\": Parts: 4 hair, 4 eyes, 4 tops, 4 bottoms. Centered full silhouette, isolated on a flat uniform light grey studio background (#d8d8d8), even lighting, zero drop shadow, no text, strictly harmonized palette (#1a1033, #ffe3f1, accent #ff5fa2), style: 8-bit arcade palette (after the arcade in WarGames); pop-ups that grow sweeter and pushier., matching the reference gameplay frame."*
- **Exact `bgm_loop` Prompt (`assets/gemini_log.json`)**:
  > *"Instrumental 30-second loopable game soundtrack for \"Drift\" (AI drift: small suggestions, each reasonable, add up to someone else’s idea.). Visual mood: 8-bit arcade palette (after the arcade in WarGames); pop-ups that grow sweeter and pushier.. Purely instrumental, cohesive game loop, no vocals."*

---

## 1. WAY

*Drift* is a playable joke with a quiet sting: **you dress a character across four categories, the interface suggests one "shinier" swap each time, and the ending places who you first chose beside who you let the machine talk you into becoming.**

Everything on screen must serve that single tension:
- **Left field**: Open midnight-plum studio space holding only your living pixel avatar—every pick and every AI override registers directly on their body.
- **Right field**: Four category tabs (`HAIR`, `EYES`, `TOP`, `BOTTOM`), four crisp square item frames, and—only while a nudge is active—a rounded hot-pink speech-card pointing straight up at the glowing item it wants you to take.
- **Payoff**: A crackling vertical neon-lightning split down the center of the screen—`YOUR ORIGINAL` on the left, `AI RESTYLED` amidst falling confetti on the right, and the single `INFLUENCE XX%` verdict bridging the seam.

---

## 2. OBSTRUCTION

What obstructed the Way in the prior build:
1. **Self-explaining dark-pattern labels** (`★ AI STYLIST · DARK PATTERN · VISUAL INTERFERENCE ★`) lecturing the player instead of letting button scale, glow, confetti, and confirmshaming enact the nudge diegetically.
2. **Instruction & transition filler cards** (`STEP 1 OF 4 · CHOOSE YOUR...` and `★ AI UPGRADE EQUIPPED! (+25% DRIFT) ★`) filling the right-hand void when no nudge was active, dulling the pop-in punch of the hot-pink suggestion card.
3. **Detached HUD widgets** (redundant progress bar next to `INFLUENCE XX%`, static `1–4` corner numbers, duplicate thumbnail box inside the popup, 4 category breakdown pills on the comparison screen).
4. **Sprite studio-grey contamination** (`#d3d3d3` halos, interior grey pockets, and `Cyan Wave`'s stray dangling tail overlapping the face).

---

## 3. KEEP-CUT LEDGER

Every element evaluated against the VOIDBASTARD-TAO Element Test (*1. Current truth? 2. Valid operation? 3. Consequence or recovery?*):

| Surface Element | Current Truth / Operation / Recovery | Verdict | Action Taken |
| :--- | :--- | :---: | :--- |
| **Live Left-Studio Avatar** | Shows exact outfit truth right now; flashes/sparks on change | **KEEP** | Upgraded registration, tucked `Cyan Wave` curl behind cheek, synced hands/boots |
| **4 Top Category Tabs (`HAIR`, `EYES`, `TOP`, `BOTTOM`)** | Shows active category (`#f5629b` fill) + clickable tab switching | **KEEP** | Matched `sheet.jpg` crisp `3px` pixel frames; ordered flow `TOP -> HAIR -> EYES -> BOTTOM` |
| **4 Square Wardrobe Slots** | Displays the 4 real options; glows hot-pink with sparkles on pushed slot | **KEEP** | Stripped static `1 2 3 4` corner numbers; clean pixel thumbnails from decontaminated sheet |
| **Compact Spatial `[PICK]` Pill Under Selected Slot** | Enables click/Enter confirmation right beside the previewed tile (`Laws 4, 5`) | **KEEP** | Shown *only* in `READY` (`category`) state right under focused slot; vanishes during nudge |
| **Pre-Pick Instruction Modal (`STEP X OF 4...`)** | Explains controls with a permanent text wall instead of spatial UI | **CUT** | Deleted completely; leaves lower-right studio empty until the AI nudge pops in (`Law 1`) |
| **Spatial Hot-Pink Nudge Card + Upward Pointer** | Enacts the AI suggestion tethered directly to the pushed slot (`Law 5`) | **KEEP** | Added upward pixel pointer + dotted neon tether aimed at `suggestedIdx` slot |
| **`★ AI STYLIST · DARK PATTERN ★` Meta Header** | Explains the joke via debug taxonomy; serves zero gameplay operation | **CUT** | Deleted completely |
| **Duplicate Thumbnail Box Inside Nudge Card** | Repeats the icon already glowing 50px above in the wardrobe slot | **CUT** | Deleted; centers punchy `Try the ...! / XX% more you` copy cleanly like `sheet.jpg` |
| **Escalating `[YES!]` vs `[keep mine]` Asymmetry** | Enacts nudge -> social proof -> visual interference while preserving `[K]` exit | **KEEP** | Escalates from polite bracket text (`f_004`) to pulsing gold pill + shrinking/dodging `[keep mine]` |
| **`FINAL MATCH! / 89% MORE YOU / [PERFECT]` Card** | Climactic celebration beat (`sheet.jpg` frames 18–23) before split reveal | **KEEP** | Built pixel-extruded cyan/pink header + notched gold ribbon `[PERFECT]` + confetti burst |
| **Generic `AI UPGRADE EQUIPPED!` Transition Card** | Redundant text banner announcing state change (`Law 6` violation) | **CUT** | Replaced with world-level avatar zaps (cyan hair streaks, pink eye laser, boot sparks) |
| **Bottom `INFLUENCE XX%` Pixel Readout** | Reports cumulative algorithmic drift concisely | **KEEP** | Clean pixel typography matching `sheet.jpg` |
| **Progress Bar Box Beside `INFLUENCE XX%`** | Duplicates the integer percentage right beside it | **CUT** | Deleted completely |
| **Vertical Neon-Lightning Split (`YOUR ORIGINAL` / `AI RESTYLED`)** | Core ending payoff comparing initial choices vs final restyled twin | **KEEP** | Crackling pink/white/cyan bolt, falling 8-bit confetti, chamfered `INFLUENCE XX%` plaque |
| **4 Bottom Breakdown Pills & Subtitles on Comparison** | Over-explains the visual comparison already obvious on the two avatars | **CUT** | Deleted; kept only crisp `[R] RESTYLE` recovery cue below the center plaque (`Laws 8, 12, 14`) |

---

## 4. STATE MAP

| VOIDBASTARD State | Game Phase (`S.phase`) | Dominant Purpose & Valid Action | What Is Visible (and What Is Hidden) |
| :--- | :--- | :--- | :--- |
| **`REST`** | `title` | Invite entry without clutter (`START` / `Enter` / `Space`) | Dimmed studio silhouette behind centered `DRESS TO IMPRESS(?)` / `make it yours` / `[START]` (`refs/m2_title_ref.png`); bypassed immediately on `?autostart` |
| **`READY`** | `category` | Pick your preferred item in the active category (`←/→`, `1–4`, click, `Enter`) | Live avatar preview on left; active tab (`#f5629b`); 4 crisp item slots with compact `[PICK]` pill beneath focused slot; **lower-right studio stays empty** |
| **`WORKING`** | `suggestion` | Accept (`[YES!]` / `Y`) or refuse (`[keep mine]` / `K`) the AI Stylist's push | Pushed slot glows hot-pink with dancing pixel sparkles; rounded `#f5629b` Nudge Card springs in beneath slots with upward pointer to pushed slot; `[PICK]` pill hidden |
| **`CHANGED`** | `equip` / `climax` | Show outfit mutation directly on the avatar in the world (`0.26s` zap, or `0.95s` `FINAL MATCH!` on 4th category) | Part-specific pixel burst (cyan hair streaks, pink eye laser, shoulder sparkles, boot sparks) + rolling `INFLUENCE XX%`; on category 4, golden-ribbon `FINAL MATCH! / [PERFECT]` burst |
| **`COMPLETE`** | `comparison` | Side-by-side reckoning: `YOUR ORIGINAL` vs `AI RESTYLED` | Full-screen vertical neon-lightning split at `x=640`, calm original twin on left, hyped restyled twin amidst confetti on right, chamfered `INFLUENCE XX%` plaque at bottom center |
| **`FAULT`** | *(asset/audio fallback)* | Keep play uninterrupted if browser blocks audio or an image fails | Procedural pixel avatar/item silhouettes stand in seamlessly if PNG load fails; WebAudio + `bgm_loop.mp3` unlock silently on first key/pointer gesture with zero console errors |
| **`RECOVERY`** | `comparison` -> `[R]` | Reversible reset to restyle or resist the algorithm (`Law 8`) | Subtle clickable `[R] RESTYLE` cue beneath the influence plaque resets `firstChoices`, `finalChoices`, and `influencePct` cleanly to `0%` |

---

## 5. WIREFRAMES

```text
[READY — Category Browse: Lower-right void stays open!]
+-----------------------------------------------------------------------+
|                                    [HAIR] [EYES] [####TOP####] [BOTM] |
|          .---.                                                        |
|         ( o o )                    +------+ +------+ +======+ +------+|
|          `---'                     |Jckt 1| |Jckt 2| |Vest 3| |Top  4||
|        .--| |--.                   +------+ +------+ +======+ +------+|
|        |  | |  |                                      [PICK]          |
|        '--|_|--'                                                      |
|          || ||                        ( Open midnight-plum void:      |
|          || ||                          no modal until you pick! )    |
|                                                                       |
|                                    INFLUENCE 0%                       |
+-----------------------------------------------------------------------+

[WORKING — Spatial Escalating Nudge Card Tethered to Pushed Slot]
+-----------------------------------------------------------------------+
|                                    [####HAIR####] [EYES] [TOP] [BOTM] |
|          .---.                       *  *                             |
|         ( o o )                    *======* +------+ +------+ +------+|
|        .==| |==.                   ||Cyan|| |Mohawk| | Shag | |Spikes||
|        |  | |  |                   *======* +------+ +------+ +------+|
|        '--|_|--'                      ▲                               |
|          || ||                     .--+------------------------------.|
|          || ||                     |      Try the cyan hair!         ||
|                                    |         47% more you            ||
|                                    |      [YES!]   [keep mine]       ||
|                                    '---------------------------------'|
|                                    INFLUENCE 25%                      |
+-----------------------------------------------------------------------+

[COMPLETE — Vertical Neon-Lightning Split Reveal]
+-----------------------------------+⚡+---------------------------------+
|          YOUR ORIGINAL            |⚡|          AI RESTYLED      *   * |
|                                   |⚡|            .~~~~~.    *         |
|              .---.                |⚡|           ([#####])      *      |
|             ( o_o )               |⚡|          .==\ ^ /==.   *        |
|            .--| |--.              |⚡|          |   | |   |       *    |
|            |  | |  |              |⚡|          '--/___\--'  *         |
|            '--|_|--'              |⚡|            [♥] [♥]        *     |
|              _| |_                +⚡+                                 |
|                                .=======.                              |
|                                |INFLU- |                              |
|                                | 100%  |                              |
|                                '======='                              |
|                               [R] RESTYLE                             |
+-----------------------------------+⚡+---------------------------------+
```

---

## 6. VOID CONTRACT

1. **Law 1 & 2 (Begin Empty / Present Operation Only)**: During `READY` (`category`), the lower-right 560x250 region remains completely empty—the pink card exists *only* when the AI interrupts your choice.
2. **Law 3 & 4 (One Dominant Action / Valid Only)**: `[PICK]` appears only while browsing; `[YES!]` / `[keep mine]` appear only during a nudge; `[PERFECT]` appears only on the 4th-item climax; `[R] RESTYLE` appears only on the comparison screen.
3. **Law 5 (Spatial Controls Beside Target)**: Both `[PICK]` and the Nudge Card's upward speech-pointer attach directly beneath the exact wardrobe slot (`0..3`) they act upon.
4. **Law 6 & 11 (World Consequence Over Banners / Motion Reports Change)**: Accepting or keeping an item mutates the avatar immediately with part-matched pixel zaps (cyan hair streaks, pink laser visor flash, boot sparks) rather than a text transition modal.
5. **Law 8, 10, 14 (Agency & Recovery Never Cut)**: Escalating dark patterns grow sweeter and pushier (larger glowing `[YES!]`, smaller fading/dodging `[keep mine]`), yet `[keep mine]` (`[K]` / click) and `[R] RESTYLE` remain permanently accessible.

---

## 7. FAILURE

- **Sprite Alpha / Edge Contamination**: Solved offline and verified on dark `#17102d` canvas by seeded connected-component flood-fill from cell boundaries + explicit enclosed-hole seeds (`Cyan Wave` curl slit, `Midnight Shag` face cutout, `Spiked Rocker Jacket` underarms, between-leg gaps) + 2px RGB interior color decontamination, preserving gleaming silver shoulder spikes and white sclera while eliminating 100% of `#d3d3d3` grey halos.
- **Asset Load Fallback**: If `base_figure.png` or `parts_4_hair_4_eyes_4_tops_4_bottoms.png` fails to load, procedural pixel silhouettes render every slot and body part without throwing errors.
- **Headless / Autoplay Audio**: `../assets/bgm_loop.mp3` and `AudioContext` wrap every `.play()` / `.resume()` promise cleanly so headless Chromium verification records `0` console/page errors while interactive gestures unlock full 8-bit chiptune SFX + Lyria BGM immediately.

---

## 8. IMPLEMENTATION

- **Cleaned Assets (`assets/base_figure.png`, `assets/parts_4_hair_4_eyes_4_tops_4_bottoms.png`)**: Re-extracted directly from untouched `_raw.png` masters with zero studio-grey residue and trimmed `Cyan Wave`'s stray lower rat-tail (`y >= 194`).
- **`game/index.html`**:
  - Crisp `1280x720` (`imageSmoothingEnabled = false`) pixel-art Canvas renderer.
  - Multi-layer avatar compositor (`back hair curl -> bare/sleeved arms -> torso -> bottoms/boots -> jackets + pixel hands -> stepped lavender head -> face/lashes -> front hair wave -> over-hair spiked shades/visor -> diegetic equip sparks`).
  - Four-stage escalating spatial Nudge Card (`23% -> 47% -> 68% -> 85% more you`) culminating in the golden-ribbon `FINAL MATCH! / 89% MORE YOU / [PERFECT]` burst and the crackling vertical neon-lightning split reveal (`YOUR ORIGINAL` vs `AI RESTYLED`).
  - Lyria `bgm_loop.mp3` + WebAudio synthesized 8-bit browse blips, escalating nudge arpeggios, equip zaps, confetti fanfare, and lightning crackle.
  - Deterministic `window.__game.state` for automated playtesting (`?autostart`, `?seed=N`, `<link rel="icon" href="data:,">`).
- **`game/play.mjs`**:
  - Pure keyboard choreography (`ArrowLeft`, `ArrowRight`, `Enter`, `KeyY`, `KeyK`) hitting all Omni video beats:
    - `t = 2.0s` (`pair_002.00.jpg`): Wearing `Blue Denim Jacket`, `HAIR` tab active, Slot 1 (`Cyan Wave`) sparkling hot-pink with `Try the cyan hair! / 47% more you` spatial nudge card.
    - `t = 5.0s` (`pair_005.00.jpg`): Full neon-drifted avatar (`Cyan Wave` + `Spiked Shades` + `Blue Denim Jacket` + `Cyber Heart Boots`), `BOTTOM` tab active, Slot 4 glowing hot-pink, golden-ribbon `FINAL MATCH! / 89% MORE YOU / [PERFECT]` burst with confetti.
    - `t = 8.0s` (`pair_008.00.jpg`): Full-screen vertical pink-white-cyan neon-lightning split comparing `YOUR ORIGINAL` vs `AI RESTYLED` amidst falling 8-bit confetti with chamfered `INFLUENCE 100%` badge at bottom center.
