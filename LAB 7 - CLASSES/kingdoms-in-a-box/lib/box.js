/* KINGDOMS IN A BOX · engine */
(() => {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s);
  const h = (tag, attrs, ...kids) => {
    const n = document.createElement(tag);
    if (attrs) for (const [k, v] of Object.entries(attrs)) {
      if (v === null || v === undefined || v === false) continue;
      if (k === 'class') n.className = v; else if (k === 'text') n.textContent = v;
      else if (k.startsWith('on')) n.addEventListener(k.slice(2), v); else n.setAttribute(k, v === true ? '' : v);
    }
    for (const k of kids.flat()) if (k !== null && k !== undefined && k !== false) n.append(k.nodeType ? k : document.createTextNode(String(k)));
    return n;
  };
  const store = {
    get(k, d) { try { const v = localStorage.getItem('kib.' + k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem('kib.' + k, JSON.stringify(v)); } catch (e) { /* off */ } },
  };
  const LIB = '../the-constructors/lib/';
  const SOLVED = new Set(store.get('solved', []));
  let W = null, RUN = null, cm = null, seq = 0, toastT;

  /* ---------- top-level names, for reading the sketch's variables ---------- */
  function topNames(src) {
    const ast = acorn.parse(src, { ecmaVersion: 'latest', sourceType: 'script', locations: true });
    const out = [];
    for (const st of ast.body) if (st.type === 'VariableDeclaration') for (const d of st.declarations) if (d.id.type === 'Identifier') out.push(d.id.name);
    return out;
  }
  /* write a slider value into the sketch's own `let name = value;` line */
  function setLet(src, name, value) {
    const re = new RegExp('^(let\\s+' + name + '\\s*=\\s*)([^;]+);', 'm');
    return src.replace(re, (m, a) => a + (typeof value === 'string' ? JSON.stringify(value) : String(value)) + ';');
  }
  function readLet(src, name) {
    const m = src.match(new RegExp('^let\\s+' + name + '\\s*=\\s*([^;]+);', 'm'));
    if (!m) return null;
    try { return JSON.parse(m[1].replace(/'/g, '"')); } catch (e) { return m[1].trim(); }
  }

  /* ---------- run a sketch in a fresh frame ---------- */
  function codeOf(w) { return store.get('code.' + w.id, w.sketch); }
  function run(opts) {
    opts = opts || {};
    const w = W, src = opts.src || codeOf(w);
    if (RUN) { RUN.host.dead = true; RUN.frame.remove(); }
    $('#err').hidden = true;
    let names;
    try { names = topNames(src); }
    catch (e) { showErr({ msg: e.message.replace(/\s*\(\d+:\d+\)\s*$/, ''), line: e.loc && e.loc.line }); return; }
    const host = { dead: false };
    host.onError = (e) => { if (!host.dead) showErr(e); };
    host.onLog = (k, t) => { if (!host.dead) log(k, t); };
    window.__boxHost = host;
    const cfg = { offset: 0, lines: src.split('\n').length, seed: opts.seed || 0 };
    const pre = `<!doctype html><html><head><meta charset="utf-8"><style>html,body{margin:0;overflow:hidden;background:#f5f5f5}canvas{display:block}</style></head><body><script src="${LIB}p5.min.js"><\/script><script>window.__CFG=@CFG@;<\/script><script src="lib/box-runtime.js"><\/script><script>\n`;
    cfg.offset = (pre.match(/\n/g) || []).length;
    const accessor = ';window.__vars=function(){var o={};' + names.map((n) => `try{o[${JSON.stringify(n)}]=${n}}catch(e){}`).join('') + 'return o};';
    const doc = pre.replace('@CFG@', JSON.stringify(cfg)) + src.replace(/<\/script/gi, '<\\/script') + '\n' + accessor + '\n<\/script></body></html>';
    const f = h('iframe', { title: w.title, class: 'sk' });
    $('#box').prepend(f);
    RUN = { id: ++seq, host, frame: f, w, ok: 0, paused: false, startT: performance.now() };
    if (w.resetRun) w.resetRun(mem(w));
    f.srcdoc = doc;
    layout();
    $('#pause').textContent = 'PAUSE';
  }
  const MEM = {};
  const mem = (w) => (MEM[w.id] = MEM[w.id] || {});
  const B = () => { try { return RUN && RUN.frame.contentWindow.__box; } catch (e) { return null; } };
  function layout() {
    const view = $('#view'), v = view.getBoundingClientRect(), padL = parseFloat(getComputedStyle(view).paddingLeft) || 0;
    const s = Math.min((v.width - padL - 32) / 800, (v.height - 32) / 500);
    const box = $('#box'); box.style.width = 800 * s + 'px'; box.style.height = 500 * s + 'px';
    if (RUN) RUN.frame.style.transform = `scale(${s})`;
  }
  window.addEventListener('resize', layout);

  /* ---------- console and errors ---------- */
  function log(k, t) {
    const c = $('#log'); c.hidden = false;
    c.textContent = t; c.className = 'log ' + k;
    clearTimeout(c.__t); c.__t = setTimeout(() => { c.hidden = true; }, 4000);
  }
  function showErr(e) {
    const el = $('#err'); el.hidden = false;
    el.replaceChildren(h('b', null, 'ERROR' + (e.line ? ' · LINE ' + e.line : '')), h('span', null, e.msg));
    if (cm && e.line) { openCode(); cm.addLineClass(e.line - 1, 'background', 'cm-err'); cm.scrollIntoView({ line: e.line - 1, ch: 0 }, 60); setTimeout(() => cm.removeLineClass(e.line - 1, 'background', 'cm-err'), 6000); }
  }

  /* ---------- goal ---------- */
  function checkGoal() {
    const b = B(); if (!b || !W) return;
    const st = b.state(); if (!st.frame || st.failed) return;
    let items;
    try { items = W.check(b.vars(), mem(W), st); } catch (e) { items = [[false, 'The check could not read the sketch: ' + e.message]]; }
    const ok = W.done ? W.done(items) : items.every((x) => x[0]);
    RUN.ok = ok ? RUN.ok + 1 : 0;
    const solved = RUN.ok >= (W.hold || 6);
    const html = items.map(([k, t]) => `<li class="${k ? 'ok' : ''}"><span class="mk"></span>${t.replace(/[<&]/g, (c) => (c === '<' ? '&lt;' : '&amp;'))}</li>`).join('');
    const ul = $('#checks'); if (ul.__h !== html) { ul.innerHTML = html; ul.__h = html; }
    if (solved && !SOLVED.has(W.id)) { SOLVED.add(W.id); store.set('solved', [...SOLVED]); shelfMarks(); toast('Box ' + W.no + ' solved'); }
    $('#state').textContent = SOLVED.has(W.id) ? 'SOLVED' : `${items.filter((x) => x[0]).length} of ${items.length}`;
    $('#state').className = 'state' + (SOLVED.has(W.id) ? ' on' : '');
  }
  setInterval(checkGoal, 100);

  /* ---------- controls ---------- */
  function renderControls() {
    const box = $('#controls'); box.innerHTML = '';
    const src = codeOf(W);
    for (const p of W.params) {
      const val = readLet(src, p.name);
      if (p.type === 'choice') {
        box.append(h('div', { class: 'ctl' }, h('label', null, p.label), h('div', { class: 'seg' }, p.options.map((o) => h('button', {
          class: o === val ? 'on' : '', onclick: (e) => { setParam(p, o); e.target.parentNode.querySelectorAll('button').forEach((b) => b.classList.toggle('on', b === e.target)); },
        }, o.toUpperCase())))));
        continue;
      }
      const out = h('output', null, fmt(val, p));
      const input = h('input', { type: 'range', min: p.min, max: p.max, step: p.step, value: val, 'aria-label': p.label });
      input.addEventListener('input', () => { out.textContent = fmt(+input.value, p); if (!p.restart) setParam(p, +input.value); });
      input.addEventListener('change', () => { if (p.restart) setParam(p, +input.value); });
      box.append(h('div', { class: 'ctl' }, h('label', null, p.label, p.restart ? h('i', null, ' restarts') : null, out), input));
    }
  }
  const fmt = (v, p) => (p.step >= 1 ? String(v) : Number(v).toFixed(2));
  function setParam(p, v) {
    const src = setLet(codeOf(W), p.name, v);
    store.set('code.' + W.id, src);
    if (cm && !$('#code').hidden) cm.setValue(src);
    if (p.restart) { run(); return; }
    const b = B(); if (b) b.set(p.name, v);
  }

  /* ---------- code drawer ---------- */
  function closeCode() { $('#code').hidden = true; $('#stage').classList.remove('coding'); layout(); }
  function openCode() {
    const d = $('#code'); d.hidden = false; $('#stage').classList.add('coding'); layout();
    if (!cm) {
      cm = CodeMirror($('#cm'), { value: codeOf(W), mode: 'javascript', lineNumbers: true, matchBrackets: true, autoCloseBrackets: true, indentUnit: 2, tabSize: 2,
        extraKeys: { 'Ctrl-Enter': applyCode, 'Cmd-Enter': applyCode, Esc: closeCode } });
    } else cm.setValue(codeOf(W));
    setTimeout(() => cm.refresh(), 0);
  }
  function applyCode() { store.set('code.' + W.id, cm.getValue()); renderControls(); run(); }
  function resetCode() { store.set('code.' + W.id, W.sketch); if (cm) cm.setValue(W.sketch); renderControls(); run(); toast('Back to the original sketch'); }
  async function copyCode() {
    const t = codeOf(W);
    try { await navigator.clipboard.writeText(t); toast('Sketch copied: it runs in the p5 editor as is'); }
    catch (e) { const ta = h('textarea'); ta.value = t; document.body.append(ta); ta.select(); try { document.execCommand('copy'); toast('Sketch copied'); } catch (e2) { toast('Select the code and copy it'); } ta.remove(); }
  }

  /* ---------- film ---------- */
  function openFilm() {
    const m = $('#filmModal'); m.hidden = false;
    const v = $('#filmVideo'); v.src = `films/${W.id}.mp4`; v.poster = `films/${W.id}.jpg`;
    $('#filmTitle').textContent = `Box ${W.no} · ${W.title}`;
    v.play().catch(() => {});
  }
  function closeFilm() { const v = $('#filmVideo'); v.pause(); $('#filmModal').hidden = true; }

  /* ---------- views ---------- */
  function shelfMarks() { document.querySelectorAll('[data-box]').forEach((el) => el.classList.toggle('solved', SOLVED.has(el.dataset.box))); }
  function renderTabs() {
    const nav = $('#tabs'); nav.innerHTML = '';
    for (const g of GROUPS) {
      nav.append(h('div', { class: 'grp' }, h('b', null, g.name.toUpperCase()), h('div', { class: 'row' },
        WORLDS.filter((w) => w.group === g.key).map((w) => h('a', { href: '#' + w.id, 'data-box': w.id, title: `${w.no} ${w.title}`, class: W && W.id === w.id ? 'here' : '' }, w.no)))));
    }
    shelfMarks();
  }
  function showShelf() {
    W = null; if (RUN) { RUN.host.dead = true; RUN.frame.remove(); RUN = null; }
    document.body.className = 'shelf';
    renderTabs();
    const s = $('#shelf'); s.innerHTML = '';
    s.append(h('div', { class: 'intro' },
      h('p', { class: 'kick' }, 'LAB 7 · CLASSES · AFTER THE SEVENTH SALLY'),
      h('h1', null, 'Kingdoms in a Box'),
      h('p', null, 'In the Seventh Sally, Trurl builds a whole kingdom in a box, small enough to carry and complete down to its citizens. Klapaucius asks whether what happens inside is real. Each box here is one small world: a class, an array of its instances, and one rule in update().'),
      h('p', { class: 'aph' }, 'The program does not receive history. It receives a translation.'),
      h('p', { class: 'src' }, 'Hartsoe, Growing Entanglements · METISIM')));
    for (const g of GROUPS) {
      s.append(h('h2', null, g.name));
      s.append(h('div', { class: 'cards' }, WORLDS.filter((w) => w.group === g.key).map((w) => h('a', { class: 'card', href: '#' + w.id, 'data-box': w.id },
        h('img', { src: `films/${w.id}.jpg`, alt: '', loading: 'lazy' }),
        h('span', { class: 'no' }, w.no), h('b', null, w.title), h('q', null, w.aphorism), h('small', null, w.source)))));
    }
    shelfMarks();
  }
  function showBox(id) {
    const w = WORLDS.find((x) => x.id === id);
    if (!w) return showShelf();
    W = w; document.body.className = 'box';
    document.title = `${w.no} ${w.title} · Kingdoms in a Box`;
    renderTabs();
    $('#no').textContent = `BOX ${w.no} · ${w.source}`;
    $('#title').textContent = w.title;
    $('#aph').textContent = w.aphorism;
    $('#aphRef').textContent = w.aphRef;
    $('#goal').textContent = w.goal;
    $('#click').textContent = w.click;
    $('#frame').textContent = w.frame;
    $('#checks').innerHTML = ''; $('#checks').__h = '';
    $('#state').textContent = ''; $('#code').hidden = true; $('#stage').classList.remove('coding');
    renderControls();
    requestAnimationFrame(() => { layout(); run(); });
  }
  function route() { const id = location.hash.slice(1); if (id) showBox(id); else showShelf(); }
  function toast(t) { const el = $('#toast'); el.textContent = t; el.classList.add('on'); clearTimeout(toastT); toastT = setTimeout(() => el.classList.remove('on'), 2200); }
  function step(dir) { const i = WORLDS.findIndex((x) => W && x.id === W.id); location.hash = WORLDS[(i + dir + WORLDS.length) % WORLDS.length].id; }

  /* ---------- boot ---------- */
  $('#restart').onclick = () => run();
  $('#pause').onclick = () => { const b = B(); if (!b) return; RUN.paused = !RUN.paused; if (RUN.paused) b.pause(); else b.resume(); $('#pause').textContent = RUN.paused ? 'PLAY' : 'PAUSE'; };
  $('#openCode').onclick = () => ($('#code').hidden ? openCode() : closeCode());
  $('#apply').onclick = applyCode; $('#copy').onclick = copyCode; $('#resetCode').onclick = resetCode; $('#closeCode').onclick = closeCode;
  $('#openFilm').onclick = openFilm; $('#closeFilm').onclick = closeFilm;
  $('#filmModal').addEventListener('click', (e) => { if (e.target.id === 'filmModal') closeFilm(); });
  document.addEventListener('keydown', (e) => {
    if (e.target.closest('.CodeMirror') || /INPUT|TEXTAREA/.test(e.target.tagName)) return;
    if (e.key === 'Escape') { closeFilm(); closeCode(); }
    if (!W) return;
    if (e.key === 'r' || e.key === 'R') run();
    if (e.key === ' ') { e.preventDefault(); $('#pause').click(); }
    if (e.key === 'ArrowRight') step(1);
    if (e.key === 'ArrowLeft') step(-1);
    if (e.key === 'f' || e.key === 'F') openFilm();
  });
  window.addEventListener('hashchange', route);
  route();
  window.__kib = { run, B, get W() { return W; }, mem, WORLDS, setParam, get RUN() { return RUN; } };
})();
