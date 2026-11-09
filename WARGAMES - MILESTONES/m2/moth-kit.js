/* moth-kit.js — BUG and NIT drawing kit, extracted unchanged from cinema.html (LAST MOVE cartoon cinema). */
(function (root) {
'use strict';
const W = 1280, H = 720;

/* ---------- palette ---------- */
const PAL = {
  black: '#050505', ink: '#efe9dd', dim: '#8a8378', hi: '#e8c070',
  phos: '#4af6c3', phosDim: '#0f5c47', cyan: '#45e3ff', red: '#e0523c', mag: '#ea4c89',
  line: '#17110c',
  wall: '#11100e', wall2: '#181613', floor: '#0c0b0a',
  amber: '#ffb347'
};

/* ---------- math ---------- */
const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const lerp = (a, b, k) => a + (b - a) * k;
const ramp = (t, a, b) => clamp((t - a) / (b - a));
const TAU = Math.PI * 2;
function hash(n) { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); }
function noise1(x) { const i = Math.floor(x), f = x - i, u = f * f * (3 - 2 * f); return hash(i) * (1 - u) + hash(i + 1) * u; }
const E = {
  lin: k => k,
  io: k => k < .5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2,
  out: k => 1 - Math.pow(1 - k, 3),
  in: k => k * k * k,
  back: k => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(k - 1, 3) + c1 * Math.pow(k - 1, 2); },
  elastic: k => k === 0 || k === 1 ? k : Math.pow(2, -10 * k) * Math.sin((k * 10 - .75) * (TAU / 3)) + 1,
  step: k => k < 1 ? 0 : 1,
  smooth: k => k * k * (3 - 2 * k)
};
/* keyframes: kf(t, [[t0,v0],[t1,v1,ease?],...]) ; v may be number or array */
function kf(t, keys, ease) {
  if (!keys.length) return 0;
  if (t <= keys[0][0]) return keys[0][1];
  for (let i = 1; i < keys.length; i++) {
    const [t1, v1, e1] = keys[i];
    if (t <= t1) {
      const [t0, v0] = keys[i - 1];
      const fn = e1 || ease || E.io;
      const k = fn(clamp((t - t0) / Math.max(1e-6, t1 - t0)));
      if (Array.isArray(v0)) return v0.map((a, j) => lerp(a, v1[j], k));
      if (typeof v0 === 'string') return k < 1 ? v0 : v1;
      return lerp(v0, v1, k);
    }
  }
  return keys[keys.length - 1][1];
}
/* discrete: pick value of last key <= t */
function pick(t, keys) { let v = keys[0][1]; for (const [k, val] of keys) if (t >= k) v = val; return v; }

/* ============================================================
   Drawing kit
   ============================================================ */
function Kit(ctx, T, frameIndex) {
  this.ctx = ctx; this.T = T; this.fi = frameIndex;
  this.boil = Math.floor(T * 8); // hand-drawn line boil at 8 changes / sec
}
const K = Kit.prototype;

/* ---- primitives ---- */
K.path = function (pts, close) { const c = this.ctx; c.beginPath(); pts.forEach((p, i) => i ? c.lineTo(p[0], p[1]) : c.moveTo(p[0], p[1])); if (close) c.closePath(); };
K.fillStroke = function (fill, stroke, lw) { const c = this.ctx; if (fill) { c.fillStyle = fill; c.fill(); } if (stroke) { c.strokeStyle = stroke; c.lineWidth = lw || 3; c.lineJoin = 'round'; c.lineCap = 'round'; c.stroke(); } };
K.rect = function (x, y, w, h, fill, stroke, lw) { const c = this.ctx; c.beginPath(); c.rect(x, y, w, h); this.fillStroke(fill, stroke, lw); };
K.rrect = function (x, y, w, h, r, fill, stroke, lw) { const c = this.ctx; c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r); c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath(); this.fillStroke(fill, stroke, lw); };
K.circle = function (x, y, r, fill, stroke, lw) { const c = this.ctx; c.beginPath(); c.arc(x, y, Math.max(0.01, r), 0, TAU); this.fillStroke(fill, stroke, lw); };
K.ellipse = function (x, y, rx, ry, rot, fill, stroke, lw) { const c = this.ctx; c.beginPath(); c.ellipse(x, y, Math.max(.01, rx), Math.max(.01, ry), rot || 0, 0, TAU); this.fillStroke(fill, stroke, lw); };
K.line = function (x1, y1, x2, y2, col, lw) { const c = this.ctx; c.beginPath(); c.moveTo(x1, y1); c.lineTo(x2, y2); c.strokeStyle = col; c.lineWidth = lw || 2; c.lineCap = 'round'; c.stroke(); };
K.save = function () { this.ctx.save(); }; K.restore = function () { this.ctx.restore(); };
K.alpha = function (a, fn) { const c = this.ctx; c.save(); c.globalAlpha *= clamp(a); fn(); c.restore(); };
K.at = function (x, y, s, rot, fn) { const c = this.ctx; c.save(); c.translate(x, y); if (rot) c.rotate(rot); if (s !== 1) c.scale(s, s); fn(); c.restore(); };
K.text = function (str, x, y, o = {}) {
  const c = this.ctx; c.save();
  c.font = `${o.weight || 500} ${o.size || 16}px ${o.font || "'IBM Plex Mono', ui-monospace, monospace"}`;
  c.textAlign = o.align || 'left'; c.textBaseline = o.base || 'alphabetic';
  if (o.ls) { try { c.letterSpacing = o.ls + 'px'; } catch (e) { } }
  if (o.glow) { c.shadowColor = o.glow; c.shadowBlur = o.blur || 12; }
  c.fillStyle = o.color || PAL.ink; c.globalAlpha *= (o.alpha == null ? 1 : o.alpha);
  c.fillText(str, x, y); c.restore();
};
K.serif = function (str, x, y, o = {}) { this.text(str, x, y, Object.assign({ font: "'Fraunces', Georgia, serif", weight: 300 }, o)); };

/* fuzzy closed blob (for moth fur and soft props). line boil via seed */
K.fuzz = function (cx, cy, rx, ry, bumps, amp, seed) {
  const c = this.ctx, n = bumps * 3; c.beginPath();
  for (let i = 0; i <= n; i++) {
    const a = i / n * TAU;
    const b = (i % 3 === 1) ? 1 + amp : 1 - amp * 0.15;
    const j = 1 + (hash(seed * 31 + i + this.boil * 7) - .5) * amp * .5;
    const x = cx + Math.cos(a) * rx * b * j, y = cy + Math.sin(a) * ry * b * j;
    if (i === 0) c.moveTo(x, y); else {
      const pa = (i - .5) / n * TAU;
      c.quadraticCurveTo(cx + Math.cos(pa) * rx * (1 + amp * .35), cy + Math.sin(pa) * ry * (1 + amp * .35), x, y);
    }
  }
  c.closePath();
};

/* camera: world coords are screen coords when cam = {x:640,y:360,z:1} */
K.cam = function (cam, depth, fn) {
  const c = this.ctx; const z = cam.z || 1; const d = depth == null ? 1 : depth;
  c.save();
  c.translate(W / 2, H / 2);
  if (cam.r) c.rotate(cam.r * d);
  const zz = 1 + (z - 1) * d;
  c.scale(zz, zz);
  c.translate(-(640 + ((cam.x || 640) - 640) * d), -(360 + ((cam.y || 360) - 360) * d));
  fn(); c.restore();
};

/* soft light pool */
K.glow = function (x, y, r, col, a) {
  const c = this.ctx; const g = c.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, col); g.addColorStop(1, 'rgba(0,0,0,0)');
  c.save(); c.globalAlpha *= (a == null ? 1 : a); c.globalCompositeOperation = 'lighter'; c.fillStyle = g; c.fillRect(x - r, y - r, r * 2, r * 2); c.restore();
};
K.shade = function (x, y, r, a) { // darkening pool
  const c = this.ctx; const g = c.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, `rgba(0,0,0,${a})`); g.addColorStop(1, 'rgba(0,0,0,0)'); c.fillStyle = g; c.fillRect(x - r, y - r, r * 2, r * 2);
};
K.shadow = function (x, y, w, a) { this.ellipse(x, y, w, w * .18, 0, `rgba(0,0,0,${a == null ? .45 : a})`); };

/* ============================================================
   WORLD MAP (stylized dot-matrix for the big board)
   ============================================================ */
const MAP = [
"                                                                        ",
"        ....  ......                    ....                            ",
"   ..........................     ..   ...............................  ",
"  ............................   .   .................................. ",
"    ...........................     ....................................",
"      .......................      ....  ...............................",
"       .....................       .. ...............................   ",
"        ...............            ......................  .........    ",
"         ............             .........................   ....      ",
"          ..........  .           ..........  ..........     ..         ",
"           ......                  ........     .......     .           ",
"             ....                   .......      ....     ...           ",
"              .....                  ......       .        ..           ",
"               ......                .....                  .           ",
"               ........               ...                  ....         ",
"               ..........              ..                .......        ",
"                .........              .                 ........       ",
"                 .......                                  ......        ",
"                  .....                                     .           ",
"                  ...                                                   ",
"                  ..                                                    "];

K.bigBoard = function (x, y, w, h, o = {}) {
  const c = this.ctx, T = this.T;
  this.rect(x - 10, y - 10, w + 20, h + 20, '#0a0a09', '#2a2620', 3);
  this.rect(x, y, w, h, '#020504');
  const cols = MAP[0].length, rows = MAP.length, cw = w / cols, ch = h / rows;
  c.save();
  for (let r = 0; r < rows; r++) for (let q = 0; q < cols; q++) {
    const land = MAP[r][q] === '.';
    const px = x + (q + .5) * cw, py = y + (r + .5) * ch;
    if (land) { c.fillStyle = o.col || '#2fbf93'; c.globalAlpha = .55 + .2 * noise1(q * .3 + r + T * .3); }
    else { c.fillStyle = '#0d3b2f'; c.globalAlpha = .35; }
    c.beginPath(); c.arc(px, py, Math.min(cw, ch) * (land ? .32 : .14), 0, TAU); c.fill();
  }
  c.restore();
  // traces (arcs) — o.arcs: [[x0,y0,x1,y1,progress]] in 0..1 coords
  (o.arcs || []).forEach(a => {
    const [ax, ay, bx, by, p, col] = a; if (p <= 0) return;
    c.save(); c.strokeStyle = col || PAL.red; c.lineWidth = 2.5; c.shadowColor = col || PAL.red; c.shadowBlur = 10;
    c.beginPath();
    const n = 40, X0 = x + ax * w, Y0 = y + ay * h, X1 = x + bx * w, Y1 = y + by * h, mx = (X0 + X1) / 2, my = Math.min(Y0, Y1) - h * .3;
    for (let i = 0; i <= n * clamp(p); i++) { const k = i / n; const px = (1 - k) * (1 - k) * X0 + 2 * (1 - k) * k * mx + k * k * X1, py = (1 - k) * (1 - k) * Y0 + 2 * (1 - k) * k * my + k * k * Y1; i ? c.lineTo(px, py) : c.moveTo(px, py); }
    c.stroke(); c.restore();
  });
  // header strip
  if (o.label !== false) {
    this.text(o.label || 'STATE  BOARD', x + 12, y + 22, { size: 13, color: PAL.hi, ls: 3, glow: PAL.hi, blur: 6 });
    this.text(o.right || 'MAKER / CHECKER', x + w - 12, y + 22, { size: 13, color: PAL.phos, align: 'right', ls: 3, glow: PAL.phos, blur: 6 });
  }
  this.glow(x + w / 2, y + h / 2, w * .6, 'rgba(47,191,147,0.10)');
};

/* ============================================================
   ROOMS
   ============================================================ */
K.room = function (o = {}) {
  const c = this.ctx, T = this.T;
  const horizon = o.horizon || 470;
  const X0 = o.x0 == null ? -400 : o.x0, X1 = o.x1 == null ? W + 400 : o.x1, XW = X1 - X0;
  // wall
  const g = c.createLinearGradient(0, 0, 0, horizon);
  g.addColorStop(0, o.wallTop || '#0b0a09'); g.addColorStop(1, o.wallBot || '#1a1714');
  c.fillStyle = g; c.fillRect(X0, -400, XW, horizon + 400);
  // panel seams
  c.strokeStyle = 'rgba(255,240,210,0.045)'; c.lineWidth = 2;
  for (let x = X0; x < X1; x += 160) { c.beginPath(); c.moveTo(x, -400); c.lineTo(x, horizon); c.stroke(); }
  c.strokeStyle = 'rgba(0,0,0,0.5)'; c.beginPath(); c.moveTo(X0, horizon - 70); c.lineTo(X1, horizon - 70); c.stroke();
  // floor
  const fg = c.createLinearGradient(0, horizon, 0, H + 300);
  fg.addColorStop(0, o.floorTop || '#14120f'); fg.addColorStop(1, o.floorBot || '#060505');
  c.fillStyle = fg; c.fillRect(X0, horizon, XW, H + 400);
  c.strokeStyle = 'rgba(232,192,112,0.06)'; c.lineWidth = 1.5;
  const cxm = (X0 + X1) / 2, ni = Math.ceil(XW / 120); for (let i = -ni; i <= ni; i++) { c.beginPath(); c.moveTo(cxm + i * 60, horizon); c.lineTo(cxm + i * 260, H + 300); c.stroke(); }
  for (let j = 1; j < 9; j++) { const y = horizon + Math.pow(j / 9, 1.8) * (H + 300 - horizon); c.beginPath(); c.moveTo(X0, y); c.lineTo(X1, y); c.stroke(); }
  c.strokeStyle = 'rgba(0,0,0,.6)'; c.lineWidth = 3; c.beginPath(); c.moveTo(X0, horizon); c.lineTo(X1, horizon); c.stroke();
};

/* desk: front edge at y, centered x, width w */
K.desk = function (x, y, w, o = {}) {
  const top = o.top || '#3a2b1e', front = o.front || '#24190f';
  this.rect(x - w / 2, y - 16, w, 16, top, PAL.line, 3);
  this.rect(x - w / 2 + 8, y, w - 16, o.h || 140, front, PAL.line, 3);
  this.line(x - w / 2 + 8, y + 40, x + w / 2 - 8, y + 40, 'rgba(0,0,0,.35)', 2);
  this.rect(x - 22, y + 16, 44, 8, '#4a3a2a', PAL.line, 2);
};

/* ============================================================
   CRT TERMINAL — screenFn(kit, w, h) draws in screen space
   ============================================================ */
K.crt = function (x, y, s, screenFn, o = {}) {
  const c = this.ctx, T = this.T;
  const w = 230, h = 170; // shell size at s=1, origin = bottom center of shell
  c.save(); c.translate(x, y); c.scale(s, s);
  const shell = o.shell || '#c9bc9c', shellDk = o.shellDk || '#8f8466';
  // keyboard
  if (o.keyboard !== false) {
    this.path([[-120, 4], [120, 4], [132, 34], [-132, 34]], true); this.fillStroke(shellDk, PAL.line, 3);
    for (let r = 0; r < 3; r++) for (let q = 0; q < 12; q++) {
      const kx = -104 + q * 18 + r * 4, ky = 9 + r * 8;
      const pressed = o.keyPress && hash(q * 3 + r * 11 + Math.floor(T * 14)) > 0.85;
      this.rect(kx, ky + (pressed ? 1.5 : 0), 13, 6, pressed ? '#d8cfb4' : '#b3a888', 'rgba(23,17,12,.6)', 1);
    }
  }
  // shell
  this.rrect(-w / 2, -h - 8, w, h, 14, shell, PAL.line, 3.5);
  this.rect(-w / 2 + 6, -24, w - 12, 10, shellDk);
  this.circle(w / 2 - 22, -19, 4, o.led || (o.on === false ? '#3a2a20' : PAL.red), PAL.line, 1.5);
  // screen bezel
  const sx = -w / 2 + 18, sy = -h + 6, sw = w - 36, sh = h - 46;
  this.rrect(sx - 6, sy - 6, sw + 12, sh + 12, 10, '#1b1915', PAL.line, 3);
  c.save();
  c.beginPath(); c.rect(sx, sy, sw, sh); c.clip();
  c.fillStyle = o.on === false ? '#070807' : '#03110c'; c.fillRect(sx, sy, sw, sh);
  if (o.on !== false && screenFn) { c.save(); c.translate(sx, sy); screenFn(this, sw, sh); c.restore(); }
  // scanlines
  c.fillStyle = 'rgba(0,0,0,0.22)'; for (let yy = sy; yy < sy + sh; yy += 3) c.fillRect(sx, yy, sw, 1);
  // vignette glass
  const vg = c.createRadialGradient(sx + sw / 2, sy + sh / 2, sw * .2, sx + sw / 2, sy + sh / 2, sw * .75);
  vg.addColorStop(0, 'rgba(255,255,255,0.03)'); vg.addColorStop(1, 'rgba(0,0,0,0.55)'); c.fillStyle = vg; c.fillRect(sx, sy, sw, sh);
  // glass highlight
  c.fillStyle = 'rgba(255,255,255,0.05)'; c.beginPath(); c.ellipse(sx + sw * .3, sy + sh * .2, sw * .35, sh * .12, -.2, 0, TAU); c.fill();
  c.restore();
  c.restore();
  if (o.on !== false && o.glow !== false) this.glow(x, y - 100 * s, 260 * s, o.glowCol || 'rgba(74,246,195,0.16)');
};
/* screen helpers (call inside screenFn with screen-space coords) */
K.scr = function (str, x, y, size, col, o = {}) {
  this.text(str, x, y, Object.assign({ size: size || 12, color: col || PAL.phos, glow: col || PAL.phos, blur: 8, weight: 500 }, o));
};
/* typed text helper: reveal chars by time */
K.typed = function (str, t, cps) { const n = Math.floor(Math.max(0, t) * (cps || 18)); return str.slice(0, n); };
K.cursor = function (x, y, size, col) { if (Math.floor(this.T * 2.2) % 2 === 0) this.rect(x, y - size * .85, size * .55, size, col || PAL.phos); };

/* ============================================================
   LAST MOVE — the game BUG and NIT are building (continuity!)
   st: {mode:'title'|'play'|'end'|'blank'|'error'|'boot'|'code'|'flow',
        cells:'X.O......', label, result, missing:bool, hl:index, fps, lines:[] }
   ============================================================ */
K.lastMove = function (st) {
  const self = this;
  return function (g, w, h) {
    const P = st.col || PAL.phos, T = g.T;
    const mode = st.mode || 'title';
    if (mode === 'blank') { if (st.cursor !== false) g.cursor(10, 20, 12, P); return; }
    if (mode === 'boot') {
      const lines = st.lines || ['LOADING LAST_MOVE.ZIP', 'EXTRACT ...'];
      lines.forEach((l, i) => g.scr(l, 10, 18 + i * 15, 11, P));
      g.cursor(10 + (lines[lines.length - 1] || '').length * 6.6, 18 + (lines.length - 1) * 15, 11, P);
      return;
    }
    if (mode === 'error') {
      const lines = st.lines || ['ERROR', 'x.png NOT FOUND'];
      g.rect(0, 0, w, h, 'rgba(224,82,60,0.10)');
      lines.forEach((l, i) => g.scr(l, 10, 22 + i * 16, i === 0 ? 14 : 11, i === 0 ? PAL.red : P));
      return;
    }
    if (mode === 'code' || mode === 'text') {
      const lines = st.lines || [];
      lines.forEach((l, i) => {
        const hl = st.hl === i;
        if (hl) g.rect(4, 8 + i * 13, w - 8, 13, 'rgba(232,192,112,0.18)');
        g.scr(l, 8, 18 + i * 13, 10, hl ? PAL.hi : P);
      });
      return;
    }
    if (mode === 'title') {
      g.scr('LAST MOVE', w / 2, h * .42, 22, P, { align: 'center', weight: 500, ls: 3 });
      g.scr('A GAME OF X AND O', w / 2, h * .42 + 18, 9, P, { align: 'center', alpha: .7, ls: 2 });
      const lab = st.label || 'PRESS ANY KEY';
      if (Math.floor(T * 1.6) % 2 === 0 || st.steady) g.scr(lab, w / 2, h * .8, 10, st.labelCol || PAL.hi, { align: 'center', ls: 1.5 });
      return;
    }
    // board
    const cells = (st.cells || '.........').split('');
    const bs = Math.min(w, h) * .74, bx = (w - bs) / 2, by = (h - bs) / 2 + 4, cs = bs / 3;
    g.ctx.save(); g.ctx.shadowColor = P; g.ctx.shadowBlur = 8;
    for (let i = 1; i < 3; i++) { g.line(bx + i * cs, by + 4, bx + i * cs, by + bs - 4, P, 2.2); g.line(bx + 4, by + i * cs, bx + bs - 4, by + i * cs, P, 2.2); }
    cells.forEach((v, i) => {
      const cx = bx + (i % 3 + .5) * cs, cy = by + (Math.floor(i / 3) + .5) * cs, r = cs * .28;
      if (st.hl === i) g.rect(cx - cs / 2 + 3, cy - cs / 2 + 3, cs - 6, cs - 6, 'rgba(232,192,112,0.25)');
      if (v === 'X') {
        if (st.missing) { g.rect(cx - r * 1.1, cy - r * 1.1, r * 2.2, r * 2.2, 'rgba(224,82,60,0.15)', PAL.red, 2.5); g.scr('?', cx, cy + r * .55, r * 1.6, PAL.red, { align: 'center', weight: 600 }); }
        else { g.line(cx - r, cy - r, cx + r, cy + r, PAL.hi, 3); g.line(cx + r, cy - r, cx - r, cy + r, PAL.hi, 3); }
      }
      if (v === 'O') g.circle(cx, cy, r, null, P, 3);
    });
    g.ctx.restore();
    if (st.top) g.scr(st.top, 8, 13, 9, P, { alpha: .8 });
    if (mode === 'end') {
      g.rect(0, h * .38, w, h * .24, 'rgba(3,17,12,0.85)');
      g.scr(st.result || 'DRAW', w / 2, h * .5 + 8, 22, PAL.hi, { align: 'center', ls: 4 });
      if (st.sub) g.scr(st.sub, w / 2, h * .5 + 22, 8, P, { align: 'center', alpha: .8 });
    }
  };
};

/* ============================================================
   PROPS
   ============================================================ */
K.zip = function (x, y, s, o = {}) { // a cardboard box labeled ZIP; origin bottom center
  this.at(x, y, s, o.rot || 0, () => {
    const open = o.open || 0;
    this.rect(-34, -46, 68, 46, '#b98a52', PAL.line, 3);
    this.rect(-34, -46, 68, 9, '#a3773f', PAL.line, 2);
    if (open > 0) {
      this.path([[-34, -46], [-34 - 20 * open, -46 - 22 * open], [-6, -46 - 26 * open], [0, -46]], true); this.fillStroke('#c99a5e', PAL.line, 2.5);
      this.path([[34, -46], [34 + 20 * open, -46 - 22 * open], [6, -46 - 26 * open], [0, -46]], true); this.fillStroke('#c99a5e', PAL.line, 2.5);
    } else this.line(0, -46, 0, -37, PAL.line, 2);
    this.rect(-22, -30, 44, 18, '#efe3c6', PAL.line, 2);
    this.text(o.label || '.ZIP', 0, -17, { size: 11, color: '#3a2a18', align: 'center', weight: 600 });
  });
};
K.clipboard = function (x, y, s, o = {}) { // centered
  this.at(x, y, s, o.rot || 0, () => {
    this.rect(-22, -30, 44, 60, '#7a5634', PAL.line, 3);
    this.rect(-17, -24, 34, 50, '#f3ecd9', PAL.line, 1.5);
    this.rect(-9, -34, 18, 9, '#9aa3a8', PAL.line, 2);
    const n = o.lines == null ? 5 : o.lines;
    for (let i = 0; i < n; i++) { this.line(-12, -15 + i * 8, 6 + hash(i) * 6, -15 + i * 8, 'rgba(40,30,20,.55)', 1.5); }
    (o.checks || []).forEach((v, i) => { const yy = -15 + i * 8; if (v === 1) { this.line(8, yy, 10, yy + 2, '#2e8a5a', 2); this.line(10, yy + 2, 14, yy - 3, '#2e8a5a', 2); } else if (v === -1) { this.line(8, yy - 2, 13, yy + 2, PAL.red, 2); this.line(13, yy - 2, 8, yy + 2, PAL.red, 2); } else if (v === 0) { this.circle(11, yy, 2, null, '#8a7a60', 1.2); } });
  });
};
K.pencil = function (x, y, s, rot) { this.at(x, y, s, rot || 0, () => { this.rect(-3, -26, 6, 40, '#e8c070', PAL.line, 2); this.path([[-3, 14], [3, 14], [0, 22]], true); this.fillStroke('#f0d8b0', PAL.line, 1.5); this.rect(-3, -30, 6, 5, '#e88aa0', PAL.line, 1.5); }); };
K.disk = function (x, y, s, o = {}) { // 5.25 floppy
  this.at(x, y, s, o.rot || 0, () => {
    this.rect(-26, -26, 52, 52, o.col || '#1d1d22', PAL.line, 2.5);
    this.circle(0, 0, 8, '#6b5a40', PAL.line, 1.5); this.circle(0, 0, 3, '#0a0a0a');
    this.rect(-4, 10, 8, 14, '#6b5a40');
    this.rect(-20, -22, 40, 12, o.labelCol || '#efe3c6');
    this.text(o.label || 'v1', 0, -13, { size: 8, color: '#222', align: 'center', weight: 600 });
  });
};
K.note = function (x, y, s, str, o = {}) { // sticky note / paper slip
  this.at(x, y, s, o.rot || 0, () => {
    const w = o.w || 120, h = o.h || 46;
    this.rect(-w / 2 + 3, -h / 2 + 4, w, h, 'rgba(0,0,0,.35)');
    this.rect(-w / 2, -h / 2, w, h, o.col || '#f3e6b8', PAL.line, 2);
    const lines = String(str).split('\n');
    lines.forEach((l, i) => this.text(l, 0, -h / 2 + 18 + i * 14, { size: o.size || 11, color: o.ink || '#2a2015', align: 'center', weight: 600 }));
  });
};
K.polaroid = function (x, y, s, rot, screenFn) {
  this.at(x, y, s, rot || 0, () => {
    this.rect(-50, -56, 100, 116, '#f4efe2', PAL.line, 2.5);
    const c = this.ctx; c.save(); c.beginPath(); c.rect(-42, -48, 84, 80); c.clip(); c.fillStyle = '#03110c'; c.fillRect(-42, -48, 84, 80);
    if (screenFn) { c.translate(-42, -48); screenFn(this, 84, 80); } c.restore();
  });
};
/* flowchart: nodes [{id,label,x,y}], edges [{a,b,label}], active id, o.col */
K.flow = function (nodes, edges, o = {}) {
  const map = {}; nodes.forEach(n => map[n.id] = n);
  edges.forEach(e => {
    const A = map[e.a], B = map[e.b]; if (!A || !B) return;
    const col = e.col || o.col || PAL.ink; const p = e.p == null ? 1 : e.p;
    if (p <= 0) return;
    const ex = lerp(A.x, B.x, p), ey = lerp(A.y, B.y, p);
    this.line(A.x, A.y, ex, ey, col, e.lw || 2.5);
    if (p >= 1) { const ang = Math.atan2(B.y - A.y, B.x - A.x), bx = B.x - Math.cos(ang) * 48, by = B.y - Math.sin(ang) * 26; this.path([[bx, by], [bx - Math.cos(ang - .45) * 12, by - Math.sin(ang - .45) * 12], [bx - Math.cos(ang + .45) * 12, by - Math.sin(ang + .45) * 12]], true); this.fillStroke(col); }
    if (e.label && p >= 1) this.text(e.label, (A.x + B.x) / 2, (A.y + B.y) / 2 - 8, { size: e.size || 11, color: e.lcol || PAL.hi, align: 'center' });
  });
  nodes.forEach(n => {
    const on = o.active === n.id; const w = n.w || 92, h = n.h || 40;
    if (on) this.glow(n.x, n.y, 90, 'rgba(232,192,112,0.35)');
    this.rect(n.x - w / 2, n.y - h / 2, w, h, on ? '#2a2112' : '#0d0c0a', on ? PAL.hi : (o.col || PAL.ink), on ? 3 : 2);
    this.text(n.label, n.x, n.y + 5, { size: n.size || 13, color: on ? PAL.hi : (o.col || PAL.ink), align: 'center', ls: 1.5 });
  });
};

/* ============================================================
   MOTH RIG — BUG (maker, amber) and NIT (checker, silver)
   origin = feet on ground. pose p:
     who, s, f (facing -1..1), lx, ly (look), ex (expression), blink,
     aL, aR (arm raise radians), bL, bR (elbow bend), wing (0..1), flap (0..1 amount),
     sq (squash/stretch, 1 normal), lean, step (walk phase 0..1, legs),
     hold: {R:'clipboard'|'zip'|'pencil'|'disk'|'note'|'pin', L:...}, talk (0..1), rim:{col,side}
   ============================================================ */
const CH = {
  bug: {
    body: { cy: -60, rx: 42, ry: 46, col: '#dc9b3c', dk: '#a86a22' },
    ruff: { cy: -98, rx: 34, ry: 18, col: '#f5e3b9' },
    head: { cy: -128, r: 38, col: '#e8ad4d', dk: '#b97c2b' },
    eye: { dx: 16, dy: -3, rx: 14, ry: 17 },
    ant: { len: 50, spread: .55, curl: .5, col: '#5a3b22' },
    wing: { span: 118, h: 92, col: '#9e6d56', band: '#6c4535', spot: '#e8c070', low: '#86594a' },
    limb: '#5a3b22', leg: 14, specs: false
  },
  nit: {
    body: { cy: -70, rx: 29, ry: 54, col: '#e2ddcf', dk: '#aaa392' },
    ruff: { cy: -118, rx: 26, ry: 14, col: '#fbf8ef' },
    head: { cy: -144, r: 31, col: '#ece7d9', dk: '#b8b2a2' },
    eye: { dx: 13, dy: -2, rx: 10.5, ry: 13 },
    ant: { len: 62, spread: .32, curl: .18, col: '#3d4c5c' },
    wing: { span: 104, h: 104, col: '#5d7184', band: '#3b4a5a', spot: '#4af6c3', low: '#4c5e70' },
    limb: '#3d4c5c', leg: 16, specs: true
  },
  // a third generic visitor for playtests/recipient (original): PEER beetle-ish moth, recolor
  peer: {
    body: { cy: -58, rx: 36, ry: 44, col: '#8fae6a', dk: '#5d7d3e' },
    ruff: { cy: -94, rx: 28, ry: 15, col: '#d9e6b8' },
    head: { cy: -122, r: 33, col: '#a0bd78', dk: '#6d8d4c' },
    eye: { dx: 14, dy: -2, rx: 12, ry: 14 },
    ant: { len: 40, spread: .7, curl: .7, col: '#3a4a2a' },
    wing: { span: 100, h: 80, col: '#7a5f8f', band: '#54406a', spot: '#ea4c89', low: '#665077' },
    limb: '#3a4a2a', leg: 13, specs: false
  },
  peer2: {
    body: { cy: -56, rx: 34, ry: 40, col: '#c7746a', dk: '#93473f' },
    ruff: { cy: -90, rx: 27, ry: 15, col: '#f2cfc4' },
    head: { cy: -117, r: 32, col: '#d4867b', dk: '#9d554c' },
    eye: { dx: 13, dy: -2, rx: 12, ry: 14 },
    ant: { len: 44, spread: .45, curl: .9, col: '#4a2a26' },
    wing: { span: 98, h: 84, col: '#4f6f6a', band: '#33504c', spot: '#e8c070', low: '#41605b' },
    limb: '#4a2a26', leg: 13, specs: false
  }
};
const EXPR = {
  neutral: { lid: .18, brow: 0, by: 0, mouth: 'smile', m: .25 },
  happy: { lid: .08, brow: -.15, by: -3, mouth: 'grin', m: .8 },
  proud: { lid: .45, brow: -.1, by: -2, mouth: 'smile', m: .7 },
  worried: { lid: 0, brow: .45, by: -4, mouth: 'wobble', m: .5, pupil: .8 },
  surprised: { lid: 0, brow: -.05, by: -8, mouth: 'o', m: .8, pupil: .55 },
  focused: { lid: .38, brow: -.3, by: 2, mouth: 'flat', m: .3 },
  annoyed: { lid: .5, brow: -.45, by: 3, mouth: 'frown', m: .4 },
  sad: { lid: .3, brow: .5, by: -2, mouth: 'frown', m: .6 },
  determined: { lid: .25, brow: -.35, by: 2, mouth: 'flat', m: .5 },
  skeptic: { lid: .3, brow: -.2, by: 0, mouth: 'flat', m: .3, asym: true },
  shock: { lid: 0, brow: -.1, by: -10, mouth: 'o', m: 1.2, pupil: .4 },
  sleepy: { lid: .7, brow: .1, by: 1, mouth: 'flat', m: .2 },
  laugh: { lid: .9, brow: -.2, by: -3, mouth: 'grin', m: 1.1, closed: true }
};

K.moth = function (x, y, p = {}) {
  const c = this.ctx, T = this.T;
  const D = CH[p.who || 'bug'];
  const s = p.s || 1, f = clamp(p.f || 0, -1, 1), sq = p.sq || 1;
  const ex = Object.assign({}, EXPR[p.ex || 'neutral'] || EXPR.neutral);
  // idle breathing (subtle, not constant wobble)
  const br = p.still ? 0 : Math.sin(T * 2.1 + (p.who === 'nit' ? 1.3 : 0)) * .012;
  c.save(); c.translate(x, y); c.scale(s, s);
  // shadow on ground (does not stretch with body)
  const hov = p.hover || 0;
  if (p.shadow !== false) this.ellipse(0, 2, 52 * (1 - hov / 400), 9 * (1 - hov / 400), 0, `rgba(0,0,0,${.45 * (1 - hov / 300)})`);
  c.translate(0, -hov);
  c.rotate(p.lean || 0);
  c.scale(1 / Math.sqrt(sq) * (1 - br * .5), sq * (1 + br));
  const ol = PAL.line, lw = 3.4;

  /* ---- wings (behind) ---- */
  const wingOpen = p.wing == null ? .4 : p.wing;
  const flapAmt = p.flap || 0;
  const flapA = Math.sin(T * 22) * flapAmt;
  const drawWing = (side) => {
    const near = side === Math.sign(f || 1) ? 1 : 0;
    const sx = side * (1 - Math.abs(f) * (near ? .1 : .55));
    c.save(); c.translate(side * D.body.rx * .35, D.body.cy - D.body.ry * .55);
    c.rotate(side * (-.25 - wingOpen * .5 - flapA * .6));
    c.scale(sx * (1 - Math.abs(flapA) * .25), 1);
    const span = D.wing.span * (.72 + wingOpen * .28), hh = D.wing.h;
    // lower wing
    c.beginPath(); c.moveTo(0, 10); c.bezierCurveTo(span * .3, 30, span * .75, 50, span * .55, hh * .72); c.bezierCurveTo(span * .3, hh * .8, span * .05, hh * .5, 0, 20); c.closePath();
    this.fillStroke(D.wing.low, ol, lw * .8);
    // upper wing
    c.beginPath(); c.moveTo(0, 0); c.bezierCurveTo(span * .3, -hh * .55, span * 1.05, -hh * .55, span, -hh * .05);
    c.bezierCurveTo(span * .95, hh * .25, span * .45, hh * .35, 0, 18); c.closePath();
    this.fillStroke(D.wing.col, ol, lw);
    c.save(); c.clip();
    c.strokeStyle = D.wing.band; c.lineWidth = 9; c.beginPath(); c.moveTo(span * .35, -hh * .4); c.quadraticCurveTo(span * .55, 0, span * .4, hh * .3); c.stroke();
    c.fillStyle = 'rgba(255,255,255,.08)'; c.beginPath(); c.ellipse(span * .6, -hh * .25, span * .3, hh * .12, -.3, 0, TAU); c.fill();
    c.restore();
    this.circle(span * .72, -hh * .12, 7, D.wing.spot, ol, 2); this.circle(span * .72, -hh * .12, 2.5, ol);
    c.restore();
  };
  drawWing(-1); drawWing(1);

  /* ---- legs ---- */
  const step = p.step || 0;
  [-1, 1].forEach((side, i) => {
    const ph = Math.sin((step + i * .5) * TAU);
    const lift = p.step != null ? Math.max(0, ph) * 8 : 0;
    const lx = side * 16 + f * 4 + (p.step != null ? ph * 6 : 0);
    this.line(lx * .8, D.body.cy + D.body.ry * .75, lx, -lift - 2, D.limb, 5);
    this.ellipse(lx + side * 3 + f * 3, -lift - 1, 8, 4, 0, D.limb, ol, 2);
  });

  /* ---- body ---- */
  const bodyGrad = c.createLinearGradient(-D.body.rx, D.body.cy - D.body.ry, D.body.rx * .6, D.body.cy + D.body.ry);
  bodyGrad.addColorStop(0, D.body.col); bodyGrad.addColorStop(1, D.body.dk);
  this.fuzz(0, D.body.cy, D.body.rx, D.body.ry, 14, .035, (p.who || 'bug').length * 3);
  this.fillStroke(bodyGrad, ol, lw);
  // belly segments
  c.save(); c.strokeStyle = 'rgba(60,30,10,.25)'; c.lineWidth = 2.5;
  for (let i = 0; i < 3; i++) { const yy = D.body.cy + D.body.ry * (.1 + i * .22); c.beginPath(); c.ellipse(f * 6, yy, D.body.rx * (.7 - i * .1), 6, 0, .2, Math.PI - .2); c.stroke(); }
  c.restore();
  // rim light
  if (p.rim) { c.save(); this.fuzz(0, D.body.cy, D.body.rx, D.body.ry, 14, .035, (p.who || 'bug').length * 3); c.clip(); this.glow(p.rim.side * D.body.rx * 1.1, D.body.cy - 10, D.body.rx * 1.2, p.rim.col, p.rim.a || .55); c.restore(); }

  /* ---- arms (behind ruff only if hands down) ---- */
  const hand = (side) => {
    const a = side < 0 ? (p.aL == null ? .25 : p.aL) : (p.aR == null ? .25 : p.aR);
    const b = side < 0 ? (p.bL || 0) : (p.bR || 0);
    const sx = side * D.body.rx * .85 + f * 6, sy = D.body.cy - D.body.ry * .45;
    const u = 30, l = 28;
    // a: upper-arm angle from hanging straight down, positive = swing outward/up; b: extra forearm bend
    const ex2 = sx + side * Math.sin(a) * u, ey2 = sy + Math.cos(a) * u;
    const a2 = a + b;
    const hx = ex2 + side * Math.sin(a2) * l, hy = ey2 + Math.cos(a2) * l;
    return { sx, sy, ex: ex2, ey: ey2, hx, hy, ang: a2, side };
  };
  const HL = hand(-1), HR = hand(1);
  const drawArm = (A, prop) => {
    c.strokeStyle = ol; c.lineWidth = 9; c.lineCap = 'round'; c.lineJoin = 'round';
    c.beginPath(); c.moveTo(A.sx, A.sy); c.lineTo(A.ex, A.ey); c.lineTo(A.hx, A.hy); c.stroke();
    c.strokeStyle = D.limb; c.lineWidth = 5.5; c.stroke();
    if (prop) this.prop(prop, A.hx, A.hy, A.side, A.ang);
    // mitt
    this.circle(A.hx, A.hy, 6.5, D.limb, ol, 2.4);
    this.line(A.hx, A.hy, A.hx + A.side * 8 * Math.sin(A.ang + .9), A.hy + 8 * Math.cos(A.ang + .9), D.limb, 4);
  };

  /* ---- ruff ---- */
  this.fuzz(f * 4, D.ruff.cy, D.ruff.rx, D.ruff.ry, 8, .22, 5 + (p.who || 'b').length);
  this.fillStroke(D.ruff.col, ol, lw);

  /* ---- head ---- */
  const hx = f * 6 + (p.hx || 0), hy = D.head.cy + (p.hy || 0);
  c.save(); c.translate(hx, hy); c.rotate(p.tilt || 0);
  // antennae
  [-1, 1].forEach(side => {
    const near = side === Math.sign(f || 1);
    const bx = side * D.head.r * .35 + f * D.head.r * .25, by = -D.head.r * .82;
    const ang = -Math.PI / 2 + side * D.ant.spread + (p.antWig ? Math.sin(T * 9 + side) * .12 * p.antWig : 0) + (p.antDroop || 0) * side;
    const L = D.ant.len * (near ? 1 : .92);
    const tx = bx + Math.cos(ang) * L, ty = by + Math.sin(ang) * L;
    const cx1 = bx + Math.cos(ang - side * D.ant.curl) * L * .6, cy1 = by + Math.sin(ang - side * D.ant.curl) * L * .6;
    c.strokeStyle = D.ant.col; c.lineWidth = 3.2; c.beginPath(); c.moveTo(bx, by); c.quadraticCurveTo(cx1, cy1, tx, ty); c.stroke();
    // feathery barbs
    for (let i = 3; i <= 9; i++) {
      const k = i / 10; const px = (1 - k) * (1 - k) * bx + 2 * (1 - k) * k * cx1 + k * k * tx, py = (1 - k) * (1 - k) * by + 2 * (1 - k) * k * cy1 + k * k * ty;
      const bl = 9 * Math.sin(k * Math.PI);
      this.line(px, py, px - side * bl * .6 - bl * .4, py - bl * .6, D.ant.col, 2);
      this.line(px, py, px + side * bl * .6 + bl * .3, py - bl * .3, D.ant.col, 2);
    }
  });
  const headGrad = c.createRadialGradient(-D.head.r * .3, -D.head.r * .4, 2, 0, 0, D.head.r * 1.15);
  headGrad.addColorStop(0, D.head.col); headGrad.addColorStop(1, D.head.dk);
  // fur tufts on crown
  [-1, 0, 1].forEach(q => { this.fuzz(q * D.head.r * .42, -D.head.r * .82, D.head.r * .26, D.head.r * .2, 5, .3, 40 + q); this.fillStroke(D.head.col, ol, lw * .8); });
  c.beginPath(); c.ellipse(0, 0, D.head.r * 1.08, D.head.r * .96, 0, 0, TAU);
  this.fillStroke(headGrad, ol, lw);
  // cheeks
  this.ellipse(f * D.head.r * .42 - D.head.r * .62, D.head.r * .32, D.head.r * .16, D.head.r * .09, 0, 'rgba(232,110,90,.28)');
  this.ellipse(f * D.head.r * .42 + D.head.r * .62, D.head.r * .32, D.head.r * .16, D.head.r * .09, 0, 'rgba(232,110,90,.28)');
  if (p.rim) { c.save(); c.beginPath(); c.ellipse(0, 0, D.head.r * 1.08, D.head.r * .96, 0, 0, TAU); c.clip(); this.glow(p.rim.side * D.head.r * 1.1, -6, D.head.r * 1.2, p.rim.col, p.rim.a || .55); c.restore(); }
  // face
  const fx = f * D.head.r * .32;
  const lid = clamp(p.blink != null ? Math.max(ex.lid, p.blink) : ex.lid);
  const blinkAuto = p.noBlink ? 0 : (((T + (p.who === 'nit' ? 1.7 : 0)) % 3.7) < .12 ? 1 : 0);
  const lidF = Math.max(lid, blinkAuto);
  const lookx = clamp(p.lx || 0, -1, 1), looky = clamp(p.ly || 0, -1, 1);
  [-1, 1].forEach(side => {
    const far = (side === -Math.sign(f)) && f !== 0;
    const sxk = far ? 1 - Math.abs(f) * .45 : 1;
    const ex0 = fx + side * D.eye.dx * (1 - Math.abs(f) * .3), ey0 = D.eye.dy;
    const rx = D.eye.rx * sxk, ry = D.eye.ry;
    // eye white
    this.ellipse(ex0, ey0, rx, ry, 0, '#fffaf0', ol, 2.4);
    // pupil
    const pr = ex.pupil || 1;
    const px = ex0 + lookx * rx * .45, py = ey0 + looky * ry * .4;
    if (ex.closed) { } else {
      this.ellipse(px, py + 1, rx * .62 * pr, ry * .66 * pr, 0, '#120c08');
      this.circle(px - rx * .22, py - ry * .25, 2.6 * pr + .6, '#ffffff');
    }
    // upper lid
    let l = lidF; if (ex.asym && side > 0) l = Math.max(0, l - .3);
    if (l > 0.01 || ex.closed) {
      c.save(); c.beginPath(); c.ellipse(ex0, ey0, rx + .5, ry + .5, 0, 0, TAU); c.clip();
      c.fillStyle = D.head.col; const ly0 = ey0 - ry + (ex.closed ? 1.15 : l) * ry * 2; c.fillRect(ex0 - rx - 2, ey0 - ry - 2, rx * 2 + 4, ly0 - (ey0 - ry) + 2);
      c.restore();
      const ly = ey0 - ry + (ex.closed ? .95 : l) * ry * 2;
      if (ex.closed) { c.strokeStyle = ol; c.lineWidth = 2.6; c.beginPath(); c.arc(ex0, ey0 + 3, rx * .8, Math.PI * 1.1, Math.PI * 1.9); c.stroke(); }
      else this.line(ex0 - rx * .95, ly, ex0 + rx * .95, ly, ol, 2.4);
    }
    // brows
    let bang = ex.brow * side; let byy = ey0 - ry - 6 + ex.by;
    if (ex.asym && side > 0) { bang = .25 * side; byy -= 6; }
    if (p.browUp) byy -= p.browUp;
    c.save(); c.translate(ex0, byy); c.rotate(bang); this.line(-rx * .8, 0, rx * .8, 0, ol, 3.2); c.restore();
    // spectacles
    if (D.specs) this.circle(ex0, ey0, Math.max(rx, ry) + 3.5, null, '#2b3540', 2.2);
  });
  if (D.specs) this.line(fx - D.eye.dx + D.eye.rx + 2, D.eye.dy - 2, fx + D.eye.dx - D.eye.rx - 2, D.eye.dy - 2, '#2b3540', 2);
  // mouth
  const mx = fx * 1.05, my = D.eye.dy + D.eye.ry + 9;
  const talk = p.talk ? (Math.abs(Math.sin(T * 13)) * .6 + .4) * p.talk : 0;
  const m = ex.m;
  c.strokeStyle = ol; c.lineWidth = 2.8; c.lineCap = 'round';
  const mouth = talk > .15 ? 'o' : ex.mouth;
  if (mouth === 'smile') { c.beginPath(); c.arc(mx, my - 6, 8 * m + 3, .25 * Math.PI, .75 * Math.PI); c.stroke(); }
  else if (mouth === 'grin') { c.beginPath(); c.moveTo(mx - 10, my - 2); c.quadraticCurveTo(mx, my + 12 * m, mx + 10, my - 2); c.closePath(); c.fillStyle = '#5a1a14'; c.fill(); c.stroke(); this.ellipse(mx, my + 5 * m, 4, 2, 0, '#e88aa0'); }
  else if (mouth === 'o') { this.ellipse(mx, my + 1, 4 + 3 * (talk || m), 4 + 4 * (talk || m), 0, '#3a120c', ol, 2.4); }
  else if (mouth === 'frown') { c.beginPath(); c.arc(mx, my + 6, 7, 1.2 * Math.PI, 1.8 * Math.PI); c.stroke(); }
  else if (mouth === 'wobble') { c.beginPath(); for (let i = 0; i <= 8; i++) { const xx = mx - 8 + i * 2, yy = my + Math.sin(i * 1.6 + T * 14) * 1.6; i ? c.lineTo(xx, yy) : c.moveTo(xx, yy); } c.stroke(); }
  else { this.line(mx - 6, my, mx + 6, my, ol, 2.8); }
  // sweat drop
  if (p.sweat) { const sy = -D.head.r * .4 + ((T * 1.5) % 1) * 18; this.at(fx + D.head.r * .9, sy, 1, 0, () => { this.path([[0, -8], [5, 2], [0, 6], [-5, 2]], true); this.fillStroke('#9fe8ff', ol, 1.8); }); }
  c.restore(); // head

  // arms in front
  drawArm(HL, p.hold && p.hold.L); drawArm(HR, p.hold && p.hold.R);

  c.restore();
  // return hand world positions for interaction
  return { hand: { L: [x + HL.hx * s, y + (HL.hy - hov) * s], R: [x + HR.hx * s, y + (HR.hy - hov) * s] }, head: [x + hx * s, y + (hy - hov) * s] };
};
K.prop = function (name, x, y, side, ang) {
  if (!name) return;
  if (typeof name === 'function') return name(this, x, y, side, ang);
  if (name === 'clipboard') this.clipboard(x + side * 4, y - 22, .8, { rot: side * .1 });
  else if (name === 'zip') this.zip(x + side * 6, y + 30, .7);
  else if (name === 'pencil') this.pencil(x, y - 8, .7, side * .5);
  else if (name === 'disk') this.disk(x + side * 4, y - 14, .6);
  else if (name === 'pin') { this.line(x, y, x + side * 6, y - 22, '#cfd6da', 2); this.circle(x + side * 6, y - 23, 3.5, PAL.red, PAL.line, 1.2); }
  else if (name === 'note') this.note(x + side * 10, y - 18, .5, 'NOTE', { w: 60, h: 40 });
  else if (name === 'mug') { this.rect(x - 8, y - 12, 16, 18, '#e9e3d4', PAL.line, 2); this.line(x + 8, y - 8, x + 12, y, PAL.line, 2); }
};

/* ============================================================
   TITLE / CAPTION CARDS
   ============================================================ */
K.titleCard = function (num, title, sub, k) {
  const c = this.ctx; c.fillStyle = PAL.black; c.fillRect(0, 0, W, H);
  const a = clamp(k * 3) * clamp((1 - k) * 4);
  this.text(num, 640, 300, { size: 14, color: PAL.hi, align: 'center', ls: 6, alpha: a });
  this.serif(title, 640, 372, { size: 64, color: PAL.ink, align: 'center', alpha: a, weight: 300 });
  if (sub) this.text(sub, 640, 420, { size: 13, color: PAL.dim, align: 'center', ls: 3, alpha: a });
  this.line(560, 444, 720, 444, `rgba(232,192,112,${.6 * a})`, 1);
};
/* terminal-typed intertitle on black; lines typed sequentially */
K.termCard = function (lines, t, o = {}) {
  const c = this.ctx; c.fillStyle = o.bg || '#020403'; c.fillRect(0, 0, W, H);
  const cps = o.cps || 22, size = o.size || 26, lh = size * 1.6;
  const x0 = o.x || 200, y0 = o.y || (360 - (lines.length - 1) * lh / 2);
  let budget = t * cps;
  let lastX = x0, lastY = y0;
  lines.forEach((ln, i) => {
    const n = Math.max(0, Math.min(ln.length, Math.floor(budget)));
    budget -= ln.length + 6; // pause between lines
    const str = ln.slice(0, n);
    this.text(str, x0, y0 + i * lh, { size, color: o.col || PAL.phos, glow: o.col || PAL.phos, blur: 10, ls: 1 });
    if (n > 0) { lastY = y0 + i * lh; c.font = `500 ${size}px 'IBM Plex Mono', monospace`; try { c.letterSpacing = '1px'; } catch (e) { } lastX = x0 + c.measureText(str).width + 4; try { c.letterSpacing = '0px'; } catch (e) { } }
  });
  this.cursor(lastX, lastY, size, o.col || PAL.phos);
  c.fillStyle = 'rgba(0,0,0,0.25)'; for (let yy = 0; yy < H; yy += 3) c.fillRect(0, yy, W, 1);
};
K.caption = function (str, a, o = {}) { // small bottom-left mono label; used sparingly
  if (a <= 0) return;
  this.text(str, o.x || 48, o.y || 676, { size: o.size || 13, color: o.col || PAL.hi, ls: 3, alpha: a });
};

/* ============================================================
   POST — vignette, grain, letterbox
   ============================================================ */
function post(ctx, T, o = {}) {
  const vg = ctx.createRadialGradient(W / 2, H / 2, H * .35, W / 2, H / 2, H * .95);
  vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, `rgba(0,0,0,${o.vig == null ? .55 : o.vig})`);
  ctx.fillStyle = vg; ctx.fillRect(0, 0, W, H);
  // grain: sparse seeded specks
  const f = Math.floor(T * 24);
  ctx.save(); ctx.globalAlpha = .05;
  for (let i = 0; i < 260; i++) { const x = hash(f * 13 + i) * W, y = hash(f * 7 + i * 3.1) * H; ctx.fillStyle = hash(i + f) > .5 ? '#fff' : '#000'; ctx.fillRect(x, y, 2, 2); }
  ctx.restore();
}

root.MOTH = { Kit, PAL, CH, EXPR, W, H, post, kf, pick, hash, clamp, lerp };
})(window);
