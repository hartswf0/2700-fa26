---
name: wargames-video-to-game-gemini
description: >-
  Gemini-native port of lovisdotio/video-to-game for the 18 WarGames student projects across milestones M1–M7.
  Replaces fal.ai completely with Gemini Omni 1.2 Flash (`gemini-omni-1.2-flash`), Nano Banana 2.1 / Pro
  (`gemini-nano-banana-2.1`, `gemini-3-pro-image`), Lyria (`lyria-3-clip-preview`, `lyria-3.5`), Gemini 3.8 TTS,
  and local OpenCV/BiRefNet sprite cutouts (`cutout.py`).
---

# WarGames × Video-to-Game (Gemini Edition)

This directory adapts [lovisdotio/video-to-game](https://github.com/lovisdotio/video-to-game) to run **100% on the Google Gemini API** (`google-genai >= 3.2.0` Interactions API) across all **18 WarGames projects** (`M2` first, structured for `M1`–`M7` milestone chaining).

## Model Mapping (`fal` → Gemini API)

| Pipeline Role | Original `fal` Model | Gemini Replacement | Script / Flag |
|---|---|---|---|
| **Gameplay Seed Video** (10s, 1080p, 16:9 + audio) | `minimax/h3-max/text-to-video` | **`gemini-omni-1.2-flash`** *(Veo 3.1 shut down Oct 22, 2026)* | `gemini_asset.py video` |
| **Milestone Video Evolution** (`M2` → `M3`..`M7`) | *(none)* | **`gemini-omni-1.2-flash`** (`--previous-interaction-id`, `--extend`, `--video`) | `run_pipeline.py --milestone m3` |
| **Sprites, Concepts, Tiles, Backgrounds** | `fal-ai/nano-banana-pro/edit` | **`gemini-nano-banana-2.1`** (or `-m gemini-3-pro-image`) | `gemini_asset.py image` |
| **Alpha Sprite Cutouts** | `fal-ai/birefnet/v2` | **`cutout.py`** (local Lab border flood-fill + optional `rembg`) | `gemini_asset.py image --cutout` |
| **Music Loops & Full Tracks** | `elevenlabs/music/v2.5` | **`lyria-3-clip-preview`** (30s loop) / **`lyria-3.5`** | `gemini_asset.py music` |
| **Voiceover / Terminal Speech** | `elevenlabs/*` | **`gemini-3.8-flash-tts`** | `gemini_asset.py tts` |
| **Video Study, Side-by-Side & Playtest** | Local (`ffmpeg` + Playwright) | **Unchanged** (`study_video.py`, `side_by_side.py`, `record_play.mjs`, `best_window.py`) | `run_pipeline.py --stages verify` |

## Setup

1. **`google-genai` SDK** (already installed: `v3.5.0`), `ffmpeg`, Node 18+ with `playwright-core`, Python `PIL` + `cv2` + `numpy`.
2. **Set `GEMINI_API_KEY`** in `wargames-v2g/.env` or export in shell:
   ```bash
   export GEMINI_API_KEY="your-gemini-api-key"
   ```

## End-to-End Workflow per Project

1. **Generate Video + Study + Assets (`M2`)**:
   ```bash
   # Single project (e.g. Group 1: Space Farmer)
   python3 scripts/run_pipeline.py --project g1 --milestone m2 --stages video,study,assets

   # Batch all 18 M2 gameplay videos in parallel (concurrency 3)
   python3 scripts/gemini_asset.py batch --batch data/jobs_m2_videos.json --concurrency 3
   ```
2. **Build the Game (`projects/<id>/m2/game/index.html` + `play.mjs`)**:
   - Inspect `projects/<id>/m2/study/sheet.jpg`, `study.json` (extracted hex palette & cut times), and `spec.json` (M2 state flowchart, verb, fail, ending).
   - Build a self-contained `index.html` loading the generated Nano Banana cutouts (`../assets/*.png`) and Lyria soundtrack (`../assets/bgm_loop.mp3`), exposing `window.__game.state` and supporting `?autostart&seed=N`.
   - Write `play.mjs` driving the game purely via `page.keyboard` / mouse while reading `window.__game.state`.
3. **Film Playtest & Side-by-Side Proof**:
   ```bash
   python3 scripts/run_pipeline.py --project g1 --milestone m2 --stages verify
   ```
4. **Evolve Across Milestones (`M3`–`M7`)**:
   ```bash
   # Uses M2's saved `interaction_id` (`v1_...`) from `m2/video/gemini_log.json`!
   python3 scripts/run_pipeline.py --project g1 --milestone m4 --stages video,study
   ```
