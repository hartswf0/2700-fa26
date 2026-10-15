/* The Fifth Sally, or The Mischief of King Balerion: drawing. Same toolkit as the earlier films (ink.js plus the head of the Ferrix drawing file).
   The device: the voice stays with the mind, the picture stays with the body. Each body is a costume; each mind is a mark over the head. */
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
const FLOOR = 664, PURPLE = '#a58bc4';
const BODY = { K: { kind: 'king', id: 400 }, T: { kind: 'trurl', id: 500 }, L: { kind: 'klap', id: 600 }, S: { kind: 'sailor', id: 700 }, C: { kind: 'comm', id: 800 }, SK: { kind: 'skip', id: 900 }, CL: { kind: 'clock', id: 1000 } };
const MIND = {
  b: { tint: '#b3402c', hat: [[0.8, 4.4], [-0.8, 4.4]] },   // Balerion: a die, cross-hatched red
  t: { tint: '#4f7fbf', hat: [[0.62, 3.0]] },              // Trurl: a gear, diagonal blue
  k: { tint: '#c28b25', hat: [[0, 2.8]] },                 // Klapaucius: a star, level ochre lines
  s: { tint: '#3f8a74', hat: [[Math.PI / 2, 3.2]] },       // the sailor: an anchor, upright green lines
  c: { tint: '#c25d76', dots: true },                      // the commissioner: a badge, rose stipple
  x: { tint: '#7a6a55', rings: true },                     // the clock's mind: a bird, rings
};
const HELD = [-1.1, -1.5];     // the arm pose that holds the horns up beside the head
const hexa = (c, a) => c + a;
const bodyLine = (sh, b, lt) => sh.lines.find((l) => l.body === b && lt >= l.t0 - 0.08 && lt < l.t1 + 0.2);
const bodyEnv = (sh, b, lt) => { const l = bodyLine(sh, b, lt); if (!l || lt < l.t0 || lt >= l.t1) return 0; return l.env[Math.min(l.env.length - 1, Math.floor((lt - l.t0) * 24))] || 0; };
const lerpA = (a, b, u) => [lerp(a[0], b[0], u), lerp(a[1], b[1], u)];
const pulseU = (t, a, d) => (t < a || t > a + d ? 0 : Math.sin(Math.PI * (t - a) / d));

/* ---------- the marks ---------- */
function halo(m, cx, cy, r, a = 1) {
  const d = MIND[m]; if (!d || a <= 0) return;
  X.save(); X.globalAlpha = a; X.beginPath(); X.arc(cx, cy, r, 0, 6.2832); X.fillStyle = d.tint + '2a'; X.fill();
  X.save(); X.clip();
  if (d.hat) for (const [ang, sp] of d.hat) hatch(ang, sp, 1.0, [cx - r, cy - r, cx + r, cy + r], d.tint + 'd0');
  if (d.dots) { X.fillStyle = d.tint; for (let i = 0; i < 90; i++) { const an = hash(77, i) * 6.2832, rr = Math.sqrt(hash(78, i)) * r; X.fillRect(cx + Math.cos(an) * rr, cy + Math.sin(an) * rr, 2.4, 2.4); } }
  if (d.rings) { X.lineWidth = 1.1; X.strokeStyle = d.tint; for (let q = r * 0.22; q < r; q += r * 0.18) { X.beginPath(); X.arc(cx, cy, q, 0, 6.2832); X.stroke(); } }
  X.restore(); X.beginPath(); X.arc(cx, cy, r, 0, 6.2832); X.lineWidth = 1.7; X.strokeStyle = P.ink; X.stroke(); X.restore();
}
function ghostRing(cx, cy, r) { X.save(); X.setLineDash([6, 7]); X.beginPath(); X.arc(cx, cy, r, 0, 6.2832); X.lineWidth = 1.6; X.strokeStyle = P.ink; X.stroke(); X.setLineDash([]); X.restore(); }
const EMB = {
  b(x, y, r) { X.save(); X.translate(x, y); X.rotate(0.38); const q = r * 0.86; shape(R(-q, -q, 2 * q, 2 * q), { lw: 2.4, id: 8101, fill: P.paper }); X.fillStyle = P.ink; for (const [px, py] of [[-0.5, -0.5], [0, 0], [0.5, 0.5]]) { X.beginPath(); X.arc(px * q, py * q, r * 0.17, 0, 6.2832); X.fill(); } X.restore(); },
  t(x, y, r) { const pts = [], n = 8; for (let i = 0; i < n * 4; i++) { const a = i / (n * 4) * 6.2832, ph = i % 4, rr = ph < 2 ? r : r * 0.72; pts.push([x + Math.cos(a) * rr, y + Math.sin(a) * rr]); } shape(pts, { lw: 2.2, id: 8111, fill: P.paper }); X.beginPath(); X.arc(x, y, r * 0.3, 0, 6.2832); X.fillStyle = P.ink; X.fill(); },
  k(x, y, r) { const pts = []; for (let i = 0; i < 8; i++) { const a = i / 8 * 6.2832 - 1.5708, rr = i % 2 ? r * 0.3 : r * 1.2; pts.push([x + Math.cos(a) * rr, y + Math.sin(a) * rr]); } shape(pts, { lw: 2.2, id: 8121, fill: P.paper, h: [0.8, 2.6, 0.7] }); },
  s(x, y, r) { X.save(); X.lineCap = 'round'; X.lineWidth = 3.6; X.strokeStyle = P.ink; X.beginPath(); X.arc(x, y - r * 0.78, r * 0.2, 0, 6.2832); X.stroke(); X.beginPath(); X.moveTo(x, y - r * 0.58); X.lineTo(x, y + r * 0.85); X.stroke(); X.beginPath(); X.moveTo(x - r * 0.45, y - r * 0.28); X.lineTo(x + r * 0.45, y - r * 0.28); X.stroke(); X.beginPath(); X.arc(x, y + r * 0.1, r * 0.74, 0.12 * Math.PI, 0.88 * Math.PI); X.stroke(); X.restore(); },
  c(x, y, r) { const p = [[-0.8, -0.9], [0.8, -0.9], [0.8, 0.1], [0, 1.0], [-0.8, 0.1]].map(([a, b]) => [x + a * r, y + b * r]); shape(p, { lw: 2.4, id: 8131, fill: P.paper, h: [0, 2.6, 0.7] }); const st = []; for (let i = 0; i < 10; i++) { const a = i / 10 * 6.2832 - 1.5708, rr = i % 2 ? r * 0.2 : r * 0.5; st.push([x + Math.cos(a) * rr, y - r * 0.2 + Math.sin(a) * rr]); } shape(st, { lw: 0.8, id: 8132, fill: P.ink }); },
  x(x, y, r) { X.save(); X.translate(x, y); X.beginPath(); X.ellipse(-r * 0.1, r * 0.2, r * 0.78, r * 0.5, -0.25, 0, 6.2832); X.fillStyle = P.paper; X.fill(); X.lineWidth = 2.2; X.strokeStyle = P.ink; X.stroke(); X.beginPath(); X.moveTo(-r * 0.7, r * 0.05); X.lineTo(-r * 1.2, -r * 0.35); X.lineTo(-r * 0.85, r * 0.45); X.closePath(); X.fillStyle = P.ink; X.fill(); X.beginPath(); X.arc(r * 0.6, -r * 0.3, r * 0.32, 0, 6.2832); X.fillStyle = P.paper; X.fill(); X.stroke(); X.beginPath(); X.moveTo(r * 0.88, -r * 0.36); X.lineTo(r * 1.3, -r * 0.2); X.lineTo(r * 0.9, -r * 0.1); X.closePath(); X.fillStyle = P.ink; X.fill(); X.beginPath(); X.arc(r * 0.62, -r * 0.36, r * 0.07, 0, 6.2832); X.fill(); X.beginPath(); X.moveTo(-r * 0.3, r * 0.1); X.quadraticCurveTo(r * 0.1, -r * 0.1, r * 0.35, r * 0.2); X.lineWidth = 1.4; X.stroke(); X.restore(); },
};
function emblem(m, x, y, r, a = 1) {
  if (!EMB[m] || a <= 0) return; X.save(); X.globalAlpha = a;
  X.beginPath(); X.arc(x, y, r * 1.28, 0, 6.2832); X.fillStyle = P.paper; X.fill(); X.lineWidth = 1.4; X.strokeStyle = P.ink; X.stroke();
  X.beginPath(); X.arc(x, y, r * 1.28, 0, 6.2832); X.fillStyle = MIND[m].tint + '2e'; X.fill();
  EMB[m](x, y, r); X.restore();
}

/* ---------- the horns: a headband and two horns ---------- */
function drawHorns(x, y, sc, rt, o = {}) {
  if (SILENT) return;
  X.save(); X.translate(x, y); X.rotate(rt); X.scale(sc, sc);
  for (const d of [-1, 1]) {
    const L = [], Rg = [];
    for (let i = 0; i <= 12; i++) { const u = i / 12, sx = d * (14 + 24 * Math.pow(u, 1.35)), sy = -52 * u, w = 8.5 * (1 - u) + 0.6, nx = d * 0.72, ny = 0.3; L.push([sx - nx * w, sy - ny * w * 0.4]); Rg.push([sx + nx * w, sy + ny * w * 0.4]); }
    const pts = L.concat(Rg.reverse()); path(pts); X.fillStyle = P.ink; X.fill(); X.lineWidth = 1.2; X.strokeStyle = P.ink; X.stroke();
    X.beginPath(); for (let i = 1; i <= 7; i++) { const u = i / 12, sx = d * (14 + 24 * Math.pow(u, 1.35)) + d * 2.2, sy = -52 * u; i === 1 ? X.moveTo(sx, sy) : X.lineTo(sx, sy); } X.lineWidth = 1.6; X.strokeStyle = P.paper; X.stroke();
  }
  X.beginPath(); X.moveTo(-26, 3); X.quadraticCurveTo(0, 15, 26, 3); X.lineWidth = 7; X.strokeStyle = P.ink; X.stroke(); X.beginPath(); X.moveTo(-22, 2); X.quadraticCurveTo(0, 12, 22, 2); X.lineWidth = 1.6; X.strokeStyle = P.paper; X.stroke();
  if (o.hum) { X.lineWidth = 1.7; X.strokeStyle = P.ink; for (let i = 0; i < 7; i++) { const a = -1.5708 + (i - 3) * 0.42 + Math.sin(o.t * 22 + i * 2) * 0.05, r0 = 58 + 3 * Math.sin(o.t * 30 + i), r1 = r0 + 9 + 6 * hash(i, BOIL & 3); X.beginPath(); X.moveTo(Math.cos(a) * r0, -16 + Math.sin(a) * r0 * 0.9); X.lineTo(Math.cos(a) * r1, -16 + Math.sin(a) * r1 * 0.9); X.stroke(); } }
  X.restore();
}

/* ---------- geometry of an actor ---------- */
const HEADY = { clock: -226 }, EMBUP = { clock: 250, comm: 172, king: 152, skip: 140 };
function toW(a, lx, ly) {
  const y = a.y + (a.dy || 0); let px = a.x + lx * a.s * a.f, py = y + ly * a.s;
  if (a.rot) { const [rx, ry] = rot(px - a.x, py - y, a.rot); px = a.x + rx; py = y + ry; }
  return [px, py];
}
const headW = (a) => toW(a, a.hx || 0, (HEADY[a.kind] ?? -286) + (a.hy || 0));
const emblemW = (a) => { const h = headW(a); return [h[0], h[1] - (EMBUP[a.kind] ?? 138) * a.s]; };
function handW(a, ra) { const ex = 30 + Math.cos(ra[0]) * 62, ey = -214 + Math.sin(ra[0]) * 62; return toW(a, ex + Math.cos(ra[1]) * 58, ey + Math.sin(ra[1]) * 58); }

/* ---------- where the horns are ---------- */
function hornIntervals(sh) {
  const ev = [{ at: -1e9, w: sh.horns0.w, mode: sh.horns0.mode }].concat(cues(sh, 'horns')), out = [];
  ev.forEach((e, i) => { if (e.mode === 'held') out.push({ w: e.w, a: e.at, b: i + 1 < ev.length ? ev[i + 1].at : 1e9 }); });
  return out;
}
function holdU(sh, b, lt) { let u = 0; for (const h of hornIntervals(sh)) if (h.w === b) u = Math.max(u, seg(lt, h.a - 0.15, h.a + 0.4) * (1 - seg(lt, h.b - 0.1, h.b + 0.3))); return u; }
function hornLocOf(e, PM, lt) {
  if (e.mode === 'at') return { x: e.x, y: e.y, sc: e.sc || 0.95, rt: e.rot ?? 0.2 };
  const a = PM[e.w]; if (!a || !a.show) return null;
  if (e.mode === 'bag') { const p = toW(a, 34, -124); return { x: p[0], y: p[1], sc: a.s * 0.7, rt: (a.rot || 0) + 0.3 * a.f }; }
  if (e.mode === 'worn') { const p = toW(a, a.hx || 0, -286 - 34 + (a.hy || 0)); return { x: p[0], y: p[1], sc: a.s * 1.18, rt: (a.rot || 0) + (a.tilt || 0) * a.f }; }
  const p = handW(a, HELD); return { x: p[0], y: p[1] - 8 * a.s, sc: a.s * 1.18, rt: (a.rot || 0) - 0.25 * a.f, held: true };
}
function hornNow(sh, lt, PM) {
  const ev = cues(sh, 'horns'); let idx = -1; for (let i = 0; i < ev.length; i++) if (lt >= ev[i].at) idx = i;
  if (idx < 0) return hornLocOf(sh.horns0, PM, lt);
  const e = ev[idx], prevE = idx > 0 ? ev[idx - 1] : sh.horns0, to = hornLocOf(e, PM, lt), fr = hornLocOf(prevE, PM, lt);
  if (!to) return null; if (!fr) return to;
  const u = seg(lt, e.at, e.at + (e.dur ?? 0.5), E.io); if (u >= 1) return to;
  return { x: lerp(fr.x, to.x, u), y: lerp(fr.y, to.y, u) - 52 * Math.sin(Math.PI * u), sc: lerp(fr.sc, to.sc, u), rt: lerp(fr.rt, to.rt, u) + u * 6.28 * 0, held: to.held && u > 0.7 };
}

/* ---------- who is in which body ---------- */
function mindsAt(sh, lt) {
  const m = Object.assign({}, sh.own); let fly = null;
  for (const c of cues(sh, 'swap')) { const d = c.dur || 1.0; if (lt >= c.at + d) { const t = m[c.a]; m[c.a] = m[c.b]; m[c.b] = t; } else if (lt >= c.at) fly = c; }
  return { m, fly };
}
const shakeAmt = (sh, lt) => { let s = 0; for (const c of cues(sh, 'swap')) if (lt >= c.at && lt < c.at + 0.6) s += 7 * Math.exp(-(lt - c.at) * 8); return s; };
const shk = (c, sh, lt) => { const s = shakeAmt(sh, lt); return s > 0.1 ? { z: c.z, x: c.x + Math.sin(lt * 71) * s, y: c.y + Math.cos(lt * 57) * s } : c; };

/* ---------- the bodies ---------- */
function person(a, sh, lt) {
  const k = a.kind, id = BODY[a.b].id, y = a.y + (a.dy || 0);
  const e = bodyEnv(sh, a.b, lt), sp = !!bodyLine(sh, a.b, lt);
  let ra = a.ra || (sp ? [-0.3 - e * 0.3, -0.2 - e * 0.4] : [1.5, 1.6]);
  const hu = a.hu || 0; if (hu > 0) ra = lerpA(ra, HELD, hu);
  const la = a.la || [1.4, 1.65];
  const o = { f: a.f, ra, la, seated: a.seated, open: sp ? 0.8 : 0, look: a.look ?? 1, lookY: a.lookY || 0, mouth: a.mouth ?? e, tilt: a.tilt || 0, hx: a.hx || 0, hy: a.hy || 0, closed: a.closed, walk: a.walk || 0, ph: a.ph || 0, sway: a.sway || 0,
    robe: k === 'king' || k === 'klap', robeFill: k === 'king' ? PURPLE : undefined,
    hair: k === 'sailor' || k === 'comm' || k === 'skip' ? false : undefined, glasses: k === 'sailor' || k === 'comm' || k === 'skip' ? false : undefined, stern: k === 'king' || k === 'comm' ? true : undefined };
  X.save(); X.translate(a.x, y); X.rotate(a.rot || 0); X.translate(-a.x, -y);
  if (k === 'comm') { X.translate(a.x, y); X.scale(1.2, 1.04); X.translate(-a.x, -y); }
  constructor_(a.x, y, a.s, id, o);
  if (k === 'king') crown(a.x + (a.hx || 0) * a.s * a.f, y - 286 * a.s - 36 * 0.95 * a.s + (a.hy || 0) * a.s, 1.15 * a.s, id + 400);
  X.save(); X.translate(a.x, y); X.scale(a.s * a.f, a.s);
  if (k === 'king') {
    for (let i = 0; i < 7; i++) ball(-30 + i * 10, -226 + Math.abs(i - 3) * 1.5, 6.5, id + 460 + i, PAT.f, 1);
    if (a.scepter !== false && hu < 0.5) { const ex = 30 + Math.cos(ra[0]) * 62, ey = -214 + Math.sin(ra[0]) * 62, hx = ex + Math.cos(ra[1]) * 58, hy = ey + Math.sin(ra[1]) * 58; line([hx + 3, hy + 46], [hx + 3, hy - 138], 4.2, id + 470, 0.2); ball(hx + 3, hy - 148, 11, id + 471, PAT.m, 1.6); ball(hx + 3, hy - 148, 3, id + 472, PAT.d, 0.6); }
  } else if (k === 'trurl') {
    line([-34, -226], [26, -120], 5, id + 450, 0.2); shape(R(14, -132, 36, 30), { lw: 1.8, id: id + 451, h: [0.5, 2.6, 0.6] }); shape([[14, -132], [50, -132], [50, -122], [14, -122]], { lw: 1.4, id: id + 452, fill: P.ink });
  } else if (k === 'klap') {
    shape([[-12, -228], [6, -228], [14, -70], [-6, -70]], { lw: 1.6, id: id + 450, h: [1.5, 2.4, 0.8] }); shape([[6, -228], [20, -228], [30, -86], [14, -86]], { lw: 1.6, id: id + 451, h: [1.5, 2.0, 0.8] });
  } else if (k === 'sailor') {
    X.save(); path([[-38, -224], [38, -224], [28, -170], [-28, -170]]); X.clip(); X.fillStyle = P.ink; for (let yy = -222; yy < -168; yy += 10) X.fillRect(-42, yy, 84, 4.2); X.restore();
    X.save(); path([[-24, -140], [24, -140], [20, -116], [-20, -116]]); X.clip(); for (let yy = -139; yy < -116; yy += 9) X.fillRect(-28, yy, 56, 3.6); X.restore();
    shape([[-18, -226], [18, -226], [0, -194]], { lw: 1.4, id: id + 450, fill: P.ink }); shape([[-6, -222], [6, -222], [0, -210]], { lw: 1, id: id + 452, fill: P.paper });
    shape([[-27, -318], [27, -318], [26, -338], [10, -346], [-10, -346], [-26, -338]], { lw: 1.8, id: id + 453, h: [0.2, 2.6, 0.7] }); line([-28, -322], [28, -322], 3, id + 454, 0.2); ball(0, -352, 6, id + 455, PAT.m, 1.4);
    shape([[-12, -254], [12, -254], [8, -238], [0, -232], [-8, -238]], { lw: 1, id: id + 456, fill: P.ink });
  } else if (k === 'comm') {
    shape([[-26, -322], [26, -322], [23, -386], [-23, -386]], { lw: 2, id: id + 450, fill: '#d8d2c0', h: [1.4, 2.2, 0.9] }); shape(R(-32, -326, 64, 9), { lw: 1.6, id: id + 451, fill: P.ink }); ball(0, -352, 8, id + 452, PAT.m, 1.4);
    shape(R(-66, -238, 38, 17), { lw: 1.8, id: id + 453, fill: P.ink }); shape(R(28, -238, 38, 17), { lw: 1.8, id: id + 454, fill: P.ink }); for (let q = 0; q < 6; q++) { line([-64 + q * 6, -221], [-64 + q * 6, -212], 1.4, id + 455 + q, 0.1); line([30 + q * 6, -221], [30 + q * 6, -212], 1.4, id + 465 + q, 0.1); }
    for (const yy of [-214, -198, -182]) ball(0, yy, 4.6, id + 475 + yy, PAT.d, 1);
    line([-30, -142], [30, -142], 6, id + 480, 0.2); shape(R(-7, -149, 14, 14), { lw: 1.4, id: id + 481, fill: P.paper });
  } else if (k === 'skip') {
    shape([[-27, -320], [27, -320], [22, -350], [-22, -350]], { lw: 1.8, id: id + 450, fill: '#d8d2c0', h: [0.4, 2.8, 0.6] }); shape([[-27, -320], [38, -320], [34, -312], [-27, -312]], { lw: 1.6, id: id + 451, fill: P.ink }); ball(0, -334, 5, id + 452, PAT.d, 1);
    shape([[-25, -274], [25, -274], [20, -244], [0, -224], [-20, -244]], { lw: 1.4, id: id + 453, h: [1.4, 2.6, 0.5] });
    line([-34, -226], [34, -160], 4, id + 454, 0.2); for (const yy of [-214, -190]) ball(0, yy, 4.6, id + 455 + yy, PAT.d, 1);
  }
  X.restore(); X.restore();
}
function clockBody(a, sh, lt) {
  const y = a.y + (a.dy || 0), id = BODY.CL.id, s = a.s, e = bodyEnv(sh, 'CL', lt);
  X.save(); X.translate(a.x, y); X.scale(s * a.f, s);
  // weights on chains, hanging below the case
  for (const d of [-1, 1]) { const hang = 70 + (d > 0 ? 18 : 0) + 6 * Math.sin(lt * 1.2 + d); line([d * 46, -84], [d * 46, -84 + hang], 1.8, id + 1 + d, 0.3); X.beginPath(); X.ellipse(d * 46, -84 + hang + 22, 12, 24, 0, 0, 6.2832); X.fillStyle = P.paper; X.fill(); X.lineWidth = 2; X.strokeStyle = P.ink; X.stroke(); X.save(); X.clip(); hatch(0.9, 3, 0.8, [d * 46 - 14, -84 + hang - 4, d * 46 + 14, -84 + hang + 48]); X.restore(); }
  // case and roof
  shape(R(-78, -330, 156, 252), { lw: 2.6, id: id + 5, sh: R(30, -330, 48, 252), sh2: [Math.PI / 2, 2.6, 0.8], h: [Math.PI / 2, 5.5, 0.5] });
  shape([[-108, -326], [0, -420], [108, -326], [90, -318], [-90, -318]], { lw: 2.6, id: id + 6, h: [0.5, 3.4, 0.7], sh: [[0, -420], [108, -326], [90, -318], [0, -318]], sh2: [-0.5, 3, 0.8] });
  shape(R(-26, -400, 52, 54), { lw: 2, id: id + 7, fill: P.ink }); // the little door, open
  // the dial
  X.beginPath(); X.arc(0, -226, 56, 0, 6.2832); X.fillStyle = P.paper; X.fill(); X.lineWidth = 3; X.strokeStyle = P.ink; X.stroke(); X.beginPath(); X.arc(0, -226, 49, 0, 6.2832); X.lineWidth = 1; X.stroke();
  for (let i = 0; i < 12; i++) { const an = i / 12 * 6.2832; line([Math.cos(an) * 40, -226 + Math.sin(an) * 40], [Math.cos(an) * 47, -226 + Math.sin(an) * 47], i % 3 ? 1.4 : 2.6, id + 20 + i, 0.1); }
  const mn = -1.5708 + (lt * 0.5), hr = -1.5708 + lt * 0.04; line([0, -226], [Math.cos(mn) * 38, -226 + Math.sin(mn) * 38], 2.4, id + 40, 0.1); line([0, -226], [Math.cos(hr) * 26, -226 + Math.sin(hr) * 26], 3.8, id + 41, 0.1); ball(0, -226, 4, id + 42, PAT.d, 1);
  // a little window with a turning gear: the teeth
  shape(R(-30, -156, 60, 40), { lw: 1.6, id: id + 43, fill: P.paper }); X.save(); path(R(-30, -156, 60, 40)); X.clip(); const gp = []; for (let i = 0; i < 24; i++) { const an = i / 24 * 6.2832 + lt * 1.4, rr = (i % 2 ? 15 : 22); gp.push([Math.cos(an) * rr, -136 + Math.sin(an) * rr]); } shape(gp, { lw: 1.4, id: id + 44, fill: P.paper }); X.restore();
  // the pendulum
  const sw = 0.34 * Math.sin(lt * 4.4); X.save(); X.translate(0, -112); X.rotate(sw); line([0, 0], [0, 78], 2.2, id + 50, 0.1); ball(0, 90, 16, id + 51, PAT.m, 1.8); X.restore();
  // the bird
  const bird = a.bird || 0; if (bird > 0.02) {
    const bs = 0.45 + 0.75 * bird, by = -392 + 6 - 38 * bird; X.save(); X.translate(0, by); X.scale(bs * 1.6, bs * 1.6);
    X.beginPath(); X.ellipse(0, 0, 18, 12, -0.2, 0, 6.2832); X.fillStyle = P.paper; X.fill(); X.lineWidth = 1.8; X.strokeStyle = P.ink; X.stroke(); X.save(); X.clip(); hatch(0.5, 2.6, 0.7, [-20, -14, 20, 14]); X.restore();
    X.beginPath(); X.moveTo(-16, -1); X.lineTo(-30, -9); X.lineTo(-20, 8); X.closePath(); X.fillStyle = P.ink; X.fill();
    X.beginPath(); X.arc(13, -11, 8, 0, 6.2832); X.fillStyle = P.paper; X.fill(); X.stroke(); X.beginPath(); X.arc(15, -13, 1.7, 0, 6.2832); X.fillStyle = P.ink; X.fill();
    const bk = 0.2 + 0.8 * (a.beak ?? e); X.beginPath(); X.moveTo(20, -13); X.lineTo(34, -13 - 4 * bk); X.lineTo(21, -10); X.closePath(); X.fillStyle = P.ink; X.fill(); X.beginPath(); X.moveTo(20, -10); X.lineTo(34, -8 + 7 * bk); X.lineTo(21, -7); X.closePath(); X.fill();
    X.restore();
  }
  X.restore();
}
function drawBody(a, sh, lt) { X.save(); if (a.alpha != null) X.globalAlpha = clamp(a.alpha); if (a.kind === 'clock') clockBody(a, sh, lt); else person(a, sh, lt); X.restore(); if (a.after) a.after(a, lt); }

/* ---------- the stage: actors, props, marks, horns, and the butt ---------- */
function resolveA(sp, sh, lt) {
  const g = (v) => (typeof v === 'function' ? v(lt) : v), p = sp.pose ? (sp.pose(lt) || {}) : {};
  const a = Object.assign({ b: sp.b, kind: BODY[sp.b] ? BODY[sp.b].kind : 'trurl', x: g(sp.x), y: g(sp.y ?? FLOOR), s: g(sp.s ?? 0.95), f: g(sp.f ?? 1), rot: g(sp.rot ?? 0), dy: g(sp.dy ?? 0), show: sp.show ? sp.show(lt) : true, after: sp.after, alpha: sp.alpha ? sp.alpha(lt) : undefined }, p);
  a.hu = holdU(sh, a.b, lt); return a;
}
function stageDraw(sh, lt, list, o = {}) {
  const { m, fly } = mindsAt(sh, lt), PM = {}, items = [];
  for (const sp of list) { if (sp.prop) items.push({ prop: sp.prop }); else { const a = resolveA(sp, sh, lt); if (a.show) { PM[a.b] = a; items.push({ a }); } else PM[a.b] = Object.assign(a, { show: false }); } }
  // the butt: the one wearing the horns lunges at the other, who jerks back
  for (const c of cues(sh, 'swap')) {
    if (c.nolunge) continue; const A = PM[c.by], Bb = PM[c.by === c.a ? c.b : c.a]; if (!A || !Bb || !A.show || !Bb.show) continue;
    const dir = Math.sign(Bb.x - A.x) || 1, appr = dir * Math.max(0, Math.abs(Bb.x - A.x) - 132 * Math.max(A.s, Bb.s));
    const u1 = seg(lt, c.at - 0.5, c.at, E.in), r = seg(lt, c.at, c.at + 0.9, E.out);
    A.x += appr * u1 * (1 - 0.82 * r); A.rot = (A.rot || 0) + dir * 0.11 * u1 * (1 - r); A.tilt = (A.tilt || 0) + 0.3 * u1 * (1 - r);
    const pu = pulseU(lt, c.at, 0.45); Bb.x -= dir * 20 * pu; Bb.rot = (Bb.rot || 0) - dir * 0.08 * pu;
  }
  // halos first, behind everything
  for (const it of items) if (it.a) { const a = it.a, mm = m[a.b]; if (!mm || mm === 'n') continue; const h = headW(a), r = (a.kind === 'clock' ? 84 : 64) * a.s; const inF = fly && (fly.a === a.b || fly.b === a.b); if (inF) ghostRing(h[0], h[1], r); else halo(mm, h[0], h[1], r, 1); }
  for (const it of items) { if (it.prop) it.prop(lt); else drawBody(it.a, sh, lt); }
  // the emblems
  for (const it of items) if (it.a) { const a = it.a, mm = m[a.b]; if (!mm) continue; const inF = fly && (fly.a === a.b || fly.b === a.b); if (inF) continue; const [ex, ey] = emblemW(a); emblem(mm, ex, ey + 3 * Math.sin(lt * 2.6 + BODY[a.b].id), 25 * Math.max(0.9, a.s)); }
  if (fly) {
    const A = PM[fly.a], Bb = PM[fly.b], d = fly.dur || 1.0; if (A && Bb && A.show && Bb.show) {
      const p = E.io(clamp((lt - fly.at) / d)), ea = emblemW(A), eb = emblemW(Bb), mid = [(ea[0] + eb[0]) / 2, (ea[1] + eb[1]) / 2], sz = 25 * Math.max(0.9, A.s) * (1 + 0.5 * Math.sin(Math.PI * p));
      for (const [mm, from, to, lift] of [[m[fly.a], ea, eb, -125], [m[fly.b], eb, ea, -40]]) {
        const ctrl = [mid[0], mid[1] + lift];
        for (let q = 6; q >= 1; q--) { const pp = Math.max(0, p - q * 0.05), tp = bez(from, ctrl, to, pp); X.save(); X.globalAlpha = 0.55 * (1 - q / 7); X.beginPath(); X.arc(tp[0], tp[1], 4.2 * (1 - q / 8), 0, 6.2832); X.fillStyle = MIND[mm].tint; X.fill(); X.restore(); }
        const pos = bez(from, ctrl, to, p); emblem(mm, pos[0], pos[1], sz);
      }
      const hA = headW(A), hB = headW(Bb), fu = clamp((lt - fly.at) / 0.4);
      if (fu < 1) { const mx = (hA[0] + hB[0]) / 2, my = (hA[1] + hB[1]) / 2; X.save(); X.globalAlpha = 1 - fu; star(mx, my, 40 + 150 * fu, 9300, P.ink, 12); X.beginPath(); X.arc(mx, my, 20 + 130 * fu, 0, 6.2832); X.lineWidth = 3 * (1 - fu) + 0.5; X.strokeStyle = P.ink; X.stroke(); X.restore(); }
    }
  }
  // the horns: always drawn, always tracked
  const hn = hornNow(sh, lt, PM); if (hn && !o.noHorns) drawHorns(hn.x, hn.y, hn.sc, hn.rt, { hum: hn.held, t: lt });
  return PM;
}

/* ================= camera helpers ================= */
const fulcrum = (sh) => sh.lines.find((l) => l.line);
const tightU = (sh, lt) => { const f = fulcrum(sh); return f ? seg(lt, f.t0 - 0.5, f.t0 + 0.3) * (1 - seg(lt, f.t1 + 0.1, f.t1 + 0.8)) : 0; };
const camMix = (a, b, u) => blendCam(a, b, E.io(clamp(u)));
const cueU = (sh, k, lt, dur = 0.5, i = 0) => { const c = cue(sh, k, i); return c ? seg(lt, c.at, c.at + dur, E.out) : 0; };
const cueSpan = (sh, k, lt, i = 0) => { const c = cue(sh, k, i); return c ? seg(lt, c.at, c.to ?? c.at + 1, E.lin) : 0; };
const around = (sh, k, lt, a = 0, b = 0.5) => cues(sh, k).some((c) => lt >= c.at - a && lt < (c.to ?? c.at) + b);
const WIDE = ON(640, 360, 1.0);
/* the tightest camera: on the head of the body that speaks the fulcrum line, with the mark above it */
function tightOn(a) { const h = headW(a); return a.kind === 'clock' ? ON(h[0], h[1] - 150 * a.s, 1.8) : ON(h[0], h[1] - 38 * a.s, 2.35); }
function camScene(sh, lt, base, specs) {
  const f = fulcrum(sh); let c = base;
  if (f) { const u = tightU(sh, lt); if (u > 0) { const sp = specs.find((q) => !q.prop && q.b === f.body); if (sp) c = camMix(c, tightOn(resolveA(sp, sh, f.t0)), u); } }
  return shk(c, sh, lt);
}
const kfx = (lt, pts) => kf(lt, pts.map((p, i) => (i === 0 ? [p[0], p[1]] : [p[0], p[1], p[2]])));
const mover = (a, b, t0, t1, e = E.io) => (lt) => lerp(a, b, e(clamp((lt - t0) / Math.max(0.01, t1 - t0))));

/* ================= props ================= */
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
function bed(x, y, id) { shape(R(x - 190, y - 70, 380, 70), { lw: 2.2, id, h: [0.1, 3.4, 0.7] }); shape(R(x - 198, y - 150, 24, 150), { lw: 2.2, id: id + 1, h: [Math.PI / 2, 3, 0.7] }); shape(R(x + 174, y - 112, 24, 112), { lw: 2.2, id: id + 2, h: [Math.PI / 2, 3, 0.7] }); shape(R(x - 172, y - 100, 346, 30), { lw: 1.8, id: id + 3, fill: PURPLE, h: [0.5, 3, 0.6] }); }
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

/* ---------- 1. the court ---------- */
SHOTS.court = (lt, sd, sh) => {
  const hop = cue(sh, 'hop'), hide = cue(sh, 'hide'), cnt = cue(sh, 'count'), sc = cue(sh, 'scatter'), lamp = cue(sh, 'lamp'), drop = cue(sh, 'drop'), thr = cue(sh, 'throne'), ask = cue(sh, 'ask'), ans = cue(sh, 'answer'), bk = cue(sh, 'books');
  const L = sh.lines, PIL = 860, TH = 1130, walkK = Math.max(thr.at + 0.3, drop.at + 0.7);
  const u = (t, a, b) => clamp((t - a) / Math.max(0.01, b - a));
  const kx = (t) => t < hop.to ? lerp(330, 700, E.lin(u(t, hop.at, hop.to))) : t < hide.at ? 700 : t < hide.to ? lerp(700, PIL + 90, E.io(u(t, hide.at, hide.to))) : t < lamp.at ? PIL + 90 : t < walkK ? 640 : lerp(640, 1010, E.io(u(t, walkK, walkK + 1.5)));
  const ky = (t) => t < lamp.at ? FLOOR : t < drop.at ? 470 : t < drop.at + 0.65 ? lerp(470, FLOOR, E.in(u(t, drop.at, drop.at + 0.65))) : FLOOR;
  const ks = (t) => t < lamp.at ? 0.95 : t < drop.at ? 0.62 : t < drop.at + 0.65 ? lerp(0.62, 0.95, E.in(u(t, drop.at, drop.at + 0.65))) : 0.95;
  const hanging = lt >= lamp.at && lt < drop.at;
  const kRun = (lt >= hide.at && lt < hide.to) || (lt >= walkK && lt < walkK + 1.5);
  const CH = [150, 230, 310, 390, 1090, 1170, 1230, 560];
  const courtPos = (i, t) => {
    const home = CH[i], ph = hash(31, i) * 6.28, left = home < 640;
    if (t < cnt.at) return { x: home, f: left ? 1 : -1, look: left ? 1 : -1, mouth: t > hop.at && t < hop.to ? 0.5 + 0.5 * Math.sin(t * 9 + i) : 0, bob: t > hop.at && t < hop.to ? 0.3 * Math.abs(Math.sin(t * 6 + i)) : 0 };
    if (t < sc.at) return { x: home, f: -1, look: -1, wave: 0.9, bob: 0.5 * pulseU(t % 0.62, 0, 0.3) };
    const D = t - sc.at, dir = hash(33, i) > 0.5 ? 1 : -1, sp = 190 + 120 * hash(34, i);
    const px = (tt) => { const d = tt - sc.at; const a = home + dir * sp * (1 - Math.exp(-d * 1.1)) * 0.9; return clamp(a + 160 * Math.sin(d * (1.3 + 0.5 * hash(35, i)) + ph) * seg(d, 1.2, 3), 90, 1190); };
    let x = px(t);
    if (t >= walkK) { const tx = 190 + i * 76; x = lerp(px(walkK), tx, E.io(u(t, walkK + 0.3, walkK + 1.9))); }
    const v = px(t + 0.06) - px(t - 0.06);
    const moving = t < walkK + 1.9 && D < 40;
    const inRiddle = t >= walkK + 1.9;
    return { x, f: inRiddle ? 1 : (Math.abs(v) < 0.3 ? 1 : sgn(v)), walk: moving ? 1 : 0, ph: t * 9 + i, look: inRiddle ? 1 : (sgn(v)), tilt: !inRiddle && D > 2 ? 0.28 * Math.max(0, Math.sin(D * 1.9 + ph)) : 0, wave: t >= ans.at && t < ans.at + 2.2 ? 0.9 : 0, mouth: t >= ans.at - 0.2 && t < ans.at + 1.8 ? 0.5 + 0.5 * Math.sin(t * 20 + i) : 0, bob: t >= ans.at && t < ans.at + 2.2 ? Math.abs(Math.sin(t * 7 + i)) * 0.6 : 0 };
  };
  const specs = [
    { prop: (t) => { for (let i = 0; i < CH.length; i++) if (!(t >= lamp.at - 0.1 && false)) { const p = courtPos(i, t); courtier(p.x, FLOOR + 6, 1.55, 3000 + i * 40, p); if (t >= bk.at) bookStack(p.x + p.f * 26, FLOOR - 34, 1.35, 2 + (i % 3), 3300 + i * 8); } } },
    { b: 'K', x: kx, y: ky, s: ks, f: (t) => (t < walkK ? 1 : -1), alpha: (t) => (t < lamp.at - 0.25 ? 1 : t < lamp.at ? 1 - u(t, lamp.at - 0.25, lamp.at) : t < lamp.at + 0.5 ? u(t, lamp.at, lamp.at + 0.5) : 1),
      dy: (t) => (t >= hop.at && t < hop.to ? -Math.abs(Math.sin((t - hop.at) * 5.5)) * 34 : 0),
      pose: (t) => (t >= hop.at && t < hop.to ? { ra: [0.5 + 0.7 * Math.sin(t * 5.5), 0.9], la: [0.3 - 0.7 * Math.sin(t * 5.5), 0.6], look: 1 } : (t >= lamp.at && t < drop.at ? { ra: [-0.83, 3.1], la: [1.4, 1.65], look: 0, hair: undefined } : Object.assign(wk(t, kRun, 11), t >= hide.to && t < lamp.at ? { look: -1 } : {}))),
      after: (a, t) => { if (t >= lamp.at + 0.3 && t < drop.at) crystalsOn(640, 360, 330, t, 3900); } },
  ];
  const base = camFor(lt, [[0, WIDE], [lamp.at - 0.8, WIDE], [lamp.at, ON(640, 360, 1.06)], [drop.at + 0.2, WIDE]], 0.9);
  const c = camScene(sh, lt, base, specs);
  cam(c, () => {
    wallRoom(520, 2.8);
    for (const x of [120, 420, 1190]) column(x, 150, 540, 62, 3500 + x);
    throne(TH, 600, 3600);
    // the hopscotch squares
    for (let i = 0; i < 6; i++) { const x0 = 330 + i * 62; shape([[x0 + 4, 628], [x0 + 62, 628], [x0 + 70, 690], [x0, 690]], { lw: 1.4, id: 3700 + i, fill: P.paper }); }
    if (lt >= lamp.at - 0.1 && lt < drop.at + 0.8) { const cy = lt < drop.at ? lerp(-120, 352, E.out(u(lt, lamp.at, lamp.at + 0.8))) : lerp(352, -150, E.in(u(lt, drop.at, drop.at + 0.7))); chandelier(640, cy, 330, lt, 3800); }
    const PM = stageDraw(sh, lt, specs.concat([{ prop: (t) => { if (t >= hide.at && t < lamp.at + 0.1) { /* the pillar in front of the hiding king */ column(PIL, 110, 690, 150, 3550); } } }]), { noHorns: true });
    // the question: a comet in a bubble above the king
    if (lt >= ask.at && lt < ans.at + 2.4) { const a = seg(lt, ask.at, ask.at + 0.4, E.out), kx_ = 1010; X.save(); X.globalAlpha = a; bubble(840, 230, 300, 170, kx_ - 30, 330, 3950); comet2(780, 235, 1.0, 3960); qmark(930, 235, 0.8, 1); X.restore(); }
  });
};

/* ---------- 2. the prize, and two visitors ---------- */
SHOTS.prize = (lt, sd, sh) => {
  const vault = cue(sh, 'vault'), gate = cue(sh, 'gate'), coins = cue(sh, 'coins'), contract = cue(sh, 'contract'), box = cue(sh, 'box'), hall = cue(sh, 'hall'), ex = cue(sh, 'explain');
  const u = (t, a, b) => clamp((t - a) / Math.max(0.01, b - a));
  const inVault = lt >= vault.at && lt < vault.to, inGate = lt >= gate.at - 0.2 && lt < hall.at, inHall = !inVault && !inGate;
  if (inVault) {
    const a = seg(lt, vault.at, vault.at + 0.5) * (1 - seg(lt, vault.to - 0.4, vault.to));
    X.fillStyle = DARK; X.fillRect(-400, -400, 2100, 1500); X.fillStyle = 'rgba(235,227,207,.06)'; for (let y = 0; y < H; y += 3) X.fillRect(0, y, W, 1);
    X.save(); X.globalAlpha = a;
    shape([[360, 720], [360, 260], [420, 160], [640, 110], [860, 160], [920, 260], [920, 720]], { lw: 3, id: 4000, fill: '#2a241d', h: [Math.PI / 2, 5, 0.5] });
    for (let i = 0; i < 5; i++) { const q = i / 4; ink([[360 + q * 20, 260 - q * 60], [640, 140 + q * 6]], 0.8, 4010 + i, 0.4, P.paper); }
    chest(640, 640, 2.2, 4020, 0.6);
    for (let i = 0; i < 14; i++) { const x0 = 560 + hash(4030, i) * 160, y0 = 440 + hash(4031, i) * 150, l = 20 + hash(4032, i) * 40; ink([[x0, y0], [x0 + l * 0.3, y0 + l]], 0.9, 4040 + i, 0.5, P.paper); }
    diadem(640, 500, 1.8, 4100, 0.5 + 0.5 * Math.sin(lt * 1.5));
    for (let i = 0; i < 40; i++) { X.fillStyle = P.paper; X.fillRect(380 + hash(4200, i) * 520, 140 + hash(4201, i) * 560 + Math.sin(lt * 0.6 + i) * 6, 2, 2); }
    X.restore(); return;
  }
  // the ordinary scenes: T, L and the king
  const Tx = inHall ? 470 : 420, Lx = inHall ? 280 : 250;
  const handsUp = lt >= coins.at && lt < coins.to ? 1 : 0, swing = Math.sin(lt * 7) * 0.2;
  const kUp = lt < vault.at ? { ra: [-0.2 - 0.5 * Math.abs(Math.sin(lt * 2)), -1.2], la: [-0.4, -1.0], look: 1 } : {};
  const specs = inGate ? [
    { b: 'T', x: Tx, f: 1, pose: (t) => ({ ra: t >= coins.at && t < coins.to ? [0.5, 0.2] : undefined, look: 1 }) },
    { b: 'L', x: Lx, f: 1, pose: (t) => ({ ra: t >= contract.at ? [-0.4, -1.1] : undefined, la: t >= contract.at ? [-0.2, -0.9] : undefined, look: 1 }) },
    { prop: (t) => {
      const gx = 980; shape([[gx - 150, 700], [gx - 150, 260], [gx - 70, 140], [gx + 70, 140], [gx + 150, 260], [gx + 150, 700]], { lw: 2.6, id: 4300, fill: P.ink }); shape(R(gx - 100, 270, 200, 430), { lw: 2, id: 4301, fill: P.paper, h: [Math.PI / 2, 4.4, 0.6] });
      for (let i = 0; i < 11; i++) { const px = 700 + (i % 5) * 62 + hash(4310, i) * 24, st = t >= gate.at ? 1 : 0; courtier(px + (i > 4 ? 30 : 0), FLOOR + 6 - (i > 4 ? 0 : 0), 1.2 + 0.1 * (i % 3), 4320 + i * 30, { f: -1, look: -1, mouth: Math.abs(Math.sin(t * 8 + i)) > 0.6 ? 0.8 : 0, wave: i % 3 === 0 ? 0.8 : 0, bob: 0.4 * Math.abs(Math.sin(t * 6 + i)) }); }
      guard(600, FLOOR + 6, 1.6, 4700, { f: -1, look: -1 });
      if (t >= coins.at && t < coins.to + 0.6) for (let q = 0; q < 5; q++) { const p = u(t, coins.at + q * 0.28, coins.at + q * 0.28 + 0.7); if (p > 0 && p < 1) { const pt = bez([Tx + 90, 470], [Tx + 190, 400], [610, 570], p); coinDot(pt[0], pt[1], 6, 4400 + q); } }
    } },
  ] : [
    { b: 'K', x: 920, f: -1, pose: () => ({ look: -1 }) },
    { b: 'T', x: Tx, f: 1, pose: (t) => ({ ra: t >= cue(sh, 'horns').at - 0.1 && t < sd ? undefined : undefined }) },
    { b: 'L', x: Lx, f: 1, pose: (t) => ({ look: 1, ra: t >= contract.at && t < box.at ? [-0.4, -1.1] : undefined }) },
    { prop: () => { boxProp(600, 664, 1.0, 4500, seg(lt, box.at, box.at + 0.5, E.out)); } },
  ];
  const base = inGate ? camFor(lt, [[0, WIDE], [coins.at - 0.5, ON(520, 440, 1.25)], [coins.to, WIDE]], 0.9) : camFor(lt, [[0, WIDE], [ex.at, ON(600, 420, 1.2)]], 1.2);
  const c = camScene(sh, lt, base, specs);
  cam(c, () => {
    if (inGate) {
      X.fillStyle = P.paper; X.fillRect(-400, -400, 2100, 1500); X.save(); X.globalAlpha = 0.55; skyLines(PY0 - 100, 420, 800); X.restore();
      house(160, 560, 160, 270, 4800, { lit: 1 }); house(400, 560, 120, 200, 4850); floor2(560, 7050);
    } else { wallRoom(520, 2.8); for (const x of [120, 420, 760, 1190]) column(x, 150, 540, 62, 3500 + x); throne(1130, 600, 3600); }
    stageDraw(sh, lt, specs, { noHorns: lt < box.at });
    // the guard's palm and the coins (gate), the scroll (contract)
    if (inGate && lt >= contract.at) { scroll(Lx + 70, 470, 58, 64, 4600); }
    if (inGate && lt >= gate.at - 0.2 && lt < gate.at + 3.5) { /* nothing: the crowd is already drawn */ }
  });
};

/* ---------- 3. the first swap ---------- */
SHOTS.swap = (lt, sd, sh) => {
  const L = sh.lines, sw = cue(sh, 'swap'), wig = cue(sh, 'wiggle'), run = cue(sh, 'run'), fall = cue(sh, 'fall'), seize = cue(sh, 'seize'), thr = cue(sh, 'throw'), hn = cue(sh, 'horns');
  const u = (t, a, b) => clamp((t - a) / Math.max(0.01, b - a));
  const Tx0 = 470, Kx0 = 840, Lx0 = 1140;
  const tx = (t) => (t < run.at ? Tx0 : Tx0 - 760 * E.in(u(t, run.at, run.to - 0.3)));
  const trip = fall.at, kx = (t) => (t < trip - 0.9 ? Kx0 : t < trip ? lerp(Kx0, Kx0 - 120, E.in(u(t, trip - 0.9, trip))) : Kx0 - 120 - 30 * E.out(u(t, trip, trip + 0.5)));
  const specs = [
    { prop: () => { for (const [gx, gi] of [[1010, 0], [1075, 1]]) { const gOut = lt >= seize.at ? E.io(u(lt, seize.at, seize.to)) : 0; const px = lerp(gx, Lx0 - 60 + gi * 56, gOut); guard(px, FLOOR + 6, 1.55, 5000 + gi * 60, { f: -1, walk: lt >= seize.at && lt < seize.to ? 1 : 0, ph: lt * 11, look: -1 }); } } },
    { b: 'L', x: (t) => (t < thr.at ? Lx0 : Lx0 + 520 * E.in(u(t, thr.at, thr.at + 0.9))), f: -1, y: FLOOR, rot: (t) => (t >= thr.at ? (t - thr.at) * 5 : 0), dy: (t) => (t >= thr.at ? -140 * Math.sin(Math.PI * clamp(u(t, thr.at, thr.at + 0.9))) : 0), pose: (t) => ({ ra: t >= seize.at && t < thr.at ? [-0.6, -1.2] : undefined, la: t >= seize.at && t < thr.at ? [-0.8, -1.0] : undefined, look: -1 }) },
    { b: 'T', x: tx, f: (t) => (t < run.at ? 1 : -1),
      pose: (t) => { const m = mindsAt(sh, t).m; const w = t >= wig.at && t < wig.to; const running = t >= run.at && t < run.to; return Object.assign({}, wk(t, running, 14), w ? { ra: [-0.5 + 0.5 * Math.sin(t * 16), -0.9], la: [-0.4 - 0.5 * Math.sin(t * 16 + 1), -0.8], lookY: 1, look: 0 } : {}, t >= sw.at + 2.0 && t < wig.at ? { look: 1 } : {}); } },
    { b: 'K', x: kx, f: -1, rot: (t) => (t >= trip ? -1.5708 * E.in(u(t, trip, trip + 0.28)) : 0), dy: (t) => (t >= trip + 0.2 ? -16 : 0),
      pose: (t) => { const speaking = !!bodyLine(sh, 'K', t); const afterL3 = t >= L[3].t1 + 0.1; return Object.assign({}, wk(t, t >= trip - 0.9 && t < trip, 12), t >= sw.at + 0.2 && t < L[3].t1 ? { ra: [-0.9 + 0.7 * Math.sin(t * 7), -0.7], la: [-0.7 - 0.5 * Math.sin(t * 7 + 2), -0.5] } : {}, afterL3 && t < trip - 0.9 ? { ra: [1.0, 0.9], lookY: 1, look: 0 } : {}); } },
  ];
  const base = camFor(lt, [[0, WIDE], [sw.at - 1.4, ON(655, 430, 1.22)], [sw.at + 3.2, WIDE]], 1.0);
  const c = camScene(sh, lt, base, specs);
  cam(c, () => {
    wallRoom(520, 2.8); for (const x of [120, 420, 760, 1190]) column(x, 150, 540, 62, 3500 + x); throne(1130, 600, 3600);
    stageDraw(sh, lt, specs, {});
    if (lt >= run.at + 0.1 && lt < run.to - 0.3) footDust(tx(lt) + 80, FLOOR, lt, 5200);
  });
};

/* ================= scenes 4 to 8 ================= */
const Cq = (sh, k, i = 0) => cue(sh, k, i) || { at: 1e9, to: 1e9 };
const U = (t, a, b) => clamp((t - a) / Math.max(0.01, b - a));
const sinw = (t, f) => Math.sin(t * f);
function openWindow(x, y, w, h, id) { shape(R(x - w / 2 - 9, y - h / 2 - 9, w + 18, h + 18), { lw: 2.4, id, fill: P.ink }); X.save(); path(R(x - w / 2, y - h / 2, w, h)); X.clip(); X.fillStyle = P.paper; X.fillRect(x - w / 2, y - h / 2, w, h); skyLines(y - h / 2, y + h / 2, y + h * 2); X.restore(); line([x - w / 2 - 14, y + h / 2 + 8], [x + w / 2 + 14, y + h / 2 + 8], 5, id + 3, 0.2); }
function portcullis(x0, x1, yTop, yBot, id, drop) { // drop 0..1 lowers the grille
  const yb = lerp(yTop, yBot, drop); if (drop <= 0.01) return;
  shape(R(x0 - 8, yTop - 14, x1 - x0 + 16, 14), { lw: 2, id, fill: P.ink });
  for (let x = x0; x <= x1 + 1; x += (x1 - x0) / 6) line([x, yTop], [x, yb], 4, id + 3 + Math.round(x), 0.2);
  for (const q of [0.35, 0.7]) if (yb > yTop + 40) line([x0, lerp(yTop, yb, q)], [x1, lerp(yTop, yb, q)], 3.2, id + 40 + q * 10, 0.2);
  for (let x = x0; x <= x1 + 1; x += (x1 - x0) / 6) shape([[x - 4, yb], [x + 4, yb], [x, yb + 16]], { lw: 1, id: id + 60 + Math.round(x), fill: P.ink });
}
function marigold(x, y, r, id, a = 1) { X.save(); X.globalAlpha = a; for (let i = 0; i < 14; i++) { const an = i / 14 * 6.2832; X.save(); X.translate(x + Math.cos(an) * r * 0.62, y + Math.sin(an) * r * 0.62); X.rotate(an); X.beginPath(); X.ellipse(0, 0, r * 0.4, r * 0.17, 0, 0, 6.2832); X.fillStyle = P.amber; X.fill(); X.lineWidth = 1.1; X.strokeStyle = P.ink; X.stroke(); X.restore(); } X.beginPath(); X.arc(x, y, r * 0.3, 0, 6.2832); X.fillStyle = P.ink; X.fill(); line([x, y + r], [x + 4, y + r * 2.4], 3, id, 0.2); X.restore(); }
function stickAt(a, arm, len, ang) { const p = arm === 'l' ? toW(a, -30 + Math.cos(a.la[0]) * 62 + Math.cos(a.la[1]) * 58, -214 + Math.sin(a.la[0]) * 62 + Math.sin(a.la[1]) * 58) : handW(a, a.ra); line([p[0], p[1]], [p[0] + Math.cos(ang) * len, p[1] + Math.sin(ang) * len], 5, 9100, 0.2); }
function cops(list, lt, id) { for (const c of list) guard(c.x, FLOOR + 6, 1.55, id + c.i * 60, { f: c.f, walk: c.walk || 0, ph: lt * 11 + c.i, look: c.f, spear: false, mouth: c.mouth || 0 }); }

/* ---------- 4. locked in ---------- */
SHOTS.locked = (lt, sd, sh) => {
  const shut = Cq(sh, 'shut'), pound = Cq(sh, 'pound'), bolt = Cq(sh, 'bolt'), L = sh.lines, DX = 170, BX = 900;
  const pEnd = pound.to - 0.8;
  const doorOpen = lt < shut.at ? 1 : 1 - E.in(U(lt, shut.at, shut.at + 0.45));
  const kx = (t) => (t < shut.at ? lerp(215, 330, E.out(U(t, 0, shut.at))) : t < pEnd ? 330 : lerp(330, 760, E.io(U(t, pEnd, pEnd + 0.9))));
  const sitting = lt >= pEnd + 0.9;
  const specs = [{ b: 'K', x: kx, f: (t) => (t < shut.at ? 1 : t < pEnd + 0.1 ? -1 : -1), seated: undefined,
    pose: (t) => {
      const pd = t >= shut.at + 0.5 && t < pEnd, mv = t >= pEnd && t < pEnd + 0.9;
      const o = Object.assign({}, wk(t, (t < shut.at) || mv, 10));
      if (t < shut.at) { o.ra = [-0.5, -0.4]; o.la = [-0.4, -0.8]; o.tilt = 0.1; o.look = 1; }
      else if (pd) { const k = sinw(t, 12), sp = !!bodyLine(sh, 'K', t); o.ra = [-1.25 + 0.35 * k, -0.35]; o.la = [-1.15 - 0.35 * k, -0.4]; o.look = -1; if (!sp) o.mouth = 0.3; }
      if (sitting) { o.seated = true; o.look = -1; o.ra = [1.5, 1.6]; }
      return o; } },
    { prop: (t) => { if (t < shut.at + 0.4) { for (const [gx, gi] of [[120, 0], [168, 1]]) { X.save(); X.globalAlpha = 1 - U(t, shut.at, shut.at + 0.4); guard(gx - (gi ? 0 : 0), FLOOR + 6, 1.55, 9200 + gi * 60, { f: 1, look: 1, spear: false }); X.restore(); } } } },
  ];
  const base = camFor(lt, [[0, ON(520, 400, 1.1)], [shut.at + 0.6, ON(420, 410, 1.12)], [L[1].t0, ON(520, 400, 1.0)], [pEnd, WIDE]], 1.0);
  const c = camScene(sh, lt, base, specs);
  cam(c, () => {
    wallRoom(520, 2.8);
    openWindow(1010, 250, 120, 170, 9300);
    bed(BX, 644, 9400);
    shape(R(BX - 168, 524, 100, 40), { lw: 1.8, id: 9410, fill: P.paper, h: [0.5, 3, 0.6] });
    door(DX, 610, 170, 420, 9500, { open: doorOpen, bar: lt >= bolt.at });
    if (lt >= bolt.at && lt < bolt.at + 0.5) { X.save(); X.globalAlpha = 1 - U(lt, bolt.at, bolt.at + 0.5); star(DX + 30, 400, 40, 9520, P.ink, 8); X.restore(); }
    stageDraw(sh, lt, specs, {});
  });
};

/* ---------- 5. in the street ---------- */
SHOTS.street = (lt, sd, sh) => {
  const bub = Cq(sh, 'bubble'), mi = Cq(sh, 'mind_in'), fl = Cq(sh, 'fall');
  const kx = (t) => lerp(160, 470, E.out(U(t, 0, bub.at)));
  const specs = [{ b: 'L', x: kx, f: 1, pose: (t) => Object.assign(wk(t, t < bub.at, 9), t >= bub.at ? { look: 1 } : {}) },
    { prop: (t) => { for (let i = 0; i < 3; i++) { const px = ((t * (36 + 14 * i) + i * 520) % 1700) - 200, dir = i % 2 ? 1 : -1, xx = dir > 0 ? px : 1500 - px; courtier(xx, 596, 1.2, 9600 + i * 40, { f: dir, walk: 1, ph: t * 8 + i, look: dir }); } } }];
  const base = camFor(lt, [[0, WIDE], [bub.at, ON(700, 330, 1.12)]], 1.6);
  const c = camScene(sh, lt, base, specs);
  cam(c, () => {
    X.fillStyle = P.paper; X.fillRect(-400, -400, 2100, 1500); X.save(); X.globalAlpha = 0.55; skyLines(PY0 - 100, 440, 800); X.restore();
    house(120, 580, 190, 300, 9700, { lit: 1 }); house(380, 580, 130, 220, 9760); house(1140, 580, 200, 330, 9800, { lit: 1 }); lamppost(760, 596, 250, 9860, 1);
    floor2(580, 9900);
    stageDraw(sh, lt, specs, {});
    const a = seg(lt, bub.at, bub.at + 0.5, E.out);
    if (a > 0) {
      X.save(); X.globalAlpha = a; const bx = 820, by = 215; bubble(bx, by, 600, 330, 540, 380, 9950);
      line([590, 340], [1060, 340], 1.4, 9960, 0.3);
      const rx = 940, ry = 262;
      // the stone
      shape(blobPts(rx + 60, ry + 40, 56, 58, 9970, 14, 0.1), { lw: 2, id: 9971, h: [0.6, 3, 0.6], fill: P.paper });
      // the little figure, with the horns, steps up and butts it
      const go = U(lt, bub.at + 0.3, mi.at), fx = lerp(660, 840, E.io(go)), lung = pulseU(lt, mi.at - 0.3, 0.5), falling = fl.at < 1e8 ? U(lt, fl.at, fl.at + 0.5) : 0;
      X.save(); X.translate(fx + 22 * lung, 340); X.rotate(-falling * 1.45); tinyMicro(0, 0, 3.0, 9980); drawHorns(1, -136, 0.78, 0.1, {}); X.restore();
      const flyU = U(lt, mi.at, mi.at + 0.7);
      const eFrom = [fx, 140], eTo = [rx + 60, ry + 4];
      if (flyU > 0 && flyU < 1) { const p = bez(eFrom, [lerp(eFrom[0], eTo[0], 0.5), 90], eTo, E.io(flyU)); emblem('b', p[0], p[1], 17); }
      else if (flyU >= 1) emblem('b', eTo[0], eTo[1], 17);
      else emblem('b', fx, 140 + 3 * sinw(lt, 3), 17);
      if (lt > mi.at && lt < mi.at + 0.4) { star(fx + 90, 250, 30 + 70 * U(lt, mi.at, mi.at + 0.4), 9990, P.ink, 10); }
      X.restore();
    }
  });
};

/* ---------- 6. the harbor steps ---------- */
SHOTS.steps = (lt, sd, sh) => {
  const run = Cq(sh, 'run'), tum = Cq(sh, 'tumble'), app = Cq(sh, 'approach'), sw = Cq(sh, 'swap'), dn = Cq(sh, 'dance'), hn = Cq(sh, 'horns'), L = sh.lines;
  const LY = 1.88;
  const tx = (t) => (t < tum.at ? lerp(90, 500, E.lin(U(t, run.at, tum.at))) : lerp(500, 560, E.out(U(t, tum.at, tum.at + 0.9))));
  const sitU = U(lt, sw.at + 0.9, sw.at + 2.0);
  const trot = (t) => (t < tum.at ? 0 : t < sw.at + 0.9 ? lerp(0, LY, E.in(U(t, tum.at, tum.at + 0.4))) - 0.28 * pulseU(t, sw.at - 0.35, 0.8) : lerp(LY, 0.3, E.io(U(t, sw.at + 0.9, sw.at + 2.0))));
  const bend = U(lt, L[3].t0 - 0.2, L[3].t1 - 0.4) * (1 - U(lt, sw.at + 0.7, sw.at + 1.3)), SX = 1050;
  const sx = (t) => (t < app.at ? 1400 : t < L[3].t0 - 0.2 ? lerp(1400, SX, E.io(U(t, app.at, L[3].t0 - 0.2))) : t < dn.at ? SX : lerp(SX, 1500, E.in(U(t, dn.at, sd))));
  const danceOn = lt >= dn.at, wlk = lt >= app.at && lt < L[3].t0 - 0.2;
  const specs = [
    { b: 'T', x: tx, y: (t) => stairY(tx(t)) + (t < tum.at ? 0 : -3), f: 1, rot: trot,
      pose: (t) => { const running = t >= run.at && t < tum.at; const o = Object.assign({}, wk(t, running, 15));
        if (t >= tum.at && t < sw.at - 0.1) { o.ra = [-0.9 + 0.5 * sinw(t, 9), -0.6]; o.la = [-0.5 - 0.4 * sinw(t, 9), -0.7]; o.look = 0; o.lookY = 1; }
        else if (t >= sw.at + 0.9) { o.ra = [1.6, 1.3]; o.la = [1.2, 1.4]; o.look = 1; o.lookY = 0; }
        return o; } },
    { b: 'S', x: sx, y: (t) => (sx(t) > 960 ? 646 : stairY(sx(t))), f: -1, rot: (t) => -1.3 * bend * 1 + (t >= sw.at + 1.0 && t < sw.at + 1.2 ? 0 : 0),
      dy: (t) => (danceOn ? -Math.abs(sinw(t, 7)) * 30 : 0),
      pose: (t) => { const o = Object.assign({}, wk(t, wlk || danceOn, danceOn ? 12 : 8)); if (t >= L[3].t0 - 0.2 && t < sw.at + 0.6) { o.ra = [1.05, 1.1]; o.la = [1.1, 1.2]; o.look = -1; } if (danceOn) { o.f = 1; o.la = [-0.8 + 0.7 * sinw(t, 7), -0.7]; } return o; },
      after: null },
    { prop: (t) => { for (let i = 0; i < 8; i++) { const px = 1010 + (i % 4) * 66 + hash(9400, i) * 26, qy = FLOOR + 6 + (i > 3 ? -4 : 0); courtier(px + (i > 3 ? 30 : 0), qy - (i > 3 ? 0 : 0), 1.4, 9400 + i * 30, { f: -1, look: -1, mouth: Math.abs(sinw(t, 9 + i)) > 0.5 ? 0.8 : 0, bob: 0.5 * Math.abs(sinw(t, 6 + i)), wave: i % 3 === 0 ? 0.8 : 0 }); } } },
  ];
  // the sailor dances facing right once he leaves
  specs[1].f = (t) => (t >= dn.at ? 1 : -1);
  const base = camFor(lt, [[0, ON(560, 372, 1.0)], [tum.at + 0.6, ON(700, 440, 1.04)], [app.at, ON(800, 470, 1.1)], [dn.at, ON(760, 400, 1.0)]], 1.2);
  const c = camScene(sh, lt, base, specs);
  cam(c, () => {
    harborBG(lt, { noShip: true }); quayFloor(); stairsBG();
    stageDraw(sh, lt, specs, {});
  });
};

/* ---------- 7. the quay ---------- */
SHOTS.quay = (lt, sd, sh) => {
  const sc = Cq(sh, 'scold'), hit = Cq(sh, 'hit'), arr = Cq(sh, 'arrive'), sw = Cq(sh, 'swap'), esc = Cq(sh, 'escort'), L = sh.lines;
  const sx = (t) => (t < sc.at ? lerp(160, 520, E.out(U(t, 0, sc.at))) : t < esc.at ? 520 : lerp(520, -200, E.in(U(t, esc.at, sd))));
  const skx = (t) => (t < sc.at ? 1000 : t < sc.to ? lerp(1000, 690, E.io(U(t, sc.at, sc.to))) : t < hit.at + 0.2 ? 690 : lerp(690, 790, E.out(U(t, hit.at + 0.2, hit.at + 0.7))));
  const cx = (t) => (t < arr.at ? 1500 : t < arr.to ? lerp(1500, 840, E.io(U(t, arr.at, arr.to))) : 840);
  const cop = (t, i) => ({ x: (t < arr.at ? 1500 : lerp(1500, 940, E.io(U(t, arr.at, arr.to)))) + 70 * (i + 1) - (t >= esc.at ? 0 : 0), i, f: -1, walk: t >= arr.at && t < arr.to ? 1 : 0 });
  const swing = pulseU(lt, hit.at, 0.35);
  const specs = [
    { b: 'S', x: sx, f: (t) => (t >= esc.at ? -1 : 1), pose: (t) => { const o = Object.assign({}, wk(t, t < sc.at || t >= esc.at, 9)); if (t >= esc.at) { o.ra = [-0.9, -0.9]; o.la = [-0.8, -1.0]; o.mouth = 0; o.look = -1; } if (t >= hit.at - 0.5 && t < L[3].t1 - 0.3) { o.la = [-1.0 + 1.5 * swing - 0.0, -0.5 + 0.9 * swing]; } return o; },
      after: (a, t) => { if (t >= hit.at - 1.0 && t < L[3].t1 - 0.1) { const la = a.la || [1.4, 1.65]; const p = toW(a, -30 + Math.cos(la[0]) * 62 + Math.cos(la[1]) * 58, -214 + Math.sin(la[0]) * 62 + Math.sin(la[1]) * 58); line([p[0] - a.f * 4, p[1] + 36], [p[0] + a.f * 6, p[1] - 90], 5, 9150, 0.2); } } },
    { b: 'SK', x: skx, f: -1, rot: (t) => (t >= hit.at + 0.15 ? 1.45 * E.in(U(t, hit.at + 0.15, hit.at + 0.5)) : 0), dy: (t) => (t >= hit.at + 0.5 ? -2 : 0),
      pose: (t) => { const o = Object.assign({}, wk(t, t >= sc.at && t < sc.to, 11)); if (t >= sc.at && t < hit.at + 0.1) { o.ra = [-0.6 + 0.7 * sinw(t, 10), -0.9]; o.mouth = 0.5 + 0.5 * sinw(t, 21); } if (t >= hit.at + 0.2) { o.ra = [-1.0, -0.5]; o.la = [-0.9, -0.3]; o.look = 0; o.lookY = 1; } return o; } },
    { b: 'C', x: cx, f: (t) => (t >= esc.at + 1.0 ? 1 : -1), pose: (t) => { const o = Object.assign({}, wk(t, (t >= arr.at && t < arr.to) || t >= esc.at + 1.0, 9)); return o; } },
    { prop: (t) => { cops([cop(t, 0), cop(t, 1)].map((c, i) => Object.assign(c, t >= esc.at ? { x: sx(t) + 110 * (i ? -1 : 1) + (i ? 20 : -20), f: -1, walk: 1 } : {})), t, 9500); } },
  ];
  const base = camFor(lt, [[0, WIDE], [sc.at, ON(640, 420, 1.12)], [arr.at, WIDE]], 1.2);
  const c = camScene(sh, lt, base, specs);
  cam(c, () => {
    harborBG(lt, {}); quayFloor();
    bollard(180, 560, 9600); bollard(1150, 560, 9610); crate(1090, 650, 90, 9620); crate(1180, 650, 66, 9630); barrel(130, 654, 56, 9640); barrel(70, 650, 50, 9650);
    stageDraw(sh, lt, specs, {});
  });
};

/* ---------- 8. the police station ---------- */
SHOTS.station = (lt, sd, sh) => {
  const en = Cq(sh, 'enter'), sl = Cq(sh, 'slam'), ink_ = Cq(sh, 'ink'), jmp = Cq(sh, 'jump'), L = sh.lines, hn = cues(sh, 'horns');
  const lx = (t) => (t < en.to ? lerp(-60, 430, E.out(U(t, en.at, en.to))) : t < jmp.at ? 430 : lerp(430, 330, E.io(U(t, jmp.at, jmp.at + 0.5))));
  const climb = U(lt, jmp.at + 0.4, jmp.at + 1.2), gone = lt >= jmp.at + 1.2;
  const stoop = pulseU(lt, L[3].t0 - 0.6, 0.9), flinch = pulseU(lt, ink_.at + 0.3, 0.7), slam = pulseU(lt, sl.at, 0.3);
  const specs = [
    { b: 'L', x: lx, f: 1, dy: () => -250 * E.io(climb), show: () => !gone,
      pose: (t) => { const o = Object.assign({}, wk(t, t >= en.at && t < en.to, 9)); if (t >= ink_.at - 0.35 && t < ink_.at + 0.15) { o.ra = [-0.4 - 2.0 * U(t, ink_.at - 0.35, ink_.at), -0.8]; } if (t >= ink_.at + 0.15 && t < jmp.at) { o.ra = [-0.6, -0.4]; } if (t >= jmp.at) { o.ra = [-1.4, -0.9]; o.la = [-1.2, -0.8]; o.walk = 0; } return o; } },
    { b: 'C', x: () => 950, f: -1, rot: (t) => -0.3 * stoop - 0.07 * flinch, closed: undefined,
      pose: (t) => { const o = {}; if (t >= en.to - 0.5 && t < en.to + 0.3) o.closed = 1; if (t >= sl.at && t < sl.at + 0.35) { o.ra = [0.9 + 0.5 * slam, 0.9]; o.look = 0; } if (t >= ink_.at + 0.35) { o.tilt = 0.2 * Math.sin(t * 15) * Math.exp(-(t - ink_.at - 0.35)); o.mouth = 0.8; } return o; } },
  ];
  const base = camFor(lt, [[0, WIDE], [sl.at - 0.5, ON(760, 440, 1.1)], [L[4].t0, ON(640, 400, 1.05)]], 1.2);
  const c = camScene(sh, lt, base, specs);
  cam(c, () => {
    wallRoomStone(lt); openWindow(300, 240, 130, 180, 9300);
    lamppost(1180, 644, 240, 9320, 0); // a lamp on a stand in the corner
    desk(800, 644, 210, 9350);
    const PM = stageDraw(sh, lt, specs, {});
    // the inkwell, thrown, and the splash on the king's face
    if (lt >= ink_.at && lt < ink_.at + 0.4) { const L_ = PM.L, C_ = PM.C; if (L_ && C_) { const a = handW(L_, [-1.5, -0.5]), b = headW(C_), p = bez(a, [(a[0] + b[0]) / 2, a[1] - 140], b, U(lt, ink_.at, ink_.at + 0.35)); shape(R(p[0] - 8, p[1] - 8, 16, 16), { lw: 1.6, id: 9360, fill: P.ink }); } }
    if (lt >= ink_.at + 0.35) { const C_ = PM.C; if (C_) { const h = headW(C_); inkSplat(h[0] - 8, h[1] + 4, 0.8, 9370, 1 - 0.0 * U(lt, ink_.at + 3, ink_.at + 5)); } }
  });
};

/* ================= scenes 9 to 12 ================= */
const dipFade = (a, b) => { X.save(); X.setTransform(1, 0, 0, 1, 0, 0); X.fillStyle = P.paper; X.globalAlpha = clamp(a); X.fillRect(0, 0, W, H); X.restore(); };

/* ---------- 9. Klapaucius's trick ---------- */
SHOTS.trick = (lt, sd, sh) => {
  const arr = Cq(sh, 'arrest'), kn = Cq(sh, 'kneel'), tale = Cq(sh, 'tale'), flw = Cq(sh, 'flower'), lv = Cq(sh, 'leave'), lk = Cq(sh, 'lock'), dr = Cq(sh, 'drawer'), ret = Cq(sh, 'return'), sw = Cq(sh, 'swap'), dg = Cq(sh, 'drag'), L = sh.lines;
  const hornSteal = Cq(sh, 'horns', 1);
  const outAt = L[0].t1 + 0.3, grilleDrop = U(lt, lk.at, lk.at + 0.5), grilleUp = U(lt, dg.at, dg.at + 0.5), gr = grilleDrop * (1 - grilleUp);
  const lxF = (t) => (t < arr.to ? lerp(-90, 560, E.io(U(t, arr.at, arr.to))) : t < dr.at ? (t < lk.at + 0.6 ? 560 : lerp(560, 567, E.io(U(t, lk.at + 0.6, lk.at + 1.2)))) : t < dr.at + 0.7 ? lerp(567, 730, E.io(U(t, dr.at, dr.at + 0.6))) : t < dg.at + 0.4 ? 730 : lerp(730, 1560, E.in(U(t, dg.at + 0.4, sd - 0.3))));
  const retU = U(lt, ret.at, L[6].t1 - 0.1);
  const cxF = (t) => (t < lv.at ? 960 : t < lk.at ? lerp(960, 770, E.io(U(t, lv.at, lk.at - 0.2))) : t < lk.at + 0.6 ? 770 : t < ret.at ? lerp(770, 1560, E.in(U(t, lk.at + 0.6, ret.at - 0.4))) : t < L[6].t1 + 0.2 ? lerp(1560, 835, E.io(U(t, ret.at, L[6].t1 - 0.1))) : t < L[7].t0 + 0.8 ? 835 : lerp(835, 1130, E.io(U(t, L[7].t0 + 0.8, L[7].t0 + 1.7))));
  const specs = [
    { b: 'C', x: cxF, f: (t) => (t >= lk.at + 0.5 && t < ret.at ? 1 : -1),
      pose: (t) => { const o = Object.assign({}, wk(t, (t >= lv.at && t < lk.at - 0.1) || (t >= lk.at + 0.6 && t < ret.at - 0.2) || (t >= ret.at && t < L[6].t1 - 0.1) || (t >= L[7].t0 + 0.8 && t < L[7].t0 + 1.7), 9));
        if (t >= lk.at - 0.2 && t < lk.at + 0.4) { o.ra = [0.2, 0.15]; }
        if (t >= ret.at && t < sw.at) { o.ra = [-0.9 + 0.5 * sinw(t, 8), -0.5]; o.la = [-0.8 - 0.4 * sinw(t, 8), -0.6]; }
        if (t >= L[7].t0 && t < L[7].t1) o.look = -1;
        return o; } },
    { b: 'L', x: lxF, f: (t) => (t >= dg.at + 0.4 ? 1 : 1), rot: (t) => (t >= dg.at + 0.4 ? -0.22 : 0), hy: 0,
      pose: (t) => { const o = Object.assign({}, wk(t, (t >= arr.at && t < arr.to) || (t >= lk.at + 0.6 && t < lk.at + 1.2) || (t >= dg.at + 0.4), 9));
        if (t >= kn.at && t < tale.at) { o.hy = 24; o.ra = [-0.2 + 0.2 * sinw(t, 3), -0.8]; o.la = [-0.3, -0.8]; o.tilt = 0.18; }
        if (t >= dr.at && t < dr.at + 1.4) { const u = E.out(U(t, dr.at + 0.5, dr.at + 0.9)); o.ra = lerpA([1.4, 1.6], [0.77, 0.77], u); }
        if (t >= dg.at + 0.4) { o.ra = [-0.5, -0.4]; o.la = [-0.6, -0.5]; o.mouth = 0.8; }
        return o; } },
    { prop: (t) => { /* the guards: with Klapaucius, then back for the drag */
        if (t < L[0].t1 + 1.8) { const gx = lxF(t); cops([{ x: gx - 100, i: 0, f: 1, walk: t < arr.to ? 1 : 0 }, { x: gx + 100, i: 1, f: 1, walk: t < arr.to ? 1 : 0 }].map((c) => (t > arr.to + 1.0 ? Object.assign(c, { x: lerp(c.x, -100 + c.i * 50, E.in(U(t, arr.to + 1.0, arr.to + 1.8))), f: -1, walk: 1 }) : c)), t, 9500); }
        else if (t >= L[7].t0 + 0.8) { const gx = lxF(t), ent = E.io(U(t, L[7].t0 + 0.8, dg.at + 0.3)); cops([{ x: lerp(1560, 960, ent), i: 0, f: -1, walk: ent > 0 && ent < 1 ? 1 : 0 }, { x: lerp(1620, 1030, ent), i: 1, f: -1, walk: ent > 0 && ent < 1 ? 1 : 0 }].map((c) => (t >= dg.at + 0.4 ? Object.assign(c, { x: gx + (c.i ? 75 : 140), f: 1, walk: 1 }) : c)), t, 9560); } } },
  ];
  const base = camFor(lt, [[0, WIDE], [kn.at - 0.5, ON(640, 420, 1.15)], [tale.at, ON(600, 350, 1.1)], [lk.at - 0.5, WIDE], [sw.at - 1.2, ON(780, 440, 1.2)], [sw.at + 1.5, WIDE]], 1.1);
  const c = camScene(sh, lt, base, specs);
  cam(c, () => {
    wallRoomStone(lt); openWindow(250, 240, 130, 180, 9300);
    desk(800, 644, 210, 9350);
    // a rule of the house, painted on the wall: a notice board with a drawn key and a drawn cell
    const PM = stageDraw(sh, lt, specs, {});
    portcullis(440, 745, 190, 650, 9800, gr);
    // the tale: three small pictures in a bubble over Klapaucius
    if (lt >= tale.at && lt < L[4].t0 + 0.2) {
      const a = seg(lt, tale.at, tale.at + 0.4, E.out) * (1 - seg(lt, L[4].t0 - 0.2, L[4].t0 + 0.2)), bx = 560, by = 140, p = (lt - tale.at) / Math.max(0.1, flw.at - tale.at);
      X.save(); X.globalAlpha = a; bubble(bx, by, 380, 190, 560, 330, 9900);
      if (lt < flw.at) {
        if (p < 0.5) { tinyMicro(bx - 40, by + 70, 2.4, 9910); shape(R(bx - 62, by - 62, 44, 14), { lw: 1.4, id: 9911, fill: P.ink }); shape(R(bx - 50, by - 48, 20, 8), { lw: 1, id: 9912, fill: P.ink }); coinDot(bx + 30, by + 30, 18, 9913); coinDot(bx + 62, by + 48, 14, 9914); }
        else { ship(bx, by + 62, 0.46, 9920, lt); qmark(bx - 80, by - 8, 0.45, 1); qmark(bx + 82, by - 20, 0.5, 1); }
      } else { const g = seg(lt, flw.at, flw.at + 0.4, E.out); marigold(bx, by - 6, 38 * g, 9930); }
      X.restore();
    }
    // the evidence: nothing to draw; the horns come from the engine
  });
};

/* ---------- 10. the palace, and the rest set right ---------- */
SHOTS.restore = (lt, sd, sh) => {
  const tk = Cq(sh, 'tickle'), bd = Cq(sh, 'bound'), hl = Cq(sh, 'hall'), lit = Cq(sh, 'litter'), pr = Cq(sh, 'prisoner'), sw1 = Cq(sh, 'swap', 0), sw2 = Cq(sh, 'swap', 1), sw3 = Cq(sh, 'swap', 2), ce = Cq(sh, 'cell'), mo = Cq(sh, 'morning'), L = sh.lines;
  const inBed = lt < hl.at, morning = lt >= mo.at;
  const b1 = E.out(U(lt, bd.at, bd.at + 0.5)), tickle = lt >= tk.at && lt < bd.at;
  // phase A (the bedchamber) and phase B/C (the hall)
  const Kx = (t) => (t < hl.at ? lerp(620, 560, b1) : t < mo.at ? 1030 : t < sw3.at - 0.5 ? lerp(1030, 900, E.io(U(t, mo.at, mo.at + 1.5))) : lerp(900, 735, E.io(U(t, sw3.at - 0.5, sw3.at))));
  const Ky = (t) => (t < hl.at ? lerp(558, FLOOR, b1) : FLOOR);
  const Cx = (t) => (t < hl.at ? (t < tk.at - 2.0 ? lerp(1000, 760, E.io(U(t, 1.0, tk.at - 2.0))) : 760) : t < mo.at ? 330 : lerp(330, 250, E.io(U(t, mo.at, mo.at + 1.2))));
  const Tx = (t) => (t < lit.at + 0.1 ? -300 : t < mo.at ? lerp(-300, 120, E.io(U(t, lit.at + 0.1, lit.at + 2.2))) : lerp(120, 640, E.io(U(t, mo.at + 0.2, mo.at + 1.6))));
  const Sx = (t) => (t < lit.at ? -250 : t < ce.at ? lerp(-250, 560, E.io(U(t, lit.at, lit.at + 2.2))) : lerp(560, -260, E.in(U(t, ce.at, ce.at + 3.0))));
  const Lx = (t) => (t < pr.at ? 1500 : t < mo.at ? lerp(1500, 790, E.io(U(t, pr.at, pr.at + 2.0))) : lerp(790, 400, E.io(U(t, mo.at + 0.2, mo.at + 1.6))));
  const moving = (a, b, tm) => tm >= a && tm < b;
  const specs = [
    { prop: (t) => { if (t >= pr.at - 0.1 && t < ce.at + 3.5) { const lx = Lx(t), ent = t < pr.at + 2.0; if (t < mo.at - 0.5) cops([{ x: lx + 90, i: 0, f: -1, walk: ent ? 1 : 0 }, { x: lx + 150, i: 1, f: -1, walk: ent ? 1 : 0 }], t, 9500); }
        if (t >= ce.at && t < ce.at + 3.2) { const sx = Sx(t); cops([{ x: sx - 100, i: 0, f: -1, walk: 1 }, { x: sx + 100, i: 1, f: -1, walk: 1 }], t, 9560); } } },
    { b: 'C', x: Cx, f: (t) => (t < hl.at ? -1 : 1),
      pose: (t) => { const o = Object.assign({}, wk(t, (t >= 1.0 && t < tk.at - 2.0) || (t >= mo.at && t < mo.at + 1.2), 9)); if (t >= tk.at - 1.5 && t < bd.at + 1.0) { o.ra = [1.0, 1.0]; o.la = [0.9, 1.3]; o.look = -1; } if (t >= hl.at && t < sw1.at - 0.4) { o.look = 1; } return o; },
      rot: (t) => (t >= tk.at - 1.5 && t < bd.at + 0.4 ? 0.22 * E.io(U(t, tk.at - 1.5, tk.at - 0.8)) * (1 - U(t, bd.at, bd.at + 0.4)) : 0) },
    { b: 'K', x: Kx, y: Ky, f: (t) => (t < hl.at ? (t < bd.at + 0.25 ? -1 : 1) : (t < sw3.at - 0.5 ? -1 : -1)),
      rot: (t) => (t < hl.at ? -1.5708 * (1 - b1) + (tickle ? 0.06 * sinw(t, 40) : 0) : 0), dy: (t) => (t < hl.at ? -46 * sinw(Math.PI * b1, 1) : 0),
      pose: (t) => { const o = {}; if (t >= tk.at && t < bd.at + 0.8) o.mouth = 0.5 + 0.5 * sinw(t, 26); if (t >= L[3].t0 + 3 && t < L[4].t0) o.look = -1; if (t >= mo.at) o.look = -1; return o; } },
    { b: 'T', x: Tx, f: 1, show: (t) => t >= lit.at, pose: (t) => { const o = Object.assign({}, wk(t, (t >= lit.at + 0.1 && t < lit.at + 2.2) || (t >= mo.at + 0.2 && t < mo.at + 1.6), 8)); if (t >= lit.at + 2.2 && t < mo.at) { o.look = 1; o.tilt = 0.12; } return o; } },
    { b: 'S', x: Sx, f: (t) => (t >= ce.at ? -1 : 1), show: (t) => t >= lit.at && t < ce.at + 3.3,
      pose: (t) => { const o = Object.assign({}, wk(t, (t >= lit.at && t < lit.at + 2.2) || t >= ce.at, 8)); if (t >= ce.at) { o.ra = [-0.7, -0.9]; o.la = [-0.8, -1.0]; } return o; } },
    { b: 'L', x: Lx, f: (t) => (t < mo.at ? -1 : 1), show: (t) => t >= pr.at,
      pose: (t) => { const o = Object.assign({}, wk(t, (t >= pr.at && t < pr.at + 2.0) || (t >= mo.at + 0.2 && t < mo.at + 1.6), 8)); if (t >= sw2.at + 1.4 && t < ce.at + 1.5) { o.ra = [-0.35 + 0.15 * sinw(t, 6), -0.15]; o.look = -1; } if (t >= mo.at + 1.6) { o.ra = [-0.3 + 0.25 * sinw(t, 3), -0.4]; o.look = 1; } return o; } },
  ];
  const base = inBed ? camFor(lt, [[0, ON(560, 420, 1.05)], [tk.at - 0.6, ON(640, 470, 1.25)], [bd.at + 0.4, ON(600, 420, 1.0)]], 1.0) : camFor(lt, [[hl.at, WIDE], [sw1.at - 1, ON(520, 430, 1.1)], [sw2.at + 0.5, ON(620, 430, 1.1)], [ce.at, WIDE], [mo.at + 2.0, ON(700, 430, 1.05)], [sw3.at - 1, ON(790, 430, 1.25)], [sw3.at + 1.5, WIDE]], 1.1);
  const c = camScene(sh, lt, base, specs);
  cam(c, () => {
    if (inBed) {
      wallRoom(520, 2.8); openWindow(1010, 250, 120, 170, 9300); door(1180, 610, 150, 400, 9500, {}); bed(480, 664, 9400);
    } else {
      wallRoom(520, 2.8); for (const x of [120, 420, 760, 1190]) column(x, 150, 540, 62, 3500 + x); throne(1130, 600, 3600);
      if (morning) { const g = seg(lt, mo.at, mo.at + 1.5); X.save(); X.globalAlpha = g; openWindow(1010, 150, 120, 140, 9310); X.restore(); const sp = lerp(250, 150, g); X.save(); path(R(950, 80, 120, 140)); X.clip(); X.beginPath(); X.arc(1010, sp + 30, 26, 0, 6.2832); X.fillStyle = P.amber; X.fill(); X.lineWidth = 2; X.strokeStyle = P.ink; X.stroke(); for (let i = 0; i < 14; i++) { const an = i / 14 * 6.2832; line([1010 + Math.cos(an) * 34, sp + 30 + Math.sin(an) * 34], [1010 + Math.cos(an) * 56, sp + 30 + Math.sin(an) * 56], 1.6, 9320 + i, 0.2); } X.restore(); }
    }
    stageDraw(sh, lt, specs, {});
    if (inBed && lt < bd.at - 0.05) { shape([[470, 532], [690, 538], [694, 600], [468, 604]], { lw: 1.6, id: 9420, fill: PURPLE, h: [0.5, 3, 0.6], amp: 0.5 }); }
    // the blanket drawn over the sleeper until the heel is touched
    if (inBed && lt < bd.at + 0.1) { }
  });
  // a short dip when the scene moves to the hall
  const dip = Math.max(0, 1 - Math.abs(lt - hl.at) / 0.25) * 1; if (dip > 0) dipFade(dip);
};

/* ---------- 11. the clock ---------- */
SHOTS.clock = (lt, sd, sh) => {
  const hg = Cq(sh, 'hang'), push = Cq(sh, 'push'), sw = Cq(sh, 'swap'), ck = cues(sh, 'cuckoo'), L = sh.lines;
  const CLX = 900, CLY = 585;
  const clY = (t) => (t < hg.to ? lerp(-260, CLY, E.out(U(t, hg.at, hg.to))) : CLY);
  const sx = (t) => (t < push.at ? 480 : t < sw.at ? lerp(480, 740, E.in(U(t, push.at, sw.at))) : t < L[3].t0 ? 740 : lerp(740, -250, E.in(U(t, L[3].t0 + 0.3, L[3].t1 + 0.6))));
  const sayB = !!bodyLine(sh, 'CL', lt) && bodyEnv(sh, 'CL', lt) > -1 ? 1 : 0;
  const bird = Math.max(...ck.map((c) => pulseU(lt, c.at, 0.9)), sayB ? E.out(seg(lt, L[1].t0 - 0.15, L[1].t0 + 0.2)) : 0, lt >= L[4].t0 - 0.3 && lt < L[4].t1 + 0.3 ? E.out(U(lt, L[4].t0 - 0.3, L[4].t0 + 0.1)) : 0);
  const specs = [
    { b: 'CL', x: CLX, y: clY, f: -1, s: 0.9, pose: (t) => ({ bird: Math.max(...ck.map((c) => pulseU(t, c.at, 0.9)), (t >= L[1].t0 - 0.15 && t < L[1].t1 + 0.4) ? 1 : 0, (t >= L[4].t0 - 0.3 && t < L[4].t1 + 0.4) ? 1 : 0), beak: bodyEnv(sh, 'CL', t) }) },
    { b: 'L', x: 310, f: 1, pose: (t) => { const o = {}; if (t < hg.to) { o.ra = [-0.5, -0.9]; } if (t >= push.at - 0.8 && t < sw.at) { o.ra = [-0.2 + 0.2 * sinw(t, 5), -0.3]; } return o; } },
    { b: 'S', x: sx, f: (t) => (t >= L[3].t0 ? -1 : 1), rot: (t) => (t >= push.at && t < sw.at ? 0.12 * E.in(U(t, push.at, sw.at)) : 0),
      pose: (t) => { const o = Object.assign({}, wk(t, (t >= push.at && t < sw.at) || t >= L[3].t0 + 0.3, 8)); if (t >= L[2].t0 - 0.2 && t < L[3].t0) { o.ra = [-0.5, -1.7]; o.la = [1.3, 1.6]; o.look = 1; } return o; } },
    { prop: (t) => { if (t >= push.at - 0.8 && t < sw.at + 0.2) { const x = sx(t); cops([{ x: x - 90, i: 0, f: 1, walk: 1 }, { x: x - 150, i: 1, f: 1, walk: 1 }], t, 9560); } } },
  ];
  const base = camFor(lt, [[0, WIDE], [hg.at, ON(700, 380, 1.05)], [sw.at - 1.2, ON(760, 430, 1.25)], [sw.at + 2.0, WIDE]], 1.2);
  const c = camScene(sh, lt, base, specs);
  cam(c, () => {
    wallRoom(520, 2.8); for (const x of [120, 420, 1190]) column(x, 150, 540, 62, 3500 + x);
    // the bracket and the cords
    const cy = clY(lt);
    if (lt < hg.to + 0.05) { for (const d of [-1, 1]) line([CLX + d * 70, PY0], [CLX + d * 70, cy - 330 * 0.9], 3, 9700 + d, 0.3); }
    else { shape(R(CLX - 18, 150, 36, 24), { lw: 1.6, id: 9710, fill: P.ink }); line([CLX, 174], [CLX, CLY - 360], 3, 9711, 0.2); }
    stageDraw(sh, lt, specs, {});
  });
};

/* ---------- 12. the best hiding place ---------- */
function clockTower(x, y, s, id, bird, lt) {
  X.save(); X.translate(x, y); X.scale(s, s);
  shape(R(-46, -250, 92, 250), { lw: 2.2, id, h: [Math.PI / 2, 4, 0.5], sh: R(8, -250, 38, 250), sh2: [Math.PI / 2, 2.2, 0.8] });
  shape([[-60, -250], [0, -330], [60, -250]], { lw: 2.2, id: id + 1, fill: P.paper, h: [0.5, 3, 0.6] });
  X.beginPath(); X.arc(0, -180, 26, 0, 6.2832); X.fillStyle = P.paper; X.fill(); X.lineWidth = 2.2; X.strokeStyle = P.ink; X.stroke(); line([0, -180], [0, -200], 2.4, id + 2, 0.1); line([0, -180], [12, -176], 2, id + 3, 0.1);
  shape(R(-14, -118, 28, 34), { lw: 1.8, id: id + 4, fill: P.ink });
  if (bird > 0.02) { X.beginPath(); X.ellipse(0, -100 - 6 * bird, 11, 8, 0, 0, 6.2832); X.fillStyle = P.paper; X.fill(); X.lineWidth = 1.6; X.strokeStyle = P.ink; X.stroke(); X.beginPath(); X.moveTo(8, -104 - 6 * bird); X.lineTo(20, -102 - 6 * bird); X.lineTo(9, -98 - 6 * bird); X.fillStyle = P.ink; X.fill(); }
  X.restore();
}
SHOTS.hiding = (lt, sd, sh) => {
  const bag = Cq(sh, 'horns', 0), show = Cq(sh, 'show'), far = Cq(sh, 'far'), L = sh.lines;
  const sc = lt * 70;
  const specs = [
    { b: 'L', x: 360, f: 1, pose: (t) => Object.assign({}, wk(t, true, 8), t >= L[1].t0 - 0.2 ? { look: 1 } : {}) },
    { b: 'T', x: 540, f: 1, pose: (t) => { const o = Object.assign({}, wk(t, true, 8)); if (t >= show.at && t < L[4].t0 - 0.2) { o.ra = HELD; o.look = 1; } return o; },
      after: (a, t) => { if (t >= show.at && t < L[4].t0 - 0.2) { const p = handW(a, HELD), u = seg(t, show.at, show.at + 0.4, E.out); diadem(p[0] + a.f * 4, p[1] - 22 * a.s, 0.62 * a.s * u, 9800, 0.5 + 0.5 * sinw(t, 4)); } } },
  ];
  const base = camFor(lt, [[0, WIDE]], 1);
  const c = camScene(sh, lt, base, specs);
  cam(c, () => {
    X.fillStyle = P.paper; X.fillRect(-400, -400, 2100, 1500); X.save(); X.globalAlpha = 0.55; skyLines(PY0 - 100, 400, 700); X.restore();
    // hills, the little tower behind them, and the road
    const hp = []; for (let i = 0; i <= 14; i++) { const x = PX0 - 100 + i * 120; hp.push([x - (sc * 0.25) % 480 + 240, 420 - 40 * Math.sin((x + sc * 0.1) * 0.006) - 18 * Math.sin((x + sc * 0.1) * 0.017)]); } hp.sort((a, b) => a[0] - b[0]); const hl_ = [[hp[0][0] - 200, 540]].concat(hp, [[hp[hp.length - 1][0] + 200, 540]]); shape(hl_, { lw: 1.4, id: 9900, h: [0.15, 3.4, 0.5], fill: P.paper });
    const cx_ = 230 - sc * 0.08, bi = Cq(sh, 'far'); if (cx_ > -120) clockTower(cx_, 480, 0.7, 9910, bi.at < 1e8 ? pulseU(lt, bi.at, 1.0) + pulseU(lt, bi.at + 1.6, 1.0) * 0.8 : 0, lt);
    for (let k = 0; k < 7; k++) { const tx = ((1400 - (sc * 0.8 + k * 260) % 1800) + 1800) % 1800 - 300; tree(tx, 520, 6.5 + (k % 3), 9920 + k * 4); }
    floor2(560, 9950);
    for (let k = 0; k < 16; k++) { const xx = (((1400 - (sc * 1.4 + k * 130)) % 2080) + 2080) % 2080 - 300; line([xx, 600 + (k % 4) * 18], [xx + 40, 600 + (k % 4) * 18], 1.4, 9990 + k, 0.2); }
    stageDraw(sh, lt, specs, {});
  });
};

/* ---------- title and end ---------- */
SHOTS.title = (lt, sd) => {
  X.fillStyle = P.paper; X.fillRect(0, 0, W, H);
  txt('THE FIFTH SALLY', CX, 190, 74, {}); txt('or, The Mischief of King Balerion', CX, 270, 38, { italic: true }); txt('after Stanisław Lem, The Cyberiad', CX, 330, 22, { italic: true });
  // two heads, a die over one and a gear over the other; at the butt the two marks change heads
  const lx = 410, rx = 870, hy = 566, p = E.io(clamp((lt - 2.2) / 1.1));
  const dieP = bez([lx, hy - 138], [640, hy - 190], [rx, hy - 138], p), gearP = bez([rx, hy - 138], [640, hy - 90], [lx, hy - 138], p);
  halo(p < 0.5 ? 'b' : 't', lx, hy, 78, p > 0 && p < 1 ? 0.0 : 1); halo(p < 0.5 ? 't' : 'b', rx, hy, 78, p > 0 && p < 1 ? 0.0 : 1);
  if (p > 0 && p < 1) { ghostRing(lx, hy, 78); ghostRing(rx, hy, 78); }
  boxHead(lx, hy, 1.5, 9400, { f: 1, look: 1, tilt: 0.06 }); boxHead(rx, hy, 1.5, 9500, { f: -1, look: -1, stern: true, tilt: -0.06 });
  crown(rx, hy - 66, 1.8, 9600);
  emblem('b', dieP[0], dieP[1], 26 * (1 + 0.5 * Math.sin(Math.PI * p))); emblem('t', gearP[0], gearP[1], 26 * (1 + 0.5 * Math.sin(Math.PI * p)));
  if (lt > 2.2 && lt < 2.6) { const fu = (lt - 2.2) / 0.4; X.save(); X.globalAlpha = 1 - fu; star(640, hy - 20, 50 + 150 * fu, 9300, P.ink, 12); X.restore(); }
  drawHorns(640, hy + 70 + 10 * Math.sin(lt * 2), 1.6, 0.1, {});
};
SHOTS.end = (lt, sd) => {
  X.fillStyle = P.paper; X.fillRect(0, 0, W, H); X.globalAlpha = seg(lt, 0.4, 1.6);
  txt('THE FIFTH SALLY, OR THE MISCHIEF OF KING BALERION', CX, 140, 36, {}); txt('after Stanisław Lem, The Cyberiad', CX, 190, 24, { italic: true }); X.globalAlpha = 1;
  const a = { b: 'CL', kind: 'clock', x: 640, y: 620, s: 0.8, f: 1, bird: pulseU(lt, 3.0, 1.2) * 1.0 };
  halo('b', 640, 620 - 226 * 0.8, 84 * 0.8, seg(lt, 0.6, 1.4)); clockBody(a, { lines: [] }, lt); emblem('b', 640, 620 - 476 * 0.8, 22, seg(lt, 0.6, 1.4));
};

/*LOOP*/
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
  const fade = sh.shot === 'title' ? Math.max(1 - seg(lt, 0, 0.6), seg(lt, sd - 0.6, sd)) : sh.shot === 'end' ? 1 - seg(lt, 0, 0.5) : sh.shot === 'hiding' ? seg(lt, sd - 1.0, sd) : sh.shot === 'court' ? 1 - seg(lt, 0, 1.0) : 1 - seg(lt, 0, 0.3);
  if (fade > 0) { X.fillStyle = P.paper; X.globalAlpha = fade; X.fillRect(0, 0, W, H); X.globalAlpha = 1; }
  border();
};
(async () => {
  T = await (await fetch('timing/mb.json')).json();
  await document.fonts.ready; await Promise.all(['IM Fell English', 'IBM Plex Mono'].map((n) => document.fonts.load(`20px "${n}"`)));
  X = document.getElementById('film').getContext('2d');
  window.__NF = Math.ceil(T.dur * 24); window.__T = T; window.__ready = true;
})();
