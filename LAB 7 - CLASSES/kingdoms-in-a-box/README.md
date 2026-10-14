# Kingdoms in a Box

Eleven small worlds, after Lem's Seventh Sally. Each box is one plain p5.js sketch built on a class: a constructor that decides what exists, and an update() that holds one rule.

- **01** Kealakekua Bay (the PIE slider: practical against symbolic)
- **02–08** The seven small worlds of *Growing Entanglements*: Epstein, Axelrod, Schelling, Watts–Strogatz, RebeLand, IRUBA, CCIM
- **09–11** METISIM: Lyrael, Duviii, Zylos

Open `index.html`. Each box has a goal that checks itself, sliders bound to the sketch's own `let` lines, the code (it runs in the p5 editor as is), and a film.

## Edit
- Boxes, goals and sketches: `worlds.js`.
- Film scripts (narration and actions): `film-src/films.js`.

## Re-render a film
From the repo root, serve the site: `python3 -m http.server 8765`. Then, in `film-src/`:

```
python3 build_voice.py city        # narration and timing (needs espeakng_loader, numpy)
node render.js mp4 city            # frames to films/city.mp4 (needs Playwright and ffmpeg)
```

`film.html?w=city&play` previews a film in the browser without sound.
