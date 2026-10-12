# Lab 6: Classes, Populations & Medieval Trout — Teaching Guide

## Core Principle

**A class is a theory of what kind of thing exists. An instance is one particular thing carrying its own state. A population is what happens when that theory is instantiated many times.**

The lab should make this visible before students are asked to memorize syntax.

## Conceptual Lineage

### Craig Reynolds, Boids (1987)

Reynolds replaced individually scripted bird paths with independent actors responding to local neighbors. Separation, alignment, and cohesion produce aggregate flock motion.

Teaching translation:

- <class> [defines] a behavioral repertoire.
- new <instance> [carries] independent state.
- {instances} [interact] locally.
- {local interactions} [produce] <aggregate pattern>.

### E. O. Wilson as Provocation

Wilson's formulation, “Paleolithic emotions, medieval institutions and godlike technology,” is not presented as a deterministic model of human behavior. It is used as a deliberately oversized prompt for asking how different levels of a computational system can collide.

Trouttown translation:

- <Paleolithic trout drives> live inside individual instances.
- <Medieval institutions> live in environmental rules.
- <Godlike lure technology> amplifies one signal across the population.

The methodological lesson is that every simulation makes assumptions. If the programmer gives every trout an `obedience` property, the program has not discovered obedience. The programmer has made a modeling commitment.

---

# 90-Minute Delivery Sequence

| Time | Act | Active Surface | Choreography |
|---|---|---|---|
| 00–10m | Act 1: What Is a Trout? | Whiteboard / Lab Hub | Students name what one trout must know and do before seeing class syntax. Separate noun/state from operation. |
| 10–25m | Act 2: Class ≠ Instance | L6.02 Proof Surface | Change constructor default. Observe existing instances. Spawn a new trout. Select one instance. Make the distinction visible. |
| 25–40m | Act 3: From Boids to Schools | Reynolds lineage + L6.01 Mode 1 | Run local rules only. Ask students to infer the rules from motion. Introduce separation, alignment, cohesion. |
| 40–55m | Act 4: Medieval Institutions | L6.01 Mode 2 | Turn on abbey, toll gate, court, rank. Ask: what changed in the Trout class, and what changed in the world? |
| 55–65m | Act 5: Godlike Lure | L6.01 Mode 3 | Click open water. Watch attention override slower institutional constraints. Discuss state, force, and amplification. |
| 65–82m | Act 6: Studio Build | p5.js Editor | Students create one class, 8+ instances, update/display methods, then add one visible difference among instances. |
| 82–88m | Act 7: Change Test | Pair swap | Partner asks for one modification: speed trait, new method, click-to-add, institution zone, or color variation. Does the theory survive? |
| 88–90m | Act 8: Hand-In Check | Lab Hub | Verify PDF contents, video, working link, screenshot of sketch and code. |

---

# Whiteboard Script

Write:

```
<class Trout>
    <state>
    [operations]

new Trout(...)
    ↓
<one instance>

{many instances}
    ↓
<population>
```

Then ask:

> If I change one trout's speed, who should change?

Answer: one instance.

Then:

> If I change the constructor default, who should change?

Answer: future instances created with that default, unless code explicitly updates existing instances.

Then:

> If I add a toll gate, did the species change?

Answer: not necessarily. The environment can alter what happens to an individual without changing the individual's class definition.

---

# Naurian Theory Skeleton for Students

Before code, students fill in:

## <Initial Interpretation>

What kind of thing are you modeling?

## <Entities>

- <entity>
- <state>
- <collection>
- <environment>

## [Operations]

At least two actions the entity can perform.

## <Conditions>

What enables or blocks each action?

## <Invariant>

What should remain true every frame?

Examples:

- Every Fish has a position.
- Every Particle has a lifetime.
- Every Star can display itself.
- The array contains only instances of the intended class.

## <Assumption Ledger>

Name one thing your model assumes.

Examples:

- Nearby fish attract one another.
- Large stars move more slowly.
- Particles fade at a constant rate.

## <Change Test>

“What would change if the requirements changed?”

Examples:

1. Clicking must create a new instance.
2. Some instances need a different behavior.
3. The canvas must resize.
4. The entity changes from Fish to Star.

---

# Core Build

Minimum viable student structure:

```js
let things = [];

function setup() {
  createCanvas(600, 400);

  for (let i = 0; i < 20; i++) {
    things.push(new Thing(random(width), random(height)));
  }
}

function draw() {
  background(20);

  for (let thing of things) {
    thing.update();
    thing.display();
  }
}

class Thing {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  update() {
    // change instance state
  }

  display() {
    // make state visible
  }
}
```

Do not start class with inheritance. The point is instance state and behavior, not taxonomy.

---

# Trouttown Extension

Students who finish the core build can add one institution.

An institution is a rule that exists at the system/environment level and changes what happens when an instance meets a condition.

Examples:

### Toll Gate

```
<trout crosses x = gateX>
    [causes]
<pause or toll behavior>
```

### Abbey of Still Water

```
<trout inside abbey zone>
    [reduces]
<velocity>
```

### Current Court

```
<trout inside courthouse>
    [obeys]
<current decree>
```

### Lure Algorithm

```
<user click>
    [amplifies]
<attention at location>

<population>
    [moves toward]
<amplified signal>
```

---

# Failure Modes

## Failure: all instances move together

Likely cause: shared global state is being changed instead of `this.x`, `this.y`, etc.

Visible diagnosis: changing one entity changes every entity.

## Failure: only one object exists

Likely cause: the class was defined but only instantiated once.

Visible diagnosis: no meaningful population.

## Failure: students create arrays of plain objects but never use `new`

The Lab 5 theory survived, but Lab 6 did not happen.

Fix: identify what should become the constructor and instance methods.

## Failure: display and update are one giant method

Not technically invalid, but it hides the distinction between state transition and representation.

Ask students to separate:

```
<state_t> [update] <state_t+1>
<state> [display] <visible image>
```

## Failure: the “institution” is just a label

If the sign says TOLL GATE but nothing changes when a trout crosses it, the institution is decorative.

Rule:

> An institution must have a visible computational consequence.

---

# Discussion Questions

1. What did your class decide every instance must possess?
2. Which properties belong to individuals, and which belong to the world?
3. Could two instances share a class and still behave differently?
4. What behavior emerged that you did not explicitly animate instance-by-instance?
5. What assumption in your model would you most want to challenge?
6. When does organization become a claim about the thing being organized?

---

# Graded Requirements

The official Lab 6 requirements remain:

- At least one class defined by the student.
- An array or collection of multiple instances of that class.
- Methods such as `display()` and `update()` that make each instance do something.

## Deliverables

One PDF containing:

- Link to p5.js sketch.
- 3–4 sentence description of the interaction and intended feeling/observation.
- Screenshot of the working sketch and code.

Separate file upload:

- Video recording showing the interaction.

The Trouttown institution layer is an extension and teaching frame, not a mandatory aesthetic.

---

# Closer

End with:

> **A class does not merely save typing. It says what kind of thing the program believes exists.**

Then point back to the simulation:

```
<class> → <instance> → {population} → <institution> → <emergence>
```

The code is finished only when students can explain that chain without looking at the code.
