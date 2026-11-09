
/* ================= The House of Asterion ================= */
const NIGHT = '#221d18', WIGRED = P.red, STONE = '#bdb39c', STONE2 = '#a79d86', WATER = '#9fb0b3', BRONZE = '#b8864a', HIDE = '#4b4137';
KIT = { ...KIT, X: { lw: 17, coat: 'singlet' }, Z: { lw: 12, coat: 'shirt' }, Q: { lw: 11, coat: 'shirt' } };
/* Asterion's head: a bull's */
function bullHead(x, y, o, id) {
  X.save(); X.translate(x, y); if ((o.f || 1) < 0) { /* mirrored by the puppet's own transform */ }
  // horns
  ink([[-6, -12], [-14, -26], [-8, -40]], 6.4, id + 11, 0.2, P.ink); ink([[6, -13], [12, -28], [22, -38]], 6.4, id + 12, 0.2, P.ink); ink([[-6, -12], [-14, -26], [-8, -40]], 4, id + 1, 0.2, '#e8dcc0'); ink([[6, -13], [12, -28], [22, -38]], 4, id + 2, 0.2, '#e8dcc0');
  shape([[-18, -4], [-30, -10], [-22, 2]], { lw: 1.1, id: id + 3, fill: HIDE }); // ear
  X.beginPath(); X.ellipse(2, -2, 19, 16, 0.15, 0, 6.283); X.fillStyle = HIDE; X.fill(); X.lineWidth = 1.6; X.strokeStyle = P.ink; X.stroke();
  X.save(); X.beginPath(); X.ellipse(2, -2, 19, 16, 0.15, 0, 6.283); X.clip(); X.fillStyle = PAT.d; X.fillRect(-20, -20, 40, 36); X.restore();
  X.beginPath(); X.ellipse(18, 9, 12, 9.5, 0.3, 0, 6.283); X.fillStyle = '#7a6a58'; X.fill(); X.lineWidth = 1.4; X.stroke();
  for (const nx of [16, 23]) { X.beginPath(); X.arc(nx, 10, 1.8, 0, 6.283); X.fillStyle = P.ink; X.fill(); }
  const mo = o.mouth || 0; if (mo > 0.06) { X.fillStyle = P.ink; X.fillRect(12, 15, 12, 1.5 + mo * 4); } else line([12, 16], [24, 16], 1.2, id + 4, 0.05);
  if (o.closed) line([4, -5], [11, -5], 1.6, id + 5, 0.05, '#e8dcc0'); else { X.beginPath(); X.arc(8, -5, 2.6, 0, 6.283); X.fillStyle = '#e8dcc0'; X.fill(); X.beginPath(); X.arc(8.6, -5.4, 1.2, 0, 6.283); X.fillStyle = P.ink; X.fill(); }
  X.restore();
}
HEADX.X = (o, x, y, r, id) => { bullHead(x, y, o, id + 100); return true; };
HEADX.Z = (o, x, y, r, id) => { X.beginPath(); X.arc(x, y - 3, r + 2, Math.PI, 0); X.closePath(); X.fillStyle = BRONZE; X.fill(); X.lineWidth = 1.2; X.strokeStyle = P.ink; X.stroke(); shape([[x - 10, y - r - 2], [x + 12, y - r - 2], [x + 4, y - r - 16], [x - 14, y - r - 12]], { lw: 1, id: id + 80, fill: P.red }); };
HEADX.XZ = (o, x, y, r, id) => { ink([[x - 6, y - 10], [x - 14, y - 24], [x - 8, y - 36]], 5.6, id + 83, 0.2, P.ink); ink([[x + 6, y - 11], [x + 12, y - 25], [x + 20, y - 34]], 5.6, id + 84, 0.2, P.ink); ink([[x - 6, y - 10], [x - 14, y - 24], [x - 8, y - 36]], 3.4, id + 81, 0.2, '#e8dcc0'); ink([[x + 6, y - 11], [x + 12, y - 25], [x + 20, y - 34]], 3.4, id + 82, 0.2, '#e8dcc0'); };
const ast = (o) => human({ kind: 'X', s: 1.2, id: 110000, ...o });

/* ---------- the house as a torus of identical courtyards ---------- */
const NN = 14, CELL = 46, PX = 318, PY = 38;
const BOD = [[5, 3], [6, 4], [4, 6], [8, 2], [9, 5], [2, 9], [11, 11], [12, 7], [7, 12]];
const bodyAt = (x, y) => BOD.some(([a, b]) => a === x && b === y);
const PATH = [[3, 3], [4, 3], [5, 3], [5, 4], [6, 4], [7, 4], [7, 5], [8, 5], [9, 5], [9, 4], [9, 3], [9, 2], [8, 2]];
/* belief: every courtyard he could be in, given his moves and what he has seen at each step */
function beliefs(withBodies) {
  const out = []; let B = null;
  PATH.forEach(([x, y], i) => {
    const obs = withBodies && bodyAt(x, y);
    const all = []; for (let a = 0; a < NN; a++) for (let b = 0; b < NN; b++) all.push([a, b]);
    if (!B) B = all; else { const [dx, dy] = [x - PATH[i - 1][0], y - PATH[i - 1][1]]; B = B.map(([a, b]) => [(a + dx + NN) % NN, (b + dy + NN) % NN]); }
    B = B.filter(([a, b]) => (withBodies && bodyAt(a, b)) === obs);
    out.push(B.map((c) => c.slice()));
  });
  return out;
}
let BEL0 = null, BEL1 = null;
function prep() { BEL0 = beliefs(false); BEL1 = beliefs(true); }
/* the plan. o: u (ink), belief (array of cells), at ([x,y,frac]), ghost, bodies 0..1, wrap, tiles */
function labyrinth(lt, o = {}) {
  const u = o.u ?? 1;
  if (!o.noBg) { X.fillStyle = '#d9cfb4'; X.fillRect(-600, -600, 2600, 2000); }
  shape(R(PX - 14, PY - 14, NN * CELL + 28, NN * CELL + 28), { lw: 1.6, id: 111000, fill: STONE2, h: [0.7, 5, 0.3] });
  const bel = o.belief ? new Set(o.belief.map(([a, b]) => a + ',' + b)) : null;
  for (let a = 0; a < NN; a++) for (let b = 0; b < NN; b++) {
    const v = clamp(u * (2 * NN + 2) - (a + b)); if (v <= 0) continue; X.globalAlpha = v;
    const x = PX + a * CELL, y = PY + b * CELL, inB = bel && bel.has(a + ',' + b);
    X.fillStyle = inB ? '#f1d98e' : P.paper; X.fillRect(x + 6, y + 6, CELL - 12, CELL - 12);
    X.fillStyle = WATER; X.fillRect(x + 17, y + 17, 12, 12);
    // pillars at the corners: the galleries open on all four sides
    X.fillStyle = '#6f6a61'; X.fillRect(x, y, 8, 8);
    X.globalAlpha = 1;
  }
  X.strokeStyle = P.ink; X.lineWidth = 1.4; X.strokeRect(PX, PY, NN * CELL, NN * CELL);
  if (o.wrap) { const w = o.wrap; X.save(); X.globalAlpha = w; for (let q = 0; q < NN; q += 3) { const y = PY + q * CELL + 23; ink([[PX + NN * CELL + 4, y], [PX + NN * CELL + 30, y]], 2, 111100 + q, 0.05, P.red); ink([[PX - 30, y], [PX - 4, y]], 2, 111120 + q, 0.05, P.red); }
    mono('RIGHT EDGE = LEFT EDGE', PX + NN * CELL / 2, PY + NN * CELL + 2, 9, { col: P.red }); X.restore(); }
  if (o.bodies) BOD.forEach(([a, b], i) => { const v = clamp(o.bodies * 9 - i); if (v <= 0) return; X.globalAlpha = v; const x = PX + a * CELL + 23, y = PY + b * CELL + 23; ink([[x - 12, y + 8], [x + 12, y + 4]], 4, 111200 + i, 0.1, P.ink); ball(x + 14, y + 3, 4, 111210 + i, null, 1, P.ink); X.globalAlpha = 1; });
  if (o.ghost) { const [a, b] = o.ghost; X.save(); X.globalAlpha = 0.5; ball(PX + a * CELL + 23, PY + b * CELL + 23, 11, 111300, null, 1.4, P.paper); X.restore(); }
  if (o.at) { const [a, b] = o.at; ball(PX + a * CELL + 23, PY + b * CELL + 23, 11, 111310, null, 1.6, P.red); }
  if (o.trail) { const pts = o.trail.map(([a, b]) => [PX + a * CELL + 23, PY + b * CELL + 23]); if (pts.length > 1) { X.save(); X.setLineDash([4, 4]); ink(pts, 1.6, 111320, 0.05, P.red); X.restore(); } }
  if (o.count != null) { mono('COURTYARDS HE COULD BE IN', 1080, 330, 10, { col: P.ink, align: 'left' }); txt(String(o.count), 1080, 380, 40, { mono: true, col: P.red, align: 'left' }); }
}

/* ---------- the galleries in elevation ---------- */
const FL = 620;
function gallery(lt, o = {}) {
  X.fillStyle = o.dawn ? '#efe3c2' : STONE; X.fillRect(-600, -600, 2600, 2000);
  for (let y = -40; y < FL; y += 30) for (let x = -640 + ((y / 30) % 2) * 40; x < 1900; x += 80) { X.strokeStyle = 'rgba(28,24,20,.25)'; X.lineWidth = 0.8; X.strokeRect(x - ((o.off || 0) % 80), y, 80, 30); }
  // arches, one after another, all the same
  const off = (o.off || 0) % 260;
  for (let k = -2; k < 8; k++) { const x = k * 260 - off; X.fillStyle = o.dawn ? '#d9cfb4' : '#4b4137'; X.beginPath(); X.moveTo(x + 40, FL); X.lineTo(x + 40, 330); X.arc(x + 130, 330, 90, Math.PI, 0); X.lineTo(x + 220, FL); X.closePath(); X.fill(); X.lineWidth = 2; X.strokeStyle = P.ink; X.stroke();
    if (o.deep) { X.save(); X.clip(); for (let d = 1; d < 5; d++) { const s = Math.pow(0.6, d), cx = x + 130, cy = 470; X.beginPath(); X.moveTo(cx - 90 * s, cy + 150 * s); X.lineTo(cx - 90 * s, cy - 140 * s); X.arc(cx, cy - 140 * s, 90 * s, Math.PI, 0); X.lineTo(cx + 90 * s, cy + 150 * s); X.lineWidth = 1.2; X.strokeStyle = '#9c968b'; X.stroke(); } X.restore(); } }
  X.fillStyle = '#9c968b'; X.fillRect(-600, FL, 2600, 300); for (let y = FL + 14; y < FL + 200; y += 16) line([-600, y], [2000, y], 0.6, 112000 + y, 0.05);
  line([-600, FL], [2000, FL], 2.2, 112001, 0.2);
  if (o.pool) { X.fillStyle = WATER; X.beginPath(); X.ellipse(o.pool, FL + 40, 150, 22, 0, 0, 6.283); X.fill(); X.lineWidth = 1.4; X.strokeStyle = P.ink; X.stroke(); }
  if (o.light) { X.save(); X.globalAlpha = o.light; X.fillStyle = '#fff4cf'; X.beginPath(); X.moveTo(500, -100); X.lineTo(760, -100); X.lineTo(980, FL); X.lineTo(560, FL); X.closePath(); X.fill(); X.restore(); }
  if (o.dust) { X.fillStyle = 'rgba(80,72,62,.12)'; X.fillRect(-600, FL - 30, 2600, 30); }
}
function streetSet(lt, o = {}) {
  X.fillStyle = '#e8dcc0'; X.fillRect(-600, -600, 2600, 2000);
  X.fillStyle = '#7d8d96'; X.fillRect(-600, 330, 2600, 60); for (let q = 0; q < 6; q++) line([-600, 340 + q * 9], [2000, 342 + q * 9], 0.6, 113000 + q, 0.1, '#dfe3dc');
  // the temple of the axes
  shape(R(760, 210, 420, 30), { lw: 1.6, id: 113010, fill: STONE }); shape([[740, 210], [970, 130], [1200, 210]], { lw: 1.6, id: 113011, fill: STONE2 });
  for (let q = 0; q < 6; q++) { const x = 780 + q * 76; shape(R(x, 240, 26, 270), { lw: 1.3, id: 113020 + q, fill: STONE, h: [Math.PI / 2, 4, 0.3] }); }
  // a double axe carved over the door
  ink([[970, 150], [970, 196]], 2, 113040, 0.05); for (const sx of [-1, 1]) shape([[970, 160], [970 + sx * 18, 152], [970 + sx * 18, 182], [970, 174]], { lw: 1, id: 113041 + sx, fill: P.ink });
  shape(R(740, 510, 460, 24), { lw: 1.4, id: 113050, fill: STONE2 }); shape(R(720, 534, 500, 24), { lw: 1.4, id: 113051, fill: STONE2 });
  X.fillStyle = '#cfc2a0'; X.fillRect(-600, 558, 2600, 300); line([-600, 558], [2000, 558], 2, 113060, 0.2);
  // the house wall, left, with its open door
  shape(R(-100, 120, 300, 440), { lw: 1.8, id: 113070, fill: STONE, h: [0, 4, 0.3] }); shape(R(80, 330, 90, 228), { lw: 1.6, id: 113071, fill: '#2f2a26' });
}
function crowdFace(x, y, s, id) { ball(x, y, 14 * s, id, null, 1.2, '#e4d6b4'); }

/* ================= shots ================= */
SHOTS.title = (lt, sd, sh) => {
  const ik = cue(sh, 'ink'), nm = cue(sh, 'name');
  cam(camFor(lt, [[0, ON(640, 360, 1.4)], [3, ON(640, 360, 1.0), 5]]), () => labyrinth(lt, { u: U(lt, ik.at, ik.to) }));
  if (lt > nm.at) { X.globalAlpha = U(lt, nm.at, nm.at + 1); shape(R(340, 290, 600, 120), { lw: 1.6, id: 114000, fill: P.paper }); txt('THE HOUSE OF ASTERION', 640, 336, 38, {}); txt('after Jorge Luis Borges', 640, 378, 17, { italic: true }); X.globalAlpha = 1; }
};
SHOTS.accused = (lt, sd, sh) => {
  const L = sh.lines, dr = cue(sh, 'doors');
  let c = camFor(lt, [[0, ON(640, 380, 1.0)], [dr.at, ON(700, 400, 0.8), 3], [L[2].t0, ON(640, 380, 1.0), 2]]);
  { const [hx, hy] = headPos({ kind: 'X', x: 640, y: FL, s: 1.2 }); c = withTight(sh, lt, c, hx + 10, hy, 2.6); }
  cam(c, () => { gallery(lt, { deep: lt > dr.at, off: lt * 6 }); ast({ x: 640, y: FL, f: 1, mouth: sayAt(sh, 'A', lt), hn: [40, -110], hf: [-20, -96] }); });
};
SHOTS.street = (lt, sd, sh) => {
  const L = sh.lines, fc = cue(sh, 'faces'), fl = cue(sh, 'flee'), st = cue(sh, 'stones'), hm = cue(sh, 'home');
  let c = camFor(lt, [[0, ON(640, 380, 1.0)], [fc.at, ON(560, 360, 1.3), 1.0], [fl.at, ON(640, 380, 1.0), 1.0]]);
  c = withTight(sh, lt, c, 280, 420, 2.2);
  const walk = U(lt, 0.4, 4), back = U(lt, L[3].t0, L[3].t1 + 1);
  cam(c, () => { streetSet(lt);
    const run = U(lt, fl.at, fl.at + 3);
    for (let q = 0; q < 10; q++) { const x0 = 420 + q * 64, dir = q % 2 ? 1 : -1, x = x0 + dir * run * (80 + q * 20) + (q > 6 ? run * 120 : 0), y = 558 - (q % 3) * 6; const climb = q > 6 && q < 9 ? -run * (60 + q * 6) : 0;
      human({ kind: 'Q', x, y: y + climb, s: 0.75, f: q < 5 ? -1 : 1, pose: run > 0 && run < 1 ? 'walk' : q === 3 && run > 0.5 ? 'flat' : 'stand', ph: lt * 9 + q, hn: q === 4 && lt > st.at ? [30, -190] : undefined, id: 115000 + q * 10 }); }
    if (lt > st.at) for (let q = 0; q < 3; q++) { const u = ((lt - st.at) * 0.8 + q * 0.3) % 1; const sx = lerp(700, 300, u), sy = 420 - Math.sin(Math.PI * u) * 120 + u * 100; shape(rock(sx, sy, 8, 115200 + q, 7), { lw: 1.1, id: 115200 + q, fill: '#9c968b' }); }
    ast({ x: lerp(120, 300, walk) - back * 200, y: 558, s: 1.05, f: back > 0 ? -1 : 1, pose: (walk > 0 && walk < 1) || (back > 0 && back < 1) ? 'walk' : 'stand', ph: lt * 6, mouth: sayAt(sh, 'A', lt), look: lt > fc.at ? 0.6 : 0 });
    if (lt > fc.at && lt < fl.at) { for (let q = 0; q < 6; q++) crowdFace(520 + q * 70, 380 + (q % 2) * 20, 1.6, 115300 + q); } });
};
SHOTS.unique = (lt, sd, sh) => {
  const L = sh.lines, lt_ = cue(sh, 'letters');
  let c = camFor(lt, [[0, ON(640, 380, 1.0)], [lt_.at, ON(780, 360, 1.4), 1.0]]); { const [hx, hy] = headPos({ kind: 'X', x: 560, y: FL, s: 1.2 }); c = withTight(sh, lt, c, hx + 10, hy + 10, 2.4); }
  cam(c, () => { gallery(lt, { pool: 900 }); ast({ x: 560, y: FL, f: 1, mouth: sayAt(sh, 'A', lt), look: lt > lt_.at ? 1 : 0, lookY: lt > lt_.at ? 0.6 : 0, hn: lt > lt_.at ? [80, -120] : undefined });
    if (lt > lt_.at) { shape(R(820, 300, 160, 110), { lw: 1.6, id: 116000, fill: '#d9cfb4' }); const s = 'ABΓΔEZHΘIKΛMNΞ'; for (let q = 0; q < 12; q++) { const ch = s[(q + Math.floor(lt * 3)) % s.length]; txt(ch, 845 + (q % 4) * 36 + Math.sin(lt * 3 + q) * 4, 330 + Math.floor(q / 4) * 32 + Math.cos(lt * 2 + q) * 4, 20, { mono: true, col: P.ink }); } } });
};
SHOTS.games = (lt, sd, sh) => {
  const Q = (k) => cue(sh, k).at, L = sh.lines;
  if (lt < Q('hide')) { const run = U(lt, Q('run'), cue(sh, 'run').to), dizzy = run >= 1; const off = lt * 520 * (dizzy ? 0 : 1);
    cam(ON(640, 380, 1.0), () => { gallery(lt, { off: dizzy ? cue(sh, 'run').to * 520 : off }); ast({ x: dizzy ? 640 : 520, y: FL, f: 1, pose: dizzy ? 'flat' : 'walk', ph: lt * 14, closed: dizzy, hn: dizzy ? undefined : [70, -120], hf: dizzy ? undefined : [60, -120] }); }); return; }
  if (lt < Q('roof')) { cam(camFor(lt - Q('hide'), [[0, ON(760, 460, 1.4)]]), () => { gallery(lt, { pool: 900 }); darken(0.25); ast({ x: 720, y: FL, f: 1, pose: 'kneel2', look: -1, hn: [20, -50], hf: [10, -48] }); }); return; }
  if (lt < Q('sleep')) { const u = U(lt, Q('roof') + 0.8, Q('roof') + 2.0);
    cam(ON(640, 360, 1.0), () => { gallery(lt, {}); shape(R(-100, 100, 1500, 50), { lw: 1.6, id: 117000, fill: STONE2, h: [0, 4, 0.3] }); ast({ x: 760, y: lerp(100, FL, E.in(u)), f: 1, pose: u >= 1 ? 'flat' : u > 0 ? 'crawl' : 'stand', closed: u >= 1 }); if (u >= 1) { X.fillStyle = P.red; for (let q = 0; q < 4; q++) X.fillRect(780 + q * 14, FL - 6 + (q % 2) * 3, 6, 3); } }); return; }
  const tint = lt > Q('wake') ? U(lt, Q('wake'), Q('wake') + 1.5) : 0;
  let c = camFor(lt - Q('sleep'), [[0, ON(640, 480, 1.4)]]); { c = withTight(sh, lt, c, 690, 590, 2.6); }
  cam(c, () => { gallery(lt, { light: 0.25 + tint * 0.4, dawn: tint > 0.5 }); ast({ x: 640, y: FL, f: 1, pose: 'flat', closed: lt < Q('wake') + 0.6 }); if (tint > 0) { X.save(); X.globalAlpha = tint * 0.25; X.fillStyle = '#e3ad46'; X.fillRect(-600, -600, 2600, 2000); X.restore(); } });
};
SHOTS.other = (lt, sd, sh) => {
  const L = sh.lines, gh = cue(sh, 'ghost'), wk = cue(sh, 'walk'), pl = cue(sh, 'plan');
  if (lt < pl.at) { const u = U(lt, wk.at, wk.to);
    cam(camFor(lt, [[0, ON(640, 380, 1.0)]]), () => { gallery(lt, { off: u * 780, pool: lt > L[1].t0 + 6 ? 700 : 0 });
      const bow = lt > L[1].t0 && lt < L[1].t0 + 1.4 ? 1 : 0;
      ast({ x: 520, y: FL, f: 1, pose: bow ? 'stoop' : u > 0 && u < 1 ? 'walk' : 'stand', ph: lt * 7, mouth: sayAt(sh, 'A', lt), hn: [80, -140] });
      if (lt > gh.at) human({ kind: 'X', x: 740, y: FL, s: 1.2, f: -1, pose: u > 0 && u < 1 ? 'walk' : 'stand', ph: lt * 7 + 1, alpha: 0.35 * U(lt, gh.at, gh.at + 1), id: 118000 }); });
    return; }
  const k = Math.min(PATH.length - 1, Math.floor(U(lt, pl.at, L[3].t1) * PATH.length));
  let c = camFor(lt - pl.at, [[0, ON(640, 360, 1.0)]]); c = withTight(sh, lt, c, 640, 360, 1.0);
  cam(c, () => { labyrinth(lt, { belief: BEL0[k], at: PATH[k], ghost: PATH[Math.max(0, k - 1)], trail: PATH.slice(0, k + 1), count: BEL0[k].length }); });
};
SHOTS.house = (lt, sd, sh) => {
  const Q = (k) => cue(sh, k).at;
  if (lt < Q('sea')) {
    const wrapU = U(lt, Q('wrap'), Q('wrap') + 3), ax = lt > Q('wrap') ? (12 + Math.floor(wrapU * 4)) % NN : 6;
    cam(camFor(lt, [[0, ON(640, 360, 1.0)]]), () => { labyrinth(lt, { at: [ax, 6], wrap: lt > Q('wrap') ? 1 : 0 });
      if (lt > Q('fourteen')) { mono('14 x 14 = 196 COURTYARDS, ALL THE SAME', 1080, 300, 10, { col: P.red, align: 'left' }); mono('196 POOLS', 1080, 330, 10, { col: P.ink, align: 'left' }); mono('196 TROUGHS', 1080, 350, 10, { col: P.ink, align: 'left' }); mono('196 MANGERS', 1080, 370, 10, { col: P.ink, align: 'left' }); } });
    return; }
  // the house is the world: copies of itself, and above them one sun
  const z = lerp(1.0, 0.33, E.io(U(lt, Q('sea'), Q('sea') + 4)));
  let c = ON(640, 300, z); c = withTight(sh, lt, c, 640, -90, 0.42);
  cam(c, () => { X.fillStyle = '#d9cfb4'; X.fillRect(-3000, -3000, 8000, 8000);
    for (let i = -1; i <= 1; i++) for (let j = -1; j <= 1; j++) { X.save(); X.translate(i * (NN * CELL + 28), j * (NN * CELL + 28)); labyrinth(lt, { noBg: true, at: i === 0 && j === 0 && lt > Q('sun') ? [6, 6] : null }); X.restore(); }
    if (lt > Q('sun')) { const u = U(lt, Q('sun'), Q('sun') + 1); X.globalAlpha = u; X.fillStyle = '#fff4cf'; X.beginPath(); X.arc(640, -520, 90, 0, 6.283); X.fill(); X.lineWidth = 3; X.strokeStyle = P.ink; X.stroke(); for (let q = 0; q < 16; q++) { const a = q * Math.PI / 8; line([640 + Math.cos(a) * 110, -520 + Math.sin(a) * 110], [640 + Math.cos(a) * 150, -520 + Math.sin(a) * 150], 3, 118500 + q, 0.05); } mono('ONE SUN', 640, -380, 30, { col: P.red }); mono('ONE ASTERION', 640, 360 + 330, 30, { col: P.red }); X.globalAlpha = 1; } });
};
SHOTS.nine = (lt, sd, sh) => {
  const Q = (k) => cue(sh, k).at, L = sh.lines;
  if (lt < Q('mark')) {
    const fu = U(lt, Q('fall'), cue(sh, 'fall').to), rn = U(lt, Q('run'), Q('run') + 3);
    cam(camFor(lt, [[0, ON(640, 380, 1.0)]]), () => { gallery(lt, { off: rn * 300 });
      for (let q = 0; q < 9; q++) { const fallen = fu * 9 > q; const x = 760 + q * 52 - U(lt, Q('enter'), Q('enter') + 4) * 200;
        human({ kind: 'Q', x, y: FL, s: 0.95, f: -1, pose: fallen ? 'flat' : 'stand', closed: fallen, id: 119000 + q * 10 }); }
      ast({ x: lerp(160, 560, rn), y: FL, f: 1, pose: rn > 0 && rn < 1 ? 'walk' : 'stand', ph: lt * 10, mouth: sayAt(sh, 'A', lt), hn: [60, -120] }); });
    return; }
  const k = Math.min(PATH.length - 1, Math.floor(U(lt, Q('mark'), cue(sh, 'mark').to) * PATH.length));
  let c = camFor(lt - Q('mark'), [[0, ON(640, 360, 1.0)]]); c = withTight(sh, lt, c, 640, 360, 1.0);
  cam(c, () => { labyrinth(lt, { bodies: 1, belief: BEL1[k], at: PATH[k], trail: PATH.slice(0, k + 1), count: BEL1[k].length }); });
};
SHOTS.redeemer = (lt, sd, sh) => {
  const L = sh.lines, ls = cue(sh, 'listen'), fc = cue(sh, 'faces');
  if (lt < fc.at) { let c = camFor(lt, [[0, ON(640, 400, 1.0)], [ls.at, ON(620, 360, 1.4), 2]]);
    cam(c, () => { gallery(lt, { dust: true, pool: 980 }); ast({ x: 600, y: FL, f: 1, pose: 'sit', mouth: sayAt(sh, 'A', lt), look: lt > ls.at ? -0.4 : 0, lookY: lt > ls.at ? -1 : 0 }); shape(R(560, FL - 100, 90, 100), { lw: 1.4, id: 120000, fill: STONE2 });
      if (lt > ls.at) { X.save(); for (let q = 0; q < 4; q++) { const r = ((lt * 50 + q * 60) % 240); X.globalAlpha = 0.5 * (1 - r / 240); X.beginPath(); X.arc(1300, 380, r + 40, Math.PI * 0.75, Math.PI * 1.25); X.lineWidth = 1.4; X.strokeStyle = P.ink; X.stroke(); } X.restore(); } }); return; }
  // four faces: a bull, a man, a man with horns, and Asterion
  const n = Math.min(4, 1 + Math.floor((lt - fc.at) / 1.5));
  let c = camFor(lt - fc.at, [[0, ON(640, 360, 1.0)]]); c = withTight(sh, lt, c, 640, 340, 1.1);
  cam(c, () => { X.fillStyle = STONE; X.fillRect(-600, -600, 2600, 2000);
    const kinds = ['X', 'Z', 'XZ', 'X']; const labels = ['A BULL', 'A MAN', 'A BULL WITH A MAN’S FACE', 'LIKE ME'];
    for (let i = 0; i < n; i++) { const x = 220 + i * 280, y = 360; shape(R(x - 110, y - 150, 220, 300), { lw: 1.6, id: 120100 + i, fill: P.paper });
      X.save(); X.translate(x, y); X.scale(3.2, 3.2); ball(0, 0, 15, 120200 + i, PAT.f, 1.4, P.paper); if (kinds[i] === 'X') bullHead(0, 0, { closed: false }, 120300 + i * 20); else { head({ kind: kinds[i] === 'XZ' ? 'XZ' : 'Z' }, 0, 0, 15, 120400 + i * 20); } X.restore();
      mono(labels[i], x, y + 130, 10, { col: i === 3 ? P.red : P.ink }); }
  });
};
SHOTS.theseus = (lt, sd, sh) => {
  const L = sh.lines;
  let c = camFor(lt, [[0, ON(760, 300, 1.8)], [L[0].t1, ON(640, 380, 1.0), 1.4]]); { const [hx, hy] = headPos({ kind: 'Z', x: 640, y: FL, s: 1.2 }); c = withTight(sh, lt, c, hx + 10, hy + 30, 2.4); }
  cam(c, () => { gallery(lt, { dawn: true, light: 0.6, deep: true });
    // the thread, from the way in, back into the galleries
    ink([[-100, FL - 10], [300, FL - 14], [500, FL - 8], [580, FL - 60]], 1.6, 121000, 0.4, P.red);
    human({ kind: 'Z', x: 640, y: FL, s: 1.2, f: -1, hn: [30, -170], hf: [-10, -96], mouth: sayAt(sh, 'T', lt), id: 121100 });
    const hx = 640 - 30 * 1.2, hy = FL - 170 * 1.2; ink([[hx, hy], [hx - 10, hy - 110]], 5, 121200, 0.05, BRONZE); line([hx - 14, hy - 4], [hx + 10, hy - 2], 3, 121201, 0.05, P.ink);
    X.save(); X.globalAlpha = 0.6 + 0.4 * Math.sin(lt * 3); X.fillStyle = '#fffbe9'; X.beginPath(); X.arc(hx - 8, hy - 90, 6, 0, 6.283); X.fill(); X.restore();
    human({ kind: 'R', x: 380, y: FL, s: 1.1, f: 1, hn: [30, -96], id: 121300 });
    // far back in the gallery, in shadow, the one who lies there
    X.save(); X.globalAlpha = 0.5; human({ kind: 'X', x: 1080, y: FL - 60, s: 0.55, f: -1, pose: 'flat', closed: true, id: 121400 }); X.restore();
  });
};
SHOTS.end = (lt, sd, sh) => {
  cam(ON(640, 360, 1.0), () => labyrinth(lt, { bodies: 1 }));
  X.globalAlpha = seg(lt, 1.0, 2.2);
  shape(R(220, 260, 840, 200), { lw: 1.6, id: 122000, fill: P.paper });
  txt('THE HOUSE OF ASTERION', 640, 300, 30, {});
  txt('after Jorge Luis Borges, La casa de Asterión (1947), in Labyrinths, edited by Donald A. Yates and James E. Irby.', 640, 346, 14, { italic: true });
  txt('The house is drawn as 196 identical courtyards on a torus. The count is of the courtyards he could be in.', 640, 376, 14, { italic: true });
  txt('Nothing is quoted from Borges.', 640, 406, 14, { italic: true });
  X.globalAlpha = 1; void sh; void sd;
};
