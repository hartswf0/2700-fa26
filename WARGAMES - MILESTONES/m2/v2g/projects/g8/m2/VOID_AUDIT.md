# VOID_AUDIT — Group 8: That One Team (M2)

**Engine**: VOIDBASTARD-TAO (Operational Emptiness Engine)  
**Scope**: `projects/g8/m2/`  
**Verification**: `824 frames, 13.9 s, 59.3 fps, 0 console errors` (`best_window`: `1.00 s -> 9.00 s`, score `0.0196`)

---

## 0. HONEST VIDEO-VS-GAME CRITIQUE & GEMINI PROVENANCE

### A. Brutally Honest Critique of the Prior M2 Build vs. `study/sheet.jpg`
Inspecting the prior M2 HTML5 build (`pairs/pair_002.00.jpg`, `pair_005.00.jpg`, `pair_008.00.jpg`) against the Gemini Omni 1.2 Flash seed clip (`video/gameplay.mp4` / `study/sheet.jpg`) exposed five severe failures:

1. **Detached & Colliding Text Clutter (Violated Laws 1, 2, 3, 5, 6)**:
   - Top-right bureaucratic labels (`SECTOR 01 · FULLGRANT / ALL MOVEMENT SYSTEMS ONLINE`, `SECTOR 02 · HEAVIER AIR / GLIDE OFFLINE — RELY ON DASH, DOUBLE JUMP & WALL KICK`) were absent from the video and physically collided right across the `GLIDE` HUD box in `pair_005.00.jpg` and `pair_008.00.jpg`.
   - Crossing a threshold arch spawned a heavy `660×66` bottom-center text modal (`GLIDE REVOKED — AIRFOIL PRIVILEGE RECLAIMED`) and froze progression for `1.05s`, whereas `sheet.jpg` (`f_019..f_025`) communicates ability loss purely through the arch's radial golden detonation, aura detachment, glyph fracture, and real-time world desaturation.
   - Room resets slapped a full-screen `ROOM RESET` black modal over the canvas, and `title` stacked four lines of instructional copy across the center.
2. **Unclean Sprite Alpha Cutouts & Studio-Grey Pockets**:
   - Pixel inspection of the prior cutouts on `#14121c` dark sky revealed exterior flood-fill had missed enclosed `#cccccc`–`#d3d3d3` studio-grey pockets and anti-aliased edge fringes:
     - `player_sprite_with_ability_states.png`: `1,115` opaque studio-grey pixels + `4,547` semi-grey fringe pixels, purple-blended bright slits trapped under the armpits/legs in rows 3–4, and a hard opaque cream sticker rim around rows 1–2.
     - `sound_set_that_thins_out.png`: `5,844` opaque `#d1d1d1` studio pixels trapped inside the concentric golden and violet hologram rings atop Speakers 1 & 2 (visibly glowing as a grey blob behind the player in old `pair_005.00.jpg`), plus grey box fringes around the tiny floating pixels above Speakers 3–5.
     - `tile_set_colour_and_greyscale_versions.png`: `26,077` opaque studio-grey pixels trapped inside chain-link loops and rubble gaps, plus pale white sparkle halos around Row-1 diamond crystals (`y=37`).
3. **Repetitive Checkerboard Tile Wallpaper vs. Sculpted Architecture**:
   - Large cliffs repeated `darkFill` in a visible `64×64` purple square grid, and floating islands repeated `island2` jagged bottoms four times side-by-side instead of sculpting tapered stalactite underbellies (`f_005.jpg`, `f_014.jpg`) and seamless weathered ashlar stone courses (`f_027.jpg`).
4. **Disconnected Scene Cuts, Flat Zoom, & Broken `t=8.00s` Pacing**:
   - The prior build split the game into five teleporting level cuts with a static `camY` and tiny `~78px` runner. By `t=8.00s` (`pair_008.00.jpg`), the Omni video had already detonated the arch, vanished the HUD, and transitioned into a haunting monochrome stone run, while the old game was still stuck in purple Sector 2.
5. **Shallow Audio Subtraction**:
   - Only `bgm.volume` stepped down; `bgm_loop.mp3` lacked frequency filtering and lacked the prompt's layer-by-layer synth arpeggio stem subtraction.

### B. What Was Rebuilt & Fixed
- **VFX Color-Unmixed Alpha Cleaning**: Re-derived `player_sprite_with_ability_states.png`, `tile_set_colour_and_greyscale_versions.png`, and `sound_set_that_thins_out.png` from `*_raw.png` using connected-component studio-pocket detection, boundary foreground unmixing (`C = αF + (1−α)BG`), armpit-slit clearing, and soft golden rim falloff; switched crystal pickups to the crisp black-outlined Row-2 sprites (`y=115`).
- **Continuous Unbroken Architectural World (`WORLD_W = 4920`, `ZOOM = 1.22`)**: Rebuilt all five levels as five contiguous sectors in a single unbroken camera shot separated by monumental Threshold Arches (`x = 2020, 2630, 3220, 3780`) and a final silent stone doorway (`x = 4680`), with sculpted stalactite islands, a towering vertical violet monolith column, and seamless weathered ashlar stone slabs in monochrome.
- **Pure Top-Left Fracturing Glyphs**: Cut all sector titles, subtitles, bottom revoke cards, and reset banners. Only `DASH`, `DOUBLE`, `WALL`, `GLIDE` remain at top-left; each physically cracks, crosses out, and bursts 24 tumbling screen-space shards when surrendered, then dissolves completely (`alpha -> 0`) upon entering the monochrome `LAST WALK` (`pair_008.00.jpg`).
- **Celeste-Grade Movement & Multi-Layer Audio Subtraction**: Added `0.12s` coyote time, `0.12s` jump buffering, variable jump cut, apex hang-time boost, corner-nudge forgiveness, spring squash/stretch, hit-stop micro-freezes, golden crescent dash auras, concentric violet double-jump shockwaves, WebAudio Biquad low-pass filtering on `../assets/bgm_loop.mp3` (`18 kHz -> 4.6 kHz -> 1.75 kHz -> 620 Hz -> silent`), and a 4-stem D-minor synth arpeggio whose instruments drop out one-by-one as each ability is surrendered.

### C. Honest Accounting of Remaining Video-vs-Game Differences
We refuse to claim fake "identical" perfection between a generative video model and a real-time 2D HTML5 game:
1. **Neural Fluid VFX vs. Real-Time Canvas2D Primitives**: `gemini-omni-1.2-flash` paints per-frame volumetric portal rays, organic plasma dash ribbons, and painterly lighting transitions across surfaces. Our 60fps Canvas2D renderer approximates these honestly with radial gradients, rotating crescent arcs, tapered polyline ribbons, and discrete sprite frames.
2. **Prompt-Hallucinated `#14121c` Text in Video vs. True `DASH` Glyph**: In `study/sheet.jpg` (`f_001..f_020`), Omni 1.2 Flash leaked the literal background hex code `#14121c` from its prompt into the leftmost HUD box instead of `DASH` (from `refs/m2_main_ref.png`). Following VOIDBASTARD-TAO Law 14, our game displays the true operable glyph `DASH`.
3. **Four Playable Subtraction Arches vs. Single Video Transition**: The 10s seed video compresses the concept into one dramatic arch transition (`t ≈ 5.0s`) from vivid movement directly to monochrome stone. Because `spec.json` mandates surrendering four distinct abilities (`GLIDE`, `WALL`, `DOUBLE`, `DASH`) across five playable stages before `LAST WALK`, our continuous world includes three compact mid-run subtraction sectors (`Sectors 1–3`, `t ≈ 5.1s..7.6s`) featuring diegetic `sound_set_that_thins_out.png` monoliths before emerging into pure HUD-free monochrome by `t = 8.0s`.

### D. Complete Gemini Asset & Video Provenance (API Keys Redacted/None Present)

| Stage / Asset | Timestamp (UTC) | Model | Interaction ID | Elapsed | Output Files | Reference Frames |
|---|---|---|---|---:|---|---|
| Seed Gameplay Video (`gameplay`) | `2026-11-18T15:20:32Z` | `gemini-omni-1.2-flash` | `v1_ChZQY0w5YXM2RURyZWhvX1VQeHZhTGNBEhZQY0w5YXM2RURyZWhvX1VQeHZhTGNB` | `44.71s` | `video/gameplay.mp4` | `refs/m2_main_ref.png` |
| `player_sprite_with_ability_states` | `2026-11-18T15:21:04Z` | `gemini-nano-banana-2.1` | `v1_ChdRc0w5YXBmRkJ2T3V4ZElQNS12Yy1RcxIXUXNMOWFwZkZCdk91eGRJUDUtdmMtUXM` | `30.20s` | `assets/player_sprite_with_ability_states_raw.png`, `assets/player_sprite_with_ability_states.png` | `study/f_014.jpg`, `study/f_027.jpg` |
| `tile_set_colour_and_greyscale_versions` | `2026-11-18T15:21:29Z` | `gemini-nano-banana-2.1` | `v1_ChdZTUw5YXRmZEZwT214ZElQdG82dGdRMBIXWU1MOWF0ZmRGcE9teGRJUHRvNnRnUTA` | `25.73s` | `assets/tile_set_colour_and_greyscale_versions_raw.png`, `assets/tile_set_colour_and_greyscale_versions.png` | `study/f_014.jpg`, `study/f_027.jpg` |
| `sound_set_that_thins_out` | `2026-11-18T15:21:47Z` | `gemini-nano-banana-2.1` | `v1_Chdlc0w5YXBmS0E5dUcxc2dQcVlXb2tBVRIXZXNMOWFwZktBOXVHMXNnUHFZV29rQVU` | `17.36s` | `assets/sound_set_that_thins_out_raw.png`, `assets/sound_set_that_thins_out.png` | `study/f_014.jpg`, `study/f_027.jpg` |
| `bgm_loop` | `2026-11-18T15:21:58Z` | `lyria-3-clip-preview` | `v1_ChdpOEw5YXZ5ZUdOYTB4ZElQeVpmMGlROBIXaThMOWF2eWVHTmEweGRJUHlaZjBpUTg` | `11.29s` | `assets/bgm_loop.mp3` | `study/f_014.jpg` |

**Exact Prompts Logged**:
- **Video (`gemini-omni-1.2-flash`)**: `"Stylized geometric 2D platformer beginning in vivid golden yellow (#ffd84a) and violet (#7b3fe4) against deep night (#14121c). Smooth side-scrolling camera. A nimble blocky runner chains an energetic air-dash, double-jump, and wall-slide across floating platforms; upon crossing a threshold arch, one glowing ability aura detaches and vanishes, the world's saturation visibly drains a step toward quiet charcoal grey, and the runner continues with heavier, grounded leaps. Continuous unbroken gameplay shot, no scene cuts, no HUD text. Use the reference image for platform silhouettes and palette. Sound design: bright synth arpeggio losing instruments layer by layer. No dialogue."`
- **Sprites (`gemini-nano-banana-2.1`)**: `"Isolated 2D game sprite sheet / prop for \"That One Team\": <Label>. Centered full silhouette, isolated on a flat uniform light grey studio background (#d8d8d8), even lighting, zero drop shadow, no text, strictly harmonized palette (#ffd84a, #1a1a1a, accent #7b3fe4), style: Bright blocky shapes at the start, draining to dark and silent., matching the reference gameplay frame."`
- **Music (`lyria-3-clip-preview`)**: `"Instrumental 30-second loopable game soundtrack for \"That One Team\" (Power handed to you by a controlling AI is power it can take back. Each level is designed around the ability that is gone.). Visual mood: Bright blocky shapes at the start, draining to dark and silent.. Purely instrumental, cohesive game loop, no vocals."`

---

## 1. WAY
*That One Team* is an operational poem of subtraction: the player begins in radiant gold and violet possessing every movement verb (`DASH`, `DOUBLE`, `WALL`, `GLIDE`) and surrenders them one by one through monumental Threshold Arches until colour, music, jumping, and the HUD itself vanish—leaving only a quiet, grounded walk across dark stone to a silent doorway. Every pixel and audio stem must physically embody what still remains right now, and nothing more.

---

## 2. OBSTRUCTION
The prior interface distrusted its own world:
- It narrated subtraction in prose (`SECTOR 02 · HEAVIER AIR`, `GLIDE OFFLINE — RELY ON...`, `GLIDE REVOKED — AIRFOIL PRIVILEGE RECLAIMED`) instead of letting the player *feel* heavier gravity, *hear* the upper bell stem vanish, and *watch* the glyph fracture and saturation drain.
- It broke spatial continuity with hard scene cuts and full-screen `ROOM RESET` modals that stole focus from the runner's body.
- Leftover `#d8d8d8` studio-grey pockets inside sprites betrayed the illusion of a deep `#14121c` void.

---

## 3. KEEP-CUT LEDGER

| Surface / Element | Verdict | VOIDBASTARD-TAO Law & Rationale |
|---|---|---|
| Top-left 4 Ability Glyphs (`DASH`, `DOUBLE`, `WALL`, `GLIDE`) | **KEEP & FRACTURE** | Laws 2, 4, 6, 11: Shows exact remaining movement capabilities; cracks, crosses out, bursts shards on loss, and dissolves to `0` opacity when all abilities are gone. |
| Top-right `SECTOR 0X` title & offline instruction subtitle | **CUT** | Laws 1, 2, 6: Pure bureaucratic narration that collided with the `GLIDE` glyph box; world saturation and architecture already show sector progression. |
| Bottom `660×66` `ABILITY REVOKED` banner card | **CUT** | Laws 3, 6, 11: Replaced by in-world golden shockwave sphere, rising detached ability orb, hit-stop, stem drop, and physical glyph fracture. |
| Full-screen `ROOM RESET` black text overlay | **CUT** | Laws 6, 8, 11: Replaced by immediate particle shatter & reform at the active sector's Threshold Arch checkpoint. |
| Multi-line `TITLE` keybinding paragraph & dark veil | **CUT** | Laws 1, 3, 5: Replaced by live breathing world, open `THAT ONE TEAM` header, and a spatial `[SPACE]` cue directly above the runner. |
| End-screen verbose paragraph (`NOTHING LEFT TO TAKE...`) | **CUT** | Law 12 (Completion creates no new demand) & Law 8: Runner sits quietly at the final doorway (`monoSit1 -> monoSit2`); after stillness settles, a dim spatial `[R]` appears above the runner. |
| `[P]` / `[Esc]` Pause & `[R]` Checkpoint/Full Retry | **KEEP (CONDITIONAL)** | Laws 4, 7, 8, 14: Invisible during active flow; `[P]` exposes clean `[P] RESUME  [R] RETRY` only while paused. |
| Diegetic Sound Monoliths (`sound_set_that_thins_out.png`) | **KEEP (CLEANED)** | Law 6: World-anchored towers physically lose their golden/violet holographic rings alongside the WebAudio stem & low-pass subtraction. |
| Scanline white-stripe overlay | **CUT** | Law 13: Added muddiness over monochrome stone; kept only clean radial vignette matching `sheet.jpg`. |

---

## 4. STATE MAP

| Canonical TAO State | `window.__game.state.mode` | Dominant Purpose & Valid Action | Visual & Audio Truth |
|---|---|---|---|
| **REST** | `title` (manual open without `?autostart`) | Observe the vivid starting corridor; press `[SPACE]` / move / click to begin. | Live world idling; `THAT ONE TEAM` in open upper sky; `[SPACE]` bobbing beside runner; HUD hidden until active. |
| **READY** | `lvl` (grounded at sector start / ledge) | Read upcoming gap/wall/spikes against active top-left glyphs; initiate run, jump, or dash. | Crisp active glyphs lit `#f2f2f2`; surrendered glyphs scarred & dimmed; world saturation & music stems match current sector (`1.00`, `0.68`, `0.36`, `0.12`). |
| **WORKING** | `lvl` (airborne / dashing / wall-sliding / gliding) & `walk` | Chain valid movement verbs across void gaps (`lvl`), or walk steadily across monochrome stone (`walk`). `[P]` pauses; `[R]` retries. | Golden crescent dash aura, violet double-jump rings, wall-slide sparks, or billowing monochrome stone dust + lonely footsteps (`walk`, HUD dissolved to `0`). |
| **CHANGED** | `take` (crossing Threshold Arch `0..3`) | Witness irreversible surrender of one ability while momentum carries runner smoothly through the arch. | `32ms` hit-stop -> `0.55x` slow-mo glide; radial golden sphere; detached orb rises to keystone; glyph cracks & sheds 24 shards; saturation & BGM filter step down; 1 synth stem mutes. |
| **COMPLETE** | `end` (final doorway at `x = 4680`) | Rest in stillness; zero new demand. Optional `[R]` / `[SPACE]` to begin again. | Monochrome silence; runner transitions `monoSit1 -> monoSit2` at the dark portal; faint `[R]` appears above runner after `1.2s`. |
| **FAULT** | Hazard spike contact or pit fall (`y > H + 120`) | Immediate consequence feedback at the point of failure. | Camera micro-shake + burst of 26 motes at impact point + low triangle reset tone (`0` blocking text banners). |
| **RECOVERY** | `reset` (`0.26s`) & `[P]` Pause | Return runner cleanly to current sector's entrance arch checkpoint, or resume/retry from pause. | Camera glides back to `SECTORS[currentSector].checkpoint`; runner reforms with spring stretch and particles, immediately operable. |

---

## 5. WIREFRAMES

### A. Active Vivid Play (`WORKING` / `CHANGED` — Sectors 0–3)
```text
+--------------------------------------------------------------------------------+
|  [   DASH   ]  [  DOUBLE  ]  [   WALL   ]  [ --GLIDE-- ]                       |
|                                              \ . * .  (falling glyph shards)   |
|  ==============+                              *                                |
|  \  /\  [■][■] |     (open night sky, faint constellations & monoliths)        |
|   \/  \   ||   +                                            /\                 |
|   >>      ||             _o_  (golden crescent dash)       /◊ \                |
|          _o_           (( ■ )) ~ ~ ~ o                    |    | (Threshold    |
|  =======/▲▲▲\==          / \       ~~~       +----+       |    |  Arch)        |
|                |        +----------+         |    |  +----+====+----+          |
|                |         \  purple /         |wall|  | stone ledge  |          |
|                           \ keel  /          |    |  |              |          |
+--------------------------------------------------------------------------------+
```

### B. Monochrome `LAST WALK` & `COMPLETE` (`Sector 4` -> `end`)
```text
+--------------------------------------------------------------------------------+
|                                                                                |
|            . *---.                    ||                  .---*                |
|             \   /    (empty sky —     ||                 /                     |
|              *        zero HUD)       ||                                       |
|                                                                /\              |
|                                                               /  \             |
|                       [■]                                    |    |            |
|                 o o  _/|\_           [dead]                  |dark|            |
|               o o o   / \            [spkr]                  |door|            |
|  ==================================||========================================  |
|  weathered ashlar stone causeway   ||     silent monochrome (`0%` sat, `0` BGM)|
+--------------------------------------------------------------------------------+
```

---

## 6. VOID CONTRACT
1. **Center & Sky Sovereignty**: Never place persistent text banners, sector titles, score counters, or modal dialogs anywhere in the sky or center viewport.
2. **Four Glyphs -> Zero Glyphs**: Top-left holds at most four ability glyphs (`DASH`, `DOUBLE`, `WALL`, `GLIDE`). Once all four are surrendered, they dissolve completely (`hudWalkDissolve -> 0`) so `LAST WALK` is completely chrome-free (holding `[Tab]` momentarily ghosts them at `0.35` alpha if inspected).
3. **World-Anchored Consequence**: Every subtraction is simultaneously spatial (Threshold Arch detonation + detached orb + Sound Monolith decay), chromatic (`saturate()` + palette swap to ashlar stone & matte stone-grey runner), kinetic (loss of movement verb + slightly heavier stride), and sonic (`bgm_loop.mp3` Biquad low-pass + 4-stem arpeggio dropout).
4. **Spatial Prompts Only When Valid**: `[SPACE]` appears above the runner only in `title`; `[R]` appears above the runner only after settling in `end`; `[P] RESUME  [R] RETRY` appears only while paused.

---

## 7. FAILURE
- **Asset Load Failure**: Every `drawSprite` call returns `false` if an image is incomplete or fails, gracefully falling back to harmonized geometric silhouettes (`PAL.gold` / `#80828a` runner, bevelled stone/violet platform fills, vector spikes) with zero uncaught exceptions.
- **Browser Audio Autoplay / CORS Restrictions**: `AudioContext` creation, `resume()`, `createMediaElementSource(bgm)`, and `bgm.play()` are guarded inside `try / catch` and `.catch(() => {})` on user/keyboard gesture, falling back cleanly to `HTMLAudioElement.volume` modulation if `MediaElementSource` is restricted, guaranteeing `0 console errors`.
- **Platformer Corner Snags & Softlocks**: Every gap in Sectors 1–3 is tuned strictly within the horizontal reach of the remaining abilities (`<= 235px` single-jump reach when `DOUBLE` is gone), upward jumps apply `9px` corner-nudge forgiveness, wall-kicks refresh double-jump when `DOUBLE` is still owned, and `[R]` provides instant checkpoint recovery at any moment.

---

## 8. IMPLEMENTATION
- **Cleaned Assets** (`projects/g8/m2/assets/`):
  - `player_sprite_with_ability_states.png` — studio-grey interior pockets & purple-blended armpit slits removed, pale sticker border softened into a subtle warm golden glow.
  - `tile_set_colour_and_greyscale_versions.png` — enclosed studio-grey chain loops and edge fringes unmixed; Row-2 black-outlined crystals wired into atlas.
  - `sound_set_that_thins_out.png` — enclosed `#d1d1d1` pockets inside Speaker 1 & 2 holographic rings and floating pixel halos stripped cleanly.
- **Playable Build** (`projects/g8/m2/game/index.html`):
  - Single-file `1280×720` (`ZOOM = 1.22`) Canvas2D + WebAudio engine supporting `?autostart`, `?seed=N` deterministic Mulberry32 PRNG, `<link rel="icon" href="data:,">`, `../assets/bgm_loop.mp3` Biquad low-pass subtraction, 4-stem synth arpeggio, Celeste-grade movement physics, fracturing top-left glyphs, continuous 5-sector world, and rich `window.__game.state` telemetry.
- **Automated Playtest Driver** (`projects/g8/m2/game/play.mjs`):
  - Telemetry-driven keyboard player (`ArrowRight`, `Space`, `ShiftLeft`) demonstrating corridor spike hop, mouth burst chain, floating island glides, vertical violet monolith wall-slide/wall-kick/vault, consecutive Threshold Arch surrenders with fracturing glyphs, and the silent monochrome `LAST WALK` across the 14s capture window.
- **Verification Output** (`projects/g8/m2/playtest/` & `projects/g8/m2/pairs/`):
  - `take.mp4`: `824 frames, 13.9 s, 59.3 fps, 0 console errors`
  - `best.mp4`: `1.00 s -> 9.00 s` (`score 0.0196`)
  - Side-by-side proof pairs verified at `pairs/pair_002.00.jpg`, `pairs/pair_005.00.jpg`, and `pairs/pair_008.00.jpg`.
