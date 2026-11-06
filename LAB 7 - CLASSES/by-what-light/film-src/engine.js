// The ledger engine for "By What Light". node engine.js > data.json
// A film is twelve beats, one per deed, in the order the index lists them.
// Each beat chooses who does the deed to whom, and its frame: room, light, and who else is in the room.
const SACKS = ['R', 'O', 'I', 'B']; // widow Roessler, Ogiva, Inigo, Belindo Kid
const DEEDS = ['BLACKMAIL', 'DRUGGING', 'INCITEMENT TO SUICIDE', 'KNIFING', 'PROSTITUTION', 'THREATENING WITH A GUN', 'TYING AND GAGGING', 'RAPE', 'SEDUCTION', 'SLANDER', 'SNOOPING', 'STRANGLING'];
const MAT = ['paper', 'cloth', 'paper', 'flour', 'cloth', 'ash', 'rope', 'cloth', 'cloth', 'paper', 'flour', 'rope'];
const CLOSED = [0, 0, 1, 0, 1, 0, 0, 1, 1, 0, 0, 0];      // done behind a closed door: no witness
const KILLS = [0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1];
const TIES = [0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0];
const ROOMS = ['CELLAR', 'KITCHEN', 'FRONT ROOM', 'STAIRWELL', 'ATTIC', 'BEDROOM'];
const DOOR = [1, 1, 0, 0, 1, 1];                            // rooms with a door that shuts
const LIGHTS = ['MOONLIGHT', 'CANDLE', 'LAMP', 'FIRE'];
const FIRE_FROM = 6, N = 12;
const PAIRS = []; for (let a = 0; a < 4; a++) for (let b = 0; b < 4; b++) if (a !== b) PAIRS.push([a, b]);
const bit = (s, x) => 1 << (s * 4 + x);
// state: alive(4) tied(4) fire(1) acted(4) grudge(16: s knows x has done something)
const pack = (s) => `${s.alive},${s.tied},${s.fire},${s.acted},${s.g}`;
const START = { alive: 15, tied: 0, fire: 0, acted: 0, g: 0 };
const pc = (m) => { let c = 0; while (m) { c += m & 1; m >>= 1; } return c; };
// every frame choice for beat k from state s with pair p, ignoring the room (rooms change nothing that follows)
function moves(k, s, rules = true) {
  const out = [];
  for (let pi = 0; pi < 12; pi++) {
    const [a, b] = PAIRS[pi];
    if (rules) {
      if (!(s.alive >> a & 1) || !(s.alive >> b & 1)) continue;   // the dead do nothing and have nothing done to them
      if (s.tied >> a & 1) continue;                                  // a tied sack cannot act
      if ((s.acted >> a & 1) && !(s.g & bit(a, b))) continue;         // after its first deed, a sack acts only against one it knows is guilty
    }
    const others = [0, 1, 2, 3].filter((x) => x !== a && x !== b && (!rules || s.alive >> x & 1));
    const lights = rules ? (s.fire ? [3] : k === N - 1 ? [3] : k >= FIRE_FROM ? [0, 1, 2, 3] : [0, 1, 2]) : [0, 1, 2, 3];
    for (const l of lights) {
      const wsets = [];
      if (rules && (CLOSED[k] || l === 3)) wsets.push(0);
      else { const n = rules ? others.length : 2; for (let m = 0; m < 1 << n; m++) { let w = 0; for (let j = 0; j < n; j++) if (m >> j & 1) w |= 1 << (rules ? others[j] : [0, 1, 2, 3].filter((x) => x !== a && x !== b)[j]); wsets.push(w); } }
      for (const w of wsets) out.push({ pi, a, b, l, w });
    }
  }
  return out;
}
const roomsFor = (k, rules = true) => (rules && CLOSED[k] ? DOOR.reduce((n, d) => n + d, 0) : 6);
function step(k, s, m) {
  const { a, b, l, w } = m; const t = { ...s };
  t.acted |= 1 << a;
  if (!(DEEDS[k] === 'DRUGGING') && l !== 0) t.g |= bit(b, a);                   // the victim knows who, unless drugged or in the dark
  if (!CLOSED[k] && l >= 1) for (let x = 0; x < 4; x++) if (w >> x & 1) t.g |= bit(x, a);  // witnesses in candle or lamp light
  if (!CLOSED[k] && l === 3) for (let x = 0; x < 4; x++) if (x !== a && (t.alive >> x & 1)) t.g |= bit(x, a); // fire lights the whole house
  if (l === 3) t.fire = 1;
  if (KILLS[k]) t.alive &= ~(1 << b);
  if (TIES[k]) t.tied |= 1 << b;
  return t;
}
// exact count by forward dynamic programming over packed states
function dp(rules = true, withFrames = true) {
  let front = new Map([[pack(START), { s: START, n: 1n }]]); const per = [];
  for (let k = 0; k < N; k++) {
    const nx = new Map(); const R = BigInt(withFrames ? roomsFor(k, rules) : 1);
    for (const { s, n } of front.values()) {
      const ms = moves(k, s, rules); const seen = new Set();
      for (const m of ms) {
        if (!withFrames) { if (seen.has(m.pi)) continue; seen.add(m.pi); }
        const t = withFrames ? step(k, s, m) : step(k, s, { ...m, l: 1, w: 0 });
        const key = pack(t); const e = nx.get(key); if (e) e.n += n * R; else nx.set(key, { s: t, n: n * R });
      }
    }
    front = nx; per.push({ states: front.size, films: [...front.values()].reduce((x, e) => x + e.n, 0n).toString() });
  }
  return { total: [...front.values()].reduce((x, e) => x + e.n, 0n), per };
}
// completions from a state at beat k (memoized)
const memo = new Map();
function completions(k, s) {
  if (k === N) return 1n; const key = k + '|' + pack(s); if (memo.has(key)) return memo.get(key);
  let n = 0n; const R = BigInt(roomsFor(k)); for (const m of moves(k, s)) n += R * completions(k + 1, step(k, s, m));
  memo.set(key, n); return n;
}
// brute force: enumerate every raw choice for the first D beats and keep the ones that pass the rules
function brute(D) {
  let count = 0n; const legal = (k, s, m) => moves(k, s).some((x) => x.pi === m.pi && x.l === m.l && x.w === m.w);
  const rec = (k, s) => { if (k === D) { count += 1n; return; } for (const m of moves(k, s, false)) { if (!legal(k, s, m)) continue; for (let r = 0; r < roomsFor(k); r++) rec(k + 1, step(k, s, m)); } };
  rec(0, START); let raw = 1n; for (let k = 0; k < D; k++) raw *= BigInt(moves(k, START, false).length * 6);
  return { count, raw };
}
function dpDepth(D) { let front = new Map([[pack(START), { s: START, n: 1n }]]); for (let k = 0; k < D; k++) { const nx = new Map(); const R = BigInt(roomsFor(k)); for (const { s, n } of front.values()) for (const m of moves(k, s)) { const t = step(k, s, m); const key = pack(t); const e = nx.get(key); if (e) e.n += n * R; else nx.set(key, { s: t, n: n * R }); } front = nx; } return [...front.values()].reduce((x, e) => x + e.n, 0n); }
// a seeded random film: at each beat pick uniformly among legal choices, then a room
function rng(seed) { let x = seed >>> 0 || 1; return () => { x ^= x << 13; x >>>= 0; x ^= x >> 17; x ^= x << 5; x >>>= 0; return x / 4294967296; }; }
function sample(rand) {
  let s = START; const beats = [];
  for (let k = 0; k < N; k++) {
    const ms = moves(k, s); if (!ms.length) return null; const m = ms[Math.floor(rand() * ms.length)];
    const rooms = ROOMS.map((_, i) => i).filter((i) => !CLOSED[k] || DOOR[i]); const r = rooms[Math.floor(rand() * rooms.length)];
    beats.push({ ...m, r }); s = step(k, s, m);
  }
  return beats;
}
// replay with room traces, for scoring and for the film
function replay(beats) {
  let s = START; const traces = []; const ev = Array.from({ length: 4 }, () => new Set()); const seen = []; const log = [];
  beats.forEach((m, k) => {
    const found = [];
    // anyone in this room under any light but moonlight finds what earlier deeds left here
    if (m.l >= 1) for (const tr of traces) if (tr.r === m.r && !tr.found) { for (const x of [m.a, m.b, ...[0, 1, 2, 3].filter((x) => m.w >> x & 1)]) if (s.alive >> x & 1) ev[x].add(tr.k); tr.found = true; found.push(tr.k); }
    const before = s.g; s = step(k, s, m);
    const learnt = []; for (let x = 0; x < 4; x++) if ((s.g & bit(x, m.a)) && !(before & bit(x, m.a))) learnt.push(x);
    const direct = [0, 1, 2, 3].filter((x) => x !== m.a && x !== m.b && (m.w >> x & 1) && m.l >= 1 && !CLOSED[k]);
    seen.push(direct.length > 0 || (m.l === 3 && !CLOSED[k]));
    traces.push({ k, r: m.r, mat: MAT[k], found: false });
    log.push({ k, deed: DEEDS[k], a: m.a, b: m.b, room: ROOMS[m.r], r: m.r, light: LIGHTS[m.l], l: m.l, w: m.w, mat: MAT[k], learnt, found, alive: s.alive, tied: s.tied });
  });
  // a deed is solved when someone alive at the end knows who did it, by having seen it, suffered it, or found its trace
  const knowsCulprit = (x, k) => { const a = beats[k].a; return ev[x].has(k) || (s.g & bit(x, a)) && (k === 0 || true); };
  let solved = 0; for (let k = 0; k < N; k++) if ([0, 1, 2, 3].some((x) => x !== beats[k].a && (s.alive >> x & 1) && knowsCulprit(x, k))) solved++;
  const rooms = new Set(beats.map((m) => m.r)).size;
  const vis = seen.filter(Boolean).length;
  // answered deeds: the actor had been wronged by the target before
  let answered = 0; { let t = START; beats.forEach((m, k) => { if (t.g & bit(m.a, m.b)) answered++; t = step(k, t, m); }); }
  const actors = new Set(beats.map((m) => m.a)).size;
  return { solved, rooms, vis, answered, actors, alive: pc(s.alive), log };
}
const bin4 = (v, cuts) => cuts.findIndex((c) => v <= c);
const cell = (q) => [bin4(q.solved, [3, 6, 9, 12]), bin4(q.rooms, [2, 3, 4, 6]), bin4(q.vis, [2, 4, 6, 12])];

module.exports = { SACKS, DEEDS, MAT, CLOSED, KILLS, TIES, ROOMS, DOOR, LIGHTS, PAIRS, START, bit, pack, moves, step, roomsFor, completions, replay, rng, sample, cell };
if (require.main === module) {
const out = { SACKS, DEEDS, MAT, CLOSED, ROOMS, LIGHTS };
const t0 = Date.now();
out.pairsOnly = (12n ** 12n).toString();
let raw = 1n; for (let k = 0; k < N; k++) raw *= 12n * 6n * 4n * 4n; out.framesRaw = raw.toString();
const full = dp(true, true); out.framesValid = full.total.toString(); out.perBeat = full.per;
out.check = {}; for (const D of [1, 2, 3]) { const b = brute(D); out.check[D] = { brute: b.count.toString(), dp: dpDepth(D).toString(), raw: b.raw.toString() }; }
// the million films, scored by one number
const rand = rng(20261106); let dead = 0; let top = []; const grid = {}; const SCORE = (q) => q.solved * 10 + q.answered;
for (let i = 0; i < 1000000; i++) {
  const f = sample(rand); if (!f) { dead++; i--; continue; } const q = replay(f); const sc = SCORE(q);
  if (top.length < 3 || sc > top[top.length - 1].sc) { top.push({ sc, f, q: { ...q, log: undefined } }); top.sort((x, y) => y.sc - x.sc); top = top.slice(0, 3); }
  const c = cell(q).join(','); if (!grid[c] || q.answered > grid[c].q.answered) grid[c] = { f, q: { ...q, log: undefined }, sc };
}
out.top = top.map((t) => ({ sc: t.sc, q: t.q, open: t.f.slice(0, 3).map((m, k) => [DEEDS[k], SACKS[m.a], SACKS[m.b], ROOMS[m.r], LIGHTS[m.l]]) }));
out.deadEnds = dead; out.gridFilled = Object.keys(grid).length;
out.grid = Object.fromEntries(Object.entries(grid).map(([c, g]) => [c, { solved: g.q.solved, rooms: g.q.rooms, vis: g.q.vis, answered: g.q.answered, sc: g.sc }]));
out.topCells = top.map((t) => cell(t.q).join(','));
out.secs = (Date.now() - t0) / 1000;
// keep elites for the film to choose from
out.elites = Object.fromEntries(Object.entries(grid).map(([c, g]) => [c, g.f]));
console.log(JSON.stringify(out));
}
