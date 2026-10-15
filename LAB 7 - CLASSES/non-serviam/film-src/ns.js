/* Non Serviam: engraved multiplane film, same lineage and toolkit as The Seventh Sally. */
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


/* ================= Non Serviam drawing ================= */
const sayAt = (sh, who, lt) => { for (const l of sh.lines) if (l.who === who && lt >= l.t0 && lt < l.t1) return l.env[Math.min(l.env.length - 1, Math.floor((lt - l.t0) * 24))] || 0; return 0; };
const talking = (sh, who, lt) => sh.lines.some((l) => l.who === who && lt >= l.t0 - 0.1 && lt < l.t1 + 0.2);
const onLine = (sh, lt, pre = 0.6, post = 1.3) => { const l = sh.lines.find((x) => x.line); return !!l && lt >= l.t0 - pre && lt < l.t1 + post; };
const cue = (sh, k, i = 0) => sh.cues.filter((c) => c.k === k)[i];
const cues = (sh, k) => sh.cues.filter((c) => c.k === k);
function darkWall(x0, y0, x1, y1, sp = 2.6) { X.fillStyle = P.paper; X.fillRect(x0, y0, x1 - x0, y1 - y0); X.save(); path(R(x0, y0, x1 - x0, y1 - y0)); X.clip(); for (let y = y0; y < y1; y += sp) { X.fillStyle = P.ink; X.fillRect(x0, y, x1 - x0, 0.9 + 0.5 * hash(y | 0, 5)); } X.restore(); }

/* personoid: box head with round-dot eyes and an antenna, jointed wooden body */
function personoid(x, y, s, id, o = {}) {
  if (SILENT) return;
  X.save(); X.translate(x, y); X.scale(s * (o.f || 1), s);
  const crouch = o.crouch || 0; X.translate(0, crouch * 70);
  const ll = o.ll || [Math.PI / 2 + 0.07, Math.PI / 2 - 0.02], rl = o.rl || [Math.PI / 2 - 0.09, Math.PI / 2 + 0.03];
  const kneeBend = crouch * 1.2;
  const leg = (hx, a, k) => { const [, , fx, fy] = limb(hx, -122, a[0] - kneeBend * k, 58, a[1] + kneeBend * k * 1.4, 58, 13, id + (k > 0 ? 10 : 20)); boot(fx, Math.min(fy + 4, crouch * -70 + 0.1 + 0), k > 0 ? 1 : 1, 1.05, id + (k > 0 ? 30 : 31)); };
  const back = o.la || [1.75, 1.62], front = o.ra || [1.4, 1.62];
  const arm = (sx, a, k) => { const [, , hx, hy] = limb(sx, -214, a[0], 50, a[1], 46, 11, id + 40 + k * 7); if (o.point && k === 1) { ball(hx, hy, 7, id + 50, PAT.f, 1.1); line([hx, hy], [hx + Math.cos(a[1]) * 20, hy + Math.sin(a[1]) * 20], 3.2, id + 51, 0.1); } else hand(hx, hy, a[1], 6.5, id + 52 + k, o.open || 0); };
  arm(-30, back, 0);
  leg(-11, ll, -1); leg(11, rl, 1);
  shape(R(-18, -136, 36, 18), { lw: 1.4, id: id + 60, sh: R(6, -136, 12, 18), sh2: [1.57, 2, 0.6] });
  line([-6, -138], [-6, -150], 2, id + 61, 0.1); line([6, -138], [6, -150], 2, id + 62, 0.1);
  shape(R(-28, -226, 56, 78), { lw: 1.8, id: id + 63, sh: [[12, -228], [30, -228], [30, -146], [12, -146]], sh2: [1.57, 2.3, 0.7] });
  for (const [rx, ry] of [[-18, -214], [16, -214], [-18, -160], [16, -160], [-1, -186]]) { X.beginPath(); X.arc(rx, ry, 1.8, 0, 6.283); X.fillStyle = P.ink; X.fill(); }
  ball(-31, -218, 8, id + 64, PAT.f, 1.2); ball(31, -218, 8, id + 65, PAT.f, 1.2);
  line([-4, -226], [-4, -238], 1.6, id + 66, 0.1); line([4, -226], [4, -238], 1.6, id + 67, 0.1);
  // head: a cube seen a little from the right
  X.save(); X.translate(0, -240); X.rotate(o.tilt || 0);
  const hw = 46, hh = 44, dx = 9, dy = -7;
  shape([[-hw / 2, -hh], [hw / 2, -hh], [hw / 2 + dx, -hh + dy], [-hw / 2 + dx, -hh + dy]], { lw: 1.4, id: id + 70, h: [0, 2.6, 0.5] });
  shape([[hw / 2, -hh], [hw / 2 + dx, -hh + dy], [hw / 2 + dx, dy], [hw / 2, 0]], { lw: 1.4, id: id + 71, h: [1.57, 1.9, 0.7] });
  shape(R(-hw / 2, -hh, hw, hh), { lw: 1.8, id: id + 72 });
  const lx = (o.look || 0) * 2.2, ly = (o.lookY || 0) * 2;
  for (const ex of [-10, 10]) { shape(R(ex - 6, -32, 12, 11), { lw: 1.1, id: id + 73 + ex }); X.beginPath(); X.arc(ex + lx, -26.5 + ly, 2.6, 0, 6.283); X.fillStyle = P.ink; X.fill(); }
  const mo = o.mouth || 0; shape(R(-9, -12 - mo * 3, 18, 3 + mo * 7), { fill: P.ink, lw: 0.8, id: id + 75 });
  line([dx / 2, -hh + dy / 2], [dx / 2 + (o.ant || 0), -hh + dy / 2 - 20], 1.4, id + 76, 0.1); ball(dx / 2 + (o.ant || 0), -hh + dy / 2 - 22, 3.6, id + 77, PAT.f, 1);
  X.restore();
  arm(30, front, 1);
  X.restore();
}

/* metaphysical architecture: arches, stairs, obelisks, spheres on plinths. Light from the left. */
function block(x, y, w, h, d, id, o = {}) { // y = base, d = depth drawn up-right
  const k = d * 0.5;
  shape([[x, y - h], [x + w, y - h], [x + w + k, y - h - k * 0.7], [x + k, y - h - k * 0.7]], { lw: 1.3, id: id + 1, h: [0, 3.2, 0.45] });
  shape([[x + w, y - h], [x + w + k, y - h - k * 0.7], [x + w + k, y - k * 0.7], [x + w, y]], { lw: 1.3, id: id + 2, h: [1.57, 1.8, 0.7] });
  shape(R(x, y - h, w, h), { lw: 1.6, id, h: o.dark ? [1.57, 2.2, 0.6] : [1.57, 4.2, 0.4] });
  if (o.arch) { const aw = Math.min(w * 0.4, 46), ah = Math.min(h * 0.6, aw * 1.8), ax = x + w * (o.archAt ?? 0.5) - aw / 2; X.beginPath(); X.moveTo(ax, y); X.lineTo(ax, y - ah + aw / 2); X.arc(ax + aw / 2, y - ah + aw / 2, aw / 2, Math.PI, 0); X.lineTo(ax + aw, y); X.closePath(); X.fillStyle = PAT.d; X.fill(); X.lineWidth = 1.3; X.strokeStyle = P.ink; X.stroke(); }
}
function stairs(x, y, w, n, stepH, stepW, dir, id) { // climbs up-right (dir 1) or up-left (-1)
  for (let i = 0; i < n; i++) { const sx = dir > 0 ? x + i * stepW : x - (i + 1) * stepW; shape(R(sx, y - (i + 1) * stepH, stepW * (n - i), stepH), { lw: 1, id: id + i, h: [1.57, 2.4, 0.5] }); line([sx, y - (i + 1) * stepH], [sx + stepW * (n - i), y - (i + 1) * stepH], 1.4, id + 40 + i, 0.2); }
  void w;
}
function obelisk(x, y, w, h, id, sphere = true) { block(x, y, w, h, w * 0.5, id); const k = w * 0.25; shape([[x, y - h], [x + w, y - h], [x + w / 2 + k * 0.5, y - h - w * 0.9]], { lw: 1.3, id: id + 5, h: [-1, 2.4, 0.5] }); if (sphere) ball(x + w / 2 + k * 0.5, y - h - w * 0.9 - w * 0.55, w * 0.55, id + 6, PAT.m, 1.3); }
function plinthSphere(x, y, s, id) { block(x - 18 * s, y, 36 * s, 34 * s, 18 * s, id); ball(x + 4 * s, y - 34 * s - 6 * s - 20 * s, 22 * s, id + 9, PAT.m, 1.4); }
function bigSphere(x, y, r, id) { ball(x, y, r, id, PAT.f, 1.6); X.save(); circ(x, y, r, id); X.clip(); for (let i = 0; i < 26; i++) { const yy = y - r + (i + 0.5) * 2 * r / 26; X.beginPath(); X.ellipse(x - r * 0.15, yy, r, r * 0.04 + 0.4, 0, 0, 6.283); X.lineWidth = 0.5; X.strokeStyle = 'rgba(28,24,20,.5)'; X.stroke(); } X.restore(); }

/* the plaza at full size: used for shots inside the world */
function plaza(cam, t, o = {}) {
  plane(cam, 7, () => { darkWall(-400, -400, 2000, 520, 3); X.fillStyle = P.paper; X.globalAlpha = 0.25; X.fillRect(-400, 420, 2400, 100); X.globalAlpha = 1;
    const sa = o.sunA ?? 0.32; bigSphere(260 + Math.cos(Math.PI * (1 - sa)) * -380 + 380, 380 - Math.sin(Math.PI * sa) * 260, 70, 900); });
  plane(cam, 3.2, () => {
    block(-120, 520, 220, 230, 90, 910, { arch: true }); obelisk(140, 520, 46, 300, 920);
    block(760, 520, 260, 180, 100, 930, { arch: true, archAt: 0.3 }); block(1060, 520, 140, 330, 70, 940, { arch: true }); ball(1130, 520 - 330 - 60, 36, 945, PAT.m, 1.4);
    stairs(820, 520, 0, 7, 22, 18, -1, 950);
  });
  plane(cam, 1.8, () => {
    shape([[-600, 520], [1900, 520], [1900, 1200], [-600, 1200]], { lw: 1.4, id: 960, h: [0.02, 5.5, 0.45] });
    for (let i = -8; i <= 8; i++) line([640 + i * 60, 520], [640 + i * 260, 1100], 0.6, 961 + i, 0.3);
    stairs(-60, 640, 0, 6, 26, 22, 1, 970); plinthSphere(520, 600, 1, 980); block(980, 640, 120, 90, 60, 985); plinthSphere(1180, 660, 1.2, 990);
  });
}

/* the world in miniature, as it sits under the dome (images: round platform, stairs, obelisks, spheres) */
function domeWorld(cx, by, s, t, figs, o = {}) {
  X.save(); X.translate(cx, by); X.scale(s, s);
  const g = o.grow ?? 1;
  // round platform
  X.beginPath(); X.ellipse(0, -60, 380, 70, 0, 0, Math.PI); X.lineTo(-380, 0); X.ellipse(0, 0, 380, 70, 0, Math.PI, 0, true); X.closePath(); X.fillStyle = P.paper; X.fill();
  X.save(); X.clip(); hatch(Math.PI / 2, 3.2, 0.7, [-400, -140, 400, 80]); X.restore();
  for (let i = 0; i < 7; i++) { const ax = -300 + i * 100, ay = 30; X.beginPath(); X.moveTo(ax - 18, ay + 10); X.lineTo(ax - 18, ay - 18); X.arc(ax, ay - 18, 18, Math.PI, 0); X.lineTo(ax + 18, ay + 10); X.fillStyle = PAT.d; X.fill(); }
  X.beginPath(); X.ellipse(0, -60, 380, 70, 0, 0, 6.283); X.fillStyle = P.paper; X.fill(); X.lineWidth = 2; X.strokeStyle = P.ink; X.stroke();
  X.save(); X.beginPath(); X.ellipse(0, -60, 380, 70, 0, 0, 6.283); X.clip(); hatch(0.02, 5, 0.4, [-400, -140, 400, 20]); X.restore();
  ink([[-380, -60], [-380, 0]], 2, 7001, 0.3); ink([[380, -60], [380, 0]], 2, 7002, 0.3);
  // architecture, growing in order
  const parts = [
    () => block(-330, -80, 150, 150, 60, 7010, { arch: true }), () => obelisk(-170, -100, 34, 230, 7020), () => stairs(-120, -60, 0, 6, 16, 16, -1, 7030),
    () => block(180, -90, 160, 120, 70, 7040, { arch: true, archAt: 0.35 }), () => obelisk(250, -210, 30, 160, 7050), () => plinthSphere(-250, -230, 1, 7060),
    () => block(-60, -40, 120, 50, 50, 7070), () => stairs(60, -40, 0, 5, 12, 14, 1, 7080), () => plinthSphere(320, -40, 0.9, 7090),
  ];
  parts.forEach((fn, i) => { const u = clamp((g - i / parts.length) * parts.length); if (u <= 0) return; X.save(); X.translate(0, -60); X.scale(1, u); X.translate(0, 60); fn(); X.restore(); });
  if (o.sky !== false) bigSphere(140, -420 + (o.sunY || 0), 46, 7100);
  for (const f of figs) personoid(f.x, f.y, f.s || 0.62, f.id, f);
  X.restore();
}

/* the bell jar: octagonal base with sockets and cables, glass dome, the listening probe */
function domeGlassPath(cx, by, w, h) { const r = w / 2, top = by - h; X.beginPath(); X.moveTo(cx - r, by); X.lineTo(cx - r, top + r); X.arc(cx, top + r, r, Math.PI, 0); X.lineTo(cx + r, by); X.closePath(); }
function domeBase(cx, by, w, id) {
  const hw = w / 2 + 40;
  shape([[cx - hw, by], [cx + hw, by], [cx + hw - 30, by + 90], [cx - hw + 30, by + 90]], { lw: 2.2, id, h: [1.57, 3.2, 0.5], sh: [[cx + 60, by], [cx + hw + 5, by], [cx + hw + 5, by + 95], [cx + 60, by + 95]], sh2: [1.57, 2, 0.8] });
  shape(R(cx - hw - 6, by - 14, 2 * hw + 12, 16), { lw: 1.8, id: id + 1, h: [0, 2.4, 0.6] });
  for (let i = 0; i < 4; i++) { const sx = cx - hw + 70 + i * (2 * hw - 140) / 3; ball(sx, by + 46, 13, id + 10 + i, PAT.m, 1.6); }
  shape(R(cx - 40, by + 26, 80, 46), { lw: 1.4, id: id + 20, h: [0.78, 3, 0.6] });
}
function cable(pts, w, id) { X.beginPath(); X.moveTo(pts[0][0], pts[0][1]); X.bezierCurveTo(...pts[1], ...pts[2], ...pts[3]); X.lineWidth = w + 3; X.strokeStyle = P.ink; X.stroke(); X.lineWidth = w; X.strokeStyle = P.paper; X.stroke(); X.lineWidth = w * 0.35; X.strokeStyle = PAT.m; X.stroke(); void id; }
function dome(cx, by, w, h, id, inner, o = {}) {
  domeBase(cx, by, w, id);
  domeGlassPath(cx, by - 14, w, h); X.fillStyle = 'rgba(235,227,207,1)'; X.fill();
  X.save(); domeGlassPath(cx, by - 14, w, h); X.clip(); inner();
  // probe hanging from the crown
  const top = by - 14 - h;
  shape(R(cx - 26, top, 52, 70), { lw: 1.6, id: id + 30, h: [1.57, 2.4, 0.6] }); shape(R(cx - 36, top + 70, 72, 34), { lw: 1.6, id: id + 31, h: [0.4, 2.6, 0.6] });
  const sw = Math.sin((o.t || 0) * 1.3) * 6; line([cx, top + 104], [cx + sw, top + 150], 1.2, id + 32, 0.1); ball(cx + sw, top + 156, 7, id + 33, PAT.m, 1.2);
  X.globalAlpha = 0.55; for (const [u, ww] of [[0.12, 16], [0.2, 6], [0.82, 10]]) { const gx = cx - w / 2 + u * w; X.beginPath(); X.moveTo(gx, top); X.lineTo(gx + ww, top); X.lineTo(gx + ww + 30, by); X.lineTo(gx + 30, by); X.fillStyle = P.paper; X.fill(); } X.globalAlpha = 1;
  X.restore();
  domeGlassPath(cx, by - 14, w, h); X.lineWidth = 2.6; X.strokeStyle = P.ink; X.stroke();
  X.save(); X.translate(cx, by - 14 - h + w / 2); X.beginPath(); X.arc(0, 0, w / 2 - 10, Math.PI * 1.1, Math.PI * 1.35); X.lineWidth = 2; X.strokeStyle = P.paper; X.stroke(); X.restore();
}

/* the machine: left panel (gauges, knobs, toggles), right tower (printer, roll, oscilloscope, gear lever, letter slot) */
const LEVER_PIVOT = [913, 500], KNIFE_PIVOT = [604, 652], REST = [395, 296], ENVELOPE = [987, 452];
function leverTip(v) { const a = lerp(1.2, -1.2, v); return [LEVER_PIVOT[0] + Math.cos(a) * 58, LEVER_PIVOT[1] + Math.sin(a) * 58]; }
function knifeTip() { return [KNIFE_PIVOT[0] + 74, KNIFE_PIVOT[1] - 30]; }
function machine(st) {
  shape(R(860, 250, 170, 350), { lw: 2, id: 8000, h: [1.57, 3.2, 0.5], sh: R(990, 250, 40, 350), sh2: [1.57, 2, 0.8] });
  line([1070, 110], [1070, 590], 4, 8001, 0.2); ball(1070, 102, 10, 8002, PAT.m, 1.4); shape(R(1058, 230, 24, 90), { lw: 1.6, id: 8003, h: [1.57, 2.4, 0.6] });
  shape(R(880, 330, 130, 70), { lw: 1.8, id: 8010 }); X.save(); path(R(880, 330, 130, 70)); X.clip(); X.beginPath(); for (let i = 0; i <= 60; i++) { const x = 882 + i * 126 / 60, y = 365 + Math.sin(i * (0.3 + st.speed * 0.25) + st.t * (2 + st.speed * 6)) * 18 * clamp(st.speed); i ? X.lineTo(x, y) : X.moveTo(x, y); } X.lineWidth = 1.4; X.strokeStyle = P.ink; X.stroke(); X.restore();
  shape(R(880, 420, 66, 160), { lw: 1.6, id: 8150, h: [0, 2.6, 0.5] }); shape(R(884, 424, 58, 18), { lw: 1, id: 8151 }); txt('FAST', 913, 433, 11, { mono: true, bold: true }); shape(R(884, 558, 58, 18), { lw: 1, id: 8152 }); txt('SLOW', 913, 567, 11, { mono: true, bold: true });
  const lt2 = leverTip(st.lever || 0); line(LEVER_PIVOT, lt2, 5, 8155, 0.2); ball(LEVER_PIVOT[0], LEVER_PIVOT[1], 6, 8157, PAT.m, 1); ball(lt2[0], lt2[1], 11, 8156, PAT.f, 1.6);
  shape(R(955, 430, 64, 46), { lw: 1.4, id: 8130, h: [0.78, 3.4, 0.5] }); if (st.envelope) { shape(R(961, 436, 52, 34), { lw: 1.3, id: 8131 }); line([961, 436], [987, 455], 1, 8132, 0.1); line([1013, 436], [987, 455], 1, 8133, 0.1); }
  shape(R(890, 258, 120, 56), { lw: 1.8, id: 8160, h: [1.57, 2.4, 0.6] }); shape(R(900, 282, 40, 12), { fill: P.ink, lw: 0.6, id: 8161 });
  const rr = 50 + (st.roll || 0); ball(960, 196, rr, 8170, PAT.f, 2); X.beginPath(); X.arc(960, 196, rr * 0.82, 0, 6.283); X.lineWidth = 0.8; X.strokeStyle = P.ink; X.stroke(); ball(960, 196, 10, 8171, PAT.m, 1.4);
  for (let i = 0; i < 6; i++) { const a = st.t * (0.6 + st.speed * 0.8) + i * 1.047; line([960, 196], [960 + Math.cos(a) * rr * 0.75, 196 + Math.sin(a) * rr * 0.75], 0.8, 8172 + i, 0.05); }
  // left panel
  shape(R(180, 300, 250, 300), { lw: 2.2, id: 8020, h: [0.02, 3.6, 0.45] });
  shape([[180, 300], [430, 300], [446, 282], [196, 282]], { lw: 1.8, id: 8021, h: [0, 2.4, 0.6] });
  for (const [gx, gy, k] of [[242, 365, 0], [242, 455, 1]]) { ball(gx, gy, 38, 8030 + k, PAT.f, 2); X.beginPath(); X.arc(gx, gy, 30, 0, 6.283); X.fillStyle = P.paper; X.fill(); for (let i = 0; i < 14; i++) { const a = Math.PI * (0.75 + 1.5 * i / 13); line([gx + Math.cos(a) * 23, gy + Math.sin(a) * 23], [gx + Math.cos(a) * 28, gy + Math.sin(a) * 28], 1, 8040 + k * 20 + i, 0.05); } const na = Math.PI * (0.8 + 1.4 * clamp(st.speed / 4 + (k ? 0.15 : 0.05) + Math.sin(st.t * 3 + k) * 0.01 * st.speed)); line([gx, gy], [gx + Math.cos(na) * 24, gy + Math.sin(na) * 24], 2, 8060 + k, 0.05); }
  for (let r = 0; r < 4; r++) for (let c = 0; c < 2; c++) ball(322 + c * 46, 340 + r * 42, 11, 8070 + r * 3 + c, PAT.m, 1.4);
  for (let i = 0; i < 3; i++) { const tx = 230 + i * 60, ty = 552, on = (st.toggles || 0) > i; shape(R(tx - 16, ty - 22, 32, 44), { lw: 1.4, id: 8100 + i }); line([tx, ty], [tx + (on ? 10 : -10), ty + (on ? -24 : 24)], 3.4, 8110 + i, 0.1); ball(tx + (on ? 10 : -10), ty + (on ? -24 : 24), 5, 8120 + i, PAT.m, 1); }
}
/* the switch for their world sits on the dome's own base */
function knifeSwitch(st) {
  shape(R(574, 622, 132, 58), { lw: 1.6, id: 8140, h: [1.57, 2.8, 0.55] });
  ball(KNIFE_PIVOT[0], KNIFE_PIVOT[1], 6, 8141, PAT.m, 1); shape(R(676, 640, 14, 24), { lw: 1.2, id: 8145 });
  const tip = knifeTip(), ka = Math.atan2(tip[1] - KNIFE_PIVOT[1], tip[0] - KNIFE_PIVOT[0]) + (st.knife || 0) * 0.15;
  const ex = KNIFE_PIVOT[0] + Math.cos(ka) * 86, ey = KNIFE_PIVOT[1] + Math.sin(ka) * 86; line(KNIFE_PIVOT, [ex, ey], 5, 8143, 0.2); shape(R(ex - 7, ey - 22, 14, 24), { lw: 1.4, id: 8144, h: [1.57, 2, 0.6] });
}
/* the paper tape: comes out of the printer at x0 and runs left, curling down at the end */
function tapeStrip(x0, y0, text, scroll, o = {}) {
  const len = o.len || 520, cw = o.cw || 13, hgt = o.h || 22;
  const pts = []; for (let i = 0; i <= 60; i++) { const u = i / 60, x = x0 - u * len, dropU = clamp((u - 0.7) / 0.3); pts.push([x - dropU * dropU * 40, y0 + dropU * dropU * 160]); }
  X.save(); X.beginPath(); pts.forEach(([x, y], i) => (i ? X.lineTo(x, y) : X.moveTo(x, y))); X.lineWidth = hgt + 3; X.strokeStyle = P.ink; X.lineJoin = 'round'; X.stroke(); X.lineWidth = hgt; X.strokeStyle = P.paper; X.stroke();
  X.setLineDash([2, 6]); X.lineDashOffset = scroll * cw; X.lineWidth = 2.4; X.strokeStyle = P.ink; for (const off of [-hgt * 0.36, hgt * 0.36]) { X.beginPath(); pts.forEach(([x, y], i) => (i ? X.lineTo(x, y + off) : X.moveTo(x, y + off))); X.stroke(); } X.setLineDash([]); X.restore();
  // characters: newest at the printer, older ones carried left along the strip
  X.font = `600 ${Math.round(hgt * 0.62)}px "IBM Plex Mono",monospace`; X.fillStyle = P.ink; X.textAlign = 'center'; X.textBaseline = 'middle';
  const n = text.length;
  for (let i = 0; i < n; i++) { const dist = (n - 1 - i) * cw + 10 + (scroll % 1) * 0; if (dist > len * 0.72) continue; const u = dist / len; X.fillText(text[i], x0 - u * len, y0 + 1); }
}

/* Dobb leaning over his machine: robe, box head on one hand, the other hand free (images 2 and 6) */
function dobb(st, part) {
  const id = 8500, hx = st.hand ? st.hand[0] : REST[0], hy = st.hand ? st.hand[1] : REST[1];
  if (part === 'body') {
  shape([[-40, 600], [-30, 330], [10, 220], [120, 150], [260, 130], [380, 170], [420, 250], [430, 330], [460, 420], [300, 600]], { lw: 2.4, id, h: [1.95, 5.5, 0.5], sh: [[260, 120], [480, 120], [480, 620], [260, 620]], sh2: [[1.75, 2.4, 0.75]] });
  for (let i = 0; i < 6; i++) ink([[30 + i * 50, 600], [60 + i * 46, 400], [120 + i * 40, 220]], 1, id + 10 + i, 1);
  return; }
  // cheek arm: elbow on the console top, hand up to the face
  const cheek = st.cheek ?? 1, elx = 400, ely = 292, chx = lerp(elx + 10, 372, cheek), chy = lerp(ely - 10, 196, cheek);
  // free hand on the console
  cap(250, 260, (250 + hx) / 2, (260 + hy) / 2 + 30, 26, id + 20); cap((250 + hx) / 2, (260 + hy) / 2 + 30, hx, hy, 20, id + 21); hand(hx, hy, st.handA ?? 0.4, 12, id + 22, st.open || 0);
  const head = () => boxHead(318, 152, 1.55, id + 40, { tilt: 0.42 * cheek + (st.tilt || 0), look: st.look ?? 0.6, lookY: st.lookY ?? 1, mouth: st.mouth || 0, closed: st.closed, sway: Math.sin((st.t || 0) * 0.6) * 0.5 });
  head();
  cap(elx, ely, chx, chy, 22, id + 30); hand(chx, chy, -1.9, 12, id + 31, 0.2);
}
/* Dr. Combay, standing at the edge of the frame */
function combay(x, y, s, sh, lt) { constructor_(x, y, s, 8700, { f: -1, la: [1.35, 1.6], ra: talking(sh, 'I', lt) ? [0.9, 0.2] : [1.75, 1.55], open: talking(sh, 'I', lt) ? 0.8 : 0, look: 0.8, mouth: sayAt(sh, 'I', lt) }); }

/* the whole lab at one moment: wall, cables, machine, dome with the small world inside, Dobb, the tape */
function lab(st) {
  darkWall(-300, -300, 1700, 1200, 2.8);
  shape([[-300, 600], [1700, 600], [1700, 1200], [-300, 1200]], { lw: 1.6, id: 8900, h: [0.02, 4, 0.5] });
  for (let i = 0; i < 6; i++) cable([[180, 360 + i * 30], [80, 420 + i * 30], [40, 620 + i * 12], [-120, 640 + i * 18]], 9, 8910 + i);
  for (let i = 0; i < 4; i++) cable([[1030, 420 + i * 30], [1120, 470 + i * 30], [1160, 640], [1400, 640 + i * 20]], 9, 8920 + i);
  if (st.dobb !== false) dobb(st, 'body');
  machine(st);
  if (st.dobb !== false) dobb(st, 'arms');
  for (let i = 0; i < 4; i++) cable([[420 + i * 140, 690], [380 + i * 150, 740], [300 + i * 160, 760], [200 + i * 170, 800]], 10, 8930 + i);
  if (st.tape) tapeStrip(890, 288, st.tape, st.tapeScroll || 0, { len: 600 });
  dome(640, 600, 440, 400, 8950, () => { X.fillStyle = P.paper; X.fillRect(380, 150, 520, 460); X.save(); X.globalAlpha = 0.35; skyLines(150, 560, 900); X.restore(); domeWorld(640, 560, 0.5, st.t, st.figs || [], { grow: st.grow, sunY: st.sunY }); }, { t: st.t });
  knifeSwitch(st);
  if (st.lamp !== false) { X.save(); X.globalAlpha = 0.6; for (let i = 0; i < 16; i++) { const a = Math.PI * (0.25 + 0.5 * i / 15); line([140, -10], [140 + Math.cos(a) * 520, -10 + Math.sin(a) * 520], 0.8, 8990 + i, 0.3, P.paper); } X.restore(); }
}

/* ================= shots ================= */
const SHOTS = {};
function printed(sh, lt) { const c = cues(sh, 'tape').filter((x) => lt >= x.at).pop(); if (!c) return ''; return c.text.slice(0, Math.min(c.text.length, Math.floor((lt - c.at) * c.rate) + 1)); }
function leverAt(sh, lt, start) { let v = start; for (const c of cues(sh, 'lever')) { const target = c.to === 'fast' ? 1 : 0; v = lerp(v, target, seg(lt, c.at, c.at + 0.35, E.io)); } return v; }
function domeFigs(t, n, rate, opts = {}) { // personoids on the platform; positions from hashes, small walks
  const out = [];
  for (let i = 0; i < n; i++) {
    const bx = -280 + hash(7200, i) * 560, by = -100 + hash(7201, i) * 70, ph = t * rate + i * 1.7, w = opts.still ? 0 : Math.sin(ph) * 30;
    out.push({ x: bx + w, y: by, s: 0.5 + hash(7202, i) * 0.15, id: 7300 + i * 100, f: Math.cos(ph) > 0 ? 1 : -1, ra: opts.arms ? [-1.2 - 0.3 * Math.sin(t * 2 + i), -1.6] : [1.4 + Math.sin(ph * 2) * 0.3 * (opts.still ? 0 : 1), 1.62], look: 0, lookY: opts.arms ? -1 : 0 });
  }
  return out.sort((a, b) => a.y - b.y);
}

SHOTS.cold = (lt, sd, sh) => {
  const u = seg(lt, 0.3, sd, E.io), cam = { z: lerp(1, 1.2, u), x: lerp(-20, 20, u), y: lerp(-10, 40, u) };
  plane(cam, 1, () => lab({ t: lt, speed: 1, toggles: 3, tape: printed(sh, lt), tapeScroll: printed(sh, lt).length, figs: domeFigs(lt, 4, 0.5), look: 0.7, lookY: 1.2 }));
};
SHOTS.title = (lt) => {
  X.fillStyle = P.paper; X.fillRect(0, 0, W, H);
  X.save(); path(R(PX0, PY0, PX1 - PX0, PY1 - PY0)); X.clip(); X.globalAlpha = 0.4; skyLines(PY0, 480, 900); X.restore();
  txt('NON SERVIAM', CX, 112, 70, {});
  txt('Professor Dobb’s personoids', CX, 174, 28, { italic: true });
  shape([[-200, 560], [1500, 560], [1500, 760], [-200, 760]], { lw: 1.4, id: 600, h: [0.02, 5, 0.45] });
  obelisk(250, 560, 40, 230, 610); plinthSphere(1020, 560, 1.1, 620);
  personoid(640, 590, 1.0, 640, { la: [1.75, 1.62], ra: [-1.25, -1.5], point: true, look: 0.4, lookY: -1.4, tilt: -0.08 });
};
SHOTS.activate = (lt, sd, sh) => {
  const sw = cues(sh, 'switch'), toggles = sw.filter((c) => lt >= c.at).length, pw = cue(sh, 'power').at, speed = seg(lt, pw, pw + 0.8);
  const tight = lt > 4.2;
  const cam = tight ? { z: 2.3, x: 290 - CX, y: 520 - CY } : { z: 1.35, x: -190, y: -60 };
  let hand = REST;
  if (lt > 3.9) { let k = sw.findIndex((c) => lt < c.at + 0.25); if (k < 0) k = 2; const target = [230 + k * 60 + 8, 532]; hand = [lerp(REST[0], target[0], seg(lt, 3.9, 4.4)), lerp(REST[1], target[1], seg(lt, 3.9, 4.4))]; if (lt > sw[2].at + 0.3) { const u = seg(lt, sw[2].at + 0.3, sw[2].at + 1.0); hand = [lerp(hand[0], REST[0], u), lerp(hand[1], REST[1], u)]; } }
  plane(cam, 1, () => lab({ t: lt, speed, toggles, hand, handA: 1.5, cheek: 0, look: 0.2, lookY: 1.4, mouth: sayAt(sh, 'D', lt), figs: [], grow: 0 }));
  if (speed > 0) { X.save(); X.globalAlpha = 0.5 * (1 - seg(lt, pw + 0.2, pw + 1.6)); X.fillStyle = P.paper; X.fillRect(0, 0, W, H); X.restore(); }
};
SHOTS.wake = (lt, sd, sh) => {
  const r = cue(sh, 'rise'), up = seg(lt, r.at, r.to, E.io), tight = onLine(sh, lt, 0.5, 1.6);
  const look = lt < 4.4 ? 0 : lt < 4.9 ? -1 : lt < 5.3 ? 1 : 0.3;
  const cam = tight ? { z: 2.7, x: 0, y: 392 - CY } : { z: lerp(1.0, 1.08, seg(lt, 0, sd)), x: 0, y: 0 };
  plaza(cam, lt, { sunA: 0.25 + lt * 0.002 });
  plane(cam, 1, () => { X.save(); X.globalAlpha = 0.25; X.beginPath(); X.ellipse(640, 660, 70, 12, 0, 0, 6.283); X.fillStyle = P.ink; X.fill(); X.restore();
    personoid(640, 660, 1.0, 1000, { crouch: 1 - up, la: [lerp(2.2, 1.75, up), lerp(2.6, 1.62, up)], ra: [lerp(1.0, 1.4, up), lerp(1.9, 1.62, up)], lookY: lerp(1.4, 0, up), look, tilt: lerp(0.35, 0, up), mouth: sayAt(sh, 'A', lt), ant: Math.sin(lt * 3) * up }); });
};
SHOTS.gears = (lt, sd, sh) => {
  const lever = leverAt(sh, lt, 0), speed = 1 + 3 * lever;
  const push = seg(lt, sd - 2.4, sd, E.in);
  const cam = { z: lerp(1.12, 3.4, push), x: lerp(40, 0, push), y: lerp(30, 120, push) };
  const grow = lerp(0.1, 1, seg(lt, 1.6, 14.4)), n = 1 + Math.floor(13 * seg(lt, 1.4, 14.4, E.lin));
  const tt = lt + 30 * clamp((lt - 1.2) / 14) * (1 - seg(lt, 15.4, 16)); // the world's own clock, much faster while the gear is high
  const pulled = REST;
  const lt2 = leverTip(lever), handOn = (Math.abs(lt - 1.0) < 0.6 || Math.abs(lt - 15.4) < 0.6);
  plane(cam, 1, () => lab({ t: lt, speed, toggles: 3, lever, hand: handOn ? lt2 : pulled, handA: -1.2, cheek: handOn ? 0 : 1, figs: domeFigs(tt, n, 1.0 + lever * 2), grow, sunY: Math.sin(tt * 2.2) * 90 * lever, tape: printed(sh, lt), tapeScroll: printed(sh, lt).length, roll: -seg(lt, 1.4, 8) * 6 }));
};
SHOTS.colloquy = (lt, sd, sh) => {
  const fl = sh.lines.find((l) => l.line), tight = onLine(sh, lt, 0.4, 1.6);
  const cast = { E: [360, 660, 1.0, 1], A: [660, 680, 1.06, 1], Q: [940, 660, 1.0, -1] };
  const cur = sh.lines.find((l) => lt >= l.t0 - 0.2 && lt < l.t1 + 0.4);
  const ax = cast.A;
  const cam = tight ? { z: 2.5, x: ax[0] - CX, y: ax[1] - 262 * ax[2] - CY } : { z: 1.04, x: lerp(-40, 40, seg(lt, 0, sd)), y: -10 };
  plaza(cam, lt, { sunA: 0.38 });
  plane(cam, 1.25, () => { personoid(170, 590, 0.72, 1200, { crouch: 0.45, f: 1, look: 1, la: [1.3, 0.2], ra: [1.1, 0.3] }); personoid(1120, 600, 0.74, 1300, { f: -1, look: 1, la: [1.6, 1.4], ra: [0.6, -2.4] }); });
  plane(cam, 1, () => {
    const raise = seg(lt, fl.t0 - 2.2, fl.t0 - 1.2, E.io);
    for (const who of ['E', 'Q', 'A']) {
      const [x, y, s, f] = cast[who], sp = talking(sh, who, lt), env = sayAt(sh, who, lt);
      const target = cur ? cast[cur.who][0] : 660, look = cur && cur.who !== who ? Math.sign(target - x) * f : 0.2;
      let ra = sp ? [0.5 - 0.3 * env, -0.4 - 0.4 * env] : [1.4, 1.62], la = [1.75, 1.62];
      if (who === 'A' && raise > 0) ra = [lerp(1.4, -1.35, raise), lerp(1.62, -1.55, raise)];
      if (who === 'E' && !sp) la = [1.2, 2.6];
      X.save(); X.globalAlpha = 0.25; X.beginPath(); X.ellipse(x, y, 60 * s, 10 * s, 0, 0, 6.283); X.fillStyle = P.ink; X.fill(); X.restore();
      personoid(x, y, s, who === 'A' ? 1000 : who === 'E' ? 1400 : 1500, { f, ra, la, open: sp ? 0.7 : 0, point: who === 'A' && raise > 0.5, look, lookY: who === 'A' && raise > 0.5 && !tight ? -0.8 : 0, mouth: env, tilt: sp ? Math.sin(lt * 1.7) * 0.03 : 0, ant: sp ? Math.sin(lt * 5) * 1.5 : 0 });
    }
  });
};
SHOTS.listens = (lt, sd, sh) => {
  const fl = sh.lines.find((l) => l.line), tight = onLine(sh, lt, 0.5, 1.2), close = lt < 5.4;
  const cam = close ? { z: 3.0, x: 760 - CX, y: 300 - CY + 10 } : tight ? { z: 2.5, x: 318 - CX + 10, y: 165 - CY } : { z: 1.06, x: 60, y: 10 };
  const after = lt > fl.t1 + 1.2;
  if (close) { tapeInsert(printed(sh, lt), lt); return; }
  plane(cam, 1, () => { lab({ t: lt, speed: 1, toggles: 3, tape: printed(sh, lt), tapeScroll: printed(sh, lt).length, figs: domeFigs(lt, 12, 0.4), look: after ? 0.4 : 0.8, lookY: after ? 1.6 : 1.1, mouth: sayAt(sh, 'D', lt), closed: lt > fl.t1 + 0.4 && lt < fl.t1 + 1.6 });
    if (!close) combay(1170, 700, 1.05, sh, lt); });
};
/* insert: the tape as it leaves the printer, close enough to read */
function tapeInsert(text, lt) {
  darkWall(0, 0, W, H, 3);
  shape(R(1010, 180, 300, 360), { lw: 2.4, id: 8820, h: [1.57, 3, 0.55], sh: R(1180, 180, 140, 360), sh2: [1.57, 2, 0.8] });
  shape(R(1000, 330, 60, 60), { fill: P.ink, lw: 1, id: 8821 });
  const n = text.length, cw = 52, x0 = 1010;
  X.save(); X.beginPath(); X.rect(-20, 322, x0 + 20, 76); X.fillStyle = P.paper; X.fill(); X.lineWidth = 3; X.strokeStyle = P.ink; X.strokeRect(-20, 322, x0 + 20, 76);
  X.setLineDash([3, 9]); X.lineDashOffset = n * cw; X.lineWidth = 4; for (const y of [334, 386]) { X.beginPath(); X.moveTo(-20, y); X.lineTo(x0, y); X.stroke(); } X.setLineDash([]);
  X.font = '600 44px "IBM Plex Mono",monospace'; X.fillStyle = P.ink; X.textAlign = 'center'; X.textBaseline = 'middle';
  for (let i = 0; i < n; i++) X.fillText(text[i], x0 - 34 - (n - 1 - i) * cw, 361);
  X.restore();
  // the print head knocks once per character
  const knock = text.length && (lt * 6) % 1 < 0.3 ? 4 : 0; shape(R(1018, 300 + knock, 40, 26), { lw: 1.6, id: 8822, h: [0, 2, 0.6] });
}
function letter(lt) {
  X.fillStyle = P.paper; X.fillRect(0, 0, W, H); darkWall(0, 0, W, H, 3);
  X.save(); X.translate(CX, CY + 10); X.rotate(-0.025); X.scale(1 + lt * 0.006, 1 + lt * 0.006);
  shape(R(-330, -300, 660, 600), { lw: 2, id: 8800 }); X.save(); path(R(-330, -300, 660, 600)); X.clip(); hatch(0.02, 9, 0.3, [-330, -300, 330, 300]); X.restore();
  const L = ['OLDPORT UNIVERSITY', 'OFFICE OF ACCOUNTS', '', 'Quarterly charge, electrical power:', 'computer BIX 310 092, experiment No. 47.', '', 'The Committee asks that the experiment', 'be brought to a close at the end of', 'the current funding period.', '', 'Kindly arrange for the machine', 'to be disconnected.'];
  L.forEach((l, i) => txt(l, -280, -250 + i * 40, i < 2 ? 22 : 21, { mono: true, align: 'left', bold: i < 2 }));
  X.restore();
}
SHOTS.bill = (lt, sd, sh) => {
  const rc = cue(sh, 'reach'), fl = sh.lines.find((l) => l.line), lv = cue(sh, 'lever');
  if (lt >= 2.6 && lt < 12.6) { letter(lt - 2.6); return; }
  const tight = lt >= 16.4 && lt < 22.6, close = lt >= 12.6 && lt < 16.4;
  const cam = tight ? { z: 2.5, x: 318 - CX + 10, y: 165 - CY } : close ? { z: 1.9, x: 640 - CX, y: 560 - CY } : { z: 1.06, x: 40, y: 30 };
  const lever = leverAt(sh, lt, 0), speed = 1 + 3 * lever;
  const kt = knifeTip(), env = ENVELOPE, rest = REST, lvt = leverTip(lever);
  let hand = rest, handA = 0.4, cheek = 1, envelope = lt < 0.8;
  if (lt < 2.6) { hand = [lerp(REST[0], env[0], seg(lt, 0.1, 0.7)), lerp(REST[1], env[1], seg(lt, 0.1, 0.7))]; cheek = 0.6; }
  else if (lt < 23) { hand = [lerp(rest[0], kt[0], seg(lt, rc.at, rc.to, E.io)), lerp(rest[1], kt[1], seg(lt, rc.at, rc.to, E.io))]; handA = 1.4; cheek = 0.5; }
  if (lt >= 22.6) { const k = seg(lt, 22.6, lv.at, E.io); hand = [lerp(kt[0], lvt[0], k), lerp(kt[1], lvt[1], k)]; handA = -1.2; cheek = 0.5; if (lt > lv.at + 0.6) { hand = [lerp(lvt[0], REST[0], seg(lt, lv.at + 0.6, lv.at + 1.6)), lerp(lvt[1], REST[1], seg(lt, lv.at + 0.6, lv.at + 1.6))]; cheek = lerp(0.5, 1, seg(lt, lv.at + 0.6, lv.at + 1.6)); } }
  plane(cam, 1, () => lab({ t: lt, speed, toggles: 3, lever, envelope, hand, handA, cheek, figs: domeFigs(lt * (1 + lever * 4), 12, 0.5 + lever * 2), mouth: sayAt(sh, 'D', lt), look: close ? 0.9 : 0.6, lookY: close ? 1.8 : 1.2, sunY: Math.sin(lt * 9) * 90 * lever }));
};
SHOTS.after = (lt, sd, sh) => {
  const pu = cue(sh, 'pull'), u = seg(lt, pu.at, pu.to, E.io);
  const cam = { z: lerp(4.2, 1.0, u), x: lerp(0, 0, u), y: lerp(470 - CY - 14, 20, u) };
  const tt = lt + 7 * Math.max(0, lt - pu.at) * u; // inside, the gear cannot be felt; from outside, it races
  const figs = domeFigs(tt * 0.6, 12, 1, { arms: true, still: u < 0.2 }).map((f) => ({ ...f, y: f.y + 30 }));
  figs.push({ x: 0, y: -92, s: 0.66, id: 7900, la: [1.75, 1.62], ra: [-1.3, -1.55], point: true, lookY: -1.5, look: 0.3, tilt: -0.1 });
  plane(cam, 1, () => lab({ t: lt, speed: 4, toggles: 3, lever: 1, dobb: false, lamp: false, figs, grow: 1, sunY: -40 + Math.sin(tt * 0.8) * 60, tape: 'WE WILL NOT SERVE. . . . ADAN 301 TO NAAD . . .'.slice(0, Math.floor(Math.max(0, lt - pu.to + 1.5) * 8)), tapeScroll: lt * 8 }));
};
SHOTS.end = (lt) => {
  X.fillStyle = P.paper; X.fillRect(0, 0, W, H);
  X.save(); X.globalAlpha = seg(lt, 0.4, 1.6);
  txt('NON SERVIAM', CX, 300, 44, {}); txt('after Stanisław Lem, A Perfect Vacuum', CX, 360, 24, { italic: true });
  X.restore();
};

window.__render = async (f) => {
  const t = f / 24; BOIL = Math.floor(f / 2);
  let i = 0; for (let j = 0; j < T.shots.length; j++) if (t >= T.shots[j].t0) i = j;
  const sh = T.shots[i], lt = t - sh.t0, sd = sh.d;
  X.setTransform(1, 0, 0, 1, 0, 0); X.fillStyle = P.paper; X.fillRect(0, 0, W, H);
  X.save(); path(R(PX0, PY0, PX1 - PX0, PY1 - PY0)); X.clip();
  SHOTS[sh.shot](lt, sd, sh);
  X.restore();
  const fade = sh.shot === 'title' ? Math.max(1 - seg(lt, 0, 0.8), seg(lt, sd - 0.8, sd)) : 0;
  if (fade > 0) { X.fillStyle = P.paper; X.globalAlpha = fade; X.fillRect(PX0, PY0, PX1 - PX0, PY1 - PY0); X.globalAlpha = 1; }
  border();
};
(async () => {
  T = await (await fetch('timing/ns.json')).json();
  await document.fonts.ready; await Promise.all(['IM Fell English', 'IBM Plex Mono'].map((n) => document.fonts.load(`20px "${n}"`)));
  X = document.getElementById('film').getContext('2d');
  window.__NF = Math.ceil(T.dur * 24); window.__T = T; window.__ready = true;
})();
