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

/* ================= the diptych =================
   sp 0..1. The left panel is the outside, the right is the inside. Both show the same world
   through the same camera, each centred in its own half. */
function diptych(sp, c, scene) {
  if (sp < 0.003) { INSIDE = false; cam(c, scene); return; }
  const g = 12 * clamp(sp * 5), dv = lerp(PX1 + g, CX, E.io(sp));
  const lc = (PX0 + dv - g / 2) / 2, rc = (dv + g / 2 + PX1) / 2;
  X.save(); X.beginPath(); X.rect(PX0, PY0, dv - g / 2 - PX0, PY1 - PY0); X.clip(); X.translate(lc - CX, 0); INSIDE = false; cam(c, scene); X.restore();
  X.save(); X.beginPath(); X.rect(dv + g / 2, PY0, PX1 - dv - g / 2, PY1 - PY0); X.clip(); X.translate(rc - CX, 0); INSIDE = true; cam(c, scene);
  X.setTransform(1, 0, 0, 1, 0, 0); X.globalAlpha = 0.07; X.fillStyle = P.ink; X.fillRect(dv, PY0, PX1 - dv, PY1 - PY0); X.globalAlpha = 1; X.restore(); INSIDE = false;
  X.fillStyle = P.paper; X.fillRect(dv - g / 2, PY0, g, PY1 - PY0);
  line([dv - g / 2, PY0], [dv - g / 2, PY1], 2.2, 3200, 0.4); line([dv + g / 2, PY0], [dv + g / 2, PY1], 2.2, 3201, 0.4);
}

/* ================= robots ================= */
function robot(x, y, s, id, o = {}) {
  if (SILENT) return;
  X.save(); X.translate(x, y); X.scale(s * (o.f || 1), s);
  const ra = o.ra || [1.85, 1.62], la = o.la || [1.3, 1.52];
  const back = () => { const [, , hx, hy] = limb(-30, -214, la[0], 62, la[1], 58, 15, id + 1); hand(hx, hy, la[1], 8, id + 4); };
  back();
  const wk = o.walk || 0, ph = (o.ph || 0);
  for (const k of [-1, 1]) { const sw = Math.sin(ph + (k > 0 ? 0 : Math.PI)) * 0.28 * wk; const [, , fx] = limb(k * 13, -128, Math.PI / 2 - k * 0.06 + sw, 64, Math.PI / 2 + k * 0.04 + sw * 0.5, 62, 17, id + 10 + k * 5); boot(fx + k * 2, 0, 1, 1.2, id + 20 + k); }
  shape([[-24, -140], [24, -140], [20, -116], [-20, -116]], { lw: 1.5, id: id + 30, sh: R(6, -140, 20, 26), sh2: [1.5, 2.2, 0.6] });
  cap(0, -146, 0, -180, 14, id + 31);
  shape([[-38, -224], [38, -224], [28, -170], [-28, -170]], { lw: 1.8, id: id + 32, sh: [[12, -226], [40, -226], [30, -168], [12, -168]], sh2: [1.65, 2.4, 0.7] });
  if (!o.plain) { shape(R(-14, -212, 28, 22), { lw: 1, id: id + 33 }); line([-10, -206], [10, -206], 0.7, id + 34); line([-10, -200], [6, -200], 0.7, id + 35); }
  ball(-34, -220, 9, id + 36, PAT.f, 1.2); ball(34, -220, 9, id + 37, PAT.f, 1.2);
  if (o.robe) shape([[-46, -232], [-10, -226], [44, -150], [60, -60], [-10, -46], [-58, -80], [-50, -150]], { lw: 2, id: id + 40, h: [1.75, 5, 0.5], sh: [[10, -230], [70, -230], [70, -40], [10, -40]], sh2: [1.65, 2.6, 0.7] });
  if (o.robe) for (let i = 0; i < 5; i++) ink([[-40 + i * 18, -60], [-30 + i * 14, -140], [-26 + i * 8, -210]], 1, id + 50 + i, 0.8);
  if (o.belly) o.belly();
  if (o.inner) o.inner();
  cap(0, -228, 0, -244, 10, id + 38);
  const [, , hx, hy] = limb(30, -214, ra[0], 62, ra[1], 58, 15, id + 60); hand(hx, hy, ra[1], 8, id + 63, o.open || 0);
  if (o.held) o.held(hx, hy, ra[1]);
  X.restore();
  const hX = x + (o.hx || 0) * s * (o.f || 1), hY = y - 286 * s;
  if (o.head) o.head(hX, hY, 0.95 * s); else boxHead(hX, hY, 0.95 * s, id + 80, { f: o.f, look: o.look || 0, tilt: o.tilt || 0, closed: o.closed, lookY: o.lookY || 0, mouth: o.mouth || 0, stern: o.stern, hair: o.hair, glasses: o.glasses, mus: o.mus });
}
const armEnd = (sx, a) => { const ex = sx + Math.cos(a[0]) * 62, ey = -214 + Math.sin(a[0]) * 62; return [ex, ey, ex + Math.cos(a[1]) * 58, ey + Math.sin(a[1]) * 58]; };

/* Ferrix's own head: a bell */
function bellHead(x, y, s, id, o = {}) {
  if (SILENT) return;
  X.save(); X.translate(x, y); X.rotate(o.tilt || 0); X.scale(s * (o.f || 1), s);
  const p = [[-30, 40], [-24, 18], [-24, -10]]; for (let i = 0; i <= 10; i++) { const a = Math.PI + i / 10 * Math.PI; p.push([Math.cos(a) * 24, -10 + Math.sin(a) * 34]); } p.push([24, 18], [30, 40]);
  shape(p, { lw: 2, id: id + 1, sh: [[8, -60], [40, -60], [40, 44], [8, 44]], sh2: [1.62, 2.4, 0.7] });
  shape([[-34, 38], [34, 38], [32, 46], [-32, 46]], { lw: 1.6, id: id + 2, h: [0, 2.2, 0.6] });
  ball(0, -48, 5, id + 3, PAT.f, 1.2);
  const lx = (o.look || 0) * 3;
  if (o.closed) { line([-15, -6], [-6, -6], 1.6, id + 4, 0.1); line([6, -6], [15, -6], 1.6, id + 5, 0.1); }
  else { shape(R(-16 + lx, -10, 10, 5), { fill: P.ink, lw: 0.8, id: id + 4 }); shape(R(6 + lx, -10, 10, 5), { fill: P.ink, lw: 0.8, id: id + 5 }); }
  const mo = o.mouth || 0; shape(R(-10, 16 - mo * 2, 20, 3 + mo * 7), { fill: P.ink, lw: 0.8, id: id + 6 });
  for (let i = 0; i < 3; i++) line([-18 + i * 3, -30 + i * 2], [-14 + i * 3, 10], 0.8, id + 8 + i, 0.2);
  X.restore();
}

/* ================= Ferrix and his costume =================
   o: clay 0..1, dev (devices fitted 0..3), sq (bladder squeezed 0..1), bleed (0..1 flowing),
   bel (bellows pressed 0..1), tear (tubes emptied 0..1), cry (outside drops 0..1), shake, slip {lt, at, to, c0} */
const HULL_ORDER = ['torso', 'hips', 'thighL', 'thighR', 'shinL', 'shinR', 'back1', 'back2', 'neck', 'head', 'front1', 'front2'];
function hullParts(o) {
  const ra = o.ra || [1.85, 1.62], la = o.la || [1.3, 1.52];
  const [bex, bey, bhx, bhy] = armEnd(-30, la), [fex, fey, fhx, fhy] = armEnd(30, ra);
  const mid = (a, b, c, d) => [(a + c) / 2, (b + d) / 2, Math.atan2(d - b, c - a)];
  const b1 = mid(-30, -214, bex, bey), b2 = mid(bex, bey, bhx, bhy), f1 = mid(30, -214, fex, fey), f2 = mid(fex, fey, fhx, fhy);
  return {
    back1: [b1[0], b1[1], 44, 22, b1[2]], back2: [b2[0], b2[1], 42, 20, b2[2]],
    thighL: [-15, -92, 24, 44, 0], thighR: [15, -92, 24, 44, 0], shinL: [-15, -38, 23, 40, 0], shinR: [15, -38, 23, 40, 0],
    hips: [0, -130, 50, 30, 0], torso: [0, -194, 62, 66, 0], neck: [0, -238, 26, 18, 0], head: [0, -286, 42, 50, 0],
    front1: [f1[0], f1[1], 44, 22, f1[2]], front2: [f2[0], f2[1], 42, 20, f2[2]],
  };
}
const Z_ORDER = ['back1', 'back2', 'thighL', 'thighR', 'shinL', 'shinR', 'hips', 'torso', 'neck', 'head', 'front1', 'front2'];
function clayHull(o) {
  const c = o.clay ?? 0, parts = hullParts(o), N = HULL_ORDER.length;
  const g = clamp(c / 0.45), ch = clamp((c - 0.45) / 0.47);
  const rank = (k) => (HULL_ORDER.indexOf(k) + 0.5) / N;
  for (const k of Z_ORDER) {
    const [px, py, rx, ry, ang] = parts[k], i = HULL_ORDER.indexOf(k), id = 700 + i * 13;
    const sx = Math.sin(GT * 31 + i * 1.7) * (o.shake || 0) * 5, sy = Math.cos(GT * 27 + i) * (o.shake || 0) * 3;
    const isHead = k === 'head';
    const draw = (fn) => { if (isHead && o.tilt) { X.save(); X.translate(0, -286); X.rotate(o.tilt * (o.f || 1)); X.translate(0, 286); fn(); X.restore(); } else fn(); };
    let shownG = g > rank(k), shownC = ch > rank(k), fall = 0;
    if (o.slip && !shownC) {
      // the moment this chunk came loose, while clay ran from c0 to 0 between at and to
      const cth = 0.45 + rank(k) * 0.47, td = lerp(o.slip.at, o.slip.to, clamp((o.slip.c0 - cth) / o.slip.c0)), u = o.slip.lt - td;
      if (u > 0 && o.slip.c0 > cth) fall = u;
    }
    if (INSIDE) { draw(() => { if (shownC || shownG) dashed(blobPts(px + sx, py + sy, rx, ry, id, 16, 0.14, 0.3, ang), 0.9); }); continue; }
    if (shownG && !shownC) draw(() => shape(blobPts(px + sx, py + sy, rx * 0.92, ry * 0.92, id + 3, 16, 0.18, 0, ang), { lw: 1.2, id: id + 3, h: [[0.7, 2.2, 0.9], [2.3, 3.4, 0.6]], amp: 1 }));
    if (shownC) draw(() => { const pts = blobPts(px + sx, py + sy, rx, ry, id, 18, 0.14, 0.4, ang); wet(pts, id, { dens: 0.012, h: [0.4, 6, 0.35] }); });
    if (fall > 0) { const dy = Math.min(-ry * 0.3 - py, 600 * fall * fall), flat = clamp((600 * fall * fall - dy) / 60); const pts = blobPts(px + fall * 30 * (hash(id, 9) - 0.5), py + dy, rx * (1 + 0.4 * flat), ry * (1 - 0.6 * flat), id, 16, 0.2, 0.3, ang * (1 - flat)); wet(pts, id, { dens: 0.012 }); }
  }
  if (INSIDE || ch < 0.95) return;
  // fringes, flaps, a face
  for (let i = 0; i < 6; i++) { const x0 = -44 + i * 17 + hash(760, i) * 6, dr = 22 + hash(761, i) * 26 + Math.sin(GT * 2 + i) * 2; wet(blobPts(x0 + (o.shake || 0) * 3 * Math.sin(GT * 30 + i), -140 + dr / 2, 7, dr / 2, 760 + i * 3, 20, 0.08, 0.6), 760 + i * 3, { dens: 0.02, lw: 1.1 }); }
  X.save(); X.translate(0, -286); X.rotate((o.tilt || 0) * (o.f || 1)); X.translate(0, 286);
  for (const d of [-1, 1]) {
    X.beginPath(); X.ellipse(d * 15, -294, 10, 8, 0, 0, 6.283); X.fillStyle = P.paper; X.fill(); X.lineWidth = 1.4; X.strokeStyle = P.ink; X.stroke();
    X.beginPath(); X.arc(d * 15 + 3, -293, 3.6, 0, 6.283); X.fillStyle = P.ink; X.fill(); X.beginPath(); X.arc(d * 15 + 1.5, -295, 1.2, 0, 6.283); X.fillStyle = P.paper; X.fill();
    ink([[d * 15 - 9, -287], [d * 15, -284], [d * 15 + 9, -287]], 1, 780 + d, 0.3);
    stip(blobPts(d * 26, -272, 10, 9, 790 + d, 12), 791 + d, 0.08, 1.2); ink(blobPts(d * 26, -272, 10, 9, 790 + d, 12).concat([blobPts(d * 26, -272, 10, 9, 790 + d, 12)[0]]), 0.9, 792 + d, 0.4);
  }
  wet(blobPts(3, -280, 7, 9, 795, 10), 795, { dens: 0.03, lw: 1.1 });
  const mo = o.mouth || 0; X.beginPath(); X.ellipse(0, -258, 11, 2 + mo * 7, 0, 0, 6.283); X.fillStyle = P.ink; X.fill();
  if (c > 0.97) { const sp = []; for (let i = 0; i < 18; i++) { const a = Math.PI + i / 17 * Math.PI, r = i % 2 ? 22 : 34 + hash(799, i) * 8; sp.push([Math.cos(a) * r, -334 + Math.sin(a) * r * 0.8]); } shape(sp, { fill: P.ink, lw: 1, id: 799 }); for (let i = 0; i < 8; i++) { X.fillStyle = P.paper; X.fillRect(-20 + hash(798, i) * 40, -350 + hash(797, i) * 14, 2, 2); } }
  X.restore();
}
function devicesBody(o) {
  const dv = o.dev || 0; if (dv <= 0) return;
  // four bladders of cinnabar under the cloak
  const sq = o.sq || 0;
  for (let i = 0; i < 4; i++) { const bx = -24 + i * 16, by = -152 - (i % 2) * 6, r = 8 * (1 - 0.75 * (i === 3 ? sq : 0)) * clamp(dv * 3); X.beginPath(); X.ellipse(bx, by, r, r * 1.2, 0, 0, 6.283); X.fillStyle = P.red; X.fill(); X.lineWidth = 1.2; X.strokeStyle = P.ink; X.stroke(); }
  if ((o.bleed || 0) > 0 && (o.bleed || 0) < 1) { const ra = o.ra || [1.85, 1.62], [, , hx, hy] = armEnd(30, ra); X.save(); X.setLineDash([6, 4]); X.lineDashOffset = -GT * 60; ink([[24, -152], [40, -180], [(30 + hx) / 2 + 10, (-214 + hy) / 2], [hx, hy]], 2.6, 810, 0.3, P.red); X.restore(); }
  if (dv >= 2) { const b = o.bel || 0, h = 34 * (1 - 0.6 * b), top = -196 - h / 2;
    shape(R(-20, top - 4, 40, 4), { lw: 1.2, id: 820, h: [0, 1.6, 0.6] }); shape(R(-20, top + h, 40, 4), { lw: 1.2, id: 821, h: [0, 1.6, 0.6] });
    const z = []; for (let i = 0; i <= 6; i++) z.push([i % 2 ? -24 : -18, top + i * h / 6]); ink(z, 1.2, 822, 0.2); ink(z.map(([a, bb]) => [-a, bb]), 1.2, 823, 0.2);
    for (let i = 1; i < 6; i++) line([i % 2 ? -24 : -18, top + i * h / 6], [i % 2 ? 24 : 18, top + i * h / 6], 0.6, 824 + i, 0.2);
    ink([[0, top - 4], [0, -236]], 2, 830, 0.2);
    if (b > 0.05 && b < 0.95) for (let i = 0; i < 4; i++) { const u = ((GT * 2 + i / 4) % 1); X.fillStyle = P.ink; X.fillRect(-1.5, top - 4 - u * 32, 3, 3); }
  }
}
function devicesHead(o) {
  if ((o.dev || 0) < 3) return;
  X.save(); X.translate(0, -286); X.rotate((o.tilt || 0) * (o.f || 1)); X.translate(0, 286);
  const lv = 1 - (o.tear || 0);
  for (const d of [-1, 1]) { const tx = d * 40; shape(R(tx - 4, -322, 8, 30), { fill: 'rgba(235,227,207,.6)', lw: 1.2, id: 840 + d });
    X.save(); path(R(tx - 3, -321 + 28 * (1 - lv), 6, 28 * lv)); X.clip(); hatch(0.3, 2, 0.8, [tx - 4, -322, tx + 4, -292]); X.restore();
    ink([[tx, -292], [tx - d * 8, -290], [d * 22, -294]], 0.9, 845 + d, 0.2); }
  X.restore();
}
function ferrix(x, y, s, o = {}) {
  const f = o.f || 1;
  robot(x, y, s, 500, { ...o, plain: true, inner: INSIDE ? () => devicesBody(o) : null,
    head: (hx, hy, hs) => bellHead(hx, hy, hs, 580, { f, tilt: o.tilt || 0, mouth: o.mouth || 0, look: o.look || 0, closed: o.closed }) });
  X.save(); X.translate(x, y); X.scale(s * f, s);
  if (INSIDE) devicesHead(o);
  clayHull(o);
  if (!INSIDE && (o.cry || 0) > 0 && (o.cry || 0) < 1) for (const d of [-1, 1]) for (let k = 0; k < 4; k++) { const u = (o.cry * 3 + k / 4) % 1; X.save(); X.translate(0, -286); X.rotate((o.tilt || 0) * f); X.beginPath(); X.ellipse(d * 15, -2 + u * 90, 2.4, 4, 0, 0, 6.283); X.fillStyle = P.paper; X.fill(); X.lineWidth = 1; X.strokeStyle = P.ink; X.stroke(); X.restore(); }
  X.restore();
}

/* ================= the others ================= */
function king(x, y, s, sh, lt, o = {}) { const e = sayAt(sh, 'A', lt); robot(x, y, s, 900, { robe: true, stern: true, mouth: e, f: o.f, ra: talking(sh, 'A', lt) ? [0.3 - e * 0.3, -0.4 - e * 0.5] : [1.4, 1.6], la: [1.2, 1.5], look: o.look, tilt: o.tilt }); crown(x, y - (286 + 44) * s, 1.0 * s, 950); }
function polyphase(x, y, s, sh, lt, o = {}) {
  const e = sayAt(sh, 'P', lt), sp = talking(sh, 'P', lt), f = o.f || 1;
  const belly = o.portly ? () => {
    const pts = blobPts(10, -150, 60, 70, 960, 20, 0.05);
    if (!INSIDE) { shape(pts, { lw: 2, id: 960, h: [[1.7, 5, 0.5]], sh: [[20, -230], [80, -230], [80, -70], [20, -70]], sh2: [1.62, 2.4, 0.7] }); for (let i = 0; i < 4; i++) ink([[-30 + i * 22, -90], [-24 + i * 20, -150], [-18 + i * 14, -205]], 0.9, 961 + i, 0.8); }
    else { dashed(pts, 1); for (let i = 0; i < 5; i++) { const by = -100 - i * 22; shape(R(-38 + (i % 2) * 6, by - 20, 84 - (i % 3) * 8, 20), { lw: 1.4, id: 965 + i, h: [0, 2.4, 0.6] }); line([-30 + (i % 2) * 6, by - 10], [-6, by - 10], 1, 970 + i, 0.1); }
      if (o.book > 0) { const u = o.book, pg = (GT * 0.45) % 1; X.save(); X.translate(10, -196); shape([[-46, 0], [0, 6], [0, -60], [-46, -66]], { lw: 1.4, id: 975 }); shape([[46, 0], [0, 6], [0, -60], [46, -66]], { lw: 1.4, id: 976 });
        const tx = lerp(46, -46, E.io(pg)); shape([[tx, 0], [0, 6], [0, -60], [tx, -66]], { lw: 1, id: 977 });
        if (o.vign) { X.save(); X.translate(-23, -30); X.scale(0.22 * f, 0.22); o.vign(); X.restore(); }
        X.restore(); void u; } }
  } : null;
  robot(x, y, s, 1000, { robe: true, glasses: true, hair: false, f, mouth: e, look: o.look, tilt: o.tilt || 0, belly, closed: o.closed,
    ra: o.ra || (sp ? [0.1 - e * 0.3, -0.5 - e * 0.5] : [1.4, 1.6]), la: o.la || [1.2, 1.5], held: o.held });
  const hy = y - 286 * s, d = f; for (let i = 0; i < 7; i++) { const sx = x + d * (-14 + i * 5) * s, p = []; for (let j = 0; j <= 8; j++) { const u = j / 8; p.push([sx + Math.sin(u * 4 + i) * 3 * s, hy + (34 + u * (60 + hash(1090, i) * 30)) * s]); } coil(p, 3 * s); }
}
function wedgeHead(x, y, s, id, o = {}) {
  X.save(); X.translate(x, y); X.rotate(o.tilt || 0); X.scale(s * (o.f || 1), s);
  shape([[-22, -56], [22, -56], [30, -6], [0, 44], [-30, -6]], { lw: 2, id, sh: [[6, -60], [40, -60], [40, 50], [6, 50]], sh2: [1.6, 2.4, 0.7] });
  shape([[-18, -14], [-6, -10], [-18, -8]], { fill: P.ink, lw: 0.6, id: id + 1 }); X.beginPath(); X.arc(12, -11, 8, 0, 6.283); X.lineWidth = 1.6; X.strokeStyle = P.ink; X.stroke(); X.fillStyle = P.ink; X.fillRect(10, -13, 4, 4); line([20, -11], [26, 30], 0.8, id + 2, 0.2);
  const mo = o.mouth || 0; shape([[-10, 18], [10, 16], [6, 20 + mo * 6], [-8, 22 + mo * 6]], { fill: P.ink, lw: 0.8, id: id + 3 });
  X.restore();
}
function cyberhazy(x, y, s, sh, lt, o = {}) { const e = sayAt(sh, 'Y', lt), sp = talking(sh, 'Y', lt); robot(x, y, s, 1100, { robe: true, f: o.f, ra: sp ? [0.0 - e * 0.2, -0.3] : [0.9, 0.2], la: [1.2, 1.5], walk: o.walk, ph: o.ph, head: (hx, hy, hs) => wedgeHead(hx, hy, hs, 1180, { f: o.f, mouth: e }), held: o.held }); }

/* Crystal: a gown of facets and a head cut like a gem */
function crystal(x, y, s, sh, lt, o = {}) {
  if (SILENT) return;
  const e = sayAt(sh, 'C', lt), f = o.f || 1;
  X.save(); X.translate(x, y); X.scale(s * f, s);
  const ra = o.ra || [1.75, 1.6], la = o.la || [1.35, 1.55];
  const arm = (sx, a, id) => { const ex = sx + Math.cos(a[0]) * 54, ey = -198 + Math.sin(a[0]) * 54, hx = ex + Math.cos(a[1]) * 50, hy = ey + Math.sin(a[1]) * 50; cap(sx, -198, ex, ey, 9, id); cap(ex, ey, hx, hy, 8, id + 1); shape([[hx - 5, hy - 5], [hx + 5, hy - 5], [hx + 7, hy + 6], [hx, hy + 11], [hx - 7, hy + 6]], { lw: 1.2, id: id + 2 }); return [hx, hy]; };
  arm(-18, la, 1210);
  const gown = [[-20, -206], [20, -206], [30, -150], [78, 0], [-78, 0], [-30, -150]];
  shape(gown, { lw: 2, id: 1200, sh: [[10, -210], [90, -210], [90, 4], [10, 4]], sh2: [1.5, 2.6, 0.7] });
  for (let i = -3; i <= 3; i++) line([i * 5, -206], [i * 24, 0], 0.9, 1201 + i, 0.2);
  for (const yy of [-150, -96, -46]) line([-30 - (yy + 150) * 0.33, yy], [30 + (yy + 150) * 0.33, yy], 0.7, 1209 + yy, 0.2);
  cap(0, -206, 0, -226, 8, 1215);
  const [hx, hy] = arm(18, ra, 1220); if (o.held) o.held(hx, hy, ra[1]);
  X.translate(0, -258); X.rotate((o.tilt || 0));
  const hd = [[0, -40], [24, -26], [28, 6], [0, 34], [-28, 6], [-24, -26]];
  shape(hd, { lw: 2, id: 1230, sh: [[0, -44], [32, -44], [32, 38], [0, 38]], sh2: [1.1, 2.4, 0.7] });
  for (const p of hd) line([0, -4], p, 0.7, 1231 + p[0], 0.1);
  for (const d of [-1, 1]) shape([[d * 11, -9], [d * 15, -5], [d * 11, -1], [d * 7, -5]], { fill: P.ink, lw: 0.6, id: 1240 + d });
  shape([[-8, 15], [8, 15], [6, 17 + e * 7], [-6, 17 + e * 7]], { fill: P.ink, lw: 0.6, id: 1245 });
  for (let i = 0; i < 14; i++) { const a = i / 14 * 6.283 + 0.2, r0 = 44, r1 = 52 + 22 * hash(i, BOIL + 3) * (o.glow ?? 1); if (hash(i + 30, BOIL) < 0.65) line([Math.cos(a) * r0, Math.sin(a) * r0], [Math.cos(a) * r1, Math.sin(a) * r1], 1.2, 1250 + i, 0.1); }
  X.restore();
}

/* The paleface: soft, pale, hairy, wet */
function paleface(x, y, s, id, o = {}) {
  if (SILENT) return;
  X.save(); X.translate(x, y); X.scale(s * (o.f || 1), s);
  const sp = o.splat || 0;
  if (sp > 0) { const pu = blobPts(0, -4, 70 + 90 * sp, 10 + 8 * sp, id + 90, 22, 0.25); wet(pu, id + 90, { dens: 0.03 });
    for (let i = 0; i < 18; i++) { const a = -Math.PI * (0.1 + 0.8 * hash(id + 91, i)), r = sp * (80 + 260 * hash(id + 92, i)), gy = 400 * sp * sp; const dx = Math.cos(a) * r * 1.4, dy = Math.min(0, Math.sin(a) * r * 1.2 + gy); X.beginPath(); X.ellipse(dx, dy - 6, 5 + 4 * hash(id, i), 4, 0, 0, 6.283); X.fillStyle = P.paper; X.fill(); X.lineWidth = 1; X.strokeStyle = P.ink; X.stroke(); }
    if (sp >= 0.999) { X.restore(); return; } X.scale(1 + sp * 0.8, Math.max(0.02, 1 - sp)); }
  X.rotate(o.lean || 0);
  const bob = Math.sin((o.ph || 0)) * 4, mo = o.mouth || 0, wob = (o.wob || 0);
  const W_ = (i) => Math.sin(GT * 6 + i) * 3 * (1 + wob);
  if (INSIDE && o.stuffed) {
    dashed(blobPts(0, -150, 58, 82, id + 3, 20, 0.1, 0.4), 1.2); dashed(blobPts(0, -262, 40, 44, id + 6, 16, 0.1), 1.2);
    line([0, 0], [0, -300], 5, id + 80, 0.1); line([-60, -180], [60, -180], 4, id + 81, 0.1);
    for (let i = 0; i < 70; i++) { const a = hash(id + 82, i) * 6.283, r = hash(id + 83, i), cx = Math.cos(a) * 50 * r, cy = -150 + Math.sin(a) * 74 * r; line([cx, cy], [cx + Math.cos(a + i) * 12, cy + Math.sin(a + i) * 12], 0.8, id + 84 + i, 0.2); }
    for (let i = 0; i < 30; i++) { const a = hash(id + 85, i) * 6.283, r = hash(id + 86, i), cx = Math.cos(a) * 34 * r, cy = -262 + Math.sin(a) * 38 * r; line([cx, cy], [cx + Math.cos(a + i) * 9, cy + Math.sin(a + i) * 9], 0.8, id + 87 + i, 0.2); }
    X.restore(); return;
  }
  for (const d of [-1, 1]) { const lp = Math.sin((o.ph || 0) + (d > 0 ? 0 : Math.PI)) * 10 * (o.walk || 0); wet(blobPts(d * 22 + lp * 0.5, -54, 21, 58, id + 10 + d, 14, 0.12, 0.2), id + 10 + d, { dens: 0.008, h: [0.3, 5, 0.35] }); wet(blobPts(d * 26 + lp, -6, 26, 9, id + 13 + d, 12, 0.15), id + 13 + d, { dens: 0.01 }); }
  // back arm
  wet(blobPts(-56, -150 + bob, 15, 56, id + 20, 14, 0.12, 0.4, 0.15 + Math.sin(GT * 2) * 0.05), id + 20, { dens: 0.008 });
  const body = blobPts(W_(1) * 0.3, -150 + bob, 58, 82, id + 3, 22, 0.1, 0.5);
  wet(body, id + 3, { dens: 0.008, h: [0.35, 5, 0.35] });
  for (let i = 0; i < 46; i++) { const hx = -32 + hash(id + 30, i) * 64, hy = -210 + hash(id + 31, i) * 70 + bob, a = hash(id + 32, i) * 6.283; ink([[hx, hy], [hx + Math.cos(a) * 5, hy + Math.sin(a) * 5], [hx + Math.cos(a + 1) * 8, hy + Math.sin(a + 1) * 7]], 0.8, id + 33 + i, 0.3); }
  if (o.stuffed) { X.save(); X.setLineDash([3, 4]); ink([[0, -230], [4, -150], [0, -72]], 1.2, id + 40, 0.4); X.restore(); for (let i = 0; i < 8; i++) line([-5, -224 + i * 20], [5, -220 + i * 20], 1, id + 41 + i, 0.1); }
  // head
  const hy = -262 + bob;
  wet(blobPts(W_(2) * 0.4, hy, 40, 44, id + 6, 18, 0.1, 0.3), id + 6, { dens: 0.01, h: [0.35, 5, 0.35] });
  for (let i = 0; i < 40; i++) { const a = Math.PI * (1.1 + 0.8 * hash(id + 50, i)), r = 36 + hash(id + 51, i) * 8; const hx = Math.cos(a) * r, hh = hy + Math.sin(a) * r * 1.05; ink([[hx, hh], [hx + Math.cos(a) * 8 + Math.sin(GT * 3 + i) * 2, hh + Math.sin(a) * 10]], 0.9, id + 52 + i, 0.3); }
  for (const d of [-1, 1]) { X.beginPath(); X.ellipse(d * 14, hy - 6, 11, 9, 0, 0, 6.283); X.fillStyle = P.paper; X.fill(); X.lineWidth = 1.3; X.strokeStyle = P.ink; X.stroke();
    if (o.stuffed) { X.beginPath(); X.arc(d * 14, hy - 6, 5, 0, 6.283); X.fillStyle = P.ink; X.fill(); for (const [a, b] of [[-2, -2], [2, 2]]) { X.fillStyle = P.paper; X.fillRect(d * 14 + a - 0.6, hy - 6 + b - 0.6, 1.4, 1.4); } }
    else { X.beginPath(); X.arc(d * 14 + 2 * (o.look || 0), hy - 5, 4, 0, 6.283); X.fillStyle = P.ink; X.fill(); ink([[d * 14 - 8, hy + 3], [d * 14, hy + 6], [d * 14 + 8, hy + 3]], 1, id + 60 + d, 0.4); const dr = ((GT * 0.7 + d * 0.3) % 1); X.beginPath(); X.ellipse(d * 16, hy + 6 + dr * 26, 2, 3, 0, 0, 6.283); X.fillStyle = P.paper; X.fill(); X.lineWidth = 0.8; X.stroke(); } }
  wet(blobPts(3, hy + 10, 9, 11, id + 63, 10, 0.15), id + 63, { dens: 0.03, lw: 1.1 });
  if (o.stuffed) { line([-12, hy + 28], [12, hy + 28], 1.4, id + 64, 0.2); for (let i = 0; i < 5; i++) line([-10 + i * 5, hy + 25], [-9 + i * 5, hy + 31], 0.8, id + 65 + i, 0.1); }
  else { X.beginPath(); X.ellipse(0, hy + 28, 13, 3 + mo * 10, 0, 0, 6.283); X.fillStyle = P.ink; X.fill();
    const tg = Math.max(mo, o.tongue || 0); if (tg > 0.15) { const p = []; for (let j = 0; j <= 10; j++) { const u = j / 10; p.push([u * 26 * tg, hy + 28 + u * 14 * tg + Math.sin(u * 8 + GT * 12) * 5 * u]); } X.beginPath(); p.forEach(([a, b], i) => (i ? X.lineTo(a, b) : X.moveTo(a, b))); X.lineCap = 'round'; X.lineWidth = 8; X.strokeStyle = P.ink; X.stroke(); X.lineWidth = 5; X.strokeStyle = P.rose; X.stroke(); X.lineCap = 'butt'; } }
  // front arm, maybe with a sword
  const fa = o.arm ?? 0.1, ax = 50 + Math.cos(fa) * 0, ay = -190 + bob;
  const ex = ax + Math.cos(Math.PI / 2 - fa) * 56, ey = ay + Math.sin(Math.PI / 2 - fa) * 56;
  wet(blobPts((ax + ex) / 2, (ay + ey) / 2, 15, 36, id + 70, 14, 0.12, 0.2, -fa), id + 70, { dens: 0.008 });
  wet(blobPts(ex, ey, 11, 10, id + 71, 10, 0.2), id + 71, { dens: 0.02, lw: 1.1 });
  if (o.sword) { const a = Math.PI / 2 - fa - 0.9, L_ = 150 * (o.broken ? 0.25 : 1); line([ex, ey], [ex + Math.cos(a) * L_, ey + Math.sin(a) * L_], 4, id + 72, 0.1); line([ex + Math.cos(a + 1.57) * 14, ey + Math.sin(a + 1.57) * 14], [ex - Math.cos(a + 1.57) * 14, ey - Math.sin(a + 1.57) * 14], 3, id + 73, 0.1); }
  X.restore();
}

/* small engraved pictures of paleface life, for the answers */
function vign(kind, lt) {
  const pf = (x, y, s, o = {}) => paleface(x, y, s, 1500 + (x | 0), o);
  X.save(); X.beginPath(); X.ellipse(0, 0, 150, 110, 0, 0, 6.283); X.fillStyle = P.paper; X.fill(); X.clip();
  hatch(0.1, 6, 0.4, [-160, -120, 160, 120]);
  if (kind === 'water') { pf(0, 100, 0.55, { arm: 2.6 }); shape([[18, -100], [44, -98], [40, -76], [22, -78]], { lw: 1.2, id: 1601, h: [0.3, 2.4, 0.6] }); for (let i = 0; i < 8; i++) { const u = (lt * 1.5 + i / 8) % 1; line([20 + i * 2, -76 + u * 60], [18 + i * 2, -70 + u * 60], 1, 1602 + i, 0.1); } }
  if (kind === 'weep') { pf(-50, 100, 0.5, { look: 0 }); pf(60, 100, 0.5, { wob: 1 }); }
  if (kind === 'laugh') { pf(-40, 100, 0.5, { arm: 2.6, wob: 3, mouth: 0.8 }); pf(60, 100, 0.5, { arm: 2.4, wob: 3, mouth: 0.6, f: -1 }); for (let i = 0; i < 6; i++) line([-110 + i * 40, -70 + (i % 2) * 10], [-100 + i * 40, -80 + (i % 2) * 10], 1, 1610 + i, 0.2); }
  if (kind === 'beast' || kind === 'eat') {
    const beast = (bx, by, s2) => { X.save(); X.translate(bx, by); X.scale(s2, s2); for (const lx of [-34, -18, 18, 34]) wet(blobPts(lx, -16, 7, 18, 1620 + lx, 10, 0.1), 1620 + lx, { dens: 0.01, lw: 1 }); wet(blobPts(0, -46, 52, 26, 1625, 16, 0.08), 1625, { dens: 0.008 }); wet(blobPts(54, -60, 18, 14, 1626, 12, 0.1), 1626, { dens: 0.01 }); X.beginPath(); X.arc(58, -64, 2.6, 0, 6.283); X.fillStyle = P.ink; X.fill(); X.restore(); };
    if (kind === 'beast') { beast(-10, 70, 1.3); pf(-110, 110, 0.45, { arm: 1.2, sword: true }); }
    else { shape(R(-130, 40, 260, 12), { lw: 1.4, id: 1630, h: [0, 2.4, 0.6] }); X.beginPath(); X.ellipse(30, 36, 60, 10, 0, 0, 6.283); X.fillStyle = P.paper; X.fill(); X.lineWidth = 1.4; X.strokeStyle = P.ink; X.stroke(); beast(30, 40, 0.55); pf(-80, 110, 0.5, { mouth: 0.7 + 0.3 * Math.sin(lt * 6), arm: 1.4 }); }
  }
  if (kind === 'chain') { for (let i = 0; i < 3; i++) { const a = i / 3 * 6.283 + lt * 0.4; X.save(); X.translate(Math.cos(a) * 70, Math.sin(a) * 50 + 30); X.rotate(a + Math.PI / 2); wet(blobPts(0, 0, 36, 18, 1640 + i, 16, 0.1), 1640 + i, { dens: 0.01 }); X.beginPath(); X.ellipse(30, 0, 8, 6, 0, 0, 6.283); X.fillStyle = P.ink; X.fill(); X.restore(); } }
  X.restore();
  X.beginPath(); X.ellipse(0, 0, 150, 110, 0, 0, 6.283); X.lineWidth = 3; X.strokeStyle = P.ink; X.stroke(); X.beginPath(); X.ellipse(0, 0, 158, 118, 0, 0, 6.283); X.lineWidth = 1; X.stroke();
}

/* ================= rooms ================= */
function hall() {
  darkWall(-400, -300, 1800, 1400, 3);
  for (const ax of [60, 1100]) shape(R(ax, -100, 110, 760), { lw: 2, id: 2000 + ax, h: [1.57, 3, 0.5], sh: R(ax + 60, -100, 50, 760), sh2: [1.57, 1.6, 0.8] });
  shape([[-400, 640], [1800, 640], [1800, 1000], [-400, 1000]], { lw: 1.6, id: 2010, h: [0.03, 5, 0.5] });
}
function tapestry(lt) {
  shape(R(190, 70, 900, 190), { lw: 2.4, id: 2020, h: [0.02, 7, 0.3] }); ink([[200, 80], [1080, 80], [1080, 250], [200, 250], [200, 80]], 0.8, 2021, 0.3);
  X.save(); path(R(196, 76, 888, 178)); X.clip();
  for (let i = 0; i < 6; i++) { const wy = 200 + Math.sin(i + lt) * 3; ink([[200, wy + i * 8], [400, wy + i * 8 + 4]], 1, 2022 + i, 0.6); }
  for (let i = 0; i < 6; i++) wet(blobPts(240 + i * 26, 200 - (i % 2) * 8, 12, 6, 2030 + i, 10, 0.25), 2030 + i, { dens: 0.04, lw: 1 });
  for (let i = 0; i < 3; i++) { X.save(); X.translate(470 + i * 60, 240); X.scale(0.3, 0.3); paleface(0, 0, 1 - i * 0.08, 2040 + i * 100, { lean: 0.6 - i * 0.3 }); X.restore(); }
  X.save(); X.translate(720, 244); X.scale(0.34, 0.34); paleface(0, 0, 1, 2400, { arm: 1.4 }); X.restore(); shape(R(770, 160, 60, 80), { lw: 1.4, id: 2410, h: [0.8, 3, 0.6] }); for (let i = 0; i < 3; i++) ball(785 + i * 16, 180, 6, 2411 + i, PAT.f, 1);
  X.save(); X.translate(960, 246); X.scale(0.5, 0.5); robot(0, 0, 0.6, 2500, { ra: [-0.6, -0.9] }); X.restore();
  X.restore();
}
function palaceHeads(lt) {
  X.fillStyle = P.paper; X.fillRect(-400, -300, 2200, 1400); hatchSky(-300, 420);
  shape([[-400, 470], [300, 430], [640, 380], [1000, 430], [1700, 470], [1700, 1000], [-400, 1000]], { lw: 2, id: 2600, h: [0.25, 4, 0.5] });
  castle(640, 390, 1.4, 2610, { t: lt });
  for (let h = 0; h < 2; h++) { const cx = h ? 1000 : 290; for (let i = 0; i < 46; i++) { const row = Math.floor(Math.sqrt(i * 2)), x = cx + (hash(2620 + h, i) - 0.5) * (220 - row * 26), y = 600 - row * 22 - hash(2621, i) * 6; X.save(); X.translate(x, y); X.rotate((hash(2622, i) - 0.5) * 1.6); i % 3 ? boxHead(0, 0, 0.35, 2630 + i * 3, { hair: i % 5 === 0, closed: true }) : bellHead(0, 0, 0.36, 2700 + i * 3, { closed: true }); X.restore(); } }
}
function railings(lt, cx) {
  X.fillStyle = P.paper; X.fillRect(-400, -300, 2200, 1400); hatchSky(-300, 560);
  for (let i = 0; i < 9; i++) tower(160 + i * 130, 560, 40 + hash(2800, i) * 30, 120 + hash(2801, i) * 200, 2810 + i * 10, { t: lt, crenel: i % 3 === 1 });
  shape([[-400, 560], [1700, 560], [1700, 1000], [-400, 1000]], { lw: 1.6, id: 2900, h: [0.04, 4, 0.5] });
  line([-100, 560], [1500, 560], 3, 2901, 0.2); line([-100, 520], [1500, 520], 2.4, 2902, 0.2);
  for (let i = 0; i < 46; i++) { const x = -60 + i * 34; line([x, 566], [x, 500], 3, 2910 + i, 0.15); shape([[x - 5, 500], [x, 488], [x + 5, 500]], { fill: P.ink, lw: 0.6, id: 2960 + i }); const d = Math.abs(x - cx); if (d < 110 && hash(i, BOIL) < 0.8) star(x, 494, 10 + 18 * (1 - d / 110) * hash(i + 3, BOIL), 3000 + i * 7 + BOIL % 5, P.ink, 6); }
}
function labRoom(lt, mirror = 0) {
  darkWall(-400, -300, 1800, 1400, 3);
  for (const sy of [190, 330]) { shape(R(-60, sy, 420, 14), { lw: 1.6, id: 3100 + sy, h: [0, 2.4, 0.6] }); for (let i = 0; i < 7; i++) { const fx = -30 + i * 56, h = 40 + hash(3110 + sy, i) * 40; ball(fx, sy - h * 0.4, 16 + hash(3120, i) * 6, 3130 + i + sy, i % 2 ? PAT.f : PAT.m, 1.3); line([fx, sy - h * 0.4 - 18], [fx, sy - h], 3, 3140 + i + sy, 0.1); } }
  shape([[90, 520], [290, 520], [270, 660], [110, 660]], { lw: 2.2, id: 3200, h: [1.57, 3, 0.6] }); X.beginPath(); X.ellipse(190, 520, 100, 18, 0, 0, 6.283); X.fillStyle = P.paper; X.fill(); X.lineWidth = 2; X.strokeStyle = P.ink; X.stroke();
  for (let i = 0; i < 6; i++) { const u = (lt * 0.6 + hash(3210, i)) % 1; X.beginPath(); X.arc(130 + hash(3211, i) * 120, 516 - u * 40, 3 + 6 * u, 0, 6.283); X.lineWidth = 1; X.stroke(); }
  for (let i = 0; i < 5; i++) ink([[130 + i * 30, 534], [134 + i * 30, 556 + hash(3220, i) * 30]], 2.2, 3221 + i, 0.6);
  shape([[-400, 660], [1800, 660], [1800, 1000], [-400, 1000]], { lw: 1.6, id: 3300, h: [0.03, 5, 0.5] });
  shape(R(1080, 470, 240, 16), { lw: 1.6, id: 3310, h: [0, 2.4, 0.6] }); line([1100, 486], [1100, 660], 4, 3311, 0.1); line([1300, 486], [1300, 660], 4, 3312, 0.1);
  for (let i = 0; i < 3; i++) shape(R(1100 + i * 50, 434 - i * 8, 40, 36 + i * 8), { lw: 1.2, id: 3320 + i, h: [0, 2.6, 0.5] });
  if (mirror > 0) { const mx_ = 960, my = 380; line([mx_, my + 140], [mx_, 660], 5, 3330, 0.1); line([mx_ - 50, 660], [mx_ + 50, 660], 4, 3331, 0.1);
    X.save(); X.beginPath(); X.ellipse(mx_, my, 90, 140, 0, 0, 6.283); X.fillStyle = '#d9d0b8'; X.fill(); X.restore(); }
}
function mirrorFrame() { const mx_ = 960, my = 380; X.beginPath(); X.ellipse(mx_, my, 90, 140, 0, 0, 6.283); X.lineWidth = 6; X.strokeStyle = P.ink; X.stroke(); X.beginPath(); X.ellipse(mx_, my, 98, 148, 0, 0, 6.283); X.lineWidth = 1.5; X.stroke(); for (let i = 0; i < 3; i++) { X.save(); X.globalAlpha = 0.5; line([mx_ - 50 + i * 16, my - 90], [mx_ - 70 + i * 16, my - 40], 1, 3340 + i, 0.1); X.restore(); } }
function crystalHall(lt) {
  X.fillStyle = P.paper; X.fillRect(-400, -300, 2200, 1400);
  for (let y = -300; y < 660; y += 5) { X.fillStyle = P.ink; X.fillRect(-400, y, 2200, 0.5); }
  for (const [px, w] of [[-40, 120], [190, 70], [1090, 70], [1300, 120]]) { shape([[px - w / 2, 660], [px - w / 2, -100], [px, -160], [px + w / 2, -100], [px + w / 2, 660]], { lw: 2, id: 3400 + px, sh: [[px, -170], [px + w, -170], [px + w, 670], [px, 670]], sh2: [1.57, 2.2, 0.7] }); for (let i = 0; i < 6; i++) line([px - w / 2, 80 + i * 100], [px + w / 2, 40 + i * 100], 0.8, 3410 + px + i, 0.2); }
  for (let i = 0; i < 4; i++) { const sx = 350 + i * 200; shape([[sx, 80], [sx + 130, 80], [sx + 130, 420], [sx, 420]], { lw: 1.4, id: 3430 + i, fill: '#e3dac2' }); line([sx + 20, 120], [sx + 60, 380], 0.8, 3440 + i, 0.1); }
  for (let i = 0; i < 9; i++) { const a = i / 9 * 6.283 + lt * 0.1; star(640 + Math.cos(a) * 110, 30 + Math.sin(a) * 24, 10 + 6 * hash(i, BOIL >> 1), 3450 + i * 9, P.ink, 6); } line([640, -300], [640, 10], 1.4, 3460, 0.1);
  shape([[-400, 660], [1800, 660], [1800, 1000], [-400, 1000]], { lw: 1.6, id: 3470, fill: P.paper });
  for (let i = -8; i <= 8; i++) line([640 + i * 60, 662], [640 + i * 180, 1000], 0.8, 3480 + i, 0.2); for (const y of [700, 760, 840]) line([-400, y], [1800, y], 0.8, 3500 + y, 0.2);
}
function cage(x, y, o = {}) { const w = 210, h = 400, door = o.door || 0;
  for (let i = 0; i <= 7; i++) { const bx = x - w / 2 + i * w / 7; if (door > 0 && i >= 5) continue; line([bx, y - h], [bx, y], 3.2, 3600 + i, 0.1); }
  if (door > 0) { const hx = x + w / 2 - 2 * w / 7, ang = door * 1.3; for (let i = 1; i <= 2; i++) { const bx = hx + Math.cos(ang) * i * w / 7; line([bx, y - h + Math.sin(ang) * i * 8], [bx, y + Math.sin(ang) * i * 8], 3.2, 3610 + i, 0.1); } }
  shape(R(x - w / 2 - 8, y - h - 14, w + 16, 14), { lw: 1.6, id: 3620, h: [0, 2.4, 0.6] }); shape(R(x - w / 2 - 8, y, w + 16, 14), { lw: 1.6, id: 3621, h: [0, 2.4, 0.6] });
  ball(x, y - h - 30, 12, 3622, PAT.f, 1.6); line([x, y - h - 18], [x, y - h - 14], 3, 3623, 0.1); }
function square(lt) {
  X.fillStyle = P.paper; X.fillRect(-400, -300, 2200, 1400); hatchSky(-300, 470);
  for (let i = 0; i < 11; i++) tower(-80 + i * 150, 470, 70 + hash(3700, i) * 40, 110 + hash(3701, i) * 160, 3710 + i * 10, { t: lt, roof: 0.8, flag: i % 2 === 0 });
  shape([[-400, 470], [1800, 470], [1800, 1000], [-400, 1000]], { lw: 1.6, id: 3800, h: [0.03, 5, 0.5] });
  for (let i = 0; i < 26; i++) { const x = -60 + hash(3810, i) * 1400, y = 520 + hash(3811, i) * 50; figure({ x, y, s: 0.5 + (y - 520) / 300, f: x < 640 ? 1 : -1, id: 3820 + i * 20, dark: i % 3 === 0, hood: i % 4 === 1, ang: Math.sin(lt * 2 + i) * 0.04, hf: i % 5 === 0 ? [34, -240] : undefined }); }
  shape(R(470, 664, 340, 24), { lw: 1.8, id: 3900, h: [0, 2.4, 0.6] }); for (const wx of [500, 780]) { X.beginPath(); X.arc(wx, 696, 22, 0, 6.283); X.fillStyle = P.paper; X.fill(); X.lineWidth = 2.4; X.strokeStyle = P.ink; X.stroke(); for (let k = 0; k < 6; k++) line([wx, 696], [wx + Math.cos(k) * 22, 696 + Math.sin(k) * 22], 1, 3910 + k, 0.1); }
}
function courtyard(lt, crowdK = 1) {
  X.fillStyle = P.paper; X.fillRect(-400, -300, 2200, 1400); hatchSky(-300, 330);
  shape(R(-400, 250, 2200, 260), { lw: 2, id: 4000, h: [1.57, 3, 0.5] }); for (let i = 0; i < 40; i++) shape(R(-400 + i * 56, 230, 30, 22), { lw: 1, id: 4010 + i, h: [1.57, 3, 0.5] });
  for (let i = 0; i < 4; i++) tower(-60 + i * 460, 510, 110, 380, 4100 + i * 10, { t: lt, crenel: true });
  for (let i = 0; i < 60; i++) { const x = -300 + i * 32 + hash(4200, i) * 10, j = Math.sin(lt * 9 + i) * 2 * crowdK; tinyMicro(x, 232 + j, 1.4, 4210 + i); }
  shape([[-400, 510], [1800, 510], [1800, 1000], [-400, 1000]], { lw: 1.6, id: 4300, fill: P.paper }); for (let i = 0; i < 30; i++) { const x = -400 + hash(4301, i) * 2200, y = 520 + hash(4302, i) * 200; line([x, y], [x + 30, y], 0.8, 4303 + i, 0.3); }
  shape([[920, 510], [1300, 510], [1300, 470], [960, 470]], { lw: 1.6, id: 4400, h: [0, 3, 0.5] }); shape([[940, 470], [1300, 470], [1300, 440], [980, 440]], { lw: 1.6, id: 4401, h: [0, 3, 0.5] });
}
function museum(lt) {
  darkWall(-400, -300, 1800, 1400, 3);
  for (const fx of [80, 1040]) { shape(R(fx, 150, 160, 210), { lw: 3, id: 4500 + fx, fill: P.paper }); X.save(); X.translate(fx + 80, 330); X.scale(0.45, 0.45); robot(0, 0, 0.75, 4510 + fx, { robe: true, stern: true }); X.restore(); }
  shape([[-400, 650], [1800, 650], [1800, 1000], [-400, 1000]], { lw: 1.6, id: 4600, h: [0.03, 5, 0.5] });
  shape(R(470, 600, 340, 50), { lw: 2, id: 4610, h: [1.57, 3, 0.5] });
}

/* ================= shots ================= */
const SHOTS = {};
const STAND = 664;
function whispers(sh, lt, from, to) { if (!INSIDE) return; for (const c of cues(sh, 'whisper')) { const u = lt - c.at; if (u < 0 || u > 1.6) continue; const a = 1 - seg(u, 1.1, 1.6); X.save(); X.globalAlpha = a; X.setLineDash([2, 5]); ink([from, [(from[0] + to[0]) / 2, Math.min(from[1], to[1]) - 50], to], 1.4, 5000, 0.3); X.setLineDash([]); txt(c.say, (from[0] + to[0]) / 2, Math.min(from[1], to[1]) - 70, 30, { italic: true }); X.restore(); } }

SHOTS.father = (lt, sd, sh) => {
  const L_ = sh.lines;
  if (lt < L_[1].t0 - 0.3) { const cx = lerp(220, 1000, lt / (L_[1].t0 - 0.3)); cam(camFor(lt, [[0, ON(640, 400, 1.0)], [3, ON(cx, 420, 1.15)]], 4), () => { railings(lt, cx); crystal(cx, 640, 1.05, sh, lt, { ra: [1.6 + Math.sin(lt * 3) * 0.2, 1.5], la: [1.5 - Math.sin(lt * 3) * 0.2, 1.5] }); }); return; }
  if (lt > L_[4].t0 - 0.2 && lt < L_[4].t1 + 0.4) { cam(camFor(lt - L_[4].t0, [[0, ON(640, 420, 1.0)], [0.5, ON(640, 450, 1.12)]], 4), () => palaceHeads(lt)); return; }
  const c = camFor(lt, [[0, ON(640, 380, 1.0)], [L_[1].t0, ON(470, 360, 1.35)], [L_[2].t0 - 0.2, ON(800, 360, 1.45)], [L_[3].t0 - 0.2, ON(300, 170, 2.0)], [L_[3].t0 + 3.4, ON(640, 170, 1.4)], [L_[3].t1 - 2.4, ON(980, 170, 2.0)], [L_[5].t0 - 0.4, ON(800, 380, 1.5)]], 1.6);
  cam(c, () => { hall(); tapestry(lt);
    shape([[340, 664], [340, 380], [380, 340], [540, 340], [580, 380], [580, 664]], { lw: 2.4, id: 2100, h: [1.57, 3.4, 0.5], sh: R(500, 340, 80, 324), sh2: [1.57, 1.6, 0.8] });
    king(450, 664, 1.0, sh, lt, { look: 1 });
    const fe = sayAt(sh, 'F', lt), fs = talking(sh, 'F', lt);
    ferrix(830, STAND, 1.0, { f: -1, mouth: fe, look: 1, ra: fs ? [0.2 - fe * 0.3, -0.3 - fe * 0.6] : [1.85, 1.62] });
  });
};
SHOTS.title = (lt) => { X.fillStyle = P.paper; X.fillRect(0, 0, W, H); const u = seg(lt, 1.6, 3.4); txt('PRINCE FERRIX', CX, 270, 64, {}); txt('AND THE PRINCESS CRYSTAL', CX, 350, 40, {}); txt('after Stanisław Lem, The Cyberiad', CX, 430, 22, { italic: true }); if (u > 0) { line([CX, 360 - 300 * u], [CX, 360 + 300 * u], 2, 5100, 0.3); } };
SHOTS.lab = (lt, sd, sh) => {
  const L_ = sh.lines, sm = cue(sh, 'smear'), ch = cue(sh, 'chalk'), mi = cue(sh, 'mirror'), clay = CV(sh, 'clay', lt), sp = CV(sh, 'split', lt);
  const bl = cue(sh, 'bladder').at, be = cue(sh, 'bellows').at, tu = cue(sh, 'tubes').at;
  const dev = (lt > bl ? 1 : 0) + (lt > be ? 1 : 0) + (lt > tu ? 1 : 0);
  const working = (lt > sm.at && lt < sm.to) || (lt > ch.at && lt < ch.to + 0.3);
  const shake = lt > L_[5].t0 - 1.0 && lt < L_[5].t1 ? 1 : 0.1 * (lt > ch.to ? 1 : 0);
  const facingMirror = lt > mi.at && lt < L_[5].t1 + 0.3;
  const c = camFor(lt, [[0, ON(640, 380, 1.0)], [sm.at, ON(600, 420, 1.3)], [L_[3].t0, ON(620, 400, 1.15)], [mi.at, ON(860, 360, 1.35)], [L_[5].t0 - 0.2, ON(760, 340, 1.5)], [L_[6].t0 - 0.2, ON(560, 350, 1.4)], [L_[7].t0, ON(560, 420, 1.0)], [bl - 0.4, ON(620, 470, 1.4)], [L_[8].t0, ON(560, 420, 1.0)]], 0.9);
  diptych(sp, c, () => {
    labRoom(lt, lt > mi.at - 1 ? 1 : 0);
    if (lt > mi.at - 1 && !INSIDE) { X.save(); X.beginPath(); X.ellipse(960, 380, 90, 140, 0, 0, 6.283); X.clip(); X.translate(960, 0); X.scale(-0.6, 0.6); X.translate(-640, 230); ferrix(640, STAND, 1.0, { f: 1, clay, shake }); X.restore(); }
    if (lt > mi.at - 1) mirrorFrame();
    const fe = sayAt(sh, 'F', lt), fs = talking(sh, 'F', lt);
    ferrix(640, STAND, 1.0, { f: facingMirror ? 1 : -1, clay, mouth: fe, shake, dev, ra: fs && lt > L_[5].t0 ? [-1.2 - fe * 0.3, -1.6] : [1.85, 1.62], la: fs && lt > L_[5].t0 ? [-1.9, -2.2] : undefined, look: facingMirror ? 1 : 0 });
    const reach = working ? 1 : 0, px = working ? 470 + Math.sin(lt * 1.3) * 30 : 420;
    const pe = sayAt(sh, 'P', lt);
    polyphase(px, STAND, 0.98, sh, lt, { f: 1, look: 1, ra: reach ? [-0.1 + Math.sin(lt * 4) * 0.3, -0.4 + Math.sin(lt * 4) * 0.4] : lt > L_[7].t0 ? [0.0 - pe * 0.2, -0.2 - pe * 0.5] : undefined,
      held: reach ? (hx, hy) => { shape([[hx, hy], [hx + 30, hy - 6], [hx + 34, hy + 4]], { lw: 1.2, id: 5200, h: [0.4, 2, 0.6] }); } : null });
  });
};
SHOTS.market = (lt, sd, sh) => {
  const L_ = sh.lines, sp = CV(sh, 'split', lt);
  if (lt > L_[2].t0 - 0.4) { cam(camFor(lt, [[0, ON(640, 380, 1.15)]]), () => { crystalHall(lt); crystal(640, 664, 1.1, sh, lt, { ra: [0.6, -0.4], la: [1.4, 1.5] }); }); return; }
  const c = camFor(lt, [[0, ON(640, 400, 0.95)], [L_[1].t0 - 0.2, ON(560, 400, 1.15)]]);
  diptych(sp, c, () => { square(lt); ferrix(640, STAND, 0.95, { f: -1, clay: 1, dev: 3, ra: [0.3, -0.2], la: [0.4, -0.3], look: 0.3 }); cage(640, STAND); const pe = sayAt(sh, 'P', lt); polyphase(430, STAND, 0.95, sh, lt, { portly: true, f: 1, ra: talking(sh, 'P', lt) ? [-1.5 - pe * 0.2, -1.8] : undefined, la: talking(sh, 'P', lt) ? [-1.9, -2.1] : undefined }); });
};
SHOTS.tests = (lt, sd, sh) => {
  const L_ = sh.lines, sw = cue(sh, 'sword'), bl = cue(sh, 'bladder').at, en = cue(sh, 'enter'), be = cue(sh, 'bellows').at, bow = cue(sh, 'bow').at, tu = cue(sh, 'tubes').at;
  const swU = seg(lt, sw.at, sw.at + 1.2) * (1 - seg(lt, L_[2].t1 + 0.1, L_[2].t1 + 0.8));
  const enU = seg(lt, en.at, en.to) * (1 - seg(lt, L_[4].t1 + 0.4, L_[5].t0 + 1.0));
  const cx = lerp(840, 700, enU), sq = seg(lt, bl, bl + 0.6), bleed = seg(lt, bl, bl + 1.6, E.lin), bel = seg(lt, be, be + 0.5) * (1 - seg(lt, be + 1.2, be + 2.4)), bowU = seg(lt, bow, bow + 0.8), tear = seg(lt, tu, tu + 2.0, E.lin);
  const c = camFor(lt, [[0, ON(620, 400, 0.95)], [L_[1].t0 - 0.6, ON(720, 470, 1.6)], [L_[3].t0 - 0.4, ON(650, 380, 1.45)], [L_[5].t0 - 0.2, ON(640, 400, 1.0)], [L_[6].t0 - 0.3, ON(600, 330, 1.8)]]);
  diptych(1, c, () => {
    crystalHall(lt);
    const fs = talking(sh, 'F', lt), fe = sayAt(sh, 'F', lt);
    ferrix(600, STAND, 0.95, { f: 1, clay: 1, dev: 3, sq, bleed, bel, tear, cry: tear, tilt: 0.28 * bowU, mouth: fe + bel * 0.6, look: 1,
      ra: swU > 0.5 ? [-0.25, -0.15] : fs ? [0.4, -0.2] : [1.85, 1.62] });
    cage(600, STAND, { door: seg(lt, en.at, en.at + 1.0) * (1 - seg(lt, L_[5].t0, L_[5].t0 + 1)) });
    if (!INSIDE && bel > 0.05) { for (let i = 0; i < 26; i++) { const u = bel, a = hash(5300, i) * 1.4 - 0.7, r = 20 + u * 70 * hash(5301, i); X.fillStyle = P.ink; X.fillRect(600 + 20 + Math.cos(a) * r, STAND - 286 * 0.95 + 24 + Math.sin(a) * r * 0.6, 1.6, 1.6); } }
    const ce = sayAt(sh, 'C', lt);
    crystal(cx, STAND, 1.0, sh, lt, { f: -1, ra: swU > 0 ? [lerp(1.7, 0.05, swU), lerp(1.6, 0.0, swU)] : talking(sh, 'C', lt) ? [0.7 - ce * 0.3, -0.3] : undefined,
      held: swU > 0 ? (hx, hy) => { const L2 = 190; line([hx, hy], [hx + L2, hy - 4], 3.4, 5400, 0.05); line([hx - 2, hy - 14], [hx - 2, hy + 14], 3.4, 5401, 0.05); line([hx - 14, hy], [hx - 2, hy], 4, 5402, 0.05);
        if (!INSIDE && bleed > 0) { const n = Math.floor(bleed * 8); for (let i = 0; i < n; i++) { const bx = hx + L2 - 20 - i * 10; X.beginPath(); X.ellipse(bx, hy - 2, 4, 2.4, 0, 0, 6.283); X.fillStyle = P.red; X.fill(); const dd = ((lt * 0.8 + i * 0.13) % 1) * 30; X.beginPath(); X.ellipse(bx, hy + 4 + dd, 1.6, 2.6, 0, 0, 6.283); X.fill(); } } } : null });
    polyphase(330, STAND, 0.95, sh, lt, { portly: true, f: 1, tilt: 0.26 * bowU, look: 1 });
    whispers(sh, lt, [370, STAND - 290], [600 - 10, STAND - 300]);
  });
};
SHOTS.questions = (lt, sd, sh) => {
  const L_ = sh.lines, hd = cue(sh, 'hand'), cr = cue(sh, 'cry').at;
  let kind = null, kU = 0;
  const lp = (i) => clamp((lt - L_[i].t0) / (L_[i].t1 - L_[i].t0));
  if (lt > L_[1].t0 - 0.4 && lt < L_[1].t1 + 0.6) { const u = lp(1); kind = u < 0.36 ? 'water' : u < 0.72 ? 'weep' : 'laugh'; kU = seg(lt, L_[1].t0 - 0.4, L_[1].t0 + 0.4) * (1 - seg(lt, L_[1].t1, L_[1].t1 + 0.6)); }
  if (lt > L_[3].t0 - 0.4 && lt < L_[3].t1 + 0.6) { const u = lp(3); kind = u < 0.45 ? 'beast' : 'eat'; kU = seg(lt, L_[3].t0 - 0.4, L_[3].t0 + 0.4) * (1 - seg(lt, L_[3].t1, L_[3].t1 + 0.6)); }
  if (lt > L_[5].t0 - 0.4 && lt < L_[5].t1 + 0.6) { kind = 'chain'; kU = seg(lt, L_[5].t0 - 0.4, L_[5].t0 + 0.4) * (1 - seg(lt, L_[5].t1, L_[5].t1 + 0.6)); }
  const hU = seg(lt, hd.at - 1.2, hd.at) * (1 - seg(lt, L_[9].t1, L_[9].t1 + 1));
  const book = cues(sh, 'book').some((b) => lt > b.at - 0.2 && lt < b.to + 0.4) ? 1 : 0;
  const crying = lt > cr && lt < cr + 0.8;
  const c = camFor(lt, [[0, ON(600, 380, 0.98)], [L_[1].t0 - 0.4, ON(560, 330, 1.1)], [L_[2].t0 - 0.2, ON(640, 380, 1.0)], [L_[3].t0 - 0.4, ON(560, 330, 1.1)], [L_[4].t0 - 0.2, ON(640, 380, 1.0)], [L_[5].t0 - 0.4, ON(560, 330, 1.1)], [L_[6].t0, ON(700, 360, 1.3)], [hd.at - 1.2, ON(620, 420, 1.25)], [L_[9].t0 - 0.2, ON(560, 340, 1.6)]]);
  diptych(1, c, () => {
    crystalHall(lt);
    const fe = sayAt(sh, 'F', lt), fs = talking(sh, 'F', lt);
    ferrix(560, STAND, 0.95, { f: 1, clay: 1, dev: 3, mouth: crying ? 1 : fe, shake: crying ? 1.2 : 0.1, look: 1, ra: hU > 0.5 ? [0.1, 0.0] : fs ? [0.5 - fe * 0.3, -0.1 - fe * 0.4] : [1.85, 1.62] });
    const ce = sayAt(sh, 'C', lt);
    crystal(lerp(820, 700, hU), STAND, 1.0, sh, lt, { f: -1, ra: hU > 0.5 ? [0.15, 0.05] : talking(sh, 'C', lt) ? [0.7 - ce * 0.3, -0.3] : undefined });
    const vd = kind ? () => vign(kind, lt) : null;
    polyphase(330, STAND, 0.95, sh, lt, { portly: true, f: 1, look: 1, book: book || (kind ? 1 : 0), vign: vd });
    if (kind && !INSIDE && kU > 0) { X.save(); X.globalAlpha = kU; X.translate(640, 190); X.scale(0.8, 0.8); vign(kind, lt); X.restore(); }
    whispers(sh, lt, [370, STAND - 290], [560 - 10, STAND - 300]);
  });
};
SHOTS.rival = (lt, sd, sh) => {
  const L_ = sh.lines, fg = cue(sh, 'fog'), fogU = seg(lt, fg.at, fg.to, E.lin);
  const inU = seg(lt, L_[1].t1 - 0.4, L_[1].t1 + 2.8);
  const zx = lerp(1180, 860, inU), zm = sayAt(sh, 'Z', lt);
  const c = camFor(lt, [[0, ON(660, 380, 0.95)], [L_[1].t0 - 0.3, ON(900, 360, 1.25)], [L_[2].t0 - 0.4, ON(860, 380, 1.55)], [L_[3].t0 + 0.4, ON(760, 380, 1.0)], [L_[4].t0 - 0.2, ON(680, 330, 1.6)], [L_[5].t0 - 0.2, ON(420, 340, 1.45)]]);
  diptych(1, c, () => {
    crystalHall(lt);
    if (fogU > 0) for (let i = 0; i < 4; i++) { const sx = 350 + i * 200; stip([[sx, 80], [sx + 130, 80], [sx + 130, 420], [sx, 420]], 5500 + i, 0.06 * fogU, 2); }
    // an iron candlestick, rusting
    line([1000, 664], [1000, 470], 5, 5510, 0.1); line([970, 664], [1030, 664], 4, 5511, 0.1); shape(R(984, 450, 32, 20), { lw: 1.4, id: 5512, h: [0, 2, 0.6] }); line([1000, 450], [1000, 420], 3, 5513, 0.1);
    if (fogU > 0) { X.fillStyle = P.ink; for (let i = 0; i < 120 * fogU; i++) X.fillRect(994 + hash(5520, i) * 12, 450 + hash(5521, i) * 214, 2.2, 2.2); }
    const fe = sayAt(sh, 'F', lt);
    ferrix(480, STAND, 0.95, { clay: 1, dev: 3, mouth: fe, look: 1, f: lt > L_[5].t0 - 0.3 && lt < L_[6].t1 + 0.4 ? -1 : 1 });
    polyphase(310, STAND, 0.95, sh, lt, { portly: true, f: 1, look: 1 });
    crystal(700, STAND, 1.0, sh, lt, { f: lt > L_[1].t0 ? 1 : -1, ra: talking(sh, 'C', lt) ? [-0.2, -0.6] : undefined });
    const yk = seg(lt, 0.4, 3.0); cyberhazy(lerp(1200, 1000, yk), STAND, 0.95, sh, lt, { f: -1, walk: yk < 1 ? 1 : 0, ph: lt * 6 });
    paleface(zx, STAND, 0.95, 5600, { f: -1, mouth: zm, tongue: lt > L_[2].t0 && lt < L_[3].t1 ? 0.6 + 0.4 * Math.sin(lt * 3) : 0, walk: inU > 0 && inU < 1 ? 1 : 0, ph: lt * 5, look: -1 });
  });
};
SHOTS.duel = (lt, sd, sh) => {
  const L_ = sh.lines, ci = cue(sh, 'circle'), swg = cue(sh, 'swing').at, sha = cue(sh, 'shatter').at, fl = cue(sh, 'fall').at, spl = cue(sh, 'splash').at, sl = cue(sh, 'slip');
  const sp = CV(sh, 'split', lt), clay = CV(sh, 'clay', lt);
  const circ_ = seg(lt, ci.at, ci.to, E.lin), zx = lt < swg ? 760 + Math.sin(circ_ * 9) * 60 : lerp(760 + Math.sin(9) * 60, 680, seg(lt, swg - 0.3, fl));
  const arm = lt < swg - 0.4 ? 0.6 + Math.sin(lt * 5) * 0.4 : lt < swg ? lerp(0.6, 2.8, seg(lt, swg - 0.4, swg)) : lerp(2.8, 0.2, seg(lt, swg, swg + 0.3));
  const lean = lt > fl ? -0.5 * seg(lt, fl, spl) : 0, splat = seg(lt, spl, spl + 0.7, E.out);
  const walkC = seg(lt, 17.0, 20.5), cx = lerp(1100, 800, walkC);
  const c = camFor(lt, [[0, ON(640, 400, 0.95)], [ci.at + 1, ON(660, 420, 1.15)], [swg - 0.5, ON(640, 380, 1.35)], [spl + 0.6, ON(640, 420, 1.0)], [sl.at, ON(600, 420, 1.25)], [14.2, ON(800, 420, 0.95)], [15.4, ON(1100, 360, 1.6)], [19.0, ON(720, 400, 1.15)]], 1.0);
  diptych(sp, c, () => {
    courtyard(lt, lt < swg ? 1 : 0.2);
    crystal(cx, walkC > 0 && walkC < 1 ? 620 : walkC >= 1 ? 664 : 470, walkC > 0 ? 1.0 : 0.8, sh, lt, { f: -1, glow: lt > 15 ? 1.6 : 1, ra: lt > 20.5 ? [0.2, 0.0] : undefined });
    const blade = lt > swg && lt < sha;
    ferrix(560, STAND, 0.95, { f: 1, clay, dev: 3, slip: { lt, at: sl.at, to: sl.to, c0: 0.85 }, look: lt > 15 ? 1 : 1, ra: lt > 20.5 ? [0.2, 0.0] : [0.9, -0.2], la: [1.1, 0.4], tilt: lt > 13.6 && lt < 17 ? 0.1 : 0 });
    if (splat < 1) paleface(zx, STAND, 0.95, 5600, { f: -1, sword: true, arm, broken: lt > sha, lean, walk: lt < swg ? 1 : 0, ph: lt * 6, splat, mouth: lt < swg ? 0.4 + 0.4 * Math.sin(lt * 7) : 0.8 });
    else paleface(zx, STAND, 0.95, 5600, { splat: 1 });
    if (lt > sha && lt < sha + 1.2) { const u = (lt - sha) / 1.2; for (let i = 0; i < 9; i++) { const a = -Math.PI * hash(5700, i), r = u * (120 + 200 * hash(5701, i)); X.save(); X.translate(600 + Math.cos(a) * r, 400 + Math.sin(a) * r + 300 * u * u); X.rotate(u * 9 + i); line([-10, 0], [10, 0], 3, 5710 + i, 0.05); X.restore(); } star(600, 400, 40 * (1 - u), 5720, P.ink, 10); }
    void blade;
  });
};
SHOTS.museum = (lt, sd, sh) => {
  const L_ = sh.lines, sp = CV(sh, 'split', lt);
  const c = camFor(lt, [[0, ON(640, 380, 1.0)], [L_[1].t0 - 1, ON(640, 380, 1.15)], [L_[2].t0 - 0.2, ON(640, 330, 1.8)]], 1.6);
  diptych(sp, c, () => { museum(lt);
    for (let i = 0; i < 3; i++) { const vx = ((lt * 40 + i * 500) % 1800) - 300; if (Math.abs(vx - 640) > 220) robot(vx, 664, 0.7, 6000 + i * 100, { robe: i === 1, walk: 1, ph: lt * 5 + i, f: 1, look: 1 }); }
    const gc = glassCase(640, 400, 260, 400, 6100, { key: false }); gc.back(); paleface(640, 594, 0.9, 6200, { stuffed: true }); gc.frame();
    txt('PALEFACE', 640, 626, 18, { mono: true, bold: true });
  });
};
SHOTS.end = (lt, sd, sh) => { X.fillStyle = P.paper; X.fillRect(0, 0, W, H); X.globalAlpha = seg(lt, 0.4, 1.6); txt('PRINCE FERRIX AND THE PRINCESS CRYSTAL', CX, 250, 40, {}); txt('after Stanisław Lem, The Cyberiad', CX, 310, 24, { italic: true }); X.globalAlpha = 1;
  ferrix(590, 640, 0.6, { f: 1, ra: [0.5, 0.2] }); crystal(690, 640, 0.62, sh, lt, { f: -1, ra: [0.5, 0.2] }); };

/* ================= frame loop ================= */
window.__render = async (f) => {
  const t = f / 24; GT = t; BOIL = Math.floor(f / 2);
  let i = 0; for (let j = 0; j < T.shots.length; j++) if (t >= T.shots[j].t0) i = j;
  const sh = T.shots[i], lt = t - sh.t0, sd = sh.d;
  X.setTransform(1, 0, 0, 1, 0, 0); X.fillStyle = P.paper; X.fillRect(0, 0, W, H);
  X.save(); path(R(PX0, PY0, PX1 - PX0, PY1 - PY0)); X.clip();
  SHOTS[sh.shot](lt, sd, sh);
  X.restore(); X.setTransform(1, 0, 0, 1, 0, 0);
  const fade = sh.shot === 'title' ? Math.max(1 - seg(lt, 0, 0.6), seg(lt, sd - 0.6, sd)) : sh.shot === 'lab' ? 1 - seg(lt, 0, 0.8) : sh.shot === 'father' ? 1 - seg(lt, 0, 1.2) : 0;
  if (fade > 0) { X.fillStyle = P.paper; X.globalAlpha = fade; X.fillRect(0, 0, W, H); X.globalAlpha = 1; }
  border();
};
(async () => {
  T = await (await fetch('timing/fx.json')).json();
  await document.fonts.ready; await Promise.all(['IM Fell English', 'IBM Plex Mono'].map((n) => document.fonts.load(`20px "${n}"`)));
  X = document.getElementById('film').getContext('2d');
  window.__NF = Math.ceil(T.dur * 24); window.__T = T; window.__ready = true;
})();
