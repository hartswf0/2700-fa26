/* The Perfect Description of an Empty Room. Drawing. Film four of THE HOUSE THAT LANGUAGE BUILT, four fables of Edifiction:
   an original fable from Watson Hartsoe's notes, written in the manner of Stanislaw Lem. Same toolkit as the Lem films:
   ink.js (Kingdoms in a Box) plus the head of the Ferrix drawing file, copied below unchanged from its second line on.
   Shared world: the City of Described Houses (brass plates bearing each building's sentence), the Edifier, the Ministry of
   Constructive Semantics. Brick red is used only for the plates' sentences and for what is wrong; in this film the red moves
   from the rebuilt rooms (the door swing, the silent board, the shallow stair) onto the photographs that the rooms now contradict.
   Photographs are halftone prints with deckled edges: each is a luminance function sampled on a 45-degree screen. */
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
const sayAt = (sh, who, lt) => { for (const l of sh.lines) if (l.who === who && lt >= l.t0 && lt < l.t1) return l.env[Math.min(l.env.length - 1, Math.floor((lt - l.t0) * 24))] || 0; return 0; };
const talking = (sh, who, lt) => sh.lines.some((l) => l.who === who && lt >= l.t0 - 0.1 && lt < l.t1 + 0.2);
const cue = (sh, k, i = 0) => sh.cues.filter((c) => c.k === k)[i];
const cues = (sh, k) => sh.cues.filter((c) => c.k === k).sort((a, b) => (a.n || 0) - (b.n || 0) || a.at - b.at);
function cam(c, fn) { X.save(); X.translate(CX, CY); X.scale(c.z, c.z); X.translate(-CX - c.x, -CY - c.y); fn(); X.restore(); }
const ON = (x, y, z) => ({ z, x: x - CX, y: y - CY });
function blendCam(a, b, u) { return { z: lerp(a.z, b.z, u), x: lerp(a.x, b.x, u), y: lerp(a.y, b.y, u) }; }
function camFor(lt, plan, dur = 0.8) { let c = plan[0][1]; for (let i = 1; i < plan.length; i++) { const [t0, cc, dd] = plan[i]; if (lt >= t0) c = blendCam(c, cc, seg(lt, t0, t0 + (dd ?? dur), E.io)); } return c; }
const U = (t, a, b) => clamp((t - a) / Math.max(0.01, b - a));
const pulse = (t, a, d = 0.18) => (t >= a && t < a + d ? Math.sin(Math.PI * (t - a) / d) : 0);
const fulcrum = (sh) => sh.lines.find((l) => l.line);
const tightU = (sh, lt) => { const f = fulcrum(sh); return f ? seg(lt, f.t0 - 0.5, f.t0 + 0.3) * (1 - seg(lt, f.t1 + 0.4, f.t1 + 1.2)) : 0; };
function withTight(sh, lt, c, x, y, z = 2.5) { const u = tightU(sh, lt); return u > 0 ? blendCam(c, ON(x, y, z), E.io(u)) : c; }
const rot = (x, y, a) => { const c = Math.cos(a), s = Math.sin(a); return [x * c - y * s, x * s + y * c]; };
const SHOTS = {};
const LT = (sh, i) => sh.lines[i];

/* ================= this film ================= */
const SEPIA = '#7a6450', PAPER2 = '#f3ecd9', GLASS = '#3a332b';
const MONO = '"IBM Plex Mono","DejaVu Sans Mono",monospace';
function ptxt(s, x, y, size, o = {}) { // left/centre text with explicit baseline, used for diegetic writing
  if (SILENT) return; X.font = `${o.italic ? 'italic ' : ''}${o.bold ? 'bold ' : ''}${size}px ${o.mono ? MONO : FONT}`; X.textAlign = o.align || 'left'; X.textBaseline = o.base || 'alphabetic'; X.fillStyle = o.col || P.ink; X.fillText(s, x, y);
}
function wrap(text, width, font) { X.font = font; const out = []; for (const para of text.split('\n')) { let cur = ''; for (const w of para.split(' ')) { const t = cur ? cur + ' ' + w : w; if (X.measureText(t).width > width && cur) { out.push(cur); cur = w; } else cur = t; } out.push(cur); } return out; }
function polyLen(p) { let s = 0; for (let i = 1; i < p.length; i++) s += Math.hypot(p[i][0] - p[i - 1][0], p[i][1] - p[i - 1][1]); return s; }
function polyAt(p, d) { for (let i = 1; i < p.length; i++) { const l = Math.hypot(p[i][0] - p[i - 1][0], p[i][1] - p[i - 1][1]); if (d <= l || i === p.length - 1) { const u = l ? clamp(d / l) : 0; return [p[i - 1][0] + (p[i][0] - p[i - 1][0]) * u, p[i - 1][1] + (p[i][1] - p[i - 1][1]) * u, Math.atan2(p[i][1] - p[i - 1][1], p[i][0] - p[i - 1][0])]; } d -= l; } return [p[0][0], p[0][1], 0]; }
function polyPart(p, u) { const L = polyLen(p) * u, out = [p[0]]; let d = 0; for (let i = 1; i < p.length; i++) { const l = Math.hypot(p[i][0] - p[i - 1][0], p[i][1] - p[i - 1][1]); if (d + l <= L) { out.push(p[i]); d += l; } else { const v = (L - d) / (l || 1); out.push([p[i - 1][0] + (p[i][0] - p[i - 1][0]) * v, p[i - 1][1] + (p[i][1] - p[i - 1][1]) * v]); break; } } return out; }
function dashed(pts, lw, col, dash = [5, 4]) { if (SILENT) return; X.save(); X.setLineDash(dash); X.beginPath(); pts.forEach(([x, y], i) => (i ? X.lineTo(x, y) : X.moveTo(x, y))); X.lineWidth = lw; X.strokeStyle = col; X.stroke(); X.restore(); }
function soundLines(x, y, a, n, r0, id, col = P.ink, kind = 0) { // small engraved arcs: a sound being made
  for (let i = 0; i < n; i++) { const r = r0 + i * (kind === 1 ? 9 : 6); X.beginPath(); X.arc(x, y, r, a - (kind === 0 ? 0.35 : 0.55), a + (kind === 0 ? 0.35 : 0.55)); X.lineWidth = kind === 1 ? 1.6 : 1.2; X.strokeStyle = col; X.stroke(); }
}

/* ---------- photographs: halftone prints with deckled edges ---------- */
const box = (u, v, a, b, c, d) => u >= a && u <= c && v >= b && v <= d;
const LUM = {
  kitchen(u, v) { // print 31: the kitchen of No. 7 after clearance. empty
    let l = v < 0.68 ? 0.64 + 0.04 * Math.sin(u * 90) : 0.42 + 0.06 * (Math.abs(Math.sin((u - 0.5) / (v - 0.2) * 9)) > 0.93 ? -1 : 0);
    if (v < 0.07) l = 0.5;
    if (box(u, v, 0.36, 0.14, 0.6, 0.5)) { l = 0.95; if (Math.abs(u - 0.48) < 0.008 || Math.abs(v - 0.32) < 0.008) l = 0.2; }
    if (box(u, v, 0.345, 0.125, 0.615, 0.515) && !box(u, v, 0.36, 0.14, 0.6, 0.5)) l = 0.25;
    if (v > 0.69 && v < 0.93) { const a = 0.36 - (v - 0.69) * 0.55, b = 0.6 - (v - 0.69) * 0.15; if (u > a && u < b) l = 0.86; }
    if (box(u, v, 0.72, 0.42, 0.88, 0.7)) l = v < 0.45 ? 0.55 : 0.16; if (box(u, v, 0.78, 0.0, 0.81, 0.42)) l = 0.22;
    if (box(u, v, 0.08, 0.48, 0.28, 0.58)) l = 0.8; if (box(u, v, 0.08, 0.58, 0.28, 0.68)) l = 0.35;
    if (box(u, v, 0.06, 0.28, 0.3, 0.3)) l = 0.15;
    if (u < 0.05) l = 0.18;
    return l;
  },
  room(u, v) { // a front room, empty
    let l = v < 0.7 ? 0.6 + 0.05 * Math.sin(u * 70 + v * 3) : 0.45;
    if (box(u, v, 0.58, 0.16, 0.78, 0.52)) { l = 0.93; if (Math.abs(u - 0.68) < 0.008) l = 0.2; }
    if (box(u, v, 0.1, 0.24, 0.24, 0.7)) l = 0.2;
    if (v > 0.71 && v < 0.94) { const a = 0.5 - (v - 0.7) * 0.9, b = 0.72 - (v - 0.7) * 0.5; if (u > a && u < b) l = 0.84; }
    if (u > 0.82 && v > 0.1 + (1 - (u - 0.82) / 0.18) * 0.6 && v < 0.72 + 0) l = 0.3 + 0.1 * (Math.floor(v * 40) % 2);
    return l;
  },
  stairs(u, v) { const s = Math.floor(u * 12) / 12, top = 0.9 - s * 0.8; let l = v > top ? (Math.floor(u * 12) % 2 ? 0.35 : 0.5) : 0.66 + 0.04 * Math.sin(u * 60); if (box(u, v, 0.08, 0.12, 0.2, 0.36)) l = 0.92; if (v > top && v < top + 0.02) l = 0.85; return l; },
  front(u, v, k = 0) { // a terrace front
    if (v < 0.2) return 0.88 - v * 0.6;
    if (v < 0.3) return 0.24 + 0.08 * (Math.floor(u * 30 + v * 10) % 2);
    if (v > 0.88) return 0.72 - (v - 0.88) * 1.5;
    const hw = 0.5, hu = ((u + k * 0.17) % hw) / hw;
    let l = 0.46 + 0.07 * ((Math.floor(v * 46) + (Math.floor(u * 22 + (Math.floor(v * 46) % 2) * 0.5) % 2)) % 2 ? 1 : -1) * 0.5;
    if (Math.abs(hu) < 0.015) l = 0.3;
    if (box(hu, v, 0.1, 0.6, 0.3, 0.88)) l = 0.16;
    for (const [a, b] of [[0.42, 0.62], [0.7, 0.9]]) if (box(hu, v, a, 0.6, b, 0.8)) l = 0.14 + (hu - a < 0.03 ? 0.5 : 0);
    for (const [a, b] of [[0.14, 0.34], [0.56, 0.76]]) if (box(hu, v, a, 0.36, b, 0.52)) l = 0.15 + (v < 0.39 ? 0.5 : 0);
    return l;
  },
  street(u, v) { // the street in perspective
    const hz = 0.42, dx = (u - 0.5) / Math.max(0.02, Math.abs(v - hz));
    if (v < hz) { const edge = 0.5 - (hz - v) * 1.6 * (u < 0.5 ? 1 : -1); if ((u < 0.5 && u < 0.5 - (hz - v) * 1.4) || (u > 0.5 && u > 0.5 + (hz - v) * 1.4)) return 0.38 + 0.12 * (Math.floor(Math.abs(dx) * 3) % 2); void edge; return 0.86; }
    if (Math.abs(dx) > 1.2) return 0.4 + 0.1 * (Math.floor(Math.abs(dx) * 4) % 2);
    return 0.7 - (v - hz) * 0.4 + (Math.abs(dx) < 0.03 ? -0.3 : 0);
  },
  yard(u, v) { let l = v < 0.5 ? 0.85 : 0.5 + 0.08 * Math.sin(u * 40); if (box(u, v, 0.1, 0.25, 0.9, 0.62)) l = 0.42 + 0.05 * (Math.floor(v * 50) % 2); if (box(u, v, 0.6, 0.35, 0.7, 0.62)) l = 0.15; if (Math.abs(v - 0.2 - Math.sin(u * 3) * 0.02) < 0.006) l = 0.2; return l; },
};
const DOTS = {};
function dotsFor(kind, k, cols, asp) {
  const key = `${kind}|${k}|${cols}|${asp.toFixed(3)}`; if (DOTS[key]) return DOTS[key];
  const g = 1 / cols, out = [], n = Math.ceil(cols * 1.6), c = Math.SQRT1_2;
  for (let i = -n; i <= n; i++) for (let j = -n; j <= n; j++) {
    const a = i * g, b = j * g, u = 0.5 + a * c - b * c, vv = 0.5 * asp + a * c + b * c, v = vv / asp;
    if (u < 0 || u > 1 || v < 0 || v > 1) continue;
    let l = LUM[kind](u, v, k); const dx = u - 0.5, dy = v - 0.5; l = l * (1 - 0.45 * (dx * dx + dy * dy)) + (hash(i * 31 + 7, j) - 0.5) * 0.06;
    const r = g * 0.6 * Math.sqrt(clamp(1 - l)); if (r > g * 0.07) out.push(u, v, r);
  }
  return (DOTS[key] = new Float32Array(out));
}
function deckle(w, h, id, st = 7, amp = 2.6) {
  const p = []; const side = (x0, y0, x1, y1, nx, ny, k) => { const n = Math.max(2, Math.round(Math.hypot(x1 - x0, y1 - y0) / st)); for (let i = 0; i < n; i++) { const u = i / n, j = (hash(id + k, i) - 0.3) * amp; p.push([x0 + (x1 - x0) * u + nx * j, y0 + (y1 - y0) * u + ny * j]); } };
  side(0, 0, w, 0, 0, 1, 1); side(w, 0, w, h, -1, 0, 2); side(w, h, 0, h, 0, -1, 3); side(0, h, 0, 0, 1, 0, 4); return p;
}
/* a print: centre (x,y), width w; o.rot, o.num (archive number), o.cols (screen ruling), o.pin, o.tag (red disagreement tags) */
function print_(x, y, w, kind, id, o = {}) {
  if (SILENT) return;
  const h = w * (o.asp || 0.74), m = w * 0.055, iw = w - 2 * m, ih = h - 2 * m - w * 0.03;
  X.save(); X.translate(x, y); X.rotate(o.rot || 0); X.translate(-w / 2, -h / 2);
  X.save(); X.globalAlpha = 0.18; path(deckle(w, h, id).map(([a, b]) => [a + 3, b + 4])); X.fillStyle = P.ink; X.fill(); X.restore();
  path(deckle(w, h, id)); X.fillStyle = PAPER2; X.fill(); X.lineWidth = 0.7; X.strokeStyle = '#8a7d68'; X.stroke();
  X.save(); X.beginPath(); X.rect(m, m, iw, ih); X.clip(); X.fillStyle = '#ece4cf'; X.fillRect(m, m, iw, ih);
  const d = dotsFor(kind, o.k || 0, o.cols || 44, ih / iw); X.beginPath();
  for (let i = 0; i < d.length; i += 3) { const px = m + d[i] * iw, py = m + d[i + 1] * ih, r = d[i + 2] * iw; X.moveTo(px + r, py); X.arc(px, py, r, 0, 6.2832); }
  X.fillStyle = '#211c17'; X.fill(); X.restore();
  X.lineWidth = 0.6; X.strokeStyle = '#3b342b'; X.strokeRect(m, m, iw, ih);
  if (o.num) ptxt(o.num, m, h - m * 0.45, Math.max(5, w * 0.042), { mono: true, col: '#4a4236' });
  if (o.cap) ptxt(o.cap, w - m, h - m * 0.45, Math.max(5, w * 0.038), { italic: true, align: 'right', col: '#4a4236' });
  if (o.pin !== false) { ball(w / 2, w * 0.035, Math.max(3, w * 0.03), id + 5, PAT.f, 1); }
  X.restore();
}
/* a paper tag pinned beside a print: red when it records a disagreement */
function tag(x, y, text, id, o = {}) {
  if (SILENT) return; const fs = o.fs || 9; X.font = `${fs}px ${MONO}`; const w = X.measureText(text).width + 12, h = fs + 9;
  X.save(); X.translate(x, y); X.rotate(o.rot || 0); X.globalAlpha = o.alpha ?? 1;
  shape(R(0, 0, w, h), { lw: 0.9, id, fill: PAPER2 }); ptxt(text, 6, h - 5.5, fs, { mono: true, col: o.col || P.ink });
  ball(w - 5, 4, 2.2, id + 3, PAT.f, 0.8);
  X.restore(); return w;
}

/* ---------- brass plates: the sentence a building was built from ---------- */
function plate(x, y, w, h, text, id, o = {}) {
  if (SILENT) return;
  X.save(); X.globalAlpha = o.alpha ?? 1;
  shape(R(x, y, w, h), { lw: 1.1, id, fill: '#ddcfa8', h: [0.8, 3.4, 0.22] });
  ink([[x + 2.5, y + 2.5], [x + w - 2.5, y + 2.5], [x + w - 2.5, y + h - 2.5], [x + 2.5, y + h - 2.5]], 0.6, id + 1, 0.15, P.ink, true);
  for (const [a, b] of [[x + 4, y + 4], [x + w - 4, y + 4], [x + 4, y + h - 4], [x + w - 4, y + h - 4]]) { X.beginPath(); X.arc(a, b, 1.1, 0, 6.283); X.fillStyle = P.ink; X.fill(); }
  const fs = o.fs || h * 0.2, lines = wrap(text, w - 14, `${fs}px ${FONT}`);
  const n = o.n ?? 1e9; let left = n;
  lines.forEach((s, i) => { if (left <= 0) return; const sh_ = s.slice(0, left); left -= s.length + 1; ptxt(sh_, x + w / 2, y + h / 2 + (i - (lines.length - 1) / 2) * fs * 1.15 + fs * 0.35, fs, { align: 'center', col: P.red, italic: o.italic }); });
  X.restore();
}
P.red = '#a8432e';

/* ---------- people: elders of Cordwain Street, the archivist ---------- */
function arm2(sx, sy, tx, ty, l1, l2, w, id, bend = 1) {
  let dx = tx - sx, dy = ty - sy, d = Math.hypot(dx, dy); const mx_ = l1 + l2 - 0.5; if (d > mx_) { tx = sx + dx / d * mx_; ty = sy + dy / d * mx_; dx = tx - sx; dy = ty - sy; d = mx_; }
  const a = Math.acos(clamp((l1 * l1 + d * d - l2 * l2) / (2 * l1 * d), -1, 1)), b = Math.atan2(dy, dx) + a * bend;
  const ex = sx + Math.cos(b) * l1, ey = sy + Math.sin(b) * l1;
  cap(sx, sy, ex, ey, w, id); cap(ex, ey, tx, ty, w * 0.86, id + 1); ball(tx, ty, w * 0.55, id + 2, PAT.f, 1.1);
  return [tx, ty];
}
/* person: profile, facing o.f (1 right, -1 left), base at (x,y). o: walk, ph, hunch, hair ('bun','cap','scarf','bald','bob','hat'),
   seated, cane, point (0..1), reach [x,y] world target for the near hand, mouth, look, dark, skirt, glasses, ledger, kneel */
function person(x, y, s, id, o = {}) {
  if (SILENT) return;
  X.save(); X.translate(x, y); X.scale(s * (o.f || 1), s); X.globalAlpha = o.alpha ?? 1;
  const wk = o.walk || 0, ph = o.ph || 0, seated = !!o.seated;
  const hip = seated ? [0, -98] : [0, -112 + Math.abs(Math.sin(ph)) * 2 * wk];
  // legs
  if (seated) {
    for (const k of [0, 1]) { const kx = 44 + k * 4, ky = -98 + k * 2; cap(hip[0] - 4 + k * 6, hip[1], kx, ky, 15, id + 1 + k * 3); cap(kx, ky, kx + 4, -8, 13, id + 2 + k * 3); shape([[kx - 6, -12], [kx + 18, -12], [kx + 20, 0], [kx - 6, 0]], { lw: 1.2, id: id + 3 + k * 3, fill: P.ink }); }
  } else {
    for (const k of [0, 1]) {
      const q = ph + (k ? Math.PI : 0), fx = Math.sin(q) * 17 * wk + (o.cane && !wk ? (k ? 6 : -4) : 0), fy = -Math.max(0, Math.cos(q)) * 7 * wk;
      const kx = (hip[0] + fx) / 2 + 5, ky = (hip[1] + fy) / 2;
      cap(hip[0] - 2 + k * 4, hip[1], kx, ky, 14, id + 1 + k * 3); cap(kx, ky, fx, fy - 8, 12, id + 2 + k * 3);
      shape([[fx - 7, fy - 11], [fx + 13, fy - 9], [fx + 17, fy], [fx - 7, fy]], { lw: 1.1, id: id + 3 + k * 3, fill: P.ink });
    }
  }
  // upper body, leaning forward by hunch about the hip
  X.save(); X.translate(hip[0], hip[1]); X.rotate(o.hunch || 0);
  const br = Math.sin(GT * 1.6 + id) * 0.8;
  // far arm
  if (!o.ledger) cap(-2, -84 + br, -10 + (o.point ? 8 : 0), -40, 11, id + 10); else cap(-2, -84 + br, 14, -52, 11, id + 10);
  // coat / dress
  const hem = o.skirt ? 70 : 34, cw = o.skirt ? 34 : 28;
  const coat = [[-18, -94 + br], [19, -94 + br], [cw + 2, hem - (seated ? 40 : 0)], [-cw, hem - (seated ? 40 : 0)]];
  shape(coat, { lw: 1.6, id: id + 11, h: o.dark ? [[1.75, 2.6, 0.7], [0.3, 3.4, 0.5]] : [1.75, 4.4, 0.55], sh: [[-30, -100], [-2, -100], [-2, 80], [-30, 80]], sh2: [1.6, 2.2, 0.7] });
  line([3, -88 + br], [4, hem - 6 - (seated ? 40 : 0)], 0.8, id + 12, 0.3);
  if (o.ledger) { shape([[8, -66], [40, -70], [42, -30], [10, -26]], { lw: 1.4, id: id + 13, fill: '#d9cfb4', h: [0.2, 3, 0.5] }); }
  // neck and head
  const hx = 6, hy = -110 + br;
  cap(2, -92 + br, hx, hy + 10, 9, id + 14);
  const hr = 18;
  ball(hx, hy, hr, id + 15, PAT.f, 1.6);
  X.save(); circ(hx, hy, hr, id + 15); X.clip(); X.beginPath(); X.arc(hx - 16, hy + 2, 18, 0, 6.283); X.fillStyle = PAT.f; X.fill(); X.restore();
  const hair = o.hair || 'bald';
  if (hair === 'bun' || hair === 'white') { X.beginPath(); X.arc(hx, hy, hr + 1, Math.PI * 0.95, Math.PI * 1.9); X.lineWidth = 3; X.strokeStyle = P.ink; X.stroke(); for (let i = 0; i < 7; i++) { const a = Math.PI * (1.0 + i * 0.12); ink([[hx + Math.cos(a) * (hr - 3), hy + Math.sin(a) * (hr - 3)], [hx + Math.cos(a) * (hr + 2), hy + Math.sin(a) * (hr + 2)]], 0.8, id + 40 + i, 0.2); } if (hair === 'bun') ball(hx - hr + 1, hy - 9, 7, id + 16, PAT.f, 1.2); }
  if (hair === 'cap') { shape([[hx - hr - 1, hy - 4], [hx - hr + 2, hy - hr - 2], [hx + hr - 2, hy - hr - 1], [hx + hr + 12, hy - 5], [hx + hr - 2, hy - 3]], { lw: 1.3, id: id + 17, h: [[0.6, 2.2, 0.7], [-0.6, 2.2, 0.6]] }); }
  if (hair === 'hat') { shape([[hx - hr - 6, hy - 9], [hx + hr + 6, hy - 9], [hx + hr + 4, hy - 12], [hx - hr - 4, hy - 12]], { lw: 1.2, id: id + 18, fill: P.ink }); shape([[hx - hr + 1, hy - 11], [hx + hr - 1, hy - 11], [hx + hr - 3, hy - hr - 10], [hx - hr + 3, hy - hr - 10]], { lw: 1.3, id: id + 19, fill: P.ink }); }
  if (hair === 'scarf') { shape([[hx - hr - 3, hy + 10], [hx - hr - 2, hy - 10], [hx - 4, hy - hr - 3], [hx + hr - 2, hy - hr + 2], [hx + hr - 4, hy - 6], [hx - 4, hy + 2], [hx - 6, hy + 16]], { lw: 1.3, id: id + 20, h: [[0.9, 2.4, 0.7], [-0.9, 3.4, 0.5]] }); }
  if (hair === 'bob') { shape([[hx - hr - 2, hy + 12], [hx - hr - 3, hy - 6], [hx - 6, hy - hr - 3], [hx + hr, hy - hr + 2], [hx + hr + 2, hy - 6], [hx + 4, hy - 9], [hx - 6, hy + 12]], { lw: 1.2, id: id + 21, fill: P.ink }); }
  // face
  const lk = o.look || 0;
  X.fillStyle = P.ink; X.beginPath(); X.arc(hx + 9, hy - 2 + lk * 2, 1.9, 0, 6.283); X.fill();
  if (o.glasses) { X.beginPath(); X.arc(hx + 9, hy - 2, 4.4, 0, 6.283); X.lineWidth = 1; X.strokeStyle = P.ink; X.stroke(); line([hx + 4.6, hy - 2], [hx - 4, hy - 3], 0.8, id + 22, 0.1); }
  if (hair !== 'bob') line([hx + 5, hy - 8], [hx + 13, hy - 8.5], 1.4, id + 23, 0.1);
  line([hx + 15, hy - 3], [hx + 19, hy + 4], 1.3, id + 24, 0.1); line([hx + 19, hy + 4], [hx + 15, hy + 5], 1.1, id + 25, 0.1);
  const mo = o.mouth || 0; if (mo > 0.05) { X.fillStyle = P.ink; X.fillRect(hx + 9, hy + 9, 6, 1.4 + mo * 4); } else line([hx + 9, hy + 10], [hx + 15, hy + 10], 1, id + 26, 0.1);
  if (o.lines !== false) { line([hx + 5, hy + 7], [hx + 7, hy + 12], 0.6, id + 27, 0.1); }
  // near arm
  if (o.reach) {
    const inv = (wx, wy) => { // world -> local (approximate: undo translate/scale/hunch)
      let lx = (wx - x) / (s * (o.f || 1)), ly = (wy - y) / s; lx -= hip[0]; ly -= hip[1]; return rot(lx, ly, -(o.hunch || 0)); };
    const [tx, ty] = inv(o.reach[0], o.reach[1]); arm2(6, -86 + br, tx, ty, 44, 42, 12, id + 30, -1);
  } else if (o.point) {
    const p = o.point; arm2(6, -86 + br, lerp(18, 74, p), lerp(-34, -86, p), 44, 42, 12, id + 30, -1);
  } else if (o.cane) {
    arm2(6, -86 + br, 30, -10 - hip[1] * 0 + 0, 44, 42, 12, id + 30, -1);
  } else if (o.ledger) {
    arm2(6, -86 + br, 34, -36, 44, 42, 12, id + 30, -1);
  } else if (o.cup) {
    arm2(6, -86 + br, 46, -50, 44, 42, 12, id + 30, -1);
  } else {
    arm2(6, -86 + br, 10 + Math.sin(ph) * 10 * wk, -10, 44, 42, 12, id + 30, -1);
  }
  X.restore();
  if (o.cane) { const cx_ = hip[0] + rot(30, -10, o.hunch || 0)[0] + 2, cy_ = hip[1] + rot(30, -10, o.hunch || 0)[1]; line([cx_, cy_ - 4], [cx_ + 8, 0], 2.4, id + 50, 0.2); line([cx_ - 6, cy_ - 6], [cx_ + 2, cy_ - 6], 2.4, id + 51, 0.1); }
  X.restore();
}
/* a plain kitchen chair, side view */
function chair(x, y, f, id) {
  X.save(); X.translate(x, y); X.scale(f, 1);
  shape(R(-26, -66, 56, 7), { lw: 1.4, id, h: [0.1, 2.5, 0.6] });
  for (const lx of [-22, 22]) shape(R(lx, -59, 5, 59), { lw: 1.1, id: id + 1 + (lx > 0 ? 1 : 0), h: [1.57, 2, 0.5] });
  shape(R(-28, -150, 6, 90), { lw: 1.1, id: id + 4, h: [1.57, 2, 0.5] }); for (const yy of [-146, -126, -106]) line([-28, yy], [-10, yy - 2], 1.6, id + 5 + yy, 0.1);
  X.restore();
}

/* ---------- the Edifier ---------- */
/* a tall cabinet: funnel on top, speaker grille, paper slot, brass keyboard at chest height, drawers. base at (x,y).
   o: sheet {lines:[...], n chars shown, gone:Set of word indices removed}, keys (typing 0..1), say (voice env), feed (0..1 photo going in) */
const ED = { w: 118, h: 300 };
function edifier(x, y, s, lt, id, o = {}) {
  if (SILENT) return;
  X.save(); X.translate(x, y); X.scale(s, s);
  const w = ED.w, h = ED.h, hw = w / 2;
  // feet and wheels
  for (const fx of [-hw + 10, hw - 22]) { shape(R(fx, -8, 12, 8), { lw: 1, id: id + fx, fill: P.ink }); }
  // body
  shape(R(-hw, -h, w, h - 8), { lw: 2.2, id, sh: R(hw - 26, -h, 26, h - 8), sh2: [1.57, 2.4, 0.7], h: [1.57, 7, 0.35] });
  ink([[-hw + 6, -h + 6], [hw - 6, -h + 6], [hw - 6, -14], [-hw + 6, -14]], 0.7, id + 1, 0.3, P.ink, true);
  // drawers
  for (let i = 0; i < 3; i++) { const dy = -112 + i * 32; shape(R(-hw + 12, dy, w - 24, 26), { lw: 1.2, id: id + 10 + i }); shape(R(-10, dy + 10, 20, 6), { lw: 1, id: id + 14 + i, fill: '#c9b783', h: [0.7, 1.6, 0.4] }); }
  // keyboard shelf at chest height (brass)
  const ky = -150; shape([[-hw - 14, ky], [hw + 14, ky], [hw + 4, ky - 22], [-hw - 4, ky - 22]], { lw: 1.6, id: id + 20, fill: '#d8c79c', h: [0.8, 2.6, 0.4] });
  const kp = o.keys || 0;
  for (let r = 0; r < 3; r++) for (let c = 0; c < 10 - r; c++) { const kx = -hw - 4 + r * 7 + c * 13, kyy = ky - 18 + r * 6, dn = kp > 0 && hash(c + r * 10, Math.floor(lt * 14)) > 0.75 ? 1.6 : 0; X.beginPath(); X.ellipse(kx + 6, kyy + dn, 4.2, 2.2, 0, 0, 6.283); X.fillStyle = P.paper; X.fill(); X.lineWidth = 0.9; X.strokeStyle = P.ink; X.stroke(); }
  // paper slot and platen
  shape(R(-hw + 14, -196, w - 28, 10), { lw: 1.4, id: id + 30, fill: P.ink });
  cap(-hw + 4, -191, hw - 4, -191, 9, id + 31);
  // speaker grille
  const gy = -240, sv = o.say || 0;
  X.beginPath(); X.arc(0, gy, 26, 0, 6.283); X.fillStyle = P.paper; X.fill(); X.lineWidth = 1.6; X.strokeStyle = P.ink; X.stroke();
  for (let i = 1; i <= 4; i++) { X.beginPath(); X.arc(0, gy, i * 5.2 + sv * 1.2, 0, 6.283); X.lineWidth = 0.9 + sv * 0.6; X.stroke(); }
  X.beginPath(); X.arc(0, gy, 3 + sv * 5, 0, 6.283); X.fillStyle = P.ink; X.fill();
  // funnel
  shape([[-34, -h - 54], [34, -h - 54], [9, -h - 14], [-9, -h - 14]], { lw: 1.8, id: id + 40, sh: [[8, -h - 56], [36, -h - 56], [10, -h - 12], [2, -h - 12]], sh2: [1.2, 2.4, 0.6] });
  shape(R(-9, -h - 14, 18, 14), { lw: 1.4, id: id + 41, h: [1.57, 2.4, 0.6] });
  X.beginPath(); X.ellipse(0, -h - 54, 34, 6, 0, 0, 6.283); X.fillStyle = P.paper; X.fill(); X.lineWidth = 1.6; X.strokeStyle = P.ink; X.stroke();
  // name plate
  plate(-34, -h + 18, 68, 16, 'THE EDIFIER', id + 50, { fs: 7.5 });
  X.restore();
  // the sheet rising from the slot (drawn in world coords so words can leave it)
  if (o.sheet) edSheet(x, y, s, o.sheet);
  if (o.feed !== undefined && o.feed > 0 && o.feed < 1) { const fu = o.feed; const py = y - (h + 120 - fu * 90) * s; X.save(); X.beginPath(); X.rect(x - 60 * s, y - (h + 200) * s, 120 * s, (200 - 40) * s + (fu > 0.5 ? 0 : 0)); X.clip(); print_(x, py, 92 * s, o.feedKind || 'front', id + 60, { pin: false, rot: 0.06 * (1 - fu), cols: 24, num: o.feedNum }); X.restore(); }
}
/* the typed sheet: geometry shared by the paper and the falling words */
function sheetGeom(x, y, s, sheet) {
  const sw = (sheet.w || 104) * s, fs = (sheet.fs || 7) * s, lead = fs * 1.35;
  X.font = `${fs}px ${MONO}`;
  const words = sheet.text.split(' '), lines = []; let cur = [], cw = 0; const sp = X.measureText(' ').width;
  for (let i = 0; i < words.length; i++) { const ww = X.measureText(words[i]).width; if (cur.length && cw + sp + ww > sw - 10 * s) { lines.push(cur); cur = []; cw = 0; } cur.push([i, ww]); cw += (cur.length > 1 ? sp : 0) + ww; }
  if (cur.length) lines.push(cur);
  const sh = lines.length * lead + 12 * s, top = y - 196 * s - sh * (sheet.out ?? 1), x0 = x - sw / 2 + (sheet.dx || 0) * s;
  const pos = []; lines.forEach((ln, li) => { let px = x0 + 6 * s; for (const [i, ww] of ln) { pos[i] = [px, top + 8 * s + (li + 0.8) * lead, ww]; px += ww + sp; } });
  return { sw, sh, top, x0, fs, pos, words };
}
function edSheet(x, y, s, sheet) {
  const g = sheetGeom(x, y, s, sheet);
  X.save(); X.beginPath(); X.rect(g.x0 - 4, g.top - 4, g.sw + 8, y - 196 * s - g.top + 4); X.clip();
  shape(R(g.x0, g.top, g.sw, g.sh), { lw: 1, id: 9001, fill: PAPER2 });
  let n = sheet.n ?? 1e9; X.font = `${g.fs}px ${MONO}`; X.textAlign = 'left'; X.textBaseline = 'alphabetic'; X.fillStyle = P.ink;
  for (let i = 0; i < g.words.length; i++) { if (n <= 0) break; const wd = g.words[i].slice(0, n); n -= g.words[i].length + 1; if (sheet.gone && sheet.gone(i)) continue; X.fillText(wd, g.pos[i][0], g.pos[i][1]); }
  X.restore();
  return g;
}
/* a sentence becoming a building. c = fall cue; targets[i] = polyline for word i; startPos from the sheet geometry */
const FLY = 0.7;
function wordTimes(c) { const n = c.text.split(' ').length, st = (c.to - c.at - FLY) / Math.max(1, n - 1); return (i) => c.at + i * st; }
function fallingWords(c, lt, g, targets, o = {}) {
  if (SILENT || lt < c.at) return;
  const tm = wordTimes(c), words = c.text.split(' '), fade = o.fade ?? 0;
  for (let i = 0; i < words.length; i++) {
    const t0 = tm(i), tl = t0 + FLY, tg = targets[i]; if (lt < t0 || !tg) continue;
    if (lt < tl) {
      const u = (lt - t0) / FLY, [sx, sy] = g.pos[i], mid = polyAt(tg, polyLen(tg) / 2), ex = mid[0], ey = mid[1];
      const cx_ = (sx + ex) / 2, cy_ = Math.min(sy, ey) - 90 - 40 * hash(i, 3), a = E.in(u);
      const px = (1 - a) * (1 - a) * sx + 2 * (1 - a) * a * cx_ + a * a * ex, py = (1 - u) * (1 - u) * sy + 2 * (1 - u) * u * cy_ + u * u * ey;
      let ang = mid[2]; if (ang > Math.PI / 2) ang -= Math.PI; if (ang < -Math.PI / 2) ang += Math.PI;
      X.save(); X.translate(px, py); X.rotate(ang * E.io(u)); ptxt(words[i], 0, 0, lerp(g.fs, o.big || 15, Math.sin(u * Math.PI * 0.5)), { mono: true, align: 'center', base: 'middle' }); X.restore();
    } else {
      const v = U(lt, tl, tl + 0.3);
      brickLine(tg, words[i], v, 1 - fade * 0.93, 7000 + i * 13 + (o.id || 0), o.lw);
    }
  }
}
/* a wall laid in letters: a double line with the word's letters set between, like courses of brick */
function brickLine(p, word, u, alpha, id, lw = 1.6) {
  if (u <= 0) return; const q = polyPart(p, u), Ln = polyLen(q), lettersAlpha = alpha;
  ink(q, lw, id, 0.35);
  if (lettersAlpha > 0.02 && Ln > 4) {
    X.save(); X.globalAlpha = lettersAlpha * 0.95; X.font = `bold 7px ${MONO}`; X.textAlign = 'center'; X.textBaseline = 'middle'; X.fillStyle = P.ink;
    const chars = word.replace(/[.,]/g, '').toUpperCase() || '.'; let k = 0;
    for (let d = 4; d < Ln - 2; d += 6.4) { const [px, py, a] = polyAt(q, d); X.save(); X.translate(px, py); let aa = a; if (aa > Math.PI / 2 || aa < -Math.PI / 2) aa += Math.PI; X.rotate(aa); X.fillText(chars[k % chars.length], 0, -5.5); X.restore(); k++; }
    X.restore();
  }
}

/* ---------- the city of described houses, the Ministry ---------- */
function describedHouse(x, b, w, h, kind, id, o = {}) {
  const roof = [[x - 4, b - h], [x + w / 2, b - h - w * (kind % 3 === 0 ? 0.55 : 0.32)], [x + w + 4, b - h]];
  shape(R(x, b - h, w, h), { lw: 1.2, id, sh: R(x + w * 0.6, b - h, w * 0.4, h), sh2: [1.57, 2.4, 0.5] });
  if (kind % 4 === 1) shape(R(x - 2, b - h - 8, w + 4, 8), { lw: 1, id: id + 1, h: [0, 2.2, 0.6] }); else shape(roof, { lw: 1.2, id: id + 2, h: [-0.9, 2.6, 0.5] });
  const cols = Math.max(1, Math.floor(w / 18)), rows = Math.max(1, Math.floor(h / 26));
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) { if (hash(id + r, c) < 0.2) continue; X.fillStyle = P.ink; X.fillRect(x + 6 + c * (w - 12) / cols, b - h + 8 + r * 24, Math.max(3, (w - 12) / cols - 6), 10); }
  shape(R(x + w * 0.4, b - 8, Math.max(6, w * 0.16), 5), { lw: 0.6, id: id + 3, fill: P.red });
  if (kind % 5 === 2 && o.odd) { shape([[x + w * 0.2, b - h * 0.6], [x + w * 0.2 + 10, b - h * 0.6]], { lw: 1 }); }
}
function skyline(b, x0, x1, id, sc = 1) {
  let x = x0, i = 0;
  while (x < x1) { const w = (30 + 40 * hash(id, i)) * sc, h = (50 + 120 * hash(id + 1, i)) * sc; describedHouse(x, b, w, h, Math.floor(hash(id + 2, i) * 10), id + 10 + i * 7); x += w + (2 + 10 * hash(id + 3, i)) * sc; i++; }
}
function ministry(x, b, s, id) {
  X.save(); X.translate(x, b); X.scale(s, s);
  for (let i = 0; i < 4; i++) shape(R(-230 + i * 8, -12 * (i + 1), 460 - i * 16, 12), { lw: 1.3, id: id + i, h: [0.05, 3, 0.5] });
  const top = -300; shape(R(-200, top, 400, 252), { lw: 1.8, id: id + 5, h: [0, 5, 0.35] });
  for (let i = 0; i < 6; i++) { const cx_ = -170 + i * 68; shape(R(cx_ - 13, top + 46, 26, 206), { lw: 1.4, id: id + 10 + i, fill: P.paper, sh: R(cx_ + 3, top + 46, 10, 206), sh2: [1.57, 2, 0.7] }); for (let k = -1; k <= 1; k++) line([cx_ + k * 6, top + 52], [cx_ + k * 6, top + 246], 0.6, id + 20 + i * 3 + k, 0.2); shape(R(cx_ - 18, top + 36, 36, 10), { lw: 1.2, id: id + 30 + i }); shape(R(cx_ - 17, top + 252, 34, 0.1), { lw: 1 }); }
  shape(R(-214, top, 428, 36), { lw: 1.6, id: id + 40, fill: P.paper });
  txt('MINISTRY OF CONSTRUCTIVE SEMANTICS', 0, top + 19, 19, {});
  shape([[-224, top], [224, top], [0, top - 92]], { lw: 1.8, id: id + 41, fill: P.paper, h: [0, 4, 0.35] });
  shape([[-180, top - 8], [180, top - 8], [0, top - 78]], { lw: 1, id: id + 42, fill: P.paper });
  ball(0, top - 38, 14, id + 43, PAT.m, 1.4);
  // the door, and the motto cut over it
  shape(R(-34, -152, 68, 104), { lw: 1.6, id: id + 50, fill: P.ink });
  shape(R(-150, -186, 300, 26), { lw: 1.2, id: id + 51, fill: P.paper });
  txt('EVERYTHING THAT CAN BE SAID CAN BE BUILT', 0, -172, 11.5, {});
  X.restore();
}

/* ---------- Cordwain Street: terrace fronts ---------- */
const STREET_B = 600, HW = 164, WALLH = 190, ROOFH = 54;
const houseX = (k) => -420 + (k - 1) * (HW + 2);       // No. k, left edge
function houseParts(x0, b) {
  const w = HW, top = b - WALLH;
  return {
    w, top,
    door: [x0 + 14, b - 92, 34, 84], fan: [x0 + 14, b - 104, 34, 10], step: [x0 + 8, b - 8, 46, 8],
    low: [[x0 + 64, b - 80, 38, 52], [x0 + 116, b - 80, 38, 52]], up: [[x0 + 20, top + 22, 38, 50], [x0 + 104, top + 22, 38, 50]],
    roof: [[x0 - 2, top], [x0 + 6, top - ROOFH], [x0 + w - 6, top - ROOFH], [x0 + w + 2, top]], chim: [x0 + w - 44, top - ROOFH - 34, 20, 34],
    plateR: [x0 + 52, b - 64, 10, 6],
  };
}
const rectPoly = ([x, y, w, h]) => [[x, y], [x + w, y], [x + w, y + h], [x, y + h], [x, y]];
function houseSegs(k) { // 22 polylines, one for each word of the No. 7 sentence
  const x0 = houseX(k), b = STREET_B, q = houseParts(x0, b), w = HW, top = q.top;
  const [dx, dy, dw, dh] = q.door, [cx_, cy_, cw, ch] = q.chim;
  return [
    [[x0 - 12, b], [x0 + w / 2, b]], [[x0 + w / 2, b], [x0 + w + 12, b]],
    [[x0, b], [x0, top]], [[x0 + w, b], [x0 + w, top]], [[x0, b - 98], [x0 + w, b - 98]], [[x0 - 2, top], [x0 + w + 2, top]],
    [[dx, dy + dh], [dx, dy]], [[dx, dy], [dx + dw, dy]], [[dx + dw, dy], [dx + dw, dy + dh]], [[dx - 2, dy + dh], [dx + dw + 2, dy + dh]],
    rectPoly(q.fan), rectPoly(q.step), [[dx + dw / 2, dy + 6], [dx + dw / 2, dy + dh - 6]],
    rectPoly(q.low[0]), rectPoly(q.low[1]), [[q.low[0][0] - 3, b - 26], [q.low[1][0] + 41, b - 26]],
    rectPoly(q.up[0]), rectPoly(q.up[1]),
    [q.roof[0], q.roof[1]], [q.roof[1], q.roof[2], q.roof[3]],
    [[cx_, top - ROOFH], [cx_, cy_], [cx_ + cw, cy_]], [[cx_ + cw, cy_], [cx_ + cw, top - ROOFH], [cx_ + 4, cy_ - 8], [cx_ + 8, cy_]],
  ];
}
/* the finished front. o.u 0..1 fades the drawing in; o.grow raises it from the ground; o.plate shows its sentence */
function houseFront(k, id, o = {}) {
  if (SILENT) return;
  const x0 = houseX(k), b = STREET_B, q = houseParts(x0, b), w = HW, top = q.top, g = o.grow ?? 1;
  if (g <= 0) return;
  X.save();
  if (g < 1) { X.beginPath(); X.rect(x0 - 20, b - (WALLH + ROOFH + 50) * g, w + 40, (WALLH + ROOFH + 50) * g + 2); X.clip(); X.translate(0, (1 - g) * 30); }
  X.globalAlpha = o.u ?? 1;
  // brick: courses and staggered joints
  shape(R(x0, top, w, WALLH), { lw: 1.6, id, fill: P.paper });
  X.save(); path(R(x0, top, w, WALLH)); X.clip(); X.beginPath();
  for (let r = 0; r * 6 < WALLH; r++) { const yy = top + r * 6; X.moveTo(x0, yy); X.lineTo(x0 + w, yy); for (let c = (r % 2) * 7; c < w; c += 14) { X.moveTo(x0 + c, yy); X.lineTo(x0 + c, yy + 6); } }
  X.lineWidth = 0.45; X.strokeStyle = 'rgba(28,24,20,.75)'; X.stroke();
  hatch(1.57, 2.4, 0.5, [x0 + w - 18, top, x0 + w, b]); X.restore();
  shape(q.roof, { lw: 1.6, id: id + 1, h: [[0, 3.2, 0.7], [1.2, 6, 0.4]] });
  shape(R(...q.chim), { lw: 1.4, id: id + 2, h: [1.57, 2.2, 0.6] }); shape(R(q.chim[0] - 3, q.chim[1] - 5, q.chim[2] + 6, 5), { lw: 1.1, id: id + 3, fill: P.ink });
  line([x0, b - 98], [x0 + w, b - 98], 2.2, id + 4, 0.2);
  for (const r of [...q.low, ...q.up]) { shape(R(r[0] - 3, r[1] - 3, r[2] + 6, r[3] + 6), { lw: 1.2, id: id + 5 + r[0], fill: P.paper }); shape(R(...r), { lw: 1.2, id: id + 6 + r[0], fill: GLASS }); line([r[0] + r[2] / 2, r[1]], [r[0] + r[2] / 2, r[1] + r[3]], 2, id + 7 + r[0], 0.1, P.paper); line([r[0], r[1] + r[3] / 2], [r[0] + r[2], r[1] + r[3] / 2], 2, id + 8 + r[0], 0.1, P.paper); shape(R(r[0] - 5, r[1] + r[3] + 2, r[2] + 10, 4), { lw: 1, id: id + 9 + r[0], fill: P.paper }); }
  shape(R(...q.door), { lw: 1.6, id: id + 20, fill: P.paper, h: [1.57, 3, 0.5] });
  for (const [px, py] of [[q.door[0] + 5, q.door[1] + 6], [q.door[0] + 19, q.door[1] + 6], [q.door[0] + 5, q.door[1] + 46], [q.door[0] + 19, q.door[1] + 46]]) shape(R(px, py, 10, 34), { lw: 0.9, id: id + 21 + px, fill: P.paper });
  ball(q.door[0] + 28, q.door[1] + 46, 2.4, id + 25, PAT.f, 0.8);
  shape(R(...q.fan), { lw: 1.2, id: id + 26, fill: GLASS }); shape(R(...q.step), { lw: 1.2, id: id + 27, h: [0, 2.2, 0.6] });
  txt(String(k), q.door[0] + 17, q.door[1] - 4 - 12, 7, {});
  X.restore();
  if (o.plate) plate(x0 + 64, b - 23, 92, 20, o.plate, id + 30, { fs: 3.7, alpha: o.u ?? 1 });
}
function pavement(x0, x1, b, id) {
  shape(R(x0, b, x1 - x0, 26), { lw: 1.4, id, fill: P.paper }); for (let x = x0; x < x1; x += 46) line([x, b], [x - 6, b + 26], 0.7, id + x, 0.3);
  shape(R(x0, b + 26, x1 - x0, 8), { lw: 1.2, id: id + 1, h: [0, 2.2, 0.6] });
  X.save(); X.globalAlpha = 0.5; for (let y = b + 40; y < b + 160; y += 5) line([x0, y], [x1, y + 1], 0.5, id + y, 0.6); X.restore();
}
function sky(y0, y1, x0, x1) { X.save(); X.globalAlpha = 0.28; for (let y = y0; y < y1; y += 5) { X.fillStyle = P.ink; X.fillRect(x0, y, x1 - x0, 0.5 + 0.7 * clamp((y - y0) / (y1 - y0))); } X.restore(); }

/* ---------- the Bureau's board ---------- */
const BOARD = { x: 150, y: 70, w: 980, h: 560 };
const PRINTS = [
  { kind: 'front', k: 0, num: 'BR 34/014', cap: 'No. 7, front', x: 290, y: 190, w: 200 },
  { kind: 'front', k: 2, num: 'BR 34/003', cap: 'Nos. 2 and 3', x: 520, y: 175, w: 190 },
  { kind: 'street', k: 0, num: 'BR 34/009', cap: 'looking east', x: 760, y: 195, w: 200 },
  { kind: 'front', k: 1, num: 'BR 34/018', cap: 'No. 8, front', x: 990, y: 180, w: 190 },
  { kind: 'room', k: 0, num: 'BR 34/022', cap: 'No. 7, front room', x: 300, y: 400, w: 210 },
  { kind: 'kitchen', k: 0, num: 'BR 34/031', cap: 'No. 7, kitchen', x: 540, y: 410, w: 215 },
  { kind: 'stairs', k: 0, num: 'BR 34/027', cap: 'No. 7, stairs', x: 775, y: 395, w: 190 },
  { kind: 'yard', k: 0, num: 'BR 34/036', cap: 'yards, rear', x: 995, y: 410, w: 195 },
  { kind: 'room', k: 1, num: 'BR 34/012', cap: 'No. 6, front room', x: 300, y: 575, w: 170 },
  { kind: 'kitchen', k: 1, num: 'BR 34/040', cap: 'No. 3, kitchen', x: 510, y: 585, w: 170 },
  { kind: 'front', k: 3, num: 'BR 34/005', cap: 'No. 4, front', x: 760, y: 580, w: 180 },
  { kind: 'street', k: 1, num: 'BR 34/041', cap: 'looking west', x: 985, y: 585, w: 170 },
];
PRINTS.forEach((p, i) => { p.rot = (hash(i, 77) - 0.5) * 0.06; p.id = 4000 + i * 30; });
const DISAGREE = [[4, 'DOOR: HUNG ON THE OTHER SIDE'], [4, 'SUN: AFTER FOUR, TEN PAST'], [6, 'STAIR: STEEPER. FOURTEEN'], [4, 'THIRD BOARD: CREAKS'], [0, 'DOOR SWING: NOT SHOWN']];
function board(lt, o = {}) {
  X.fillStyle = P.paper; X.fillRect(-800, -600, 2900, 1900);
  // wall
  X.save(); X.globalAlpha = 0.5; for (let y = -600; y < 1300; y += 6) line([-800, y], [2100, y + 2], 0.5, 1200 + y, 0.4); X.restore();
  const { x, y, w, h } = BOARD;
  shape(R(x - 16, y - 16, w + 32, h + 32), { lw: 2, id: 1300, fill: '#d6c8a6', h: [[0.7, 3.2, 0.5], [-0.7, 3.2, 0.5]] });
  shape(R(x, y, w, h), { lw: 1.4, id: 1301, fill: '#e2d6b8' });
  X.save(); X.fillStyle = 'rgba(28,24,20,.35)'; for (let i = 0; i < 2600; i++) X.fillRect(x + hash(i, 1) * w, y + hash(i, 2) * h, 1.2, 1.2); X.restore();
  shape(R(x + w / 2 - 170, y + 8, 340, 22), { lw: 1, id: 1302, fill: PAPER2 });
  ptxt('BUREAU OF RECONSTRUCTION.  CORDWAIN STREET, 41 PRINTS', x + w / 2, y + 23, 10, { mono: true, align: 'center' });
  const nShow = o.n ?? PRINTS.length;
  PRINTS.forEach((p, i) => { if (i >= nShow || (o.hide && o.hide(i))) return; const a = o.pinU ? o.pinU(i) : 1; if (a <= 0) return; X.save(); X.globalAlpha = a; print_(p.x, p.y + (1 - a) * -14, p.w, p.kind, p.id, { k: p.k, rot: p.rot, num: p.num, cap: p.cap }); X.restore(); });
  // disagreement tags, in red, with a thread to the print they contradict
  const nt = o.tags || 0;
  DISAGREE.forEach(([pi, s], i) => { const u = clamp(nt - i); if (u <= 0) return; const p = PRINTS[pi], tx = p.x - p.w / 2 + 10 + (i % 2) * 40, ty = p.y + p.w * 0.37 + 14 + i * 22;
    X.save(); X.globalAlpha = u; line([p.x + (i - 2) * 20, p.y], [tx + 8, ty + 8], 0.9, 1400 + i, 0.3, P.red); tag(tx, ty, s, 1410 + i * 5, { col: P.red, rot: (hash(i, 9) - 0.5) * 0.08, fs: 8 }); X.restore(); });
}

/* ---------- interior of No. 7: the front room ---------- */
const RM = { x0: 140, x1: 1140, top: 150, back: 548, floor: 690 };
const VP = [640, 330];
const DOOR = { x: 250, w: 96, top: 346 };
const WIN = { x: 560, y: 236, w: 150, h: 196 };
const STAIR = { x1: 1120, top: 214, n: 14 };
const projFloor = (u, d) => { // u along back wall x, d 0 (back) .. 1 (front) -> screen
  const yb = RM.back, yf = RM.floor; const y = lerp(yb, yf, d); const k = (y - VP[1]) / (yb - VP[1]); return [VP[0] + (u - VP[0]) * k, y]; };
function roomShell(o = {}) {
  X.fillStyle = P.paper; X.fillRect(-600, -600, 2500, 1900);
  // back wall, papered: a faint repeat
  shape(R(RM.x0, RM.top, RM.x1 - RM.x0, RM.back - RM.top), { lw: 1.6, id: 2000, fill: '#efe7d2' });
  X.save(); path(R(RM.x0, RM.top, RM.x1 - RM.x0, RM.back - RM.top)); X.clip();
  for (let x = RM.x0 + 20; x < RM.x1; x += 40) for (let y = RM.top + 20; y < RM.back; y += 44) { const yy = y + ((x / 40) % 2) * 22; X.beginPath(); X.ellipse(x, yy, 3, 5, 0, 0, 6.283); X.lineWidth = 0.6; X.strokeStyle = 'rgba(28,24,20,.45)'; X.stroke(); line([x, yy + 5], [x, yy + 11], 0.5, 2001 + x + y, 0.1, 'rgba(28,24,20,.45)'); }
  hatch(1.57, 3.2, 0.35, [RM.x0, RM.top, RM.x1, RM.back]);
  X.restore();
  // skirting and picture rail
  shape(R(RM.x0, RM.back - 16, RM.x1 - RM.x0, 16), { lw: 1.2, id: 2002, h: [0, 2.6, 0.5] }); line([RM.x0, RM.top + 40], [RM.x1, RM.top + 40], 1.4, 2003, 0.3);
  // side walls, in perspective
  for (const [xe, k] of [[RM.x0, -1], [RM.x1, 1]]) { const fb = projFloor(xe, 1.4), tp = [VP[0] + (xe - VP[0]) * ((fb[1] - VP[1]) / (RM.back - VP[1])), VP[1] + (RM.top - VP[1]) * ((fb[1] - VP[1]) / (RM.back - VP[1]))]; shape([[xe, RM.top], [xe, RM.back], fb, tp], { lw: 1.4, id: 2010 + k, fill: '#e3d9c0', h: [[1.57, 3, 0.45], [0.35 * k, 6, 0.3]] }); }
  // floor and boards
  const fl = [[RM.x0, RM.back], [RM.x1, RM.back], projFloor(RM.x1, 1), projFloor(RM.x0, 1)];
  shape([[RM.x0 - 200, RM.back], [RM.x1 + 200, RM.back], [RM.x1 + 200, RM.floor + 40], [RM.x0 - 200, RM.floor + 40]], { lw: 0, fill: '#e6dcc4' });
  for (let i = -14; i <= 30; i++) { const u = RM.x0 + i * 38; ink([projFloor(u, 0), projFloor(u, 1.1)], 0.9, 2100 + i, 0.3); }
  X.save(); X.beginPath(); X.rect(RM.x0 - 400, RM.back, 2200, 400); X.clip(); hatch(0.04, 4.6, 0.4, [RM.x0 - 400, RM.back, RM.x1 + 400, RM.floor + 40]); X.restore();
  line([RM.x0 - 200, RM.back], [RM.x1 + 200, RM.back], 1.6, 2004, 0.3);
  void fl;
  // ceiling beam and side walls cut
  shape(R(RM.x0 - 200, RM.top - 30, RM.x1 - RM.x0 + 400, 30), { lw: 1.6, id: 2005, h: [[0.7, 2.4, 0.6], [-0.7, 2.4, 0.6]] });
}
const BOARD3 = (k) => [projFloor(DOOR.x + 30 + k * 38, 0.0), projFloor(DOOR.x + 30 + k * 38 + 38, 0.0)]; // not used for picking
function boardPoly(k) { // the k-th board from the door (k = 0,1,2,...), a strip from back to front
  const u0 = RM.x0 + 4 * 38 + k * 38, a = projFloor(u0, 0), b = projFloor(u0 + 38, 0), c = projFloor(u0 + 38, 1), d = projFloor(u0, 1); return [a, b, c, d]; }
function door(o = {}) { // hinge side o.side (-1 left, 1 right), open 0..1, red swing when wrong
  const { x, w, top } = DOOR, b = RM.back;
  shape(R(x - 8, top - 8, w + 16, b - top + 8), { lw: 1.4, id: 2200, fill: P.paper, h: [1.57, 3, 0.4] });
  shape(R(x, top, w, b - top), { lw: 1.2, id: 2201, fill: '#3a332b' });
  const side = o.side || 1, a = (o.open || 0) * 1.25, hx = side > 0 ? x + w : x, fx = hx - side * w * Math.cos(a);
  const ex = (fx - VP[0]) * (Math.sin(a) * 0.32) + 0, dyT = -Math.sin(a) * 10, dyB = Math.sin(a) * 34;
  const leaf = [[hx, top], [fx + ex, top + dyT], [fx + ex, b + dyB], [hx, b]];
  if (o.swing) { const rr = []; for (let i = 0; i <= 16; i++) { const aa = i / 16 * 1.3; const px = hx - side * w * Math.cos(aa); rr.push([px + (px - VP[0]) * Math.sin(aa) * 0.32, b + Math.sin(aa) * 34]); } dashed(rr, 1.6, o.swingCol || P.red, [5, 4]); }
  shape(leaf, { lw: 1.5, id: 2202, fill: P.paper, h: [1.57, 3.4, 0.4] });
  const lw_ = Math.abs(fx + ex - hx);
  if (lw_ > 14) { const kx = lerp(hx, fx + ex, 0.86), ky = lerp(top, b, 0.55) + lerp(0, (dyT + dyB) / 2, 0.86); ball(kx, ky, 3, 2203, PAT.f, 1); }
  // hinges
  const hy = [top + 22, b - 30]; for (const yy of hy) shape(R(hx - 3 + (o.hingeShift || 0), yy, 6, 14), { lw: 1, id: 2204 + yy, fill: P.ink });
}
function windowAndSun(sunU, o = {}) { // sunU 0 = too early (high, short), 1 = after four, 1.3 = ten past
  const { x, y, w, h } = WIN;
  shape(R(x - 10, y - 10, w + 20, h + 20), { lw: 1.4, id: 2300, fill: P.paper, h: [1.57, 3, 0.4] });
  shape(R(x, y, w, h), { lw: 1.4, id: 2301, fill: '#f6f1e4' });
  for (const k of [1, 2]) line([x + k * w / 3, y], [x + k * w / 3, y + h], 2.2, 2302 + k, 0.2); line([x, y + h / 2], [x + w, y + h / 2], 2.2, 2305, 0.2);
  shape(R(x - 16, y + h + 8, w + 32, 8), { lw: 1.2, id: 2306, fill: P.paper });
  if (sunU === null) return;
  // the sun patch on the floor: later sun is lower and longer, reaching across toward the door
  const s = sunU, len = lerp(0.25, 0.85, clamp(s / 1.3)), shift = lerp(40, -260, clamp(s / 1.3)), al = o.alpha ?? 1;
  const a = projFloor(x + shift, 0.08), b = projFloor(x + w + shift * 0.6, 0.08), c = projFloor(x + w + shift * 1.4, 0.08 + len), d = projFloor(x + shift * 1.8, 0.08 + len);
  X.save(); X.globalAlpha = 0.85 * al; path([a, b, c, d]); X.fillStyle = '#f8f3e6'; X.fill(); X.restore();
  X.save(); X.globalAlpha = 0.5 * al; ink([a, b, c, d, a], 0.9, 2310, 0.4); X.restore();
  // shafts in the air
  X.save(); X.globalAlpha = 0.16 * al; for (let i = 0; i < 6; i++) { const u = i / 5; line([x + u * w, y + h], [lerp(d[0], c[0], u), lerp(d[1], c[1], u)], 1, 2320 + i, 0.4); } X.restore();
}
function wallClock(x, y, mins, id) {
  X.beginPath(); X.arc(x, y, 28, 0, 6.283); X.fillStyle = P.paper; X.fill(); X.lineWidth = 2; X.strokeStyle = P.ink; X.stroke();
  X.beginPath(); X.arc(x, y, 24, 0, 6.283); X.lineWidth = 0.7; X.stroke();
  for (let i = 0; i < 12; i++) { const a = i / 12 * 6.283; line([x + Math.sin(a) * 19, y - Math.cos(a) * 19], [x + Math.sin(a) * 23, y - Math.cos(a) * 23], i % 3 ? 0.8 : 1.6, id + i, 0.05); }
  const ha = (4 + mins / 60) / 12 * 6.283, ma = mins / 60 * 6.283;
  line([x, y], [x + Math.sin(ha) * 13, y - Math.cos(ha) * 13], 2.4, id + 20, 0.05); line([x, y], [x + Math.sin(ma) * 20, y - Math.cos(ma) * 20], 1.4, id + 21, 0.05);
  X.beginPath(); X.arc(x, y, 2, 0, 6.283); X.fillStyle = P.ink; X.fill();
  shape(R(x - 4, y + 28, 8, 26), { lw: 1, id: id + 30, h: [1.57, 2, 0.5] }); ball(x, y + 60, 7, id + 31, PAT.m, 1.2);
}
function stairs(k, o = {}) { // k 0 shallow .. 1 steep. 14 steps from the floor at the back wall up to the landing
  const n = STAIR.n, rise = (RM.back - STAIR.top) / n, run = lerp(26, 17, k), x1 = STAIR.x1, x0 = x1 - n * run;
  const pts = [[x0, RM.back]]; for (let i = 0; i < n; i++) { pts.push([x0 + i * run, RM.back - (i + 1) * rise]); pts.push([x0 + (i + 1) * run, RM.back - (i + 1) * rise]); }
  pts.push([x1, RM.back]);
  shape(pts, { lw: 1.6, id: 2400, fill: P.paper, h: [0.9, 3.2, 0.5] });
  for (let i = 0; i < n; i++) shape(R(x0 + i * run - 1, RM.back - (i + 1) * rise, run + 2, 3), { lw: 0.8, id: 2410 + i, fill: P.ink });
  // stringer and rail
  const rc = o.wrong ? P.red : P.ink;
  ink([[x0 - 10, RM.back - 70], [x1, STAIR.top - 70]], 2.4, 2430, 0.3, rc);
  for (let i = 0; i < n; i += 2) line([x0 + i * run + run / 2, RM.back - (i + 1) * rise], [x0 + i * run + run / 2 - 10 * (1 - k), RM.back - (i + 1) * rise - 62], 1, 2440 + i, 0.2, rc);
  shape(R(x0 - 16, RM.back - 92, 10, 92), { lw: 1.4, id: 2460, h: [1.57, 2, 0.6] }); ball(x0 - 11, RM.back - 96, 7, 2461, PAT.m, 1.2);
  shape(R(x1 - 10, STAIR.top - 6, 140, 6), { lw: 1.2, id: 2462, fill: P.ink });
  return { x0, run, rise };
}
const stepPos = (st, i) => [st.x0 + i * st.run + st.run / 2, RM.back - i * st.rise];

/* ---------- the kitchen of No. 7: one as photographed, then two as remembered ---------- */
const KW = { x0: 330, x1: 950, top: 170, back: 540, floor: 680 };
const SHARED = 640;
/* a kitchen drawn in its own frame: x from 0 (outer wall) to 480 (shared wall side), mirrored by f */
const KX = (base, f, x) => base + f * x;
function kitchenShell(base, f, id, o = {}) { // base: x of outer wall, f: +1 opens to the right
  const W_ = 500, top = KW.top, back = KW.back, x0 = Math.min(base, base + f * W_), x1 = Math.max(base, base + f * W_);
  shape(R(x0, top, x1 - x0, back - top), { lw: 1.5, id, fill: '#efe7d2' });
  X.save(); path(R(x0, top, x1 - x0, back - top)); X.clip(); for (let x = x0 + 14; x < x1; x += 28) line([x, top], [x, back], 0.5, id + x, 0.2, 'rgba(28,24,20,.4)'); hatch(1.57, 3.4, 0.3, [x0, top, x1, back]); X.restore();
  shape(R(x0, back - 14, x1 - x0, 14), { lw: 1.1, id: id + 1, h: [0, 2.6, 0.5] });
  shape([[x0, back], [x1, back], [x1 + (f > 0 ? 0 : 0), KW.floor], [x0, KW.floor]], { lw: 1.2, id: id + 2, fill: '#e6dcc4' });
  X.save(); path([[x0, back], [x1, back], [x1, KW.floor], [x0, KW.floor]]); X.clip(); for (let i = 0; i < 16; i++) { const fx = x0 + i * (x1 - x0) / 15; line([fx, back], [fx + (fx - (x0 + x1) / 2) * 0.35, KW.floor], 0.8, id + 30 + i, 0.3); } hatch(0.03, 4.8, 0.4, [x0, back, x1, KW.floor]); X.restore();
  // fixed things, as in the photograph: window, stove and flue, sink, shelf, door
  const win = [KX(base, f, 150), 220, 120 * f, 150];
  return { x0, x1, win, base, f };
}
function kWindow(base, f, id, sunU, al = 1) {
  const x = Math.min(KX(base, f, 140), KX(base, f, 280)), y = 220, w = 140, h = 160;
  shape(R(x - 8, y - 8, w + 16, h + 16), { lw: 1.3, id, fill: P.paper, h: [1.57, 3, 0.4] }); shape(R(x, y, w, h), { lw: 1.3, id: id + 1, fill: '#f6f1e4' });
  line([x + w / 2, y], [x + w / 2, y + h], 2.2, id + 2, 0.2); line([x, y + h / 2], [x + w, y + h / 2], 2.2, id + 3, 0.2);
  shape(R(x - 12, y + h + 6, w + 24, 7), { lw: 1.1, id: id + 4, fill: P.paper });
  if (sunU === null || sunU === undefined) return;
  const s = clamp(sunU), sh = f * lerp(10, 180, s), len = lerp(50, 120, s);
  const a = [x + sh, KW.back + 4], b = [x + w + sh * 1.3, KW.back + 4], c = [x + w + sh * 2.0, KW.back + 4 + len], d = [x + sh * 1.8, KW.back + 4 + len];
  X.save(); X.globalAlpha = 0.85 * al; path([a, b, c, d]); X.fillStyle = '#f8f3e6'; X.fill(); X.globalAlpha = 0.45 * al; ink([a, b, c, d, a], 0.8, id + 9, 0.3); X.restore();
  X.save(); X.globalAlpha = 0.14 * al; for (let i = 0; i < 5; i++) { const u = i / 4; line([x + u * w, y + h], [lerp(d[0], c[0], u), d[1]], 1, id + 10 + i, 0.3); } X.restore();
}
function stove(cx, id) { // a cast-iron range against the back wall with its flue
  shape(R(cx - 56, 420, 112, 120), { lw: 1.6, id, h: [[0.7, 2.4, 0.6], [-0.7, 2.4, 0.6]] });
  shape(R(cx - 62, 412, 124, 10), { lw: 1.3, id: id + 1, fill: P.ink });
  shape(R(cx - 40, 446, 36, 30), { lw: 1.1, id: id + 2, fill: P.paper }); shape(R(cx + 6, 446, 36, 30), { lw: 1.1, id: id + 3, fill: P.paper });
  shape(R(cx - 40, 486, 80, 40), { lw: 1.1, id: id + 4, fill: GLASS });
  shape(R(cx - 10, KW.top, 20, 242), { lw: 1.3, id: id + 5, h: [1.57, 2, 0.6] });
}
function kettleAt(x, y, id, steam = 0, t = 0) {
  shape([[x - 22, y], [x + 22, y], [x + 18, y - 26], [x - 18, y - 26]], { lw: 1.4, id, h: [0.4, 2.4, 0.6], sh: [[x + 4, y + 2], [x + 24, y + 2], [x + 20, y - 28], [x + 4, y - 28]], sh2: [1.3, 2, 0.6] });
  X.beginPath(); X.arc(x, y - 30, 14, Math.PI, 0); X.lineWidth = 2; X.strokeStyle = P.ink; X.stroke();
  ink([[x + 18, y - 14], [x + 34, y - 26], [x + 38, y - 30]], 3, id + 1, 0.2);
  ball(x, y - 30, 3, id + 2, PAT.f, 1);
  if (steam > 0) { X.save(); X.globalAlpha = steam; for (let i = 0; i < 3; i++) { const p = []; for (let k = 0; k <= 10; k++) { const v = k / 10; p.push([x + 40 + i * 4 + Math.sin(v * 7 + t * 4 + i) * 6 * v, y - 32 - v * (40 + i * 12)]); } ink(p, 1, id + 10 + i, 0.4); } X.restore(); }
}
function table(x, y, w, id, o = {}) { // y = floor line where the legs stand
  shape(R(x - w / 2, y - 92, w, 10), { lw: 1.5, id, h: [0.05, 2.4, 0.6] });
  for (const lx of [x - w / 2 + 8, x + w / 2 - 16]) shape(R(lx, y - 82, 8, 82), { lw: 1.1, id: id + lx, h: [1.57, 2, 0.5] });
  if (o.cloth) { shape([[x - w / 2 - 4, y - 92], [x + w / 2 + 4, y - 92], [x + w / 2 + 2, y - 70], [x - w / 2 - 2, y - 70]], { lw: 1, id: id + 9, fill: P.paper }); for (let i = 0; i < 8; i++) line([x - w / 2 + i * w / 7, y - 92], [x - w / 2 + i * w / 7, y - 70], 0.6, id + 10 + i, 0.1); }
  if (o.cup) { shape(R(x + (o.cup || 0) - 7, y - 104, 14, 12), { lw: 1, id: id + 20, fill: P.paper }); X.beginPath(); X.arc(x + o.cup + 9, y - 98, 4, -1.4, 1.4); X.lineWidth = 1; X.strokeStyle = P.ink; X.stroke(); }
}
function cupboard(x, y, id) { // the blue cupboard, drawn in ink; its colour is only in the words
  shape(R(x - 46, y - 210, 92, 210), { lw: 1.7, id, h: [1.57, 4, 0.5], sh: R(x + 20, y - 210, 26, 210), sh2: [1.57, 2, 0.7] });
  shape(R(x - 40, y - 200, 38, 120), { lw: 1.1, id: id + 1, fill: P.paper }); shape(R(x + 2, y - 200, 38, 120), { lw: 1.1, id: id + 2, fill: P.paper });
  for (let i = 0; i < 3; i++) shape(R(x - 40, y - 72 + i * 22, 80, 18), { lw: 1, id: id + 3 + i, fill: P.paper });
  ball(x - 6, y - 140, 2.4, id + 8, PAT.f, 0.8); ball(x + 6, y - 140, 2.4, id + 9, PAT.f, 0.8);
  shape(R(x - 50, y - 218, 100, 8), { lw: 1.2, id: id + 10, fill: P.ink });
}
function kDoor(x, id) { shape(R(x - 4, 312, 82, KW.back - 312), { lw: 1.4, id, fill: P.paper, h: [1.57, 3, 0.4] }); shape(R(x + 4, 320, 66, KW.back - 320), { lw: 1.2, id: id + 1, fill: P.paper }); for (const yy of [328, 430]) shape(R(x + 12, yy, 50, 86), { lw: 0.9, id: id + yy, fill: P.paper }); ball(x + 60, 436, 3, id + 3, PAT.f, 1); }
function sink(x, id) { shape(R(x - 50, 440, 100, 100), { lw: 1.4, id, h: [1.57, 3, 0.5] }); shape(R(x - 56, 428, 112, 14), { lw: 1.3, id: id + 1, fill: P.paper }); line([x + 30, 428], [x + 30, 400], 2.2, id + 2, 0.1); line([x + 30, 400], [x + 14, 400], 2.2, id + 3, 0.1); }
function shelf(x, y, w, id, o = {}) { shape(R(x - w / 2, y, w, 6), { lw: 1.2, id, fill: P.ink }); for (const bx of [x - w / 2 + 8, x + w / 2 - 14]) line([bx, y + 6], [bx + 6, y + 18], 1.4, id + bx, 0.1);
  if (o.tin) { shape(R(x - 30, y - 28, 22, 28), { lw: 1.2, id: id + 20, h: [1.57, 2, 0.5] }); line([x - 30, y - 22], [x - 8, y - 22], 1, id + 21, 0.1); ptxt('TEA', x - 19, y - 10, 6, { align: 'center', mono: true }); }
  if (o.jars) for (let i = 0; i < 3; i++) shape(R(x + 6 + i * 14, y - 16, 10, 16), { lw: 1, id: id + 30 + i, fill: P.paper }); }
/* the kitchen as the photograph has it (no table, no cupboard), in frame (base,f); the remembered things are added over it */
function kitchenFixed(base, f, id, o = {}) {
  kitchenShell(base, f, id);
  kWindow(base, f, id + 100, o.sun, o.sunA ?? 1);
  kDoor(Math.min(KX(base, f, 20), KX(base, f, 102)), id + 200);
  stove(KX(base, f, 420), id + 300);
  shelf(KX(base, f, 340), 300, 100, id + 400, { tin: o.tin, jars: !o.tin });
}
/* the word targets for each remembered kitchen, matching what kitchenRemembered draws */
function kitchenSegs(base, f, who) {
  const K = (x) => KX(base, f, x), y = KW.back;
  const walls = [[[K(0), KW.top], [K(0), KW.floor]], [[K(500), KW.top], [K(500), KW.floor]]];
  if (who === 'H') { // A kitchen. The table under the window. A blue cupboard by the door. The kettle on the stove.
    const tx = K(210), cx_ = K(150);
    return [walls[0][0] && [[K(0), KW.top], [K(500), KW.top]], [[K(0), y], [K(500), y]],
      [[tx - 70, y - 92], [tx + 70, y - 92]], [[tx - 62, y - 82], [tx - 62, y]], [[tx + 54, y - 82], [tx + 54, y]], [[tx - 70, y - 82], [tx + 70, y - 82]], rectPoly([K(140) - (f < 0 ? 140 : 0), 220, 140, 160]),
      [[K(120), y], [K(120), y - 210]], [[K(120), y - 210], [K(180), y - 210]], [[K(180), y - 210], [K(180), y]], [[K(150), y - 200], [K(150), y - 80]], rectPoly([Math.min(K(122), K(178)), y - 72, 56, 18]), [[K(102), y - 230], [K(102), y]],
      [[K(420) - 22, 412], [K(420) + 22, 412]], [[K(420) - 18, 386], [K(420) + 18, 386]], [[K(420) - 62, 412], [K(420) + 62, 412]], [[K(420) - 56, 420], [K(420) - 56, 540]], [[K(420) + 56, 420], [K(420) + 56, 540]]].map((p) => p);
  }
  // A kitchen. The table by the stove. No cupboard. A tea tin on the shelf.
  const tx = K(300);
  return [[[K(0), KW.top], [K(500), KW.top]], [[K(0), y], [K(500), y]],
    [[tx - 60, y - 92], [tx + 60, y - 92]], [[tx - 52, y - 82], [tx - 52, y]], [[tx + 44, y - 82], [tx + 44, y]], [[tx - 60, y - 82], [tx + 60, y - 82]], [[K(420) - 56, 420], [K(420) - 56, 540]],
    [[K(120), y - 14], [K(180), y - 14]], [[K(102), y - 230], [K(198), y - 230]],
    [[K(340) - 30, 300], [K(340) - 30, 272]], [[K(340) - 30, 272], [K(340) - 8, 272]], [[K(340) - 8, 272], [K(340) - 8, 300]], [[K(340) - 50, 306], [K(340) + 50, 306]], [[K(340) - 50, 300], [K(340) + 50, 300]], [[K(340) + 50, 300], [K(340) + 50, 306]]];
}
function kitchenRemembered(base, f, who, id, o = {}) {
  const K = (x) => KX(base, f, x), y = KW.back;
  if (who === 'H') { table(K(210), y, 140, id, { cloth: true, cup: o.cup ? f * 30 : 0 }); cupboard(K(150), y, id + 50); if (o.kettle !== false) kettleAt(K(420) + (o.kettleDX || 0), 412 + (o.kettleDY || 0), id + 80, o.steam || 0, GT); }
  else { table(K(300), y, 120, id, { cup: o.cup ? -f * 20 : 0 }); }
}

/* ---------- cameras ---------- */
const WIDE = ON(640, 360, 1.0);

/* ================= the shots ================= */
SHOTS.title = (lt) => {
  X.fillStyle = P.paper; X.fillRect(0, 0, W, H);
  X.globalAlpha = seg(lt, 0.3, 1.0); txt('THE HOUSE THAT LANGUAGE BUILT  ·  IV', CX, 168, 15, { mono: true }); X.globalAlpha = 1;
  const t1 = 'THE PERFECT DESCRIPTION OF AN EMPTY ROOM', n = Math.floor(t1.length * U(lt, 0.8, 4.2));
  X.font = `44px ${FONT}`; const fw = X.measureText(t1).width; X.textAlign = 'left'; X.textBaseline = 'middle'; X.fillStyle = P.ink; X.fillText(t1.slice(0, n), CX - fw / 2, 236);
  X.globalAlpha = seg(lt, 4.6, 5.6); txt('a street rebuilt from photographs, and from memory', CX, 296, 26, { italic: true }); X.globalAlpha = 1;
  // a print and its brass plate settle under the title
  const a = seg(lt, 4.4, 5.4); if (a > 0) { X.save(); X.globalAlpha = a; print_(CX, 470 + (1 - a) * 10, 230, 'kitchen', 9100, { rot: -0.02, num: 'BR 34/031', cap: 'No. 7, kitchen' }); X.restore(); }
};

SHOTS.city = (lt, sd, sh) => {
  const L = sh.lines;
  const c = camFor(lt, [[0, ON(640, 330, 1.0)], [L[0].t0 + 2.0, ON(380, 450, 1.35), 5.0]]);
  cam(c, () => {
    X.fillStyle = P.paper; X.fillRect(-600, -600, 2500, 1900); sky(0, 520, -600, 1900);
    skyline(470, -300, 1600, 600, 0.8); X.save(); X.fillStyle = P.paper; X.globalAlpha = 0.35; X.fillRect(-600, 300, 2500, 172); X.restore();
    skyline(560, -300, 1600, 700, 1.15);
    shape(R(-600, 560, 2500, 300), { lw: 1.4, id: 710, fill: P.paper });
    X.save(); X.globalAlpha = 0.6; for (let y = 572; y < 760; y += 6) line([-600, y], [1900, y + 2], 0.5, 720 + y, 0.5); X.restore();
    ministry(860, 600, 0.95, 800);
    // the empty lot where the street was, and the ring road that was only described
    shape(R(70, 590, 520, 70), { lw: 0, fill: P.paper });
    for (let i = 0; i < 9; i++) { const px = 90 + i * 58; line([px, 600], [px, 584], 1.6, 740 + i, 0.1); }
    const rr = []; for (let i = 0; i <= 40; i++) { const a = Math.PI * (0.05 + 0.9 * i / 40); rr.push([330 + Math.cos(a) * 300, 640 - Math.sin(a) * 26]); }
    dashed(rr, 1.4, P.ink, [3, 6]);
    line([150, 630], [150, 590], 1.6, 760, 0.1); plate(118, 568, 64, 24, 'A ring road, six lanes.', 761, { fs: 6.4 });
  });
};

SHOTS.board = (lt, sd, sh) => {
  const L = sh.lines, p = cue(sh, 'pins'), fd = cue(sh, 'feed');
  const pinT = (i) => p.at + i * (p.to - p.at) / (p.n - 1);
  const k = PRINTS[5], f0 = PRINTS[0];
  const EDX = 1290, EDY = 700;
  let c = camFor(lt, [[0, ON(640, 350, 1.0)], [L[1].t0, ON(520, 190, 2.0), 1.6], [L[2].t0 - 0.3, ON(k.x, k.y, 2.9), 1.4], [L[3].t0 - 0.6, ON(980, 420, 0.95), 1.4]]);
  cam(c, () => {
    board(lt, { pinU: (i) => U(lt, pinT(i), pinT(i) + 0.25), hide: (i) => i === 0 && lt > fd.at - 1.6 });
    // the Edifier beside the board takes print 14
    edifier(EDX, EDY, 1.15, lt, 9200, { say: 0, feed: lt > fd.at - 1.6 ? U(lt, fd.at - 1.6, fd.to) : 0, feedKind: 'front', feedNum: 'BR 34/014' });
    if (lt > fd.at - 1.6 && lt < fd.at - 0.6) { const u = U(lt, fd.at - 2.6, fd.at - 0.6); print_(lerp(f0.x, EDX, E.io(u)), lerp(f0.y, EDY - 470, E.io(u)), lerp(f0.w, 100, u), 'front', f0.id, { rot: f0.rot, num: f0.num, pin: false, cols: 30 }); }
    // the floor in front of the board
    shape(R(-800, 690, 2900, 400), { lw: 1.6, id: 1350, fill: '#e6dcc4', h: [0.03, 5, 0.4] });
  });
};

const NO7 = 7, ED_BUILD = { x: houseX(8) + 70, y: 650, s: 1.0 };
SHOTS.build = (lt, sd, sh) => {
  const L = sh.lines, ty = cue(sh, 'type'), fa = cue(sh, 'fall'), fl = cue(sh, 'fill'), ri = cue(sh, 'rise');
  const nT = Math.floor(fa.text.length * U(lt, ty.at, ty.to));
  const tm = wordTimes(fa);
  const ex = lerp(ED_BUILD.x, houseX(9) + 260, E.io(U(lt, L[1].t1, L[2].t0 + 1.8))), ey = ED_BUILD.y;
  const x7 = houseX(NO7), q = houseParts(x7, STREET_B);
  let c = camFor(lt, [[0, ON(ex - 40, 470, 2.1)], [ty.to - 0.6, ON(x7 + 130, 420, 1.45), 1.4], [L[1].t0 + 2.0, ON(x7 + 90, 380, 1.7), 2.0],
    [L[2].t0, ON(330, 330, 0.82), 2.4], [L[3].t0 - 0.4, ON(x7 + 110, STREET_B - 13, 4.6), 1.2], [L[3].t1 + 0.8, ON(x7 + 100, 400, 1.2), 2.0]]);
  cam(c, () => {
    X.fillStyle = P.paper; X.fillRect(-1200, -600, 3800, 1900); sky(-200, STREET_B - 10, -1200, 2600);
    skyline(STREET_B - 30, -1200, 2600, 900, 0.7); X.save(); X.globalAlpha = 0.5; X.fillStyle = P.paper; X.fillRect(-1200, STREET_B - 260, 3800, 232); X.restore();
    pavement(-1200, 2600, STREET_B, 950);
    // surveyor's pegs and string for the plots not yet built
    for (let k = 1; k <= 9; k++) { const x = houseX(k); line([x, STREET_B], [x, STREET_B - 14], 1.6, 960 + k, 0.1); dashed([[x, STREET_B - 10], [x + HW, STREET_B - 10]], 0.6, P.ink, [2, 3]); }
    // the other houses rise
    for (let k = 1; k <= 9; k++) { if (k === NO7) continue; const i = k < NO7 ? k - 1 : k - 2, t0 = ri.at + i * (ri.to - ri.at) / ri.n; const g = U(lt, t0, t0 + 0.5); if (g > 0) houseFront(k, 3000 + k * 60, { grow: E.out(g) }); }
    // No. 7: the sentence becomes the house
    const fu = U(lt, fl.at, fl.to);
    if (fu > 0) houseFront(NO7, 3000 + NO7 * 60, { u: fu, plate: fa.text });
    const g = sheetGeom(ex, ey, 1, { text: fa.text, w: 104, fs: 7 });
    fallingWords(fa, lt, g, houseSegs(NO7), { fade: fu, big: 15 });
    edifier(ex, ey, 1, lt, 9300, { say: sayAt(sh, 'E', lt), keys: lt >= ty.at && lt < ty.to ? 1 : 0, sheet: lt < fa.to + 1 ? { text: fa.text, n: nT, w: 104, fs: 7, out: clamp(U(lt, ty.at - 0.4, ty.at + 1.0)), gone: (i) => lt >= tm(i) } : null });
  });
};

/* the elders: who they are and where they stand in the front room */
const ELD = {
  P: { id: 5000, hair: 'hat', cane: true, hunch: 0.12, x: 330, s: 1.0 },
  D: { id: 5100, hair: 'scarf', skirt: true, hunch: 0.08, x: 650, s: 0.96 },
  M: { id: 5200, hair: 'cap', cane: true, hunch: 0.16, x: 760, s: 1.02 },
  H: { id: 5300, hair: 'bun', skirt: true, hunch: 0.1, x: 470, s: 0.95 },
  x1: { id: 5400, hair: 'bald', hunch: 0.14, x: 400, s: 0.84, dark: true },
  x2: { id: 5500, hair: 'white', skirt: true, hunch: 0.1, x: 680, s: 0.84 },
};
const ELD_BASE = { P: 668, D: 676, M: 672, H: 684, x1: 612, x2: 616 };
function elder(key, sh, lt, o = {}) {
  const e = ELD[key], x = o.x ?? e.x, y = o.y ?? ELD_BASE[key], tk = talking(sh, key, lt);
  person(x, y, (o.s ?? e.s), e.id, { f: o.f ?? (x < 640 ? 1 : -1), hair: e.hair, cane: e.cane, hunch: e.hunch, skirt: e.skirt, dark: e.dark, mouth: sayAt(sh, key, lt), walk: o.walk || 0, ph: o.ph || 0, point: o.point || 0, look: tk ? -0.5 : 0, alpha: o.alpha, reach: o.reach, seated: o.seated, cup: o.cup });
}
const ED_ROOM = { x: 1060, y: 712, s: 0.92 };
function frontRoom(sh, lt, st) {
  roomShell();
  windowAndSun(st.sun, {});
  wallClock(440, 270, st.mins ?? 0, 2500);
  const stg = stairs(st.steep ?? 0, { wrong: st.stairWrong });
  door({ side: st.side ?? -1, open: st.open ?? 0, swing: st.swing, hingeShift: st.hingeShift || 0 });
  if (st.board) { const bp = boardPoly(6); X.save(); if (st.board.red) { dashed([...bp, bp[0]], 1.6, P.red, [4, 3]); } if (st.board.creak) { const [cx_, cy_] = [(bp[0][0] + bp[2][0]) / 2, (bp[0][1] + bp[2][1]) / 2 + 30]; X.globalAlpha = st.board.creak; soundLines(cx_ - 30, cy_, Math.PI, 3, 14, 2600, P.ink, st.board.kind); soundLines(cx_ + 30, cy_, 0, 3, 14, 2610, P.ink, st.board.kind); } X.restore(); }
  return stg;
}
SHOTS.visit = (lt, sd, sh) => {
  const L = sh.lines, en = cue(sh, 'enter'), steps_ = cues(sh, 'step');
  const order = ['P', 'x1', 'H', 'D', 'x2', 'M'];
  const arrive = (i) => en.at + i * (en.to - en.at) / order.length;
  const dead = steps_.some((s_) => lt >= s_.at - 0.05 && lt < s_.at + 0.4);
  let c = camFor(lt, [[0, ON(640, 400, 1.0)], [L[1].t0 - 0.3, ON(330, 420, 1.6), 1.0], [L[2].t0 - 0.3, ON(600, 420, 1.45), 1.0], [L[3].t0 - 0.3, ON(860, 400, 1.45), 1.0],
    [L[4].t0 - 0.3, ON(470, 540, 1.7), 1.0], [L[6].t0 - 0.2, ON(820, 470, 1.35), 1.0], [L[7].t0, ON(640, 400, 1.0), 1.6]]);
  const bp = boardPoly(6), bc = [(bp[0][0] + bp[2][0]) / 2, (bp[0][1] + bp[2][1]) / 2];
  c = withTight(sh, lt, c, bc[0] + 10, bc[1] + 30, 3.2);
  cam(c, () => {
    frontRoom(sh, lt, { sun: 0, side: -1, open: lt < en.to + 1.0 ? U(lt, 0.2, 1.2) * (1 - U(lt, en.to + 0.2, en.to + 1.0)) : 0, swing: lt > L[1].t0 && lt < L[2].t0 + 0.6, stairWrong: lt > L[3].t0 && lt < L[4].t0 + 0.3, board: lt > L[4].t1 + 0.4 && lt < L[6].t0 ? { red: true } : null, mins: -14 });
    for (let i = 0; i < order.length; i++) {
      const key = order[i], a = arrive(i), e = ELD[key], tgt = key === 'H' && lt > L[4].t0 ? bc[0] - 10 : e.x;
      if (lt < a) continue;
      const u = U(lt, a, a + 2.4), x = lerp(DOOR.x + 48, e.x, E.io(u)), y = lerp(RM.back + 6, ELD_BASE[key], E.io(u)), s = lerp(0.78, e.s, E.io(u));
      let xx = x, yy = y, walk = u > 0 && u < 1 ? 1 : 0;
      if (key === 'H' && lt > L[4].t0) { const v = U(lt, L[4].t0, L[4].t1 + 0.6); xx = lerp(e.x, tgt, E.io(v)); yy = lerp(ELD_BASE.H, bc[1] + 64, E.io(v)); walk = v > 0 && v < 1 ? 1 : 0; }
      const pointAt = key === 'P' ? pulse(lt, L[1].t0 - 0.2, 2.2) : key === 'D' ? pulse(lt, L[2].t0 - 0.2, 3.6) : key === 'M' ? pulse(lt, L[3].t0 - 0.2, 3.4) : 0;
      elder(key, sh, lt, { x: xx, y: yy, s, walk, ph: lt * 6 + i, f: key === 'P' ? -1 : key === 'D' ? 1 : key === 'M' ? 1 : 1, point: pointAt });
    }
    if (dead) { X.save(); X.globalAlpha = 0.9; dashed([...bp, bp[0]], 1.8, P.red, [4, 3]); X.restore(); }
    edifier(ED_ROOM.x, ED_ROOM.y, ED_ROOM.s, lt, 9400, { say: sayAt(sh, 'E', lt) });
  });
};

SHOTS.correct = (lt, sd, sh) => {
  const L = sh.lines, hg = cue(sh, 'hinge'), tr = cue(sh, 'try'), clk = cue(sh, 'clock'), suns = cues(sh, 'sun'), sc = cue(sh, 'stairs'), cl = cue(sh, 'climb'), cr = cues(sh, 'creak'), tg = cue(sh, 'tags');
  const onBoard = lt >= tg.at - 0.8;
  const hu = U(lt, hg.at, hg.to);
  const side = hu < 0.5 ? -1 : 1, shift = hu < 0.5 ? E.io(hu * 2) * 0 : 0;
  const open = U(lt, tr.at + 0.2, tr.at + 1.4) * (1 - U(lt, L[2].t1 + 0.6, L[2].t1 + 1.6));
  const sun = lerp(0, 1, U(lt, suns[0].at, suns[0].to)) + 0.3 * U(lt, suns[1].at, suns[1].to);
  const mins = lerp(-14, 0, U(lt, clk.at - 1.5, clk.at)) + 10 * U(lt, suns[1].at, suns[1].to);
  const steep = U(lt, sc.at, sc.to);
  const st0 = stairs; void st0;
  const creakNow = cr.find((c_) => lt >= c_.at && lt < c_.at + (c_.n === 1 ? 1.9 : 0.7));
  if (onBoard) {
    const c = camFor(lt, [[0, ON(560, 330, 1.25)], [tg.at + 0.4, ON(480, 360, 1.15), 2.0], [L[13].t0 - 0.4, ON(420, 420, 1.9), 1.2]]);
    cam(withTight(sh, lt, c, 330, 470, 2.4), () => { board(lt, { tags: 1 + 4 * U(lt, tg.at, tg.to) }); shape(R(-800, 690, 2900, 400), { lw: 1.6, id: 1350, fill: '#e6dcc4', h: [0.03, 5, 0.4] }); });
    return;
  }
  let c = camFor(lt, [[0, ON(640, 400, 1.0)], [L[1].t0, ON(330, 430, 1.7), 1.0], [L[3].t0 - 0.2, ON(620, 430, 1.3), 1.0], [suns[1].to + 0.4, ON(900, 380, 1.3), 1.0],
    [L[7].t0 - 0.6, ON(470, 520, 1.8), 1.0], [L[11].t1 + 0.5, ON(470, 560, 2.3), 1.0]]);
  const st = { sun, side, open, mins, steep, hingeShift: shift, swing: lt > hg.at - 0.3 && lt < tr.at + 1.6, board: null };
  if (lt < tr.at + 1.6) st.swing = true;
  const bp = boardPoly(6), bc = [(bp[0][0] + bp[2][0]) / 2, (bp[0][1] + bp[2][1]) / 2];
  if (creakNow) st.board = { creak: 1 - U(lt, creakNow.at + 0.3, creakNow.at + 0.9), kind: creakNow.n === 0 ? 0 : creakNow.n === 1 ? 1 : 2 };
  cam(c, () => {
    // the swing arc is red while the door still opens the wrong way, ink once it is right
    const stg = frontRoom(sh, lt, { ...st, swing: false });
    if (st.swing) { const a = side < 0 ? 1 : 0; void a; }
    if (lt > hg.at - 0.3 && lt < tr.at + 1.8) { // redraw door with its swing arc
      door({ side, open, swing: true, hingeShift: 0, swingCol: side < 0 ? P.red : P.ink });
    }
    // screwdriver flicker at the hinges while they move
    if (hu > 0 && hu < 1) { const hx = hu < 0.5 ? DOOR.x : DOOR.x + DOOR.w; for (const yy of [DOOR.top + 29, RM.back - 23]) soundLines(hx, yy, side < 0 ? Math.PI : 0, 2, 8, 2700 + yy); }
    // the people
    const climbing = lt >= cl.at && lt < cl.to + 3.0;
    let mx_ = ELD.M.x, my_ = ELD_BASE.M, ms_ = ELD.M.s;
    if (lt >= cl.at - 1.6) { const k = Math.min(14, Math.floor(14 * U(lt, cl.at, cl.to))), up = U(lt, cl.at - 1.6, cl.at); if (lt < cl.at) { mx_ = lerp(ELD.M.x, stg.x0 - 30, E.io(up)); my_ = lerp(ELD_BASE.M, RM.back + 4, E.io(up)); ms_ = lerp(ELD.M.s, 0.8, up); } else { const [sx, sy] = stepPos(stg, k); mx_ = sx; my_ = sy; ms_ = 0.8; } }
    if (lt > cl.to + 3.0) { mx_ = stepPos(stg, 14)[0]; my_ = stepPos(stg, 14)[1]; ms_ = 0.8; }
    elder('x1', sh, lt, {}); elder('x2', sh, lt, {});
    elder('D', sh, lt, { f: 1, point: pulse(lt, L[4].t0 - 0.2, 1.8) });
    elder('P', sh, lt, { f: -1, reach: open > 0.02 || (lt > tr.at - 1.0 && lt < tr.at + 0.6) ? [DOOR.x + DOOR.w - 6, 456] : null, x: lt > tr.at - 1.4 && lt < L[2].t1 + 1.6 ? 360 : ELD.P.x });
    elder('M', sh, lt, { x: mx_, y: my_, s: ms_, f: 1, walk: (lt >= cl.at - 1.6 && lt < cl.to) ? 1 : 0, ph: lt * 5 });
    const hx = bc[0] - 10, hy = bc[1] + 64; const stepUp = cr.some((c_) => lt >= c_.at - 0.25 && lt < c_.at + 0.15);
    elder('H', sh, lt, { x: hx, y: hy - (stepUp ? 3 : 0), f: 1 });
    edifier(ED_ROOM.x, ED_ROOM.y, ED_ROOM.s, lt, 9400, { say: sayAt(sh, 'E', lt) });
  });
};

const KCX = SHARED;  // the kitchen pair: Hanna's opens left of the shared wall, Emil's right
SHOTS.kitchens = (lt, sd, sh) => {
  const L = sh.lines, ph = cue(sh, 'photo'), ty = cue(sh, 'type'), fs = cues(sh, 'fall'), fl = cue(sh, 'fill'), kt = cue(sh, 'kettle');
  if (lt >= ph.at && lt < ph.to) { // the print: an empty kitchen
    const p = PRINTS[5], c = camFor(lt - ph.at, [[0, ON(p.x, p.y, 2.6)], [0.1, ON(p.x, p.y + 4, 2.8), ph.to - ph.at]]);
    cam(c, () => { board(lt, {}); }); return;
  }
  const split = U(lt, ty.at, fs[0].at - 0.1), bL = lerp(390, KCX - 500, E.io(split)), wl = bL + 500;       // the one kitchen unfolds into two about the shared wall
  const fu = U(lt, fl.at, fl.to);
  const ex = 640, ey = 742;
  let c = camFor(lt, [[0, ON(640, 410, 1.0)], [L[1].t0 - 0.2, ON(470, 430, 1.35), 1.0], [L[2].t0 - 0.2, ON(820, 430, 1.35), 1.0], [L[3].t0 - 0.2, ON(560, 430, 1.25), 1.0],
    [ph.to, ON(640, 450, 1.05), 0.6], [ty.at - 0.4, ON(640, 470, 1.0), 1.2], [fl.to + 0.3, ON(640, 410, 0.96), 1.6]]);
  c = withTight(sh, lt, c, 640, 470, 1.75);
  cam(c, () => {
    X.fillStyle = P.paper; X.fillRect(-600, -600, 2500, 1900);
    if (split <= 0) {
      // the kitchen as photographed, with the two contradictory tables standing in it as red ghosts while they argue
      kitchenFixed(390, 1, 6000, { sun: 0.3 });
      const ghostA = lt > L[1].t0 && lt < ty.at, ghostB = lt > L[2].t0 && lt < ty.at;
      if (ghostA) { X.save(); X.globalAlpha = 0.9; dashed([[600 - 70, KW.back - 92], [600 + 70, KW.back - 92], [600 + 70, KW.back], [600 - 70, KW.back], [600 - 70, KW.back - 92]], 1.6, P.red); dashed(rectPoly([540 - 46 - 60, KW.back - 210, 92, 210]), 1.6, P.red); X.restore(); }
      if (ghostB) { X.save(); dashed([[690 - 60, KW.back - 92], [690 + 60, KW.back - 92], [690 + 60, KW.back], [690 - 60, KW.back], [690 - 60, KW.back - 92]], 1.6, P.red); X.restore(); }
      elder('H', sh, lt, { x: 470, y: 690, f: 1, point: pulse(lt, L[1].t0, L[1].t1 - L[1].t0 + 0.4) * 0.8 + pulse(lt, L[3].t0, 2.0) * 0.4 });
      elder('M', sh, lt, { x: 900, y: 690, f: -1, point: pulse(lt, L[2].t0, L[2].t1 - L[2].t0 + 0.4) * 0.8 });
    } else {
      // Hanna's kitchen keeps the photographed frame on the left; Emil's unfolds from the shared wall like a page
      kitchenFixed(bL, 1, 6000, { sun: 0.3 });
      X.save(); X.translate(wl, 0); X.scale(E.io(split), 1); X.translate(-wl, 0); kitchenFixed(wl + 500, -1, 6500, { sun: 0.3, tin: true }); X.restore();
      shape(R(wl - 9, KW.top - 10, 18, KW.floor - KW.top + 10), { lw: 1.6, id: 6990, h: [[0.7, 2.4, 0.6], [-0.7, 2.4, 0.6]] });
      if (fu > 0) { X.save(); X.globalAlpha = fu; kitchenRemembered(KCX - 500, 1, 'H', 6100, { kettle: true, steam: kt && lt > kt.at ? 0.3 + 0.4 * U(lt, kt.at, kt.at + 4) : 0 }); kitchenRemembered(KCX + 500, -1, 'E', 6600, {}); X.restore(); }
      const gA = sheetGeom(ex, ey, 0.92, { text: fs[0].text, w: 104, fs: 7, dx: -58 }), gB = sheetGeom(ex, ey, 0.92, { text: fs[1].text, w: 104, fs: 7, dx: 58 });
      fallingWords(fs[0], lt, gA, kitchenSegs(KCX - 500, 1, 'H'), { fade: fu, big: 13, id: 1 });
      fallingWords(fs[1], lt, gB, kitchenSegs(KCX + 500, -1, 'E'), { fade: fu, big: 13, id: 2 });
      // the siblings, one in each
      const hx = lerp(470, 300, E.io(split)), mx_ = lerp(900, 980, E.io(split));
      elder('H', sh, lt, { x: hx, y: 690, f: 1 }); elder('M', sh, lt, { x: mx_, y: 690, f: -1 });
      const tA = wordTimes(fs[0]), tB = wordTimes(fs[1]), nA = Math.floor(fs[0].text.length * U(lt, ty.at, ty.to)), nB = Math.floor(fs[1].text.length * U(lt, ty.at, ty.to));
      if (lt < fl.to + 0.5) {
        edifier(ex, ey, 0.92, lt, 9500, { say: sayAt(sh, 'E', lt), keys: lt >= ty.at && lt < ty.to ? 1 : 0 });
        edSheet(ex, ey, 0.92, { text: fs[0].text, n: nA, w: 104, fs: 7, dx: -58, gone: (i) => lt >= tA(i) });
        edSheet(ex, ey, 0.92, { text: fs[1].text, n: nB, w: 104, fs: 7, dx: 58, gone: (i) => lt >= tB(i) });
      } else { const mv = U(lt, fl.to + 0.5, fl.to + 3.0); edifier(lerp(ex, 1260, E.io(mv)), ey, 0.92, lt, 9500, { say: sayAt(sh, 'E', lt) }); }
    }
    if (split <= 0) edifier(1130, 742, 0.92, lt, 9500, { say: sayAt(sh, 'E', lt) });
  });
};

/* the street plan, multiplying: each house's rooms gain variants as they are remembered */
function streetPlan(x, y, s, u, id) {
  X.save(); X.translate(x, y); X.scale(s, s);
  shape(R(-20, -20, 900, 300), { lw: 1.4, id, fill: PAPER2 });
  ptxt('CORDWAIN STREET. GROUND FLOORS. ROOMS ON RECORD', 0, -4, 11, { mono: true });
  for (let k = 0; k < 9; k++) { const hx = k * 96; shape(R(hx, 20, 92, 110), { lw: 1.4, id: id + k * 10 }); line([hx, 75], [hx + 92, 75], 0.9, id + k * 10 + 1, 0.2); ptxt(String(k + 1), hx + 46, 145, 10, { align: 'center' });
    // variants: offset outlines stacked below each house, one per remembered account
    const nv = Math.floor(u * (2 + hash(k, 5) * 4) + (k === 6 ? u * 2 : 0));
    for (let v = 0; v < nv; v++) { const yy = 160 + v * 22; X.save(); X.globalAlpha = 0.9; shape(R(hx + 6 + (v % 2) * 6, yy, 80, 18), { lw: 0.9, id: id + k * 10 + 3 + v, fill: P.paper }); ptxt(`${k + 1}${'abcdefgh'[v]}`, hx + 12 + (v % 2) * 6, yy + 13, 8, { mono: true, col: SEPIA }); X.restore(); }
  }
  X.restore();
}
/* the ledger: three columns, SHOWN in ink, REMEMBERED in sepia, ESTABLISHED empty */
const LEDGER = { x: 250, y: 120, w: 780, h: 520 };
const ROWS = [
  ['Kitchen, No. 7', 'empty; window, range, sink, shelf. Print 31.', 'table under window; blue cupboard by door; kettle on. H. Rusk', ''],
  ['', '', 'table by stove; no cupboard; tea tin on shelf. E. Rusk', ''],
  ['Front room, No. 7', 'empty; door hung left. Print 22.', 'door hung right; sun after four, ten past. A. Pell, D. Lind', ''],
  ['Stairs, No. 7', 'fourteen steps. Print 27.', 'steeper. E. Rusk', ''],
];
function ledger(lt, o) {
  const { x, y, w, h } = LEDGER;
  shape(R(x - 20, y - 20, w + 40, h + 40), { lw: 1.8, id: 7400, fill: '#d9cfb4', h: [[0.7, 4, 0.4], [-0.7, 4, 0.4]] });
  shape(R(x, y, w, h), { lw: 1.2, id: 7401, fill: PAPER2 });
  line([x + w / 2, y], [x + w / 2, y + h], 1.6, 7402, 0.2);
  for (let i = 0; i < 22; i++) { X.save(); X.globalAlpha = 0.35; line([x + 10, y + 50 + i * 21], [x + w - 10, y + 50 + i * 21], 0.5, 7410 + i, 0.2); X.restore(); }
  // columns ruled by hand: label | SHOWN | REMEMBERED | ESTABLISHED
  const cx = [x + 14, x + 150, x + 360, x + 640], ru = o.rule || 0;
  for (let i = 1; i < 4; i++) { const u = clamp(ru * 3 - (i - 1)); if (u > 0) ink([[cx[i] - 8, y + 16], [cx[i] - 8, y + 16 + (h - 30) * u]], 1.1, 7430 + i, 0.3); }
  if (ru > 0.98) { ptxt('SHOWN', cx[1], y + 38, 12, { mono: true }); ptxt('REMEMBERED', cx[2], y + 38, 12, { mono: true, col: SEPIA }); ptxt('ESTABLISHED', cx[3], y + 38, 12, { mono: true }); }
  const wn = o.write || 0;  // characters written so far, row by row
  let left = wn; const fs = 10.5, ww = (col) => (col === 0 ? 130 : col === 3 ? 120 : col === 1 ? 196 : 266);
  let nib = null, yRow = y + 64;
  for (const r of ROWS) {
    let rowH = 1;
    for (let col = 0; col < 3; col++) {
      const lines = wrap(r[col], ww(col), `italic ${fs}px ${FONT}`); rowH = Math.max(rowH, lines.length);
      lines.forEach((s, li) => { if (left <= 0) return; const sh_ = s.slice(0, left); left -= s.length + 1; ptxt(sh_, cx[col], yRow + li * 15, fs, { italic: true, col: col === 2 ? SEPIA : P.ink }); X.font = `italic ${fs}px ${FONT}`; nib = [cx[col] + X.measureText(sh_).width, yRow + li * 15]; });
    }
    yRow += rowH * 15 + 12; void r;
  }
  return { nib, cx, est: [cx[3] + 40, y + 70] };
}
function memo(x, y, rot, id, a = 1) {
  X.save(); X.translate(x, y); X.rotate(rot); X.globalAlpha = a;
  shape(R(-150, -95, 300, 190), { lw: 1.2, id, fill: P.paper }); ball(0, -66, 12, id + 1, PAT.m, 1.2);
  ptxt('MINISTRY OF CONSTRUCTIVE SEMANTICS', 0, -38, 9.5, { align: 'center' });
  ptxt('To the archivist, Bureau of Reconstruction.', -130, -12, 9, { italic: true });
  ptxt('Select one kitchen for No. 7, so that', -130, 6, 9, { italic: true }); ptxt('Cordwain Street may be entered in the', -130, 20, 9, { italic: true }); ptxt('register as the past. One past per street.', -130, 34, 9, { italic: true });
  X.restore();
}
function penHand(x, y, lt, writing) {
  const j = writing ? Math.sin(lt * 17) * 1.2 : 0, nx = x + j, ny = y + (writing ? Math.abs(Math.sin(lt * 9)) * 1.5 : -6);
  const hx = nx + 24, hy = ny + 20;
  cap(hx + 10, hy + 12, hx + 150, hy + 210, 30, 8100);
  shape([[hx + 120, hy + 150], [hx + 168, hy + 128], [hx + 230, hy + 260], [hx + 170, hy + 290]], { lw: 1.6, id: 8101, fill: '#4b4137' });
  line([nx, ny], [nx + 40, ny + 30], 3, 8103, 0.1); line([nx, ny], [nx + 5, ny + 4], 1.4, 8104, 0.05);
  ball(hx, hy, 13, 8102, PAT.f, 1.4);
}
const REPLY = 'A more convincing reconstruction is not a more trustworthy one.';
SHOTS.archive = (lt, sd, sh) => {
  const L = sh.lines, pl = cue(sh, 'plan'), ru = cue(sh, 'rule'), wr = cues(sh, 'write'), hv = cue(sh, 'hover'), me = cue(sh, 'memo'), rp = cue(sh, 'reply');
  const phase = lt < L[1].t0 ? 'plan' : lt < L[5].t0 + 0.6 ? 'kitchens' : 'ledger';
  if (phase === 'plan') {
    const c = camFor(lt, [[0, ON(640, 380, 1.0)], [0.2, ON(560, 430, 1.25), L[1].t0]]);
    cam(c, () => { X.fillStyle = '#d9cfb4'; X.fillRect(-600, -600, 2500, 1900); X.save(); X.globalAlpha = 0.5; hatch(0.06, 5, 0.5, [-600, -600, 1900, 1300]); X.restore(); streetPlan(210, 210, 1.0, U(lt, pl.at, pl.to), 7600); });
    return;
  }
  if (phase === 'kitchens') { // the archivist comes to the two kitchens
    let c = camFor(lt, [[L[1].t0, ON(640, 420, 1.0)], [L[2].t0 - 0.2, ON(560, 440, 1.3), 1.0], [L[3].t0 - 0.2, ON(820, 440, 1.3), 0.8], [L[4].t0 - 0.2, ON(600, 450, 1.4), 0.8]]);
    cam(c, () => {
      X.fillStyle = P.paper; X.fillRect(-600, -600, 2500, 1900);
      kitchenFixed(KCX - 500, 1, 6000, { sun: 0.3 }); kitchenFixed(KCX + 500, -1, 6500, { sun: 0.3, tin: true });
      shape(R(KCX - 9, KW.top - 10, 18, KW.floor - KW.top + 10), { lw: 1.6, id: 6990, h: [[0.7, 2.4, 0.6], [-0.7, 2.4, 0.6]] });
      kitchenRemembered(KCX - 500, 1, 'H', 6100, {}); kitchenRemembered(KCX + 500, -1, 'E', 6600, {});
      const ax = lerp(-60, 540, E.io(U(lt, L[1].t0, L[2].t0 - 0.4)));
      person(ax, 700, 1.0, 5800, { f: 1, hair: 'bob', glasses: true, ledger: true, dark: true, walk: lt < L[2].t0 - 0.4 ? 1 : 0, ph: lt * 6, mouth: sayAt(sh, 'A', lt), lines: false });
      edifier(860, 742, 0.92, lt, 9500, { say: sayAt(sh, 'E', lt) });
    });
    return;
  }
  // the ledger, from above
  const ruleU = U(lt, ru.at, ru.to);
  const tot = ROWS.map((r) => r.slice(0, 3).join(' ')).join(' ').length + 40;
  const wn = Math.floor(tot * 0.55 * U(lt, wr[0].at, wr[0].to) + tot * 0.5 * U(lt, wr[1].at, wr[1].to));
  const mu = U(lt, me.at, me.at + 1.0), rpu = U(lt, rp.at, rp.to);
  let c = camFor(lt, [[L[5].t0 + 0.6, ON(640, 380, 1.0)], [ru.at, ON(640, 380, 1.0)], [wr[0].at, ON(520, 260, 1.5), 1.2], [hv.at - 0.2, ON(760, 230, 2.2), 1.2], [me.at, ON(820, 360, 1.05), 1.2], [rp.at - 0.2, ON(450, 600, 1.6), 1.2]]);
  const ry = LEDGER.y + LEDGER.h - 40;
  c = withTight(sh, lt, c, 420, ry + 40, 2.6);
  cam(c, () => {
    X.fillStyle = '#d9cfb4'; X.fillRect(-600, -600, 2500, 1900); X.save(); X.globalAlpha = 0.5; hatch(0.06, 5, 0.5, [-600, -600, 1900, 1300]); X.restore();
    const g = ledger(lt, { rule: ruleU, write: wn });
    // the memo arrives, and her reply is written at the foot of the page
    if (mu > 0) memo(lerp(1250, 900, E.out(mu)), lerp(-120, 330, E.out(mu)), lerp(0.3, 0.05, mu), 7700);
    const rn = Math.floor(REPLY.length * rpu);
    if (rpu > 0) { ptxt(REPLY.slice(0, rn), LEDGER.x + 20, ry + 30, 13, { italic: true }); }
    // her pen
    let nib = null, writing = false;
    if (lt >= ru.at && lt < ru.to) { const u = clamp(ruleU * 3 % 1), i = Math.min(3, 1 + Math.floor(ruleU * 3)); nib = [g.cx[i] - 8, LEDGER.y + 16 + (LEDGER.h - 30) * u]; writing = true; }
    else if (lt >= wr[0].at && lt < wr[1].to && g.nib) { nib = g.nib; writing = lt < wr[1].to - 0.4; }
    else if (lt >= hv.at && lt < hv.to + 2.6) { nib = [g.est[0] + Math.sin(lt * 1.3) * 3, g.est[1] - 8 - 6 * Math.sin(lt * 0.9) ** 2]; }
    else if (rpu > 0) { X.font = `italic 13px ${FONT}`; nib = [LEDGER.x + 20 + X.measureText(REPLY.slice(0, rn)).width, ry + 30]; writing = rpu < 1; }
    else if (lt >= wr[1].to) nib = [g.est[0] + 60, g.est[1] + 90];
    if (nib) penHand(nib[0], nib[1], lt, writing);
  });
};

SHOTS.wall = (lt, sd, sh) => {
  const L = sh.lines, pl = cue(sh, 'plates'), clk = cue(sh, 'clock'), sn = cue(sh, 'sun'), stn = cue(sh, 'stand'), kt = cue(sh, 'kettle'), lf = cue(sh, 'lift'), cr = cue(sh, 'creak'), tu = cue(sh, 'turn'), taps = cues(sh, 'tap');
  const sun = U(lt, sn.at, sn.to);
  const B = L[1].t1;
  const plU = U(lt, pl.at, pl.to);
  let c = camFor(lt, [[0, ON(640, 420, 1.0)], [pl.at, ON(640, 640, 1.6), 1.4], [L[1].t1 + 0.6, ON(640, 410, 1.0), 2.4], [B + 10.5, ON(640, 430, 1.25), 6.0], [taps[0].at - 0.6, ON(640, 450, 1.7), 1.6], [L[3].t1 + 1.0, ON(640, 410, 1.0), 4.0]]);
  c = withTight(sh, lt, c, 690, 450, 2.2);
  cam(c, () => {
    X.fillStyle = P.paper; X.fillRect(-600, -600, 2500, 1900);
    kitchenFixed(KCX - 500, 1, 6000, { sun: 0.3 + 0.7 * sun, sunA: 0.5 + 0.5 * sun }); kitchenFixed(KCX + 500, -1, 6500, { sun: 0.3 + 0.7 * sun, sunA: 0.5 + 0.5 * sun, tin: true });
    shape(R(KCX - 9, KW.top - 10, 18, KW.floor - KW.top + 10), { lw: 1.6, id: 6990, h: [[0.7, 2.4, 0.6], [-0.7, 2.4, 0.6]] });
    shape(R(KCX - 500, KW.floor, 1000, 56), { lw: 1.6, id: 6991, h: [[0.7, 3.2, 0.5], [-0.7, 3.2, 0.5]] });
    // Hanna rises from her table to the stove; the kettle; she lifts it off after he speaks
    const su = U(lt, stn.at, stn.to), lu = U(lt, lf.at, lf.to);
    const steam = kt ? clamp(U(lt, kt.at + 3, kt.at + 9)) * (1 - lu) : 0;
    kitchenRemembered(KCX - 500, 1, 'H', 6100, { kettle: lu < 0.5, steam, cup: true });
    if (lu >= 0.5) kettleAt(KCX - 500 + 250, KW.back - 92, 6180, 0, lt); // set down on her table
    kitchenRemembered(KCX + 500, -1, 'E', 6600, { cup: true });
    // the kitchen clock on each side
    wallClock(KCX - 250, 200, -14 + 14 * U(lt, clk.at - 2, clk.at) + 6 * sun, 6200); wallClock(KCX + 250, 200, -14 + 14 * U(lt, clk.at - 2, clk.at) + 6 * sun, 6700);
    // Hanna
    const hSeat = [KCX - 500 + 268, 690], hStove = [KCX - 66, 690];
    if (su <= 0) { chair(KCX - 500 + 250, 690, 1, 6300); person(hSeat[0], hSeat[1], 0.95, ELD.H.id, { f: 1, hair: 'bun', skirt: true, seated: true, hunch: 0.08, cup: true }); }
    else {
      chair(KCX - 500 + 250, 690, 1, 6300);
      const x = lerp(hSeat[0] + 30, hStove[0] - 10, E.io(su));
      const near = lt > kt.at - 0.5 && lt < kt.at + 0.8, tapping = taps.slice(2).some((t_) => lt >= t_.at - 0.25 && lt < t_.at + 0.15);
      const reach = near ? [KCX - 90, 410] : tapping ? [KCX - 12, 400] : lu > 0 && lu < 1 ? [lerp(KCX - 80, KCX - 500 + 250, E.io(lu)), lerp(380, 400, lu) - Math.sin(lu * Math.PI) * 40] : null;
      person(x, 690, 0.95, ELD.H.id, { f: 1, hair: 'bun', skirt: true, hunch: 0.1, walk: su > 0 && su < 1 ? 1 : 0, ph: lt * 5, reach, mouth: sayAt(sh, 'H', lt), look: lt > taps[0].at ? -0.4 : 0 });
    }
    // Emil, at his table by the stove, back to the wall until he hears
    const tuu = U(lt, tu.at, tu.to), mTap = taps.slice(0, 2).some((t_) => lt >= t_.at - 0.25 && lt < t_.at + 0.15);
    const ef = tuu < 0.5 ? 1 : -1, ex = KCX + 500 - 300 + 70;
    chair(ex - 14 * ef, 690, ef, 6800);
    const cHop = cr && lt >= cr.at - 0.1 && lt < cr.at + 0.3 ? 2 : 0;
    person(ex, 690 - cHop, 1.0, ELD.M.id, { f: ef, hair: 'cap', seated: true, hunch: 0.14, cup: tuu < 0.5, reach: mTap ? [KCX + 12, 400] : (ef < 0 && lt > taps[1].at + 0.2 ? [KCX + 14, 470] : null), mouth: sayAt(sh, 'M', lt), look: tuu > 0.5 ? -0.4 : 0.3 });
    // taps: small marks on each face of the wall
    for (const [i, t_] of taps.entries()) { const a = 1 - U(lt, t_.at, t_.at + 0.5); if (lt >= t_.at && a > 0) { X.save(); X.globalAlpha = a; soundLines(i < 2 ? KCX + 10 : KCX - 10, 400, i < 2 ? 0 : Math.PI, 2, 8, 6900 + i); X.restore(); } }
    if (cr && lt >= cr.at && lt < cr.at + 0.7) { X.save(); X.globalAlpha = 1 - U(lt, cr.at + 0.2, cr.at + 0.7); soundLines(ex + 30, 680, 0, 3, 10, 6950, P.ink, 2); X.restore(); }
    // brass plates: two accounts of one room
    const pa = plU, txtH = 'The kitchen of No. 7, as Hanna Rusk remembers it.', txtE = 'The kitchen of No. 7, as Emil Rusk remembers it.';
    if (pa > 0) {
      plate(KCX - 330, 694, 160, 30, txtH, 6400, { fs: 7.6, n: Math.floor(txtH.length * clamp(pa * 2)) });
      plate(KCX + 170, 694, 160, 30, txtE, 6410, { fs: 7.6, n: Math.floor(txtE.length * clamp(pa * 2 - 1)) });
    }
  });
};

SHOTS.photo = (lt, sd) => {
  const c = camFor(lt, [[0, ON(640, 360, 1.0)], [0.1, ON(640, 360, 1.08), sd]]);
  cam(c, () => {
    X.fillStyle = '#e2d6b8'; X.fillRect(-600, -600, 2500, 1900);
    X.save(); X.fillStyle = 'rgba(28,24,20,.3)'; for (let i = 0; i < 1600; i++) X.fillRect(-100 + hash(i, 11) * 1500, -60 + hash(i, 12) * 860, 1.3, 1.3); X.restore();
    print_(640, 350, 780, 'kitchen', 4150, { rot: PRINTS[5].rot, num: 'BR 34/031', cap: 'No. 7, kitchen, after clearance', cols: 96 });
  });
};

SHOTS.end = (lt) => {
  X.fillStyle = P.paper; X.fillRect(0, 0, W, H);
  X.globalAlpha = seg(lt, 0.6, 1.8);
  txt('THE HOUSE THAT LANGUAGE BUILT', CX, 270, 30, {});
  txt('a fable of Edifiction', CX, 318, 22, { italic: true });
  txt('after notes by Watson Hartsoe', CX, 380, 17, { italic: true });
  txt('in the manner of Stanisław Lem', CX, 408, 17, { italic: true });
  X.globalAlpha = seg(lt, 1.6, 2.6); txt('IV.  The Perfect Description of an Empty Room', CX, 470, 14, { mono: true });
  X.globalAlpha = 1;
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
  const fade = sh.shot === 'title' ? Math.max(1 - seg(lt, 0, 0.6), seg(lt, sd - 0.7, sd)) : sh.shot === 'end' ? Math.max(1 - seg(lt, 0, 0.5), seg(lt, sd - 1.2, sd)) : sh.shot === 'photo' ? Math.max(1 - seg(lt, 0, 1.6), seg(lt, sd - 1.0, sd)) : Math.max(1 - seg(lt, 0, 0.5), seg(lt, sd - 0.35, sd));
  if (fade > 0) { X.fillStyle = P.paper; X.globalAlpha = fade; X.fillRect(0, 0, W, H); X.globalAlpha = 1; }
  border();
};
(async () => {
  T = await (await fetch('timing/er.json')).json();
  await document.fonts.ready; await Promise.all(['IM Fell English', 'IBM Plex Mono'].map((n) => document.fonts.load(`20px "${n}"`))); await document.fonts.load(`italic 20px "IM Fell English"`);
  X = document.getElementById('film').getContext('2d');
  window.__NF = Math.ceil(T.dur * 24); window.__T = T; window.__ready = true;
})();
