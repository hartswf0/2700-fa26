/* Prince Ferrix and the Princess Crystal: a diptych, outside and inside. Same toolkit as the earlier films. */
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
/* ===== ported from the Two Sallies reel (the machine and the films), adapted ===== */
const FL=300;
const TIERS=[{y0:300,y1:80,x0:-170,x1:290},{y0:80,y1:-140,x0:-155,x1:275},{y0:-140,y1:-360,x0:-140,x1:260}];
const STAIR=[[-370,300],[-200,80],[-370,-140],[-200,-360],[-40,-360]];
const SL=[];{let a=0;for(let i=1;i<STAIR.length;i++){const L=Math.hypot(STAIR[i][0]-STAIR[i-1][0],STAIR[i][1]-STAIR[i-1][1]);SL.push([a,L]);a+=L;}SL.total=a;}
function pathAt(s){for(let i=0;i<SL.length;i++){const[a,L]=SL[i];if(s<=a+L||i===SL.length-1){const u=clamp((s-a)/L),A=STAIR[i],B=STAIR[i+1];return{p:mix(A,B,u),dx:B[0]-A[0]};}}}
const MOUTH=[268,-470];
function dial(x,y,r,ang,id){circ(x,y,r,id);X.fillStyle=P.paper;X.fill();X.lineWidth=1.8;X.strokeStyle=P.ink;X.stroke();
  for(let i=0;i<9;i++){const a=-2.3+i*4.6/8,s=Math.sin(a),c=-Math.cos(a);ink([[x+s*r*.75,y+c*r*.75],[x+s*r*.92,y+c*r*.92]],1,id+i,.1);}
  ink([[x,y],[x+Math.sin(ang)*r*.8,y-Math.cos(ang)*r*.8]],2,id+20,.2);X.beginPath();X.arc(x,y,2.6,0,6.2832);X.fillStyle=P.ink;X.fill();}
function valve(x,y,r,sp,id){circ(x,y,r,id);X.lineWidth=3;X.strokeStyle=P.ink;X.stroke();for(let i=0;i<6;i++){const a=sp+i*1.047;ink([[x,y],[x+Math.cos(a)*r,y+Math.sin(a)*r]],1.6,id+i,.2);}ball(x,y,5,id+9);}
function tube(x,yb,lit,id){
  const w=10,h=46;X.fillStyle=P.ink;X.fillRect(x-8,yb-6,16,8);
  if(lit>.02){const g=X.createRadialGradient(x,yb-24,2,x,yb-24,34);g.addColorStop(0,`rgba(227,173,70,${.55*lit})`);g.addColorStop(1,'rgba(227,173,70,0)');X.fillStyle=g;X.fillRect(x-36,yb-60,72,72);}
  X.beginPath();X.moveTo(x-w,yb-6);X.lineTo(x-w,yb-h+w);X.arc(x,yb-h+w,w,Math.PI,0);X.lineTo(x+w,yb-6);X.closePath();
  X.fillStyle=lit>.02?`rgba(236,${190-30*lit|0},${120-50*lit|0},1)`:P.paper;X.fill();X.lineWidth=1.4;X.strokeStyle=P.ink;X.stroke();
  ink([[x-4,yb-9],[x-4,yb-30],[x,yb-25],[x+4,yb-30],[x+4,yb-9]],1,id,.3);ink([[x-6.5,yb-14],[x-6.5,yb-h+9]],1.1,id+1,.2,P.paper);
}
function railing(y,x0,x1,id){ink([[x0,y],[x1,y]],3,id,.5);ink([[x0,y-28],[x1,y-28]],1.6,id+1,.6);ink([[x0,y-14],[x1,y-14]],1,id+2,.6);for(let x=x0,i=0;x<=x1;x+=30,i++)ink([[x,y],[x,y-28]],1.3,id+10+i,.3);}
function stairs(){
  for(let i=0;i<3;i++){const A=STAIR[i],B=STAIR[i+1],n=Math.round(Math.abs(B[1]-A[1])/22);
    ink([A,B],2,1800+i,.5);ink([[A[0],A[1]+10],[B[0],B[1]+10]],2,1810+i,.5);
    for(let s=1;s<n;s++){const p=mix(A,B,s/n),dd=Math.sign(B[0]-A[0]);ink([[p[0]-dd*6,p[1]],[p[0]+dd*6,p[1]],[p[0]+dd*6,p[1]+6]],1.2,1820+i*30+s,.2);}
    ink([[A[0],A[1]-30],[B[0],B[1]-30]],1.4,1900+i,.5);for(let s=0;s<=n;s+=3){const p=mix(A,B,s/n);ink([p,[p[0],p[1]-30]],1.1,1910+i*20+s,.2);}}
  ink([[-210,80],[-155,80]],3,1950,.4);ink([[-385,-140],[-155,-140]],3,1951,.4);X.fillStyle=PAT.m;X.fillRect(-385,-140,230,6);ink([[-215,-360],[-140,-360]],3,1952,.4);
  railing(-140,-385,-160,1960);
}
function groundLines(y0,n=20){X.fillStyle=P.paper;X.fillRect(-200,y0,W+400,400);for(let k=0;k<n;k++){const y=y0+6+k*k*.45;ink([[-100,y],[W+100,y]],.7+k*.03,7200+k,.5);}ink([[-100,y0],[W+100,y0]],1.8,7199,.6);}
function plant(x,base,h,u,k,t){if(u<=0)return;const sw=Math.sin(t*2+k)*.05,top=[x+Math.sin(sw)*h,base-h],mid=[x+(hash(k,4)-.5)*30,base-h*.55];
  const g=p=>[x+(p[0]-x)*u,base+(p[1]-base)*u];const M=g(mid),T=g(top);
  ink([[x,base],M,T],1.6,7300+k,.5);ink([M,[M[0]+(k%2?1:-1)*18*u,M[1]-10*u]],1.2,7400+k,.3);
  ball(M[0],M[1],4*u,7500+k,PAT.f);const r=(8+hash(k,5)*9)*clamp(u*1.3);if(r>1)ball(T[0],T[1],r,7600+k,k%3?PAT.m:PAT.f);
  if(k%3===0&&u>.7){const pts=[];for(let i=0;i<=12;i++){const a=i*.5,rr=r*(1.4-i*.08);pts.push([T[0]+Math.cos(a)*rr,T[1]-r-6+Math.sin(a)*rr*.6]);}ink(pts,1,7700+k,.2);}}
function fSimple(s,ft,fd){
  const L=s.lines,FLR=560,th=L[2].t1+.55;
  skyLines(22,FLR,900);groundLines(FLR);
  let shx=0,shy=0;if(fd>th&&fd<th+.4){const e=Math.exp(-(fd-th)*12);shx=(hash(BOIL,5)-.5)*26*e;shy=(hash(BOIL,6)-.5)*16*e;}
  X.save();X.translate(shx,shy);
  const qw=[];for(let i=3;i<L.length;i++)L[i].words.forEach(w=>qw.push(w));
  qw.forEach((w,k)=>{const x=110+k*(1060/Math.max(1,qw.length-1))+(hash(k,3)-.5)*24;plant(x,FLR,70+hash(k,6)*130,clamp((fd-w.t)/.45)*(1+.08*Math.sin(clamp((fd-w.t)/.45)*Math.PI)),k,fd);});
  for(let i=0;i<3;i++){const l=L[i];if(fd<l.t0)continue;const word=l.text.replace(/[^A-Za-z]/g,'');X.font=`140px ${FONT}`;
    const ws=[...word].map(c=>X.measureText(c).width),tot=ws.reduce((a,b)=>a+b,0);let lx=W/2-tot/2;const y0=310,fall0=l.t1+.25;
    [...word].forEach((c,li)=>{const cx=lx+ws[li]/2;lx+=ws[li];const dt=fd-fall0-li*.035;
      if(dt<0){X.globalAlpha=clamp((fd-l.t0)/.12);X.font=`140px ${FONT}`;X.textAlign='center';X.textBaseline='middle';X.fillStyle=PAT.d;X.fillText(c,cx,y0);X.lineWidth=1.6;X.strokeStyle=P.ink;X.strokeText(c,cx,y0);X.globalAlpha=1;return;}
      const g=2200,vx=(hash(i*31+li,1)-.5)*180,land=FLR-17,tl=Math.sqrt(2*(land-y0)/g);let x,y;
      if(dt<tl){x=cx+vx*dt;y=y0+.5*g*dt*dt;}else{const d=dt-tl;x=cx+vx*tl+vx*.35*(1-Math.exp(-d*3));y=land-Math.abs(Math.sin(d*9))*40*Math.exp(-d*4);}
      if(fd>th)y-=Math.abs(Math.sin((fd-th)*10))*34*Math.exp(-(fd-th)*5)*(.5+hash(i*31+li,2));
      ball(x,y,17,7800+i*30+li,PAT.f);txt(c,x,y+1,19);});}
  if(fd>th&&fd<th+.14)star(W/2,290,70,7900,P.ink,12);
  X.restore();
}

function engineIcon(x,y,s){X.save();X.translate(x,y);X.scale(s,s);
  for(const[w,h,yy]of[[120,60,0],[110,60,-60],[100,60,-120]]){X.fillStyle=P.paper;X.fillRect(-w/2,yy-h,w,h);X.fillStyle=PAT.f;X.fillRect(w/2-16,yy-h,16,h);ink([[-w/2,yy-h],[w/2,yy-h],[w/2,yy],[-w/2,yy]],2,8500+yy,.4,P.ink,true);
    X.fillStyle=PAT.d;X.fillRect(-w/2+40,yy-h+14,48,26);}
  ink([[30,-180],[30,-200],[60,-224]],4,8510,.3);X.beginPath();X.ellipse(64,-228,5,15,-.7,0,6.2832);X.fillStyle=PAT.d;X.fill();X.lineWidth=2;X.strokeStyle=P.ink;X.stroke();X.restore();}
function fEpigram(s,ft,fd){
  const L=s.lines,end=vEnd(s);skyLines(22,560,1400);groundLines(560,14);
  const C=[640,300],R=185,spin=fd<L[4].t1?fd*1.1:L[4].t1*1.1+seg(fd,L[4].t1,L[5].t1)*((Math.ceil(L[4].t1*1.1/Math.PI)*Math.PI)-L[4].t1*1.1),sc=Math.max(.04,Math.abs(Math.cos(spin)));
  X.save();X.translate(C[0],C[1]);X.scale(sc,1);
  circ(0,0,R+14,8600,1.2);X.fillStyle=P.paper;X.fill();X.fillStyle=PAT.f;X.fill();X.lineWidth=2.6;X.strokeStyle=P.ink;X.stroke();
  circ(0,0,R,8601,1);X.fillStyle=P.paper;X.fill();X.lineWidth=1.6;X.stroke();
  for(let i=0;i<60;i++){const a=i/60*6.2832;ink([[Math.cos(a)*(R+3),Math.sin(a)*(R+3)],[Math.cos(a)*(R+11),Math.sin(a)*(R+11)]],1,8610+i,.1);}
  X.save();X.beginPath();X.arc(0,0,R,0,6.2832);X.clip();X.fillStyle=PAT.f;X.fillRect(-R,R*.45,2*R,R);engineIcon(-20,95,.95);X.restore();
  X.restore();
  const u=clamp((fd-L[0].t0)/(end-L[0].t0)),n=16;
  for(const side of[-1,1])for(let k=0;k<n;k++){if(k/n>u)break;const a=Math.PI/2+side*(.25+k/n*2.55),r=R+40,x=C[0]+Math.cos(a)*r,y=C[1]+Math.sin(a)*r,ta=a+side*Math.PI/2;
    X.save();X.translate(x,y);X.rotate(ta+side*.5);X.beginPath();X.ellipse(0,0,16,6.5,0,0,6.2832);X.fillStyle=P.paper;X.fill();X.save();X.clip();X.fillStyle=PAT.m;X.fillRect(-16,0,32,8);X.restore();X.lineWidth=1.3;X.strokeStyle=P.ink;X.stroke();X.restore();
    if(k>0){const a0=Math.PI/2+side*(.25+(k-1)/n*2.55);ink([[C[0]+Math.cos(a0)*(R+30),C[1]+Math.sin(a0)*(R+30)],[C[0]+Math.cos(a)*(R+30),C[1]+Math.sin(a)*(R+30)]],1.4,8700+k+side*50,.2);}}
  if(fd>L[3].t0-.2){const a=clamp((fd-L[3].t0+.2)/.3),sl=seg(fd,L[4].t0,L[5].t1)*10,x=200,y=560;X.globalAlpha=a;
    ink([[x-14,y],[x-30,y-4]],1.5,8800,.3);ink([[x+14,y],[x+30,y-2]],1.5,8801,.3);ball(x,y-14,9,8802,PAT.m);ball(x,y-34+sl*.4,10,8803);
    ink([[x-12,y-34+sl*.4],[x+10,y-28+sl*.4]],1.5,8804,.2);ink([[x+12,y-36+sl*.4],[x-9,y-28+sl*.4]],1.5,8805,.2);ball(x+2,y-58+sl,12,8806,PAT.f);
    if(fd>L[5].t0){const c=clamp((fd-L[5].t0)/.6);circ(x+8,y-92+sl,10*c,8807,1);X.lineWidth=1.2;X.strokeStyle=P.ink;X.stroke();circ(x+24,y-100+sl,7*c,8808,1);X.stroke();}
    X.globalAlpha=1;}
}

function sword(h,a,id){const L=118,ux=Math.cos(a),uy=Math.sin(a),tip=[h[0]+ux*L,h[1]+uy*L];ink([h,tip],3.2,id,.2);ink([[h[0]-uy*14,h[1]+ux*14],[h[0]+uy*14,h[1]-ux*14]],3,id+1,.2);ball(h[0]-ux*12,h[1]-uy*12,4,id+2,PAT.d);ink([[h[0]+ux*20-uy*1.5,h[1]+uy*20+ux*1.5],[tip[0]-ux*10,tip[1]-uy*10]],.8,id+3,.2,P.paper);}
function fShears(s,ft,fd){
  const L=s.lines,W3=L[2].words,ts=W3[0].t+.15,tstir=(W3[3]||W3[W3.length-1]).t,rise0=L[3].t0,rise1=L[3].t0+1.6,seize=L[4].t0,swing=L[5].t0;
  X.fillStyle=P.paper;X.fillRect(0,0,W,560);X.fillStyle=PAT.f;X.fillRect(0,0,W,560);
  X.fillStyle=P.paper;X.beginPath();X.moveTo(840,330);X.lineTo(840,170);X.arc(920,170,80,Math.PI,0);X.lineTo(1000,330);X.closePath();X.fill();X.fillStyle=PAT.d;X.fill();
  X.save();X.clip();X.beginPath();X.arc(950,160,34,0,6.2832);X.fillStyle=P.paper;X.fill();for(let x=860;x<1000;x+=28)ink([[x,60],[x,340]],3,9000+x,.3);X.restore();
  ink([[840,330],[840,170]],2.6,9050,.4);ink([[1000,330],[1000,170]],2.6,9051,.4);X.beginPath();X.arc(920,170,80,Math.PI,0);X.lineWidth=2.6;X.strokeStyle=P.ink;X.stroke();ink([[826,334],[1014,334]],4,9052,.3);
  groundLines(560,16);
  const sw0=[600,300];let swA=-2.3,swH=sw0;
  // Sela: walks in behind the bed, snips, recoils, sinks
  const walk=seg(fd,L[1].t0-.2,L[1].t1+.3,E.lin),sx=lerp(1180,505,E.io(walk));let selaX=sx;if(fd>rise0)selaX=lerp(505,640,seg(fd,rise0,rise0+1));
  const sink=seg(fd,swing+.25,swing+1.5,E.in);
  const sela={x:selaX,y:540,s:.95,f:-1,dark:1,hood:1,id:9100,walk:(walk>0&&walk<1)?1:0,ph:fd*11,sy:1-.85*sink,alpha:1-.4*sink};
  const snipOpen=fd<ts?.5+.15*Math.sin(fd*9):.05;
  if(fd>L[1].t1-.3&&fd<rise0+.6)sela.hf=[44,-170];
  if(fd>rise0)sela.hf=[30,-150],sela.hb=[-34,-150];
  figure(sela);
  if(sela.hf&&fd<rise0+.6&&sink<.01){const h=toWorld(sela,sela.hf);for(const sg of[-1,1]){const a=Math.PI*.62+sg*snipOpen;ink([h,[h[0]+Math.cos(a)*34,h[1]+Math.sin(a)*34]],2.4,9200+sg,.2);}X.beginPath();X.arc(h[0]-4,h[1]-6,5,0,6.2832);X.arc(h[0]+4,h[1]-7,5,0,6.2832);X.lineWidth=1.5;X.strokeStyle=P.ink;X.stroke();}
  // bed
  X.fillStyle=P.paper;X.fillRect(330,470,430,60);X.fillStyle=PAT.m;X.fillRect(330,470,430,60);ink([[330,470],[760,470],[760,530],[330,530]],2,9300,.4,P.ink,true);
  for(const x of[340,750])ink([[x,530],[x,560]],5,9301+x,.2);ink([[322,420],[322,560]],5,9310,.2);ink([[768,440],[768,560]],5,9311,.2);
  X.beginPath();X.ellipse(400,462,44,12,0,0,6.2832);X.fillStyle=P.paper;X.fill();X.lineWidth=1.6;X.stroke();
  // sword on the wall until seized
  const grab=seg(fd,seize+.15,seize+.5);
  // Sabine
  const r=seg(fd,rise0,rise1,E.io),lie={x:660,y:458,ang:-Math.PI/2},st={x:470,y:610,ang:0};
  const sab={x:lerp(lie.x,st.x,r),y:lerp(lie.y,st.y,r)-Math.sin(Math.PI*r)*70,ang:lerp(lie.ang,st.ang,r),s:lerp(1,1.08,r),f:1,id:9400,closed:fd<tstir,short:fd>ts};
  if(fd<tstir)sab.hf=[24,-120],sab.hb=[-24,-120];
  if(fd>tstir&&fd<rise0)sab.ang+=-.18*seg(fd,tstir,tstir+.3);
  if(r>=1){sab.f=1;sab.hf=[lerp(30,26,grab),lerp(-112,-226,grab)];}
  let swing01=seg(fd,swing,swing+.28,E.in),lower=seg(fd,swing+1.6,swing+2.4);
  if(fd>swing){sab.hf=[lerp(26,62,swing01),lerp(-226,-150,swing01)+lower*40];}
  // long hair (before the snip) and its fall
  const head=toWorld(sab,[0,-200]);
  for(let i=0;i<24;i++){const swy=Math.sin(fd*1.3+i*.4)*4,p0=[head[0]+12,head[1]-6+i*.9],c1=[head[0]-60,head[1]+10+i*1.3+swy],c2=[310-i*2,472+i*1.5],p3=[250-i*4+swy,556-(i%4)*2];
    const pt=u=>[(1-u)**3*p0[0]+3*(1-u)**2*u*c1[0]+3*(1-u)*u*u*c2[0]+u**3*p3[0],(1-u)**3*p0[1]+3*(1-u)**2*u*c1[1]+3*(1-u)*u*u*c2[1]+u**3*p3[1]];
    if(fd<ts){const pts=[];for(let k=0;k<=14;k++)pts.push(pt(k/14));ink(pts,1.1,9500+i,.3,'#4a443b');}
    else{const pts=[];for(let k=0;k<=12;k++)pts.push(pt(.18+.82*k/12));const dt=fd-ts-i*.012;if(dt<0)continue;const maxY=Math.max(...pts.map(p=>p[1])),drop=Math.min(.5*1500*dt*dt,560-maxY+2*(i%3));
      ink(pts.map(([x,y])=>[x-dt*12*(hash(i,9)-.3),y+Math.max(0,drop)]),1.1,9600+i,.3,'#4a443b');}}
  figure(sab);
  if(fd<seize+.15)sword(sw0,swA,9700);else{const h=toWorld(sab,sab.hf);const a=fd<swing?lerp(-2.3,-1.35,grab):lerp(-1.35,.45,swing01)+lower*.6;sword(mix(sw0,h,grab),a,9700);
    if(swing01>0&&swing01<1||(fd>swing+.28&&fd<swing+.5)){for(let k=0;k<4;k++){const pts=[];for(let j=0;j<=8;j++){const aa=lerp(-1.35,.45,j/8*Math.min(1,swing01+.2));pts.push([h[0]+Math.cos(aa)*(60+k*20),h[1]+Math.sin(aa)*(60+k*20)]);}ink(pts,1,9750+k,.4);}}}
  if(fd>ts&&fd<ts+.12)star(toWorld(sab,[0,-200])[0]+20,toWorld(sab,[0,-200])[1]+10,26,9800,P.ink,8);
}

/* ---- film 5: Gloriatron (cut off) ---- */
const STARS=Array.from({length:90},(_,i)=>[hash(i,21)*1400-60,hash(i,22)*620,hash(i,23)]);
function fGlori(s,ft,fd){
  const cut=s.lines[1].t1+.05,t=Math.min(fd,cut),b=fd-cut,C=[640,350];
  X.fillStyle=P.paper;X.fillRect(0,0,W,H);skyLines(-100,800,2000);
  STARS.forEach(([x,y,h],i)=>{X.beginPath();X.arc(x,y,1.2+h*1.4+.6*Math.sin(t*3+i),0,6.2832);X.fillStyle=P.paper;X.fill();});
  const balls=[];for(let k=0;k<16;k++){const a=t*.9+k*Math.PI/8;balls.push({x:C[0]+Math.cos(a)*340,y:C[1]+Math.sin(a)*110-10,d:Math.sin(a),k});}
  const girl=g=>{const r=10+g.d*2.5,gl=X.createRadialGradient(g.x,g.y,2,g.x,g.y,32);gl.addColorStop(0,'rgba(79,127,191,.55)');gl.addColorStop(1,'rgba(79,127,191,0)');X.fillStyle=gl;X.fillRect(g.x-32,g.y-32,64,64);
    X.beginPath();X.moveTo(g.x,g.y+r*.6);X.lineTo(g.x+r*1.1,g.y+r*2.4);X.lineTo(g.x-r*1.1,g.y+r*2.4);X.closePath();X.fillStyle=BLUE;X.fill();X.lineWidth=1.1;X.strokeStyle=P.ink;X.stroke();
    circ(g.x,g.y,r,9900+g.k,.5);X.fillStyle=BLUE;X.fill();X.lineWidth=1.4;X.stroke();X.beginPath();X.arc(g.x-r*.35,g.y-r*.35,r*.25,0,6.2832);X.fillStyle=P.paper;X.fill();};
  balls.filter(g=>g.d<0).forEach(girl);
  for(const sd of[-1,1]){X.beginPath();X.arc(C[0]+sd*7,C[1],175,sd>0?-Math.PI/2:Math.PI/2,sd>0?Math.PI/2:Math.PI*1.5);X.closePath();X.fillStyle=P.paper;X.fill();X.fillStyle=PAT.m;X.fill();X.lineWidth=2.6;X.strokeStyle=P.ink;X.stroke();}
  for(let i=0;i<46;i++){const r=12+i*3.2,a=r*.11+t*5;X.beginPath();X.arc(C[0]+Math.cos(a)*r,C[1]+Math.sin(a)*r*.98,1.8,0,6.2832);X.fillStyle=BLUE;X.fill();}
  for(const ex of[-56,56]){dial(C[0]+ex,C[1]-70,26,-1.2+.3*Math.sin(t*2+ex),9950+ex);X.save();X.beginPath();X.arc(C[0]+ex,C[1]-70,27,Math.PI,0);X.fillStyle=PAT.d;X.fill();X.restore();}
  ink([[C[0]-30,C[1]-18],[C[0],C[1]-10],[C[0]+30,C[1]-18]],2.4,9990,.3);
  const ant=[[C[0],C[1]-175],[C[0]+30,C[1]-235],[C[0]+70,C[1]-238-6*Math.sin(t*2)]];ink(ant,2.4,9991,.4);ball(ant[2][0],ant[2][1],6,9992,PAT.d);
  balls.filter(g=>g.d>=0).forEach(girl);
  if(b>0){const sq=seg(b,0,.14,E.in),h=Math.max(3,H*(1-sq));X.fillStyle=P.ink;X.fillRect(0,0,W,H/2-h/2);X.fillRect(0,H/2+h/2,W,H/2);
    if(b>.14){X.fillRect(0,0,W,H);const w=W*(1-seg(b,.14,.32));X.fillStyle=P.paper;X.fillRect(W/2-w/2,H/2-1.5,w,3);if(b>.32&&b<.6){X.globalAlpha=1-(b-.32)/.28;X.beginPath();X.arc(W/2,H/2,4,0,6.2832);X.fill();X.globalAlpha=1;}}}
}

function arrow(a,b,w,id,col=P.ink){ink([a,b],w,id,.3,col);const dx=b[0]-a[0],dy=b[1]-a[1],L=Math.hypot(dx,dy)||1,ux=dx/L,uy=dy/L;X.beginPath();X.moveTo(b[0]+ux*4,b[1]+uy*4);X.lineTo(b[0]-ux*12-uy*6,b[1]-uy*12+ux*6);X.lineTo(b[0]-ux*12+uy*6,b[1]-uy*12-ux*6);X.closePath();X.fillStyle=col;X.fill();}
function gridLines(M,alpha,reveal=1){X.globalAlpha=alpha;for(let x=40;x<=1240;x+=40){if(x>40+reveal*1220)break;const pts=[];for(let y=30;y<=610;y+=58)pts.push(M([x,y]));ink(pts,x%200===0?1.1:.5,10000+x,.2);}
  for(let y=30;y<=610;y+=40){const pts=[];for(let x=40;x<=40+reveal*1200;x+=60)pts.push(M([x,y]));if(pts.length>1)ink(pts,y%200===30?1.1:.5,10100+y,.2);}X.globalAlpha=1;}
const ID=p=>p;
function hill(x){return 560-170*Math.exp(-(((x-560)/170)**2))-90*Math.exp(-(((x-930)/110)**2));}
function st1(s,t){const L=s.lines;gridLines(ID,.55,lp(L[0],t));
  const ax=lp(L[1],t);if(ax>0){arrow([120,560],[120+ax*1080,560],1.8,10200);arrow([120,560],[120,560-ax*500],1.8,10201);if(ax>.9){txt('x',1210,582,24,{italic:1});txt('y',100,70,24,{italic:1});}}
  const hu=lp(L[2],t);if(hu>0){const pts=[];for(let x=120;x<=120+hu*1060;x+=10)pts.push([x,hill(x)]);X.save();X.beginPath();X.moveTo(120,560);pts.forEach(p=>X.lineTo(p[0],p[1]));X.lineTo(pts[pts.length-1][0],560);X.closePath();X.fillStyle=P.paper;X.fill();X.fillStyle=PAT.f;X.fill();X.restore();ink(pts,2.2,10210,.4);
    if(hu<1||t<L[3].t0){const x=200+hu*900,y=hill(x),m=(hill(x+1)-hill(x-1))/2,d=Math.hypot(1,m);ink([[x-80/d,y-80*m/d],[x+80/d,y+80*m/d]],1.6,10211,.2,P.red);ball(x,y,6,10212,PAT.d);}}
  const lu=lp(L[3],t);if(lu>0){const path=x=>170+50*Math.sin(x/90);const pts=[];for(let x=180;x<=180+lu*960;x+=12)pts.push([x,path(x)]);X.setLineDash([3,7]);ink(pts,1,10220,.2);X.setLineDash([]);
    const x=180+lu*960,y=path(x),m=(path(x+1)-path(x-1))/2,d=Math.hypot(1,m),fl=Math.sin(t*16)*8;ink([[x-90/d,y-90*m/d],[x+90/d,y+90*m/d]],1.4,10221,.2,P.red);
    ink([[x-16,y-4+fl],[x-6,y-8],[x,y]],2,10222,.2);ink([[x,y],[x+6,y-8],[x+16,y-4+fl]],2,10223,.2);ball(x,y,3.5,10224,PAT.d);}}
function st2(s,t){const L=s.lines,O=[360,520],D=[900,250];
  const tr=seg(t,L[6].t0,L[6].t0+1.4)*(1-seg(t,L[7].t0+.4,L[7].t1+.2)),ca=Math.cos(-.25*tr),sa=Math.sin(-.25*tr);
  const M=([x,y])=>{let dx=x-O[0],dy=y-O[1];const nx=(1+.2*tr)*dx+.45*tr*dy,ny=.1*tr*dx+(1-.1*tr)*dy;return[O[0]+nx*ca-ny*sa,O[1]+nx*sa+ny*ca];};
  gridLines(M,.6);
  const dc=[[-24,-42],[24,-42],[24,42],[-24,42]].map(([x,y])=>M([D[0]+x,D[1]+y]));X.beginPath();dc.forEach((p,i)=>i?X.lineTo(p[0],p[1]):X.moveTo(p[0],p[1]));X.closePath();X.fillStyle=P.paper;X.fill();X.fillStyle=PAT.m;X.fill();X.lineWidth=2;X.strokeStyle=P.ink;X.stroke();
  const kn=M([D[0]+14,D[1]]);ball(kn[0],kn[1],3.5,10300,PAT.d);
  const vu=lp(L[4],t);if(vu>0){const tip=M(mix(O,[D[0]-26,D[1]+10],vu));arrow(M(O),tip,3,10310,P.red);}
  const bu=lp(L[5],t);if(bu>0){arrow(M(O),M([O[0]+140*bu,O[1]]),2,10320);arrow(M(O),M([O[0],O[1]-140*bu]),2,10321);if(bu>.8){const a=M([O[0]+150,O[1]+22]),b=M([O[0]-26,O[1]-150]);txt('e₁',a[0],a[1],22,{italic:1});txt('e₂',b[0],b[1],22,{italic:1});}
    X.setLineDash([5,6]);ink([M(O),M([D[0]-26,O[1]]),M([D[0]-26,D[1]+10])],1,10322,.1);X.setLineDash([]);}
  const o=M(O);ball(o[0],o[1],6,10330,PAT.d);txt('O',o[0]-20,o[1]+22,20,{italic:1});
  if(t>L[7].t0){const ph=((t-L[7].t0)*1.4)%1;X.globalAlpha=1-ph;circ(o[0],o[1],10+ph*50,10331,.5);X.lineWidth=1.6;X.strokeStyle=P.ink;X.stroke();X.globalAlpha=1;}}
function heart(x,y,s){X.beginPath();X.moveTo(x,y+s*.35);X.bezierCurveTo(x+s*.9,y-s*.25,x+s*.45,y-s*.9,x,y-s*.42);X.bezierCurveTo(x-s*.45,y-s*.9,x-s*.9,y-s*.25,x,y+s*.35);X.closePath();}
function st4(s,t){const L=s.lines,C=[640,320];gridLines(ID,.35);
  const c=lp(L[9],t),sz=1-seg(c,0,.33,E.lin),sy=1-seg(c,.33,.66,E.lin),sx=1-seg(c,.66,1,E.lin),ry=t*.6,rx=.5,pts=[];
  const proj=(i,j,k)=>{let x=(i-1)*80*sx,y=(j-1)*80*sy,z=(k-1)*80*sz;let x1=x*Math.cos(ry)+z*Math.sin(ry),z1=-x*Math.sin(ry)+z*Math.cos(ry);let y1=y*Math.cos(rx)-z1*Math.sin(rx);return[C[0]+x1,C[1]+y1];};
  const hu=lp(L[10],t);
  if(hu<.15){X.globalAlpha=1-hu/.15;for(let i=0;i<3;i++)for(let j=0;j<3;j++)for(let k=0;k<3;k++){const p=proj(i,j,k);if(i<2)ink([p,proj(i+1,j,k)],1,10500+i*9+j*3+k,.2);if(j<2)ink([p,proj(i,j+1,k)],1,10530+i*9+j*3+k,.2);if(k<2)ink([p,proj(i,j,k+1)],1,10560+i*9+j*3+k,.2);}
    for(let i=0;i<3;i++)for(let j=0;j<3;j++)for(let k=0;k<3;k++){const p=proj(i,j,k);ball(p[0],p[1],7,10600+i*9+j*3+k,PAT.f);}X.globalAlpha=1;}
  if(hu>0){const fr=seg(t,L[11].t0,L[11].t0+.6);if(fr>0)for(let k=0;k<4;k++){const a=t*(.35+.18*k)+k*1.3,l=150+k*42;X.globalAlpha=.55*fr;arrow([C[0]-Math.cos(a)*l*.3,C[1]-Math.sin(a)*l*.3],[C[0]+Math.cos(a)*l,C[1]+Math.sin(a)*l],1.4,10700+k*2);arrow([C[0]+Math.sin(a)*l*.3,C[1]-Math.cos(a)*l*.3],[C[0]-Math.sin(a)*l,C[1]+Math.cos(a)*l],1.4,10701+k*2);}X.globalAlpha=1;
    const hs=10+hu*80;heart(C[0],C[1]+hs*.1,hs);X.fillStyle=P.rose;X.fill();X.save();X.clip();X.fillStyle=PAT.m;X.fillRect(C[0],C[1]-hs,hs,hs*2);X.restore();X.lineWidth=2.4;X.strokeStyle=P.ink;X.stroke();}}
function fTensor(s,ft,fd){
  const L=s.lines;X.fillStyle=P.paper;X.fillRect(0,0,W,H);
  const ST=[st1,st2,st4];
  for(let k=0;k<3;k++){const a0=k?L[4*k].t0-.1:-1,a1=k<2?L[4*k+4].t0-.35:1e9;const a=Math.min(seg(fd,a0,a0+.4),1-seg(fd,a1-.05,a1+.25));if(a<=0)continue;
    X.save();ST[k](s,fd);X.restore();if(a<1){X.globalAlpha=1-a;X.fillStyle=P.paper;X.fillRect(0,0,W,H);X.globalAlpha=1;}}
}
function drawTier(k,t,o){
  const g_=[[-170,290],[-155,275],[-140,260]][k%3],T={y0:300-220*k,y1:80-220*k,x0:g_[0],x1:g_[1]},id=1000+(k%3)*200,w=T.x1-T.x0,h=T.y0-T.y1,lit=o.lit[k]!==undefined?o.lit[k]:o.lit[0];
  X.fillStyle=P.paper;X.fillRect(T.x0,T.y1,w,h);
  X.fillStyle=PAT.m;X.fillRect(T.x1-46,T.y1,46,h);X.fillStyle=PAT.f;X.fillRect(T.x0,T.y0-26,w,26);
  ink([[T.x0,T.y1],[T.x1,T.y1],[T.x1,T.y0],[T.x0,T.y0]],2.2,id,.8,P.ink,true);
  ink([[T.x0+150,T.y1],[T.x0+150,T.y0]],1.2,id+1,.6);ink([[T.x1-46,T.y1],[T.x1-46,T.y0]],1.2,id+2,.6);
  X.fillStyle=P.ink;for(let x=T.x0+10;x<T.x1-6;x+=20){X.beginPath();X.arc(x,T.y1+8,1.8,0,6.2832);X.arc(x,T.y0-8,1.8,0,6.2832);X.fill();}
  for(let y=T.y1+28;y<T.y0-20;y+=22){X.beginPath();X.arc(T.x0+8,y,1.8,0,6.2832);X.arc(T.x1-8,y,1.8,0,6.2832);X.fill();}
  const wx0=T.x0+175,wx1=wx0+200,wy0=T.y1+40,wy1=T.y1+150;
  X.fillStyle=PAT.d;X.fillRect(wx0,wy0,wx1-wx0,wy1-wy0);ink([[wx0,wy0],[wx1,wy0],[wx1,wy1],[wx0,wy1]],1.8,id+3,.5,P.ink,true);
  if(lit>.02){X.fillStyle=`rgba(227,173,70,${.22*lit})`;X.fillRect(wx0,wy0,wx1-wx0,wy1-wy0);}
  for(let j=0;j<5;j++){const tx=wx0+24+j*38,yb=wy1-12;
    if(k===1&&j===2){const st=o.bad||'on';if(st==='gone'){X.fillStyle=P.ink;X.fillRect(tx-8,yb-6,16,8);continue;}
      const sh=o.shake?(hash(7,BOIL)-.5)*4:0;tube(tx+sh,yb,st==='new'?lit:lit*(o.shake?hash(8,BOIL):1),id+40+j*5);continue;}
    tube(tx,yb,lit,id+40+j*5);}
  dial(T.x0+52,T.y1+70,26,-2.2+3.2*lit+.15*Math.sin(t*9+k)*lit,id+80);
  dial(T.x0+108,T.y1+152,17,-2.2+3.0*lit+.2*Math.sin(t*13+k)*lit,id+110);
  valve(T.x1-92,T.y1+80,22,t*lit*1.6,id+140);
  for(let v=0;v<4;v++)ink([[T.x1-130+v*14,T.y0-74],[T.x1-130+v*14,T.y0-48]],3,id+160+v,.3);
}
/* ================= The First Sally (A): helpers, rooms, machine, horn, window ================= */
const rot = (x, y, a) => { const c = Math.cos(a), s = Math.sin(a); return [x * c - y * s, x * s + y * c]; };
const bez = (a, c, b, u) => [(1 - u) * (1 - u) * a[0] + 2 * (1 - u) * u * c[0] + u * u * b[0], (1 - u) * (1 - u) * a[1] + 2 * (1 - u) * u * c[1] + u * u * b[1]];
const mix = (a, b, u) => [lerp(a[0], b[0], u), lerp(a[1], b[1], u)];
function kf(t, k) { if (t <= k[0][0]) return k[0][1]; for (let i = 1; i < k.length; i++) { if (t <= k[i][0]) { const [a, va] = k[i - 1], [b, vb, e] = k[i]; return lerp(va, vb, (e || E.io)((t - a) / (b - a))); } } return k[k.length - 1][1]; }
const BLUE = '#4f7fbf';
const OC = document.createElement('canvas'); OC.width = W; OC.height = H; const OX = OC.getContext('2d');
function withCtx(c, fn) { const k = X; X = c; try { fn(); } finally { X = k; } }
const lp = (l, t) => clamp((t - l.t0) / Math.max(0.01, l.t1 - l.t0));
const vEnd = (s) => s.lines[s.lines.length - 1].t1;
const STAND = 664;
const MOX = 330, MOY = 447.5, MK = 0.675;           // the machine: reel coordinates -> world
const WIN = { x: 640, y: 58, w: 600, h: 337.5 };   // the projection window beside the horn
const fulcrum = (sh) => sh.lines.find((l) => l.line);
const lastB = (sh, lt) => { let k = -1; sh.lines.forEach((l, i) => { if (l.who === 'B' && lt >= l.t0 - 0.05) k = i; }); return k; };
const cueU = (sh, k, lt, dur = 0.5, i = 0) => { const c = cue(sh, k, i); return c ? seg(lt, c.at, c.at + dur, E.out) : 0; };
const cueSpan = (sh, k, lt, i = 0) => { const c = cue(sh, k, i); return c ? seg(lt, c.at, c.to, E.lin) : 0; };
const around = (sh, k, lt, a = 0, b = 0.5) => cues(sh, k).some((c) => lt >= c.at - a && lt < (c.to ?? c.at) + b);

/* Trurl and Klapaucius, as in the Dragons film */
function klap(x, y, s, sh, lt, o = {}) { const sp = sh ? talking(sh, 'K', lt) : false, e = sh ? sayAt(sh, 'K', lt) : 0; constructor_(x, y, s, 600, { robe: true, f: o.f || 1, seated: o.seated, ra: o.ra || (sp ? [0.1 - e * 0.5, -0.5 - e * 0.4] : [1.5, 1.6]), la: o.la || [1.4, 1.65], open: o.open ?? (sp ? 0.8 : 0), look: o.look ?? 1, lookY: o.lookY || 0, mouth: e, tilt: o.tilt || 0 }); }
function trurl(x, y, s, sh, lt, o = {}) { const sp = sh ? talking(sh, 'T', lt) : false, e = sh ? sayAt(sh, 'T', lt) : 0; constructor_(x, y, s, 400, { f: o.f || 1, seated: o.seated, ra: o.ra || (sp ? [-0.3 - e * 0.3, -0.2 - e * 0.4] : [1.5, 1.6]), la: o.la || [1.4, 1.65], open: sp ? 0.8 : 0, look: o.look ?? 1, lookY: o.lookY || 0, mouth: e, tilt: o.tilt || 0, closed: o.closed }); }
function groundLines(y0, n = 20) { X.fillStyle = P.paper; X.fillRect(-200, y0, W + 400, 800); for (let k = 0; k < n; k++) { const y = y0 + 6 + k * k * 0.45; ink([[-100, y], [W + 100, y]], 0.7 + k * 0.03, 7200 + k, 0.5); } ink([[-100, y0], [W + 100, y0]], 1.8, 7199, 0.6); }
function wallHatch(y1, dark = 700) { X.save(); X.globalAlpha = 0.5; skyLines(22, y1, dark); X.restore(); }

/* ---------- rooms ---------- */
function labRoom(o = {}) {
  X.fillStyle = P.paper; X.fillRect(-300, -300, W + 900, H + 900); wallHatch(600, 760);
  for (const x of [90, 1190, 560]) { X.fillStyle = P.paper; X.fillRect(x - 14, 22, 28, 580); X.fillStyle = PAT.m; X.fillRect(x + 2, 22, 12, 580); ink([[x - 14, 22], [x - 14, 600]], 1.6, 6300 + x, 0.5); ink([[x + 14, 22], [x + 14, 600]], 1.6, 6301 + x, 0.5); for (let y = 80; y < 600; y += 120) ink([[x - 18, y], [x + 18, y]], 2.4, 6310 + x + y, 0.3); }
  groundLines(600, 16);
}
function studyRoom(lt = 0) {
  X.fillStyle = P.paper; X.fillRect(-300, -300, W + 900, H + 900); wallHatch(590, 800);
  // arched window
  X.beginPath(); X.moveTo(110, 430); X.lineTo(110, 200); X.arc(200, 200, 90, Math.PI, 0); X.lineTo(290, 430); X.closePath(); X.fillStyle = P.paper; X.fill();
  X.save(); X.clip(); skyLines(100, 430, 480); X.restore();
  X.beginPath(); X.moveTo(110, 430); X.lineTo(110, 200); X.arc(200, 200, 90, Math.PI, 0); X.lineTo(290, 430); X.closePath(); X.lineWidth = 3; X.strokeStyle = P.ink; X.stroke();
  ink([[200, 110], [200, 430]], 2, 6400, 0.3); ink([[110, 250], [290, 250]], 2, 6401, 0.3); ink([[96, 436], [304, 436]], 4, 6402, 0.3);
  // shelves
  for (let k = 0; k < 3; k++) { const y = 200 + k * 130; ink([[1010, y], [1240, y]], 3, 6410 + k, 0.4); for (let i = 0; i < 12; i++) { const h = 40 + hash(k, i) * 30, x = 1016 + i * 19; if (x > 1226) break; shape(R(x, y - h, 15, h), { lw: 1.1, id: 6420 + k * 20 + i, h: [1.57, 2.6 + (i % 3), 0.5] }); } }
  groundLines(590, 16);
}

/* ---------- the machine ---------- */
function drawMachine(o) {
  X.save(); X.translate((o.ox ?? MOX) + (o.shx || 0), (o.oy ?? MOY) + (o.shy || 0)); X.scale(o.k ?? MK, o.k ?? MK);
  X.beginPath(); X.ellipse(60, FL + 4, 260, 10, 0, 0, 6.2832); X.fillStyle = PAT.m; X.fill();
  for (let k = o.n - 1; k >= 0; k--) drawTier(k, o.t, o);
  for (let k = 0; k < o.n; k++) { const g = [[-170, 290], [-155, 275], [-140, 260]][k % 3]; railing(80 - 220 * k, g[0] - (k < 1 ? 40 : 0), g[1], 2700 + k * 20); }
  if (o.n <= 3 && !o.nostairs) stairs();
  drawHorn(o);
  X.restore();
}
const hornTop = (o) => FL - 220 * o.n;
function hornMouth(o) { return [(o.ox ?? MOX) + (o.k ?? MK) * 328, (o.oy ?? MOY) + (o.k ?? MK) * (hornTop(o) - 128)]; }
function drawHorn(o) {
  const topY = hornTop(o), pu = o.pu || [0, 0, 0, 0, 0, 0, 0];
  X.fillStyle = P.paper; X.fillRect(188, topY - 70, 24, 70); X.fillStyle = PAT.m; X.fillRect(200, topY - 70, 12, 70); ink([[188, topY], [188, topY - 70], [212, topY - 70], [212, topY]], 1.8, 1700, 0.4);
  const Cc = (u) => [200 + 128 * u, topY - 70 - 46 * u * u - 12 * u], rr = (u) => 9 + 36 * Math.pow(u, 2.1);
  const nrm = (u) => { const a = Cc(u), b = Cc(u + 0.01), dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy); return [-dy / L, dx / L]; };
  const up = [], dn = [];
  for (let i = 0; i <= 14; i++) { const u = i / 14, c = Cc(u), n = nrm(u), r = rr(u); up.push([c[0] + n[0] * r, c[1] + n[1] * r]); dn.push([c[0] - n[0] * r, c[1] - n[1] * r]); }
  const poly = up.concat(dn.reverse());
  X.beginPath(); poly.forEach(([x, y], i) => (i ? X.lineTo(x, y) : X.moveTo(x, y))); X.closePath(); X.fillStyle = P.paper; X.fill();
  X.save(); X.clip(); X.fillStyle = PAT.f; X.fillRect(150, topY - 220, 260, 220); hatch(0.5, 5, 0.6, [150, topY - 220, 400, topY]); X.restore();
  ink(poly.concat([poly[0]]), 2, 1701, 0.5);
  const M = Cc(1), ta = Math.atan2(Cc(1.01)[1] - Cc(1)[1], Cc(1.01)[0] - Cc(1)[0]);
  X.beginPath(); X.ellipse(M[0], M[1], 12, rr(1), ta, 0, 6.2832); X.fillStyle = P.paper; X.fill(); X.fillStyle = PAT.d; X.fill(); X.lineWidth = 2.2; X.strokeStyle = P.ink; X.stroke();
  const part = (i, fn) => { const u = pu[i] || 0; if (u <= 0.001) return; X.save(); X.translate(0, -(1 - u) * 120); X.globalAlpha = Math.min(1, u * 3); fn(); X.restore(); };
  part(1, () => { const z = []; for (let k = 0; k <= 6; k++) z.push([200 + (k % 2 ? -17 : 17), topY - 54 + k * 6]); shape(R(184, topY - 56, 32, 4), { lw: 1.2, id: 1710, h: [0, 1.6, 0.6] }); shape(R(184, topY - 20, 32, 4), { lw: 1.2, id: 1711, h: [0, 1.6, 0.6] }); ink(z, 1.6, 1712, 0.2); ink(z.map(([a, b]) => [400 - a, b]), 1.6, 1713, 0.2); });
  part(2, () => { const c = Cc(0.5), n = nrm(0.5), r = rr(0.5) + 6; cap(c[0] + n[0] * r, c[1] + n[1] * r, c[0] - n[0] * r, c[1] - n[1] * r, 10, 1720); });
  part(3, () => { line([212, topY - 30], [242, topY - 30], 4, 1730, 0.1); valve(254, topY - 30, 13, (o.vspin || 0), 1731); });
  part(4, () => { for (const k of [-1, 0, 1]) cap(M[0] - 10, M[1] + k * 22, M[0] + 14, M[1] + k * 22 - 6, 6, 1740 + k); });
  part(5, () => { for (let k = 0; k < 5; k++) { const u = 0.1 + k * 0.07, c = Cc(u), r = rr(u) + 5; X.beginPath(); X.ellipse(c[0], c[1], 4, r, 0.3, 0, 6.2832); X.lineWidth = 3; X.strokeStyle = P.ink; X.stroke(); X.lineWidth = 1; X.strokeStyle = P.paper; X.stroke(); } });
  part(6, () => { line([352, topY], [352, topY - 150], 3, 1760, 0.1); X.beginPath(); X.ellipse(352, topY - 152, 7, 28, 0.2, 0, 6.2832); X.fillStyle = P.paper; X.fill(); X.save(); X.clip(); X.fillStyle = PAT.f; X.fillRect(340, topY - 190, 8, 80); X.restore(); X.lineWidth = 2; X.strokeStyle = P.ink; X.stroke(); });
  if ((o.glow || 0) > 0.02) { const g = X.createRadialGradient(M[0], M[1], 2, M[0], M[1], 120); g.addColorStop(0, `rgba(227,173,70,${0.85 * o.glow})`); g.addColorStop(1, 'rgba(227,173,70,0)'); X.fillStyle = g; X.fillRect(M[0] - 120, M[1] - 120, 240, 240); }
}
function litArr(sh, lt, base) { const e = sayAt(sh, 'B', lt); const v = base * (0.35 + 0.65 * e); return [v, v * 0.94, v * 0.88]; }
function partsU(sh, lt) { const pu = [0]; for (let i = 1; i <= 6; i++) { let u = i <= (sh.parts || 0) ? 1 : 0; for (const c of sh.cues) if (c.k === 'part' && c.n === i) u = seg(lt, c.at, c.at + 0.55, E.out); pu.push(u); } return pu; }

/* ---------- the window: what the horn projects ---------- */
function winRect(u) { const e = E.io(u); return { x: lerp(WIN.x, 0, e), y: lerp(WIN.y, 0, e), w: lerp(WIN.w, W, e), h: lerp(WIN.h, H, e) }; }
function beam(M, r, a) {
  if (a < 0.02) return; X.save(); X.globalAlpha = a;
  X.beginPath(); X.moveTo(M[0], M[1]); X.lineTo(r.x, r.y); X.lineTo(r.x, r.y + r.h); X.closePath(); X.fillStyle = 'rgba(227,173,70,.10)'; X.fill();
  for (let i = 0; i <= 6; i++) { X.setLineDash([3, 7]); ink([M, [r.x, r.y + r.h * i / 6]], 0.8, 6500 + i, 0.2); X.setLineDash([]); }
  ink([M, [r.x, r.y]], 1.2, 6510, 0.2); ink([M, [r.x, r.y + r.h]], 1.2, 6511, 0.2); X.restore();
}
function projWindow(r, q, fn, t) {
  withCtx(OX, () => { X.setTransform(1, 0, 0, 1, 0, 0); X.lineCap = 'round'; X.lineJoin = 'round'; X.globalAlpha = 1; X.fillStyle = P.paper; X.fillRect(0, 0, W, H); X.save(); X.beginPath(); X.rect(0, 0, W, H); X.clip(); fn(); X.restore(); });
  const s = r.w / W, Q = Math.round(q), full = r.w > 1100;
  X.save(); path(R(r.x, r.y, r.w, r.h)); X.clip(); X.fillStyle = P.paper; X.fillRect(r.x, r.y, r.w, r.h);
  const blit = (dx, dy, al, flip) => { X.save(); X.globalAlpha = al; if (flip) { X.translate(r.x + dx, r.y + r.h + dy); X.scale(s, -s); } else { X.translate(r.x + dx, r.y + dy); X.scale(s, s); } X.drawImage(OC, 0, 0); X.restore(); };
  const strips = (amp, al, flip, step = 18) => { for (let y0 = 0; y0 < H; y0 += step) { const off = (hash(y0, BOIL >> 1) - 0.5) * 2 * amp * (hash(y0 + 3, BOIL >> 2) > 0.45 ? 1 : 0.2); X.save(); X.globalAlpha = al; const sy = flip ? H - y0 - step : y0; X.drawImage(OC, 0, y0, W, step, r.x + off * s, r.y + sy * s, W * s, step * s); X.restore(); } };
  const bf = BOIL >> 1;
  if (Q <= 0) { strips(60, 0.3, true, 24); const n = full ? 900 : 700; X.fillStyle = P.ink; for (let i = 0; i < n; i++) X.fillRect(r.x + hash(i, bf) * r.w, r.y + hash(i + 500, bf) * r.h, 1.5 + hash(i, 9) * 2.5, 1.2 + hash(i, 8) * 1.6);
    const by = r.y + ((t * 260) % (r.h + 60)) - 30; X.fillStyle = 'rgba(235,227,207,.7)'; X.fillRect(r.x, by, r.w, 26 * s + 6); for (let i = 0; i < 6; i++) ink([[r.x, by + i * 4], [r.x + r.w, by + i * 4]], 0.9, 6600 + i, 0.6); }
  else if (Q === 1) { strips(46, 0.8, true, 16); X.fillStyle = P.ink; for (let i = 0; i < 160; i++) X.fillRect(r.x + hash(i, bf) * r.w, r.y + hash(i + 500, bf) * r.h, 2, 1.4); }
  else if (Q === 2) { strips(34, 0.92, false, 14); if (hash(bf, 4) > 0.8) { X.fillStyle = 'rgba(28,24,20,.5)'; X.fillRect(r.x, r.y + hash(bf, 5) * r.h, r.w, 3); } }
  else if (Q === 3) { blit(-22 * s * 2, 0, 0.45, false); blit(0, 0, hash(bf, 6) > 0.9 ? 0.6 : 1, false); }
  else if (Q === 4) { blit(0, 0, hash(bf, 7) > 0.93 ? 0.7 : 1, false); }
  else blit(0, 0, 1, false);
  X.restore();
  if (!full) {
    ink([[r.x, r.y], [r.x + r.w, r.y], [r.x + r.w, r.y + r.h], [r.x, r.y + r.h]], 2.6, 6610, 0.4, P.ink, true);
    ink([[r.x - 6, r.y - 6], [r.x + r.w + 6, r.y - 6], [r.x + r.w + 6, r.y + r.h + 6], [r.x - 6, r.y + r.h + 6]], 1, 6611, 0.4, P.ink, true);
    if (Q >= 4) { X.fillStyle = P.ink; for (let y = r.y + 10; y < r.y + r.h - 6; y += 18) { X.fillRect(r.x - 4, y, 4, 8); X.fillRect(r.x + r.w, y, 4, 8); } }
  }
}
function corrupt(text, q, seed) { const p = [0.5, 0.3, 0.16, 0.07, 0.02, 0, 0][Math.max(0, Math.min(6, Math.round(q)))]; if (p <= 0) return text; const al = 'abdeghklmnoprstuwxz'; let out = ''; for (let i = 0; i < text.length; i++) { const c = text[i]; out += /[A-Za-z]/.test(c) && hash(seed * 31 + i, BOIL >> 3) < p ? al[Math.floor(hash(i, seed + (BOIL >> 3)) * al.length)] : c; } return out; }
function winCaption(sh, lt, r, who = ['B']) {
  let k = -1; sh.lines.forEach((l, i) => { if (who.includes(l.who) && lt >= l.t0 - 0.05) k = i; }); if (k < 0) return;
  const l = sh.lines[k]; if (lt > l.t1 + 1.0) return;
  const full = r.w > 1100, q = l.q ?? 5, str = corrupt(l.say, q, k);
  X.save(); let size = full ? 30 : 24; X.font = `italic ${size}px ${FONT}`; const maxw = full ? 1150 : 560; let tw = X.measureText(str).width; if (tw > maxw) { size *= maxw / tw; X.font = `italic ${size}px ${FONT}`; }
  const y = full ? 655 : r.y + r.h + 30;
  if (full) { X.fillStyle = 'rgba(235,227,207,.95)'; X.fillRect(22, 612, W - 44, 86); ink([[22, 612], [W - 22, 612]], 1.4, 7000, 0.5); }
  const parts = str.split(' '); const sp = X.measureText(' ').width, ws = parts.map((w) => X.measureText(w).width), tot = ws.reduce((a, b) => a + b, 0) + sp * (ws.length - 1);
  let x = (full ? W / 2 : r.x + r.w / 2) - tot / 2; X.textAlign = 'left'; X.textBaseline = 'middle'; X.fillStyle = P.ink;
  parts.forEach((w, j) => { const t0 = l.words[j] ? l.words[j].t : l.t0, a = clamp((lt - t0) / 0.08); X.globalAlpha = (0.14 + 0.86 * a) * (1 - clamp((lt - l.t1 - 0.4) / 0.6)); X.fillText(w, x, y); x += ws[j] + sp; });
  X.restore();
}
function drawSlip2(sh, lt, a) {
  if (!sh.slip || a < 0.02) return;
  const rise = seg(lt, 0.2, 1.0, E.out), top = lerp(740, 470, rise), x0 = 1000, w = 236, h = 190, txt_ = sh.slip, per = 0.04, shown = Math.floor(clamp((lt - 0.9) / per, 0, txt_.length + 1));
  X.save(); X.globalAlpha = a; X.fillStyle = '#f5efe0'; X.fillRect(x0, top, w, h); X.fillStyle = PAT.f; X.fillRect(x0, top + h - 12, w, 12); ink([[x0, top], [x0 + w, top], [x0 + w, top + h], [x0, top + h]], 1.6, 7100, 0.3, P.ink, true);
  X.font = '500 14px "IBM Plex Mono","DejaVu Sans Mono",monospace'; X.fillStyle = P.ink; X.textAlign = 'left'; X.textBaseline = 'top';
  txt('COMMISSION', x0 + w / 2, top + 16, 13, { mono: true, bold: true }); X.textAlign = 'left'; X.font = '500 14px "IBM Plex Mono","DejaVu Sans Mono",monospace'; X.textBaseline = 'top';
  const words = txt_.split(' '), lines = []; let cur = ''; for (const wd of words) { if ((cur + ' ' + wd).trim().length > 22) { lines.push(cur.trim()); cur = wd; } else cur += ' ' + wd; } if (cur.trim()) lines.push(cur.trim());
  let c = 0; lines.forEach((ln, k) => { const n = Math.max(0, Math.min(ln.length, shown - c)); X.fillText(ln.slice(0, n), x0 + 12, top + 38 + k * 20); c += ln.length + 1; });
  X.restore();
}

/* ================= pictures the horn projects (full-frame 1280x720 each) ================= */
function cloud(cx, cy, s, id) {
  const cs = [[-60, 0, 38], [-20, -22, 46], [30, -14, 40], [66, 4, 30], [0, 10, 36]].map(([x, y, r]) => [cx + x * s, cy + y * s, r * s]);
  X.beginPath(); for (const [x, y, r] of cs) { X.moveTo(x + r, y); X.arc(x, y, r, 0, 6.2832); } X.lineWidth = 3.2; X.strokeStyle = P.ink; X.stroke(); X.fillStyle = P.paper; X.fill();
  X.save(); X.clip(); X.fillStyle = PAT.f; X.fillRect(cx - 130 * s, cy + 4 * s, 260 * s, 60 * s); X.restore();
}
function picLattice(t) {
  X.fillStyle = P.paper; X.fillRect(0, 0, W, H);
  for (let j = 0; j < 6; j++) for (let i = 0; i < 9; i++) { const p = [230 + i * 100 + j * 50, 130 + j * 92]; if (i < 8) ink([p, [p[0] + 100, p[1]]], 1, 6800 + j * 9 + i, 0.3); if (j < 5) { ink([p, [p[0] + 50, p[1] + 92]], 1, 6900 + j * 9 + i, 0.3); ink([p, [p[0] - 50, p[1] + 92]], 1, 6950 + j * 9 + i, 0.3); } }
  for (let j = 0; j < 6; j++) for (let i = 0; i < 9; i++) ball(230 + i * 100 + j * 50, 130 + j * 92, 11, 7000 + j * 9 + i, PAT.f, 1.4);
  const u = (t * 0.3) % 1, a = [120 + u * 120, 660], b = [680 + u * 120, 80]; ink([a, b], 3, 7100, 0.3, P.red);
  const w = [lerp(a[0], b[0], 0.5 + 0.4 * Math.sin(t * 2)), lerp(a[1], b[1], 0.5 + 0.4 * Math.sin(t * 2))];
  ball(w[0], w[1], 62, 7101, PAT.m, 3); for (let k = 0; k < 8; k++) { const an = t * 9 + k * 0.785; ink([[w[0], w[1]], [w[0] + Math.cos(an) * 60, w[1] + Math.sin(an) * 60]], 1.6, 7110 + k, 0.2); }
}
function picSob(t) {
  X.fillStyle = P.paper; X.fillRect(0, 0, W, H); skyLines(22, 440, 900);
  ball(640, 300, 170, 7200, PAT.f, 3);
  for (const s of [-1, 1]) { X.beginPath(); X.arc(640 + s * 64, 292, 26, 0.15 * Math.PI, 0.85 * Math.PI); X.lineWidth = 4; X.strokeStyle = P.ink; X.stroke(); ink([[640 + s * 100, 240 - s * 0], [640 + s * 34, 262]], 3, 7210 + s, 0.2); }
  const m = []; for (let i = 0; i <= 12; i++) m.push([580 + i * 10, 388 + Math.sin(i * 1.4 + t * 8) * 6 + (i % 2) * 2]); ink(m, 3.4, 7220, 0.3);
  for (let k = 0; k < 8; k++) { const sd = k % 2 ? 1 : -1, x = 640 + sd * (64 + (k % 3) * 6), y = 320 + ((t * 170 + k * 60) % 330); X.beginPath(); X.ellipse(x, y, 7, 12, 0, 0, 6.2832); X.fillStyle = P.paper; X.fill(); X.lineWidth = 2; X.strokeStyle = P.ink; X.stroke(); }
  X.beginPath(); X.ellipse(640, 640, 330, 34, 0, 0, 6.2832); X.fillStyle = PAT.m; X.fill(); X.lineWidth = 2.4; X.strokeStyle = P.ink; X.stroke();
}
function picTower(t, u) {
  X.fillStyle = P.paper; X.fillRect(0, 0, W, H); skyLines(22, 640, 900);
  const n = 3 + Math.floor(6 * u);
  for (let k = 0; k < n; k++) { const y = 640 - (k + 1) * 64; shape(R(440, y, 400, 60), { lw: 2, id: 7300 + k * 4, h: [1.57, 4, 0.5], sh: R(780, y, 60, 60), sh2: [0.7, 2.4, 0.7] }); for (let i = 0; i < 5; i++) shape(R(470 + i * 60, y + 16, 22, 26), { fill: P.ink, lw: 0.8, id: 7400 + k * 8 + i }); }
  const ty = 640 - n * 64; ball(640, ty - 40, 22, 7500, PAT.f); ink([[640, ty - 18], [640, ty]], 3, 7501, 0.2); ink([[610, ty - 4], [670, ty - 4]], 3, 7502, 0.2);
  groundLines(640, 6);
}
function picFrog(t) {
  X.fillStyle = P.paper; X.fillRect(0, 0, W, H); skyLines(22, 500, 900); groundLines(500, 14);
  const hop = Math.abs(Math.sin(t * 2.6)) * 70, y = 470 - hop;
  X.beginPath(); X.ellipse(640, 540, 280, 52, 0, 0, 6.2832); X.fillStyle = P.paper; X.fill(); X.fillStyle = PAT.m; X.fill(); X.lineWidth = 2.4; X.strokeStyle = P.ink; X.stroke();
  ink([[500, y + 60], [440, y + 100], [380, 520 - hop * 0.3]], 14, 7600, 0.4); ink([[780, y + 60], [840, y + 100], [900, 520 - hop * 0.3]], 14, 7601, 0.4);
  X.beginPath(); X.ellipse(640, y, 150, 100, 0, 0, 6.2832); X.fillStyle = P.paper; X.fill(); X.save(); X.clip(); X.fillStyle = PAT.f; X.fillRect(640, y - 100, 160, 200); X.restore(); X.lineWidth = 3; X.strokeStyle = P.ink; X.stroke();
  for (const s of [-1, 1]) { ball(640 + s * 70, y - 96, 30, 7610 + s, PAT.f, 2.4); X.beginPath(); X.arc(640 + s * 70 + 4, y - 94, 9, 0, 6.2832); X.fillStyle = P.ink; X.fill(); }
  const m = []; for (let i = 0; i <= 10; i++) m.push([570 + i * 14, y + 20 + Math.sin(i / 10 * Math.PI) * 18]); ink(m, 3.4, 7620, 0.3);
}
function picDog(t) {
  X.fillStyle = P.paper; X.fillRect(0, 0, W, H); skyLines(22, 520, 900); groundLines(520, 14);
  const wag = Math.sin(t * 10) * 26;
  ink([[300, 360], [250, 320 + wag], [236, 270 + wag * 1.4]], 6, 7700, 0.3);
  X.beginPath(); X.ellipse(440, 400, 170, 78, 0, 0, 6.2832); X.fillStyle = P.paper; X.fill(); X.save(); X.clip(); X.fillStyle = PAT.m; X.fillRect(440, 300, 200, 200); X.restore(); X.lineWidth = 3; X.strokeStyle = P.ink; X.stroke();
  for (const x of [330, 370, 500, 540]) ink([[x, 460], [x - 4, 560]], 12, 7710 + x, 0.3);
  ball(640, 340, 66, 7720, PAT.f, 3); X.beginPath(); X.ellipse(690, 360, 44, 30, 0.1, 0, 6.2832); X.fillStyle = P.paper; X.fill(); X.lineWidth = 2.6; X.stroke(); ball(710, 346, 8, 7721, PAT.d);
  X.beginPath(); X.ellipse(604, 296, 18, 40, -0.4, 0, 6.2832); X.fillStyle = P.ink; X.fill(); X.beginPath(); X.arc(656, 322, 6, 0, 6.2832); X.fillStyle = P.ink; X.fill();
  for (let k = 0; k < 5; k++) { const pts = []; for (let i = 0; i < 14; i++) pts.push([820 + i * 28, 250 + k * 42 + (i % 2 ? -12 : 12) + Math.sin(t * 3 + k) * 4]); ink(pts, 1.6, 7730 + k, 0.4); }
}
function picMirror(t) {
  X.fillStyle = P.paper; X.fillRect(0, 0, W, H); skyLines(22, 700, 1100);
  X.beginPath(); X.arc(640, 360, 250, 0, 6.2832); X.fillStyle = P.paper; X.fill(); X.save(); X.clip(); X.fillStyle = PAT.f; X.fillRect(0, 0, W, H); X.fillStyle = P.paper; X.beginPath(); X.rect(0, 0, W, H); X.arc(640, 360, 250, 0, 6.2832); X.fill('evenodd'); X.restore();
  X.save(); X.beginPath(); X.arc(640, 360, 238, 0, 6.2832); X.clip(); X.fillStyle = P.paper; X.fillRect(380, 100, 520, 520); engineIcon(640, 600, 1.35); for (let k = 0; k < 4; k++) { const a = t * 2 + k * 1.6; star(640 + Math.cos(a) * 190, 360 + Math.sin(a) * 160, 10, 7800 + k, P.ink, 6); } X.restore();
  X.beginPath(); X.arc(640, 360, 250, 0, 6.2832); X.lineWidth = 8; X.strokeStyle = P.ink; X.stroke(); X.beginPath(); X.arc(640, 360, 262, 0, 6.2832); X.lineWidth = 1.4; X.stroke();
  ink([[640, 610], [640, 700]], 10, 7810, 0.3); ink([[580, 700], [700, 700]], 6, 7811, 0.3);
}
function picEpoch(i, t) {
  X.fillStyle = P.paper; X.fillRect(0, 0, W, H);
  if (i === 0) { X.fillStyle = P.ink; for (let k = 0; k < 90; k++) X.fillRect(hash(k, 1) * W, 40 + hash(k, 2) * 640, 2, 2); ink([[600, 360], [680, 360]], 1.2, 7900, 0.2); ink([[640, 320], [640, 400]], 1.2, 7901, 0.2); }
  else if (i === 1) { skyLines(22, 700, 1500); cloud(420 + Math.sin(t) * 20, 280, 2.2, 7910); cloud(820, 440, 2.6, 7911); cloud(1000, 190, 1.4, 7912); }
  else if (i === 2) { skyLines(22, 700, 2000); for (let k = 0; k < 6; k++) star(160 + hash(k, 3) * 960, 120 + hash(k, 4) * 460, 40 + hash(k, 5) * 50, 7920 + k * 10, P.ink, 10); for (let k = 0; k < 60; k++) { X.beginPath(); X.arc(hash(k, 6) * W, 40 + hash(k, 7) * 640, 2, 0, 6.2832); X.fillStyle = P.paper; X.fill(); X.lineWidth = 1; X.strokeStyle = P.ink; X.stroke(); } }
  else if (i === 3) { skyLines(22, 380, 800); for (const [x, h, w] of [[260, 300, 260], [620, 380, 340], [980, 260, 240]]) { shape([[x - w / 2, 640], [x, 640 - h], [x + w / 2, 640]], { lw: 2.4, id: 7930 + x, h: [[1.1, 6, 0.6], [2.2, 9, 0.4]] }); shape([[x - w * 0.14, 640 - h * 0.7], [x, 640 - h], [x + w * 0.14, 640 - h * 0.7]], { lw: 1.4, id: 7935 + x, fill: P.paper }); } groundLines(640, 6); }
  else if (i === 4) { skyLines(22, 640, 900); groundLines(560, 10); for (const x of [520, 700]) ball(x, 540, 30, 7940 + x, PAT.m, 2.4); const fl = []; for (let k = 0; k <= 12; k++) { const a = k / 12 * Math.PI * 2; fl.push([610 + Math.sin(a) * (k % 2 ? 42 : 70) * (1 + 0.1 * Math.sin(t * 9 + k)), 440 - 120 * (0.5 - Math.cos(a) * 0.5) - (k % 2 ? 40 : 0)]); } shape(fl, { lw: 2.4, id: 7950, h: [[0.6, 4, 0.7]] }); }
  else if (i === 5) { skyLines(22, 700, 1100); for (let k = 0; k < 8; k++) { const y = 80 + k * 76; ink([[0, y + Math.sin(k) * 10], [W, y + Math.sin(k + 1) * 10]], 1, 7960 + k, 0.8); } const fx = 400 + ((t * 120) % 520); X.save(); X.translate(fx, 360 + Math.sin(t * 3) * 26); X.beginPath(); X.ellipse(0, 0, 110, 56, 0, 0, 6.2832); X.fillStyle = P.paper; X.fill(); X.save(); X.clip(); X.fillStyle = PAT.m; X.fillRect(-110, 0, 220, 60); X.restore(); X.lineWidth = 3; X.strokeStyle = P.ink; X.stroke(); X.beginPath(); X.moveTo(-100, 0); X.lineTo(-170, -50); X.lineTo(-170, 50); X.closePath(); X.fillStyle = P.paper; X.fill(); X.stroke(); ball(70, -12, 9, 7970, PAT.d); X.restore(); }
  else if (i === 6) { skyLines(22, 560, 900); groundLines(560, 10); figure({ x: 640, y: 600, s: 2.1, id: 7980, hb: [-52, -60], hf: [52, -60], f: 1 }); }
  else if (i === 66) { skyLines(22, 560, 900); groundLines(560, 10); for (const s of [-1, 1]) { const x = 640 + s * 150; shape([[x - 70, 60], [x + 70, 60], [x + 60, 520], [x + 30, 540], [x, 520], [x - 30, 540], [x - 60, 520]], { lw: 2.4, id: 7990 + s, h: [[1.57, 6, 0.6]] }); } ink([[500, 60], [780, 60]], 6, 7995, 0.3); for (let k = 0; k < 4; k++) ink([[560 + k * 50, 66], [560 + k * 50 + 10, 150]], 2, 7996 + k, 0.3); }
  else if (i === 7) { skyLines(22, 560, 900); groundLines(560, 10); castle(640, 590, 2.4, 8000, { grow: 1, t }); }
  else { for (let r = 0; r < 4; r++) for (let c = 0; c < 6; c++) { const x = 220 + c * 150, y = 150 + r * 130; ball(x, y, 46, 8100 + r * 6 + c, PAT.m, 2.4); for (let k = 0; k < 6; k++) { const a = t * 3 * (r % 2 ? 1 : -1) + k * 1.047; ink([[x, y], [x + Math.cos(a) * 40, y + Math.sin(a) * 40]], 1.6, 8200 + r * 60 + c * 6 + k, 0.2); } } }
}
function drawReel(x, y, r, id) { ball(x, y, r, id, PAT.m, 2); for (let k = 0; k < 5; k++) { const a = k * 1.2566; ink([[x, y], [x + Math.cos(a) * r * 0.85, y + Math.sin(a) * r * 0.85]], 1.2, id + 1 + k, 0.2); } X.beginPath(); X.arc(x, y, r * 0.22, 0, 6.2832); X.fillStyle = P.ink; X.fill(); }
function fModern(s, ft, fd) {
  const L = s.lines; X.fillStyle = P.paper; X.fillRect(0, 0, W, H);
  X.globalAlpha = 0.22; for (let x = 40; x < W; x += 80) ink([[x, 30], [x, 690]], 0.6, 8300 + x, 0.2); for (let y = 40; y < H; y += 80) ink([[30, y], [W - 30, y]], 0.6, 8400 + y, 0.2); X.globalAlpha = 1;
  const a = seg(fd, L[2].t0 - 0.2, L[2].t0 + 0.6) * (1 - seg(fd, L[4].t0, L[4].t0 + 0.6));
  if (a > 0) {
    X.globalAlpha = a; const p2 = lp(L[2], fd), p3 = lp(L[3], fd);
    shape(R(210, 250, 150, 300), { lw: 3, id: 8500, h: [1.57, 5, 0.6] }); ball(335, 410, 8, 8501, PAT.d); X.fillStyle = P.ink; for (let k = 0; k < 160 * p2; k++) X.fillRect(150 + hash(k, 5) * 270, 560 + hash(k, 6) * 18, 2, 2);
    const c = [640, 330]; ball(c[0], c[1], 130, 8502, PAT.f, 4); for (let k = 0; k < 12; k++) { const an = k * 0.5236; ink([[c[0] + Math.cos(an) * 112, c[1] + Math.sin(an) * 112], [c[0] + Math.cos(an) * 124, c[1] + Math.sin(an) * 124]], 1.4, 8510 + k, 0.1); }
    ink([c, [c[0] + Math.cos(-1.2 - p3 * 6) * 100, c[1] + Math.sin(-1.2 - p3 * 6) * 100]], 4, 8530, 0.2); ink([c, [c[0] + Math.cos(0.4 - p3 * 0.6) * 70, c[1] + Math.sin(0.4 - p3 * 0.6) * 70]], 5, 8531, 0.2);
    const st = []; for (let k = 0; k <= 6; k++) st.push([900 + k * 40, 570 - k * 36]); const n = Math.floor(st.length * Math.min(1, p3 * 1.6 + 0.001)); const pts = []; for (let k = 0; k < st.length; k++) { pts.push(st[k]); if (k < st.length - 1) pts.push([st[k + 1][0], st[k][1]]); } ink(pts, 3, 8540, 0.3);
    if (p3 > 0.3) for (let k = 0; k < Math.min(n, 6); k++) X.fillRect(900 + k * 40 + 8, 570 - k * 36 - 6, 20, 6);
    X.globalAlpha = 1;
  }
  const b = seg(fd, L[5].t0 - 0.3, L[5].t0 + 0.4) * (1 - seg(fd, L[7].t0, L[7].t0 + 0.5));
  if (b > 0) {
    X.globalAlpha = b; const py = lp(L[5], fd), pb = lp(L[6], fd);
    txt('THE POET', 340, 120, 22, { mono: true, bold: true }); txt('THE HORN', 940, 120, 22, { mono: true, bold: true });
    X.textAlign = 'left'; X.font = '500 26px "IBM Plex Mono","DejaVu Sans Mono",monospace'; X.fillStyle = P.ink; X.textBaseline = 'middle';
    const ys = L[5].say.slice(0, Math.floor(L[5].say.length * py)); X.fillText(ys.slice(0, 22), 80, 250); X.fillText(ys.slice(22), 80, 290);
    const bs = L[6].say.slice(0, Math.floor(L[6].say.length * pb)); X.font = `italic 30px ${FONT}`; X.fillText(bs.slice(0, 33), 650, 250); X.fillText(bs.slice(33), 650, 292);
    arrow([470, 420], [610, 420], 3, 8600); txt('same rule', 540, 460, 22, { italic: 1 });
    txt('×', 800, 560, 80, { italic: 1 }); X.textAlign = 'center'; txt(String(Math.max(1, Math.floor(347 * E.out(pb)))), 960, 560, 110, {});
    X.globalAlpha = 1;
  }
  const c3 = seg(fd, L[7].t0 - 0.2, L[7].t0 + 0.6);
  if (c3 > 0) { X.globalAlpha = c3; for (let k = 0; k < 46; k++) { const x = 100 + hash(k, 40) * 1080, y = ((fd * 120 + hash(k, 41) * 800) % 760) - 40, an = fd * (0.6 + hash(k, 42)) + k; X.save(); X.translate(x, y); X.rotate(an); X.fillStyle = P.paper; X.fillRect(-22, -30, 44, 60); X.fillStyle = PAT.f; X.fillRect(-22, 8, 44, 22); ink([[-22, -30], [22, -30], [22, 30], [-22, 30]], 1.4, 8700 + k, 0.2, P.ink, true); for (let j = 0; j < 4; j++) ink([[-14, -20 + j * 8], [14, -20 + j * 8]], 0.8, 8760 + k * 5 + j, 0.1); X.restore(); } X.globalAlpha = 1; }
}
function fPlea(s, ft, fd) {
  const L = s.lines, B = L.find((l) => l.who === 'B'), p = B ? lp(B, fd) : 0; X.fillStyle = P.paper; X.fillRect(0, 0, W, H); skyLines(22, 560, 900); groundLines(560, 12);
  X.fillStyle = '#f5efe0'; X.fillRect(150, 150, 340, 420); ink([[150, 150], [490, 150], [490, 570], [150, 570]], 2, 8800, 0.3, P.ink, true);
  const n = Math.floor(14 * p); for (let k = 0; k < n; k++) ink([[180, 190 + k * 26], [180 + 250 * (0.6 + 0.4 * hash(k, 9)), 190 + k * 26]], 1.4, 8810 + k, 0.4);
  figure({ x: 820, y: 580, s: 2.0, id: 8830, hb: [-48, -250 + Math.sin(fd * 3) * 8], hf: [48, -250 + Math.cos(fd * 3) * 8], f: -1 });
  for (let k = 0; k < 3; k++) { const a = fd * 2 + k * 2.1; ball(820 + Math.cos(a) * 190, 330 + Math.sin(a) * 90, 6, 8840 + k, PAT.d); }
}

/* ================= the shots ================= */
const SHOTS = {};
const tightU = (sh, lt) => { const f = fulcrum(sh); return f ? seg(lt, f.t0 - 0.5, f.t0 + 0.3) * (1 - seg(lt, f.t1 + 0.1, f.t1 + 0.8)) : 0; };
const camMix = (a, b, u) => blendCam(a, b, E.io(clamp(u)));
function hornIcon(px, py, sc, glow = 0, parts = 6) { // the horn alone, base at (px,py)
  const o = { n: 1, pu: [0, 1, 1, 1, 1, 1, 1].map((v, i) => (i <= parts ? v : 0)), glow }; X.save(); X.translate(px - 200 * sc, py - 80 * sc); X.scale(sc, sc); drawHorn(o); X.restore(); return [px + 128 * sc, py - 128 * sc];
}
function waves(M, t0, lt, n = 5, col = P.ink, spread = 0.9, dir = -0.3, sp = 130) {
  for (let k = 0; k < n; k++) { const u = ((lt - t0) * 0.7 - k / n); const uu = u - Math.floor(u); if (lt < t0) continue; const r = 30 + uu * sp * 3; X.globalAlpha = (1 - uu) * 0.9; X.beginPath(); X.arc(M[0], M[1], r, dir - spread, dir + spread); X.lineWidth = 2.2 * (1 - uu) + 0.6; X.strokeStyle = col; X.stroke(); }
  X.globalAlpha = 1;
}
function pairStand(sh, lt, o = {}) {
  klap(o.kx ?? 700, STAND, 0.5, sh, lt, { f: -1, look: 0, lookY: -1.2, ...(o.k || {}) });
  trurl(o.tx ?? 860, STAND, 0.5, sh, lt, { f: 1, look: 0, lookY: -1.2, ...(o.t || {}) });
}

SHOTS.title = (lt) => {
  X.fillStyle = P.paper; X.fillRect(0, 0, W, H);
  const u = seg(lt, 0.4, 2.2), M = hornIcon(560, 330, 1.4, u);
  shape(R(500, 330, 120, 44), { lw: 2, id: 9000, h: [0, 3, 0.6], sh: R(580, 330, 40, 44), sh2: [1.57, 2.4, 0.8] });
  waves(M, 0.6, lt, 4, P.ink, 0.7, -0.3, 90);
  txt('THE FIRST SALLY (A)', CX, 430, 60, {}); txt('or, Trurl’s Electronic Bard', CX, 494, 36, { italic: true }); txt('after Stanisław Lem, The Cyberiad', CX, 548, 22, { italic: true });
};

SHOTS.tease = (lt, sd, sh) => {
  const L = sh.lines, sl = cue(sh, 'slate'), sk = cue(sh, 'sketch'), bk = cue(sh, 'books'), lg = cue(sh, 'laugh');
  const c = camFor(lt, [[0, ON(640, 380, 1.0)], [L[1].t0 - 0.3, ON(800, 400, 1.2)], [L[2].t0 - 0.5, ON(430, 390, 1.55)], [L[2].t1 + 0.4, ON(640, 380, 1.0)]], 0.9);
  cam(c, () => {
    studyRoom(lt);
    const swap = seg(lt, sk.at, sk.at + 0.7);
    // slate on an easel
    X.save(); X.globalAlpha = 1 - swap;
    ink([[560, 360], [530, 640]], 4, 9010, 0.3); ink([[700, 360], [730, 640]], 4, 9011, 0.3); ink([[630, 360], [630, 640]], 3, 9012, 0.3);
    shape(R(480, 150, 300, 210), { fill: '#2a241d', lw: 4, id: 9013 }); X.restore();
    if (swap < 1) { X.save(); X.globalAlpha = 1 - swap; X.beginPath(); X.rect(480 + 10, 160, 280 * seg(lt, sl.at, sl.to, E.lin), 190); X.clip(); X.font = `64px ${FONT}`; X.fillStyle = P.paper; X.textAlign = 'center'; X.textBaseline = 'middle'; X.fillText('2 + 2 = 7', 630, 255); X.restore(); }
    if (swap > 0) { // the drawing board: the horn, drafted left to right
      X.save(); X.globalAlpha = swap; shape(R(470, 130, 320, 250), { fill: '#f5efe0', lw: 3, id: 9020 }); X.beginPath(); X.rect(470, 130, 320 * seg(lt, sk.at + 0.2, sk.to - 0.3, E.lin), 250); X.clip();
      X.save(); X.translate(520, 330); X.scale(0.95, 0.95); drawHorn({ n: 1, pu: [0, 0, 0, 0, 0, 0, 0] }); X.restore();
      for (let k = 0; k < 5; k++) ink([[490, 150 + k * 6], [770, 150 + k * 6]], 0.5, 9030 + k, 0.2); X.restore(); }
    // book piles
    const pb = seg(lt, bk.at, bk.to, E.lin), nb = Math.floor(16 * pb);
    for (let k = 0; k < nb; k++) { const col = k % 2, h = Math.floor(k / 2), x = col ? 235 : 110, y = 650 - h * 17, bx = x + (hash(k, 3) - 0.5) * 12; shape(R(bx - 54, y - 16, 108, 16), { lw: 1.4, id: 9040 + k, h: [0, 2.6 + (k % 3), 0.55] }); line([bx - 54, y - 8], [bx + 54, y - 8], 0.8, 9070 + k, 0.2); }
    // Trurl and Klapaucius
    const lgh = lt > lg.at && lt < lg.to, sw = lgh ? Math.sin(lt * 30) * 0.04 : 0;
    klap(960, STAND, 0.95, sh, lt, { f: -1, look: -1, tilt: lgh ? -0.1 + sw : 0, ra: lgh ? [1.2, 0.7 + Math.sin(lt * 20) * 0.2] : undefined, open: lgh ? 1 : undefined });
    const bowed = lt > L[1].t0 && lt < L[2].t0 - 0.4;
    trurl(340, STAND, 0.95, sh, lt, { f: 1, look: 1, closed: bowed, tilt: bowed ? 0.12 : 0, lookY: lt > L[3].t0 ? 0.7 : 0 });
  });
};

SHOTS.universe = (lt, sd, sh) => {
  const L = sh.lines, ep = cue(sh, 'epoch'), rw = cues(sh, 'rewind'), rl = cue(sh, 'reels'), tl = cue(sh, 'tilt');
  let p = seg(lt, ep.at, ep.to, E.lin) * 1.32; for (const r of rw) p -= 0.16 * seg(lt, r.at, r.at + 0.5, E.in); p = clamp(p, 0, 0.999);
  const rwz = rw.some((r) => lt >= r.at && lt < r.at + 0.6), wrong = lt > rw[1].at - 1.4 && lt < rw[1].at - 0.1 && p > 0.6;
  let ei = Math.floor(p * 9); if (wrong) ei = 66;
  const N = Math.floor(130 * seg(lt, rl.at, rl.to, E.lin)), tu = seg(lt, tl.at, tl.to, E.io);
  const tt = tightU(sh, lt);
  let c = camMix(ON(640, 380, 1.0), ON(900, 480, 1.7), tt); c = camMix(c, ON(240, -120, 0.72), tu);
  cam(c, () => {
    labRoom(); const lit = [0.7 + 0.25 * hash(BOIL >> 1, 3), 0.7, 0.7 + 0.2 * hash(BOIL >> 1, 4)];
    const o = { n: 3, lit: lit.map((v) => v * seg(lt, 1, 2.5)), t: lt, pu: [0, 0, 0, 0, 0, 0, 0], nostairs: true, glow: 0.35 + 0.2 * Math.sin(lt * 5) };
    drawMachine(o); const M = hornMouth(o);
    for (let k = 0; k < N; k++) { const col = k % 4, row = Math.floor(k / 4), y = 633 - row * 34, born = (rl.at + (k / 130) * (rl.to - rl.at)), drop = lt - born < 0.3 ? (1 - (lt - born) / 0.3) * 60 : 0; drawReel(40 + col * 40, y - drop, 17, 9100 + k * 7); }
    if (lt > ep.at - 0.3) { const r = winRect(0); beam(M, r, 1); projWindow(r, rwz ? 0 : 3, () => picEpoch(Math.max(0, ei === 66 ? 66 : Math.min(8, ei)), lt), lt); }
    else { const r = winRect(0); projWindow(r, 0, () => picEpoch(0, lt), lt); }
    trurl(920, STAND, 0.55, sh, lt, { f: -1, look: -1, lookY: -0.6 });
  });
};

SHOTS.trials = (lt, sd, sh) => {
  const L = sh.lines, fl = cue(sh, 'floors'), sk = cue(sh, 'sink'), sw = cue(sh, 'switch'), off = cue(sh, 'off');
  const pu = partsU(sh, lt), fu = seg(lt, fl.at, fl.to, E.lin) * (1 - seg(lt, sk.at, sk.to, E.lin)), n = 3 + Math.floor(6 * fu + 0.001);
  const on = lt > sw.at && lt < off.at ? 1 : 0, kB = lastB(sh, lt);
  const o = { n, lit: litArr(sh, lt, 0.85 * on), t: lt, pu, nostairs: true, glow: sayAt(sh, 'B', lt) * 0.9, vspin: lt * 2 };
  const M = hornMouth({ n: 3 });
  // camera: wide, then in on the horn at each repair, out for the floors
  let c = ON(560, 380, 0.95);
  for (const pc of cues(sh, 'part')) c = camMix(c, ON(M[0] + 90, M[1] + 40, 1.9), seg(lt, pc.at - 0.4, pc.at, E.io) * (1 - seg(lt, pc.at + 1.3, pc.at + 1.9, E.io)));
  c = camMix(c, ON(300, -20, 0.5), fu * 1.0);
  c = camMix(c, ON(880, 470, 1.8), tightU(sh, lt));
  cam(c, () => {
    labRoom(); drawMachine(o);
    const mouth = hornMouth(o);
    const r = winRect(0); let pic = null, q = 0;
    if (kB >= 0) { q = sh.lines[kB].q; pic = [null, picLattice, null, picSob, null, (t) => picTower(t, fu), null, picFrog, null, null, picMirror][kB]; }
    if (lt >= L[8].t0 && kB === 7) { pic = picDog; q = lt > cue(sh, 'part', 3).at ? 4 : 3; }
    if (kB === 10) q = 5;
    if (lt > off.at) pic = null;
    beam([mouth[0] + 0, mouth[1]], r, on ? 1 : 0.3);
    if (pic) projWindow(r, q, () => pic(lt), lt); else projWindow(r, on ? 0 : 0, () => { X.fillStyle = P.paper; X.fillRect(0, 0, W, H); }, lt);
    winCaption(sh, lt, r);
    const up = cues(sh, 'part').some((pc) => lt > pc.at - 0.6 && lt < pc.at + 0.7);
    trurl(900, STAND, 0.55, sh, lt, { f: -1, look: -1, lookY: up || fu > 0 ? -1.2 : 0, ra: up ? [-1.7, -1.2] : undefined, closed: lt > L[11].t0 + 1 });
  });
};

SHOTS.warmup = (lt, sd, sh) => {
  const L = sh.lines, lv = cue(sh, 'lever'), shk = cue(sh, 'shake'), bu = cue(sh, 'burst'), run = cue(sh, 'run'), cl = cue(sh, 'climb'), dv = cue(sh, 'dive'), ot = cue(sh, 'out'), cn = cue(sh, 'clean'), kick = cue(sh, 'kick'), bangs = cues(sh, 'bang');
  const power = seg(lt, lv.at, lv.at + 1.4) * (lt < bu.at + 0.1 || lt > ot.at ? 1 : 0.15);
  const shaking = lt > shk.at && lt < bu.at, burst = lt > bu.at, repaired = lt > ot.at + 0.3;
  const bad = !burst ? 'on' : repaired ? 'new' : 'gone';
  let shx = 0, shy = 0; if (shaking) shx += (hash(3, BOIL) - 0.5) * 2.6;
  bangs.forEach((b, i) => { const dt = lt - b.at; if (dt >= 0 && dt < 0.4) { const e = Math.exp(-dt * 22); shx += e * 6 * (i % 2 ? 1 : -1); shy += e * 2; } });
  const lit = litArr(sh, lt, 0.8 * power).map((v) => v * (shaking ? 0.5 + 0.5 * hash(BOIL, 9) : 1));
  const o = { n: 3, lit, t: lt, pu: [0, 1, 1, 1, 1, 1, 1], bad, shake: shaking, shx, shy, glow: sayAt(sh, 'B', lt) * 0.9, vspin: lt * 2 };
  const mach = (rx, ry) => [MOX + MK * rx, MOY + MK * ry];
  // Trurl's position on the stairs
  const climbU = seg(lt, cl.at, cl.to, E.lin), sPos = pathAt(climbU * SL.total);
  const inMachine = lt >= cl.at && lt < dv.at + 0.5;
  const popU = seg(lt, ot.at, ot.at + 0.35, E.out);
  const hatch = mach(-40, -360);
  let c = ON(560, 380, 0.9);
  if (lt > run.at) c = camMix(c, ON(500, 420, 0.9), seg(lt, run.at - 0.3, run.at, E.io));
  if (inMachine && lt < dv.at) { const pp = mach(sPos.p[0], sPos.p[1]); c = ON(pp[0] + 80, pp[1] - 10, 2.0); }
  if (lt >= dv.at && lt < ot.at - 0.2) c = camMix(ON(hatch[0] + 60, hatch[1] + 120, 1.0), ON(hatch[0] + 80, hatch[1] + 160, 1.15), seg(lt, dv.at, ot.at));
  if (lt >= ot.at - 0.2) c = camMix(camMix(c, ON(hatch[0] + 40, hatch[1] + 30, 2.3), seg(lt, ot.at - 0.2, ot.at + 0.5)), ON(560, 380, 0.9), seg(lt, L[13].t0 + 0.3, L[13].t1 + 0.6));
  const poems = L.filter((l) => l.poem), sP = { lines: poems };
  cam(c, () => {
    labRoom(); drawMachine(o);
    const M = hornMouth(o), r = winRect(0);
    // the window: dark until the lever, the film while the machine speaks, noise after the burst, a clean picture after the repair
    beam(M, r, power);
    let draw = () => { X.fillStyle = P.paper; X.fillRect(0, 0, W, H); }, q = 0;
    if (lt >= L[2].t0 - 0.4 && !burst) { draw = () => fSimple(sP, lt, lt); q = lt < L[5].t0 ? 2 : 3; }
    else if (burst && !repaired) { draw = () => picEpoch(0, lt); q = 0; }
    else if (repaired) { draw = () => picMirror(lt); q = lt > cn.at ? 5 : 1; }
    else if (power > 0.3) { draw = () => picEpoch(0, lt); q = 0; }
    projWindow(r, q, draw, lt);
    winCaption(sh, lt, r);
    // sparks when Trurl kicks the current
    if (lt > kick.at && lt < kick.at + 0.25) { const m = mach(60, 120); star(m[0], m[1], 50 * (1 - (lt - kick.at) / 0.25), 9200, P.ink, 10); }
    // the burst: the tube flies, shards fall
    X.save(); X.translate(MOX, MOY); X.scale(MK, MK);
    if (burst) { const dt = lt - bu.at; if (dt < 0.12) star(120, -25, 26 + dt * 100, 9210, P.ink, 10);
      if (dt < 0.7) { const u = dt / 0.7, p = bez([120, -25], [30, -170], [-150, 290], u); X.save(); X.translate(p[0], p[1]); X.rotate(u * 9); tube(0, 23, 0, 9220); X.restore(); }
      if (dt > 0.7) { const d2 = dt - 0.7; for (let i = 0; i < 11; i++) { const rr = rng(77 + i), vx = (rr() - 0.5) * 560, vy = -80 - rr() * 320, sp = (rr() - 0.5) * 24, sz = 3 + rr() * 5, g = 1400; const tlnd = (-vy + Math.sqrt(vy * vy + 4 * 0.5 * g * 4)) / g, d = Math.min(d2, tlnd); const x = -150 + vx * d, y = Math.min(300, 296 + vy * d + 0.5 * g * d * d); X.save(); X.translate(x, y - sz * 0.4); X.rotate(sp * d); X.beginPath(); X.moveTo(-sz, 0); X.lineTo(sz * 0.4, -sz * 0.8 - 1); X.lineTo(sz, sz * 0.3); X.closePath(); X.fillStyle = P.paper; X.fill(); X.lineWidth = 1.1; X.strokeStyle = P.ink; X.stroke(); X.restore(); } } }
    // bangs inside: stars and steam
    bangs.forEach((b, i) => { const dt = lt - b.at; if (dt < 0) return; const r2 = rng(300 + i); if (dt < 0.12) star(-100 + r2() * 330, -330 + r2() * 600, 14 + dt * 120, 9300 + i * 10, P.ink, 9);
      const vx = 150 + r2() * 60, vy = -100 + r2() * 200 - 220 * (i % 3); if (dt < 0.9) for (let k = 0; k < 3; k++) { const rr2 = 6 + dt * 22 + k * 4; X.globalAlpha = 1 - dt / 0.9; circ(vx + k * 9, vy - dt * 60 - k * 6, rr2, 9400 + i * 5 + k, 1.2); X.fillStyle = P.paper; X.fill(); X.fillStyle = PAT.f; X.fill(); X.lineWidth = 1.3; X.strokeStyle = P.ink; X.stroke(); X.globalAlpha = 1; } });
    // the roof hatch and Trurl on the stairs, in the machine's own scale
    const HS = 0.3 / MK;
    X.save(); X.beginPath(); X.rect(-3000, -3000, 6000, 3000 - 360); X.clip();
    const lid = lt >= dv.at - 0.2 && lt < dv.at + 0.6 ? 1 : lt >= ot.at - 0.1 ? 1 : 0;
    if (lid) ink([[-62, -361], [-62 + 40 * Math.cos(0.8), -361 - 40 * Math.sin(0.8)]], 5, 9500, 0.2);
    if (lt >= dv.at && lt < dv.at + 0.45) { const u = seg(lt, dv.at, dv.at + 0.45, E.in); trurl(-40, -360 + 250 * u, HS, sh, lt, { f: 1, ra: [-2.4, -2.2], la: [-2.6, -2.2], look: 0, lookY: 1 }); }
    if (lt >= ot.at && lt < ot.at + 3) { const y = -250 + 118 * popU; trurl(-40, y, HS, sh, lt, { f: 1, ra: talking(sh, 'T', lt) ? [-1.3, -0.9] : [-2.2, -2.0], la: [-2.4, -2.0], look: lt < L[12].t0 ? -1 : 1, lookY: -0.4 }); }
    if (lt >= ot.at + 3) trurl(-40, -250 + 118, HS, sh, lt, { f: 1, ra: [-2.2, -2.0], la: [-2.4, -2.0], look: 1, lookY: -0.4 });
    X.restore();
    if (inMachine && lt < dv.at) { const sg = Math.sign(sPos.dx) || 1, ph = climbU * SL.total / 9; trurl(sPos.p[0], sPos.p[1] - 4 - Math.abs(Math.sin(ph * 3)) * 5, HS, sh, lt, { f: sg, ra: [0.5 + Math.sin(ph * 3) * 0.7, 0.9], la: [0.5 - Math.sin(ph * 3) * 0.7, 0.9], look: sg, lookY: -0.4 }); }
    X.restore();
    // foreground figures
    const rn = seg(lt, run.at, run.to, E.in);
    if (lt < run.to) { const tx = lt < run.at ? 880 : lerp(880, 330, rn); const spd = lt >= run.at; trurl(tx, STAND - (spd ? Math.abs(Math.sin(lt * 14)) * 10 : 0), 0.5, sh, lt, { f: spd ? -1 : -1, look: -1, ra: spd ? [0.3 + Math.sin(lt * 14), 0.8] : undefined, la: spd ? [0.3 - Math.sin(lt * 14), 0.8] : undefined, tilt: spd ? -0.12 : 0 }); }
    const kreact = lt > bu.at && lt < ot.at + 2 ? [-1.0, -0.6] : undefined;
    klap(1010, STAND, 0.5, sh, lt, { f: -1, look: -1, lookY: -1.2, ra: kreact });
  });
};

/* the poem shots: the commission, the horn, the window; at the fulcrum line the window opens to the whole frame */
function poemShot(sh, lt, film, stand = {}) {
  const f = fulcrum(sh), wu = f ? seg(lt, f.t0 - 0.5, f.t0 + 0.2) * (1 - seg(lt, f.t1 + 0.15, f.t1 + 0.9)) : 0, s = { lines: sh.lines.filter((l) => l.poem) };
  labRoom();
  const pu = partsU(sh, lt), o = { n: 3, lit: litArr(sh, lt, 0.85), t: lt, pu, nostairs: true, glow: sayAt(sh, 'B', lt) * 0.9, vspin: lt * 0.5 };
  drawMachine(o); const M = hornMouth(o), r = winRect(wu);
  pairStand(sh, lt, stand);
  drawSlip2(sh, lt, 1 - wu);
  beam(M, r, 1 - wu);
  projWindow(r, 5, () => film(s, lt, lt), lt);
  winCaption(sh, lt, r);
}
SHOTS.epigram = (lt, sd, sh) => poemShot(sh, lt, fEpigram);
SHOTS.shears = (lt, sd, sh) => poemShot(sh, lt, fShears);
SHOTS.glori = (lt, sd, sh) => poemShot(sh, lt, fGlori);
SHOTS.tensor = (lt, sd, sh) => poemShot(sh, lt, fTensor);

SHOTS.exit = (lt, sd, sh) => {
  const L = sh.lines, dr = cue(sh, 'door'), wh = cue(sh, 'whisper');
  const kx = lt < dr.at ? 700 : lerp(700, 1500, seg(lt, dr.at, dr.at + 2.4, E.in)), walking = lt >= dr.at && kx < 1480;
  const gossip = lt > wh.at;
  cam(ON(640, 380, 1.0), () => {
    labRoom(); const o = { n: 3, lit: [0.3, 0.3, 0.3], t: lt, pu: [0, 1, 1, 1, 1, 1, 1], nostairs: true }; drawMachine(o); const M = hornMouth(o), r = winRect(0); beam(M, r, 0.5); projWindow(r, 5, () => picMirror(lt), lt);
    if (!gossip) { klap(kx, STAND - (walking ? Math.abs(Math.sin(lt * 10)) * 6 : 0), 0.5, sh, lt, { f: walking ? 1 : -1, look: walking ? 1 : 0, lookY: walking ? 0 : -1.2, ra: walking ? [0.5 + Math.sin(lt * 10) * 0.6, 0.9] : undefined, la: walking ? [0.5 - Math.sin(lt * 10) * 0.6, 0.9] : undefined }); trurl(860, STAND, 0.5, sh, lt, { f: 1, look: 0, lookY: walking ? 0 : -1.2, closed: lt > dr.at + 0.5 }); }
    else { const bob = (i) => Math.sin(lt * 3 + i) * 2;
      trurl(720, STAND, 0.55, sh, lt, { f: -1, look: -1, ra: [-2.6, -2.2], la: [1.4, 1.65], closed: false }); for (let i = 0; i < 4; i++) micro(560 + i * 34, STAND + 6, 0.8, 9600 + i * 20, { f: 1, look: 1, bob: bob(i), tilt: 0.1 * Math.sin(lt * 2 + i) });
      klap(1060, STAND, 0.55, sh, lt, { f: 1, look: 1, ra: [-2.6, -2.2] }); for (let i = 0; i < 4; i++) micro(1160 + i * 34, STAND + 6, 0.8, 9700 + i * 20, { f: -1, look: -1, bob: bob(i + 2), tilt: -0.1 * Math.sin(lt * 2 + i) }); }
  });
};

function poetFig(x, y, o = {}) { // a poet with a suitcase
  const ph = o.ph || 0, walk = o.walk ? 1 : 0, up = o.up || 0;
  figure({ x, y: y - (walk ? Math.abs(Math.sin(ph)) * 4 : 0), s: o.s || 0.52, f: o.f ?? 1, id: o.id, walk, ph, hood: o.hood, dark: o.dark, closed: o.closed, short: o.short, ang: o.ang || 0,
    hb: o.hb || [-30 + (up ? -10 : 0), up ? -250 : -110], hf: o.hf || [30 + (up ? 10 : 0), up ? -250 : -112] });
  if (o.case !== false && !o.ang) { const cx = x + (o.f ?? 1) * 52 * (o.s || 0.52) * 1.1; shape(R(cx - 15, y - 32, 30, 24), { lw: 1.3, id: o.id + 80, h: [0.8, 2.6, 0.6] }); line([cx - 6, y - 32], [cx + 6, y - 32], 1.4, o.id + 81, 0.1); }
}
SHOTS.poets = (lt, sd, sh) => {
  const L = sh.lines, en = cue(sh, 'enter'), jr = cue(sh, 'jeer'), tp = cue(sh, 'trip'), lv = cue(sh, 'leave');
  const tt = tightU(sh, lt), winU = tt;
  cam(ON(640, 380, 1.0), () => {
    labRoom(); const o = { n: 3, lit: litArr(sh, lt, 0.85), t: lt, pu: [0, 1, 1, 1, 1, 1, 1], nostairs: true, glow: sayAt(sh, 'B', lt) * 0.9 }; drawMachine(o);
    const M = hornMouth(o), r = winRect(winU); beam(M, r, 1 - winU);
    const s = { lines: sh.lines };
    projWindow(r, 5, () => fModern(s, lt, lt), lt);
    winCaption(sh, lt, r, ['B', 'Y']);
    // wave 1: three old poets who come to jeer, then leave
    const xs1 = [840, 950, 1060];
    xs1.forEach((tx, i) => { const enter = seg(lt, en.at + i * 0.5, en.at + 3.4 + i * 0.4, E.io), leave = seg(lt, L[1].t0 + 0.6 + i * 0.25, L[1].t0 + 3.2 + i * 0.25, E.in); if (lt > L[1].t0 + 4) return; const x = lerp(1450, tx, enter) + leave * 600, wk = (enter > 0 && enter < 1) || leave > 0; const jeering = lt > jr.at && lt < jr.to; poetFig(x, STAND, { id: 9800 + i * 100, ph: lt * 8 + i, walk: wk, f: wk && leave > 0 ? 1 : -1, hood: i === 1, dark: i === 2, up: jeering ? (Math.sin(lt * 9 + i) > 0 ? 1 : 0) : 0, short: i === 0 }); });
    // wave 2: five poets with trunks, one recites, one trips
    const xs2 = [700, 780, 860, 940, 1020];
    if (lt > L[4].t0 - 0.2) xs2.forEach((tx, i) => { const enter = seg(lt, L[4].t0 + i * 0.35, L[4].t0 + 3.2 + i * 0.35, E.io), x = lerp(1450, tx, enter) + (lt > lv.at ? 0 : 0); const wk = enter > 0 && enter < 1; const rec = i === 0 && lt > L[5].t0 - 0.3 && lt < L[6].t0; const tripper = i === 3 && lt > tp.at; const good = i < 2; const sag = lt > L[6].t1 && good;
      let ang = 0, yy = STAND; if (tripper) { const u = seg(lt, tp.at, tp.at + 0.5, E.in); ang = u * 1.45; yy = STAND - u * 4; }
      const leaving = i === 2 && lt > lv.at; const lx = leaving ? x + seg(lt, lv.at, lv.to, E.lin) * 700 : x;
      poetFig(lx, yy, { id: 9900 + i * 100, ph: lt * 8 + i, walk: wk || leaving, f: leaving ? 1 : -1, up: rec ? 1 : 0, ang: ang * (-1), closed: !good && lt > L[6].t1, hood: i === 4, dark: i === 1, hb: sag ? [-34, -80] : undefined, hf: sag ? [34, -80] : undefined, case: !tripper }); });
    if (lt > tp.at) { for (let k = 0; k < 9; k++) { const u = seg(lt, tp.at + 0.1, tp.at + 0.8, E.out); const x = 940 + (hash(k, 3) - 0.3) * 160 * u, y = STAND - 20 - (1 - u) * 60 * hash(k, 4); X.save(); X.translate(x, y); X.rotate(hash(k, 5) * 3); X.fillStyle = P.paper; X.fillRect(-16, -11, 32, 22); ink([[-16, -11], [16, -11], [16, 11], [-16, 11]], 1.2, 9990 + k, 0.2, P.ink, true); X.restore(); } }
  });
};

SHOTS.protest = (lt, sd, sh) => {
  const L = sh.lines, st = cue(sh, 'stones'), br = cue(sh, 'brawl'), bd = cue(sh, 'bed');
  if (lt >= bd.at) { // the hospital
    const a = seg(lt, bd.at, bd.at + 0.5);
    cam(ON(640, 400, 1.0), () => {
      X.fillStyle = P.paper; X.fillRect(-300, -300, W + 900, H + 900); wallHatch(560, 760); groundLines(560, 12);
      shape(R(900, 160, 200, 150), { lw: 2.4, id: 9210, h: [1.57, 4, 0.5] }); line([900, 235], [1100, 235], 2, 9211); line([1000, 160], [1000, 310], 2, 9212);
      // bed
      shape(R(330, 440, 560, 40), { lw: 2.4, id: 9220, h: [0, 3, 0.6] }); for (const x of [350, 870]) line([x, 480], [x, 580], 6, 9221 + x, 0.2); line([330, 380], [330, 580], 6, 9230, 0.2); line([890, 400], [890, 580], 6, 9231, 0.2);
      shape([[340, 440], [880, 440], [880, 400], [560, 392], [340, 410]], { lw: 1.6, id: 9232, h: [0.2, 4, 0.5] });
      X.save(); X.translate(560, 396); X.rotate(-Math.PI / 2); trurl(0, 0, 0.62, null, lt, { f: 1, closed: true, look: 0, ra: [1.5, 1.6], la: [1.5, 1.6] }); X.restore();
      // bandage on the head and the arm in a sling
      shape(R(334, 330, 70, 20), { lw: 1.4, id: 9240, h: [0.8, 2.4, 0.7] }); for (let k = 0; k < 4; k++) line([342 + k * 17, 330], [352 + k * 17, 350], 1, 9241 + k, 0.1);
      shape([[516, 372], [610, 372], [612, 400], [520, 404]], { lw: 1.2, id: 9250, h: [0.3, 2.8, 0.7] });
      // a small monitor beside the bed
      shape(R(960, 360, 110, 90), { lw: 2.2, id: 9260, h: [0, 2.4, 0.4] }); ink([[972, 410], [992, 410], [998, 390], [1006, 430], [1012, 410], [1060, 410]], 1.6, 9261, 0.3);
      X.fillStyle = P.paper; X.globalAlpha = 1 - a; X.fillRect(0, 0, W, H); X.globalAlpha = 1;
    });
    return;
  }
  cam(ON(640, 380, 1.0), () => {
    X.fillStyle = P.paper; X.fillRect(-300, -300, W + 900, H + 900); wallHatch(560, 760); groundLines(560, 12);
    // Trurl's house
    shape(R(190, 200, 480, 390), { lw: 3, id: 9300, h: [1.57, 5, 0.5], sh: R(560, 200, 110, 390), sh2: [0.8, 2.6, 0.7] });
    shape([[160, 200], [430, 80], [700, 200]], { lw: 3, id: 9301, h: [0.5, 6, 0.6] });
    shape(R(400, 430, 70, 160), { lw: 2.4, id: 9302, fill: P.ink });
    const smashed = (i) => lt > (st.at + 1.2 + i * 1.1) ? 1 : 0;
    [[250, 260], [250, 400], [560, 260]].forEach(([x, y], i) => { shape(R(x, y, 90, 100), { lw: 2.6, id: 9310 + i, fill: smashed(i) ? P.ink : P.paper }); if (smashed(i)) { for (let k = 0; k < 7; k++) { const a = k * 0.9; ink([[x + 45, y + 50], [x + 45 + Math.cos(a) * 60, y + 50 + Math.sin(a) * 60]], 1.2, 9330 + i * 10 + k, 0.3, P.paper); } } else { line([x + 45, y], [x + 45, y + 100], 1.6, 9340 + i); line([x, y + 50], [x + 90, y + 50], 1.6, 9350 + i); } });
    // the poets, with stones
    const px = [850, 940, 1030, 1120, 1210];
    px.forEach((x, i) => { const th = (lt - st.at - i * 0.55) % 2.2, throwing = lt > st.at + i * 0.55 && lt < st.to + 1 && th > 0 && th < 0.45; poetFig(x, STAND, { id: 9400 + i * 100, f: -1, up: throwing ? 1 : 0, hood: i % 2, dark: i === 2, case: false, hb: throwing ? [-60, -150] : undefined, hf: throwing ? [60, -240] : undefined });
      if (lt > st.at + i * 0.55 && lt < st.at + 12) { const u = ((lt - st.at - i * 0.55) % 2.2) / 1.2; if (u > 0 && u < 1) { const p = bez([x - 40, 420], [(x + 330) / 2, 200], [i < 3 ? 300 : 580, i < 3 ? 440 : 310], u); ball(p[0], p[1], 8, 9480 + i, PAT.d); } }
      if (i % 2 === 0) { line([x + 30, 540], [x + 30, 360], 3, 9490 + i, 0.2); shape(R(x + 6, 320, 80, 50), { lw: 1.6, id: 9495 + i, h: [0.4, 3, 0.4] }); } });
    // the brawl cloud
    if (lt > br.at && lt < br.to + 0.6) { const u = seg(lt, br.at, br.at + 0.3, E.out) * (1 - seg(lt, br.to, br.to + 0.6)); const cx = 520, cy = 500; X.save(); X.globalAlpha = u; X.beginPath(); for (let i = 0; i <= 24; i++) { const a = i / 24 * 6.2832, rr = 90 + 26 * Math.sin(i * 2.7 + lt * 18); i ? X.lineTo(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr * 0.8) : X.moveTo(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr * 0.8); } X.closePath(); X.fillStyle = P.paper; X.fill(); X.fillStyle = PAT.f; X.fill(); X.lineWidth = 3; X.strokeStyle = P.ink; X.stroke();
      for (let k = 0; k < 5; k++) { const a = lt * 14 + k * 1.3, rr = 60 + 40 * hash(k, Math.floor(lt * 12)); ink([[cx + Math.cos(a) * 30, cy + Math.sin(a) * 24], [cx + Math.cos(a) * rr, cy + Math.sin(a) * rr * 0.8]], 8, 9500 + k, 0.4); ball(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr * 0.8, 9, 9510 + k, PAT.f); }
      star(cx - 60, cy - 70, 26, 9520, P.ink, 9); star(cx + 70, cy - 40, 20, 9521, P.ink, 8); X.restore(); }
  });
};

SHOTS.plea = (lt, sd, sh) => {
  const L = sh.lines, pp = cue(sh, 'paper'), pl = cue(sh, 'pliers'), dr = cue(sh, 'drop');
  const rise = 0.15 + 0.85 * seg(lt, pp.at, pp.to, E.out), tt = tightU(sh, lt);
  const sorrow = lt > L[3].t0, weep = lt > dr.at - 0.6;
  let c = camMix(ON(640, 380, 1.0), ON(760, 330, 1.35), tt);
  cam(c, () => {
    labRoom(); const o = { n: 3, lit: litArr(sh, lt, 0.8), t: lt, pu: [0, 1, 1, 1, 1, 1, 1], nostairs: true, glow: sayAt(sh, 'B', lt) * 0.9 }; drawMachine(o);
    const M = hornMouth(o), r = winRect(0); beam(M, r, 1); projWindow(r, 5, () => fPlea({ lines: sh.lines }, lt, lt), lt);
    // the paper
    const hH = 30 + 150 * rise;
    for (let k = 0; k < 220; k++) { const x = hash(k, 11) * 1360 - 40, prof = hH * (0.55 + 0.45 * Math.cos((x - 640) / 900)), y = STAND + 36 - hash(k, 12) * prof - (k % 7) * 2; if (y < STAND - hH) continue; X.save(); X.translate(x, y); X.rotate((hash(k, 13) - 0.5) * 1.4); X.fillStyle = P.paper; X.fillRect(-22, -14, 44, 28); ink([[-22, -14], [22, -14], [22, 14], [-22, 14]], 1, 9700 + k, 0.2, P.ink, true); if (k % 3 === 0) { ink([[-14, -6], [14, -6]], 0.7, 9930 + k, 0.1); ink([[-14, 2], [8, 2]], 0.7, 9931 + k, 0.1); } X.restore(); }
    // Trurl, with pliers
    const walk = lt > L[3].t0 + 1.8, tx = walk ? 900 + (lt - L[3].t0 - 1.8) * 40 : 900, f = walk ? 1 : -1;
    const ra = lt < dr.at ? [-0.9, -1.4] : [1.4, 1.6];
    trurl(tx, STAND + 10 - (walk ? Math.abs(Math.sin(lt * 5)) * 4 : 0), 0.7, sh, lt, { f, look: -1, ra, closed: weep, lookY: lt < L[1].t0 ? 0 : -0.3, tilt: sorrow ? 0.14 : 0 });
    const s_ = 0.7, hx = tx + f * s_ * (30 + 62 * Math.cos(ra[0]) + 58 * Math.cos(ra[1])), hy = STAND + 10 + s_ * (-214 + 62 * Math.sin(ra[0]) + 58 * Math.sin(ra[1]));
    const pliers = (x, y, a) => { X.save(); X.translate(x, y); X.rotate(a); for (const k of [-1, 1]) line([0, 0], [38, k * 7], 4, 9600 + k, 0.1); line([-16, -8], [0, 0], 4, 9602, 0.1); line([-16, 8], [0, 0], 4, 9603, 0.1); X.restore(); };
    if (lt >= pl.at && lt < dr.at) pliers(hx, hy, -0.4); else if (lt >= dr.at) { const d = lt - dr.at, y = Math.min(STAND + 30, hy + 500 * d * d); pliers(hx + d * 20, y, 0.3 + d * 6 * Math.min(1, (STAND + 30 - y) / 20)); }
    if (weep) for (let k = 0; k < 6; k++) { const u = ((lt * 1.4 + k / 6) % 1), hx2 = tx + f * 0.7 * (k % 2 ? 9 : -9) * 0.95, hy2 = STAND + 10 - 286 * 0.7 + 10 + u * 70; X.globalAlpha = 1 - u; X.beginPath(); X.ellipse(hx2, hy2, 2.4, 4, 0, 0, 6.2832); X.fillStyle = P.paper; X.fill(); X.lineWidth = 1; X.strokeStyle = P.ink; X.stroke(); X.globalAlpha = 1; }
  });
  winCaption(sh, lt, { x: 340, y: 430, w: 600, h: 0 });
};

SHOTS.bill = (lt, sd, sh) => {
  const L = sh.lines, un = cue(sh, 'unroll'), ch = cue(sh, 'chair'), ng = cue(sh, 'night'), pop = cue(sh, 'pop');
  if (lt >= ng.at) return night(sh, lt, ng, pop);
  const tipU = seg(lt, ch.at, ch.at + 0.6, E.in) * (1 - seg(lt, ch.at + 1.4, ch.at + 2.0, E.io));
  cam(camMix(ON(640, 380, 1.0), ON(520, 420, 1.35), seg(lt, L[1].t0 - 0.3, L[1].t0 + 0.3)), () => {
    studyRoom(lt);
    // meter on the wall, spinning
    X.beginPath(); X.arc(640, 210, 70, 0, 6.2832); X.fillStyle = P.paper; X.fill(); X.lineWidth = 4; X.strokeStyle = P.ink; X.stroke(); dial(640, 210, 54, -2.2 + (lt * (2 + 8 * seg(lt, un.at, un.at + 2))) % 4.4, 9800);
    // the bill, unrolling from the slot
    const len = 560 * seg(lt, un.at, un.to, E.out); if (len > 1) { X.fillStyle = '#f5efe0'; X.fillRect(820, 22, 130, len); ink([[820, 22], [820, 22 + len], [950, 22 + len], [950, 22]], 1.6, 9810, 0.3);
      X.font = '500 12px "IBM Plex Mono","DejaVu Sans Mono",monospace'; X.fillStyle = P.ink; X.textAlign = 'left'; X.textBaseline = 'middle'; for (let y = 44, k = 0; y < len - 10; y += 22, k++) { X.fillText(String(1000 + Math.floor(hash(k, 3) * 8999)) + '.' + String(10 + Math.floor(hash(k, 4) * 89)), 832, y); X.fillText('kW', 922, y); }
      if (len > 520) { txt('TOTAL', 885, 22 + len - 22, 18, { mono: true, bold: true }); } }
    ink([[790, 22], [980, 22]], 6, 9811, 0.3);
    // Trurl at the desk, tipping his chair; Klapaucius's chair is empty
    shape(R(280, 470, 380, 22), { lw: 2.4, id: 9820, h: [0, 3, 0.6] }); for (const x of [300, 640]) shape(R(x - 8, 492, 16, 160), { lw: 1.8, id: 9821 + x, h: [1.57, 3, 0.5] });
    X.save(); X.translate(200, STAND); X.rotate(-tipU * 0.5); X.translate(-200, -STAND); trurl(340, STAND, 0.85, sh, lt, { f: 1, seated: true, look: 1, ra: tipU > 0.2 ? [-1.8, -1.5] : [1.5, 1.6], la: tipU > 0.2 ? [-1.8, -1.5] : [1.4, 1.65], open: tipU > 0.2 ? 1 : 0 }); X.restore();
    shape(R(990, 470, 110, 14), { lw: 1.8, id: 9830, h: [0, 3, 0.6] }); line([1000, 484], [1000, 640], 5, 9831, 0.2); line([1090, 484], [1090, 640], 5, 9832, 0.2); line([1100, 350], [1100, 480], 5, 9833, 0.2); shape(R(1096, 350, 8, 130), { lw: 1.4, id: 9834 });
    shape([[1000, 470], [1080, 470], [1060, 560], [1020, 560]], { lw: 1.6, id: 9835, h: [0.8, 3.2, 0.5] });
  });
}
function night(sh, lt, ng, pop) {
  const a = seg(lt, ng.at, ng.at + 0.6), tt = lt - ng.at;
  X.fillStyle = P.paper; X.fillRect(0, 0, W, H);
  cam(ON(640, 360, 1.0), () => {
    space({ x: 0, y: 0, z: 1 }, 77, lt * 14); X.globalAlpha = a; X.fillStyle = DARK; X.fillRect(0, 0, W, H); X.globalAlpha = 1;
    space({ x: 0, y: 0, z: 1 }, 77, lt * 14);
    const ast = [980, 520], rk = rock(ast[0], ast[1], 120, 9900, 20); shape(rk, { lw: 2.4, id: 9901, h: [[0.7, 5, 0.6]], fill: '#d8cfba' });
    const sx = lerp(-320, 760, seg(lt, ng.at + 0.3, pop.at + 0.8, E.io));
    // a ship with crates
    X.save(); X.translate(sx, 250 + Math.sin(lt * 1.4) * 5);
    shape([[-130, -30], [120, -30], [160, 0], [120, 30], [-130, 30], [-170, 0]], { lw: 2.4, id: 9910, h: [0.2, 4, 0.6], sh: [[0, -30], [120, -30], [160, 0], [120, 30], [0, 30]], sh2: [1.3, 2.6, 0.7] });
    for (let k = 0; k < 4; k++) { shape(R(-110 + k * 52, -58, 46, 28), { lw: 1.8, id: 9920 + k, h: [0.78, 3, 0.6] }); } for (let k = 0; k < 3; k++) ball(-60 + k * 56, 4, 8, 9930 + k, PAT.d);
    ink([[-170, 0], [-230, -14 + Math.sin(lt * 14) * 6]], 6, 9940, 0.4, P.amber); X.restore();
    // the machine, rebuilt on the rock
    const k2 = seg(lt, pop.at, pop.at + 1.0, E.out); if (k2 > 0.02) { drawMachine({ ox: ast[0] - 60 * 0.3, oy: ast[1] - 80, k: 0.3 * k2, n: 3, lit: [0.5, 0.5, 0.5], t: lt, pu: [0, 1, 1, 1, 1, 1, 1], nostairs: true, glow: 0.4 }); }
    if (k2 > 0.5) { const ax = ast[0] + 70, ay = ast[1] - 10; ball(ax, ay, 7, 9950, PAT.d); for (let k = 0; k < 3; k++) { X.save(); X.translate(ax, ay); X.rotate(k * 1.047 + lt * 3); X.beginPath(); X.ellipse(0, 0, 26, 9, 0, 0, 6.2832); X.lineWidth = 1.6; X.strokeStyle = P.ink; X.stroke(); X.restore(); } }
  });
  void tt;
}

SHOTS.broadcast = (lt, sd, sh) => {
  const L = sh.lines, wv = cue(sh, 'waves'), shp = cue(sh, 'ship'), tc = cue(sh, 'techs'), mi = cue(sh, 'mime'), tw = cue(sh, 'tow');
  const towU = seg(lt, tw.at, tw.to, E.io), astX = 360 + (towU > 0.5 ? (towU - 0.5) * 2 * 1100 : 0), astXp = astX;
  cam(ON(640, 360, 1.0), () => {
    space({ x: 0, y: 0, z: 1 }, 88, lt * 6);
    const ast = [astXp, 560], rk = rock(ast[0], ast[1], 190, 9900, 24); shape(rk, { lw: 2.4, id: 9901, h: [[0.7, 5, 0.6]], fill: '#d8cfba' });
    const o = { ox: ast[0] - 60 * 0.42, oy: ast[1] - 60, k: 0.42, n: 3, lit: [0.7, 0.7, 0.7].map((v) => v * (0.5 + 0.5 * sayAt(sh, 'B', lt))), t: lt, pu: [0, 1, 1, 1, 1, 1, 1], nostairs: true, glow: 0.4 + 0.6 * sayAt(sh, 'B', lt) };
    // arms for the pantomime
    drawMachine(o); const M = hornMouth(o);
    if (lt > wv.at) { X.globalAlpha = 1; const lt2 = lt - wv.at; X.save(); X.lineCap = 'round'; waves(M, wv.at, lt, 6, P.paper, 1.1, -0.6, 120); X.restore(); for (let i = 0; i < 6; i++) { const u = ((lt2 * 0.7 - i / 6) % 1 + 1) % 1; X.globalAlpha = 1 - u; X.beginPath(); X.arc(M[0], M[1], 40 + u * 360, -0.6 - 0.5, -0.6 + 0.5); X.setLineDash([2, 8]); X.lineWidth = 1.4; X.strokeStyle = P.amber; X.stroke(); X.setLineDash([]); } X.globalAlpha = 1; }
    if (lt > shp.at && lt < shp.to + 1) { const u = seg(lt, shp.at, shp.to + 0.8, E.lin), x = lerp(-200, 1480, u), y = 140 + Math.sin(lt * 5) * 10; X.save(); X.translate(x, y); X.rotate(Math.sin(lt * 4) * 0.12);
      shape([[-110, -22], [90, -22], [140, 0], [90, 22], [-110, 22]], { lw: 2, id: 9960, h: [0.3, 3.4, 0.6], fill: P.paper }); for (let k = 0; k < 4; k++) { ball(-70 + k * 36, 0, 8, 9961 + k, PAT.f, 1.2); line([-74 + k * 36, 4], [-66 + k * 36, 4], 1, 9970 + k, 0.1); } shape([[-110, -22], [-140, -44], [-120, -22]], { lw: 1.6, id: 9980, fill: P.paper }); X.restore(); }
    if (lt > tc.at && lt < mi.at + 3) { for (let i = 0; i < 3; i++) { const u = seg(lt, tc.at + i * 0.3, tc.at + 1.2 + i * 0.3, E.out), x = ast[0] + 80 + i * 36, y = ast[1] - 120 - (1 - u) * 260 + 30; if (u <= 0) continue; micro(x, y + 18, 0.65, 9990 + i * 10, { f: -1, look: -1, bob: 0, ant: 0, wave: lt > mi.at ? 1 : 0 }); for (const s of [-1, 1]) ball(x + s * 8, y - 28, 4, 9995 + i * 10 + s, PAT.d); } }
    if (lt > mi.at) { const mm = lt - mi.at; for (const [bx, by, s] of [[o.ox + 0.42 * -140, o.oy - 0.42 * 20, -1], [o.ox + 0.42 * 290, o.oy - 0.42 * 20, 1]]) { const a1 = -0.8 + Math.sin(mm * 6 + s) * 0.7, ex = bx + Math.cos(a1) * 36 * s, ey = by + Math.sin(a1) * 36; X.save(); X.strokeStyle = P.paper; X.lineWidth = 7; X.lineCap = 'round'; X.beginPath(); X.moveTo(bx, by); X.lineTo(ex, ey); X.lineTo(ex + 22 * s, ey - 16 + Math.sin(mm * 9) * 12); X.stroke(); X.strokeStyle = P.ink; X.lineWidth = 2.4; X.stroke(); X.restore(); } }
    if (lt > tw.at - 0.2) { const sx = lerp(-300, 1500, towU) * 1; const y = 300; if (sx > -260) { X.save(); X.translate(sx, y); shape([[-170, -30], [130, -30], [190, 0], [130, 30], [-170, 30], [-210, 0]], { lw: 2.4, id: 9910, h: [0.2, 4, 0.6], fill: P.paper }); shape(R(-60, -70, 80, 40), { lw: 2, id: 9911, h: [0.8, 3, 0.6] }); star(-60, -86, 10, 9912, P.paper, 6); X.restore(); const ax = ast[0], ay = ast[1] - 120; ink([[sx - 210, y], [(sx - 210 + ax) / 2, y + 100], [ax, ay]], 2.4, 9913, 0.4, P.paper); } }
  });
};

const RING = [[560, 150], [700, 90], [850, 110], [990, 170], [1040, 280], [940, 350], [760, 340]];
SHOTS.stars = (lt, sd, sh) => {
  const L = sh.lines, fl = cues(sh, 'flare'), Bs = [2, 3, 4];
  const drift = lt * 5, tt = tightU(sh, lt);
  cam(camMix(ON(640, 360, 1.0), ON(760, 320, 0.9), 0), () => {
    space({ x: 0, y: 0, z: 1 }, 55, drift);
    // the ring of supergiants
    const lit = seg(lt, L[1].t0, L[1].t0 + 3);
    RING.forEach(([x, y], i) => { const r = 16 + 5 * hash(i, 4), pulse = 1 + 0.08 * Math.sin(lt * 2 + i); const g = X.createRadialGradient(x, y, 2, x, y, 80 * pulse); g.addColorStop(0, 'rgba(235,227,207,.8)'); g.addColorStop(1, 'rgba(235,227,207,0)'); X.fillStyle = g; X.fillRect(x - 80, y - 80, 160, 160); X.beginPath(); X.arc(x, y, r * pulse, 0, 6.2832); X.fillStyle = P.paper; X.fill(); star(x, y, r * 2.2, 9800 + i * 12, P.paper, 12); });
    for (let i = 0; i < RING.length; i++) { const a = RING[i], b = RING[(i + 1) % RING.length]; X.setLineDash([2, 8]); ink([a, b], 0.8, 9850 + i, 0.2, P.paper); X.setLineDash([]); }
    // the machine, small, on its rock at the lower left, aimed at the ring
    const ast = [230, 600], rk = rock(ast[0], ast[1], 170, 9900, 22); shape(rk, { lw: 2.4, id: 9901, h: [[0.7, 5, 0.6]], fill: '#d8cfba' });
    const o = { ox: ast[0] - 60 * 0.46, oy: ast[1] - 80, k: 0.46, n: 3, lit: [0.8, 0.8, 0.8], t: lt, pu: [0, 1, 1, 1, 1, 1, 1], nostairs: true, glow: 0.5 + 0.5 * sayAt(sh, 'B', lt) }; drawMachine(o); const M = hornMouth(o);
    X.setLineDash([3, 9]); ink([M, [(M[0] + 860) / 2, (M[1] + 230) / 2 - 30], [860, 230]], 1, 9860, 0.4, P.amber); X.setLineDash([]);
    // each line of verse becomes a prominence
    Bs.forEach((bi, k) => { const l = L[bi], u = clamp((lt - l.t0) / 3.4); if (u <= 0) return; const [sx, sy] = RING[[1, 3, 5][k]], dir = [-1.1, -0.2, 0.5][k]; const grow = E.out(clamp(u * 1.6)), fade = 1 - 0.5 * clamp((u - 0.7) / 0.3);
      const R0 = 22; for (let j = 0; j < 4; j++) { const rr = (90 - j * 18) * grow; if (rr < 2) continue; const cx = sx + Math.cos(dir) * R0, cy = sy + Math.sin(dir) * R0; const pts = []; for (let t2 = 0; t2 <= 20; t2++) { const a = dir - Math.PI / 2 + t2 / 20 * Math.PI, wob = 1 + 0.05 * Math.sin(t2 * 1.3 + lt * 6 + j); pts.push([cx + Math.cos(a) * rr * wob, cy + Math.sin(a) * rr * wob * 1.2]); }
        X.globalAlpha = fade; ink(pts, 2.6 - j * 0.4, 9870 + k * 10 + j, 0.5, j % 2 ? P.paper : P.amber); }
      X.globalAlpha = fade * 0.5; X.beginPath(); X.arc(sx + Math.cos(dir) * 60 * grow, sy + Math.sin(dir) * 60 * grow, 50 * grow, 0, 6.2832); X.fillStyle = 'rgba(227,173,70,.25)'; X.fill(); X.globalAlpha = 1; });
    winCaption(sh, lt, { x: 0, y: 0, w: W, h: H }, ['B']);
  });
};

SHOTS.end = (lt, sd, sh) => {
  X.fillStyle = P.paper; X.fillRect(0, 0, W, H); const u = seg(lt, 0.4, 1.6);
  X.globalAlpha = u; txt('THE FIRST SALLY (A), OR TRURL’S ELECTRONIC BARD', CX, 230, 36, {}); txt('after Stanisław Lem, The Cyberiad', CX, 290, 24, { italic: true }); txt('the poems were written for these films', CX, 330, 20, { italic: true }); X.globalAlpha = 1;
  const M = hornIcon(470, 640, 0.9, 0.4 + 0.2 * Math.sin(lt * 3));
  const ring = [[700, 440], [790, 400], [880, 430], [940, 500], [880, 570], [780, 580], [710, 520]];
  X.save(); X.fillStyle = DARK; X.fillRect(640, 380, 330, 250); X.beginPath(); X.rect(640, 380, 330, 250); X.clip(); ring.forEach(([x, y], i) => { X.beginPath(); X.arc(x, y, 5, 0, 6.2832); X.fillStyle = P.paper; X.fill(); star(x, y, 14, 9890 + i * 9, P.paper, 8); });
  const sl = seg(lt, 1.2, 3.2); for (let k = 0; k < 3; k++) { const [sx, sy] = ring[[1, 3, 5][k]], dir = [-1.1, 0, 0.9][k]; const pts = []; for (let t2 = 0; t2 <= 14; t2++) { const a = dir - Math.PI / 2 + t2 / 14 * Math.PI; pts.push([sx + Math.cos(dir) * 8 + Math.cos(a) * 26 * sl, sy + Math.sin(dir) * 8 + Math.sin(a) * 30 * sl]); } ink(pts, 1.8, 9895 + k, 0.4, P.amber); } X.restore();
  X.setLineDash([3, 8]); ink([M, [700, 470]], 1, 9899, 0.3); X.setLineDash([]);
};
/* ================= frame loop ================= */
window.__render = async (f) => {
  const t = f / 24; GT = t; BOIL = Math.floor(f / 2);
  let i = 0; for (let j = 0; j < T.shots.length; j++) if (t >= T.shots[j].t0) i = j;
  const sh = T.shots[i], lt = t - sh.t0, sd = sh.d;
  X.setTransform(1, 0, 0, 1, 0, 0); X.fillStyle = P.paper; X.fillRect(0, 0, W, H);
  X.save(); path(R(PX0, PY0, PX1 - PX0, PY1 - PY0)); X.clip();
  SHOTS[sh.shot](lt, sd, sh);
  X.restore(); X.setTransform(1, 0, 0, 1, 0, 0);
  const fade = sh.shot === 'title' ? Math.max(1 - seg(lt, 0, 0.6), seg(lt, sd - 0.6, sd)) : sh.shot === 'end' ? 0 : 1 - seg(lt, 0, 0.25);
  if (fade > 0) { X.fillStyle = P.paper; X.globalAlpha = fade; X.fillRect(0, 0, W, H); X.globalAlpha = 1; }
  border();
};
(async () => {
  T = await (await fetch('timing/eb.json')).json();
  await document.fonts.ready; await Promise.all(['IM Fell English', 'IBM Plex Mono'].map((n) => document.fonts.load(`20px "${n}"`)));
  X = document.getElementById('film').getContext('2d');
  window.__NF = Math.ceil(T.dur * 24); window.__T = T; window.__ready = true;
})();
