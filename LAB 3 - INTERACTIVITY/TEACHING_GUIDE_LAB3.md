# Lab 3: Consequential Interaction as State Transition — Master Pedagogical Delivery Blueprint

> **Course**: Intro to Computational Media (2700 Fall 2026)  
> **Unit**: Week 05 · Interaction, Variables & State  
> **Reference Spec**: [l3-spec.md](file:///Users/gaia/2700_Fa26/LAB%203%20-%20INTERACTIVITY/l3-spec.md)  
> **Core Principle**: *An interactive sketch is a tiny dynamical system with a human inside its transition function: $I_t \rightarrow \Delta S \rightarrow \Delta P$.*

---

## 1. The Classroom Bifurcation Problem in Interactivity

In the interaction lab, cohorts fragment across a subtle conceptual divide:

```
┌────────────────────────────────────────────────────────┐  ┌────────────────────────────────────────────────────────┐
│             THE "INERT CALLBACK" COHORT (≈ 50%)        │  │           THE "FEATURE EXPLOSION" COHORT (≈ 30%)       │
├────────────────────────────────────────────────────────┤  ├────────────────────────────────────────────────────────┤
│ • Treats interaction as placing code in mousePressed() │  │ • Pastes 10 unrelated event callbacks                  │
│ • Puts console.log() or random colors everywhere       │  │ • Adds endless shapes and decorative noise             │
│ • Confuses continuous variables (mouseX) with events   │  │ • Confuses visual complexity with interactive agency   │
│ • Stumbles on state variables and scope                │  │ • Interface lacks discoverability or feedback loop     │
│ • Danger: Building non-interactive decoration          │  │ • Danger: Disorganized spaghetti state machines         │
└────────────────────────────────────────────────────────┘  └────────────────────────────────────────────────────────┘
```

**The Pedagogical Solution**:
* **Anchor in Expressive Poverty**: Mandate starting from **one yellow circle**. Removing decorative noise makes the mechanics of state, mapping, and causality transparent.
* **The State-Transition Invariant**: Define interaction as:
  $$S_{t+1} = F(S_t, I_t) \quad \text{where} \quad I_t \longrightarrow \Delta S \longrightarrow \Delta P$$
* **The Temporal Grammar**: Reframe hardware APIs into temporal operators: `WHERE`, `WHEN`, `WHILE`, `BETWEEN`, `CHANGE`, and `REMEMBER`.

---

## 2. The 90-Minute Delivery Sequence

```
┌─────────────────┬───────────────────────────────────┬──────────────────────────────────────────┐
│ Time            │ Stage & Core Tool                 │ Pedagogical Action                       │
├─────────────────┼───────────────────────────────────┼──────────────────────────────────────────┤
│ 00 – 15 min     │ ACT 1: THE INERT CALLBACK TEST    │ [CY.03] The Impostor Test: ΔP = 0 vs ΔP>0│
│ 15 – 30 min     │ ACT 2: INVERSION & THE TIME TRACE │ [Slide 01–05] Inversion of Control       │
│ 30 – 45 min     │ ACT 3: TEMPORAL GRAMMAR & STATE   │ [Slide 06–13] Bolt's "Put That There"    │
│ 45 – 80 min     │ ACT 4: DUAL-TRACK STUDIO WORK     │ Studio Editor + Peer Encounter Protocol  │
│ 80 – 90 min     │ ACT 5: THE CLOSER / AUTONOMY      │ [Slide 14–16] Flappy Dynamics & The Verb │
└─────────────────┴───────────────────────────────────┴──────────────────────────────────────────┘
```

---

### Act 1: The Inert Callback Impostor Test (00–15 min)
* **Active Tool**: [lab3_fixed_lecture_slides.html](file:///Users/gaia/2700_Fa26/LAB%203%20-%20INTERACTIVITY/lab3_fixed_lecture_slides.html)
* **What You Show**: Project two sketches side by side.
  * *Sketch A*: Has `function mousePressed() { console.log("clicked"); }`
  * *Sketch B*: Has `function mousePressed() { x = mouseX; y = mouseY; }`
* **Instructor Script**:
  > *"Do not type anything yet. Look at these two sketches. Both claim to be interactive. Both have mousePressed(). But one is an impostor. In Sketch A, the human clicked, but the world experienced zero difference. In computational media, executing an interrupt is not an interaction. Interaction only exists when: Human Action $\rightarrow$ State Difference $\rightarrow$ Perceptible Difference."*
* **Why It Works**:
  - Immediately disabuses students of the belief that wrapping code in a callback function constitutes interactivity.

---

### Act 2: Inversion of Control & The Ontology of Time (15–30 min)
* **Active Tool**: [Slide 01–05 in Fixed Lecture Slides](file:///Users/gaia/2700_Fa26/LAB%203%20-%20INTERACTIVITY/lab3_fixed_lecture_slides.html) & [Cloud or Clock](file:///Users/gaia/2700_Fa26/LAB%203%20-%20INTERACTIVITY/LAB3_CLOUD_CLOCK_QUOTED_PRESENTATION.html)
* **What You Show**:
  1. `draw()` as a browser scheduler (Inversion of Control: you do not call `draw()`; p5 calls it 60 times a second).
  2. The Ontology of Time (Slide 5):
     - `background(245)` in `setup()` $\rightarrow$ past frames accumulate as an interactive trace (memory).
     - `background(245)` in `draw()` $\rightarrow$ history is wiped every 16ms (instantaneous present / animation).
* **Instructor Script**:
  > *"Moving background() by one line changes time itself. In draw(), the computer forgets everything every 16 milliseconds. In setup(), the screen remembers every move of your hand. Which world do you want to build: an erasing clock, or an accumulating canvas?"*

---

### Act 3: The Temporal Interaction Grammar & State Machine (30–45 min)
* **Active Tool**: [Slide 06–13 in Fixed Lecture Slides](file:///Users/gaia/2700_Fa26/LAB%203%20-%20INTERACTIVITY/lab3_fixed_lecture_slides.html)
* **Key Concept**: Introduce the six temporal operators:
  1. **WHERE**: `mouseX, mouseY` continuous coupling.
  2. **WHEN**: `mousePressed()` discrete polite interruption.
  3. **WHILE**: `mouseIsPressed` sustained continuous holding.
  4. **BETWEEN**: `mouseDragged()` the computational life between press and release.
  5. **CHANGE**: `dist(...) < radius` proximity boundary crossing.
  6. **REMEMBER**: `let selected = false;` persistent boolean state.
* **The Richard Bolt Showcase (Slide 12–13)**:
  - Richard Bolt (1980 MIT Architecture Machine Group): *"Put-That-There"*.
  - Show how the same mouse button performs two distinct semantic acts because of stored state:
    - First click: `selected = true` (**THAT**). Elastic visual tether appears.
    - Second click: `x = mouseX; y = mouseY; selected = false;` (**THERE**).
  - State transforms the grammar of subsequent events.

---

### Act 4: Dual-Track Studio Production & The Anscombe Game (45–80 min)
* **Active Interactive Tools**: 
  - [shopper_programmer_detective.html](file:///Users/gaia/2700_Fa26/LAB%203%20-%20INTERACTIVITY/shopper_programmer_detective.html) — *The Anscombe Interactivity Game Instrument*
  - [ANSCOMBE_GAME_FACILITATOR_GUIDE.md](file:///Users/gaia/2700_Fa26/LAB%203%20-%20INTERACTIVITY/ANSCOMBE_GAME_FACILITATOR_GUIDE.md) — *Master In-Class Triad Workshop Guide*
  - [LAB3_YELLOW_CIRCLE_ACTUALLY_WORKS.html](file:///Users/gaia/2700_Fa26/LAB3_YELLOW_CIRCLE_ACTUALLY_WORKS.html) — *Studio Live Coding Workbench*
* **Assignment Brief**: [l3-spec.md](file:///Users/gaia/2700_Fa26/LAB%203%20-%20INTERACTIVITY/l3-spec.md).

#### Scaffold Track (For "Inert Callback" Students):
1. Keep the yellow circle at `(x, y)`.
2. Implement **Hit-Testing**: Use `dist(mouseX, mouseY, x, y) < 35` to detect when the pointer is inside the circle.
3. Add a boolean state: `let happy = false;`.
4. When clicked inside, toggle `happy = !happy;`.
5. In `draw()`, render different feedback if `happy` is true (e.g. golden glow vs blue ring).
6. Success criteria: Action $\rightarrow$ State Change $\rightarrow$ Perceptible Consequence.

#### Extension Track (For "Feature Explosion" Students):
1. **Kinetic Inertia / Fling**: Use `pmouseX, pmouseY` to calculate velocity vectors. On release, the circle glides with momentum and decelerates via friction.
2. **Autonomous Counter-Dynamics (*Flappy Dynamics*)**: Give the circle an autonomous falling velocity (`y += gravity`). The user's input is not absolute control, but an upward impulse that resists falling.
3. **Executable Analogy (*Make That Like That*)**: Two objects on screen. Clicking Object A samples its radius and color; clicking Object B transfers those properties.

#### The Peer Encounter Protocol (Last 15 minutes of Studio):
* Students pair up with a neighboring student.
* **Rule**: You may not speak, explain, or gesture toward your sketch.
* The peer interacts for 60 seconds.
* The author records:
  1. What was the peer's very first action?
  2. Did they discover the interaction mapping, or did they experience an anomaly?
  3. How will the author revise their signifiers or feedback based on this observation?

---

### Act 5: The Closer / Philosophy of Agency (80–90 min)
* **Active Tool**: [Slide 14–16 in Cloud or Clock](file:///Users/gaia/2700_Fa26/LAB%203%20-%20INTERACTIVITY/LAB3_CLOUD_CLOCK_QUOTED_PRESENTATION.html)
* **The Punchline**:
  > *"Participation is not the same as domination. In Flappy Bird, the game has its own autonomous gravity; the player only nudges it. In an art system, the object can resist, hide, or refuse. Your assignment is to construct one sentence: WHEN THE PERSON \_\_\_\_\_, THE WORLD \_\_\_\_\_. Make what the human does consequential to what the computational world does next."*
* **Exit Ticket**: Verify that every student has recorded an Interaction Trace ($\text{STATE}_0 \rightarrow \text{ACTION} \rightarrow \Delta S \rightarrow \text{STATE}_1$) for their assignment PDF.
