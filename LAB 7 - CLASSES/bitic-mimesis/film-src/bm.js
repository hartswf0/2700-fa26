/* A History of Bitic Literature: Monoetics and Mimesis. Drawing. After Stanisław Lem (trans. Marc E. Heine); narration paraphrases Lem.
   Same toolkit and the same study as the first bitic film (bitic-literature/film-src/bl.js): ink.js (Kingdoms in a Box), the head of
   the Ferrix drawing file, and the study (shelf, lectern page, desk, reader), copied below unchanged from its fourth line to the reading machine. */
const W = 1280, H = 720, PX0 = 22, PY0 = 22, PX1 = 1258, PY1 = 698, CX = 640, CY = 360;
let KEYROT = 0;
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
function coil(pts, w) {
  if (SILENT) return;
  X.beginPath(); pts.forEach(([x, y], i) => (i ? X.lineTo(x, y) : X.moveTo(x, y)));
  X.lineJoin = 'round'; X.lineCap = 'round'; X.lineWidth = w; X.strokeStyle = P.ink; X.stroke();
  X.setLineDash([w * 0.35, w * 0.55]); X.lineWidth = w * 0.55; X.strokeStyle = P.paper; X.stroke(); X.setLineDash([]); X.lineCap = 'butt';
}
/* The box head every constructor in the cards wears: wire locks, square spectacles, moustache. */
function boxHead(x, y, s, id, o = {}) {
  if (SILENT) return;
  X.save(); X.translate(x, y); X.rotate(o.tilt || 0); X.scale(s * (o.f || 1), s);
  const sw = o.sway || 0;
  if (o.hair !== false) for (let i = 0; i < 16; i++) {
    const d = i < 8 ? -1 : 1, k = i % 8, sx = d * (3 + k * 2.6), len = 30 + hash(id, i) * 30;
    const ex = d * (24 + k * 4.2) + sw * (k + 2) * 0.7, ey = -36 + len, cx = sx + d * (10 + k * 3.4), cy = -66 - hash(id, i + 20) * 12;
    const p = []; for (let j = 0; j <= 10; j++) { const u = j / 10, A = (1 - u) * (1 - u), B = 2 * u * (1 - u), C = u * u; p.push([A * sx + B * cx + C * ex + Math.sin(u * 9 + i) * 1.5 + J(id + i, j) * 0.6, A * -40 + B * cy + C * ey]); }
    coil(p, 4.2);
  }
  shape(R(-29, -6, 6, 15), { lw: 1.2, id: id + 30 }); shape(R(23, -6, 6, 15), { lw: 1.2, id: id + 31 });
  const hd = [[-24, -40], [24, -40], [22, 38], [-22, 38]];
  shape(hd, { lw: 2, id: id + 1, sh: [[9, -42], [30, -42], [30, 42], [9, 42]], sh2: [Math.PI / 2 + 0.06, 2.5, 0.8] });
  line([-24, -30], [24, -30], 0.9, id + 40, 0.2);
  if (o.stern) { line([-19, -23], [-4, -18], 2, id + 2, 0.2); line([4, -18], [19, -23], 2, id + 3, 0.2); }
  else { line([-19, -20], [-4, -19], 1.8, id + 2, 0.2); line([4, -19], [19, -20], 1.8, id + 3, 0.2); }
  if (o.glasses !== false) { shape(R(-19, -15, 15, 10), { lw: 1.6, id: id + 4 }); shape(R(4, -15, 15, 10), { lw: 1.6, id: id + 5 }); line([-4, -11], [4, -11], 1.2, id + 6, 0.1); }
  const lx = (o.look || 0) * 3, ly = (o.lookY || 0) * 2;
  if (o.closed) { line([-15, -9], [-8, -9], 1.5, id + 7, 0.1); line([8, -9], [15, -9], 1.5, id + 8, 0.1); }
  else { X.fillStyle = P.ink; X.fillRect(-13 + lx, -12 + ly, 3.6, 4.4); X.fillRect(9 + lx, -12 + ly, 3.6, 4.4); }
  shape([[-2, -4], [3, -4], [5, 8], [-3, 8]], { lw: 1.2, id: id + 9 });
  if (o.mus !== false) for (const d of [-1, 1]) {
    const p = []; for (let j = 0; j <= 9; j++) { const u = j / 9; p.push([d * (1 + u * 17), 13 + Math.sin(u * Math.PI) * 2.5 - u * u * 7]); }
    X.beginPath(); p.forEach(([a, b], i) => (i ? X.lineTo(a, b) : X.moveTo(a, b))); X.lineWidth = 3.6; X.lineCap = 'round'; X.strokeStyle = P.ink; X.stroke(); X.lineCap = 'butt';
    X.beginPath(); X.arc(d * 19, 3, 2.6, 0, 6.283); X.lineWidth = 1.6; X.stroke();
  }
  { const mo = o.mouth || 0; shape(R(-9, 24 - mo * 3, 18, 4.5 + mo * 8), { fill: P.ink, lw: 0.8, id: id + 12 }); }
  X.restore();
}
/* Microminian: a small box robot with an antenna */
function micro(x, y, s, id, o = {}) {
  if (SILENT) return;
  X.save(); X.translate(x, y); X.scale(s * (o.f || 1), s);
  const ph = o.ph || 0, wk = o.walk || 0;
  for (const k of [-1, 1]) {
    const q = ph + (k > 0 ? Math.PI : 0), sw = Math.sin(q) * wk * 6, lift = Math.max(0, Math.cos(q)) * wk * 3;
    line([k * 4, -18], [k * 4 + sw, -2 - lift], 2.2, id + k + 5, 0.15);
    shape(R(k * 4 + sw - 4, -3 - lift, 9, 3.4), { fill: P.ink, lw: 0.6, id: id + k + 8 });
  }
  const wv = o.wave || 0;
  line([-8, -30], [-13, -20 - wv * 18], 2, id + 11, 0.15); line([8, -30], [13, -19], 2, id + 12, 0.15);
  shape(R(-8, -35, 16, 18), { lw: 1.4, id, sh: [[3, -36], [9, -36], [9, -16], [3, -16]], sh2: [1.5, 1.8, 0.6] });
  if (s > 0.5) { shape(R(-4, -31, 8, 6), { lw: 0.8, id: id + 13 }); }
  const hy = -46 - (o.bob || 0), tl = o.tilt || 0;
  X.save(); X.translate(0, hy); X.rotate(tl);
  shape(R(-8, -7, 16, 13), { lw: 1.4, id: id + 2 });
  for (const k of [-1, 1]) { X.beginPath(); X.arc(k * 3.6, -1, 2.6, 0, 6.283); X.fillStyle = P.paper; X.fill(); X.lineWidth = 0.9; X.strokeStyle = P.ink; X.stroke(); X.fillStyle = P.ink; X.fillRect(k * 3.6 - 0.9 + (o.look || 0), -2 + (o.lookY || 0), 1.9, 1.9); }
  if ((o.mouth || 0) > 0.05) { X.fillStyle = P.ink; X.fillRect(-3, 3, 6, 1 + o.mouth * 3); } else line([-3, 4], [3, 4], 0.9, id + 3, 0.05);
  line([0, -7], [o.ant || 0, -15], 1.1, id + 4, 0.1); ball(o.ant || 0, -16, 2, id + 6, PAT.f, 0.8);
  X.restore(); X.restore();
}
function tinyMicro(x, y, s, id) { // crowd-scale figure
  if (SILENT) return;
  X.fillStyle = P.paper; X.strokeStyle = P.ink; X.lineWidth = Math.max(0.6, s * 1.3);
  X.fillRect(x - 6 * s, y - 32 * s, 12 * s, 15 * s); X.strokeRect(x - 6 * s, y - 32 * s, 12 * s, 15 * s);
  X.fillRect(x - 6 * s, y - 44 * s, 12 * s, 10 * s); X.strokeRect(x - 6 * s, y - 44 * s, 12 * s, 10 * s);
  X.fillStyle = P.ink; X.fillRect(x - 3.5 * s, y - 41 * s, 2.2 * s, 2.2 * s); X.fillRect(x + 1.5 * s, y - 41 * s, 2.2 * s, 2.2 * s);
  X.fillRect(x - 3.5 * s, y - 17 * s, 2 * s, 17 * s); X.fillRect(x + 1.5 * s, y - 17 * s, 2 * s, 17 * s);
  X.fillRect(x + 1 * s, y - 32 * s, 4 * s, 15 * s);
  X.beginPath(); X.moveTo(x, y - 44 * s); X.lineTo(x + (hash(id, 1) - 0.5) * 3 * s, y - 51 * s); X.stroke();
}

/* ---------- architecture ---------- */
function tower(x, y, w, h, id, o = {}) { // y = base
  const body = R(x - w / 2, y - h, w, h);
  shape(body, { lw: 1.3, id, sh: R(x + w * 0.12, y - h, w * 0.4, h), sh2: [Math.PI / 2, Math.max(1.4, w * 0.09), 0.6] });
  for (let i = 0; i < Math.floor(h / (w * 0.9)); i++) X.fillStyle = P.ink, X.fillRect(x - w * 0.12, y - h + w * 0.5 + i * w * 0.9, w * 0.2, w * 0.35);
  const rh = w * (o.roof ?? 1.4);
  if (o.crenel) { for (let i = 0; i < 4; i++) shape(R(x - w / 2 + i * w / 3.5, y - h - w * 0.18, w * 0.18, w * 0.18), { lw: 0.8, id: id + 9 + i }); }
  else { shape([[x - w * 0.62, y - h], [x + w * 0.62, y - h], [x, y - h - rh]], { lw: 1.3, id: id + 1, h: [-1.1, Math.max(1.3, w * 0.08), 0.6] });
    if (o.flag !== false) { line([x, y - h - rh], [x, y - h - rh - w * 0.7], 1, id + 2, 0.1); const fw = Math.sin((o.t || 0) * 5 + id) * w * 0.06;
      shape([[x, y - h - rh - w * 0.7], [x + w * 0.55, y - h - rh - w * 0.58 + fw], [x, y - h - rh - w * 0.45]], { fill: o.red ? P.red : P.paper, lw: 0.8, id: id + 3 }); } }
}
function castle(x, y, s, id, o = {}) { // grow 0..1 raises towers in order
  const g = o.grow ?? 1, t = o.t || 0;
  const parts = [[-70, 26, 70], [70, 26, 64], [-34, 30, 110], [36, 28, 96], [0, 40, 160], [-104, 18, 46], [104, 18, 40]];
  X.save(); X.translate(x, y); X.scale(s, s);
  const wall = clamp(g * 3);
  if (wall > 0) { const wh = 34 * wall; shape(R(-110, -wh, 220, wh), { lw: 1.4, id, sh: R(30, -wh, 80, wh), sh2: [0.05, 2.4, 0.6] });
    for (let i = 0; i < 14; i++) shape(R(-110 + i * 16, -wh - 6, 9, 6), { lw: 0.7, id: id + 50 + i });
    shape([[-14, 0], [-14, -18], [0, -26], [14, -18], [14, 0]], { fill: P.ink, lw: 1, id: id + 70 }); }
  parts.forEach(([px, w, h], i) => { const u = clamp((g - 0.12 - i * 0.1) / 0.18); if (u <= 0) return; tower(px, 0, w, h * E.out(u), id + 100 + i * 10, { t, red: i === 4 }); });
  X.restore();
}
function tree(x, y, s, id) { line([x, y], [x, y - 8 * s], Math.max(0.8, s), id, 0.1); ball(x, y - 12 * s, 6 * s, id + 1, PAT.m, Math.max(0.6, s * 0.9)); }

/* ---------- the king ---------- */
function excelsius(x, y, s, id, o = {}) {
  if (SILENT) return;
  X.save(); X.translate(x, y); X.scale(s, s);
  // pedestal
  shape([[-62, 0], [62, 0], [62, -112], [-62, -112]], { lw: 2, id, sh: R(20, -112, 42, 112), sh2: [Math.PI / 2, 2.6, 0.8] });
  shape([[-62, -112], [62, -112], [48, -128], [-48, -128]], { lw: 1.6, id: id + 1, h: [0, 3.5, 0.5] });
  shape([[-74, 0], [74, 0], [74, -14], [-74, -14]], { lw: 1.6, id: id + 2, h: [0, 2.4, 0.6] });
  // legs splayed out from under the robe
  cap(-58, -150, -100, -16, 15, id + 3); cap(58, -150, 100, -16, 15, id + 4); ball(-80, -84, 8, id + 5, PAT.f, 1.2); ball(80, -84, 8, id + 6, PAT.f, 1.2);
  boot(-104, 0, -1, 1.4, id + 7); boot(104, 0, 1, 1.4, id + 8);
  // robe
  const robe = [[-130, -150], [-150, -118], [-104, -122], [-60, -140], [0, -126], [60, -140], [104, -122], [150, -118], [134, -170], [104, -250], [60, -292], [0, -300], [-60, -292], [-104, -250]];
  shape(robe, { lw: 2.2, id: id + 10, h: [1.9, 6, 0.5], sh: [[20, -300], [140, -260], [150, -118], [20, -126]], sh2: [[1.75, 2.8, 0.8], [0.4, 4.5, 0.5]] });
  for (let i = 0; i < 7; i++) { const fx = -110 + i * 36; ink([[fx, -150 + Math.abs(fx) * 0.05], [fx + 6, -200], [fx * 0.6, -270]], 1, id + 20 + i, 0.8); }
  // arms: crossed, or the right arm lifted to command
  const p = o.point || 0;
  cap(-46, -278, -66, -212, 17, id + 30); ball(-66, -212, 9, id + 31, PAT.f, 1.2);
  if (p < 0.02) { cap(46, -278, 66, -212, 17, id + 32); ball(66, -212, 9, id + 33, PAT.f, 1.2); }
  cap(-66, -212, 42, -244, 15, id + 34); hand(48, -246, -0.3, 9, id + 35);
  if (p >= 0.02) { const a1 = -0.9 - p * 0.6, ex = 46 + Math.cos(a1 + 0.9) * 60, ey = -278 + Math.sin(a1 + 0.9) * 60 * (1 - p) - p * 30;
    const [ax, ay, hx, hy] = limb(46, -278, 1.2 - p * 1.9, 62, 2.6 - p * 3.0, 70, 16, id + 36); hand(hx, hy, -0.4 - p * 0.8, 9, id + 39, p); void ex; void ey; void ax; void ay; }
  else { cap(66, -212, -42, -238, 15, id + 40); hand(-48, -238, Math.PI + 0.3, 9, id + 41); }
  ball(0, -306, 9, id + 44, PAT.f, 1.3);
  X.restore();
  boxHead(x + (o.hx || 0) * s, y - 352 * s, 1.15 * s, id + 60, { stern: true, look: o.look || 0, tilt: o.tilt || 0, sway: o.sway || 0, mouth: o.mouth || 0 });
}
/* Trurl and Klapaucius: jointed wooden mannequins with the same box heads */
function constructor_(x, y, s, id, o = {}) {
  if (SILENT) return;
  X.save(); X.translate(x, y); X.scale(s * (o.f || 1), s);
  const ra = o.ra || [1.85, 1.62], la = o.la || [1.3, 1.52];
  const back = () => { const [, , hx, hy] = limb(-30, -214, la[0], 62, la[1], 58, 15, id + 1); hand(hx, hy, la[1], 8, id + 4); };
  if (!o.seated) {
    back();
    for (const k of [-1, 1]) { const [, , fx, fy] = limb(k * 13, -128, Math.PI / 2 - k * 0.06, 64, Math.PI / 2 + k * 0.04, 62, 17, id + 10 + k * 5); boot(fx + k * 2, 0, 1, 1.2, id + 20 + k); void fy; }
  } else {
    for (const k of [-1, 1]) { limb(k * 13, -128, 0.06, 66, Math.PI / 2 + 0.05, 64, 17, id + 10 + k * 5); boot(66 + k * 4, 0, 1, 1.2, id + 20 + k); }
    back();
  }
  shape([[-24, -140], [24, -140], [20, -116], [-20, -116]], { lw: 1.5, id: id + 30, sh: R(6, -140, 20, 26), sh2: [1.5, 2.2, 0.6] });
  cap(0, -146, 0, -180, 14, id + 31);
  shape([[-38, -224], [38, -224], [28, -170], [-28, -170]], { lw: 1.8, id: id + 32, sh: [[12, -226], [40, -226], [30, -168], [12, -168]], sh2: [1.65, 2.4, 0.7] });
  shape(R(-14, -212, 28, 22), { lw: 1, id: id + 33 }); line([-10, -206], [10, -206], 0.7, id + 34); line([-10, -200], [6, -200], 0.7, id + 35);
  ball(-34, -220, 9, id + 36, PAT.f, 1.2); ball(34, -220, 9, id + 37, PAT.f, 1.2);
  if (o.robe) shape([[-46, -232], [-10, -226], [44, -150], [60, -60], [-10, -46], [-58, -80], [-50, -150]], { lw: 2, id: id + 40, h: [1.75, 5, 0.5], sh: [[10, -230], [70, -230], [70, -40], [10, -40]], sh2: [1.65, 2.6, 0.7] });
  if (o.robe) for (let i = 0; i < 5; i++) ink([[-40 + i * 18, -60], [-30 + i * 14, -140], [-26 + i * 8, -210]], 1, id + 50 + i, 0.8);
  cap(0, -228, 0, -244, 10, id + 38);
  const [, , hx, hy] = limb(30, -214, ra[0], 62, ra[1], 58, 15, id + 60); hand(hx, hy, ra[1], 8, id + 63, o.open || 0);
  X.restore();
  boxHead(x + (o.hx || 0) * s * (o.f || 1), y - 286 * s, 0.95 * s, id + 80, { f: o.f, look: o.look || 0, tilt: o.tilt || 0, closed: o.closed, sway: o.sway || 0, lookY: o.lookY || 0, mouth: o.mouth || 0 });
}

/* ---------- the box ---------- */
function glassCase(cx, cy, w, h, id, o = {}) {
  const dx = w * 0.16, dy = -h * 0.2, x0 = cx - w / 2, y0 = cy - h / 2, x1 = cx + w / 2, y1 = cy + h / 2;
  return {
    back() { shape([[x0 + dx, y0 + dy], [x1 + dx, y0 + dy], [x1 + dx, y1 + dy], [x0 + dx, y1 + dy]], { fill: null, lw: 1, id: id + 1, amp: 0.3 }); },
    front: R(x0, y0, w, h),
    frame() {
      for (const [a, b] of [[[x0, y0], [x0 + dx, y0 + dy]], [[x1, y0], [x1 + dx, y0 + dy]], [[x1, y1], [x1 + dx, y1 + dy]]]) { line(a, b, 2.4, id + 3, 0.3); }
      shape([[x0, y0], [x1, y0], [x1 + dx, y0 + dy], [x0 + dx, y0 + dy]], { fill: 'rgba(235,227,207,.35)', lw: 2.2, id: id + 4 });
      shape([[x1, y0], [x1 + dx, y0 + dy], [x1 + dx, y1 + dy], [x1, y1]], { fill: 'rgba(235,227,207,.25)', lw: 2.2, id: id + 5 });
      ink([[x0, y0], [x1, y0], [x1, y1], [x0, y1], [x0, y0]], 3.2, id + 6, 0.4);
      ink([[x0 + 5, y0 + 5], [x1 - 5, y0 + 5], [x1 - 5, y1 - 5], [x0 + 5, y1 - 5], [x0 + 5, y0 + 5]], 0.8, id + 7, 0.3);
      X.save(); path(R(x0, y0, w, h)); X.clip(); X.globalAlpha = 0.55;
      for (const [u, ww] of [[0.18, 18], [0.27, 6], [0.72, 12]]) { const gx = x0 + u * w; X.beginPath(); X.moveTo(gx, y0); X.lineTo(gx + ww, y0); X.lineTo(gx + ww - h * 0.5, y1); X.lineTo(gx - h * 0.5, y1); X.fillStyle = P.paper; X.fill(); }
      X.restore(); X.globalAlpha = 1;
      for (const fx of [x0, x1, x1 + dx]) ball(fx, (fx > x1 ? y1 + dy : y1) + 9, 9, id + 10 + fx | 0, PAT.m, 1.4);
      if (o.key !== false) { line([x1 + dx * 0.5, cy], [x1 + dx * 0.5 + 22, cy], 3, id + 20, 0.2); X.save(); X.translate(x1 + dx * 0.5 + 28, cy); X.scale(1, Math.cos(KEYROT) * 0.85 + (Math.cos(KEYROT) >= 0 ? 0.15 : -0.15)); shape([[-6, -16], [6, -8], [6, 8], [-6, 16]], { lw: 1.6, id: id + 21, h: [0.4, 2.4, 0.6] }); X.restore(); }
    },
  };
}
function landscape(x0, y0, w, h, id, t, layer) {
  const gy = y0 + h * 0.62;
  if (layer === 'sky') { X.save(); X.globalAlpha = 0.5; skyLines(y0, gy, gy + 400); X.restore(); X.beginPath(); X.arc(x0 + w * 0.22, y0 + h * 0.2, h * 0.07, 0, 6.283); X.fillStyle = P.paper; X.fill(); X.lineWidth = 1.2; X.strokeStyle = P.ink; X.stroke(); return; }
  if (layer === 'far') {
    const m = [[x0 - 20, gy]]; for (let i = 0; i <= 16; i++) m.push([x0 + i * w / 16, gy - h * (0.12 + 0.13 * hash(id, i))]); m.push([x0 + w + 20, gy]);
    shape(m, { lw: 1.2, id: id + 1, h: [0.6, 3.6, 0.5] });
    castle(x0 + w * 0.52, gy - h * 0.14, h / 520, id + 200, { t });
    shape([[x0 + w * 0.36, gy], [x0 + w * 0.43, gy - h * 0.15], [x0 + w * 0.62, gy - h * 0.15], [x0 + w * 0.7, gy]], { lw: 1.4, id: id + 3, h: [1.2, 2.6, 0.6] });
    return;
  }
  if (layer === 'mid') {
    const m = [[x0 - 40, y0 + h + 40]]; for (let i = 0; i <= 12; i++) m.push([x0 - 40 + i * (w + 80) / 12, gy + h * 0.02 + Math.sin(i * 1.3 + id) * h * 0.03]); m.push([x0 + w + 40, y0 + h + 40]);
    shape(m, { lw: 1.3, id: id + 5, h: [0.12, 4, 0.45] });
    for (let i = 0; i < 46; i++) { const u = hash(id + 7, i), v = hash(id + 8, i); if (u > 0.38 && u < 0.64 && v < 0.5) continue; tree(x0 + u * w, gy + h * 0.05 + v * h * 0.12, h / 300, id + 300 + i * 3); }
    for (let i = 0; i < 4; i++) { const ax = x0 + w * (0.15 + i * 0.22), ay = gy + h * 0.1; shape(R(ax, ay - h * 0.04, h * 0.05, h * 0.04), { lw: 0.8, id: id + 400 + i, h: [1.57, 1.6, 0.4] }); shape([[ax - 2, ay - h * 0.04], [ax + h * 0.025, ay - h * 0.07], [ax + h * 0.05 + 2, ay - h * 0.04]], { lw: 0.8, id: id + 410 + i, fill: P.ink }); }
    return;
  }
  if (layer === 'near') {
    const fy = gy + h * 0.2;
    for (let i = 0; i < 6; i++) { const fx = x0 + i * w / 6; shape([[fx, fy], [fx + w / 6, fy], [fx + w / 6 + 12, y0 + h], [fx - 12, y0 + h]], { lw: 1, id: id + 500 + i, h: [i % 2 ? 1.2 : 0.2, 3.2, 0.5] }); }
    const rv = []; for (let i = 0; i <= 10; i++) rv.push([x0 + w * 0.48 + Math.sin(i * 0.9) * 22 + i * 6, fy + i * (y0 + h - fy) / 10]);
    X.save(); X.beginPath(); rv.forEach(([a, b], i) => (i ? X.lineTo(a, b) : X.moveTo(a, b))); X.lineWidth = 18; X.strokeStyle = P.paper; X.stroke(); X.restore(); ink(rv.map(([a, b]) => [a - 9, b]), 1, id + 600, 0.4); ink(rv.map(([a, b]) => [a + 9, b]), 1, id + 601, 0.4);
    for (let i = 0; i < 9; i++) { const u = hash(id + 9, i); micro(x0 + w * (0.08 + u * 0.84), fy + h * 0.06 + hash(id + 10, i) * h * 0.1, h / 1100, id + 700 + i * 20, { walk: 1, ph: t * 7 + i, f: i % 2 ? 1 : -1 }); }
  }
}

/* ---------- space ---------- */
function space(cam, id, drift = 0) {
  if (SILENT) return;
  X.fillStyle = DARK; X.fillRect(0, 0, W, H);
  X.fillStyle = 'rgba(235,227,207,.06)'; for (let y = 0; y < H; y += 3) X.fillRect(0, y, W, 1);
  for (const [d, n, sz] of [[7, 170, 0.9], [3.2, 70, 1.4], [1.7, 22, 2.4]]) plane(cam, d, () => {
    for (let i = 0; i < n; i++) {
      const x = ((hash(i, d * 10 | 0) * 1800 - drift / d) % 1800 + 1800) % 1800 - 260, y = hash(i + 999, d * 10 | 0) * 860 - 70;
      if (sz > 2 && hash(i, 77) > 0.3) star(x, y, sz * 3.2, id + i * 11, P.paper, 8);
      else { X.fillStyle = P.paper; X.globalAlpha = 0.5 + 0.5 * hash(i, BOIL >> 2); X.fillRect(x, y, sz, sz); X.globalAlpha = 1; }
    }
  });
}
function planet(x, y, r, id, rings) {
  if (rings) { X.save(); X.translate(x, y); X.rotate(-0.25); X.beginPath(); X.ellipse(0, 0, r * 2, r * 0.45, 0, Math.PI, 0); X.lineWidth = 2; X.strokeStyle = P.paper; X.stroke(); X.restore(); }
  ball(x, y, r, id, PAT.m, 1.6);
  if (rings) { X.save(); X.translate(x, y); X.rotate(-0.25); X.beginPath(); X.ellipse(0, 0, r * 2, r * 0.45, 0, 0, Math.PI); X.lineWidth = 2; X.strokeStyle = P.paper; X.stroke(); X.lineWidth = 0.8; X.strokeStyle = P.ink; X.stroke(); X.restore(); }
}
function rock(x, y, r, id, n = 22) { const p = []; for (let i = 0; i < n; i++) { const a = i / n * 6.283, rr = r * (0.86 + 0.22 * hash(id, i)); p.push([x + Math.cos(a) * rr, y + Math.sin(a) * rr * 0.92]); } return p; }

/* ---------- camera ---------- */
function plane(cam, d, fn) {
  X.save(); const k = Math.pow(cam.z, 1 / d);
  X.setTransform(k, 0, 0, k, CX - k * (CX + cam.x / d), CY - k * (CY + cam.y / d)); fn(k); X.restore();
}
const lerp = (a, b, u) => a + (b - a) * u;


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

/* ================= the study ================= */
const FLOOR = 664, PAPER2 = '#f4eedc';
const PG = { x: 262, y: 216, w: 378, h: 396 };            // the page on the lectern
const SHELF_Y = 196;
const VOLS = [{ w: 50 }, { w: 54 }, { w: 82 }, { w: 50 }, { w: 42 }];
(() => { let x = 486; VOLS.forEach((v, i) => { v.x = x; x += v.w + 6; v.n = ['I', 'II', 'III', 'IV', 'V'][i]; }); })();
const volMid = (k) => VOLS[k - 1].x + VOLS[k - 1].w / 2;

function wallAndFloor() {
  X.fillStyle = P.paper; X.fillRect(-600, -600, 2500, 1900);
  for (let y = -400, k = 0; y < FLOOR; y += 3.6, k++) { X.fillStyle = P.ink; X.globalAlpha = 0.38; X.fillRect(-600, y, 2500, 0.55 + 0.25 * hash(k, 4)); }
  X.globalAlpha = 1;
  X.fillStyle = P.paper; X.fillRect(-600, FLOOR, 2500, 600);
  for (let y = FLOOR + 3, k = 0; y < 900; y += 4 + k * 0.5, k++) { X.fillStyle = P.ink; X.fillRect(-600, y, 2500, 0.5 + k * 0.05); }
  line([-600, FLOOR], [1900, FLOOR], 2.4, 7400, 0.3);
}
function spine(x, y, w, h, n, id, o = {}) { // y = bottom
  shape(R(x, y - h, w, h), { lw: 1.6, id, fill: o.fill || '#d9cfb4', h: [Math.PI / 2, 3.2, 0.5], sh: R(x + w * 0.62, y - h, w * 0.38, h), sh2: [Math.PI / 2, 1.6, 0.8] });
  for (const q of [0.12, 0.2, 0.8, 0.88]) line([x, y - h * q], [x + w, y - h * q], 1.6, id + q * 100, 0.2);
  shape(R(x + w * 0.16, y - h * 0.66, w * 0.68, h * 0.22), { lw: 1.1, id: id + 7, fill: P.paper });
  txt(n, x + w / 2, y - h * 0.55, Math.min(18, w * 0.42), {});
}
/* the shelf; out = the volume (1-5) that is off the shelf, lift 0..1 the pull */
function shelf(o = {}) {
  shape(R(440, SHELF_Y, 420, 12), { lw: 1.8, id: 7100, h: [0.1, 3, 0.6] });
  for (const bx of [470, 830]) shape([[bx - 6, SHELF_Y + 12], [bx + 6, SHELF_Y + 12], [bx + 6, SHELF_Y + 44], [bx - 6, SHELF_Y + 22]], { lw: 1.4, id: 7110 + bx, fill: P.ink });
  VOLS.forEach((v, i) => {
    const k = i + 1; let dy = 0, al = 1;
    if (o.out === k) { const l = o.lift ?? 1; dy = -46 * E.io(clamp(l * 2)); al = 1 - clamp((l - 0.5) * 2); }
    if (al <= 0) return;
    X.save(); X.globalAlpha = al; spine(v.x, SHELF_Y + dy, v.w, 138, v.n, 7200 + i * 20); X.restore();
  });
  shape([[836, SHELF_Y], [852, SHELF_Y], [852, SHELF_Y - 70], [836, SHELF_Y - 50]], { lw: 1.4, id: 7300, h: [0.8, 2.4, 0.6] });
}
function lectern() {
  const x0 = PG.x + 40, x1 = PG.x + PG.w - 40, y = PG.y + PG.h + 6;
  shape([[PG.x - 18, y - 8], [PG.x + PG.w + 14, y - 8], [PG.x + PG.w + 4, y + 6], [PG.x - 8, y + 6]], { lw: 1.6, id: 7500, h: [0.1, 2.6, 0.6] });
  for (const [a, b] of [[x0, x0 - 30], [x1, x1 + 30]]) line([a, y + 6], [b, FLOOR], 4, 7510 + a, 0.3);
  line([PG.x + PG.w / 2, y + 6], [PG.x + PG.w / 2, FLOOR], 5, 7520, 0.3);
}
/* the book's body behind the page: left leaf stack and cover edge */
function bookBody() {
  shape(R(PG.x - 14, PG.y + 6, PG.w + 22, PG.h + 4), { lw: 1.6, id: 7600, fill: '#4b4137' });
  for (let i = 0; i < 4; i++) line([PG.x - 10 + i * 2.2, PG.y + 8 + i], [PG.x - 10 + i * 2.2, PG.y + PG.h + 4 - i], 0.8, 7610 + i, 0.2, P.paper);
}
function pageBase(head, folio) {
  shape(R(PG.x, PG.y, PG.w, PG.h), { lw: 1.4, id: 7700, fill: PAPER2, amp: 0.3 });
  if (head) txt(head, PG.x + PG.w / 2, PG.y + 20, 9, { mono: true, col: '#5d564b' });
  if (folio) txt(folio, PG.x + PG.w / 2, PG.y + PG.h - 14, 9, { mono: true, col: '#5d564b' });
}
const TX0 = PG.x + 30, TW = PG.w - 60, TY0 = PG.y + 48, LEAD = 15.6, FS = 12;
const FONTI = (sz) => `italic ${sz}px ${FONT}`, FONTR = (sz) => `${sz}px ${FONT}`;
function wrap(text, width, font) {
  X.font = font; const out = []; for (const para of text.split('\n')) { let cur = ''; for (const w of para.split(' ')) { const t = cur ? cur + ' ' + w : w; if (X.measureText(t).width > width && cur) { out.push(cur); cur = w; } else cur = t; } out.push(cur); out.push(''); }
  out.pop(); return out;
}
/* text lines, revealed up to n characters; returns the position after the last shown character */
function textLines(lines, n = 1e9, o = {}) {
  X.font = o.font || FONTR(FS); X.textAlign = 'left'; X.textBaseline = 'alphabetic'; X.fillStyle = o.col || P.ink;
  let left = n, y = o.y0 ?? TY0, end = [TX0, y];
  for (let i = 0; i < lines.length; i++) {
    if (left <= 0) break; const s = lines[i], show = s.slice(0, Math.max(0, left)); left -= s.length + 1;
    X.globalAlpha = o.alpha ?? 1; X.fillText(show, TX0, y); end = [TX0 + X.measureText(show).width, y]; y += LEAD;
  }
  X.globalAlpha = 1; return end;
}
const lineY = (i, y0 = TY0) => y0 + i * LEAD;
/* Volume II: the same kind of page, drifting toward pattern. u 0..1 */
function driftLines(lines, u, pg, o = {}) {
  X.font = FONTR(FS); X.textAlign = 'left'; X.textBaseline = 'alphabetic';
  const VOC = ['train', 'late', 'letter', 'money', 'again', 'river', 'page', 'brother'];
  let prev = null;
  for (let i = 0; i < lines.length; i++) {
    let s = lines[i]; if (!s) { prev = null; continue; }
    if (prev && hash(i * 31 + pg, 1) < u * 0.75) { const ws = prev.split(' '); const j = Math.floor(hash(i, pg + 3) * ws.length); ws[j] = VOC[Math.floor(hash(i, pg + 4) * VOC.length)]; s = ws.join(' '); }
    prev = s;
    const target = TW * (0.5 + 0.5 * Math.abs(Math.cos(i * 0.42 + pg)));
    let ws = s.split(' ');
    if (u > 0.05) { while (ws.length > 2 && X.measureText(ws.join(' ')).width > lerp(TW, target, u)) ws.pop(); }
    const xo = Math.sin(i * 0.55 + pg * 1.3) * 26 * u + 26 * u;
    let x = TX0 + xo; const y = lineY(i);
    for (let k = 0; k < ws.length; k++) {
      const w = ws[k], ww = X.measureText(w).width;
      if (hash(i * 97 + k, pg + 11) < u * u * 0.3) { X.globalAlpha = 0.55; X.fillStyle = P.ink; X.fillRect(x, y - 7, ww, 6); }
      else { X.globalAlpha = 1 - 0.38 * u + (o.flash ? o.flash * 0.3 : 0); X.fillStyle = P.ink; X.fillText(w, x, y); }
      x += ww + X.measureText(' ').width;
    }
  }
  X.globalAlpha = 1;
}
/* Volume III on: marks a person cannot read. density 0..1 */
function marks(density, pg, o = {}) {
  const y0 = o.y0 ?? TY0 - 10, y1 = o.y1 ?? PG.y + PG.h - 30, sp = lerp(6.5, 2.6, density), gw = lerp(4.5, 2.2, density);
  X.fillStyle = P.ink;
  for (let r = 0, y = y0; y < y1; r++, y += sp) {
    let x = TX0 - 6; const xe = TX0 + TW + 6;
    while (x < xe) {
      const h = hash(r * 131 + pg * 7, Math.floor(x * 3)), k = Math.floor(h * 7);
      X.globalAlpha = (o.alpha ?? 1) * (0.55 + 0.45 * hash(r, Math.floor(x)));
      if (k === 0) X.fillRect(x, y - sp * 0.7, 0.8, sp * 0.7);
      else if (k === 1) X.fillRect(x, y - 1.2, 1.4, 1.4);
      else if (k === 2) X.fillRect(x, y - gw, gw * 0.8, gw * 0.8);
      else if (k === 3) X.fillRect(x, y - 0.8, gw * (1 + 2 * hash(r, x | 0)), 0.8);
      else if (k === 4) { X.fillRect(x, y - sp * 0.5, 0.8, sp * 0.5); X.fillRect(x, y - sp * 0.5, gw * 0.8, 0.8); }
      else if (k === 5) X.fillRect(x, y - gw * 0.6, 0.8, gw * 0.6);
      x += gw * (0.7 + 1.3 * hash(r + 5, Math.floor(x * 7))) + 0.6;
    }
  }
  X.globalAlpha = 1;
}
/* a page turning from right to left about the spine; front and back draw functions (in page space) */
function flip(u, front, back) {
  if (u <= 0 || u >= 1) return;
  const c = Math.cos(Math.PI * u), sx = PG.x;
  X.save(); X.translate(sx, 0); X.scale(c, 1); X.translate(-sx, 0);
  if (c > 0) { front(); X.globalAlpha = 0.5 * (1 - c); X.fillStyle = P.ink; X.fillRect(PG.x, PG.y, PG.w, PG.h); X.globalAlpha = 1; }
  else { (back || (() => { shape(R(PG.x, PG.y, PG.w, PG.h), { lw: 1.4, id: 7790, fill: PAPER2, amp: 0.3 }); }))(); X.globalAlpha = 0.35 * (1 + c); X.fillStyle = P.ink; X.fillRect(PG.x, PG.y, PG.w, PG.h); X.globalAlpha = 1; }
  X.restore();
}
function cover(k) { shape(R(PG.x, PG.y, PG.w, PG.h), { lw: 2, id: 7800, fill: '#d9cfb4', h: [[0.7, 4, 0.5], [-0.7, 4, 0.5]] }); shape(R(PG.x + PG.w / 2 - 70, PG.y + 120, 140, 90), { lw: 1.6, id: 7801, fill: P.paper }); txt('VOLUME', PG.x + PG.w / 2, PG.y + 148, 14, { mono: true }); txt(VOLS[k - 1].n, PG.x + PG.w / 2, PG.y + 182, 34, {}); }
/* page sequence: pages[i] draw functions, turns = times; the cover opens over pull */
function pageStack(lt, pages, turns, vol, pull, fallback) {
  const dur = 0.75; let i = 0; for (const t of turns) if (lt >= t) i++;
  i = Math.min(i, pages.length - 1);
  const coverU = pull ? U(lt, pull.at + 1.5, pull.at + 2.3) : 1;
  if (pull && lt < pull.at + 1.2) { return; }
  bookBody();
  if (coverU < 1 && pull) { pages[0](); if (coverU <= 0) cover(vol); else flip(coverU, () => cover(vol)); return; }
  pages[i]();
  if (i > 0) { const tu = U(lt, turns[i - 1], turns[i - 1] + dur); if (tu < 1) flip(tu, pages[i - 1]); }
  void fallback;
}

/* ---------- the desk and the human reader ---------- */
const DESK = { x0: 760, x1: 1044, y: 520 }, RDX = 1112;
function desk(o = {}) {
  shape(R(DESK.x0, DESK.y, DESK.x1 - DESK.x0, 14), { lw: 1.8, id: 7900, h: [0.1, 3, 0.6] });
  for (const lx of [DESK.x0 + 14, DESK.x1 - 26]) shape(R(lx, DESK.y + 14, 12, FLOOR - DESK.y - 14), { lw: 1.4, id: 7910 + lx, h: [Math.PI / 2, 2.4, 0.6] });
  shape(R(DESK.x0 + 40, DESK.y + 14, 120, 30), { lw: 1.4, id: 7920 }); ball(DESK.x0 + 100, DESK.y + 29, 3, 7921, PAT.f, 1);
  // lamp
  const lx = DESK.x0 + 40; line([lx, DESK.y], [lx + 6, DESK.y - 120], 2.6, 7930, 0.2); line([lx + 6, DESK.y - 120], [lx + 50, DESK.y - 150], 2.4, 7931, 0.2);
  shape([[lx + 34, DESK.y - 160], [lx + 76, DESK.y - 150], [lx + 78, DESK.y - 126], [lx + 40, DESK.y - 128]], { lw: 1.6, id: 7932, fill: P.ink });
  shape(R(lx - 16, DESK.y - 8, 34, 8), { lw: 1.4, id: 7933, fill: P.ink });
  // the small open book on the desk; style mirrors the big page
  const bx = 930, by = DESK.y; const st = o.book || 'plain';
  for (const d of [-1, 1]) {
    const pts = d < 0 ? [[bx - 46, by - 4], [bx, by - 2], [bx, by - 14], [bx - 42, by - 18]] : [[bx, by - 2], [bx + 46, by - 4], [bx + 42, by - 18], [bx, by - 14]];
    shape(pts, { lw: 1.2, id: 7940 + d, fill: PAPER2 });
    for (let k = 0; k < 4; k++) { const yy = by - 15 + k * 3, x0 = bx + d * 6, x1 = bx + d * (st === 'drift' ? 22 + 14 * Math.abs(Math.sin(k)) : 38);
      if (st === 'marks') { X.fillStyle = P.ink; X.globalAlpha = 0.6; X.fillRect(Math.min(x0, x1), yy - 1, Math.abs(x1 - x0), 2.2); X.globalAlpha = 1; } else line([x0, yy], [x1, yy], 0.6, 7950 + k + d * 10, 0.1); }
  }
  if (o.slips) for (let k = 0; k < o.slips; k++) shape(R(DESK.x1 - 100 + k * 3, DESK.y - 3 - k * 2.6, 56, 6), { lw: 0.9, id: 7960 + k, fill: P.paper });
}
/* seated reader facing left. s scales the reader and chair; returns head centre. o: write 0..1, mouth, look, absent */
function reader(x, s, lt, o = {}) {
  const y = FLOOR, br = Math.sin(lt * 1.7) * 1.4;
  X.save(); X.translate(x, y); X.scale(s, s);
  // chair
  shape(R(-40, -116, 84, 12), { lw: 1.6, id: 8000, h: [0.1, 3, 0.6] });
  for (const lx of [-34, 30]) shape(R(lx, -104, 8, 104), { lw: 1.3, id: 8001 + lx, h: [Math.PI / 2, 2.2, 0.6] });
  shape(R(36, -270, 10, 166), { lw: 1.4, id: 8005, h: [Math.PI / 2, 2.2, 0.6] }); shape(R(28, -276, 26, 12), { lw: 1.4, id: 8006, fill: P.ink });
  if (o.absent) { X.restore(); return [x - 30 * s, y - 268 * s]; }
  const reach = s >= 0.75;
  // far arm
  if (reach) { cap(-12, -226 + br, -44, -178, 13, 8010); cap(-44, -178, -84 + (o.write ? 2 : 0), -148, 11, 8011); }
  else { cap(-12, -226 + br, -30, -170, 13, 8010); cap(-30, -170, -48, -134, 11, 8011); }
  // legs
  cap(-4, -122, -64, -118, 19, 8020); cap(-64, -118, -66, -10, 16, 8021); boot(-66, 0, -1, 1.15, 8022);
  // torso: a coat
  shape([[-14, -124], [24, -124], [16, -238 + br], [-24, -236 + br]], { lw: 1.8, id: 8030, h: [1.75, 4.2, 0.5], sh: [[2, -240], [30, -240], [30, -120], [2, -120]], sh2: [1.6, 2.2, 0.7] });
  line([-6, -130], [-14, -232 + br], 0.9, 8031, 0.4);
  // head
  const hx = -30, hy = -268 + br + (o.down ? 4 : 0);
  cap(-8, -236 + br, hx + 8, hy + 16, 10, 8040);
  ball(hx, hy, 22, 8041, PAT.f, 1.8);
  X.save(); circ(hx, hy, 22, 8041); X.clip(); X.beginPath(); X.arc(hx + 14, hy - 12, 26, 0, 6.283); X.fillStyle = PAT.d; X.fill(); X.restore();
  const lk = o.look ?? 0; X.fillStyle = P.ink; X.beginPath(); X.arc(hx - 13, hy - 3 + (o.down ? 2 : 0) + lk * -3, 2.2, 0, 6.283); X.fill();
  line([hx - 22, hy - 2], [hx - 26, hy + 5], 1.4, 8042, 0.1); line([hx - 26, hy + 5], [hx - 21, hy + 6], 1.2, 8043, 0.1);
  const mo = o.mouth || 0; if (mo > 0.05) { X.fillStyle = P.ink; X.fillRect(hx - 20, hy + 10, 7, 1.5 + mo * 5); } else line([hx - 20, hy + 11], [hx - 13, hy + 11], 1, 8044, 0.1);
  // near arm with pencil
  const wr = o.write || 0, px = Math.sin(lt * 14) * 5 * wr;
  if (reach) { cap(-6, -224 + br, -30, -174, 14, 8050); const hd = [-78 + px, -150]; cap(-30, -174, hd[0], hd[1], 12, 8051); ball(hd[0], hd[1], 7, 8052, PAT.f, 1.2); line([hd[0] - 2, hd[1] - 6], [hd[0] - 18, hd[1] + 4 - wr * 3], 2.2, 8053, 0.1); if (o.slip) { shape(R(hd[0] - 46, hd[1] - 20, 44, 14), { lw: 1, id: 8054, fill: P.paper }); line([hd[0] - 42, hd[1] - 13], [hd[0] - 8, hd[1] - 13], 0.7, 8055, 0.1); } }
  else { cap(-6, -224 + br, -24, -168, 14, 8050); cap(-24, -168, -46, -138, 12, 8051); ball(-46, -136, 7, 8052, PAT.f, 1.2); }
  X.restore();
  return [x + hx * s, y + hy * s];
}
/* the scholar's hand and pen; nib at (x,y) */
function penHand(x, y, lt, writing) {
  const j = writing ? Math.sin(lt * 17) * 1.2 : 0, nx = x + j, ny = y + (writing ? Math.abs(Math.sin(lt * 9)) * 1.5 : -6);
  const hx = nx + 24, hy = ny + 20;
  cap(hx + 10, hy + 12, hx + 150, hy + 210, 30, 8100);
  shape([[hx + 120, hy + 150], [hx + 168, hy + 128], [hx + 230, hy + 260], [hx + 170, hy + 290]], { lw: 1.6, id: 8101, fill: '#4b4137' });
  line([nx, ny], [nx + 40, ny + 30], 3, 8103, 0.1); line([nx, ny], [nx + 5, ny + 4], 1.4, 8104, 0.05);
  ball(hx, hy, 13, 8102, PAT.f, 1.4);
}
/* the reading machine: the small box robot from the earlier films, with a slip of paper */
function readingMachine(x, y, s, lt, o = {}) { micro(x, y, s, 8200, { f: o.f || -1, walk: o.walk || 0, ph: lt * 10, wave: o.wave || 0, look: o.look || 0, mouth: o.mouth || 0, ant: Math.sin(lt * 6) * (o.scan ? 3 : 0.6) }); }


/* ================= this film ================= */
const HEADS = ['', 'VOLUME ONE', 'VOLUME TWO'];
const WIDE = ON(640, 380, 1.0), PAGECAM = ON(452, 410, 1.5);
const SHELFCAM = (k) => ON(k ? volMid(k) : 650, 132, 2.2);
const rHead = (s) => [RDX - 30 * s, FLOOR - 268 * s];
const pullLift = (sh, lt) => { const p = cue(sh, 'pull'); return p ? U(lt, p.at, p.at + 1.4) : 1; };
const PCX = PG.x + PG.w / 2, PCY = PG.y + PG.h / 2;

/* ---------- Dostoevsky's shelf: collected works, with a gap ---------- */
const DS = { x0: 884, x1: 1240, y: 330 };
const DT = ['POOR FOLK', 'NOTES FROM UNDERGROUND', 'CRIME AND PUNISHMENT', 'THE IDIOT', 'THE POSSESSED', null, 'THE BROTHERS KARAMAZOV', 'DIARY OF A WRITER'];
const DW = 32, DSTEP = 36, DX0 = 896, SLOT = 5, SLOTX = DX0 + SLOT * DSTEP + DW / 2;
const DCAM = ON(1060, 282, 2.0);
function dspine(x, y, w, h, title, id, o = {}) {
  shape(R(x, y - h, w, h), { lw: 1.5, id, fill: o.fill || '#cfc3a4', h: [Math.PI / 2, 3.4, 0.45], sh: R(x + w * 0.64, y - h, w * 0.36, h), sh2: [Math.PI / 2, 1.6, 0.8] });
  for (const q of [0.06, 0.11, 0.9, 0.95]) line([x, y - h * q], [x + w, y - h * q], 1.3, id + q * 100, 0.2);
  if (o.band) { X.fillStyle = P.red; X.fillRect(x + 1, y - h * 0.9 + 2, w - 2, 5); }
  shape(R(x + w * 0.18, y - h * 0.86, w * 0.64, h * 0.72), { lw: 0.9, id: id + 7, fill: P.paper });
  X.save(); X.translate(x + w / 2, y - h / 2); X.rotate(-Math.PI / 2);
  X.font = `600 ${title.length > 18 ? 6.6 : 7.6}px "IBM Plex Mono",monospace`; X.textAlign = 'center'; X.textBaseline = 'middle'; X.fillStyle = P.ink; X.fillText(title, 0, 0.5);
  X.restore();
}
/* girl: -1 absent, 0..1 sliding down into the slot */
function dshelf(o = {}) {
  shape(R(DS.x0, DS.y, DS.x1 - DS.x0, 10), { lw: 1.6, id: 9000, h: [0.1, 3, 0.6] });
  for (const bx of [DS.x0 + 24, DS.x1 - 24]) shape([[bx - 5, DS.y + 10], [bx + 5, DS.y + 10], [bx + 5, DS.y + 36], [bx - 5, DS.y + 18]], { lw: 1.2, id: 9010 + bx, fill: P.ink });
  shape([[DX0 - 12, DS.y], [DX0 - 3, DS.y], [DX0 - 3, DS.y - 70], [DX0 - 12, DS.y - 52]], { lw: 1.2, id: 9020, h: [0.8, 2.4, 0.6] });
  const xe = DX0 + DT.length * DSTEP; shape([[xe, DS.y], [xe + 9, DS.y], [xe + 9, DS.y - 52], [xe, DS.y - 70]], { lw: 1.2, id: 9021, h: [-0.8, 2.4, 0.6] });
  DT.forEach((t, i) => { if (t) dspine(DX0 + i * DSTEP, DS.y, DW, 104 + 14 * hash(i, 5), t, 9100 + i * 20); });
  const g = o.girl ?? -1;
  if (g >= 0) { const dy = -150 * Math.pow(1 - E.io(g), 1.4); X.save(); X.globalAlpha = clamp(g * 3); dspine(DX0 + SLOT * DSTEP, DS.y + dy, DW, 112, 'THE GIRL', 9300, { fill: '#e2d8bb', band: true }); X.restore(); }
}

/* ---------- the woven body of abstractions ---------- */
function weave(cx, cy, r, u, id, o = {}) {
  if (u <= 0) return;
  const kind = o.kind || 'body', S = o.shells || 7, al = o.alpha ?? 1, rot0 = o.rot || 0, N = 120;
  X.save(); X.lineJoin = 'round';
  if (kind === 'halo') { X.globalAlpha = 0.5 * al * u; X.beginPath(); X.arc(cx, cy, r * 1.45, 0, 6.283); X.fillStyle = '#f7f2e4'; X.fill(); X.setLineDash([2, 4]); X.lineWidth = 0.8; X.strokeStyle = P.ink; X.stroke(); X.setLineDash([]);
    for (const d of [-1, 1]) for (let e = 1; e <= 3; e++) weave(cx + d * r * (1.35 + e * 0.42), cy, r * (0.42 - e * 0.08), u, id + 50 * e + (d > 0 ? 7 : 0), { kind: 'body', shells: 4, alpha: al * (0.6 - e * 0.15), rot: rot0 + e }); }
  for (let s = 0; s < S; s++) {
    const f = (s + 1) / S, rr = r * (0.26 + 0.74 * f);
    let sq, ang, wob;
    if (kind === 'bundle') { sq = 0.1 + 0.14 * hash(id, s); ang = rot0 + (hash(id, s + 9) - 0.5) * 0.3; wob = 0.05; }
    else if (kind === 'bloom') { sq = 0.85; ang = rot0 + s * 0.9; wob = 0; }
    else { sq = 0.38 + 0.52 * hash(id, s); ang = rot0 + s * 0.62 + hash(id, s + 3); wob = 0.17; }
    for (let k = 0; k < 3; k++) {
      const m = Math.floor(N * clamp(u * 1.4 - s * 0.05)); if (m < 2) continue;
      X.beginPath();
      for (let j = 0; j <= m; j++) {
        const th = j / N * 6.283 + s * 1.7;
        let rad = kind === 'bloom' ? rr * (0.3 + 0.7 * Math.abs(Math.sin(2.5 * th + s))) : rr * (1 + wob * Math.sin(3 * th + s * 1.3 + k * 0.3) + wob * 0.5 * Math.sin(7 * th - s));
        rad += (k - 1) * 1.6;
        const [px, py] = rot(Math.cos(th) * rad, Math.sin(th) * rad * sq, ang);
        const jx = J(id + s * 10 + k, j) * 0.7, jy = J(id + s * 10 + k, j + 500) * 0.7;
        j ? X.lineTo(cx + px + jx, cy + py + jy) : X.moveTo(cx + px + jx, cy + py + jy);
      }
      X.globalAlpha = al * (0.4 + 0.55 * f); X.lineWidth = (o.lw || 0.75) * (k === 1 ? 1.2 : 0.8);
      X.strokeStyle = hash(id, s * 3 + k) > 0.84 ? P.red : P.ink; X.stroke();
    }
  }
  if (kind !== 'bloom') { X.globalAlpha = al * clamp(u * 2); X.beginPath(); X.ellipse(cx, cy, r * 0.12, r * 0.07, rot0, 0, 6.283); X.fillStyle = P.ink; X.fill(); }
  X.restore();
}
/* a ring of threads with a gap at angle gc (half-width gw); close 0..1 draws the missing link in red */
function ringOf(cx, cy, rx, ry, u, gc, gw, close, id, o = {}) {
  const N = 140, a0 = gc + gw, a1 = gc + 6.283 - gw, al = o.alpha ?? 1;
  X.save(); X.lineJoin = 'round';
  for (let k = 0; k < 5; k++) {
    const m = Math.floor(N * u); if (m < 2) continue; X.beginPath();
    for (let j = 0; j <= m; j++) { const a = a0 + (a1 - a0) * j / N, w = Math.sin(5 * a + k * 1.3) * 2.2 + (k - 2) * 2.4; const x = cx + Math.cos(a) * (rx + w), y = cy + Math.sin(a) * (ry + w * 0.5); j ? X.lineTo(x + J(id + k, j) * 0.6, y) : X.moveTo(x, y); }
    X.globalAlpha = al * (k === 2 ? 0.95 : 0.6); X.lineWidth = k === 2 ? 1.5 : 0.8; X.strokeStyle = P.ink; X.stroke();
  }
  if (close > 0) for (let k = 0; k < 5; k++) {
    X.beginPath(); const n = 30;
    for (let j = 0; j <= n * close; j++) { const a = gc - gw - 0.02 + (2 * gw + 0.04) * j / n, w = Math.sin(5 * a + k * 1.3) * 2.2 + (k - 2) * 2.4; const x = cx + Math.cos(a) * (rx + w), y = cy + Math.sin(a) * (ry + w * 0.5); j ? X.lineTo(x, y) : X.moveTo(x, y); }
    X.globalAlpha = al; X.lineWidth = k === 2 ? 2 : 1.1; X.strokeStyle = P.red; X.stroke();
  }
  X.restore();
}
function arrow(a, b, u, id, col = P.ink, o = {}) {
  if (u <= 0) return; const e = [lerp(a[0], b[0], u), lerp(a[1], b[1], u)];
  X.save(); if (o.dash) X.setLineDash(o.dash);
  X.beginPath(); X.moveTo(a[0], a[1]); X.lineTo(e[0], e[1]); X.lineWidth = o.lw || 1.6; X.strokeStyle = col; X.stroke(); X.setLineDash([]);
  if (u > 0.98) { const an = Math.atan2(b[1] - a[1], b[0] - a[0]); X.beginPath(); X.moveTo(e[0], e[1]); X.lineTo(e[0] - Math.cos(an - 0.4) * 10, e[1] - Math.sin(an - 0.4) * 10); X.lineTo(e[0] - Math.cos(an + 0.4) * 10, e[1] - Math.sin(an + 0.4) * 10); X.closePath(); X.fillStyle = col; X.fill(); }
  X.restore();
}
const typed = (s, u) => s.slice(0, Math.floor(s.length * clamp(u)));
function room(sh, lt, vol, o = {}) {
  wallAndFloor(); shelf({ out: vol, lift: pullLift(sh, lt) }); dshelf({ girl: o.girl ?? -1 }); lectern(); desk(o);
}

/* ================= pages ================= */
function peaksPage(lt, sh) {
  pageBase(HEADS[1], '47');
  const ty = cue(sh, 'type'), fd = cue(sh, 'fade'), tk = cues(sh, 'tick');
  txt('THE FOUR PEAKS', PCX, PG.y + 64, 16, {});
  line([PCX - 60, PG.y + 80], [PCX + 60, PG.y + 80], 1, 9400, 0.3);
  const rows = [['A.', 'MONOETICS', 'now: homotropia, its first part'], ['B.', 'MIMESIS', 'now: exact mimesis'], ['C.', 'SOPHOCRISIS', 'now: critique of philosophy'], ['D.', 'APOSTASY', 'now: bitic creation']];
  const tot = rows.reduce((a, r) => a + r[1].length, 0); let left = Math.floor(tot * U(lt, ty.at, ty.to)) + (lt >= ty.to ? 999 : 0);
  rows.forEach((r, i) => {
    const y = PG.y + 130 + i * 64; const show = r[1].slice(0, Math.max(0, left)); left -= r[1].length;
    X.globalAlpha = i >= 2 ? 1 - 0.7 * U(lt, fd.at, fd.to) : 1;
    if (show.length) { txt(r[0], TX0 + 16, y, 18, { align: 'left' }); txt(show, TX0 + 50, y, 20, { align: 'left' }); }
    if (show.length === r[1].length) { X.globalAlpha *= U(lt, ty.to, ty.to + 1.0); txt(r[2], TX0 + 52, y + 22, 11, { italic: true, align: 'left', col: '#5d564b' }); }
    X.globalAlpha = 1;
    if (i < 2 && tk[i]) { const u = U(lt, tk[i].at, tk[i].at + 0.35); if (u > 0) ink([[TX0 - 4, y - 2], [TX0 + 2, y + 6], [TX0 + 2 + 10 * u, y + 6 - 16 * u]], 1.6, 9410 + i, 0.4, '#5a554c'); }
  });
}
const DICT = [['thoroughfare', 'n. a main road', 'a large meal'], ['skinflint', 'n. a miser', 'stone facing'], ['horseman', 'n. a rider on horseback', 'centaur'], ['piglet', 'n. a young pig', 'a filthy rooming house'], ['princeling', 'n. a minor prince', 'royal fish']];
function dictPage(lt, sh) {
  pageBase(HEADS[1], '62'); const st = cues(sh, 'strike');
  txt('OLD WORDS, NEW MEANINGS', PCX, PG.y + 46, 10, { mono: true, col: '#5d564b' });
  DICT.forEach(([w, old, neu], i) => {
    const y = PG.y + 82 + i * 62, c = st[i];
    txt(w, TX0, y, 17, { align: 'left' });
    txt(old, TX0 + 14, y + 19, 12, { italic: true, align: 'left' });
    if (c) {
      X.font = `italic 12px ${FONT}`; const ww = X.measureText(old).width; const u = U(lt, c.at, c.at + 0.4);
      if (u > 0) ink([[TX0 + 10, y + 20], [TX0 + 14 + (ww + 6) * u, y + 18]], 2, 9500 + i, 0.5, P.red);
      const s = typed(neu, U(lt, c.at + 0.5, c.at + 1.4)); if (s) { ink([[TX0 + 14, y + 27], [TX0 + 14, y + 37], [TX0 + 24, y + 37]], 1, 9520 + i, 0.2); txt(s, TX0 + 30, y + 37, 12, { mono: true, align: 'left' }); }
    }
  });
}
const AX = [['wordy', 'already ours', 0.13, 150], ['wordwork', 'verse', 0.38, 196], ['wordsteal', 'plagiarism', 0.62, 150], ['wordiot', 'graphomaniac', 0.87, 196]];
function axisPage(lt, sh) {
  pageBase(HEADS[1], '63'); const g = cue(sh, 'grow'), g2 = cue(sh, 'grow2');
  const gu = U(lt, g.at, g.to) * 5, root = [PCX, PG.y + 70];
  txt('word', root[0], root[1], 24, {});
  AX.forEach(([w, gl, fx, fy], i) => {
    const u = clamp(gu - i); if (u <= 0) return; const p = [PG.x + PG.w * fx, PG.y + fy];
    ink([[root[0], root[1] + 16], [lerp(root[0], p[0], u), lerp(root[1] + 16, p[1] - 16, u)]], 1.1, 9600 + i, 0.4);
    if (u > 0.6) { X.globalAlpha = U(u, 0.6, 1); txt(w, p[0], p[1], 15, { italic: i === 0 }); txt(gl, p[0], p[1] + 17, 9, { mono: true, col: i === 0 ? '#5d564b' : P.ink }); X.globalAlpha = 1; }
  });
  { const u = clamp(gu - 4); if (u > 0) { const a = [PG.x + 80, PG.y + 270], b = [PG.x + 250, PG.y + 270]; txt('glad', a[0], a[1], 20, {}); ink([[a[0] + 26, a[1]], [lerp(a[0] + 26, b[0] - 46, u), a[1]]], 1.1, 9610, 0.4);
    if (u > 0.6) { X.globalAlpha = U(u, 0.6, 1); txt('gladland', b[0], b[1], 15, {}); txt('paradise', b[0], b[1] + 17, 9, { mono: true }); X.globalAlpha = 1; } } }
  { const u = U(lt, g2.at, g2.to); if (u > 0) { const y = PG.y + 336; X.globalAlpha = clamp(u * 3); txt('dimocracy', PCX, y, 16, {}); txt('a madhouse', PCX, y + 17, 9, { mono: true }); X.globalAlpha = U(u, 0.35, 0.6); txt('machine?', PCX - 100, y + 6, 11, { italic: true, col: '#5d564b' }); X.globalAlpha = U(u, 0.6, 0.85); txt('comedian?', PCX + 104, y + 6, 11, { italic: true, col: '#5d564b' }); X.globalAlpha = 1; } }
}
function gravityPage(lt, sh) {
  pageBase(HEADS[1], ''); const dr = cue(sh, 'draw'), wd = cue(sh, 'words'), pu = cue(sh, 'pull');
  const gx = PCX, gy = PG.y + 292, du = U(lt, dr.at, dr.to);
  if (du > 0) {
    X.save(); X.beginPath(); X.rect(PG.x, gy + 4 - 230 * du, PG.w, 240 * du + 4); X.clip();
    line([PG.x + 40, gy], [PG.x + PG.w - 40, gy], 1.6, 9700, 0.3); for (let i = 0; i < 26; i++) line([PG.x + 46 + i * 11.5, gy + 1], [PG.x + 38 + i * 11.5, gy + 10], 0.8, 9701 + i, 0.2);
    figure({ x: gx, y: gy, s: 0.92, id: 9720, hb: [-30, -112], hf: [30, -112] });
    X.restore();
  }
  const wu = U(lt, wd.at, wd.to);
  if (wu > 0) {
    const e = typed('elevation', wu * 2), a = typed('abasement', wu * 2 - 1);
    if (e) { txt(e, gx, PG.y + 44, 14, { mono: true }); }
    if (a) { txt(a, gx, gy + 28, 14, { mono: true }); }
  }
  const pv = U(lt, pu.at, pu.to);
  if (pv > 0) {
    X.save(); X.setLineDash([6, 6]); X.lineDashOffset = -lt * 30; X.globalAlpha = clamp(pv * 3) * 0.8;
    for (const dx of [-110, 0, 110]) { X.beginPath(); X.moveTo(gx + dx, PG.y + 60); X.lineTo(gx + dx, gy + 46); X.lineWidth = dx ? 1 : 1.6; X.strokeStyle = dx ? P.ink : P.red; X.stroke(); }
    X.restore();
    for (const dx of [-110, 0, 110]) arrow([gx + dx, gy + 40], [gx + dx, gy + 50], 1, 9750 + dx, dx ? P.ink : P.red, { lw: 1 });
    X.globalAlpha = U(pv, 0.3, 0.8); txt('rise   fall   high   low   upright   downcast', gx, gy + 66, 11, { italic: true }); X.globalAlpha = 1;
  }
}
/* the original page: a text the camera cannot read, as rows of grey */
function originalPage(lt, sh, o = {}) {
  pageBase('ORIGINAL', '9'); const pr = o.press || 0, tick = o.tick || 0;
  for (let i = 0; i < 20; i++) {
    const y = lerp(TY0 + i * LEAD - 4, PCY, E.in(pr)), w = TW * (0.55 + 0.45 * hash(i, 41)) * (i % 6 === 5 ? 0.5 : 1);
    X.globalAlpha = 0.5 * (1 - pr * 0.6); X.fillStyle = P.ink;
    X.fillRect(lerp(TX0, PCX - 40, E.in(pr)), y, lerp(w, 80, E.in(pr)), 2.4); X.globalAlpha = 1;
    if (tick > 0 && i % 3 === 0 && clamp(tick * 8 - i / 3) > 0) ink([[TX0 + w + 6, y], [TX0 + w + 10, y + 4], [TX0 + w + 18, y - 6]], 1.2, 9800 + i, 0.2, P.red);
  }
  if (pr > 0.85) { X.fillStyle = P.ink; X.globalAlpha = U(pr, 0.85, 1); X.fillRect(PCX - 42, PCY - 18, 84, 36); X.globalAlpha = 1; }
}
const scope = () => { X.beginPath(); X.arc(PCX, PCY - 10, 150, 0, 6.283); X.lineWidth = 3; X.strokeStyle = P.ink; X.stroke(); X.beginPath(); X.arc(PCX, PCY - 10, 156, 0, 6.283); X.lineWidth = 0.8; X.stroke();
  for (let i = 0; i < 24; i++) { const a = i / 24 * 6.283; line([PCX + Math.cos(a) * 150, PCY - 10 + Math.sin(a) * 150], [PCX + Math.cos(a) * (i % 6 ? 144 : 138), PCY - 10 + Math.sin(a) * (i % 6 ? 144 : 138)], 1, 9900 + i, 0.1); } };
function plate(title, fn) { pageBase(HEADS[2], ''); shape(R(PG.x + 16, PG.y + 36, PG.w - 32, PG.h - 80), { fill: null, lw: 1, id: 9950, amp: 0.2 }); fn(); txt(title, PCX, PG.y + PG.h - 26, 10, { mono: true }); }
function typescript(u) {
  pageBase('', ''); X.fillStyle = '#f7f3e6'; X.fillRect(PG.x + 2, PG.y + 2, PG.w - 4, PG.h - 4);
  const parts = [['DEVOCHKA', 24, 120], ['THE GIRL', 11, 150], ['a novel', 12, 190], ['HYXOS', 15, 260]];
  const tot = parts.reduce((a, p) => a + p[0].length, 0); let left = Math.floor(tot * u);
  for (const [s, sz, y] of parts) { const sh = s.slice(0, Math.max(0, left)); left -= s.length; if (sh) { X.font = `${sz}px "IBM Plex Mono",monospace`; const fw = X.measureText(s).width; txt(sh, PCX - fw / 2, PG.y + y, sz, { mono: true, align: 'left' }); } }
  if (u >= 1) for (let i = 0; i < 6; i++) { X.globalAlpha = 0.35; X.fillStyle = P.ink; X.fillRect(TX0 + (i ? 0 : 24), PG.y + 300 + i * 12, TW * (0.7 + 0.3 * hash(i, 3)), 2); X.globalAlpha = 1; }
}
function emperorPage() {
  pageBase('', ''); txt('The Emperor', TX0, PG.y + 46, 16, { italic: true, align: 'left' }); txt('drafts', TX0 + 104, PG.y + 47, 11, { italic: true, align: 'left', col: '#5d564b' });
  for (let i = 0; i < 13; i++) {
    const y = PG.y + 84 + i * 17, w = TW * (i > 9 ? 0.3 + 0.2 * hash(i, 8) : 0.6 + 0.4 * hash(i, 7)), p = [];
    for (let x = 0; x <= w; x += 6) p.push([TX0 + x, y + Math.sin(x * 0.45 + i) * 2.2 + Math.sin(x * 1.3) * 1.2]);
    ink(p, 1.1, 9960 + i, 0.4, '#3b352d');
    if (hash(i, 9) > 0.6) line([TX0 + w * 0.2, y - 1], [TX0 + w * 0.7, y + 1], 1.6, 9990 + i, 0.6);
  }
  txt('. . .', TX0 + 40, PG.y + 84 + 13 * 17 + 6, 14, { align: 'left' });
}
function rulePage(lt, sh) {
  pageBase(HEADS[2], '118'); const d1 = cue(sh, 'd1'), d2 = cue(sh, 'd2'), d3 = cue(sh, 'd3');
  const cx = PG.x + 92, cap = (s, y, u) => { X.globalAlpha = clamp(u * 3); txt(s, PG.x + 180, y, 11, { italic: true, align: 'left' }); X.globalAlpha = 1; };
  const u1 = U(lt, d1.at, d1.to), u2 = U(lt, d2.at, d2.to), u3 = U(lt, d3.at, d3.to);
  if (u1 > 0) { const y = PG.y + 90; ringOf(cx, y, 34, 20, clamp(u1 * 3), -1.57, 0.0001, 0, 10010); for (let e = 1; e <= 3; e++) { X.globalAlpha = clamp(u1 * 3 - e * 0.5) * (0.5 - e * 0.12); X.beginPath(); X.ellipse(cx, y, 34 + e * 12, 20 + e * 8, 0, 0, 6.283); X.lineWidth = 0.8; X.strokeStyle = P.ink; X.stroke(); X.globalAlpha = 1; } cap('used up: only echoes', y + 4, u1); }
  if (u2 > 0) { const y = PG.y + 200; ringOf(cx, y, 40, 24, clamp(u2 * 3), -1.57, 0.4, U(u2, 0.45, 0.85), 10020); cap('left unsaid: a link to supply', y + 4, u2); }
  if (u3 > 0) { const y = PG.y + 310; ringOf(cx, y, 34, 20, clamp(u3 * 4), -1.57, 0.0001, 0, 10030); for (let e = 1; e <= 14; e++) { const v = clamp(u3 * 2.5 - e * 0.1); X.globalAlpha = v * 0.45; X.beginPath(); X.ellipse(cx, y, 34 + e * 4.2, 20 + e * 2.9, 0, 0, 6.283); X.lineWidth = 0.7; X.strokeStyle = P.ink; X.stroke(); } X.globalAlpha = 1; cap('The Castle: at the limit', y + 4, u3); }
}

/* ---------- the press ---------- */
const PRX = 140;
function stampTimes(sh) { const pr = cue(sh, 'press'), out = []; if (!pr) return out; let t = pr.at, k = 0; while (t < sh.d - 0.3) { out.push(t); t += Math.max(0.62, 1.1 - k * 0.04); k++; } return out; }
function pressMachine(down, n, id = 10100) {
  const top = 300, bed = 520;
  for (const px of [PRX - 92, PRX + 80]) shape(R(px, top, 14, FLOOR - top), { lw: 1.6, id: id + px, h: [Math.PI / 2, 2.4, 0.6] });
  shape(R(PRX - 104, top - 22, 210, 26), { lw: 1.8, id: id + 1, h: [0.1, 3, 0.6] });
  const py = lerp(380, bed - 28, down);
  line([PRX, top + 4], [PRX, py], 7, id + 2, 0.1); for (let k = 0; k < 8; k++) line([PRX - 5, top + 12 + k * (py - top - 12) / 8], [PRX + 5, top + 18 + k * (py - top - 12) / 8], 1, id + 10 + k, 0.1);
  X.save(); X.translate(PRX, top - 36); X.scale(1, 0.3); X.beginPath(); X.arc(0, 0, 60, 0, 6.283); X.lineWidth = 6; X.strokeStyle = P.ink; X.stroke(); X.restore();
  shape(R(PRX - 70, py, 140, 26), { lw: 1.8, id: id + 3, fill: '#4b4137' });
  shape(R(PRX - 80, bed, 160, 18), { lw: 1.8, id: id + 4, h: [0.1, 2.6, 0.6] });
  if (n > 0) { const w = 26, h = 10; shape(R(PRX - 30, bed - h, 60, h), { lw: 1, id: id + 5, fill: '#cfc3a4' }); void w; }
}
function pile(n) {
  for (let i = 0; i < n; i++) {
    const row = Math.floor(i / 4), col = i % 4, x = 30 + col * 50 + (row % 2) * 18 + hash(i, 2) * 6, y = FLOOR - row * 11;
    if (x > 236) continue;
    shape(R(x, y - 11, 46, 11), { lw: 1, id: 10300 + i, fill: '#cfc3a4' }); X.fillStyle = P.ink; X.font = '600 5.6px "IBM Plex Mono",monospace'; X.textAlign = 'center'; X.textBaseline = 'middle'; X.fillText('NO. ' + (1041 + i), x + 23, y - 5.3);
  }
}
function sheets(u, lt) {
  if (u <= 0) return;
  for (let i = 0; i < 70; i++) {
    const t0 = hash(i, 1) * 0.8, v = clamp((u - t0) / 0.25); if (v <= 0) continue;
    const x = 40 + hash(i, 2) * 1200, y = lerp(-40, FLOOR - 4 - hash(i, 3) * 8, E.out(v)), a = (hash(i, 4) - 0.5) * (v < 1 ? 1.2 + Math.sin(lt * 3 + i) : 0.3);
    X.save(); X.translate(x + Math.sin(lt * 2 + i) * 14 * (1 - v), y); X.rotate(a); X.scale(1, v < 1 ? 1 : 0.35);
    shape(R(-14, -18, 28, 36), { lw: 0.9, id: 10500 + i, fill: PAPER2, amp: 0.2 }); for (let k = 0; k < 5; k++) { X.fillStyle = P.ink; X.globalAlpha = 0.5; X.fillRect(-9, -11 + k * 6, 18 * hash(i, k + 5) + 4, 1); X.globalAlpha = 1; }
    X.restore();
  }
}

/* ================= shots ================= */
SHOTS.title = (lt) => {
  X.fillStyle = P.paper; X.fillRect(0, 0, W, H);
  const t1 = 'A HISTORY OF BITIC LITERATURE', n = Math.floor(t1.length * U(lt, 0.8, 3.4));
  X.font = FONTR(52); const fullW = X.measureText(t1).width; X.textAlign = 'left'; X.textBaseline = 'middle'; X.fillStyle = P.ink; X.fillText(t1.slice(0, n), CX - fullW / 2, 140);
  X.globalAlpha = seg(lt, 3.2, 4.0); txt('MONOETICS AND MIMESIS', CX, 202, 26, { mono: true });
  X.globalAlpha = seg(lt, 3.8, 4.8);
  txt('machines that make words, and a novel Dostoevsky could not write', CX, 256, 26, { italic: true });
  txt('after Stanisław Lem, A History of Bitic Literature, Volume I, in Imaginary Magnitude (1973),', CX, 306, 18, { italic: true });
  txt('translated by Marc E. Heine. Narration paraphrases Lem.', CX, 332, 18, { italic: true });
  X.globalAlpha = 1;
  const x0 = CX - 170; let x = x0; VOLS.forEach((v, i) => { spine(x, 600, v.w, 138, v.n, 7200 + i * 20); x += v.w + 6; });
  shape(R(x0 - 30, 600, x - x0 + 54, 12), { lw: 1.8, id: 7100, h: [0.1, 3, 0.6] });
};

SHOTS.peaks = (lt, sd, sh) => {
  const L = sh.lines, pl = cue(sh, 'pull');
  let c = camFor(lt, [[0, SHELFCAM(1)], [pl.at + 0.9, WIDE, 1.3], [L[0].t1 - 1.0, PAGECAM, 1.2], [L[1].t1 + 0.3, ON(452, 380, 1.75), 1.0], [L[3].t1 + 0.3, ON(452, 360, 1.9), 0.8]]);
  c = withTight(sh, lt, c, 420, 360, 2.4);
  cam(c, () => {
    room(sh, lt, 1, { book: 'plain' }); reader(RDX, 1, lt, { down: true });
    pageStack(lt, [() => peaksPage(lt, sh)], [], 1, pl);
  });
};

SHOTS.dictionary = (lt, sd, sh) => {
  const L = sh.lines, tn = cues(sh, 'turn'), st = cues(sh, 'strike');
  const pages = [() => peaksPage(lt + 1e3, T.shots.find((s) => s.shot === 'peaks')), () => dictPage(lt, sh)];
  const rowY = (i) => PG.y + 82 + i * 62;
  let c = camFor(lt, [[0, ON(452, 380, 1.9)], [1.0, PAGECAM, 1.2], [L[1].t0, WIDE, 1.4], [L[3].t0 - 0.2, PAGECAM, 1.0], [st[0].at - 0.6, ON(400, rowY(0) + 30, 2.1), 0.8], [st[1].at - 0.3, ON(400, rowY(1) + 30, 2.1), 0.6], [st[2].at - 0.3, ON(400, rowY(2) + 30, 2.1), 0.6], [st[3].at - 0.4, ON(420, rowY(3) + 20, 1.8), 0.8]]);
  c = withTight(sh, lt, c, 410, rowY(2) + 30, 2.6);
  cam(c, () => {
    room(sh, lt, 1, { book: 'plain' }); reader(RDX, 1, lt, { down: true });
    pageStack(lt, pages, tn.map((q) => q.at), 1, null);
  });
};

SHOTS.axis = (lt, sd, sh) => {
  const L = sh.lines, tn = cues(sh, 'turn'), dS = T.shots.find((s) => s.shot === 'dictionary');
  const pages = [() => dictPage(1e3, dS), () => axisPage(lt, sh)];
  let c = camFor(lt, [[0, ON(452, 400, 1.8)], [1.0, ON(452, 360, 1.75), 1.0], [L[3].t0 - 0.3, ON(452, 520, 1.9), 1.0], [L[4].t0, WIDE, 1.4]]);
  c = withTight(sh, lt, c, 452, 360, 2.2);
  cam(c, () => {
    room(sh, lt, 1, { book: 'plain' }); reader(RDX, 1, lt, { down: true, write: pulse(lt, L[2].t1, 0.9) });
    pageStack(lt, pages, tn.map((q) => q.at), 1, null);
  });
};

SHOTS.gravity = (lt, sd, sh) => {
  const L = sh.lines, tn = cues(sh, 'turn'), aS = T.shots.find((s) => s.shot === 'axis');
  const pages = [() => axisPage(1e3, aS), () => gravityPage(lt, sh)];
  let c = camFor(lt, [[0, ON(452, 400, 1.8)], [1.0, WIDE, 1.4], [L[0].t0 + 3.0, PAGECAM, 1.2], [L[2].t0 - 0.3, ON(452, 330, 1.9), 0.9], [L[3].t0, PAGECAM, 1.0], [L[5].t0, WIDE, 1.3]]);
  c = withTight(sh, lt, c, 452, 420, 2.3);
  cam(c, () => {
    room(sh, lt, 1, { book: 'plain' }); reader(RDX, 1, lt, { down: !talking(sh, 'M', lt) });
    pageStack(lt, pages, tn.map((q) => q.at), 1, null);
  });
};

const BX = 712, BY = 298;
const MACH = [[196, FLOOR, 1.6, 1], [818, 196, 1.15, -1], [1010, DESK.y, 1.35, -1]];
SHOTS.translate = (lt, sd, sh) => {
  const L = sh.lines, tn = cues(sh, 'turn'), gS = T.shots.find((s) => s.shot === 'gravity');
  const am = cue(sh, 'aim'), pr = cue(sh, 'press'), gr = cue(sh, 'grow'), ou = cue(sh, 'out'), bk = cue(sh, 'back');
  const pu = U(lt, pr.at, pr.to), bu = U(lt, bk.at, bk.to);
  const pages = [() => gravityPage(1e3, gS), () => originalPage(lt, sh, { press: pu * (1 - U(lt, gr.at, gr.at + 1.5)), tick: U(bu, 0.5, 1) })];
  let c = camFor(lt, [[0, ON(452, 400, 1.8)], [1.0, PAGECAM, 1.0], [L[1].t0 + 1.0, ON(560, 400, 1.25), 1.2], [am.at - 0.4, WIDE, 1.0], [gr.at + 1.0, ON(BX, BY + 20, 1.7), 1.6], [ou.to + 0.2, ON(760, 420, 1.2), 1.0]]);
  c = withTight(sh, lt, c, BX, BY, 2.4);
  cam(c, () => {
    room(sh, lt, 1, { book: 'plain' }); reader(RDX, 1, lt, { down: true });
    pageStack(lt, pages, tn.map((q) => q.at), 1, null);
    const vis = U(lt, am.at - 1.2, am.at);
    if (vis > 0) MACH.forEach(([x, y, s, f], i) => {
      const hy = y - 46 * s; X.save(); X.globalAlpha = vis; readingMachine(x, y, s, lt, { f, scan: lt >= am.at && lt < pr.to, look: f > 0 ? 1 : -1 }); X.restore();
      const au = U(lt, am.at + i * 0.4, am.at + i * 0.4 + 0.5) * (1 - U(lt, gr.at + 0.5, gr.at + 1.5));
      if (au > 0) { X.save(); X.globalAlpha = au * 0.8; X.setLineDash([3, 5]); X.lineDashOffset = -lt * 20; X.beginPath(); X.moveTo(x, hy); X.lineTo(PCX, PCY); X.lineWidth = 1; X.strokeStyle = P.red; X.stroke(); X.restore(); }
    });
    // the pressing travels from the page to where the body will grow
    const tu = U(lt, gr.at - 0.2, gr.at + 1.2);
    if (tu > 0 && tu < 1) { X.fillStyle = P.ink; const x = lerp(PCX, BX, E.io(tu)), y = lerp(PCY, BY, E.io(tu)) - Math.sin(tu * Math.PI) * 40; X.fillRect(x - 20, y - 9, 40, 18); }
    const wu = U(lt, gr.at + 0.8, gr.to);
    weave(BX, BY, lerp(14, 80, E.out(wu)), wu, 11000, { rot: lt * 0.08 });
    arrow([BX + 40, BY + 70], [925, 488], U(lt, ou.at, ou.at + 1.4), 11001, P.ink, { lw: 1.8 });
    if (lt > ou.at + 1.2) { X.globalAlpha = U(lt, ou.at + 1.2, ou.at + 2); txt('ENGLISH', 930, 470, 10, { mono: true }); X.globalAlpha = 1; }
    if (bu > 0) { arrow([905, 492], [BX + 20, BY + 82], U(bu, 0, 0.45), 11002, P.red, { dash: [5, 4], lw: 1.4 }); arrow([BX - 70, BY + 30], [PG.x + PG.w - 20, PCY - 20], U(bu, 0.4, 0.75), 11003, P.red, { dash: [5, 4], lw: 1.4 }); }
  });
};

const PLATES = ['PLATE 1.  THE SEMASCOPE', 'PLATE 9.  AN ARGUMENT', 'PLATE 14.  A POEM, AND A PSALM', 'PLATE 31.  AN ALLEGORY', 'PLATE 40.  A NOVEL'];
SHOTS.plates = (lt, sd, sh) => {
  const L = sh.lines, pl = cue(sh, 'pull'), tn = cues(sh, 'turn'), wv = cue(sh, 'weave');
  const rt = lt * 0.06, wu = U(lt, wv.at, wv.to);
  const pages = [() => plate(PLATES[0], () => { scope(); weave(PCX, PCY - 10, 118, wu, 12000, { rot: rt }); }),
    () => plate(PLATES[1], () => { scope(); weave(PCX, PCY - 10, 130, 1, 12100, { kind: 'bundle', rot: -0.35 + rt * 0.3, shells: 9 }); }),
    () => plate(PLATES[2], () => { weave(PCX - 82, PCY - 10, 70, 1, 12200, { kind: 'bloom', rot: rt, shells: 6 }); weave(PCX + 82, PCY - 10, 70, 1, 12210, { kind: 'bloom', rot: rt + 0.3, shells: 6 }); }),
    () => plate(PLATES[3], () => { weave(PCX, PCY - 10, 52, 1, 12300, { kind: 'halo', rot: rt, shells: 6 }); }),
    () => plate(PLATES[4], () => { scope(); weave(PCX, PCY - 10, 132, 1, 12400, { rot: rt, shells: 9 }); })];
  let c = camFor(lt, [[0, SHELFCAM(2)], [pl.at + 0.9, WIDE, 1.3], [L[0].t0 + 2.0, PAGECAM, 1.2], [wv.at, ON(452, 400, 1.85), 1.0], [tn[0].at, ON(452, 410, 1.7), 0.8]]);
  c = withTight(sh, lt, c, 452, 396, 2.3);
  cam(c, () => {
    room(sh, lt, 2, { book: 'plain' }); reader(RDX, 1, lt, { down: true });
    pageStack(lt, pages, tn.map((q) => q.at), 2, pl);
  });
};

SHOTS.girl = (lt, sd, sh) => {
  const L = sh.lines, tn = cues(sh, 'turn'), ty = cue(sh, 'type'), rg = cue(sh, 'ring'), sl = cue(sh, 'slide'), cl = cue(sh, 'close');
  const pages = [() => plate(PLATES[4], () => { scope(); weave(PCX, PCY - 10, 132, 1, 12400, { rot: (lt + 28) * 0.06, shells: 9 }); }), () => typescript(U(lt, ty.at, ty.to))];
  const g = lt < sl.at ? -1 : U(lt, sl.at, sl.to);
  let c = camFor(lt, [[0, ON(452, 400, 1.7)], [1.2, WIDE, 1.4], [L[1].t0, ON(452, 330, 1.8), 1.0], [L[2].t0 + 0.4, ON(900, 420, 1.35), 1.2], [L[4].t0, ON(1050, 300, 1.4), 1.2], [L[5].t0, DCAM, 1.2]]);
  c = withTight(sh, lt, c, SLOTX - 10, 286, 2.7);
  const cx = 1062, cy = 268, rx = 186, ry = 62, gc = -Math.acos((SLOTX - cx) / rx), gw = 0.2;
  cam(c, () => {
    room(sh, lt, 2, { book: 'plain', girl: g }); reader(RDX, 1, lt, { down: true });
    pageStack(lt, pages, tn.map((q) => q.at), 2, null);
    ringOf(cx, cy, rx, ry, U(lt, rg.at, rg.to), gc, gw, U(lt, cl.at, cl.to), 13000, { alpha: 0.9 });
  });
};

SHOTS.rule = (lt, sd, sh) => {
  const L = sh.lines, tn = cues(sh, 'turn'), gS = T.shots.find((s) => s.shot === 'girl');
  const pages = [() => typescript(1), () => emperorPage(), () => rulePage(lt, sh)];
  const cx = 1062, cy = 268, rx = 186, ry = 62, gc = -Math.acos((SLOTX - cx) / rx);
  let c = camFor(lt, [[0, ON(452, 400, 1.7)], [1.0, PAGECAM, 1.0], [L[1].t0, ON(1000, 300, 1.6), 1.4], [L[2].t0 - 0.6, ON(452, 410, 1.6), 1.0], [L[4].t0, ON(452, 470, 1.8), 1.0]]);
  c = withTight(sh, lt, c, PG.x + 140, PG.y + 200, 2.6);
  void gS;
  cam(c, () => {
    room(sh, lt, 2, { book: 'plain', girl: 1 }); reader(RDX, 1, lt, { down: true });
    pageStack(lt, pages, tn.map((q) => q.at), 2, null);
    ringOf(cx, cy, rx, ry, 1, gc, 0.2, 1, 13000, { alpha: 0.9 * (1 - U(lt, 0, 2.0)) + 0.35 * U(lt, L[1].t0, L[1].t0 + 1) * (1 - U(lt, L[2].t0 - 1, L[2].t0)) });
  });
};

SHOTS.press = (lt, sd, sh) => {
  const L = sh.lines, ru = cue(sh, 'rush'), pr = cue(sh, 'press'), ts = stampTimes(sh);
  let n = 0, down = 0; for (const t of ts) { if (lt >= t + 0.15) n++; down = Math.max(down, lt >= t - 0.18 && lt < t + 0.3 ? (lt < t ? E.in(U(lt, t - 0.18, t)) : 1 - U(lt, t + 0.05, t + 0.3)) : 0); }
  const su = U(lt, ru.at, ru.to) * (1 - U(lt, L[2].t0 - 0.2, L[2].t0 + 0.5));
  let c = camFor(lt, [[0, WIDE], [L[2].t0, ON(1060, 290, 1.6), 1.0], [pr.at - 0.6, ON(200, 470, 1.7), 1.2], [L[5].t0 - 0.2, WIDE, 1.6]]);
  c = withTight(sh, lt, c, 150, 560, 2.3);
  const vis = U(lt, pr.at - 1.4, pr.at - 0.2);
  cam(c, () => {
    room(sh, lt, 2, { book: 'plain', girl: 1 }); reader(RDX, 1, lt, { down: true });
    pageStack(lt, [() => rulePage(1e3, T.shots.find((s) => s.shot === 'rule'))], [], 2, null);
    if (vis > 0) { X.save(); X.globalAlpha = vis; pressMachine(down, n); pile(n); X.restore(); }
    X.save(); X.globalAlpha = su > 0 ? Math.min(1, su * 4) * (1 - U(lt, L[2].t0 - 0.2, L[2].t0 + 0.5)) : 0; if (X.globalAlpha > 0) sheets(U(lt, ru.at, ru.to), lt); X.restore();
  });
};

SHOTS.end = (lt, sd, sh) => {
  const tu = cue(sh, 'turn'), pS = T.shots.find((s) => s.shot === 'press'), n0 = stampTimes(pS).length;
  cam(ON(640, 400, 1.0), () => {
    wallAndFloor(); lectern(); pressMachine(0, 0); pile(n0); dshelf({ girl: 1 }); bookBody();
    const fin = () => { pageBase('', ''); ringOf(PCX, PCY - 30, 110, 46, 1, -Math.PI / 2 + 0.6, 0.18, 1, 13100); txt('Devochka', PCX, PCY + 60, 14, { italic: true }); };
    if (lt < tu.at) rulePage(1e3, T.shots.find((s) => s.shot === 'rule')); else fin();
    flip(U(lt, tu.at, tu.at + 0.8), () => rulePage(1e3, T.shots.find((s) => s.shot === 'rule')), fin);
    X.globalAlpha = seg(lt, 2.6, 3.8);
    shape(R(668, 186, 572, 270), { lw: 0, fill: P.paper });
    txt('A HISTORY OF BITIC LITERATURE', 954, 222, 25, {});
    txt('MONOETICS AND MIMESIS', 954, 258, 15, { mono: true });
    txt('machines that make words, and a novel Dostoevsky could not write', 954, 296, 15.5, { italic: true });
    txt('after Stanisław Lem, A History of Bitic Literature, Volume I,', 954, 346, 15, { italic: true });
    txt('in Imaginary Magnitude (1973), translated by Marc E. Heine.', 954, 370, 15, { italic: true });
    txt('Narration paraphrases Lem.', 954, 394, 15, { italic: true });
    X.globalAlpha = 1;
  });
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
  T = await (await fetch('timing/bm.json')).json();
  await document.fonts.ready; await Promise.all(['IM Fell English', 'IBM Plex Mono'].map((n) => document.fonts.load(`20px "${n}"`))); await document.fonts.load(`italic 20px "IM Fell English"`); await document.fonts.load(`600 20px "IBM Plex Mono"`);
  X = document.getElementById('film').getContext('2d');
  window.__NF = Math.ceil(T.dur * 24); window.__T = T; window.__ready = true;
})();
