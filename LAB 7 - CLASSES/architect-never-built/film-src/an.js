/* The Architect Who Never Built Anything. Drawing. Film three of THE HOUSE THAT LANGUAGE BUILT, four fables of Edifiction;
   an original fable from Watson Hartsoe's notes, written in the manner of Stanislaw Lem. Same toolkit as the earlier films:
   ink.js (Kingdoms in a Box) plus the head of the Ferrix drawing file, copied below unchanged from its second line on.
   The device: every described house is built of its own sentence, letters for bricks, with the sentence on a brass plate;
   the one wall in the film that is built of bricks is the last one, and its plate is blank. */
const W = 1280, H = 720, PX0 = 22, PY0 = 22, PX1 = 1258, PY1 = 698, CX = 640, CY = 360;
let KEYROT = 0;
const DARK = '#2a241d';

/* ---------- drawing primitives ---------- */
function path(pts, close = true) { X.beginPath(); pts.forEach(([x, y], i) => (i ? X.lineTo(x, y) : X.moveTo(x, y))); if (close) X.closePath(); }
const R = (x, y, w, h) => [[x, y], [x + w, y], [x + w, y + h], [x, y + h]];
function bbox(pts) { let a = 1e9, b = 1e9, c = -1e9, d = -1e9; for (const [x, y] of pts) { a = Math.min(a, x); b = Math.min(b, y); c = Math.max(c, x); d = Math.max(d, y); } return [a, b, c, d]; }
function hatch(ang, sp, lw, bb, col = P.ink) {
  const [x0, y0, x1, y1] = bb, c = Math.cos(ang), s = Math.sin(ang), cx = (x0 + x1) / 2, cy = (y0 + y1) / 2, L = Math.hypot(x1 - x0, y1 - y0) / 2 + 3;
  X.beginPath(); for (let d = -L; d <= L; d += Math.max(sp, 2.8)) { const px = cx - s * d, py = cy + c * d; X.moveTo(px - c * L, py - s * L); X.lineTo(px + c * L, py + s * L); }
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
const sayIdx = (sh, i, lt) => { const l = sh.lines[i]; return lt >= l.t0 && lt < l.t1 ? l.env[Math.min(l.env.length - 1, Math.floor((lt - l.t0) * 24))] || 0 : 0; };
const talking = (sh, who, lt) => sh.lines.some((l) => l.who === who && lt >= l.t0 - 0.1 && lt < l.t1 + 0.2);
const cue = (sh, k, i = 0) => sh.cues.filter((c) => c.k === k)[i];
const cues = (sh, k) => sh.cues.filter((c) => c.k === k).sort((a, b) => (a.n || 0) - (b.n || 0));
function cam(c, fn) { X.save(); X.translate(CX, CY); X.scale(c.z, c.z); X.translate(-CX - c.x, -CY - c.y); fn(); X.restore(); }
const ON = (x, y, z) => ({ z, x: x - CX, y: y - CY });
function blendCam(a, b, u) { return { z: Math.exp(lerp(Math.log(a.z), Math.log(b.z), u)), x: lerp(a.x, b.x, u), y: lerp(a.y, b.y, u) }; }
function camFor(lt, plan, dur = 0.8) { let c = plan[0][1]; for (let i = 1; i < plan.length; i++) { const [t0, cc, dd] = plan[i]; if (lt >= t0) c = blendCam(c, cc, seg(lt, t0, t0 + (dd || dur), E.io)); } return c; }
const U = (t, a, b) => clamp((t - a) / Math.max(0.01, b - a));
const pulse = (t, a, d = 0.18) => (t >= a && t < a + d ? Math.sin(Math.PI * (t - a) / d) : 0);
const fulcrum = (sh) => sh.lines.find((l) => l.line);
const tightU = (sh, lt) => { const f = fulcrum(sh); return f ? seg(lt, f.t0 - 0.5, f.t0 + 0.3) * (1 - seg(lt, f.t1 + 0.2, f.t1 + 0.9)) : 0; };
function withTight(sh, lt, c, x, y, z = 2.5) { const u = tightU(sh, lt); return u > 0 ? blendCam(c, ON(x, y, z), E.io(u)) : c; }
const rot = (x, y, a) => { const c = Math.cos(a), s = Math.sin(a); return [x * c - y * s, x * s + y * c]; };
const SHOTS = {};
const MONO = (sz, w = 400) => `${w} ${sz}px "IBM Plex Mono","DejaVu Sans Mono",monospace`;
const FELL = (sz, it) => `${it ? 'italic ' : ''}${sz}px ${FONT}`;
function wrapT(text, width, font) { X.font = font; const out = []; let cur = ''; for (const w of text.split(' ')) { const t = cur ? cur + ' ' + w : w; if (X.measureText(t).width > width && cur) { out.push(cur); cur = w; } else cur = t; } if (cur) out.push(cur); return out; }
function spaced(s, cx, y, size, sp, col = P.ink, font = FELL) { if (SILENT) return; X.font = font(size); X.textBaseline = 'middle'; X.textAlign = 'left'; X.fillStyle = col; let w = 0; const ws = [...s].map((ch) => X.measureText(ch).width); w = ws.reduce((a, b) => a + b, 0) + sp * (s.length - 1); let x = cx - w / 2; [...s].forEach((ch, i) => { X.fillText(ch, x, y); x += ws[i] + sp; }); }
function text(s, x, y, font, o = {}) { if (SILENT) return; X.font = font; X.textAlign = o.align || 'left'; X.textBaseline = o.base || 'alphabetic'; X.fillStyle = o.col || P.ink; X.fillText(s, x, y); }
const ease = E.io;

P.red = '#a8432e';
const PLATE = '#ddd0ad', PAPER2 = '#f3ecd9';
const FLOOR = 640;

/* ================= the world: sky, ground, plates, letter-walls, houses ================= */
function sky(y0, y1, a = 0.2, sp = 5) { if (SILENT) return; sp = Math.max(sp, 6); X.save(); X.globalAlpha = a; X.fillStyle = P.ink; for (let y = y0; y < y1; y += sp) X.fillRect(-900, y, 3100, 0.55 + 0.6 * hash(y | 0, 4)); X.restore(); }
function ground(gy, x0 = -900, x1 = 2200, o = {}) {
  const gh = (Array.isArray((o.h || [0])[0]) ? o.h : [o.h || [0, 7, 0.45]]).map(([a, sp, w]) => [Math.abs(a) < 0.05 ? 0 : a, Math.max(sp, 7), w]);
  shape([[x0, gy], [x1, gy], [x1, gy + 900], [x0, gy + 900]], { lw: 0, h: gh });
  line([x0, gy], [x1, gy], 1.8, 9001, 0.4);
}
/* a brass plate; x,y top-left. text in red, or blank */
function plate(x, y, w, h, txt_, id, o = {}) {
  if (SILENT) return;
  shape(R(x, y, w, h), { lw: Math.max(0.5, h * 0.05), id, fill: PLATE, amp: Math.min(0.5, h * 0.03) });
  const m = h * 0.1; X.lineWidth = Math.max(0.3, h * 0.015); X.strokeStyle = P.ink; X.strokeRect(x + m, y + m, w - 2 * m, h - 2 * m);
  for (const [a, b] of [[x + m * 0.5, y + m * 0.5], [x + w - m * 0.5, y + m * 0.5], [x + m * 0.5, y + h - m * 0.5], [x + w - m * 0.5, y + h - m * 0.5]]) { X.beginPath(); X.arc(a, b, m * 0.3, 0, 6.283); X.fillStyle = P.ink; X.fill(); }
  if (txt_) {
    const fs = o.fs || h * 0.2, lines = wrapT(txt_, w - 4 * m, FELL(fs, true));
    X.font = FELL(fs, true); X.fillStyle = o.col || P.red; X.textAlign = 'center'; X.textBaseline = 'middle';
    const y0 = y + h / 2 - (lines.length - 1) * fs * 0.62;
    lines.forEach((l, i) => X.fillText(l, x + w / 2, y0 + i * fs * 1.24));
  }
}
/* letter courses: rows of the sentence, read on from the bottom left, inside pts; rows only below upTo */
const LONG = {};
function longOf(s, n) { const k = s + '|' + n; if (!LONG[k]) { let t = ''; while (t.length < n) t += s + ' '; LONG[k] = t; } return LONG[k]; }
function letterFill(clipFn, bb, s, fs, o = {}) {
  if (SILENT) return;
  const [x0, y0, x1, y1] = bb; X.save(); clipFn(); X.clip();
  X.font = MONO(fs, 600); const cw = X.measureText('M').width, lh = fs * 1.18, per = Math.max(1, Math.floor((x1 - x0) / cw));
  const rows = Math.ceil((y1 - y0) / lh) + 1, long = longOf(s, per * (rows + 2));
  X.fillStyle = o.col || P.ink; X.textAlign = 'left'; X.textBaseline = 'alphabetic'; X.globalAlpha = (o.alpha ?? 1) * 0.92;
  for (let r = 0; r < rows; r++) { const yb = y1 - 1 - r * lh; if (o.upTo !== undefined && yb - fs * 0.8 < o.upTo) break; X.fillText(long.substr(r * per, per), x0 + (r % 2) * cw * 0.15, yb); }
  X.globalAlpha = (o.alpha ?? 1) * 0.5; X.fillStyle = P.ink;
  for (let r = 0; r < rows; r++) { const yb = y1 - r * lh; if (o.upTo !== undefined && yb - lh < o.upTo) break; X.fillRect(x0, yb - lh + 0.5, x1 - x0, Math.max(0.3, fs * 0.05)); }
  X.restore(); X.globalAlpha = 1;
  return { cw, lh, per };
}
/* a described house. x centre, gy ground. type 0 gable, 1 flat with cornice, 2 narrow tower. o.s: letters sentence; o.plate text */
function house(x, gy, w, h, id, o = {}) {
  if (SILENT) return;
  const t = o.type ?? 0, al = o.alpha ?? 1; if (al <= 0) return;
  X.save(); X.globalAlpha = al; X.translate(x, gy); if (o.lean) X.rotate(o.lean);
  const body = R(-w / 2, -h, w, h);
  if (o.s && (o.fs || Math.max(2.2, w / 34)) * (o.zk || 1) < 3.6 && !o.keepLetters) o = { ...o, s: null };
  if (o.s) { shape(body, { lw: 0, fill: P.paper }); letterFill(() => path(body), [-w / 2, -h, w / 2, 0], o.s, o.fs || Math.max(2.2, w / 34)); shape(body, { fill: null, lw: Math.max(0.8, w / 120), id, sh: R(w * 0.22, -h, w * 0.28, h), sh2: [Math.PI / 2, Math.max(1.6, w / 60), 0.5] }); }
  else shape(body, { lw: Math.max(0.8, w / 120), id, sh: R(w * 0.18, -h, w * 0.32, h), sh2: [Math.PI / 2, Math.max(1.4, w / 50), 0.55] });
  if (t === 0) { const rh = w * 0.42 * (o.roofU ?? 1); if (rh > 1) { shape([[-w / 2 - w * 0.05, -h], [w / 2 + w * 0.05, -h], [0, -h - rh]], { lw: Math.max(0.8, w / 110), id: id + 1, h: [-0.75, Math.max(1.3, w / 45), 0.55] }); if (!o.nochim) shape(R(w * 0.18, -h - rh * 0.78, w * 0.09, rh * 0.5), { lw: Math.max(0.6, w / 140), id: id + 2, h: [Math.PI / 2, Math.max(1.2, w / 70), 0.5] }); } }
  else if (t === 1) { shape(R(-w / 2 - w * 0.04, -h - w * 0.06, w * 1.08, w * 0.06), { lw: Math.max(0.7, w / 120), id: id + 1, h: [0, Math.max(1.2, w / 80), 0.5] }); shape(R(-w / 2 + w * 0.06, -h - w * 0.13, w * 0.88, w * 0.07), { lw: Math.max(0.6, w / 130), id: id + 3 }); }
  else { const rh = w * 1.1 * (o.roofU ?? 1); if (rh > 1) shape([[-w / 2 - w * 0.06, -h], [w / 2 + w * 0.06, -h], [0, -h - rh]], { lw: Math.max(0.7, w / 90), id: id + 1, h: [-1.2, Math.max(1.2, w / 30), 0.55] }); }
  if ((o.win ?? 1) > 0) {
    const cols = Math.max(1, Math.round(w / 38)), rows = Math.max(1, Math.floor((h - w * 0.28) / (w * 0.3 + 14)));
    const ww = Math.min(14, w / (cols * 2.4)) * Math.max(1, w / 200), wh = ww * 1.35;
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
      if (r === 0 && c === Math.floor(cols / 2)) continue;
      const wx = -w / 2 + (c + 0.5) * w / cols - ww / 2, wy = -h + h * 0.12 + r * (h * 0.78 / rows);
      if (wy + wh > -w * 0.25) continue;
      shape(R(wx, wy, ww, wh), { lw: Math.max(0.5, w / 200), id: id + 10 + r * 9 + c, fill: o.lit ? P.paper : P.ink });
      if (!o.lit && ww > 4) { X.fillStyle = P.paper; X.fillRect(wx + ww / 2 - 0.4, wy, Math.max(0.6, ww * 0.08), wh); X.fillRect(wx, wy + wh / 2 - 0.4, ww, Math.max(0.6, ww * 0.08)); }
    }
  }
  const dw = Math.max(5, w * 0.13), dh = Math.min(h * 0.5, dw * 2.5);
  shape([[-dw / 2, 0], [-dw / 2, -dh + dw / 2], [0, -dh], [dw / 2, -dh + dw / 2], [dw / 2, 0]], { lw: Math.max(0.6, w / 140), id: id + 5, fill: P.ink });
  if (o.plate !== false) plate(dw / 2 + w * 0.03, -dh * 0.75, Math.max(6, w * 0.16), Math.max(3, w * 0.07), w > 120 ? (o.plate || o.s) : '', id + 6, { fs: Math.max(1.2, w * 0.011) });
  else if (w <= 120) { X.fillStyle = P.red; X.fillRect(dw / 2 + w * 0.04, -dh * 0.7, Math.max(2, w * 0.12), Math.max(1, w * 0.03)); }
  if (o.wet) { X.save(); path(body); X.clip(); X.globalAlpha = 0.5 * al; for (let i = 0; i < Math.round(w / 9); i++) { const sx = -w / 2 + hash(id, i) * w, ln = h * (0.3 + 0.6 * hash(id, i + 50)); X.fillStyle = P.ink; X.fillRect(sx, -h, Math.max(0.6, w / 200), ln); } X.restore(); }
  X.restore(); X.globalAlpha = 1;
}
const SENTS = ['A tall house with a good view of the other houses.', 'A house for a family of four, with room for a fifth.', 'A modest bank with an immodest door.', 'A school with exactly enough windows.',
  'A dry house with a sound roof.', 'A chapel that seats everyone who means to come.', 'A narrow house, narrower at the top.', 'A post office with a short queue.', 'A shop that sells string.', 'A house that looks out to sea.',
  'A tower for a man who likes stairs.', 'A warm house for a cold street.', 'A concert hall, acoustically flawless.', 'A house with a red door.', 'A small museum of small things.', 'A hotel for people who are only passing.'];
/* the City of Described Houses: a row of houses, deterministic; n 0..1 shows the first fraction (in rank order) */
function city(gy, x0, x1, sc, id, o = {}) {
  if (SILENT) return;
  let x = x0, i = 0; const items = [];
  while (x < x1) { const w = (46 + hash(id, i) * 60) * sc, h = (60 + hash(id, i + 300) * 120) * sc, type = Math.floor(hash(id, i + 600) * 3); items.push({ x: x + w / 2, w, h: type === 2 ? h * 1.2 : h, type, i, r: hash(id, i + 900) }); x += w + (6 + hash(id, i + 1200) * 16) * sc; i++; }
  for (const it of items) {
    let a = 1, rise = 1;
    if (o.n !== undefined) { const u = clamp((o.n - it.r * 0.9) / 0.1); if (u <= 0) continue; rise = E.out(u); }
    const g = it.type === 2 ? it.w * 0.55 : it.w;
    X.save(); X.translate(0, (1 - rise) * it.h * 0.0); house(it.x, gy, g, it.h * rise, id + it.i * 40, { type: it.type, s: o.letters ? SENTS[it.i % SENTS.length] : null, plate: false, win: rise > 0.8 ? 1 : 0, wet: o.wet, roofU: rise, alpha: a, lit: o.lit && hash(id, it.i + 77) > 0.4 }); X.restore();
  }
}

/* ================= people ================= */
function ik2(h, f, l1, l2, dir = 1) { const dx = f[0] - h[0], dy = f[1] - h[1]; let d = Math.hypot(dx, dy); d = clamp(d, Math.abs(l1 - l2) + 0.01, l1 + l2 - 0.01); const a = Math.atan2(dy, dx); const A = Math.acos(clamp((l1 * l1 + d * d - l2 * l2) / (2 * l1 * d), -1, 1)); const g = a - dir * A; return [h[0] + Math.cos(g) * l1, h[1] + Math.sin(g) * l1]; }
function leg(hp, ft, l1, l2, w, id, shoe = 1) { const kn = ik2(hp, ft, l1, l2, 1); cap(hp[0], hp[1], kn[0], kn[1], w, id); cap(kn[0], kn[1], ft[0], ft[1] - 4, w * 0.88, id + 1); ball(kn[0], kn[1], w * 0.55, id + 2, PAT.f, 1); if (shoe) boot(ft[0] - 4, ft[1], 1, 0.82, id + 3); }
function prop(kind, x, y, a, id, o = {}) {
  X.save(); X.translate(x, y); X.rotate(a || 0);
  if (kind === 'kettle') { shape([[-14, 0], [14, 0], [11, -18], [-11, -18]], { lw: 1.4, id, h: [0.3, 2.4, 0.5] }); X.beginPath(); X.arc(0, -18, 8, Math.PI, 0); X.lineWidth = 1.4; X.strokeStyle = P.ink; X.stroke(); line([14, -10], [24, -18], 2, id + 1, 0.1); X.beginPath(); X.arc(0, -26, 12, Math.PI * 1.1, Math.PI * 1.9); X.stroke(); }
  else if (kind === 'bag') { shape([[-26, -4], [26, -4], [22, 26], [-22, 26]], { lw: 1.5, id, h: [[0.5, 3.4, 0.5], [-0.6, 5, 0.4]] }); X.beginPath(); X.arc(0, -4, 14, Math.PI, 0); X.lineWidth = 2; X.strokeStyle = P.ink; X.stroke(); line([-8, -4], [-14, -22], 2, id + 2, 0.2); line([10, -4], [4, -26], 1.6, id + 3, 0.2); }
  else if (kind === 'trowel') { line([0, 0], [10, -3], 4, id, 0.1); shape([[10, -8], [34, -3], [10, 3]], { lw: 1.2, id: id + 1, fill: PLATE }); }
  else if (kind === 'brick') { shape(R(-15, -6, 30, 11), { lw: 1.2, id, h: [0.4, 2.2, 0.5] }); }
  else if (kind === 'plate') { plate(-24, -16, 48, 30, o.txt || '', id); }
  else if (kind === 'letter') { X.font = FELL(26); X.fillStyle = P.ink; X.textAlign = 'center'; X.textBaseline = 'middle'; X.fillText(o.ch || 'q', 0, -6); }
  else if (kind === 'note') { shape(R(-10, -24, 22, 28), { lw: 1, id, fill: PAPER2 }); for (let i = 0; i < 4; i++) line([-6, -18 + i * 6], [8, -18 + i * 6], 0.6, id + i + 1, 0.1); }
  else if (kind === 'card') { shape(R(-14, -10, 28, 18), { lw: 1, id, fill: PAPER2 }); line([-9, -3], [9, -3], 0.6, id + 1, 0.1); line([-9, 2], [5, 2], 0.6, id + 2, 0.1); }
  else if (kind === 'paper') { shape([[-12, -16], [14, -18], [16, 14], [-10, 16]], { lw: 1, id, fill: PAPER2 }); }
  X.restore();
}
/* a person, feet at (x,y), facing f (1 right, -1 left). kind: klause, builder, made, dean, fac, student, press.
   ra/la: [shoulder angle, elbow angle] in the facing frame (0 = forward, PI/2 = down). */
function person(o) {
  if (SILENT) return;
  const k = o.kind || 'klause', s = o.s || 1, f = o.f || 1, id = o.id || 5000;
  const tall = { klause: 1.07, builder: 0.94, made: 1.0, dean: 1.0, fac: 0.98, student: 0.97, press: 1.0 }[k] || 1;
  X.save(); X.translate(o.x, o.y); X.scale(s * f, s); X.globalAlpha = o.alpha ?? 1;
  const ph = o.ph || 0, wk = o.walk || 0, kn = o.kneel || 0, st = o.sit || 0;
  const l1 = 64 * tall, l2 = 62 * tall;
  let hip = [0, -(l1 + l2 + 4) - Math.abs(Math.cos(ph)) * 2 * wk];
  let fA = [-7 + Math.sin(ph) * 17 * wk, -Math.max(0, Math.cos(ph)) * 7 * wk], fB = [7 - Math.sin(ph) * 17 * wk, -Math.max(0, -Math.cos(ph)) * 7 * wk];
  if (kn > 0) { hip = [lerp(hip[0], -4, kn), lerp(hip[1], -78, kn)]; fA = [lerp(fA[0], -66, kn), lerp(fA[1], -3, kn)]; fB = [lerp(fB[0], 38, kn), fB[1]]; }
  if (st > 0) { hip = [lerp(hip[0], -14, st), lerp(hip[1], -(o.seatH || 80), st)]; fA = [lerp(fA[0], 34, st), fA[1]]; fB = [lerp(fB[0], 46, st), fB[1]]; }
  const lean = (o.stoop || 0) * 0.62 + kn * 0.18 - st * 0.05 + (o.lean || 0);
  const TP = (x, y) => { const c = Math.cos(lean), sn = Math.sin(lean); return [hip[0] + x * c - y * sn, hip[1] + x * sn + y * c]; };
  const shH = -104 * tall, sh = TP(4, shH);
  const robe = k === 'dean' || k === 'fac', dark = k === 'klause' || robe;
  const armW = robe ? 15 : 12, legW = k === 'klause' ? 12 : 14;
  const sw = Math.sin(ph) * 0.38 * wk;
  const la = o.la || [Math.PI / 2 - 0.08 - sw, Math.PI / 2 - 0.2], ra = o.ra || [Math.PI / 2 + 0.04 + sw, Math.PI / 2 - 0.25];
  // far arm
  const fsh = TP(-4, shH + 4); const [, , fhx, fhy] = limb(fsh[0], fsh[1], la[0], 50 * tall, la[1], 46 * tall, armW - 1, id + 10); ball(fhx, fhy, 6, id + 13, PAT.f, 1.1);
  if (o.lhold) prop(o.lhold, fhx, fhy + 4, 0, id + 300, o.lprop || {});
  // legs
  if (!robe || kn > 0 || st > 0) { leg(hip, fA, l1, l2, legW, id + 20); leg(hip, fB, l1, l2, legW, id + 30); }
  else { for (const ft of [fA, fB]) boot(ft[0] - 4, ft[1], 1, 0.82, id + 40 + ft[0]); }
  // torso and coat
  let coat;
  if (k === 'klause') coat = [TP(-17, -106 * tall), TP(19, -106 * tall), TP(22, -40), TP(28 + kn * 10, 34 - kn * 20), TP(-24, 36 - kn * 24), TP(-21, -40)];
  else if (robe) coat = [TP(-20, -106), TP(20, -106), TP(30, -30), [hip[0] + 40, -6], [hip[0] - 34, -6], TP(-28, -30)];
  else if (k === 'builder') coat = [TP(-19, -102 * tall), TP(19, -102 * tall), TP(24, -20), TP(27, 14), TP(-25, 14), TP(-23, -20)];
  else if (k === 'made') coat = [TP(-18, -104), TP(18, -104), TP(20, -10), TP(-20, -10)];
  else coat = [TP(-17, -104 * tall), TP(17, -104 * tall), TP(20, -6), TP(-20, -6)];
  shape(coat, { lw: 1.8, id: id + 50, h: dark ? [1.75, robe ? 3.2 : 4, 0.6] : [1.75, 6, 0.4], sh: [TP(3, -110), TP(36, -110), TP(46, 40), TP(3, 40)], sh2: [1.6, 2.2, 0.7] });
  if (k === 'klause') { line(TP(2, -104), TP(-2, -30), 0.9, id + 51, 0.3); for (const yy of [-84, -66, -48]) ball(...TP(6, yy), 1.8, id + 52 + yy, PAT.f, 0.8); line(TP(-6, -104 * tall), TP(4, -88), 1.2, id + 55, 0.2); line(TP(14, -104 * tall), TP(4, -88), 1.2, id + 56, 0.2); }
  if (k === 'made') { shape([TP(-12, -84), TP(12, -84), TP(12, -54), TP(-12, -54)], { lw: 1.2, id: id + 57, fill: P.paper }); line(TP(-10, -84), TP(-13, -104), 2.4, id + 58, 0.1); line(TP(10, -84), TP(13, -104), 2.4, id + 59, 0.1); }
  if (k === 'builder') { line(TP(0, -100), TP(0, 10), 0.9, id + 57, 0.3); line(TP(-19, -36), TP(24, -36), 2.2, id + 58, 0.2); }
  if (k === 'student') { line(TP(-14, -102), TP(16, -20), 2.6, id + 57, 0.1); }
  // neck and head
  const hc = TP(10 + (o.headX || 0), -130 * tall + (o.headY || 0)); const look = o.look || 0;
  cap(...TP(4, -100 * tall), hc[0] - 2, hc[1] + 10, 9, id + 60);
  const hx = hc[0], hy = hc[1], hr = 19;
  if (k === 'dean' || k === 'fac') { }
  ball(hx, hy, hr, id + 61, PAT.f, 1.8);
  X.save(); circ(hx, hy, hr, id + 61); X.clip(); X.beginPath(); X.arc(hx - 13, hy - 9, hr + 4, 0, 6.283); X.fillStyle = PAT.f; X.fill(); X.restore();
  const ey = hy - 3 + look * -3 + (o.down ? 2 : 0);
  if (o.closed) line([hx + 6, ey], [hx + 12, ey], 1.4, id + 62, 0.1); else { X.fillStyle = P.ink; X.beginPath(); X.arc(hx + 9, ey, 2.1, 0, 6.283); X.fill(); }
  line([hx + 5, ey - 6 - (o.brow || 0) * 3], [hx + 13, ey - 7 - (o.brow || 0) * 4], 1.3, id + 63, 0.1);
  line([hx + 17, hy - 6], [hx + 23, hy + 4], 1.4, id + 64, 0.1); line([hx + 23, hy + 4], [hx + 17, hy + 6], 1.2, id + 65, 0.1);
  const mo = o.mouth || 0; if (mo > 0.05) { X.fillStyle = P.ink; X.fillRect(hx + 9, hy + 10, 7, 1.4 + mo * 4.5); } else line([hx + 9, hy + 11], [hx + 16, hy + 11], 1, id + 66, 0.1);
  line([hx - 3, hy - 2], [hx - 1, hy + 6], 1.2, id + 67, 0.1); // ear
  if (k === 'klause') {
    for (let i = 0; i < 7; i++) { const a = Math.PI * (0.62 + i * 0.09); line([hx + Math.cos(a) * 15, hy + Math.sin(a) * 15 - 4], [hx + Math.cos(a) * 24, hy + Math.sin(a) * 22 - 6], 1.3, id + 70 + i, 0.5); }
    X.beginPath(); X.arc(hx + 10, ey, 5.2, 0, 6.283); X.lineWidth = 1.2; X.strokeStyle = P.ink; X.stroke(); line([hx + 5, ey - 1], [hx - 2, hy - 4], 1, id + 78, 0.1);
    line([hx + 11, hy + 8], [hx + 19, hy + 8], 2.2, id + 79, 0.1);
    const bd = o.beard || 0; if (bd > 0) { X.save(); X.beginPath(); X.moveTo(hx + 2, hy + 6); X.quadraticCurveTo(hx + 8, hy + 18 + 14 * bd, hx + 20, hy + 9); X.lineTo(hx + 18, hy + 7); X.closePath(); X.fillStyle = P.paper; X.fill(); X.clip(); hatch(1.2, 2, 0.8, [hx, hy, hx + 22, hy + 34]); X.restore(); X.lineWidth = 1; X.strokeStyle = P.ink; X.beginPath(); X.moveTo(hx + 2, hy + 6); X.quadraticCurveTo(hx + 8, hy + 18 + 14 * bd, hx + 20, hy + 9); X.stroke(); }
  } else if (k === 'builder') {
    shape([[hx - 22, hy - 2], [hx - 14, hy - 18], [hx + 2, hy - 22], [hx + 16, hy - 16], [hx + 18, hy - 9], [hx - 4, hy - 8], [hx - 10, hy + 6], [hx - 20, hy + 8]], { lw: 1.4, id: id + 70, h: [[0.8, 3, 0.5], [-0.8, 3, 0.5]] });
    line([hx - 20, hy + 6], [hx - 28, hy + 14], 2.4, id + 71, 0.2); line([hx - 19, hy + 7], [hx - 24, hy + 18], 2.2, id + 72, 0.2);
  } else if (k === 'made') {
    shape([[hx - 18, hy - 8], [hx - 14, hy - 22], [hx + 12, hy - 22], [hx + 16, hy - 10]], { lw: 1.4, id: id + 70, h: [0, 2.6, 0.6] }); shape([[hx + 6, hy - 11], [hx + 28, hy - 9], [hx + 26, hy - 6], [hx + 6, hy - 7]], { lw: 1.2, id: id + 71, fill: P.ink });
    if (o.no) { X.font = MONO(5, 600); X.fillStyle = P.paper; X.textAlign = 'center'; X.textBaseline = 'middle'; X.save(); X.translate(hx - 1, hy - 15); X.scale(f, 1); X.fillRect(-7, -3, 14, 6); X.fillStyle = P.ink; X.fillText('No.' + o.no, 0, 0.3); X.restore(); }
  } else if (k === 'dean' || k === 'fac') {
    shape([[hx - 26, hy - 18], [hx + 8, hy - 26], [hx + 30, hy - 18], [hx - 4, hy - 10]], { lw: 1.3, id: id + 70, fill: P.ink }); shape(R(hx - 12, hy - 18, 24, 7), { lw: 1, id: id + 71, fill: P.ink });
    line([hx + 2, hy - 18], [hx + 26, hy - 6 + Math.sin(GT * 3 + id) * 2], 1, id + 72, 0.1);
    if (o.spect) { X.beginPath(); X.arc(hx + 10, ey, 4.4, 0, 6.283); X.lineWidth = 1; X.strokeStyle = P.ink; X.stroke(); }
    if (o.beard) { shape([[hx + 2, hy + 6], [hx + 18, hy + 8], [hx + 10, hy + 30]], { lw: 1, id: id + 73, h: [1.3, 2, 0.6] }); }
  } else if (k === 'student') {
    for (let i = 0; i < 9; i++) { const a = Math.PI * (1.0 + i * 0.12); line([hx + Math.cos(a) * 14, hy + Math.sin(a) * 14], [hx + Math.cos(a) * 23 + 3, hy + Math.sin(a) * 23 - 2], 1.6, id + 70 + i, 0.6); }
  } else if (k === 'press') {
    shape([[hx - 24, hy - 12], [hx + 26, hy - 12], [hx + 14, hy - 18], [hx + 12, hy - 30], [hx - 12, hy - 30], [hx - 14, hy - 18]], { lw: 1.3, id: id + 70, h: [0, 2.2, 0.6] });
  }
  // near arm
  const nsh = TP(6, shH + 6); const [, , nhx, nhy] = limb(nsh[0], nsh[1], ra[0], 50 * tall, ra[1], 46 * tall, armW, id + 80); ball(nhx, nhy, 6.4, id + 83, PAT.f, 1.2);
  if (o.hold) prop(o.hold, nhx, nhy + 2, o.holdA || 0, id + 320, o.prop || {});
  X.restore(); X.globalAlpha = 1;
  return { head: [o.x + hx * s * f, o.y + hy * s], hand: [o.x + nhx * s * f, o.y + nhy * s], fhand: [o.x + fhx * s * f, o.y + fhy * s] };
}

/* ================= the Edifier ================= */
function edifier(x, gy, s, id, o = {}) {
  if (SILENT) return;
  X.save(); X.translate(x + (o.shiver ? Math.sin(GT * 70) * 0.5 : 0), gy); X.scale(s, s);
  for (const fx of [-58, 50]) shape(R(fx, -10, 10, 10), { lw: 1.2, id: id + fx, fill: P.ink });
  shape([[70, -300], [94, -314], [94, -14], [70, 0]], { lw: 1.6, id: id + 1, h: [Math.PI / 2, 2.4, 0.7] });
  shape([[-70, -300], [70, -300], [94, -314], [-46, -314]], { lw: 1.6, id: id + 2, h: [0, 3.2, 0.5] });
  shape(R(-70, -300, 140, 290), { lw: 2, id: id + 3, sh: R(40, -300, 30, 290), sh2: [Math.PI / 2, 2.8, 0.6] });
  // funnel
  shape(R(-12, -336, 24, 24), { lw: 1.4, id: id + 4, h: [Math.PI / 2, 2.6, 0.6] });
  shape([[-12, -334], [12, -334], [62, -404], [-62, -404]], { lw: 1.8, id: id + 5, h: [Math.PI / 2 - 0.25, 4, 0.5], sh: [[2, -334], [12, -334], [62, -404], [24, -404]], sh2: [Math.PI / 2 + 0.3, 2.2, 0.7] });
  X.beginPath(); X.ellipse(0, -404, 62, 9, 0, 0, 6.283); X.fillStyle = P.paper; X.fill(); X.lineWidth = 1.8; X.strokeStyle = P.ink; X.stroke();
  X.beginPath(); X.ellipse(0, -404, 46, 5, 0, 0, 6.283); X.fillStyle = PAT.d; X.fill();
  // paper slot and paper
  shape(R(-46, -282, 92, 6), { lw: 1.2, id: id + 6, fill: P.ink });
  const pl = o.paper || 0;
  if (pl > 0) {
    shape(R(-40, -279 - pl, 80, pl), { lw: 1.1, id: id + 7, fill: PAPER2 });
    if (o.ptext) { const ls = wrapT(o.ptext, 70, MONO(6)); let n = o.pn ?? 1e9; X.font = MONO(6); X.fillStyle = P.ink; X.textAlign = 'left'; X.textBaseline = 'alphabetic'; ls.forEach((l, i) => { if (n <= 0) return; const sl = l.slice(0, n); n -= l.length + 1; const yy = -279 - pl + 10 + i * 8; if (yy < -282) X.fillText(sl, -35, yy); }); }
  }
  // lamp and grille
  ball(0, -232, 16, id + 8, PAT.m, 2, PLATE);
  const sp = o.speak || 0;
  X.beginPath(); X.arc(0, -232, 9, 0, 6.283); X.fillStyle = sp > 0.05 ? P.paper : PAT.d; X.fill(); X.lineWidth = 1.2; X.strokeStyle = P.ink; X.stroke();
  if (sp > 0.05) star(0, -232, 14 + 10 * sp, id + 9, P.ink, 10);
  for (const d of [-1, 1]) for (let i = 0; i < 5; i++) line([d * 28, -244 + i * 6], [d * 56, -244 + i * 6], 1.6, id + 20 + i + d * 10, 0.1);
  // keyboard
  shape([[-84, -186], [84, -186], [98, -164], [-98, -164]], { lw: 1.8, id: id + 30, h: [0.15, 3.2, 0.5] });
  shape([[-98, -164], [98, -164], [98, -156], [-98, -156]], { lw: 1.4, id: id + 31, fill: P.ink });
  for (let r = 0; r < 3; r++) for (let c = 0; c < 10; c++) {
    const kx = -72 + c * 16 + r * 4 - r * 0.0, ky = -182 + r * 7, pressed = o.keys && hash(Math.floor(GT * 11) + c * 7 + r * 31, id) < o.keys * 0.12;
    X.beginPath(); X.ellipse(kx + (r - 1) * 2, ky + (pressed ? 1.5 : 0), 5, 2.6, 0, 0, 6.283); X.fillStyle = pressed ? P.ink : P.paper; X.fill(); X.lineWidth = 1; X.strokeStyle = P.ink; X.stroke();
  }
  // name plate
  shape(R(-30, -146, 60, 12), { lw: 1, id: id + 40, fill: PLATE }); X.font = MONO(7, 600); X.fillStyle = P.ink; X.textAlign = 'center'; X.textBaseline = 'middle'; X.fillText('EDIFIER', 0, -140);
  // drawers
  for (let r = 0; r < 2; r++) for (let c = 0; c < 2; c++) { shape(R(-62 + c * 64, -126 + r * 36, 60, 30), { lw: 1.4, id: id + 50 + r * 2 + c }); ball(-32 + c * 64, -111 + r * 36, 3, id + 60 + r * 2 + c, PAT.f, 1); }
  const dr = o.drawer;
  if (dr !== undefined) {
    const out = 26 * dr;
    if (out > 1) { shape([[-62, -50], [62, -50], [62 + out * 0.6, -50 + out], [-62 + out * 0.6 - out * 1.2, -50 + out]], { lw: 1, id: id + 70, fill: P.ink }); }
    shape(R(-62 - out * 0.3, -54 + out, 124 + out * 0.6, 38), { lw: 1.6, id: id + 71, h: dr > 0 ? [0.05, 3.2, 0.4] : null });
    plate(-26 - out * 0.1, -44 + out, 52 + out * 0.2, 13, '', id + 72); X.font = MONO(7, 600); X.fillStyle = P.ink; X.textAlign = 'center'; X.textBaseline = 'middle'; X.fillText('BUILDERS', 0, -37.5 + out);
  } else { for (let c = 0; c < 2; c++) { shape(R(-62 + c * 64, -54, 60, 30), { lw: 1.4, id: id + 80 + c }); ball(-32 + c * 64, -39, 3, id + 82 + c, PAT.f, 1); } }
  X.restore();
}

/* ================= the Ministry ================= */
const MOTTO = 'EVERYTHING THAT CAN BE SAID CAN BE BUILT';
function ministry(cx, gy, s, id, o = {}) {
  if (SILENT) return;
  X.save(); X.translate(cx, gy); X.scale(s, s);
  shape(R(-340, -400, 680, 400), { lw: 1.6, id: id, h: [0, 5, 0.4] });
  for (let i = 0; i < 5; i++) { const wx = -270 + i * 120 + 30; if (i === 2) continue; shape(R(wx, -220, 40, 90), { lw: 1.2, id: id + 10 + i, fill: P.ink }); X.fillStyle = P.paper; X.fillRect(wx + 19, -220, 2, 90); X.fillRect(wx, -178, 40, 2); }
  // door
  const dop = o.door || 0;
  shape(R(-44, -210, 88, 180), { lw: 1.8, id: id + 20, fill: P.ink });
  if (dop < 1) { shape(R(-44, -210, 88 * (1 - dop), 180), { lw: 1.6, id: id + 21, h: [Math.PI / 2, 3, 0.6] }); line([0 - 44 * dop, -210], [0 - 44 * dop, -30], 1.2, id + 22, 0.1); }
  shape([[-60, -210], [60, -210], [0, -246]], { lw: 1.4, id: id + 23, h: [0.4, 3, 0.5] });
  // plaque
  plate(-150, -150, 70, 40, '', id + 24); X.font = MONO(5.2, 600); X.fillStyle = P.ink; X.textAlign = 'center'; X.textBaseline = 'middle';
  ['MINISTRY OF', 'CONSTRUCTIVE', 'SEMANTICS', '', 'INSTITUTE OF', 'OPERATIVE DESC.'].forEach((t, i) => X.fillText(t, -115, -142 + i * 5.2));
  // steps
  for (let i = 0; i < 3; i++) shape(R(-380 + i * 14, -10 - i * 10, 760 - i * 28, 10), { lw: 1.4, id: id + 30 + i, h: [0, 2.6, 0.5] });
  // columns
  for (let i = 0; i < 6; i++) {
    const x = -300 + i * 120;
    shape(R(x - 22, -40, 44, 10), { lw: 1.3, id: id + 40 + i, h: [0, 2, 0.5] });
    shape(R(x - 17, -262, 34, 222), { lw: 1.6, id: id + 50 + i, sh: R(x + 4, -262, 13, 222), sh2: [Math.PI / 2, 2.2, 0.7] });
    for (let k = -2; k <= 2; k++) line([x + k * 6, -258], [x + k * 6, -44], 0.7, id + 60 + i * 5 + k, 0.2);
    shape(R(x - 24, -272, 48, 10), { lw: 1.4, id: id + 70 + i, h: [0, 2.4, 0.5] });
    for (const d of [-1, 1]) { X.beginPath(); X.arc(x + d * 20, -266, 5, 0, 6.283); X.fillStyle = P.paper; X.fill(); X.lineWidth = 1.2; X.strokeStyle = P.ink; X.stroke(); }
  }
  // entablature: architrave, frieze with the motto, cornice
  shape(R(-350, -290, 700, 18), { lw: 1.6, id: id + 80, h: [0, 3, 0.5] });
  shape(R(-350, -324, 700, 34), { lw: 1.6, id: id + 81 });
  spaced(MOTTO, 0, -306, 17, 3.2, o.mottoCol || P.ink);
  shape(R(-366, -340, 732, 16), { lw: 1.6, id: id + 82, h: [0, 2.6, 0.6] });
  for (let i = 0; i < 46; i++) shape(R(-362 + i * 16, -324, 7, 6), { lw: 0.7, id: id + 90 + i, fill: P.ink });
  // pediment
  shape([[-366, -340], [366, -340], [0, -440]], { lw: 1.8, id: id + 140 });
  shape([[-330, -346], [330, -346], [0, -428]], { lw: 1.2, id: id + 141, h: [-0.2, 3.4, 0.5] });
  ball(0, -378, 20, id + 142, PAT.f, 1.6); X.font = FELL(9, true); X.fillStyle = P.ink; X.textAlign = 'center'; X.textBaseline = 'middle'; X.fillText('fiat', 0, -378);
  X.restore();
}

/* ================= the signature shot: a sentence becomes a house =================
   g: {x, gy, w, h, type, fs, ty (y of the typed line), tfs (typed size)}; ph: {ty, fa, bu} 0..1 */
function sigWords(sent, g) {
  X.font = MONO(g.tfs, 600); const full = X.measureText(sent).width, cw = full / sent.length; let x0 = g.x - full / 2;
  const words = []; let i = 0; for (const w of sent.split(' ')) { words.push({ w, i0: i, x: x0 + i * cw, wd: w.length * cw }); i += w.length + 1; }
  return { words, cw, x0 };
}
function sigBuild(sent, g, ph, id, o = {}) {
  if (SILENT) return;
  const { words, cw, x0 } = sigWords(sent, g), n = sent.length;
  const built = ph.bu > 0;
  // phase 1: typed
  if (!built && ph.fa <= 0) {
    const k = Math.floor(n * ph.ty); X.font = MONO(g.tfs, 600); X.fillStyle = P.ink; X.textAlign = 'left'; X.textBaseline = 'alphabetic';
    X.fillText(sent.slice(0, k), x0, g.ty);
    if (ph.ty > 0 && ph.ty < 1) X.fillRect(x0 + k * cw, g.ty + 3, cw, 2);
    return;
  }
  // fallen positions
  const nw = words.length, fallen = words.map((w, i) => {
    const d = i / nw * 0.45, v = clamp((ph.fa - d) / 0.55), vv = v * v, bounce = v >= 1 ? 0 : 0;
    const lx = g.x - g.w / 2 + (i + 0.5) / nw * g.w - w.wd / 2 + (hash(id, i) - 0.5) * 10;
    return { x: lerp(w.x, lx, E.out(v)), y: lerp(g.ty, g.gy - 3, vv) - bounce, a: (hash(id, i + 9) - 0.5) * 0.5 * v, v };
  });
  const B1 = clamp(ph.bu / 0.3), B2 = clamp((ph.bu - 0.3) / 0.45), B3 = clamp((ph.bu - 0.72) / 0.28);
  // letters course geometry (must match letterFill)
  X.font = MONO(g.fs, 600); const lcw = X.measureText('M').width, lh = g.fs * 1.18, per = Math.max(1, Math.floor(g.w / lcw));
  const bx0 = g.x - g.w / 2, by1 = g.gy;
  if (B2 > 0) {
    const top = by1 - g.h * E.io(B2);
    const body = R(bx0, by1 - g.h, g.w, g.h);
    letterFill(() => path(body), [bx0, by1 - g.h, bx0 + g.w, by1], sent, g.fs, { upTo: Math.min(top, by1 - lh * Math.ceil(n / per)) });
  }
  // flying letters
  if (B2 < 1) {
    X.textAlign = 'left'; X.textBaseline = 'alphabetic';
    words.forEach((w, wi) => {
      const fw = fallen[wi];
      for (let c = 0; c < w.w.length; c++) {
        const k = w.i0 + c, dl = k / n * 0.55, u = clamp((B1 - dl) / 0.45);
        const [ox, oy] = rot(c * cw, 0, fw.a), sx = fw.x + ox, sy = fw.y + oy;
        const tx = bx0 + (k % per) * lcw + (Math.floor(k / per) % 2) * lcw * 0.15, tyy = by1 - 1 - Math.floor(k / per) * lh;
        if (B2 > 0 && u >= 1) continue;
        const e = E.io(u), px = lerp(sx, tx, e), py = lerp(sy, tyy, e) - Math.sin(Math.PI * u) * 40, sz = lerp(g.tfs, g.fs, e);
        X.font = MONO(sz, 600); X.fillStyle = P.ink; X.save(); X.translate(px, py); X.rotate(fw.a * (1 - e)); X.fillText(w.w[c], 0, 0); X.restore();
      }
    });
  }
  if (B3 > 0) {
    X.save(); X.globalAlpha = B3;
    house(g.x, g.gy, g.w, g.h, id + 500, { type: g.type, s: sent, fs: g.fs, plate: false, roofU: E.out(B3), lit: g.lit, nochim: g.nochim });
    X.restore();
  }
  X.globalAlpha = 1;
}
const sigPh = (sh, lt) => { const ty = cue(sh, 'type'), fa = cue(sh, 'fall'), bu = cue(sh, 'build'); return { ty: U(lt, ty.at, ty.to), fa: U(lt, fa.at, fa.to), bu: U(lt, bu.at, bu.to) }; };

/* ================= shots ================= */
SHOTS.title = (lt) => {
  const t1 = 'THE ARCHITECT WHO NEVER BUILT ANYTHING', n = Math.floor(t1.length * U(lt, 0.8, 3.6));
  X.font = FELL(46); const fw = X.measureText(t1).width; X.textAlign = 'left'; X.textBaseline = 'middle'; X.fillStyle = P.ink; X.fillText(t1.slice(0, n), CX - fw / 2, 190);
  X.globalAlpha = seg(lt, 3.4, 4.2); txt('seven million houses, and one wall', CX, 252, 28, { italic: true });
  X.globalAlpha = seg(lt, 6.0, 6.8); txt('III', CX, 120, 20, {}); txt('a fable of Edifiction', CX, 300, 18, { italic: true }); X.globalAlpha = 1;
  // in miniature: letters fall and lie down as two courses of a low wall
  const s = 'one wall, built by hand', fs = 13; X.font = MONO(fs, 600); const cw = X.measureText('M').width, per = s.length, wx0 = CX - per * cw / 2, gy = 560;
  line([CX - 260, gy], [CX + 260, gy], 1.4, 9101, 0.4);
  for (let c = 0; c < 2; c++) for (let k = 0; k < per; k++) {
    const d = 4.0 + (c * per + k) / (2 * per) * 1.1, u = U(lt, d, d + 0.45); if (u <= 0) continue;
    const tx = wx0 + k * cw + c * cw * 0.3, ty = gy - 2 - c * fs * 1.2, sy = 340 + hash(k, c) * 60;
    X.font = MONO(fs, 600); X.fillStyle = P.ink; X.textAlign = 'left'; X.textBaseline = 'alphabetic'; X.fillText(s[k], tx, lerp(sy, ty, u * u));
  }
  if (lt > 5.4) { X.globalAlpha = seg(lt, 5.4, 6.0) * 0.6; for (let c = 0; c < 2; c++) X.fillRect(wx0 - 2, gy - 2 - c * fs * 1.2 - fs * 1.05, per * cw + 6, 0.8); X.globalAlpha = 1; }
};

/* ---------- the office: Edifier left, desk right, window on the city ---------- */
const OFF = { ex: 300, kx: 470, dx: 700, win: [880, 150, 300, 330] };
function officeRoom(lt, o = {}) {
  shape(R(-400, -200, 2100, FLOOR + 200), { lw: 0, h: [Math.PI / 2, 9, 0.35] });
  shape(R(-400, FLOOR - 110, 2100, 110), { lw: 0, fill: P.paper }); line([-400, FLOOR - 110], [2100, FLOOR - 110], 1.4, 9201, 0.3);
  for (let i = 0; i < 26; i++) line([-400 + i * 90, FLOOR - 110], [-400 + i * 90, FLOOR], 0.8, 9210 + i, 0.2);
  ground(FLOOR, -400, 2100, { h: [0.02, 6, 0.5] });
  // window on the city
  const [wx, wy, ww, wh] = OFF.win;
  X.save(); path(R(wx, wy, ww, wh)); X.clip(); X.fillStyle = P.paper; X.fillRect(wx, wy, ww, wh); sky(wy, wy + wh * 0.6, 0.15);
  city(wy + wh * 0.62, wx - 30, wx + ww + 40, 0.38, 3300, { n: o.cityN }); city(wy + wh * 0.86, wx - 60, wx + ww + 40, 0.6, 3400, { n: o.cityN }); ground(wy + wh * 0.86, wx - 10, wx + ww + 10, { h: [0.03, 4, 0.4] });
  X.restore();
  shape(R(wx - 10, wy - 10, ww + 20, wh + 20), { fill: null, lw: 3, id: 9230 }); line([wx + ww / 2, wy], [wx + ww / 2, wy + wh], 4, 9231, 0.2); line([wx, wy + wh * 0.5], [wx + ww, wy + wh * 0.5], 4, 9232, 0.2);
  shape(R(wx - 18, wy + wh + 10, ww + 36, 12), { lw: 1.4, id: 9233, h: [0, 3, 0.5] });
  // a framed diploma and a shelf of bound descriptions
  shape(R(560, 210, 90, 64), { lw: 2, id: 9240, fill: PAPER2 }); for (let i = 0; i < 4; i++) line([574, 228 + i * 10], [636, 228 + i * 10], 0.6, 9241 + i, 0.1);
  shape(R(80, 160, 400, 10), { lw: 1.4, id: 9250, h: [0, 3, 0.5] });
  for (let i = 0; i < 22; i++) { const h = 54 + hash(i, 3) * 26; shape(R(84 + i * 17.5, 160 - h, 15, h), { lw: 1, id: 9260 + i, h: [Math.PI / 2, 2.4, 0.5] }); }
}
function desk(x, o = {}) {
  shape(R(x - 140, FLOOR - 170, 280, 14), { lw: 1.8, id: 9300, h: [0.1, 3, 0.6] });
  for (const lx of [x - 128, x + 116]) shape(R(lx, FLOOR - 156, 12, 156), { lw: 1.4, id: 9301 + lx, h: [Math.PI / 2, 2.4, 0.6] });
  shape(R(x - 100, FLOOR - 156, 110, 34), { lw: 1.4, id: 9305 }); ball(x - 45, FLOOR - 139, 3, 9306, PAT.f, 1);
  // the model city
  const by = FLOOR - 170; shape(R(x - 30, by - 6, 150, 6), { lw: 1.2, id: 9310, h: [0, 2, 0.5] });
  for (let i = 0; i < 9; i++) { const hx = x - 22 + i * 16, hh = 10 + hash(i, 8) * 22; house(hx, by - 6, 12, hh, 9320 + i * 40, { type: i % 3, plate: false, win: 0 }); }
  if (o.cards) for (let k = 0; k < o.cards; k++) prop('card', x - 80 + k * 4, by - 2 - k * 2, -0.1, 9400 + k);
}

SHOTS.office = (lt, sd, sh) => {
  const L = sh.lines, ins = cue(sh, 'inside').at, sg = cue(sh, 'sign'), ty = cue(sh, 'type'), fa = cue(sh, 'fall'), bu = cue(sh, 'build'), gr = cue(sh, 'grow'), pr = cue(sh, 'press');
  const ph = sigPh(sh, lt), S = T.sent.library;
  if (lt < ins) {
    // the Ministry, and the City of Described Houses behind it
    const c = camFor(lt, [[0, ON(640, 330, 0.92)], [L[0].t0 + 1, ON(640, 360, 1.0), 6], [L[1].t0 + 0.4, ON(640, 296, 2.2), 2.2]]);
    cam(c, () => {
      sky(-300, 470, 0.16); city(470, -500, 1800, 0.55, 3100, { letters: true }); city(520, -500, 1800, 0.85, 3200, { letters: true }); ground(560, -900, 2200, { h: [0.02, 6, 0.4] });
      ministry(640, 640, 1.0, 6000); ground(640, -900, 2200, { h: [0.03, 5, 0.5] });
      for (let i = 0; i < 4; i++) person({ kind: i % 2 ? 'fac' : 'press', x: ((i * 330 + lt * 22 * (i % 2 ? 1 : -1)) % 1500 + 1500) % 1500 - 100, y: 668, s: 0.5, f: i % 2 ? 1 : -1, walk: 1, ph: lt * 7 + i, id: 7000 + i * 200 });
    });
    return;
  }
  const outsideA = ty.at + 2.0, outsideB = bu.to + 1.6;
  if (lt >= outsideA && lt < Math.max(outsideB, L[3].t0 - 0.2)) {
    // Quiet Street: the empty plot, the sentence over it
    const G = LIB;
    let c = camFor(lt, [[outsideA, ON(640, 420, 1.0)], [fa.at, ON(640, 450, 1.15), 1.4], [bu.to - 0.2, ON(G.plx + 18, G.ply + 8, 4.2), 1.2]]);
    cam(c, () => { street(lt, { lib: false }); sigBuild(S, G, ph, 4000); if (lt > bu.to - 0.3) libPlate(seg(lt, bu.to - 0.3, bu.to + 0.2)); });
    return;
  }
  if (lt >= L[3].t0 - 0.2 && lt < pr.at) {
    // seven million: the city multiplies
    const n = U(lt, gr.at, gr.to);
    const c = camFor(lt, [[L[3].t0 - 0.2, ON(640, 380, 1.25)], [L[3].t0 + 0.2, ON(640, 360, 0.9), Math.max(1, gr.to - gr.at)]]);
    cam(c, () => { sky(-400, 400, 0.14); for (let r = 0; r < 6; r++) city(400 + r * 46, -900, 2200, 0.3 + r * 0.16, 3500 + r * 100, { n: clamp(n * 1.25 - r * 0.05), letters: r > 3 }); ground(400 + 5 * 46 + 4, -900, 2200, { h: [0.02, 7, 0.35] }); });
    return;
  }
  // inside the office
  const typing = lt >= ty.at - 0.4 && lt < outsideA, press = lt >= pr.at;
  const kx = press ? 760 : OFF.kx, kf = press ? -1 : (lt >= sg.at - 0.5 && lt < sg.to + 0.4 ? 1 : -1);
  let c;
  if (!press) c = camFor(lt, [[ins, ON(560, 400, 1.0)], [sg.at - 0.3, ON(620, 470, 1.6), 1.0], [ty.at - 0.6, ON(OFF.ex + 40, 400, 1.8), 1.0]]);
  else c = withTight(sh, lt, camFor(lt, [[pr.at, ON(640, 420, 1.1)], [L[6].t0, ON(720, 430, 1.4), 1.2]]), 790, 370, 2.5);
  const pn = Math.floor(S.length * ph.ty);
  cam(c, () => {
    officeRoom(lt, { cityN: 1 });
    edifier(OFF.ex, FLOOR, 1.0, 8000, { paper: typing ? 30 + 30 * ph.ty : 0, ptext: S, pn, keys: typing && ph.ty < 1 ? 1 : 0, speak: 0 });
    desk(OFF.dx, { cards: 3 });
    const kt = sayAt(sh, 'K', lt);
    if (!press) {
      const ra = typing ? [0.2 + Math.sin(lt * 21) * 0.08, 0.9] : kf > 0 ? [0.5, 0.25 + Math.sin(lt * 12) * 0.1 * (lt < sg.to ? 1 : 0)] : null;
      const la = typing ? [0.35 + Math.cos(lt * 19) * 0.08, 0.95] : null;
      person({ kind: 'klause', x: kx, y: FLOOR, f: kf, id: 5000, ra, la, down: kf > 0 || typing, hold: kf > 0 && !typing ? 'note' : null, holdA: -0.4 });
    } else {
      person({ kind: 'press', x: 470, y: FLOOR, f: 1, id: 5600, ra: [0.4, -0.2 + Math.sin(lt * 9) * 0.15], la: [0.7, 0.2], lhold: 'note', look: 0.3 });
      const g = lt > L[6].t0 + 0.2 && lt < L[6].t1 + 0.5;
      person({ kind: 'klause', x: kx, y: FLOOR, f: -1, id: 5000, mouth: kt, ra: g ? [-0.5, -0.5] : [Math.PI / 2 + 0.3, Math.PI / 2 + 0.6], la: [Math.PI / 2 + 0.5, Math.PI - 0.2], brow: kt > 0 ? 0.6 : 0 });
    }
  });
};

/* ---------- Quiet Street ---------- */
const LIB = { x: 640, gy: 560, w: 230, h: 168, type: 0, fs: 7, ty: 230, tfs: 19, plx: 506, ply: 486 };
function libPlate(a = 1, o = {}) { if (a <= 0) return; X.save(); X.globalAlpha = a; line([LIB.plx + 18, LIB.ply + 20], [LIB.plx + 18, LIB.gy], 3, 9500, 0.2); plate(LIB.plx, LIB.ply, 36, 22, o.blank ? '' : T.sent.library, 9501, { fs: 2.9 }); X.restore(); }
function street(lt, o = {}) {
  sky(-400, LIB.gy - 120, 0.12);
  city(LIB.gy - 110, -900, 2200, 0.42, 3600, { letters: true });
  ground(LIB.gy - 110, -900, 2200, { h: [0.02, 5, 0.3] });
  house(330, LIB.gy, 190, 230, 3700, { type: 1, s: 'A tall house with a good view of the other houses.', fs: 9, plate: 'A tall house with a good view of the other houses.' });
  house(1000, LIB.gy, 230, 200, 3800, { type: 0, s: 'A house for a family of four, with room for a fifth.', fs: 9, plate: 'A house for a family of four, with room for a fifth.' });
  house(-40, LIB.gy, 220, 180, 3900, { type: 0, s: 'A warm house for a cold street.', fs: 9 });
  house(1310, LIB.gy, 170, 250, 3950, { type: 1, s: 'A narrow house, narrower at the top.', fs: 9 });
  ground(LIB.gy, -900, 2200, { h: [0.02, 6, 0.45] });
  for (let i = -6; i < 16; i++) line([i * 110, LIB.gy + 24], [i * 110 + 60, LIB.gy + 24], 0.8, 9600 + i, 0.3);
  if (o.lib) house(LIB.x, LIB.gy, LIB.w, LIB.h, 4500, { type: 0, s: T.sent.library, fs: LIB.fs, plate: false });
}

SHOTS.collapse = (lt, sd, sh) => {
  const L = sh.lines, fa = cue(sh, 'fall'), ar = cue(sh, 'arrive'), li = cue(sh, 'lift'), pk = cue(sh, 'pick');
  const fu = U(lt, fa.at, fa.to);
  let c = camFor(lt, [[0, ON(640, 420, 1.0)], [fa.at - 0.5, ON(640, 450, 1.2), 1.5], [fa.to + 0.5, ON(640, 420, 1.0), 2.0], [ar.at, ON(580, 450, 1.25), 2], [L[3].t0, ON(LIB.plx + 40, LIB.ply + 10, 2.8), 1.4],
    [L[5].t0 - 0.6, ON(680, 530, 2.6), 1.0], [L[6].t0, ON(640, 500, 1.8), 1.0], [pk.at - 0.3, ON(678, 488, 3.4), 0.9]]);
  c = withTight(sh, lt, c, LIB.plx + 44, LIB.ply + 2, 3.6);
  const shake = fu > 0.6 && fu < 1 ? Math.sin(lt * 80) * 3 * (1 - fu) : 0; c = { ...c, y: c.y + shake };
  cam(c, () => {
    street(lt, { lib: false });
    // the library sits down
    if (fu < 1) {
      const sq = E.in(clamp((fu - 0.15) / 0.7)), lean = Math.sin(fu * 3) * 0.04 * fu;
      X.save(); X.translate(LIB.x, LIB.gy); X.scale(1, 1 - sq * 0.9); X.rotate(lean); house(0, 0, LIB.w * (1 + sq * 0.25), LIB.h, 4500, { type: 0, s: T.sent.library, fs: LIB.fs, plate: false }); X.restore();
    }
    // rubble: letters
    const ru = clamp((fu - 0.55) / 0.45);
    if (ru > 0) {
      X.font = MONO(LIB.fs + 1, 600); X.textAlign = 'center'; X.textBaseline = 'middle'; X.fillStyle = P.ink;
      const S = T.sent.library;
      for (let i = 0; i < 520; i++) {
        const hx = (hash(i, 1) - 0.5), hy = hash(i, 2), ex = LIB.x + hx * (LIB.w * 1.4) * (1 - hy * 0.6), ey = LIB.gy - 4 - Math.pow(hy, 1.6) * 46 * (1 - Math.abs(hx) * 1.3);
        const d = hash(i, 3) * 0.5, u = clamp((ru - d) / 0.5); if (u <= 0) continue;
        const sx = LIB.x + hx * LIB.w * 0.9, sy = LIB.gy - 60 - hash(i, 4) * 40, x = lerp(sx, ex, E.out(u)), y = lerp(sy, ey, u * u) - Math.sin(u * Math.PI) * 30 * hash(i, 5);
        if (li && lt > li.at && Math.abs(ex - 700) < 34 && ey > LIB.gy - 30) continue;
        X.save(); X.translate(x, y); X.rotate((hash(i, 6) - 0.5) * 3); X.fillText(S[i % S.length], 0, 0); X.restore();
      }
      // dust
      const du = clamp((fu - 0.6) / 0.4) * (1 - U(lt, fa.to, fa.to + 4));
      if (du > 0) { X.save(); X.globalAlpha = 0.5 * du; for (let i = 0; i < 14; i++) { const r = 30 + hash(i, 7) * 50 + (lt - fa.at) * 12; ball(LIB.x + (hash(i, 8) - 0.5) * 300, LIB.gy - 30 - hash(i, 9) * 60 - (lt - fa.at) * 6, r, 9700 + i, PAT.f, 0.6, P.paper, false); } X.restore(); }
    }
    libPlate(1);
    // the missing foundation, in red, where it should have been
    if (li && lt > li.at) {
      const a = seg(lt, li.at + 0.4, li.at + 1.2); X.save(); X.globalAlpha = a; X.setLineDash([6, 5]); X.strokeStyle = P.red; X.lineWidth = 2;
      X.strokeRect(LIB.x - LIB.w / 2 - 6, LIB.gy + 2, LIB.w + 12, 40); X.setLineDash([]); X.restore();
      X.globalAlpha = a; X.font = FELL(11, true); X.fillStyle = P.red; X.textAlign = 'center'; X.textBaseline = 'middle'; X.globalAlpha = 1;
    }
    if (lt >= ar.at) {
      const u = U(lt, ar.at, ar.to), kx = lerp(-60, 578, E.out(u)) + (lt > L[5].t0 - 0.8 ? 92 * seg(lt, L[5].t0 - 0.8, L[5].t0) : 0), walking = u < 0.97 || (lt > L[5].t0 - 0.8 && lt < L[5].t0);
      const kt = sayAt(sh, 'K', lt);
      let o = { kind: 'klause', x: kx, y: LIB.gy + 6, s: 0.32, f: 1, walk: walking ? 1 : 0, ph: lt * 6.5, id: 5000, mouth: kt };
      if (lt > L[3].t0 && lt < L[5].t0 - 0.8) { o.f = -1; o.look = 0.4; o.stoop = 0.15; }
      if (li && lt > li.at && lt < L[6].t0) { const lu = seg(lt, li.at, li.at + 0.9); o.stoop = 0.7 * lu; o.ra = [lerp(Math.PI / 2, 1.1, lu), lerp(Math.PI / 2, 0.7, lu)]; o.la = [lerp(Math.PI / 2, 1.3, lu), 0.8]; o.down = true; }
      if (pk && lt > pk.at - 0.6) { const pu = seg(lt, pk.at - 0.6, pk.at + 0.6); o.f = 1; o.stoop = 0.05; o.ra = [lerp(Math.PI / 2, -0.3, pu), lerp(Math.PI / 2, -1.1, pu)]; o.hold = pu > 0.3 ? 'letter' : null; o.prop = { ch: 'q' }; o.look = 0.6; o.brow = 0.8; }
      person(o);
      if (li && lt > li.at && lt < L[6].t0) { const lu = seg(lt, li.at, li.at + 0.9) * (1 - seg(lt, li.to, li.to + 0.6)); X.save(); X.translate(700, LIB.gy - 4 - lu * 30); X.rotate(-0.25 * lu); X.font = MONO(LIB.fs + 1, 600); X.fillStyle = P.ink; X.textAlign = 'center'; shape(R(-30, -10, 60, 14), { lw: 1, id: 9800, fill: P.paper }); letterFill(() => path(R(-30, -10, 60, 14)), [-30, -10, 30, 4], T.sent.library, 6); X.restore(); }
    }
  });
};

/* ---------- the annexes ---------- */
const ANX = { x: 640, gy: 580, w: 300, h: 190, type: 1, fs: 6.5, ty: 205, tfs: 18, lit: true, nochim: true };
const FN = ['On Foundations', 'fn. 1', 'fn. 7', 'fn. 31', 'fn. 212', 'fn. 598', 'fn. 1,096', 'fn. 2,240', 'fn. 3,377', 'fn. 4,112'];
const CHART = [
  ['ON FOUNDATIONS', 'The load of the walls is carried by the footing into the ground.', 'The ground must bear it. This is its bearing capacity.¹'],
  ['fn. 1  BEARING CAPACITY', 'The capacity of the ground depends on what the ground is made of', 'and how its grains rest upon one another.⁷'],
  ['fn. 7  SOILS', 'A heap of grains will stand at its own angle and no steeper.', 'Why it stands at all is a question of friction.³¹'],
  ['fn. 31  FRICTION', 'Two grains in contact resist sliding in proportion to how hard', 'they are pressed together. Why, see note.²¹²'],
  ['fn. 212  CONTACT', 'At the point of contact the surfaces are not flat.', 'They touch at small peaks, which bear the load.⁵⁹⁸'],
];
const RSZ = [1, 0.84, 0.7, 0.58, 0.48];
function annexBlock(x, gy, w, h, id, label) {
  // drawn at full size and scaled, so a footnote's annex is the same drawing as the first, only smaller
  const k = w / 300; X.save(); X.translate(x, gy); X.scale(k, k);
  house(0, 0, 300, 190, id, { type: 1, s: T.sent.annex, fs: 6.5, plate: false, lit: true });
  plate(24, -66, 64, 22, label, id + 7, { fs: 9 });
  X.restore();
}
function chartDraw(k, x, y, w, h) {
  shape(R(x, y, w, h), { lw: 2, id: 9900 + k, fill: PAPER2 });
  const ch = CHART[k]; X.font = MONO(h * 0.06, 600); X.fillStyle = P.ink; X.textAlign = 'left'; X.textBaseline = 'alphabetic'; X.fillText(ch[0], x + w * 0.06, y + h * 0.12);
  X.font = FELL(h * 0.048, true); X.fillText(ch[1], x + w * 0.06, y + h * 0.84, w * 0.88); X.fillText(ch[2], x + w * 0.06, y + h * 0.92, w * 0.88);
  const dx = x + w * 0.5, dy = y + h * 0.62, s = h / 300;
  if (k === 0) { shape(R(dx - 120 * s, dy - 10 * s, 240 * s, 90 * s), { lw: 1, id: 9910, h: [0.7, 4 * s, 0.5] }); shape(R(dx - 16 * s, dy - 120 * s, 32 * s, 112 * s), { lw: 1.4, id: 9911, h: [Math.PI / 2, 3 * s, 0.5] }); shape(R(dx - 40 * s, dy - 12 * s, 80 * s, 24 * s), { lw: 1.4, id: 9912, h: [0, 3 * s, 0.5] }); for (const ax of [-60, 0, 60]) { line([dx + ax * s, dy - 160 * s], [dx + ax * 0.2 * s, dy - 128 * s], 1.4, 9913 + ax, 0.2); } for (const ax of [-30, -10, 10, 30]) line([dx + ax * s, dy + 50 * s], [dx + ax * s, dy + 16 * s], 1, 9920 + ax, 0.2); }
  else if (k === 1) { for (let i = 0; i < 46; i++) ball(dx + (hash(i, 1) - 0.5) * 240 * s, dy + (hash(i, 2) - 0.5) * 110 * s, (6 + hash(i, 3) * 6) * s, 9930 + i, PAT.f, 1); }
  else if (k === 2) { shape([[dx - 130 * s, dy + 50 * s], [dx + 130 * s, dy + 50 * s], [dx, dy - 60 * s]], { lw: 1.2, id: 9980, h: [0.3, 3 * s, 0.5] }); X.beginPath(); X.arc(dx - 130 * s, dy + 50 * s, 40 * s, -0.7, 0); X.lineWidth = 1; X.strokeStyle = P.ink; X.stroke(); }
  else if (k === 3) { ball(dx - 40 * s, dy, 44 * s, 9981, PAT.f, 1.4); ball(dx + 44 * s, dy + 4 * s, 44 * s, 9982, PAT.f, 1.4); line([dx - 40 * s, dy - 70 * s], [dx - 40 * s, dy - 46 * s], 1.4, 9983, 0.1); line([dx + 100 * s, dy + 4 * s], [dx + 120 * s, dy + 4 * s], 1.4, 9984, 0.1); }
  else { const pts = []; for (let i = 0; i <= 40; i++) pts.push([dx - 120 * s + i * 6 * s, dy + (hash(i, 9) - 0.5) * 30 * s - (i % 5 === 0 ? 14 * s : 0)]); ink(pts, 1.4, 9990, 0.2); const p2 = pts.map(([a, b], i) => [a, b + 34 * s + (i % 7 === 3 ? -20 * s : 0)]); ink(p2, 1.4, 9991, 0.2); }
}
function annexRoom(k, lt, kx, o = {}) {
  const sz = RSZ[k], ceil = FLOOR - 470 * sz, rh = FLOOR - ceil;
  shape(R(-300, ceil, 1900, rh), { lw: 0, fill: P.paper });
  X.save(); X.globalAlpha = 0.55; letterFill(() => path(R(-300, ceil + 6, 1900, 34 * sz + 8)), [-300, ceil + 6, 1600, ceil + 14 + 34 * sz], CHART[k].join(' '), 9 * sz + 3); X.restore(); line([-300, ceil + 16 + 34 * sz], [1600, ceil + 16 + 34 * sz], 1.2, 9705, 0.2);
  shape(R(-300, ceil - 400, 1900, 400), { lw: 0, h: [0.6, 6, 0.6] }); line([-300, ceil], [1600, ceil], 2.2, 9701, 0.3);
  ground(FLOOR, -300, 1600, { h: [0.02, 5, 0.5] });
  // lamp hanging
  line([640, ceil], [640, ceil + 40 * sz], 1.2, 9702, 0.1); shape([[620, ceil + 40 * sz], [660, ceil + 40 * sz], [672, ceil + 56 * sz], [608, ceil + 56 * sz]], { lw: 1.4, id: 9703, fill: P.ink }); star(640, ceil + 64 * sz, 10 * sz, 9704, P.ink, 8);
  // chart
  chartDraw(k, 640 - 230 * sz, ceil + 70 * sz, 460 * sz, 300 * sz);
  // doors: entry left, onward right
  const dh = rh * 0.62, dw = dh * 0.45;
  for (const [dx, lab, open] of [[150, FN[k], o.inOpen || 0], [1080, FN[k + 1], o.outOpen || 0]]) {
    shape(R(dx - dw / 2, FLOOR - dh, dw, dh), { lw: 2, id: 9720 + dx, fill: P.ink });
    if (open < 1) shape(R(dx - dw / 2, FLOOR - dh, dw * (1 - open), dh), { lw: 1.6, id: 9721 + dx, h: [Math.PI / 2, 3, 0.6] });
    plate(dx - dw * 0.55, FLOOR - dh - 30 * sz - 8, dw * 1.1, 22 * sz + 6, lab, 9722 + dx, { fs: (9 + 5 * sz) });
  }
}
SHOTS.annex = (lt, sd, sh) => {
  const L = sh.lines, ty = cue(sh, 'type'), bu = cue(sh, 'build'), rooms = cues(sh, 'room'), ch = cue(sh, 'chain'), tn = cue(sh, 'tiny');
  const ph = sigPh(sh, lt);
  if (lt < ty.at + 1.6) {
    // the office: the keys begin by themselves
    const c = camFor(lt, [[0, ON(520, 420, 1.1)], [L[0].t0, ON(OFF.ex + 60, 380, 1.7), 1.6]]);
    cam(c, () => { officeRoom(lt, {}); desk(OFF.dx, {}); person({ kind: 'klause', x: 560, y: FLOOR, f: -1, id: 5000, stoop: 0.12, down: true, ra: [Math.PI / 2 + 0.2, Math.PI / 2 + 0.6], la: [Math.PI / 2 + 0.3, Math.PI - 0.3], look: lt > L[0].t0 ? 0.6 : 0 });
      edifier(OFF.ex, FLOOR, 1.0, 8000, { speak: sayAt(sh, 'E', lt), keys: lt > ty.at - 0.6 ? 1 : 0, paper: lt > ty.at ? 30 * U(lt, ty.at, ty.at + 1.6) : 0, ptext: T.sent.annex, pn: Math.floor(T.sent.annex.length * ph.ty) }); });
    return;
  }
  if (lt < rooms[0].at) {
    // the courtyard of the Institute: the explanation is built
    let c = camFor(lt, [[ty.at + 1.6, ON(640, 420, 1.0)], [bu.to - 0.4, ON(640, 470, 1.25), 1.2]]);
    c = withTight(sh, lt, c, ANX.x + 34, ANX.gy - 40, 3.2);
    cam(c, () => {
      sky(-300, 330, 0.12); city(330, -200, 1500, 0.4, 3650, { letters: true });
      for (const [x0, x1, id] of [[-400, 250, 9750], [1030, 1700, 9751]]) { shape(R(x0, 150, x1 - x0, 430), { lw: 1.6, id, h: [0, 6, 0.35] }); shape(R(x0 - 10, 136, x1 - x0 + 20, 16), { lw: 1.4, id: id + 1, h: [0, 2.6, 0.6] }); for (let i = 0; i < 6; i++) { const wx = x0 + 40 + i * 110; if (wx > x1 - 60) break; shape(R(wx, 220, 44, 90), { lw: 1.2, id: id + 2 + i, fill: P.ink }); shape(R(wx, 380, 44, 90), { lw: 1.2, id: id + 10 + i, fill: P.ink }); } } ground(ANX.gy, -900, 2200, { h: [[0.02, 9, 0.4], [1.2, 30, 0.3]] });
      sigBuild(T.sent.annex, ANX, ph, 4200);
      if (lt > bu.to - 0.2) { X.save(); X.globalAlpha = seg(lt, bu.to - 0.2, bu.to + 0.3); annexBlock(ANX.x, ANX.gy, ANX.w, ANX.h, 4800, FN[0]); X.restore(); }
      if (lt > L[1].t1 - 0.3) { const u = U(lt, L[1].t1 - 0.3, rooms[0].at); person({ kind: 'klause', x: lerp(380, ANX.x - 14, u), y: ANX.gy, s: 0.4, f: 1, walk: u < 1 ? 1 : 0, ph: lt * 6.5, id: 5000, alpha: 1 - seg(u, 0.85, 1) }); }
    });
    return;
  }
  if (lt < ch.at) {
    let k = 0; for (const r of rooms) if (lt >= r.at) k = r.n;
    const a = rooms[k].at, b = k + 1 < rooms.length ? rooms[k + 1].at : ch.at, sz = RSZ[k];
    const walkEnd = b - 1.6, u = U(lt, a + 0.3, walkEnd), kx = lerp(150, 1080, E.io(u));
    const inOpen = 1 - seg(lt, a + 0.6, a + 1.2), outOpen = seg(lt, b - 1.4, b - 0.9);
    const zin = seg(lt, b - 0.55, b), zout = 1 - seg(lt, a, a + 0.55);
    const ceil = FLOOR - 470 * sz, base = ON(640, (ceil + FLOOR) / 2 + 10, 1 / (0.12 + 0.88 * sz) * 0.98);
    let c = base;
    if (zout > 0) c = blendCam(base, ON(150, FLOOR - 470 * sz * 0.3, 5), E.in(zout));
    if (zin > 0) c = blendCam(c, ON(1080, FLOOR - 470 * sz * 0.3, 5), E.in(zin));
    cam(c, () => {
      annexRoom(k, lt, kx, { inOpen, outOpen });
      const stoop = [0, 0.05, 0.28, 0.5, 0.75][k], reading = u > 0.38 && u < 0.6;
      person({ kind: 'klause', x: kx, y: FLOOR, f: 1, walk: u > 0 && u < 1 && !reading ? 1 : 0, ph: lt * 6.5, id: 5000, stoop, look: reading ? 0.8 : 0, alpha: 1 - seg(lt, walkEnd - 0.05, walkEnd + 0.3), beard: k * 0.06, brow: reading ? 0.5 : 0 });
    });
    return;
  }
  if (lt < tn.at) {
    // the annexes, end to end, each the footnote of the last
    const blocks = []; let x = 120, w = 300, h = 190;
    for (let i = 0; i < FN.length; i++) { blocks.push({ x: x + w / 2, w, h }); x += w; w *= 0.7; h *= 0.7; }
    const tgt = blocks[9], u = U(lt, ch.at + 0.6, tn.at - 0.2);
    const c = blendCam(ON(560, 420, 1.0), ON(tgt.x, 580 - tgt.h * 0.6, 640 / (tgt.w * 2.2)), Math.pow(E.io(u), 1.6));
    cam(c, () => {
      sky(-300, 330, 0.12); city(330, -200, 1600, 0.4, 3650, { letters: true }); ground(580, -900, 2200, { h: [[0.02, 9, 0.4], [1.2, 30, 0.3]] });
      for (let i = 0; i < blocks.length; i++) annexBlock(blocks[i].x, 580, blocks[i].w, blocks[i].h, 4800 + i * 60, FN[i]);
      let x2 = x, w2 = w; for (let i = 0; i < 14; i++) { annexBlock(x2 + w2 / 2, 580, w2, w2 * 0.63, 5600 + i * 60, 'fn. 4,' + (113 + i)); x2 += w2; w2 *= 0.7; }
    });
    return;
  }
  // the room at fn. 4,112
  const kt = sayAt(sh, 'K', lt), up = lt > L[9].t0 + 1.4;
  const c = camFor(lt, [[tn.at, ON(1060, 480, 2.0)], [L[8].t0 + (L[8].t1 - L[8].t0) * 0.62, ON(1150, 440, 2.8), 1.2], [L[8].t1 + 0.4, ON(640, 500, 1.75), 1.6], [L[9].t0 - 0.2, ON(560, 490, 2.1), 1.4]]);
  cam(c, () => { tinyRoom(lt, true); person({ kind: 'klause', x: 520, y: FLOOR, f: 1, sit: 1, seatH: 92, id: 5000, beard: 0.5, mouth: kt, look: up ? 1.6 : 0.2, headY: up ? -2 : 0, ra: [1.0, 1.9], la: [1.1, 1.7], hold: null }); prop('kettle', 700, FLOOR - 84, 0, 9860); });
};
function tinyRoom(lt, leaves) {
  const ceil = 372;
  shape(R(-300, ceil, 1900, FLOOR - ceil), { lw: 0, fill: P.paper });
  X.save(); X.globalAlpha = 0.55; letterFill(() => path(R(-300, ceil + 6, 1900, 26)), [-300, ceil + 6, 1600, ceil + 32], CHART[4].join(' ') + ' ' + CHART[3].join(' '), 6); X.restore(); line([-300, ceil + 34], [1600, ceil + 34], 1.2, 9850, 0.2);
  shape(R(-300, ceil - 600, 1900, 600), { lw: 0, h: [0.6, 6, 0.6] }); line([-300, ceil], [1600, ceil], 2.2, 9851, 0.3);
  ground(FLOOR, -300, 1600, { h: [0.02, 5, 0.5] });
  // cot
  shape(R(300, FLOOR - 70, 260, 16), { lw: 1.6, id: 9852, h: [0.1, 3, 0.5] }); for (const lx of [306, 548]) shape(R(lx, FLOOR - 54, 8, 54), { lw: 1.2, id: 9853 + lx, fill: P.ink });
  shape([[300, FLOOR - 70], [420, FLOOR - 86], [560, FLOOR - 70]], { lw: 1.4, id: 9855, h: [[0.9, 4, 0.5], [-0.9, 4, 0.5]] }); shape(R(300, FLOOR - 92, 54, 20), { lw: 1.2, id: 9856, fill: PAPER2 });
  // stool with the kettle, and a chair
  shape(R(670, FLOOR - 84, 60, 10), { lw: 1.4, id: 9857, h: [0, 2.4, 0.5] }); for (const lx of [676, 718]) line([lx, FLOOR - 74], [lx - 4 + (lx > 700 ? 8 : 0), FLOOR], 3, 9858 + lx, 0.1);
  shape(R(810, FLOOR - 96, 70, 10), { lw: 1.4, id: 9861, h: [0, 2.4, 0.5] }); line([874, FLOOR - 96], [878, FLOOR - 200], 4, 9862, 0.2); line([816, FLOOR - 86], [814, FLOOR], 3, 9863, 0.1); line([874, FLOOR - 86], [876, FLOOR], 3, 9864, 0.1);
  // a small window: the autumn
  const wx = 960, wy = 404, ww = 84, wh = 84;
  X.save(); path(R(wx, wy, ww, wh)); X.clip(); X.fillStyle = P.paper; X.fillRect(wx, wy, ww, wh); sky(wy, wy + wh, 0.2);
  line([wx + 70, wy + wh], [wx + 64, wy + 30], 4, 9865, 0.3); line([wx + 66, wy + 50], [wx + 30, wy + 26], 2, 9866, 0.3);
  if (leaves) for (let i = 0; i < 5; i++) { const p = (lt * 0.18 + hash(i, 4)) % 1; ball(wx + 20 + hash(i, 5) * 60 + Math.sin(lt * 2 + i) * 8, wy + p * wh, 3, 9867 + i, PAT.m, 0.8); }
  X.restore(); shape(R(wx - 6, wy - 6, ww + 12, wh + 12), { fill: null, lw: 3, id: 9875 }); line([wx + ww / 2, wy], [wx + ww / 2, wy + wh], 3, 9876, 0.1); line([wx, wy + wh / 2], [wx + ww, wy + wh / 2], 3, 9877, 0.1);
  // the door and its plate
  shape(R(1130, FLOOR - 200, 92, 200), { lw: 2, id: 9878, h: [Math.PI / 2, 3, 0.6] }); ball(1140, FLOOR - 100, 4, 9879, PAT.f, 1);
  plate(1122, FLOOR - 250, 108, 36, 'fn. 4,112', 9880, { fs: 17 });
  // a cup on a shelf
  shape(R(140, 420, 120, 8), { lw: 1.2, id: 9881, h: [0, 2, 0.5] }); shape([[180, 420], [200, 420], [198, 404], [182, 404]], { lw: 1.2, id: 9882 });
}

/* ---------- the hall with the windows ---------- */
const HALL = { wins: [360, 640, 920], wy: 150, ww: 150, wh: 310, lect: 150, door: 1160 };
function hallRoom(lt, o = {}) {
  shape(R(-300, -200, 1900, FLOOR + 200), { lw: 0, h: [Math.PI / 2, 12, 0.3] });
  shape(R(-300, -200, 1900, 280), { lw: 0, h: [0, 9, 0.35] }); line([-300, 80], [1600, 80], 2, 9601, 0.3);
  ground(FLOOR, -300, 1600, { h: [[0.02, 6, 0.5], [1.1, 40, 0.3]] });
  shape(R(-300, FLOOR - 70, 1900, 70), { lw: 0, fill: P.paper }); line([-300, FLOOR - 70], [1600, FLOOR - 70], 1.4, 9602, 0.3);
  const op = o.open || 0;
  HALL.wins.forEach((wx0, i) => {
    const wx = wx0 - HALL.ww / 2, wy = HALL.wy, ww = HALL.ww, wh = HALL.wh, isOpen = i === 1;
    X.save(); path(R(wx, wy, ww, wh)); X.clip(); X.fillStyle = P.paper; X.fillRect(wx, wy, ww, wh); sky(wy, wy + wh * 0.65, 0.15);
    city(wy + wh * 0.72, wx - 40, wx + ww + 40, 0.42, 3660 + i * 30, {}); ground(wy + wh * 0.72, wx - 20, wx + ww + 20, { h: [0.02, 5, 0.3] });
    const tx = wx + ww * (i === 0 ? 0.8 : 0.2); line([tx, wy + wh], [tx, wy + wh * 0.4], 5, 9610 + i, 0.3); for (let k = 0; k < 5; k++) ball(tx + (hash(k, i) - 0.5) * 60 + (isOpen ? Math.sin(lt * 3 + k) * 4 * op : 0), wy + wh * 0.35 + hash(k, i + 3) * 40, 16, 9620 + i * 10 + k, PAT.m, 1);
    X.restore();
    // glass: lower sash slides up behind the upper when opened
    const sl = isOpen ? op * wh * 0.46 : 0;
    X.save(); X.globalAlpha = 0.42; X.fillStyle = P.paper; X.fillRect(wx, wy, ww, wh * 0.5); X.fillRect(wx, wy + wh * 0.5 - sl, ww, wh * 0.5); X.restore();
    if (isOpen && sl > 0) { X.save(); path(R(wx, wy + wh - sl, ww, sl)); X.clip(); sky(wy, wy + wh * 0.65, 0.15); X.restore(); }
    for (const [gx, gw] of [[0.2, 10], [0.36, 4]]) { X.save(); X.globalAlpha = 0.35; X.fillStyle = P.paper; X.beginPath(); X.moveTo(wx + ww * gx, wy); X.lineTo(wx + ww * gx + gw, wy); X.lineTo(wx + ww * gx + gw - 60, wy + wh); X.lineTo(wx + ww * gx - 60, wy + wh); X.fill(); X.restore(); }
    shape(R(wx - 12, wy - 12, ww + 24, wh + 24), { fill: null, lw: 3, id: 9630 + i });
    line([wx, wy + wh * 0.5], [wx + ww, wy + wh * 0.5], 5, 9640 + i, 0.2);
    shape(R(wx, wy + wh * 0.5 - sl - 4, ww, 8), { lw: 1.4, id: 9645 + i, h: [0, 2.4, 0.5] });
    line([wx + ww / 2, wy], [wx + ww / 2, wy + wh * 0.5 - 4], 3, 9650 + i, 0.1); line([wx + ww / 2, wy + wh * 0.5 + 4 - sl], [wx + ww / 2, wy + wh - sl], 3, 9655 + i, 0.1);
    shape(R(wx - 22, wy + wh + 12, ww + 44, 12), { lw: 1.4, id: 9660 + i, h: [0, 3, 0.5] });
    // curtains
    const bil = isOpen ? op * (0.6 + 0.4 * Math.sin(lt * 2.4)) : 0;
    for (const d of [-1, 1]) { const cx = d < 0 ? wx - 30 : wx + ww + 30, pts = [[cx - 18, wy - 30], [cx + 18, wy - 30]]; for (let k = 0; k <= 8; k++) pts.push([cx + 18 + Math.sin(k * 1.3 + lt * 2) * 4 * bil + (k / 8) * 40 * bil * -d * -1, wy - 30 + k * (wh + 40) / 8]); for (let k = 8; k >= 0; k--) pts.push([cx - 18 + Math.sin(k * 1.1) * 3 + (k / 8) * 30 * bil * -d * -1, wy - 30 + k * (wh + 40) / 8]); shape(pts, { lw: 1.6, id: 9670 + i * 2 + d, h: [Math.PI / 2, 5, 0.6] }); }
  });
  // the latch and the notice on the middle window
  const lx = HALL.wins[1], ly = HALL.wy + HALL.wh * 0.5, la = o.latch || 0;
  X.save(); X.translate(lx, ly); X.rotate(-la * 2.4); shape(R(-3, -3, 22, 6), { lw: 1.2, id: 9690, fill: PLATE }); X.restore(); ball(lx, ly, 4, 9691, PAT.f, 1, PLATE);
  if (op < 0.5) { shape(R(lx + 26, HALL.wy + 30, 46, 34), { lw: 1, id: 9692, fill: PAPER2 }); X.font = MONO(3.2, 600); X.fillStyle = P.ink; X.textAlign = 'center'; X.textBaseline = 'middle'; ['AUTOMATIC', 'FUNCTIONS', 'SUSPENDED', 'PENDING REVIEW', '- the Ministry'].forEach((t, i) => X.fillText(t, lx + 49, HALL.wy + 37 + i * 5)); }
  // thermometer
  const tx = 500; shape(R(tx - 6, 200, 12, 140), { lw: 1.2, id: 9693, fill: P.paper }); X.fillStyle = P.ink; X.fillRect(tx - 2, 212 + (o.cool || 0) * 40, 4, 120 - (o.cool || 0) * 40); ball(tx, 344, 9, 9694, PAT.d, 1.2);
  for (let i = 0; i < 6; i++) line([tx + 6, 214 + i * 20], [tx + 12, 214 + i * 20], 0.8, 9695 + i, 0.1);
  // the lectern and the door
  shape([[HALL.lect - 40, FLOOR], [HALL.lect + 40, FLOOR], [HALL.lect + 30, FLOOR - 150], [HALL.lect - 30, FLOOR - 150]], { lw: 1.8, id: 9700, h: [Math.PI / 2, 3, 0.5] });
  shape([[HALL.lect - 52, FLOOR - 150], [HALL.lect + 52, FLOOR - 150], [HALL.lect + 60, FLOOR - 170], [HALL.lect - 44, FLOOR - 176]], { lw: 1.6, id: 9701, fill: PAPER2 });
  shape(R(HALL.door - 50, FLOOR - 240, 100, 240), { lw: 2, id: 9710, fill: P.ink }); const dop = o.door || 0; shape(R(HALL.door - 50, FLOOR - 240, 100 * (1 - dop * 0.8), 240), { lw: 1.6, id: 9711, h: [Math.PI / 2, 3, 0.6] });
}
const FAC = [{ x: 260, s: 0.95, sp: 1 }, { x: 360, s: 1.0, bd: 1 }, { x: 456, s: 0.92 }, { x: 830, s: 0.97, sp: 1 }, { x: 930, s: 1.02, bd: 1 }, { x: 1030, s: 0.94 }];
SHOTS.window = (lt, sd, sh) => {
  const L = sh.lines, en = cue(sh, 'enter'), wk = cue(sh, 'walk'), la = cue(sh, 'latch'), op = cue(sh, 'open'), stp = cue(sh, 'stamp');
  const opu = E.io(U(lt, op.at, op.to)), opened = lt > op.at;
  const stampShot = lt > stp.at - 0.7 && lt < stp.at + 1.8;
  let c = camFor(lt, [[0, ON(640, 380, 1.0)], [L[1].t0, ON(HALL.wins[1] + 30, 300, 2.1), 1.4], [L[2].t0 + 0.6, ON(640, 400, 1.15), 1.4], [L[3].t0, ON(860, 420, 1.2), 1.4], [L[4].t0, ON(500, 420, 1.1), 1.2],
    [wk.at, ON(HALL.wins[1], 400, 1.5), 1.2], [la.at - 0.5, ON(HALL.wins[1] + 4, 330, 3.0), 0.8], [op.at + 0.2, ON(HALL.wins[1], 330, 1.8), 1.2], [L[6].t0, ON(400, 420, 1.2), 1.0], [L[7].t0, ON(640, 380, 1.0), 1.6]]);
  c = withTight(sh, lt, c, HALL.wins[1] - 10, 320, 2.3);
  if (stampShot) c = ON(HALL.lect, FLOOR - 166, 4.2);
  cam(c, () => {
    hallRoom(lt, { open: opu, latch: U(lt, la.at - 0.3, la.at + 0.2) * (1 - 0), door: lt > en.at && lt < en.at + 3 ? seg(lt, en.at, en.at + 0.6) * (1 - seg(lt, en.at + 2.2, en.at + 3)) : 0, cool: opu });
    // minutes book and the red stamp
    shape([[HALL.lect - 40, FLOOR - 160], [HALL.lect + 44, FLOOR - 160], [HALL.lect + 48, FLOOR - 172], [HALL.lect - 38, FLOOR - 174]], { lw: 1, id: 9720, fill: P.paper });
    for (let i = 0; i < 4; i++) line([HALL.lect - 34, FLOOR - 170 + i * 2.6], [HALL.lect + 40, FLOOR - 169 + i * 2.6], 0.4, 9721 + i, 0.05);
    if (lt > stp.at) { const a = 1 - 0.3 * seg(lt, stp.at, stp.at + 0.1); X.save(); X.translate(HALL.lect + 4, FLOOR - 166); X.rotate(-0.06); X.globalAlpha = a; X.strokeStyle = P.red; X.lineWidth = 0.8; X.strokeRect(-26, -4.2, 52, 8.4); X.font = MONO(4.6, 600); X.fillStyle = P.red; X.textAlign = 'center'; X.textBaseline = 'middle'; X.fillText('INADMISSIBLE', 0, 0.3); X.restore(); }
    // the faculty, fanning themselves
    const dt = sayAt(sh, 'D', lt);
    FAC.forEach((f, i) => {
      const fanning = !opened || lt < op.to + 2, near = opened ? seg(lt, op.to + 1.5, op.to + 4) : 0;
      const x = lerp(f.x, HALL.wins[1] + (i - 2.5) * 60, near * 0.0);
      const fan = fanning ? Math.sin(lt * 7 + i * 1.7) : 0;
      person({ kind: 'fac', x, y: FLOOR - 4, s: f.s * 0.92, f: i < 3 ? 1 : -1, id: 6200 + i * 120, ra: [-0.2 + fan * 0.35, -1.0 + fan * 0.5], hold: fanning ? 'paper' : null, holdA: fan * 0.5, spect: f.sp, beard: f.bd, look: opened ? 0.5 : 0, closed: opened && lt > op.to + 1.2 && i % 2 === 0 });
    });
    person({ kind: 'dean', x: HALL.lect - 74, y: FLOOR - 2, s: 1.0, f: 1, id: 6000, mouth: dt, ra: dt > 0 ? [0.2, -0.4] : [Math.PI / 2 - 0.4, 0.3], la: [0.9, 0.2], spect: 1, beard: 1, brow: dt > 0 ? 0.6 : 0 });
    if (lt > stp.at - 0.6 && lt < stp.at + 0.6) { const su = pulse(lt, stp.at - 0.5, 1.0); X.save(); X.translate(HALL.lect + 4, FLOOR - 172 - 30 * (1 - su)); shape(R(-10, -18, 20, 12), { lw: 1.2, id: 9730, h: [0, 2, 0.5] }); shape(R(-4, -30, 8, 12), { lw: 1.2, id: 9731, fill: P.ink }); X.restore(); }
    // the builder
    if (lt > en.at) {
      const u1 = U(lt, en.at + 0.3, en.to), u2 = U(lt, wk.at, wk.to);
      const x = lt < wk.at ? lerp(HALL.door, 1060, E.out(u1)) : lerp(1060, HALL.wins[1] + 70, E.io(u2));
      const walking = (u1 > 0 && u1 < 1) || (u2 > 0 && u2 < 1);
      const reach = lt > la.at - 0.6, lu = seg(lt, la.at - 0.6, la.at), pu = seg(lt, op.at, op.to);
      let ra = null, hold = 'bag', lhold = null;
      if (lt > wk.to) { hold = null; }
      if (reach) ra = [lerp(Math.PI / 2, -0.55, lu) - pu * 0.25, lerp(Math.PI / 2, -0.9, lu) - pu * 0.6];
      person({ kind: 'builder', x, y: FLOOR, f: -1, walk: walking ? 1 : 0, ph: lt * 6.5, id: 6800, ra, hold, holdA: 0, look: reach ? 0.6 : 0 });
      if (lt > wk.to) prop('bag', HALL.wins[1] + 120, FLOOR - 26, 0, 9740);
    }
    // papers lifting in the new air
    if (opened) for (let i = 0; i < 9; i++) { const u = U(lt, op.to - 0.2 + i * 0.12, op.to + 2.6 + i * 0.2); if (u <= 0 || u >= 1) continue; const x = 300 + i * 80 + Math.sin(u * 6 + i) * 40, y = FLOOR - 150 - u * 220 + u * u * 160; X.save(); X.translate(x, y); X.rotate(u * 4 + i); shape(R(-10, -7, 20, 14), { lw: 1, id: 9750 + i, fill: PAPER2 }); X.restore(); }
  });
};

/* ---------- the builders ---------- */
const ROW = [610, 700, 790, 880, 970, 1060];
SHOTS.factory = (lt, sd, sh) => {
  const L = sh.lines, ty = cue(sh, 'type'), fa = cue(sh, 'fall'), bu = cue(sh, 'build'), dr = cue(sh, 'drawer');
  const ph = sigPh(sh, lt);
  if (lt < L[1].t0 - 0.3) {
    // spring: out of the first annex, carrying the kettle
    const u = U(lt, L[0].t0 + 0.4, L[0].t1 - 0.4);
    const c = camFor(lt, [[0, ON(640, 420, 1.1)], [L[0].t0 + 3, ON(560, 460, 1.4), 3]]);
    cam(c, () => {
      sky(-300, 330, 0.1); city(330, -200, 1600, 0.4, 3650, { letters: true }); ground(580, -900, 2200, { h: [[0.02, 9, 0.4], [1.2, 30, 0.3]] });
      let x = 700, w = 300, h = 190; for (let i = 0; i < 7; i++) { annexBlock(x + w / 2, 580, w, h, 4800 + i * 60, FN[i]); x += w; w *= 0.7; h *= 0.7; }
      line([300, 580], [292, 400], 5, 9760, 0.3); for (let i = 0; i < 9; i++) { const bx = 292 + (hash(i, 1) - 0.5) * 120, by = 400 + (hash(i, 2) - 0.5) * 80; ball(bx, by, 22, 9761 + i, PAT.f, 1); for (let k = 0; k < 4; k++) { X.beginPath(); X.arc(bx + Math.cos(k * 1.6 + i) * 12, by + Math.sin(k * 1.6 + i) * 12, 3, 0, 6.283); X.fillStyle = P.paper; X.fill(); X.lineWidth = 0.8; X.strokeStyle = P.ink; X.stroke(); } }
      person({ kind: 'klause', x: lerp(850, 470, E.io(u)), y: 584, s: 0.42, f: -1, walk: u > 0 && u < 1 ? 1 : 0, ph: lt * 5.5, id: 5000, beard: 0.6, hold: 'kettle', ra: [Math.PI / 2 - 0.1, Math.PI / 2], closed: u < 0.15, alpha: seg(lt, L[0].t0 + 0.2, L[0].t0 + 0.8) });
    });
    return;
  }
  if (lt < L[2].t0 - 0.2) {
    const c = camFor(lt, [[L[1].t0 - 0.3, ON(HALL.wins[1] + 40, 380, 1.5)]]);
    cam(c, () => { hallRoom(lt, { open: 1, latch: 1, cool: 1 }); prop('bag', HALL.wins[1] + 120, FLOOR - 26, 0, 9740); person({ kind: 'klause', x: HALL.wins[1] + 140, y: FLOOR, f: -1, id: 5000, beard: 0.6, look: 0.4, stoop: 0.1, hold: 'kettle' }); });
    return;
  }
  const typing = lt >= ty.at - 0.3 && lt < fa.at, done = lt >= bu.to;
  let c = camFor(lt, [[L[2].t0 - 0.2, ON(540, 410, 1.25)], [ty.at - 0.4, ON(OFF.ex + 30, 400, 1.7), 0.8], [fa.at - 0.3, ON(600, 400, 1.05), 1.0], [dr.at, ON(640, 410, 1.0), 1.0],
    [L[4].t0 - 0.4, ON(ROW[0] + 30, 440, 1.8), 0.6], [L[5].t0 - 0.3, ON(ROW[1] + 30, 440, 1.8), 0.5], [L[6].t0 - 0.3, ON(ROW[2] + 30, 440, 1.8), 0.5], [L[7].t0 - 0.3, ON(ROW[3] + 30, 440, 1.8), 0.5], [L[8].t0 - 0.3, ON(ROW[4] + 30, 440, 1.8), 0.5], [L[9].t0 - 0.3, ON(ROW[5] + 30, 440, 1.8), 0.5],
    [L[10].t0 - 0.4, ON(OFF.ex + 40, 390, 1.8), 0.8], [L[11].t0, ON(700, 410, 1.0), 1.2]]);
  c = withTight(sh, lt, c, OFF.ex, 400, 3.0);
  cam(c, () => {
    officeRoom(lt, {});
    const dop = seg(lt, dr.at, dr.at + 0.6);
    edifier(OFF.ex, FLOOR, 1.0, 8000, { speak: sayAt(sh, 'E', lt), keys: typing && ph.ty < 1 ? 1 : 0, paper: typing ? 30 * ph.ty + 20 : 0, ptext: T.sent.builder, pn: Math.floor(T.sent.builder.length * ph.ty), drawer: dop * (1 - seg(lt, dr.to, dr.to + 0.6)) });
    const kt = sayAt(sh, 'K', lt);
    person({ kind: 'klause', x: 470, y: FLOOR, f: -1, id: 5000, beard: 0.6, mouth: kt, ra: typing ? [0.2 + Math.sin(lt * 21) * 0.08, 0.9] : null, la: typing ? [0.35, 0.95] : null, down: typing, look: lt > L[4].t0 ? -0.2 : 0, brow: lt > L[4].t0 ? 0.6 : 0, alpha: 1 });
    // the first builder, from the sentence
    const G = { x: ROW[0], gy: FLOOR, w: 70, h: 290, ty: 230, tfs: 17, fs: 5 };
    if (lt >= ty.at && lt < bu.at + (bu.to - bu.at) * 0.75) {
      if (ph.fa <= 0) { const { x0 } = sigWords(T.sent.builder, { ...G, x: 700 }); const k = Math.floor(T.sent.builder.length * ph.ty); text(T.sent.builder.slice(0, k), x0, G.ty, MONO(G.tfs, 600)); }
      else {
        const { words, cw } = sigWords(T.sent.builder, { ...G, x: 700 }); const nw = words.length;
        const B1 = clamp(ph.bu / 0.5), B2 = clamp((ph.bu - 0.4) / 0.4);
        if (B2 > 0) { letterFill(() => personPath(G.x, FLOOR), [G.x - 60, FLOOR - 300, G.x + 60, FLOOR], T.sent.builder, G.fs, { upTo: FLOOR - 300 * E.io(B2) }); }
        if (B2 < 1) words.forEach((w, i) => {
          const d = i / nw * 0.45, v = clamp((ph.fa - d) / 0.55), lx = 520 + (i + 0.5) / nw * 380 - w.wd / 2, x = lerp(w.x, lx, E.out(v)), y = lerp(G.ty, FLOOR - 3, v * v), u = clamp((B1 - i / nw * 0.5) / 0.5);
          X.save(); X.globalAlpha = 1 - u; X.translate(lerp(x, G.x - w.wd / 2, E.io(u)), lerp(y, FLOOR - 150, E.io(u)) - Math.sin(Math.PI * u) * 40); X.rotate((hash(4700, i) - 0.5) * 0.5 * v * (1 - u)); text(w.w, 0, 0, MONO(G.tfs, 600)); X.restore();
        });
      }
    }
    // the builders: the first stands where the letters stood; five more climb out of the drawer
    const B = []; const fu = seg(lt, bu.at + (bu.to - bu.at) * 0.7, bu.to);
    if (fu > 0) B.push({ x: ROW[0], a: fu, walk: 0 });
    for (let i = 1; i < 6; i++) { const t0 = dr.at + 0.5 + (i - 1) * (dr.to - dr.at - 0.5) / 5, u = U(lt, t0, t0 + 1.4); if (u <= 0) continue; B.push({ x: lerp(OFF.ex + 40, ROW[i], E.io(u)), a: 1, walk: u < 1 ? 1 : 0, y: FLOOR - 30 * (1 - seg(u, 0, 0.3)) * 1 }); }
    B.forEach((b, i) => {
      const li = 4 + i, ask = lt > sh.lines[li].t0 - 0.3 && lt < sh.lines[li].t1 + 0.4, after = lt > sh.lines[li].t1;
      const mo = sayIdx(sh, li, lt), fin = lt > L[10].t0;
      person({ kind: 'made', x: b.x, y: b.y || FLOOR, f: -1, id: 6400 + i * 120, alpha: b.a, walk: b.walk, ph: lt * 7 + i, no: i + 1, mouth: mo, ra: ask ? [-1.2, -1.5] : null, look: i === 5 && fin ? 1.4 : 0, brow: ask ? 0.5 : 0 });
    });
  });
};
function personPath(x, gy) { X.beginPath(); X.arc(x, gy - 262, 21, 0, 6.283); X.moveTo(x - 24, gy - 240); X.lineTo(x + 24, gy - 240); X.lineTo(x + 34, gy - 130); X.lineTo(x + 20, gy); X.lineTo(x + 4, gy); X.lineTo(x, gy - 110); X.lineTo(x - 4, gy); X.lineTo(x - 20, gy); X.lineTo(x - 34, gy - 130); X.closePath(); }

/* ---------- the strike ---------- */
function rainLines(lt, x0, x1, y0, y1, n = 260, a = 0.55) { if (SILENT) return; X.save(); X.globalAlpha = a; X.strokeStyle = P.ink; X.lineWidth = 0.9; X.beginPath(); for (let i = 0; i < n; i++) { const x = x0 + hash(i, 1) * (x1 - x0), sp = 700 + hash(i, 2) * 300, y = y0 + ((hash(i, 3) * (y1 - y0) + lt * sp) % (y1 - y0)); X.moveTo(x - (y - y0) * 0.0, y); X.lineTo(x - 6, y + 22); } X.stroke(); X.restore(); }
const DAYS = ['THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY'];
SHOTS.strike = (lt, sd, sh) => {
  const L = sh.lines, cy = cue(sh, 'city').at, sc = cue(sh, 'scroll').at;
  if (lt < cy) {
    let c = camFor(lt, [[0, ON(640, 330, 0.95)], [L[1].t0, ON(640, 470, 1.15), 2], [L[2].t0, ON(640, 520, 1.8), 1.2], [L[4].t0, ON(640, 300, 2.0), 1.6], [L[4].t0 + 3.6, ON(640, 450, 1.1), 1.6]]);
    c = withTight(sh, lt, c, 640, 476, 2.9);
    cam(c, () => {
      sky(-300, 520, 0.4, 3); city(520, -500, 1800, 0.85, 3200, { letters: true, wet: true }); ministry(640, 640, 1.0, 6000); ground(640, -900, 2200, { h: [0.03, 4, 0.55] });
      for (let i = 0; i < 6; i++) { X.beginPath(); X.ellipse(200 + i * 190, 676, 60, 6, 0, 0, 6.283); X.fillStyle = P.paper; X.fill(); X.lineWidth = 0.8; X.strokeStyle = P.ink; X.stroke(); const r = (lt * 1.3 + i * 0.37) % 1; X.beginPath(); X.ellipse(200 + i * 190 + 10, 676, 50 * r, 5 * r, 0, 0, 6.283); X.globalAlpha = 1 - r; X.stroke(); X.globalAlpha = 1; }
      ROW.forEach((x0, i) => { const x = 380 + i * 104; const tools = lt < L[1].t0 + 2.5; person({ kind: 'made', x, y: 672, s: 0.56, f: i < 3 ? 1 : -1, id: 6400 + i * 120, no: i + 1, ra: i === 1 || i === 4 ? [-1.25, -1.4] : [Math.PI / 2, Math.PI / 2 - 0.2], hold: tools && i % 2 === 0 ? 'trowel' : null, holdA: 1.4, mouth: sayAt(sh, 'C', lt) * (0.6 + 0.4 * hash(i, 9)), down: true }); if (!tools && i % 2 === 0) { X.save(); X.translate(x + 18, 671); X.scale(0.6, 0.6); prop('trowel', 0, 0, 0.1, 9790 + i); X.restore(); } });
      // the placard, held up between two of them
      const px = 640, py = 452; line([482, py + 46], [482, 515], 3, 9780, 0.1); line([798, py + 46], [798, 515], 3, 9781, 0.1);
      shape(R(px - 180, py - 16, 360, 62), { lw: 2, id: 9782, fill: P.paper, amp: 0.8 }); X.save(); path(R(px - 180, py - 16, 360, 62)); X.clip(); X.globalAlpha = 0.25; for (let i = 0; i < 20; i++) X.fillRect(px - 180 + hash(i, 5) * 360, py - 16, 1, 20 + hash(i, 6) * 40); X.restore();
      spaced('A HOUSE IS NOT AN OUTPUT.', px, py + 3, 18, 1.2); spaced('IT IS SOMETHING YOU KEEP.', px, py + 29, 18, 1.2);
      rainLines(lt, -300, 1600, -200, 720, 110, 0.5);
    });
    return;
  }
  if (lt < sc) {
    // the city in the rain; one plate up close
    const c = camFor(lt, [[cy, ON(640, 380, 1.0)], [cy + 0.4, ON(760, 420, 1.15), 4], [L[5].t1 - 3.4, ON(LIB.x + 20, LIB.gy - 120, 5.2), 1.6]]);
    cam(c, () => {
      sky(-300, 520, 0.42, 3); for (let r = 0; r < 3; r++) city(380 + r * 60, -900, 2200, 0.5 + r * 0.25, 3500 + r * 100, { letters: true, wet: true });
      house(LIB.x, LIB.gy, 240, 180, 3960, { type: 0, s: SENTS[4], fs: 6.6, plate: false, wet: true }); ground(LIB.gy, -900, 2200, { h: [0.03, 4, 0.55] });
      const plx = LIB.x + 26, ply = LIB.gy - 140; plate(plx, ply, 40, 16, SENTS[4], 3961, { fs: 3.4 });
      X.save(); X.globalAlpha = 0.8; for (let i = 0; i < 6; i++) { const p = (lt * 0.7 + hash(i, 3)) % 1; ball(plx + 4 + i * 6.4, ply - 4 + p * 26, 0.9 + hash(i, 4) * 0.6, 3970 + i, PAT.d, 0.3); X.fillStyle = P.ink; X.fillRect(plx + 4 + i * 6.4 - 0.3, ply - 4, 0.6, p * 22); } X.restore();
      // gutters overflowing
      for (let i = 0; i < 70; i++) { const x = -200 + hash(i, 7) * 1700, y0 = 380 + Math.floor(hash(i, 8) * 3) * 60 - 100 * hash(i, 9), p = (lt * 1.6 + hash(i, 10)) % 1; X.fillStyle = P.ink; X.fillRect(x, y0 + p * 100, 1.2, 6); }
      rainLines(lt, -300, 1600, -200, 720, 110, 0.45);
    });
    return;
  }
  // the Edifier describing a house that will need no keeping, all week
  const u = U(lt, sc + 0.4, sd - 0.4), day = Math.min(6, Math.floor(u * 7));
  const c = camFor(lt, [[sc, ON(420, 400, 1.2)], [sc + 1, ON(470, 420, 1.0), Math.max(2, sd - sc - 2)]]);
  cam(c, () => {
    officeRoom(lt, {}); X.save(); X.globalAlpha = 0.4; path(R(OFF.win[0], OFF.win[1], OFF.win[2], OFF.win[3])); X.clip(); rainLines(lt, OFF.win[0], OFF.win[0] + OFF.win[2], OFF.win[1], OFF.win[1] + OFF.win[3], 80, 1); X.restore();
    // the calendar
    shape(R(600, 200, 110, 120), { lw: 1.6, id: 9800, fill: PAPER2 }); shape(R(600, 200, 110, 22), { lw: 1.2, id: 9801, fill: P.ink });
    X.font = MONO(11, 600); X.fillStyle = P.ink; X.textAlign = 'center'; X.textBaseline = 'middle'; X.fillText(DAYS[day], 655, 262); X.font = FELL(36); X.fillText(String(14 + day), 655, 296);
    edifier(OFF.ex, FLOOR, 1.0, 8000, { speak: 0.5 + 0.5 * Math.sin(lt * 9), keys: 1, paper: 0, shiver: 1 });
    // the paper pours out of the slot and heaps on the floor
    const len = 60 + u * 1400; const pts = [[OFF.ex, FLOOR - 282]]; let x = OFF.ex, y = FLOOR - 282, a = -1.4, L2 = 0;
    while (L2 < len) { const st = 12; a += 0.18 * Math.sin(L2 * 0.011 + 1) + (y > FLOOR - 40 ? 0.35 : 0.04); x += Math.cos(a) * st; y += Math.sin(a) * st; if (y > FLOOR - 4) { y = FLOOR - 4 - hash(L2 | 0, 2) * (8 + u * 60); } if (x < OFF.ex - 140) x = OFF.ex - 140 + hash(L2 | 0, 3) * 20; if (x > 760) x = 740; pts.push([x, y]); L2 += st; }
    X.save(); X.lineJoin = 'round'; X.beginPath(); pts.forEach(([a_, b], i) => (i ? X.lineTo(a_, b) : X.moveTo(a_, b))); X.lineWidth = 14; X.strokeStyle = P.ink; X.stroke(); X.lineWidth = 12; X.strokeStyle = PAPER2; X.stroke(); X.setLineDash([2, 3]); X.lineWidth = 6; X.strokeStyle = 'rgba(28,24,20,.35)'; X.stroke(); X.setLineDash([]); X.restore();
  });
};

/* ---------- the wall ---------- */
const WL = { x0: 470, gy: 600, bw: 36, bh: 11.4, per: 9, courses: 7 };
function brickXY(n) { const c = Math.floor(n / WL.per), i = n % WL.per, lean = c * 1.3, off = c % 2 ? WL.bw / 2 : 0, j = 1 - c / 7; return { x: WL.x0 + i * WL.bw + off + lean + (hash(n, 1) - 0.5) * 3 * j, y: WL.gy - (c + 1) * WL.bh, a: (hash(n, 2) - 0.5) * 0.05 * j, c, i }; }
function wallState(sh, lt) { const st = {}; for (const c of sh.cues) { if (c.at > lt) break; if (c.k === 'brick') st[c.n] = c.at; else if (c.k === 'unbrick') delete st[c.n]; } return st; }
function wallDraw(st, lt) {
  for (const n of Object.keys(st).map(Number).sort((a, b) => a - b)) {
    const b = brickXY(n), u = clamp((lt - st[n]) / 0.25), w = b.c % 2 && b.i === WL.per - 1 ? WL.bw / 2 : WL.bw;
    X.save(); X.translate(b.x, b.y - (1 - E.out(u)) * 26); X.rotate(b.a); shape(R(0, 0, w - 2, WL.bh - 1.6), { lw: 1.3, id: 7700 + n, h: [[0.5, 2.6, 0.5], [Math.PI / 2, 9, 0.3]] }); X.restore();
  }
  // half bricks at the left of the odd courses
  for (let c = 1; c < WL.courses; c += 2) { if (!st[c * WL.per]) continue; shape(R(WL.x0 + c * 1.3, WL.gy - (c + 1) * WL.bh, WL.bw / 2 - 2, WL.bh - 1.6), { lw: 1.3, id: 7690 + c, h: [0.5, 2.6, 0.5] }); }
}
function sunAt(u) { return [lerp(300, 1060, u), 220 + Math.pow(u, 1.6) * 250]; }
function garden(lt, sh, dusk, o = {}) {
  sky(-300, 640, 0.1 + dusk * 0.45, 5 - dusk * 2);
  const [sx, sy] = sunAt(o.sunU ?? 0); if (sy < 120) {} X.beginPath(); X.arc(sx, sy, 34, 0, 6.283); X.fillStyle = P.paper; X.fill(); X.lineWidth = 1.4; X.strokeStyle = P.ink; X.stroke();
  city(470, -900, 2200, 0.48, 3610, { letters: true, lit: dusk > 0.5 }); ground(470, -900, 2200, { h: [0.02, 5, 0.3 + dusk * 0.2] });
  shape(R(-900, WL.gy - 60, 3100, 700), { lw: 0, h: [0.02, 6, 0.25 + dusk * 0.2] }); line([-900, WL.gy - 60], [2200, WL.gy - 60], 1, 9850, 0.4);
  // the heap of letters, swept aside, and the library's plate
  X.font = MONO(8, 600); X.fillStyle = P.ink; X.textAlign = 'center'; X.textBaseline = 'middle'; const S = T.sent.library;
  for (let i = 0; i < 220; i++) { const hx = hash(i, 11) - 0.5, hy = hash(i, 12); X.save(); X.translate(190 + hx * 200 * (1 - hy * 0.7), WL.gy - 4 - Math.pow(hy, 1.4) * 40 * (1 - Math.abs(hx) * 1.5)); X.rotate((hash(i, 13) - 0.5) * 3); X.fillText(S[i % S.length], 0, 0); X.restore(); }
  line([340, WL.gy - 40], [340, WL.gy + 10], 3, 9851, 0.2); plate(322, WL.gy - 62, 36, 22, S, 9852, { fs: 2.9 });
  // weeds
  for (let i = 0; i < 30; i++) { const x = -200 + hash(i, 20) * 1600, y = WL.gy + 10 + hash(i, 21) * 90; if (x > 440 && x < 820 && y < WL.gy + 30) continue; ink([[x, y], [x + 3, y - 8 - hash(i, 22) * 8]], 1, 9860 + i, 0.3); ink([[x, y], [x - 4, y - 6]], 1, 9890 + i, 0.3); }
  ground(WL.gy + 8, -900, 2200, { h: [0.02, 7, 0.0001] });
}
SHOTS.wall = (lt, sd, sh) => {
  const L = sh.lines, le = cue(sh, 'lend'), done = cue(sh, 'done').at, pu = cue(sh, 'push'), pl = cue(sh, 'plate'), stu = cue(sh, 'student'), si = cue(sh, 'sit');
  const bricksC = sh.cues.filter((c) => c.k === 'brick' || c.k === 'unbrick'), wStart = bricksC[0].at;
  const sunU = U(lt, wStart - 4, L[3].t1 + 2), dusk = clamp((sunU - 0.55) / 0.45) * 0.8 + seg(lt, L[8].t1, sd) * 0.2;
  const st = wallState(sh, lt);
  // which brick is in hand: the next event after lt
  let next = null, prev = null; for (const c of bricksC) { if (c.at > lt) { next = c; break; } prev = c; }
  const working = lt > wStart - 1.0 && lt < done + 0.2;
  const nb = next ? brickXY(next.n) : brickXY(62), kx = working ? clamp(nb.x + 40, WL.x0 + 30, WL.x0 + 330) : 0;
  const plateUp = lt > pl.at && lt < L[5].t0 - 0.6, sat = si ? seg(lt, si.at, si.to) : 0;
  let c = camFor(lt, [[0, ON(560, 440, 1.0)], [le.at, ON(640, 450, 1.2), 1.4], [wStart - 0.8, ON(620, 470, 1.6), 1.4], [wStart + 6, ON(640, 480, 1.3), 3.0], [L[2].t0 + 4, ON(kx || 640, 500, 1.9), 2.0], [L[2].t1 + 2, ON(640, 450, 1.0), 3],
    [done - 4, ON(630, 480, 1.5), 3], [L[3].t0 + 2, ON(660, 470, 1.7), 1.4], [pl.at, ON(740, 410, 2.0), 1.0], [stu.at, ON(780, 440, 1.3), 1.4], [L[6].t0 - 0.3, ON(760, 430, 1.6), 1.2], [L[8].t0, ON(680, 450, 1.4), 1.6],
    [si.at, ON(640, 450, 1.0), 2.6]]);
  const q = fulcrum(sh); if (lt > q.t0 - 1.5) c = blendCam(c, ON(640, 430, 0.92), seg(lt, q.t0 - 1.5, sd, E.io));
  cam(c, () => {
    garden(lt, sh, dusk, { sunU });
    // the wall's shadow, longer as the sun goes
    const nC = Math.max(0, ...Object.keys(st).map((n) => Math.floor(n / WL.per) + 1)); if (nC > 0) { const [sx] = sunAt(sunU), len = (8 + sunU * 50) * (sx > 640 ? -1 : 1); X.save(); X.globalAlpha = 0.6; shape([[WL.x0, WL.gy], [WL.x0 + 9 * WL.bw, WL.gy], [WL.x0 + 9 * WL.bw + len * 1.4, WL.gy + nC * 3], [WL.x0 + len * 1.4, WL.gy + nC * 3]], { lw: 0, fill: null, h: [0.5, 2.2, 0.6] }); X.restore(); }
    // tools: line and pegs, level, bucket
    if (lt > le.at + 0.8) { line([WL.x0 - 14, WL.gy - 90], [WL.x0 - 14, WL.gy + 6], 2, 9900, 0.1); line([WL.x0 + 340, WL.gy - 90], [WL.x0 + 340, WL.gy + 6], 2, 9901, 0.1); const ly = WL.gy - (Math.min(WL.courses, nC + 1)) * WL.bh; line([WL.x0 - 14, ly], [WL.x0 + 340, ly], 0.6, 9902, 0.05);
      X.save(); X.translate(900, WL.gy + 22); shape([[-22, 0], [22, 0], [26, -40], [-26, -40]], { lw: 1.6, id: 9903, h: [Math.PI / 2, 3, 0.5] }); X.beginPath(); X.ellipse(0, -40, 26, 5, 0, 0, 6.283); X.fillStyle = PAT.d; X.fill(); X.restore();
      shape(R(840, WL.gy + 26, 70, 9), { lw: 1.2, id: 9904, fill: PLATE }); X.beginPath(); X.ellipse(875, WL.gy + 30.5, 6, 2.4, 0, 0, 6.283); X.lineWidth = 0.8; X.strokeStyle = P.ink; X.stroke();
      for (let k = 0; k < Math.max(0, 14 - Math.floor(Object.keys(st).length / 5)); k++) prop('brick', 980 + (k % 4) * 30, WL.gy + 30 - Math.floor(k / 4) * 11, 0, 9910 + k); }
    const kFront = lt >= si.at; if (kFront) wallDraw(st, lt);
    // Professor Klause
    const kt = sayAt(sh, 'K', lt);
    if (lt < wStart - 1.0) {
      const u = U(lt, 0.6, L[0].t1 - 0.4), x = lerp(-60, 680, E.out(u));
      person({ kind: 'klause', x, y: WL.gy + 30, f: lt > le.at + 1 ? 1 : 1, walk: u > 0 && u < 1 ? 1 : 0, ph: lt * 6, id: 5000, beard: 0, look: lt > le.at ? 0.3 : 0, ra: lt > le.at + 2.2 ? [0.3, 0.1] : null, hold: lt > le.at + 2.2 ? 'trowel' : null, holdA: -0.2 });
    } else if (working || lt < pl.at) {
      // kneeling behind the wall; the arm goes down to each brick
      const ta = next ? next.at : 1e9, tp = prev ? prev.at : -1e9;
      const reach = Math.max(pulse(lt, ta - 0.45, 0.6), pulse(lt, tp - 0.15, 0.4) * 0.6), unb = next && next.k === 'unbrick';
      const kk = working ? 1 : 1 - seg(lt, done + 0.3, done + 1.6), pushU = pulse(lt, pu.at - 0.4, 1.4);
      const kxx = working ? kx : WL.x0 + 330;
      person({ kind: 'klause', x: kxx, y: WL.gy - 18, f: -1, kneel: kk, id: 5000, stoop: 0.2 + reach * 0.3, down: true, ra: [lerp(1.0, 1.35, reach) - pushU * 0.9, lerp(1.2, 1.6, reach) - pushU * 1.4], la: [1.4, 1.8], hold: working ? (unb ? null : 'trowel') : null, holdA: 0.4 + reach * 0.4, lhold: working && reach > 0.2 && !unb ? 'brick' : null, look: working ? 0.6 : 0.1, brow: lt > L[2].t0 + 6 && working ? 0.4 : 0 });
    } else if (lt < si.at || sat < 1) {
      const pu2 = seg(lt, pl.at, pl.at + 0.6) * (1 - seg(lt, L[5].t0 - 0.8, L[5].t0 - 0.2));
      const gest = lt > L[6].t0 && lt < L[6].t1 + 0.4 ? Math.sin((lt - L[6].t0) * 3) : 0, low = lt > L[7].t0 - 0.4 && lt < L[8].t1;
      const sitU = sat, x = lerp(WL.x0 + 300, WL.x0 + 190, sitU);
      person({ kind: 'klause', x, y: lerp(WL.gy - 18, WL.gy - 6, sitU), f: -1, sit: sitU, seatH: 72, id: 5000, mouth: kt, ra: pu2 > 0 ? [lerp(Math.PI / 2, -0.2, pu2), lerp(Math.PI / 2, -0.4, pu2)] : gest ? [0.2 + gest * 0.2, -0.5 + gest * 0.4] : low ? [Math.PI / 2 - 0.4, 0.2] : null, la: low ? [Math.PI / 2 - 0.5, 0.0] : null, down: low, look: pu2 > 0 ? 0.3 : 0, hold: pu2 > 0.3 ? 'plate' : null, holdA: 0.1 });
    } else {
      person({ kind: 'klause', x: WL.x0 + 190, y: WL.gy - 6, f: -1, sit: 1, seatH: 72, id: 5000, look: 0.2, ra: [Math.PI / 2 - 0.2, Math.PI / 2 - 0.9], la: [Math.PI / 2 - 0.3, Math.PI / 2 - 1.0] });
    }
    if (!kFront) wallDraw(st, lt);
    // the builder from the window lends him the tools
    if (lt > le.at - 1.6 && lt < le.to + 2.5) {
      const u1 = U(lt, le.at - 1.6, le.at + 0.6), u2 = U(lt, le.to - 1.0, le.to + 2.5), x = u2 > 0 ? lerp(800, 1500, E.in(u2)) : lerp(1500, 800, E.out(u1));
      const hand = lt > le.at + 1.6 && lt < le.at + 2.6;
      person({ kind: 'builder', x, y: WL.gy + 32, f: u2 > 0 ? 1 : -1, walk: (u1 > 0 && u1 < 1) || (u2 > 0 && u2 < 1) ? 1 : 0, ph: lt * 6.5, id: 6800, hold: lt < le.at + 0.8 ? 'bag' : hand ? 'trowel' : null, ra: hand ? [0.1, -0.1] : null, holdA: 0 });
      if (lt > le.at + 0.8) prop('bag', 760, WL.gy + 30, 0, 9740);
    }
    // the student
    if (lt > stu.at) {
      const u = U(lt, stu.at, stu.to), st_ = sayAt(sh, 'S', lt);
      person({ kind: 'student', x: lerp(1450, 960, E.out(u)), y: WL.gy + 34, f: -1, walk: u < 1 ? 1 : 0, ph: lt * 6.5, id: 7400, mouth: st_, look: 0.2, lhold: 'note' });
    }
  });
};

SHOTS.end = (lt, sd) => {
  cam(ON(640, 430, 0.92), () => {
    const sh = T.shots.find((s) => s.shot === 'wall');
    garden(sh.d, sh, 1.0, { sunU: 1 }); wallDraw(wallState(sh, 1e9), 1e9);
    person({ kind: 'klause', x: WL.x0 + 190, y: WL.gy - 6, f: -1, sit: 1, seatH: 72, id: 5000, look: 0.2, ra: [Math.PI / 2 - 0.2, Math.PI / 2 - 0.9], la: [Math.PI / 2 - 0.3, Math.PI / 2 - 1.0] });
    person({ kind: 'student', x: 960, y: WL.gy + 34, f: -1, id: 7400, look: 0.2, lhold: 'note' });
  });
  X.globalAlpha = seg(lt, 0.6, 1.8);
  shape(R(390, 110, 500, 196), { lw: 1.6, id: 9990, fill: P.paper });
  ink([[398, 118], [882, 118], [882, 298], [398, 298], [398, 118]], 0.8, 9991, 0.3);
  txt('THE HOUSE THAT LANGUAGE BUILT', 640, 152, 24, {});
  txt('a fable of Edifiction', 640, 192, 18, { italic: true });
  txt('after notes by Watson Hartsoe', 640, 236, 16, { italic: true });
  txt('in the manner of Stanisław Lem', 640, 262, 16, { italic: true });
  X.globalAlpha = 1;
};

/* ================= frame loop ================= */
window.__render = async (f) => {
  const fq = f - (f % 2), t = fq / 24; GT = t; BOIL = Math.floor(f / 6); // drawn on twos, the ink boiling four times a second
  let i = 0; for (let j = 0; j < T.shots.length; j++) if (t >= T.shots[j].t0) i = j;
  const sh = T.shots[i], lt = t - sh.t0, sd = sh.d;
  X.setTransform(1, 0, 0, 1, 0, 0); X.fillStyle = P.paper; X.fillRect(0, 0, W, H);
  X.save(); path(R(PX0, PY0, PX1 - PX0, PY1 - PY0)); X.clip();
  X.lineCap = 'butt'; X.lineJoin = 'miter'; X.setLineDash([]); X.globalAlpha = 1;
  SHOTS[sh.shot](lt, sd, sh);
  X.restore(); X.setTransform(1, 0, 0, 1, 0, 0); X.globalAlpha = 1;
  const fade = sh.shot === 'title' ? Math.max(1 - seg(lt, 0, 0.6), seg(lt, sd - 0.7, sd)) : sh.shot === 'end' ? Math.max(0, seg(lt, sd - 1.4, sd)) : sh.shot === 'wall' ? Math.max(1 - seg(lt, 0, 0.6), 0) : Math.max(1 - seg(lt, 0, 0.5), seg(lt, sd - 0.4, sd));
  if (fade > 0) { X.fillStyle = P.paper; X.globalAlpha = fade; X.fillRect(0, 0, W, H); X.globalAlpha = 1; }
  border();
};
(async () => {
  T = await (await fetch('timing/an.json')).json();
  await document.fonts.ready; await Promise.all(['IM Fell English', 'IBM Plex Mono'].map((n) => document.fonts.load(`20px "${n}"`))); await document.fonts.load(`italic 20px "IM Fell English"`); await document.fonts.load(`600 20px "IBM Plex Mono"`);
  X = document.getElementById('film').getContext('2d');
  window.__NF = Math.ceil(T.dur * 24); window.__T = T; window.__ready = true;
})();
