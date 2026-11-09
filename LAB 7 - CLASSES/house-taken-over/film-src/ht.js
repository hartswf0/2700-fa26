/* House Taken Over: drawing. The study and engraving helpers are from ah.js (The Burning of the Abominable House); the jointed puppet is from hi.js (The House Is Occupied). Part of The House That Language Built. */
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

/* ---------- people: the jointed puppet from The House Is Occupied (hi.js), with a hook for new heads ---------- */
const HEADX = {};
/* ---------- people: a jointed puppet in the films' inked style ---------- */
/* Pose skeletons, in local coordinates facing right (+x is forward), feet on y = 0. */
const POSES = {
  stand: { hip: [0, -96], k1: [5, -50], f1: [7, 0], k2: [-3, -50], f2: [-6, 0], neck: [0, -168], head: [3, -190] },
  sit: { hip: [0, -84], k1: [38, -86], f1: [40, 0], k2: [32, -84], f2: [34, 0], neck: [-6, -156], head: [-3, -178] },
  kneel: { hip: [-4, -66], k1: [30, -54], f1: [32, 0], k2: [-6, -4], f2: [-46, -4], neck: [4, -136], head: [8, -158] },
  kneel2: { hip: [-12, -52], k1: [14, -4], f1: [-32, -2], k2: [6, -4], f2: [-36, -2], neck: [6, -120], head: [12, -141] },
  crawl: { hip: [-58, -26], k1: [-94, -6], f1: [-134, -6], k2: [-98, -8], f2: [-138, -8], neck: [16, -42], head: [38, -48] },
  flat: { hip: [-62, -12], k1: [-104, -8], f1: [-146, -6], k2: [-106, -10], f2: [-148, -8], neck: [10, -16], head: [32, -22] },
  stoop: { hip: [0, -92], k1: [12, -48], f1: [8, 0], k2: [2, -48], f2: [-6, 0], neck: [44, -144], head: [64, -156] },
};
function walkPose(ph) {
  const p = JSON.parse(JSON.stringify(POSES.stand)), sw = Math.sin(ph) * 16, lift = (q) => Math.max(0, Math.cos(q)) * 7;
  p.f1 = [7 + sw, -lift(ph)]; p.k1 = [5 + sw * 0.5 + 4, -50 - lift(ph) * 0.5];
  p.f2 = [-6 - sw, -lift(ph + Math.PI)]; p.k2 = [-3 - sw * 0.5 + 4, -50 - lift(ph + Math.PI) * 0.5];
  p.hip[1] += Math.abs(Math.cos(ph)) * 2; p.neck[1] += Math.abs(Math.cos(ph)) * 2; p.head[1] += Math.abs(Math.cos(ph)) * 2;
  return p;
}
function skel(o) {
  const p = o.pose === 'walk' ? walkPose(o.ph || 0) : JSON.parse(JSON.stringify(POSES[o.pose || 'stand']));
  if (o.kind === 'O') { p.head[1] -= 8; }
  if (o.kind === 'B') { p.neck[1] += 2; }
  return p;
}
let KIT = { W: { lw: 12, coat: 'cardigan' }, K: { lw: 12, coat: 'coat' }, R: { lw: 11, coat: 'skirt' }, O: { lw: 10, coat: 'dress' }, I: { lw: 11, coat: 'shirt' }, B: { lw: 17, coat: 'singlet' }, A: { lw: 11, coat: 'cardigan' }, C: { lw: 13, coat: 'fire' } };
/* where the head ends up in set coordinates */
function headPos(o) { const p = skel(o), s = o.s || 1, f = o.f || 1; return [o.x + p.head[0] * s * f, o.y + p.head[1] * s]; }
function handPos(o, which) { return o[which] ? [o.x + o[which][0] * (o.s || 1) * (o.f || 1), o.y + o[which][1] * (o.s || 1)] : null; }
function ik(sx, sy, hx, hy, l1, l2, bend) {
  const dx = hx - sx, dy = hy - sy, d = Math.max(1, Math.min(Math.hypot(dx, dy), l1 + l2 - 0.5)), a = Math.atan2(dy, dx);
  const b = Math.acos(clamp((l1 * l1 + d * d - l2 * l2) / (2 * l1 * d), -1, 1));
  return [sx + Math.cos(a + bend * b) * l1, sy + Math.sin(a + bend * b) * l1];
}
/* o: { kind, x, y, s, f, pose, ph, hn: near hand target, hf: far hand target (local), look, mouth, closed, glove, wig, gauze, mugs } */
function human(o) {
  if (SILENT) return;
  const k = KIT[o.kind] || KIT.W, p = skel(o), id = o.id || 20000, lw = k.lw;
  X.save(); X.translate(o.x, o.y); X.scale((o.s || 1) * (o.f || 1), o.s || 1); X.globalAlpha = o.alpha ?? 1;
  const sh = [p.neck[0], p.neck[1] + 8];
  const hang = (side) => [sh[0] + side * 4 + (o.pose === 'sit' ? 26 : 4), sh[1] + (o.pose === 'sit' ? 54 : 74)];
  const hn = o.hn || hang(1), hf = o.hf || hang(-1);
  const big = o.kind === 'B' ? 1.35 : 1;
  const arm = (h, side, idd) => {
    const s0 = [sh[0] - side * 3, sh[1]], el = ik(s0[0], s0[1], h[0], h[1], 36 * big, 36 * big, side > 0 ? 1 : 1);
    cap(s0[0], s0[1], el[0], el[1], lw, idd); cap(el[0], el[1], h[0], h[1], lw * 0.86, idd + 1);
    if (o.kind === 'B' && o.glove !== false && !(side < 0 && o.bareFar) && !(side > 0 && o.bareNear)) {
      ball(h[0], h[1], 13, idd + 2, PAT.d, 1.6, P.ink);
      if (side < 0) line([h[0] - 6, h[1] - 6], [h[0] + 4, h[1] - 10], 1.6, idd + 3, 0.1, P.paper);
    } else if (o.gauze && side > 0) { ball(h[0], h[1], 9, idd + 2, null, 1.4, P.paper); for (let q = 0; q < 3; q++) line([h[0] - 7, h[1] - 4 + q * 4], [h[0] + 7, h[1] - 6 + q * 4], 0.7, idd + 5 + q, 0.1); }
    else ball(h[0], h[1], lw * 0.55, idd + 2, PAT.f, 1.2);
  };
  const leg = (kn, ft, idd, dark) => {
    cap(p.hip[0], p.hip[1], kn[0], kn[1], lw * 1.15, idd); cap(kn[0], kn[1], ft[0], ft[1], lw, idd + 1);
    if (o.kind === 'I' && !o.shoes) { X.beginPath(); X.ellipse(ft[0] + 6, ft[1] - 3, 9, 4, 0, 0, 6.283); X.fillStyle = P.paper; X.fill(); X.lineWidth = 1.2; X.strokeStyle = P.ink; X.stroke(); }
    else { X.beginPath(); X.ellipse(ft[0] + 7, ft[1] - 4, 12, 5, 0, Math.PI, 0); X.closePath(); X.fillStyle = P.ink; X.fill(); }
    void dark;
  };
  // far side first
  arm(hf, -1, id + 10);
  const skirt = k.coat === 'skirt' || k.coat === 'dress' || k.coat === 'coat';
  leg(p.k2, p.f2, id + 20, true);
  if (!skirt) leg(p.k1, p.f1, id + 25);
  // torso
  const sx = p.neck[0] - p.hip[0], sy = p.neck[1] - p.hip[1], L = Math.hypot(sx, sy), nx = -sy / L, ny = sx / L, tw = (o.kind === 'B' ? 30 : 17);
  const torso = [[p.hip[0] - nx * tw, p.hip[1] - ny * tw], [p.hip[0] + nx * tw, p.hip[1] + ny * tw], [p.neck[0] + nx * tw * 0.9, p.neck[1] + 8 + ny * tw * 0.9], [p.neck[0] - nx * tw * 0.9, p.neck[1] + 8 - ny * tw * 0.9]];
  if (skirt) {
    const len = k.coat === 'coat' ? 0.55 : k.coat === 'dress' ? 0.5 : 0.85, kx = (p.k1[0] + p.k2[0]) / 2, ky = (p.k1[1] + p.k2[1]) / 2;
    const hemY = lerp(p.hip[1], Math.min(-6, ky + (0 - ky) * len), 1), hemX = lerp(p.hip[0], kx, 1);
    const sk = [torso[0], torso[1], [hemX + 26, hemY], [hemX - 30, hemY]];
    leg(p.k1, p.f1, id + 25);
    shape(sk, { lw: 1.5, id: id + 30, fill: k.coat === 'coat' ? '#4b4137' : P.paper, h: k.coat === 'skirt' ? [1.75, 3.4, 0.6] : k.coat === 'dress' ? [0.3, 5, 0.4] : [1.6, 2.4, 0.5] });
  }
  const fill = { cardigan: P.paper, coat: '#4b4137', skirt: P.paper, dress: P.paper, shirt: P.paper, singlet: P.paper, fire: '#4b4137' }[k.coat];
  shape(torso, { lw: 1.6, id: id + 31, fill, h: k.coat === 'cardigan' ? [0.7, 3.2, 0.5] : k.coat === 'skirt' ? [[0.7, 3, 0.5], [-0.7, 3, 0.5]] : undefined });
  if (k.coat === 'cardigan') for (let q = 0; q < 4; q++) { X.beginPath(); X.arc(lerp(torso[2][0], torso[1][0], 0.2 + q * 0.2) - 3, lerp(torso[2][1], torso[1][1], 0.2 + q * 0.2), 1.6, 0, 6.283); X.fillStyle = P.ink; X.fill(); }
  if (k.coat === 'singlet') { line([torso[3][0] + 6, torso[3][1]], [torso[3][0] + 12, torso[3][1] + 22], 1.4, id + 33, 0.1); line([torso[2][0] - 6, torso[2][1]], [torso[2][0] - 14, torso[2][1] + 22], 1.4, id + 34, 0.1); }
  if (k.coat === 'fire') { for (const q of [0.35, 0.7]) line([lerp(torso[0][0], torso[3][0], q), lerp(torso[0][1], torso[3][1], q)], [lerp(torso[1][0], torso[2][0], q), lerp(torso[1][1], torso[2][1], q)], 3, id + 35 + q * 10, 0.1, P.paper); }
  if (k.coat === 'coat') line([torso[2][0] - 4, torso[2][1] + 4], [torso[1][0] - 2, torso[1][1] + 20], 1, id + 36, 0.2, P.paper);
  // neck and head
  const [hx, hy] = p.head, hr = o.kind === 'B' ? 14 : 15;
  cap(p.neck[0], p.neck[1] + 8, hx - 2, hy + hr * 0.7, o.kind === 'B' ? 16 : 8, id + 40);
  head(o, hx, hy, hr, id + 50);
  // near side
  arm(hn, 1, id + 60);
  if (o.wig) { const [wx, wy] = o.wig; wigMass(wx, wy, 1, id + 80); }
  if (o.mugs) for (let q = 0; q < 5; q++) { const [mx_, my] = [hn[0] - 6 + q * 3, hn[1] + 8 + q * 2]; shape(R(mx_, my, 10, 11), { lw: 1, id: id + 90 + q, fill: P.paper }); }
  if (o.sheet) { const [a, b] = o.sheet; X.save(); X.translate(a, b); X.rotate(-0.15); shape(R(-16, -22, 32, 42), { lw: 1.1, id: id + 99, fill: CARD }); X.restore(); }
  X.restore();
}
function head(o, x, y, r, id) {
  const kd = o.kind;
  if (kd === 'I') for (let q = 0; q < 6; q++) ink([[x - 4 - q * 2, y - r + 2], [x - r - 2 - q, y - 2], [x - r - q * 1.5, y + r + 18 + q * 3]], 2.4, id + 30 + q, 0.4);
  ball(x, y, r, id, kd === 'O' ? null : PAT.f, 1.6, P.paper);
  if (kd === 'O') { X.beginPath(); X.arc(x - 4, y - 6, 4, 0, 6.283); X.fillStyle = P.paper; X.fill(); X.beginPath(); X.arc(x - 2, y + 6, 1.8, 0, 6.283); X.fillStyle = P.red; X.fill(); }
  if (kd === 'R') { X.save(); circ(x, y, r, id); X.clip(); X.fillStyle = PAT.m; X.fillRect(x - r - 2, y - r - 2, r * 1.4, r * 1.2); X.restore(); ball(x - r + 2, y - r * 0.5, 7, id + 2, PAT.m, 1.2); }
  if (kd === 'W' || kd === 'A') { X.save(); circ(x, y, r, id); X.clip(); X.fillStyle = PAT.d; X.fillRect(x - r - 2, y - r - 2, r * 1.3, r * 0.9); X.restore(); }
  if (kd === 'K') { shape(R(x - 20, y - r + 2, 42, 4), { lw: 1, id: id + 3, fill: P.ink }); shape(R(x - 12, y - r - 14, 26, 17), { lw: 1, id: id + 4, fill: P.ink }); }
  if (kd === 'C') { X.beginPath(); X.arc(x, y - 2, r + 3, Math.PI, 0); X.closePath(); X.fillStyle = P.ink; X.fill(); shape(R(x - r - 8, y - 4, r * 2 + 18, 4), { lw: 1, id: id + 5, fill: P.ink }); }
  if (kd === 'B') { X.fillStyle = P.ink; for (let q = 0; q < 14; q++) X.fillRect(x - 10 + hash(q, id) * 16, y - r + 1 + hash(q, id + 1) * 6, 1.2, 1.2); }
  if (kd === 'A') { X.beginPath(); X.arc(x, y, r + 3, Math.PI * 1.1, Math.PI * 1.9); X.lineWidth = 2; X.strokeStyle = P.ink; X.stroke(); line([x + 6, y + 6], [x + 16, y + 10], 1.4, id + 6, 0.1); }
  if (HEADX[kd] && HEADX[kd](o, x, y, r, id)) return;
  const ex = x + 7 + (o.look || 0) * 2, ey = y - 2 + (o.lookY || 0) * 2;
  if (o.closed) line([ex - 3, ey], [ex + 3, ey], 1.3, id + 7, 0.05); else { X.beginPath(); X.arc(ex, ey, 2, 0, 6.283); X.fillStyle = P.ink; X.fill(); }
  if (kd === 'W') shape(R(ex - 5, ey - 4, 10, 7), { lw: 1.1, id: id + 8, fill: null });
  line([x + r - 1, y - 1], [x + r + 3, y + 4], 1.2, id + 9, 0.05);
  const mo = o.mouth || 0; if (mo > 0.06) { X.fillStyle = P.ink; X.fillRect(x + 6, y + 7, 6, 1.4 + mo * 4.5); } else line([x + 6, y + 8], [x + 12, y + 8], 1.1, id + 10, 0.05);
}
function wigMass(x, y, s, id) {
  X.save(); X.translate(x, y); X.scale(s, s);
  const p = []; for (let i = 0; i <= 20; i++) { const a = Math.PI * (1.0 + i / 20); p.push([Math.cos(a) * 20, Math.sin(a) * 16 - 2]); }
  for (let i = 0; i <= 10; i++) p.push([20 - i * 4, 10 + Math.sin(i * 1.3) * 4 + (i % 2) * 8]);
  shape(p, { lw: 1.4, id, fill: WIGRED, h: [1.3, 2.6, 0.5] });
  for (let i = 0; i < 7; i++) ink([[-16 + i * 5, -10], [-18 + i * 5 + Math.sin(i) * 3, 18 + (i % 3) * 4]], 0.9, id + 10 + i, 0.4);
  X.restore();
}

/* ---------- night, rain ---------- */
function nightSky(id) { X.fillStyle = NIGHT; X.fillRect(-600, -600, 2600, 2000); X.fillStyle = 'rgba(235,227,207,.05)'; for (let y = -600; y < 1400; y += 3) X.fillRect(-600, y, 2600, 1); void id; }
function rain(lt, k = 1, col = P.paper) {
  if (k <= 0) return; X.save(); X.globalAlpha = 0.35 * k; X.strokeStyle = col; X.lineWidth = 0.8; X.beginPath();
  for (let i = 0; i < 160; i++) { const x = hash(i, 1) * 1500 - 100, y = ((hash(i, 2) * 900 + lt * 520 * (0.8 + 0.4 * hash(i, 3))) % 900) - 90; X.moveTo(x, y); X.lineTo(x - 4, y + 16); }
  X.stroke(); X.restore();
}
function darken(k, col = NIGHT) { if (k <= 0) return; X.save(); X.globalAlpha = k; X.fillStyle = col; X.fillRect(-600, -600, 2600, 2000); X.restore(); }


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

/* ================= frame loop ================= */
function cornerClock(s) { if (!s) return; X.save(); X.fillStyle = P.paper; X.globalAlpha = 0.92; X.fillRect(PX0 + 10, PY0 + 10, 84, 30); X.globalAlpha = 1; X.strokeStyle = P.ink; X.lineWidth = 1; X.strokeRect(PX0 + 10, PY0 + 10, 84, 30); txt(s, PX0 + 52, PY0 + 26, 17, { mono: true, col: P.red }); X.restore(); }
window.__render = async (f) => {
  const t = f / 24; GT = t; BOIL = Math.floor(f / 2);
  let i = 0; for (let j = 0; j < T.shots.length; j++) if (t >= T.shots[j].t0) i = j;
  const sh = T.shots[i], lt = t - sh.t0, sd = sh.d;
  X.setTransform(1, 0, 0, 1, 0, 0); X.fillStyle = P.paper; X.fillRect(0, 0, W, H);
  X.save(); path(R(PX0, PY0, PX1 - PX0, PY1 - PY0)); X.clip();
  X.lineCap = 'butt'; X.lineJoin = 'miter'; X.setLineDash([]); X.globalAlpha = 1;
  SHOTS[sh.shot](lt, sd, sh);
  X.setTransform(1, 0, 0, 1, 0, 0); X.globalAlpha = 1; X.setLineDash([]); cornerClock(sh.clock);
  X.restore(); X.setTransform(1, 0, 0, 1, 0, 0); X.globalAlpha = 1;
  const fade = sh.shot === 'title' ? Math.max(1 - seg(lt, 0, 0.6), seg(lt, sd - 0.7, sd)) : sh.shot === 'end' ? Math.max(1 - seg(lt, 0, 0.5), seg(lt, sd - 1.2, sd)) : Math.max(1 - seg(lt, 0, 0.4), seg(lt, sd - 0.3, sd));
  if (fade > 0) { X.fillStyle = P.paper; X.globalAlpha = fade; X.fillRect(0, 0, W, H); X.globalAlpha = 1; }
  border();
};
(async () => {
  T = await (await fetch('timing/ht.json')).json();
  await document.fonts.ready; await Promise.all(['IM Fell English', 'IBM Plex Mono'].map((n) => document.fonts.load(`20px "${n}"`))); await document.fonts.load(`italic 20px "IM Fell English"`);
  await document.fonts.load('600 10px "IBM Plex Mono"');
  X = document.getElementById('film').getContext('2d');
  if (typeof prep === 'function') prep();
  window.__NF = Math.ceil(T.dur * 24); window.__T = T; window.__ready = true;
})();
