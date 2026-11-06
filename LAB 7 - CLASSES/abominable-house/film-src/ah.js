/* The Burning of the Abominable House. Drawing. After Italo Calvino. Toolkit: ink.js (Kingdoms in a Box); the room, desk and seated reader from the bitic films (bt.js). */
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

/* ================= shots ================= */
SHOTS.title = (lt) => {
  X.fillStyle = P.paper; X.fillRect(0, 0, W, H);
  const t1 = 'THE BURNING OF THE ABOMINABLE HOUSE', n = Math.floor(t1.length * U(lt, 0.8, 3.2));
  X.font = FONTR(44); const fullW = X.measureText(t1).width; X.textAlign = 'left'; X.textBaseline = 'middle'; X.fillStyle = P.ink; X.fillText(t1.slice(0, n), CX - fullW / 2, 116);
  X.globalAlpha = seg(lt, 3.2, 4.1); txt('four tenants, twelve deeds, and a computer asked to put them in order', CX, 172, 24, { italic: true });
  X.globalAlpha = seg(lt, 3.8, 4.7);
  txt('after Italo Calvino, The Burning of the Abominable House, in Numbers in the Dark,', CX, 222, 17, { italic: true });
  txt('translated by Tim Parks. Narration paraphrases Calvino.', CX, 246, 17, { italic: true });
  X.globalAlpha = 1;
  house(CX, 612, 0.95, 9700, { h: 1, smoke: seg(lt, 1, 3), lit: 1 });
};

SHOTS.ruins = (lt, sd, sh) => {
  const L = sh.lines, bu = cue(sh, 'burn'), fi = cue(sh, 'find'), fr = cue(sh, 'front'), tn = cue(sh, 'turn'), th = cue(sh, 'thirteen');
  const b = U(lt, bu.at, bu.to), st = { h: b < 0.55 ? 1 : 1 - E.io(U(b, 0.55, 1)), fire: Math.min(clamp(b * 4), 1 - U(b, 0.75, 1)), char: clamp(b * 1.6), rubble: U(b, 0.6, 1), smoke: b > 0.05 ? 1 : 0 };
  const showBook = U(lt, fr.at, fr.at + 0.8);
  let c = camFor(lt, [[0, ON(1000, 430, 2.2)], [L[0].t1 - 0.6, WIDE, 1.4], [L[1].t0 + 0.3, BOARDCAM, 1.2], [fr.at + 0.4, ON(452, 412, 1.62), 1.0], [L[6].t0 - 0.2, ON(452, 560, 2.1), 1.0]]);
  c = withTight(sh, lt, c, BC.x + 10, PG.y + 200, 1.95);
  cam(c, () => {
    lab(sh, lt, { ctr: {}, board: () => {
      if (showBook < 1) { X.globalAlpha = 1 - showBook; X.fillStyle = PAPER2; X.fillRect(PG.x, PG.y, PG.w, PG.h); X.globalAlpha = 0.5 * (1 - showBook); skyLines(PG.y, PG.y + 250, PG.y + 500); X.globalAlpha = 1 - showBook;
        house(BC.x, PG.y + 300, 0.72, 9800, st);
        if (lt > fi.at) { const u = U(lt, fi.at, fi.at + 0.8); X.save(); X.translate(BC.x + 36, PG.y + 284 - 30 * E.out(u)); X.rotate(-0.2); shape(R(-16, -11, 32, 22), { lw: 1.2, id: 9850, fill: '#4b4137' }); shape(R(-11, -7, 22, 9), { lw: 0.8, id: 9851, fill: CARD }); X.restore(); }
        X.globalAlpha = 1; }
      if (showBook > 0) copybook(lt, showBook, tn.at, { thirteen: U(lt, th.at, th.at + 0.8) });
    } });
    programmer(lt, { mouth: mouthOf(sh, lt), write: lt > L[0].t1 - 2.0 && lt < L[0].t1 - 0.4 ? 1 : 0, look: lt > L[1].t0 ? -0.6 : 0 });
  });
};

SHOTS.count = (lt, sd, sh) => {
  const L = sh.lines, cd = cues(sh, 'card'), gr = cue(sh, 'grid'), ro = cue(sh, 'roll'), sp = cue(sh, 'stamp');
  const ids = ['W', 'O', 'I', 'B'], lit = Math.floor(12 * U(lt, gr.at, gr.to));
  let c = camFor(lt, [[0, BOARDCAM], [L[4].t0 - 0.3, ON(452, 380, 1.35), 1.0], [ro.at - 0.6, COUNTCAM, 1.0], [L[6].t0 + 0.4, BOARDCAM, 1.2]]);
  c = withTight(sh, lt, c, 452, 162, 2.9);
  cam(c, () => {
    lab(sh, lt, { ctr: lt < gr.at ? {} : { people: 4, pairs: 12, val: lt < ro.at ? '' : COUNTS.start, u: U(lt, ro.at, ro.to), spoken: lt > ro.to ? 'TWELVE TO THE TWELFTH POWER' : '' },
      board: () => {
        cd.forEach((q, i) => { const u = U(lt, q.at, q.at + 0.5); if (u <= 0) return; const [x, y] = ROW4(i); X.save(); X.globalAlpha = u; personCard(ids[i], x, y - 40 * (1 - E.out(u)), 9900 + i * 100, { tilt: (hash(i, 9) - 0.5) * 0.08 }); X.restore(); });
        if (lt > gr.at - 0.3) { X.globalAlpha = U(lt, gr.at - 0.3, gr.at + 0.2); pairGrid(['W', 'O', 'I', 'B'], PG.x + 92, PG.y + 140, 44, lit); X.globalAlpha = 1; }
        if (lt > sp.at) { const u = U(lt, sp.at, sp.at + 0.3); X.save(); X.translate(BC.x + 70, PG.y + 330); X.rotate(-0.18); X.scale(1.6 - 0.6 * u, 1.6 - 0.6 * u); X.globalAlpha = u * 0.9; shape(R(-74, -18, 148, 36), { lw: 2.4, id: 9990, fill: null, col: P.red }); mono('NO FURTHER ENQUIRIES', 0, 4, 9, { col: P.red }); X.restore(); X.globalAlpha = 1; }
      } });
    programmer(lt, { mouth: mouthOf(sh, lt), look: -0.6 });
  });
};

const POL = [
  ['POLICY 1  FIRE', 'THE HOUSE. HOLDER: INIGO', 'VOID IF INIGO SET IT'],
  ['POLICY 2  LIFE', 'THE WIDOW. FOR: OGIVA', 'VOID IF OGIVA KILLED HER'],
  ['POLICY 3  PROPERTY', 'THE WIGS. HOLDER: OGIVA', 'VOID IF SHE DESTROYED THEM'],
  ['POLICY 4  INJURY', 'BELINDO’S TOUR. HOLDER: THE WIDOW', 'VOID IF SHE CAUSED IT'],
];
SHOTS.policies = (lt, sd, sh) => {
  const L = sh.lines, sl = cues(sh, 'slip'), vd = cue(sh, 'void');
  const vf = U(lt, vd.at, vd.at + 0.6);
  let c = camFor(lt, [[0, WIDE], [L[0].t1 - 0.5, BOARDCAM, 1.2], [L[6].t0 + 0.2, ON(560, 300, 1.05), 1.4]]);
  c = withTight(sh, lt, c, BC.x, BC.y + 10, 1.85);
  cam(c, () => {
    lab(sh, lt, { ctr: { people: 4, pairs: 12, val: COUNTS.start }, board: () => {
      sl.forEach((q, i) => { const u = U(lt, q.at, q.at + 0.5); if (u <= 0) return; const x = PG.x + 16 + (i % 2) * 178, y = PG.y + 20 + Math.floor(i / 2) * 186;
        X.save(); X.globalAlpha = u; slipCard(x, y - 30 * (1 - E.out(u)), 168, 170, 10000 + i * 40, { tilt: (hash(i, 4) - 0.5) * 0.06, draw: () => {
          mono(POL[i][0], x + 84, y + 30, 8.4, { col: P.ink }); line([x + 14, y + 38], [x + 154, y + 38], 0.8, 10010 + i, 0.1);
          mono(POL[i][1], x + 84, y + 56, 6.6, { col: P.ink });
          for (let k = 0; k < 5; k++) line([x + 16, y + 74 + k * 10], [x + 152 - hash(i, k) * 40, y + 74 + k * 10], 0.7, 10020 + i * 10 + k, 0.1);
          const vu = U(lt, q.at + 1.2, q.at + 1.8);
          X.globalAlpha = u * vu; mono(POL[i][2], x + 84, y + 140, 6.8, { col: P.red });
          if (vf > 0) { X.globalAlpha = u * vf; shape(R(x + 10, y + 128, 148, 20), { lw: 1.8, id: 10030 + i, fill: null, col: P.red }); }
          X.globalAlpha = u;
          if (i === 3 || i === 0) { ball(x + 140, y + 104, 12, 10040 + i, null, 1.2, '#f1d9c9'); mono('S', x + 140, y + 107, 9, { col: P.red }); }
        } }); X.restore(); });
    } });
    programmer(lt, { mouth: mouthOf(sh, lt), look: -0.6 });
  });
};

const RULES = ['1  BELINDO KNIFES NO ONE; NO ONE STRANGLES BELINDO', '2  BELINDO IS TIED UP ONLY AFTER A GUN', '3  AFTER SLANDER: NO BLACKMAIL, NO SNOOPING', '4  NO ONE STRANGLED IS ALSO KNIFED'];
const RVAL = [COUNTS.a, COUNTS.ab, COUNTS.abc, COUNTS.abcd];
SHOTS.rules = (lt, sd, sh) => {
  const L = sh.lines, ru = cues(sh, 'rule'), ch = cue(sh, 'chain'), cl = cue(sh, 'clash'), sk = cue(sh, 'strike');
  // the counter: start, then each rule's value after its typing; after strike, back to abc
  let val = COUNTS.start, from = COUNTS.start, u = 1;
  ru.forEach((q, i) => { const a = q.at + 1.8; if (lt >= a) { from = i ? RVAL[i - 1] : COUNTS.start; val = RVAL[i]; u = U(lt, a, a + 0.7); } });
  if (lt >= sk.at + 0.6) { from = COUNTS.abcd; val = COUNTS.abc; u = U(lt, sk.at + 0.6, sk.at + 1.7); }
  const clash = lt > cl.at && lt < sk.at + 0.4 ? 1 : 0, struck = U(lt, sk.at, sk.at + 0.5);
  const pos = { W: [PG.x + 90, PG.y + 250], O: [PG.x + 290, PG.y + 250], I: [PG.x + 190, PG.y + 340], B: [PG.x + 190, PG.y + 175] };
  const steps = [['W', 'B', 'DRUGS'], ['I', 'B', 'THREAT'], ['B', 'I', 'ROPE'], ['O', 'I', 'THROAT'], ['O', 'I', 'KNIFE']];
  let c = camFor(lt, [[0, BOARDCAM], [ru[0].at + 1.4, ON(452, 300, 1.55), 0.9], [ru[3].at + 2.2, COUNTCAM, 0.9], [L[6].t0 - 0.2, ON(452, 470, 1.75), 1.0], [sk.at + 0.5, ON(452, 300, 1.4), 1.0]]);
  c = withTight(sh, lt, c, 452, 164, 2.9);
  cam(c, () => {
    lab(sh, lt, { ctr: { people: 4, pairs: 12, val, from, u, label: 'STORIES LEFT', hi: clash }, board: () => {
      X.fillStyle = CARD; X.globalAlpha = 0.85; X.fillRect(PG.x + 12, PG.y + 14, PG.w - 24, 118); X.globalAlpha = 1;
      mono('EXCLUSIONS', BC.x, PG.y + 32, 9, { col: P.ink });
      ru.forEach((q, i) => { const n = Math.floor(RULES[i].length * U(lt, q.at, q.at + 1.6)); if (n <= 0) return;
        const y = PG.y + 56 + i * 20; const red = i === 3 && clash; mono(RULES[i].slice(0, n), PG.x + 24, y, 7.8, { align: 'left', col: red ? P.red : P.ink });
        if (i === 3 && struck > 0) { X.font = '7.8px "IBM Plex Mono"'; const wdt = X.measureText(RULES[i]).width; line([PG.x + 22, y - 3], [PG.x + 22 + wdt * struck, y - 3], 2, 10100, 0.2, P.red); } });
      if (lt > ch.at - 0.6) {
        const cu = U(lt, ch.at - 0.6, ch.at);
        X.globalAlpha = cu; for (const k of ['W', 'O', 'I', 'B']) { const [x, y] = pos[k]; personCard(k, x - CW / 2 * 0.78, y - CH / 2 * 0.78, 10200 + k.charCodeAt(0) * 3, { mark: k === 'I' ? clash : 0 }); }
        X.globalAlpha = 1;
        steps.forEach(([a, b], i) => { const t0 = lerp(ch.at, ch.to - 0.4, i / steps.length), au = U(lt, t0, t0 + 0.8); const off = i === 4 ? 26 : 0;
          arrow([pos[a][0] + off, pos[a][1]], [pos[b][0] + off, pos[b][1]], au, steps[i][2], 10300 + i * 5, i === 4 && clash ? P.red : P.ink); });
      }
    } });
    programmer(lt, { mouth: mouthOf(sh, lt), write: typingAt(sh, lt), look: -0.6, down: typingAt(sh, lt) > 0 });
  });
};

SHOTS.skiller = (lt, sd, sh) => {
  const L = sh.lines, c5 = cue(sh, 'card5'), ro = cue(sh, 'roll'), hm = cue(sh, 'harm'), pl = cue(sh, 'plans'), er = cue(sh, 'error');
  const ids = ['W', 'O', 'I', 'B', 'S'];
  const cu = U(lt, c5.at, c5.at + 0.6), slide4 = E.io(cu), err = lt > er.at;
  const cardXY = (i) => { const a = ROW4(Math.min(i, 3)), b = ROW5(i); return [lerp(a[0], b[0], slide4), a[1]]; };
  let c = camFor(lt, [[0, WIDE], [L[0].t1 - 0.4, BOARDCAM, 1.2], [ro.at - 0.3, ON(452, 260, 1.45), 0.9], [hm.at, BOARDCAM, 1.0], [er.at - 0.5, ON(300, 420, 1.2), 1.0]]);
  c = withTight(sh, lt, c, CAB.x + CAB.w / 2, CAB.y + 360, 2.5);
  cam(c, () => {
    lab(sh, lt, {
      cab: { red: err, print: U(lt, er.at + 0.2, er.at + 2.4), printText: ['STORY 1', 'STORY 2', 'STORY 3', 'STORY 4', 'STORY 5', 'REJECTED', 'REJECTED', 'REJECTED', 'STOP'] },
      ctr: err ? { err: true, people: 5, pairs: 20 } : lt < ro.at ? { people: 4, pairs: 12, val: COUNTS.start } : { people: 5, pairs: 20, val: COUNTS.five, from: COUNTS.start, u: U(lt, ro.at, ro.to), spoken: lt > ro.to ? 'TWENTY TO THE TWELFTH POWER' : '' },
      board: () => {
        for (let i = 0; i < 4; i++) { const [x, y] = cardXY(i); personCard(ids[i], x, y, 10400 + i * 100); }
        if (cu > 0) { const [x, y] = ROW5(4); X.globalAlpha = cu; personCard('S', x + 60 * (1 - E.out(cu)), y, 10900, { tilt: -0.04 }); X.globalAlpha = 1; }
        if (lt > c5.at + 0.4) { X.globalAlpha = U(lt, c5.at + 0.4, c5.at + 0.9); pairGrid(ids, PG.x + 80, PG.y + 140, 37, Math.floor(20 * U(lt, ro.at, ro.to))); X.globalAlpha = 1; }
        const sC = ctrOf(ROW5(4));
        for (let i = 0; i < 4; i++) { const pC = ctrOf(ROW5(i)); arrow([sC[0], sC[1] + 40], [pC[0], pC[1] + 44], U(lt, hm.at + i * 0.35, hm.at + i * 0.35 + 0.6) * (1 - U(lt, pl.at - 0.3, pl.at)), '', 11000 + i * 5, P.red);
          arrow([pC[0], pC[1] + 44], [sC[0], sC[1] + 40], U(lt, pl.at + i * 0.35, pl.at + i * 0.35 + 0.6) * (1 - U(lt, er.at, er.at + 0.4)), '', 11050 + i * 5, P.ink); }
      } });
    programmer(lt, { mouth: mouthOf(sh, lt), look: err ? -1 : -0.6 });
  });
};

SHOTS.waldemar = (lt, sd, sh) => {
  const L = sh.lines, c6 = cue(sh, 'card6'), ro = cue(sh, 'roll'), ri = cue(sh, 'rise'), rg = cue(sh, 'ring'), ey = cue(sh, 'eyes'), rt = cue(sh, 'right'), sp = cue(sh, 'split');
  const r = U(lt, ri.at, ri.to), st = { h: E.io(U(r, 0.2, 0.9)), rubble: 1 - U(r, 0, 0.5), char: 1 - U(r, 0.3, 0.9), lit: U(r, 0.8, 1), visitor: lt > rg.at - 0.6 };
  const ids = ['W', 'O', 'I', 'B', 'S', 'D'];
  const cardAt = (i) => [PG.x + 6 + i * 62, PG.y + PG.h - 112];
  const look = lt > ey.at ? E.io(U(lt, ey.at, ey.at + 0.5)) : 0;
  let c = camFor(lt, [[0, BOARDCAM], [ro.at - 0.4, ON(452, 220, 1.6), 0.9], [ri.at - 0.2, ON(452, 330, 1.7), 0.9], [ey.at - 0.3, ON(452, 470, 1.85), 1.0], [sp.at, BOARDCAM, 1.0]]);
  c = withTight(sh, lt, c, BC.x + 22, PG.y + 222, 3.0);
  cam(c, () => {
    lab(sh, lt, { ctr: lt < ro.at ? { people: 5, pairs: 20, val: COUNTS.five } : { people: 6, pairs: 30, val: COUNTS.six, from: COUNTS.five, u: U(lt, ro.at, ro.to), spoken: lt > ro.to ? 'THIRTY TO THE TWELFTH POWER' : '' },
      board: () => {
        X.fillStyle = PAPER2; X.fillRect(PG.x + 10, PG.y + 10, PG.w - 20, 260); X.save(); path(R(PG.x + 10, PG.y + 10, PG.w - 20, 260)); X.clip(); X.globalAlpha = 0.45; skyLines(PG.y, PG.y + 200, PG.y + 400); X.globalAlpha = 1;
        house(BC.x, PG.y + 236, 0.62, 11200, st); X.restore();
        for (let i = 0; i < 6; i++) { if (i === 5 && lt < c6.at) continue; const [x, y] = cardAt(i); const u = i === 5 ? U(lt, c6.at, c6.at + 0.5) : 1; X.save(); X.globalAlpha = u; X.translate(x, y); X.scale(0.78, 0.78); personCard(ids[i], 0, -30 * (1 - E.out(u)), 11300 + i * 100, { look: i < 4 ? look * (1 + (3 - i) * 0.3) : 0 }); X.restore(); }
        // the red thread from Skiller to Waldemar
        if (lt > rt.at) { const a = [cardAt(4)[0] + CW * 0.39, cardAt(4)[1] + 6], b = [cardAt(5)[0] + CW * 0.39, cardAt(5)[1] + 6], u = U(lt, rt.at, rt.at + 0.6), cut = U(lt, sp.at + 1.2, sp.at + 1.6);
          const m = [(a[0] + b[0]) / 2, a[1] - 24];
          if (cut <= 0) ink([a, [lerp(a[0], m[0], u), lerp(a[1], m[1], u)], [lerp(a[0], b[0], u), lerp(a[1], b[1], u)]], 1.6, 11900, 0.4, P.red);
          else { ink([a, [lerp(a[0], m[0], 0.8), m[1] + 10 * cut]], 1.6, 11901, 0.4, P.red); ink([b, [lerp(b[0], m[0], 0.8), m[1] + 10 * cut]], 1.6, 11902, 0.4, P.red); } }
      } });
    programmer(lt, { mouth: mouthOf(sh, lt), look: -0.6 });
  });
};

SHOTS.second = (lt, sd, sh) => {
  const L = sh.lines, dr = cue(sh, 'door'), bk = cue(sh, 'bank'), nz = cue(sh, 'noise'), hd = cue(sh, 'hand'), gm = cue(sh, 'game'), bl = cue(sh, 'bell'), sr = cue(sh, 'siren'), ct = cue(sh, 'catch');
  const sirenK = U(lt, sr.at, sr.at + 3.5), pB = U(lt, bk.at, bk.to), pN = U(lt, nz.at, nz.at + 1.2), pH = U(lt, hd.at, hd.to), pG = U(lt, gm.at, gm.at + 1.2), pPol = U(lt, bl.at + 0.6, bl.at + 1.2);
  const fu = fulcrum(sh);
  let c = camFor(lt, [[0, WINCAM], [L[0].t1 - 0.3, BOARDCAM, 1.2], [hd.at - 0.4, ON(300, 380, 1.2), 1.0], [fu.t1 + 0.6, BOARDCAM, 1.0], [bl.at - 0.2, ON(820, 360, 1.15), 1.2], [sr.at + 1.2, ON(1020, 300, 1.6), 2.4]]);
  c = withTight(sh, lt, c, FACE[0] - 6, FACE[1] + 4, 3.2);
  cam(c, () => {
    lab(sh, lt, { rain: true, siren: sirenK, cab: { spin: 1 + pG },
      ctr: { people: 6, pairs: 30, val: COUNTS.six, label: lt > hd.to ? 'DATA FROM SKILLER' : 'POSSIBLE STORIES' },
      board: () => {
        X.fillStyle = PAPER2; X.fillRect(PG.x, PG.y, PG.w, PG.h);
        // Skiller at the door of the lit house
        const top = 1 - U(lt, bk.at - 0.6, bk.at);
        if (top > 0) { X.globalAlpha = top; house(BC.x, PG.y + 300, 0.66, 12000, { h: 1, lit: 1 }); person(BC.x + 30, PG.y + 280, 1.3, 12090); shape(R(BC.x + 36, PG.y + 262, 12, 9), { lw: 0.8, id: 12091, fill: '#4b4137' }); X.globalAlpha = 1; }
        // the bank of names, the houses, the fires
        if (pB > 0) { const n = Math.floor(420 * clamp(pB * 1.6));
          for (let i = 0; i < n; i++) { const x = PG.x + 18 + (i % 30) * 11.5, y = PG.y + 20 + Math.floor(i / 30) * 9; X.fillStyle = P.ink; X.fillRect(x, y, 6, 2.2); }
          mono('A BANK OF NAMES', BC.x, PG.y + 150, 8, { col: P.ink });
          const hu = U(pB, 0.55, 1); for (let k = 0; k < 7; k++) { if (hu * 7 < k) break; const hx = PG.x + 40 + k * 50, hy = PG.y + 236; shape([[hx - 14, hy], [hx + 14, hy], [hx + 14, hy - 16], [hx, hy - 28], [hx - 14, hy - 16]], { lw: 1.1, id: 12100 + k, fill: CARD });
            if (hu * 7 > k + 0.6) flame(hx, hy - 16, 16, 12120 + k); } }
        // noise: the index with some deeds faded out
        if (pN > 0 && pH < 1) { X.save(); X.globalAlpha = pN * (1 - pH); X.translate(PG.x + 40, PG.y + 250); X.scale(0.55, 0.55); copyBack(0, 0, 540, 270, { fade: DEEDS.map((_, i) => (hash(i, 31) > 0.62 ? 0.25 : 1)) }); X.restore(); mono('NOISE', PG.x + PG.w - 70, PG.y + 300, 8, { col: P.red }); X.globalAlpha = 1; }
        // two computers
        if (pH > 0) { X.globalAlpha = pH; const ax = PG.x + 40, bx = PG.x + 220, y = PG.y + 270;
          for (const [x, lab_] of [[ax, 'COMPUTER A'], [bx, 'COMPUTER B']]) { shape(R(x, y, 118, 92), { lw: 1.6, id: 12200 + x, fill: '#d9cfb4' }); for (let k = 0; k < 8; k++) { X.beginPath(); X.arc(x + 18 + (k % 4) * 26, y + 26 + Math.floor(k / 4) * 22, 4, 0, 6.283); X.fillStyle = hash(k, BOIL + x) > 0.5 ? P.ink : P.paper; X.fill(); X.lineWidth = 1; X.strokeStyle = P.ink; X.stroke(); } mono(lab_, x + 59, y + 80, 7.4, { col: P.ink }); }
          mono('SKILLER’S', ax + 59, y - 10, 7, { col: P.red }); mono('MINE', bx + 59, y - 10, 7, { col: P.ink });
          arrow([ax + 118, y + 46], [bx, y + 46], U(lt, hd.at + 0.2, hd.to), 'DATA', 12300);
          if (pG > 0) { X.globalAlpha = pH * pG; shape(R(bx + 70, y + 54, 40, 30), { lw: 1.2, id: 12310, fill: '#d9cfb4' }); mono('A', bx + 90, y + 74, 9, { col: P.red }); }
          X.globalAlpha = 1; }
        // his own fire policy, pinned last
        if (pPol > 0) { X.globalAlpha = pPol; slipCard(PG.x + 190, PG.y + 30 - 20 * (1 - pPol), 168, 120, 12400, { tilt: 0.05, draw: () => { mono('POLICY 5  FIRE', PG.x + 274, PG.y + 60, 8.4, { col: P.ink }); mono('THE LABORATORY. HOLDER: WALDEMAR', PG.x + 274, PG.y + 84, 6.4, { col: P.ink }); mono('AGENT: SKILLER', PG.x + 274, PG.y + 112, 7, { col: P.red }); } }); X.globalAlpha = 1; }
      } });
    programmer(lt, { mouth: mouthOf(sh, lt), look: lt > bl.at ? 0.9 : lt > fu.t0 - 0.5 && lt < fu.t1 + 0.4 ? 0.2 : -0.6 });
    // the hand at the safety catch: a small pistol on the desk, its catch moving
    if (lt > bl.at + 1.5) { const u = U(lt, ct.at, ct.at + 0.3), gx = 1004, gy = 504; X.globalAlpha = U(lt, bl.at + 1.5, bl.at + 2.2);
      shape([[gx, gy], [gx + 44, gy], [gx + 44, gy + 9], [gx + 14, gy + 9], [gx + 10, gy + 18], [gx, gy + 18]], { lw: 1.3, id: 12500, fill: P.ink });
      shape(R(gx + 18, gy - 3, 6, 4), { lw: 0.8, id: 12501, fill: u > 0.5 ? P.red : P.paper }); X.globalAlpha = 1; }
    sirenWash(lt, sirenK);
  });
};

SHOTS.end = (lt, sd, sh) => {
  const cl = cue(sh, 'close');
  cam(ON(640, 380, 1.0), () => {
    lab(sh, lt, { rain: true, siren: 1 - U(lt, 0, 5), ctr: {}, board: () => { copybook(lt, 1, null); } });
    programmer(lt, { look: 0.9 }); sirenWash(lt, 1 - U(lt, 0, 4));
  });
  void cl;
  X.globalAlpha = seg(lt, 2.0, 3.2);
  shape(R(220, 296, 840, 200), { lw: 1.6, id: 9910, fill: P.paper });
  txt('THE BURNING OF THE ABOMINABLE HOUSE', 640, 334, 28, {});
  txt('four tenants, twelve deeds, and a computer asked to put them in order', 640, 376, 18, { italic: true });
  txt('after Italo Calvino, The Burning of the Abominable House, in Numbers in the Dark,', 640, 424, 14, { italic: true });
  txt('translated by Tim Parks. Narration paraphrases Calvino.', 640, 446, 14, { italic: true });
  X.globalAlpha = 1;
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
  T = await (await fetch('timing/ah.json')).json();
  await document.fonts.ready; await Promise.all(['IM Fell English', 'IBM Plex Mono'].map((n) => document.fonts.load(`20px "${n}"`))); await document.fonts.load(`italic 20px "IM Fell English"`);
  await document.fonts.load('600 10px "IBM Plex Mono"');
  X = document.getElementById('film').getContext('2d');
  window.__NF = Math.ceil(T.dur * 24); window.__T = T; window.__ready = true;
})();
