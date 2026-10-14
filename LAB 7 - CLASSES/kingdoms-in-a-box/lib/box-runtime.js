/* KINGDOMS IN A BOX · runtime inside the sketch frame.
   Loaded after p5.min.js and before the box's sketch. Reports errors and console lines,
   seeds random() for films, and gives the host frame-by-frame control. */
(function () {
  const CFG = window.__CFG || {};
  const host = (window.parent && window.parent !== window && window.parent.__boxHost) || null;
  const B = (window.__box = { clicks: 0, failed: false, frame: 0 });

  function report(err) {
    if (B.failed) return;
    B.failed = true;
    try { p5.instance && p5.instance.noLoop(); } catch (e) { /* stopped */ }
    const stack = String((err && err.stack) || '');
    let line = null;
    const re = /about:srcdoc:(\d+):(\d+)/g; let m;
    while ((m = re.exec(stack))) { const L = +m[1] - CFG.offset; if (L >= 1 && L <= CFG.lines) { line = L; break; } }
    if (host) host.onError({ msg: String((err && err.message) || err), line });
  }
  window.addEventListener('error', (e) => { report(e.error || { message: e.message, stack: 'about:srcdoc:' + e.lineno + ':' + e.colno }); e.preventDefault(); });
  ['log', 'warn', 'error'].forEach((k) => {
    const o = console[k].bind(console);
    console[k] = function (...a) { if (host) host.onLog(k, a.map((v) => (typeof v === 'string' ? v : JSON.stringify(v))).join(' ')); o(...a); };
  });
  document.addEventListener('mousedown', () => { B.clicks++; }, true);

  p5.prototype.registerMethod('post', function () { B.frame++; });
  /* seed random() and noise() before setup() runs, so a film or a test replays exactly */
  p5.prototype.registerMethod('beforeSetup', function () { if (CFG.seed) { this.randomSeed(CFG.seed); this.noiseSeed(CFG.seed); } });
  p5.prototype.registerMethod('init', function () {
    if (!CFG.seed) return;
    const inst = this;
    const wrap = () => { if (typeof window.setup === 'function' && !window.setup.__seeded) { const s = window.setup; window.setup = function () { inst.randomSeed(CFG.seed); inst.noiseSeed(CFG.seed); const r = s.apply(this, arguments); if (CFG.hold) inst.noLoop(); return r; }; window.setup.__seeded = true; } };
    wrap();
  });

  B.state = () => ({ frame: B.frame, t: B.frame / 60, clicks: B.clicks, failed: B.failed });
  B.vars = () => { try { return window.__vars ? window.__vars() : {}; } catch (e) { return {}; } };
  B.set = (name, value) => { try { (0, eval)(`${name} = ${JSON.stringify(value)}`); return true; } catch (e) { return false; } };
  B.pause = () => { try { p5.instance.noLoop(); } catch (e) { /* none */ } };
  B.resume = () => { try { if (!B.failed) p5.instance.loop(); } catch (e) { /* none */ } };
  B.step = (n) => { const p = p5.instance; if (!p || B.failed) return; for (let i = 0; i < (n || 1); i++) p.redraw(); };
  B.click = (x, y) => {
    const p = p5.instance; if (!p) return;
    p._setProperty('mouseX', x); p._setProperty('mouseY', y); p._setProperty('pmouseX', x); p._setProperty('pmouseY', y);
    B.clicks++;
    if (typeof window.mousePressed === 'function') window.mousePressed();
  };
  B.canvas = () => { try { return p5.instance._renderer.elt; } catch (e) { return null; } };
})();
