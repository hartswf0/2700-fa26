/* The House of Asterion: drawing. The study and engraving helpers are from ah.js (The Burning of the Abominable House); the jointed puppet is from hi.js (The House Is Occupied). Part of The House That Language Built. */
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
  T = await (await fetch('timing/as.json')).json();
  await document.fonts.ready; await Promise.all(['IM Fell English', 'IBM Plex Mono'].map((n) => document.fonts.load(`20px "${n}"`))); await document.fonts.load(`italic 20px "IM Fell English"`);
  await document.fonts.load('600 10px "IBM Plex Mono"');
  X = document.getElementById('film').getContext('2d');
  if (typeof prep === 'function') prep();
  window.__NF = Math.ceil(T.dur * 24); window.__T = T; window.__ready = true;
})();
