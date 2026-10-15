/* The Three Storytelling Machines of King Genius: one camera through nested frames. Same toolkit as The Seventh Sally and Non Serviam. */
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
const VIOLET = '#7d5a9e';
const sayAt = (ch, who, lt) => { for (const l of ch.lines) if (l.who === who && lt >= l.t0 && lt < l.t1) return l.env[Math.min(l.env.length - 1, Math.floor((lt - l.t0) * 24))] || 0; return 0; };
const talking = (ch, who, lt) => ch.lines.some((l) => l.who === who && lt >= l.t0 - 0.1 && lt < l.t1 + 0.2);
const onLine = (ch, lt, pre = 0.5, post = 1.2) => { const l = ch.lines.find((x) => x.line); return !!l && lt >= l.t0 - pre && lt < l.t1 + post; };
const cue = (ch, k) => ch.cues.find((c) => c.k === k);
function darkWall(x0, y0, x1, y1, sp = 2.6) { X.fillStyle = P.paper; X.fillRect(x0, y0, x1 - x0, y1 - y0); X.save(); path(R(x0, y0, x1 - x0, y1 - y0)); X.clip(); for (let y = y0; y < y1; y += sp) { X.fillStyle = P.ink; X.fillRect(x0, y, x1 - x0, 0.9 + 0.5 * hash(y | 0, 5)); } X.restore(); }
function starfield(n, id, x0 = 0, y0 = 0, w = 1280, h = 720) { for (let i = 0; i < n; i++) { const x = x0 + hash(id, i) * w, y = y0 + hash(id + 1, i) * h, r = hash(id + 2, i); X.fillStyle = P.paper; X.globalAlpha = 0.4 + 0.6 * hash(i, (BOIL >> 2) + id); X.fillRect(x, y, 1 + r * 1.6, 1 + r * 1.6); } X.globalAlpha = 1; }
function crown(x, y, s, id) { const p = [[-26, 0], [-30, -30], [-14, -12], [0, -36], [14, -12], [30, -30], [26, 0]].map(([a, b]) => [x + a * s, y + b * s]); shape(p, { lw: 1.4, id, h: [0.3, 2.4, 0.5] }); for (const [a, b] of [[-30, -30], [0, -36], [30, -30]]) ball(x + a * s, y + b * s - 5 * s, 5 * s, id + 3 + a, PAT.f, 1); }

/* King Genius: the oldest sphere, crowned, in an ermine mantle (cave image) */
function genius(x, y, r, lt, ch) {
  const env = sayAt(ch, 'GEN', lt), blink = (lt % 5.3) < 0.12;
  shape([[x - r * 1.5, y + r * 1.3], [x - r * 1.2, y - r * 0.5], [x, y - r * 0.9], [x + r * 1.2, y - r * 0.5], [x + r * 1.5, y + r * 1.3]], { lw: 2, id: 600 });
  for (let i = 0; i < 40; i++) { const u = hash(601, i), v = hash(602, i); const px = x - r * 1.35 + u * r * 2.7, py = y - r * 0.4 + v * r * 1.6; if (Math.abs(px - x) < r * 0.9 && py < y + r * 0.8) continue; X.fillStyle = P.ink; X.beginPath(); X.ellipse(px, py, 2.2, 5, 0, 0, 6.283); X.fill(); }
  for (const k of [-1, 1]) { ball(x + k * r * 0.45, y + r * 1.1, r * 0.32, 610 + k, PAT.m, 1.6); line([x + k * r * 0.45, y + r * 1.4], [x + k * r * 0.5, y + r * 1.62], 3, 612 + k, 0.1); }
  ball(x, y, r, 615, PAT.m, 2.2);
  line([x - r, y + 2], [x + r, y + 2], 1.2, 616, 0.4);
  for (const k of [-1, 1]) { X.beginPath(); X.arc(x + k * r * 0.3, y - r * 0.28, r * 0.13, 0, 6.283); X.fillStyle = P.paper; X.fill(); X.lineWidth = 1.6; X.strokeStyle = P.ink; X.stroke(); if (!blink) { X.beginPath(); X.arc(x + k * r * 0.3 + 2, y - r * 0.27, r * 0.05, 0, 6.283); X.fillStyle = P.ink; X.fill(); } else line([x + k * r * 0.3 - r * 0.12, y - r * 0.27], [x + k * r * 0.3 + r * 0.12, y - r * 0.27], 2, 617 + k, 0.1); }
  const mu = env * 5; for (const k of [-1, 1]) { X.beginPath(); X.moveTo(x, y - r * 0.08 + mu * 0.2); X.quadraticCurveTo(x + k * r * 0.25, y - r * 0.02 + mu, x + k * r * 0.38, y - r * 0.14); X.lineWidth = 3.2; X.strokeStyle = P.ink; X.stroke(); }
  crown(x, y - r * 0.92, r / 40, 620);
  line([x + r * 1.05, y + r * 0.9], [x + r * 1.2, y - r * 1.1], 3, 630, 0.2); ball(x + r * 1.2, y - r * 1.2, 8, 631, PAT.f, 1.3);
}
function courtier(x, y, r, id, o = {}) {
  for (const k of [-1, 1]) line([x + k * r * 0.4, y + r * 0.8], [x + k * r * 0.45, y + r * 1.2], 3, id + k, 0.1);
  ball(x, y, r, id + 3, PAT.m, 1.8); line([x - r, y], [x + r, y], 1, id + 4, 0.3);
  for (const k of [-1, 1]) { X.beginPath(); X.arc(x + k * r * 0.28 + (o.look || 0) * r * 0.1, y - r * 0.3, r * 0.1, 0, 6.283); X.fillStyle = P.paper; X.fill(); X.lineWidth = 1.2; X.stroke(); X.beginPath(); X.arc(x + k * r * 0.28 + (o.look || 0) * r * 0.14, y - r * 0.3, r * 0.04, 0, 6.283); X.fillStyle = P.ink; X.fill(); }
  if (o.hat) { shape([[x - r * 0.75, y - r * 0.82], [x + r * 0.75, y - r * 0.82], [x + r * 0.5, y - r * 0.92], [x - r * 0.5, y - r * 0.92]], { lw: 1.3, id: id + 5 }); shape(R(x - r * 0.38, y - r * 1.35, r * 0.76, r * 0.45), { fill: P.ink, lw: 1, id: id + 6 }); for (let i = 0; i < 8; i++) ink([[x + r * 0.2, y - r * 1.3], [x + r * (0.4 + i * 0.06), y - r * (1.7 + i * 0.05)], [x + r * (0.8 + i * 0.05), y - r * (1.9 - i * 0.02)]], 1, id + 10 + i, 0.4); }
  if (o.sash) { X.save(); circ(x, y, r, id + 3); X.clip(); shape(R(x - r, y - r * 0.1, r * 2, r * 0.32), { lw: 1.2, id: id + 7, h: [0.8, 2.2, 0.6] }); X.restore(); }
}
/* the three cabinets: white, azure, black. Door angle 0..1; the window inside is a portal. */
const CABS = { white: { x: 400 }, blue: { x: 640 }, black: { x: 880 } };
function cabinetWin(name) { const c = CABS[name]; return [c.x - 56, 520, 112]; } // [x, y, w] of the 16:9 window
function cabinet(name, open, id) {
  const c = CABS[name], x = c.x, w = 140, h = 210, top = 650 - h;
  const fill = name === 'black' ? PAT.d : name === 'blue' ? 'rgba(79,127,191,.55)' : P.paper;
  shape([[x - w / 2 - 10, top], [x + w / 2 + 10, top], [x, top - 46]], { lw: 1.8, id: id + 1, h: name === 'black' ? [0.4, 2, 0.8] : [0.4, 3.4, 0.5] }); ball(x, top - 52, 7, id + 2, PAT.m, 1.2);
  shape(R(x - w / 2, top, w, h), { fill, lw: 2.2, id, h: name === 'white' ? [1.57, 5, 0.35] : null });
  shape(R(x - w / 2 + 12, top + 14, w - 24, h - 40), { fill: PAT.d, lw: 1.4, id: id + 3 });
  // doors swing out
  for (const k of [-1, 1]) {
    const dw = (w / 2 - 12) * Math.cos(open * 1.3), hx = x + k * (w / 2 - 12), ex = hx - k * dw, skew = Math.sin(open * 1.3) * 14;
    shape([[hx, top + 14], [ex, top + 14 - skew * 0.3], [ex, top + h - 26 + skew * 0.3], [hx, top + h - 26]], { fill, lw: 1.6, id: id + 5 + k, h: name === 'white' ? [1.57, 5, 0.35] : null });
    if (open < 0.3) { X.save(); X.globalAlpha = 1 - open / 0.3; circ((hx + ex) / 2, top + h / 2, 14, id + 8); X.lineWidth = 1.2; X.strokeStyle = name === 'black' ? P.paper : P.ink; X.stroke(); X.restore(); }
  }
  shape(R(x - w / 2 - 8, 650, w + 16, 12), { lw: 1.6, id: id + 9, h: [0, 2.4, 0.6] });
}
function trurlAt(x, y, s, lt, ch, f = 1) { const sp = talking(ch, 'TRU', lt), e = sayAt(ch, 'TRU', lt); constructor_(x, y, s, 400, { f, ra: sp ? [-0.3 - e * 0.3, -0.2 - e * 0.4] : [1.5, 1.6], la: [1.4, 1.65], open: sp ? 0.8 : 0, look: sp ? 0.3 : 0.9, mouth: e, tilt: sp ? Math.sin(lt * 2) * 0.03 : 0 }); }

/* ================= the frames (scenes). Each draws in 1280x720 and may hold one portal. ================= */
const SCN = {};
SCN.cave = {
  draw(v, lt, ch, open) {
    darkWall(-200, -200, 1480, 920, 2.4);
    X.save(); X.beginPath(); X.moveTo(-50, 760); X.lineTo(-50, 300); X.bezierCurveTo(60, -40, 1220, -40, 1330, 300); X.lineTo(1330, 760); X.closePath(); X.fillStyle = P.paper; X.fill(); X.clip(); hatch(Math.PI / 2, 5, 0.5, [-60, -60, 1340, 760]); X.restore();
    for (let i = 0; i < 26; i++) { const sx = -40 + i * 54 + hash(700, i) * 20, sl = 40 + hash(701, i) * 120, sy = 40 + Math.abs(i - 13) * Math.abs(i - 13) * 1.6; shape([[sx - 16, sy - 40], [sx + 16, sy - 40], [sx + 2, sy + sl]], { lw: 1.2, id: 710 + i, h: [1.3, 2.8, 0.6] }); }
    shape([[-200, 600], [1480, 600], [1480, 900], [-200, 900]], { lw: 1.4, id: 760 }); X.save(); path([[-200, 600], [1480, 600], [1480, 900], [-200, 900]]); X.clip(); for (let i = 0; i < 400; i++) { X.fillStyle = P.ink; X.fillRect(hash(761, i) * 1480 - 100, 605 + hash(762, i) * 300, 1.4, 1.4); } X.restore();
    // steps and throne
    for (let i = 0; i < 4; i++) shape(R(440 + i * 30, 420 - i * 22, 400 - i * 60, 22), { lw: 1.4, id: 770 + i, h: [1.57, 2.6, 0.5] });
    shape(R(575, 220, 130, 120), { lw: 1.8, id: 780, h: [1.57, 3, 0.5] });
    // books and benches
    for (const [bx, k] of [[60, 0], [1050, 1]]) { shape(R(bx, 520, 190, 30), { lw: 1.4, id: 790 + k, h: [0, 2.4, 0.6] }); for (let j = 0; j < 7; j++) shape(R(bx + 8 + j * 25, 470 - hash(792 + k, j) * 40, 20, 50 + hash(792 + k, j) * 40), { lw: 1, id: 800 + k * 10 + j, h: [j % 2 ? 0 : 1.57, 2.2, 0.6] }); }
    for (const [cx, cy, r, id, o] of [[290, 330, 46, 820, {}], [400, 270, 36, 830, {}], [880, 270, 40, 840, {}], [1050, 380, 56, 850, { hat: true, sash: true }], [180, 430, 38, 860, {}], [1170, 480, 40, 870, {}]]) courtier(cx, cy, r, id, { ...o, look: Math.sin(lt * 0.4 + id) });
    genius(640, 236, 84, lt, ch);
    for (const name of ['white', 'blue', 'black']) cabinet(name, open[name] || 0, 900 + Object.keys(CABS).indexOf(name) * 20);
    trurlAt(200, 690, 0.95, lt, ch);
  },
};
SCN.vestibule = {
  draw(v, lt, ch, o) {
    darkWall(-200, -200, 1480, 920, 3);
    X.save(); path(R(-200, -200, 1680, 760)); X.clip(); X.fillStyle = P.paper; X.globalAlpha = 0.45; X.fillRect(-200, -200, 1680, 760); X.globalAlpha = 1; hatch(Math.PI / 2, 3.2, 0.7, [-200, -200, 1480, 560]); X.restore();
    shape(R(-200, 540, 1680, 30), { lw: 1.6, id: 1000, h: [1.57, 2, 0.6] });
    shape([[-200, 570], [1480, 570], [1480, 920], [-200, 920]], { lw: 1.6, id: 1001, h: [0.02, 4, 0.45] });
    X.beginPath(); X.ellipse(640, 650, 330, 48, 0, 0, 6.283); X.fillStyle = P.paper; X.fill(); X.lineWidth = 1.6; X.strokeStyle = P.ink; X.stroke(); X.beginPath(); X.ellipse(640, 650, 310, 40, 0, 0, 6.283); X.setLineDash([3, 4]); X.stroke(); X.setLineDash([]);
    // the wide doorway: its opening is exactly 16:9
    shape(R(420, 288, 440, 262), { fill: PAT.d, lw: 2.4, id: 1010 }); for (let k = 1; k < 5; k++) { const sc = Math.pow(0.6, k); shape(R(640 - 220 * sc, 419 - 131 * sc, 440 * sc, 262 * sc), { fill: null, lw: 1.2, id: 1011 + k, col: P.paper }); }
    // ceiling lamp
    line([640, -40], [640, 70], 2, 1020, 0.1); ball(640, 92, 22, 1021, PAT.f, 1.6); X.save(); X.globalAlpha = 0.5; for (let i = 0; i < 16; i++) { const a = i / 16 * 6.283; line([640 + Math.cos(a) * 30, 92 + Math.sin(a) * 30], [640 + Math.cos(a) * 60, 92 + Math.sin(a) * 60], 0.8, 1022 + i, 0.1, P.paper); } X.restore();
    // oval mirror with a reflected head
    X.save(); X.beginPath(); X.ellipse(150, 230, 70, 96, 0, 0, 6.283); X.fillStyle = P.paper; X.fill(); X.lineWidth = 5; X.strokeStyle = P.ink; X.stroke(); X.clip(); boxHead(150, 250, 0.9, 1040, { closed: true }); X.restore();
    // side table and wire flowers
    shape(R(1100, 470, 140, 14), { lw: 1.6, id: 1050, h: [0, 2, 0.6] }); shape(R(1160, 484, 20, 90), { lw: 1.4, id: 1051, h: [1.57, 2, 0.6] });
    shape([[1150, 470], [1190, 470], [1200, 430], [1180, 400], [1160, 400], [1140, 430]], { lw: 1.4, id: 1052, h: [1.57, 3, 0.5] });
    for (let i = 0; i < 9; i++) { const a = -Math.PI / 2 + (i - 4) * 0.25, p = []; for (let j = 0; j <= 6; j++) { const u = j / 6; p.push([1170 + Math.cos(a) * u * 60 + Math.sin(u * 3) * 6 * (i - 4) * 0.3, 400 + Math.sin(a) * u * 60 + u * u * 50]); } coil(p, 2.4); }
    // the black dream cabinet with gems; its window is a portal when o === 'cabinet'
    if (o === 'cabinet') {
      shape(R(880, 230, 190, 330), { fill: PAT.d, lw: 2.4, id: 1060 }); shape([[870, 230], [1080, 230], [975, 180]], { lw: 1.8, id: 1061, h: [0.3, 2, 0.8] });
      for (let i = 0; i < 6; i++) ball(900 + i * 30, 245, 5, 1062 + i, PAT.f, 1); shape(R(905, 360, 140, 79), { fill: P.paper, lw: 2, id: 1070 });
    }
    // Zipperupus
    const sp = talking(ch, 'Z', lt), e = sayAt(ch, 'Z', lt);
    if (o === 'cabinet') {
      shape(R(150, 470, 170, 160), { lw: 1.8, id: 1080, h: [1.57, 3, 0.5] }); shape(R(160, 300, 150, 180), { lw: 1.8, id: 1081, h: [1.57, 3, 0.5] });
      constructor_(240, 640, 0.95, 1100, { seated: true, robe: true, la: [1.2, 0.3], ra: sp ? [0.2, -0.3] : [1.2, 0.2], look: 0.8, mouth: e });
      crown(240 + 2, 640 - 286 * 0.95 - 38, 0.9, 1130);
      const plug = clamp((lt - (ch.lines[2] ? ch.lines[2].t1 : 99)) * 2);
      if (ch.ch === 'vestibule') { X.beginPath(); X.moveTo(905, 520); X.bezierCurveTo(700, 640, 400, 560, lerp(330, 260, plug), lerp(420, 380, plug)); X.lineWidth = 2.4; X.setLineDash([5, 3]); X.strokeStyle = P.ink; X.stroke(); X.setLineDash([]); }
    } else {
      const lean = 0.5 + 0.5 * Math.sin(lt * 0.6);
      constructor_(330, 650, 0.95, 1100, { f: 1, la: [1.4, 1.7], ra: [0.1, -0.5 - lean * 0.2], open: 0.4, look: 1, mouth: e, tilt: 0.06 });
      crown(330 + 2, 650 - 286 * 0.95 - 38, 0.9, 1130);
    }
  },
  over(v, lt, ch, o) { if (o === 'door') { shape([[420, 288], [440, 288], [440, 550], [420, 550]], { lw: 1.6, id: 1015, h: [1.57, 2, 0.7] }); } },
};
SCN.dream = {
  draw(v, lt, ch) {
    darkWall(-200, -200, 1480, 920, 2.2);
    X.beginPath(); X.arc(1050, 130, 48, 0, 6.283); X.fillStyle = P.paper; X.fill();
    starfield(60, 1200, 0, 0, 1280, 300);
    shape([[-100, 330], [1380, 330], [1380, 520], [-100, 520]], { lw: 2, id: 1210, h: [1.57, 3.4, 0.6] });
    for (let i = 0; i < 30; i++) shape(R(-100 + i * 50, 310, 26, 22), { lw: 1, id: 1220 + i, h: [1.57, 3.4, 0.6] });
    for (const tx of [120, 1150]) tower(tx, 520, 120, 330, 1260 + tx, { roof: 1.4 });
    shape([[-200, 520], [1480, 520], [1480, 920], [-200, 920]], { lw: 1.4, id: 1300, h: [0.02, 4, 0.45] });
    // mercury fountain
    shape([[560, 560], [720, 560], [700, 590], [580, 590]], { lw: 1.6, id: 1310, h: [1.57, 2.4, 0.6] }); line([640, 560], [640, 500], 4, 1311, 0.1);
    for (let i = 0; i < 8; i++) { const a = -Math.PI / 2 + (i - 3.5) * 0.3, ph = (lt * 1.6 + i * 0.13) % 1; X.beginPath(); X.arc(640 + Math.cos(a) * ph * 60, 500 + Math.sin(a) * ph * 40 + ph * ph * 70, 2.5, 0, 6.283); X.fillStyle = P.paper; X.fill(); }
    // barbwire bushes
    for (const bx of [380, 900]) for (let i = 0; i < 40; i++) { const a = hash(bx, i) * 6.283, r = 20 + hash(bx + 1, i) * 50; line([bx, 560], [bx + Math.cos(a) * r, 560 + Math.sin(a) * r * 0.6 - 20], 1, bx + i, 0.6, P.paper); }
    // Octopauline, far off, eightfold
    X.save(); X.globalAlpha = 0.85; for (let i = 0; i < 8; i++) { const a = -Math.PI + i * Math.PI / 7, p = []; for (let j = 0; j <= 10; j++) { const u = j / 10; p.push([1000 + Math.cos(a) * u * 60 + Math.sin(u * 6 + lt * 2 + i) * 6, 400 + Math.sin(a) * u * 50]); } X.beginPath(); p.forEach(([x, y], k) => (k ? X.lineTo(x, y) : X.moveTo(x, y))); X.lineWidth = 3; X.strokeStyle = P.paper; X.stroke(); } X.beginPath(); X.ellipse(1000, 420, 16, 40, 0, 0, 6.283); X.fillStyle = P.paper; X.fill(); X.restore();
    // the gatekeeper and the king
    const wh = cue(ch, 'whack'), sw = wh ? seg(lt, wh.at - 0.25, wh.at) : 0;
    const eG = sayAt(ch, 'G', lt), eZ = sayAt(ch, 'Z', lt);
    constructor_(760, 660, 0.95, 1400, { f: -1, la: [1.4, 1.6], ra: [lerp(-1.3, 0.2, sw), lerp(-1.5, 0.4, sw)], look: 1, mouth: eG, robe: true });
    const hx = 760 - (30 + 62 * Math.cos(lerp(-1.3, 0.2, sw)) + 58 * Math.cos(lerp(-1.5, 0.4, sw))) * 0.95, hy = 660 - (214 - 62 * Math.sin(lerp(-1.3, 0.2, sw)) - 58 * Math.sin(lerp(-1.5, 0.4, sw))) * 0.95;
    const ha = lerp(-1.75, -0.4, sw); line([hx - Math.cos(ha) * 60, hy - Math.sin(ha) * 60], [hx + Math.cos(ha) * 220, hy + Math.sin(ha) * 220], 3, 1450, 0.2); shape([[hx + Math.cos(ha) * 220, hy + Math.sin(ha) * 220], [hx + Math.cos(ha + 0.25) * 190, hy + Math.sin(ha + 0.25) * 190], [hx + Math.cos(ha - 0.2) * 180, hy + Math.sin(ha - 0.2) * 180]], { lw: 1.4, id: 1451, fill: P.paper });
    constructor_(470, 660, 0.95, 1100, { f: 1, la: [1.3, 1.4], ra: talking(ch, 'Z', lt) ? [0.2, -0.3] : [1.0, 0.5], open: 0.6, look: 1, mouth: eZ });
    crown(472, 660 - 286 * 0.95 - 38, 0.9, 1130); X.save(); X.translate(560, 560); shape([[-14, 0], [14, 0], [18, 30], [-18, 30]], { lw: 1.4, id: 1460, h: [0.5, 2.4, 0.6] }); X.restore();
  },
};
/* the powers-of-ten chain */
SCN.galaxy = { draw(v, lt) { darkWall(-200, -200, 1480, 920, 2); starfield(220, 1500, -100, -100, 1480, 920); const cx = 640, cy = 360; for (let arm = 0; arm < 2; arm++) for (let i = 0; i < 520; i++) { const u = i / 520, a = arm * Math.PI + u * 9 + lt * 0.05, r = 18 + u * 420, x = cx + Math.cos(a) * r * 1.4 + (hash(1600 + arm, i) - 0.5) * 40 * u, y = cy + Math.sin(a) * r * 0.62 + (hash(1602 + arm, i) - 0.5) * 26 * u; X.fillStyle = P.paper; X.globalAlpha = 0.9 - u * 0.5; X.fillRect(x, y, 2.4 + (1 - u) * 2.6, 2.4 + (1 - u) * 2.6); } X.globalAlpha = 1; X.beginPath(); X.ellipse(cx, cy, 60, 30, 0, 0, 6.283); X.fillStyle = P.paper; X.fill(); } };
const NEB = [790, 300, 120];
SCN.nebula = { draw(v, lt) { darkWall(-200, -200, 1480, 920, 2); starfield(260, 1700, -100, -100, 1480, 920); for (let i = 0; i < 26; i++) { const x = 300 + hash(1710, i) * 700, y = 160 + hash(1711, i) * 420, r = 60 + hash(1712, i) * 140; X.beginPath(); X.ellipse(x, y, r, r * 0.6, hash(1713, i) * 3, 0, 6.283); X.fillStyle = 'rgba(28,24,20,.55)'; X.fill(); X.lineWidth = 0.8; X.strokeStyle = 'rgba(235,227,207,.25)'; X.stroke(); } } };
SCN.cluster = { draw(v, lt) { darkWall(-200, -200, 1480, 920, 2); starfield(120, 1800, -100, -100, 1480, 920); [[230, 220], [480, 520], [700, 180], [1000, 520], [640, 340]].forEach(([x, y], k) => { for (let i = 0; i < 70; i++) { const a = hash(1810 + k, i) * 6.283, r = Math.pow(hash(1815 + k, i), 2) * 90; X.fillStyle = P.paper; X.fillRect(x + Math.cos(a) * r, y + Math.sin(a) * r * 0.8, 2, 2); } }); } };
SCN.system = { draw(v, lt) { darkWall(-200, -200, 1480, 920, 2); starfield(80, 1900, -100, -100, 1480, 920); const sx = 640, sy = 360; X.beginPath(); X.arc(sx, sy, 44, 0, 6.283); X.fillStyle = VIOLET; X.fill(); X.lineWidth = 2; X.strokeStyle = P.paper; X.stroke(); X.save(); X.globalAlpha = 0.5; for (let i = 0; i < 24; i++) { const a = i / 24 * 6.283; line([sx + Math.cos(a) * 52, sy + Math.sin(a) * 52], [sx + Math.cos(a) * 80, sy + Math.sin(a) * 80], 1, 1910 + i, 0.2, P.paper); } X.restore(); for (let k = 0; k < 7; k++) { const rx = 110 + k * 75, ry = rx * 0.42; X.beginPath(); X.ellipse(sx, sy, rx, ry, 0, 0, 6.283); X.setLineDash([2, 5]); X.lineWidth = 1; X.strokeStyle = 'rgba(235,227,207,.6)'; X.stroke(); X.setLineDash([]); const a = k === 2 ? 0.0 : hash(1920, k) * 6.283 + lt * 0.08 / (k + 1); ball(sx + Math.cos(a) * rx, sy + Math.sin(a) * ry, 6 + hash(1921, k) * 8, 1930 + k, PAT.m, 1); } } };
SCN.planet = { draw(v, lt) { darkWall(-200, -200, 1480, 920, 2); starfield(140, 2000, -100, -100, 1480, 920); ball(560, 380, 230, 2010, PAT.f, 2); X.save(); circ(560, 380, 230, 2010); X.clip(); for (let i = 0; i < 9; i++) { shape(R(300, 200 + i * 44, 520, 18), { fill: null, lw: 0, h: [0.05, 3, 0.6] }); } X.restore(); ball(950, 210, 30, 2020, PAT.m, 1.4); ball(1010, 470, 40, 2021, PAT.m, 1.4); } };
SCN.moon = { draw(v, lt) { darkWall(-200, -200, 1480, 920, 2); starfield(160, 2100, -100, -100, 1480, 520); ball(1060, 120, 50, 2110, PAT.f, 1.6); X.beginPath(); X.moveTo(-200, 920); X.lineTo(-200, 470); for (let i = 0; i <= 40; i++) X.lineTo(-200 + i * 42, 470 - Math.sin(i * 0.7) * 14 - hash(2120, i) * 22); X.lineTo(1480, 920); X.closePath(); X.fillStyle = P.paper; X.fill(); X.lineWidth = 2; X.strokeStyle = P.ink; X.stroke(); X.save(); X.clip(); hatch(0.05, 5, 0.6, [-200, 400, 1480, 920]); for (let i = 0; i < 14; i++) { X.beginPath(); X.ellipse(hash(2130, i) * 1400 - 60, 520 + hash(2131, i) * 200, 20 + hash(2132, i) * 50, 6 + hash(2133, i) * 12, 0, 0, 6.283); X.lineWidth = 1.2; X.strokeStyle = P.ink; X.stroke(); } X.restore(); for (let i = 0; i < 60; i++) { const x = 580 + hash(2140, i) * 120, y = 486 - hash(2141, i) * 18; shape(R(x, y, 4 + hash(2142, i) * 6, 3 + hash(2143, i) * 5), { lw: 0.6, id: 2150 + i }); } } };
const PORTALS = { galaxy: [818, 286, 64], nebula: [560, 300, 96], cluster: [610, 316, 60], system: [783, 340, 40], planet: [990, 455, 40], moon: [610, 470, 60] };
// space portals sit at the centre of the next frame: rescale each so its centre lands on the drawn object
const SPACE_NEXT = { galaxy: 'nebula', nebula: 'cluster', cluster: 'system', system: 'planet', planet: 'moon', moon: 'dump' };
for (const k of Object.keys(SPACE_NEXT)) SCN[k].portal = () => PORTALS[k];

/* ================= the dump and Mymosh ================= */
const MYM = { stand: [520, 600], fall: [760, 652] };
function junk(id, x0, x1, ybase, amp) {
  X.beginPath(); X.moveTo(x0, 900); X.lineTo(x0, ybase); for (let i = 0; i <= 50; i++) X.lineTo(x0 + i * (x1 - x0) / 50, ybase - Math.abs(Math.sin(i * 0.4 + id)) * amp - hash(id, i) * amp * 0.4); X.lineTo(x1, 900); X.closePath(); X.fillStyle = P.paper; X.fill(); X.lineWidth = 1.6; X.strokeStyle = P.ink; X.stroke();
  X.save(); X.clip(); hatch(1.2, 3.6, 0.6, [x0, ybase - amp * 1.5, x1, 900]);
  for (let i = 0; i < 26; i++) { const x = x0 + hash(id + 1, i) * (x1 - x0), y = ybase - amp * 0.6 + hash(id + 2, i) * 200, k = i % 4, s = 10 + hash(id + 3, i) * 26;
    if (k === 0) { ball(x, y, s, id + 10 + i, PAT.f, 1.2); for (let j = 0; j < 6; j++) { const a = j / 6 * 6.283; line([x, y], [x + Math.cos(a) * s, y + Math.sin(a) * s], 0.8, id + 40 + i * 6 + j, 0.1); } }
    else if (k === 1) shape(R(x, y, s * 2.4, s * 0.5), { lw: 1.2, id: id + 200 + i, h: [0.1, 2.2, 0.6] });
    else if (k === 2) shape([[x - s * 0.6, y], [x + s * 0.6, y], [x + s * 0.5, y + s * 1.2], [x - s * 0.5, y + s * 1.2]], { lw: 1.2, id: id + 300 + i, h: [1.57, 2.4, 0.6] });
    else { shape(R(x, y, s, s), { lw: 1.2, id: id + 400 + i, h: [0.78, 2.6, 0.6] }); } }
  X.restore();
}
function mymosh(lt, ch) {
  const as = cue(ch, 'assemble'), wk = cue(ch, 'walk'), ru = cue(ch, 'rust'), sh = cue(ch, 'shoe'), bl = cue(ch, 'blind');
  const isShard = ch.ch === 'shard' || ch.ch === 'gozmos';
  const A = isShard ? 1 : (as ? seg(lt, as.at, as.to, E.io) : 1);
  const walkU = isShard ? 1 : (wk ? seg(lt, wk.at, wk.to, E.lin) : 1);
  const fallen = isShard || (wk && lt > wk.to);
  const sat = isShard || (sh && lt > sh.at + 0.3);
  const decay = isShard ? 1 : ru ? clamp((lt - ru.at) / (ru.to - ru.at)) * 0.7 + (bl ? seg(lt, bl.at, bl.to) * 0.3 : 0) : 0;
  const blind = isShard || (bl && lt > bl.at + 0.5);
  let x = lerp(MYM.stand[0], MYM.fall[0] - 40, walkU), y = MYM.stand[1], ang = 0;
  if (fallen && !sat) { x = MYM.fall[0]; y = MYM.fall[1]; ang = 1.45; }
  if (sat) { x = MYM.fall[0] + 20; y = 668; ang = 0; }
  const scatter = (k) => [(hash(2300, k) - 0.5) * 700 * (1 - A), (hash(2301, k) - 0.5) * 300 * (1 - A) - 200 * (1 - A) * hash(2302, k)];
  const sink = isShard ? 1 : sat ? clamp((lt - sh.at) / 12) : 0;
  X.save(); X.translate(x, y); X.rotate(ang);
  const step = Math.sin(walkU * 7 * Math.PI) * (walkU > 0 && walkU < 1 ? 1 : 0);
  // legs and arms are pipes; they fall away as he rusts
  const limbs = sat ? [] : [[-14, -60, -16 + step * 10, 0], [14, -60, 16 - step * 10, 0]];
  limbs.forEach(([a, b, c, d], k) => { const [sx, sy] = scatter(k); cap(a + sx, b + sy, c + sx, d + sy, 10, 2310 + k); });
  if (!sat || decay < 0.5) { const [sx, sy] = scatter(3); const arm = talking(ch, 'M', lt) && !sat ? -0.9 : 0.6; cap(-30 + sx, -120 + sy, -30 + Math.cos(Math.PI / 2 + arm) * 60 + sx, -120 + Math.sin(Math.PI / 2 + arm) * 60 + sy, 9, 2320); cap(30 + sx, -120 + sy, 64 + sx, -70 + sy, 9, 2321); }
  { const [sx, sy] = scatter(5); X.save(); X.translate(sx, sy + sink * 40); shape([[-32, -130], [32, -130], [26, -95], [32, -60], [-32, -60], [-26, -95]], { lw: 2, id: 2330, h: [1.57, 3, 0.5] }); for (const hy of [-120, -70]) line([-30, hy], [30, hy], 2.4, 2331 + hy, 0.2); X.restore(); }
  { const [sx, sy] = scatter(6); const hy = -168 + sink * 40, e = sayAt(ch, 'M', lt);
    X.save(); X.translate(sx, sy + hy); if (!sat) X.rotate(talking(ch, 'M', lt) ? 0.25 : 0);
    ball(-34, -2, 12, 2340, PAT.f, 1.4); ball(34, 2, 10, 2341, PAT.m, 1.4);
    shape([[-30, -30], [28, -32], [30, 28], [-28, 30]], { lw: 2.2, id: 2342, h: decay > 0.2 ? [0.7, 6 - decay * 3.5, 0.6] : null });
    ink([[-6, -30], [2, -10], [-4, 4]], 1.2, 2343, 0.4);
    for (const ex of [-12, 12]) { X.beginPath(); X.arc(ex, -6, 7, 0, 6.283); X.fillStyle = blind ? P.ink : P.paper; X.fill(); X.lineWidth = 1.4; X.strokeStyle = P.ink; X.stroke(); if (!blind) { X.beginPath(); X.arc(ex + 2, -4, 2.6, 0, 6.283); X.fillStyle = P.ink; X.fill(); } }
    shape(R(-10, 14 - e * 3, 20, 3 + e * 8), { fill: P.ink, lw: 0.8, id: 2344 });
    if (ch.ch === 'shard') { const cr = cue(ch, 'crack'); if (cr && lt > cr.at) { ink([[0, -30], [6, -12], [-4, 2], [8, 20]], 2, 2345, 0.3); ink([[6, -12], [24, -18]], 1.4, 2346, 0.3); } }
    X.restore(); }
  X.restore();
}
function headPortal(lt, ch) { const sat = ch.ch !== 'dump' || (cue(ch, 'shoe') && lt > cue(ch, 'shoe').at + 0.3); if (!sat) return [MYM.fall[0] - 10, 470, 60]; const sink = ch.ch === 'dump' ? clamp((lt - cue(ch, 'shoe').at) / 12) : 1; const hx = MYM.fall[0] + 20, hy = 668 - 168 + sink * 40; return [hx - 27, hy - 15, 54]; }
SCN.dump = {
  draw(v, lt, ch) {
    X.fillStyle = P.paper; X.fillRect(-200, -200, 1680, 1120);
    const ru = cue(ch, 'rust'); let dayFlick = 0; if (ru && lt > ru.at && lt < ru.to) dayFlick = (lt * 9) % 1 < 0.5 ? 1 : 0;
    X.save(); X.globalAlpha = 0.35 + 0.35 * dayFlick; skyLines(-200, 560, 700); X.restore();
    ball(1080, 150, 40, 2400, PAT.f, 1.4); X.beginPath(); X.arc(260, 120, 26, 0, 6.283); X.fillStyle = VIOLET; X.fill(); X.lineWidth = 1.4; X.strokeStyle = P.ink; X.stroke();
    junk(2500, -200, 560, 560, 120); junk(2600, 860, 1480, 540, 140);
    shape([[-200, 640], [1480, 640], [1480, 920], [-200, 920]], { lw: 1.4, id: 2700, h: [0.1, 4.5, 0.45] });
    X.beginPath(); X.ellipse(800, 676, 250, 40, 0, 0, 6.283); X.fillStyle = P.paper; X.fill(); X.lineWidth = 1.8; X.strokeStyle = P.ink; X.stroke(); X.save(); X.clip(); for (let i = 0; i < 9; i++) line([560 + i * 10, 650 + i * 6], [1000 - i * 12, 650 + i * 6], 0.6, 2710 + i, 0.4); X.restore();
    // the jug falling, then shards
    const jg = cue(ch, 'jug');
    if (jg && lt > jg.at && lt < jg.to) { const u = (lt - jg.at) / (jg.to - jg.at), jx = lerp(1300, 600, u), jy = lerp(-80, 560, u * u); X.save(); X.translate(jx, jy); X.rotate(u * 9); shape([[-14, -20], [14, -20], [20, 10], [10, 24], [-10, 24], [-20, 10]], { lw: 1.6, id: 2720, h: [0.6, 2.6, 0.6] }); X.restore(); for (let i = 0; i < 6; i++) line([jx + 20 + i * 14, jy - 26 - i * 22], [jx + 30 + i * 16, jy - 40 - i * 24], 1, 2730 + i, 0.4); }
    if (jg && lt >= jg.to) for (let i = 0; i < 7; i++) { const fx = 600 + (hash(2740, i) - 0.5) * 160, fy = 568 + hash(2741, i) * 30; X.save(); X.translate(fx, fy); X.rotate(hash(2742, i) * 6); shape([[-8, -4], [9, -6], [6, 6], [-6, 5]], { lw: 1, id: 2743 + i, h: [0.5, 2, 0.6] }); X.restore(); }
    const as = cue(ch, 'assemble'); if (as && lt > as.at && lt < as.to + 0.6) { X.save(); X.globalAlpha = 0.6; for (let i = 0; i < 10; i++) { const a = hash(2750, i + (BOIL % 5) * 10) * 6.283; ink([[600, 560], [600 + Math.cos(a) * 40, 560 + Math.sin(a) * 30], [600 + Math.cos(a + 0.5) * 70, 560 + Math.sin(a + 0.5) * 50]], 1.2, 2760 + i, 0.8); } X.restore(); }
    const sh = cue(ch, 'shoe'); if (sh && lt > sh.at - 1.2 && lt < sh.at + 0.2) { const u = clamp((lt - (sh.at - 1.2)) / 1.2); X.save(); X.translate(lerp(1000, 770, u), lerp(-60, 480, u * u)); X.rotate(u * 7); boot(0, 0, 1, 1.4, 2770); X.restore(); }
    if (ch.ch !== 'dump' || !as || lt > as.at - 0.01) mymosh(lt, ch);
    if (ch.ch === 'shard') { const cr = cue(ch, 'crack'), u = seg(lt, 0, cr.at, E.lin), hp = headPortal(lt, ch), tx = hp[0] + hp[2] + 6, ty = hp[1] + 30; X.save(); X.translate(lerp(1180, tx, u), lerp(690, ty, u)); X.rotate(Math.sin(lt * 1.3) * 0.08); shape([[-30, -6], [26, -14], [34, 8], [-24, 14]], { lw: 1.6, id: 2780, h: [0.2, 2.8, 0.5] }); X.beginPath(); X.arc(0, 0, 6, 0, 6.283); X.fillStyle = P.paper; X.fill(); for (let i = 0; i < 6; i++) { const a = i / 6 * 6.283; X.beginPath(); X.ellipse(Math.cos(a) * 8, Math.sin(a) * 5, 4, 2, a, 0, 6.283); X.lineWidth = 1; X.strokeStyle = P.ink; X.stroke(); } X.restore();
      if (lt > cr.at) { X.save(); X.globalAlpha = clamp((lt - cr.at) / 2); X.beginPath(); X.ellipse(800, 650, 260, 20, 0, 0, 6.283); X.fillStyle = 'rgba(235,227,207,.85)'; X.fill(); X.restore(); } }
  },
  portal: headPortal,
};
/* the Gozmos: what Mymosh thinks, inside his head */
function island(x, y, w, id, t, o = {}) {
  shape([[x - w / 2, y], [x + w / 2, y], [x + w * 0.3, y + w * 0.35], [x + w * 0.08, y + w * 0.75], [x - w * 0.12, y + w * 0.5], [x - w * 0.35, y + w * 0.3]], { lw: 1.6, id, h: [1.1, 3, 0.55] });
  X.beginPath(); X.ellipse(x, y, w / 2, w * 0.08, 0, 0, 6.283); X.fillStyle = P.paper; X.fill(); X.lineWidth = 1.4; X.strokeStyle = P.ink; X.stroke();
  const n = 2 + Math.floor(hash(id, 1) * 3); for (let i = 0; i < n; i++) tower(x - w * 0.3 + i * w * 0.6 / Math.max(1, n - 1), y, w * 0.12, w * (0.25 + hash(id, i + 5) * 0.35), id + 10 + i * 10, { t, roof: 1.3, flag: i % 2 === 0 });
}
function peg(x, y, s) { X.fillStyle = P.paper; X.strokeStyle = P.ink; X.lineWidth = Math.max(0.6, s * 1.2); X.beginPath(); X.moveTo(x - 4 * s, y); X.lineTo(x - 3 * s, y - 12 * s); X.lineTo(x + 3 * s, y - 12 * s); X.lineTo(x + 4 * s, y); X.closePath(); X.fill(); X.stroke(); X.beginPath(); X.arc(x, y - 15 * s, 3.4 * s, 0, 6.283); X.fill(); X.stroke(); }
SCN.gozmos = {
  draw(v, lt, ch) {
    darkWall(-200, -200, 1480, 920, 2.1);
    const make = ch.ch === 'gozmos' ? seg(lt, 0.4, ch.lines[0].t1, E.lin) : 1;
    const cr = ch.ch === 'shard' ? cue(ch, 'crack') : null, dead = cr ? seg(lt, cr.at, ch.lines[1].t0 - 0.6, E.lin) : 0;
    const items = [[200, 420, 210], [470, 260, 170], [840, 220, 200], [1080, 420, 180], [650, 520, 160], [330, 600, 120], [950, 600, 130]];
    for (let k = 0; k < 6; k++) { X.beginPath(); X.ellipse(640, 360, 140 + k * 90, 50 + k * 34, -0.15, 0, 6.283); X.setLineDash([2, 7]); X.lineWidth = 1; X.strokeStyle = 'rgba(235,227,207,.5)'; X.stroke(); X.setLineDash([]); }
    for (let k = 0; k < 7; k++) { const a = lt * 0.06 * (k % 2 ? 1 : -1) + k * 0.9, rx = 140 + k * 70, ry = 50 + k * 28; if (make < k / 9) continue; const vis = 1 - clamp(dead * 7 - k * 0.6); if (vis <= 0) continue; X.save(); X.globalAlpha = vis; ball(640 + Math.cos(a) * rx, 360 + Math.sin(a) * ry, 12 + (k % 3) * 8, 3000 + k, PAT.f, 1.2); if (k % 3 === 0) { X.beginPath(); X.ellipse(640 + Math.cos(a) * rx, 360 + Math.sin(a) * ry, 30, 8, -0.3, 0, 6.283); X.lineWidth = 1.2; X.strokeStyle = P.paper; X.stroke(); } X.restore(); }
    items.forEach(([x, y, w], k) => { const u = clamp((make - k / items.length * 0.9) * 4); if (u <= 0) return; const vis = 1 - clamp(dead * 7 - k * 0.8); if (vis <= 0) return; X.save(); X.globalAlpha = vis; X.translate(x, y + (1 - u) * 60 + (1 - vis) * 120); X.scale(u, u); island(0, 0, w, 3100 + k * 100, lt); for (let i = 0; i < 5; i++) peg(-w * 0.35 + i * w * 0.18, -2, 0.9); X.restore(); });
    // bridges between islands, with walkers
    const br = [[0, 1], [1, 2], [2, 3], [4, 3], [0, 4]];
    br.forEach(([a, b], k) => { if (make < 0.7 + k * 0.05) return; const vis = 1 - clamp(dead * 7 - (k + 2) * 0.8); if (vis <= 0) return; const [x1, y1] = items[a], [x2, y2] = items[b]; X.save(); X.globalAlpha = vis; X.beginPath(); X.moveTo(x1, y1); X.quadraticCurveTo((x1 + x2) / 2, Math.min(y1, y2) - 60, x2, y2); X.lineWidth = 6; X.strokeStyle = P.paper; X.stroke(); X.lineWidth = 1.2; X.strokeStyle = P.ink; X.stroke(); for (let i = 0; i < 4; i++) { const u = ((lt * 0.05 + i / 4 + k * 0.13) % 1), qx = (1 - u) * (1 - u) * x1 + 2 * u * (1 - u) * (x1 + x2) / 2 + u * u * x2, qy = (1 - u) * (1 - u) * y1 + 2 * u * (1 - u) * (Math.min(y1, y2) - 60) + u * u * y2; peg(qx, qy - 2, 0.8); } X.restore(); });
    // Baucis and Ondragor, the last thing he imagines, walking hand in hand: they are the last to go out
    const tr = ch.ch === 'gozmos' ? cue(ch, 'travelers') : null, tu = tr ? clamp((lt - tr.at) / 14) : ch.ch === 'shard' ? 1 : 0;
    if (tu > 0 || ch.ch === 'shard') { const fade = 1 - seg(dead, 0.85, 1); if (fade > 0) { X.save(); X.globalAlpha = fade; const px = lerp(380, 900, tu), py = 150 + Math.sin(tu * 3) * 20; for (const [dx, s] of [[-9, 1.4], [9, 1.3]]) { X.save(); X.globalAlpha = fade * 0.5; for (let i = 0; i < 10; i++) { const a = i / 10 * 6.283; line([px + dx + Math.cos(a) * 14, py - 18 + Math.sin(a) * 14], [px + dx + Math.cos(a) * 26, py - 18 + Math.sin(a) * 26], 0.8, 3500 + i, 0.2, P.paper); } X.restore(); peg(px + dx, py, s); } line([px - 5, py - 9], [px + 5, py - 9], 1.4, 3520, 0.1); X.restore(); } }
  },
};
// any frame inside the cave's loop cabinet is the cave again
SCN.cave.portal = (lt, ch, variant) => cabinetWin(variant === 'loop' ? 'black' : variant);
SCN.vestibule.portal = (lt, ch, variant) => (variant === 'door' ? [420, 288, 440] : [905, 360, 140]);

/* ================= the camera through the stack ================= */
function depthAt(ch, lt) { const ks = ch.cam; if (lt <= ks[0][0]) return ks[0][1]; for (let i = 0; i < ks.length - 1; i++) { const a = ks[i], b = ks[i + 1]; if (lt >= a[0] && lt < b[0] && b[0] > a[0]) { const u = (lt - a[0]) / (b[0] - a[0]); return a[1] + (b[1] - a[1]) * u * u * (3 - 2 * u); } } return ks[ks.length - 1][1]; }
function caveOpen(ch, lt) {
  const o = { white: 0, blue: 0, black: 0 };
  if (ch.ch === 'cave1') o.white = seg(lt, ch.lines[3].t0 - 1.2, ch.lines[3].t0 + 0.2);
  if (['vestibule', 'dream', 'loop'].includes(ch.ch)) o.white = 1;
  if (ch.ch === 'cave2') { o.white = 1 - seg(lt, 0, 1.2); o.black = seg(lt, cue(ch, 'snap').at, cue(ch, 'snap').at + 0.8); }
  if (['powers', 'dump', 'gozmos', 'shard'].includes(ch.ch)) o.black = 1;
  if (ch.ch === 'cave3') o.black = seg(lt, ch.lines[2].t1 + 0.1, ch.lines[2].t1 + 1.0);
  return o;
}
const SPACE = new Set(['galaxy', 'nebula', 'cluster', 'system', 'planet', 'moon']);
function portalAlpha(kind, variant, lt, ch, f, isTop) {
  if (kind === 'cave') { const o = caveOpen(ch, lt); return variant === 'loop' ? o.black : o[variant]; }
  if (SPACE.has(kind)) return isTop ? clamp((f - 0.15) * 1.6) : 0;
  if (kind === 'dump') { if (ch.ch === 'dump') { const l = ch.lines[6]; return seg(lt, l.t0, l.t1 + 0.2); } if (ch.ch === 'shard') return lt < cue(ch, 'crack').at ? 1 : 0; return 1; }
  return 1;
}
function localView(ch, lt) {
  const R0 = (cx, cy, w) => [cx - w / 2, cy - w * 9 / 32, w];
  if ((ch.ch === 'cave1' || ch.ch === 'cave3') && onLine(ch, lt, 0.5, 1.0)) return R0(260, 400, 520);
  if (ch.ch === 'loop' && onLine(ch, lt, 0.5, 0.6)) return R0(360, 380, 460);
  if (ch.ch === 'dump') { const l = ch.lines[6]; if (lt > l.t0 - 0.5) { const hp = headPortal(lt, ch); return R0(hp[0] + hp[2] / 2, hp[1] + hp[2] * 9 / 32, 360); } }
  return null;
}
function drawFrame(stack, idx, s, ox, oy, lt, ch, f, isTop) {
  const [kind, variant] = stack[idx].split(':');
  X.save(); X.setTransform(s, 0, 0, s, ox, oy);
  SCN[kind].draw(null, lt, ch, kind === 'cave' ? caveOpen(ch, lt) : variant);
  const P_ = SCN[kind].portal ? SCN[kind].portal(lt, ch, variant) : null;
  if (P_ && idx + 1 < stack.length && s * P_[2] > 3) {
    const a = portalAlpha(kind, variant, lt, ch, f, isTop);
    if (a > 0.003) {
      const ph = P_[2] * 9 / 16; X.save(); X.beginPath();
      if (SPACE.has(kind)) X.ellipse(P_[0] + P_[2] / 2, P_[1] + ph / 2, P_[2] * (0.5 + 0.35 * clamp(f * 1.4)), ph * (0.5 + 0.5 * clamp(f * 1.4)) * 1.05, 0, 0, 6.283); else X.rect(P_[0], P_[1], P_[2], ph);
      X.clip(); X.globalAlpha = a;
      if (SPACE.has(kind)) { X.fillStyle = P.paper; X.fillRect(P_[0] - 10, P_[1] - 10, P_[2] + 20, ph + 20); }
      const cs = s * P_[2] / 1280; drawFrame(stack, idx + 1, cs, ox + s * P_[0], oy + s * P_[1], lt, ch, 0, false);
      X.restore();
    }
  }
  if (SCN[kind].over) { X.setTransform(s, 0, 0, s, ox, oy); SCN[kind].over(null, lt, ch, variant); }
  X.restore();
}
function renderStack(ch, lt) {
  const st = ch.stack, d = depthAt(ch, lt), i0 = Math.min(st.length - 1, Math.floor(d + 1e-6)), f = Math.min(1, d - i0);
  const [kind, variant] = st[i0].split(':');
  const R0 = localView(ch, lt) || [0, 0, 1280];
  const P_ = SCN[kind].portal && i0 + 1 < st.length ? SCN[kind].portal(lt, ch, variant) : null;
  let view = R0;
  if (P_ && f > 0) { const w0 = R0[2], pw = P_[2], w = w0 * Math.pow(pw / w0, f); const c0 = [R0[0] + w0 / 2, R0[1] + w0 * 9 / 32], cP = [P_[0] + pw / 2, P_[1] + pw * 9 / 32], k = Math.abs(w0 - pw) < 1e-6 ? f : (w0 - w) / (w0 - pw); const cx = c0[0] + (cP[0] - c0[0]) * k, cy = c0[1] + (cP[1] - c0[1]) * k; view = [cx - w / 2, cy - w * 9 / 32, w]; }
  const s = 1280 / view[2];
  drawFrame(st, i0, s, -view[0] * s, -view[1] * s, lt, ch, f, true);
}

/* ================= frame loop ================= */
let T = null;
window.__render = async (f) => {
  const t = f / 24; BOIL = Math.floor(f / 2);
  let i = 0; for (let j = 0; j < T.chapters.length; j++) if (t >= T.chapters[j].t0) i = j;
  const ch = T.chapters[i], lt = t - ch.t0;
  X.setTransform(1, 0, 0, 1, 0, 0); X.fillStyle = P.paper; X.fillRect(0, 0, W, H);
  X.save(); path(R(PX0, PY0, PX1 - PX0, PY1 - PY0)); X.clip();
  if (ch.ch === 'end') {
    X.fillStyle = P.paper; X.fillRect(0, 0, W, H); X.globalAlpha = seg(lt, 0.4, 1.6);
    txt('THE THREE STORYTELLING MACHINES', CX, 300, 38, {}); txt('OF KING GENIUS', CX, 348, 38, {}); txt('after Stanisław Lem, The Cyberiad', CX, 410, 24, { italic: true }); X.globalAlpha = 1;
  } else {
    if (ch.ch === 'dream' && cue(ch, 'whack') && lt > cue(ch, 'whack').at) { const u = clamp((lt - cue(ch, 'whack').at) / (ch.d - cue(ch, 'whack').at)); X.translate(CX, CY); X.rotate(u * u * 5); X.scale(1 - u * 0.6, 1 - u * 0.6); X.translate(-CX, -CY); }
    renderStack(ch, lt);
    if (ch.ch === 'dream' && cue(ch, 'whack') && lt > cue(ch, 'whack').at) { X.setTransform(1, 0, 0, 1, 0, 0); X.globalAlpha = clamp((lt - cue(ch, 'whack').at) * 2); X.fillStyle = P.paper; X.fillRect(0, 0, W, H); X.globalAlpha = 1; }
    if (ch.ch === 'cave1' && lt < 3.4) { X.setTransform(1, 0, 0, 1, 0, 0); X.globalAlpha = 1 - seg(lt, 2.2, 3.4); X.fillStyle = P.paper; X.fillRect(0, 0, W, H); txt('THE THREE STORYTELLING MACHINES', CX, 320, 38, {}); txt('OF KING GENIUS', CX, 368, 38, {}); X.globalAlpha = 1; }
    if (ch.ch === 'loop' && lt < 0.6) { X.setTransform(1, 0, 0, 1, 0, 0); X.globalAlpha = 1 - lt / 0.6; X.fillStyle = P.paper; X.fillRect(0, 0, W, H); X.globalAlpha = 1; }
  }
  X.restore();
  X.setTransform(1, 0, 0, 1, 0, 0); border();
};
(async () => {
  T = await (await fetch('timing/sm.json')).json();
  await document.fonts.ready; await Promise.all(['IM Fell English', 'IBM Plex Mono'].map((n) => document.fonts.load(`20px "${n}"`)));
  X = document.getElementById('film').getContext('2d');
  window.__NF = Math.ceil(T.dur * 24); window.__T = T; window.__ready = true;
})();
