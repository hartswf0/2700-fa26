/* The Fourth Sally, or How Trurl Built a Femfatalatron: drawing. Same toolkit as the earlier films (ink.js plus the head of the Ferrix drawing file).
   The device: measurement and the wrong variable. The machine is a wall of dials; every needle goes to its stop, and nothing changes,
   because the thing to change was not inside the prince. Later the same kind of dial hangs on the Emperor's wall, and that one moves. */
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
   THE FEMFATALATRON
   The device: measurement and the wrong variable. The dials are the main picture of the first half; the same kind of dial
   hangs on the Emperor's wall in the second half, as an economy gauge that sinks while the babies pile up.
   ================================================================================================ */
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
/* the Grand Seneschal: an electroknight in polished armor, jeweled eyes, antennas swept back, a stole of diamonds */
function knightF(x, y, s, sh, lt, o = {}) {
  const { sp, e } = armsFor(sh, 'G', lt, o), f = o.f || 1;
  const ra = o.ra || (sp ? [-0.4 - e * 0.3, -0.5 - e * 0.5] : [1.45, 1.5]);
  constructor_(x, y, s, 700, { f, seated: o.seated, ra, la: o.la || [1.35, 1.6], open: sp ? 0.9 : 0, look: o.look ?? 1, mouth: e, tilt: o.tilt || 0, walk: o.walk || 0, ph: o.ph || 0, hair: false, glasses: false, mus: false, stern: true });
  X.save(); X.translate(x, y); X.scale(s * f, s);
  shape([[-40, -226], [40, -226], [30, -168], [-30, -168]], { lw: 2, id: 710, fill: '#dcd6c6', h: [0.3, 4, 0.5], sh: [[12, -228], [42, -228], [32, -166], [12, -166]], sh2: [1.65, 2.2, 0.7] });
  for (const d of [-1, 1]) { X.beginPath(); X.ellipse(d * 40, -222, 22, 15, 0, 0, 6.2832); X.fillStyle = P.paper; X.fill(); X.lineWidth = 2; X.strokeStyle = P.ink; X.stroke(); X.save(); X.clip(); hatch(0.2, 3.2, 0.7, [d * 40 - 22, -238, d * 40 + 22, -206]); X.restore(); }
  for (const d of [-1, 1]) for (let i = 0; i < 6; i++) { const px = d * (28 - i * 1.5), py = -224 + i * 18, r_ = 5.5; shape([[px, py - r_], [px + r_ * 0.7, py], [px, py + r_], [px - r_ * 0.7, py]], { lw: 1, id: 720 + i + d * 10, fill: P.paper }); if ((Math.floor(lt * 3) + i) % 5 === 0) star(px, py, 9, 730 + i, P.ink, 4); }
  X.restore();
  // the helmet over the box head: crenellated, two antennas swept back, jeweled eyes
  const hx = x, hy = y - 286 * s, k = 0.95 * s;
  X.save(); X.translate(hx, hy); X.scale(k * f, k);
  const pr = o.purr ? Math.sin(lt * 60) * 1.2 : 0;
  shape([[-29, -14], [-29, -46], [-20, -46], [-20, -52], [-8, -52], [-8, -46], [8, -46], [8, -52], [20, -52], [20, -46], [29, -46], [29, -14]], { lw: 2, id: 740, fill: '#dcd6c6', h: [Math.PI / 2, 3, 0.6] });
  for (const d of [-1, 1]) { const tip = [-58 + d * 6 + pr, -86 - d * 8]; ink([[d * 10, -50], [d * 10 - 18, -70], tip], 2, 745 + d, 0.2); ball(tip[0], tip[1], 4.5, 748 + d, PAT.d, 1); }
  for (const ex of [-11, 11]) { X.beginPath(); X.arc(ex, -9, 5.5, 0, 6.2832); X.fillStyle = P.amber; X.fill(); X.lineWidth = 1.4; X.strokeStyle = P.ink; X.stroke(); star(ex, -9, 9 + 2 * Math.sin(lt * 4 + ex), 750 + ex, P.ink, 6); }
  if (o.purr) for (let i = 0; i < 3; i++) { const r_ = 40 + i * 9 + ((lt * 30) % 9); X.save(); X.globalAlpha = 0.5; X.beginPath(); X.arc(0, -40, r_, -2.6, -0.5); X.lineWidth = 1; X.strokeStyle = P.ink; X.stroke(); X.restore(); }
  X.restore();
  if (o.sword) { const h = handPos(x, y, s, f, ra); line(h, o.sword, 3.4, 760, 0.1); const a = Math.atan2(o.sword[1] - h[1], o.sword[0] - h[0]); line([h[0] - Math.sin(a) * 14, h[1] + Math.cos(a) * 14], [h[0] + Math.sin(a) * 14, h[1] - Math.cos(a) * 14], 4, 761, 0.1); }
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
/* Prince Pantagoon: pale rose robe, a thin circlet, eyes down; lovesick = a hand on the chest */
function princeF(x, y, s, sh, lt, o = {}) {
  const f = o.f || 1, e = sh ? sayAt(sh, 'P', lt) : 0;
  const ra = o.ra || (o.sick ? [1.9, 3.4] : [1.5, 1.6]);
  rotAbout(x, y, o.rot || 0, () => {
    constructor_(x, y, s, 900, { robe: true, robeFill: PALEROSE, f, ra, la: o.la || [1.45, 1.7], look: o.look ?? 0, lookY: o.lookY ?? 1, mouth: e, tilt: o.tilt ?? 0.12, closed: o.closed, walk: o.walk || 0, ph: o.ph || 0, sway: o.sway || 0 });
    crown(x, y - 286 * s - 36 * 0.95 * s + 8 * s, 0.7 * s, 940);
  });
}
function princessF(x, y, s, lt, o = {}) {
  const f = o.f || 1;
  constructor_(x, y, s, 1000, { robe: true, robeFill: '#f2e6cf', f, ra: o.ra || [1.5, 1.6], la: [1.4, 1.65], look: o.look ?? 1, mouth: 0, tilt: -0.05, glasses: false, mus: false });
  const hx = x, hy = y - 286 * s; X.save(); X.globalAlpha = 0.55; shape([[hx - 30 * s, hy - 40 * s], [hx + 30 * s, hy - 40 * s], [hx + 54 * s, hy + 120 * s], [hx - 54 * s, hy + 120 * s]], { lw: 1, id: 1040, fill: P.paper, h: [1.2, 5, 0.4] }); X.restore();
  for (let i = -2; i <= 2; i++) ball(hx + i * 9 * s, hy - 42 * s - (2 - Math.abs(i)) * 4 * s, 3.5 * s, 1050 + i, PAT.f, 1);
}
function pillow(x, y, s, id) { shape(blobPts(x, y, 18 * s, 11 * s, id, 18, 0.08), { lw: 1.3, id, fill: P.paper, h: [0.6, 3, 0.4] }); }
function peer(x, y, s, id, o = {}) { micro(x, y, s, id, { f: o.f || 1, walk: o.walk || 0, ph: o.ph || 0, wave: o.wave ?? 0.6, look: o.look || 0, tilt: o.tilt || 0, ant: -3 }); shape([[x - 6 * s, y - 40 * s], [x + 6 * s, y - 40 * s], [x, y - 30 * s]], { lw: 0.8, id: id + 60, fill: P.paper }); if (o.pillow !== false) pillow(x + (o.f || 1) * 20 * s, y - 30 * s, s, id + 70); }
function mason(x, y, s, id, o = {}) { micro(x, y, s, id, { f: o.f || 1, walk: o.walk || 0, ph: o.ph || 0, wave: 0.3, look: o.f || 1, tilt: o.tilt || 0, bob: o.bob || 0 }); const hx = x + (o.f || 1) * 16 * s, hy = y - 38 * s; line([hx, hy], [hx + (o.f || 1) * 12 * s, hy - 16 * s], 2, id + 80, 0.1); shape(R(hx + (o.f || 1) * 8 * s, hy - 22 * s, 12 * s, 7 * s), { lw: 1, id: id + 81, fill: P.ink }); shape(R(x - 9 * s, y - 56 * s, 18 * s, 5 * s), { lw: 1, id: id + 82, fill: P.ink }); }
function smokeCurls(x, y, lt, id, a = 1, s = 1) { for (let i = 0; i < 4; i++) { const u = ((lt * 0.7 + i / 4) % 1), pts = []; for (let j = 0; j <= 10; j++) { const v = j / 10; pts.push([x + Math.sin(v * 6 + lt * 3 + i) * 6 * s * (1 + u * 2), y - (u * 50 + v * 26) * s]); } X.save(); X.globalAlpha = a * (1 - u); ink(pts, 1.6, id + i, 0.4); X.restore(); } }
function sack(x, y, r, id) { const p = blobPts(x, y, r, r * 0.82, id, 20, 0.12, 0.5); shape(p, { lw: 1.4, id, fill: '#e2d8bf', h: [0.5 + hash(id, 1) * 1.2, 3.2, 0.45] }); line([x - r * 0.25, y - r * 0.8], [x + r * 0.25, y - r * 0.8], 2.4, id + 1, 0.1); shape([[x - 4, y - r * 0.8], [x - 7, y - r * 1.15], [x + 7, y - r * 1.15], [x + 4, y - r * 0.8]], { lw: 1, id: id + 2, fill: P.paper }); }
function porter(x, y, s, id, o = {}) { micro(x, y, s, id, { f: o.f || 1, walk: o.walk || 0, ph: o.ph || 0, wave: o.carry ? 1 : 0, look: o.f || 1 }); if (o.carry) sack(x, y - 64 * s, 14 * s, id + 90); }

/* ---------- babies ---------- */
function baby(x, y, s, id, o = {}) {
  const f = o.f || 1, ph = o.ph || 0, cr = o.crawl ?? 1;
  X.save(); X.translate(x, y); X.scale(s * f, s);
  for (const [lx, k] of [[-10, 0], [8, 1]]) { const sw = Math.sin(ph + k * Math.PI) * 6 * cr; line([lx, -12], [lx + sw, 0], 3.2, id + k, 0.1); line([lx + 6, -12], [lx + 6 - sw, 0], 3.2, id + k + 2, 0.1); }
  X.beginPath(); X.ellipse(-2, -16, 17, 10, 0, 0, 6.2832); X.fillStyle = P.paper; X.fill(); X.lineWidth = 1.5; X.strokeStyle = P.ink; X.stroke();
  shape([[-19, -20], [-6, -24], [-4, -8], [-17, -9]], { lw: 1.1, id: id + 5, fill: '#f6f1e2', h: [0.8, 3, 0.4] });
  ball(17, -22 - Math.abs(Math.sin(ph * 0.5)) * 1.5, 10.5, id + 6, NOPAT, 1.4, P.paper, true);
  X.fillStyle = P.ink; X.fillRect(20, -25, 2.2, 2.2); X.beginPath(); X.arc(20, -19, 3, 0.2, 2.6); X.lineWidth = 1.1; X.stroke();
  ink([[14, -32], [16, -36], [19, -33]], 1, id + 7, 0.1);
  X.restore();
}
function bundle(x, y, s, id, o = {}) {
  const sw = o.sway || 0; X.save(); X.translate(x, y); X.rotate(sw * 0.15); X.scale(s, s);
  if (o.chute !== 0) { const c = o.chute ?? 1; X.save(); X.globalAlpha = c; const top = -78;
    for (const d of [-1, -0.35, 0.35, 1]) line([d * 36, top + 6], [d * 6, -18], 0.8, id + 10 + d * 10, 0.1);
    X.beginPath(); X.ellipse(0, top, 40, 26, 0, Math.PI, 0); X.closePath(); X.fillStyle = P.paper; X.fill(); X.lineWidth = 1.6; X.strokeStyle = P.ink; X.stroke();
    X.save(); X.clip(); for (let i = -3; i <= 3; i += 2) { X.beginPath(); X.moveTo(i * 10, top); X.lineTo(i * 6, top - 30); X.lineTo(i * 6 + 10, top - 30); X.lineTo(i * 10 + 10, top); X.fillStyle = 'rgba(194,93,118,.35)'; X.fill(); } X.restore(); X.restore(); }
  X.beginPath(); X.ellipse(0, 0, 13, 19, 0, 0, 6.2832); X.fillStyle = '#f6f1e2'; X.fill(); X.lineWidth = 1.5; X.strokeStyle = P.ink; X.stroke();
  line([-12, -4], [12, 6], 1, id + 1, 0.1); line([-12, 6], [12, -4], 1, id + 2, 0.1);
  ball(0, -18, 9, id + 3, NOPAT, 1.3, P.paper, true); X.fillStyle = P.ink; X.fillRect(-4, -20, 2, 2); X.fillRect(2, -20, 2, 2); X.beginPath(); X.arc(0, -15, 2.4, 0.3, 2.8); X.lineWidth = 1; X.stroke();
  X.restore();
}
/* the population: baby i lands at time T_i (count grows faster and faster), drifts down on a chute, then crawls */
function babyCrowd(t0, lt, area, id, o = {}) {
  const N = o.max || 140, el = lt - t0; if (el < 0) return 0;
  const k = o.k || 0.22, cnt = Math.min(N, Math.floor(o.a * (Math.exp(k * el) - 1)));
  let landed = 0;
  for (let i = 0; i < Math.min(N, cnt + 6); i++) {
    const ti = Math.log(i / o.a + 1) / k, age = el - ti; if (age < 0) continue;
    const fall = o.fall ?? 2.2, gx = area[0] + hash(id, i) * (area[2] - area[0]), gy = area[1] + hash(id + 1, i) * (area[3] - area[1]);
    const sc = (o.s || 0.6) * (0.75 + 0.5 * hash(id + 2, i)) * (gy - area[1] + 60) / (area[3] - area[1] + 60);
    if (o.walkIn) { const s0 = hash(id + 4, i) > 0.5 ? area[0] - 60 : area[2] + 60, trav = Math.abs(gx - s0) / 90; if (age < trav) { baby(lerp(s0, gx, age / trav), gy, sc, id + 300 + i * 9, { f: sgn(gx - s0), ph: lt * 9 + i }); landed++; continue; } }
    else if (age < fall) { const u = age / fall; bundle(gx + Math.sin(age * 2 + i) * 14, gy - (1 - u) * (o.drop || 380), sc * 1.2, id + 10 + i, { sway: Math.sin(age * 2.2 + i) }); continue; }
    landed++;
    const ca = o.walkIn ? age - Math.abs(gx - (hash(id + 4, i) > 0.5 ? area[0] - 60 : area[2] + 60)) / 90 : age - fall, v = (hash(id + 3, i) - 0.5) * 50, span = area[2] - area[0];
    let px = gx + v * ca; px = area[0] + ((((px - area[0]) % (2 * span)) + 2 * span) % (2 * span)); let f = sgn(v); if (px > area[0] + span) { px = area[0] + 2 * span - (px - area[0]); f = -f; }
    const grow = 1 + Math.min(0.5, ca * 0.04);
    if (ca < 0.6 && !o.walkIn) bundle(px, gy - 18 * sc, sc * 1.2, id + 10 + i, { chute: 1 - ca / 0.6, sway: 0 }); else baby(px, gy, sc * grow, id + 300 + i * 9, { f, ph: lt * 9 + i });
  }
  return landed;
}

/* ---------- gauges: the machine's dials, and later the Emperor's ---------- */
function gauge(x, y, r, v, id, o = {}) {
  const a0 = Math.PI * 0.75, a1 = Math.PI * 2.25, n = o.ticks || 8;
  X.beginPath(); X.arc(x, y, r + 7, 0, 6.2832); X.fillStyle = o.rim || BRASS; X.fill(); X.lineWidth = 2.4; X.strokeStyle = P.ink; X.stroke();
  X.beginPath(); X.arc(x, y, r, 0, 6.2832); X.fillStyle = '#f6f1e2'; X.fill(); X.lineWidth = 1.4; X.stroke();
  // the red zone at the top of the scale (or the bottom, for the economy)
  const rz = o.redLow ? [a0, a0 + (a1 - a0) * 0.18] : [a1 - (a1 - a0) * 0.16, a1];
  X.beginPath(); X.arc(x, y, r * 0.84, rz[0], rz[1]); X.lineWidth = r * 0.12; X.strokeStyle = 'rgba(179,64,44,.75)'; X.stroke();
  for (let i = 0; i <= n * 2; i++) { const a = a0 + (a1 - a0) * i / (n * 2), big = i % 2 === 0; line([x + Math.cos(a) * r * (big ? 0.72 : 0.8), y + Math.sin(a) * r * (big ? 0.72 : 0.8)], [x + Math.cos(a) * r * 0.92, y + Math.sin(a) * r * 0.92], big ? 1.8 : 1, id + i, 0.05); }
  if (o.nums) o.nums.forEach((s_, i) => { const a = a0 + (a1 - a0) * i / (o.nums.length - 1); txt(s_, x + Math.cos(a) * r * 0.57, y + Math.sin(a) * r * 0.57 + 1, Math.max(7, r * 0.15), { mono: true }); });
  if (o.label) txt(o.label, x, y + r * 0.62, Math.max(7, r * 0.15), { mono: true, bold: true });
  if (o.unit) txt(o.unit, x, y + r * 0.8, Math.max(6, r * 0.12), { mono: true, italic: false });
  // the stop peg
  const ps = a1 + 0.08; ball(x + Math.cos(ps) * r * 0.86, y + Math.sin(ps) * r * 0.86, Math.max(2.5, r * 0.05), id + 50, PAT.d, 1);
  const vv = clamp(v, 0, 1.0) + (o.chatter || 0) * (v >= 0.99 ? Math.abs(Math.sin(GT * 47 + id)) * 0.035 - 0.02 : Math.sin(GT * 31 + id) * 0.015);
  const bend = o.bend || 0, a = a0 + (a1 - a0) * Math.min(1.02, vv);
  const tipR = r * 0.88, mid = [x + Math.cos(a) * tipR * 0.55, y + Math.sin(a) * tipR * 0.55];
  ink([[x - Math.cos(a) * r * 0.16, y - Math.sin(a) * r * 0.16], mid, [mid[0] + Math.cos(a + bend) * tipR * 0.45, mid[1] + Math.sin(a + bend) * tipR * 0.45]], Math.max(1.6, r * 0.045), id + 60, 0.05, P.red);
  ball(x, y, Math.max(3, r * 0.08), id + 61, PAT.d, 1.2);
  // glass: a sheen, and cracks
  X.save(); X.globalAlpha = 0.4; X.beginPath(); X.arc(x, y, r * 0.95, 3.6, 4.6); X.lineWidth = r * 0.08; X.strokeStyle = P.paper; X.stroke(); X.restore();
  if (o.crack > 0) { const c = o.crack; for (let i = 0; i < 6; i++) { const an = hash(id, i + 70) * 6.28; ink([[x + Math.cos(an) * r * 0.1, y + Math.sin(an) * r * 0.1], [x + Math.cos(an + 0.2) * r * 0.5 * c, y + Math.sin(an + 0.2) * r * 0.5 * c], [x + Math.cos(an - 0.1) * r * 0.95 * c, y + Math.sin(an - 0.1) * r * 0.95 * c]], 1, id + 80 + i, 0.3); } }
}
/* the rapturometer: a glass tube of mercury; burst >= 0 is the time since it broke */
function thermo(x, y, h, v, id, o = {}) {
  const w = 16, top = y - h, b = o.burst ?? -1;
  if (b < 0) {
    shape([[x - w / 2, y], [x - w / 2, top + w / 2], [x, top - 2], [x + w / 2, top + w / 2], [x + w / 2, y]], { lw: 1.8, id, fill: '#f6f1e2' });
    for (let i = 0; i <= 10; i++) line([x + w / 2, y - 6 - i * (h - 16) / 10], [x + w / 2 + (i % 5 ? 6 : 11), y - 6 - i * (h - 16) / 10], 1, id + 10 + i, 0.05);
    const lv = clamp(v, 0, 1.1) + (o.chatter || 0) * Math.sin(GT * 40) * 0.01, mh = (h - 16) * lv + 6;
    shape(R(x - 3.5, y - mh, 7, mh), { lw: 0.8, id: id + 30, fill: P.ink });
  } else {
    shape(R(x - w / 2, y - h * 0.35, w, h * 0.35), { lw: 1.8, id, fill: '#f6f1e2' }); ink([[x - w / 2, y - h * 0.35], [x - 2, y - h * 0.42], [x + 3, y - h * 0.33], [x + w / 2, y - h * 0.4]], 1.4, id + 40, 0.3);
    for (let i = 0; i < 12; i++) { const an = -Math.PI / 2 + (hash(id, i) - 0.5) * 2.4, sp = 160 + 260 * hash(id + 1, i), tb = Math.min(b, 1.2); const px = x + Math.cos(an) * sp * tb, py = top + Math.sin(an) * sp * tb + 420 * tb * tb; if (tb < 1.15) { X.save(); X.translate(px, py); X.rotate(b * 9 + i); shape([[-5, -2], [6, -4], [2, 5]], { lw: 1, id: id + 50 + i, fill: P.paper }); X.restore(); } }
    for (let i = 0; i < 9; i++) { const fx = x - 30 + i * 9 + (hash(id + 2, i) - 0.5) * 8, fy = Math.min(o.floor ?? y + 60, y - h * 0.2 + b * 260 + i * 6), q = Math.sin(GT * 25 + i) * 1.2; X.beginPath(); X.ellipse(fx + q, fy, 3.6 + (i % 3), 2.4, 0, 0, 6.2832); X.fillStyle = '#9a9a9a'; X.fill(); X.lineWidth = 1; X.strokeStyle = P.ink; X.stroke(); }
  }
  ball(x, y + 8, 12, id + 60, NOPAT, 1.8, b < 0 ? P.ink : '#9a9a9a', true);
}
/* the dial panel in its glass case. st: p, e (0..1), r (rapturometer), burst, count (digit), chatter, knobs, lever, heavy, bend, crack */
function panel(cx, cy, s, st, id = 5000) {
  X.save(); X.translate(cx, cy); X.scale(s, s); const hv = st.heavy;
  const W2 = hv ? 230 : 200, H2 = hv ? 150 : 130;
  for (const d of [-1, 1]) shape(R(d * (W2 - 40) - 8, H2, 16, (st.legs ?? (GY - cy) / s) - H2), { lw: 1.6, id: id + 1 + d, h: [Math.PI / 2, 3, 0.6] });
  shape(R(-W2 - 10, -H2 - 10, 2 * W2 + 20, 2 * H2 + 20), { lw: 2.6, id: id + 3, fill: hv ? '#8c857a' : BRASS, h: hv ? [[0.7, 3.2, 0.7], [-0.7, 3.2, 0.5]] : [0.7, 4, 0.5] });
  shape(R(-W2, -H2, 2 * W2, 2 * H2), { lw: 1.6, id: id + 4, fill: '#ece4cf' });
  if (hv) for (let i = 0; i < 16; i++) { const px = -W2 - 5 + (i % 8) * (2 * W2 + 10) / 7, py = i < 8 ? -H2 - 5 : H2 + 5; ball(px, py, 3.2, id + 5 + i, PAT.d, 1); }
  const R1 = hv ? 82 : 66;
  gauge(-W2 * 0.52, -H2 * 0.18, R1, st.p ?? 0, id + 100, { nums: ['0', '10', '20', '30', '40'], label: 'POWER', unit: 'MEGAMORS', chatter: st.chatter, bend: st.bend || 0, crack: st.crack || 0, rim: hv ? '#a59e92' : BRASS });
  gauge(W2 * 0.2, -H2 * 0.18, R1, st.e ?? 0, id + 200, { nums: ['0', '25', '50', '75', '100'], label: 'EFFICIENCY', unit: 'PERCENT', chatter: st.chatter, rim: hv ? '#a59e92' : BRASS });
  thermo(W2 * 0.8, H2 * 0.55, H2 * 1.35, st.r ?? 0, id + 300, { burst: st.burst ?? -1, chatter: st.chatter, floor: (GY - cy) / s });
  txt('RAPTUROMETER', W2 * 0.8, H2 * 0.55 + 34, 8.5, { mono: true, bold: true });
  // the countdown drum
  shape(R(-26, -H2 + 4, 52, 30), { lw: 1.6, id: id + 20, fill: P.ink }); if (st.count != null) txt(String(st.count), 0, -H2 + 20, 22, { mono: true, bold: true, col: P.amber });
  // three knobs with their plates
  const kn = st.knobs || [0, 0, 0], names = ['ARDOR DAMPER', 'SIGH CONDENSER', 'SWOON REGULATOR'];
  for (let i = 0; i < 3; i++) { const kx = -W2 * 0.72 + i * W2 * 0.62, ky = H2 * 0.68, a = -2.4 + 4.8 * clamp(kn[i]); ball(kx, ky, 14, id + 400 + i, PAT.m, 1.6); line([kx, ky], [kx + Math.cos(a - Math.PI / 2) * 13, ky + Math.sin(a - Math.PI / 2) * 13], 2.4, id + 410 + i, 0.05, P.red); shape(R(kx - 44, ky + 18, 88, 15), { lw: 1, id: id + 420 + i, fill: '#f6f1e2' }); txt(names[i], kx, ky + 26, 7.5, { mono: true, bold: true }); }
  // the master switch
  const lv = st.lever ?? 0; shape(R(W2 + 10, -30, 22, 70), { lw: 1.8, id: id + 30, h: [0.1, 2.4, 0.7] }); const la = -2.2 + 1.6 * lv; line([W2 + 21, 5], [W2 + 21 + Math.cos(la) * 60, 5 + Math.sin(la) * 60], 5, id + 31, 0.1); ball(W2 + 21 + Math.cos(la) * 64, 5 + Math.sin(la) * 64, 8, id + 32, PAT.d, 1.4);
  // the glass front
  X.save(); X.globalAlpha = 0.28; for (const [u, ww] of [[0.12, 26], [0.2, 8], [0.66, 16]]) { const gx = -W2 + u * 2 * W2; X.beginPath(); X.moveTo(gx, -H2); X.lineTo(gx + ww, -H2); X.lineTo(gx + ww - H2, H2); X.lineTo(gx - H2, H2); X.fillStyle = P.paper; X.fill(); } X.restore();
  if (st.dark) { X.save(); X.globalAlpha = st.dark * 0.35; X.fillStyle = P.ink; X.fillRect(-W2, -H2, 2 * W2, 2 * H2); X.restore(); }
  X.restore();
}
const panelPt = (cx, cy, s, lx, ly) => [cx + lx * s, cy + ly * s];

/* ---------- the temple of contemplation, wired up ---------- */
function petals(x0, x1, y0, y1, n, id, lt, blow = 0) { for (let i = 0; i < n; i++) { const px = x0 + hash(id, i) * (x1 - x0) + blow * Math.sin(lt * 2 + i) * 30, py = y0 + hash(id + 1, i) * (y1 - y0) - blow * ((lt * 40 + i * 13) % 120); X.save(); X.translate(px, py); X.rotate(hash(id + 2, i) * 6.28 + blow * lt * 3); X.beginPath(); X.ellipse(0, 0, 6, 3.4, 0, 0, 6.2832); X.fillStyle = ROSE; X.fill(); X.lineWidth = 0.8; X.strokeStyle = P.ink; X.stroke(); X.restore(); } }
function perfume(x, y, lt, id, a = 1, big = 1) { for (let i = 0; i < 5; i++) { const u = ((lt * 0.35 + i / 5) % 1), pts = []; for (let j = 0; j <= 16; j++) { const v = j / 16; pts.push([x + (i - 2) * 22 * big + Math.sin(v * 7 + lt * 1.5 + i) * 14 * big * (0.5 + u), y - (u * 120 + v * 60) * big]); } X.save(); X.globalAlpha = a * (1 - u) * 0.8; ink(pts, 1.4, id + i, 0.4, ROSE); X.restore(); } }
function screenWave(x, y, w, h, lt, id, on = 1) { shape(R(x - w / 2, y - h / 2, w, h), { lw: 2, id, fill: DARK }); if (on <= 0) return; X.save(); X.globalAlpha = on; const pts = []; for (let i = 0; i <= 24; i++) { const u = i / 24; pts.push([x - w / 2 + 6 + u * (w - 12), y + Math.sin(u * 12 + lt * 6 + id) * h * 0.28 * Math.sin(u * Math.PI)]); } ink(pts, 1.6, id + 1, 0.2, P.paper); X.restore(); }
function temple(x, y, lt, o = {}) {
  const wired = o.wired ?? 1, hv = o.heavy || 0, on = o.on || 0, ap = o.apart || 0;
  const sx = on ? Math.sin(lt * 63) * on * 2.5 : 0;
  X.save(); X.translate(sx, 0);
  // steps
  for (let i = 0; i < 3; i++) shape(R(x - 240 + i * 14, y - 14 - i * 14, 480 - i * 28, 14), { lw: 1.6, id: 6000 + i, h: [0.05, 3, 0.5] });
  const base = y - 42, ch = 250, xs = [-180, -95, 95, 180];
  // the dome behind
  X.beginPath(); X.ellipse(x, base - ch - 40, 130, 110, 0, Math.PI, 0); X.fillStyle = P.paper; X.fill(); X.lineWidth = 2; X.strokeStyle = P.ink; X.stroke(); X.save(); X.clip(); hatch(0.9, 3.4, 0.6, [x - 130, base - ch - 150, x + 130, base - ch - 40]); X.restore();
  ball(x, base - ch - 152, 8, 6010, PAT.m, 1.4);
  // the cella wall and the trapdoor
  shape(R(x - 150, base - ch + 10, 300, ch - 10), { lw: 1.6, id: 6011, h: [Math.PI / 2, 4.4, 0.5] });
  const dop = o.door || 0;
  shape(R(x - 48, base - 160, 96, 160), { lw: 2.4, id: 6012, fill: o.night ? DARK : P.ink });
  if (dop < 0.98) { const w_ = 96 * (1 - dop); shape(R(x - 48, base - 160, w_, 160), { lw: 2.2, id: 6013, fill: hv ? '#8c857a' : '#d8cdb0', h: hv ? [[0.7, 3, 0.7], [-0.7, 3, 0.5]] : [Math.PI / 2, 5, 0.6] }); if (w_ > 20) ball(x - 48 + w_ - 12, base - 80, 5, 6014, PAT.d, 1); }
  for (const cx of xs) { column(x + cx, base - ch, base, 34, 6020 + cx); }
  shape(R(x - 210, base - ch - 34, 420, 26), { lw: 2, id: 6030, h: [0.05, 3, 0.6] });
  shape([[x - 220, base - ch - 34], [x, base - ch - 100], [x + 220, base - ch - 34]], { lw: 2, id: 6031, fill: P.paper, h: [0.4, 3.6, 0.5] });
  if (hv) { // iron plating bolted over everything
    shape(R(x - 236, base - ch - 40, 472, ch + 40), { lw: 3, id: 6040, fill: 'rgba(120,112,100,.55)', h: [[0.7, 3.2, 0.7], [-0.7, 3.2, 0.5]] });
    shape(R(x - 52, base - 166, 104, 166), { lw: 2.4, id: 6041, fill: o.night ? DARK : P.ink });
    if (dop < 0.98) shape(R(x - 52, base - 166, 104 * (1 - dop), 166), { lw: 2.2, id: 6042, fill: '#8c857a', h: [[0.7, 3, 0.7], [-0.7, 3, 0.5]] });
    for (let i = 0; i < 22; i++) ball(x - 230 + (i % 11) * 46, i < 11 ? base - ch - 34 : base - 6, 3.4, 6043 + i, PAT.d, 1);
    shape(R(x + 150, base - ch - 150, 36, 120), { lw: 2, id: 6070, h: [Math.PI / 2, 2.6, 0.7] }); if (on > 0) smokeCurls(x + 168, base - ch - 150, lt, 6071, on);
  }
  // the wiring: cables, glowing screens, rose petals, perfume
  if (wired > 0 && ap < 1) {
    X.save(); X.globalAlpha = clamp(wired * 1.4) * (1 - ap);
    for (let i = 0; i < 5; i++) { const sx0 = x - 200 + i * 100, pts = []; for (let j = 0; j <= 10; j++) { const u = j / 10; pts.push([sx0 + u * 40, base - ch - 20 + u * (ch + 30) + Math.sin(u * Math.PI) * 50]); } ink(pts.slice(0, Math.max(2, Math.floor(11 * clamp(wired * 2 - i * 0.15)))), 3.2, 6100 + i, 0.3); }
    if (o.cableTo) { const a = [x + 160, y - 4], b = o.cableTo, c = [(a[0] + b[0]) / 2, Math.max(a[1], b[1]) + 30]; const pts = []; for (let j = 0; j <= 16; j++) pts.push(bez(a, c, b, j / 16)); ink(pts, 4, 6110, 0.2); ink(pts.map(([p, q]) => [p, q - 4]), 1.2, 6111, 0.2); }
    for (const [dx, dy] of [[-138, -170], [138, -170], [-138, -80], [138, -80]]) screenWave(x + dx, base + dy, 70, 52, lt, 6120 + dx + dy, clamp(wired * 2 - 0.8) * (0.4 + 0.6 * Math.max(on, o.idle ?? 0.5)));
    petals(x - 230, x + 230, y - 40, y + 6, 26, 6200, lt, 0);
    if (o.perfume !== false) perfume(x, base - ch - 110, lt, 6300, 0.3 + 0.7 * Math.max(on, 0.3), 1);
    if (on > 0) for (let i = 0; i < 6; i++) { const a_ = i / 6 * 6.28 + lt * 2, rr_ = 150 + 40 * Math.sin(lt * 20 + i); X.save(); X.globalAlpha = on * 0.6; ink([[x + Math.cos(a_) * rr_ * 0.7, base - 120 + Math.sin(a_) * rr_ * 0.5], [x + Math.cos(a_) * (rr_ + 30) * 0.7, base - 120 + Math.sin(a_) * (rr_ + 30) * 0.5]], 2, 6400 + i, 0.4); X.restore(); }
    X.restore();
  }
  X.restore();
}
function garden(lt, o = {}) {
  X.fillStyle = P.paper; X.fillRect(PX0 - 500, PY0 - 500, PX1 - PX0 + 1000, 1500);
  if (o.night) { hatchSky(PY0 - 300, GY, -500, 1800); for (let i = 0; i < 60; i++) { X.fillStyle = P.paper; X.fillRect(-300 + hash(8100, i) * 1900, -100 + hash(8101, i) * 600, 2.6, 2.6); } }
  else { X.save(); X.globalAlpha = 0.45; skyLines(PY0 - 300, GY, GY + 300); X.restore(); }
  for (let i = 0; i < 14; i++) { const tx = -260 + i * 140 + hash(8110, i) * 50; if (tx > 200 && tx < 760) continue; const ty = GY - 2; line([tx, ty], [tx, ty - 60], 3, 8120 + i, 0.2); ball(tx, ty - 90, 40 + 14 * hash(8130, i), 8140 + i, PAT.m, 1.6); }
  X.fillStyle = P.paper; X.fillRect(PX0 - 500, GY, PX1 - PX0 + 1000, 600); for (let y = GY + 3, k = 0; y < 820; y += 5 + k * 0.6, k++) { X.fillStyle = P.ink; X.fillRect(PX0 - 500, y, PX1 - PX0 + 1000, 0.5 + k * 0.05); }
  line([PX0 - 500, GY], [PX1 + 500, GY], 2.4, 8150, 0.3);
  shape([[-400, GY + 60], [480 - 60, GY + 2], [480 + 60, GY + 2], [600, GY + 60], [-400, GY + 90]], { lw: 1, id: 8160, fill: P.paper, h: [0.05, 6, 0.4] });
  if (o.night) { X.save(); X.globalAlpha = 0.3; X.fillStyle = P.ink; X.fillRect(PX0 - 500, GY, PX1 - PX0 + 1000, 600); X.restore(); }
}
function nightFilter(a = 0.35) { X.save(); X.setTransform(1, 0, 0, 1, 0, 0); X.globalAlpha = a; X.fillStyle = '#1c1814'; X.fillRect(0, 0, W, H); X.restore(); }

/* ---------- other sets ---------- */
function pyramidShip(x, y, s, lt, id, o = {}) {
  X.save(); X.translate(x, y); X.scale(s, s);
  if (o.flame > 0) for (let i = 0; i < 5; i++) { const fx = -200 + i * 100, fl = (60 + 30 * Math.sin(lt * 30 + i)) * o.flame; shape([[fx - 22, 0], [fx + 22, 0], [fx, fl]], { lw: 1.6, id: id + 80 + i, fill: P.amber, h: [Math.PI / 2, 3, 0.5] }); }
  shape([[-290, 0], [290, 0], [0, -470]], { lw: 3, id, fill: P.paper, h: [0.5, 4.2, 0.5], sh: [[0, -470], [290, 0], [0, 0]], sh2: [[-0.5, 2.6, 0.8], [1.2, 5, 0.4]] });
  for (let r = 0; r < 4; r++) for (let i = 0; i <= r; i++) { const wy = -360 + r * 80, wx = (i - r / 2) * 70; ball(wx, wy, 9, id + 10 + r * 6 + i, PAT.f, 1.4, (Math.floor(lt * 2) + i + r) % 4 ? P.amber : P.paper); }
  for (let i = 0; i < 3; i++) { const by = -470 - 20 - i * 3; line([0, -470], [0, -520], 2.4, id + 40, 0.2); shape([[0, -520], [56, -506 + Math.sin(lt * 4) * 4], [0, -494]], { lw: 1.2, id: id + 41, fill: P.red }); void by; }
  shape(R(-56, -110, 112, 110), { lw: 2.4, id: id + 50, fill: P.ink });
  X.restore();
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
function book(x, y, a, id, open = 0.5) { X.save(); X.translate(x, y); X.rotate(a); shape([[0, 0], [-22, -6 - open * 8], [-22, 18], [0, 22]], { lw: 1.3, id, fill: P.paper, h: [0.2, 2.4, 0.5] }); shape([[0, 0], [22, -6 - open * 8], [22, 18], [0, 22]], { lw: 1.3, id: id + 1, fill: P.paper, h: [-0.2, 2.4, 0.5] }); X.restore(); }
function cauldron(x, y, s, lt, id) {
  X.save(); X.translate(x, y); X.scale(s, s);
  for (let i = 0; i < 5; i++) { const fx = -40 + i * 20; shape([[fx - 8, 0], [fx + 8, 0], [fx, -26 - 8 * Math.sin(lt * 12 + i)]], { lw: 1, id: id + i, fill: P.amber }); }
  X.beginPath(); X.ellipse(0, -66, 70, 54, 0, 0, Math.PI); X.lineTo(-70, -66); X.fillStyle = P.paper; X.fill(); X.lineWidth = 2.4; X.strokeStyle = P.ink; X.stroke(); X.save(); X.clip(); hatch(0.3, 3, 0.7, [-70, -70, 70, -10]); X.restore();
  X.beginPath(); X.ellipse(0, -66, 72, 12, 0, 0, 6.2832); X.fillStyle = P.ink; X.fill();
  for (let i = 0; i < 6; i++) { const u = ((lt * 0.9 + i / 6) % 1), bx = -50 + hash(id, i) * 100; X.save(); X.globalAlpha = 1 - u; X.beginPath(); X.arc(bx, -70 - u * 60, 4 + u * 9, 0, 6.2832); X.lineWidth = 1.4; X.strokeStyle = P.ink; X.stroke(); X.restore(); }
  X.restore();
}
function diaperStack(x, y, n, id) { for (let i = 0; i < n; i++) shape([[x - 26, y - i * 10], [x + 26, y - i * 10], [x + 22, y - i * 10 - 9], [x - 22, y - i * 10 - 9]], { lw: 1.1, id: id + i, fill: '#f6f1e2' }); }
function cannon(x, y, s, ang, id, o = {}) {
  X.save(); X.translate(x, y); X.scale(s, s);
  if (o.disguise) { shape(R(-40, -70, 80, 70), { lw: 1.8, id: id + 20, h: [Math.PI / 2, 3, 0.6] }); for (let i = 0; i < 4; i++) shape(R(-40 + i * 22, -82, 14, 12), { lw: 1, id: id + 21 + i }); }
  X.save(); X.translate(0, o.disguise ? -60 : -30); X.rotate(-ang);
  shape([[-10, -22], [120, -16], [120, 16], [-10, 22], [-26, 0]], { lw: 2.4, id, fill: '#d8d2c0', h: [0.1, 3, 0.7] }); shape(R(112, -20, 14, 40), { lw: 2, id: id + 1, h: [Math.PI / 2, 2.4, 0.7] });
  if (o.plug) shape(R(124, -12, 16 * o.plug, 24), { lw: 1.6, id: id + 2, fill: P.amber });
  X.restore();
  if (!o.disguise) { ball(-6, -10, 26, id + 3, PAT.m, 2); ball(-6, -10, 6, id + 4, PAT.d, 1); }
  X.restore();
}
function herald(x, y, s, id, o = {}) { micro(x, y, s, id, { f: o.f || 1, wave: 0, look: o.f || 1 }); const f = o.f || 1, a = o.up ? -0.4 : 0.2, hx = x + f * 8 * s, hy = y - 46 * s; ink([[hx, hy], [hx + f * Math.cos(a) * 40 * s, hy + Math.sin(a) * 40 * s]], 2.4, id + 50, 0.1); shape([[hx + f * Math.cos(a) * 38 * s, hy + Math.sin(a) * 38 * s - 9 * s], [hx + f * Math.cos(a) * 52 * s, hy + Math.sin(a) * 52 * s - 14 * s], [hx + f * Math.cos(a) * 52 * s, hy + Math.sin(a) * 52 * s + 14 * s], [hx + f * Math.cos(a) * 38 * s, hy + Math.sin(a) * 38 * s + 9 * s]], { lw: 1.2, id: id + 51, fill: P.amber }); }
function goblet(x, y, s, id) { shape([[x - 7 * s, y - 26 * s], [x + 7 * s, y - 26 * s], [x + 3 * s, y - 12 * s], [x - 3 * s, y - 12 * s]], { lw: 1.2, id, fill: P.amber }); line([x, y - 12 * s], [x, y - 2 * s], 1.4, id + 1, 0.1); line([x - 6 * s, y - 2 * s], [x + 6 * s, y - 2 * s], 1.4, id + 2, 0.1); }


/* ---------- 1. the knock ---------- */
SHOTS.knock = (lt, sd, sh) => {
  const L = sh.lines, kn = cue(sh, 'knock'), op = cue(sh, 'open'), rv = cue(sh, 'reveal'), sk = cue(sh, 'sacks'), kt = cue(sh, 'knight'), bw = cue(sh, 'bow');
  const HX = 250, KX1 = 380;
  const kx = lt < kt.at ? 520 : lerp(520, KX1, E.io(U(lt, kt.at + 0.4, kt.at + 3.2)));
  const head = headPos(KX1, GY, 0.5);
  let c = camFor(lt, [[0, ON(250, 470, 1.9)], [rv.at, ON(640, 360, 1.0)], [kt.at + 0.4, ON(430, 470, 1.45)], [L[4].t0 - 0.3, ON(330, 480, 1.7)]], 1.4);
  c = withTight(sh, lt, c, head[0], head[1], 3.4);
  if (lt >= kn.at && lt < kn.to) c = shakeCam(c, 2.2 * Math.abs(Math.sin(lt * 9)), lt);
  cam(c, () => {
    X.fillStyle = P.paper; X.fillRect(PX0 - 500, PY0 - 500, 2300, 1600); nightSky(8000); lawn(GY);
    pyramidShip(930, GY, 1.0, lt, 8400);
    // the ramp
    shape([[820, GY - 70], [880, GY - 70], [760, GY], [680, GY]], { lw: 2, id: 8450, fill: P.paper, h: [0.3, 4, 0.5] });
    trurlHouse(HX, GY, lt, { open: lt >= op.at ? clamp((lt - op.at) / 0.6) : 0, shake: lt >= kn.at && lt < kn.to ? Math.abs(Math.sin(lt * 9)) : 0, lit: lt >= op.at });
    if (lt >= op.at) trurlF(HX + 4, GY, 0.46, sh, lt, { robe: '#ece4cf', f: 1, bag: false, look: 1, lookY: lt < rv.at + 1 ? 0 : -0.5 });
    // porters and the growing pile
    const n = Math.floor(140 * E.lin(U(lt, sk.at, sk.to + 0.5)));
    if (lt >= sk.at - 0.5) for (let i = 0; i < 5; i++) { const per = 2.4, ph_ = ((lt - sk.at + 0.5) / per + i / 5) % 1, down = ph_ < 0.5; const u = down ? ph_ * 2 : (ph_ - 0.5) * 2; const px = down ? lerp(850, 640, u) : lerp(640, 850, u); const py = px > 760 ? GY - 70 * (px - 760) / 90 : GY; if (lt < sk.to + 3) porter(px, Math.min(GY, py), 0.9, 8500 + i * 100, { f: down ? -1 : 1, walk: 1, ph: lt * 10 + i, carry: down }); }
    sackPile(400, 640, GY, n, [470, 530, 6], 8600);
    if (lt >= kt.at) knightF(kx, GY, 0.5, sh, lt, { f: -1, walk: lt < kt.at + 3.2 ? 1 : 0, ph: lt * 8, ra: lt >= bw.at && lt < bw.at + 1.6 ? [0.6, 1.2] : undefined, tilt: lt >= bw.at && lt < bw.at + 1.6 ? -0.25 * pulse(lt, bw.at, 1.6) : 0 });
  });
};

/* ---------- 2. the titles ---------- */
SHOTS.titles = (lt, sd, sh) => {
  const L = sh.lines, pu = cue(sh, 'purr'), sw = cue(sh, 'sword'), db = cue(sh, 'dub'), dm = cue(sh, 'dim'), lk = cue(sh, 'look'), cl = cue(sh, 'clang'), ca = cue(sh, 'carry'), lf = cue(sh, 'lift');
  if (lt >= lf.at) {
    const u = U(lt, lf.at + 0.3, sd), c = camFor(lt, [[lf.at, ON(700, 380, 1.0)], [lf.at + 1.2, ON(780, 300, 0.92)]], 1.5);
    cam(c, () => {
      X.fillStyle = P.paper; X.fillRect(PX0 - 500, PY0 - 500, 2300, 1600); nightSky(8000); lawn(GY);
      trurlHouse(250, GY, lt, { lit: true, open: 1 }); sackPile(400, 640, GY, 140, [470, 530, 6], 8600);
      const y = GY - 420 * E.in(u) - 10 * u; pyramidShip(930, y, 1.0, lt, 8400, { flame: 1 });
      for (let i = 0; i < 10; i++) { const q = ((lt - lf.at) * 0.8 + i / 10) % 1; X.save(); X.globalAlpha = 1 - q; ball(930 + (hash(8700, i) - 0.5) * 600 * q, GY - 10 - q * 40, 14 + 40 * q, 8710 + i, PAT.f, 1.2); X.restore(); }
    });
    dipAt(lt, lf.at); return;
  }
  const KX = lt < sw.at ? 430 : lerp(430, 600, E.io(U(lt, sw.at, sw.at + 1.2))), TX = 820;
  const standK = lt >= sw.at, dimU = U(lt, dm.at, dm.to), lookU = lt >= lk.at ? E.io(U(lt, lk.at, lk.at + 1.4)) : 0;
  const carried = lt >= ca.at, cu_ = U(lt, ca.at, ca.to);
  const tx = carried ? lerp(TX, -200, E.in(U(lt, ca.at + 0.8, ca.to + 1.2))) : lerp(TX, 930, lookU);
  const taps = []; for (let q = 0; q < 5; q++) taps.push(db.at + 0.2 + q * (db.to - db.at - 0.4) / 4);
  let tip = null; if (standK && lt < db.to + 0.6) { const sh_ = handPos(TX, FLOOR, 0.95, -1, [1.5, 1.6]); const p_ = taps.reduce((m, t) => Math.max(m, pulse(lt, t - 0.35, 0.7)), 0); tip = [TX - 22, FLOOR - 214 * 0.95 - 70 * (1 - p_) - 6]; void sh_; }
  const kHead = headPos(TX, FLOOR, 0.95);
  let c = camFor(lt, [[0, ON(640, 400, 1.1)], [sw.at, ON(700, 380, 1.2)], [L[4].t0, ON(980, 300, 1.6)], [L[5].t0 - 0.6, ON(700, 400, 1.15)], [L[6].t0 + 0.3, ON(560, 380, 1.35)], [lk.at, ON(1050, 300, 1.9)], [L[8].t0, ON(800, 380, 1.3)], [cl.at - 0.2, ON(640, 380, 1.05)]], 1.0);
  c = withTight(sh, lt, c, kHead[0], kHead[1], 2.6);
  cam(c, () => {
    wallRoom(520, 2.8);
    bookshelf(150, 520, 200, 330, 8800);
    // the window: night sky, sacks climbing, and a gap with soldiers in it
    const wx = 1050, wy = 300, ww = 300, wh = 230;
    shape(R(wx - ww / 2 - 12, wy - wh / 2 - 12, ww + 24, wh + 24), { lw: 2.4, id: 8900, fill: P.paper, h: [0.1, 3, 0.6] });
    X.save(); path(R(wx - ww / 2, wy - wh / 2, ww, wh)); X.clip(); X.fillStyle = P.paper; X.fillRect(wx - ww / 2, wy - wh / 2, ww, wh); hatchSky(wy - wh / 2, wy + wh / 2, wx - ww / 2, wx + ww / 2);
      // soldiers, seen only through the gap
      const gx_ = wx + 30, gy_ = wy - 20;
      X.save(); X.beginPath(); X.ellipse(gx_, gy_, 74, 44, 0, 0, 6.2832); X.clip(); for (let r = 0; r < 3; r++) for (let i = 0; i < 9; i++) { const sx = gx_ - 110 + i * 28 + r * 12, sy = gy_ + 10 + r * 26; guard(sx, sy, 0.6 + r * 0.08, 8950 + r * 20 + i, { f: -1, spear: true }); } X.restore();
      const fill = 0.3 + 0.7 * clamp(dimU); const rows = Math.floor(10 * fill);
      for (let r = 0; r < rows; r++) for (let i = 0; i < 8; i++) { const sx = wx - ww / 2 + 10 + i * 40 + (r % 2) * 18, sy = wy + wh / 2 - 6 - r * 26; if (Math.hypot((sx - gx_) / 96, (sy - gy_) / 62) < 1) continue; sack(sx, sy, 22, 9000 + r * 10 + i * 3); }
    X.restore();
    for (let i = 1; i < 3; i++) line([wx - ww / 2 + i * ww / 3, wy - wh / 2], [wx - ww / 2 + i * ww / 3, wy + wh / 2], 3, 8910 + i, 0.2); line([wx - ww / 2, wy], [wx + ww / 2, wy], 3, 8915, 0.2);
    table(640, 560, 220, 8920, 90);
    if (!standK) chair(430, FLOOR, 0.95, 8930, 1); if (!carried && lookU < 0.05) chair(TX, FLOOR, 0.95, 8940, -1);
    knightF(KX, FLOOR, 0.95, sh, lt, { f: 1, seated: !standK, purr: lt >= pu.at && lt < pu.to, walk: lt >= sw.at && lt < sw.at + 1.2 ? 1 : 0, ph: lt * 8, ra: tip ? [-0.5, -0.4] : (lt >= cl.at && lt < cl.at + 0.8 ? [-0.4, -1.8] : undefined), sword: tip });
    if (lt >= cl.at && lt < cl.at + 0.5) { const fu = U(lt, cl.at, cl.at + 0.5); X.save(); X.globalAlpha = 1 - fu; star(KX + 40, FLOOR - 300, 30 + 60 * fu, 8960, P.ink, 10); X.restore(); }
    if (!carried) trurlF(tx, FLOOR, 0.95, sh, lt, { robe: '#ece4cf', f: lookU > 0.5 && lt < L[8].t0 ? 1 : -1, seated: lookU < 0.05, bag: false, walk: lookU > 0 && lookU < 1 ? 1 : 0, ph: lt * 8, look: lookU > 0.5 && lt < L[8].t0 ? 1 : 1, lookY: lt >= L[4].t0 && lt < L[5].t0 ? -1 : 0, tilt: tip ? 0.12 : 0 });
    else {
      const rx = lerp(-160, 860, E.out(U(lt, ca.at - 0.6, ca.at + 0.6))) * (lt < ca.at + 0.8 ? 1 : 1);
      const cx_ = lt < ca.at + 0.8 ? 860 : lerp(860, -200, E.in(U(lt, ca.at + 0.8, ca.to + 1.2)));
      const lift = E.out(U(lt, ca.at + 0.3, ca.at + 0.8));
      for (let i = 0; i < 2; i++) guard(Math.min(rx, cx_) - 60 - i * 220, FLOOR + 6, 3.0, 9100 + i * 60, { f: lt < ca.at + 0.8 ? 1 : -1, walk: 1, ph: lt * 10 + i, spear: false });
      trurlF(cx_, FLOOR - 190 * lift, 0.95, null, lt, { robe: '#ece4cf', f: -1, bag: false, rot: -1.5 * lift, ra: [-0.5, -1.2], la: [-0.4, -1.4] });
    }
    if (dimU > 0) { X.save(); X.globalAlpha = 0.3 * dimU; X.fillStyle = P.ink; X.fillRect(PX0 - 500, PY0 - 500, 2300, 1600); X.restore(); }
  });
};

/* ---------- 3. the temple ---------- */
const TPX = 430, PNX = 960, PNY = 400, PNS = 0.95;
const pAt = (lx, ly, s = PNS, cx = PNX, cy = PNY) => [cx + lx * s, cy + ly * s];
SHOTS.temple = (lt, sd, sh) => {
  const L = sh.lines, bd = cue(sh, 'build'), dl = cue(sh, 'dials'), pts = cues(sh, 'point'), kb = cue(sh, 'knobs'), pu = cue(sh, 'push'), shu = cue(sh, 'shut');
  const wired = E.io(U(lt, bd.at, bd.to));
  const gp = [pAt(-104, -23), pAt(40, -23), pAt(160, 0)];
  const pidx = pts.filter((p) => lt >= p.at).length - 1;
  const TRX = 715, head = headPos(TRX, GY, 0.82);
  let plan = [[0, ON(560, 360, 1.05)], [dl.at, ON(PNX, PNY + 10, 1.7)]];
  pts.forEach((p, i) => plan.push([p.at - 0.2, ON(gp[i][0], gp[i][1], 2.3)]));
  plan.push([kb.at, ON(PNX - 40, PNY + 90, 2.1)], [pu.at, ON(560, 380, 1.0)], [pu.at + 3.5, ON(430, 440, 1.15)], [L[5].t1 + 0.2, ON(640, 380, 1.0)]);
  let c = camFor(lt, plan, 1.0); c = withTight(sh, lt, c, head[0], head[1], 2.5);
  const pushU = U(lt, pu.at, pu.to), PX_ = lerp(-260, TPX, E.io(pushU));
  cam(c, () => {
    garden(lt);
    temple(TPX, GY, lt, { wired, idle: 0.3, door: lt < shu.at ? (lt > pu.to - 1.5 ? 1 : 0) : 1 - U(lt, shu.at, shu.at + 0.4), cableTo: pAt(-150, 130) });
    const kn = [0, 0, 0]; if (lt >= kb.at) for (let i = 0; i < 3; i++) kn[i] = 0.2 + 0.25 * E.io(U(lt, kb.at + 0.6 + i * 1.6, kb.at + 1.4 + i * 1.6));
    const lever = lt >= L[5].t0 ? 0.35 * E.io(U(lt, L[5].t0, L[5].t1)) : 0;
    if (wired > 0.3) panel(PNX, PNY, PNS, { p: 0, e: 0, r: 0, knobs: kn, lever });
    // Trurl points at each dial in turn
    const pointing = lt >= pts[0].at - 0.3 && lt < L[3].t1;
    trurlF(lt < bd.to ? lerp(300, TRX, E.io(U(lt, bd.at + 1, bd.to))) : TRX, GY, 0.82, sh, lt, { f: 1, walk: lt > bd.at + 1 && lt < bd.to ? 1 : 0, ph: lt * 8, ra: pointing ? [-0.55, -0.35] : (lt >= L[5].t0 - 0.3 ? [-0.2, -0.7] : undefined), look: 1 });
    // the peers bring the prince
    if (lt >= pu.at - 0.3 && lt < shu.at + 0.2) {
      const fight = Math.sin(lt * 7) * 0.12;
      const inside = lt > pu.to - 1.5; const pa = inside ? 1 - U(lt, pu.to - 1.5, pu.to - 0.6) : 1;
      if (pa > 0) { X.save(); X.globalAlpha = pa; princeF(PX_, GY, 0.82, sh, lt, { f: 1, rot: fight, ra: [-0.6 + Math.sin(lt * 9) * 0.6, -0.4], la: [0.4 + Math.sin(lt * 8) * 0.5, 0.2], look: -1, lookY: 0, walk: 1, ph: lt * 5 }); X.restore(); }
      for (let i = 0; i < 6; i++) { const ox = -80 - (i % 3) * 46, oy = (i < 3 ? 6 : 14); peer(PX_ + ox + Math.sin(lt * 6 + i) * 6, GY + oy, 1.5, 9200 + i * 90, { f: 1, walk: 1, ph: lt * 8 + i, tilt: 0.25 + 0.1 * Math.sin(lt * 5 + i) }); }
      for (let i = 0; i < 2; i++) peer(PX_ + 70 + i * 34, GY + 10, 1.45, 9800 + i * 90, { f: -1, walk: 1, ph: lt * 8 + i, tilt: -0.2 });
    }
  });
};

/* ---------- 4. the first run ---------- */
SHOTS.run = (lt, sd, sh) => {
  const L = sh.lines, sw = cue(sh, 'switch'), ct = cue(sh, 'count'), cb = cue(sh, 'climb'), hr = cue(sh, 'hour'), op = cue(sh, 'open'), fa = cue(sh, 'faint'), pr = cue(sh, 'press'), bu = cue(sh, 'burst');
  const climb = E.in(U(lt, cb.at, cb.to)), on = lt >= cb.at && lt < op.at ? 0.3 + 0.7 * climb : (lt >= op.at ? Math.max(0, 1 - (lt - op.at) / 2.5) : 0);
  const cnt = lt >= ct.at && lt < ct.to + 0.3 ? Math.max(0, 5 - Math.floor((lt - ct.at) / ((ct.to - ct.at) / 5.6))) : null;
  const atStop = lt >= cb.to && lt < op.at;
  const PRX = 560, fallU = E.in(U(lt, fa.at - 0.4, fa.at + 0.3));
  const prRot = -1.45 * fallU, prY = GY + 8 * fallU;
  const stagger = lt >= op.at ? lerp(TPX, PRX, E.io(U(lt, op.at + 0.6, fa.at - 0.4))) : TPX;
  const head = headPos(PRX, prY, 0.82, prRot);
  const rv = lt < pr.at ? 0.02 : 0.02 + 1.06 * E.in(U(lt, pr.at + 0.3, bu.at));
  const thX = pAt(160, 0);
  let c = camFor(lt, [[0, ON(PNX + 40, PNY - 10, 1.8)], [hr.at, ON(900, 420, 1.2)], [op.at - 0.6, ON(560, 420, 1.15)], [fa.at, ON(560, 470, 1.4)], [pr.at - 0.3, ON(790, 430, 1.15)], [bu.at - 1.6, ON(thX[0] - 30, thX[1] + 10, 1.8)], [bu.at + 1.6, ON(800, 420, 1.15)]], 0.9);
  c = withTight(sh, lt, c, head[0], head[1] + 10, 2.7);
  c = shakeCam(c, on * (atStop ? 2.4 : 1.2 * climb), lt);
  if (lt >= bu.at && lt < bu.at + 0.4) c = shakeCam(c, 6 * (1 - (lt - bu.at) / 0.4), lt);
  cam(c, () => {
    garden(lt);
    temple(TPX, GY, lt, { wired: 1, on, door: lt >= op.at ? E.out(U(lt, op.at, op.at + 0.6)) : 0, cableTo: pAt(-150, 130) });
    if (lt >= op.at) { perfume(TPX, GY - 120, lt, 9300, 1 - U(lt, op.at + 5, op.at + 9), 1.6); petals(TPX - 60, PRX + 120, GY - 220, GY - 10, 30, 9320, lt, 1 - U(lt, op.at + 2, op.at + 4)); }
    const v = lt < cb.at ? 0 : climb, crack = 0;
    panel(PNX, PNY, PNS, { p: v * 1.0, e: v * 0.96 + (atStop ? 0.04 : 0), r: lt >= pr.at ? rv : 0.02, burst: lt >= bu.at ? lt - bu.at : -1, count: cnt, chatter: atStop ? 1 : (lt >= cb.at && lt < op.at ? 0.6 : 0), knobs: [0.95, 0.95, 0.95], lever: lt >= sw.at ? E.out(U(lt, sw.at, sw.at + 0.3)) : 0.35, crack });
    // Trurl: pulls the switch, waits on a stool, then brings the cup to the prince's brow
    const pressing = lt >= pr.at - 1.0;
    const tX = pressing ? lerp(715, head[0] + 70, E.io(U(lt, pr.at - 1.0, pr.at))) : 715;
    if (lt >= hr.at && lt < op.at) shape(R(695, GY - 120, 60, 12), { lw: 1.6, id: 9400, h: [0.1, 3, 0.6] });
    trurlF(tX, GY, 0.82, sh, lt, { f: pressing ? -1 : 1, seated: lt >= hr.at + 0.5 && lt < op.at - 0.3, walk: pressing && lt < pr.at ? 1 : 0, ph: lt * 8, ra: lt < sw.at + 0.6 ? [-0.6, -1.0] : (pressing ? [0.9, 2.4] : undefined), la: lt >= hr.at && lt < op.at ? [0.7, 2.6] : undefined, look: lt >= op.at && !pressing ? -1 : 1, cup: pressing && lt < bu.at + 0.3 });
    if (pressing && lt < bu.at + 0.3) { const a = [head[0] - 4, head[1] + 4], b = pAt(160, 70), m = [(a[0] + b[0]) / 2, GY - 10]; const p_ = []; for (let j = 0; j <= 18; j++) p_.push(bez(a, m, b, j / 18)); ink(p_, 2.4, 9410, 0.2); ball(a[0], a[1], 9, 9411, PAT.f, 1.4, BRASS); }
    if (lt >= op.at + 0.4) {
      const fl = lt >= fa.at - 0.4;
      if (lt >= fa.at + 1.0) for (let i = 0; i < 4; i++) peer([PRX - 470, PRX - 400, PRX + 70, PRX + 140][i], GY - 14, 1.3, 9500 + i * 90, { f: i < 2 ? 1 : -1, pillow: false, wave: 1, tilt: 0.15 });
      princeF(fl ? PRX : stagger, prY, 0.82, sh, lt, { f: 1, rot: fl ? prRot : Math.sin(lt * 3) * 0.12, closed: lt >= fa.at, sick: !fl, walk: fl ? 0 : 1, ph: lt * 4, look: 1, lookY: 0, tilt: fl ? 0 : 0.2 });
    }
  });
};

/* ---------- 5. the stonemasons, the iron machine, Trurl's room ---------- */
SHOTS.again = (lt, sd, sh) => {
  const L = sh.lines, ms = cue(sh, 'masons'), on_ = cue(sh, 'on'), sm = cue(sh, 'smoke'), ir_ = cue(sh, 'iron'), sw = cue(sh, 'switch'), cb = cue(sh, 'climb'), ou = cue(sh, 'out'), rm = cue(sh, 'room'), th = cues(sh, 'throw');
  if (lt < ir_.at) {
    const c = camFor(lt, [[0, ON(560, 420, 1.15)], [sm.at - 0.3, ON(560, 440, 1.25)]], 1.0);
    const zap = lt >= on_.at && lt < sm.at ? 1 : 0;
    cam(shakeCam(c, zap * 3, lt), () => {
      garden(lt, { night: true }); temple(TPX, GY, lt, { wired: 1, on: zap, door: lt >= ms.to - 1.2 && lt < on_.at ? 1 : (lt >= sm.at ? 1 : 0), night: true, idle: 0.2 });
      for (let i = 0; i < 3; i++) {
        if (lt < ms.to) { const x = lerp(140 + i * 70, TPX - 10, E.io(U(lt, ms.at + i * 0.4, ms.to - 0.2))); if (lt < ms.to - 0.2) mason(x, GY, 1.6, 9600 + i * 100, { f: 1, walk: 1, ph: lt * 9 + i, tilt: 0.25 }); }
        if (lt >= sm.at) { const u = U(lt, sm.at + i * 0.25, sm.at + 1.6 + i * 0.25), x = lerp(TPX, 160 + i * 150, E.out(u)), y = GY - Math.sin(Math.PI * clamp(u * 1.5)) * 60; if (u > 0) { mason(x, y, 1.6, 9600 + i * 100, { f: -1, walk: u < 1 ? 1 : 0, ph: lt * 14 + i, tilt: -0.2, bob: 2 }); smokeCurls(x, y - 90, lt, 9700 + i * 10, 1, 1.2); } }
      }
      if (zap) { X.save(); X.globalAlpha = 0.25 + 0.2 * Math.sin(lt * 40); X.fillStyle = P.paper; X.fillRect(TPX - 200, GY - 360, 400, 360); X.restore(); }
    });
    dipAt(lt, ir_.at); return;
  }
  if (lt < rm.at) {
    const climb = E.in(U(lt, cb.at, cb.to)), atStop = lt >= cb.to && lt < ou.at, on = lt >= cb.at && lt < ou.at ? 0.4 + 0.6 * climb : (lt >= ou.at ? Math.max(0, 1 - (lt - ou.at) / 2) : 0);
    const cnt = lt >= L[2].t0 && lt < L[2].t1 + 0.3 ? Math.max(0, 5 - Math.floor((lt - L[2].t0) / ((L[2].t1 - L[2].t0) / 5.6))) : null;
    let c = camFor(lt, [[ir_.at, ON(640, 380, 1.0)], [sw.at - 0.5, ON(PNX + 30, PNY, 1.55)], [ou.at - 0.3, ON(560, 420, 1.2)]], 0.8);
    c = shakeCam(c, on * (atStop ? 4.5 : 2.2 * climb), lt);
    const build = E.io(U(lt, ir_.at, ir_.at + 3.2));
    cam(c, () => {
      garden(lt);
      temple(TPX, GY, lt, { wired: 1, heavy: 1, on, door: lt >= ou.at ? E.out(U(lt, ou.at, ou.at + 0.5)) : 0, cableTo: pAt(-170, 150, 0.95) });
      for (let i = 0; i < 6; i++) { const u = U(lt, ir_.at + i * 0.4, ir_.at + i * 0.4 + 0.8); if (u > 0 && u < 1) { const px = TPX - 200 + i * 80; X.save(); X.globalAlpha = 1 - u; star(px, GY - 150 - i * 20, 20 + 30 * u, 9750 + i, P.ink, 8); X.restore(); } }
      panel(PNX, PNY, 0.95, { heavy: 1, p: climb, e: climb, r: atStop ? 1.0 : climb * 0.9, count: cnt, chatter: atStop ? 1.4 : (on > 0 ? 0.8 : 0), knobs: [1, 1, 1], lever: lt >= sw.at ? 1 : 0.35, bend: atStop || lt >= ou.at ? 0.5 : 0, crack: lt >= ou.at ? 1 : 0 });
      trurlF(715, GY, 0.82, sh, lt, { f: lt >= ou.at ? -1 : 1, ra: lt >= sw.at - 0.2 && lt < sw.at + 0.8 ? [-0.6, -1.0] : undefined, look: 1, lookY: atStop ? -1 : 0 });
      if (lt >= ou.at + 0.3) { const u = U(lt, ou.at + 0.3, ou.at + 2.0); perfume(TPX, GY - 120, lt, 9300, 1, 1.9); petals(TPX - 120, TPX + 200, GY - 260, GY - 10, 40, 9320, lt, 1); princeF(lerp(TPX, 600, E.io(u)), GY, 0.82, sh, lt, { f: 1, sick: true, rot: Math.sin(lt * 4) * 0.1, walk: u < 1 ? 1 : 0, ph: lt * 4, look: 1, lookY: -1, tilt: -0.1 }); }
    });
    dipAt(lt, rm.at); return;
  }
  // Trurl's room: pacing, the manuals, the wall
  const pace = (t) => 640 + 300 * Math.sin((t - rm.at) * 0.75);
  const tx = pace(lt), f = Math.cos((lt - rm.at) * 0.75) >= 0 ? 1 : -1, stop = lt >= L[6].t0 - 0.6;
  const TX = stop ? pace(L[6].t0 - 0.6) : tx, head = headPos(TX, FLOOR, 0.95);
  let c = camFor(lt, [[rm.at, ON(640, 380, 1.05)]], 0.8); c = withTight(sh, lt, c, head[0], head[1], 2.5);
  cam(c, () => {
    wallRoom(520, 2.8); bookshelf(1120, 520, 180, 330, 8800); desk(960, FLOOR, 220, 8850); for (let i = 0; i < 3; i++) bookStack(900 + i * 50, FLOOR - 116, 1.4, 4 + i, 8860 + i * 10); line([1030, FLOOR - 116], [1030, FLOOR - 190], 2.4, 8890, 0.2); shape([[1004, FLOOR - 190], [1056, FLOOR - 190], [1044, FLOOR - 214], [1016, FLOOR - 214]], { lw: 1.6, id: 8891, fill: P.amber });
    let pile = 0; th.forEach((t_, i) => { if (lt >= t_.at + 0.5) pile++; });
    for (let i = 0; i < pile + 3; i++) book(150 + i * 26, FLOOR - 6 - (i % 2) * 8, (i % 3 - 1) * 0.3, 9900 + i * 3, 0.1);
    for (let i = 0; i < 6; i++) inkSplat(110 + hash(9950, i) * 60, 300 + hash(9951, i) * 140, 0.25, 9960 + i, (th.filter((t_) => lt >= t_.at + 0.35).length > i % 3) ? 0.6 : 0);
    th.forEach((t_, i) => { const u = U(lt, t_.at, t_.at + 0.45); if (u > 0 && u < 1) { const hx = TX - 40, p_ = bez([hx, FLOOR - 230], [lerp(hx, 120, 0.5), 160], [120, 360], u); book(p_[0], p_[1], u * 9, 9980 + i * 3, 0.8); } });
    trurlF(TX, FLOOR, 0.95, sh, lt, { f: stop ? 1 : f, walk: stop ? 0 : 1, ph: lt * 7, ra: th.some((t_) => lt >= t_.at - 0.2 && lt < t_.at + 0.3) ? [-1.6, -2.2] : undefined, look: stop ? 1 : f, lookY: stop ? 0 : 1, tilt: stop ? 0 : 0.2 });
  });
};

/* ---------- 6. the audience ---------- */
SHOTS.audience = (lt, sd, sh) => {
  const L = sh.lines, en = cue(sh, 'enter'), wh = cue(sh, 'whisper'), br = cue(sh, 'bright');
  const tx = lt < en.to ? lerp(-120, 560, E.io(U(lt, en.at, en.to))) : lt < wh.at ? 560 : lerp(560, 800, E.io(U(lt, wh.at, wh.at + 1.0)));
  const KX = 960, head = headPos(560, FLOOR, 0.95);
  let c = camFor(lt, [[0, ON(640, 380, 1.0)], [L[1].t0, ON(700, 380, 1.15)], [L[3].t0 - 0.2, ON(900, 360, 1.35)], [L[4].t0, ON(720, 380, 1.12)], [wh.at, ON(860, 360, 1.5)], [L[8].t0, ON(900, 360, 1.35)]], 0.8);
  c = withTight(sh, lt, c, head[0], head[1], 2.45);
  cam(c, () => {
    wallRoom(520, 2.8);
    for (const x of [120, 420, 1200]) column(x, 150, 540, 62, 3500 + x);
    throne(KX, 600, 3600);
    monarch(KX, FLOOR - 36, 0.95, 3700, 'K', sh, lt, { f: -1, seated: true, look: -1, smile: lt >= br.at, tilt: lt >= wh.at && lt < br.at ? 0.18 : 0 });
    knightF(1150, FLOOR, 0.9, sh, lt, { f: -1, look: -1 });
    trurlF(tx, FLOOR, 0.95, sh, lt, { f: 1, walk: (lt < en.to && lt > en.at) || (lt >= wh.at && lt < wh.at + 1.0) ? 1 : 0, ph: lt * 8, tilt: lt >= wh.at + 0.8 && lt < wh.to ? 0.35 : 0, ra: lt >= wh.at + 0.8 && lt < wh.to ? [-0.2, -1.5] : undefined, look: 1 });
    if (lt >= wh.at + 0.8 && lt < wh.to) for (let i = 0; i < 3; i++) { const u = ((lt * 1.4 + i / 3) % 1); X.save(); X.globalAlpha = 1 - u; ink([[870 + u * 30, 360 - i * 8], [880 + u * 40, 356 - i * 8]], 1.2, 3800 + i, 0.4); X.restore(); }
  });
};

/* ---------- 7. the foundry and the laboratory ---------- */
function labRoom(lt, sh, o = {}) {
  wallRoom(520, 2.8);
  shape(R(1080, 300, 130, 220), { lw: 2.4, id: 4000, h: [Math.PI / 2, 4, 0.6] }); for (const y of [360, 440]) { shape(R(1092, y, 30, 18), { lw: 1.6, id: 4001 + y, fill: P.amber }); line([1100, y + 18], [1100, y + 26], 2, 4005 + y, 0.1); }
  bookshelf(150, 520, 200, 280, 4100);
  for (let i = 0; i < 3; i++) cauldron(430 + i * 230, FLOOR, 1.0, lt + i, 4200 + i * 40);
  diaperStack(1000, FLOOR, 8, 4300); diaperStack(1050, FLOOR, 6, 4320); diaperStack(260, FLOOR, 5, 4340);
}
SHOTS.lab = (lt, sd, sh) => {
  const L = sh.lines, fo = cue(sh, 'foundry'), ds = cue(sh, 'disguise'), lb = cue(sh, 'lab'), rn = cue(sh, 'run');
  if (lt < fo.at || lt >= lb.at) {
    const head = headPos(560, FLOOR, 0.95);
    let c = lt < fo.at ? ON(600, 380, 1.1) : camFor(lt, [[lb.at, ON(640, 380, 1.0)], [L[3].t0, ON(760, 400, 1.15)]], 1.0); c = withTight(sh, lt, c, head[0], head[1], 2.45);
    cam(c, () => {
      labRoom(lt, sh);
      trurlF(560, FLOOR, 0.95, sh, lt, { f: 1, ra: lt >= lb.at ? [0.2, 1.2] : undefined, look: 1, lookY: lt >= lb.at ? 1 : 0 });
      if (lt >= lb.at) line(handPos(560, FLOOR, 0.95, 1, [0.2, 1.2]), [660, FLOOR - 66], 3, 4400, 0.1);
      if (lt >= rn.at) for (let i = 0; i < 3; i++) { const u = ((lt - rn.at) * 0.35 + i / 3) % 1, x = lerp(-80, 1360, u); courtier(x, FLOOR + 8, 1.5, 4500 + i * 80, { f: 1, walk: 1, ph: lt * 14 + i, wave: 1 }); diaperStack(x + 18, FLOOR - 56, 3, 4600 + i * 10); }
    });
    dipAt(lt, fo.at); dipAt(lt, lb.at); return;
  }
  if (lt < ds.at) {
    const c = camFor(lt, [[fo.at, ON(640, 380, 1.0)], [fo.at + 2, ON(660, 360, 1.1)]], 3);
    cam(c, () => {
      X.fillStyle = P.paper; X.fillRect(PX0 - 500, PY0 - 500, 2300, 1600); darkWall2(560, 2.4); floor2(560);
      shape([[60, 560], [60, 300], [200, 240], [340, 300], [340, 560]], { lw: 2.4, id: 4700, h: [0.6, 3.4, 0.6] }); shape(R(130, 420, 140, 140), { lw: 2, id: 4701, fill: P.amber }); for (let i = 0; i < 5; i++) shape([[150 + i * 25, 560], [162 + i * 25, 560], [156 + i * 25, 470 - 30 * Math.sin(lt * 10 + i)]], { lw: 1, id: 4702 + i, fill: P.red });
      for (let i = 0; i < 3; i++) { const y = 470 - i * 30 - (i === 2 ? 60 * Math.sin(Math.min(1, (lt - fo.at) / 3) * Math.PI / 2) : 0); line([540 + i * 230, PY0], [540 + i * 230, y - 30], 2, 4710 + i, 0.3); cannon(480 + i * 230, y + 40, 1.1, 0.05, 4720 + i * 20); }
      for (let i = 0; i < 14; i++) { const u = ((lt * 1.3 + i / 14) % 1); X.save(); X.globalAlpha = 1 - u; star(200 + hash(4750, i) * 60 + u * 80, 450 - u * 140, 4 + 6 * u, 4760 + i, P.ink, 4); X.restore(); }
      for (let i = 0; i < 2; i++) courtier(380 + i * 520, 568, 1.5, 4800 + i * 80, { f: 1, walk: 0, wave: 1, tilt: 0.1 * Math.sin(lt * 4 + i) });
    });
    return;
  }
  const c = camFor(lt, [[ds.at, ON(640, 400, 1.0)], [ds.at + 1, ON(640, 420, 1.06)]], 3);
  cam(c, () => {
    X.fillStyle = P.paper; X.fillRect(PX0 - 500, PY0 - 500, 2300, 1600); nightSky(8030);
    X.beginPath(); X.arc(640, 980, 640, 0, 6.2832); X.fillStyle = P.paper; X.fill(); X.lineWidth = 3; X.strokeStyle = P.ink; X.stroke(); X.save(); X.clip(); hatch(0.5, 4.4, 0.5, [0, 340, 1280, 1620]); X.restore();
    for (let i = 0; i < 9; i++) { const a = -Math.PI / 2 + (i - 4) * 0.2, px = 640 + Math.cos(a) * 640, py = 980 + Math.sin(a) * 640; X.save(); X.translate(px, py); X.rotate(a + Math.PI / 2); cannon(0, 4, 0.55, 0.25, 4900 + i * 30, { disguise: true }); X.restore(); }
    dipAt(lt, ds.at);
  });
};

/* ---------- 8. the bombardment ---------- */
function empStar(x, y, r, lt, id) { star(x, y, r * 1.8, id, P.ink, 12); ball(x, y, r, id + 20, NOPAT, 2, P.paper, true); X.save(); X.globalAlpha = 0.35; X.beginPath(); X.arc(x, y, r * 1.35 + Math.sin(lt * 2) * 2, 0, 6.2832); X.lineWidth = 1.2; X.strokeStyle = P.ink; X.stroke(); X.restore(); }
function empCity(lt, id, o = {}) {
  for (let i = 0; i < 9; i++) { const x = -60 + i * 170 + hash(id, i) * 40, w = 110 + hash(id + 1, i) * 60, h = 150 + hash(id + 2, i) * 160; shape(R(x, GY - h, w, h), { lw: 1.8, id: id + 10 + i, h: [Math.PI / 2, 3.4, 0.5], sh: R(x + w * 0.6, GY - h, w * 0.4, h), sh2: [Math.PI / 2, 2, 0.8] }); if (i % 3 === 1) { X.beginPath(); X.ellipse(x + w / 2, GY - h, w * 0.45, w * 0.4, 0, Math.PI, 0); X.fillStyle = P.paper; X.fill(); X.lineWidth = 1.8; X.strokeStyle = P.ink; X.stroke(); } for (let j = 0; j < 3; j++) shape(R(x + 16 + j * 30, GY - h + 30, 14, 20), { lw: 1, id: id + 40 + i * 3 + j, fill: P.amber }); }
}
const ECO = (n) => 1 - clamp(n / 135);
SHOTS.bombard = (lt, sd, sh) => {
  const L = sh.lines, ra = cue(sh, 'raise'), fi = cue(sh, 'fire'), ci = cue(sh, 'city'), hl = cue(sh, 'hall'), sg = cue(sh, 'sign');
  const CROWD = { a: 6, k: 0.17 };
  if (lt < ci.at) {
    const c = camFor(lt, [[0, ON(560, 420, 1.05)], [fi.at, ON(700, 360, 0.95)]], 1.5);
    cam(c, () => {
      X.fillStyle = P.paper; X.fillRect(PX0 - 500, PY0 - 500, 2300, 1600); nightSky(8060); empStar(1080, 150, 46, lt, 5000);
      X.beginPath(); X.arc(140, 1180, 820, 0, 6.2832); X.fillStyle = P.paper; X.fill(); X.lineWidth = 3; X.strokeStyle = P.ink; X.stroke(); X.save(); X.clip(); hatch(0.5, 4.4, 0.5, [-700, 340, 960, 2000]); X.restore();
      const up = E.io(U(lt, ra.at, ra.to));
      for (let i = 0; i < 6; i++) { const a = -Math.PI / 2 + 0.12 + i * 0.1, px = 140 + Math.cos(a) * 820, py = 1180 + Math.sin(a) * 820; X.save(); X.translate(px, py); X.rotate(a + Math.PI / 2); cannon(0, 4, 0.7, 0.2 + up * 0.75, 5100 + i * 30, { disguise: true }); X.restore(); }
      if (lt >= fi.at) for (let k = 0; k < 40; k++) { const i = k % 6, t0 = fi.at + k * 0.3 + hash(5200, k) * 0.15, u = (lt - t0) / 3.2; if (u < 0 || u > 1) continue; const a = -Math.PI / 2 + 0.12 + i * 0.1, px = 140 + Math.cos(a) * 860, py = 1180 + Math.sin(a) * 860; const tgt = [1080 + (hash(5201, k) - 0.5) * 40, 150]; const p_ = bez([px, py], [(px + tgt[0]) / 2, Math.min(py, tgt[1]) - 200], tgt, u); bundle(p_[0], p_[1], 0.7 * (1 - u * 0.75), 5300 + k * 5, { chute: 0, sway: Math.sin(lt * 6 + k) }); if (u < 0.12) { X.save(); X.globalAlpha = 1 - u / 0.12; ball(px, py, 14 + 40 * u, 5500 + k, PAT.f, 1.2); X.restore(); } }
    });
    dipAt(lt, ci.at); return;
  }
  if (lt < hl.at) {
    const c = camFor(lt, [[ci.at, ON(640, 330, 1.0)], [ci.at + 2.5, ON(640, 380, 1.08)]], 3.5);
    cam(c, () => {
      X.fillStyle = P.paper; X.fillRect(PX0 - 500, PY0 - 500, 2300, 1600); nightSky(8090); lawn(GY); empCity(lt, 5600);
      for (let k = 0; k < 22; k++) { const u = ((lt * 0.09 + hash(5710, k)) % 1); bundle(-20 + hash(5711, k) * 1320, -60 + u * 560, 0.6 + 0.4 * hash(5712, k), 5720 + k * 5, { sway: Math.sin(lt * 2 + k) }); }
      babyCrowd(ci.at - 0.5, lt, [-40, GY + 14, 1320, GY + 50], 5700, { a: CROWD.a, k: CROWD.k, s: 1.0, drop: 640, fall: 3.2, max: 90 });
    });
    dipAt(lt, hl.at); return;
  }
  // the Emperor's hall: the window full of parachutes, the economy gauge, babies across the floor
  const n = Math.min(140, CROWD.a * (Math.exp(CROWD.k * (lt - ci.at + 0.5)) - 1));
  const eco = ECO(n), EX = 980, head = headPos(EX, FLOOR - 36, 0.95), GX = 380, GYY = 300;
  let c = camFor(lt, [[hl.at, ON(640, 380, 1.0)], [hl.at + 1.2, ON(GX + 40, GYY + 20, 1.7)], [L[4].t0, ON(640, 400, 1.0)], [sg.at - 0.2, ON(900, 420, 1.3)]], 1.2);
  c = withTight(sh, lt, c, head[0], head[1], 2.5);
  cam(c, () => {
    wallRoom(520, 2.8);
    const wx = 720, wy = 250; shape(R(wx - 150, wy - 140, 300, 280), { lw: 2.6, id: 5800, fill: P.paper });
    X.save(); path(R(wx - 140, wy - 130, 280, 260)); X.clip(); hatchSky(wy - 130, wy + 130, wx - 140, wx + 140); for (let k = 0; k < 14; k++) { const u = ((lt * 0.12 + hash(5810, k)) % 1); bundle(wx - 130 + hash(5811, k) * 260, wy - 160 + u * 330, 0.55, 5820 + k * 5, { sway: Math.sin(lt * 2 + k) }); } X.restore();
    line([wx, wy - 130], [wx, wy + 130], 3, 5801, 0.2); line([wx - 140, wy], [wx + 140, wy], 3, 5802, 0.2);
    // the economy gauge
    shape(R(GX - 150, GYY - 150, 300, 300), { lw: 2.4, id: 5850, fill: '#8c857a', h: [[0.7, 3.2, 0.7], [-0.7, 3.2, 0.5]] });
    gauge(GX, GYY, 120, eco, 5860, { nums: ['BUST', '', '', '', 'BOOM'], label: 'ECONOMY', unit: 'OF THE REALM', redLow: true, chatter: 0.3, rim: BRASS });
    throne(EX, 600, 5900);
    monarch(EX, FLOOR - 36, 0.95, 5950, 'E', sh, lt, { f: -1, seated: true, fill: OCHRE, look: lt < L[5].t0 ? -1 : -1, lookY: lt >= L[3].t0 && lt < L[5].t0 ? -0.5 : 0, quill: lt >= sg.at, ra: lt >= sg.at ? [0.6, -0.2] : undefined });
    if (lt >= sg.at) { const sx = EX - 120; shape(R(sx - 40, FLOOR - 200, 80, 60), { lw: 1.6, id: 5990, fill: '#f4eedb' }); for (let i = 0; i < 3; i++) line([sx - 30, FLOOR - 186 + i * 12], [sx - 30 + 60 * clamp((lt - sg.at) * 1.5 - i * 0.4), FLOOR - 186 + i * 12], 1.1, 5991 + i, 0.3); }
    babyCrowd(hl.at - 0.6, lt, [60, FLOOR - 30, 1220, FLOOR + 24], 6500, { a: 4, k: 0.26, s: 0.9, max: 120, walkIn: true });
  });
};

/* ---------- 9. taken apart, and the wedding ---------- */
SHOTS.wedding = (lt, sd, sh) => {
  const L = sh.lines, pl = cue(sh, 'plug'), ap = cue(sh, 'apart'), of = cue(sh, 'off'), fe = cue(sh, 'feast'), to = cue(sh, 'toast'), fa = cue(sh, 'fanfare'), ho = cue(sh, 'home');
  if (lt < ap.at) {
    cam(ON(640, 400, 1.05), () => {
      wallRoom(520, 2.4);
      for (let i = 0; i < 3; i++) { const u = E.out(U(lt, pl.at + 0.2 + i * 0.6, pl.at + 0.6 + i * 0.6)); cannon(270 + i * 340, FLOOR, 1.25, 0.12, 6600 + i * 30, { plug: u }); }
      courtier(lerp(200, 900, U(lt, pl.at, pl.to)), FLOOR + 8, 1.6, 6700, { f: 1, walk: 1, ph: lt * 10, wave: 1 });
    });
    dipAt(lt, ap.at); return;
  }
  if (lt < fe.at) {
    const u = U(lt, ap.at, of.at), head = headPos(715, GY, 0.82);
    let c = ON(PNX - 80, PNY + 10, 1.35); c = withTight(sh, lt, c, head[0], head[1], 2.45);
    const drop = E.io(U(lt, ap.at, of.at + 0.3));
    cam(c, () => {
      garden(lt); temple(TPX, GY, lt, { wired: 1, apart: drop, idle: 0.3 * (1 - drop), cableTo: pAt(-150, 130) });
      panel(PNX, PNY, PNS, { p: 0.35 * (1 - drop), e: 0.4 * (1 - drop), r: 0.15 * (1 - drop) + 0.02, knobs: [0.95 * (1 - drop), 0.95 * (1 - drop), 0.95 * (1 - drop)], lever: 0.35 * (1 - drop), dark: drop });
      for (let i = 0; i < 5; i++) { const pu_ = U(lt, ap.at + i * 0.7, ap.at + i * 0.7 + 0.5); if (pu_ > 0) shape(R(560 + i * 34 + (1 - pu_) * 40, GY - 18 - i * 6, 60, 12), { lw: 1.4, id: 6800 + i, fill: '#d8cdb0', h: [0.2, 2.6, 0.6] }); }
      trurlF(715, GY, 0.82, sh, lt, { f: 1, ra: lt < of.at ? [-0.3 + 0.3 * Math.sin(lt * 6), -0.6] : undefined, look: 1 });
    });
    dipAt(lt, fe.at); return;
  }
  if (lt < ho.at) {
    const raise = lt >= to.at ? E.out(U(lt, to.at, to.at + 0.6)) * (1 - U(lt, fa.at + 2.5, fa.at + 3.2)) : 0;
    const c = camFor(lt, [[fe.at, ON(640, 380, 1.0)], [L[4].t0 - 0.3, ON(560, 360, 1.5)], [L[4].t1 + 0.3, ON(640, 380, 1.0)]], 0.8);
    cam(c, () => {
      wallRoom(520, 2.8);
      for (const x of [120, 1160]) column(x, 150, 540, 62, 7000 + x);
      chandelier(640, 120, 360, lt, 7050);
      monarch(225, FLOOR, 0.82, 7100, 'K', sh, lt, { f: 1, smile: true, ra: raise ? [-0.9, -1.2] : undefined });
      monarch(1055, FLOOR, 0.82, 7200, 'E', sh, lt, { f: -1, fill: OCHRE, smile: true, ra: raise ? [-0.9, -1.2] : undefined });
      princeF(560, FLOOR, 0.82, sh, lt, { f: 1, look: 1, lookY: 0, tilt: -0.05, ra: raise ? [-0.9, -1.2] : [1.5, 1.6] });
      princessF(700, FLOOR, 0.8, lt, { f: -1, look: -1, ra: raise ? [-0.9, -1.2] : undefined });
      // the long table in front of them
      shape(R(330, 520, 620, 26), { lw: 2.2, id: 7300, fill: '#f4eedb', h: [0.05, 5, 0.4] }); shape(R(340, 546, 600, 110), { lw: 1.6, id: 7301, fill: '#f4eedb', h: [Math.PI / 2, 6, 0.5] });
      for (let i = 0; i < 5; i++) goblet(380 + i * 130, 520, 1.2, 7310 + i * 3);
      for (const [x, s_] of [[225, 0.82], [1055, 0.82], [560, 0.82], [700, 0.8], [840, 0.85]]) if (raise) { const hp = [x + (x < 640 ? 1 : -1) * 40, FLOOR - 286 * s_ + 20]; goblet(hp[0], hp[1], 1.3, 7330 + x); }
      trurlF(840, FLOOR, 0.85, sh, lt, { f: -1, robe: EMERALD, baton: -1.2 - 0.5 * Math.sin(lt * 3), ra: [-0.6, -1.0], look: -1 });
      for (const [x, f] of [[85, 1], [1195, -1]]) herald(x, FLOOR + 6, 2.0, 7400 + x, { f, up: lt >= fa.at && lt < fa.at + 3 });
    });
    dipAt(lt, ho.at); return;
  }
  const u = U(lt, ho.at, sd);
  cam(ON(640, 360, 1.0), () => {
    X.fillStyle = P.paper; X.fillRect(PX0 - 500, PY0 - 500, 2300, 1600); nightSky(8120); empStar(1150, 140, 26, lt, 7500);
    const rx = lerp(160, 1240, E.io(u)), ry = lerp(560, 140, E.io(u)), s_ = 1 - 0.65 * u;
    X.save(); X.translate(rx, ry); X.rotate(-0.4); X.scale(s_, s_);
    for (let i = 0; i < 6; i++) { const q = ((lt * 2 + i / 6) % 1); X.save(); X.globalAlpha = 1 - q; ball(-90 - q * 120, (hash(7600, i) - 0.5) * 20, 8 + 20 * q, 7610 + i, PAT.f, 1.2); X.restore(); }
    shape([[-70, -20], [50, -20], [90, 0], [50, 20], [-70, 20]], { lw: 2.4, id: 7620, fill: P.paper, h: [0.1, 3, 0.6] }); shape([[-70, -20], [-92, -40], [-80, 0], [-92, 40], [-70, 20]], { lw: 2, id: 7621, fill: P.red });
    for (let i = 0; i < 4; i++) { X.save(); X.translate(-40 + i * 24, -34); X.rotate(0.2 * (i - 1.5)); scroll(0, 0, 22, 30, 7630 + i * 10); X.restore(); }
    ball(30, 0, 8, 7660, PAT.f, 1.4, P.amber);
    X.restore();
  });
};

/* ---------- title and end ---------- */
SHOTS.title = (lt, sd) => {
  X.fillStyle = P.paper; X.fillRect(0, 0, W, H);
  txt('THE FOURTH SALLY', CX, 160, 70, {}); txt('or, How Trurl Built a Femfatalatron', CX, 236, 36, { italic: true }); txt('after Stanisław Lem, The Cyberiad', CX, 292, 22, { italic: true });
  const v = E.in(U(lt, 0.7, 3.3));
  gauge(CX, 500, 120, v, 9400, { nums: ['0', '10', '20', '30', '40'], label: 'POWER', unit: 'MEGAMORS', chatter: lt > 3.3 ? 1 : 0.4, crack: lt >= 3.6 ? 1 : 0, bend: lt >= 3.6 ? 0.4 : 0 });
  if (lt > 3.6 && lt < 4.1) { const fu = (lt - 3.6) / 0.5; X.save(); X.globalAlpha = 1 - fu; star(CX, 500, 60 + 160 * fu, 9450, P.ink, 12); X.restore(); }
};
SHOTS.end = (lt, sd) => {
  X.fillStyle = P.paper; X.fillRect(0, 0, W, H); X.globalAlpha = seg(lt, 0.4, 1.6);
  txt('THE FOURTH SALLY, OR HOW TRURL BUILT A FEMFATALATRON', CX, 120, 32, {}); txt('after Stanisław Lem, The Cyberiad', CX, 168, 24, { italic: true }); X.globalAlpha = 1;
  gauge(560, 480, 110, 0, 9500, { nums: ['0', '10', '20', '30', '40'], label: 'POWER', unit: 'MEGAMORS', crack: 1 });
  const u = E.out(U(lt, 0.8, 3.2)); if (u < 1) bundle(780, lerp(160, 570, u), 1.0, 9550, { sway: Math.sin(lt * 2) * (1 - u) }); else baby(780 + (lt - 3.2) * 18, 590, 1.1, 9560, { f: 1, ph: lt * 8 });
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
  const fade = sh.shot === 'title' ? Math.max(1 - seg(lt, 0, 0.6), seg(lt, sd - 0.6, sd)) : sh.shot === 'end' ? 1 - seg(lt, 0, 0.5) : sh.shot === 'wedding' ? seg(lt, sd - 1.0, sd) : sh.shot === 'knock' ? 1 - seg(lt, 0, 1.0) : 1 - seg(lt, 0, 0.3);
  if (fade > 0) { X.fillStyle = P.paper; X.globalAlpha = fade; X.fillRect(0, 0, W, H); X.globalAlpha = 1; }
  border();
};
(async () => {
  T = await (await fetch('timing/ff.json')).json();
  await document.fonts.ready; await Promise.all(['IM Fell English', 'IBM Plex Mono'].map((n) => document.fonts.load(`20px "${n}"`)));
  X = document.getElementById('film').getContext('2d');
  window.__NF = Math.ceil(T.dur * 24); window.__T = T; window.__ready = true;
})();
