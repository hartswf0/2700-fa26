/* The Sixth Sally, or The Demon of the Second Kind: the film printed on the Demon's tape. Same toolkit as the earlier films. */
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
let T = null, GT = 0;
const sayAt = (sh, who, lt) => { for (const l of sh.lines) if (l.who === who && lt >= l.t0 && lt < l.t1) return l.env[Math.min(l.env.length - 1, Math.floor((lt - l.t0) * 24))] || 0; return 0; };
const talking = (sh, who, lt) => sh.lines.some((l) => l.who === who && lt >= l.t0 - 0.1 && lt < l.t1 + 0.2);
const cue = (sh, k, i = 0) => sh.cues.filter((c) => c.k === k)[i];
const cues = (sh, k) => sh.cues.filter((c) => c.k === k);
function cam(c, fn) { X.save(); X.translate(CX, CY); X.scale(c.z, c.z); X.translate(-CX - c.x, -CY - c.y); fn(); X.restore(); }
const ON = (x, y, z) => ({ z, x: x - CX, y: y - CY });
function blendCam(a, b, u) { return { z: lerp(a.z, b.z, u), x: lerp(a.x, b.x, u), y: lerp(a.y, b.y, u) }; }
function camFor(lt, plan, dur = 0.8) { let c = plan[0][1]; for (let i = 1; i < plan.length; i++) { const [t0, cc] = plan[i]; if (lt >= t0) c = blendCam(c, cc, seg(lt, t0, t0 + dur, E.io)); } return c; }
function darkWall(x0, y0, x1, y1, sp = 2.6) { X.fillStyle = P.paper; X.fillRect(x0, y0, x1 - x0, y1 - y0); X.save(); path(R(x0, y0, x1 - x0, y1 - y0)); X.clip(); for (let y = y0; y < y1; y += sp) { X.fillStyle = P.ink; X.fillRect(x0, y, x1 - x0, 0.9 + 0.5 * hash(y | 0, 5)); } X.restore(); }
function stip(pts, id, dens = 0.012, sz = 1.3) { X.save(); path(pts); X.clip(); const [a, b, c, d] = bbox(pts); const n = Math.min(2400, (c - a) * (d - b) * dens); X.fillStyle = P.ink; for (let i = 0; i < n; i++) X.fillRect(a + hash(id, i) * (c - a), b + hash(id + 1, i) * (d - b), sz, sz); X.restore(); }
function blobPts(x, y, rx, ry, id, n = 30, wob = 0.1, ang = 0) { const p = [], h1 = hash(id, 91) * 6.283, h2 = hash(id, 92) * 6.283, ca = Math.cos(ang), sa = Math.sin(ang); for (let i = 0; i < n; i++) { const a = i / n * 6.2832, r = 1 + wob * (0.6 * Math.sin(2 * a + h1) + 0.4 * Math.sin(3 * a + h2)); const px = Math.cos(a) * rx * r, py = Math.sin(a) * ry * r; p.push([x + px * ca - py * sa, y + px * sa + py * ca]); } return p; }
function sack(x, y, r, id, red) { X.beginPath(); X.ellipse(x, y, r, r * 1.1, 0, 0, 6.283); X.fillStyle = P.paper; X.fill(); X.lineWidth = 1.6; X.strokeStyle = P.ink; X.stroke(); X.save(); X.clip(); hatch(0.6, 3, 0.6, [x - r, y - r * 1.2, x + r, y + r]); X.restore(); line([x - r * 0.3, y - r * 1.05], [x + r * 0.3, y - r * 1.05], 3, id, 0.2); if (red) { ink([[x - r * 0.4, y - r * 0.1], [x + r * 0.3, y + r * 0.2]], 2.4, id + 1, 0.3, P.red); ink([[x - r * 0.3, y + r * 0.3], [x + r * 0.4, y - r * 0.05]], 2.4, id + 2, 0.3, P.red); } }
function klap(x, y, s, sh, lt, o = {}) { const sp = sh ? talking(sh, 'K', lt) : false, e = sh ? sayAt(sh, 'K', lt) : 0; constructor_(x, y, s, 600, { robe: true, f: o.f || 1, seated: o.seated, ra: o.ra || (sp ? [0.1 - e * 0.5, -0.5 - e * 0.4] : [1.5, 1.6]), la: o.la || [1.4, 1.65], open: o.open ?? (sp ? 0.8 : 0), look: o.look ?? 1, lookY: o.lookY || 0, mouth: e, tilt: o.tilt || 0, walk: o.walk }); }
function trurl(x, y, s, sh, lt, o = {}) { const sp = sh ? talking(sh, 'T', lt) : false, e = sh ? sayAt(sh, 'T', lt) : 0; constructor_(x, y, s, 400, { f: o.f || 1, ra: o.ra || (sp ? [-0.3 - e * 0.3, -0.2 - e * 0.4] : [1.5, 1.6]), la: o.la || [1.4, 1.65], open: sp ? 0.8 : 0, look: o.look ?? 1, lookY: o.lookY || 0, mouth: e, tilt: o.tilt || 0, walk: o.walk }); }
function mono(s, x, y, size, o = {}) { X.font = `${o.bold ? '600 ' : ''}${size}px "IBM Plex Mono","DejaVu Sans Mono",monospace`; X.textAlign = o.align || 'left'; X.textBaseline = 'middle'; X.fillStyle = o.col || P.ink; X.fillText(s, x, y); }

/* ================= Pugg =================
   The face: a riveted plate covered in eyes, a saw for a nose, an iron hook for a jaw. Local coords, centre (0,0), about 560 x 460 at s=1.
   o: look [dx,dy], dart (0..1 eyes moving independently), swim (eyes rolling), shut (0..1), mouth, sniff */
const EYES = (() => { const e = []; for (let i = 0; i < 90 && e.length < 64; i++) { const a = hash(7000, i) * 6.283, r = Math.sqrt(hash(7001, i)); const x = Math.cos(a) * r * 230, y = -40 + Math.sin(a) * r * 170; if (Math.abs(x) < 46 && y > -60) continue; if (e.some(([u, v]) => Math.hypot(u - x, v - y) < 40)) continue; e.push([x, y, 13 + hash(7002, i) * 12]); } return e; })();
function puggFace(x, y, s, o = {}) {
  X.save(); X.translate(x, y); X.scale(s, s); X.rotate(o.tilt || 0);
  const plate = blobPts(0, 0, 280, 230, 7010, 40, 0.06);
  shape(plate, { lw: 3, id: 7010, h: [[0.5, 4, 0.5]], sh: [[60, -260], [320, -260], [320, 260], [60, 260]], sh2: [1.3, 2.4, 0.6] });
  stip(plate, 7011, 0.004, 2.2);
  for (let i = 0; i < 26; i++) { const a = i / 26 * 6.283; ball(Math.cos(a) * 250, Math.sin(a) * 200, 5, 7020 + i, PAT.f, 1); }
  const lk = o.look || [0, 0];
  for (let i = 0; i < EYES.length; i++) { const [ex, ey, er] = EYES[i];
    X.beginPath(); X.arc(ex, ey, er + 4, 0, 6.283); X.fillStyle = P.ink; X.fill(); X.beginPath(); X.arc(ex, ey, er, 0, 6.283); X.fillStyle = P.paper; X.fill();
    const sh_ = clamp(o.shut || 0); if (sh_ < 0.95) { let px = lk[0], py = lk[1]; if (o.dart) { px = lerp(px, Math.sin(GT * 7 + i * 2.1) > 0 ? 1 : -1, o.dart); py = lerp(py, Math.cos(GT * 5.3 + i * 1.3) * 0.7, o.dart); } if (o.swim) { const a = GT * (3 + (i % 5)) + i; px = lerp(px, Math.cos(a), o.swim); py = lerp(py, Math.sin(a), o.swim); }
      X.beginPath(); X.arc(ex + px * er * 0.45, ey + py * er * 0.45, er * 0.42, 0, 6.283); X.fillStyle = P.ink; X.fill(); X.beginPath(); X.arc(ex + px * er * 0.45 - er * 0.15, ey + py * er * 0.45 - er * 0.15, er * 0.12, 0, 6.283); X.fillStyle = P.paper; X.fill(); }
    if (sh_ > 0) { X.save(); X.beginPath(); X.arc(ex, ey, er + 1, 0, 6.283); X.clip(); X.fillStyle = P.paper; X.fillRect(ex - er - 2, ey - er - 2, er * 2 + 4, (er * 2 + 4) * sh_); hatch(0.2, 2.2, 0.7, [ex - er, ey - er, ex + er, ey - er + 2 * er * sh_]); X.restore(); line([ex - er, ey - er + 2 * er * sh_], [ex + er, ey - er + 2 * er * sh_], 1.4, 7100 + i, 0.1); } }
  // the saw
  const sn = (o.sniff || 0) * Math.sin(GT * 30) * 3;
  shape([[-18, -70 + sn], [18, -70 + sn], [22, 110], [-22, 110]], { lw: 2, id: 7200, h: [0.2, 3, 0.5], fill: '#ddd4bd' }); ball(0, -60 + sn, 6, 7201, PAT.f, 1.2);
  const teeth = []; for (let i = 0; i <= 14; i++) teeth.push([22 + (i % 2 ? 14 : 0), -60 + i * 12]); ink(teeth, 1.8, 7202, 0.2);
  // mouth and hook
  const mo = o.mouth || 0; shape([[-90, 140], [90, 140], [70, 150 + mo * 26], [-70, 150 + mo * 26]], { fill: P.ink, lw: 1, id: 7210 });
  X.beginPath(); X.moveTo(-20, 150); X.lineTo(-20, 230); X.arc(-70, 230, 50, 0, Math.PI * 0.95); X.lineCap = 'round'; X.lineWidth = 30; X.strokeStyle = P.ink; X.stroke(); X.lineWidth = 22; X.strokeStyle = P.paper; X.stroke(); X.lineCap = 'butt';
  X.save(); X.beginPath(); X.moveTo(-20, 150); X.lineTo(-20, 230); X.arc(-70, 230, 50, 0, Math.PI * 0.95); X.lineWidth = 22; X.setLineDash([2, 3]); X.strokeStyle = 'rgba(28,24,20,.45)'; X.stroke(); X.restore();
  X.restore();
}
function puggBody(x, y, s, o = {}) { // seated giant: y = floor. Head drawn by caller at returned point
  X.save(); X.translate(x, y); X.scale(s, s);
  for (const d of [-1, 1]) { const lx = d * 150; shape(R(lx - 70, -360, 140, 360), { lw: 3, id: 7300 + d, h: [1.57, 4, 0.5], sh: R(lx + 10, -360, 60, 360), sh2: [1.57, 2, 0.8] }); for (let i = 0; i < 8; i++) line([lx - 70, -340 + i * 44], [lx + 70, -340 + i * 44], 1.2, 7310 + i + d * 10, 0.2); shape(R(lx - 90, -40, 180, 40), { lw: 2.4, id: 7330 + d, h: [0, 3, 0.6] }); }
  shape([[-380, -1000], [380, -1000], [300, -300], [-300, -300]], { lw: 3, id: 7340, h: [[1.4, 4, 0.5]], sh: [[60, -1010], [400, -1010], [400, -290], [60, -290]], sh2: [1.5, 2.2, 0.7] });
  stip([[-380, -1000], [380, -1000], [300, -300], [-300, -300]], 7341, 0.003, 2.4);
  for (let i = 0; i < 10; i++) ball(-300 + i * 66, -960, 6, 7350 + i, PAT.f, 1);
  X.restore();
}
function paw(x, y, s, ang, open, id = 7400) {
  X.save(); X.translate(x, y); X.rotate(ang); X.scale(s, s);
  shape([[-900, -90], [0, -110], [0, 110], [-900, 90]], { lw: 3, id, h: [0, 4, 0.5], sh: [[-900, 20], [0, 30], [0, 120], [-900, 100]], sh2: [0.05, 2, 0.8] });
  for (let i = 0; i < 8; i++) ball(-800 + i * 100, -96 + (i % 2) * 6, 10, id + 1 + i, PAT.f, 1.2);
  const palm = blobPts(60, 0, 110, 130, id + 20, 30, 0.08); shape(palm, { lw: 3, id: id + 20, h: [0.4, 3.4, 0.5] }); stip(palm, id + 21, 0.006, 2);
  for (let k = 0; k < 4; k++) { const a0 = -0.9 + k * 0.6 + open * (k - 1.5) * 0.25, bx = 60 + Math.cos(a0) * 110, by = Math.sin(a0) * 120; const a1 = a0 + 0.5 - open * 0.6; const kx = bx + Math.cos(a0) * 70, ky = by + Math.sin(a0) * 70, tx = kx + Math.cos(a1) * 70, ty = ky + Math.sin(a1) * 70;
    cap(bx, by, kx, ky, 40, id + 30 + k); ball(kx, ky, 26, id + 40 + k, PAT.m, 2); cap(kx, ky, tx, ty, 34, id + 50 + k);
    shape([[tx + Math.cos(a1 + 1.4) * 18, ty + Math.sin(a1 + 1.4) * 18], [tx + Math.cos(a1) * 60, ty + Math.sin(a1) * 60], [tx + Math.cos(a1 - 1.4) * 18, ty + Math.sin(a1 - 1.4) * 18]], { lw: 2, id: id + 60 + k, h: [a1, 2.4, 0.6] }); }
  X.restore();
}

/* ================= the tape =================
   Panels sit along one strip of paper tape, PW apart. The camera slides along it. */
const PW = 1400, TH = 720, CT = 44, CS = (TH - 2 * CT) / H, CW = W * CS, CX0 = (PW - CW) / 2;
const PANELS = ['book', 'title', 'wastes', 'face', 'paw', 'gold', 'cellar', 'barrel', 'escape', 'flood'];
function tapeBlank(x0, x1) {
  X.fillStyle = P.paper; X.fillRect(x0, 0, x1 - x0, TH);
  for (let x = Math.floor(x0 / 22) * 22; x < x1; x += 22) { X.beginPath(); X.arc(x + 11, 20, 4.2, 0, 6.283); X.fillStyle = '#2b251f'; X.fill(); }
  line([x0, 0.5], [x1, 0.5], 2, 9000, 0.3); line([x0, TH - 0.5], [x1, TH - 0.5], 2, 9001, 0.3);
}
function panelText(k) { const name = PANELS[k], sh = T.shots.find((s) => s.shot === name); if (!sh) return ''; if (name === 'title') return 'THE SIXTH SALLY · OR, HOW TRURL AND KLAPAUCIUS CREATED A DEMON OF THE SECOND KIND TO DEFEAT THE PIRATE PUGG ·'; return sh.lines.map((l) => (T.cast[l.who].name + '. ' + l.say).toUpperCase()).join(' · '); }
const PT_CACHE = {};
function tapePanel(k, lt) {
  const name = PANELS[k], sh = T.shots.find((s) => s.shot === name), x0 = k * PW;
  tapeBlank(x0, x0 + PW);
  X.save(); X.translate(x0 + CX0, CT); X.scale(CS, CS); X.beginPath(); X.rect(0, 0, W, H); X.clip();
  X.fillStyle = P.paper; X.fillRect(0, 0, W, H);
  SHOTS[name](clamp(lt, 0, sh.d), sh.d, sh);
  X.restore();
  ink([[x0 + CX0, CT], [x0 + CX0 + CW, CT], [x0 + CX0 + CW, TH - CT], [x0 + CX0, TH - CT], [x0 + CX0, CT]], 2.4, 9010 + k, 0.4);
  if (!PT_CACHE[k]) PT_CACHE[k] = panelText(k);
  X.save(); X.beginPath(); X.rect(x0 + CX0, TH - CT, CW, CT); X.clip(); mono(PT_CACHE[k], x0 + CX0, TH - CT / 2 + 1, 11.5, { col: '#3a332b' }); X.restore();
  X.save(); X.globalAlpha = 0.5; mono(String(k + 1).padStart(2, '0'), x0 + 30, TH - CT / 2, 12, { bold: true }); X.restore();
}
/* panel shots: lt runs from the start of the shot; the first PAN seconds slide the tape */
const PAN = 1.3;
function tapeView(name, lt) {
  const k = PANELS.indexOf(name), u = k > 0 ? seg(lt, 0, PAN, E.io) : 1, cx = lerp((k - 1) * PW + PW / 2, k * PW + PW / 2, u);
  X.save(); X.translate(CX - cx, 0);
  if (u < 1 && k > 0) { const prev = T.shots.find((s) => s.shot === PANELS[k - 1]); tapePanel(k - 1, prev.d); }
  tapePanel(k, lt);
  if (k < PANELS.length - 1 && u >= 1) tapeBlank(k * PW + PW, k * PW + PW + 200);
  if (k === 0) tapeBlank(-400, 0);
  X.restore();
}

/* ================= rooms and things ================= */
function shop(lt) {
  darkWall(-400, -300, 1800, 1400, 3);
  shape(R(820, 90, 300, 220), { lw: 3, id: 1000, fill: P.paper }); X.save(); path(R(824, 94, 292, 212)); X.clip(); for (let i = 0; i < 30; i++) { X.fillStyle = P.ink; X.fillRect(824 + hash(1001, i) * 290, 94 + hash(1002, i) * 210, 2, 2); } X.restore(); line([970, 90], [970, 310], 2, 1003, 0.1); line([820, 200], [1120, 200], 2, 1004, 0.1);
  for (const sy of [210, 330]) { shape(R(60, sy, 360, 14), { lw: 1.6, id: 1010 + sy, h: [0, 2.4, 0.6] }); for (let i = 0; i < 9; i++) shape(R(70 + i * 38, sy - 60 - hash(1020 + sy, i) * 20, 30, 60 + hash(1020 + sy, i) * 20), { lw: 1.2, id: 1030 + i + sy, h: [1.57, 3 + (i % 3), 0.5] }); }
  shape([[-400, 640], [1800, 640], [1800, 1000], [-400, 1000]], { lw: 1.6, id: 1100, h: [0.03, 5, 0.5] });
  shape(R(480, 470, 300, 18), { lw: 1.8, id: 1110, h: [0, 2.4, 0.6] }); line([500, 488], [500, 640], 4, 1111, 0.1); line([760, 488], [760, 640], 4, 1112, 0.1);
}
function book(x, y, s, open, id) { X.save(); X.translate(x, y); X.scale(s, s);
  shape([[-110, 0], [0, 10], [0, -150], [-110, -160]], { lw: 2, id, fill: P.paper }); shape([[110, 0], [0, 10], [0, -150], [110, -160]], { lw: 2, id: id + 1, fill: P.paper });
  for (let i = 0; i < 12; i++) line([-100, -140 + i * 11], [-12, -132 + i * 11], 0.8, id + 2 + i, 0.2);
  if (open) { X.save(); path([[10, -146], [100, -150], [100, -10], [10, -4]]); X.clip(); X.translate(55, -78); X.scale(0.16, 0.16); engraving(GT); X.restore(); }
  X.restore(); }
function schooner(x, y, s, id, ang = 0) { X.save(); X.translate(x, y); X.rotate(ang); X.scale(s, s); shape([[-60, 0], [60, 0], [44, 18], [-44, 18]], { lw: 1.6, id, h: [0, 2.4, 0.6] }); line([0, 0], [0, -90], 2, id + 1, 0.1); shape([[2, -86], [50, -20], [2, -16]], { lw: 1.2, id: id + 2 }); shape([[-2, -80], [-40, -18], [-2, -14]], { lw: 1.2, id: id + 3 }); X.restore(); }
function engraving(lt) { // the Anonymoid eating two photon schooners, as engraved in the old book
  X.fillStyle = P.paper; X.fillRect(-640, -360, 1280, 720); X.save(); X.globalAlpha = 0.8; for (let y = -360; y < 360; y += 4) { X.fillStyle = P.ink; X.fillRect(-640, y, 1280, 1.4); } X.restore();
  for (let i = 0; i < 40; i++) star(-600 + hash(1200, i) * 1200, -340 + hash(1201, i) * 300, 6, 1210 + i, P.paper, 5);
  for (let i = 40; i >= 0; i--) { const u = i / 40, bx = -520 + u * 900, by = 200 - Math.sin(u * 7 + lt) * 120 * (1 - u * 0.4); ball(bx, by, 50 - u * 20, 1300 + i, PAT.m, 2); }
  const hx = 380, hy = -60; shape([[hx - 80, hy - 70], [hx + 180, hy - 150], [hx + 230, hy - 60], [hx + 60, hy + 10]], { lw: 3, id: 1400, h: [0.4, 3, 0.6] }); shape([[hx - 80, hy + 40], [hx + 60, hy + 30], [hx + 230, hy + 140], [hx + 180, hy + 190]], { lw: 3, id: 1401, h: [0.4, 3, 0.6] });
  for (let i = 0; i < 8; i++) { shape([[hx + 70 + i * 20, hy - 30 - i * 14], [hx + 80 + i * 20, hy - 6 - i * 12], [hx + 90 + i * 20, hy - 34 - i * 14]], { lw: 1, id: 1410 + i, fill: P.paper }); }
  X.beginPath(); X.arc(hx - 20, hy - 70, 18, 0, 6.283); X.fillStyle = P.paper; X.fill(); X.beginPath(); X.arc(hx - 16, hy - 70, 8, 0, 6.283); X.fillStyle = P.ink; X.fill();
  schooner(hx + 140, hy + 40, 1.0, 1420, -0.4); schooner(hx + 20, hy + 220, 1.3, 1430, 0.3);
}
function junk(n, id, x0, y0, w, h, lt, drift = 1) {
  for (let i = 0; i < n; i++) { const x = x0 + ((hash(id, i) * w + lt * (10 + hash(id + 1, i) * 30) * drift) % w), y = y0 + hash(id + 2, i) * h, a = lt * (hash(id + 3, i) - 0.5) * 1.4 + i, s = 0.4 + hash(id + 4, i) * 1.2, kind = i % 5;
    X.save(); X.translate(x, y); X.rotate(a); X.scale(s, s);
    if (kind === 0) { shape(R(-12, -18, 24, 36), { lw: 1.2, id: id + 10 + i, h: [1.57, 2.6, 0.6] }); X.beginPath(); X.ellipse(0, -18, 12, 4, 0, 0, 6.283); X.fillStyle = P.paper; X.fill(); X.lineWidth = 1; X.stroke(); }
    else if (kind === 1) { X.beginPath(); for (let k = 0; k < 16; k++) { const aa = k / 16 * 6.283, r = k % 2 ? 14 : 20; X.lineTo(Math.cos(aa) * r, Math.sin(aa) * r); } X.closePath(); X.fillStyle = P.paper; X.fill(); X.lineWidth = 1.2; X.strokeStyle = P.ink; X.stroke(); X.beginPath(); X.arc(0, 0, 5, 0, 6.283); X.stroke(); }
    else if (kind === 2) shape([[-30, -6], [30, -10], [26, 8], [-26, 10]], { lw: 1.2, id: id + 20 + i, h: [0.3, 2, 0.6] });
    else if (kind === 3) { X.beginPath(); X.arc(0, 0, 16, 0, 6.283); X.fillStyle = PAT.d; X.fill(); for (let k = 0; k < 3; k++) ink([[-10 + k * 6, -8], [-4 + k * 6, 2], [-8 + k * 6, 10]], 1, id + 30 + i + k, 0.3, P.paper); }
    else { line([-24, 0], [24, 0], 3, id + 40 + i, 0.1); line([-24, -6], [-24, 6], 3, id + 41 + i, 0.1); }
    X.restore(); }
}
function ship(x, y, s, ang, id = 1500) { X.save(); X.translate(x, y); X.rotate(ang); X.scale(s, s);
  shape([[-140, -40], [80, -40], [160, 0], [80, 40], [-140, 40]], { lw: 2.4, id, h: [0, 3, 0.6], sh: [[-150, 10], [170, 10], [170, 50], [-150, 50]], sh2: [0, 1.6, 0.8] });
  for (let i = 0; i < 3; i++) { X.beginPath(); X.arc(-60 + i * 50, -6, 10, 0, 6.283); X.fillStyle = P.paper; X.fill(); X.lineWidth = 1.6; X.strokeStyle = P.ink; X.stroke(); }
  shape([[-140, -40], [-180, -70], [-170, -30]], { lw: 1.6, id: id + 1, h: [0.6, 2.4, 0.6] }); shape([[-140, 40], [-180, 70], [-170, 30]], { lw: 1.6, id: id + 2, h: [0.6, 2.4, 0.6] });
  X.restore(); }
function cabin(lt, o = {}) {
  darkWall(-400, -300, 1800, 1400, 3.4);
  shape([[-400, 600], [1800, 600], [1800, 1000], [-400, 1000]], { lw: 1.6, id: 1600, h: [0.03, 5, 0.5] });
  for (let i = 0; i < 6; i++) line([-100 + i * 260, -300], [-100 + i * 260, 600], 6, 1610 + i, 0.1);
  const br = o.broken || 0;
  shape(R(120, 300, 300, 300), { lw: 2, id: 1620, h: [1.57, 4, 0.5] }); for (let i = 0; i < 3; i++) shape(R(140, 320 + i * 90, 260, 70), { lw: 1.4, id: 1621 + i, fill: P.paper });
  if (br < 0.5) { shape(R(60, 180, 420, 14), { lw: 1.6, id: 1630, h: [0, 2.4, 0.6] }); for (let i = 0; i < 6; i++) { X.beginPath(); X.ellipse(90 + i * 66, 160, 26, 18, 0, 0, 6.283); X.fillStyle = P.paper; X.fill(); X.lineWidth = 1.6; X.strokeStyle = P.ink; X.stroke(); line([90 + i * 66 + 24, 158], [90 + i * 66 + 50, 150], 3, 1631 + i, 0.1); } }
  shape(R(500, 470, 260, 16), { lw: 1.8, id: 1640, h: [0, 2.4, 0.6] }); if (br < 0.5) { line([520, 486], [520, 600], 4, 1641, 0.1); line([740, 486], [740, 600], 4, 1642, 0.1); }
  X.beginPath(); X.arc(1080, 320, 170, 0, 6.283); X.lineWidth = 10; X.strokeStyle = P.ink; X.stroke(); X.beginPath(); X.arc(1080, 320, 186, 0, 6.283); X.lineWidth = 2; X.stroke(); for (let i = 0; i < 12; i++) { const a = i / 12 * 6.283; ball(1080 + Math.cos(a) * 178, 320 + Math.sin(a) * 178, 5, 1650 + i, PAT.f, 1); }
}
function hatchWin(lt, fn, open = 1) { // what is outside the hatch: darkness, or the face
  X.save(); X.beginPath(); X.arc(1080, 320, 165, 0, 6.283); X.clip(); X.fillStyle = '#1c1814'; X.fillRect(900, 140, 360, 360);
  if (fn) fn();
  if (open < 1) { X.fillStyle = P.paper; X.fillRect(900, 140, 360 * (1 - open), 360); X.save(); path(R(900, 140, 360 * (1 - open), 360)); X.clip(); hatch(0.8, 3, 0.6, [900, 140, 1260, 500]); X.restore(); }
  X.restore();
}
function cellarHall(lt, depth = 0) {
  darkWall(-400, -300, 1800, 1400, 2.4);
  for (let i = 0; i < 5; i++) { const s = 1 - i * 0.17, cx = 640, w = 1100 * s, top = 360 - 330 * s; X.beginPath(); X.moveTo(cx - w / 2, 720); X.lineTo(cx - w / 2, top + w * 0.25); X.quadraticCurveTo(cx, top - w * 0.1, cx + w / 2, top + w * 0.25); X.lineTo(cx + w / 2, 720); X.lineWidth = 3 * s; X.strokeStyle = P.ink; X.stroke(); }
  shape([[-400, 620], [1800, 620], [1800, 1000], [-400, 1000]], { lw: 1.6, id: 1700, h: [0.03, 4, 0.5] });
  for (let i = 0; i < 26; i++) { const side = i % 2 ? 1 : -1, row = Math.floor(i / 2), s = 1 - row * 0.07, x = 640 + side * (520 - row * 30) * s, y = 600 - row * 22; if (s > 0.15) sack(x + side * hash(1710, i) * 30, y, 44 * s, 1720 + i, i % 4 === 0); }
}
function catalog(x, y, s, lt) { X.save(); X.translate(x, y); X.scale(s, s);
  shape(R(-120, -170, 240, 300), { lw: 3, id: 1800, h: [1.57, 6, 0.35] }); txt('A', 0, -110, 70, {}); for (let i = 0; i < 9; i++) line([-90, -50 + i * 18], [90 - hash(1801, i) * 50, -50 + i * 18], 1, 1802 + i, 0.2);
  for (let i = 0; i < 7; i++) { X.beginPath(); X.ellipse(-120 - 14 - i * 16, -150 - i * 8, 9, 6, 0.3, 0, 6.283); X.lineWidth = 3; X.strokeStyle = P.ink; X.stroke(); }
  X.restore(); }
function barrel(x, y, s, id = 1900) { X.save(); X.translate(x, y); X.scale(s, s);
  shape([[-90, 0], [-100, -110], [-90, -220], [90, -220], [100, -110], [90, 0]], { lw: 2.6, id, h: [1.57, 3.4, 0.5], sh: [[20, -230], [110, -230], [110, 10], [20, 10]], sh2: [1.57, 1.8, 0.8] });
  for (const yy of [-40, -180]) line([-96, yy], [96, yy], 4, id + 1 + yy, 0.2);
  X.beginPath(); X.ellipse(0, -220, 90, 18, 0, 0, 6.283); X.fillStyle = P.paper; X.fill(); X.lineWidth = 2.4; X.strokeStyle = P.ink; X.stroke(); X.beginPath(); X.arc(10, -220, 2.4, 0, 6.283); X.fillStyle = P.ink; X.fill();
  stip([[-90, 0], [-100, -110], [-90, -220], [90, -220], [100, -110], [90, 0]], id + 9, 0.004, 2);
  X.restore(); }
function demon(x, y, s, lt, busy = 1) { X.save(); X.translate(x, y); X.scale(s, s);
  for (let i = 0; i < 6; i++) { const a = Math.PI * (0.15 + i * 0.14), w = Math.sin(lt * 30 * busy + i) * 0.1; ink([[0, 0], [Math.cos(a + w) * 16, Math.sin(a + w) * 6 + 2], [Math.cos(a + w) * 22, 10]], 1.2, 2000 + i, 0.1); }
  X.beginPath(); X.ellipse(0, -2, 12, 8, 0, 0, 6.283); X.fillStyle = P.paper; X.fill(); X.lineWidth = 1.4; X.strokeStyle = P.ink; X.stroke();
  X.beginPath(); X.arc(4, -8, 6, 0, 6.283); X.fillStyle = P.paper; X.fill(); X.stroke(); X.beginPath(); X.arc(5 + Math.sin(lt * 40) * 1.5 * busy, -8, 2.6, 0, 6.283); X.fillStyle = P.ink; X.fill();
  const jit = busy * Math.sin(lt * 90) * 3; line([8, -4], [22, 10 + jit], 1.4, 2010, 0.05); X.beginPath(); X.moveTo(22, 8 + jit); X.lineTo(25, 12 + jit); X.lineTo(22, 16 + jit); X.lineTo(19, 12 + jit); X.closePath(); X.fillStyle = P.paper; X.fill(); X.lineWidth = 1; X.stroke();
  if (busy > 0.3 && hash(BOIL, 3) < 0.7) star(22, 16 + jit, 6, 2020 + (BOIL % 7), P.ink, 6);
  X.restore(); }
/* a strip of tape from a to b, width w, printed with text that scrolls by `off` */
function tapeSeg(a, b, w, text, off, id, size = 9) {
  const dx = b[0] - a[0], dy = b[1] - a[1], L_ = Math.hypot(dx, dy), ang = Math.atan2(dy, dx);
  X.save(); X.translate(a[0], a[1]); X.rotate(ang);
  X.fillStyle = P.paper; X.fillRect(0, -w / 2, L_, w); X.lineWidth = 1.1; X.strokeStyle = P.ink; X.strokeRect(0, -w / 2, L_, w);
  if (text) { X.save(); X.beginPath(); X.rect(0, -w / 2, L_, w); X.clip(); mono(text, -(off % 4000), 0.5, size, { col: '#2b251f' }); X.restore(); }
  X.restore(); }
function roll(x, y, r, lt) { X.beginPath(); X.arc(x, y, r, 0, 6.283); X.fillStyle = P.paper; X.fill(); X.lineWidth = 2; X.strokeStyle = P.ink; X.stroke(); for (let i = 1; i < 6; i++) { X.beginPath(); X.arc(x, y, r * i / 6, 0, 6.283); X.lineWidth = 0.6; X.stroke(); } const a = lt * 6; line([x, y], [x + Math.cos(a) * r * 0.8, y + Math.sin(a) * r * 0.8], 1.6, 2100, 0.1); }
function coils(cx, cy, n, id, lt, rx = 360, ry = 120) { for (let i = 0; i < n; i++) { const r = 1 + 0.03 * i, a = (hash(id, i) - 0.5) * 0.9, ox = (hash(id + 1, i) - 0.5) * 120, oy = (hash(id + 2, i) - 0.5) * 260; X.save(); X.translate(cx + ox, cy + oy); X.rotate(a); X.beginPath(); X.ellipse(0, 0, rx * r, ry * r, 0, 0, 6.283); X.lineWidth = 22; X.strokeStyle = P.ink; X.stroke(); X.lineWidth = 19; X.strokeStyle = P.paper; X.stroke(); X.setLineDash([3, 2, 1, 3, 4, 2]); X.lineDashOffset = i * 7; X.lineWidth = 3; X.strokeStyle = 'rgba(28,24,20,.55)'; X.stroke(); X.setLineDash([]); X.restore(); } }

/* gas: particles bouncing in a box; at each 'form' cue some of them gather into a word */
let GLYPHS = null;
function glyphPts(word) { const c = document.createElement('canvas'); c.width = 300; c.height = 120; const g = c.getContext('2d'); g.fillStyle = '#000'; g.font = 'bold 96px "IBM Plex Mono",monospace'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(word, 150, 64); const d = g.getImageData(0, 0, 300, 120).data, p = []; for (let y = 0; y < 120; y += 5) for (let x = 0; x < 300; x += 5) if (d[(y * 300 + x) * 4 + 3] > 128) p.push([(x - 150) / 300, (y - 60) / 120]); return p; }
function gasBox(x, y, w, h, lt, forms, id = 2200) {
  if (!GLYPHS) GLYPHS = { A: glyphPts('A'), IF: glyphPts('IF'), TRUE: glyphPts('TRUE') };
  shape(R(x - w / 2, y - h / 2, w, h), { lw: 3, id, fill: P.paper });
  X.save(); path(R(x - w / 2, y - h / 2, w, h)); X.clip();
  const tri = (v) => { const m = ((v % 2) + 2) % 2; return m < 1 ? m : 2 - m; };
  let G = null, gu = 0; for (const f of forms) { const u = seg(lt, f.at - 0.5, f.at, E.io) * (1 - seg(lt, f.at + 1.0, f.at + 1.6, E.io)); if (u > gu) { gu = u; G = GLYPHS[f.word]; } }
  for (let i = 0; i < 520; i++) { const px = x - w / 2 + 6 + (w - 12) * tri(hash(id, i) * 2 + lt * (0.2 + hash(id + 1, i) * 0.5)), py = y - h / 2 + 6 + (h - 12) * tri(hash(id + 2, i) * 2 + lt * (0.2 + hash(id + 3, i) * 0.5));
    let qx = px, qy = py; if (G && i < G.length) { qx = lerp(px, x + G[i][0] * w * 0.9, gu); qy = lerp(py, y + G[i][1] * h * 0.9, gu); }
    X.fillStyle = P.ink; X.beginPath(); X.arc(qx, qy, 2.2, 0, 6.283); X.fill(); }
  X.restore();
}

/* ================= shots ================= */
const SHOTS = {};
SHOTS.book = (lt, sd, sh) => {
  const L_ = sh.lines, pg = cue(sh, 'page'), insert = lt > pg.at && lt < pg.to;
  if (insert) { cam(camFor(lt - pg.at, [[0, ON(640, 360, 1.0)], [0.2, ON(700, 330, 1.25)]], 4), () => { X.save(); X.translate(640, 360); engraving(lt); X.restore(); }); return; }
  const c = camFor(lt, [[0, ON(640, 380, 1.0)], [L_[2].t0 - 0.3, ON(760, 360, 1.35)], [L_[4].t0 - 0.3, ON(520, 360, 1.3)]]);
  cam(c, () => { shop(lt); const te = sayAt(sh, 'T', lt); trurl(500, 640, 1.0, sh, lt, { f: 1, ra: [-0.3, -0.6], la: [-0.1, -0.7], look: 0.6, lookY: 1 }); book(560, 470, 0.7, true, 1150); klap(840, 640, 1.0, sh, lt, { f: -1, seated: true, look: -1 }); void te; });
};
SHOTS.title = (lt) => { X.fillStyle = P.paper; X.fillRect(0, 0, W, H); txt('THE SIXTH SALLY', CX, 260, 68, {}); txt('or, The Demon of the Second Kind', CX, 340, 34, { italic: true }); txt('after Stanisław Lem, The Cyberiad', CX, 430, 22, { italic: true });
  const n = Math.floor(clamp((lt - 1.4) / 4) * 60); const s = 'WHICH WAS, IS, MAY BE OR EVER WILL BE · ALL OF IT TRUE ·'.slice(0, n); mono(s, CX, 540, 16, { align: 'center' }); };
SHOTS.wastes = (lt, sd, sh) => {
  const lu = cue(sh, 'lurch').at, cr = cue(sh, 'crunch').at, bg = cue(sh, 'bang');
  const dark = seg(lt, cr - 0.4, cr + 1.2);
  const c = camFor(lt, [[0, ON(640, 360, 1.0)], [lu - 0.4, ON(760, 400, 1.2)]]);
  cam(c, () => { X.fillStyle = P.paper; X.fillRect(-400, -300, 2200, 1400); for (let y = -300; y < 1100; y += 3) { X.fillStyle = P.ink; X.fillRect(-400, y, 2200, 1.1 + 0.4 * hash(y, 2)); }
    for (let i = 0; i < 6; i++) { const sx = 100 + i * 220, sy = 100 + hash(2300, i) * 200, r = 20 + hash(2301, i) * 30; X.beginPath(); X.arc(sx, sy, r, 0, 6.283); X.fillStyle = P.paper; X.fill(); X.lineWidth = 1.4; X.strokeStyle = P.ink; X.stroke(); for (let k = 0; k < 4; k++) ink([[sx - r * 0.6 + k * r * 0.3, sy - r * 0.5], [sx - r * 0.4 + k * r * 0.3, sy], [sx - r * 0.6 + k * r * 0.3, sy + r * 0.5]], 0.9, 2310 + i * 5 + k, 0.4); }
    junk(70, 2400, -300, -100, 1900, 900, lt);
    const heap = blobPts(1020, 760, 520, 300, 2500, 40, 0.12); shape(heap, { fill: '#1c1814', lw: 2, id: 2500 }); junk(30, 2600, 600, 500, 900, 300, 0, 0);
    let sx = lerp(-200, 700, seg(lt, 0, lu, E.lin)), sy = 360, sa = 0;
    if (lt > lu) { const u = seg(lt, lu, cr, E.in); sx = lerp(700, 830, u); sy = lerp(360, 500, u); sa = lerp(0, 0.5, u) + Math.sin(lt * 14) * 0.1 * (1 - u); }
    const shake = lt > bg.at && lt < bg.to ? Math.sin(lt * 60) * 4 : 0;
    ship(sx + shake, sy, 0.9, sa);
    if (lt > cue(sh, 'sand').at) for (let i = 0; i < 60; i++) { const u = (lt * 2 + hash(2700, i)) % 1, px = sx + 200 - u * 600, py = sy - 80 + hash(2701, i) * 160; X.fillStyle = P.paper; X.fillRect(px, py, 2, 2); }
    if (dark > 0) { X.save(); X.globalAlpha = dark * 0.9; X.fillStyle = '#1c1814'; X.fillRect(-400, -300, 2200, 1400); X.restore(); }
    if (lt > bg.at) { const k = Math.floor((lt - bg.at) / 0.55); if (lt < bg.to + 0.4 && (lt - bg.at) % 0.55 < 0.12) { X.save(); X.globalAlpha = 0.5; star(sx + 120, sy - 20, 60, 2800 + k, P.paper, 10); X.restore(); } }
  });
};
SHOTS.face = (lt, sd, sh) => {
  const L_ = sh.lines, hc = cue(sh, 'hatch').at, wh = cue(sh, 'whistle'), pe = sayAt(sh, 'P', lt);
  const whU = seg(lt, wh.at, wh.at + 0.3) * (1 - seg(lt, wh.to, wh.to + 0.6));
  const c = camFor(lt, [[0, ON(640, 360, 1.0)], [L_[0].t0 + 0.6, ON(1080, 320, 1.9)], [L_[1].t0 - 0.3, ON(560, 380, 1.15)], [L_[2].t0 - 0.3, ON(1060, 330, 1.7)], [L_[4].t0 - 0.3, ON(800, 360, 1.1)], [wh.at, ON(700, 380, 1.0)]]);
  cam(c, () => { cabin(lt);
    hatchWin(lt, lt > hc + 0.3 ? () => puggFace(1080, 300, 0.85, { look: talking(sh, 'T', lt) ? [-1, 0.3] : [-0.6, 0.2], dart: lt < L_[1].t0 ? 0.9 : 0.25, mouth: pe + whU * 0.7 }) : null, seg(lt, hc, hc + 0.6));
    const tw = whU > 0;
    trurl(560, 600, 1.0, sh, lt, { f: 1, ra: tw ? [-2.2, -2.6] : undefined, la: tw ? [-2.0, -2.4] : undefined, tilt: tw ? Math.sin(lt * 20) * 0.04 : 0 });
    klap(360, 600, 1.0, sh, lt, { f: 1, ra: tw ? [-2.1, -2.6] : lt > L_[1].t0 && lt < L_[1].t1 ? [0.2, 0.5] : undefined, la: tw ? [-2.0, -2.4] : undefined });
    if (tw) { X.save(); X.globalAlpha = whU; for (let i = 0; i < 7; i++) { X.beginPath(); X.arc(1000, 420, 60 + i * 70 + (lt * 200) % 70, Math.PI * 0.8, Math.PI * 1.25); X.lineWidth = 2; X.strokeStyle = P.ink; X.stroke(); } X.restore(); }
  });
};
SHOTS.paw = (lt, sd, sh) => {
  const L_ = sh.lines, pw = cue(sh, 'paw'), pk = cue(sh, 'poker'), pe = sayAt(sh, 'P', lt);
  const engine = lt > pk.at - 0.8 && lt < L_[1].t0 - 0.2;
  if (engine) { cam(camFor(lt, [[0, ON(640, 380, 1.0)]]), () => { darkWall(-400, -300, 1800, 1400, 3);
      shape([[-400, 640], [1800, 640], [1800, 1000], [-400, 1000]], { lw: 1.6, id: 3000, h: [0.03, 5, 0.5] });
      shape(R(440, 380, 340, 260), { lw: 3, id: 3001, h: [1.57, 3, 0.5], sh: R(660, 380, 120, 260), sh2: [1.57, 1.6, 0.8] }); X.beginPath(); X.ellipse(610, 380, 170, 30, 0, 0, 6.283); X.fillStyle = P.paper; X.fill(); X.lineWidth = 3; X.strokeStyle = P.ink; X.stroke(); for (let i = 0; i < 5; i++) { X.beginPath(); X.arc(610, 520, 30 + i * 18, 0, 6.283); X.lineWidth = 1; X.stroke(); }
      const hit = Math.max(0, Math.sin((lt - pk.at) * Math.PI / 0.42)), hitting = lt > pk.at && lt < pk.to;
      paw(1010, 190, 0.55, Math.PI + 0.15, hitting ? 0.4 + 0.3 * hit : 0.6);
      trurl(560, 380, 0.85, sh, lt, { f: 1, ra: hitting ? [lerp(-0.7, -0.15, hit), lerp(-0.7, -0.15, hit)] : [-0.7, -0.7] }); if (hitting || lt < pk.at) { X.save(); X.translate(560 + 30 * 0.85, 380 - 214 * 0.85); X.rotate(hitting ? lerp(-0.7, -0.15, hit) : -0.7); line([0, 0], [230, 0], 5, 3010, 0.05); X.restore(); }
      klap(680, 380, 0.85, sh, lt, { f: 1, ra: [-0.4, -0.8], look: 1 }); }); return; }
  const rum = seg(lt, pw.at, pw.at + 0.8) * (1 - seg(lt, pw.to, pw.to + 0.8)), phase = (lt - pw.at) * 1.6;
  const c = camFor(lt, [[0, ON(800, 340, 1.4)], [pw.at, ON(640, 380, 1.0)], [L_[1].t0 - 0.3, ON(1060, 330, 1.7)], [L_[2].t0 - 0.3, ON(420, 380, 1.3)], [L_[3].t0 - 0.3, ON(1060, 330, 1.7)], [L_[4].t0 - 0.3, ON(420, 360, 1.4)]]);
  cam(c, () => { cabin(lt, { broken: lt > pw.at + 1.5 ? 1 : 0 });
    if (rum < 0.05) hatchWin(lt, () => puggFace(1080, 300, 0.85, { look: [-0.7, 0.2], dart: 0.3, mouth: pe }));
    else hatchWin(lt, null);
    if (rum > 0) { const px = lerp(1250, 700 + Math.sin(phase) * 300, rum), py = 360 + Math.cos(phase * 1.3) * 150; paw(px, py, 0.55, Math.PI + Math.sin(phase * 0.7) * 0.4, 0.5 + 0.5 * Math.sin(phase * 2));
      for (let i = 0; i < 10; i++) { const u = ((lt - pw.at) * 0.7 + hash(3100, i)) % 1; X.save(); X.translate(200 + hash(3101, i) * 900, 100 + u * 520 - Math.sin(u * Math.PI) * 200); X.rotate(u * 10 + i); X.beginPath(); X.ellipse(0, 0, 22, 14, 0, 0, 6.283); X.fillStyle = P.paper; X.fill(); X.lineWidth = 1.6; X.strokeStyle = P.ink; X.stroke(); line([20, 0], [44, -6], 3, 3110 + i, 0.1); X.restore(); } }
    if (lt > pw.at + 1.5) for (let i = 0; i < 12; i++) { X.save(); X.translate(60 + hash(3200, i) * 1100, 590 + hash(3201, i) * 20); X.rotate(hash(3202, i) * 3); shape(R(-30, -6, 60, 12), { lw: 1.2, id: 3210 + i, h: [0, 2, 0.6] }); X.restore(); }
    const flee = rum > 0.2;
    trurl(flee ? 300 + Math.sin(lt * 3) * 80 : 560, 600, 1.0, sh, lt, { f: flee ? -1 : 1, walk: flee ? 1 : 0, ra: lt > L_[1].t0 ? [1.2, 1.0] : undefined });
    klap(flee ? 160 + Math.sin(lt * 3 + 1) * 60 : 360, 600, 1.0, sh, lt, { f: flee ? -1 : 1, walk: flee ? 1 : 0 });
  });
};
SHOTS.gold = (lt, sd, sh) => {
  const L_ = sh.lines, kn = cue(sh, 'knead'), ng = cue(sh, 'nugget').at, pe = sayAt(sh, 'P', lt);
  const knU = seg(lt, kn.at, kn.at + 0.3) * (lt < ng ? 1 : 0), nug = lt > ng;
  const c = camFor(lt, [[0, ON(760, 380, 1.1)], [kn.at - 0.2, ON(640, 420, 1.9)], [L_[2].t0 - 0.3, ON(1060, 330, 1.7)], [L_[3].t0 - 0.3, ON(700, 380, 1.2)], [L_[4].t0 - 0.3, ON(1080, 310, 2.1)], [L_[5].t0 - 0.3, ON(760, 380, 1.1)], [L_[6].t0 - 0.2, ON(1080, 310, 2.4)]]);
  cam(c, () => { cabin(lt, { broken: 1 });
    hatchWin(lt, () => puggFace(1080, 300, 0.85, { look: [-1, 0.6], dart: lt > L_[6].t0 ? 1 : 0.1, mouth: pe, sniff: lt > ng && lt < L_[2].t1 ? 1 : 0 }));
    const hx = 640, hy = 430;
    trurl(560, 600, 1.0, sh, lt, { f: 1, ra: knU > 0 || nug ? [-0.5 + Math.sin(lt * 30) * 0.2 * knU, -0.6 + Math.cos(lt * 28) * 0.2 * knU] : undefined, la: knU > 0 ? [-0.3, -0.5] : undefined });
    if (knU > 0) { const sp = (lt - kn.at) / (kn.to - kn.at); for (let i = 0; i < 40; i++) { const a = lt * (6 + 30 * sp) + i * 0.6, r = 30 + 40 * hash(3300, i) * (1 - sp * 0.6); X.fillStyle = P.ink; X.beginPath(); X.arc(hx + Math.cos(a) * r, hy + Math.sin(a) * r * 0.6, 2.4, 0, 6.283); X.fill(); } }
    if (nug) { const nx = 640, ny = 410; X.beginPath(); for (let k = 0; k < 9; k++) { const a = k / 9 * 6.283, r = 16 + hash(3400, k) * 7; X.lineTo(nx + Math.cos(a) * r, ny + Math.sin(a) * r); } X.closePath(); X.fillStyle = P.ochre; X.fill(); X.lineWidth = 1.6; X.strokeStyle = P.ink; X.stroke(); if (hash(BOIL, 5) < 0.6) star(nx + 8, ny - 8, 12, 3410 + (BOIL % 5), P.ink, 6); }
    klap(360, 600, 1.0, sh, lt, { f: 1, look: 1 });
  });
};
SHOTS.cellar = (lt, sd, sh) => {
  const L_ = sh.lines, wk = cue(sh, 'walk'), gs = cue(sh, 'gas'), pc = cue(sh, 'pounce').at;
  const forms = cues(sh, 'form').map((f, i) => ({ at: f.at, word: ['A', 'IF', 'A'][i] })).concat([{ at: pc - 0.4, word: 'TRUE' }]);
  const boxOn = lt > gs.at && lt < L_[6].t0 - 0.3;
  if (boxOn) { const c = camFor(lt - gs.at, [[0, ON(640, 360, 1.0)]]); cam(c, () => { darkWall(-400, -300, 1800, 1400, 2.4); gasBox(640, 360, 900, 520, lt, forms);
      const du = seg(lt, pc - 0.2, pc + 0.3); if (lt > pc - 3) demon(lerp(1060, 700, du), lerp(110, 330, du), 2.6, lt, 1);
      if (lt > pc + 0.3) { tapeSeg([700, 380], [1100, 600], 22, 'TRUE · TRUE · TRUE · TRUE · TRUE ·', (lt - pc) * 40, 3500, 12); } }); return; }
  const walking = lt < wk.to, wx = walking ? lerp(1100, 700, lt / wk.to) : 700;
  const c = camFor(lt, [[0, ON(640, 380, 1.0)], [L_[0].t0 + 6, ON(360, 280, 1.6)], [L_[0].t1 - 2, ON(640, 380, 1.0)], [L_[1].t0 - 0.3, ON(860, 220, 1.0)], [L_[6].t0 - 0.3, ON(800, 240, 1.0)], [L_[7].t0 - 0.3, ON(500, 420, 1.4)]]);
  cam(c, () => { cellarHall(lt); catalog(300, 300, 0.9, lt);
    puggBody(wx, 640, 0.42, {}); const step = walking ? Math.abs(Math.sin(lt * 2.8)) * 6 : 0; puggFace(wx, 640 - 0.42 * 1000 - 70 - step, 0.36, { look: [-0.5, 0.6], dart: 0.2, mouth: sayAt(sh, 'P', lt) });
    trurl(walking ? wx - 300 : 420, 640, 0.75, sh, lt, { f: 1, walk: walking ? 1 : 0, look: 1, lookY: -1 }); klap(walking ? wx - 420 : 300, 640, 0.75, sh, lt, { f: 1, walk: walking ? 1 : 0, lookY: -1 });
  });
};
SHOTS.barrel = (lt, sd, sh) => {
  const L_ = sh.lines, bb = cue(sh, 'barrel').at, dm = cue(sh, 'demon').at, pn = cue(sh, 'pen').at;
  const bIn = seg(lt, bb, bb + 1.2), writing = lt > pn, out = writing ? (lt - pn) * 40 : 0;
  const c = camFor(lt, [[0, ON(640, 380, 1.0)], [L_[1].t0, ON(760, 300, 3.0)], [pn + 1.6, ON(640, 380, 1.0)], [L_[2].t0 + 3, ON(560, 320, 1.4)]], 1.2);
  cam(c, () => { cellarHall(lt);
    const bx = 760, by = 640 - lerp(160, 0, bIn); barrel(bx, by, 1.0);
    if (bIn < 1) paw(bx + 200, by - 260, 0.3, Math.PI * 0.75, 0.2);
    if (lt > dm) { line([bx + 40, by - 220], [bx + 40, by - 330], 3, 3600, 0.05); line([bx + 40, by - 330], [bx - 10, by - 330], 3, 3601, 0.05); roll(bx - 10, by - 330, 26, lt * (writing ? 1 : 0)); demon(bx + 10, by - 226, 0.9, lt, writing ? 1 : 0.1);
      if (writing) { tapeSeg([bx + 26, by - 222], [bx + 160, by - 210], 10, T.facts.join(' · ').toUpperCase(), out * 3, 3610, 6); const len = Math.min(500, out * 2); tapeSeg([bx + 160, by - 210], [bx + 200, by + 10], 10, '', 0, 3611); tapeSeg([bx + 200, by + 10], [bx + 200 - len, by + 18], 12, T.facts.slice(3).join(' · ').toUpperCase(), out, 3612, 7); } }
    const sit = seg(lt, L_[2].t0, L_[2].t0 + 2);
    puggBody(380, 640, 0.42); puggFace(380, 640 - 0.42 * 1000 - 70 + sit * 30, 0.36, { look: writing ? [1, 0.8] : [0.6, 0.8], dart: writing ? 0.5 : 0.1 });
    if (lt < L_[2].t0) { trurl(980, 640, 0.75, sh, lt, { f: -1, ra: lt > dm - 1 && lt < dm + 1 ? [3.6, 3.4] : undefined, look: -1 }); klap(1120, 640, 0.75, sh, lt, { f: -1, look: -1 }); }
    else { const go = seg(lt, L_[2].t0 + 2, L_[2].t0 + 6); if (go < 1) { trurl(lerp(980, 1400, go), 640, 0.75, sh, lt, { f: 1, walk: 1 }); klap(lerp(1120, 1500, go), 640, 0.75, sh, lt, { f: 1, walk: 1 }); } }
  });
};
SHOTS.escape = (lt, sd, sh) => {
  const pulls = cues(sh, 'pull'), la = cue(sh, 'launch').at;
  let rock = 0; for (const p of pulls) rock += Math.sin(clamp((lt - p.at) / 0.6) * Math.PI) * 0.12;
  const fly = seg(lt, la, la + 3, E.in);
  const c = camFor(lt, [[0, ON(640, 380, 1.0)]]);
  cam(c, () => { X.fillStyle = P.paper; X.fillRect(-400, -300, 2200, 1400); for (let y = -300; y < 1100; y += 3) { X.fillStyle = P.ink; X.fillRect(-400, y, 2200, 1.1 + 0.4 * hash(y, 2)); }
    junk(50, 3700, -300, -100, 1900, 500, lt);
    const heap = blobPts(640, 900, 900, 420, 3800, 40, 0.1); shape(heap, { fill: '#1c1814', lw: 2, id: 3800 }); junk(40, 3810, -200, 520, 1700, 300, 0, 0);
    X.save(); X.beginPath(); X.arc(380, 640, 16, 0, 6.283); X.fillStyle = P.paper; X.fill(); X.restore(); if (hash(BOIL, 9) < 0.7) star(380, 640, 14, 3820 + BOIL % 5, P.paper, 6);
    const sx = lerp(820, 1600, fly), sy = lerp(520, -300, fly), sa = lerp(0.6 + rock, -0.7, seg(lt, la, la + 1));
    ship(sx, sy, 0.9, sa);
    if (fly > 0) for (let i = 0; i < 20; i++) { const u = hash(3900, i); X.fillStyle = P.paper; X.beginPath(); X.arc(sx - Math.cos(sa) * (160 + u * 200), sy - Math.sin(sa) * (160 + u * 200) + (hash(3901, i) - 0.5) * 40, 3 + u * 8, 0, 6.283); X.fill(); }
  });
};
function floodPicture(lt, sh, o = {}) {
  const k = clamp(lt / 40), en = cue(sh, 'enough').at;
  cellarHall(lt);
  const bx = 980, by = 640; barrel(bx, by, 1.0); line([bx + 40, by - 220], [bx + 40, by - 330], 3, 3600, 0.05); line([bx + 40, by - 330], [bx - 10, by - 330], 3, 3601, 0.05); roll(bx - 10, by - 330, 26, lt * 6); demon(bx + 10, by - 226, 0.9, lt, 1);
  puggBody(470, 660, 0.48); const pe = sayAt(sh, 'P', lt), hurt = lt > en - 0.3 ? 1 : 0;
  // the facts, on the tape in front of his eyes
  const fs = (sh.facts || []).filter((f) => f.t0 <= lt).slice(-6).reverse(), txt_ = fs.map((f) => T.facts[f.i].toUpperCase()).join('  ·  ');
  tapeSeg([bx + 26, by - 222], [760, 300], 30, txt_ + '  ·  ' + T.facts.join(' · ').toUpperCase(), lt * (60 + 600 * k * k), 4000, 15);
  puggFace(470, 660 - 0.48 * 1000 - 80 + Math.sin(lt * 8) * 3 * hurt, 0.42, { look: [1, 0.2], dart: 0.4 + 0.6 * k, swim: clamp((lt - 24) / 12), shut: o.shut || 0, mouth: pe });
  coils(470, 470, Math.floor(1 + k * k * 15), 4100, lt, 300, 80);
  tapeSeg([760, 300], [300, 560], 30, T.facts.slice(5).join(' · ').toUpperCase(), lt * 80, 4001, 15);
  const pile = 20 + k * 110; shape([[-400, 720], [-400, 640 - pile * 0.4], [400, 620 - pile], [900, 640 - pile * 0.5], [1300, 650], [1300, 720]], { lw: 2, id: 4200, fill: P.paper }); X.save(); path([[-400, 720], [-400, 640 - pile * 0.4], [400, 620 - pile], [900, 640 - pile * 0.5], [1300, 650], [1300, 720]]); X.clip(); for (let i = 0; i < 60; i++) { const y = 720 - i * 8; ink([[-400, y], [1300, y - 30]], 0.5, 4210 + i, 1.2); } X.restore();
}
SHOTS.flood = (lt, sd, sh) => {
  const c = camFor(lt, [[0, ON(640, 380, 1.0)], [3, ON(700, 300, 1.25)], [18, ON(560, 260, 1.6)], [30, ON(600, 340, 1.1)]], 6);
  cam(c, () => floodPicture(lt, sh));
};

/* the final pull-back: the tape on the cellar floor carries every panel of the film */
const THUMB = {};
function thumb(k) { if (THUMB[k]) return THUMB[k]; const c = document.createElement('canvas'); c.width = PW; c.height = TH; const keep = X, gt = GT, bo = BOIL; X = c.getContext('2d'); const name = PANELS[k], sh = T.shots.find((s) => s.shot === name); GT = sh.t0 + sh.d; BOIL = Math.floor(GT * 12); X.translate(-k * PW, 0); tapePanel(k, sh.d); X = keep; GT = gt; BOIL = bo; THUMB[k] = c; return c; }
const STRIP_H = 18, STRIP_W = STRIP_H * PW / TH, STRIP_Y = 652, STRIP_R = 1000; // strip right end (flood panel's right edge) in cellar world
SHOTS.today = (lt, sd, sh) => {
  const pl = cue(sh, 'pull'), u = seg(lt, pl.at, pl.to, E.lin);
  const z0 = TH / STRIP_H, z = Math.exp(lerp(Math.log(z0), Math.log(1.0), E.io(u)));
  const k9 = PANELS.length - 1, fx = STRIP_R - STRIP_W / 2, fy = STRIP_Y;
  const w = (1 / z - 1 / z0) / (1 - 1 / z0), sx = lerp(CX, fx, w), sy = lerp(CY, fy, w), cx = fx - (sx - CX) / z, cy = fy - (sy - CY) / z;
  cam({ z, x: cx - CX, y: cy - CY }, () => {
    const fl = T.shots.find((s) => s.shot === 'flood');
    X.save(); X.globalAlpha = 1; floodPicture(fl.d + lt, fl, { shut: 0 }); X.restore();
    // the strip on the floor, with the film on it
    for (let k = 0; k <= k9; k++) { const x0 = STRIP_R - (k9 - k + 1) * STRIP_W; X.drawImage(thumb(k), x0, STRIP_Y - STRIP_H / 2, STRIP_W, STRIP_H); }
    const left = STRIP_R - (k9 + 1) * STRIP_W; tapeSeg([left, STRIP_Y], [left - 600, STRIP_Y + 4], STRIP_H, T.facts.join(' · ').toUpperCase(), 0, 4300, 6);
    tapeSeg([1006, 418], [1112, 428], 10, '', 0, 4301); tapeSeg([1112, 428], [1112, STRIP_Y], 10, '', 0, 4302); tapeSeg([1112, STRIP_Y], [STRIP_R, STRIP_Y], STRIP_H, '', 0, 4303);
  });
};
SHOTS.end = (lt) => { X.fillStyle = P.paper; X.fillRect(0, 0, W, H); X.globalAlpha = seg(lt, 0.4, 1.6); txt('THE SIXTH SALLY', CX, 250, 48, {}); txt('after Stanisław Lem, The Cyberiad', CX, 310, 24, { italic: true }); X.globalAlpha = 1; barrel(CX, 620, 0.7); demon(CX + 7, 620 - 0.7 * 226, 0.9, lt, clamp(1 - lt / 5)); };

/* ================= frame loop ================= */
window.__render = async (f) => {
  const t = f / 24; GT = t; BOIL = Math.floor(f / 2);
  let i = 0; for (let j = 0; j < T.shots.length; j++) if (t >= T.shots[j].t0) i = j;
  const sh = T.shots[i], lt = t - sh.t0, sd = sh.d;
  X.setTransform(1, 0, 0, 1, 0, 0); X.fillStyle = P.paper; X.fillRect(0, 0, W, H);
  if (PANELS.includes(sh.shot)) tapeView(sh.shot, lt);
  else { X.save(); path(R(PX0, PY0, PX1 - PX0, PY1 - PY0)); X.clip(); SHOTS[sh.shot](lt, sd, sh); X.restore(); X.setTransform(1, 0, 0, 1, 0, 0); border(); }
  const fade = sh.shot === 'book' ? 1 - seg(lt, 0, 1.2) : 0;
  if (fade > 0) { X.fillStyle = P.paper; X.globalAlpha = fade; X.fillRect(0, 0, W, H); X.globalAlpha = 1; }
};
(async () => {
  T = await (await fetch('timing/ps.json')).json();
  await document.fonts.ready; await Promise.all(['IM Fell English', 'IBM Plex Mono'].map((n) => document.fonts.load(`20px "${n}"`)));
  X = document.getElementById('film').getContext('2d');
  window.__NF = Math.ceil(T.dur * 24); window.__T = T; window.__ready = true;
})();
