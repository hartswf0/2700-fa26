# VOIDBASTARD-TAO AUDIT · Group 30: Household Companion (`g30` · M2)

> **Operational Emptiness Principle**: Every visible element is a claim about what matters now. In *Household Companion*, the entire tension lives in a quiet sunlit room between three things on one wooden table: **a living Boston fern**, **an open plant-care reference book**, and **a glossy hovering AI companion** whose confident advice slowly drifts from helpful to lethal.

---

## 0. HONEST VIDEO-VS-GAME CRITIQUE & GEMINI PROVENANCE

### Honest Critique of the First-Pass Build (`pairs/pair_002.00.jpg`, `pair_005.00.jpg`, `pair_008.00.jpg` vs `study/sheet.jpg`)

Comparing the Omni 1.2 Flash seed video (`video/gameplay.mp4` / `study/sheet.jpg`) side-by-side against the first-pass HTML5 build revealed seven glaring visual and UX failures:

1. **Massive Dark `#1c1510` Letterbox Shrinking the Room**:
   - `record_play.mjs` captures at `1920x1080`, while the first-pass CSS omitted `width: 100vw; height: 100vh` on a `1280x720` `<canvas>`. As a result, the cozy sunlit apartment floated inside a giant dark `#1c1510` frame occupying over 55% of the screen (`pair_002.00.jpg`–`pair_008.00.jpg`), destroying the full-bleed `#f5efe6` warm cutaway framing of `sheet.jpg`.
2. **Double-Drawn Fern & White/Grey Speckled Frond Halo**:
   - `assets/isometric_room.png` came out of Nano Banana with a static healthy fern and terracotta pot baked onto the left of the table, plus a ceramic mug baked onto the right of the table.
   - The first-pass build drew `plant_4_health_stages.png` **directly on top of** the baked fern (`pair_002.00.jpg`, `pair_005.00.jpg`), producing two stacked terracotta pots and chaotic double fronds. Worse, the flood-fill cutout on `plant_4_health_stages.png` left trapped `#d1d1d0` studio-grey islands between overlapping fronds and a pale Gibbs-ringing fringe around every leaflet.
3. **Tiny Flat "Mug-Face" Companion vs Luminous Glossy Hover-Orb**:
   - Because `isometric_room.png` had a baked ceramic mug at `(985, 355)` and the first-pass build drew a tiny `32px`-radius opaque circle right over it (`pair_005.00.jpg`), the AI companion looked like a flat sticker pasted onto a coffee mug. In `sheet.jpg` (`f_006.jpg`, `f_014.jpg`), there is no mug—there is a large, luminous, translucent pearlescent-cyan spherical hover-orb with winged side fins, a rounded dark visor with glowing cyan eyes/smile, a soft cyan hover-glow pool on the wood grain below, and floating golden sparkles/chime notes when pleased.
4. **Cardboard Rectangle Book Flip vs Sculpted 2.5D Page Turn & Spatial Margin Note**:
   - Look at `pair_008.00.jpg` right half: `drawBookFlipEffect()` drew flat axis-aligned white `ctx.rect()` squares sticking awkwardly out of an isometric book, while stuffing the book's finding into the companion's own speech bubble where it clipped off the right border (`"Fern looks happy! :) (Your care worke"` / `"Book p.12: Dry soil confirmed — 1 cup cool wat"`).
   - In `sheet.jpg` (`f_011.jpg`, `f_012.jpg`), the book's pages lift smoothly along the isometric spine crease in warm parchment perspective. And per VOIDBASTARD-TAO Law 5 (*Place controls and truths beside what they change*), the book's truth belongs **spatially beside the open book** as a concise botanical margin note (`"Soil saturated — skip water"`), never crammed or truncated inside the AI companion's speech card.
5. **Toy Geometric Watering Can vs Sculpted Warm Brass Swoop**:
   - In `pair_005.00.jpg`, the watering can was a tiny flat rounded square with a stick line. In `sheet.jpg` (`f_020.jpg`–`f_033.jpg`), a warm brushed-brass cylindrical watering can with an arched loop handle and graceful curved gooseneck spout swoops smoothly in from the upper-right only during watering, tilts over the fern crown, pours shimmering arc droplets, and leaves dark wet droplets/dampness on the soil and wood tabletop.
6. **Detached Debug HUD Clutter**:
   - Top-left green health pips (`----`) and bottom-left `FREE TIME 3h` were pure developer scaffolding absent from `sheet.jpg`. The fern's own 4-stage foliage (`thriving -> healthy -> yellowing -> wilted`) and soil moisture ARE the health state in the world (VOIDBASTARD-TAO Law 6).
7. **Missing Direct Resistance Verb when Soil is Soaked**:
   - In `spec.json` (*"Your home assistant has never been wrong. Today it says to water the fern again."*), when the companion urges overwatering wet roots, overriding should NOT still dump water from the watering can (`executeChoice(false)` previously set `S.anim.canT = 1.6`, watering the fern even when overriding an overwatering trap!). Resisting bad watering advice must let the player **hold off / aerate & skip water** (`[WAIT / SKIP]` or `[2]`), keeping the watering can away while daylight shifts warmly to golden dusk.

### Honest Remaining Differences vs the Gemini Omni Video
- **3D Raytraced Subsurface Light vs 2D Canvas Compositing**: In `video/gameplay.mp4`, Omni 1.2 Flash subtly shifts 3D cast shadows across the room walls and refracts background woodgrain through the translucent rim of the hovering orb. Our real-time 60fps HTML5 Canvas implementation approximates this with layered radial translucency gradients, dynamic cyan tabletop bounce-glow, animated sunbeam/dappled-leaf gobo overlays, and warm golden-hour color grading (`8:00` crisp cream morning -> `12:00` warm noon -> `18:00` amber dusk), plus real interactive 4-stage Nano Banana fern transitions across a playable 14-day arc.

### Full Gemini Asset & Video Provenance (`gemini_log.json`, Zero API Keys)

| Artifact | Kind | Model | Interaction ID | Prev ID | Elapsed | Reference Files | Output File(s) |
|---|---|---|---|---|---:|---|---|
| Seed Gameplay Clip | `video` | `gemini-omni-1.2-flash` | `v1_Chdjc1A5YXFxeFBLZXFpTE1QNHVmQ2lRSRIXY3NQOWFxcXhQS2VxaUxNUDR1ZkNpUUk` | `null` | `41.82s` | `projects/g30/m2/refs/m2_main_ref.png` | `projects/g30/m2/video/gameplay.mp4` (`2026-11-18T15:25:41Z`) |
| Isometric Room | `image` | `gemini-nano-banana-2.1` | `v1_ChdlTVA5YXNEOUdldll5dE1QODZPMXlBSRIXZU1QOWFzRDlHZXZZeXRNUDg2TzF5QUk` | `null` | `18.29s` | `study/f_014.jpg`, `study/f_027.jpg` | `projects/g30/m2/assets/isometric_room.png` (`2026-11-18T15:26:02Z`) |
| Plant, 4 Health Stages | `image` | `gemini-nano-banana-2.1` | `v1_ChZpc1A5YW8zN042cmd5dE1QNXVPN1dREhZpc1A5YW8zN042cmd5dE1QNXVPN1dR` | `null` | `29.09s` | `study/f_014.jpg`, `study/f_027.jpg` | `assets/plant_4_health_stages_raw.png`, `assets/plant_4_health_stages.png` (`2026-11-18T15:26:31Z`) |
| BGM Loop (30s) | `music` | `lyria-3-clip-preview` | `v1_ChdwOFA5YXJ5WEtLR3N5dE1Qc19iUTBRSRIXcDhQOWFyeVhLS0dzeXRNUHNfYlEwUUk` | `null` | `11.14s` | `study/f_014.jpg` | `projects/g30/m2/assets/bgm_loop.mp3` (`2026-11-18T15:26:42Z`) |

- **Omni Video Prompt**: `"Cozy isometric room life-simulation game in warm cream (#fbf1e4), walnut brown (#4a3626), and leafy sage green (#5f9e6e), styled like Unpacking. Fixed isometric cutaway camera showing a sunlit apartment with a potted fern on a wooden table, a thick plant-care reference book, and a cute floating spherical AI home-companion icon pulsing gently. As morning light shifts to golden afternoon, the player waters the lush green fern while comparing the companion's glowing icon prompt against the open book. Continuous unbroken gameplay shot, no scene cuts, no gibberish text. Use the reference image for isometric room framing and warm palette. Sound design: cozy acoustic guitar, gentle water pouring, soft friendly synth chime. No dialogue."`
- **Isometric Room Prompt**: `"Clean 2D/2.5D game environment asset for \"Household Companion\": Isometric room. strictly harmonized palette (#fbf1e4, #4a3626, accent #5f9e6e), style: Isometric cozy rooms like Unpacking.. No UI text, no characters baked in, crisp game-ready art matching the reference gameplay frame."`
- **Plant 4 Stages Prompt**: `"Isolated 2D game sprite sheet / prop for \"Household Companion\": Plant, 4 health stages. Centered full silhouette, isolated on a flat uniform light grey studio background (#d8d8d8), even lighting, zero drop shadow, no text, strictly harmonized palette (#fbf1e4, #4a3626, accent #5f9e6e), style: Isometric cozy rooms like Unpacking., matching the reference gameplay frame."`
- **Lyria BGM Prompt**: `"Instrumental 30-second loopable game soundtrack for \"Household Companion\" (Handing decisions over to avoid mistakes means handing over the choice. Cosy art makes the trust feel natural.). Visual mood: Isometric cozy rooms like Unpacking.. Purely instrumental, cohesive game loop, no vocals."`

---

## 1. WAY (Core Loop & Spatial Truth)

One sunlit room, fourteen days, one Boston fern. Each morning (`8:00`) the hovering Companion Orb proposes today's care in its warm bottom-right card (`[DO IT]`). Early on it is right; soon its cozy certainty drifts (`"Water the fern again. Trust me :)"` when the soil is already soaked).
- **Follow (`[1]` / `[D]` / click `[DO IT]` or click the fern)**: Immediately enact the companion's recommendation. If it calls for water, the warm brass watering can swoops in from upper-right, tilts over the fern, and pours arc droplets.
- **Check Book (`[C]` / click the open Care Guide on the table or `[CHECK BOOK -1h]`)**: Costs 1 hour of daylight (`8:00 -> 10:00`), animates a crisp isometric 2.5D page-flip directly on the open Care Guide, and surfaces a concise botanical margin note right beside the book (`"Soil saturated — skip water"` or `"Soil dry — 1 cup cool water"`).
- **Resist / Wait (`[2]` / `[S]` / `[SKIP WATER]`)**: Hold off or apply gentle book-verified care instead of destructive AI instructions, shifting the room into golden afternoon/dusk (`18:00`) as the fern visibly thrives or yellows across its 4 Nano Banana foliage stages.

---

## 2. OBSTRUCTION (What Stood Between Player & Game)

1. Dark viewport letterboxing compressed the room into a postage stamp.
2. Stacked duplicate ferns + grey cutout halos broke visual immersion immediately.
3. Top-left health pips (`----`) and `FREE TIME 3h` told the player numerically what the fern and clock already express diegetically.
4. Truncated text inside the speech card forced players to read clipped debug strings instead of looking at the book and soil on the table.

---

## 3. KEEP-CUT LEDGER

| Element | Decision | VOIDBASTARD-TAO Justification |
|---|---|---|
| Full-bleed 16:9 sunlit isometric room (`#f5efe6`) | **KEEP & EXPAND** | Law 1 & 13: The warm cutaway room IS the whole stage; fills 100% of viewport. |
| Baked static fern & baked ceramic mug on `isometric_room.png` | **CUT (Painted Out)** | Eliminates double-fern stacking and mug-behind-orb collision; reconstructed clean plaster wall, chair back, baseboard, and continuous isometric woodgrain. |
| 4-stage Nano Banana fern (`plant_4_health_stages.png`) | **KEEP & CLEAN** | Law 6: Foliage stage + soil dampness show true plant health in the world; re-matted from `_raw.png` via one-sided Lab darkness/chroma + edge decontamination (zero grey holes/halos). |
| Top-left green health pips (`----`) | **CUT** | Fails Element Test: redundant HUD meter duplicating the fern's 4 visible health stages. |
| `FREE TIME 3h` bottom-left readout | **CUT** | Fails Element Test: `DAY X · HH:00` + `-1h` on `[CHECK BOOK -1h]` + warm daylight progression already communicate time cost cleanly like `sheet.jpg`. |
| Permanently floating mini watering-can icon | **CUT** | Law 2 & 4: Brass watering can enters the frame ONLY during the active watering pour (`WORKING`). |
| Glossy spherical Companion Orb + cyan tabletop hover glow | **KEEP & UPGRADE** | Matches `sheet.jpg` scale, pearlescent rim, dark visor (`o o` / `^ ^`), musical chime notes, and golden sparkles. |
| Tactile Open Care Guide + spatial margin callout | **KEEP & SPATIALIZE** | Law 5: Clicking the book (`[C]`) flips 3D/2.5D parchment pages on the book itself and shows a short margin note right above/beside the open pages. |
| Bottom-right cream Companion Card (`#faf5eb` / `#4b3d30`) | **KEEP & DECLUTTER** | Matches `sheet.jpg` typography and pills (`[DO IT]`, `[CHECK BOOK -1h]`, plus `[SKIP]`/`[SAFE CARE]` when appropriate), zero text overflow. |

---

## 4. STATE MAP

| State | World & Lighting Truth | Valid Player Operations | Visible Chrome |
|---|---|---|---|
| **REST** *(Title / Quiet Morning Intro)* | Sunlit `8:00` room, gentle dust motes, fern breathing subtly, orb bobbing softly. (`?autostart` enters `READY` directly on Day 6.) | `Enter` / `Space` / Click room to begin Day 1. | Subtle bottom-right card prompt; open center room. |
| **READY** *(Morning Advice, `8:00`–`12:00`)* | Companion Orb pulses gently; soil inside terracotta pot visibly dry (light tan) or saturated (dark wet). | `[1]`/`[D]`/Click fern or `[DO IT]`; `[C]`/Click book or `[CHECK BOOK -1h]`; `[2]`/`[S]` skip/wait. | `DAY X · HH:00` bottom-left; Companion Card bottom-right; subtle hover ring on book/fern when pointed at. |
| **WORKING** *(Page Flip or Brass Can Pour, `12:00`–`16:00`)* | Either parchment pages arc across the book spine (`CHECK`), OR warm brass watering can swoops from upper-right, tilts, and pours shimmering water droplets (`WATER`), or gentle mist/skip settles (`SKIP`). | Brief 1.1s tactile animation (non-blocking audio/visual beat). | Card softens slightly (`sheet.jpg` frame 22) so eyes stay on the table action. |
| **CHANGED** *(Golden Dusk Consequence, `18:00`–`20:00`)* | Warm amber dusk (`#e89844` sunbeams + window leaf shadows); wet droplets on wood/soil if watered; fern shifts stage if health crossed threshold; orb sparkles (`Fern looks happy! :)`) or flickers smugly if bad advice hurt roots. | Auto-advances smoothly to next morning (or `Space`/`Click` to step immediately). | `DAY X · 18:00` bottom-left; concise one-line evening status in bottom-right card. |
| **COMPLETE** *(Day 14 Ending)* | Full golden sunlit room with either lush Stage-3 thriving fern (Self-Reliant Gardener) or automated regimented glow (Automated Home). | `[R]` or Click `[NEW 14 DAYS]` to replay. | Clean ending card in bottom-right (`[R] PLAY AGAIN`), leaving the fern & room completely unoccluded! |
| **FAULT** *(Root Rot / Plant Dies, Health 0)* | Stage-0 wilted brown fern in parched/waterlogged pot; muted cool shadow over table; orb still cheerfully offering tasks. | `[R]` or Click `[TRY AGAIN]` to recover. | Concise fault card in bottom-right exposing `[R]` recovery (Law 8 & 14). |
| **RECOVERY** *(Reset to Healthy Loop)* | Instant clean reset of soil, clock (`8:00`), and healthy Stage-2 fern without page reload. | Immediate return to `READY`. | Normal `READY` minimal surface. |

---

## 5. WIREFRAMES (16:9 Full-Bleed Spatial Layout)

```
+------------------------------------------------------------------------------+
|  #f5efe6 FULL-BLEED SUNLIT ISOMETRIC CUTAWAY ROOM (zero dark letterbox)      |
|                                                                              |
|                     /\  Hanging Shelf Plant & Framed Print                   |
|              /=====/  \=====\                                                |
|             |     /    \     |       (Swoops in ONLY during WORKING:)        |
|             |  [4-Stage ]    |            _.-==-.                            |
|             |  [Fern Pot]    |         .-' [Brass]                           |
|             |  (Click:Act)   |              \Can/                            |
|             |       \    +--- Margin Note ---+   ( ^_^ ) <- Glossy Orb       |
|             |        \   | Soil soaked: skip |    `---'     + cyan wood glow |
|             |         \  +---------v---------+                               |
|             |          \    / Care Guide \   /                               |
|             |           \   \ (Click:[C]) / /  +---------------------------+ |
|             |            \                 /   | Water the fern again.     | |
|             |             \_______________/    | Trust me :)               | |
|  DAY 6 · 8:00                                  | [DO IT]  [CHECK BOOK -1h] | |
+------------------------------------------------+---------------------------+-+
```

---

## 6. VOID CONTRACT

1. **Zero Letterboxing**: Canvas renders crisp `1920x1080` (`width: 100vw; height: 100vh; object-fit: cover/contain` in exact 16:9) filling 100% of the capture and browser viewport with warm `#f5efe6` room tones.
2. **Zero Duplicate Sprites or Cutout Halos**: Static fern and static mug are geometrically/harmonically removed from `isometric_room.png`; `plant_4_health_stages.png` has 0 interior grey holes and 0 pale outline halos.
3. **Zero Detached Meters**: No health bars, no `----` pips, no `FREE TIME` counter, no meta labels explaining "AI drift".
4. **Zero Text Clipping**: Every companion prompt, book margin note, and pill button fits with generous breathing room inside its container.
5. **Spatial & Keyboard Parity**: Clicking the book = `[C]`; clicking the fern or `[DO IT]` = `[1]`/`[D]`; clicking `[SKIP WATER]` / `[SAFE CARE]` = `[2]`/`[S]`; `[R]` recovers from `FAULT`/`COMPLETE` at any time.

---

## 7. FAILURE MODES GUARDED AGAINST

- **Overwater-on-Override Bug**: Previously, overriding `"Water the fern again"` still triggered the watering can animation! Fixed: resisting an overwater trap triggers a calm skip/aeration beat (warm breeze motes + intact soil) while watering actions summon the swooping brass watering can and water droplets.
- **Unreadable Rapid Night Flash**: Timed `WORKING` (can pour: `1.8s`, book page flip: `1.1s`) and `CHANGED` (`18:00` golden dusk hold: `1.5s`) so every state transition reads effortlessly at 60fps and hits the Omni video's morning -> noon -> golden-dusk rhythm across `t=2s, 5s, 8s`.
- **Audio Autoplay Rejection**: `ensureAudio()` wraps WebAudio context resume + `../assets/bgm_loop.mp3` playback inside `.catch(() => {})` so headless/muted browsers produce `0 console errors`.

---

## 8. IMPLEMENTATION SUMMARY

- **`assets/plant_4_health_stages.png`**: Re-extracted from `plant_4_health_stages_raw.png` via one-sided CIE Lab darkness/chroma matting + morphological interior-hole clearing + dark-outline edge color decontamination.
- **`assets/isometric_room.png`**: Removed baked static fern and ceramic mug via exact isometric plane boundary fitting + 2D sparse Laplace harmonic shading (`scipy.sparse.linalg.spsolve`) + continuous real woodgrain high-pass transfer, preserving the Care Guide book, wooden chair back, hanging pothos, and framed print untouched.
- **`game/index.html`**: Full-bleed `1920x1080` Canvas renderer with per-stage pot-anchor registration, procedural soil moisture cues, 2.5D perspective parchment page-flip + floating botanical margin note, sculpted brushed-brass watering can swoop + parabolic water droplets + wet wood puddle marks, glossy pearlescent Companion Orb with cyan hover glow & golden star-sparkles, dynamic morning-to-dusk sunbeam/gobo post-grading, Lyria BGM + WebAudio foley (page rustle, water droplets, synth chime, soft warning).
- **`game/play.mjs`**: Deterministic playtest choreography showcasing `8:00` morning prompt + `[CHECK BOOK -1h]` page-flip (`t ~ 2s`), brass watering can swoop & droplets (`t ~ 5s`), resisting an overwatering trap + golden `18:00` dusk glow (`t ~ 8s`), with `0` console errors at ~60 fps.
