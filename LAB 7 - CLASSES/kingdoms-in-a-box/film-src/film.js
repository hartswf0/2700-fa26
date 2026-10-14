/* KINGDOMS IN A BOX · film director
   film.html?w=<id> runs the box's sketch in a frame, steps it frame by frame,
   and draws each film frame in the engraved style. __render(f) is called in order. */
const FW = 1280, FH = 720, FPS = 24;
const C = document.getElementById('film'), CX = C.getContext('2d');
X = CX;
const ID = new URLSearchParams(location.search).get('w') || 'city';
let CODE = null, MEM = {};
let T = null, WORLD = null, FILM = null, frameEl = null, lastBeat = -1, acc = 0, clicks = [], doneActs = new Set();

/* ---------- the sketch, in a frame ---------- */
function setLet(src, name, value) {
  const re = new RegExp('^(let\\s+' + name + '\\s*=\\s*)([^;]+);', 'm');
  return src.replace(re, (m, a) => a + (typeof value === 'string' ? JSON.stringify(value) : String(value)) + ';');
}
function topNames(src) {
  const ast = acorn.parse(src, { ecmaVersion: 'latest', sourceType: 'script' });
  const out = [];
  for (const st of ast.body) if (st.type === 'VariableDeclaration') for (const d of st.declarations) if (d.id.type === 'Identifier') out.push(d.id.name);
  return out;
}
let curSet = {};
function startSketch(set) {
  curSet = Object.assign({}, set || {});
  let src = WORLD.sketch;
  for (const [k, v] of Object.entries(curSet)) src = setLet(src, k, v);
  if (frameEl) frameEl.remove();
  window.__boxHost = { onError: (e) => { console.error('SKETCH ERROR', e.msg, e.line); }, onLog: () => {} };
  const cfg = { offset: 0, lines: src.split('\n').length, seed: +(new URLSearchParams(location.search).get('seed') || T.seed), hold: true };
  const pre = '<!doctype html><html><head><meta charset="utf-8"><style>html,body{margin:0;overflow:hidden}canvas{display:block}</style></head><body><script src="../../the-constructors/lib/p5.min.js"><\/script><script>window.__CFG=@CFG@;<\/script><script src="../lib/box-runtime.js"><\/script><script>\n';
  cfg.offset = (pre.match(/\n/g) || []).length;
  const acc2 = ';window.__vars=function(){var o={};' + topNames(src).map((n) => `try{o[${JSON.stringify(n)}]=${n}}catch(e){}`).join('') + 'return o};';
  frameEl = document.createElement('iframe');
  frameEl.style.cssText = 'position:absolute;left:-2000px;top:0;width:800px;height:500px;border:0';
  document.body.append(frameEl);
  frameEl.srcdoc = pre.replace('@CFG@', JSON.stringify(cfg)) + src + '\n' + acc2 + '\n<\/script></body></html>';
  return new Promise((res) => {
    const poll = () => { const w = frameEl.contentWindow, b = w && w.__box; if (b && w.p5 && w.p5.instance && w.p5.instance._setupDone) { b.pause(); res(); } else setTimeout(poll, 20); };
    poll();
  });
}
const SB = () => frameEl && frameEl.contentWindow && frameEl.contentWindow.__box;

/* ---------- drawing helpers ---------- */
function paper() {
  X.fillStyle = P.paper; X.fillRect(0, 0, FW, FH);
  X.fillStyle = 'rgba(28,24,20,.05)'; for (let y = 30; y < FH; y += 6) X.fillRect(0, y, FW, 0.8);
}
function wrap(str, size, maxW, italic, mono) {
  X.font = `${italic ? 'italic ' : ''}${size}px ${mono ? '"IBM Plex Mono",monospace' : FONT}`;
  const words = String(str).split(' '), lines = []; let cur = '';
  for (const w of words) { const t = cur ? cur + ' ' + w : w; if (X.measureText(t).width > maxW && cur) { lines.push(cur); cur = w; } else cur = t; }
  if (cur) lines.push(cur);
  return lines;
}
function captionLines(str, alpha) {
  if (!str || alpha <= 0) return;
  X.save(); X.globalAlpha = alpha;
  const lines = wrap(str, 27, 1120, true);
  const h = 30 + lines.length * 34;
  X.fillStyle = 'rgba(235,227,207,.96)'; X.fillRect(22, FH - 22 - h, FW - 44, h);
  ink([[22, FH - 22 - h], [FW - 22, FH - 22 - h]], 1.4, 7700, .5);
  lines.forEach((l, i) => txt(l, FW / 2, FH - 22 - h + 30 + i * 34, 27, { italic: true }));
  X.restore();
}
function table(x0, x1, y) {
  X.fillStyle = P.paper; X.fillRect(x0, y, x1 - x0, 14);
  X.fillStyle = PAT.m; X.fillRect(x0, y, x1 - x0, 14);
  ink([[x0, y], [x1, y], [x1, y + 14], [x0, y + 14]], 2, 9100, .4, P.ink, true);
  ink([[x0 + 20, y + 14], [x0 + 26, 600]], 2.2, 9101, .4); ink([[x1 - 20, y + 14], [x1 - 26, 600]], 2.2, 9102, .4);
}
function floor() {
  X.fillStyle = P.paper; X.fillRect(0, 600, FW, 120);
  for (let k = 0; k < 14; k++) { const y = 606 + k * k * 0.6; ink([[0, y], [FW, y]], 0.7 + k * 0.03, 9200 + k, .4); }
  ink([[0, 600], [FW, 600]], 1.8, 9199, .6);
}
function boxCase(cx, cy, w, h, open, glow) {
  const x0 = cx - w / 2, y0 = cy - h / 2;
  // lid, open behind
  const lh = h * 0.5 * open;
  if (open > 0) {
    X.fillStyle = P.paper; X.beginPath(); X.moveTo(x0, y0); X.lineTo(x0 + 18, y0 - lh); X.lineTo(x0 + w + 18, y0 - lh); X.lineTo(x0 + w, y0); X.closePath(); X.fill();
    X.save(); X.clip(); X.fillStyle = PAT.f; X.fillRect(x0, y0 - lh, w + 20, lh); X.restore();
    ink([[x0, y0], [x0 + 18, y0 - lh], [x0 + w + 18, y0 - lh], [x0 + w, y0]], 2, 9300, .4);
  }
  X.fillStyle = P.paper; X.fillRect(x0, y0, w, h);
  X.fillStyle = PAT.f; X.fillRect(x0, y0, w, h);
  ink([[x0, y0], [x0 + w, y0], [x0 + w, y0 + h], [x0, y0 + h]], 2.4, 9301, .5, P.ink, true);
  // side face
  X.fillStyle = PAT.d; X.beginPath(); X.moveTo(x0 + w, y0); X.lineTo(x0 + w + 18, y0 - 12); X.lineTo(x0 + w + 18, y0 + h - 12); X.lineTo(x0 + w, y0 + h); X.closePath(); X.fill();
  // window
  const ww = w - 40, wh = (ww * 5) / 8, wx = x0 + 20, wy = y0 + (h - wh) / 2;
  X.fillStyle = '#f5f2e8'; X.fillRect(wx, wy, ww, wh);
  const cv = SB() && SB().canvas();
  if (cv) { X.save(); X.globalAlpha = 0.25 + 0.75 * glow; X.drawImage(cv, wx, wy, ww, wh); X.globalCompositeOperation = 'multiply'; X.fillStyle = P.paper; X.fillRect(wx, wy, ww, wh); X.restore(); }
  ink([[wx, wy], [wx + ww, wy], [wx + ww, wy + wh], [wx, wy + wh]], 1.6, 9302, .3, P.ink, true);
  // brass plate
  X.fillStyle = P.amber; X.fillRect(cx - 34, y0 + h - 14, 68, 9);
  txt('No. ' + WORLD.no, cx, y0 + h - 9.5, 9, { mono: true });
}
function trurl(x, t, s) { figure({ x, y: 600, s: s || 1.3, f: 1, id: 7100, short: true, hb: [-34, -112 + Math.sin(t * 2) * 3], hf: [40, -126 + Math.sin(t * 1.7) * 4] }); }
function klapaucius(x, t, s, talk) { figure({ x, y: 600, s: s || 1.3, f: -1, id: 7300, hood: true, dark: true, hb: [-30, -110], hf: talk ? [36, -150 + Math.sin(t * 6) * 6] : [30, -112] }); }

/* ---------- shots ---------- */
function shotTitle(lt) {
  paper();
  const a = seg(lt, 0, 0.8);
  X.save(); X.globalAlpha = a;
  txt('KINGDOMS IN A BOX', FW / 2, 210, 18, { mono: true });
  txt('after the Seventh Sally', FW / 2, 240, 22, { italic: true });
  txt('No. ' + WORLD.no, FW / 2, 320, 30);
  txt(WORLD.title, FW / 2, 390, 76);
  txt(WORLD.source, FW / 2, 470, 17, { mono: true });
  X.restore();
  ink([[FW / 2 - 140, 280], [FW / 2 + 140, 280]], 1.2, 9400, .4);
}
function shotWorkshop(lt, b, t) {
  paper(); skyLinesSoft(); floor();
  table(460, 820, 520);
  const open = seg(lt, 0.4, 2.2);
  boxCase(640, 445, 300, 150, open, open);
  trurl(330, t); klapaucius(950, t, 1.3, b.voice === 'K');
  txt('TRURL', 330, 640, 13, { mono: true }); txt('KLAPAUCIUS', 950, 640, 13, { mono: true });
}
function skyLinesSoft() { X.save(); X.globalAlpha = 0.18; skyLines(22, 600, 900); X.restore(); }
function shotInside(lt, b) {
  paper();
  const FX = 52, FY = 86, FWd = 848, FHd = 530;
  // frame
  X.fillStyle = P.paper; X.fillRect(FX - 14, FY - 14, FWd + 28, FHd + 28);
  X.fillStyle = PAT.f; X.fillRect(FX - 14, FY - 14, FWd + 28, FHd + 28);
  ink([[FX - 14, FY - 14], [FX + FWd + 14, FY - 14], [FX + FWd + 14, FY + FHd + 14], [FX - 14, FY + FHd + 14]], 2.4, 9500, .5, P.ink, true);
  const cv = SB() && SB().canvas();
  if (cv) {
    X.drawImage(cv, FX, FY, FWd, FHd);
    X.save(); X.globalCompositeOperation = 'multiply'; X.fillStyle = P.paper; X.fillRect(FX, FY, FWd, FHd); X.restore();
    X.save(); X.beginPath(); X.rect(FX, FY, FWd, FHd); X.clip(); X.fillStyle = 'rgba(28,24,20,.05)'; for (let y = FY; y < FY + FHd; y += 4) X.fillRect(FX, y, FWd, 0.7); X.restore();
  }
  ink([[FX, FY], [FX + FWd, FY], [FX + FWd, FY + FHd], [FX, FY + FHd]], 1.6, 9501, .3, P.ink, true);
  // label
  X.fillStyle = P.ink; X.fillRect(FX - 14, FY - 46, 340, 24);
  txt(`BOX ${WORLD.no} · ${WORLD.title.toUpperCase()}`, FX - 14 + 170, FY - 34, 13, { mono: true, col: P.paper });
  // clicks
  for (const c of clicks) {
    const age = c.age / FPS; if (age > 0.9) continue;
    const x = FX + (c.x * FWd) / 800, y = FY + (c.y * FHd) / 500, r = 8 + age * 40;
    X.save(); X.globalAlpha = 1 - age / 0.9; circ(x, y, r, 9600 + c.n, .4); X.lineWidth = 2.5; X.strokeStyle = P.red; X.stroke(); X.restore();
    ink([[x - 6, y], [x + 6, y]], 2, 9700, .2, P.red); ink([[x, y - 6], [x, y + 6]], 2, 9701, .2, P.red);
  }
  // code slip (stays up until the next one)
  const code = CODE;
  let below = 90;
  if (code) {
    const a = b.code ? seg(lt, 0.2, 0.8) : 1;
    const x0 = 958, y0 = 90, w = 290, lh = 22;
    const lines = []; for (const l of code) { const parts = wrapMono(l, 30); lines.push(...parts); }
    const hgt = 44 + lines.length * lh;
    X.save(); X.globalAlpha = a; X.translate(x0, y0); X.rotate(-0.015);
    X.fillStyle = '#f6f0e1'; X.fillRect(0, 0, w, hgt);
    X.fillStyle = PAT.f; X.fillRect(0, hgt - 8, w, 8);
    ink([[0, 0], [w, 0], [w, hgt], [0, hgt]], 1.4, 9800, .3, P.ink, true);
    txt('class', 14, 20, 12, { mono: true, align: 'left', col: P.red });
    lines.forEach((l, i) => txt(l, 14, 44 + i * lh, 13, { mono: true, align: 'left' }));
    X.restore();
    below = y0 + hgt + 30;
  }
  // the goal, read live from the sketch
  const B = SB();
  if (B && WORLD.check) {
    let items = [];
    try { items = WORLD.check(B.vars(), MEM, B.state()); } catch (e) { items = []; }
    const x0 = 958, w = 290, lh = 20;
    const rows = []; for (const [ok, t2] of items) rows.push(...wrapMono(t2.replace(/\u2264/g, '<=').replace(/\u2265/g, '>='), 32).map((l, i) => [ok, l, i === 0]));
    const hgt = 40 + rows.length * lh;
    X.fillStyle = '#f6f0e1'; X.fillRect(x0, below, w, hgt);
    ink([[x0, below], [x0 + w, below], [x0 + w, below + hgt], [x0, below + hgt]], 1.4, 9810, .3, P.ink, true);
    txt('the goal, read live', x0 + 14, below + 18, 12, { mono: true, align: 'left', col: P.red });
    rows.forEach(([ok, l, first], i) => {
      const y = below + 40 + i * lh;
      if (first) { X.lineWidth = 1.4; X.strokeStyle = P.ink; X.strokeRect(x0 + 14, y - 6, 11, 11); if (ok) { X.fillStyle = P.ink; X.fillRect(x0 + 16, y - 4, 7, 7); } }
      txt(l, x0 + 32, y, 11.5, { mono: true, align: 'left' });
    });
  }
}
function wrapMono(s, n) { if (s.length <= n) return [s]; const out = []; let cur = s; while (cur.length > n) { let k = cur.lastIndexOf(' ', n); if (k < 8) k = n; out.push(cur.slice(0, k)); cur = '    ' + cur.slice(k).trimStart(); } out.push(cur); return out; }
function shotAphorism(lt, b) {
  paper();
  const a = seg(lt, 0.2, 1.2);
  X.save(); X.globalAlpha = a;
  const lines = wrap(WORLD.aphorism, 58, 980, false);
  const y0 = FH / 2 - (lines.length - 1) * 36 - 20;
  lines.forEach((l, i) => txt(l, FW / 2, y0 + i * 72, 58));
  txt(WORLD.aphRef, FW / 2, y0 + lines.length * 72 + 10, 16, { mono: true });
  X.restore();
  ink([[FW / 2 - 60, y0 - 70], [FW / 2 + 60, y0 - 70]], 1.2, 9900, .4);
}
function shotDoubt(lt, b, t) {
  paper(); skyLinesSoft(); floor();
  X.save();
  const z = 1 + 0.25 * seg(lt, 0, 2.5);
  X.translate(950, 600); X.scale(z, z); X.translate(-950, -600);
  table(460, 820, 520);
  boxCase(640, 445, 300, 150, 1, 1);
  trurl(330, t); klapaucius(950, t, 1.3, lt > 0.4 && lt < (b.vt1 - b.t0));
  X.restore();
}
function shotEnd(lt) {
  paper();
  const a = seg(lt, 0, 0.8);
  X.save(); X.globalAlpha = a;
  txt('KINGDOMS IN A BOX', FW / 2, 250, 18, { mono: true });
  txt(`No. ${WORLD.no} · ${WORLD.title}`, FW / 2, 300, 34);
  const lines = wrap(T.closing, 26, 820, true);
  lines.forEach((l, i) => txt(l, FW / 2, 390 + i * 36, 26, { italic: true }));
  txt('Watson Hartsoe, Growing Entanglements', FW / 2, 400 + lines.length * 36, 14, { mono: true });
  txt('Lab 7 · Classes', FW / 2, 560, 14, { mono: true });
  X.restore();
}

/* ---------- the timeline ---------- */
function beatAt(t) { let k = 0; for (let i = 0; i < T.beats.length; i++) if (t >= T.beats[i].t0) k = i; return k; }
async function runActs(b, lt) {
  const B = SB(); if (!B) return;
  (b.acts || []).forEach((a, i) => {
    const key = lastBeat + ':' + i;
    if (a.t !== undefined) {
      if (lt >= a.t && !doneActs.has(key)) { doneActs.add(key); act(a, B); }
    } else if (a.every) {
      if (lt < a.from || lt > a.to) return;
      const n = Math.floor((lt - a.from) / a.every);
      const k2 = key + ':' + n;
      if (!doneActs.has(k2)) { doneActs.add(k2); act(a, B); }
    }
  });
}
let clickN = 0;
function act(a, B) {
  if (a.set) for (const [k, v] of Object.entries(a.set)) B.set(k, v);
  let pts = [];
  if (a.click) pts = [a.click];
  if (a.fn) { try { pts = new Function('V', a.fn)(B.vars()) || []; } catch (e) { console.error('ACT', e.message); } }
  for (const [x, y] of pts) { B.click(x, y); clicks.push({ x, y, age: 0, n: clickN++ }); }
}
window.__render = async (f) => {
  const t = f / FPS, k = beatAt(t), b = T.beats[k], lt = t - b.t0;
  if (k !== lastBeat) {
    lastBeat = k;
    if (b.restart) { await startSketch(b.set); acc = 0; }
    else if (b.set && b.shot === 'inside') { const B = SB(); for (const [kk, v] of Object.entries(b.set)) B.set(kk, v); }
    if (b.code) CODE = b.code;
    if (b.restart) MEM = {};
  }
  await runActs(b, lt);
  if (b.shot === 'inside') { acc += b.speed ?? 2; const n = Math.floor(acc); acc -= n; if (n > 0) SB().step(n); }
  clicks.forEach((c) => c.age++); clicks = clicks.filter((c) => c.age < FPS);
  BOIL = Math.floor(f / 2);
  X.setTransform(1, 0, 0, 1, 0, 0); X.globalAlpha = 1; X.lineCap = 'round'; X.lineJoin = 'round';
  ({ title: shotTitle, workshop: shotWorkshop, inside: shotInside, aphorism: shotAphorism, doubt: shotDoubt, end: shotEnd })[b.shot](lt, b, t);
  if (b.shot !== 'title' && b.shot !== 'end' && b.shot !== 'aphorism' && b.say) {
    const ca = clamp((t - b.vt0 + 0.3) / 0.3) * clamp((b.t0 + b.d - t) / 0.3);
    captionLines(b.shot === 'doubt' ? `Klapaucius: “${b.say}”` : b.say, ca);
  }
  // cross-fade between shots
  const into = clamp(lt / 0.35), out = clamp((b.t0 + b.d - t) / 0.35);
  const veil = 1 - Math.min(into, out);
  const prev = T.beats[k - 1], next = T.beats[k + 1];
  const sameIn = prev && prev.shot === b.shot && lt < 0.35, sameOut = next && next.shot === b.shot && (b.t0 + b.d - t) < 0.35;
  if (veil > 0 && !sameIn && !sameOut) { X.fillStyle = P.paper; X.globalAlpha = veil; X.fillRect(0, 0, FW, FH); X.globalAlpha = 1; }
  border();
};
(async () => {
  await document.fonts.load('40px "IM Fell English"'); await document.fonts.load('italic 40px "IM Fell English"'); await document.fonts.load('14px "IBM Plex Mono"');
  T = await (await fetch(`timing/${ID}.json`, { cache: 'no-store' })).json();
  WORLD = WORLDS.find((w) => w.id === ID);
  FILM = FILMS[ID];
  const first = T.beats.find((b) => b.restart);
  await startSketch(first ? first.set : {});
  window.__NF = Math.ceil(T.dur * FPS);
  window.__ready = true;
})();
