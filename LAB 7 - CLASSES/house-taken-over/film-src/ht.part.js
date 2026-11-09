
/* ================= House Taken Over ================= */
const NIGHT = '#221d18', WIGRED = P.red, WOOL = '#8f8a80', OAK = '#7a5c3c';
KIT = { ...KIT, Y: { lw: 12, coat: 'shirt' }, E: { lw: 11, coat: 'dress' } };
// the brother: parted hair and a moustache; Irene: hair pinned up
HEADX.Y = (o, x, y, r, id) => { X.save(); circ(x, y, r, id); X.clip(); X.fillStyle = PAT.d; X.fillRect(x - r - 2, y - r - 2, r * 2.2, r * 0.75); X.restore(); line([x + 6, y + 5], [x + 13, y + 5], 2.2, id + 60, 0.05); };
HEADX.E = (o, x, y, r, id) => { X.save(); circ(x, y, r, id); X.clip(); X.fillStyle = PAT.m; X.fillRect(x - r - 2, y - r - 2, r * 1.6, r * 1.0); X.restore(); ball(x - r + 1, y - r * 0.6, 8, id + 61, PAT.m, 1.2); };

/* ---------- the plan, read as a graph ---------- */
// rooms: [key, label, x0, y0, x1, y1, side]
const ROOMS = [
  ['VES', 'VESTIBULE', 120, 300, 230, 420, 'F'], ['HALL', 'LIVING ROOM', 230, 260, 470, 460, 'F'], ['MINE', 'MY ROOM', 230, 120, 470, 260, 'F'], ['IRE', "IRENE'S ROOM", 230, 460, 470, 600, 'F'],
  ['COR', 'CORRIDOR', 470, 330, 650, 390, 'F'], ['PAS', 'PASSAGE', 590, 200, 640, 330, 'F'], ['KIT', 'KITCHEN', 640, 130, 790, 290, 'F'], ['BATH', 'BATH', 480, 140, 590, 240, 'F'],
  ['BPS', '', 650, 300, 800, 420, 'B'], ['DIN', 'DINING ROOM', 800, 120, 950, 330, 'B'], ['TAP', 'TAPESTRIES', 950, 120, 1100, 330, 'B'], ['LIB', 'LIBRARY', 1100, 120, 1240, 330, 'B'],
  ['BA', 'BEDROOM', 800, 390, 950, 600, 'B'], ['BB', 'BEDROOM', 950, 390, 1100, 600, 'B'], ['BC', 'BEDROOM', 1100, 390, 1240, 600, 'B'], ['SP', '', 800, 330, 1240, 390, 'B'],
];
// doors: [a, b, x, y, vertical, name]
const DOORS = [
  ['STREET', 'VES', 120, 360, 1, 'front'], ['VES', 'HALL', 230, 360, 1, 'gate'], ['HALL', 'MINE', 350, 260, 0, ''], ['HALL', 'IRE', 350, 460, 0, ''], ['HALL', 'COR', 470, 360, 1, ''],
  ['COR', 'PAS', 615, 330, 0, ''], ['PAS', 'KIT', 640, 230, 1, ''], ['PAS', 'BATH', 590, 220, 1, ''], ['COR', 'BPS', 650, 360, 1, 'oak'],
  ['BPS', 'SP', 800, 360, 1, ''], ['SP', 'DIN', 875, 330, 0, ''], ['SP', 'TAP', 1025, 330, 0, ''], ['SP', 'LIB', 1170, 330, 0, ''], ['SP', 'BA', 875, 390, 0, ''], ['SP', 'BB', 1025, 390, 0, ''], ['SP', 'BC', 1170, 390, 0, ''], ['DIN', 'TAP', 950, 225, 1, ''],
];
const RIX = Object.fromEntries(ROOMS.map((r, i) => [r[0], i]));
const ctr = (k) => { if (k === 'STREET') return [70, 360]; const r = ROOMS[RIX[k]]; return [(r[2] + r[4]) / 2, (r[3] + r[5]) / 2]; };
/* breadth-first search from a room, never through a shut door; returns depth by room key */
function reach(from, shut, lost = new Set()) {
  const dep = { [from]: 0 }, q = [from];
  while (q.length) { const a = q.shift(); for (const d of DOORS) { if (shut.has(d[5]) && d[5]) continue; const b = d[0] === a ? d[1] : d[1] === a ? d[0] : null; if (!b || b === 'STREET' || lost.has(b) || b in dep) continue; dep[b] = dep[a] + 1; q.push(b); } }
  return dep;
}
const NROOMS = 15; // SP and BPS together count as the back passage
const countOf = (dep) => Object.keys(dep).filter((k) => k !== 'SP').length;
/* draw the plan. o: { u: ink 0..1, shut: Set of door names, lost: Set of room keys, wave: {from, t}, graph: 0..1, labels, hl: Set } */
function plan(lt, o = {}) {
  const u = o.u ?? 1, shut = o.shut || new Set(), lost = o.lost || new Set();
  X.fillStyle = '#d9cfb4'; X.fillRect(-600, -600, 2600, 2000);
  shape(R(40, 70, 1220, 580), { lw: 1.4, id: 80000, fill: CARD });
  // the street edge
  if (u > 0.05) { line([110, 90], [110, 630], 2, 80001, 0.2); mono('STREET', 76, 110, 9, { col: P.ink }); ball(80, 600, 10, 80002, null, 1.2, P.paper); for (let q = -2; q <= 2; q++) line([72, 600 + q * 3], [88, 600 + q * 3], 0.8, 80003 + q, 0.05); }
  ROOMS.forEach((r, i) => {
    const v = clamp(u * ROOMS.length - i); if (v <= 0) return; const [k, lab, x0, y0, x1, y1] = r; X.globalAlpha = v;
    const theirs = lost.has(k), lit = o.hl && o.hl.has(k);
    shape(R(x0, y0, x1 - x0, y1 - y0), { lw: 2.2, id: 80100 + i, fill: theirs ? '#4b4137' : lit ? '#efe3c2' : P.paper, h: theirs ? [[0.8, 3, 0.5], [-0.8, 3, 0.5]] : undefined });
    if (k === 'VES') for (let a = x0; a < x1; a += 14) for (let b = y0; b < y1; b += 14) if (((a - x0) / 14 + (b - y0) / 14) % 2 < 1) { X.fillStyle = theirs ? 'rgba(235,227,207,.1)' : 'rgba(28,24,20,.12)'; X.fillRect(a, b, 14, 14); }
    if (lab && (o.labels ?? true)) mono(lab, (x0 + x1) / 2, (y0 + y1) / 2 + (k === 'COR' ? -16 : 0), 9.4, { col: theirs ? '#b8ae98' : P.ink });
    X.globalAlpha = 1;
  });
  // doors
  DOORS.forEach((d, i) => {
    const v = clamp(u * 1.4 - 0.4); if (v <= 0) return; const [a, b, x, y, vert, nm] = d; const isShut = shut.has(nm) && nm; X.globalAlpha = v;
    const w = nm === 'oak' ? 40 : 28;
    X.fillStyle = P.paper; if (vert) X.fillRect(x - 3, y - w / 2, 6, w); else X.fillRect(x - w / 2, y - 3, w, 6);
    if (nm === 'gate') { for (let q = 0; q < 5; q++) line([x - 3, y - 12 + q * 6], [x + 3, y - 12 + q * 6], 1, 80300 + q, 0.05); if (isShut) line([x, y - 14], [x, y + 14], 3, 80310, 0.05); }
    else if (isShut) shape(R(vert ? x - 4 : x - w / 2, vert ? y - w / 2 : y - 4, vert ? 8 : w, vert ? w : 8), { lw: 1.2, id: 80320 + i, fill: nm === 'oak' ? OAK : P.ink });
    else { X.save(); X.setLineDash([2, 3]); X.beginPath(); if (vert) X.arc(x, y - w / 2, w, Math.PI / 2 - 0.0, Math.PI / 2 + (nm === 'oak' ? -0.8 : 0.6), nm === 'oak'); else X.arc(x - w / 2, y, w, 0, -0.9, true); X.lineWidth = 0.8; X.strokeStyle = P.ink; X.stroke(); X.restore(); }
    if (nm === 'oak') mono('OAK', x, y - 30, 8, { col: OAK });
    X.globalAlpha = 1;
  });
  // the graph over the plan
  const g = o.graph || 0;
  if (g > 0) {
    const dep = o.wave ? reach(o.wave.from, shut, lost) : null; const tw = o.wave ? (lt - o.wave.t) / 0.32 : 99;
    X.globalAlpha = g;
    DOORS.forEach((d, i) => { if (d[0] === 'STREET') return; const [a, b] = d; const s = shut.has(d[5]) && d[5]; const pa = ctr(a), pb = ctr(b); const da = dep ? dep[a] : 0, db = dep ? dep[b] : 0; const on = !s && dep && da !== undefined && db !== undefined && Math.max(da, db) <= tw;
      X.save(); if (s) X.setLineDash([4, 4]); ink([pa, [d[2], d[3]], pb], on ? 2.2 : 1.1, 80400 + i, 0.1, s ? '#9c968b' : on ? P.red : P.ink); X.restore(); });
    ROOMS.forEach((r, i) => { if (r[0] === 'SP') return; const [cx, cy] = ctr(r[0]); const d = dep ? dep[r[0]] : undefined; const on = d !== undefined && d <= tw; ball(cx, cy + 14, on ? 7 : 5, 80500 + i, null, 1.2, on ? P.red : lost.has(r[0]) ? '#6f6a61' : P.paper); });
    X.globalAlpha = 1;
    if (o.count !== undefined) { shape(R(70, 632, 360, 0), { lw: 0 }); }
  }
}
function planCounter(n, x = 1240, y = 664, label = 'ROOMS THAT ARE OURS') { mono(label, x - 200, y, 10, { col: P.ink, align: 'right' }); txt(String(n), x, y, 26, { mono: true, col: P.red, align: 'right' }); }
/* the plan as a small inset in the top-right corner, in screen space */
function inset(lt, o) { X.save(); X.beginPath(); X.rect(PX1 - 360, PY0 + 12, 330, 157); X.clip(); X.translate(PX1 - 360, PY0 + 12); X.scale(0.27, 0.27); X.translate(-40, -70); plan(lt, { ...o, labels: false }); X.restore(); X.strokeStyle = P.ink; X.lineWidth = 1; X.strokeRect(PX1 - 360, PY0 + 12, 330, 157); }

/* ---------- rooms in elevation ---------- */
const FLR = 620;
function wallRoom(o = {}) {
  X.fillStyle = P.paper; X.fillRect(-600, -600, 2600, 2000);
  for (let y = -200; y < FLR; y += 4) { X.fillStyle = 'rgba(28,24,20,' + (o.dark ? 0.34 : 0.2) + ')'; X.fillRect(-600, y, 2600, 0.6); }
  // wainscot and floorboards
  line([-600, FLR - 90], [2000, FLR - 90], 1.4, 81000, 0.2); for (let x = -600; x < 2000; x += 60) line([x, FLR - 90], [x, FLR], 0.6, 81001 + x, 0.05);
  X.fillStyle = '#d9cfb4'; X.fillRect(-600, FLR, 2600, 300); for (let y = FLR + 12; y < FLR + 200; y += 14) line([-600, y], [2000, y], 0.6, 81100 + y, 0.05);
  line([-600, FLR], [2000, FLR], 2.2, 81002, 0.2);
  if (o.dark) darken(o.dark);
}
function ireneRoom(lt, o = {}) {
  wallRoom({ dark: o.dark });
  // window with a curtain, a lamp
  shape(R(140, 200, 160, 220), { lw: 1.6, id: 81200, fill: o.night ? NIGHT : '#e8dcc0' }); line([220, 200], [220, 420], 1.4, 81201, 0.1); line([140, 310], [300, 310], 1.4, 81202, 0.1);
  shape([[120, 190], [190, 190], [170, 440], [120, 440]], { lw: 1.2, id: 81203, fill: P.paper, h: [1.5, 6, 0.4] });
  // the sofa
  shape(R(420, 500, 360, 60), { lw: 1.8, id: 81210, fill: '#cfc2a0', h: [0.9, 5, 0.4] }); shape(R(420, 440, 360, 64), { lw: 1.6, id: 81211, fill: '#d9cfb4', h: [0.9, 5, 0.4] });
  for (const x of [400, 780]) shape(R(x, 470, 30, 100), { lw: 1.6, id: 81212 + x, fill: '#cfc2a0' }); for (const x of [430, 770]) line([x, 560], [x, FLR], 3, 81220 + x, 0.1);
  // the knitting basket
  shape([[820, 560], [900, 560], [890, FLR], [830, FLR]], { lw: 1.4, id: 81230, fill: '#bfa87c', h: [[0.8, 3, 0.4], [-0.8, 3, 0.4]] });
  const jump = o.jump || 0; for (let q = 0; q < 4; q++) { const bx = 836 + q * 16, by = 552 - Math.abs(Math.sin(lt * 3.1 + q * 1.7)) * 9 * jump; ball(bx, by, 9, 81240 + q, PAT.m, 1, q === 1 ? '#cdbfa9' : WOOL); }
  // the table in her room
  if (o.table !== false) { shape(R(980, 500, 200, 12), { lw: 1.6, id: 81250, h: [0, 3, 0.5] }); line([990, 512], [986, FLR], 3, 81251, 0.1); line([1170, 512], [1174, FLR], 3, 81252, 0.1); }
  if (o.platters) { for (let q = 0; q < 3; q++) { X.beginPath(); X.ellipse(1020 + q * 60, 496, 24, 6, 0, 0, 6.283); X.fillStyle = P.paper; X.fill(); X.lineWidth = 1; X.strokeStyle = P.ink; X.stroke(); } }
  if (o.stamps) { shape(R(1010, 480, 110, 16), { lw: 1, id: 81260, fill: '#7e2c25' }); for (let q = 0; q < 6; q++) shape(R(1016 + q * 16, 470, 12, 12), { lw: 0.6, id: 81261 + q, fill: CARD }); }
  if (o.tray) { shape(R(990, 488, 70, 10), { lw: 1, id: 81270, fill: '#9c968b' }); ball(1012, 478, 9, 81271, null, 1.1, '#8a6e4e'); line([1012, 470], [1022, 458], 1.4, 81272, 0.05, '#c9c2b2'); }
}
/* Irene knitting on the sofa: hands at the needles */
function irene(lt, o = {}) {
  const k = o.knit ?? 1, w = Math.sin(lt * 9) * 4 * k;
  human({ kind: 'E', x: o.x ?? 560, y: o.y ?? FLR, s: o.s ?? 1.25, f: o.f ?? 1, pose: o.pose || 'sit', hn: o.hn || [30 + w, -120], hf: o.hf || [24 - w, -118], look: o.look ?? 0.4, lookY: o.lookY ?? 1, mouth: o.mouth || 0, closed: o.closed, id: 82000 });
  if (k > 0 && !o.hn) { const s = o.s ?? 1.25, x = (o.x ?? 560) + 30 * s, y = (o.y ?? FLR) - 120 * s; line([x - 14 + w, y + 6], [x + 20 + w, y - 18], 1.6, 82100, 0.05, '#c9c2b2'); line([x - 18 - w, y + 4], [x + 16 - w, y - 16], 1.6, 82101, 0.05, '#c9c2b2'); shape([[x - 10, y + 6], [x + 14, y + 6], [x + 12, y + 30], [x - 8, y + 30]], { lw: 1, id: 82102, fill: o.vest ? '#9c968b' : WOOL, h: [0.8, 2.4, 0.4] }); }
}
function brother(o = {}) { if ((o.pose || 'stand') === 'sit') chair(o.x ?? 1100, o.y ?? FLR, o.f ?? -1); human({ kind: 'Y', x: o.x ?? 1100, y: o.y ?? FLR, s: o.s ?? 1.25, f: o.f ?? -1, pose: o.pose || 'stand', ph: o.ph || 0, hn: o.hn, hf: o.hf, look: o.look ?? 0, mouth: o.mouth || 0, alpha: o.alpha, id: 82500 }); }
function corridor(lt, o = {}) {
  wallRoom({ dark: 0 });
  // the turn to the passage on the left, the oak door at the end (right)
  shape(R(140, 300, 140, FLR - 300), { lw: 1.6, id: 83000, fill: '#4b4137' }); mono('TO THE KITCHEN', 210, 290, 9, { col: P.ink });
  const op = o.open ?? 0.4, dx = 820, dw = 240, dy = 180;
  shape(R(dx - 16, dy - 16, dw + 32, FLR - dy + 16), { lw: 2, id: 83010, fill: '#5d4a34', h: [Math.PI / 2, 4, 0.4] });
  X.fillStyle = '#2f2a26'; X.fillRect(dx, dy, dw, FLR - dy);
  const lw_ = dw * (1 - 0.75 * op); shape([[dx, dy], [dx + lw_, dy + 14 * op], [dx + lw_, FLR - 8 * op], [dx, FLR]], { lw: 2, id: 83011, fill: OAK, h: [Math.PI / 2, 5, 0.4] });
  for (const yy of [260, 420]) shape(R(dx + 20, yy, lw_ - 40, 110), { lw: 1, id: 83012 + yy, fill: null });
  const b = o.bolt || 0; shape(R(dx + lw_ - 60, 390, 70, 12), { lw: 1.2, id: 83020, fill: '#9c968b' }); shape(R(dx + lw_ - 60 + 40 * b, 386, 26, 20), { lw: 1.2, id: 83021, fill: '#6f6a61' });
  ball(dx + 20, 400, 6, 83022, null, 1.2, BRASSY);
  if (o.sound) { const s = o.sound; X.save(); X.globalAlpha = s * (0.4 + 0.3 * Math.sin(lt * 7)); for (let q = 0; q < 3; q++) { X.beginPath(); X.arc(dx + dw * 0.6, 340, 40 + q * 26 + ((lt * 30) % 26), -0.7, 0.7); X.lineWidth = 1.4; X.strokeStyle = P.ink; X.stroke(); } X.restore(); }
}
const BRASSY = '#d9c79a';
function chair(x, y, f) { const b = x - f * 24; shape(R(x - 40, y - 108, 80, 10), { lw: 1.4, id: 81300 + x, fill: '#cfc2a0' }); line([b, y - 108], [b - f * 4, y - 230], 3, 81301 + x, 0.1); line([b, y - 230], [b + f * 30, y - 226], 3, 81302 + x, 0.1); line([x - 34, y - 98], [x - 36, y], 2.4, 81303 + x, 0.1); line([x + 34, y - 98], [x + 36, y], 2.4, 81304 + x, 0.1); }
function vestibule(lt, o = {}) {
  wallRoom({ dark: o.dark });
  // tiles on the floor
  for (let x = -200; x < 1500; x += 50) for (let y = FLR; y < FLR + 120; y += 25) if (((x / 50) + (y - FLR) / 25) % 2 < 1) { X.fillStyle = 'rgba(28,24,20,.2)'; X.fillRect(x, y, 50, 25); }
  // the iron gate, right; the front door, left
  const gx = 760, gw = 300, gy = 170, sl = o.gate ?? 1; // 1 = shut
  for (let q = 0; q <= 12; q++) { const x = gx + q * (gw / 12) * (0.25 + 0.75 * sl); line([x, gy], [x, FLR], 2.4, 84000 + q, 0.05, '#2f2a26'); }
  for (const yy of [gy, gy + 40, 420, FLR - 6]) line([gx, yy], [gx + gw * (0.25 + 0.75 * sl), yy], 2.4, 84020 + yy, 0.05, '#2f2a26');
  for (let q = 0; q < 6; q++) { X.beginPath(); X.arc(gx + 25 + q * 50 * (0.25 + 0.75 * sl), gy + 20, 14, 0, Math.PI); X.lineWidth = 1.6; X.strokeStyle = '#2f2a26'; X.stroke(); }
  shape(R(80, 200, 190, FLR - 200), { lw: 2, id: 84100, fill: OAK, h: [Math.PI / 2, 5, 0.4] }); ball(240, 420, 6, 84101, null, 1.2, BRASSY);
  if (o.yarn) { const u = o.yarn; ink([[o.yx || 560, o.yy || 470], [lerp(o.yx || 560, 830, u), lerp(o.yy || 470, FLR - 4, u)], [lerp(o.yx || 560, 900, U(u, 0.6, 1)), FLR - 3]], 1.6, 84200, 0.4, WOOL); if (u > 0.9) ball(lerp(830, 960, U(u, 0.9, 1)), FLR - 8, 7, 84201, PAT.m, 1, WOOL); }
}
function facade(lt, o = {}) {
  X.fillStyle = o.night ? NIGHT : '#d9cfb4'; X.fillRect(-600, -600, 2600, 2000);
  shape(R(200, 80, 880, 560), { lw: 2, id: 85000, fill: o.night ? '#4b4137' : '#cfc2a0', h: [0, 4, 0.3] });
  shape(R(180, 60, 920, 30), { lw: 1.8, id: 85001, fill: '#9c968b' });
  for (let q = 0; q < 4; q++) { const x = 260 + q * 210; shape(R(x, 130, 110, 170), { lw: 1.6, id: 85010 + q, fill: o.night ? (q === 1 && o.lit ? '#efe3c2' : NIGHT) : '#4b4137' }); shape(R(x - 14, 300, 138, 10), { lw: 1.4, id: 85020 + q, fill: '#9c968b' }); for (let b = 0; b < 7; b++) line([x - 10 + b * 20, 310], [x - 10 + b * 20, 350], 1.4, 85030 + q * 10 + b, 0.05); line([x - 14, 350], [x + 124, 350], 1.6, 85040 + q, 0.05); }
  for (let q = 0; q < 3; q++) { const x = 260 + q * 210; shape(R(x, 400, 110, 150), { lw: 1.6, id: 85050 + q, fill: o.night ? NIGHT : '#4b4137' }); }
  shape(R(890, 380, 120, 260), { lw: 2, id: 85060, fill: OAK, h: [Math.PI / 2, 5, 0.4] }); ball(990, 520, 5, 85061, null, 1.2, BRASSY);
  X.fillStyle = '#6f6a61'; X.fillRect(-600, 640, 2600, 200); line([-600, 640], [2000, 640], 2, 85070, 0.2); line([-600, 690], [2000, 690], 1.4, 85071, 0.2);
  // the drain in the kerb
  shape(R(600, 682, 70, 14), { lw: 1.2, id: 85080, fill: P.ink }); for (let q = 0; q < 6; q++) line([606 + q * 11, 684], [606 + q * 11, 694], 1.2, 85081 + q, 0.05, '#9c968b');
}

/* ================= shots ================= */
SHOTS.title = (lt, sd, sh) => {
  const ik = cue(sh, 'ink'), nm = cue(sh, 'name');
  cam(camFor(lt, [[0, ON(560, 360, 1.35)], [3, ON(640, 360, 1.0), 5]]), () => plan(lt, { u: U(lt, ik.at, ik.to) }));
  if (lt > nm.at) { X.globalAlpha = U(lt, nm.at, nm.at + 1); shape(R(340, 290, 600, 120), { lw: 1.6, id: 86000, fill: P.paper }); txt('HOUSE TAKEN OVER', 640, 336, 40, {}); txt('after Julio Cortázar', 640, 378, 17, { italic: true }); X.globalAlpha = 1; }
};
SHOTS.house = (lt, sd, sh) => {
  const L = sh.lines, inn = cue(sh, 'in');
  if (lt < inn.at) { cam(camFor(lt, [[0, ON(640, 360, 1.0)], [2, ON(640, 340, 1.12), 6]]), () => facade(lt, {})); return; }
  let c = camFor(lt - inn.at, [[0, ON(640, 380, 1.0)], [4, ON(700, 380, 1.12), 6]]); c = withTight(sh, lt, c, 640, 300, 1.25);
  cam(c, () => { ireneRoom(lt, { jump: 0.5, table: false }); irene(lt, {}); brother({ x: 1080, pose: 'sit', hn: [-40, -104], hf: [-30, -100], look: 0.5, lookY: 1 }); });
  if (lt > L[3].t0 - 0.3) inset(lt, { u: 1 });
};
SHOTS.plan = (lt, sd, sh) => {
  const Q = (k) => cue(sh, k).at, L = sh.lines;
  const hl = new Set(); if (lt > Q('front')) ['VES'].forEach((k) => hl.add(k)); if (lt > Q('gate')) hl.add('HALL'); if (lt > Q('beds')) ['MINE', 'IRE'].forEach((k) => hl.add(k)); if (lt > Q('corr')) hl.add('COR'); if (lt > Q('kit')) ['PAS', 'KIT', 'BATH'].forEach((k) => hl.add(k)); if (lt > Q('back')) ['BPS', 'SP', 'DIN', 'TAP', 'LIB', 'BA', 'BB', 'BC'].forEach((k) => hl.add(k));
  const shut = new Set(lt > Q('shut') ? ['oak'] : []);
  const wave = lt > Q('shut') ? { from: 'IRE', t: Q('shut') } : lt > Q('open') ? { from: 'IRE', t: Q('open') } : null;
  let c = camFor(lt, [[0, ON(300, 380, 1.5)], [Q('corr') - 0.3, ON(560, 300, 1.4), 1.0], [Q('back') - 0.3, ON(1000, 360, 1.3), 1.0], [Q('open') - 0.3, ON(640, 380, 1.0), 1.0]]);
  c = withTight(sh, lt, c, 1000, 640, 1.8);
  cam(c, () => {
    plan(lt, { hl: lt < Q('open') ? hl : null, shut, graph: lt > Q('open') ? U(lt, Q('open'), Q('open') + 0.8) : 0, wave });
    if (lt > Q('open')) { const n = countOf(reach('IRE', shut)); const tw = (lt - wave.t) / 0.32; const dep = reach('IRE', shut); const shown = Object.entries(dep).filter(([k, d]) => k !== 'SP' && d <= tw).length; planCounter(Math.min(n, shown), 1240, 664, shut.size ? 'REACHABLE FROM IRENE’S ROOM, DOOR SHUT' : 'REACHABLE FROM IRENE’S ROOM, DOOR OPEN'); }
  });
};
SHOTS.days = (lt, sd, sh) => {
  const L = sh.lines, un = cue(sh, 'unravel'), sa = cue(sh, 'sat');
  let c = camFor(lt, [[0, ON(700, 380, 1.0)], [L[1].t0, ON(600, 420, 1.35), 1.2], [sa.at, ON(760, 400, 1.15), 1.2], [L[3].t0, ON(610, 440, 1.8), 1.0]]);
  c = withTight(sh, lt, c, 600, 470, 3.0);
  const pull = lt > un.at && lt < un.at + 4 ? 1 : 0;
  cam(c, () => { ireneRoom(lt, { jump: lt > L[3].t0 ? 1 : 0.4 });
    irene(lt, { knit: pull ? 0.2 : 1, hn: pull ? [60, -126] : undefined, hf: pull ? [-6, -118] : undefined });
    if (pull) ink([[560 + 1.25 * 60, FLR - 126 * 1.25], [560 + 1.25 * 30, FLR - 100 * 1.25], [560 - 1.25 * 6, FLR - 118 * 1.25]], 1.6, 87000, 0.6, WOOL);
    if (lt < L[1].t0) brother({ x: 1100, pose: 'walk', ph: lt * 6, f: -1 });
    if (lt > sa.at && lt < L[3].t0) { brother({ x: lerp(1000, 1200, U(lt, sa.at, sa.at + 3)), pose: 'walk', ph: lt * 6, f: 1, hn: [30, -96] }); ball(1000 + 200 * U(lt, sa.at, sa.at + 3) + 38, FLR - 116, 9, 87010, PAT.m, 1, WOOL); }
  });
};
SHOTS.night1 = (lt, sd, sh) => {
  const Q = (k) => cue(sh, k).at, L = sh.lines;
  const shut = lt > Q('shut') + 0.6;
  if (lt < Q('room')) {
    const wu = U(lt, Q('walk'), cue(sh, 'walk').to), op = lt < Q('shut') ? 0.4 : 0.4 * (1 - E.io(U(lt, Q('shut'), Q('shut') + 0.6)));
    let c = camFor(lt, [[0, ON(640, 400, 1.0)], [Q('noise1') - 0.4, ON(900, 380, 1.35), 1.2], [Q('shut') - 0.3, ON(840, 400, 1.6), 0.6]]);
    cam(c, () => { corridor(lt, { open: op, bolt: U(lt, Q('bolt'), Q('bolt') + 0.6), sound: lt > Q('noise1') && lt < Q('shut') + 0.4 ? 1 : 0 });
      const atDoor = lt > Q('shut') - 0.2; brother({ x: atDoor ? lerp(560, 760, U(lt, Q('shut') - 0.2, Q('shut') + 0.3)) : lerp(80, 560, wu), f: 1, pose: wu > 0 && wu < 1 || (atDoor && lt < Q('shut') + 0.3) ? 'walk' : 'stand', ph: lt * 7, hn: atDoor ? [70, -150] : undefined, hf: atDoor ? [66, -110] : undefined, look: lt > Q('noise1') ? 1 : 0 }); });
    inset(lt, { shut: new Set(shut ? ['oak'] : []), lost: new Set(shut ? ['BPS', 'SP', 'DIN', 'TAP', 'LIB', 'BA', 'BB', 'BC'] : []) });
    return;
  }
  let c = camFor(lt - Q('room'), [[0, ON(760, 400, 1.05)], [3, ON(700, 400, 1.15), 4]]);
  { const [hx, hy] = headPos({ kind: 'E', x: 560, y: FLR, s: 1.25, pose: 'sit' }); c = withTight(sh, lt, c, hx + 10, hy + 30, 3.0); }
  const dropped = lt > Q('drop') && lt < L[5].t1 + 1.4;
  cam(c, () => { ireneRoom(lt, { tray: true }); irene(lt, { knit: dropped ? 0 : lt > L[6].t0 ? 0.4 : 1, hn: dropped ? [36, -76] : undefined, hf: dropped ? [10, -74] : undefined, lookY: dropped ? -0.2 : 1, look: dropped ? 1 : 0.4, mouth: sayAt(sh, 'I', lt), vest: true });
    brother({ x: 920, f: -1, hn: [-20, -120], look: Math.max(0, Math.sin((lt - Q('nod')) * 8)) * (lt > Q('nod') && lt < Q('nod') + 0.8 ? 1 : 0) }); });
  inset(lt, { shut: new Set(['oak']), lost: new Set(['BPS', 'SP', 'DIN', 'TAP', 'LIB', 'BA', 'BB', 'BC']) });
};
SHOTS.after = (lt, sd, sh) => {
  const L = sh.lines, dr = cue(sh, 'drawer'), sp = cue(sh, 'supper'), st = cue(sh, 'stamps');
  if (lt < dr.at) { // the things left on the other side, as a list on the plan
    cam(camFor(lt, [[0, ON(1000, 360, 1.3)], [3, ON(1050, 300, 1.5), 5]]), () => { plan(lt, { shut: new Set(['oak']), lost: new Set(['BPS', 'SP', 'DIN', 'TAP', 'LIB', 'BA', 'BB', 'BC']) });
      const items = [['FRENCH BOOKS', 1170, 230, 0.15], ['WRITING PAPER', 875, 470, 0.4], ['WINTER SLIPPERS', 1025, 520, 0.55], ['A PIPE', 1025, 250, 0.8]]; items.forEach(([s, x, y, at]) => { const u = U(lt, L[0].t0 + at * (L[0].t1 - L[0].t0), L[0].t0 + at * (L[0].t1 - L[0].t0) + 0.5); if (u > 0) { X.globalAlpha = u; mono(s, x, y, 9, { col: '#efe3c2' }); X.globalAlpha = 1; } }); });
    return;
  }
  if (lt < sp.at) { cam(camFor(lt - dr.at, [[0, ON(640, 380, 1.0)], [2, ON(640, 360, 1.12), 4]]), () => { wallRoom({}); shape(R(380, 300, 520, 320), { lw: 2, id: 88000, fill: '#cfc2a0', h: [0, 4, 0.3] }); const op = E.io(U(lt, dr.at + 0.4, dr.at + 1.4)) * (1 - E.io(U(lt, dr.at + 3.5, dr.at + 4.2))); shape(R(400, 480 + op * 40, 480, 110), { lw: 1.8, id: 88001, fill: '#d9cfb4' }); ball(640, 535 + op * 40, 6, 88002, null, 1, BRASSY); if (op > 0.4) { X.fillStyle = '#2f2a26'; X.fillRect(404, 480, 472, op * 40); } human({ kind: 'Y', x: 300, y: FLR, s: 1.2, f: 1, hn: [80, -96], look: 0.5, lookY: 1, id: 88100 }); human({ kind: 'E', x: 980, y: FLR, s: 1.15, f: -1, look: 0.5, lookY: 0.6, id: 88200 }); }); return; }
  let c = camFor(lt - sp.at, [[0, ON(800, 400, 1.05)], [3, ON(900, 440, 1.3), 5]]); c = withTight(sh, lt, c, 760, 420, 1.6);
  cam(c, () => { ireneRoom(lt, { platters: lt < st.at, stamps: lt > st.at, jump: 0.3 }); irene(lt, { x: 620 }); brother({ x: 1215, pose: 'sit', f: -1, hn: [-90, -116], hf: [-80, -112], look: 0.4, lookY: 1 }); });
  inset(lt, { shut: new Set(['oak']), lost: new Set(['BPS', 'SP', 'DIN', 'TAP', 'LIB', 'BA', 'BB', 'BC']) });
};
SHOTS.nights = (lt, sd, sh) => {
  const L = sh.lines, sl = cue(sh, 'sleep'), kt = cue(sh, 'kitchen');
  if (lt < kt.at) { // the front wing at night, both in bed, the living room between
    cam(camFor(lt, [[0, ON(350, 360, 1.25)], [sl.at, ON(350, 500, 1.6), 1.2]]), () => { plan(lt, { shut: new Set(['oak']), lost: new Set(['BPS', 'SP', 'DIN', 'TAP', 'LIB', 'BA', 'BB', 'BC']), labels: true }); darken(0.35);
      // sleepers as marks in their beds, sound rings passing through the living room
      for (const [x, y, who] of [[300, 190, 'Y'], [300, 530, 'E']]) { shape(R(x - 40, y - 20, 90, 44), { lw: 1.2, id: 89000 + y, fill: P.paper }); ball(x - 26, y, 8, 89010 + y, PAT.f, 1); mono(who === 'Y' ? 'ME' : 'IRENE', x + 10, y + 4, 8, { col: P.ink }); }
      const src = lt > sl.at ? [300, 530] : [300, 190]; X.save(); for (let q = 0; q < 4; q++) { const r = ((lt * 60 + q * 40) % 160); X.globalAlpha = 0.6 * (1 - r / 160); X.beginPath(); X.arc(src[0], src[1], r, 0, 6.283); X.lineWidth = 1.2; X.strokeStyle = '#efe3c2'; X.stroke(); } X.restore(); });
    return;
  }
  cam(camFor(lt - kt.at, [[0, ON(640, 380, 1.0)], [3, ON(620, 400, 1.15), 5]]), () => { wallRoom({}); shape(R(200, 470, 700, 20), { lw: 1.8, id: 89100, fill: '#cfc2a0', h: [0, 3, 0.4] }); shape(R(200, 490, 700, 130), { lw: 1.6, id: 89101, fill: '#d9cfb4', h: [Math.PI / 2, 6, 0.3] });
    for (let q = 0; q < 6; q++) { X.beginPath(); X.ellipse(260 + q * 50, 466, 20, 5, 0, 0, 6.283); X.fillStyle = P.paper; X.fill(); X.lineWidth = 1; X.strokeStyle = P.ink; X.stroke(); }
    shape(R(700, 420, 50, 48), { lw: 1.4, id: 89110, fill: '#9c968b' }); line([725, 410], [745, 380], 1.6, 89111, 0.1);
    human({ kind: 'Y', x: 500, y: FLR, s: 1.2, f: 1, hn: [70, -112], hf: [60, -110], look: 0.6, lookY: 1, id: 89200 }); human({ kind: 'E', x: 900, y: FLR, s: 1.15, f: -1, hn: [60, -120], mouth: Math.max(0, Math.sin(lt * 5)) * 0.8, id: 89300 }); });
  inset(lt, { shut: new Set(['oak']), lost: new Set(['BPS', 'SP', 'DIN', 'TAP', 'LIB', 'BA', 'BB', 'BC']) });
};
const LOST1 = ['BPS', 'SP', 'DIN', 'TAP', 'LIB', 'BA', 'BB', 'BC'];
SHOTS.night2 = (lt, sd, sh) => {
  const Q = (k) => cue(sh, k).at, L = sh.lines;
  const nearLost = lt > Q('near') ? ['COR', 'PAS', 'KIT', 'BATH'] : lt > Q('noise') ? ['PAS', 'KIT', 'BATH'] : [];
  if (lt < Q('run')) {
    let c = camFor(lt, [[0, ON(700, 400, 1.05)], [Q('noise') - 0.3, ON(860, 380, 1.3), 1.0], [Q('stand'), ON(820, 400, 1.2), 1.0]]);
    cam(c, () => { ireneRoom(lt, { night: true, dark: 0.25 });
      human({ kind: 'Y', x: lt > Q('noise') ? 1060 : lerp(900, 1060, U(lt, 0.5, 3)), y: FLR, s: 1.25, f: 1, look: lt > Q('noise') ? 1 : 0, id: 90000 });
      if (lt > Q('stand')) human({ kind: 'E', x: lerp(560, 960, E.io(U(lt, Q('stand'), Q('stand') + 1.8))), y: FLR, s: 1.2, f: 1, pose: lt < Q('stand') + 1.8 ? 'walk' : 'stand', ph: lt * 7, hn: [30, -120], hf: [24, -118], look: 1, id: 90100 });
      else irene(lt, { knit: 0.6 });
      if (lt > Q('noise')) { X.save(); X.globalAlpha = 0.5 + 0.3 * Math.sin(lt * 6); for (let q = 0; q < 3; q++) { X.beginPath(); X.arc(1400, 330, 120 + q * 40 + ((lt * 40) % 40), Math.PI * 0.8, Math.PI * 1.2); X.lineWidth = 1.4; X.strokeStyle = P.ink; X.stroke(); } X.restore(); } });
    inset(lt, { shut: new Set(['oak']), lost: new Set([...LOST1, ...nearLost]) });
    return;
  }
  const ru = U(lt, Q('run'), cue(sh, 'run').to), slam = U(lt, Q('slam'), Q('slam') + 0.25);
  let c = camFor(lt - Q('run'), [[0, ON(760, 380, 1.0)], [3, ON(560, 400, 1.15), 2]]);
  { c = withTight(sh, lt, c, 860, 600, 2.4); }
  const yarnU = U(lt, L[5].t0, L[5].t0 + 3.5);
  cam(c, () => { vestibule(lt, { gate: lt > Q('slam') ? 1 : 0.15 + 0.85 * slam, yarn: lt > Q('slam') ? Math.max(0.15, yarnU) : 0, yx: 560, yy: 470 });
    const x = lt < Q('slam') ? lerp(1250, 600, ru) : 600;
    human({ kind: 'Y', x: x - 50, y: FLR, s: 1.25, f: -1, pose: ru < 1 ? 'walk' : 'stand', ph: lt * 9, hn: lt > Q('slam') - 0.3 && lt < Q('slam') + 0.6 ? [-30, -140] : [40, -120], id: 90200 });
    human({ kind: 'E', x: x + 30, y: FLR, s: 1.2, f: -1, pose: ru < 1 ? 'walk' : 'stand', ph: lt * 9 + 1, hn: lt > L[5].t0 ? [-10, -80] : [-20, -110], mouth: sayAt(sh, 'I', lt), look: lt > L[5].t0 ? -1 : 0, lookY: lt > L[5].t0 ? 1 : 0, id: 90300 });
    if (lt > Q('slam') && lt < Q('slam') + 0.2) darken(0.15);
  });
  inset(lt, { shut: new Set(['oak', 'gate']), lost: new Set([...LOST1, 'COR', 'PAS', 'KIT', 'BATH', 'HALL', 'MINE', 'IRE']) });
};
SHOTS.street = (lt, sd, sh) => {
  const L = sh.lines, lk = cue(sh, 'lock'), ky = cue(sh, 'key'), wk = cue(sh, 'walk');
  if (lt < L[2].t0) { cam(ON(640, 400, 1.15), () => { vestibule(lt, { gate: 1, dark: 0.3, yarn: 1, yx: 560, yy: 470 }); human({ kind: 'Y', x: 520, y: FLR, s: 1.25, f: 1, mouth: sayAt(sh, 'N', lt), id: 91000 }); human({ kind: 'E', x: 660, y: FLR, s: 1.2, f: -1, mouth: sayAt(sh, 'I', lt), hn: [10, -70], hf: [0, -72], id: 91100 }); });
    inset(lt, { shut: new Set(['oak', 'gate']), lost: new Set([...LOST1, 'COR', 'PAS', 'KIT', 'BATH', 'HALL', 'MINE', 'IRE']) }); return; }
  const out = lt > lk.at, wu = U(lt, wk.at, sd - 1);
  let c = camFor(lt - L[2].t0, [[0, ON(820, 450, 1.25)], [6, ON(760, 480, 1.4), 6]]); c = withTight(sh, lt, c, 640, 640, 2.0);
  if (lt > wk.at) c = blendCam(c, ON(640, 360, 1.0), E.io(U(lt, wk.at, wk.at + 3)));
  cam(c, () => { facade(lt, { night: true });
    const kx = 960, kf = U(lt, ky.at, ky.at + 0.9);
    human({ kind: 'Y', x: lerp(940, 300, wu), y: 662, s: 1.0, f: wu > 0 ? -1 : 1, pose: wu > 0 && wu < 1 ? 'walk' : 'stand', ph: lt * 6, hn: wu > 0 ? [24, -150] : lt > ky.at - 0.6 && lt < ky.at + 0.4 ? [40, -60] : [50, -110], id: 91200 });
    human({ kind: 'E', x: lerp(860, 250, wu), y: 662, s: 0.95, f: -1, pose: wu > 0 && wu < 1 ? 'walk' : 'stand', ph: lt * 6 + 1, hn: [10, -100], hf: [0, -96], closed: true, id: 91300 });
    if (lt > ky.at && kf < 1) { const kx2 = lerp(kx, 635, kf), ky2 = lerp(600, 688, kf * kf); shape(R(kx2 - 8, ky2 - 2, 16, 4), { lw: 0.8, id: 91400, fill: BRASSY }); }
    void out; });
  mono('ROOMS THAT ARE OURS  ' + (lt > lk.at ? 0 : 1), PX0 + 120, PY1 - 20, 11, { col: P.red });
};
SHOTS.end = (lt, sd, sh) => {
  cam(ON(640, 360, 1.0), () => { plan(lt, { shut: new Set(['oak', 'gate', 'front']), lost: new Set(ROOMS.map((r) => r[0])) }); });
  X.globalAlpha = seg(lt, 1.0, 2.2);
  shape(R(220, 260, 840, 200), { lw: 1.6, id: 92000, fill: P.paper });
  txt('HOUSE TAKEN OVER', 640, 300, 30, {});
  txt('after Julio Cortázar, Casa tomada (1946), translated by Paul Blackburn as House Taken Over.', 640, 346, 15, { italic: true });
  txt('The house is drawn as a plan and read as a graph. Whoever takes it over is never drawn.', 640, 376, 15, { italic: true });
  txt('Nothing is quoted from Cortázar.', 640, 406, 15, { italic: true });
  X.globalAlpha = 1; void sh; void sd;
};
