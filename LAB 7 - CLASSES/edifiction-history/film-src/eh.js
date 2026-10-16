/* A Short History of Edifiction. Drawing. Film 1 of THE HOUSE THAT LANGUAGE BUILT, four fables of Edifiction; an original
   fable from Watson Hartsoe's notes, in the manner of Stanislaw Lem. Same toolkit as the Lem films: ink.js (Kingdoms in a Box)
   plus the head of the Ferrix drawing file, copied below unchanged from its second line on.
   The device: the open encyclopedia is the frame. Each scene is an engraved plate on its right-hand page; the camera enters the
   plate, the plate becomes the world, and the camera comes back out to the page before the page turns. Houses are drawn from
   their sentences: the typed words fall onto the plot and their letters become the bricks of the walls. */
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





/* ================= helpers (as in the earlier films) ================= */
let T = null, GT = 0;
const RED = '#a8432e', PAPER2 = '#f4eedc', CLOTH = '#4b4137', GREY = '#5d564b';
const sayAt = (sh, who, lt) => { for (const l of sh.lines) if (l.who === who && lt >= l.t0 && lt < l.t1) return l.env[Math.min(l.env.length - 1, Math.floor((lt - l.t0) * 24))] || 0; return 0; };
const talking = (sh, who, lt) => sh.lines.some((l) => l.who === who && lt >= l.t0 - 0.1 && lt < l.t1 + 0.2);
const cue = (sh, k, i = 0) => sh.cues.filter((c) => c.k === k)[i];
const cues = (sh, k) => sh.cues.filter((c) => c.k === k).sort((a, b) => (a.n || 0) - (b.n || 0));
function cam(c, fn) { X.save(); X.translate(CX, CY); X.scale(c.z, c.z); X.translate(-CX - c.x, -CY - c.y); fn(); X.restore(); }
const ON = (x, y, z) => ({ z, x: x - CX, y: y - CY });
function blendCam(a, b, u) { return { z: Math.exp(lerp(Math.log(a.z), Math.log(b.z), u)), x: lerp(a.x, b.x, u), y: lerp(a.y, b.y, u) }; }
function camFor(lt, plan, dur = 0.8) { let c = plan[0][1]; for (let i = 1; i < plan.length; i++) { const [t0, cc, dd] = plan[i]; if (lt >= t0) c = blendCam(c, cc, seg(lt, t0, t0 + (dd || dur), E.io)); } return c; }
const U = (t, a, b) => clamp((t - a) / Math.max(0.01, b - a));
const pulse = (t, a, d = 0.18) => (t >= a && t < a + d ? Math.sin(Math.PI * (t - a) / d) : 0);
const fulcrum = (sh) => sh.lines.find((l) => l.line);
const tightU = (sh, lt) => { const f = fulcrum(sh); return f ? seg(lt, f.t0 - 0.5, f.t0 + 0.3) * (1 - seg(lt, f.t1 + 0.1, f.t1 + 0.8)) : 0; };
function withTight(sh, lt, c, x, y, z = 2.5) { const u = tightU(sh, lt); return u > 0 ? blendCam(c, ON(x, y, z), E.io(u)) : c; }
const rot = (x, y, a) => { const c = Math.cos(a), s = Math.sin(a); return [x * c - y * s, x * s + y * c]; };
const SHOTS = {}, SPREADS = {};
const FONTI = (sz) => `italic ${sz}px ${FONT}`, FONTR = (sz) => `${sz}px ${FONT}`, MONO = (sz, b) => `${b ? 600 : 400} ${sz}px "IBM Plex Mono","DejaVu Sans Mono",monospace`;
function wrap(text, width, font) {
  X.font = font; const out = []; let cur = '';
  for (const w of text.split(' ')) { const t = cur ? cur + ' ' + w : w; if (X.measureText(t).width > width && cur) { out.push(cur); cur = w; } else cur = t; }
  if (cur) out.push(cur); return out;
}
function tx(s, x, y, font, o = {}) { if (SILENT) return; X.font = font; X.textAlign = o.align || 'left'; X.textBaseline = o.base || 'alphabetic'; X.fillStyle = o.col || P.ink; X.globalAlpha = o.alpha ?? 1; X.fillText(s, x, y); X.globalAlpha = 1; }
/* a word-level time inside a line: the moment the spoken line reaches character fraction q */
const lineAt = (l, q) => l.t0 + (l.t1 - l.t0) * q;

/* ================= the book ================= */
const BK = { x0: 72, x1: 1208, y0: 46, y1: 682, g: 640 };
const LP = { x: 80, y: 52, w: 552, h: 624 }, RP = { x: 648, y: 52, w: 552, h: 624 };
const COL = { x: 122, w: 470, y: 150, lead: 19.5, fs: 14 };
const PAGE = ON(640, 364, 1.0);
function bookUnder() {
  shape(R(BK.x0 - 10, BK.y0 - 6, BK.x1 - BK.x0 + 20, BK.y1 - BK.y0 + 16), { lw: 1.8, id: 9000, fill: CLOTH, amp: 0.4 });
  for (let i = 0; i < 5; i++) { line([BK.x0 - 4 + i * 2, BK.y0 + 2 + i], [BK.x0 - 4 + i * 2, BK.y1 + 4 - i], 0.7, 9001 + i, 0.2, P.paper); line([BK.x1 + 4 - i * 2, BK.y0 + 2 + i], [BK.x1 + 4 - i * 2, BK.y1 + 4 - i], 0.7, 9011 + i, 0.2, P.paper); }
}
function pageSheet(pg, side) {
  shape(R(pg.x, pg.y, pg.w, pg.h), { lw: 1.2, id: 9100 + side, fill: PAPER2, amp: 0.25 });
  // gutter shade: fine vertical rules thickening toward the fold
  X.save(); for (let i = 0; i < 16; i++) { const x = side ? pg.x + i * 2.2 : pg.x + pg.w - i * 2.2; X.globalAlpha = 0.5 * (1 - i / 16); X.fillStyle = P.ink; X.fillRect(x - 0.4, pg.y + 1, 0.6, pg.h - 2); } X.restore();
}
function runningHeads(left, right, fl, fr) {
  tx('UNIVERSAL ENCYCLOPEDIA OF CONSTRUCTIVE SEMANTICS', LP.x + 42, LP.y + 34, MONO(9), { col: GREY });
  tx(left || 'VOL. VII', LP.x + LP.w - 30, LP.y + 34, MONO(9), { col: GREY, align: 'right' });
  tx(right || 'PREFACE', RP.x + 30, RP.y + 34, MONO(9), { col: GREY });
  tx('VOL. VII', RP.x + RP.w - 42, RP.y + 34, MONO(9), { col: GREY, align: 'right' });
  line([LP.x + 42, LP.y + 44], [LP.x + LP.w - 30, LP.y + 44], 0.6, 9201, 0.2, GREY); line([RP.x + 30, RP.y + 44], [RP.x + RP.w - 42, RP.y + 44], 0.6, 9202, 0.2, GREY);
  if (fl) tx(fl, LP.x + LP.w / 2, LP.y + LP.h - 18, MONO(9), { col: GREY, align: 'center' });
  if (fr) tx(fr, RP.x + RP.w / 2, RP.y + RP.h - 18, MONO(9), { col: GREY, align: 'center' });
}
/* the printed column: the shot's own lines, prepared once. Returns nothing; positions kept in TXT for close-ups */
const TXT = {};
function prepColumn(sh, head, o = {}) {
  const out = []; let y = o.y0 || COL.y;
  if (head) { out.push({ s: head, x: COL.x + COL.w / 2, y, font: FONTR(22), align: 'center', head: true }); y += 16; out.push({ rule: true, y }); y += 30; }
  sh.lines.forEach((l, i) => {
    const s = l.show || l.say, quote = l.who !== 'N';
    if (o.sub === i) { for (const ln of wrap(s, COL.w - 40, FONTI(14))) { out.push({ s: ln, x: COL.x + COL.w / 2, y, font: FONTI(14), align: 'center', li: i }); y += 19; } y += 18; return; }
    if (o.big === i) { for (const ln of wrap(s, COL.w, FONTR(19))) { out.push({ s: ln, x: COL.x, y, font: FONTR(19), li: i }); y += 26; } y += 12; return; }
    const f = quote ? FONTI(COL.fs) : FONTR(COL.fs), xx = quote ? COL.x + 34 : COL.x, ww = quote ? COL.w - 68 : COL.w;
    const lines = wrap(quote ? '“' + s + '”' : s, ww, f);
    lines.forEach((ln, k) => { out.push({ s: ln, x: xx + (!quote && k === 0 && i > 0 ? 18 : 0), y, font: f, li: i }); y += COL.lead; });
    y += quote ? 8 : 6;
  });
  TXT[sh.shot] = out; return out;
}
function drawColumn(name, alpha = 1) {
  for (const r of TXT[name] || []) {
    if (r.rule) { line([COL.x + COL.w / 2 - 60, r.y], [COL.x + COL.w / 2 + 60, r.y], 0.8, 9300, 0.2); continue; }
    tx(r.s, r.x, r.y, r.font, { align: r.align || 'left', alpha });
  }
}
const colLine = (name, li) => (TXT[name] || []).filter((r) => r.li === li);

/* plates: {x, y, w} on a page; h = w * 9 / 16; scene drawn at 1280x720 inside */
const PH = (p) => p.w * 9 / 16;
const IN = (p) => ON(p.x + p.w / 2, p.y + PH(p) / 2, 1280 / p.w);
function plate(p, draw, caption) {
  const h = PH(p);
  shape(R(p.x - 7, p.y - 7, p.w + 14, h + 14), { lw: 0.9, id: 9400 + (p.x | 0), fill: PAPER2, amp: 0.2 });
  X.save(); X.beginPath(); X.rect(p.x, p.y, p.w, h); X.clip(); X.translate(p.x, p.y); X.scale(p.w / 1280, p.w / 1280);
  X.fillStyle = P.paper; X.fillRect(0, 0, 1280, 720); draw(); X.restore();
  ink([[p.x, p.y], [p.x + p.w, p.y], [p.x + p.w, p.y + h], [p.x, p.y + h]], 1.6, 9410 + (p.x | 0), 0.3, P.ink, true);
  if (caption) { const ls = wrap(caption, p.w + 10, FONTI(12)); ls.forEach((s, i) => tx(s, p.x + p.w / 2, p.y + h + 26 + i * 15, FONTI(12), { align: 'center' })); }
}
/* does the camera c see only the inside of plate p? */
function fills(c, p) {
  const sx = (x) => CX + (x - CX - c.x) * c.z, sy = (y) => CY + (y - CY - c.y) * c.z;
  return sx(p.x) <= 1 && sx(p.x + p.w) >= W - 1 && sy(p.y) <= 1 && sy(p.y + PH(p)) >= H - 1;
}
/* the page turn: the right-hand sheet swings over the fold. front: the old right page; back: the new left page */
function turnSheet(u, front, back) {
  if (u <= 0 || u >= 1) return;
  const c = Math.cos(Math.PI * u);
  X.save(); X.translate(BK.g, 0); X.scale(Math.max(0.002, Math.abs(c)) * (c >= 0 ? 1 : -1), 1); X.translate(-BK.g, 0);
  if (c >= 0) { front(); X.globalAlpha = 0.45 * (1 - c); X.fillStyle = P.ink; X.fillRect(RP.x, RP.y, RP.w, RP.h); }
  else { X.translate(BK.g, 0); X.scale(-1, 1); X.translate(-BK.g, 0); back(); X.globalAlpha = 0.35 * (1 + c); X.fillStyle = P.ink; X.fillRect(LP.x, LP.y, LP.w, LP.h); }
  X.restore(); X.globalAlpha = 1;
}

/* ================= the world ================= */
const GY = 560;
function sky(y1 = GY, al = 0.22) { if (SILENT) return; X.fillStyle = P.ink; for (let y = 4, k = 0; y < y1; y += 5, k++) { X.globalAlpha = al * (0.5 + 0.5 * y / y1); X.fillRect(-2000, y, 6000, 0.6 + 0.2 * hash(k, 9)); } X.globalAlpha = 1; }
function groundBand(gy = GY, x0 = -2000, x1 = 4000) {
  X.fillStyle = P.paper; X.fillRect(x0, gy, x1 - x0, 900);
  X.fillStyle = P.ink; for (let y = gy + 4, k = 0; y < gy + 900; y += 3 + k * 0.9, k++) X.fillRect(x0, y, x1 - x0, 0.5 + Math.min(1.4, k * 0.05));
  line([x0, gy], [x1, gy], 2, 9500, 0.3);
}
/* the brass plate every described building carries: its sentence in red */
function brass(x, y, s, sz = 6, o = {}) {
  if (SILENT) return;
  X.font = FONTI(sz); const w = X.measureText(s).width + sz * 2.2, h = sz * 2.1;
  shape(R(x - w / 2, y - h / 2, w, h), { lw: Math.max(0.6, sz * 0.12), id: 9600 + (x | 0), fill: '#e8d9b0', amp: 0.1 });
  ink([[x - w / 2 + sz * 0.35, y - h / 2 + sz * 0.35], [x + w / 2 - sz * 0.35, y - h / 2 + sz * 0.35], [x + w / 2 - sz * 0.35, y + h / 2 - sz * 0.35], [x - w / 2 + sz * 0.35, y + h / 2 - sz * 0.35]], Math.max(0.3, sz * 0.05), 9601, 0.05, P.ink, true);
  for (const k of [-1, 1]) { X.beginPath(); X.arc(x + k * (w / 2 - sz * 0.2), y, sz * 0.12, 0, 6.283); X.fillStyle = P.ink; X.fill(); }
  const n = o.n ?? 1e9; tx(s.slice(0, n), x, y + sz * 0.36, FONTI(sz), { align: 'center', col: RED, alpha: o.alpha ?? 1 });
  return w;
}
/* letter bricks: rows of the sentence, offset like a brick bond, inside rect; rev 0..1 reveals from the bottom */
function bricks(x, y, w, h, s, sz = 7, rev = 1, al = 0.42, id = 0) {
  if (SILENT || rev <= 0) return;
  const top = y + h - h * rev;
  X.save(); X.beginPath(); X.rect(x, top, w, y + h - top); X.clip();
  X.font = MONO(sz); X.textAlign = 'left'; X.textBaseline = 'alphabetic'; X.fillStyle = P.ink;
  const row = sz * 1.32, str = (s.toUpperCase().replace(/[^A-Z ]/g, '') + ' ').repeat(Math.ceil(w / (sz * 0.6 * s.length)) + 2);
  for (let r = 0, yy = y + h - 2; yy > top - row; r++, yy -= row) {
    X.globalAlpha = al * (0.75 + 0.25 * hash(r, id)); X.fillText(str, x - (r % 2 ? sz * 1.6 : 0) - (id % 7) * sz * 0.6, yy);
    X.globalAlpha = al * 0.55; X.fillRect(x, yy + sz * 0.22, w, 0.5);
  }
  X.restore(); X.globalAlpha = 1;
}
function win(x, y, w, h, id, o = {}) {
  const col = o.red ? RED : P.ink;
  if (o.blank) return;
  shape(R(x, y, w, h), { lw: o.lw || 1.3, id, fill: o.lit ? '#fbf4dc' : P.paper, col });
  if (!o.lit) { X.save(); path(R(x + 2, y + 2, w - 4, h - 4)); X.clip(); hatch(0.8, o.red ? 2.4 : 2.0, 0.7, [x, y, x + w, y + h], col); X.restore(); }
  line([x + w / 2, y], [x + w / 2, y + h], 1, id + 1, 0.1, col); line([x, y + h * 0.45], [x + w, y + h * 0.45], 1, id + 2, 0.1, col);
  line([x - 3, y + h + 2], [x + w + 3, y + h + 2], 1.6, id + 3, 0.1, col);
}
/* a described house. x = left edge, gy = ground. Returns the window rects. u 0..1: walls rise, openings cut, roof, plate */
function house(o) {
  const { x, w, h } = o, gy = o.gy ?? GY, id = o.id || 1, u = o.u ?? 1;
  const wallU = seg(u, 0, 0.55, E.lin), cutU = seg(u, 0.5, 0.68), roofU = seg(u, 0.66, 0.9), plU = seg(u, 0.9, 1);
  const d = o.depth ?? Math.min(60, w * 0.16), top = gy - h, rise = top + h * (1 - wallU);
  const al = o.alpha ?? 1; X.save(); X.globalAlpha = al;
  // side wall (in shadow)
  if (wallU > 0) {
    X.save(); X.beginPath(); X.rect(x + w - 1, rise - d, d + 4, gy - rise + d + 2); X.clip();
    shape([[x + w, gy], [x + w + d, gy - d * 0.45], [x + w + d, top - d * 0.45], [x + w, top]], { lw: 1.3, id: id + 1, h: [[1.5, 2.2, 0.8], [0.6, 3.6, 0.5]] });
    X.restore();
    shape(R(x, rise, w, gy - rise), { lw: 1.6, id: id + 2, fill: o.fill || PAPER2 });
    if (o.text !== false) bricks(x + 1, top, w - 2, h - 1, o.s || 'house', o.bsz || 7, wallU, o.bal ?? 0.24, id);
    if (o.base !== false) shape(R(x - 3, gy - 9, w + 6, 9), { lw: 1.1, id: id + 3, h: [0.2, 2.6, 0.6] });
  }
  // openings
  const wins = [];
  const fl = o.floors || 1, cols = o.cols || 2, fh = (h - (o.cornice ? 18 : 0)) / fl;
  for (let f = 0; f < fl; f++) for (let c = 0; c < cols; c++) {
    const ww = o.ww || Math.min(w / cols * 0.42, 34), wh = o.wh || fh * 0.5, cx = x + w * (c + 0.5) / cols, cy = gy - fh * (f + 0.5);
    if (o.door && f === 0 && Math.abs(cx - (x + w / 2)) < (o.door.w || 30) * 0.9) continue;
    wins.push([cx - ww / 2, cy - wh / 2, ww, wh]);
  }
  if (cutU > 0) {
    X.save(); X.globalAlpha = al * cutU;
    wins.forEach((r, i) => win(r[0], r[1], r[2], r[3], id + 10 + i * 5, { red: o.redWin === i, blank: o.blankWin === i, lit: o.lit }));
    if (o.door) { const dw = o.door.w || 30, dh = o.door.h || Math.min(fh * 0.75, 60), dx = x + w / 2 - dw / 2 + (o.door.dx || 0);
      shape([[dx, gy - 9], [dx, gy - dh], [dx + dw / 2, gy - dh - dw * 0.3], [dx + dw, gy - dh], [dx + dw, gy - 9]], { lw: 1.4, id: id + 5, h: [[1.57, 2.4, 0.7]], fill: P.paper });
      X.beginPath(); X.arc(dx + dw * 0.8, gy - dh * 0.45, Math.max(1.2, dw * 0.05), 0, 6.283); X.fillStyle = P.paper; X.fill(); X.lineWidth = 0.8; X.strokeStyle = P.ink; X.stroke(); }
    X.restore();
  }
  // columns (the classical manner)
  if (o.columns && cutU > 0) { X.save(); X.globalAlpha = al * cutU; for (let i = 0; i < o.columns; i++) { const cx = x + 10 + (w - 20) * (i / (o.columns - 1)); shape(R(cx - 6, top + 14, 12, h - 23), { lw: 1.1, id: id + 60 + i, h: [Math.PI / 2, 3, 0.5], fill: PAPER2 }); shape(R(cx - 9, top + 8, 18, 6), { lw: 1, id: id + 70 + i }); } X.restore(); }
  // roof
  if (roofU > 0) {
    X.save(); X.beginPath(); X.rect(x - 60, top - 400 * roofU + 1, w + d + 120, 400 * roofU); X.clip();
    const ov = 10;
    if (o.roof === 'flat' || o.cornice) {
      shape(R(x - ov, top - 16, w + ov * 2, 16), { lw: 1.6, id: id + 30, fill: PAPER2, h: [0.1, 3.2, 0.5] });
      shape([[x + w + ov, top - 16], [x + w + ov + d, top - 16 - d * 0.45], [x + w + ov + d, top - d * 0.45], [x + w + ov, top]], { lw: 1.2, id: id + 31, h: [1.5, 2, 0.8] });
      for (let i = 0; i < w / 9; i++) shape(R(x - ov + 4 + i * 9, top - 4, 4, 4), { lw: 0.6, id: id + 32 + i, fill: P.ink });
      if (o.cornice === 'big') { shape([[x - ov - 8, top - 16], [x + w + ov + 8, top - 16], [x + w + ov, top - 30], [x - ov, top - 30]], { lw: 1.4, id: id + 33, h: [0.3, 2.4, 0.6] }); }
    }
    if (o.roof === 'gable' || o.roof === 'pediment') {
      const rh = o.rh ?? (o.roof === 'pediment' ? w * 0.22 : w * 0.45), ax = x + w / 2;
      shape([[x + w + ov, top], [x + w + ov + d, top - d * 0.45], [ax + d, top - rh - d * 0.45], [ax, top - rh]], { lw: 1.3, id: id + 40, h: [[-0.5, 2.4, 0.7], [1.2, 3.2, 0.5]] });
      shape([[x - ov, top], [x + w + ov, top], [ax, top - rh]], { lw: 1.6, id: id + 41, fill: PAPER2, h: o.roof === 'pediment' ? [0, 3.4, 0.4] : [[-1.0, 3, 0.6]] });
      if (o.roof === 'pediment') shape([[x + 14, top - 5], [x + w - 14, top - 5], [ax, top - rh + 9]], { lw: 0.9, id: id + 42, fill: PAPER2 });
      if (o.chimney) for (const cxf of [].concat(o.chimney)) { const cx = x + w * cxf, ch = o.ch || 34, cy = top - rh * (1 - Math.abs(cx - ax) / (w / 2 + ov)); shape(R(cx - 8, cy - ch, 16, ch + 4), { lw: 1.3, id: id + 44 + (cxf * 10 | 0), h: [Math.PI / 2, 2.6, 0.6] }); shape(R(cx - 10, cy - ch - 5, 20, 6), { lw: 1.1, id: id + 47 }); }
      if (o.dome) { const r = w * 0.12, dy = top - rh * 0.55, pts = []; for (let i = 0; i <= 16; i++) { const t = Math.PI + i / 16 * Math.PI; pts.push([ax + Math.cos(t) * r, dy + Math.sin(t) * r]); } shape(pts, { lw: 1.4, id: id + 48, fill: PAPER2, h: [1.2, 2.6, 0.6] }); shape(R(ax - 3, dy - r - 2, 6, r * 0.9), { lw: 0.8, id: id + 49, fill: P.ink }); line([ax + 2, dy - r * 0.7], [ax + r * 1.1, dy - r * 1.5], 3, id + 50, 0.2); }
    }
    X.restore();
  }
  if (o.plate && plU > 0) { const px = o.px ?? (o.door ? x + w / 2 + (o.door.w || 30) / 2 + (o.psz || 4) * 9 : x + w / 2); brass(px + (o.pdx || 0), gy - (o.py ?? 24), o.plate, o.psz || 4, { alpha: plU, n: Math.ceil(o.plate.length * plU) }); }
  X.restore();
  return wins;
}

/* people: engraved, profile heads, coats hatched on the shadow side. feet at (x, y); s 1 is about 170 px tall; f facing */
function person(o) {
  if (SILENT) return;
  const s = o.s || 1, f = o.f || 1, id = o.id || 1, k = o.kind || 'man';
  X.save(); X.translate(o.x, o.y); X.scale(s * f, s * (o.sy || 1)); X.rotate(o.lean || 0); X.globalAlpha = o.alpha ?? 1;
  const ph = o.ph || 0, wk = o.walk || 0, skirt = k === 'woman' || k === 'mother' || k === 'girl';
  const sitting = o.sit, hip = sitting ? -72 : -84;
  // legs
  if (sitting) { for (const q of [0, 1]) { line([q * 4, hip], [34 + q * 4, hip], 7, id + q, 0.2); line([34 + q * 4, hip], [34 + q * 4, -6], 6, id + 2 + q, 0.2); shape([[28 + q * 4, -8], [48 + q * 4, -8], [48 + q * 4, 0], [28 + q * 4, 0]], { lw: 1, id: id + 4 + q, fill: P.ink }); } }
  else if (!skirt) for (const q of [0, 1]) {
    const a = ph + q * Math.PI, sw = Math.sin(a) * 15 * wk, lift = Math.max(0, Math.cos(a)) * 7 * wk;
    ink([[q ? 4 : -3, hip], [sw * 0.5 + (q ? 3 : -2), hip / 2 - lift * 0.4], [sw, -4 - lift]], 6.5, id + q, 0.3);
    X.beginPath(); X.ellipse(sw + 6, -3 - lift, 10, 4.2, 0, Math.PI, 0); X.fillStyle = P.ink; X.fill();
  } else for (const q of [0, 1]) { const a = ph + q * Math.PI, sw = Math.sin(a) * 9 * wk; X.beginPath(); X.ellipse(sw + 6 + q * 4, -3, 8, 3.6, 0, Math.PI, 0); X.fillStyle = P.ink; X.fill(); }
  // body
  const sh = -142, wide = k === 'official' || k === 'critic' ? 2 : 0;
  if (skirt) shape([[-14, sh + 4], [14, sh + 4], [17, -96], [28 + wk * Math.sin(ph) * 2, -5], [-26, -5], [-17, -96]], { lw: 1.7, id: id + 6, fill: o.dark ? '#d9cfb4' : PAPER2, sh: [[2, sh], [40, sh], [40, 0], [4, 0]], sh2: [[1.5, 2.4, 0.7]], h: o.dark ? [0.9, 3, 0.5] : undefined });
  else if (sitting) shape([[-15, sh + 2], [15, sh + 2], [18, hip + 4], [-18, hip + 4]], { lw: 1.7, id: id + 6, fill: PAPER2, sh: [[3, sh], [30, sh], [30, hip + 8], [3, hip + 8]], sh2: [1.5, 2.2, 0.7] });
  else shape([[-15 - wide, sh + 2], [15 + wide, sh + 2], [20 + wide, -70], [-20 - wide, -70]], { lw: 1.7, id: id + 6, fill: o.dark ? '#d9cfb4' : PAPER2, sh: [[3, sh], [34, sh], [34, -60], [3, -60]], sh2: [1.5, 2.2, 0.7], h: o.dark ? [0.9, 3, 0.5] : undefined });
  if (!skirt && !sitting) { line([0, sh + 6], [2, -74], 0.8, id + 7, 0.2); for (let b = 0; b < 3; b++) { X.beginPath(); X.arc(4, -128 + b * 16, 1.4, 0, 6.283); X.fillStyle = P.ink; X.fill(); } }
  if (k === 'woman') { shape([[-18, sh + 2], [18, sh + 2], [12, sh + 30], [-16, sh + 26]], { lw: 1.2, id: id + 8, h: [[0.7, 3, 0.5], [-0.7, 3, 0.5]] }); }
  // arms: a = [shoulder angle, elbow angle] in radians from straight down; back arm first
  const arm = (side, ang, lw) => { const sx = side ? 8 : -6, sy = sh + 6; const a1 = Math.PI / 2 - ang[0], a2 = Math.PI / 2 - ang[1];
    const ex = sx + Math.cos(a1) * 30, ey = sy + Math.sin(a1) * 30, hx = ex + Math.cos(a2) * 28, hy = ey + Math.sin(a2) * 28;
    ink([[sx, sy], [ex, ey], [hx, hy]], lw, id + 9 + side, 0.25); X.beginPath(); X.arc(hx, hy, 3.6, 0, 6.283); X.fillStyle = P.paper; X.fill(); X.lineWidth = 1.1; X.strokeStyle = P.ink; X.stroke(); return [hx, hy]; };
  const ab = o.armB || [-0.15 - Math.sin(ph) * 0.3 * wk, -0.1], af = o.armF || [0.15 + Math.sin(ph) * 0.3 * wk, 0.25];
  arm(0, ab, 6);
  // head
  const hx = 2, hy = sh - 18 + (o.nod || 0) * 4;
  X.save(); X.translate(hx, hy); X.rotate(o.tilt || 0);
  ball(0, 0, 13, id + 12, PAT.f, 1.6);
  shape([[11, -4], [17, 3], [11, 4]], { lw: 1.1, id: id + 13, fill: PAPER2 });           // nose
  if (o.closed) line([3, -3], [9, -2], 1.3, id + 14, 0.05); else { X.beginPath(); X.arc(6 + (o.look || 0), -3 + (o.lookY || 0), 1.6, 0, 6.283); X.fillStyle = P.ink; X.fill(); }
  const mo = o.mouth || 0; if (mo > 0.05) { X.beginPath(); X.ellipse(8, 8, 2.4, 1 + mo * 2.6, 0, 0, 6.283); X.fillStyle = P.ink; X.fill(); } else line([5, 8], [10, 7.5], 1, id + 15, 0.05);
  X.beginPath(); X.arc(-3, 1, 3.2, -1.2, 1.6); X.lineWidth = 1; X.strokeStyle = P.ink; X.stroke();      // ear
  if (o.beard || k === 'astro') { const bl = o.beard ?? 1; shape([[-6, 4], [12, 8], [10 + bl * 3, 14 + bl * 14], [0, 10 + bl * 22], [-8, 10]], { lw: 1.1, id: id + 16, fill: PAPER2, h: [1.2, 2, 0.5] }); }
  if (o.specs || k === 'phil' || k === 'astro') { X.beginPath(); X.arc(7, -3, 3.6, 0, 6.283); X.lineWidth = 1; X.strokeStyle = P.ink; X.stroke(); line([3.4, -3], [-2, -4], 0.8, id + 17, 0.05); }
  const hat = o.hat ?? { critic: 'top', official: 'bowler', man: 'bowler', astro: 'cap', woman: 'bun', mother: 'bun', girl: 'bob', boy: 'none', phil: 'none', builder: 'cap2', arch: 'none' }[k];
  if (hat === 'top') { shape(R(-12, -34, 23, 24), { lw: 1.3, id: id + 18, fill: P.ink }); shape(R(-17, -12, 33, 3.5), { lw: 1, id: id + 19, fill: P.ink }); }
  else if (hat === 'bowler') { X.beginPath(); X.arc(0, -8, 12, Math.PI, 0); X.fillStyle = P.ink; X.fill(); shape(R(-16, -9, 32, 3), { lw: 0.8, id: id + 19, fill: P.ink }); }
  else if (hat === 'cap') { X.beginPath(); X.arc(0, -6, 13.5, Math.PI * 1.05, Math.PI * 1.95); X.closePath(); X.fillStyle = P.ink; X.fill(); }
  else if (hat === 'cap2') { X.beginPath(); X.arc(0, -6, 13.5, Math.PI, 0); X.closePath(); X.fillStyle = PAPER2; X.fill(); X.lineWidth = 1.2; X.stroke(); shape(R(4, -8, 16, 3), { lw: 0.8, id: id + 19, fill: P.ink }); }
  else if (hat === 'bun') { X.beginPath(); X.arc(0, -3, 13.5, Math.PI * 0.95, Math.PI * 1.9); X.lineWidth = 3; X.strokeStyle = '#8a8274'; X.stroke(); ball(-12, -10, 6, id + 20, PAT.f, 1.1, '#cfc6b2'); }
  else if (hat === 'bob') { X.beginPath(); X.arc(0, -2, 14, Math.PI * 0.8, Math.PI * 1.95); X.lineWidth = 4; X.strokeStyle = P.ink; X.stroke(); }
  else if (k === 'phil') { X.beginPath(); X.arc(-2, 0, 13.6, Math.PI * 0.6, Math.PI * 1.05); X.lineWidth = 2.4; X.strokeStyle = '#8a8274'; X.stroke(); }
  X.restore();
  // front arm and props
  const hand = arm(1, af, 6.5);
  if (o.prop) o.prop(hand);
  X.restore();
}
/* hold props: they draw in the person's local space at the hand */
const PROP = {
  notebook: (open = 0, text = null) => ([hx, hy]) => { X.save(); X.translate(hx + 2, hy - 8); X.rotate(-0.12); shape(R(-2, -20, 30, 30), { lw: 1, id: 9701, fill: '#fbf6e6' }); line([-2, -20], [-2, 10], 2, 9706, 0.1);
    if (open) { if (text) text.forEach((w, i) => { const q = clamp(open * text.length - i); if (q > 0) tx(w.slice(0, Math.ceil(w.length * q)), 1, -12 + i * 6.4, `italic 5.4px ${FONT}`); });
      else for (let i = 0; i < 4; i++) line([1, -13 + i * 6], [1 + 22 * Math.min(1, open * 4 - i), -13 + i * 6], 0.6, 9702 + i, 0.1); } X.restore(); },
  telescope: (ang = -0.5) => ([hx, hy]) => { X.save(); X.translate(hx, hy); X.rotate(ang); shape([[-26, -4], [40, -6.5], [40, 6.5], [-26, 4]], { lw: 1.2, id: 9710, fill: PAPER2, h: [1.57, 3, 0.5] }); shape(R(40, -8, 12, 16), { lw: 1.2, id: 9711, fill: P.ink }); X.restore(); },
  cane: () => ([hx, hy]) => { line([hx, hy], [hx + 8, 0], 2.4, 9720, 0.2); },
  case_: () => ([hx, hy]) => { shape(R(hx - 16, hy, 34, 24), { lw: 1.2, id: 9730, fill: PAPER2, h: [0.3, 3, 0.5] }); line([hx - 4, hy], [hx + 6, hy], 2, 9731, 0.1); },
  pointer: () => ([hx, hy]) => { line([hx, hy], [hx + 46, hy - 40], 1.6, 9740, 0.1); },
  trowel: () => ([hx, hy]) => { line([hx, hy], [hx + 10, hy - 4], 2.4, 9750, 0.1); shape([[hx + 10, hy - 8], [hx + 30, hy - 4], [hx + 10, hy + 2]], { lw: 1, id: 9751, fill: PAPER2 }); },
  tsquare: () => ([hx, hy]) => { line([hx - 6, hy - 30], [hx - 6, hy + 30], 2.4, 9760, 0.1); line([hx - 14, hy - 30], [hx + 2, hy - 30], 3, 9761, 0.1); },
};

/* ================= the Edifier ================= */
/* a tall cabinet: funnel on top, a dial, a paper slot, a brass keyboard at chest height, drawers. base at (x, y).
   o.paper: text on the sheet that rises from the slot; o.n: characters typed; o.up 0..1 sheet rise; o.key: key pressed;
   o.say: voice level (the dial needle) */
function edifier(x, y, s, o = {}) {
  if (SILENT) return;
  X.save(); X.translate(x, y); X.scale(s, s);
  const id = o.id || 9800;
  for (const k of [-1, 1]) shape(R(k * 44 - 7, -10, 14, 10), { lw: 1.2, id: id + 1 + k, fill: P.ink });
  shape(R(-56, -262, 112, 252), { lw: 2, id: id + 3, fill: '#e2d6b8', h: [Math.PI / 2 + 0.03, 5, 0.45], sh: R(26, -262, 30, 252), sh2: [Math.PI / 2, 2, 0.8] });
  shape(R(-62, -276, 124, 14), { lw: 1.6, id: id + 4, fill: PAPER2, h: [0.1, 2.6, 0.5] });
  shape([[-42, -330], [42, -330], [10, -282], [-10, -282]], { lw: 1.6, id: id + 5, fill: PAPER2, h: [[-1.1, 3, 0.5]], sh: [[12, -332], [44, -332], [10, -280], [6, -280]], sh2: [1.2, 1.8, 0.8] });
  X.beginPath(); X.ellipse(0, -330, 42, 7, 0, 0, 6.283); X.fillStyle = P.ink; X.fill();
  shape(R(-8, -284, 16, 10), { lw: 1.2, id: id + 6, fill: PAPER2 });
  // dial with a needle that moves with the voice
  X.beginPath(); X.arc(0, -232, 17, 0, 6.283); X.fillStyle = PAPER2; X.fill(); X.lineWidth = 1.6; X.strokeStyle = P.ink; X.stroke();
  for (let i = 0; i <= 8; i++) { const a = Math.PI * (1.15 + 0.7 * i / 8); line([Math.cos(a) * 12, -232 + Math.sin(a) * 12], [Math.cos(a) * 16, -232 + Math.sin(a) * 16], 0.8, id + 10 + i, 0.02); }
  const na = Math.PI * (1.2 + 0.6 * clamp(o.say || 0) + 0.02 * Math.sin(GT * 9)); line([0, -232], [Math.cos(na) * 14, -232 + Math.sin(na) * 14], 1.4, id + 20, 0.02, RED);
  // paper slot and the sheet
  shape(R(-40, -196, 80, 6), { lw: 1.2, id: id + 21, fill: P.ink });
  const up = o.up || 0;
  if (up > 0) {
    const ph = 22 + 50 * up; shape(R(-34, -194 - ph, 68, ph), { lw: 1.1, id: id + 22, fill: '#fbf6e6', amp: 0.15 });
    if (o.paper) { const n = o.n ?? 1e9, ls = wrap(o.paper, 58, MONO(7)); let left = n; ls.forEach((l, i) => { if (left <= 0) return; tx(l.slice(0, left), -29, -194 - ph + 12 + i * 9, MONO(7), { alpha: o.paperAlpha ?? 1 }); left -= l.length + 1; }); }
  }
  // keyboard: sloped brass plate with three rows of round keys
  shape([[-60, -176], [60, -176], [76, -150], [-76, -150]], { lw: 1.6, id: id + 23, fill: '#e8d9b0', h: [0.05, 3.2, 0.4] });
  shape([[-76, -150], [76, -150], [76, -144], [-76, -144]], { lw: 1.2, id: id + 24, fill: P.ink });
  for (let r = 0; r < 3; r++) for (let c = 0; c < 10 - (r === 2 ? 1 : 0); c++) {
    const kx = -54 + c * 12 + r * 4 + (r === 2 ? 6 : 0), ky = -170 + r * 7.6, down = o.key === r * 10 + c;
    X.beginPath(); X.ellipse(kx, ky + (down ? 1.4 : 0), 4.4, 2.8, 0, 0, 6.283); X.fillStyle = down ? P.ink : PAPER2; X.fill(); X.lineWidth = 0.9; X.strokeStyle = P.ink; X.stroke();
  }
  // drawers
  for (let i = 0; i < 3; i++) { const dy = -134 + i * 40; shape(R(-46, dy, 92, 32), { lw: 1.3, id: id + 30 + i, fill: PAPER2 }); shape(R(-10, dy + 13, 20, 6), { lw: 1, id: id + 35 + i, fill: '#e8d9b0' }); }
  // the cabinet carries its own plate: it too was described
  if (o.plate !== false) brass(0, -269, 'An Edifier.', 4.2);
  X.restore();
}
const EDIFIER_SLOT = (x, y, s) => [x, y - 200 * s];

/* the signature: the typed sentence leaves the sheet, falls onto the plot, and its letters land as a row of bricks.
   from = [x, y] on the sheet, plot = [x0, x1, gy]; at..to over which the n words leave; each flight lasts FL s */
const FL = 0.9;
function wordLand(c, k) { const n = c.n || 1, gap = n > 1 ? (c.to - c.at - FL) / (n - 1) : 0; return c.at + k * gap + FL; }
function fallLetters(lt, c, s, from, plot, o = {}) {
  if (!c || lt < c.at) return false;
  const words = s.split(' '), n = words.length, sz = o.sz || 13, x0 = plot[0], x1 = plot[1], gy = plot[2];
  const chars = []; let ci = 0;
  words.forEach((w, k) => { for (const ch of w) chars.push({ ch, k, i: ci++ }); ci++; });
  const total = ci - 1, gone = o.gone ?? 1e9;
  for (const q of chars) {
    if (q.i >= gone) continue;
    const tl = wordLand({ ...c, n }, q.k) - FL, u = clamp((lt - tl) / FL);
    if (lt < tl) continue;
    const sx = from[0] + (q.i - total / 2) * sz * 0.38, sy = from[1];
    const wl = words[q.k].length, j = q.i - chars.find((z) => z.k === q.k).i, cxp = (x0 + x1) / 2 + (q.k % 2 ? sz * 0.39 : 0), tx_ = cxp + (j - (wl - 1) / 2) * sz * 0.78, ty = gy - 3 - q.k * sz * 0.8;
    const e = u * u, x = lerp(sx, tx_, E.out(u)), y = lerp(sy, ty, e) - Math.sin(Math.PI * u) * (o.arc ?? 60) * (1 - u);
    const r = (1 - u) * (hash(q.i, 3) - 0.5) * 6;
    X.save(); X.translate(x, y); X.rotate(r);
    if (u >= 1) { shape(R(-sz * 0.38, -sz * 0.78, sz * 0.76, sz * 0.78), { lw: 0.8, id: 9900 + q.i, fill: PAPER2, amp: 0.1 }); }
    tx(q.ch, 0, 0, MONO(u >= 1 ? sz * 0.8 : sz, true), { align: 'center', alpha: o.alpha ?? 1 });
    X.restore();
  }
  return true;
}
/* trees: a trunk and a canopy of leaf marks; leaves 0..1 */
function tree(x, y, s, id, leaves = 1) {
  X.save(); X.translate(x, y); X.scale(s, s);
  ink([[0, 0], [-2, -60], [4, -110]], 7, id, 0.4); ink([[-2, -60], [-30, -110]], 4, id + 1, 0.4); ink([[2, -84], [34, -124]], 3.6, id + 2, 0.4); ink([[4, -110], [-6, -150]], 3, id + 3, 0.4);
  const n = Math.floor(80 * leaves);
  for (let i = 0; i < 80; i++) {
    const a = hash(id, i) * 6.283, r = 58 * Math.sqrt(hash(id + 1, i)), lx = Math.cos(a) * r, ly = -118 + Math.sin(a) * r * 0.75;
    if (i < n) { X.beginPath(); X.ellipse(lx, ly, 6, 3.4, a, 0, 6.283); X.fillStyle = hash(id + 2, i) > 0.5 ? P.ink : PAPER2; X.fill(); X.lineWidth = 0.8; X.strokeStyle = P.ink; X.stroke(); }
  }
  X.restore();
}
/* chalk numerals beside a window */
function chalkNum(x, y, n, al = 1, red = false) { tx(String(n), x, y, `italic 600 ${16}px ${FONT}`, { align: 'center', col: red ? RED : '#3b352d', alpha: al }); }

/* ================= the plates (scenes) ================= */
/* each scene draws in a 1280x720 world with its own camera; sh and lt are the shot's */

/* ---- Fig. 1: the City of Described Houses, and its critics ---- */
const CITY = [
  { x: 60, w: 170, h: 262, floors: 3, cols: 3, cornice: 'big', roof: 'flat', door: { w: 28 }, plate: 'A tall house with a tasteful cornice.', id: 100, s: 'A tall house with a tasteful cornice.' },
  { x: 280, w: 214, h: 176, floors: 2, cols: 4, roof: 'gable', rh: 70, chimney: [0.22, 0.78], door: { w: 30 }, plate: 'A symmetrical villa of two storeys.', id: 200, s: 'A symmetrical villa of two storeys.' },
  { x: 556, w: 44, h: 300, floors: 6, cols: 1, roof: 'gable', rh: 60, ww: 14, depth: 14, plate: 'A narrow house. Very narrow.', py: 36, id: 300, s: 'A narrow house. Very narrow.' },
  { x: 650, w: 110, h: 118, floors: 1, cols: 2, roof: 'gable', rh: 46, door: { w: 54, h: 96 }, ww: 0.1, plate: 'A house with a magnificent front door.', py: 112, px: 705, id: 400, s: 'A house with a magnificent front door.' },
  { x: 808, w: 200, h: 196, floors: 1, cols: 3, roof: 'pediment', columns: 4, door: { w: 30, h: 70 }, plate: 'A house in the classical manner.', id: 500, s: 'A house in the classical manner.' },
  { x: 1052, w: 152, h: 160, floors: 3, cols: 5, roof: 'gable', rh: 54, ww: 14, wh: 24, plate: 'A house of many windows.', id: 600, s: 'A house of many windows.' },
];
function cityRow(o = {}) {
  // a far row of described houses, drawn small and pale
  X.save(); X.globalAlpha = 0.45;
  for (let i = 0; i < 16; i++) { const x = -40 + i * 86 + hash(i, 2) * 20, w = 50 + hash(i, 3) * 40, h = 60 + hash(i, 4) * 90; house({ x, w, h, gy: GY - 70, floors: 1 + (h > 100), cols: 2, roof: hash(i, 5) > 0.5 ? 'gable' : 'flat', rh: w * 0.4, id: 1000 + i * 90, text: false, base: false }); }
  X.restore();
}
function sceneCity(sh, lt) {
  const L = sh.lines, wk = cue(sh, 'walk'), yr = cue(sh, 'years'), nt = cue(sh, 'note'), pl = cue(sh, 'plate');
  const narrow = CITY[2], nx = narrow.x + narrow.w / 2;
  const cxN = (t) => { const a = U(t, wk.at, nt.at - 0.6), b = U(t, nt.to + 0.3, nt.to + 14); return a < 1 ? lerp(-140, 360, a) : lerp(360, 1500, b); };
  const cx = cxN(lt), walking = !(lt > nt.at - 0.6 && lt < nt.to + 0.3) && lt > wk.at;
  let c = camFor(lt, [[0, ON(640, 360, 1)], [wk.at + 2.5, ON(520, 430, 1.22), 6], [nt.at - 0.4, ON(cx + 40, 556, 4.6), 1.4], [nt.to, ON(640, 380, 1.05), 1.4], [pl.at - 0.2, ON(nx, GY - 30, 4.6), 1.6], [pl.to, ON(nx, GY - 160, 1.6), 1.8], [sh.d - 4.2, ON(640, 360, 1), 1.6]]);
  cam(c, () => {
    sky(GY - 60); cityRow(); groundBand(GY);
    shape(R(-200, GY + 2, 1700, 30), { lw: 1, id: 1500, fill: PAPER2, h: [0.05, 4, 0.4] });
    for (const hs of CITY) house(hs);
    const yu = yr ? U(lt, yr.at, yr.to) : 0, leaves = 0.55 + 0.45 * Math.cos(2 * Math.PI * 11 * yu);
    tree(1190, GY + 76, 1.25, 1600, leaves);
    // fallen leaves gather under the tree, a little more each year
    for (let i = 0; i < Math.floor(60 * yu); i++) { X.beginPath(); X.ellipse(1120 + hash(i, 61) * 150, GY + 66 + hash(i, 62) * 14, 5, 2.2, hash(i, 63), 0, 6.283); X.fillStyle = hash(i, 64) > 0.5 ? P.ink : PAPER2; X.fill(); X.lineWidth = 0.6; X.strokeStyle = P.ink; X.stroke(); }
    // three critics, top hats and notebooks; over eleven years their beards grow
    const beard = 0.05 + 1.5 * yu, writing = lt > nt.at && lt < nt.to;
    for (let k = 2; k >= 0; k--) {
      const x = cx - k * 64, ph = lt * 6.5 + k * 1.3;
      person({ x, y: GY + 72, s: 0.62, f: 1, kind: 'critic', id: 1700 + k * 60, walk: walking ? 1 : 0, ph, beard, look: writing ? 0.5 : 0, lookY: writing ? 1.6 : 0,
        armF: writing || (k === 0 && lt > nt.to && lt < nt.to + 0.4) ? [0.9, 1.6] : undefined, prop: PROP.notebook(lt > nt.at ? U(lt, nt.at + 0.3, nt.to - 0.3) : 0, k === 0 ? ['Faultless.', 'Symmetrical.', 'Faithful to', 'the sentence.'] : null) });
    }
  });
}

/* ---- Fig. 2: the Edifier, the philosopher's dwelling, the prize ---- */
const PHIL = { x: 600, w: 330, h: 172, roof: 'pediment', columns: 4, floors: 1, cols: 3, ww: 22, wh: 54, door: { w: 34, h: 84 }, plate: 'A modest dwelling, suitable for a philosopher.', psz: 4.6, py: 40, pdx: 18, id: 2000, s: 'a modest dwelling suitable for a philosopher' };
const EDX = 330;
function stakes(x0, x1, gy, id) { for (const x of [x0, x1]) { line([x, gy + 4], [x, gy - 26], 2.2, id + x, 0.1); } ink([[x0, gy - 22], [x1, gy - 22]], 0.7, id + 3, 1.2); }
function absentRoom(x, y, w, h, label, al, id) {
  if (al <= 0) return; X.save(); X.globalAlpha = al; X.setLineDash([6, 5]); X.lineWidth = 1.3; X.strokeStyle = RED; X.strokeRect(x, y, w, h); X.setLineDash([]);
  tx(label, x + w / 2, y + h / 2 + 4, FONTI(13), { align: 'center', col: RED, alpha: al }); X.restore();
}
function sceneDwelling(sh, lt, o = {}) {
  const L = sh.lines, ty = cue(sh, 'type'), fa = cue(sh, 'fall'), ri = cue(sh, 'rise'), md = cue(sh, 'medal'), ins = cue(sh, 'inside'), pr = cue(sh, 'proof'), sl = cue(sh, 'sleep');
  const S = 'A modest dwelling, suitable for a philosopher.', es = 1.15;
  const typed = Math.floor(S.length * U(lt, ty.at + 0.2, ty.to - 0.1)), up = U(lt, ty.at, ty.to);
  const hu = U(lt, ri.at, ri.to), iu = U(lt, ins.at, ins.to);
  const L2 = L[2], wkit = lineAt(L2, L2.say.indexOf('kitchen') / L2.say.length), wbed = lineAt(L2, L2.say.indexOf('bedroom') / L2.say.length), wlav = lineAt(L2, L2.say.indexOf('lavatory') / L2.say.length);
  const phX = 740, phY = GY - 9;
  let c = camFor(lt, [[0, ON(640, 380, 1)], [ty.at - 0.8, ON(EDX + 40, 330, 1.75), 1.2], [fa.at - 0.3, ON(630, 420, 1.55), 1.0], [ri.at + 0.4, ON(720, 430, 1.25), 2.0], [md.at - 0.3, ON(765, 360, 1.55), 1.2], [ins.at, ON(765, 460, 1.9), 1.4], [wbed - 0.6, ON(780, 450, 1.25), 1.2], [pr.at - 0.6, ON(520, 440, 1.6), 1.0], [sl.at, ON(phX + 30, GY - 70, 2.5), 1.6], [sh.d - 4.0, ON(640, 380, 1), 1.6]]);
  c = withTight(sh, lt, c, 520, 418, 2.6);
  cam(c, () => {
    sky(GY - 40); groundBand(GY);
    stakes(600, 930, GY, 2100);
    const ky = typed > 0 && lt < ty.to ? Math.floor(hash(typed, 7) * 29) : -1;
    edifier(EDX, GY, es, { paper: S, n: typed, up: lt > ty.at ? Math.max(up, 0.2) : 0, key: ky, say: sayAt(sh, 'D', lt), paperAlpha: 1 - U(lt, fa.at, fa.at + 0.8) });
    // the signature: the words fall onto the plot and land as the first course
    if (lt >= fa.at && hu < 0.4) { X.save(); X.globalAlpha = 1 - U(lt, ri.at + 0.2, ri.at + 1.0); fallLetters(lt, fa, S, [EDX, GY - 262 * es], [610, 920, GY], { sz: 20, arc: 140 }); X.restore(); }
    absentRoom(470, GY - 120, 128, 120, 'kitchen', U(lt, wkit - 0.1, wkit + 0.4) * (1 - 0.6 * U(lt, pr.at - 0.6, pr.at)), 2200);
    absentRoom(932, GY - 130, 132, 130, 'bedroom', U(lt, wbed - 0.1, wbed + 0.4), 2201);
    absentRoom(1066, GY - 86, 70, 86, 'lavatory', U(lt, wlav - 0.1, wlav + 0.4), 2202);
    if (hu > 0) house({ ...PHIL, u: hu });
    // the cutaway: the front wall lifts to show the one room
    if (iu > 0) {
      X.save(); X.globalAlpha = iu; const x0 = PHIL.x + 2, y0 = GY - PHIL.h + 2, w = PHIL.w - 4, h = PHIL.h - 11;
      shape(R(x0, y0, w, h), { lw: 1.2, id: 2300, fill: PAPER2 });
      X.save(); path(R(x0, y0, w, h)); X.clip(); for (let i = 0; i < 40; i++) for (let j = 0; j < 12; j++) { X.fillStyle = P.ink; X.globalAlpha = iu * 0.35; X.fillRect(x0 + i * 9 + (j % 2) * 4.5, y0 + j * 14, 1.4, 1.4); } X.restore(); X.globalAlpha = iu;
      line([x0, GY - 9], [x0 + w, GY - 9], 1.6, 2301, 0.2);
      // window, desk, candle, books, the chair
      win(PHIL.x + 210, GY - 140, 40, 60, 2310, { lit: true });
      shape(R(780, GY - 64, 96, 6), { lw: 1.2, id: 2320, fill: PAPER2, h: [0.1, 2, 0.5] }); line([786, GY - 58], [786, GY - 10], 2.4, 2321, 0.1); line([870, GY - 58], [870, GY - 10], 2.4, 2322, 0.1);
      const cu = sl ? U(lt, sl.at + 1.5, sl.to) : 0, ch = 18 * (1 - 0.8 * cu);
      shape(R(846, GY - 64 - ch, 6, ch), { lw: 0.9, id: 2323, fill: PAPER2 });
      if (cu < 0.98) { X.beginPath(); X.ellipse(849, GY - 68 - ch, 2.4, 5, 0, 0, 6.283); X.fillStyle = '#fbf4dc'; X.fill(); X.lineWidth = 0.8; X.strokeStyle = P.ink; X.stroke(); }
      else { const sm = []; for (let i = 0; i < 9; i++) sm.push([849 + Math.sin(i * 0.9 + lt * 3) * 3, GY - 68 - ch - i * 4]); X.globalAlpha = iu * 0.6; ink(sm, 0.7, 2324, 0.2); X.globalAlpha = iu; }
      for (let i = 0; i < 4; i++) shape(R(800 + i * 7, GY - 76, 6, 12), { lw: 0.7, id: 2330 + i, fill: i % 2 ? P.ink : PAPER2 });
      shape(R(718, GY - 84, 6, 74), { lw: 1, id: 2340, fill: P.ink }); shape(R(718, GY - 58, 40, 6), { lw: 1, id: 2341, fill: PAPER2 }); line([754, GY - 52], [754, GY - 10], 2.2, 2342, 0.1);
      const asleep = sl && lt > sl.at + 0.6, writing = !asleep && iu > 0.5;
      person({ x: phX, y: phY, s: 0.5, f: 1, kind: 'phil', sit: true, id: 2400, closed: asleep, nod: asleep ? 1.4 + 0.4 * Math.sin(lt * 1.3) : 0, tilt: asleep ? 0.22 : 0.08, armF: writing ? [1.1 + 0.08 * Math.sin(lt * 9), 1.7] : [0.6, 0.9], armB: [0.4, 0.8] });
      X.restore();
    }
    // the prize: a rosette lowered onto the pediment
    if (md && lt > md.at) {
      const u = E.out(U(lt, md.at, md.at + 1.4)), mx = 765, my = lerp(80, GY - PHIL.h - 30, u);
      if (u < 1) line([mx, -50], [mx, my - 22], 0.7, 2500, 0.1);
      for (const k of [-1, 1]) shape([[mx + k * 4, my + 10], [mx + k * 16, my + 46], [mx + k * 8, my + 40], [mx + k * 2, my + 48]], { lw: 1, id: 2501 + k, fill: RED === 0 ? 0 : PAPER2, h: [1.2, 2, 0.6] });
      for (let i = 0; i < 16; i++) { const a = i / 16 * 6.283; shape([[mx, my], [mx + Math.cos(a) * 21, my + Math.sin(a) * 21], [mx + Math.cos(a + 0.4) * 21, my + Math.sin(a + 0.4) * 21]], { lw: 0.7, id: 2510 + i, fill: i % 2 ? PAPER2 : '#d9cfb4' }); }
      ball(mx, my, 11, 2530, PAT.f, 1.2, '#e8d9b0'); tx('PRIZE', mx, my + 2, MONO(4.4, true), { align: 'center' });
    }
    // the architect's demonstration, chalked on a board
    if (pr && lt > pr.at - 0.8) {
      const u = U(lt, pr.at - 0.8, pr.at); X.save(); X.globalAlpha = u;
      X.translate(50, 0); line([430, GY - 4], [452, GY - 128], 2.4, 2600, 0.1); line([534, GY - 4], [512, GY - 128], 2.4, 2601, 0.1); line([482, GY - 4], [482, GY - 128], 2, 2602, 0.1);
      shape(R(420, GY - 150, 124, 84), { lw: 1.6, id: 2603, fill: DARK });
      const ln = ['Philosophy requires thought.', 'Thought requires no kitchen.', 'Q.E.D.'], q = U(lt, pr.at, pr.to - 0.6);
      ln.forEach((s, i) => { const k = clamp(q * 3 - i); if (k > 0) tx(s.slice(0, Math.ceil(s.length * k)), 428, GY - 130 + i * 15, `italic ${9.6}px ${FONT}`, { col: P.paper }); });
      person({ x: 388, y: GY + 6, s: 0.62, f: 1, kind: 'arch', hat: 'bowler', id: 2650, armF: [1.7, 2.3], prop: PROP.pointer(), mouth: 0 });
      X.restore();
    }
  });
}

/* ---- Figs. 3 and 4: the astronomer's twelve windows, outside and in ---- */
const ASTRO = { x: 300, w: 640, h: 330, floors: 3, cols: 4, roof: 'gable', rh: 120, dome: true, door: { w: 40, h: 80 }, ww: 40, wh: 58, redWin: 11, plate: 'A house of twelve windows, for an astronomer.', psz: 5, py: 30, pdx: 30, id: 3000, s: 'a house of twelve windows for an astronomer' };
let ASTRO_WINS = null;
function astroWins() { if (!ASTRO_WINS) { SILENT = true; ASTRO_WINS = house(ASTRO); SILENT = false; } return ASTRO_WINS; }
const countT = (c, i, n) => c.at + (c.to - c.at) * (i + 0.5) / n;
function sceneAstroOut(sh, lt) {
  const wk = cue(sh, 'walk'), c0 = cues(sh, 'count')[0], ws = astroWins();
  let i0 = -1; for (let i = 0; i < 12; i++) if (lt >= countT(c0, i, 12)) i0 = i;
  const ax = lerp(-80, 196, E.io(U(lt, wk.at, wk.to)));
  const plan = [[0, ON(640, 360, 1.0)]];
  for (let i = 0; i < 12; i++) { const r = ws[i]; plan.push([countT(c0, i, 12) - 0.25, ON(lerp(r[0] + r[2] / 2, 640, 0.35), r[1] + r[3] / 2 + 40, 1.45), 0.3]); }
  plan.push([c0.to + 0.2, ON(640, 330, 1.0), 1.0]);
  const c = camFor(lt, plan);
  cam(c, () => {
    sky(GY - 20); groundBand(GY);
    house(ASTRO);
    // the other tenants pass along the street with their luggage
    const pu = U(lt, wk.at - 1.0, wk.at + 9);
    if (pu > 0 && pu < 1) { const bx = lerp(-200, 1500, pu);
      ['man', 'mother', 'boy', 'girl', 'boy'].forEach((k, j) => person({ x: bx - j * 52, y: GY + 60, s: j > 1 ? 0.42 : 0.6, kind: k, id: 3100 + j * 40, walk: 1, ph: lt * 7 + j, prop: j === 0 ? PROP.case_() : undefined }));
      person({ x: bx - 330, y: GY + 60, s: 0.56, kind: 'woman', id: 3400, walk: 0.6, ph: lt * 5, prop: PROP.cane() }); }
    for (let i = 0; i <= i0; i++) { const r = ws[i]; chalkNum(r[0] - 12, r[1] + 10, i + 1, U(lt, countT(c0, i, 12), countT(c0, i, 12) + 0.25), i === 11); }
    const tg = i0 >= 0 && lt < c0.to + 0.6 ? ws[Math.min(11, i0 + (lt > countT(c0, Math.min(11, i0), 12) + 0.15 && i0 < 11 ? 1 : 0))] : null;
    const ang = tg ? Math.atan2(tg[1] + tg[3] / 2 - (GY - 110), tg[0] - ax) : -0.4;
    person({ x: ax, y: GY + 22, s: 0.72, kind: 'astro', id: 3500, walk: lt < wk.to ? 1 : 0, ph: lt * 6.5, armF: lt > wk.to ? [1.9, 2.4 + ang * 0.3] : undefined, prop: lt > wk.to ? PROP.telescope(ang) : PROP.case_(), look: 0.5, lookY: lt > wk.to ? -1.2 : 0 });
  });
}
function sceneAstroIn(sh, lt) {
  const c1 = cues(sh, 'count')[1], ws = astroWins(), L = sh.lines;
  const mir = (r) => [1240 - r[0] - r[2], r[1], r[2], r[3]];
  let i1 = -1; for (let i = 0; i < 12; i++) if (lt >= countT(c1, i, 12)) i1 = i;
  const plan = [[0, ON(640, 360, 1.0)]];
  for (let i = 0; i < 12; i++) { const r = mir(ws[i]); plan.push([countT(c1, i, 12) - 0.25, ON(lerp(r[0] + r[2] / 2, 640, 0.35), r[1] + r[3] / 2 + 40, 1.4), 0.3]); }
  let c = camFor(lt, plan);
  const blank = mir(ws[11]);
  c = withTight(sh, lt, c, blank[0] - 30, blank[1] + 90, 2.3);
  cam(c, () => {
    X.fillStyle = PAPER2; X.fillRect(-400, -200, 2100, 1200);
    // wallpaper: a small repeated sprig, the same everywhere, including where the twelfth window should be
    X.fillStyle = P.ink; for (let y = 60; y < GY; y += 22) for (let x = 200; x < 1080; x += 22) { const ox = (Math.floor(y / 22) % 2) * 11; X.globalAlpha = 0.5; X.fillRect(x + ox, y, 1.6, 5); X.fillRect(x + ox - 2.4, y + 2, 5.6, 1.4); } X.globalAlpha = 1;
    for (const xx of [200, 1080]) shape(R(xx - 40, 0, 40, GY + 10), { lw: 1.4, id: 3600 + xx, fill: PAPER2, h: [Math.PI / 2, 2.2, 0.7] });
    shape(R(160, 0, 960, 54), { lw: 1.4, id: 3610, fill: PAPER2, h: [0.05, 3, 0.5] });
    // the galleries
    for (const fy of [GY - 110, GY - 220]) { shape(R(200, fy - 4, 840, 8), { lw: 1.4, id: 3620 + fy, fill: PAPER2, h: [0, 2, 0.6] }); for (let x = 210; x < 1040; x += 18) line([x, fy - 4], [x, fy - 26], 0.9, 3630 + x, 0.1); line([200, fy - 26], [1040, fy - 26], 1.6, 3640 + fy, 0.2); }
    for (let i = 0; i < 11; i++) { const r = mir(ws[i]); win(r[0], r[1], r[2], r[3], 3700 + i * 5, { lit: true }); }
    line([200, GY], [1080, GY], 2, 3690, 0.3); X.fillStyle = P.ink; for (let y = GY + 4, k = 0; y < 900; y += 4 + k * 0.6, k++) X.fillRect(160, y, 960, 0.6 + k * 0.04);
    for (let i = 0; i <= Math.min(10, i1); i++) { const r = mir(ws[i]); chalkNum(r[0] + r[2] + 12, r[1] + 10, i + 1, U(lt, countT(c1, i, 12), countT(c1, i, 12) + 0.25)); }
    const tgI = Math.min(11, Math.max(0, i1)), tg = mir(ws[tgI]);
    const ax = 300, ang = Math.atan2(tg[1] + tg[3] / 2 - (GY - 120), tg[0] + tg[2] / 2 - ax);
    const atBlank = i1 >= 11, tap = atBlank ? Math.sin(lt * 9) * 0.03 * (1 - U(lt, L[2].t0, L[2].t1)) : 0;
    person({ x: ax, y: GY + 4, s: 0.82, kind: 'astro', id: 3800, f: 1, armF: [1.9, 2.4 + ang * 0.3], prop: lt > c1.at - 0.5 ? PROP.telescope(ang + tap) : PROP.case_(), lookY: -2, look: 0.5 });
  });
}

/* ---- Figs. 5 and 6: the dining room, the staircase ---- */
function sceneDining(sh, lt) {
  const ml = cue(sh, 'meal');
  const sq = ml ? E.io(U(lt, ml.at, ml.to - 1.2)) * (1 - E.io(U(lt, ml.to - 0.6, ml.to + 0.8))) : 0, mu = ml ? U(lt, ml.at, ml.to) : 0;
  const Lw = lerp(250, 470, sq), Rw = lerp(1030, 810, sq), k = (Rw - Lw) / 780, X0 = (Lw + Rw) / 2;
  const sx = (x) => X0 + (x - 640) * k;
  const c = camFor(lt, [[0, ON(640, 400, 1.3)], [ml.at + 0.6, ON(640, 420, 1.65), 2.0], [ml.to - 0.4, ON(640, 400, 1.3), 1.4]]);
  cam(c, () => {
    X.fillStyle = PAPER2; X.fillRect(-400, -200, 2100, 1200);
    for (let x = Lw + 10; x < Rw; x += 16) { X.fillStyle = P.ink; X.globalAlpha = 0.28; X.fillRect(x, 120, 0.8, GY - 120); } X.globalAlpha = 1;
    shape(R(Lw - 400, -200, 400, 1100), { lw: 2, id: 4000, fill: P.paper, h: [[0.9, 3, 0.6], [-0.9, 3, 0.4]] });
    shape(R(Rw, -200, 400, 1100), { lw: 2, id: 4001, fill: P.paper, h: [[0.9, 3, 0.6], [-0.9, 3, 0.4]] });
    shape(R(Lw, 90, Rw - Lw, 30), { lw: 1.4, id: 4002, fill: PAPER2, h: [0.05, 3, 0.5] });
    line([Lw, GY], [Rw, GY], 2, 4003, 0.2); X.fillStyle = P.ink; for (let y = GY + 4, j = 0; y < 900; y += 4 + j * 0.6, j++) X.fillRect(Lw, y, Rw - Lw, 0.6);
    // the clock: an hour passes for every meal
    const cx = X0, cy = 190; X.beginPath(); X.arc(cx, cy, 30, 0, 6.283); X.fillStyle = P.paper; X.fill(); X.lineWidth = 2; X.strokeStyle = P.ink; X.stroke();
    for (let i = 0; i < 12; i++) { const a = i / 12 * 6.283; line([cx + Math.cos(a) * 24, cy + Math.sin(a) * 24], [cx + Math.cos(a) * 28, cy + Math.sin(a) * 28], 1.2, 4010 + i, 0.02); }
    const am = -Math.PI / 2 + mu * 6.283, ah = -Math.PI / 2 + 6.283 * (7 + mu) / 12;
    line([cx, cy], [cx + Math.cos(am) * 22, cy + Math.sin(am) * 22], 1.6, 4030, 0.02); line([cx, cy], [cx + Math.cos(ah) * 14, cy + Math.sin(ah) * 14], 2.6, 4031, 0.02);
    // a picture on the wall, squeezed with the wall
    shape(R(sx(380), 200, 110 * k, 80), { lw: 1.6, id: 4040, fill: PAPER2 }); shape([[sx(395), 270], [sx(440), 220], [sx(475), 270]], { lw: 1, id: 4041, h: [-0.9, 2.6, 0.5] });
    // the family at table: father and mother at the ends, three children behind
    const fam = [['boy', 520, 0.46], ['girl', 640, 0.44], ['boy', 760, 0.4]];
    fam.forEach(([kind, x, s], j) => person({ x: sx(x), y: GY - 40, s, kind, id: 4100 + j * 40, sit: true, f: j === 2 ? -1 : 1, armF: [1.5 + 0.2 * Math.sin(lt * 7 + j), 1.6], look: sq > 0.5 ? (j - 1) : 0.5, lean: sq * (j - 1) * -0.06 }));
    // table top in light perspective
    const tw = 440 * k; shape([[X0 - tw / 2, GY - 112], [X0 + tw / 2, GY - 112], [X0 + tw / 2 + 30 * k, GY - 92], [X0 - tw / 2 - 30 * k, GY - 92]], { lw: 1.6, id: 4200, fill: P.paper, h: [0.05, 3.4, 0.4] });
    shape(R(X0 - tw / 2 - 30 * k, GY - 92, tw + 60 * k, 10), { lw: 1.4, id: 4201, h: [Math.PI / 2, 2, 0.7] });
    for (const lx of [-1, 1]) line([X0 + lx * (tw / 2 + 10 * k), GY - 82], [X0 + lx * (tw / 2 + 10 * k), GY], 3.4, 4202 + lx, 0.1);
    for (let j = 0; j < 5; j++) { const px = X0 - tw / 2 + 30 * k + j * (tw - 60 * k) / 4; X.beginPath(); X.ellipse(px, GY - 104, 16 * Math.max(0.5, k), 4.6, 0, 0, 6.283); X.fillStyle = P.paper; X.fill(); X.lineWidth = 1.1; X.strokeStyle = P.ink; X.stroke(); if (sq > 0.6) { X.beginPath(); X.ellipse(px, GY - 110, 14 * k, 4, 0, 0, 6.283); X.stroke(); } }
    person({ x: sx(320), y: GY, s: 0.62, kind: 'man', hat: 'none', id: 4300, sit: true, f: 1, armF: [1.3 + 0.15 * Math.sin(lt * 8), 1.5], lean: sq * 0.12, look: sq > 0.5 ? -1 : 0.4 });
    person({ x: sx(960), y: GY, s: 0.6, kind: 'mother', id: 4340, sit: true, f: -1, armF: [1.3 + 0.15 * Math.sin(lt * 8 + 2), 1.5], lean: -sq * 0.12, look: sq > 0.5 ? 1 : 0.4 });
  });
}
/* the staircase in the conventional manner: twelve steps that the climber does not get up */
const STR = { x0: 470, gy: GY, run: 40, rise: 26, n: 12 };
function stairWorld(lt, o = {}) {
  const { x0, gy, run, rise, n } = STR, xt = x0 + run * n, yt = gy - rise * n;
  X.fillStyle = PAPER2; X.fillRect(-600, -400, 2600, 1400);
  for (let y = -300; y < gy; y += 24) for (let x = -300; x < 1600; x += 24) { X.fillStyle = P.ink; X.globalAlpha = 0.3; X.fillRect(x + (Math.floor(y / 24) % 2) * 12, y, 1.4, 1.4); } X.globalAlpha = 1;
  line([-600, gy], [x0, gy], 2, 4500, 0.3); X.fillStyle = P.ink; for (let y = gy + 4, j = 0; y < 1000; y += 4 + j * 0.6, j++) X.fillRect(-600, y, 2600, 0.6);
  // upper landing and the bedroom door
  shape(R(xt, yt, 700, 14), { lw: 1.6, id: 4510, fill: PAPER2, h: [0, 2.4, 0.6] }); shape(R(xt, yt + 14, 700, 600), { lw: 0, id: 4511, fill: PAPER2 });
  X.save(); path(R(xt, yt + 14, 700, gy - yt - 14)); X.clip(); hatch(0.6, 4, 0.5, [xt, yt, xt + 700, gy]); X.restore(); line([xt, yt + 14], [xt, gy], 1.6, 4512, 0.2);
  shape([[xt + 90, yt], [xt + 90, yt - 130], [xt + 120, yt - 148], [xt + 150, yt - 130], [xt + 150, yt]], { lw: 1.8, id: 4520, fill: PAPER2, h: [Math.PI / 2, 3, 0.6] });
  X.beginPath(); X.arc(xt + 140, yt - 64, 2.6, 0, 6.283); X.fillStyle = P.ink; X.fill(); tx('BEDROOM', xt + 120, yt - 108, MONO(6), { align: 'center' });
  // the steps; a phase slides them down under the climber
  const ph = o.phase || 0;
  X.save(); path([[x0, gy], [xt, yt], [xt, gy]]); X.lineTo(x0, gy); X.closePath(); X.restore();
  const stepPoly = (i) => { const x = x0 + i * run, y = gy - i * rise; return [[x, y], [x, y - rise], [x + run, y - rise], [x + run, gy + 40], [x, gy + 40]]; };
  X.save(); path([[x0 - 2, gy + 2], [x0 - 2, gy - rise - 2], [xt + 2, yt - 2], [xt + 2, gy + 2]]); X.clip();
  for (let i = -2; i <= n + 1; i++) {
    const f = i - ph, x = x0 + f * run, y = gy - f * rise;
    shape([[x, y], [x, y - rise], [x + run, y - rise], [x + run, gy + 40], [x, gy + 40]], { lw: 1.4, id: 4600 + ((i + 100) % 7), fill: PAPER2, h: [0.05, 3.6, 0.4] });
    line([x, y - rise], [x + run + 4, y - rise], 2.2, 4620 + ((i + 100) % 7), 0.1);
  }
  X.restore();
  // the top step, which is never reached, in red
  const tp = stepPoly(n - 1); if (o.red !== false) { line([tp[1][0], tp[1][1]], [tp[2][0] + 4, tp[2][1]], 2.4, 4630, 0.1, RED); line(tp[0], tp[1], 1.6, 4631, 0.1, RED); }
  // stringer and banister
  ink([[x0 - 6, gy], [xt, yt + 4]], 2.4, 4640, 0.3); ink([[x0 - 14, gy - 80], [xt - 10, yt - 74]], 2.4, 4641, 0.3);
  for (let i = 0; i <= n; i += 2) line([x0 + i * run - 4, gy - i * rise - 8], [x0 + i * run - 12, gy - i * rise - 78], 1.1, 4650 + i, 0.1);
  shape(R(x0 - 22, gy - 96, 14, 96), { lw: 1.4, id: 4660, h: [Math.PI / 2, 2.4, 0.6] }); ball(x0 - 15, gy - 100, 8, 4661, PAT.f, 1.2);
  // the hall at the foot: umbrella stand, coat hook, rug
  shape(R(220, gy - 64, 30, 64), { lw: 1.4, id: 4670, fill: PAPER2, h: [Math.PI / 2, 3, 0.5] }); line([228, gy - 64], [222, gy - 108], 1.6, 4671, 0.1); X.beginPath(); X.arc(219, gy - 110, 5, Math.PI, 0); X.lineWidth = 1.4; X.stroke(); line([242, gy - 64], [250, gy - 98], 1.4, 4672, 0.1);
  line([300, gy - 190], [330, gy - 190], 3, 4673, 0.1); shape([[312, gy - 188], [318, gy - 188], [334, gy - 176], [338, gy - 112], [292, gy - 112], [296, gy - 176]], { lw: 1.2, id: 4674, h: [1.2, 2.6, 0.5], fill: PAPER2 }); line([315, gy - 186], [315, gy - 112], 0.8, 4676, 0.1);
  shape([[160, gy + 2], [440, gy + 2], [460, gy + 14], [140, gy + 14]], { lw: 1, id: 4675, h: [[0.6, 3, 0.4], [-0.6, 3, 0.4]], fill: PAPER2 });
  brass(x0 - 15, gy - 30, 'A staircase, in the conventional manner.', 3.6);
}
function sceneStair(sh, lt) {
  const cl = cue(sh, 'climb'), L = sh.lines;
  const cu = cl ? U(lt, cl.at, cl.to) : 0, steps = cu * 11, climbing = cu > 0 && cu < 1;
  // she walks to the stair, then climbs and climbs; the steps slide down at the speed she climbs
  const ph = Math.max(0, steps - 3), si = Math.min(steps, 3), a0 = clamp(si);
  const fx = si < 1 ? lerp(STR.x0 - 40, STR.x0 + 0.5 * STR.run, a0) : STR.x0 + (si + 0.5) * STR.run, fy = si < 1 ? STR.gy - a0 * STR.rise : STR.gy - (si + 1) * STR.rise;
  let c = camFor(lt, [[0, ON(640, 380, 1.0)], [cl.at, ON(STR.x0 + 100, GY - 110, 1.7), 2.0], [L[2].t0 - 0.6, ON(STR.x0 + 160, GY - 150, 1.45), 1.0]]);
  c = withTight(sh, lt, c, fx + 4, fy - 90, 2.4);
  cam(c, () => {
    stairWorld(lt, { phase: ph });
    person({ x: fx, y: fy + (climbing ? -Math.abs(Math.sin(steps * Math.PI)) * 6 : 0), s: 0.62, kind: 'woman', id: 4700, walk: climbing ? 1.2 : 0, ph: steps * Math.PI * 2, prop: PROP.cane(), look: 0.5, lookY: lt > L[2].t0 ? -1.6 : -0.6, armB: climbing ? [-0.9, -1.6] : undefined });
  });
}

/* ---- Fig. 7: the Ministry of Constructive Semantics and the Interpreting Machine ---- */
function ministryFacade(x0, x1, gy, o = {}) {
  const w = x1 - x0, cx = (x0 + x1) / 2, top = gy - 330;
  for (let i = 0; i < 5; i++) shape(R(x0 - 30 + i * 8, gy - 10 * (i + 1), w + 60 - i * 16, 10), { lw: 1.2, id: 5000 + i, fill: PAPER2, h: [0.05, 2.6, 0.5] });
  const sb = gy - 50;
  shape(R(x0, top, w, sb - top), { lw: 1.6, id: 5010, fill: PAPER2 });
  bricks(x0 + 1, top, w - 2, sb - top, 'everything that can be said can be built', 7, 1, 0.22, 5);
  shape(R(cx - 50, sb - 170, 100, 170), { lw: 1.8, id: 5011, fill: PAPER2, h: [Math.PI / 2, 2.8, 0.7] }); line([cx, sb - 170], [cx, sb], 1.2, 5012, 0.1);
  for (let i = 0; i < 6; i++) { const x = x0 + 40 + (w - 80) * i / 5; shape(R(x - 14, top + 20, 28, sb - top - 20), { lw: 1.4, id: 5020 + i, fill: PAPER2, h: [Math.PI / 2, 3.4, 0.6], sh: R(x + 4, top, 12, 400), sh2: [Math.PI / 2, 1.8, 0.8] }); shape(R(x - 20, top + 10, 40, 12), { lw: 1.2, id: 5030 + i, fill: PAPER2 }); shape(R(x - 20, sb - 10, 40, 10), { lw: 1.2, id: 5040 + i, fill: PAPER2 }); }
  shape(R(x0 - 20, top - 46, w + 40, 46), { lw: 1.8, id: 5050, fill: PAPER2 });
  tx('EVERYTHING THAT CAN BE SAID CAN BE BUILT', cx, top - 16, `${o.mottoSz || 19}px ${FONT}`, { align: 'center' });
  shape([[x0 - 34, top - 46], [x1 + 34, top - 46], [cx, top - 150]], { lw: 1.8, id: 5060, fill: PAPER2, h: [0, 3.6, 0.4] });
  shape([[x0, top - 54], [x1, top - 54], [cx, top - 138]], { lw: 1, id: 5061, fill: PAPER2 });
  tx(o.name || 'MINISTRY OF CONSTRUCTIVE SEMANTICS', cx, top - 74, MONO(11, true), { align: 'center' });
  brass(cx + 92, sb - 60, o.plate || 'A ministry, imposing.', 5);
}
function interpreter(x, y, s, lt, o = {}) {
  X.save(); X.translate(x, y); X.scale(s, s);
  for (const k of [-1, 1]) { X.beginPath(); X.arc(k * 34, -10, 10, 0, 6.283); X.fillStyle = P.paper; X.fill(); X.lineWidth = 1.6; X.strokeStyle = P.ink; X.stroke(); const a = o.roll || 0; line([k * 34 + Math.cos(a) * 9, -10 + Math.sin(a) * 9], [k * 34 - Math.cos(a) * 9, -10 - Math.sin(a) * 9], 1, 5101 + k, 0.02); }
  shape(R(-50, -180, 100, 160), { lw: 1.8, id: 5110, fill: '#e2d6b8', h: [Math.PI / 2, 5, 0.4], sh: R(22, -180, 28, 160), sh2: [Math.PI / 2, 2, 0.8] });
  for (let i = 0; i < 3; i++) { X.beginPath(); X.arc(-26 + i * 26, -140, 8, 0, 6.283); X.fillStyle = (o.lamp || 0) > i / 3 ? '#fbf4dc' : PAPER2; X.fill(); X.lineWidth = 1.2; X.strokeStyle = P.ink; X.stroke(); if ((o.lamp || 0) <= i / 3) { X.save(); X.clip(); hatch(0.8, 2.2, 0.6, [-40 + i * 26, -150, -10 + i * 26, -130]); X.restore(); } }
  shape(R(-36, -112, 72, 40), { lw: 1.2, id: 5120, fill: PAPER2 }); for (let i = 0; i < 5; i++) line([-30, -104 + i * 7], [30, -104 + i * 7], 0.6, 5121 + i, 0.1);
  // the listening horn
  ink([[-10, -180], [-14, -214], [-40, -240]], 6, 5130, 0.3);
  X.save(); X.translate(-46, -246); X.rotate(-0.5); X.beginPath(); X.ellipse(-26, 0, 14, 34, 0, 0, 6.283); X.fillStyle = DARK; X.fill(); X.lineWidth = 1.6; X.strokeStyle = P.ink; X.stroke();
  shape([[-26, -34], [24, -6], [24, 6], [-26, 34]], { lw: 1.6, id: 5131, fill: PAPER2, h: [[0.2, 3, 0.5]] }); X.beginPath(); X.ellipse(-26, 0, 14, 34, 0, -Math.PI / 2, Math.PI / 2); X.stroke(); X.restore();
  // the tape slot
  shape(R(50, -70, 10, 30), { lw: 1.2, id: 5140, fill: P.ink });
  brass(0, -40, 'A machine for interpreting inhabitants.', 3.4);
  X.restore();
}
function sceneMinistry(sh, lt) {
  const L = sh.lines, wh = cue(sh, 'wheel'), st = cues(sh, 'step'), tp = cue(sh, 'tape'), fe = cue(sh, 'fete');
  const mx = lerp(1420, 830, E.out(U(lt, wh.at, wh.to))), my = GY + 70;
  let cur = -1; for (const q of st) if (lt >= q.at) cur = q.n;
  const after = lt > L[6].t1 + 0.2;
  const astroAside = after;
  // queue positions: the woman, the family, the astronomer; the one being interpreted stands at the horn
  const slot = (n) => (cur === n && !after ? 0 : 1);
  const horn = [690, my];
  const mv = (n, home) => { const q = st[n]; if (!q) return home; const u = E.io(U(lt, q.at, q.at + 1.0)), back = st[n + 1] ? E.io(U(lt, st[n + 1].at, st[n + 1].at + 1.0)) : (after ? E.io(U(lt, L[6].t1, L[6].t1 + 1.2)) : 0); const away = [home[0] - 20, home[1]]; return [lerp(lerp(home[0], horn[0], u), away[0], back), home[1]]; };
  const pA = mv(0, [520, my]), pF = mv(1, [400, my]), pW = mv(2, [170, my]);
  const astroPos = astroAside ? [lerp(pA[0], 560, U(lt, L[7].t0, L[7].t0 + 1.5)), my] : pA;
  let c = camFor(lt, [[0, ON(640, 330, 1.0)], [wh.at + 0.3, ON(800, 420, 1.25), 1.6], [st[0].at, ON(720, 470, 1.6), 1.2], [fe.at, ON(640, 330, 0.98), 1.4], [L[8].t1 + 0.3, ON(330, 470, 1.4), 1.2]]);
  c = withTight(sh, lt, c, astroPos[0] + 10, my - 110, 2.6);
  cam(c, () => {
    sky(GY - 200); groundBand(GY);
    ministryFacade(250, 1030, GY);
    shape(R(-200, GY, 1700, 1), { lw: 0 });
    // the fete: bunting between the columns, hats raised, paper falling
    const fu = fe ? U(lt, fe.at, fe.at + 1.0) : 0;
    if (fu > 0) {
      for (let i = 0; i < 5; i++) { const xa = 290 + i * 140, xb = xa + 140, ya = GY - 300; const pts = []; for (let j = 0; j <= 12; j++) { const u = j / 12; pts.push([lerp(xa, xb, u), ya + Math.sin(u * Math.PI) * 30 * fu]); } X.globalAlpha = fu; ink(pts, 0.9, 5200 + i, 0.2);
        for (let j = 1; j < 12; j += 2) { const [px, py] = pts[j]; shape([[px - 5, py], [px + 5, py], [px, py + 13]], { lw: 0.7, id: 5210 + i * 12 + j, fill: (i + j) % 2 ? PAPER2 : P.ink }); } X.globalAlpha = 1; }
      for (let i = 0; i < 70; i++) { const yy = ((lt - fe.at) * (40 + hash(i, 2) * 50) + hash(i, 3) * 600) % 700 - 60; X.fillStyle = hash(i, 4) > 0.5 ? P.ink : PAPER2; X.save(); X.translate(100 + hash(i, 5) * 1080, yy); X.rotate(lt * 3 + i); X.fillRect(-3, -1.6, 6, 3.2); X.strokeStyle = P.ink; X.lineWidth = 0.5; X.strokeRect(-3, -1.6, 6, 3.2); X.restore(); }
    }
    for (let i = 0; i < 3; i++) { const raise = fu * (0.5 + 0.5 * Math.sin(lt * 4 + i)); person({ x: 560 + i * 80, y: GY - 50, s: 0.5, kind: 'official', id: 5300 + i * 40, f: i === 2 ? -1 : 1, armF: fu > 0 ? [2.6 * raise, 2.9 * raise] : undefined, hat: raise > 0.6 ? 'none' : 'bowler' }); }
    // the machine and its tape
    const tu = tp ? U(lt, tp.at, tp.to + 0.6) : 0, roll = (mx - 830) / 10;
    interpreter(mx, my, 1.05, lt, { roll, lamp: talking(sh, 'I', lt) ? 0.5 + 0.5 * Math.sin(lt * 14) : 0 });
    if (tu > 0) {
      const tx0 = mx + 63, ty0 = my - 60, len = 40 + 300 * tu; const pts = []; for (let i = 0; i <= 20; i++) { const u = i / 20 * len; pts.push([tx0 + Math.min(u, 60) + Math.max(0, u - 60) * 0.25, ty0 + Math.max(0, u - 60) * 0.9]); }
      X.lineWidth = 9; X.strokeStyle = P.ink; X.beginPath(); pts.forEach(([a, b], i) => (i ? X.lineTo(a, b) : X.moveTo(a, b))); X.stroke(); X.lineWidth = 7.4; X.strokeStyle = '#fbf6e6'; X.stroke();
      const lines = ['EXCESSIVE ATTACHMENT TO EUCLIDEAN GEOMETRY', 'UNREALISTIC SPATIAL EXPECTATIONS', 'STAIRCASE ADEQUATE. RECONSIDER UP AND DOWN'];
      const shown = L.slice(3, 6).filter((l) => lt > l.t0).length; tx(lines[Math.max(0, shown - 1)].slice(0, 26), tx0 + 4, ty0 + 2.4, MONO(5.2), {});
    }
    // the tenants
    person({ x: pW[0], y: pW[1], s: 0.6, kind: 'woman', id: 5400, prop: PROP.cane(), f: 1, mouth: sayAt(sh, 'O', lt), look: 0.6,
      sit: lt > L[8].t1 + 0.5, armF: lt > L[6].t0 - 0.1 && lt < L[6].t1 + 1.0 ? [0.6, 2.6] : undefined });
    const fx = pF[0];['man', 'mother', 'boy', 'girl', 'boy'].forEach((k, j) => person({ x: fx - j * 34, y: my - (j > 1 ? 2 : 0), s: j > 1 ? 0.38 : 0.56, kind: k, id: 5500 + j * 40, f: 1 }));
    person({ x: astroPos[0], y: astroPos[1], s: 0.62, kind: 'astro', id: 5700, f: astroAside && lt > L[8].t0 - 0.4 ? -1 : 1, mouth: sayAt(sh, 'A', lt), prop: PROP.telescope(0.6), armF: [0.4, 0.8], look: 0.6 });
  });
}

/* ---- Figs. 8 and 9: the primitive house and its uses; the Institute ---- */
function sceneUses(sh, lt) {
  const us = cues(sh, 'use'), gr = cue(sh, 'grey');
  const on = (n) => (us[n] ? U(lt, us[n].at, us[n].at + 0.5) : 0);
  const g = gr ? U(lt, gr.at, gr.to) : 0;
  const focus = [[640, 160], [640, 610], [470, 390], [640, 390], [810, 390], [800, 500], [470, 500], [640, 500], [640, 230]];
  const plan = [[0, ON(640, 380, 1.0)]]; us.forEach((q, n) => plan.push([q.at - 0.25, ON(lerp(focus[n][0], 640, 0.5), lerp(focus[n][1], 380, 0.5), 1.35), 0.4]));
  if (gr) plan.push([gr.at, ON(640, 380, 1.0), 1.2]);
  const c = camFor(lt, plan);
  cam(c, () => {
    sky(GY - 10); groundBand(GY);
    // rain, from the moment shelter is named; it stops at the roof
    if (on(0) > 0) { X.save(); X.globalAlpha = on(0) * (1 - g * 0.7); for (let i = 0; i < 160; i++) { const x = hash(i, 1) * 1280, y0 = ((lt * 400 + hash(i, 2) * 700) % 760) - 40; const roofY = x > 330 && x < 950 ? 300 - (x < 640 ? (x - 330) : (950 - x)) * 0.0 - (1 - Math.abs(x - 640) / 320) * 130 : GY; if (y0 < roofY) line([x, y0], [x - 3, Math.min(roofY, y0 + 16)], 0.8, 6000 + i, 0.05); } X.restore(); }
    X.save(); X.globalAlpha = 1 - 0.62 * g;
    const x0 = 340, x1 = 940, f1 = GY - 150, f2 = GY - 290;
    shape(R(x0, GY, x1 - x0, 110), { lw: 1.6, id: 6100, fill: PAPER2 }); shape(R(x0, f2, x1 - x0, GY - f2), { lw: 2, id: 6101, fill: PAPER2 });
    shape([[x0 - 30, f2], [x1 + 30, f2], [640, f2 - 150]], { lw: 2, id: 6102, fill: PAPER2, h: [[-1, 3.2, 0.5]] });
    shape([[x0 + 30, f2 - 10], [x1 - 30, f2 - 10], [640, f2 - 130]], { lw: 1, id: 6103, fill: PAPER2 });
    for (const y of [f1, GY]) line([x0, y], [x1, y], 2.4, 6104 + y, 0.2);
    line([520, f1], [520, GY], 1.6, 6110, 0.2); line([760, f1], [760, GY], 1.6, 6111, 0.2); line([540, f2], [540, f1], 1.6, 6112, 0.2); line([740, f2], [740, f1], 1.6, 6113, 0.2);
    const dim = (n) => 0.25 + 0.75 * on(n);
    // storage: barrels in the cellar
    X.globalAlpha = (1 - 0.62 * g) * dim(1); for (let i = 0; i < 5; i++) { shape(R(380 + i * 70, GY + 40, 46, 62), { lw: 1.3, id: 6200 + i, fill: PAPER2, h: [Math.PI / 2, 3, 0.5] }); line([380 + i * 70, GY + 56], [426 + i * 70, GY + 56], 1.4, 6210 + i, 0.1); line([380 + i * 70, GY + 86], [426 + i * 70, GY + 86], 1.4, 6220 + i, 0.1); }
    // sleep: a bed and a sleeper
    X.globalAlpha = (1 - 0.62 * g) * dim(2); shape(R(370, f1 - 40, 140, 26), { lw: 1.4, id: 6300, fill: PAPER2, h: [0.6, 3, 0.5] }); line([370, f1 - 60], [370, f1], 2.4, 6301, 0.1); line([510, f1 - 46], [510, f1], 2.4, 6302, 0.1); if (on(2) > 0) { ball(388, f1 - 48, 9, 6303, PAT.f, 1.2); shape([[396, f1 - 50], [506, f1 - 46], [506, f1 - 38], [396, f1 - 38]], { lw: 1.2, id: 6304, h: [0.5, 2.4, 0.5] }); }
    // childbirth: a cradle
    X.globalAlpha = (1 - 0.62 * g) * dim(3); X.beginPath(); X.arc(640, f1 - 34, 34, 0.15, Math.PI - 0.15); X.lineWidth = 2; X.strokeStyle = P.ink; X.stroke(); line([606, f1 - 30], [674, f1 - 30], 1.6, 6310, 0.1); line([620, f1 - 4], [660, f1 - 4], 2, 6311, 0.1); if (on(3) > 0) ball(640, f1 - 34, 7, 6312, PAT.f, 1);
    // illness: a bed, a basin, a bottle
    X.globalAlpha = (1 - 0.62 * g) * dim(4); shape(R(770, f1 - 40, 130, 26), { lw: 1.4, id: 6320, fill: PAPER2, h: [-0.6, 3, 0.5] }); line([900, f1 - 64], [900, f1], 2.4, 6321, 0.1); if (on(4) > 0) { ball(884, f1 - 50, 9, 6322, PAT.f, 1.2); shape([[876, f1 - 52], [776, f1 - 46], [776, f1 - 38], [876, f1 - 38]], { lw: 1.2, id: 6323, h: [0.9, 2.2, 0.6] }); } shape(R(790, f1 - 14, 20, 12), { lw: 1, id: 6324 }); shape(R(820, f1 - 26, 7, 24), { lw: 1, id: 6325, fill: P.ink });
    // conversation: two chairs, two people
    X.globalAlpha = (1 - 0.62 * g) * dim(5); if (on(5) > 0) { person({ x: 790, y: GY - 2, s: 0.42, kind: 'man', hat: 'none', sit: true, id: 6400, f: 1, mouth: 0.4 + 0.4 * Math.sin(lt * 8) }); person({ x: 900, y: GY - 2, s: 0.42, kind: 'woman', sit: true, id: 6440, f: -1, mouth: 0.3 * Math.sin(lt * 6 + 1) }); } else { shape(R(790, GY - 40, 20, 4), { lw: 1, id: 6401 }); shape(R(880, GY - 40, 20, 4), { lw: 1, id: 6402 }); }
    // cooking: a stove, a pot, steam
    X.globalAlpha = (1 - 0.62 * g) * dim(6); shape(R(370, GY - 60, 80, 60), { lw: 1.4, id: 6500, fill: PAPER2, h: [0.1, 2.4, 0.6] }); shape(R(390, GY - 84, 40, 24), { lw: 1.3, id: 6501, fill: PAPER2, h: [Math.PI / 2, 3, 0.5] }); line([430, GY - 150], [430, GY - 60], 4, 6502, 0.1);
    if (on(6) > 0) for (let i = 0; i < 3; i++) { const pts = []; for (let j = 0; j < 8; j++) pts.push([400 + i * 10 + Math.sin(j * 0.9 + lt * 4 + i) * 4, GY - 88 - j * 6]); ink(pts, 0.8, 6510 + i, 0.2); }
    // privacy: a closed door, a key turned
    X.globalAlpha = (1 - 0.62 * g) * dim(7); shape(R(600, GY - 110, 80, 110), { lw: 1.6, id: 6600, fill: PAPER2, h: [Math.PI / 2, 3, 0.5] }); X.beginPath(); X.arc(665, GY - 55, 3, 0, 6.283); X.fillStyle = P.ink; X.fill(); if (on(7) > 0) line([665, GY - 52], [665 + 8 * on(7), GY - 46], 1.4, 6601, 0.1);
    // the occasional murder: a curtain in the attic, and two shadows on it
    X.globalAlpha = (1 - 0.62 * g) * dim(8); shape(R(590, f2 - 90, 100, 80), { lw: 1.2, id: 6700, fill: '#f8f0d8' }); for (let i = 0; i < 6; i++) line([596 + i * 17, f2 - 90], [592 + i * 17 + Math.sin(lt * 2 + i) * 2, f2 - 10], 0.7, 6701 + i, 0.3);
    if (on(8) > 0) { X.save(); path(R(590, f2 - 90, 100, 80)); X.clip(); X.globalAlpha *= 0.65; X.fillStyle = P.ink; X.beginPath(); X.arc(620, f2 - 62, 7, 0, 6.283); X.fill(); X.fillRect(613, f2 - 54, 14, 40); X.beginPath(); X.arc(662, f2 - 60, 7, 0, 6.283); X.fill(); X.fillRect(655, f2 - 52, 14, 40); X.save(); X.translate(668, f2 - 50); X.rotate(-0.7 - 0.6 * on(8)); X.fillRect(0, -2, 26, 4); X.fillRect(22, -5, 6, 10); X.restore(); X.restore(); }
    X.globalAlpha = 1; X.restore();
  });
}
const TABLETS = ['A BUILDING EXISTS INDEPENDENTLY OF ITS USES.', 'USES ARE PROPERTIES OF BUILDINGS.', 'THE FIRST TWO PRINCIPLES ARE COMPATIBLE.'];
function sceneInstitute(sh, lt) {
  const cv = cues(sh, 'carve'), vo = cue(sh, 'vols'), L = sh.lines;
  const gy = 650;
  let c = camFor(lt, [[0, ON(640, 330, 1.0)], [cv[0].at - 0.4, ON(420, 250, 1.7), 1.2], [cv[1].at - 0.4, ON(640, 250, 1.7), 1.2], [cv[2].at - 0.4, ON(860, 250, 1.7), 1.2], [vo.at - 0.6, ON(640, 520, 1.25), 1.4]]);
  c = withTight(sh, lt, c, 860, 250, 2.6);
  cam(c, () => {
    sky(gy - 300); groundBand(gy);
    const x0 = 210, x1 = 1070, top = 120;
    shape(R(x0, top, x1 - x0, gy - top), { lw: 1.8, id: 6800, fill: PAPER2 });
    bricks(x0 + 1, top, x1 - x0 - 2, gy - top, 'an institute of operative description', 7, 1, 0.22, 3);
    shape([[x0 - 30, top], [x1 + 30, top], [640, top - 90]], { lw: 1.8, id: 6801, fill: PAPER2, h: [0, 3.6, 0.4] });
    tx('INSTITUTE OF OPERATIVE DESCRIPTION', 640, top - 22, MONO(12, true), { align: 'center' });
    for (let i = 0; i < 3; i++) {
      const cx = 420 + i * 220, u = cv[i] ? U(lt, cv[i].at, cv[i].at + (i === 2 ? 3.4 : 2.6)) : 0;
      shape(R(cx - 92, 160, 184, 190), { lw: 1.8, id: 6810 + i, fill: '#efe6cc', h: [0.05, 6, 0.3] });
      tx(['I', 'II', 'III'][i], cx, 190, `${22}px ${FONT}`, { align: 'center' });
      const ls = wrap(TABLETS[i], 150, `${14}px ${FONT}`); let left = Math.ceil(TABLETS[i].length * u);
      ls.forEach((s, k) => { if (left > 0) tx(s.slice(0, left), cx, 228 + k * 22, `${14}px ${FONT}`, { align: 'center' }); left -= s.length + 1; });
      for (const xx of [cx - 108, cx + 108]) shape(R(xx - 8, 150, 16, 210), { lw: 1.2, id: 6820 + i + xx, fill: PAPER2, h: [Math.PI / 2, 2.6, 0.5] });
    }
    // the long window and the shelves where the volumes arrive
    const wy = 400, wh = 210; shape(R(270, wy, 740, wh), { lw: 2, id: 6830, fill: '#fbf4dc' });
    for (const sy of [wy + 100, wy + 200]) shape(R(276, sy, 728, 6), { lw: 1.2, id: 6831 + sy, fill: PAPER2, h: [0, 2, 0.6] });
    const nv = vo ? Math.floor(47 * Math.pow(U(lt, vo.at, vo.to), 0.85)) : 0;
    for (let i = 0; i < nv; i++) { const row = i < 24 ? 0 : 1, j = row ? i - 24 : i, x = 290 + j * 29, sy = wy + 100 + row * 100, h = 74 + hash(i, 4) * 14; spineV(x, sy, 25, h, i + 1); }
    brass(640, gy - 24, 'An institute of operative description.', 5);
  });
}
function spineV(x, y, w, h, n) { shape(R(x, y - h, w, h), { lw: 1.2, id: 6900 + n, fill: '#d9cfb4', h: [Math.PI / 2, 3, 0.4] }); for (const q of [0.1, 0.88]) line([x, y - h * q], [x + w, y - h * q], 1.2, 6950 + n, 0.1); shape(R(x + 3, y - h * 0.62, w - 6, 16), { lw: 0.8, id: 6990 + n, fill: P.paper }); tx(String(n), x + w / 2, y - h * 0.62 + 12, MONO(9, true), { align: 'center' }); }

/* the woman at the foot of her stair (the repeated Fig. 6, and the last shot) */
function sceneStairSit(sh, lt, o = {}) {
  cam(o.cam || ON(560, 400, 1.15), () => {
    stairWorld(lt, { red: o.red });
    person({ x: STR.x0 - 70, y: GY + 2, s: 0.62, kind: 'woman', id: 4700, sit: true, f: 1, prop: PROP.cane(), look: 0.5, lookY: -1.2, armF: [0.9, 1.3 + 0.2 * Math.sin(lt * 5)] });
    shape(R(STR.x0 - 92, GY - 52, 46, 8), { lw: 1.2, id: 4710, fill: PAPER2 });
  });
}

/* ---- Fig. 10: five schools, five equal plots, the same two words ---- */
const SCHOOLS = ['LITERALISTS', 'PROBABILISTS', 'FUNCTIONALISTS', 'REVISIONISTS', 'ABOLITIONISTS'];
const plotX = (k) => 300 + k * 560;
function signpost(x, gy, s, id) { line([x, gy], [x, gy - 96], 3, id, 0.1); X.font = MONO(11, true); const w = X.measureText(s).width + 16; shape(R(x - w / 2, gy - 122, w, 24), { lw: 1.4, id: id + 1, fill: PAPER2 }); tx(s, x, gy - 105, MONO(11, true), { align: 'center' }); }
function schoolHouse(k, cx, gy, u, lt, o = {}) {
  if (u <= 0) return;
  if (k === 0) { // a single line between inside and outside, laid in letters
    const n = 80, m = Math.floor(n * u), pts = []; for (let i = 0; i <= m; i++) { const a = Math.PI / 2 + i / n * 6.283; pts.push([cx + Math.cos(a) * 150, gy + 30 + Math.sin(a) * 30]); }
    if (pts.length > 1) ink(pts, 2.4, 7000, 0.4);
    for (let i = 0; i < m; i += 3) { const a = Math.PI / 2 + i / n * 6.283; tx('A HOUSE '[(i / 3) % 8 | 0], cx + Math.cos(a) * 150, gy + 30 + Math.sin(a) * 30 - 6, MONO(8, true), { align: 'center' }); }
    return;
  }
  if (k === 1) { // every house at once, and their average
    const V = [[200, 170, 'gable'], [150, 230, 'flat'], [240, 130, 'gable'], [180, 200, 'pediment'], [120, 260, 'gable'], [260, 150, 'flat'], [210, 190, 'gable']];
    X.save(); V.forEach(([w, h, r], i) => { X.globalAlpha = 0.16 * clamp(u * 3 - i * 0.2); house({ x: cx - w / 2 + (hash(i, 3) - 0.5) * 30, w, h, gy, roof: r, rh: w * 0.4, floors: 2, cols: 2 + (i % 2), id: 7100 + i * 90, text: false, base: false, chimney: i % 2 ? [0.7] : undefined, ch: 20 + i * 8 }); }); X.restore();
    const au = clamp((u - 0.35) / 0.65); if (au <= 0) return;
    house({ x: cx - 98, w: 196, h: 190, gy, roof: 'gable', rh: 80, floors: 2, cols: 3, door: { w: 28 }, chimney: [0.72], ch: 38, id: 7800, s: 'a house', u: au });
    if (au > 0.9) { const chx = cx - 98 + 196 * 0.72 + 14, y1 = gy - 190 - 80 * (1 - Math.abs(cx - 98 + 196 * 0.72 - cx) / 108) - 38, y0 = gy;
      X.globalAlpha = U(au, 0.9, 1); line([chx + 10, y0], [chx + 10, y1], 0.8, 7810, 0.05); line([chx + 4, y1], [chx + 16, y1], 0.8, 7811, 0.05); line([chx + 4, y0], [chx + 16, y0], 0.8, 7812, 0.05);
      tx('average', chx + 14, (y0 + y1) / 2, FONTI(13), {}); X.globalAlpha = 1; }
    return;
  }
  if (k === 2) { // a set of verbs
    const big = (s, x, y, a = 0, sz = 30, al = 1) => { X.save(); X.translate(x, y); X.rotate(a); tx(s, 0, 0, `${sz}px ${FONT}`, { align: 'center', alpha: al }); X.restore(); };
    const q = (i) => clamp(u * 7 - i);
    const vert = (s, x, i) => { for (let j = 0; j < s.length; j++) big(s[s.length - 1 - j], x, gy - 6 - j * 30, 0, 30, q(i)); };
    vert('ENTER', cx - 110, 0); vert('LEAVE', cx + 110, 1);
    big('SHELTER', cx - 58, gy - 190, -0.62, 28, q(2)); big('COVER', cx + 52, gy - 192, 0.62, 28, q(3));
    big('SIT', cx - 40, gy - 40, 0, 22, q(4)); big('SLEEP', cx + 40, gy - 90, 0, 20, q(5)); big('COOK', cx - 36, gy - 130, 0, 20, q(6)); big('WAIT', cx + 44, gy - 26, 0, 20, q(6));
    return;
  }
  if (k === 3) { // all scaffolding, and the alterations never finish
    const lv = 4, top = gy - 280 * u;
    X.save(); X.beginPath(); X.rect(cx - 200, top - 10, 400, gy - top + 12); X.clip();
    for (let i = 0; i < 5; i++) line([cx - 140 + i * 70, gy], [cx - 140 + i * 70, gy - 290], 3, 7300 + i, 0.3);
    for (let j = 1; j <= lv; j++) { const y = gy - j * 66; line([cx - 152, y], [cx + 152, y], 2.4, 7310 + j, 0.3); shape(R(cx - 150, y - 6, 300, 6), { lw: 1, id: 7320 + j, fill: PAPER2, h: [0, 2, 0.5] }); }
    for (let i = 0; i < 4; i++) for (let j = 0; j < lv; j++) line([cx - 140 + i * 70, gy - j * 66], [cx - 70 + i * 70, gy - (j + 1) * 66], 1, 7340 + i * 10 + j, 0.2);
    for (let j = 0; j < 3; j++) { const lx = cx + 120 - j * 90; line([lx, gy - j * 66], [lx + 8, gy - (j + 1) * 66], 1.4, 7380 + j, 0.1); line([lx + 14, gy - j * 66], [lx + 22, gy - (j + 1) * 66], 1.4, 7385 + j, 0.1); }
    X.restore();
    if (u > 0.7) for (let w = 0; w < 3; w++) { const j = w + 1, ph = lt * 1.4 + w * 2.1, x = cx - 100 + ((Math.sin(ph) + 1) / 2) * 200; person({ x, y: gy - j * 66 - 6, s: 0.3, kind: 'builder', id: 7400 + w * 40, walk: Math.abs(Math.cos(ph)) > 0.3 ? 1 : 0, ph: lt * 8 + w, f: Math.cos(ph) > 0 ? 1 : -1, armF: [1.6, 1.8], prop: w === 1 ? PROP.trowel() : undefined }); }
    return;
  }
  if (k === 4) { // a structure for purposes nobody can name
    const q = (i) => clamp(u * 5 - i);
    X.save(); X.globalAlpha = q(0); X.translate(cx - 60, gy); X.rotate(-0.18); shape(R(-40, -240, 80, 240), { lw: 1.8, id: 7500, fill: PAPER2, h: [Math.PI / 2, 3, 0.5] }); shape(R(-16, -270, 32, 30), { lw: 1.4, id: 7501, fill: PAPER2, h: [Math.PI / 2, 2.4, 0.7] }); X.restore();
    X.save(); X.globalAlpha = q(1); X.beginPath(); X.ellipse(cx + 70, gy - 120, 70, 70, 0, 0, 6.283); X.fillStyle = PAPER2; X.fill(); X.lineWidth = 1.8; X.strokeStyle = P.ink; X.stroke(); for (let i = 0; i < 6; i++) { X.beginPath(); X.ellipse(cx + 70 + Math.cos(i) * 40, gy - 120 + Math.sin(i) * 40, 10, 16, i, 0, 6.283); X.fillStyle = DARK; X.fill(); } X.restore();
    X.save(); X.globalAlpha = q(2); for (let i = 0; i < 7; i++) shape(R(cx + 10 + i * 14, gy + 4 + i * 8, 16, 8), { lw: 1, id: 7510 + i, fill: PAPER2, h: [0, 2, 0.5] }); X.restore();
    X.save(); X.globalAlpha = q(3); shape([[cx - 150, gy], [cx - 150, gy - 80], [cx - 110, gy - 120], [cx - 70, gy - 80], [cx - 70, gy]], { lw: 1.8, id: 7520, fill: PAPER2 }); shape(R(cx - 132, gy - 70, 44, 70), { lw: 1.2, id: 7521, fill: P.paper }); X.restore();
    X.save(); X.globalAlpha = q(4); shape(R(cx - 84, gy - 268, 46, 34), { lw: 1.4, id: 7530, fill: PAPER2, h: [Math.PI / 2, 3, 0.6] }); line([cx + 70, gy - 190], [cx + 150, gy - 300], 6, 7531, 0.4); ball(cx + 154, gy - 306, 12, 7532, PAT.m, 1.4); X.restore();
  }
}
function sceneSchools(sh, lt) {
  const L = sh.lines, ty = cue(sh, 'type'), fs = cues(sh, 'fall').sort((a, b) => a.s - b.s), rs = cues(sh, 'rise').sort((a, b) => a.s - b.s);
  const fallOf = (k) => sh.cues.find((c) => c.k === 'fall' && c.s === k), riseOf = (k) => sh.cues.find((c) => c.k === 'rise' && c.s === k);
  const typed = Math.floor(8 * U(lt, ty.at + 0.2, ty.to - 0.1));
  const OVER = ON(1420, 400, 0.5);
  const plan = [[0, OVER], [ty.at - 0.6, ON(plotX(0) - 120, 380, 1.15), 1.4]];
  for (let k = 0; k < 5; k++) { const f = fallOf(k); plan.push([f.at - 0.9, ON(plotX(k) - 20, 400, 1.12), 1.2]); }
  plan.push([L[8].t0 - 0.4, OVER, 2.0]);
  let c = camFor(lt, plan);
  c = withTight(sh, lt, c, plotX(0) + 10, GY - 40, 2.5);
  cam(c, () => {
    sky(GY - 60); groundBand(GY, -1600, 4400);
    for (let k = 0; k < 5; k++) {
      const cx = plotX(k), f = fallOf(k), r = riseOf(k), ru = U(lt, r.at, r.to);
      stakes(cx - 170, cx + 170, GY, 7600 + k * 20);
      signpost(cx + 196, GY + 4, SCHOOLS[k], 7620 + k * 10);
      edifier(cx - 220, GY, 0.62, { id: 8000 + k * 100, paper: 'A house.', n: typed, up: lt > ty.at ? Math.max(0.2, U(lt, ty.at, ty.to)) * (lt < f.at ? 1 : 1) : 0, key: typed > 0 && lt < ty.to ? Math.floor(hash(typed, k) * 29) : -1, say: sayAt(sh, 'D', lt), paperAlpha: 1 - U(lt, f.at, f.at + 0.6), plate: false });
      if (lt > f.at && ru < 0.6) { X.save(); X.globalAlpha = 1 - U(lt, r.at, r.at + 0.8); fallLetters(lt, f, 'A house.', [cx - 220, GY - 186], [cx - 110, cx + 110, GY], { sz: 15, arc: 90 }); X.restore(); }
      schoolHouse(k, cx, GY, ru, lt);
      line([cx - 150, GY + 60], [cx - 150, GY + 30], 2, 7700 + k, 0.1); brass(cx - 150, GY + 24, 'A house.', 6, { alpha: 1 });
    }
    // the Literalists' tenant steps over the line, and is inside
    const l3 = L[3], tu = U(lt, l3.t0 - 1.6, l3.t0 + 1.2), tx_ = lerp(plotX(0) - 300, plotX(0) - 20, E.io(tu));
    if (lt > l3.t0 - 1.8) person({ x: tx_, y: GY + 44, s: 0.55, kind: 'man', id: 7900, walk: tu > 0 && tu < 1 ? 1 : 0, ph: lt * 7, look: tu >= 1 ? -0.5 + Math.sin(lt * 1.2) : 0.5, armF: tu >= 1 ? [0.2, 0.3] : undefined, hat: tu >= 1 && lt > l3.t1 ? 'none' : 'bowler' });
  });
}

/* ---- Fig. 11: the manufacture of a builder ---- */
/* a standing figure built of letter bricks; u reveals it from the feet up */
function letterFigure(x, gy, s, u, word, id, o = {}) {
  if (u <= 0) return;
  X.save(); X.translate(x, gy); X.scale(s, s);
  const sil = [[-30, 0], [-12, 0], [-8, -70], [8, -70], [12, 0], [30, 0], [22, -96], [34, -100], [44, -170], [26, -182], [12, -186], [12, -196], [-12, -196], [-12, -186], [-26, -182], [-44, -170], [-34, -100], [-22, -96]];
  X.save(); path(sil); X.clip(); X.fillStyle = PAPER2; X.fillRect(-60, -240 * u, 120, 240 * u + 10);
  bricks(-60, -230, 120, 230, word, 8, u, 0.75, id); X.restore();
  X.save(); X.beginPath(); X.rect(-80, -240 * u - 4, 160, 260); X.clip(); ink([...sil, sil[0]], 1.8, id, 0.4); X.restore();
  if (u > 0.85) { const hu = U(u, 0.85, 1); X.save(); X.globalAlpha = hu; X.beginPath(); X.arc(0, -214, 20, 0, 6.283); X.fillStyle = PAPER2; X.fill(); X.save(); X.clip(); bricks(-22, -236, 44, 44, word, 8, 1, 0.75, id + 1); X.restore(); X.lineWidth = 1.8; X.strokeStyle = P.ink; X.stroke(); X.restore(); }
  if (o.eyes) { const lk = o.look || 0; for (const k of [-1, 1]) { X.beginPath(); X.arc(k * 7 + lk * 4, -216, 3, 0, 6.283); X.fillStyle = P.paper; X.fill(); X.lineWidth = 1; X.stroke(); X.beginPath(); X.arc(k * 7 + lk * 5, -216, 1.5, 0, 6.283); X.fillStyle = P.ink; X.fill(); } }
  if (o.trowel) { X.save(); X.translate(40, -150); X.rotate(o.trowel); line([0, 0], [16, -6], 3, id + 5, 0.1); shape([[16, -12], [44, -6], [16, 2]], { lw: 1.2, id: id + 6, fill: PAPER2 }); X.restore(); }
  if (o.hat) { shape([[-24, -228], [24, -228], [16, -248], [-16, -248]], { lw: 1.4, id: id + 7, fill: PAPER2, h: [0.1, 2.4, 0.6] }); }
  X.restore();
}
function sceneBuilder(sh, lt) {
  const L = sh.lines, ty = cue(sh, 'type'), fa = cue(sh, 'fall'), ri = cue(sh, 'rise'), wk = cue(sh, 'wake'), se = cue(sh, 'second');
  const gy = 600, S = 'A builder.', EX = 470, es = 1.0;
  const typed = Math.floor(S.length * U(lt, ty.at + 0.2, ty.to - 0.1));
  const ru = U(lt, ri.at, ri.to), awake = lt > wk.at, su = U(lt, se.at + 0.6, se.to);
  let c = camFor(lt, [[0, ON(640, 360, 1.0)], [L[1].t0 - 0.6, ON(EX + 20, 400, 1.5), 1.2], [fa.at - 0.2, ON(700, 420, 1.2), 1.2], [wk.at - 0.2, ON(800, 440, 1.75), 1.0], [se.at, ON(900, 400, 1.1), 1.6], [sh.d - 3.4, ON(640, 360, 1.0), 1.4]]);
  c = withTight(sh, lt, c, EX, gy - 230, 2.5);
  cam(c, () => {
    // the Ministry's great hall: pilasters, the motto, a floor in perspective
    X.fillStyle = PAPER2; X.fillRect(-400, -200, 2100, gy + 200);
    for (let i = 0; i < 7; i++) { const x = 40 + i * 200; shape(R(x - 18, 70, 36, gy - 70), { lw: 1.4, id: 8100 + i, fill: PAPER2, h: [Math.PI / 2, 3.2, 0.5] }); shape(R(x - 26, 60, 52, 14), { lw: 1.2, id: 8110 + i, fill: PAPER2 }); }
    shape(R(-60, 22, 1400, 38), { lw: 1.6, id: 8120, fill: PAPER2, h: [0, 3, 0.4] }); tx('EVERYTHING THAT CAN BE SAID CAN BE BUILT', 640, 48, `${17}px ${FONT}`, { align: 'center' });
    X.fillStyle = P.paper; X.fillRect(-400, gy, 2100, 400); line([-400, gy], [1700, gy], 2, 8130, 0.3);
    for (let i = -12; i <= 12; i++) line([640 + i * 60, gy], [640 + i * 150, 900], 0.8, 8140 + i + 12, 0.2);
    for (let j = 0; j < 6; j++) { const y = gy + 10 + j * j * 6 + j * 8; line([-400, y], [1700, y], 0.8, 8170 + j, 0.2); }
    // the officials at their table, who ordered it
    shape(R(40, gy - 90, 300, 12), { lw: 1.4, id: 8200, fill: PAPER2, h: [0, 2.4, 0.6] }); line([60, gy - 78], [60, gy], 3, 8201, 0.1); line([320, gy - 78], [320, gy], 3, 8202, 0.1);
    for (let i = 0; i < 3; i++) person({ x: 90 + i * 90, y: gy - 2, s: 0.55, kind: 'official', id: 8300 + i * 40, f: 1, armF: i === 1 && lt > L[1].t0 && lt < L[1].t1 + 0.5 ? [1.9, 2.0] : [1.1, 1.4], look: 0.5 });
    shape(R(170, gy - 100, 40, 10), { lw: 1, id: 8210, fill: '#fbf6e6' });
    edifier(EX, gy, es, { id: 8400, paper: S, n: typed, up: lt > L[1].t0 + 0.2 ? Math.max(0.15, U(lt, ty.at, ty.to)) : 0, key: typed > 0 && lt < ty.to ? Math.floor(hash(typed, 3) * 29) : -1, say: sayAt(sh, 'D', lt), paperAlpha: 1 - U(lt, fa.at, fa.at + 0.6) });
    if (lt > fa.at && ru < 0.5) { X.save(); X.globalAlpha = 1 - U(lt, ri.at, ri.at + 0.8); fallLetters(lt, fa, S, [EX, gy - 290], [740, 860, gy], { sz: 15, arc: 110 }); X.restore(); }
    const look = awake ? (lt < se.at ? Math.sin((lt - wk.at) * 1.6) : 1) : 0;
    letterFigure(800, gy, 1.0, ru, 'a builder', 8500, { eyes: awake, look, trowel: lt > wk.at + 1.4 ? -0.4 + (su > 0 && su < 1 ? 0.5 * Math.sin(lt * 9) : 0) : undefined });
    // its first work: a better builder, laid course by course beside it
    if (su > 0) letterFigure(1010, gy, 1.28, su, 'a better builder', 8600, { eyes: su >= 1, look: su >= 1 ? -1 : 0, hat: su > 0.95 });
  });
}

/* ---- Figs. 12 to 17: the generations; Fig. 18: an architectural feature ---- */
function genScene(k, lt, u) {
  sky(GY - 40, 0.18); groundBand(GY);
  if (k === 0) { // a facade, propped from behind
    house({ x: 420, w: 360, h: 260, floors: 2, cols: 3, roof: 'gable', rh: 110, door: { w: 40 }, depth: 0, id: 8700, s: 'a facade', plate: 'A facade.', psz: 7, py: 40, pdx: 40 });
    for (const x of [470, 640, 730]) { line([x + 40, GY], [x + 140, GY - 190], 5, 8750 + x, 0.3); line([x + 140, GY - 190], [x + 10, GY - 200], 3, 8760 + x, 0.3); }
  } else if (k === 1) { // an interior with no outside
    X.save(); X.translate(640, 380); X.rotate(Math.sin(lt * 0.5) * 0.04); X.translate(-640, -380);
    shape([[400, 180], [880, 180], [880, 520], [400, 520]], { lw: 2, id: 8800, fill: PAPER2 });
    for (let y = 196; y < 470; y += 20) for (let x = 414; x < 870; x += 20) { X.fillStyle = P.ink; X.globalAlpha = 0.35; X.fillRect(x, y, 2, 2); } X.globalAlpha = 1;
    shape([[400, 470], [880, 470], [960, 560], [320, 560]], { lw: 1.6, id: 8801, fill: P.paper, h: [0.05, 4, 0.4] });
    shape([[320, 120], [400, 180], [400, 470], [320, 560]], { lw: 1.6, id: 8802, fill: PAPER2, h: [0.4, 4, 0.4] }); shape([[960, 120], [880, 180], [880, 470], [960, 560]], { lw: 1.6, id: 8803, fill: PAPER2, h: [-0.4, 4, 0.4] });
    shape(R(500, 380, 90, 90), { lw: 1.6, id: 8810, fill: PAPER2, h: [0.6, 3, 0.5] }); shape(R(490, 360, 20, 110), { lw: 1.2, id: 8811, fill: PAPER2 }); line([760, 470], [760, 330], 2, 8812, 0.1); shape([[735, 330], [785, 330], [775, 300], [745, 300]], { lw: 1.2, id: 8813, fill: '#fbf4dc' });
    shape(R(600, 230, 110, 80), { lw: 1.6, id: 8814, fill: PAPER2 }); shape([[612, 300], [655, 250], [698, 300]], { lw: 1, id: 8815, h: [-0.9, 2.6, 0.5] });
    brass(640, 545, 'An interior.', 7); X.restore();
  } else if (k === 2) { // a house that works
    house({ x: 440, w: 320, h: 220, floors: 2, cols: 3, roof: 'gable', rh: 110, door: { w: 40 }, chimney: [0.75], ch: 44, id: 8900, s: 'a working house', lit: true, plate: 'A working house.', psz: 7, py: 40, pdx: 40 });
    for (let i = 0; i < 4; i++) { const pts = []; for (let j = 0; j < 14; j++) pts.push([440 + 320 * 0.75 + 10 * j * 0.3 + Math.sin(j * 0.7 - lt * 2 + i) * 8 + j * 4, GY - 220 - 70 - 44 - j * 12 - i * 30]); ink(pts, 1.2, 8950 + i, 0.3); }
    line([820, GY - 120], [1060, GY - 140], 0.8, 8960, 0.3); line([820, GY - 120], [820, GY], 2, 8961, 0.1); line([1060, GY - 140], [1060, GY], 2, 8962, 0.1);
    for (let i = 0; i < 4; i++) { const x = 850 + i * 52, y = GY - 123 - i * 4.5, sw = Math.sin(lt * 3 + i) * 6; shape([[x, y], [x + 30, y + 1], [x + 30 + sw, y + 40], [x + sw, y + 38]], { lw: 1, id: 8970 + i, fill: PAPER2, h: i % 2 ? [0.5, 3, 0.4] : undefined }); }
  } else if (k === 3) { // inhabitants, satisfied with eleven windows
    house({ x: 360, w: 480, h: 250, floors: 3, cols: 4, roof: 'gable', rh: 100, door: { w: 40, h: 60 }, ww: 34, wh: 40, blankWin: 11, id: 9050, s: 'eleven windows', plate: 'An inhabitant.', psz: 7, py: 40, pdx: 46 });
    const ws = (() => { SILENT = true; const r = house({ x: 360, w: 480, h: 250, floors: 3, cols: 4, roof: 'gable', rh: 100, door: { w: 40, h: 60 }, ww: 34, wh: 40, id: 9050 }); SILENT = false; return r; })();
    const r = ws[11]; X.save(); X.setLineDash([5, 4]); X.lineWidth = 1.6; X.strokeStyle = RED; X.strokeRect(r[0], r[1], r[2], r[3]); X.restore();
    letterFigure(920, GY + 30, 0.62, 1, 'an inhabitant', 9100, { eyes: true, look: -1, trowel: -1.6 + 0.5 * Math.sin(lt * 5) });
  } else if (k === 4) { // a house that revises its own description
    const D = ['A house.', 'A larger house.', 'A house that is larger than that.', 'A house, revised.', 'A house that revises its own description.'];
    const i = Math.floor(lt / 1.4) % D.length, sc = [1, 1.2, 1.38, 0.9, 1.1][i];
    house({ x: 640 - 150 * sc, w: 300 * sc, h: 170 * sc, floors: 2, cols: 3, roof: 'gable', rh: 90 * sc, door: { w: 40 }, id: 9200 + i * 7, s: D[i] });
    brass(640, GY + 70, D[i], 11);
  } else if (k === 5) { // machines that build architects
    edifier(480, GY, 1.1, { id: 9300, up: 0.9, paper: 'An architect.', say: 0.3 + 0.3 * Math.sin(lt * 3), plate: false });
    letterFigure(740, GY, 0.95, clamp((lt % 6) / 3), 'an architect', 9350, { eyes: (lt % 6) > 3, look: -1 });
    brass(480, GY + 40, 'An architect.', 8);
  }
}
const GEN_CAP = ['Gen. I. A facade.', 'Gen. II. An interior.', 'Gen. III. A house that works.', 'Gen. IV. An inhabitant.', 'Gen. V. A house revising its description.', 'Gen. VI. An architect.'];
function sceneCaryatid(sh, lt) {
  const st = cue(sh, 'stone'), su = st ? U(lt, st.at, st.to) : 0;
  const c = camFor(lt, [[0, ON(640, 360, 1.0)], [st.at - 0.2, ON(780, 330, 1.45), 2.2], [st.to, ON(640, 360, 1.0), 1.6]]);
  cam(c, () => {
    sky(GY - 20, 0.18); groundBand(GY);
    shape(R(260, GY - 40, 760, 40), { lw: 1.8, id: 9500, fill: PAPER2, h: [0, 3, 0.5] });
    shape(R(230, 120, 820, 60), { lw: 2, id: 9501, fill: PAPER2, h: [0, 3.4, 0.4] }); shape([[210, 120], [1070, 120], [640, 40]], { lw: 1.8, id: 9502, fill: PAPER2, h: [0, 3.6, 0.4] });
    for (const x of [300, 980]) shape(R(x - 26, 180, 52, GY - 220), { lw: 1.6, id: 9510 + x, fill: PAPER2, h: [Math.PI / 2, 3.4, 0.5] });
    // the older features, already stone
    for (const [x, id] of [[470, 9600], [610, 9640]]) { person({ x, y: GY - 40, s: 0.86, kind: 'man', hat: 'none', id, armF: [3.0, 3.1], armB: [-3.0, -3.1], closed: true, dark: true }); X.save(); path(R(x - 40, 180, 80, GY - 220)); X.clip(); hatch(Math.PI / 2, 2.2, 0.5, [x - 40, 180, x + 40, GY]); X.restore(); }
    // the newest: a person, and the stone climbing from the feet
    const x = 790, top = GY - 40 - (GY - 220) * su;
    person({ x, y: GY - 40, s: 0.86, kind: 'arch', id: 9700, armF: [3.0, 3.1], armB: [-3.0, -3.1], look: 0.3 * Math.sin(lt * 0.7), closed: su > 0.95 });
    X.save(); path(R(x - 44, top, 88, GY - 40 - top)); X.clip(); hatch(Math.PI / 2, 2.2, 0.5, [x - 44, top, x + 44, GY]); X.restore();
    brass(790, GY - 20, 'A person, load-bearing.', 7);
  });
}

/* ---- Fig. 19: the last human architect, as author and as material ---- */
function sceneDiptych(sh, lt) {
  const sw = cue(sh, 'swap');
  const c = camFor(lt, [[0, ON(640, 360, 1.0)], [sw.at - 2.6, ON(330, 380, 1.6), 1.6], [sw.at, ON(960, 380, 1.6), 1.6], [sw.to + 2.0, ON(640, 360, 1.0), 1.4]]);
  cam(c, () => {
    sky(GY - 20, 0.16); groundBand(GY);
    // (a) the architect at his drafting table, drawing the building
    shape([[90, GY - 150], [420, GY - 190], [430, GY - 160], [100, GY - 120]], { lw: 1.6, id: 9800, fill: '#fbf6e6' }); line([150, GY - 128], [150, GY], 3, 9801, 0.1); line([380, GY - 170], [380, GY], 3, 9802, 0.1);
    X.save(); X.transform(1, -0.12, 0, 1, 0, 0); X.translate(0, 26); ink([[180, GY - 140], [180, GY - 200], [330, GY - 200], [330, GY - 140]], 0.9, 9803, 0.2); ink([[170, GY - 200], [255, GY - 240], [340, GY - 200]], 0.9, 9804, 0.2); for (const xx of [210, 250, 290]) ink([[xx, GY - 140], [xx, GY - 196]], 0.7, 9805 + xx, 0.1); X.restore();
    person({ x: 520, y: GY, s: 0.95, kind: 'arch', id: 9850, f: -1, armF: [1.7 + 0.1 * Math.sin(lt * 5), 2.1], prop: PROP.tsquare(), look: 0.5, lookY: 1 });
    tx('(a)', 320, GY + 60, FONTI(22), { align: 'center' });
    line([640, 30], [640, 700], 1.6, 9860, 0.3);
    // (b) the same building, built; the architect is its fourth column
    shape(R(700, GY - 30, 520, 30), { lw: 1.6, id: 9870, fill: PAPER2, h: [0, 3, 0.5] }); shape(R(690, 180, 540, 54), { lw: 1.8, id: 9871, fill: PAPER2, h: [0, 3.4, 0.4] }); shape([[680, 180], [1240, 180], [960, 90]], { lw: 1.8, id: 9872, fill: PAPER2, h: [0, 3.6, 0.4] });
    for (const x of [740, 850, 1180]) shape(R(x - 22, 234, 44, GY - 264), { lw: 1.6, id: 9880 + x, fill: PAPER2, h: [Math.PI / 2, 3.2, 0.5] });
    person({ x: 1070, y: GY - 30, s: 1.05, kind: 'arch', id: 9890, armF: [3.0, 3.1], armB: [-3.0, -3.1], closed: true });
    X.save(); path(R(1020, 234, 100, GY - 264)); X.clip(); X.globalAlpha = 0.8; hatch(Math.PI / 2, 2.6, 0.5, [1020, 234, 1120, GY]); X.restore();
    brass(960, GY - 15, 'A building by its architect.', 7);
    tx('(b)', 960, GY + 60, FONTI(22), { align: 'center' });
  });
}

/* ================= the spreads ================= */
const GP = [[676, 104], [940, 104], [676, 300], [940, 300], [676, 496], [940, 496]].map(([x, y]) => ({ x, y, w: 236 }));
const SP = {
  preface: { head: 'PREFACE', sub: 0, big: 1, folio: ['vii', 'viii'], plates: [{ x: 688, y: 150, w: 472, cap: 'Fig. 1. The City of Described Houses, in the eleventh year of its reviews.', draw: sceneCity }] },
  prize: { head: '§ 1. The Royal Prize', folio: ['ix', 'x'], plates: [{ x: 688, y: 150, w: 472, cap: 'Fig. 2. The Edifier receives the instruction for a modest dwelling suitable for a philosopher.', draw: sceneDwelling }] },
  astro: { head: '§ 2. Tenants', folio: ['xi', 'xii'], plates: [{ x: 720, y: 96, w: 408, cap: 'Fig. 3. The astronomer’s house, from outside.', draw: sceneAstroOut }, { x: 720, y: 392, w: 408, cap: 'Fig. 4. The same wall, from inside.', draw: sceneAstroIn }] },
  stair: { head: '§ 3. Elevation', folio: ['xiii', 'xiv'], plates: [{ x: 720, y: 96, w: 408, cap: 'Fig. 5. A dining room, before and during a meal.', draw: sceneDining }, { x: 720, y: 392, w: 408, cap: 'Fig. 6. A staircase in the conventional manner.', draw: sceneStair }] },
  ministry: { head: '§ 4. The Interpretation of Inhabitants', folio: ['xv', 'xvi'], plates: [{ x: 688, y: 150, w: 472, cap: 'Fig. 7. The Ministry of Constructive Semantics receives the Interpreting Machine.', draw: sceneMinistry }] },
  discipline: { head: '§ 5. The Founding of Edifiction', folio: ['xvii', 'xviii'], plates: [{ x: 720, y: 96, w: 408, cap: 'Fig. 8. A house of the primitive period, showing its uses.', draw: sceneUses }, { x: 720, y: 392, w: 408, cap: 'Fig. 9. The Institute of Operative Description.', draw: sceneInstitute }, { x: 0, y: 0, w: 216, left: true, cap: 'Fig. 6, repeated.', draw: (sh, lt) => sceneStairSit(sh, lt) }] },
  schools: { head: '§ 6. The Schools', folio: ['xix', 'xx'], plates: [{ x: 688, y: 150, w: 472, cap: 'Fig. 10. Five houses from the same two words, on five equal plots.', draw: sceneSchools }] },
  builder: { head: '§ 7. The Builder', folio: ['xxi', 'xxii'], plates: [{ x: 688, y: 150, w: 472, cap: 'Fig. 11. The manufacture of a builder.', draw: sceneBuilder }] },
  gens: { head: '§ 8. The Generations', folio: ['xxiii', null], plates: [...GP.map((p, k) => ({ ...p, cap: 'Fig. ' + (12 + k) + '. ' + GEN_CAP[k], draw: (sh, lt) => { const g = cues(sh, 'gen')[k]; genScene(k, Math.max(0, lt - (g ? g.at : 0) + 3), 1); } })), { x: 0, y: 0, w: 420, left: true, cap: 'Fig. 18. A person, load-bearing.', draw: sceneCaryatid }] },
  close: { head: '§ 9. Authors and Materials', folio: ['xxv', 'xxvi'], plates: [{ x: 688, y: 150, w: 472, cap: 'Fig. 19. The last human architect: (a) as author; (b) as material.', draw: sceneDiptych }] },
};
function prepSpreads() {
  for (const sh of T.shots) {
    const sp = SP[sh.shot]; if (!sp) continue;
    const rows = prepColumn(sh, sp.head, { sub: sp.sub, big: sp.big, y0: sp.sub === 0 ? 132 : 150 });
    const end = rows.length ? rows[rows.length - 1].y : 200;
    for (const p of sp.plates) if (p.left) { p.y = Math.max(end + 22, 690 - PH(p) - 64); p.x = p.w > 300 ? COL.x + (COL.w - p.w) / 2 : COL.x + COL.w - p.w; }
  }
}
function drawLeft(sh, lt, sp) {
  if (!sp) return;
  pageSheet(LP, 0);
  tx('UNIVERSAL ENCYCLOPEDIA OF CONSTRUCTIVE SEMANTICS', LP.x + 42, LP.y + 34, MONO(9), { col: GREY }); tx('VOL. VII', LP.x + LP.w - 30, LP.y + 34, MONO(9), { col: GREY, align: 'right' });
  line([LP.x + 42, LP.y + 44], [LP.x + LP.w - 30, LP.y + 44], 0.6, 9201, 0.2, GREY);
  drawColumn(sh.shot);
  for (const p of sp.plates) if (p.left) plate(p, () => p.draw(sh, lt), p.cap);
  if (sp.folio && sp.folio[0] && !sp.plates.some((p) => p.left && p.y + PH(p) > 600)) tx(sp.folio[0], LP.x + LP.w / 2, LP.y + LP.h - 16, MONO(9), { col: GREY, align: 'center' });
}
function drawRight(sh, lt, sp) {
  if (!sp) return;
  pageSheet(RP, 1);
  tx('PREFACE', RP.x + 30, RP.y + 34, MONO(9), { col: GREY }); tx('VOL. VII', RP.x + RP.w - 42, RP.y + 34, MONO(9), { col: GREY, align: 'right' });
  line([RP.x + 30, RP.y + 44], [RP.x + RP.w - 42, RP.y + 44], 0.6, 9202, 0.2, GREY);
  for (const p of sp.plates) if (!p.left) plate(p, () => p.draw(sh, lt), p.cap);
  if (sp.folio && sp.folio[1] && sp.plates.length < 3) tx(sp.folio[1], RP.x + RP.w / 2, RP.y + RP.h - 16, MONO(9), { col: GREY, align: 'center' });
}
/* the closed volume */
function coverFace(pg) {
  shape(R(pg.x - 4, pg.y - 4, pg.w + 8, pg.h + 8), { lw: 2, id: 9950, fill: '#5a4d40', h: [[0.75, 5, 0.5], [-0.75, 5, 0.35]] });
  ink([[pg.x + 22, pg.y + 22], [pg.x + pg.w - 22, pg.y + 22], [pg.x + pg.w - 22, pg.y + pg.h - 22], [pg.x + 22, pg.y + pg.h - 22]], 1.4, 9951, 0.3, P.paper, true);
  const cx = pg.x + pg.w / 2; shape(R(cx - 170, pg.y + 120, 340, 300), { lw: 1.8, id: 9952, fill: PAPER2 });
  tx('UNIVERSAL ENCYCLOPEDIA', cx, pg.y + 168, `${22}px ${FONT}`, { align: 'center' }); tx('OF', cx, pg.y + 196, FONTI(16), { align: 'center' }); tx('CONSTRUCTIVE SEMANTICS', cx, pg.y + 226, `${22}px ${FONT}`, { align: 'center' });
  line([cx - 60, pg.y + 252], [cx + 60, pg.y + 252], 1, 9953, 0.2); tx('VOLUME', cx, pg.y + 290, MONO(13), { align: 'center' }); tx('VII', cx, pg.y + 350, `${56}px ${FONT}`, { align: 'center' });
  tx('with a preface on the history of Edifiction', cx, pg.y + 398, FONTI(14), { align: 'center' });
}
function tableTop() { X.fillStyle = P.paper; X.fillRect(-1000, -1000, 3400, 2800); X.fillStyle = P.ink; for (let y = -600, k = 0; y < 1400; y += 4.4, k++) { X.globalAlpha = 0.16; X.fillRect(-1000, y, 3400, 0.6 + 0.3 * hash(k, 2)); } X.globalAlpha = 1; }

/* the frame of a spread shot: the turn, the camera on the page, entering the plates */
function prevShotOf(sh) { const i = T.shots.indexOf(sh); return i > 0 ? T.shots[i - 1] : null; }
function spreadPlan(sh, extra = []) {
  const sp = SP[sh.shot], plan = [[0, PAGE]], tn = cue(sh, 'turn');
  const first = sh.cues.filter((c) => c.k === 'enter' || c.k === 'gen')[0];
  if (tn && first && first.at - tn.at > 4.0) plan.push([tn.at + 1.1, ON(357, 300, 1.32), 2.2]);
  for (const c of sh.cues) {
    if (c.k === 'enter') plan.push([c.at, IN(sp.plates[c.p]), c.to - c.at]);
    if (c.k === 'hop') { const a = sp.plates[plan.lastP ?? 0], b = sp.plates[c.p], h = (c.to - c.at) / 2; plan.push([c.at, ON((a.x + a.w / 2 + b.x + b.w / 2) / 2, (a.y + PH(a) / 2 + b.y + PH(b) / 2) / 2, 1.45), h]); plan.push([c.at + h, IN(b), h]); }
    if (c.k === 'exit') plan.push([c.at, PAGE, c.to - c.at]);
    if (c.k === 'enter' || c.k === 'hop') plan.lastP = c.p;
  }
  plan.push(...extra); plan.sort((a, b) => a[0] - b[0]);
  return plan;
}
function spreadFrame(sh, lt, c, o = {}) {
  const sp = SP[sh.shot], tn = cue(sh, 'turn'), tu = tn ? U(lt, tn.at, tn.at + 1.0) : 1;
  if (tu >= 1 && !o.shut) for (const p of sp.plates) if (fills(c, p)) { cam(c, () => plate(p, () => p.draw(sh, lt), null)); return; }
  const pv = prevShotOf(sh), psp = pv && SP[pv.shot];
  cam(c, () => {
    tableTop();
    if (tu < 1) {
      if (pv && pv.shot === 'title') { if (tu < 0.5) { shape(R(BK.g, BK.y0 - 6, BK.x1 - BK.g + 10, BK.y1 - BK.y0 + 16), { lw: 1.8, id: 9000, fill: CLOTH }); } else bookUnder(); drawRight(sh, lt, sp); if (tu >= 0.5) drawLeft(sh, lt, sp); turnSheet(tu, () => coverFace(RP), () => drawLeft(sh, lt, sp)); return; }
      bookUnder(); if (tu < 0.5) drawLeft(pv, pv.d - 0.01, psp); else drawLeft(sh, lt, sp); drawRight(sh, lt, sp);
      turnSheet(tu, () => drawRight(pv, pv.d - 0.01, psp), () => drawLeft(sh, lt, sp)); return;
    }
    if (o.shut) { o.shut(); return; }
    bookUnder(); drawLeft(sh, lt, sp); drawRight(sh, lt, sp);
  });
}

/* ================= shots ================= */
SHOTS.title = (lt, sd, sh) => {
  const u = seg(lt, 3.6, 5.0);
  if (u < 1) { X.save(); X.globalAlpha = 1 - u; tableTop(); X.fillStyle = P.paper; X.globalAlpha = (1 - u) * 0.85; X.fillRect(160, 180, 960, 360); X.globalAlpha = 1 - u;
    txt('THE HOUSE THAT LANGUAGE BUILT · I', 640, 248, 13, { mono: true, col: GREY });
    txt('A SHORT HISTORY OF EDIFICTION', 640, 318, 46, {});
    txt('the houses that were too perfect to live in', 640, 378, 22, { italic: true });
    house({ x: 600, w: 80, h: 44, gy: 486, roof: 'pediment', columns: 4, door: { w: 14, h: 24 }, cols: 2, ww: 7, wh: 12, id: 9990, s: 'a house', bsz: 3, plate: 'A house.', psz: 3, py: 8, pdx: 0 });
    X.restore(); }
  if (u > 0) { X.save(); X.globalAlpha = u; cam(PAGE, () => { tableTop(); shape(R(BK.g, BK.y0 - 6, BK.x1 - BK.g + 10, BK.y1 - BK.y0 + 16), { lw: 1.8, id: 9000, fill: CLOTH }); coverFace(RP); }); X.restore(); }
};
SHOTS.preface = (lt, sd, sh) => {
  const L = sh.lines, big = colLine('preface', 1), by = big.length ? (big[0].y + big[big.length - 1].y) / 2 - 6 : 300;
  const sub = colLine('preface', 0), sy = sub.length ? sub[0].y : 150;
  let c = camFor(lt, spreadPlan(sh, [[L[0].t0 - 0.4, ON(357, sy + 30, 1.6), 1.6]]));
  c = withTight(sh, lt, c, 357, by, 2.35);
  spreadFrame(sh, lt, c);
};
for (const n of ['prize', 'astro', 'stair', 'ministry', 'discipline', 'schools', 'builder']) SHOTS[n] = (lt, sd, sh) => spreadFrame(sh, lt, camFor(lt, spreadPlan(sh)));
SHOTS.gens = (lt, sd, sh) => {
  const g = cues(sh, 'gen'), sp = SP.gens;
  const extra = g.map((q) => { const p = sp.plates[q.n]; return [q.at, ON(p.x + p.w / 2, p.y + PH(p) / 2 + 10, 2.75), 1.1]; });
  spreadFrame(sh, lt, camFor(lt, spreadPlan(sh, extra)));
};
SHOTS.close = (lt, sd, sh) => {
  const su = cue(sh, 'shut'), sp = SP.close, u = U(lt, su.at, su.to);
  let c = camFor(lt, spreadPlan(sh, [[su.at - 0.4, ON(500, 364, 1.05), 1.4], [su.to - 0.2, ON(357, 364, 1.12), 1.6]]));
  c = withTight(sh, lt, c, 357, 364, 1.25);
  spreadFrame(sh, lt, c, { shut: lt > su.at ? () => {
    shape(R(BK.x0 - 10, BK.y0 - 6, BK.g - BK.x0 + 10, BK.y1 - BK.y0 + 16), { lw: 1.8, id: 9000, fill: CLOTH });
    if (u < 1) { if (u < 0.5) shape(R(BK.g, BK.y0 - 6, BK.x1 - BK.g + 10, BK.y1 - BK.y0 + 16), { lw: 1.8, id: 9001, fill: CLOTH }); drawLeft(sh, lt, sp); if (u < 0.5) drawRight(sh, lt, sp); turnSheet(u, () => drawRight(sh, lt, sp), () => coverFace(LP)); }
    else coverFace(LP);
  } : null });
};
SHOTS.last = (lt, sd, sh) => {
  const stc = cue(sh, 'stand'), cl = cue(sh, 'climb'), lf = cue(sh, 'lift');
  const su = U(lt, stc.at, stc.to), cu = U(lt, cl.at, cl.to), up = E.io(U(lt, cl.at + 0.7, cl.to));
  const c = camFor(lt, [[0, ON(500, 440, 1.7)], [lf.at, ON(540, 400, 1.85), lf.to - lf.at]]);
  cam(c, () => {
    stairWorld(lt, { red: up < 0.5 });
    if (up >= 0.5 && up < 1) { const tp = [STR.x0 + STR.run * (STR.n - 1), STR.gy - STR.rise * (STR.n - 1)]; X.save(); X.globalAlpha = 1 - (up - 0.5) * 2; line([tp[0], tp[1] - STR.rise], [tp[0] + STR.run + 4, tp[1] - STR.rise], 2.4, 4630, 0.1, RED); X.restore(); }
    shape(R(STR.x0 - 112, GY - 52, 50, 8), { lw: 1.2, id: 4710, fill: PAPER2 }); line([STR.x0 - 108, GY - 44], [STR.x0 - 108, GY], 2, 4711, 0.1); line([STR.x0 - 66, GY - 44], [STR.x0 - 66, GY], 2, 4712, 0.1); line([STR.x0 - 108, GY - 52], [STR.x0 - 112, GY - 120], 2, 4713, 0.1);
    if (su < 0.5) person({ x: STR.x0 - 90, y: GY + 2, s: 0.62, kind: 'woman', id: 4700, sit: true, f: 1, prop: PROP.cane(), look: 0.5, lookY: -1.4 });
    else {
      const fx = lerp(STR.x0 - 76, STR.x0 - 40, E.io(U(lt, stc.to, cl.at))) + up * (STR.run * 0.5 + 40), fy = GY - up * STR.rise;
      person({ x: fx, y: fy, s: 0.62, kind: 'woman', id: 4700, f: 1, prop: PROP.cane(), walk: (lt > stc.to && lt < cl.to) ? 0.6 : 0, ph: lt * 5, look: 0.5, lookY: -1.6, lean: lt < stc.to ? 0.1 : 0 });
    }
  });
};
SHOTS.end = (lt, sd, sh) => {
  tableTop(); X.fillStyle = P.paper; X.globalAlpha = 0.85; X.fillRect(220, 160, 840, 420); X.globalAlpha = 1;
  ink([[300, 210], [980, 210]], 1, 9970, 0.3); ink([[300, 520], [980, 520]], 1, 9971, 0.3);
  txt('THE HOUSE THAT LANGUAGE BUILT', 640, 290, 34, {});
  txt('a fable of Edifiction', 640, 342, 22, { italic: true });
  txt('after notes by Watson Hartsoe', 640, 400, 18, { italic: true });
  txt('in the manner of Stanisław Lem', 640, 432, 18, { italic: true });
  txt('I. A SHORT HISTORY OF EDIFICTION', 640, 488, 12, { mono: true, col: GREY });
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
  const n = sh.shot, fade = n === 'title' ? 1 - seg(lt, 0, 0.7) : n === 'last' ? Math.max(1 - seg(lt, 0, 0.9), seg(lt, sd - 0.6, sd)) : n === 'end' ? Math.max(1 - seg(lt, 0, 0.6), seg(lt, sd - 1.2, sd)) : n === 'close' ? seg(lt, sd - 0.8, sd) : 0;
  if (fade > 0) { X.fillStyle = P.paper; X.globalAlpha = fade; X.fillRect(0, 0, W, H); X.globalAlpha = 1; }
  border();
};
(async () => {
  T = await (await fetch('timing/eh.json')).json();
  await document.fonts.ready; await Promise.all(['IM Fell English', 'IBM Plex Mono'].map((n) => document.fonts.load(`20px "${n}"`))); await document.fonts.load(`italic 20px "IM Fell English"`); await document.fonts.load(`600 20px "IBM Plex Mono"`);
  X = document.getElementById('film').getContext('2d');
  prepSpreads();
  window.__NF = Math.ceil(T.dur * 24); window.__T = T; window.__ready = true;
})();
