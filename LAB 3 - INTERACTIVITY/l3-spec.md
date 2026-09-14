# Lab 3: Consequential Interaction as State Transition

> **Course**: Intro to Computational Media (2700 Fall 2026)  
> **Unit**: Week 05 · Interaction & State  
> **Core Invariant**: **Make a sketch where what a person does becomes consequential to what the computational world does.**

---

## 1. Overview: Beyond the Inert Callback

In introductory programming, interactivity is frequently mistaught as "calling an event function" (e.g., placing code inside `mousePressed()` or `keyPressed()`). But executing a callback is not yet an interaction. Placing `console.log("clicked")` inside `mousePressed()` satisfies the syntax of an event, but leaves the experienced computational world completely unchanged.

This lab treats an interactive sketch as a **small state-transition system with a human participant inside its transition function**:

$$S_{t+1} = F(S_t, I_t)$$

where:
* $S_t$ is the current computational state of the sketch (positions, sizes, modes, colors, velocities, counters).
* $I_t$ is the participant's physical input signal (pointer coordinates, button presses, key strikes, drags, holds, or releases).
* $F$ is your transition rule (how the program recomputes state in response to input).
* $P_t$ is the perceptible presentation rendered to the screen or speakers ($P_t = \text{Render}(S_t)$).

**Interaction exists pedagogically only when human action propagates into observable difference**:

$$I_t \longrightarrow \Delta S \longrightarrow \Delta P$$

In the special case of **continuous coupling** (e.g., a circle tracking the pointer), state does not require persistent memory across clicks, but directly couples perception to the input stream: $P_t = G(S_t, I_t)$.

---

## 2. The Temporal Interaction Grammar

Do not organize your thinking around hardware categories (*"I will use the mouse, then I will use the keyboard"*). Organize your design around **temporal relations**:

| Temporal Operator | Meaning | Mathematical / State Role | p5.js Primitive Example |
| :--- | :--- | :--- | :--- |
| **WHERE** | Continuous spatial coupling | $P_t = G(S_t, I_t)$ | `mouseX`, `mouseY` |
| **WHEN** | Discrete event interrupt | $S_{t+1} = F(S_t, I_t)$ | `mousePressed()`, `keyPressed()` |
| **WHILE** | Sustained continuous engagement | $S_{t+1} = F(S_t, I_t) \text{ while } I_t = 1$ | `mouseIsPressed`, `keyIsPressed` |
| **BETWEEN** | The expressive phase between press and release | Drag / gesture trajectory | `mouseDragged()`, `mouseReleased()` |
| **CHANGE** | Metric threshold / boundary crossing | $I_t \text{ crosses threshold } \rightarrow \Delta S$ | `dist(mouseX, mouseY, x, y) < radius` |
| **REMEMBER** | Persistent state altering future grammar | $S_{t+1} \text{ stores history that modifies future } F$ | `let selected = true;`, state machines |

Every interaction begins from the foundational proposition:
$$\text{\textbf{WHEN THE PERSON \_\_\_\_\_, THE WORLD \_\_\_\_\_.}}$$

---

## 3. Assignment Requirements

You will construct **one working p5.js sketch** anchored in expressive poverty:
* **The Expressive Poverty Anchor**: Begin with a single yellow circle (or equivalent minimal primitive). Do not hide weak interaction behind decorative visual complexity.
* **The Causal Consequence Requirement**: The participant must enter the causal structure of the program. Holding initial program conditions constant, two different participant actions must produce observably different computational trajectories or perceptibly coupled present states.
* **At Least Two Temporal Operators**: Your sketch must combine at least two operators from the Temporal Grammar (e.g., `WHERE` + `REMEMBER`, or `CHANGE` + `BETWEEN`, or `WHEN` + `WHILE`).
* **Implementation Separation**: Follow the clean architectural pipeline:
  1. `SENSE`: Sample continuous input or receive discrete event interrupt.
  2. `TRANSITION`: Mutate state variables ($S_{t+1} = F(S_t, I_t)$).
  3. `RENDER / RESPOND`: Expose state consequence through perceptible feedback (visual and/or audio).

---

## 4. Deliverables & Evidence Stack

Submit a single PDF containing the following four elements:

### 1. The p5.js Web Editor Link (1 pt)
* A publicly accessible link to your running sketch. The sketch must execute without syntax errors.

### 2. The Temporal Interaction Trace (2 pts)
* A static screenshot cannot prove interactivity because interaction is temporally constituted across time.
* Provide an **Interaction Trace table** or short sequential frame strip documenting:
  1. $\text{STATE}_0$: The initial world condition before the participant acts.
  2. $\text{ACTION}$: The participant's physical input signal ($I_t$).
  3. $\text{TRANSITION}$: The internal state mutation ($\Delta S$).
  4. $\text{CONSEQUENCE } (\text{STATE}_1)$: The resulting perceptible difference ($\Delta P$).

### 3. The Unannounced Peer Encounter Report (1 pt)
* Have one peer or friend encounter your sketch **without verbal explanation or coaching**.
* Observe their first 60 seconds of interaction.
* Document:
  * What did the person attempt to do first?
  * Did your interface provide sufficient affordance/signification, or did they experience an anomaly?
  * What did their action teach you about your action-consequence mapping?

### 4. Mapping Reflection (1 pt)
* A 2–4 sentence technical reflection naming the exact mathematical/operational mapping:
  * *"When the person [action], the program calculates [transition] on [variable], which causes the world to [perceptible difference]."*
  * Do not simply describe your aesthetic intentions (*"I wanted it to feel calm"*); describe the causal relationship you built.

---

## 5. Assessment Rubric (Total: 5 Points)

```
┌────────────────────────────┬──────┬─────────────────────────────────────────────────────────────────────────┐
│ Criteria                   │ Pts  │ Observable Standard                                                     │
├────────────────────────────┼──────┼─────────────────────────────────────────────────────────────────────────┤
│ Causal Consequence         │ 2.0  │ Participant action directly causes an internal state transition         │
│                            │      │ (ΔS) that produces a perceptible difference (ΔP). Inert callbacks     │
│                            │      │ or cosmetic decorations receive 0.                                      │
├────────────────────────────┼──────┼─────────────────────────────────────────────────────────────────────────┤
│ Temporal Grammar & State   │ 1.0  │ Clean implementation combining at least two temporal operators          │
│                            │      │ (WHERE, WHEN, WHILE, BETWEEN, CHANGE, REMEMBER). SENSE/TRANSITION/RENDER│
│                            │      │ pipeline cleanly separated in code.                                     │
├────────────────────────────┼──────┼─────────────────────────────────────────────────────────────────────────┤
│ Temporal Trace Evidence    │ 1.0  │ Clear multi-step documentation showing STATE₀ → ACTION → ΔS → STATE₁.   │
├────────────────────────────┼──────┼─────────────────────────────────────────────────────────────────────────┤
│ Peer Encounter & Mapping   │ 1.0  │ Honest documentation of an uncoached participant encounter and precise  │
│                            │      │ explanation of the operational mapping.                                 │
└────────────────────────────┴──────┴─────────────────────────────────────────────────────────────────────────┘
```

> [!NOTE]
> **Anti-Patterns That Fail:**
> * `console.log("click")` without canvas state modification fails ($\Delta P = 0$).
> * Replacing interface affordance with an essay of instructional text on screen fails Donald Norman's discoverability criterion.
> * Adding 50 random shapes with zero responsive behavior fails the causal consequence requirement.
