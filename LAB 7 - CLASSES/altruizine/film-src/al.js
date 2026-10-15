/* Altruizine: engraved film, fourth in the Seventh Sally lineage. Grid shots copy one panel into its neighbours. */
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
const sayAt = (sh, who, lt) => { for (const l of sh.lines) if (l.who === who && lt >= l.t0 && lt < l.t1) return l.env[Math.min(l.env.length - 1, Math.floor((lt - l.t0) * 24))] || 0; return 0; };
const talking = (sh, who, lt) => sh.lines.some((l) => l.who === who && lt >= l.t0 - 0.1 && lt < l.t1 + 0.2);
const onLine = (sh, lt, pre = 0.5, post = 1.2) => { const l = sh.lines.find((x) => x.line); return !!l && lt >= l.t0 - pre && lt < l.t1 + post; };
const cue = (sh, k) => sh.cues.find((c) => c.k === k);
const cues = (sh, k) => sh.cues.filter((c) => c.k === k);
function darkWall(x0, y0, x1, y1, sp = 2.6) { X.fillStyle = P.paper; X.fillRect(x0, y0, x1 - x0, y1 - y0); X.save(); path(R(x0, y0, x1 - x0, y1 - y0)); X.clip(); for (let y = y0; y < y1; y += sp) { X.fillStyle = P.ink; X.fillRect(x0, y, x1 - x0, 0.9 + 0.5 * hash(y | 0, 5)); } X.restore(); }
function starfield(n, id, x0 = 0, y0 = 0, w = 1280, h = 720) { for (let i = 0; i < n; i++) { const x = x0 + hash(id, i) * w, y = y0 + hash(id + 1, i) * h, r = hash(id + 2, i); X.fillStyle = P.paper; X.globalAlpha = 0.4 + 0.6 * hash(i, (BOIL >> 2) + id); X.fillRect(x, y, 1 + r * 1.6, 1 + r * 1.6); } X.globalAlpha = 1; }
function cam(c, fn) { X.save(); X.translate(CX, CY); X.scale(c.z, c.z); X.translate(-CX - c.x, -CY - c.y); fn(); X.restore(); }

/* Bonhomius: pot head full of holes, goggles, cone nose, antenna, a round belly, a cape, stovepipe limbs */
function bonhomius(x, y, s, id, o = {}) {
  const br = o.broken || 0, lt = o.t || 0;
  const sc = (k) => [(hash(id + 900, k) - 0.5) * 420 * br, -(hash(id + 901, k)) * 260 * br * (1 - br) * 4 + 140 * br * hash(id + 902, k)];
  X.save(); X.translate(x, y); X.scale(s * (o.f || 1), s);
  const p = (k) => sc(k);
  // cape behind
  { const [dx, dy] = p(0); shape([[-40 + dx, -250 + dy], [40 + dx, -250 + dy], [80 + dx + Math.sin(lt * 1.3) * 8, -60 + dy], [-90 + dx + Math.sin(lt * 1.1) * 10, -70 + dy]], { lw: 1.8, id: id + 1, h: [1.7, 5, 0.45], sh: [[20 + dx, -260 + dy], [100 + dx, -260 + dy], [100 + dx, -40 + dy], [20 + dx, -40 + dy]], sh2: [1.65, 2.6, 0.7] }); }
  // legs
  for (const k of [-1, 1]) { const [dx, dy] = p(2 + k); const st = o.walk ? Math.sin(lt * 6 + (k > 0 ? Math.PI : 0)) * 14 : 0; cap(k * 20 + dx, -110 + dy, k * 24 + st + dx, -10 + dy, 18, id + 10 + k); X.save(); X.translate(dx, dy); boot(k * 24 + st, 0, 1, 1.3, id + 14 + k); X.restore(); }
  // belly
  { const [dx, dy] = p(4); ball(dx, -160 + dy, 70, id + 20, PAT.f, 2.2); line([-66 + dx, -150 + dy], [66 + dx, -150 + dy], 1.2, id + 21, 0.4); for (const [a, b] of [[-30, -200], [34, -190], [-40, -120], [30, -110]]) ball(a + dx, b + dy, 3.4, id + 22 + a, PAT.m, 0.8);
    if (o.tubes) { shape(R(-26 + dx, -186 + dy, 52, 50), { fill: PAT.d, lw: 1.4, id: id + 26 }); for (let i = 0; i < 4; i++) { const tx = -18 + i * 12 + dx; shape(R(tx - 4, -178 + dy, 8, 30), { lw: 0.9, id: id + 27 + i }); } } }
  // arms
  const ra = o.ra || [0.5, 1.2], la = o.la || [2.6, 1.9];
  for (const [k, a] of [[-1, la], [1, ra]]) { const [dx, dy] = p(5 + k); const [, , hx, hy] = limb(k * 62 + dx, -200 + dy, a[0], 58, a[1], 52, 15, id + 30 + k * 5); hand(hx, hy, a[1], 8, id + 40 + k, o.open || 0); }
  // neck and head
  { const [dx, dy] = p(8); X.save(); X.translate(dx, dy - 236); X.rotate((o.tilt || 0) + br * 2.2 * hash(id, 77));
    cap(0, 6, 0, -14, 10, id + 50);
    ball(0, -44, 34, id + 51, PAT.f, 2); X.save(); circ(0, -44, 34, id + 51); X.clip(); for (let i = 0; i < 12; i++) { X.beginPath(); X.arc(-24 + hash(id + 52, i) * 48, -70 + hash(id + 53, i) * 50, 1.6 + hash(id + 54, i) * 1.6, 0, 6.283); X.fillStyle = P.ink; X.fill(); } X.restore();
    for (const ex of [-12, 12]) { X.beginPath(); X.arc(ex, -50, 9, 0, 6.283); X.fillStyle = P.paper; X.fill(); X.lineWidth = 2.4; X.strokeStyle = P.ink; X.stroke(); X.beginPath(); X.arc(ex + 2 + (o.look || 0) * 3, -50 + (o.lookY || 0) * 3, 3.2, 0, 6.283); X.fillStyle = P.ink; X.fill(); }
    shape([[2, -42], [24, -36], [2, -32]], { lw: 1.4, id: id + 55 }); const mo = o.mouth || 0; X.beginPath(); X.ellipse(4, -22, 8, 1.5 + mo * 5, 0, 0, 6.283); X.fillStyle = P.ink; X.fill();
    line([0, -78], [4, -96], 1.4, id + 56, 0.1); ball(4, -99, 4, id + 57, PAT.f, 1);
    if (o.sparks) for (let i = 0; i < 8; i++) { const a = hash(id + 60, i + BOIL) * 6.283; line([0, -60], [Math.cos(a) * (40 + 30 * hash(i, BOIL)), -60 + Math.sin(a) * 40], 1.2, id + 61 + i, 0.3, i % 2 ? P.ink : P.amber); }
    X.restore(); }
  X.restore();
}
/* a human of Terrania (ink.js figure) in a feeling, with a mouth that opens when the feeling is strong */
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
function cow(x, y, s, lt, I) {
  X.save(); X.translate(x, y); X.scale(s, s); X.rotate(-0.06 * I);
  for (const [lx, k] of [[-110, 0], [-70, 1], [80, 2], [115, 3]]) line([lx, -40], [lx + (k % 2 ? 4 : -4), 70], 9, 7000 + k, 0.2);
  X.beginPath(); X.ellipse(0, -60, 150, 70, 0, 0, 6.283); X.fillStyle = P.paper; X.fill(); X.lineWidth = 2.4; X.strokeStyle = P.ink; X.stroke();
  X.save(); X.clip(); hatch(1.57, 4, 0.5, [-150, -130, 150, 10]); for (const [a, b, r] of [[-60, -80, 30], [40, -50, 26], [100, -90, 18]]) { X.beginPath(); X.ellipse(a, b, r * 1.3, r, 0.3, 0, 6.283); X.fillStyle = PAT.d; X.fill(); } X.restore();
  X.beginPath(); X.ellipse(30, 6, 26, 16, 0, 0, Math.PI); X.fillStyle = P.paper; X.fill(); X.lineWidth = 1.6; X.stroke(); for (let i = 0; i < 4; i++) line([16 + i * 9, 14], [16 + i * 9, 26], 2, 7010 + i, 0.1);
  const ha = -0.7 * I + Math.sin(lt * 3) * 0.05; X.save(); X.translate(140, -90); X.rotate(ha);
  shape([[0, -20], [70, -14], [86, 20], [60, 40], [8, 26]], { lw: 2, id: 7020, h: [1.2, 3.2, 0.5] }); line([10, -22], [-8, -50], 3, 7021, 0.2); line([30, -20], [40, -50], 3, 7022, 0.2);
  X.beginPath(); X.arc(48, 0, 4, 0, 6.283); X.fillStyle = P.ink; X.fill(); X.beginPath(); X.ellipse(80, 24, 6, 2 + I * 8, 0, 0, 6.283); X.fill(); X.restore();
  ink([[-150, -60], [-176, -20 + Math.sin(lt * 4) * 10], [-182, 30]], 2, 7030, 0.4);
  X.restore();
}

/* ================= the grid: one feeling copied cell by cell ================= */
function waveI(sh, q, r, lt) {
  let best = 0, feel = null, cat = false;
  for (const c of cues(sh, 'wave')) {
    if (sh.me && q === sh.me[0] && r === sh.me[1]) continue;
    const dist = Math.hypot(q - c.src[0], r - c.src[1]), ta = c.at + dist / c.speed, u = lt - ta;
    if (u < 0) continue;
    const env = clamp(u / 0.18) * (1 - seg(u, c.dur * 0.6, c.dur));
    const n = cols(sh) * rows(sh), reached = Math.min(n, Math.PI * Math.pow(Math.max(0, lt - c.at) * c.speed, 2));
    const I = env * (0.55 + 0.45 * clamp(reached / n));
    if (I > best) { best = I; feel = c.feel; cat = c.cat; }
  }
  return { I: best, feel };
}
const cols = (sh) => sh.grid[0], rows = (sh) => sh.grid[1];
function cellRect(sh, q, r) { const g = 6, w = (1280 - g * (cols(sh) + 1)) / cols(sh), h = (720 - g * (rows(sh) + 1)) / rows(sh); return [g + q * (w + g), g + r * (h + g), w, h]; }
let TMP = null;
function grid(sh, lt, cellFn, focus) {
  const op = sh.open; let u = seg(lt, op[0], op[1], E.io);
  if (sh.shot === 'city') { const ws = cues(sh, 'wave'); for (let i = 1; i < ws.length; i++) { const c = ws[i], zi = seg(lt, c.at - 2.0, c.at - 1.0, E.io) - seg(lt, c.at + 0.8, c.at + 2.6, E.io); if (zi > 0) { u = Math.min(u, 1 - zi); focus = c.src; } } }
  const fr = cellRect(sh, focus[0], focus[1]);
  // view: from the focus cell to the whole grid; cell aspect differs a little from 16:9, so fit by width
  const w = lerp(fr[2], 1280, u), cx = lerp(fr[0] + fr[2] / 2, 640, u), cy = lerp(fr[1] + fr[3] / 2, 360, u), k = 1280 / w;
  X.fillStyle = P.ink; X.fillRect(0, 0, W, H);
  X.save(); X.translate(CX, CY); X.scale(k, k); X.translate(-cx, -cy);
  const st = {};
  for (let r = 0; r < rows(sh); r++) for (let q = 0; q < cols(sh); q++) {
    const [x, y, cw, ch] = cellRect(sh, q, r);
    if (u === 0 && (q !== focus[0] || r !== focus[1])) continue;
    const s = waveI(sh, q, r, lt); st[q + ',' + r] = s;
    X.save(); X.beginPath(); X.rect(x, y, cw, ch); X.clip(); X.translate(x, y); X.scale(cw / 1280, ch / 720);
    const shake = s.I > 0.3 ? (hash(q * 13 + r, BOIL) - 0.5) * 14 * s.I : 0; X.translate(shake, 0);
    cellFn(q, r, s, lt);
    X.restore();
  }
  X.restore();
  // the copy: the source panel's picture is printed into each panel the feeling reaches
  if (u > 0.02) {
    const srcs = cues(sh, 'wave').filter((c) => lt > c.at && lt < c.at + 12);
    for (const c of srcs) {
      const sr = cellRect(sh, c.src[0], c.src[1]); const toS = (px, py) => [CX + (px - cx) * k, CY + (py - cy) * k];
      const [ax, ay] = toS(sr[0], sr[1]), sw = sr[2] * k, shh = sr[3] * k;
      if (!TMP) { TMP = document.createElement('canvas'); TMP.width = W; TMP.height = H; }
      const tg = TMP.getContext('2d'); tg.clearRect(0, 0, W, H); tg.drawImage(X.canvas, Math.max(0, ax), Math.max(0, ay), Math.min(W, sw), Math.min(H, shh), 0, 0, Math.min(W, sw), Math.min(H, shh));
      for (let r = 0; r < rows(sh); r++) for (let q = 0; q < cols(sh); q++) {
        if (q === c.src[0] && r === c.src[1]) continue; if (sh.me && q === sh.me[0] && r === sh.me[1]) continue;
        const s = st[q + ',' + r]; if (!s || s.I < 0.05 || s.feel !== c.feel) continue;
        const cr = cellRect(sh, q, r), [bx, by] = toS(cr[0], cr[1]);
        X.save(); X.globalCompositeOperation = 'multiply'; X.globalAlpha = Math.min(0.6, s.I * 0.6); X.drawImage(TMP, 0, 0, Math.min(W, sw), Math.min(H, shh), bx, by, cr[2] * k, cr[3] * k); X.restore();
      }
    }
  }
}

/* ================= cell scenes ================= */
function ground(y, id, dark) { shape([[-50, y], [1330, y], [1330, 780], [-50, 780]], { lw: 1.6, id, h: [0.03, dark ? 3 : 5, 0.5] }); }
function windowBox(x, y, w, h, id, lit) { shape(R(x, y, w, h), { fill: lit ? P.paper : PAT.d, lw: 2, id }); line([x + w / 2, y], [x + w / 2, y + h], 2, id + 1, 0.1); line([x, y + h / 2], [x + w, y + h / 2], 2, id + 2, 0.1); }
function innCell(q, r, s, lt, sh) {
  const id = 9000 + q * 100 + r * 1000, kind = q === sh.src[0] && r === sh.src[1] ? 'barn' : q === sh.well[0] && r === sh.well[1] ? 'well' : ['kitchen', 'yard', 'room', 'yard', 'kitchen'][(q + r * 2) % 5];
  X.fillStyle = P.paper; X.fillRect(0, 0, 1280, 720);
  if (kind === 'barn') {
    darkWall(0, 0, 1280, 720, 3.4); for (let i = 0; i < 12; i++) line([i * 110, 0], [i * 110 + 20, 720], 4, id + i, 0.3);
    ground(560, id + 20); for (let i = 0; i < 60; i++) line([hash(id, i) * 1280, 560 + hash(id + 1, i) * 120], [hash(id, i) * 1280 + 40 * (hash(id + 2, i) - 0.5), 556 + hash(id + 1, i) * 120], 1, id + 30 + i, 0.3);
    cow(560, 560, 1.4, lt, s.I || 0.3 + 0.2 * Math.sin(lt * 2));
    person(1040, 650, 1.1, id + 200, s.feel || 'labor', s.I, lt, { f: -1, dark: true });
    shape(R(1080, 520, 60, 40), { fill: P.ink, lw: 1, id: id + 210 });
    return;
  }
  if (kind === 'well') {
    X.save(); X.globalAlpha = 0.4; skyLines(0, 460, 900); X.restore(); ground(500, id + 1);
    shape(R(480, 330, 320, 200), { lw: 2.4, id: id + 2, h: [1.57, 2.6, 0.6] }); for (let i = 0; i < 6; i++) line([480, 360 + i * 30], [800, 360 + i * 30], 1, id + 3 + i, 0.3);
    line([500, 330], [520, 140], 6, id + 10, 0.2); line([780, 330], [760, 140], 6, id + 11, 0.2); shape([[460, 150], [820, 150], [640, 60]], { lw: 2, id: id + 12, h: [0.5, 3, 0.5] });
    line([520, 200], [760, 200], 5, id + 13, 0.1); line([640, 200], [640, 300 + Math.sin(lt * 2) * 20], 1.6, id + 14, 0.1); shape(R(616, 300 + Math.sin(lt * 2) * 20, 48, 40), { lw: 1.6, id: id + 15, h: [1.57, 2.4, 0.6] });
    // Bonhomius' hand and the pinch
    const pc = 3.0; const u = seg(lt, 1.6, pc), fall = seg(lt, pc, pc + 0.9, E.in);
    bonhomius(980, 700, 1.1, 9500, { t: lt, ra: [lerp(0.4, -0.6, u), lerp(1.2, -0.2, u)], look: -1, lookY: 1 });
    if (lt > pc) for (let i = 0; i < 14; i++) { X.beginPath(); X.arc(780 + (hash(i, 3) - 0.5) * 30 - fall * 80, 470 + fall * 260 + hash(i, 4) * 30, 2.2, 0, 6.283); X.fillStyle = P.paper; X.fill(); X.lineWidth = 0.6; X.strokeStyle = P.ink; X.stroke(); }
    person(250, 640, 1.0, id + 300, s.feel, s.I, lt, { short: true });
    return;
  }
  if (kind === 'kitchen' || kind === 'room') { darkWall(0, 0, 1280, 720, 3); windowBox(880, 120, 220, 200, id + 5, true); ground(560, id + 9, true); if (kind === 'kitchen') { shape(R(80, 420, 380, 140), { lw: 2, id: id + 10, h: [1.57, 3, 0.5] }); ball(200, 400, 30, id + 11, PAT.m, 1.4); ball(330, 396, 36, id + 12, PAT.m, 1.4); } else { shape(R(120, 430, 420, 120), { lw: 2, id: id + 13, h: [0.1, 3, 0.5] }); shape(R(120, 380, 80, 60), { lw: 1.6, id: id + 14 }); } }
  else { X.save(); X.globalAlpha = 0.4; skyLines(0, 500, 900); X.restore(); ground(540, id + 20); shape([[700, 540], [700, 300], [900, 200], [1100, 300], [1100, 540]], { lw: 2, id: id + 21, h: [1.57, 3.2, 0.5] }); windowBox(860, 340, 80, 80, id + 22, false); }
  const n = 1 + (q + r) % 2;
  for (let i = 0; i < n; i++) person(380 + i * 360 + (hash(id, i) - 0.5) * 100, 650, 1.05, id + 400 + i * 30, s.feel, s.I * (0.9 + 0.1 * i), lt, { f: i % 2 ? -1 : 1, hood: (q + i) % 3 === 0, short: (r + i) % 2 === 0, dark: (q * r + i) % 3 === 1, runDir: i % 2 ? -1 : 1 });
}
function nightBase(id, n) { darkWall(0, 0, 1280, 720, 2.2); starfield(30, id, 0, 0, 1280, 300); }
function cityCell(q, r, s, lt, sh) {
  const id = 20000 + q * 100 + r * 1000;
  const src = (cues(sh, 'wave').find((c) => c.src[0] === q && c.src[1] === r) || {}).feel;
  const fd = Math.hypot(q - 1, r - 2), fire = fd > 1.5 ? 0 : Math.max(0, lt - 7.5 - fd * 1.4) / 4;
  nightBase(id);
  const kind = src === 'blow' ? 'tavern' : src === 'ache' ? 'tooth' : src === 'fear' ? 'cellar' : src === 'sneeze' ? 'street' : src === 'grief' ? 'widow' : ['street', 'hotel', 'roof', 'hotel', 'street', 'tavern2'][(q * 3 + r * 5) % 6];
  if (kind === 'tavern' || kind === 'tavern2') { shape(R(0, 0, 1280, 720), { fill: P.paper, lw: 0, id: id + 1 }); X.save(); X.globalAlpha = 0.6; hatch(Math.PI / 2, 5, 0.6, [0, 0, 1280, 720]); X.restore(); ball(640, 90, 30, id + 2, PAT.f, 1.4); line([640, 0], [640, 60], 2, id + 3, 0.1); shape(R(60, 470, 1160, 40), { lw: 2, id: id + 4, h: [0, 2.4, 0.6] }); for (let i = 0; i < 5; i++) shape(R(120 + i * 220, 430, 40, 40), { lw: 1.4, id: id + 5 + i, h: [1.57, 2.4, 0.6] }); ground(600, id + 12, true); }
  else if (kind === 'hotel') { for (let i = 0; i < 3; i++) windowBox(140 + i * 380, 120, 200, 240, id + 20 + i * 5, i !== 1); ground(560, id + 40, true); shape(R(800, 440, 360, 120), { lw: 2, id: id + 41, h: [0.1, 3, 0.5] }); }
  else if (kind === 'roof') { shape([[-50, 720], [-50, 460], [640, 340], [1330, 460], [1330, 720]], { lw: 2, id: id + 50, h: [0.4, 3.6, 0.6] }); shape(R(860, 260, 70, 120), { lw: 1.6, id: id + 51, h: [1.57, 2.6, 0.5] }); ball(220, 120, 50, id + 52, PAT.f, 1.6); }
  else if (kind === 'cellar') { darkWall(0, 0, 1280, 720, 1.8); ground(560, id + 60, true); for (let i = 0; i < 4; i++) shape(R(80 + i * 180, 380, 140, 180), { lw: 1.6, id: id + 61 + i, h: [1.57, 3, 0.5] }); }
  else if (kind === 'tooth') { shape(R(0, 0, 1280, 720), { fill: P.paper, lw: 0, id: id + 70 }); X.save(); X.globalAlpha = 0.5; hatch(0.78, 6, 0.6, [0, 0, 1280, 720]); X.restore(); ground(600, id + 71, true); }
  else { for (let i = 0; i < 4; i++) shape(R(i * 340 - 40, 160 + hash(id, i) * 120, 300, 600), { lw: 2, id: id + 80 + i, h: [1.57, 3.4, 0.5] }); for (let i = 0; i < 4; i++) windowBox(i * 340 + 40, 260 + hash(id, i) * 120, 90, 90, id + 90 + i * 4, hash(id + 1, i) > 0.5); line([1100, 600], [1100, 200], 5, id + 99, 0.2); ball(1100, 190, 22, id + 98, PAT.f, 1.4); ground(600, id + 97, true); }
  if (fire > 0 && kind !== 'cellar') { X.save(); X.globalAlpha = Math.min(1, fire); for (let i = 0; i < 9; i++) { const fx = 100 + i * 140, fh = (120 + 160 * hash(id + 7, i)) * Math.min(1, fire) * (0.8 + 0.2 * Math.sin(lt * 9 + i)); X.beginPath(); X.moveTo(fx - 40, 600); X.quadraticCurveTo(fx - 30 + Math.sin(lt * 7 + i) * 20, 600 - fh * 0.6, fx + Math.sin(lt * 5 + i) * 26, 600 - fh); X.quadraticCurveTo(fx + 30, 600 - fh * 0.5, fx + 40, 600); X.fillStyle = P.paper; X.fill(); X.lineWidth = 1.6; X.strokeStyle = P.ink; X.stroke(); } X.restore(); }
  // people: the source cell holds the cause; every other cell holds people who feel it
  const I = s.I, f = s.feel;
  if (kind === 'tavern') { const c = cues(sh, 'wave').find((w) => w.feel === 'blow'), sw = seg(lt, c.at - 0.3, c.at); person(470, 690, 1.25, id + 300, null, 0, lt, { hf: [lerp(30, 120, sw), lerp(-112, -190, sw)], dark: true }); person(800, 690, 1.25, id + 330, 'blow', Math.max(I, seg(lt, c.at, c.at + 0.2) * (1 - seg(lt, c.at + 2, c.at + 3))), lt, { f: -1, short: true }); return; }
  if (kind === 'tooth') { person(640, 690, 1.25, id + 300, 'ache', Math.max(I, 0.6), lt, { short: true }); person(380, 690, 1.15, id + 330, f, I, lt, { hf: [150, -190], dark: true }); person(900, 690, 1.15, id + 360, f, I, lt, { f: -1, hf: [150, -190] }); return; }
  if (kind === 'cellar') { const c = cues(sh, 'wave').find((w) => w.cat), u = clamp((lt - (c.at - 1.6)) / 3); X.save(); X.translate(lerp(200, 1400, u), 560); X.scale(1.4, 1.4); X.beginPath(); X.ellipse(0, -30, 60, 26, 0, 0, 6.283); X.fillStyle = P.paper; X.fill(); X.lineWidth = 2; X.strokeStyle = P.ink; X.stroke(); X.save(); X.clip(); hatch(1.57, 4, 0.5, [-60, -60, 60, 0]); X.restore(); ball(66, -50, 22, id + 400, PAT.m, 1.6); shape([[56, -66], [62, -84], [72, -68]], { lw: 1.4, id: id + 401 }); shape([[72, -66], [82, -82], [84, -62]], { lw: 1.4, id: id + 402 }); for (const lx of [-40, -20, 20, 40]) line([lx, -10], [lx + Math.sin(lt * 20 + lx) * 12, 20], 4, id + 410 + lx, 0.2); ink([[-60, -36], [-100, -70], [-120, -60]], 3, id + 420, 0.4); X.restore(); X.beginPath(); X.ellipse(lerp(420, 1500, u), 600, 16, 9, 0, 0, 6.283); X.fillStyle = P.ink; X.fill(); return; }
  if (kind === 'widow') { person(640, 690, 1.25, id + 300, 'grief', Math.max(I, 0.7), lt, { hood: true, dark: true }); return; }
  if (kind === 'street' && src === 'sneeze') { person(640, 690, 1.25, id + 300, 'sneeze', Math.max(I, seg(lt, 23.6, 24.0) * (1 - seg(lt, 24.5, 25))), lt, {}); return; }
  const n = 1 + (q + r) % 3;
  for (let i = 0; i < n; i++) person(260 + i * 380 + (hash(id, i) - 0.5) * 80, 690, 1.15, id + 500 + i * 30, f, I * (0.85 + 0.15 * hash(id, i + 3)), lt, { f: i % 2 ? -1 : 1, hood: (q + i) % 4 === 0, short: (r + i) % 2 === 0, dark: (q + r + i) % 3 === 1, runDir: q < 3 ? -1 : 1 });
}
function policeCell(q, r, s, lt, sh) {
  const id = 30000 + q * 100 + r * 1000; nightBase(id);
  for (let i = 0; i < 3; i++) shape(R(i * 440 - 20, 140 + hash(id, i) * 100, 400, 640), { lw: 2, id: id + 10 + i, h: [1.57, 3.4, 0.5] });
  ground(610, id + 20, true);
  if (sh.me && q === sh.me[0] && r === sh.me[1]) { bonhomius(640, 700, 1.3, 9600, { t: lt, look: -1, ra: [1.3, 1.7], la: [1.8, 1.4] }); return; }
  if (q === sh.src[0] && r === sh.src[1]) {
    const pc = cue(sh, 'punch').at, sw = seg(lt, pc - 0.35, pc), hit = seg(lt, pc, pc + 0.15) * (1 - seg(lt, pc + 3, pc + 4));
    const point = seg(lt, 12.6, 13.2);
    person(460, 700, 1.3, id + 300, null, 0, lt, { hf: [lerp(30, 140, sw) + point * 40, lerp(-112, -200, sw) + point * 20], dark: true, hood: true });
    person(820, 700, 1.3, id + 340, 'blow', hit, lt, { f: -1, dark: true, hood: true });
    return;
  }
  const n = 1 + (q + r) % 2;
  for (let i = 0; i < n; i++) person(380 + i * 420, 700, 1.2, id + 500 + i * 30, s.feel, s.I, lt, { f: q > sh.me[0] ? -1 : 1, hood: (q + i) % 3 === 0, short: (r + i) % 2 === 0 });
}

/* ================= single shots ================= */
const SHOTS = {};
function yardSet(lt) {
  X.fillStyle = P.paper; X.fillRect(-300, -300, 1900, 1400); X.save(); X.globalAlpha = 0.35; skyLines(-300, 470, 1200); X.restore();
  ball(1080, 110, 40, 100, PAT.f, 1.4);
  shape([[-200, 470], [1500, 470], [1500, 1000], [-200, 1000]], { lw: 1.6, id: 101, h: [0.05, 5.5, 0.45] });
  shape([[-160, 470], [-160, 140], [130, 20], [420, 140], [420, 470]], { lw: 2.2, id: 102, h: [1.57, 3.6, 0.5] });
  windowBox(0, 220, 120, 110, 103, true); shape(R(230, 300, 110, 170), { fill: PAT.d, lw: 2, id: 108 });
  for (let i = 0; i < 9; i++) { line([520 + i * 38, 470], [520 + i * 38, 380], 3, 110 + i, 0.2); ball(520 + i * 38, 376, 5, 120 + i, PAT.m, 1); } line([510, 400], [850, 400], 2, 130, 0.2);
  for (let i = 0; i < 26; i++) { const a = hash(140, i) * 6.283, r = 30 + hash(141, i) * 60; ball(1100 + Math.cos(a) * r * 1.4, 380 + Math.sin(a) * r * 0.8, 10 + hash(142, i) * 10, 150 + i, PAT.m, 1.2); }
  for (let i = 0; i < 8; i++) { X.beginPath(); X.arc(1060 + hash(160, i) * 100, 360 + hash(161, i) * 60, 6, 0, 6.283); X.fillStyle = P.red; X.fill(); }
}
SHOTS.yard = (lt, sd, sh) => {
  const co = cue(sh, 'collapse').at, rp = cue(sh, 'repair');
  const broken = seg(lt, co, co + 0.7, E.out) * (1 - seg(lt, rp.at, rp.to, E.io));
  const walkIn = seg(lt, 0, co);
  const tight = lt > 12.6 && talking(sh, 'B', lt);
  const c = tight ? { z: 1.6, x: 160, y: -70 } : { z: lerp(1.0, 1.1, seg(lt, 9, sd)), x: 0, y: 0 };
  cam(c, () => {
    yardSet(lt);
    const bx = lerp(1300, 860, walkIn);
    const trX = lt < rp.at ? lerp(300, 300, 0) : lerp(300, 620, seg(lt, rp.at - 1.2, rp.at));
    constructor_(trX, 640, 0.95, 400, { ra: lt > rp.at && lt < rp.to ? [0.1 + Math.sin(lt * 6) * 0.3, 0.6] : [1.5, 1.6], la: [1.4, 1.65], look: 1, mouth: sayAt(sh, 'T', lt), tilt: lt > rp.at && lt < rp.to ? 0.15 : 0 });
    bonhomius(bx, 660, 0.95, 500, { t: lt, broken, walk: lt < co, tubes: lt > rp.to, sparks: lt > co && lt < co + 1.6, mouth: sayAt(sh, 'B', lt), look: lt > rp.to ? -1 : 0, ra: lt > rp.to ? [1.9, 2.6] : [0.5, 1.2] });
  });
};
SHOTS.title = (lt, sd) => {
  X.fillStyle = P.paper; X.fillRect(0, 0, W, H);
  txt('ALTRUIZINE', CX, 120, 72, {}); txt('or, How Bonhomius Tried to Make Everyone Happy', CX, 184, 28, { italic: true });
  for (let i = 0; i < 9; i++) { const k = Math.min(1, Math.max(0, lt * 2.4 - Math.abs(i - 4) * 0.5)); person(200 + i * 110, 640, 0.95, 800 + i * 30, 'joy', k * (0.6 + 0.4 * Math.sin(lt * 3 + i)), lt, { short: i % 2 === 0, hood: i % 3 === 0, f: i < 4 ? 1 : -1 }); }
};
function cubeSpace(lt) {
  darkWall(-300, -300, 1900, 1400, 2.2); starfield(200, 200, -200, -200, 1700, 1100);
  const sq = (x, y, w, id, a) => { X.save(); X.translate(x, y); X.rotate(a); shape(R(-w / 2, -w / 2, w, w), { lw: 2.4, id, h: [0.3, 3, 0.5] }); shape([[-w / 2, -w / 2], [-w / 2 + w * 0.2, -w / 2 - w * 0.2], [w / 2 + w * 0.2, -w / 2 - w * 0.2], [w / 2, -w / 2]], { lw: 2, id: id + 1, h: [0, 2.4, 0.6] }); shape([[w / 2, -w / 2], [w / 2 + w * 0.2, -w / 2 - w * 0.2], [w / 2 + w * 0.2, w / 2 - w * 0.2], [w / 2, w / 2]], { lw: 2, id: id + 2, h: [1.57, 2, 0.7] }); X.restore(); };
  X.save(); X.translate(260, 220); X.rotate(lt * 0.05); X.beginPath(); X.rect(-70, -70, 140, 140); X.fillStyle = P.paper; X.fill(); X.lineWidth = 3; X.strokeStyle = P.ink; X.stroke(); for (let i = 0; i < 16; i++) { const a = i / 16 * 6.283; line([Math.cos(a) * 110, Math.sin(a) * 110], [Math.cos(a) * 160, Math.sin(a) * 160], 1.6, 210 + i, 0.2, P.paper); } X.restore();
  sq(780, 420, 300, 220, -0.08);
  for (const [dx, dy] of [[-150, -150], [150, -150], [-150, 150], [150, 150]]) { X.save(); X.translate(780, 420); X.rotate(-0.08); for (let i = 0; i < 3; i++) shape(R(dx - 18 + i * 12 - 6, dy - 30, 10, 14), { lw: 1, id: 230 + i + dx }); X.restore(); }
  X.save(); X.translate(780, 420); X.rotate(-0.08); txt('H.P.L.D.', 0, 0, 44, { italic: true }); X.restore();
  planet(1150, 600, 60, 240, false); for (let i = 0; i < 6; i++) { const a = hash(241, i) * 6.283; line([1150 + Math.cos(a) * 40, 600 + Math.sin(a) * 40], [1150 + Math.cos(a) * 52, 600 + Math.sin(a) * 52], 2, 242 + i, 0.4, P.paper); }
}
function lazy(x, y, s, id, lt, kind) {
  X.save(); X.translate(x, y); X.scale(s, s);
  figure({ x: 0, y: 0, s: 1, ang: kind === 'face' ? 0 : -1.5, id, hb: [-30, -110 + (kind === 'scratch' ? Math.sin(lt * 9) * 20 : 0)], hf: [30, -112], closed: true, short: kind === 'horn', hood: kind === 'face', dark: kind === 'incense' });
  if (kind === 'incense') for (let i = 0; i < 5; i++) { const u = ((lt * 0.4 + i / 5) % 1); X.beginPath(); X.arc(-200 + u * -40 + Math.sin(u * 6 + i) * 10, -24 - u * 120, 6 + u * 16, 0, 6.283); X.fillStyle = `rgba(235,227,207,${0.8 * (1 - u)})`; X.fill(); X.lineWidth = 0.8; X.strokeStyle = `rgba(28,24,20,${0.6 * (1 - u)})`; X.stroke(); }
  if (kind === 'face') { ball(10, -80, 18, id + 50, PAT.f, 1.6); X.beginPath(); X.arc(16, -82, 2, 0, 6.283); X.arc(4, -82, 2, 0, 6.283); X.fillStyle = P.ink; X.fill(); }
  if (kind === 'mandolin') { X.save(); X.translate(-120, -60); X.rotate(-0.4); X.beginPath(); X.ellipse(0, 0, 40, 28, 0, 0, 6.283); X.fillStyle = P.paper; X.fill(); X.lineWidth = 1.6; X.strokeStyle = P.ink; X.stroke(); line([30, 0], [110, 0], 6, id + 60, 0.2); X.restore(); }
  X.restore();
}
SHOTS.cube = (lt, sd, sh) => {
  if (lt < 5.6) { const z = lerp(1, 2.6, seg(lt, 1.2, 5.6, E.in)); cam({ z, x: 140 * seg(lt, 1.2, 5.6), y: 60 * seg(lt, 1.2, 5.6) }, () => cubeSpace(lt)); return; }
  const u = seg(lt, 5.6, sd);
  cam({ z: lerp(1.06, 1.0, u), x: lerp(-30, 30, u), y: 0 }, () => {
    X.fillStyle = P.paper; X.fillRect(-300, -300, 1900, 1400); X.save(); X.globalAlpha = 0.4; skyLines(-300, 400, 1100); X.restore();
    X.save(); X.translate(1080, 120); X.rotate(0.1); shape(R(-34, -34, 68, 68), { lw: 2, id: 300 }); X.restore();
    shape([[-300, 400], [1600, 400], [1600, 1000], [-300, 1000]], { lw: 1.4, id: 301 }); X.save(); path([[-300, 400], [1600, 400], [1600, 1000], [-300, 1000]]); X.clip(); for (let i = 0; i < 900; i++) { X.fillStyle = P.ink; X.fillRect(hash(302, i) * 1900 - 300, 400 + Math.pow(hash(303, i), 0.7) * 600, 1.3, 1.3); } X.restore();
    for (let i = 0; i < 9; i++) { const x = hash(310, i) * 1500 - 100, y = 430 + hash(311, i) * 60; line([x, y], [x + 30 * (hash(312, i) - 0.5), y - 30 - hash(313, i) * 40], 3, 314 + i, 0.4); }
    lazy(140, 560, 0.9, 400, lt, 'incense'); lazy(520, 640, 1.0, 430, lt, 'scratch'); lazy(1000, 600, 0.9, 460, lt, 'mandolin'); lazy(820, 520, 0.7, 490, lt, 'horn'); lazy(330, 480, 0.6, 520, lt, 'scratch');
    lazy(1180, 700, 1.1, 550, lt, 'face');
    const kx = lerp(700, 680, u); constructor_(kx, 700, 1.0, 600, { robe: true, ra: talking(sh, 'K', lt) ? [0.2, -0.3] : [1.4, 1.6], open: talking(sh, 'K', lt) ? 0.8 : 0, look: 1, lookY: 1, mouth: sayAt(sh, 'K', lt) });
  });
};
function console_(lt, sh) {
  darkWall(-300, -300, 1900, 1400, 2.2);
  for (let r = 0; r < 9; r++) for (let c = 0; c < 26; c++) { const x = -60 + c * 54, y = 20 + r * 44, on = hash(c * 31 + r, Math.floor(lt * 4) + c) > 0.55; X.beginPath(); X.arc(x, y, 7, 0, 6.283); X.fillStyle = on ? P.paper : PAT.d; X.fill(); X.lineWidth = 1; X.strokeStyle = P.paper; X.stroke(); }
  for (let i = 0; i < 6; i++) { const gx = 60 + i * 230, gy = 470; ball(gx, gy, 44, 700 + i, PAT.f, 2); X.beginPath(); X.arc(gx, gy, 36, 0, 6.283); X.fillStyle = P.paper; X.fill(); const na = lt * (1 + i * 0.7) + i; line([gx, gy], [gx + Math.cos(na) * 30, gy + Math.sin(na) * 30], 2, 710 + i, 0.05); }
  shape(R(440, 380, 400, 40), { lw: 2, id: 720 }); txt('DANGER: HIGHLY INEFFABLE', 640, 401, 20, { mono: true, bold: true });
  // the voice: a grille that opens with the words
  const e = sayAt(sh, 'G', lt); X.save(); X.translate(640, 220); ball(0, 0, 120, 730, PAT.d, 3, P.ink); for (let k = 0; k < 7; k++) { X.beginPath(); X.arc(0, 0, 20 + k * 14 + e * 6, 0, 6.283); X.lineWidth = 1.4 + e * 2; X.strokeStyle = P.paper; X.stroke(); } X.restore();
  shape(R(-300, 560, 1900, 600), { lw: 2, id: 740, h: [0, 3, 0.5] });
  shape(R(980, 520, 160, 40), { fill: P.ink, lw: 1, id: 741 });
}
SHOTS.gnosto = (lt, sd, sh) => {
  const tight = onLine(sh, lt, 0.6, 1.4), pr = cue(sh, 'print').at;
  const c = tight ? { z: 2.3, x: 0, y: -140 } : lt > pr - 0.4 ? { z: 1.6, x: 420, y: 150 } : { z: lerp(1.0, 1.08, seg(lt, 0, sd)), x: 0, y: 0 };
  cam(c, () => {
    console_(lt, sh);
    const out = seg(lt, pr, pr + 2.6); if (out > 0) { shape(R(1000, 540 - 140 * out, 120, 140 * out), { lw: 1.6, id: 750 }); for (let i = 0; i < Math.floor(out * 6); i++) line([1012, 550 - 140 * out + i * 20], [1100 - (i % 3) * 14, 550 - 140 * out + i * 20], 1.2, 751 + i, 0.2); }
    constructor_(380, 720, 1.05, 600, { robe: true, f: 1, ra: talking(sh, 'K', lt) ? [-0.9, -1.0] : [1.2, 0.4], la: [1.3, 0.5], look: 1, lookY: -1, mouth: sayAt(sh, 'K', lt) });
    bonhomius(880, 740, 0.9, 500, { t: lt, tubes: true, look: -1, lookY: -1, mouth: sayAt(sh, 'B', lt), ra: talking(sh, 'B', lt) ? [-1.0, -1.2] : [1.9, 2.6], open: talking(sh, 'B', lt) ? 0.8 : 0 });
  });
};
SHOTS.card = (lt, sd) => {
  darkWall(0, 0, W, H, 3);
  X.save(); X.translate(CX, CY); X.rotate(0.02); X.scale(1 + lt * 0.008, 1 + lt * 0.008);
  shape(R(-380, -260, 760, 520), { lw: 2, id: 800 });
  const T_ = ['ALTRUIZINE.', 'A metapsychotropic transmitting agent.', 'Duplicates in others, within fifty yards,', 'whatever one feels. The receivers relay the', 'signal back, so it grows with the number', 'of persons near. Walls do not weaken it.', 'Water-soluble. Tasteless. Odorless.', 'One millimicrogram serves 100,000 persons.', 'Has no effect on robots or plants.', 'No responsibility is assumed for results.'];
  let n = Math.floor(lt * 40);
  T_.forEach((l, i) => { if (n <= 0) return; const s = l.slice(0, n); n -= l.length; txt(s, -340, -220 + i * 46, i === 0 ? 30 : 23, { mono: true, align: 'left', bold: i === 0 }); });
  X.restore();
};
SHOTS.inn = (lt, sd, sh) => { const focus = lt < 4.2 ? sh.well : sh.src; grid(sh, lt, (q, r, s, t) => innCell(q, r, s, t, sh), focus); };
SHOTS.city = (lt, sd, sh) => grid(sh, lt, (q, r, s, t) => cityCell(q, r, s, t, sh), sh.src);
SHOTS.police = (lt, sd, sh) => { const focus = lt < 5.0 ? sh.me : sh.src; const tight = onLine(sh, lt, 0.4, 1.4); if (tight) { const op = sh.open; const s2 = { ...sh, open: [op[0], op[0] + 0.001] }; grid({ ...s2 }, lt, (q, r, s, t) => policeCell(q, r, s, t, sh), sh.src); return; } grid(sh, lt, (q, r, s, t) => policeCell(q, r, s, t, sh), focus); };
SHOTS.bridge = (lt, sd, sh) => {
  const sp = cue(sh, 'spill').at, pan = seg(lt, 6.4, sd - 0.5, E.io);
  cam({ z: 1.0, x: pan * 1500, y: 0 }, () => {
    X.fillStyle = P.paper; X.fillRect(-300, -300, 3400, 1400); for (let y = -300; y < 430; y += 4) { X.fillStyle = P.ink; X.globalAlpha = 0.35; X.fillRect(-300, y, 3400, 0.5 + 1.1 * clamp((1100 - y) / 1100)); } X.globalAlpha = 1;
    shape([[-300, 430], [3200, 430], [3200, 1000], [-300, 1000]], { lw: 1.4, id: 900, h: [0.05, 5, 0.45] });
    const riv = []; for (let i = 0; i <= 40; i++) riv.push([-300 + i * 90, 560 + Math.sin(i * 0.5) * 30 - i * 2]);
    X.beginPath(); riv.forEach(([x, y], i) => (i ? X.lineTo(x, y) : X.moveTo(x, y))); X.lineWidth = 90; X.strokeStyle = P.paper; X.lineCap = 'round'; X.stroke(); X.lineWidth = 1.4; X.strokeStyle = P.ink; X.lineCap = 'butt';
    for (const off of [-45, 45]) ink(riv.map(([x, y]) => [x, y + off]), 1.4, 901 + off, 0.4);
    for (let i = 0; i < 40; i++) { const x = ((hash(910, i) * 3400 + lt * 60) % 3400) - 300, y = 560 + Math.sin((x + 300) / 90 * 0.5) * 30 - (x + 300) / 90 * 2 + (hash(911, i) - 0.5) * 60; line([x, y], [x + 30, y], 1, 912 + i, 0.2); }
    // the white plume carried downstream
    if (lt > sp + 0.5) { const reach = (lt - sp - 0.5) * 160; X.save(); X.globalAlpha = 0.85; for (let i = 0; i < 60; i++) { const d = i / 60 * reach, ix = Math.min(40, Math.floor((d + 640 + 300) / 90)), [x, y] = riv[ix] || riv[40]; X.beginPath(); X.ellipse(640 + d, y + (hash(920, i) - 0.5) * 50, 12 + hash(921, i) * 16, 4, 0, 0, 6.283); X.fillStyle = P.paper; X.fill(); X.lineWidth = 0.8; X.strokeStyle = P.ink; X.stroke(); } X.restore(); }
    // the bridge
    shape([[440, 470], [840, 470], [840, 500], [780, 500], [780, 620], [500, 620], [500, 500], [440, 500]], { lw: 2.2, id: 930, h: [1.57, 3, 0.5] }); X.beginPath(); X.ellipse(640, 620, 130, 100, 0, Math.PI, 0); X.fillStyle = P.paper; X.fill(); X.lineWidth = 2; X.strokeStyle = P.ink; X.stroke();
    for (let i = 0; i < 9; i++) line([450 + i * 46, 470], [450 + i * 46, 430], 3, 931 + i, 0.2); line([440, 430], [840, 430], 3, 940, 0.2);
    // the city on the horizon at the river's end
    for (let i = 0; i < 18; i++) tower(2500 + i * 40, 440, 18 + hash(950, i) * 14, 60 + hash(951, i) * 120, 960 + i * 10, { t: lt, flag: i % 3 === 0 });
    const walk = seg(lt, 0, sp - 0.6), bx = lerp(460, 660, walk);
    bonhomius(bx, 470, 0.62, 500, { t: lt, walk: lt < sp - 0.6, look: lt > sp ? 1 : 0, lookY: lt > sp ? 1 : 0, ra: lt > sp ? [0.8, 1.6] : [1.5, 1.6] });
    const sx = bx + 50, open_ = seg(lt, sp, sp + 0.4); X.save(); X.translate(sx + open_ * 60, 380 + open_ * 70); X.rotate(open_ * 1.2); shape(R(-24, -18, 48, 36), { lw: 1.6, id: 970, h: [0, 2.4, 0.6] }); X.restore();
    if (lt > sp + 0.2 && lt < sp + 3) for (let i = 0; i < 40; i++) { const u = ((lt - sp) * 1.4 + i / 40) % 1; X.beginPath(); X.arc(sx + 70 + (hash(980, i) - 0.5) * 30, 450 + u * 120, 2.4, 0, 6.283); X.fillStyle = P.paper; X.fill(); X.lineWidth = 0.6; X.strokeStyle = P.ink; X.stroke(); }
  });
};
SHOTS.cannon = (lt, sd, sh) => {
  const fi = cue(sh, 'fire').at, fl = sh.lines.find((l) => l.line), up = seg(lt, fi, fi + 6, E.out);
  if (onLine(sh, lt, 0.4, 1.6)) { darkWall(0, 0, W, H, 2); starfield(140, 1100); bonhomius(640, 690, 1.5, 500, { t: lt, broken: 0.08, look: 0, lookY: 1, mouth: sayAt(sh, 'B', lt) }); return; }
  if (lt < fi + 3.2) {
    cam({ z: 1.0, x: 0, y: -up * 260 }, () => {
      darkWall(-300, -600, 1900, 1400, 2.2); starfield(160, 1000, -200, -600, 1700, 900);
      shape(R(-300, 520, 1900, 600), { lw: 2, id: 1001, h: [0.05, 3, 0.5] }); for (let i = 0; i < 20; i++) shape(R(-300 + i * 100, 490, 60, 30), { lw: 1, id: 1002 + i, h: [1.57, 3, 0.6] });
      X.save(); X.translate(360, 470); X.rotate(-0.5); shape(R(0, -50, 340, 100), { lw: 2.4, id: 1030, h: [0.05, 3, 0.6], sh: R(0, 10, 340, 40), sh2: [0, 2, 0.8] }); X.restore(); ball(380, 500, 60, 1031, PAT.m, 2);
      for (let i = 0; i < 4; i++) person(120 + i * 70, 540, 0.6, 1040 + i * 30, null, 0, lt, { dark: true, hood: true });
      if (lt > fi) { for (let i = 0; i < 14; i++) { const u = clamp((lt - fi) / 2.5), a = -0.5 + (hash(1060, i) - 0.5) * 0.5, r = 340 + u * 300 * hash(1061, i); X.beginPath(); X.arc(360 + Math.cos(a) * r, 470 + Math.sin(a) * r, 30 + u * 60 * hash(1062, i), 0, 6.283); X.fillStyle = `rgba(235,227,207,${0.9 * (1 - u * 0.6)})`; X.fill(); X.lineWidth = 1; X.strokeStyle = 'rgba(28,24,20,.6)'; X.stroke(); } }
      if (lt > fi) { const u = (lt - fi) / 3.2; bonhomius(lerp(660, 1100, u), lerp(300, -500, u), lerp(0.5, 0.3, u), 500, { t: lt, broken: 0.35, sparks: true }); }
    });
    return;
  }
  // looking back: the planet, and the rivers carrying it on
  const k = seg(lt, fi + 3.2, fl.t0 - 0.6);
  darkWall(0, 0, W, H, 2); starfield(180, 1100);
  ball(640, 820, 520, 1100, PAT.f, 3);
  X.save(); circ(640, 820, 520, 1100); X.clip();
  const rivers = [[[420, 420], [470, 520], [560, 600], [620, 720]], [[620, 720], [700, 640], [800, 600], [900, 520]], [[620, 720], [560, 820], [420, 900]], [[800, 600], [880, 700], [1000, 760]], [[470, 520], [380, 600], [300, 700]]];
  rivers.forEach((rv, i) => { ink(rv, 9, 1110 + i, 0.6); const u = clamp(k * 1.6 - i * 0.25); if (u <= 0) return; const n = Math.floor(rv.length * u * 10) / 10; X.beginPath(); for (let j = 0; j < rv.length - 1; j++) { const a = rv[j], b = rv[j + 1], uu = clamp(n - j); if (uu <= 0) break; if (j === 0) X.moveTo(a[0], a[1]); X.lineTo(lerp(a[0], b[0], uu), lerp(a[1], b[1], uu)); } X.lineWidth = 4; X.strokeStyle = P.paper; X.lineCap = 'round'; X.stroke(); X.lineCap = 'butt'; });
  X.restore();
  const u2 = clamp((lt - fi - 3.2) / 10); bonhomius(lerp(1000, 1180, u2), lerp(160, 100, u2), 0.3, 500, { t: lt, broken: 0.35 });
};
SHOTS.yard2 = (lt, sd, sh) => {
  cam({ z: lerp(1.1, 1.18, seg(lt, 0, sd)), x: 60, y: -20 }, () => {
    yardSet(lt);
    constructor_(560, 640, 0.95, 400, { ra: [1.4, 1.65], la: [1.4, 1.65], look: 1, mouth: sayAt(sh, 'T', lt), tilt: lt > sh.lines[1].t1 + 0.4 ? 0.1 : 0 });
    bonhomius(840, 660, 0.95, 500, { t: lt, tubes: true, look: -1, mouth: sayAt(sh, 'B', lt), ra: [1.9, 2.6] });
  });
};
SHOTS.end = (lt) => { X.fillStyle = P.paper; X.fillRect(0, 0, W, H); X.globalAlpha = seg(lt, 0.4, 1.6); txt('ALTRUIZINE', CX, 310, 44, {}); txt('after Stanisław Lem, The Cyberiad', CX, 372, 24, { italic: true }); X.globalAlpha = 1; };

/* ================= frame loop ================= */
let T = null;
window.__render = async (f) => {
  const t = f / 24; BOIL = Math.floor(f / 2);
  let i = 0; for (let j = 0; j < T.shots.length; j++) if (t >= T.shots[j].t0) i = j;
  const sh = T.shots[i], lt = t - sh.t0, sd = sh.d;
  X.setTransform(1, 0, 0, 1, 0, 0); X.fillStyle = P.paper; X.fillRect(0, 0, W, H);
  X.save(); path(R(PX0, PY0, PX1 - PX0, PY1 - PY0)); X.clip();
  SHOTS[sh.shot](lt, sd, sh);
  X.restore(); X.setTransform(1, 0, 0, 1, 0, 0);
  const fade = sh.shot === 'title' ? Math.max(1 - seg(lt, 0, 0.6), seg(lt, sd - 0.6, sd)) : sh.shot === 'yard' ? 1 - seg(lt, 0, 0.8) : 0;
  if (fade > 0) { X.fillStyle = P.paper; X.globalAlpha = fade; X.fillRect(0, 0, W, H); X.globalAlpha = 1; }
  border();
};
(async () => {
  T = await (await fetch('timing/al.json')).json();
  await document.fonts.ready; await Promise.all(['IM Fell English', 'IBM Plex Mono'].map((n) => document.fonts.load(`20px "${n}"`)));
  X = document.getElementById('film').getContext('2d');
  window.__NF = Math.ceil(T.dur * 24); window.__T = T; window.__ready = true;
})();
