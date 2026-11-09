
/* ================= And He Built a Crooked House ================= */
const NIGHT = '#221d18', WIGRED = P.red, SKY = '#dfe3dc', LEMON = '#e9d98a', SAND = '#c9b48a', CLAY = '#b8794f';
KIT = { ...KIT, T: { lw: 10, coat: 'shirt' }, H: { lw: 14, coat: 'coat' }, M: { lw: 12, coat: 'dress' } };
HEADX.T = (o, x, y, r, id) => { X.save(); circ(x, y, r, id); X.clip(); X.fillStyle = PAT.f; X.fillRect(x - r - 2, y - r - 2, r * 2.2, r * 0.55); X.restore(); for (const e of [0, 9]) { X.beginPath(); X.arc(x + 4 + e, y - 2, 4.2, 0, 6.283); X.lineWidth = 1.2; X.strokeStyle = P.ink; X.stroke(); } };
HEADX.H = (o, x, y, r, id) => { shape(R(x - 20, y - r + 1, 42, 4), { lw: 1, id: id + 3, fill: '#6f6a61' }); shape(R(x - 13, y - r - 11, 28, 13), { lw: 1, id: id + 4, fill: '#6f6a61' }); if (!o.noCigar) { line([x + 10, y + 8], [x + 22, y + 10], 3, id + 70, 0.05, '#7a5c3c'); if (Math.sin(GT * 2) > 0.3) { X.globalAlpha = 0.4; ball(x + 26, y + 4 - (GT * 8 % 10), 3, id + 71, null, 0.6, P.paper); X.globalAlpha = 1; } } };
HEADX.M = (o, x, y, r, id) => { X.beginPath(); X.ellipse(x - 2, y - r + 2, r + 10, 5, -0.1, 0, 6.283); X.fillStyle = '#7e2c25'; X.fill(); X.beginPath(); X.arc(x - 2, y - r + 1, r * 0.7, Math.PI, 0); X.fill(); ball(x + 10, y - r - 4, 3, id + 72, null, 0.8, P.paper); };

/* ---------- four dimensions ---------- */
const V4 = []; for (let i = 0; i < 16; i++) V4.push([i & 1 ? 1 : -1, i & 2 ? 1 : -1, i & 4 ? 1 : -1, i & 8 ? 1 : -1]);
const E4 = []; for (let i = 0; i < 16; i++) for (let b = 0; b < 4; b++) { const j = i ^ (1 << b); if (j > i) E4.push([i, j, b]); }
function rot4(v, a, b, t) { const c = Math.cos(t), s = Math.sin(t), r = v.slice(); r[a] = v[a] * c - v[b] * s; r[b] = v[a] * s + v[b] * c; return r; }
/* draw a tesseract at (cx, cy) with size s; angles: {xw, yw, zw, xy, yz}; o.hl: highlight cube on axis b (0..3) and sign */
function tesseract(cx, cy, s, ang, o = {}) {
  const P3 = V4.map((v) => { let p = v; p = rot4(p, 0, 3, ang.xw || 0); p = rot4(p, 1, 3, ang.yw || 0); p = rot4(p, 2, 3, ang.zw || 0); p = rot4(p, 0, 2, ang.xz || 0); p = rot4(p, 1, 2, ang.yz || 0);
    const k4 = 3 / (3 - p[3]); const q = [p[0] * k4, p[1] * k4, p[2] * k4]; const k3 = 5 / (5 - q[2]); return [cx + q[0] * k3 * s, cy - q[1] * k3 * s, p[3]]; });
  const n = o.edges ?? E4.length;
  E4.slice(0, n).forEach(([i, j, b], k) => { const w = (P3[i][2] + P3[j][2]) / 2; const hl = o.hl && o.hl.some(([ax, sg]) => V4[i][ax] === sg && V4[j][ax] === sg);
    ink([[P3[i][0], P3[i][1]], [P3[j][0], P3[j][1]]], hl ? 2.8 : 1.2 + 0.6 * (w + 1), 93000 + k, 0.15, hl ? P.red : o.col || P.ink); });
  if (o.balls !== false) P3.slice(0, o.verts ?? 16).forEach(([x, y], k) => ball(x, y, o.clay ? 5 : 2.6, 93100 + k, null, 1, o.clay ? CLAY : P.ink));
  return P3;
}
/* ---------- cubes in three dimensions ---------- */
const VIEW = { yaw: -0.6, pitch: 0.38, f: 760, D: 12, cx: 640, cy: 380 };
function pj(p, v = VIEW) { const [x0, y0, z0] = p; const c = Math.cos(v.yaw), s = Math.sin(v.yaw); let x = x0 * c - z0 * s, z = x0 * s + z0 * c; const cp = Math.cos(v.pitch), sp = Math.sin(v.pitch); const y = y0 * cp - z * sp; z = y0 * sp + z * cp; const k = v.f / (z + v.D); return [v.cx + x * k, v.cy - y * k, z]; }
/* cubes: [{p:[x,y,z], s:1, fill, label, alpha}] drawn painter-sorted */
function cubes(list, v = VIEW, o = {}) {
  const faces = [];
  list.forEach((c, ci) => { const h = (c.s ?? 1) / 2, [x, y, z] = c.p; const C = [[x - h, y - h, z - h], [x + h, y - h, z - h], [x + h, y + h, z - h], [x - h, y + h, z - h], [x - h, y - h, z + h], [x + h, y - h, z + h], [x + h, y + h, z + h], [x - h, y + h, z + h]].map((q) => pj(q, v));
    const F = [[0, 1, 2, 3, 0], [4, 5, 6, 7, 1], [0, 1, 5, 4, 2], [3, 2, 6, 7, 3], [0, 3, 7, 4, 4], [1, 2, 6, 5, 5]];
    for (const f of F) { const pts = f.slice(0, 4).map((k) => C[k]); const zc = pts.reduce((a, q) => a + q[2], 0) / 4; const ax = pts[1][0] - pts[0][0], ay = pts[1][1] - pts[0][1], bx = pts[3][0] - pts[0][0], by = pts[3][1] - pts[0][1]; const cr = ax * by - ay * bx; faces.push({ pts, zc, ci, side: f[4], back: cr > 0, c }); } });
  faces.sort((a, b) => b.zc - a.zc);
  for (const f of faces) { X.globalAlpha = f.c.alpha ?? 1; const shade = [0.35, 0.1, 0.25, 0.0, 0.45, 0.2][f.side];
    shape(f.pts.map((q) => [q[0], q[1]]), { lw: o.wire ? 1 : 1.4, id: 94000 + f.ci * 10 + f.side, fill: o.wire ? null : f.c.fill || P.paper, h: o.wire ? undefined : shade > 0.15 ? [f.side * 0.9, 7 - shade * 8, 0.4] : undefined });
    if (f.c.pattern && f.side === 2 && !f.back) { X.save(); path(f.pts.map((q) => [q[0], q[1]])); X.clip(); X.globalAlpha = 0.5; for (let q = 0; q < 6; q++) { const a = f.pts[0], b = f.pts[1], d = f.pts[3]; X.beginPath(); X.moveTo(lerp(a[0], b[0], q / 6), lerp(a[1], b[1], q / 6)); X.lineTo(lerp(d[0], b[0], q / 6), lerp(d[1], b[1], q / 6)); X.lineWidth = 0.8; X.strokeStyle = P.ink; X.stroke(); } X.restore(); }
    X.globalAlpha = 1; }
  if (o.labels) list.forEach((c) => { if (!c.label) return; const [x, y] = pj(c.p, v); mono(c.label, x, y + 4, 9, { col: P.red }); });
}
// the unfolded tesseract: four in a column, four around the second
const NET = [{ p: [0, 0, 0], label: 'GROUND' }, { p: [0, 1, 0], label: 'MIDDLE' }, { p: [0, 2, 0], label: 'BEDROOM' }, { p: [0, 3, 0], label: 'STUDY' }, { p: [1, 1, 0], label: 'KITCHEN' }, { p: [-1, 1, 0], label: 'DINING' }, { p: [0, 1, 1], label: 'LOUNGE' }, { p: [0, 1, -1], label: 'DRAWING' }];
/* the rooms and which touch which: every pair except the opposite one */
const RMS = ['GROUND', 'MIDDLE', 'BEDROOM', 'STUDY', 'KITCHEN', 'DINING', 'LOUNGE', 'DRAWING'];
const OPP = { GROUND: 'BEDROOM', BEDROOM: 'GROUND', MIDDLE: 'STUDY', STUDY: 'MIDDLE', KITCHEN: 'DINING', DINING: 'KITCHEN', LOUNGE: 'DRAWING', DRAWING: 'LOUNGE' };
function roomGraph(cx, cy, r, u = 1, o = {}) {
  const pos = RMS.map((n, i) => { const a = -Math.PI / 2 + i * Math.PI / 4; return [cx + Math.cos(a) * r, cy + Math.sin(a) * r]; });
  let k = 0; const E = [];
  for (let i = 0; i < 8; i++) for (let j = i + 1; j < 8; j++) if (OPP[RMS[i]] !== RMS[j]) E.push([i, j]);
  const n = Math.floor(E.length * u);
  E.slice(0, n).forEach(([i, j]) => { const ring = o.ring && o.ring.includes(i) && o.ring.includes(j) && Math.abs(o.ring.indexOf(i) - o.ring.indexOf(j)) % 2 === 1; ink([pos[i], pos[j]], ring ? 3 : 1, 95000 + k++, 0.1, ring ? P.red : P.ink); });
  if (o.opp) for (let i = 0; i < 4; i++) { X.save(); X.setLineDash([3, 5]); ink([pos[RMS.indexOf(RMS[i])], pos[RMS.indexOf(OPP[RMS[i]])]], 1, 95100 + i, 0.05, '#9c968b'); X.restore(); }
  pos.forEach(([x, y], i) => { ball(x, y, 22, 95200 + i, null, 1.4, o.ring && o.ring.includes(i) ? '#efe3c2' : P.paper); mono(RMS[i], x, y + 3, 8, { col: P.ink }); });
  return { edges: E.length, pos };
}

/* ---------- places ---------- */
const FL = 620;
function apartment(lt, o = {}) {
  X.fillStyle = P.paper; X.fillRect(-600, -600, 2600, 2000); for (let y = -200; y < FL; y += 4) { X.fillStyle = 'rgba(28,24,20,.18)'; X.fillRect(-600, y, 2600, 0.6); }
  X.fillStyle = '#d9cfb4'; X.fillRect(-600, FL, 2600, 300); line([-600, FL], [2000, FL], 2.2, 96000, 0.2);
  shape(R(860, 150, 260, 220), { lw: 1.6, id: 96001, fill: SKY }); line([990, 150], [990, 370], 1.4, 96002, 0.1); // window onto the hills
  ink([[860, 330], [940, 290], [1010, 310], [1120, 270]], 1.2, 96003, 0.3);
  // the littered desk and the table
  shape(R(80, 420, 220, 14), { lw: 1.6, id: 96010, h: [0, 3, 0.5] }); for (let q = 0; q < 5; q++) shape(R(100 + q * 36, 390 - q * 3, 30, 30), { lw: 0.9, id: 96011 + q, fill: CARD });
  shape(R(400, 470, 440, 14), { lw: 1.8, id: 96020, h: [0, 3, 0.5] }); line([420, 484], [416, FL], 3, 96021, 0.1); line([820, 484], [824, FL], 3, 96022, 0.1);
  shape([[480, 470], [500, 470], [498, 400], [488, 380], [482, 400]], { lw: 1.2, id: 96030, fill: '#cfd8c8' }); // the gin bottle
  if (o.picks !== false) for (let q = 0; q < 12; q++) line([560 + q * 6, 466], [600 + q * 6, 462 - (q % 3)], 1, 96040 + q, 0.05, '#bfa87c');
}
/* the lot on the hill, by day */
function lot(lt, o = {}) {
  X.fillStyle = SKY; X.fillRect(-600, -600, 2600, 2000);
  for (let i = 0; i < 4; i++) ink([[-100, 360 + i * 20], [300, 320 + i * 25], [700, 350 + i * 18], [1400, 300 + i * 22]], 1, 96100 + i, 0.4, '#9c968b');
  shape([[-100, 560], [1400, 540], [1400, 900], [-100, 900]], { lw: 1.4, id: 96110, fill: '#c9c0a4', h: [0.1, 5, 0.4] });
  for (let q = 0; q < 9; q++) { const x = 120 + q * 130; ball(x, 548 - (q % 2) * 6, 18 + (q % 3) * 6, 96120 + q, PAT.f, 1, '#9c968b'); }
  shape(R(-100, 610, 1500, 70), { lw: 1.4, id: 96130, fill: '#6f6a61' }); line([-100, 645], [1400, 645], 1.2, 96131, 0.2, P.paper);
}
/* the house on its lot as cubes. stage: 'net' | 'folded' | 'none' | 'slab' */
function houseOnLot(lt, stage, o = {}) {
  const v = { yaw: o.yaw ?? -0.55, pitch: 0.2, f: o.f ?? 220, D: 14, cx: o.cx ?? 640, cy: o.cy ?? 470 };
  const shake = o.shake || 0; v.cx += Math.sin(lt * 53) * 6 * shake; v.cy += Math.cos(lt * 41) * 3 * shake;
  // foundation slab
  const s = [[-0.7, -0.5, -0.7], [0.7, -0.5, -0.7], [0.7, -0.5, 0.7], [-0.7, -0.5, 0.7]].map((p) => pj(p, v)); shape(s.map((q) => [q[0], q[1]]), { lw: 1.4, id: 96200, fill: '#9c968b' });
  if (stage === 'slab') return;
  if (stage === 'none') return;
  const list = stage === 'net' ? NET.map((c, i) => ({ ...c, fill: i === 0 ? '#e8dcc0' : P.paper, alpha: o.rise != null ? clamp(o.rise * 8 - i) : 1 })) : [{ p: [0, 0, 0], fill: '#e8dcc0', pattern: true }];
  cubes(list, v);
  if (stage === 'net' && o.fold) { // folding: the outer seven shrink toward the first along their joints
    const u = o.fold; const fl = NET.slice(1).map((c) => ({ p: c.p.map((x) => x * (1 - u)), s: 1 - 0.3 * u, fill: P.paper, alpha: 1 - u })); void fl; }
}
function interior(lt, o = {}) {
  X.fillStyle = '#efe7d2'; X.fillRect(-600, -600, 2600, 2000);
  for (let y = 100; y < FL; y += 6) { X.fillStyle = 'rgba(28,24,20,.08)'; X.fillRect(-600, y, 2600, 0.6); }
  line([-600, 96], [2000, 96], 1.4, 97000, 0.1); X.fillStyle = 'rgba(255,248,225,.6)'; X.fillRect(-600, 98, 2600, 8); // concealed lighting
  X.fillStyle = '#d9cfb4'; X.fillRect(-600, FL, 2600, 300); line([-600, FL], [2000, FL], 2.2, 97001, 0.2);
  if (o.label) mono(o.label, 640, 140, 11, { col: '#5d564b' });
  // a stair coming down from the ceiling
  if (o.stair) { const u = o.stair; X.save(); X.globalAlpha = u; const x0 = 820; line([x0, 100], [x0 + 200 * u, FL], 2.2, 97010, 0.05, '#c9c2b2'); line([x0 + 50, 100], [x0 + 50 + 200 * u, FL], 2.2, 97011, 0.05, '#c9c2b2'); for (let q = 0; q < 10; q++) { const t = q / 10; line([x0 + 200 * u * t, 100 + (FL - 100) * t], [x0 + 50 + 200 * u * t, 100 + (FL - 100) * t], 1.6, 97012 + q, 0.05, '#a9bccb'); } X.restore(); }
  if (o.window) { const [wx, wy, ww, wh] = o.window; shape(R(wx, wy, ww, wh), { lw: 1.8, id: 97030, fill: P.paper }); }
}
/* a line of rooms seen through windows: n frames nested toward a vanishing point; figures drawn by fig(level, x, y, s) */
function tunnel(cx, cy, n, fig, o = {}) {
  for (let k = 0; k <= n; k++) { const s = Math.pow(0.62, k), w = 1000 * s, h = 560 * s; X.fillStyle = k % 2 ? '#efe7d2' : '#e8dcc0'; X.fillRect(cx - w / 2, cy - h / 2, w, h);
    for (let y = cy - h / 2; y < cy + h / 2; y += 5) { X.fillStyle = 'rgba(28,24,20,.06)'; X.fillRect(cx - w / 2, y, w, 0.5); }
    X.fillStyle = '#d9cfb4'; X.fillRect(cx - w / 2, cy + h * 0.32, w, h * 0.18);
    X.strokeStyle = P.ink; X.lineWidth = 2 * s + 0.6; X.strokeRect(cx - w / 2, cy - h / 2, w, h);
    if (k > 0) { const ww = w * 0.38, wh = h * 0.6; X.strokeRect(cx - ww / 2, cy - wh / 2 + h * 0.02, ww, wh); }
  }
  if (fig) for (let k = n; k >= 0; k--) { const s = Math.pow(0.62, k), h = 560 * s; fig(k, cx, cy + h * 0.32, s); }
}
function studyRoom(lt, open, o = {}) {
  X.fillStyle = '#efe7d2'; X.fillRect(-600, -600, 2600, 2000); X.fillStyle = '#d9cfb4'; X.fillRect(-600, FL, 2600, 300); line([-600, FL], [2000, FL], 2.2, 97100, 0.2);
  const W4 = [[110, 160], [400, 160], [690, 160], [980, 160]], ww = 240, wh = 300;
  W4.forEach(([x, y], i) => { X.save(); path(R(x, y, ww, wh)); X.clip(); const u = open[i] || 0; view(i, x, y, ww, wh, lt); // blind
    X.fillStyle = '#d9cfb4'; X.fillRect(x, y, ww, wh * (1 - u)); for (let q = 0; q < wh * (1 - u); q += 10) line([x, y + q], [x + ww, y + q], 0.8, 97110 + i * 40 + q, 0.05); X.restore();
    shape(R(x - 6, y - 6, ww + 12, wh + 12), { lw: 2, id: 97200 + i, fill: null }); mono(String(i + 1), x + ww / 2, y + wh + 26, 11, { col: P.red }); });
}
function view(i, x, y, w, h, lt) {
  if (i === 0) { // down the face of a tower onto a city
    X.fillStyle = '#c9ccc4'; X.fillRect(x, y, w, h); X.fillStyle = '#9c968b'; X.beginPath(); X.moveTo(x, y); X.lineTo(x + w * 0.42, y); X.lineTo(x + w * 0.48, y + h); X.lineTo(x, y + h); X.fill();
    for (let q = 0; q < 14; q++) line([x + w * 0.05, y + q * 22], [x + w * 0.44, y + q * 22 + 2], 0.8, 97300 + q, 0.05);
    for (let a = 0; a < 9; a++) for (let b = 0; b < 6; b++) { const px = x + w * 0.55 + a * 12 + b * 3, py = y + h * 0.7 + b * 12; X.fillStyle = (a + b) % 3 ? '#6f6a61' : '#4b4137'; X.fillRect(px, py, 7, 7); }
    ink([[x + w * 0.5, y + h * 0.62], [x + w, y + h * 0.55]], 3, 97330, 0.3, '#a9bccb');
  } else if (i === 1) { // sea overhead, sky below
    X.fillStyle = '#dfe3dc'; X.fillRect(x, y, w, h); X.fillStyle = '#7d8d96'; X.fillRect(x, y, w, h * 0.5);
    for (let q = 0; q < 8; q++) ink(Array.from({ length: 10 }, (_, k) => [x + k * w / 9, y + 14 + q * 16 + Math.sin(k + q + lt * 2) * 4]), 1, 97400 + q, 0.2, '#dfe3dc');
    line([x, y + h * 0.5], [x + w, y + h * 0.5], 1.2, 97420, 0.05);
  } else if (i === 2) { // nothing: the page itself, no ink at all
    X.fillStyle = P.paper; X.fillRect(x, y, w, h);
  } else { // desert, yellow sky, twisted trees, a sun too bright
    X.fillStyle = LEMON; X.fillRect(x, y, w, h); X.fillStyle = SAND; X.fillRect(x, y + h * 0.62, w, h * 0.38);
    X.fillStyle = '#fffbe0'; X.beginPath(); X.arc(x + w * 0.7, y + h * 0.18, 22, 0, 6.283); X.fill(); X.globalAlpha = 0.3; X.beginPath(); X.arc(x + w * 0.7, y + h * 0.18, 44, 0, 6.283); X.fill(); X.globalAlpha = 1;
    for (const [tx, s] of [[0.25, 1], [0.6, 0.7], [0.85, 0.5]]) joshua(x + w * tx, y + h * 0.64, s * 0.8, 97500 + Math.round(tx * 100));
  }
}
function joshua(x, y, s, id) {
  const br = [[[0, 0], [2, -60], [-4, -110]], [[2, -60], [30, -90], [40, -130]], [[-4, -110], [-30, -140], [-36, -170]], [[-4, -110], [10, -150], [8, -180]], [[30, -90], [58, -100]]];
  br.forEach((b, k) => { ink(b.map(([a, c]) => [x + a * s, y + c * s]), 7 * s + 1, id + k, 0.3, '#5d4a34'); const [ex, ey] = b[b.length - 1]; for (let q = 0; q < 7; q++) { const a = q * 0.9; line([x + ex * s, y + ey * s], [x + (ex + Math.cos(a) * 12) * s, y + (ey + Math.sin(a) * 12 - 4) * s], 1.2, id + 20 + k * 8 + q, 0.05, '#6c7a4c'); } });
}
function desert(lt, o = {}) {
  X.fillStyle = LEMON; X.fillRect(-600, -600, 2600, 2000);
  X.fillStyle = '#fffbe0'; X.beginPath(); X.arc(1000, 140, 50, 0, 6.283); X.fill(); X.globalAlpha = 0.25; X.beginPath(); X.arc(1000, 140, 110, 0, 6.283); X.fill(); X.globalAlpha = 1;
  shape([[-100, 470], [1400, 450], [1400, 900], [-100, 900]], { lw: 1.4, id: 97600, fill: SAND, h: [0.05, 6, 0.4] });
  for (const [x, s] of [[150, 1.1], [420, 0.7], [800, 1.3], [1150, 0.8]]) joshua(x, 470 + (s - 1) * 60 + 60, s, 97700 + x);
  if (o.road) { shape([[-100, 640], [1400, 600], [1400, 660], [-100, 710]], { lw: 1.2, id: 97800, fill: '#9c968b' }); }
  if (o.truck != null) { const tx = o.truck; shape(R(tx, 540, 220, 70), { lw: 1.6, id: 97810, fill: '#6f6a61', h: [0, 4, 0.4] }); shape(R(tx + 150, 500, 70, 50), { lw: 1.4, id: 97811, fill: '#6f6a61' }); for (const wx of [tx + 40, tx + 180]) ball(wx, 612, 20, 97812 + wx, PAT.d, 1.2, P.ink); }
}

/* ================= shots ================= */
SHOTS.title = (lt, sd, sh) => {
  const sp = cue(sh, 'spin'), nm = cue(sh, 'name');
  X.fillStyle = P.paper; X.fillRect(-600, -600, 2600, 2000);
  tesseract(640, 360, 120, { xw: lt * 0.5, yz: 0.4, xz: 0.5 + lt * 0.1 }, { edges: Math.floor(32 * U(lt, sp.at, sp.at + 4)), verts: Math.floor(16 * U(lt, sp.at, sp.at + 2)) });
  if (lt > nm.at) { X.globalAlpha = U(lt, nm.at, nm.at + 1); shape(R(280, 290, 720, 120), { lw: 1.6, id: 98000, fill: P.paper }); txt('AND HE BUILT A CROOKED HOUSE', 640, 336, 34, {}); txt('after Robert A. Heinlein', 640, 378, 17, { italic: true }); X.globalAlpha = 1; }
};
SHOTS.what = (lt, sd, sh) => {
  const L = sh.lines;
  let c = camFor(lt, [[0, ON(640, 380, 1.0)], [L[1].t0, ON(620, 400, 1.2), 1.4]]);
  { const [hx, hy] = headPos({ kind: 'T', x: 520, y: FL, s: 1.35, f: 1 }); c = withTight(sh, lt, c, hx, hy + 30, 2.6); }
  cam(c, () => { apartment(lt, { picks: false });
    human({ kind: 'T', x: 520, y: FL, s: 1.35, f: 1, hn: sayAt(sh, 'T', lt) > 0.1 ? [60, -200 + Math.sin(lt * 6) * 20] : [20, -96], mouth: sayAt(sh, 'T', lt), look: 0.4, id: 98100 });
    human({ kind: 'H', x: 760, y: FL, s: 1.3, f: -1, pose: 'sit', hn: [40, -110], mouth: sayAt(sh, 'H', lt), id: 98200 });
    shape(R(740, 520, 70, 10), { lw: 1.2, id: 98210, fill: '#cfc2a0' }); });
};
SHOTS.model = (lt, sd, sh) => {
  const L = sh.lines, Q = (k) => cue(sh, k).at;
  let c = camFor(lt, [[0, ON(640, 400, 1.0)], [Q('square'), ON(620, 380, 1.0), 1.0]]); c = withTight(sh, lt, c, 640, 360, 1.25);
  cam(c, () => {
    X.fillStyle = '#e8dcc0'; X.fillRect(-600, -600, 2600, 2000); for (let y = -100; y < 900; y += 7) { X.fillStyle = 'rgba(28,24,20,.07)'; X.fillRect(-600, y, 2600, 1); } // the tabletop
    const v = { yaw: -0.5 + lt * 0.03, pitch: 0.35, f: 900, D: 9, cx: 640, cy: 380 };
    if (lt < Q('join')) { // a square, then a cube, in toothpicks
      const sq = lt < Q('cube'); const P8 = [[-1, -1, -1], [1, -1, -1], [1, 1, -1], [-1, 1, -1], [-1, -1, 1], [1, -1, 1], [1, 1, 1], [-1, 1, 1]];
      const ed = sq ? [[0, 1], [1, 2], [2, 3], [3, 0]] : [[0, 1], [1, 2], [2, 3], [3, 0], [4, 5], [5, 6], [6, 7], [7, 4], [0, 4], [1, 5], [2, 6], [3, 7]];
      const u = sq ? U(lt, Q('square'), Q('square') + 1.2) : U(lt, Q('cube'), Q('cube') + 1.6); const n = Math.ceil(ed.length * u);
      ed.slice(0, n).forEach(([a, b], k) => { const A = pj(P8[a], v), B = pj(P8[b], v); ink([[A[0], A[1]], [B[0], B[1]]], 2.4, 98300 + k, 0.1, '#bfa87c'); });
      (sq ? P8.slice(0, 4) : P8).forEach((p, k) => { const A = pj(p, v); ball(A[0], A[1], 6, 98330 + k, null, 1, CLAY); });
      mono(sq ? 'SQUARE: 4 CORNERS, 4 EDGES' : 'CUBE: 8 CORNERS, 12 EDGES, 6 SQUARES', 640, 640, 13, { col: P.ink });
    } else {
      const t = lt - Q('join'), spin = lt > Q('turn') ? (lt - Q('turn')) * 0.6 : 0;
      tesseract(640, 370, 110, { xw: Math.min(0.42, t * 0.12) + spin, yz: 0.35, xz: 0.5 }, { clay: true, col: '#7a5c3c', hl: lt > Q('turn') ? [[3, 1], [3, -1]] : null });
      if (lt > Q('count')) { const rows = [['CORNERS', 16], ['EDGES', 32], ['SQUARE FACES', 24], ['CUBES', 8]]; rows.forEach(([s, n], i) => { const u = U(lt, Q('count') + i * 1.1, Q('count') + i * 1.1 + 0.5); if (u <= 0) return; X.globalAlpha = u; mono(s, 160, 230 + i * 40, 13, { col: P.ink, align: 'left' }); txt(String(n), 380, 230 + i * 40, 22, { mono: true, col: P.red, align: 'right' }); X.globalAlpha = 1; }); }
      if (lt > Q('turn')) mono('THE TWO RED CUBES ARE THE ONES HE BUILT. THE SIX BETWEEN THEM SLANT.', 640, 650, 11, { col: P.red });
    }
  });
};
SHOTS.unfold = (lt, sd, sh) => {
  const L = sh.lines, op = cue(sh, 'open'), rm = cue(sh, 'rooms'), bd = cue(sh, 'build');
  const u = E.io(U(lt, op.at, op.to));
  if (lt < bd.at) {
    const v = { yaw: -0.6 + lt * 0.04, pitch: 0.32, f: 1150, D: 12, cx: 640, cy: 560 };
    let c = camFor(lt, [[0, ON(640, 380, 1.0)], [rm.at, ON(640, 330, 1.05), 1.2]]); c = withTight(sh, lt, c, 640, 300, 1.3);
    cam(c, () => { X.fillStyle = P.paper; X.fillRect(-600, -600, 2600, 2000);
      // cubes slide out of a stack into the cross
      const list = NET.map((cb, i) => { const from = [0, Math.min(1, i === 0 ? 0 : 1), 0]; return { ...cb, p: cb.p.map((x, k) => lerp(from[k], x, u)), fill: i === 0 ? '#e8dcc0' : P.paper, label: lt > rm.at ? cb.label : '' }; });
      cubes(list, v, { labels: lt > rm.at });
      mono('THE TESSERACT UNFOLDED: 8 CUBES', 640, 660, 12, { col: P.ink }); });
    return;
  }
  let c = camFor(lt - bd.at, [[0, ON(640, 380, 1.0)], [3, ON(640, 360, 1.1), 5]]); c = withTight(sh, lt, c, 640, 300, 1.3);
  cam(c, () => { lot(lt); houseOnLot(lt, 'net', { f: 1500, yaw: -0.55 + Math.sin(lt * 0.3) * 0.1, cy: 540 });
    human({ kind: 'T', x: 360, y: 600, s: 0.5, f: 1, hn: [50, -170], mouth: sayAt(sh, 'T', lt), id: 98400 }); human({ kind: 'H', x: 300, y: 604, s: 0.5, f: 1, mouth: sayAt(sh, 'H', lt), id: 98500 }); });
};
SHOTS.build = (lt, sd, sh) => {
  const L = sh.lines, ri = cue(sh, 'rise'), qk = cue(sh, 'quake'), ar = cue(sh, 'arrive');
  if (lt < ar.at) {
    const night = lt > qk.at - 1.5, shake = lt > qk.at && lt < qk.to ? 1 - U(lt, qk.to - 1, qk.to) : 0, fold = U(lt, qk.at + 0.5, qk.to);
    cam(camFor(lt, [[0, ON(640, 400, 1.0)], [qk.at - 1, ON(640, 380, 1.1), 1.0]]), () => { lot(lt); if (night) darken(0.65);
      if (fold < 1) { const v = { yaw: -0.55, pitch: 0.2, f: 1500, D: 14, cx: 640 + Math.sin(lt * 53) * 6 * shake, cy: 540 + Math.cos(lt * 41) * 3 * shake };
        const list = NET.map((cb, i) => ({ ...cb, p: i === 0 ? cb.p : cb.p.map((x) => x * (1 - E.io(fold))), s: i === 0 ? 1 : 1 - 0.4 * E.io(fold), fill: i === 0 ? '#e8dcc0' : P.paper, alpha: i === 0 ? 1 : (lt > ri.at ? clamp(U(lt, ri.at, ri.to) * 8 - i) : 0) * (1 - U(fold, 0.6, 1)) }));
        const s = [[-0.7, -0.5, -0.7], [0.7, -0.5, -0.7], [0.7, -0.5, 0.7], [-0.7, -0.5, 0.7]].map((p) => pj(p, v)); shape(s.map((q) => [q[0], q[1]]), { lw: 1.4, id: 96200, fill: '#9c968b' }); cubes(list, v);
        if (fold > 0) { X.save(); X.globalAlpha = Math.sin(Math.PI * fold) * 0.8; tesseract(640, 360, 70, { xw: fold * 2, yz: 0.3, xz: 0.5 }, { col: '#efe3c2', balls: false }); X.restore(); } }
      else houseOnLot(lt, 'folded', { f: 1500, cy: 540 });
      if (night) { X.fillStyle = P.paper; X.globalAlpha = 0.9; X.fillRect(PX0 + 10, PY0 + 10, 90, 30); X.globalAlpha = 1; txt('02:00', PX0 + 55, PY0 + 26, 16, { mono: true, col: P.red }); } });
    return;
  }
  let c = camFor(lt - ar.at, [[0, ON(640, 400, 1.0)], [3, ON(600, 440, 1.2), 4]]); c = withTight(sh, lt, c, 520, 470, 1.8);
  cam(c, () => { lot(lt); houseOnLot(lt, 'folded', { f: 2000, cy: 500, cx: 800 });
    human({ kind: 'T', x: 380, y: 640, s: 0.9, f: 1, pose: lt > L[3].t0 ? 'walk' : 'stand', ph: lt * 9, hn: lt > L[3].t0 ? [30, -190] : undefined, hf: lt > L[3].t0 ? [-20, -190] : undefined, mouth: sayAt(sh, 'T', lt), id: 98600 });
    human({ kind: 'H', x: 250, y: 646, s: 0.9, f: 1, id: 98700 }); human({ kind: 'M', x: 170, y: 646, s: 0.85, f: 1, id: 98800 }); });
};
SHOTS.inside = (lt, sd, sh) => {
  const L = sh.lines, st = cue(sh, 'stair'), lp = cue(sh, 'loop'), gr = cue(sh, 'graph'), rg = cue(sh, 'ring'), dr = cue(sh, 'door');
  if (lt < gr.at) {
    const ROOMSEQ = ['GROUND FLOOR', 'MIDDLE ROOM, SECOND FLOOR', 'BEDROOM', 'STUDY', 'GROUND FLOOR'];
    const k = lt < lp.at ? (lt < st.at + 3 ? 0 : 1) : Math.min(4, 1 + Math.floor(U(lt, lp.at, lp.to) * 4));
    const climb = lt < lp.at ? U(lt, st.at + 1.5, st.at + 3.5) : (U(lt, lp.at, lp.to) * 4) % 1;
    cam(camFor(lt, [[0, ON(640, 380, 1.0)]]), () => { interior(lt, { label: ROOMSEQ[k], stair: lt > st.at ? U(lt, st.at, st.at + 1.2) : 0 });
      const up = E.io(clamp(climb * 1.4)); const x0 = 700, gone = climb > 0.75;
      [['T', 0], ['H', 70], ['M', 130]].forEach(([kd, dx]) => human({ kind: kd, x: lerp(x0 - dx, 960 - dx * 0.4, up), y: lerp(FL, FL - 380, up), s: kd === 'M' ? 1.1 : 1.15, f: 1, pose: climb > 0.05 && !gone ? 'walk' : 'stand', ph: lt * 8, alpha: gone ? 0 : 1, id: 98900 + dx }));
      // a strip of the rooms passed, in order
      ROOMSEQ.slice(0, k + 1).forEach((r, i) => { mono(r, 120, 200 + i * 22, 9, { col: i === k ? P.red : '#5d564b', align: 'left' }); }); });
    return;
  }
  let c = camFor(lt, [[gr.at, ON(640, 360, 1.0)]]); c = withTight(sh, lt, c, 640, 380, 1.0);
  if (lt < dr.at) {
    cam(c, () => { X.fillStyle = P.paper; X.fillRect(-600, -600, 2600, 2000);
      const ring = lt > rg.at ? [0, 1, 2, 3].map((i) => RMS.indexOf(['GROUND', 'KITCHEN', 'BEDROOM', 'DINING'][i])) : null;
      const g = roomGraph(640, 360, 240, U(lt, gr.at, gr.at + 3), { opp: lt > gr.at + 3.5, ring });
      mono(`8 ROOMS   ${g.edges} PAIRS THAT TOUCH   4 PAIRS THAT NEVER DO`, 640, 660, 12, { col: P.ink });
      if (ring) mono('STRAIGHT ON: GROUND, KITCHEN, BEDROOM, DINING, AND GROUND AGAIN', 640, 50, 11, { col: P.red }); });
    return;
  }
  cam(camFor(lt - dr.at, [[0, ON(640, 380, 1.0)], [2, ON(700, 400, 1.15), 3]]), () => { interior(lt, { label: 'LOUNGE, SECOND FLOOR' });
    shape(R(160, 220, 180, FL - 220), { lw: 2, id: 99000, fill: '#7a5c3c', h: [Math.PI / 2, 5, 0.4] });
    const u = U(lt, dr.at + 0.3, dr.at + 2.2); human({ kind: 'H', x: lerp(260, 560, u), y: FL, s: 1.2, f: 1, pose: u > 0 && u < 1 ? 'walk' : 'stand', ph: lt * 8, look: u >= 1 ? -1 : 0, id: 99100 }); human({ kind: 'M', x: lerp(200, 480, u), y: FL, s: 1.1, f: 1, pose: u > 0 && u < 1 ? 'walk' : 'stand', ph: lt * 8 + 1, id: 99200 }); });
};
SHOTS.window = (lt, sd, sh) => {
  const L = sh.lines, fa = cue(sh, 'fall'), ch = cue(sh, 'chase'), ht = cue(sh, 'hat'), th = cue(sh, 'three');
  if (lt < L[2].t0) {
    if (lt < fa.at) { cam(camFor(lt, [[0, ON(640, 380, 1.0)]]), () => { interior(lt, { label: 'LOUNGE', window: [700, 200, 300, 330] }); X.save(); path(R(700, 200, 300, 330)); X.clip(); X.translate(700, 200); X.scale(300 / 1280, 330 / 720); interior(lt, { label: 'DINING ROOM' }); X.restore(); human({ kind: 'T', x: 560, y: FL, s: 1.25, f: 1, hn: [60, -120], id: 99300 }); }); return; }
    const u = U(lt, fa.at, fa.at + 1.6);
    cam(camFor(lt - fa.at, [[0, ON(640, 400, 1.0)]]), () => { lot(lt); houseOnLot(lt, 'folded', { f: 2000, cx: 800, cy: 500 }); ball(480, 600, 34, 99400, PAT.f, 1.2, '#6c7a4c'); for (let q = 0; q < 6; q++) ball(460 + q * 9, 584 + (q % 2) * 8, 5, 99401 + q, null, 0.8, P.red);
      human({ kind: 'T', x: 480, y: lerp(300, 610, E.in(clamp(u))), s: 1.0, f: 1, pose: u < 1 ? 'crawl' : 'stand', id: 99500 }); });
    return;
  }
  const chase = lt < ht.at, k = chase ? (U(lt, ch.at, ch.to) * 4) : 0;
  let c = camFor(lt - L[2].t0, [[0, ON(640, 360, 1.0)]]); c = withTight(sh, lt, c, 640, 360, 1.6);
  cam(c, () => { X.fillStyle = P.paper; X.fillRect(-600, -600, 2600, 2000);
    tunnel(640, 360, 4, (lev, x, y, s) => {
      if (lt < th.at) { if (lev === 0 && lt > ht.at) human({ kind: 'T', x: x + 60 * s, y, s: 1.2 * s, f: -1, hn: [50, -150], hf: [40, -150], id: 99600 + lev });
        else if (lev === 0) human({ kind: 'T', x: x - 100 * s + (k % 1) * 200 * s, y, s: 1.2 * s, f: 1, pose: 'walk', ph: lt * 10, id: 99600 }); else if (lev === 4 && lt > ch.at) human({ kind: 'T', x: x + (k % 1) * 100 * s, y, s: 1.2 * s, f: 1, pose: 'walk', ph: lt * 10, id: 99610 }); }
      else { const wave = Math.sin(lt * 8) * 40; [['T', -40], ['H', 40], ['M', 100]].forEach(([kd, dx]) => human({ kind: kd, x: x + dx * s, y, s: 1.1 * s, f: lev === 0 ? -1 : 1, hn: kd === 'T' ? [40, -200 + (lev === 0 ? wave : wave)] : undefined, hf: kd === 'T' ? [-30, -200 - wave] : undefined, noCigar: lev > 0, id: 99700 + lev * 10 + dx })); }
    });
    if (lt > ht.at && lt < th.at) { shape(R(560, 560, 160, 70), { lw: 1.4, id: 99800, fill: CARD }); mono('Q. T.', 640, 600, 20, { col: P.red }); }
    mono('FOUR ROOMS AWAY', 640, 60, 11, { col: P.red });
  });
};
SHOTS.study = (lt, sd, sh) => {
  const Q = (k) => cue(sh, k).at, L = sh.lines;
  const open = [U(lt, Q('w1'), Q('w1') + 1.2), U(lt, Q('w2'), Q('w2') + 1.2), U(lt, Q('w3'), Q('w3') + 2.4), U(lt, Q('w4'), Q('w4') + 1.2)];
  if (lt > Q('w2') + 4) open[1] = Math.max(0, 1 - U(lt, Q('w2') + 4, Q('w2') + 5));
  if (lt > Q('w3') + 7) open[2] = Math.max(0, 1 - U(lt, Q('w3') + 7, Q('w3') + 8));
  const focus = lt < Q('w1') ? null : lt < Q('w2') ? 0 : lt < Q('w3') ? 1 : lt < Q('w4') ? 2 : 3;
  const cx = focus == null ? 640 : [230, 520, 810, 1100][focus];
  let c = camFor(lt, [[0, ON(640, 380, 1.0)], [Q('w1'), ON(cx, 330, 1.9), 1.0], [Q('w2'), ON(520, 330, 1.9), 1.0], [Q('w3'), ON(810, 330, 1.9), 1.0], [Q('w4'), ON(1100, 330, 1.9), 1.0]]);
  c = withTight(sh, lt, c, 810, 310, 2.2);
  cam(c, () => { studyRoom(lt, open); });
};
SHOTS.quake = (lt, sd, sh) => {
  const L = sh.lines, rl = cue(sh, 'roll'), ld = cue(sh, 'land'), rd = cue(sh, 'road');
  if (lt < ld.at) { const sh_ = lt > rl.at ? 1 : 0;
    cam({ ...ON(1100, 330, 1.6), x: 1100 + Math.sin(lt * 47) * 10 * sh_, y: 330 + Math.cos(lt * 37) * 6 * sh_ }, () => { studyRoom(lt, [0, 0, 0, 1]); if (lt > rl.to - 0.4) human({ kind: 'M', x: lerp(1000, 1100, U(lt, rl.to - 0.4, ld.at)), y: lerp(FL, 330, U(lt, rl.to - 0.4, ld.at)), s: 1.0, f: 1, pose: 'crawl', id: 99900 }); }); return; }
  const wu = U(lt, rd.at - 6, rd.at);
  let c = camFor(lt - ld.at, [[0, ON(640, 420, 1.15)], [4, ON(640, 380, 1.0), 4]]); c = withTight(sh, lt, c, 640, 420, 1.3);
  cam(c, () => { desert(lt, { road: lt > rd.at, truck: lt > L[5].t0 - 1.5 ? lerp(1300, 760, E.out(U(lt, L[5].t0 - 1.5, L[5].t0))) : null });
    const y = lt > rd.at ? 640 : 600; const x0 = lerp(400, 560, wu);
    human({ kind: 'T', x: x0 + 120, y, s: 0.9, f: 1, pose: wu > 0 && wu < 1 ? 'walk' : lt < L[2].t1 + 1 && lt > ld.at + 0.3 ? 'stand' : 'stand', ph: lt * 7, id: 100000 });
    human({ kind: 'H', x: x0, y, s: 0.9, f: 1, pose: wu > 0 && wu < 1 ? 'walk' : 'stand', ph: lt * 7 + 1, mouth: sayAt(sh, 'H', lt), look: lt < L[3].t0 ? Math.sin(lt * 2) : 0, id: 100100 });
    human({ kind: 'M', x: x0 - 80, y, s: 0.85, f: 1, pose: wu > 0 && wu < 1 ? 'walk' : 'stand', ph: lt * 7 + 2, id: 100200 });
    if (lt > L[5].t0 - 0.2) human({ kind: 'K', x: 930, y: 540, s: 0.6, f: -1, pose: 'sit', mouth: sayAt(sh, 'F', lt), id: 100300 }); });
};
SHOTS.gone = (lt, sd, sh) => {
  const L = sh.lines, id_ = cue(sh, 'idea'), dk = cue(sh, 'duck');
  let c = camFor(lt, [[0, ON(640, 400, 1.0)], [id_.at, ON(560, 440, 1.3), 1.0]]); c = withTight(sh, lt, c, 520, 440, 1.6);
  const throwU = U(lt, dk.at, dk.at + 0.7), duck = lt > dk.at + 0.2 ? Math.sin(Math.PI * U(lt, dk.at + 0.2, dk.at + 1.0)) : 0;
  cam(c, () => { lot(lt); houseOnLot(lt, 'slab', { f: 2000, cx: 800, cy: 500 });
    human({ kind: 'T', x: 500, y: 640, s: 1.0, f: 1, pose: duck > 0.3 ? 'kneel2' : 'stand', hn: lt > id_.at && duck < 0.3 ? [50, -190] : undefined, mouth: sayAt(sh, 'T', lt), id: 100400 });
    human({ kind: 'H', x: 360, y: 646, s: 1.0, f: 1, hn: lt > dk.at - 0.3 && lt < dk.at + 0.3 ? [-20, -190] : lt > dk.at ? [80, -150] : undefined, mouth: sayAt(sh, 'H', lt), id: 100500 });
    human({ kind: 'M', x: 260, y: 646, s: 0.95, f: 1, id: 100600 });
    if (throwU > 0 && throwU < 1) { const x = lerp(440, 700, throwU), y = 470 - Math.sin(Math.PI * throwU) * 60 + throwU * 60; shape(rock(x, y, 10, 100700, 7), { lw: 1.2, id: 100700, fill: '#9c968b' }); } });
};
SHOTS.end = (lt, sd, sh) => {
  X.fillStyle = P.paper; X.fillRect(-600, -600, 2600, 2000); tesseract(640, 360, 150, { xw: lt * 0.4, yz: 0.4, xz: 0.5 }, { col: '#c9c2b2', balls: false });
  X.globalAlpha = seg(lt, 1.0, 2.2);
  shape(R(220, 260, 840, 200), { lw: 1.6, id: 101000, fill: P.paper });
  txt('AND HE BUILT A CROOKED HOUSE', 640, 300, 28, {});
  txt('after Robert A. Heinlein, “—And He Built a Crooked House”, Astounding Science Fiction, February 1941.', 640, 346, 14, { italic: true });
  txt('The tesseract is drawn from its sixteen corners, rotated in four dimensions and projected to the page.', 640, 376, 14, { italic: true });
  txt('Nothing is quoted from Heinlein.', 640, 406, 14, { italic: true });
  X.globalAlpha = 1; void sh; void sd;
};
