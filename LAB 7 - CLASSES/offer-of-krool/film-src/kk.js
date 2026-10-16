/* The Second Sally, or The Offer of King Krool: drawing. Same toolkit as the earlier films (ink.js plus the head of the Ferrix drawing file, by way of A Good Shellacking).
   The device: distributed control. The beast is a set of small marks with no part that holds the brain; see the beast section below. */
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


/* ---------- sets borrowed from the earlier films ---------- */
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

const NOPAT = 'rgba(0,0,0,0)';
const FLOOR = 664, GY = 640, PURPLE = '#a58bc4', ROSE = '#c25d76', PALEROSE = '#e8c3cc', EMERALD = '#3f8a74', OCHRE = '#e0c27a', BRASS = '#d9b35c';
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
/* a crowned figure: King Protuberon in purple with a plume and medals, the Emperor in ochre with a tall crown */
function monarch(x, y, s, id, who, sh, lt, o = {}) {
  const f = o.f || 1, { sp, e } = armsFor(sh, who, lt, o), ra = o.ra || (sp ? [0.1 - e * 0.5, -0.5 - e * 0.4] : [1.5, 1.6]);
  if (o.seated) { const x0 = Math.min(x - 44 * s, x + f * 80 * s), x1 = Math.max(x - 44 * s, x + f * 80 * s); shape(R(x0 - 10, y - 124 * s, x1 - x0 + 20, 124 * s), { lw: 1.8, id: id + 300, h: [Math.PI / 2, 3, 0.6] }); }
  constructor_(x, y, s, id, { robe: true, robeFill: o.fill || PURPLE, f, seated: o.seated, ra, la: o.la || [1.4, 1.65], open: sp ? 0.8 : 0, look: o.look ?? 1, lookY: o.lookY || 0, mouth: o.smile ? Math.max(e, 0.35) : e, tilt: o.tilt || 0, stern: !o.smile });
  const hx = x, hy = y - 286 * s;
  if (who === 'E') { const p = [[-26, 0], [-24, -50], [-10, -34], [0, -62], [10, -34], [24, -50], [26, 0]].map(([a, b]) => [hx + a * 1.15 * s, hy - 34 * s + b * 1.15 * s]); shape(p, { lw: 1.6, id: id + 400, fill: OCHRE, h: [0.3, 2.4, 0.5] }); star(hx, hy - 34 * s - 76 * s, 14 * s, id + 410, P.ink, 8); }
  else { crown(hx, hy - 36 * 0.95 * s, 1.15 * s, id + 400); for (let i = 0; i < 4; i++) ink([[hx, hy - 78 * s], [hx + f * (6 + i * 7) * s, hy - 110 * s - Math.sin(i) * 8 * s], [hx + f * (14 + i * 9) * s, hy - 100 * s + i * 8 * s]], 1.6, id + 410 + i, 0.3); for (let i = 0; i < 5; i++) ball(x + f * (-18 + i * 9) * s, y - 206 * s + (i % 2) * 8 * s, 4.2 * s, id + 420 + i, PAT.f, 1); }
  if (o.quill) { const h = handPos(x, y, s, f, ra); ink([h, [h[0] + 26 * s, h[1] - 46 * s]], 2, id + 450, 0.2); ink([[h[0] + 8 * s, h[1] - 14 * s], [h[0] + 30 * s, h[1] - 40 * s], [h[0] + 20 * s, h[1] - 50 * s]], 1.2, id + 451, 0.3); }
}
function nightSky(id = 8000) { hatchSky(PY0 - 400, 760, -500, 1800); for (let i = 0; i < 70; i++) { const sx = -300 + hash(id, i) * 1900, sy = -200 + hash(id + 1, i) * 760; X.fillStyle = P.paper; const z = 1.6 + 2 * hash(id + 2, i); X.fillRect(sx, sy, z, z); } }
function lawn(y, id = 8200) { X.fillStyle = P.paper; X.fillRect(PX0 - 500, y, PX1 - PX0 + 1000, 600); for (let yy = y + 3, k = 0; yy < 820; yy += 5 + k * 0.6, k++) { X.fillStyle = P.ink; X.fillRect(PX0 - 500, yy, PX1 - PX0 + 1000, 0.6 + k * 0.06); } line([PX0 - 500, y], [PX1 + 500, y], 2.4, id, 0.3); }
function chair(x, y, s, id, f = 1) { shape(R(x - 50 * s, y - 128 * s, 100 * s, 16 * s), { lw: 1.6, id, h: [0.1, 3, 0.6] }); for (const d of [-1, 1]) shape(R(x + d * 40 * s - 5, y - 112 * s, 10, 112 * s), { lw: 1.4, id: id + 1 + d, h: [Math.PI / 2, 2.4, 0.6] }); shape(R(x - f * 50 * s - 6, y - 280 * s, 12, 160 * s), { lw: 1.6, id: id + 4, h: [Math.PI / 2, 2.4, 0.6] }); }
function bookshelf(x, y, w, h, id) { shape(R(x - w / 2, y - h, w, h), { lw: 2, id, fill: P.paper, h: [Math.PI / 2, 4, 0.4] }); for (let r = 0; r < 4; r++) { const sy = y - h + 14 + r * (h - 20) / 4; line([x - w / 2, sy + (h - 20) / 4 - 4], [x + w / 2, sy + (h - 20) / 4 - 4], 2.4, id + 1 + r, 0.2); for (let i = 0; i < 9; i++) { const bw = 8 + 6 * hash(id + r, i), bx = x - w / 2 + 6 + i * (w - 12) / 9; shape(R(bx, sy + 4 + hash(id + 9, i) * 8, bw, (h - 20) / 4 - 12 - hash(id + 9, i) * 8), { lw: 1, id: id + 20 + r * 10 + i, fill: i % 3 ? P.paper : '#d8d2c0', h: i % 2 ? [0, 2.2, 0.6] : undefined }); } } }
function herald(x, y, s, id, o = {}) { micro(x, y, s, id, { f: o.f || 1, wave: 0, look: o.f || 1 }); const f = o.f || 1, a = o.up ? -0.4 : 0.2, hx = x + f * 8 * s, hy = y - 46 * s; ink([[hx, hy], [hx + f * Math.cos(a) * 40 * s, hy + Math.sin(a) * 40 * s]], 2.4, id + 50, 0.1); shape([[hx + f * Math.cos(a) * 38 * s, hy + Math.sin(a) * 38 * s - 9 * s], [hx + f * Math.cos(a) * 52 * s, hy + Math.sin(a) * 52 * s - 14 * s], [hx + f * Math.cos(a) * 52 * s, hy + Math.sin(a) * 52 * s + 14 * s], [hx + f * Math.cos(a) * 38 * s, hy + Math.sin(a) * 38 * s + 9 * s]], { lw: 1.2, id: id + 51, fill: P.amber }); }
function goblet(x, y, s, id) { shape([[x - 7 * s, y - 26 * s], [x + 7 * s, y - 26 * s], [x + 3 * s, y - 12 * s], [x - 3 * s, y - 12 * s]], { lw: 1.2, id, fill: P.amber }); line([x, y - 12 * s], [x, y - 2 * s], 1.4, id + 1, 0.1); line([x - 6 * s, y - 2 * s], [x + 6 * s, y - 2 * s], 1.4, id + 2, 0.1); }

/* ================================================================================================
   THE OFFER OF KING KROOL
   The device: distributed control. The beast is never drawn as one creature with organs. It is NB small marks, each with its
   own fixed hash, and every shape the beast takes is a formation those same marks move into: a hill, a hill with a head,
   two hills and a running head, a scatter of clumps, a sandstorm, three policemen, a heap of ash. No mark is the brain.
   ================================================================================================ */
const BLUE = '#5b84b8';
const SILVER = '#d8d4c8', KRED = '#7a2c25', VELVET = '#a5302a', PEARL = '#ece5d9', SKYB = '#9dbbd8', OLIVE = '#7d7348', GIGG = '#4f8a55', NAVY = '#2c3550', GOLDK = '#e0b24a';
const GF = 600;
const swingDur = 0.42;
function swingAt(lt, hits) {
  for (const h of hits) { if (lt >= h - swingDur && lt < h) return -E.out((lt - (h - swingDur)) / swingDur); if (lt >= h && lt < h + 0.5) return 1 - E.in((lt - h) / 0.5); }
  return 0;
}
const lerp2 = (a, b, u) => [lerp(a[0], b[0], u), lerp(a[1], b[1], u)];
function armSwing(u, rest, up, down) { return u < 0 ? lerp2(rest, up, -u) : lerp2(rest, down, u); }
function lhandPos(x, y, s, f, la) { const ex = -30 + Math.cos(la[0]) * 62, ey = -214 + Math.sin(la[0]) * 62; return [x + (ex + Math.cos(la[1]) * 58) * s * f, y + (ey + Math.sin(la[1]) * 58) * s]; }
function bang(x, y, u, id, r = 40) { if (u <= 0 || u >= 1) return; X.save(); X.globalAlpha = 1 - u; star(x, y, r * (0.6 + u), id, P.ink, 10); X.restore(); }
const overlap = (a0, a1, b0, b1) => Math.max(0, Math.min(a1, b1) - Math.max(a0, b0));

/* ---------- small props ---------- */
function chainBetween(a, b, sag, id, lw = 1.3) {
  if (SILENT) return; const n = Math.max(4, Math.ceil(Math.hypot(b[0] - a[0], b[1] - a[1]) / 9));
  for (let i = 0; i < n; i++) { const u = (i + 0.5) / n, x = lerp(a[0], b[0], u), y = lerp(a[1], b[1], u) + Math.sin(u * Math.PI) * sag; X.beginPath(); X.ellipse(x, y, 5, 3, Math.atan2(b[1] - a[1], b[0] - a[0]) + (i % 2 ? 0 : 1.2), 0, 6.2832); X.lineWidth = lw; X.strokeStyle = P.ink; X.stroke(); }
}
function cuffs(a, b, id) { for (const p of [a, b]) { X.beginPath(); X.arc(p[0], p[1], 7, 0, 6.2832); X.lineWidth = 2.6; X.strokeStyle = '#8b8a86'; X.stroke(); X.lineWidth = 1; X.strokeStyle = P.ink; X.stroke(); } chainBetween(a, b, 6, id, 1.1); }
function toothAt(p, s, id, ring = 0) {
  const [x, y] = p; shape([[x - 7 * s, y - 10 * s], [x + 7 * s, y - 10 * s], [x + 8 * s, y - 2 * s], [x + 5 * s, y + 10 * s], [x + 1 * s, y + 4 * s], [x - 2 * s, y + 10 * s], [x - 7 * s, y - 2 * s]], { lw: 1.4, id, fill: '#f6f2e6' });
  line([x, y - 10 * s], [x + 4 * s, y - 30 * s], 1.2, id + 1, 0.1); ball(x + 4 * s, y - 31 * s, 2.2 * s, id + 2, PAT.d, 0.8);
  if (ring > 0) for (let i = 0; i < 3; i++) { const v = (ring * 1.5 + i / 3) % 1; X.save(); X.globalAlpha = 1 - v; X.beginPath(); X.arc(x + 4 * s, y - 31 * s, 6 + v * 34 * s, -2.6, -0.5); X.lineWidth = 1.6; X.strokeStyle = P.ink; X.stroke(); X.restore(); }
}
function goldCoins(x, y, n, id, spread = 30) { for (let i = 0; i < n; i++) coinDot(x + (hash(id, i) - 0.5) * spread * 2, y - hash(id + 1, i) * spread * 0.5, 4 + hash(id + 2, i) * 2, id + i); }
function fountain(x, y, h, lt, id) { for (let i = 0; i < 26; i++) { const u = ((lt * 0.9 + i / 26) % 1), side = i % 2 ? 1 : -1, px = x + side * u * 34, py = y - h * 4 * u * (1 - u); X.fillStyle = SKYB; X.globalAlpha = 0.9; X.beginPath(); X.arc(px, py, 2.2, 0, 6.2832); X.fill(); X.globalAlpha = 1; } line([x, y], [x, y - 14], 3, id, 0.1); }
function pencil(x, y, ang, len, id, o = {}) {
  X.save(); X.translate(x, y); X.rotate(ang);
  shape([[0, -7], [len, -7], [len, 7], [0, 7]], { lw: 1.6, id, fill: GOLDK, h: [0, 4.6, 0.5] });
  shape([[len, -7], [len + 12, -7], [len + 12, 7], [len, 7]], { lw: 1.4, id: id + 1, fill: '#d48f8f' });
  if (!o.broken) { shape([[0, -7], [-26, 0], [0, 7]], { lw: 1.4, id: id + 2, fill: '#ecd6b0' }); shape([[-18, -2], [-26, 0], [-18, 2]], { lw: 1, id: id + 3, fill: P.ink }); }
  else { shape([[0, -7], [-6, -2], [-2, 1], [-7, 7], [0, 7]], { lw: 1.4, id: id + 2, fill: '#ecd6b0' }); }
  X.restore();
}
function tipFragment(x, y, u, id, dir = 1) { if (u <= 0 || u >= 1) return; X.save(); X.translate(x + dir * u * 160, y - Math.sin(u * Math.PI) * 120 + u * 60); X.rotate(u * 14 * dir); shape([[0, -7], [-26, 0], [0, 7], [10, 6], [8, -6]], { lw: 1.4, id, fill: '#ecd6b0' }); X.restore(); }

/* ---------- the cast ---------- */
function klapK(x, y, s, sh, lt, o = {}) {
  const sp = sh ? talking(sh, 'K', lt) : false, e = sh ? sayAt(sh, 'K', lt) : 0, f = o.f || 1;
  const ra = o.ra || (sp ? [0.1 - e * 0.5, -0.5 - e * 0.4] : [1.5, 1.6]), la = o.la || [1.4, 1.65];
  rotAbout(x, y, o.rot || 0, () => {
    X.save(); X.globalAlpha = o.alpha ?? 1;
    constructor_(x, y, s, 600, { robe: true, robeFill: o.rags ? '#c4b99c' : '#d6cdb5', f, seated: o.seated, ra, la, open: o.open ?? (sp ? 0.8 : 0), look: o.look ?? 1, lookY: o.lookY || 0, mouth: e, tilt: o.tilt || 0, walk: o.walk || 0, ph: o.ph || 0, stern: o.stern ?? true, closed: o.closed });
    if (o.chains) chainBetween(handPos(x, y, s, f, ra), lhandPos(x, y, s, f, la), 26 * s, 6100);
    if (o.tooth) toothAt(handPos(x, y, s, f, ra), s * 1.2, 6150, o.ring || 0);
    if (o.cup) { const h = handPos(x, y, s, f, ra); goblet(h[0], h[1] + 6, s * 1.2, 6170); }
    X.restore();
  });
}
function trurlK(x, y, s, sh, lt, o = {}) {
  const f = o.f || 1, { ra } = armsFor(sh, 'T', lt, o), la = o.la || [1.4, 1.65];
  X.save(); X.globalAlpha = o.alpha ?? 1;
  trurlF(x, y, s, sh, lt, Object.assign({}, o, { ra, la, bag: o.bag ?? false, robe: o.rags ? '#c4b99c' : o.robe }));
  if (o.chains) chainBetween(handPos(x, y, s, f, ra), lhandPos(x, y, s, f, la), 26 * s, 6200);
  if (o.tooth) toothAt(handPos(x, y, s, f, ra), s * 1.2, 6250, o.ring || 0);
  if (o.cup) { const h = handPos(x, y, s, f, ra); goblet(h[0], h[1] + 6, s * 1.2, 6270); }
  X.restore();
}
function spikyCrown(x, y, s, id, tilt = 0) {
  X.save(); X.translate(x, y); X.rotate(tilt); X.scale(s, s);
  const p = [[-30, 0]]; for (let i = 0; i <= 6; i++) { p.push([-30 + i * 10, -16 - (i % 2 ? 0 : 26)]); } p.push([30, 0]);
  shape(p.map(([a, b]) => [a, b]), { lw: 1.6, id, fill: GOLDK, h: [0.4, 2.6, 0.5] });
  for (let i = 0; i <= 6; i += 2) ball(-30 + i * 10, -44, 3.4, id + 10 + i, PAT.f, 1);
  X.restore();
}
/* King Krool: the largest figure in any frame; dark red robe, spiked crown and shoulders, the stabbing right hand */
function krool(x, y, s, sh, lt, o = {}) {
  const f = o.f || 1, sp = sh ? talking(sh, 'R', lt) : false, e = sh ? sayAt(sh, 'R', lt) : 0, stab = sp ? Math.sin(lt * 5.3) : 0;
  const ra = o.ra || (sp ? [-0.5 - e * 0.6 + stab * 0.3, -0.9 - e * 0.5 + stab * 0.5] : [1.45, 1.6]), la = o.la || [1.35, 1.6];
  X.save(); X.globalAlpha = o.alpha ?? 1;
  if (o.seated && o.throne !== false) { /* drawn by caller */ }
  constructor_(x, y, s, 5000, { robe: true, robeFill: KRED, f, ra, la, open: sp ? 0.6 : 0, look: o.look ?? f, lookY: o.lookY || 0, mouth: o.mouth ?? e, tilt: o.tilt || 0, walk: o.walk || 0, ph: o.ph || 0, stern: o.stern ?? true, seated: o.seated, closed: o.closed });
  X.save(); X.translate(x, y); X.scale(s * f, s);
  for (const d of [-1, 1]) shape([[d * 22, -232], [d * 46, -236], [d * 58, -250], [d * 50, -222], [d * 60, -214], [d * 40, -210]], { lw: 1.4, id: 5060 + d, fill: P.ink });
  ink([[-36, -224], [30, -150]], 6, 5070, 0.2, GOLDK);
  if (o.chain) for (let r = 0; r < 5; r++) for (let c = 0; c < 6; c++) { X.beginPath(); X.arc(-30 + c * 12 + (r % 2) * 6, -212 + r * 14, 5, 0, 6.2832); X.lineWidth = 1.2; X.strokeStyle = '#bbb6a8'; X.stroke(); }
  if (o.dirty) { X.globalAlpha *= o.dirty; stip([[-50, -240], [50, -240], [60, 0], [-60, 0]], 5080, 0.05, 1.8); }
  X.restore();
  const hp = headPos(x, y, s); spikyCrown(hp[0] + (o.crownX || 0) * s, hp[1] - 40 * s, 1.0 * s, 5090, o.crownTilt || 0);
  if (o.cuffed) cuffs(handPos(x, y, s, f, ra), lhandPos(x, y, s, f, la), 5095);
  if (o.sword !== undefined && o.sword !== null) { const h = handPos(x, y, s, f, ra), a = o.sword; ink([h, [h[0] + Math.cos(a) * 120 * s, h[1] + Math.sin(a) * 120 * s]], 4, 5098, 0.1); ink([h, [h[0] + Math.cos(a) * 120 * s, h[1] + Math.sin(a) * 120 * s]], 1.5, 5099, 0.1, '#e8e4da'); line([h[0] - Math.sin(a) * 12 * s, h[1] + Math.cos(a) * 12 * s], [h[0] + Math.sin(a) * 12 * s, h[1] - Math.cos(a) * 12 * s], 3, 5097, 0.1); }
  X.restore();
}
/* Lord Protozor: ochre robe, earmuffs, little flies, an atomizer drone spraying scent over his brow */
function protozor(x, y, s, sh, lt, o = {}) {
  const f = o.f || 1, sp = sh ? talking(sh, 'P', lt) : false, e = sh ? sayAt(sh, 'P', lt) : 0;
  const ra = o.ra || (sp ? [-0.2 - e * 0.3, -0.6 - e * 0.3] : [1.2, 1.9]);
  constructor_(x, y, s, 5200, { robe: true, robeFill: OCHRE, f, ra, la: o.la || [1.4, 1.65], open: sp ? 0.9 : 0.3, look: o.look ?? f, mouth: e, tilt: o.tilt || 0, walk: o.walk || 0, ph: o.ph || 0, stern: false, hair: false });
  const hp = headPos(x, y, s);
  for (const d of [-1, 1]) ball(hp[0] + d * 30 * s, hp[1] - 6 * s, 10 * s, 5230 + d, PAT.f, 1.2, ROSE);
  line([hp[0] - 30 * s, hp[1] - 14 * s], [hp[0] - 20 * s, hp[1] - 40 * s], 1.6, 5233, 0.1); line([hp[0] + 30 * s, hp[1] - 14 * s], [hp[0] + 20 * s, hp[1] - 40 * s], 1.6, 5234, 0.1); line([hp[0] - 20 * s, hp[1] - 40 * s], [hp[0] + 20 * s, hp[1] - 40 * s], 1.6, 5235, 0.1);
  if (o.noRetinue) return;
  // the atomizer drone over his brow, and its scent
  const dx = hp[0] + Math.sin(lt * 2.1) * 14 * s, dy = hp[1] - 90 * s + Math.sin(lt * 4) * 5 * s;
  shape(blobPts(dx, dy, 12 * s, 7 * s, 5240, 20, 0.05), { lw: 1.2, id: 5240, fill: SKYB }); for (const d of [-1, 1]) { const fl = Math.sin(lt * 40 + d) * 6 * s; shape([[dx + d * 6 * s, dy - 3 * s], [dx + d * 24 * s, dy - 10 * s + fl], [dx + d * 20 * s, dy - 1 * s]], { lw: 0.8, id: 5241 + d, fill: P.paper }); }
  for (let i = 0; i < 9; i++) { const u = (lt * 1.3 + i / 9) % 1; X.save(); X.globalAlpha = 1 - u; X.fillStyle = P.ink; X.fillRect(dx - 4 * s + (hash(5244, i) - 0.5) * 30 * s * u, dy + 8 * s + u * 40 * s, 1.6, 1.6); X.restore(); }
  for (let i = 0; i < 4; i++) { const a = lt * (2 + i * 0.7) + i * 1.6, r = (48 + i * 9) * s; X.fillStyle = P.ink; X.beginPath(); X.arc(hp[0] + Math.cos(a) * r, hp[1] - 30 * s + Math.sin(a * 1.3) * r * 0.5, 2.2, 0, 6.2832); X.fill(); line([hp[0] + Math.cos(a) * r - 3, hp[1] - 30 * s + Math.sin(a * 1.3) * r * 0.5 - 3], [hp[0] + Math.cos(a) * r + 3, hp[1] - 30 * s + Math.sin(a * 1.3) * r * 0.5 - 4], 0.8, 5250 + i, 0.1); }
  // two six-legged fanning machines at his sides
  for (const d of [-1, 1]) { const mx_ = x + d * 70 * s, my = y - 10 * s; shape(blobPts(mx_, my - 18 * s, 18 * s, 10 * s, 5260 + d, 20, 0.06), { lw: 1.3, id: 5260 + d, fill: PEARL, h: [0.3, 3, 0.5] }); for (let k = 0; k < 3; k++) for (const q of [-1, 1]) line([mx_ + (k - 1) * 9 * s, my - 12 * s], [mx_ + (k - 1) * 9 * s + q * 6 * s, my], 1.2, 5270 + k * 2 + q, 0.1);
    const fa = -1.2 + Math.sin(lt * 7 + d) * 0.5; line([mx_, my - 26 * s], [mx_ + Math.cos(fa) * d * 40 * s, my - 26 * s + Math.sin(fa) * 40 * s], 1.4, 5280 + d, 0.1); shape(blobPts(mx_ + Math.cos(fa) * d * 46 * s, my - 26 * s + Math.sin(fa) * 46 * s, 12 * s, 6 * s, 5285 + d, 18, 0.1, 0, fa * d), { lw: 1, id: 5285 + d, fill: PALEROSE }); }
}
function chancellor(x, y, s, sh, lt, o = {}) {
  const f = o.f || 1, sp = sh ? talking(sh, 'C', lt) : false, e = sh ? sayAt(sh, 'C', lt) : 0;
  const ra = o.ra || (sp ? [-0.4 - e * 0.5, -1.0 - e * 0.4] : [1.5, 1.6]);
  constructor_(x, y, s, 5400, { robe: true, robeFill: PURPLE, f, ra, la: [1.4, 1.65], open: sp ? 0.6 : 0, look: o.look ?? f, mouth: e, stern: true, tilt: o.tilt || 0 });
  const hp = headPos(x, y, s); shape(R(hp[0] - 26 * s, hp[1] - 110 * s, 52 * s, 66 * s), { lw: 1.6, id: 5450, fill: P.ink }); shape(R(hp[0] - 34 * s, hp[1] - 48 * s, 68 * s, 8 * s), { lw: 1.4, id: 5451, fill: P.ink });
  chainBetween([x - 30 * s * f, y - 228 * s], [x + 30 * s * f, y - 228 * s], 40 * s, 5452, 1); ball(x, y - 180 * s, 16 * s, 5453, PAT.f, 1.4, GOLDK); star(x, y - 180 * s, 9 * s, 5454, P.ink, 6);
}
/* a policeman: the small box robot with a navy shako, plume, cross-sash */
function cop(x, y, s, id, o = {}) {
  const f = o.f || 1;
  X.save(); X.globalAlpha = o.alpha ?? 1;
  micro(x, y, s, id, { f, walk: o.walk || 0, ph: o.ph || 0, look: o.look ?? f, mouth: o.mouth || 0, wave: o.wave || 0, tilt: o.tilt || 0, ant: 0, bob: o.bob || 0 });
  X.save(); X.translate(x, y); X.scale(s * f, s);
  shape(R(-8, -35, 16, 18), { lw: 1.2, id: id + 60, fill: NAVY }); line([-8, -35], [8, -18], 2, id + 61, 0.1, P.paper);
  const hy = -46 - (o.bob || 0); X.save(); X.translate(0, hy); X.rotate(o.tilt || 0);
  shape([[-8, -6], [8, -6], [10, -24], [-10, -24]], { lw: 1.2, id: id + 62, fill: NAVY }); line([-9, -10], [9, -10], 1.6, id + 63, 0.1, GOLDK); shape(R(-9, -7, 18, 3), { lw: 0.8, id: id + 64, fill: P.ink });
  ink([[0, -24], [3, -34], [-2, -40]], 2.6, id + 65, 0.2, P.red);
  X.restore();
  if (o.whistle) { shape(R(4, hy + 2, 9, 4), { lw: 0.8, id: id + 66, fill: '#bdb8a8' }); }
  X.restore(); X.restore();
}
function postmaster(x, y, s, sh, lt, o = {}) {
  const f = o.f || 1, sp = sh ? talking(sh, 'M', lt) : false, e = sh ? sayAt(sh, 'M', lt) : 0, ra = o.ra || [1.3, 1.7];
  X.save(); X.globalAlpha = o.alpha ?? 1;
  constructor_(x, y, s, 5600, { robe: true, robeFill: '#3d5d8f', f, ra, la: [1.4, 1.65], look: f, mouth: e, hair: false, glasses: false, walk: o.walk || 0, ph: o.ph || 0, stern: false });
  const hp = headPos(x, y, s); shape([[hp[0] - 28 * s, hp[1] - 36 * s], [hp[0] + 28 * s, hp[1] - 36 * s], [hp[0] + 22 * s, hp[1] - 66 * s], [hp[0] - 22 * s, hp[1] - 66 * s]], { lw: 1.4, id: 5650, fill: '#3d5d8f' }); shape([[hp[0] - 30 * s * f, hp[1] - 36 * s], [hp[0] + 40 * s * f, hp[1] - 36 * s], [hp[0] + 34 * s * f, hp[1] - 28 * s]], { lw: 1.2, id: 5651, fill: P.ink });
  for (let i = 0; i < 6; i++) { const mx_ = x + f * (-20 + (i % 3) * 14) * s, my = y - 210 * s + Math.floor(i / 3) * 18 * s + Math.sin(lt * 12 + i) * (o.jingle || 0) * 2; line([mx_, my - 8 * s], [mx_, my], 1, 5660 + i, 0.1); ball(mx_, my + 4 * s, 4.5 * s, 5670 + i, PAT.f, 1, GOLDK); }
  line([x - 30 * s * f, y - 226 * s], [x + 40 * s * f, y - 130 * s], 2.4, 5680, 0.1); shape(R(x + f * 26 * s - 18 * s, y - 140 * s, 36 * s, 28 * s), { lw: 1.4, id: 5681, fill: BLUE, h: [0.6, 2.4, 0.5] });
  if (o.letter) { const h = handPos(x, y, s, f, ra); shape(R(h[0] - 14 * s, h[1] - 10 * s, 28 * s, 20 * s), { lw: 1.2, id: 5682, fill: '#f6f0dc' }); ball(h[0], h[1], 4 * s, 5683, PAT.d, 0.8, PURPLE); }
  X.restore();
}
function waiter(x, y, s, id, o = {}) { micro(x, y, s, id, { f: o.f || 1, walk: o.walk || 0, ph: o.ph || 0, look: o.look || 0, tilt: o.tilt || 0, ant: 0 }); const f = o.f || 1; shape([[x - 8 * s, y - 20 * s], [x + 8 * s, y - 20 * s], [x - f * 4 * s, y - 2 * s], [x - f * 14 * s, y - 4 * s]], { lw: 1, id: id + 70, fill: P.ink }); if (o.ear) { const ex = x - f * 10 * s, ey = y - 46 * s; shape(blobPts(ex, ey, 6 * s * o.ear, 9 * s * o.ear, id + 71, 18, 0.1), { lw: 1.2, id: id + 71, fill: PALEROSE }); } }

/* ---------- the beast: NB marks, and the formations they move between ---------- */
const NB = 560, HEADN = 70;
const BH = []; for (let i = 0; i < NB; i++) BH.push({ u: hash(9100, i), v: hash(9101, i), a: hash(9102, i), l: hash(9103, i), s: hash(9104, i), c: hash(9105, i), g: hash(9106, i) });
function hillPt(i, cx, cy, w, h, f = 1, o = {}) {
  const b = BH[i];
  if (i < HEADN && !o.noHead) { const a = b.u * 6.2832, r = Math.sqrt(b.v); return [cx + f * w * 0.46 + Math.cos(a) * r * h * 0.4, cy - h * 0.42 + Math.sin(a) * r * h * 0.34]; }
  const xu = b.u * 2 - 1, hh = h * Math.pow(Math.max(0, 1 - xu * xu), 0.55);
  return [cx + xu * w / 2, cy - Math.pow(b.v, 0.85) * hh];
}
function clumpPt(i, cx, cy, r) { const b = BH[i], a = b.a * 6.2832, rr = Math.sqrt(b.v) * r; return [cx + Math.cos(a) * rr, cy - Math.abs(Math.sin(a)) * rr * 0.9]; }
function stormPt(i, cx, cy, R_, lt) { const b = BH[i], a = lt * (5 + b.l * 4) + b.u * 6.2832, r = R_ * Math.sqrt(b.v); return [cx + Math.cos(a) * r, cy + Math.sin(a) * r * 0.55 - b.g * R_ * 0.4]; }
function wob(i, p, amp = 1.2) { return [p[0] + Math.sin(GT * 2.3 + i * 1.7) * amp, p[1] + Math.cos(GT * 1.9 + i) * amp]; }
function morphPt(i, A, B, u, arc = 0, spread = 0.45) { const k = E.io(clamp(u * (1 + spread) - BH[i].s * spread)); return [lerp(A[0], B[0], k), lerp(A[1], B[1], k) - Math.sin(k * Math.PI) * arc * (0.6 + 0.8 * BH[i].g)]; }
/* draw the marks: short weedy strokes, a few long stalks, some olive */
function drawMarks(pts, o = {}) {
  if (SILENT) return; const s = o.s || 1;
  X.save(); X.globalAlpha = o.alpha ?? 1; X.lineCap = 'round';
  for (const pass of [0, 1]) {
    X.beginPath();
    for (let i = 0; i < pts.length; i++) {
      const p = pts[i]; if (!p) continue; const b = BH[i]; if ((b.c > 0.78) !== (pass === 1)) continue;
      const ang = -1.57 + (b.a - 0.5) * 1.7 + (hash(i, BOIL) - 0.5) * 0.3 + (o.tilt || 0), L = (4 + b.l * 6) * s * (b.s > 0.88 ? 2.4 : 1);
      X.moveTo(p[0], p[1]); X.lineTo(p[0] + Math.cos(ang) * L, p[1] + Math.sin(ang) * L);
      if (b.s > 0.88) { X.moveTo(p[0] + Math.cos(ang) * L * 0.6, p[1] + Math.sin(ang) * L * 0.6); X.lineTo(p[0] + Math.cos(ang + 0.6) * L * 0.95, p[1] + Math.sin(ang + 0.6) * L * 0.95); }
    }
    X.lineWidth = (pass ? 1.6 : 1.3) * Math.max(0.55, Math.min(1.4, s)); X.strokeStyle = pass ? (o.col2 || OLIVE) : (o.col || P.ink); X.stroke();
  }
  X.restore(); X.lineCap = 'butt';
}
function beastShadow(cx, cy, w, a = 0.25) { if (SILENT) return; X.save(); X.globalAlpha = a; X.beginPath(); X.ellipse(cx, cy + 4, w * 0.55, 8, 0, 0, 6.2832); X.fillStyle = P.ink; X.fill(); X.restore(); }
function beastEyes(x, y, s, open, laser = 0, look = 1) {
  if (open <= 0.02) return;
  for (const d of [-1, 1]) { X.beginPath(); X.ellipse(x + d * 9 * s, y, 6 * s, 5 * s * open, 0, 0, 6.2832); X.fillStyle = laser > 0 ? '#f2d27a' : P.paper; X.fill(); X.lineWidth = 1.3; X.strokeStyle = P.ink; X.stroke(); X.fillStyle = P.ink; X.fillRect(x + d * 9 * s + look * 2 * s - 1.6 * s, y - 1.6 * s * open, 3.2 * s, 3.2 * s * open); }
}
function laser(a, b, u, id) { if (u <= 0 || u >= 1) return; X.save(); X.globalAlpha = Math.sin(u * Math.PI); ink([a, b], 5, id, 0.3, P.red); ink([a, b], 1.6, id + 1, 0.2, '#f6e3a0'); X.restore(); }
/* a hill-formation beast in one call */
function hillBeast(cx, cy, w, h, f, o = {}) {
  const pts = []; for (let i = 0; i < NB; i++) pts.push(wob(i, hillPt(i, cx, cy, w, h, f), o.wob ?? 1.2));
  beastShadow(cx, cy, w); drawMarks(pts, { s: o.s || 1, alpha: o.alpha });
  if (o.eyes) beastEyes(cx + f * w * 0.46, cy - h * 0.48, (o.s || 1) * 1.2, o.eyes, o.laser, f);
  return pts;
}

/* ---------- vehicles and animals ---------- */
function infernanda(x, y, s, lt, o = {}) { // x,y = ground under the hull centre
  X.save(); X.translate(x, y); X.scale(s, s);
  const lift = o.lift || 0;
  if (lift < 0.5) for (const lx of [-170, 0, 170]) { const p = [[lx * 0.7, -230], [lx * 0.9 + 20, -120], [lx, 0]]; ink(p, 9, 7100 + lx, 0.2); ink(p, 5, 7101 + lx, 0.2, PEARL); for (const q of [0.3, 0.6]) ball(lerp(p[0][0], p[2][0], q) + 14, lerp(p[0][1], p[2][1], q), 7, 7102 + lx + q * 10, PAT.f, 1.2, PEARL); shape(R(lx - 22, -8, 44, 8), { lw: 1.4, id: 7105 + lx, fill: PEARL }); }
  for (let i = 0; i < 6; i++) { const lx = -220 + i * 88 + 44 * (i > 2); ink([[lx * 0.8, -230], [lx, -95]], 6, 7120 + i, 0.2, GOLDK); ink([[lx * 0.8, -230], [lx, -95]], 1.2, 7130 + i, 0.2); ball(lx, -92, 6, 7140 + i, PAT.f, 1.2, GOLDK); }
  const hull = blobPts(0, -300, 280, 96, 7150, 40, 0.04);
  shape(hull, { lw: 2.6, id: 7150, fill: PEARL, h: [[0.25, 7, 0.5]], sh: R(-300, -300, 600, 110), sh2: [0.05, 3, 0.7] });
  X.save(); path(hull); X.clip(); for (let i = 0; i < 9; i++) { X.globalAlpha = 0.45; ink([[-280 + i * 70, -380], [-220 + i * 70, -220]], 10, 7160 + i, 2, i % 2 ? PALEROSE : SKYB); } X.restore(); X.globalAlpha = 1;
  for (let i = 0; i < 6; i++) ball(-180 + i * 72, -318, 11, 7170 + i, PAT.f, 1.6, i % 2 ? '#f6f0e2' : SKYB);
  shape(blobPts(0, -398, 90, 30, 7180, 26, 0.05), { lw: 2, id: 7180, fill: PEARL, h: [0.3, 4, 0.5] });
  if (o.door) { shape(R(-160, -282, 70, 70 * o.door), { lw: 2, id: 7185, fill: P.ink }); }
  if (o.flame) for (let i = 0; i < 5; i++) { const fx = -160 + i * 80, fl = o.flame * (60 + 30 * Math.sin(lt * 30 + i)); shape([[fx - 18, -220], [fx + 18, -220], [fx + Math.sin(lt * 23 + i) * 8, -220 + fl]], { lw: 1.6, id: 7190 + i, fill: P.amber, h: [Math.PI / 2, 3, 0.6] }); }
  X.restore();
}
function staircase(x0, y0, x1, y1, u, id) { // from the door (x0,y0) down to the ground (x1,y1)
  if (u <= 0) return; const n = 9, ex = lerp(x0, x1, u), ey = lerp(y0, y1, u);
  shape([[x0, y0], [ex, ey], [ex, ey + 14], [x0, y0 + 14]], { lw: 1.8, id, fill: PEARL, h: [0.1, 4, 0.5] });
  for (let i = 1; i < n; i++) { const v = i / n; if (v > u) break; const sx = lerp(x0, x1, v), sy = lerp(y0, y1, v); line([sx, sy], [sx + 10, sy - 1], 1.4, id + i, 0.1); }
  line([x0, y0 - 40], [ex, ey - 40], 1.8, id + 20, 0.2); for (let i = 0; i <= 6; i++) { const v = (i / 6) * u; line([lerp(x0, x1, v), lerp(y0, y1, v)], [lerp(x0, x1, v), lerp(y0, y1, v) - 40], 1.2, id + 30 + i, 0.1); }
}
function dragon(x, y, s, id, lt, o = {}) { // facing right; y = ground
  X.save(); X.translate(x, y); X.scale(s * (o.f || 1), s); if (o.rear) { X.translate(-40, 0); X.rotate(-o.rear * 0.35); X.translate(40, 0); }
  const run = o.run || 0, ph = lt * 9 + id;
  // tail with spikes
  const tail = []; for (let i = 0; i <= 10; i++) { const u = i / 10; tail.push([-80 - u * 130, -70 + Math.sin(u * 4 + lt * 3 + id) * 14 + u * 30]); } ink(tail, 7, id, 0.4);
  for (let i = 2; i < 10; i += 2) { const [tx, ty] = tail[i]; shape([[tx - 5, ty - 2], [tx + 5, ty - 2], [tx, ty - 14]], { lw: 1, id: id + 40 + i, fill: P.ink }); }
  // far legs, body, near legs
  for (const k of [0, 1]) { const q = ph + k * Math.PI; for (const lx of [-50, 40]) { const sw = Math.sin(q + (lx > 0 ? 1.5 : 0)) * 22 * run; ink([[lx, -50], [lx + sw, -20], [lx + sw * 1.2 + 6, 0]], k ? 9 : 7, id + 50 + lx + k, 0.3, k ? P.ink : '#4a4038'); for (const c of [-1, 0, 1]) line([lx + sw * 1.2 + 6, 0], [lx + sw * 1.2 + 14, c * 3 + 2], 1.6, id + 60 + c + lx, 0.1); } }
  const body = blobPts(-10, -78, 92, 42, id + 1, 30, 0.08); shape(body, { lw: 2, id: id + 1, fill: '#9aa58a', h: [[0.9, 5, 0.6]], sh: [[-110, -78], [90, -78], [90, -30], [-110, -30]], sh2: [0.1, 2.6, 0.7] });
  for (let i = 0; i < 6; i++) shape([[-70 + i * 22, -116], [-58 + i * 22, -116], [-64 + i * 22, -134]], { lw: 1, id: id + 70 + i, fill: P.ink });
  shape([[-20, -110], [10, -150], [30, -112]], { lw: 1.4, id: id + 80, fill: P.paper, h: [0.5, 3, 0.6] });
  line([-12, -122], [24, -128], 1.6, id + 81, 0.1);
  // neck and head with muzzle grate
  const hx = 120 + (o.lunge || 0) * -30, hy = -130 + Math.sin(ph * 0.5) * 4 - (o.rear || 0) * 20;
  ink([[60, -90], [96, -116], [hx, hy]], 22, id + 2, 0.3); ink([[60, -90], [96, -116], [hx, hy]], 15, id + 3, 0.3, '#9aa58a');
  shape([[hx - 18, hy - 18], [hx + 38, hy - 10], [hx + 44, hy + 8], [hx - 14, hy + 16]], { lw: 2, id: id + 4, fill: '#9aa58a', h: [0.2, 3, 0.5] });
  shape(R(hx + 22, hy - 12, 24, 22), { lw: 1.6, id: id + 5, fill: P.paper, h: [[0, 4, 1], [Math.PI / 2, 4, 1]] });
  ball(hx + 2, hy - 6, 4, id + 6, PAT.d, 1, '#f2d27a');
  if (o.fire > 0) for (let i = 0; i < 4; i++) { const v = (lt * 3 + i / 4) % 1; X.save(); X.globalAlpha = (1 - v) * o.fire; shape(blobPts(hx + 60 + v * 70, hy - v * 30, 10 + v * 22, 8 + v * 16, id + 90 + i, 18, 0.25), { lw: 1.2, id: id + 90 + i, fill: v < 0.3 ? P.amber : '#cfc6b3' }); X.restore(); }
  X.restore();
}
function carriage(x, y, s, id, lt, o = {}) {
  X.save(); X.translate(x, y); X.scale(s, s); const sp = o.spin || 0;
  shape([[-110, -60], [110, -60], [124, -170], [92, -210], [-92, -210], [-124, -170]], { lw: 2.2, id, fill: '#3b2f2a', h: [[0.7, 6, 0.5]] });
  shape(R(-60, -180, 120, 70), { lw: 1.8, id: id + 1, fill: P.paper });
  if (o.faces) { X.save(); path(R(-60, -180, 120, 70)); X.clip(); boxHead(-26, -130, 0.6, 400 + 80, { look: 1, hair: true }); boxHead(28, -130, 0.6, 600 + 80, { look: 1, stern: true }); X.restore(); }
  for (const wx of [-80, 80]) { ball(wx, -40, 40, id + 5 + wx, PAT.f, 2.2, P.paper); for (let k = 0; k < 6; k++) { const a = sp + k * Math.PI / 3; line([wx, -40], [wx + Math.cos(a) * 38, -40 + Math.sin(a) * 38], 1.6, id + 10 + k + wx, 0.1); } ball(wx, -40, 7, id + 30 + wx, PAT.d, 1.2); }
  line([110, -80], [260, -80], 4, id + 40, 0.2);
  if (o.driver !== false) micro(80, -210, 1.6, id + 50, { look: 1, f: 1 });
  X.restore();
}
function steed(x, y, s, id, lt, o = {}) { // a mechanical horse, facing right
  X.save(); X.translate(x, y); X.scale(s * (o.f || 1), s); const run = o.run || 0, ph = lt * 10;
  for (const [lx, q] of [[-60, 0], [60, 1.4], [-48, Math.PI], [72, Math.PI + 1.4]]) { const sw = Math.sin(ph + q) * 26 * run; ink([[lx, -110], [lx + sw * 0.6, -55], [lx + sw, 0]], 8, id + lx, 0.2); shape(R(lx + sw - 9, -6, 18, 6), { lw: 1, id: id + 5 + lx, fill: P.ink }); }
  shape(R(-90, -160, 190, 60), { lw: 2.2, id: id + 1, fill: '#c9c4b6', h: [[0.15, 4, 0.5]], sh: R(-90, -122, 190, 22), sh2: [0, 2.4, 0.8] });
  for (let i = 0; i < 6; i++) ball(-76 + i * 34, -150, 3.4, id + 20 + i, PAT.d, 0.8);
  shape([[86, -160], [118, -232], [146, -224], [116, -150]], { lw: 2, id: id + 2, fill: '#c9c4b6', h: [0.9, 4, 0.5] });
  shape([[112, -246], [176, -236], [178, -212], [120, -214]], { lw: 2, id: id + 3, fill: '#c9c4b6', h: [0.1, 4, 0.5] }); ball(136, -232, 4, id + 4, PAT.d, 1, P.red);
  for (let i = 0; i < 5; i++) ink([[-90, -150 + i * 5], [-130 - i * 6, -110 + i * 10 + Math.sin(lt * 6 + i) * 6]], 1.2, id + 30 + i, 0.4);
  X.restore();
}
function hound(x, y, s, id, lt, o = {}) {
  X.save(); X.translate(x, y); X.scale(s * (o.f || 1), s); if (o.rot) { X.translate(0, -20); X.rotate(o.rot); X.translate(0, 20); }
  const ph = lt * 16 + id, run = o.run ?? 1;
  for (const [lx, q] of [[-22, 0], [22, 1.6], [-16, Math.PI], [28, Math.PI + 1.6]]) { const sw = Math.sin(ph + q) * 10 * run; line([lx, -24], [lx + sw, 0], 3.2, id + lx + 40, 0.1); }
  shape(R(-30, -40, 64, 18), { lw: 1.6, id, fill: '#cfc8b8', h: [0.2, 3, 0.5] });
  shape([[30, -44], [54, -46], [58, -32], [34, -30]], { lw: 1.6, id: id + 1, fill: '#cfc8b8' }); shape([[34, -46], [38, -58], [44, -46]], { lw: 1, id: id + 2, fill: P.ink }); ball(46, -40, 2, id + 3, PAT.d, 0.8);
  line([-30, -38], [-46, -52], 1.6, id + 4, 0.2); ball(-46, -53, 2.4, id + 5, PAT.d, 0.8);
  X.restore();
  if (o.smoke > 0) for (let i = 0; i < 3; i++) { const v = (lt * 0.8 + i / 3) % 1; X.save(); X.globalAlpha = (1 - v) * o.smoke; shape(blobPts(x + i * 8 - 8, y - 40 * s - v * 60, 8 + v * 14, 6 + v * 10, id + 90 + i, 18, 0.2), { lw: 1, id: id + 90 + i, fill: '#d8d2c4' }); X.restore(); }
}
function fridge(x, y, s, id, o = {}) { // the refrigerator wagon on three hundred wheels; x,y = ground centre
  X.save(); X.translate(x, y); X.scale(s, s);
  shape([[-200, -40], [200, -40], [200, -250], [184, -268], [-184, -268], [-200, -250]], { lw: 2.6, id, fill: '#eeebe2', h: [[Math.PI / 2, 9, 0.35]], sh: R(120, -268, 80, 228), sh2: [Math.PI / 2, 2.6, 0.7] });
  line([-200, -228], [200, -228], 1.4, id + 1, 0.2); line([-200, -60], [200, -60], 1.4, id + 2, 0.2);
  for (let r = 0; r < 2; r++) for (let i = 0; i < 26; i++) ball(-192 + i * 15.4 + r * 7, -26 + r * 14, 6.5, id + 10 + i + r * 30, PAT.f, 1);
  const dx = -150, dw = 120, dh = 170, op = o.door || 0;
  if (op > 0.02) { shape(R(dx, -60 - dh, dw, dh), { lw: 2, id: id + 3, fill: '#2a241d' }); shape([[dx, -60], [dx - dw * 0.7 * op, -50], [dx - dw * 0.7 * op, -60 - dh - 10], [dx, -60 - dh]], { lw: 2, id: id + 4, fill: '#eeebe2', h: [Math.PI / 2, 5, 0.4] });
    if (o.gun) { ball(dx + dw / 2, -60 - dh / 2, 46, id + 5, PAT.d, 2.6, '#111'); X.beginPath(); X.arc(dx + dw / 2, -60 - dh / 2, 30, 0, 6.2832); X.fillStyle = '#000'; X.fill(); }
    if (o.inside) o.inside(dx, -60, dw, dh); }
  else { shape(R(dx, -60 - dh, dw, dh), { lw: 2, id: id + 3, fill: '#eeebe2', h: [Math.PI / 2, 5, 0.4] }); shape(R(dx + dw - 20, -60 - dh / 2 - 22, 10, 44), { lw: 1.4, id: id + 6, fill: '#bbb6a8' });
    if (o.sealed) { ball(dx + dw + 6, -60 - dh / 2, 12, id + 7, PAT.d, 1.4, VELVET); line([dx + dw - 24, -60 - dh / 2 + 18], [dx + dw + 30, -60 - dh / 2 + 30], 2, id + 8, 0.2, VELVET); } }
  X.restore();
}
function curtainStand(x, y, s, id, lt, ring = 0) {
  X.save(); X.translate(x, y); X.scale(s, s);
  line([-50, 0], [-50, -150], 3, id, 0.1); line([50, 0], [50, -150], 3, id + 1, 0.1); line([-56, -150], [56, -150], 3.4, id + 2, 0.1);
  const cl = [[-48, -148]]; for (let i = 0; i <= 8; i++) cl.push([-48 + i * 12, -10 - (i % 2) * 6]); cl.push([48, -148]);
  shape(cl, { lw: 1.6, id: id + 3, fill: VELVET, h: [[Math.PI / 2, 5, 0.6]] });
  for (const d of [-1, 1]) for (const yy of [-148, -12]) { line([d * 48, yy], [d * 48, yy + 14], 1.4, id + 10 + d + yy, 0.1); ball(d * 48, yy + 18, 4, id + 12 + d + yy, PAT.m, 1, GOLDK); }
  bellCluster(0, -80, 1, id + 20, lt, ring);
  X.restore();
}
function bellCluster(x, y, s, id, lt, ring = 0) { for (let i = 0; i < 5; i++) { const a = i / 5 * 6.2832, bx = x + Math.cos(a) * 12 * s + Math.sin(lt * 30 + i) * 3 * ring, by = y + Math.sin(a) * 8 * s; shape([[bx - 5 * s, by + 6 * s], [bx + 5 * s, by + 6 * s], [bx + 3 * s, by - 4 * s], [bx - 3 * s, by - 4 * s]], { lw: 1, id: id + i, fill: 'rgba(220,235,240,.9)' }); ball(bx, by + 7 * s, 1.6 * s, id + 10 + i, PAT.d, 0.6); } }
function ringArcs(x, y, u, id, r = 30) { if (u <= 0 || u >= 1) return; for (let i = 0; i < 3; i++) { const v = (u * 2.2 + i / 3) % 1; X.save(); X.globalAlpha = (1 - v) * Math.sin(u * Math.PI); for (const d of [-1, 1]) { X.beginPath(); X.arc(x, y, r * (0.4 + v), d > 0 ? -0.7 : Math.PI - 0.7, d > 0 ? 0.7 : Math.PI + 0.7); X.lineWidth = 1.8; X.strokeStyle = P.ink; X.stroke(); } X.restore(); } }
function gig(x, y, s, id, lt, o = {}) { // the green gig, facing right; back board THINK at the left
  X.save(); X.translate(x, y); X.scale(s, s); const sp = o.spin || 0;
  line([60, -66], [190, -56], 4, id, 0.2); line([60, -80], [190, -70], 4, id + 1, 0.2);
  shape([[-70, -64], [64, -64], [80, -120], [-60, -126]], { lw: 2, id: id + 2, fill: GIGG, h: [0.4, 5, 0.5] });
  shape(R(-96, -150, 38, 70), { lw: 1.8, id: id + 3, fill: SKYB }); X.save(); X.translate(-77, -115); X.rotate(-Math.PI / 2); txt('THINK', 0, 0, 15, { bold: true, mono: true }); X.restore();
  line([40, -126], [40, -170], 2, id + 4, 0.1); shape(R(30, -194, 20, 26), { lw: 1.4, id: id + 5, fill: P.ink }); X.beginPath(); X.arc(40, -181, 6, 0, 6.2832); X.fillStyle = P.amber; X.fill();
  ball(0, -44, 44, id + 6, PAT.f, 2.4, P.paper); for (let k = 0; k < 8; k++) { const a = sp + k * Math.PI / 4; line([0, -44], [Math.cos(a) * 42, -44 + Math.sin(a) * 42], 1.6, id + 10 + k, 0.1); } ball(0, -44, 6, id + 20, PAT.d, 1);
  X.restore();
}
function dustCloud(x, y, r, lt, id, a = 1) { for (let i = 0; i < 9; i++) { const v = (lt * 0.7 + i / 9) % 1; X.save(); X.globalAlpha = (1 - v) * 0.8 * a; shape(blobPts(x - v * r * 1.5 + (hash(id, i) - 0.5) * r, y - v * r * 0.6 - hash(id + 1, i) * r * 0.5, r * (0.3 + v * 0.5), r * (0.25 + v * 0.35), id + i, 20, 0.2), { lw: 1, id: id + i, fill: '#e2dccd', h: [0.5, 5, 0.4] }); X.restore(); } }
function cannon(x, y, s, id, o = {}) { X.save(); X.translate(x, y); X.scale(s * (o.f || 1), s); ball(-20, -34, 34, id, PAT.f, 2, P.paper); for (let k = 0; k < 6; k++) line([-20, -34], [-20 + Math.cos(k) * 32, -34 + Math.sin(k) * 32], 1.4, id + 1 + k, 0.1); X.save(); X.translate(0, -60); X.rotate(-(o.elev || 0.15)); shape([[-60, -22], [o.len || 150, -14], [o.len || 150, 14], [-60, 22]], { lw: 2.2, id: id + 10, fill: o.col || '#6d6a62', h: [0, 3, 0.6] }); ball(o.len || 150, 0, 15, id + 11, PAT.d, 1.6, '#222'); X.restore(); X.restore(); }

/* ---------- sets ---------- */
let SIGNPTS = null;
function signPts() {
  if (SIGNPTS) return SIGNPTS;
  const c = document.createElement('canvas'); c.width = 1280; c.height = 260; const g = c.getContext('2d'); g.fillStyle = '#000'; g.textAlign = 'center'; g.textBaseline = 'middle';
  g.font = 'bold 74px "IBM Plex Mono",monospace'; g.fillText('TWO CONSTRUCTORS', 640, 60); const wTWO = g.measureText('TWO').width, wAll = g.measureText('TWO CONSTRUCTORS').width;
  g.font = 'bold 40px "IBM Plex Mono",monospace'; g.fillText('WILL BUILD FOR A RICH KING', 640, 150); g.fillText('TERMS BY ARRANGEMENT', 640, 205);
  const d = g.getImageData(0, 0, 1280, 260).data, out = [];
  for (let y = 0; y < 260; y += 6) for (let x = 0; x < 1280; x += 6) if (d[(y * 1280 + x) * 4 + 3] > 128) out.push({ x, y: y + 70, first: y < 110 && x < 640 - wAll / 2 + wTWO + 4 });
  SIGNPTS = out; return out;
}
function homeLawn(lt) {
  X.fillStyle = P.paper; X.fillRect(PX0 - 500, PY0 - 500, 2300, 1600); X.save(); X.globalAlpha = 0.45; skyLines(PY0 - 300, GF, GF + 300); X.restore();
  house(110, GF, 190, 220, 7300); tree(400, GF, 5, 7320); tree(1180, GF, 4, 7330);
  lawn(GF, 7340);
}
function roadSet(lt, scroll) {
  X.fillStyle = P.paper; X.fillRect(PX0 - 500, PY0 - 500, 2300, 1600); X.save(); X.globalAlpha = 0.4; skyLines(PY0 - 300, 460, 760); X.restore();
  for (let i = 0; i < 9; i++) { const hx = ((i * 260 - scroll * 0.6) % 2340 + 2340) % 2340 - 400; house(hx, 470, 170, 150 + 50 * hash(7400, i), 7400 + i * 20); for (let k = 0; k < 3; k++) star(hx - 50 + k * 50, 400 - 30 * hash(7410, i + k), 7, 7420 + i * 3 + k, P.ink, 4); }
  X.fillStyle = P.paper; X.fillRect(PX0 - 500, 470, 2300, 600); floorLines(474, 720, 7450); line([PX0 - 500, 470], [PX1 + 500, 470], 2.4, 7451, 0.3);
  for (let i = 0; i < 14; i++) { const px = ((i * 140 - scroll) % 1960 + 1960) % 1960 - 300; shape(blobPts(px, 640 + (i % 3) * 18, 26, 7, 7460 + i, 18, 0.2), { lw: 1.2, id: 7460 + i, fill: P.ink }); }
}
/* the skull hall: hammered silver vault, two eye-socket windows with tinted light crossing over the throne, the pit in front */
function skullHall(lt, o = {}) {
  X.fillStyle = '#b9b4a6'; X.fillRect(PX0 - 500, PY0 - 500, 2300, 1600);
  const vault = [[-200, 600]]; for (let i = 0; i <= 40; i++) { const a = Math.PI + i / 40 * Math.PI; vault.push([640 + Math.cos(a) * 760, 600 + Math.sin(a) * 580]); } vault.push([1480, 600]);
  shape(vault, { lw: 2.4, id: 7500, fill: SILVER, h: [[0.35, 9, 0.35]] });
  for (let r = 0; r < 7; r++) { const rr = 140 + r * 90; X.beginPath(); X.ellipse(640, 600, rr * 1.1, rr * 0.8, 0, Math.PI, 2 * Math.PI); X.lineWidth = 0.8; X.strokeStyle = 'rgba(28,24,20,.35)'; X.stroke(); }
  for (const d of [-1, 1]) { const ex = 640 + d * 230, ey = 230; shape(blobPts(ex, ey, 130, 86, 7510 + d, 30, 0.08, 0.5), { lw: 2.6, id: 7510 + d, fill: '#5b2a22' }); X.save(); path(blobPts(ex, ey, 122, 78, 7510 + d, 30, 0.08, 0.5)); X.clip(); for (let k = 0; k < 6; k++) { X.fillStyle = k % 2 ? '#8e3b2a' : '#c2753a'; X.globalAlpha = 0.8; X.fillRect(ex - 130 + k * 44, ey - 90, 22, 180); } X.restore(); X.globalAlpha = 1; line([ex - 120, ey], [ex + 120, ey], 2, 7515 + d, 0.2); line([ex, ey - 80], [ex, ey + 80], 2, 7517 + d, 0.2); }
  shape([[640, 300], [600, 420], [640, 400], [680, 420]], { lw: 2, id: 7520, fill: '#2a241d' });
  // the crossing beams
  X.save(); X.globalAlpha = 0.22; X.fillStyle = '#d0682f'; for (const d of [-1, 1]) { X.beginPath(); X.moveTo(640 + d * 300, 200); X.lineTo(640 + d * 160, 260); X.lineTo(640 - d * 120, 600); X.lineTo(640 - d * 280, 600); X.closePath(); X.fill(); } X.restore();
  throne(640, 560, 7530);
  X.fillStyle = '#cfcabd'; X.fillRect(PX0 - 500, 560, 2300, 600); floorLines(564, 760, 7540); line([PX0 - 500, 560], [PX1 + 500, 560], 2.6, 7541, 0.3);
  // the pit: the skull's own foramen
  X.beginPath(); X.ellipse(640, 668, 190, 42, 0, 0, 6.2832); X.fillStyle = '#111'; X.fill(); X.lineWidth = 3; X.strokeStyle = P.ink; X.stroke();
  X.save(); X.beginPath(); X.ellipse(640, 668, 190, 42, 0, 0, 6.2832); X.clip(); for (let k = 0; k < 6; k++) { X.beginPath(); X.ellipse(640, 668 + k * 4, 180 - k * 22, 36 - k * 4, 0, Math.PI, 2 * Math.PI); X.lineWidth = 1; X.strokeStyle = 'rgba(235,227,207,.25)'; X.stroke(); } X.restore();
  if (o.chandelier !== false) chandelier(640, 150, 220, lt, 7550);
}
const paceP = 0.6, paceN = 10;
function pace(sh, lt, x0, x1) {
  const pc = cue(sh, 'pace'), fu = fulcrum(sh); if (!pc) return { x: (x0 + x1) / 2, f: -1, walking: false, ph: 0 };
  const ps = fu ? fu.t0 - 0.4 : 1e9, pe = fu ? fu.t1 + 0.6 : 1e9, t = Math.min(lt, pc.to);
  const w = Math.max(0, t - pc.at) - overlap(pc.at, t, ps, pe);
  const per = paceP * paceN, cyc = w / per, k = Math.floor(cyc), u = cyc - k, dir = k % 2 === 0 ? 1 : -1;
  const x = dir > 0 ? lerp(x0, x1, u) : lerp(x1, x0, u);
  const walking = lt >= pc.at && lt < pc.to && !(lt >= ps && lt < pe);
  return { x, f: dir, walking, ph: w / paceP * Math.PI + Math.PI / 2 };
}
function trophyGarden(lt, pan) {
  X.fillStyle = P.paper; X.fillRect(PX0 - 500, PY0 - 500, 3300, 1600); X.save(); X.globalAlpha = 0.42; skyLines(PY0 - 300, 520, 820); X.restore();
  X.fillStyle = P.paper; X.fillRect(PX0 - 500, 520, 3300, 600); for (let yy = 524, k = 0; yy < 760; yy += 5 + k * 0.6, k++) { X.fillStyle = P.ink; X.fillRect(PX0 - 500, yy, 3300, 0.5 + k * 0.05); } line([PX0 - 500, 520], [2800, 520], 2.4, 7600, 0.3);
  for (let i = 0; i < 9; i++) { const hx = 60 + i * 260; shape(R(hx - 40, 470, 80, 50), { lw: 1.6, id: 7610 + i, fill: '#8fa27a', h: [0.8, 4, 0.5] }); }
  // the sabre-toothed giant, split nearly in half
  X.save(); X.translate(420, 600);
  for (const d of [-1, 1]) { X.save(); X.rotate(d * 0.08); shape(d < 0 ? [[-200, 0], [-10, 0], [-6, -160], [-180, -180]] : [[10, 0], [170, 0], [190, -170], [14, -150]], { lw: 2.2, id: 7650 + d, fill: '#bdb8aa', h: [[0.6, 5, 0.6]], sh: d < 0 ? [[-200, -40], [-10, -40], [-10, 0], [-200, 0]] : null, sh2: [0, 2.4, 0.7] }); X.restore(); }
  shape([[170, -170], [270, -160], [280, -90], [180, -80]], { lw: 2, id: 7655, fill: '#bdb8aa', h: [0.2, 4, 0.5] });
  for (const fx of [200, 236]) shape([[fx, -90], [fx + 12, -90], [fx + 6, -20]], { lw: 1.4, id: 7656 + fx, fill: P.paper });
  for (const d of [-1, 1]) shape(R(-160 + (d + 1) * 120, -10, 26, 10), { lw: 1, id: 7660 + d, fill: P.ink });
  ink([[-200, -100], [-320, -60], [-350, 0]], 8, 7662, 0.4); shape(R(-372, -8, 40, 12), { lw: 1.4, id: 7663, fill: '#6d6a62' });
  X.restore();
  // a dragon with scorched wings, lying flat, a molten puddle
  X.save(); X.translate(980, 600); shape(blobPts(0, -30, 150, 34, 7670, 30, 0.1), { lw: 2, id: 7670, fill: '#9aa58a', h: [0.9, 5, 0.6] }); for (let i = 0; i < 10; i++) { shape([[-120 + i * 26, -58], [-104 + i * 26, -60], [-112 + i * 26, -84 - (i % 3) * 6]], { lw: 1, id: 7671 + i, fill: '#3a332c' }); }
  shape(blobPts(170, -4, 70, 10, 7690, 24, 0.3), { lw: 1.4, id: 7690, fill: '#c78a4a' }); X.restore();
  // the one still standing, on pillar legs, wind through its fangs
  X.save(); X.translate(1500, 600); for (const lx of [-90, -40, 40, 90]) shape(R(lx - 16, -170, 32, 170), { lw: 2, id: 7700 + lx, fill: '#bdb8aa', h: [Math.PI / 2, 4, 0.5] }); shape(blobPts(0, -230, 150, 70, 7710, 30, 0.08), { lw: 2.2, id: 7710, fill: '#bdb8aa', h: [0.4, 5, 0.5] });
  shape([[130, -270], [250, -250], [250, -200], [130, -190]], { lw: 2, id: 7711, fill: '#bdb8aa' }); for (let i = 0; i < 5; i++) shape([[150 + i * 20, -200], [162 + i * 20, -200], [156 + i * 20, -160]], { lw: 1.2, id: 7712 + i, fill: P.paper }); X.restore();
  // tank turtles with flattened turrets, little biting things
  for (const [tx, ty, id] of [[1880, 600, 7720], [2120, 610, 7730]]) { X.save(); X.translate(tx, ty); shape(blobPts(0, -40, 110, 44, id, 28, 0.06), { lw: 2, id, fill: '#a7ad92', h: [[0.5, 6, 0.5], [-0.6, 6, 0.4]] }); shape([[-40, -82], [44, -82], [50, -90], [-46, -90]], { lw: 1.6, id: id + 1, fill: '#6d6a62' }); line([30, -86], [110, -70], 3, id + 2, 0.2); for (let i = 0; i < 4; i++) ball(-60 + i * 40, -6, 12, id + 3 + i, PAT.f, 1.4); X.restore(); }
  for (let i = 0; i < 14; i++) { const bx = 700 + hash(7740, i) * 1700, by = 640 + hash(7741, i) * 50; shape(blobPts(bx, by, 9, 6, 7742 + i, 16, 0.3), { lw: 1, id: 7742 + i, fill: '#6d6a62' }); for (let k = 0; k < 3; k++) line([bx - 6 + k * 6, by - 4], [bx - 8 + k * 6, by - 12], 1, 7760 + i * 3 + k, 0.1); }
}
function drawingRoom(lt, o = {}) {
  X.fillStyle = P.paper; X.fillRect(PX0 - 500, PY0 - 500, 2300, 1600);
  for (let i = -10; i < 40; i++) { X.fillStyle = i % 2 ? 'rgba(79,138,85,.45)' : 'rgba(165,48,42,.35)'; X.fillRect(i * 50, PY0 - 500, 50, 1020); }
  for (let y = PY0 - 400; y < 520; y += 3.4) { X.fillStyle = 'rgba(28,24,20,.25)'; X.fillRect(PX0 - 500, y, 2300, 0.8); }
  X.fillStyle = P.paper; X.fillRect(PX0 - 500, 520, 2300, 600); floorLines(524, 720, 7800); line([PX0 - 500, 520], [PX1 + 500, 520], 2.4, 7801, 0.3);
  shopWin(980, 250, o.night || 0, o.sun ?? -1);
}
function shopWin(x, y, night, sun) {
  shape(R(x - 120, y - 110, 240, 220), { lw: 2.6, id: 7810, fill: P.paper });
  X.save(); path(R(x - 112, y - 102, 224, 204)); X.clip(); if (night > 0.5) { hatchSky(y - 110, y + 110, x - 130, x + 130); for (let i = 0; i < 12; i++) { X.fillStyle = P.paper; X.fillRect(x - 100 + hash(7811, i) * 200, y - 90 + hash(7812, i) * 180, 2, 2); } } else { X.globalAlpha = 0.5; skyLines(y - 110, y + 110, y + 300); X.globalAlpha = 1; }
  if (sun >= 0) { const sx = x - 120 + sun * 240, sy = y + 60 - Math.sin(sun * Math.PI) * 120; X.beginPath(); X.arc(sx, sy, 22, 0, 6.2832); X.fillStyle = night > 0.5 ? '#efe7cf' : P.amber; X.fill(); X.lineWidth = 1.6; X.strokeStyle = P.ink; X.stroke(); }
  X.restore(); line([x, y - 102], [x, y + 102], 2.4, 7813, 0.2); line([x - 112, y], [x + 112, y], 2.4, 7814, 0.2);
}
function couch(x, y, s, id) { shape([[x - 110 * s, y], [x + 110 * s, y], [x + 120 * s, y - 70 * s], [x - 120 * s, y - 70 * s]], { lw: 2, id, fill: PEARL, h: [0.1, 4, 0.5] }); shape([[x - 130 * s, y - 70 * s], [x - 120 * s, y - 150 * s], [x - 70 * s, y - 140 * s], [x - 80 * s, y - 70 * s]], { lw: 2, id: id + 1, fill: PEARL, h: [1.2, 4, 0.5] }); for (const d of [-1, 1]) shape(R(x + d * 100 * s - 6, y, 12, 14), { lw: 1.2, id: id + 2 + d, fill: P.ink }); }
function feastTable(x, y, w, id) { table(x, y - 110, w, id, 96); for (let i = 0; i < 6; i++) goblet(x - w / 2 + 30 + i * (w - 60) / 5, y - 110, 1.3, id + 10 + i); for (let i = 0; i < 4; i++) shape(blobPts(x - w / 2 + 60 + i * (w - 120) / 3, y - 122, 20, 12, id + 20 + i, 18, 0.15), { lw: 1.2, id: id + 20 + i, fill: i % 2 ? P.amber : ROSE }); }

/* ================================================================================================
   THE SCENES
   ================================================================================================ */
/* ---------- 1. the offer: the star sign, the ship, the carriage, the skull hall ---------- */
const SHX = 900;
SHOTS.offer = (lt, sd, sh) => {
  const L = sh.lines, sg = cue(sh, 'sign'), bl = cue(sh, 'blue'), ld = cue(sh, 'land'), st = cue(sh, 'stair'), bd = cue(sh, 'board'), lf = cue(sh, 'lift'), rd = cue(sh, 'road');
  if (lt < ld.at) {
    // night: the stars move into a sign
    const c = camFor(lt, [[0, ON(640, 470, 1.15)], [sg.at, ON(640, 330, 1.0)]], 1.6);
    cam(c, () => {
      X.fillStyle = DARK; X.fillRect(PX0 - 500, PY0 - 500, 2300, 1600);
      for (let i = 0; i < 160; i++) { X.fillStyle = P.paper; X.globalAlpha = 0.35 + 0.4 * hash(i, BOIL >> 2); const z = 1 + 1.4 * hash(8001, i); X.fillRect(-200 + hash(8002, i) * 1700, -100 + hash(8003, i) * 820, z, z); } X.globalAlpha = 1;
      const pts = signPts(), u = U(lt, sg.at, sg.to), bu = U(lt, bl.at, bl.at + 0.8);
      for (let i = 0; i < pts.length; i++) {
        const p = pts[i], sx = -150 + hash(8010, i) * 1580, sy = -60 + hash(8011, i) * 520, k = E.io(clamp(u * 1.5 - hash(8012, i) * 0.5));
        const x = lerp(sx, p.x, k), y = lerp(sy, p.y, k), big = p.first && bu > 0;
        X.fillStyle = big ? '#9cc4f4' : P.paper; const z = big ? 3.2 + bu * 1.4 : 2.2; X.fillRect(x - z / 2, y - z / 2, z, z);
      }
      if (bu > 0) for (let i = 0; i < 14; i++) { const p = pts.filter((q) => q.first)[(i * 37) % Math.max(1, pts.filter((q) => q.first).length)]; if (p) star(p.x, p.y, 7 * bu, 8020 + i, '#9cc4f4', 6); }
      // their home planet, the two constructors looking up
      ball(640, 1500, 860, 8030, PAT.f, 2, '#3a332c');
      house(500, 650, 120, 90, 8040); trurlK(690, 652, 0.24, sh, lt, { f: 1, look: 0, lookY: -1, ra: [-1.2, -1.6] }); klapK(760, 652, 0.24, sh, lt, { f: -1, look: 0, lookY: -1 });
    });
    dipAt(lt, ld.at, 0.35); return;
  }
  if (lt < rd.at) {
    // the lawn: the Infernanda lands; Protozor comes down the stairs
    const lu = E.out(U(lt, ld.at, ld.to)), lift = E.in(U(lt, lf.at, lf.to)), su = U(lt, ld.to - 0.6, st.at + 0.4) * (1 - U(lt, lf.at - 0.6, lf.at));
    const shipDy = lerp(-520, 0, lu) - lift * 700;
    const top = [SHX - 140, GF - 212 + shipDy], bot = [SHX - 330, GF];
    const pu = E.io(U(lt, st.at, st.to - 0.4)), pp = lt < st.at ? top : mix(top, bot, pu), px = lt < st.at ? -999 : (lt > st.to ? bot[0] - 20 : pp[0]);
    const bu = U(lt, bd.at - 0.4, bd.to + 0.6);
    const tx = lerp(290, bot[0] + 20, E.io(clamp(bu * 1.4))), kx = lerp(390, bot[0] + 60, E.io(clamp(bu * 1.4 - 0.2)));
    const pHead = headPos(px, lt > st.to ? GF : pp[1], 0.8);
    let c = camFor(lt, [[ld.at, ON(700, 300, 0.9)], [st.at, ON(560, 360, 1.05)], [L[4].t0 - 0.3, ON(420, 400, 1.3)], [L[6].t0 - 0.2, ON(380, 410, 1.3)], [bd.at - 0.3, ON(640, 360, 1.0)], [lf.at, ON(700, 300, 0.85)]], 1.0);
    c = withTight(sh, lt, c, pHead[0], pHead[1], 2.5);
    cam(c, () => {
      homeLawn(lt);
      if (lt < lf.at + 2) infernanda(SHX, GF + shipDy, 0.8, lt, { door: clamp(su * 2), flame: lu < 1 ? 1 - lu : lift > 0 ? 1 : 0, lift });
      if (lift <= 0) { staircase(top[0], top[1], bot[0], bot[1], su, 8100); fountain(bot[0] - 40, GF, 80, lt, 8120); fountain(bot[0] + 60, GF, 80, lt, 8121); }
      if (lu >= 1 && lift <= 0 && lt >= st.at) protozor(px, lt > st.to ? GF : pp[1], 0.8, sh, lt, { f: -1, walk: lt < st.to ? 1 : 0, ph: lt * 8 });
      if (lift <= 0) {
        const goUp = bu > 0.7, upU = U(bu, 0.7, 1);
        trurlK(goUp ? lerp(tx, top[0], upU) : tx, goUp ? lerp(GF, top[1], upU) : GF, 0.78, sh, lt, { f: 1, walk: bu > 0 && bu < 1 ? 1 : 0, ph: lt * 8, bag: true, alpha: 1 - U(bu, 0.92, 1) });
        klapK(goUp ? lerp(kx, top[0], upU) : kx, goUp ? lerp(GF, top[1], upU) : GF, 0.78, sh, lt, { f: bu > 0 ? 1 : -1, look: bu > 0 ? 1 : -1, walk: bu > 0 && bu < 1 ? 1 : 0, ph: lt * 8, alpha: 1 - U(bu, 0.95, 1) });
      }
      if (lu > 0 && lu < 1) dustCloud(SHX, GF, 90, lt, 8130, 1 - lu);
    });
    dipAt(lt, rd.at, 0.35); return;
  }
  const lg = cue(sh, 'lunge'), bt = cue(sh, 'beat'), ri = cue(sh, 'ride'), ha = cue(sh, 'hall');
  if (lt < ha.at) {
    // the dragon carriage
    const moving = lt >= ri.at, scroll = moving ? (lt - ri.at) * 900 * E.in(clamp((lt - ri.at) / 0.8)) : 0;
    const rear = pulse(lt, lg.at - 0.2, 1.6), beat = lt >= bt.at && lt < bt.to;
    const c = camFor(lt, [[rd.at, ON(640, 380, 0.95)], [ri.at, ON(600, 420, 1.05)], [L[9].t0 - 0.2, ON(430, 420, 1.6)]], 0.9);
    cam(c, () => {
      roadSet(lt, scroll);
      for (let r = 0; r < 3; r++) for (const lane of [0, 1]) { const dx = 640 + r * 190 + lane * 40, dy = 560 + lane * 26; dragon(dx, dy, 0.62, 8200 + r * 100 + lane * 50, lt, { run: moving ? 1 : 0.15, rear: !moving ? rear * (r === 2 ? 1 : 0.6) : 0, fire: !moving ? Math.max(rear, beat ? 0.6 : 0) : 0.4 }); }
      carriage(430, 610, 0.9, 8500, lt, { spin: scroll / 40, faces: moving });
      if (!moving) {
        trurlK(170, 640, 0.7, sh, lt, { f: 1, look: 1, ra: rear > 0.3 ? [-1.4, -2.0] : undefined }); klapK(270, 640, 0.7, sh, lt, { f: 1, look: 1 });
        for (let i = 0; i < 2; i++) { const sw = beat ? Math.sin(lt * 14 + i * 2) : 0; micro(760 + i * 260, 640, 1.9, 8600 + i * 30, { f: -1, look: 1, wave: 0.5 + 0.5 * sw }); if (beat) star(840 + i * 260, 520, 14 * Math.abs(sw), 8650 + i, P.ink, 6); }
      } else dustCloud(300, 600, 70, lt, 8700, 1);
    });
    dipAt(lt, ha.at, 0.3); return;
  }
  // the skull hall
  const pc = pace(sh, lt, 360, 960), cr = cue(sh, 'crystal'), la = cue(sh, 'laugh'), pt = cue(sh, 'pit');
  const kh = headPos(pc.x, 590, 1.0);
  const fu = fulcrum(sh), pointing = lt >= fu.t0 - 0.4 && lt < fu.t1 + 0.6;
  let c = camFor(lt, [[ha.at, ON(640, 370, 1.0)], [L[11].t0 - 0.2, ON(pc.x, 420, 1.25)], [L[12].t0 - 0.2, ON(300, 450, 1.35)], [L[13].t0 - 0.2, ON(640, 330, 1.0)], [L[14].t0, ON(pc.x, 400, 1.25)], [pt.at, ON(640, 560, 1.6)]], 1.0);
  if (lt > L[14].t0 && lt < pt.at) c = { z: c.z, x: lerp(c.x, pc.x - CX, 0.03), y: c.y };
  c = withTight(sh, lt, c, kh[0], kh[1], 2.5);
  c = shakeCam(c, pc.walking ? 1.2 * Math.max(0, Math.cos(pc.ph * 2)) : 0, lt);
  cam(c, () => {
    skullHall(lt);
    const fall = U(lt, cr.at - 0.6, cr.at); if (lt < cr.at + 0.6) { for (const d of [-1, 1]) if (lt < cr.at) shape([[640 + d * 60, lerp(190, 640, E.in(fall)) - 10], [646 + d * 60, lerp(190, 640, E.in(fall))], [640 + d * 60, lerp(190, 640, E.in(fall)) + 10], [634 + d * 60, lerp(190, 640, E.in(fall))]], { lw: 1.2, id: 8800 + d, fill: P.paper }); bang(580, 640, U(lt, cr.at, cr.at + 0.5), 8810, 22); bang(700, 640, U(lt, cr.at, cr.at + 0.5), 8811, 22); }
    const laughing = lt >= la.at && lt < la.at + 2.4;
    krool(pc.x, 590, 1.0, sh, lt, { f: pointing ? (pc.x > 640 ? -1 : 1) : pc.f, walk: pc.walking ? 1 : 0, ph: pc.ph, look: pointing ? 0 : pc.f, lookY: pointing ? 1 : 0, ra: pointing ? [0.6, 1.1] : laughing ? [-1.0, -1.6] : undefined, la: laughing ? [-2.2, -1.6] : undefined, mouth: laughing ? 0.6 + 0.3 * Math.sin(lt * 20) : undefined, tilt: laughing ? -0.15 : 0 });
    const lookPit = lt >= pt.at;
    trurlK(150, 690, 0.66, sh, lt, { f: 1, look: lookPit ? 1 : 1, lookY: lookPit ? 1 : 0, ra: lookPit ? [1.0, 1.3] : undefined });
    klapK(250, 690, 0.66, sh, lt, { f: 1, look: 1, lookY: lookPit ? 1 : 0 });
    for (const gx of [1090, 1180]) guard(gx, 640, 2.4, 8850 + gx, { f: -1, look: -1 });
  });
};

/* ---------- 2. the terms, and the garden ---------- */
SHOTS.terms = (lt, sd, sh) => {
  const L = sh.lines, cl = cue(sh, 'clap'), co = cue(sh, 'corridor'), ga = cue(sh, 'garden'), wi = cue(sh, 'wind'), la = cue(sh, 'laugh');
  if (lt < co.at) {
    const pc = pace(sh, lt, 360, 960), kh = headPos(pc.x, 590, 1.0), clap = pulse(lt, cl.at - 0.15, 0.5), fu = fulcrum(sh), stop = lt >= fu.t0 - 0.4 && lt < fu.t1 + 0.6;
    const laughing = lt >= la.at && lt < la.at + 1.8;
    let c = camFor(lt, [[0, ON(400, 420, 1.2)], [L[1].t0 - 0.2, ON(pc.x, 400, 1.2)], [L[3].t0, ON(640, 380, 1.0)], [cl.at - 0.3, ON(640, 330, 0.95)]], 1.0);
    c = withTight(sh, lt, c, kh[0], kh[1], 2.6);
    c = shakeCam(c, pc.walking ? 1.2 * Math.max(0, Math.cos(pc.ph * 2)) : 0, lt);
    cam(c, () => {
      skullHall(lt);
      if (lt >= cl.at) for (let i = 0; i < 18; i++) { const a = Math.PI + (i / 17) * Math.PI, v = U(lt, cl.at + i * 0.04, cl.at + i * 0.04 + 0.5); if (v > 0 && v < 1) star(640 + Math.cos(a) * 720, 600 + Math.sin(a) * 540, 16 * Math.sin(v * Math.PI), 8900 + i, P.amber, 6); }
      krool(pc.x, 590, 1.0, sh, lt, { f: stop ? -1 : pc.f, walk: pc.walking ? 1 : 0, ph: pc.ph, look: stop ? -1 : pc.f, ra: clap > 0 ? [-0.2, -0.6 + clap * 0.8] : laughing ? [-1.0, -1.6] : undefined, la: clap > 0 ? [0.2, -0.6 - clap * 0.4] : undefined, tilt: laughing ? -0.15 : 0, mouth: laughing ? 0.5 + 0.3 * Math.sin(lt * 20) : undefined });
      trurlK(150, 690, 0.66, sh, lt, { f: 1, look: 1 }); klapK(250, 690, 0.66, sh, lt, { f: 1, look: 1 });
      for (const gx of [1090, 1180]) guard(gx, 640, 2.4, 8850 + gx, { f: -1, look: -1, walk: lt > cl.at + 0.4 ? 1 : 0, ph: lt * 8 });
    });
    dipAt(lt, co.at, 0.3); return;
  }
  if (lt < ga.at) {
    // the corridor, winding like a throat
    const u = U(lt, co.at, ga.at);
    cam(ON(640, 360, 1.0), () => {
      X.fillStyle = '#2a241d'; X.fillRect(PX0 - 500, PY0 - 500, 2300, 1600);
      const pts = []; for (let i = 0; i <= 30; i++) { const v = i / 30; pts.push([80 + v * 1120, 360 + Math.sin(v * 9 + u * 2) * 120]); }
      X.save(); X.beginPath(); pts.forEach(([a, b], i) => (i ? X.lineTo(a, b) : X.moveTo(a, b))); X.lineWidth = 170; X.lineCap = 'round'; X.lineJoin = 'round'; X.strokeStyle = '#c9c4b6'; X.stroke(); X.lineWidth = 120; X.strokeStyle = P.paper; X.stroke(); X.restore();
      for (let k = 0; k < 4; k++) { const v = clamp(u * 1.1 - k * 0.05), q = Math.min(30, Math.floor(v * 30)), [px, py] = pts[q]; if (k < 2) guard(px, py + 30, 1.4, 8950 + k * 30, { f: 1, look: 1, walk: 1, ph: lt * 9 + k }); else if (k === 2) trurlK(px, py + 34, 0.32, sh, lt, { f: 1, walk: 1, ph: lt * 8 }); else klapK(px, py + 34, 0.32, sh, lt, { f: 1, walk: 1, ph: lt * 8 }); }
    });
    dipAt(lt, ga.at, 0.3); return;
  }
  // the garden of trophies
  const pan = E.io(U(lt, ga.at, sd)) * 1350, wu = U(lt, wi.at, wi.to);
  const c = { z: 1.0, x: pan - 60, y: -10 };
  cam(c, () => {
    trophyGarden(lt, pan);
    const wx = 640 + pan * 0.85;
    trurlK(wx - 40, 650, 0.7, sh, lt, { f: 1, walk: 1, ph: lt * 6, look: 1, lookY: -0.5 }); klapK(wx + 60, 650, 0.7, sh, lt, { f: 1, walk: 1, ph: lt * 6 + 1, look: 1 });
    if (wu > 0) for (let i = 0; i < 10; i++) { const v = (lt * 0.8 + i / 10) % 1, y = 380 + i * 7; X.save(); X.globalAlpha = Math.sin(v * Math.PI) * 0.8; ink([[1520 + v * 400, y], [1580 + v * 400, y - 4], [1640 + v * 400, y + 2]], 1.2, 9000 + i, 0.6); X.restore(); }
  });
};

/* ---------- 3. the work ---------- */
SHOTS.work = (lt, sd, sh) => {
  const L = sh.lines, ra_ = cue(sh, 'rant'), fl = cue(sh, 'flop'), dr = cue(sh, 'draft'), dn = cue(sh, 'dinner');
  if (lt < dr.at) {
    const flopped = lt >= fl.at, tx = flopped ? 300 : 420 + Math.sin(lt * 1.6) * 160, kHead = headPos(820, 640, 0.8);
    const g = Math.sin(lt * 6);
    let c = camFor(lt, [[0, ON(600, 400, 1.05)], [fl.at, ON(560, 420, 1.15)], [L[2].t0 - 0.4, ON(760, 420, 1.3)]], 1.0);
    c = withTight(sh, lt, c, kHead[0], kHead[1], 2.6);
    cam(c, () => {
      drawingRoom(lt); couch(300, 640, 1.0, 9100); feastTable(1000, 640, 300, 9120);
      if (!flopped) trurlK(tx, 650, 0.8, sh, lt, { f: Math.cos(lt * 1.6) > 0 ? 1 : -1, walk: 1, ph: lt * 9, ra: [-0.9 + 0.6 * g, -1.6 - 0.5 * g], la: [-1.8 - 0.5 * g, -1.2], open: 1 });
      else trurlK(300, 600, 0.8, sh, lt, { f: 1, seated: true, ra: [-1.9, -2.6], la: [-1.4, -0.7], tilt: 0.25, closed: true, lookY: 1 });
      klapK(820, 650, 0.8, sh, lt, { f: -1, look: -1, closed: !flopped && Math.floor(lt * 2) % 5 === 0 });
    });
    dipAt(lt, dr.at, 0.3); return;
  }
  if (lt < dn.at) {
    // two days and two nights at the drawing board
    const u = U(lt, dr.at, dn.at), cyc = (u * 2) % 1, night = cyc > 0.5;
    cam(ON(640, 380, 1.05), () => {
      drawingRoom(lt, { night: night ? 1 : 0, sun: night ? (cyc - 0.5) * 2 : cyc * 2 });
      X.save(); path(R(868, 148, 224, 204)); X.clip(); for (let i = 0; i < 3; i++) { const peek = 0.5 + 0.5 * Math.sin(lt * 1.3 + i * 2.1); micro(910 + i * 80, 400 - peek * 40, 2.2, 9230 + i * 30, { look: -1, lookY: 1 }); } X.restore();
      if (Math.sin(lt * 4.1) > 0.93) star(1030, 260, 22, 9290, P.ink, 10);
      shape([[380, 470], [900, 470], [940, 400], [420, 400]], { lw: 2, id: 9200, fill: '#f4eedb' }); line([420, 470], [400, 650], 3, 9201, 0.2); line([900, 470], [920, 650], 3, 9202, 0.2);
      for (let i = 0; i < 12; i++) { const v = clamp(u * 12 - i); if (v <= 0) continue; ink([[470 + (i % 6) * 70, 420 + Math.floor(i / 6) * 26], [470 + (i % 6) * 70 + 50 * v, 420 + Math.floor(i / 6) * 26 + Math.sin(i) * 8 * v]], 1.2, 9210 + i, 0.6); }
      trurlK(360, 650, 0.78, sh, lt, { f: 1, look: 1, lookY: 1, ra: [-0.2 + 0.3 * Math.sin(lt * 9), -0.4] }); klapK(960, 650, 0.78, sh, lt, { f: -1, look: -1, lookY: 1, ra: [0.2, -0.3 + 0.3 * Math.sin(lt * 7)] });
      if (night) { X.save(); X.globalAlpha = 0.3; X.fillStyle = '#1c1814'; X.fillRect(PX0 - 500, PY0 - 500, 2300, 1600); X.restore(); }
    });
    dipAt(lt, dn.at, 0.3); return;
  }
  // dinner: the waiters' ears
  const ear = 1 + 0.6 * U(lt, dn.at + 1.0, dn.at + 2.0);
  cam(camMix(ON(640, 420, 1.1), ON(640, 430, 1.25), U(lt, dn.at, sd)), () => {
    drawingRoom(lt, { night: 1, sun: -1 }); feastTable(640, 640, 420, 9300);
    trurlK(400, 600, 0.78, sh, lt, { f: 1, seated: true, ra: [-0.6, -1.1], cup: true, look: 1 }); klapK(880, 600, 0.78, sh, lt, { f: -1, seated: true, ra: [-0.6, -1.1], cup: true, look: -1 });
    for (const [wx, f] of [[230, 1], [1060, -1]]) waiter(wx, 650, 2.6, 9350 + wx, { f, look: f, ear, tilt: f * 0.12 });
  });
};

/* ---------- 4. the veranda ---------- */
function village(lt, lights) {
  X.fillStyle = P.paper; X.fillRect(PX0 - 500, PY0 - 500, 2300, 1600); X.save(); X.globalAlpha = 0.85; hatchSky(PY0 - 300, 420, -400, 1700); X.restore();
  X.save(); X.globalAlpha = 0.35; X.fillStyle = '#d0682f'; X.fillRect(PX0 - 500, 330, 2300, 90); X.restore();
  const hz = [[PX0 - 500, 430]]; for (let i = 0; i <= 20; i++) hz.push([i * 70, 400 - 20 * hash(9400, i)]); hz.push([1700, 430]); shape(hz, { lw: 1.4, id: 9401, fill: '#9c9584', h: [0.2, 3, 0.5] });
  for (let i = 0; i < 16; i++) { const vx = 40 + i * 78, vh = 40 + 50 * hash(9410, i), vy = 470 + (i % 3) * 14; shape(R(vx - 24, vy - vh, 48, vh), { lw: 1.3, id: 9420 + i, fill: '#f2ecdc', h: [Math.PI / 2, 3, 0.4] });
    if (i % 4 === 1) { shape([[vx - 12, vy - vh], [vx, vy - vh - 70], [vx + 12, vy - vh]], { lw: 1.3, id: 9440 + i, fill: '#f2ecdc' }); } else if (i % 4 === 3) { X.beginPath(); X.arc(vx, vy - vh, 22, Math.PI, 0); X.fillStyle = '#f2ecdc'; X.fill(); X.lineWidth = 1.3; X.strokeStyle = P.ink; X.stroke(); }
    for (let k = 0; k < 2; k++) { const lit = hash(9460, i * 2 + k) < lights; X.fillStyle = lit ? P.amber : P.ink; X.fillRect(vx - 14 + k * 18, vy - vh + 14, 8, 10); } }
}
function balustrade(y) { X.fillStyle = P.paper; X.fillRect(PX0 - 500, y, 2300, 600); floorLines(y + 4, 760, 9500); shape(R(PX0 - 500, y - 120, 2300, 18), { lw: 2, id: 9501, fill: '#e5dfcf', h: [0.1, 3, 0.6] }); for (let i = 0; i < 30; i++) { const bx = -100 + i * 52; shape([[bx - 10, y], [bx + 10, y], [bx + 6, y - 50], [bx + 12, y - 74], [bx + 6, y - 102], [bx - 6, y - 102], [bx - 12, y - 74], [bx - 6, y - 50]], { lw: 1.3, id: 9510 + i, fill: '#ece6d6', h: [Math.PI / 2, 4, 0.4] }); } line([PX0 - 500, y], [PX1 + 500, y], 2.4, 9502, 0.3); }
function ideaSketch(n, x, y, lt, id) {
  if (n === 0) { const u = (lt * 0.7) % 1, k = u < 0.5 ? u * 2 : 2 - u * 2, pts = []; for (let i = 0; i < 120; i++) { const A = hillPt(i * 4 % NB, x, y + 20, 80, 36, 1), B = clumpPt(i * 4 % NB, x + ((i % 5) - 2) * 26, y + 26, 10); pts[i * 4 % NB] = mix(A, B, E.io(k)); } drawMarks(pts, { s: 0.6 }); }
  if (n === 1) { ball(x, y + 4, 22, id, PAT.f, 1.4, P.paper); line([x, y - 18], [x, y - 40], 1.6, id + 1, 0.1); ink([[x - 30, y - 30], [x + 30, y + 30]], 3, id + 2, 0.2, P.red); ink([[x + 30, y - 30], [x - 30, y + 30]], 3, id + 3, 0.2, P.red); }
  if (n === 2) { shape(blobPts(x, y + 10, 34, 20, id, 20, 0.1), { lw: 1.4, id, fill: '#d8d2c4' }); const sm = (lt * 1.5) % 1; star(x + 10, y - 20 + sm * 30, 14, id + 4, P.ink, 8); }
}
SHOTS.veranda = (lt, sd, sh) => {
  const L = sh.lines, li = cue(sh, 'lights'), sv = cue(sh, 'servants'), ids = cues(sh, 'idea'), lu = U(lt, li.at, li.to);
  const tH = headPos(500, 700, 0.85), kH = headPos(800, 700, 0.85);
  let c = camFor(lt, [[0, ON(640, 380, 1.0)], [L[1].t0, ON(700, 380, 1.1)], [L[3].t0, ON(560, 360, 1.1)], [L[6].t0, ON(720, 360, 1.15)], [sv.at, ON(760, 360, 1.0)]], 1.0);
  c = withTight(sh, lt, c, tH[0], tH[1], 2.5);
  cam(c, () => {
    village(lt, lu);
    balustrade(560);
    trurlK(500, 700, 0.85, sh, lt, { f: 1, look: talking(sh, 'T', lt) ? 1 : 1 });
    const birds = lt >= sv.at + 0.4;
    klapK(800, 700, 0.85, sh, lt, { f: birds ? 1 : -1, look: birds ? 1 : -1, lookY: birds ? -1 : 0, ra: birds ? [-1.0, -1.5] : undefined });
    // the orioles on a branch
    ink([[1100, 150], [1300, 120]], 4, 9600, 0.4); for (const [bx, k] of [[1160, 0], [1220, 1]]) { shape(blobPts(bx, 128 - k * 6, 14, 9, 9610 + k, 18, 0.1), { lw: 1.2, id: 9610 + k, fill: '#e8892c' }); shape([[bx + 12, 124 - k * 6], [bx + 22, 126 - k * 6], [bx + 12, 130 - k * 6]], { lw: 0.8, id: 9615 + k, fill: P.ink }); ball(bx + 6, 122 - k * 6, 1.6, 9617 + k, PAT.d, 0.6); }
    for (const q of ids) { const u = U(lt, q.at - 0.2, q.at + 0.3) * (1 - U(lt, q.to, q.to + 0.4)); if (u <= 0) continue; X.save(); X.globalAlpha = u; bubble(420, 230, 220, 140, tH[0] + 20, tH[1] - 30, 9620 + q.n * 10); ideaSketch(q.n, 420, 230, lt, 9650 + q.n * 10); X.restore(); }
    if (lt >= sv.at) { const u = E.out(U(lt, sv.at, sv.at + 2.2)); for (let i = 0; i < 2; i++) { const wx = lerp(1350 + i * 90, 1000 + i * 120, u); waiter(wx, 700, 2.8, 9700 + i * 40, { f: -1, look: -1, walk: u < 1 ? 1 : 0, ph: lt * 9 + i, ear: 1.3 }); shape(R(wx - 40, 520, 18, 26), { lw: 1.2, id: 9750 + i, fill: SILVER }); X.save(); X.globalAlpha = 0.25; X.beginPath(); X.arc(wx - 31, 533, 30, 0, 6.2832); X.fillStyle = P.amber; X.fill(); X.restore(); } }
  });
};

/* ---------- 5. the paper: the King and the beast fight as mathematics ---------- */
function pageSet(id = 9800) {
  X.fillStyle = '#f3ecd8'; X.fillRect(PX0 - 500, PY0 - 500, 2300, 1600);
  for (let x = -300; x < 1600; x += 32) { X.fillStyle = 'rgba(91,132,184,.18)'; X.fillRect(x, PY0 - 500, 1, 1600); } for (let y = -300; y < 1100; y += 32) { X.fillStyle = 'rgba(91,132,184,.18)'; X.fillRect(PX0 - 500, y, 2300, 1); }
  X.save(); X.globalAlpha = 0.75;
  txt('f(x) = Σ aₙ xⁿ', 250, 110, 30, { italic: true }); txt('∂K / ∂t = −λ K', 980, 120, 28, { italic: true }); txt('lim  x→∞', 1080, 600, 24, { italic: true }); txt('e^iπ + 1 = 0', 200, 640, 24, { italic: true });
  const mx_ = (x, y, rows) => { ink([[x, y - 40], [x - 8, y - 40], [x - 8, y + 40], [x, y + 40]], 2, id + x, 0.2); ink([[x + 90, y - 40], [x + 98, y - 40], [x + 98, y + 40], [x + 90, y + 40]], 2, id + x + 1, 0.2); rows.forEach((r, i) => txt(r, x + 45, y - 22 + i * 22, 20, { mono: true })); };
  mx_(120, 300, ['2 0 1', '1 3 0', '0 4 2']); mx_(1100, 330, ['1 0', '0 1', 'k n']);
  ink([[110, 470], [120, 420], [130, 470], [140, 520], [150, 470]], 1.4, id + 50, 0.4);
  // the integral
  ink([[640, 70], [628, 66], [620, 80], [612, 160], [604, 176], [592, 172]], 3, id + 60, 0.3); txt('dx', 680, 125, 24, { italic: true });
  X.restore();
}
function radicalSign(x, y, w, h, u, id) { if (u <= 0) return; const p = [[x - 40, y - h * 0.3], [x - 24, y - h * 0.4], [x, y + 10], [x + 30, y - h], [x + 30 + w, y - h]]; const n = Math.max(2, Math.ceil(p.length * u)); ink(p.slice(0, n), 4, id, 0.3); }
function asymptote(u, id) { if (u <= 0) return; dashed([[1040, 60], [1040, 720]], 1.6, [8, 8]); const pts = []; for (let i = 0; i <= 30 * u; i++) { const x = 560 + i * 15.5; pts.push([x, 120 + 9000 / (1045 - x + 18)]); } if (pts.length > 1) ink(pts, 1.8, id, 0.3); }
const asymPt = (v) => { const x = 560 + v * 465; return [x, 120 + 9000 / (1045 - x + 18)]; };
function hqRoom(lt, dawn = 0) {
  wallRoomStone(lt); shopWin(980, 240, dawn > 0.5 ? 0 : 1, dawn > 0 ? 0.15 + dawn * 0.1 : -1);
  chandelier(400, 140, 200, lt, 9900);
  for (let i = 0; i < 3; i++) micro(330 + i * 70, 196, 1.0, 9950 + i * 30, { look: (i % 2 ? -1 : 1), lookY: 1, tilt: Math.sin(lt + i) * 0.1 });
}
function recorder(x, y, s, lt, spin, id) { shape(R(x - 60 * s, y - 50 * s, 120 * s, 50 * s), { lw: 1.8, id, fill: '#cfc8b8', h: [0.1, 3, 0.5] }); for (const d of [-1, 1]) { ball(x + d * 30 * s, y - 25 * s, 18 * s, id + 2 + d, PAT.f, 1.4, '#3a332c'); for (let k = 0; k < 3; k++) { const a = spin + k * 2.09; line([x + d * 30 * s, y - 25 * s], [x + d * 30 * s + Math.cos(a) * 16 * s, y - 25 * s + Math.sin(a) * 16 * s], 1.4, id + 6 + k + d * 3, 0.1, P.paper); } } line([x - 30 * s, y - 8 * s], [x + 30 * s, y - 8 * s], 1.4, id + 20, 0.1); }
function jug(x, y, s, id, open = 0) { shape([[x - 30 * s, y - open * 30 * s], [x + 30 * s, y - open * 30 * s], [x + 44 * s, y - 70 * s], [x + 18 * s, y - 120 * s], [x + 18 * s, y - 150 * s], [x - 18 * s, y - 150 * s], [x - 18 * s, y - 120 * s], [x - 44 * s, y - 70 * s]], { lw: 2, id, fill: '#c7865a', h: [0.5, 4, 0.5] }); ink([[x + 40 * s, y - 100 * s], [x + 70 * s, y - 110 * s], [x + 60 * s, y - 70 * s]], 3, id + 1, 0.2); if (open > 0) shape(R(x - 30 * s, y - 6 * s, 60 * s, 6 * s), { lw: 1.4, id: id + 2, fill: '#c7865a' }); }
SHOTS.paper = (lt, sd, sh) => {
  const L = sh.lines, sn = cues(sh, 'snap'), rad = cue(sh, 'radical'), dv = cue(sh, 'deriv'), as = cue(sh, 'asym'), gr = cue(sh, 'grow'), ch = cue(sh, 'chain'), ho = cue(sh, 'horns'), wh = cue(sh, 'wham'), jg = cue(sh, 'jug'), tp = cue(sh, 'tape'), dn = cue(sh, 'down'), la = cue(sh, 'laugh'), hq = cue(sh, 'hq');
  const pencils = (kx, kyy, bx, byy) => {
    const n0 = sn.filter((q) => q.at <= lt && q.n !== 1).length, n1 = sn.filter((q) => q.at <= lt && q.n === 1).length;
    const sc0 = Math.sin(lt * 23) * 12, sc1 = Math.cos(lt * 19) * 12;
    pencil(kx + 40 + sc0, kyy - 150 + Math.abs(sc0), -2.2, 300 - n0 * 50, 9810, { broken: sn.some((q) => q.n !== 1 && lt >= q.at && lt < q.at + 0.5) });
    pencil(bx - 30 + sc1, byy - 150 + Math.abs(sc1), -1.0, 300 - n1 * 60, 9820, { broken: sn.some((q) => q.n === 1 && lt >= q.at && lt < q.at + 0.5) });
    for (const q of sn) tipFragment(q.n === 1 ? bx - 20 : kx + 30, (q.n === 1 ? byy : kyy) - 120, U(lt, q.at, q.at + 1.0), 9830 + q.n, q.n === 1 ? 1 : -1);
  };
  if (lt < jg.at) {
    // the battle on the page
    const radU = U(lt, rad.at - 0.3, rad.at + 0.3), asU = U(lt, as.at, as.at + 1.6), grU = U(lt, gr.at, gr.at + 0.8), chU = U(lt, ch.at, ch.at + 0.6), hoU = U(lt, ho.at, ho.at + 0.5), whU = U(lt, ho.at + 0.5, wh.at);
    let kx = 420 + Math.sin(lt * 2.2) * 40, ky = 470;
    if (lt >= dv.at && lt < dv.at + 1.4) kx = 480;
    let bx = 800 + Math.sin(lt * 1.7) * 30, by = 480, bs = 1, hide = 0;
    if (lt >= rad.at - 0.3) { bx = 820; by = 480; bs = 0.75; hide = radU; }
    if (lt >= as.at) { const p = asymPt(clamp(asU)); bx = p[0]; by = p[1] + 30; }
    if (lt >= gr.at) { const p = asymPt(1); bx = lerp(p[0], 880, E.io(grU)); by = lerp(p[1] + 30, 440, E.io(grU)); bs = lerp(0.75, 2.0, E.out(grU)); }
    if (lt >= ho.at + 0.5) { bx = lerp(880, kx + 140, E.in(whU)); }
    const knock = lt >= wh.at ? E.out(U(lt, wh.at, wh.at + 0.5)) : 0;
    const c = camFor(lt, [[0, ON(640, 380, 1.0)], [rad.at - 0.4, ON(720, 380, 1.15)], [as.at, ON(820, 330, 1.0)], [ch.at - 0.3, ON(560, 390, 1.15)], [wh.at - 0.3, ON(640, 380, 1.0)]], 0.7);
    cam(shakeCam(c, knock > 0 && knock < 1 ? 6 * (1 - knock) : 0, lt), () => {
      pageSet();
      asymptote(asU, 9840);
      radicalSign(780, 520, 140, 150, radU, 9850);
      // the King on the page
      const kRot = knock * -1.4;
      rotAbout(kx, ky, kRot, () => krool(kx, ky, 0.42, null, lt, { f: 1, look: 1, chain: chU > 0.5, ra: lt >= dv.at && lt < dv.at + 1.4 ? [-0.4, -0.9] : [-0.5 + 0.4 * Math.sin(lt * 6), -1.0], sword: null }));
      if (chU > 0) { X.save(); X.globalAlpha = chU; txt('Σ', kx + 50, ky - 90, 54, { bold: true }); ink([[kx + 25, ky - 125], [kx + 78, ky - 125], [kx + 78, ky - 55], [kx + 25, ky - 55], [kx + 25, ky - 125]], 2, 9860, 0.3); X.restore(); }
      for (let i = 0; i < 3; i++) { const t0 = dv.at + i * 0.4, u = U(lt, t0, t0 + 0.5); if (u > 0 && u < 1) txt('d/dx', lerp(kx + 60, 820, u), lerp(ky - 120, 470, u) - Math.sin(u * Math.PI) * 60, 26, { italic: true, bold: true }); bang(820, 470, U(lt, t0 + 0.5, t0 + 0.9), 9870 + i, 26); }
      // the beast: the same marks, small, on the page
      const pts = []; for (let i = 0; i < NB; i++) pts.push(wob(i, hillPt(i, bx, by, 110 * bs, 46 * bs, -1), 1));
      drawMarks(pts, { s: 0.55 * Math.max(0.8, bs) });
      if (hoU > 0) for (const d of [-1, 1]) ink([[bx - 55 * bs, by - 30 * bs + d * 6], [bx - 80 * bs, by - 40 * bs + d * 18 * hoU], [bx - 92 * bs, by - 20 * bs + d * 24 * hoU]], 3, 9880 + d, 0.2);
      if (lt >= gr.at && lt < ch.at) for (let i = 0; i < 4; i++) { const v = (lt * 1.5 + i / 4) % 1; X.save(); X.globalAlpha = 1 - v; txt('!', bx + 40 + i * 14, by - 120 * bs * 0.5 - v * 50, 22, { bold: true }); X.restore(); }
      bang(kx + 60, ky - 80, U(lt, wh.at, wh.at + 0.6), 9890, 70);
      pencils(kx, ky, bx, by);
    });
    dipAt(lt, jg.at, 0.3); return;
  }
  if (lt < tp.at || lt >= hq.at) {
    // police headquarters: the jug's false bottom, the little recorder
    const dawn = lt >= hq.at ? U(lt, hq.at, sd) : 0, open = U(lt, jg.at + 0.6, jg.at + 1.6);
    cam(camMix(ON(640, 400, 1.05), ON(640, 430, 1.25), lt >= hq.at ? dawn : U(lt, jg.at, tp.at)), () => {
      hqRoom(lt, dawn);
      table(640, 520, 520, 9960, 140);
      jug(560, 520, 0.9, 9970, open); recorder(730, 520, 0.9, lt, lt >= hq.at ? lt * 6 : 0, 9980);
      for (let i = 0; i < 4; i++) { const x = [250, 400, 880, 1030][i]; cop(x, 700, 2.4 - (i % 2) * 0.15, 9990 + i * 70, { f: x < 640 ? 1 : -1, look: x < 640 ? 1 : -1, tilt: dawn > 0 ? (x < 640 ? 0.3 : -0.3) * dawn : 0, bob: dawn * 4 }); }
    });
    return;
  }
  // the recording, heard: the same page, the constructors' pencils, the King placed with his feet together
  const down = U(lt, dn.at + 0.3, dn.at + 0.9), kH = [640, 470 - 0.42 * 286];
  let c = camFor(lt, [[tp.at, ON(640, 400, 1.1)], [L[5].t0, ON(760, 420, 1.3)], [L[6].t0, ON(640, 400, 1.1)]], 0.8);
  c = withTight(sh, lt, c, 640, 420, 2.4);
  cam(c, () => {
    pageSet(); line([180, 470], [1100, 470], 1.6, 9870, 0.2); line([640, 140], [640, 650], 1.6, 9871, 0.2); txt('x', 1112, 470, 22, { italic: true }); txt('y', 640, 128, 22, { italic: true });
    radicalSign(860, 470, 110, 120, 1, 9850);
    const pts = []; for (let i = 0; i < NB; i++) pts.push(wob(i, hillPt(i, lerp(905, 760, down), 470, 90 + down * 80, 34 + down * 60, -1), 1)); drawMarks(pts, { s: 0.55 });
    rotAbout(640, 470, down * -1.5, () => krool(640, 470, 0.42, null, lt, { f: 1, look: 1, la: [1.55, 1.6], ra: [1.55, 1.6], closed: down > 0.5 }));
    pencils(640, 470, 900, 470);
  });
};

/* ---------- 6. the requisitions, the mouse, the sealed wagon ---------- */
const FORMS = [
  ['REQUISITION   No. 48999/11K/T', 'quartz, vanadium, steel, copper,', 'platinum, yttrium, thulium, cerium,', 'and most of the other elements;', 'machines and technicians;', 'ALSO: agents, all sorts, as the', 'proper authorities see fit.'],
  ['REQUISITION   No. 48999/12K/T', 'sawdust, one sack;', 'one red velvet curtain on a stand,', '  glass bells at centre, tassel at each corner;', 'six police uniforms, complete, with handcuffs;', 'three tailor’s dummies.', 'All to be returned within 24 hours.'],
  ['Dear Sirs,', 'Kindly send at once:', '(1) one Postmaster General doll,', '     life size, full uniform;', '(2) one light gig, painted green,', '     oil lamp on the left,', '     sign on the back: THINK.   — K.'],
];
function formSheet(k, x, y, u, id) {
  X.save(); X.translate(x, y); X.rotate((k - 1) * 0.04);
  shape(R(-260, -170, 520, 340), { lw: 1.8, id, fill: k === 2 ? '#f6f0dc' : '#efe9d6' }); if (k < 2) { line([-240, -126], [240, -126], 1.2, id + 1, 0.1); }
  FORMS[k].forEach((s, i) => { const v = clamp(u * FORMS[k].length * 1.1 - i); if (v <= 0) return; X.save(); X.beginPath(); X.rect(-250, -160 + i * 42, 500 * v, 42); X.clip(); txt(s, -236, -142 + i * 42, i === 0 && k < 2 ? 18 : 20, { mono: k < 2 && i === 0, italic: k === 2 || i > 0, align: 'left' }); X.restore(); });
  if (k < 2 && u > 0.9) { X.save(); X.translate(150, 120); X.rotate(-0.2); X.globalAlpha = 0.8; ink([[-70, -22], [70, -22], [70, 22], [-70, 22], [-70, -22]], 2.4, id + 3, 0.6, P.red); txt('GRANTED', 0, 0, 24, { bold: true, mono: true, col: P.red }); X.restore(); }
  X.restore();
}
SHOTS.shop = (lt, sd, sh) => {
  const L = sh.lines, fm = cues(sh, 'form'), cf = cue(sh, 'chief'), lb = cue(sh, 'lab'), ms = cue(sh, 'mouse'), wg = cue(sh, 'wagon'), ct = cue(sh, 'curtain'), pw = cue(sh, 'powder'), sl = cue(sh, 'seal'), cn = cue(sh, 'count'), be = cue(sh, 'bells');
  if (lt < cf.at) {
    // the desk: the forms come in, one on another
    cam(ON(640, 380, 1.0), () => {
      X.fillStyle = '#8a6d4c'; X.fillRect(PX0 - 500, PY0 - 500, 2300, 1600); for (let y = -200; y < 900; y += 7) { X.fillStyle = 'rgba(28,24,20,.25)'; X.fillRect(PX0 - 500, y, 2300, 1.2 + hash(y, 9) * 0.8); }
      for (const q of fm) { const u = U(lt, q.at, q.at + 0.5); if (u <= 0) continue; const tx = lerp(1500, 640 + (q.n - 1) * 40, E.out(u)); formSheet(q.n, tx, 380 + (q.n - 1) * 20, U(lt, q.at + 0.4, (fm[q.n + 1] || { at: cf.at }).at - 0.8), 10000 + q.n * 20); }
    });
    dipAt(lt, cf.at, 0.3); return;
  }
  if (lt < lb.at + 0.3) {
    // the Chief of Police reads the letter, and is carried off
    const u = U(lt, cf.at + 0.8, cf.to);
    cam(ON(640, 420, 1.15), () => {
      hqRoom(lt, 1); table(560, 520, 360, 10100, 140); X.save(); X.translate(560, 505); X.scale(0.3, 0.3); X.translate(-560, -505); formSheet(2, 560, 505, 1, 10120); X.restore();
      if (u <= 0) cop(700, 680, 3.6, 10150, { f: -1, look: -1, lookY: 1, tilt: -0.1 });
      else { for (let i = 0; i < 2; i++) micro(lerp(640, 1200, u) + i * 160, 680, 3.0, 10200 + i * 30, { f: 1, walk: 1, ph: lt * 9 + i }); rotAbout(lerp(720, 1280, u), 560, -Math.PI / 2, () => cop(lerp(720, 1280, u), 560, 3.0, 10150, { f: 1, closed: true })); }
    });
    return;
  }
  if (lt < wg.at) {
    // the police laboratory: a tin mouse, soap bubbles, chalk
    const mu = U(lt, ms.at, ms.to), mxp = lerp(320, 980, mu), myp = 470 + Math.sin(mu * 18) * 30;
    cam(camMix(ON(640, 400, 1.0), ON(640, 430, 1.2), U(lt, lb.at, ms.at)), () => {
      hqRoom(lt, 0);
      for (let i = 0; i < 7; i++) cop(240 + i * 130, 440, 1.8, 10310 + i * 70, { f: i < 3 ? 1 : -1, look: lt >= ms.at ? (mxp > 240 + i * 130 ? 1 : -1) : 0, lookY: 1 });
      shape(R(200, 400, 880, 130), { lw: 2, id: 10300, fill: '#3b3a36', h: [0.1, 5, 0.4] });
      if (lt < ms.at) { for (let i = 0; i < 9; i++) shape(R(560 + (i % 3) * 30, 430 + Math.floor(i / 3) * 18, 26, 14), { lw: 1, id: 10400 + i, fill: '#bdb8aa' }); }
      else {
        X.save(); X.beginPath(); X.rect(250, 440, Math.max(0, mxp - 250), 80); X.clip(); txt('HAVE YOU STOPPED LOVING US?', 640, 490, 30, { col: '#f8f6ef', bold: true }); txt('HAVE YOU STOPPED LOVING US?', 641, 491, 30, { col: 'rgba(28,24,20,.35)', bold: true }); X.restore();
        shape(blobPts(mxp, myp, 22, 12, 10450, 20, 0.06), { lw: 1.6, id: 10450, fill: '#a6a39b' }); ball(mxp + 22, myp - 8, 6, 10451, PAT.f, 1.2, '#a6a39b'); ink([[mxp - 22, myp], [mxp - 46, myp + 6 + Math.sin(lt * 20) * 4]], 1.4, 10452, 0.3);
        for (let i = 0; i < 10; i++) { const v = (lt * 0.6 + i / 10) % 1, bx_ = mxp - 30 - hash(10460, i) * 260 * v, by_ = myp - 30 - v * 220; X.save(); X.globalAlpha = 1 - v; X.beginPath(); X.arc(bx_, by_, 6 + 10 * hash(10461, i), 0, 6.2832); X.lineWidth = 1.2; X.strokeStyle = P.ink; X.stroke(); X.restore(); }
      }
    });
    dipAt(lt, wg.at, 0.3); return;
  }
  // the palace door: the refrigerator wagon on three hundred wheels
  const ctU = U(lt, ct.at, ct.to), pwU = U(lt, pw.at, pw.to), closed = lt >= sl.at, ring = lt >= be.at ? U(lt, be.at, be.at + 2.4) : 0;
  const counting = lt >= cn.at && lt < be.at + 0.3;
  if (counting) {
    // the stopwatch, counted out
    const v = U(lt, cn.at, cn.to);
    cam(ON(640, 360, 1.0), () => {
      X.fillStyle = P.paper; X.fillRect(PX0 - 500, PY0 - 500, 2300, 1600); X.save(); X.globalAlpha = 0.3; skyLines(PY0, 700, 900); X.restore();
      ball(640, 380, 210, 10500, PAT.f, 4, '#f6f2e6'); ball(640, 140, 22, 10501, PAT.m, 2, GOLDK);
      for (let i = 0; i < 30; i++) { const a = -Math.PI / 2 + i / 30 * 6.2832; line([640 + Math.cos(a) * (i % 2 ? 180 : 168), 380 + Math.sin(a) * (i % 2 ? 180 : 168)], [640 + Math.cos(a) * 194, 380 + Math.sin(a) * 194], i % 2 ? 1.2 : 2.6, 10510 + i, 0.05); if (i % 2 === 0) txt(String(i), 640 + Math.cos(a) * 146, 380 + Math.sin(a) * 146, 24, {}); }
      const a = -Math.PI / 2 + (14.5 * v) / 30 * 6.2832; line([640, 380], [640 + Math.cos(a) * 175, 380 + Math.sin(a) * 175], 3.4, 10560, 0.05); ball(640, 380, 10, 10561, PAT.d, 1.6);
      if (lt >= be.at) ringArcs(640, 380, U(lt, be.at, be.at + 1.5), 10570, 260);
    });
    return;
  }
  const kH = headPos(860, 660, 0.78);
  let c = camFor(lt, [[wg.at, ON(640, 380, 1.0)], [ct.at - 0.3, ON(520, 420, 1.2)], [sl.at, ON(600, 400, 1.05)], [be.at + 0.3, ON(640, 380, 1.0)]], 0.9);
  c = withTight(sh, lt, c, kH[0], kH[1], 2.6);
  cam(c, () => {
    X.fillStyle = P.paper; X.fillRect(PX0 - 500, PY0 - 500, 2300, 1600); X.save(); X.globalAlpha = 0.4; skyLines(PY0 - 300, 300, 600); X.restore();
    shape(R(-200, 40, 1700, 260), { lw: 2, id: 10600, fill: '#2a241d' }); for (let i = 0; i < 8; i++) column(60 + i * 180, 80, 300, 36, 10610 + i * 4);
    lawn(660, 10650);
    fridge(560, 660, 1.0, 10700, { door: closed ? 0 : 1, sealed: closed, inside: (dx, dy, dw, dh) => { X.save(); X.translate(560, 660); if (ctU >= 1) { curtainStand(dx + dw / 2, dy - 8, 0.62, 10750, lt, 0); for (let i = 0; i < 40 * pwU; i++) { X.fillStyle = ['#9a9a9a', '#d8d8d0', '#f4f0e0', '#e0c27a', '#6f9a6a'][i % 5]; X.fillRect(dx + 10 + hash(10760, i) * (dw - 20), dy - 6 - hash(10761, i) * 10, 3, 3); } } X.restore(); } });
    if (ctU > 0 && ctU < 1) { trurlK(lerp(980, 470, ctU), 660, 0.7, sh, lt, { f: -1, walk: 1, ph: lt * 8, ra: [-0.2, -0.3] }); curtainStand(lerp(920, 410, ctU), 600, 0.62, 10750, lt, 0); }
    if (ring > 0 && ring < 1) ringArcs(560, 520, ring, 10780, 120);
    const jump = ring > 0 ? pulse(lt, be.at, 0.4) * 30 : 0;
    for (let i = 0; i < 5; i++) cop(1000 + i * 52, 660 - (i % 2) * 10, 1.7, 10800 + i * 70, { f: -1, look: -1, bob: jump });
    if (!(ctU > 0 && ctU < 1)) trurlK(700, 660, 0.78, sh, lt, { f: -1, look: -1, ra: pwU > 0 && pwU < 1 ? [-0.6 + 0.2 * Math.sin(lt * 20), -0.8] : undefined });
    klapK(860, 660, 0.78, sh, lt, { f: -1, look: -1 });
  });
};

/* ---------- 7. the hunt ---------- */
function fieldSet(lt, scroll = 0) {
  X.fillStyle = P.paper; X.fillRect(PX0 - 500, PY0 - 500, 2300, 1600); X.save(); X.globalAlpha = 0.45; skyLines(PY0 - 300, 520, 860); X.restore();
  const far = [[PX0 - 500, 470]]; for (let i = 0; i <= 24; i++) far.push([-500 + i * 100, 420 - 50 * hash(10900, i) - 30 * Math.sin(i * 0.7)]); far.push([1800, 470]); shape(far, { lw: 1.4, id: 10901, fill: '#c7c09e', h: [0.3, 4, 0.5] });
  X.fillStyle = '#e4dcc3'; X.fillRect(PX0 - 500, 470, 2300, 600); for (let yy = 474, k = 0; yy < 780; yy += 5 + k * 0.5, k++) { X.fillStyle = P.ink; X.fillRect(PX0 - 500, yy, 2300, 0.45 + k * 0.05); } line([PX0 - 500, 470], [PX1 + 500, 470], 2.4, 10902, 0.3);
  for (let i = 0; i < 30; i++) { const wx = -300 + hash(10910, i) * 1900, wy = 500 + hash(10911, i) * 220; for (let k = 0; k < 4; k++) line([wx + k * 4, wy], [wx + k * 4 + (k - 1.5) * 3, wy - 10 - k * 2], 1, 10920 + i * 4 + k, 0.1); }
}
const BCX = 700, BCY = 640, BW = 300, BH_ = 120;
SHOTS.hunt = (lt, sd, sh) => {
  const L = sh.lines, ir = cue(sh, 'irons'), fd = cue(sh, 'field'), tr = cue(sh, 'trumpet'), wg = cue(sh, 'wagon'), dr = cue(sh, 'door'), bm = cue(sh, 'boom'), ct = cue(sh, 'curtain'), fm = cue(sh, 'form'), hd = cue(sh, 'hounds'), ey = cue(sh, 'eyes');
  const c0 = cue(sh, 'cut', 0), gw = cue(sh, 'grow'), c1 = cue(sh, 'cut', 1), chp = cue(sh, 'chop'), rg = cue(sh, 'regroup'), yw = cue(sh, 'yawn'), fi = cue(sh, 'fire'), ns = cue(sh, 'nose'), lp = cue(sh, 'leap'), wh = cue(sh, 'whistle'), cf = cue(sh, 'cuff'), gg = cue(sh, 'gig'), aw = cue(sh, 'away');
  if (lt < fd.at) {
    // the dungeon: chains, and Trurl giggling
    const gig_ = lt >= ir.at ? Math.sin(lt * 18) * 0.08 : 0;
    cam(ON(560, 420, 1.2), () => {
      wallRoomStone(lt); windowBars(640, 200, 120, 90, 11000);
      trurlK(480, 650, 0.8, sh, lt, { f: 1, rags: true, chains: true, tilt: gig_, closed: lt >= ir.at && Math.floor(lt * 4) % 2 === 0, ra: [1.2, 1.4], la: [1.6, 1.3] });
      klapK(720, 650, 0.8, sh, lt, { f: -1, rags: true, chains: true, look: -1, ra: [1.2, 1.4], la: [1.6, 1.3] });
      micro(900, 650, 2.8, 11020, { f: -1, look: -1, wave: 0.5 + 0.5 * Math.sin(lt * 10) }); if (Math.sin(lt * 10) > 0.9) star(820, 560, 10, 11030, P.ink, 6);
      protozor(1100, 650, 0.72, null, lt, { f: -1, noRetinue: true });
    });
    dipAt(lt, fd.at, 0.3); return;
  }
  // which formation the marks are in
  const pts = []; let showBeast = lt >= bm.at, eyes = 0, kx = 260, ky = 640, mounted = true, kra, kla, sword = null, kf = 1, onFoot = false;
  const kHit = (t) => swingAt(lt, [t]);
  for (let i = 0; i < NB; i++) {
    let p;
    if (lt < ct.at) { const u = U(lt, bm.at, bm.at + 1.2); const from = [480, 470], to = [BCX, BCY - 60]; const c_ = [lerp(from[0], to[0], u), lerp(from[1], to[1], u) - Math.sin(u * Math.PI) * 220]; p = stormPt(i, c_[0], c_[1], 70, lt); }
    else if (lt < fm.at) { p = stormPt(i, BCX, BCY - 40, 80 - 30 * U(lt, ct.at, fm.at), lt); }
    else if (lt < c0.at) { p = morphPt(i, stormPt(i, BCX, BCY - 40, 50, fm.at), hillPt(i, BCX, BCY, BW, BH_, -1), U(lt, fm.at, fm.to)); }
    else if (lt < c1.at) {
      const cutU = U(lt, c0.at, c0.at + 0.8), headOn = hillPt(i, BCX, BCY, BW, BH_, -1);
      if (i < HEADN) { const off = [BCX - 170 + (BH[i].u - 0.5) * 44, BCY + 60 - Math.abs(Math.sin(BH[i].a * 6)) * 26]; p = morphPt(i, headOn, off, cutU, 70, 0.2); }
      else if (i < HEADN * 2) { const B = hillPt(i - HEADN, BCX, BCY, BW, BH_, -1); p = morphPt(i, hillPt(i, BCX, BCY, BW, BH_, -1, { noHead: true }), B, U(lt, gw.at, gw.at + 0.8)); }
      else p = hillPt(i, BCX, BCY, BW, BH_, -1, { noHead: true });
    }
    else if (lt < chp.at) {
      const u = U(lt, c1.at, c1.at + 0.9), base = i < HEADN ? [BCX - 260, BCY - 10] : hillPt(i, BCX, BCY, BW, BH_, -1, { noHead: true });
      if (i < HEADN) { const run = lt * 1.3; const hx = BCX + Math.sin(run) * 60, hy = BCY + 30 - Math.abs(Math.sin(run * 4)) * 26; p = morphPt(i, [BCX - 170 + (BH[i].u - 0.5) * 44, BCY + 60 - Math.abs(Math.sin(BH[i].a * 6)) * 26], clumpPt(i, hx, hy, 26), clamp(u * 2)); }
      else { const side = BH[i].g < 0.5 ? -1 : 1, j = i < HEADN * 2 ? i - HEADN : i; p = morphPt(i, base, hillPt(j, BCX + side * 200, BCY - 10, BW * 0.6, BH_ * 0.72, side), u, 40); }
    }
    else if (lt < yw.at + 1.0) {
      const prev = i < HEADN ? clumpPt(i, BCX, BCY + 30, 26) : hillPt(i < HEADN * 2 ? i - HEADN : i, BCX + (BH[i].g < 0.5 ? -200 : 200), BCY - 10, BW * 0.6, BH_ * 0.72, 1);
      const j = Math.floor(BH[i].c * 14), cl = clumpPt(i, BCX - 420 + j * 62 + Math.sin(lt * 3 + j) * 6, BCY + 20 + (j % 3) * 14, 22);
      const back = clumpPt(i, BCX - 260 + j * 38, BCY + 6, 18);
      const u1 = U(lt, chp.at, chp.to), u2 = U(lt, rg.at - 0.5, rg.at + 0.2), u3 = U(lt, rg.at + 0.2, rg.to + 0.3);
      p = u3 > 0 ? morphPt(i, back, hillPt(i, BCX, BCY, BW, BH_, -1), u3, 30) : u2 > 0 ? morphPt(i, cl, back, u2) : morphPt(i, prev, cl, u1, 50);
    }
    else if (lt < lp.at) { const sq = lt >= fi.at + 0.8 ? 0.72 : 1; p = hillPt(i, BCX, BCY, BW * (sq < 1 ? 1.1 : 1), BH_ * sq, -1); }
    else { const u = U(lt, lp.at, lp.to); const k = i % 3, tgt = [480 + k * 70, 330 + (k === 2 ? 40 : 0)]; p = morphPt(i, hillPt(i, BCX, BCY, BW * 1.1, BH_ * 0.72, -1), clumpPt(i, tgt[0], tgt[1] + 20, 30), u, 260, 0.3); }
    pts.push(wob(i, p, 1.2));
  }
  // the King's place
  if (lt < hd.at) { kx = lerp(-200, 240, E.out(U(lt, fd.at, fd.at + 4.0))); }
  else if (lt < chp.at + 1.5) { kx = lt >= c0.at - 1.2 ? lerp(240, BCX - 330, E.io(U(lt, c0.at - 1.2, c0.at - 0.2))) : 240; if (lt >= c0.at + 0.6) kx = lerp(BCX - 330, BCX - 430, U(lt, c0.at + 0.6, c0.at + 1.4)); sword = -0.6 + kHit(c0.at) * -1.6 + kHit(c1.at) * -1.6 + (lt >= chp.at && lt < chp.to ? Math.sin(lt * 18) * 1.2 : 0); }
  else { mounted = lt < fi.at - 1.4; kx = mounted ? BCX - 430 : 230; onFoot = !mounted; }
  if (onFoot && lt >= lp.at) { kx = lerp(230, 700, E.io(U(lt, lp.at, lp.to))); }
  const kHead = mounted ? [kx + 10, ky - 22 - 0.62 * 286] : headPos(kx, ky, 0.78);
  // cameras
  const cpH = [480, 330];
  let c = camFor(lt, [[fd.at, ON(640, 360, 0.95)], [wg.at, ON(820, 400, 1.05)], [ct.at, ON(700, 420, 1.0)], [hd.at, ON(560, 440, 1.0)], [c0.at - 1.2, ON(560, 460, 1.15)], [c1.at - 0.5, ON(640, 450, 1.05)], [chp.at - 0.3, ON(640, 450, 1.0)], [fi.at - 1.4, ON(560, 440, 0.95)], [ns.at - 0.2, ON(560, 490, 1.35)], [lp.at, ON(620, 380, 0.95)], [wh.at, ON(600, 460, 1.15)], [cf.at, ON(640, 440, 1.0)], [aw.at, ON(760, 440, 0.95)]], 0.8);
  c = withTight(sh, lt, c, cpH[0], 640 - 2.2 * 46 + 6, 2.6);
  c = shakeCam(c, lt >= bm.at && lt < bm.at + 0.5 ? 8 * (1 - U(lt, bm.at, bm.at + 0.5)) : lt >= fi.at && lt < fi.at + 0.5 ? 6 : 0, lt);
  cam(c, () => {
    fieldSet(lt);
    // the procession
    const procX = lerp(-500, 0, E.out(U(lt, fd.at, fd.at + 4.0)));
    for (let i = 0; i < 4; i++) herald(procX + 60 + i * 50, 600 - (i % 2) * 8, 1.7, 11100 + i * 30, { f: 1, up: lt >= tr.at && lt < tr.at + 3 });
    cannon(procX + 120, 520, 0.7, 11200, { elev: 0.3 }); for (let i = 0; i < 5; i++) micro(procX + 40 + i * 44, 520, 1.4, 11220 + i * 30, { f: 1, look: 1 });
    // the wagon
    const wx = lerp(1500, 1080, E.out(U(lt, wg.at, wg.to)));
    if (lt >= wg.at) fridge(wx, 600, 0.75, 11300, { door: U(lt, dr.at, dr.at + 0.5), gun: true });
    if (lt >= bm.at && lt < bm.at + 1.6) { const v = U(lt, bm.at, bm.at + 1.6); X.save(); X.globalAlpha = 1 - v; shape(blobPts(wx - 70, 440, 50 + v * 90, 40 + v * 60, 11350, 24, 0.25), { lw: 1.4, id: 11350, fill: '#e8cf72', h: [0.6, 5, 0.4] }); X.restore(); }
    // the curtain, floating down
    if (lt >= ct.at) { const v = U(lt, ct.at, ct.to), cy_ = lerp(300, BCY - 6, E.out(v)), sw = Math.sin(lt * 3) * 30 * (1 - v); X.save(); X.translate(BCX - 160 + sw, cy_); X.rotate(Math.sin(lt * 2.5) * 0.3 * (1 - v)); const cl = v < 1 ? [[-60, -10], [60, -14], [56, 10 + 20 * (1 - v)], [-56, 12 + 20 * (1 - v)]] : [[-70, -4], [70, -6], [70, 6], [-70, 6]]; shape(cl, { lw: 1.6, id: 11400, fill: VELVET, h: [0.3, 5, 0.5] }); bellCluster(0, 0, 0.8, 11410, lt, v < 1 ? 1 : 0); X.restore(); }
    // hounds
    if (lt >= hd.at && lt < c0.at) for (let i = 0; i < 6; i++) { const run = U(lt, hd.at, hd.to), hit = i % 2 === 0 && lt >= ey.at, bk = hit ? E.out(U(lt, ey.at, ey.at + 0.8)) : 0; const hx = lerp(-100 + i * 50, BCX - 220 + i * 18, E.io(run)) - bk * 160; hound(hx, 650 + (i % 3) * 16, 1.0, 11500 + i * 40, lt, { f: 1, run: run < 1 && !hit ? 1 : hit ? 0 : 0.4, rot: bk * -0.8, smoke: hit ? 1 : 0 }); }
    // the King, on his steed or on foot
    const rideRun = (lt < hd.at && lt > fd.at) || (lt >= c0.at - 1.2 && lt < c0.at - 0.2);
    if (mounted) { steed(kx, ky, 0.62, 11600, lt, { run: rideRun ? 1 : 0 }); krool(kx + 10, ky - 22, 0.62, null, lt, { seated: true, f: 1, look: 1, sword: sword ?? -0.9, ra: sword !== null ? [-0.9 + (sword + 0.6) * 0.6, sword] : [-0.3, -0.9] }); }
    else {
      const cuffed = lt >= cf.at, gone = lt >= gg.at;
      if (lt < gg.at + (gg.to - gg.at) * 0.5) { if (lt < lp.at) { cannon(330, ky, 0.9, 11650, { elev: 0.05, len: 150, col: '#4a4038' }); } steed(140, ky, 0.62, 11600, lt, {}); krool(kx, ky, 0.78, null, lt, { f: lt >= lp.to ? -1 : 1, alpha: 1 - U(lt, gg.at, gg.at + (gg.to - gg.at) * 0.5), look: lt >= lp.at ? 0 : 1, lookY: lt >= lp.at && lt < lp.to ? -1 : 0, cuffed, ra: cuffed ? [1.0, 0.6] : lt >= lp.to ? [-0.4, -2.0] : undefined, la: cuffed ? [1.4, 0.2] : lt >= lp.to ? [-2.6, -1.6] : undefined, mouth: lt >= lp.to && lt < cf.at ? 0.4 : undefined }); }
      if (lt >= fi.at && lt < fi.at + 0.9) { const v = U(lt, fi.at, fi.at + 0.9), sx = lerp(480, BCX - 60, v); X.save(); X.setLineDash([5, 4]); X.beginPath(); X.arc(sx, ky - 64, 18 + Math.sin(lt * 40) * 4, 0, 6.2832); X.lineWidth = 2; X.strokeStyle = P.ink; X.stroke(); X.setLineDash([]); X.restore(); }
    }
    // the beast
    if (showBeast && lt < lp.to + 0.4) {
      const al = lt >= lp.to ? 1 - U(lt, lp.to, lp.to + 0.4) : 1;
      if (lt >= fm.at && lt < lp.at) beastShadow(BCX, BCY, BW);
      drawMarks(pts, { s: 1, alpha: al });
      const hc = lt < c0.at || lt >= rg.to ? [BCX - BW * 0.46, BCY - BH_ * 0.45] : lt < c1.at ? [BCX - BW * 0.46, BCY - BH_ * 0.45] : null;
      if (lt >= ey.at && hc && lt < lp.at) { const sq = lt >= fi.at + 0.8 ? 0.72 : 1; beastEyes(hc[0], BCY - BH_ * 0.45 * sq, 1.4, lt < c0.at ? E.out(U(lt, ey.at - 0.3, ey.at)) : (lt >= gw.at || lt >= rg.to) ? 1 : 0, lt < ey.at + 0.6 ? 1 : 0, -1); }
      if (lt >= ey.at && lt < ey.at + 0.6) for (const hxx of [BCX - 220, BCX - 184]) laser([BCX - BW * 0.46, BCY - BH_ * 0.45], [hxx, 630], U(lt, ey.at, ey.at + 0.6), 11700 + hxx);
      if (lt >= c1.at && lt < chp.at) for (const hp of [[BCX + Math.sin(lt * 1.3) * 60, BCY + 30 - Math.abs(Math.sin(lt * 1.3 * 4)) * 26]]) { if (U(lt, c1.at, c1.at + 0.5) >= 1) { for (const d of [-1, 1]) line([hp[0] + d * 8, hp[1] + 4], [hp[0] + d * 8 + Math.sin(lt * 20 + d) * 8, hp[1] + 22], 2, 11720 + d, 0.1); beastEyes(hp[0] - 6, hp[1] - 14, 0.9, 1, 0, -1); } }
      if (lt >= yw.at && lt < yw.at + 1.2) { X.beginPath(); X.ellipse(BCX - BW * 0.46, BCY - BH_ * 0.3, 14, 10 * Math.sin(U(lt, yw.at, yw.at + 1.2) * Math.PI), 0, 0, 6.2832); X.fillStyle = P.ink; X.fill(); }
      // thumbing its nose: one long arm of marks, a hand, a waggle
      if (lt >= ns.at && lt < ns.to) { const u = E.out(U(lt, ns.at, ns.at + 0.4)), nx = BCX - BW * 0.46 - 22, ny = BCY - BH_ * 0.72 * 0.45; const arm = []; for (let i = 0; i < 12; i++) { const v = i / 11; arm.push([lerp(BCX - 60, nx - 10, v * u), lerp(BCY - 30, ny - 4, v * u) - Math.sin(v * Math.PI) * 50 * u]); } ink(arm, 11, 11750, 0.8); ink(arm, 5, 11751, 0.8, OLIVE); for (let k = 2; k < 12; k += 2) { const [ax, ay] = arm[k]; for (let q = 0; q < 3; q++) line([ax, ay], [ax + (hash(11760, k * 3 + q) - 0.5) * 14, ay - 8 - hash(11761, k * 3 + q) * 8], 1.2, 11762 + k * 3 + q, 0.1); } if (u > 0.9) { const hx = nx - 8, hy = ny - 4; line([nx + 6, ny], [hx, hy], 5, 11749, 0.1); ball(hx, hy, 13, 11752, PAT.f, 1.6, '#9c9168'); for (let k = 0; k < 4; k++) { const wa = Math.sin(lt * 18 + k * 1.3) * 0.35; line([hx - 6, hy - 6 + k * 5], [hx - 34 - k * 2, hy - 30 + k * 10 + wa * 14], 4.4, 11753 + k, 0.1); } } }
    }
    // the three policemen
    if (lt >= lp.at + (lp.to - lp.at) * 0.6) {
      const al = U(lt, lp.at + (lp.to - lp.at) * 0.6, lp.to), fall = U(lt, lp.to, lp.to + 0.8), gone = lt >= gg.to;
      const ps = [[480, lerp(330, 640, E.in(fall))], [570, lerp(330, 640, E.in(fall))], [620, lerp(370, 640, E.in(fall))]];
      if (!gone) {
        if (lt < gg.at) { cop(ps[0][0], ps[0][1], 2.2, 11800, { alpha: al, f: -1, look: -1, mouth: sayAt(sh, 'O', lt), whistle: lt >= wh.at && lt < wh.at + 0.6, wave: lt >= cf.at - 0.4 && lt < cf.at + 0.4 ? 1 : 0 }); cop(ps[1][0], ps[1][1], 2.2, 11870, { alpha: al, f: -1, look: -1, wave: fall < 1 ? 1 : 0 }); if (fall >= 1) shape(R(ps[1][0] - 30, ps[1][1] - 70, 18, 12), { lw: 1, id: 11880, fill: '#f6f0dc' }); rotAbout(ps[2][0], ps[2][1], fall < 1 ? -Math.PI / 2 : 0, () => cop(ps[2][0], ps[2][1], 2.2, 11940, { alpha: al, f: -1, look: -1 })); }
        else { const gu = U(lt, gg.at, gg.to); X.save(); X.globalAlpha = 1 - gu; cop(ps[2][0], ps[2][1], 2.2, 11940, { f: -1 }); X.restore(); }
      }
      if (lt >= gg.at) {
        const gu = U(lt, gg.at, gg.to), au = E.in(U(lt, aw.at, aw.to)), gx = 640 + au * 1100;
        X.save(); X.globalAlpha = gu; gig(gx, 640, 1.0, 12000, lt, { spin: au * 40 });
        if (gu > 0.5) { krool(gx - 10, 600, 0.6, null, lt, { seated: true, f: 1, look: -1, cuffed: true, ra: [1.0, 0.6], la: [1.4, 0.2], crownTilt: Math.sin(lt * 9) * 0.2 * au }); cop(gx - 60, 560, 2.0, 11800, { f: 1, look: 1 }); cop(gx + 70, 580, 2.0, 11870, { f: 1, look: 1 }); }
        X.restore(); if (au > 0) dustCloud(gx - 80, 640, 90, lt, 12100, 1);
      }
    }
  });
};

/* ---------- 8. the sentence, and the letter ---------- */
function torch(x, y, lt, id) { line([x, y], [x, y + 60], 4, id, 0.2); for (let i = 0; i < 3; i++) { const fl = 1 + 0.25 * Math.sin(lt * (11 + i * 3) + i); shape([[x - 12 * fl, y], [x + 12 * fl, y], [x + Math.sin(lt * 7 + i) * 6, y - 40 * fl + i * 8]], { lw: 1.2, id: id + 1 + i, fill: i === 1 ? '#f2d27a' : P.amber }); } X.save(); X.globalAlpha = 0.12; X.beginPath(); X.arc(x, y - 10, 120, 0, 6.2832); X.fillStyle = P.amber; X.fill(); X.restore(); }
function letterSheet(x, y, u, id) {
  shape(R(x - 280, y - 190, 560, 380), { lw: 2, id, fill: '#f6f0dc' });
  const ls = ['To my Great Chancellor:', 'I am held in a cave, I know not where,', 'by one beast wearing three uniforms.', 'Meet every demand the constructors make,', 'or you will not see me whole again.', '', 'KROOL, his hand and seal'];
  ls.forEach((s, i) => { const v = clamp(u * ls.length * 1.2 - i); if (v <= 0) return; X.save(); X.beginPath(); X.rect(x - 270, y - 170 + i * 44, 540 * v, 44); X.clip(); txt(s, x - 250, y - 148 + i * 44, 22, { italic: true, align: 'left' }); X.restore(); });
  ball(x + 190, y + 120, 34, id + 1, PAT.m, 2, PURPLE); spikyCrown(x + 190, y + 132, 0.55, id + 2);
}
SHOTS.sentence = (lt, sd, sh) => {
  const L = sh.lines, en = cue(sh, 'enter'), hn = cue(sh, 'hand'), du = cue(sh, 'dust'), le = cue(sh, 'letter'), un = cue(sh, 'unchain');
  if (lt >= le.at && lt < le.to + 0.2) {
    cam(camMix(ON(640, 360, 1.0), ON(660, 380, 1.15), U(lt, le.at, le.to)), () => { X.fillStyle = '#2a241d'; X.fillRect(PX0 - 500, PY0 - 500, 2300, 1600); letterSheet(640, 370, U(lt, le.at + 0.3, le.to - 0.6), 12200); torch(1180, 160, lt, 12210); });
    return;
  }
  const tH = headPos(420, 660, 0.82), free = lt >= un.at;
  let c = camFor(lt, [[0, ON(640, 380, 1.0)], [L[1].t0 - 0.2, ON(860, 360, 1.2)], [L[2].t0 - 0.2, ON(500, 420, 1.2)], [en.at, ON(640, 400, 1.0)], [hn.at - 0.4, ON(820, 400, 1.15)], [le.to + 0.2, ON(520, 420, 1.1)]], 0.9);
  c = withTight(sh, lt, c, tH[0], tH[1], 2.6);
  cam(c, () => {
    darkWall2(560, 3.0); X.fillStyle = '#cfc8b8'; X.fillRect(PX0 - 500, 560, 2300, 600); floorLines(564, 760, 12300); line([PX0 - 500, 560], [PX1 + 500, 560], 2.4, 12301, 0.3);
    for (const tx of [180, 640, 1100]) torch(tx, 200, lt, 12310 + tx);
    chancellor(980, 560, 0.8, sh, lt, { f: -1, look: -1, ra: lt >= hn.at && lt < du.to ? [0.0, -0.3] : undefined });
    shape(R(860, 400, 240, 180), { lw: 2.4, id: 12320, fill: '#5c4630', h: [Math.PI / 2, 5, 0.5] });
    const raised = lt >= L[6].t0 - 0.2;
    trurlK(420, 660, 0.82, sh, lt, { f: 1, rags: true, chains: !free, ra: raised ? [-1.3, -1.9] : [1.2, 1.4], la: raised ? [-1.8, -1.4] : [1.6, 1.3], look: 1 });
    klapK(560, 660, 0.82, sh, lt, { f: 1, rags: true, chains: !free, ra: [1.2, 1.4], la: [1.6, 1.3], look: 1 });
    if (free) { const v = U(lt, un.at, un.at + 0.6); chainBetween([380, lerp(470, 650, E.in(v))], [460, lerp(480, 655, E.in(v))], 10, 12330); chainBetween([520, lerp(470, 650, E.in(v))], [600, lerp(480, 655, E.in(v))], 10, 12331); }
    for (const gx of [260, 720]) guard(gx, 660, 2.6, 12350 + gx, { f: gx < 500 ? 1 : -1, look: lt >= en.at && lt < du.at ? -1 : (gx < 500 ? 1 : -1), lean: lt >= en.at && lt < en.at + 1.5 ? (gx < 500 ? -0.3 : 0.3) : 0 });
    // the Postmaster
    if (lt >= en.at && lt < du.to + 1.2) {
      const wu = U(lt, en.at, en.to), px = lerp(-80, 760, E.io(wu)), dU = U(lt, du.at, du.to + 1.0);
      if (lt < du.at) postmaster(px, 660, 0.8, sh, lt, { f: 1, walk: wu < 1 ? 1 : 0, ph: lt * 8, jingle: wu < 1 ? 1 : 0, letter: lt < hn.at + 0.4, ra: lt >= hn.at - 0.5 ? [-0.1, -0.2] : undefined });
      else { const pts = []; for (let i = 0; i < NB; i++) { const b = BH[i], sx = 760 + (b.u - 0.5) * 90, sy = 660 - b.v * 280; pts.push([sx + (b.a - 0.5) * 60 * dU, lerp(sy, 660 - b.g * 10, E.in(dU))]); } drawMarks(pts, { s: 0.6, col: '#6a6458', col2: '#3d5d8f', alpha: 1 - U(lt, du.to + 0.6, du.to + 1.2) * 0.4 }); }
    }
  });
};

/* ---------- 9. the ransom, the spaceport, the beast's own terms ---------- */
const NOTE = ['1. A ship, the best there is, to take us home.', '2. Diamonds, four bushels; gold, forty.', '3. A band, a children’s choir, a cheering crowd.', '   Until the ship is ready: no King.', '4. A gold medallion of thanks,', '   carried on board by Protozor.', '5. Protozor comes too, in a cage.'];
function notebook(x, y, u, id) {
  shape(R(x - 320, y - 210, 640, 420), { lw: 2.4, id, fill: '#3b2f2a' }); shape(R(x - 306, y - 198, 300, 396), { lw: 1.4, id: id + 1, fill: '#f4eedb' }); shape(R(x + 6, y - 198, 300, 396), { lw: 1.4, id: id + 2, fill: '#f4eedb' });
  for (let i = 0; i < 10; i++) line([x - 290, y - 150 + i * 36], [x - 20, y - 150 + i * 36], 0.6, id + 10 + i, 0.05); for (let i = 0; i < 10; i++) line([x + 20, y - 150 + i * 36], [x + 290, y - 150 + i * 36], 0.6, id + 20 + i, 0.05);
  txt('TERMS', x - 156, y - 170, 26, { bold: true });
  NOTE.forEach((s, i) => { const v = clamp(u * NOTE.length * 1.05 - i); if (v <= 0) return; const col = i < 4 ? 0 : 1, row = i < 4 ? i : i - 4, ww = s.length > 30 ? 15 : 17; X.save(); X.beginPath(); X.rect(x - 300 + col * 312, y - 150 + row * 72, 290 * v, 72); X.clip();
    const parts = s.length > 32 ? [s.slice(0, s.lastIndexOf(' ', 32)), s.slice(s.lastIndexOf(' ', 32) + 1)] : [s]; parts.forEach((p, j) => txt(p, x - 288 + col * 312, y - 132 + row * 72 + j * 34, ww, { italic: true, align: 'left' })); X.restore(); });
}
function portSet(lt) {
  X.fillStyle = P.paper; X.fillRect(PX0 - 500, PY0 - 500, 2300, 1600); X.save(); X.globalAlpha = 0.45; skyLines(PY0 - 300, 470, 800); X.restore();
  const far = [[PX0 - 500, 470]]; for (let i = 0; i <= 24; i++) far.push([-500 + i * 100, 440 - 30 * hash(12400, i)]); far.push([1800, 470]); shape(far, { lw: 1.2, id: 12401, fill: '#c7c09e', h: [0.3, 4, 0.5] });
  X.fillStyle = '#ddd6c4'; X.fillRect(PX0 - 500, 470, 2300, 600); for (let yy = 474, k = 0; yy < 780; yy += 6 + k * 0.5, k++) { X.fillStyle = P.ink; X.fillRect(PX0 - 500, yy, 2300, 0.45 + k * 0.05); } line([PX0 - 500, 470], [PX1 + 500, 470], 2.4, 12402, 0.3);
  shape(R(560, 560, 680, 22), { lw: 2, id: 12403, fill: VELVET, h: [0.1, 3, 0.5] });
}
function choir(x, y, lt, id, sing) { for (let r = 0; r < 2; r++) { shape(R(x - 130 + r * 16, y - 30 + r * 30 - 30, 260 - r * 32, 30), { lw: 1.6, id: id + r, fill: '#cfc8b8', h: [0.1, 3, 0.5] }); for (let i = 0; i < 7 - r; i++) micro(x - 110 + r * 16 + i * 36, y - 30 + r * 30 - 30, 1.0, id + 10 + r * 10 + i, { look: 0, mouth: sing ? 0.5 + 0.5 * Math.sin(lt * 8 + i) : 0 }); } }
function crowd(x, y, n, lt, id, cheer) { for (let i = 0; i < n; i++) { const cx = x + (i % 10) * 34 + Math.floor(i / 10) * 17, cy = y + Math.floor(i / 10) * 16; micro(cx, cy, 0.95 + 0.1 * Math.floor(i / 10), id + i * 20, { look: 1, wave: cheer ? 0.5 + 0.5 * Math.sin(lt * 9 + i) : 0, bob: cheer ? Math.abs(Math.sin(lt * 6 + i)) * 3 : 0 }); } }
function stevedores(lt, u, id) { for (let i = 0; i < 4; i++) { const v = ((lt * 0.25 + i / 4) % 1), x = lerp(560, 860, v), y = lerp(660, 470, v); micro(x, y, 1.6, id + i * 30, { f: 1, walk: 1, ph: lt * 9 + i, look: 1 }); shape(blobPts(x + 2, y - 70, 14, 12, id + 200 + i, 18, 0.1), { lw: 1.2, id: id + 200 + i, fill: '#bfa77a' }); } goldCoins(900, 470, 16, id + 400, 40); for (let i = 0; i < 4; i++) { const v = (lt * 0.9 + i / 4) % 1; coinDot(880 + i * 10, 470 + v * 190, 4.5, id + 420 + i); } }
const PBX = 780, PBY = 640;
SHOTS.ransom = (lt, sd, sh) => {
  const L = sh.lines, ba = cue(sh, 'bath'), nb = cue(sh, 'notebook'), br = cue(sh, 'brain'), sb = cue(sh, 'subset'), po = cue(sh, 'port'), to = cue(sh, 'tooth'), ra = cue(sh, 'radio'), stm = cue(sh, 'storm');
  if (lt < nb.at) {
    cam(ON(640, 360, 1.0), () => { X.fillStyle = DARK; X.fillRect(PX0 - 500, PY0 - 500, 2300, 1600); for (let i = 0; i < 6; i++) { const v = (lt * 0.8 + i / 6) % 1; star(200 + i * 180, 300 - v * 120, 30 + 50 * v, 12500 + i, i % 2 ? P.amber : '#9cc4f4', 12); } for (let i = 0; i < 5; i++) fountain(240 + i * 200, 600, 160, lt + i * 0.2, 12520 + i); X.fillStyle = '#4a5f78'; X.fillRect(PX0 - 500, 600, 2300, 300); });
    dipAt(lt, nb.at, 0.25); return;
  }
  if (lt < br.at) {
    const nu = U(lt, nb.at + 0.2, L[1].t1 - 0.5);
    cam(camMix(ON(640, 380, 1.0), ON(560, 380, 1.12), U(lt, nb.at, br.at)), () => { X.fillStyle = '#8a6d4c'; X.fillRect(PX0 - 500, PY0 - 500, 2300, 1600); for (let y = -200; y < 900; y += 7) { X.fillStyle = 'rgba(28,24,20,.25)'; X.fillRect(PX0 - 500, y, 2300, 1.2 + hash(y, 9) * 0.8); } notebook(640, 380, nu, 12600); });
    dipAt(lt, br.at, 0.3); return;
  }
  if (lt < po.at) {
    // all of it brain: the explanation sheet on an easel, gold being loaded behind
    const pu = U(lt, br.at + 0.6, br.at + 3.0), su = U(lt, sb.at, sb.at + 1.0);
    cam(ON(640, 380, 1.0), () => {
      portSet(lt); infernanda(1040, 470, 0.55, lt, { door: 1 }); stevedores(lt, 1, 12700);
      shape(R(210, 160, 460, 320), { lw: 2.2, id: 12800, fill: '#f4eedb' }); line([260, 480], [220, 660], 3, 12801, 0.2); line([620, 480], [660, 660], 3, 12802, 0.2);
      const pts = []; for (let i = 0; i < NB; i++) pts.push(wob(i, hillPt(i, 440, 400, 300, 140, -1), 0.8)); drawMarks(pts, { s: 0.8 });
      for (let i = 0; i < NB; i += 3) { const lit = hash(i, Math.floor(lt * 6)) < pu * 0.5; if (lit) { X.fillStyle = P.red; X.beginPath(); X.arc(pts[i][0], pts[i][1], 2.6, 0, 6.2832); X.fill(); } }
      if (su > 0) { X.save(); X.globalAlpha = su; for (let k = 0; k < 3; k++) cop(380 + k * 50, 410, 1.2, 12850 + k * 70, { f: -1 }); X.restore(); }
      trurlK(140, 660, 0.72, sh, lt, { f: 1, look: 1, robe: EMERALD, ra: [-0.7, -0.6] }); klapK(760, 660, 0.72, sh, lt, { f: -1, look: -1 });
      crowd(820, 610, 10, lt, 12900, false);
    });
    dipAt(lt, po.at, 0.3); return;
  }
  // the spaceport
  const tu = U(lt, to.at - 0.3, to.at + 0.4), radio = lt >= ra.at ? (lt - ra.at) / 1.2 : 0, su = U(lt, stm.at, stm.to), here = lt >= stm.to;
  const kH = headPos(580, 670, 0.8);
  let c = camFor(lt, [[po.at, ON(640, 380, 0.95)], [to.at - 0.3, ON(560, 440, 1.3)], [stm.at, ON(640, 400, 0.95)], [L[6].t0 - 0.2, ON(680, 440, 1.1)], [L[7].t0, ON(760, 480, 1.25)], [L[9].t0, ON(620, 450, 1.1)]], 0.9);
  c = withTight(sh, lt, c, PBX - 0.95 * 160 * 0.46 * 1, PBY - 50, 2.4);
  cam(c, () => {
    portSet(lt); infernanda(1060, 470, 0.55, lt, { door: 1 });
    choir(240, 560, lt, 13000, lt < stm.at); for (let i = 0; i < 4; i++) herald(380 + i * 40, 560, 1.6, 13100 + i * 30, { f: 1, up: lt < stm.at && Math.sin(lt * 3 + i) > 0 });
    crowd(60, 690, 20, lt, 13200, lt < stm.at);
    trurlK(430, 670, 0.8, sh, lt, { f: 1, look: 1, robe: EMERALD });
    klapK(580, 670, 0.8, sh, lt, { f: 1, look: 1, tooth: tu > 0, ring: radio > 0 && !here ? radio : 0, ra: tu > 0 && !here ? [-1.0, -1.7] : undefined });
    protozor(1180, 690, 0.66, null, lt, { f: -1, noRetinue: true });
    if (su > 0 && !here) { const sx = lerp(1500, PBX, E.io(su)), sy = lerp(380, PBY - 50, E.io(su)), pts = []; for (let i = 0; i < NB; i++) pts.push(stormPt(i, sx, sy, 110 - 50 * su, lt)); drawMarks(pts, { s: 1 }); }
    if (here) { const land = U(lt, stm.to, stm.to + 0.6), pts = []; for (let i = 0; i < NB; i++) pts.push(wob(i, morphPt(i, stormPt(i, PBX, PBY - 50, 60, stm.to), hillPt(i, PBX, PBY, 300, 130, -1), land), 1 + 2 * sayAt(sh, 'B', lt)));
      beastShadow(PBX, PBY, 300); drawMarks(pts, { s: 1 }); if (land >= 1) { beastEyes(PBX - 138, PBY - 58, 1.4, 1, Math.sin(lt * 3) > 0.6 ? 1 : 0, -1); const tl = []; for (let i = 0; i <= 10; i++) { const v = i / 10; tl.push([PBX + 150 + v * 140, PBY - 20 - Math.sin(v * 3 + lt * 4) * 30 * v]); } ink(tl, 5, 13300, 0.6); for (let i = 3; i < 10; i += 2) { const [a, b] = tl[i]; shape([[a - 5, b], [a + 5, b], [a, b - 14]], { lw: 1, id: 13310 + i, fill: P.ink }); } const m = sayAt(sh, 'B', lt); if (m > 0.05) { X.beginPath(); X.ellipse(PBX - 138, PBY - 32, 12, 2 + 8 * m, 0, 0, 6.2832); X.fillStyle = P.ink; X.fill(); } }
      if (land < 1) dustCloud(PBX, PBY, 120, lt, 13350, 1 - land); }
  });
};
SHOTS.rhyme = (lt, sd, sh) => {
  const L = sh.lines, to = cue(sh, 'tooth'), sw = cue(sh, 'switch'), ds = cue(sh, 'dissolve'), wi = cue(sh, 'wind'), as = cue(sh, 'ash'), cg = cue(sh, 'cage');
  const tx = lt < to.at - 0.6 ? 430 : lerp(430, 470, E.io(U(lt, to.at - 0.6, to.at + 0.4)));
  const tH = headPos(tx, 670, 0.8);
  const wob_ = lt >= ds.at && lt < wi.at ? 4 + 6 * U(lt, ds.at, wi.at) : 1 + 2 * sayAt(sh, 'B', lt);
  const blow = U(lt, wi.at, as.at + 1.6), kingU = U(lt, wi.at + 0.3, as.at + 0.8);
  let c = camFor(lt, [[0, ON(700, 440, 1.1)], [to.at - 0.6, ON(600, 450, 1.25)], [sw.at, ON(700, 440, 1.05)], [wi.at, ON(760, 460, 1.15)], [L[6].t0 - 0.3, ON(700, 440, 1.0)], [cg.at, ON(900, 420, 0.95)]], 0.9);
  c = withTight(sh, lt, c, tH[0], tH[1], 2.6);
  cam(c, () => {
    portSet(lt); infernanda(1060, 470, 0.55, lt, { door: 1 });
    choir(240, 560, lt, 13000, false); for (let i = 0; i < 4; i++) herald(380 + i * 40, 560, 1.6, 13100 + i * 30, { f: 1 });
    crowd(60, 690, 20, lt, 13200, lt >= as.at + 1.0);
    // the beast, coming apart
    if (blow < 1) { const pts = []; for (let i = 0; i < NB; i++) { const h = hillPt(i, PBX, PBY, 300, 130, -1), b = BH[i], v = clamp(blow * 1.6 - b.s * 0.6); pts.push(wob(i, [h[0] + v * (240 + b.u * 500), h[1] - v * (60 + b.g * 160) + v * v * 120], wob_)); } X.save(); X.globalAlpha = 1 - blow; drawMarks(pts, { s: 1, col: blow > 0 ? '#4a443c' : P.ink }); X.restore();
      if (lt < wi.at) beastEyes(PBX - 138, PBY - 58, 1.4, lt >= ds.at ? 0.5 + 0.5 * Math.sin(lt * 12) : 1, 0, -1);
      if (lt < ds.at) { const m = sayAt(sh, 'B', lt); if (m > 0.05) { X.beginPath(); X.ellipse(PBX - 138, PBY - 32, 12, 2 + 8 * m, 0, 0, 6.2832); X.fillStyle = P.ink; X.fill(); } }
      if (lt >= ds.at && lt < wi.at) for (const d of [-1, 1]) ink([[PBX - 138 + d * 20, PBY - 70], [PBX - 138 + d * 34, PBY - 92 + Math.sin(lt * 16) * 6]], 3, 13400 + d, 0.2); }
    // the heap of ash, and the King standing in it
    if (lt >= wi.at) { const hu = U(lt, wi.at + 0.3, as.at + 0.6); const heap = blobPts(PBX, PBY - 4, 130 * hu + 10, 22 * hu + 4, 13450, 30, 0.12); X.save(); path(heap); X.clip(); X.fillStyle = '#cfcac0'; X.fillRect(PBX - 160, PBY - 40, 320, 80); X.restore(); stip(heap, 13451, 0.06, 1.6); ink([...heap, heap[0]], 1.4, 13452, 0.6);
      X.save(); X.globalAlpha = kingU; krool(PBX, PBY + 4, 0.8, null, lt, { f: -1, look: -1, dirty: 1, crownTilt: 0.35, crownX: 10, ra: [1.6, 1.8], la: [1.2, 1.5], closed: lt > L[5].t0 - 0.3 && lt < L[5].t1 }); X.restore();
      if (kingU > 0 && kingU < 1) for (let i = 0; i < 5; i++) { const v = (lt * 0.5 + i / 5) % 1; X.save(); X.globalAlpha = (1 - v) * 0.5; ink([[PBX - 160 + v * 400, PBY - 60 - i * 30], [PBX - 100 + v * 420, PBY - 64 - i * 30]], 1.2, 13460 + i, 0.6); X.restore(); } }
    // Trurl, with his own tooth, counting the beast out
    const counting = lt >= sw.at && lt < ds.at, beat = Math.floor((lt - sw.at) * 2.6) % 2;
    klapK(580, 670, 0.8, sh, lt, { f: 1, look: 1, tooth: lt < sw.at + 2, ring: 0, ra: lt < ds.at ? [-1.0, -1.7] : undefined });
    trurlK(tx, 670, 0.8, sh, lt, { f: 1, look: 1, robe: EMERALD, tooth: lt >= to.at && lt < ds.at + 0.5, ring: counting ? (lt - sw.at) / 1.2 : 0, ra: counting ? [-0.3 + beat * 0.25, -0.15 - beat * 0.3] : undefined, la: lt >= to.at && lt < sw.at ? [1.2, 1.0] : undefined });
    // Protozor, into his cage
    const cu = U(lt, cg.at, cg.to), px = lerp(1180, 1040, E.io(cu));
    protozor(px, 690, 0.66, null, lt, { f: -1, noRetinue: true, walk: cu > 0 && cu < 1 ? 1 : 0, ph: lt * 7 });
    for (const gx of [px + 70, px - 70]) guard(gx, 690, 2.2, 13500 + (gx > px ? 1 : 0) * 40, { f: -1, look: -1, walk: cu > 0 && cu < 1 ? 1 : 0, ph: lt * 7 });
    X.save(); X.globalAlpha = 0.5 + 0.5 * cu; shape(R(970, 480, 150, 220), { lw: 2.6, id: 13550, fill: null }); for (let i = 0; i <= 6; i++) line([970 + i * 25, 480], [970 + i * 25, 700], 2.2, 13560 + i, 0.2); X.restore();
  });
};

/* ---------- title and end ---------- */
function titleBeast(lt, cx, cy, s = 1, phase = 0) {
  const cyc = ((lt + phase) % 6) / 6, u = cyc < 0.5 ? E.io(clamp((cyc - 0.15) / 0.25)) : 1 - E.io(clamp((cyc - 0.65) / 0.25));
  const pts = []; for (let i = 0; i < NB; i++) { const A = hillPt(i, cx, cy, 260 * s, 100 * s, -1), side = BH[i].g < 0.5 ? -1 : 1, B = i < HEADN ? clumpPt(i, cx, cy + 6, 18 * s) : hillPt(i < HEADN * 2 ? i - HEADN : i, cx + side * 170 * s, cy, 160 * s, 74 * s, side); pts.push(wob(i, morphPt(i, A, B, u, 40 * s), 1)); }
  beastShadow(cx, cy, 300 * s, 0.15); drawMarks(pts, { s }); return u;
}
SHOTS.title = (lt, sd) => {
  X.fillStyle = P.paper; X.fillRect(0, 0, W, H);
  txt('THE SECOND SALLY,', CX, 110, 40, {}); txt('OR THE OFFER OF KING KROOL', CX, 166, 58, {}); txt('a beast that is all brain, and a king who cannot catch it', CX, 232, 28, { italic: true }); txt('after Stanisław Lem, The Cyberiad', CX, 278, 22, { italic: true });
  titleBeast(lt, CX, 560, 1.0, 0.6);
};
SHOTS.end = (lt, sd) => {
  X.fillStyle = P.paper; X.fillRect(0, 0, W, H); X.globalAlpha = seg(lt, 0.4, 1.6);
  txt('THE OFFER OF KING KROOL', CX, 120, 44, {}); txt('after Stanisław Lem, The Cyberiad', CX, 172, 24, { italic: true }); X.globalAlpha = 1;
  const heap = blobPts(CX, 600, 150, 26, 13600, 30, 0.12); X.save(); path(heap); X.clip(); X.fillStyle = '#cfcac0'; X.fillRect(CX - 170, 560, 340, 80); X.restore(); stip(heap, 13601, 0.06, 1.6); ink([...heap, heap[0]], 1.4, 13602, 0.6);
  spikyCrown(CX + 40, 588, 0.8, 13610, 0.5);
  const pts = []; for (let i = 0; i < NB; i++) { const b = BH[i], v = clamp((lt - 1.5) / 5 - b.s * 0.3); pts.push([CX - 120 + b.u * 240 + v * (300 + b.l * 400), 590 - b.v * 18 - v * (40 + b.g * 120)]); } X.save(); X.globalAlpha = 1 - clamp((lt - 2) / 5); drawMarks(pts, { s: 0.6, col: '#6a6458' }); X.restore();
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
  const fade = sh.shot === 'title' ? Math.max(1 - seg(lt, 0, 0.6), seg(lt, sd - 0.6, sd)) : sh.shot === 'end' ? 1 - seg(lt, 0, 0.5) : sh.shot === 'rhyme' ? Math.max(1 - seg(lt, 0, 0.3), seg(lt, sd - 1.2, sd)) : Math.max(1 - seg(lt, 0, 0.35), seg(lt, sd - 0.35, sd));
  if (fade > 0) { X.fillStyle = P.paper; X.globalAlpha = fade; X.fillRect(0, 0, W, H); X.globalAlpha = 1; }
  border();
};
(async () => {
  T = await (await fetch('timing/kk.json')).json();
  await document.fonts.ready; await Promise.all(['IM Fell English', 'IBM Plex Mono'].map((n) => document.fonts.load(`20px "${n}"`)));
  X = document.getElementById('film').getContext('2d');
  signPts();
  window.__NF = Math.ceil(T.dur * 24); window.__T = T; window.__ready = true;
})();
