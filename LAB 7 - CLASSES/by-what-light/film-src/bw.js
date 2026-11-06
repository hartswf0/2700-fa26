/* By What Light: drawing. The study and engraving helpers are from ah.js (The Burning of the Abominable House). */
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

/* ================= the study (from bl.js; shelf and desk adapted) ================= */

const FLOOR = 664, PAPER2 = '#f4eedc';
const PG = { x: 262, y: 216, w: 378, h: 396 };
function wallAndFloor() {
  X.fillStyle = P.paper; X.fillRect(-600, -600, 2500, 1900);
  for (let y = -400, k = 0; y < FLOOR; y += 3.6, k++) { X.fillStyle = P.ink; X.globalAlpha = 0.38; X.fillRect(-600, y, 2500, 0.55 + 0.25 * hash(k, 4)); }
  X.globalAlpha = 1;
  X.fillStyle = P.paper; X.fillRect(-600, FLOOR, 2500, 600);
  for (let y = FLOOR + 3, k = 0; y < 900; y += 4 + k * 0.5, k++) { X.fillStyle = P.ink; X.fillRect(-600, y, 2500, 0.5 + k * 0.05); }
  line([-600, FLOOR], [1900, FLOOR], 2.4, 7400, 0.3);
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
/* a page turning from right to left about the spine; front and back draw functions (in page space) */
function flip(u, front, back) {
  if (u <= 0 || u >= 1) return;
  const c = Math.cos(Math.PI * u), sx = PG.x;
  X.save(); X.translate(sx, 0); X.scale(c, 1); X.translate(-sx, 0);
  if (c > 0) { front(); X.globalAlpha = 0.5 * (1 - c); X.fillStyle = P.ink; X.fillRect(PG.x, PG.y, PG.w, PG.h); X.globalAlpha = 1; }
  else { (back || (() => { shape(R(PG.x, PG.y, PG.w, PG.h), { lw: 1.4, id: 7790, fill: PAPER2, amp: 0.3 }); }))(); X.globalAlpha = 0.35 * (1 + c); X.fillStyle = P.ink; X.fillRect(PG.x, PG.y, PG.w, PG.h); X.globalAlpha = 1; }
  X.restore();
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
  if (st !== 'none') for (const d of [-1, 1]) {
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
const mono = (s, x, y, sz, o = {}) => txt(s, x, y, sz, { mono: true, col: o.col || '#5d564b', align: o.align || 'center' });
function person(x, y, s, id) { ball(x, y - 30 * s, 5.5 * s, id, PAT.f, 1.1); shape([[x - 6 * s, y], [x + 6 * s, y], [x + 4 * s, y - 23 * s], [x - 4 * s, y - 23 * s]], { lw: 1.1, id: id + 1, fill: P.ink }); }

/* ================= this film: the programmer's room ================= */
const CORK = '#d6c7a4', CARD = '#f4eedc', SOOT = '#3a3028';
const COUNTS = { start: '8916100448256', a: '5015306502144', ab: '4074936532992', abc: '3424078614528', abcd: '2663172255744',
  five: '4096000000000000', six: '531441000000000000' };
const WIDE = ON(640, 380, 1.0), BOARDCAM = ON(452, 404, 1.5), COUNTCAM = ON(452, 168, 2.5), CABCAM = ON(146, 470, 1.9);
const FACE = [1082, 396], FACECAM = ON(1060, 404, 3.1), WINCAM = ON(1000, 230, 2.2);
const BC = { x: PG.x + PG.w / 2, y: PG.y + PG.h / 2 };

/* ---------- the computer cabinet ---------- */
const CAB = { x: 40, y: 236, w: 196, h: 428 };
function cabinet(lt, o = {}) {
  const { x, y, w, h } = CAB;
  shape(R(x, y, w, h), { lw: 2, id: 9000, fill: '#d9cfb4', sh: R(x + w - 30, y, 30, h), sh2: [Math.PI / 2, 2.4, 0.7] });
  shape(R(x - 6, y - 10, w + 12, 12), { lw: 1.6, id: 9001, fill: P.ink });
  // two tape reels behind a window
  shape(R(x + 14, y + 20, w - 28, 106), { lw: 1.4, id: 9002, fill: PAPER2 });
  const spin = o.spin ?? 1;
  for (const [cx, dir] of [[x + 56, 1], [x + w - 56, -1]]) {
    ball(cx, y + 73, 38, 9010 + cx, PAT.m, 1.6, P.paper);
    ball(cx, y + 73, 10, 9020 + cx, PAT.f, 1.2);
    for (let k = 0; k < 3; k++) { const a = k / 3 * 6.283 + lt * 2.4 * dir * spin; ink([[cx + Math.cos(a) * 12, y + 73 + Math.sin(a) * 12], [cx + Math.cos(a) * 32, y + 73 + Math.sin(a) * 32]], 3, 9030 + k + cx, 0.15); }
  }
  line([x + 56, y + 111], [x + w - 56, y + 111], 1, 9040, 0.1);
  // lamp grid
  for (let r = 0; r < 5; r++) for (let c = 0; c < 8; c++) {
    const lx = x + 26 + c * 20, ly = y + 150 + r * 16;
    const on = o.red ? (Math.sin(lt * 9 + r) > -0.2) : hash(r * 8 + c, BOIL >> 1) > 0.55;
    X.beginPath(); X.arc(lx, ly, 4.2, 0, 6.283); X.fillStyle = on ? (o.red ? P.red : P.ink) : P.paper; X.fill(); X.lineWidth = 1; X.strokeStyle = P.ink; X.stroke();
  }
  // card hopper and printer slot
  shape(R(x + 22, y + 250, w - 44, 34), { lw: 1.4, id: 9050, h: [0, 2.6, 0.5] });
  for (let k = 0; k < 6; k++) shape(R(x + 30 + k * 3, y + 240 - k * 2, 70, 12), { lw: 0.9, id: 9051 + k, fill: CARD });
  mono('CARD READER', x + w / 2, y + 296, 7.5);
  shape(R(x + 30, y + 318, w - 60, 8), { lw: 1.2, id: 9060, fill: P.ink });
  mono('PRINTER', x + w / 2, y + 338, 7.5);
  shape(R(x + 22, y + 360, w - 44, 56), { lw: 1.2, id: 9061, h: [Math.PI / 2, 3, 0.5] });
  // cable to the counter above the board
  ink([[x + w, y + 24], [x + w + 18, y - 40], [PG.x + 8, 164]], 2, 9070, 0.4);
  if (o.print > 0) printout(o.print, o.printText || []);
}
/* paper coming out of the printer slot; u 0..1 */
function printout(u, rows) {
  const x0 = CAB.x + 44, w = CAB.w - 88, y0 = CAB.y + 322, len = 250 * E.out(clamp(u));
  shape(R(x0, y0, w, len), { lw: 1.2, id: 9080, fill: CARD });
  for (let k = 0; k < 12; k++) { const yy = y0 + 14 + k * 9; if (yy > y0 + len - 8) break; X.fillStyle = P.ink; X.fillRect(x0 + 4, yy - 3, 2, 2); X.fillRect(x0 + w - 6, yy - 3, 2, 2); }
  X.save(); path(R(x0, y0, w, len)); X.clip();
  rows.forEach((r, i) => mono(r, x0 + w / 2, y0 + 18 + i * 13, 7.6, { col: i === rows.length - 1 ? P.red : P.ink }));
  X.restore();
}

/* ---------- the counter above the board ---------- */
const CTR = { x: PG.x, y: 118, w: PG.w, h: 84 };
/* val: a digit string, from: the previous one, u: 0..1 roll progress; people/pairs labels */
function counter(lt, o = {}) {
  const { x, y, w, h } = CTR;
  shape(R(x, y, w, h), { lw: 2, id: 9100, fill: '#d9cfb4', sh: R(x + w - 18, y, 18, h), sh2: [Math.PI / 2, 2.2, 0.7] });
  mono(o.people ? `PEOPLE ${o.people}` : 'PEOPLE -', x + 14, y + 16, 7.5, { align: 'left', col: P.ink });
  mono(o.pairs ? `PAIRS ${o.pairs}` : 'PAIRS -', x + 110, y + 16, 7.5, { align: 'left', col: P.ink });
  mono('DEEDS 12', x + 200, y + 16, 7.5, { align: 'left', col: P.ink });
  mono(o.label || 'POSSIBLE STORIES', x + w - 26, y + 16, 7.5, { align: 'right', col: o.hi ? P.red : P.ink });
  const N = 18, cw = 15.5, gap = 1.6, sep = 4.5;
  let total = N * (cw + gap) + 5 * sep, cx = x + (w - total) / 2;
  const val = o.err ? '      ERROR       ' : (o.val || '').padStart(N, ' '), from = (o.from || '').padStart(N, ' '), u = o.u ?? 1;
  for (let j = 0; j < N; j++) {
    const ch = val[j];
    const settle = 1 - (N - 1 - j) / N;                      // right digits settle first
    let show = ch;
    if (u < 1 && !o.err) { const done = u > 1 - settle * 0.85 + 0.12; show = done ? ch : (from[j] !== ' ' || ch !== ' ' ? String(Math.floor(hash(j * 13, BOIL) * 10)) : ' '); }
    shape(R(cx, y + 30, cw, 36), { lw: 1, id: 9110 + j, fill: o.err || o.hi ? '#f1d9c9' : PAPER2, amp: 0.15 });
    if (show !== ' ') txt(show, cx + cw / 2, y + 49, 20, { mono: true, col: o.err || o.hi ? P.red : P.ink });
    cx += cw + gap; if (j < N - 1 && (N - 1 - j) % 3 === 0) { X.fillStyle = P.ink; X.fillRect(cx + 0.5, y + 60, 2, 3); cx += sep; }
  }
  const sp = o.spoken; if (sp) mono(sp, x + w / 2, y + h - 8, 7.5, { col: P.ink });
}

/* ---------- the window: fog, and at the end the siren ---------- */
const WIN = { x: 900, y: 104, w: 176, h: 196 };
function windowFog(lt, o = {}) {
  const { x, y, w, h } = WIN, red = o.siren || 0;
  shape(R(x - 8, y - 8, w + 16, h + 16), { lw: 1.6, id: 9200, h: [0, 3, 0.5] });
  shape(R(x, y, w, h), { lw: 1.4, id: 9201, fill: PAPER2 });
  X.save(); path(R(x, y, w, h)); X.clip();
  for (let k = 0; k < 9; k++) { const yy = y + 20 + k * 21 + Math.sin(lt * 0.3 + k) * 4; X.globalAlpha = 0.35; line([x - 10, yy], [x + w + 10, yy + 6 * Math.sin(k)], 0.8, 9210 + k, 0.8); }
  X.globalAlpha = 1;
  // the overpass and the lit house far off
  ink([[x, y + h - 52], [x + w, y + h - 70]], 1.2, 9230, 0.3); for (let k = 0; k < 6; k++) line([x + 10 + k * 30, y + h - 54 - k * 3], [x + 10 + k * 30, y + h - 30], 0.8, 9231 + k, 0.1);
  if (o.rain) for (let k = 0; k < 40; k++) { const rx = x + hash(k, 3) * w, ry = y + ((hash(k, 4) * h + lt * 380) % h); X.globalAlpha = 0.5; line([rx, ry], [rx - 3, ry + 10], 0.6, 9240 + k, 0.05); X.globalAlpha = 1; }
  if (red > 0) { X.fillStyle = P.red; X.globalAlpha = red * (0.25 + 0.25 * Math.max(0, Math.sin(lt * 10))); X.fillRect(x, y, w, h); X.globalAlpha = 1; }
  X.restore();
  line([x + w / 2, y], [x + w / 2, y + h], 2.2, 9250, 0.2); line([x, y + h / 2], [x + w, y + h / 2], 2.2, 9251, 0.2);
}
function sirenWash(lt, k) { if (k <= 0) return; const p = Math.max(0, Math.sin(lt * 10)); X.save(); X.globalAlpha = k * 0.16 * p; X.fillStyle = P.red; X.fillRect(-600, -600, 2500, 1900); X.restore(); }

/* ---------- the corkboard on its easel ---------- */
function board(inner) {
  const y = PG.y + PG.h;
  for (const [a, b] of [[PG.x + 50, PG.x + 20], [PG.x + PG.w - 50, PG.x + PG.w - 20]]) line([a, y], [b, FLOOR], 4, 9300 + a, 0.3);
  line([BC.x, PG.y - 6], [BC.x + 40, FLOOR], 3, 9302, 0.3);
  shape(R(PG.x - 12, PG.y - 12, PG.w + 24, PG.h + 24), { lw: 2, id: 9303, fill: '#4b4137' });
  shape(R(PG.x, PG.y, PG.w, PG.h), { lw: 1.4, id: 9304, fill: CORK });
  X.fillStyle = P.ink; X.globalAlpha = 0.22; for (let i = 0; i < 900; i++) X.fillRect(PG.x + hash(i, 1) * PG.w, PG.y + hash(i, 2) * PG.h, 1.2, 1.2); X.globalAlpha = 1;
  X.save(); path(R(PG.x, PG.y, PG.w, PG.h)); X.clip(); inner(); X.restore();
}
function tack(x, y, id, col = P.red) { X.beginPath(); X.arc(x, y, 3.6, 0, 6.283); X.fillStyle = col; X.fill(); X.lineWidth = 1; X.strokeStyle = P.ink; X.stroke(); void id; }
function slipCard(x, y, w, h, id, o = {}) {
  X.save(); X.translate(x + w / 2, y + h / 2); X.rotate(o.tilt || 0); X.translate(-(x + w / 2), -(y + h / 2));
  shape(R(x + 3, y + 4, w, h), { fill: 'rgba(28,24,20,.25)', lw: 0 });
  shape(R(x, y, w, h), { lw: 1.2, id, fill: o.fill || CARD, amp: 0.25 });
  if (o.draw) o.draw();
  tack(x + w / 2, y + 7, id);
  X.restore();
}

/* ---------- the people, as pinned cards ---------- */
const NAMES = { W: 'WIDOW ROESSLER', O: 'OGIVA', I: 'INIGO', B: 'BELINDO KID', S: 'SKILLER', D: 'WALDEMAR' };
function bust(who, cx, cy, s, id, o = {}) {
  X.save(); X.translate(cx, cy); X.scale(s, s);
  const lk = o.look || 0, eye = (ex, ey) => { X.fillStyle = P.ink; X.fillRect(ex - 1.3 + lk * 1.6, ey - 1.3, 2.6, 2.6); };
  if (who === 'B') {
    shape([[-34, 40], [34, 40], [26, 6], [-26, 6]], { lw: 1.6, id: id + 1, h: [1.75, 3.4, 0.6] });
    shape(R(-10, -6, 20, 14), { lw: 1.4, id: id + 2, h: [Math.PI / 2, 2.6, 0.5] });
    ball(0, -14, 10, id + 3, PAT.f, 1.4); eye(-4, -15); eye(4, -15); line([-4, -8], [4, -8], 1, id + 4, 0.05);
  } else {
    const hr = who === 'O' ? 13 : 12;
    // shoulders
    if (who === 'W') shape([[-26, 40], [26, 40], [18, 10], [-18, 10]], { lw: 1.4, id: id + 1, h: [[0.7, 3, 0.5], [-0.7, 3, 0.5]] });
    else if (who === 'S') { shape([[-24, 40], [24, 40], [16, 10], [-16, 10]], { lw: 1.4, id: id + 1, h: [1.75, 3, 0.5] }); shape([[-3, 10], [3, 10], [4, 32], [0, 38], [-4, 32]], { lw: 1, id: id + 9, fill: P.ink }); }
    else if (who === 'D') { shape([[-24, 40], [24, 40], [16, 10], [-16, 10]], { lw: 1.4, id: id + 1, h: [0.3, 3.2, 0.5] }); for (let k = 0; k < 4; k++) shape(R(-14, 6 + k * 5, 28, 4), { lw: 0.8, id: id + 20 + k, fill: k % 2 ? P.ink : CARD }); }
    else shape([[-22, 40], [22, 40], [14, 12], [-14, 12]], { lw: 1.4, id: id + 1, h: [1.75, 3, 0.5] });
    if (who === 'O') shape(R(-4, 0, 8, 12), { lw: 1.1, id: id + 2 });
    if (who === 'I') for (const d of [-1, 1]) ink([[d * 9, -24], [d * 15, -12], [d * 16, 4], [d * 14, 16]], 3.2, id + 30 + d, 0.3);
    ball(0, -12, hr, id + 3, who === 'O' ? null : PAT.f, 1.5);
    if (who === 'O') { X.beginPath(); X.arc(-4, -18, 4, 0, 6.283); X.fillStyle = P.paper; X.fill(); for (const d of [-1, 1]) { X.beginPath(); X.arc(d * 13, -6, 1.8, 0, 6.283); X.fillStyle = P.red; X.fill(); } }
    if (who === 'W') { ball(0, -27, 6, id + 4, PAT.m, 1.2); for (const d of [-1, 1]) { X.beginPath(); X.arc(d * 4.5, -12, 3.2, 0, 6.283); X.lineWidth = 0.9; X.strokeStyle = P.ink; X.stroke(); } }
    if (who === 'I') { ink([[-10, -22], [0, -27], [10, -22]], 3, id + 5, 0.3); X.fillStyle = P.ink; for (let k = 0; k < 10; k++) X.fillRect(-6 + hash(k, id) * 12, -4 + hash(k, id + 1) * 5, 1, 1); }
    if (who === 'S') { shape(R(-15, -26, 30, 3), { lw: 1, id: id + 6, fill: P.ink }); shape(R(-9, -38, 18, 13), { lw: 1, id: id + 7, fill: P.ink }); }
    if (who === 'D') { shape(R(-10, -16, 8, 6), { lw: 1.1, id: id + 8 }); shape(R(2, -16, 8, 6), { lw: 1.1, id: id + 10 }); }
    if (o.closed) { line([-7, -12], [-2, -12], 1, id + 11, 0.05); line([2, -12], [7, -12], 1, id + 12, 0.05); } else { eye(-4.5, -12); eye(4.5, -12); }
    line([-3, -3], [3, -3], 0.9, id + 13, 0.05);
  }
  X.restore();
}
const CW = 74, CH = 98;
function personCard(who, x, y, id, o = {}) {
  slipCard(x, y, CW, CH, id, { tilt: o.tilt || 0, draw: () => {
    bust(who, x + CW / 2, y + 44, 0.95, id + 50, { look: o.look || 0 });
    mono(NAMES[who], x + CW / 2, y + CH - 10, 6.2, { col: P.ink });
    if (o.mark) { X.globalAlpha = o.mark; ink([[x + 8, y + 12], [x + CW - 8, y + CH - 18]], 3, id + 90, 0.4, P.red); ink([[x + CW - 8, y + 12], [x + 8, y + CH - 18]], 3, id + 91, 0.4, P.red); X.globalAlpha = 1; }
  } });
}

/* ---------- the house on its hump of waste ground ---------- */
/* st: { h 0..1 standing height, fire 0..1, char 0..1, rubble 0..1, lit 0..1 } */
function house(cx, gy, s, id, st = {}) {
  X.save(); X.translate(cx, gy); X.scale(s, s);
  // waste ground, railway, scrapyard
  shape([[-260, 30], [-170, 0], [-90, -26], [0, -36], [90, -26], [170, 0], [260, 30], [260, 80], [-260, 80]], { lw: 1.5, id: id + 1, h: [0.15, 4, 0.5] });
  line([-260, 52], [260, 52], 1.2, id + 2, 0.2); line([-260, 60], [260, 60], 1.2, id + 3, 0.2); for (let k = 0; k < 24; k++) line([-252 + k * 22, 48], [-252 + k * 22, 64], 1.4, id + 4 + k, 0.1);
  for (let k = 0; k < 5; k++) { const x = -240 + k * 34 + (k > 2 ? 330 : 0); shape([[x, 10], [x + 26, 10], [x + 30, -2], [x + 4, -6]], { lw: 1, id: id + 40 + k, h: [0.4 + k, 2.6, 0.5] }); }
  const h = st.h ?? 1, fire = st.fire || 0, ch = st.char || 0, sk = 6;
  if (h > 0.02) {
    const H0 = 120 * h;
    const body = [[-60, -30], [60, -32], [60 + sk, -30 - H0], [-60 + sk, -30 - H0 + 2]];
    shape(body, { lw: 1.8, id: id + 60, fill: CARD, sh: [[20, -32], [60, -32], [60 + sk, -30 - H0], [20 + sk, -30 - H0]], sh2: [Math.PI / 2 + 0.06, 2.6, 0.7] });
    const roof = [[-74 + sk, -28 - H0], [74 + sk, -30 - H0], [sk + 4, -30 - H0 - 62 * h]];
    shape(roof, { lw: 1.8, id: id + 61, h: [-1.0, 3.2, 0.6] });
    shape(R(34 + sk, -30 - H0 - 50 * h, 12, 30 * h), { lw: 1.4, id: id + 62, h: [Math.PI / 2, 2.4, 0.6] });
    for (const [wx, wy] of [[-36, -30 - H0 * 0.72], [22, -30 - H0 * 0.72], [-36, -30 - H0 * 0.32]]) {
      const lit = st.lit || 0;
      shape(R(wx + sk * (1 - (wy + 30) / -H0 * 0), wy, 20, 22 * Math.max(0.3, h)), { lw: 1.4, id: id + 70 + wx, fill: fire > 0.1 ? P.paper : lit > 0 ? '#f4e3b8' : P.ink });
      if (fire > 0.1) flame(wx + 10, wy + 4, 18 * fire, id + 80 + wx);
    }
    shape(R(10, -30 - 40 * h, 18, 38 * h), { lw: 1.4, id: id + 90, fill: P.ink });
    if (ch > 0) { X.save(); path(body); X.clip(); X.globalAlpha = ch * 0.85; hatch(0.8, 3.0 - ch * 1.4, 1.2, bbox(body)); hatch(-0.8, 3.4 - ch * 1.4, 1.0, bbox(body)); X.restore(); X.globalAlpha = 1; }
    if (fire > 0.1) { flame(sk + 4, -30 - H0 - 56 * h, 46 * fire, id + 95); flame(-40, -30 - H0 - 4, 30 * fire, id + 96); flame(50, -30 - H0, 34 * fire, id + 97); }
  }
  const rb = st.rubble || 0;
  if (rb > 0) { X.globalAlpha = clamp(rb * 2); for (let k = 0; k < 16; k++) { const rx = -64 + hash(k, id) * 128, ry = -34 - hash(k, id + 1) * 18 * rb; shape(rock(rx, ry, 6 + hash(k, id + 2) * 8, id + 120 + k, 9), { lw: 1.1, id: id + 120 + k, fill: SOOT }); }
    for (let k = 0; k < 5; k++) line([-40 + k * 20, -34], [-50 + k * 24 + hash(k, 5) * 20, -60 - hash(k, 6) * 26 * rb], 2.4, id + 140 + k, 0.4); X.globalAlpha = 1; }
  if (st.smoke) for (let k = 0; k < 6; k++) { const u = ((GT * 0.18 + k / 6) % 1); X.globalAlpha = (1 - u) * 0.5 * st.smoke; ball(sk + 4 + Math.sin(u * 6 + k) * 18, -180 - u * 170, 10 + u * 24, id + 160 + k, null, 1, CARD); X.globalAlpha = 1; }
  if (st.visitor) { const vx = 34, vy = -30; person(vx, vy, 1.5, id + 170); shape(R(vx + 8, vy - 16, 16, 12), { lw: 1, id: id + 171, fill: '#4b4137' }); }
  X.restore();
}
function flame(x, y, r, id) {
  if (r < 1) return;
  const k = BOIL, pts = [];
  for (let i = 0; i <= 10; i++) { const u = i / 10, a = Math.PI * u; const w = r * 0.5 * Math.sin(a) * (0.8 + 0.3 * hash(id + i, k)); pts.push([x + (u - 0.5) * r * 0.9 + Math.sin(u * 7 + k) * 2, y - Math.sin(a) * 0 - w * 0]); }
  const p = [[x - r * 0.45, y]];
  for (let i = 1; i < 6; i++) { const u = i / 6; p.push([x - r * 0.45 + u * r * 0.9, y - r * (0.4 + 0.7 * hash(id + i, k)) * Math.sin(Math.PI * u)]); }
  p.push([x + r * 0.45, y]);
  shape(p, { lw: 1.4, id, fill: P.ink }); void pts;
  const q = p.map(([a, b]) => [x + (a - x) * 0.5, y + (b - y) * 0.55]); shape(q, { lw: 0.8, id: id + 30, fill: P.red });
}

/* ---------- the copybook ---------- */
const DEEDS = ['BLACKMAIL', 'DRUGGING', 'INCITEMENT TO SUICIDE', 'KNIFING', 'PROSTITUTION', 'THREATENING WITH A GUN', 'TYING AND GAGGING', 'RAPE', 'SEDUCTION', 'SLANDER', 'SNOOPING', 'STRANGLING'];
function copyFront(x, y, w, h) {
  shape(R(x, y, w, h), { lw: 1.8, id: 9400, fill: '#4b4137' });
  const lab = R(x + w * 0.12, y + h * 0.18, w * 0.76, h * 0.42); shape(lab, { lw: 1.4, id: 9401, fill: CARD });
  const lines = ['An Account', 'of the Abominable Deeds', 'Committed', 'in this House'];
  lines.forEach((s, i) => txt(s, x + w / 2, y + h * 0.26 + i * h * 0.085, Math.max(9, w * 0.062), { italic: true }));
  scorch(x, y, w, h);
}
function copyBack(x, y, w, h, o = {}) {
  shape(R(x, y, w, h), { lw: 1.8, id: 9410, fill: CARD });
  mono('INDEX', x + w / 2, y + 30, 10, { col: P.ink });
  const lead = (h - 90) / 13, x0 = x + 34, x1 = x + w - 40;
  DEEDS.forEach((d, i) => {
    const yy = y + 56 + i * lead; X.globalAlpha = o.fade ? (o.fade[i] ?? 1) : 1;
    mono(d, x0, yy, 8.6, { align: 'left', col: P.ink });
    X.font = '8px "IBM Plex Mono"'; const dw = X.measureText(d).width * 1.0; X.fillStyle = P.ink; for (let dx = x0 + dw + 10; dx < x1 - 16; dx += 6) X.fillRect(dx, yy + 2, 1.4, 1.4);
    X.globalAlpha = 1;
  });
  // the page numbers under one black streak
  shape([[x1 - 22, y + 44], [x1 + 14, y + 40], [x1 + 22, y + 56 + 12 * lead], [x1 - 14, y + 60 + 12 * lead]], { lw: 1.2, id: 9420, fill: SOOT, h: [0.3, 2.2, 0.6] });
  if (o.thirteen > 0) { const yy = y + 56 + 12 * lead; X.globalAlpha = o.thirteen; mono('ARSON', x0, yy, 8.6, { align: 'left', col: P.red }); X.setLineDash([3, 4]); line([x0 - 8, yy + 6], [x1 - 26, yy + 6], 1, 9430, 0.1, P.red); X.setLineDash([]); X.globalAlpha = 1; }
  scorch(x, y, w, h);
}
function scorch(x, y, w, h) {
  X.save(); path(R(x, y, w, h)); X.clip();
  const p = []; const n = 40; for (let i = 0; i < n; i++) { const u = i / n, a = u * 6.283; const ex = Math.cos(a), ey = Math.sin(a); p.push([x + w / 2 + ex * w * 0.62 * (0.92 + 0.1 * hash(i, 77)), y + h / 2 + ey * h * 0.62 * (0.92 + 0.1 * hash(i, 78))]); }
  X.beginPath(); X.rect(x - 20, y - 20, w + 40, h + 40); p.forEach(([a, b], i) => (i ? X.lineTo(a, b) : X.moveTo(a, b))); X.closePath(); X.fillStyle = SOOT; X.globalAlpha = 0.7; X.fill('evenodd'); X.globalAlpha = 1;
  // plastic folder sheen
  X.globalAlpha = 0.18; X.fillStyle = P.paper; X.beginPath(); X.moveTo(x + w * 0.1, y); X.lineTo(x + w * 0.3, y); X.lineTo(x + w * 0.05, y + h); X.lineTo(x - w * 0.15, y + h); X.fill(); X.globalAlpha = 1;
  X.restore();
}
/* the copybook on the board, a flip from front to back over [t0, t0+0.75] */
function copybook(lt, show, turnAt, o = {}) {
  const x = PG.x + 26, y = PG.y + 20, w = PG.w - 52, h = PG.h - 40;
  X.globalAlpha = show; const tu = turnAt == null ? 0 : U(lt, turnAt, turnAt + 0.75);
  if (tu <= 0) copyFront(x, y, w, h); else if (tu >= 1) copyBack(x, y, w, h, o);
  else { const c = Math.cos(Math.PI * tu); X.save(); X.translate(BC.x, 0); X.scale(Math.abs(c), 1); X.translate(-BC.x, 0); if (c > 0) copyFront(x, y, w, h); else copyBack(x, y, w, h, o); X.restore(); }
  X.globalAlpha = 1;
}

/* ---------- the grid: who did it (rows) to whom (columns) ---------- */
function pairGrid(ids, x, y, cell, lit, o = {}) {
  const n = ids.length;
  mono('TO WHOM', x + n * cell / 2 + cell, y - 10, 7.5, { col: P.ink });
  X.save(); X.translate(x - 4, y + cell + n * cell / 2); X.rotate(-Math.PI / 2); mono('BY WHOM', 0, 0, 7.5, { col: P.ink }); X.restore();
  ids.forEach((w, i) => { mono(w, x + cell * 1.5 + i * cell, y + cell * 0.62, 9, { col: P.ink }); mono(w, x + cell * 0.6, y + cell * 1.62 + i * cell, 9, { col: P.ink }); });
  let k = 0;
  for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) {
    const cx = x + cell + c * cell, cy = y + cell + r * cell;
    if (r === c) { shape(R(cx, cy, cell, cell), { lw: 1, id: 9500 + r * 10 + c, fill: '#cbbd9c', h: [0.8, 2.2, 0.5] }); continue; }
    const on = k < lit; k++;
    shape(R(cx, cy, cell, cell), { lw: 1, id: 9500 + r * 10 + c, fill: on ? CARD : '#e4d9bf' });
    if (on) { X.beginPath(); X.arc(cx + cell / 2, cy + cell / 2, Math.min(5, cell * 0.14), 0, 6.283); X.fillStyle = o.red ? P.red : P.ink; X.fill(); }
  }
}

/* arrows between cards (centres given), with a label */
function arrow(a, b, u, lab, id, col = P.ink) {
  if (u <= 0) return;
  const [x0, y0] = a, [x1, y1] = b, mx_ = (x0 + x1) / 2 + (y1 - y0) * 0.18, my = (y0 + y1) / 2 - (x1 - x0) * 0.18;
  const pts = []; for (let i = 0; i <= 20; i++) { const t = i / 20 * clamp(u); pts.push([(1 - t) ** 2 * x0 + 2 * t * (1 - t) * mx_ + t * t * x1, (1 - t) ** 2 * y0 + 2 * t * (1 - t) * my + t * t * y1]); }
  ink(pts, 2, id, 0.3, col);
  if (u >= 1) { const [ex, ey] = pts[20], [px, py] = pts[17], a_ = Math.atan2(ey - py, ex - px); shape([[ex, ey], [ex - 10 * Math.cos(a_ - 0.4), ey - 10 * Math.sin(a_ - 0.4)], [ex - 10 * Math.cos(a_ + 0.4), ey - 10 * Math.sin(a_ + 0.4)]], { lw: 1, id: id + 1, fill: col });
    if (lab) { const [lx, ly] = pts[10]; shape(R(lx - lab.length * 3.2 - 4, ly - 8, lab.length * 6.4 + 8, 13), { lw: 0.8, id: id + 2, fill: CARD }); mono(lab, lx, ly + 2, 7.2, { col }); } }
}

/* ---------- the terminal on the desk ---------- */
function terminal() {
  shape([[970, 512], [1048, 512], [1052, 520], [966, 520]], { lw: 1.4, id: 9600, fill: '#d9cfb4' });
  for (let r = 0; r < 2; r++) for (let c = 0; c < 9; c++) X.fillStyle = P.ink, X.fillRect(974 + c * 8.2 + r * 2, 514 + r * 3, 5, 1.6);
}
function lab(sh, lt, o = {}) {
  wallAndFloor(); windowFog(lt, { rain: o.rain, siren: o.siren || 0 });
  desk({ book: 'none' }); terminal();
  cabinet(lt, o.cab || {});
  counter(lt, o.ctr || {});
  board(o.board || (() => {}));
}
const programmer = (lt, o = {}) => reader(RDX, 1, lt, { down: o.down ?? false, look: o.look || 0, write: o.write || 0, mouth: o.mouth || 0 });
const typingAt = (sh, lt) => sh.cues.some((c) => c.k === 'rule' && lt >= c.at && lt < c.at + 1.6) ? 1 : 0;
const mouthOf = (sh, lt) => sayAt(sh, 'P', lt) * 0.8;

/* card positions on the board */
const ROW4 = (i) => [PG.x + 22 + i * 86, PG.y + 18];
const ROW5 = (i) => [PG.x + 10 + i * 72, PG.y + 18];
const ctrOf = ([x, y]) => [x + CW / 2, y + CH / 2];


/* ================= By What Light ================= */
const NIGHT = '#221d18', MOON = '#a9bccb', GLOW = '#f6e7bf', FIRE = '#c8582f';
const SN = { R: 'the widow', O: 'Ogiva', I: 'Inigo', B: 'Belindo' };
const SK = ['R', 'O', 'I', 'B'];
const LOG = BWD.log;
const fmt = (s) => s.replace(/\B(?=(\d{3})+(?!\d))/g, ',');

/* ---------- the cutaway house ---------- */
const GY = 560;
// CELLAR, KITCHEN, FRONT ROOM, STAIRWELL, ATTIC, BEDROOM, and the box room that holds the ledger
const RM = [
  { x0: 150, x1: 1130, y0: 572, y1: 662, fl: 662, door: 690, act: [300, 400] },
  { x0: 150, x1: 510, y0: 400, y1: 560, fl: 560, door: 470, act: [250, 340] },
  { x0: 770, x1: 1130, y0: 400, y1: 560, fl: 560, door: 810, act: [930, 1020] },
  { x0: 510, x1: 770, y0: 240, y1: 560, fl: 560, door: 560, act: [610, 690] },
  { x0: 330, x1: 950, y0: 104, y1: 230, fl: 230, door: 690, act: [480, 570] },
  { x0: 150, x1: 510, y0: 240, y1: 390, fl: 390, door: 470, act: [250, 340] },
];
const BOX = { x0: 770, x1: 1130, y0: 240, y1: 390 };
const roofPts = [[120, 242], [640, 36], [1160, 242]];
function roomClip(r) {
  if (r === 4) { X.beginPath(); X.moveTo(150, 232); X.lineTo(640, 44); X.lineTo(1130, 232); X.closePath(); return; }
  const m = RM[r]; X.beginPath(); X.rect(m.x0, m.y0, m.x1 - m.x0, m.y1 - m.y0);
}
const roomCenter = (r) => (r === 4 ? [640, 180] : [(RM[r].x0 + RM[r].x1) / 2, (RM[r].y0 + RM[r].y1) / 2]);
function houseShell(lt) {
  // night outside
  X.fillStyle = NIGHT; X.fillRect(-600, -600, 2600, 2000);
  for (let i = 0; i < 70; i++) { X.fillStyle = P.paper; X.globalAlpha = 0.35; X.fillRect(hash(i, 51) * 1280, hash(i, 52) * 220, 1.4, 1.4); }
  X.globalAlpha = 1;
  ball(1180, 90, 26, 60000, null, 1.2, '#e8e2cf');
  // earth around the cellar
  shape([[-100, GY], [1400, GY], [1400, 800], [-100, 800]], { lw: 1.4, id: 60001, fill: '#4b4137', h: [0.2, 3.2, 0.5] });
  // rooms, lit as if by day; darkness goes on top later
  for (let r = 0; r < 6; r++) { X.save(); roomClip(r); X.fillStyle = P.paper; X.fill(); X.clip();
    for (let y = RM[r].y0 - 200; y < RM[r].fl; y += 4) { X.fillStyle = 'rgba(28,24,20,.22)'; X.fillRect(RM[r].x0 - 10, y, RM[r].x1 - RM[r].x0 + 20, 0.6); }
    X.restore(); }
  // the box room: the ledger is pinned here
  shape(R(BOX.x0, BOX.y0, BOX.x1 - BOX.x0, BOX.y1 - BOX.y0), { lw: 1.4, id: 60005, fill: '#d6c7a4', h: [0.7, 6, 0.2] });
  // furniture
  shape(R(200, 512, 120, 8), { lw: 1.4, id: 60010, h: [0, 3, 0.5] }); line([210, 520], [206, 560], 2.4, 60011, 0.1); line([310, 520], [314, 560], 2.4, 60012, 0.1); // kitchen table
  shape(R(150, 470, 34, 90), { lw: 1.2, id: 60013, h: [Math.PI / 2, 3, 0.4] }); // stove
  shape(R(1050, 500, 60, 60), { lw: 1.4, id: 60014, h: [0.9, 4, 0.4] }); // front room armchair
  shape(R(170, 352, 150, 38), { lw: 1.4, id: 60015, fill: P.paper, h: [0, 4, 0.4] }); shape(R(170, 330, 14, 60), { lw: 1.2, id: 60016, h: [Math.PI / 2, 2.4, 0.4] }); // bed
  for (const bx of [180, 240, 960, 1030]) shape(R(bx, 616, 46, 46), { lw: 1.2, id: 60020 + bx, h: [0.3, 3, 0.4] }); // cellar crates
  for (let q = 0; q < 5; q++) line([380 + q * 130, 120], [380 + q * 130, 230], 1.4, 60030 + q, 0.1); // attic posts
  // the stair: steps zigzag up the well, and down into the cellar
  for (let q = 0; q < 8; q++) shape(R(520 + q * 26, 540 - q * 20, 30, 20), { lw: 1.1, id: 60040 + q, fill: P.paper });
  for (let q = 0; q < 7; q++) shape(R(740 - q * 26, 380 - q * 20, 30, 20), { lw: 1.1, id: 60050 + q, fill: P.paper });
  for (let q = 0; q < 4; q++) shape(R(560 + q * 26, 576 + q * 21, 30, 20), { lw: 1.1, id: 60060 + q, fill: P.paper });
  shape(R(600, 230, 80, 10), { lw: 1.2, id: 60065, fill: P.ink }); // the attic hatch
  // walls and floors
  for (const [x0, y0, x1, y1] of [[150, 390, 510, 400], [770, 390, 1130, 400], [150, 230, 1130, 240], [150, 560, 1130, 572], [150, 662, 1130, 670]]) shape(R(x0, y0, x1 - x0, y1 - y0), { lw: 1.4, id: 60070 + x0 + y0, fill: '#6f6a61' });
  for (const x of [150, 1130]) shape(R(x - 10, 230, 10, 440), { lw: 1.4, id: 60080 + x, fill: '#6f6a61' });
  for (const x of [510, 770]) { line([x, 240], [x, 300], 3, 60090 + x, 0.1); line([x, 400], [x, 450], 3, 60095 + x, 0.1); }
  shape([[110, 244], [640, 30], [1170, 244], [1150, 244], [640, 48], [130, 244]], { lw: 1.8, id: 60100, fill: '#4b4137' });
  // windows
  for (const [wx, wy] of [[300, 270], [300, 430], [950, 430]]) { shape(R(wx, wy, 50, 60), { lw: 1.2, id: 60110 + wx + wy, fill: null }); line([wx + 25, wy], [wx + 25, wy + 60], 1, 60111 + wx + wy, 0.1); }
  void lt;
}
/* darkness, light and fire over each room. L: {r: 'MOONLIGHT'|'CANDLE'|'LAMP'|'DARK'|'SHUT', at: [x, y]}; fire 0..1 */
function lights(lt, L = {}, fire = 0, frozen = false) {
  const fl = frozen ? 0.5 : 0.5 + 0.5 * Math.sin(lt * 23) * Math.sin(lt * 7.3);
  for (let r = 0; r < 6; r++) {
    const s = L[r] || { kind: 'DARK' }; const m = RM[r];
    X.save(); roomClip(r); X.clip();
    if (s.kind === 'CANDLE' || s.kind === 'LAMP') {
      const [cx, cy] = s.at || [(m.act[0] + m.act[1]) / 2, m.fl - 70]; const rad = (s.kind === 'CANDLE' ? 150 : 300) * (s.u ?? 1) * (s.kind === 'CANDLE' ? 0.96 + 0.04 * fl : 1);
      const g = X.createRadialGradient(cx, cy, rad * 0.15, cx, cy, Math.max(1, rad)); g.addColorStop(0, 'rgba(34,29,24,0)'); g.addColorStop(0.55, 'rgba(34,29,24,0.18)'); g.addColorStop(1, 'rgba(34,29,24,0.88)');
      X.fillStyle = g; X.fillRect(m.x0 - 20, m.y0 - 200, m.x1 - m.x0 + 40, m.y1 - m.y0 + 240);
      X.globalAlpha = 0.18; X.fillStyle = '#e3ad46'; X.beginPath(); X.arc(cx, cy, rad * 0.45, 0, 6.283); X.fill(); X.globalAlpha = 1;
      // the source itself
      if (s.kind === 'CANDLE') { shape(R(cx - 3, cy + 30, 6, 16), { lw: 0.8, id: 61000 + r, fill: P.paper }); X.fillStyle = '#e3ad46'; X.beginPath(); X.ellipse(cx, cy + 24 - fl, 3, 7, 0, 0, 6.283); X.fill(); }
      else { line([cx, m.y0], [cx, cy - 12], 1, 61010 + r, 0.1); shape([[cx - 9, cy - 12], [cx + 9, cy - 12], [cx + 7, cy + 10], [cx - 7, cy + 10]], { lw: 1, id: 61020 + r, fill: '#f1e6c4' }); }
    } else if (s.kind === 'MOONLIGHT') {
      X.fillStyle = 'rgba(34,29,24,0.84)'; X.fillRect(m.x0 - 20, m.y0 - 200, m.x1 - m.x0 + 40, m.y1 - m.y0 + 240);
      const [bx] = s.at || [(m.act[0] + m.act[1]) / 2, 0]; X.globalAlpha = 0.28; X.fillStyle = MOON; X.beginPath(); X.moveTo(bx - 20, m.y0); X.lineTo(bx + 40, m.y0); X.lineTo(bx + 110, m.fl); X.lineTo(bx - 10, m.fl); X.closePath(); X.fill(); X.globalAlpha = 1;
    } else if (s.kind === 'SHUT') {
      X.fillStyle = 'rgba(34,29,24,0.94)'; X.fillRect(m.x0 - 20, m.y0 - 200, m.x1 - m.x0 + 40, m.y1 - m.y0 + 240);
      const dx = m.door; shape(R(dx - 18, m.fl - 92, 36, 92), { lw: 1.6, id: 61030 + r, fill: '#8a7d66', h: [Math.PI / 2, 4, 0.4] }); ball(dx + 10, m.fl - 46, 2.5, 61035 + r, null, 0.8, P.ink);
      mono('DOOR SHUT', (m.x0 + m.x1) / 2, (r === 4 ? 160 : (m.y0 + m.fl) / 2), 11, { col: '#b8ae98' });
    } else if (s.kind !== 'OPEN') { X.fillStyle = 'rgba(34,29,24,' + (s.dim ?? 0.72) + ')'; X.fillRect(m.x0 - 20, m.y0 - 200, m.x1 - m.x0 + 40, m.y1 - m.y0 + 240); }
    if (fire > 0) {
      X.globalAlpha = Math.min(0.55, fire * 0.55) * (0.75 + 0.25 * fl); X.fillStyle = FIRE; X.fillRect(m.x0 - 20, m.y0 - 200, m.x1 - m.x0 + 40, m.y1 - m.y0 + 240); X.globalAlpha = 1;
      const k = Math.ceil(fire * 6); for (let q = 0; q < k; q++) { const fx = m.x0 + 20 + hash(q, r + 70) * (m.x1 - m.x0 - 40); flame(fx, m.fl - 4, 14 + 26 * fire * (0.8 + 0.4 * hash(q, r + 71)), 61100 + r * 20 + q + (frozen ? 0 : (BOIL >> 1) % 3)); }
    }
    X.restore();
  }
  if (fire > 0.6) { X.globalAlpha = (fire - 0.6) * 1.2; for (let q = 0; q < 5; q++) ball(400 + q * 130 + Math.sin(lt + q) * 20, 40 - q * 6 - ((lt * 30) % 60), 30 + q * 6, 61200 + q, PAT.f, 1, '#6f6a61'); X.globalAlpha = 1; }
}

/* ---------- a flour sack ---------- */
const SACKSZ = { R: 1.0, O: 0.95, I: 0.92, B: 1.22 };
function sack(o) {
  const who = o.who, s = (o.s || 1) * (SACKSZ[who] || 1), id = 62000 + SK.indexOf(who) * 300 + (o.id || 0);
  X.save(); X.translate(o.x, o.y); X.globalAlpha = o.alpha ?? 1;
  if (o.dead) { X.translate(0, -2); X.rotate(-Math.PI / 2 * (o.f || 1)); }
  X.scale(s * (o.f || 1), s);
  const body = [[-24, 0], [24, 0], [27, -18], [22, -58], [11, -68], [-11, -68], [-22, -58], [-27, -18]];
  // feet
  if (!o.dead) for (const fx of [-11, 11]) { X.beginPath(); X.ellipse(fx + 3, -2, 8, 3.4, 0, Math.PI, 0); X.closePath(); X.fillStyle = P.ink; X.fill(); }
  shape(body, { lw: 1.6, id, fill: '#e4d6b4', h: [[0.6, 4.2, 0.35], [-0.6, 4.2, 0.35]] });
  // the gathered neck, the tie and the two ears
  shape([[-11, -68], [11, -68], [7, -74], [-7, -74]], { lw: 1.2, id: id + 1, fill: '#d8c8a2' });
  shape([[-7, -74], [-15, -86], [-4, -80]], { lw: 1.1, id: id + 2, fill: '#e4d6b4' }); shape([[7, -74], [15, -86], [4, -80]], { lw: 1.1, id: id + 3, fill: '#e4d6b4' });
  const tie = { R: P.ink, O: P.red, I: '#8a7d66', B: P.ink }[who];
  shape(R(-10, -73, 20, 4), { lw: 0.8, id: id + 4, fill: tie });
  if (who === 'R') { shape([[0, -71], [-10, -64], [-9, -76]], { lw: 0.8, id: id + 5, fill: P.ink }); shape([[0, -71], [10, -64], [9, -76]], { lw: 0.8, id: id + 6, fill: P.ink }); }
  // stencil
  txt(who === 'R' ? 'R' : who, 0, -22, 15, { mono: true, col: '#7e2c25' });
  // face
  const ex = 6 + (o.look || 0) * 2;
  if (o.dead) { for (const e of [-5, 7]) { line([ex + e - 3, -48], [ex + e + 3, -42], 1.2, id + 7 + e, 0.05); line([ex + e - 3, -42], [ex + e + 3, -48], 1.2, id + 9 + e, 0.05); } }
  else for (const e of [-6, 6]) { X.beginPath(); X.arc(ex + e, -46, 2.2, 0, 6.283); X.fillStyle = P.ink; X.fill(); if (o.glint) { X.beginPath(); X.arc(ex + e + 0.8, -46.8, 0.9, 0, 6.283); X.fillStyle = '#fffbe9'; X.fill(); } }
  // arms
  const reach = o.reach || 0, ty = o.armY ?? -34;
  if (!o.dead) for (const side of [-1, 1]) {
    const hx = side > 0 ? 30 + reach : -30, hy = side > 0 ? ty : -22;
    cap(side * 22, -40, hx, hy, 7, id + 20 + side);
    if (who === 'B') ball(hx, hy, 8, id + 30 + side, PAT.d, 1.4, P.ink); else ball(hx, hy, 4, id + 30 + side, PAT.f, 1);
  }
  if (o.prop && !o.dead) prop(o.prop, 30 + reach, ty, id + 40);
  // ropes and gag
  if (o.tied) { for (const yy of [-14, -34, -52]) ink([[-27, yy], [27, yy - 3]], 2.4, id + 50 + yy, 0.3, '#8a6e4e'); ink([[-16, -40], [20, -41]], 3, id + 60, 0.2, '#8a7d66'); }
  X.restore();
  if (o.spill) { X.fillStyle = P.paper; X.beginPath(); X.ellipse(o.x + (o.f || 1) * 40, o.y - 2, 30 * o.spill, 5 * o.spill, 0, 0, 6.283); X.fill(); }
}
function prop(k, x, y, id) {
  if (k === 'paper') { X.save(); X.translate(x + 4, y - 6); X.rotate(-0.2); shape(R(-7, -9, 14, 18), { lw: 0.9, id, fill: CARD }); X.restore(); }
  if (k === 'cloth') { shape([[x, y - 4], [x + 16, y - 8], [x + 18, y + 6], [x + 2, y + 8]], { lw: 0.9, id, fill: P.paper, h: [0.8, 2.5, 0.3] }); }
  if (k === 'knife') { line([x + 2, y], [x + 26, y - 6], 2.2, id, 0.05, '#c9c2b2'); line([x - 4, y + 1], [x + 3, y], 3, id + 1, 0.05); }
  if (k === 'gun') { shape([[x, y - 4], [x + 20, y - 4], [x + 20, y + 1], [x + 5, y + 1], [x + 4, y + 8], [x - 1, y + 8]], { lw: 0.9, id, fill: P.ink }); }
  if (k === 'rope') { ink([[x, y], [x + 10, y - 8], [x + 20, y], [x + 30, y - 8]], 2.2, id, 0.3, '#8a6e4e'); }
  if (k === 'cup') { shape([[x, y - 8], [x + 12, y - 8], [x + 10, y + 4], [x + 2, y + 4]], { lw: 0.9, id, fill: P.paper }); }
}
/* what a deed leaves */
function trace(t, id) {
  const { x, y, mat, found } = t;
  if (mat === 'paper') { X.save(); X.translate(x, y - 3); X.rotate(0.3); shape(R(-9, -3, 18, 6), { lw: 0.8, id, fill: CARD }); X.restore(); }
  if (mat === 'cloth') shape([[x - 9, y - 1], [x + 7, y - 4], [x + 10, y], [x - 6, y + 1]], { lw: 0.8, id, fill: '#d8c8a2', h: [0.8, 2, 0.3] });
  if (mat === 'flour') { X.fillStyle = P.paper; X.beginPath(); X.ellipse(x, y - 1, 18, 3.5, 0, 0, 6.283); X.fill(); for (let q = 0; q < 3; q++) { X.fillStyle = P.ink; X.fillRect(x + 22 + q * 10, y - 2, 4, 1.6); } }
  if (mat === 'rope') { for (let q = 0; q < 3; q++) { X.beginPath(); X.ellipse(x, y - 3 - q * 1.5, 10 - q * 2, 3, 0, 0, 6.283); X.lineWidth = 1.6; X.strokeStyle = '#8a6e4e'; X.stroke(); } }
  if (mat === 'ash') { X.fillStyle = 'rgba(80,72,62,.7)'; X.beginPath(); X.ellipse(x, y - 1, 14, 3, 0, 0, 6.283); X.fill(); }
  if (found) { X.save(); X.globalAlpha = found; X.beginPath(); X.ellipse(x, y - 3, 22, 9, 0, 0, 6.283); X.lineWidth = 1.6; X.strokeStyle = P.red; X.stroke(); X.restore(); }
}
function seeLine(from, to, u, id) { if (u <= 0) return; X.save(); X.setLineDash([3, 4]); X.globalAlpha = Math.min(1, u * 2); const p = [lerp(from[0], to[0], Math.min(1, u * 1.5)), lerp(from[1], to[1], Math.min(1, u * 1.5))]; ink([from, p], 1.2, id, 0.1, '#e3ad46'); X.restore(); }

/* ---------- the film's state, beat by beat (from the engine's log) ---------- */
const HOME = { R: 5, O: 1, I: 4, B: 2 };
const PROP = { BLACKMAIL: 'paper', DRUGGING: 'cup', KNIFING: 'knife', 'THREATENING WITH A GUN': 'gun', 'TYING AND GAGGING': 'rope', SLANDER: 'paper', SNOOPING: null, STRANGLING: 'rope' };
const FIRE_AT = LOG.findIndex((b) => b.l === 3);
const BEATS = (() => {
  const loc = { ...HOME }, dead = {}, tied = {}, out = [], traces = [];
  LOG.forEach((b, k) => {
    const a = SK[b.a], t = SK[b.b], w = SK.filter((_, x) => b.w >> x & 1);
    const before = { loc: { ...loc }, dead: { ...dead }, tied: { ...tied } };
    for (const s of [a, t, ...w]) loc[s] = b.r;
    const tr = { k, r: b.r, mat: b.mat, x: RM[b.r].act[1] + 30 + (k % 3) * 22, y: RM[b.r].fl };
    out.push({ ...b, A: a, T: t, Wt: w, before, after: { loc: { ...loc } }, traces: traces.map((x) => ({ ...x })), newTrace: tr });
    traces.push(tr);
    if (b.deed === 'KNIFING' || b.deed === 'STRANGLING') dead[t] = { r: b.r, x: RM[b.r].act[1] + 90 };
    if (b.deed === 'TYING AND GAGGING') tied[t] = 1;
  });
  return out;
})();
/* where each sack stands in beat k */
function placeAll(k, u, frozen) {
  const b = BEATS[k], res = [];
  const occupancy = {};
  for (const s of SK) {
    const dead = b.before.dead[s]; if (dead) { res.push({ who: s, x: dead.x, y: RM[dead.r].fl, dead: true, f: 1 }); continue; }
    const inBeat = s === b.A || s === b.T || b.Wt.includes(s); const r = inBeat ? b.r : b.before.loc[s]; const m = RM[r];
    let x; if (s === b.A) x = m.act[0]; else if (s === b.T) x = m.act[1]; else if (b.Wt.includes(s)) x = m.door + b.Wt.indexOf(s) * 44; else { occupancy[r] = (occupancy[r] || 0) + 1; x = (m.act[0] + m.act[1]) / 2 + (occupancy[r] - 1) * 60 - 40; if (r === b.r) x = m.door + 80; }
    const moved = inBeat && b.before.loc[s] !== r; const alpha = moved ? clamp(u * 6 - 0.4) : 1;
    res.push({ who: s, x, y: m.fl, f: s === b.T ? -1 : 1, tied: !!b.before.tied[s], alpha: frozen ? 1 : alpha, inBeat, r });
  }
  return res;
}
/* draw beat k at fraction u (0..1); frozen stops the action before it starts */
function drawBeat(lt, k, u, o = {}) {
  const b = BEATS[k], closed = BWD.log[k] && [2, 4, 7, 8].includes(k), act = o.frozen ? 0 : E.io(U(u, 0.18, 0.55));
  const fire = k < FIRE_AT ? 0 : Math.min(1, 0.32 + (k - FIRE_AT) * 0.2 + u * 0.18 + (o.after || 0));
  houseShell(lt);
  // traces already in the house
  for (const t of b.traces) trace({ ...t, found: b.found.includes(t.k) ? U(u, 0.05, 0.2) : 0 }, 63000 + t.k);
  if (act > 0.6 && !closed) trace({ ...b.newTrace, found: 0 }, 63100 + k);
  const pl = placeAll(k, u, o.frozen);
  const dying = (b.deed === 'KNIFING' || b.deed === 'STRANGLING') && !o.frozen ? U(u, 0.55, 0.7) : 0;
  for (const p of pl) {
    if (closed && p.r === b.r && p.inBeat) continue;
    const isA = p.who === b.A && p.inBeat, isT = p.who === b.T && p.inBeat;
    const learnt = b.learnt.includes(SK.indexOf(p.who)) && u > 0.55;
    const tiedNow = p.tied || (isT && b.deed === 'TYING AND GAGGING' && u > 0.6);
    sack({ ...p, tied: tiedNow, reach: isA ? 26 * act : 0, armY: isA ? -40 : -34, prop: isA ? PROP[b.deed] : null, dead: p.dead || (isT && dying > 0.5), spill: isT && dying > 0.5 ? dying : 0, glint: learnt, look: isA ? 0.6 : p.inBeat ? -0.6 : 0 });
  }
  if (!closed && b.light !== 'MOONLIGHT') for (const p of pl) if (b.learnt.includes(SK.indexOf(p.who)) && p.who !== b.A && !p.dead) { const a = pl.find((q) => q.who === b.A); seeLine([p.x + 6, p.y - 50 * SACKSZ[p.who]], [a.x + 6, a.y - 50 * SACKSZ[a.who]], U(u, 0.5, 0.75), 63200 + SK.indexOf(p.who)); }
  if (b.deed === 'THREATENING WITH A GUN' && act > 0.9) { X.globalAlpha = 0.5 * (1 - U(u, 0.55, 0.8)); ball(RM[b.r].act[0] + 70, RM[b.r].fl - 42, 14, 63300, PAT.f, 1, '#9c968b'); X.globalAlpha = 1; }
  // light, after the people, so the dark covers them
  const Ls = {}; const kind = closed ? 'SHUT' : b.light === 'FIRE' ? 'OPEN' : b.light;
  Ls[b.r] = { kind, at: [(RM[b.r].act[0] + RM[b.r].act[1]) / 2 + 10, RM[b.r].fl - 80], u: o.frozen ? 1 : clamp(u * 8) };
  lights(lt, Ls, fire, o.frozen);
  // glints over the dark, for the ones who learn
  if (!closed) for (const p of pl) if (b.learnt.includes(SK.indexOf(p.who)) && u > 0.55 && !p.dead) { const s = SACKSZ[p.who]; X.fillStyle = '#fffbe9'; for (const e of [0, 12]) { X.beginPath(); X.arc(p.x + (p.f || 1) * (e + 0.8) * s, p.y - 46.8 * s, 1.3, 0, 6.283); X.fill(); } }
}
/* the ledger card in the box room */
function ledger(k, u, o = {}) {
  const b = BEATS[k], closed = [2, 4, 7, 8].includes(k);
  X.save(); X.translate(BOX.x0 + 14, BOX.y0 + 12); X.rotate(0.01);
  shape(R(0, 0, 332, 130), { lw: 1.4, id: 64000, fill: CARD }); tack(166, 6, 64001);
  mono(`DEED ${k + 1} OF 12`, 14, 22, 10, { align: 'left', col: P.red });
  const rows = closed ? ['BEHIND A SHUT DOOR', '', `ROOM   ${b.room}`, `LIGHT  ${b.light}`, 'SEEN BY  NOBODY'] :
    [b.deed, `${SN[b.A].toUpperCase()} TO ${SN[b.T].toUpperCase()}`, `LEFT   ${b.mat.toUpperCase()}     ROOM   ${b.room}`, `LIGHT  ${b.light}`, `SEEN BY  ${b.light === 'FIRE' ? 'THE WHOLE HOUSE' : b.light === 'MOONLIGHT' ? 'NOBODY' : b.Wt.length ? b.Wt.map((x) => SN[x].toUpperCase()).join(', ') : 'NOBODY'}`];
  const n = o.reveal ?? 5;
  rows.forEach((r, i) => { if (i < n) mono(r, 14, 40 + i * 16, i === 0 ? 11 : 9.4, { align: 'left', col: P.ink }); });
  if (b.found.length && u > 0.1) mono(`FOUND  ${b.found.map((f) => BEATS[f].mat.toUpperCase() + ' (' + (f + 1) + ')').join(', ')}`, 14, 120, 8.4, { align: 'left', col: P.red });
  X.restore();
}
function deedBox(k) { X.save(); X.fillStyle = P.paper; X.globalAlpha = 0.92; X.fillRect(PX0 + 10, PY0 + 10, 108, 34); X.globalAlpha = 1; X.strokeStyle = P.ink; X.lineWidth = 1; X.strokeRect(PX0 + 10, PY0 + 10, 108, 34); txt(`${k + 1} / 12`, PX0 + 64, PY0 + 25, 17, { mono: true, col: P.red }); mono(k >= FIRE_AT ? 'THE FIRE HAS STARTED' : 'NO FIRE YET', PX0 + 64, PY0 + 39, 6.6, { col: P.ink }); X.restore(); }

/* ---------- paper sheets for the diagrams ---------- */
function sheet(x, y, w, h, id = 65000) { X.fillStyle = '#d9cfb4'; X.fillRect(-600, -600, 2600, 2000); shape(R(x, y, w, h), { lw: 1.6, id, fill: CARD }); }
const COL = (s, x, y, sz, col = P.ink, align = 'left') => mono(s, x, y, sz, { col, align });

/* ================= shots ================= */
SHOTS.title = (lt, sd, sh) => {
  const pr = cue(sh, 'print'), nm = cue(sh, 'name'), u = U(lt, pr.at, pr.to);
  const c = camFor(lt, [[0, ON(640, 300, 1.35)], [pr.at + 2, ON(640, 360, 1.0), 5.5]]);
  cam(c, () => {
    X.fillStyle = '#d9cfb4'; X.fillRect(-600, -600, 2600, 2000);
    const x = 240, y = 30, w = 800, h = 660; shape(R(x, y, w, h), { lw: 1.6, id: 66000, fill: CARD });
    for (let k = 0; k < 40; k++) { X.fillStyle = P.ink; X.beginPath(); X.arc(x + 14, y + 12 + k * 16.4, 3.2, 0, 6.283); X.fill(); X.beginPath(); X.arc(x + w - 14, y + 12 + k * 16.4, 3.2, 0, 6.283); X.fill(); }
    const rows = []; BEATS.forEach((b, k) => { const closed = [2, 4, 7, 8].includes(k); rows.push(closed ? `${String(k + 1).padStart(2)}  A SHUT DOOR` : `${String(k + 1).padStart(2)}  ${b.deed}`, closed ? `    ${b.room} / ${b.light}` : `    ${b.mat.toUpperCase()} / ${b.room} / ${b.light} / ${b.light === 'FIRE' ? 'ALL' : b.Wt.map((s) => SK.indexOf(s) >= 0 ? SN[s].toUpperCase() : s).join(' ') || 'NOBODY'}`); });
    const n = Math.floor(rows.length * u);
    rows.slice(0, n).forEach((r, i) => mono(r, x + 70, y + 40 + i * 25.5, 13.2, { align: 'left', col: i % 2 ? '#5d564b' : P.ink }));
    if (u > 0 && u < 1) { X.fillStyle = P.ink; X.fillRect(x + 70 + ((GT * 700) % 560), y + 40 + n * 25.5 - 6, 10, 3); }
  });
  if (lt > nm.at) { X.globalAlpha = U(lt, nm.at, nm.at + 1); shape(R(300, 270, 680, 150), { lw: 1.6, id: 66100, fill: P.paper }); txt('BY WHAT LIGHT', 640, 318, 44, {}); txt('a ledger for the Abominable House: room, light, witness, and an exact count', 640, 362, 17, { italic: true }); txt('after Italo Calvino', 640, 392, 15, { italic: true }); X.globalAlpha = 1; }
};

SHOTS.old = (lt, sd, sh) => {
  const L = sh.lines, ro = cue(sh, 'roll'), rn = cue(sh, 'run'), th = cue(sh, 'three');
  let c = camFor(lt, [[0, WIDE], [ro.at - 0.4, ON(452, 200, 2.0), 1.0], [rn.at - 0.2, ON(452, 360, 1.45), 1.0], [th.at, BOARDCAM, 1.0]]);
  c = withTight(sh, lt, c, 452, 400, 2.0);
  const runs = Math.floor(1000000 * E.out(U(lt, rn.at, rn.to)));
  cam(c, () => {
    lab(sh, lt, { ctr: { val: lt > ro.at ? '8916100448256' : '', u: U(lt, ro.at, ro.to), label: 'WHO TO WHOM', people: 4, pairs: 12, spoken: lt > ro.to ? 'EIGHT POINT NINE TRILLION' : '' }, board: () => {
      if (lt > rn.at) { COL('FILMS RUN', PG.x + 24, PG.y + 26, 10); txt(fmt(String(runs)), PG.x + PG.w - 24, PG.y + 26, 18, { mono: true, align: 'right', col: P.red }); }
      if (lt > th.at) BWD.top.forEach((t, i) => { const u = U(lt, th.at + i * 0.4, th.at + i * 0.4 + 0.5); X.globalAlpha = u; const x = PG.x + 14 + i * 120, y = PG.y + 60;
        shape(R(x, y, 110, 300), { lw: 1.2, id: 66200 + i, fill: CARD }); tack(x + 55, y + 6, 66210 + i);
        COL(`BEST ${i + 1}`, x + 55, y + 22, 9, P.red, 'center');
        t.open.forEach((o, k) => { COL(`${k + 1} ${o[1]}>${o[2]}`, x + 10, y + 46 + k * 40, 10); COL(o[3], x + 10, y + 60 + k * 40, 7.4); });
        COL(`SCORE ${t.sc}`, x + 10, y + 186, 9); COL(`SOLVED ${t.q.solved}`, x + 10, y + 206, 9, lt > L[3].t0 + 2.5 ? P.red : P.ink); COL(`ROOMS ${t.q.rooms}`, x + 10, y + 226, 9, lt > L[3].t0 + 3.6 ? P.red : P.ink); COL(`SEEN ${t.q.vis}`, x + 10, y + 246, 9);
        X.globalAlpha = 1; });
    } });
    programmer(lt, { mouth: sayAt(sh, 'W', lt) * 0.8, look: lt > rn.at ? -0.6 : 0 });
  });
};

SHOTS.quatrain = (lt, sd, sh) => {
  const L = sh.lines, mt = cue(sh, 'mat'), rm = cue(sh, 'room'), li = cue(sh, 'light'), wh = cue(sh, 'who'), pl = cue(sh, 'play');
  const u = U(lt, pl.at, L[1].t1 + 0.6);
  let c = camFor(lt, [[0, ON(640, 360, 1.0)], [pl.at, ON(600, 230, 1.6), 1.0], [L[2].t0 - 0.2, ON(640, 360, 1.0), 1.0]]);
  c = withTight(sh, lt, c, 560, 190, 2.4);
  cam(c, () => {
    drawBeat(lt, 0, lt < pl.at ? 0 : u, { frozen: lt < pl.at });
    const rev = lt < mt.at ? 1 : lt < rm.at ? 3 : lt < li.at ? 3 : lt < wh.at ? 4 : 5;
    ledger(0, u, { reveal: lt < mt.at ? 2 : rev });
    if (lt < pl.at) { // labels for the four new parts
      const tags = [[mt, 'WHAT IT LEAVES', 900, 314], [rm, 'WHICH ROOM', 900, 331], [li, 'WHAT LIGHT', 900, 348], [wh, 'WHO ELSE', 900, 365]];
      for (const [cc, s, x, y] of tags) if (lt > cc.at) { X.globalAlpha = U(lt, cc.at, cc.at + 0.4); COL('<- ' + s, x + 170, y, 8, P.red); X.globalAlpha = 1; }
    }
  });
};

/* the rules, shown in the house */
SHOTS.rules = (lt, sd, sh) => {
  const Q = (k) => cue(sh, k).at, now = ['dead', 'tied', 'light', 'moon', 'door', 'trace', 'find', 'fire', 'strand'].filter((k) => lt >= Q(k)).pop() || 'dead';
  const RULE = { dead: 'A DEAD SACK DOES NOTHING. NOTHING MORE IS DONE TO IT.', tied: 'A TIED SACK CANNOT ACT.', light: 'CANDLE OR LAMP: EVERYONE IN THE ROOM SEES.', moon: 'MOONLIGHT: NOBODY SEES, NOT EVEN THE ONE IT WAS DONE TO.', door: 'FOUR DEEDS HAPPEN BEHIND A SHUT DOOR. NOBODY SEES THEM.', trace: 'EVERY DEED LEAVES PAPER, CLOTH, FLOUR, ROPE OR ASH.', find: 'THE NEXT SACK IN WITH A LIGHT FINDS IT.', fire: 'AFTER DEED 6 THE HOUSE CAN CATCH FIRE. THEN THE FIRE LIGHTS EVERY DEED.', strand: 'A SACK THAT HAS ACTED ACTS AGAIN ONLY AGAINST ONE IT KNOWS IS GUILTY.' };
  const fire = lt > Q('fire') ? E.io(U(lt, Q('fire'), Q('fire') + 5)) : 0;
  let c = camFor(lt, [[0, ON(640, 360, 1.0)], [Q('dead'), ON(330, 480, 1.9), 0.8], [Q('tied'), ON(950, 480, 1.9), 0.8], [Q('light'), ON(330, 320, 1.9), 0.8], [Q('moon'), ON(640, 175, 1.8), 0.8], [Q('door'), ON(640, 610, 1.7), 0.8], [Q('trace'), ON(330, 320, 1.9), 0.8], [Q('fire'), ON(640, 360, 1.0), 1.4]]);
  c = withTight(sh, lt, c, 950, 315, 2.4);
  cam(c, () => {
    houseShell(lt);
    // kitchen: Inigo dead on the floor
    sack({ who: 'I', x: 320, y: 560, dead: true, spill: 1 });
    // front room: Belindo tied
    sack({ who: 'B', x: 960, y: 560, tied: true, look: Math.sin(lt * 2) * 0.5 });
    // bedroom: the widow does it to Ogiva; first by lamp (Ogiva and the witness see) then the trace is left and found
    const bedPhase = lt < Q('trace') ? 'lamp' : 'trace';
    if (bedPhase === 'lamp') { const u = U(lt, Q('light'), Q('light') + 2.4);
      sack({ who: 'R', x: 250, y: 390, reach: 26 * E.io(clamp(u * 2)), prop: 'paper', armY: -40, look: 0.6 }); sack({ who: 'O', x: 340, y: 390, f: -1, glint: u > 0.6 }); }
    else { const fu = U(lt, Q('find'), Q('find') + 1.4); trace({ x: 300, y: 390, mat: 'paper', found: fu }, 67010); if (lt > Q('find')) sack({ who: 'O', x: lerp(470, 360, E.io(fu)), y: 390, f: -1, glint: fu > 0.8, look: -0.6 }); }
    // attic: by moonlight, Belindo... no: Ogiva and the widow; nobody sees
    sack({ who: 'O', x: 520, y: 230, reach: 20, prop: 'cloth', look: 0.6, id: 5 }); sack({ who: 'R', x: 600, y: 230, f: -1, id: 5 });
    const Ls = { 0: { kind: lt > Q('door') ? 'SHUT' : 'DARK' }, 1: { kind: lt > Q('dead') ? 'CANDLE' : 'DARK', at: [280, 490] }, 2: { kind: lt > Q('tied') ? 'CANDLE' : 'DARK', at: [1000, 490] }, 3: { kind: 'DARK' }, 4: { kind: lt > Q('moon') ? 'MOONLIGHT' : 'DARK', at: [540, 0] }, 5: { kind: lt > Q('light') && lt < Q('trace') ? 'LAMP' : lt > Q('find') ? 'CANDLE' : 'DARK', at: bedPhase === 'lamp' ? [300, 310] : [lerp(470, 360, U(lt, Q('find'), Q('find') + 1.4)), 320] } };
    if (lt > Q('light') && lt < Q('trace')) { sack({ who: 'I', x: 470, y: 390, glint: true, alpha: 0 }); }
    lights(lt, Ls, fire);
    if (bedPhase === 'lamp' && lt > Q('light') + 1.4) { X.fillStyle = '#fffbe9'; X.beginPath(); X.arc(340 - 6, 343, 1.2, 0, 6.283); X.fill(); seeLine([334, 343], [256, 343], U(lt, Q('light') + 1.4, Q('light') + 2.4), 67020); }
    // the rule on the box-room card
    X.save(); X.translate(BOX.x0 + 14, BOX.y0 + 12); shape(R(0, 0, 332, 126), { lw: 1.4, id: 67100, fill: CARD }); tack(166, 6, 67101);
    COL('THE RULES', 14, 22, 10, P.red);
    const words = RULE[now].split(' '); let line_ = '', yy = 50; for (const w of words) { if ((line_ + ' ' + w).length > 34) { COL(line_.trim(), 14, yy, 10.4); yy += 20; line_ = ''; } line_ += ' ' + w; } COL(line_.trim(), 14, yy, 10.4);
    X.restore();
  });
};

/* rows and columns */
SHOTS.strands = (lt, sd, sh) => {
  const g = cue(sh, 'grid'), br = cue(sh, 'break'), st = cue(sh, 'stat'), ex = BWD.example;
  let c = camFor(lt, [[0, ON(640, 360, 1.0)], [br.at - 0.3, ON(560, 330, 1.35), 1.0], [st.at, ON(640, 360, 1.0), 1.0]]);
  c = withTight(sh, lt, c, 640, 330, 1.25);
  cam(c, () => {
    sheet(160, 50, 960, 620);
    const x0 = 320, y0 = 120, cw = 150, rh = 40;
    COL('DEED', 210, y0 - 20, 11); SK.forEach((s, j) => COL(SN[s].toUpperCase(), x0 + j * cw + cw / 2, y0 - 20, 11, P.ink, 'center'));
    for (let k = 0; k < 12; k++) { COL(String(k + 1), 230, y0 + 20 + k * rh, 12, P.ink, 'center'); line([200, y0 + k * rh], [x0 + 4 * cw, y0 + k * rh], 0.6, 68000 + k, 0.05); }
    for (let j = 0; j <= 4; j++) line([x0 + j * cw, y0 - 6], [x0 + j * cw, y0 + 12 * rh], 0.8, 68020 + j, 0.05);
    const PA = [[0, 1], [0, 2], [0, 3], [1, 0], [1, 2], [1, 3], [2, 0], [2, 1], [2, 3], [3, 0], [3, 1], [3, 2]];
    const n = Math.min(ex.pis.length, Math.floor(1 + U(lt, g.at, br.at - 0.2) * (ex.pis.length - 1) + 0.001) + (lt > br.at ? 1 : 0));
    for (let k = 0; k < n; k++) { const [a, b] = PA[ex.pis[k]]; const bad = k === ex.k;
      COL(`TO ${SK[b]}`, x0 + a * cw + 20, y0 + 20 + k * rh, 12, bad ? P.red : P.ink); COL(`FROM ${SK[a]}`, x0 + b * cw + 20, y0 + 20 + k * rh, 12, '#5d564b');
      if (bad) { X.save(); X.strokeStyle = P.red; X.lineWidth = 2.2; X.strokeRect(x0 + a * cw + 6, y0 + k * rh + 4, cw - 12, rh - 8); X.restore(); }
    }
    if (lt > br.at + 0.8) { const a = ex.a; X.save(); X.globalAlpha = 0.18; X.fillStyle = P.red; X.fillRect(x0 + a * cw, y0, cw, ex.k * rh + rh); X.restore(); COL('ACTED ALREADY.', x0 + a * cw + 10, y0 + (ex.k + 1) * rh + 22, 10, P.red); COL('NOTHING FROM INIGO.', x0 + a * cw + 10, y0 + (ex.k + 1) * rh + 38, 10, P.red); }
    if (lt > st.at) { X.globalAlpha = U(lt, st.at, st.at + 0.6); shape(R(560, 470, 520, 150), { lw: 1.4, id: 68100, fill: P.paper }); COL('200,000 WHO-TO-WHOM FILMS AT RANDOM', 580, 500, 11); COL('FIRST FAILURE', 580, 526, 11);
      const w = BWD.why, tot = w.dead + w.tied + w.strand; [['A SACK WITH NO REASON', w.strand], ['A DEAD SACK', w.dead], ['A TIED SACK', w.tied]].forEach(([s, v], i) => { COL(s, 580, 556 + i * 20, 10, i === 0 ? P.red : P.ink); COL(fmt(String(v)), 1060, 556 + i * 20, 10, i === 0 ? P.red : P.ink, 'right'); }); X.globalAlpha = 1; void tot; }
  });
};

SHOTS.count = (lt, sd, sh) => {
  const L = sh.lines, rw = cue(sh, 'raw'), fc = cue(sh, 'factor'), stt = cue(sh, 'state'), dp = cue(sh, 'dp'), ck = cue(sh, 'check');
  let c = camFor(lt, [[0, ON(640, 360, 1.0)], [rw.at, ON(640, 150, 1.5), 0.8], [stt.at, ON(640, 250, 1.4), 0.8], [dp.at, ON(640, 380, 1.0), 1.0], [L[4].t0, ON(900, 560, 1.6), 0.8], [ck.at, ON(640, 360, 1.0), 0.8]]);
  c = withTight(sh, lt, c, 640, 610, 1.2);
  cam(c, () => {
    sheet(110, 40, 1060, 640);
    if (lt > rw.at) { COL('EVERY CHOICE, NO RULES', 140, 92, 11); COL('(12 PAIRS x 6 ROOMS x 4 LIGHTS x 4 WITNESS SETS) ^ 12', 140, 112, 9, '#5d564b'); txt(fmt(BWD.framesRaw), 1140, 150, 19, { mono: true, align: 'right', col: P.ink }); }
    if (lt > fc.at) { X.globalAlpha = U(lt, fc.at, fc.at + 0.6); COL('THE ROOM: x 6 AT EACH DEED, THEN FORGOTTEN (x 4 FOR A SHUT DOOR)', 140, 186, 10, P.red); X.globalAlpha = 1; }
    if (lt > stt.at) { const parts = ['ALIVE', 'TIED', 'FIRE', 'ACTED', 'WHO KNOWS WHOM']; const bits = [4, 4, 1, 4, 12];
      let x = 140; parts.forEach((p, i) => { const u = U(lt, stt.at + i * 0.9, stt.at + i * 0.9 + 0.5); X.globalAlpha = u; COL(p, x, 220, 9); for (let q = 0; q < bits[i]; q++) shape(R(x + q * 13, 232, 10, 10), { lw: 0.9, id: 69000 + i * 20 + q, fill: hash(q, i) > 0.5 ? P.ink : P.paper }); x += Math.max(80, bits[i] * 13 + 24); X.globalAlpha = 1; }); }
    if (lt > dp.at) { const nR = Math.floor(12 * U(lt, dp.at, dp.to - 2.5)) + 1; COL('DEED', 140, 280, 10); COL('CASES', 420, 280, 10, P.ink, 'right'); COL('FILMS SO FAR', 1140, 280, 10, P.ink, 'right');
      BWD.perBeat.slice(0, Math.min(12, nR)).forEach((p, k) => { const y = 302 + k * 24; COL(String(k + 1), 150, y, 11); COL(fmt(String(p.states)), 420, y, 11, P.ink, 'right'); txt(fmt(p.films), 1140, y, 13, { mono: true, align: 'right', col: k === 11 ? P.red : P.ink }); }); }
    if (lt > ck.at) { X.globalAlpha = U(lt, ck.at, ck.at + 0.6); shape(R(130, 596, 1020, 70), { lw: 1.4, id: 69100, fill: P.paper }); const ckd = BWD.check['3'];
      COL('FIRST THREE DEEDS', 150, 616, 10); COL(`LISTED ONE BY ONE   ${fmt(ckd.brute)}   OF ${fmt(ckd.raw)}`, 150, 636, 10); COL(`COUNTED            ${fmt(ckd.dp)}`, 150, 654, 10, lt > L[6].t0 ? P.red : P.ink); X.globalAlpha = 1; }
  });
};

SHOTS.tzero = (lt, sd, sh) => {
  const L = sh.lines, fz = cue(sh, 'freeze'), fn = cue(sh, 'fan'), cr = cue(sh, 'cross'), hf = cue(sh, 'half'), ch = cue(sh, 'chosen');
  const PA = [[0, 1], [0, 2], [0, 3], [1, 0], [1, 2], [1, 3], [2, 0], [2, 1], [2, 3], [3, 0], [3, 1], [3, 2]];
  const frozen = lt > fz.at, u = frozen ? 0 : U(lt, 0, fz.at) * 0.12;
  cam(camFor(lt, [[0, ON(640, 560, 1.3)], [fz.at, ON(640, 360, 1.0), 0.8]]), () => {
    drawBeat(frozen ? 0 : lt, 3, u, { frozen: true });
    if (lt > fn.at) { X.globalAlpha = 0.6 * U(lt, fn.at, fn.at + 0.6); X.fillStyle = NIGHT; X.fillRect(-600, -600, 2600, 2000); X.globalAlpha = 1; }
  });
  if (frozen) { X.fillStyle = P.paper; X.fillRect(PX0 + 10, PY0 + 10, 210, 34); X.strokeStyle = P.ink; X.strokeRect(PX0 + 10, PY0 + 10, 210, 34); txt('STOPPED BEFORE DEED 4', PX0 + 115, PY0 + 27, 12, { mono: true, col: P.red }); }
  if (lt > fn.at) {
    const f = BWD.fan;
    PA.forEach(([a, b], i) => { const u = U(lt, fn.at + i * 0.18, fn.at + i * 0.18 + 0.4); if (u <= 0) return; const col = i % 6, row = Math.floor(i / 6);
      const x = 116 + col * 178, y = 150 + row * 250, p = f.p[i]; X.save(); X.globalAlpha = u; X.translate(x + 74, y + 100); X.scale(0.6 + 0.4 * E.out(u), 0.6 + 0.4 * E.out(u)); X.translate(-x - 74, -y - 100);
      const hot = lt > hf.at && i === 3, mine = lt > ch.at && i === f.chosen;
      shape(R(x, y, 150, 210), { lw: hot || mine ? 2.4 : 1.2, id: 70000 + i, fill: CARD, col: mine ? P.red : P.ink });
      sack({ who: SK[a], x: x + 46, y: y + 120, s: 0.85, reach: 14, prop: 'knife', armY: -40, look: 0.6, id: 100 + i }); sack({ who: SK[b], x: x + 108, y: y + 120, s: 0.85, f: -1, id: 120 + i });
      COL(`${SN[SK[a]].toUpperCase()}`, x + 10, y + 142, 8.6); COL(`KNIFES ${SN[SK[b]].toUpperCase()}`, x + 10, y + 156, 8.6);
      shape(R(x + 10, y + 172, 130, 10), { lw: 0.8, id: 70100 + i, fill: P.paper }); if (p > 0) { X.fillStyle = hot ? P.red : P.ink; X.fillRect(x + 11, y + 173, 128 * p, 8); }
      COL(p > 0 ? (p * 100).toFixed(1) + ' %' : '0', x + 140, y + 198, 10, mine || hot ? P.red : P.ink, 'right');
      if (p === 0 && lt > cr.at) { line([x + 6, y + 6], [x + 144, y + 204], 2.2, 70200 + i, 0.2, P.red); line([x + 144, y + 6], [x + 6, y + 204], 2.2, 70220 + i, 0.2, P.red); }
      X.restore(); });
  }
};

SHOTS.memos = (lt, sd, sh) => {
  const ax = cue(sh, 'axes'), fl = cue(sh, 'fill'), tp = cue(sh, 'top'), pk = cue(sh, 'pick');
  const cells = Object.keys(BWD.grid).sort((a, b) => hash(a.length, a.charCodeAt(0) * 7 + a.charCodeAt(2) * 3 + a.charCodeAt(4)) - hash(b.length, b.charCodeAt(0) * 7 + b.charCodeAt(2) * 3 + b.charCodeAt(4)));
  const shown = new Set(cells.slice(0, Math.floor(cells.length * U(lt, fl.at, fl.to))));
  let c = camFor(lt, [[0, ON(640, 360, 1.0)], [pk.at, ON(1000, 300, 1.6), 1.0]]);
  c = withTight(sh, lt, c, 1060, 270, 2.0);
  cam(c, () => {
    sheet(80, 60, 1120, 600);
    const cs = 52, gx = (v) => 130 + v * 272, gy = 210;
    const SOL = ['0-3', '4-6', '7-9', '10-12'], ROO = ['1-2', '3', '4', '5-6'], VIS = ['0-2', '3-4', '5-6', '7-12'];
    for (let v = 0; v < 4; v++) {
      const x0 = gx(v); COL(`SEEN BY A WITNESS ${VIS[v]}`, x0, gy - 60, 9.4, lt > ax.at + 4 ? P.ink : '#5d564b');
      for (let e = 0; e < 4; e++) { COL(SOL[e], x0 + e * cs + cs / 2, gy - 24, 8.4, P.ink, 'center'); }
      for (let m = 0; m < 4; m++) COL(ROO[m], x0 - 8, gy + m * cs + cs / 2, 8.4, P.ink, 'right');
      for (let e = 0; e < 4; e++) for (let m = 0; m < 4; m++) { const key = `${e},${m},${v}`, x = x0 + e * cs, y = gy + m * cs; const g = BWD.grid[key];
        shape(R(x, y, cs - 4, cs - 4), { lw: 1, id: 71000 + v * 16 + e * 4 + m, fill: g && shown.has(key) ? '#d9cfb4' : P.paper, h: g && shown.has(key) ? [0.8, 6 - g.answered * 0.35, 0.5] : undefined });
        if (lt > tp.at && BWD.topCells.includes(key)) { const n = BWD.topCells.filter((q) => q === key).length; for (let q = 0; q < n; q++) { X.beginPath(); X.arc(x + 14 + q * 14, y + 14, 5, 0, 6.283); X.fillStyle = P.red; X.fill(); } }
        if (lt > pk.at && key === BWD.cell) { X.save(); X.strokeStyle = P.red; X.lineWidth = 3; X.strokeRect(x - 4, y - 4, cs + 4, cs + 4); X.restore(); COL('RED SQUARE: CELLAR AND ATTIC ONLY, ALL 12 SOLVED', 1150, 170, 10, P.red, 'right'); }
      }
    }
    if (lt > ax.at) { COL('ACROSS: DEEDS SOLVED', 130, 120, 11); COL('DOWN: ROOMS USED', 130, 140, 11); COL('DEEP: DEEDS SEEN BY A WITNESS', 130, 160, 11); }
    if (lt > fl.at) COL(`SQUARES FILLED  ${shown.size} OF 64`, 1150, 140, 12, P.red, 'right');
  });
};

SHOTS.film = (lt, sd, sh) => {
  const L = sh.lines; let k = 0; for (let i = 0; i < 12; i++) if (lt >= L[i].t0 - 0.9) k = i;
  const a = L[k].t0 - 0.9, b = k < 11 ? L[k + 1].t0 - 0.9 : L[12].t0 - 0.4, end = lt > L[12].t0 - 0.4;
  const u = end ? 1 : U(lt, a, b), m = RM[BEATS[k].r], [rx, ry] = roomCenter(BEATS[k].r);
  let c = end ? camFor(lt - L[12].t0 + 0.4, [[0, ON(640, 360, 1.0)], [0.8, ON(560, 180, 1.7), 2.4]]) : blendCam(ON(640, 360, 1.0), ON(lerp(640, rx, 0.25), lerp(360, ry, 0.25), 1.12), E.io(U(lt, a, a + 1.2)) * (1 - E.io(U(lt, b - 0.8, b))));
  cam(c, () => { drawBeat(lt, k, u, { after: end ? U(lt, L[12].t0 - 0.4, sd) * 0.6 : 0 }); ledger(k, u); });
  deedBox(k); void m;
};

SHOTS.end = (lt, sd, sh) => {
  cam(ON(640, 360, 1.0), () => { drawBeat(lt, 11, 1, { after: 0.6 }); });
  X.globalAlpha = seg(lt, 1.0, 2.2);
  shape(R(160, 220, 960, 300), { lw: 1.6, id: 72000, fill: P.paper });
  txt('BY WHAT LIGHT', 640, 262, 30, {});
  txt('after Italo Calvino, The Burning of the Abominable House, in Numbers in the Dark, translated by Tim Parks;', 640, 306, 14, { italic: true });
  txt('the four slots of Alison Knowles and James Tenney’s The House of Dust (1967); Calvino’s t zero,', 640, 330, 14, { italic: true });
  txt('The Castle of Crossed Destinies and Six Memos for the Next Millennium; the MAP-Elites grid', 640, 354, 14, { italic: true });
  txt('of Jean-Baptiste Mouret and Jeff Clune (2015); and Richard Bellman’s dynamic programming.', 640, 378, 14, { italic: true });
  txt('Every number in the film was computed by its own engine. Nothing is quoted.', 640, 418, 14, { italic: true });
  txt('The four deeds behind a shut door are never named or shown.', 640, 442, 14, { italic: true });
  X.globalAlpha = 1; void sh; void sd;
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
  const fade = sh.shot === 'title' ? Math.max(1 - seg(lt, 0, 0.6), seg(lt, sd - 0.7, sd)) : sh.shot === 'end' ? Math.max(1 - seg(lt, 0, 0.5), seg(lt, sd - 1.2, sd)) : Math.max(1 - seg(lt, 0, 0.4), seg(lt, sd - 0.3, sd));
  if (fade > 0) { X.fillStyle = P.paper; X.globalAlpha = fade; X.fillRect(0, 0, W, H); X.globalAlpha = 1; }
  border();
};
(async () => {
  T = await (await fetch('timing/bw.json')).json();
  await document.fonts.ready; await Promise.all(['IM Fell English', 'IBM Plex Mono'].map((n) => document.fonts.load(`20px "${n}"`))); await document.fonts.load(`italic 20px "IM Fell English"`);
  await document.fonts.load('600 10px "IBM Plex Mono"');
  X = document.getElementById('film').getContext('2d');
  window.__NF = Math.ceil(T.dur * 24); window.__T = T; window.__ready = true;
})();
