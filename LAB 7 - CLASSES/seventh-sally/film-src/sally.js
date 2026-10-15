/* The Seventh Sally: an engraved multiplane film after the Story 12 cards.
   Scale is the subject: the king is drawn huge, the citizens tiny, and the camera
   keeps crossing that gap. Every shot is built from depth planes. */
const W = 1280, H = 720, PX0 = 22, PY0 = 22, PX1 = 1258, PY1 = 698, CX = 640, CY = 360;
let KEYROT = 0;
const DARK = '#2a241d';
let T = null;

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

/* ---------- the score, read from timing/sally.json ---------- */
function sayAt(sh, who, lt) { for (const l of sh.lines) if (l.who === who && lt >= l.t0 && lt < l.t1) return l.env[Math.min(l.env.length - 1, Math.floor((lt - l.t0) * 24))] || 0; return 0; }
function talking(sh, who, lt) { return sh.lines.some((l) => l.who === who && lt >= l.t0 - 0.1 && lt < l.t1 + 0.2); }
/* the fulcrum line: a hard cut in before it starts, a hard cut out after it ends */
function onLine(sh, lt, pre = 0.6, post = 1.3) { const l = sh.lines.find((x) => x.line); return !!l && lt >= l.t0 - pre && lt < l.t1 + post; }
const cue = (sh, k, i = 0) => sh.cues.filter((c) => c.k === k)[i];
const shotNamed = (n) => T.shots.find((s) => s.shot === n);

const SHOTS = {};

SHOTS.cold = (lt, sd, sh) => {
  const tight = onLine(sh, lt, 0.7, 2.0), u = seg(lt, 0.3, sd, E.io);
  const cam = tight ? { z: 5.2 + (lt - 10) * 0.03, x: 4, y: -118 } : { z: lerp(1, 1.8, u), x: 0, y: lerp(70, -10, u) };
  space(cam, 100, lt * 5);
  plane(cam, 4, () => { planet(1040, 150, 46, 101, true); planet(210, 120, 22, 102); });
  plane(cam, 1, () => {
    const ax = 640, ay = 420, ln = sh.lines.find((l) => l.line);
    X.save(); X.globalAlpha = 0.3 * seg(lt, 4, 8); for (let i = 0; i < 46; i++) { const a = -Math.PI * (0.05 + 0.9 * i / 45); line([ax + Math.cos(a) * 60, ay - 160 + Math.sin(a) * 60], [ax + Math.cos(a) * 560, ay - 160 + Math.sin(a) * 560], 0.8, 110 + i, 0.3, P.paper); } X.restore();
    const rk = rock(ax, ay + 70, 150, 120);
    shape(rk, { lw: 2, id: 121, h: [0.9, 5, 0.5], sh: [[ax - 20, ay - 200], [ax + 260, ay - 200], [ax + 260, ay + 300], [ax - 20, ay + 300]], sh2: [[0.9, 2.2, 0.8]] });
    for (let i = 0; i < 7; i++) { const cx = ax - 110 + hash(122, i) * 220, cy = ay + 30 + hash(123, i) * 110, r = 6 + hash(124, i) * 14; X.beginPath(); X.ellipse(cx, cy, r, r * 0.55, 0, 0, 6.283); X.fillStyle = PAT.d; X.fill(); X.lineWidth = 1; X.strokeStyle = P.ink; X.stroke(); }
    const pt = seg(lt, ln.t0 + 0.3, ln.t0 + 1.0) - seg(lt, ln.t1 + 0.9, ln.t1 + 1.8);
    excelsius(ax, ay - 64, 0.34, 130, { point: pt, look: tight ? 0 : 0.8, sway: Math.sin(lt * 0.9) * 0.6, hx: pt * 6, mouth: sayAt(sh, 'E', lt) });
  });
};

SHOTS.title = (lt) => {
  X.fillStyle = P.paper; X.fillRect(0, 0, W, H);
  X.save(); path(R(PX0, PY0, PX1 - PX0, PY1 - PY0)); X.clip();
  const kx = 640, ky = 650;
  for (let i = 0; i < 70; i++) { const a = -Math.PI * (0.03 + 0.94 * i / 69); line([kx + Math.cos(a) * 250, ky - 300 + Math.sin(a) * 120], [kx + Math.cos(a) * 1200, ky - 300 + Math.sin(a) * 900], 0.8, 2000 + i, 0.3); }
  X.restore();
  txt('THE SEVENTH SALLY', CX, 110, 64, {});
  txt("How Trurl’s Own Perfection Led to No Good", CX, 170, 28, { italic: true });
  excelsius(kx, ky, 1.0, 5000, { look: 0 });
};

SHOTS.build = (lt, sd, sh) => {
  const u = seg(lt, 0, sd), cam = { z: lerp(1, 1.18, u), x: lerp(-20, 110, u), y: lerp(-40, -30, u) };
  plane(cam, 3, () => {
    X.fillStyle = P.paper; X.fillRect(-200, -200, 1700, 1200);
    X.save(); path(R(-200, -200, 1700, 720)); X.clip(); hatch(Math.PI / 2, 4, 0.5, [-200, -200, 1500, 520]); X.restore();
    for (const [sx, sy, k] of [[150, 90, 0], [300, 70, 1]]) { shape(R(sx, sy, 120, 150), { lw: 1.3, id: 200 + k }); X.save(); X.translate(sx + 60, sy + 120); X.scale(0.42, 0.42); X.globalAlpha = 0.85; castle(0, 0, 1, 210 + k * 40, { t: 0 }); X.restore(); ball(sx + 60, sy + 6, 4, 230 + k, PAT.f, 1); }
    for (let i = 0; i < 3; i++) { shape(R(1060, 120 + i * 110, 240, 10), { lw: 1.2, id: 240 + i, h: [0, 2.5, 0.6] }); for (let j = 0; j < 5; j++) shape(R(1070 + j * 44, 76 + i * 110, 30, 44), { lw: 1, id: 250 + i * 9 + j, h: [j % 2 ? 0.8 : 1.57, 2.6, 0.6] }); }
  });
  plane(cam, 1.5, () => {
    shape([[-200, 520], [1600, 520], [1600, 1000], [-200, 1000]], { lw: 1.6, id: 300, h: [0.03, 5, 0.5] });
    shape(R(520, 430, 700, 22), { lw: 1.8, id: 301, h: [0, 2.6, 0.7] }); shape(R(540, 452, 24, 260), { lw: 1.4, id: 302, h: [1.57, 3, 0.6] }); shape(R(1170, 452, 24, 260), { lw: 1.4, id: 303, h: [1.57, 3, 0.6] });
    line([600, 430], [640, 300], 2.4, 304); line([640, 300], [720, 250], 2.4, 305); shape([[700, 236], [756, 230], [770, 270], [716, 280]], { lw: 1.6, id: 306, h: [0.5, 2.4, 0.7] });
    const gc = glassCase(900, 352, 330, 150, 320, { key: false });
    gc.back(); X.save(); path(gc.front); X.clip();
    const grow = seg(lt, 1.4, sd - 2.6, E.lin);
    castle(900, 410, 0.62, 330, { grow, t: lt });
    for (let i = 0; i < 26; i++) { const ap = clamp((grow - 0.55 - i * 0.012) * 8); if (ap > 0) tinyMicro(760 + hash(340, i) * 280, 420 + hash(341, i) * 8, 0.32 * ap, 342 + i); }
    X.restore(); gc.frame();
  });
  plane(cam, 1.5, () => {
    const cyc = (lt % 3.2) / 3.2, reach = Math.sin(cyc * Math.PI), tk = talking(sh, 'T', lt);
    constructor_(470, 610, 1.04, 400, { ra: [-0.25 - reach * 0.25, -0.15 + reach * 0.35], la: [1.45, 1.75], look: tk ? 0.4 : 1.2, tilt: tk ? -0.03 : 0.06, mouth: sayAt(sh, 'T', lt) });
  });
  plane(cam, 0.75, () => {
    shape([[30, 560], [140, 560], [130, 760], [40, 760]], { lw: 2, id: 450, h: [1.57, 3, 0.8] });
    for (let i = 0; i < 5; i++) shape(R(42 + i * 18, 440 + hash(451, i) * 40, 16, 140), { lw: 1.3, id: 452 + i, h: [0.1, 4, 0.5] });
  });
};

SHOTS.world = (lt, sd, sh) => {
  const u = seg(lt, 1.2, sd - 0.4, E.in), cam = { z: lerp(1, 9, u), x: lerp(0, 20, u), y: lerp(-20, -70, u) };
  const w = cue(sh, 'wind'); KEYROT = clamp((lt - w.at) / (w.to - w.at)) * 6.283 * 3.5;
  X.fillStyle = P.paper; X.fillRect(0, 0, W, H);
  plane(cam, 1.05, () => { X.save(); path(R(-200, -200, 1700, 700)); X.clip(); hatch(0.78, 6, 0.4, [-200, -200, 1500, 900]); X.restore(); shape(R(-200, 560, 1700, 400), { lw: 1.4, id: 600, h: [0.02, 4, 0.5] }); });
  const gc = glassCase(640, 320, 680, 400, 610), x0 = 300, y0 = 120, w2 = 680, h = 400;
  plane(cam, 1, () => gc.back());
  X.save(); { const k = cam.z; X.save(); X.setTransform(k, 0, 0, k, CX - k * (CX + cam.x), CY - k * (CY + cam.y)); path(gc.front); X.restore(); X.clip(); }
  X.fillStyle = P.paper; X.fillRect(0, 0, W, H);
  plane(cam, 7, () => landscape(x0, y0, w2, h, 620, lt, 'sky'));
  plane(cam, 2.3, () => landscape(x0, y0, w2, h, 620, lt, 'far'));
  plane(cam, 1.55, () => landscape(x0, y0, w2, h, 620, lt, 'mid'));
  plane(cam, 1.15, () => landscape(x0, y0, w2, h, 620, lt, 'near'));
  X.restore();
  plane(cam, 1, () => gc.frame());
};

/* the king's console is a parser: he types verbs and nouns, the box answers in prose */
function wrapText(s, n) { const out = []; let cur = ''; for (const w of s.split(' ')) { if ((cur + ' ' + w).trim().length > n) { out.push(cur); cur = w; } else cur = (cur + ' ' + w).trim(); } if (cur) out.push(cur); return out; }
function parserLog(sh, lt) {
  const out = [];
  for (const c of sh.cues) {
    if (lt < c.at) continue;
    if (c.k === 'type') { const n = Math.min(c.text.length, Math.floor((lt - c.at) * 9) + 1); out.push({ s: '> ' + c.text.slice(0, n), cmd: true, live: lt < c.at + c.text.length / 9 + 0.15 }); }
    if (c.k === 'reply') { const full = wrapText(c.text, 34); let n = Math.floor((lt - c.at) * 24) + 1; for (const l of full) { if (n <= 0) break; out.push({ s: l.slice(0, n) }); n -= l.length + 1; } }
  }
  return out;
}
function consoleRoom(lt, sd, sh, prior) {
  const tight = onLine(sh, lt, 0.5, 1.2);
  const cam = tight ? { z: 1.8, x: 0, y: -60 } : { z: lerp(1.0, 1.07, seg(lt, 0, sd)), x: 0, y: lerp(-10, -30, seg(lt, 0, sd)) };
  const log = prior.concat(parserLog(sh, lt));
  const typing = sh.cues.find((c) => c.k === 'type' && lt >= c.at && lt < c.at + c.text.length / 9 + 0.15);
  const ci = typing ? Math.floor((lt - typing.at) * 9) : -1;
  plane(cam, 3, () => {
    X.fillStyle = P.paper; X.fillRect(-300, -300, 1900, 1400);
    X.save(); path(R(-300, -300, 1900, 1000)); X.clip(); hatch(Math.PI / 2, 3.4, 0.5, [-300, -300, 1600, 700]); X.restore();
    const sx = 330, sy = 24, sw = 620, shh = 214;
    shape(R(sx - 16, sy - 16, sw + 32, shh + 32), { lw: 2.4, id: 700, h: [0.78, 3, 0.6] });
    shape(R(sx, sy, sw, shh), { lw: 1.8, id: 701 });
    X.save(); path(R(sx, sy, sw, shh)); X.clip(); X.globalAlpha = 0.1; skyLines(sy, sy + shh, sy + 900); X.globalAlpha = 1;
    const lines = log.slice(typing ? -6 : -5);
    lines.forEach((l, i) => { txt(l.s, sx + 26, sy + 26 + i * 31, 21, { mono: true, align: 'left', bold: l.cmd }); });
    const last = lines[lines.length - 1];
    if (!typing && Math.floor(lt * 2) % 2 === 0) { const y = sy + 26 + lines.length * 31; txt('> _', sx + 26, Math.min(y, sy + shh - 20), 21, { mono: true, align: 'left', bold: true }); }
    else if (typing && last) { X.font = `bold 21px "IBM Plex Mono",monospace`; const wdt = X.measureText(last.s).width; X.fillStyle = P.ink; X.fillRect(sx + 28 + wdt, sy + 16 + (lines.length - 1) * 31, 11, 20); }
    X.restore();
    for (const [dx2, id] of [[200, 810], [1080, 820]]) { ball(dx2, 250, 46, id, PAT.f, 1.8); X.beginPath(); X.arc(dx2, 250, 38, 0, 6.283); X.fillStyle = P.paper; X.fill(); for (let i = 0; i < 12; i++) { const a = i / 12 * 6.283; line([dx2 + Math.cos(a) * 30, 250 + Math.sin(a) * 30], [dx2 + Math.cos(a) * 36, 250 + Math.sin(a) * 36], 1, id + 1 + i, 0.05); } const na = -1.4 + log.length * 0.35 + (id === 820 ? 1.2 : 0); line([dx2, 250], [dx2 + Math.cos(na) * 30, 250 + Math.sin(na) * 30], 2, id + 20, 0.05); }
  });
  plane(cam, 1.6, () => {
    shape([[40, 380], [1240, 380], [1290, 500], [-10, 500]], { lw: 2, id: 800, h: [0.03, 3.4, 0.5] });
    shape(R(-10, 500, 1300, 300), { lw: 2, id: 801, h: [1.57, 3, 0.6] });
    for (let r = 0; r < 3; r++) for (let c = 0; c < 15; c++) { const kx = 330 + c * 42 + r * 10, ky = 404 + r * 28, down = typing && (c * 3 + r) % 7 === ci % 7 ? 2 : 0; shape(R(kx, ky + down, 32, 20), { lw: 1, id: 830 + r * 20 + c, sh: R(kx, ky + down + 14, 32, 6), sh2: [0, 1.6, 0.5] }); }
  });
  plane(cam, 1.0, () => {
    const nod = tight ? sayAt(sh, 'E', lt) * 0.06 : 0;
    const lb = typing && ci % 2 === 0 ? 7 : 0, rb = typing && ci % 2 === 1 ? 7 : 0;
    shape([[380, 760], [400, 480], [470, 430], [810, 430], [880, 480], [900, 760]], { lw: 2.2, id: 905, h: [1.95, 5, 0.5], sh: [[700, 400], [920, 400], [920, 760], [700, 760]], sh2: [1.7, 2.4, 0.8] });
    cap(430, 480, 400, 450 + lb, 17, 930); hand(400, 446 + lb, -1.4, 10, 931);
    cap(850, 480, 880, 450 + rb, 17, 920); hand(880, 446 + rb, -1.7, 10, 922);
    X.save(); X.translate(640, 418); X.rotate(nod); X.scale(1.9, 1.9);
    for (let i = 0; i < 18; i++) { const d = i < 9 ? -1 : 1, k = i % 9; const p = []; for (let j = 0; j <= 8; j++) { const v = j / 8; p.push([d * (2 + k * 2.6) + d * v * (14 + k * 2.4) + Math.sin(v * 8 + i) * 1.4 + Math.sin(lt * 0.8 + i) * v * 1.2, -42 - Math.sin(v * 3) * 12 + v * (30 + hash(950, i) * 24)]); } coil(p, 4.2); }
    shape([[-24, -40], [24, -40], [22, 34], [-22, 34]], { lw: 2, id: 960, sh: [[6, -42], [26, -42], [26, 36], [6, 36]], sh2: [1.57, 2.4, 0.7] });
    shape(R(-29, -6, 6, 15), { lw: 1.2, id: 961 }); shape(R(23, -6, 6, 15), { lw: 1.2, id: 962 });
    X.restore();
    shape([[520, 760], [540, 450], [740, 450], [760, 760]], { lw: 2.6, id: 900, h: [1.57, 3.6, 0.6], sh: [[640, 440], [770, 440], [770, 760], [640, 760]], sh2: [1.57, 2.2, 0.8] });
    for (let i = 0; i < 3; i++) line([580 + i * 60, 480], [576 + i * 62, 750], 2, 901 + i, 0.4);
    ball(540, 450, 12, 908, PAT.f, 1.6); ball(740, 450, 12, 909, PAT.f, 1.6);
  });
}
SHOTS.govern = (lt, sd, sh) => consoleRoom(lt, sd, sh, []);
SHOTS.govern2 = (lt, sd, sh) => consoleRoom(lt, sd, sh, parserLog(shotNamed('govern'), 1e9));

SHOTS.inhabit = (lt, sd, sh) => {
  const tight = onLine(sh, lt, 0.6, 1.6);
  const stopT = 5.4, pos = Math.min(lt, stopT) / stopT, sc = lerp(1.2, 3.4, E.out(pos)), cy0 = lerp(400, 640, E.out(pos)), cx0 = 620;
  const headY = cy0 - 46 * sc;
  const cam = tight ? { z: 2.3, x: cx0 - CX, y: headY - CY + 20 } : { z: lerp(1, 1.12, seg(lt, 0, sd)), x: 0, y: lerp(0, -20, seg(lt, 0, sd)) };
  const vx = 640;
  plane(cam, 6, () => { X.fillStyle = P.paper; X.fillRect(-300, -300, 1900, 1400); X.save(); X.globalAlpha = 0.55; skyLines(-300, 330, 700); X.restore();
    for (let i = 0; i < 7; i++) tower(470 + i * 55, 300, 18 + hash(1000, i) * 14, 80 + hash(1001, i) * 120, 1010 + i * 10, { t: lt, flag: i % 2 === 0, red: i === 3 }); });
  plane(cam, 2.4, () => {
    shape([[380, 170], [900, 170], [900, 300], [820, 300], [820, 240], [460, 240], [460, 300], [380, 300]], { lw: 1.6, id: 1100, h: [1.57, 3, 0.5] });
    X.beginPath(); X.ellipse(640, 300, 180, 70, 0, Math.PI, 0); X.fillStyle = P.paper; X.fill(); X.lineWidth = 1.4; X.strokeStyle = P.ink; X.stroke();
    for (let i = 0; i < 12; i++) shape(R(380 + i * 44, 158, 22, 12), { lw: 0.8, id: 1110 + i });
  });
  plane(cam, 1.4, () => {
    shape([[-100, 800], [1380, 800], [vx + 130, 330], [vx - 130, 330]], { lw: 1.4, id: 1200 });
    for (let i = 0; i < 16; i++) { const k = Math.pow(i / 15, 1.8), y = 330 + k * 470, hw = 130 + k * 640; line([vx - hw, y], [vx + hw, y], 0.8, 1201 + i, 0.4); }
    for (let i = -6; i <= 6; i++) line([vx + i * 20, 330], [vx + i * 128, 800], 0.6, 1220 + i, 0.4);
    for (const d of [-1, 1]) {
      const near = vx + d * 660, far = vx + d * 130;
      shape([[near, -80], [far, 120], [far, 330], [near, 860]], { lw: 1.8, id: 1240 + d, h: [d > 0 ? 1.4 : 1.74, 4, 0.55], sh: d > 0 ? [[far, 0], [near + 20, 0], [near + 20, 860], [far, 860]] : null, sh2: [0.3, 3, 0.6] });
      for (let r = 0; r < 4; r++) for (let c = 0; c < 3; c++) { const k = c / 3, x1 = lerp(near, far, k + 0.08), x2 = lerp(near, far, k + 0.16), yt = lerp(-10, 150, k + 0.08) + r * lerp(150, 46, k), yb = yt + lerp(56, 20, k); shape([[x1, yt], [x2, yt + (x2 - x1) * 0.18 * d], [x2, yb], [x1, yb]], { fill: PAT.d, lw: 0.8, id: 1260 + r * 9 + c + d * 50 }); }
    }
    for (const [bx, d, cube] of [[300, -1, true], [1010, 1, false]]) {
      line([bx, 130], [bx - d * 70, 130], 3, 1300 + d, 0.2);
      shape([[bx - d * 66, 130], [bx - d * 6, 130], [bx - d * 6, 300], [bx - d * 36, 270], [bx - d * 66, 300]], { lw: 1.6, id: 1310 + d });
      const mx = bx - d * 36; if (cube) { shape([[mx, 180], [mx + 18, 190], [mx, 200], [mx - 18, 190]], { lw: 1.2, id: 1320 }); shape([[mx - 18, 190], [mx, 200], [mx, 226], [mx - 18, 214]], { lw: 1.2, id: 1321, h: [1.57, 2.4, 0.6] }); shape([[mx, 200], [mx + 18, 190], [mx + 18, 214], [mx, 226]], { lw: 1.2, id: 1322 }); }
      else for (let r = 0; r < 6; r++) for (let c = 0; c < 2; c++) if ((r + c) % 2) X.fillStyle = P.ink, X.fillRect(mx - 22 + c * 22, 150 + r * 18, 22, 18);
    }
    for (let i = 0; i < 4; i++) micro(vx - 60 + i * 40, 372 - i * 4, 0.55, 1450 + i * 20, { walk: 1, ph: lt * 7 + i, f: i % 2 ? 1 : -1 });
  });
  plane(cam, 1, () => {
    // the decree falls out of the sky; he walks to it, picks it up, reads it, looks up, speaks
    const pa = cue(sh, 'paper').at, pu = cue(sh, 'pickup').at, lu = cue(sh, 'lookup').at;
    const px = cx0 + 34 * 3.4, py = 640;
    const fall = seg(lt, pa, pa + 2.9, E.lin);
    const wk = 1 - seg(lt, stopT - 0.2, stopT + 0.2), read = seg(lt, pu + 0.2, pu + 0.8) - seg(lt, lu, lu + 0.6), up = seg(lt, lu, lu + 0.9);
    X.save(); X.globalAlpha = 0.3; X.beginPath(); X.ellipse(cx0, cy0, 22 * sc, 5 * sc, 0, 0, 6.283); X.fillStyle = P.ink; X.fill(); X.restore();
    micro(cx0, cy0, sc, 1400, { walk: wk, ph: lt * 6, wave: lt > pu ? -0.2 : 0, tilt: 0.18 * read - 0.28 * up, lookY: 1.4 * read - 1.6 * up, ant: -2 * up, bob: Math.abs(Math.sin(lt * 6)) * wk * 1.2, mouth: sayAt(sh, 'C', lt) });
    if (lt > pa && lt < pu) { const fx = lerp(px + 80, px, fall) + Math.sin(lt * 4.2) * 40 * (1 - fall), fy = lerp(-40, py, fall); X.save(); X.translate(fx, fy); X.rotate(Math.sin(lt * 3.1) * 0.7 * (1 - fall) + fall * 1.35); X.scale(1, fall >= 1 ? 0.35 : 1); paperDecree(); X.restore(); }
    if (lt >= pu) { const hx = cx0 + 14 * sc, hy = cy0 - 26 * sc; X.save(); X.translate(hx, hy - read * 8); X.scale(0.9, 0.9); paperDecree(); X.restore(); }
  });
  plane(cam, 0.8, () => {
    line([-10, 90], [190, 90], 5, 1500, 0.2); line([20, 90], [140, 40], 3, 1501, 0.3);
    shape([[120, 98], [200, 98], [200, 190], [120, 190]], { lw: 2, id: 1502, h: [0.7, 3.4, 0.6] }); line([140, 90], [140, 98], 2, 1503); line([180, 90], [180, 98], 2, 1504);
  });
  const g = seg(lt, sd - 2.6, sd - 0.4);
  if (g > 0 && !tight) { X.save(); X.globalAlpha = g * 0.7; for (const [gx, gw] of [[200, 24], [260, 8], [880, 16]]) { X.beginPath(); X.moveTo(gx, PY0); X.lineTo(gx + gw, PY0); X.lineTo(gx + gw - 200, 330); X.lineTo(gx - 200, 330); X.fillStyle = P.paper; X.fill(); } X.restore(); }
};
function paperDecree() { shape(R(-22, -28, 44, 56), { lw: 1.4, id: 1600 }); for (let i = 0; i < 6; i++) line([-15, -18 + i * 7], [15 - (i % 3) * 5, -18 + i * 7], 0.9, 1601 + i, 0.2); X.beginPath(); X.arc(10, 20, 5, 0, 6.283); X.fillStyle = P.red; X.fill(); }

SHOTS.crowd = (lt, sd, sh) => {
  const lap = cue(sh, 'lapse'), hc = cue(sh, 'hand');
  const a = lap.at, b = lap.to, el = clamp(lt - a, 0, b - a), D = b - a;
  const elapsed = Math.min(lt, a) + el + 7 * el * el * el / (3 * D * D) + Math.max(0, lt - b); // integral of the tape speed
  const days = elapsed * 0.22, sunA = (days % 1) * Math.PI;
  const cam = { z: lerp(1.04, 1.0, seg(lt, 0, sd)), x: 0, y: -20 };
  const hd = seg(lt, hc.at, hc.to, E.io), hx = 760, hy = lerp(-460, 160, hd), still = lt > hc.to;
  plane(cam, 8, () => { X.fillStyle = P.paper; X.fillRect(-300, -300, 1900, 1400); X.save(); X.globalAlpha = 0.5; skyLines(-300, 300, 600); X.restore();
    const sxp = 640 - Math.cos(sunA) * 560, syp = 300 - Math.sin(sunA) * 220; X.beginPath(); X.arc(sxp, syp, 26, 0, 6.283); X.fillStyle = P.paper; X.fill(); X.lineWidth = 1.4; X.strokeStyle = P.ink; X.stroke(); star(sxp, syp, 44, 1600 + (days | 0), P.ink, 12); });
  plane(cam, 2.5, () => {
    for (let i = 0; i < 6; i++) tower(110 + i * 210, 330, 70, 160 + hash(1700, i) * 90, 1710 + i * 10, { t: elapsed, crenel: i % 2 === 1, red: i === 2 });
    shape(R(40, 250, 1200, 90), { lw: 1.6, id: 1780, h: [1.57, 3.2, 0.5] });
    for (let i = 0; i < 9; i++) { X.beginPath(); X.ellipse(110 + i * 132, 340, 40, 60, 0, Math.PI, 0); X.fillStyle = P.ink; X.fill(); }
    for (let i = 0; i < 4; i++) { const bx = 280 + i * 240; shape([[bx, 180], [bx + 46, 180], [bx + 46, 290], [bx + 23, 270], [bx, 290]], { lw: 1.3, id: 1790 + i + ((days | 0) % 3) * 10 }); shape(R(bx + 12, 208, 22, 14), { fill: P.ink, lw: 0.6, id: 1795 + i }); }
  });
  plane(cam, 1.6, () => {
    shape([[470, 300], [810, 300], [840, 430], [440, 430]], { lw: 2, id: 1800, h: [1.57, 3.4, 0.6] });
    for (let i = 0; i < 4; i++) { const bx = 480 + i * 84; shape([[bx, 320], [bx + 50, 320], [bx + 50, 420], [bx + 25, 400], [bx, 420]], { lw: 1.3, id: 1810 + i, fill: P.ink }); }
    tinyMicro(640, 300, 0.9, 1830);
  });
  plane(cam, 1.15, () => {
    for (let r = 0; r < 11; r++) { const k = r / 10, y = lerp(440, 720, k), s = lerp(0.55, 1.55, k), n = Math.round(lerp(38, 14, k));
      for (let i = 0; i < n; i++) { let x = lerp(-20, 1300, (i + (r % 2) * 0.5) / n); const sh2 = still ? 0 : Math.sin(elapsed * 3 + i * 1.7 + r) * 4 * s; const dx = x - hx; x += hd * 90 * Math.exp(-(dx * dx) / 40000) * Math.sign(dx || 1) + sh2; tinyMicro(x, y + hash(r, i) * 6, s, 1900 + r * 60 + i); } }
    if (hd > 0) { X.save(); X.globalAlpha = 0.3 * hd; X.beginPath(); X.ellipse(hx, 600, 170 * hd + 40, 36 * hd + 8, 0, 0, 6.283); X.fillStyle = P.ink; X.fill(); X.restore(); }
  });
  plane(cam, 0.7, () => {
    if (hd <= 0) return; X.save(); X.translate(hx, hy); X.scale(2.4, 2.4);
    cap(30, -420, 10, -60, 60, 2100);
    shape([[-50, -70], [60, -70], [64, 10], [-46, 10]], { lw: 2.2, id: 2101, h: [1.57, 3, 0.6] });
    for (let i = 0; i < 4; i++) { const fx = -36 + i * 30; cap(fx, 10, fx - 2, 60 + (i === 1 || i === 2 ? 12 : 0), 18, 2110 + i * 3); ball(fx - 1, 36, 9, 2120 + i, PAT.f, 1.2); }
    cap(-50, -40, -86, 0, 20, 2130); X.restore();
  });
  X.save(); X.globalAlpha = 0.6; for (const [gx, gw] of [[160, 20], [215, 8], [940, 14]]) { X.beginPath(); X.moveTo(gx, PY0); X.lineTo(gx + gw, PY0); X.lineTo(gx + gw - 140, 250); X.lineTo(gx - 140, 250); X.fillStyle = P.paper; X.fill(); } X.restore();
};

SHOTS.question = (lt, sd, sh) => {
  const tight = onLine(sh, lt, 0.6, 1.4), ln = sh.lines.find((l) => l.line), after = lt > ln.t1 + 1.4;
  const cam = tight ? { z: 2.9, x: 330 - CX + 8, y: 324 - CY + 14 } : { z: lerp(1, 1.06, seg(lt, 0, sd)), x: lerp(0, -30, seg(lt, 0, sd)), y: -30 };
  const kSpeak = talking(sh, 'K', lt), tSpeak = talking(sh, 'T', lt);
  plane(cam, 3, () => {
    X.fillStyle = P.paper; X.fillRect(-300, -300, 1900, 1400);
    shape(R(-60, 0, 440, 560), { lw: 2, id: 2200, h: [1.57, 3, 0.5] });
    for (let r = 0; r < 5; r++) { shape(R(-50, 30 + r * 104, 420, 92), { lw: 1.2, id: 2210 + r }); let x = -44; for (let i = 0; x < 360; i++) { const bw = 12 + hash(2220 + r, i) * 18, bh = 60 + hash(2230 + r, i) * 28; shape(R(x, 30 + r * 104 + 92 - bh, bw, bh), { lw: 0.9, id: 2240 + r * 40 + i, h: [Math.PI / 2, i % 3 ? 2.4 : 1.6, 0.6] }); x += bw + 2; } }
    shape(R(900, 40, 260, 330), { lw: 2.2, id: 2400 }); X.save(); path(R(900, 40, 260, 330)); X.clip(); X.globalAlpha = 0.7; skyLines(40, 370, 600); X.restore();
    line([1030, 40], [1030, 370], 3, 2401); line([900, 200], [1160, 200], 3, 2402); ball(1090, 110, 28, 2403, PAT.f, 1.4);
    shape(R(-300, 560, 1900, 500), { lw: 1.4, id: 2410, h: [0.02, 4, 0.45] });
  });
  plane(cam, 1.6, () => {
    shape(R(700, 420, 200, 16), { lw: 1.6, id: 2500, h: [0, 2.4, 0.6] }); line([720, 436], [720, 640], 3, 2501); line([880, 436], [880, 640], 3, 2502);
    X.save(); X.translate(800, 420); X.scale(0.4, 0.4); castle(0, 0, 1, 2510, { t: lt }); X.restore();
  });
  plane(cam, 1, () => {
    shape([[180, 620], [470, 620], [470, 380], [430, 300], [220, 300], [180, 380]], { lw: 2, id: 2600, h: [1.57, 3.4, 0.5] });
    // Klapaucius: hand at his chin; it opens only when he asks; on the line he does not move
    const kOpen = kSpeak && !onLine(sh, lt, 0.6, 1.4) ? seg(lt, 0, 1) * 0.9 : 0;
    constructor_(330, 610, 1.0, 2700, { seated: true, robe: true, la: [0.4, -1.83], ra: [1.25 - kOpen * 1.4, 0.1 - kOpen * 0.7], open: kOpen, look: tight ? 0 : (tSpeak ? 1 : 0.4), tilt: tSpeak ? 0.05 : -0.02, sway: Math.sin(lt * 0.7) * 0.4, mouth: sayAt(sh, 'K', lt) });
    const tOpen = tSpeak ? 0.6 + 0.4 * sayAt(sh, 'T', lt) : 0;
    constructor_(1040, 610, 1.0, 2800, { f: -1, la: [1.3, 1.6], ra: [1.75 - tOpen * 1.6, 1.6 - tOpen * 1.6], open: tOpen, look: after ? 0 : 0.6, lookY: after ? 1.4 : 0, tilt: after ? 0.12 : -0.04 * tOpen, mouth: sayAt(sh, 'T', lt) });
  });
};

SHOTS.flight = (lt, sd, sh) => {
  const tight = onLine(sh, lt, 0.6, 99);
  const bob = Math.sin(lt * 1.3) * 8, sx = 640, sy = 360 + bob;
  const cam = tight ? { z: 6.2, x: 80, y: -4 + bob } : { z: 1, x: 0, y: 0 };
  space(cam, 3000, lt * 140);
  plane(cam, 5, () => planet(260 - lt * 6, 560, 120, 3001, false));
  plane(cam, 1, () => {
    for (let i = 0; i < 9; i++) { const k = i / 8, fx = sx - 230 - k * 300, w = 34 * (1 - k) + 4, wob = Math.sin(lt * 14 + i) * 6 * k; X.beginPath(); X.ellipse(fx, sy + wob, 40, w, 0, 0, 6.283); X.fillStyle = i % 2 ? P.paper : 'rgba(235,227,207,.6)'; X.fill(); }
    shape([[sx - 240, sy - 40], [sx + 120, sy - 60], [sx + 230, sy - 20], [sx + 250, sy], [sx + 230, sy + 20], [sx + 120, sy + 60], [sx - 240, sy + 40]], { lw: 2.4, id: 3010, h: [0.04, 6, 0.5], sh: [[sx - 260, sy + 10], [sx + 260, sy + 10], [sx + 260, sy + 70], [sx - 260, sy + 70]], sh2: [0.04, 2.2, 0.8] });
    shape([[sx - 200, sy - 42], [sx - 260, sy - 110], [sx - 140, sy - 50]], { lw: 1.8, id: 3011, h: [1.2, 3, 0.6] }); shape([[sx - 200, sy + 42], [sx - 260, sy + 110], [sx - 140, sy + 50]], { lw: 1.8, id: 3012, h: [1.2, 2, 0.7] });
    for (let i = 0; i < 9; i++) ball(sx - 180 + i * 40, sy + 34, 3, 3020 + i, PAT.f, 0.8);
    const ln = sh.lines.find((l) => l.line), quiet = lt > ln.t1;
    for (const [px, who, id] of [[sx - 40, 'K', 3100], [sx + 80, 'T', 3200]]) {
      ball(px, sy - 8, 36, id, PAT.f, 2.2); X.beginPath(); X.arc(px, sy - 8, 29, 0, 6.283); X.fillStyle = P.paper; X.fill();
      X.save(); X.beginPath(); X.arc(px, sy - 8, 29, 0, 6.283); X.clip();
      const sp = sayAt(sh, who, lt);
      boxHead(px, sy + 8 - sp * 1.5, 0.42, id + 10, { f: who === 'K' ? 1 : -1, look: who === 'T' && quiet ? -1 : 1, lookY: who === 'T' && quiet ? 1 : 0, tilt: who === 'T' && quiet ? 0.1 : 0, mouth: sp });
      X.restore();
    }
  });
};

SHOTS.escape = (lt, sd, sh) => {
  const ca = cue(sh, 'crack').at, la = cue(sh, 'launch').at;
  const u = seg(lt, la, sd - 0.3, E.io), cam = { z: lerp(1.0, 1.12, u), x: lerp(-40, 60, u), y: lerp(40, -30, u) };
  space(cam, 4000, lt * 8);
  plane(cam, 4, () => { planet(1060, 500, 70, 4001, true); planet(300, 90, 16, 4002); });
  const cx = lerp(300, 880, u), cy = lerp(560, 190, u), s = lerp(0.35, 1.25, u);
  plane(cam, 1.4, () => {
    for (let i = 0; i < 26; i++) { const k = i / 25, tt = clamp(u - k * 0.5); if (tt <= 0) continue; const px = lerp(300, 880, tt) - 60 * s, py = lerp(560, 190, tt) + 40 * s, r = 10 + k * 30 + (u - tt) * 50;
      X.beginPath(); X.arc(px + J(4100 + i, 0) * 4, py, r, 0, 6.283); X.fillStyle = 'rgba(235,227,207,.55)'; X.fill(); X.lineWidth = 0.8; X.strokeStyle = 'rgba(28,24,20,.6)'; X.stroke(); }
  });
  plane(cam, 1.15, () => {
    if (lt < la - 0.3) return;
    X.save(); X.translate(cx, cy); X.rotate(-0.55); X.scale(s, s);
    shape(R(-130, -42, 220, 84), { lw: 2.2, id: 4200, h: [1.57, 4, 0.5], sh: R(-130, 10, 220, 32), sh2: [0, 2.2, 0.8] });
    for (let i = 0; i < 6; i++) line([-110 + i * 36, -42], [-110 + i * 36, 42], 1.2, 4201 + i, 0.2);
    shape([[90, -50], [130, -30], [130, 30], [90, 50]], { lw: 2, id: 4210, h: [0.5, 2.6, 0.6] });
    shape([[-130, -30], [-172, -40], [-172, 40], [-130, 30]], { lw: 2, id: 4211, h: [1.57, 2.4, 0.7] });
    line([-20, -42], [-40, -170], 2.4, 4212); shape([[-40, -170], [-130, -110], [-58, -60]], { lw: 1.8, id: 4213, h: [0.9, 3.4, 0.5] });
    line([130, 0], [210, -10], 2, 4214); ball(214, -10, 6, 4215, PAT.f, 1.2);
    for (let i = 0; i < 4; i++) micro(-90 + i * 50, -42, 0.85, 4300 + i * 20, { wave: i % 2 ? 0.5 + 0.5 * Math.sin(lt * 7 + i) : 0, look: 1, f: 1 });
    X.restore();
  });
  plane(cam, 0.85, () => {
    const bx = -40, by = 540;
    shape([[bx, by], [bx + 380, by], [bx + 420, by + 40], [bx + 420, 900], [bx, 900]], { lw: 2.6, id: 4400, h: [1.57, 4, 0.5], sh: [[bx + 380, by], [bx + 430, by], [bx + 430, 900], [bx + 380, 900]], sh2: [1.57, 2, 0.8] });
    const lid = seg(lt, ca, ca + 0.5, E.out), lp = [[bx, by], [bx + 380, by], [bx + 380 - lid * 120, by - 260], [bx - lid * 80, by - 230]];
    shape(lp, { fill: 'rgba(235,227,207,.1)', lw: 2.4, id: 4402, col: P.paper });
    if (lt > ca) { const ox = bx + 230 - lid * 60, oy = by - 120; for (let i = 0; i < 9; i++) { const a = i / 9 * 6.283 + hash(4403, i); const L1 = 40 + hash(4404, i) * 90; ink([[ox, oy], [ox + Math.cos(a) * L1 * 0.5 + J(4405, i) * 8, oy + Math.sin(a) * L1 * 0.5], [ox + Math.cos(a) * L1, oy + Math.sin(a) * L1]], 1.2, 4406 + i, 0.6, P.paper); }
      const fly = lt - ca; for (let i = 0; i < 16; i++) { const a = hash(4420, i) * 6.283, sp = 80 + hash(4421, i) * 220, fx = ox + Math.cos(a) * sp * fly, fy = oy + Math.sin(a) * sp * fly + 120 * fly * fly; if (fly < 2.5) { X.save(); X.translate(fx, fy); X.rotate(fly * 6 + i); shape([[-6, -2], [5, -5], [3, 4]], { fill: 'rgba(235,227,207,.7)', lw: 0.8, id: 4430 + i, col: P.paper }); X.restore(); } } }
    for (let i = 0; i < 3; i++) micro(bx + 120 + i * 80, by, 1.1, 4500 + i * 20, { wave: lt > la ? 0.6 + 0.4 * Math.sin(lt * 5 + i * 2) : 0, look: 1, lookY: -1, ant: 2, mouth: i === 1 ? sayAt(sh, 'C', lt) : 0 });
  });
};

SHOTS.orbit = (lt, sd, sh) => {
  const bu = cue(sh, 'bump').at, mo = cue(sh, 'moon').at;
  const shake = lt > bu ? Math.sin(lt * 70) * 7 * Math.exp(-(lt - bu) * 4) : 0;
  const u = seg(lt, 0, sd), cam = { z: lerp(1.18, 1, E.out(u)), x: lerp(-60, 0, u) + shake, y: shake * 0.6 };
  space(cam, 5000, lt * 4);
  const mu = seg(lt, mo, sd - 1), ma = lerp(2.6, 3.9, mu), mx = 540 + Math.cos(ma) * -560, my = 420 + Math.sin(ma) * 300;
  plane(cam, 3, () => {
    if (mu <= 0) return;
    ball(mx, my, 92, 5100, PAT.f, 2); for (let i = 0; i < 9; i++) { const a = hash(5101, i) * 6.283, r = hash(5102, i) * 78; X.beginPath(); X.ellipse(mx + Math.cos(a) * r, my + Math.sin(a) * r, 6 + hash(5103, i) * 8, 4 + hash(5104, i) * 5, 0, 0, 6.283); X.lineWidth = 1; X.strokeStyle = P.ink; X.stroke(); }
    boxHead(mx, my + 8, 1.05, 5110, { stern: true, look: -1, sway: Math.sin(lt) * 0.5 });
  });
  plane(cam, 1.6, () => {
    const px = 540, py = 440, r = 190;
    ball(px, py, r, 5200, PAT.f, 2.4);
    X.save(); X.beginPath(); X.arc(px, py, r - 1, 0, 6.283); X.clip();
    X.save(); X.beginPath(); X.arc(px + 150, py + 60, r * 1.05, 0, 6.283); X.clip(); hatch(0.7, 2.4, 0.9, [px - r, py - r, px + r, py + r]); X.restore();
    for (let i = 0; i < 9; i++) { const a = hash(5210, i) * 6.283, rr = Math.sqrt(hash(5211, i)) * r * 0.8; X.beginPath(); X.ellipse(px + Math.cos(a) * rr, py + Math.sin(a) * rr, 8 + hash(5212, i) * 14, 5 + hash(5213, i) * 7, 0, 0, 6.283); X.lineWidth = 1; X.strokeStyle = P.ink; X.stroke(); }
    for (let i = 0; i < 60; i++) { const a = hash(5230, i) * 6.283, rr = Math.sqrt(hash(5231, i)) * r; const x = px + Math.cos(a) * rr, y = py + Math.sin(a) * rr; if ((x - px - 150) ** 2 + (y - py - 60) ** 2 < (r * 1.05) ** 2) { X.fillStyle = P.paper; X.globalAlpha = 0.5 + 0.5 * hash(i, BOIL >> 1); X.fillRect(x, y, 2.2, 2.2); X.globalAlpha = 1; } }
    X.restore();
    for (let i = 0; i < 22; i++) { const a = -Math.PI * (0.08 + 0.84 * i / 21) + hash(5250, i) * 0.04; X.save(); X.translate(px + Math.cos(a) * r, py + Math.sin(a) * r); X.rotate(a + Math.PI / 2); tower(0, 2, 8 + hash(5251, i) * 8, 14 + hash(5252, i) * 30, 5260 + i * 10, { t: lt, roof: 1.2, flag: i % 3 === 0 }); X.restore(); }
    X.save(); X.translate(px - 40, py - r + 6); shape([[-14, 0], [-4, -40], [6, -46], [14, 0]], { fill: 'rgba(235,227,207,.8)', lw: 1.4, id: 5400 });
    const kl = sh.lines.find((l) => l.who === 'K'); const gl = seg(lt, kl.t0 + 0.6, kl.t0 + 1.2) - seg(lt, kl.t1, kl.t1 + 0.8); if (gl > 0) { X.globalAlpha = gl; star(0, -30, 26, 5401 + (BOIL % 3), P.paper, 10); } X.restore();
  });
  plane(cam, 1.1, () => {
    const b2 = seg(lt, bu - 2.6, bu + 2.4, E.lin), bx = lerp(1350, -150, b2), by = lerp(150, 280, b2);
    X.save(); X.translate(bx, by); X.rotate(0.15); X.scale(-1, 1); boot(0, 0, 1, 2.2, 5500); X.restore();
    for (let i = 0; i < 8; i++) { X.beginPath(); X.ellipse(bx + 50 + i * 14, by - 16 + Math.sin(lt * 20 + i) * 2, 8, 4 * (1 - i / 8) + 1, 0, 0, 6.283); X.fillStyle = P.paper; X.fill(); }
  });
};

SHOTS.end = (lt) => {
  X.fillStyle = P.paper; X.fillRect(0, 0, W, H);
  const a = seg(lt, 0.4, 1.6);
  X.save(); X.globalAlpha = a;
  txt('THE SEVENTH SALLY', CX, 300, 40, {});
  txt('after Stanisław Lem, The Cyberiad', CX, 356, 24, { italic: true });
  X.restore();
  const ph = 7 * (1 - Math.exp(-0.42 * lt)) / 0.42, wk = Math.exp(-0.42 * lt);
  for (let i = 0; i < 7; i++) micro(470 + i * 56, 520, 0.9, 6000 + i * 20, { walk: wk, ph: ph + i, f: 1 });
};

/* ---------- frame loop ---------- */
window.__render = async (f) => {
  const t = f / 24; BOIL = Math.floor(f / 2);
  let i = 0; for (let j = 0; j < T.shots.length; j++) if (t >= T.shots[j].t0) i = j;
  const sh = T.shots[i], lt = t - sh.t0, sd = sh.d;
  X.setTransform(1, 0, 0, 1, 0, 0); X.fillStyle = P.paper; X.fillRect(0, 0, W, H);
  X.save(); path(R(PX0, PY0, PX1 - PX0, PY1 - PY0)); X.clip();
  SHOTS[sh.shot](lt, sd, sh);
  X.restore();
  const fade = sh.shot === 'title' ? Math.max(1 - seg(lt, 0, 0.8), seg(lt, sd - 0.8, sd)) : sh.shot === 'end' ? 0 : 0;
  if (fade > 0) { X.fillStyle = P.paper; X.globalAlpha = fade; X.fillRect(PX0, PY0, PX1 - PX0, PY1 - PY0); X.globalAlpha = 1; }
  border();
};
(async () => {
  T = await (await fetch('timing/sally.json')).json();
  await document.fonts.ready; await Promise.all(['IM Fell English', 'IBM Plex Mono'].map((n) => document.fonts.load(`20px "${n}"`)));
  X = document.getElementById('film').getContext('2d');
  window.__NF = Math.ceil(T.dur * 24); window.__T = T; window.__ready = true;
})();
