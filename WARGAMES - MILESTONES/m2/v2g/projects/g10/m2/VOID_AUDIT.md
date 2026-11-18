# VOID_AUDIT — Group 10: Lab-Rat-ory (`g10/m2`)

**Engine:** VOIDBASTARD-TAO (Operational Emptiness Engine)  
**Axiom:** *Show only what is true now. Every visible element is a claim about what matters now.*

---

## 0. HONEST VIDEO-VS-GAME CRITIQUE & GEMINI PROVENANCE

### Brutally Honest Diff: Previous `game/index.html` vs. Seed Video (`video/gameplay.mp4` / `study/sheet.jpg`)

1. **Severe Trapped Studio-Grey Cutout Islands & Halo Fringes (`assets/*.png`)**:
   - Because `cutout.py` only flood-filled from the outer border of each `1024×1024` sheet, multi-sprite sheets retained massive amounts of `#d8d8d8` / `#cdcdcd` studio-grey pixels and anti-aliased grey fringes:
     - `key_cheese_trap_needles.png` retained **11,955 trapped studio-grey pixels** (`13,653` including boundary fringe): the circular bow ring of the key was a solid opaque light-grey disc (`1,410 px`), and all 13 wire-loop/spring openings in both mouse traps were filled with bright grey blobs (`pairs/pair_002.00.jpg`, `pair_005.00.jpg`, `pair_008.00.jpg`).
     - `human_hand_shadow_hazard.png` retained **3,005 trapped studio-grey pixels** (`4,738` with fringe) wedged between adjacent fingertips plus a bright grey/coral outline around all 5 hands.
     - `rat_sprite_at_4_resolutions.png` retained **4,940 grey fringe pixels** (`6,811` total) along whiskers, paws, and tails, and the naive `buildPaleRatSheet` desaturated all pixels `lum > 42` into flat chalky grey-white, erasing the rosy pink ears, snout, paws, and tail seen in `study/sheet.jpg`.
2. **Opaque Red-Lit Hand Sprite vs. Translucent Cast Shadow (`pair_005.00.jpg`, `pair_008.00.jpg`)**:
   - In `video/gameplay.mp4` (`study/f_027.jpg`, `f_036.jpg`), the scientist's hand is an overhead **dark translucent cast shadow** with a soft penumbra falling naturally across scalpels, tweezers, and surgical tiles (`rgba(4,6,8,0.82)`).
   - The previous build stamped an opaque, pixelated, fleshy-red hand sprite with a glowing grey-pink halo border onto a flat solid trapezoid polygon.
3. **Shrunk Letterboxed World & Misaligned MS-Paint Rectangles Over Baked Art**:
   - All four quadrants of `4_level_backgrounds_one_per_member.png` already depict the exact continuous room geometry of `study/f_014.jpg` and `study/f_027.jpg` (extruded partitions, petri dishes, pipette, scalpels, tweezers, green PCBs, dome IR sensors, and steel door latches).
   - Instead of rendering the quadrants full-bleed (`1280×720`) and aligning collision/cover to the painted architecture, the old build shrunk the art inside a dead `48×50 px` black border, dimmed L1/L2 art to `bgAlpha: 0.22–0.25`, and drew misaligned flat neon/grey rectangles (`ARENA_WALLS`, `lv.walls`), hollow dashed orange boxes (`exitRect`), and a floating square box (`lv.clue`) right across the surgical instruments.
4. **Copper-Orange Color Mismatch on Bench Levels (`L3` / `L4`)**:
   - `gameplay.mp4` shifts mid-run (`f_013`–`f_016`) from crimson monochrome (`#170704`, `#ff6a5a`) into cold clinical slate-steel surgical lighting (`#151918`, `#24292a`, `#2b3336`, `#3a4447`; ref mean RGB `[52.0, 58.0, 60.9]`). Quadrant 3 raw art had warm copper lighting (`[63.5, 29.5, 24.8]`), making `pair_008.00.jpg` right half look orange-brown instead of cold surgical steel.
5. **Detached HUD Chrome, Debug Labels & Blocking Text Walls**:
   - `gameplay.mp4` has zero HUD text from `f_002.jpg` (`t=0.25s`) through `f_040.jpg` (`t=9.75s`).
   - The previous build stamped `"2 MAZE · 16-BIT"`, `"3 BENCH · 32-BIT"`, `"4 HUMANS · FULL RES"` in the top-right, `"● CLUE 2/4: IR SENSOR LOGGING TURN LATENCY"` in the top-left, control tutorials on the title screen, a full-screen red text wall on `CAUGHT`, and a 5-line exposition essay on `end`.
6. **Passive Waypoint Sliding Instead of Visceral Cover-to-Cover Scurry**:
   - Holding `Shift` simply shrank the rat to `0.88×` and turned off hand collision globally anywhere in the open room, with zero spatial cover props, zero dash-scurry bursts, zero anticipation shadow telegraphing, and zero hit-stop tactile feedback.

### What Still Differs Honestly After Rebuild

- **Discrete 2D Sprite Articulation vs. Neural 3D Video Morphing**: `video/gameplay.mp4` (`gemini-omni-1.2-flash`) is a single unbroken neural video take where crimson 8-bit maze bricks physically dissolve mid-corridor (`f_013`–`f_016`) into 3D-shaded steel while the rat's spine, fur, paws, and ears deform in 3D perspective (`f_040.jpg` shows a rear 3/4 view walking into an out-of-focus 3D laboratory room). Our HTML5 Canvas game renders four discrete resolution rooms (`256×144` -> `480×270` -> `960×540` -> `1280×720`) via offscreen pixel buffer upscaling and cross-dissolve room transitions, driving cleaned 2D overhead Nano Banana sprites with procedural gait wobble, articulated curving pink tail, dust puffs, and a painted surgical doorway / full-resolution steel cage finale.
- **Playable Hazard Props Added Beyond Pure Video Walk**: While `gameplay.mp4` only shows the key, surgical instruments, sweeping hand shadow, and sparking door, `spec.json` specifies baited cheese traps and lab syringe needles (`key_cheese_trap_needles.png`) plus the final full-resolution cage twist (`STILL IN THE TEST`). We integrate those cleaned props spatially into side alcoves and corridors without cluttering the central surgical bench framing.

### Complete Gemini Generation Provenance (`video/gemini_log.json` & `assets/gemini_log.json`)

| Asset / Artifact | Kind | Model | Timestamp (UTC) | Elapsed | Interaction ID | Reference Inputs | Output Files |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `gameplay` | `video` | `gemini-omni-1.2-flash` | `2026-11-18T15:21:42Z` | `45.4s` | `v1_ChdnOEw5YXRYTEI0U2pvX1VQX05qUDJBURIXZzhMOWF0WExCNFNqb19VUF9OalAyQVE` | `projects/g10/m2/refs/m2_main_ref.png` | `projects/g10/m2/video/gameplay.mp4` |
| `rat_sprite_at_4_resolutions` | `image` | `gemini-nano-banana-2.1` | `2026-11-18T15:22:00Z` | `16.79s` | `v1_ChdoOEw5YXVma0s2eXZ5dE1Qd3QzYXNRdxIXaDhMOWF1ZmtLNnl2eXRNUHd0M2FzUXc` | `study/f_014.jpg`, `study/f_027.jpg` | `assets/rat_sprite_at_4_resolutions_raw.png`, `assets/rat_sprite_at_4_resolutions.png` |
| `4_level_backgrounds_one_per_member` | `image` | `gemini-nano-banana-2.1` | `2026-11-18T15:22:17Z` | `17.73s` | `v1_ChdtTUw5YXFHN0g5bUQxc2dQOGZqUG9RURIXbU1MOWFxRzdIOW1EMXNnUDhmalBvUVE` | `study/f_014.jpg`, `study/f_027.jpg` | `assets/4_level_backgrounds_one_per_member.png` |
| `key_cheese_trap_needles` | `image` | `gemini-nano-banana-2.1` | `2026-11-18T15:24:43Z` | `145.0s` | `v1_ChdLOFA5YXVlTUVMYWl5dE1Qa2NxMG9BMBIXSzhQOWF1ZU1FTGFpeXRNUGtjcTBvQTA` | `study/f_014.jpg`, `study/f_027.jpg` | `assets/key_cheese_trap_needles_raw.png`, `assets/key_cheese_trap_needles.png` |
| `human_hand_shadow_hazard` | `image` | `gemini-nano-banana-2.1` | `2026-11-18T15:24:58Z` | `15.39s` | `v1_ChdPOFA5YW91bkVmVzB4ZElQbk9uay1BdxIXTzhQOWFvdW5FZlcweGRJUG5PbmstQXc` | `study/f_014.jpg`, `study/f_027.jpg` | `assets/human_hand_shadow_hazard_raw.png`, `assets/human_hand_shadow_hazard.png` |
| `bgm_loop` | `music` | `lyria-3-clip-preview` | `2026-11-18T15:25:14Z` | `15.62s` | `v1_ChdTc1A5YXZ6Y0plMnN5dE1QMnU3ZTZRMBIXU3NQOWF2emNKZTJzeXRNUDJ1N2U2UTA` | `study/f_014.jpg` | `assets/bgm_loop.mp3` |

- **Exact Seed Video Prompt (`gameplay.mp4`)**:
  > `"Crimson monochrome top-down stealth-puzzle escape game (#1a0606, #ff6a5a, #ffd6cf) that shifts visual fidelity mid-run. Steady overhead camera following a small white-pink lab rat sneaking out of a chunky 8-bit red pixel wire cage with a gleaming key, scurrying through a lab maze where the tiles seamlessly sharpen into detailed high-resolution workbench instruments, scalpels, and the looming shadow of an observing scientist's hand. Continuous unbroken gameplay shot, no scene cuts, no HUD text. Use the reference image for maze layout and red monochrome palette. Sound design: tiny claws skittering, metallic key clink, tense heartbeat pulse. No dialogue."`
- **Exact Image Asset Prompts (`gemini-nano-banana-2.1`)**:
  - `rat_sprite_at_4_resolutions`: `"Isolated 2D game sprite sheet / prop for \"Lab-Rat-ory\": Rat sprite at 4 resolutions. Centered full silhouette, isolated on a flat uniform light grey studio background (#d8d8d8), even lighting, zero drop shadow, no text, strictly harmonized palette (#1a0606, #ff6a5a, accent #ffd6cf), style: Red near-monochrome pixel art; each level a step up in resolution, from 8-bit to near-realistic., matching the reference gameplay frame."`
  - `4_level_backgrounds_one_per_member`: `"Clean 2D/2.5D game environment asset for \"Lab-Rat-ory\": 4 level backgrounds (one per member). strictly harmonized palette (#1a0606, #ff6a5a, accent #ffd6cf), style: Red near-monochrome pixel art; each level a step up in resolution, from 8-bit to near-realistic.. No UI text, no characters baked in, crisp game-ready art matching the reference gameplay frame."`
  - `key_cheese_trap_needles`: `"Isolated 2D game sprite sheet / prop for \"Lab-Rat-ory\": Key, cheese trap, needles. Centered full silhouette, isolated on a flat uniform light grey studio background (#d8d8d8), even lighting, zero drop shadow, no text, strictly harmonized palette (#1a0606, #ff6a5a, accent #ffd6cf), style: Red near-monochrome pixel art; each level a step up in resolution, from 8-bit to near-realistic., matching the reference gameplay frame."`
  - `human_hand_shadow_hazard`: `"Isolated 2D game sprite sheet / prop for \"Lab-Rat-ory\": Human hand/shadow hazard. Centered full silhouette, isolated on a flat uniform light grey studio background (#d8d8d8), even lighting, zero drop shadow, no text, strictly harmonized palette (#1a0606, #ff6a5a, accent #ffd6cf), style: Red near-monochrome pixel art; each level a step up in resolution, from 8-bit to near-realistic., matching the reference gameplay frame."`
- **Exact Audio Prompt (`lyria-3-clip-preview`)**:
  - `bgm_loop`: `"Instrumental 30-second loopable game soundtrack for \"Lab-Rat-ory\" (A subject trained to think it is choosing. The rising resolution shows how much more the rat can see, and how little it changes.). Visual mood: Red near-monochrome pixel art; each level a step up in resolution, from 8-bit to near-realistic.. Purely instrumental, cohesive game loop, no vocals."`

---

## 1. WAY

The player is Subject 47 — a small white-pink lab rat navigating four rooms that sharpen from chunky `256p` 8-bit crimson abstraction (`144p` vertical grid) to `480p`, `960p`, and finally `1280p` cold clinical surgical steel. Nothing outside the physical bench exists: the resolution of the world *is* the progression meter, the red lens glint of each room's security camera *is* the observation state, the brass key clenched in the rat's teeth *is* the inventory, and workbench cover shadows vs. the looming researcher hand shadow *are* the stealth rules.

---

## 2. OBSTRUCTION

Every element that previously stood between the player and the rat's tense scurry:
- Floating top-right resolution/level banners (`"3 BENCH · 32-BIT"`) announcing what the pixel density already proves visually.
- Floating top-left clue strings (`"● CLUE 2/4: ..."`) explaining the twist in text instead of letting the security camera lens lock onto the rat in-world.
- Control instruction paragraphs (`"WASD / Arrows: Sneak & Solve · Shift / Space: Low Crouch"`).
- Letterboxed black margins (`48px` inset) and synthetic neon/grey collision bars pasted over painted surgical tools.
- Blocking full-screen `"CAUGHT — SPRUNG BY BAITED TRAP"` and 5-line `"STILL IN THE TEST"` exposition overlays.
- Studio-grey `#d8d8d8` cutout islands inside the key ring, mouse traps, and finger gaps breaking spatial belief.

---

## 3. KEEP-CUT LEDGER

| Surface / Element | Verdict | VOIDBASTARD-TAO Justification |
| :--- | :--- | :--- |
| Offscreen pixel buffer (`256×144` -> `480×270` -> `960×540` -> `1280×720`) | **KEEP & UPGRADE** | Law 6 & 11: Rising fidelity directly embodies state change in the world without a HUD label. Added smooth sharpen cross-dissolve on room transitions. |
| Full-bleed `4_level_backgrounds_one_per_member.png` quadrants + cold slate grading (`L3`/`L4`) | **KEEP & UPGRADE** | Matches `study/sheet.jpg` camera framing, tool placement, and `[52, 58, 61]` cold surgical steel tone. |
| Cleaned `rat_sprite_at_4_resolutions.png` (warm ivory fur + rosy pink ears/snout/tail) | **KEEP & UPGRADE** | Subject silhouette + posture (normal vs. low dash-scurry crouch + key in mouth) carries player state spatially. |
| Cleaned `key_cheese_trap_needles.png` (hollow key ring, hollow wire traps, sharp needles) | **KEEP & UPGRADE** | Physical pickup, hazards, and brass latch sparks show valid actions and consequences in world space. |
| Cleaned `human_hand_shadow_hazard.png` composited as soft-penumbra dark cast shadow | **KEEP & UPGRADE** | Law 10 & 11: Two-phase anticipation penumbra -> sweeping palm grasp shadow matches `study/f_027.jpg`. |
| In-world IR dome camera lens glints + 4 door-housing lock LEDs | **ADD (REPLACES HUD)** | Law 5 & 6: Places observation tracking and trial progression directly on physical lab hardware. |
| Workbench cover zones (petri dishes, slide tray, scalpel shadow, PCB housing) | **ADD** | Gives spatial meaning to workbench props: tucking under/beside props shields Subject 47 from the sweeping hand shadow. |
| Corner text `"1 CAGE · 8-BIT"` .. `"4 HUMANS · FULL RES"` | **CUT** | Fails Element Test: redundant claim; pixel resolution already shows current fidelity. |
| Top-left text `"● CLUE X/4: ..."` | **CUT** | Fails Law 6: replaces spatial observation discovery with a detached debug string. |
| `ARENA_WALLS` outer margin + misaligned grey rectangle bars over art | **CUT** | Invisible physics colliders now align directly to the painted partition walls in `4_level_backgrounds_one_per_member.png`. |
| Title instruction sentence & `"HOW TO PLAY"` | **CUT** | Law 1 & 2: Begin empty; movement + click-to-scurry are immediately discoverable in Cage 1. |
| Full-screen `"CAUGHT"` text banner & verbose `"STILL IN THE TEST"` text essay | **CUT** | Replaced by visceral hit-stop + crimson camera flash + local `[R]` cue beside rat (`FAULT`), and physical 1280p steel cage bars closing around rat with a fresh key (`COMPLETE`). |

---

## 4. STATE MAP

| TAO State | Game Phase | Dominant Purpose & Valid Action | Spatial Truth Shown in World |
| :--- | :--- | :--- | :--- |
| **REST** | `title` (skipped on `?autostart`) | Commit to begin Trial 47 (`Enter` / `Space` / Click `[ START ]`). | Dark `#170704` chamber silhouette, stark `LAB-RAT-ORY` / `subject 47` mark, single `[ START ]` latch. Zero tutorials. |
| **READY** | Room entry (`l1`..`l4`, pre-key) | Locate and seize the gleaming brass key (`WASD`/Arrows, `Space`/`Shift` dash-scurry, or Click-to-scurry). | Key glints warmly on tiles; exit latch LED glows dim locked red; cover zones cast subtle shelter shadows. |
| **WORKING** | Active stealth (`l1`..`l4`, key held / evading) | Scurry from workbench cover to cover, evading traps, needles, IR cones, and the sweeping scientist hand shadow (`[P]` pauses; `[R]` retries). | Key clenched at rat's snout casting warm forward cone; hand shadow projects soft anticipation penumbra before sweeping low; paw dust trails on dash. |
| **CHANGED** | Latch spark & resolution shift (`unlocking` / room cross-dissolve) | Witness physical passage opening and visual reality sharpening to the next resolution tier. | Hit-stop metallic clink + bright white-gold spark shower at keyhole; heavy steel door swings open spilling warm amber light; pixel grid sharpens (`256p->480p->960p->1280p`). |
| **COMPLETE** | `end` (Full-Res Cage Twist) | Silent realization that the escape was Trial 47 (`[R]` / Click optionally begins Trial 48; no new demand). | Warm amber light cools as crisp `1280p` stainless-steel cage bars slide down enclosing the high-res rat; a fresh brass key drops beside it; 4 red camera lenses glow in the dark; tiny stamped metal tag `TRIAL 48`. |
| **FAULT** | `caught` (Trap sprung / Needle prick / Hand snatch) | Register capture impact (`55ms` hit-stop) and expose immediate `[R]` recovery. | Trap jaws snap shut / shadow fingers close over rat; crimson strobe pulse; small diegetic `[R]` glyph pulses directly beside the rat. |
| **RECOVERY** | Instant room reset (`[R]` or `0.75s` auto-reset) | Return seamlessly to current room's entry point with hazards reset and zero modal friction. | Shutter blink resets rat to room start cleanly; active audio continues uninterrupted. |

---

## 5. WIREFRAMES

### A. Active Workbench Stealth (`WORKING` — `L3 960p` / `L4 1280p`, Zero HUD Chrome)
```text
+------------------------------------------------------------------------------+
| [Pipette & Petri]   [PCB]  [==== Steel Partition ====]     [Scalpel]  [Vials]|
|                     |  |         \\\\\\\\\\\\\               ||              |
|                     |  |    (Soft Dark Hand Shadow)          ||              |
|======+              |  |     \  \  \  |  |  /                ||              |
|      |   (o)IR      v  v      \_ \_ \_|__|_/                 ||              |
| Cage |    \                     [==== Red Scalpel ====]      ||              |
| Bay  |     \ laser                                           ||              |
|======+              [Cover: Slide Tray]                      |+------+       |
|                        (Rat ~o>o-key)  ..dust..              ||oo••  |<-4 LED|
|   [Petri Cover]                                              || [8]  |  Door |
|                     [=== Partition ===]  [=== Green PCB ===] |+------+       |
+------------------------------------------------------------------------------+
  * Zero text banners. 4 tiny LEDs on door frame show trial progress (1..4).
  * Key in rat's mouth lights the latch when aligned; [P] pause / [R] retry.
```

### B. Twist Finale (`COMPLETE` — `1280p` Full-Resolution Cage Reveal)
```text
+------------------------------------------------------------------------------+
|  (●) IR CAM 01                                                IR CAM 02 (●)  |
|                                                                              |
|               +==============================================+               |
|               ||  ||  ||  ||  ||  ||  ||  ||  ||  ||  ||  || |               |
|               ||  ||  ||                          ||  ||  || |               |
|               ||  ||  ||    (High-Res Rat)        ||  ||  || |               |
|               ||  ||  ||                        o-||--||<-Fresh Key          |
|               ||  ||  ||  ||  ||  ||  ||  ||  ||  ||  ||  || |               |
|               +================[ TRIAL 48 ]==================+               |
|                                                                              |
|  (●) IR CAM 03                                                IR CAM 04 (●)  |
+------------------------------------------------------------------------------+
  * Completion creates no new demand (Law 12). Pressing [R] or clicking cage
    latch optionally restarts from Trial 48.
```

---

## 6. VOID CONTRACT

1. **Zero Floating Text During Gameplay**: No resolution strings, no level titles, no `"CLUE X/4"` text banners, no keybind legends, and no score/timer counters are rendered during `l1`–`l4`.
2. **Zero Cutout Grey Halos**: All three multi-sprite sheets (`rat_sprite_at_4_resolutions.png`, `key_cheese_trap_needles.png`, `human_hand_shadow_hazard.png`) have been scrubbed from `*_raw.png` via connected-component interior island removal + boundary alpha color-unmixing (`remaining grey/fringe px` reduced from `6,811 / 13,653 / 4,738` down to `11 / 88 [real steel needle glint] / 5`), and `human_hand_shadow_hazard.png` is composited solely via its clean alpha mask into a soft-penumbra dark shadow buffer.
3. **Spatial Controls & Feedback**: Movement works via `WASD`/Arrows or direct world-space pointer click/drag; `Space`/`Shift` executes a tactile low-profile dash-scurry between physical workbench cover props; `[P]` pauses cleanly; `[R]` recovers immediately.
4. **Deterministic Verification Contract**: Preserves `<link rel="icon" href="data:,">`, `?autostart`, `?seed=N` Mulberry/LCG deterministic PRNG, `../assets/bgm_loop.mp3` + WebAudio SFX, and `window.__game.state`.

---

## 7. FAILURE

 How the surface handles failure without breaking immersion (`Law 8`, `Law 10`, `Law 14`):
- **Trap Snap / Needle Prick / Hand Snatch**: Triggers a `55ms` hit-stop freeze so the exact physical contact reads unmistakably (trap jaws swap from `trapArmed` to `trapSprung`, or shadow fingers curl closed over the rat), accompanied by a low saw/sub-thud impulse and a brief crimson optical vignette pulse.
- **No Scolding Modal**: Instead of covering the screen in `"CAUGHT — SPRUNG BY BAITED TRAP"`, a tiny diegetic `[R]` prompt pulses directly beside the rat for `0.72s` before seamlessly re-spawning Subject 47 at the current room's entry (or immediately if `[R]` is pressed).

---

## 8. IMPLEMENTATION

1. **Asset Pipeline Cleanup (`assets/*.png`)**:
   - Regenerated `rat_sprite_at_4_resolutions.png`, `key_cheese_trap_needles.png`, and `human_hand_shadow_hazard.png` from `*_raw.png` using corner-sampled background estimation, interior studio-grey island removal (clearing the key bow hole, 13 mouse-trap wire loops, and 5 finger-gap pockets), and 3px boundary foreground unmixing.
2. **Offscreen Pre-Processing (`game/index.html`)**:
   - `gradedBgCanvases`: Crops exact full-bleed quadrants (`659×357` / `659×352`) from `4_level_backgrounds_one_per_member.png`, keeping `L1`/`L2` in rich crimson monochrome (`#170704` / `#ff6a5a`) and grading `L3`/`L4` into cold clinical surgical slate-steel (`mean RGB ~ [51, 56, 59]`, preserving crimson droplets/handles/lasers and emerald PCBs).
   - `paleRatCanvas`: Spatially remaps the 4 coral-red rat sprites into warm ivory-cream dorsal fur (`#faf2ee`) with rosy pink ears, snout, paws, and tail (`#eba19c`), matching `study/sheet.jpg`.
   - `shadowHandCanvas`: Converts the 5 cleaned hand frames from `human_hand_shadow_hazard.png` into multi-layered soft-penumbra dark cast shadows (`rgba(4,6,8,...)`).
3. **Gameplay & Choreography (`game/index.html` + `game/play.mjs`)**:
   - Aligned invisible wall colliders, workbench cover zones, IR camera sensors, traps, needles, keys, and exit latches directly to the baked room architecture across `256p -> 480p -> 960p -> 1280p`.
   - Tuned `play.mjs` deterministic showcase so `pair_002.00.jpg` (`t=2s`), `pair_005.00.jpg` (`t=5s`), and `pair_008.00.jpg` (`t=8s`) align naturally with `video/gameplay.mp4` (`L2` crimson maze -> `L3` surgical bench under scalpel -> `L4` sweeping scientist hand shadow & sparking brass latch -> `end` full-resolution cage twist).
