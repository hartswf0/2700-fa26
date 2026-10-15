/* The First Sally, or The Trap of Gargantius: drawing. Same toolkit as the earlier films (ink.js plus the head of the Ferrix drawing file).
   The device is the graph: nodes are balls, connections are inked lines, and a connection is drawn the moment its click sounds. */
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

/* ================= the ship, the planet ================= */
function ship(x, y, s, id, o = {}) {
  X.save(); X.translate(x, y); X.rotate(o.ang || 0); X.scale(s, s);
  if (o.fire > 0) { const fl = o.fire; for (let i = 0; i < 6; i++) { const w = (i - 2.5) * 5; ink([[w, 4], [w * 1.8 + J(id, i) * 5, 4 + (40 + 70 * hash(id, i + 3)) * fl]], 2, id + 70 + i, 1.2); } star(0, 30 * fl, 22 * fl, id + 80, P.ink, 8); }
  for (const k of [-1, 1]) shape([[k * 22, -56], [k * 62, 2], [k * 22, 2]], { lw: 1.7, id: id + k + 2, h: [k > 0 ? 0.9 : -0.9, 3, 0.6] });
  const body = [[-25, 0], [-27, -60], [-19, -122], [0, -172], [19, -122], [27, -60], [25, 0]];
  shape(body, { lw: 2.2, id: id + 5, sh: [[7, -176], [30, -176], [30, 2], [7, 2]], sh2: [Math.PI / 2, 2.4, 0.8], h: [0.2, 7, 0.3] });
  line([-26, -44], [26, -44], 1.4, id + 6, 0.2); line([-24, -118], [24, -118], 1.2, id + 7, 0.2);
  ball(0, -92, 10, id + 8, PAT.f, 1.8);
  if (o.door !== false) { shape(R(-9, -36, 18, 34), { lw: 1.5, id: id + 9, fill: o.open ? P.ink : P.paper }); }
  if (o.ladder) for (let i = 0; i < 5; i++) line([-12, -4 - i * 7], [-30, -4 - i * 7], 1.4, id + 20 + i, 0.1);
  X.restore();
}
function discPath(x, y, r, id) { const n = Math.max(48, Math.round(r * 0.5)); X.beginPath(); for (let i = 0; i <= n; i++) { const a = i / n * 6.2832, rr = r + J(id, i % 40) * 0.9; i ? X.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr) : X.moveTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); } X.closePath(); }
function worldBall(x, y, r, id, o = {}) {
  discPath(x, y, r, id); X.fillStyle = P.paper; X.fill();
  X.save(); discPath(x, y, r, id); X.clip();
  X.translate(x, y); X.rotate(-0.18); X.translate(-x, -y);
  X.globalAlpha = 0.55; X.fillStyle = P.rose; X.fillRect(x - r - 9, y - r - 9, 2 * r + 18, 2 * r + 18);
  const rx = r * 0.06; X.beginPath(); X.ellipse(x, y, rx, r, 0, -Math.PI / 2, Math.PI / 2, false); X.arc(x, y, r + 8, Math.PI / 2, 1.5 * Math.PI, false); X.closePath(); X.fillStyle = P.amber; X.fill(); X.globalAlpha = 1;
  X.restore();
  X.save(); discPath(x, y, r, id); X.clip(); X.beginPath(); X.rect(x - r - 3, y - r - 3, 2 * r + 6, 2 * r + 6); X.arc(x - r * 0.3, y - r * 0.36, r * 0.92, 0, 6.2832); X.fillStyle = PAT.m; X.fill('evenodd'); X.restore();
  discPath(x, y, r, id); X.lineWidth = 2; X.strokeStyle = P.ink; X.stroke();
  const pts = []; for (let i = 0; i <= 28; i++) { const a = -Math.PI / 2 + i / 28 * Math.PI, px = Math.cos(a) * r * 0.06, py = Math.sin(a) * r, [qx, qy] = rot(px, py, -0.18); pts.push([x + qx, y + qy]); }
  const fl = o.flowers || 0;
  if (fl < 1) ink(pts, Math.max(2, r * 0.025), id + 1, 0.4, P.red);
  if (fl > 0) for (let i = 0; i <= 28; i++) { if (i / 28 > fl) break; const [px, py] = pts[i]; const q = Math.max(1.5, r * 0.017); for (let k = 0; k < 5; k++) { const a = k / 5 * 6.2832; X.beginPath(); X.arc(px + Math.cos(a) * q * 1.4, py + Math.sin(a) * q * 1.4, q, 0, 6.2832); X.fillStyle = i % 2 ? P.rose : P.ochre; X.fill(); } X.beginPath(); X.arc(px, py, q * 0.7, 0, 6.2832); X.fillStyle = P.ink; X.fill(); }
}
const STAND = 664;

/* ================= scene helpers ================= */
const SHOTS = {};
const Lx = (sh, i) => sh.lines[i];
function hatchSkyBand(y0, y1) { X.save(); X.globalAlpha = 0.5; skyLines(y0, y1, y1 + 500); X.restore(); }
function floorLines(y0, y1, id = 7000) { for (let y = y0, k = 0; y < y1; y += 4 + k * 0.5, k++) { X.fillStyle = P.ink; X.fillRect(PX0, y, PX1 - PX0, 0.5 + k * 0.05); } }
/* a table with legs */
function table(x, y, w, id, h = 124) { shape(R(x - w / 2, y, w, 14), { lw: 1.8, id, h: [0.1, 3, 0.6] }); for (const k of [-1, 1]) shape(R(x + k * (w / 2 - 20) - 6, y + 14, 12, h), { lw: 1.4, id: id + 1 + k, h: [Math.PI / 2, 2.4, 0.6] }); }
/* the golden box with two beads; open 0..1, link 0..1 draws the connection, pinkB 0..1 */
function goldBox(x, y, s, id, o = {}) {
  X.save(); X.translate(x, y); X.scale(s, s);
  const op = o.open ?? 1;
  if (op > 0.02) shape([[-48, -34], [48, -34], [44 - 6 * (1 - op), -34 - 46 * op], [-44 + 6 * (1 - op), -34 - 46 * op]], { lw: 2, id: id + 2, fill: P.amber, h: [0.3, 3.2, 0.5] });
  shape([[-48, 0], [48, 0], [44, -34], [-44, -34]], { lw: 2, id, fill: P.amber, h: [0.3, 3.2, 0.5] });
  shape([[-44, -34], [44, -34], [40, -38], [-40, -38]], { lw: 1.4, id: id + 1, fill: P.ink });
  const A = [-18, -48], B = [18, -48];
  if (op > 0.5) {
    const link = o.link || 0;
    if (o.far) { if (link > 0) { const fx = (o.far[0] - x) / s, fy = (o.far[1] - y) / s, pts = []; for (let i = 0; i <= 16; i++) { const u = i / 16 * link; pts.push([A[0] + (fx - A[0]) * u, A[1] + (fy - A[1]) * u + Math.sin(u * Math.PI) * 30]); } ink(pts, 2.4, id + 10, 0.6, o.pinkA ? P.rose : P.ink); } gnode(A[0], A[1], 10, id + 3, { fill: o.pinkA ? P.rose : P.paper }); }
    else {
      if (link > 0) gedge(A, B, id + 10, { u: link, lw: 2.2, col: o.pinkB > 0.5 ? P.rose : P.ink });
      gnode(A[0], A[1], 10, id + 3, { fill: o.pinkA ? P.rose : P.paper }); gnode(B[0], B[1], 10, id + 4, { fill: o.pinkB > 0.5 ? P.rose : P.paper });
    }
  }
  X.restore();
}
/* the radio on its stand: waves while it plays */
function radio(x, y, s, id, on, lt) {
  X.save(); X.translate(x, y); X.scale(s, s);
  shape(R(-50, -50, 100, 50), { lw: 2, id, h: [0.2, 3.2, 0.5] }); shape(R(-40, -40, 44, 30), { lw: 1.2, id: id + 1, h: [Math.PI / 2, 2.2, 0.8], fill: P.paper });
  ball(26, -26, 10, id + 2, PAT.f, 1.4); line([26, -26], [26 + 5, -26 - 5], 1.4, id + 3, 0.1); line([-30, -50], [-52, -92], 1.4, id + 4, 0.2);
  if (on) for (let i = 0; i < 4; i++) { const u = ((lt * 1.6 + i / 4) % 1), r = 24 + u * 70; X.globalAlpha = 1 - u; const pts = []; for (let j = 0; j <= 8; j++) { const a = -0.9 + j / 8 * 1.8; pts.push([-8 + Math.cos(a) * r - 40, -30 + Math.sin(a) * r]); } ink(pts, 1.8, id + 10 + i, 0.4); X.globalAlpha = 1; }
  X.restore();
}

/* ================= title and end ================= */
SHOTS.title = (lt, sd) => {
  X.fillStyle = P.paper; X.fillRect(0, 0, W, H);
  txt('THE FIRST SALLY', CX, 238, 70, {}); txt('or, The Trap of Gargantius', CX, 318, 38, { italic: true }); txt('after Stanisław Lem, The Cyberiad', CX, 390, 22, { italic: true });
  // the small drawing: a chain of nodes that connects itself, then closes into a ring
  const n = 9, y0 = 540, xs = Array.from({ length: n }, (_, i) => 320 + i * 80);
  const u = seg(lt, 1.2, 3.6, E.lin), ring = seg(lt, 3.8, 4.8);
  for (let i = 0; i < n - 1; i++) { const q = clamp(u * (n - 1) - i); gedge([xs[i], y0], [xs[i + 1], y0], 5100 + i, { u: q, lw: 2 }); }
  if (ring > 0) { const pts = []; for (let i = 0; i <= 24; i++) { const a = i / 24 * Math.PI; pts.push([lerp(xs[0], xs[n - 1], i / 24), y0 - Math.sin(a) * 80 * ring]); } ink(pts, 1.4, 5120, 0.5); }
  for (let i = 0; i < n; i++) { const q = clamp(u * (n - 1) - (i - 1) + 0.4); if (q > 0) gnode(xs[i], y0, 11 * E.out(q), 5130 + i, { fill: i === n - 1 && u >= 1 ? P.rose : P.paper }); }
  const k = Math.min(n - 1, Math.floor(u * (n - 1))); if (u < 1) spark(lerp(xs[k], xs[Math.min(n - 1, k + 1)], (u * (n - 1)) % 1), y0, ((u * (n - 1) * 3) % 1), 5150, 14);
};
SHOTS.end = (lt, sd) => {
  X.fillStyle = P.paper; X.fillRect(0, 0, W, H); X.globalAlpha = seg(lt, 0.4, 1.6);
  txt('THE FIRST SALLY, OR THE TRAP OF GARGANTIUS', CX, 215, 38, {}); txt('after Stanisław Lem, The Cyberiad', CX, 272, 24, { italic: true }); X.globalAlpha = 1;
  // the red line, covered in flowers
  const gy = 560; line([300, gy], [980, gy], 1.8, 5200, 0.5);
  for (let i = 0; i < 40; i++) ink([[300 + i * 17, gy], [300 + i * 17 + 4, gy + 14]], 0.8, 5210 + i, 0.2);
  const u = seg(lt, 0.8, 3.6, E.lin);
  ink([[640, gy], [640, gy - 150]], 3.4, 5300, 0.3, P.red);
  for (let i = 0; i < 16; i++) { const fy = gy - 6 - i * 9.4, tu = clamp(u * 17 - i); if (tu > 0) flower(640 + (hash(i, 3) - 0.5) * 18, fy + 10, tu, 5310 + i, i % 2 ? P.rose : P.ochre, 1.4); }
  trurl(540, gy - 6, 0.58, null, lt, { f: 1, ra: [0.45, 0.1] }); klap(740, gy - 6, 0.58, null, lt, { f: -1, ra: [0.45, 0.1] });
};

/* ================= 1. the landing ================= */
SHOTS.landing = (lt, sd, sh) => {
  const L_ = sh.lines, cab = cue(sh, 'cabin').at, gr = cue(sh, 'ground').at, shipC = cue(sh, 'ship'), radC = cue(sh, 'radio'), boxC = cue(sh, 'box').at, lk = cue(sh, 'link').at, pk = cue(sh, 'pink').at;
  if (lt < cab) {
    const u = seg(lt, 0, cab, E.lin), cm = { x: 0, y: 0, z: 1 };
    space(cm, 1, lt * 8);
    const pr = lerp(150, 250, E.io(u));
    worldBall(lerp(930, 860, u), lerp(330, 360, u), pr, 100);
    ship(lerp(120, 520, E.out(u)), lerp(560, 330, E.out(u)), lerp(0.55, 0.3, u), 300, { ang: lerp(1.05, 1.3, u), fire: 0.7 + 0.3 * Math.sin(lt * 17), door: false });
    return;
  }
  if (lt < gr) {
    const plan = [[0, ON(640, 380, 1.0)]];
    for (const [i, c] of [[1, ON(430, 400, 1.3)], [2, ON(850, 400, 1.3)], [3, ON(430, 400, 1.3)], [4, ON(850, 400, 1.3)]]) plan.push([L_[i].t0 - 0.3, c]);
    plan.push([radC.at - 0.2, ON(780, 480, 1.5)], [L_[5].t0 - 0.3, ON(850, 400, 1.3)], [L_[6].t0 - 0.3, ON(430, 420, 1.3)], [boxC - 0.2, ON(640, 520, 2.5)], [L_[7].t0 - 0.5, ON(640, 500, 3.2)], [L_[8].t0 - 0.2, ON(640, 480, 1.15)]);
    const c = camFor(lt, plan, 0.9);
    cam(c, () => {
      darkWall(PX0 - 300, PY0 - 300, PX1 + 300, 560, 2.8);
      // the window, with the planet in it
      X.save(); circ(640, 210, 120, 400); X.fillStyle = DARK; X.fill(); X.clip(); space({ x: 0, y: 0, z: 1 }, 2, lt * 4); worldBall(740, 250, 150, 410); X.restore(); circ(640, 210, 120, 401); X.lineWidth = 6; X.strokeStyle = P.ink; X.stroke(); circ(640, 210, 130, 402); X.lineWidth = 2; X.stroke();
      X.fillStyle = P.paper; X.fillRect(PX0 - 300, 560, PX1 - PX0 + 600, 400); floorLines(562, 720);
      table(640, 540, 520, 420);
      const on = lt > radC.at && lt < radC.to;
      radio(790, 540, 0.9, 430, on, lt);
      const op = seg(lt, boxC, boxC + 0.6), lku = seg(lt, lk, lk + 0.3, E.lin), pku = seg(lt, pk, pk + 0.3);
      goldBox(640, 540, 1.0, 440, { open: op, link: lku, pinkB: pku });
      if (lt > lk && lt < lk + 0.4) spark(640, 492, (lt - lk) / 0.4, 460, 18);
      if (lt > pk && lt < pk + 0.4) spark(658, 492, (lt - pk) / 0.4, 461, 18, P.rose);
      const tk = talking(sh, 'T', lt), kk = talking(sh, 'K', lt), te = sayAt(sh, 'T', lt), ke = sayAt(sh, 'K', lt);
      const offReach = lt > radC.to - 0.5 && lt < radC.to + 0.4;
      trurl(300, STAND, 1.0, sh, lt, { f: 1, ra: lt > L_[6].t0 - 0.5 && lt < L_[8].t0 ? [1.5, 1.6] : undefined });
      klap(980, STAND, 1.0, sh, lt, { f: -1, ra: offReach ? [0.7, 0.1] : kk ? undefined : [1.5, 1.6], look: 1 });
      void tk; void ke;
    });
    if (lt > lk + 0.3) linkedTag(2);
    return;
  }
  // ground
  X.fillStyle = P.paper; X.fillRect(0, 0, W, H);
  hatchSkyBand(PY0, 470);
  X.save(); X.fillStyle = P.paper; X.fillRect(PX0, 470, PX1 - PX0, 240); X.globalAlpha = 0.5; X.fillStyle = P.amber; X.fillRect(PX0, 470, 618, 240); X.fillStyle = P.rose; X.fillRect(662, 470, PX1 - 662, 240); X.restore();
  for (let k = 0; k < 30; k++) { const y = 474 + k * k * 0.26; ink([[PX0, y], [PX1, y]], 0.6 + k * 0.025, 7200 + k, 0.4); }
  const hl = [[PX0, 470]]; for (let i = 0; i <= 20; i++) hl.push([PX0 + i * (PX1 - PX0) / 20, 470 - 14 * hash(7300, i) - 6]); ink(hl, 1.6, 7301, 0.6);
  shape([[638, 470], [642, 470], [656, 698], [624, 698]], { fill: P.red, lw: 1, id: 7302 });
  ship(960, 512, 0.7, 7310, { door: false });
  const sk = cue(sh, 'shake').at, pt = cue(sh, 'part').at;
  const wk = seg(lt, pt, pt + 3.2, E.io), shk = seg(lt, sk - 0.5, sk) * (1 - seg(lt, pt - 0.2, pt + 0.3));
  const tx = lerp(528, 140, wk), kx = lerp(752, 1140, wk), ty = STAND - 20 + Math.abs(Math.sin(lt * 7)) * 5 * (wk > 0 && wk < 1 ? 1 : 0);
  const sc = 0.95; const hand = shk > 0.5 ? [0.2 + Math.sin(lt * 14) * 0.08, 0.08] : [1.5, 1.6];
  trurl(tx, ty, sc, sh, lt, { f: wk > 0.02 ? -1 : 1, ra: wk > 0.02 ? [1.5, 1.6] : hand });
  klap(kx, ty, sc, sh, lt, { f: wk > 0.02 ? 1 : -1, ra: wk > 0.02 ? [1.5, 1.6] : hand, look: 1 });
};

/* ================= rooms ================= */
function wallRoom(y = 520, sp = 2.8) { darkWall(PX0 - 400, PY0 - 400, PX1 + 400, y, sp); X.fillStyle = P.paper; X.fillRect(PX0 - 400, y, PX1 - PX0 + 800, 500); floorLines(y + 2, 720); line([PX0 - 400, y], [PX1 + 400, y], 2.4, 7400, 0.3); }
function column(x, y0, y1, w, id) { shape(R(x - w / 2, y0, w, y1 - y0), { lw: 1.8, id, h: [Math.PI / 2, 3, 0.6], sh: R(x + w * 0.1, y0, w * 0.4, y1 - y0), sh2: [Math.PI / 2, 1.6, 0.8] }); shape(R(x - w * 0.62, y0 - 14, w * 1.24, 14), { lw: 1.4, id: id + 1 }); shape(R(x - w * 0.62, y1, w * 1.24, 12), { lw: 1.4, id: id + 2 }); }
function bubble(x, y, w, h, tx, ty, id) { // a thought bubble pointing at (tx,ty)
  const p = blobPts(x, y, w / 2, h / 2, id, 24, 0.05); shape(p, { lw: 1.6, id, fill: P.paper, amp: 0.4 });
  ball(lerp(x, tx, 0.7), lerp(y + h / 2, ty, 0.55), 6, id + 1, PAT.f, 1.2); ball(lerp(x, tx, 0.88), lerp(y + h / 2, ty, 0.8), 3.5, id + 2, PAT.f, 1);
}
function cannon(x, y, s, id, rec = 0) { X.save(); X.translate(x - rec * 14, y); X.scale(s, s); shape([[-50, -12], [50, -18], [50, 6], [-50, 12]], { lw: 1.8, id, h: [0.1, 2.6, 0.6] }); shape(R(48, -20, 10, 28), { lw: 1.4, id: id + 1, fill: P.ink }); ball(-18, 24, 22, id + 2, PAT.m, 1.8); ball(-18, 24, 5, id + 3, PAT.d, 1); X.restore(); }

/* ================= 2. Atrocia ================= */
function ledger(x, y, w, h, lt, t0, id) {
  shape(R(x, y, w, h), { lw: 2, id, fill: P.paper }); txt('OFFICES OF THE CROWN', x + w / 2, y + 22, 17, { mono: true, bold: true });
  const rows = ['OFFICE OF BANNERS', 'OFFICE OF BELLS', 'OFFICE OF PARDONS', 'OFFICE OF SMILES', 'OFFICE OF EXECUTIONER'];
  rows.forEach((r, i) => { const ry = y + 50 + i * 40; shape(R(x + 14, ry, w - 28, 28), { lw: 1.1, id: id + 1 + i }); txt(r, x + 26, ry + 15, 14, { mono: true, align: 'left' });
    const u = seg(lt, t0 + i * 0.95, t0 + i * 0.95 + 0.35, E.lin); if (u > 0) ink([[x + 18, ry + 14], [x + 18 + (w - 36) * u, ry + 14]], 3, id + 20 + i, 0.4); });
}
function infoPlate(lt, sh) {
  const co = cue(sh, 'coin'), u = lt;
  X.fillStyle = P.paper; X.fillRect(0, 0, W, H);
  txt('THE OFFICE OF TREASON', 390, 64, 26, { mono: true, bold: true });
  const K = [300, 156], I = [300, 310], Ts = Array.from({ length: 5 }, (_, i) => [118 + i * 92, 480]), A = [1000, 400];
  // the border
  ink([[760, 96], [760, 660]], 3, 7500, 0.5, P.red); for (let y = 108; y < 650; y += 30) ink([[760, y], [760, y + 14]], 5, 7501 + y, 0.2, P.paper);
  txt('BORDER', 760, 84, 16, { mono: true, bold: true });
  const e1 = seg(u, 0.3, 0.9, E.lin), e2 = seg(u, 1.1, 1.8, E.lin);
  gedge(K, I, 7510, { u: e1, lw: 2 });
  Ts.forEach((t, i) => gedge(I, t, 7520 + i, { u: seg(u, 1.1 + i * 0.12, 1.5 + i * 0.12, E.lin), lw: 1.8 }));
  Ts.forEach((t, i) => gedge(t, A, 7530 + i, { u: seg(u, 2.2 + i * 0.15, 2.9 + i * 0.15, E.lin), lw: 1.3, col: P.ink }));
  void e2;
  // nodes
  crown(K[0], K[1] - 24, 1.1, 7540); gnode(K[0], K[1], 17, 7541, { pat: PAT.m }); txt('KING', K[0] + 64, K[1], 16, { mono: true, bold: true, align: 'left' });
  if (e1 > 0.6) { gnode(I[0], I[1], 14, 7542, { pat: PAT.m }); txt('ROYAL INFORMER', I[0] + 40, I[1], 16, { mono: true, bold: true, align: 'left' }); }
  Ts.forEach((t, i) => { if (seg(u, 1.1 + i * 0.12, 1.5 + i * 0.12) > 0.6) gnode(t[0], t[1], 10, 7550 + i); });
  if (u > 1.5) txt('STAFF OF TRAITORS', 300, 530, 16, { mono: true, bold: true });
  if (u > 2.2) { citizen(A[0], A[1] + 60, 2.0, 7560, { f: -1, look: -1 }); txt('ENEMY AGENT', A[0], A[1] + 102, 16, { mono: true, bold: true }); }
  // secrets go across, money comes back, only old secrets (cheap) are bought
  if (co && lt >= co.at - 0.01 || u > 3.4) {
    const cu = u - 3.4;
    for (let i = 0; i < 5; i++) for (let k = 0; k < 2; k++) {
      const f = (cu * 0.55 + i * 0.2 + k * 0.5) % 1, p = mix(Ts[i], A, f);
      shape(R(p[0] - 9, p[1] - 11, 18, 22), { lw: 1, id: 7570 + i * 2 + k, h: [0.4, 2, 0.6] });
      const q = mix(A, Ts[i], (f + 0.25) % 1); X.beginPath(); X.arc(q[0], q[1] - 8, 5, 0, 6.2832); X.fillStyle = P.amber; X.fill(); X.lineWidth = 1; X.strokeStyle = P.ink; X.stroke();
    }
    txt('OLD SECRETS ARE CHEAP', 560, 330, 15, { mono: true, italic: true });
  }
}
SHOTS.atrocia = (lt, sd, sh) => {
  const L_ = sh.lines, gC = cue(sh, 'graph').at, trC = cue(sh, 'trurl').at, ceC = cue(sh, 'cell').at, ax = cue(sh, 'axe').at, pk = cue(sh, 'pink').at, lk = cue(sh, 'link').at;
  if (lt >= gC && lt < trC) { infoPlate(lt - gC, sh); return; }
  if (lt < ceC) {
    const kw = lt < gC, c = kw ? camFor(lt, [[0, ON(700, 380, 1.0)], [L_[0].t0 + 0.4, ON(960, 400, 1.35)], [L_[0].t0 + 3.2, ON(380, 400, 1.15)], [ax - 1.8, ON(520, 500, 1.6)], [ax + 1.6, ON(700, 380, 1.0)]], 1.0) : camFor(lt, [[trC, ON(640, 400, 1.05)], [trC + 4.4, ON(640, 400, 1.2)]]);
    cam(c, () => {
      wallRoom(520);
      if (kw) {
        ledger(180, 110, 360, 280, lt, L_[0].t0 + 3.0, 7600);
        const sw = seg(lt, ax - 0.35, ax, E.in) * (1 - seg(lt, ax, ax + 0.25)), up = lt < ax - 0.35 ? 1 : 0;
        shape(R(486, 624, 64, 40), { lw: 1.8, id: 7610, h: [Math.PI / 2, 3, 0.6] }); shape(R(480, 616, 76, 10), { lw: 1.4, id: 7611, fill: P.paper });
        const a = lt < ax - 0.35 ? -1.95 + Math.sin(lt * 3) * 0.04 : lerp(-1.95, 0.3, E.in(seg(lt, ax - 0.35, ax)));
        const fade = 1 - seg(lt, ax + 0.7, ax + 1.3);
        X.globalAlpha = fade; citizen(420, 664, 1.7, 7620, { f: 1, look: 1 });
        const P0 = [446, 590], Lh = 78, e = [P0[0] + Math.cos(a) * Lh, P0[1] + Math.sin(a) * Lh]; line(P0, e, 3.2, 7621, 0.1);
        const nx = -Math.sin(a), ny = Math.cos(a); shape([[e[0] - nx * 4, e[1] - ny * 4], [e[0] + nx * 22 + Math.cos(a) * 3, e[1] + ny * 22 + Math.sin(a) * 3], [e[0] + nx * 22 + Math.cos(a) * 14, e[1] + ny * 22 + Math.sin(a) * 14], [e[0] + Math.cos(a) * 12, e[1] + Math.sin(a) * 12]], { lw: 1.4, id: 7622, h: [a, 2, 0.7] }); X.globalAlpha = 1;
        void sw; void up; if (lt > ax && lt < ax + 0.35) star(514, 612, 30 * (1 - (lt - ax) / 0.35) + 8, 7623, P.ink, 10);
        king(1000, STAND, 0.98, 7700, sh, lt, { type: 'A', seated: true, f: -1, look: -1, purse: [905, 520] });
      } else {
        king(1000, STAND, 0.98, 7700, sh, lt, { type: 'A', seated: true, f: -1, look: -1, purse: [905, 520] });
        const tb = seg(lt, trC + 0.2, trC + 1.0) * (1 - seg(lt, trC + 3.8, trC + 4.4));
        trurl(360, STAND, 0.98, sh, lt, { f: 1, tilt: 0.22 * tb, ra: [1.5, 1.6] });
        const b1 = seg(lt, trC + 1.0, trC + 1.4) * (1 - seg(lt, trC + 3.4, trC + 3.8)), b2 = seg(lt, trC + 3.8, trC + 4.2);
        if (b1 > 0) { X.save(); X.translate(900, 150); X.scale(b1, b1); X.translate(-900, -150); bubble(880, 150, 170, 120, 960, 320, 7720); cannon(870, 160, 0.9, 7730); X.restore(); }
        if (b2 > 0) { X.save(); X.translate(420, 170); X.scale(b2, b2); X.translate(-420, -170); bubble(420, 170, 150, 110, 380, 330, 7740); for (let i = 0; i < 3; i++) for (let j = 0; j < 2; j++) shape(R(366 + i * 30, 146 + j * 30, 24, 24), { lw: 1.2, id: 7750 + i * 3 + j, fill: P.paper }); for (let i = 0; i < 3; i++) ink([[366 + i * 30, 146], [390 + i * 30, 170]], 1.5, 7760 + i, 0.2); X.restore(); }
      }
    });
    return;
  }
  // the cell: Trurl alone with the bead
  const zoom = seg(lt, pk - 1.2, pk - 0.3), c = camFor(lt, [[ceC, ON(660, 400, 1.0)], [pk - 1.4, ON(700, 480, 2.6)], [L_[3].t0 - 0.3, ON(760, 500, 2.2)]], 1.0);
  void zoom;
  cam(c, () => {
    wallRoom(540, 3.0);
    shape(R(60, 540 + 50, 250, 14), { lw: 1.6, id: 7800, h: [0.1, 3, 0.6] }); for (const x of [70, 290]) shape(R(x, 604, 10, 60), { lw: 1.2, id: 7801 + x, h: [Math.PI / 2, 2.4, 0.6] });
    table(700, 548, 300, 7810, 116);
    const op = seg(lt, ceC + 0.6, ceC + 1.2), pku = seg(lt, pk, pk + 0.8), lku = seg(lt, lk, lk + 0.6, E.lin);
    goldBox(700, 548, 1.0, 7820, { open: op, link: lku, beads: 1, far: [1700, 470], pinkA: pku > 0.4 });
    trurl(380, STAND, 1.0, sh, lt, { f: 1, seated: true, look: 1, lookY: 0.5, tilt: 0.1 });
    if (lt > pk && lt < pk + 0.5) spark(682, 500, (lt - pk) / 0.5, 7830, 20, P.rose);
    if (lt > lk && lt < lk + 0.5) spark(1000, 492, (lt - lk) / 0.5, 7831, 18, P.rose);
  });
};

/* ================= 3. Ferocia ================= */
function guillotine(x, y, s, id, drop = 0, o = {}) { // y = ground
  X.save(); X.translate(x, y); X.scale(s, s);
  shape(R(-70, -14, 140, 14), { lw: 1.6, id, h: [0.1, 2.6, 0.6] });
  for (const k of [-1, 1]) shape(R(k * 40 - 8, -190, 16, 176), { lw: 1.8, id: id + 1 + k, h: [Math.PI / 2, 2.2, 0.7] });
  shape(R(-54, -206, 108, 16), { lw: 1.8, id: id + 5, h: [0.1, 2.4, 0.6] });
  const by = -176 + drop * 130; shape([[-32, by], [32, by], [32, by + 26], [-32, by + 44]], { lw: 1.6, id: id + 6, fill: P.paper, h: [0.5, 2.2, 0.7] });
  shape(R(-26, -44, 52, 30), { lw: 1.4, id: id + 7, h: [Math.PI / 2, 2.2, 0.6] });
  if (o.flowers !== false) { for (let i = 0; i < 12; i++) flower(-52 + i * 9.5, -206, 1, id + 20 + i, i % 2 ? P.rose : P.ochre, 0.9); for (const k of [-1, 1]) for (let j = 0; j < 7; j++) flower(k * 40 + (j % 2 ? 6 : -6), -22 - j * 24, 1, id + 40 + j + (k > 0 ? 8 : 0), j % 2 ? P.ochre : P.rose, 0.8); }
  X.restore();
}
function horn(x, y, s, id, ang = 0) { X.save(); X.translate(x, y); X.rotate(ang); X.scale(s, s); X.beginPath(); X.arc(0, 0, 16, 0, 6.2832); X.lineWidth = 3; X.strokeStyle = P.ink; X.stroke(); X.beginPath(); X.arc(0, 0, 10, 0, 6.2832); X.lineWidth = 2; X.stroke(); shape([[14, -4], [58, -22], [58, 22], [14, 4]], { lw: 1.6, id, fill: P.amber, h: [0.3, 2.6, 0.5] }); X.restore(); }
function houseBox(x, y, w, h, id, o = {}) { // y = ground
  shape(R(x - w / 2, y - h, w, h), { lw: 1.8, id, h: [Math.PI / 2, 3.2, 0.5], sh: R(x + w * 0.1, y - h, w * 0.4, h), sh2: [Math.PI / 2, 1.6, 0.8] });
  shape([[x - w * 0.6, y - h], [x + w * 0.6, y - h], [x, y - h - w * 0.45]], { lw: 1.8, id: id + 1, h: [-1.0, 3, 0.6] });
  shape(R(x - 16, y - 74, 32, 74), { lw: 1.6, id: id + 2, fill: P.ink }); line([x - 16, y - 40], [x + 16, y - 40], 1, id + 3, 0.1);
  for (const k of [-1, 1]) { const wx = x + k * w * 0.3; shape(R(wx - 14, y - h * 0.7, 28, 36), { lw: 1.4, id: id + 4 + k, fill: P.paper }); line([wx - 14, y - h * 0.7], [wx + 14, y - h * 0.7 + 36], 1.6, id + 6 + k, 0.1); line([wx + 14, y - h * 0.7], [wx - 14, y - h * 0.7 + 36], 1.6, id + 8 + k, 0.1); }
}
function bugleFig(x, y, ang, s, id) { X.save(); X.translate(x, y); X.rotate(ang); X.scale(s, s); ink([[0, 0], [14, 0], [50, -6]], 3, id, 0.2); shape([[50, -6], [96, -26], [96, 20], [50, 4]], { lw: 1.6, id: id + 1, fill: P.amber, h: [0.3, 2.4, 0.5] }); ball(-4, 0, 7, id + 2, PAT.f, 1.2); X.restore(); }
function ferParade(lt, sh, c0) {
  const L_ = sh.lines, crowdAt = cue(sh, 'crowd').at;
  X.fillStyle = P.paper; X.fillRect(0, 0, W, H); hatchSkyBand(PY0, 470);
  const hl = [[PX0 - 200, 470]]; for (let i = 0; i <= 30; i++) hl.push([PX0 - 200 + i * 60, 470 - 10 * hash(7900, i)]); ink(hl, 1.5, 7901, 0.6);
  X.fillStyle = P.paper; X.fillRect(PX0 - 300, 470, PX1 - PX0 + 600, 300); for (let k = 0; k < 40; k++) { const y = 474 + k * k * 0.18; ink([[PX0 - 300, y], [PX1 + 300, y]], 0.6 + k * 0.02, 7910 + k, 0.4); }
  if (lt < crowdAt) {
    const gx = 820, c = camFor(lt, [[0, ON(520, 400, 1.0)], [L_[0].t0 + 0.5, ON(300, 430, 1.35)], [L_[0].t0 + 4.5, ON(800, 430, 1.35)], [L_[0].t1 - 1.5, ON(700, 400, 1.0)]], 1.0);
    cam(c, () => {
      for (let i = 0; i < 8; i++) { const px = 100 + i * 170; line([px, 664], [px, 330], 2, 7920 + i, 0.2); shape([[px, 334], [px + 54, 346 + Math.sin(lt * 4 + i) * 4], [px, 366]], { fill: i % 2 ? P.rose : P.amber, lw: 1.2, id: 7930 + i }); }
      shape(R(150, 600, 190, 64), { lw: 1.8, id: 7940, h: [Math.PI / 2, 3, 0.6] });
      king(250, 600, 0.9, 8000, sh, lt, { type: 'F', f: 1, look: 1, ra: [-0.6 + Math.sin(lt * 2) * 0.1, -0.9], throne: false });
      guillotine(gx, STAND - 8, 1.6, 8100, 0);
      for (let i = 0; i < 3; i++) { const bx = 1000 + i * 90; citizen(bx, STAND, 1.5, 8200 + i * 20, { f: -1, look: -1, mouth: 0.4 + 0.4 * Math.sin(lt * 7 + i) }); horn(bx - 40, STAND - 60, 0.7, 8260 + i, Math.PI + 0.2 + Math.sin(lt * 5 + i) * 0.06); }
      for (let i = 0; i < 9; i++) { const mx = ((lt * 60 + i * 150) % 1500) - 150; citizen(mx, 640, 0.9, 8300 + i * 20, { f: 1, walk: 1, ph: lt * 8 + i }); }
    });
    return;
  }
  // the citizens, in a crowd, shouting the greeting
  const cheer = cue(sh, 'cheer'), env = sayAt(sh, 'H', lt), on = lt >= cheer.at - 0.1 && lt < cheer.to + 0.4;
  const c = camFor(lt, [[crowdAt, ON(640, 400, 1.0)], [cheer.at - 0.3, ON(640, 420, 1.25)], [cheer.to + 0.4, ON(640, 400, 1.0)]], 0.9);
  cam(c, () => {
    for (let row = 0; row < 4; row++) for (let i = 0; i < 16; i++) {
      const x = 60 + i * 80 + (row % 2) * 40 + (hash(row, i) - 0.5) * 20, y = 520 + row * 52, s = 0.9 + row * 0.22;
      citizen(x, y, s, 8400 + row * 400 + i * 20, { f: hash(i, row) > 0.5 ? 1 : -1, wave: on ? 0.5 + 0.5 * Math.sin(lt * 9 + i + row) : 0, mouth: on ? 0.5 + 0.5 * env : 0, look: 0, bob: on ? Math.abs(Math.sin(lt * 7 + i * 0.7)) * 3 : 0 });
    }
    const u = on ? 0.55 + 0.5 * env : 0; if (u > 0) { X.save(); X.translate(640, 250); X.scale(u * 1.1, u * 1.1); txt('HALLELUJAH!', 0, 0, 92, { bold: true }); X.restore(); }
  });
}
function ferStreet(lt, sh) {
  const L_ = sh.lines, st = cue(sh, 'street').at, u = lt - st;
  X.fillStyle = P.paper; X.fillRect(0, 0, W, H); hatchSkyBand(PY0, 440);
  X.fillStyle = P.paper; X.fillRect(PX0, 440, PX1 - PX0, 300); for (let k = 0; k < 40; k++) { const y = 446 + k * k * 0.17; ink([[PX0, y], [PX1, y]], 0.6 + k * 0.02, 8700 + k, 0.4); }
  const c = camFor(lt, [[st, ON(520, 420, 1.0)], [L_[4].t0 - 0.3, ON(560, 440, 1.5)], [L_[5].t0 - 0.2, ON(560, 440, 1.5)], [L_[6].t0 - 0.2, ON(560, 440, 1.5)]], 0.8);
  cam(c, () => {
    for (let i = 0; i < 6; i++) houseBox(60 + i * 250, 520, 170, 180 + (i % 2) * 24, 8800 + i * 20);
    const kx = lerp(-60, 400, E.out(seg(u, 0, 3.0))), walkK = u < 3.0, tk = seg(lt, L_[4].t0 - 0.2, L_[4].t0 + 0.4);
    const cx = lerp(760, 620, tk);
    const lift = seg(lt, L_[4].t1 - 1.4, L_[4].t1 - 0.8) * (1 - seg(lt, L_[5].t1 - 0.1, L_[5].t1 + 0.4));
    citizen(cx, 664, 2.0, 8950, { f: -1, look: -1, mouth: sayAt(sh, 'C', lt), wave: lift });
    if (lift > 0.1) shape(R(cx - 26, 616, 30, 20), { lw: 1.3, id: 8960, h: [0.4, 2, 0.6] });
    klap(kx, 664, 0.98, sh, lt, { f: 1, look: 1, ra: talking(sh, 'K', lt) ? undefined : [1.5, 1.6] });
    void walkK;
  });
}
function ferHouse(lt, sh) {
  const L_ = sh.lines, hs = cue(sh, 'house').at, rv = cue(sh, 'reveal').at, u = seg(lt, rv, rv + 0.5);
  const c = camFor(lt, [[hs, ON(560, 420, 1.0)], [rv - 0.8, ON(640, 450, 1.35)], [rv + 0.6, ON(480, 440, 1.2)]], 0.9);
  cam(c, () => {
    wallRoom(540, 3.0);
    shape(R(540, 150, 200, 160), { lw: 2.4, id: 9000, fill: P.paper }); line([640, 150], [640, 310], 1.6, 9001, 0.1); line([540, 230], [740, 230], 1.6, 9002, 0.1); // window
    table(740, 548, 300, 9010, 116);
    // the lamp, or the microphone
    if (u < 0.5) { shape(R(716, 500, 48, 48), { lw: 1.8, id: 9020, h: [0.4, 2.2, 0.6] }); ball(740, 480, 20, 9019, PAT.f, 1.4); const g = 0.6 + 0.4 * Math.sin(lt * 9); ink([[740, 462], [740, 440 - g * 6]], 2, 9021, 0.4); for (let i = 0; i < 6; i++) ink([[740 + Math.cos(i) * 24, 480 + Math.sin(i) * 24], [740 + Math.cos(i) * 36, 480 + Math.sin(i) * 36]], 1, 9022 + i, 0.1); }
    else { line([740, 548], [740, 470], 3.2, 9030, 0.1); shape(R(724, 548, 32, 8), { lw: 1.4, id: 9031, fill: P.ink }); ball(740, 450, 18, 9032, PAT.d, 1.8); for (let i = 0; i < 6; i++) line([726 + i * 5.6, 436], [726 + i * 5.6, 464], 0.9, 9033 + i, 0.1); ink([[740, 556], [660, 580], [560, 570], [440, 600]], 2, 9040, 1.2); }
    // the family: grandfather rocking, grandmother knitting, the children of the house busy
    const rock = Math.sin(lt * 2.4) * 0.07;
    const xs = [360, 470, 590, 860, 960, 1060];
    const kx = lerp(120, 330, E.out(seg(lt, hs, hs + 2.0))), seized = u;
    for (let i = 0; i < xs.length; i++) {
      let x = xs[i], tilt = 0, wave = 0;
      if (i === 0) tilt = rock;
      if (u > 0) { x = lerp(x, kx + 110 + i * 56, E.out(u) * 0.85); wave = u * (0.6 + 0.4 * Math.sin(lt * 10 + i)); }
      citizen(x, 664, 1.9, 9100 + i * 20, { f: i < 3 ? 1 : -1, tilt, wave, look: 0, mouth: 0 });
      if (i === 2 && u < 0.5) { ink([[x + 20, 596], [x + 52, 630]], 1.6, 9300, 0.1); ink([[x + 28, 590], [x + 60, 626]], 1.6, 9301, 0.1); ball(x + 40, 650, 9, 9302, PAT.m, 1.2); }
      if (i === 2 && u >= 0.5) { for (const [dx, dy] of [[26, 600], [64, 616]]) { X.beginPath(); X.arc(x + dx, dy, 9, 0, 6.2832); X.lineWidth = 2.6; X.strokeStyle = P.ink; X.stroke(); } ink([[x + 35, 601], [x + 55, 612]], 2, 9303, 0.2); shape([[x - 26, 520], [x + 26, 520], [x + 34, 532], [x - 34, 532]], { lw: 1.4, id: 9304, fill: P.ink }); ball(x, 590, 4, 9305, PAT.f, 1); }
    }
    klap(kx, 664, 0.98, sh, lt, { f: 1, look: 1, ra: seized > 0.3 ? [-1.9, -2.0] : [1.5, 1.6], la: seized > 0.3 ? [-1.7, -1.9] : undefined });
    if (u > 0 && u < 1) star(560, 560, 40 * (1 - u) + 10, 9310, P.ink, 10);
  });
}
function ferJail(lt, sh) {
  const L_ = sh.lines, j = cue(sh, 'jail').at, bl = cue(sh, 'block').at, ac = cue(sh, 'acquit').at;
  if (lt >= bl && lt < ac) {
    X.fillStyle = P.paper; X.fillRect(0, 0, W, H); hatchSkyBand(PY0, 470); X.fillStyle = P.paper; X.fillRect(PX0, 470, PX1 - PX0, 300); for (let k = 0; k < 40; k++) { const y = 474 + k * k * 0.18; ink([[PX0, y], [PX1, y]], 0.6 + k * 0.02, 9400 + k, 0.4); }
    const u = lt - bl;
    cam(camFor(lt, [[bl, ON(640, 400, 1.0)], [bl + 1.4, ON(760, 440, 1.3)]], 1.0), () => {
      guillotine(820, 664, 1.9, 9410, 0);
      shape(R(742, 330, 156, 40), { lw: 2, id: 9420, fill: P.paper }); txt('THIRD CLASS', 820, 351, 20, { mono: true, bold: true });
      line([760, 290], [760, 330], 1.6, 9421, 0.1); line([880, 290], [880, 330], 1.6, 9422, 0.1);
      klap(420, 664, 0.98, sh, lt, { f: 1, look: 1, ra: [1.5, 1.6], tilt: 0.12 });
      citizen(560, 664, 1.5, 9430, { f: 1, look: 1 }); citizen(300, 664, 1.5, 9431, { f: 1 });
    });
    return;
  }
  if (lt >= ac) return ferGate(lt, sh);
  const sp = seg(lt, j, j + 0.8);
  cam(camFor(lt, [[j, ON(640, 380, 1.0)], [L_[9].t0 + 3, ON(560, 420, 1.15)]], 1.5), () => {
    // stone walls
    X.fillStyle = P.paper; X.fillRect(PX0 - 300, PY0 - 300, PX1 - PX0 + 600, 1100);
    for (let r = 0; r < 12; r++) for (let i = 0; i < 12; i++) { const bx = -100 + i * 130 + (r % 2) * 65, by = 40 + r * 52; shape(R(bx, by, 130, 52), { lw: 1.2, id: 9500 + r * 20 + i, h: [0.7 + hash(r, i) * 0.4, 5, 0.3] }); }
    X.fillStyle = P.paper; X.fillRect(PX0 - 300, 600, PX1 - PX0 + 600, 300); floorLines(604, 720); line([PX0 - 300, 600], [PX1 + 300, 600], 2.4, 9490, 0.3);
    shape(R(820, 120, 120, 90), { lw: 3, id: 9491, fill: DARK }); for (let i = 1; i < 4; i++) line([820 + i * 30, 120], [820 + i * 30, 210], 3.2, 9492 + i, 0.1);
    X.save(); X.globalAlpha = 0.18; shape([[820, 210], [940, 210], [700, 600], [420, 600]], { lw: 0, fill: P.amber }); X.restore();
    for (let i = 0; i < 7; i++) ink([[PX0 + 40, 160 + 0], [PX0 + 40 + i * 20, 160 + 40 + i * 14]], 0.8, 9510 + i, 0.4); // cobwebs
    for (let i = 0; i < 4; i++) ink([[PX0 + 40 + i * 14, 168 + i * 4], [PX0 + 100 + i * 8, 168 + i * 4 + 30]], 0.7, 9520 + i, 0.4);
    // the rusted remains
    for (const [rx, ry, rw, rh] of [[1020, 640, 54, 22], [1070, 630, 30, 30], [980, 652, 38, 12]]) shape(R(rx, ry, rw, rh), { lw: 1.4, id: 9530 + rx, h: [0.6, 2, 0.7] });
    for (let i = 0; i < 40; i++) { X.fillStyle = P.red; X.globalAlpha = 0.6; X.fillRect(980 + hash(9540, i) * 130, 630 + hash(9541, i) * 34, 2, 2); X.globalAlpha = 1; }
    shape(R(400, 548, 280, 16), { lw: 1.8, id: 9550, h: [0.1, 3, 0.6] }); for (const x of [420, 650]) shape(R(x, 564, 12, 100), { lw: 1.2, id: 9551 + x, h: [Math.PI / 2, 2.4, 0.6] });
    klap(520, 664, 0.98, sh, lt, { f: 1, seated: true, look: 1, tilt: 0.1, lookY: 0.5 });
    X.globalAlpha = 1 - sp; X.fillStyle = P.ink; X.fillRect(PX0 - 300, PY0 - 300, PX1 - PX0 + 600, 1100); X.globalAlpha = 1;
  });
}
function ferGate(lt, sh) {
  const L_ = sh.lines, ac = cue(sh, 'acquit').at, bg = cue(sh, 'bugle').at, u = lt - ac;
  X.fillStyle = P.paper; X.fillRect(0, 0, W, H);
  if (lt < bg - 0.6) { // the court's paper, stamped
    hatchSkyBand(PY0, 300); shape(R(420, 150, 440, 440), { lw: 2.4, id: 9600, fill: P.paper }); for (let i = 0; i < 12; i++) ink([[460, 210 + i * 26], [820 - (i % 3) * 60, 210 + i * 26]], 1, 9610 + i, 0.4);
    txt('HIGHER COURT', 640, 180, 26, { mono: true, bold: true });
    const st = seg(u, 0.7, 1.0, E.in); if (st > 0) { X.save(); X.translate(640, 440); X.rotate(-0.22); X.scale(1.6 - 0.6 * st, 1.6 - 0.6 * st); X.globalAlpha = st; shape(R(-160, -42, 320, 84), { lw: 4, id: 9630, fill: null, col: P.red }); txt('CLEARED', 0, 0, 56, { bold: true, col: P.red }); X.restore(); }
    return;
  }
  // the palace gate and the bugle
  hatchSkyBand(PY0, 420); X.fillStyle = P.paper; X.fillRect(PX0, 600, PX1 - PX0, 120); floorLines(604, 720); line([PX0, 600], [PX1, 600], 2.4, 9640, 0.3);
  column(300, 160, 600, 90, 9650); column(980, 160, 600, 90, 9660); shape([[250, 160], [1030, 160], [900, 80], [380, 80]], { lw: 2, id: 9670, h: [-0.8, 4, 0.6] });
  shape(R(520, 280, 240, 320), { lw: 2, id: 9680, fill: P.ink }); line([640, 280], [640, 600], 2, 9681, 0.2, P.paper);
  const take = seg(lt, bg, bg + 0.7), blow = seg(lt, bg + 1.2, bg + 1.8);
  citizen(860, 664, 1.9, 9690, { f: -1, look: -1, wave: 0 });
  klap(520, 664, 1.0, sh, lt, { f: 1, look: 1, ra: blow > 0 ? [-1.5, -2.1] : [1.5, 1.6] });
  const bx = lerp(780, 600, take), by = lerp(600, 380, blow); bugleFig(blow > 0 ? 560 : bx, blow > 0 ? by : 590, blow > 0 ? -0.5 : -0.3, 1.0, 9700);
  if (lt > bg + 1.5) for (let j = 0; j < 3; j++) { const dt = (lt - bg - 1.5 - j * 0.3); if (dt < 0 || dt > 0.9) continue; X.globalAlpha = 1 - dt / 0.9; const pts = []; for (let i = 0; i <= 8; i++) { const a = -0.5 + (i / 8 - 0.5) * 1.1; pts.push([640 + 80 + Math.cos(a) * (20 + dt * 120), 340 + Math.sin(a) * (20 + dt * 120)]); } ink(pts, 1.8, 9710 + j, 0.4); X.globalAlpha = 1; }
}
SHOTS.ferocia = (lt, sd, sh) => {
  const st = cue(sh, 'street').at, hs = cue(sh, 'house').at, jl = cue(sh, 'jail').at;
  if (lt < st) ferParade(lt, sh); else if (lt < hs) ferStreet(lt, sh); else if (lt < jl) ferHouse(lt, sh); else ferJail(lt, sh);
};

/* ================= 4. the audience ================= */
const MESH = Array.from({ length: 24 }, (_, i) => { const g = (i * 7) % 24, c = g % 6, r = Math.floor(g / 6); return [220 + c * 168 + (hash(i, 61) - 0.5) * 70, 200 + r * 118 + (hash(i, 62) - 0.5) * 50]; });
const MESH_E = MESH.map((p, i) => MESH.slice(0, i).map((q, j) => [j, Math.hypot(p[0] - q[0], p[1] - q[1])]).sort((a, b) => a[1] - b[1]).slice(0, i < 2 ? 1 : 2).map((e) => e[0]));
function caption(s) { txt(s, 70, 62, 22, { mono: true, bold: true, align: 'left' }); }
function plate() { X.fillStyle = P.paper; X.fillRect(0, 0, W, H); }
function treePlate(lt, sh) {
  const L_ = sh.lines, t1 = L_[1].t0, t2 = L_[2].t0, t3 = L_[3].t0, d2 = L_[2].t1 - t2;
  plate(); caption('COMMAND');
  const lead = [640, 130], off = [[400, 270], [640, 270], [880, 270]], sol = Array.from({ length: 12 }, (_, i) => [160 + i * 90.9, 470]);
  const g1 = seg(lt, t1, L_[1].t1 - 0.4, E.lin), dead = seg(lt, t2 + d2 * 0.5, t2 + d2 * 0.5 + 0.25), gone = seg(lt, t3 + 0.2, t3 + 1.4);
  const rv = seg(lt, t2 + 0.5, t2 + 1.2), thr = seg(lt, t2 + d2 * 0.78, t2 + d2 * 0.78 + 0.4);
  const lA = 1 - gone, oA = 1 - seg(lt, t3 + 2.2, t3 + 3.2);
  X.globalAlpha = lA; if (dead < 0.5) gedge(lead, off[0], 8000, { u: seg(g1, 0, 0.25), lw: 2 }); X.globalAlpha = lA;
  for (let k = 0; k < 3; k++) { if (dead < 0.5 || k < 0) { X.globalAlpha = lA; gedge(lead, off[k], 8000 + k, { u: seg(g1, 0, 0.25), lw: 2 }); } }
  X.globalAlpha = oA; off.forEach((o, k) => { for (let j = 0; j < 4; j++) { const s_ = sol[k * 4 + j]; gedge(o, s_, 8010 + k * 4 + j, { u: seg(g1, 0.25 + k * 0.08 + j * 0.05, 0.55 + k * 0.08 + j * 0.05), lw: 1.4, col: dead > 0.5 && k !== 3 ? 'rgba(28,24,20,.35)' : P.ink }); } });
  X.globalAlpha = 1;
  // orders going down
  if (g1 > 0.95 && dead < 0.5) for (let k = 0; k < 3; k++) { const f = ((lt * 0.9 + k * 0.33) % 1); const p = mix(lead, off[k], f); X.fillStyle = P.red; X.fillRect(p[0] - 3, p[1] - 3, 6, 6); for (let j = 0; j < 4; j++) { const q = mix(off[k], sol[k * 4 + j], f); X.fillRect(q[0] - 2.5, q[1] - 2.5, 5, 5); } }
  // the leader, a rival, the throne
  X.globalAlpha = lA; if (g1 > 0.1) { crown(lead[0], lead[1] - 26, 1.2, 8100); gnode(lead[0], lead[1], 18, 8101, { pat: PAT.m }); if (dead > 0.5) { ink([[lead[0] - 24, lead[1] - 24], [lead[0] + 24, lead[1] + 24]], 4, 8102, 0.3, P.red); ink([[lead[0] + 24, lead[1] - 24], [lead[0] - 24, lead[1] + 24]], 4, 8103, 0.3, P.red); } } X.globalAlpha = 1;
  X.globalAlpha = oA; off.forEach((o, k) => { if (seg(g1, 0.2, 0.4) > 0) gnode(o[0], o[1], 12, 8110 + k, { pat: PAT.m }); }); X.globalAlpha = 1;
  sol.forEach((s_, i) => { if (seg(g1, 0.3 + (i % 4) * 0.05 + Math.floor(i / 4) * 0.08, 0.6 + (i % 4) * 0.05 + Math.floor(i / 4) * 0.08) > 0) { const jit = dead > 0.5 ? Math.sin(lt * 9 + i) * 3 * (1 - gone) : 0; gnode(s_[0] + jit, s_[1], 8, 8120 + i); } });
  if (rv > 0) { const rp = [1120, 130]; X.globalAlpha = rv * lA; gedge(rp, off[2], 8140, { u: rv, lw: 1.6, col: P.red }); crown(rp[0], rp[1] - 26, 1.2, 8141); gnode(rp[0], rp[1], 18, 8142, { pat: PAT.m, ring: P.red }); X.globalAlpha = 1; if (lt > t2 + 1.2 && lt < t2 + 1.8) star(1000, 200, 34, 8143, P.red, 10); txt('A BETTER LEADER', 1120, 84, 15, { mono: true, bold: true, col: P.red }); }
  if (thr > 0) { X.save(); X.translate(640, 270); X.scale(thr, thr); X.translate(-640, -270); crown(640, 244, 1.2, 8150); bubble(640, 170, 150, 70, 640, 250, 8151); crown(640, 188, 1.1, 8152); X.restore(); }
  if (g1 > 0.3 && lt < t2 + d2 * 0.5) { txt('LEADER MUST BE WISE', 880, 130, 16, { mono: true, bold: true, align: 'left' }); }
  if (g1 > 0.6) txt('SOLDIER MUST OBEY', 640, 520, 16, { mono: true, bold: true });
  if (lt > t2 + d2 * 0.55 && lt < t3) txt('A LEADER CAN BE KILLED', 640, 84, 16, { mono: true, bold: true, col: P.red });
  if (lt >= t3) { txt('A NECESSARY EVIL', 640, 96, 22, { mono: true, bold: true }); const e = seg(lt, t3 + 1.6, L_[3].t1 + 0.2, E.lin); for (let i = 0; i < 11; i++) gedge(sol[i], sol[i + 1], 8160 + i, { u: seg(e, i / 11, (i + 1) / 11, E.lin), lw: 1.8 }); if (e > 0.5) txt('MAKE IT UNNECESSARY', 640, 570, 18, { mono: true, bold: true }); }
}
function meshPlate(lt, sh) {
  plate(); caption('ONE WILL');
  const js = cues(sh, 'link').filter((c) => c.g === 'mesh'); let n = 0;
  js.forEach((c, i) => {
    const u = seg(lt, c.at, c.at + 0.2, E.lin); if (u <= 0) return; n = i + 1;
    MESH_E[i].forEach((j, k) => gedge(MESH[i], MESH[j], 8200 + i * 3 + k, { u, lw: 1.6 }));
  });
  js.forEach((c, i) => { const u = seg(lt, c.at, c.at + 0.2, E.out); if (u > 0) gnode(MESH[i][0], MESH[i][1], 9 * u + 1, 8300 + i); if (lt > c.at && lt < c.at + 0.2) spark(MESH[i][0], MESH[i][1], (lt - c.at) / 0.2, 8400 + i, 20); });
  linkedTag(n);
}
function reclaimFig(x, g, d, id, s, o = {}) { // a recruit, drawn big enough to show plug and socket
  const lean = (o.lean || 0) * s, hip = [x, g - 16 * s], ch = [x + lean, g - 27 * s + (o.sq || 0)], hd = [x + lean * 1.35, g - 39 * s + (o.sq || 0)];
  ink([hip, [x - 4 * s, g]], 1.6 * s * 0.7, id + 1); ink([hip, [x + 4 * s, g]], 1.6 * s * 0.7, id + 2); ink([[x - 8 * s, g], [x - 2 * s, g]], 2.2, id + 3, 0.3); ink([[x + 2 * s, g], [x + 8 * s, g]], 2.2, id + 4, 0.3);
  ink([hip, ch], 1.7 * s * 0.7, id + 5); ink([ch, hd], 1.5 * s * 0.7, id + 6);
  ink([ch, [ch[0] + d * 7 * s, ch[1] + 6 * s]], 1.4 * s * 0.7, id + 7);
  // the plug in front of the chest, the socket behind
  ink([[ch[0] + d * 6 * s, ch[1]], [ch[0] + d * 12 * s, ch[1]]], 2.6, id + 8, 0.2); ink([[ch[0] + d * 12 * s, ch[1] - 2.4 * s], [ch[0] + d * 14 * s, ch[1] - 2.4 * s]], 1.6, id + 9, 0.1); ink([[ch[0] + d * 12 * s, ch[1] + 2.4 * s], [ch[0] + d * 14 * s, ch[1] + 2.4 * s]], 1.6, id + 10, 0.1);
  X.beginPath(); X.arc(ch[0] - d * 7 * s, ch[1], 3 * s, 0, 6.2832); X.lineWidth = 1.8; X.strokeStyle = P.ink; X.stroke();
  ball(hip[0], hip[1], 4.8 * s, id + 11, PAT.f); ball(ch[0], ch[1], 6.2 * s, id + 12); ball(hd[0], hd[1], 5.4 * s, id + 13, PAT.f);
  return { hip, ch, hd };
}
function plugPlate(lt, sh) {
  const L_ = sh.lines; plate(); caption('PLUG AND SOCKET');
  const g = 560, s = 2.5, js = cues(sh, 'link').filter((c) => c.g === 'plug');
  X.fillStyle = P.paper; ink([[PX0, g], [PX1, g]], 2, 8500, 0.5); for (let k = 0; k < 14; k++) ink([[PX0, g + 6 + k * k * 0.5 + k * 4], [PX1, g + 6 + k * k * 0.5 + k * 4]], 0.6, 8501 + k, 0.4);
  const x0 = 960, F = (i) => x0 - 48 * i, pos = [];
  for (let i = 0; i < 5; i++) { let x = x0 - 150 * i; if (i === 0) x = x0; else { const c = js[i - 1]; x = lerp(x0 - 150 * i, F(i), seg(lt, c.at - 0.45, c.at, E.in)); } pos.push(x); }
  const parts = pos.map((x, i) => reclaimFig(x, g, 1, 8510 + i * 20, s, { lean: i > 0 && lt < js[i - 1].at ? (lt > js[i - 1].at - 0.45 ? 2.2 : 0) : 0 }));
  js.forEach((c, i) => { const a = parts[i + 1].ch, b = parts[i].ch; gedge([a[0] + 8 * s, a[1]], [b[0] - 7 * s, b[1]], 8700 + i, { u: seg(lt, c.at, c.at + 0.12, E.lin), lw: 2.6 }); if (lt > c.at && lt < c.at + 0.2) spark((a[0] + b[0]) / 2, a[1], (lt - c.at) / 0.2, 8710 + i, 22); });
  const n = 1 + js.filter((c) => lt >= c.at).length; linkedTag(n);
  // loupe: the plug going into the socket
  const lx = 230, ly = 240, lr = 150, u = seg(lt, js[0].at - 0.3, js[0].at, E.in);
  X.save(); circ(lx, ly, lr, 8800); X.fillStyle = P.paper; X.fill(); X.clip();
  hatch(0.8, 6, 0.5, [lx - lr, ly - lr, lx + lr, ly + lr]);
  shape([[lx - 150, ly - 30], [lx - 150, ly + 30], [lx + 10, ly + 30], [lx + 10, ly - 30]], { lw: 2.4, id: 8801, fill: P.paper, h: [0.3, 3, 0.5] });
  X.beginPath(); X.arc(lx + 20, ly, 46, 0, 6.2832); X.lineWidth = 3; X.strokeStyle = P.ink; X.fillStyle = P.paper; X.fill(); X.stroke();
  for (const k of [-1, 0, 1]) { X.beginPath(); X.arc(lx + 20 + 10, ly + k * 22, 5.5, 0, 6.2832); X.fillStyle = P.ink; X.fill(); }
  const px = lerp(lx + 190, lx + 74, u); shape([[px, ly - 20], [px + 80, ly - 20], [px + 80, ly + 20], [px, ly + 20]], { lw: 2.4, id: 8802, fill: P.paper, h: [-0.3, 3, 0.5] });
  for (const k of [-1, 0, 1]) { line([px - 22, ly + k * 22], [px, ly + k * 22], 3, 8803 + k, 0.1); }
  X.restore(); circ(lx, ly, lr, 8800); X.lineWidth = 3; X.strokeStyle = P.ink; X.stroke();
  txt('PLUG', 150, 420, 18, { mono: true, bold: true }); txt('SOCKET', 320, 420, 18, { mono: true, bold: true });
  line([parts[1].ch[0] + 14 * s, parts[1].ch[1]], [parts[1].ch[0] + 14 * s, 420], 1.2, 8810, 0.1); txt('PLUG IN FRONT', parts[1].ch[0] + 14 * s, 408, 15, { mono: true, bold: true });
  txt('SOCKET BEHIND', parts[4].ch[0] - 20, 408, 15, { mono: true, bold: true }); line([parts[4].ch[0] - 7 * s, parts[4].ch[1]], [parts[4].ch[0] - 7 * s, 416], 1.2, 8811, 0.1);
  const done = seg(lt, js[3].at + 0.3, js[3].at + 1.2); if (done > 0) { X.globalAlpha = done; const x1 = pos[4] - 50, x2 = pos[0] + 60; const pts = []; for (let i = 0; i <= 40; i++) { const a = i / 40 * 6.2832; pts.push([(x1 + x2) / 2 + Math.cos(a) * (x2 - x1) / 2, 470 + Math.sin(a) * 120]); } ink(pts, 2, 8820, 0.6); txt('ONE MIND', (x1 + x2) / 2, 332, 18, { mono: true, bold: true }); X.globalAlpha = 1; }
}
function ladderPlate(lt, sh) {
  plate(); caption('WISDOM GROWS WITH THE NUMBER OF NODES');
  const rungs = cues(sh, 'rung'), cx = [175, 465, 755, 1045], rad = [34, 58, 92, 138], nv = [14, 28, 60, 110], bar = [70, 130, 200, 290], names = ['SERGEANT', 'COLONEL', 'FIELD MARSHAL', 'ALL STRATEGISTS'], units = ['PLATOON', 'COMPANY', 'BRIGADE', 'DIVISION'];
  rungs.forEach((r, k) => {
    const u = seg(lt, r.at, r.at + 0.8, E.out); if (u <= 0) return; const cy = 310;
    const pts = []; for (let i = 0; i < nv[k]; i++) { const a = i * 2.39996, rr = rad[k] * Math.sqrt((i + 0.5) / nv[k]) * u; pts.push([cx[k] + Math.cos(a) * rr, cy + Math.sin(a) * rr]); }
    for (let i = 0; i < pts.length; i++) for (const j of [i - 1, i - 3, i - 5]) if (j >= 0) gedge(pts[i], pts[j], 8900 + k * 400 + i * 3 + (i - j), { lw: 0.9, amp: 0.3 });
    pts.forEach((p, i) => gnode(p[0], p[1], k < 2 ? 5.5 : 3.8, 9400 + k * 130 + i, { lw: 0.9 }));
    txt(units[k], cx[k], 130, 18, { mono: true, bold: true }); txt(`${r.n} NODES`, cx[k], 156, 15, { mono: true });
    ink([[cx[k] - bar[k] / 2, 520], [cx[k] - bar[k] / 2 + bar[k] * u, 520]], 7, 9900 + k, 0.4);
    if (k === 3 && u > 0.9) { X.beginPath(); X.moveTo(cx[k] + bar[k] / 2, 520); X.lineTo(cx[k] + bar[k] / 2 + 16, 520); X.lineTo(cx[k] + bar[k] / 2 + 2, 508); X.lineTo(cx[k] + bar[k] / 2 + 2, 532); X.closePath(); X.fillStyle = P.ink; X.fill(); }
    txt('THINKS LIKE', cx[k], 556, 14, { mono: true }); txt(names[k], cx[k], 582, 18, { mono: true, bold: true });
    if (lt > r.at && lt < r.at + 0.25) spark(cx[k], cy, (lt - r.at) / 0.25, 9950 + k, 30);
  });
}
function selfPlate(lt, sh) {
  plate(); caption('AN ARMY WITH ONE LEADER, ITSELF');
  const s = cue(sh, 'self'), u = seg(lt, s.at + 0.3, s.at + 3.0, E.io), z = 1 + 0.18 * seg(lt, s.at, s.to);
  cam(ON(640, 380, z), () => {
    MESH.forEach((p, i) => MESH_E[i].forEach((j, k) => gedge(p, MESH[j], 8200 + i * 3 + k, { lw: 1.6 })));
    MESH.forEach((p, i) => gnode(p[0], p[1], 9, 8300 + i));
    const pts = [], cx = 640, cy = 360, rx = 520, ry = 280, a0 = -Math.PI / 2, tot = u * (Math.PI * 2 - 0.5);
    for (let i = 0; i <= 80; i++) { const a = a0 + (i / 80) * tot; pts.push([cx + Math.cos(a) * rx, cy + Math.sin(a) * ry]); }
    if (pts.length > 2) ink(pts, 3.4, 9990, 0.6, P.red);
    if (u > 0.98) { const q = pts[pts.length - 1], q0 = pts[pts.length - 3]; const ang = Math.atan2(q[1] - q0[1], q[0] - q0[0]); X.save(); X.translate(q[0], q[1]); X.rotate(ang); X.beginPath(); X.moveTo(16, 0); X.lineTo(-10, -10); X.lineTo(-10, 10); X.closePath(); X.fillStyle = P.red; X.fill(); X.restore(); }
    if (u > 0.5) { txt('ITS OWN LEADER', cx, cy - ry - 24, 22, { mono: true, bold: true, col: P.red }); }
  });
}
function hallBG(o = {}) { wallRoom(560, 3.0); column(150, 100, 560, 70, 9000); column(1130, 100, 560, 70, 9010); column(500, 130, 560, 50, 9020); column(780, 130, 560, 50, 9030); }
SHOTS.audience = (lt, sh0, sh) => {
  const L_ = sh.lines, win = (k) => { const c = cue(sh, k); return lt >= c.at && lt < c.to; };
  if (win('tree')) return treePlate(lt, sh);
  if (win('mesh')) return meshPlate(lt, sh);
  if (win('plug')) return plugPlate(lt, sh);
  if (win('ladder')) return ladderPlate(lt, sh);
  if (win('self')) return selfPlate(lt, sh);
  const kt = talking(sh, 'K', lt), c = camFor(lt, [[0, ON(640, 380, 1.0)], [L_[0].t0, ON(700, 400, 1.2)], [L_[7].t0 - 0.5, ON(420, 380, 1.5)], [L_[8].t0 - 0.2, ON(900, 420, 1.35)], [L_[9].t0 - 0.2, ON(460, 400, 1.35)]], 0.9);
  cam(c, () => {
    hallBG();
    king(1000, STAND, 1.0, 9200, sh, lt, { type: 'F', seated: true, f: -1, who: 'F', look: -1 });
    klap(360, STAND, 1.0, sh, lt, { f: 1, look: 1 });
    void kt;
  });
};

/* ================= 5. the platoon ================= */
function soldierDraw(x, g, d, id, s, o = {}) { return reclaimFig(x, g, d, id, s, o); }
function dragoon(x, y, s, id, o = {}) { // a horse and a rider, facing left; o.fall tips it over
  X.save(); X.translate(x, y); X.rotate((o.fall || 0) * 1.4); X.globalAlpha = 1 - (o.fade || 0); X.scale(-s, s);
  const g = o.gait || 0;
  for (const [lx, ph] of [[-30, 0], [-18, 1.6], [22, 3.1], [34, 4.6]]) { const sw = Math.sin(g + ph) * 12; ink([[lx, -34], [lx + sw * 0.5, -16], [lx + sw, 0]], 2.6, id + lx, 0.4); }
  shape(blobPts(0, -46, 46, 22, id + 1, 18, 0.06), { lw: 1.8, id: id + 1, h: [0.2, 3.2, 0.5] });
  shape([[34, -56], [58, -92], [76, -88], [78, -74], [58, -66], [44, -44]], { lw: 1.6, id: id + 2, h: [0.7, 2.6, 0.6] }); ball(66, -82, 2.4, id + 3, PAT.d, 1);
  ink([[-46, -52], [-64, -34], [-60, -10]], 2.2, id + 4, 0.5);
  ink([[0, -66], [0, -96]], 2.2, id + 5, 0.2); ball(0, -108, 8, id + 6, PAT.f, 1.4); ink([[0, -96], [-14, -80]], 1.8, id + 7, 0.2); ink([[0, -96], [20, -96], [60, -118]], 1.6, id + 8, 0.2);
  X.restore();
}
function professor(x, g, s, id, o = {}) { citizen(x, g, s, id, { f: -1, look: -1, walk: 1, ph: o.ph || 0 }); shape([[x - 12 * s, g - 56 * s], [x + 12 * s, g - 56 * s], [x + 8 * s, g - 62 * s], [x - 8 * s, g - 62 * s]], { lw: 1, id: id + 90, fill: P.ink }); shape(R(x - 8 * s, g - 40 * s, 12 * s, 9 * s), { lw: 1, id: id + 91, h: [0.5, 1.6, 0.6] }); }
function fieldBG(g) { X.fillStyle = P.paper; X.fillRect(0, 0, W, H); hatchSkyBand(PY0, g); const hl = [[PX0 - 300, g]]; for (let i = 0; i <= 50; i++) hl.push([PX0 - 300 + i * 60, g - 6 * hash(9800, i)]); ink(hl, 1.5, 9801, 0.6); X.fillStyle = P.paper; X.fillRect(PX0 - 300, g, PX1 - PX0 + 1200, 400); for (let k = 0; k < 40; k++) { const y = g + 4 + k * k * 0.14; ink([[PX0 - 300, y], [PX1 + 900, y]], 0.6 + k * 0.02, 9810 + k, 0.4); } }
function platoonScene(lt, sh) {
  const L_ = sh.lines, dr = cue(sh, 'drill').at, ch = cue(sh, 'charge').at, cl = cue(sh, 'clash').at, wr = cue(sh, 'wire').at;
  const js = cues(sh, 'link'), g = 560, s = 1.9;
  const cmd = L_[1].t0, closeT = i => js[i - 1].at;
  const xFinal = (i) => 780 - i * 26, xInit = (i) => 780 - i * 62;
  const arrive = (i) => i === 0 ? 1 : seg(lt, closeT(i) - 0.5, closeT(i), E.in);
  const xs = Array.from({ length: 14 }, (_, i) => lerp(xInit(i), xFinal(i), arrive(i)));
  const chargeU = seg(lt, ch, cl + 0.6, E.in), cmx = lerp(0, 760, chargeU);
  const camX = lerp(0, 420, seg(lt, ch + 0.3, cl + 0.4));
  cam({ z: 1, x: camX, y: 0 }, () => {
    fieldBG(g);
    // sergeant, large, to the side
    const raise = seg(lt, cmd - 0.2, cmd + 0.3) * (1 - seg(lt, cmd + 1.0, cmd + 1.4));
    reclaimFig(300 + cmx * 0, g, 1, 9830, 2.9, { lean: 0 });
    if (raise > 0) { X.globalAlpha = 1; ink([[316, g - 78], [352, g - 118 - raise * 20]], 3, 9831, 0.3); star(356, g - 130 - raise * 20, 20 * raise, 9832, P.ink, 8); }
    // the platoon
    const gait = lt > ch ? lt * 11 : 0;
    const pts = [];
    for (let i = 0; i < 14; i++) { const x = xs[i] + cmx, bob = lt > ch && lt < cl + 0.8 ? Math.abs(Math.sin(gait + i * 0.2)) * 4 : 0; const o = reclaimFig(x, g - bob, 1, 9900 + i * 20, s, { lean: lt > ch ? 3 : 0 }); pts.push(o.ch); }
    for (let i = 1; i < 14; i++) if (lt >= closeT(i)) { const a = pts[i], b = pts[i - 1]; gedge([a[0] + 9 * s, a[1]], [b[0] - 7 * s, b[1]], 9700 + i, { u: seg(lt, closeT(i), closeT(i) + 0.1, E.lin), lw: 2.2, col: lt > ch ? P.red : P.ink }); if (lt < closeT(i) + 0.2) spark((a[0] + b[0]) / 2, a[1], (lt - closeT(i)) / 0.2, 9710 + i, 14); }
    // the dragoons
    const dx = lerp(1650, 1050, seg(lt, ch + 0.2, cl, E.lin)), hit = seg(lt, cl, cl + 0.5), scat = seg(lt, cl, cl + 1.6);
    if (lt > ch - 0.5) {
      for (let sq = 0; sq < 3; sq++) for (let r = 0; r < 3; r++) { const bx = dx + 170 + sq * 130 + r * 50, by = g - 4 + r * 8; const ox = scat * (60 + hash(sq, r) * 160) * (sq + 1) * 0.6, fall = hit * (hash(r, sq + 4) > 0.2 ? 1 : 0.4); dragoon(bx - ox * 0.0 + ox * 0.3, by + scat * 20 * 0 , 0.85, 9300 + sq * 100 + r * 20, { gait: lt * 12 + r, fall: fall * (0.5 + hash(sq, r) * 0.5), fade: seg(lt, cl + 1.0, cl + 2.4) }); }
      for (let p = 0; p < 6; p++) { professor(dx + p * 30, g - 4, 1.3, 9500 + p * 100, { ph: lt * 10 + p }); }
    }
    if (hit > 0 && hit < 1) star(1060 + camX * 0.0, g - 70, 50 * (1 - hit) + 14, 9600, P.ink, 12);
  });
  if (lt > cmd + 0.4) linkedTag(1 + js.filter((c) => lt >= c.at).length);
}
function wirePlate(lt, sh) {
  const wr = cue(sh, 'wire').at, ct = cue(sh, 'cart').at, rows = cues(sh, 'row'), L_ = sh.lines;
  X.fillStyle = P.paper; X.fillRect(0, 0, W, H);
  X.save(); X.globalAlpha = 0.4; X.fillStyle = P.amber; X.fillRect(PX0, PY0, 618 - PX0, PY1 - PY0); X.fillStyle = P.rose; X.fillRect(662, PY0, PX1 - 662, PY1 - PY0); X.restore();
  for (let y = PY0; y < PY1; y += 5) { ink([[PX0, y], [618, y]], 0.5, 10000 + y, 0.3); ink([[662, y], [PX1, y]], 0.5, 10300 + y, 0.3); }
  shape([[636, PY0], [644, PY0], [650, PY1], [630, PY1]], { fill: P.red, lw: 1, id: 10600 });
  txt('ATROCIA', 330, 66, 20, { mono: true, bold: true }); txt('FEROCIA', 950, 66, 20, { mono: true, bold: true });
  const grid = (x0, side) => { const P_ = []; for (let r = 0; r < 8; r++) for (let c = 0; c < 12; c++) P_.push([x0 + c * 38 + (side < 0 ? 0 : 0), 130 + r * 52]); return P_; };
  for (const [x0, side] of [[100, -1], [724, 1]]) {
    const pts = grid(x0, side);
    rows.forEach((rw, r) => {
      const u = seg(lt, rw.at, rw.at + 0.5, E.lin);
      for (let c = 0; c < 12; c++) { const p = pts[r * 12 + c]; if (c > 0) gedge(pts[r * 12 + c - 1], p, 10700 + r * 40 + c + (side > 0 ? 400 : 0), { u: seg(u, c / 12, (c + 1) / 12, E.lin), lw: 1.4, col: P.ink }); if (r > 0) gedge(pts[(r - 1) * 12 + c], p, 11300 + r * 40 + c + (side > 0 ? 400 : 0), { u, lw: 1.0, col: P.ink }); }
    });
    pts.forEach((p, i) => { const r = Math.floor(i / 12), rw = rows[r]; gnode(p[0], p[1], 7, 11900 + i + (side > 0 ? 100 : 0), { fill: lt >= rw.at ? P.paper : P.paper, pat: lt >= rw.at ? PAT.m : PAT.f, lw: 1 }); });
  }
  const n = rows.filter((r) => lt >= r.at).length * 12; if (n > 0) linkedTag(n, 'LINKED EACH');
  // the cart of plugs and sockets, crossing between the camps
  if (lt > ct - 0.5) { const u = seg(lt, ct - 0.5, ct + 9.0, E.lin), x = lerp(-120, 1400, u), y = 640; shape(R(x - 60, y - 30, 120, 30), { lw: 1.8, id: 12000, h: [Math.PI / 2, 3, 0.5] }); for (const k of [-1, 1]) ball(x + k * 40, y + 4, 12, 12001 + k, PAT.m, 1.6); for (let i = 0; i < 9; i++) { shape(R(x - 52 + i * 12, y - 52 + (i % 2) * 4, 8, 22), { lw: 1, id: 12010 + i, fill: P.ink }); } }
  // the two constructors at the margins, one in medals
  klap(1130, 700, 0.5, sh, lt, { f: -1, look: -1, ra: [1.5, 1.6] }); for (let i = 0; i < 5; i++) ball(1130 - 22 + i * 8, 700 - 100, 3, 12100 + i, PAT.f, 1);
  trurl(150, 700, 0.5, sh, lt, { f: 1, look: 1, ra: [1.5, 1.6] });
}
function packScene(lt, sh) {
  const sp = cue(sh, 'ship').at, u = seg(lt, sp, sp + 4.0, E.io);
  X.fillStyle = P.paper; X.fillRect(0, 0, W, H); hatchSkyBand(PY0, 520); X.fillStyle = P.paper; X.fillRect(PX0, 520, PX1 - PX0, 300); for (let k = 0; k < 30; k++) { const y = 524 + k * k * 0.2; ink([[PX0, y], [PX1, y]], 0.6 + k * 0.02, 12200 + k, 0.4); }
  for (let i = 0; i < 20; i++) { const x = 40 + i * 66 + hash(12300, i) * 30; if (Math.abs(x - 640) > 150) { tree(x, 540, 6 + hash(12301, i) * 2, 12310 + i * 3); } }
  ship(640, 560, 1.15, 12400, { ladder: true, door: true });
  const tx = lerp(220, 520, u), kx = lerp(1060, 760, u);
  trurl(tx, 700, 0.8, sh, lt, { f: 1, look: 1 }); klap(kx, 700, 0.8, sh, lt, { f: -1, look: -1 });
  for (const [bx, d] of [[tx + 60, 1], [kx - 60, -1]]) { shape(R(bx - 16, 660, 32, 24), { lw: 1.6, id: 12500 + d, h: [0.6, 2.4, 0.6] }); line([bx - 8, 660], [bx + 8, 660], 3, 12510 + d, 0.1); }
}
SHOTS.platoon = (lt, sh0, sh) => {
  const L_ = sh.lines, dr = cue(sh, 'drill').at, wr = cue(sh, 'wire').at, sp = cue(sh, 'ship').at, bd = cue(sh, 'bead');
  if (lt < dr) {
    const rd = seg(lt, L_[0].t0 + 3.0, L_[0].t0 + 3.5); const c = camFor(lt, [[0, ON(640, 400, 1.0)], [L_[0].t0 + 1.4, ON(700, 500, 2.4)]], 1.0);
    cam(c, () => {
      wallRoom(540, 3.0);
      table(700, 548, 300, 12600, 116);
      goldBox(700, 548, 1.0, 12610, { open: 1, link: 1, beads: 1, far: [1800, 460], pinkA: true });
      X.save(); X.globalAlpha = rd; gnode(682, 500, 10, 12620, { fill: P.red }); X.restore();
      if (lt > L_[0].t0 + 3.0 && lt < L_[0].t0 + 3.5) spark(682, 500, (lt - L_[0].t0 - 3.0) / 0.5, 12621, 22, P.red);
      klap(380, STAND, 1.0, sh, lt, { f: 1, seated: true, look: 1, lookY: 0.5, tilt: 0.1 });
    });
    return;
  }
  if (lt < wr) return platoonScene(lt, sh);
  if (lt < sp) return wirePlate(lt, sh);
  packScene(lt, sh);
};

/* ================= 6. the minds ================= */
function netCluster(cx, cy, r, n, id, o = {}) { // a cluster of nodes in a disk, each tied to a few earlier ones; returns positions
  const pts = []; for (let i = 0; i < n; i++) { const a = i * 2.39996 + (o.rot || 0), rr = r * Math.sqrt((i + 0.5) / n); pts.push([cx + Math.cos(a) * rr, cy + Math.sin(a) * rr]); }
  return pts;
}
function drawNet(pts, id, o = {}) {
  const al = o.alpha ?? 1; X.globalAlpha = al;
  for (let i = 0; i < pts.length; i++) for (const j of [i - 1, i - 3, i - 5]) if (j >= 0 && (!o.skip || !o.skip(i, j))) gedge(pts[i], pts[j], id + i * 3 + (i - j), { lw: o.lw || 1.2, amp: 0.3, col: o.col });
  pts.forEach((p, i) => gnode(p[0], p[1], o.r || 6, id + 1000 + i, { lw: 1, ring: o.ringAt === i ? P.red : null }));
  X.globalAlpha = 1;
}
function barracks(lt, sh) {
  const L_ = sh.lines, L2 = L_[2], nv = L2.nv || 6;
  space({ x: 0, y: 0, z: 1 }, 3, lt * 2);
  ball(1060, 150, 46, 13000, PAT.m, 2);
  X.fillStyle = P.paper; X.fillRect(PX0, 560, PX1 - PX0, 200); ink([[PX0, 560], [PX1, 560]], 2.4, 13001, 0.4); for (let k = 0; k < 14; k++) ink([[PX0, 566 + k * k * 0.5 + k * 4], [PX1, 566 + k * k * 0.5 + k * 4]], 0.6, 13002 + k, 0.4);
  shape(R(100, 280, 1080, 280), { lw: 2.4, id: 13010, h: [Math.PI / 2, 4, 0.4], sh: R(900, 280, 280, 280), sh2: [Math.PI / 2, 2, 0.8] });
  shape([[80, 280], [1200, 280], [1120, 220], [160, 220]], { lw: 2.4, id: 13011, h: [-0.5, 4, 0.6] });
  shape(R(580, 460, 120, 100), { lw: 2, id: 13012, fill: P.ink });
  const lit = lt > L_[1].t0 - 0.2, wx = Array.from({ length: nv }, (_, i) => 200 + i * (880 / (nv - 1))), wy = 340;
  const counted = lt < L_[0].t1;
  wx.forEach((x, i) => { shape(R(x - 42, wy, 84, 90), { lw: 2.2, id: 13020 + i, fill: lit ? P.paper : DARK }); if (lit) { citizen(x, wy + 86, 1.1, 13040 + i * 20, { look: 0, mouth: 0.3, f: 1 }); }
    if (counted && lt > L_[0].t0 + 0.2) { txt(String(i + 1), x, wy - 20, 20, { mono: true, bold: true }); if (lt > L_[0].t0 + 2.6 + i * 0.1) ink([[x - 12, wy - 12], [x + 12, wy - 28]], 2.6, 13100 + i, 0.2, P.red); } });
  if (L2.phr) {
    const words = ['TRUE?', 'A THING?', 'AN OUTSIDE?', 'US'];
    L2.phr.forEach((p, k) => wx.forEach((x, v) => { const t0 = L2.t0 + p + L2.offs[k][v], u = lt - t0; if (u < 0 || u > 1.3) return; X.globalAlpha = Math.min(1, u * 8) * (1 - seg(u, 0.9, 1.3)); txt(words[k], x, wy - 18 - 14 * (v % 2), k === 3 ? 30 : 22, { bold: true }); X.globalAlpha = 1; }));
    const last = L2.t0 + L2.phr[3];
    if (lt > last - 0.05) wx.forEach((x, i) => { if (i < nv - 1) gedge([x, wy - 70], [wx[i + 1], wy - 70], 13200 + i, { u: seg(lt, last + 0.05 + i * 0.1, last + 0.25 + i * 0.1, E.lin), lw: 2.4 }); gnode(x, wy - 70, 6, 13210 + i, { fill: lt > last ? P.paper : P.paper }); });
  }
}
function sapPlate(lt, sh) {
  const L_ = sh.lines, s0 = cue(sh, 'sap').at, ct = cue(sh, 'cut').at, nv = L_[3];
  plate(); caption('A BATTALION OF SAPPERS');
  const A = netCluster(250, 380, 150, 16, 0, { rot: 0.3 }), B = netCluster(1030, 380, 150, 16, 0, { rot: 1.1 }), M = Array.from({ length: 14 }, (_, i) => [640 + Math.cos(i / 14 * 6.2832) * 86, 380 + Math.sin(i / 14 * 6.2832) * 86]);
  const grow = seg(lt, s0, s0 + 1.2, E.lin), tight = seg(lt, s0 + 2.8, s0 + 4.6), cutU = seg(lt, ct - 1.2, ct), reas = seg(lt, ct + 0.2, ct + 1.8);
  drawNet(A, 14000, { alpha: grow }); drawNet(B, 14500, { alpha: grow });
  // ties from the battalion to both armies
  const ties = [[A[0], M[7]], [A[3], M[8]], [A[5], M[6]], [B[1], M[0]], [B[4], M[13]], [B[7], M[1]]];
  ties.forEach(([a, b], i) => { const dead = seg(lt, s0 + 3.0 + i * 0.25, s0 + 3.3 + i * 0.25); if (dead < 1) { X.globalAlpha = (1 - dead) * grow; gedge(a, b, 14900 + i, { lw: 1.6 }); X.globalAlpha = 1; } if (dead > 0 && dead < 1) { const m = mix(a, b, 0.5); ink([[m[0] - 8, m[1] - 8], [m[0] + 8, m[1] + 8]], 3, 14950 + i, 0.2, P.red); ink([[m[0] + 8, m[1] - 8], [m[0] - 8, m[1] + 8]], 3, 14960 + i, 0.2, P.red); } });
  // the battalion, drawn in on itself
  const mp = M.map((p, i) => { const q = mix([640, 380], p, 1 - 0.25 * tight); if (reas > 0) { const tgt = i % 2 ? A[(i * 3) % 16] : B[(i * 5) % 16]; return mix(q, [tgt[0] + (i % 2 ? 40 : -40), tgt[1] + 30], E.io(reas)); } return q; });
  for (let i = 0; i < 14; i++) { const j = (i + 1) % 14; if (cutU < 1 - i * 0.0) { X.globalAlpha = 1 - cutU; gedge(mp[i], mp[j], 15000 + i, { lw: 1.6 }); gedge(mp[i], mp[(i + 4) % 14], 15020 + i, { lw: 1, amp: 0.3 }); X.globalAlpha = 1; } }
  mp.forEach((p, i) => gnode(p[0], p[1], 7, 15100 + i, { ring: tight > 0.5 && reas < 0.1 ? null : null }));
  if (reas > 0.9) mp.forEach((p, i) => { const t = i % 2 ? A[(i * 3) % 16] : B[(i * 5) % 16]; gedge(p, t, 15200 + i, { lw: 1.4 }); });
  if (tight > 0 && cutU < 1) { const pts = []; for (let i = 0; i <= 40; i++) { const a = i / 40 * 6.2832; pts.push([640 + Math.cos(a) * (140 - 50 * tight), 380 + Math.sin(a) * (140 - 50 * tight)]); } X.globalAlpha = 1 - cutU; ink(pts, 2.4, 15300, 0.6, P.red); X.globalAlpha = 1; txt('NOTHING EXISTS BEYOND US', 640, 560, 18, { mono: true, bold: true, col: P.red }); }
  if (reas > 0.9) { txt('UNITS THAT BELIEVE IN THE OUTSIDE', 640, 600, 16, { mono: true, bold: true }); }
}
function navelPlate(lt, sh) {
  const nv = cue(sh, 'navel').at, u = lt - nv, wl = 420 + Math.min(60, u * 7);
  X.fillStyle = P.paper; X.fillRect(0, 0, W, H); hatchSkyBand(PY0, 380);
  const figs = Array.from({ length: 9 }, (_, i) => [210 + i * 108, 470 + (i % 3) * 16]);
  figs.forEach(([x, y], i) => { const sink = Math.min(70, u * 9 + (i % 3) * 8); citizen(x, y + sink, 1.5, 15500 + i * 20, { look: 0, f: 1, tilt: Math.sin(lt * 0.8 + i) * 0.04 }); ball(x, y + sink - 26 * 1.5, 2.6, 15700 + i, PAT.d, 0.8); });
  X.fillStyle = P.paper; X.fillRect(PX0, 520, PX1 - PX0, 200); ink([[PX0, 520]], 1, 15800, 0);
  for (let y = 524; y < 700; y += 6) { ink([[PX0, y], [PX1, y]], 0.8, 15810 + y, 1.6); }
  const wv = []; for (let i = 0; i <= 60; i++) wv.push([PX0 + i * (PX1 - PX0) / 60, 520 + Math.sin(i * 0.9 + lt * 2) * 3]); ink(wv, 2.4, 15900, 0.4);
  for (let i = 0; i < 14; i++) { const b = ((lt * 0.5 + hash(15950, i)) % 1); const bx = 200 + hash(15951, i) * 900, by = 520 - b * 180; X.beginPath(); X.arc(bx, by, 3 + hash(15952, i) * 4, 0, 6.2832); X.lineWidth = 1.2; X.strokeStyle = P.ink; X.stroke(); }
  txt('THE SIXTH AMPHIBIOUS DIVISION', 640, 90, 20, { mono: true, bold: true });
}
function butterfly(x, y, s, id, ph) { const f = Math.abs(Math.sin(ph)); X.save(); X.translate(x, y); X.scale(s, s); for (const k of [-1, 1]) { shape([[0, 0], [k * 20 * (0.3 + 0.7 * f), -16], [k * 22 * (0.3 + 0.7 * f), 4]], { lw: 1.2, id: id + k, fill: k > 0 ? P.rose : P.amber }); shape([[0, 0], [k * 14 * (0.3 + 0.7 * f), 4], [k * 10 * (0.3 + 0.7 * f), 14]], { lw: 1.2, id: id + 2 + k, fill: P.paper }); } line([0, -4], [0, 10], 2, id + 6, 0.1); X.restore(); }
function tastePlate(lt, sh) {
  const t0 = cue(sh, 'taste').at, pa = cue(sh, 'paint').at, gu = cue(sh, 'guns').at, mo = cue(sh, 'moto').at, g = 560;
  fieldBG(g);
  if (lt < pa) { // columns chasing butterflies
    const u = lt - t0, bf = [[420, 250], [720, 200], [940, 300]];
    for (let r = 0; r < 2; r++) { const pts = []; for (let i = 0; i < 9; i++) { const lag = i * 0.35, tt = Math.max(0, u - lag), bx = bf[Math.floor(tt / 2.2) % 3], x0 = 90 + i * 34 + tt * 90 - r * 0; const chase = seg(u - lag, 1.2, 2.2); const x = lerp(x0, bx[0] + Math.sin(lt * 2 + i) * 20, chase * 0.7), y = g - 4 + r * 18 - chase * Math.max(0, 140 - Math.abs(Math.sin(lt * 3 + i)) * 40) * (1 - 0.3 * r); const o = reclaimFig(x, y + r * 0, 1, 16000 + r * 300 + i * 20, 1.25, { lean: chase * 2 }); pts.push(o.ch); } for (let i = 1; i < pts.length; i++) gedge(pts[i], pts[i - 1], 16500 + r * 20 + i, { lw: 1.3 }); }
    bf.forEach(([x, y], i) => butterfly(x + Math.sin(lt * 1.7 + i) * 40, y + Math.cos(lt * 2.3 + i) * 24, 1.6, 16600 + i * 10, lt * 9 + i));
    return;
  }
  if (lt < gu) { // the attack plan is a painting
    castle(1000, 470, 0.9, 16700, { grow: 1, t: lt }); line([700, 470], [1250, 470], 1.4, 16701, 0.4);
    const u = seg(lt, pa, pa + 1.2);
    X.save(); X.translate(380, 0);
    line([-120, 640], [-40, 300], 3.4, 16710, 0.1); line([120, 640], [40, 300], 3.4, 16711, 0.1); line([0, 640], [0, 330], 3.4, 16712, 0.1);
    shape(R(-190, 150, 380, 270), { lw: 3.6, id: 16713, fill: P.paper });
    X.globalAlpha = u; for (const [x, y, w, h, c] of [[-160, 180, 120, 90, P.amber], [-20, 200, 150, 60, P.rose], [60, 280, 100, 110, P.ink], [-150, 300, 80, 80, P.rose], [-40, 330, 90, 50, P.amber]]) { shape(R(x, y, w, h), { lw: 1.4, id: 16720 + x, fill: c }); } X.beginPath(); X.arc(100, 230, 34, 0, 6.2832); X.fillStyle = P.paper; X.fill(); X.lineWidth = 2; X.strokeStyle = P.ink; X.stroke(); ink([[-170, 400], [150, 190]], 2, 16730, 0.4); X.globalAlpha = 1;
    X.restore();
    reclaimFig(640, g, 1, 16800, 2.0, {}); reclaimFig(560, g, 1, 16830, 2.0, { lean: 1 }); txt('ATTACK PLAN', 380, 120, 20, { mono: true, bold: true });
    return;
  }
  // the artillery forgets its guns
  const u = lt - gu;
  for (let i = 0; i < 3; i++) cannon(330 + i * 260, g - 20, 1.6, 16900 + i * 10);
  for (let i = 0; i < 8; i++) { const x = lerp(260 + i * 110, 1500, E.in(seg(u, 0.6 + i * 0.1, 5.0))), y = g - Math.abs(Math.sin(lt * 4 + i)) * 4; reclaimFig(x, y, 1, 17000 + i * 20, 1.6, { lean: 1 }); }
  if (u > 0.5) { txt('WHAT WAR', 960, 200, 20, { mono: true, italic: true }); }
}
function motorbike(x, y, s, id, ph, f = 1) { X.save(); X.translate(x, y); X.scale(s * f, s); for (const wx of [-34, 34]) { X.beginPath(); X.arc(wx, -16, 16, 0, 6.2832); X.lineWidth = 3; X.strokeStyle = P.ink; X.stroke(); for (let k = 0; k < 6; k++) { const a = ph + k * 1.047; line([wx, -16], [wx + Math.cos(a) * 14, -16 + Math.sin(a) * 14], 0.8, id + wx + k, 0.1); } } ink([[-34, -16], [-6, -44], [26, -44], [34, -16]], 3, id + 1, 0.3); shape(R(-14, -58, 34, 14), { lw: 1.4, id: id + 2, h: [0.3, 2, 0.6] }); line([26, -44], [34, -64], 2.6, id + 3, 0.1); line([34, -64], [44, -66], 2.6, id + 4, 0.1); X.restore(); }
function motoPlate(lt, sh) {
  const mo = cue(sh, 'moto').at, so = cue(sh, 'sonnet').at, g = 560;
  if (lt < so) {
    fieldBG(g); const cx = 760, cy = 440, army = netCluster(cx, cy - 20, 150, 34, 0, { rot: 0 });
    // the army, uneasy: nodes tremble
    const tr = army.map((p, i) => [p[0] + Math.sin(lt * 3 + i) * 3, p[1] + Math.cos(lt * 2.4 + i) * 3]); drawNet(tr, 17400, { r: 7 });
    for (let k = 0; k < 3; k++) { const a = lt * 1.3 + k * 2.09, x = cx + Math.cos(a) * 330, y = g + 50 + Math.sin(a) * 38 + 10, f = -Math.sign(-Math.sin(a)) || 1; motorbike(x, y, 1.2, 17600 + k * 20, lt * 14, f); citizen(x - 6 * f, y - 60, 1.1, 17700 + k * 20, { f, look: 0 }); shape(R(x + f * 56 - 24, y - 50, 48, 24), { lw: 1.4, id: 17760 + k, h: [0.3, 2.4, 0.6] }); line([x + f * 20, y - 40], [x + f * 36, y - 40], 2, 17770 + k, 0.1); }
    txt('PSYCHIATRIC MOTORCYCLE BRIGADE', 640, 90, 18, { mono: true, bold: true });
    return;
  }
  plate(); const u = lt - so; caption('SONNET: ON THE MYSTERY OF BEING');
  shape(R(400, 120, 480, 520), { lw: 2.8, id: 17800, fill: P.paper }); txt('ON THE MYSTERY OF BEING', 640, 160, 22, { bold: true, italic: true });
  for (let i = 0; i < 14; i++) { const w = seg(u, 0.4 + i * 0.28, 0.7 + i * 0.28, E.lin); if (w > 0) ink([[450, 210 + i * 29], [450 + (380 - (i % 4) * 36) * w, 210 + i * 29 + Math.sin(i) * 1.2]], 1.4, 17810 + i, 0.5); }
  for (let r = 0; r < 6; r++) { const x = r < 3 ? 190 + r * 0 : 1090, y = 220 + (r % 3) * 150, pts = netCluster(x, y, 56, 9, 0, { rot: r }); drawNet(pts, 17900 + r * 40, { r: 5, lw: 1 }); gedge([x + (r < 3 ? 56 : -56), y], [r < 3 ? 400 : 880, y], 17990 + r, { lw: 1.4, u: seg(u, 0.2 + r * 0.2, 1.0 + r * 0.2, E.lin) }); }
  txt('SIX REGIMENTS, ON GUARD DUTY', 640, 676, 16, { mono: true, bold: true });
}
function courierPlate(lt, sh) {
  const co = cue(sh, 'couriers').at, js = cues(sh, 'join'), pr = cue(sh, 'prince').at, g = 560;
  fieldBG(g);
  const cx = 800, cy = 420, base = netCluster(cx, cy, 150, 30, 0, { rot: 0 });
  drawNet(base, 18000, { r: 6 });
  const j1 = js[0].at, j2 = js[1].at;
  // two kings watching from the left
  king(110, g + 10, 0.32, 18100, sh, lt, { type: 'F', f: 1 }); king(210, g + 10, 0.32, 18200, sh, lt, { type: 'A', f: 1 });
  const drawC = (k, t0, hit, path, label) => {
    if (lt < t0 - 3.0) return; const u = seg(lt, t0 - 3.0, hit, E.lin), p = path(u); const joined = lt >= hit;
    if (!joined) { citizen(p[0], p[1], 0.9, 18300 + k * 100, { f: 1, look: 1, walk: 1, ph: lt * 10, wave: 1 }); if (k !== 1) { for (const s_ of [-1, 1]) ink([[p[0], p[1] - 30], [p[0] + s_ * 26, p[1] - 44 + Math.sin(lt * 18) * 6]], 2, 18400 + k * 10 + s_, 0.3); } gnode(p[0] - 14, p[1] - 90, 5, 18500 + k, { ring: P.red }); }
    else { const tgt = base[10 + k * 7]; const a = lt - hit, q = mix(p, tgt, E.out(clamp(a / 0.5))); gnode(q[0], q[1], 6, 18600 + k, { ring: a < 1.0 ? P.red : null }); if (a < 0.5) gedge(q, tgt, 18620 + k, { u: 1, lw: 2 }); else gedge(q, tgt, 18620 + k, { u: 1 }); if (a < 0.3) spark(tgt[0], tgt[1], a / 0.3, 18640 + k, 22); void label; }
  };
  drawC(0, j1, j1, (u) => [lerp(280, 700, u), lerp(260, 400, u) + Math.sin(u * 6) * 20]);
  drawC(2, j1 + 0.9, j1 + 0.9, (u) => [lerp(280, 740, u), g - 10 - Math.abs(Math.sin(u * 14)) * 5]);
  // the prince
  if (lt > pr - 1.0) { const hit = js[1].at, u = seg(lt, pr - 0.6, hit, E.lin), p = [lerp(250, 760, u), g - 20 - Math.sin(Math.PI * u) * 240]; if (lt < hit) { king(p[0], p[1] + 20, 0.28, 18700, sh, lt, { type: 'F', f: 1, ra: [-1.5, -2], la: [-1.5, -2] }); gnode(p[0] - 10, p[1] - 80, 5, 18710, { ring: P.red }); } else { const tgt = base[24]; const a = lt - hit, q = mix([760, g - 20], tgt, E.out(clamp(a / 0.5))); gnode(q[0], q[1], 6, 18720, { ring: null }); gedge(q, tgt, 18730, { lw: 2 }); if (a < 0.3) spark(tgt[0], tgt[1], a / 0.3, 18740, 24); } }
  linkedTag(30 + js.filter((c) => lt >= c.at).length + (lt >= j1 + 0.9 ? 1 : 0), 'UNIT');
}
function trapPlate(lt, sh) {
  const tr = cue(sh, 'trap').at, L_ = sh.lines, u = lt - tr, dur = L_[8].t1 - tr;
  plate(); const z = 1 + 0.35 * seg(lt, tr, L_[8].t1 + 1.0, E.lin);
  cam(ON(640, 360, z), () => {
    const R_ = 160, N = 16, ring = Array.from({ length: N }, (_, i) => { const a = Math.PI + (i + 0.5) / N * 6.2832 * 0.84 - 0.2; return [640 + Math.cos(a) * R_, 360 + Math.sin(a) * R_]; });
    // inner mesh
    const inner = netCluster(640, 360, 100, 12, 0, { rot: 0.5 }); const enter = seg(lt, tr + 0.6, tr + 3.0, E.io), closed = seg(lt, tr + 3.0, tr + 3.8);
    const door = [640 - R_ - 6, 360];
    // ring edges, with a gap at the door that closes
    for (let i = 0; i < N - 1; i++) gedge(ring[i], ring[i + 1], 19000 + i, { lw: 2.2 });
    gedge(ring[N - 1], ring[0], 19050, { lw: 2.2, u: closed });
    if (closed < 1) { gedge(ring[N - 1], ring[0], 19051, { lw: 1.2, u: 1, col: 'rgba(28,24,20,.25)' }); }
    inner.forEach((p, i) => { gedge(p, ring[(i * 3) % N], 19100 + i, { lw: 0.9, amp: 0.3 }); if (i) gedge(p, inner[i - 1], 19120 + i, { lw: 1 }); });
    ring.forEach((p, i) => gnode(p[0], p[1], 8, 19200 + i)); inner.forEach((p, i) => gnode(p[0], p[1], 6.5, 19300 + i));
    // the visitor
    const vx = lerp(180, 560, enter), vy = 360 + Math.sin(enter * 3) * 6;
    if (u < 3.8) { const tint = 1 - seg(lt, tr + 3.0, tr + 4.4); gnode(vx, vy, 10, 19400, { ring: tint > 0.05 ? P.red : null }); if (lt < tr + 3.0) gedge([vx, vy], inner[0], 19410, { lw: 1.4, u: seg(enter, 0.7, 1, E.lin), col: P.red }); }
    else { gnode(560, 360, 10, 19400, {}); gedge([560, 360], inner[0], 19410, { lw: 1.4 }); gedge([560, 360], ring[6], 19411, { lw: 1.2 }); }
    if (lt > tr + 3.0 && lt < tr + 3.4) spark(door[0] + 20, 360, (lt - tr - 3.0) / 0.4, 19420, 30);
    // the way out
    const ex = seg(lt, tr + 5.0, tr + 6.0); if (ex > 0) { X.globalAlpha = ex; ink([[600, 440], [300, 520]], 2, 19430, 0.5); X.beginPath(); X.moveTo(300, 520); X.lineTo(318, 506); X.lineTo(320, 530); X.closePath(); X.fillStyle = P.ink; X.fill(); ink([[470, 460], [500, 500]], 5, 19431, 0.3, P.red); ink([[500, 460], [470, 500]], 5, 19432, 0.3, P.red); txt('NO WAY OUT', 440, 560, 16, { mono: true, bold: true, col: P.red }); X.globalAlpha = 1; }
    txt('IN', 180, 316, 16, { mono: true, bold: true });
  });
}
SHOTS.minds = (lt, sh0, sh) => {
  const c = (k) => cue(sh, k).at;
  if (lt < c('sap')) return barracks(lt, sh);
  if (lt < c('navel')) return sapPlate(lt, sh);
  if (lt < c('taste')) return navelPlate(lt, sh);
  if (lt < c('moto')) return tastePlate(lt, sh);
  if (lt < c('couriers')) return motoPlate(lt, sh);
  if (lt < c('trap')) return courierPlate(lt, sh);
  return trapPlate(lt, sh);
};

function planeA(cam,d,fn){X.save();X.translate(W/2+(cam.sx||0),H/2+(cam.sy||0));const s=Math.pow(cam.z,1/d);X.scale(s,s);X.translate(-cam.x/d,-cam.y/d);fn();X.restore();}
/* ================= 7. the field: the armies close into two giants.
   Ported from SHOT I of the Two Sallies reel (../two-sallies/index.html), re-timed and extended. ================= */
const HILLS=[[-440,300,64],[440,300,64]];
function gY(x){let y=152;for(const[c,w,top]of HILLS){const d=Math.abs(x-c);if(d<w)y=Math.min(y,152-(152-top)*.5*(1+Math.cos(Math.PI*d/w)));}return y;}
const ARM=[{dir:1,cx:-440,acc:P.ochre,id:100},{dir:-1,cx:440,acc:P.rose,id:200}];
const NS=14;

function soldier(a,i,t){
  const x0=a.cx+a.dir*110,xo=x0-a.dir*i*24,xc=x0-a.dir*i*14,st=3.3+i*.035,arr=st+.25;
  const u=i===0?0:seg(t,st,arr,E.in);
  let lean=-a.dir*3*seg(t,3.0,3.3);
  if(i>0&&t>=st)lean=t<arr?a.dir*2.5:a.dir*2.5*(1-seg(t,arr,arr+.2));
  const sq=(i>0&&t>=arr&&t<arr+.17)?1.6:0;
  const jx=(t>4.3&&t<4.9)?(hash(i*13+a.id,BOIL)-.5)*1.4:0;
  return{x:lerp(xo,xc,u)+jx,lean,sq,bob:Math.sin(t*2.3+i*.9)*.7,arr};
}
function sNodes(a,i,t){const s=soldier(a,i,t),g=gY(s.x);return{s,g,hip:[s.x,g-16+s.sq*.5],chest:[s.x+s.lean,g-27+s.sq+s.bob*.4],head:[s.x+s.lean*1.35,g-39+s.sq+s.bob]};}
function drawSoldier(a,i,t,alpha=1,nodes=true){
  const n=sNodes(a,i,t),d=a.dir,id=a.id+i*20,[hx,hy]=n.hip,[cx,cy]=n.chest;
  X.globalAlpha=alpha;
  ink([[hx,hy],[hx-4,n.g]],1.3,id+1);ink([[hx,hy],[hx+4,n.g]],1.3,id+2);
  ink([[hx-7,n.g],[hx-2,n.g]],1.8,id+3,.3);ink([[hx+2,n.g],[hx+7,n.g]],1.8,id+4,.3);
  ink([[hx,hy],[cx,cy]],1.4,id+5);ink([[cx,cy],n.head],1.2,id+6);
  ink([[cx,cy],[cx+d*7,cy+6]],1.2,id+7);
  X.fillStyle=P.ink;X.fillRect(cx-d*9-2,cy-3,4,6);
  ink([[cx+d*6,cy],[cx+d*9,cy]],2.2,id+8,.2);
  ink([[cx+d*9,cy-1.6],[cx+d*13,cy-1.6]],1.3,id+9,.2,a.acc);ink([[cx+d*9,cy+1.6],[cx+d*13,cy+1.6]],1.3,id+10,.2,a.acc);
  X.globalAlpha=1;
  if(nodes){ball(hx,hy,4.8,id+11,PAT.f);ball(cx,cy,6.2,id+12);ball(n.head[0],n.head[1],5.4,id+13,PAT.f);}
}

/* giant: 42 nodes built from 14 soldiers x 3 bodies */
const TORSO=[[-30,-32],[0,-32],[30,-32],[-44,-66],[-15,-66],[15,-66],[44,-66],[-52,-102],[-26,-102],[0,-102],[26,-102],[52,-102]];
function ik(h,f,L,pick){const dx=f[0]-h[0],dy=f[1]-h[1],d=Math.max(.001,Math.hypot(dx,dy)),dm=Math.min(d,2*L-.01),a=dm/2,hh=Math.sqrt(Math.max(0,L*L-a*a)),ux=dx/d,uy=dy/d,mx=h[0]+ux*a,my=h[1]+uy*a;
  const k1=[mx-uy*hh,my+ux*hh],k2=[mx+uy*hh,my-ux*hh];return{k:pick(k1,k2,mx,my),end:[h[0]+ux*dm,h[1]+uy*dm]};}
function giantNodes(g){
  const N=[],d=g.dir,Px=g.x,Py=gY(g.x)-150*g.crouch+(g.bob||0),feet=[];
  for(const[hx,fo]of[[-26,g.fA],[26,g.fB]]){
    const hip=[Px+hx,Py],fx=Px+hx+fo.dx,foot=[fx,gY(fx)-fo.lift];
    const{k:kn,end:ft}=ik(hip,foot,82,(a,b,mx)=>Math.sign(a[0]-mx)===d?a:b);feet.push(ft);
    for(let i=0;i<7;i++){let p,A,B;if(i<=3){A=ft;B=kn;p=mix(ft,kn,i/3);}else{A=kn;B=hip;p=mix(kn,hip,(i-3)/3);}
      if(i%3){const vx=B[0]-A[0],vy=B[1]-A[1],L=Math.hypot(vx,vy)||1,s=(i%2?1:-1)*7;p=[p[0]-vy/L*s,p[1]+vx/L*s];}
      N.push({x:p[0],y:p[1],r:7});}
  }
  const ln=(g.lean||0)*d,br=1+(g.breathe||0);
  for(const[tx,ty]of TORSO){const[rx,ry]=rot(tx,ty*br,ln);N.push({x:Px+rx,y:Py+ry,r:8});}
  const shoulders=[N[21],N[25]];
  for(let s=0;s<2;s++){const S=shoulders[s],side=s?1:-1,spec=g.hands[s]||{};
    const rest=[S.x+side*8+(spec.swing||0),S.y+128];let hand=spec.rel?[S.x+spec.rel[0],S.y+spec.rel[1]]:rest;
    if(spec.abs)hand=mix(hand,spec.abs,spec.w??1);
    const{k:el,end}=ik([S.x,S.y],hand,72,(a,b)=>a[1]>b[1]?a:b);
    for(const p of[mix([S.x,S.y],el,.5),el,mix(el,end,.5),end])N.push({x:p[0],y:p[1],r:6.5});}
  const[hcx,hcy]=rot(0,-164*br,ln),HC=[Px+hcx,Py+hcy+(g.headBob||0)];
  for(let i=0;i<8;i++){const a=-Math.PI/2+i*Math.PI/4;let px=Math.cos(a)*30/g.headSq,py=Math.sin(a)*30*g.headSq;[px,py]=rot(px,py,g.headTilt||0);N.push({x:HC[0]+px,y:HC[1]+py,r:7});}
  return{N,feet,HC};
}
const BASE_POSE=()=>({x:0,dir:1,crouch:1,fA:{dx:0,lift:0},fB:{dx:0,lift:0},headSq:1,hands:[{},{}]});
const G_EDGES=(()=>{const e=[];for(const b of[0,7])for(let i=0;i<6;i++){e.push([b+i,b+i+1]);if(i<5)e.push([b+i,b+i+2]);}
  const R=giantNodes(BASE_POSE()).N,T=[6,13];for(let i=14;i<26;i++)T.push(i);
  for(let i=0;i<T.length;i++)for(let j=i+1;j<T.length;j++){const a=R[T[i]],b=R[T[j]];if(Math.hypot(a.x-b.x,a.y-b.y)<50)e.push([T[i],T[j]]);}
  e.push([21,26],[26,27],[27,28],[28,29],[25,30],[30,31],[31,32],[32,33]);
  for(let i=0;i<8;i++)e.push([34+i,34+(i+1)%8]);e.push([37,24],[38,23],[39,22]);return e;})();

function walkAt(x0,x1,t0,t1,t){
  const u=seg(t,t0,t1,E.io),x=lerp(x0,x1,u),dist=Math.abs(x-x0),amp=clamp(Math.min(dist,Math.abs(x1-x))/26),L=62,c=dist/(2*L),sg=Math.sign(x1-x0);
  const fo=c=>{c-=Math.floor(c);if(c<.5)return{dx:L/2-c*2*L,lift:0};const s=(c-.5)*2;return{dx:-L/2+E.io(s)*L,lift:Math.sin(Math.PI*s)*20};};
  const A=fo(c),B=fo(c+.5);
  return{x,c,amp,fA:{dx:A.dx*sg*amp,lift:A.lift*amp},fB:{dx:B.dx*sg*amp,lift:B.lift*amp},bob:-Math.abs(Math.sin(2*Math.PI*c))*5*amp};
}
const WD=1500;
const W1=[12.1,14.0],W2=[15.4,28.5];
const home=a=>a.cx+a.dir*30, meetX=a=>-a.dir*78;
function giantX(a,t){if(t>=W2[0])return walkAt(meetX(a),meetX(a)+WD,W2[0],W2[1],t).x;if(t>=W1[0])return walkAt(home(a),meetX(a),W1[0],W1[1],Math.min(t,W1[1])).x;return home(a);}
function giantPose(a,t){
  const d0=a.dir,g=BASE_POSE();g.dir=d0;g.x=home(a);g.breathe=Math.sin(t*2.1+d0)*.012;g.turn=1;
  g.eye={open:1,happy:0,look:[d0*.7,.1],scale:1};
  g.crouch=t<6.9?.5:kf(t,[[6.9,.5],[7.35,1.09,E.out],[7.75,.98],[8.0,1]]);
  g.headSq=kf(t,[[6.9,1],[7.3,1.14],[7.55,.9],[7.8,1.03],[8.0,1]]);
  if(t>8.6&&t<8.78)g.eye.open=0;
  const tilt=seg(t,9.6,10.1)*(1-seg(t,10.3,10.6));g.headTilt=-d0*.16*tilt;g.eye.scale=1+.18*tilt;
  if(t>10.35)g.eye.happy=1;
  g.headBob=kf(t,[[10.3,0],[10.42,-12,E.out],[10.6,4],[10.75,0]]);
  let w=null;
  if(t>=W2[0])w=walkAt(meetX(a),meetX(a)+WD,W2[0],W2[1],t);else if(t>=W1[0])w=walkAt(home(a),meetX(a),W1[0],W1[1],Math.min(t,W1[1]));
  if(w){g.x=w.x;g.fA=w.fA;g.fB=w.fB;g.bob=w.bob;g.lean=.05*w.amp;g.swingC=w.c;g.swingA=w.amp;}
  if(d0<0&&t>=14.7){const s=seg(t,14.7,15.2);g.dir=s<.5?-1:1;g.turn=Math.max(.06,Math.abs(Math.cos(Math.PI*s)));}
  if(t>=15.4)g.eye.look=[.75,-.05];
  // hands. screen side 0=left,1=right. front hand holds the lance.
  const front=d0>0?1:0,back=1-front;
  const sw=g.swingA?Math.sin(2*Math.PI*(g.swingC||0))*18*g.swingA:0;
  const holdRel=[d0*30,75];
  let fr={};
  if(t<10.8)fr={rel:holdRel};
  else if(t<11.6)fr={rel:mix(holdRel,[-d0*10,105],seg(t,10.8,11.5))};
  else if(t<12.1)fr={rel:mix([-d0*10,105],[d0*8,128],seg(t,11.6,12.0))};
  else fr={swing:-sw};
  g.hands[front]=fr;g.hands[back]={swing:sw};
  // joining hands over the line
  const join=d0>0?1:0, xa=giantX(ARM[0],t),xb=giantX(ARM[1],t),mid=(xa+xb)/2,Jp=[mid,gY(mid)-205+(w?w.bob:0)];
  let jw=0;if(t>=14.0)jw=seg(t,14.0,14.5);if(t>=14.7)jw=1-seg(t,14.7,14.85);if(t>=15.15)jw=seg(t,15.15,15.4);
  if(jw>0)g.hands[join]={swing:g.hands[join].swing,abs:Jp,w:jw};
  g.lance=t<10.8?0:kf(t,[[10.8,0],[11.5,-d0*1.25]]);
  return g;
}
function squeeze(G,g){if(g.turn>=1)return G;const f=v=>g.x+(v-g.x)*g.turn;return{N:G.N.map(n=>({x:f(n.x),y:n.y,r:n.r})),feet:G.feet.map(p=>[f(p[0]),p[1]]),HC:[f(G.HC[0]),G.HC[1]]};}

function drawEye(c,e,id,sx=1,alpha=1){
  X.save();X.translate(c[0],c[1]);X.scale(sx,1);X.globalAlpha=alpha;const r=17*(e.scale||1);
  if(e.happy){const pts=[];for(let i=0;i<=10;i++){const a=Math.PI+i/10*Math.PI;pts.push([Math.cos(a)*r*.8,5+Math.sin(a)*r*.75]);}ink(pts,3.2,id,.4);}
  else if(e.open<.3){ink([[-r,0],[r,0]],2.6,id,.4);for(const k of[-.6,0,.6])ink([[k*r,0],[k*r*1.15,6]],1.2,id+3+k*5|0,.2);}
  else{circ(0,0,r,id);X.fillStyle=P.paper;X.fill();const lx=e.look[0]*r*.38,ly=e.look[1]*r*.38;
    circ(lx,ly,r*.56,id+1);X.fillStyle=PAT.d;X.fill();X.lineWidth=1.2;X.strokeStyle=P.ink;X.stroke();
    X.beginPath();X.arc(lx,ly,r*.24,0,6.2832);X.fillStyle=P.ink;X.fill();
    X.beginPath();X.arc(lx-r*.18,ly-r*.2,r*.1,0,6.2832);X.fillStyle=P.paper;X.fill();
    circ(0,0,r,id);X.lineWidth=2.2;X.strokeStyle=P.ink;X.stroke();}
  X.restore();
}
function drawGiantBody(G,id,edgeAlpha,nodeAlpha){
  const N=G.N;
  for(const[a,b]of G_EDGES){const al=edgeAlpha(a,b);if(al<=.01)continue;X.globalAlpha=al;ink([[N[a].x,N[a].y],[N[b].x,N[b].y]],2.3,id+a*53+b,.6);}
  X.globalAlpha=1;
  for(let i=0;i<N.length;i++){const n=N[i];if(!n)continue;ball(n.x,n.y,n.r,id+400+i,i<14?PAT.m:PAT.f);}
}
function sole(p,d,id){X.beginPath();X.ellipse(p[0]+d*6,p[1]-3,17,6,0,Math.PI,0);X.closePath();X.fillStyle=P.paper;X.fill();X.fillStyle=PAT.m;X.fill();X.lineWidth=1.6;X.strokeStyle=P.ink;X.stroke();}

/* merge mapping, computed once */
for(const a of ARM){
  const src=[];for(let i=0;i<NS;i++){const n=sNodes(a,i,4.9);src.push({i,p:n.hip,r:4.8,part:0},{i,p:n.chest,r:6.2,part:1},{i,p:n.head,r:5.4,part:2});}
  src.sort((u,v)=>(v.p[0]-u.p[0])*a.dir||(v.p[1]-u.p[1]));
  const G=giantNodes(giantPose(a,4.9)),tg=G.N.map((n,k)=>({k,y:n.y,x:n.x})).sort((u,v)=>v.y-u.y||(u.x-v.x)*a.dir);
  a.src=src;a.map=src.map((s,k)=>tg[k].k);
  a.chestRank=[];src.forEach((s,k)=>{if(s.part===1)a.chestRank[s.i]=k;});
}
const mergeU=(k,t)=>E.io(clamp((t-4.9-k/41*.9)/1.1));

/* lances: 14 per army */
function soldierLance(a,i,t){const n=sNodes(a,i,t),hx=n.chest[0]+a.dir*7;return[[hx,n.g-4],[hx,n.g-66]];}
function giantLance(a,t,k){const g=giantPose(a,t),G=giantNodes(g),H=G.N[a.dir>0?33:29],la=g.lance,off=rot(1,0,la),o=(k-6.5)*2.9;
  const top=rot(0,-205,la),bot=rot(0,175,la);return[[H.x+bot[0]+off[0]*o,H.y+bot[1]+off[1]*o],[H.x+top[0]+off[0]*o,H.y+top[1]+off[1]*o]];}
function groundLance(a,k){const g=home(a),c=g-a.dir*(70+(k%5)*14+(k*7%3)*6),an=(hash(k,a.id)-.5)*.25,hl=170,x1=c-Math.cos(an)*hl,x2=c+Math.cos(an)*hl;
  return a.dir>0?[[x2,gY(x2)-2],[x1,gY(x1)-2]]:[[x1,gY(x1)-2],[x2,gY(x2)-2]];}
const LCACHE=new Map();
function lanceAt(a,k,t){
  if(t<4.9){return soldierLance(a,k,t);}
  if(t<11.6){const u=E.io(clamp((t-4.9-k*.06)/1.3));const s0=soldierLance(a,k,4.9),s1=giantLance(a,t,k);return[mix(s0[0],s1[0],u),mix(s0[1],s1[1],u)];}
  const key=a.id+'_'+k;if(!LCACHE.has(key))LCACHE.set(key,giantLance(a,11.6,k));const r0=LCACHE.get(key),r1=groundLance(a,k);
  const v=E.in(clamp((t-11.6-k*.015)/.38));let s=[mix(r0[0],r1[0],v),mix(r0[1],r1[1],v)];
  const land=11.6+k*.015+.38;if(t>land&&t<land+.18){const b=Math.sin(Math.PI*(t-land)/.18)*6;s=[[s[0][0],s[0][1]-b*.4],[s[1][0],s[1][1]-b]];}
  return s;
}
function drawLance(s,id){ink(s,1.3,id,.4);const[a,b]=s,dx=b[0]-a[0],dy=b[1]-a[1],L=Math.hypot(dx,dy)||1,ux=dx/L,uy=dy/L;
  X.beginPath();X.moveTo(b[0]+ux*7,b[1]+uy*7);X.lineTo(b[0]-uy*2.4,b[1]+ux*2.4);X.lineTo(b[0]+uy*2.4,b[1]-ux*2.4);X.closePath();X.fillStyle=P.ink;X.fill();}

/* flowers */
const LINE_FL=[];for(let k=0;;k++){const y=160+k*19;if(y>820)break;LINE_FL.push({x:(hash(k,5)-.5)*16,y,tb:14.5+(y-160)/660*1.5,col:k%2?P.rose:P.ochre,s:1.5+(y-152)/200});}
const STEP_FL=[];
for(const a of ARM){let last=null;for(let t=W2[0];t<=W2[1];t+=1/240){const w=walkAt(meetX(a),meetX(a)+WD,W2[0],W2[1],t),q=Math.floor(w.c*2);if(last!==null&&q!==last&&w.amp>.3){const st=(q%2===0)?w.fA:w.fB,fx=w.x+(q%2===0?-26:26)+st.dx;STEP_FL.push({x:fx,y:gY(fx)+1,tb:t+.12,col:(STEP_FL.length%2)?P.rose:P.ochre,s:1.9});}last=q;}}
function flowerA(f,t,id){const u=seg(t,f.tb,f.tb+.4,E.out);if(u<=0)return;const s=f.s,top=[f.x,f.y-12*s*Math.min(1,u*1.6)];
  ink([[f.x,f.y],top],1*s,id,.2);const p=clamp((u-.4)/.6);if(p<=0)return;
  for(let i=0;i<5;i++){const a=i/5*6.2832-1.57,px=top[0]+Math.cos(a)*3*s*p,py=top[1]+Math.sin(a)*3*s*p;X.beginPath();X.arc(px,py,2.3*s*p,0,6.2832);X.fillStyle=f.col;X.fill();X.lineWidth=.7;X.strokeStyle=P.ink;X.stroke();}
  X.beginPath();X.arc(top[0],top[1],1.1*s*p,0,6.2832);X.fillStyle=P.ink;X.fill();}

/* scenery A */
const CLOUDS=[[-900,-230,1],[-380,-300,1.3],[260,-210,.9],[820,-280,1.2],[-120,-520,1.1],[620,-600,.8],[-760,-680,1]];
function cloud(cx,cy,s,id){const cs=[[-60,0,38],[-20,-22,46],[30,-14,40],[66,4,30],[0,10,36]].map(([x,y,r])=>[cx+x*s,cy+y*s,r*s]);
  X.beginPath();for(const[x,y,r]of cs){X.moveTo(x+r,y);X.arc(x,y,r,0,6.2832);}X.lineWidth=3.2;X.strokeStyle=P.ink;X.stroke();X.fillStyle=P.paper;X.fill();
  X.save();X.clip();X.fillStyle=PAT.f;X.fillRect(cx-130*s,cy+4*s,260*s,60*s);X.restore();}
function sceneA_bg(cam,t){
  planeA(cam,6,()=>{X.fillStyle=P.paper;X.fillRect(-2600,-2600,5200,5200);skyLinesW(-2400,500,100);});
  planeA(cam,3.5,()=>{[0,2500,5000].forEach((o,oi)=>CLOUDS.forEach(([x,y,s],i)=>cloud(x+o+t*5*(1+i%3)-40,y,s,900+i*20+oi*200)));});
  planeA(cam,2.2,()=>{const pts=[];for(let x=-2600;x<=2600;x+=40)pts.push([x,104+Math.sin(x*.004)*22+Math.sin(x*.011+1)*9]);
    X.beginPath();X.moveTo(-2600,1200);pts.forEach(p=>X.lineTo(p[0],p[1]));X.lineTo(2600,1200);X.closePath();X.fillStyle=P.paper;X.fill();X.fillStyle=PAT.f;X.fill();ink(pts,1.3,700,.8);});
}
function groundA(){
  const pts=[];for(let x=-3800;x<=3800;x+=16)pts.push([x,gY(x)]);
  X.beginPath();X.moveTo(-3800,1400);pts.forEach(p=>X.lineTo(p[0],p[1]));X.lineTo(3800,1400);X.closePath();X.fillStyle=P.paper;X.fill();
  X.save();X.clip();for(let k=0;k<44;k++){const y=64+k*k*.55;ink([[-3800,y],[3800,y]],.7+k*.025,600+k,.5);}
  X.restore();
  ink(pts,1.9,650,.7);
  ink([[0,152],[0,1000]],2.2,660,.6,P.red);for(let y=170;y<900;y+=58){const s=1+(y-152)/300;ink([[0,y],[0,y-9*s]],2.2*s,661+y,.3);}
}
function foregroundA(){for(let k=0;k<46;k++){const x=-1700+k*175+hash(k,8)*60,y=300+hash(k,9)*50,n=6;
  for(let i=0;i<n;i++){const a=-1.57+(i-n/2)*.22+hash(k,i)*.2,L=26+hash(k,i+20)*28;ink([[x+i*3,y],[x+i*3+Math.cos(a)*L*.5+6,y+Math.sin(a)*L*.6],[x+i*3+Math.cos(a)*L,y+Math.sin(a)*L]],1.6,1500+k*10+i,.6);}}
  for(const[x,y,r]of[[-820,350,90],[900,370,110]]){X.beginPath();X.ellipse(x,y,r,r*.55,0,Math.PI,0);X.closePath();X.fillStyle=P.paper;X.fill();X.fillStyle=PAT.d;X.fill();X.lineWidth=2.4;X.strokeStyle=P.ink;X.stroke();}}
function postAndBugler(a,t){
  const d=a.dir,px=a.cx-d*215,g=gY(px),wv=Math.sin(t*6+d)*4;
  ink([[px,g],[px,g-92]],1.8,a.id+90);
  X.beginPath();X.moveTo(px,g-92);X.lineTo(px+d*36,g-84+wv);X.lineTo(px,g-74);X.closePath();X.fillStyle=a.acc;X.fill();X.lineWidth=1.3;X.strokeStyle=P.ink;X.stroke();
  const bx=px+d*16,bg=gY(bx),hip=[bx,bg-16],ch=[bx,bg-27],hd=[bx,bg-40];
  const raise=seg(t,1.55,1.75,E.out)*(1-seg(t,3.2,3.5)),dip=(t>1.4&&t<1.55)?2:0;
  ink([[hip[0],hip[1]],[bx-4,bg]],1.3,a.id+91);ink([[hip[0],hip[1]],[bx+4,bg]],1.3,a.id+92);ink([hip,ch],1.4,a.id+93);ink([ch,hd],1.2,a.id+94);
  const hand=mix([bx+d*5,ch[1]+8],[bx+d*8,hd[1]+1],raise);ink([[ch[0],ch[1]+dip],hand],1.2,a.id+95);
  ball(hip[0],hip[1]+dip,4.6,a.id+96,PAT.f);ball(ch[0],ch[1]+dip,6,a.id+97);ball(hd[0],hd[1]+dip-raise*2,5.2,a.id+98,PAT.f);
  const ang=lerp(1.3,-.15,raise)*-d,hx=hand[0],hy=hand[1],ux=Math.cos(ang)*d,uy=Math.sin(ang);
  const m=[hx+ux*16,hy+uy*16];X.beginPath();X.moveTo(hx,hy-1);X.lineTo(m[0]-uy*5,m[1]+ux*5*d);X.lineTo(m[0]+uy*5,m[1]-ux*5*d);X.lineTo(hx,hy+1);X.closePath();X.fillStyle=a.acc;X.fill();X.lineWidth=1.2;X.strokeStyle=P.ink;X.stroke();
  for(let j=0;j<3;j++){const tj=2.0+j*.22,dt=t-tj;if(dt<0||dt>.75)continue;const r=10+dt*95;X.globalAlpha=1-dt/.75;
    const pts=[];for(let i=0;i<=8;i++){const aa=(i/8-.5)*1.1+(d>0?0:Math.PI);pts.push([m[0]+Math.cos(aa)*r,m[1]-10+Math.sin(aa)*r]);}ink(pts,1.6,a.id+120+j,.4);X.globalAlpha=1;}
}

function armiesA(t){
  for(const a of ARM)postAndBugler(a,t);
  // lances under bodies
  for(const a of ARM)for(let k=NS-1;k>=0;k--)drawLance(lanceAt(a,k,t),a.id+500+k*7);
  for(const a of ARM){
    const d=a.dir;
    if(t<4.9){
      for(let i=NS-1;i>=0;i--)drawSoldier(a,i,t);
      for(let i=1;i<NS;i++){const arr=soldier(a,i,t).arr;if(t>=arr&&t<arr+.13){const n=sNodes(a,i,t);star(n.chest[0]+d*11,n.chest[1],13,a.id+50+i,P.ink,6);X.beginPath();X.arc(n.chest[0]+d*11,n.chest[1],2.6,0,6.2832);X.fillStyle=a.acc;X.fill();}}
      if(t>=4.3){const u=seg(t,4.3,4.8,E.lin),n=Math.max(2,Math.ceil(u*NS));const pts=[];for(let i=0;i<n;i++)pts.push(sNodes(a,i,t).chest);ink(pts,2.4,a.id+60,.5,a.acc);}
      continue;
    }
    const g=giantPose(a,t);let G=squeeze(giantNodes(g),g);
    X.beginPath();X.ellipse(g.x,gY(g.x)+3,76,7,0,0,6.2832);X.fillStyle=PAT.m;X.fill();
    if(t<6.95){
      const N=new Array(42),U=new Array(42);
      a.src.forEach((s,k)=>{const ti=a.map[k],T=G.N[ti],u=mergeU(k,t),C=[(s.p[0]+T.x)/2,Math.min(s.p[1],T.y)-90],p=bez(s.p,C,[T.x,T.y],u);N[ti]={x:p[0],y:p[1],r:lerp(s.r,T.r,u)};U[ti]=u;});
      for(let i=NS-1;i>=0;i--){const u=mergeU(a.chestRank[i],t);if(u<.98)drawSoldier(a,i,4.9,1-u,false);}
      drawGiantBody({N},a.id+5000,(x,y)=>Math.pow(Math.min(U[x],U[y]),2),1);
      const ea=Math.min(...[34,35,36,37,38,39,40,41].map(i=>U[i]));if(ea>.05)drawEye(G.HC,g.eye,a.id+70,1,ea);
    }else{
      for(const f of G.feet)sole(f,g.dir,a.id+80);
      drawGiantBody(G,a.id+5000,()=>1,1);
      drawEye(G.HC,g.eye,a.id+70,g.turn<1?g.turn:1);
    }
  }
}


function skyLinesW(y0, y1, dark) { for (let y = y0; y < y1; y += 4) { const w = 0.45 + 1.15 * clamp((dark - y) / 1100) + hash(y | 0, 3) * 0.25; X.fillStyle = P.ink; X.fillRect(-2600, y, 5200, w); } }
/* the film's time becomes the reel's time: a pre-roll, then the hush stretched so the giants can look at each other in silence */
function aTime(sh, lt) {
  const off = cue(sh, 'A0').at, h = cue(sh, 'hush'), Ah = h.at - off;
  if (lt < h.at) return lt - off;
  if (lt < h.to) return Ah + (lt - h.at) * (2.0 / (h.to - h.at));
  return Ah + 2.0 + (lt - h.to);
}
const CAMZ = [[-4, 0.8], [0, 0.8], [2.0, 0.86], [3.0, 1.7], [4.6, 1.7], [5.6, 0.82], [7.2, 0.8], [9.4, 1.0], [10.3, 1.4], [12.1, 1.35], [14.2, 1.3], [15.4, 1.3], [18, 0.95], [30, 0.95]];
const CAMY = [[-4, -20], [2.0, -20], [3.0, 60], [4.6, 60], [5.6, -60], [7.2, -150], [9.4, -150], [10.3, -215], [12.1, -215], [14.2, -40], [15.4, -30], [18, -60], [30, -60]];
const CAMX = [[-4, 0], [2.0, -60], [3.0, -470], [4.6, -470], [5.6, 0], [15.4, 0]];
function camAt(A) { const mid = A >= W2[0] ? (giantX(ARM[0], A) + giantX(ARM[1], A)) / 2 : kf(A, CAMX); return { x: mid, y: kf(A, CAMY), z: kf(A, CAMZ) }; }
function fieldCount(A) {
  if (A >= 14.3) return 84; if (A >= 6.0) return Math.min(42, 14 + Math.floor(28 * clamp((A - 5.2) / 1.8)));
  let n = 1; for (let i = 1; i < NS; i++) if (A >= 3.55 + 0.035 * i) n = i + 1; return n;
}
function angryKing(x, lt, A, sh, side) {
  const g = gY(x), up = seg(A, 12.5, 14.0), shake = up * Math.sin(lt * 22 + side) * 0.05;
  king(x, g, 0.3, 20000 + side * 100, null, lt, { type: side < 0 ? 'A' : 'F', f: -Math.sign(x), look: -Math.sign(x), tilt: shake, ra: up > 0.3 ? [-1.9 + Math.sin(lt * 18) * 0.2, -2.2] : [1.5, 1.6], la: up > 0.3 ? [-1.7, -2.0] : undefined });
  if (up > 0.3) for (let k = 0; k < 2; k++) { const dt = (lt * 2 + k * 0.5 + side) % 1; ink([[x - 14 + k * 26, g - 118 - dt * 10], [x - 6 + k * 26, g - 126 - dt * 10]], 1.8, 20010 + k + side, 0.2); star(x + (k ? 18 : -18), g - 120, 8 + 5 * Math.sin(lt * 14), 20020 + k + side * 3, P.red, 6); }
}
function shipGround(lt, sh) {
  const sk = cue(sh, 'sky').at, lf = cue(sh, 'lift').at, g = 560, u = lt - sk;
  X.fillStyle = P.paper; X.fillRect(0, 0, W, H); hatchSkyBand(PY0, g);
  const hl = [[PX0, g]]; for (let i = 0; i <= 20; i++) hl.push([PX0 + i * (PX1 - PX0) / 20, g - 8 * hash(20100, i)]); ink(hl, 1.5, 20101, 0.6);
  X.fillStyle = P.paper; X.fillRect(PX0, g, PX1 - PX0, 300); for (let k = 0; k < 30; k++) { const y = g + 4 + k * k * 0.2; ink([[PX0, y], [PX1, y]], 0.6 + k * 0.02, 20110 + k, 0.4); }
  const shake = lt > lf - 0.8 ? (1 - seg(lt, lf, lf + 1)) * 2.5 : 0; const lift = Math.pow(Math.max(0, lt - lf), 2.2) * 120;
  for (let i = 0; i < 22; i++) { const x = 30 + i * 60 + hash(20120, i) * 30; if (Math.abs(x - 700) > 190) tree(x + (Math.random() * 0 + (shake ? Math.sin(lt * 40 + i) * shake : 0)), g - 20 + hash(20121, i) * 20, 6 + hash(20122, i) * 3, 20130 + i * 3); }
  const board = (t0, x0, fn) => { const a = seg(lt, sk + t0, sk + t0 + 1.8, E.io), b = seg(lt, sk + t0 + 2.0, sk + t0 + 3.0); const x = lerp(x0, fn, a); if (b >= 1) return; const px = lerp(x, 680, b), py = lerp(664, 530, b), sc = lerp(0.85, 0.32, b); X.globalAlpha = 1 - seg(b, 0.6, 1); return [px, py, sc]; };
  const dust = lt > lf - 0.8 && lt < lf + 2.4; const doorOpen = lt < sk + 5.4;
  ship(700 + Math.sin(lt * 50) * shake, g + 6 - lift, 1.6, 20200, { ladder: lt < lf, door: true, open: doorOpen && lt > sk + 3.2, fire: lt > lf - 0.8 ? clamp((lt - lf + 0.8) * 1.2) : 0 });
  X.globalAlpha = 1;
  const t_ = board(0, -60, 600), k_ = board(0.6, 1340, 780);
  if (t_) { trurl(t_[0], t_[1], t_[2], sh, lt, { f: 1 }); X.globalAlpha = 1; }
  if (k_) { klap(k_[0], k_[1], k_[2], sh, lt, { f: k_[0] < 700 ? 1 : -1 }); X.globalAlpha = 1; }
  if (dust) for (let i = 0; i < 40; i++) { const d = (lt - lf + 0.8) / 3.2, a = hash(20300, i) * 6.2832, r = d * (80 + 300 * hash(20301, i)); X.fillStyle = P.ink; X.fillRect(700 + Math.cos(a) * r, g + 8 - Math.abs(Math.sin(a)) * r * 0.12, 2.4, 2.4); }
}
function orbitScene(lt, sh) {
  const o = cue(sh, 'orbit').at, u = lt - o;
  space({ x: 0, y: 0, z: 1 }, 4, lt * 3);
  worldBall(560, 400, 260, 20400, { flowers: seg(u, 0.4, 3.0, E.lin) });
  const s = seg(u, 0, sh.d - o);
  ship(lerp(520, 1180, E.out(s)), lerp(300, 120, E.out(s)), lerp(0.4, 0.12, s), 20500, { ang: lerp(0.9, 1.15, s), fire: 0.7 + 0.3 * Math.sin(lt * 17), door: false });
}
SHOTS.field = (lt, sd, sh) => {
  if (lt >= cue(sh, 'orbit').at) return orbitScene(lt, sh);
  if (lt >= cue(sh, 'sky').at) return shipGround(lt, sh);
  const A = aTime(sh, lt), c = camAt(A);
  sceneA_bg(c, lt);
  planeA(c, 1, () => {
    groundA();
    LINE_FL.forEach((f, i) => flowerA(f, A, 8000 + i)); STEP_FL.forEach((f, i) => flowerA(f, A, 8500 + i));
    angryKing(-600, lt, A, sh, -1); angryKing(600, lt, A, sh, 1);
    armiesA(A);
    if (A > 14.0 && A < 14.6) { const g = gY((giantX(ARM[0], A) + giantX(ARM[1], A)) / 2); spark((giantX(ARM[0], A) + giantX(ARM[1], A)) / 2, g - 205, (A - 14.0) / 0.6, 20600, 40); }
  });
  planeA(c, 0.55, foregroundA);
  if (A > 3.2) linkedTag(fieldCount(A));
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
  const fade = sh.shot === 'title' ? Math.max(1 - seg(lt, 0, 0.6), seg(lt, sd - 0.6, sd)) : sh.shot === 'field' ? seg(lt, sd - 0.8, sd) : sh.shot === 'landing' ? 1 - seg(lt, 0, 1.2) : sh.shot === 'end' ? 1 - seg(lt, 0, 0.5) : 1 - seg(lt, 0, 0.4);
  if (fade > 0) { X.fillStyle = P.paper; X.globalAlpha = fade; X.fillRect(0, 0, W, H); X.globalAlpha = 1; }
  border();
};
(async () => {
  T = await (await fetch('timing/gg.json')).json();
  await document.fonts.ready; await Promise.all(['IM Fell English', 'IBM Plex Mono'].map((n) => document.fonts.load(`20px "${n}"`)));
  X = document.getElementById('film').getContext('2d');
  window.__NF = Math.ceil(T.dur * 24); window.__T = T; window.__ready = true;
})();
