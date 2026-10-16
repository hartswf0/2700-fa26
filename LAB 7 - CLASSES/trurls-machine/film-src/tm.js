/* Trurl's Machine: drawing. Same toolkit as the earlier films (ink.js plus the head of the Ferrix drawing file).
   The device: a test, expected value against actual value. Trurl's chalk on a slate gives the expected answer; the machine's
   windows light up in the shape of its actual answer. The two are shown side by side every time, and they never agree. */
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

/* ================================================================================================
   SHARED HELPERS (cameras, the fulcrum camera, Trurl)
   ================================================================================================ */
const NOPAT = 'rgba(0,0,0,0)';
const FLOOR = 664, GY = 660, PURPLE = '#a58bc4', ROSE = '#c25d76', PALEROSE = '#e8c3cc', EMERALD = '#3f8a74', OCHRE = '#e0c27a', BRASS = '#d9b35c';
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
function nightSky(id = 8000) { hatchSky(PY0 - 400, 760, -500, 1800); for (let i = 0; i < 70; i++) { const sx = -300 + hash(id, i) * 1900, sy = -200 + hash(id + 1, i) * 760; X.fillStyle = P.paper; const z = 1.6 + 2 * hash(id + 2, i); X.fillRect(sx, sy, z, z); } }
function lawn(y, id = 8200) { X.fillStyle = P.paper; X.fillRect(PX0 - 500, y, PX1 - PX0 + 1000, 600); for (let yy = y + 3, k = 0; yy < 820; yy += 5 + k * 0.6, k++) { X.fillStyle = P.ink; X.fillRect(PX0 - 500, yy, PX1 - PX0 + 1000, 0.6 + k * 0.06); } line([PX0 - 500, y], [PX1 + 500, y], 2.4, id, 0.3); }
function trurlHouse(x, y, lt, o = {}) {
  shape(R(x - 130, y - 230, 260, 230), { lw: 2, id: 8300, h: [Math.PI / 2, 3.6, 0.5], sh: R(x + 20, y - 230, 110, 230), sh2: [Math.PI / 2, 2, 0.8] });
  shape([[x - 156, y - 230], [x, y - 340], [x + 156, y - 230]], { lw: 2, id: 8301, fill: P.paper, h: [0.5, 3, 0.7] });
  shape(R(x + 60, y - 330, 26, 60), { lw: 1.6, id: 8302, h: [Math.PI / 2, 2.6, 0.6] });
  for (const wx of [-80, 80]) shape(R(x + wx - 20, y - 190, 40, 46), { lw: 1.6, id: 8310 + wx, fill: o.lit ? P.amber : P.ink });
  const sh_ = o.shake ? Math.sin(lt * 70) * o.shake * 3 : 0;
  X.save(); X.translate(sh_, 0); door(x, y, 72, 150, 8320, { open: o.open || 0 }); X.restore();
}
function sackPile(x0, x1, y, n, gap, id) { // fills bottom-up, leaving a gap between gap[0] and gap[1]
  const r = 22, cols = Math.floor((x1 - x0) / (r * 1.7)); let k = 0;
  for (let row = 0; row < 30 && k < n; row++) for (let c = 0; c < cols && k < n; c++) { const sx = x0 + (c + 0.5 + (row % 2) * 0.4) * (x1 - x0) / cols, sy = y - r * 0.7 - row * r * 1.35; if (sx > gap[0] && sx < gap[1] && row < (gap[2] || 99)) continue; sack(sx + (hash(id, k) - 0.5) * 6, sy, r * (0.85 + 0.3 * hash(id + 1, k)), id + 10 + k * 4); k++; }
}
function stoneRoom(lt) { wallRoom(520, 2.8); }
function chair(x, y, s, id, f = 1) { shape(R(x - 50 * s, y - 128 * s, 100 * s, 16 * s), { lw: 1.6, id, h: [0.1, 3, 0.6] }); for (const d of [-1, 1]) shape(R(x + d * 40 * s - 5, y - 112 * s, 10, 112 * s), { lw: 1.4, id: id + 1 + d, h: [Math.PI / 2, 2.4, 0.6] }); shape(R(x - f * 50 * s - 6, y - 280 * s, 12, 160 * s), { lw: 1.6, id: id + 4, h: [Math.PI / 2, 2.4, 0.6] }); }
function bookshelf(x, y, w, h, id) { shape(R(x - w / 2, y - h, w, h), { lw: 2, id, fill: P.paper, h: [Math.PI / 2, 4, 0.4] }); for (let r = 0; r < 4; r++) { const sy = y - h + 14 + r * (h - 20) / 4; line([x - w / 2, sy + (h - 20) / 4 - 4], [x + w / 2, sy + (h - 20) / 4 - 4], 2.4, id + 1 + r, 0.2); for (let i = 0; i < 9; i++) { const bw = 8 + 6 * hash(id + r, i), bx = x - w / 2 + 6 + i * (w - 12) / 9; shape(R(bx, sy + 4 + hash(id + 9, i) * 8, bw, (h - 20) / 4 - 12 - hash(id + 9, i) * 8), { lw: 1, id: id + 20 + r * 10 + i, fill: i % 3 ? P.paper : '#d8d2c0', h: i % 2 ? [0, 2.2, 0.6] : undefined }); } } }

/* ================================================================================================
   TRURL'S MACHINE
   The device: a test. Trurl's chalk on a slate is the expected value. The machine's windows, five across and eight floors up,
   light in the shape of its actual value. Chalk and lit number are shown side by side after every repair, and never agree.
   ================================================================================================ */
const LIT = '#f2c14e', LAV = '#c4b0de', ORANGE = '#efa868', SLATE = '#2f3531', STEEL = '#8a8d8e', WOOD = '#b8873e', WHITE = '#f4efe2', NIGHT = '#16130f';
const MS = 0.95, FHt = 62, ANS = { 'Seven.': '7', 'Six.': '6', 'Zero.': '0' };
/* the machine's numerals: rows are floors, top floor first; columns are the five windows of a floor */
const DIG = {
  '7': ['#####', '....#', '...#.', '...#.', '..#..', '..#..', '.#...', '.#...'],
  '6': ['.###.', '#....', '#....', '####.', '#...#', '#...#', '#...#', '.###.'],
  '0': ['.###.', '#...#', '#...#', '#...#', '#...#', '#...#', '#...#', '.###.'],
  '4': ['...#.', '..##.', '.#.#.', '#..#.', '#####', '...#.', '...#.', '...#.'],
  '5': ['#####', '#....', '#....', '####.', '....#', '....#', '#...#', '.###.'],
  '8': ['.###.', '#...#', '#...#', '.###.', '#...#', '#...#', '#...#', '.###.'],
};
function litGrid(st) {
  const g = [];
  for (let r = 0; r < 8; r++) {
    g.push([]);
    for (let c = 0; c < 5; c++) {
      let v = st.digit && DIG[st.digit][r][c] === '#' ? 1 : 0;
      if (st.think > 0) { const h = hash(r * 5 + c + 17 * (st.seed || 0), Math.floor(GT * 12)); v = h < st.think * 0.6 ? 1 : 0; }
      if (st.all) v = Math.max(v, st.all);
      if (st.flick) v *= hash(r * 5 + c, Math.floor(GT * 9)) > st.flick ? 1 : 0.15;
      g[r].push(v * (st.lit ?? 1));
    }
  }
  return g;
}
/* the machine, standing: (x, y) is the bottom of the plinth. st: digit, think, all, lit, flick, trim, dots, curl, trap, glow,
   shake, legs, walk, ph, rot, steam, plaster, cut (draw only the floors from..to, for the broken halves) */
function machine(x, y, s, st = {}, id = 20000) {
  if (SILENT) return;
  const sk = st.shake ? [Math.sin(GT * 61) * st.shake, Math.cos(GT * 53) * st.shake * 0.5] : [0, 0];
  X.save(); X.translate(x + sk[0], y + sk[1]); X.rotate(st.rot || 0); X.scale(s, s);
  if (st.legs) {
    const ph = st.ph || 0, wk = st.walk || 0;
    for (const k of [-1, 1]) {
      const q = ph + (k > 0 ? Math.PI : 0), lift = Math.max(0, Math.sin(q)) * 30 * wk, sw = Math.cos(q) * 16 * wk;
      shape([[k * 62 - 22, -6], [k * 62 + 22, -6], [k * 62 + 18 + sw * 0.5, 40 - lift], [k * 62 - 18 + sw * 0.5, 40 - lift]], { lw: 2.2, id: id + 1 + k, fill: STEEL, h: [Math.PI / 2, 3, 0.7] });
      shape(R(k * 62 - 36 + sw, 38 - lift, 72, 16), { lw: 2, id: id + 4 + k, fill: P.ink });
    }
  }
  shape(R(-118, -30, 236, 30), { lw: 2.2, id: id + 10, fill: '#ddd5c2', h: [0.2, 3, 0.6] });
  const tr = st.trap || 0;
  shape(R(-24, -28, 48, 26), { lw: 1.6, id: id + 11, fill: tr > 0.05 ? P.ink : '#cfc6b0', h: tr > 0.05 ? undefined : [0.8, 3, 0.5] });
  if (tr > 0.05) shape([[-24, -28], [24, -28], [24 + 10 * tr, -28 - 26 * tr], [-24 + 10 * tr, -28 - 26 * tr]], { lw: 1.6, id: id + 12, fill: '#cfc6b0', h: [0.3, 3, 0.6] });
  shape(R(-110, -526, 220, 496), { lw: 2.6, id: id + 13, fill: WHITE, sh: R(48, -526, 62, 496), sh2: [Math.PI / 2, 3.4, 0.5] });
  for (let k = 1; k < 8; k++) line([-110, -30 - k * FHt], [110, -30 - k * FHt], 1.1, id + 20 + k, 0.3);
  const tm = st.trim ?? 1;
  if (tm > 0) for (const ex of [-110, 101]) shape(R(ex, -30 - 496 * tm, 9, 496 * tm), { lw: 1.1, id: id + 30 + ex, fill: LAV, amp: 0.3 });
  if (tm > 0.98) shape(R(-114, -532, 228, 8), { lw: 1.1, id: id + 33, fill: LAV, amp: 0.3 });
  const g = litGrid(st);
  for (let r = 0; r < 8; r++) for (let c = 0; c < 5; c++) {
    const k = 7 - r, wx = -110 + 11.67 + c * 41.67, wy = -30 - (k + 1) * FHt + 12, v = g[r][c];
    shape(R(wx, wy, 30, 38), { lw: 1.4, id: id + 40 + r * 5 + c, fill: DARK, amp: 0.3 });
    if (v > 0.02) {
      X.save(); X.globalAlpha = v * 0.32; X.fillStyle = LIT; X.fillRect(-110 + c * 41.67 + 2, -30 - (k + 1) * FHt + 2, 41.67 + 8, FHt - 2); X.restore();
      X.save(); X.globalAlpha = v * 0.4; X.fillStyle = LIT; X.fillRect(wx - 6, wy - 6, 42, 50); X.restore();
      X.save(); X.globalAlpha = v; X.fillStyle = LIT; X.fillRect(wx + 1, wy + 1, 28, 36); X.restore();
      X.save(); X.globalAlpha = v * 0.6; line([wx + 15, wy + 2], [wx + 15, wy + 36], 1, id + 90 + r * 5 + c, 0.1, '#b07a1a'); X.restore();
    } else line([wx + 15, wy], [wx + 15, wy + 38], 0.8, id + 90 + r * 5 + c, 0.1, '#5a5048');
  }
  // the forehead: pale orange spots and a curlicue
  shape(R(-110, -570, 220, 44), { lw: 2.4, id: id + 140, fill: WHITE, h: [0.1, 4, 0.3] });
  const nd = Math.floor((st.dots ?? 1) * 6 + 1e-6);
  [-86, -62, -38, 38, 62, 86].forEach((dx, i) => { if (i < nd) { X.beginPath(); X.arc(dx, -548, 8, 0, 6.2832); X.fillStyle = ORANGE; X.fill(); X.lineWidth = 1.2; X.strokeStyle = P.ink; X.stroke(); } });
  const cu = st.curl ?? 1; if (cu > 0) { const p = []; for (let i = 0; i <= 40 * cu; i++) { const a = i * 0.32, r_ = 2 + i * 0.36; p.push([Math.cos(a) * r_, -548 + Math.sin(a) * r_ * 0.9]); } ink(p, 2, id + 150, 0.2); }
  // roof: cornice, four valves and two coils
  shape(R(-118, -578, 236, 8), { lw: 1.8, id: id + 160, fill: P.ink });
  const gl = st.glow || 0;
  for (const [i, vx] of [-72, -26, 26, 72].entries()) {
    if (gl > 0.02) { X.save(); X.globalAlpha = gl * (0.4 + 0.4 * hash(i, Math.floor(GT * 14))); X.beginPath(); X.arc(vx, -600, 22, 0, 6.2832); X.fillStyle = LIT; X.fill(); X.restore(); }
    shape(R(vx - 8, -586, 16, 8), { lw: 1.2, id: id + 170 + i, fill: P.ink });
    X.beginPath(); X.ellipse(vx, -604, 11, 18, 0, 0, 6.2832); X.fillStyle = gl > 0.3 ? '#fbe7b0' : P.paper; X.fill(); X.lineWidth = 1.6; X.strokeStyle = P.ink; X.stroke();
    ink([[vx - 4, -592], [vx - 4, -610], [vx + 4, -610], [vx + 4, -592]], 1, id + 175 + i, 0.2);
  }
  for (const cx_ of [-49, 49]) { const p = []; for (let i = 0; i <= 30; i++) p.push([cx_ + Math.sin(i * 1.3) * 7, -582 - i * 1.2]); ink(p, 1.6, id + 180 + cx_, 0.2); }
  line([0, -578], [0, -640], 2, id + 190, 0.2); ball(0, -644, 5, id + 191, PAT.d, 1.2);
  if (st.steam) for (let i = 0; i < 6; i++) { const u = (GT * 0.6 + i / 6) % 1; X.save(); X.globalAlpha = st.steam * (1 - u) * 0.9; ball(-70 + (i % 4) * 46 + Math.sin(u * 5 + i) * 10, -620 - u * 160, 12 + u * 30, id + 200 + i, PAT.f, 1.2); X.restore(); }
  if (st.plaster) { X.save(); X.globalAlpha = st.plaster; for (let i = 0; i < 26; i++) { const px = -100 + hash(id + 3, i) * 200, py = -560 + hash(id + 4, i) * 520; shape(blobPts(px, py, 10 + 14 * hash(id + 5, i), 6 + 8 * hash(id + 6, i), id + 300 + i, 18, 0.3), { lw: 0.6, id: id + 300 + i, fill: '#fbf8ef' }); } X.restore(); }
  X.restore();
}
const mHead = (x, y, s) => [x, y - 548 * s];
/* a cue's answer: the machine's next arithmetic line after a racket of thinking */
function mState(sh, lt, base = {}) {
  const st = Object.assign({}, base); let thk = 0, glow = 0, dig = base.digit ?? null, since = 1e9;
  cues(sh, 'think').forEach((c) => {
    const ln = sh.lines.find((l) => l.same && l.t0 >= c.to - 0.05);
    if (lt >= c.at && lt < c.to) { thk = 0.15 + 0.85 * U(lt, c.at, c.to); dig = null; glow = thk; since = 1e9; }
    else if (lt >= c.to) { dig = ln ? ANS[ln.say] : dig; glow = Math.max(0, 1 - (lt - c.to) / 2.5); since = lt - c.to; }
  });
  st.think = thk; st.glow = Math.max(glow, base.glow || 0); if (!('digit' in base) || base.digit === undefined) st.digit = dig;
  st.shake = Math.max(base.shake || 0, thk > 0 ? 1 + 2.5 * thk : since < 0.4 ? 3 * (1 - since / 0.4) : 0);
  const e = sayAt(sh, 'M', lt);
  if (st.digit) st.lit = (base.lit ?? 1) * (0.78 + 0.22 * e); else st.all = Math.max(st.all || 0, 0.35 * e);
  return st;
}
/* the slate on its easel: (x, y) the ground between the legs. text is chalk; prog 0..1 how much of it is written; rub 0..1 wiped */
function slate(x, y, s, text, prog = 1, id = 21000, o = {}) {
  if (SILENT) return;
  X.save(); X.translate(x, y); X.scale(s, s);
  line([-78, 0], [-56, -262], 5, id, 0.3); line([78, 0], [56, -262], 5, id + 1, 0.3); line([0, -244], [10, 4], 4, id + 2, 0.3);
  shape(R(-126, -250, 252, 150), { lw: 2.4, id: id + 3, fill: WOOD, h: [0.3, 3, 0.5] });
  shape(R(-114, -238, 228, 126), { lw: 1.6, id: id + 4, fill: SLATE });
  shape(R(-132, -104, 264, 9), { lw: 1.4, id: id + 5, fill: WOOD });
  shape(R(60, -110, 22, 6), { lw: 0.8, id: id + 6, fill: '#efe9da' });
  if (o.rub) { X.save(); X.globalAlpha = 0.35 * o.rub; X.fillStyle = '#cfcabd'; for (let i = 0; i < 7; i++) X.fillRect(-100 + i * 6, -220 + i * 12, 200 - i * 9, 22); X.restore(); }
  if (text && prog > 0) { X.save(); X.font = 'italic 52px "DejaVu Serif",Georgia,serif'; const fw = X.measureText(text).width; X.restore(); chalkText(text, 0, -175, Math.min(52, 52 * 196 / Math.max(1, fw)), prog, id + 10); }
  X.restore();
}
function chalkText(text, x, y, size, prog, id, col = '#efebe0', alpha = 1) {
  if (SILENT) return;
  const n = Math.floor(text.length * clamp(prog) + 1e-6); if (n <= 0) return;
  X.save(); X.globalAlpha = alpha; X.font = `italic ${size}px "DejaVu Serif",Georgia,serif`; X.textAlign = 'left'; X.textBaseline = 'middle';
  const wAll = X.measureText(text).width, x0 = x - wAll / 2, part = text.slice(0, n);
  X.fillStyle = col; X.fillText(part, x0 + J(id, 1) * 0.8, y + J(id, 2) * 0.8);
  X.globalAlpha = alpha * 0.45; X.fillText(part, x0 + 1.2, y - 0.8);
  const w = X.measureText(part).width; X.globalAlpha = 0.5; X.fillStyle = SLATE;
  for (let i = 0; i < w * 1.4; i++) X.fillRect(x0 + hash(id, i) * w, y - size * 0.45 + hash(id + 1, i) * size * 0.9, 1.4, 1.4);
  X.restore();
}
/* the chalk text in the scene: what the slate says at lt */
function slateText(sh, lt, list) { let cur = null; for (const [t, txt_, a, b] of list) if (lt >= t) cur = { txt: txt_, prog: b > a ? U(lt, a, b) : 1 }; return cur || { txt: '', prog: 0 }; }

/* ---------- the cast ---------- */
const PS = 0.3;
function klapF(x, y, s, sh, lt, o = {}) {
  const { sp, e } = armsFor(sh, 'K', lt, o), f = o.f || 1, ra = o.ra || (sp ? [0.1 - e * 0.5, -0.5 - e * 0.4] : [1.5, 1.6]);
  rotAbout(x, y, o.rot || 0, () => constructor_(x, y, s, 600, { robe: true, robeFill: '#cfc8b6', f, seated: o.seated, ra, la: o.la || [1.4, 1.65], open: o.open ?? (sp ? 0.8 : 0), look: o.look ?? 1, lookY: o.lookY || 0, mouth: e, tilt: o.tilt || 0, walk: o.walk || 0, ph: o.ph || 0, closed: o.closed, stern: o.stern }));
}
function trurl2(x, y, s, sh, lt, o = {}) {
  trurlF(x, y, s, sh, lt, o);
  if (o.soot) { X.save(); X.globalAlpha = o.soot; const [hx, hy] = headPos(x, y, s); for (let i = 0; i < 20; i++) { X.fillStyle = P.ink; X.beginPath(); X.arc(hx + (hash(77, i) - 0.5) * 50 * s, hy + (hash(78, i) - 0.3) * 70 * s, (2 + 4 * hash(79, i)) * s, 0, 6.2832); X.fill(); } for (let i = 0; i < 14; i++) { X.beginPath(); X.arc(x + (hash(80, i) - 0.5) * 60 * s, y - (60 + hash(81, i) * 160) * s, (3 + 4 * hash(82, i)) * s, 0, 6.2832); X.fill(); } X.restore(); }
  if (o.chalkHand) { const h = handPos(x, y, s, o.f || 1, o.ra || [1.5, 1.6]); shape(R(h[0] - 3, h[1] - 9, 6, 10), { lw: 0.8, id: 489, fill: '#efe9da' }); }
}
function mayorF(x, y, s, sh, lt, o = {}) {
  const f = o.f || 1, { sp, e } = armsFor(sh, 'Y', lt, o), ra = o.ra || (sp ? [0.1 - e * 0.5, -0.5 - e * 0.4] : [1.5, 1.6]);
  constructor_(x, y, s, 1100, { robe: true, robeFill: '#a99a7a', f, ra, la: [1.4, 1.65], open: sp ? 0.8 : 0, look: o.look ?? 1, mouth: e, stern: true, tilt: o.tilt || 0, walk: o.walk || 0, ph: o.ph || 0 });
  for (let i = 0; i < 7; i++) { const a = 0.4 + i * 0.39; ball(x + Math.cos(a) * 34 * s, y - 226 * s + Math.sin(a) * 30 * s, 4.5 * s, 1150 + i, PAT.f, 1, LIT); }
  ball(x, y - 190 * s, 9 * s, 1160, PAT.m, 1.2, LIT);
  const hx = x, hy = y - 286 * s; shape(R(hx - 26 * s, hy - 100 * s, 52 * s, 62 * s), { lw: 1.6, id: 1170, fill: P.ink }); shape(R(hx - 40 * s, hy - 42 * s, 80 * s, 8 * s), { lw: 1.4, id: 1171, fill: P.ink });
}
function alderman(x, y, s, id, o = {}) { micro(x, y, s, id, { f: o.f || 1, look: o.look || 0, tilt: o.tilt || 0, walk: o.walk || 0, ph: o.ph || 0, ant: 0 }); shape(R(x - 10 * s, y - 70 * s, 20 * s, 14 * s), { lw: 1, id: id + 50, fill: P.ink }); shape(R(x - 15 * s, y - 57 * s, 30 * s, 4 * s), { lw: 1, id: id + 51, fill: P.ink }); }

/* ---------- landscape ---------- */
function sandWorld(x0, x1, gy, id = 22000, o = {}) {
  X.fillStyle = P.paper; X.fillRect(x0, -800, x1 - x0, 2200);
  X.save(); X.globalAlpha = 0.42; for (let y = -600; y < gy - 120; y += 4) { X.fillStyle = P.ink; X.fillRect(x0, y, x1 - x0, 0.4 + 0.9 * clamp((y + 600) / (gy + 480))); } X.restore();
  if (o.mountains) { const m = [[x0 - 50, gy - 100]]; for (let x = Math.floor(x0 / 90) * 90; x <= x1 + 90; x += 90) m.push([x, gy - 140 - o.mountains * (120 + 160 * Math.abs(Math.sin(x * 0.0047)) + 60 * hash(id, Math.round(x / 90)))]); m.push([x1 + 50, gy - 100]); shape(m, { lw: 1.4, id: id + 1, fill: '#e2dac6', h: [[0.7, 3.6, 0.5], [-0.5, 5, 0.3]] }); }
  const d = [[x0 - 50, gy + 10]]; for (let x = Math.floor(x0 / 60) * 60; x <= x1 + 60; x += 60) d.push([x, gy - 60 - 30 * Math.sin(x * 0.006) - 18 * Math.sin(x * 0.017 + 1)]); d.push([x1 + 50, gy + 10]);
  shape(d, { lw: 1.3, id: id + 2, fill: '#ece2c8', h: [0.12, 5, 0.4] });
  if (o.workshop != null) trurlHouse(o.workshop, gy - 40, 0, { lit: false });
  if (o.mist) { X.save(); for (let i = 0; i < 4; i++) { X.globalAlpha = o.mist * 0.55; X.fillStyle = P.paper; X.fillRect(x0, gy - 200 + i * 34 + Math.sin(GT * 0.3 + i) * 6, x1 - x0, 14); } X.restore(); }
}
function ground(x0, x1, gy, id = 22100, o = {}) {
  X.fillStyle = o.hard ? '#ddd4bf' : '#efe5cb'; X.fillRect(x0, gy, x1 - x0, 700);
  for (let y = gy + 4, k = 0; y < gy + 600; y += 6 + k * 0.7, k++) { X.fillStyle = P.ink; X.fillRect(x0, y, x1 - x0, 0.45 + k * 0.05); }
  if (o.hard) for (let x = Math.floor(x0 / 70) * 70; x < x1; x += 70) { const h_ = hash(id, Math.round(x / 70)); shape(blobPts(x + h_ * 40, gy + 12 + h_ * 30, 10 + 14 * h_, 5 + 4 * h_, id + Math.round(x / 70), 16, 0.2), { lw: 1, id: id + 5, fill: '#cbbf9f', h: [0.6, 2.4, 0.5] }); }
  else for (let x = Math.floor(x0 / 40) * 40; x < x1; x += 40) { const h_ = hash(id + 9, Math.round(x / 40)); ink([[x, gy + 10 + h_ * 40], [x + 16 + 10 * h_, gy + 8 + h_ * 40]], 0.8, id + 30 + Math.round(x / 40), 0.4); }
  line([x0, gy], [x1, gy], 2.2, id + 1, 0.4);
}
function puff(x, y, r, a, id, fill = '#f6f2e8') { if (a <= 0.01) return; X.save(); X.globalAlpha = a; const p = blobPts(x, y, r, r * 0.8, id, 22, 0.22); shape(p, { lw: 1.1, id, fill, amp: 0.6 }); stip(p, id + 5, 0.006, 1.2); X.restore(); }
/* a cloud of plaster dust born at t0 */
function dustCloud(x, y, age, id, size = 1) { if (age < 0 || age > 7) return; for (let i = 0; i < 9; i++) { const a = hash(id, i) * 6.28, sp = (30 + 70 * hash(id + 1, i)) * size; const px = x + Math.cos(a) * sp * Math.min(1, age * 0.9) + age * 12, py = y - Math.abs(Math.sin(a)) * sp * Math.min(1, age) - age * 8; puff(px, py, (24 + 30 * hash(id + 2, i) + age * 12) * size, clamp(1 - age / 7) * 0.9, id + 10 + i); } }

/* the inside of the machine, cut open: eight floors, a flight of iron stairs on the right of each, machinery on the left.
   fl is where Trurl is: a floor number, fractional while he is on the stairs. */
function machineInside(x, y, s, lt, fl, o = {}) {
  X.save(); X.translate(x, y); X.scale(s, s);
  shape(R(-130, -580, 260, 580), { lw: 2.6, id: 23000, fill: '#e9e2d0' });
  X.save(); X.globalAlpha = 0.5; for (let yy = -578; yy < 0; yy += 3.2) { X.fillStyle = P.ink; X.fillRect(-128, yy, 256, 0.6); } X.restore();
  for (const ex of [-130, 112]) shape(R(ex, -580, 18, 580), { lw: 2, id: 23001 + ex, fill: WHITE, h: [Math.PI / 2, 2.6, 0.7] });
  for (let k = 0; k <= 8; k++) shape(R(-112, -30 - k * FHt - (k ? 6 : 0), 224, k ? 6 : 30), { lw: 1.6, id: 23010 + k, fill: '#cfc6b0', h: [0.1, 2.4, 0.6] });
  for (let k = 0; k < 8; k++) {
    const yb = -30 - k * FHt, yt = yb - FHt + 6, a = k % 2 ? 100 : 30, b = k % 2 ? 30 : 100;
    // the flight up to the next floor
    if (k < 7) { ink([[a, yb], [b, yt]], 2, 23100 + k, 0.2); for (let i = 1; i < 7; i++) { const u = i / 7; line([lerp(a, b, u) - 6, lerp(yb, yt, u)], [lerp(a, b, u) + 6, lerp(yb, yt, u)], 1.4, 23120 + k * 9 + i, 0.1); } ink([[a, yb - 26], [b, yt - 26]], 1, 23200 + k, 0.3); }
    // machinery on the left: coils, valves, a cabinet of relays
    const kind = k % 3, mx_ = -70;
    if (kind === 0) { for (let i = 0; i < 3; i++) { const p = []; for (let j = 0; j <= 24; j++) p.push([mx_ - 26 + i * 26 + Math.sin(j * 1.4) * 8, yb - 6 - j * 1.8]); ink(p, 1.6, 23300 + k * 5 + i, 0.2); } }
    else if (kind === 1) { for (let i = 0; i < 4; i++) { const vx = mx_ - 30 + i * 20, on = o.glow ? 0.4 + 0.6 * hash(i + k, Math.floor(lt * 10)) * o.glow : 0; if (on > 0.1) { X.save(); X.globalAlpha = on * 0.6; X.beginPath(); X.arc(vx, yb - 26, 12, 0, 6.2832); X.fillStyle = LIT; X.fill(); X.restore(); } X.beginPath(); X.ellipse(vx, yb - 26, 7, 13, 0, 0, 6.2832); X.fillStyle = P.paper; X.fill(); X.lineWidth = 1.2; X.strokeStyle = P.ink; X.stroke(); shape(R(vx - 6, yb - 14, 12, 8), { lw: 1, id: 23400 + k * 5 + i, fill: P.ink }); } }
    else { shape(R(mx_ - 34, yb - 46, 60, 40), { lw: 1.6, id: 23500 + k, fill: '#d8d0bc', h: [0.4, 3, 0.5] }); for (let i = 0; i < 6; i++) ball(mx_ - 24 + (i % 3) * 20, yb - 36 + Math.floor(i / 3) * 16, 3.2, 23510 + k * 7 + i, PAT.d, 0.8); }
    // cables between floors
    ink([[-100, yb], [-96, yb - FHt + 6]], 2.4, 23600 + k, 0.4);
  }
  // sparks: the middle floors sizzle, and the spark plugs grow blue whiskers
  if (o.sizzle > 0) for (let i = 0; i < 6; i++) { const k = 3 + (i % 2), sx = -60 + hash(i, Math.floor(lt * 14)) * 60, sy = -30 - k * FHt - 20; star(sx, sy, 6 + 10 * hash(i + 3, Math.floor(lt * 14)) * o.sizzle, 23700 + i, P.blue, 6); }
  // the main switch on the ground floor
  shape(R(-30, -78, 30, 40), { lw: 1.6, id: 23800, fill: '#d8d0bc' }); const sw = o.sw || 0; line([-15, -58], [-15 + Math.cos(-2.2 + 1.4 * sw) * 26, -58 + Math.sin(-2.2 + 1.4 * sw) * 26], 3, 23801, 0.1); ball(-15 + Math.cos(-2.2 + 1.4 * sw) * 28, -58 + Math.sin(-2.2 + 1.4 * sw) * 28, 4, 23802, PAT.d, 1);
  X.restore();
  // Trurl on the stairs
  const k = Math.min(7, Math.floor(fl)), u = fl - k, a = k % 2 ? 100 : 30, b = k % 2 ? 30 : 100;
  const tx = x + lerp(a, b, u) * s, ty = y + (-30 - (k + u) * FHt) * s, moving = o.moving;
  trurl2(tx, ty, 0.13 * s, null, lt, { f: moving ? (k % 2 ? -1 : 1) * (o.down ? -1 : 1) : -1, walk: moving ? 1 : 0, ph: lt * 16, bag: false, ra: o.hammer ? [-0.6 - 0.9 * Math.abs(Math.sin(lt * 9)), -1.2] : undefined, soot: o.soot || 0 });
  if (o.hammer && !moving) { const hh = handPos(tx, ty, 0.13 * s, -1, [-0.6 - 0.9 * Math.abs(Math.sin(lt * 9)), -1.2]); line(hh, [hh[0] - 10, hh[1] - 6], 2, 23900, 0.1); shape(R(hh[0] - 16, hh[1] - 10, 8, 8), { lw: 1, id: 23901, fill: P.ink }); }
  return [tx, ty];
}

/* ---------- 1. the test ---------- */
const MX = 880, SX = 470;
SHOTS.test = (lt, sd, sh) => {
  const L = sh.lines, pa = cue(sh, 'paint'), ch = cue(sh, 'chalk'), th = cues(sh, 'think');
  const paint = U(lt, pa.at, pa.to), trim = clamp(paint / 0.45), dots = clamp((paint - 0.45) / 0.45), curl = clamp((paint - 0.9) / 0.1);
  const onLadder = lt < L[1].t0 - 0.3;
  const st = mState(sh, lt, { trim, dots, curl });
  const head = mHead(MX, GY, MS);
  let c = camFor(lt, [[0, ON(640, 360, 1.0)], [2.8, ON(MX - 70, GY - 470, 1.75)], [L[1].t0 - 0.3, ON(SX + 20, GY - 170, 2.1)], [L[2].t0 - 0.2, ON(700, GY - 210, 1.35)], [th[0].at, ON(690, 365, 1.0)], [L[4].t0 - 0.3, ON(620, GY - 190, 1.45)], [th[1].at, ON(690, 365, 1.0)]], 1.1);
  c = withTight(sh, lt, c, 690, 377, 1.06); // the chalk and the lit answer side by side
  cam(c, () => {
    sandWorld(-400, 1700, GY, 22000, { workshop: 150 });
    ground(-400, 1700, GY);
    shape(R(MX - 130, GY - 4, 260, 12), { lw: 1.6, id: 24000, fill: '#cfc6b0', h: [0.2, 3, 0.6] });
    machine(MX, GY, MS, st);
    // sand slides off the foundation while it thinks
    if (st.think > 0) for (let i = 0; i < 14; i++) { const u = (lt * 1.7 + i / 14) % 1; X.save(); X.globalAlpha = st.think * (1 - u); X.fillStyle = P.ink; X.fillRect(MX - 140 + hash(24, i) * 280, GY - 4 + u * 10, 2, 2); X.restore(); }
    const tx = lt < L[1].t0 - 0.3 ? 0 : 1;
    const sT = slateText(sh, lt, [[0, '', 0, 0], [ch.at, '2 + 2 = 4', ch.at, ch.to]]);
    slate(SX, GY, 0.8, sT.txt, sT.prog, 21000);
    if (onLadder) {
      const lx = MX - 150, ltop = GY - 500;
      line([lx - 14, GY], [lx - 10, ltop], 3, 24010, 0.3); line([lx + 14, GY], [lx + 10, ltop], 3, 24011, 0.3); for (let y = GY - 20; y > ltop; y -= 26) line([lx - 13, y], [lx + 13, y], 2, 24012 + y, 0.1);
      const by = lerp(GY - 30, ltop + 40, E.io(U(lt, 0.3, 2.6)));
      trurl2(lx + 4, by, PS, sh, lt, { f: 1, bag: false, ra: [-0.5 + 0.3 * Math.sin(lt * 5), -0.6], la: [-0.9, -1.4] });
      const hh = handPos(lx + 4, by, PS, 1, [-0.5 + 0.3 * Math.sin(lt * 5), -0.6]); line(hh, [hh[0] + 22, hh[1] - 10], 2.4, 24030, 0.1); shape(R(hh[0] + 20, hh[1] - 15, 7, 9), { lw: 1, id: 24031, fill: dots > 0 && dots < 1 ? ORANGE : LAV });
    } else {
      const writing = lt >= ch.at - 0.2 && lt < ch.to + 0.2;
      trurl2(writing ? SX + 98 : 640, GY, PS, sh, lt, { f: writing ? -1 : 1, look: writing ? 1 : 1, lookY: lt >= L[2].t0 ? -0.7 : 0, ra: writing ? [-2.6 + 0.25 * Math.sin(lt * 11), -2.9 + 0.3 * Math.sin(lt * 13)] : undefined, chalkHand: writing, walk: lt >= ch.to + 0.2 && lt < ch.to + 1.2 ? 1 : 0, ph: lt * 9 });
    }
  });
};

/* ---------- 2. the repairs ---------- */
function trurlInterior(ins, lt) {
  const u = U(lt, ins.at, ins.to); let fl = 0, moving = false, down = false, hammer = false, sw = 0, sizzle = 0;
  if (u < 0.1) { fl = 0; hammer = true; }
  else if (u < 0.38) { fl = 5 * E.io(U(u, 0.1, 0.38)); moving = true; }
  else if (u < 0.48) { fl = 5; hammer = true; }
  else if (u < 0.58) { fl = 5 + 2 * E.io(U(u, 0.48, 0.58)); moving = true; }
  else if (u < 0.68) { fl = 7; hammer = true; }
  else if (u < 0.9) { fl = 7 * (1 - E.io(U(u, 0.68, 0.9))); moving = true; down = true; }
  else { fl = 0; sw = U(u, 0.9, 0.94); sizzle = u > 0.93 ? 1 : 0; }
  return { fl, moving, down, hammer, sw, sizzle };
}
SHOTS.repair = (lt, sd, sh) => {
  const L = sh.lines, ins = cue(sh, 'inside'), ou = cue(sh, 'out'), ag = cue(sh, 'again'), kl = cue(sh, 'klap'), wi = cue(sh, 'wipe'), c2 = cue(sh, 'chalk2'), th = cues(sh, 'think');
  if (lt >= ins.at && lt < ins.to) {
    const ti = trurlInterior(ins, lt), IX = 640, IY = 700, IS = 1.14;
    const ty = IY + (-30 - ti.fl * FHt) * IS;
    const c = ON(640, clamp(ty - 40, 250, 470), 1.55);
    cam(c, () => { X.fillStyle = P.paper; X.fillRect(-400, -400, 2200, 1600); hatchSky(-300, 760, -400, 1800); machineInside(IX, IY, IS, lt, ti.fl, { moving: ti.moving, down: ti.down, hammer: ti.hammer, sw: ti.sw, sizzle: ti.sizzle, glow: 0.6, soot: U(lt, ins.at, ins.to) * 0.7 }); });
    dipAt(lt, ins.at, 0.25); dipAt(lt, ins.to, 0.25); return;
  }
  const again = lt >= ag.at && lt < ag.to;
  let base = {};
  if (lt < ins.at) base = { trap: E.io(U(lt, L[0].t0 + 1.0, L[0].t0 + 2.0)) };
  else if (lt >= ou.at && lt < ou.at + 1.2) base = { trap: 1 - U(lt, ou.at + 0.6, ou.at + 1.2) };
  if (again) { const u = U(lt, ag.at, ag.to); base = u < 0.62 ? { digit: null, flick: 0, think: 0.35, trap: 0 } : u < 0.9 ? { digit: '7', shake: u < 0.68 ? 3 : 0 } : { digit: '7' }; }
  // after Klapaucius wipes the slate, the old answer goes dark until the next one
  const st = mState(sh, lt, base);
  if (!again && lt >= ag.to && lt < th[1].at) { st.digit = lt < wi.at ? '7' : null; st.think = 0; }
  const sT = slateText(sh, lt, [[0, '2 + 2 = 4', 0, 0], [wi.at + 1.0, '1 + 2 = 3', wi.at + 1.0, wi.to + 0.2], [c2.at + 0.4, '1 + 1 = 2', c2.at + 0.4, c2.at + 1.6]]);
  const rub = lt >= wi.at && lt < wi.at + 1.0 ? U(lt, wi.at, wi.at + 1.0) : lt >= c2.at && lt < c2.at + 0.4 ? U(lt, c2.at, c2.at + 0.4) : 0;
  const KX = 610, TSX = 760;
  const kIn = lt >= kl.at - 1.5, kx = lt < kl.to ? lerp(1400, KX, E.out(U(lt, kl.at - 1.5, kl.to))) : KX;
  const kWrite = (lt >= wi.at && lt < wi.to + 0.3) || (lt >= c2.at && lt < c2.at + 1.8);
  const head = headPos(KX, GY, PS);
  let plan = [[0, ON(MX - 40, GY - 90, 2.4)], [ou.at, ON(720, GY - 150, 1.6)], [L[3].t0 - 0.3, ON(680, GY - 200, 1.3)], [th[0].at, ON(690, 365, 1.0)], [ag.at, ON(760, 330, 0.95)], [L[5].t0 + 4.5, ON(700, GY - 170, 1.5)], [L[6].t0, ON(SX + 60, GY - 180, 1.9)], [th[1].at, ON(690, 365, 1.0)], [L[9].t0 - 0.6, ON(SX + 60, GY - 180, 1.9)], [th[2].at, ON(690, 365, 1.0)], [L[11].t1 + 0.4, ON(690, 400, 1.2)]];
  let c = camFor(lt, plan, 1.0); c = withTight(sh, lt, c, 600, GY - 88, 2.2);
  dipAt(lt, ins.to, 0.25);
  cam(c, () => {
    sandWorld(-400, 1700, GY, 22000, { workshop: 150 });
    ground(-400, 1700, GY);
    shape(R(MX - 130, GY - 4, 260, 12), { lw: 1.6, id: 24000, fill: '#cfc6b0', h: [0.2, 3, 0.6] });
    machine(MX, GY, MS, st);
    slate(SX, GY, 0.8, sT.txt, sT.prog, 21000, { rub });
    // Trurl: going in, coming out, asking, going in again, then sitting at the foot of the machine
    const soot = lt >= ou.at ? 0.8 : 0;
    if (lt < ins.at) { const cr = U(lt, L[0].t0 + 1.6, ins.at); if (cr < 1) trurl2(lerp(MX - 60, MX - 6, cr), GY + 4, PS * (1 - 0.3 * cr), sh, lt, { f: 1, rot: 1.2 * cr, walk: cr > 0 ? 1 : 0, ph: lt * 8, bag: false }); }
    else if (lt < ag.at) { const w = U(lt, ou.at + 0.6, ou.at + 2.4); trurl2(lerp(MX - 20, TSX - 60, w), GY, PS, sh, lt, { f: lt >= L[2].t0 + 3.0 ? 1 : -1, walk: w > 0 && w < 1 ? 1 : 0, ph: lt * 9, soot, lookY: lt >= L[3].t0 - 0.2 ? -0.7 : 0 }); }
    else if (again && U(lt, ag.at, ag.to) < 0.62) { /* inside again */ }
    else trurl2(TSX, GY, PS, sh, lt, { f: -1, seated: true, soot, look: lt >= kl.at ? -1 : 1, lookY: 0.4, tilt: 0.25, ra: [1.2, 2.6], la: [1.3, 2.5] });
    if (kIn) klapF(kWrite ? SX + 100 : kx, GY, PS, sh, lt, { f: lt < kl.to || kWrite ? -1 : 1, walk: lt < kl.to ? 1 : 0, ph: lt * 8, ra: kWrite ? [-2.6 + 0.25 * Math.sin(lt * 11), -2.9 + 0.3 * Math.sin(lt * 13)] : undefined, lookY: lt >= L[7].t0 && !kWrite ? -0.6 : 0, f2: 1 });
  });
};

/* ---------- 3. the expert ---------- */
const kickU = (sh, lt) => cues(sh, 'kick').reduce((m, c) => Math.max(m, pulse(lt, c.at - 0.12, 0.4)), 0);
function kickStar(sh, lt, x, y) { for (const c of cues(sh, 'kick')) { const u = (lt - c.at) / 0.45; if (u >= 0 && u < 1) { X.save(); X.globalAlpha = 1 - u; star(x, y, 14 + 40 * u, 24100, P.ink, 9); X.restore(); } } }
SHOTS.expert = (lt, sd, sh) => {
  const L = sh.lines, k = kickU(sh, lt), KX = 610, TSX = 748;
  const st = mState(sh, lt, { digit: null, shake: 4 * k });
  const head = headPos(KX, GY, PS);
  let c = camFor(lt, [[0, ON(690, GY - 180, 1.45)], [L[7].t0 + 0.4, ON(MX - 30, 330, 0.95)], [L[8].t0 - 0.2, ON(690, GY - 180, 1.45)], [L[9].t0 - 0.1, ON(760, GY - 260, 1.1)]], 1.2);
  c = withTight(sh, lt, c, 600, GY - 88, 2.2);
  if (k > 0.2) c = shakeCam(c, 2 * k, lt);
  cam(c, () => {
    sandWorld(-400, 1700, GY, 22000, { workshop: 150 }); ground(-400, 1700, GY);
    shape(R(MX - 130, GY - 4, 260, 12), { lw: 1.6, id: 24000, fill: '#cfc6b0', h: [0.2, 3, 0.6] });
    machine(MX, GY, MS, st);
    slate(SX, GY, 0.8, '1 + 1 = 2', 1, 21000);
    const standing = lt >= L[8].t0 - 0.2;
    if (!standing) trurl2(TSX, GY, PS, sh, lt, { f: -1, seated: true, soot: 0.8, rot: -0.25 * k, ra: talking(sh, 'T', lt) ? undefined : [1.2, 2.6], la: [1.3, 2.5], lookY: 0.2 });
    else trurl2(TSX - 20, GY, PS, sh, lt, { f: 1, soot: 0.8, rot: 0.25 * k, ra: [0.3, 0.9], la: [2.4, 2.9] });
    kickStar(sh, lt, MX - 112, GY - 16);
    klapF(KX, GY, PS, sh, lt, { f: 1, look: 1, lookY: lt >= L[7].t0 && lt < L[8].t0 ? -1 : 0 });
  });
};

/* ---------- 4. the count, and the machine pulls itself loose ---------- */
function foundationPit(x, y, u, id = 24200) {
  if (u <= 0) return;
  for (let i = 0; i < 9; i++) {
    const a = hash(id, i), side = i % 2 ? 1 : -1, px = x + side * (90 + 120 * a) * Math.min(1, u * 1.5), py = y + 4 - 10 * hash(id + 1, i) - Math.max(0, Math.sin(Math.min(1, u * 1.4) * Math.PI)) * 50 * a;
    X.save(); X.translate(px, py); X.rotate((hash(id + 2, i) - 0.5) * 1.6 * Math.min(1, u * 1.4));
    shape([[-22, -14], [20, -16], [24, 10], [-18, 14]], { lw: 1.6, id: id + 10 + i, fill: '#cfc6b0', h: [0.3, 2.6, 0.6] });
    for (let j = 0; j < 2; j++) ink([[-10 + j * 14, -14], [-14 + j * 18 + 10 * hash(id + 3, i + j), -36 - 10 * hash(id + 4, i)]], 1.6, id + 30 + i * 2 + j, 0.3);
    X.restore();
  }
  shape([[x - 120, y], [x - 100, y + 14], [x + 100, y + 14], [x + 120, y]], { lw: 1.6, id: id + 60, fill: P.ink });
}
SHOTS.count = (lt, sd, sh) => {
  const L = sh.lines, k = kickU(sh, lt), ns = cues(sh, 'n'), dk = cue(sh, 'dark'), lf = cue(sh, 'lift'), tn = cue(sh, 'turn'), rn = cue(sh, 'run');
  let dig = null; for (const c of ns) if (lt >= c.at) dig = c.v; if (lt >= dk.at) dig = null;
  const lift = E.io(U(lt, lf.at, lf.to)), legH = 50 * MS;
  const walkT = Math.max(0, lt - tn.at), mxNow = MX - 80 * Math.max(0, lt - rn.at);
  const st = mState(sh, lt, { digit: dig, shake: 4 * k + (lt >= lf.at && lt < lf.to ? 3 : 0), legs: lift > 0, walk: lt >= tn.at ? 1 : 0, ph: walkT * 2 * Math.PI / 1.3, rot: lt >= lf.at ? 0.035 * Math.sin(lt * 2.4) * lift : 0 });
  if (ns.some((c) => lt >= c.at && lt < c.at + 0.18)) st.lit = 1.4;
  const run = U(lt, rn.at, sd), tX = lerp(720, 120, run), kX = lerp(610, 20, run);
  let c = camFor(lt, [[0, ON(700, GY - 200, 1.15)], [L[2].t0, ON(650, GY - 190, 1.2)], [lf.at, ON(720, 330, 0.85)], [rn.at, ON(560, 340, 0.85)]], 1.0);
  c = withTight(sh, lt, c, 820, 398, 1.25);
  if (k > 0.2) c = shakeCam(c, 2 * k, lt);
  if (lt >= lf.at && lt < lf.to + 0.5) c = shakeCam(c, 3, lt);
  cam(c, () => {
    sandWorld(-500, 1800, GY, 22000, { workshop: 150 }); ground(-500, 1800, GY);
    if (lift <= 0) shape(R(MX - 130, GY - 4, 260, 12), { lw: 1.6, id: 24000, fill: '#cfc6b0', h: [0.2, 3, 0.6] });
    foundationPit(MX, GY, lift);
    machine(mxNow, GY - legH * lift, MS, st);
    slate(SX, GY, 0.8, '1 + 1 = 2', 1, 21000);
    if (run <= 0) trurl2(720, GY, PS, sh, lt, { f: 1, soot: 0.8, rot: 0.3 * k, ra: k > 0.1 ? [0.3, 0.9] : undefined, la: [2.4, 2.9] });
    else trurl2(tX, GY, PS, sh, lt, { f: -1, soot: 0.8, walk: 1, ph: lt * 15, rot: -0.12 });
    kickStar(sh, lt, MX - 112, GY - 16);
    klapF(run > 0 ? kX : 610, GY, PS, sh, lt, { f: run > 0 ? -1 : 1, walk: run > 0 ? 1 : 0, ph: lt * 15 + 1, rot: run > 0 ? -0.12 : 0, ra: lt >= rn.at - 0.4 && run <= 0 ? [0.1, 0.0] : undefined });
  });
};

/* ---------- 5. the chase ---------- */
SHOTS.chase = (lt, sd, sh) => {
  const L = sh.lines, hd = cue(sh, 'hard'), wl = cue(sh, 'wild');
  const rx = 400 - 175 * lt;
  const sand = lt < hd.at, gap = sand ? 780 : lerp(780, 520, U(lt, hd.at, hd.at + 6));
  const mxw = rx + gap, per = sand ? 1.6 : 0.85;
  const tStep = sand ? lt : lt - hd.at, u = (tStep / per) % 1;
  const depth = 2 * FHt * MS, legH = 50 * MS;
  const sink = sand ? depth * (u < 0.35 ? E.out(u / 0.35) : 1 - E.io((u - 0.35) / 0.65)) : 0;
  const st = { digit: null, legs: true, walk: 1, ph: tStep / per * 2 * Math.PI, rot: 0.04 * Math.sin(lt * 1.9), steam: sand ? 0 : 1, glow: sand ? 0 : 0.4 };
  const kx = rx + 40, tx = rx - 30, khead = headPos(kx, GY, PS);
  const mtn = U(lt, wl.at - 1, sd);
  let c = camFor(lt, [[0, ON(rx + 330, GY - 270, 0.82)]], 1);
  c = { z: 0.82, x: rx + 330 - CX, y: GY - 270 - CY };
  if (lt >= L[1].t0 - 0.3 && lt < L[2].t1 + 0.3) c = camMix(c, ON(rx + 60, GY - 150, 1.7), seg(lt, L[1].t0 - 0.3, L[1].t0 + 0.4) * (1 - seg(lt, L[2].t1, L[2].t1 + 0.6)));
  if (lt >= L[4].t0 - 0.3 && lt < L[4].t1 + 0.6) c = camMix(c, ON(rx + 60, GY - 150, 1.7), seg(lt, L[4].t0 - 0.3, L[4].t0 + 0.4) * (1 - seg(lt, L[4].t1, L[4].t1 + 0.6)));
  c = withTight(sh, lt, c, khead[0], khead[1], 3.0);
  cam(c, () => {
    const x0 = c.x + CX - 1100, x1 = c.x + CX + 1100;
    sandWorld(x0, x1, GY, 22000, { mountains: mtn, mist: mtn });
    machine(mxw, GY + sink - legH, MS, st);
    ground(x0, x1, GY, 22100, { hard: !sand });
    if (sand) for (let i = 0; i < 10; i++) { const q = (u * 3 + i / 10) % 1; X.save(); X.globalAlpha = (1 - q) * 0.8 * (u < 0.4 ? 1 : 0.3); X.fillStyle = P.ink; X.fillRect(mxw - 110 + hash(9, i) * 220, GY - q * 30 - 4, 2.4, 2.4); X.restore(); }
    trurl2(tx, GY, PS, sh, lt, { f: -1, soot: 0.8, walk: 1, ph: lt * 15, rot: -0.12, look: talking(sh, 'T', lt) ? -1 : 1 });
    klapF(kx, GY, PS, sh, lt, { f: -1, walk: 1, ph: lt * 15 + 1.3, rot: -0.12 });
    footDust(tx, GY, lt, 1); footDust(kx, GY, lt + 0.3, 2);
  });
};

/* ---------- 6. the town, and the cellar ---------- */
const HOUSES = [[-150, 180, 230], [60, 170, 280], [270, 190, 210], [480, 170, 300], [690, 190, 240], [900, 175, 270], [1110, 190, 220], [1320, 170, 290], [1530, 190, 240], [1740, 180, 260]];
const HALLX = -560;
function townHall(x, y, id = 25000) {
  shape(R(x - 200, y - 260, 400, 260), { lw: 2.2, id, fill: WHITE, h: [Math.PI / 2, 4, 0.4], sh: R(x + 60, y - 260, 140, 260), sh2: [Math.PI / 2, 2.4, 0.7] });
  shape([[x - 220, y - 260], [x, y - 330], [x + 220, y - 260]], { lw: 2, id: id + 1, fill: P.paper, h: [0.4, 3, 0.6] });
  shape(R(x - 50, y - 520, 100, 260), { lw: 2, id: id + 2, fill: WHITE, h: [Math.PI / 2, 3.2, 0.5] });
  shape([[x - 62, y - 520], [x, y - 600], [x + 62, y - 520]], { lw: 2, id: id + 3, fill: P.ink });
  ball(x, y - 470, 26, id + 4, PAT.f, 2); line([x, y - 470], [x, y - 486], 2, id + 5, 0.1); line([x, y - 470], [x + 12, y - 470], 2, id + 6, 0.1);
  for (const cx_ of [-150, -90, 90, 150]) column(x + cx_, y - 220, y - 10, 22, id + 10 + cx_);
  door(x, y, 70, 120, id + 30);
}
function collapsing(hx, w, h, id, u, age) {
  if (u <= 0) { house(hx, GY, w, h, id); return; }
  const k = Math.min(1, u);
  X.save(); X.beginPath(); X.rect(hx - w, GY - 900, w * 2, 900); X.clip();
  X.translate(hx, GY); X.rotate(0.25 * k * (hash(id, 3) > 0.5 ? 1 : -1)); X.translate(-hx, -GY + h * 0.9 * E.in(k));
  if (k < 0.98) house(hx, GY, w, h, id);
  X.restore();
  const rp = []; for (let i = 0; i <= 10; i++) { const a = i / 10; rp.push([hx - w * 0.75 + a * w * 1.5, GY - Math.sin(a * Math.PI) * h * 0.35 * k - (hash(id, i) * 14 * k)]); }
  shape([...rp, [hx + w * 0.75, GY + 4], [hx - w * 0.75, GY + 4]], { lw: 1.6, id: id + 90, fill: '#ddd5c2', h: [0.5, 3, 0.5] });
  for (let i = 0; i < 7; i++) { X.save(); X.translate(hx - w * 0.5 + hash(id + 2, i) * w, GY - 8 - hash(id + 3, i) * h * 0.25 * k); X.rotate(hash(id + 4, i) * 3); shape(R(-10, -6, 20, 12), { lw: 1, id: id + 100 + i, fill: '#cfc6b0', h: [0.3, 2.4, 0.5] }); X.restore(); }
  dustCloud(hx, GY - h * 0.4, age, id + 200, 1.3);
}
SHOTS.town = (lt, sd, sh) => {
  const L = sh.lines, cr = cue(sh, 'crash'), pl = cue(sh, 'plow'), hl = cue(sh, 'hall'), ce = cue(sh, 'cellar'), tr = cue(sh, 'tremble'), lv = cue(sh, 'leave');
  if (lt < ce.at) {
    const rx = lerp(1000, HALLX + 40, U(lt, 0, hl.to - 0.6));
    const mxw = lt < cr.at ? 2100 : Math.max(560, 1950 - 95 * (lt - cr.at));
    const front = mxw - 115 * MS;
    const tc = (hx, w) => cr.at + (1950 - 115 * MS - (hx + w / 2)) / 95;
    let c = { z: 1.15, x: rx + 160 - CX, y: GY - 210 - CY };
    if (lt >= cr.at - 0.2) c = camMix(c, ON(1200, 330, 0.75), seg(lt, cr.at - 0.2, cr.at + 0.8));
    if (lt >= pl.at + 1) c = camMix(c, ON(lerp(1200, 520, U(lt, pl.at + 1, hl.at)), 330, 0.72), seg(lt, pl.at + 1, pl.at + 2.5));
    if (lt >= hl.at - 0.5) c = camMix(c, ON(HALLX + 120, 360, 0.95), seg(lt, hl.at - 0.5, hl.at + 0.6));
    if (lt >= cr.at && lt < cr.at + 1.2) c = shakeCam(c, 4, lt);
    cam(c, () => {
      X.fillStyle = P.paper; X.fillRect(-1600, -800, 4400, 2400);
      X.save(); X.globalAlpha = 0.4; for (let y = -700; y < GY - 100; y += 4) { X.fillStyle = P.ink; X.fillRect(-1600, y, 4400, 0.5 + 0.7 * clamp((y + 700) / 1300)); } X.restore();
      townHall(HALLX, GY);
      for (const [i, [hx, w, h]] of HOUSES.entries()) { const t_ = tc(hx, w); collapsing(hx, w, h, 25100 + i * 300, U(lt, t_, t_ + 1.3), lt - t_); }
      if (lt >= cr.at) machine(mxw, GY - 50 * MS, MS, { digit: null, legs: true, walk: 1, ph: (lt - cr.at) * 2 * Math.PI / 1.0, rot: 0.03 * Math.sin(lt * 2), plaster: clamp((lt - cr.at) / 6), steam: 0.6 });
      ground(-1600, 2800, GY, 22100, { hard: true });
      // people leave the houses ahead of it and run the other way
      for (const [i, [hx, w]] of HOUSES.entries()) { const t_ = tc(hx, w) - 3.0; for (let j = 0; j < 3; j++) { const age = lt - t_ - j * 0.5; if (age < 0 || age > 14) continue; const px = hx + 20 - age * (150 + 20 * j); if (px < HALLX - 300) continue; citizen(px, GY + 6 + j * 4, 1.25, 26000 + i * 10 + j, { f: -1, walk: 1, ph: lt * 12 + j, wave: 1 }); } }
      for (let j = 0; j < 2; j++) { const age = lt - 0.5 - j; if (age > 0) citizen(300 - age * 160 - j * 60, GY + 6, 1.25, 26200 + j, { f: -1, walk: 1, ph: lt * 12 + j }); }
      if (lt < hl.to) { trurl2(rx - 30, GY, PS, sh, lt, { f: -1, soot: 0.8, walk: 1, ph: lt * 15, rot: -0.1, look: lt >= L[1].t0 && lt < L[1].t1 ? -1 : 1 }); klapF(rx + 40, GY, PS, sh, lt, { f: -1, walk: 1, ph: lt * 15 + 1.3, rot: -0.1 }); }
    });
    dipAt(lt, ce.at, 0.3); return;
  }
  // the cellar
  const MYX = 840, TX = 520, KX = 400;
  const tremble = lt >= tr.at && lt < tr.to ? 1 : 0;
  const myIn = U(lt, ce.at + 0.6, ce.at + 3.2), myx = lerp(1400, MYX, E.io(myIn));
  const leave = U(lt, lv.at, sd);
  const head = headPos(MYX, 620, 0.55);
  let c = camFor(lt, [[ce.at, ON(640, 400, 1.05)], [L[5].t0, ON(640, 330, 1.0)], [L[6].t0, ON(700, 420, 1.35)], [L[7].t0, ON(560, 430, 1.4)], [L[9].t0, ON(700, 420, 1.3)], [lv.at, ON(560, 420, 1.1)]], 1.0);
  c = withTight(sh, lt, c, head[0], head[1], 2.4);
  if (tremble) c = shakeCam(c, 3.5, lt);
  cam(c, () => {
    wallRoomStone(lt);
    for (let i = 0; i < 6; i++) { const sx = 40 + i * 50, sy = 160 + i * 60; shape(R(sx, sy, 60, 900), { lw: 1.6, id: 25600 + i, fill: '#ddd5c2', h: [Math.PI / 2, 3.4, 0.5] }); }
    shape(R(420, 40, 640, 26), { lw: 2, id: 25620, fill: '#5a5048' });
    if (lt >= tr.at) { for (let i = 0; i < 5; i++) ink([[500 + i * 110, 66], [520 + i * 110 + 20 * hash(i, 1), 120 + 40 * hash(i, 2)], [500 + i * 110 + 30 * hash(i, 3), 160 + 50 * hash(i, 4)]], 1.4, 25630 + i, 0.4, P.paper); }
    if (lt >= tr.at) for (let i = 0; i < 40; i++) { const t_ = tr.at + hash(i, 5) * 4, a_ = lt - t_; if (a_ < 0 || a_ > 1.4) continue; X.fillStyle = '#f6f2e8'; X.fillRect(480 + hash(i, 6) * 600, 66 + a_ * a_ * 300, 2.4, 2.4); }
    // lamp
    line([700, 66], [700, 150], 1.6, 25650, 0.2); shape([[684, 150], [716, 150], [722, 176], [678, 176]], { lw: 1.4, id: 25651, fill: LIT });
    const kLeave = U(lt, lv.at + 1.0, sd);
    if (leave < 1) trurl2(lerp(TX, 160, E.io(leave)), 600, 0.55, sh, lt, { f: leave > 0 ? -1 : 1, soot: 0.8, walk: leave > 0 && leave < 1 ? 1 : 0, ph: lt * 9, look: 1, lookY: lt >= L[6].t0 && lt < lv.at ? -0.2 : 0 });
    klapF(lerp(KX, 200, E.io(kLeave)), 600, 0.55, sh, lt, { f: lt >= L[10].t0 ? -1 : 1, walk: kLeave > 0 && kLeave < 1 ? 1 : 0, ph: lt * 9 });
    if (lt >= ce.at + 0.6) {
      for (const [i, ax] of [990, 1080, 1160].entries()) { const ain = U(lt, ce.at + 1.2 + i * 0.4, ce.at + 3.8 + i * 0.4); alderman(lerp(1400, ax, E.io(ain)), 598, 1.9, 25700 + i * 60, { f: -1, walk: ain > 0 && ain < 1 ? 1 : 0, ph: lt * 9 + i }); }
      mayorF(myx, 600, 0.55, sh, lt, { f: -1, walk: myIn > 0 && myIn < 1 ? 1 : 0, ph: lt * 9 });
    }
  });
};

/* ---------- 7. the cave ---------- */
const OPX = 860, OPY = 330, ORX = 200, ORY = 170, CS = 0.42;
function openingPts(id = 27000) { return blobPts(OPX, OPY, ORX, ORY, id, 36, 0.08); }
/* outside, seen through the cave mouth: sky, far mountains, and the machine at scale ms (or none) */
function outsideView(ms, mx, my, st, o = {}) {
  X.fillStyle = P.paper; X.fillRect(OPX - 300, OPY - 260, 600, 520);
  X.save(); X.globalAlpha = 0.5; for (let y = OPY - 260; y < OPY + 100; y += 4) { X.fillStyle = P.ink; X.fillRect(OPX - 300, y, 600, 0.5 + 0.6 * clamp((y - OPY + 260) / 360)); } X.restore();
  const m = [[OPX - 320, OPY + 260]]; for (let i = 0; i <= 12; i++) m.push([OPX - 320 + i * 54, OPY + 40 - 70 * Math.abs(Math.sin(i * 1.7)) - 30 * hash(27100, i)]); m.push([OPX + 340, OPY + 260]);
  shape(m, { lw: 1.4, id: 27101, fill: '#e2dac6', h: [0.7, 3.4, 0.5] });
  if (ms > 0) machine(mx, my, ms, st, 20000);
  if (o.boulder != null) { const by = o.boulder; shape(rock(OPX - 20, by, 150, 27200, 26), { lw: 2.4, id: 27200, fill: '#d6ccb4', h: [[0.6, 3.4, 0.6], [-0.4, 6, 0.4]] }); }
}
function caveRoom(lt, o = {}) {
  X.fillStyle = '#c9bfa6'; X.fillRect(-500, -400, 2300, 1600);
  X.save(); X.globalAlpha = 0.85; for (let y = -400; y < 1200; y += 3) { X.fillStyle = P.ink; X.fillRect(-500, y, 2300, 0.9 + 0.5 * hash(y | 0, 8)); } X.restore();
  for (let i = 0; i < 14; i++) { const p = rock(-100 + (i % 7) * 230 + (i > 6 ? 110 : 0), i > 6 ? GY + 40 : -40, 120 + 40 * hash(27300, i), 27300 + i, 16); shape(p, { lw: 1.4, id: 27300 + i, fill: '#8f8571', h: [0.8 + hash(27310, i), 2.6, 0.7] }); }
  shape([[-500, GY], [1800, GY], [1800, 1200], [-500, 1200]], { lw: 2, id: 27320, fill: '#b5aa90', h: [0.1, 4, 0.6] });
  const op = openingPts();
  X.save(); path(op); X.clip(); o.outside(); X.restore();
  shape(op, { fill: null, lw: 3, id: 27330, amp: 1 });
  if (o.plate > 0) {
    // the machine's steel wall closing over the mouth: rows of rivets
    const off = (1 - o.plate) * (ORX * 2 + 60) * (o.from || -1);
    X.save(); path(op); X.clip();
    shape(R(OPX - ORX - 20 + off, OPY - ORY - 20, ORX * 2 + 40, ORY * 2 + 40), { lw: 2.4, id: 27340, fill: STEEL, h: [[Math.PI / 2, 5, 0.5], [0.05, 9, 0.4]] });
    for (let r = 0; r < 7; r++) for (let c = 0; c < 9; c++) ball(OPX - ORX + 10 + c * 46 + off, OPY - ORY + 14 + r * 50, 4.2, 27400 + r * 9 + c, PAT.d, 1, '#c8cacb');
    for (let r = 0; r < 4; r++) line([OPX - ORX - 20 + off, OPY - ORY + 40 + r * 100], [OPX + ORX + 20 + off, OPY - ORY + 40 + r * 100], 1.6, 27460 + r, 0.3);
    X.restore();
  }
}
/* darkness: everything under a near-black veil; a seam of light round the lid, a warm patch where the steel is touched */
function veil(a, o = {}) {
  if (a <= 0) return;
  X.save(); X.setTransform(1, 0, 0, 1, 0, 0); X.globalAlpha = a; X.fillStyle = NIGHT; X.fillRect(0, 0, W, H); X.restore();
}
function seam(c, a, warm = 0) {
  if (a <= 0) return;
  cam(c, () => {
    const op = openingPts(); X.save(); X.globalAlpha = a * (0.55 + 0.25 * warm); X.lineWidth = 2.2; X.strokeStyle = LIT; path(op); X.stroke(); X.globalAlpha = a * 0.2; X.lineWidth = 7; X.stroke(); X.restore();
    X.save(); X.globalAlpha = a * (0.12 + 0.25 * warm); for (let r = 0; r < 7; r++) for (let cc = 0; cc < 9; cc++) { const rx_ = OPX - ORX + 10 + cc * 46, ry_ = OPY - ORY + 14 + r * 50; if (Math.hypot((rx_ - OPX) / ORX, (ry_ - OPY) / ORY) < 0.95) { X.fillStyle = '#e8d3a0'; X.fillRect(rx_ - 1.5, ry_ - 1.5, 3, 3); } } X.restore();
  });
}
function glowAt(c, x, y, r, a) { if (a <= 0) return; cam(c, () => { X.save(); const g = X.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, `rgba(242,193,78,${0.55 * a})`); g.addColorStop(1, 'rgba(242,193,78,0)'); X.fillStyle = g; X.fillRect(x - r, y - r, 2 * r, 2 * r); X.restore(); }); }
/* the faint shapes of the two constructors in the dark: spectacles and the rims of their heads catch a little light */
function glints(c, pts, a) { if (a <= 0) return; cam(c, () => { X.save(); X.globalAlpha = a; for (const [x, y, s] of pts) { X.strokeStyle = '#d9c99c'; X.lineWidth = 1.2; X.strokeRect(x - 18 * s, y - 15 * s, 15 * s, 10 * s); X.strokeRect(x + 4 * s, y - 15 * s, 15 * s, 10 * s); X.beginPath(); X.moveTo(x - 24 * s, y - 40 * s); X.lineTo(x + 24 * s, y - 40 * s); X.stroke(); } X.restore(); }); }
SHOTS.cave = (lt, sd, sh) => {
  const L = sh.lines, cl = cue(sh, 'climb'), ins = cue(sh, 'inside'), lk = cue(sh, 'look'), shd = cue(sh, 'shadow'), se = cue(sh, 'seal'), fe = cue(sh, 'feel'), gr = cue(sh, 'grope');
  if (lt < cl.at) {
    const u = U(lt, 0.3, cl.at);
    cam(ON(640, 330, 0.88), () => {
      X.fillStyle = P.paper; X.fillRect(-500, -500, 2300, 1600); X.save(); X.globalAlpha = 0.4; for (let y = -400; y < GY - 100; y += 4) { X.fillStyle = P.ink; X.fillRect(-500, y, 2300, 0.6); } X.restore();
      X.save(); X.translate(380, GY); X.scale(0.8, 0.8); X.translate(-380, -GY); townHall(380, GY); X.restore();
      for (let i = 0; i < 5; i++) { const hx = 1000 + i * 160; shape([[hx - 90, GY], [hx - 40, GY - 60 - 30 * hash(i, 9)], [hx + 30, GY - 80 - 20 * hash(i, 8)], [hx + 90, GY]], { lw: 1.6, id: 27500 + i, fill: '#ddd5c2', h: [0.5, 3, 0.5] }); line([hx - 30, GY - 40], [hx - 26, GY - 190 - 40 * hash(i, 7)], 4, 27510 + i, 0.4); }
      machine(820, GY - 50 * MS, MS, { digit: null, legs: true, steam: 1, plaster: 1, rot: 0.01 * Math.sin(lt) });
      for (let i = 0; i < 4; i++) dustCloud(700 + i * 180, GY - 40, 2 + ((lt + i) % 5), 27520 + i * 30, 1);
      ground(-500, 1800, GY, 22100, { hard: true });
      trurl2(lerp(560, -120, u), GY + 10, 0.22, null, lt, { f: -1, walk: 1, ph: lt * 14, soot: 0.8 }); klapF(lerp(620, -60, u), GY + 10, 0.22, null, lt, { f: -1, walk: 1, ph: lt * 14 + 1 });
    });
    dipAt(lt, cl.at, 0.3); return;
  }
  if (lt < ins.at) {
    const u = U(lt, cl.at, ins.at), c = camMix(ON(700, 380, 0.9), ON(860, 250, 1.3), u);
    const path_ = [[100, GY], [330, GY - 60], [480, GY - 150], [560, GY - 260], [700, GY - 330], [800, GY - 400], [880, 260]];
    const at = (p) => { const f = p * (path_.length - 1), i = Math.min(path_.length - 2, Math.floor(f)), v = f - i; return [lerp(path_[i][0], path_[i + 1][0], v), lerp(path_[i][1], path_[i + 1][1], v)]; };
    cam(c, () => {
      X.fillStyle = P.paper; X.fillRect(-500, -500, 2300, 1600); X.save(); X.globalAlpha = 0.45; for (let y = -400; y < GY; y += 4) { X.fillStyle = P.ink; X.fillRect(-500, y, 2300, 0.6); } X.restore();
      machine(150, GY - 20, 0.32, { digit: null, legs: true, walk: 1, ph: lt * 6, steam: 0.8 }, 20500);
      shape([[420, GY + 10], [480, 400], [560, 120], [700, -40], [1400, -60], [1400, GY + 10]], { lw: 2.4, id: 27600, fill: '#d6ccb4', h: [[0.9, 3.2, 0.6], [-0.3, 7, 0.4]] });
      shape(blobPts(880, 230, 70, 54, 27610, 24, 0.1), { lw: 2.4, id: 27610, fill: P.ink });
      ink(path_, 8, 27620, 1, '#efe7d2'); for (let i = 0; i < 40; i++) { const q = at(hash(27630, i)); ball(q[0] + (hash(27631, i) - 0.5) * 20, q[1] + 4, 3 + 3 * hash(27632, i), 27640 + i, PAT.f, 0.8); }
      ground(-500, 440, GY, 22100, { hard: true });
      const pT = Math.min(1, u * 1.05), pK = Math.min(1, u * 1.05 - 0.06), a = at(pT), b = at(Math.max(0, pK));
      trurl2(a[0], a[1], 0.2, null, lt, { f: 1, walk: 1, ph: lt * 12, rot: -0.3, soot: 0.8 }); klapF(b[0], b[1], 0.2, null, lt, { f: 1, walk: 1, ph: lt * 12 + 1, rot: -0.3 });
      for (let i = 0; i < 6; i++) { const q = (lt * 1.3 + i / 6) % 1; ball(a[0] - 20 + i * 6, a[1] + q * 160, 2.5, 27700 + i, PAT.d, 0.8); }
    });
    dipAt(lt, ins.at, 0.3); return;
  }
  // inside the cave
  const sealU = U(lt, se.at, se.to), dark = seg(lt, se.to - 0.4, se.to + 0.6);
  const app = U(lt, lk.at + 0.6, se.at);
  const st = { digit: null, legs: true, walk: 1, ph: lt * 5, glow: 0.3 };
  const tX = lt < L[2].t0 ? 620 : lt < lk.at ? lerp(620, 740, U(lt, L[2].t0, lk.at)) : lt < L[3].t0 + 0.3 ? 740 : lerp(740, 600, U(lt, L[3].t0 + 0.3, L[3].t0 + 1.0));
  const seated = lt >= L[5].t1 + 0.5 && !(lt >= fe.at - 1.2 && lt < fe.to + 1.0);
  const tFeel = lt >= fe.at - 1.2 && lt < fe.to + 1.0, tx2 = tFeel ? lerp(560, 650, U(lt, fe.at - 1.2, fe.at)) : 560;
  const kGrope = lt >= gr.at, kx = kGrope ? lerp(420, 455, U(lt, gr.at, gr.at + 1.6)) : 420;
  const th = headPos(seated ? tx2 : (lt >= se.to ? tx2 : tX), GY, CS);
  let c = camFor(lt, [[ins.at, ON(700, 380, 1.0)], [lk.at, ON(780, 360, 1.15)], [shd.at, ON(760, 360, 1.0)], [se.to + 0.5, ON(620, 420, 1.15)], [fe.at - 1.2, ON(640, 430, 1.4)], [L[8].t0, ON(620, 420, 1.15)]], 1.2);
  c = withTight(sh, lt, c, th[0], th[1], 3.0);
  if (lt >= se.to - 0.3 && lt < se.to + 0.6) c = shakeCam(c, 4, lt);
  cam(c, () => {
    caveRoom(lt, { plate: sealU, from: -1, outside: () => outsideView(lt >= lk.at ? lerp(0.2, 1.6, E.in(app)) : 0, lerp(980, 900, app), lerp(700, 1050, E.in(app)), st) });
    if (lt < se.to + 0.5) { const t_ = lt >= se.to ? tx2 : tX; trurl2(t_, GY, CS, sh, lt, { f: 1, soot: 0.8, rot: lt >= lk.at && lt < L[3].t0 ? 0.25 : 0, walk: lt >= L[2].t0 && lt < lk.at || (lt >= L[3].t0 + 0.3 && lt < L[3].t0 + 1.0) ? 1 : 0, ph: lt * 9 }); }
    else trurl2(tx2, GY, CS, sh, lt, { f: 1, seated, soot: 0.8, ra: tFeel ? [-0.3, -0.5] : seated ? [1.2, 2.6] : undefined, la: seated ? [1.3, 2.5] : undefined, walk: tFeel && lt < fe.at ? 1 : 0, ph: lt * 6 });
    klapF(kx, GY, CS, sh, lt, { f: 1, seated: lt >= se.to + 1.0 && !kGrope, ra: kGrope ? [-0.2, -0.4] : undefined, walk: kGrope && lt < gr.at + 1.6 ? 1 : 0, ph: lt * 6 });
  });
  veil(0.8 * dark);
  const mE = sayAt(sh, 'M', lt);
  seam(c, dark, mE);
  if (tFeel && lt >= fe.at) glowAt(c, 682, GY - 150, 70, dark * (0.6 + 0.4 * U(lt, fe.at, fe.at + 1)));
  if (dark > 0) glints(c, [[th[0], th[1], CS], ...(lt >= se.to ? [[headPos(kx, GY, CS)[0], headPos(kx, GY, CS)[1] + (lt >= se.to + 1.0 && !kGrope ? 0 : 0), CS]] : [])], dark * 0.55);
};

/* ---------- 8. four ---------- */
function ramTimes(rm) { const t = []; let tm = rm.at, k = 0; while (tm < rm.to - 0.4) { t.push(tm); tm += 1.25 - 0.04 * Math.min(k, 6); k++; } return t; }
SHOTS.four = (lt, sd, sh) => {
  const L = sh.lines, rg = cue(sh, 'rage'), chk = cue(sh, 'chalk'), pu = cue(sh, 'pull'), rm = cue(sh, 'ram'), br = cue(sh, 'break');
  const open = E.io(U(lt, pu.at, pu.to)), dark = 1 - open;
  const hits = ramTimes(rm); let last = -1e9, next = 1e9; for (const h of hits) { if (h <= lt) last = h; else { next = Math.min(next, h); } }
  const since = lt - last, broken = lt >= br.at;
  // between blows the machine backs off and comes again; at a blow it fills the mouth
  let ms = 0.62, my = 1020;
  if (lt >= rm.at - 0.6 && !broken) { const toN = next - lt, k = since < 0.5 ? 1 - since / 0.5 : 0, a = toN < 0.5 ? 1 - toN / 0.5 : 0; const f = Math.max(E.in(a), k); ms = lerp(0.62, 1.7, f); my = lerp(1020, 1250, f); }
  if (broken) { ms = lerp(1.2, 0.5, E.out(U(lt, br.at, br.at + 0.7))); my = lerp(1150, 1500, E.in(U(lt, br.at, br.at + 0.9))); }
  const blow = since < 0.6 ? 1 - since / 0.6 : 0;
  const st = { digit: '7', legs: true, walk: 0, glow: 0.5, lit: 0.85 + 0.15 * sayAt(sh, 'M', lt), flick: lt >= rm.at && !broken ? 0.25 * blow : 0 };
  const writing = lt >= chk.at - 0.2 && lt < chk.to + 0.2, standing = lt >= rg.at;
  const TX = writing ? 520 : standing ? 600 : 560, th = headPos(TX, GY, CS);
  const haze = broken ? 0.7 * (1 - U(lt, br.at + 1.0, br.at + 5.0)) : lt >= rm.at ? Math.min(0.4, (lt - rm.at) * 0.04) : 0;
  let c = camFor(lt, [[0, ON(620, 420, 1.15)], [rg.at, ON(560, 400, 1.3)], [pu.at, ON(700, 370, 1.0)], [rm.at, ON(680, 370, 0.95)], [br.at + 1.5, ON(700, 360, 1.0)]], 1.0);
  c = withTight(sh, lt, c, th[0], th[1], 3.0);
  if (blow > 0) c = shakeCam(c, 9 * blow, lt);
  if (broken && lt < br.at + 2.5) c = shakeCam(c, 12 * (1 - U(lt, br.at, br.at + 2.5)), lt);
  cam(c, () => {
    caveRoom(lt, { plate: 1 - open, from: 1, outside: () => outsideView(open > 0 ? ms : 0, 900, my, st, { boulder: broken ? lerp(-200, OPY + 120, E.in(U(lt, br.at - 0.1, br.at + 0.5))) : null }) });
    if (lt >= rm.at) for (let i = 0; i < 18; i++) { const t0 = rm.at + hash(28000, i) * (lt - rm.at + 1), a_ = (lt - t0) % 1.6; if (a_ < 0) continue; ball(300 + hash(28001, i) * 700, 40 + a_ * a_ * 260, 3 + 5 * hash(28002, i), 28010 + i, PAT.m, 1); }
    if (blow > 0) { X.save(); X.globalAlpha = blow; star(OPX - 60, OPY + 40, 40 + 80 * (1 - blow), 28100, P.ink, 12); for (let i = 0; i < 8; i++) star(OPX - ORX + hash(28101 + i, Math.floor(last * 10)) * ORX * 2, OPY + ORY * (hash(28111 + i, Math.floor(last * 10)) - 0.5) * 1.6, 8, 28120 + i, LIT, 6); X.restore(); }
    trurl2(TX, GY, CS, sh, lt, { f: writing ? -1 : 1, soot: 0.8, seated: !standing, ra: writing ? [-2.6 + 0.25 * Math.sin(lt * 11), -2.9 + 0.3 * Math.sin(lt * 13)] : standing && lt >= L[4].t0 ? [-1.2 - 0.3 * sayAt(sh, 'T', lt), -1.6] : !standing ? [1.2, 2.6] : undefined, la: !standing ? [1.3, 2.5] : undefined, chalkHand: writing });
    const crouch = lt >= rm.at;
    klapF(420, GY, CS, sh, lt, { f: 1, seated: crouch || lt < L[5].t0 - 0.3, ra: crouch ? [-1.9, -0.6] : undefined, la: crouch ? [-1.5, -0.2] : undefined, tilt: crouch ? 0.3 : 0 });
    const ch = U(lt, chk.at, chk.to);
    if (ch > 0) chalkText('2 + 2 = 4', 330, 250, 64, ch, 28200);
    if (haze > 0) { X.save(); X.globalAlpha = haze; X.fillStyle = '#e9e3d4'; X.fillRect(-500, -400, 2300, 1600); X.restore(); if (lt >= chk.at) chalkText('2 + 2 = 4', 330, 250, 64, 1, 28200, '#efebe0', haze * 0.9); }
  });
  veil(0.8 * dark);
  seam(c, dark * (1 - U(lt, pu.at, pu.at + 0.3)), sayAt(sh, 'M', lt));
  if (dark > 0 && lt >= chk.at) cam(c, () => chalkText('2 + 2 = 4', 330, 250, 64, U(lt, chk.at, chk.to), 28200, '#efebe0', dark * 0.85));
  if (dark > 0) glints(c, [[th[0], th[1], CS], [headPos(420, GY, CS)[0], headPos(420, GY, CS)[1] + (lt < L[5].t0 - 0.3 ? 0 : 0), CS]], dark * 0.55);
};

/* ---------- 9. the wreck ---------- */
const WBX = 1170, WBY = GY - 112, WS = 0.95, BRK = -30 - 4 * FHt;
function wreckHalf(lower, st, rotExtra, dx, dy) {
  X.save(); X.translate(WBX + dx, WBY + dy); X.rotate(-Math.PI / 2 + 0.06 + rotExtra); X.scale(WS, WS);
  X.beginPath(); if (lower) X.rect(-200, BRK, 400, 400); else X.rect(-200, -800, 400, 800 + BRK - 2); X.clip();
  X.scale(1 / WS, 1 / WS); X.rotate(-(-Math.PI / 2 + 0.06 + rotExtra)); X.translate(-(WBX + dx), -(WBY + dy));
  machine(WBX + dx, WBY + dy, WS, Object.assign({ rot: -Math.PI / 2 + 0.06 + rotExtra }, st), 20000);
  X.restore();
}
SHOTS.wreck = (lt, sd, sh) => {
  const L = sh.lines, dn = cue(sh, 'down'), sn = cue(sh, 'snap'), wk_ = cue(sh, 'walk');
  const faint = lt >= L[3].t0 - 0.1 && lt < sn.at ? 0.5 * (0.6 + 0.4 * sayAt(sh, 'M', lt)) : 0;
  const st = { digit: faint > 0 ? '7' : null, lit: faint, flick: faint > 0 ? 0.35 : 0, plaster: 1 };
  const brkW = [WBX + BRK * WS * Math.cos(0.06) * 1, WBY];
  const pathD = [[230, 190], [300, 330], [380, 470], [470, GY]], atD = (p) => { const f = clamp(p) * 3, i = Math.min(2, Math.floor(f)), v = f - i; return [lerp(pathD[i][0], pathD[i + 1][0], v), lerp(pathD[i][1], pathD[i + 1][1], v)]; };
  const pd = U(lt, dn.at, dn.to), walk = U(lt, wk_.at, sd);
  let tP = lt < dn.at ? [230, 190] : lt < dn.to ? atD(pd) : [lerp(560, -160, walk), GY], kP = lt < dn.at ? [262, 190] : lt < dn.to ? atD(pd - 0.08) : [lerp(480, -240, walk), GY];
  if (lt >= dn.to && lt < wk_.at) { tP = [lerp(470, 560, U(lt, dn.to, dn.to + 1.5)), GY]; kP = [lerp(420, 480, U(lt, dn.to, dn.to + 1.5)), GY]; }
  const fh = [WBX - 548 * WS, WBY + 10];
  let c = camFor(lt, [[0, ON(640, 360, 1.0)], [L[2].t0 - 0.4, ON(620, GY - 170, 1.4)], [L[4].t0 + 0.5, ON(640, 380, 1.0)], [wk_.at + 1, ON(600, 360, 0.9)]], 1.4);
  c = withTight(sh, lt, c, fh[0] + 60, fh[1] + 20, 2.3);
  cam(c, () => {
    X.fillStyle = P.paper; X.fillRect(-500, -500, 2300, 1600); X.save(); X.globalAlpha = 0.42; for (let y = -400; y < GY - 100; y += 4) { X.fillStyle = P.ink; X.fillRect(-500, y, 2300, 0.6); } X.restore();
    const m = [[-500, GY - 60]]; for (let i = 0; i <= 20; i++) m.push([-500 + i * 120, GY - 180 - 90 * Math.abs(Math.sin(i * 1.3)) - 40 * hash(29000, i)]); m.push([1800, GY - 60]); shape(m, { lw: 1.4, id: 29001, fill: '#e2dac6', h: [0.7, 3.4, 0.5] });
    shape([[-500, GY + 10], [-500, -100], [200, -100], [330, 120], [360, 320], [440, 520], [520, GY + 10]], { lw: 2.4, id: 29010, fill: '#d6ccb4', h: [[0.9, 3.2, 0.6], [-0.3, 7, 0.4]] });
    shape(blobPts(230, 160, 46, 34, 29020, 22, 0.1), { lw: 2, id: 29020, fill: P.ink });
    ground(-500, 1800, GY, 22100, { hard: true });
    for (let i = 0; i < 16; i++) shape(rock(560 + hash(29030, i) * 700, GY + 6 - hash(29031, i) * 30, 14 + 26 * hash(29032, i), 29040 + i, 14), { lw: 1.4, id: 29040 + i, fill: '#cbbf9f', h: [0.6, 2.4, 0.6] });
    wreckHalf(true, st, 0, 0, 0);
    wreckHalf(false, st, -0.16, -14, 24);
    shape(rock(brkW[0] - 10, WBY - 90, 120, 29100, 26), { lw: 2.6, id: 29100, fill: '#d6ccb4', h: [[0.6, 3.4, 0.6], [-0.4, 6, 0.4]] });
    // something still turning inside, until it snaps
    const ga = lt < sn.at ? lt * 0.8 : sn.at * 0.8; const gx = brkW[0] + 30, gy = WBY + 40;
    X.save(); X.translate(gx, gy); X.rotate(ga); for (let i = 0; i < 10; i++) { const a = i / 10 * 6.283; shape([[Math.cos(a - 0.12) * 22, Math.sin(a - 0.12) * 22], [Math.cos(a - 0.08) * 30, Math.sin(a - 0.08) * 30], [Math.cos(a + 0.08) * 30, Math.sin(a + 0.08) * 30], [Math.cos(a + 0.12) * 22, Math.sin(a + 0.12) * 22]], { lw: 1, id: 29120 + i, fill: STEEL }); } ball(0, 0, 23, 29110, PAT.m, 1.6, STEEL); ball(0, 0, 6, 29111, PAT.d, 1); X.restore();
    for (let i = 0; i < 4; i++) { const q = (lt * 0.25 + i / 4) % 1; puff(brkW[0] - 40 + i * 30, WBY - 160 - q * 140, 14 + q * 26, (1 - q) * 0.5, 29200 + i); }
    if (lt >= sn.at) for (let i = 0; i < 4; i++) { const a_ = lt - sn.at - 0.3 - i * 0.25; if (a_ < 0) continue; const y_ = Math.min(GY - 6, WBY - 200 + 600 * a_ * a_); ball(brkW[0] - 60 + i * 34, y_, 6 + 3 * (i % 2), 29300 + i, PAT.m, 1.2); }
    if (lt >= sn.at && lt < sn.at + 0.4) { X.save(); X.globalAlpha = 1 - (lt - sn.at) / 0.4; star(gx, gy, 30, 29400, P.ink, 8); X.restore(); }
    trurl2(tP[0], tP[1], lt < dn.at ? 0.18 : PS, sh, lt, { f: lt >= wk_.at ? -1 : 1, soot: 0.8, walk: (lt >= dn.at && lt < dn.to + 1.5) || lt >= wk_.at ? 1 : 0, ph: lt * 8, rot: lt >= dn.at && lt < dn.to ? 0.2 : 0 });
    klapF(kP[0], kP[1], lt < dn.at ? 0.18 : PS, sh, lt, { f: lt >= wk_.at ? -1 : 1, walk: (lt >= dn.at && lt < dn.to + 1.5) || lt >= wk_.at ? 1 : 0, ph: lt * 8 + 1, rot: lt >= dn.at && lt < dn.to ? 0.2 : 0 });
  });
};

/* ---------- title and end ---------- */
SHOTS.title = (lt, sd) => {
  X.fillStyle = P.paper; X.fillRect(0, 0, W, H);
  txt('TRURL’S MACHINE', CX, 110, 66, {}); txt('after Stanisław Lem, The Cyberiad', CX, 170, 24, { italic: true });
  const GYt = 650;
  slate(420, GYt, 0.95, '2 + 2 = 4', U(lt, 0.2, 1.0), 21000);
  const thk = lt >= 0.8 && lt < 2.2 ? 0.2 + 0.8 * U(lt, 0.8, 2.2) : 0;
  machine(850, GYt, 0.7, { digit: lt >= 2.2 ? '7' : null, think: thk, glow: thk || (lt >= 2.2 ? Math.max(0, 1 - (lt - 2.2) / 2) : 0), shake: thk ? 1 + 2 * thk : 0 }, 20000);
  line([PX0, GYt], [PX1, GYt], 2.2, 29500, 0.4);
};
SHOTS.end = (lt, sd) => {
  X.fillStyle = P.paper; X.fillRect(0, 0, W, H); X.globalAlpha = seg(lt, 0.4, 1.6);
  txt('TRURL’S MACHINE', CX, 120, 40, {}); txt('after Stanisław Lem, The Cyberiad', CX, 172, 24, { italic: true }); X.globalAlpha = 1;
  slate(500, 640, 0.95, '2 + 2 = 4', 1, 21000);
  machine(820, 640, 0.6, { digit: null, plaster: 0.6 }, 20000);
  line([PX0, 640], [PX1, 640], 2.2, 29501, 0.4);
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
  const fade = sh.shot === 'title' ? Math.max(1 - seg(lt, 0, 0.6), seg(lt, sd - 0.6, sd)) : sh.shot === 'end' ? 1 - seg(lt, 0, 0.5) : sh.shot === 'wreck' ? Math.max(1 - seg(lt, 0, 0.6), seg(lt, sd - 1.2, sd)) : sh.shot === 'four' ? 0 : 1 - seg(lt, 0, 0.3);
  if (fade > 0) { X.fillStyle = P.paper; X.globalAlpha = fade; X.fillRect(0, 0, W, H); X.globalAlpha = 1; }
  border();
};
(async () => {
  T = await (await fetch('timing/tm.json')).json();
  await document.fonts.ready; await Promise.all(['20px "IM Fell English"', 'italic 20px "IM Fell English"', '20px "IBM Plex Mono"'].map((n) => document.fonts.load(n)));
  X = document.getElementById('film').getContext('2d');
  window.__NF = Math.ceil(T.dur * 24); window.__T = T; window.__ready = true;
})();
