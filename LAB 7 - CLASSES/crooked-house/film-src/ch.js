/* And He Built a Crooked House: drawing. The study and engraving helpers are from ah.js (The Burning of the Abominable House); the jointed puppet is from hi.js (The House Is Occupied). Part of The House That Language Built. */
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
  T = await (await fetch('timing/ch.json')).json();
  await document.fonts.ready; await Promise.all(['IM Fell English', 'IBM Plex Mono'].map((n) => document.fonts.load(`20px "${n}"`))); await document.fonts.load(`italic 20px "IM Fell English"`);
  await document.fonts.load('600 10px "IBM Plex Mono"');
  X = document.getElementById('film').getContext('2d');
  if (typeof prep === 'function') prep();
  window.__NF = Math.ceil(T.dur * 24); window.__T = T; window.__ready = true;
})();
