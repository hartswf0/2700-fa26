/* The House Is Occupied. Drawing. From Watson Hartsoe's screenplay, after Italo Calvino. Toolkit: ink.js; room pieces from the bitic films and The Burning of the Abominable House. */
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


/* ================= The House Is Occupied ================= */
const NIGHT = '#2a241d', STEEL = '#c9c2b2', BRASS = '#d9c79a', WIGRED = P.red;

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
const KIT = { W: { lw: 12, coat: 'cardigan' }, K: { lw: 12, coat: 'coat' }, R: { lw: 11, coat: 'skirt' }, O: { lw: 10, coat: 'dress' }, I: { lw: 11, coat: 'shirt' }, B: { lw: 17, coat: 'singlet' }, A: { lw: 11, coat: 'cardigan' }, C: { lw: 13, coat: 'fire' } };
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

/* ---------- the clock in the corner ---------- */
function cornerClock(s) { if (!s) return; X.save(); X.fillStyle = P.paper; X.globalAlpha = 0.9; X.fillRect(PX0 + 10, PY0 + 10, 92, 34); X.globalAlpha = 1; X.strokeStyle = P.ink; X.lineWidth = 1; X.strokeRect(PX0 + 10, PY0 + 10, 92, 34); txt(s, PX0 + 56, PY0 + 25, 18, { mono: true, col: P.red }); mono('CASE 012', PX0 + 56, PY0 + 39, 7, { col: P.ink }); X.restore(); }

/* ---------- the front hall (front elevation) ---------- */
const FL = 600, OPEN = { x0: 700, x1: 884, y0: 362 }, FAN = [612, 562], BOOTS = [548, 584], PHONE = [416, 430], BOX = { x: 446, y: 382 }, CHAIN = [916, 468];
/* st: door 0..1, shut 0..1, gap px, lamp1, lamp2, hallLamp, glow, receiver 'hook'|'hang'|'hand'|'tile'|'floor', boots, fanOn, spark, smoke */
function hall(lt, st = {}) {
  // wall and floor
  X.fillStyle = P.paper; X.fillRect(-600, -600, 2600, 2000);
  for (let y = -200, q = 0; y < FL; y += 4, q++) { X.fillStyle = P.ink; X.globalAlpha = 0.28; X.fillRect(-600, y, 2600, 0.6); }
  X.globalAlpha = 1;
  X.fillStyle = P.paper; X.fillRect(-600, FL, 2600, 300);
  for (let x = -600, q = 0; x < 2000; x += 40, q++) for (let y = FL; y < FL + 200; y += 20) { if ((q + Math.floor((y - FL) / 20)) % 2) { X.fillStyle = 'rgba(28,24,20,.16)'; X.fillRect(x, y, 40, 20); } }
  line([-600, FL], [2000, FL], 2.4, 30000, 0.3);
  // hall lamp
  line([640, -100], [640, 70], 1.2, 30001, 0.1); shape([[610, 70], [670, 70], [656, 100], [624, 100]], { lw: 1.4, id: 30002, fill: st.hallLamp === false ? P.ink : '#f1e6c4' });
  // front door
  const dx0 = 40, dx1 = 150, dy0 = 330;
  shape(R(dx0 - 10, dy0 - 10, dx1 - dx0 + 20, FL - dy0 + 10), { lw: 1.8, id: 30010, h: [Math.PI / 2, 3, 0.5] });
  X.fillStyle = NIGHT; X.fillRect(dx0, dy0, dx1 - dx0, FL - dy0);
  X.save(); path(R(dx0, dy0, dx1 - dx0, FL - dy0)); X.clip(); rain(lt, 1); if (st.blue) { X.globalAlpha = st.blue * (0.4 + 0.3 * Math.sin(lt * 9)); X.fillStyle = '#9fb3c6'; X.fillRect(dx0, dy0, dx1 - dx0, FL - dy0); X.globalAlpha = 1; } X.restore();
  const op = st.door ?? 0, lw_ = (dx1 - dx0) * (1 - 0.82 * op);
  shape([[dx0, dy0], [dx0 + lw_, dy0 + 10 * op], [dx0 + lw_, FL - 6 * op], [dx0, FL]], { lw: 1.6, id: 30011, fill: '#d9cfb4', h: [Math.PI / 2, 4, 0.5] });
  ball(dx0 + lw_ - 12, (dy0 + FL) / 2, 4, 30012, PAT.f, 1);
  // table and widow's things
  shape(R(186, 520, 150, 10), { lw: 1.6, id: 30020, h: [0, 3, 0.5] }); for (const lx of [196, 316]) line([lx, 530], [lx + (lx < 250 ? -8 : 8), FL], 3, 30021 + lx, 0.2);
  shape(R(206, 506, 60, 14), { lw: 1.2, id: 30025, fill: CARD }); line([214, 512], [258, 512], 0.6, 30026, 0.1);
  const tick = st.spoon ? Math.sin(lt * 40) * 1.5 * st.spoon : 0, cupLift = st.cupLift || 0;
  shape([[290, 520], [322, 520], [318, 516], [294, 516]], { lw: 1, id: 30027, fill: P.paper });
  shape([[296, 516 - cupLift], [316, 516 - cupLift], [313, 500 - cupLift], [299, 500 - cupLift]], { lw: 1.2, id: 30028, fill: P.paper }); line([306 + tick, 500 - cupLift], [312 + tick, 488 - cupLift], 1.2, 30029, 0.05);
  // phone and the call-record box
  shape(R(PHONE[0] - 16, PHONE[1] - 30, 32, 46), { lw: 1.5, id: 30030, fill: '#4b4137' });
  const rcv = st.receiver || 'hook';
  if (rcv === 'hook') shape(R(PHONE[0] - 22, PHONE[1] - 40, 44, 10), { lw: 1.2, id: 30031, fill: P.ink });
  else if (rcv === 'hang') { ink([[PHONE[0], PHONE[1] + 10], [PHONE[0] + 6, PHONE[1] + 60], [PHONE[0] + 2, PHONE[1] + 96]], 1.2, 30032, 0.5); shape(R(PHONE[0] - 6, PHONE[1] + 96, 12, 34), { lw: 1.2, id: 30033, fill: P.ink }); }
  else if (rcv === 'tile' || rcv === 'floor') { const tx = st.recvX ?? 690; ink([[PHONE[0], PHONE[1] + 10], [PHONE[0] + 60, FL - 30], [tx, FL - 8]], 1.2, 30034, 0.5); shape(R(tx - 2, FL - 12, 36, 10), { lw: 1.2, id: 30035, fill: P.ink }); }
  else if (rcv === 'hand') ink([[PHONE[0], PHONE[1] + 10], [PHONE[0] - 40, PHONE[1] + 50], st.recvAt || [300, 440]], 1.2, 30036, 0.5);
  shape(R(BOX.x, BOX.y, 54, 48), { lw: 1.4, id: 30040, fill: '#9c968b', h: [0, 3, 0.4] }); shape(R(BOX.x + 6, BOX.y + 6, 42, 10), { lw: 0.8, id: 30041, fill: BRASS });
  mono('RESERVE MUTUAL', BOX.x + 27, BOX.y + 12.5, 3.6, { col: P.ink }); mono('CALL RECORD', BOX.x + 27, BOX.y + 22, 3.6, { col: P.ink });
  for (const [k, on] of [[0, st.lamp1], [1, st.lamp2]]) { X.beginPath(); X.arc(BOX.x + 18 + k * 18, BOX.y + 36, 4.5, 0, 6.283); X.fillStyle = on ? P.red : '#6f6a61'; X.fill(); X.lineWidth = 1; X.strokeStyle = P.ink; X.stroke(); }
  // stair rising to the right over the stockroom
  const sx0 = 520, steps = 11;
  for (let q = 0; q < steps; q++) { const x = sx0 + q * 46, y = FL - 22 - q * 24; shape(R(x, y, 120, 24), { lw: 1.3, id: 30050 + q, fill: q === 0 ? '#e4d9bf' : P.paper, h: q > 3 ? [0, 3, 0.4] : undefined }); }
  ink([[sx0 + 8, FL - 120], [sx0 + steps * 46 + 40, FL - 22 - steps * 24 - 90]], 2.6, 30070, 0.2); for (let q = 0; q < steps; q += 2) line([sx0 + 30 + q * 46, FL - 22 - q * 24], [sx0 + 30 + q * 46, FL - 22 - q * 24 - 96], 1.4, 30071 + q, 0.1);
  // stockroom opening under the stair
  const { x0, x1, y0 } = OPEN;
  shape(R(x0 - 10, y0 - 34, x1 - x0 + 20, 34), { lw: 1.6, id: 30080, fill: STEEL, h: [0, 2.4, 0.5] });
  X.fillStyle = '#4b4137'; X.fillRect(x0, y0, x1 - x0, FL - y0);
  X.save(); path(R(x0, y0, x1 - x0, FL - y0)); X.clip();
  for (let q = 0; q < 5; q++) shape(R(x0 + 10 + q * 30, FL - 40 - q * 6 - 90, 38, 130 + q * 6), { lw: 1, id: 30090 + q, fill: '#bfb39a', h: [0.2, 3, 0.4] });
  shape(R(x0 + 120, FL - 70, 50, 70), { lw: 1, id: 30098, fill: '#a89c84', h: [[0.8, 3, 0.4], [-0.8, 3, 0.4]] });
  ball(x1 - 20, FL - 60, 6, 30099, null, 1, '#a89c84');
  if (st.glow) { const g = st.glow; X.globalAlpha = g * (0.55 + 0.25 * Math.sin(lt * 13)); X.fillStyle = P.red; X.fillRect(x0, y0, x1 - x0, FL - y0); X.globalAlpha = 1; }
  X.restore();
  // fan cable along the floor and in under the track
  ink([[FAN[0] + 10, FAN[1] + 30], [FAN[0] + 40, FL - 4], [x0 - 4, FL - 3], [x0 + 40, FL - 3], [x1 - 20, FL - 56]], 1.6, 30100, 0.3);
  if (st.spark) { const u = st.spark; X.globalAlpha = u; ball(x1 - 20, FL - 60, 10 * u, 30101, null, 1, '#c7dcff'); X.globalAlpha = 1; }
  // the shutter
  const shut = st.shut || 0, gap = st.gap || 0;
  if (shut > 0) {
    const yb = y0 + (FL - y0) * E.io(shut) - gap;
    shape(R(x0, y0, x1 - x0, yb - y0), { lw: 1.6, id: 30110, fill: STEEL });
    for (let y = y0 + 9; y < yb - 4; y += 9) line([x0 + 2, y], [x1 - 2, y], 1, 30111 + y, 0.1);
    shape(R(x0 - 4, yb - 8, x1 - x0 + 8, 9), { lw: 1.6, id: 30140, fill: '#7f786b' });
    if (gap > 0) { X.fillStyle = P.red; X.globalAlpha = 0.5 + 0.3 * Math.sin(lt * 11); X.fillRect(x0, yb + 1, x1 - x0, FL - yb - 1); X.globalAlpha = 1; }
  } else { for (let y = y0 - 30; y < y0 - 4; y += 6) line([x0 - 6, y], [x1 + 6, y], 0.8, 30120 + y, 0.1); }
  // porcelain hand and the red chain
  shape([[CHAIN[0] - 12, CHAIN[1] - 6], [CHAIN[0] + 14, CHAIN[1] - 10], [CHAIN[0] + 18, CHAIN[1] + 4], [CHAIN[0] - 8, CHAIN[1] + 10]], { lw: 1.3, id: 30150, fill: P.paper });
  for (let q = 0; q < 3; q++) line([CHAIN[0] + 14, CHAIN[1] - 8 + q * 4], [CHAIN[0] + 22, CHAIN[1] - 8 + q * 4], 1.4, 30151 + q, 0.05);
  const cd = st.chainDown || 0, cl = 60 + cd * 70;
  if (!st.chainCut) { X.save(); X.setLineDash([3, 2.4]); ink([[x1 + 4, y0 - 20], [CHAIN[0] + 2, CHAIN[1]], [CHAIN[0] + 2 + (st.chainSway || 0), CHAIN[1] + cl]], 2.4, 30155, 0.2, P.red); X.restore(); ball(CHAIN[0] + 2 + (st.chainSway || 0), CHAIN[1] + cl + 6, 5, 30156, null, 1.2, P.red); }
  else { for (let q = 0; q < 10; q++) ball(CHAIN[0] - 10 + q * 3, FL - 4 - (q % 3) * 3, 3, 30157 + q, null, 0.8, P.red); }
  // fan on the bottom step, boots in front of it
  const spin = st.fanOn === false ? 0 : lt * 18;
  line([FAN[0], FAN[1] + 14], [FAN[0], FAN[1] + 34], 3, 30160, 0.1); shape(R(FAN[0] - 12, FAN[1] + 32, 24, 6), { lw: 1, id: 30161, fill: P.ink });
  ball(FAN[0], FAN[1], 18, 30162, null, 1.4, P.paper); for (let q = 0; q < 3; q++) { const a = spin + q * 2.09; ink([[FAN[0], FAN[1]], [FAN[0] + Math.cos(a) * 15, FAN[1] + Math.sin(a) * 15]], 3, 30163 + q, 0.1); }
  if (st.boots !== false) for (const d of [0, 20]) { shape([[BOOTS[0] + d, BOOTS[1]], [BOOTS[0] + d + 14, BOOTS[1]], [BOOTS[0] + d + 14, BOOTS[1] - 26], [BOOTS[0] + d + 4, BOOTS[1] - 26]], { lw: 1.2, id: 30170 + d, fill: P.ink }); }
  // coat peg on the right wall
  line([1010, 360], [1030, 360], 3, 30180, 0.1);
  if (st.hallLamp === false) darken(0.5);
}

/* ---------- inside the stockroom ---------- */
/* st: gap px, fire 0..1, smoke 0..1, inigo pose obj, fingers bool */
function stockroom(lt, st = {}) {
  X.fillStyle = '#4b4137'; X.fillRect(-600, -600, 2600, 2000);
  for (let y = -100; y < FL; y += 5) { X.fillStyle = 'rgba(235,227,207,.08)'; X.fillRect(-600, y, 2600, 1); }
  X.fillStyle = '#3a3028'; X.fillRect(-600, FL, 2600, 300);
  // the shutter from inside, left
  const gap = st.gap || 0, sx0 = 60, sx1 = 330;
  shape(R(sx0, 200, sx1 - sx0, FL - 200 - gap), { lw: 1.6, id: 31000, fill: '#8a8374' }); for (let y = 210; y < FL - gap; y += 9) line([sx0 + 2, y], [sx1 - 2, y], 0.9, 31001 + y, 0.1);
  if (gap > 0) { X.fillStyle = '#f1e6c4'; X.fillRect(sx0, FL - gap, sx1 - sx0, gap); }
  // cartons, hamper, bricked door, socket
  for (let q = 0; q < 6; q++) for (let r = 0; r < 4; r++) shape(R(380 + q * 70, FL - 60 - r * 60, 64, 58), { lw: 1, id: 31100 + q * 10 + r, fill: '#a89c84', h: [0.2 + q, 4, 0.3] });
  shape(R(820, FL - 80, 90, 80), { lw: 1.2, id: 31150, fill: '#8a7d66', h: [[0.8, 3, 0.4], [-0.8, 3, 0.4]] });
  shape(R(1000, 360, 160, FL - 360), { lw: 1.4, id: 31160, fill: '#6f5b47' }); for (let y = 370; y < FL; y += 14) for (let x = 1000 + ((y / 14) % 2) * 14; x < 1160; x += 28) X.strokeStyle = P.ink, X.lineWidth = 0.8, X.strokeRect(x, y, 28, 14);
  shape(R(950, 520, 26, 36), { lw: 1.4, id: 31170, fill: '#8a6e4e' }); ball(963, 538, 3, 31171, PAT.f, 1);
  ink([[sx1 - 40, FL - 4], [600, FL - 6], [940, FL - 6], [963, 556]], 1.6, 31180, 0.3);
  shape([[sx1 - 70, FL - 2], [sx1 + 30, FL - 4], [sx1 + 20, FL - 12], [sx1 - 60, FL - 10]], { lw: 0.8, id: 31190, fill: P.paper });
  // fire on the cartons nearest the shutter
  const f = st.fire || 0;
  if (f > 0) { for (let q = 0; q < 7; q++) { const u = clamp(f * 1.6 - q * 0.12); if (u <= 0) continue; flame(390 + q * 46, FL - 6 - (q % 3) * 50 - u * 30, 30 + u * 60, 31200 + q * 7); }
    X.globalAlpha = f * 0.35 * (0.8 + 0.2 * Math.sin(lt * 17)); X.fillStyle = P.red; X.fillRect(-600, -600, 2600, 2000); X.globalAlpha = 1; }
  const sm = st.smoke || 0; if (sm > 0) { X.globalAlpha = sm * 0.85; X.fillStyle = '#2a241d'; X.fillRect(-600, -600, 2600, 600 + 380 * sm); X.globalAlpha = 1; }
  if (st.inigo) human(st.inigo);
}

/* ---------- other rooms ---------- */
function labRoom(lt, o = {}) {
  wallAndFloor();
  // door
  const dx0 = 330, dx1 = 440, dy0 = 380, op = o.door ?? 0;
  shape(R(dx0 - 8, dy0 - 8, dx1 - dx0 + 16, FLOOR - dy0 + 8), { lw: 1.6, id: 32000, h: [Math.PI / 2, 3, 0.5] });
  X.fillStyle = o.dawn ? '#e8dcc0' : NIGHT; X.fillRect(dx0, dy0, dx1 - dx0, FLOOR - dy0);
  if (op > 0) { X.save(); path(R(dx0, dy0, dx1 - dx0, FLOOR - dy0)); X.clip(); ink([[dx0, FLOOR - 40], [dx1, FLOOR - 46]], 1.4, 32003, 0.2); if (o.train) trainBand(dx0 - 400 + ((lt * 260) % 900), FLOOR - 120, 0.5, 32010); X.restore(); }
  const lw_ = (dx1 - dx0) * (1 - 0.8 * op); shape([[dx0, dy0], [dx0 + lw_, dy0 + 8 * op], [dx0 + lw_, FLOOR - 4 * op], [dx0, FLOOR]], { lw: 1.6, id: 32001, fill: '#d9cfb4', h: [Math.PI / 2, 4, 0.5] });
  if (o.stone) shape(rock(dx0 + lw_ + 10, FLOOR - 8, 10, 32002, 9), { lw: 1.2, id: 32002, fill: '#9c968b' });
  // the big window over the desk, looking across the yard
  const wx = 760, wy = 96, ww = 330, wh = 290;
  shape(R(wx - 10, wy - 10, ww + 20, wh + 20), { lw: 1.8, id: 32020, h: [0, 3, 0.5] });
  X.fillStyle = o.dawn ? '#efe4c8' : NIGHT; X.fillRect(wx, wy, ww, wh);
  X.save(); path(R(wx, wy, ww, wh)); X.clip();
  if (!o.dawn) rain(lt, 0.8);
  ink([[wx, wy + wh - 50], [wx + ww, wy + wh - 54]], 1.2, 32021, 0.2, o.dawn ? P.ink : P.paper); ink([[wx, wy + wh - 40], [wx + ww, wy + wh - 44]], 1.2, 32022, 0.2, o.dawn ? P.ink : P.paper);
  house(wx + ww * 0.62, wy + wh - 60, 0.6, 32030, { h: 1, lit: o.dawn ? 0 : 1, rubble: 0 });
  if (o.belindo) human({ kind: 'B', x: wx + ww * 0.62 + 12, y: wy + wh - 78, s: 0.13, f: -1, id: 32100 });
  if (o.train) trainBand(wx - 600 + ((lt * 300) % 1200), wy + wh - 36, 0.45, 32200);
  X.restore();
  line([wx + ww / 2, wy], [wx + ww / 2, wy + wh], 2.2, 32040, 0.2); line([wx, wy + wh / 2], [wx + ww, wy + wh / 2], 2.2, 32041, 0.2);
  // the timetable strip taped to the glass
  shape(R(wx + 18, wy + 18, 46, 120), { lw: 1, id: 32050, fill: CARD }); ['20:41', '20:58', '21:16'].forEach((t, i) => mono(t, wx + 41, wy + 40 + i * 30, 7, { col: i === 2 ? P.red : P.ink }));
  desk({ book: 'none' }); terminal();
  cabinet(lt, o.cab || {});
  // the wall clock
  ball(600, 170, 30, 32060, null, 1.6, P.paper); const tm = o.clock || [9, 6]; const ha = (tm[0] % 12 + tm[1] / 60) / 12 * 6.283 - 1.5708, ma = tm[1] / 60 * 6.283 - 1.5708;
  line([600, 170], [600 + Math.cos(ha) * 14, 170 + Math.sin(ha) * 14], 2.4, 32061, 0.05); line([600, 170], [600 + Math.cos(ma) * 22, 170 + Math.sin(ma) * 22], 1.6, 32062, 0.05);
}
function trainBand(x, y, s, id) {
  for (let q = 0; q < 6; q++) { const bx = x + q * 210 * s; shape(R(bx, y - 70 * s, 200 * s, 70 * s), { lw: 1.2, id: id + q, fill: '#4b4137', h: [Math.PI / 2, 3, 0.4] }); for (const w of [30, 170]) ball(bx + w * s, y, 9 * s, id + 20 + q * 2 + (w > 100), PAT.d, 1); }
}
function ogivaRoom(lt, o = {}) {
  wallAndFloor();
  shape(R(60, 330, 110, FLOOR - 330), { lw: 1.6, id: 33000, fill: '#d9cfb4', h: [Math.PI / 2, 4, 0.5] });
  // window with curtain
  shape(R(1010, 150, 160, 230), { lw: 1.6, id: 33010, fill: NIGHT }); X.save(); path(R(1010, 150, 160, 230)); X.clip(); rain(lt, 0.8); X.restore();
  shape([[1000, 140], [1090, 140], [1060, 400], [1000, 400]], { lw: 1.2, id: 33011, fill: P.paper, h: [1.5, 6, 0.4] });
  // dressing table and mirror
  shape(R(300, 470, 500, 14), { lw: 1.8, id: 33020, h: [0, 3, 0.5] }); for (const lx of [312, 780]) shape(R(lx, 484, 10, FLOOR - 484), { lw: 1.2, id: 33021 + lx, h: [Math.PI / 2, 2.4, 0.5] });
  shape(R(470, 230, 170, 200), { lw: 1.6, id: 33030, fill: '#e4d9bf', h: [0.9, 9, 0.3] });
  // five canvas heads and the red one on its block
  for (let q = 0; q < 6; q++) { const x = 334 + q * 68, y = 430; if (q === 5 && o.wigOff) continue; line([x, y + 10], [x, 470], 3, 33040 + q, 0.1); ball(x, y - 14, 22, 33050 + q, null, 1.4, q === 5 ? P.paper : '#e8dcc0'); ink([[x - 12, y - 30], [x + 12, y + 2]], 0.6, 33060 + q, 0.4); if (q === 5) wigMass(x, y - 22, 1.2, 33070); }
  // the brass stand with its iron foot
  if (!o.standOff) { const x = 762, lift = o.standLift || 0; line([x, 470 - lift], [x, 380 - lift], 3, 33080, 0.1); shape(R(x - 22, 462 - lift, 44, 9), { lw: 1.4, id: 33081, fill: P.ink }); ball(x, 376 - lift, 10, 33082, null, 1.2, BRASS); if (lift > 0) { X.globalAlpha = 0.5; X.beginPath(); X.ellipse(x, 468, 20, 3, 0, 0, 6.283); X.strokeStyle = P.ink; X.stroke(); X.globalAlpha = 1; } }
  // her stool
  shape(R(820, 554, 70, 10), { lw: 1.4, id: 33090, h: [0, 3, 0.5] }); line([830, 564], [826, FLOOR], 3, 33091, 0.1); line([880, 540], [884, FLOOR], 3, 33092, 0.1);
}
function landingSet(lt) {
  wallAndFloor();
  for (let q = 0; q < 14; q++) { const x = 40 + q * 84, y = FLOOR - 30 - q * 36; shape(R(x, y, 260, 36), { lw: 1.4, id: 34000 + q, fill: P.paper, h: [0, 3.2, 0.4] }); }
  ink([[60, FLOOR - 140], [1230, FLOOR - 30 - 14 * 36 - 110]], 2.8, 34100, 0.2); for (let q = 0; q < 14; q += 2) line([120 + q * 84, FLOOR - 30 - q * 36], [120 + q * 84, FLOOR - 30 - q * 36 - 104], 1.4, 34101 + q, 0.1);
  void lt;
}
function yardSet(lt, o = {}) {
  nightSky(35000);
  for (let i = 0; i < 40; i++) { X.fillStyle = P.paper; X.globalAlpha = 0.4; X.fillRect(hash(i, 5) * 1280, hash(i, 6) * 300, 1.5, 1.5); } X.globalAlpha = 1;
  // ballast bank and two tracks
  shape([[-100, 520], [1400, 500], [1400, 900], [-100, 900]], { lw: 1.4, id: 35010, fill: '#6f6a61', h: [0.15, 4, 0.5] });
  for (const ty of [560, 630]) { ink([[-100, ty], [1400, ty - 14]], 2, 35020 + ty, 0.2, P.paper); ink([[-100, ty + 12], [1400, ty - 2]], 2, 35021 + ty, 0.2, P.paper); for (let x = -80; x < 1400; x += 34) line([x, ty + 16 - x * 0.01], [x + 8, ty - 6 - x * 0.01], 2.4, 35030 + x + ty, 0.1, '#9c968b'); }
  // signal
  line([150, 520], [150, 330], 4, 35050, 0.1, P.paper); shape(R(134, 300, 32, 40), { lw: 1.4, id: 35051, fill: P.ink }); ball(150, 314, 7, 35052, null, 1, P.red);
  house(960, 500, 1.15, 35100, { h: 1, lit: 1 });
  rain(lt, 1);
}
function doorway(lt) {
  nightSky(36000);
  shape(R(470, 120, 340, 540), { lw: 2, id: 36001, fill: '#d9cfb4', h: [Math.PI / 2, 4, 0.5] });
  shape(R(520, 170, 240, 470), { lw: 1.6, id: 36002, fill: '#f1e6c4' });
  for (let y = 190; y < 620; y += 5) { X.fillStyle = 'rgba(28,24,20,.12)'; X.fillRect(520, y, 240, 1); }
  shape(R(440, 640, 400, 30), { lw: 1.6, id: 36003, h: [0, 3, 0.5] });
}
function officeSet(lt) {
  wallAndFloor();
  shape(R(140, 500, 1000, 16), { lw: 1.8, id: 37000, h: [0, 3, 0.5] }); for (const lx of [160, 1110]) shape(R(lx, 516, 12, FLOOR - 516), { lw: 1.2, id: 37001 + lx, h: [Math.PI / 2, 2.4, 0.5] });
  shape(R(300, 488, 520, 12), { lw: 1.2, id: 37010, fill: '#7d8a6c' });
  for (let q = 0; q < 4; q++) { const x = 330 + q * 120; shape(R(x, 470, 96, 22), { lw: 1.1, id: 37020 + q, fill: '#d9cfb4' }); shape(R(x + 36, 462, 20, 10), { lw: 0.9, id: 37030 + q, fill: BRASS }); line([x + 46, 462], [x + 46, 450], 1.4, 37040 + q, 0.1); ball(x + 46, 446, 4, 37050 + q, null, 1, BRASS); }
  shape(R(820, 300, 200, 150), { lw: 1.4, id: 37060, fill: CARD }); X.save(); path(R(830, 310, 180, 130)); X.clip(); for (let q = 0; q < 5; q++) shape(R(840 + q * 34, 400 - q * 10, 30, 40 + q * 10), { lw: 0.8, id: 37061 + q, fill: '#bfb39a' }); X.restore();
  void lt;
}
function fireDesk(lt, o = {}) {
  wallAndFloor();
  shape(R(160, 480, 960, 16), { lw: 1.8, id: 38000, h: [0, 3, 0.5] });
  shape(R(300, 300, 420, 180), { lw: 1.4, id: 38010, fill: CARD }); for (let q = 0; q < 9; q++) ink([[300, 320 + q * 18], [720, 316 + q * 19]], 0.6, 38011 + q, 0.5);
  ink([[300, 420], [720, 360]], 2, 38030, 0.2); ink([[300, 428], [720, 368]], 2, 38031, 0.2); line([520, 360], [540, 420], 2.4, 38032, 0.1, P.red);
  ball(250, 470, 26, 38040, null, 1.4, P.paper); X.beginPath(); X.ellipse(250, 460, 20, 6, 0, 0, 6.283); X.fillStyle = '#c9b98e'; X.fill();
  // stamp clock
  shape(R(860, 380, 120, 100), { lw: 1.6, id: 38050, fill: '#9c968b', h: [0, 3, 0.4] }); txt('21:13', 920, 410, 18, { mono: true, col: P.red });
  if (o.slip) { shape(R(780, 452, 110, 30), { lw: 1, id: 38060, fill: CARD }); mono('21:13', 840, 474, 7.5, { col: P.ink }); if (o.margin) mono('012', 794, 462, 7, { col: P.red, align: 'left' }); }
}
function engineSet(lt, o = {}) {
  nightSky(39000);
  shape([[-100, 560], [1400, 548], [1400, 900], [-100, 900]], { lw: 1.4, id: 39010, fill: '#6f6a61', h: [0.1, 4, 0.5] });
  X.save(); X.translate(0, 0); house(1180, 556, 1.1, 39100, { h: 1, lit: 0, char: 0.25, smoke: 1 }); X.restore();
  if (o.chainHeap) void 0;
  // the engine
  shape(R(60, 430, 420, 130), { lw: 2, id: 39200, fill: '#7e2c25', h: [Math.PI / 2, 3, 0.4] }); shape(R(400, 380, 140, 180), { lw: 2, id: 39201, fill: '#7e2c25' }); shape(R(420, 400, 90, 60), { lw: 1.4, id: 39202, fill: NIGHT });
  for (const wx of [130, 400]) ball(wx, 560, 34, 39210 + wx, PAT.d, 1.6, P.ink);
  ink([[80, 420], [470, 370]], 3, 39220, 0.2, P.paper); ink([[80, 400], [470, 350]], 3, 39221, 0.2, P.paper); for (let q = 0; q < 8; q++) line([100 + q * 48, 418 - q * 6], [100 + q * 48, 398 - q * 6], 2, 39222 + q, 0.1, P.paper);
  shape(R(470, 360, 30, 16), { lw: 1, id: 39240, fill: '#9fb3c6' }); X.globalAlpha = 0.3 + 0.3 * Math.sin(lt * 9); X.fillStyle = '#9fb3c6'; X.beginPath(); X.arc(485, 368, 40, 0, 6.283); X.fill(); X.globalAlpha = 1;
  // the hose over the wall
  ink([[300, 560], [600, 420], [880, 440], [920, 470]], 6, 39250, 0.3, '#d9cfb4');
  for (let q = 0; q < 12; q++) { X.globalAlpha = 0.5; line([920 + q * 6, 470 + q * 4], [940 + q * 8, 480 + q * 6], 1, 39260 + q, 0.4, P.paper); } X.globalAlpha = 1;
  rain(lt, o.rain ?? 0.5);
}
/* the bonnet of the engine, close: papers laid on it */
function bonnet(lt) {
  X.fillStyle = '#7e2c25'; X.fillRect(-600, -600, 2600, 2000);
  for (let y = -100; y < 900; y += 5) { X.fillStyle = 'rgba(28,24,20,.18)'; X.fillRect(-600, y, 2600, 1.4); }
  X.globalAlpha = 0.25; X.fillStyle = '#f1e6c4'; X.beginPath(); X.ellipse(640, 300, 520, 160, 0, 0, 6.283); X.fill(); X.globalAlpha = 1;
  void lt;
}

/* ---------- the forecast: a dot picture of the film's own frame ---------- */
const TAB = { cam: ON(792, 470, 1.75) };
const BEL_KNEEL = { kind: 'B', x: 780, y: FL, s: 1.0, f: -1, pose: 'kneel', hn: [10, -118], hf: [-12, -122], wig: [0, -128], bareFar: true, id: 40000 };
function tableau(lt, live = {}) {
  cam(TAB.cam, () => {
    hall(lt, { shut: 1, gap: live.gap || 0, receiver: live.receiver || 'tile', recvX: 600, boots: live.boots ?? true, fanOn: true, hallLamp: live.hallLamp ?? true, lamp1: true, lamp2: !!live.lamp2, chainDown: 1, glow: 0 });
    // the empty glove palm up by his knee, a white stitch at the thumb
    ball(730, FL - 8, 12, 40100, PAT.d, 1.4, P.ink); line([724, FL - 14], [736, FL - 18], 1.6, 40101, 0.1, P.paper);
    human({ ...BEL_KNEEL, mouth: live.mouth || 0 });
    if (live.extra) live.extra();
  });
}
let DOTS = null;
function prepDots() {
  const big = document.createElement('canvas'); big.width = W; big.height = H; const keep = X; X = big.getContext('2d');
  X.fillStyle = P.paper; X.fillRect(0, 0, W, H); BOIL = 0; tableau(0, {}); const sm = document.createElement('canvas'); sm.width = 160; sm.height = 90;
  const sx = sm.getContext('2d'); sx.drawImage(big, 0, 0, 160, 90); const d = sx.getImageData(0, 0, 160, 90).data;
  DOTS = new Float32Array(160 * 90); for (let i = 0; i < 160 * 90; i++) { const r = d[i * 4], g = d[i * 4 + 1], b = d[i * 4 + 2]; DOTS[i] = 1 - (0.3 * r + 0.59 * g + 0.11 * b) / 255; DOTS[i] = DOTS[i] > 0.08 ? DOTS[i] : 0; }
  DOTS.red = new Uint8Array(160 * 90); for (let i = 0; i < 160 * 90; i++) DOTS.red[i] = d[i * 4] > d[i * 4 + 1] * 1.5 && d[i * 4] > 90 ? 1 : 0;
  X = keep;
}
/* the dot-matrix picture in rect x,y,w,h, printed down to fraction u */
function dotPicture(x, y, w, h, u, o = {}) {
  if (!DOTS) return;
  shape(R(x, y, w, h), { lw: o.lw ?? 1.2, id: 40200, fill: CARD });
  const rows = Math.floor(90 * clamp(u)), cw = w / 160, ch = h / 90;
  for (let r = 0; r < rows; r++) for (let c = 0; c < 160; c++) { const v = DOTS[r * 160 + c]; if (!v) continue; X.fillStyle = DOTS.red[r * 160 + c] && !o.mono ? P.red : P.ink; const s = Math.min(cw, ch) * 0.5 * Math.sqrt(v) * 1.15; X.beginPath(); X.arc(x + (c + 0.5) * cw, y + (r + 0.5) * ch, s, 0, 6.283); X.fill(); }
  if (u < 1 && u > 0) { X.fillStyle = P.ink; X.fillRect(x + ((GT * 900) % w), y + rows * ch - 1, 10, 3); }
}
/* a printed sheet full-frame: dot picture plus caption rows */
function forecastSheet(u, rows, o = {}) {
  X.fillStyle = '#d9cfb4'; X.fillRect(-600, -600, 2600, 2000);
  const x = 200, y = 40, w = 880, h = 640;
  shape(R(x, y, w, h), { lw: 1.6, id: 40300, fill: CARD });
  for (let k = 0; k < 40; k++) { X.fillStyle = P.ink; X.beginPath(); X.arc(x + 14, y + 12 + k * 16, 3.2, 0, 6.283); X.fill(); X.beginPath(); X.arc(x + w - 14, y + 12 + k * 16, 3.2, 0, 6.283); X.fill(); }
  dotPicture(x + 50, y + 40, w - 100, (w - 100) * 9 / 16, u, { lw: 0 });
  (rows || []).forEach((r, i) => { if (o.reveal != null && i >= o.reveal) return; mono(r[0], x + 60, y + 560 + i * 26, 15, { align: 'left', col: r[1] ? P.red : P.ink }); });
}
function textSheet(rows, o = {}) {
  X.fillStyle = o.ground || '#d9cfb4'; X.fillRect(-600, -600, 2600, 2000);
  const x = 230, y = 150, w = 820, h = 420;
  shape(R(x, y, w, h), { lw: 1.6, id: 40400, fill: o.fill || CARD });
  rows.forEach((r, i) => { if (o.reveal != null && i >= o.reveal) return; const sz = r[2] || 18; mono(r[0], o.center ? x + w / 2 : x + 50, y + 70 + i * (sz * 1.9), sz, { align: o.center ? 'center' : 'left', col: r[1] ? P.red : P.ink }); });
}
/* the instant photograph: the same frame, smaller, with a heel and two fingers at its edge */
function instantPhoto(x, y, w, form = 0) {
  const h = w * 9 / 16;
  shape(R(x - 12, y - 12, w + 24, h + 48), { lw: 1.2, id: 40500, fill: P.paper });
  X.save(); path(R(x, y, w, h)); X.clip(); X.translate(x, y); X.scale(w / W, h / H); X.fillStyle = P.paper; X.fillRect(0, 0, W, H);
  tableau(0, { extra: () => { human({ kind: 'I', x: 930, y: FL, s: 1, f: 1, pose: 'flat', id: 40600 }); } });
  X.restore();
  if (form > 0) { X.save(); X.globalAlpha = 1; shape(R(x + w * (1 - 0.32 * form), y - 20, w * 0.4, h + 60), { lw: 1.2, id: 40510, fill: CARD }); for (let q = 0; q < 8; q++) line([x + w * (1 - 0.32 * form) + 10, y + q * 16], [x + w * (1 - 0.32 * form) + w * 0.3, y + q * 16], 0.7, 40511 + q, 0.1); mono('CUSTOMER ACTION', x + w * (1 - 0.32 * form) + w * 0.18, y + h + 22, 6.4, { col: P.ink }); X.restore(); }
}

/* ---------- split screen for telephone calls ---------- */
function split(left, right, k = 0.5) {
  X.save(); path(R(PX0, PY0, W * k - PX0, PY1 - PY0)); X.clip(); left(); X.restore();
  X.save(); path(R(W * k, PY0, PX1 - W * k, PY1 - PY0)); X.clip(); right(); X.restore();
  line([W * k - 3, PY0], [W * k - 3, PY1], 1.4, 41000, 0.1); line([W * k + 3, PY0], [W * k + 3, PY1], 1.4, 41001, 0.1);
}
const half = (c, side) => ({ ...c, x: c.x + (side < 0 ? 320 : -320) / c.z });
const say = (sh, who, lt) => sayAt(sh, who, lt);

/* ================= shots ================= */
SHOTS.title = (lt, sd, sh) => {
  const pr = cue(sh, 'print'), cp = cue(sh, 'caption'), nm = cue(sh, 'name');
  const u = U(lt, pr.at, pr.to), reveal = lt < cp.at ? 0 : lt < cp.at + 0.8 ? 1 : 2;
  const c = camFor(lt, [[0, ON(640, 330, 1.45)], [pr.at + 2, ON(640, 360, 1.12), 5.5], [nm.at - 0.3, ON(640, 360, 1.0), 1.2]]);
  cam(c, () => forecastSheet(u, [['CASE 012 / ROESSLER BOARDING HOUSE', 0], ['FORECAST LOSS 21:17', 1]], { reveal }));
  if (lt > nm.at) { X.globalAlpha = U(lt, nm.at, nm.at + 1); shape(R(340, 300, 600, 110), { lw: 1.6, id: 42000, fill: P.paper }); txt('THE HOUSE IS OCCUPIED', 640, 342, 40, {}); txt('after Italo Calvino, The Burning of the Abominable House', 640, 384, 17, { italic: true }); X.globalAlpha = 1; }
};

SHOTS.lab = (lt, sd, sh) => {
  const L = sh.lines, se = cue(sh, 'sheet'), ch = cue(sh, 'cheque');
  const ins = lt > se.at - 0.2 && lt < se.to + 2.4 ? 1 : 0, cheq = lt > ch.at - 0.2 ? 1 : 0;
  if (ins) { const n = lt < se.to ? (lt - se.at) / (se.to - se.at) : 1; cam(withTight(sh, lt, ON(640, 360, 1.0), 640, 330, 1.25), () => textSheet([['21:16   PROTECTIVE ORDER / CLOSE STOCKROOM SHUTTER', 0, 17], ['21:17   ESTIMATED LOSS / FIRE', 1, 17]], { reveal: n < 0.5 ? 1 : 2 })); return; }
  if (cheq) { cam(camFor(lt - ch.at, [[0, ON(640, 380, 1.05)], [1.5, ON(640, 360, 1.18), 6]]), () => { textSheet([['RESERVE MUTUAL', 0, 16], ['INVOICE RETURNED', 0, 13], ['PAYMENT ON INDEPENDENT CERTIFICATION', 1, 13], ['', 0, 13], ['PAY .........................................', 0, 13], ['SIGNATURE ___________________________', 0, 13]], {}); }); return; }
  const c = camFor(lt, [[0, ON(930, 240, 2.4)], [L[0].t1, ON(925, 250, 3.4), 3.2], [L[1].t1 + 0.2, WIDE, 1.0]]); const c2 = withTight(sh, lt, c, 1085, 395, 2.8);
  cam(c2, () => { labRoom(lt, { belindo: true, clock: [9, 6], cab: { print: 0 } }); reader(RDX, 1, lt, { look: -0.6, down: false }); });
};

SHOTS.call = (lt, sd, sh) => {
  const L = sh.lines, stp = cue(sh, 'staple');
  const fu = fulcrum(sh), tk = tightU(sh, lt);
  const wHead = () => { labRoom(lt, { clock: [9, 7] }); human({ kind: 'W', x: 1000, y: FLOOR, s: 1.3, f: -1, pose: 'sit', hn: [-6, -152], look: 0.2, mouth: say(sh, 'W', lt), id: 43000 }); ink([[990, FLOOR - 150], [1040, 520], [1046, 512]], 1.2, 43100, 0.5); };
  const kHead = () => { officeSet(lt); human({ kind: 'K', x: 720, y: FLOOR, s: 1.3, f: -1, pose: 'sit', hn: [-6, -150], hf: [30, -86], look: 0, mouth: say(sh, 'K', lt), id: 43200 });
    if (lt > stp.at) { X.save(); X.translate(600, 494); X.rotate(-0.06); shape(R(-60, -30, 120, 40), { lw: 1, id: 43300, fill: CARD }); X.restore(); } };
  if (tk > 0.02) { cam(blendCam(ON(800, 560 - 160, 1.0), ON(716, FLOOR - 236, 2.8), E.io(tk)), kHead); return; }
  const z = 1.75 - 0.15 * U(lt, 0, sd);
  split(() => cam(half(ON(980, 420, z), -1), wHead), () => cam(half(ON(710, 420, z), 1), kHead));
  void L; void fu;
};

SHOTS.replay = (lt, sd, sh) => {
  const L = sh.lines, wh = cue(sh, 'withhold'), pa = cue(sh, 'party'), ow = cue(sh, 'own'), go = cue(sh, 'go');
  if (lt < go.at) {
    const c = withTight(sh, lt, camFor(lt, [[0, ON(640, 360, 1.0)], [L[2].t0, ON(640, 400, 1.15), 1.5]]), 520, 530, 1.7);
    cam(c, () => {
      X.fillStyle = '#d9cfb4'; X.fillRect(-600, -600, 2600, 2000);
      shape(R(150, 60, 980, 600), { lw: 2, id: 44000, fill: '#bfb39a', h: [0, 3, 0.3] });
      shape(R(200, 100, 880, 520), { lw: 1.6, id: 44001, fill: NIGHT });
      const T_ = (s, x, y, sz, col) => txt(s, x, y, sz, { mono: true, col: col || P.paper, align: 'left' });
      T_('LOCAL REPLAY / CASE 012', 240, 140, 16);
      // timeline
      line([240, 210], [1040, 210], 1.4, 44010, 0.1, P.paper); [['21:06', 240], ['21:16', 820], ['21:17', 900]].forEach(([s, x]) => { line([x, 202], [x, 218], 1.4, 44011 + x, 0.1, P.paper); T_(s, x - 20, 240, 12); });
      const wd = lt > wh.at; shape(R(770, 160, 120, 30), { lw: 1.4, id: 44020, fill: wd ? NIGHT : '#6f6a61', col: P.paper }); T_(wd ? 'WITHHOLD' : 'SEND', 786, 181, 13, wd ? P.red : P.paper);
      if (wd) { T_('21:16   NO ORDER', 240, 300, 15); T_('21:17   PROJECTED LOSS / NONE', 240, 326, 15); T_('LOCAL COPY ONLY. LIVE SCHEDULE UNCHANGED.', 240, 360, 13, P.red); }
      if (lt > pa.at - 2) { T_('PARTIES', 240, 420, 13); ['ROESSLER', 'OGIVA', 'INIGO', 'BELINDO'].forEach((n, i) => T_(n, 260 + i * 150, 448, 13));
        const typed = lt < pa.at ? 'SKILLER'.slice(0, Math.floor(7 * U(lt, pa.at - 1.4, pa.at))) : lt < ow.at - 1.4 ? 'SKILLER' : 'WALDEMAR'.slice(0, Math.floor(8 * U(lt, ow.at - 1.4, ow.at)));
        shape(R(256, 466, 200, 26), { lw: 1, id: 44030, fill: NIGHT, col: P.paper }); T_(typed + (Math.sin(lt * 8) > 0 ? '_' : ''), 264, 485, 13);
        if (lt > pa.at && lt < ow.at - 1.4) T_('PARTY MUST BE INSURED AT THIS ADDRESS.', 240, 540, 15, P.red);
        if (lt > ow.at) T_('OBSERVER. CANNOT BE ENTERED.', 240, 540, 18, P.red); }
    });
    return;
  }
  const u = U(lt, go.at, sd - 0.5);
  cam(ON(640, 380, 1.0), () => { labRoom(lt, { door: U(lt, go.at + 1.6, go.at + 2.4), clock: [9, 9] }); human({ kind: 'W', x: lerp(900, 380, u), y: FLOOR, s: 1.0, f: -1, pose: 'walk', ph: lt * 7, id: 44100, sheet: [24, -120] }); });
};

SHOTS.yard = (lt, sd, sh) => {
  const L = sh.lines, cr = cue(sh, 'cross'), un = cue(sh, 'unfold'), en = cue(sh, 'enter');
  if (lt < cr.to) { const u = U(lt, 0, cr.to);
    cam(camFor(lt, [[0, ON(500, 420, 1.15)], [1.0, ON(760, 440, 1.25), cr.to]]), () => { yardSet(lt); human({ kind: 'W', x: lerp(140, 880, u), y: 600 - 70 * u, s: 0.42, f: 1, pose: 'walk', ph: lt * 9, id: 45000 }); human({ kind: 'B', x: 982, y: 469, s: 0.18, f: -1, id: 45100 }); });
    return; }
  const unfolded = lt > un.at, goIn = U(lt, en.at, en.at + 1.0);
  let c = camFor(lt, [[cr.to, ON(640, 400, 1.15)], [L[3].t0, ON(620, 360, 1.5), 1.2]]);
  { const [hx, hy] = headPos({ kind: 'B', x: 640, y: 640, s: 1.15, f: -1 }); c = withTight(sh, lt, c, hx, hy + 30, 3.0); }
  cam(c, () => {
    doorway(lt);
    human({ kind: 'B', x: 640 + goIn * 60, y: 640, s: 1.15, f: -1, alpha: 1 - goIn, hn: unfolded ? [34, -150] : [16, -180], hf: [-10, -96], mouth: say(sh, 'B', lt), look: unfolded ? 0.5 : 0, lookY: unfolded ? 1 : 0, id: 45200 });
    human({ kind: 'W', x: 380 + goIn * 90, y: 690, s: 1.3, f: 1, hn: [40, -120], hf: [36, -126], mouth: say(sh, 'W', lt), id: 45300 });
    if (unfolded) { X.save(); X.translate(560, 520); X.rotate(-0.08); dotPicture(-60, -40, 120, 68, 1, { lw: 1 }); X.restore(); }
    rain(lt, 0.9);
  });
};

SHOTS.hall = (lt, sd, sh) => {
  const L = sh.lines, cl = cue(sh, 'climb'), u = U(lt, cl.at, cl.at + 2.2);
  let c = camFor(lt, [[0, ON(560, 400, 1.15)], [L[0].t0 + 3, ON(790, 470, 1.55), 3.5], [L[0].t1 - 2, ON(640, 380, 1.0), 2.0], [L[1].t0 + 0.2, ON(330, 440, 1.6), 1.0]]);
  { const [hx, hy] = headPos({ kind: 'R', x: 360, y: FL, s: 1, f: -1, pose: 'sit' }); c = withTight(sh, lt, c, hx, hy + 20, 2.7); }
  cam(c, () => {
    hall(lt, { door: 0 });
    shape(R(340, 516, 56, 8), { lw: 1.2, id: 46000, h: [0, 3, 0.5] }); line([346, 524], [344, FL], 2.4, 46001, 0.1); line([390, 524], [392, FL], 2.4, 46002, 0.1);
    human({ kind: 'R', x: 370, y: FL, s: 1, f: -1, pose: 'sit', hn: [34, -96], mouth: say(sh, 'R', lt), id: 46100, look: 0.4 });
    human({ kind: 'W', x: 150, y: FL, s: 1, f: 1, mouth: say(sh, 'W', lt), sheet: [30, -110], hn: [30, -110], id: 46200 });
    human({ kind: 'B', x: lerp(220, 840, u), y: FL - 24 * clamp(u * 1.5) - 220 * clamp((u - 0.4) / 0.6), s: 1.05, f: 1, pose: u > 0 && u < 1 ? 'walk' : 'stand', ph: lt * 7, alpha: 1 - U(u, 0.85, 1), id: 46300 });
  });
};

SHOTS.ogiva = (lt, sd, sh) => {
  const L = sh.lines, lb = cue(sh, 'label'), bl = cue(sh, 'blouse'), st = cue(sh, 'stand');
  const wigTaken = lt > lb.at, liftU = Math.sin(Math.PI * U(lt, st.at, st.at + 2.4));
  if (lt > lb.at + 0.2 && lt < L[2].t0 - 0.3) { cam(ON(640, 360, 1.0), () => { X.fillStyle = '#d9cfb4'; X.fillRect(-600, -600, 2600, 2000); wigMass(640, 330, 9, 47000); X.save(); X.translate(640, 360); X.rotate(0.04); shape(R(-130, -26, 260, 52), { lw: 1.6, id: 47010, fill: P.paper }); txt('OGIVA', 0, 2, 30, { col: P.ink }); for (let q = 0; q < 26; q++) line([-120 + q * 9.4, -20], [-116 + q * 9.4, -24], 1, 47020 + q, 0.05, P.red); X.restore(); }); return; }
  let c = camFor(lt, [[0, ON(560, 400, 1.05)], [L[0].t1, ON(560, 420, 1.3), 1.2], [L[3].t0, ON(700, 430, 1.35), 1.0], [L[4].t0, ON(560, 400, 1.1), 1.0]]);
  { const [hx, hy] = headPos({ kind: 'O', x: 860, y: FLOOR, s: 1.2, f: -1, pose: 'sit' }); c = withTight(sh, lt, c, hx - 10, hy + 26, 2.8); }
  cam(c, () => {
    ogivaRoom(lt, { wigOff: wigTaken, standLift: liftU * 40 });
    human({ kind: 'O', x: 860, y: FLOOR, s: 1.2, f: -1, pose: 'sit', hn: lt > st.at && lt < st.at + 2.4 ? [96, -96 - liftU * 40] : [40, -98], mouth: say(sh, 'O', lt), id: 47100 });
    human({ kind: 'B', x: 190, y: FLOOR, s: 1.05, f: 1, mouth: say(sh, 'B', lt), hn: wigTaken ? [40, -130] : undefined, wig: wigTaken ? [40, -146] : null, id: 47200 });
    human({ kind: 'W', x: 290, y: FLOOR, s: 1, f: 1, mouth: say(sh, 'W', lt), sheet: lt < lb.at ? [36, -120] : null, hn: lt < lb.at ? [36, -120] : undefined, id: 47300 });
  });
};

SHOTS.landing = (lt, sd, sh) => {
  const L = sh.lines, dn = cue(sh, 'down'), to = cue(sh, 'touch');
  if (lt > L[4].t0 - 0.4) { const c = camFor(lt - L[4].t0, [[0, ON(700, 420, 1.0)], [2, ON(940, 520, 1.9), 3]]);
    cam(c, () => { stockroom(lt, { gap: 400 }); human({ kind: 'W', x: 880, y: FL, s: 1, f: 1, pose: 'stoop', hn: lt > to.at ? [70, -60] : [40, -90], mouth: say(sh, 'W', lt), id: 48000 }); });
    if (lt > to.at && lt < to.at + 0.4) darken(0.15, P.red); return; }
  let c = camFor(lt, [[0, ON(700, 380, 1.15)], [L[0].t1, ON(760, 330, 1.5), 1.0]]);
  const ix = 770, iy = FLOOR - 30 - 8 * 36; c = withTight(sh, lt, c, ix + 6, iy - 165, 2.8);
  cam(c, () => {
    landingSet(lt);
    const down = U(lt, dn.at, dn.at + 1.6);
    human({ kind: 'I', x: ix - down * 300, y: iy + down * 130, s: 1, f: -1, pose: down > 0 ? 'walk' : 'sit', ph: lt * 7, hn: [36, -100], hf: [30, -96], mouth: say(sh, 'I', lt), id: 48100 });
    human({ kind: 'W', x: 470, y: FLOOR - 30 - 3 * 36, s: 1, f: 1, sheet: [34, -130], hn: [34, -130], mouth: say(sh, 'W', lt), id: 48200 });
  });
};

SHOTS.desk = (lt, sd, sh) => {
  const L = sh.lines, sp = cue(sh, 'stamp'), mg = cue(sh, 'margin');
  const left = () => { hall(lt, {}); human({ kind: 'W', x: PHONE[0] - 20, y: FL, s: 1, f: 1, hn: [24, -168], mouth: say(sh, 'W', lt), id: 49000 }); ink([[PHONE[0], PHONE[1] + 10], [PHONE[0] - 10, PHONE[1] + 40], [PHONE[0] + 4, FL - 168]], 1.2, 49100, 0.5); };
  const right = () => { fireDesk(lt, { slip: lt > sp.at, margin: lt > mg.at }); human({ kind: 'A', x: 1000, y: FLOOR, s: 1.3, f: -1, pose: 'sit', hn: [70, -112], mouth: say(sh, 'A', lt), id: 49200 }); };
  const tk = tightU(sh, lt);
  if (tk > 0.02) { cam(blendCam(ON(960, 400, 1.0), ON(1000, FLOOR - 230, 2.8), E.io(tk)), right); return; }
  split(() => cam(half(ON(PHONE[0] + 20, 440, 1.7), -1), left), () => cam(half(ON(840, 430, 1.35), 1), right));
};

SHOTS.order = (lt, sd, sh) => {
  const L = sh.lines, sp = cue(sh, 'spoon'), rg = cue(sh, 'ring'), bk = cue(sh, 'back'), spk = cue(sh, 'spark'), go = cue(sh, 'go'), tr = cue(sh, 'train'), ak = cue(sh, 'ask'), chn = cue(sh, 'chain');
  if (lt > bk.at && lt < L[3].t1 + 0.4) { cam(ON(640, 360, 1.05), () => textSheet([['COVER SUBJECT TO COMPLIANCE', 0, 15], ['WITH PROTECTIVE ORDERS.', 0, 15]], { center: true, fill: CARD })); return; }
  const ringing = lt > rg.at && lt < L[1].t0, answered = lt > L[1].t0 - 0.6, trainK = U(lt, tr.at, tr.at + 1.4);
  const shut = U(lt, chn.at, chn.at + 0.7), igIn = U(lt, go.at, go.at + 1.6);
  const recv = answered ? 'hand' : 'hook';
  let c = camFor(lt, [[0, ON(640, 400, 1.0)], [rg.at - 0.2, ON(400, 430, 1.55), 1.0], [L[2].t0, ON(330, 430, 1.75), 1.0], [spk.at - 0.6, ON(800, 520, 1.9), 0.6], [L[5].t0 - 0.2, ON(480, 420, 1.3), 0.8], [tr.at, ON(560, 410, 1.15), 1.0], [ak.at - 0.3, ON(860, 430, 1.8), 0.6], [chn.at - 0.4, ON(800, 470, 1.55), 0.4]]);
  { const [hx, hy] = headPos({ kind: 'W', x: 520, y: FL, s: 1, f: 1 }); c = withTight(sh, lt, c, hx, hy + 20, 2.8); }
  const shake = trainK > 0 ? Math.sin(lt * 61) * 2.2 * trainK : 0; c = { ...c, x: c.x + shake, y: c.y + Math.cos(lt * 47) * 1.4 * trainK };
  cam(c, () => {
    hall(lt, { door: U(lt, tr.at + 0.4, tr.at + 1.2), shut, receiver: recv, recvAt: [880, 420], lamp1: lt > rg.at, spoon: lt > sp.at ? 1 : 0, spark: Math.max(0, 1 - Math.abs(lt - spk.at) * 4), boots: true });
    human({ kind: 'R', x: lt > ak.at - 1 ? 880 : 870, y: FL, s: 1, f: -1, hn: answered ? (lt > chn.at - 0.3 ? [-36, -136 + shut * 100] : [-2, -170]) : [20, -100], mouth: say(sh, 'R', lt), id: 50000 });
    human({ kind: 'W', x: lt > tr.at ? lerp(520, 170, U(lt, tr.at, tr.at + 1.4)) : 520, y: FL, s: 1, f: lt > tr.at && lt < chn.at ? -1 : 1, pose: lt > tr.at && lt < tr.at + 1.4 ? 'walk' : 'stand', ph: lt * 8, mouth: say(sh, 'W', lt), sheet: [30, -112], hn: [30, -112], id: 50100 });
    if (igIn < 1) human({ kind: 'I', x: lerp(600, 760, igIn), y: FL, s: 1, f: 1, pose: igIn > 0 ? 'walk' : 'stand', ph: lt * 7, alpha: 1 - U(igIn, 0.7, 1), id: 50200 });
    if (lt > chn.at + 0.75) darken(0.5);
  });
  if (lt > ak.at && lt < chn.at) { X.fillStyle = 'rgba(28,24,20,.6)'; X.fillRect(PX0, PY1 - 60, PX1 - PX0, 38); txt('Is everybody out of there?', 640, PY1 - 40, 18, { italic: true, col: P.paper }); }
  void ringing;
};

SHOTS.fire = (lt, sd, sh) => {
  const L = sh.lines, fl = cue(sh, 'flame'), fi = cue(sh, 'fingers'), ht = cue(sh, 'heat'), l1 = cue(sh, 'lift1'), gl = cue(sh, 'glove'), ir = cue(sh, 'iron'), mo = cue(sh, 'mouth'), lp = cue(sh, 'lamp2'), tl = cue(sh, 'tile'), l2 = cue(sh, 'lift2'), pu = cue(sh, 'pull');
  const fire = U(lt, fl.at, 20), gap = lt < l1.at ? 0 : lt < l2.at ? 8 + 10 * U(lt, gl.at, gl.at + 1) + 40 * U(lt, ir.at, ir.at + 1) : 48 + 60 * U(lt, l2.at, l2.at + 1.5);
  const inside = (lt < fi.at - 0.2) || (lt > mo.at + 0.6 && lt < L[6].t1 + 0.2) || (lt > l2.at + 1.2 && lt < pu.at);
  if (inside) {
    const crawl = U(lt, l2.at + 1.2, pu.at);
    cam(camFor(lt, [[0, ON(500, 450, 1.25)], [mo.at + 0.6, ON(300, 540, 2.0), 0.6], [l2.at + 1.2, ON(330, 520, 1.6), 0.6]]), () => {
      stockroom(lt, { gap, fire, smoke: clamp(fire * 1.3), inigo: { kind: 'I', x: lerp(380, 260, crawl), y: FL, s: 1, f: -1, pose: lt < fi.at ? 'stoop' : 'flat', hn: [52, -10], hf: [48, -6], mouth: say(sh, 'I', lt), closed: lt < fi.at, id: 51000 } });
      if (lt > mo.at) { shape(R(150, FL - Math.max(10, gap) + 2, 36, 10), { lw: 1, id: 51100, fill: P.ink }); }
    });
    return;
  }
  let c = camFor(lt, [[0, ON(790, 470, 1.5)], [fi.at, ON(790, 540, 2.2), 0.6], [ht.at, ON(780, 480, 1.55), 0.6], [gl.at, ON(780, 520, 2.1), 0.8], [ir.at - 0.4, ON(760, 470, 1.4), 0.8], [lp.at - 0.4, ON(BOX.x + 27, BOX.y + 30, 3.2), 0.5], [lp.at + 1.0, ON(700, 470, 1.35), 0.8], [tl.at - 0.5, ON(720, 520, 1.9), 0.6], [l2.at, ON(770, 480, 1.45), 0.8]]);
  cam(c, () => {
    hall(lt, { door: 1, shut: 1, gap, receiver: lt > tl.at ? 'tile' : lt > mo.at ? 'tile' : 'hang', recvX: lt > tl.at ? 690 : 668, lamp1: true, lamp2: lt > lp.at, hallLamp: false, chainDown: 1, boots: true });
    if (lt > fi.at && lt < l2.at + 1) for (let q = 0; q < 4; q++) ball(744 + q * 10, FL - 4, 3.6, 51200 + q, null, 1, P.paper);
    const bel = lt > ht.at + 1.2;
    human({ kind: 'R', x: 900, y: FL, s: 1, f: -1, pose: lt > fi.at && lt < ht.at + 1.4 ? 'stoop' : 'stand', hn: lt > fi.at && lt < ht.at ? [80, -24] : [10, -110], mouth: say(sh, 'R', lt), id: 51300 });
    if (!bel) human({ kind: 'W', x: 700, y: FL, s: 1, f: 1, pose: 'stoop', hn: [70, -40], hf: [66, -36], id: 51400 });
    else human({ kind: 'W', x: lt > mo.at && lt < tl.at + 0.4 ? 660 : 640, y: FL, s: 1, f: 1, pose: lt > mo.at && lt < tl.at ? 'flat' : lt > l2.at ? 'stoop' : 'stand', hn: lt > l2.at ? [100, -10] : [40, -30], mouth: say(sh, 'W', lt), id: 51400 });
    if (bel) human({ kind: 'B', x: 770, y: FL, s: 1, f: -1, pose: 'kneel2', hn: [-40, -16], hf: [-30, -18], bareFar: lt > gl.at + 1, wig: lt > l2.at ? [-40, -24] : null, mouth: say(sh, 'B', lt), id: 51500 });
    if (lt > ir.at) human({ kind: 'O', x: lt > ir.at + 0.8 ? 730 : lerp(700, 730, U(lt, ir.at, ir.at + 0.8)), y: FL, s: 1, f: 1, pose: 'stoop', hn: [30, -14], mouth: say(sh, 'O', lt), id: 51600 });
    if (lt > ir.at + 0.6) { line([712, FL - 4], [716, FL - 4 - Math.min(40, gap)], 3, 51700, 0.1); shape(R(700, FL - 8, 30, 6), { lw: 1, id: 51701, fill: P.ink }); }
  });
};

SHOTS.picture = (lt, sd, sh) => {
  const L = sh.lines, mt = cue(sh, 'match'), fs = cue(sh, 'flash'), ph = cue(sh, 'phone');
  const showDots = lt > mt.at + 0.6 && lt < fs.at - 0.4 ? U(lt, mt.at + 0.6, mt.at + 1.6) * (1 - U(lt, fs.at - 1.2, fs.at - 0.4)) : 0;
  if (lt < ph.at) {
    tableau(lt, { gap: 0, receiver: 'tile', hallLamp: false, lamp2: true });
    if (showDots > 0) { X.save(); X.globalAlpha = showDots; X.fillStyle = CARD; X.fillRect(0, 0, W, H); dotPicture(0, 0, W, H, 1, { lw: 0 }); X.restore(); }
    if (lt > fs.at && lt < fs.at + 0.5) { X.globalAlpha = 1 - U(lt, fs.at, fs.at + 0.5); X.fillStyle = '#fffdf6'; X.fillRect(0, 0, W, H); X.globalAlpha = 1; }
    return;
  }
  cam(camFor(lt - ph.at, [[0, ON(300, 430, 1.4)], [2, ON(420, 420, 1.2), 3]]), () => {
    hall(lt, { door: 1, shut: 1, receiver: 'hand', recvAt: [170, 440], lamp1: true, lamp2: true, hallLamp: false, blue: 1, chainDown: 1 });
    human({ kind: 'K', x: 150, y: FL, s: 1, f: 1, hn: [24, -170], mouth: say(sh, 'K', lt), id: 52000 });
    human({ kind: 'O', x: 420, y: FL, s: 1, f: -1, mouth: say(sh, 'O', lt), id: 52100 });
    human({ kind: 'B', x: 770, y: FL, s: 1, f: -1, pose: 'kneel', hn: [10, -118], hf: [-12, -122], wig: [0, -128], bareFar: true, id: 52200 });
  });
};

const FIVE = [['O', 600], ['I', 680], ['B', 770], ['W', 860], ['R', 950]];
SHOTS.count = (lt, sd, sh) => {
  const L = sh.lines, to = cue(sh, 'touch'), fm = cue(sh, 'form'), wg = cue(sh, 'wig');
  if (lt > fm.at + 0.8 && lt < wg.at) { cam(ON(640, 360, 1.0), () => { bonnet(lt); instantPhoto(330, 200, 620, U(lt, fm.at + 3.0, fm.at + 4.2)); }); return; }
  let c = camFor(lt, [[0, ON(700, 420, 1.05)], [L[0].t1, ON(780, 430, 1.45), 1.0], [wg.at, ON(620, 430, 1.4), 1.0]]);
  { const [hx, hy] = headPos({ kind: 'R', x: 950, y: 620, s: 0.9, f: -1 }); c = withTight(sh, lt, c, hx - 40, hy + 30, 2.6); }
  const tk = U(lt, to.at, to.to + 0.4);
  cam(c, () => {
    engineSet(lt, { rain: 0.4 });
    human({ kind: 'C', x: 520, y: 620, s: 0.95, f: 1, mouth: say(sh, 'C', lt), id: 53000 });
    human({ kind: 'K', x: 440, y: 620, s: 0.95, f: 1, mouth: say(sh, 'K', lt), hn: lt > wg.at + 0.5 ? [40, -110] : undefined, wig: lt > wg.at + 0.5 ? [42, -122] : null, id: 53100 });
    FIVE.forEach(([k, x], i) => human({ kind: k, x, y: 620, s: 0.9, f: -1, pose: 'stand', hn: k === 'R' ? [lerp(10, 40 + (4 - Math.floor(tk * 5)) * 0, tk), -130] : undefined, mouth: say(sh, k, lt), gauze: k === 'B', id: 53200 + i * 100 }));
    if (tk > 0 && tk < 1) { const n = Math.min(4, Math.floor(tk * 5)); const [tx] = FIVE[3 - Math.min(3, n)]; X.globalAlpha = 0.8; ball(tx, 520, 5, 53900, null, 1, P.red); X.globalAlpha = 1; }
  });
};

SHOTS.evidence = (lt, sd, sh) => {
  const L = sh.lines, pr = cue(sh, 'pair'), wr = cue(sh, 'write'), rd = cue(sh, 'radio'), cb = cue(sh, 'carbon');
  const pairing = lt < L[2].t1 + 0.5 || (lt > L[3].t1 + 0.5 && lt < L[4].t1 + 0.4);
  if (pairing) {
    let c = camFor(lt, [[0, ON(640, 360, 1.0)], [L[2].t1, ON(640, 340, 1.08), 2.0]]); c = withTight(sh, lt, c, 640, 300, 1.25);
    cam(c, () => { bonnet(lt); X.save(); X.translate(330, 290); X.rotate(-0.04); dotPicture(-260, -150, 500, 281, 1); X.restore(); instantPhoto(700, 180, 460, 1); mono('21:06', 330, 470, 14, { col: P.red }); mono('21:17', 930, 470, 14, { col: P.red }); });
    return;
  }
  if (lt > wr.at - 0.4 && lt < wr.to + 1.0) { const n = U(lt, wr.at, wr.to);
    cam(ON(640, 360, 1.0), () => { bonnet(lt); X.save(); X.translate(640, 300); X.rotate(-0.03); dotPicture(-320, -200, 640, 360, 1); X.restore();
      const a = '21:09   I CROSSED THE YARD.', b = '21:16   I SENT INIGO TO THE SOCKET.', tot = a.length + b.length + 10, k = Math.floor(tot * n);
      shape(R(310, 536, 660, 100), { lw: 1.2, id: 54950, fill: CARD });
      mono(a.slice(0, k), 330, 560, 15, { align: 'left', col: P.ink }); mono(b.slice(0, Math.max(0, k - a.length)), 330, 588, 15, { align: 'left', col: P.ink }); if (n > 0.95) txt('Waldemar', 900, 620, 22, { italic: true }); });
    return; }
  if (lt > cb.at + 0.6) { cam(ON(640, 360, 1.0), () => textSheet([['RECEIPT No. 0418          ROESSLER', 0, 14], ['ONE WEEK’S RENT', 0, 14], ['', 0, 14], ['21:16  CLOSE STOCKROOM SHUTTER', 1, 16], ['(carbon copy)', 0, 11]], { fill: '#2f2a26', ground: '#7e2c25' })); return; }
  let c = camFor(lt, [[0, ON(640, 420, 1.15)], [rd.at, ON(520, 420, 1.5), 1.0]]); c = withTight(sh, lt, c, 525, 448, 2.8);
  cam(c, () => {
    engineSet(lt, { rain: 0.3 });
    human({ kind: 'C', x: 520, y: 620, s: 0.95, f: 1, hn: lt > rd.at ? [24, -160] : undefined, mouth: say(sh, 'C', lt), id: 54000 });
    human({ kind: 'K', x: 420, y: 620, s: 0.95, f: 1, mouth: say(sh, 'K', lt), id: 54100 });
    FIVE.forEach(([k, x], i) => human({ kind: k, x: x - 40, y: 620, s: 0.9, f: -1, mouth: say(sh, k, lt), gauze: k === 'B', id: 54200 + i * 100 }));
    if (lt > rd.at) { X.save(); X.globalAlpha = 0.85; shape(R(150, 560, 300, 40), { lw: 1.2, id: 54900, fill: CARD }); mono('012   21:13   ORDER: DROP STOCKROOM SHUTTER', 300, 584, 7.5, { col: P.ink }); X.restore(); }
  });
};

SHOTS.participant = (lt, sd, sh) => {
  const L = sh.lines, ce = cue(sh, 'cert'), ho = cue(sh, 'handover'), rd = cue(sh, 'radio');
  if (lt < ho.at + 1.4) { const c = withTight(sh, lt, camFor(lt, [[0, ON(640, 360, 1.0)], [1, ON(640, 330, 1.1), 3]]), 640, 300, 1.3);
    cam(c, () => textSheet([['RESERVE MUTUAL', 0, 16], ['CERTIFICATION', 0, 14], ['', 0, 14], ['INDEPENDENT OBSERVER:', 0, 14], ['__________________________', 0, 14]], {})); return; }
  const put = U(lt, rd.at, rd.at + 2.6);
  cam(camFor(lt, [[ho.at, ON(560, 420, 1.25)], [rd.at, ON(470, 450, 1.6), 1.2]]), () => {
    engineSet(lt, { rain: 0.2 });
    shape(R(330, 482, 120, 16), { lw: 1, id: 55000, fill: '#d9cfb4' });
    if (put > 0.6) wigMass(390, 476, 1, 55010);
    human({ kind: 'C', x: 540, y: 620, s: 0.95, f: -1, hn: [40, -110], mouth: say(sh, 'C', lt), id: 55100 });
    human({ kind: 'K', x: 420, y: 620, s: 0.95, f: 1, mouth: say(sh, 'K', lt), hn: put < 0.6 ? [36, -116] : [44, -150], wig: put < 0.6 ? [38, -128] : null, id: 55200 });
    FIVE.forEach(([k, x], i) => human({ kind: k, x: x + 20, y: 620, s: 0.9, f: -1, gauze: k === 'B', id: 55300 + i * 100 }));
  });
};

SHOTS.dawn = (lt, sd, sh) => {
  const L = sh.lines, sk = cue(sh, 'strike'), te = cue(sh, 'tear'), stn = cue(sh, 'stone'), tr = cue(sh, 'train');
  const printing = lt > sk.at, torn = lt > te.at;
  let c = camFor(lt, [[0, ON(640, 380, 1.0)], [sk.at - 0.4, ON(160, 520, 2.0), 1.0], [te.at, ON(250, 470, 1.6), 0.8], [stn.at, ON(520, 400, 1.15), 1.6]]);
  { c = withTight(sh, lt, c, 250, FLOOR - 196, 2.8); }
  cam(c, () => {
    labRoom(lt, { dawn: true, door: U(lt, stn.at, stn.at + 1.2), stone: lt > stn.at + 1.0, train: lt > tr.at, clock: [5, 52], cab: { print: printing && !torn ? U(lt, sk.at, sk.at + 2.0) : 0, printText: ['CASE 013', '14 TANNERY ROW', ''] } });
    human({ kind: 'B', x: 940, y: FLOOR, s: 1.05, f: -1, pose: 'sit', gauze: true, hn: [20, -150], id: 56000 });
    human({ kind: 'R', x: 860, y: FLOOR, s: 0.95, f: 1, hn: [40, -110], id: 56100 });
    human({ kind: 'O', x: 700, y: FLOOR, s: 0.95, f: 1, hn: [34, -104], wig: [36, -112], id: 56200 });
    human({ kind: 'I', x: lt < stn.at ? 520 : 560, y: FLOOR, s: 0.95, f: 1, shoes: false, hn: [30, -96], mugs: true, id: 56300 });
    human({ kind: 'W', x: 250, y: FLOOR, s: 1, f: -1, hn: torn ? [-10, -168] : [-30, -120], sheet: torn ? [40, -100] : null, mouth: say(sh, 'W', lt), id: 56400 });
  });
};

SHOTS.end = (lt, sd, sh) => {
  cam(ON(640, 380, 1.0), () => { labRoom(lt, { dawn: true, door: 1, stone: true, train: true, clock: [5, 55] }); });
  X.globalAlpha = seg(lt, 1.0, 2.2);
  shape(R(220, 296, 840, 200), { lw: 1.6, id: 57000, fill: P.paper });
  txt('THE HOUSE IS OCCUPIED', 640, 334, 30, {});
  txt('from Watson Hartsoe’s screenplay', 640, 376, 18, { italic: true });
  txt('after Italo Calvino, The Burning of the Abominable House, in Numbers in the Dark,', 640, 424, 14, { italic: true });
  txt('translated by Tim Parks. Nothing is quoted from Calvino.', 640, 446, 14, { italic: true });
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
  X.setTransform(1, 0, 0, 1, 0, 0); X.globalAlpha = 1; cornerClock(sh.clock);
  X.restore(); X.setTransform(1, 0, 0, 1, 0, 0); X.globalAlpha = 1;
  const fade = sh.shot === 'title' ? Math.max(1 - seg(lt, 0, 0.6), seg(lt, sd - 0.7, sd)) : sh.shot === 'end' ? Math.max(1 - seg(lt, 0, 0.5), seg(lt, sd - 1.2, sd)) : Math.max(1 - seg(lt, 0, 0.4), seg(lt, sd - 0.3, sd));
  if (fade > 0) { X.fillStyle = P.paper; X.globalAlpha = fade; X.fillRect(0, 0, W, H); X.globalAlpha = 1; }
  border();
};
(async () => {
  T = await (await fetch('timing/hi.json')).json();
  await document.fonts.ready; await Promise.all(['IM Fell English', 'IBM Plex Mono'].map((n) => document.fonts.load(`20px "${n}"`))); await document.fonts.load(`italic 20px "IM Fell English"`);
  await document.fonts.load('600 10px "IBM Plex Mono"');
  X = document.getElementById('film').getContext('2d');
  prepDots();
  window.__NF = Math.ceil(T.dur * 24); window.__T = T; window.__ready = true;
})();
