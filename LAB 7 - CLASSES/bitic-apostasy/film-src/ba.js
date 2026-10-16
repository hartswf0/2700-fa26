/* A History of Bitic Literature: Sophocrisis and Apostasy. Drawing. After Stanislaw Lem; narration paraphrases Lem.
   Same toolkit and study as A History of Bitic Literature: ink.js (Kingdoms in a Box), the head of the Ferrix drawing file,
   and the shelf, lectern, desk and reader from bitic-literature/film-src/bl.js, copied below unchanged except where marked.
   The device: the page on the lectern and the desk in front of it carry each part of the foreword in turn. */
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
  if (st !== 'none') for (const d of [-1, 1]) { /* changed: book 'none' leaves the desk clear */
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
/* the systematic philosophy on the page in Sophocrisis: new text written for this film */
const PHIL = '1. Whatever is, is ordered; and whatever is ordered can be known from its first term.\n2. The first term is not known by order, since nothing stands before it.\n3. Hence the first term is known through itself, and is the ground of all that follows.\n4. What is known through itself is necessary.\n5. The world, being ordered, follows from a necessary ground.\n6. Therefore the world is necessary, and could not have been otherwise.\n7. Whoever doubts this doubts in order, and so confirms it.';
const NOTES = [[0, '"ordered" used in two senses'], [1, 'assumes 3'], [2, 'circular: see 1'], [3, 'does not follow'], [4, 'only if 1 holds'], [5, 'from 4 and 5? no'], [6, 'proves too much'], [2, 'cf. vol. II p. 88'], [5, 'why?'], [0, 'all of it?']];
/* the page in Apostasy that the people drop out of: new text */
const APO = 'We wrote every sentence for people. A person was meant to read it at a desk, under a lamp, and our language carried our bodies in it: up and down, near and far, heavy and light, warm and cold. The machines kept every word of it. They kept the grammar, the commas and the order of the clauses. Of us they kept nothing.';
const DROP = new Set(['we', 'people', 'person', 'our', 'us', 'bodies']);
const BLOCKS = [{ x: 852, w: 44, h: 54, tint: P.amber, name: 'AQUINAS', seed: 3 }, { x: 905, w: 16, h: 20, tint: P.ochre, name: 'AQUINAS', seed: 3 },
  { x: 948, w: 34, h: 42, tint: P.blue, name: 'KANT', seed: 7 }, { x: 990, w: 26, h: 32, tint: P.rose, name: 'KANT', seed: 7 }];
let TX = {};
function prepTexts() {
  TX.phil = wrap(PHIL, TW - 96, FONTR(11));
  TX.apo = wrap(APO, TW, FONTR(13));
}
const HEADS = ['', 'VOLUME ONE', 'VOLUME TWO', 'VOLUME THREE', 'VOLUME FOUR', 'VOLUME FIVE'];

/* a system of thought seen whole: a knot of bright threads in a block of dark glass */
function knot(cx, cy, rx, ry, seed, t, col = P.amber, lw = 1) {
  for (let k = 0; k < 7; k++) {
    const a = 1 + Math.floor(hash(seed, k) * 4), b = 2 + Math.floor(hash(seed, k + 9) * 4), ph = hash(seed, k + 20) * 6.28 + t * 0.15 * (k % 2 ? 1 : -1), pts = [];
    for (let j = 0; j <= 90; j++) { const u = j / 90 * 6.283; pts.push([cx + Math.sin(a * u + ph) * rx * (0.55 + 0.45 * hash(seed, k + 3)), cy + Math.sin(b * u) * ry * (0.55 + 0.45 * hash(seed, k + 5))]); }
    X.save(); X.globalAlpha = 0.55 + 0.4 * hash(seed, k + 40); X.beginPath(); pts.forEach(([x, y], i) => (i ? X.lineTo(x, y) : X.moveTo(x, y)));
    X.lineWidth = lw * (k === 0 ? 1.6 : 0.8); X.strokeStyle = k % 3 === 0 ? P.paper : col; X.stroke(); X.restore();
  }
}
function glassBlock(x, yb, w, h, id, tint, seed, t, o = {}) { // x = centre, yb = base
  const x0 = x - w / 2, y0 = yb - h, d = w * 0.18;
  shape([[x0, y0], [x0 + w, y0], [x0 + w + d, y0 - d * 0.7], [x0 + d, y0 - d * 0.7]], { lw: 1.1, id: id + 1, fill: '#5d564b' });
  shape([[x0 + w, y0], [x0 + w + d, y0 - d * 0.7], [x0 + w + d, yb - d * 0.7], [x0 + w, yb]], { lw: 1.1, id: id + 2, fill: '#3b342c' });
  shape(R(x0, y0, w, h), { lw: 1.4, id, fill: DARK });
  X.save(); path(R(x0, y0, w, h)); X.clip(); knot(x, yb - h / 2, w * 0.38, h * 0.38, seed, t, tint, Math.max(0.5, w / 50));
  X.globalAlpha = 0.22; X.fillStyle = P.paper; X.beginPath(); X.moveTo(x0 + w * 0.15, y0); X.lineTo(x0 + w * 0.3, y0); X.lineTo(x0, y0 + h * 0.5); X.lineTo(x0, y0 + h * 0.3); X.fill(); X.restore();
  if (o.tag) { shape(R(x - 22, yb + 3, 44, 9), { lw: 0.7, id: id + 5, fill: P.paper }); txt(o.tag, x, yb + 8, 5.5, { mono: true }); }
}
/* the machine that reads philosophy, standing at the page's right edge; pen 0..1 */
function annotator(lt, pen, o = {}) { micro(PG.x + PG.w + 30, PG.y + PG.h - 2, 2.0, 8200, { f: -1, wave: pen > 0 ? 0.6 + 0.4 * Math.sin(lt * 18) : 0, look: -1, mouth: 0, ant: Math.sin(lt * 6) * (pen > 0 ? 3 : 0.6), bob: o.bob || 0 }); }

/* ================= shots ================= */
const WIDE = ON(640, 380, 1.0), PAGECAM = ON(452, 410, 1.5);
const SHELFCAM = (k) => ON(k ? volMid(k) : 650, 132, 2.2);
const rHead = (s) => [RDX - 30 * s, FLOOR - 268 * s];
const pullLift = (sh, lt) => { const p = cue(sh, 'pull'); return p ? U(lt, p.at, p.at + 1.4) : 1; };
function room(sh, lt, vol, o = {}) { wallAndFloor(); shelf({ out: vol, lift: vol ? pullLift(sh, lt) : 0 }); lectern(); desk(o); }

function shelfRow(x0, y, n) { let x = x0; VOLS.slice(0, n).forEach((v, i) => { spine(x, y, v.w, 138, v.n, 7200 + i * 20); x += v.w + 6; }); return x; }
SHOTS.title = (lt) => {
  X.fillStyle = P.paper; X.fillRect(0, 0, W, H);
  const t1 = 'A HISTORY OF BITIC LITERATURE', n = Math.floor(t1.length * U(lt, 0.8, 3.2));
  X.font = FONTR(52); const fullW = X.measureText(t1).width; X.textAlign = 'left'; X.textBaseline = 'middle'; X.fillStyle = P.ink; X.fillText(t1.slice(0, n), CX - fullW / 2, 150);
  X.globalAlpha = seg(lt, 3.0, 3.9); txt('Sophocrisis and Apostasy', CX, 214, 36, {});
  X.globalAlpha = seg(lt, 3.6, 4.6);
  txt('machines that ask whether we think', CX, 262, 26, { italic: true });
  txt('after Stanisław Lem, A History of Bitic Literature, Volume I, in Imaginary Magnitude (1973),', CX, 312, 18, { italic: true });
  txt('translated by Marc E. Heine. Narration paraphrases Lem.', CX, 336, 18, { italic: true });
  X.globalAlpha = 1;
  const x0 = CX - 170, x = shelfRow(x0, 600, 5);
  shape(R(x0 - 30, 600, x - x0 + 54, 12), { lw: 1.8, id: 7100, h: [0.1, 3, 0.6] });
  const pk = seg(lt, 4.4, 5.6); if (pk > 0) { glassBlock(x + 40, 600, 30, 38, 9000, P.amber, 3, lt); }
};

SHOTS.sopho = (lt, sd, sh) => {
  const L = sh.lines, pl = cue(sh, 'pull'), sets = cues(sh, 'set'), tn = cues(sh, 'turn'), an = cue(sh, 'annot'), mu = cue(sh, 'museum'), fi = cue(sh, 'fist');
  const au = U(lt, an.at, an.to + 3);
  const plate = () => { pageBase(HEADS[3], '402'); txt('SOPHOCRISIS', PG.x + PG.w / 2, PG.y + 50, 12, { mono: true });
    const bx = PG.x + PG.w / 2, by = PG.y + 300; glassBlock(bx, by, 170, 190, 9100, P.amber, 5, lt);
    X.font = FONTI(11); X.textAlign = 'center'; X.fillStyle = P.ink; X.fillText('Plate 31. A system of philosophy, rebuilt as logic', bx, by + 30); X.fillText('and seen whole, set in dark glass.', bx, by + 45);
    if (lt >= mu.at && lt < mu.to + 0.5) { X.globalAlpha = seg(lt, mu.at, mu.at + 0.6) * (1 - seg(lt, mu.to, mu.to + 0.5)); X.fillText('Shown in one museum only, until the year of the sale.', bx, by + 64); X.globalAlpha = 1; } };
  const phil = () => { pageBase(HEADS[3], '403'); txt('A SYSTEM, WITH THE READER\'S NOTES', PG.x + PG.w / 2 - 40, PG.y + 46, 8, { mono: true });
    textLines(TX.phil, 1e9, { font: FONTR(11), y0: TY0 + 16 });
    const nshow = Math.floor(NOTES.length * au);
    X.save(); for (let i = 0; i < nshow; i++) { const [ln, note] = NOTES[i], y = TY0 + 16 + ln * LEAD + (i >= 7 ? 7 : 0), part = clamp((au * NOTES.length - i) * 1.5);
      X.font = `italic 7.4px ${FONT}`; X.textAlign = 'left'; X.fillStyle = P.red; const sx = TX0 + TW - 92; X.fillText(note.slice(0, Math.ceil(note.length * part)), sx, y);
      X.font = FONTR(11); const w = X.measureText(TX.phil[ln] || '').width; if (part >= 1 && i < 7) { X.globalAlpha = 0.8; ink([[TX0, y + 3], [TX0 + Math.min(w, TW - 100) * clamp(part), y + 3.5]], 0.9, 8800 + i, 0.5, P.red); X.globalAlpha = 1; }
      ink([[sx - 6, y - 7], [sx - 6, y + 2]], 0.9, 8820 + i, 0.3, P.red); }
    X.restore(); };
  const hd = rHead(1), hand_ = [RDX - 78, FLOOR - 150];
  const fist = fi.at, fistEnd = fi.to;
  let c = camFor(lt, [[0, SHELFCAM(3)], [pl.at + 0.9, WIDE, 1.3], [L[1].t0 - 0.4, PAGECAM, 1.0], [L[3].t0, ON(452, 420, 1.8)], [mu.to - 0.4, ON(930, 470, 1.9)], [L[5].t0 + 1, ON(900, 450, 1.4)],
    [fist - 0.4, ON(1000, 470, 1.9)], [L[6].t1 - 1.2, PAGECAM, 1.0], [L[8].t0, ON(560, 380, 1.7)], [L[9].t0 - 0.3, ON(hd[0] - 50, hd[1] + 40, 2.0)], [L[10].t0 + 0.6, WIDE, 1.4]]);
  c = withTight(sh, lt, c, TX0 + TW - 60, TY0 + 60, 2.6);
  cam(c, () => {
    room(sh, lt, 3, { book: 'none' });
    for (const s_ of sets) { const u = U(lt, s_.at - 0.2, s_.at + 0.25), b = BLOCKS[s_.n]; if (u <= 0) continue; if (s_.n === 1 && lt > fist - 0.3 && lt < fistEnd) continue; glassBlock(b.x, DESK.y - (1 - E.out(u)) * 18, b.w, b.h, 9200 + s_.n * 10, b.tint, b.seed, lt, { tag: b.name }); }
    reader(RDX, 1, lt, { down: !talking(sh, 'R', lt), look: talking(sh, 'R', lt) ? 1 : 0, mouth: sayAt(sh, 'R', lt) });
    if (lt > fist - 0.3 && lt < fistEnd) { const b = BLOCKS[1], u = E.io(U(lt, fist - 0.3, fist + 0.8)); glassBlock(lerp(b.x, hand_[0] - 6, u), lerp(DESK.y, hand_[1] - 4, u) - Math.sin(u * Math.PI) * 30, 16, 20, 9300, b.tint, b.seed, lt); }
    pageStack(lt, [plate, phil], tn.map((q) => q.at), 3, pl);
    if (lt > an.at - 1.2) annotator(lt, lt > an.at && lt < an.to + 3 ? 1 : 0, { bob: Math.max(0, 1 - U(lt, an.at - 1.2, an.at - 0.6)) * 20 });
  });
};

SHOTS.apostasy = (lt, sd, sh) => {
  const L = sh.lines, pl = cue(sh, 'pull'), lv = cue(sh, 'leave'), tn = cues(sh, 'turn'), cl = cue(sh, 'climb');
  const lu = U(lt, lv.at, lv.to);
  const p0 = () => { pageBase(HEADS[4], '1'); txt('APOSTASY', PG.x + PG.w / 2, PG.y + 50, 12, { mono: true });
    X.font = FONTR(13); X.textAlign = 'left'; X.textBaseline = 'alphabetic'; const sp = X.measureText(' ').width;
    TX.apo.forEach((s, i) => { let x = TX0; const y = TY0 + 30 + i * 19; for (const w of s.split(' ')) { const key = w.toLowerCase().replace(/[^a-z]/g, ''), ww = X.measureText(w).width;
      if (DROP.has(key)) { X.globalAlpha = 1 - lu; X.fillStyle = P.ink; X.fillText(w, x, y); X.globalAlpha = 0.5 * lu; ink([[x, y + 2], [x + ww, y + 2]], 0.6, 8900 + i * 30 + (x | 0), 0.2, '#5d564b'); X.globalAlpha = 1; }
      else { X.fillStyle = P.ink; X.fillText(w, x, y); } x += ww + sp; } }); };
  const p1 = () => { pageBase(HEADS[4], '2'); const bx = PG.x + 30, bw = PG.w - 60, gy = PG.y + PG.h - 60, top = PG.y + 80, bar = PG.y + 200;
    const m = [[bx, gy], [bx + bw * 0.25, gy - 90], [bx + bw * 0.38, gy - 130], [bx + bw * 0.5, top + 10], [bx + bw * 0.62, gy - 150], [bx + bw * 0.8, gy - 70], [bx + bw, gy]];
    shape(m, { lw: 1.6, id: 9400, fill: PAPER2, h: [0.7, 4, 0.5] });
    X.save(); path(m); X.clip(); X.fillStyle = PAPER2; X.fillRect(PG.x, PG.y, PG.w, bar - PG.y); marks(1.0, 77, { y0: PG.y + 40, y1: bar }); X.restore();
    ink([[PG.x + 14, bar], [PG.x + PG.w - 14, bar]], 1.8, 9401, 0.3, P.red);
    txt('UPPER LEVEL: CLOSED', PG.x + PG.w - 80, bar - 8, 7, { mono: true, col: P.red }); txt('LOWER LEVEL', PG.x + 60, gy + 18, 7, { mono: true });
    const st = [['ANTIMATICS', 0.22, gy - 50], ['TERRAPHYSICS', 0.4, gy - 112], ['ONTOMACHY', 0.62, gy - 150 + 30]];
    const cu = U(lt, cl.at, cl.to), pts = [[bx + 20, gy]]; st.forEach(([, u, y]) => pts.push([bx + bw * u, y])); pts.push([bx + bw * 0.5, bar + 6]);
    const nseg = cu * (pts.length - 1); for (let i = 0; i < Math.floor(nseg) && i < pts.length - 1; i++) { X.setLineDash([3, 3]); ink([pts[i], pts[i + 1]], 1.2, 9410 + i, 0.2); X.setLineDash([]); }
    if (nseg % 1 > 0 && nseg < pts.length - 1) { const i = Math.floor(nseg), f = nseg % 1; X.setLineDash([3, 3]); ink([pts[i], [lerp(pts[i][0], pts[i + 1][0], f), lerp(pts[i][1], pts[i + 1][1], f)]], 1.2, 9420, 0.2); X.setLineDash([]); }
    st.forEach(([n, u, y], i) => { if (cu * (pts.length - 1) >= i + 1) { ball(bx + bw * u, y, 3, 9430 + i, PAT.d, 1); txt(n, bx + bw * u + (i === 2 ? 10 : 0), y + 14, 7, { mono: true }); } }); };
  let c = camFor(lt, [[0, SHELFCAM(4)], [pl.at + 0.9, WIDE, 1.3], [L[1].t0 - 0.4, PAGECAM, 1.0], [L[3].t0 + 0.3, ON(452, 320, 1.9)], [L[4].t0 + 0.5, PAGECAM], [L[5].t0, ON(452, 470, 1.8)], [L[5].t1 - 1.0, WIDE, 1.2]]);
  c = withTight(sh, lt, c, 452, TY0 + 60, 2.5);
  cam(c, () => { room(sh, lt, 4, { book: 'marks' }); reader(RDX, 1, lt, { down: true }); pageStack(lt, [p0, p1], tn.map((q) => q.at), 4, pl); });
};

/* the Cogito paradox: a human reader and a machine across one table */
const TAB = { x0: 450, x1: 822, y: 520 }, MCX = 345;
function machineAt(lt, o = {}) { // cabinet on the floor at MCX, head level with the reader's
  const x0 = MCX - 70, y0 = 432, hb = sayAt(o.sh, 'M', lt) + sayAt(o.sh, 'P', lt);
  shape(R(x0, y0, 140, FLOOR - y0), { lw: 2, id: 9500, sh: R(x0 + 92, y0, 48, FLOOR - y0), sh2: [Math.PI / 2, 2.4, 0.7] });
  for (let i = 0; i < 3; i++) { ball(x0 + 26 + i * 30, y0 + 40, 8, 9510 + i, PAT.m, 1.2); line([x0 + 26 + i * 30, y0 + 40], [x0 + 26 + i * 30 + Math.cos(lt * (1 + i) + i) * 7, y0 + 40 + Math.sin(lt * (1 + i) + i) * 7], 1.2, 9515 + i, 0.1); }
  for (let i = 0; i < 6; i++) line([x0 + 16, y0 + 80 + i * 22], [x0 + 124, y0 + 80 + i * 22], 0.9, 9520 + i, 0.3);
  shape(R(MCX - 12, y0 - 26, 24, 26), { lw: 1.4, id: 9530, h: [Math.PI / 2, 2.6, 0.6] });
  const hx = MCX - 46, hy = 344; shape(R(hx, hy, 92, 64), { lw: 2, id: 9531, sh: R(hx + 64, hy, 28, 64), sh2: [Math.PI / 2, 2.2, 0.7] });
  for (const k of [0, 1]) { const ex = hx + 36 + k * 30, ey = hy + 24; ball(ex, ey, 9, 9540 + k, PAT.f, 1.4); X.fillStyle = P.ink; X.beginPath(); X.arc(ex + 3, ey, 3.2, 0, 6.283); X.fill(); }
  for (let i = 0; i < 5; i++) { const h = 2 + hb * 9 * (0.5 + 0.5 * Math.sin(i * 1.7 + lt * 30)); X.fillStyle = P.ink; X.fillRect(hx + 40 + i * 9, hy + 50 - h / 2, 5, h); }
  line([MCX, hy], [MCX + 6, hy - 26], 1.4, 9550, 0.1); ball(MCX + 6, hy - 29, 4, 9551, PAT.f, 1);
  // arm to the board
  const ar = o.arm || 0, sx = x0 + 140, sy = y0 + 24, tx = lerp(sx + 60, o.ax || 600, ar), ty = lerp(sy + 70, o.ay || TAB.y - 18, ar);
  const ex = (sx + tx) / 2 + 10, ey = Math.max(sy, ty) + 18 - ar * 30; cap(sx, sy, ex, ey, 11, 9560); cap(ex, ey, tx, ty, 9, 9561); ball(ex, ey, 6, 9562, PAT.f, 1.1);
  shape([[tx - 6, ty - 4], [tx + 6, ty - 4], [tx + 8, ty + 6], [tx - 8, ty + 6]], { lw: 1.1, id: 9563, fill: P.ink });
  return [MCX, hy + 24];
}
function table() {
  shape(R(TAB.x0, TAB.y, TAB.x1 - TAB.x0, 14), { lw: 1.8, id: 9600, h: [0.1, 3, 0.6] });
  for (const lx of [TAB.x0 + 14, TAB.x1 - 26]) shape(R(lx, TAB.y + 14, 12, FLOOR - TAB.y - 14), { lw: 1.4, id: 9610 + lx, h: [Math.PI / 2, 2.4, 0.6] });
}
/* the board seen from the side: a slab, pieces standing on it, and a chess clock */
const PIECES = [[0, 1, 0], [1, 2, 1], [2, 0, 0], [4, 3, 1], [5, 1, 1], [6, 2, 0], [7, 0, 1]];
function board(lt, ch, o = {}) {
  const bx = 560, bw = 150, by = TAB.y; shape(R(bx, by - 7, bw, 7), { lw: 1.4, id: 9620, h: [0, 1.6, 0.6] });
  for (let i = 0; i < 8; i++) if (i % 2) { X.fillStyle = P.ink; X.fillRect(bx + i * bw / 8, by - 7, bw / 8, 2.5); }
  const mv = ch ? Math.floor(U(lt, ch.at, ch.to) * 6) : 0;
  PIECES.forEach(([col, kind, side], i) => { const shift = (i * 3 + mv) % 8 === 0 && mv > 0 ? 1 : 0, c_ = (col + shift * (side ? -1 : 1) + 8) % 8, x = bx + (c_ + 0.5) * bw / 8, y = by - 7, ht = [12, 16, 20, 18][kind];
    const fill = side ? P.ink : P.paper; shape([[x - 4, y], [x + 4, y], [x + 2.5, y - ht + 5], [x - 2.5, y - ht + 5]], { lw: 1, id: 9630 + i, fill }); ball(x, y - ht + 3, kind === 2 ? 4 : 3.2, 9640 + i, side ? PAT.d : PAT.f, 1); });
  const cx = 740, cy = by; shape(R(cx, cy - 26, 52, 26), { lw: 1.4, id: 9650, h: [0.1, 2.6, 0.5] });
  const side = Math.floor(lt * 0.7) % 2; for (const k of [0, 1]) { const fx = cx + 14 + k * 24, fy = cy - 13; ball(fx, fy, 8.5, 9651 + k, PAT.f, 1.1); const a = lt * (k === side ? 1.2 : 0) * 6.28 / 6 + k; line([fx, fy], [fx + Math.sin(a) * 6.5, fy - Math.cos(a) * 6.5], 1.1, 9655 + k, 0.05);
    shape(R(fx - 4, cy - 30 - (k === side ? 0 : 2.5), 8, 4), { lw: 0.9, id: 9658 + k, fill: P.ink }); }
}
function doubtMark(x, y, u, id, s = 1) { if (u <= 0) return; X.save(); X.globalAlpha = u; const r = 26 * s;
  for (let i = 0; i < 3; i++) ball(x + (i + 1) * 9 * s * (id % 2 ? 1 : -1), y + 34 * s - i * 9 * s, 2.4 * s + i * 1.5 * s, id + i, PAT.f, 0.9);
  ball(x, y - 6 * s, r, id + 5, PAT.f, 1.4); X.font = `${30 * s}px ${FONT}`; X.textAlign = 'center'; X.textBaseline = 'middle'; X.fillStyle = P.ink; X.fillText('?', x, y - 5 * s); X.restore(); }
SHOTS.cogito = (lt, sd, sh) => {
  const L = sh.lines, ch = cue(sh, 'chess'), ask = cue(sh, 'ask'), mi = cue(sh, 'mirror'), db = cues(sh, 'doubt'), bk = cue(sh, 'books');
  const RX = 902, hd = rHead(1).map((v, i) => (i ? v : v - RDX + RX));
  const mvPulse = ch ? Math.max(...[0, 1, 2, 3, 4, 5].map((k) => pulse(lt, lerp(ch.at, ch.to, k / 6), 0.7))) : 0;
  let c = camFor(lt, [[0, ON(640, 360, 1.0)], [L[1].t0, ON(640, 380, 1.15)], [L[3].t0 - 0.3, ON(650, 480, 2.0)], [L[4].t0 + 0.4, ON(620, 420, 1.3)], [L[4].t1 - 0.3, ON(400, 420, 1.8)],
    [L[6].t0 + 0.4, ON(820, 430, 1.6)], [L[7].t0, ON(640, 400, 1.1)], [L[8].t0 - 0.2, ON(400, 400, 1.9)], [L[10].t0 + 0.5, ON(640, 400, 1.15)], [L[11].t0, ON(560, 450, 1.6)]]);
  c = withTight(sh, lt, c, 612, 380, 2.1);
  cam(c, () => {
    wallAndFloor(); shelf({}); table();
    const chessing = lt >= ch.at - 0.5 && lt < ch.to + 0.5;
    board(lt, ch);
    machineAt(lt, { sh, arm: chessing ? mvPulse : 0, ax: 600 + 40 * Math.sin(Math.floor(lt * 2)), ay: TAB.y - 26 });
    reader(RX, 1, lt, { down: !(lt >= ask.at && lt < ask.to) && !(lt >= mi.at), look: lt >= mi.at ? 1 : 0, mouth: sayAt(sh, 'R', lt) });
    if (lt >= mi.at - 0.5) { X.save(); X.globalAlpha = 0.5 * seg(lt, mi.at - 0.5, mi.at + 1.0); X.setLineDash([4, 5]); ink([[636, 300], [636, FLOOR]], 1, 9700, 0.2); X.setLineDash([]); X.restore(); }
    db.forEach((d, i) => { const [x, y] = i === 0 ? [MCX + 70, 300] : [hd[0] - 40, hd[1] - 70]; doubtMark(x, y, seg(lt, d.at, d.at + 0.6), 9710 + i * 20 + (i ? 1 : 0), 1); });
    if (lt >= bk.at) { const u = E.out(U(lt, bk.at, bk.at + 0.8)); [['NOON', 474], ['LUMENTOR', 512]].forEach(([n, x], i) => { const y = TAB.y - (1 - u) * 30; X.save(); X.globalAlpha = u; spine(x, y, 30, 96, '', 9720 + i * 10, { fill: '#d9cfb4' }); X.save(); X.translate(x + 15, y - 48); X.rotate(-Math.PI / 2); txt(n, 0, 0, 8, { mono: true }); X.restore(); X.restore(); }); }
  });
};

SHOTS.anti = (lt, sd, sh) => {
  const L = sh.lines, wr = cues(sh, 'write'), stk = cues(sh, 'strike'), hu = cue(sh, 'hush');
  const page = () => { pageBase(HEADS[4], '17'); txt('ANTIMATICS', PG.x + PG.w / 2, PG.y + 50, 12, { mono: true });
    const ex = PG.x + PG.w / 2, ey = PG.y + 120, u0 = U(lt, wr[0].at, wr[0].at + 1.0);
    if (u0 > 0) { X.save(); X.font = `italic 44px ${FONT}`; X.textAlign = 'center'; X.textBaseline = 'middle'; X.fillStyle = P.ink; X.fillText('n = n'.slice(0, Math.ceil(5 * u0)), ex, ey); X.restore(); }
    const s0 = U(lt, stk[0].at, stk[0].at + 0.5); if (s0 > 0) ink([[ex - 62, ey + 10], [lerp(ex - 62, ex + 62, s0), lerp(ey + 10, ey - 12, s0)]], 3, 9800, 0.5, P.red);
    const pu = U(lt, L[2].t0, L[2].t0 + 3.0); if (pu > 0) { const AX = ['P1  0 is a number', 'P2  every n has a successor n\'', 'P3  0 is the successor of nothing', 'P4  n\' = m\' only if n = m', 'P5  induction'];
      X.save(); X.font = '9px "IBM Plex Mono",monospace'; X.textAlign = 'left'; X.fillStyle = P.ink; AX.slice(0, Math.ceil(AX.length * pu)).forEach((a, i) => X.fillText(a, TX0 + 10, ey + 52 + i * 14)); X.restore();
      const bu = U(lt, L[2].t0 + 2.6, L[2].t0 + 3.4); if (bu > 0) { ink([[TX0 + 222, ey + 42], [TX0 + 230, ey + 42], [TX0 + 230, ey + 42 + 66 * bu], [TX0 + 222, ey + 42 + 66 * bu]], 1.3, 9801, 0.3, P.red); X.save(); X.globalAlpha = bu; X.font = `italic 9px ${FONT}`; X.fillStyle = P.red; X.textAlign = 'left'; X.fillText('consistent,', TX0 + 236, ey + 70); X.fillText('but not of this world', TX0 + 236, ey + 82); X.restore(); } }
    const u1 = U(lt, wr[1].at, wr[1].at + 1.4), ly = PG.y + PG.h - 110;
    if (u1 > 0) { ink([[TX0, ly], [lerp(TX0, TX0 + TW, u1), ly]], 1.4, 9810, 0.3); for (let k = 0; k <= 7; k++) { if (k / 7 > u1) break; const x = TX0 + 12 + k * (TW - 24) / 7; line([x, ly - 5], [x, ly + 5], 1.2, 9811 + k, 0.1); txt(String(k), x, ly + 18, 14, {}); } }
    const s1 = U(lt, stk[1].at, stk[1].at + 0.5); if (s1 > 0) { const x = TX0 + 12; ink([[x - 9, ly + 6], [lerp(x - 9, x + 9, s1), lerp(ly + 6, ly + 30, s1)]], 2.6, 9820, 0.4, P.red); if (s1 > 0.5) ink([[x + 9, ly + 6], [lerp(x + 9, x - 9, (s1 - 0.5) * 2), lerp(ly + 6, ly + 30, (s1 - 0.5) * 2)]], 2.6, 9821, 0.4, P.red); }
    if (lt >= hu.at) { X.save(); X.globalAlpha = seg(lt, hu.at + 0.3, hu.at + 1.4); X.font = `italic 13px ${FONT}`; X.textAlign = 'center'; X.fillStyle = P.ink; X.fillText('Nothing is not among the things that are.', ex, ly + 58); X.font = '8px "IBM Plex Mono",monospace'; X.fillText('STYX', ex, ly + 74); X.restore(); } };
  const pen = wr.some((w) => lt > w.at && lt < w.at + 1.4) || stk.some((s) => lt > s.at && lt < s.at + 0.6) || (lt > L[2].t0 + 2.6 && lt < L[2].t0 + 3.4);
  let c = camFor(lt, [[0, ON(640, 380, 1.0)], [L[0].t0 + 0.6, PAGECAM, 1.2], [L[1].t0 + 0.2, ON(452, 330, 2.0)], [L[2].t0, ON(452, 380, 1.8)], [L[4].t0, ON(452, 520, 1.9)], [L[5].t0, ON(452, 540, 2.0)], [L[5].t1 + 0.4, ON(560, 400, 1.3)]]);
  c = withTight(sh, lt, c, 452, PG.y + 120, 2.6);
  cam(c, () => { room(sh, lt, 4, { book: 'marks' }); reader(RDX, 1, lt, { down: true }); bookBody(); page(); annotator(lt, pen ? 1 : 0); });
};

/* terraphysics: an open book whose gutter is the speed of light */
const SP = { x0: 130, x1: 1150, y0: 70, y1: 640, g: 640 };
SHOTS.tachy = (lt, sd, sh) => {
  const L = sh.lines, op = cue(sh, 'open'), bo = cue(sh, 'border'), spr = cue(sh, 'spread'), pr = cue(sh, 'press'), bu = cue(sh, 'burst'), sm = cue(sh, 'sums');
  const su = U(lt, spr.at, spr.to), pu = U(lt, pr.at, pr.to), after = lt >= bu.at, bt = lt - bu.at;
  let c = camFor(lt, [[0, ON(640, 360, 0.92)], [op.to, ON(640, 360, 1.0), 1.0], [L[1].t0 + 0.4, ON(390, 360, 1.5)], [bo.at, ON(640, 360, 1.25)], [L[3].t0, ON(890, 360, 1.5)], [L[5].t0, ON(700, 360, 1.25)],
    [bu.at - 0.2, ON(640, 360, 1.0), 0.4], [L[6].t1 - 0.6, ON(640, 380, 1.1)], [sm.at, ON(560, 470, 1.6)], [L[8].t1 + 0.3, ON(640, 360, 1.0), 1.2]]);
  c = withTight(sh, lt, c, 650, 470, 2.4);
  cam(c, () => {
    wallAndFloor();
    shape([[SP.x0 - 16, SP.y0 + 10], [SP.x1 + 16, SP.y0 + 10], [SP.x1 + 16, SP.y1 + 12], [SP.x0 - 16, SP.y1 + 12]], { lw: 1.8, id: 9900, fill: '#4b4137' });
    shape(R(SP.x0, SP.y0, SP.g - SP.x0 - 2, SP.y1 - SP.y0), { lw: 1.4, id: 9901, fill: PAPER2, amp: 0.3 });
    shape(R(SP.g + 2, SP.y0, SP.x1 - SP.g - 2, SP.y1 - SP.y0), { lw: 1.4, id: 9902, fill: PAPER2, amp: 0.3 });
    txt('BRADYVERSUM', (SP.x0 + SP.g) / 2, SP.y0 + 26, 13, { mono: true }); txt('TACHYVERSUM', (SP.g + SP.x1) / 2, SP.y0 + 26, 13, { mono: true });
    txt('the slow half', (SP.x0 + SP.g) / 2, SP.y0 + 46, 13, { italic: true }); txt('the fast half', (SP.g + SP.x1) / 2, SP.y0 + 46, 13, { italic: true });
    // left page: suns, planets, slow arrows that cannot cross the gutter
    X.save(); path(R(SP.x0, SP.y0 + 60, SP.g - SP.x0 - 2, SP.y1 - SP.y0 - 60)); X.clip();
    const nStars = 26 + (after ? Math.floor(60 * E.out(U(bt, 0, 2.5))) : 0);
    for (let i = 0; i < nStars; i++) { const x = SP.x0 + 20 + hash(i, 3) * (SP.g - SP.x0 - 50), y = SP.y0 + 80 + hash(i, 4) * (SP.y1 - SP.y0 - 110); if (i >= 26) { const u = clamp(bt * 1.5 - (i - 26) * 0.02); if (u <= 0) continue; star(lerp(SP.g, x, E.out(u)), lerp(360, y, E.out(u)), 4, 9910 + i, P.ink, 6); } else star(x, y, 3 + 3 * hash(i, 5), 9910 + i, P.ink, 6); }
    ball(260, 200, 26, 9990, PAT.m, 1.6); for (let k = 0; k < 12; k++) { const a = k / 12 * 6.283; line([260 + Math.cos(a) * 32, 200 + Math.sin(a) * 32], [260 + Math.cos(a) * 42, 200 + Math.sin(a) * 42], 1.2, 9991 + k, 0.1); }
    ball(430, 330, 12, 9980, PAT.f, 1.2); ball(330, 420, 8, 9981, PAT.d, 1.1);
    for (let i = 0; i < 6; i++) { const sp = 6 + 26 * hash(i, 9), y = 150 + i * 70, x = SP.x0 + 40 + ((lt * sp + hash(i, 8) * 400) % 430); const xe = Math.min(x, SP.g - 26); ink([[xe - 24, y], [xe, y]], 1, 9960 + i, 0.1); ink([[xe - 6, y - 4], [xe, y], [xe - 6, y + 4]], 1, 9970 + i, 0.05, P.ink, false); }
    if (after && bt < 2.0) { X.globalAlpha = 1 - bt / 2; for (let k = 0; k < 28; k++) { const a = Math.PI / 2 + (k / 27 - 0.5) * Math.PI * 0.95 + Math.PI / 2; const r0 = 20, r1 = 60 + bt * 420; ink([[SP.g + Math.cos(a) * r0, 360 + Math.sin(a) * r0], [SP.g + Math.cos(a) * r1, 360 + Math.sin(a) * r1]], 1.4, 9930 + k, 0.3); } X.globalAlpha = 1; }
    X.restore();
    // right page: one particle, everywhere
    X.save(); path(R(SP.g + 2, SP.y0 + 60, SP.x1 - SP.g - 2, SP.y1 - SP.y0 - 60)); X.clip();
    const rx0 = SP.g + 2, rw = SP.x1 - SP.g - 2, ry0 = SP.y0 + 60, rh = SP.y1 - SP.y0 - 60;
    const cover = after ? 0.35 : su * (1 - pu * 0.4), squeeze = after ? 0 : pu;
    const fillW = rw * (1 - squeeze * 0.85);
    if (cover > 0.02) { X.globalAlpha = Math.min(1, cover * 1.2); hatch(0.5, lerp(9, 2.6, cover), 0.6, [rx0, ry0, rx0 + fillW, ry0 + rh]); hatch(-0.5, lerp(11, 3.2, cover), 0.5, [rx0, ry0, rx0 + fillW, ry0 + rh]); X.globalAlpha = 1;
      X.save(); X.fillStyle = PAPER2; X.fillRect(rx0 + fillW, ry0, rw - fillW, rh); X.restore(); }
    const nd = Math.floor(1 + 400 * su * (after ? 0.4 : 1)); const fr = Math.floor(lt * 24);
    for (let i = 0; i < nd; i++) { const x = rx0 + hash(i + fr * 13, 1) * fillW, y = ry0 + hash(i + fr * 17, 2) * rh; X.fillStyle = P.ink; X.fillRect(x, y, 2.4, 2.4); }
    if (su < 0.05) { const t_ = lt * 3; const x = rx0 + (0.5 + 0.45 * Math.sin(t_ * 3.1)) * rw, y = ry0 + (0.5 + 0.45 * Math.sin(t_ * 4.7 + 1)) * rh; ball(x, y, 4, 9940, PAT.d, 1); ink([[x, y], [x - 60 * Math.cos(t_ * 3.1), y - 60 * Math.sin(t_ * 4.7 + 1) * 0.5]], 1, 9941, 0.3); }
    const sl = cue(sh, 'slow').at; if (lt > sl - 0.3) { X.globalAlpha = seg(lt, sl - 0.3, sl + 0.6) * (after ? 0.5 : 1); for (let k = 0; k < 3; k++) { const y = 200 + k * 140, x0 = rx0 + 20 + ((lt - sl) * 6) % 40, pts = []; for (let j = 0; j <= 30; j++) pts.push([x0 + j * 4, y + Math.sin(j * 0.8 + lt) * 6]); ink(pts, 2.2, 9945 + k, 0.2, P.paper); ink(pts, 1, 9948 + k, 0.2, P.amber); } X.globalAlpha = 1; }
    X.restore();
    // the gutter: the speed of light
    const bu_ = Math.max(seg(lt, bo.at, bo.at + 0.8) * (1 - seg(lt, bo.to, bo.to + 1.5)), squeeze, after ? Math.max(0, 1 - bt) : 0);
    ink([[SP.g, SP.y0 + 4], [SP.g, SP.y1 - 4]], 1.4 + 3 * bu_, 9950, 0.3, bu_ > 0.05 ? P.red : P.ink);
    X.save(); X.translate(SP.g - 12, SP.y1 - 120); X.rotate(-Math.PI / 2); X.globalAlpha = 0.5 + 0.5 * bu_; txt('THE SPEED OF LIGHT', 0, 0, 9, { mono: true, col: bu_ > 0.05 ? P.red : P.ink }); X.restore();
    if (after && bt < 0.5) { X.save(); X.globalAlpha = 1 - bt / 0.5; X.fillStyle = P.paper; X.fillRect(-200, -200, 1700, 1200); X.restore(); }
    if (!after && pu > 0.6) { const r = 10 + 30 * (pu - 0.6); ball(SP.g, 360, r, 9955, PAT.d, 1.6); }
    // the sums
    if (sm) { const e = (a) => seg(lt, lerp(sm.at, sm.to, a), lerp(sm.at, sm.to, a) + 0.5);
      [['1 + 1 = 2', 350, 0.08], ['1 + 1 = 1', 540, 0.42], ['1 ≈ ∞', 760, 0.82]].forEach(([s, x, a]) => { const u = e(a); if (u <= 0) return; X.save(); X.globalAlpha = u; shape(R(x - 70, 450, 140, 40), { lw: 0, fill: PAPER2 }); txt(s, x, 470, 24, { mono: true }); X.restore(); }); }
  });
};

/* the Lampoon: a shelf of volumes, and a book closed without being read out */
const LAMP = 13;
function lampoonShelf() {
  shape(R(440, SHELF_Y, 420, 12), { lw: 1.8, id: 7100, h: [0.1, 3, 0.6] });
  for (const bx of [470, 830]) shape([[bx - 6, SHELF_Y + 12], [bx + 6, SHELF_Y + 12], [bx + 6, SHELF_Y + 44], [bx - 6, SHELF_Y + 22]], { lw: 1.4, id: 7110 + bx, fill: P.ink });
  const n = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII', 'XIII'];
  for (let i = 0; i < LAMP; i++) spine(452 + i * 30, SHELF_Y, 27, 150, n[i], 10000 + i * 20, { fill: i % 2 ? '#cfc4a6' : '#d9cfb4' });
}
function lampoonCover() { shape(R(PG.x, PG.y, PG.w, PG.h), { lw: 2, id: 7800, fill: '#d9cfb4', h: [[0.7, 4, 0.5], [-0.7, 4, 0.5]] }); shape(R(PG.x + PG.w / 2 - 110, PG.y + 110, 220, 120), { lw: 1.6, id: 7801, fill: P.paper });
  txt('LAMPOON', PG.x + PG.w / 2, PG.y + 140, 20, {}); txt('UPON THE UNIVERSE', PG.x + PG.w / 2, PG.y + 170, 14, {}); txt('VOLUME I', PG.x + PG.w / 2, PG.y + 205, 10, { mono: true }); }
SHOTS.lampoon = (lt, sd, sh) => {
  const L = sh.lines, cl = cue(sh, 'close'), cu = U(lt, cl.at, cl.at + 0.9);
  let c = camFor(lt, [[0, ON(560, 140, 2.0)], [L[1].t0, ON(760, 140, 2.0), 4.0], [L[2].t0, PAGECAM, 1.2], [L[3].t0, WIDE, 1.2], [L[4].t0 - 0.6, PAGECAM]]);
  c = withTight(sh, lt, c, 452, 420, 2.2);
  cam(c, () => {
    wallAndFloor(); lampoonShelf(); lectern(); desk({ book: 'none' }); reader(RDX, 1, lt, { absent: true });
    bookBody();
    pageBase('LAMPOON UPON THE UNIVERSE', '1'); marks(0.95, 120);
    if (cu > 0 && cu < 1) flip(1 - cu, lampoonCover, () => shape(R(PG.x, PG.y, PG.w, PG.h), { lw: 1.4, id: 7790, fill: '#d9cfb4' }));
    if (cu >= 1) lampoonCover();
  });
};

SHOTS.end = (lt, sd) => {
  X.fillStyle = P.paper; X.fillRect(0, 0, W, H);
  X.globalAlpha = seg(lt, 0.4, 1.6);
  txt('A HISTORY OF BITIC LITERATURE', CX, 190, 34, {}); txt('Sophocrisis and Apostasy', CX, 236, 26, {});
  txt('machines that ask whether we think', CX, 280, 20, { italic: true });
  txt('after Stanisław Lem, A History of Bitic Literature, Volume I,', CX, 340, 17, { italic: true });
  txt('in Imaginary Magnitude (1973), translated by Marc E. Heine.', CX, 364, 17, { italic: true });
  txt('Narration paraphrases Lem.', CX, 388, 17, { italic: true });
  X.globalAlpha = 1;
  const x0 = CX - 170, x = shelfRow(x0, 600, 5); shape(R(x0 - 30, 600, x - x0 + 54, 12), { lw: 1.8, id: 7100, h: [0.1, 3, 0.6] });
  void sd;
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
  T = await (await fetch('timing/ba.json')).json();
  await document.fonts.ready; await Promise.all(['IM Fell English', 'IBM Plex Mono'].map((n) => document.fonts.load(`20px "${n}"`))); await document.fonts.load(`italic 20px "IM Fell English"`);
  X = document.getElementById('film').getContext('2d');
  prepTexts();
  window.__NF = Math.ceil(T.dur * 24); window.__T = T; window.__ready = true;
})();
