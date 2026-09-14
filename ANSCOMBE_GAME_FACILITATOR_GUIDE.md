# The Shopper, The Programmer, and The Detective
## Master Classroom Facilitator Guide & Cognitive Theory of Interactivity

> **Based on**: G.E.M. Anscombe, *Intention* (§32: Shopping List vs. Detective's Record)  
> **Course**: Intro to Computational Media (2700 Fall 2026)  
> **Unit**: Lab 3 · Interactivity, State, and Semantic Drift  
> **Interactive Tool**: [shopper_programmer_detective.html](file:///Users/gaia/2700_Fa26/LAB%203%20-%20INTERACTIVITY/shopper_programmer_detective.html)

---

## 1. The Core Cognitive Insight: Information Asymmetry

In conventional programming courses, student work collapses four separate computational realities into a single person's head:
1. **Intention**: What the designer wants the world to do.
2. **Implementation**: What the code actually computes.
3. **Observable Behavior**: What the machine displays.
4. **Interpretation**: What a visitor infers from experiencing it.

When one student writes code alone, they suffer from the **curse of knowledge**: because they know the click toggles a boolean called `isAwake`, they believe the user understands it too. When the user hesitates, the student says, *"Oh, you're supposed to click here twice."* **Instruction masks weak interaction.**

The Anscombe Game makes **intention, implementation, behavior, and interpretation four physically separate stages**. 

```
┌─────────────────┐        ┌─────────────────────┐        ┌───────────────────┐
│   LIST WRITER   │        │ SHOPPER/PROGRAMMER  │        │     DETECTIVE     │
│  WORDS → WORLD  │ ─────▶ │ WORDS → CODE → WORLD│ ─────▶ │   WORLD → WORDS   │
│   (Intention)   │        │  (Implementation)   │        │   (Inference)     │
└─────────────────┘        └─────────────────────┘        └───────────────────┘
         ▲                                                          │
         └────────────────── REVEAL & REPAIR ───────────────────────┘
```

The invariant: **The three people must not have identical information.** That information asymmetry is the engine of the game.

---

## 2. G.E.M. Anscombe's Two Directions of Fit

In §32 of *Intention* (1957), philosopher G.E.M. Anscombe imagined a man walking through a grocery store with a shopping list. Behind him, a detective follows him and writes down what he puts in his cart:

| Role | Artifact | Direction of Fit | If There is a Mismatch... |
| :--- | :--- | :--- | :--- |
| **List Writer** | Shopping List | $\text{Words} \longrightarrow \text{World}$ | **The cart is wrong.** The shopper failed to buy what was listed. The world must change to fit the words. |
| **Detective** | Observation Log | $\text{World} \longrightarrow \text{Words}$ | **The detective is wrong.** If the detective wrote down "butter" when the man took "margarine", the detective made an error. The words must change to fit reality. |

In computational media, this formalizes the entire lifecycle of software:
* The **List Writer** represents requirements, design intent, or prompt specification.
* The **Shopper** represents the developer or generative model realizing the specification in code.
* The **Detective** represents the user, tester, or reverse-engineer discovering the actual affordances through empirical probing.

---

## 3. The 4 Canonical Dilemma Presets in the Simulator

The interactive tool [shopper_programmer_detective.html](file:///Users/gaia/2700_Fa26/LAB%203%20-%20INTERACTIVITY/shopper_programmer_detective.html) includes 4 pre-built classroom dilemmas designed to highlight specific failure modes:

### Dilemma 1: The Shy Circle (Proximity & Continuous Coupling)
* **List**: `WHEN THE PERSON approaches the yellow circle, THE CIRCLE becomes increasingly anxious and backs away.`
* **Code**: Computes distance $d = \text{dist}(\text{mouseX}, \text{mouseY}, x, y)$. When $d < 160$, calculates evasion vector $(x - \text{mouseX}) \times 0.05$ with randomized jitter.
* **Detective Dilemma**: The detective easily observes that the circle runs away, but wonders: *Is it allergic to speed? Does it hate the pointer? What is the exact boundary where fear begins?*
* **Lesson**: Continuous spatial coupling (`WHERE` / `CHANGE`) creates visceral organic life without persistent memory.

### Dilemma 2: The Memory Vault (Two-Phase State Machine)
* **List**: `WHEN THE PERSON clicks the circle, THE WORLD remembers the visit and changes all future clicks.`
* **Code**: A multi-stage finite-state machine (`stage = 0, 1, 2`). First click attaches an elastic tether; second click places the circle; third click transmutes color.
* **Detective Dilemma**: First click does not move the circle—it only adds a halo and line. The detective thinks the click "failed" until they move the mouse.
* **Lesson**: State changes grammar. The same physical hardware click acquires completely different meanings depending on prior history (`REMEMBER`).

### Dilemma 3: Energy Gathering (Continuous Holding & Release)
* **List**: `WHEN THE PERSON holds down the mouse button, THE WORLD gathers kinetic energy and releases it on let-go.`
* **Code**: While `mouseIsPressed`, `charge` scalar accumulates up to 120. On `mouseReleased()`, energy decays outward in a shockwave.
* **Detective Dilemma**: The detective taps the mouse repeatedly and nothing happens. They conclude the sketch is broken until they accidentally hold the button down.
* **Lesson**: The drag / hold (`WHILE` / `BETWEEN`) is not a click; it is an extended temporal phrase.

### Dilemma 4: Two Shoppers, Same Prompt (Generative / Prompt Drift)
* **List**: `WHEN THE PERSON clicks the circle, THE CIRCLE refuses.`
* **Shopper A**: Implements teleportation to a random coordinate.
* **Shopper B**: Implements turning bright red and violently shaking in place.
* **Lesson**: One natural language prompt underdetermines the computational world. "Same prompt, different model, different world."

---

## 4. The 30-Minute In-Class Workshop Flow

Divide the room into **triads**: Person A (List Writer), Person B (Shopper), Person C (Detective).

```
┌──────────────────┬──────────────────────────────────────────────────────────────────┐
│ Time             │ Stage Activity                                                   │
├──────────────────┼──────────────────────────────────────────────────────────────────┤
│ 00 – 05 min      │ Round 1: List Writer pens the Proposition Card                   │
│ 05 – 15 min      │ Round 2: Shopper codes the p5.js implementation                  │
│ 15 – 22 min      │ Round 3: Detective probes the running sketch (blindfold on code) │
│ 22 – 27 min      │ Round 4: The 3-Way Reveal & Anscombe Diagnostic                  │
│ 27 – 30 min      │ Round 5: The Repair Loop (1 sentence / 1 line changed)          │
└──────────────────┴──────────────────────────────────────────────────────────────────┘
```

### The Rules of Engagement:
1. **Rule of Silence**: During Round 2, the Shopper may not ask the Writer what they "really meant".
2. **Rule of Blindness**: During Round 3, the Detective may not look at the code or the original card. They may only interact with the canvas.
3. **The Reveal**: In Round 4, all three artifacts are laid side-by-side on the table or screen.

---

## 5. The Critical Debrief Questions

Conclude the activity with these questions on the board:

1. **Where did the meaning change?**
   - Was the ambiguity in the Writer's English?
   - Did the Shopper operationalize a metaphor into numbers in an unexpected way?
   - Was critical state invisible to the Detective?
2. **Can the Detective be wrong about the code but right about the experience?**
   - If the code calculates `distance < 100`, but the Detective writes *"The circle gets shy when I corner it"*, did the Detective fail, or did the aesthetic experience succeed?
3. **Why does Same Visible Behavior $\neq$ Same Program Theory?**
   - Could two completely different programs produce the exact same observable trace?
