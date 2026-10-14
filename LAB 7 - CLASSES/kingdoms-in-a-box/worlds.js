/* KINGDOMS IN A BOX · the boxes
   Each box is one plain p5.js sketch built on a class. The top-level `let` values listed in
   `params` become the sliders. `check(V, M, S)` is the goal: V holds the sketch's top-level
   variables, M is memory that lasts across restarts, S is {t, frame, clicks, run}.
   Sources: Hartsoe, "Growing Entanglements" (abm-paper.html) and METISIM (index.html). */

const GROUPS = [
  { key: 'BAY', name: 'The Bay' },
  { key: 'SEVEN', name: 'Seven Small Worlds' },
  { key: 'METISIM', name: 'METISIM' },
];

const WORLDS = [
  /* =============================================================== BAY */
  {
    id: 'bay', group: 'BAY', no: '01', title: 'Kealakekua Bay', source: 'Sahlins 1985 · Obeyesekere 1992 · the PIE slider',
    aphorism: 'Cook’s death can be grown from practical agents. It can also be grown from ritual obligations.',
    aphRef: 'Growing Entanglements',
    frame: 'Trurl builds the bay of 1779 in a box. Klapaucius asks which rule grew the crowd on the shore. Trurl runs it twice.',
    goal: 'Grow the confrontation twice: once with symbolic at 0.2 or less, once at 0.8 or more. A confrontation is 40% of the islanders active on the shore at the same moment.',
    click: 'Click the village: a cutter is taken, a rite is broken.',
    params: [{ name: 'symbolic', label: 'Practical ↔ Symbolic', min: 0, max: 1, step: 0.05 }],
    sketch: String.raw`// BOX 01 · KEALAKEKUA BAY, 1779
// "Cook's death can be grown from practical agents.
//  It can also be grown from ritual obligations."
// symbolic = 0 runs the practical rule (Obeyesekere): grievance against risk.
// symbolic = 1 runs the ritual rule (Sahlins): a rite broken nearby is broken for you too.
// Click the village to cause a disturbance.

let symbolic = 0.5;
let islanders = [];

function setup() {
  createCanvas(800, 500);
  for (let i = 0; i < 90; i++) {
    islanders.push(new Islander(random(30, 770), random(70, 300)));
  }
}

function draw() {
  background(245);
  drawBay();
  for (let p of islanders) {
    p.update(islanders);
    p.display();
  }
}

function mousePressed() {
  for (let p of islanders) {
    if (dist(mouseX, mouseY, p.x, p.y) < 110) {
      p.hardship = min(1, p.hardship + 0.45);
      p.breach = min(1, p.breach + 0.45);
    }
  }
}

class Islander {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.hardship = random(0.1, 0.5);      // practical: what has been lost
    this.riskAversion = random(0.3, 0.8);  // practical: fear of acting alone
    this.breach = random(0.05, 0.45);      // symbolic: how broken the rite is
    this.active = false;
  }

  update(all) {
    let near = 0;
    let activeNear = 0;
    let breachMax = 0;
    for (let o of all) {
      if (o !== this && dist(this.x, this.y, o.x, o.y) < 70) {
        near++;
        if (o.active) activeNear++;
        breachMax = max(breachMax, o.breach);
      }
    }
    // practical rule: grievance minus the risk of acting without support
    let support = near > 0 ? activeNear / near : 0;
    let practical = this.hardship - (1 - support) * this.riskAversion;
    // ritual rule: take on the most broken rite among the neighbours
    if (near > 0) this.breach = lerp(this.breach, breachMax, 0.02);
    let ritual = this.breach - 0.5;
    // the agential cut: how much of each rule is in this world
    let drive = (1 - symbolic) * practical + symbolic * ritual;
    this.active = drive > 0.05;
    // the active go down to the shore; the quiet stay near home
    if (this.active) this.y += 1.2;
    else this.y += random(-0.6, 0.6);
    this.x = constrain(this.x + random(-0.8, 0.8), 20, width - 20);
    this.y = constrain(this.y, 60, 318);
    this.hardship *= 0.9995;
    this.breach *= 0.9995;
  }

  display() {
    stroke(30);
    if (this.active) fill(194, 59, 34);
    else fill(255, 220, 0);
    circle(this.x, this.y, this.active ? 13 : 10);
  }
}

function drawBay() {
  noStroke();
  fill(214, 228, 234);
  rect(0, 330, width, 170);
  stroke(30);
  strokeWeight(2);
  line(0, 330, width, 330);
  strokeWeight(1);
  ship(560, 420);
  ship(690, 448);
  noStroke();
  fill(30);
  textSize(12);
  text("KEALAKEKUA BAY, FEBRUARY 1779", 14, 22);
  text("symbolic " + nf(symbolic, 1, 2), 14, 488);
}

function ship(x, y) {
  stroke(30);
  fill(245);
  quad(x - 40, y, x + 40, y, x + 30, y + 14, x - 30, y + 14);
  line(x - 15, y, x - 15, y - 50);
  line(x + 12, y, x + 12, y - 42);
  line(x - 34, y - 34, x + 30, y - 34);
}`,
    check(V, M) {
      const P = V.islanders || [];
      const n = P.length || 1, shore = P.filter((p) => p.active && p.y > 300).length / n;
      M.run = M.run || {};
      if (M.run.min === undefined || V.symbolic < M.run.min) M.run.min = V.symbolic;
      if (M.run.max === undefined || V.symbolic > M.run.max) M.run.max = V.symbolic;
      if (shore >= 0.4) { if (M.run.max <= 0.2) M.practical = true; if (M.run.min >= 0.8) M.symbolic = true; }
      return [[!!M.practical, 'Grown with the practical rule (symbolic ≤ 0.2 for the whole run)'], [!!M.symbolic, 'Grown with the ritual rule (symbolic ≥ 0.8 for the whole run)'], [shore >= 0.4, `On the shore now: ${Math.round(shore * 100)}% (need 40%)`]];
    },
    done: (items) => items[0][0] && items[1][0],
    resetRun: (M) => { M.run = {}; },
  },

  /* =============================================================== SEVEN SMALL WORLDS */
  {
    id: 'crowd', group: 'SEVEN', no: '02', title: 'The Quiet Crowd', source: 'Epstein 2002 · Civil Violence',
    aphorism: 'The crowd is quiet until risk changes.',
    aphRef: 'Growing Entanglements · Model 01',
    frame: 'In the Seventh Sally, Trurl builds a whole kingdom in a box for a tyrant. Here the box holds a square full of citizens and a few police.',
    goal: 'Leave legitimacy where it is. Change only the risk: click police away until the quiet breaks and a quarter of the square is active.',
    click: 'Click a police officer to remove it. Click an empty spot to add one.',
    params: [{ name: 'legitimacy', label: 'Legitimacy', min: 0, max: 1, step: 0.01 }],
    sketch: String.raw`// BOX 02 · EPSTEIN (2002), CIVIL VIOLENCE
// "The crowd is quiet until risk changes."
// grievance = hardship * (1 - legitimacy)
// a citizen turns active when grievance - riskAversion * arrestRisk > 0.1
// Click a police officer to remove it. Click an empty spot to add one.

let legitimacy = 0.85;
let cols = 40;
let rows = 25;
let grid = [];
let citizens = [];
let police = [];

function setup() {
  createCanvas(800, 500);
  for (let j = 0; j < rows; j++) grid.push(new Array(cols).fill(null));
  for (let k = 0; k < 680; k++) place(new Citizen());
  for (let k = 0; k < 45; k++) place(new Officer());
}

function draw() {
  background(245);
  if (frameCount % 4 === 0) {
    for (let c of shuffle(citizens.concat(police))) c.update();
  }
  for (let c of citizens) c.display();
  for (let p of police) p.display();
  noStroke();
  fill(30);
  textSize(12);
  text("active " + activeShare() + "%   police " + police.length + "   jailed " + citizens.filter(c => c.jail > 0).length + "   legitimacy " + nf(legitimacy, 1, 2), 12, 492);
}

function activeShare() {
  let free = citizens.filter(c => c.jail === 0);
  return round(100 * free.filter(c => c.active).length / max(1, free.length));
}

function place(a) {
  let i, j;
  do { i = floor(random(cols)); j = floor(random(rows - 1)); } while (grid[j][i]);
  a.i = i; a.j = j; grid[j][i] = a;
  if (a instanceof Citizen) citizens.push(a); else police.push(a);
}

function neighbours(i, j, r) {
  let out = [];
  for (let dj = -r; dj <= r; dj++) for (let di = -r; di <= r; di++) {
    let a = grid[(j + dj + rows) % rows][(i + di + cols) % cols];
    if (a && !(di === 0 && dj === 0)) out.push(a);
  }
  return out;
}

function wander(a) {
  let di = floor(random(-1, 2)), dj = floor(random(-1, 2));
  let ni = (a.i + di + cols) % cols, nj = (a.j + dj + rows) % rows;
  if (nj < rows - 1 && !grid[nj][ni]) { grid[a.j][a.i] = null; a.i = ni; a.j = nj; grid[nj][ni] = a; }
}

function mousePressed() {
  let i = floor(mouseX / 20), j = floor(mouseY / 20);
  if (i < 0 || j < 0 || i >= cols || j >= rows - 1) return;
  let a = grid[j][i];
  if (a instanceof Officer) { grid[j][i] = null; police.splice(police.indexOf(a), 1); }
  else if (!a) { let o = new Officer(); o.i = i; o.j = j; grid[j][i] = o; police.push(o); }
}

class Citizen {
  constructor() {
    this.hardship = random();
    this.riskAversion = random();
    this.active = false;
    this.jail = 0;
  }

  update() {
    if (this.jail > 0) { this.jail--; if (this.jail === 0) this.release(); return; }
    wander(this);
    let around = neighbours(this.i, this.j, 3);
    let cops = around.filter(a => a instanceof Officer).length;
    let rebels = around.filter(a => a instanceof Citizen && a.active).length + 1;
    let arrestRisk = 1 - exp(-2.3 * floor(cops / rebels));
    let grievance = this.hardship * (1 - legitimacy);
    this.active = grievance - this.riskAversion * arrestRisk > 0.1;
  }

  release() {
    let i, j;
    do { i = floor(random(cols)); j = floor(random(rows - 1)); } while (grid[j][i]);
    this.i = i; this.j = j; grid[j][i] = this; this.active = false;
  }

  display() {
    if (this.jail > 0) return;
    noStroke();
    if (this.active) fill(194, 59, 34);
    else fill(255, 220, 0);
    rect(this.i * 20 + 3, this.j * 20 + 3, 14, 14);
  }
}

class Officer {
  update() {
    wander(this);
    let rebels = neighbours(this.i, this.j, 3).filter(a => a instanceof Citizen && a.active);
    if (rebels.length > 0) {
      let r = random(rebels);
      grid[r.j][r.i] = null;
      r.active = false;
      r.jail = floor(random(20, 60));
    }
  }

  display() {
    stroke(30);
    fill(30);
    circle(this.i * 20 + 10, this.j * 20 + 10, 14);
  }
}`,
    check(V, M, S) {
      const C = V.citizens || [], free = C.filter((c) => c.jail === 0), share = free.length ? free.filter((c) => c.active).length / free.length : 0;
      M.run = M.run || {};
      const r = M.run;
      if (r.L0 === undefined) r.L0 = V.legitimacy;
      if (V.legitimacy !== r.L0) r.moved = true;
      if (S.t > 2 && S.t <= 7) r.early = Math.max(r.early || 0, share);
      const quiet = S.t > 7 && (r.early || 0) < 0.05;
      if (quiet && share >= 0.25 && !r.moved) r.broke = true;
      return [[quiet, `Quiet first: under 5% active for the first 7 seconds${S.t > 7 ? '' : ' (watching)'}`], [!r.moved, 'Legitimacy left where it started'], [!!r.broke, `The quiet breaks: 25% active (now ${Math.round(share * 100)}%)`]];
    },
    done: (items) => items.every((x) => x[0]),
    resetRun: (M) => { M.run = {}; },
  },
  {
    id: 'culture', group: 'SEVEN', no: '03', title: 'Copying Cultures', source: 'Axelrod 1997 · Dissemination of Culture',
    aphorism: 'Similarity invites copying.',
    aphRef: 'Growing Entanglements · Model 02',
    frame: 'Trurl gives every cell of the box a list of traits and one rule: talk to a neighbour as often as you already agree, and copy one thing when you talk.',
    goal: 'Grow a world that freezes into exactly 3 cultures. Change the number of features or traits, then restart.',
    click: 'Click a cell to print its traits in the console.',
    params: [{ name: 'features', label: 'Features per agent', min: 2, max: 8, step: 1, restart: true }, { name: 'traits', label: 'Traits per feature', min: 2, max: 20, step: 1, restart: true }],
    sketch: String.raw`// BOX 03 · AXELROD (1997), THE DISSEMINATION OF CULTURE
// "Similarity invites copying."
// Each agent holds a list of traits. Pick a neighbour: talk with probability
// (shared traits / features). When they talk, copy one trait that differs.
// Click a cell to print its traits.

let features = 5;
let traits = 15;
let cols = 16;
let rows = 10;
let agents = [];
let frozen = false;
let regions = 0;

function setup() {
  createCanvas(800, 500);
  for (let j = 0; j < rows; j++) {
    for (let i = 0; i < cols; i++) agents.push(new Agent(i, j));
  }
}

function draw() {
  background(245);
  if (!frozen) {
    for (let k = 0; k < 400; k++) random(agents).update();
    if (frameCount % 20 === 0) census();
  }
  for (let a of agents) a.display();
  for (let a of agents) a.borders();
  noStroke();
  fill(30);
  textSize(12);
  text((frozen ? "FROZEN" : "copying") + "   cultures " + regions + "   features " + features + "   traits " + traits, 12, 492);
}

function at(i, j) {
  if (i < 0 || j < 0 || i >= cols || j >= rows) return null;
  return agents[j * cols + i];
}

function shared(a, b) {
  let n = 0;
  for (let k = 0; k < features; k++) if (a.culture[k] === b.culture[k]) n++;
  return n;
}

function census() {
  frozen = true;
  for (let a of agents) for (let b of [at(a.i + 1, a.j), at(a.i, a.j + 1)]) {
    if (b) { let s = shared(a, b); if (s > 0 && s < features) frozen = false; }
  }
  let seen = new Set();
  regions = 0;
  for (let a of agents) {
    if (seen.has(a)) continue;
    regions++;
    let stack = [a];
    seen.add(a);
    while (stack.length) {
      let c = stack.pop();
      for (let b of [at(c.i + 1, c.j), at(c.i - 1, c.j), at(c.i, c.j + 1), at(c.i, c.j - 1)]) {
        if (b && !seen.has(b) && shared(b, c) === features) { seen.add(b); stack.push(b); }
      }
    }
  }
}

function mousePressed() {
  let a = at(floor(mouseX / 50), floor(mouseY / 48));
  if (a) console.log("cell " + a.i + "," + a.j + ": [" + a.culture.join(", ") + "]");
}

class Agent {
  constructor(i, j) {
    this.i = i;
    this.j = j;
    this.culture = [];
    for (let k = 0; k < features; k++) this.culture.push(floor(random(traits)));
  }

  update() {
    let options = [at(this.i + 1, this.j), at(this.i - 1, this.j), at(this.i, this.j + 1), at(this.i, this.j - 1)].filter(b => b);
    let other = random(options);
    let s = shared(this, other);
    if (s > 0 && s < features && random() < s / features) {
      let differ = [];
      for (let k = 0; k < features; k++) if (this.culture[k] !== other.culture[k]) differ.push(k);
      let k = random(differ);
      this.culture[k] = other.culture[k];
    }
  }

  display() {
    noStroke();
    let c = this.culture;
    fill(90 + 165 * c[0] / traits, 90 + 150 * c[1] / traits, 40 + 160 * c[2 % features] / traits);
    rect(this.i * 50, this.j * 48, 50, 48);
  }

  borders() {
    stroke(30);
    for (let b of [at(this.i + 1, this.j), at(this.i, this.j + 1)]) {
      if (!b) continue;
      let w = 4 * (1 - shared(this, b) / features);
      if (w <= 0) continue;
      strokeWeight(w);
      if (b.i > this.i) line(b.i * 50, this.j * 48, b.i * 50, this.j * 48 + 48);
      else line(this.i * 50, b.j * 48, this.i * 50 + 50, b.j * 48);
    }
    strokeWeight(1);
  }
}`,
    check(V) {
      return [[!!V.frozen, 'The world froze: no neighbours left to copy from'], [V.frozen && V.regions === 3, `Exactly 3 cultures (now ${V.regions || 0})`]];
    },
    done: (items) => items.every((x) => x[0]),
  },
  {
    id: 'city', group: 'SEVEN', no: '04', title: 'The Divided City', source: 'Schelling 1971 · Segregation',
    aphorism: 'Small moves divide the whole city.',
    aphRef: 'Growing Entanglements · Model 03',
    frame: 'Trurl fills the box with two kinds of households and one mild wish: a few neighbours like me. Klapaucius asks how mild a wish can still split the city.',
    goal: 'Split the city with a mild wish: reach 72% same-kind neighbours with tolerance never above 0.35 this run, and let the city settle.',
    click: 'Click a household to move it to a random empty lot.',
    params: [{ name: 'tolerance', label: 'Tolerance', min: 0, max: 0.8, step: 0.01 }],
    sketch: String.raw`// BOX 04 · SCHELLING (1971), SEGREGATION
// "Small moves divide the whole city."
// A household moves when fewer than tolerance of its neighbours are its kind.

let tolerance = 0.2;
let cols = 40;
let rows = 24;
let grid = [];
let households = [];
let moved = 0;
let similarity = 0;
let content = 0;

function setup() {
  createCanvas(800, 500);
  for (let j = 0; j < rows; j++) grid.push(new Array(cols).fill(null));
  for (let j = 0; j < rows; j++) {
    for (let i = 0; i < cols; i++) {
      if (random() < 0.9) {
        let h = new Household(i, j, random() < 0.5 ? 0 : 1);
        grid[j][i] = h;
        households.push(h);
      }
    }
  }
}

function draw() {
  background(245);
  moved = 0;
  for (let h of shuffle(households.filter(h => !h.happy()))) {
    if (moved >= 30) break;
    if (h.move()) moved++;
  }
  similarity = households.reduce((s, h) => s + h.share(), 0) / households.length;
  content = households.filter(h => h.happy()).length / households.length;
  for (let h of households) h.display();
  noStroke();
  fill(30);
  textSize(12);
  text("same-kind neighbours " + round(similarity * 100) + "%   moves this frame " + moved + "   tolerance " + nf(tolerance, 1, 2), 12, 492);
}

function mousePressed() {
  let row = grid[floor(mouseY / 20)];
  let h = row && row[floor(mouseX / 20)];
  if (h) h.move();
}

class Household {
  constructor(i, j, kind) {
    this.i = i;
    this.j = j;
    this.kind = kind;
  }

  around() {
    let out = [];
    for (let dj = -1; dj <= 1; dj++) for (let di = -1; di <= 1; di++) {
      let r = grid[this.j + dj];
      let h = r && r[this.i + di];
      if (h && h !== this) out.push(h);
    }
    return out;
  }

  share() {
    let n = this.around();
    if (n.length === 0) return 1;
    return n.filter(h => h.kind === this.kind).length / n.length;
  }

  happy() {
    return this.share() >= tolerance;
  }

  move() {
    let from = [this.i, this.j];
    for (let tries = 0; tries < 30; tries++) {
      let i = floor(random(cols)), j = floor(random(rows));
      if (grid[j][i]) continue;
      grid[this.j][this.i] = null;
      this.i = i;
      this.j = j;
      grid[j][i] = this;
      if (this.happy()) return true;
      grid[j][i] = null;
      this.i = from[0];
      this.j = from[1];
      grid[this.j][this.i] = this;
    }
    return false;
  }

  display() {
    stroke(30);
    if (this.kind === 0) fill(255, 220, 0);
    else fill(30);
    rect(this.i * 20 + 2, this.j * 20 + 2, 16, 16);
  }
}`,
    check(V, M) {
      M.run = M.run || {};
      M.run.max = Math.max(M.run.max ?? 0, V.tolerance);
      const s = V.similarity || 0, c = V.content || 0;
      return [[s >= 0.72, `Same-kind neighbours: ${Math.round(s * 100)}% (need 72%)`], [M.run.max <= 0.35, `Tolerance never above 0.35 this run (highest ${M.run.max.toFixed(2)})`], [c >= 0.98, `Settled: ${Math.round(c * 100)}% of households content (need 98%)`]];
    },
    done: (items) => items.every((x) => x[0]),
    resetRun: (M) => { M.run = {}; },
  },
  {
    id: 'ties', group: 'SEVEN', no: '05', title: 'Long Ties', source: 'Watts & Strogatz 1998 · Small Worlds',
    aphorism: 'A few long ties collapse distance.',
    aphRef: 'Growing Entanglements · Model 04',
    frame: 'In the First Sally a whole army becomes one machine once its recruits plug into one another. Trurl builds a ring of sixty and gives Klapaucius six plugs.',
    goal: 'Bring the average path below 4.5 steps with at most 6 long ties, and keep clustering above 0.4.',
    click: 'Click one node, then another: the first one drops a local tie and reaches across.',
    params: [{ name: 'p', label: 'Random rewiring p', min: 0, max: 0.3, step: 0.01, restart: true }],
    sketch: String.raw`// BOX 05 · WATTS & STROGATZ (1998), SMALL WORLDS
// "A few long ties collapse distance."
// 60 nodes on a ring, each tied to its 2 neighbours on each side.
// Click a node, then another: it drops one local tie and reaches across.

let p = 0;
let n = 60;
let nodes = [];
let rewires = 0;
let pathLength = 0;
let clustering = 0;
let picked = null;
let pulse = 0;

function setup() {
  createCanvas(800, 500);
  for (let i = 0; i < n; i++) nodes.push(new Node(i));
  for (let a of nodes) for (let d = 1; d <= 2; d++) tie(a, nodes[(a.id + d) % n]);
  for (let a of nodes) {
    if (random() < p) {
      let far = random(nodes);
      if (far !== a && !a.ties.includes(far)) { rewire(a, far); }
    }
  }
  measure();
}

function draw() {
  background(245);
  stroke(30, 60);
  for (let a of nodes) for (let b of a.ties) if (a.id < b.id) line(a.x, a.y, b.x, b.y);
  pulse = (pulse + 0.05) % 9;
  let d = distances(nodes[0]);
  for (let a of nodes) a.display(d[a.id]);
  noStroke();
  fill(30);
  textSize(12);
  text("average path " + nf(pathLength, 1, 2) + "   clustering " + nf(clustering, 1, 2) + "   long ties " + rewires, 12, 492);
}

function tie(a, b) {
  a.ties.push(b);
  b.ties.push(a);
}

function untie(a, b) {
  a.ties.splice(a.ties.indexOf(b), 1);
  b.ties.splice(b.ties.indexOf(a), 1);
}

function rewire(a, far) {
  let local = a.ties.filter(b => abs(b.id - a.id) <= 2 || abs(b.id - a.id) >= n - 2);
  if (local.length === 0) return;
  untie(a, random(local));
  tie(a, far);
  rewires++;
}

function distances(src) {
  let d = new Array(n).fill(-1);
  d[src.id] = 0;
  let queue = [src];
  while (queue.length) {
    let a = queue.shift();
    for (let b of a.ties) if (d[b.id] < 0) { d[b.id] = d[a.id] + 1; queue.push(b); }
  }
  return d;
}

function measure() {
  let total = 0;
  let pairs = 0;
  for (let a of nodes) for (let x of distances(a)) if (x > 0) { total += x; pairs++; }
  pathLength = total / pairs;
  let c = 0;
  for (let a of nodes) {
    let k = a.ties.length;
    if (k < 2) continue;
    let links = 0;
    for (let x of a.ties) for (let y of a.ties) if (x.id < y.id && x.ties.includes(y)) links++;
    c += links / (k * (k - 1) / 2);
  }
  clustering = c / n;
}

function mousePressed() {
  let hit = nodes.find(a => dist(mouseX, mouseY, a.x, a.y) < 12);
  if (!hit) { picked = null; return; }
  if (!picked) { picked = hit; return; }
  if (hit !== picked && !picked.ties.includes(hit)) { rewire(picked, hit); measure(); }
  picked = null;
}

class Node {
  constructor(id) {
    this.id = id;
    let a = TWO_PI * id / n - HALF_PI;
    this.x = 400 + 210 * cos(a);
    this.y = 240 + 210 * sin(a);
    this.ties = [];
  }

  display(hops) {
    stroke(30);
    let lit = abs(hops - pulse) < 0.5;
    if (this === picked) fill(194, 59, 34);
    else if (lit) fill(255, 220, 0);
    else fill(245);
    circle(this.x, this.y, lit ? 16 : 12);
  }
}`,
    check(V) {
      const L = V.pathLength || 9, C = V.clustering || 0, r = V.rewires || 0;
      return [[L < 4.5, `Average path below 4.5 (now ${L.toFixed(2)})`], [r <= 6, `At most 6 long ties (${r})`], [C > 0.4, `Clustering above 0.4 (now ${C.toFixed(2)})`]];
    },
    done: (items) => items.every((x) => x[0]),
  },
  {
    id: 'rough', group: 'SEVEN', no: '06', title: 'Rough Country', source: 'Cioffi-Revilla & Rouleau 2009 · RebeLand',
    aphorism: 'Resistance persists where power reaches badly.',
    aphRef: 'Growing Entanglements · Model 05',
    frame: 'Trurl lays mountains in the box and a capital on its west edge. The state sweeps outward from the capital; the mountains slow it.',
    goal: 'Plant 6 cells of resistance. When the sweeps begin, survive them: hold 40 or more cells at the 30-second mark.',
    click: 'Click to plant a cell of resistance (6 in all). The sweeps start after the sixth.',
    params: [{ name: 'reach', label: 'State reach', min: 0.6, max: 1.4, step: 0.05 }],
    sketch: String.raw`// BOX 06 · CIOFFI-REVILLA & ROULEAU (2009), REBELAND
// "Resistance persists where power reaches badly."
// The state's reach falls with distance from the capital and with rough ground.
// Click to plant 6 cells of resistance. The sweeps start after the sixth.

let reach = 1.0;
let cols = 40;
let rows = 24;
let patches = [];
let seeds = 0;
let started = -1;
let elapsed = 0;
let cells = 0;

function setup() {
  createCanvas(800, 500);
  for (let j = 0; j < rows; j++) {
    for (let i = 0; i < cols; i++) patches.push(new Patch(i, j));
  }
}

function draw() {
  background(245);
  if (started >= 0) {
    elapsed = (frameCount - started) / 60;
    if (frameCount % 6 === 0) for (let p of patches) p.update();
  }
  cells = patches.filter(p => p.rebel).length;
  for (let p of patches) p.display();
  noStroke();
  fill(30);
  rect(0, 228, 14, 44);
  textSize(12);
  text(started < 0 ? "plant " + (6 - seeds) + " more" : "sweeping " + nf(elapsed, 1, 1) + " s   cells " + cells, 12, 492);
}

function at(i, j) {
  if (i < 0 || j < 0 || i >= cols || j >= rows) return null;
  return patches[j * cols + i];
}

function mousePressed() {
  if (seeds >= 6) return;
  let p = at(floor(mouseX / 20), floor(mouseY / 20));
  if (p && !p.rebel) {
    p.rebel = true;
    seeds++;
    if (seeds === 6) started = frameCount;
  }
}

class Patch {
  constructor(i, j) {
    this.i = i;
    this.j = j;
    this.rough = constrain(map(noise(i * 0.13, j * 0.13), 0.25, 0.75, 0, 1), 0, 1);
    this.rebel = false;
  }

  power() {
    let d = dist(this.i, this.j, 0, 12);
    return reach * exp(-d / 22) * (1 - 0.7 * this.rough);
  }

  update() {
    if (!this.rebel) return;
    if (random() < 0.22 * this.power()) { this.rebel = false; return; }
    let n = at(this.i + floor(random(-1, 2)), this.j + floor(random(-1, 2)));
    if (n && !n.rebel && random() < 0.5 * n.rough * (1 - n.power())) n.rebel = true;
  }

  display() {
    noStroke();
    fill(245 - 150 * this.rough);
    rect(this.i * 20, this.j * 20, 20, 20);
    if (this.rebel) {
      stroke(30);
      fill(194, 59, 34);
      circle(this.i * 20 + 10, this.j * 20 + 10, 13);
    }
  }
}`,
    check(V, M) {
      M.run = M.run || {};
      const planted = V.seeds || 0, t = V.elapsed || 0, c = V.cells || 0;
      if (V.started >= 0 && c === 0) M.run.dead = true;
      if (V.started >= 0 && t >= 30 && c >= 40 && !M.run.dead) M.run.held = true;
      return [[planted >= 6, `Plant 6 cells (${planted} of 6)`], [V.started >= 0 && !M.run.dead, `Never wiped out since the sweeps began (now ${c} cells)`], [!!M.run.held, `40 or more cells at 30 seconds (${t.toFixed(1)} s)`]];
    },
    done: (items) => items.every((x) => x[0]),
    resetRun: (M) => { M.run = {}; },
  },
  {
    id: 'harm', group: 'SEVEN', no: '07', title: 'Collateral', source: 'Doran & Lees 2005 · IRUBA',
    aphorism: 'Harm can manufacture allegiance.',
    aphRef: 'Growing Entanglements · Model 06',
    frame: 'Trurl puts four villages in the box and a handful of fighters among them. Klapaucius is handed two tools: a strike and a gift of care.',
    goal: 'End the insurgency within 45 seconds: no fighters left, and two thirds of the villagers leaning toward the state.',
    click: 'Choose a tool, then click a village. A strike removes nearby fighters and harms everyone around them. Care is scarce: 5 gifts.',
    params: [{ name: 'tool', label: 'Tool', type: 'choice', options: ['strike', 'care'] }],
    sketch: String.raw`// BOX 07 · DORAN & LEES (2005), IRUBA
// "Harm can manufacture allegiance."
// allegiance runs from -1 (the state) to +1 (the insurgents).
// Harm raises anger; anger pushes allegiance up. Care calms it and earns trust.
// Choose a tool, then click a village.

let tool = "strike";
let villagers = [];
let villages = [[180, 140], [600, 130], [220, 360], [610, 360]];
let fighters = 0;
let leaningState = 0;
let marks = [];
let gifts = 5;

function setup() {
  createCanvas(800, 500);
  for (let v of villages) {
    for (let k = 0; k < 30; k++) villagers.push(new Villager(v[0] + random(-70, 70), v[1] + random(-55, 55)));
  }
  for (let k = 0; k < 10; k++) {
    let f = random(villagers);
    f.allegiance = 0.85;
  }
}

function draw() {
  background(245);
  for (let v of villages) {
    noFill();
    stroke(30, 50);
    ellipse(v[0], v[1], 190, 150);
  }
  for (let p of villagers) p.update(villagers);
  for (let p of villagers) p.display();
  for (let m of marks) {
    noFill();
    stroke(m.c);
    circle(m.x, m.y, m.r * 2 * (1 - m.t / 40));
    m.t++;
  }
  marks = marks.filter(m => m.t < 40);
  fighters = villagers.filter(p => p.fighter()).length;
  leaningState = villagers.filter(p => p.allegiance < 0).length / villagers.length;
  noStroke();
  fill(30);
  textSize(12);
  text("tool " + tool.toUpperCase() + "   care left " + gifts + "   fighters " + fighters + "   leaning to the state " + round(leaningState * 100) + "%", 12, 492);
}

function mousePressed() {
  if (tool === "strike") {
    marks.push({ x: mouseX, y: mouseY, r: 90, t: 0, c: color(194, 59, 34) });
    for (let p of villagers) {
      let d = dist(mouseX, mouseY, p.x, p.y);
      if (d < 45 && p.fighter()) { p.allegiance = -0.2; p.anger = 0; p.trust = 0; }
      else if (d < 90) p.anger += p.trust > 0 ? 0.25 : 1;
    }
  } else if (gifts > 0) {
    gifts--;
    marks.push({ x: mouseX, y: mouseY, r: 100, t: 0, c: color(47, 98, 217) });
    for (let p of villagers) {
      if (dist(mouseX, mouseY, p.x, p.y) < 100 && !p.fighter()) {
        p.anger = max(0, p.anger - 0.6);
        p.allegiance = max(-1, p.allegiance - 0.25);
        p.trust = 600;
      }
    }
  }
}

class Villager {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.home = [x, y];
    this.allegiance = random(-0.4, 0.3);
    this.anger = 0;
    this.trust = 0;
  }

  fighter() {
    return this.allegiance > 0.6;
  }

  update(all) {
    this.anger *= 0.996;
    if (this.trust > 0) this.trust--;
    let pull = 0;
    if (frameCount % 10 === 0) {
      for (let o of all) if (o.fighter() && o !== this && dist(this.x, this.y, o.x, o.y) < 40) pull++;
    }
    this.allegiance = constrain(this.allegiance + 0.004 * this.anger + 0.002 * pull - 0.0003, -1, 1);
    let speed = this.fighter() ? 1.2 : 0.4;
    this.x += random(-speed, speed) + (this.home[0] - this.x) * 0.01;
    this.y += random(-speed, speed) + (this.home[1] - this.y) * 0.01;
  }

  display() {
    stroke(30);
    if (this.fighter()) fill(194, 59, 34);
    else if (this.allegiance < 0) fill(255, 220, 0);
    else fill(245);
    circle(this.x, this.y, this.fighter() ? 12 : 9);
  }
}`,
    check(V, M, S) {
      const t = S.t;
      const f = V.fighters ?? 99, s = V.leaningState || 0;
      return [[f === 0, `No fighters left (now ${f})`], [s >= 2 / 3, `Two thirds lean to the state (now ${Math.round(s * 100)}%)`], [t <= 45, `Within 45 seconds (${t.toFixed(1)} s)`]];
    },
    done: (items) => items.every((x) => x[0]),
  },
  {
    id: 'border', group: 'SEVEN', no: '08', title: 'The Third Culture', source: 'Green & Costion 2018 · Cross-Cultural Interaction',
    aphorism: 'A border can become a third culture.',
    aphRef: 'Growing Entanglements · Model 07',
    frame: 'Trurl splits the box into two peoples and opens the border to trade. Klapaucius asks whether the border will close, melt, or become something new.',
    goal: 'Grow a third culture on the border: 15% of the land hybrid, while each of the two first cultures still holds 30%.',
    click: 'Click the land to open a market there.',
    params: [{ name: 'trade', label: 'Trade', min: 0, max: 1, step: 0.05 }, { name: 'assimilation', label: 'Assimilation', min: 0, max: 1, step: 0.05 }],
    sketch: String.raw`// BOX 08 · GREEN & COSTION (2018), CROSS-CULTURAL INTERACTION
// "A border can become a third culture."
// Each cell holds a: its share of culture A (1) or B (0), and h: its hybridity.
// Trade across a difference raises h. Assimilation pulls cells back to one side.
// Click to open a market.

let trade = 0.2;
let assimilation = 0.6;
let cols = 40;
let rows = 24;
let cells = [];
let shares = { a: 0, b: 0, hybrid: 0 };

function setup() {
  createCanvas(800, 500);
  for (let j = 0; j < rows; j++) {
    for (let i = 0; i < cols; i++) cells.push(new Cell(i, j, i < cols / 2 ? 1 : 0));
  }
}

function draw() {
  background(245);
  for (let k = 0; k < 500; k++) random(cells).meet();
  for (let c of cells) c.settle();
  let n = cells.length;
  shares.hybrid = cells.filter(c => c.h > 0.6).length / n;
  shares.a = cells.filter(c => c.h <= 0.6 && c.a > 0.66).length / n;
  shares.b = cells.filter(c => c.h <= 0.6 && c.a < 0.34).length / n;
  for (let c of cells) c.display();
  noStroke();
  fill(30);
  textSize(12);
  text("A " + round(shares.a * 100) + "%   B " + round(shares.b * 100) + "%   third culture " + round(shares.hybrid * 100) + "%", 12, 492);
}

function at(i, j) {
  if (i < 0 || j < 0 || i >= cols || j >= rows) return null;
  return cells[j * cols + i];
}

function mousePressed() {
  for (let c of cells) if (dist(mouseX, mouseY, c.i * 20 + 10, c.j * 20 + 10) < 50) c.h = min(1, c.h + 0.4);
}

class Cell {
  constructor(i, j, a) {
    this.i = i;
    this.j = j;
    this.a = a;
    this.h = 0;
  }

  neighbours() {
    return [at(this.i + 1, this.j), at(this.i - 1, this.j), at(this.i, this.j + 1), at(this.i, this.j - 1)].filter(c => c);
  }

  meet() {
    let o = random(this.neighbours());
    let differ = abs(this.a - o.a) > 0.2 || o.h > 0.5;
    if (differ && random() < trade) {
      this.h = min(1, this.h + 0.12);
      this.a = lerp(this.a, o.a, 0.1);
    }
  }

  settle() {
    let ns = this.neighbours();
    let mean = ns.reduce((s, c) => s + c.a, 0) / ns.length;
    this.a = lerp(this.a, mean > 0.5 ? 1 : 0, 0.02 * assimilation);
    this.h = max(0, this.h - 0.006 * assimilation - 0.001);
  }

  display() {
    noStroke();
    fill(lerp(30, 255, this.a), lerp(30, 220, this.a), lerp(30, 0, this.a));
    rect(this.i * 20, this.j * 20, 20, 20);
    if (this.h > 0.1) {
      fill(194, 59, 34, 255 * this.h);
      rect(this.i * 20 + 3, this.j * 20 + 3, 14, 14);
    }
  }
}`,
    check(V, M) {
      const s = V.shares || { a: 0, b: 0, hybrid: 0 };
      return [[s.hybrid >= 0.15, `Third culture: ${Math.round(s.hybrid * 100)}% (need 15%)`], [s.a >= 0.3, `Culture A holds ${Math.round(s.a * 100)}% (need 30%)`], [s.b >= 0.3, `Culture B holds ${Math.round(s.b * 100)}% (need 30%)`]];
    },
    hold: 20,
    done: (items) => items.every((x) => x[0]),
  },

  /* =============================================================== METISIM */
  {
    id: 'metis', group: 'METISIM', no: '09', title: 'Lyrael', source: 'METISIM · Lyrael cluster · Scott 1998',
    aphorism: 'Maps slip. Myths persist.',
    aphRef: 'METISIM',
    frame: 'Trurl builds a valley that a state is trying to map. The survey line crosses it again and again. Mêtis is what the villagers do so the map comes out wrong.',
    goal: 'Get through 3 surveys with the legibility index under 70, and finish with a harvest above 50.',
    click: 'Click to leave a false trail (4 per survey). The survey records the trail instead of the people.',
    params: [{ name: 'cunning', label: 'Cunning', min: 0, max: 1, step: 0.05 }],
    sketch: String.raw`// BOX 09 · METISIM, LYRAEL
// "Maps slip. Myths persist."
// A survey line sweeps the valley. Villagers working in the open are counted;
// counted villagers raise the legibility index. Villagers who hide do not work.
// cunning: how early a villager runs for cover. Click to leave a false trail.

let cunning = 0.3;
let villagers = [];
let thickets = [];
let trails = [];
let legibility = 20;
let harvest = 30;
let survey = 0;
let beam = -1;
let peak = 20;
let trailsLeft = 4;
let done = false;

function setup() {
  createCanvas(800, 500);
  for (let k = 0; k < 7; k++) thickets.push({ x: random(60, 740), y: random(60, 420), r: random(30, 50) });
  for (let k = 0; k < 40; k++) villagers.push(new Villager(random(40, 760), random(40, 440)));
}

function draw() {
  background(238, 236, 222);
  for (let t of thickets) { noStroke(); fill(90, 100, 70); circle(t.x, t.y, t.r * 2); }
  if (!done && frameCount % 600 === 240) { survey++; beam = 0; trailsLeft = 4; }
  if (beam >= 0) {
    beam += 2;
    stroke(194, 59, 34);
    strokeWeight(3);
    line(beam, 0, beam, 460);
    strokeWeight(1);
    if (beam > width) { beam = -1; for (let v of villagers) v.counted = false; if (survey >= 3) done = true; }
  }
  for (let t of trails) {
    stroke(30);
    noFill();
    circle(t.x, t.y, 22);
    if (beam >= 0 && abs(beam - t.x) < 3 && !t.used) { t.used = true; legibility = max(0, legibility - 6); }
  }
  for (let v of villagers) v.update();
  for (let v of villagers) v.display();
  if (!done) harvest = max(0, harvest + villagers.filter(v => !v.hidden).length * 0.0016 - 0.036);
  legibility = max(0, legibility - 0.004);
  peak = max(peak, legibility);
  noStroke();
  fill(30);
  textSize(12);
  text("survey " + survey + " of 3   legibility " + round(legibility) + "   harvest " + round(harvest) + "   false trails left " + trailsLeft + (done ? "   THE SURVEYS ARE OVER" : ""), 12, 488);
}

function mousePressed() {
  if (trailsLeft > 0 && mouseY < 460) { trails.push({ x: mouseX, y: mouseY, used: false }); trailsLeft--; }
}

class Villager {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.home = [x, y];
    this.hidden = false;
    this.counted = false;
  }

  cover() {
    let best = thickets[0];
    for (let t of thickets) if (dist(this.x, this.y, t.x, t.y) < dist(this.x, this.y, best.x, best.y)) best = t;
    return best;
  }

  update() {
    let t = this.cover();
    let inCover = dist(this.x, this.y, t.x, t.y) < t.r;
    let coming = beam >= 0 && this.x - beam < 400 * cunning && this.x > beam;
    let target = coming ? [t.x, t.y] : this.home;
    this.x += (target[0] - this.x) * 0.03;
    this.y += (target[1] - this.y) * 0.03;
    this.hidden = inCover;
    if (beam >= 0 && abs(beam - this.x) < 3 && !inCover && !this.counted) {
      this.counted = true;
      legibility += 3;
    }
  }

  display() {
    stroke(30);
    if (this.hidden) fill(90, 100, 70);
    else if (this.counted) fill(194, 59, 34);
    else fill(255, 220, 0);
    circle(this.x, this.y, 10);
  }
}`,
    check(V) {
      return [[V.peak < 70, `Legibility stayed under 70 (highest ${Math.round(V.peak || 0)})`], [(V.harvest || 0) > 50, `Harvest above 50 (now ${Math.round(V.harvest || 0)})`], [!!V.done, `Three surveys survived (${V.survey || 0} of 3)`]];
    },
    done: (items) => items.every((x) => x[0]),
  },
  {
    id: 'dream', group: 'METISIM', no: '10', title: 'Duviii', source: 'METISIM · Duviii cluster · Freud',
    aphorism: 'Noise coagulates into meaning.',
    aphRef: 'METISIM · the Dream-Space',
    frame: 'Trurl builds a sleeper in a box, three floors deep. Wishes rise from the bottom; a censor patrols the middle; a go-between turns what it can into images.',
    goal: 'Make 25 images within 40 seconds, with no more than 10 wishes breaking through to the surface.',
    click: 'Click to place a dream image (4 at most). Each image brings a go-between, and rising wishes drift toward it.',
    params: [{ name: 'repression', label: 'Repression', min: 0, max: 1, step: 0.05 }, { name: 'drive', label: 'Drive', min: 0.5, max: 2, step: 0.05 }],
    sketch: String.raw`// BOX 10 · METISIM, DUVIII
// "Noise coagulates into meaning."
// Wishes (Id) rise from the bottom toward the surface.
// Censors (Superego) patrol the middle and push wishes down.
// A go-between (Ego) waits at each dream image. A wish that meets an Ego
// while a censor is near becomes an image. A wish that reaches the surface is a symptom.
// Click to place a dream image (4 at most). Each image brings an Ego.

let repression = 0.3;
let drive = 1.2;
let wishes = [];
let censors = [];
let egos = [];
let made = 0;
let symptoms = 0;

function setup() {
  createCanvas(800, 500);
  for (let k = 0; k < 16; k++) wishes.push(new Wish());
  for (let k = 0; k < 4; k++) censors.push(new Censor(k));
  egos.push(new Ego(400, 250));
}

function draw() {
  background(245);
  noStroke();
  fill(232, 230, 220);
  rect(0, 0, width, 60);
  fill(225, 220, 205);
  rect(0, 400, width, 100);
  fill(30);
  textSize(11);
  text("SURFACE", 12, 20);
  text("THE UNCONSCIOUS", 12, 416);
  for (let c of censors) { c.update(); c.display(); }
  for (let e of egos) { e.update(); e.display(); }
  for (let w of wishes) { w.update(); w.display(); }
  noStroke();
  fill(30);
  textSize(12);
  text("images " + made + "   symptoms " + symptoms + "   repression " + nf(repression, 1, 2) + "   drive " + nf(drive, 1, 2), 12, 492);
}

function mousePressed() {
  if (egos.length < 4 && mouseY > 60 && mouseY < 400) egos.push(new Ego(mouseX, mouseY));
}

class Wish {
  constructor() {
    this.reset();
  }

  reset() {
    this.x = random(40, 760);
    this.y = random(420, 490);
  }

  update() {
    let lure = egos[0];
    for (let e of egos) if (abs(this.x - e.x) < abs(this.x - lure.x)) lure = e;
    this.x += constrain((lure.x - this.x) * 0.004, -0.6, 0.6) + random(-0.8, 0.8);
    this.y -= 0.7 * drive;
    for (let c of censors) {
      if (dist(this.x, this.y, c.x, c.y) < 70) this.y += 1.6 * repression;
    }
    let ego = egos.find(e => dist(this.x, this.y, e.x, e.y) < 30);
    let censor = censors.find(c => dist(this.x, this.y, c.x, c.y) < 110);
    if (ego && censor) { made++; ego.glow = 18; this.reset(); return; }
    if (this.y < 55) { symptoms++; this.reset(); }
    this.y = min(this.y, 495);
  }

  display() {
    stroke(30);
    fill(194, 59, 34);
    circle(this.x, this.y, 9);
  }
}

class Censor {
  constructor(k) {
    this.x = 100 + k * 200;
    this.y = 240;
    this.dir = k % 2 ? 1 : -1;
  }

  update() {
    this.x += this.dir * 0.7;
    if (this.x < 40 || this.x > 760) this.dir *= -1;
  }

  display() {
    stroke(30);
    fill(30);
    rect(this.x - 9, this.y - 9, 18, 18);
  }
}

class Ego {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.glow = 0;
  }

  update() {
    if (this.glow > 0) this.glow--;
  }

  display() {
    stroke(30);
    noFill();
    circle(this.x, this.y, 60);
    fill(this.glow > 0 ? color(255, 200, 0) : color(255, 220, 0, 150));
    circle(this.x, this.y, 22 + this.glow);
  }
}`,
    check(V, M, S) {
      return [[(V.made || 0) >= 25, `Images made: ${V.made || 0} of 25`], [(V.symptoms || 0) <= 10, `No more than 10 symptoms (${V.symptoms || 0})`], [S.t <= 40, `Within 40 seconds (${S.t.toFixed(1)} s)`]];
    },
    done: (items) => items.every((x) => x[0]),
  },
  {
    id: 'counter', group: 'METISIM', no: '11', title: 'Zylos', source: 'METISIM · Zylos cluster · counter-engines',
    aphorism: 'It fails in ways that teach.',
    aphRef: 'METISIM · Zylos',
    frame: 'Trurl builds an empire in a box and an engine that answers every gain with a harder push. Klapaucius asks how to win. Trurl says that is the wrong question.',
    goal: 'Reach half the land, hold it for 15 seconds, then watch the engine break you. You win this box by losing it well.',
    click: 'Click your own hex to fortify it (8 forts).',
    params: [{ name: 'growth', label: 'Growth', min: 0.02, max: 0.2, step: 0.01 }],
    sketch: String.raw`// BOX 11 · METISIM, ZYLOS
// "It fails in ways that teach."
// Your empire spreads hex by hex. At 20 seconds invaders arrive from the edges,
// and every 6 seconds after that the engine pushes harder.
// Click one of your hexes to fortify it. There is no winning state.

let growth = 0.08;
let cols = 24;
let rows = 14;
let hexes = [];
let forts = 8;
let share = 0;
let best = 0;
let heldFor = 0;
let wave = 0;

function setup() {
  createCanvas(800, 500);
  for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) hexes.push(new Hex(i, j));
  at(12, 7).owner = 1;
}

function draw() {
  background(245);
  wave = max(0, floor((frameCount - 1200) / 360) + 1);
  if (frameCount % 5 === 0) {
    for (let h of shuffle(hexes.slice())) h.update();
    if (random() < 0.12 * wave) {
      let h = random(hexes.filter(h => h.edge() && h.owner !== 2 && !h.fort));
      if (h) h.owner = 2;
    }
  }
  share = hexes.filter(h => h.owner === 1).length / hexes.length;
  best = max(best, share);
  if (share >= 0.5) heldFor += 1 / 60;
  else if (heldFor < 15) heldFor = 0;
  for (let h of hexes) h.display();
  noStroke();
  fill(30);
  textSize(12);
  text("land " + round(share * 100) + "%   best " + round(best * 100) + "%   held " + nf(heldFor, 1, 1) + " s   wave " + wave + "   forts " + forts, 12, 492);
}

function at(i, j) {
  if (i < 0 || j < 0 || i >= cols || j >= rows) return null;
  return hexes[j * cols + i];
}

function mousePressed() {
  for (let h of hexes) {
    if (dist(mouseX, mouseY, h.x, h.y) < 16 && h.owner === 1 && !h.fort && forts > 0) { h.fort = true; forts--; }
  }
}

class Hex {
  constructor(i, j) {
    this.i = i;
    this.j = j;
    this.x = 40 + i * 31 + (j % 2) * 15.5;
    this.y = 40 + j * 30;
    this.owner = 0;
    this.fort = false;
  }

  around() {
    let d = this.j % 2 ? [[1, 0], [-1, 0], [0, -1], [1, -1], [0, 1], [1, 1]] : [[1, 0], [-1, 0], [-1, -1], [0, -1], [-1, 1], [0, 1]];
    return d.map(o => at(this.i + o[0], this.j + o[1])).filter(h => h);
  }

  edge() {
    return this.around().length < 6;
  }

  update() {
    let ns = this.around();
    let invaders = ns.filter(h => h.owner === 2).length;
    if (this.owner === 1 && !this.fort && random() < 0.012 * invaders * wave) this.owner = 2;
    else if (this.owner === 1) {
      let n = random(ns);
      if (n.owner === 0 && random() < growth) n.owner = 1;
    } else if (this.owner === 2) {
      let n = random(ns);
      if (n.owner !== 2 && !n.fort && random() < 0.01 * wave) n.owner = 2;
    }
  }

  display() {
    stroke(30);
    if (this.owner === 1) fill(255, 220, 0);
    else if (this.owner === 2) fill(194, 59, 34);
    else fill(236, 233, 222);
    beginShape();
    for (let k = 0; k < 6; k++) vertex(this.x + 17 * cos(PI / 6 + k * PI / 3), this.y + 17 * sin(PI / 6 + k * PI / 3));
    endShape(CLOSE);
    if (this.fort) { fill(30); rect(this.x - 4, this.y - 4, 8, 8); }
  }
}`,
    check(V) {
      const best = V.best || 0, held = V.heldFor || 0, now = V.share || 0;
      const broke = best >= 0.5 && held >= 15 && now < 0.25;
      return [[best >= 0.5, `Reach half the land (best ${Math.round(best * 100)}%)`], [held >= 15, `Hold it for 15 seconds (${held.toFixed(1)} s)`], [broke, `The engine breaks you: land under 25% (now ${Math.round(now * 100)}%)`]];
    },
    done: (items) => items.every((x) => x[0]),
  },
];
