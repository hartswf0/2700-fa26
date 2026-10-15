/* The Fifth Sally (A), or Trurl's Prescription: drawing. Same toolkit as the earlier films (ink.js plus the head of the Ferrix drawing file).
   The device: force fails against the thing, procedure wins. The thing is an ink drawing in the upper band whose size is its only readout. */
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




/* ================= helpers ================= */
let T = null, GT = 0, INSIDE = false;
const sayAt = (sh, who, lt) => { for (const l of sh.lines) if (l.who === who && lt >= l.t0 && lt < l.t1) return l.env[Math.min(l.env.length - 1, Math.floor((lt - l.t0) * 24))] || 0; return 0; };
const talking = (sh, who, lt) => sh.lines.some((l) => l.who === who && lt >= l.t0 - 0.1 && lt < l.t1 + 0.2);
const cue = (sh, k, i = 0) => sh.cues.filter((c) => c.k === k)[i];
const cues = (sh, k) => sh.cues.filter((c) => c.k === k);
function cam(c, fn) { X.save(); X.translate(CX, CY); X.scale(c.z, c.z); X.translate(-CX - c.x, -CY - c.y); fn(); X.restore(); }
const ON = (x, y, z) => ({ z, x: x - CX, y: y - CY });
function blendCam(a, b, u) { return { z: lerp(a.z, b.z, u), x: lerp(a.x, b.x, u), y: lerp(a.y, b.y, u) }; }
function camFor(lt, plan, dur = 0.8) { let c = plan[0][1]; for (let i = 1; i < plan.length; i++) { const [t0, cc] = plan[i]; if (lt >= t0) c = blendCam(c, cc, seg(lt, t0, t0 + dur, E.io)); } return c; }
function CV(sh, name, lt, def = 0) { const ks = sh.curve && sh.curve[name]; if (!ks || !ks.length) return def; if (lt <= ks[0][0]) return ks[0][1]; for (let i = 0; i < ks.length - 1; i++) { const a = ks[i], b = ks[i + 1]; if (lt >= a[0] && lt <= b[0]) return b[0] > a[0] ? lerp(a[1], b[1], (lt - a[0]) / (b[0] - a[0])) : b[1]; } return ks[ks.length - 1][1]; }
function darkWall(x0, y0, x1, y1, sp = 2.6) { X.fillStyle = P.paper; X.fillRect(x0, y0, x1 - x0, y1 - y0); X.save(); path(R(x0, y0, x1 - x0, y1 - y0)); X.clip(); for (let y = y0; y < y1; y += sp) { X.fillStyle = P.ink; X.fillRect(x0, y, x1 - x0, 0.9 + 0.5 * hash(y | 0, 5)); } X.restore(); }
function crown(x, y, s, id) { const p = [[-26, 0], [-30, -30], [-14, -12], [0, -36], [14, -12], [30, -30], [26, 0]].map(([a, b]) => [x + a * s, y + b * s]); shape(p, { lw: 1.4, id, h: [0.3, 2.4, 0.5] }); for (const [a, b] of [[-30, -30], [0, -36], [30, -30]]) ball(x + a * s, y + b * s - 5 * s, 5 * s, id + 3 + a, PAT.f, 1); }
function hatchSky(y0, y1, x0 = -400, x1 = 1700) { for (let y = y0; y < y1; y += 4) { X.fillStyle = P.ink; X.fillRect(x0, y, x1 - x0, 0.5 + 1.1 * clamp((y1 - y) / (y1 - y0)) * 0.8 + hash(y | 0, 3) * 0.2); } }
function stip(pts, id, dens = 0.012, sz = 1.3) { if (SILENT) return; X.save(); path(pts); X.clip(); const [a, b, c, d] = bbox(pts); const n = Math.min(1600, (c - a) * (d - b) * dens); X.fillStyle = P.ink; for (let i = 0; i < n; i++) X.fillRect(a + hash(id, i) * (c - a), b + hash(id + 1, i) * (d - b), sz, sz); X.restore(); }
function blobPts(x, y, rx, ry, id, n = 18, wob = 0.14, droop = 0, ang = 0) {
  n = Math.max(n, 30); const h1 = hash(id, 91) * 6.283, h2 = hash(id, 92) * 6.283, h3 = hash(id, 93) * 6.283;
  const p = [], ca = Math.cos(ang), sa = Math.sin(ang);
  for (let i = 0; i < n; i++) { const a = i / n * 6.2832, r = 1 + wob * (0.6 * Math.sin(2 * a + h1) + 0.4 * Math.sin(3 * a + h2) + 0.25 * Math.sin(5 * a + h3)) + J(id, i) * 0.012; let px = Math.cos(a) * rx * r, py = Math.sin(a) * ry * r; if (py > 0) py += droop * Math.pow(Math.sin(a), 3) * ry * 0.3; p.push([x + px * ca - py * sa, y + px * sa + py * ca]); }
  return p;
}
function wet(pts, id, o = {}) { shape(pts, { lw: o.lw ?? 1.5, id, fill: o.fill || P.paper, h: o.h, amp: 0.9 }); if (o.dens !== 0) stip(pts, id + 7, o.dens ?? 0.01); }
function dashed(pts, lw = 1, dash = [4, 5]) { if (SILENT) return; path(pts); X.setLineDash(dash); X.lineWidth = lw; X.strokeStyle = P.ink; X.stroke(); X.setLineDash([]); }

/* ================= math ================= */
const rot = (x, y, a) => { const c = Math.cos(a), s = Math.sin(a); return [x * c - y * s, x * s + y * c]; };
const bez = (a, c, b, u) => [(1 - u) * (1 - u) * a[0] + 2 * (1 - u) * u * c[0] + u * u * b[0], (1 - u) * (1 - u) * a[1] + 2 * (1 - u) * u * c[1] + u * u * b[1]];
const mix = (a, b, u) => [lerp(a[0], b[0], u), lerp(a[1], b[1], u)];
function kf(t, k) { if (t <= k[0][0]) return k[0][1]; for (let i = 1; i < k.length; i++) { if (t <= k[i][0]) { const [a, va] = k[i - 1], [b, vb, e] = k[i]; return lerp(va, vb, (e || E.io)((t - a) / (b - a))); } } return k[k.length - 1][1]; }
const pulse = (t, a, d = 0.18) => (t >= a && t < a + d ? Math.sin(Math.PI * (t - a) / d) : 0);

/* ================= the graph: nodes are balls, connections are lines ================= */
function gnode(x, y, r, id, o = {}) {
  ball(x, y, r, id, o.pat || PAT.f, o.lw || Math.max(1, r * 0.18), o.fill || P.paper);
  if (o.ring) { X.beginPath(); X.arc(x, y, r + 4, 0, 6.2832); X.lineWidth = 1.8; X.strokeStyle = o.ring; X.stroke(); }
}
/* a connection from a to b, drawn up to the fraction u */
function gedge(a, b, id, o = {}) {
  const u = o.u ?? 1; if (u <= 0) return;
  ink([a, [a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u]], o.lw || 1.6, id, o.amp ?? 0.5, o.col || P.ink);
}
/* the flash at the moment a connection closes */
function spark(x, y, u, id, r = 14, col = P.ink) { if (u <= 0 || u >= 1) return; star(x, y, r * (0.5 + u), id, col, 6); }
/* the running count of linked nodes */
function linkedTag(n, label = 'LINKED') {
  if (n < 1) return;
  const s = `${label} ${String(Math.floor(n)).padStart(3, '0')}`; X.font = '600 17px "IBM Plex Mono",monospace'; const w = X.measureText(s).width;
  const x1 = 1226, y1 = 668; shape(R(x1 - w - 58, y1 - 17, w + 48, 34), { lw: 1.4, id: 9100, fill: P.paper });
  gnode(x1 - w - 44, y1, 4.5, 9101); gnode(x1 - w - 22, y1, 4.5, 9102); line([x1 - w - 40, y1], [x1 - w - 26, y1], 1.6, 9103, 0.1);
  txt(s, x1 - 12, y1 + 1, 17, { mono: true, bold: true, align: 'right' });
}

/* ================= characters ================= */
function klap(x, y, s, sh, lt, o = {}) { const sp = sh ? talking(sh, 'K', lt) : false, e = sh ? sayAt(sh, 'K', lt) : 0; constructor_(x, y, s, 600, { robe: true, f: o.f || 1, seated: o.seated, ra: o.ra || (sp ? [0.1 - e * 0.5, -0.5 - e * 0.4] : [1.5, 1.6]), la: o.la || [1.4, 1.65], open: o.open ?? (sp ? 0.8 : 0), look: o.look ?? 1, lookY: o.lookY || 0, mouth: e, tilt: o.tilt || 0 }); }
function trurl(x, y, s, sh, lt, o = {}) { const sp = sh ? talking(sh, 'T', lt) : false, e = sh ? sayAt(sh, 'T', lt) : 0; constructor_(x, y, s, 400, { f: o.f || 1, seated: o.seated, ra: o.ra || (sp ? [-0.3 - e * 0.3, -0.2 - e * 0.4] : [1.5, 1.6]), la: o.la || [1.4, 1.65], open: sp ? 0.8 : 0, look: o.look ?? 1, lookY: o.lookY || 0, mouth: e, tilt: o.tilt || 0 }); }
/* a king: a robed constructor with a crown; A is thin and patched and holds a purse, F wears a plume and medals */
function king(x, y, s, id, sh, lt, o = {}) {
  const f = o.f || 1, sp = o.who && sh ? talking(sh, o.who, lt) : false, e = o.who && sh ? sayAt(sh, o.who, lt) : 0;
  if (o.seated) { const x0 = Math.min(x - 44 * s, x + f * 80 * s), x1 = Math.max(x - 44 * s, x + f * 80 * s); shape(R(x0 - 10, y - 124 * s, x1 - x0 + 20, 124 * s), { lw: 1.8, id: id + 300, h: [Math.PI / 2, 3, 0.6] }); if (o.throne !== false) shape(R(x - f * 70 * s - 12, y - 330 * s, 24, 330 * s), { lw: 1.8, id: id + 301, h: [Math.PI / 2, 2.6, 0.7] }); }
  constructor_(x, y, s, id, { robe: true, f, seated: o.seated, ra: o.ra || (sp ? [0.1 - e * 0.5, -0.5 - e * 0.4] : [1.5, 1.6]), la: o.la || [1.4, 1.65], open: sp ? 0.8 : 0, look: o.look ?? 1, mouth: e, tilt: o.tilt || 0, hx: o.hx || 0 });
  const hx = x + (o.hx || 0) * s * f, hy = y - 286 * s;
  crown(hx, hy - 36 * 0.95 * s, 1.15 * s, id + 400);
  if (o.type === 'F') {
    for (let i = 0; i < 4; i++) ink([[hx, hy - 78 * s], [hx + f * (6 + i * 7) * s, hy - 110 * s - Math.sin(i) * 8 * s], [hx + f * (14 + i * 9) * s, hy - 100 * s + i * 8 * s]], 1.6, id + 410 + i, 0.3);
    for (let i = 0; i < 5; i++) ball(x + f * (-18 + i * 9) * s, y - 206 * s + (i % 2) * 8 * s, 4.2 * s, id + 420 + i, PAT.f, 1);
  } else {
    for (const [px, py] of [[-14, -196], [16, -184]]) shape(R(x + f * px * s - 6 * s, y + py * s - 6 * s, 12 * s, 12 * s), { lw: 1, id: id + 430 + px, h: [0.7, 1.8, 0.7] });
    if (o.purse) { ball(o.purse[0], o.purse[1], 13 * s, id + 440, PAT.m, 1.6); line([o.purse[0] - 5 * s, o.purse[1] - 12 * s], [o.purse[0] + 5 * s, o.purse[1] - 12 * s], 2, id + 441, 0.1); }
  }
}
/* a small box robot: a citizen, the child, a recruit */
function citizen(x, y, s, id, o = {}) { micro(x, y, s, id, { f: o.f || 1, walk: o.walk || 0, ph: o.ph || 0, wave: o.wave || 0, look: o.look || 0, mouth: o.mouth || 0, tilt: o.tilt || 0, ant: o.ant || 0, bob: o.bob || 0 }); }

const SHOTS = {};
const Lx = (sh, i) => sh.lines[i];
function hatchSkyBand(y0, y1) { X.save(); X.globalAlpha = 0.5; skyLines(y0, y1, y1 + 500); X.restore(); }
function floorLines(y0, y1, id = 7000) { for (let y = y0, k = 0; y < y1; y += 4 + k * 0.5, k++) { X.fillStyle = P.ink; X.fillRect(PX0, y, PX1 - PX0, 0.5 + k * 0.05); } }
/* a table with legs */
function table(x, y, w, id, h = 124) { shape(R(x - w / 2, y, w, 14), { lw: 1.8, id, h: [0.1, 3, 0.6] }); for (const k of [-1, 1]) shape(R(x + k * (w / 2 - 20) - 6, y + 14, 12, h), { lw: 1.4, id: id + 1 + k, h: [Math.PI / 2, 2.4, 0.6] }); }
/* the golden box with two beads; open 0..1, link 0..1 draws the connection, pinkB 0..1 */
function wallRoom(y = 520, sp = 2.8) { darkWall(PX0 - 400, PY0 - 400, PX1 + 400, y, sp); X.fillStyle = P.paper; X.fillRect(PX0 - 400, y, PX1 - PX0 + 800, 500); floorLines(y + 2, 720); line([PX0 - 400, y], [PX1 + 400, y], 2.4, 7400, 0.3); }
function column(x, y0, y1, w, id) { shape(R(x - w / 2, y0, w, y1 - y0), { lw: 1.8, id, h: [Math.PI / 2, 3, 0.6], sh: R(x + w * 0.1, y0, w * 0.4, y1 - y0), sh2: [Math.PI / 2, 1.6, 0.8] }); shape(R(x - w * 0.62, y0 - 14, w * 1.24, 14), { lw: 1.4, id: id + 1 }); shape(R(x - w * 0.62, y1, w * 1.24, 12), { lw: 1.4, id: id + 2 }); }
function bubble(x, y, w, h, tx, ty, id) { // a thought bubble pointing at (tx,ty)
  const p = blobPts(x, y, w / 2, h / 2, id, 24, 0.05); shape(p, { lw: 1.6, id, fill: P.paper, amp: 0.4 });
  ball(lerp(x, tx, 0.7), lerp(y + h / 2, ty, 0.55), 6, id + 1, PAT.f, 1.2); ball(lerp(x, tx, 0.88), lerp(y + h / 2, ty, 0.8), 3.5, id + 2, PAT.f, 1);
}

/* ================= the frame: an upper band for the thing, a lower stage for everyone else ================= */
const BAND_Y = 268, TX = 640, TBY = 252;
const ONs = (x, y, z, ty = 470) => ({ z, x: x - CX, y: y - CY - (ty - CY) / z });
const fulcrum = (sh) => sh.lines.find((l) => l.line);
const tightU = (sh, lt) => { const f = fulcrum(sh); return f ? seg(lt, f.t0 - 0.5, f.t0 + 0.3) * (1 - seg(lt, f.t1 + 0.1, f.t1 + 0.8)) : 0; };
const camMix = (a, b, u) => blendCam(a, b, E.io(clamp(u)));
const cueU = (sh, k, lt, dur = 0.5, i = 0) => { const c = cue(sh, k, i); return c ? seg(lt, c.at, c.at + dur, E.out) : 0; };
const cueSpan = (sh, k, lt, i = 0) => { const c = cue(sh, k, i); return c ? seg(lt, c.at, c.to ?? c.at + 1, E.lin) : 0; };
const around = (sh, k, lt, a = 0, b = 0.5) => cues(sh, k).some((c) => lt >= c.at - a && lt < (c.to ?? c.at) + b);
const sizeAt = (sh, lt) => CV(sh, 'size', lt, 0);
function stage(c, fn) { X.save(); path(R(PX0, BAND_Y, PX1 - PX0, PY1 - BAND_Y)); X.clip(); cam(c, fn); X.restore(); }
function band(fn) { X.save(); path(R(PX0, PY0, PX1 - PX0, BAND_Y - PY0)); X.clip(); fn(); X.restore(); }
const rr = (a, b, u) => a + (b - a) * u;

/* ---------- the band: sky, ridge, and the thing ---------- */
const ridgeY = (x) => BAND_Y - (9 + 15 * Math.exp(-Math.pow((x - TX) / 320, 2)) + 5 * hash(7000, Math.round(x / 31)));
function bandBG(lt, push = 0) {
  X.fillStyle = P.paper; X.fillRect(PX0, PY0, PX1 - PX0, BAND_Y - PY0);
  X.save(); X.globalAlpha = 0.5; skyLines(PY0, BAND_Y, BAND_Y + 300); X.restore();
  for (let i = 0; i < 18; i++) { const x0_ = 60 + hash(7010, i) * 1160, y0_ = 40 + hash(7011, i) * 140, x = TX + (x0_ - TX) * (1 + push * 0.45), y = y0_ - push * 16; X.fillStyle = P.paper; X.fillRect(x - 2, y - 2, 5, 5); X.fillStyle = P.ink; X.fillRect(x - 0.5, y - 0.5, 2, 2); }
  const pts = [[PX0 - 10, BAND_Y + 4]]; for (let i = 0; i <= 44; i++) { const x = PX0 + i * (PX1 - PX0) / 44; pts.push([x, ridgeY(x)]); } pts.push([PX1 + 10, BAND_Y + 4]);
  shape(pts, { lw: 1.8, id: 7001, h: [0.05, 3.4, 0.55], amp: 0.7 });
}
function bandDivider() { X.fillStyle = P.ink; X.fillRect(PX0, BAND_Y, PX1 - PX0, 3); }

const LUMPS = [[-190, -40, 100, 58], [-70, -52, 125, 72], [70, -56, 130, 78], [195, -38, 105, 54], [-125, -108, 82, 58], [15, -128, 98, 74], [135, -102, 82, 58], [-35, -182, 58, 44], [88, -172, 46, 38], [-100, -160, 40, 34]];
/* the thing: a heap of lumps, pits, pustules and drips. Its size (0..1) is the only readout. */
function drawThing(size, lt, o = {}) {
  if (size <= 0.004) return;
  const K = 0.93 * size, dy = o.dy || 0, ox = o.dx || 0;
  const damp = 1 - seg(size, 0.012, 0.07);
  if (damp > 0) { // the damp spot, which is what it ends as
    const w = 24 + 6 * (1 - damp); X.save(); X.globalAlpha = Math.max(damp, size > 0.07 ? 0 : 1);
    X.beginPath(); X.ellipse(TX + ox, TBY - 3 + dy, w, 5.5, 0, 0, 6.2832); X.fillStyle = P.paper; X.fill(); X.lineWidth = 1.4; X.strokeStyle = P.ink; X.stroke();
    X.fillStyle = P.ink; for (let i = 0; i < 40; i++) { const a = hash(7100, i) * 6.2832, r = Math.sqrt(hash(7101, i)) * w * 0.9; X.fillRect(TX + ox + Math.cos(a) * r, TBY - 3 + dy + Math.sin(a) * r * 0.22, 1.4, 1.4); } X.restore();
  }
  if (size < 0.045) return;
  const a = clamp((size - 0.045) / 0.03);
  X.save(); X.globalAlpha = a;
  const lw = Math.max(1.1, 2.3 * Math.sqrt(size));
  LUMPS.forEach(([lx, ly, rx, ry], i) => {
    const br = 1 + 0.014 * Math.sin(lt * 2.1 + i * 1.3);
    const cx = TX + ox + lx * K, cy = TBY + dy + ly * K * (i < 4 ? 1 : 1) * br;
    const pts = blobPts(cx, cy, rx * K, ry * K * br, 7200 + i * 17, 28, 0.17, 0.35);
    wet(pts, 7200 + i * 17, { lw, h: [0.7 + i * 0.2, Math.max(2.4, 3.8 * K), 0.5], dens: 0.014 });
  });
  if (size > 0.2) {
    // pits and pustules
    const pit = (lx, ly, rx, ry, id) => { X.beginPath(); X.ellipse(TX + ox + lx * K, TBY + dy + ly * K, rx * K, ry * K, 0.3, 0, 6.2832); X.fillStyle = P.ink; X.fill(); X.beginPath(); X.arc(TX + ox + (lx + 3) * K, TBY + dy + (ly - 2) * K, Math.max(0.8, 2.2 * K), 0, 6.2832); X.fillStyle = P.paper; X.fill(); };
    pit(-10, -140, 17, 10); pit(52, -150, 12, 14); pit(-150, -118, 9, 7);
    for (let i = 0; i < 26; i++) { const li = Math.floor(hash(7300, i) * 7), [lx, ly, rx, ry] = LUMPS[li], ang = hash(7301, i) * 6.2832, r = 0.72 + hash(7302, i) * 0.2; const px = lx + Math.cos(ang) * rx * r, py = ly + Math.sin(ang) * ry * r; ball(TX + ox + px * K, TBY + dy + py * K, Math.max(1.6, (4 + hash(7303, i) * 7) * K), 7310 + i, PAT.m, 1); }
    // a crooked crease with ticks, like a mouth
    const cr = []; for (let i = 0; i <= 12; i++) { const u = i / 12; cr.push([TX + ox + (-110 + u * 220) * K, TBY + dy + (-72 + Math.sin(u * 3.1 + 0.5) * 18 + u * 12) * K]); }
    ink(cr, Math.max(1, 2.4 * K), 7400, 0.8);
    for (let i = 1; i < 12; i += 1) { const p = cr[i]; ink([p, [p[0] + (i % 2 ? 3 : -3) * K, p[1] + (7 + hash(7401, i) * 8) * K]], Math.max(0.9, 1.6 * K), 7410 + i, 0.3); }
    // drips down from the lower edge
    for (let i = 0; i < 6; i++) { const x = -230 + i * 85 + hash(7500, i) * 30, y0 = -10, d = (18 + hash(7501, i) * 20 + 6 * Math.sin(lt * 1.4 + i)) * K; ink([[TX + ox + x * K, TBY + dy + y0 * K], [TX + ox + (x + 2) * K, TBY + dy + (y0 + d) * K]], Math.max(1, 2.2 * K), 7510 + i, 0.4); ball(TX + ox + (x + 2) * K, TBY + dy + (y0 + d + 3) * K, Math.max(1.2, 3.4 * K), 7520 + i, PAT.m, 1); }
  }
  X.restore();
}

/* ---------- gears, springs, the vending machine ---------- */
function gear(x, y, r, teeth, rot, id, o = {}) {
  const pts = []; for (let i = 0; i < teeth; i++) { const a0 = rot + i * 6.2832 / teeth, w = 3.14159 / teeth; for (const [da, rd] of [[-0.9, 0.8], [-0.55, 1], [0.55, 1], [0.9, 0.8]]) pts.push([x + Math.cos(a0 + da * w) * r * rd, y + Math.sin(a0 + da * w) * r * rd]); }
  shape(pts, { lw: o.lw || 1.8, id, h: o.h === null ? undefined : [0.4 + rot, Math.max(2.6, r * 0.06), 0.5], amp: 0.5 });
  const sp = o.spokes ?? 5; for (let i = 0; i < sp; i++) { const a = rot + i * 6.2832 / sp; ink([[x + Math.cos(a) * r * 0.2, y + Math.sin(a) * r * 0.2], [x + Math.cos(a) * r * 0.68, y + Math.sin(a) * r * 0.68]], Math.max(1.2, r * 0.05), id + 1 + i, 0.3); }
  ball(x, y, Math.max(3, r * 0.14), id + 9, PAT.f, 1.4); circ(x, y, r * 0.7, id + 10); X.lineWidth = 1; X.strokeStyle = P.ink; X.stroke();
}
function spring(x0, y0, x1, y1, w, n, id) { const pts = [[x0, y0]]; const dx = x1 - x0, dy = y1 - y0, L = Math.hypot(dx, dy) || 1, nx = -dy / L, ny = dx / L; for (let i = 1; i < n * 2; i++) { const u = i / (n * 2); pts.push([x0 + dx * u + nx * w * (i % 2 ? 1 : -1), y0 + dy * u + ny * w * (i % 2 ? 1 : -1)]); } pts.push([x1, y1]); ink(pts, 1.6, id, 0.3); }
function vend(x, y, s, id, o = {}) { // y = ground
  X.save(); X.translate(x, y); X.scale(s, s);
  shape(R(-58, -240, 116, 240), { lw: 2.4, id, h: [Math.PI / 2, 4, 0.5], sh: R(24, -240, 34, 240), sh2: [Math.PI / 2, 2.2, 0.8] });
  shape(R(-48, -228, 66, 160), { lw: 2, id: id + 1, fill: P.paper });
  for (let r = 0; r < 4; r++) for (let c = 0; c < 4; c++) { const px = -42 + c * 15, py = -222 + r * 38; shape(R(px, py + 6, 11, 26), { lw: 1, id: id + 10 + r * 4 + c, h: [(r + c) % 2 ? 0.7 : -0.7, 2.2, 0.6] }); }
  for (let r = 0; r < 4; r++) ink([[-48, -192 + r * 38], [18, -192 + r * 38]], 1.2, id + 40 + r, 0.2);
  shape(R(26, -226, 26, 60), { lw: 1.4, id: id + 2, fill: P.paper }); for (let i = 0; i < 6; i++) ball(32 + (i % 2) * 12, -216 + Math.floor(i / 2) * 15, 3.4, id + 50 + i, PAT.f, 0.9);
  shape(R(28, -150, 22, 10), { lw: 1.2, id: id + 3, fill: P.ink });
  shape(R(-40, -58, 70, 36), { lw: 2, id: id + 4, fill: P.paper }); shape(R(-30, -48, 50, 16), { lw: 1.2, id: id + 5, fill: P.ink });
  if (o.hum) for (let i = 0; i < 3; i++) { const u = (GT * 1.3 + i / 3) % 1; ink([[-66 - u * 14, -120 - i * 24], [-66 - u * 14, -100 - i * 24]], 1.1, id + 60 + i, 0.2); ink([[66 + u * 14, -120 - i * 24], [66 + u * 14, -100 - i * 24]], 1.1, id + 70 + i, 0.2); }
  X.restore();
}

/* ---------- the Steelypip ---------- */
function pip(x, y, s, id, o = {}) {
  if (SILENT) return;
  const f = o.f || 1, mood = o.mood || 'flat', m = o.mouth || 0, wk = o.walk || 0, ph = o.ph || 0, bob = o.bob || 0, lk = o.look || 0, up = o.up || 0;
  X.save(); X.translate(x, y); X.scale(s * f, s); X.globalAlpha = o.alpha ?? 1;
  ink([[-26, -40 - bob], [-48, -34], [-58, -18], [-46, -6]], 2, id + 1, 0.3); shape(R(-54, -8, 14, 9), { lw: 1.3, id: id + 2, fill: P.ink }); ink([[-50, 1], [-50, 4]], 1.4, id + 3, 0.1); ink([[-44, 1], [-44, 4]], 1.4, id + 4, 0.1);
  for (const k of [-1, 1]) { const q = ph + (k > 0 ? Math.PI : 0), sw = Math.sin(q) * 8 * wk, lift = Math.max(0, Math.cos(q)) * 5 * wk;
    ink([[k * 12, -26 - bob], [k * 12 + sw, -5 - lift]], 2.6, id + 5 + k, 0.2); shape([[k * 12 + sw - 9, -5 - lift], [k * 12 + sw + 9, -5 - lift], [k * 12 + sw + 11, -lift], [k * 12 + sw - 11, -lift]], { fill: P.ink, lw: 0.6, id: id + 8 + k }); }
  const hand = (k) => { const a0 = [k * 30, -68 - bob]; let b = [k * 46, -42 - bob + Math.sin(ph + k) * 3 * wk];
    if (up > 0) b = [k * (46 - 6 * up), -42 - bob - 62 * up]; if (o.head && k > 0) b = [8, -104 - bob + 16]; if (o.hold && k > 0) b = o.hold; ink([a0, [(a0[0] + b[0]) / 2 + k * 6, (a0[1] + b[1]) / 2 + 4], b], 2.4, id + 12 + k, 0.2); ball(b[0], b[1], 4.6, id + 14 + k, PAT.f, 1.2); };
  hand(-1); hand(1);
  ball(0, -56 - bob, 32, id + 10, PAT.m, 2.2);
  ink([[-31, -50 - bob], [0, -45 - bob], [31, -50 - bob]], 1.2, id + 16, 0.3);
  X.beginPath(); X.arc(12, -66 - bob, 7, 0, 6.283); X.fillStyle = P.paper; X.fill(); X.lineWidth = 1.7; X.strokeStyle = P.ink; X.stroke(); X.beginPath(); X.arc(12, -66 - bob, 2.3, 0, 6.283); X.fillStyle = P.ink; X.fill();
  for (const [rx, ry] of [[-20, -72], [-8, -34], [22, -42]]) { X.beginPath(); X.arc(rx, ry - bob, 1.5, 0, 6.283); X.fillStyle = P.ink; X.fill(); }
  ink([[-3, -88 - bob], [-3, -82 - bob]], 1.6, id + 17, 0.1);
  const hy = -104 - bob, tl = o.tilt || 0;
  X.save(); X.translate(0, hy); X.rotate(tl); X.translate(0, -hy);
  spring(0, hy - 21, 0, hy - 44, 3.4, 5, id + 18); ball(0, hy - 47, 3.2, id + 19, PAT.f, 1);
  ball(0, hy, 22, id + 20, PAT.f, 2);
  for (const k of [-1, 1]) {
    const ex = k * 8.5 + lk * 1.5, ey = hy - 3;
    X.beginPath(); X.arc(ex, ey, 5.6, 0, 6.283); X.fillStyle = P.paper; X.fill(); X.lineWidth = 1.3; X.strokeStyle = P.ink; X.stroke();
    if (mood === 'happy') { X.fillStyle = P.paper; X.fillRect(ex - 7, ey - 7, 14, 14); ink([[ex - 5, ey + 2], [ex, ey - 3], [ex + 5, ey + 2]], 1.6, id + 22 + k, 0.1); }
    else {
      X.fillStyle = P.ink; X.beginPath(); X.arc(ex + lk * 1.8, ey + (o.lookY || 0) * 1.5, 2.2, 0, 6.283); X.fill();
      if (mood === 'smug') { X.save(); X.beginPath(); X.arc(ex, ey, 5.6, 0, 6.283); X.clip(); X.fillStyle = P.ink; X.fillRect(ex - 7, ey - 7, 14, 7.8); X.restore(); }
      if (mood === 'flat' || mood === 'worry') ink([[ex - 5, ey - 8 + (mood === 'worry' ? (k > 0 ? 3 : -3) * 0 : 0)], [ex + 5, ey - 8]], 1.2, id + 24 + k, 0.1);
    }
    if (mood === 'smug') ink([[ex - 6, ey - 9 - (k > 0 ? 2 : 0)], [ex + 6, ey - 9 + (k > 0 ? 0 : -2)]], 1.5, id + 26 + k, 0.1);
    if (mood === 'worry') ink([[ex - k * 6, ey - 8], [ex + k * 6, ey - 13]], 1.6, id + 28 + k, 0.1);
  }
  const my = hy + 12;
  if (m > 0.08) { X.fillStyle = P.ink; X.beginPath(); X.ellipse(0, my, 5, 1.5 + m * 5, 0, 0, 6.283); X.fill(); }
  else if (mood === 'smug') ink([[-6, my], [0, my + 2], [7, my - 3]], 1.5, id + 30, 0.1);
  else if (mood === 'happy') ink([[-7, my - 2], [0, my + 3], [7, my - 2]], 1.5, id + 30, 0.1);
  else if (mood === 'worry') ink([[-6, my + 1], [-2, my - 1], [2, my + 1], [6, my - 1]], 1.4, id + 30, 0.1);
  else if (mood === 'slump') ink([[-6, my + 2], [0, my - 1], [6, my + 2]], 1.5, id + 30, 0.1);
  else ink([[-6, my], [6, my]], 1.4, id + 30, 0.1);
  if (mood === 'worry' || mood === 'slump') { const u = (GT * 0.9 + id * 0.13) % 1; ball(22, hy - 6 + u * 14, 2.4, id + 31, PAT.f, 0.8); }
  X.restore();
  X.restore();
}

/* ---------- Trurl, the mailman, the odd vehicle ---------- */
function trurlP(x, y, s, sh, lt, o = {}) { trurl(x, y, s, sh, lt, o); }
function mailman(x, y, s, id, o = {}) {
  const f = o.f || 1;
  citizen(x, y, s, id, { f, walk: o.walk ?? 1, ph: o.ph || 0, look: f > 0 ? 1 : -1, mouth: o.mouth || 0 });
  X.save(); X.translate(x, y); X.scale(s * f, s);
  const bob = 0, hy = -46 - bob;
  shape([[-10, hy - 7], [10, hy - 7], [9, hy - 12], [-8, hy - 13]], { lw: 1.2, id: id + 40, fill: P.ink }); shape([[6, hy - 8], [18, hy - 6], [6, hy - 5]], { lw: 1, id: id + 41, fill: P.ink });
  shape(R(-18, -32, 12, 14), { lw: 1.3, id: id + 42, h: [0.8, 2, 0.6] }); ink([[-14, -32], [8, -34]], 1.2, id + 43, 0.1);
  if (o.letter !== false) { shape(R(12, -30, 14, 10), { lw: 1.1, id: id + 44 }); ink([[12, -30], [19, -25], [26, -30]], 0.9, id + 45, 0.1); }
  X.restore();
}
function oddRide(x, y, s, id, o = {}) { // facing right; y = the bottom of the wheel
  X.save(); X.translate(x, y); X.scale(s * (o.f || 1), s); const rot_ = o.rot || 0;
  if (o.fire > 0) for (let i = 0; i < 6; i++) { const w = (i - 2.5) * 5; ink([[-96, -46 + w], [-96 - (30 + 40 * hash(id, i + 3)) * o.fire, -46 + w * 1.8 + J(id, i) * 5]], 2, id + 70 + i, 1.2); }
  shape([[-100, -30], [-76, -62], [44, -68], [92, -46], [44, -24], [-76, -24]], { lw: 2.2, id: id + 1, h: [0.2, 4, 0.5], sh: [[-20, -70], [100, -70], [100, -20], [-20, -20]], sh2: [Math.PI / 2, 2.4, 0.7] });
  shape([[-84, -60], [-110, -96], [-58, -64]], { lw: 1.6, id: id + 2, h: [0.9, 3, 0.6] });
  shape([[-84, -28], [-104, 0], [-60, -26]], { lw: 1.6, id: id + 3, h: [-0.9, 3, 0.6] });
  line([-82, -46], [60, -46], 1.2, id + 4, 0.2);
  const nk = [[58, -56], [76, -82], [98, -100]]; ink(nk, 8, id + 5, 0.3); ink(nk, 5, id + 6, 0.3, P.paper);
  shape([[88, -104], [116, -110], [134, -92], [128, -80], [100, -82]], { lw: 1.8, id: id + 7, h: [0.6, 2.6, 0.6] });
  shape([[96, -106], [102, -126], [110, -108]], { lw: 1.4, id: id + 8, fill: P.ink }); X.beginPath(); X.arc(112, -98, 2.3, 0, 6.283); X.fillStyle = P.ink; X.fill(); ink([[130, -88], [134, -86]], 2.6, id + 9, 0.1);
  for (let i = 0; i < 4; i++) ink([[84 - i * 5, -104], [78 - i * 5, -90 - i * 3]], 1.4, id + 10 + i, 0.3);
  shape([[-24, -68], [22, -68], [18, -80], [-18, -80]], { fill: P.ink, lw: 1, id: id + 20 });
  const wx = 6, wy = -34; X.beginPath(); X.arc(wx, wy, 34, 0, 6.283); X.lineWidth = 3; X.strokeStyle = P.ink; X.stroke(); X.beginPath(); X.arc(wx, wy, 29, 0, 6.283); X.lineWidth = 0.9; X.stroke();
  for (let i = 0; i < 8; i++) { const a = rot_ + i * 0.7854; ink([[wx, wy], [wx + Math.cos(a) * 31, wy + Math.sin(a) * 31]], 0.9, id + 30 + i, 0.1); }
  ball(wx, wy, 5, id + 40, PAT.f, 1.2);
  X.restore();
}

/* ---------- the comet, the moon, the sun ---------- */
function sunBig(x, y, r, id) { for (let i = 0; i < 20; i++) { const a = i / 20 * 6.2832; ink([[x + Math.cos(a) * r * 1.25, y + Math.sin(a) * r * 1.25], [x + Math.cos(a) * r * (1.6 + 0.25 * hash(id, i)), y + Math.sin(a) * r * (1.6 + 0.25 * hash(id, i))]], 1.4, id + i, 0.3); } ball(x, y, r, id + 40, PAT.f, 2); }
function moonShape(x, y, r, id, burn = 0) {
  const k = 1 - 0.2 * burn, R_ = r * k, ix = x + R_ * 0.4, ir = R_ * 0.83;
  X.save(); X.translate(x, y); X.rotate(-0.5); X.translate(-x, -y);
  X.save(); X.beginPath(); X.arc(x, y, R_, 0, 6.2832); X.clip(); X.beginPath(); X.rect(x - R_ - 5, y - R_ - 5, 2 * R_ + 10, 2 * R_ + 10); X.arc(ix, y, ir, 0, 6.2832); X.fillStyle = P.paper; X.fill('evenodd');
  X.clip('evenodd'); X.fillStyle = PAT.m; X.fillRect(x - R_, y - R_, 2 * R_, 2 * R_); if (burn > 0) { X.globalAlpha = burn * 0.85; X.fillStyle = PAT.d; X.fillRect(x - R_, y - R_, 2 * R_, 2 * R_); X.globalAlpha = 1; }
  X.beginPath(); X.arc(x, y, R_, 0, 6.2832); X.lineWidth = 4; X.strokeStyle = P.ink; X.stroke(); X.beginPath(); X.arc(ix, y, ir, 0, 6.2832); X.lineWidth = 4; X.stroke(); X.restore();
  ink([[x - R_ * 0.8, y - R_ * 0.1], [x - R_ * 0.55, y + R_ * 0.05], [x - R_ * 0.62, y + R_ * 0.35]], 1.4, id + 1, 0.4);
  for (const t of [-1, 1]) { const tip = [x + 6, y + t * R_ * 0.98]; if (burn > 0.2) ink([tip, [tip[0] + 10 * burn, tip[1] - t * 14 * burn]], 3, id + 5 + t, 0.3); }
  X.restore();
}
function comet(x, y, s, id, o = {}) { // head at x,y; she flies to the left, the four tails stream behind her to the upper right
  const ang = o.ang ?? -0.32, lt = o.t || 0;
  for (let k = 0; k < 4; k++) {
    const a0 = ang + (k - 1.5) * 0.17, Ls = (560 + 90 * k) * s, n = 22, pts = [];
    for (let i = 0; i <= n; i++) { const u = i / n, a = a0 + Math.sin(u * 5 + k * 1.3 + lt * 3) * 0.1 * u; pts.push([x + Math.cos(a) * Ls * u, y + Math.sin(a) * Ls * u - Math.sin(u * 3.1 + k) * 18 * s * u]); }
    X.save(); X.lineCap = 'round'; X.lineJoin = 'round';
    for (let i = 0; i < n; i++) { const u = i / n, w = (26 * (1 - u) + 2) * s; X.beginPath(); X.moveTo(pts[i][0], pts[i][1]); X.lineTo(pts[i + 1][0], pts[i + 1][1]); X.lineWidth = w; X.strokeStyle = 'rgba(79,127,191,' + (0.55 * (1 - u) + 0.08) + ')'; X.stroke(); }
    X.restore();
    ink(pts.map(([px, py], i) => [px, py - (13 * (1 - i / n) + 1) * s]), 1.1, id + 10 + k, 0.8); ink(pts.map(([px, py], i) => [px, py + (13 * (1 - i / n) + 1) * s]), 1.1, id + 20 + k, 0.8);
    for (let i = 2; i < n; i += 2) { const u = i / n, [px, py] = pts[i]; ink([[px, py - 10 * (1 - u) * s], [px - 4 * s, py + 10 * (1 - u) * s]], 0.8, id + 30 + k * 30 + i, 0.2); }
  }
  const r = 38 * s;
  ball(x, y, r, id + 100, PAT.m, 2.4, P.paper);
  // bonnet
  X.beginPath(); X.arc(x + 4 * s, y - 6 * s, r * 1.08, Math.PI * 0.92, Math.PI * 2.02); X.lineTo(x + r * 0.96, y + r * 0.35); X.lineTo(x - r * 0.9, y + r * 0.22); X.closePath(); X.fillStyle = P.paper; X.fill(); X.lineWidth = 2.2; X.strokeStyle = P.ink; X.stroke();
  X.save(); X.clip(); X.fillStyle = PAT.f; X.fillRect(x - r * 1.3, y - r * 1.3, r * 2.6, r * 1.8); X.restore();
  for (let i = 0; i < 9; i++) { const a = Math.PI * 0.95 + i * 0.36; X.beginPath(); X.arc(x + 4 * s + Math.cos(a) * r * 1.1, y - 6 * s + Math.sin(a) * r * 1.1, 6 * s, 0, 6.2832); X.fillStyle = P.paper; X.fill(); X.lineWidth = 1.2; X.stroke(); }
  ink([[x - r * 0.5, y + r * 0.7], [x - r * 0.3, y + r * 1.0], [x - r * 0.62, y + r * 1.2]], 1.6, id + 110, 0.3); ink([[x + r * 0.4, y + r * 0.72], [x + r * 0.5, y + r * 1.05]], 1.6, id + 111, 0.3);
  for (const k of [-1, 1]) { const ex = x + k * r * 0.34 - r * 0.2, ey = y + r * 0.1; ink([[ex - 7 * s, ey - 9 * s * (k < 0 ? 0.4 : 1.2)], [ex + 8 * s, ey - 3 * s]], 2.2, id + 120 + k, 0.2); X.beginPath(); X.arc(ex, ey + 2 * s, 4.6 * s, 0, 6.2832); X.fillStyle = P.ink; X.fill(); }
  ink([[x - r * 0.46, y + r * 0.52], [x - r * 0.2, y + r * 0.42], [x + r * 0.06, y + r * 0.5], [x + r * 0.2, y + r * 0.4]], 2, id + 125, 0.3);
  if (o.fire) for (let i = 0; i < 5; i++) { const q = hash(id + i, BOIL >> 1); ink([[x - r * 0.5, y + r * 0.1], [x - r * (1.4 + q * 1.6), y + r * (0.1 + (i - 2) * 0.35 + q * 0.3)]], 2.2, id + 140 + i, 1.4); }
}
function ashFall(x0, y0, w, h, u, id, n = 90) { X.fillStyle = P.ink; for (let i = 0; i < n; i++) { const fx = x0 + hash(id, i) * w + Math.sin(u * 3 + i) * 6, fy = y0 + hash(id + 1, i) * h * 0.4 + u * h * (0.6 + 0.6 * hash(id + 2, i)); if (fy > y0 + h) continue; X.globalAlpha = 1 - clamp(u * 0.6); X.fillRect(fx, fy, 1.8 + hash(id + 3, i) * 2, 1.8); } X.globalAlpha = 1; }

/* ---------- mushrooms, flashes, scrap ---------- */
function mushroom(x, y, R_, u, id, fade = 0) {
  if (u <= 0) return;
  X.save(); X.globalAlpha = 1 - fade;
  const H = R_ * 3.4, rise = E.out(u), top = y - H * rise, stemW = R_ * 0.42 * (0.5 + 0.5 * rise), n = 14;
  // the stem, a column of overlapping puffs
  for (let i = 0; i < n; i++) { const v = i / (n - 1), py = lerp(y, top + R_ * 0.5, v) * 1, px = x + Math.sin(v * 5 + id) * R_ * 0.08, r_ = stemW * (1.25 - 0.4 * v) * (0.9 + 0.2 * hash(id, i)); if ((y - py) > (y - top) * rise + 4) continue; wet(blobPts(px, py, r_, r_, id + i * 3, 14, 0.2), id + i * 3, { lw: 1.6, dens: 0.012, h: [0.5, 3.2, 0.5] }); }
  // the cap, a ring of puffs
  const cu = clamp((u - 0.15) / 0.85), cr = R_ * (0.35 + 0.65 * E.out(cu));
  for (let i = 0; i < 16; i++) { const a = i / 16 * 6.2832, px = x + Math.cos(a) * cr * 1.15, py = top + Math.sin(a) * cr * 0.62, r_ = cr * (0.42 + 0.14 * hash(id + 9, i)); wet(blobPts(px, py, r_, r_ * 0.9, id + 100 + i * 3, 16, 0.2), id + 100 + i * 3, { lw: 1.8, dens: 0.014, h: [a + 0.4, 3.4, 0.5] }); }
  wet(blobPts(x, top, cr * 1.0, cr * 0.55, id + 200, 22, 0.15), id + 200, { lw: 2, dens: 0.01, h: [0.3, 4, 0.5] });
  X.globalAlpha = (1 - fade) * 0.55 * (1 - cu * 0.5); X.beginPath(); X.ellipse(x, top + cr * 0.1, cr * 0.7, cr * 0.34, 0, 0, 6.2832); X.fillStyle = P.amber; X.fill();
  X.restore();
}
function flashOverlay(t, id) { // t seconds since the blast; a hard ink frame, then a paper-white flash that fades
  if (t < 0 || t > 0.7) return;
  if (t < 0.12) { X.fillStyle = P.ink; X.fillRect(0, 0, W, H); star(CX, 300, 400 * (t / 0.12 + 0.3), id, P.paper, 24); }
  else if (t < 0.22) { X.fillStyle = P.paper; X.fillRect(0, 0, W, H); }
  else { X.globalAlpha = 1 - (t - 0.22) / 0.48; X.fillStyle = P.paper; X.fillRect(0, 0, W, H); X.globalAlpha = 1; }
}
function scrapPile(x, y, s, id, n = 14) { for (let i = 0; i < n; i++) { const px = x + (hash(id, i) - 0.5) * 520 * s, py = y - hash(id + 1, i) * 14 * s, a = hash(id + 2, i) * 3, w = (10 + hash(id + 3, i) * 26) * s, h = (4 + hash(id + 4, i) * 12) * s; X.save(); X.translate(px, py); X.rotate(a); shape(R(-w / 2, -h, w, h), { lw: 1.3, id: id + 10 + i, h: [0.6, 2.4, 0.5] }); X.restore(); if (i % 3 === 0) ball(px + 10 * s, py - 4 * s, 4 * s + 2, id + 40 + i, PAT.f, 1); } }

/* ---------- the attackers ---------- */
function scarechrome(x, y, s, id, o = {}) { // y = ground, faces right
  X.save(); X.translate(x, y); X.scale(s * (o.f || 1), s); const w = o.walk || 0, ph = o.ph || 0, m = o.mouth || 0;
  for (const k of [-1, 1]) { const q = ph + (k > 0 ? 3.14 : 0), sw = Math.sin(q) * 6 * w; ink([[k * 10, -16], [k * 10 + sw, -2]], 3, id + 1 + k, 0.2); shape(R(k * 10 + sw - 7, -4, 14, 4), { fill: P.ink, lw: 0.6, id: id + 4 + k }); }
  shape(R(-20, -58, 40, 44), { lw: 2, id: id + 6, h: [Math.PI / 2, 3, 0.5], sh: R(6, -58, 14, 44), sh2: [Math.PI / 2, 2, 0.8] }); for (let i = 0; i < 3; i++) ink([[-20, -48 + i * 12], [20, -48 + i * 12]], 1.2, id + 8 + i, 0.2);
  const hand = (k) => { const a = [k * 20, -50], b = [k * 38, -66 - (o.arms || 0) * 10 + Math.sin(GT * 12 + k) * 4 * w]; spring(a[0], a[1], b[0], b[1], 3, 4, id + 12 + k); ink([b, [b[0] + k * 8, b[1] - 8]], 2, id + 14 + k, 0.2); ink([b, [b[0] + k * 10, b[1] + 2]], 2, id + 16 + k, 0.2); }; hand(-1); hand(1);
  shape([[-17, -58], [17, -58], [19, -88], [-19, -88]], { lw: 2, id: id + 20, h: [0.3, 3, 0.5] });
  for (let i = 0; i < 4; i++) shape([[-16 + i * 9, -88], [-11 + i * 9, -103 - (i % 2) * 6], [-6 + i * 9, -88]], { lw: 1.2, id: id + 24 + i, fill: P.ink });
  for (const k of [-1, 1]) { ink([[k * 4, -76], [k * 13, -81 - (k > 0 ? 3 : 0)]], 2.4, id + 30 + k, 0.1); X.fillStyle = P.ink; X.beginPath(); X.arc(k * 9, -73, 2.6, 0, 6.28); X.fill(); }
  const top = -66 + (-m * 3), bot = -62 + m * 5; const mp = [[-13, top]]; for (let i = 1; i <= 8; i++) mp.push([-13 + i * 3.25, i % 2 ? bot : top]); X.beginPath(); mp.forEach(([a, b], i) => (i ? X.lineTo(a, b) : X.moveTo(a, b))); X.lineWidth = 1.6; X.strokeStyle = P.ink; X.stroke();
  X.restore();
}
function hydra(x, y, s, id, o = {}) { // y = ground; the swinging arm points right
  X.save(); X.translate(x, y); X.scale(s, s); const arm = o.arm ?? -2.3;
  shape([[-136, -4], [136, -4], [128, -34], [-128, -34]], { lw: 2.2, id, h: [0.1, 3, 0.6] }); for (let i = 0; i < 6; i++) { X.beginPath(); X.arc(-100 + i * 40, -18, 14, 0, 6.2832); X.fillStyle = P.paper; X.fill(); X.lineWidth = 1.8; X.strokeStyle = P.ink; X.stroke(); ball(-100 + i * 40, -18, 3, id + 40 + i, PAT.f, 1); }
  shape([[-118, -34], [100, -34], [96, -132], [-90, -138]], { lw: 2.4, id: id + 1, h: [0.2, 4, 0.5], sh: [[20, -34], [100, -34], [96, -132], [20, -135]], sh2: [Math.PI / 2, 2.4, 0.8] });
  for (let i = 0; i < 5; i++) { ball(-100 + i * 42, -52, 3.2, id + 50 + i, PAT.f, 1); ball(-100 + i * 42, -116, 3.2, id + 60 + i, PAT.f, 1); }
  for (const px of [-60, -20]) { shape(R(px - 12, -178, 24, 46), { lw: 1.6, id: id + 70 + px, h: [Math.PI / 2, 2.6, 0.6] }); ink([[px, -178], [px, -196 - (o.pump || 0) * 20]], 3, id + 80 + px, 0.2); }
  shape([[-26, -132], [26, -132], [20, -150], [-20, -150]], { lw: 1.6, id: id + 90, fill: P.paper });
  if (o.peek !== false) { X.save(); X.translate(-4, -156 - (o.peekU ?? 0.6) * 14); micro(0, 0, 0.62, id + 100, { look: 1 }); X.restore(); }
  const px0 = 92, py0 = -92, a = arm; const ex = px0 + Math.cos(a) * 110, ey = py0 + Math.sin(a) * 110;
  ink([[px0, py0], [ex, ey]], 16, id + 110, 0.3, P.ink); ink([[px0, py0], [ex, ey]], 11, id + 111, 0.3, P.paper); ink([[px0, py0], [ex, ey]], 1.2, id + 112, 0.2, P.ink);
  const fx = ex + Math.cos(a) * 24, fy = ey + Math.sin(a) * 24; ball(fx, fy, 30, id + 120, PAT.m, 2.6); for (let i = 0; i < 4; i++) { const b = a - 0.5 + i * 0.33; ink([[fx + Math.cos(b) * 22, fy + Math.sin(b) * 22], [fx + Math.cos(b) * 38, fy + Math.sin(b) * 38]], 4, id + 130 + i, 0.3); }
  ball(px0, py0, 11, id + 140, PAT.f, 2);
  if (o.sc !== false) scarechrome(-86, -136 - (o.pump || 0) * 0, 0.34, id + 150, {});
  if (o.smoke) for (let i = 0; i < 4; i++) { const u = ((GT * 0.5 + i / 4) % 1); ball(-56 + Math.sin(u * 6 + i) * 6, -208 - u * 40, 6 + u * 10, id + 160 + i, PAT.f, 1); }
  X.restore();
}
function mega(x, y, s, id, o = {}) { // the megalomechanism: a machine that holds a machine that holds a machine, a servospook at the heart
  X.save(); X.translate(x, y); X.scale(s, s);
  const wob = o.shake || 0;
  shape([[-300, 0], [300, 0], [280, -60], [250, -230], [-250, -240], [-290, -60]], { lw: 3, id, h: [0.15, 4.4, 0.55], sh: [[60, 0], [300, 0], [280, -60], [250, -230], [60, -235]], sh2: [Math.PI / 2, 3, 0.8] });
  for (let i = 0; i < 9; i++) ball(-250 + i * 62, -14, 6, id + 5 + i, PAT.f, 1.2);
  gear(-215, -150, 52, 10, GT * 0.4, id + 30, { spokes: 6 }); gear(215, -150, 52, 10, -GT * 0.4, id + 50, { spokes: 6 });
  shape(R(-170, -205, 340, 170), { lw: 3, id: id + 70, fill: P.paper });
  shape([[-140, -40], [140, -40], [130, -150], [-130, -156]], { lw: 2.4, id: id + 71, h: [0.9, 4, 0.5] });
  shape(R(-96, -150, 192, 100), { lw: 2.4, id: id + 72, fill: P.paper });
  shape([[-70, -56], [70, -56], [64, -118], [-64, -122]], { lw: 2, id: id + 73, h: [-0.6, 3.4, 0.5] });
  // the servospook: a hollow face in a round window
  X.beginPath(); X.arc(0, -94, 34, 0, 6.2832); X.fillStyle = P.ink; X.fill(); X.lineWidth = 3; X.strokeStyle = P.paper; X.stroke(); X.beginPath(); X.arc(0, -94, 36, 0, 6.2832); X.lineWidth = 2; X.strokeStyle = P.ink; X.stroke();
  X.fillStyle = P.paper; for (const k of [-1, 1]) { X.beginPath(); X.ellipse(k * 12, -100, 6, 9, 0, 0, 6.2832); X.fill(); } X.beginPath(); X.ellipse(0, -76, 7, 4 + (o.mouth || 0) * 6, 0, 0, 6.2832); X.fill();
  for (let i = 0; i < 5; i++) { const a = -2.6 + i * 0.5 + Math.sin(GT * 3 + i) * 0.15; ink([[Math.cos(a) * 36, -94 + Math.sin(a) * 36], [Math.cos(a) * (50 + 8 * i % 3), -94 + Math.sin(a) * (50 + 8 * i % 3) - 6]], 1.4, id + 80 + i, 0.8, P.paper); }
  const arm = o.arm ?? -2.4, px0 = 250, py0 = -150, ex = px0 + Math.cos(arm) * 150, ey = py0 + Math.sin(arm) * 150;
  ink([[px0, py0], [ex, ey]], 30, id + 90, 0.3); ink([[px0, py0], [ex, ey]], 22, id + 91, 0.3, P.paper); const fx = ex + Math.cos(arm) * 40, fy = ey + Math.sin(arm) * 40; ball(fx, fy, 46, id + 92, PAT.m, 3);
  ball(px0, py0, 16, id + 93, PAT.f, 2);
  X.restore();
}
function ivyStrand(k, u, wilt, lt, id) {
  const base = [[90, 248], [250, 238 - k * 4], [380, 232], [450, 212 + k * 6], [500, 170 - k * 6], [540, 130 + k * 12], [610, 100 + k * 8], [690, 78 + k * 6], [770, 92 + k * 10], [850, 130 + k * 6], [915, 180 - k * 6], [950, 232], [1010, 246 + k * 3]];
  const n = base.length - 1, pts = []; const total = u * n;
  for (let i = 0; i < n; i++) { const a = base[i], b = base[i + 1]; for (let j = 0; j < 6; j++) { const v = j / 6, g = i + v; if (g > total) break; pts.push([lerp(a[0], b[0], v) + Math.sin(g * 3 + k) * 5, lerp(a[1], b[1], v) + Math.cos(g * 2.4 + k * 2) * 4]); } }
  if (pts.length < 2) return;
  const col = wilt > 0.3 ? '#6a5a2c' : P.ink; ink(pts, 3.4 - wilt, id, 0.6, col);
  for (let i = 3; i < pts.length; i += 3) { const [px, py] = pts[i], sd = i % 2 ? 1 : -1, fall = wilt * (30 + hash(id, i) * 40) * (hash(id + 1, i) > 0.3 ? 1 : 0); const lf = [[px, py + fall], [px + sd * 7, py - 8 + fall], [px + sd * 16, py - 3 + fall], [px + sd * 8, py + 5 + fall]]; X.save(); X.globalAlpha = 1 - wilt * 0.7; shape(lf, { lw: 1, id: id + 10 + i, fill: wilt > 0.3 ? P.amber : P.ochre }); X.restore(); }
}

/* ---------- the office: each item draws itself at its anchor ---------- */
const ITEM = {
  desk: (it) => { shape(R(-190, 0, 380, 16), { lw: 2, id: 8010, h: [0.1, 3, 0.6] }); shape(R(-176, 16, 18, 102), { lw: 1.6, id: 8011, h: [Math.PI / 2, 2.4, 0.6] }); shape(R(80, 16, 100, 102), { lw: 1.8, id: 8012, h: [Math.PI / 2, 3, 0.5] }); for (let i = 0; i < 3; i++) { ink([[80, 16 + (i + 1) * 34], [180, 16 + (i + 1) * 34]], 1.4, 8013 + i, 0.2); ball(130, 16 + i * 34 + 18, 3.4, 8020 + i, PAT.f, 1); } shape(R(-158, 16, 230, 18), { lw: 1.2, id: 8030, fill: P.paper }); },
  typewriter: (it, u, lt) => { shape([[-36, 0], [36, 0], [30, -26], [-30, -26]], { lw: 2, id: 8040, h: [0.2, 2.8, 0.6] }); for (let r = 0; r < 3; r++) for (let c = 0; c < 6; c++) ball(-22 + c * 9 + r * 3, -6 - r * 6, 2, 8050 + r * 6 + c, PAT.f, 0.8); shape(R(-44, -36, 88, 8), { lw: 1.6, id: 8070, fill: P.paper }); const rise = (Math.sin(lt * 9) > 0 ? 1 : 0); shape(R(-20, -66 - rise * 1.5, 40, 32), { lw: 1.3, id: 8071 }); for (let i = 0; i < 4; i++) ink([[-15, -60 + i * 6 - rise * 1.5], [-15 + 10 + hash(8072, i) * 18, -60 + i * 6 - rise * 1.5]], 1, 8073 + i, 0.1); },
  chair: () => { shape(R(-64, -124, 134, 12), { lw: 1.8, id: 8080, h: [0.1, 3, 0.6] }); shape(R(-70, -236, 14, 112), { lw: 1.8, id: 8081, h: [Math.PI / 2, 2.6, 0.6] }); for (const x of [-56, 60]) shape(R(x, -112, 10, 112), { lw: 1.4, id: 8082 + x, h: [Math.PI / 2, 2.6, 0.6] }); },
  stamp: (it, u, lt, i) => { const hop = Math.max(0, Math.sin(lt * 3 + i * 1.7)) ** 8 * 12; shape(R(-16, -12 - hop, 32, 12), { lw: 1.8, id: 8090, h: [0.6, 2.4, 0.6] }); ink([[0, -12 - hop], [0, -30 - hop]], 5, 8091, 0.2); ball(0, -34 - hop, 7, 8092, PAT.m, 1.6); ink([[-14, 0], [14, 0]], 2, 8093, 0.1, P.red); },
  paper: (it, u, lt, i) => { const n = it.big ? 7 : 4, w = it.big ? 70 : 44; for (let k = 0; k < n; k++) shape([[-w / 2 + (hash(8100 + i, k) - 0.5) * 12, -k * 5], [w / 2 + (hash(8101 + i, k) - 0.5) * 12, -k * 5], [w / 2 + 3, -k * 5 - 5], [-w / 2 + 2, -k * 5 - 5]], { lw: 1.1, id: 8102 + k + i * 9, fill: P.paper, amp: 0.4 }); ink([[-w / 2 + 6, -n * 5 - 2], [w / 2 - 10, -n * 5 - 3]], 0.8, 8120 + i, 0.2); },
  window: () => { shape(R(-122, -262, 244, 262), { lw: 2.6, id: 8130, h: [Math.PI / 2, 4, 0.5] }); shape(R(-92, -214, 184, 112), { lw: 2.2, id: 8131, fill: P.paper }); for (let i = 0; i < 9; i++) ink([[-86 + i * 21.5, -214], [-86 + i * 21.5, -102]], 1.4, 8132 + i, 0.2); shape(R(-122, -102, 244, 16), { lw: 2, id: 8150, h: [0.1, 3, 0.6] }); shape(R(-16, -150, 32, 14), { lw: 1.2, id: 8151, fill: P.ink }); },
  sign: (it) => { const w = Math.max(70, 12 * it.t.length + 20); ink([[-w / 2 + 8, -14], [-w / 2 + 14, -34]], 1.2, 8160, 0.1); ink([[w / 2 - 8, -14], [w / 2 - 14, -34]], 1.2, 8161, 0.1); shape(R(-w / 2, -14, w, 28), { lw: 1.8, id: 8162, fill: P.paper }); ink([[-w / 2 + 4, -10], [w / 2 - 4, -10]], 0.7, 8163, 0.1); txt(it.t, 0, 1, 14, { mono: true, bold: true }); },
  pigeon: (it) => { const c = it.c, r = it.r, w = 36, h = 30; for (let j = 0; j < r; j++) for (let i = 0; i < c; i++) { const x = -c * w / 2 + i * w, y = -r * h / 2 + j * h; shape(R(x, y, w, h), { lw: 1.5, id: 8170 + j * 9 + i, fill: P.paper, h: [0.7, 3.4, 0.5] }); if (hash(8200 + j, i) > 0.35) shape([[x + 5, y + 9], [x + w - 7, y + 6], [x + w - 5, y + h - 4], [x + 6, y + h - 4]], { lw: 1, id: 8210 + j * 9 + i, fill: P.paper }); } },
  clips: () => { for (let i = 0; i < 3; i++) { const x = -18 + i * 18; ink([[x, -2], [x + 4, -12], [x + 12, -12], [x + 14, -4], [x + 7, -4], [x + 6, -9]], 1.2, 8230 + i, 0.2); } },
  bands: () => { ball(0, -6, 4, 8240, PAT.f, 1.2); for (let i = 0; i < 4; i++) { X.beginPath(); X.ellipse(2, 12 + i * 8, 18 - i * 2, 7, 0, 0, 6.2832); X.lineWidth = 1.5; X.strokeStyle = i % 2 ? P.red : P.ink; X.stroke(); } },
  cabinet: (it, u, lt, i) => { shape(R(-38, -178, 76, 178), { lw: 2.2, id: 8250 + i, h: [Math.PI / 2, 3.4, 0.5], sh: R(14, -178, 24, 178), sh2: [Math.PI / 2, 2, 0.8] }); for (let k = 0; k < 4; k++) { shape(R(-32, -172 + k * 43, 64, 38), { lw: 1.4, id: 8260 + k + i * 5, fill: P.paper }); shape(R(-12, -164 + k * 43, 24, 9), { lw: 1, id: 8270 + k + i * 5, fill: P.paper }); ink([[-8, -146 + k * 43], [8, -146 + k * 43]], 2.2, 8280 + k + i * 5, 0.1); } },
  stain: (it) => { const sc = it.big ? 3.2 : 1; for (let k = 0; k < 3; k++) { X.beginPath(); X.ellipse(0, 0, (18 - k * 2.5) * sc, (5 - k * 0.5) * sc, 0, 0, 6.2832); X.lineWidth = 1.2 + (k === 0 ? 1 : 0); X.strokeStyle = P.ink; X.stroke(); } X.fillStyle = P.ink; for (let i = 0; i < 14; i++) X.fillRect((hash(8290, i) - 0.5) * 30 * sc, (hash(8291, i) - 0.5) * 6 * sc, 1.4, 1.4); },
  ink: () => { ball(0, -12, 13, 8300, PAT.m, 1.8); shape(R(-6, -34, 12, 14), { lw: 1.4, id: 8301, fill: P.ink }); ink([[8, -30], [26, -56]], 2, 8302, 0.1); },
  web: (it) => { const f = it.f || 1, sc = it.s || 1; X.save(); X.scale(f * sc, sc); const R_ = 150; for (let i = 0; i < 6; i++) { const a = 0.06 + i * 0.28; ink([[0, 0], [Math.cos(a) * R_, Math.sin(a) * R_]], 0.8, 8310 + i, 0.2); } for (let k = 1; k < 6; k++) { const pts = []; for (let i = 0; i < 6; i++) { const a = 0.06 + i * 0.28, r_ = k * R_ / 6.2 * (1 - 0.1 * Math.sin(i * 2 + k)); pts.push([Math.cos(a) * r_, Math.sin(a) * r_ + (i > 0 && i < 5 ? 5 : 0)]); } ink(pts, 0.7, 8330 + k, 0.4); } ball(Math.cos(0.9) * 60, Math.sin(0.9) * 60 + 6, 2.4, 8350, PAT.f, 1); X.restore(); },
  spoon: () => { X.beginPath(); X.ellipse(0, -3, 26, 6, 0, 0, 6.2832); X.fillStyle = P.paper; X.fill(); X.lineWidth = 1.6; X.strokeStyle = P.ink; X.stroke(); shape([[-12, -6], [12, -6], [9, -22], [-9, -22]], { lw: 1.6, id: 8360, h: [0.4, 2.4, 0.6] }); X.beginPath(); X.ellipse(0, -22, 9, 2.4, 0, 0, 6.2832); X.fillStyle = P.ink; X.fill(); ink([[14, -10], [40, -14]], 2, 8361, 0.1); X.beginPath(); X.ellipse(44, -14, 6, 3, 0.2, 0, 6.2832); X.fillStyle = P.paper; X.fill(); X.lineWidth = 1.4; X.stroke(); },
  notes: () => { for (let i = 0; i < 7; i++) { const x = (i % 4) * 36 - 54 + (hash(8370, i) - 0.5) * 8, y = Math.floor(i / 4) * 44 + (hash(8371, i) - 0.5) * 10; X.save(); X.translate(x, y); X.rotate((hash(8372, i) - 0.5) * 0.25); shape(R(-14, -18, 28, 36), { lw: 1.2, id: 8380 + i, fill: P.paper }); for (let k = 0; k < 4; k++) ink([[-9, -12 + k * 7], [9 - hash(8390, i + k) * 6, -12 + k * 7]], 0.7, 8400 + i * 5 + k, 0.1); ball(0, -17, 2, 8450 + i, PAT.f, 0.8); X.restore(); } },
  clock: (it, u, lt) => { ball(0, 0, 30, 8460, PAT.f, 2.4, P.paper); for (let i = 0; i < 12; i++) { const a = i / 12 * 6.2832; ink([[Math.cos(a) * 24, Math.sin(a) * 24], [Math.cos(a) * 28, Math.sin(a) * 28]], 1.2, 8470 + i, 0.1); } ink([[0, 0], [0, -17]], 2, 8490, 0.1); ink([[0, 0], [14 * Math.cos(lt * 0.4 - 1.57), 14 * Math.sin(lt * 0.4 - 1.57)]], 1.6, 8491, 0.1); },
  plant: () => { shape([[-18, 0], [18, 0], [14, -26], [-14, -26]], { lw: 1.8, id: 8500, h: [0.5, 2.6, 0.6] }); for (let i = 0; i < 6; i++) { const a = -2.3 + i * 0.32; ink([[0, -26], [Math.cos(a) * 30, -26 + Math.sin(a) * 52], [Math.cos(a) * 42, -26 + Math.sin(a) * 50 + 14]], 1.4, 8510 + i, 0.5); } },
  umbrella: () => { ink([[0, 0], [-8, -104]], 2.6, 8520, 0.2); shape([[-8, -108], [-46, -70], [-30, -76], [-18, -66], [-8, -78], [4, -66], [14, -76], [28, -70]], { lw: 1.6, id: 8521, h: [0.9, 3, 0.6] }); ink([[-2, 0], [-6, 8], [-14, 8]], 2, 8522, 0.1); },
};
/* the office stands on the stage: items grow in at their cue, and in the clearing they are thrown out one by one */
function officeDraw(sh, lt, o = {}) {
  const items = cues(sh, 'item');
  items.forEach((c) => {
    const it = OFFICE[c.i], u = seg(lt, c.at, c.at + 0.42, E.out); if (u <= 0) return;
    let dx = 0, dy = 0, ang = 0, sc = 0.82 + 0.18 * u, al = u;
    if (o.hurl) { const hs = o.hurl.at + (o.hurl.to - o.hurl.at) * ((c.i * 7) % OFFICE.length) / OFFICE.length, p = clamp((lt - hs) / 2.6); if (p > 0) { const dir = Math.atan2(it.y - 520, it.x - 640) + (hash(8600, c.i) - 0.5) * 0.9 - 0.45; const dist = Math.pow(p, 1.6) * 1500; dx = Math.cos(dir) * dist; dy = Math.sin(dir) * dist - p * 260; ang = p * (hash(8601, c.i) - 0.5) * 12; sc *= 1 - 0.75 * p; al = 1; } }
    X.save(); X.translate(it.x + dx, it.y + dy); X.rotate(ang); X.scale(sc, sc); X.globalAlpha = al; ITEM[it.k](it, u, lt, c.i); X.restore();
  });
}

/* ================= shared staging ================= */
const SP = { x: 300, y: 672, s: 1.28 };                        // the spokesperson, front left
const TIGHT_S = ONs(SP.x + 18, SP.y - 104 * SP.s + 4, 3.3, 450);
const WIDE = ONs(640, 470, 1.0, 470);
const PIPSPOS = [[560, 648, 0.8], [700, 668, 0.92], [830, 646, 0.8], [960, 670, 0.96], [1090, 648, 0.82], [130, 652, 0.84], [440, 674, 0.9]];
function pipRoom(lt, o = {}) {
  wallRoom(560, 3.0);
  if (o.bare) return;
  gear(150, 400, 100, 14, lt * 0.3, 8700); gear(300, 330, 64, 9, -lt * 0.3 * 14 / 9, 8720); gear(1130, 410, 112, 16, -lt * 0.25, 8740); gear(1000, 330, 60, 9, lt * 0.25 * 16 / 9, 8760);
  spring(560, 300, 560, 540, 14, 8, 8780); spring(720, 300, 720, 540, 14, 8, 8790);
}
function crowd(sh, lt, o = {}) {
  const sm = typeof o.mood === 'function' ? o.mood : () => o.mood || 'smug', Sx = o.sx ?? SP.x;
  (o.pos || PIPSPOS).forEach(([x, y, s], i) => {
    if (o.skip && o.skip.includes(i)) return;
    const wk = o.walk ? o.walk(i) : 0, xx = o.x ? o.x(i, x) : x, face = o.face ?? (x > Sx ? -1 : 1);
    pip(xx, y, s, 9000 + i * 40, { f: o.fl ? o.fl(i) : face, mood: sm(i), bob: Math.abs(Math.sin(lt * 2.2 + i * 1.7)) * 2.5 * (o.bounce ?? 1), look: o.look ?? -1, lookY: o.lookY ?? 0, up: o.up ? o.up(i) : 0, mouth: talking(sh, 'P', lt) ? sayAt(sh, 'P', lt) : 0, walk: wk, ph: lt * 14 + i, head: o.head && o.head(i), tilt: o.tilt ? o.tilt(i) : 0 });
  });
  if (o.noS) return;
  pip(Sx, SP.y, SP.s, 9500, { f: o.sf ?? 1, mood: o.sMood || 'smug', mouth: sayAt(sh, 'S', lt), look: o.sLook ?? 1, lookY: o.sLookY ?? 0, bob: Math.abs(Math.sin(lt * 1.8)) * 2, up: o.sUp || 0, head: o.sHead, tilt: o.sTilt || 0 });
}
const tightSAt = (x) => ONs(x + 18, SP.y - 104 * SP.s + 4, 3.3, 450);
const shakeCam = (c, a, lt) => ({ z: c.z, x: c.x + Math.sin(lt * 61) * a, y: c.y + Math.cos(lt * 53) * a });
function envelope(x, y, s, id, ang = 0) { X.save(); X.translate(x, y); X.rotate(ang); X.scale(s, s); shape(R(-12, -8, 24, 16), { lw: 1.4, id, fill: P.paper }); ink([[-12, -8], [0, 2], [12, -8]], 1, id + 1, 0.1); X.restore(); }

/* ================= title and end ================= */
function sealMark(x, y, r, id, a = 1) { X.save(); X.globalAlpha = a; X.beginPath(); X.arc(x, y, r, 0, 6.2832); X.lineWidth = 4; X.strokeStyle = P.red; X.stroke(); X.beginPath(); X.arc(x, y, r * 0.78, 0, 6.2832); X.lineWidth = 1.6; X.stroke(); star(x, y, r * 0.5, id, P.red, 10); X.restore(); }
function stampFig(x, y, lift, id) { X.save(); X.translate(x, y - lift); shape(R(-34, -20, 68, 20), { lw: 2.2, id, h: [0.6, 2.6, 0.6] }); shape(R(-10, -50, 20, 30), { lw: 1.8, id: id + 1, h: [Math.PI / 2, 2.6, 0.6] }); ball(0, -62, 15, id + 2, PAT.m, 2.2); X.restore(); }
SHOTS.title = (lt, sd) => {
  X.fillStyle = P.paper; X.fillRect(0, 0, W, H);
  txt('THE FIFTH SALLY (A)', CX, 232, 70, {}); txt('or, Trurl’s Prescription', CX, 312, 38, { italic: true }); txt('after Stanisław Lem, The Cyberiad', CX, 380, 22, { italic: true });
  // a sheet with a blot on it; each stamp comes down and the blot gets smaller until it is a damp mark
  const sx = 640, sy = 570; shape([[sx - 190, sy - 70], [sx + 190, sy - 78], [sx + 196, sy + 78], [sx - 184, sy + 84]], { lw: 2, id: 9900, fill: '#f4eedb' });
  const typed = seg(lt, 0.5, 1.7, E.lin); for (let i = 0; i < 5; i++) ink([[sx - 150, sy - 50 + i * 12], [sx - 150 + (130 + hash(9910, i) * 100) * clamp(typed * 5 - i), sy - 50 + i * 12]], 1.2, 9911 + i, 0.2);
  const hits = [2.5, 3.2, 3.9], tx = [sx + 70, sx - 60, sx + 120], ty = [sy + 20, sy + 30, sy + 24];
  const k = hits.filter((h) => lt >= h).length, blot = [1, 0.6, 0.3, 0.06][k], br = 52 * blot + 3;
  wet(blobPts(sx + 64, sy + 26, br * 1.2, br * 0.8, 9930, 22, 0.22), 9930, { lw: 1.8, dens: 0.02, h: [0.6, 3, 0.5] });
  hits.forEach((h, i) => { const a = seg(lt, h, h + 0.05); if (a > 0) sealMark(tx[i] + (i - 1) * 6, ty[i] - 6, 34, 9940 + i * 20, a); });
  // the stamp: waits at the right, hovers over the next target, comes down on the hit, lifts away
  let n = hits.findIndex((h) => lt < h + 0.3); if (n < 0) n = 2;
  const prev = n > 0 ? hits[n - 1] : -9, h = hits[n];
  const lift = lt < h - 0.35 ? 70 : lt < h ? 70 * (1 - E.in(seg(lt, h - 0.35, h))) : 70 * E.out(seg(lt, h, h + 0.28));
  const px0 = n > 0 ? tx[n - 1] : sx + 330, px = n === 0 ? rr(sx + 330, tx[0], E.io(seg(lt, 1.7, 2.3))) : rr(px0, tx[n], E.io(seg(lt, prev + 0.3, prev + 0.9)));
  const home = lt > hits[2] + 0.28 ? seg(lt, hits[2] + 0.28, hits[2] + 1.0) : 0;
  stampFig(px + home * 300, (lt < 1.7 ? sy - 40 : ty[n] - 6) - (lt < 1.7 ? 0 : lift), 0, 9990);
};
SHOTS.end = (lt, sd) => {
  X.fillStyle = P.paper; X.fillRect(0, 0, W, H); X.globalAlpha = seg(lt, 0.4, 1.6);
  txt('THE FIFTH SALLY (A), OR TRURL’S PRESCRIPTION', CX, 190, 38, {}); txt('after Stanisław Lem, The Cyberiad', CX, 246, 24, { italic: true }); X.globalAlpha = 1;
  vend(640, 650, 1.4, 9700, { hum: true });
  const dx = 640 - 58 * 0.0, tray = 650 - 58 * 1.4;
  const u = seg(lt, 2.4, 3.2, E.in); if (u > 0 && u < 1) ball(640 + 6, 600 + u * 54, 5, 9790, PAT.f, 1.2);
  X.beginPath(); X.ellipse(646, 656, 40, 6, 0, 0, 6.2832); X.fillStyle = P.paper; X.fill(); X.lineWidth = 1.6; X.strokeStyle = P.ink; X.stroke();
  X.fillStyle = P.ink; for (let i = 0; i < 24; i++) X.fillRect(646 + (hash(9791, i) - 0.5) * 70, 656 + (hash(9792, i) - 0.5) * 8, 1.4, 1.4);
  if (lt > 3.2) { const r = (lt - 3.2) * 18; X.globalAlpha = Math.max(0, 1 - (lt - 3.2) / 1.2); X.beginPath(); X.ellipse(646, 656, 12 + r, 2 + r * 0.16, 0, 0, 6.2832); X.lineWidth = 1; X.stroke(); X.globalAlpha = 1; }
};

/* ================= 1. the machine, and the comet ================= */
function steelMachine(lt, o = {}) {
  const rot_ = lt * 0.5;
  shape([[330, 640], [390, 330], [880, 330], [940, 640]], { lw: 2.6, id: 9100, h: [0.2, 4.2, 0.5], sh: [[700, 640], [940, 640], [880, 330], [740, 330]], sh2: [Math.PI / 2, 2.6, 0.8] });
  shape([[430, 330], [470, 220], [800, 220], [840, 330]], { lw: 2.2, id: 9101, h: [-0.3, 4, 0.5] });
  shape(R(560, 140, 40, 84), { lw: 2, id: 9102, h: [Math.PI / 2, 3, 0.6] }); for (let i = 0; i < 3; i++) { const u = ((lt * 0.4 + i / 3) % 1); ball(580 + Math.sin(u * 5) * 8, 130 - u * 60, 8 + u * 10, 9103 + i, PAT.f, 1.2); }
  gear(600, 470, 118, 14, rot_, 9110); gear(784, 424, 76, 10, -rot_ * 14 / 10, 9130); gear(480, 590, 54, 8, -rot_ * 14 / 8, 9150); gear(740, 580, 46, 7, rot_ * 14 / 7 * 0.9 + 0.3, 9170);
  for (const [x, w] of [[420, 3], [880, 3]]) spring(x, 340, x, 620, 12, 12, 9190 + x);
  for (let i = 0; i < 3; i++) { const px = 970 + i * 34, pump = Math.abs(Math.sin(lt * 1.6 + i)); shape(R(px - 10, 500, 20, 140), { lw: 1.6, id: 9200 + i, fill: P.paper, h: [Math.PI / 2, 3, 0.6] }); shape(R(px - 5, 500 - pump * 60, 10, 62), { lw: 1.4, id: 9210 + i, fill: P.ink }); }
  for (const [x, y, w] of [[396, 470, 150], [820, 520, 140]]) { shape(R(x, y, w, 8), { lw: 1.6, id: 9220 + x, h: [0.1, 2.4, 0.6] }); for (let i = 0; i <= 6; i++) ink([[x + i * w / 6, y], [x + i * w / 6, y - 22]], 1.2, 9230 + x + i, 0.2); ink([[x, y - 22], [x + w, y - 22]], 1.2, 9240 + x, 0.2); }
  for (let i = 0; i < 4; i++) shape(R(500 + i * 84, 360, 42, 34), { lw: 1.4, id: 9250 + i, fill: P.paper, h: [0.7, 3, 0.5] });
}
SHOTS.machine = (lt, sd, sh) => {
  const L = sh.lines, cm = cue(sh, 'comet'), mo = cue(sh, 'moon'), fi = cue(sh, 'fields'), sw = cue(sh, 'switch'), ash = cue(sh, 'ash'), ca = cue(sh, 'calm');
  const tu = tightU(sh, lt), mid = seg(lt, L[4].t0 - 0.5, L[4].t0 + 0.3) * (1 - seg(lt, L[4].t1 + 0.1, L[4].t1 + 0.7));
  let c = camFor(lt, [[0, ONs(640, 380, 1.0, 360)], [10, ONs(620, 390, 1.08, 360)], [30, ONs(560, 400, 1.0, 360)]], 6);
  c = camMix(c, ONs(420, 520, 1.55, 470), mid); c = camMix(c, TIGHT_S, tu);
  if (lt > sw.at && lt < sw.at + 0.5) c = shakeCam(c, 8 * (1 - (lt - sw.at) / 0.5), lt);
  const cu = seg(lt, cm.at, sw.at, E.lin), burn = seg(lt, mo.at, mo.to);
  cam(c, () => {
    X.fillStyle = P.paper; X.fillRect(-500, -400, 2300, 1400);
    X.save(); X.globalAlpha = 0.55; skyLines(-300, 620, 760); X.restore();
    for (let i = 0; i < 30; i++) { const x = -300 + hash(9300, i) * 1900, y = -200 + hash(9301, i) * 560; X.fillStyle = P.paper; X.fillRect(x - 2, y - 2, 6, 6); X.fillStyle = P.ink; X.fillRect(x, y, 2, 2); }
    sunBig(1090, 130, 54, 9310); star(190, 120, 26, 9320, P.ink, 8); ball(190, 120, 7, 9321, PAT.f, 1);
    moonShape(400, 130, 50, 9330, burn);
    if (fi && lt >= fi.at) { const fu = seg(lt, fi.at, sw.at, E.lin); for (let k = 0; k < 3; k++) { const pts = []; for (let i = 0; i <= 30; i++) { const a = i / 30 * 6.2832 * (0.7 + 0.5 * fu) + k; pts.push([400 + Math.cos(a) * (66 + k * 9), 130 + Math.sin(a) * (58 + k * 8) * 1.0]); } ink(pts.slice(0, Math.max(2, Math.floor(pts.length * clamp(fu * 3 - k * 0.6)))), 2.4, 9340 + k, 0.4, k % 2 ? P.blue : P.amber); } if (fu > 0.5) ball(400, 70, 6, 9350, PAT.m, 1.5); }
    if (lt >= cm.at && lt < sw.at) { const s_ = rr(0.5, 2.5, Math.pow(cu, 1.3)), x_ = rr(1600, 700, E.out(cu)), y_ = rr(-80, 150, E.out(cu)); comet(x_, y_, s_, 9400, { fire: cu > 0.6, t: lt }); }
    ground9(lt);
    steelMachine(lt);
    // the little ones
    const happy = lt > sw.at + 0.6, worried = lt > cm.at + 2 && !happy;
    const small = [[470, 640, 0.52], [560, 640, 0.5], [640, 640, 0.54], [760, 640, 0.5], [850, 640, 0.52], [600, 522, 0.4], [700, 520, 0.42], [450, 470, 0.4], [880, 520, 0.4], [1000, 640, 0.56], [160, 645, 0.58], [650, 468, 0.36]];
    small.forEach(([x, y, s], i) => pip(x, y, s, 9500 + i * 40, { f: i % 2 ? 1 : -1, mood: happy ? 'happy' : worried ? 'worry' : 'smug', bob: Math.abs(Math.sin(lt * 2.2 + i)) * 2.5, up: happy ? 0.8 + 0.2 * Math.sin(lt * 9 + i) : 0, walk: !happy && !worried && i % 3 === 0 ? 1 : 0, ph: lt * 6 + i, look: -1, lookY: worried ? -1 : 0 }));
    pip(SP.x, SP.y, SP.s, 9490, { f: 1, mood: happy ? 'happy' : (worried && lt > L[5].t0) ? 'worry' : 'smug', mouth: sayAt(sh, 'S', lt), look: 1, bob: Math.abs(Math.sin(lt * 1.8)) * 2, up: happy ? 0.7 : 0 });
    if (lt >= ash.at) { ashFall(300, 40, 900, 520, (lt - ash.at) / 6, 9600, 140); }
  });
  flashOverlay(lt - sw.at, 9700);
  if (lt > ca.at) { /* quiet */ }
};
function ground9(lt) { X.fillStyle = P.paper; X.fillRect(-400, 640, 2200, 400); for (let k = 0; k < 24; k++) { const y = 640 + k * k * 0.22; ink([[-300, y], [1600, y]], 0.7 + k * 0.03, 9800 + k, 0.5); } ink([[-300, 640], [1600, 640]], 2, 9799, 0.6); }

/* ================= 2. something arrives ================= */
SHOTS.arrival = (lt, sd, sh) => {
  const L = sh.lines, land = cue(sh, 'land').at, tu = tightU(sh, lt);
  const fall = seg(lt, land - 0.9, land, E.in), dy = -(1 - fall) * 420, vis = lt >= land - 0.9;
  const bounce = lt >= land ? -Math.exp(-(lt - land) * 5) * Math.abs(Math.sin((lt - land) * 12)) * 12 : 0;
  const look = cue(sh, 'look').at, sg = cue(sh, 'scare_go'), bk = cue(sh, 'bark').at, hs = cue(sh, 'hiss'), sc2 = cue(sh, 'second').at, sb = cue(sh, 'scare_back');
  let c = camFor(lt, [[0, WIDE], [land - 1.4, ONs(600, 440, 1.0)], [land - 0.2, ONs(640, 400, 1.2, 460)], [land + 2.2, WIDE]], 1.0);
  c = camMix(c, TIGHT_S, tu); if (lt >= land && lt < land + 0.8) c = shakeCam(c, 10 * Math.exp(-(lt - land) * 5), lt);
  band(() => {
    bandBG(lt); const sx = (lt >= land && lt < land + 0.5) ? Math.sin(lt * 80) * 3 * (1 - (lt - land) / 0.5) : 0;
    if (vis) drawThing(1, lt, { dy: dy + bounce, dx: sx });
    // the scarechrome in the distance
    if (lt >= sg.at) {
      let x_ = 70, ph = lt * 9, w_ = 1, m_ = 0, face = 1;
      if (lt < bk) x_ = rr(60, 262, seg(lt, sg.at, sg.to, E.io)); else x_ = 262;
      if (lt >= sb.at) { x_ = rr(262, 40, seg(lt, sb.at, sb.to, E.io)); face = 1; w_ = 1; } else if (lt >= bk) w_ = 0;
      const talk = lt >= bk && lt < bk + 1.8 ? sayAt(sh, 'B', lt) : 0, hiss = lt >= hs.at && lt < hs.to ? 1 : 0;
      const droop = lt >= sb.at ? 0 : 0;
      scarechrome(x_, ridgeY(x_) + 2, 0.95, 9900, { walk: w_, ph, mouth: Math.max(talk, hiss * (0.5 + 0.5 * Math.sin(lt * 25))), arms: hiss, f: lt >= sb.at ? -1 : 1 });
      if (hiss) { for (let i = 0; i < 9; i++) { const a = -0.9 + i * 0.22, u = ((lt * 3 + i * 0.23) % 1); ink([[x_ + 22 + Math.cos(a) * 20, ridgeY(x_) - 56 + Math.sin(a) * 20], [x_ + 22 + Math.cos(a) * (30 + u * 70), ridgeY(x_) - 56 + Math.sin(a) * (30 + u * 70)]], 1.6, 9910 + i, 0.5); } if ((lt * 4 | 0) % 2) ball(x_ + 70 + ((lt * 7) % 1) * 60, ridgeY(x_) - 40, 3, 9930, PAT.f, 1); }
      if (lt >= sc2 && lt < sc2 + 1.1) for (let k = 0; k < 4; k++) { const u = clamp((lt - sc2) / 1.1 - k * 0.15); if (u > 0 && u < 1) { const pts = []; for (let i = 0; i <= 8; i++) { const a = -0.8 + i / 8 * 1.6; pts.push([x_ + 24 + Math.cos(a) * (20 + u * 80), ridgeY(x_) - 56 + Math.sin(a) * (20 + u * 80)]); } ink(pts, 2, 9940 + k, 0.4, P.blue); } }
    }
    if (lt >= land && lt < land + 1.4) for (let i = 0; i < 24; i++) { const u = (lt - land) / 1.4, d = hash(9950, i) - 0.5, px = TX + d * 900 * u * 1.1, py = BAND_Y - 8 - u * 30 * hash(9951, i); X.globalAlpha = 1 - u; ball(px, py, 3 + 8 * u, 9960 + i, PAT.f, 1); X.globalAlpha = 1; }
  });
  bandDivider();
  stage(c, () => {
    pipRoom(lt);
    const w_ = lt >= look; const mood = lt < land ? 'smug' : 'worry';
    crowd(sh, lt, { mood: (i) => (lt < land + 0.2 ? 'smug' : lt < L[1].t0 ? 'worry' : 'flat'), sMood: lt < land + 0.3 ? 'smug' : lt < L[1].t0 ? 'worry' : (lt < L[2].t0 ? 'smug' : 'flat'), look: 1, lookY: lt > land - 0.5 ? -1 : 0, sLook: 1, sLookY: lt > land - 0.5 ? -1 : 0, face: -1, fl: () => -1, sf: 1 });
    vend(1190, 664, 0.95, 9970, { hum: true });
  });
};

/* ================= 3. force ================= */
function engineBlueprint(lt, sh, bd) { // the council's drawing: a machine that holds a machine that holds a machine
  shape(R(470, 300, 340, 190), { lw: 3, id: 10600, fill: DARK });
  const u = seg(lt, bd.at, bd.to, E.lin); X.save(); X.lineCap = 'round';
  const boxes = [[500, 322, 280, 146], [546, 344, 188, 100], [596, 364, 88, 60]];
  boxes.forEach(([x, y, w, h], i) => { const q = clamp(u * 3 - i); if (q <= 0) return; const pts = [[x, y], [x + w, y], [x + w, y + h], [x, y + h], [x, y]]; const tot = 2 * (w + h); let d = tot * q; const out = [pts[0]]; for (let k = 1; k < pts.length && d > 0; k++) { const a = pts[k - 1], b = pts[k], L_ = Math.hypot(b[0] - a[0], b[1] - a[1]), t = Math.min(1, d / L_); out.push([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]); d -= L_; } ink(out, 2, 10610 + i, 0.4, P.paper); });
  if (u > 0.9) { ball(640, 394, 6, 10620, PAT.f, 1.2, P.paper); }
  X.restore();
}
SHOTS.force = (lt, sd, sh) => {
  const L = sh.lines, hy = cue(sh, 'hy_in'), b1 = cue(sh, 'blast1'), cn = cue(sh, 'council'), bd = cue(sh, 'build'), st = cue(sh, 'stars'), mi = cue(sh, 'mega_in'), ch = cue(sh, 'charge'), b2 = cue(sh, 'blast2'), dk = cue(sh, 'dark'), qu = cue(sh, 'quiet'), sc = cue(sh, 'scrap'), tk = cues(sh, 'tick');
  const tu = tightU(sh, lt), push = seg(lt, st.at, st.at + 2.5, E.out);
  let c = WIDE;
  if (lt >= b1.at && lt < b1.at + 1.4) c = shakeCam(c, 9 * Math.exp(-(lt - b1.at) * 3), lt);
  if (lt >= b2.at && lt < b2.at + 3.2) c = shakeCam(c, 18 * Math.exp(-(lt - b2.at) * 1.1), lt);
  c = camMix(c, TIGHT_S, tu);
  band(() => {
    bandBG(lt, push); drawThing(1, lt, {});
    // the hydraulic engine
    if (lt < cn.at + 2.2) {
      const u = seg(lt, hy.at, hy.to, E.io), leave = seg(lt, cn.at, cn.at + 2.0, E.io), x_ = rr(-130, 215, u) - leave * 420;
      const wind = seg(lt, tk[0].at, tk[3].at + 0.15, E.lin); let arm = rr(-1.0, -2.55, wind);
      if (lt >= b1.at - 0.03) arm = rr(-2.55, 0.35, E.in(seg(lt, b1.at - 0.03, b1.at + 0.1))); if (lt >= b1.at + 0.5) arm = rr(0.35, -0.6, E.io(seg(lt, b1.at + 0.5, b1.at + 2.0)));
      hydra(x_, ridgeY(x_) + 2, 0.82, 10000, { arm, pump: lt < b1.at ? Math.abs(Math.sin(lt * 5)) : 0, peekU: lt > b1.at + 1.0 ? 1 : 0.5, smoke: true });
    }
    // the megalomechanism
    if (lt >= mi.at - 0.1 && lt < b2.at + 0.22) {
      const u = seg(lt, mi.at, mi.to, E.io), x_ = rr(-360, 140, u), wd = seg(lt, ch.at, ch.to, E.io); let arm = rr(-1.4, -2.7, wd) + (wd > 0 ? Math.sin(lt * 40) * 0.04 * wd : 0);
      if (lt >= b2.at - 0.04) arm = rr(-2.7, 0.3, E.in(seg(lt, b2.at - 0.04, b2.at + 0.12)));
      mega(x_, ridgeY(x_) + 3, 0.85, 10200, { arm, mouth: sayAt(sh, 'G', lt), shake: wd });
    }
    if (lt >= sc.at) { scrapPile(150, ridgeY(150) + 3, 1.0, 10300, 20); scrapPile(340, ridgeY(340) + 3, 0.6, 10350, 9); scrapPile(1000, ridgeY(1000) + 3, 0.4, 10380, 5); }
  });
  bandDivider();
  stage(c, () => {
    pipRoom(lt);
    const after1 = lt > b1.at + 0.5, after2 = lt > b2.at + 1.0, council = lt >= cn.at;
    if (council) { table(640, 548, 360, 10500, 116); engineBlueprint(lt, sh, bd); }
    const pm = (i) => (after2 ? 'slump' : after1 ? (council ? 'flat' : 'worry') : 'smug');
    crowd(sh, lt, { mood: pm, sMood: after2 ? 'slump' : after1 ? (council ? 'flat' : 'worry') : 'smug', look: council ? -1 : 1, lookY: council ? 0 : -1, sLook: 1, sLookY: council ? 0 : -1, x: council ? (i, x) => 640 + (x - 640) * 0.5 : null, face: -1, fl: council ? (i) => (PIPSPOS[i][0] > 640 ? -1 : 1) : () => -1, bounce: after2 ? 0 : 1 });
    vend(1210, 664, 0.95, 10510, { hum: !after2 });
  });
  // blasts and mushrooms are drawn over everything: they rise out of the band and cover the thing
  mushroom(430, BAND_Y - 6, 62, seg(lt, b1.at + 0.1, b1.at + 2.6), 10100, seg(lt, b1.at + 2.8, b1.at + 4.3));
  mushroom(TX, BAND_Y - 6, 300, seg(lt, b2.at + 0.1, b2.at + 2.5), 10400, seg(lt, b2.at + 2.4, b2.at + 4.0));
  flashOverlay(lt - b1.at, 10700); flashOverlay(lt - b2.at, 10710);
  const da = seg(lt, b2.at + 0.6, b2.at + 1.4) * (1 - seg(lt, dk.to - 2.2, dk.to));
  if (da > 0) { X.globalAlpha = da * 0.97; X.fillStyle = '#14100c'; X.fillRect(0, 0, W, H); X.globalAlpha = 1; if (da > 0.5) { X.fillStyle = P.paper; for (let i = 0; i < 26; i++) { const x = hash(10720, i + (BOIL >> 3)) * W, y = hash(10721, i + (BOIL >> 3)) * H; X.globalAlpha = da * 0.5 * hash(10722, i); X.fillRect(x, y, 2, 2); } X.globalAlpha = 1; } }
};

/* ================= 4. the vine, and despair ================= */
const TOOLS = [
  (x, y, s, id) => { X.save(); X.translate(x, y); X.scale(s, s); shape(R(-26, -36, 52, 36), { lw: 1.6, id, fill: P.paper }); for (let i = 1; i < 5; i++) ink([[-26 + i * 10.4, -36], [-26 + i * 10.4, 0]], 0.8, id + i, 0.1); for (let i = 1; i < 4; i++) ink([[-26, -36 + i * 9], [26, -36 + i * 9]], 0.8, id + 6 + i, 0.1); X.restore(); },
  (x, y, s, id) => { X.save(); X.translate(x, y); X.scale(s, s); shape(R(-14, -30, 28, 30), { lw: 1.6, id, h: [0.6, 2.4, 0.6] }); shape(R(-8, -38, 16, 8), { lw: 1.2, id: id + 1, fill: P.ink }); ink([[-14, -28], [-18, -14], [-17, -6]], 2.4, id + 2, 0.2); ball(-17, -4, 3, id + 3, PAT.f, 1); X.restore(); },
  (x, y, s, id) => { X.save(); X.translate(x, y); X.scale(s, s); X.beginPath(); X.ellipse(0, -22, 24, 18, 0, 0, 6.2832); X.lineWidth = 2.4; X.strokeStyle = P.ink; X.stroke(); ink([[18, -10], [34, 0], [48, -4]], 2, id, 0.2); X.restore(); },
  (x, y, s, id) => { X.save(); X.translate(x, y); X.scale(s, s); for (let k = 0; k < 3; k++) { ink([[-18 + k * 18, 0], [-18 + k * 18, -28]], 2, id + k, 0.1); for (let i = 0; i < 4; i++) ink([[-22 + k * 18, -4 - i * 6], [-14 + k * 18, -7 - i * 6]], 1, id + 4 + k * 4 + i, 0.1); } X.restore(); },
  (x, y, s, id) => { X.save(); X.translate(x, y); X.scale(s, s); shape([[-26, 0], [26, 0], [20, -8], [-20, -8]], { lw: 1.6, id, fill: P.ink }); shape([[-22, -8], [-6, -26], [0, -8]], { lw: 1.4, id: id + 1, fill: P.paper }); shape([[22, -8], [6, -26], [0, -8]], { lw: 1.4, id: id + 2, fill: P.paper }); X.restore(); },
  (x, y, s, id) => { X.save(); X.translate(x, y); X.scale(s, s); for (const [bx, by] of [[-30, 0], [2, 0], [-14, -18]]) shape(R(bx, by - 18, 32, 18), { lw: 1.6, id: id + bx + by, h: [0.1, 2.4, 0.6] }); X.restore(); },
];
SHOTS.ivy = (lt, sd, sh) => {
  const L = sh.lines, iv = cue(sh, 'ivy'), wr = cue(sh, 'wrap'), wl = cue(sh, 'wilt'), tl = cue(sh, 'tools'), sl = cue(sh, 'slump');
  const tu = tightU(sh, lt);
  const c = camMix(WIDE, TIGHT_S, tu);
  band(() => {
    bandBG(lt); const wU = seg(lt, wl.at, wl.to), u = seg(lt, iv.at, iv.to, E.lin) * (1 - 0.94 * E.in(wU));
    drawThing(1, lt, {});
    for (let k = 0; k < 3; k++) ivyStrand(k, u, wU, lt, 10800 + k * 100);
    if (lt >= wr.at && wU < 1) { X.save(); X.globalAlpha = (1 - wU) * seg(lt, wr.at, wr.at + 0.5); for (const [h, rx] of [[50, 285], [110, 240], [166, 160]]) { const pts = []; for (let i = 0; i <= 20; i++) { const a = i / 20 * 3.14159; pts.push([TX + Math.cos(a) * rx * 0.97, TBY - h + Math.sin(a) * 13]); } ink(pts, 3, 10900 + h, 0.6, '#6a5a2c'); for (let i = 1; i < 20; i += 3) { const p = pts[i]; shape([[p[0], p[1]], [p[0] + 6, p[1] - 7], [p[0] + 14, p[1] - 2], [p[0] + 6, p[1] + 5]], { lw: 1, id: 10950 + h + i, fill: P.ochre }); } } X.restore(); }
  });
  bandDivider();
  stage(c, () => {
    pipRoom(lt);
    const slump = lt >= sl.at;
    crowd(sh, lt, { mood: () => (slump ? 'slump' : lt > wr.at ? 'worry' : 'smug'), sMood: slump ? 'worry' : lt > wr.at ? 'worry' : 'smug', look: 1, lookY: slump ? 0.8 : -1, sLookY: slump ? 0.8 : -1, face: -1, fl: () => -1, bounce: slump ? 0 : 1, sHead: slump, head: slump ? (i) => i % 2 === 0 : null, walk: !slump && lt >= tl.at && lt < tl.to ? () => 1 : null, tilt: slump ? () => 0.12 : null, sTilt: slump ? 0.1 : 0 });
    const items = Array.from({ length: 14 }, (_, i) => i);
    items.forEach((i) => { const t0 = tl.at + (tl.to - tl.at) * Math.pow(i / 13, 1.3), u = seg(lt, t0, t0 + 0.35, E.out); if (u <= 0) return; const x = 90 + hash(11000, i) * 1100, y = 600 + hash(11001, i) * 76; const sc = (0.9 + 0.5 * hash(11002, i)) * (0.7 + 0.3 * u); TOOLS[i % 6](x, y + (1 - u) * -40, sc, 11010 + i * 14); });
    vend(1210, 664, 0.95, 11300, { hum: true });
  });
};

/* ================= 5. Trurl arrives ================= */
function cupArt(x, y, s, id, tilt = 0, fill = 0.7) { X.save(); X.translate(x, y); X.rotate(tilt); X.scale(s, s); shape([[-14, -22], [14, -22], [11, 0], [-11, 0]], { lw: 1.6, id, h: [0.4, 2.4, 0.6] }); if (fill > 0) { X.fillStyle = P.ink; X.fillRect(-12, -22, 24, 3); } ink([[14, -18], [22, -16], [22, -8], [12, -6]], 1.6, id + 1, 0.1); X.restore(); }
function listIcon(n, x, y, s) { X.save(); X.translate(x, y); X.scale(s, s); if (n === 0) ITEM.paper({ big: 0 }, 1, 0, 3); else if (n === 1) ITEM.stamp({}, 1, 0, 0); else if (n === 2) { X.scale(0.2, 0.2); X.translate(0, 120); ITEM.window({}); } else if (n === 3) ITEM.spoon(); else if (n === 4) { X.beginPath(); X.ellipse(0, -4, 26, 7, 0, 0, 6.2832); X.fillStyle = P.paper; X.fill(); X.lineWidth = 1.8; X.strokeStyle = P.ink; X.stroke(); X.beginPath(); X.ellipse(0, -5, 14, 3.4, 0, 0, 6.2832); X.stroke(); } else if (n === 5) cupArt(0, 0, 1.3, 11400); else { shape([[-14, 0], [14, 0], [12, -12], [-12, -14]], { lw: 1.4, id: 11410, fill: P.ink }); shape([[8, -6], [24, -3], [8, 0]], { lw: 1, id: 11411, fill: P.ink }); } X.restore(); }
const RIDE = { x: 1080, y: 690, s: 0.7 };
function trurlRiding(x, y, s, id, rot_ = 0, fire = 0, f = 1) { // x,y: the bottom of the wheel, as for oddRide
  const k = 0.42 * s / 0.7;
  X.save(); X.translate(x, y); X.scale(f, 1); X.translate(-x, -y);
  constructor_(x - 4 * s, y - 56 * s * 1.0 + 128 * k, k, 12000 + id, { robe: false, seated: true, f: 1, ra: [0.6, 0.1], la: [0.7, 0.2], look: 1 });
  oddRide(x, y, s, 12100 + id, { rot: rot_, fire });
  X.restore();
}
SHOTS.trurl = (lt, sd, sh) => {
  const L = sh.lines, rd = cue(sh, 'ride'), ru = cue(sh, 'run'), ls = cues(sh, 'list'), tu = tightU(sh, lt);
  const land = rd.to - 0.8, TRX = 860;
  let c = camFor(lt, [[0, WIDE], [L[2].t0 - 0.4, ONs(640, 470, 1.15, 470)], [L[8].t0 - 0.3, ONs(780, 470, 1.15, 470)], [L[8].t1 + 0.2, WIDE]], 0.9);
  c = camMix(c, ONs(TRX + 8, 392, 2.5, 440), tu);
  band(() => { bandBG(lt); drawThing(1, lt, {}); });
  bandDivider();
  const landed = lt >= land;
  stage(c, () => {
    pipRoom(lt);
    const running = lt >= ru.at, rt = lt - ru.at;
    crowd(sh, lt, { mood: () => (lt > L[5].t0 ? 'happy' : 'flat'), sMood: lt > L[5].t0 ? 'happy' : 'flat', look: 1, lookY: lt < land ? -1 : 0, sLookY: lt < land ? -1 : 0, sLook: 1, skip: [4, 6], face: -1, fl: () => -1, x: running ? (i, x) => (i % 2 ? x + rt * rt * 300 : x - rt * rt * 300) : null, walk: running ? () => 1 : null, sUp: lt > L[5].t0 ? 0.3 : 0, sf: running ? 1 : 1 });
    vend(1225, 664, 0.95, 12200, { hum: true });
    if (landed) { oddRide(RIDE.x, RIDE.y, RIDE.s, 12300, {}); trurl(TRX, 664, 0.95, sh, lt, { f: -1, look: -1, closed: false }); }
    // the list: a thought bubble of what he needs
    if (ls[0] && lt >= ls[0].at - 0.2) { const bu = seg(lt, ls[0].at - 0.2, ls[0].at + 0.3, E.out); X.save(); X.translate(1060, 380); X.scale(bu, bu); X.translate(-1060, -380); bubble(1060, 380, 340, 160, 940, 440, 12400); X.restore(); const pos = [[960, 366], [1030, 366], [1100, 366], [1170, 366], [990, 416], [1060, 416], [1130, 416]]; ls.forEach((q) => { const pu = seg(lt, q.at, q.at + 0.35, E.out); if (pu > 0) listIcon(q.n, pos[q.n][0], pos[q.n][1] + 10, 0.9 * pu); }); }
  });
  if (!landed) { // the flight, drawn over the band and the stage
    const u = seg(lt, rd.at, land, E.io), x_ = rr(1560, RIDE.x - 20, u) + Math.sin(lt * 3.2) * 30 * (1 - u), y_ = rr(60, RIDE.y, E.in(u)) + Math.sin(lt * 4.1) * 12 * (1 - u);
    trurlRiding(x_, y_, rr(0.5, 0.7, u), 1, lt * 4, 0.6 + 0.3 * Math.sin(lt * 17), 1);
  }
};


/* ================= 6. the first notice ================= */
function noticeSheet(x, y, w, h, u, id, o = {}) { // a propped sheet; u = how much is written
  X.save(); X.translate(x, y); X.rotate(o.tilt || 0); shape(R(-w / 2, -h, w, h), { lw: 1.8, id, fill: '#f4eedb' });
  const n = o.lines ?? 8; for (let i = 0; i < n; i++) { const q = clamp(u * n - i); if (q > 0) ink([[-w / 2 + 10, -h + 16 + i * (h - 40) / n], [-w / 2 + 10 + (w - 28 - hash(id, i) * 30) * q, -h + 16 + i * (h - 40) / n]], 1.3, id + 1 + i, 0.2); }
  X.restore();
}
function thumbBlot(x, y, s, id) { wet(blobPts(x, y, 24 * s, 16 * s, id, 22, 0.25), id, { lw: 1.6, dens: 0.03, h: [0.6, 2.6, 0.6] }); for (let k = 1; k < 4; k++) { X.beginPath(); X.ellipse(x - 2 * s, y, (20 - k * 4.4) * s, (12 - k * 2.6) * s, 0.2, 0, 6.2832); X.lineWidth = 1; X.strokeStyle = P.paper; X.stroke(); } }
const MAILPH = (() => { const a = [0]; let ph = 0; for (let i = 1; i <= 24 * 70; i++) { const t = i / 24, u = ramp(t); ph += (0.16 + 1.15 * Math.pow(u, 1.4)) * 6.2832 / 24; a.push(ph); } return a; })();
SHOTS.notice = (lt, sd, sh) => {
  const L = sh.lines, di = cue(sh, 'dict'), se = cue(sh, 'seal'), stp = cue(sh, 'stamp'), le = cue(sh, 'ledger'), rg = cue(sh, 'register'), ca = cue(sh, 'call'), mo = cue(sh, 'mail_out'), dl = cue(sh, 'deliver').at, sg = cue(sh, 'sign').at, mb = cue(sh, 'mail_back'), rc = cue(sh, 'receipt'), wr = cue(sh, 'wrong'), rt = cue(sh, 'return').at;
  const tu = tightU(sh, lt), TRX = 300;
  let c = camFor(lt, [[0, WIDE], [di.at - 0.4, ONs(500, 470, 1.12, 470)], [rg.at + 0.8, WIDE], [L[4].t0 - 0.3, ONs(640, 470, 1.1, 470)], [L[8].t1 + 0.3, WIDE]], 1.0);
  c = camMix(c, ONs(450, 462, 2.05, 450), tu);
  const quiver = lt >= sg && lt < sg + 1.0 ? Math.sin(lt * 60) * 2.5 * (1 - (lt - sg)) : 0;
  band(() => {
    bandBG(lt); drawThing(sizeAt(sh, lt), lt, { dx: quiver });
    // the mailman at the foot of the thing: a long way off
    const out = seg(lt, mo.at, mo.to, E.io), back = seg(lt, mb.at, mb.to, E.io);
    if (lt >= mo.at && lt < mb.to) {
      const x_ = lt < dl + 1.6 ? rr(1262, 962, out) : rr(962, 1262, back), face = lt < sg + 0.6 ? 1 : -1, walking = (lt >= mo.at && lt < mo.to) || (lt >= mb.at);
      mailman(x_, ridgeY(x_) + 2, 0.42, 12500, { f: lt < mb.at ? -1 : 1, walk: walking ? 1 : 0, ph: lt * 11, letter: lt < sg + 0.2 });
      void face;
      if (lt >= sg - 0.2 && lt < sg + 1.0) { const e = seg(lt, sg - 0.2, sg + 0.3, E.out) * (1 - seg(lt, sg + 0.6, sg + 1.0)); const a = [905, 214], b = [rr(905, 955, e), rr(214, 214, e)]; ink([a, [(a[0] + b[0]) / 2, 206], b], 6, 12510, 0.6); ball(b[0], b[1], 5 + 2 * e, 12511, PAT.m, 1.4); if (lt > sg) shape(R(b[0] + 6, b[1] - 8, 11, 8), { lw: 1, id: 12512, fill: P.paper }); }
    }
  });
  bandDivider();
  stage(c, () => {
    pipRoom(lt);
    // Trurl at the table
    shape(R(TRX - 70, 650 - 124, 134, 12), { lw: 1.8, id: 12600, h: [0.1, 3, 0.6] }); shape(R(TRX - 76, 650 - 236, 14, 112), { lw: 1.8, id: 12601, h: [Math.PI / 2, 2.6, 0.6] });
    table(560, 548, 330, 12610, 116);
    const writing = lt >= di.at && lt < di.to, kd = writing ? Math.abs(Math.sin(lt * 14)) : 0;
    trurl(TRX, 664, 0.95, sh, lt, { f: 1, seated: true, look: 1, lookY: writing ? 0.7 : 0, ra: writing ? [0.9 + kd * 0.1, 0.35] : undefined, la: writing ? [0.8, 0.3] : undefined, tilt: writing ? 0.08 : 0 });
    const gone = lt >= ca.at + 1.0 && lt < mb.to + 0.1;
    if (!gone && lt < rc.at) noticeSheet(630, 548, 130, 160, seg(lt, di.at, di.to, E.lin), 12620, { tilt: -0.04 });
    if (lt >= se.at) { X.beginPath(); X.arc(612, 548 - 18, 12 * seg(lt, se.at, se.at + 0.3, E.out), 0, 6.2832); X.fillStyle = P.red; X.fill(); }
    if (lt >= stp.at && !gone) { const hop = seg(lt, stp.at, stp.at + 0.12) * (1 - seg(lt, stp.at + 0.12, stp.at + 0.4)); stampFig(660, 548 - 30 - 40 + 40 * (1 - hop) - hop * 0, 40 * (1 - hop), 12630); if (lt > stp.at + 0.12) shape(R(650, 548 - 60, 24, 18), { lw: 1.2, id: 12631, fill: P.paper, col: P.red }); }
    if (lt >= le.at) { const u = seg(lt, le.at, le.at + 0.4, E.out); X.save(); X.translate(500, 548); X.scale(u, u); shape([[-50, 0], [0, -8], [50, 0], [50, -26], [0, -34], [-50, -26]], { lw: 1.6, id: 12640, fill: P.paper }); ink([[0, -8], [0, -34]], 1.4, 12641, 0.1); for (let i = 0; i < 3; i++) { ink([[-42, -6 - i * 6], [-8, -12 - i * 6]], 0.9, 12642 + i, 0.1); ink([[8, -12 - i * 6], [42, -6 - i * 6]], 0.9, 12645 + i, 0.1); } X.restore(); }
    if (lt >= rg.at) { const u = seg(lt, rg.at, rg.at + 0.4, E.out); X.save(); X.translate(430, 548); X.scale(u, u); shape(R(-30, -22, 60, 22), { lw: 1.6, id: 12650, h: [0.2, 2.6, 0.6] }); ink([[-30, -16], [30, -16]], 1, 12651, 0.1); X.restore(); }
    if (lt >= ca.at) { const u = Math.max(0, 1 - (lt - ca.at) / 0.6); X.save(); X.translate(720, 548); shape([[-12, 0], [12, 0], [8, -14], [-8, -14]], { lw: 1.4, id: 12660, h: [0.4, 2.2, 0.6] }); ball(0, -17, 3, 12661, PAT.f, 1); if (u > 0) { ink([[-18, -20], [-24, -26]], 1.4, 12662, 0.2); ink([[18, -20], [24, -26]], 1.4, 12663, 0.2); } X.restore(); }
    // the mailman in the room: takes it, goes, and comes back with the receipt
    let mx = null, mf = -1, mw = 1;
    if (lt >= ca.at + 0.1 && lt < ca.at + 1.6) { mx = rr(1330, 700, E.out(seg(lt, ca.at + 0.1, ca.at + 1.2))); mw = lt < ca.at + 1.2 ? 1 : 0; }
    else if (lt >= ca.at + 1.6 && lt < ca.at + 3.0) { mx = rr(700, 1340, E.in(seg(lt, ca.at + 1.7, ca.at + 3.0))); mf = 1; }
    else if (lt >= mb.to - 1.2) { mx = rr(1330, 700, E.out(seg(lt, mb.to - 1.2, mb.to + 0.1))); mw = lt < mb.to + 0.1 ? 1 : 0; }
    if (mx !== null) mailman(mx, 664, 0.95, 12700, { f: mf, walk: mw, ph: lt * 14, letter: lt >= mb.to - 1.2 || (lt >= ca.at + 1.0 && lt < ca.at + 3.0), mouth: sayAt(sh, 'M', lt) });
    crowd(sh, lt, { pos: [[930, 650, 0.8], [1060, 670, 0.9], [1160, 648, 0.78], [850, 674, 0.84]], sx: 1000, mood: () => (lt > L[8].t0 ? 'worry' : 'flat'), sMood: lt > L[8].t0 ? 'worry' : 'flat', look: -1, lookY: 0, sLook: -1, sf: -1, face: -1, fl: () => -1 });
    // the receipt, and the appeal
    if (lt >= rc.at) { const u = seg(lt, rc.at, rc.at + 0.4, E.out); X.save(); X.translate(470, 548); X.scale(u, u); noticeSheet(0, 0, 100, 128, 0.6, 12800, { lines: 5, tilt: -0.07 }); ink([[-40, -34], [38, -34]], 1.4, 12810, 0.1); thumbBlot(8, -42, 0.9, 12820); X.restore(); }
    if (lt >= rc.at + 0.6 && lt < rt) { X.save(); X.translate(640, 548); noticeSheet(0, 0, 120, 70, 0.4, 12900, { lines: 3, tilt: 0.04 }); const q = seg(lt, wr.at, wr.to, E.lin); if (q > 0) { ink([[-52, -8], [-52 + 104 * q, -60 + 0 * q]], 3, 12910, 0.6, P.red); if (q > 0.5) txt('WRONG FORMS', 0, -34, 14, { italic: true, col: P.red }); } X.restore(); }
    vend(1225, 664, 0.95, 12950, { hum: true });
  });
  if (lt >= rt) { const u = seg(lt, rt, rt + 1.5, E.in), a = [640, 530], b = [TX, 214]; const p = bez(a, [900, 90], b, u); if (u < 1) { envelope(p[0], p[1], 1.2 - u * 0.5, 12960, u * 6); } }
};

/* ================= 7. the office ================= */
const SPAWN = (() => { const a = []; let t = OFF_A + 0.6; while (t < OFF_B + 2) { a.push(t); t += 1 / (0.9 + 9 * Math.pow(ramp(t), 2)); } return a; })();
SHOTS.office = (lt, sd, sh) => {
  const L = sh.lines, tu = tightU(sh, lt), SXo = 1000, size = sizeAt(sh, lt);
  let c = camFor(lt, [[0, WIDE], [OFF_A, ONs(640, 470, 1.0, 470)], [OFF_B, WIDE]], 1.0);
  c = camMix(c, tightSAt(SXo), tu);
  const r = Math.max(0, ramp(lt)), pulseT = SPAWN.some((t) => lt > t + 1.05 && lt < t + 1.2) ? 1 : 0;
  band(() => { bandBG(lt); drawThing(size, lt, { dx: Math.sin(lt * 50) * 1.5 * pulseT * Math.min(1, size * 2) }); });
  bandDivider();
  stage(c, () => {
    pipRoom(lt, { bare: false });
    table(560, 548, 330, 13000, 116);
    officeDraw(sh, lt);
    const typing = lt >= OFF_A, kd = typing ? Math.abs(Math.sin(lt * (10 + 22 * r))) : 0;
    trurl(330, 664, 0.95, sh, lt, { f: 1, seated: true, look: 1, lookY: 0.3, ra: typing ? [0.78 + kd * 0.1, 0.12] : undefined, la: typing ? [0.7 + (1 - kd) * 0.1, 0.1] : undefined, tilt: typing ? 0.05 + 0.03 * Math.sin(lt * 7) : 0 });
    crowd(sh, lt, { pos: [[920, 650, 0.8], [1090, 670, 0.9], [1170, 648, 0.78], [860, 676, 0.84]], sx: SXo, mood: () => (lt > L[2].t0 ? 'happy' : 'worry'), sMood: lt > L[2].t0 - 0.2 ? 'happy' : 'worry', look: -1, lookY: -0.6, sLook: -1, sLookY: -0.5, sf: -1, face: -1, fl: () => -1, bounce: 1, sUp: lt > L[2].t0 + 0.8 && lt < L[2].t1 + 1 ? 0.4 : 0 });
    vend(1225, 664, 0.95, 13100, { hum: true });
    // the mailman runs between the window and the vending machine, faster and faster
    if (lt >= OFF_A) { const ph = MAILPH[Math.min(MAILPH.length - 1, Math.round(lt * 24))], x_ = 190 + 480 * (1 - Math.cos(ph)) / 2 * 1.6, dir = Math.sin(ph) >= 0 ? 1 : -1; mailman(x_, 690, 1.0, 13200, { f: dir, walk: 1, ph: lt * (9 + 18 * r), letter: true }); }
  });
  // the notices fly up to the thing
  SPAWN.forEach((t0, k) => { const u = (lt - t0) / 1.15; if (u < 0 || u > 1) return; const a = [560 + 40 * Math.sin(k), 500], b = [TX + (hash(13300, k) - 0.5) * 240 * Math.max(0.2, size), 210], m = [a[0] + (hash(13301, k) - 0.5) * 700, 80]; const p = bez(a, m, b, E.io(u)); envelope(p[0], p[1], 1.25 - 0.55 * u, 13310 + k, u * 7 + k); });
};

/* ================= 8. the clearing ================= */
SHOTS.clear = (lt, sd, sh) => {
  const L = sh.lines, hu = cue(sh, 'hurl'), lk = cue(sh, 'look'), lp = cue(sh, 'loupe'), po = cue(sh, 'pour'), fl = cue(sh, 'fly'), dr = cue(sh, 'drip');
  const tu = tightU(sh, lt), TRX = 520, size = sizeAt(sh, lt);
  let c = camFor(lt, [[0, WIDE], [hu.at - 0.3, ONs(640, 470, 1.05, 470)], [hu.to + 1.5, WIDE]], 1.0);
  c = camMix(c, ONs(TRX + 60, 420, 2.3, 450), tu);
  band(() => {
    bandBG(lt); drawThing(size, lt, {});
    if (lt >= lp.at) { // a magnifying glass over the spot: the spot, large, and a drop forming under it
      const e = seg(lt, lp.at, lp.at + 0.8, E.out), cx = TX + 20, cy = rr(-50, 150, e), rad = 92;
      X.save(); X.beginPath(); X.arc(cx, cy, rad, 0, 6.2832); X.clip(); X.fillStyle = P.paper; X.fillRect(cx - rad, cy - rad, 2 * rad, 2 * rad);
      X.save(); X.translate(cx, cy + 20); X.scale(6, 6); X.translate(-TX, -(TBY - 3)); X.beginPath(); X.ellipse(TX, TBY - 3, 28, 5.5, 0, 0, 6.2832); X.fillStyle = P.paper; X.fill(); X.lineWidth = 1.6 / 6 * 3; X.strokeStyle = P.ink; X.stroke(); X.fillStyle = P.ink; for (let i = 0; i < 80; i++) { const a_ = hash(13400, i) * 6.2832, r_ = Math.sqrt(hash(13401, i)) * 26; X.fillRect(TX + Math.cos(a_) * r_, TBY - 3 + Math.sin(a_) * r_ * 0.2, 0.35, 0.35); } X.restore();
      const du = seg(lt, dr.at - 0.9, dr.at, E.in), fy = rr(cy + 28, cy + 150, du); if (lt >= dr.at - 0.9 && lt < dr.at + 0.15) { X.beginPath(); X.ellipse(cx + 6, fy, 7 - du * 2, 10 + du * 6, 0, 0, 6.2832); X.fillStyle = P.paper; X.fill(); X.lineWidth = 2; X.strokeStyle = P.ink; X.stroke(); }
      X.restore(); X.beginPath(); X.arc(cx, cy, rad, 0, 6.2832); X.lineWidth = 6; X.strokeStyle = P.ink; X.stroke(); ink([[cx + rad * 0.7, cy + rad * 0.7], [cx + rad * 1.5, cy + rad * 1.5]], 12, 13410, 0.4);
    }
  });
  bandDivider();
  stage(c, () => {
    pipRoom(lt);
    // Trurl throws the whole office out
    officeDraw({ cues: cues(sh, 'item').length ? cues(sh, 'item') : OFFICE.map((o, i) => ({ k: 'item', i, at: -50 })) }, lt, { hurl: hu });
    const hurling = lt >= hu.at && lt < hu.to + 2.0, sw = Math.sin(lt * 7);
    const pouring = lt >= po.at && lt < po.to, walkOff = lt >= fl.at - 0.2;
    const tx = walkOff ? rr(TRX, 980, E.io(seg(lt, fl.at - 0.2, fl.at + 1.2))) : TRX;
    if (lt < fl.at + 1.2) trurl(tx, 664, 0.95, sh, lt, { f: walkOff ? 1 : -1, look: walkOff ? 1 : -1, ra: hurling ? [-0.9 + sw * 0.9, -0.6 + sw * 0.4] : pouring ? [0.35, 0.0] : undefined, la: hurling ? [-0.8 - sw * 0.9, -0.5 - sw * 0.4] : undefined, tilt: hurling ? 0.06 * sw : pouring ? -0.05 : 0 });
    if (pouring) { const a = seg(lt, po.at, po.at + 0.5, E.out); const cx_ = TRX - 0.95 * 140, cy_ = 664 - 0.95 * 176; cupArt(cx_, cy_, 1.4, 13500, -2.0 * a, 1); const du = seg(lt, po.at + 0.3, po.at + 0.9); if (du > 0) for (let i = 0; i < 4; i++) ink([[cx_ - 22 + i * 1.5, cy_ + 6], [cx_ - 30 + i, rr(cy_ + 6, 660, du)]], 1.6, 13510 + i, 0.4); const pw = seg(lt, po.at + 0.8, po.to + 0.4, E.lin); X.beginPath(); X.ellipse(cx_ - 30, 668, 8 + 70 * pw, 2 + 9 * pw, 0, 0, 6.2832); X.fillStyle = P.paper; X.fill(); X.lineWidth = 1.5; X.strokeStyle = P.ink; X.stroke(); }
    else if (lt >= po.to) { X.beginPath(); X.ellipse(TRX - 0.95 * 140 - 30, 668, 78, 11, 0, 0, 6.2832); X.fillStyle = P.paper; X.fill(); X.lineWidth = 1.5; X.strokeStyle = P.ink; X.stroke(); X.fillStyle = P.ink; for (let i = 0; i < 24; i++) X.fillRect(TRX - 0.95 * 140 - 30 + (hash(13520, i) - 0.5) * 140, 668 + (hash(13521, i) - 0.5) * 18, 1.4, 1.4); }
    const looking = lt >= lk.at;
    crowd(sh, lt, { pos: [[860, 650, 0.8], [980, 670, 0.9], [1100, 648, 0.78], [740, 676, 0.84]], sx: 840, mood: () => (lt < lk.at ? 'worry' : lt < L[5].t0 ? 'happy' : 'flat'), sMood: lt < lk.at ? 'worry' : lt < L[4].t0 ? 'happy' : 'flat', look: -1, lookY: looking && lt < L[4].t0 ? -1 : 0, sLook: -1, sLookY: looking && lt < L[4].t0 ? -1 : 0, sf: -1, face: -1, fl: () => -1, bounce: 1 });
    if (lt < fl.at + 1.2) { oddRide(RIDE.x, RIDE.y, RIDE.s, 13600, {}); }
    vend(1225, 664, 0.95, 13700, { hum: true });
  });
  if (lt >= fl.at + 1.2) { const u = seg(lt, fl.at + 1.2, fl.to, E.in), x_ = rr(RIDE.x, 1500, u), y_ = rr(RIDE.y, -150, E.in(u)) - Math.sin(u * 3) * 20; if (u < 1) trurlRiding(x_, y_, 0.7 + 0.0 * u, 2, lt * 5, 0.8, 1); }
};

/*LOOP*/
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
  const fade = sh.shot === 'title' ? Math.max(1 - seg(lt, 0, 0.6), seg(lt, sd - 0.6, sd)) : sh.shot === 'end' ? 1 - seg(lt, 0, 0.5) : sh.shot === 'clear' ? seg(lt, sd - 0.7, sd) : sh.shot === 'machine' ? 1 - seg(lt, 0, 1.0) : 1 - seg(lt, 0, 0.4);
  if (fade > 0) { X.fillStyle = P.paper; X.globalAlpha = fade; X.fillRect(0, 0, W, H); X.globalAlpha = 1; }
  border();
};
(async () => {
  T = await (await fetch('timing/tp.json')).json();
  await document.fonts.ready; await Promise.all(['IM Fell English', 'IBM Plex Mono'].map((n) => document.fonts.load(`20px "${n}"`)));
  X = document.getElementById('film').getContext('2d');
  window.__NF = Math.ceil(T.dur * 24); window.__T = T; window.__ready = true;
})();
