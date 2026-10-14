/* THE CONSTRUCTORS · lessons
   One entry per screen. Edit text here; the bench reads it on load.
   story.text  : a short paraphrase with its page in the Kandel translation.
                 Replace it with the exact passage from your copy if you read aloud in class.
   notes       : line notes. When the caret or a STEP lands on a line that contains `find`,
                 the bench shows `say` above its own line-by-line explanation.
   check(S)    : the puzzle. Returns [[passed, 'what it checks'], ...]. S is described in index.html. */

const PARTS = [
  { key: 'BASICS', name: 'Basics' },
  { key: 'ARRAYS', name: 'Arrays' },
  { key: 'CLASSES', name: 'Classes' },
  { key: 'ARENA', name: 'Arena' },
  { key: 'HAND-IN', name: 'Hand-in' },
];

const near = (a, b, r) => Math.hypot(a.x - b.x, a.y - b.y) <= r;
const secs = (t) => t.toFixed(1) + ' s';

const LESSONS = [
  /* ------------------------------------------------------------------ BASICS */
  {
    id: 'circle', part: 'BASICS', title: 'One yellow circle',
    film: 'click', filmCap: 'The Click · two armies on two hills',
    story: { text: 'Two kings at war each order an army. Trurl builds one, Klapaucius the other. Every army starts from one part.', ref: 'The First Sally' },
    brief: 'p5 runs setup() once, then runs draw() again and again. x counts pixels from the left edge. y counts pixels down from the top.',
    howto: true,
    task: 'Put the circle on the flag.',
    scene: { flags: [{ x: 560, y: 200 }] },
    starter: `// ONE YELLOW CIRCLE
function setup() {
  createCanvas(800, 500);
}

function draw() {
  background(245);
  fill(255, 220, 0);
  circle(200, 250, 80);
}`,
    notes: [
      { find: 'createCanvas', say: 'Makes the drawing surface: 800 pixels wide, 500 tall. Every x here is between 0 and 800, every y between 0 and 500.' },
      { find: 'background(245)', say: 'Paints the whole canvas light grey. draw() runs this first in every frame, so each frame starts clean.' },
      { find: 'fill(255, 220, 0)', say: 'Sets the colour of the shapes drawn after it: red 255, green 220, blue 0. That mix is yellow.' },
      { find: 'circle(', say: 'circle(x, y, size). The first number is x, the second is y, the third is how wide the circle is.' },
    ],
    hint: 'The flag stands at x = 560, y = 200. Change the first two numbers inside circle( ).',
    check(S) {
      const c = S.circles.find((c) => near(c, { x: 560, y: 200 }, 18));
      const yellow = c && S.fillBefore(c.i) === '255,220,0';
      return [[!!c, 'A circle sits on the flag at (560, 200)'], [!!yellow, 'The circle is yellow: fill(255, 220, 0)']];
    },
    solution: `function setup() { createCanvas(800, 500); }
function draw() { background(245); fill(255, 220, 0); circle(560, 200, 80); }`,
  },
  {
    id: 'walk', part: 'BASICS', title: 'A circle that walks',
    film: 'poem-gloaming', filmCap: 'The Commissions · Gloaming, cut off mid-line',
    story: { text: 'The machine starts a poem and runs past its end. Trurl stops it, adjusts it, and runs it again.', ref: "Trurl's Electronic Bard" },
    brief: 'A variable is a named box that holds a value. A variable made outside setup() and draw() keeps its value from one frame to the next.',
    task: 'Make the circle walk to the flag and stop there.',
    scene: { ground: 300, flags: [{ x: 600, y: 300 }] },
    starter: `// A CIRCLE THAT WALKS
let x = 80;

function setup() {
  createCanvas(800, 500);
}

function draw() {
  background(245);
  fill(255, 220, 0);
  circle(x, 300, 60);
  x = x + 2;
}`,
    notes: [
      { find: 'let x = 80', say: 'Makes a variable named x and stores 80 in it. It sits outside setup() and draw(), so both can read it, and it keeps its value between frames.' },
      { find: 'circle(x, 300, 60)', say: 'Draws the circle at whatever x holds right now. When x changes, the circle moves.' },
      { find: 'x = x + 2', say: 'Reads x, adds 2, and stores the result back in x. draw() runs about 60 times a second, so the circle moves about 120 pixels a second.' },
      { find: 'if (', say: 'if checks a condition. The lines inside { } run only when the condition is true.' },
    ],
    hint: 'Put the line that moves the circle inside an if:  if (x < 600) { x = x + 2; }',
    check(S, M) {
      const c = S.circles.find((c) => Math.abs(c.y - 300) < 6);
      if (c) { M.minX = Math.min(M.minX ?? 1e9, c.x); M.still = M.lastX !== undefined && Math.abs(M.lastX - c.x) < 0.01 ? (M.still || 0) + 1 : 0; M.lastX = c.x; }
      return [[!!c && M.minX < 300, 'The circle walks in from the left'], [!!c && Math.abs(c.x - 600) <= 2, 'It stands on the flag: x is 600' + (c ? ` (x is ${Math.round(c.x)})` : '')], [(M.still || 0) >= 3, 'It stays there']];
    },
    solution: `let x = 80;
function setup() { createCanvas(800, 500); }
function draw() { background(245); fill(255, 220, 0); circle(x, 300, 60); if (x < 600) { x = x + 2; } }`,
  },
  {
    id: 'mouse', part: 'BASICS', title: 'Your command',
    film: 'warmup', filmCap: 'The Warm-Up · Trurl at the console',
    story: { text: 'Trurl stands at the console and works the machine by hand until it answers. Here the mouse is the console.', ref: "Trurl's Electronic Bard" },
    brief: 'p5 keeps mouseX and mouseY up to date: the mouse position over the canvas, in pixels. Read them inside draw().',
    task: 'Make the circle follow the mouse. Then lead it to flags A, B and C, in that order.',
    scene: { flags: [{ x: 140, y: 110, label: 'A' }, { x: 660, y: 130, label: 'B' }, { x: 400, y: 420, label: 'C' }] },
    starter: `// YOUR COMMAND
let x = 400;
let y = 250;

function setup() {
  createCanvas(800, 500);
}

function draw() {
  background(245);
  fill(255, 220, 0);
  circle(x, y, 40);
  // move x and y toward mouseX and mouseY here
}`,
    notes: [
      { find: 'let y = 250', say: 'A second variable for the circle’s vertical position.' },
      { find: 'mouseX - x', say: 'mouseX - x is how far the circle is from the mouse, left to right. Adding a tenth of it each frame moves the circle part of the way there.' },
      { find: '// move', say: 'A comment. JavaScript skips any line that starts with //.' },
    ],
    hint: 'Inside draw(), after circle():  x = x + (mouseX - x) * 0.1;  and  y = y + (mouseY - y) * 0.1;',
    hold: 1,
    check(S, M) {
      const c = S.circles[0];
      if (c) {
        if (M.p) M.moved = (M.moved || 0) + Math.hypot(c.x - M.p.x, c.y - M.p.y);
        M.p = { x: c.x, y: c.y };
        const F = [{ x: 140, y: 110 }, { x: 660, y: 130 }, { x: 400, y: 420 }];
        M.got = M.got || 0;
        if (M.got < 3 && near(c, F[M.got], 30)) M.got++;
      }
      const g = M.got || 0;
      return [[(M.moved || 0) > 80, 'The circle moves when the mouse moves'], [g > 0, 'Flag A'], [g > 1, 'Flag B, after A'], [g > 2, 'Flag C, after B']];
    },
    solution: `let x = 400; let y = 250;
function setup() { createCanvas(800, 500); }
function draw() { background(245); fill(255, 220, 0); circle(x, y, 40); x = x + (mouseX - x) * 0.1; y = y + (mouseY - y) * 0.1; }`,
  },

  /* ------------------------------------------------------------------ ARRAYS */
  {
    id: 'words', part: 'ARRAYS', title: 'The word list',
    film: 'poem-simple', filmCap: 'The Commissions · Something Simple',
    story: { text: 'Asked for something simple, the machine answers with three made-up words. Each word is one item in its list.', ref: "Trurl's Electronic Bard" },
    brief: 'An array is a list of values in one variable. Each item has an index, starting at 0. words.length is how many items the list holds.',
    task: 'Project all three words, one under the other, in list order. Then show how many words the list holds.',
    scene: { screen: { x: 80, y: 60, w: 640, h: 380 } },
    starter: `// THE WORD LIST
let words = ["Glimmerquox.", "Pendulate.", "Brumm."];

function setup() {
  createCanvas(800, 500);
}

function draw() {
  background(245);
  fill(30);
  textSize(36);
  text(words[0], 120, 140);
}`,
    notes: [
      { find: 'let words', say: 'Makes an array with three items. words[0] is "Glimmerquox.", words[1] is "Pendulate.", words[2] is "Brumm.".' },
      { find: 'fill(30)', say: 'Text is drawn with the fill colour. 30 is almost black.' },
      { find: 'textSize', say: 'Text drawn after this line is 36 pixels tall.' },
      { find: 'text(words[0]', say: 'Writes item 0 of the list at x 120, y 140. Change the 0 to read another item.' },
      { find: 'words.length', say: 'words.length is the number of items in the list: 3.' },
    ],
    hint: 'text(words[1], 120, 200);  text(words[2], 120, 260);  and  text(words.length, 120, 380);',
    check(S) {
      const W = ['Glimmerquox.', 'Pendulate.', 'Brumm.'];
      const found = W.map((w) => S.texts.find((t) => t.s === w));
      const n = found.filter(Boolean).length;
      const order = n === 3 && found[0].y < found[1].y && found[1].y < found[2].y;
      const count = S.texts.some((t) => t.s === '3');
      const inside = S.texts.length > 0 && S.texts.every((t) => t.bb && t.bb.x >= 80 && t.bb.y >= 60 && t.bb.x + t.bb.w <= 720 && t.bb.y + t.bb.h <= 440);
      return [[n === 3, `All three words are projected (${n} of 3)`], [order, 'Top to bottom in list order: 0, 1, 2'], [count, 'The count, words.length, is projected'], [inside, 'Everything sits inside the screen']];
    },
    solution: `let words = ["Glimmerquox.", "Pendulate.", "Brumm."];
function setup() { createCanvas(800, 500); }
function draw() { background(245); fill(30); textSize(36); text(words[0], 120, 140); text(words[1], 120, 200); text(words[2], 120, 260); text(words.length, 120, 380); }`,
  },
  {
    id: 'loop', part: 'ARRAYS', title: 'The whole poem',
    film: 'poem-epigram', filmCap: 'The Commissions · To the One Who Laughed',
    story: { text: 'The one who laughed at the machine gets an answer in six lines. A poem is a list of lines, read from item 0 down.', ref: "Trurl's Electronic Bard" },
    brief: 'A for loop repeats its lines with a counter. Use the counter as the index and the loop visits every item in the list.',
    task: 'The machine projects half its answer, crammed together. Fix the loop: every line, in order, at least 40 px apart, all inside the screen.',
    scene: { screen: { x: 80, y: 60, w: 640, h: 380 } },
    starter: `// THE WHOLE POEM
let lines = [
  "Who laughs before the proof",
  "Had best stand well aloof:",
  "The engine stumbled once, and found its feet.",
  "The doubter on the floor",
  "May doubt a little more;",
  "He cannot make this couplet less complete."
];

function setup() {
  createCanvas(800, 500);
}

function draw() {
  background(245);
  fill(30);
  textSize(24);
  for (let i = 0; i < 3; i++) {
    text(lines[i], 110, 110 + i * 20);
  }
}`,
    notes: [
      { find: 'let lines', say: 'An array of six strings, one per line of the poem. lines.length is 6.' },
      { find: 'for (let i', say: 'let i = 0 starts the counter. The condition is checked before each round. i++ adds 1 after each round. With i < 3 the rounds are i = 0, 1, 2.' },
      { find: 'text(lines[i]', say: 'Each round writes item i. 110 + i * 20 puts each line 20 px below the one before.' },
    ],
    hint: 'Use lines.length in place of 3, so the loop runs once per line. Then raise 20 to 50.',
    check(S) {
      const L = ['Who laughs before the proof', 'Had best stand well aloof:', 'The engine stumbled once, and found its feet.', 'The doubter on the floor', 'May doubt a little more;', 'He cannot make this couplet less complete.'];
      const f = L.map((l) => S.texts.find((t) => t.s === l));
      const n = f.filter(Boolean).length;
      const order = n === 6 && f.every((t, i) => i === 0 || t.y > f[i - 1].y);
      let gap = Infinity; for (let i = 1; i < 6; i++) if (f[i] && f[i - 1]) gap = Math.min(gap, f[i].y - f[i - 1].y);
      const inside = n > 0 && f.filter(Boolean).every((t) => t.bb && t.bb.x >= 80 && t.bb.y >= 60 && t.bb.x + t.bb.w <= 720 && t.bb.y + t.bb.h <= 440);
      return [[n === 6, `All six lines are projected (${n} of 6)`], [order, 'In list order, top to bottom'], [n === 6 && gap >= 40, `Lines at least 40 px apart${isFinite(gap) ? ` (closest ${Math.round(gap)} px)` : ''}`], [inside, 'All inside the screen']];
    },
    solution: `let lines = ["Who laughs before the proof","Had best stand well aloof:","The engine stumbled once, and found its feet.","The doubter on the floor","May doubt a little more;","He cannot make this couplet less complete."];
function setup() { createCanvas(800, 500); }
function draw() { background(245); fill(30); textSize(24); for (let i = 0; i < lines.length; i++) { text(lines[i], 110, 110 + i * 50); } }`,
  },
  {
    id: 'push', part: 'ARRAYS', title: 'The commission box',
    film: 'poem-shears', filmCap: 'The Commissions · Shears',
    story: { text: 'Klapaucius sets the machine a hard commission: a haircut poem, lofty and tragic, every word beginning with S.', ref: "Trurl's Electronic Bard" },
    brief: 'push() adds one item to the end of an array. The array grows by one, and length goes up by one.',
    task: 'Each click pushes a word. The commission calls for exactly 12 words. Click to fill the list, and change the code so a 13th click adds nothing.',
    scene: { screen: { x: 80, y: 60, w: 640, h: 380 } },
    starter: `// THE COMMISSION BOX
let bank = ["Sweet", "Sabine", "slept", "serenely", "Sly", "Sela", "stalked",
            "slow", "scissors", "sang", "shorn", "silent", "sundered", "sworn"];
let words = [];

function setup() {
  createCanvas(800, 500);
}

function draw() {
  background(245);
  fill(30);
  textSize(26);
  for (let i = 0; i < words.length; i++) {
    text(words[i], 110 + (i % 4) * 150, 120 + floor(i / 4) * 60);
  }
}

function mousePressed() {
  words.push(random(bank));
}`,
    notes: [
      { find: 'let words = []', say: 'An empty array. words.length is 0 until something is pushed.' },
      { find: 'words.push', say: 'Adds one item to the end of words. random(bank) picks one item of bank at random.' },
      { find: 'function mousePressed', say: 'p5 runs mousePressed() once for each click on the canvas.' },
      { find: 'i % 4', say: 'i % 4 is the remainder after dividing by 4: 0, 1, 2, 3, 0, 1 … so the words wrap into rows of four. floor(i / 4) is the row number.' },
    ],
    hint: 'if (words.length < 12) { words.push(random(bank)); }',
    hold: 1,
    check(S, M) {
      const w = S.vars.words, n = Array.isArray(w) ? w.length : 0;
      M.max = Math.max(M.max || 0, n);
      const shown = Array.isArray(w) && n > 0 && S.texts.length >= n;
      return [[n === 12, `The list holds 12 words (now ${n})`], [S.clicks >= 14, `Click at least 14 times (${S.clicks})`], [M.max <= 12 && n > 0, `It never held more than 12 (most: ${M.max})`], [shown, 'Every word in the list is projected']];
    },
    solution: `let bank = ["Sweet","Sabine","slept"]; let words = [];
function setup() { createCanvas(800, 500); }
function draw() { background(245); fill(30); textSize(26); for (let i = 0; i < words.length; i++) { text(words[i], 110 + (i % 4) * 150, 120 + floor(i / 4) * 60); } }
function mousePressed() { if (words.length < 12) { words.push(random(bank)); } }`,
  },

  /* ------------------------------------------------------------------ CLASSES */
  {
    id: 'recruit', part: 'CLASSES', title: 'One recruit',
    film: 'click-hills', filmCap: 'The Click · each file built from one kind of part',
    story: { text: 'Klapaucius describes his recruit: a plug screwed in front, a socket behind. Every recruit is made to the same design.', ref: 'The First Sally, p. 38' },
    brief: 'A class is a template. new Soldier(x, y) builds one object from it. this means the object being built, or the object running a method.',
    task: 'Make a second recruit from the same class. Stand one recruit on each flag.',
    scene: { ground: 330, flags: [{ x: 300, y: 330 }, { x: 620, y: 330 }] },
    starter: `// ONE RECRUIT
let a;

function setup() {
  createCanvas(800, 500);
  a = new Soldier(120, 330);
}

function draw() {
  background(245);
  a.display();
}

class Soldier {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  display() {
    recruit(this.x, this.y);
  }
}`,
    notes: [
      { find: 'class Soldier', say: 'A template. It says what every Soldier has (x and y) and what it can do (display). It makes nothing by itself.' },
      { find: 'constructor(', say: 'Runs once for each new Soldier(...). It receives the two numbers and stores them on the new object.' },
      { find: 'this.x = x', say: 'this is the object being built. this.x = x stores the x it was given inside that object.' },
      { find: 'new Soldier', say: 'Builds one object from the class and stores it in a variable.' },
      { find: 'a.display()', say: 'Asks the object in a to run its display() method.' },
      { find: 'recruit(', say: 'recruit(x, y) draws one recruit standing at (x, y). The lab supplies it; COPY adds it to your code for the p5 editor.' },
    ],
    hint: 'let a, b;  In setup():  a = new Soldier(300, 330);  b = new Soldier(620, 330);  In draw():  b.display();',
    check(S) {
      const n = S.reg.filter((o) => o.constructor && o.constructor.name === 'Soldier').length;
      const L = S.recruits.some((r) => near(r, { x: 300, y: 330 }, 14)), R = S.recruits.some((r) => near(r, { x: 620, y: 330 }, 14));
      return [[n >= 2, `Two Soldier objects exist (${n})`], [L, 'A recruit stands on the left flag (300, 330)'], [R, 'A recruit stands on the right flag (620, 330)']];
    },
    solution: `let a, b;
function setup() { createCanvas(800, 500); a = new Soldier(300, 330); b = new Soldier(620, 330); }
function draw() { background(245); a.display(); b.display(); }
class Soldier { constructor(x, y) { this.x = x; this.y = y; } display() { recruit(this.x, this.y); } }`,
  },
  {
    id: 'battalion', part: 'CLASSES', title: 'The battalion',
    film: 'click-hills', filmCap: 'The Click · the files on each hill',
    story: { text: 'Joined together, the recruits stop being separate soldiers. The army becomes one machine made of a very large number of parts.', ref: 'The First Sally, p. 38' },
    brief: 'An array can hold objects. A loop builds them with new and pushes each one; a second loop asks each one to display itself.',
    task: 'Fill the ridge with exactly 30 recruits, all standing on it, none closer than 18 px to another.',
    scene: { ridge: { x0: 100, x1: 700, y: 380 } },
    starter: `// THE BATTALION
let soldiers = [];

function setup() {
  createCanvas(800, 500);
  for (let i = 0; i < 20; i++) {
    soldiers.push(new Soldier(100 + i * 40, 380));
  }
}

function draw() {
  background(245);
  for (let s of soldiers) {
    s.display();
  }
}

class Soldier {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  display() {
    recruit(this.x, this.y);
  }
}`,
    notes: [
      { find: 'soldiers.push(new Soldier', say: 'Each round builds one new Soldier and pushes it onto the end of soldiers. 100 + i * 40 spaces them 40 px apart.' },
      { find: 'for (let s of soldiers)', say: 'Runs the lines inside { } once for each item in soldiers, calling the current item s.' },
      { find: 's.display()', say: 'Asks this soldier to draw itself. Every soldier runs the same method with its own x and y.' },
    ],
    hint: 'Change 20 to 30. Then pick a spacing so recruit 29 still lands on the ridge: 100 + 29 × spacing must stay at or under 700.',
    check(S) {
      const R = S.recruits, n = R.length, off = R.filter((r) => !(Math.abs(r.y - 380) <= 8 && r.x >= 100 && r.x <= 700)).length;
      let md = Infinity; for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) md = Math.min(md, Math.hypot(R[i].x - R[j].x, R[i].y - R[j].y));
      return [[n === 30, `Exactly 30 recruits (now ${n})`], [n > 0 && off === 0, `All on the ridge${off ? ` (${off} off it)` : ''}`], [n > 1 && md >= 18, `None closer than 18 px${isFinite(md) ? ` (closest ${Math.round(md)} px)` : ''}`]];
    },
    solution: `let soldiers = [];
function setup() { createCanvas(800, 500); for (let i = 0; i < 30; i++) { soldiers.push(new Soldier(100 + i * 20, 380)); } }
function draw() { background(245); for (let s of soldiers) { s.display(); } }
class Soldier { constructor(x, y) { this.x = x; this.y = y; } display() { recruit(this.x, this.y); } }`,
  },
  {
    id: 'orders', part: 'CLASSES', title: 'Orders',
    film: 'click-meet', filmCap: 'The Click · the march',
    story: { text: 'Orders go down the line, and every recruit carries them out in the same way, each from where it stands.', ref: 'The First Sally' },
    brief: 'Keep two methods apart. update() changes the object’s numbers and draws nothing. display() draws and changes nothing. draw() calls both for every object.',
    task: 'Get 16 of the 20 recruits past the far bank within 15 seconds, and lose none to the current.',
    scene: { river: { x0: 340, x1: 440, drift: 1.4 }, finish: 660 },
    starter: `// ORDERS
let soldiers = [];

function setup() {
  createCanvas(800, 500);
  for (let i = 0; i < 20; i++) {
    soldiers.push(new Soldier(random(30, 150), random(80, 420)));
  }
}

function draw() {
  background(245);
  for (let s of soldiers) {
    s.display();
  }
}

class Soldier {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.speed = random(1, 2);
  }

  update() {
    this.x = this.x + this.speed;
  }

  display() {
    recruit(this.x, this.y);
  }
}`,
    notes: [
      { find: 'this.speed = random', say: 'Each soldier gets its own speed, a random number from 1 to 2, when it is built.' },
      { find: 'update() {', say: 'update() moves the soldier. Nothing calls it yet, so nothing moves.' },
      { find: 'this.x = this.x + this.speed', say: 'Moves this soldier right by its own speed, once per call.' },
      { find: 's.display()', say: 'display() only draws. It does not move anything.' },
      { find: 's.update()', say: 'Runs this soldier’s update(): its numbers change before it is drawn.' },
    ],
    hint: 'Call s.update() before s.display(). In the river (x between 340 and 440) the current adds 1.4 to y every frame. In update(), subtract more than that while x is in the river.',
    check(S) {
      const R = S.reg.filter((o) => typeof o.x === 'number'), n = R.length, across = R.filter((o) => o.x > 660).length, lost = R.filter((o) => o.y > 490).length;
      const moved = R.some((o) => o.x > 160);
      return [[moved, 'The recruits move'], [across >= 16, `At least 16 past the far bank (${across})`], [lost === 0 && n > 0, `None swept off the bottom (${lost} lost)`], [S.t <= 15, `Within 15 seconds (${secs(S.t)})`]];
    },
    solution: `let soldiers = [];
function setup() { createCanvas(800, 500); for (let i = 0; i < 20; i++) { soldiers.push(new Soldier(random(30, 150), random(80, 420))); } }
function draw() { background(245); for (let s of soldiers) { s.update(); s.display(); } }
class Soldier { constructor(x, y) { this.x = x; this.y = y; this.speed = random(1, 2); }
  update() { this.x = this.x + this.speed; if (this.x > 340 && this.x < 440) { this.y = this.y - 2; } }
  display() { recruit(this.x, this.y); } }`,
  },
  {
    id: 'network', part: 'CLASSES', title: 'Close ranks',
    film: 'click-hills', filmCap: 'The Click · the files close up',
    story: { text: 'Each recruit plugs into the next: plug into socket. Every connection makes the formation larger.', ref: 'The First Sally, p. 38' },
    brief: 'A method can take another object as input. Inside connect(other), this is the soldier running the method and other is the one it meets.',
    task: 'Plug all 20 recruits into one network within 20 seconds: every recruit connected, all in one group (links shorter than 60 px).',
    scene: {},
    starter: `// CLOSE RANKS
let soldiers = [];

function setup() {
  createCanvas(800, 500);
  for (let i = 0; i < 20; i++) {
    soldiers.push(new Soldier(random(60, 740), random(60, 440)));
  }
}

function draw() {
  background(245);
  for (let s of soldiers) {
    for (let other of soldiers) {
      if (s !== other) {
        s.connect(other);
      }
    }
  }
  for (let s of soldiers) {
    s.display();
  }
}

class Soldier {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.connected = false;
  }

  connect(other) {
    let d = dist(this.x, this.y, other.x, other.y);
    if (d < 60) {
      stroke(30);
      line(this.x, this.y, other.x, other.y);
      this.connected = true;
    }
  }

  display() {
    recruit(this.x, this.y);
  }
}`,
    notes: [
      { find: 'for (let other of soldiers)', say: 'A loop inside a loop: every soldier meets every other soldier, every frame. 20 × 19 = 380 meetings.' },
      { find: 's !== other', say: '!== means "is not the same object". A soldier does not connect to itself.' },
      { find: 'connect(other) {', say: 'A method with an input. other is whichever soldier the loop passed in.' },
      { find: 'let d = dist', say: 'dist() measures the straight-line distance between two points, in pixels.' },
      { find: 'this.connected = true', say: 'Marks this soldier as connected. It stays true from then on.' },
    ],
    hint: 'In connect(), move this a little toward other every frame:  this.x += (other.x - this.x) * 0.002;  and the same for y.',
    check(S) {
      const R = S.reg.filter((o) => typeof o.x === 'number'), n = R.length, conn = R.filter((o) => o.connected).length;
      const par = R.map((_, i) => i), find = (i) => (par[i] === i ? i : (par[i] = find(par[i])));
      for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) if (Math.hypot(R[i].x - R[j].x, R[i].y - R[j].y) < 60) par[find(i)] = find(j);
      const groups = new Set(R.map((_, i) => find(i))).size;
      return [[n > 0 && conn === n, `Every recruit connected (${conn} of ${n})`], [n > 0 && groups === 1, `One group (now ${groups})`], [S.t <= 20, `Within 20 seconds (${secs(S.t)})`]];
    },
    solution: `let soldiers = [];
function setup() { createCanvas(800, 500); for (let i = 0; i < 20; i++) { soldiers.push(new Soldier(random(60, 740), random(60, 440))); } }
function draw() { background(245); for (let s of soldiers) { for (let other of soldiers) { if (s !== other) { s.connect(other); } } } for (let s of soldiers) { s.display(); } }
class Soldier { constructor(x, y) { this.x = x; this.y = y; this.connected = false; }
  connect(other) { let d = dist(this.x, this.y, other.x, other.y); this.x += (other.x - this.x) * 0.002; this.y += (other.y - this.y) * 0.002;
    if (d < 60) { stroke(30); line(this.x, this.y, other.x, other.y); this.connected = true; } }
  display() { recruit(this.x, this.y); } }`,
  },
  {
    id: 'stone', part: 'CLASSES', title: 'One can’t do it',
    film: 'click-giants', filmCap: 'The Click · the giants rise',
    story: { text: 'As formations join, the army develops an aesthetic sense. One night’s attack plan turns out to be a painting of the battlements.', ref: 'The First Sally, p. 40' },
    brief: 'Some behaviour exists only in a group. The lab reads every recruit: the stone moves only while five or more push it at once.',
    task: 'Get the stone into the goal within 30 seconds. It moves only while 5 or more recruits push it.',
    scene: { stone: { x: 300, y: 250, r: 40 }, goal: { x: 660, y: 250, r: 60 } },
    starter: `// ONE CAN'T DO IT
let soldiers = [];

function setup() {
  createCanvas(800, 500);
  for (let i = 0; i < 20; i++) {
    soldiers.push(new Soldier(random(30, 180), random(60, 440)));
  }
}

function draw() {
  background(245);
  for (let s of soldiers) {
    s.update();
    s.display();
  }
}

class Soldier {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  update() {
    let stone = world.stone;
    // walk toward the stone
    let dx = stone.x - this.x;
    let dy = stone.y - this.y;
    let d = sqrt(dx * dx + dy * dy);
    if (d > 1) {
      this.x += dx / d * 1.5;
      this.y += dy / d * 1.5;
    }
  }

  display() {
    recruit(this.x, this.y);
  }
}`,
    notes: [
      { find: 'let stone = world.stone', say: 'world is supplied by the lab. world.stone is {x, y, r}: centre and radius. world.goal is the same shape.' },
      { find: 'let d = sqrt', say: 'The distance to the stone, by Pythagoras: the square root of dx² + dy².' },
      { find: 'dx / d * 1.5', say: 'dx / d and dy / d point one pixel toward the stone. Times 1.5: move 1.5 px per frame that way.' },
      { find: 'world.touching', say: 'world.touching(world.stone) counts the recruits touching the stone right now.' },
    ],
    hint: 'Pushing from every side cancels out. Aim at a point behind the stone, on the side away from the goal: tx = stone.x - ux * (stone.r + 14), where (ux, uy) points from the stone to world.goal, one pixel long. Once you touch the stone, walk toward the goal.',
    check(S) {
      const w = S.world, d = w.stone ? Math.hypot(w.stone.x - w.goal.x, w.stone.y - w.goal.y) : 999, inGoal = d < w.goal.r - 10;
      return [[(w.maxPush || 0) >= 5, `Five or more pushed at once (most: ${w.maxPush || 0})`], [inGoal, `The stone is in the goal (${Math.round(d)} px away)`], [S.t <= 30, `Within 30 seconds (${secs(S.t)})`]];
    },
    solution: `let soldiers = [];
function setup() { createCanvas(800, 500); for (let i = 0; i < 20; i++) { soldiers.push(new Soldier(random(30, 180), random(60, 440))); } }
function draw() { background(245); for (let s of soldiers) { s.update(); s.display(); } }
class Soldier { constructor(x, y) { this.x = x; this.y = y; this.mode = "gather"; }
  update() { let s = world.stone, g = world.goal; let ux = g.x - s.x, uy = g.y - s.y, ul = sqrt(ux * ux + uy * uy); ux /= ul; uy /= ul;
    if (world.touching(s) >= 5) this.mode = "push";
    let tx = s.x - ux * (s.r + 14), ty = s.y - uy * (s.r + 14);
    if (this.mode === "push" && dist(this.x, this.y, s.x, s.y) < s.r + 24) { tx = this.x + ux * 10; ty = this.y + uy * 10; }
    let dx = tx - this.x, dy = ty - this.y, d = sqrt(dx * dx + dy * dy); if (d > 1) { this.x += dx / d * 1.6; this.y += dy / d * 1.6; } }
  display() { recruit(this.x, this.y); } }`,
  },
  {
    id: 'slip', part: 'CLASSES', title: 'The commission',
    film: 'poem-epic', filmCap: 'The Commissions · Exile of Engines',
    story: { text: 'In our film the slip reads NO ONE ASKED FOR THIS ONE, and the machine writes an epic anyway. Its first line ends on the word gate.', ref: 'The Commissions' },
    brief: 'The constructor can take more than a position. Give each object its own target and every object can head somewhere different.',
    task: 'Spell the slip. Give each recruit its own point from letterPoints() and walk it there. Hold 44 of the 48 points within 15 seconds.',
    scene: { slip: 'GATE', n: 48 },
    starter: `// THE COMMISSION
let soldiers = [];

function setup() {
  createCanvas(800, 500);
  let points = letterPoints(world.slip, 48);
  for (let i = 0; i < points.length; i++) {
    soldiers.push(new Soldier(random(width), 470));
  }
}

function draw() {
  background(245);
  for (let s of soldiers) {
    s.update();
    s.display();
  }
}

class Soldier {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  update() {
    // each recruit needs its own place in the word
  }

  display() {
    recruit(this.x, this.y);
  }
}`,
    notes: [
      { find: 'letterPoints(', say: 'letterPoints(word, n) is supplied by the lab. It returns an array of n points {x, y} that trace the letters of the word.' },
      { find: 'points.length', say: 'The loop runs once per point: 48 rounds, 48 soldiers.' },
      { find: 'random(width)', say: 'width is the canvas width, 800. random(width) is a number from 0 to 800.' },
      { find: 'this.tx', say: 'This soldier’s own target. Every soldier stores a different one.' },
    ],
    hint: 'new Soldier(random(width), 470, points[i].x, points[i].y). In the constructor: this.tx = tx; this.ty = ty;. In update(): this.x += (this.tx - this.x) * 0.05; and the same for y.',
    check(S) {
      const P = S.letterPoints('GATE', 48), R = S.reg.filter((o) => typeof o.x === 'number');
      const held = P.filter((p) => R.some((o) => Math.hypot(o.x - p.x, o.y - p.y) < 10)).length;
      return [[held >= 44, `Letter points held: ${held} of 48 (need 44)`], [S.t <= 15, `Within 15 seconds (${secs(S.t)})`]];
    },
    solution: `let soldiers = [];
function setup() { createCanvas(800, 500); let points = letterPoints(world.slip, 48); for (let i = 0; i < points.length; i++) { soldiers.push(new Soldier(random(width), 470, points[i].x, points[i].y)); } }
function draw() { background(245); for (let s of soldiers) { s.update(); s.display(); } }
class Soldier { constructor(x, y, tx, ty) { this.x = x; this.y = y; this.tx = tx; this.ty = ty; }
  update() { this.x += (this.tx - this.x) * 0.05; this.y += (this.ty - this.y) * 0.05; }
  display() { recruit(this.x, this.y); } }`,
  },

  /* ------------------------------------------------------------------ ARENA */
  {
    id: 'train', part: 'ARENA', kind: 'train', title: 'Play the house',
    film: 'poem-tensor', filmCap: 'The Commissions · Field Theory',
    story: { text: 'A corps decides that the concept of “enemy” needs a clearer definition before anyone fights.', ref: 'The First Sally, p. 41' },
    brief: 'Your class goes into an arena with other classes. The arena builds 6 of your Soldiers, gives each one this.target, and calls update(world) and display() every frame for 20 seconds.',
    task: 'Beat Straight Line to the targets: it walks straight through the middle and gets pushed around the keep. Pass every check, then send your share link.',
    hint: 'Bend your path around the keep. Keep Right adds a sideways push while the target is far away: mx = dx / d - dy / d * 0.55, my = dy / d + dx / d * 0.55. Then scale (mx, my) back to 2.4 px.',
  },
  {
    id: 'match', part: 'ARENA', kind: 'match', title: 'The match',
    film: null,
    story: null,
    brief: 'Collect entries, pick up to 25, choose a round and a card, run the match. Reveal the score after round 1, then run round 2.',
    task: 'Run round 1. Reveal the score. Run round 2.',
  },

  /* ------------------------------------------------------------------ HAND-IN */
  {
    id: 'handin', part: 'HAND-IN', kind: 'handin', title: 'Hand-in',
    film: null,
    story: { text: 'The two armies, fully linked, look at each other and leave the field together.', ref: 'The First Sally, pp. 41–42' },
    brief: 'Build your own sketch in the p5 editor: one class, many objects in an array, update() and display(), and one method that takes another object.',
    task: 'Hand in a PDF and a 30 to 60 second video of the sketch running.',
  },
];
