# Lab 6 · The Constructors

A one-screen p5.js bench for Lab 6 (classes). Plain HTML: open `index.html` from GitHub Pages, or double-click it.

- **15 screens**: Basics (1–3), Arrays (4–6), Classes (7–12), Arena (13–14), Hand-in (15).
- **Each screen** shows the code, the running sketch (real p5.js 1.11.10), a puzzle that checks itself, and a clip from *Two Sallies*.
- **PLAY** runs the code. **STEP** pauses and walks through one frame, line by line. **FROM START** steps through `setup()` too.
- **Click a line** to mark what it draws in the sketch. **Click a shape** to jump to the line that drew it.
- **Screen 13** pits a student's `Soldier` against five house teams. **COPY SHARE LINK** gives a link that adds the entry to screen 14 when opened.
- **Screen 14** runs the shared match: up to 25 entries. Entries come in as share links, pasted code, dropped `.js` files, or files listed in `entries/manifest.json`.

## Edit
- Lesson text, starter code, line notes and puzzle checks are in `lessons.js`.
- `story.text` on each lesson is a paraphrase with a page reference. Paste the exact passage from your copy there if you want it on screen.

## Files
- `lib/bench.js`: the editor, runner, step debugger and arena screens.
- `lib/bench-runtime.js`: runs inside the sketch frame. It traces lines, draws the puzzle scenes and reports errors.
- `lib/arena.js`: the match engine.
- `films/`: clips cut from the *Two Sallies* reel.

Entries run in the browser that opens them. Read each one with CODE before the first match.
