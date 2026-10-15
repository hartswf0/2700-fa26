/* The Dragons of Probability: engraved film, sixth in the Seventh Sally lineage. Dragons are drawn as dots whose density is their probability. */
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
const cue = (sh, k, i = 0) => sh.cues.filter((c) => c.k === k)[i];
const cues = (sh, k) => sh.cues.filter((c) => c.k === k);
function cam(c, fn) { X.save(); X.translate(CX, CY); X.scale(c.z, c.z); X.translate(-CX - c.x, -CY - c.y); fn(); X.restore(); }
const ON = (x, y, z) => ({ z, x: x - CX, y: y - CY });
function blendCam(a, b, u) { return { z: lerp(a.z, b.z, u), x: lerp(a.x, b.x, u), y: lerp(a.y, b.y, u) }; }
function camFor(lt, plan) { let c = plan[0][1]; for (let i = 1; i < plan.length; i++) { const [t0, cc] = plan[i]; if (lt >= t0) c = blendCam(c, cc, seg(lt, t0, t0 + 0.7, E.io)); } return c; }
function P_(sh, name, lt) { const ks = sh.prob && sh.prob[name]; if (!ks) return 0; if (lt <= ks[0][0]) return ks[0][1]; for (let i = 0; i < ks.length - 1; i++) { const a = ks[i], b = ks[i + 1]; if (lt >= a[0] && lt <= b[0]) return b[0] > a[0] ? lerp(a[1], b[1], (lt - a[0]) / (b[0] - a[0])) : b[1]; } return ks[ks.length - 1][1]; }

function darkWall(x0, y0, x1, y1, sp = 2.6) { X.fillStyle = P.paper; X.fillRect(x0, y0, x1 - x0, y1 - y0); X.save(); path(R(x0, y0, x1 - x0, y1 - y0)); X.clip(); for (let y = y0; y < y1; y += sp) { X.fillStyle = P.ink; X.fillRect(x0, y, x1 - x0, 0.9 + 0.5 * hash(y | 0, 5)); } X.restore(); }

/* ================= probability rendering =================
   draw(fn) renders a thing into an offscreen canvas with the current transform;
   then each 4-pixel cell of it becomes a dot if p exceeds that cell's fixed threshold. */
let OFF = null, OX = null;
function probable(p, fn, o = {}) {
  if (p <= 0.003) return;
  if (p >= 0.995) { fn(); return; }
  if (!OFF) { OFF = document.createElement('canvas'); OFF.width = W; OFF.height = H; OX = OFF.getContext('2d', { willReadFrequently: true }); }
  const tr = X.getTransform(), keep = X; OX.setTransform(1, 0, 0, 1, 0, 0); OX.clearRect(0, 0, W, H); OX.setTransform(tr);
  X = OX; fn(); X = keep;
  // bounding box of what was drawn, from the transform of a generous box
  const img = OX.getImageData(0, 0, W, H).data, c = 4;
  X.save(); X.setTransform(1, 0, 0, 1, 0, 0);
  const solid = clamp((p - 0.88) / 0.11);
  if (solid > 0) { X.globalAlpha = solid; X.drawImage(OFF, 0, 0); X.globalAlpha = 1; }
  const pd = p * (1 - solid);
  X.fillStyle = P.ink;
  for (let y = 0; y < H; y += c) for (let x = 0; x < W; x += c) {
    const i = (y * W + x) * 4; if (img[i + 3] < 40) continue;
    const th = hash(x + (o.seed || 0), y) * 0.92 + hash(x, y + BOIL) * 0.08;
    if (th > pd) continue;
    const lum = (img[i] + img[i + 1] + img[i + 2]) / 765;
    if (lum < 0.7) { X.fillStyle = P.ink; X.fillRect(x, y, 2.2, 2.2); }
    else if (th < pd * 0.55) { X.fillStyle = o.light || P.paper; X.fillRect(x, y, 2.6, 2.6); X.fillStyle = P.ink; X.fillRect(x + 2.6, y + 2.6, 0.9, 0.9); }
  }
  X.restore();
}

/* ================= the dragon =================
   local coords facing right, ground at y=0. o: neck angle, jaw, flap, sway, rear, scratch, walk, kneel, tailOff, mane, hood */
function dragon(x, y, s, id, o = {}) {
  X.save(); X.translate(x, y); X.scale(s * (o.f || 1), s);
  const t = o.t || 0, rear = o.rear || 0, kneel = o.kneel || 0, wk = o.walk || 0, sc = o.scratch || 0;
  X.translate(0, kneel * 70);
  X.translate(-90, -120); X.rotate(-rear * 0.55); X.translate(90, 120);
  // tail: chain of balls
  const tailN = o.tailOff ? 7 : 16;
  for (let i = tailN - 1; i >= 0; i--) { const u = i / 15, tx = -150 - u * 300, ty = -130 + u * 110 + Math.sin(u * 4 + t * 1.4 + (o.sway || 0)) * 30 * u; ball(tx, ty, 26 - u * 20, id + 200 + i, PAT.m, 1.3); }
  if (o.tailOff) { X.beginPath(); X.arc(-150 - 6 / 15 * 300, -130 + 6 / 15 * 110, 12, 0, 6.283); X.fillStyle = PAT.d; X.fill(); }
  // far legs (darker)
  const leg = (hx, hy, ph, near, lift) => { const st = Math.sin(t * 5 + ph) * 26 * wk, up = Math.max(0, Math.cos(t * 5 + ph)) * 18 * wk; const fx = hx + st, fy = -up - lift; const kx = (hx + fx) / 2 + (hx > 0 ? 18 : -18), ky = (hy + fy) / 2 - 10;
    cap(hx, hy, kx, ky, near ? 22 : 18, id + 300 + hx); cap(kx, ky, fx, fy - 6, near ? 18 : 14, id + 310 + hx); ball(kx, ky, near ? 13 : 10, id + 320 + hx, PAT.f, 1.3);
    for (let k = -1; k <= 1; k++) ink([[fx, fy - 6], [fx + 14 + k * 6, fy + 2], [fx + 22 + k * 8, fy - 2]], 2.2, id + 330 + hx + k, 0.2); };
  leg(70, -110, 2.0, false, 0); leg(-110, -110, 0.6, false, 0);
  // wings, behind the body
  const fl = Math.sin(t * 2.4) * (o.flap ?? 0.3);
  const wing = (ox, oy, k) => { const tips = [[ox - 120, oy - 210 - fl * 80], [ox - 20, oy - 260 - fl * 90], [ox + 90, oy - 230 - fl * 70], [ox + 170, oy - 150 - fl * 40]]; const pts = [[ox, oy], ...tips, [ox + 110, oy - 20]];
    X.save(); X.globalAlpha = k ? 0.75 : 1; shape(pts.map(([a, b], i) => i && i < pts.length - 1 ? [a, b + (i % 2 ? 30 : 0)] : [a, b]), { lw: 1.6, id: id + 400 + k, h: [1.2, 3.4, 0.5] }); for (const tp of tips) line([ox, oy], tp, 3, id + 410 + k + tp[0], 0.2); ball(ox, oy, 9, id + 420 + k, PAT.m, 1.2); X.restore(); };
  if (o.wings !== false) { wing(10, -200, 1); }
  // body
  X.save(); X.beginPath(); X.ellipse(-20, -150, 160, 82, 0.08, 0, 6.283); X.fillStyle = P.paper; X.fill(); X.clip(); hatch(1.5, 3.4, 0.55, [-200, -240, 160, -60]); X.beginPath(); X.ellipse(-30, -110, 150, 50, 0.08, 0, 6.283); X.fillStyle = P.paper; X.globalAlpha = 0.65; X.fill(); X.globalAlpha = 1;
  for (let i = 0; i < 9; i++) ink([[-150 + i * 34, -90], [-140 + i * 34, -150], [-150 + i * 34, -205]], 1, id + 430 + i, 0.6); X.restore();
  X.beginPath(); X.ellipse(-20, -150, 160, 82, 0.08, 0, 6.283); X.lineWidth = 2.4; X.strokeStyle = P.ink; X.stroke();
  for (let i = 0; i < 8; i++) shape([[-120 + i * 32, -226 + Math.abs(i - 4) * 4], [-108 + i * 32, -250 + Math.abs(i - 4) * 4], [-96 + i * 32, -224 + Math.abs(i - 4) * 4]], { lw: 1.2, id: id + 440 + i, h: [0.5, 2.4, 0.6] });
  if (o.wings !== false) wing(40, -210, 0);
  // near legs; the hind one can come up to scratch
  leg(90, -110, 0.0, true, 0);
  if (sc > 0) { const hx = -100, hy = -120, kx = -40 + sc * 30, ky = -150 - sc * 40, fx = 20 + sc * 90 + Math.sin(t * 22) * 12 * sc, fy = -200 - sc * 90; cap(hx, hy, kx, ky, 22, id + 350); cap(kx, ky, fx, fy, 18, id + 351); ball(kx, ky, 13, id + 352, PAT.f, 1.3); for (let k = -1; k <= 1; k++) ink([[fx, fy], [fx + 14, fy + k * 8], [fx + 22, fy + k * 10 - 4]], 2.2, id + 353 + k, 0.2); }
  else leg(-90, -110, 3.4, true, 0);
  // neck and head
  const na = (o.neck ?? -1.0) + Math.sin(t * 0.9) * 0.05, L = 230;
  for (let i = 0; i < 9; i++) { const u = i / 8, bend = Math.sin(u * Math.PI) * 30; const nx = 110 + Math.cos(na) * L * u - Math.sin(na) * bend * 0.4, ny = -190 + Math.sin(na) * L * u; ball(nx, ny, 34 - u * 12, id + 500 + i, PAT.m, 1.6); if (o.mane) for (let k = 0; k < 4; k++) ink([[nx - 10 + k * 6, ny - 20], [nx - 26 + k * 4 + Math.sin(t * 3 + i + k) * 6, ny + 10], [nx - 30 + k * 6, ny + 40 + hash(id + i, k) * 20]], 1.1, id + 520 + i * 4 + k, 0.5); }
  const hx = 110 + Math.cos(na) * L, hy = -190 + Math.sin(na) * L, ha = na + 1.25 + (o.headTilt || 0), jaw = o.jaw || 0;
  X.save(); X.translate(hx, hy); X.rotate(ha);
  shape([[-20, 26], [110, 30], [130, 44], [100, 56], [10, 54], [-30, 50]].map(([a, b]) => [a, b - 30 + jaw * 30 * (b > 40 ? 1 : 0)]), { lw: 2, id: id + 600, h: [0.2, 3, 0.55] });
  X.save(); X.rotate(jaw * 0.5); shape([[-10, 20], [120, 26], [126, 40], [-20, 42]], { lw: 2, id: id + 601, h: [0.2, 3, 0.55] }); for (let i = 0; i < 9; i++) shape([[10 + i * 12, 20], [16 + i * 12, 8], [22 + i * 12, 20]], { lw: 1, id: id + 610 + i }); X.restore();
  shape([[-40, -10], [40, -40], [120, -6], [134, 18], [-30, 28]], { lw: 2.2, id: id + 620, h: [0.1, 2.8, 0.55] });
  for (let i = 0; i < 9; i++) shape([[20 + i * 11, 18], [26 + i * 11, 32], [32 + i * 11, 18]], { lw: 1, id: id + 630 + i });
  ball(34, -10, 12, id + 640, PAT.f, 1.6); X.beginPath(); X.arc(38, -10, 4, 0, 6.283); X.fillStyle = P.ink; X.fill();
  line([-10, -24], [-56, -70], 4, id + 641, 0.3); line([10, -30], [-20, -86], 3, id + 642, 0.3);
  for (let i = 0; i < 6; i++) ink([[-30, -10 + i * 6], [-70 - i * 6 + Math.sin(t * 3 + i) * 6, -20 + i * 14], [-90 - i * 4, -4 + i * 18]], 1.2, id + 650 + i, 0.5);
  X.restore();
  if (o.yawn) { X.save(); X.translate(hx, hy); X.globalAlpha = 0.5; for (let i = 0; i < 3; i++) { X.beginPath(); X.arc(70 + i * 20, -60 - i * 26, 6 + i * 3, 0, 6.283); X.lineWidth = 1; X.strokeStyle = P.ink; X.stroke(); } X.restore(); }
  X.restore();
  return { head: [x + (hx - 0) * s * (o.f || 1), y + hy * s] };
}

/* ================= props and people ================= */
function crownOn(x, y, s, id) { const p = [[-26, 0], [-30, -30], [-14, -12], [0, -36], [14, -12], [30, -30], [26, 0]].map(([a, b]) => [x + a * s, y + b * s]); shape(p, { lw: 1.4, id, h: [0.3, 2.4, 0.5] }); }
function counterDial(x, y, r, p, id, o = {}) { // the dragon counter
  ball(x, y, r, id, PAT.f, 2); X.beginPath(); X.arc(x, y, r * 0.82, 0, 6.283); X.fillStyle = P.paper; X.fill(); X.lineWidth = 1; X.strokeStyle = P.ink; X.stroke();
  for (let i = 0; i <= 10; i++) { const a = Math.PI * (0.8 + 1.4 * i / 10); line([x + Math.cos(a) * r * 0.6, y + Math.sin(a) * r * 0.6], [x + Math.cos(a) * r * (i % 5 ? 0.72 : 0.78), y + Math.sin(a) * r * (i % 5 ? 0.72 : 0.78)], i % 5 ? 0.8 : 1.6, id + i, 0.02); }
  if (r > 30) { txt('0', x + Math.cos(Math.PI * 0.8) * r * 0.45, y + Math.sin(Math.PI * 0.8) * r * 0.45, r * 0.18, { mono: true }); txt('1', x + Math.cos(Math.PI * 2.2) * r * 0.45, y + Math.sin(Math.PI * 2.2) * r * 0.45, r * 0.18, { mono: true }); txt('DRAGONS', x, y + r * 0.42, r * 0.12, { mono: true, bold: true }); }
  const jit = (o.wild ? Math.sin(GT * 31) * 0.4 + Math.sin(GT * 17) * 0.3 : 0) + (hash(id, BOIL) - 0.5) * 0.02 * Math.min(1, p * 3);
  const a = Math.PI * (0.8 + 1.4 * clamp(p + jit)); X.beginPath(); X.moveTo(x, y); X.lineTo(x + Math.cos(a) * r * 0.74, y + Math.sin(a) * r * 0.74); X.lineWidth = Math.max(1.4, r * 0.05); X.strokeStyle = P.red; X.stroke(); ball(x, y, r * 0.08, id + 20, PAT.m, 1);
}
function amplifier(x, y, s, p, t, id) {
  X.save(); X.translate(x, y); X.scale(s, s);
  shape(R(-90, -180, 180, 180), { lw: 2.2, id, h: [1.57, 3, 0.5] }); shape(R(-60, -320, 30, 140), { lw: 1.6, id: id + 1, h: [1.57, 2.4, 0.6] }); shape(R(30, -280, 26, 100), { lw: 1.6, id: id + 2, h: [1.57, 2.4, 0.6] });
  line([-45, -320], [-45, -380], 3, id + 3); ball(-45, -392, 18, id + 4, PAT.m, 1.4); for (let i = 0; i < 4; i++) { X.beginPath(); X.ellipse(-45, -330 + i * 22, 28 + p * 10, 6, 0, 0, 6.283); X.lineWidth = 1.2; X.strokeStyle = P.ink; X.stroke(); }
  X.globalAlpha = 0.5 + 0.5 * p; for (let i = 0; i < 3; i++) { X.beginPath(); X.ellipse(-45, -392, 30 + i * 14 + Math.sin(t * 8 + i) * 4 * p, 10 + i * 4, 0, 0, 6.283); X.lineWidth = 1; X.stroke(); } X.globalAlpha = 1;
  counterDial(0, -100, 52, p, id + 20);
  // the scaffold of balls and rods behind (plate 6)
  for (const [a, b] of [[[-150, -420], [-150, -40]], [[-150, -420], [-60, -480]], [[-60, -480], [20, -430]], [[-150, -260], [-90, -300]], [[-150, -340], [-210, -380]]]) line(a, b, 2.4, id + 30 + a[0] + b[1], 0.2);
  for (const [a, b, r] of [[-150, -420, 14], [-60, -480, 18], [20, -430, 12], [-90, -300, 12], [-210, -380, 16], [-150, -260, 10]]) ball(a, b, r, id + 40 + a + b, PAT.f, 1.3);
  X.restore();
}
function negGun(x, y, s, id, recoil = 0) { X.save(); X.translate(x - recoil * 20, y); X.scale(s, s); shape(R(0, -12, 90, 24), { lw: 1.8, id, h: [0, 2.4, 0.6] }); for (let i = 0; i < 4; i++) X.beginPath(), X.ellipse(96 + i * 10, 0, 6 + i * 4, 10 + i * 6, 0, 0, 6.283), X.lineWidth = 1.2, X.strokeStyle = P.ink, X.stroke(); shape(R(-30, -20, 34, 40), { lw: 1.6, id: id + 1, h: [0.78, 2.4, 0.6] }); X.restore(); }
function klap(x, y, s, sh, lt, o = {}) { const sp = sh ? talking(sh, 'K', lt) : false, e = sh ? sayAt(sh, 'K', lt) : 0; constructor_(x, y, s, 600, { robe: true, f: o.f || 1, seated: o.seated, ra: o.ra || (sp ? [0.1 - e * 0.5, -0.5 - e * 0.4] : [1.5, 1.6]), la: o.la || [1.4, 1.65], open: o.open ?? (sp ? 0.8 : 0), look: o.look ?? 1, lookY: o.lookY || 0, mouth: e, tilt: o.tilt || 0, walk: o.walk }); if (o.dial !== undefined) counterDial(x + 2 * s * (o.f || 1), y - 196 * s, 14 * s, o.dial, 690, o); }
function trurl(x, y, s, sh, lt, o = {}) { const sp = sh ? talking(sh, 'T', lt) : false, e = sh ? sayAt(sh, 'T', lt) : 0; constructor_(x, y, s, 400, { f: o.f || 1, ra: o.ra || (sp ? [-0.3 - e * 0.3, -0.2 - e * 0.4] : [1.5, 1.6]), la: o.la || [1.4, 1.65], open: sp ? 0.8 : 0, look: o.look ?? 1, lookY: o.lookY || 0, mouth: e, tilt: o.tilt || 0, walk: o.walk }); }
function hatchSky(y0, y1) { X.save(); X.globalAlpha = 0.5; skyLines(y0, y1, y1 + 600); X.restore(); }
function mountains(y, id, k = 1) { X.beginPath(); X.moveTo(-400, 900); X.lineTo(-400, y); for (let i = 0; i <= 30; i++) X.lineTo(-400 + i * 70, y - Math.abs(Math.sin(i * 0.9 + id)) * 160 * k - hash(id, i) * 80 * k); X.lineTo(1700, 900); X.closePath(); X.fillStyle = P.paper; X.fill(); X.lineWidth = 1.6; X.strokeStyle = P.ink; X.stroke(); X.save(); X.clip(); hatch(1.1, 4.6, 0.5, [-400, y - 300, 1700, 900]); X.restore(); }
function sack(x, y, r, id) { X.beginPath(); X.ellipse(x, y, r, r * 1.1, 0, 0, 6.283); X.fillStyle = P.paper; X.fill(); X.lineWidth = 1.6; X.strokeStyle = P.ink; X.stroke(); X.save(); X.clip(); hatch(0.6, 3, 0.6, [x - r, y - r * 1.2, x + r, y + r]); X.restore(); line([x - r * 0.3, y - r * 1.05], [x + r * 0.3, y - r * 1.05], 3, id, 0.2); }
function porter(x, y, s, id, lt, o = {}) { const step = Math.sin(lt * 4 + id) * 0.5; sack(x - 36 * s, y - 150 * s, 36 * s, id + 90); figure({ x, y, s, f: o.f || 1, id, ang: 0.16, ph: lt * 4 + id, walk: 0.5, hb: [-34, -170], hf: [24, -130], hood: o.hood, short: o.short, dark: o.dark, closed: o.closed }); if (o.mouth) { X.save(); X.translate(x, y); X.rotate(0.16); X.scale(s, s); X.beginPath(); X.ellipse(13, -190, 4, 2 + o.mouth * 6, 0, 0, 6.283); X.fillStyle = P.ink; X.fill(); X.restore(); } void step; }

/* ================= shots ================= */
const SHOTS = {};
SHOTS.lab = (lt, sd, sh) => {
  const pA = P_(sh, 'A', lt), L_ = sh.lines, lu = cue(sh, 'lunge').at;
  const c = camFor(lt, [[0, ON(640, 360, 1.15)], [L_[1].t0, ON(560, 380, 1.0)], [L_[2].t0 - 0.3, ON(420, 470, 1.5)], [L_[2].t1 + 0.4, ON(640, 360, 1.0)], [lu - 0.2, ON(560, 340, 1.12)], [L_[5].t0 - 0.2, ON(640, 360, 0.96)]]);
  cam(c, () => {
    darkWall(-300, -300, 1700, 1200, 2.8); shape(R(-300, 600, 1900, 400), { lw: 1.6, id: 100, h: [0.02, 4, 0.5] });
    for (let i = 0; i < 5; i++) line([-300, 610 + i * 22], [1700, 610 + i * 22], 0.8, 101 + i, 0.2);
    amplifier(340, 640, 1.0, pA, lt, 200);
    const back = seg(lt, lu, lu + 0.6) * (1 - seg(lt, cue(sh, 'down').to, cue(sh, 'down').to + 1.2));
    const dl = cue(sh, 'dial');
    trurl(lerp(470, 440, back), 650, 0.95, sh, lt, { ra: lt > dl.at && lt < dl.to ? [Math.PI + 0.3, Math.PI + 0.4] : back > 0.3 ? [-1.2, -1.6] : [1.5, 1.6], la: back > 0.3 ? [-1.9, -1.5] : [1.4, 1.65], f: -1, look: -1 });
    if (lt > L_[4].t0 - 3) klap(lerp(1500, 1180, seg(lt, L_[4].t0 - 3, L_[4].t0 - 0.4)), 650, 0.95, sh, lt, { f: -1, look: -1 });
    probable(pA, () => dragon(860 - seg(lt, lu, lu + 0.5) * 140, 640, 0.95, 300, { f: -1, t: lt, jaw: 0.3 + 0.7 * seg(lt, lu - 0.3, lu + 0.2), neck: -0.75 + seg(lt, lu, lu + 0.4) * 0.35, rear: seg(lt, lu - 0.5, lu) * 0.3, flap: 0.6 }), { seed: 1 });
  });
};
SHOTS.title = (lt) => { X.fillStyle = P.paper; X.fillRect(0, 0, W, H); txt('THE THIRD SALLY', CX, 110, 60, {}); txt('or, The Dragons of Probability', CX, 170, 30, { italic: true }); const p = clamp(lt / 4.2); probable(p, () => dragon(640, 660, 0.82, 900, { f: -1, t: lt, jaw: 0.4, flap: 0.5 }), { seed: 9 }); };
SHOTS.country = (lt, sd, sh) => {
  const L_ = sh.lines, rg = cue(sh, 'ring'), u = seg(lt, 0, sd);
  const c = lt < L_[1].t0 - 0.6 ? { z: lerp(1.05, 1.0, u), x: lerp(-30, 10, u), y: 0 } : camFor(lt, [[0, ON(640, 360, 1.0)], [L_[1].t0 - 0.6, ON(560, 470, 1.35)]]);
  cam(c, () => {
    X.fillStyle = P.paper; X.fillRect(-300, -300, 1900, 1400); hatchSky(-300, 420);
    for (const [cx, k] of [[180, 0], [1180, 1]]) for (let i = 0; i < 8; i++) ball(cx + Math.sin(i + lt * 0.4) * 14, 400 - i * 34, 30 + i * 6, 700 + k * 20 + i, PAT.m, 1.2);
    shape([[-300, 420], [1600, 420], [1600, 1000], [-300, 1000]], { lw: 1.4, id: 710, h: [0.05, 4.6, 0.45] });
    for (let i = 0; i < 8; i++) { const hx = 100 + i * 170; shape([[hx - 40, 450], [hx + 40, 450], [hx + 40, 400], [hx, 370], [hx - 40, 400]], { lw: 1.4, id: 720 + i, h: [1.57, 3, 0.5] }); }
    shape([[920, 450], [960, 450], [960, 340], [940, 300], [920, 340]], { lw: 1.4, id: 750, h: [1.57, 2.6, 0.5] }); line([940, 300], [940, 270], 2, 751, 0.1);
    for (let i = 0; i < 8; i++) { const sx = 1040 + i * 60; shape([[sx - 18, 520], [sx + 18, 520], [sx, 470]], { lw: 1.2, id: 760 + i, h: [0.4, 2.2, 0.6] }); }
    // three dragons: certain, likely, unlikely (plate 5)
    probable(P_(sh, 'C', lt), () => dragon(1080, 330, 0.42, 800, { f: -1, t: lt, flap: 1, jaw: 0.5 }), { seed: 3 });
    probable(P_(sh, 'B', lt), () => dragon(760, 380, 0.55, 820, { f: -1, t: lt + 2, flap: 1, jaw: 0.6, rear: 0.3 }), { seed: 4 });
    const pA = P_(sh, 'A', lt);
    if (lt > rg.at + 4.6) { X.beginPath(); X.ellipse(420, 640, 230 * seg(lt, rg.at + 4.6, rg.at + 5.6), 40, 0, 0, 6.283); X.fillStyle = PAT.d; X.fill(); for (let i = 0; i < 5; i++) { const s_ = ((lt * 0.4 + i / 5) % 1); X.save(); X.globalAlpha = 1 - s_; ball(420 + Math.sin(i * 2 + lt) * 40, 620 - s_ * 200, 20 + s_ * 30, 830 + i, PAT.f, 1); X.restore(); } }
    probable(pA, () => dragon(420, 640, 0.75, 840, { f: 1, t: lt, flap: 0.8, jaw: 0.7, rear: 0.2 }), { seed: 5 });
    if (lt < rg.at) { for (let i = 0; i < 7; i++) person(140 + i * 170 + lt * (i % 2 ? 22 : -22), 720, 0.7, 860 + i * 30, 'fear', 0.8, lt, { f: i % 2 ? 1 : -1, runDir: i % 2 ? 1 : -1, hood: i % 3 === 0, short: i % 2 === 0 }); }
    else { const k = seg(lt, rg.at, rg.to); for (let i = 0; i < 12; i++) { const a = i / 12 * 6.283, R0 = lerp(520, 300, k); const hx = 420 + Math.cos(a) * R0, hy = 640 + Math.sin(a) * R0 * 0.32; figure({ x: hx, y: hy + 40, s: 0.55 + 0.1 * Math.sin(a), f: Math.cos(a) > 0 ? -1 : 1, id: 900 + i * 20, hb: [-20, -130], hf: [40, -150], ph: lt * 6, walk: 1 - k, dark: i % 3 === 0, hood: i % 2 === 0 }); line([hx + (Math.cos(a) > 0 ? -1 : 1) * 30, hy - 60], [hx + (Math.cos(a) > 0 ? -1 : 1) * 70, hy - 130], 2, 950 + i, 0.2); } }
  });
};
function cityBack(id, lt) {
  X.fillStyle = P.paper; X.fillRect(-300, -300, 1900, 1400); hatchSky(-300, 470);
  for (let i = 0; i < 12; i++) block_(i * 120 - 60, 470, 90 + hash(id, i) * 40, 100 + hash(id + 1, i) * 180, id + 10 + i);
  X.beginPath(); X.arc(260, 300, 70, Math.PI, 0); X.fillStyle = P.paper; X.fill(); X.lineWidth = 1.6; X.strokeStyle = P.ink; X.stroke(); shape(R(190, 300, 140, 170), { lw: 1.6, id: id + 40, h: [1.57, 3, 0.5] });
  for (let i = 0; i < 9; i++) { const ax = 700 + i * 70; X.beginPath(); X.moveTo(ax, 470); X.lineTo(ax, 420); X.arc(ax + 26, 420, 26, Math.PI, 0); X.lineTo(ax + 52, 470); X.fillStyle = PAT.d; X.fill(); }
  shape([[-300, 470], [1600, 470], [1600, 1000], [-300, 1000]], { lw: 1.6, id: id + 60, h: [0.02, 4, 0.5] });
  for (let i = 0; i < 6; i++) { const cx = 80 + i * 240; shape([[cx - 10, 470], [cx + 10, 470], [cx, 380]], { lw: 1.2, id: id + 70 + i, h: [1.57, 2, 0.6] }); }
}
function block_(x, y, w, h, id) { shape(R(x, y - h, w, h), { lw: 1.4, id, h: [1.57, 3.2, 0.5] }); for (let r = 0; r < Math.floor(h / 40); r++) for (let c = 0; c < 2; c++) shape(R(x + 14 + c * (w / 2), y - h + 14 + r * 40, 14, 18), { fill: PAT.d, lw: 0.6, id: id + r * 3 + c }); }
function skyDragon(x, y, s, id, lt, p, seed) { probable(p, () => dragon(x, y, s, id, { f: -1, t: lt + id, flap: 1, jaw: 0.4, rear: 0.25 }), { seed }); }
SHOTS.basil = (lt, sd, sh) => {
  const u = seg(lt, 0, sd), pV = P_(sh, 'V', lt), L_ = sh.lines;
  const c = camFor(lt, [[0, { z: 1.0, x: 0, y: 0 }], [L_[4].t0 - 0.4, ON(560, 440, 1.6)]]);
  cam(c, () => { cityBack(1000, lt);
    skyDragon(330, 300, 0.5, 1100, lt, pV, 11); skyDragon(1000, 260, 0.42, 1120, lt, pV * 0.85, 12); skyDragon(680, 200, 0.32, 1140, lt, pV * 0.7, 13);
    const w = lerp(-100, 0, 0) + u * 260; trurl(380 + w, 700, 0.95, sh, lt, { walk: 1 }); klap(560 + w, 700, 0.95, sh, lt, { f: -1, look: -1 }); });
};
SHOTS.dampers = (lt, sd, sh) => {
  const fits = cues(sh, 'fit'), D = ['D1', 'D2', 'D3', 'D4'], posts = [[260, 0.9], [560, 1.15], [880, 0.95], [1130, 0.8]];
  let k = fits.findIndex((f) => lt < f.at); if (k < 0) k = 3; const kx = posts[k][0];
  cam({ z: 1.0, x: lerp(-60, 60, seg(lt, 0, sd)), y: 0 }, () => { cityBack(1300, lt);
    D.forEach((d, i) => skyDragon(220 + i * 300, 250 + (i % 2) * 60, 0.44, 1400 + i * 20, lt, P_(sh, d, lt), 20 + i));
    posts.forEach(([px, s], i) => { const done = lt > fits[i].at; line([px, 700], [px, 700 - 260 * s], 8 * s, 1500 + i, 0.2); shape(R(px - 20 * s, 690, 40 * s, 14), { lw: 1.4, id: 1510 + i, h: [0, 2, 0.6] });
      if (done) { ball(px, 700 - 290 * s, 30 * s, 1520 + i, PAT.m, 1.6); for (let j = 0; j < 8; j++) { const a = j / 8 * 6.283; X.beginPath(); X.arc(px + Math.cos(a) * 20 * s, 700 - 290 * s + Math.sin(a) * 20 * s, 5 * s, 0, 6.283); X.fillStyle = P.ink; X.fill(); } } });
    const fu = clamp((lt - (fits[k].at - 1.6)) / 1.4);
    shape([[kx - 60, 700], [kx - 30, 470], [kx - 10, 470], [kx - 40, 700]], { lw: 1.4, id: 1530, h: [0, 3, 0.6] });
    klap(kx - 80, 700, 1.0, sh, lt, { ra: [-1.0 - fu * 0.4, -0.8], la: [-0.9, -0.6], lookY: -1.4 });
    for (let i = 0; i < 2; i++) { const bx = 100 + i * 900 + Math.sin(lt * 0.3 + i) * 30; constructor_(bx, 720, 0.6, 1600 + i * 100, { ra: [1.0, 0.4], la: [2.1, 2.7], look: i ? -1 : 1, f: i ? -1 : 1 }); shape(R(bx - 34, 590, 68, 50), { lw: 1.4, id: 1650 + i, h: [0.1, 3, 0.5] }); for (let j = 0; j < 3; j++) ball(bx - 20 + j * 20, 586, 10, 1660 + j + i * 5, PAT.m, 1); } });
};
SHOTS.court = (lt, sd, sh) => {
  const st = cue(sh, 'storm').at, out = seg(lt, st, st + 2.2, E.in);
  cam({ z: lerp(1.04, 1.0, seg(lt, 0, sd)), x: 0, y: 0 }, () => {
    darkWall(-300, -300, 1900, 1400, 3); for (const ax of [120, 520]) { X.save(); X.beginPath(); X.moveTo(ax, 460); X.lineTo(ax, 160); X.arc(ax + 160, 160, 160, Math.PI, 0); X.lineTo(ax + 320, 460); X.closePath(); X.fillStyle = P.paper; X.fill(); X.clip(); hatchSky(0, 460); for (let i = 0; i < 10; i++) tower(ax + 20 + i * 32, 460, 16 + hash(1700, i) * 8, 60 + hash(1701 + ax, i) * 100, 1710 + i * 10 + ax, { t: lt, flag: i % 3 === 0 }); X.restore(); X.lineWidth = 3; X.strokeStyle = P.ink; X.stroke(); }
    shape(R(980, 60, 160, 400), { lw: 2, id: 1800, h: [1.57, 2.6, 0.5] }); crownOn(1060, 160, 1.6, 1801);
    shape([[-300, 600], [1600, 600], [1600, 1000], [-300, 1000]], { lw: 1.6, id: 1810, h: [0.02, 4, 0.5] });
    shape(R(880, 300, 220, 330), { lw: 2.4, id: 1820, h: [1.57, 3.4, 0.5] });
    constructor_(980, 640, 1.0, 1900, { seated: true, robe: true, f: -1, ra: [0.4, -1.83], la: [1.2, 0.3], look: -1, tilt: lt > st - 2 ? 0.08 * Math.sin(lt * 5) : 0 }); crownOn(980 - 2, 640 - 286 - 40, 1.0, 1950);
    shape(R(560, 600, 120, 70), { lw: 1.8, id: 1960, h: [1.57, 3, 0.5] }); for (let i = 0; i < 14; i++) X.beginPath(), X.ellipse(570 + hash(1961, i) * 100, 600 - hash(1962, i) * 18, 9, 4, 0, 0, 6.283), X.fillStyle = P.paper, X.fill(), X.lineWidth = 1, X.strokeStyle = P.ink, X.stroke();
    const tx = lerp(520, -260, out); trurl(tx, 680, 1.0, sh, lt, { f: out > 0 ? -1 : 1, ra: out > 0 ? [-1.4, -1.9] : [0.1, 0.0], la: [1.4, 1.65], walk: out > 0 && out < 1, look: out > 0 ? 1 : 1, tilt: out > 0 ? -0.1 : 0 });
    if (out < 0.05) { X.save(); X.translate(520 + 30 + 120 * 0.95, 680 - 214 * 0.95); shape(R(-40, -6, 80, 12), { lw: 1.4, id: 1970, h: [0, 2, 0.6] }); for (let i = 0; i < 12; i++) shape([[-36 + i * 6, -6], [-33 + i * 6, -22], [-30 + i * 6, -6]], { lw: 0.8, id: 1971 + i }); X.restore(); }
    for (let i = 0; i < 2; i++) constructor_(1180 + i * 70, 660, 0.8, 2000 + i * 100, { robe: true, f: -1, ra: [1.4, 1.6], la: [1.4, 1.6], look: -1 });
  });
};
SHOTS.tribute = (lt, sd, sh) => {
  const L_ = sh.lines, pF = P_(sh, 'F', lt), dl = cue(sh, 'dial');
  if (lt > L_[5].t0 - 0.3) { cam(camFor(lt, [[0, ON(640, 360, 1.0)]]), () => { X.fillStyle = P.paper; X.fillRect(0, 0, W, H); X.save(); X.globalAlpha = 0.6; hatch(Math.PI / 2, 3, 0.6, [0, 0, W, H]); X.restore(); counterDial(640, 380, 260, lerp(0.1, pF, seg(lt, L_[5].t0 - 0.3, L_[5].t0 + 1.4, E.out)), 2100); }); return; }
  const c = camFor(lt, [[0, ON(640, 360, 1.0)], [L_[1].t0 - 0.3, ON(560, 420, 1.45)], [L_[2].t0 - 0.2, ON(330, 420, 1.45)], [L_[3].t0 - 0.2, ON(600, 420, 1.45)], [L_[4].t0 - 0.2, ON(760, 440, 1.5)]]);
  cam(c, () => { X.fillStyle = P.paper; X.fillRect(-300, -300, 1900, 1400); hatchSky(-300, 500);
    mountains(420, 2200, 1.4); X.save(); X.translate(1120, 140); X.beginPath(); X.arc(0, 0, 40, 0, 6.283); X.fillStyle = PAT.d; X.fill(); X.restore();
    for (let i = 0; i < 9; i++) { const u = i / 8, x = 1000 + u * 160, y = 420 - u * 250; figure({ x, y, s: 0.18, f: -1, id: 2300 + i * 10, ang: -0.2, ph: lt * 4 + i, walk: 0.5, dark: true }); }
    shape([[-300, 620], [400, 560], [900, 600], [1600, 520], [1600, 1000], [-300, 1000]], { lw: 1.6, id: 2400, h: [0.3, 3.6, 0.5] });
    klap(330, 700, 0.95, sh, lt, { dial: pF, look: 1 });
    for (let i = 0; i < 5; i++) { const px = 560 + i * 150, py = 690 - i * 22; const who = i === 0 ? 'P' : i === 1 ? 'G' : null; porter(px, py, 0.92 - i * 0.08, 2500 + i * 100, lt, { f: who && talking(sh, who, lt) ? -1 : 1, hood: i % 2 === 1, dark: i % 3 === 2, mouth: who ? sayAt(sh, who, lt) : 0 }); }
  });
};
SHOTS.gorge = (lt, sd, sh) => {
  const L_ = sh.lines, so = cue(sh, 'shot').at, sc = cue(sh, 'scratch'), im = cue(sh, 'improb'), gr = cue(sh, 'grenade').at, ch = cue(sh, 'charge');
  const k = seg(lt, im.at, im.at + 1.4) * (1 - seg(lt, im.to, im.to + 1.0));
  const c = camFor(lt, [[0, ON(640, 360, 1.0)], [L_[0].t0 - 0.2, ON(960, 520, 1.55)], [so - 0.4, ON(640, 380, 1.0)], [L_[1].t0 - 0.3, ON(980, 500, 1.6)], [im.at + 0.6, ON(640, 360, 0.95)], [L_[2].t0 - 0.3, ON(980, 520, 1.7)], [gr - 0.4, ON(640, 380, 1.0)], [ch.at + 0.6, ON(800, 460, 1.4)]]);
  cam(c, () => { X.fillStyle = P.paper; X.fillRect(-300, -300, 1900, 1400); hatchSky(-300, 300);
    if (k > 0) { X.save(); X.globalAlpha = k * 0.55; X.fillStyle = '#16120e'; X.fillRect(-300, -300, 1900, 600); X.restore(); }
    for (const [x0, d] of [[-200, 1], [1500, -1]]) { const pts = [[x0, -300], [x0 + d * 380, -300]]; for (let i = 0; i <= 10; i++) pts.push([x0 + d * (380 - hash(2600 + d, i) * 120 - i * 8), -300 + i * 90]); pts.push([x0, 700]); shape(pts, { lw: 2, id: 2600 + d, h: [d > 0 ? 1.4 : 1.74, 3.4, 0.55] }); }
    shape([[-300, 640], [1600, 640], [1600, 1000], [-300, 1000]], { lw: 1.6, id: 2700, h: [0.05, 4, 0.5] });
    for (let i = 0; i < 18; i++) { const x = hash(2710, i) * 1400 - 60, y = 650 + hash(2711, i) * 60; shape(rock(x, y, 12 + hash(2712, i) * 20, 2720 + i, 9), { lw: 1.2, id: 2720 + i, h: [0.8, 2.6, 0.5] }); }
    // miracles
    if (k > 0) { X.save(); X.globalAlpha = k;
      for (let i = 0; i < 12; i++) { const x = 200 + hash(2800, i) * 900, y0 = 660 - hash(2801, i) * 20, lift = k * (120 + 260 * hash(2802, i)) + Math.sin(lt * 2 + i) * 10; X.save(); X.translate(x, y0 - lift); X.rotate(lt * 0.4 * (hash(2803, i) - 0.5)); shape(rock(0, 0, 14 + hash(2804, i) * 22, 2810 + i, 9), { lw: 1.4, id: 2810 + i, h: [0.8, 2.6, 0.5] }); X.restore(); }
      for (let i = 0; i < 2; i++) { const sx = 300 + i * 160 + (lt - im.at) * 40 * (i ? -1 : 1), sy = 630; shape(rock(sx, sy - 30, 26, 2830 + i, 9), { lw: 1.6, id: 2830 + i, h: [0.8, 2.6, 0.5] }); line([sx - 8, sy - 6], [sx - 12 + Math.sin(lt * 8 + i) * 6, sy + 6], 2, 2832 + i, 0.1); line([sx + 8, sy - 6], [sx + 12 - Math.sin(lt * 8 + i) * 6, sy + 6], 2, 2834 + i, 0.1); X.beginPath(); X.arc(sx - 8, sy - 36, 2.6, 0, 6.283); X.arc(sx + 8, sy - 36, 2.6, 0, 6.283); X.fillStyle = P.ink; X.fill(); }
      const mx_ = 560 + Math.sin(lt * 1.3) * 120, my = 220 + Math.cos(lt * 1.7) * 40, fl = Math.sin(lt * 18) * 0.8; X.save(); X.translate(mx_, my); for (const d of [-1, 1]) shape([[0, 0], [d * 22, -16 * fl - 4], [d * 26, 8]], { lw: 1, id: 2840 + d, h: [0.5, 2, 0.6] }); line([0, -6], [0, 10], 2.4, 2843, 0.1); X.restore();
      const sg = seg(lt, im.at + 3.6, im.at + 5.2); if (sg > 0) { X.globalAlpha = k * sg; X.font = `bold 46px ${FONT}`; X.textAlign = 'center'; X.textBaseline = 'middle'; const text = 'AT YOUR SERVICE GOV'; for (let i = 0; i < 1600; i++) { const x = 380 + hash(2850, i) * 520, y = 110 + hash(2851, i) * 70; X.fillStyle = P.ink; X.fillRect(x, y, 1.4, 1.4); } txt(text, 640, 150, 44, { bold: true, col: P.paper }); }
      for (let i = 0; i < 4; i++) { const wx = ((lt * 60 + i * 340) % 1700) - 200, wy = 120 + i * 50; probable(0.35, () => { figure({ x: wx, y: wy + 120, s: 0.4, f: 1, id: 2860 + i * 20, ang: -0.5, hood: true, dark: true }); line([wx - 40, wy + 90], [wx + 40, wy + 70], 2, 2870 + i, 0.1); }, { seed: 40 + i }); }
      for (let i = 0; i < 3; i++) { const hx = 1300 - ((lt - im.at) * 90 + i * 140) % 1500; probable(0.45, () => figure({ x: hx, y: 640, s: 0.6, f: -1, id: 2900 + i * 20, ph: lt * 9, walk: 1, short: true }), { seed: 50 + i }); }
      X.restore(); }
    // the dragon, which is always certain
    const after = lt > so && lt < sc.at ? seg(lt, so, so + 0.4) * (1 - seg(lt, so + 1.4, sc.at)) : 0;
    const scr = seg(lt, sc.at, sc.at + 0.6) * (1 - seg(lt, sc.to - 0.6, sc.to));
    const trot = lt > sc.to ? 1 : 0, chg = seg(lt, ch.at, ch.to);
    let dx = lerp(380, 520, seg(lt, sc.to, im.at)); if (lt > ch.at) dx = lerp(520, 860, chg);
    dragon(dx, 640, 0.9, 3000, { f: 1, t: lt, rear: after * 0.8, jaw: after * 0.9 + (lt > im.at + 2 && lt < im.to ? 0.6 * Math.max(0, Math.sin((lt - im.at) * 0.9)) : 0), scratch: scr, walk: (trot && lt < im.at) || chg > 0 ? 1 : 0, flap: 0.15, mane: true, tailOff: lt > gr, yawn: lt > im.at + 2 && lt < im.to, neck: -0.9 + after * -0.3 });
    if (lt > so - 0.1 && lt < so + 0.8) { X.save(); X.globalAlpha = 1 - (lt - so) / 0.9; for (let i = 0; i < 8; i++) ball(1050 - (lt - so) * 400 + i * 20, 470 + Math.sin(i) * 10, 18 + i * 3, 3100 + i, PAT.f, 1); X.restore(); }
    if (lt > gr && lt < gr + 2.2) { const u = (lt - gr) / 2.2; for (let i = 0; i < 6; i++) { X.save(); X.translate(260 - u * 300 + i * 30, 600 - Math.sin(u * Math.PI) * 360 + i * 10); X.rotate(u * 8 + i); ball(0, 0, 20 - i * 2, 3110 + i, PAT.m, 1.3); X.restore(); } for (let i = 0; i < 12; i++) { const a = hash(3120, i) * 6.283, r = u * 260; ball(240 + Math.cos(a) * r, 600 + Math.sin(a) * r * 0.6, 6, 3121 + i, PAT.m, 1); } }
    if (lt > im.at && lt < im.to + 1) { X.save(); X.globalAlpha = k * (0.4 + 0.3 * Math.sin(lt * 12)); X.beginPath(); X.ellipse(dx + 40, 470, 330, 200, 0, 0, 6.283); X.lineWidth = 3; X.strokeStyle = P.paper; X.stroke(); X.restore(); }
    // Klapaucius on the bluff, with the gun
    const rec = seg(lt, so, so + 0.1) * (1 - seg(lt, so + 0.1, so + 0.6));
    shape([[860, 1000], [880, 640], [1000, 600], [1200, 620], [1600, 600], [1600, 1000]], { lw: 2, id: 3200, h: [0.4, 3.4, 0.5] });
    const throwG = seg(lt, gr - 0.8, gr - 0.2);
    const flee = lt > ch.at + 1.2;
    klap(1060, 640, 1.0, sh, lt, { f: -1, ra: throwG > 0 && throwG < 1 ? [-2.4 + throwG * 2, -2.2 + throwG * 2] : lt < gr - 1 ? [0, 0] : [1.5, 1.6], la: lt < gr - 1 ? [0.15, -0.05] : [1.4, 1.65], dial: lt > im.at && lt < im.to ? 0.9 : 1, wild: lt > im.at && lt < im.to, tilt: flee ? 0.15 : 0 });
    if (lt < gr - 1) negGun(1060 - 150, 640 - 214, -1.0, 3300, rec);
  });
};
SHOTS.reveal = (lt, sd, sh) => {
  const kn = cue(sh, 'kneel').at, L_ = sh.lines, out = seg(lt, kn + 0.8, kn + 2.4);
  const c = camFor(lt, [[0, ON(640, 400, 1.1)], [L_[1].t0 - 0.3, ON(560, 460, 1.4)], [L_[4].t0 - 0.4, ON(530, 420, 2.0)], [L_[4].t1 + 0.6, ON(640, 420, 1.2)], [L_[9].t0 - 0.4, ON(640, 380, 1.0)]]);
  cam(c, () => { X.fillStyle = P.paper; X.fillRect(-300, -300, 1900, 1400); hatchSky(-300, 300);
    for (const [x0, d] of [[-200, 1], [1500, -1]]) { const pts = [[x0, -300], [x0 + d * 380, -300]]; for (let i = 0; i <= 10; i++) pts.push([x0 + d * (380 - hash(2600 + d, i) * 120 - i * 8), -300 + i * 90]); pts.push([x0, 700]); shape(pts, { lw: 2, id: 2600 + d, h: [d > 0 ? 1.4 : 1.74, 3.4, 0.55] }); }
    shape([[-300, 640], [1600, 640], [1600, 1000], [-300, 1000]], { lw: 1.6, id: 2700, h: [0.05, 4, 0.5] });
    dragon(260, 640, 0.9, 3000, { f: 1, t: 0, kneel: seg(lt, kn, kn + 1.2), neck: lerp(-0.9, 0.85, seg(lt, kn, kn + 1.4)), jaw: 0.2, flap: 0, mane: true, tailOff: true });
    if (out > 0) { X.save(); X.beginPath(); X.ellipse(270, 560, 40 * out, 70 * out, 0, 0, 6.283); X.fillStyle = PAT.d; X.fill(); X.restore(); line([240, 480], [320, 380], 3, 3400, 0.2); }
    const tx = lerp(270, 620, out); if (out > 0) trurl(tx, 680, 1.0, sh, lt, { f: 1, look: 1, ra: lt > L_[9].t0 ? [0.4, -0.6] : undefined });
    klap(900, 680, 1.0, sh, lt, { f: -1, look: -1, dial: 0 });
    if (lt > L_[9].t0) for (let i = 0; i < 6; i++) sack(1070 + (i % 3) * 66, 650 - Math.floor(i / 3) * 62, 30, 3500 + i);
  });
};
SHOTS.end = (lt) => { X.fillStyle = P.paper; X.fillRect(0, 0, W, H); X.globalAlpha = seg(lt, 0.4, 1.6); txt('THE THIRD SALLY', CX, 300, 44, {}); txt('after Stanisław Lem, The Cyberiad', CX, 362, 24, { italic: true }); X.globalAlpha = 1; probable(clamp(0.6 - lt * 0.08), () => dragon(640, 640, 0.4, 900, { f: -1, t: lt, flap: 0.6 }), { seed: 99 }); };

/* ================= frame loop ================= */
window.__render = async (f) => {
  const t = f / 24; GT = t; BOIL = Math.floor(f / 2);
  let i = 0; for (let j = 0; j < T.shots.length; j++) if (t >= T.shots[j].t0) i = j;
  const sh = T.shots[i], lt = t - sh.t0, sd = sh.d;
  X.setTransform(1, 0, 0, 1, 0, 0); X.fillStyle = P.paper; X.fillRect(0, 0, W, H);
  X.save(); path(R(PX0, PY0, PX1 - PX0, PY1 - PY0)); X.clip();
  SHOTS[sh.shot](lt, sd, sh);
  X.restore(); X.setTransform(1, 0, 0, 1, 0, 0);
  const fade = sh.shot === 'title' ? Math.max(1 - seg(lt, 0, 0.6), seg(lt, sd - 0.6, sd)) : sh.shot === 'lab' ? 1 - seg(lt, 0, 0.8) : 0;
  if (fade > 0) { X.fillStyle = P.paper; X.globalAlpha = fade; X.fillRect(0, 0, W, H); X.globalAlpha = 1; }
  border();
};
(async () => {
  T = await (await fetch('timing/dr.json')).json();
  await document.fonts.ready; await Promise.all(['IM Fell English', 'IBM Plex Mono'].map((n) => document.fonts.load(`20px "${n}"`)));
  X = document.getElementById('film').getContext('2d');
  window.__NF = Math.ceil(T.dur * 24); window.__T = T; window.__ready = true;
})();
