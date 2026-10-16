/* The Theory of Possibilities. Drawing. After Ewelina Woźniak-Czech, "The Possibilities of Theory – the Theory of Possibilities"
   (Przestrzenie Teorii special issue, 2024, tr. Małgorzata Olsza, CC BY-NC-ND 4.0); narration paraphrases the essay; page texts here are new.
   Same toolkit as the bitic films: ink.js (Kingdoms in a Box) plus the drawing head of bitic-introduction/film-src/bi.js (the study,
   shelf, lectern, page, desk, reader, pen and reading machine), copied below unchanged from its fifth line to its reading machine.
   Extended here with shelves that change, a stage on which concepts are actors, and pages that hold several readings at once. */
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
      if (st === 'marks') { X.fillStyle = P.ink; X.globalAlpha = 0.6; X.fillRect(Math.min(x0, x1), yy - 1, Math.abs(x1 - x0), 2.2); X.globalAlpha = 1; } else if (st !== 'blank') line([x0, yy], [x1, yy], 0.6, 7950 + k + d * 10, 0.1); }
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

const rHead = (s) => [RDX - 30 * s, FLOOR - 268 * s];

/* ================= this film: shelves that change ================= */
const THEORIES = ['POETICS', 'RHETORIC', 'FORMALISM', 'NEW CRITICISM', 'STRUCTURALISM', 'PHENOMENOLOGY', 'HERMENEUTICS', 'SEMIOTICS', 'RECEPTION', 'MARXISM',
  'PSYCHOANALYSIS', 'NARRATOLOGY', 'DECONSTRUCTION', 'FEMINISM', 'GENDER', 'QUEER THEORY', 'NEW HISTORICISM', 'POSTCOLONIAL', 'CULTURAL STUDIES', 'AFFECT',
  'POSTHUMANISM', 'ECOCRITICISM', 'PERFORMATIVITY', 'DRAMATIC THEORY', 'COGNITIVE', 'MEDIA THEORY', 'BOOK HISTORY', 'TRANSLATION', 'ETHICAL TURN', 'DIGITAL'];
const SH0 = 400, SH1 = 900;
const TSP = (() => { let x = SH0 + 8; return THEORIES.map((n, i) => { const w = 12 + Math.round(5 * hash(i, 41)), h = 112 + Math.round(26 * hash(i, 42)); const o = { n, x, w, h, tone: ['#d9cfb4', '#cbbf9f', '#e3d9bf', '#bfb393'][Math.floor(hash(i, 43) * 4)] }; x += w + 1.6; return o; }); })();
function theorySpine(b, id, a = 1) {
  if (a <= 0) return;
  X.save(); X.globalAlpha = a; const y = (b.y ?? SHELF_Y) - (1 - a) * 18;
  X.fillStyle = b.tone; X.fillRect(b.x, y - b.h, b.w, b.h); X.lineWidth = 1.1; X.strokeStyle = P.ink; X.strokeRect(b.x, y - b.h, b.w, b.h);
  X.fillStyle = P.ink; X.fillRect(b.x, y - b.h + 6, b.w, 1.2); X.fillRect(b.x, y - 8, b.w, 1.2);
  X.save(); X.translate(b.x + b.w / 2 + 2.5, y - 14); X.rotate(-Math.PI / 2); X.font = '600 7px "IBM Plex Mono", monospace'; X.textAlign = 'left'; X.textBaseline = 'alphabetic'; X.fillText(b.n, 0, 0); X.restore();
  X.restore(); void id;
}
function board(x0, x1, y, id) { shape(R(x0, y, x1 - x0, 12), { lw: 1.8, id, h: [0.1, 3, 0.6] }); for (const bx of [x0 + 30, x1 - 30]) shape([[bx - 6, y + 12], [bx + 6, y + 12], [bx + 6, y + 44], [bx - 6, y + 22]], { lw: 1.4, id: id + 10 + (bx | 0), fill: P.ink }); }
/* the theory shelf: n spines shown (fractional n fades the last one in) */
function theoryShelf(n = THEORIES.length) {
  board(SH0, SH1, SHELF_Y, 7100);
  for (let i = 0; i < TSP.length; i++) theorySpine(TSP[i], i, clamp(n - i));
}
/* a plain spine for the library rows: kind 'blank' (a book that does not exist) or 'marks' (written by a machine) */
function rowSpine(x, y, w, h, kind, seed, a = 1) {
  if (a <= 0) return;
  X.save(); X.globalAlpha = a;
  X.fillStyle = kind === 'marks' ? '#cfc4a6' : '#f1ead8'; X.fillRect(x, y - h, w, h);
  X.lineWidth = 1; X.strokeStyle = P.ink; X.strokeRect(x, y - h, w, h);
  X.fillStyle = P.ink; X.fillRect(x, y - h + 5, w, 1); X.fillRect(x, y - 7, w, 1);
  if (kind === 'blank') { X.strokeRect(x + w * 0.2, y - h * 0.68, w * 0.6, h * 0.22); }
  else { for (let k = 0, yy = y - h + 12; yy < y - 12; k++, yy += 3.2) { const ww = w * (0.25 + 0.6 * hash(seed * 31 + k, 5)); X.globalAlpha = a * 0.75; X.fillRect(x + (w - ww) / 2, yy, ww, 1.3); } }
  X.restore();
}
/* library rows above the shelf (Borges's library): row k = 1..3. fill(i) gives each spine's kind and alpha */
const ROWS = [1, 2, 3].map((k) => { const y = SHELF_Y - 172 * k, out = []; let x = -260; let i = 0; while (x < 1540) { const w = 11 + Math.round(7 * hash(k * 999 + i, 1)), h = 104 + Math.round(30 * hash(k * 999 + i, 2)); out.push({ x, w, h, y, i: out.length }); x += w + 1.5; i++; } return { k, y, sp: out }; });
function libraryRows(fill) {
  for (const r of ROWS) {
    X.fillStyle = P.paper; X.fillRect(-260, r.y, 1800, 12); X.strokeStyle = P.ink; X.lineWidth = 1.6; X.strokeRect(-260, r.y, 1800, 12);
    X.fillStyle = P.ink; X.globalAlpha = 0.5; for (let x = -260; x < 1540; x += 4) X.fillRect(x, r.y + 2, 0.6, 8); X.globalAlpha = 1;
    for (const s of r.sp) { const [kind, a] = fill(r.k, s.i, s.x); rowSpine(s.x, r.y, s.w, s.h, kind, r.k * 1000 + s.i, a); }
  }
}
/* the five volumes of the History from the bitic films; labelled 0..1 */
function bitShelf(lab = 1) {
  shape(R(440, SHELF_Y, 420, 12), { lw: 1.8, id: 7100, h: [0.1, 3, 0.6] });
  for (const bx of [470, 830]) shape([[bx - 6, SHELF_Y + 12], [bx + 6, SHELF_Y + 12], [bx + 6, SHELF_Y + 44], [bx - 6, SHELF_Y + 22]], { lw: 1.4, id: 7110 + bx, fill: P.ink });
  VOLS.forEach((v, i) => {
    const y = SHELF_Y, h = 138, w = v.w, x = v.x, id = 7200 + i * 20, li = clamp(lab * 5 - i);
    shape(R(x, y - h, w, h), { lw: 1.6, id, fill: '#e9e0c8' });
    for (const q of [0.12, 0.2, 0.8, 0.88]) line([x, y - h * q], [x + w, y - h * q], 1.6, id + q * 100, 0.2);
    shape(R(x + w * 0.16, y - h * 0.66, w * 0.68, h * 0.22), { lw: 1.1, id: id + 7, fill: P.paper });
    if (li > 0) { X.save(); X.globalAlpha = li; X.beginPath(); X.rect(x, y - h, w, h); X.clip(); hatch(Math.PI / 2, 3.2, 0.5, [x, y - h, x + w, y]); hatch(Math.PI / 2, 1.6, 0.8, [x + w * 0.62, y - h, x + w, y]);
      X.fillStyle = P.paper; X.fillRect(x + w * 0.16, y - h * 0.66, w * 0.68, h * 0.22); X.strokeStyle = P.ink; X.lineWidth = 1.1; X.strokeRect(x + w * 0.16, y - h * 0.66, w * 0.68, h * 0.22);
      txt(v.n, x + w / 2, y - h * 0.55, Math.min(18, w * 0.42), {}); X.restore(); }
  });
}

/* ================= the stage, and concepts as actors ================= */
const STG = { x0: 120, x1: 700, fy: 572, top: 262 };
function stageBack() {
  const { x0, x1, fy, top } = STG;
  shape(R(x0, top - 30, x1 - x0, fy - top + 30), { lw: 1.2, id: 9100, fill: '#ddd2b6', h: [Math.PI / 2, 7, 0.4] });
  shape(R(x0 - 30, fy, x1 - x0 + 60, 16), { lw: 1.6, id: 9101, h: [0, 2.6, 0.6] });
  shape(R(x0 - 24, fy + 16, x1 - x0 + 48, FLOOR - fy - 16), { lw: 1.4, id: 9102, fill: '#d3c7a8', h: [Math.PI / 2, 14, 0.7] });
}
function stageFront(o = {}) {
  const { x0, x1, fy, top } = STG, op = o.open ?? 1, half = (x1 - x0) / 2;
  for (const sd of [-1, 1]) {
    const ex = sd < 0 ? x0 : x1, cw = lerp(half + 2, 40, op);
    const pts = [[ex, top - 30], [ex - sd * cw, top - 30], [ex - sd * lerp(cw, 18, op), top + (fy - top) * 0.6], [ex - sd * lerp(cw, 30, op), fy], [ex, fy]];
    shape(pts, { lw: 1.6, id: 9120 + sd, fill: '#6b5d4c', h: [Math.PI / 2 + sd * 0.04, 6, 0.6] });
  }
  for (const px of [x0 - 30, x1]) shape(R(px, top - 36, 30, fy - top + 36), { lw: 1.6, id: 9103 + px, h: [Math.PI / 2, 3, 0.6] });
  shape(R(x0 - 44, top - 64, x1 - x0 + 88, 34), { lw: 1.8, id: 9110, h: [[0.6, 4, 0.5], [-0.6, 4, 0.5]] });
  if (o.sign) { X.save(); X.globalAlpha = o.signA ?? 1; shape(R((x0 + x1) / 2 - 78, top - 60, 156, 26), { lw: 1.2, id: 9111, fill: P.paper }); txt(o.sign, (x0 + x1) / 2, top - 47, 12, { mono: true }); X.restore(); }
}
/* a concept as an actor: a robed figure whose head is a card with its name. d = facing (-1 left .. 1 right; between = turning) */
function actor(x, y, o = {}) {
  if (SILENT || (o.a ?? 1) <= 0) return;
  const s = o.s || 1, d = o.d ?? 1, sg = d >= 0 ? 1 : -1, ph = o.ph || 0, wk = o.wk || 0, id = o.id || 9000, lie = o.lie || 0;
  X.save(); X.globalAlpha = o.a ?? 1; X.translate(x, y); X.scale(s, s);
  if (lie > 0) { X.translate(0, -12 * lie); X.rotate(Math.PI / 2 * E.io(lie)); }
  X.translate(0, -Math.abs(Math.sin(ph)) * wk * 3);
  for (const k of [-1, 1]) { const sw = Math.sin(ph + (k > 0 ? Math.PI : 0)) * wk * 9; cap(k * 6, -64, k * 7 + sw, -5, 8, id + k + 3); shape(R(k * 7 + sw - 6 + sg * 3, -6, 13, 6), { fill: P.ink, lw: 0.6, id: id + k + 6 }); }
  cap(-sg * 11, -114, -sg * 15, -76, 7, id + 10);
  const shx = sg > 0 ? [-24, -3] : [3, 24];
  shape([[-24, -58], [24, -58], [15, -122], [-15, -122]], { lw: 1.5, id: id + 12, h: [1.75, 4.2, 0.5], sh: [[shx[0], -124], [shx[1], -124], [shx[1], -56], [shx[0], -56]], sh2: [1.6, 2.2, 0.7] });
  cap(0, -122, 0, -136, 6, id + 14);
  const ra = o.reach || 0, hx = sg * (24 + ra * 12), hy = -86 - ra * 24; cap(sg * 11, -114, hx, hy, 7, id + 16); ball(hx, hy, 4.5, id + 17, PAT.f, 1);
  const nm = o.name || ''; X.font = '600 10px "IBM Plex Mono", monospace'; const cw = Math.max(44, X.measureText(nm).width + 16), chh = 28, kx = Math.max(0.05, Math.abs(d));
  X.save(); X.translate(0, -152); X.scale(kx, 1);
  shape(R(-cw / 2, -chh / 2, cw, chh), { lw: 1.7, id: id + 20, fill: o.card || P.paper });
  if (kx > 0.2) { X.font = '600 10px "IBM Plex Mono", monospace'; X.textAlign = 'center'; X.textBaseline = 'middle'; X.fillStyle = P.ink; X.fillText(nm, 0, 0); }
  X.restore();
  if (Math.abs(d) > 0.15) { const ex = sg * cw / 2 * kx; shape([[ex, -158], [ex + sg * 9, -151], [ex, -145]], { fill: P.ink, lw: 0.6, id: id + 22 }); }
  const mo = o.mouth || 0; if (mo > 0.05) { X.fillStyle = P.ink; X.fillRect(sg * cw * kx * 0.28 - 5, -137, 10, 1 + mo * 5); }
  X.restore();
}
const walkTo = (lt, a, b, x0, x1) => { const u = U(lt, a, b); return { x: lerp(x0, x1, E.io(u)), wk: u > 0 && u < 1 ? 1 : 0, ph: lt * 9 }; };

/* ================= the room ================= */
const WIDE = ON(640, 380, 1.0), PAGECAM = ON(452, 410, 1.5), STAGECAM = ON(410, 430, 1.55);
const SHELFCAM2 = ON(650, 140, 2.0), UPCAM = ON(650, -60, 0.95), DESKCAM = ON(960, 440, 1.5);
function room(lt, o = {}) {
  wallAndFloor();
  if (o.rows) libraryRows(o.rows);
  if (o.bit !== undefined) bitShelf(o.bit); else theoryShelf(o.nTheory ?? THEORIES.length);
  if (o.stage) stageBack(); else lectern();
  desk({ book: o.book || 'plain' });
}
function pageHead(head, folio) { pageBase(head, folio); }
const fontMono = (sz, w = 400) => `${w} ${sz}px "IBM Plex Mono", monospace`;

/* ================= shots ================= */
SHOTS.title = (lt) => {
  X.fillStyle = P.paper; X.fillRect(0, 0, W, H);
  const t1 = 'THE THEORY OF POSSIBILITIES', n = Math.floor(t1.length * U(lt, 0.8, 3.2));
  X.font = FONTR(52); const fullW = X.measureText(t1).width; X.textAlign = 'left'; X.textBaseline = 'middle'; X.fillStyle = P.ink; X.fillText(t1.slice(0, n), CX - fullW / 2, 140);
  X.globalAlpha = seg(lt, 3.2, 4.2);
  txt('an essay by Ewelina Woźniak-Czech, and Lem’s books that do not exist', CX, 204, 27, { italic: true });
  X.globalAlpha = seg(lt, 3.8, 4.8);
  txt('after Ewelina Woźniak-Czech, The Possibilities of Theory – the Theory of Possibilities, Przestrzenie Teorii special issue (2024),', CX, 262, 16, { italic: true });
  txt('translated by Małgorzata Olsza, CC BY-NC-ND 4.0. Narration paraphrases the essay.', CX, 288, 16, { italic: true });
  X.globalAlpha = 1;
  // a shelf: some theories, the five volumes of the History, and books that do not exist
  const y = 600; let x = CX - 300;
  shape(R(x - 24, y, 648, 12), { lw: 1.8, id: 7100, h: [0.1, 3, 0.6] });
  for (let i = 0; i < 9; i++) { const b = { ...TSP[i * 3], x, y }; theorySpine(b, i); x += b.w + 2; }
  x += 10; VOLS.forEach((v, i) => { spine(x, y, v.w, 138, v.n, 7200 + i * 20); x += v.w + 4; }); x += 10;
  for (let i = 0; i < 12; i++) { const w = 13 + 6 * hash(i, 9); X.save(); X.globalAlpha = seg(lt, 4.4 + i * 0.12, 4.9 + i * 0.12); rowSpine(x, y, w, 110 + 24 * hash(i, 8), 'blank', i); X.restore(); x += w + 1.5; }
};

/* ---- 1. what literature is ---- */
const DEFS = ['the imitation of an action', 'language that draws attention to itself', 'a structure of signs', 'what the author meant', 'what a reader makes of it', 'whatever a culture calls literature', 'something that has come to an end'];
const DY0 = PG.y + 70, DL = 34;
SHOTS.field = (lt, sd, sh) => {
  const L = sh.lines, st = cues(sh, 'strike'), wr = cue(sh, 'write'), cr = cue(sh, 'crowd');
  const word = 'its potential', nW = Math.floor(word.length * U(lt, wr.at, wr.to));
  X.font = FONTI(19); const wx = TX0 + 30, wy = DY0 + 7 * DL, endX = wx + X.measureText(word.slice(0, nW)).width;
  let c = camFor(lt, [[0, ON(452, 400, 1.6)], [L[1].t0 - 0.4, PAGECAM, 1.2], [L[4].t0 - 0.2, SHELFCAM2, 1.4], [L[5].t0 + 0.4, WIDE, 1.6]]);
  c = withTight(sh, lt, c, endX - 30, wy - 10, 2.6);
  cam(c, () => {
    room(lt, { nTheory: 6 + 24 * U(lt, cr.at, cr.to) });
    reader(RDX, 1, lt, { down: true });
    bookBody(); pageBase('WHAT LITERATURE IS', '1');
    X.textAlign = 'left'; X.textBaseline = 'alphabetic';
    DEFS.forEach((d, i) => {
      const y = DY0 + i * DL; X.font = FONTR(16); X.fillStyle = P.ink; X.fillText(`${i + 1}.`, TX0, y); X.fillText(d, TX0 + 30, y);
      const s = st[i]; if (s) { const u = U(lt, s.at, s.at + 0.45); if (u > 0) { const w_ = X.measureText(d).width; ink([[TX0 + 26, y - 5], [TX0 + 30 + (w_ + 6) * u, y - 6 + hash(i, 3) * 2]], 1.8, 8300 + i * 7, 0.7, P.red); } }
    });
    X.font = FONTR(16); X.fillStyle = P.ink; X.fillText('8.', TX0, wy);
    X.font = FONTI(19); X.fillText(word.slice(0, nW), wx, wy);
    if (lt > wr.at - 1.0 && lt < L[4].t0) penHand(endX, wy, lt, lt >= wr.at && lt < wr.to);
  });
};

/* ---- 2. the old and the young; turns ---- */
const OLD = [['STRUCTURE', 180], ['SYSTEM', 250], ['MODEL', 318]], YOUNG = [['PLAY', 470], ['TRACE', 545], ['READING', 625]];
const TURNS = [['CULTURAL', 215], ['AFFECTIVE', 305], ['POSTHUMAN', 400], ['PERFORMATIVE', 500], ['DRAMATIC', 600]];
SHOTS.turns = (lt, sd, sh) => {
  const L = sh.lines, cu = cue(sh, 'curtain'), yg = cue(sh, 'young'), sg = cue(sh, 'sign'), en = cues(sh, 'enter'), tu = cue(sh, 'turn');
  const flipD = (d0, i) => { const u = U(lt, tu.at + i * 0.14, tu.at + i * 0.14 + 0.7); return d0 * Math.cos(Math.PI * u); };
  let c = camFor(lt, [[0, WIDE], [cu.at + 0.4, STAGECAM, 1.6], [L[3].t0, ON(410, 440, 1.45), 1.0], [L[5].t0, ON(560, 400, 1.15), 1.4]]);
  c = withTight(sh, lt, c, 410, 470, 2.15);
  cam(c, () => {
    room(lt, { stage: true, book: 'plain' });
    reader(RDX, 1, lt, { look: 0 });
    shape(R(STG.x0 + 30, STG.fy - 56, STG.x1 - STG.x0 - 60, 56), { lw: 1.4, id: 9290, fill: '#cbbf9f', h: [0, 3.2, 0.5] });
    TURNS.forEach(([n, x], i) => { const e = en[i], w = walkTo(lt, e.at - 0.2, e.at + 1.3, 760, x); if (lt < e.at - 0.2) return; actor(w.x, STG.fy - 56, { name: n, s: 0.8, d: flipD(-1, 6 + i), wk: w.wk, ph: w.ph + i, id: 9300 + i * 40 }); });
    OLD.forEach(([n, x], i) => actor(x, STG.fy, { name: n, d: flipD(1, i), id: 9500 + i * 40 }));
    YOUNG.forEach(([n, x], i) => { const w = walkTo(lt, yg.at + i * 0.4, yg.at + 2.0 + i * 0.4, 780 + i * 30, x); if (lt < yg.at + i * 0.4) return; actor(w.x, STG.fy, { name: n, d: flipD(-1, 3 + i), wk: w.wk, ph: w.ph + i * 2, id: 9700 + i * 40, reach: pulse(lt, L[2].t0 + 3.5 + i * 0.5, 1.0) }); });
    stageFront({ open: U(lt, cu.at, cu.to), sign: '1966 · BALTIMORE', signA: U(lt, sg.at, sg.at + 0.6) });
  });
};

/* ---- 3. concretization: a page with places left open ---- */
const GTEXT = 'A woman came in from the {0} and set the {1} down on the table. She did not say where she had been. Outside, the {2} went on and on. Her brother looked at the {3} for a long time, and said nothing.';
const FILLS = [['rain', 'letter', 'wind', 'clock'], ['market', 'knife', 'bells', 'door'], ['station', 'bread', 'river', 'window']];
const GCOL = ['#4d473f', P.red, P.blue], GW = 74, GL = 30, GY0 = PG.y + 74;
let GLAY = null;
function gapLayout() {
  X.font = FONTR(16); const sp = X.measureText(' ').width, out = []; let x = TX0, y = GY0;
  for (const tk of GTEXT.split(' ')) {
    const m = tk.match(/^\{(\d)\}(.*)$/), w = m ? GW + X.measureText(m[2]).width : X.measureText(tk).width;
    if (x + w > TX0 + TW) { x = TX0; y += GL; }
    out.push(m ? { gap: +m[1], tail: m[2], x, y } : { word: tk, x, y }); x += w + sp;
  }
  return out;
}
SHOTS.gaps = (lt, sd, sh) => {
  const L = sh.lines, f = cues(sh, 'fill'), gh = cue(sh, 'ghost'), shm = cue(sh, 'shimmer'), th = cue(sh, 'three'), tk = cue(sh, 'tick'), stl = cue(sh, 'settle');
  if (!GLAY) GLAY = gapLayout();
  const hd = rHead(1);
  let c = camFor(lt, [[0, WIDE], [1.0, PAGECAM, 1.6], [L[2].t0 - 0.3, ON(hd[0] - 60, hd[1] + 60, 2.0), 1.0], [L[2].t1 + 0.3, PAGECAM, 1.0], [L[4].t0, ON(452, 420, 1.6)], [th.at - 0.3, ON(452, 520, 1.9), 1.2], [L[5].t0 + 0.6, WIDE, 1.6]]);
  c = withTight(sh, lt, c, 452, GY0 + 40, 2.3);
  const shimU = U(lt, shm.at, shm.to + 3), settled = lt >= stl.at;
  cam(c, () => {
    room(lt, { book: 'plain' });
    reader(RDX, 1, lt, { write: lt > f[0].at && lt < f[0].to ? 1 : 0, down: !talking(sh, 'R', lt), mouth: sayAt(sh, 'R', lt), look: talking(sh, 'R', lt) ? 1 : 0 });
    bookBody(); pageBase('', '37');
    X.textAlign = 'left'; X.textBaseline = 'alphabetic';
    for (const it of GLAY) {
      X.font = FONTR(16); X.fillStyle = P.ink;
      if (it.word) { X.fillText(it.word, it.x, it.y); continue; }
      const g = it.gap; X.fillText(it.tail, it.x + GW, it.y);
      // the place left open
      X.save(); X.setLineDash([2, 3]); X.strokeStyle = '#7a7266'; X.lineWidth = 1; X.strokeRect(it.x + 2, it.y - 15, GW - 6, 20); X.restore();
      const v0 = U(lt, f[0].at + g * 0.5, f[0].at + g * 0.5 + 0.6), v1 = U(lt, f[1].at + g * 0.3, f[1].at + g * 0.3 + 0.5), gu = U(lt, gh.at + g * 0.2, gh.at + g * 0.2 + 0.6);
      let main = 0; if (lt > shm.at && !settled) main = Math.floor(lt * 2.2 + g * 0.71 + hash(g, 3) * 3) % 3; if (settled) main = 2;
      const word = (k, a, dy, sz) => { if (a <= 0) return; X.save(); X.globalAlpha = a; X.font = FONTI(sz); X.fillStyle = GCOL[k]; const ww = X.measureText(FILLS[k][g]).width; X.fillText(FILLS[k][g], it.x + (GW - 6 - ww) / 2 + 2, it.y + dy); X.restore(); };
      if (lt < gh.at) { word(0, v0, 0, 17); word(1, v1 * 0.85, -18, 13); }
      else {
        const others = [0, 1, 2].filter((k) => k !== main);
        const ga = settled ? 1 - U(lt, stl.at, stl.at + 1.2) : 1;
        others.forEach((k, j) => word(k, gu * 0.7 * ga * (1 - 0.4 * shimU), j ? 22 : -18, 13));
        word(main, 1, 0, 17);
      }
    }
    // the third value
    if (lt > th.at) {
      const a = U(lt, th.at, th.at + 0.6), y = PG.y + PG.h - 64; X.save(); X.globalAlpha = a;
      ['TRUE', 'FALSE', 'NEITHER'].forEach((w, i) => { const x = TX0 + 6 + i * 110; X.strokeStyle = P.ink; X.lineWidth = 1.4; X.strokeRect(x, y - 12, 14, 14); X.font = fontMono(12, 600); X.fillStyle = P.ink; X.textAlign = 'left'; X.fillText(w, x + 22, y); });
      const k = U(lt, tk.at, tk.at + 0.4); if (k > 0) { const x = TX0 + 6 + 220; ink([[x + 2, y - 6], [x + 6, y], [x + 6 + 10 * k, y - 16 * k]], 2.2, 8400, 0.3, P.red); }
      X.restore();
    }
  });
};

/* ---- 4. deconstructive hopscotch ---- */
const SQ = 40, HCX = PG.x + PG.w / 2, HBY = PG.y + PG.h - 44;
const COURT = (() => { const c = [], add = (n, r, k) => c.push({ n, x: HCX + k * SQ / 2, y: HBY - r * SQ }); add(1, 0, 0); add(2, 1, 0); add(3, 2, 0); add(4, 3, -1); add(5, 3, 1); add(6, 4, 0); add(7, 5, -1); add(8, 5, 1); add(9, 6, 0); c.push({ n: 10, x: HCX, y: HBY - 7 * SQ + 6, half: true }); return c; })();
const UNBUILT = [[-2.6, 2], [2.6, 2], [-2.6, 4], [2.6, 5], [-2.0, 6.4], [2.0, 6.4]].map(([k, r]) => ({ x: HCX + k * SQ, y: HBY - r * SQ }));
const PATH_A = [1, 2, 3, 4, 6, 7, 9, 10], PATH_B = [1, 2, 3, 5, 6, 8, 9, 10];
const sqAt = (n) => COURT.find((q) => q.n === n);
function lexia(x, y, seed, a = 1) { X.fillStyle = P.ink; for (let k = 0; k < 3; k++) { const w = SQ * (0.35 + 0.4 * hash(seed, k)); X.globalAlpha = a * 0.6; X.fillRect(x - SQ / 2 + 7, y - 6 + k * 5, w, 1.4); } X.globalAlpha = 1; }
function stonePath(lt, a, b, path, col, id, melt) {
  const u = U(lt, a, b), m = u * (path.length - 1), i = Math.min(path.length - 2, Math.floor(m)), f = m - i;
  const pts = path.map((n) => { const q = sqAt(n); return [q.x + melt(q, 0), q.y + melt(q, 1)]; });
  if (u <= 0) return null;
  const done = pts.slice(0, i + 1); const p0 = pts[i], p1 = pts[i + 1], cur = [lerp(p0[0], p1[0], f), lerp(p0[1], p1[1], f) - Math.sin(Math.PI * f) * 16];
  X.save(); X.globalAlpha = 0.85; ink([...done, cur], 2, id, 0.5, col); X.restore();
  return cur;
}
SHOTS.hopscotch = (lt, sd, sh) => {
  const L = sh.lines, co = cue(sh, 'court'), yo = cue(sh, 'you'), pa = cue(sh, 'pathA'), pb = cue(sh, 'pathB'), me = cue(sh, 'melt');
  const mu = U(lt, me.at, me.at + 6), melt = (q, k) => (k ? Math.cos(lt * 0.9 + q.x * 0.05) * 6 : Math.sin(lt * 0.8 + q.y * 0.07) * 9) * mu;
  const stoneA = (() => { const u = U(lt, pa.at, pa.to), m = u * (PATH_A.length - 1); const i = Math.min(PATH_A.length - 2, Math.floor(m)); const q = sqAt(PATH_A[i]); return [q.x, q.y]; })();
  let c = camFor(lt, [[0, WIDE], [0.6, PAGECAM, 1.6], [L[1].t0 + 4, ON(452, 470, 1.9), 1.2], [L[3].t0, PAGECAM, 1.0], [L[4].t0 + 0.4, WIDE, 1.6]]);
  c = withTight(sh, lt, c, stoneA[0], stoneA[1] - 20, 2.4);
  cam(c, () => {
    room(lt, { book: 'drift' });
    reader(RDX, 1, lt, { down: true });
    bookBody(); pageBase('MANUSCRIPT FOUND IN SARAGOSSA · HYPERTEXT', '');
    const cu = U(lt, co.at, co.to);
    UNBUILT.forEach((q, i) => { const a = cu * 0.9; if (a <= 0) return; X.save(); X.globalAlpha = a; X.setLineDash([3, 4]); X.strokeStyle = '#8a8274'; X.lineWidth = 1; X.strokeRect(q.x - SQ / 2 + melt(q, 0), q.y - SQ / 2 + melt(q, 1), SQ, SQ); X.restore(); void i; });
    COURT.forEach((q, i) => {
      const a = clamp(cu * COURT.length - i); if (a <= 0) return;
      const x = q.x + melt(q, 0), y = q.y + melt(q, 1), rot_ = Math.sin(lt * 0.7 + i) * 0.06 * mu;
      X.save(); X.globalAlpha = a; X.translate(x, y); X.rotate(rot_);
      if (q.half) { X.beginPath(); X.arc(0, SQ / 2 - 6, SQ * 0.75, Math.PI, 0); X.closePath(); X.fillStyle = P.paper; X.fill(); X.lineWidth = 1.8; X.strokeStyle = P.ink; X.stroke(); }
      else { X.fillStyle = P.paper; X.fillRect(-SQ / 2, -SQ / 2, SQ, SQ); X.lineWidth = 1.8; X.strokeStyle = P.ink; X.strokeRect(-SQ / 2, -SQ / 2, SQ, SQ); }
      txt(String(q.n), -SQ / 2 + 8, -SQ / 2 + 9, 9, { mono: true });
      const swap = lt < L[0].t1 ? Math.floor(lt * 1.6 + i * 0.4) : 0;
      if (!(q.n === 1 && lt > yo.at)) lexia(0, 2, i * 13 + swap * 7, 1);
      X.restore();
    });
    if (lt > yo.at) { const q = sqAt(1); X.save(); X.globalAlpha = U(lt, yo.at, yo.at + 0.5); txt('YOU', q.x + melt(q, 0), q.y + 4 + melt(q, 1), 15, { mono: true, bold: true }); X.restore(); }
    const sB = stonePath(lt, pb.at, pb.to, PATH_B, P.ochre, 8510, melt), sA = stonePath(lt, pa.at, pa.to, PATH_A, P.red, 8500, melt);
    for (const s of [sB, sA]) if (s) ball(s[0], s[1], 5.5, 8520, PAT.d, 1.4);
  });
};

/* ---- 5. the dramatic: author, work, reader; terms; travelling concepts ---- */
const TERMS = [['SCENE', 200], ['ACT', 320], ['DIALOGUE', 500], ['EVENT', 620]];
SHOTS.dramatic = (lt, sd, sh) => {
  const L = sh.lines, cu = cue(sh, 'curtain'), ri = cue(sh, 'rise'), tm = cues(sh, 'term'), tr = cue(sh, 'travel'), th = cue(sh, 'theory');
  const AX = 196, WX = 440, RX = 590, mid = (tr.at + tr.to) / 2;
  let c = camFor(lt, [[0, WIDE], [cu.at + 0.3, STAGECAM, 1.6], [L[1].t0 - 0.3, ON(AX + 40, 470, 2.0), 1.0], [L[2].t0 + 0.6, STAGECAM, 1.2], [L[3].t0 - 0.2, ON(400, 450, 1.85), 1.0],
    [L[6].t0 + 0.5, ON(410, 400, 1.45), 1.2], [tr.at, ON(420, 420, 1.2), 1.4], [L[8].t1 + 0.6, WIDE, 1.4]]);
  c = withTight(sh, lt, c, 470, 470, 2.2);
  cam(c, () => {
    room(lt, { stage: true, book: 'plain' });
    reader(RDX, 1, lt, { look: 0 });
    // hanging terms, flown in on lines
    TERMS.forEach(([n, x], i) => { const u = U(lt, tm[i].at, tm[i].at + 0.7); if (u <= 0) return; const y = lerp(STG.top - 40, STG.top + 34, E.out(u)) + Math.sin(lt * 1.4 + i) * 1.5;
      line([x, STG.top - 30], [x, y - 12], 0.8, 9800 + i, 0.1); X.font = fontMono(11, 600); const w = X.measureText(n).width + 16; shape(R(x - w / 2, y - 12, w, 24), { lw: 1.4, id: 9810 + i, fill: P.paper }); txt(n, x, y, 11, { mono: true, bold: true }); });
    // a concept that travels: it leaves by one wing and comes back by the other with a changed meaning
    const out = walkTo(lt, tr.at, mid, 172, -10), back = walkTo(lt, mid + 0.4, tr.to, 840, 660);
    if (lt < mid) actor(out.x, STG.fy, { name: 'PERFORMANCE', d: lt > tr.at ? -1 : 1, wk: out.wk, ph: out.ph, id: 9900, a: clamp((out.x - 60) / 50) });
    else actor(back.x, STG.fy, { name: 'PERFORMATIVITY', d: -1, wk: back.wk, ph: back.ph, id: 9940, a: clamp((760 - back.x) / 50) });
    actor(AX, STG.fy, { name: 'AUTHOR', d: 1, lie: 1 - U(lt, ri.at, ri.to), mouth: sayAt(sh, 'A', lt), id: 9600 });
    actor(WX, STG.fy, { name: 'WORK', d: talking(sh, 'W', lt) ? -1 : 1, mouth: sayAt(sh, 'W', lt), id: 9640 });
    actor(RX, STG.fy, { name: 'READER', d: -1, mouth: sayAt(sh, 'R', lt), id: 9680, reach: talking(sh, 'R', lt) ? 0.6 : 0 });
    const tw = walkTo(lt, th.at, th.to, 820, 470);
    if (lt > th.at) actor(tw.x, STG.fy + 8, { name: 'THEORY', d: lt < th.to ? -1 : -Math.cos(Math.PI * U(lt, th.to + 0.6, th.to + 1.3)), wk: tw.wk, ph: tw.ph, s: 1.06, id: 9980, card: '#f6e7c4' });
    stageFront({ open: U(lt, cu.at, cu.to) });
  });
};

/* ---- 6. Lem's apocrypha: books that do not exist ---- */
const PV = ['A Perfect Vacuum', 'Les Robinsonades', 'Gigamesh', 'Sexplosion', 'Gruppenführer Louis XVI', 'Rien du tout, ou la conséquence', 'Perycalypsis', 'Idiot', 'Do Yourself a Book', 'Odysseus of Ithaca', 'Toi', 'Being Inc.', 'Die Kultur als Fehler', 'De Impossibilitate Vitae', 'Non Serviam', 'The New Cosmogony'];
const IM = ['Introduction', 'Cezary Strzybisz, Necrobes', 'Reginald Gulliver, Eruntics', 'A History of Bitic Literature, Volume I', 'Vestrand’s Extelopedia in 44 Magnetomes', 'Golem XIV'];
function coverT(title, sub) { shape(R(PG.x, PG.y, PG.w, PG.h), { lw: 2, id: 7800, fill: '#e3d9bf', h: [[0.7, 5, 0.4], [-0.7, 5, 0.4]] }); shape(R(PG.x + 50, PG.y + 120, PG.w - 100, 120), { lw: 1.6, id: 7801, fill: P.paper }); txt(title, PG.x + PG.w / 2, PG.y + 166, 26, {}); txt(sub, PG.x + PG.w / 2, PG.y + 204, 12, { mono: true }); }
function contents(list, head, o = {}) {
  pageBase(head, o.folio || 'v'); txt('CONTENTS', PG.x + PG.w / 2, PG.y + 52, 13, { mono: true });
  X.textAlign = 'left'; X.textBaseline = 'alphabetic'; X.font = FONTI(o.sz || 14); X.fillStyle = P.ink;
  list.forEach((t, i) => { const y = PG.y + 82 + i * (o.lead || 19); X.fillText(t, TX0 + 10, y); X.fillStyle = '#8a8274'; X.fillRect(TX0 + 14 + X.measureText(t).width, y - 1, 2, 1); X.fillStyle = P.ink; });
}
/* the first review reviews the book it is in: the page holds a smaller copy of itself */
function abyss(depth, a) {
  if (depth <= 0 || a <= 0) return;
  const bx = PG.x + 196, by = PG.y + 236, s = 0.42;
  X.save(); X.globalAlpha *= a; X.translate(bx, by); X.scale(s, s); X.translate(-PG.x, -PG.y);
  contents(PV.slice(0, 7), 'A PERFECT VACUUM', { folio: '' }); abyss(depth - 1, 1);
  X.restore();
}
function ghostPage(lt, title) {
  pageBase('A PERFECT VACUUM', '');
  txt(title, PG.x + PG.w / 2, PG.y + 66, 22, {});
  for (let k = 0; k < 3; k++) marks(0.2 + k * 0.08, 200 + (Math.floor(lt * 1.5 + k * 7) % 40), { y0: PG.y + 104 + k * 3, y1: PG.y + PG.h - 34, alpha: 0.1 + 0.06 * Math.sin(lt * 1.3 + k * 2.1) });
}
function introPage(k) { pageBase('INTRODUCTION', ['vii', 'ix', 'xiii', 'xxi'][k] || ''); marks(0.3, 300 + k, { y0: TY0 + 4, y1: TY0 + 4 + (4 - k) * 14 }); }
SHOTS.vacuum = (lt, sd, sh) => {
  const L = sh.lines, bl = cue(sh, 'blank'), pl = cue(sh, 'pull'), fi = cue(sh, 'first'), ab = cue(sh, 'abyss'), tn = cues(sh, 'turn'), p2 = cue(sh, 'pull2'), nr = cue(sh, 'near');
  const bu = U(lt, bl.at, bl.to + 2);
  const hd = rHead(1);
  let c = camFor(lt, [[0, SHELFCAM2], [bl.at + 2.0, UPCAM, 3.0], [pl.at - 0.4, PAGECAM, 1.6], [ab.at - 0.4, ON(480, 470, 1.9), 1.0], [L[3].t0, ON(hd[0] - 90, hd[1] + 60, 1.7), 1.2], [tn[0].at, PAGECAM, 1.0],
    [p2.at, PAGECAM], [tn[2].at, ON(560, 360, 0.9), 2.0], [nr.at, ON(452, 400, 2.3), Math.max(1, nr.to - nr.at)]]);
  c = withTight(sh, lt, c, 452, 400, 2.5);
  cam(c, () => {
    room(lt, { book: 'blank', rows: (k, i, x) => ['blank', clamp(bu * 4 - k * 0.6 - hash(i, k) * 1.5 - Math.abs(x - 650) / 900)] });
    reader(RDX, 1, lt, { down: !(lt > L[3].t0 && lt < L[3].t1), look: lt > L[3].t0 && lt < L[3].t1 ? 1 : 0 });
    if (lt < pl.at) return;
    bookBody();
    const pvOpen = U(lt, pl.at + 1.0, pl.at + 1.8);
    if (lt < p2.at) {
      const pvContents = () => { contents(PV, 'A PERFECT VACUUM'); const fu = U(lt, fi.at, fi.at + 0.7); if (fu > 0) { X.font = FONTI(14); const w = X.measureText(PV[0]).width; ink([[TX0 + 8, PG.y + 86], [TX0 + 8 + (w + 6) * fu, PG.y + 86]], 1.6, 8600, 0.4, P.red);
          if (fu >= 1) { const v = U(lt, fi.at + 0.6, fi.at + 1.6); const pts = []; for (let j = 0; j <= 20 * v; j++) { const q = j / 20; pts.push([TX0 + w + 20 + Math.sin(q * Math.PI) * 60, PG.y + 82 - q * 56]); } if (pts.length > 1) ink(pts, 1.4, 8610, 0.4, P.red); } }
        abyss(3, U(lt, ab.at, ab.at + 1.0)); };
      if (pvOpen <= 0) coverT('A Perfect Vacuum', 'STANISŁAW LEM · 1971');
      else if (pvOpen < 1) { pvContents(); flip(pvOpen, () => coverT('A Perfect Vacuum', 'STANISŁAW LEM · 1971')); }
      else { const t0 = tn[0].at; if (lt < t0) pvContents(); else { ghostPage(lt, 'Gigamesh'); flip(U(lt, t0, t0 + 0.75), pvContents); } }
    } else {
      const imOpen = U(lt, p2.at + 1.0, p2.at + 1.8), cov = () => coverT('Imaginary Magnitude', 'STANISŁAW LEM · 1973');
      const pages = [() => contents(IM, 'IMAGINARY MAGNITUDE', { sz: 14, lead: 24 }), () => introPage(0), () => introPage(1), () => introPage(2)];
      if (imOpen <= 0) { cov(); }
      else if (imOpen < 1) { pages[0](); flip(imOpen, cov); }
      else { let i = 0; for (const q of tn.slice(1)) if (lt >= q.at) i++; pages[i](); if (i > 0) { const q = tn[i]; const u = U(lt, q.at, q.at + 0.75); if (u < 1) flip(u, pages[i - 1]); } }
    }
  });
};

/* ---- 7. bitic literature, now being written ---- */
const RIVALS = ['PLAY', 'TRACE', 'AUTHOR', 'READER', 'WORK', 'TURN', 'GAP', 'LIQUIDITY', 'EVENT', 'POSSIBILITY'];
function rosette(x, y, s, id) { for (const k of [-1, 1]) shape([[x + k * 3, y + 6], [x + k * 12, y + 34], [x + k * 5, y + 28], [x + k * 1, y + 36], [x, y + 6]], { lw: 1, id: id + k, fill: P.red }); ball(x, y, 11 * s, id + 3, PAT.f, 1.3, P.amber); ball(x, y, 6 * s, id + 4, PAT.m, 1.0); }
SHOTS.bitic = (lt, sd, sh) => {
  const L = sh.lines, ma = cue(sh, 'machine'), wr = cue(sh, 'write'), pz = cue(sh, 'prize'), fl = cue(sh, 'flood'), rg = cue(sh, 'ring');
  const fu = U(lt, fl.at, fl.to), wu = U(lt, wr.at, wr.at + 34), MXp = PG.x + PG.w - 26, MYp = PG.y + PG.h + 6;
  const bottom = PG.y + PG.h - 30, y1 = lerp(TY0 + 30, bottom, Math.pow(wu, 0.8));
  let c = camFor(lt, [[0, ON(650, 132, 2.2)], [L[1].t0 + 0.5, WIDE, 1.6], [wr.at + 2.5, PAGECAM, 1.2], [pz.at - 0.6, DESKCAM, 1.2], [L[4].t0, WIDE, 1.2], [L[5].t0 - 0.6, UPCAM, 2.6], [L[6].t0, WIDE, 1.6], [rg.at, ON(452, 410, 1.75), 2.0]]);
  c = withTight(sh, lt, c, 470, TY0 + 60, 2.3);
  cam(c, () => {
    room(lt, { book: lt > wr.at ? 'marks' : 'plain', bit: U(lt, wr.at, wr.at + 1.6), rows: fu > 0 ? (k, i, x) => ['marks', clamp(fu * 7 - hash(i, k + 3) * 3 - (k - 1) * 1.0 - Math.abs(x - 650) / 500)] : null });
    if (lt > pz.at) { const a = U(lt, pz.at, pz.at + 0.6); X.save(); X.globalAlpha = a; rosette(1000, DESK.y - 46, 1, 8900); X.restore(); }
    reader(RDX, 1, lt, { down: !(lt > pz.at + 1.0 && lt < L[4].t0), look: lt > pz.at + 1.0 && lt < L[4].t0 ? 0.5 : 0 });
    bookBody(); pageBase('A HISTORY OF BITIC LITERATURE', 'VOL. I');
    X.save(); X.globalAlpha = 1 - U(lt, wr.at, wr.at + 1.2); X.font = FONTI(15); X.textAlign = 'left'; X.fillStyle = '#5a554c'; X.fillText('1973', TX0, TY0 + 6); X.restore();
    if (wu > 0) marks(0.85, 70, { y0: TY0 - 6, y1 });
    if (lt > rg.at) {
      const a = U(lt, rg.at, rg.at + 1.5), cx = PG.x + PG.w / 2, cy = PG.y + PG.h / 2 + 14, r = 132;
      X.save(); X.globalAlpha = a; X.fillStyle = PAPER2; X.beginPath(); X.arc(cx, cy, r + 26, 0, 6.283); X.fill();
      X.beginPath(); X.arc(cx, cy, r, 0, 6.283); X.lineWidth = 9; X.strokeStyle = P.ink; X.stroke(); X.lineWidth = 6; X.strokeStyle = PAPER2; X.stroke();
      const ang = RIVALS.map((n, i) => (i % 2 ? -1 : 1) * (lt - rg.at) * (0.5 + 0.35 * hash(i, 5)) + i * 0.63);
      RIVALS.forEach((n, i) => { const x = cx + Math.cos(ang[i]) * r, y = cy + Math.sin(ang[i]) * r; ball(x, y, 4, 8950 + i, PAT.d, 1); txt(n, x, y - 11, 8, { mono: true, bold: true }); });
      for (let i = 0; i < RIVALS.length; i++) for (let j = i + 1; j < RIVALS.length; j++) { const d = Math.abs(Math.atan2(Math.sin(ang[i] - ang[j]), Math.cos(ang[i] - ang[j]))); if (d < 0.06) { const m = (ang[i] + ang[j]) / 2 + (Math.abs(ang[i] - ang[j]) > Math.PI ? Math.PI : 0); star(cx + Math.cos(m) * r, cy + Math.sin(m) * r, 14, 8990 + i * 10 + j, P.red, 10); } }
      X.restore();
    }
    if (lt > ma.at) { const w = walkTo(lt, ma.at, ma.to, PG.x + PG.w + 60, MXp); readingMachine(w.x, MYp, 1.35, lt, { f: -1, walk: w.wk, wave: lt > wr.at ? Math.abs(Math.sin(lt * 7)) : 0, scan: lt > wr.at }); }
  });
};

SHOTS.end = (lt, sd, sh) => {
  const tu = cue(sh, 'turn');
  cam(ON(640, 400, 1.0), () => {
    wallAndFloor(); lectern(); bookBody();
    pageBase('', ''); marks(0.05, 99, { alpha: 0.1 });
    const last = () => { pageBase('A HISTORY OF BITIC LITERATURE', 'VOL. I'); marks(0.85, 70, { y0: TY0 - 6, y1: PG.y + PG.h - 30 }); };
    flip(U(lt, tu.at, tu.at + 0.8), last);
    if (lt < tu.at) last();
    X.globalAlpha = seg(lt, 2.6, 3.8);
    shape(R(680, 200, 560, 290), { lw: 0, fill: P.paper });
    txt('THE THEORY OF POSSIBILITIES', 960, 236, 25, {});
    txt('an essay by Ewelina Woźniak-Czech,', 960, 272, 17, { italic: true });
    txt('and Lem’s books that do not exist', 960, 296, 17, { italic: true });
    txt('after Ewelina Woźniak-Czech, The Possibilities of Theory –', 960, 342, 15, { italic: true });
    txt('the Theory of Possibilities, Przestrzenie Teorii special issue (2024),', 960, 366, 15, { italic: true });
    txt('translated by Małgorzata Olsza, CC BY-NC-ND 4.0,', 960, 390, 15, { italic: true });
    txt('doi:10.14746/pt.2024.special.8. Narration paraphrases the essay.', 960, 414, 15, { italic: true });
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
  T = await (await fetch('timing/tq.json')).json();
  await document.fonts.ready; await Promise.all(['IM Fell English', 'IBM Plex Mono'].map((n) => document.fonts.load(`20px "${n}"`))); await document.fonts.load(`italic 20px "IM Fell English"`); await document.fonts.load(`600 10px "IBM Plex Mono"`);
  X = document.getElementById('film').getContext('2d');
  window.__NF = Math.ceil(T.dur * 24); window.__T = T; window.__ready = true;
})();
