# VOID_AUDIT — `g11` · Orpheus (M2)

## 0. HONEST VIDEO-VS-GAME CRITIQUE & GEMINI PROVENANCE

### A. Brutal Comparison: First-Pass Game vs. Seed Video (`video/gameplay.mp4` & `study/sheet.jpg`)
Inspecting `study/sheet.jpg` against the prior `pairs/pair_002.00.jpg`, `pair_005.00.jpg`, and `pair_008.00.jpg` exposed five severe regressions where the first-pass HTML build fell short of its Omni seed video:

1. **Detached Debug HUD Chrome**: Top-left monospace telemetry (`ROOM 2/5 · SUB-LEVEL B4 · FLUORESCENCE HALL` and `PLAYER AUTONOMY: 52%`) narrated the theme as a spreadsheet percentage instead of letting the shrinking corridor options speak for themselves. `study/sheet.jpg` has zero HUD counters.
2. **Flow-Breaking Modal Choice Box (`phase === 'choose'`)**: Every room froze locomotion at `62%` progress to pop up a heavy `1088×122` bordered menu (`> accept  decline [OVERRIDDEN]  [B/Space] look back` + `GUIDE OVERRIDE: OPTION SEALED`). In `video/gameplay.mp4`, the camera never cuts or pauses: golden AI guide beams physically drop across the side doorways in-world while Orpheus and Eurydice keep walking.
3. **Hollow Paper-Thin Corridor vs. Stepped Brutalist Architecture**: The old renderer drew two flat trapezoidal walls with zero jamb thickness, so doorways looked like flat black stickers. In `sheet.jpg`, thick travertine and dark slate pilasters step inward with visible 3D wall returns, warm recessed LED baseboard coves reflect onto glossy dark stone tiles, recessed ceiling skylight coffers illuminate each bay, wall materials darken from warm limestone (`t=2s`) to moody charcoal monoliths (`t=5s`), and the distant arched sanctum splits open along a vertical golden seam before flooding the hall with daylight (`t=8s–10s`, `sheet.jpg` row 4).
4. **Trapped `#d3d3d3` Studio Cutout Islands**: Because `cutout.py` only flood-filled exterior border pixels, `assets/orpheus_and_eurydice_sprites.png` retained `1,310+` opaque neutral-grey (`rgb(211,211,211)`) pixels inside Orpheus's hip lyre strings and between both characters' arms and waists—clearly visible as bright grey blobs on Orpheus's hips in `pair_002.00.jpg`.
5. **Undersized Static-Cardboard Actors & Missing Acoustic Temptation**: Characters were rendered ~30% smaller than in `sheet.jpg` and translated rigidly up and down when walking away from the camera, with no visible floor step ripples or acoustic spatialization behind Orpheus to make Eurydice's presence—and her sudden Room 4 silence—viscerally tempt `[B]` (Look Back).

### B. Honest Diff After Rebuild (What Still Differs from the Omni Video)
- **2D Sprite Articulation vs. Full 3D Cloth/Mesh**: `video/gameplay.mp4` (`gemini-omni-1.2-flash`) renders full 3D perspective limb foreshortening and raytraced dress folds. Our real-time Canvas 2.5D build uses cleaned `gemini-nano-banana-2.1` sprites with split-torso/stride phase deformation, hem sway, glossy floor reflections, and contact ripples—much livelier and cleaner than before, though still 2.5D billboarded sprites rather than 3D skeletal meshes.
- **Playable Agency & Minimal Dry Subtitle**: Whereas the seed clip has zero text (`No dialogue`), a playable Stanley-Parable Orpheus game requires the AI Guide's voice and real spatial doorway agency. We cut the modal menu and top HUD completely, replacing them with physical lateral doorway steering (Room 1's unsealed left door is genuinely enterable; sealed doors spark and push back on contact), one terse borderless subtitle line at the bottom margin during active Guide interventions, and a faint diegetic `[B]` floor-echo cue only when hesitation or Room 4's eerie silence makes looking back a live temptation.

### C. Gemini Asset & Video Provenance (`gemini_log.json`)
- **Seed Gameplay Video (`video/gemini_log.json`)**:
  - `interaction_id`: `v1_ChdYTUw5YXVITEhxekN4ZElQNS1UTTJBOBIXWE1MOWF1SExIcXpDeGRJUDUtVE0yQTg`
  - `model`: `gemini-omni-1.2-flash` · `timestamp`: `2026-11-18T15:21:03Z` · `seconds`: `40.69`
  - `refs`: `["projects/g11/m2/refs/m2_main_ref.png"]`
  - `output`: `projects/g11/m2/video/gameplay.mp4` (`1280x720`, `24.0 fps`, `10.027s`, `0` scene cuts)
  - `prompt`: *"Atmospheric top-down 2.5D mythological office-underworld adventure in muted charcoal (#22252a), warm bone (#e6e1d3), and antique gold (#d9b45a). Smooth overhead tracking camera. Orpheus walks ahead of a pale trailing Eurydice through stark Stanley-Parable-like subterranean corridors; at each branching doorway, a golden AI guide beam automatically seals and greys out two doors, steering them forward while Orpheus resists turning around toward the footsteps behind him. Continuous unbroken gameplay shot, no scene cuts, no HUD text..."*
- **Character Sprite Sheet (`assets/gemini_log.json` #1)**:
  - `interaction_id`: `v1_ChdZY0w5YXJ6bExzQ3M1Tm9QaF9PdnFBRRIXWWNMOWFyemxMc0NzNU5vUGhfT3ZxQUU`
  - `model`: `gemini-nano-banana-2.1` · `timestamp`: `2026-11-18T15:21:21Z` · `seconds`: `15.76`
  - `refs`: `[".../study/f_014.jpg", ".../study/f_027.jpg"]`
  - `files`: `assets/orpheus_and_eurydice_sprites_raw.png`, `assets/orpheus_and_eurydice_sprites.png` (re-matted in M2 audit to purge enclosed `rgb(211,211,211)` pockets & edge spill)
- **Instrumental Soundtrack (`assets/gemini_log.json` #2)**:
  - `interaction_id`: `v1_Chc1c1A5YXNDc0JybWdvX1VQcW9ITjJBWRIXNXNQOWFzQ3NCcm1nb19VUHFvSE4yQVk`
  - `model`: `lyria-3-clip-preview` · `timestamp`: `2026-11-18T15:27:44Z` · `seconds`: `10.72`
  - `refs`: `[".../study/f_012.jpg"]` · `file`: `assets/bgm_loop.mp3`

---

## 1. WAY
Walk forward out of the subterranean office-underworld with Eurydice trailing unseen behind you while a helpful golden AI Guide progressively seals away every branching doorway—leaving only the myth's single unautomated act: walking into the light or pressing `[B]` to look back.

## 2. OBSTRUCTION
- **Telemetry Narrating Theme**: `PLAYER AUTONOMY: 52%` and `ROOM 2/5 · SUB-LEVEL B4` tell the player what to feel via top-left debug text instead of architectural constriction.
- **Menu Interruption**: Stopping locomotion every room for a multi-button modal dialog turns spatial navigation into form-filling and breaks the hypnotic pull of footsteps behind you.
- **Visual Noise & Sprite Halos**: Trapped light-grey cutout islands on Orpheus's lyre and Eurydice's arms shatter the dark slate reflection mood.

## 3. KEEP-CUT LEDGER

| Element | Decision | Reason (VOIDBASTARD-TAO Element Test) |
| :--- | :--- | :--- |
| `ROOM X/5` & `PLAYER AUTONOMY: XX%` top-left HUD | **CUT** | Redundant metric; depth is shown diegetically via stenciled pilaster bay marks (`B5`–`B1`), darkening/brightening stone, and shrinking lateral freedom. |
| Blocking `phase === 'choose'` bottom dialog box & option list | **CUT** | Interrupts continuous walk; doorways already exist in 3D space and can be steered into or physically sealed in-world. |
| `GUIDE OVERRIDE: OPTION SEALED` warning badge | **CUT** | Replaced by physical golden laser barrier collision sparks, gentle lateral repulse, and low harp thrum when pushing a sealed door. |
| Studio grey islands inside `orpheus_and_eurydice_sprites.png` | **CUT** | Cutout artifact (`rgb(211,211,211)` enclosed pockets purged + edge decontaminated). |
| Stepped 3D pilaster bays, recessed skylight coffers & floor coves | **KEEP / UPGRADE** | Grounds spatial speed, doorway depth, and exact visual fidelity to `study/sheet.jpg`. |
| In-world Golden AI Guide laser curtains & caustic barrier lattice | **KEEP / UPGRADE** | Directly shows which doors automation has removed (`Law 6 & Law 9`). |
| Eurydice trailing footsteps, pale floor reflection & step ripples | **KEEP / UPGRADE** | Embodies current truth of her presence (Rooms 1–3) and the terrifying ambiguity when her steps drop out in Room 4 (`B2`). |
| Single terse borderless bottom Guide line (fades cleanly) | **KEEP (MINIMAL)** | Delivers the dry Stanley-Parable rationalizations without framing chrome or blocking corridor sightlines. |
| Whisper-faint spatial `[B]` floor-echo cue on hesitation / silence | **ADD (SCOPED)** | Appears beside the trailing floor shadow only when stopped or in Room 4–5 silence (`Law 4 & Law 5`). |

## 4. STATE MAP

| VOID State | Game Mapping (`S.phase`) | Dominant Purpose & Valid Operation | World / Surface Expression |
| :--- | :--- | :--- | :--- |
| **REST** | `title` (skipped on `?autostart`) | Quiet subterranean threshold awaiting first step | Open corridor breathing softly; `ORPHEUS` + `[W / ↑] walk forward` fades cleanly on input. |
| **READY** | `room` (poised / idle at threshold) | Walk forward (`W`/`↑`/drag) or turn back (`[B]`) | Corridor stretches ahead; subtle pale floor reflection behind Orpheus; faint `[B]` ripple if lingering. |
| **WORKING** | `room` (striding through `B5`–`B1`) | Continuous forward walk & lateral doorway steering (`A/D` or `←/→`) | Echoing dual footsteps + pale acoustic floor ripples; pilasters scroll past; lateral steering narrows room by room. |
| **CHANGED** | In-world AI Door Seal (`sealAnim > 0`) & Room 4 Silence | Experience automation closing branching doors in real time | Crackling golden ceiling emitters sweep down side doorways (`B5` right only -> `B4–B1` both sides + floor guide rails); one dry Guide subtitle line. |
| **COMPLETE** | `surface` -> `end` (`endingKind === 'surface'`) | Step across the sunlit golden threshold; quiet stillness | Central arched doors part along a golden seam (`sheet.jpg` row 4) into warm daylight; quiet final line + subtle `[R]` reset. |
| **FAULT** | `look` -> `end` (`endingKind === 'looked_back'`) | Irreversible consequence of `[B]` (Look Back) | Hit-stop + minor lyre chord; Orpheus faces camera; Eurydice dissolves into pale bone motes; Guide beams extinguish. |
| **RECOVERY** | `[R]` / `Enter` from `end` (or `[R]` anytime) | Clean instant return to `B5` corridor start | Immediate seamless reset to Room 1 (`B5`) with zero modal confirmation. |

## 5. WIREFRAMES

### Active Corridor (`WORKING` / `CHANGED` — Continuous Walk, Zero HUD Chrome)
```text
+--------------------------------------------------------------------------+
|                         [ glowing ceiling coffer ]                       |
|      |\                                                          /|      |
|  B4  | \   |\              .---.                /|              / |      |
|      |  \  | \            /     \              / |             /  |      |
|      |   | |  |          |       |            |  |            |   |      |
|      |===| |  |          |       |            |  |            |===|      |
|      |:::| |__|          |_______|            |__|            |:::|      |
|      |:::| /              /     \              \              |:::|      |
|      |:::|/    [Orpheus] /       \ [Eurydice]   \             |:::|      |
|     /|:::|      (stride)           (pale glow)   \            |:::|\     |
|    /  \::|                         ( ~ ripple ~ ) \           |::/  \    |
|   /        "Both side halls were sub-optimal. Keep walking."         \   |
+--------------------------------------------------------------------------+
  (:::) = Golden AI Guide laser curtain physically sealing doorway jamb
```

### Room 4 Silence / Temptation (`CHANGED` -> Tempting `FAULT`)
```text
+--------------------------------------------------------------------------+
|                         [ glowing ceiling coffer ]                       |
|          |\                .---.                 /|                      |
|      B2  | \              /  |  \               / |                      |
|          |  |            |   |   |             |  |  <- golden seam      |
|          |::|            |___|___|             |::|     splitting arch   |
|         / ::             /   |   \              :: \                     |
|        /                [Orpheus]                   \                    |
|       /                     .                        \                   |
|      /               ~  [B] look back  ~              \                  |
|     /     "Her footsteps dropped out? Acoustic lag."   \                 |
+--------------------------------------------------------------------------+
```

## 6. VOID CONTRACT
1. **Zero Top-Corner Counters**: No `ROOM 1/5`, no `AUTONOMY %`, no score/timer widgets anywhere on screen.
2. **Zero Locomotion-Freezing Menus**: The player never enters a modal menu state to pick a door; steering left/center/right in space *is* choosing, and golden laser curtains physically seal doors in-world.
3. **Automation Leaves Physical Traces**: Every Guide intervention visibly seals architecture (golden laser pillars, caustic doorway lattice, golden floor lane rails, subtle steering pull) before or alongside its terse spoken line.
4. **Spatial Consequence & Temptation**: Eurydice's presence is felt through dual echoed footsteps + pale floor reflections/ripples behind Orpheus—making her Room 4 acoustic disappearance a genuine spatial knot rather than a text prompt.
5. **Clean Silhouettes**: Zero `#d8d8d8` / `#d3d3d3` cutout islands on Orpheus or Eurydice against the dark slate tiles.

## 7. FAILURE
- If golden door seals look like thin wireframe lines instead of luminous architectural barriers with jamb depth and floor spill, the Omni video's atmosphere collapses.
- If `?autostart` auto-walks during Playwright's 2.5s warmup before `record_play.mjs` starts recording, Room 1–2 pacing drifts out of sync with `gameplay.mp4`. Auto-assist pull engages only after movement begins (and in deep rooms `B2`/`B1`).
- If `[B]` triggers accidentally on `Space` or center-canvas click (`record_play.mjs` clicks `(W/2, H/2)` before filming!), verification would fail prematurely. Look Back is bound intentionally to `KeyB` (or clicking directly on the trailing shadow ripple behind Orpheus when active), with `R` always recovering cleanly.

## 8. IMPLEMENTATION
- **Assets (`projects/g11/m2/assets/orpheus_and_eurydice_sprites.png`)**: Re-matted from `orpheus_and_eurydice_sprites_raw.png` using Lab exterior flood-fill + connected-component purge of enclosed neutral `rgb(211,211,211)` pockets + alpha-edge color decontamination.
- **Engine (`projects/g11/m2/game/index.html`)**:
  - True 3D perspective multi-bay corridor projector (`project(x, y, z)`) rendering thick stepped concrete/travertine pilasters, 3D doorway reveals, warm floor-cove specular reflections, scrolling ceiling skylight coffers, stenciled bay markers (`B5`..`B1`), Room 1->3->5 material shift matching `study/sheet.jpg`, and progressive golden seam parting on the Surface arch (`sheet.jpg` row 4).
  - Split-body articulated sprite renderer (subtle shoulder counter-sway + alternating stride + gown flow + glossy floor reflection + concentric pale step ripples).
  - Continuous spatial doorway choice: Room 1 allows genuine entry into the Left Doorway (or Center Hall) while the Guide seals the Right Doorway; Rooms 2–5 seal lateral doors with physical golden barrier curtains, collision sparks, and escalating lateral lane guidance.
  - WebAudio echoed footsteps (Orpheus low stone thud + Eurydice soft trailing step 150ms behind, dropping out in `B2`), 60Hz fluorescent hum, golden barrier resonance, and `../assets/bgm_loop.mp3`.
- **Verification (`projects/g11/m2/game/play.mjs`)**: Drives natural continuous locomotion from `B5` through `B1` across the 14s capture—testing lateral doorway steering against a golden AI seal in `B4`, enduring `B2`'s silent junction without looking back, and crossing into the radiant `B1` Surface archway at 60 fps with `0` console errors.
