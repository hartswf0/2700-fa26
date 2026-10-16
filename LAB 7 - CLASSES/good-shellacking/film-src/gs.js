/* A Good Shellacking: drawing. Same toolkit as the earlier films (ink.js plus the head of the Ferrix drawing file, by way of the Femfatalatron file).
   The device: equality against identity. One routine draws every Trurl, with one set of ids, so the picture cannot tell the two apart. */
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
    const wk = o.walk || 0, ph = o.ph || 0;
    for (const k of [-1, 1]) { const sw = Math.sin(ph + (k > 0 ? Math.PI : 0)) * wk, [, , fx, fy] = limb(k * 13, -128, Math.PI / 2 - k * 0.06 + sw * 0.55, 64, Math.PI / 2 + k * 0.04 + sw * 0.25 + Math.max(0, -sw) * wk * 0.5, 62, 17, id + 10 + k * 5); boot(fx + k * 2, wk ? fy + 2 : 0, 1, 1.2, id + 20 + k); }
  } else {
    for (const k of [-1, 1]) { limb(k * 13, -128, 0.06, 66, Math.PI / 2 + 0.05, 64, 17, id + 10 + k * 5); boot(66 + k * 4, 0, 1, 1.2, id + 20 + k); }
    back();
  }
  shape([[-24, -140], [24, -140], [20, -116], [-20, -116]], { lw: 1.5, id: id + 30, sh: R(6, -140, 20, 26), sh2: [1.5, 2.2, 0.6] });
  cap(0, -146, 0, -180, 14, id + 31);
  shape([[-38, -224], [38, -224], [28, -170], [-28, -170]], { lw: 1.8, id: id + 32, sh: [[12, -226], [40, -226], [30, -168], [12, -168]], sh2: [1.65, 2.4, 0.7] });
  shape(R(-14, -212, 28, 22), { lw: 1, id: id + 33 }); line([-10, -206], [10, -206], 0.7, id + 34); line([-10, -200], [6, -200], 0.7, id + 35);
  ball(-34, -220, 9, id + 36, PAT.f, 1.2); ball(34, -220, 9, id + 37, PAT.f, 1.2);
  if (o.robe) shape([[-46, -232], [-10, -226], [44, -150], [60, -60], [-10, -46], [-58, -80], [-50, -150]], { lw: 2, id: id + 40, fill: o.robeFill, h: [1.75, 5, 0.5], sh: [[10, -230], [70, -230], [70, -40], [10, -40]], sh2: [1.65, 2.6, 0.7] });
  if (o.robe) for (let i = 0; i < 5; i++) ink([[-40 + i * 18, -60], [-30 + i * 14, -140], [-26 + i * 8, -210]], 1, id + 50 + i, 0.8);
  cap(0, -228, 0, -244, 10, id + 38);
  const [, , hx, hy] = limb(30, -214, ra[0], 62, ra[1], 58, 15, id + 60); hand(hx, hy, ra[1], 8, id + 63, o.open || 0);
  X.restore();
  boxHead(x + (o.hx || 0) * s * (o.f || 1), y - 286 * s + (o.hy || 0) * s, 0.95 * s, id + 80, { f: o.f, look: o.look || 0, tilt: o.tilt || 0, closed: o.closed, sway: o.sway || 0, lookY: o.lookY || 0, mouth: o.mouth || 0, hair: o.hair, glasses: o.glasses, mus: o.mus, stern: o.stern });
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


/* ================================================================================================
   THE MISCHIEF OF KING BALERION
   The device: the voice stays with the mind, the picture stays with the body.
   A body is a costume (king, Trurl, Klapaucius, sailor, commissioner, skipper, clock). A mind is a mark over the head:
   a drawn emblem and a hatched halo. At each butt the two marks fly across and change bodies; the sound does the same.
   ================================================================================================ */
function darkWall2(y1, sp = 2.8) { darkWall(PX0 - 400, PY0 - 400, PX1 + 400, y1, sp); }
function floor2(y, id = 7000) { X.fillStyle = P.paper; X.fillRect(PX0 - 400, y, PX1 - PX0 + 800, 500); floorLines(y + 2, 720, id); line([PX0 - 400, y], [PX1 + 400, y], 2.4, id + 400, 0.3); }
function door(x, y, w, h, id, o = {}) { // x,y = bottom centre
  const op = o.open || 0;
  shape(R(x - w / 2 - 10, y - h - 10, w + 20, h + 10), { lw: 2.2, id, fill: P.ink });
  if (op > 0.02) { shape([[x - w / 2, y], [x - w / 2 + w * 0.7 * (1 - op * 0.5), y - 10 * op], [x - w / 2 + w * 0.7 * (1 - op * 0.5), y - h + 8 * op], [x - w / 2, y - h]], { lw: 2, id: id + 1, h: [Math.PI / 2, 4, 0.7] }); return; }
  shape(R(x - w / 2, y - h, w, h), { lw: 2.2, id: id + 1, h: [Math.PI / 2, 4.2, 0.7] });
  for (const [px, py, pw, ph] of [[-0.34, 0.1, 0.68, 0.34], [-0.34, 0.5, 0.68, 0.38]]) shape(R(x + px * w, y - h + py * h, pw * w, ph * h), { lw: 1.2, id: id + 2 + py * 10, fill: P.paper, h: [0.3, 4, 0.5] });
  ball(x + w * 0.34, y - h * 0.45, 7, id + 5, PAT.m, 1.5);
  if (o.bar) shape(R(x - w / 2 - 14, y - h * 0.5 - 8, w + 28, 16), { lw: 2, id: id + 6, h: [0.1, 2.5, 0.7] });
}
function crate(x, y, w, id) { shape(R(x - w / 2, y - w * 0.8, w, w * 0.8), { lw: 1.8, id, h: [0.4, 3.2, 0.6] }); line([x - w / 2, y - w * 0.8], [x + w / 2, y], 1.2, id + 1, 0.3); line([x + w / 2, y - w * 0.8], [x - w / 2, y], 1.2, id + 2, 0.3); }
function barrel(x, y, w, id) { shape([[x - w * 0.42, y - w * 1.1], [x + w * 0.42, y - w * 1.1], [x + w * 0.5, y - w * 0.55], [x + w * 0.42, y], [x - w * 0.42, y], [x - w * 0.5, y - w * 0.55]], { lw: 1.8, id, h: [Math.PI / 2, 3.6, 0.6] }); for (const q of [0.25, 0.8]) line([x - w * 0.46, y - w * q], [x + w * 0.46, y - w * q], 2.2, id + 3 + q * 10, 0.2); }
function bollard(x, y, id) { shape([[x - 14, y], [x + 14, y], [x + 11, y - 40], [x + 17, y - 46], [x - 17, y - 46], [x - 11, y - 40]], { lw: 1.8, id, h: [Math.PI / 2, 2.8, 0.7] }); }
function lamppost(x, y, h, id, lit = 0) { line([x, y], [x, y - h], 4.2, id, 0.3); shape(R(x - 6, y - 10, 12, 10), { lw: 1.4, id: id + 1, fill: P.ink }); shape([[x - 16, y - h], [x + 16, y - h], [x + 12, y - h - 30], [x - 12, y - h - 30]], { lw: 1.8, id: id + 2, fill: P.paper, h: lit ? [0.4, 2.4, 0.8] : undefined }); shape([[x - 20, y - h - 30], [x + 20, y - h - 30], [x, y - h - 46]], { lw: 1.6, id: id + 3, fill: P.ink }); }
function house(x, y, w, h, id, o = {}) { shape(R(x - w / 2, y - h, w, h), { lw: 1.8, id, h: [Math.PI / 2, 3.4, 0.5], sh: R(x + w * 0.1, y - h, w * 0.4, h), sh2: [Math.PI / 2, 2, 0.8] }); shape([[x - w * 0.6, y - h], [x, y - h - w * 0.4], [x + w * 0.6, y - h]], { lw: 1.8, id: id + 1, fill: P.paper, h: [0.5, 3, 0.7] });
  const nx = Math.max(1, Math.floor(w / 46)); for (let i = 0; i < nx; i++) for (let j = 0; j < Math.floor(h / 70); j++) shape(R(x - w / 2 + (i + 0.5) * w / nx - 9, y - h + 18 + j * 60, 18, 28), { lw: 1.2, id: id + 10 + i * 5 + j, fill: o.lit && (i + j) % 2 ? P.paper : P.ink }); }
function stairY(x) { return x < 60 ? 330 : x > 960 ? 646 : 330 + Math.floor((x - 60) / 66) * 23; }
function stairsBG() {
  for (let i = 0; i < 14; i++) { const x0 = 60 + i * 66, y0 = 330 + i * 23; shape(R(x0, y0, 66 + 6, 700 - y0), { lw: 1.8, id: 7700 + i * 3, h: [Math.PI / 2, 4.2, 0.45], sh: R(x0, y0, 66 + 6, 5), sh2: [0, 1.5, 0.9], fill: P.paper }); line([x0, y0], [x0 + 66, y0], 2.6, 7730 + i, 0.3); }
  shape(R(PX0 - 40, 330, 110, 400), { lw: 1.8, id: 7760, h: [0.3, 3.6, 0.6] }); line([PX0 - 40, 330], [72, 330], 2.6, 7761, 0.3);
}
function seaLines(y0, y1, lt, id = 7800) { for (let y = y0, k = 0; y < y1; y += 7, k++) { const amp = 1.5 + k * 0.1; X.beginPath(); for (let x = PX0 - 20; x <= PX1 + 20; x += 18) { const yy = y + Math.sin(x * 0.03 + lt * 1.2 + k) * amp; x === PX0 - 20 ? X.moveTo(x, yy) : X.lineTo(x, yy); } X.lineWidth = 0.9 + k * 0.03; X.strokeStyle = P.ink; X.stroke(); } }
function ship(x, y, s, id, lt = 0) { X.save(); X.translate(x, y + Math.sin(lt * 1.1) * 3); X.scale(s, s);
  shape([[-170, -60], [170, -60], [140, 0], [-130, 0]], { lw: 2.4, id, h: [0.1, 3, 0.6], sh: [[30, -60], [170, -60], [140, 0], [30, 0]], sh2: [0.1, 2, 0.8] }); line([-8, -60], [-8, -250], 3.4, id + 1, 0.3); line([-8, -250], [-8, -262], 5, id + 2, 0.2);
  shape([[-8, -240], [-120, -80], [-8, -80]], { lw: 1.8, id: id + 3, fill: P.paper, h: [0.7, 3, 0.5] }); shape([[-4, -230], [90, -90], [-4, -90]], { lw: 1.8, id: id + 4, fill: P.paper, h: [0.7, 3, 0.5] });
  for (let i = 0; i < 5; i++) ball(-110 + i * 55, -34, 7, id + 6 + i, PAT.f, 1.2); X.restore(); }
function harborBG(lt, o = {}) {
  X.fillStyle = P.paper; X.fillRect(PX0 - 400, PY0 - 400, PX1 - PX0 + 800, 1400);
  X.save(); X.globalAlpha = 0.55; skyLines(PY0 - 100, 330, 700); X.restore();
  const far = [[PX0 - 40, 332]]; for (let i = 0; i <= 18; i++) { const x = PX0 + i * (PX1 - PX0) / 18; far.push([x, 322 - 16 * Math.sin(i * 0.8) - 8 * hash(7900, i)]); } far.push([PX1 + 40, 332]); shape(far, { lw: 1.4, id: 7901, h: [0.1, 3.4, 0.5] });
  seaLines(334, 500, lt); if (!o.noShip) { ship(1010, 478, 0.62, 7910, lt); }
}
function quayFloor() { X.fillStyle = P.paper; X.fillRect(PX0 - 400, 500, PX1 - PX0 + 800, 400); floorLines(502, 720, 7950); line([PX0 - 400, 500], [PX1 + 400, 500], 3, 7990, 0.3); for (let x = 60; x < 1260; x += 150) line([x, 500], [x - 40 + (x % 3) * 8, 540], 1, 7991 + x, 0.3); }
function desk(x, y, w, id, o = {}) { // y = floor line the legs stand on
  const top = y - 116; const split = o.split || 0;
  if (split > 0.02) { for (const d of [-1, 1]) { X.save(); X.translate(x + d * w * 0.25, top + 14); X.rotate(d * 0.12 * split); X.translate(-(x + d * w * 0.25), -(top + 14)); shape(R(x + (d > 0 ? 0 : -w / 2), top, w / 2, 14), { lw: 1.8, id: id + d, h: [0.1, 3, 0.6] }); shape(R(x + d * (w / 2 - 20) - 6, top + 14, 12, 102), { lw: 1.4, id: id + 4 + d, h: [Math.PI / 2, 2.4, 0.6] }); X.restore(); } return; }
  table(x, top, w, id, 102);
  // the front drawer
  shape(R(x - w * 0.16, top + 14, w * 0.32, 26), { lw: 1.4, id: id + 8, fill: P.paper, h: o.drawer ? [0.4, 2, 0.8] : undefined });
  if (o.drawer) { shape([[x - w * 0.14, top + 38], [x + w * 0.14, top + 38], [x + w * 0.2, top + 52], [x - w * 0.2, top + 52]], { lw: 1.6, id: id + 9, fill: P.paper }); } else ball(x, top + 27, 3, id + 10, PAT.d, 0.8);
}
function wallRoomStone(lt, o = {}) {
  darkWall2(520, 3.2); for (let r = 0; r < 8; r++) for (let c = 0; c < 14; c++) { const bx = c * 110 + (r % 2) * 55 - 120, by = 40 + r * 60; X.strokeStyle = P.paper; X.globalAlpha = 0.5; X.lineWidth = 1; X.strokeRect(bx, by, 110, 60); X.globalAlpha = 1; }
  floor2(520);
}
function windowBars(x, y, w, h, id) { shape(R(x - w / 2 - 8, y - h / 2 - 8, w + 16, h + 16), { lw: 2.4, id, fill: P.ink }); shape(R(x - w / 2, y - h / 2, w, h), { lw: 1.6, id: id + 1, fill: P.paper, h: [Math.PI / 2, 5, 0.5] }); for (let i = 1; i < 4; i++) line([x - w / 2 + i * w / 4, y - h / 2], [x - w / 2 + i * w / 4, y + h / 2], 3.2, id + 2 + i, 0.2); line([x - w / 2, y], [x + w / 2, y], 3, id + 8, 0.2); }
function throne(x, y, id) {
  shape(R(x - 100, y - 20, 200, 20), { lw: 2, id: id + 3, h: [0.1, 3, 0.7] }); shape(R(x - 84, y - 44, 168, 24), { lw: 2, id: id + 4, h: [0.1, 3, 0.7] });
  shape(R(x - 58, y - 330, 116, 290), { lw: 2.4, id, h: [Math.PI / 2, 3.2, 0.7], sh: R(x + 12, y - 330, 46, 290), sh2: [Math.PI / 2, 1.8, 0.9] });
  shape([[x - 58, y - 330], [x - 44, y - 372], [x, y - 390], [x + 44, y - 372], [x + 58, y - 330]], { lw: 2.4, id: id + 1, h: [0.6, 3, 0.7] });
  shape(R(x - 80, y - 150, 160, 106), { lw: 2.2, id: id + 2, fill: P.paper, h: [0.15, 2.6, 0.8] });
  for (const d of [-1, 1]) { shape(R(x + d * 88 - 14, y - 200, 28, 156), { lw: 2, id: id + 5 + d, h: [Math.PI / 2, 3, 0.7] }); ball(x + d * 88, y - 208, 11, id + 8 + d, PAT.m, 1.6); }
}
function chandelier(x, y, w, lt, id, o = {}) {
  for (const d of [-1, 1]) line([x + d * w * 0.5, PY0], [x + d * w * 0.4, y - 6], 2, id + d, 0.3);
  line([x, PY0], [x, y - 30], 2.4, id + 3, 0.3);
  X.beginPath(); X.ellipse(x, y, w * 0.55, w * 0.1, 0, 0, 6.2832); X.lineWidth = 6; X.strokeStyle = P.ink; X.stroke(); X.lineWidth = 2; X.strokeStyle = P.paper; X.stroke();
  for (let i = 0; i < 9; i++) { const u = i / 8, px = x - w * 0.5 + u * w, py = y + Math.sqrt(Math.max(0, 1 - Math.pow((px - x) / (w * 0.55), 2))) * w * 0.1 * 0.8, len = 26 + 16 * hash(id, i) + 4 * Math.sin(lt * 3 + i); line([px, py], [px, py + len], 1, id + 10 + i, 0.1); shape([[px, py + len], [px - 5, py + len + 10], [px, py + len + 20], [px + 5, py + len + 10]], { lw: 1.1, id: id + 30 + i, fill: P.paper, h: [0.7, 2.2, 0.8] }); }
  for (let i = 0; i < 5; i++) { const px = x - w * 0.4 + i * w * 0.2; line([px, y - 6], [px, y - 28], 3, id + 50 + i, 0.2); const fl = 1 + 0.2 * Math.sin(lt * 9 + i * 2); X.beginPath(); X.ellipse(px, y - 34, 3 * fl, 7 * fl, 0, 0, 6.2832); X.fillStyle = P.ink; X.fill(); }
}
function qmark(x, y, s, a = 1) { X.save(); X.globalAlpha = a; txt('?', x, y, 110 * s, { bold: true }); X.restore(); }
function bookStack(x, y, s, n, id) { for (let i = 0; i < n; i++) shape(R(x - 17 * s, y - (i + 1) * 9 * s, 34 * s, 9 * s), { lw: 1.2, id: id + i, fill: i % 2 ? P.paper : '#d8d2c0', h: i % 2 ? [0.1, 2, 0.8] : undefined }); }
function coinDot(x, y, r, id) { X.beginPath(); X.arc(x, y, r, 0, 6.2832); X.fillStyle = P.amber; X.fill(); X.lineWidth = 1.2; X.strokeStyle = P.ink; X.stroke(); X.beginPath(); X.arc(x, y, r * 0.5, 0, 6.2832); X.stroke(); }
function spear(x, y, s, id, lean = 0) { X.save(); X.translate(x, y); X.rotate(lean); line([0, 0], [0, -150 * s], 2.4, id, 0.2); shape([[-6 * s, -150 * s], [6 * s, -150 * s], [0, -176 * s]], { lw: 1.4, id: id + 1, fill: P.ink }); X.restore(); }
function guard(x, y, s, id, o = {}) { micro(x, y, s, id, { f: o.f || 1, walk: o.walk || 0, ph: o.ph || 0, look: o.look || 0, mouth: o.mouth || 0, tilt: o.tilt || 0, ant: 0 }); shape([[x - 11 * s, y - 62 * s], [x + 11 * s, y - 62 * s], [x + 8 * s, y - 88 * s], [x - 8 * s, y - 88 * s]], { lw: 1.4, id: id + 20, fill: P.ink }); if (o.spear !== false) spear(x + (o.f || 1) * 22 * s, y, s, id + 30, o.lean || 0); }
function courtier(x, y, s, id, o = {}) { micro(x, y, s, id, { f: o.f || 1, walk: o.walk || 0, ph: o.ph || 0, wave: o.wave || 0, look: o.look || 0, mouth: o.mouth || 0, tilt: o.tilt || 0, ant: o.ant || 0, bob: o.bob || 0 }); }
function chest(x, y, s, id, open = 0) { X.save(); X.translate(x, y); X.scale(s, s); shape(R(-60, -50, 120, 50), { lw: 2.2, id, h: [Math.PI / 2, 3.4, 0.6] }); shape([[-60, -50], [-54, -50 - 22 * (1 - open * 0.2)], [54, -50 - 22 * (1 - open * 0.2)], [60, -50]], { lw: 2, id: id + 1, h: [0.2, 3, 0.7] }); line([-60, -30], [60, -30], 2, id + 2, 0.2); shape(R(-8, -40, 16, 16), { lw: 1.6, id: id + 3, fill: P.paper }); X.restore(); }
function diadem(x, y, s, id, sparkle = 0) {
  X.save(); X.translate(x, y); X.scale(s, s);
  shape([[-70, 0], [-76, -34], [-44, -14], [-22, -52], [0, -20], [22, -52], [44, -14], [76, -34], [70, 0]], { lw: 2.4, id, fill: P.paper, h: [0.5, 3, 0.6] });
  for (const [a, b, r] of [[-76, -38, 8], [-22, -58, 10], [22, -58, 10], [76, -38, 8], [0, -26, 9]]) { ball(a, b, r, id + 3 + a, PAT.m, 1.6); }
  for (let i = -3; i <= 3; i++) ball(i * 20, -8, 5.5, id + 30 + i, PAT.f, 1.2);
  if (sparkle > 0) for (const [a, b] of [[-22, -60], [22, -60], [76, -40], [-76, -40], [0, -28]]) { const q = (sparkle * 3 + hash(a, b)) % 1; star(a, b, 14 * (0.4 + q), id + 60 + a, P.ink, 6); }
  X.restore();
}
function boxProp(x, y, s, id, open = 0) { X.save(); X.translate(x, y); X.scale(s, s); shape(R(-34, -34, 68, 34), { lw: 2, id, h: [0.1, 3, 0.6] }); shape([[-34, -34], [-34 - 4, -34 - 24 * open], [34 - 4, -34 - 24 * open], [34, -34]], { lw: 2, id: id + 1, h: [0.5, 3, 0.7] }); X.restore(); }
function scroll(x, y, w, h, id) { shape(R(x - w / 2, y - h / 2, w, h), { lw: 1.8, id, fill: '#f4eedb' }); for (let i = 0; i < 4; i++) line([x - w / 2 + 8, y - h / 2 + 10 + i * 9], [x + w / 2 - 8 - 14 * (i % 2), y - h / 2 + 10 + i * 9], 1, id + 1 + i, 0.2); ball(x + w * 0.25, y + h * 0.28, 7, id + 6, PAT.d, 1.2); ink([[x - w / 2, y + h / 2], [x - w / 2 - 6, y + h / 2 + 24]], 1.6, id + 7, 0.3); ball(x - w / 2 - 6, y + h / 2 + 26, 3.4, id + 8, PAT.d, 0.8); }
function footDust(x, y, lt, id) { for (let i = 0; i < 3; i++) { const u = (lt * 3 + i / 3) % 1; X.save(); X.globalAlpha = (1 - u) * 0.6; X.beginPath(); X.arc(x - 24 - u * 34 + i * 4, y - 4 - u * 12, 3 + u * 5, 0, 6.2832); X.strokeStyle = P.ink; X.lineWidth = 1.2; X.stroke(); X.restore(); } }
function inkSplat(x, y, s, id, a = 1) { X.save(); X.globalAlpha = a; X.translate(x, y); X.scale(s, s); const p = blobPts(0, 0, 26, 20, id, 22, 0.35); path(p); X.fillStyle = P.ink; X.fill(); for (let i = 0; i < 9; i++) { const an = hash(id, i) * 6.28, r = 30 + hash(id + 1, i) * 24; X.beginPath(); X.arc(Math.cos(an) * r, Math.sin(an) * r * 0.8, 2 + hash(id + 2, i) * 4, 0, 6.2832); X.fill(); } X.restore(); }

/* ================================================================================================
   THE SCENES
   ================================================================================================ */
const wk = (lt, moving, sp = 9) => ({ walk: moving ? 1 : 0, ph: lt * sp });
const sgn = (v) => (v < 0 ? -1 : 1);
function crystalsOn(cx, cy, w, lt, id) { for (let i = 0; i < 12; i++) { const px = cx - w * 0.5 + i * w / 11, len = 40 + 70 * hash(id, i) + 5 * Math.sin(lt * 3 + i), py = cy + 8; line([px, py], [px, py + len], 1, id + 10 + i, 0.1); shape([[px, py + len], [px - 5, py + len + 10], [px, py + len + 22], [px + 5, py + len + 10]], { lw: 1.1, id: id + 40 + i, fill: P.paper, h: [0.7, 2.2, 0.8] }); } }
function comet2(x, y, s, id) { for (let i = 0; i < 4; i++) ink([[x, y + (i - 1.5) * 6 * s], [x + (70 + i * 14) * s, y + (i - 1.5) * 12 * s]], 1.6, id + i, 0.3); ball(x, y, 11 * s, id + 9, PAT.m, 1.6); }
const dipFade = (a, b) => { X.save(); X.setTransform(1, 0, 0, 1, 0, 0); X.fillStyle = P.paper; X.globalAlpha = clamp(a); X.fillRect(0, 0, W, H); X.restore(); };

const NOPAT = 'rgba(0,0,0,0)';
const FLOOR = 664, GY = 640, PURPLE = '#a58bc4', ROSE = '#c25d76', PALEROSE = '#e8c3cc', EMERALD = '#3f8a74', OCHRE = '#e0c27a', BRASS = '#d9b35c';
const U = (t, a, b) => clamp((t - a) / Math.max(0.01, b - a));
const Cq = (sh, k, i = 0) => cue(sh, k, i) || { at: 1e9, to: 1e9 };
const fulcrum = (sh) => sh.lines.find((l) => l.line);
const tightU = (sh, lt) => { const f = fulcrum(sh); return f ? seg(lt, f.t0 - 0.5, f.t0 + 0.3) * (1 - seg(lt, f.t1 + 0.1, f.t1 + 0.8)) : 0; };
const camMix = (a, b, u) => blendCam(a, b, E.io(clamp(u)));
const WIDE = ON(640, 360, 1.0);
/* the tightest camera, on a head */
const TIGHT = (hx, hy, z = 2.5) => ON(hx, hy - 12, z);
function withTight(sh, lt, c, hx, hy, z) { const u = tightU(sh, lt); return u > 0 ? camMix(c, TIGHT(hx, hy, z), u) : c; }
const shakeCam = (c, amt, lt) => (amt > 0.05 ? { z: c.z, x: c.x + Math.sin(lt * 71) * amt, y: c.y + Math.cos(lt * 57) * amt } : c);
const dipAt = (lt, t, w = 0.28) => { const d = Math.max(0, 1 - Math.abs(lt - t) / w); if (d > 0) dipFade(d); };
/* rotate drawing about a pivot */
function rotAbout(px, py, a, fn) { if (!a) return fn(); X.save(); X.translate(px, py); X.rotate(a); X.translate(-px, -py); fn(); X.restore(); }
function headPos(x, y, s, a = 0) { const r = rot(0, -286 * s, a); return [x + r[0], y + r[1]]; }
function handPos(x, y, s, f, ra) { const ex = 30 + Math.cos(ra[0]) * 62, ey = -214 + Math.sin(ra[0]) * 62; return [x + (ex + Math.cos(ra[1]) * 58) * s * f, y + (ey + Math.sin(ra[1]) * 58) * s]; }

/* ---------- the cast ---------- */
function armsFor(sh, who, lt, o) { const sp = sh ? talking(sh, who, lt) : false, e = sh ? sayAt(sh, who, lt) : 0; return { sp, e, ra: o.ra || (sp ? [-0.3 - e * 0.3, -0.2 - e * 0.4] : [1.5, 1.6]) }; }
function trurlF(x, y, s, sh, lt, o = {}) {
  const { sp, e, ra } = armsFor(sh, 'T', lt, o), f = o.f || 1;
  rotAbout(x, y, o.rot || 0, () => {
    constructor_(x, y, s, 400, { f, seated: o.seated, ra, la: o.la || [1.4, 1.65], open: sp ? 0.8 : 0, look: o.look ?? 1, lookY: o.lookY || 0, mouth: e, tilt: o.tilt || 0, walk: o.walk || 0, ph: o.ph || 0, robe: !!o.robe, robeFill: o.robe, closed: o.closed, stern: o.stern });
    X.save(); X.translate(x, y); X.scale(s * f, s);
    if (!o.robe && o.bag !== false) { line([-34, -226], [26, -120], 5, 450, 0.2); shape(R(14, -132, 36, 30), { lw: 1.8, id: 451, h: [0.5, 2.6, 0.6] }); }
    if (o.robe === EMERALD) { for (let i = 0; i < 9; i++) shape([[-30 + (i % 3) * 14, -210 + Math.floor(i / 3) * 30], [-24 + (i % 3) * 14, -218 + Math.floor(i / 3) * 30], [-18 + (i % 3) * 14, -210 + Math.floor(i / 3) * 30], [-24 + (i % 3) * 14, -202 + Math.floor(i / 3) * 30]], { lw: 0.9, id: 470 + i, fill: '#bfe3d3' }); }
    X.restore();
    if (o.baton) { const h = handPos(x, y, s, f, ra); line(h, [h[0] + Math.cos(o.baton) * 70 * s, h[1] + Math.sin(o.baton) * 70 * s], 4, 480, 0.1); ball(h[0] + Math.cos(o.baton) * 74 * s, h[1] + Math.sin(o.baton) * 74 * s, 7 * s, 481, PAT.m, 1.2); }
    if (o.cup) { const h = handPos(x, y, s, f, ra); ball(h[0], h[1], 10 * s, 482, PAT.f, 1.4, BRASS); }
  });
}
/* a crowned figure: King Protuberon in purple with a plume and medals, the Emperor in ochre with a tall crown */
function monarch(x, y, s, id, who, sh, lt, o = {}) {
  const f = o.f || 1, { sp, e } = armsFor(sh, who, lt, o), ra = o.ra || (sp ? [0.1 - e * 0.5, -0.5 - e * 0.4] : [1.5, 1.6]);
  if (o.seated) { const x0 = Math.min(x - 44 * s, x + f * 80 * s), x1 = Math.max(x - 44 * s, x + f * 80 * s); shape(R(x0 - 10, y - 124 * s, x1 - x0 + 20, 124 * s), { lw: 1.8, id: id + 300, h: [Math.PI / 2, 3, 0.6] }); }
  constructor_(x, y, s, id, { robe: true, robeFill: o.fill || PURPLE, f, seated: o.seated, ra, la: o.la || [1.4, 1.65], open: sp ? 0.8 : 0, look: o.look ?? 1, lookY: o.lookY || 0, mouth: o.smile ? Math.max(e, 0.35) : e, tilt: o.tilt || 0, stern: !o.smile });
  const hx = x, hy = y - 286 * s;
  if (who === 'E') { const p = [[-26, 0], [-24, -50], [-10, -34], [0, -62], [10, -34], [24, -50], [26, 0]].map(([a, b]) => [hx + a * 1.15 * s, hy - 34 * s + b * 1.15 * s]); shape(p, { lw: 1.6, id: id + 400, fill: OCHRE, h: [0.3, 2.4, 0.5] }); star(hx, hy - 34 * s - 76 * s, 14 * s, id + 410, P.ink, 8); }
  else { crown(hx, hy - 36 * 0.95 * s, 1.15 * s, id + 400); for (let i = 0; i < 4; i++) ink([[hx, hy - 78 * s], [hx + f * (6 + i * 7) * s, hy - 110 * s - Math.sin(i) * 8 * s], [hx + f * (14 + i * 9) * s, hy - 100 * s + i * 8 * s]], 1.6, id + 410 + i, 0.3); for (let i = 0; i < 5; i++) ball(x + f * (-18 + i * 9) * s, y - 206 * s + (i % 2) * 8 * s, 4.2 * s, id + 420 + i, PAT.f, 1); }
  if (o.quill) { const h = handPos(x, y, s, f, ra); ink([h, [h[0] + 26 * s, h[1] - 46 * s]], 2, id + 450, 0.2); ink([[h[0] + 8 * s, h[1] - 14 * s], [h[0] + 30 * s, h[1] - 40 * s], [h[0] + 20 * s, h[1] - 50 * s]], 1.2, id + 451, 0.3); }
}
function nightSky(id = 8000) { hatchSky(PY0 - 400, 760, -500, 1800); for (let i = 0; i < 70; i++) { const sx = -300 + hash(id, i) * 1900, sy = -200 + hash(id + 1, i) * 760; X.fillStyle = P.paper; const z = 1.6 + 2 * hash(id + 2, i); X.fillRect(sx, sy, z, z); } }
function lawn(y, id = 8200) { X.fillStyle = P.paper; X.fillRect(PX0 - 500, y, PX1 - PX0 + 1000, 600); for (let yy = y + 3, k = 0; yy < 820; yy += 5 + k * 0.6, k++) { X.fillStyle = P.ink; X.fillRect(PX0 - 500, yy, PX1 - PX0 + 1000, 0.6 + k * 0.06); } line([PX0 - 500, y], [PX1 + 500, y], 2.4, id, 0.3); }
function chair(x, y, s, id, f = 1) { shape(R(x - 50 * s, y - 128 * s, 100 * s, 16 * s), { lw: 1.6, id, h: [0.1, 3, 0.6] }); for (const d of [-1, 1]) shape(R(x + d * 40 * s - 5, y - 112 * s, 10, 112 * s), { lw: 1.4, id: id + 1 + d, h: [Math.PI / 2, 2.4, 0.6] }); shape(R(x - f * 50 * s - 6, y - 280 * s, 12, 160 * s), { lw: 1.6, id: id + 4, h: [Math.PI / 2, 2.4, 0.6] }); }
function bookshelf(x, y, w, h, id) { shape(R(x - w / 2, y - h, w, h), { lw: 2, id, fill: P.paper, h: [Math.PI / 2, 4, 0.4] }); for (let r = 0; r < 4; r++) { const sy = y - h + 14 + r * (h - 20) / 4; line([x - w / 2, sy + (h - 20) / 4 - 4], [x + w / 2, sy + (h - 20) / 4 - 4], 2.4, id + 1 + r, 0.2); for (let i = 0; i < 9; i++) { const bw = 8 + 6 * hash(id + r, i), bx = x - w / 2 + 6 + i * (w - 12) / 9; shape(R(bx, sy + 4 + hash(id + 9, i) * 8, bw, (h - 20) / 4 - 12 - hash(id + 9, i) * 8), { lw: 1, id: id + 20 + r * 10 + i, fill: i % 3 ? P.paper : '#d8d2c0', h: i % 2 ? [0, 2.2, 0.6] : undefined }); } } }
function herald(x, y, s, id, o = {}) { micro(x, y, s, id, { f: o.f || 1, wave: 0, look: o.f || 1 }); const f = o.f || 1, a = o.up ? -0.4 : 0.2, hx = x + f * 8 * s, hy = y - 46 * s; ink([[hx, hy], [hx + f * Math.cos(a) * 40 * s, hy + Math.sin(a) * 40 * s]], 2.4, id + 50, 0.1); shape([[hx + f * Math.cos(a) * 38 * s, hy + Math.sin(a) * 38 * s - 9 * s], [hx + f * Math.cos(a) * 52 * s, hy + Math.sin(a) * 52 * s - 14 * s], [hx + f * Math.cos(a) * 52 * s, hy + Math.sin(a) * 52 * s + 14 * s], [hx + f * Math.cos(a) * 38 * s, hy + Math.sin(a) * 38 * s + 9 * s]], { lw: 1.2, id: id + 51, fill: P.amber }); }
function goblet(x, y, s, id) { shape([[x - 7 * s, y - 26 * s], [x + 7 * s, y - 26 * s], [x + 3 * s, y - 12 * s], [x - 3 * s, y - 12 * s]], { lw: 1.2, id, fill: P.amber }); line([x, y - 12 * s], [x, y - 2 * s], 1.4, id + 1, 0.1); line([x - 6 * s, y - 2 * s], [x + 6 * s, y - 2 * s], 1.4, id + 2, 0.1); }

/* ================================================================================================
   A GOOD SHELLACKING
   The device: equality against identity. trurlF() is the only routine that draws a Trurl, with one fixed set of ids, so the
   Trurl who climbs out of the machine and the Trurl at home are the same drawing down to the wobble of the ink. Nothing in the
   picture marks either one as the copy; the only evidence is what each says, and what Klapaucius chooses to believe.
   ================================================================================================ */
const BLUE = '#5b84b8', CANVAS = '#e6dcc2', SHOP_FLOOR = 664;
const swingDur = 0.42;
/* the swing of a tool toward a hit at time h: -1 raised, +1 struck, 0 rest */
function swingAt(lt, hits) {
  for (const h of hits) { if (lt >= h - swingDur && lt < h) return -E.out((lt - (h - swingDur)) / swingDur); if (lt >= h && lt < h + 0.5) return 1 - E.in((lt - h) / 0.5); }
  return 0;
}
const lerp2 = (a, b, u) => [lerp(a[0], b[0], u), lerp(a[1], b[1], u)];
function armSwing(u, rest, up, down) { return u < 0 ? lerp2(rest, up, -u) : lerp2(rest, down, u); }
const wAng = (a, f) => (f > 0 ? a : Math.PI - a);

/* ---------- the wish machine; with legs:3 and unfinished, Klapaucius's own ---------- */
function wishM(x, y, s, lt, o = {}) {
  if (SILENT) return;
  const f = o.f || 1, id = o.id || 3000, nl = o.legs || 4, wk = o.walk || 0, ph = o.ph || 0, door = o.door || 0;
  const jx = o.hum ? Math.sin(lt * 70) * o.hum * 1.6 : 0, bob = wk ? Math.abs(Math.sin(ph)) * 8 * wk : 0;
  X.save(); X.translate(x + jx, y - bob); X.scale(s * f, s);
  const legX = nl === 4 ? [-46, -16, 16, 46] : [-40, 0, 40];
  // legs: the back ones first
  legX.forEach((lx, i) => {
    if (nl === 4 && (i === 1 || i === 2) === false) return;
    const sw = Math.sin(ph + i * 1.7) * 12 * wk, lift = Math.max(0, Math.cos(ph + i * 1.7)) * 9 * wk;
    cap(lx * 0.8, -40, lx * 0.8 + sw, -6 - lift, 13, id + 10 + i); shape(R(lx * 0.8 + sw - 11, -8 - lift, 24, 8), { fill: P.ink, lw: 0.8, id: id + 20 + i });
  });
  legX.forEach((lx, i) => {
    if (nl === 4 && (i === 1 || i === 2)) return;
    const sw = Math.sin(ph + i * 1.7 + 1) * 12 * wk, lift = Math.max(0, Math.cos(ph + i * 1.7 + 1)) * 9 * wk;
    cap(lx, -38, lx + sw, -2 - lift, 15, id + 30 + i); shape(R(lx + sw - 13, -5 - lift, 28, 9), { fill: P.ink, lw: 0.8, id: id + 40 + i });
  });
  // the pot belly
  const bp = blobPts(0, -98, 72, 62, id + 50, 36, 0.025);
  shape(bp, { lw: 2.2, id: id + 50, fill: o.fill || '#ddd2b6', sh: [[18, -170], [80, -170], [80, -30], [18, -30]], sh2: [1.5, 2.6, 0.7] });
  if (o.paint > 0) { X.save(); path(bp); X.clip(); X.fillStyle = BLUE; X.fillRect(-80, -170, 160 * clamp(o.paint), 150); hatch(1.5, 3.2, 0.5, [-80, -170, -80 + 160 * clamp(o.paint), -20]); X.restore(); ink([...bp, bp[0]], 2.2, id + 50, 0.5); }
  line([-68, -112], [68, -112], 1, id + 51, 0.3);
  for (let i = 0; i < 7; i++) ball(-54 + i * 18, -112, 2.2, id + 52 + i, PAT.d, 0.8);
  if (o.back) { line([0, -158], [0, -40], 1.2, id + 60, 0.3); }
  else {
    // the belly door: hinged on the left; dark inside
    const dx = -27, dy = -100, dw = 54, dh = 52;
    shape(R(dx, dy, dw, dh), { lw: 2, id: id + 61, fill: P.ink });
    if (o.inside) o.inside();
    if (door < 0.98) { const w_ = dw * (1 - door); shape(R(dx, dy, w_, dh), { lw: 1.8, id: id + 62, fill: o.unfinished ? BLUE : '#cfc3a4', h: [Math.PI / 2, 4, 0.6] }); if (w_ > 14) ball(dx + w_ - 8, dy + dh / 2, 3.6, id + 63, PAT.d, 1); }
    else shape([[dx, dy], [dx - 30, dy - 6], [dx - 30, dy + dh + 6], [dx, dy + dh]], { lw: 1.6, id: id + 64, fill: '#cfc3a4', h: [Math.PI / 2, 4, 0.6] });
    // the speaker grill
    const m = o.mouth || 0; for (let i = 0; i < 3; i++) line([-12 - m * 4, -138 + i * 5], [12 + m * 4, -138 + i * 5], 1.4 + m * 1.5, id + 66 + i, 0.1);
  }
  // the little head
  X.beginPath(); X.ellipse(0, -160, 34, 22, 0, Math.PI, 0); X.closePath(); X.fillStyle = o.fill || '#ddd2b6'; X.fill(); X.lineWidth = 2; X.strokeStyle = P.ink; X.stroke();
  if (o.unfinished) { X.save(); X.beginPath(); X.ellipse(0, -160, 34, 22, 0, Math.PI, 0); X.closePath(); X.clip(); X.fillStyle = BLUE; X.fillRect(-34, -184, 34, 26); X.restore(); X.beginPath(); X.ellipse(0, -160, 34, 22, 0, Math.PI, 0); X.closePath(); X.lineWidth = 2; X.strokeStyle = P.ink; X.stroke(); }
  if (!o.back) for (const ex of [-12, 12]) { const lit = o.unfinished ? (ex < 0) : true; X.beginPath(); X.arc(ex, -170, 6, 0, 6.2832); X.fillStyle = lit ? P.amber : P.paper; X.fill(); X.lineWidth = 1.4; X.strokeStyle = P.ink; X.stroke(); if (lit) { X.fillStyle = P.ink; X.fillRect(ex - 1.5 + (o.look || 0) * 2, -172, 3, 3); } }
  line([0, -182], [o.ant || 0, -204], 1.4, id + 70, 0.1); ball(o.ant || 0, -207, 4, id + 71, PAT.f, 1, o.unfinished ? P.paper : P.red);
  if (o.unfinished) {
    // an open side panel, wires showing, one leg still bare metal
    shape([[30, -150], [64, -134], [66, -70], [34, -60]], { lw: 1.8, id: id + 80, fill: P.ink });
    for (let i = 0; i < 4; i++) { const pts = []; for (let j = 0; j <= 8; j++) pts.push([36 + j * 3.4, -140 + i * 18 + Math.sin(j * 1.6 + i) * 5]); ink(pts, 1.4, id + 81 + i, 0.4, P.paper); }
    shape([[70, -60], [104, -40], [96, -8], [64, -24]], { lw: 1.6, id: id + 90, fill: '#cfc3a4', h: [0.4, 3, 0.6] });
  }
  X.restore();
}
const wmDoor = (x, y, s, f = 1) => [x + f * 0 * s, y - 74 * s];

/* ---------- the five things out of the belly door ---------- */
function item(k, x, y, s, id) {
  X.save(); X.translate(x, y); X.scale(s, s);
  if (k === 0 || k === 3) { shape([[-16, -30], [16, -30], [12, 0], [-12, 0]], { lw: 1.6, id, fill: k === 0 ? BLUE : '#f6f1e2', h: k === 0 ? [1.5, 3, 0.5] : undefined }); X.beginPath(); X.arc(0, -30, 15, Math.PI, 0); X.lineWidth = 1.2; X.strokeStyle = P.ink; X.stroke(); X.beginPath(); X.ellipse(0, -30, 16, 4, 0, 0, 6.2832); X.fillStyle = k === 0 ? BLUE : '#f6f1e2'; X.fill(); X.stroke(); }
  else if (k === 1) { shape([[-20, -4], [18, -8], [20, 2], [-18, 6]], { lw: 1.4, id, fill: '#d9c38f' }); stip([[-20, -4], [18, -8], [20, 2], [-18, 6]], id + 3, 0.12, 1); }
  else if (k === 2) { ink([[-24, -6], [-24, -22], [-8, -22], [-8, 6], [8, 6], [8, -12], [24, -12]], 2.4, id, 0.2); ball(-24, -24, 4, id + 1, PAT.m, 1); line([24, -12], [42, -12], 1.4, id + 2, 0.1); for (let i = 0; i < 4; i++) line([28 + i * 4, -15], [30 + i * 4, -9], 0.8, id + 3 + i, 0.05); }
  else if (k === 4) { shape([[-4, -26], [4, -26], [3, -4], [0, 4], [-3, -4]], { lw: 1.2, id, fill: '#c8c2b4' }); shape(R(-9, -30, 18, 5), { lw: 1.2, id: id + 1, fill: '#c8c2b4' }); for (let i = 0; i < 5; i++) line([-4, -22 + i * 4], [4, -20 + i * 4], 0.8, id + 2 + i, 0.05); line([-5, -28], [5, -28], 1, id + 9, 0.05); }
  X.restore();
}
/* Klapaucius's machine from behind, as he works on it: no face, no door to see */
function myMachine(x, y, s, lt, o = {}) { wishM(x, y, s, lt, { id: 3400, legs: 3, back: true, paint: o.paint ?? 1, fill: '#ddd2b6' }); if (o.cover > 0) canvasOver(x, y, s, o.cover); }
function canvasOver(x, y, s, u) {
  // a canvas sheet dropped from above; three feet show under the hem
  const drop = (1 - E.out(clamp(u))) * 220;
  X.save(); X.translate(x, y - drop); X.scale(s, s);
  const p = [[-96, -16], [-88, -120], [-50, -176], [0, -228], [50, -176], [88, -120], [96, -16], [60, -26], [30, -12], [0, -24], [-30, -12], [-60, -26]];
  shape(p, { lw: 2, id: 3500, fill: CANVAS, h: [1.1, 6, 0.4], sh: [[10, -230], [100, -230], [100, -10], [10, -10]], sh2: [1.65, 3, 0.6] });
  for (let i = 0; i < 5; i++) ink([[-60 + i * 30, -20], [-46 + i * 22, -110], [-14 + i * 7, -200]], 1, 3510 + i, 0.6);
  X.restore();
}
/* a tool held in the hand: a brush, the crowbar, the club */
function tool(kind, h, a, s, id) {
  const ex = (L) => [h[0] + Math.cos(a) * L * s, h[1] + Math.sin(a) * L * s];
  if (kind === 'brush') { line(ex(-6), ex(44), 3, id, 0.1); ink([ex(44), ex(62)], 8 * s, id + 1, 0.1); ink([ex(48), ex(62)], 5 * s, id + 2, 0.1, BLUE); }
  if (kind === 'crowbar') { const t = ex(96); ink([ex(-14), t], 5 * s, id, 0.1); ink([t, [t[0] + Math.cos(a + 1.9) * 16 * s, t[1] + Math.sin(a + 1.9) * 16 * s]], 5 * s, id + 1, 0.1); ink([ex(-14), ex(96)], 1.6 * s, id + 2, 0.1, '#9a948a'); }
  if (kind === 'club') { const b = ex(-12), t = ex(118), nx = -Math.sin(a), ny = Math.cos(a); shape([[b[0] + nx * 5 * s, b[1] + ny * 5 * s], [t[0] + nx * 16 * s, t[1] + ny * 16 * s], [t[0] - nx * 16 * s, t[1] - ny * 16 * s], [b[0] - nx * 5 * s, b[1] - ny * 5 * s]], { lw: 2, id, fill: '#b49a78', h: [a + 0.2, 4, 0.5] }); }
}
/* Klapaucius: robed, stern brows; o.tool + o.ta (tool angle in figure space) */
function klapF(x, y, s, sh, lt, o = {}) {
  const sp = sh ? talking(sh, 'K', lt) : false, e = sh ? sayAt(sh, 'K', lt) : 0, f = o.f || 1;
  const ra = o.ra || (sp ? [0.1 - e * 0.5, -0.5 - e * 0.4] : [1.5, 1.6]);
  rotAbout(x, y, o.rot || 0, () => {
    constructor_(x, y, s, 600, { robe: true, robeFill: '#d6cdb5', f, seated: o.seated, ra, la: o.la || [1.4, 1.65], open: o.open ?? (sp ? 0.8 : 0), look: o.look ?? 1, lookY: o.lookY || 0, mouth: e, tilt: o.tilt || 0, walk: o.walk || 0, ph: o.ph || 0, stern: o.stern ?? true, closed: o.closed });
    if (o.tool) tool(o.tool, handPos(x, y, s, f, ra), wAng(o.ta ?? ra[1], f), s, 650);
  });
}
/* the one Trurl routine. o.tied, o.dents (count), o.patched, o.medal */
const DENTS = [[-10, -306], [14, -268], [-22, -206], [20, -188], [-6, -172], [24, -218], [-16, -262], [8, -318], [2, -196], [-28, -186]];
function trurlG(x, y, s, sh, lt, o = {}) {
  const f = o.f || 1;
  if (o.chair) chair(x, y, s, 4900, f);
  trurlF(x, y, s, sh, lt, o);
  X.save(); X.translate(x, y); X.scale(s * f, s);
  if (o.tied) for (let k = 0; k < 3; k++) { const yy = -150 - k * 24, pts = []; for (let j = 0; j <= 12; j++) { const u = j / 12; pts.push([-46 + u * 92, yy + Math.sin(u * Math.PI) * 9]); } X.save(); X.globalAlpha = o.tied; ink(pts, 3.4, 4950 + k, 0.4, '#8a6a3c'); X.restore(); }
  for (let i = 0; i < Math.min(o.dents || 0, DENTS.length); i++) { const [dx, dy] = DENTS[i]; X.beginPath(); X.arc(dx, dy, 6, 0.6, 2.6); X.lineWidth = 1.6; X.strokeStyle = P.ink; X.stroke(); line([dx - 4, dy + 1], [dx + 3, dy - 2], 0.8, 4960 + i, 0.2); }
  if (o.patched) for (const [dx, dy, w_, h_] of [[-14, -308, 14, 10], [10, -262, 12, 9], [-26, -212, 16, 11], [12, -186, 14, 10], [-4, -170, 12, 8]]) { X.save(); X.globalAlpha = o.patched; X.fillStyle = '#efe6cc'; X.fillRect(dx - w_ / 2, dy - h_ / 2, w_, h_); X.setLineDash([2, 2]); X.lineWidth = 0.9; X.strokeStyle = P.ink; X.strokeRect(dx - w_ / 2, dy - h_ / 2, w_, h_); X.setLineDash([]); X.restore(); }
  if (o.medal) { line([-6, -224], [0, -200], 2.4, 4980, 0.1, P.red); line([6, -224], [0, -200], 2.4, 4981, 0.1, BLUE); star(0, -190, 14 * o.medal, 4982, P.ink, 8); ball(0, -190, 7 * o.medal, 4983, PAT.f, 1.2, P.amber); }
  X.restore();
}
function rings(x, y, u, id) { if (u <= 0 || u >= 1) return; for (let i = 0; i < 4; i++) { const v = (u * 1.6 + i * 0.25) % 1; X.save(); X.globalAlpha = (1 - v) * (1 - u); X.beginPath(); X.ellipse(x, y, 40 + v * 110, 30 + v * 80, 0, 0, 6.2832); X.lineWidth = 2.2; X.strokeStyle = P.ink; X.stroke(); X.restore(); } }
function bang(x, y, u, id, r = 40) { if (u <= 0 || u >= 1) return; X.save(); X.globalAlpha = 1 - u; star(x, y, r * (0.6 + u), id, P.ink, 10); X.restore(); }

/* ---------- sets ---------- */
function grandfather(x, y, lt, id = 3700) { // y = floor
  shape(R(x - 46, y - 400, 92, 400), { lw: 2.2, id, fill: '#cdbf9e', h: [Math.PI / 2, 3.4, 0.5], sh: R(x + 12, y - 400, 34, 400), sh2: [Math.PI / 2, 2, 0.8] });
  shape([[x - 56, y - 400], [x, y - 446], [x + 56, y - 400]], { lw: 2, id: id + 1, fill: '#cdbf9e', h: [0.5, 3, 0.6] });
  X.beginPath(); X.arc(x, y - 350, 34, 0, 6.2832); X.fillStyle = '#f6f1e2'; X.fill(); X.lineWidth = 2; X.strokeStyle = P.ink; X.stroke();
  for (let i = 0; i < 12; i++) { const a = i / 12 * 6.2832; line([x + Math.cos(a) * 27, y - 350 + Math.sin(a) * 27], [x + Math.cos(a) * 31, y - 350 + Math.sin(a) * 31], i % 3 ? 1 : 2, id + 10 + i, 0.05); }
  const hm = GT / 60 * 6.2832 * 0.5 - 1.2, mn = GT / 60 * 6.2832 * 6 - 0.3;
  line([x, y - 350], [x + Math.cos(hm) * 16, y - 350 + Math.sin(hm) * 16], 2.6, id + 30, 0.05); line([x, y - 350], [x + Math.cos(mn) * 25, y - 350 + Math.sin(mn) * 25], 1.6, id + 31, 0.05);
  shape(R(x - 26, y - 290, 52, 200), { lw: 1.8, id: id + 40, fill: DARK });
  X.save(); path(R(x - 26, y - 290, 52, 200)); X.clip(); const a = Math.sin(GT * Math.PI) * 0.22; line([x, y - 290], [x + Math.sin(a) * 150, y - 290 + Math.cos(a) * 150], 2, id + 41, 0.1, P.paper); ball(x + Math.sin(a) * 160, y - 290 + Math.cos(a) * 160, 13, id + 42, PAT.f, 1.4, BRASS); X.restore();
}
function shopWindow(x, y, blind = 0.12, id = 3800, night = false) {
  shape(R(x - 130, y - 110, 260, 220), { lw: 2.6, id, fill: P.paper });
  X.save(); path(R(x - 120, y - 100, 240, 200)); X.clip(); if (night) hatchSky(y - 100, y + 100, x - 120, x + 120); else { X.globalAlpha = 0.5; skyLines(y - 100, y + 100, y + 300); X.globalAlpha = 1; }
  const bh = 200 * clamp(blind); shape(R(x - 122, y - 102, 244, bh + 2), { lw: 1.4, id: id + 1, fill: '#d8cdb0' }); for (let yy = y - 100 + 8; yy < y - 100 + bh; yy += 9) line([x - 120, yy], [x + 120, yy], 1, id + 2 + (yy | 0) % 40, 0.1);
  X.restore();
  line([x, y - 100], [x, y + 100], 2.6, id + 50, 0.2); line([x - 120, y], [x + 120, y], 2.6, id + 51, 0.2);
  shape(R(x - 132, y - 128, 264, 20), { lw: 1.8, id: id + 52, h: [0.1, 3, 0.6] }); ball(x + 100, y - 100 + 200 * clamp(blind) + 6, 4, id + 53, PAT.d, 1);
  for (const d of [-1, 1]) shape([[x + d * 132, y - 112], [x + d * 160, y - 112], [x + d * 168, y + 130], [x + d * 136, y + 124]], { lw: 1.6, id: id + 60 + d, fill: '#b9806a', h: [1.6, 4, 0.5] });
}
function workshop(lt, o = {}) {
  wallRoom(520, 2.8);
  shopWindow(720, 230, o.blind ?? 0.12, 3800, o.night);
  door(120, 520, 96, 200, 3850, { open: o.front || 0 });
  door(300, 520, 70, 150, 3860, { open: o.cellar || 0 });
  // the bench along the back wall, tools hanging
  table(470, 430, 180, 3870, 76); for (let i = 0; i < 5; i++) { line([400 + i * 34, 300], [400 + i * 34, 340 + (i % 2) * 14], 2.4, 3880 + i, 0.2); }
  grandfather(1110, 560, lt);
  if (o.night) { X.save(); X.globalAlpha = 0.42; X.fillStyle = '#1c1814'; X.fillRect(PX0 - 500, PY0 - 500, 2300, 1600); X.restore(); }
}
function cellarSet(lt) {
  wallRoomStone(lt);
  for (let i = 0; i < 8; i++) { const x0 = 30 + i * 46, y0 = 380 + i * 36; shape(R(x0, y0, 50, 700 - y0), { lw: 1.6, id: 7700 + i * 3, h: [Math.PI / 2, 4.2, 0.45], fill: P.paper }); line([x0, y0], [x0 + 46, y0], 2.4, 7730 + i, 0.3); }
  barrel(880, 600, 70, 7780); barrel(980, 610, 64, 7790); crate(1140, 640, 90, 7795);
}
const stairY2 = (x) => clamp((x - 30) / 368) * 284 + 380;
const yOn = (x) => (x < 398 ? stairY2(x) : SHOP_FLOOR);
const lampSw = (lt) => Math.sin(lt * 2.03) * 0.13;
function lamp(lt, px = 640) { const a = lampSw(lt), lx = px + Math.sin(a) * 210, ly = -20 + Math.cos(a) * 210; ink([[px, -60], [lx, ly]], 1.6, 7800, 0.1); shape([[lx - 34, ly + 26], [lx + 34, ly + 26], [lx + 14, ly], [lx - 14, ly]], { lw: 1.8, id: 7801, fill: P.ink }); ball(lx, ly + 32, 9, 7802, NOPAT, 1.2, P.amber, true); return [lx, ly]; }
function darkness(lx, a = 0.86) { if (SILENT) return; const cx = lx, cy = 560, rx = 430, ry = 330; X.save(); X.fillStyle = `rgba(22,19,16,${a * 0.5})`; X.beginPath(); X.rect(-1000, -1000, 3400, 3000); X.ellipse(cx, cy, rx, ry, 0, 0, 6.2832); X.fill('evenodd'); X.beginPath(); X.rect(-1000, -1000, 3400, 3000); X.ellipse(cx, cy, rx * 0.78, ry * 0.78, 0, 0, 6.2832); X.fill('evenodd'); X.restore(); X.save(); X.globalAlpha = 0.18; X.beginPath(); X.moveTo(lx - 34, 220); X.lineTo(lx + 34, 220); X.lineTo(cx + rx * 0.7, 700); X.lineTo(cx - rx * 0.7, 700); X.closePath(); X.fillStyle = '#f6eccd'; X.fill(); X.restore(); }
function trurlRoom(lt, o = {}) {
  wallRoom(520, 2.6);
  shopWindow(840, 250, 0.55, 3900);
  door(200, 520, 96, 200, 3950, { open: o.door || 0 });
  bookshelf(1120, 520, 180, 300, 3960);
}
function dim(a) { if (a <= 0) return; X.save(); X.globalAlpha = a; X.fillStyle = '#1c1814'; X.fillRect(PX0 - 600, PY0 - 600, 2500, 1800); X.restore(); }

/* ---------- 1. the gift ---------- */
const WMX = 960, KMX = 430;
SHOTS.gift = (lt, sd, sh) => {
  const L = sh.lines, kn = cue(sh, 'knock'), op = cue(sh, 'open'), st = cue(sh, 'step'), wk_ = cue(sh, 'work'), its = cues(sh, 'item').sort((a, b) => a.n - b.n), pt = cue(sh, 'paint'), cv = cue(sh, 'canvas'), ch = cue(sh, 'chair');
  const inside = lt >= st.at;
  const wmx = !inside ? 120 : lerp(150, WMX, E.io(U(lt, st.at, st.to))), wmy = !inside ? 520 : lerp(560, SHOP_FLOOR - 40, E.io(U(lt, st.at, st.at + 1.0)));
  const wms = !inside ? 0.62 : lerp(0.66, 0.86, E.io(U(lt, st.at, st.to)));
  // Klapaucius: to the door, back to his machine, then to the chair
  let kx = 330, kf = -1, ks = 0.82, seated = false, walking = false;
  if (lt < op.at) { kx = lerp(560, 300, E.io(U(lt, kn.at + 0.6, op.at))); walking = lt > kn.at + 0.6 && lt < op.at; }
  else if (lt < wk_.at) { kx = lerp(300, 560, E.io(U(lt, st.at + 1.2, wk_.at))); kf = lt < st.at + 1.2 ? -1 : 1; walking = lt > st.at + 1.2 && lt < wk_.at; }
  else if (lt < ch.at) { kx = 560; kf = -1; }
  else { kx = lerp(560, 760, E.io(U(lt, ch.at, ch.to))); kf = 1; walking = lt < ch.to; seated = lt >= ch.to; }
  const paint = U(lt, pt.at, cv.at), cover = U(lt, cv.at, cv.at + 0.9);
  const doorU = lt >= op.at ? clamp((lt - op.at) / 0.6) * (1 - U(lt, st.at + 1.4, st.at + 2.0)) : 0;
  const kHead = headPos(kx, SHOP_FLOOR, ks), wHead = [WMX, SHOP_FLOOR - 40 - 170 * 0.86];
  let c = camFor(lt, [[0, ON(260, 440, 1.6)], [L[2].t0 - 0.3, ON(220, 420, 1.9)], [L[3].t0, ON(640, 380, 1.0)], [L[5].t0 - 0.3, ON(800, 420, 1.35)], [L[9].t0 - 0.2, ON(760, 450, 1.25)],
    [its[1].at - 0.6, ON(700, 460, 1.15)], [cv.at - 0.4, ON(560, 440, 1.2)], [ch.to, ON(860, 430, 1.3)]], 1.0);
  c = withTight(sh, lt, c, kHead[0], kHead[1], 2.5);
  cam(c, () => {
    workshop(lt, { front: doorU });
    if (!inside) { X.save(); path(R(120 - 48, 320, 96, 200)); X.clip(); X.fillStyle = P.paper; X.fillRect(60, 300, 130, 240); X.globalAlpha = 0.5; skyLines(300, 520, 800); X.globalAlpha = 1; if (lt >= op.at) wishM(124, 520, 0.6, lt, { mouth: sayAt(sh, 'M', lt), look: 1 }); X.restore(); }
    myMachine(KMX, SHOP_FLOOR - 30, 0.95, lt, { paint, cover });
    // the delivered things, in a row on the floor by his machine
    its.forEach((c_, i) => { const u = U(lt, c_.at, c_.at + 0.9); if (u <= 0) return; const from = [WMX, SHOP_FLOOR - 40 - 74 * 0.86], to = [600 + i * 36 - (i === 0 ? 0 : 0), SHOP_FLOOR + 18 + (i % 2) * 6];
      const p = u < 1 ? [lerp(from[0], to[0], u), lerp(from[1], to[1], u) - Math.sin(u * Math.PI) * 110] : to; if (!(i === 0 && lt > pt.at && lt < cv.at)) item(i, p[0], p[1], 0.9, 3600 + i * 20); });
    const working = lt >= wk_.at && lt < ch.at, brush = working && lt >= pt.at;
    const wave = working ? Math.sin(lt * 5) * 0.3 : 0;
    if (seated) chair(kx, SHOP_FLOOR, ks, 3990, 1);
    klapF(kx, SHOP_FLOOR, ks, sh, lt, { f: kf, seated, walk: walking ? 1 : 0, ph: lt * 8, look: seated ? 1 : (lt >= L[5].t0 && lt < pt.at ? -1 : 1), ra: working && !talking(sh, 'K', lt) ? [0.2 + wave, -0.4 + wave] : undefined, tool: brush ? 'brush' : null, ta: -0.6 });
    if (inside) wishM(wmx, wmy, wms, lt, { mouth: sayAt(sh, 'M', lt), look: kx < wmx ? -1 : 1, f: 1, walk: lt < st.to ? 1 : 0, ph: lt * 11, door: its.reduce((m, c_) => Math.max(m, pulse(lt, c_.at - 0.45, 1.1)), 0) });
  });
  void wHead;
};

/* ---------- 2. the copy ---------- */
SHOTS.copy = (lt, sd, sh) => {
  const L = sh.lines, hm = cue(sh, 'hum'), op = cue(sh, 'open'), cl = cue(sh, 'climb'), tp = cues(sh, 'tap'), lk = cue(sh, 'look'), sr = cue(sh, 'stair');
  const out = lt >= cl.at, cu = U(lt, cl.at, cl.to);
  const ty = SHOP_FLOOR, tx = out ? lerp(WMX - 10, 820, E.io(cu)) : WMX, ts = out ? lerp(0.25, 0.82, E.out(clamp(cu * 1.6))) : 0;
  const ty2 = out ? lerp(SHOP_FLOOR - 70, SHOP_FLOOR, E.io(clamp(cu * 1.6))) : 0;
  const circle = U(lt, L[4].t0 + 0.2, L[4].t1 - 0.4);
  let kx = 760, kf = 1, seated = lt < L[1].t0 + 0.3, ksx = kx;
  if (!seated) { kx = lerp(760, 600, E.io(U(lt, L[1].t0 + 0.3, L[1].t0 + 1.5))); }
  if (circle > 0 && circle < 1) { kx = 820 + Math.cos(circle * 6.2832 + Math.PI) * 170; kf = Math.sin(circle * 6.2832 + Math.PI) > 0 ? -1 : 1; }
  else if (circle >= 1) { kx = 640; kf = 1; }
  const leave = U(lt, sr.at - 0.6, sd + 0.4);
  if (leave > 0) kx = lerp(kx, 330, E.io(leave));
  const txx = leave > 0 ? lerp(tx, 400, E.io(leave)) : tx;
  const tHead = headPos(820, SHOP_FLOOR, 0.82), wHead = [WMX, SHOP_FLOOR - 40 - 175 * 0.86];
  const fu = fulcrum(sh); let c = camFor(lt, [[0, ON(860, 430, 1.3)], [L[1].t0, ON(760, 440, 1.2)], [hm.at, ON(900, 470, 1.5)], [cl.at + 1.2, ON(800, 440, 1.25)], [L[5].t0, ON(720, 420, 1.35)], [lk.at - 0.3, ON(600, 430, 1.3)], [L[9].t0, ON(720, 420, 1.35)], [sr.at - 0.6, ON(560, 420, 1.1)]], 1.0);
  c = withTight(sh, lt, c, wHead[0], wHead[1] + 40, 2.6); void fu; void ksx;
  const taps = tp.map((q) => q.at);
  cam(c, () => {
    workshop(lt, { cellar: U(lt, sr.at - 0.4, sr.at + 0.4) });
    myMachine(KMX, SHOP_FLOOR - 30, 0.95, lt, { paint: 1, cover: 1 });
    for (let i = 0; i < 5; i++) if (i !== 0) item(i, 600 + i * 36, SHOP_FLOOR + 18 + (i % 2) * 6, 0.9, 3600 + i * 20);
    if (seated) chair(760, SHOP_FLOOR, 0.82, 3990, 1);
    const tapU = taps.reduce((m, t) => Math.max(m, pulse(lt, t - 0.1, 0.35)), 0);
    klapF(kx, SHOP_FLOOR, 0.82, sh, lt, { f: kf, seated, walk: !seated && ((circle > 0 && circle < 1) || (lt > L[1].t0 + 0.3 && lt < L[1].t0 + 1.5) || (leave > 0 && leave < 1)) ? 1 : 0, ph: lt * 8, look: kf, ra: tapU > 0 ? [-0.2 - tapU * 0.4, -0.2] : undefined });
    const wm = () => wishM(WMX, SHOP_FLOOR - 40, 0.86, lt, { mouth: sayAt(sh, 'M', lt), look: -1, hum: lt >= hm.at && lt < hm.to ? U(lt, hm.at, hm.to) : 0, door: lt < op.at ? 0 : lt < cl.to + 0.8 ? clamp((lt - op.at) / 0.4) : 1 - U(lt, cl.to + 0.8, cl.to + 1.3) });
    wm();
    if (out) { trurlG(txx, ty2 || ty, ts, sh, lt, { f: -1, look: lt >= lk.at && lt < lk.to ? -1 : (circle > 0 && circle < 1 ? (kx < 820 ? -1 : 1) : -1), closed: lt < L[5].t0 && Math.floor(lt * 3) % 4 === 0, walk: (cu > 0.3 && cu < 1) || (leave > 0 && leave < 1) ? 1 : 0, ph: lt * 8 });
      if (tapU > 0) bang(820 + 30, SHOP_FLOOR - 200, tapU, 4000, 16); }
  });
};

/* ---------- 3, 4, 5. the cellar ---------- */
const TCX = 560, KCX = 770;
const HITS = (sh) => cues(sh, 'hit').map((c) => c.at);
function cellarDraw(sh, lt, st) {
  cellarSet(lt);
  const lx = Math.sin(lampSw(lt)) * 210 + 640;
  if (st.trurl !== false) trurlG(st.tx ?? TCX, yOn(st.tx ?? TCX), 0.82, sh, lt, { f: 1, chair: st.chair !== false, seated: st.tseated ?? true, tied: st.tied ?? 1, dents: st.dents || 0, look: st.tlook ?? 1, lookY: st.tlookY || 0, tilt: st.ttilt || 0, ra: st.tra || [1.6, 1.4], la: st.tla || [1.5, 1.3], walk: st.twalk || 0, ph: lt * 8, closed: st.tclosed, rot: st.trot || 0 });
  if (st.k !== false) {
    if (st.kseated) barrel(KCX + 40, SHOP_FLOOR - 8, 60, 7785);
    klapF(st.kx ?? KCX, yOn(st.kx ?? KCX), 0.82, sh, lt, { f: st.kf ?? -1, seated: st.kseated, ra: st.kra, la: st.kla, tool: st.ktool, ta: st.kta, walk: st.kwalk || 0, ph: lt * 8, look: st.klook ?? -1 });
  }
  if (st.after) st.after();
  lamp(lt);
  darkness(lx, 0.86);
}
const tHeadC = headPos(TCX, SHOP_FLOOR, 0.82), kHeadC = headPos(KCX, SHOP_FLOOR, 0.82);
/* Klapaucius swinging a tool at Trurl's head: arm rest, raised, struck */
function swingState(lt, hits, kind) {
  const u = swingAt(lt, hits);
  const ra = armSwing(u, [0.5, 0.2], [-1.6, -2.3], [0.1, 0.6]);
  const imp = hits.reduce((m, h) => Math.max(m, lt >= h && lt < h + 0.45 ? 1 - (lt - h) / 0.45 : 0), 0);
  const la = kind === 'club' ? armSwing(u, [0.7, 0.3], [-1.5, -2.1], [0.2, 0.6]) : undefined;
  return { ra, la, ta: ra[1] + (kind === 'club' ? -0.2 : -0.4), imp };
}
SHOTS.cellar = (lt, sd, sh) => {
  const L = sh.lines, dn = cue(sh, 'down'), tr = cue(sh, 'trip'), ti = cue(sh, 'tie'), dr = cue(sh, 'drum'), si = cue(sh, 'sit');
  const hits = HITS(sh).concat([dr.at]);
  if (lt < ti.at) {
    const u = U(lt, dn.at, tr.at), kx = lerp(70, 470, u), tx = kx + 70, fall = E.in(U(lt, tr.at, tr.at + 0.4));
    const c = camFor(lt, [[0, ON(260, 400, 1.35)], [tr.at - 0.6, ON(460, 470, 1.35)]], 1.2);
    cam(c, () => {
      cellarSet(lt);
      const lx = Math.sin(lampSw(lt)) * 210 + 640;
      trurlG(tx, yOn(tx), 0.82, sh, lt, { f: 1, walk: u < 1 ? 1 : 0, ph: lt * 8, rot: fall * 1.35, look: -1 });
      klapF(kx, yOn(kx), 0.82, sh, lt, { f: 1, walk: u < 1 ? 1 : 0, ph: lt * 8, ra: [-0.2, 0.2] });
      if (lt >= tr.at + 0.35) bang(tx + 200, SHOP_FLOOR - 20, U(lt, tr.at + 0.35, tr.at + 0.8), 4010, 40);
      lamp(lt); darkness(lx, 0.86);
    });
    dipAt(lt, ti.at); return;
  }
  const crow = lt >= L[1].t0 + 0.8;
  const sw = swingState(lt, hits, 'crowbar');
  const dents = hits.filter((h) => lt >= h).length;
  const seated = lt >= si.at + 0.4, kx = seated ? KCX + 40 : KCX;
  const boot = lt >= L[8].t0 && lt < L[8].t1, drumU = U(lt, dr.at, dr.at + 1.8);
  let c = camFor(lt, [[ti.at, ON(640, 440, 1.15)], [L[2].t0 - 0.3, ON(640, 420, 1.3)], [L[4].t0 - 0.2, ON(TCX + 20, 380, 1.6)], [L[5].t0 + 0.5, ON(640, 430, 1.2)], [L[8].t0, ON(700, 420, 1.45)]], 0.9);
  c = withTight(sh, lt, c, kHeadC[0] + 40, kHeadC[1] + 0, 2.5);
  c = shakeCam(c, 6 * sw.imp, lt);
  cam(c, () => {
    cellarDraw(sh, lt, { tied: clamp((lt - ti.at) / 0.5), dents, ttilt: -0.25 * sw.imp + Math.sin(lt * 30) * 0.05 * drumU, tlook: 1, tclosed: sw.imp > 0.3 || (drumU > 0 && drumU < 0.5),
      kx, kseated: seated, kra: seated ? (boot ? [-0.6, -0.9] : [1.2, 1.0]) : (crow ? sw.ra : undefined), ktool: crow ? 'crowbar' : null, kta: seated ? 0.6 : sw.ta,
      after: () => { if (sw.imp > 0) bang(tHeadC[0] + 10, tHeadC[1] + 40, 1 - sw.imp, 4020, 46); if (!crow && lt > L[1].t0) { const u = U(lt, L[1].t0, L[1].t0 + 0.8); tool('crowbar', [lerp(1000, KCX - 30, u), lerp(660, 450, u)], -0.8, 0.82, 4030); } rings(tHeadC[0], tHeadC[1], drumU, 4040); } });
  });
};
SHOTS.claim = (lt, sd, sh) => {
  const L = sh.lines, cb = cue(sh, 'club'), sp = cue(sh, 'stop');
  const up = E.io(U(lt, cb.at - 0.3, cb.at + 0.7)), stand = lt >= L[1].t0 + 0.4, hold = 1 - 0.35 * U(lt, L[5].t0, L[5].t1);
  const kx = stand ? lerp(KCX + 40, KCX, U(lt, L[1].t0 + 0.4, L[1].t0 + 1.0)) : KCX + 40;
  const ra = stand ? lerp2([0.6, 0.4], [-1.65, -2.0], up * hold) : [1.2, 1.0], la = stand ? lerp2([0.8, 0.5], [-1.4, -1.8], up * hold) : undefined;
  let c = camFor(lt, [[0, ON(640, 430, 1.2)], [L[1].t0, ON(700, 380, 1.15)], [sp.at - 0.1, ON(600, 420, 1.35)], [L[5].t0 + 0.4, ON(640, 430, 1.2)]], 0.6);
  c = withTight(sh, lt, c, tHeadC[0], tHeadC[1], 2.6);
  cam(c, () => {
    cellarDraw(sh, lt, { tied: 1, dents: 5, tlook: 1, tlookY: lt < L[2].t0 ? 0.5 : 0, ttilt: lt >= sp.at && lt < sp.at + 1.5 ? 0.08 * Math.sin(lt * 40) : 0, kx, kseated: !stand, kra: ra, kla: la, ktool: stand && up > 0.05 ? 'club' : null, kta: ra[1] - 0.2,
      after: () => { if (!stand || up <= 0.05) tool('club', [KCX + 130, SHOP_FLOOR - 10], -1.25, 0.82, 4050); } });
  });
};
SHOTS.proof = (lt, sd, sh) => {
  const L = sh.lines, dp = cue(sh, 'drop'), sn = cue(sh, 'snore'), fr = cue(sh, 'free'), cl = cue(sh, 'climb'), ga = cue(sh, 'gallop'), wn = cue(sh, 'window');
  const hits = HITS(sh);
  if (lt < cl.at) {
    const sw = swingState(lt, hits, 'club');
    const raised = lt < hits[0] - swingDur ? 1 : 0;
    const dents = 5 + hits.filter((h) => lt >= h).length;
    const kexit = U(lt, L[5].t1 - 0.6, L[5].t1 + 2.8), kgone = lt > L[5].t1 + 2.8;
    const kx = kexit > 0 ? lerp(KCX, 120, E.io(kexit)) : KCX;
    const freeU = U(lt, fr.at, fr.to), texit = U(lt, fr.to, cl.at);
    const holdRa = lerp2([0.6, 0.4], [-1.65, -2.0], raised * 0.65), holdLa = lerp2([0.8, 0.5], [-1.4, -1.8], raised * 0.65);
    const dropped = lt >= dp.at;
    let c = camFor(lt, [[0, ON(640, 430, 1.2)], [L[2].t0, ON(620, 420, 1.3)], [L[3].t0 + 0.4, ON(640, 430, 1.15)], [L[5].t0, ON(560, 440, 1.1)], [sn.at, ON(TCX, 470, 1.5)], [fr.to - 0.3, ON(400, 440, 1.15)]], 1.0);
    c = withTight(sh, lt, c, kHeadC[0], kHeadC[1], 2.5);
    c = shakeCam(c, 6 * sw.imp, lt);
    cam(c, () => {
      const tx = texit > 0 ? lerp(TCX, 60, E.io(texit)) : TCX;
      cellarDraw(sh, lt, { tied: 1 - freeU, dents, tx, chair: true, tseated: texit <= 0 && freeU < 0.6, twalk: texit > 0 && texit < 1 ? 1 : 0, tlook: texit > 0 ? -1 : 1, ttilt: -0.25 * sw.imp + (freeU > 0 && freeU < 1 ? Math.sin(lt * 18) * 0.12 : 0), tclosed: sw.imp > 0.3 || (lt >= sn.at && lt < fr.at),
        k: !kgone, kx, kf: kexit > 0 ? -1 : -1, kwalk: kexit > 0 && kexit < 1 ? 1 : 0, kra: dropped ? undefined : (lt >= hits[0] - swingDur ? sw.ra : holdRa), kla: dropped ? undefined : (lt >= hits[0] - swingDur ? sw.la : holdLa), ktool: dropped ? null : 'club', kta: lt >= hits[0] - swingDur ? sw.ta : holdRa[1] - 0.2,
        after: () => { if (sw.imp > 0) bang(tHeadC[0] + 10, tHeadC[1] + 40, 1 - sw.imp, 4060, 46); if (dropped) tool('club', [KCX - 60, SHOP_FLOOR + 6], -0.15, 0.82, 4070); if (freeU > 0.5) for (let k = 0; k < 3; k++) ink([[TCX - 50 + k * 10, SHOP_FLOOR - 4 - k * 3], [TCX + 40 + k * 8, SHOP_FLOOR - 2]], 3, 4080 + k, 0.5, '#8a6a3c'); } });
    });
    dipAt(lt, cl.at); return;
  }
  if (lt < ga.at) {
    // the workshop at night: Trurl to the machine, and into its belly
    const u = U(lt, cl.at, ga.at - 0.3);
    cam(ON(820, 450, 1.25), () => {
      workshop(lt, { night: true, cellar: 1 - U(lt, cl.at + 0.4, cl.at + 0.8) });
      myMachine(KMX, SHOP_FLOOR - 30, 0.95, lt, { paint: 1, cover: 1 });
      const s_ = 0.82 * (1 - 0.75 * U(lt, cl.at + 0.7, ga.at - 0.3));
      wishM(WMX, SHOP_FLOOR - 40, 0.86, lt, { door: 1 - U(lt, ga.at - 0.4, ga.at - 0.1), look: -1 });
      if (u < 0.98) trurlG(lerp(780, WMX - 20, E.io(clamp(u * 1.4))), lerp(SHOP_FLOOR, SHOP_FLOOR - 70, U(lt, cl.at + 0.7, ga.at - 0.3)), s_, null, lt, { f: 1, walk: 1, ph: lt * 10, look: 1 });
      dim(0.2);
    });
    dipAt(lt, ga.at); return;
  }
  // outside: the machine gallops off; Klapaucius at the window upstairs
  const gu = U(lt, ga.at, wn.at + 1.0), zoom = E.io(U(lt, wn.at - 0.2, wn.at + 1.0));
  const HX = 470, WX = HX + 40, WY = GY - 250;
  const c = camMix(ON(640, 380, 1.0), ON(WX, WY, 2.6), zoom);
  cam(c, () => {
    X.fillStyle = P.paper; X.fillRect(PX0 - 500, PY0 - 500, 2300, 1600); nightSky(8000); lawn(GY);
    X.beginPath(); X.arc(1080, 120, 34, 0, 6.2832); X.fillStyle = P.paper; X.fill(); X.lineWidth = 1.6; X.strokeStyle = P.ink; X.stroke();
    shape(R(HX - 170, GY - 320, 340, 320), { lw: 2, id: 8300, h: [Math.PI / 2, 3.6, 0.5], sh: R(HX + 40, GY - 320, 130, 320), sh2: [Math.PI / 2, 2, 0.8] });
    shape([[HX - 196, GY - 320], [HX, GY - 430], [HX + 196, GY - 320]], { lw: 2, id: 8301, fill: P.paper, h: [0.5, 3, 0.7] });
    shape(R(HX - 110, GY - 140, 50, 56), { lw: 1.6, id: 8310, fill: P.ink }); door(HX - 10, GY, 70, 140, 8320, { open: 1 });
    dim(0.3);
    shape(R(WX - 46, WY - 44, 92, 88), { lw: 2, id: 8330, fill: P.amber });
    X.save(); path(R(WX - 46, WY - 44, 92, 88)); X.clip();
    const shake = lt >= wn.at + 1.0 ? Math.abs(Math.sin(lt * 14)) * 2.5 : 0;
    boxHead(WX, WY + 24 - shake, 1.0, 680, { look: 1, stern: false, closed: lt >= wn.at + 1.0 && Math.sin(lt * 7) > 0 });
    if (lt >= wn.at + 0.6) { ball(WX - 2, WY + 44 - shake, 11, 8340, PAT.f, 1.4); for (let i = 0; i < 4; i++) line([WX - 12 + i * 6, WY + 36 - shake], [WX - 14 + i * 6, WY + 26 - shake], 3, 8341 + i, 0.1); }
    X.restore(); line([WX, WY - 44], [WX, WY + 44], 2.4, 8350, 0.2); line([WX - 46, WY], [WX + 46, WY], 2.4, 8351, 0.2);
    const mx_ = lerp(HX + 40, 1400, E.in(gu));
    if (gu < 1) { wishM(mx_, GY + 40, 0.62, lt, { walk: 1, ph: lt * 16, look: 1 }); footDust(mx_ - 20, GY + 40, lt, 8360); }
  });
};

/* ---------- 6, 7. Trurl's house ---------- */
const TRX = 800, KHX = 470;
SHOTS.morning = (lt, sd, sh) => {
  const L = sh.lines, kn = cue(sh, 'knock'), op = cue(sh, 'open'), dk = cue(sh, 'dark'), mk = cue(sh, 'marks'), pk = cue(sh, 'poke');
  if (lt < dk.at) {
    // the door: Trurl opens it, and stands back in the dark
    const du = U(lt, op.at, op.at + 0.7);
    cam(ON(640, 380, 1.0), () => {
      X.fillStyle = P.paper; X.fillRect(PX0 - 500, PY0 - 500, 2300, 1600); X.save(); X.globalAlpha = 0.5; skyLines(PY0 - 300, GY, GY + 300); X.restore(); lawn(GY);
      for (let i = 0; i < 6; i++) { const tx_ = 60 + i * 230 + hash(8110, i) * 40; if (tx_ > 300 && tx_ < 980) continue; line([tx_, GY], [tx_, GY - 60], 3, 8120 + i, 0.2); ball(tx_, GY - 90, 40, 8140 + i, PAT.m, 1.6); }
      trurlHouseG(640, GY, du);
      klapF(lerp(1000, 760, E.io(U(lt, 0, kn.at))), GY, 0.6, sh, lt, { f: -1, walk: lt < kn.at ? 1 : 0, ph: lt * 8, ra: lt >= kn.at && lt < kn.to ? [-0.4 + 0.3 * Math.sin(lt * 30), -1.2] : undefined, look: -1 });
      if (du > 0.4) { X.save(); X.globalAlpha = clamp((du - 0.4) * 2); trurlG(640, GY, 0.52, null, lt, { f: 1, look: 1, lookY: 1, tilt: 0.12, patched: 0.0 }); X.restore(); }
    });
    dipAt(lt, dk.at); return;
  }
  const mu = U(lt, mk.at, mk.at + 0.8) * (1 - U(lt, mk.to + 0.6, mk.to + 1.4));
  const kHead = headPos(KHX, SHOP_FLOOR, 0.82), tHead = headPos(TRX, SHOP_FLOOR, 0.82);
  let c = camFor(lt, [[dk.at, ON(640, 420, 1.1)], [mk.at, ON(TRX - 10, 440, 2.0)], [mk.to + 0.6, ON(640, 420, 1.1)], [L[2].t0, ON(720, 420, 1.3)], [L[3].t0, ON(580, 420, 1.3)]], 1.0);
  c = withTight(sh, lt, c, kHead[0], kHead[1], 2.5);
  const pkU = pulse(lt, pk.at - 0.1, 0.5);
  cam(c, () => {
    trurlRoom(lt);
    chair(TRX, SHOP_FLOOR, 0.82, 3995, -1);
    trurlG(TRX, SHOP_FLOOR, 0.82, sh, lt, { f: -1, seated: true, look: talking(sh, 'T', lt) ? -1 : -0.3, lookY: talking(sh, 'T', lt) ? 0 : 1, tilt: talking(sh, 'T', lt) ? 0 : 0.14, patched: 0.55 + 0.45 * mu });
    klapF(KHX, SHOP_FLOOR, 0.82, sh, lt, { f: 1, look: 1, stern: false, ra: pkU > 0 ? [-0.1, -0.1 - pkU * 0.3] : undefined });
    dim(0.32);
  });
};
function trurlHouseG(x, y, du) {
  shape(R(x - 150, y - 250, 300, 250), { lw: 2, id: 8400, h: [Math.PI / 2, 3.6, 0.5], sh: R(x + 30, y - 250, 120, 250), sh2: [Math.PI / 2, 2, 0.8] });
  shape([[x - 176, y - 250], [x, y - 360], [x + 176, y - 250]], { lw: 2, id: 8401, fill: P.paper, h: [0.5, 3, 0.7] });
  for (const wx of [-95, 95]) shape(R(x + wx - 22, y - 200, 44, 50), { lw: 1.6, id: 8410 + wx, fill: P.ink });
  shape(R(x - 42, y - 160, 84, 160), { lw: 2.2, id: 8420, fill: DARK });
  if (du < 0.98) shape(R(x - 42, y - 160, 84 * (1 - du), 160), { lw: 2.2, id: 8421, h: [Math.PI / 2, 4.2, 0.7] });
}
const BOLTS = [[-40, 4, 0], [-18, 10, 1], [4, 2, 0], [22, 12, 1], [40, 6, 0], [-30, 16, 1], [10, 16, 0]];
function nutsBolts(x, y, s, lt, nudges, id = 4100) {
  BOLTS.forEach(([dx, dy, k], i) => {
    const sh_ = nudges.reduce((m, t) => m + E.out(U(lt, t, t + 0.6)) * (hash(id, i) * 20 + 4), 0);
    const px = x + (dx + sh_) * s, py = y + dy * s, a = hash(id + 1, i) * 6.28 + sh_ * 0.08;
    X.save(); X.translate(px, py); X.rotate(a); X.scale(s, s);
    if (k) { X.beginPath(); for (let j = 0; j < 6; j++) { const aa = j / 6 * 6.2832; X.lineTo(Math.cos(aa) * 7, Math.sin(aa) * 7); } X.closePath(); X.fillStyle = '#c8c2b4'; X.fill(); X.lineWidth = 1.3; X.strokeStyle = P.ink; X.stroke(); X.beginPath(); X.arc(0, 0, 3, 0, 6.2832); X.fillStyle = P.ink; X.fill(); }
    else { shape(R(-12, -3, 22, 6), { lw: 1.1, id: id + 10 + i, fill: '#c8c2b4' }); shape(R(-16, -6, 5, 12), { lw: 1.1, id: id + 20 + i, fill: '#c8c2b4' }); for (let q = 0; q < 4; q++) line([-8 + q * 5, -3], [-6 + q * 5, 3], 0.7, id + 30 + q, 0.05); }
    X.restore();
  });
}
SHOTS.bolts = (lt, sd, sh) => {
  const L = sh.lines, nu = cues(sh, 'nudge').map((c) => c.at), sg = cue(sh, 'sigh'), sk = cue(sh, 'shake');
  const tStand = lt >= sk.at - 0.6, su = E.io(U(lt, sk.at - 0.6, sk.at + 0.4));
  const tx = tStand ? lerp(TRX, 720, su) : TRX, kx = lt >= sk.at - 0.6 ? lerp(KHX, 570, su) : KHX;
  const tHead = headPos(TRX, SHOP_FLOOR, 0.82), shakeU = U(lt, sk.at + 0.3, sk.at + 0.6);
  let c = camFor(lt, [[0, ON(640, 420, 1.1)], [L[1].t0, ON(720, 420, 1.3)], [L[4].t0, ON(TRX - 70, 560, 1.9)], [L[5].t0, ON(640, 420, 1.05)]], 1.0);
  c = withTight(sh, lt, c, tHead[0], tHead[1], 2.6);
  const hs = lt >= sk.at + 0.3 && lt < sd ? Math.sin(lt * 14) * 0.08 : 0;
  cam(c, () => {
    trurlRoom(lt);
    chair(TRX, SHOP_FLOOR, 0.82, 3995, -1);
    nutsBolts(TRX - 100, SHOP_FLOOR + 30, 1.4, lt, nu);
    trurlG(tx, SHOP_FLOOR, 0.82, sh, lt, { f: -1, seated: !tStand, walk: su > 0 && su < 1 ? 1 : 0, ph: lt * 8, look: -1, lookY: lt >= L[4].t0 && lt < L[5].t0 ? 1 : 0, tilt: lt >= sg.at && lt < sg.at + 1.4 ? 0.15 : 0, patched: 0.55, ra: shakeU > 0 ? [0.25 + hs, 0.05 + hs] : undefined });
    klapF(kx, SHOP_FLOOR, 0.82, sh, lt, { f: 1, walk: su > 0 && su < 1 ? 1 : 0, ph: lt * 8, look: 1, stern: false, ra: shakeU > 0 ? [0.25 + hs, 0.05 + hs] : undefined });
    dim(0.28 * (1 - 0.5 * U(lt, sk.at, sk.at + 1.5)));
  });
};

/* ---------- 8. the medal ---------- */
SHOTS.medal = (lt, sd, sh) => {
  const L = sh.lines, te = cue(sh, 'tell'), co = cue(sh, 'court'), pi = cue(sh, 'pin'), fa = cue(sh, 'fanfare'), nw = cue(sh, 'news'), ho = cue(sh, 'home'), lk = cue(sh, 'lock'), bl = cue(sh, 'blinds'), rv = cue(sh, 'reveal');
  if (lt < co.at) {
    // Trurl telling the story, again and again
    cam(ON(640, 400, 1.05), () => {
      X.fillStyle = P.paper; X.fillRect(PX0 - 500, PY0 - 500, 2300, 1600); X.save(); X.globalAlpha = 0.45; skyLines(PY0 - 300, GY, GY + 300); X.restore();
      for (let i = 0; i < 5; i++) house(100 + i * 270, GY, 200, 210 + 40 * hash(8500, i), 8510 + i * 30);
      lawn(GY);
      const g = Math.sin(lt * 3.1);
      trurlG(460, GY, 0.82, null, lt, { f: 1, look: 1, ra: [-0.5 + 0.4 * g, -1.0 - 0.6 * Math.sin(lt * 4.3)], la: [1.2, 1.0 + 0.5 * g], patched: 0.3 });
      for (let i = 0; i < 6; i++) citizen(720 + i * 80 + (i % 2) * 20, GY + 10 + (i % 2) * 18, 1.5, 8600 + i * 30, { f: -1, look: -1, tilt: Math.sin(lt * 2 + i) * 0.05 });
      wishM(220, GY + 20, 0.55, lt, { look: 1 });
    });
    dipAt(lt, co.at); return;
  }
  if (lt < nw.at) {
    const kHead = headPos(980, SHOP_FLOOR - 36, 0.9), med = E.out(U(lt, pi.at, pi.at + 0.5));
    const up = lt >= fa.at && lt < fa.at + 1.3, droop = U(lt, fa.at + 1.3, fa.at + 3.0);
    const c = camFor(lt, [[co.at, ON(640, 380, 1.0)], [L[2].t0 - 0.3, ON(860, 380, 1.35)], [pi.at - 0.2, ON(680, 420, 1.5)], [fa.at + 0.6, ON(640, 380, 1.0)]], 0.9);
    cam(c, () => {
      wallRoom(520, 2.8);
      for (const x of [300, 980]) column(x, 150, 540, 54, 7000 + x);
      throne(1000, 600, 5900);
      monarch(1000, SHOP_FLOOR - 36, 0.9, 5950, 'R', sh, lt, { f: -1, seated: true, fill: PURPLE, look: -1, ra: lt >= pi.at - 0.6 && lt < pi.at + 0.8 ? [-0.2, -0.3] : undefined });
      for (let i = 0; i < 7; i++) courtier(380 + i * 60, 560 + (i % 2) * 10, 1.1, 5700 + i * 30, { f: 1, look: 1 });
      trurlG(680, SHOP_FLOOR, 0.86, sh, lt, { f: 1, look: 1, medal: med, patched: 0.3 });
      for (const [x, f] of [[90, 1], [1190, -1]]) {
        herald(x, SHOP_FLOOR + 6, 2.0, 7400 + x, { f, up });
      }
      void kHead;
    });
    dipAt(lt, nw.at); return;
  }
  if (lt < rv.at - 0.4) {
    // Klapaucius, in his workshop, with the news
    const home = lt >= ho.at, kx = home ? (lt < lk.at ? lerp(560, 190, E.io(U(lt, ho.at, lk.at - 0.2))) : lt < bl.at ? lerp(190, 640, E.io(U(lt, lk.at + 0.3, bl.at - 0.1))) : 640) : 560;
    const kf = home ? (lt < lk.at + 0.3 ? -1 : 1) : 1, blind = home ? lerp(0.12, 1, E.in(U(lt, bl.at, bl.to))) : 0.12;
    const kHead = headPos(560, SHOP_FLOOR, 0.82);
    const throwU = U(lt, L[3].t0, L[3].t0 + 0.5) * (1 - U(lt, L[3].t1 - 0.3, L[3].t1 + 0.3));
    let c = camFor(lt, [[nw.at, ON(600, 420, 1.25)], [L[3].t1 - 0.4, ON(580, 420, 1.3)], [ho.at, ON(640, 400, 1.0)], [bl.at - 0.2, ON(700, 330, 1.3)]], 0.9);
    c = withTight(sh, lt, c, kHead[0], kHead[1], 2.5);
    cam(c, () => {
      workshop(lt, { blind, front: 0 });
      myMachine(KMX, SHOP_FLOOR - 30, 0.95, lt, { paint: 1, cover: 1 });
      if (!home) scroll(680, SHOP_FLOOR + 10, 60, 40, 7660);
      klapF(kx, SHOP_FLOOR, 0.82, sh, lt, { f: kf, walk: home && ((lt < lk.at) || (lt > lk.at + 0.3 && lt < bl.at - 0.1)) ? 1 : 0, ph: lt * 8, look: kf, ra: throwU > 0 ? [-1.4 * throwU + 0.5 * (1 - throwU), -2.0 * throwU] : (lt >= bl.at && lt < bl.to ? [-1.2, -1.6] : undefined), la: throwU > 0 ? [-1.6 * throwU + 1.4 * (1 - throwU), -2.2 * throwU] : undefined });
      dim(0.35 * U(lt, bl.at, bl.to + 0.5));
    });
    dipAt(lt, rv.at - 0.4); return;
  }
  // the canvas comes off: his own machine, unfinished
  const pull = E.io(U(lt, rv.at, rv.at + 1.0)), push = E.io(U(lt, rv.at + 1.0, sd));
  const c = camMix(ON(KMX + 60, 450, 1.25), ON(KMX + 20, 470, 1.75), push);
  cam(c, () => {
    workshop(lt, { blind: 1 });
    wishM(KMX, SHOP_FLOOR - 30, 0.95, lt, { id: 3400, legs: 3, unfinished: true, fill: BLUE, look: 0 });
    if (pull < 1) { X.save(); X.translate(lerp(0, 260, pull), lerp(0, 120, pull)); X.rotate(pull * 0.5); canvasOver(KMX, SHOP_FLOOR - 30, 0.95, 1); X.restore(); }
    klapF(KMX + 240, SHOP_FLOOR, 0.82, sh, lt, { f: -1, look: -1, ra: pull < 1 ? [-0.6, -0.4] : [1.4, 1.5] });
    item(4, KMX + 120, SHOP_FLOOR + 14, 0.9, 3680);
    dim(0.3);
  });
};

/* ---------- title and end ---------- */
SHOTS.title = (lt, sd) => {
  X.fillStyle = P.paper; X.fillRect(0, 0, W, H);
  txt('A GOOD SHELLACKING', CX, 150, 70, {}); txt('two Trurls, and no way to tell which is which', CX, 222, 32, { italic: true }); txt('after Stanisław Lem, The Cyberiad', CX, 274, 22, { italic: true });
  const h1 = pulse(lt, 1.6, 0.5), h2 = pulse(lt, 3.0, 0.5);
  boxHead(500, 500 + h1 * 6, 1.6, 480, { look: 1, tilt: -0.1 * h1 }); boxHead(780, 500 + h2 * 6, 1.6, 480, { look: -1, tilt: 0.1 * h2 });
  bang(430, 430, U(lt, 1.6, 2.1), 9410, 40); bang(850, 430, U(lt, 3.0, 3.5), 9410, 40);
};
SHOTS.end = (lt, sd) => {
  X.fillStyle = P.paper; X.fillRect(0, 0, W, H); X.globalAlpha = seg(lt, 0.4, 1.6);
  txt('A GOOD SHELLACKING', CX, 120, 40, {}); txt('after Stanisław Lem, The Cyberiad', CX, 168, 24, { italic: true }); X.globalAlpha = 1;
  boxHead(500, 430, 1.4, 480, { look: 1 }); boxHead(780, 430, 1.4, 480, { look: -1 });
  nutsBolts(CX, 600, 2.0, lt, [2.2]);
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
  const fade = sh.shot === 'title' ? Math.max(1 - seg(lt, 0, 0.6), seg(lt, sd - 0.6, sd)) : sh.shot === 'end' ? 1 - seg(lt, 0, 0.5) : sh.shot === 'medal' ? seg(lt, sd - 1.2, sd) : sh.shot === 'gift' ? 1 - seg(lt, 0, 1.0) : 1 - seg(lt, 0, 0.3);
  if (fade > 0) { X.fillStyle = P.paper; X.globalAlpha = fade; X.fillRect(0, 0, W, H); X.globalAlpha = 1; }
  border();
};
(async () => {
  T = await (await fetch('timing/gs.json')).json();
  await document.fonts.ready; await Promise.all(['IM Fell English', 'IBM Plex Mono'].map((n) => document.fonts.load(`20px "${n}"`)));
  X = document.getElementById('film').getContext('2d');
  window.__NF = Math.ceil(T.dur * 24); window.__T = T; window.__ready = true;
})();
