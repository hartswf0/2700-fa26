const fs = require('fs'); const E = require('./engine.js'); const { SACKS, DEEDS, PAIRS, START, moves, step, roomsFor, completions, replay } = E;
const d = JSON.parse(fs.readFileSync('data.json')); const CELL = process.argv[2] || '3,0,3'; const film = d.elites[CELL];
const res = { cell: CELL, film, log: replay(film).log, q: { ...replay(film), log: undefined } };
// along the film: at each beat, the exact chance of each of the twelve pairs, and its entropy
let s = START; res.fans = [];
for (let k = 0; k < 12; k++) {
  const tot = completions(k, s); const by = Array(12).fill(0n); const R = BigInt(roomsFor(k));
  for (const m of moves(k, s)) by[m.pi] += R * completions(k + 1, step(k, s, m));
  const p = by.map((n) => Number((n * 1000000n) / tot) / 1e6); let H = 0; for (const x of p) if (x > 0) H -= x * Math.log2(x);
  res.fans.push({ k, total: tot.toString(), p, open: p.filter((x) => x > 0).length, H: +H.toFixed(3), chosen: film[k].pi });
  s = step(k, s, film[k]);
}
// how many who-to-whom openings of three deeds can start a valid film
const ok = new Set(); const rec = (k, st, pre) => { if (k === 3) { if (completions(3, st) > 0n) ok.add(pre.join('-')); return; } for (const m of moves(k, st)) rec(k + 1, step(k, st, m), [...pre, m.pi]); };
rec(0, START, []); res.openings = ok.size;
// a who-to-whom film drawn at random, checked beat by beat: where does it first break a rule, and which
const rand = E.rng(7); const why = { dead: 0, tied: 0, strand: 0 };
let example = null;
for (let i = 0; i < 200000; i++) {
  let st = START; const pis = Array.from({ length: 12 }, () => Math.floor(rand() * 12));
  for (let k = 0; k < 12; k++) { const [a, b] = PAIRS[pis[k]];
    let bad = null; if (!(st.alive >> a & 1) || !(st.alive >> b & 1)) bad = 'dead'; else if (st.tied >> a & 1) bad = 'tied'; else if ((st.acted >> a & 1) && !(st.g & E.bit(a, b))) bad = 'strand';
    if (bad) { why[bad]++; if (!example && bad === 'strand' && k >= 3) example = { pis: pis.slice(0, k + 1), k, a, b }; break; }
    st = step(k, st, { a, b, l: 2, w: 0 }); }
}
res.why = why; res.example = example;
fs.writeFileSync('film.json', JSON.stringify(res));
console.log(CELL, 'openings', res.openings, 'why', JSON.stringify(why), 'example', JSON.stringify(example));
res.fans.forEach((f) => console.log(f.k, DEEDS[f.k].padEnd(22), 'open', f.open, 'H', f.H, 'chosen', SACKS[PAIRS[f.chosen][0]] + '>' + SACKS[PAIRS[f.chosen][1]], 'p', f.p[f.chosen].toFixed(3), f.p.map((x) => x.toFixed(2)).join(' ')));
