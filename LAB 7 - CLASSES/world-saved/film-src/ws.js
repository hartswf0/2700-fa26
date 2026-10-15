/* How the World Was Saved: engraved film, fifth in the Seventh Sally lineage. Made by subtraction. */
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



function person(x, y, s, id, feel, I, lt, o = {}) {
  const sway = Math.sin(lt * 1.3 + id) * 0.03;
  let ang = sway, hb = [-30, -110], hf = [30, -112], dx = 0, walk = 0;
  if (feel === 'labor') { ang += 0.55 * I; hb = [-8, -104]; hf = [22, -98]; }
  if (feel === 'blow') { ang += -0.3 * I; hf = [lerp(30, 14, I), lerp(-112, -202, I)]; hb = [lerp(-30, -46, I), lerp(-110, -150, I)]; }
  if (feel === 'ache') { ang += 0.12 * I; hb = [lerp(-30, -16, I), lerp(-110, -196, I)]; hf = [lerp(30, 24, I), lerp(-112, -196, I)]; }
  if (feel === 'fear') { hb = [lerp(-30, -44, I), lerp(-110, -262, I)]; hf = [lerp(30, 46, I), lerp(-112, -262, I)]; dx = (o.runDir || 1) * 600 * Math.pow(I, 1.5); walk = I; }
  if (feel === 'sneeze') { ang += 0.45 * I; hf = [lerp(30, 20, I), lerp(-112, -192, I)]; }
  if (feel === 'grief') { ang += 0.2 * I; hb = [lerp(-30, 6, I), lerp(-110, -196, I)]; hf = [lerp(30, 22, I), lerp(-112, -200, I)]; }
  if (feel === 'joy') { hb = [-40, -240 * I - 110 * (1 - I)]; hf = [40, -240 * I - 112 * (1 - I)]; }
  const fo = { x: x + dx, y, s, f: o.f || 1, ang, id, ph: lt * 8, walk, hb: o.hb || hb, hf: o.hf || hf, hood: o.hood, short: o.short, dark: o.dark, closed: I > 0.5 && feel !== 'fear' };
  figure(fo);
  if (I > 0.25) { X.save(); X.translate(fo.x, y); X.rotate(ang); X.scale(s * (o.f || 1), s); X.beginPath(); X.ellipse(13, -190, 4, 2 + 6 * I, 0, 0, 6.283); X.fillStyle = P.ink; X.fill(); X.restore(); }
}

/* ================= helpers ================= */
let T = null, GT = 0;
const sayAt = (sh, who, lt) => { for (const l of sh.lines) if (l.who === who && lt >= l.t0 && lt < l.t1) return l.env[Math.min(l.env.length - 1, Math.floor((lt - l.t0) * 24))] || 0; return 0; };
const talking = (sh, who, lt) => sh.lines.some((l) => l.who === who && lt >= l.t0 - 0.1 && lt < l.t1 + 0.2);
const lineAt = (sh, i) => sh.lines[i];
function cam(c, fn) { X.save(); X.translate(CX, CY); X.scale(c.z, c.z); X.translate(-CX - c.x, -CY - c.y); fn(); X.restore(); }
const exists = (k) => GT < T.remove[k] && GT >= (T.make[k] || 0);
const made = (k) => GT >= (T.make[k] || 0);

/* ================= the things of the world: positions as functions of time ================= */
const SKY = 330;
const THING_POS = {
  zits: (t) => Array.from({ length: 34 }, (_, i) => [40 + hash(100, i) * 1200, 30 + hash(101, i) * 270, 10 + hash(102, i) * 8]),
  worches: (t) => [[300, 200, 80], [700, 150, 92], [1040, 210, 80]],
  pritons: (t) => Array.from({ length: 7 }, (_, i) => { const a = t * (0.3 + 0.1 * hash(110, i)) + i * 0.9; return [640 + Math.cos(a) * (300 + 200 * hash(111, i)), 160 + Math.sin(a * 1.7) * 70 + hash(112, i) * 60, 16]; }),
  gruncheons: (t) => Array.from({ length: 4 }, (_, i) => [((260 + i * 170 + t * 14 * (i % 2 ? 1 : -1)) % 900 + 900) % 900 + 150, 312, 22]),
  targalisks: (t) => [[60, 200, 26], [70, 420, 26], [1250, 380, 24]],
  shupops: (t) => Array.from({ length: 6 }, (_, i) => { const u = ((t * 0.12 + i / 6) % 1); return [1180 + Math.sin(u * 9 + i) * 30, 540 - u * 420, 10 + u * 12]; }),
  calinatifacts: (t) => [[330, 350, 26], [560, 345, 24], [790, 352, 26]],
  thists: (t) => Array.from({ length: 5 }, (_, i) => [180 + i * 95, 560, 24]),
  brashations: (t) => [[420, 210, 24], [930, 180, 24], [1180, 200, 24]],
  plusters: (t) => Array.from({ length: 5 }, (_, i) => [((150 + i * 260 + t * 8) % 1400) - 60, 70 + hash(130, i) * 90, 40]),
  laries: (t) => Array.from({ length: 3 }, (_, i) => [300 + i * 330 + Math.sin(t * 0.4 + i) * 80, 90 + Math.cos(t * 0.5 + i) * 30, 30]),
  needles: () => [[730, 628, 30]], nails: () => [[800, 640, 30]], nankeen: () => [[680, 612, 60]], nut: () => [[860, 650, 18]], nest: () => [[1100, 630, 36]],
  nautilus: () => [[1190, 622, 40]], newt: () => [[1010, 662, 40]], nettle: () => [[1230, 450, 40]],
};
/* every removal leaves holes where its instances were */
let HOLES = null;
function buildHoles() {
  HOLES = [];
  for (const k of Object.keys(T.remove)) { const tr = T.remove[k]; for (const [x, y, r] of THING_POS[k](tr)) HOLES.push({ x, y, r: r * 1.15 + 6, t0: tr + hash(x | 0, y | 0) * 0.12, seed: (x * 7 + y) | 0 }); }
  const un = T.shots.find((s) => s.shot === 'unmake'), t0 = un.t0;
  for (let i = 0; i < 30; i++) { const tt = t0 + 8 + Math.pow(i / 30, 0.7) * 24.4, sky = i % 4 !== 0; HOLES.push({ x: hash(140, i) * 1280, y: sky ? hash(141, i) * 320 : 330 + hash(142, i) * 200, r: 12 + hash(143, i) * (sky ? 44 : 26), t0: tt, seed: i * 13 }); }
}
function holesPath(gt) {
  X.beginPath(); let any = false; const c = 7;
  for (const h of HOLES) {
    if (gt < h.t0) continue; const g = clamp((gt - h.t0) / 0.45); any = true; const R = h.r * 1.5;
    for (let y = Math.floor((h.y - R) / c) * c; y < h.y + R; y += c) for (let x = Math.floor((h.x - R) / c) * c; x < h.x + R; x += c) {
      const d = Math.hypot(x + c / 2 - h.x, y + c / 2 - h.y) / h.r, n = hash((x / 21 | 0) + h.seed, (y / 21 | 0)) * 0.45 + hash((x / c | 0) + h.seed * 3, (y / c | 0)) * 0.2;
      if (d + n - 0.3 < g) X.rect(x, y, c, c);
    }
  }
  return any;
}
function drawHoles(gt) {
  if (!holesPath(gt)) return;
  X.save(); X.clip(); X.fillStyle = '#16120e'; X.fillRect(-2000, -2000, 5000, 5000);
  for (let i = 0; i < 1600; i++) { const x = hash(150, i) * 1500 - 100, y = hash(151, i) * 900 - 90; X.fillStyle = P.paper; X.globalAlpha = 0.45 + 0.55 * hash(i, BOIL >> 2); const s = 1.2 + hash(152, i) * 2; X.fillRect(x, y, s, s); if (i % 90 === 0) { X.globalAlpha = 1; star(x, y, 6, 3999 + i, P.paper, 4); } }
  X.globalAlpha = 1; X.restore();
  
}

/* ================= drawing the things ================= */
function sparkle(x, y, r, id, a) { X.save(); X.translate(x, y); X.rotate(a); for (let i = 0; i < 4; i++) { X.rotate(Math.PI / 2); X.beginPath(); X.moveTo(0, 0); X.lineTo(r * 0.25, -r * 0.25); X.lineTo(0, -r); X.lineTo(-r * 0.25, -r * 0.25); X.closePath(); X.fillStyle = P.paper; X.fill(); X.lineWidth = 1; X.strokeStyle = P.ink; X.stroke(); } X.beginPath(); X.arc(0, 0, r * 0.45, 0, 6.283); X.lineWidth = 0.8; X.stroke(); X.restore(); }
function drawThings(gt) {
  const t = gt;
  if (exists('worches')) for (const [x, y, r] of THING_POS.worches(t)) { X.save(); X.globalAlpha = 0.55; for (let i = 0; i < 22; i++) { const u = i / 21, xx = x - r * 1.6 + u * r * 3.2, top = y - r * 0.5 - Math.sin(u * Math.PI) * r * 0.5 + Math.sin(t * 0.8 + u * 7 + x) * 10; line([xx, top], [xx + Math.sin(t + u * 5) * 8, top + r * 0.45], 1.1, 2000 + i + x, 0.4, '#7a6f60'); } X.globalAlpha = 1; X.restore(); }
  if (exists('plusters')) for (const [x, y, r] of THING_POS.plusters(t)) { for (let j = 0; j < 4; j++) ball(x - r * 0.6 + j * r * 0.4, y - (j % 2) * r * 0.25, r * 0.42, 2100 + j + (x | 0), PAT.f, 1.2); }
  if (exists('laries')) THING_POS.laries(t).forEach(([x, y, r], i) => { shape([[x, y - r], [x + r * 0.6, y], [x, y + r * 0.8], [x - r * 0.6, y]], { lw: 1.4, id: 2200 + i, h: [0.78, 3, 0.5] }); ink([[x, y + r * 0.8], [x - 10, y + r * 1.6], [x + 8, y + r * 2.3], [x - 4, y + r * 3]], 1, 2210 + i, 0.6); });
  if (exists('zits')) THING_POS.zits(t).forEach(([x, y, r], i) => sparkle(x, y, r * (0.8 + 0.3 * Math.sin(t * 3 + i)), 2300 + i, t * 0.4 + i));
  if (exists('pritons')) THING_POS.pritons(t).forEach(([x, y], i) => { ball(x, y, 8, 2400 + i, PAT.f, 1.2); const fl = Math.sin(t * 14 + i) * 8; line([x - 4, y], [x - 16, y - 6 + fl], 1.6, 2410 + i, 0.2); line([x + 4, y], [x + 16, y - 6 + fl], 1.6, 2420 + i, 0.2); });
  if (exists('brashations')) THING_POS.brashations(t).forEach(([x, y], i) => { line([x, y + 30], [x, y - 20], 2, 2500 + i, 0.1); const w = Math.sin(t * 3 + i) * 6; shape([[x, y - 20], [x + 40, y - 14 + w], [x, y - 4]], { lw: 1.2, id: 2510 + i, fill: P.red }); X.save(); X.translate(x - 6, y + 2); X.rotate(-0.5); shape([[0, -4], [26, -9], [26, 9], [0, 4]], { lw: 1.2, id: 2520 + i, h: [0, 2, 0.6] }); X.restore(); });
}
function drawGroundThings(gt) {
  const t = gt;
  if (exists('gruncheons')) THING_POS.gruncheons(t).forEach(([x, y], i) => { X.save(); X.translate(x, y); X.scale(i % 2 ? 1 : -1, 1); ball(0, -14, 14, 2600 + i, PAT.m, 1.4); ball(12, -22, 7, 2610 + i, PAT.f, 1.2); for (const k of [-6, 6]) line([k, -2], [k + Math.sin(t * 6 + i + k) * 4, 4], 2, 2620 + i + k, 0.1); X.restore(); });
  if (exists('calinatifacts')) THING_POS.calinatifacts(t).forEach(([x, y], i) => { line([x, y], [x, y - 40], 2, 2700 + i, 0.1); X.save(); X.translate(x, y - 56); X.rotate(t * (0.5 + i * 0.2)); shape([[0, -16], [12, 0], [0, 16], [-12, 0]], { lw: 1.4, id: 2710 + i, h: [0.4, 2.4, 0.6] }); X.restore(); });
  if (exists('targalisks')) THING_POS.targalisks(t).forEach(([x, y], i) => { const p = []; for (let j = 0; j <= 10; j++) p.push([x + Math.sin(j * 0.6 + t * 2 + i) * 6, y - 24 + j * 5]); X.beginPath(); p.forEach(([a, b], k) => (k ? X.lineTo(a, b) : X.moveTo(a, b))); X.lineWidth = 7; X.strokeStyle = P.ink; X.stroke(); for (let j = 0; j < 10; j++) line(p[j], [p[j][0] + (j % 2 ? 9 : -9), p[j][1] - 3], 1.2, 2730 + j + i * 10, 0.1); });
  if (exists('thists')) THING_POS.thists(t).forEach(([x, y], i) => { const p = []; for (let j = 0; j < 40; j++) { const a = j * 0.45 + Math.sin(t + i) * 0.2, r = 2 + j * 0.45; p.push([x + Math.cos(a) * r, y - 24 + Math.sin(a) * r]); } line([x, y], [x, y - 24], 1.6, 2800 + i, 0.2); X.beginPath(); p.forEach(([a, b], k) => (k ? X.lineTo(a, b) : X.moveTo(a, b))); X.lineWidth = 1.2; X.strokeStyle = P.ink; X.stroke(); });
  if (exists('shupops')) THING_POS.shupops(t).forEach(([x, y, r], i) => { X.beginPath(); X.arc(x, y, r, 0, 6.283); X.fillStyle = 'rgba(235,227,207,.7)'; X.fill(); X.lineWidth = 1.2; X.strokeStyle = P.ink; X.stroke(); X.beginPath(); X.arc(x - r * 0.35, y - r * 0.35, r * 0.2, 0, 6.283); X.stroke(); });
}
function pop(k) { return clamp((GT - (T.make[k] || 0)) / 0.25); }
function tableThings() {
  const sc = (k, fn) => { if (!exists(k)) return; const [x, y] = THING_POS[k]()[0], p = pop(k); if (p <= 0) return; X.save(); X.translate(x, y); X.scale(E.out(p) * (1 + 0.2 * Math.sin(p * Math.PI)), E.out(p)); fn(); X.restore(); };
  sc('nankeen', () => { shape([[-60, -10], [40, -14], [70, 30], [60, 70], [-10, 60], [-70, 40]], { lw: 1.4, id: 3000, h: [1.2, 4, 0.4] }); for (let i = 0; i < 4; i++) ink([[-40 + i * 25, -8], [-30 + i * 22, 30], [-36 + i * 24, 60]], 1, 3001 + i, 0.6); });
  sc('needles', () => { shape(R(-26, -14, 52, 22), { lw: 1.4, id: 3010, h: [0, 2.4, 0.6] }); for (let i = 0; i < 6; i++) line([-20 + i * 8, -12], [-12 + i * 8, -40], 1.2, 3011 + i, 0.1); });
  sc('nails', () => { for (let i = 0; i < 5; i++) { X.save(); X.translate(-20 + i * 10, 0); X.rotate(-0.3 + i * 0.15); line([0, -20], [0, 8], 2.4, 3020 + i, 0.1); shape(R(-5, -24, 10, 4), { fill: P.ink, lw: 0.6, id: 3025 + i }); X.restore(); } });
  sc('nut', () => { ball(0, 0, 16, 3030, PAT.m, 1.6); ink([[0, -16], [2, 0], [0, 16]], 1, 3031, 0.4); });
  sc('nest', () => { X.beginPath(); X.ellipse(0, 0, 40, 16, 0, 0, Math.PI); X.fillStyle = PAT.d; X.fill(); for (let i = 0; i < 20; i++) { const a = hash(3040, i) * Math.PI; line([Math.cos(a) * 40, Math.sin(a) * 14], [Math.cos(a + 0.6) * 32, Math.sin(a + 0.6) * 16 - 2], 1, 3041 + i, 0.3); } ball(-10, -6, 10, 3070, PAT.f, 1.2); ball(10, -6, 10, 3071, PAT.f, 1.2); });
  sc('nautilus', () => { const p = []; for (let j = 0; j < 80; j++) { const a = j * 0.15, r = 2 + j * 0.45; p.push([Math.cos(a) * r, -20 + Math.sin(a) * r]); } X.beginPath(); X.arc(0, -20, 38, 0, 6.283); X.fillStyle = P.paper; X.fill(); X.lineWidth = 2; X.strokeStyle = P.ink; X.stroke(); X.beginPath(); p.forEach(([a, b], k) => (k ? X.lineTo(a, b) : X.moveTo(a, b))); X.lineWidth = 1.4; X.stroke(); for (let j = 0; j < 12; j++) { const a = j * 0.5; line([Math.cos(a) * 8, -20 + Math.sin(a) * 8], [Math.cos(a) * 36, -20 + Math.sin(a) * 36], 0.8, 3080 + j, 0.2); } });
  sc('nettle', () => { shape(R(-26, -6, 52, 30), { lw: 1.6, id: 3100, h: [1.57, 2.4, 0.6] }); line([0, -6], [0, -90], 2, 3101, 0.2); for (let j = 0; j < 6; j++) { const y = -20 - j * 12, d = j % 2 ? 1 : -1; shape([[0, y], [d * 26, y - 8], [d * 30, y + 4], [d * 8, y + 6]], { lw: 1, id: 3102 + j, h: [0.6, 2.2, 0.6] }); } });
  sc('newt', () => { const p = []; for (let j = 0; j <= 16; j++) p.push([-50 + j * 6, Math.sin(j * 0.6 + GT * 2) * 4]); X.beginPath(); p.forEach(([a, b], k) => (k ? X.lineTo(a, b) : X.moveTo(a, b))); X.lineWidth = 10; X.lineCap = 'round'; X.strokeStyle = P.ink; X.stroke(); X.lineWidth = 7; X.strokeStyle = P.paper; X.stroke(); X.lineCap = 'butt'; for (const [lx, d] of [[-20, 1], [10, -1], [25, 1]]) line([lx, 0], [lx + 6, 12 * d], 2, 3120 + lx, 0.1); X.beginPath(); X.arc(46, -2, 2, 0, 6.283); X.fillStyle = P.ink; X.fill(); });
}

/* ================= the set ================= */
function sky(gt, neg) {
  X.fillStyle = P.paper; X.fillRect(-600, -600, 2500, 1300);
  X.save(); X.globalAlpha = 0.45; skyLines(-600, SKY, SKY + 500); X.restore();
  ball(1040, 90, 40, 3200, PAT.f, 1.4); ball(140, 80, 26, 3201, PAT.m, 1.2);
}
function horizon(gt) {
  // the far city, ruined arches, an aqueduct
  for (let i = 0; i < 22; i++) tower(-60 + i * 66, SKY + 30, 16 + hash(3300, i) * 18, 60 + hash(3301, i) * 120, 3310 + i * 10, { t: gt, flag: i % 4 === 0 });
  shape(R(80, SKY - 30, 1100, 26), { lw: 1.6, id: 3500, h: [0, 3, 0.5] }); for (let i = 0; i < 14; i++) { const ax = 100 + i * 78; X.beginPath(); X.moveTo(ax, SKY + 40); X.lineTo(ax, SKY + 4); X.arc(ax + 28, SKY + 4, 28, Math.PI, 0); X.lineTo(ax + 56, SKY + 40); X.fillStyle = PAT.d; X.fill(); }
  shape(R(-600, SKY + 30, 2500, 230), { lw: 1.4, id: 3510, h: [0.05, 4, 0.45] });
}
function floorAndArch() {
  shape([[-600, 560], [1900, 560], [1900, 1300], [-600, 1300]], { lw: 1.8, id: 3600, h: [0.02, 3.4, 0.5] });
  for (let i = 0; i < 16; i++) line([-200 + i * 110, 560], [-400 + i * 140, 1100], 0.8, 3601 + i, 0.3);
  shape([[-600, -600], [40, -600], [40, 560], [-600, 560]], { lw: 2.4, id: 3620, h: [1.57, 3, 0.5] });
  X.beginPath(); X.moveTo(40, 560); X.lineTo(40, 120); X.quadraticCurveTo(60, -40, 200, -80); X.lineWidth = 3; X.strokeStyle = P.ink; X.stroke();
  for (let i = 0; i < 10; i++) shape(R(-40, 40 + i * 52, 70, 48), { lw: 1, id: 3630 + i, h: [0, 3, 0.5] });
}
function machine(gt, sh, lt, o = {}) {
  const x = 960, e = sh ? sayAt(sh, 'M', lt) : 0, busy = o.busy || 0, sh2 = busy ? Math.sin(gt * 40) * 1.5 * busy : 0;
  X.save(); X.translate(sh2, 0);
  // springs and pipes
  for (const dx of [-80, 80]) { for (let i = 0; i < 9; i++) X.beginPath(), X.ellipse(x + dx, 190 + i * 9, 14, 4, 0, 0, 6.283), X.lineWidth = 2, X.strokeStyle = P.ink, X.stroke(); line([x + dx, 270], [x + dx, 300], 4, 3700 + dx, 0.1); }
  // arm to the globe
  line([x + 70, 240], [x + 160, 160], 8, 3710, 0.2); line([x + 160, 160], [x + 230, 170], 8, 3711, 0.2); line([x + 230, 170], [x + 230, 240], 4, 3712, 0.1); ball(x + 160, 160, 10, 3713, PAT.m, 1.4);
  line([x - 70, 260], [x - 170, 320], 8, 3714, 0.2); ball(x - 170, 320, 10, 3715, PAT.m, 1.4); line([x - 170, 320], [x - 210, 420], 6, 3716, 0.2);
  // tank
  shape(R(x - 100, 260, 200, 300), { lw: 2.6, id: 3720, h: [1.57, 4, 0.5], sh: R(x + 40, 260, 60, 300), sh2: [1.57, 2, 0.8] });
  for (let i = 0; i < 5; i++) { for (let j = 0; j < 8; j++) { X.beginPath(); X.arc(x - 92 + j * 26, 270 + i * 70, 2.6, 0, 6.283); X.fillStyle = P.ink; X.fill(); } line([x - 100, 290 + i * 70], [x + 100, 290 + i * 70], 1, 3725 + i, 0.2); }
  shape(R(x - 52, 320, 104, 120), { lw: 2, id: 3730 }); txt('N', x, 384, 110, { bold: false });
  // dome
  X.beginPath(); X.ellipse(x, 260, 100, 22, 0, Math.PI, 0); X.fillStyle = P.paper; X.fill(); X.lineWidth = 2; X.strokeStyle = P.ink; X.stroke();
  shape(R(x - 40, 160, 80, 90), { lw: 2, id: 3740, h: [1.57, 3, 0.5] }); ball(x, 130, 44, 3741, PAT.f, 2.2); ball(x, 82, 8, 3742, PAT.m, 1.2);
  // mouth: the slot that the cloth comes out of; it pulses with the machine's voice
  shape(R(x - 60, 470, 120, 20 + e * 10), { fill: PAT.d, lw: 1.6, id: 3750 });
  if (e > 0.05) { X.save(); X.globalAlpha = e * 0.8; for (let i = 0; i < 9; i++) line([x - 50 + i * 12, 480], [x - 60 + i * 15, 470 - e * 30], 1, 3751 + i, 0.4, P.paper); X.restore(); }
  // lamp eyes on the dome flicker when it works
  for (const [dx, k] of [[-22, 0], [22, 1]]) { X.beginPath(); X.arc(x + dx, 205, 8, 0, 6.283); X.fillStyle = (busy > 0.1 && Math.floor(gt * 6 + k) % 2) || e > 0.2 ? P.paper : P.ink; X.fill(); X.lineWidth = 1.4; X.strokeStyle = P.ink; X.stroke(); }
  X.restore();
}
function globe(gt) {
  const gx = 1190, gy = 330, r = 64; line([gx, 240], [gx, gy - r], 3, 3800, 0.1);
  X.save(); X.beginPath(); X.arc(gx, gy, r, 0, 6.283); X.clip(); X.fillStyle = P.paper; X.fillRect(gx - r, gy - r, 2 * r, 2 * r);
  const n = clamp((gt - (T.make.night || 9e9)) / 1.4);
  if (n > 0) { X.globalAlpha = n; X.fillStyle = '#16120e'; X.fillRect(gx - r, gy - r, 2 * r, 2 * r); for (let i = 0; i < 40; i++) { X.fillStyle = P.paper; X.fillRect(gx - r + hash(3810, i) * 2 * r, gy - r + hash(3811, i) * 2 * r, 1.6, 1.6); } X.beginPath(); X.arc(gx + 22, gy - 20, 14, 0, 6.283); X.fillStyle = P.paper; X.fill(); X.beginPath(); X.arc(gx + 28, gy - 24, 13, 0, 6.283); X.fillStyle = '#16120e'; X.fill(); X.globalAlpha = 1; }
  X.restore(); X.beginPath(); X.arc(gx, gy, r, 0, 6.283); X.lineWidth = 2.6; X.strokeStyle = P.ink; X.stroke(); X.beginPath(); X.arc(gx, gy, r - 8, Math.PI * 1.1, Math.PI * 1.4); X.lineWidth = 2; X.strokeStyle = P.paper; X.stroke();
  shape(R(gx - 16, gy + r, 32, 20), { lw: 1.6, id: 3820, h: [0, 2, 0.6] });
}
function table() {
  shape([[600, 560], [1300, 560], [1340, 680], [640, 680]], { lw: 2, id: 3900, h: [0.02, 4.2, 0.4] });
  shape(R(640, 680, 700, 120), { lw: 2, id: 3901, h: [1.57, 3, 0.55] });
  shape(R(1170, 460, 120, 100), { lw: 1.6, id: 3902, h: [1.57, 2.8, 0.5] });
}
function trurl(x, y, s, sh, lt, o = {}) { const sp = sh ? talking(sh, 'T', lt) : false, e = sh ? sayAt(sh, 'T', lt) : 0; constructor_(x, y, s, 400, { ra: o.ra || (sp ? [-0.3 - e * 0.3, -0.2 - e * 0.4] : [1.5, 1.6]), la: o.la || [1.4, 1.65], open: sp ? 0.8 : 0, look: o.look ?? 1, lookY: o.lookY || 0, mouth: e, tilt: o.tilt || 0 }); }
function klap(x, y, s, sh, lt, o = {}) { const sp = sh ? talking(sh, 'K', lt) : false, e = sh ? sayAt(sh, 'K', lt) : 0; constructor_(x, y, s, 600, { seated: o.seated, robe: true, f: o.f || 1, ra: o.ra || (sp ? [0.1 - e * 0.5, -0.5 - e * 0.4] : [0.4, -1.83]), la: o.la || [1.2, 0.3], open: sp ? 0.8 : 0, look: o.look ?? 1, lookY: o.lookY || 0, mouth: e, tilt: o.tilt || 0, walk: o.walk }); }
function bench() { shape(R(380, 520, 200, 40), { lw: 1.8, id: 3950, h: [0, 3, 0.5] }); shape(R(390, 560, 24, 60), { lw: 1.4, id: 3951, h: [1.57, 2, 0.6] }); shape(R(546, 560, 24, 60), { lw: 1.4, id: 3952, h: [1.57, 2, 0.6] }); }

/* the whole shop at the current film time; actors drawn by the shot after the holes */
function shop(sh, lt, o = {}) {
  sky(GT); drawThings(GT); horizon(GT); drawGroundThings(GT); floorAndArch(); bench(); table(); machine(GT, sh, lt, o); globe(GT); tableThings();
  drawHoles(GT);
}

/* ================= shots ================= */
const SHOTS = {};
const WIDE = { z: 1.0, x: 0, y: 0 };
function blendCam(a, b, u) { return { z: lerp(a.z, b.z, u), x: lerp(a.x, b.x, u), y: lerp(a.y, b.y, u) }; }
const ON = (x, y, z) => ({ z, x: x - CX, y: y - CY });
function camFor(sh, lt, plan) { // plan: [[t, cam], ...] with 0.5 s eases between
  let c = plan[0][1]; for (let i = 1; i < plan.length; i++) { const [t0, cc] = plan[i]; if (lt >= t0) c = blendCam(c, cc, seg(lt, t0, t0 + 0.6, E.io)); } return c;
}
SHOTS.make = (lt, sd, sh) => {
  const L_ = sh.lines, c = camFor(sh, lt, [[0, ON(700, 380, 1.0)], [L_[1].t0 - 0.6, ON(940, 590, 1.55)], [L_[6].t0 - 0.4, ON(640, 400, 1.15)], [L_[7].t0 - 0.3, ON(960, 380, 1.9)], [L_[8].t0 - 0.2, ON(380, 420, 1.8)], [L_[9].t0 - 0.2, ON(960, 380, 1.9)], [L_[10].t0 - 0.2, ON(900, 400, 1.2)], [L_[10].t1 + 0.2, ON(1190, 340, 2.6)]]);
  cam(c, () => { shop(sh, lt, { busy: L_.some((l) => l.who === 'T' && lt > l.t1 && lt < l.t1 + 0.5) ? 1 : 0 }); trurl(300, 650, 0.95, sh, lt); });
};
SHOTS.title = (lt, sd) => { X.fillStyle = P.paper; X.fillRect(0, 0, W, H); txt('HOW THE WORLD WAS SAVED', CX, 300, 54, {}); txt('a machine that can make anything beginning with N', CX, 362, 26, { italic: true }); };
SHOTS.dare = (lt, sd, sh) => {
  const L_ = sh.lines, walk = seg(lt, 0.4, 5.6, E.lin), sat = lt > 5.8;
  const c = camFor(sh, lt, [[0, ON(640, 400, 1.06)], [L_[2].t0 - 0.4, ON(480, 400, 1.9)]]);
  cam(c, () => { shop(sh, lt); trurl(300, 650, 0.95, sh, lt);
    if (!sat) constructor_(lerp(-160, 470, walk), 650, 0.95, 600, { robe: true, ra: [1.5, 1.6], la: [1.4, 1.65], look: -1, walk: true });
    else klap(480, 640, 0.95, sh, lt, { seated: true, look: -1 }); });
};
function naturalist(x, y, s, id, lt, k) {
  const arg = Math.sin(lt * (2 + k % 3) + id) > 0;
  figure({ x, y, s, f: k % 2 ? -1 : 1, id, hb: arg ? [-46, -190 + Math.sin(lt * 7 + k) * 12] : [-30, -110], hf: k % 3 === 0 ? [44, -150] : [30, -112], hood: k % 4 === 0, short: k % 3 === 1, dark: k % 5 === 2 });
  if (k % 3 === 0) { X.save(); X.translate(x + 44 * s * (k % 2 ? -1 : 1), y - 150 * s); X.rotate(0.3); shape(R(-16 * s, -22 * s, 32 * s, 40 * s), { lw: 1.2, id: id + 50, h: [1.57, 2.4, 0.6] }); X.restore(); }
  if (arg) { X.save(); X.translate(x, y); X.scale(s * (k % 2 ? -1 : 1), s); X.beginPath(); X.ellipse(13, -190, 4, 7, 0, 0, 6.283); X.fillStyle = P.ink; X.fill(); X.restore(); }
}
SHOTS.nature = (lt, sd, sh) => {
  cam({ z: lerp(1.08, 1.0, seg(lt, 0, sd)), x: lerp(-40, 30, seg(lt, 0, sd)), y: 0 }, () => {
    X.fillStyle = P.paper; X.fillRect(-300, -300, 1900, 1400); X.save(); X.globalAlpha = 0.5; skyLines(-300, 330, 700); X.restore();
    // thunder and smoke columns
    for (const [cx, k] of [[300, 0], [900, 1]]) { for (let i = 0; i < 10; i++) { const u = i / 9, r = 30 + u * 40 + (u > 0.8 ? 40 : 0); ball(cx + Math.sin(i + lt * 0.3) * 10, 330 - u * 280, r, 4000 + k * 20 + i, PAT.m, 1.2); } }
    if ((lt > 2.0 && lt < 2.2) || (lt > 7.5 && lt < 7.7)) ink([[700, -40], [660, 60], [720, 110], [650, 220]], 3, 4050, 0.6);
    for (let i = 0; i < 18; i++) tower(-200 + i * 100, 330, 30 + hash(4060, i) * 20, 60 + hash(4061, i) * 120, 4070 + i * 10, { t: lt, flag: false });
    shape([[-300, 330], [1600, 330], [1600, 1000], [-300, 1000]], { lw: 1.4, id: 4300, h: [0.05, 4.5, 0.45] });
    for (const [px, k] of [[200, 0], [520, 1], [1060, 2]]) { line([px, 360], [px, 290], 3, 4310 + k, 0.2); for (let i = 0; i < 6; i++) { const fh = 30 + 20 * Math.sin(lt * 9 + i + k); X.beginPath(); X.moveTo(px - 24 + i * 8, 360); X.quadraticCurveTo(px - 20 + i * 8, 360 - fh, px - 16 + i * 8 + Math.sin(lt * 6 + i) * 6, 360 - fh * 1.4); X.lineWidth = 1.4; X.strokeStyle = P.ink; X.stroke(); } }
    // the mob of naturalists, in rows
    for (let r = 0; r < 4; r++) { const y = 400 + r * 90, s = 0.4 + r * 0.18, n = 12 - r * 2; for (let i = 0; i < n; i++) { const x = -100 + (i + (r % 2) * 0.5) * (1500 / n); if (r === 3 && Math.abs(x - 640) < 260) continue; naturalist(x, y, s, 4400 + r * 100 + i * 7, lt, i + r); } }
    // papers in the air
    for (let i = 0; i < 26; i++) { const u = ((lt * 0.15 + hash(4800, i)) % 1); X.save(); X.translate(hash(4801, i) * 1500 - 100 + Math.sin(lt + i) * 40, 700 - u * 800); X.rotate(lt * 2 + i); shape(R(-12, -15, 24, 30), { lw: 1, id: 4810 + i }); for (let j = 0; j < 4; j++) line([-8, -9 + j * 6], [8, -9 + j * 6], 0.6, 4840 + j, 0.1); X.restore(); }
    trurl(560, 700, 1.0, sh, lt, { ra: talking(sh, 'T', lt) ? [-0.6, -0.9] : [1.5, 1.6] }); klap(760, 700, 1.0, sh, lt, { f: -1, look: 1 });
  });
};
SHOTS.negative = (lt, sd, sh) => {
  const a = cue_(sh, 'anti'), u = clamp((lt - a) / 7);
  cam({ z: lerp(1.0, 1.05, seg(lt, 0, sd)), x: 0, y: -20 }, () => { shop(sh, lt, { busy: u > 0 && u < 1 ? 1 : 0 }); trurl(300, 650, 0.95, sh, lt, { lookY: u > 0 ? -1.2 : 0 }); klap(480, 640, 0.95, sh, lt, { seated: true, lookY: u > 0 ? -1.2 : 0 }); });
  if (u > 0) { // the antiworld: a cloud over their heads where the picture is its own negative
    X.save(); X.setTransform(1, 0, 0, 1, 0, 0); X.beginPath(); const R0 = 60 + u * 520; for (let i = 0; i <= 40; i++) { const t_ = i / 40 * 6.283, rr = R0 * (0.85 + 0.15 * Math.sin(t_ * 5 + lt * 2)); i ? X.lineTo(640 + Math.cos(t_) * rr * 1.4, 190 + Math.sin(t_) * rr * 0.55) : X.moveTo(640 + Math.cos(t_) * rr * 1.4, 190 + Math.sin(t_) * rr * 0.55); } X.closePath(); X.clip();
    X.globalCompositeOperation = 'difference'; X.fillStyle = '#ebe3cf'; X.fillRect(0, 0, W, H); X.restore();
    if (lt > a + 5.6 && lt < a + 5.9) { X.save(); X.setTransform(1, 0, 0, 1, 0, 0); X.globalCompositeOperation = 'difference'; X.fillStyle = '#ebe3cf'; X.fillRect(0, 0, W, H); X.restore(); }
  }
};
function cue_(sh, k) { const c = sh.cues.find((x) => x.k === k); return c ? c.at : 0; }
SHOTS.nothing = (lt, sd, sh) => {
  const L_ = sh.lines; const c = camFor(sh, lt, [[0, ON(640, 400, 1.04)], [L_[1].t0 - 0.4, ON(480, 420, 1.9)], [L_[2].t0 - 0.2, ON(300, 420, 1.9)], [L_[3].t0 - 0.2, ON(480, 420, 1.9)], [L_[4].t0 - 0.5, ON(960, 380, 1.6)], [L_[4].t0 + 2.6, ON(960, 400, 2.4)]]);
  cam(c, () => { shop(sh, lt); trurl(300, 650, 0.95, sh, lt); klap(480, 640, 0.95, sh, lt, { seated: true }); });
};
SHOTS.unmake = (lt, sd, sh) => {
  const L_ = sh.lines, fl = L_[3];
  const c = camFor(sh, lt, [[0, ON(640, 380, 1.12)], [5.8, ON(640, 360, 1.0)], [fl.t0 - 0.3, ON(440, 440, 2.0)], [fl.t1 + 0.4, ON(640, 360, 0.96)]]);
  const up = lt > 18 ? -1.4 : lt > 6 ? (Math.sin(lt * 0.8) > 0 ? -1 : 0.6) : 0.5;
  cam(c, () => { shop(sh, lt, { busy: lt < cue_(sh, 'halt') ? 1 : 0 }); trurl(300, 650, 0.95, sh, lt, { lookY: up, look: 0.3 });
    const stand = seg(lt, fl.t0 - 0.6, fl.t0);
    if (stand > 0.5) klap(480, 650, 0.95, sh, lt, { ra: [-1.2, -1.6], la: [-1.9, -1.5], open: 1, lookY: -0.6 }); else klap(480, 640, 0.95, sh, lt, { seated: true, lookY: lt > 18 ? -1.4 : 0 }); });
};
SHOTS.after = (lt, sd, sh) => {
  const L_ = sh.lines;
  const c = camFor(sh, lt, [[0, ON(640, 340, 0.95)], [L_[0].t0 - 0.4, ON(480, 420, 1.5)], [L_[1].t0 - 0.2, ON(960, 380, 1.7)], [L_[2].t0 - 0.2, ON(480, 420, 1.9)], [L_[3].t0 - 0.6, ON(960, 380, 2.5)], [L_[4].t0 - 0.2, ON(640, 330, 0.95)], [L_[5].t0 - 0.6, ON(480, 410, 2.3)]]);
  cam(c, () => { shop(sh, lt); trurl(300, 650, 0.95, sh, lt, { lookY: -0.6, look: 0.4 }); klap(480, 650, 0.95, sh, lt, { lookY: lt < 8 ? -1.6 : L_[5] && lt > L_[5].t0 - 0.6 ? 1.2 : -0.4, ra: talking(sh, 'K', lt) ? [-0.8, -1.3] : [1.4, 1.65], la: [1.4, 1.65] }); });
};
SHOTS.leave = (lt, sd, sh) => {
  const walk = seg(lt, 0.4, 7.0, E.lin);
  cam({ z: lerp(1.2, 0.92, seg(lt, 0, sd, E.io)), x: lerp(-60, 0, seg(lt, 0, sd)), y: lerp(40, -10, seg(lt, 0, sd)) }, () => { shop(sh, lt); trurl(300, 650, 0.95, sh, lt, { look: -1, lookY: 0.5 });
    constructor_(lerp(480, -260, walk), 650, 0.95, 600, { robe: true, f: -1, ra: [1.5, 1.6], la: [1.4, 1.65], look: 1, lookY: 1.2, walk: walk < 1, tilt: 0.1 }); });
};
SHOTS.end = (lt) => { X.fillStyle = P.paper; X.fillRect(0, 0, W, H); X.globalAlpha = seg(lt, 0.4, 1.6); txt('HOW THE WORLD WAS SAVED', CX, 300, 44, {}); txt('after Stanisław Lem, The Cyberiad', CX, 362, 24, { italic: true }); X.globalAlpha = 1; drawHoles(GT); };

/* ================= frame loop ================= */
window.__render = async (f) => {
  const t = f / 24; GT = t; BOIL = Math.floor(f / 2);
  let i = 0; for (let j = 0; j < T.shots.length; j++) if (t >= T.shots[j].t0) i = j;
  const sh = T.shots[i], lt = t - sh.t0, sd = sh.d;
  X.setTransform(1, 0, 0, 1, 0, 0); X.fillStyle = P.paper; X.fillRect(0, 0, W, H);
  X.save(); path(R(PX0, PY0, PX1 - PX0, PY1 - PY0)); X.clip();
  SHOTS[sh.shot](lt, sd, sh);
  X.restore(); X.setTransform(1, 0, 0, 1, 0, 0);
  // the soundtrack's dropouts are matched by a blank frame on each removal
  for (const k in T.remove) if (t >= T.remove[k] && t < T.remove[k] + 1 / 24) { X.fillStyle = '#16120e'; X.globalAlpha = 0.85; X.fillRect(0, 0, W, H); X.globalAlpha = 1; }
  const fade = sh.shot === 'title' ? Math.max(1 - seg(lt, 0, 0.6), seg(lt, sd - 0.6, sd)) : sh.shot === 'make' ? 1 - seg(lt, 0, 0.8) : 0;
  if (fade > 0) { X.fillStyle = P.paper; X.globalAlpha = fade; X.fillRect(0, 0, W, H); X.globalAlpha = 1; }
  border();
};
(async () => {
  T = await (await fetch('timing/ws.json')).json(); buildHoles();
  await document.fonts.ready; await Promise.all(['IM Fell English', 'IBM Plex Mono'].map((n) => document.fonts.load(`20px "${n}"`)));
  X = document.getElementById('film').getContext('2d');
  window.__NF = Math.ceil(T.dur * 24); window.__T = T; window.__ready = true;
})();
