# Lab 1: Hello Mondrian — Master Pedagogical Delivery Blueprint

> **Course**: Intro to Computational Media  
> **Unit**: Week 03 · Foundation · Lab 01  
> **Reference Spec**: [l1-spec.md](file:///Users/gaia/2700_Fa26/l1-spec.md)  
> **Core Principle**: *Make causality visible. Show the visible consequence first; open the mechanism second.*

---

## 1. The Classroom Bifurcation Problem

In the very first programming lab, a cohort naturally splits into two extremes:

```
┌──────────────────────────────────────────────┐  ┌──────────────────────────────────────────────┐
│        THE "TOO HARD" COHORT (≈ 50%)         │  │        THE "TOO EASY" COHORT (≈ 30%)         │
├──────────────────────────────────────────────┤  ├──────────────────────────────────────────────┤
│ • Zero programming background                │  │ • Prior CS / coding experience              │
│ • Anxiety around semicolons & errors         │  │ • Finishes basic tutorial in 5 minutes       │
│ • Coordinate math confusion (Y-axis down)    │  │ • Bored by static rectangles                │
│ • Danger: Feeling defeated early             │  │ • Danger: Disengaging / checking out         │
└──────────────────────────────────────────────┘  └──────────────────────────────────────────────┘
```

**The Solution: Low Floor, High Ceiling, Wide Walls.**
Every demo must have a physical hook that anyone can bet on, an instant visual mechanic, and an optional algorithmic frontier for fast movers.

---

## 2. The 90-Minute Delivery Sequence

```
┌─────────────────┬───────────────────────────────────┬──────────────────────────────────────────┐
│ Time            │ Stage & Core Tool                 │ Pedagogical Action                       │
├─────────────────┼───────────────────────────────────┼──────────────────────────────────────────┤
│ 00 – 15 min     │ ACT 1: THE COLLECTIVE WAGER       │ [CY.01] The Impostor Test (v3)           │
│ 15 – 30 min     │ ACT 2: DECONSTRUCTING THE ENGINE  │ [ZA.06] Magic Circle Game (Setup vs Draw)│
│ 30 – 45 min     │ ACT 3: COORDINATE FORENSICS       │ [MN.01] Negative-Space Debugger          │
│ 45 – 80 min     │ ACT 4: DUAL-TRACK STUDIO WORK     │ [ZA.02] Studio Editor + Dual Extensions  │
│ 80 – 90 min     │ ACT 5: THE CLOSER / PHILOSOPHY    │ [MN.05] Mondrian Quine (Code as Canvas)  │
└─────────────────┴───────────────────────────────────┴──────────────────────────────────────────┘
```

---

### Act 1: The Collective Wager (00–15 min)
* **Active Tool**: `CY.01` · [The Impostor Test (v3)](file:///Users/gaia/2700_Fa26/lab01/call-your-shot-impostor-presentation-v3.html)
* **What You Show**: Project two side-by-side Mondrian compositions on the screen. Both look identical. One has a hidden syntax bug.
* **Instructor Script**:
  > *"Do not type anything yet. Look at these two programs. Both claim to draw this composition. One is an impostor that will crash the browser. Look at lines 4 through 9. Raise your hand if you bet on Sketch A. Raise your hand for Sketch B."*
* **Why It Works**: 
  - Low stakes, high energy. Even students who have never coded can spot differences.
  - Establishes that **code is readable text with causal consequences**.

---

### Act 2: Deconstructing the Engine (15–30 min)
* **Active Tool**: `ZA.06` · [Magic Circle Game](file:///Users/gaia/2700_Fa26/lab01/hello-world-magic-circle-game.html)
* **What You Show**: Interactive breakdown of `setup()` vs `draw()`.
* **Instructor Script**:
  > *"Every p5 sketch is a clock with two gears. `setup()` fires once when the world is born. `draw()` fires 60 times a second forever. If you put your background in `setup()`, your canvas remembers every mark. If you put it in `draw()`, it wipes the slate clean every frame."*
* **Remediation for "Too Hard"**: If a student is stuck on syntax, have them use `BP.04` (blockp5: One Unknown) to test shapes visually.

---

### Act 3: Coordinate Forensics & Negative Space (30–45 min)
* **Active Tool**: `MN.01` · [Mondrian Negative-Space Debugger](file:///Users/gaia/2700_Fa26/lab01/mondrian-negative-space-debug.html)
* **Reference**: `TH.03` · [Patent Reference 20110024177: Negative Space Programming](file:///Users/gaia/2700_Fa26/lab01/20110024177_2.pdf)
* **What You Show**: Click the canvas to highlight empty bounding rectangles between colored slabs.
* **Key Teaching Concept**:
  - In computer graphics, `(0, 0)` is the **top-left corner**.
  - `rect(x, y, w, h)` starts at top-left and extends right and down.
  - Mondrian's art is defined by the **rhythm of the negative space**, not just the colored patches.

---

### Act 4: Dual-Track Studio Production (45–80 min)
* **Active Tool**: `ZA.02` · [Zero-Assumption Editor (v0.8)](file:///Users/gaia/2700_Fa26/lab01/p5-native-zero-assumption-0.8.html) or [p5-from-scratch/index.html](file:///Users/gaia/2700_Fa26/lab01/p5-from-scratch/index.html)
* **Assignment Spec Alignment**: Students work on their 2 required sketches ([l1-spec.md](file:///Users/gaia/2700_Fa26/l1-spec.md)).

#### Scaffold Track for "Too Hard" Students:
1. Start with 1 colored rectangle: `fill(255, 0, 0); rect(0, 0, 150, 200);`
2. Add black structural lines: `stroke(0); strokeWeight(8); line(150, 0, 150, 400);`
3. Add a yellow rectangle in a bottom corner.
4. Success criteria: 4 rectangles, 2 thick lines, 3 primary colors.

#### Extension Track for "Too Easy" Students (The Challenges):
1. **Dynamic Asymmetry**: Make the rectangles resize based on `mouseX` and `mouseY` while preserving the Mondrian grid constraint.
2. **Generative Quine Challenge**: Make one rectangle draw the code string of its own coordinate numbers using `text()`.
3. **Procedural Partitioning**: Write a loop or recursion that splits the canvas into randomized sub-rectangles with constrained aspect ratios.

---

### Act 5: The Closer / Mind-Bender (80–90 min)
* **Active Tool**: `MN.05` · [Mondrian Quine](file:///Users/gaia/2700_Fa26/lab01/mondrian_quine.html)
* **The Punchline**:
  > *"Look at this canvas. It is Piet Mondrian's 'Composition with Red, Blue and Yellow'. But inside each rectangle, the painting is rendering its own JavaScript source code. In computational media, the image is not a picture of the code—the image IS the code."*
* **Exit Ticket**: Students capture their screenshot and screen recording for their PDF submission.

---

## 3. Architecture for Expanding Future Labs

The root `index.html` Semester Wheel is designed to scale dynamically for subsequent labs:

```
/Users/gaia/2700_Fa26/
├── index.html                   ── Master Semester Wheel & Dossier Engine
├── l1-spec.md                   ── Lab 01 Spec
├── lab01/                       ── Lab 01 (Week 03) [30 Prototypes, Favicons, Extracted Suites]
├── lab02/                       ── Lab 02 (Week 04) [Repetition & Loops]
├── lab03/                       ── Lab 03 (Week 05) [Variables & Agency]
├── lab04/                       ── Lab 04 (Week 06) [Data & Systems]
├── milestone01/                 ── Milestone 01 (Week 08)
└── game_systems/                ── Final Game Project (Week 11–16)
```

Each new lab will simply plug its item array into `weeks[i]` in `index.html` with its respective colored poison dart frog identifier!
