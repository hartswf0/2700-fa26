# VOID_AUDIT.md — Group 16 · Channel 0 (M2)

> **Engine**: VOIDBASTARD-TAO (Operational Emptiness Engine)
> **Scope**: `projects/g16/m2/`
> **Core Thesis**: *"One remote, one button. Every channel tells you the same thing: keep watching. The only real choice is whether to put the remote down."*

---

## 0. HONEST VIDEO-VS-GAME CRITIQUE & GEMINI PROVENANCE

### A. Brutally Honest Critique of Previous M2 Build vs. Omni 1.2 Flash Seed Video (`study/sheet.jpg` & `pairs/pair_*.jpg`)

1. **Tacky Non-Diegetic HUD Instruction Bar & Web2 Modal Boxes (`pair_002`, `pair_005`, `pair_008` right vs. left)**
   - **Before**: A literal floating debug-style instruction bar (`[SPACE / CLICK] FLIP CHANNEL     [P] PUT REMOTE DOWN`) sat plastered over the dark wooden table in the bottom-left corner of every frame. Worse, non-autostart entry and both endings (`TAKEN OVER` and `REMOTE SET DOWN`) dropped large rectangular Web2 modal boxes over the television, complete with gamey stat readouts (`SIGNAL COVERAGE: 100%`) and a parenthetical moralizing explanation: `(Putting the remote down was the one real choice.)`.
   - **Omni Video Truth**: Zero HUD text, zero floating banners, zero modal popups. The entire psychological horror relies on unmediated first-person presence: only the dim charcoal-sketched bedroom, the curved CRT glass with its stark monospace broadcast OSD (`CH 07` / `"you can stop thinking now"`), the physical remote held in the lower-right corner, and the encroaching `#ff00dc` / `#000000` missing-texture rot.

2. **Flat Vector Cartoon "Football Eye" on `CH 03` (`pair_005.00.jpg` right vs. left)**
   - **Before**: On `CH 03` (`"IT IS WATCHING"`), `drawWatchingEye()` pasted a smooth radial-gradient white vector almond over the bottom of the stairwell while leaving a harsh black doorway rectangle directly above it. Against the gritty chicken-scratch charcoal stairwell sprite, it looked like clean Flash clip-art pasted on top of an etching.
   - **Omni Video Truth (`f_022.jpg` / `f_023.jpg`)**: A massive, uncanny charcoal-shaded eyeball rises organically out of the stairwell void—complete with a curved, densely hatched graphite upper brow dome filling the doorway arch, a heavy cast shadow under the upper lid across the sclera and iris, hand-inked radial iris striations, and dark crosshatched under-eye creases resting onto the stair treads.

3. **Premature Wallpaper Corruption Dump & Missing Analog CRT Sync-Roll Tear (`pair_002.00.jpg` right vs. left)**
   - **Before**: Because `room_background_around_the_tv.png` was generated from mid-game study frames (`f_014.jpg`, `f_027.jpg`), it already had large pink/black checker clusters baked onto the wallpaper and right TV control panel. On `flips === 1`, the old code blended `assets.room` at `0.72` alpha immediately and spawned 6 extra clusters, jumping instantly from `0%` to `~80%` wallpaper corruption at `t = 2.0s` while leaving leftover black square smudges on `cleanRoomCanvas` and leaking a `19px` vertical strip on the right inner CRT edge (`SCR.w = 438` vs actual `444+`). Meanwhile, channel flips only drew faint horizontal grey bars instead of real horizontal sync-loss.
   - **Omni Video Truth (`f_001` -> `f_009` -> `f_012`)**: At `t = 0..1.8s` (`CH 07`), the bedroom is **100% uncorrupted**—only a tiny 7-block diagonal `#ff00dc`/`#000000` tear floats inside the CRT screen. When the thumb clicks to `CH 01` at `t = 2.0s` (`f_009.jpg`), the bedroom wallpaper is *still* clean while the CRT tube snaps into **wavy analog VHS/CRT horizontal sync-roll ribbons, right-edge white sync-curl sawtooths, and a thick dark rolling V-blank sync bar**, followed `0.25s` later (`f_010`..`f_012`) by missing-texture blocks erupting outward from the bezel seam.

4. **Missing `t = 8.0s` `SYSTEM ERROR` Screen Consumption & Cutout Fringe Halo (`pair_008.00.jpg` right vs. left)**
   - **Before**: At `t = 8.0s`, the old build sat on a tame `CH 02` corridor with scattered translucent rectangles, weak un-bloomed purple lines behind the TV, and a bright beige hand sporting a visible `[157, 157, 154]` light-grey cutout fringe halo from its `#d8d8d8` studio background.
   - **Omni Video Truth (`f_033.jpg`)**: By `t = 8.0s`, the camera pushes claustrophobically closer (`~1.13x`), the entire curved CRT tube fractures into a dense, horizontally-sheared `#ff00dc` & `#000000` missing-texture checkerboard (`"SYSTEM ERROR"`) with a static tear band across the middle, perspective checker patches spill onto the wooden tabletop, luminous neon-magenta (`#ff2ae5`) orthogonal wireframe tendrils crawl up both walls, and the player's hand/remote darkens into a nocturnal backlit silhouette rimmed in glowing neon magenta.

5. **Spoiled / Inaccessible Put-Down-Remote Discovery**
   - **Before**: Putting the remote down was spoiled on frame 1 by `[P] PUT REMOTE DOWN` HUD text, while the untouched stillness timer was set to `11.0s` and explicitly disabled under `?autostart`, preventing the stillness resolution from ever manifesting naturally in verification or short sessions.

### B. Honest Remaining Differences After Rebuild
Even after eliminating HUD/modal clutter, de-fringing sprites, restoring spotless wallpaper inpainting, synthesizing a 2-frame boiling charcoal-crosshatched eye, adding scanline-sheared CRT sync-roll + `SYSTEM ERROR` checker takeover, and choreographing untouched stillness into `CH 00`:
- **Neural Frame Morphing vs. Real-Time Sprite + Procedural Compositing**: `gemini-omni-1.2-flash` continuously hallucinates subtle 3D foreshortening changes across the hand's fingers and organic perspective-warped 3D checker cubes extruding out of the CRT glass (`f_040.jpg`), whereas our live 60fps HTML5 Canvas engine composites de-fringed `gemini-nano-banana-2.1` 2D plates (`room_background_around_the_tv.png`, `tv_frame_and_remote.png`, `8_channel_loops_still_or_2_frame.png`) with 2D affine tabletop shear, barrel-curved CRT Bézier clipping, and procedural orthogonal wireframe tendrils.
- **Playable 8-Channel Breadth + Stillness Arc**: The 10s Omni clip only visits `CH 07 -> CH 01 -> CH 03 -> SYSTEM ERROR` and ends in consumption; the live game supports all 8 distinct horror channels (`CH 01`–`CH 08`, direct tuning `1`–`8`, bidirectional flipping) PLUS the interactive spatial/untouched stillness arc into `CH 00` and `[R]` degauss recovery.

### C. Complete Gemini Asset & Video Provenance (Redacted / Key-Clean)

All provenance verified directly from `video/gemini_log.json` and `assets/gemini_log.json` (zero API keys present in logs):

| Stage / Asset ID | Model | Timestamp (UTC) | Interaction ID | Elapsed | Grounding Refs | Output Files & Exact Sizes |
| :--- | :--- | :--- | :--- | ---: | :--- | :--- |
| `gameplay` (Seed Video) | `gemini-omni-1.2-flash` | `2026-11-18T15:18:04Z` | `v1_ChZxTUg5YXNxQUJfX1BpTE1QbGJleFlREhZxTUg5YXNxQUJfX1BpTE1QbGJleFlR` | `45.31s` | `refs/m2_main_ref.png` (`26,372 B`) | `video/gameplay.mp4` (`7,693,418 B`, `1280x720`, `24fps`, `10.027s`) |
| `tv_frame_and_remote` | `gemini-nano-banana-2.1` | `2026-11-18T15:18:57Z` | `v1_Chd6c0g5YXZtOUJMUGYwX2dQNktEMWlBdxIXenNIOWF2bTlCTFBmMF9nUDZLRDFpQXc` | `19.70s` | `study/f_014.jpg`, `study/f_027.jpg` | `assets/tv_frame_and_remote_raw.png` (`618,802 B`), `assets/tv_frame_and_remote.png` (`1,404,915 B`, `1024x1024` RGBA) |
| `8_channel_loops_still_or_2_frame` | `gemini-nano-banana-2.1` | `2026-11-18T15:19:16Z` | `v1_Chc0Y0g5YXNfcExxZU55dE1Qb3JXSTBRTRIXNGNIOWFzX3BMcWVOeXRNUG9yV0kwUU0` | `18.95s` | `study/f_014.jpg`, `study/f_027.jpg` | `assets/8_channel_loops_still_or_2_frame_raw.png` (`718,914 B`), `assets/8_channel_loops_still_or_2_frame.png` (`1,567,043 B`, `1024x1024` RGBA) |
| `room_background_around_the_tv` | `gemini-nano-banana-2.1` | `2026-11-18T15:19:36Z` | `v1_Chc5TUg5YXE3dks4bVAxc2dQc3VDd3lRWRIXOU1IOWFxN3ZLOG1QMXNnUHN1Q3d5UVk` | `19.86s` | `study/f_014.jpg`, `study/f_027.jpg` | `assets/room_background_around_the_tv.png` (`656,388 B`, `1376x768` RGB) |
| `bgm_loop` | `lyria-3-clip-preview` | `2026-11-18T15:19:47Z` | `v1_ChdDTUw5YXZ6aUpQZWpvX1VQODdURTZBYxIXQ01MOWF2emlKUGVqb19VUDg3VEU2QWM` | `11.02s` | `study/f_014.jpg` | `assets/bgm_loop.mp3` (`656,942 B`, 30s loop) |

**Exact Prompts Logged**:
- **Seed Video (`gemini-omni-1.2-flash`)**:
  > *"Hand-drawn scratchy greyscale psychological game (#161616 and #d8d8d8) with vivid magenta-and-black (#ff4fd8) missing-texture checkerboard glitches. Steady first-person view facing a bulky vintage CRT television in a dim sketchy bedroom; a hand in the lower corner clicks a remote control. Each click snaps the CRT screen through jittering hand-drawn broadcast static, and glowing magenta-black checker squares spill outward from the glass bezel onto the surrounding wallpaper. Continuous unbroken gameplay shot, no scene cuts, no gibberish text. Use the reference image for TV framing and palette. Sound design: heavy plastic remote clicks, CRT static hiss, rising low drone. No dialogue."*
- **Sprites (`gemini-nano-banana-2.1`)**:
  - `tv_frame_and_remote` / `8_channel_loops_still_or_2_frame`: *"Isolated 2D game sprite sheet / prop for 'Channel 0': <label>. Centered full silhouette, isolated on a flat uniform light grey studio background (#d8d8d8), even lighting, zero drop shadow, no text, strictly harmonized palette (#161616, #d8d8d8, accent #ff4fd8), style: Hand-drawn static, chicken-scratch lines, greyscale with pink and black missing-texture checks., matching the reference gameplay frame."*
  - `room_background_around_the_tv`: *"Clean 2D/2.5D game environment asset for 'Channel 0': Room background around the TV. strictly harmonized palette (#161616, #d8d8d8, accent #ff4fd8), style: Hand-drawn static, chicken-scratch lines, greyscale with pink and black missing-texture checks.. No UI text, no characters baked in, crisp game-ready art matching the reference gameplay frame."*
- **Music (`lyria-3-clip-preview`)**:
  > *"Instrumental 30-second loopable game soundtrack for 'Channel 0' (Dependence as a gesture: the only thing you can do is ask the TV for more. The pink placeholders are the gaps the company leaves.). Visual mood: Hand-drawn static, chicken-scratch lines, greyscale with pink and black missing-texture checks.. Purely instrumental, cohesive game loop, no vocals."*

---

## 1. WAY

Channel 0 is a game about **compulsion as a single physical gesture**. You sit in a dark charcoal-drawn bedroom holding a plastic remote pointed at an analog CRT television. Every channel tells you to rely on the broadcast (`"you can stop thinking now"`, `"DO NOT LOOK BACK"`, `"IT IS WATCHING"`, `"WE ALREADY DECIDED FOR YOU"`), while every click tears another piece out of the room's reality—replacing bedroom wallpaper and wood grain with `#ff00dc` / `#000000` Half-Life 2 missing-texture checkerboards and glowing neon-magenta circuit veins.

The Way of the surface is **absolute first-person silence and diegetic truth**:
- The screen shows **only** the room, the curved CRT phosphor glass, the hand holding the remote, and the physical consequences of flipping vs. stillness.
- Interaction lives spatially **on the TV and the remote in your hand**: clicking the upper keypad/screen feeds the broadcast; clicking the lower grip/wrist—or simply **leaving the remote untouched for ~4.5 seconds**—lowers your hand, retracts the magenta rot back into the bezel, and clears the tube to `CH 00`.

---

## 2. OBSTRUCTION

What obstructed the player's direct contact with the work in the first-pass M2 build:
1. **Instructional Spoiler Chrome**: `[SPACE / CLICK] FLIP CHANNEL   [P] PUT REMOTE DOWN` turned an eerie existential realization—*that you can stop pressing the button*—into a mundane keybinding checklist on frame 1.
2. **Post-Mortem Modal Essay Boxes**: `renderTitleOverlay()` (`START`, `HOW TO PLAY [H]`) and `renderEndingOverlay()` (`TAKEN OVER`, `SIGNAL COVERAGE: 100%`, `(Putting the remote down was the one real choice.)`) broke spatial immersion by explaining the theme in a grey box instead of letting the room itself become consumed or healed.
3. **Visual Dishonesty on Key Channels**: A vector clip-art oval eye on `CH 03`, grey studio cutout fringes around the hand, missing horizontal CRT sync-roll on channel switches, and dumping `72%` of the baked room corruption on the very first click destroyed the gradual dread curve of the Omni seed video.

---

## 3. KEEP-CUT LEDGER

Every element audited against the VOIDBASTARD-TAO Element Test (*What current truth does it show? What valid operation does it enable? What consequence or recovery does it expose?*):

| Element | Previous Build | Verdict | Operational Justification |
| :--- | :--- | :---: | :--- |
| Bottom-left HUD bar (`[SPACE/CLICK] FLIP... [P] PUT REMOTE DOWN`) | Persistent text over wooden desk | **CUT** | Fails Law 2, 5, 10: spoils the hidden choice and detaches controls from the physical remote. |
| Full-screen Title Modal (`START` button + `HOW TO PLAY [H]` box) | Web2 overlay box | **CUT / REFORGE** | Replaced in `REST` (`!autostart`) with the actual dark CRT glass showing faint standby phosphor (`CHANNEL 0` / `[ POWER ]`) directly on the tube. |
| `REMOTE SET DOWN` Modal (`(Putting the remote down was the one real choice.)`) | Grey modal box explaining theme | **CUT** | Fails Law 6 & 12: completion must show changed conditions *in the world* (hand lowered out of frame, tendrils retracted, calm `CH 00` window) with zero new demand. |
| `TAKEN OVER` Modal (`SIGNAL COVERAGE: 100%` box) | Centered popup box | **CUT / REFORGE** | Fails Law 6: `FAULT` is shown directly by the zoomed CRT writhing in `"SYSTEM ERROR"` checkerboards + darkened magenta-rimmed hand + diegetic CRT OSD `[R] DEGAUSS` line (Law 8). |
| Vector gradient football eye (`CH 03`) | Flat Canvas gradient oval | **REFORGE** | Replaced with 2-frame 8fps pre-rendered charcoal-crosshatched eye dome, cast lid shadow, radial ink iris, and under-eye creases integrated into the stairwell. |
| Hand & Remote Cutout (`tv_frame_and_remote.png`) | Raw alpha with `#d8d8d8` grey fringe + floating wrist | **REFORGE** | De-fringed pixel-by-pixel (`cleanHandCanvas`), anchored cleanly to bottom-right viewport edge, with spatial hover shifts (poise `-4px` on keypad, ease `+11px` on wrist) and `darkHandCanvas` magenta rim-light at high corruption. |
| Room Corruption Curve | Instant `0.72` alpha dump of `assets.room` on Flip 1 | **REFORGE** | Spotless neighborhood-inpainted `cleanRoomCanvas` for `CH 07` & Flip 1 sync-roll; `0.23s` delayed bezel checker sprouting + perspective desk patches + glowing `#ff2ae5` orthogonal tendrils that retract during stillness. |
| CRT Phosphor OSD (`CH 01`..`CH 08`, captions) | Monospace text inside screen | **KEEP & UPGRADE** | Authentic diegetic broadcast voice from seed video; added barrel-curved CRT Bézier mask, horizontal sync-roll + dark V-blank bar on flips, and flickering `CH 03`/`CH 08` glitch in `SYSTEM ERROR`. |
| Audio Bus (`bgm_loop.mp3` + WebAudio synth) | BGM + click + drone | **KEEP & UPGRADE** | Preserved Lyria 3 loop + crisp plastic button snap, bandpass RF static burst, corruption-linked lowpass sawtooth sub-drone, stillness sine release, and `[R]` degauss thump. |

---

## 4. STATE MAP

| VOID State | Internal Phase | Entry Trigger | Dominant Purpose & World Truth | Valid Spatial / Key Actions | Audio Condition |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **REST** | `title` (non-`?autostart`) | Initial load without `?autostart` | Dormant CRT in dim clean bedroom; standby phosphor etched faintly on dark glass; remote poised low. | Click TV/remote or press `Space`/`Enter`/`Arrows` to ignite cathode. Empty walls inactive (Law 13). | Silent room until first gesture unlocks AudioContext + BGM. |
| **READY** | `ch` (`flips === 0`) | `?autostart` load, power-on from `REST`, or post-`RECOVERY` | Clean charcoal bedroom (`0%` room rot); CRT on `CH 07` (`"you can stop thinking now"`) with small 7-square diagonal `#ff00dc`/`#000000` tear inside tube. | Click TV / upper remote keypad or press `Space`/`Enter`/`Arrows`/`1-8` to flip channel. | Lyria `bgm_loop.mp3` at `0.34`, sub-drone at `0.0`. |
| **WORKING** | `ch` / `spill` (`syncTear > 0.08`) | Immediate `0.44s` window upon any channel flip | Thumb depresses rubber remote button + IR flash; CRT tube rolls through wavy horizontal VHS/CRT sync-shear, white right-edge sync-curl, and dark V-blank bar (`pair_002`). | Additional rapid clicks stack flips or release into settle. | Sharp square-wave plastic click + bandpass RF static burst. |
| **CHANGED** | `ch` / `spill` (`flips >= 1`) | Sync-roll settles on `CH 01`..`CH 08` (`1..9` flips) | Escalating world consequence: bezel `#ff00dc`/`#000000` checker clusters, foreshortened desk patches, glowing `#ff2ae5` wall tendrils, camera zoom (`1.00x -> 1.13x`), and hand darkening into magenta-rimmed shadow (`pair_005`, `pair_008`). After `2.45s` untouched, hand begins easing down & tendrils start receding. | Upper remote/TV: flip (`Space`/`Arrows`/`1-8`). Lower remote wrist click, `[P]`/`Esc`, `ArrowDown` hold (`0.42s`), or **`4.5s` untouched stillness**: put remote down. | Rising `55Hz` sawtooth sub-drone (`lp 135->455Hz`); relaxes if untouched `>2.45s`. |
| **COMPLETE** | `complete` (`endingKind: 'put_down'`) | `4.5s` untouched stillness, wrist click, `[P]`, or `ArrowDown` hold | Hand & remote lower completely out of frame; magenta tendrils & checker clusters retract into CRT bezel; bedroom returns to clean charcoal; CRT clears to calm `CH 00` window stillness. Creates **no new demand** (Law 12). | Rest quietly, or click TV / `Space` to pick remote back up, or `[R]` for fresh seed. | Warm descending sine sigh (`392->196Hz`); sub-drone fades to `0`; quiet BGM. |
| **FAULT** | `end` (`endingKind: 'taken_over'`) | Compulsive flipping reaches `flips >= 10` | Full broadcast consumption: zoomed CRT engulfed in writhing horizontally-sheared `#ff00dc`/`#000000` checkerboard + `"SYSTEM ERROR"`; walls covered in neon-magenta circuits; dark silhouetted hand locked in glare. | Diegetic CRT OSD exposes `[R] DEGAUSS` (or click CRT screen) ONLY in `FAULT` (Law 4, 8, 14). | Saturated `455Hz` sawtooth drone + continuous static hum. |
| **RECOVERY** | `recovery` (`0.42s`) | Pressing `[R]` or clicking screen during `FAULT` | CRT tube collapses horizontally into a bright phosphor line -> center dot while missing-texture rot purges back to zero, transitioning cleanly to `READY`. | Automatic `0.42s` hardware degauss transition -> `READY`. | Low `110->42Hz` triangle degauss thump + drone cut. |

---

## 5. WIREFRAMES

### A. `READY` (`CH 07` — Spotless Bedroom, Center Open, Spatial Zones Only)
```text
+--------------------------------------------------------------------------+
|  [Inactive Wall]    |      CLEAN CHARCOAL WALLPAPER     | [Inactive Wall]|
|                     |   +---------------------------+   |                |
|                     |   |  +-------------------+ o  |   |                |
|                     |   |  |            CH 07  | o  |   |                |
|                     |   |  |      [#][ ]       | .. |   |                |
|                     |   |  |        [ ][#]     | == |   |                |
|                     |   |  |  "you can stop    | == |   |                |
|                     |   |  |   thinking now"   |    |   |                |
|                     |   |  +-------------------+    |   |                |
|                     |   +---------------------------+   |                |
|                     |  =====[TV/UPPER REMOTE: FLIP]=====+------+         |
|                     |        [VCR Deck]                  \ [o]  \        |
|                     |                                     \      \       |
|  (ZERO HUD TEXT)    |                                      \[WRIST:LOWER]|
+--------------------------------------------------------------------------+
```

### B. `CHANGED` -> `FAULT` (`CH 03` Charcoal Eye -> `SYSTEM ERROR` Surge)
```text
+--------------------------------------------------------------------------+
|  ~~~#ff2ae5~~~+##+  |   +##+       +##+        +##+     |  +~~#ff2ae5~~~ |
|       |       |##|  |   |##+-------------------+###+    |  |             |
|   +---+      +###+  |   |  |            CH 03  | o |    |  +----+        |
|              |##|   |   |  |    _.-""""-._     | o |    |       |        |
|              +--+   |   |  |  .'  ( (@) ) '.   |===|    |     +##+       |
|                     |   |  |   '-..____..-'    |===|    |     |##|       |
|                     |   |  |  "IT IS WATCHING" |   |    |                |
|                     |   |  +-------------------+   |    |                |
|                     |  =+###+===================+##+====+------+         |
|                     |  /####/ (Perspective Desk Check)   \##### \ (Dark  |
|                     |                                     \######\ Rim   |
|                     |   [FAULT ONLY OSD: "[R] DEGAUSS"]    \######\Hand) |
+--------------------------------------------------------------------------+
```

### C. `COMPLETE` (`CH 00` — Remote Lowered via ~4.5s Stillness or Wrist Click)
```text
+--------------------------------------------------------------------------+
|                     |      CLEAN RESTORED WALLPAPER     |                |
|                     |   +---------------------------+   |                |
|                     |   |  +-------------------+ o  |   |                |
|                     |   |  |            CH 00  | o  |   |                |
|                     |   |  |     +---+---+     | .. |   |                |
|                     |   |  |     |   | ) |     | == |   |                |
|                     |   |  |     +---+---+     | == |   |                |
|                     |   |  |                   |    |   |                |
|                     |   |  +-------------------+    |   |                |
|                     |  ==================================                |
|                     |        [VCR Deck]                                  |
|                     |                                                    |
|                     |      (Hand & Remote Lowered Out of Frame;          |
|                     |       Zero Modal Box; Zero New Demand)             |
+--------------------------------------------------------------------------+
```

---

## 6. VOID CONTRACT

1. **Law 1 (Begin Empty)**: No floating HUD, score counters, keybind legends, or tutorial boxes exist anywhere in the DOM or Canvas.
2. **Law 2 (Present Operation Only)**: Only the room, the active CRT broadcast, and the physical remote in hand are rendered during play.
3. **Law 3 (One State = One Dominant Purpose)**: Flipping feeds the signal; stillness starves it.
4. **Law 4 (Display Actions Only While Valid)**: `[ POWER ]` phosphor appears only in `REST`; `[R] DEGAUSS` phosphor appears inside the CRT OSD **only** during `FAULT` (`flips >= 10` + `0.5s` settle).
5. **Law 5 (Spatial Controls Beside What They Change)**: Clicking the CRT or upper remote keypad depresses the button and flips channels; hovering/clicking the lower remote grip/wrist physically eases the hand downward to put the remote down.
6. **Law 6 (World Consequence Over Banners)**: Both endings (`COMPLETE` stillness on `CH 00` and `FAULT` `SYSTEM ERROR` consumption) transform the bedroom, lighting, zoom, and CRT tube directly—zero modal banners.
7. **Law 7 & 12 (Interruptibility & Quiet Completion)**: At any moment before `FAULT`, ceasing input for `4.5s` (or clicking the wrist / pressing `P`) halts corruption, retracts tendrils into the bezel, and settles on `CH 00` without nagging the player to restart.
8. **Law 8 & 14 (Recovery & Accessibility)**: Full keyboard parity (`Space`/`Enter`/`Arrows`/`1-8` flip, `P`/`Esc`/`ArrowDown`-hold lower, `R` degauss recovery) and clean `[R] DEGAUSS` recovery from `FAULT`.
9. **Law 11 (Motion Reports Real Change)**: Every CRT sync-tear, remote thumb depression, subtle `2.45s..4.5s` stillness hand-drop, and tendril retraction directly reflects underlying state variables (`syncTear`, `remoteClickAnim`, `remoteDropAnim`, `visualCorruption`).
10. **Law 13 (Empty Regions Inactive)**: Clicking empty bedroom walls outside the TV cabinet and physical remote triggers nothing and shows `cursor: default`.

---

## 7. FAILURE

- **Compulsive Over-Flipping (`FAULT`)**: Flipping 10 times drives `corruption` to `1.0`. Rather than punishing the player with a "GAME OVER" dialog box, the CRT locks into writhing, scanline-sheared `#ff00dc`/`#000000` missing-texture checkerboards (`"SYSTEM ERROR"`), zoomed claustrophobically close while the hand is swallowed in dark magenta-rimmed shadow. After `0.5s`, the CRT's bottom OSD line flickers `[R] DEGAUSS`, enabling a hardware cathode-collapse reset (`RECOVERY -> READY`).
- **Headless / Autoplay Audio Lock**: `bgm_loop.mp3` and `AudioContext` wrap `.play()` and `.resume()` in promise guards and unlock cleanly on the first keyboard or pointer event without throwing console errors.
- **Asset Load Sequencing**: Offscreen processing (`cleanRoomCanvas`, `cleanHandCanvas`, `darkHandCanvas`, `eyeFrames`) gates on `assets.readyCount === 3` with graceful fallback drawing if inspected mid-load.

---

## 8. IMPLEMENTATION

### Rebuilt Files
- [index.html](file://projects/g16/m2/game/index.html):
  - **Neighborhood-Inpainted Clean Room (`cleanRoomCanvas`)**: Dilates and removes both `#ff00dc` pink pixels and baked pure-black checker blocks from `room_background_around_the_tv.png`, sampling clean vertical/horizontal neighbor strips + charcoal grain and restoring the TV's lower right dial, speaker grille slats, and under-desk VCR deck.
  - **De-Fringed Hand & Nocturnal Rim Silhouette (`cleanHandCanvas`, `darkHandCanvas`)**: Strips `#d8d8d8` cutout halo pixels (`[157, 157, 154]`) from `tv_frame_and_remote.png`, clamps outer ink contours to `#1a191a`, and synthesizes a directional neon-magenta (`#ff44e0`) top-edge rim highlight for high-corruption states (`pair_008`).
  - **2-Frame Boiling Charcoal Eye (`eyeFrames` + `drawCharcoalWatchingEye`)**: Pre-renders 200+ organic curved graphite strokes for the spherical upper brow dome and crosshatched lower eye bag, layered over a shaded almond sclera, 48-fiber radial charcoal iris, cast upper-lid shadow, and multi-pass ink creases synchronized to stay wide open at `t = 5.0s` (`pair_005`).
  - **Barrel-Curved CRT & Analog Sync-Roll (`crtBuf` + `renderCrtScreenContent`)**: Clips to a bowed CRT Bézier contour, slices incoming channels into `6px` horizontal scan-strips with sinusoidal/stepped horizontal sync-shear, overlays RF interference waves, white right-edge sync-curl sawtooths, and a `26px` rolling dark V-blank bar on every flip (`pair_002`), and blends Nano Banana's 2-frame glitched CRT checkerboards (`(0,1)` & `(3,1)` from `8_channel_loops_still_or_2_frame.png`) with scanline-sheared `#ff00dc`/`#000000` tiles for `CH 08` / `SYSTEM ERROR` (`pair_008`).
  - **Observable State (`window.__game.state`)**: Exposes `{ voidState, phase, endingKind, channelIndex, channelNumber, caption, flips, corruption, syncTear, remoteDrop, idleSeconds, glitchCount, tendrilCount, fps }`.
- [play.mjs](file://projects/g16/m2/game/play.mjs):
  - Choreographs flips at `[1820, 4120, 5650, 6180, 6680, 7150, 7600]` ms and then holds complete untouched stillness from `7.60s` to `14.0s`, aligning `t = 2s` (`CH 01` sync-roll in clean room), `t = 5s` (`CH 03` wide-open charcoal eye + bezel tendrils), `t = 8s` (`CH 08` `"SYSTEM ERROR"` checker takeover + dark magenta-rimmed hand), and `t = 8.0s..14.0s` (natural `4.5s` stillness lowering the remote and clearing to `CH 00`).

### Verification Proof (`run_pipeline.py --project g16 --milestone m2 --stages verify`)
- **Capture Metrics**: `playtest/take.mp4` — **`782 frames, 13.9 s, 56.2 fps, 0 console errors`** (prior pass `818 frames, 13.9 s, 59.0 fps, 0 console errors`); `playtest/best.mp4` (`4.75s -> 12.75s`, score `0.0215`).
- **Side-by-Side Visual Proof Inspected**:
  - [pair_002.00.jpg](file://projects/g16/m2/pairs/pair_002.00.jpg): Pure warm-charcoal uncorrupted bedroom, zero HUD bar, de-fringed hand depressing remote button, and wavy analog CRT horizontal sync-roll + dark V-blank sync bar + white right-edge hold-loss curls on `CH 01` (`"DO NOT LOOK BACK"`).
  - [pair_005.00.jpg](file://projects/g16/m2/pairs/pair_005.00.jpg): Heavy-lidded, hand-crosshatched charcoal watching eye integrated seamlessly into the stairwell on `CH 03` (`"IT IS WATCHING"`), framed by bezel-hugging `#ff00dc`/`#000000` checker clusters and glowing `#ff2ae5` orthogonal wireframe tendrils.
  - [pair_008.00.jpg](file://projects/g16/m2/pairs/pair_008.00.jpg): Claustrophobic push-in onto dense horizontally-sheared `#ff00dc`/`#000000` missing-texture checkerboard takeover (`"SYSTEM ERROR"`), perspective tabletop checker patches, wall circuit tendrils, and darkened backlit hand with a crisp neon-magenta rim highlight—followed from `t = 8.0s -> 14.0s` by untouched stillness lowering the remote out of frame and healing the room to `CH 00`.

