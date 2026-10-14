/* THE CONSTRUCTORS · bench runtime
   Runs inside the sketch frame, after p5.min.js and before the student's code.
   It records which line drew what, keeps a step trace on request,
   draws the lesson's scene behind background(), and reports errors. */
(function () {
  const CFG = window.__CFG || {};
  const host = (window.parent && window.parent !== window && window.parent.__benchHost) || null;
  const B = (window.__bench = { clicks: 0, failed: false });

  let INTERNAL = 0, DRAWS = 0, FRAME = 0, LC = 0;
  const LOOPMAX = 2000000;
  let LOG = [], DONE = null;
  const REG = [], IDS = new WeakMap();
  let nextId = 1;
  const CUR = { line: 0, self: null, selfId: 0 };
  const idOf = (o) => { if (!o || typeof o !== 'object') return 0; let i = IDS.get(o); if (!i) { i = nextId++; IDS.set(o, i); } return i; };
  const S = (self) => (self && self !== window && typeof self === 'object' ? self : null);

  /* ---------- value summaries (strings only, so the host can diff them) ---------- */
  function cname(o) { try { const c = o.constructor; return c && c.name && c.name !== 'Object' && c.name !== 'Array' ? c.name : ''; } catch (e) { return ''; } }
  function label(o) {
    if (!o || typeof o !== 'object') return String(o);
    const i = REG.indexOf(o), c = cname(o);
    if (i >= 0) return (c || 'object') + ' #' + i;
    if (Array.isArray(o)) return 'Array(' + o.length + ')';
    return c || 'object';
  }
  function num(v) { return Number.isInteger(v) ? String(v) : String(Math.round(v * 100) / 100); }
  function sum1(v, depth) {
    if (v === undefined) return 'undefined';
    if (v === null) return 'null';
    const t = typeof v;
    if (t === 'number') return num(v);
    if (t === 'string') return JSON.stringify(v.length > 48 ? v.slice(0, 48) + '…' : v);
    if (t === 'boolean') return String(v);
    if (t === 'function') return 'function';
    if (window.p5 && v instanceof p5.Color) return 'color(' + v.levels.join(', ') + ')';
    if (Array.isArray(v)) {
      if (depth) return 'Array(' + v.length + ')';
      return '[' + v.slice(0, 4).map((x) => (x && typeof x === 'object' ? label(x) : sum1(x, 1))).join(', ') + (v.length > 4 ? ', …' : '') + ']';
    }
    if (t === 'object') {
      if (REG.indexOf(v) >= 0 || depth) return label(v);
      const ks = Object.keys(v).filter((k) => !k.startsWith('__'));
      return (cname(v) || '') + '{' + ks.slice(0, 4).map((k) => k + ': ' + sum1(v[k], 1)).join(', ') + (ks.length > 4 ? ', …' : '') + '}';
    }
    return String(v);
  }
  function sumObj(o) {
    if (!o) return null;
    const out = {};
    for (const k of Object.keys(o)) { if (k.startsWith('__')) continue; const v = o[k]; if (typeof v === 'function') continue; out[k] = sum1(v); }
    return out;
  }
  const safe = (f) => { try { return f ? f() : null; } catch (e) { return null; } };
  const globs = () => { try { return window.__vars ? sumObj(window.__vars()) : {}; } catch (e) { return {}; } };

  /* ---------- step trace ---------- */
  const TR = { on: !!CFG.traceFromStart, entries: [], snaps: [], lastSnapN: -1, max: 3000, overflow: false, prev: null };
  function canvasEl() { try { return p5.instance && p5.instance._renderer && p5.instance._renderer.elt; } catch (e) { return null; } }
  function takeSnap(force) {
    if (!force && DRAWS === TR.lastSnapN && TR.snaps.length) return TR.snaps.length - 1;
    if (TR.snaps.length >= 260 && !force) return TR.snaps.length - 1;
    const c = canvasEl();
    if (!c || !c.width) return -1;
    const lw = p5.instance.width, lh = p5.instance.height, k = Math.min(1, 640 / lw);
    const o = document.createElement('canvas');
    o.width = Math.max(1, Math.round(lw * k)); o.height = Math.max(1, Math.round(lh * k));
    o.getContext('2d').drawImage(c, 0, 0, o.width, o.height);
    TR.lastSnapN = DRAWS;
    TR.snaps.push(o);
    return TR.snaps.length - 1;
  }
  function closePrev() {
    const p = TR.prev;
    if (!p) return;
    p.e.selfAfter = p.self ? sumObj(p.self) : null;
    p.e.xyAfter = p.self && typeof p.self.x === 'number' && typeof p.self.y === 'number' ? [p.self.x, p.self.y] : null;
    p.e.locAfter = p.loc ? sumObj(safe(p.loc)) : null;
    p.e.globAfter = globs();
    TR.prev = null;
  }
  function rec(kind, line, self, loc, name) {
    if (TR.entries.length >= TR.max) { TR.overflow = true; return; }
    closePrev();
    const s = S(self);
    const e = {
      kind, line, name: name || '', frame: FRAME,
      selfId: s ? idOf(s) : 0, selfLabel: s ? label(s) : '',
      self: s ? sumObj(s) : null,
      xy: s && typeof s.x === 'number' && typeof s.y === 'number' ? [s.x, s.y] : null,
      loc: loc ? sumObj(safe(loc)) : null, glob: globs(),
      logN: LOG.length, snap: takeSnap(false),
    };
    TR.entries.push(e);
    TR.prev = { e, self: s, loc };
  }
  function finishTrace() {
    closePrev();
    TR.entries.push({ kind: 'end', line: 0, frame: FRAME, logN: LOG.length, snap: takeSnap(true), glob: globs() });
    TR.on = false;
    const out = { entries: TR.entries, snaps: TR.snaps, overflow: TR.overflow, log: LOG.slice() };
    B.lastTrace = out;
    if (host) host.onTrace(out);
    return out;
  }
  function resetTrace(on) { TR.on = on; TR.entries = []; TR.snaps = []; TR.lastSnapN = -1; TR.overflow = false; TR.prev = null; }

  /* hooks the instrumented code calls */
  window.__T = function (line, self, loc) { const s = S(self); CUR.line = line; CUR.self = s; CUR.selfId = s ? idOf(s) : 0; if (TR.on) rec('stmt', line, self, loc); };
  window.__L = function (line, self, loc) {
    if (++LC > LOOPMAX) { LC = 0; const e = new Error('The loop on line ' + line + ' ran ' + LOOPMAX.toLocaleString('en-US') + ' times in one frame. Its condition never became false.'); e.__line = line; throw e; }
    const s = S(self); CUR.line = line; CUR.self = s; CUR.selfId = s ? idOf(s) : 0; if (TR.on) rec('loop', line, self, loc);
  };
  window.__F = function (line, name, self, loc) { const s = S(self); CUR.line = line; CUR.self = s; CUR.selfId = s ? idOf(s) : 0; if (TR.on) rec('enter', line, self, loc, name); };
  window.__R = function (o) { if (REG.length > 5000) REG.splice(0, 1000); REG.push(o); idOf(o); };

  /* ---------- where each drawing call lands on the canvas ---------- */
  function mapBox(p, pts) {
    const m = p.drawingContext.getTransform(), pd = p._pixelDensity || 1;
    let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
    for (const [x, y] of pts) {
      const X = (m.a * x + m.c * y + m.e) / pd, Y = (m.b * x + m.d * y + m.f) / pd;
      if (X < x0) x0 = X; if (Y < y0) y0 = Y; if (X > x1) x1 = X; if (Y > y1) y1 = Y;
    }
    return { x: x0, y: y0, w: x1 - x0, h: y1 - y0 };
  }
  function modeBox(mode, x, y, w, h, kind) {
    mode = String(mode || (kind === 'rect' ? 'corner' : 'center')).toLowerCase();
    if (mode === 'center') return [x - w / 2, y - h / 2, x + w / 2, y + h / 2];
    if (mode === 'radius') return [x - w, y - h, x + w, y + h];
    if (mode === 'corners') return [Math.min(x, w), Math.min(y, h), Math.max(x, w), Math.max(y, h)];
    return [Math.min(x, x + w), Math.min(y, y + h), Math.max(x, x + w), Math.max(y, y + h)];
  }
  function bbox(p, name, a) {
    const r = p._renderer, n = a.map(Number);
    let b;
    switch (name) {
      case 'background': return { x: 0, y: 0, w: p.width, h: p.height, all: true };
      case 'circle': b = modeBox(r._ellipseMode, n[0], n[1], n[2], n[2]); break;
      case 'ellipse': case 'arc': b = modeBox(r._ellipseMode, n[0], n[1], n[2], a[3] === undefined ? n[2] : n[3]); break;
      case 'rect': b = modeBox(r._rectMode, n[0], n[1], n[2], a[3] === undefined ? n[2] : n[3], 'rect'); break;
      case 'square': b = modeBox(r._rectMode, n[0], n[1], n[2], n[2], 'rect'); break;
      case 'line': b = [n[0], n[1], n[2], n[3]]; break;
      case 'point': { const w = Math.max(2, (r._strokeWeight || 1) / 2); b = [n[0] - w, n[1] - w, n[0] + w, n[1] + w]; break; }
      case 'triangle': { const xs = [n[0], n[2], n[4]], ys = [n[1], n[3], n[5]]; b = [Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)]; break; }
      case 'quad': { const xs = [n[0], n[2], n[4], n[6]], ys = [n[1], n[3], n[5], n[7]]; b = [Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)]; break; }
      case 'text': {
        const s = String(a[0]), size = r._textSize || 12; let w = 0;
        INTERNAL++; try { w = p.textWidth(s); } finally { INTERNAL--; }
        const al = r._textAlign || 'left', bl = r._textBaseline || 'alphabetic';
        let x = n[1]; if (al === 'center') x -= w / 2; else if (al === 'right') x -= w;
        let y = n[2] - size * 0.8; if (bl === 'top') y = n[2]; else if (bl === 'middle') y = n[2] - size * 0.5; else if (bl === 'bottom') y = n[2] - size;
        b = [x, y, x + w, y + size]; break;
      }
      case 'image': { const im = a[0] || {}; b = [n[1], n[2], n[1] + (a[3] === undefined ? im.width || 0 : n[3]), n[2] + (a[4] === undefined ? im.height || 0 : n[4])]; break; }
      default: return null;
    }
    if (b.some((v) => !isFinite(v))) return null;
    const pad = name === 'line' ? Math.max(2, r._strokeWeight || 1) : 0;
    return mapBox(p, [[b[0] - pad, b[1] - pad], [b[2] + pad, b[1] - pad], [b[0] - pad, b[3] + pad], [b[2] + pad, b[3] + pad]]);
  }

  /* ---------- wrap p5 so every call is logged with its line ---------- */
  const DRAWFN = ['background', 'circle', 'ellipse', 'rect', 'square', 'line', 'point', 'triangle', 'quad', 'arc', 'text', 'image'];
  const CALLFN = ['createCanvas', 'resizeCanvas', 'fill', 'noFill', 'stroke', 'noStroke', 'strokeWeight', 'textSize', 'textAlign', 'translate', 'rotate', 'scale',
    'push', 'pop', 'random', 'dist', 'map', 'constrain', 'lerp', 'noise', 'frameRate', 'noLoop', 'loop', 'rectMode', 'ellipseMode', 'colorMode', 'beginShape', 'vertex', 'endShape'];
  function wrap(name, isDraw) {
    const orig = p5.prototype[name];
    if (typeof orig !== 'function') return;
    p5.prototype[name] = function (...a) {
      if (INTERNAL) return orig.apply(this, a);
      INTERNAL++;
      let r;
      try { r = orig.apply(this, a); } finally { INTERNAL--; }
      if (LOG.length < 40000) {
        const e = { fn: name, a: a.slice(0, 8).map((v) => sum1(v, 1)), line: CUR.line, self: CUR.selfId };
        if (isDraw) { try { e.bb = bbox(this, name, a); } catch (err) { /* no box */ } DRAWS++; }
        if (r !== undefined && (typeof r === 'number' || typeof r === 'string' || typeof r === 'boolean')) e.r = sum1(r);
        LOG.push(e);
      }
      if (name === 'background' && CFG.scene) { INTERNAL++; try { this.push(); drawScene(this); this.pop(); } finally { INTERNAL--; } }
      if ((name === 'createCanvas' || name === 'resizeCanvas') && host) host.onCanvas(this.width, this.height);
      return r;
    };
  }
  DRAWFN.forEach((n) => wrap(n, true));
  CALLFN.forEach((n) => wrap(n, false));

  /* ---------- the recruit helper (same drawing as the copyable helper) ---------- */
  window.recruit = function (x, y) {
    const p = p5.instance;
    if (!p) return;
    INTERNAL++;
    try {
      p.push();
      p.stroke(30); p.strokeWeight(1.5);
      p.line(x, y + 7, x - 6, y + 25); p.line(x, y + 7, x + 6, y + 25); p.line(x, y + 7, x, y - 23);
      p.fill(255, 220, 0);
      p.circle(x, y + 7, 12); p.circle(x, y - 7, 16); p.circle(x, y - 23, 14);
      p.noStroke(); p.fill(30); p.rect(x - 14, y - 10, 4, 7);
      p.fill(255, 220, 0); p.rect(x + 9, y - 9, 6, 2); p.rect(x + 9, y - 5, 6, 2);
      p.pop();
    } finally { INTERNAL--; }
    if (LOG.length < 40000) {
      let bb = null; try { bb = mapBox(p, [[x - 15, y - 31], [x + 16, y - 31], [x - 15, y + 26], [x + 16, y + 26]]); } catch (e) { /* none */ }
      LOG.push({ fn: 'recruit', a: [sum1(x), sum1(y)], x: +x, y: +y, line: CUR.line, self: CUR.selfId, bb });
    }
    DRAWS++;
  };

  /* ---------- letter targets ---------- */
  const LP = {};
  window.letterPoints = function (word, n) {
    word = String(word || 'BRUMM').toUpperCase(); n = n || 48;
    const W = (p5.instance && p5.instance.width) || CFG.w || 800, H = (p5.instance && p5.instance.height) || CFG.h || 500;
    const key = word + '|' + n + '|' + W + 'x' + H;
    if (!LP[key]) {
      const c = document.createElement('canvas'); c.width = W; c.height = H;
      const g = c.getContext('2d');
      let size = H * 0.62; g.font = 'bold ' + size + 'px Arial, Helvetica, sans-serif';
      const w = g.measureText(word).width; if (w > W * 0.88) { size *= (W * 0.88) / w; g.font = 'bold ' + size + 'px Arial, Helvetica, sans-serif'; }
      g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = '#000'; g.fillText(word, W / 2, H * 0.46);
      const data = g.getImageData(0, 0, W, H).data;
      let step = 40, pts = [];
      while (step > 3) {
        pts = [];
        for (let y = Math.floor(step / 2); y < H; y += step) for (let x = Math.floor(step / 2); x < W; x += step) if (data[(y * W + x) * 4 + 3] > 128) pts.push({ x, y });
        if (pts.length >= n) break; step -= 1;
      }
      const out = []; for (let i = 0; i < n; i++) out.push(pts[Math.floor((i * pts.length) / n)]);
      LP[key] = out;
    }
    return LP[key].map((q) => ({ x: q.x, y: q.y }));
  };

  /* ---------- the lesson world ---------- */
  const SC = CFG.scene || null;
  const world = (window.world = {
    t: 0,
    touching(o, pad) { pad = pad === undefined ? 16 : pad; return REG.filter((a) => typeof a.x === 'number' && Math.hypot(a.x - o.x, a.y - o.y) < (o.r || 0) + pad).length; },
    near(a, r) { return REG.filter((b) => b !== a && typeof b.x === 'number' && Math.hypot(b.x - a.x, b.y - a.y) < r); },
  });
  if (SC) {
    if (SC.flags) world.flags = SC.flags.map((f) => ({ x: f.x, y: f.y }));
    if (SC.ridge) world.ridge = Object.assign({}, SC.ridge);
    if (SC.river) world.river = Object.assign({}, SC.river);
    if (SC.stone) world.stone = Object.assign({}, SC.stone);
    if (SC.goal) world.goal = Object.assign({}, SC.goal);
    if (SC.slip) world.slip = SC.slip;
    if (SC.finish) world.finish = SC.finish;
    world.lost = 0; world.maxPush = 0; world.pushers = 0;
  }
  const INK = 30;
  function drawFlag(p, f, i) {
    p.stroke(INK); p.strokeWeight(2); p.line(f.x, f.y, f.x, f.y - 62);
    p.fill(f.col || '#c23b22'); p.strokeWeight(1.2); p.triangle(f.x, f.y - 62, f.x + 30, f.y - 54, f.x, f.y - 46);
    p.noFill(); p.stroke(INK); p.drawingContext.setLineDash([4, 4]); p.circle(f.x, f.y, 34); p.drawingContext.setLineDash([]);
    if (f.label) { p.noStroke(); p.fill(INK); p.textSize(13); p.textAlign(p.CENTER); p.text(f.label, f.x, f.y + 34); }
  }
  function drawScene(p) {
    const s = SC, W = p.width, H = p.height;
    p.textFont('Arial');
    if (s.ground) { p.stroke(INK); p.strokeWeight(2); p.line(0, s.ground + 26, W, s.ground + 26); p.strokeWeight(0.6); for (let k = 1; k < 7; k++) p.line(0, s.ground + 26 + k * k * 2.2, W, s.ground + 26 + k * k * 2.2); }
    if (s.screen) {
      const r = s.screen; p.fill(251, 246, 230); p.stroke(INK); p.strokeWeight(3); p.rect(r.x, r.y, r.w, r.h);
      p.noStroke(); p.fill(INK); p.textSize(11); p.textAlign(p.LEFT); p.text('THE BARD · PROJECTION', r.x + 10, r.y - 8);
      p.fill(INK); p.triangle(r.x + r.w - 70, r.y - 6, r.x + r.w - 20, r.y - 22, r.x + r.w - 20, r.y + 10);
    }
    if (s.ridge) {
      const g = s.ridge; p.stroke(INK); p.strokeWeight(3); p.line(g.x0, g.y + 26, g.x1, g.y + 26);
      p.strokeWeight(2); p.line(g.x0, g.y + 50, g.x0, g.y - 50); p.line(g.x1, g.y + 50, g.x1, g.y - 50);
      p.noStroke(); p.fill(INK); p.textSize(12); p.textAlign(p.LEFT); p.text('THE RIDGE  x ' + g.x0 + ' to ' + g.x1 + ',  y ' + g.y, g.x0, g.y + 70);
    }
    if (s.river) {
      const r = s.river; p.noStroke(); p.fill(196, 214, 222); p.rect(r.x0, 0, r.x1 - r.x0, H);
      p.stroke(255); p.strokeWeight(2);
      for (let k = 0; k < 14; k++) { const yy = ((k * 47 + FRAME * r.drift) % (H + 40)) - 20, xx = r.x0 + 14 + ((k * 37) % (r.x1 - r.x0 - 40)); p.line(xx, yy, xx, yy + 16); }
      p.stroke(INK); p.strokeWeight(2); p.line(r.x0, 0, r.x0, H); p.line(r.x1, 0, r.x1, H);
      p.noStroke(); p.fill(INK); p.textSize(12); p.textAlign(p.CENTER); p.text('RIVER  (current pulls down)', (r.x0 + r.x1) / 2, 18);
    }
    if (s.finish) { p.stroke(194, 59, 34); p.strokeWeight(2); p.drawingContext.setLineDash([8, 6]); p.line(s.finish, 0, s.finish, H); p.drawingContext.setLineDash([]); p.noStroke(); p.fill(194, 59, 34); p.textSize(12); p.textAlign(p.LEFT); p.text('FAR BANK', s.finish + 8, 18); }
    if (s.goal) { const g = world.goal; p.noFill(); p.stroke(194, 59, 34); p.strokeWeight(2); p.drawingContext.setLineDash([6, 6]); p.circle(g.x, g.y, g.r * 2); p.drawingContext.setLineDash([]); p.noStroke(); p.fill(194, 59, 34); p.textSize(13); p.textAlign(p.CENTER); p.text('GOAL', g.x, g.y - g.r - 10); }
    if (s.stone) {
      const t = world.stone; p.fill(90); p.stroke(INK); p.strokeWeight(3); p.circle(t.x, t.y, t.r * 2);
      p.noStroke(); p.fill(world.pushers >= 5 ? '#ffdc00' : 245); p.textSize(15); p.textAlign(p.CENTER, p.CENTER); p.text(world.pushers + ' / 5', t.x, t.y); p.textAlign(p.LEFT, p.BASELINE);
    }
    if (s.slip) {
      const pts = window.letterPoints(s.slip, s.n || 48); p.noFill(); p.stroke(150); p.strokeWeight(1);
      for (const q of pts) p.circle(q.x, q.y, 10);
      p.noStroke(); p.fill(INK); p.textSize(12); p.textAlign(p.LEFT); p.text('SLIP: ' + s.slip, 14, H - 14);
    }
    if (s.flags) s.flags.forEach((f, i) => drawFlag(p, f, i));
  }

  /* ---------- per-frame hooks: logs, physics ---------- */
  const PREV = new Map();
  p5.prototype.registerMethod('pre', function () {
    LC = 0;
    if (!TR.on) { DONE = LOG; LOG = []; }
    if (SC && SC.stone) { PREV.clear(); for (const a of REG) if (typeof a.x === 'number') PREV.set(a, [a.x, a.y]); }
  });
  p5.prototype.registerMethod('post', function () {
    FRAME++; world.t = FRAME / 60;
    if (SC && !B.failed) physics(this);
    if (TR.on) { finishTrace(); this.noLoop(); }
  });
  function physics(p) {
    const s = SC;
    if (s.river) {
      const r = world.river; let lost = 0;
      for (const a of REG) { if (typeof a.x !== 'number' || typeof a.y !== 'number') continue; if (a.x > r.x0 && a.x < r.x1) a.y += r.drift; if (a.y > p.height - 10) { lost++; } }
      world.lost = lost;
    }
    if (s.stone) {
      const st = world.stone; let n = 0, dx = 0, dy = 0;
      for (const a of REG) { if (typeof a.x !== 'number') continue; if (Math.hypot(a.x - st.x, a.y - st.y) < st.r + 16) { n++; const q = PREV.get(a); if (q) { dx += a.x - q[0]; dy += a.y - q[1]; } } }
      if (n >= 5) { st.x += (dx / n) * 0.8; st.y += (dy / n) * 0.8; }
      st.x = Math.min(Math.max(st.x, st.r), p.width - st.r); st.y = Math.min(Math.max(st.y, st.r), p.height - st.r);
      world.maxPush = Math.max(world.maxPush, n); world.pushers = n;
      for (const a of REG) { if (typeof a.x !== 'number') continue; const d = Math.hypot(a.x - st.x, a.y - st.y); if (d < st.r + 10 && d > 0) { a.x = st.x + ((a.x - st.x) / d) * (st.r + 10); a.y = st.y + ((a.y - st.y) / d) * (st.r + 10); } }
    }
  }

  /* ---------- errors and console ---------- */
  function report(err) {
    if (B.failed) return;
    B.failed = true;
    try { p5.instance && p5.instance.noLoop(); } catch (e) { /* stopped */ }
    const stack = String((err && err.stack) || '');
    let line = (err && err.__line) || null, col = null;
    if (!line) {
      const re = /about:srcdoc:(\d+):(\d+)/g; let m;
      while ((m = re.exec(stack))) { const L = +m[1] - CFG.offset; if (L >= 1 && L <= CFG.lines) { line = L; col = +m[2]; break; } }
    }
    if (TR.on) { TR.on = false; }
    if (host) host.onError({ msg: String((err && err.message) || err), name: (err && err.name) || 'Error', line, col });
  }
  window.addEventListener('error', (e) => {
    const err = e.error || { message: e.message, stack: 'about:srcdoc:' + e.lineno + ':' + e.colno };
    report(err); e.preventDefault();
  });
  window.addEventListener('unhandledrejection', (e) => report(e.reason));
  function fmtLog(v) { return typeof v === 'string' ? v : sum1(v); }
  ['log', 'info', 'warn', 'error'].forEach((k) => {
    const o = console[k].bind(console);
    console[k] = function (...a) { if (host) host.onLog(k, a.map(fmtLog).join(' '), CUR.line); o(...a); };
  });

  /* ---------- clicks: counting and picking ---------- */
  document.addEventListener('mousedown', (e) => {
    B.clicks++;
    const c = canvasEl();
    if (!c || !host) return;
    const r = c.getBoundingClientRect();
    const x = ((e.clientX - r.left) * p5.instance.width) / r.width, y = ((e.clientY - r.top) * p5.instance.height) / r.height;
    if (x >= 0 && y >= 0 && x <= p5.instance.width && y <= p5.instance.height) host.onPick(x, y);
  }, true);

  /* ---------- what the host reads ---------- */
  B.state = () => ({ log: TR.on ? LOG : DONE || LOG, frame: FRAME, t: FRAME / 60, clicks: B.clicks, failed: B.failed, w: p5.instance ? p5.instance.width : 0, h: p5.instance ? p5.instance.height : 0, looping: p5.instance ? p5.instance.isLooping() : false, tracing: TR.on });
  B.reg = REG;
  B.vars = () => { try { return window.__vars ? window.__vars() : {}; } catch (e) { return {}; } };
  B.sumVars = globs;
  B.sumObj = sumObj;
  B.label = label;
  B.idOf = idOf;
  B.byId = (id) => REG.find((o) => idOf(o) === id) || null;
  B.world = world;
  B.pause = () => { try { p5.instance.noLoop(); } catch (e) { /* none */ } };
  B.resume = () => { TR.on = false; try { p5.instance.loop(); } catch (e) { /* none */ } };
  B.traceFrame = () => { if (!p5.instance || B.failed) return null; resetTrace(true); LOG = []; p5.instance.redraw(); return B.lastTrace; };
  B.endTrace = () => (TR.on ? finishTrace() : B.lastTrace);
  B.canvas = canvasEl;
})();
