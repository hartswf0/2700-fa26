/* The Great International Congress of Doors. Drawing. Film two of THE HOUSE THAT LANGUAGE BUILT, four fables of Edifiction:
   an original fable from Watson Hartsoe's notes "The House That Language Built", in the manner of Stanislaw Lem.
   Same paper, ink and engraving toolkit as the Lem films (kingdoms-in-a-box/film-src/ink.js, and the drawing primitives from
   ferrix/film-src/fx.js). One accent colour, brick red, only for the brass plates' sentences and for things that are wrong.
   One closed set: the great hall of the Ministry. Four bays, four Edifiers, four doors that behave exactly as defined:
   the Objectist's has no hinges, the Transitionist's is a door-shaped absence, the Conventionalist's checks credentials,
   the Encounterist's appears in front of whatever exit someone is trying. The plain door at the back was never defined.
   Every door frame is built from the letters of its definition: the sentence is typed, and its letters fly to the bay and
   become bricks (NB = 44 per frame, landing on the rule given in script.js). */
const W = 1280, H = 720, PX0 = 22, PY0 = 22, PX1 = 1258, PY1 = 698, CX = 640, CY = 360;
const DARK = '#2a241d';

/* ---------- drawing primitives ---------- */
function path(pts, close = true) { X.beginPath(); pts.forEach(([x, y], i) => (i ? X.lineTo(x, y) : X.moveTo(x, y))); if (close) X.closePath(); }
const R = (x, y, w, h) => [[x, y], [x + w, y], [x + w, y + h], [x, y + h]];
function bbox(pts) { let a = 1e9, b = 1e9, c = -1e9, d = -1e9; for (const [x, y] of pts) { a = Math.min(a, x); b = Math.min(b, y); c = Math.max(c, x); d = Math.max(d, y); } return [a, b, c, d]; }
function hatch(ang, sp, lw, bb, col = P.ink) {
  const [x0, y0, x1, y1] = bb, c = Math.cos(ang), s = Math.sin(ang), cx = (x0 + x1) / 2, cy = (y0 + y1) / 2, L = Math.hypot(x1 - x0, y1 - y0) / 2 + 3;
  X.beginPath(); for (let d = -L; d <= L; d += sp) { const px = cx - s * d, py = cy + c * d; X.moveTo(px - c * L, py - s * L); X.lineTo(px + c * L, py + s * L); }
  X.lineWidth = lw; X.strokeStyle = col; X.stroke();
}
/* shape: fill, optional hatch layers [ang, spacing, width], optional shadow polygon, inked outline */
function shape(pts, o = {}) {
  if (SILENT) return;
  if (o.fill !== null) { path(pts); X.fillStyle = o.fill || P.paper; X.fill(); }
  const bb = bbox(pts);
  if (o.h || o.sh) {
    X.save(); path(pts); X.clip();
    if (o.h) for (const h of (Array.isArray(o.h[0]) ? o.h : [o.h])) hatch(h[0], h[1], h[2] || 0.7, bb);
    if (o.sh) { path(o.sh); X.clip(); for (const h of (Array.isArray(o.sh2[0]) ? o.sh2 : [o.sh2])) hatch(h[0], h[1], h[2] || 0.8, bbox(o.sh)); }
    X.restore();
  }
  if (o.lw !== 0) ink([...pts, pts[0]], o.lw || 1.5, o.id || 1, o.amp ?? 0.5, o.col || P.ink);
}
function line(a, b, lw = 1.2, id = 1, amp = 0.3, col = P.ink) { ink([a, b], lw, id, amp, col); }
function cap(x0, y0, x1, y1, w, id) {
  if (SILENT) return;
  X.lineCap = 'round'; X.beginPath(); X.moveTo(x0, y0); X.lineTo(x1, y1);
  X.lineWidth = w + 3; X.strokeStyle = P.ink; X.stroke(); X.lineWidth = w; X.strokeStyle = P.paper; X.stroke();
  const dx = x1 - x0, dy = y1 - y0, L = Math.hypot(dx, dy) || 1, nx = -dy / L * w * 0.27, ny = dx / L * w * 0.27;
  X.beginPath(); X.moveTo(x0 + nx, y0 + ny); X.lineTo(x1 + nx, y1 + ny); X.lineWidth = w * 0.42; X.strokeStyle = PAT.m; X.stroke();
  X.lineCap = 'butt';
}
function limb(x, y, a1, l1, a2, l2, w, id) {
  const ex = x + Math.cos(a1) * l1, ey = y + Math.sin(a1) * l1, hx = ex + Math.cos(a2) * l2, hy = ey + Math.sin(a2) * l2;
  cap(x, y, ex, ey, w, id); cap(ex, ey, hx, hy, w * 0.86, id + 1); ball(ex, ey, w * 0.6, id + 2, PAT.f, 1.2);
  return [ex, ey, hx, hy];
}
function hand(x, y, a, r, id, open = 0) {
  ball(x, y, r, id, PAT.f, 1.3);
  for (let i = 0; i < 4; i++) { const b = a + (i - 1.5) * (0.22 + open * 0.2); line([x + Math.cos(b) * r * 0.8, y + Math.sin(b) * r * 0.8], [x + Math.cos(b) * r * (1.9 + open * 0.5), y + Math.sin(b) * r * (1.9 + open * 0.5)], r * 0.42, id + i + 1, 0.15); }
}
function boot(x, y, d, s, id) { shape([[x - 12 * s * d, y - 16 * s], [x + 10 * s * d, y - 16 * s], [x + 30 * s * d, y - 6 * s], [x + 34 * s * d, y], [x - 16 * s * d, y]], { lw: 1.6, id, h: [0.15, 2.6, 0.7] }); line([x - 14 * s * d, y - 7 * s], [x + 28 * s * d, y - 7 * s], 1, id + 3); }

/* dreadlock: thick ink stroke with paper coil ticks */
/* ================= helpers (as in the earlier films) ================= */
let T = null, GT = 0;
const sayAt = (sh, who, lt) => { for (const l of sh.lines) if (l.who === who && lt >= l.t0 && lt < l.t1) return l.env[Math.min(l.env.length - 1, Math.floor((lt - l.t0) * 24))] || 0; return 0; };
const talking = (sh, who, lt) => sh.lines.some((l) => l.who === who && lt >= l.t0 - 0.1 && lt < l.t1 + 0.2);
const cue = (sh, k, i = 0) => sh.cues.filter((c) => c.k === k)[i];
const cues = (sh, k) => sh.cues.filter((c) => c.k === k).sort((a, b) => (a.n || 0) - (b.n || 0));
function cam(c, fn) { X.save(); X.translate(CX, CY); X.scale(c.z, c.z); X.translate(-CX - c.x, -CY - c.y); fn(); X.restore(); }
const ON = (x, y, z) => ({ z, x: x - CX, y: y - CY });
function blendCam(a, b, u) { return { z: lerp(a.z, b.z, u), x: lerp(a.x, b.x, u), y: lerp(a.y, b.y, u) }; }
function camFor(lt, plan, dur = 0.8) { let c = plan[0][1]; for (let i = 1; i < plan.length; i++) { const [t0, cc, dd] = plan[i]; if (lt >= t0) c = blendCam(c, cc, seg(lt, t0, t0 + (dd || dur), E.io)); } return c; }
const U = (t, a, b) => clamp((t - a) / Math.max(0.01, b - a));
const pulse = (t, a, d = 0.18) => (t >= a && t < a + d ? Math.sin(Math.PI * (t - a) / d) : 0);
const fulcrum = (sh) => sh.lines.find((l) => l.line);
const tightU = (sh, lt) => { const f = fulcrum(sh); return f ? seg(lt, f.t0 - 0.5, f.t0 + 0.3) * (1 - seg(lt, f.t1 + 0.1, f.t1 + 0.8)) : 0; };
const TIGHT = (x, y, z = 2.5) => ON(x, y, z);
function withTight(sh, lt, c, x, y, z = 2.5) { const u = tightU(sh, lt); return u > 0 ? blendCam(c, TIGHT(x, y, z), E.io(u)) : c; }
const rot = (x, y, a) => { const c = Math.cos(a), s = Math.sin(a); return [x * c - y * s, x * s + y * c]; };
const SHOTS = {};

const lerp = (a, b, u) => a + (b - a) * u;
const MONO = '"IBM Plex Mono","DejaVu Sans Mono",monospace';
const RED = '#a8432e';   // the series accent: the plates' sentences, and things that are wrong
const P2 = '#f4eedc';
function mtxt(s, x, y, size, o = {}) { if (SILENT) return; X.font = `${o.bold ? '600 ' : ''}${size}px ${MONO}`; X.textAlign = o.align || 'center'; X.textBaseline = 'middle'; X.fillStyle = o.col || P.ink; X.fillText(s, x, y); }
function ftxt(s, x, y, size, o = {}) { if (SILENT) return; X.font = `${o.italic ? 'italic ' : ''}${size}px ${FONT}`; X.textAlign = o.align || 'center'; X.textBaseline = 'middle'; X.fillStyle = o.col || P.ink; X.fillText(s, x, y); }
function wrapTxt(s, width, font) { X.font = font; const out = []; let cur = ''; for (const w of s.split(' ')) { const t = cur ? cur + ' ' + w : w; if (X.measureText(t).width > width && cur) { out.push(cur); cur = w; } else cur = t; } if (cur) out.push(cur); return out; }
function ell(x, y, rx, ry, fill, lw = 1.2, id = 1) { X.beginPath(); X.ellipse(x, y, rx, ry, 0, 0, 6.2832); if (fill) { X.fillStyle = fill; X.fill(); } if (lw) { X.lineWidth = lw; X.strokeStyle = P.ink; X.stroke(); } }
function hatchIn(pts, ang, sp, lw = 0.6) { if (SILENT) return; X.save(); path(pts); X.clip(); hatch(ang, sp, lw, bbox(pts)); X.restore(); }
function dashRect(x, y, w, h, col = RED, lw = 1.3) { X.save(); X.setLineDash([4, 3]); X.lineWidth = lw; X.strokeStyle = col; X.strokeRect(x, y, w, h); X.restore(); }

/* ================= the hall: one closed set ================= */
const FL = 600, WTOP = 206, FRZ = 132;
const BAYX = { A: 510, B: 730, C: 970, D: 1190 }, EDX = { A: 400, B: 620, C: 1080, D: 1300 };
const DW = 92, DH = 204;                       // every door: 92 wide, 17 courses of 12 high
const GREAT = { cx: 140, w: 150, h: 272 }, WIN1 = { cx: 300, w: 66, top: 214, bot: 470 }, WIN2 = { cx: 1400, w: 66, top: 214, bot: 470 };
const PLAIN = { cx: 1570, w: 60, h: 148 };     // the cleaner's door, which nobody has defined
const ROST = { cx: 850, top: 470 }, CHAIR_BASE = 566;
const TABLE = { x0: 430, x1: 1270, y: 700 }, SEAT_Y = 772;
const SEATX = { O: 560, T: 720, V: 980, K: 1140 };
const STAND_Y = 650;
const CARD = { O: 'OBJECTIST', T: 'TRANSITIONIST', V: 'CONVENTIONALIST', K: 'ENCOUNTERIST' };

function ceilingAndWall(S) {
  // ceiling coffers
  shape(R(-400, -400, 2500, FRZ + 400), { lw: 0, fill: P.paper, h: [0, 3.2, 0.7] });
  for (let i = 0; i < 16; i++) { const x = -200 + i * 140; shape(R(x + 10, 30, 110, 70), { lw: 1, id: 900 + i, fill: P.paper, h: [0.785, 5, 0.5] }); }
  for (let i = 0; i < 16; i++) { const x = -200 + i * 140; shape(R(x + 10, -90, 110, 90), { lw: 1, id: 920 + i, fill: P.paper, h: [0.785, 5, 0.5] }); }
  // frieze with the Ministry's motto cut into it
  shape(R(-400, FRZ, 2500, WTOP - FRZ), { lw: 0, fill: P2 });
  line([-400, FRZ], [2100, FRZ], 2.2, 940, 0.4); line([-400, FRZ + 6], [2100, FRZ + 6], 0.9, 941, 0.3);
  line([-400, WTOP - 6], [2100, WTOP - 6], 0.9, 942, 0.3); line([-400, WTOP], [2100, WTOP], 2.2, 943, 0.4);
  for (let i = 0; i < 64; i++) { const x = -380 + i * 40; shape(R(x, WTOP - 4, 18, 8), { lw: 0.6, id: 950 + i, fill: P.paper }); }
  X.save(); X.font = `27px ${FONT}`; X.textAlign = 'center'; X.textBaseline = 'middle';
  const motto = 'EVERYTHING  THAT  CAN  BE  SAID  CAN  BE  BUILT';
  X.fillStyle = 'rgba(28,24,20,.25)'; X.fillText(motto, 851.5, 170.5); X.fillStyle = P.ink; X.fillText(motto, 850, 169); X.restore();
  // the wall
  shape(R(-400, WTOP, 2500, FL - WTOP), { lw: 0, fill: P.paper, h: [0, 4, 0.5] });
  for (const px of [232, 362, 1352, 1458, 1650]) {
    shape(R(px - 12, WTOP, 24, FL - WTOP), { lw: 1.2, id: 960 + px, fill: P.paper, sh: R(px + 2, WTOP, 10, FL - WTOP), sh2: [Math.PI / 2, 2.4, 0.6] });
    shape(R(px - 16, WTOP, 32, 12), { lw: 1, id: 970 + px, fill: P.paper }); shape(R(px - 16, FL - 14, 32, 14), { lw: 1, id: 980 + px, fill: P.paper, h: [0, 3, 0.5] });
  }
  // wainscot
  line([-400, FL - 60], [2100, FL - 60], 1, 990, 0.4);
  shape(R(-400, FL - 60, 2500, 60), { fill: null, lw: 0, h: [Math.PI / 2, 9, 0.4] });
}
function floor_() {
  shape(R(-400, FL, 2500, 500), { lw: 0, fill: P.paper });
  X.save(); path(R(-400, FL, 2500, 500)); X.clip();
  X.beginPath(); for (let i = -40; i <= 40; i++) { const x0 = 850 + i * 52; X.moveTo(x0, FL); X.lineTo(850 + i * 52 * 3.4, FL + 500); } X.lineWidth = 0.6; X.strokeStyle = P.ink; X.stroke();
  for (let k = 0; k < 9; k++) { const y = FL + 12 + Math.pow(k, 1.5) * 18; line([-400, y], [2100, y], 0.5, 995 + k, 0.4); }
  X.restore();
  line([-400, FL], [2100, FL], 1.8, 999, 0.5);
}
function clock_(t) {
  const x = ROST.cx, y = 262, r = 34;
  ball(x, y, r + 5, 1001, PAT.f, 1.6); circ(x, y, r, 1002, 0.4); X.fillStyle = P2; X.fill(); X.lineWidth = 1.2; X.strokeStyle = P.ink; X.stroke();
  for (let i = 0; i < 12; i++) { const a = i / 12 * 6.2832; line([x + Math.cos(a) * r * 0.8, y + Math.sin(a) * r * 0.8], [x + Math.cos(a) * r * 0.94, y + Math.sin(a) * r * 0.94], i % 3 ? 0.8 : 1.8, 1003 + i, 0.05); }
  const m = t / 60 * 6.2832 - 1.5708, h = t / 720 * 6.2832 - 1.5708 + 0.9;
  line([x, y], [x + Math.cos(h) * r * 0.5, y + Math.sin(h) * r * 0.5], 2.6, 1020, 0.05); line([x, y], [x + Math.cos(m) * r * 0.78, y + Math.sin(m) * r * 0.78], 1.6, 1021, 0.05);
  ball(x, y, 2.6, 1022, PAT.d, 0.8);
}
function calendar(day, flip) {
  const x = 1505, y = 330;
  line([x, y - 52], [x, y - 60], 1, 1030); ball(x, y - 62, 2.5, 1031, PAT.d, 0.6);
  shape(R(x - 34, y - 52, 68, 92), { lw: 1.4, id: 1032, fill: P2, sh: R(x + 22, y - 52, 12, 92), sh2: [Math.PI / 2, 2.4, 0.5] });
  shape(R(x - 34, y - 52, 68, 18), { lw: 1.2, id: 1033, fill: P.ink }); mtxt('CONGRESS', x, y - 43, 8, { col: P2, bold: true });
  mtxt(String(day), x, y - 2, 32, { bold: true }); mtxt('DAY', x, y + 28, 8);
  if (flip > 0 && flip < 1) { const h = 74 * (1 - flip); X.save(); X.globalAlpha = 1 - flip * 0.6; shape([[x - 34, y - 34], [x + 34, y - 34], [x + 34 + flip * 14, y - 34 - h * 0.2 - flip * 30], [x - 34 - flip * 8, y - 34 - h * 0.2 - flip * 30]], { lw: 1, id: 1034, fill: P2 }); X.restore(); }
}
function windowArch(W_, o = {}) {
  const { cx, w, top, bot } = W_, r = w / 2, x0 = cx - r, x1 = cx + r;
  const pts = [[x0, bot], [x0, top + r]]; for (let i = 0; i <= 12; i++) { const a = Math.PI + i / 12 * Math.PI; pts.push([cx + Math.cos(a) * r, top + r + Math.sin(a) * r]); } pts.push([x1, bot]);
  const outer = pts.map(([x, y]) => [x + (x - cx) * 0.22, y - (y < top + r ? (top + r - y) * 0.22 : 0) + (y === bot ? 8 : 0)]);
  shape(outer, { lw: 1.4, id: 1040 + cx, fill: P2, h: [0.6, 4, 0.4] });
  shape(pts, { lw: 1.8, id: 1050 + cx, fill: o.night ? '#cfc6ae' : P2 });
  X.save(); path(pts); X.clip(); hatch(-0.9, 14, 0.5, [x0, top, x1, bot]); X.restore();
  line([cx, top], [cx, bot], 1.4, 1060 + cx, 0.1); for (let k = 1; k < 4; k++) line([x0, top + r + k * (bot - top - r) / 4], [x1, top + r + k * (bot - top - r) / 4], 1.1, 1070 + cx + k, 0.1);
  shape(R(x0 - 10, bot, w + 20, 9), { lw: 1.2, id: 1080 + cx, fill: P.paper, h: [0, 3, 0.5] });
}
function greatDoors(open) {
  const { cx, w, h } = GREAT, x0 = cx - w / 2, top = FL - h;
  shape([[x0 - 26, FL], [x0 - 26, top - 16], [x0 + w + 26, top - 16], [x0 + w + 26, FL]], { lw: 1.6, id: 1100, fill: P.paper, h: [Math.PI / 2, 5, 0.5] });
  shape([[x0 - 38, top - 16], [cx, top - 64], [x0 + w + 38, top - 16]], { lw: 1.6, id: 1101, fill: P2, h: [0, 4, 0.4] });
  ball(cx, top - 34, 8, 1102, PAT.f, 1);
  // beyond the doors: the vestibule, lit
  shape(R(x0, top, w, h), { lw: 1.4, id: 1103, fill: P2 });
  X.save(); path(R(x0, top, w, h)); X.clip(); shape([[x0 + 30, FL - 20], [x0 + w - 30, FL - 20], [x0 + w - 30, top + 40], [x0 + 30, top + 40]], { lw: 0.8, id: 1104, fill: '#fbf6e6' }); line([x0, FL - 20], [x0 + w, FL - 20], 0.8, 1105); line([x0, top], [x0 + 30, top + 40], 0.7, 1106); line([x0 + w, top], [x0 + w - 30, top + 40], 0.7, 1107); line([x0, FL], [x0 + 30, FL - 20], 0.7, 1108); line([x0 + w, FL], [x0 + w - 30, FL - 20], 0.7, 1109); X.restore();
  const hw = w / 2, s = 1 - 0.8 * open;
  for (const d of [-1, 1]) {
    const hx = d < 0 ? x0 : x0 + w, ex = hx - d * hw * s, sk = open * 14;
    const leaf = [[hx, top], [ex, top + sk], [ex, FL + sk * 0.3], [hx, FL]];
    shape(leaf, { lw: 1.6, id: 1110 + d, fill: P.paper, h: d > 0 ? [Math.PI / 2, 3.2, 0.5] : null });
    if (s > 0.35) for (let k = 0; k < 3; k++) { const yy = top + 18 + k * 82; const a = lerp(hx, ex, 0.18), b = lerp(hx, ex, 0.82); shape([[a, yy + sk * 0.2], [b, yy + sk * 0.8], [b, yy + 70 + sk * 0.6], [a, yy + 70]], { lw: 0.9, id: 1120 + k + d * 5, fill: null }); }
    if (s > 0.6) ball(ex + d * 8, top + h * 0.52, 4, 1130 + d, PAT.f, 0.8);
  }
}
function plainDoor(open, light) {
  const { cx, w, h } = PLAIN, x0 = cx - w / 2, top = FL - h;
  shape(R(x0 - 4, top - 4, w + 8, h + 4), { lw: 0.9, id: 1150, fill: P.paper });
  if (open > 0) { shape(R(x0, top, w, h), { lw: 0, fill: light ? '#fbf6e6' : P2 }); }
  const s = 1 - 0.85 * open;
  shape([[x0, top], [x0 + w * s, top + open * 6], [x0 + w * s, FL - open * 2], [x0, FL]], { lw: 1.1, id: 1151, fill: P.paper, h: [Math.PI / 2, 5.5, 0.35] });
  if (s > 0.5) ball(x0 + w * s - 9, top + h * 0.55, 2.6, 1152, PAT.f, 0.7);
}
function bayNiche(cx) {
  const x0 = cx - 60, x1 = cx + 60, top = 360, r = 60;
  const pts = [[x0, FL], [x0, top + r]]; for (let i = 0; i <= 12; i++) { const a = Math.PI + i / 12 * Math.PI; pts.push([cx + Math.cos(a) * r, top + r + Math.sin(a) * r]); } pts.push([x1, FL]);
  shape(pts, { lw: 1.5, id: 1200 + cx, fill: P.paper, h: [[0.7, 4.2, 0.55], [-0.7, 7, 0.4]] });
  ink([[x0 - 8, FL], [x0 - 8, top + r], ...pts.slice(2, 15).map(([x, y]) => [cx + (x - cx) * 1.13, top + r + (y - top - r) * 1.13]), [x1 + 8, top + r], [x1 + 8, FL]], 1, 1210 + cx, 0.4);
}
function dais() {
  shape([[350, FL - 2], [1360, FL - 2], [1372, FL + 16], [338, FL + 16]], { lw: 1.4, id: 1250, fill: P.paper, h: [Math.PI / 2, 4, 0.5] });
}
function rostrum() {
  const x0 = ROST.cx - 64, w = 128, top = ROST.top;
  shape(R(x0, top, w, FL + 16 - top), { lw: 1.8, id: 1260, fill: P.paper, sh: R(x0 + w - 30, top, 30, FL + 16 - top), sh2: [Math.PI / 2, 2.6, 0.7] });
  shape(R(x0 - 8, top - 8, w + 16, 12), { lw: 1.5, id: 1261, fill: P.paper, h: [0, 2.6, 0.6] });
  shape(R(x0 + 18, top + 22, w - 36, FL - top - 40), { lw: 1, id: 1262, fill: null });
  // the Ministry's mark: a sentence becoming a house
  const ex = ROST.cx, ey = top + 66;
  shape([[ex - 22, ey + 22], [ex - 22, ey - 4], [ex, ey - 22], [ex + 22, ey - 4], [ex + 22, ey + 22]], { lw: 1.4, id: 1263, fill: P2 });
  for (let k = 0; k < 3; k++) line([ex - 16, ey + 2 + k * 7], [ex + 16, ey + 2 + k * 7], 0.8, 1264 + k, 0.1);
}
function bell_(x, y, s = 1, id = 1270, ang = 0) {
  X.save(); X.translate(x, y); X.rotate(ang); X.scale(s, s);
  line([0, -18], [0, -9], 2.6, id, 0.05); ball(0, -20, 3, id + 1, PAT.d, 0.6);
  shape([[-5, -9], [5, -9], [9, 2], [11, 6], [-11, 6], [-9, 2]], { lw: 1.2, id: id + 2, fill: P.paper, h: [0.8, 2.2, 0.6] });
  X.restore();
}

/* ================= the Edifier (the same machine in all four films) ================= */
function edifier(x, o = {}) {
  const b = FL, id = 1300 + x;
  // funnel
  shape([[x - 12, b - 250], [x + 12, b - 250], [x + 28, b - 292], [x - 28, b - 292]], { lw: 1.4, id: id + 1, fill: P.paper, h: [1.2, 3, 0.5] });
  ell(x, b - 292, 28, 5, P2, 1.2);
  // cabinet
  shape(R(x - 34, b - 250, 68, 246), { lw: 1.8, id: id + 2, fill: P.paper, sh: R(x + 12, b - 250, 22, 246), sh2: [Math.PI / 2, 2.4, 0.7] });
  line([x - 34, b - 238], [x + 34, b - 238], 0.8, id + 3);
  // the dial, its only face
  ball(x, b - 178, 11, id + 4, PAT.f, 1.2); circ(x, b - 178, 8, id + 5, 0.2); X.fillStyle = P2; X.fill();
  const na = -2.4 + (o.speak || 0) * 1.6 + (o.keys ? Math.sin(GT * 31) * 0.25 : 0);
  line([x, b - 178], [x + Math.cos(na) * 7, b - 178 + Math.sin(na) * 7], 1.1, id + 6, 0.02, RED);
  // paper slot, and the paper coming out of it
  shape(R(x - 22, b - 214, 44, 5), { lw: 0.9, id: id + 7, fill: P.ink });
  if (o.paper > 0) {
    const ph = 8 + 46 * o.paper; shape(R(x - 19, b - 212 - ph, 38, ph), { lw: 0.8, id: id + 8, fill: P2 });
    if (o.text) { const ln = wrapTxt(o.text, 32, `5px ${MONO}`); let left = Math.floor(o.text.length * clamp(o.paper * 1.15)); X.font = `5px ${MONO}`; X.textAlign = 'left'; X.textBaseline = 'middle'; X.fillStyle = P.ink;
      ln.forEach((s, k) => { if (left <= 0) return; X.fillText(s.slice(0, left), x - 16, b - 212 - ph + 7 + k * 6.5); left -= s.length + 1; }); }
  }
  // keyboard at chest height
  shape([[x - 42, b - 128], [x + 42, b - 128], [x + 34, b - 146], [x - 34, b - 146]], { lw: 1.3, id: id + 9, fill: P2, h: [0, 2.2, 0.4] });
  for (let r = 0; r < 3; r++) for (let c = 0; c < 7; c++) {
    const kx = x - 28 + c * 9.3 + r * 1.5, ky = b - 141 + r * 5.2, down = o.keys && hash(c + r * 7, Math.floor(GT * 12)) > 0.78;
    X.beginPath(); X.ellipse(kx, ky + (down ? 1 : 0), 3, 1.8, 0, 0, 6.2832); X.fillStyle = down ? P.ink : P.paper; X.fill(); X.lineWidth = 0.7; X.strokeStyle = P.ink; X.stroke();
  }
  // drawers
  for (let k = 0; k < 3; k++) { shape(R(x - 28, b - 108 + k * 34, 56, 28), { lw: 1.1, id: id + 20 + k, fill: P.paper }); ball(x, b - 94 + k * 34, 2.6, id + 25 + k, PAT.f, 0.7); }
  shape(R(x - 14, b - 232, 28, 8), { lw: 0.7, id: id + 30, fill: P2 }); mtxt('EDIFIER', x, b - 228, 4.4);
  shape(R(x - 36, b - 4, 10, 6), { lw: 0.8, id: id + 31, fill: P.ink }); shape(R(x + 26, b - 4, 10, 6), { lw: 0.8, id: id + 32, fill: P.ink });
  if (o.hum) for (let k = 0; k < 3; k++) { const u = (GT * 0.9 + k / 3) % 1; X.save(); X.globalAlpha = (1 - u) * 0.7; X.beginPath(); X.ellipse(x, b - 296 - u * 34, 18 + u * 26, 3 + u * 4, 0, 0, 6.2832); X.lineWidth = 0.8; X.strokeStyle = P.ink; X.stroke(); X.restore(); }
}

/* ================= letters become bricks: the series' signature ================= */
const NB = 44;   // 17 courses on each jamb, 10 across the lintel; build_sound.py uses the same count
function bricks(cx, base, w = DW, h = DH) {
  const out = [], bw = 12, bh = h / 17;
  for (let k = 0; k < 17; k++) { out.push([cx - w / 2 - bw, base - (k + 1) * bh, bw, bh]); out.push([cx + w / 2, base - (k + 1) * bh, bw, bh]); }
  const lw = (w + 2 * bw) / 10; for (let k = 0; k < 10; k++) out.push([cx - w / 2 - bw + k * lw, base - h - 13, lw, 13]);
  return out;
}
const letterSeq = (s) => s.toUpperCase().replace(/ /g, '\u00b7').replace(/[^A-Z.\u00b7]/g, '');
/* which letter each brick carries: the lintel reads the start of the sentence, the jambs carry on from there */
const brickChar = (L_, i) => L_[(i >= 34 ? i - 34 : i + 10) % L_.length];
const landT = (c, i) => c.at + 0.7 + i * (c.to - c.at - 0.7) / (NB - 1);
function brick(b, ch, id, alpha = 1, col = P.ink) {
  if (alpha <= 0) return; const [x, y, w, h] = b;
  X.save(); X.globalAlpha *= alpha;
  shape(R(x, y, w, h), { lw: 0.8, id, fill: P2, amp: 0.25 });
  if (hash(id, 3) > 0.55) hatchIn(R(x, y, w, h), 0.9, 2.6, 0.4);
  mtxt(ch, x + w / 2, y + h / 2 + 0.5, Math.min(9, h * 0.75), { col, bold: true });
  X.restore();
}
/* the frame, built or building. bc = {fall, lt, src:[x,y]} while building; null when it is simply there */
function frame(cx, base, sent, id, bc, o = {}) {
  const bs = bricks(cx, base, o.w || DW, o.h || DH), L_ = letterSeq(sent);
  for (let i = 0; i < NB; i++) {
    const b = bs[i], ch = brickChar(L_, i);
    if (!bc) { brick(b, ch, id + i, o.alpha ?? 1); continue; }
    const tl = landT(bc.fall, i), t0 = Math.max(bc.fall.at, tl - 0.6), u = (bc.lt - t0) / (tl - t0);
    if (u >= 1) brick(b, ch, id + i, o.alpha ?? 1);
    else if (u > 0) {
      const [sx, sy] = bc.src, ex = b[0] + b[2] / 2, ey = b[1] + b[3] / 2, e = E.in(u);
      const x = lerp(sx, ex, E.io(u)), y = lerp(sy, ey, e) - Math.sin(Math.PI * u) * 70;
      X.save(); X.translate(x, y); X.rotate((1 - u) * 3 * (hash(i, 9) - 0.5)); mtxt(ch, 0, 0, 11, { bold: true }); X.restore();
    }
  }
}
function plate(cx, y, s, w, size = 5.2) {
  shape(R(cx - w / 2, y - 6, w, 12), { lw: 0.8, id: 1400 + cx, fill: '#e2d4ad', h: [0.6, 2.4, 0.3] });
  shape(R(cx - w / 2 + 2, y - 4, w - 4, 8), { lw: 0, fill: '#efe5c6' });
  ftxt(s, cx, y + 0.3, size, { italic: true, col: RED });
}

/* the Objectist's door: an object. six panels, a carved lintel, a brass knob, no hinges */
function doorObject(cx, base, o = {}) {
  const x0 = cx - DW / 2, top = base - DH, a = o.leaf ?? 1;
  if (a > 0) {
    X.save(); X.globalAlpha *= a;
    shape([[cx - 76, top - 13], [cx, top - 58], [cx + 76, top - 13]], { lw: 1.6, id: 1500, fill: P2, h: [0, 3.4, 0.4] });
    line([cx - 82, top - 13], [cx + 82, top - 13], 2, 1501, 0.2);
    ball(cx, top - 32, 9, 1502, PAT.f, 1.1); for (let k = 0; k < 8; k++) { const q = k / 8 * 6.2832; line([cx + Math.cos(q) * 4, top - 32 + Math.sin(q) * 4], [cx + Math.cos(q) * 8, top - 32 + Math.sin(q) * 8], 0.7, 1503 + k, 0.05); }
    shape(R(x0, top, DW, DH), { lw: 2, id: 1510, fill: P.paper, sh: R(x0 + DW * 0.72, top, DW * 0.28, DH), sh2: [Math.PI / 2, 2.6, 0.6] });
    for (let r = 0; r < 3; r++) for (let c = 0; c < 2; c++) {
      const px = x0 + 10 + c * 40, py = top + 12 + r * 64, pw = 32, ph = r === 1 ? 52 : 54;
      shape(R(px, py, pw, ph), { lw: 1.2, id: 1520 + r * 2 + c, fill: P2 });
      shape(R(px + 6, py + 6, pw - 12, ph - 12), { lw: 0.9, id: 1530 + r * 2 + c, fill: P.paper, h: c ? [0.8, 3, 0.4] : null });
      for (const [p, q] of [[[px, py], [px + 6, py + 6]], [[px + pw, py], [px + pw - 6, py + 6]], [[px, py + ph], [px + 6, py + ph - 6]], [[px + pw, py + ph], [px + pw - 6, py + ph - 6]]]) line(p, q, 0.6, 1540, 0.05);
    }
    ball(x0 + DW - 13, top + 112, 6, 1550, PAT.m, 1.1); ball(x0 + DW - 13, top + 112, 2, 1551, PAT.d, 0.5);
    plate(cx, top + 84, 'A door is an object.', 60, 5.6);
    X.restore();
  }
  if (o.ghost > 0) {   // where the hinges would be, in red: there are none
    X.save(); X.globalAlpha = o.ghost;
    for (const hy of [top + 22, top + 98, top + 172]) { dashRect(x0 - 5, hy, 11, 22, RED, 1.8); line([x0 - 9, hy + 11], [x0 - 16, hy + 11], 1.2, 1560 + hy, 0.1, RED); }
    X.setLineDash([5, 4]); X.lineWidth = 1.6; X.strokeStyle = RED; X.beginPath(); X.ellipse(x0, base + 6, DW, 16, 0, 0, Math.PI * 0.5); X.stroke(); X.setLineDash([]);
    X.restore();
  }
}
/* the Transitionist's door: a passage and nothing else. no frame, no wall, no door: a door-shaped absence */
const ABS = { cx: BAYX.B, base: FL + 14 };
function absenceShape() { return R(ABS.cx - DW / 2, ABS.base - DH, DW, DH); }
function doorAbsence(a = 1) {
  if (a <= 0) return;
  X.save(); X.globalAlpha *= a; path(absenceShape()); X.fillStyle = '#f7f2e3'; X.fill(); X.restore();
}
function absencePlate(a) { if (a <= 0) return; X.save(); X.globalAlpha *= a; X.translate(ABS.cx + 62, FL + 34); X.rotate(0.08); X.scale(1, 0.55); plate(0, 0, 'A door is a passage.', 58, 5.4); X.restore(); }
/* the Conventionalist's door: an agreement. grille, credential slot, hinges (it does open, for some) */
function doorConvention(cx, base, o = {}) {
  const x0 = cx - DW / 2, top = base - DH, a = o.leaf ?? 1, op = o.open || 0;
  if (a <= 0) return; X.save(); X.globalAlpha *= a;
  if (op > 0) { // the corridor beyond
    shape(R(x0, top, DW, DH), { lw: 1, id: 1600, fill: '#d8ceb4', h: [[0, 2.6, 0.6], [1.2, 5, 0.4]] });
    shape([[x0, base], [x0 + DW, base], [x0 + DW - 18, base - 30], [x0 + 18, base - 30]], { lw: 0.6, id: 1601, fill: P2 });
  }
  const s = 1 - 0.86 * op, ex = x0 + DW * s, sk = op * 10;
  const leaf = [[x0, top], [ex, top + sk], [ex, base - sk * 0.4], [x0, base]];
  shape(leaf, { lw: 1.9, id: 1610, fill: P.paper, h: op > 0.05 ? [Math.PI / 2, 2.4, 0.6] : null });
  if (s > 0.6) {
    for (let r = 0; r < 2; r++) { const py = top + (r ? 118 : 62); shape(R(x0 + 12, py, DW - 24, r ? 72 : 46), { lw: 1, id: 1620 + r, fill: P2 }); }
    // grille at head height, with a shutter and a sign behind it
    const gx = cx - 18, gy = top + 18, gw = 36, gh = 26;
    shape(R(gx - 3, gy - 3, gw + 6, gh + 6), { lw: 1.2, id: 1630, fill: '#e2d4ad' });
    shape(R(gx, gy, gw, gh), { lw: 0.9, id: 1631, fill: '#2f2923' });
    const sh_ = o.shutter || 0;
    if (sh_ > 0 && o.sign) { X.save(); path(R(gx, gy, gw, gh)); X.clip(); shape(R(gx + 1, gy + gh * (1 - sh_) - 2, gw - 2, gh - 2), { lw: 0.8, id: 1632, fill: '#efe5c6' }); const ln = o.sign.split('|'); ln.forEach((t, k) => mtxt(t, cx, gy + gh * (1 - sh_) + 6 + k * 8 - (ln.length - 1) * 2, 5.4, { col: RED, bold: true })); X.restore(); }
    for (let k = 1; k < 5; k++) line([gx + k * gw / 5, gy], [gx + k * gw / 5, gy + gh], 1.1, 1633 + k, 0.05);
    shape(R(cx + 18, top + 104, 14, 4), { lw: 0.8, id: 1640, fill: P.ink });   // credential slot
    ball(x0 + DW - 12, top + 112, 4.5, 1641, PAT.m, 1);
    plate(cx, top + 56, 'A door is an agreement about who may pass.', 84, 4.2);
  }
  for (const hy of [top + 20, top + 100, top + 178]) shape(R(x0 - 3, hy, 7, 18), { lw: 0.8, id: 1650 + hy, fill: P.ink });
  X.restore();
}
/* the Encounterist's door: planks, iron straps, a ring. always closed. drawn into any opening at (cx, base, w, h) */
function doorEncounter(cx, base, w, h, ap, lt0, id = 1700) {
  // ap: 0..1 assembling (letters rush in), then >1 present; negative: dispersing (-1..0)
  if (ap === 0) return;
  const sx = w / DW, sy = h / (DH + 13);
  X.save(); X.translate(cx, base); X.scale(sx, sy);
  const L_ = letterSeq('No door exists until someone tries to pass.'), bs = bricks(0, 0);
  const u = ap > 0 ? clamp(ap) : 1 + ap;   // how much of it is there
  const leafA = ap > 0 ? seg(ap, 0.75, 1) : clamp(1 + ap * 2.2);
  if (leafA > 0) {
    X.save(); X.globalAlpha *= leafA;
    shape(R(-DW / 2, -DH, DW, DH), { lw: 2.2, id, fill: P.paper, h: [Math.PI / 2, 2.3, 0.45] });
    for (let k = 1; k < 6; k++) line([-DW / 2 + k * DW / 6, -DH + 2], [-DW / 2 + k * DW / 6, -2], 1, id + k, 0.3);
    for (const yy of [-DH + 34, -64]) { shape(R(-DW / 2 + 2, yy, DW - 4, 9), { lw: 1, id: id + 10 + yy, fill: P.ink }); for (let k = 0; k < 5; k++) ball(-DW / 2 + 10 + k * 18, yy + 4.5, 1.6, id + 20 + k, PAT.f, 0.4); }
    circ(DW / 2 - 18, -DH * 0.5, 9, id + 30, 0.3); X.lineWidth = 2.4; X.strokeStyle = P.ink; X.stroke(); ball(DW / 2 - 18, -DH * 0.5 - 9, 3, id + 31, PAT.d, 0.6);
    X.save(); X.translate(0, -DH + 62); plate(0, 0, 'No door exists until someone tries to pass.', 84, 4.2); X.restore();
    X.restore();
  }
  for (let i = 0; i < NB; i++) {
    const b = bs[i], ch = brickChar(L_, i);
    const r0 = 260 + hash(i, id) * 220, q = hash(i, id + 1) * 6.2832;
    const k = ap > 0 ? clamp((u - hash(i, 5) * 0.3) / 0.7) : u;
    if (k >= 1) brick(b, ch, id + 40 + i);
    else if (k > 0) { const e = ap > 0 ? E.out(k) : k; const x = lerp(b[0] + b[2] / 2 + Math.cos(q) * r0, b[0] + b[2] / 2, e), y = lerp(b[1] + b[3] / 2 + Math.sin(q) * r0 * 0.6, b[1] + b[3] / 2, e); X.save(); X.globalAlpha *= ap > 0 ? 1 : k; mtxt(ch, x, y, 11, { bold: true }); X.restore(); }
  }
  X.restore();
}

/* ================= the people: five silhouettes you can tell apart at a glance ================= */
/* o: f facing (-1 left, 0 front, 1 right), walk 0/1, ph walk phase, mouth 0..1, arm 'down'|'up'|'push'|'card'|'hold'|'fold'|'mop'|'bell',
   beard 0..1 growth, hair 0..1 undone, sleep 0/1, look -1..1 eyes */
const HEADY = { O: -176, T: -168, V: -126, K: -160, C: -158, L: -152 };
const headAt = (k, x, y, s = 1) => [x, y + HEADY[k] * s];
function face(r, o, id, extra = {}) {
  const f = o.f || 0, lk = (o.look ?? f) * r * 0.25, cl = o.sleep || o.closed;
  const ex = r * 0.38;
  if (cl) { line([-ex - 3 + lk, -2], [-ex + 3 + lk, -2], 1.2, id, 0.05); line([ex - 3 + lk, -2], [ex + 3 + lk, -2], 1.2, id + 1, 0.05); }
  else { X.fillStyle = P.ink; X.fillRect(-ex - 1.4 + lk, -4 + (o.lookY || 0), 2.8, 3.2); X.fillRect(ex - 1.4 + lk, -4 + (o.lookY || 0), 2.8, 3.2); }
  if (extra.brow) { line([-ex - 5 + lk, -8 - extra.brow], [-ex + 4 + lk, -6], 2, id + 2, 0.05); line([ex - 4 + lk, -6], [ex + 5 + lk, -8 - extra.brow], 2, id + 3, 0.05); }
  if (f) line([lk * 1.6, -1], [lk * 1.6 + f * (extra.nose || 4), 3], 1.1, id + 4, 0.05); else line([0, -1], [0, 3], 1, id + 4, 0.05);
  const m = o.mouth || 0; if (m > 0.06) ell(lk * 1.2, r * 0.5, 3, 1 + m * 3, P.ink, 0.6); else line([-3 + lk * 1.2, r * 0.5], [3 + lk * 1.2, r * 0.5], 1, id + 5, 0.05);
}
function legsPair(o, hip, len, w, id, foot = 7) {
  const ph = o.ph || 0, wk = o.walk || 0;
  for (const k of [-1, 1]) {
    const q = ph + (k > 0 ? Math.PI : 0), sw = Math.sin(q) * 11 * wk, lift = Math.max(0, Math.cos(q)) * 5 * wk;
    const fx = k * 5 + sw, fy = -lift;
    if (w > 4) cap(k * 5, hip, fx, fy - 4, w, id + k); else line([k * 5, hip], [fx, fy - 4], 2, id + k, 0.2);
    X.beginPath(); X.ellipse(fx + (o.f || 0) * 4, fy - 2, foot, 3.4, 0, Math.PI, 0); X.fillStyle = P.ink; X.fill();
  }
}
function arm(sx, sy, pose, side, o, id, w = 2.2, len = 1) {
  const f = o.f || 0; let hx, hy, ex, ey;
  const L1 = 30 * len, L2 = 30 * len;
  if (pose === 'up' && side > 0) { ex = sx + 6; ey = sy - L1; hx = sx + 10; hy = ey - L2; }
  else if (pose === 'push') { const d = f || side; ex = sx + d * 18; ey = sy + 14; hx = sx + d * 40; hy = sy + 6; }
  else if (pose === 'card' && side > 0) { const d = f || 1; ex = sx + d * 20; ey = sy + 16; hx = sx + d * 44; hy = sy + 2; }
  else if (pose === 'hold') { ex = sx + side * 6; ey = sy + L1 * 0.9; hx = sx - side * 8; hy = sy + L1 * 1.2; }
  else if (pose === 'bell' && side > 0) { ex = sx + 16; ey = sy + 10; hx = sx + 20 + Math.sin(GT * 30) * 4; hy = sy - 16; }
  else { const sw = Math.sin((o.ph || 0) + (side > 0 ? 0 : Math.PI)) * 8 * (o.walk || 0); ex = sx + side * 4 + sw * 0.5; ey = sy + L1; hx = sx + side * 6 + sw; hy = sy + L1 + L2 * 0.95; }
  ink([[sx, sy], [ex, ey], [hx, hy]], w, id, 0.2);
  ball(hx, hy, 3.4, id + 1, PAT.f, 0.8);
  return [hx, hy];
}
function person(k, x, y, o = {}) {
  if (SILENT) return;
  const s = o.s || 1, wk = o.walk || 0, bob = -Math.abs(Math.sin(o.ph || 0)) * 2.2 * wk;
  X.save(); X.translate(x, y + bob); X.scale(s, s); if (o.alpha != null) X.globalAlpha *= o.alpha;
  if (o.sleep) X.translate(0, 0);
  const id = 2000 + k.charCodeAt(0) * 50, f = o.f || 0, pose = o.arm || 'down';
  const head = (hy, r, extra = {}, after) => {
    X.save(); X.translate(0, hy + (o.sleep ? 26 : 0)); if (o.sleep) X.rotate(0.35);
    ball(0, 0, r, id + 9, PAT.f, 1.6); if (extra.pre) extra.pre(); face(r, o, id + 10, extra); if (after) after(); X.restore();
  };
  if (k === 'O') {          // the Objectist: tall, columnar, a high bun, pince-nez
    legsPair(o, -10, 10, 2, id, 6);
    shape([[-23, -3], [23, -3], [15, -112], [-15, -112]], { lw: 1.8, id: id + 1, fill: P.paper, sh: [[6, -112], [16, -112], [23, -3], [8, -3]], sh2: [1.55, 2.4, 0.6] });
    for (let i = -2; i <= 2; i++) line([i * 7, -6], [i * 4.6, -108], 0.6, id + 20 + i, 0.3);
    shape([[-15, -112], [15, -112], [13, -150], [-13, -150]], { lw: 1.6, id: id + 2, fill: P.ink });
    ink([[-11, -150], [-8, -158], [-4, -152], [0, -159], [4, -152], [8, -158], [11, -150]], 1.1, id + 3, 0.2);
    arm(-13, -146, pose, -1, o, id + 30, 2.4); arm(13, -146, pose, 1, o, id + 33, 2.4);
    const hr = o.hair || 0;
    head(HEADY.O, 13, { nose: 5, pre: () => { if (hr > 0.05) for (let i = 0; i < 9; i++) ink([[-10 + i * 2.5, -8], [-14 + i * 3.5 + Math.sin(i) * 2, 10 + hr * 26]], 1, id + 40 + i, 0.6); } }, () => {
      // pince-nez on a ribbon
      circ(-5 + (o.f || 0) * 3, -2.5, 3.6, id + 50, 0.1); X.lineWidth = 0.9; X.strokeStyle = P.ink; X.stroke(); circ(5 + (o.f || 0) * 3, -2.5, 3.6, id + 51, 0.1); X.stroke();
      if (hr < 0.95) { ball(0, -20 + hr * 18, 9 * (1 - hr * 0.6), id + 52, PAT.d, 1.2); line([-12, -24 + hr * 18], [12, -18 + hr * 18], 1.1, id + 53, 0.05); }
      X.save(); X.beginPath(); X.arc(0, -2, 13.5, Math.PI * 1.05, Math.PI * 1.95); X.lineWidth = 4; X.strokeStyle = P.ink; X.stroke(); X.restore();
    });
  } else if (k === 'T') {   // the Transitionist: thin, long-legged, leaning into a step he has not taken, a long scarf
    X.rotate((f || 0) * 0.07);
    legsPair(o, -88, 84, 2, id, 9);
    shape([[-13, -152], [13, -152], [21, -60], [5, -56], [0, -76], [-5, -56], [-21, -60]], { lw: 1.6, id: id + 1, fill: P.paper, h: [1.9, 3.4, 0.55] });
    line([0, -150], [0, -78], 0.8, id + 2); ball(-3, -128, 1.5, id + 3, PAT.d, 0.4); ball(-3, -112, 1.5, id + 4, PAT.d, 0.4);
    const sd = -(f || 1), fl = Math.sin(GT * 4 + x * 0.01) * 4;
    ink([[-4, -150], [sd * 10, -146], [sd * 22, -130 + fl], [sd * 30, -112 - fl], [sd * 34, -96 + fl]], 5, id + 5, 0.3);
    ink([[-4, -150], [sd * 10, -146], [sd * 22, -130 + fl], [sd * 30, -112 - fl], [sd * 34, -96 + fl]], 2, id + 6, 0.2, P.paper);
    arm(-12, -146, pose, -1, o, id + 30, 2, 1.12); arm(12, -146, pose, 1, o, id + 33, 2, 1.12);
    line([0, -152], [0, -156], 3, id + 7);
    head(HEADY.T, 12, { nose: 8 }, () => {
      for (const d of [-1, 1]) for (let i = 0; i < 3; i++) line([d * 11, -4 + i * 3], [d * 16, -7 + i * 4], 1, id + 60 + i + d * 3, 0.1);
      circ(-4.5 + (o.f || 0) * 3, -2.5, 3.4, id + 66, 0.1); X.lineWidth = 1; X.strokeStyle = P.ink; X.stroke(); circ(4.5 + (o.f || 0) * 3, -2.5, 3.4, id + 67, 0.1); X.stroke();
      const bd = o.beard || 0; if (bd > 0.05) shape([[-8, 5], [8, 5], [2 + (o.f || 0) * 3, 8 + bd * 26], [-2 + (o.f || 0) * 3, 8 + bd * 26]], { lw: 0.8, id: id + 68, fill: P.paper, h: [1.5, 1.8, 0.6] });
    });
  } else if (k === 'V') {   // the Conventionalist: short and round, a neat flat hat, a ledger
    legsPair(o, -34, 30, 4, id, 7);
        X.beginPath(); X.ellipse(0, -72, 30, 42, 0, 0, 6.2832); X.fillStyle = P.paper; X.fill(); X.save(); X.clip(); hatch(0.3, 2.2, 0.7, [-32, -116, 32, -28]); X.restore(); X.beginPath(); X.ellipse(0, -72, 30, 42, 0, 0, 6.2832); X.lineWidth = 1.8; X.strokeStyle = P.ink; X.stroke();
    shape([[-9, -112], [9, -112], [6, -96], [-6, -96]], { lw: 1, id: id + 2, fill: P.paper });
    for (let i = 0; i < 4; i++) ball(0, -88 + i * 12, 1.8, id + 3 + i, PAT.f, 0.5);
    arm(-24, -100, pose, -1, o, id + 30, 3, 0.85); const [hx, hy] = arm(24, -100, pose === 'down' ? 'hold' : pose, 1, o, id + 33, 3, 0.85);
    if (o.ledger !== false && pose !== 'up' && pose !== 'card') shape(R(18, -96, 12, 34), { lw: 1, id: id + 40, fill: P.ink });
    head(HEADY.V, 13, { nose: 3 }, () => {
      X.save(); X.rotate((o.hat || 0) * 0.35);
      ell(0, -11, 21, 4, P.paper, 1.3); shape(R(-12, -25, 24, 14), { lw: 1.3, id: id + 41, fill: P.paper, h: [0, 2, 0.5] }); shape(R(-12, -15, 24, 4), { lw: 0.8, id: id + 42, fill: P.ink });
      X.restore();
      ball(-7, 5, 2.6, id + 43, PAT.f, 0); ball(7, 5, 2.6, id + 44, PAT.f, 0);
    });
  } else if (k === 'K') {   // the Encounterist: a block, arms folded, a beard
    for (const d of [-1, 1]) { const q = (o.ph || 0) + (d > 0 ? Math.PI : 0), sw = Math.sin(q) * 6 * wk; shape(R(d * 14 - 9 + sw, -54, 18, 50), { lw: 1.4, id: id + 1 + d, fill: P.paper, h: [Math.PI / 2, 3, 0.6] }); X.beginPath(); X.ellipse(d * 14 + sw + (f || 0) * 4, -3, 11, 4, 0, Math.PI, 0); X.fillStyle = P.ink; X.fill(); }
    shape([[-42, -52], [42, -52], [38, -146], [-38, -146]], { lw: 2, id: id + 3, fill: P.ink });
    shape([[-36, -146], [36, -146], [24, -154], [-24, -154]], { lw: 1.2, id: id + 4, fill: P.ink });
    if (pose === 'up') { arm(-34, -140, 'fold', -1, o, id + 30, 6); const t_ = o.raise ?? 1; cap(34, -140, 40, -140 - 38 * t_, 9, id + 35); cap(40, -140 - 38 * t_, 44, -140 - 74 * t_, 8, id + 36); ball(44, -140 - 76 * t_, 6, id + 37, PAT.f, 1); cap(-26, -108, 22, -110, 9, id + 38); ball(24, -110, 6, id + 39, PAT.f, 1); }
    else if (pose === 'push' || pose === 'card') { const d = f || 1; cap(30 * d, -136, 62 * d, -122, 9, id + 35); ball(64 * d, -122, 6, id + 37, PAT.f, 1); cap(-30 * d, -136, -6 * d, -110, 9, id + 38); ball(-4 * d, -108, 6, id + 39, PAT.f, 1); }
    else { cap(-30, -116, 30, -108, 10, id + 35); cap(30, -126, -26, -104, 10, id + 36); ball(-28, -104, 6, id + 37, PAT.f, 1); ball(32, -108, 6, id + 38, PAT.f, 1); }
    head(HEADY.K, 12, { brow: 2, nose: 4 }, () => {
      shape(R(-12, -14, 24, 5), { lw: 0.8, id: id + 50, fill: P.ink });
      const bd = o.beard || 0; shape([[-12, 3], [12, 3], [8 + (f || 0) * 2, 14 + bd * 24], [0, 26 + bd * 34], [-8 + (f || 0) * 2, 14 + bd * 24]], { lw: 1, id: id + 51, fill: P.ink });
      if (!o.sleep) { const m = o.mouth || 0; if (m > 0.06) ell((f || 0) * 3, 7, 3, 1 + m * 2.5, P.paper, 0.4); }
    });
  } else if (k === 'C') {   // the Chairman: an old man in a robe of office, with the chain and the bell
    legsPair(o, -20, 16, 3, id, 7);
    shape([[-24, -4], [24, -4], [19, -140], [-19, -140]], { lw: 1.8, id: id + 1, fill: P.paper, h: [Math.PI / 2 + 0.05, 2.2, 0.75] });
    shape([[-6, -140], [6, -140], [8, -4], [-8, -4]], { lw: 0.9, id: id + 2, fill: P.paper });
    for (let i = 0; i < 11; i++) { const a = Math.PI * (0.12 + i * 0.076); ball(Math.cos(a) * 18, -140 + Math.sin(a) * 24, 2.2, id + 3 + i, PAT.f, 0.6); }
    ball(0, -114, 5, id + 15, PAT.m, 1);
    arm(-17, -136, pose === 'bell' ? 'down' : pose, -1, o, id + 30, 3); const [hx, hy] = arm(17, -136, pose, 1, o, id + 33, 3);
    if (pose === 'bell' || o.holdBell) bell_(hx, hy + 8, 0.8, id + 40, pose === 'bell' ? Math.sin(GT * 30) * 0.5 : 0);
    if (pose === 'card') shape(R(hx - 2, hy - 12, 10, 16), { lw: 0.8, id: id + 45, fill: P2 });
    head(HEADY.C, 13, { nose: 4 }, () => {
      for (const d of [-1, 1]) for (let i = 0; i < 4; i++) { const a = d > 0 ? -0.6 + i * 0.32 : Math.PI + 0.6 - i * 0.32; ink([[Math.cos(a) * 12, Math.sin(a) * 12 - 2], [Math.cos(a) * 19, Math.sin(a) * 15 - 4], [Math.cos(a) * 17, Math.sin(a) * 18]], 1, id + 50 + i + d * 5, 0.4); }
      line([-8, 1], [-2, 1], 1.1, id + 60, 0.05); line([2, 1], [8, 1], 1.1, id + 61, 0.05);
      const bd = o.beard || 0; if (bd > 0.05) { X.save(); X.globalAlpha *= clamp(bd * 3); for (let i = 0; i < 7; i++) ink([[-9 + i * 3, 8], [-10 + i * 3.3 + Math.sin(i) * 1.5, 10 + bd * 38]], 1, id + 70 + i, 0.6); X.restore(); }
    });
  } else if (k === 'L') {   // the cleaner: headscarf, apron, a mop. never a delegate
    legsPair(o, -18, 14, 3, id, 7);
    shape([[-19, -4], [19, -4], [14, -112], [-14, -112]], { lw: 1.6, id: id + 1, fill: P.paper, h: [0.5, 3.4, 0.5] });
    shape([[-12, -96], [12, -96], [14, -20], [-14, -20]], { lw: 1.1, id: id + 2, fill: P2 });
    shape([[-14, -112], [14, -112], [12, -138], [-12, -138]], { lw: 1.4, id: id + 3, fill: P.paper, h: [0.5, 3.4, 0.5] });
    if (pose === 'mop') { const sw = Math.sin(GT * 3.2) * 12; ink([[-12, -132], [-4 + sw * 0.3, -104], [6 + sw * 0.5, -90]], 2.4, id + 30, 0.2); ink([[12, -132], [16, -110], [10 + sw * 0.5, -96]], 2.4, id + 31, 0.2); ball(8 + sw * 0.5, -92, 3.4, id + 32, PAT.f, 0.8);
      line([0 + sw * 0.4, -126], [24 + sw * 1.6, -4], 2.2, id + 33, 0.2); for (let i = 0; i < 9; i++) line([20 + sw * 1.6, -6], [12 + sw * 1.6 + i * 3, 2], 1.4, id + 34 + i, 0.4); }
    else { arm(-13, -134, pose, -1, o, id + 30, 2.4); const [hx, hy] = arm(13, -134, 'down', 1, o, id + 33, 2.4); if (o.mopHeld) { line([hx, hy - 50], [hx + 6, hy + 50], 2.2, id + 50, 0.2); for (let i = 0; i < 7; i++) line([hx + 6, hy + 46], [hx + i * 2.4, hy + 56], 1.3, id + 51 + i, 0.3); } }
    head(HEADY.L, 12, { nose: 3 }, () => {
      X.beginPath(); X.arc(0, -1, 13.5, Math.PI * 0.98, Math.PI * 2.02); X.lineTo(10, 6); X.lineTo(-10, 6); X.closePath(); X.fillStyle = P.paper; X.fill(); X.save(); X.clip(); hatch(0.8, 2.6, 0.6, [-14, -16, 14, 8]); X.restore(); X.beginPath(); X.arc(0, -1, 13.5, Math.PI * 0.98, Math.PI * 2.02); X.lineTo(10, 6); X.lineTo(-10, 6); X.closePath(); X.lineWidth = 1.2; X.strokeStyle = P.ink; X.stroke();
      shape([[-4, -14], [4, -14], [0, -20]], { lw: 0.9, id: id + 80, fill: P.ink });
    });
  }
  X.restore();
}
function bucket_(x, y, s = 1) { X.save(); X.translate(x, y); X.scale(s, s); shape([[-14, -26], [14, -26], [11, 0], [-11, 0]], { lw: 1.4, id: 2900, fill: P.paper, h: [Math.PI / 2, 2.6, 0.5] }); ell(0, -26, 14, 3.5, '#d5ccb4', 1); X.beginPath(); X.arc(0, -26, 14, Math.PI, 0); X.lineWidth = 1; X.strokeStyle = P.ink; X.stroke(); X.restore(); }

/* ================= the table, the tea, the night ================= */
function carafe(x, y, lvl, id) {
  X.save(); X.translate(x, y);
  const body = [[-5, -34], [5, -34], [6, -26], [12, -16], [12, -2], [-12, -2], [-12, -16], [-6, -26]];
  shape(body, { lw: 1.1, id, fill: '#f1ead6' });
  if (lvl > 0.02) { const wy = -2 - 26 * lvl; X.save(); path(body); X.clip(); shape(R(-14, wy, 28, -wy), { lw: 0, fill: '#ddd3ba', h: [0, 2.4, 0.4] }); line([-14, wy], [14, wy], 0.8, id + 1, 0.1); X.restore(); }
  line([-8, -22], [-8, -6], 0.8, id + 2, 0.05, P2);
  shape([[16, -14], [26, -14], [25, -2], [17, -2]], { lw: 0.9, id: id + 3, fill: '#f1ead6' });
  X.restore();
}
function nameCard(x, y, s) { shape([[x - 34, y], [x + 34, y], [x + 30, y - 18], [x - 30, y - 18]], { lw: 1, id: 3100 + x, fill: P2 }); mtxt(s, x, y - 9, 6.4, { bold: true }); }
function table_(S) {
  shape([[TABLE.x0, TABLE.y], [TABLE.x1, TABLE.y], [TABLE.x1 + 22, TABLE.y + 16], [TABLE.x0 - 22, TABLE.y + 16]], { lw: 1.6, id: 3000, fill: P.paper, h: [0, 3, 0.4] });
  const sk = [[TABLE.x0 - 22, TABLE.y + 16], [TABLE.x1 + 22, TABLE.y + 16], [TABLE.x1 + 22, TABLE.y + 96], [TABLE.x0 - 22, TABLE.y + 96]];
  shape(sk, { lw: 1.6, id: 3001, fill: P.paper });
  X.save(); path(sk); X.clip(); for (let i = 0; i < 40; i++) { const x = TABLE.x0 - 10 + i * 22; ink([[x, TABLE.y + 18], [x + 3, TABLE.y + 60], [x - 2, TABLE.y + 96]], 0.7, 3002 + i, 0.6); } hatch(Math.PI / 2 + 0.1, 3, 0.5, [TABLE.x1 - 60, TABLE.y + 16, TABLE.x1 + 22, TABLE.y + 96]); X.restore();
  for (const [k, x] of Object.entries(SEATX)) {
    nameCard(x, TABLE.y + 6, CARD[k]);
    carafe(x + 56, TABLE.y + 8, S.carafe ?? 0.8, 3050 + x);
    shape([[x - 60, TABLE.y + 8], [x - 50, TABLE.y + 8], [x - 49, TABLE.y - 8], [x - 61, TABLE.y - 8]], { lw: 0.8, id: 3060 + x, fill: '#f1ead6' });
    if (S.papers) for (let j = 0; j < 3; j++) shape([[x - 30 + j * 4, TABLE.y + 10 - j], [x + 20 + j * 4, TABLE.y + 10 - j], [x + 24 + j * 3, TABLE.y + 3 - j], [x - 26 + j * 3, TABLE.y + 3 - j]], { lw: 0.6, id: 3070 + x + j, fill: P2 });
  }
  if (S.basket != null) { const bx = 1250, by = TABLE.y + 140; shape([[bx - 16, by - 34], [bx + 16, by - 34], [bx + 12, by], [bx - 12, by]], { lw: 1.2, id: 3090, fill: P.paper, h: [[0.6, 4, 0.4], [-0.6, 4, 0.4]] }); if (S.basket > 0) for (let j = 0; j < 4; j++) ball(bx - 9 + j * 6, by - 36 - (j % 2) * 3, 5, 3091 + j, PAT.f, 0.7); }
}
function trolley_(x, y, s = 1, cups = 4) {
  X.save(); X.translate(x, y); X.scale(s, s);
  for (const d of [-1, 1]) { ball(d * 30, -6, 6, 3200 + d, PAT.m, 1); line([d * 30, -12], [d * 30, -64], 1.6, 3203 + d, 0.1); }
  shape(R(-38, -34, 76, 6), { lw: 1.1, id: 3206, fill: P.paper, h: [0, 2, 0.5] });
  shape(R(-38, -66, 76, 6), { lw: 1.1, id: 3207, fill: P.paper, h: [0, 2, 0.5] });
  line([30, -64], [42, -80], 1.6, 3208, 0.1); line([38, -80], [48, -80], 2.4, 3209, 0.1);
  // the teapot and cups
  X.beginPath(); X.ellipse(-12, -78, 13, 11, 0, 0, 6.2832); X.fillStyle = P.paper; X.fill(); X.lineWidth = 1.2; X.strokeStyle = P.ink; X.stroke();
  X.save(); X.beginPath(); X.ellipse(-12, -78, 13, 11, 0, 0, 6.2832); X.clip(); hatch(0.7, 2.4, 0.5, [-26, -90, 2, -66]); X.restore();
  line([-24, -80], [-34, -90], 1.6, 3210, 0.1); ball(-12, -91, 2.4, 3211, PAT.d, 0.5); X.beginPath(); X.arc(2, -78, 6, -1.4, 1.4); X.stroke();
  for (let i = 0; i < cups; i++) { const cx = 10 + i * 7 - (i > 1 ? 14 : 0), cy = i > 1 ? -40 : -68; shape([[cx - 4, cy - 7], [cx + 4, cy - 7], [cx + 3, cy], [cx - 3, cy]], { lw: 0.8, id: 3220 + i, fill: P2 }); }
  X.restore();
}
/* night: everything goes under a dark wash, except the moonlight from the windows and the light of an open plain door */
function nightWash(S, a) {
  if (a <= 0) return;
  X.save();
  X.beginPath(); X.rect(-1000, -1000, 4000, 3000);
  const shaft = (W_) => { const { cx, w, bot } = W_; X.moveTo(cx - w / 2, bot); X.lineTo(cx + w / 2, bot); X.lineTo(cx + w / 2 + 170, FL + 150); X.lineTo(cx - w / 2 + 110, FL + 150); X.closePath(); };
  const win = (W_) => { const { cx, w, top, bot } = W_; X.moveTo(cx - w / 2, bot); X.lineTo(cx + w / 2, bot); X.lineTo(cx + w / 2, top + w / 2); X.arc(cx, top + w / 2, w / 2, 0, Math.PI, true); X.closePath(); };
  win(WIN1); win(WIN2); shaft(WIN1); shaft(WIN2);
  if (S.plain > 0.02) { const { cx, w, h } = PLAIN, x0 = cx - w / 2, sp = w * (1 - 0.85 * S.plain); X.moveTo(x0 + sp, FL - h); X.lineTo(x0 + w, FL - h); X.lineTo(x0 + w, FL); X.lineTo(x0 + w + 40 * S.plain, FL + 300); X.lineTo(x0 + sp - 120 * S.plain, FL + 300); X.lineTo(x0 + sp, FL); X.closePath(); }
  X.fillStyle = `rgba(28,24,20,${0.42 * a})`; X.fill('evenodd');
  X.clip('evenodd'); X.globalAlpha = a * 0.7; X.beginPath(); for (let y = -600; y < 1400; y += 3.2) { X.moveTo(-800, y); X.lineTo(2600, y + 260); } X.lineWidth = 0.9; X.strokeStyle = P.ink; X.stroke();
  X.restore();
}

/* ================= compositor ================= */
const ORDER = ['arrive', 'object', 'passage', 'convention', 'encounter', 'vote', 'days', 'cleaner', 'published'];
const BEARD = (S) => S.beard || 0;
function baseState(name) {
  const n = ORDER.indexOf(name);
  const S = { great: 0, plain: 0, night: 0, day: 1, beard: 0, hair: 0, carafe: 0.85, clockT: 0, calFlip: 0,
    A: n > 1 ? {} : null, B: n > 2 ? {} : null, C: n > 3 ? { open: 0, shutter: 0 } : null, enc: [], ed: {},
    ppl: [], chair: { arm: 'down' }, trolley: n > 3 ? { x: 1338, y: 664, s: 0.95 } : null, extra: [], papers: n > 4, basket: n > 4 ? 1 : null };
  S.seat = { O: {}, T: {}, V: {}, K: {} };
  return S;
}
const ENCAT = {
  D: (ap, id) => doorEncounter(BAYX.D, FL, DW, DH + 13, ap, 0, id),
  great: (ap, id) => doorEncounter(GREAT.cx, FL, GREAT.w * 0.86, GREAT.h + 16, ap, 0, id),
  w1: (ap, id) => doorEncounter(WIN1.cx, WIN1.bot + 9, WIN1.w * 0.9, WIN1.bot - WIN1.top + 12, ap, 0, id),
  w2: (ap, id) => doorEncounter(WIN2.cx, WIN2.bot + 9, WIN2.w * 0.9, WIN2.bot - WIN2.top + 12, ap, 0, id),
  B: (ap, id) => doorEncounter(ABS.cx, ABS.base, DW, DH + 13, ap, 0, id),
  C: (ap, id) => doorEncounter(BAYX.C, FL, DW, DH + 13, ap, 0, id),
};
function drawHall(S) {
  ceilingAndWall(S); clock_(S.clockT); calendar(S.day, S.calFlip);
  windowArch(WIN1, { night: S.night > 0.5 }); windowArch(WIN2, { night: S.night > 0.5 });
  greatDoors(S.great); plainDoor(S.plain, S.night > 0.3);
  for (const k of 'ABCD') bayNiche(BAYX[k]);
  floor_();
  if (S.path > 0) { X.save(); X.globalAlpha = S.path; X.beginPath(); X.ellipse(ABS.cx + 10, FL + 40, 70, 22, 0, 0, 6.2832); X.lineWidth = 9; X.strokeStyle = 'rgba(28,24,20,.28)'; X.stroke(); X.restore(); }
  dais();
  for (const k of 'ABCD') edifier(EDX[k], S.ed[k] || {});
  if (S.A) { doorObject(BAYX.A, FL, { leaf: S.A.leaf ?? 1, ghost: S.A.ghost || 0 }); frame(BAYX.A, FL, DEF.A, 3400, S.A.bc || null); }
  if (S.B && S.B.bc) { // building: the letters arrive, then fall out of the frame and leave only the passing
    const dropU = S.B.drop || 0;
    if (dropU <= 0) frame(BAYX.B, ABS.base, DEF.B, 3500, S.B.bc);
    else { const bs = bricks(BAYX.B, ABS.base), L_ = letterSeq(DEF.B); for (let i = 0; i < NB; i++) { const b = bs[i], u = clamp(dropU * 1.6 - hash(i, 4) * 0.6); const yy = b[1] + u * u * (FL + 60 - b[1]); brick([b[0], yy, b[2], b[3]], brickChar(L_, i), 3500 + i, 1 - u); } }
  }
  if (S.C) { doorConvention(BAYX.C, FL, { leaf: S.C.leaf ?? 1, open: S.C.open || 0, shutter: S.C.shutter || 0, sign: S.C.sign }); frame(BAYX.C, FL, DEF.C, 3600, S.C.bc || null); }
  if (S.Dframe) frame(BAYX.D, FL, DEF.D, 3700, S.Dframe);
  for (const e of S.enc) if (e.at !== 'B') ENCAT[e.at](e.ap, 3800 + e.at.length * 70 + (e.at.charCodeAt(0) % 7) * 11);
  // the chairman at his rostrum
  if (S.chair) person('C', ROST.cx, CHAIR_BASE, Object.assign({ beard: S.beard }, S.chair));
  rostrum();
  if (!S.chair || !(S.chair.arm === 'bell' || S.chair.holdBell)) if (!S.bellAway) bell_(ROST.cx + 44, ROST.top - 6, 1.1);
  if (S.B && (S.B.abs ?? 1) > 0 && !S.B.bc) absencePlate(S.B.abs ?? 1); else if (S.B && S.B.abs > 0) absencePlate(S.B.abs);
  if (S.subc) { const x = 448, y = 660; line([x - 14, y], [x, y - 70], 1.4, 3301); line([x + 14, y], [x, y - 70], 1.4, 3302); shape(R(x - 34, y - 98, 68, 40), { lw: 1.1, id: 3303, fill: P2 }); mtxt('SUB-COMMITTEE', x, y - 86, 6.4, { bold: true }); mtxt('ON HINGES', x, y - 75, 6.4, { bold: true }); mtxt('in session', x, y - 65, 5, {}); }
  // people, back to front; the absence hides whoever is behind it
  const all = [...S.ppl];
  for (const [k, o] of Object.entries(S.seat)) if (o) all.push(Object.assign({ k, x: SEATX[k], y: SEAT_Y }, o));
  all.sort((a, b) => a.y - b.y);
  let absDone = false;
  const drawAbs = () => { if (absDone) return; absDone = true; if (S.B && (S.B.abs ?? 1) > 0 && !(S.B.bc && !(S.B.abs > 0))) doorAbsence(S.B.abs ?? 1); for (const e of S.enc) if (e.at === 'B') ENCAT.B(e.ap, 3990); };
  for (const p of all) {
    if (p.y > ABS.base) drawAbs();
    person(p.k, p.x, p.y, Object.assign({ beard: S.beard, hair: S.hair }, p));
    if (p.k === 'L' && p.bucket) bucket_(p.x + 34 * (p.f || 1), p.y, 0.9);
    if (p.report) { const [hx, hy] = [p.x + 26, p.y - 104]; shape(R(hx - 4, hy - 30, 46, 34), { lw: 1, id: 3310, fill: P2 }); mtxt('MINORITY', hx + 19, hy - 20, 5.2, { bold: true }); mtxt('REPORT', hx + 19, hy - 12, 5.2, { bold: true }); mtxt('ON KNOBS', hx + 19, hy - 4, 5.2, { bold: true, col: RED }); }
  }
  drawAbs();
  if (S.trolley) trolley_(S.trolley.x, S.trolley.y, S.trolley.s, S.trolley.cups ?? 4);
  if (S.bucketAt) bucket_(S.bucketAt[0], S.bucketAt[1], 0.9);
  table_(S);
  nightWash(S, S.night);
}
/* routes: [[t, x, y], ...] -> position, walking flag, facing */
function route(lt, pts, spd = 9) {
  if (lt <= pts[0][0]) return { x: pts[0][1], y: pts[0][2], walk: 0, f: 0, ph: 0 };
  for (let i = 1; i < pts.length; i++) {
    const [t0, x0, y0] = pts[i - 1], [t1, x1, y1] = pts[i];
    if (lt < t1) { const u = (lt - t0) / Math.max(0.01, t1 - t0), mov = Math.hypot(x1 - x0, y1 - y0) > 1; return { x: lerp(x0, x1, u), y: lerp(y0, y1, u), walk: mov ? 1 : 0, f: mov && Math.abs(x1 - x0) > 3 ? Math.sign(x1 - x0) : 0, ph: lt * spd }; }
  }
  const l = pts[pts.length - 1]; return { x: l[1], y: l[2], walk: 0, f: 0, ph: 0 };
}
const sit = (k) => [SEATX[k], SEAT_Y];
function edState(sh, lt, k, sent) {
  const ty = cue(sh, 'type'), fa = cue(sh, 'fall');
  const typing = ty && lt >= ty.at && lt < ty.to, hum = ty && lt >= ty.at - 0.3 && lt < (fa ? fa.to : ty.to) + 0.4;
  const paper = ty ? (fa ? (lt < fa.at + 0.6 ? U(lt, ty.at, ty.to) : 1 - U(lt, fa.at + 0.4, fa.at + 1.0)) : U(lt, ty.at, ty.to) * (1 - U(lt, ty.to + 0.6, ty.to + 1.4))) : 0;
  return { keys: typing, hum, paper, text: sent, speak: sayAt(sh, 'E', lt) };
}
function buildState(sh, lt, k) {
  const fa = cue(sh, 'fall'), lf = cue(sh, 'leaf');
  if (!fa || lt < fa.at) return { leaf: 0, bc: { fall: fa, lt, src: [EDX[k], FL - 216] }, pre: true };
  return { leaf: U(lt, lf.at, lf.to), bc: lt < lf.at ? { fall: fa, lt, src: [EDX[k], FL - 216] } : null };
}

/* ================= outside: the Ministry, and the city of described houses ================= */
function house(x, b, w, h, id) {
  const rf = hash(id, 1) > 0.4;
  shape(R(x, b - h, w, h), { lw: 1.2, id, fill: P.paper, sh: R(x + w * 0.65, b - h, w * 0.35, h), sh2: [Math.PI / 2, 2.2, 0.5] });
  if (rf) shape([[x - 4, b - h], [x + w + 4, b - h], [x + w / 2, b - h - w * 0.55]], { lw: 1.2, id: id + 1, fill: P.paper, h: [-1, 3, 0.5] });
  else shape(R(x - 3, b - h - 6, w + 6, 6), { lw: 1, id: id + 1, fill: P.paper, h: [0, 2, 0.5] });
  for (let r = 0; r < Math.floor(h / 30); r++) for (let c = 0; c < 2; c++) shape(R(x + 6 + c * (w / 2), b - h + 8 + r * 28, 7, 10), { lw: 0.7, id: id + 3 + r * 2 + c, fill: P.ink });
  shape(R(x + w / 2 - 7, b - 16, 14, 5), { lw: 0.6, id: id + 30, fill: '#e2d4ad' }); line([x + w / 2 - 5, b - 13.5], [x + w / 2 + 5, b - 13.5], 0.8, id + 31, 0.1, RED);
}
function ministry(lt) {
  shape(R(-300, -300, 1900, 1300), { lw: 0, fill: P.paper });
  X.save(); X.globalAlpha = 0.4; skyLines(-120, 520, 1300); X.restore();
  for (let i = 0; i < 24; i++) { const w = 38 + hash(i, 2) * 30, h = 60 + hash(i, 3) * 110; house(-120 + i * 66 + hash(i, 1) * 18, 560, w, h, 4000 + i * 40); }
  shape(R(-300, 560, 1900, 500), { lw: 0, fill: P.paper, h: [0.04, 6, 0.4] });
  line([-300, 560], [1600, 560], 1.4, 3990, 0.4);
  // steps
  for (let k = 0; k < 5; k++) shape(R(300 - k * 18, 600 + k * 14, 680 + k * 36, 14), { lw: 1.2, id: 4980 + k, fill: P.paper, h: [0, 3.2, 0.4] });
  shape(R(320, 270, 640, 330), { lw: 1.8, id: 4990, fill: P.paper, h: [0, 5, 0.4] });
  // the doorway
  shape(R(596, 430, 88, 170), { lw: 1.6, id: 4991, fill: '#2f2923' });
  shape([[584, 430], [696, 430], [640, 404]], { lw: 1.4, id: 4992, fill: P2 });
  for (let i = 0; i < 6; i++) { const x = 352 + i * 115; if (x > 560 && x < 720) continue;
    shape(R(x - 15, 312, 30, 288), { lw: 1.4, id: 5000 + i, fill: P.paper, sh: R(x + 3, 312, 12, 288), sh2: [Math.PI / 2, 2.2, 0.6] });
    for (let k = -2; k <= 2; k++) line([x + k * 5, 316], [x + k * 5, 596], 0.5, 5010 + i * 5 + k, 0.1);
    shape(R(x - 22, 300, 44, 12), { lw: 1.2, id: 5040 + i, fill: P.paper }); shape(R(x - 20, 596, 40, 6), { lw: 1, id: 5050 + i, fill: P.paper }); }
  for (const x of [583, 697]) { shape(R(x - 15, 312, 30, 288), { lw: 1.4, id: 5060 + x, fill: P.paper, sh: R(x + 3, 312, 12, 288), sh2: [Math.PI / 2, 2.2, 0.6] }); shape(R(x - 22, 300, 44, 12), { lw: 1.2, id: 5070 + x, fill: P.paper }); }
  // entablature with the motto, and the pediment
  shape(R(300, 252, 680, 48), { lw: 1.6, id: 5080, fill: P2 });
  X.save(); X.font = `19px ${FONT}`; X.textAlign = 'center'; X.textBaseline = 'middle'; X.fillStyle = P.ink; X.fillText('EVERYTHING  THAT  CAN  BE  SAID  CAN  BE  BUILT', 640, 277); X.restore();
  shape([[290, 252], [990, 252], [640, 150]], { lw: 1.8, id: 5081, fill: P.paper, h: [0, 3.2, 0.5] });
  shape([[340, 242], [940, 242], [640, 162]], { lw: 1, id: 5082, fill: P2 });
  mtxt('MINISTRY OF CONSTRUCTIVE SEMANTICS', 640, 222, 10, { bold: true });
}

/* ================= shots ================= */
const WIDE = ON(830, 440, 0.76), TABLECAM = ON(850, 600, 1.22);
const BAYCAM = (k, z = 1.9) => ON((BAYX[k] + EDX[k]) / 2, 470, z);
const seatHead = (k) => headAt(k, SEATX[k], SEAT_Y);
const lookAt = (k, tx) => clamp((tx - SEATX[k]) / 260, -1, 1);
function seatsTalk(S, sh, lt, focusX) { for (const k of 'OTVK') if (S.seat[k]) { S.seat[k].mouth = sayAt(sh, k, lt); if (focusX != null) S.seat[k].look = lookAt(k, focusX); } }
function chairTalk(S, sh, lt) { if (!S.chair) return; S.chair.mouth = sayAt(sh, 'C', lt); for (const b of cues(sh, 'bell')) if (lt > b.at - 0.3 && lt < b.at + 0.75) S.chair.arm = 'bell'; }
function encAp(lt, a, v) { if (lt < a - 0.35) return 0; if (v == null || lt < v) return Math.max(1e-3, U(lt, a - 0.35, a)); return -Math.max(1e-3, U(lt, v, v + 0.45)); }
const clockOf = (sh) => 10.5 * 3600 + (sh.t0 || 0) * 4;

SHOTS.title = (lt, sd, sh) => {
  cam(ON(640, 380 - lt * 3, 1.0 + lt * 0.006), () => { ministry(lt); });
  X.save(); X.globalAlpha = seg(lt, 0.8, 2.0);
  shape(R(214, 52, 852, 96), { lw: 1.4, id: 5100, fill: P.paper }); ink([[220, 58], [1060, 58], [1060, 142], [220, 142], [220, 58]], 0.7, 5101, 0.4);
  ftxt('THE GREAT INTERNATIONAL CONGRESS OF DOORS', 640, 88, 34);
  ftxt('four definitions, and no way out', 640, 124, 19, { italic: true });
  X.restore();
};

SHOTS.arrive = (lt, sd, sh) => {
  const L = sh.lines, ins = cue(sh, 'inside'), en = cue(sh, 'enter'), pr = cue(sh, 'props'), cl = cue(sh, 'close'), cb = cue(sh, 'climb');
  if (lt < ins.at) {
    const c = camFor(lt, [[0, ON(640, 420, 1.05)], [L[0].t0 + 3, ON(640, 470, 1.35), 6]]);
    cam(c, () => {
      ministry(lt);
      const ks = ['O', 'T', 'V', 'K'];
      ks.forEach((k, i) => { const st = cb.at + 0.6 + i * 1.6, from = i % 2 ? 1100 : 180, p = route(lt, [[st, from, 690], [st + 3.6, from + (i % 2 ? -380 : 380), 660], [st + 5.6, 640, 600]]);
        const a = 1 - U(lt, st + 5.3, st + 5.8); if (a > 0 && lt > st - 0.1) person(k, p.x, p.y, Object.assign({ s: 0.62, alpha: a }, p)); });
    });
    return;
  }
  const S = baseState('arrive'); S.great = 1 - E.in(U(lt, cl.at, cl.at + 0.62)); S.clockT = clockOf(sh) + lt;
  const order = ['K', 'V', 'T', 'O'];
  for (const [i, k] of order.entries()) {
    const st = en.at + i * 0.7, arr = en.to - 1.6 + i * 0.35;
    if (lt < arr + 0.5) { S.seat[k] = null; if (lt > st) { const p = route(lt, [[st, 150, 640], [arr, SEATX[k], 650], [arr + 0.5, SEATX[k], SEAT_Y]]); S.ppl.push(Object.assign({ k }, p)); } }
  }
  seatsTalk(S, sh, lt, lt > L[4].t0 - 1.5 ? 850 : null); chairTalk(S, sh, lt);
  let c = camFor(lt, [[0, WIDE], [ins.at, ON(420, 470, 1.1)], [en.at + 2.5, WIDE, 2.5],
    [pr.at, ON(SEATX.T, 690, 3.0), 0.01], [pr.at + 1.1, ON(SEATX.V + 56, 680, 3.4), 0.01], [pr.at + 2.1, ON(ROST.cx + 44, ROST.top - 12, 3.6), 0.01],
    [cl.at - 0.6, ON(260, 470, 1.25), 0.01], [L[3].t0 + 1.2, WIDE, 2.0], [L[4].t0 - 1.4, ON(850, 450, 1.8), 0.8]]);
  c = withTight(sh, lt, c, ROST.cx, CHAIR_BASE - 150, 3.2);
  cam(c, () => drawHall(S));
};

function doorShotBase(sh, lt, name, key, who) {
  const S = baseState(name); S.clockT = clockOf(sh) + lt;
  S.ed[key] = edState(sh, lt, key, DEF[key]);
  return S;
}
SHOTS.object = (lt, sd, sh) => {
  const L = sh.lines, w = cue(sh, 'walk'), hg = cue(sh, 'hinge'), bk = cue(sh, 'back'), ps = cues(sh, 'push'), kn = cue(sh, 'knob');
  const S = doorShotBase(sh, lt, 'object', 'A', 'O');
  const bs = buildState(sh, lt, 'A'); S.A = { leaf: bs.leaf, bc: bs.bc, ghost: U(lt, hg.at + 0.4, hg.at + 1.0) * (1 - U(lt, hg.to + 0.6, hg.to + 1.2)) };
  if (lt > w.at && lt < bk.to + 0.6) {
    S.seat.T = null;
    const p = route(lt, [[w.at, SEATX.T, SEAT_Y], [w.at + 0.6, SEATX.T, 650], [w.to, 552, 632], [bk.at, 552, 632], [bk.to - 0.5, SEATX.T, 650], [bk.to, SEATX.T, SEAT_Y]]);
    let arm = 'down', f = p.f; for (const c of [...ps, kn]) if (lt > c.at - 0.25 && lt < c.at + 0.45) { arm = 'push'; f = -1; }
    if (lt >= w.to && lt < bk.at) { f = f || -1; }
    S.ppl.push(Object.assign({ k: 'T' }, p, { f, arm, mouth: sayAt(sh, 'T', lt), x: p.x - (arm === 'push' ? 4 : 0) }));
  }
  seatsTalk(S, sh, lt, lt > L[1].t1 ? BAYX.A : 850); chairTalk(S, sh, lt);
  const ty = cue(sh, 'type');
  let c = camFor(lt, [[0, WIDE], [L[0].t0 - 0.3, ON(850, 460, 1.7), 0.01], [L[1].t0 - 0.1, TABLECAM, 0.01], [ty.at - 0.2, BAYCAM('A'), 1.0], [L[2].t0 + 1.5, ON(BAYX.A, 470, 2.3), 4],
    [w.to - 0.8, ON(500, 500, 1.6), 1.0], [L[3].t0 - 0.2, ON(500, 520, 2.0), 0.6], [hg.at, ON(BAYX.A - 30, 470, 2.9), 0.8], [L[5].t0 - 0.2, ON(620, 520, 1.15), 1.4]]);
  c = withTight(sh, lt, c, ...seatHead('O'), 3.0);
  cam(c, () => drawHall(S));
};
SHOTS.passage = (lt, sd, sh) => {
  const L = sh.lines, w = cue(sh, 'walk'), th = cue(sh, 'through'), t2 = cue(sh, 'through2'), ar = cue(sh, 'around'), bk = cue(sh, 'back'), lf = cue(sh, 'leaf'), fa = cue(sh, 'fall');
  const S = doorShotBase(sh, lt, 'passage', 'B', 'T');
  if (lt < lf.at) S.B = { bc: { fall: fa, lt, src: [EDX.B, FL - 216] } };
  else if (lt < lf.to + 0.3) S.B = { bc: { fall: fa, lt, src: [0, 0] }, drop: U(lt, lf.at, lf.to + 0.2), abs: U(lt, lf.at + 0.2, lf.to + 0.3) };
  else S.B = {};
  const X0 = ABS.cx;
  if (lt > w.at && lt < bk.to + 0.6) {
    S.seat.T = null;
    const p = route(lt, [[w.at, SEATX.T, SEAT_Y], [w.at + 0.6, SEATX.T, 650], [w.to, X0, 652],
      [th.at, X0, 652], [th.at + 1.4, X0, 598], [th.at + 2.5, X0 + 70, 596], [th.at + 3.4, X0 + 64, 646], [th.to, X0 + 36, 652],
      [t2.at, X0 + 36, 652], [t2.at + 0.5, X0, 652], [t2.at + 1.8, X0, 598], [t2.at + 2.8, X0 + 70, 596], [t2.at + 3.6, X0 + 64, 646], [t2.to, X0 + 36, 652],
      [bk.at, X0 + 36, 652], [bk.to - 0.5, SEATX.T, 650], [bk.to, SEATX.T, SEAT_Y]]);
    if (lt > th.at + 0.3 && lt < th.at + 1.5 || lt > t2.at + 0.6 && lt < t2.at + 1.9) p.f = 0;
    S.ppl.push(Object.assign({ k: 'T' }, p, { mouth: sayAt(sh, 'T', lt), s: 1 - (652 - p.y) * 0.0012 }));
  }
  if (lt > ar.at - 1.4 && lt < bk.to + 0.6) {
    S.seat.O = null;
    const p = route(lt, [[ar.at - 1.4, SEATX.O, SEAT_Y], [ar.at - 0.8, SEATX.O, 650], [ar.at + 0.3, X0 - 80, 640], [ar.at + 1.3, X0 - 64, 596], [ar.at + 2.4, X0 + 90, 594], [ar.at + 3.3, X0 + 96, 640], [ar.to, X0 + 100, 646],
      [bk.at, X0 + 100, 646], [bk.to - 0.5, SEATX.O, 650], [bk.to, SEATX.O, SEAT_Y]], 7);
    if (lt > ar.to && lt < bk.at) p.f = -1;
    S.ppl.push(Object.assign({ k: 'O' }, p, { mouth: sayAt(sh, 'O', lt), s: 1 - (650 - p.y) * 0.0012 }));
  }
  seatsTalk(S, sh, lt, lt > L[1].t1 ? X0 : 850); chairTalk(S, sh, lt);
  const ty = cue(sh, 'type');
  let c = camFor(lt, [[0, WIDE], [L[0].t0 - 0.3, ON(850, 460, 1.7), 0.01], [L[1].t0 - 0.1, TABLECAM, 0.01], [ty.at - 0.2, BAYCAM('B'), 1.0], [L[2].t0 + 1.0, ON(X0, 500, 1.75), 3],
    [th.at, ON(X0 + 10, 520, 1.7), 1.0], [L[4].t0 - 0.2, ON(650, 560, 1.35), 0.6], [ar.at, ON(X0, 520, 1.45), 1.0], [L[6].t0 + 0.5, ON(760, 500, 1.05), 2.5]]);
  c = withTight(sh, lt, c, ...seatHead('T'), 3.0);
  cam(c, () => drawHall(S));
};
SHOTS.convention = (lt, sd, sh) => {
  const L = sh.lines, dn = cue(sh, 'down'), cd_ = cue(sh, 'card'), sc = cue(sh, 'shutter'), tr = cue(sh, 'trolley'), up = cue(sh, 'up');
  const S = doorShotBase(sh, lt, 'convention', 'C', 'V');
  const bs = buildState(sh, lt, 'C');
  S.C = { leaf: bs.leaf, bc: bs.bc, open: U(lt, tr.at + 1.2, tr.at + 1.9) * (1 - U(lt, tr.at + 4.0, tr.at + 4.6)), shutter: U(lt, sc.at, sc.at + 0.3) * (1 - U(lt, sc.to, sc.to + 0.3)), sign: 'NOT|EXPECTED' };
  S.ed.C.speak = sayAt(sh, 'E', lt);
  // the trolley comes through the door it was expected at
  if (lt < tr.at + 1.6) S.trolley = null;
  else { const u = U(lt, tr.at + 1.6, tr.at + 3.6), u2 = U(lt, tr.at + 3.6, tr.at + 5.4); S.trolley = { x: lerp(BAYX.C + 8, BAYX.C + 30, u) + E.io(u2) * (1338 - BAYX.C - 30), y: lerp(604, 652, E.out(u)) + u2 * 12, s: lerp(0.82, 0.95, u), cups: 4 }; }
  if (lt > dn.at && lt < up.to + 0.2) {
    S.chair = null;
    const p = route(lt, [[dn.at, ROST.cx + 70, 640], [dn.to, BAYX.C - 26, 640], [tr.at + 1.8, BAYX.C - 26, 640], [tr.at + 2.6, BAYX.C - 80, 646], [up.at, BAYX.C - 80, 646], [up.to, ROST.cx + 70, 640]]);
    let arm = lt > cd_.at && lt < sc.to + 0.3 ? 'card' : 'down';
    S.ppl.push(Object.assign({ k: 'C' }, p, { f: arm === 'card' ? 1 : p.f, arm, mouth: sayAt(sh, 'C', lt), beard: 0, alpha: Math.min(U(lt, dn.at, dn.at + 0.3), 1 - U(lt, up.to - 0.2, up.to)) }));
    S.bellAway = false;
  }
  seatsTalk(S, sh, lt, lt > L[1].t1 ? BAYX.C : 850); chairTalk(S, sh, lt);
  const ty = cue(sh, 'type');
  let c = camFor(lt, [[0, WIDE], [L[0].t0 - 0.3, ON(850, 460, 1.7), 0.01], [L[1].t0 - 0.1, TABLECAM, 0.01], [ty.at - 0.2, BAYCAM('C'), 1.0], [L[2].t0 + 0.4, ON(BAYX.C, 430, 2.6), 2.0],
    [dn.at + 0.4, ON(BAYX.C - 20, 500, 1.8), 1.2], [sc.at - 0.2, ON(BAYX.C - 4, 470, 3.1), 0.6], [L[4].t1 + 0.6, ON(BAYX.C + 40, 540, 1.5), 1.0], [L[6].t0 - 0.3, ON(1000, 560, 1.2), 1.0]]);
  c = withTight(sh, lt, c, ...seatHead('V'), 3.2);
  cam(c, () => drawHall(S));
};
SHOTS.encounter = (lt, sd, sh) => {
  const L = sh.lines, dn = cue(sh, 'down'), up = cue(sh, 'up'), ap = cues(sh, 'appear'), va = cues(sh, 'vanish');
  const S = doorShotBase(sh, lt, 'encounter', 'D', 'K');
  S.ed.D.speak = sayAt(sh, 'E', lt);
  for (let i = 0; i < ap.length; i++) { const a = encAp(lt, ap[i].at, va[i].at); if (a !== 0 && a > -1) S.enc.push({ at: 'D', ap: a }); }
  if (lt > dn.at && lt < up.to + 0.2) {
    S.chair = null;
    const pts = [[dn.at, ROST.cx + 70, 640], [dn.to, BAYX.D, 662]];
    for (let i = 0; i < ap.length; i++) { pts.push([ap[i].at - 0.6, BAYX.D, 662], [ap[i].at - 0.1, BAYX.D, 630], [va[i].at - 0.6, BAYX.D, 630], [va[i].at - 0.1, BAYX.D, 662]); }
    pts.push([up.at, BAYX.D, 662], [up.to, ROST.cx + 70, 640]);
    const p = route(lt, pts);
    if (p.f === 0 && lt > dn.to) p.look = (lt > va[1].at ? -0.6 : 0.4);
    S.ppl.push(Object.assign({ k: 'C' }, p, { mouth: sayAt(sh, 'C', lt), alpha: Math.min(U(lt, dn.at, dn.at + 0.3), 1 - U(lt, up.to - 0.2, up.to)) }));
  }
  seatsTalk(S, sh, lt, lt > L[1].t1 ? BAYX.D : 850); chairTalk(S, sh, lt);
  const ty = cue(sh, 'type');
  let c = camFor(lt, [[0, WIDE], [L[0].t0 - 0.3, ON(850, 460, 1.7), 0.01], [L[1].t0 - 0.1, TABLECAM, 0.01], [ty.at - 0.2, BAYCAM('D'), 1.0], [L[2].t1 + 0.8, ON(1000, 540, 1.1), 0.01],
    [dn.to - 0.6, ON(BAYX.D - 20, 500, 1.8), 1.2], [L[4].t0 - 0.2, ON(1150, 560, 1.35), 1.0], [up.at, ON(1000, 520, 1.1), 1.2]]);
  c = withTight(sh, lt, c, ...seatHead('K'), 3.0);
  cam(c, () => drawHall(S));
};
SHOTS.vote = (lt, sd, sh) => {
  const L = sh.lines, hs = cues(sh, 'hand'), ri = cue(sh, 'rise'), ck = cue(sh, 'clock'), M = ri.at;
  const S = baseState('vote'); S.clockT = clockOf(sh) + lt;
  S.ed.C = { speak: sayAt(sh, 'E', lt) };
  const ks = ['O', 'T', 'V', 'K'];
  hs.forEach((h, i) => { const k = ks[i]; if (lt > h.at && lt < L[4].t0 + 1.0) { S.seat[k].arm = 'up'; if (k === 'K') S.seat[k].raise = E.io(U(lt, h.at, h.at + 1.4)); } });
  // lunch: everyone to the nearest door
  const sOn = (k, a) => { if (lt > a) S.seat[k] = null; return lt > a; };
  const shA = L[6].t0 - 0.9;
  S.C.shutter = U(lt, shA, shA + 0.3) * (1 - U(lt, L[6].t1 + 0.5, L[6].t1 + 0.8)); S.C.sign = 'VOTING MEMBERS|NOT ADMITTED';
  const tA = { great: M + 4.93, w1: M + 7.23, w2: M + 8.83, D: M + 10.13 };
  for (const [at, t] of Object.entries(tA)) { const a = encAp(lt, t); if (a) S.enc.push({ at, ap: a }); }
  if (sOn('O', M + 0.3)) { const p = route(lt, [[M + 0.3, SEATX.O, SEAT_Y], [M + 0.9, SEATX.O, 650], [M + 2.1, BAYX.A - 34, 628], [M + 4.4, BAYX.A - 34, 628], [M + 6.6, WIN1.cx + 20, 646]]); let arm = 'down', f = p.f; if (lt > M + 2.15 && lt < M + 3.3) { arm = 'push'; f = 1; } if (lt > M + 6.6) { p.lookY = -2; } S.ppl.push(Object.assign({ k: 'O' }, p, { arm, f })); }
  if (sOn('T', M + 0.3)) { const p = route(lt, [[M + 0.3, SEATX.T, SEAT_Y], [M + 0.9, SEATX.T, 650], [M + 1.3, ABS.cx, 652], [M + 2.6, ABS.cx, 598], [M + 3.6, ABS.cx + 68, 596], [M + 4.3, ABS.cx + 62, 646], [M + 6.0, ABS.cx + 62, 646], [M + 8.5, WIN2.cx - 10, 646]]); S.ppl.push(Object.assign({ k: 'T' }, p, { s: 1 - (652 - p.y) * 0.0012 })); }
  if (sOn('V', M + 0.4)) { const p = route(lt, [[M + 0.4, SEATX.V, SEAT_Y], [M + 1.0, SEATX.V, 650], [M + 3.0, BAYX.C - 26, 640]]); const arm = lt > M + 3.2 && lt < L[6].t1 + 0.8 ? 'card' : 'down'; S.ppl.push(Object.assign({ k: 'V' }, p, { arm, f: arm === 'card' ? 1 : p.f })); }
  if (sOn('K', M + 0.2)) { const p = route(lt, [[M + 0.2, SEATX.K, SEAT_Y], [M + 0.8, SEATX.K, 650], [M + 4.6, GREAT.cx + 30, 656]], 7); S.ppl.push(Object.assign({ k: 'K' }, p)); }
  if (lt > M + 7.4) { S.chair = null; const p = route(lt, [[M + 7.4, ROST.cx + 70, 640], [M + 9.9, BAYX.D, 652]]); const ringing = cues(sh, 'bell').some((b) => lt > b.at - 0.3 && lt < b.at + 0.75); S.ppl.push(Object.assign({ k: 'C' }, p, { mouth: sayAt(sh, 'C', lt), alpha: U(lt, M + 7.4, M + 7.7), arm: ringing ? 'bell' : 'down', holdBell: true })); S.bellAway = true; }
  seatsTalk(S, sh, lt, 850); chairTalk(S, sh, lt);
  const chHead = [BAYX.D, 652 - 158];
  let c = camFor(lt, [[0, ON(850, 520, 1.15)], [L[0].t0 - 0.2, ON(850, 600, 1.22), 1.0], [L[4].t0 - 0.2, ON(850, 450, 1.9), 0.8], [L[5].t0, WIDE, 1.2],
    [L[6].t0 - 1.2, ON(BAYX.C - 10, 520, 2.3), 0.01], [L[6].t1 + 0.6, WIDE, 0.01], [ck.at + 1.5, ON(850, 300, 2.6), 0.01], [ck.at + 4.2, WIDE, 0.01], [L[7].t0 - 0.2, ON(BAYX.D - 60, 520, 1.6), 0.8]]);
  c = withTight(sh, lt, c, chHead[0], chHead[1] + 10, 3.2);
  cam(c, () => drawHall(S));
};

function finalDay() { const sh = T.shots.find((s) => s.shot === 'days'), ca = sh.cues.find((c) => c.k === 'cal'); let day = 1, tm = ca.at, k = 0; while (tm < ca.to) { day++; k++; tm += Math.max(0.45, 1.4 * Math.pow(0.93, k)); } return day; }
SHOTS.days = (lt, sd, sh) => {
  const L = sh.lines, ca = cue(sh, 'cal');
  const S = baseState('days');
  // the calendar: pages turn faster and faster (build_sound.py uses the same rule)
  let day = 1, tm = ca.at, k = 0, last = -9; while (tm < ca.to && tm <= lt) { last = tm; day++; k++; tm += Math.max(0.45, 1.4 * Math.pow(0.93, k)); }
  S.day = day; S.calFlip = U(lt, last, last + 0.35); S.clockT = clockOf(sh) + lt * 2600;
  const g = U(lt, 0, sd); S.beard = g; S.hair = g; S.carafe = 0.85 * (1 - U(lt, 0, sd * 0.6)); S.path = U(lt, L[2].t0, L[2].t1);
  S.subc = lt > L[1].t0 - 0.3;
  const seg_ = lt < L[1].t0 - 0.3 ? 0 : lt < L[2].t0 - 0.3 ? 1 : lt < L[3].t0 - 0.3 ? 2 : lt < L[4].t0 - 0.3 ? 3 : 4;
  for (const kk of 'OTVK') S.seat[kk].hat = g;
  if (seg_ === 1) { S.seat.O = null; S.seat.V = null; S.A.ghost = 0.9;
    S.ppl.push({ k: 'O', x: BAYX.A - 70, y: 640, f: 1, arm: 'up', look: 1 }); S.ppl.push({ k: 'V', x: BAYX.A + 74, y: 646, f: -1, hat: g }); S.ppl.push({ k: 'T', x: BAYX.A + 150, y: 652, f: -1, closed: true }); S.seat.T = null; }
  if (seg_ === 2) { S.seat.T = null; const per = 4.2, q = ((lt - L[2].t0 + 0.3) % per + per) % per, X0 = ABS.cx;
    const p = route(q, [[0, X0, 652], [1.3, X0, 598], [2.3, X0 + 70, 596], [3.2, X0 + 64, 646], [per, X0, 652]], 9); S.ppl.push(Object.assign({ k: 'T' }, p, { s: 1 - (652 - p.y) * 0.0012 })); }
  if (seg_ === 3) { S.seat.V = null; S.ppl.push({ k: 'V', x: SEATX.V, y: 690, arm: 'card', f: 1, report: true, hat: g, mouth: 0 }); S.seat.K.sleep = 1; S.seat.T.sleep = 1; S.seat.O.f = -1; S.seat.O.look = -1; if (S.chair) S.chair.sleep = 1; }
  if (seg_ === 4) { const t4 = L[4].t0 + 0.8, ats = ['great', 'w1', 'w2', 'D', 'great', 'w1'];
    ats.forEach((a, i) => { const t = t4 + i * 0.55 + 0.33; const ap = encAp(lt, t, t + (i < 4 ? 1.6 : 9)); if (ap && ap > -1) S.enc.push({ at: a, ap }); });
    for (const kk of 'OTK') S.seat[kk] = null; S.chair = null; S.bellAway = true;
    S.ppl.push({ k: 'K', x: GREAT.cx + 30, y: 656 }); S.ppl.push({ k: 'O', x: WIN1.cx + 20, y: 646, lookY: -2 }); S.ppl.push({ k: 'T', x: WIN2.cx - 10, y: 646 }); S.ppl.push({ k: 'C', x: BAYX.D, y: 652, holdBell: true }); }
  seatsTalk(S, sh, lt, null);
  const c = camFor(lt, [[0, WIDE], [L[0].t1 + 0.4, ON(1505, 330, 2.6), 0.01], [L[1].t0 - 0.3, ON(BAYX.A + 20, 520, 1.75), 0.01], [L[2].t0 - 0.3, ON(ABS.cx + 20, 530, 1.7), 0.01],
    [L[3].t0 - 0.3, ON(SEATX.V + 20, 610, 1.5), 0.01], [L[3].t0 + 0.6, ON(SEATX.V + 40, 600, 2.6), 1.6], [L[4].t0 - 0.3, WIDE, 0.01]]);
  cam(c, () => drawHall(S));
};
SHOTS.cleaner = (lt, sd, sh) => {
  const L = sh.lines, op = cue(sh, 'open'), en = cue(sh, 'enter'), mo = cue(sh, 'mop'), bk = cue(sh, 'basket'), lv = cue(sh, 'leave'), shut = cue(sh, 'shut');
  const S = baseState('cleaner'); S.night = 1; S.day = finalDay(); S.beard = 1; S.hair = 1; S.carafe = 0; S.path = 1; S.subc = true; S.clockT = clockOf(sh) + 13 * 3600 + lt;
  for (const k of 'OTVK') Object.assign(S.seat[k], { sleep: 1, hat: 1 }); S.chair.sleep = 1;
  S.plain = U(lt, op.at, op.at + 0.6) * (1 - U(lt, shut.at - 0.5, shut.at));
  S.basket = lt < bk.at + 0.4 ? 1 : 0; S.basketAt = [640, 672];
  const BX = 646;
  if (lt > en.at && lt < lv.to + 0.1) {
    const p = route(lt, [[en.at, PLAIN.cx, 604], [en.at + 0.8, PLAIN.cx - 30, 646], [en.to, 1120, 664], [mo.at, 1120, 664], [bk.at - 0.6, BX + 40, 664], [bk.at + 1.2, BX + 40, 664], [mo.to, BX + 90, 664], [lv.to - 0.8, PLAIN.cx - 30, 646], [lv.to, PLAIN.cx, 604]], 7);
    const mopping = lt > mo.at && lt < mo.to && !(lt > bk.at - 0.2 && lt < bk.at + 1.0);
    const alpha = Math.min(U(lt, en.at, en.at + 0.4), 1 - U(lt, lv.to - 0.3, lv.to));
    S.ppl.push(Object.assign({ k: 'L' }, p, { arm: mopping ? 'mop' : (lt > bk.at - 0.2 && lt < bk.at + 1.0 ? 'hold' : 'down'), mopHeld: !mopping, alpha, bucket: lt < mo.at || lt > mo.to, f: mopping ? -1 : p.f }));
    if (lt > mo.at && lt < mo.to) S.bucketAt = [1150, 668];
    if (lt > bk.at + 0.4) { const b = S.ppl[S.ppl.length - 1]; b.bundle = true; }
  }
  const c = camFor(lt, [[0, ON(1100, 480, 1.0)], [op.at - 0.4, ON(1420, 500, 1.5), 1.2], [en.to - 1.6, ON(1000, 540, 1.15), 2.4], [bk.at - 1.2, ON(760, 580, 1.6), 1.4], [lv.at, ON(1100, 520, 1.1), 2.2],
    [L[2].t0 - 0.4, ON(1470, 500, 1.6), 1.2], [L[3].t0 - 0.6, ON(PLAIN.cx, 530, 2.8), 1.4]]);
  cam(c, () => { drawHall(S); if (S.night && S.plain < 0.02) { X.save(); X.globalAlpha = 0.95; shape(R(PLAIN.cx - PLAIN.w / 2 + 2, FL - 3, PLAIN.w - 4, 4), { lw: 0, fill: '#fbf6e6' }); X.restore(); }
    const cl = S.ppl.find((p) => p.k === 'L'); if (cl && cl.bundle) { X.save(); X.globalAlpha = cl.alpha; for (let j = 0; j < 4; j++) shape(R(cl.x - 24 + j * 2, cl.y - 92 - j * 3, 22, 14), { lw: 0.7, id: 6110 + j, fill: P2 }); X.restore(); } });
};
SHOTS.published = (lt, sd, sh) => {
  const L = sh.lines, tu = cue(sh, 'turn'), dr = cue(sh, 'door');
  if (lt < dr.at) {
    cam(ON(640, 380, 1.0 + lt * 0.012), () => {
      shape(R(-200, -200, 1700, 1200), { lw: 0, fill: P.paper, h: [0.05, 5, 0.45] });
      shape(R(330, 92, 620, 540), { lw: 2, id: 6200, fill: '#d9cfb4', h: [[0.7, 4, 0.5], [-0.7, 4, 0.5]] });
      const page = (title) => { shape(R(352, 108, 576, 508), { lw: 1.4, id: 6201, fill: P2 }); };
      const cover = () => { shape(R(352, 108, 576, 508), { lw: 1.6, id: 6202, fill: '#e3d9bf', h: [0.2, 6, 0.3] }); shape(R(400, 170, 480, 300), { lw: 1.4, id: 6203, fill: P2 });
        ftxt('A UNIVERSAL', 640, 222, 30); ftxt('THEORY OF DOORS', 640, 262, 30); line([520, 296], [760, 296], 1, 6204, 0.2);
        ftxt('Proceedings of the Great International Congress of Doors', 640, 326, 15, { italic: true }); ftxt('held in the great hall of the Ministry', 640, 350, 15, { italic: true });
        mtxt('MINISTRY OF CONSTRUCTIVE SEMANTICS', 640, 430, 11, { bold: true }); mtxt('Volume I of I', 640, 452, 9);
        // a door on the cover, by the Ministry's engraver: closed
        shape(R(616, 500, 48, 80), { lw: 1.2, id: 6205, fill: P.paper, h: [Math.PI / 2, 3, 0.4] }); ball(655, 542, 2.4, 6206, PAT.f, 0.6); };
      const approval = () => { page(); ftxt('APPROVAL OF THE DELEGATES', 640, 168, 20); ftxt('The undersigned have read these proceedings and approve them as a true record.', 640, 204, 13, { italic: true });
        ['The Objectist', 'The Transitionist', 'The Conventionalist', 'The Encounterist'].forEach((n, i) => { const y = 280 + i * 78; line([440, y], [760, y], 1, 6210 + i, 0.3); ftxt(n, 600, y + 18, 13, { italic: true }); mtxt('date', 800, y - 4, 9); line([780, y], [860, y], 1, 6220 + i, 0.3); });
        mtxt('p. 1,204', 640, 596, 9); };
      const u = U(lt, tu.at, tu.at + 0.8);
      if (u <= 0) cover(); else if (u >= 1) approval(); else { approval(); X.save(); const w = 576 * Math.cos(u * Math.PI); X.translate(352, 0); X.scale(Math.abs(w) / 576 + 0.001, 1); X.translate(-352, 0); if (w > 0) cover(); else page(); X.restore(); }
    });
    const c = 0;
  } else {
    const S = baseState('published'); S.night = 0.85; S.day = finalDay(); S.beard = 1; S.hair = 1; S.carafe = 0; S.path = 1; S.subc = true; S.clockT = 23 * 3600;
    for (const k of 'OTVK') Object.assign(S.seat[k], { sleep: 1, hat: 1 }); S.chair.sleep = 1;
    S.plain = 0.5; S.basket = 0;
    cam(ON(PLAIN.cx - 40, 530, lerp(2.2, 2.5, U(lt, dr.at, sd))), () => drawHall(S));
  }
};
SHOTS.end = (lt, sd, sh) => {
  shape(R(0, 0, W, H), { lw: 0, fill: P.paper });
  X.save(); X.globalAlpha = seg(lt, 0.4, 1.6);
  ftxt('THE GREAT INTERNATIONAL CONGRESS OF DOORS', 640, 190, 26);
  ftxt('four definitions, and no way out', 640, 226, 17, { italic: true });
  line([560, 268], [720, 268], 1, 6300, 0.3);
  X.restore();
  X.save(); X.globalAlpha = seg(lt, 1.6, 2.8);
  ftxt('THE HOUSE THAT LANGUAGE BUILT', 640, 330, 30);
  ftxt('a fable of Edifiction', 640, 372, 19, { italic: true });
  ftxt('after notes by Watson Hartsoe', 640, 420, 17, { italic: true });
  ftxt('in the manner of Stanisław Lem', 640, 448, 17, { italic: true });
  X.restore();
  // a small plain door, half open, a line of light
  X.save(); X.globalAlpha = seg(lt, 3.0, 4.2);
  shape(R(622, 500, 36, 70), { lw: 1.2, id: 6310, fill: '#fbf6e6' }); shape([[622, 500], [638, 503], [638, 569], [622, 570]], { lw: 1.1, id: 6311, fill: P.paper, h: [Math.PI / 2, 4, 0.4] });
  line([600, 570], [680, 570], 1.2, 6312, 0.3);
  X.restore();
};

/* ================= frame loop ================= */
window.__render = async (f) => {
  const t = f / 24; GT = t; BOIL = Math.floor(f / 2);
  let i = 0; for (let j = 0; j < T.shots.length; j++) if (t >= T.shots[j].t0) i = j;
  const sh = T.shots[i], lt = t - sh.t0, sd = sh.d;
  X.setTransform(1, 0, 0, 1, 0, 0); X.fillStyle = P.paper; X.fillRect(0, 0, W, H);
  X.save(); path(R(PX0, PY0, PX1 - PX0, PY1 - PY0)); X.clip();
  X.lineCap = 'butt'; X.lineJoin = 'miter'; X.setLineDash([]); X.globalAlpha = 1;
  SHOTS[sh.shot](lt, sd, sh);
  X.restore(); X.setTransform(1, 0, 0, 1, 0, 0); X.globalAlpha = 1;
  const fade = sh.shot === 'title' ? Math.max(1 - seg(lt, 0, 0.6), seg(lt, sd - 0.7, sd)) : sh.shot === 'end' ? Math.max(1 - seg(lt, 0, 0.5), seg(lt, sd - 1.2, sd)) : Math.max(1 - seg(lt, 0, 0.5), seg(lt, sd - 0.35, sd));
  if (fade > 0) { X.fillStyle = P.paper; X.globalAlpha = fade; X.fillRect(0, 0, W, H); X.globalAlpha = 1; }
  border();
};
(async () => {
  T = await (await fetch('timing/cd.json')).json();
  await document.fonts.ready; await Promise.all(['IM Fell English', 'IBM Plex Mono'].map((n) => document.fonts.load(`20px "${n}"`))); await document.fonts.load(`italic 20px "IM Fell English"`); await document.fonts.load(`600 20px "IBM Plex Mono"`);
  X = document.getElementById('film').getContext('2d');
  window.__NF = Math.ceil(T.dur * 24); window.__T = T; window.__ready = true;
})();
