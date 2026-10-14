/* THE CONSTRUCTORS · bench
   Editor, runner, step debugger, sketch overlay, puzzles, practice field and match. */
(() => {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s);
  const h = (tag, attrs, ...kids) => {
    const n = document.createElement(tag);
    if (attrs) for (const [k, v] of Object.entries(attrs)) {
      if (v === null || v === undefined || v === false) continue;
      if (k === 'class') n.className = v; else if (k === 'text') n.textContent = v; else if (k === 'html') n.innerHTML = v;
      else if (k.startsWith('on')) n.addEventListener(k.slice(2), v); else n.setAttribute(k, v === true ? '' : v);
    }
    for (const k of kids.flat()) if (k !== null && k !== undefined && k !== false) n.append(k.nodeType ? k : document.createTextNode(String(k)));
    return n;
  };
  const store = {
    get(k, d) { try { const v = localStorage.getItem('c7.' + k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem('c7.' + k, JSON.stringify(v)); } catch (e) { /* storage off */ } },
  };
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const unq = (s) => { if (typeof s === 'string' && s[0] === '"') { try { return JSON.parse(s); } catch (e) { return s; } } return s; };
  const AR = window.ARENA;

  /* =====================================================================
     1. INSTRUMENT: parse with acorn, insert trace calls on the same lines
     ===================================================================== */
  const KIDS_SKIP = new Set(['type', 'start', 'end', 'loc', 'range']);
  function kids(n) {
    const out = [];
    for (const k in n) { if (KIDS_SKIP.has(k)) continue; const v = n[k]; if (Array.isArray(v)) { for (const c of v) if (c && typeof c.type === 'string') out.push(c); } else if (v && typeof v.type === 'string') out.push(v); }
    return out;
  }
  function idsOf(p, out) {
    if (!p) return;
    switch (p.type) {
      case 'Identifier': out.push(p.name); break;
      case 'ObjectPattern': p.properties.forEach((q) => idsOf(q.type === 'RestElement' ? q.argument : q.value, out)); break;
      case 'ArrayPattern': p.elements.forEach((q) => idsOf(q, out)); break;
      case 'RestElement': idsOf(p.argument, out); break;
      case 'AssignmentPattern': idsOf(p.left, out); break;
    }
  }
  const VALID = /^[A-Za-z_$][\w$]*$/;
  function declared(fn) {
    const out = [];
    fn.params.forEach((p) => idsOf(p, out));
    (function scan(n) {
      if (!n || typeof n.type !== 'string') return;
      if (/^(FunctionDeclaration|FunctionExpression|ArrowFunctionExpression|ClassDeclaration|ClassExpression)$/.test(n.type)) return;
      if (n.type === 'VariableDeclaration') n.declarations.forEach((d) => idsOf(d.id, out));
      if (n.type === 'CatchClause') idsOf(n.param, out);
      kids(n).forEach(scan);
    })(fn.body.type === 'BlockStatement' ? { type: 'X', body: fn.body.body } : fn.body);
    return [...new Set(out)].filter((n) => VALID.test(n) && n !== 'arguments').slice(0, 24);
  }
  const locExpr = (names) => (names.length ? 'function(){var __o={};' + names.map((n) => `try{__o.${n}=${n}}catch(__e){}`).join('') + 'return __o}' : '0');

  function instrument(src) {
    const comments = [];
    let ast;
    try { ast = acorn.parse(src, { ecmaVersion: 'latest', sourceType: 'script', locations: true, onComment: comments }); }
    catch (e) { return { error: { msg: e.message.replace(/\s*\(\d+:\d+\)\s*$/, ''), line: e.loc ? e.loc.line : null, col: e.loc ? e.loc.column + 1 : null, syntax: true } }; }
    const edits = []; let seq = 0;
    const add = (pos, text) => edits.push({ pos, text, seq: seq++ });
    const S = (n) => src.slice(n.start, n.end);
    const info = { stmt: {}, close: {}, comments: {}, fns: new Set(), classes: {}, methods: {}, refs: {}, span: [], range: {}, src };
    const tops = [];
    for (const st of ast.body) if (st.type === 'VariableDeclaration') st.declarations.forEach((d) => idsOf(d.id, tops));
    for (const c of comments) for (let l = c.loc.start.line; l <= c.loc.end.line; l++) info.comments[l] = true;

    const note = (st) => { const L = st.loc.start.line; if (!info.stmt[L]) info.stmt[L] = st; if (st.loc.end.line > L) info.span.push([L, st.loc.end.line]); };
    const T = (st, ctx) => `__T(${st.loc.start.line},${ctx.self},${ctx.locs});`;
    function trace(st, ctx) { if (/^(FunctionDeclaration|ClassDeclaration|EmptyStatement)$/.test(st.type)) return; add(st.start, T(st, ctx)); }
    function block(list, ctx) { for (const st of list) { note(st); trace(st, ctx); visit(st, ctx); } }
    function sub(st, ctx) {
      if (st.type === 'BlockStatement') { visit(st, ctx); return; }
      note(st); add(st.start, '{' + T(st, ctx)); visit(st, ctx); add(st.end, '}');
    }
    function loopBody(n, ctx) {
      const b = n.body, lt = `__L(${n.loc.start.line},${ctx.self},${ctx.locs});`;
      if (b.type === 'BlockStatement') { add(b.start + 1, lt); visit(b, ctx); }
      else { note(b); add(b.start, '{' + lt + T(b, ctx)); visit(b, ctx); add(b.end, '}'); }
    }
    function fnVisit(fn, ctx, name, kind, line, isCtor, derived) {
      const locs = locExpr(declared(fn));
      const self = derived ? '0' : fn.type === 'ArrowFunctionExpression' ? ctx.self : 'this';
      const nctx = { self, locs };
      if (fn.body.type !== 'BlockStatement') { visit(fn.body, nctx); return; }
      let head = `__F(${line},${JSON.stringify(kind + ':' + name)},${self},${locs});`;
      if (isCtor && !derived) head = '__R(this);' + head;
      add(fn.body.start + 1, head);
      if (isCtor && derived) {
        const sup = fn.body.body.find((s) => s.type === 'ExpressionStatement' && s.expression.type === 'CallExpression' && s.expression.callee.type === 'Super');
        if (sup) add(sup.end, '__R(this);');
      }
      visit(fn.body, nctx);
    }
    function visit(n, ctx) {
      if (!n || typeof n.type !== 'string') return;
      switch (n.type) {
        case 'Program': case 'BlockStatement': case 'StaticBlock': block(n.body, ctx); return;
        case 'SwitchStatement': visit(n.discriminant, ctx); for (const c of n.cases) { if (c.test) visit(c.test, ctx); block(c.consequent, ctx); } return;
        case 'IfStatement': visit(n.test, ctx); sub(n.consequent, ctx); if (n.alternate) sub(n.alternate, ctx); return;
        case 'ForStatement': if (n.init) visit(n.init, ctx); if (n.test) visit(n.test, ctx); if (n.update) visit(n.update, ctx); loopBody(n, ctx); return;
        case 'ForInStatement': case 'ForOfStatement': visit(n.right, ctx); loopBody(n, ctx); return;
        case 'WhileStatement': visit(n.test, ctx); loopBody(n, ctx); return;
        case 'DoWhileStatement': loopBody(n, ctx); visit(n.test, ctx); return;
        case 'FunctionDeclaration': info.fns.add(n.id.name); fnVisit(n, ctx, n.id.name, 'f', n.loc.start.line, false, false); return;
        case 'FunctionExpression': case 'ArrowFunctionExpression': fnVisit(n, ctx, n.id ? n.id.name : '', 'a', n.loc.start.line, false, false); return;
        case 'ClassDeclaration': case 'ClassExpression': {
          const cname = n.id ? n.id.name : 'class';
          if (n.superClass) visit(n.superClass, ctx);
          info.classes[n.loc.start.line] = n;
          for (const m of n.body.body) {
            if (m.type === 'MethodDefinition') {
              const key = m.key.name || S(m.key);
              info.methods[m.loc.start.line] = { m, cls: cname, key };
              fnVisit(m.value, ctx, m.kind === 'constructor' ? cname : key, m.kind === 'constructor' ? 'c' : 'm', m.loc.start.line, m.kind === 'constructor', !!n.superClass);
            } else if (m.value) visit(m.value, ctx);
          }
          return;
        }
        default: for (const c of kids(n)) visit(c, ctx);
      }
    }
    visit(ast, { self: 'this', locs: '0' });

    /* closing braces, and which names each line reads or writes */
    (function walk(n, parent) {
      if (!n || typeof n.type !== 'string') return;
      const multi = n.loc && n.loc.end.line > n.loc.start.line;
      let label = null;
      if (n.type === 'FunctionDeclaration') label = `function ${n.id.name}()`;
      else if (n.type === 'ClassDeclaration') label = `class ${n.id.name}`;
      else if (n.type === 'MethodDefinition') label = n.kind === 'constructor' ? 'the constructor' : `the method ${n.key.name || ''}()`;
      else if (/^(For|ForOf|ForIn|While|DoWhile)Statement$/.test(n.type)) label = 'the loop';
      else if (n.type === 'IfStatement') label = 'the if block';
      else if (n.type === 'ArrayExpression') label = 'the array';
      if (multi && /^(For|ForOf|ForIn|While|DoWhile|If)Statement$|^FunctionDeclaration$|^MethodDefinition$|^ClassDeclaration$/.test(n.type) && !info.range[n.loc.start.line]) info.range[n.loc.start.line] = [n.loc.start.line, n.loc.end.line];
      if (label && multi && !info.close[n.loc.end.line]) info.close[n.loc.end.line] = { label, line: n.loc.start.line };
      if (n.type === 'IfStatement' && n.consequent.type === 'BlockStatement' && n.alternate && !info.close[n.consequent.loc.end.line]) info.close[n.consequent.loc.end.line] = { label: 'the if block', line: n.loc.start.line };
      kids(n).forEach((c) => walk(c, n));
    })(ast);
    const topSet = new Set(tops);
    for (const [L, st] of Object.entries(info.stmt)) {
      let parts = [st];
      if (st.type === 'IfStatement' || st.type === 'WhileStatement' || st.type === 'DoWhileStatement') parts = [st.test];
      else if (st.type === 'ForStatement') parts = [st.init, st.test, st.update];
      else if (st.type === 'ForOfStatement' || st.type === 'ForInStatement') parts = [st.left, st.right];
      else if (/^(FunctionDeclaration|ClassDeclaration)$/.test(st.type)) parts = [];
      const names = new Set(), props = new Set();
      (function scan(n) {
        if (!n || typeof n.type !== 'string') return;
        if (/^(FunctionExpression|ArrowFunctionExpression)$/.test(n.type)) return;
        if (n.type === 'Identifier' && topSet.has(n.name)) names.add(n.name);
        if (n.type === 'MemberExpression' && n.object.type === 'ThisExpression' && !n.computed && n.property.name) props.add(n.property.name);
        kids(n).forEach(scan);
      })({ type: 'X', body: parts.filter(Boolean) });
      info.refs[L] = { names: [...names], props: [...props] };
    }

    edits.sort((a, b) => b.pos - a.pos || b.seq - a.seq);
    let code = src;
    for (const e of edits) code = code.slice(0, e.pos) + e.text + code.slice(e.pos);
    const accessor = ';window.__vars=function(){var __o={};' + tops.filter((n) => VALID.test(n)).map((n) => `try{__o[${JSON.stringify(n)}]=${n}}catch(__e){}`).join('') + 'return __o};';
    return { code, accessor, tops, info, ast };
  }

  /* =====================================================================
     2. PLAIN-ENGLISH EXPLANATIONS
     ===================================================================== */
  const colr = (a) => (a.length === 1 ? (/^\d/.test(a[0]) ? `grey ${a[0]} (0 is black, 255 is white)` : a[0]) : a.length === 2 ? `grey ${a[0]}, opacity ${a[1]}` : `(${a.slice(0, 3).join(', ')})${a.length > 3 ? `, opacity ${a[3]}` : ''}`);
  const DOC = {
    createCanvas: (a) => `Makes a canvas ${a[0]} pixels wide and ${a[1]} pixels tall.`,
    resizeCanvas: (a) => `Changes the canvas to ${a[0]} by ${a[1]} pixels.`,
    background: (a) => `Paints the whole canvas ${colr(a)}. It covers everything drawn in the frame before.`,
    fill: (a) => `Sets the fill colour to ${colr(a)} for the shapes and text drawn after this line.`,
    noFill: () => 'Shapes drawn after this line have no fill.',
    stroke: (a) => `Sets the outline colour to ${colr(a)} for the shapes drawn after this line.`,
    noStroke: () => 'Shapes drawn after this line have no outline.',
    strokeWeight: (a) => `Outlines and lines drawn after this line are ${a[0]} px thick.`,
    circle: (a) => `Draws a circle centred at (${a[0]}, ${a[1]}), ${a[2]} px across.`,
    ellipse: (a) => `Draws an ellipse centred at (${a[0]}, ${a[1]}), ${a[2]} px wide and ${a[3] ?? a[2]} px tall.`,
    rect: (a) => `Draws a rectangle with its top-left corner at (${a[0]}, ${a[1]}), ${a[2]} px wide and ${a[3] ?? a[2]} px tall.`,
    square: (a) => `Draws a square with its top-left corner at (${a[0]}, ${a[1]}), ${a[2]} px on each side.`,
    line: (a) => `Draws a line from (${a[0]}, ${a[1]}) to (${a[2]}, ${a[3]}).`,
    point: (a) => `Draws one dot at (${a[0]}, ${a[1]}).`,
    triangle: (a) => `Draws a triangle with corners at (${a[0]}, ${a[1]}), (${a[2]}, ${a[3]}) and (${a[4]}, ${a[5]}).`,
    quad: (a) => `Draws a four-sided shape with corners at (${a[0]}, ${a[1]}), (${a[2]}, ${a[3]}), (${a[4]}, ${a[5]}) and (${a[6]}, ${a[7]}).`,
    arc: (a) => `Draws part of an ellipse centred at (${a[0]}, ${a[1]}), from angle ${a[4]} to angle ${a[5]}.`,
    text: (a) => `Writes ${a[0]} at (${a[1]}, ${a[2]}). The y is where the bottom of the letters sits.`,
    textSize: (a) => `Text drawn after this line is ${a[0]} px tall.`,
    textAlign: (a) => `Lines up text drawn after this line by its ${String(a[0]).toLowerCase().replace(/"/g, '')}.`,
    translate: (a) => `Moves the point (0, 0) to (${a[0]}, ${a[1]}). Everything drawn after this shifts by that much.`,
    rotate: (a) => `Turns everything drawn after this line by ${a[0]} radians around (0, 0).`,
    scale: (a) => `Scales everything drawn after this line by ${a.join(' and ')}.`,
    push: () => 'Saves the current colours, line settings and position. pop() brings them back.',
    pop: () => 'Brings back the settings saved by the last push().',
    random: (a, r) => (a.length === 0 ? 'Picks a random number from 0 up to 1' : a.length === 1 ? (/^\[|^[a-z_$]/i.test(a[0]) && !/^\d/.test(a[0]) ? `Picks one item of ${a[0]} at random` : `Picks a random number from 0 up to ${a[0]}`) : `Picks a random number from ${a[0]} up to ${a[1]}`) + (r !== undefined ? `. This time it gave ${r}.` : '.'),
    dist: (a, r) => `Measures the distance from (${a[0]}, ${a[1]}) to (${a[2]}, ${a[3]})${r !== undefined ? `: ${r} px` : ''}.`,
    map: (a, r) => `Rescales ${a[0]} from the range ${a[1]}–${a[2]} to the range ${a[3]}–${a[4]}${r !== undefined ? `: ${r}` : ''}.`,
    constrain: (a, r) => `Keeps ${a[0]} between ${a[1]} and ${a[2]}${r !== undefined ? `: ${r}` : ''}.`,
    lerp: (a, r) => `Finds the value ${a[2]} of the way from ${a[0]} to ${a[1]}${r !== undefined ? `: ${r}` : ''}.`,
    noise: (a, r) => `Gets a smooth random value for ${a.join(', ')}${r !== undefined ? `: ${r}` : ''}.`,
    sqrt: (a) => `Takes the square root of ${a[0]}.`,
    floor: (a) => `Rounds ${a[0]} down to a whole number.`,
    round: (a) => `Rounds ${a[0]} to the nearest whole number.`,
    abs: (a) => `Takes ${a[0]} without its minus sign.`,
    min: (a) => `Takes the smallest of ${a.join(', ')}.`,
    max: (a) => `Takes the largest of ${a.join(', ')}.`,
    sin: (a) => `Takes the sine of ${a[0]}.`, cos: (a) => `Takes the cosine of ${a[0]}.`, atan2: (a) => `Takes the angle from (0, 0) to (${a[1]}, ${a[0]}).`,
    frameRate: (a) => `Asks p5 to run draw() ${a[0]} times a second.`,
    noLoop: () => 'Stops draw() from repeating after this frame.',
    loop: () => 'Starts draw() repeating again.',
    rectMode: (a) => `From here on, rect() reads its first two numbers as the ${String(a[0]).toLowerCase()} of the rectangle.`,
    ellipseMode: (a) => `From here on, circle() and ellipse() read their first two numbers as the ${String(a[0]).toLowerCase()}.`,
    recruit: (a) => `Draws one recruit standing at (${a[0]}, ${a[1]}).`,
    letterPoints: (a) => `Gets ${a[1] || 48} points that trace the letters of ${a[0]}.`,
    'console.log': (a) => `Prints ${a.join(', ')} in the console under the sketch.`,
  };
  const FNDOC = {
    setup: 'setup() runs once, when the sketch starts. One-time work goes here: the canvas, and the objects you build.',
    draw: 'draw() runs again and again, about 60 times a second. Each run draws one frame.',
    mousePressed: 'p5 runs mousePressed() once each time the mouse button goes down over the sketch.',
    mouseReleased: 'p5 runs mouseReleased() once each time the mouse button comes up.',
    keyPressed: 'p5 runs keyPressed() once each time a key goes down. key holds which one.',
    windowResized: 'p5 runs windowResized() when the window changes size.',
    preload: 'preload() runs before setup(). Load images and files here.',
  };
  const srcOf = (n) => (INFO ? INFO.info.src.slice(n.start, n.end) : '');
  const params = (fn) => fn.params.map(srcOf).join(', ');

  function callText(e, live) {
    const c = e.callee;
    if (c.type === 'Identifier') {
      const n = c.name, call = live && live.calls.find((x) => x.fn === n);
      const a = call ? call.a : e.arguments.map(srcOf);
      if (DOC[n]) return DOC[n](a, call ? call.r : undefined);
      if (INFO && INFO.info.fns.has(n)) return `Runs your function ${n}().` + (live && live.next && live.next.kind === 'enter' ? ' The next step is inside it.' : '');
      return `Calls ${n}().`;
    }
    if (c.type === 'MemberExpression') {
      const obj = srcOf(c.object), p = c.property.name || srcOf(c.property), args = e.arguments.map(srcOf).join(', ');
      if (obj === 'console') return DOC['console.log'](e.arguments.map(srcOf));
      if (p === 'push') return `Adds ${args} to the end of the array ${obj}.`;
      if (p === 'pop') return `Removes the last item of ${obj}.`;
      if (p === 'shift') return `Removes the first item of ${obj}.`;
      if (p === 'unshift') return `Adds ${args} to the front of ${obj}.`;
      if (p === 'splice') return `Removes items from ${obj}, starting at index ${srcOf(e.arguments[0] || c)}.`;
      if (p === 'forEach') return `Runs a function once for each item of ${obj}.`;
      const nx = live && live.next && live.next.kind === 'enter' ? live.next.selfLabel : '';
      return `Asks ${nx || obj} to run its ${p}() method.` + (nx ? ' The next step is inside it, where this means ' + nx + '.' : '');
    }
    return 'Calls a function.';
  }
  function describe(st, live) {
    switch (st.type) {
      case 'FunctionDeclaration': return FNDOC[st.id.name] || `Defines the function ${st.id.name}(${params(st)}). Its lines run each time the code calls ${st.id.name}().`;
      case 'ClassDeclaration': return `Defines the class ${st.id.name}: a template. new ${st.id.name}(…) builds objects from it.`;
      case 'VariableDeclaration': return st.declarations.map((d) => {
        const name = srcOf(d.id), init = d.init;
        if (!init) return `Makes a variable named ${name}. It holds undefined until something is stored in it.`;
        if (init.type === 'ArrayExpression') return init.elements.length ? `Makes ${name}, an array of ${init.elements.length} items.` : `Makes ${name}, an empty array.`;
        if (init.type === 'NewExpression') return `Builds a new ${srcOf(init.callee)} object and stores it in ${name}.`;
        if (init.type === 'ObjectExpression') return `Makes ${name}, an object with ${init.properties.length} properties.`;
        return `Makes a variable named ${name} and stores ${srcOf(init)} in it.`;
      }).join(' ');
      case 'ExpressionStatement': {
        const e = st.expression;
        if (e.type === 'CallExpression') return callText(e, live);
        if (e.type === 'AssignmentExpression') {
          const l = srcOf(e.left), r = srcOf(e.right);
          if (e.right.type === 'NewExpression' && e.operator === '=') return `Builds a new ${srcOf(e.right.callee)} object and stores it in ${l}.`;
          return { '=': `Stores ${r} in ${l}.`, '+=': `Adds ${r} to ${l}.`, '-=': `Subtracts ${r} from ${l}.`, '*=': `Multiplies ${l} by ${r}.`, '/=': `Divides ${l} by ${r}.` }[e.operator] || `Changes ${l}.`;
        }
        if (e.type === 'UpdateExpression') return `${e.operator === '++' ? 'Adds 1 to' : 'Subtracts 1 from'} ${srcOf(e.argument)}.`;
        return 'Runs this expression.';
      }
      case 'IfStatement': {
        const t = `Checks ${srcOf(st.test)}.`;
        if (!live) return t + ' The lines inside { } run only when it is true' + (st.alternate ? '; otherwise the else lines run.' : '.');
        return t + ' ' + (live.ifRes === true ? 'It is true, so the lines inside { } run.' : live.ifRes === 'else' ? 'It is false, so the else lines run.' : 'It is false, so the lines inside { } are skipped.');
      }
      case 'ForStatement': return `A loop. ${st.init ? srcOf(st.init).replace(/;$/, '') + ' sets up the counter. ' : ''}${st.test ? `Before each round it checks ${srcOf(st.test)}. ` : ''}${st.update ? `After each round: ${srcOf(st.update)}.` : ''}`;
      case 'ForOfStatement': return `Runs the lines inside { } once for each item in ${srcOf(st.right)}. Each round, ${srcOf(st.left).replace(/^(let|const|var)\s+/, '')} is the current item.`;
      case 'ForInStatement': return `Runs the lines inside { } once for each key of ${srcOf(st.right)}.`;
      case 'WhileStatement': return `Repeats the lines inside { } while ${srcOf(st.test)} is true.`;
      case 'DoWhileStatement': return `Runs the lines inside { }, then repeats them while ${srcOf(st.test)} is true.`;
      case 'ReturnStatement': return st.argument ? `Ends this function and sends back ${srcOf(st.argument)}.` : 'Ends this function here.';
      case 'BreakStatement': return 'Leaves the loop now.';
      case 'ContinueStatement': return 'Skips the rest of this round and starts the next one.';
      default: return 'Runs this line.';
    }
  }
  function staticText(L) {
    if (!INFO) return '';
    const I = INFO.info, raw = (cm.getLine(L - 1) || '').trim();
    if (!raw) return 'An empty line. It changes nothing.';
    if (I.comments[L] && (raw.startsWith('//') || raw.startsWith('/*') || raw.startsWith('*'))) return 'A comment. JavaScript skips it.';
    if (I.classes[L]) { const n = I.classes[L].id ? I.classes[L].id.name : 'class'; return `Defines the class ${n}: a template. new ${n}(…) builds objects from it.`; }
    if (I.methods[L]) { const { m, cls, key } = I.methods[L]; return m.kind === 'constructor' ? `The constructor. It runs once inside every new ${cls}(…) and stores the new object’s starting values on this.` : `Defines the method ${key}(${params(m.value)}). Every ${cls} object can run it. Inside it, this is the object running it.`; }
    if (I.stmt[L]) return describe(I.stmt[L], null);
    if (I.close[L] && /^[})\];,\s]+$/.test(raw)) return `Closes ${I.close[L].label}, which starts on line ${I.close[L].line}.`;
    const sp = I.span.filter(([a, b]) => a < L && b >= L).sort((x, y) => y[0] - x[0])[0];
    if (sp) return `Part of the statement that starts on line ${sp[0]}.`;
    return '';
  }
  function diffs(e, next) {
    const out = [];
    const cmp = (pre, a, b) => {
      if (!a && !b) return;
      const ks = new Set([...Object.keys(a || {}), ...Object.keys(b || {})]);
      for (const k of ks) { const x = a ? a[k] : undefined, y = b ? b[k] : undefined; if (x !== y && y !== undefined) out.push({ name: pre + k, before: x, after: y }); }
    };
    cmp('', e.glob, e.globAfter || (next && next.glob));
    cmp('this.', e.self, e.selfAfter);
    cmp('', e.loc, e.locAfter);
    return out.slice(0, 8);
  }
  function liveText(k) {
    const tr = STEP.trace, e = tr.entries[k], next = tr.entries[k + 1];
    const calls = tr.log.slice(e.logN, next ? next.logN : tr.log.length);
    if (e.kind === 'end') return `Frame ${e.frame + 1} is finished. The canvas shows everything this frame drew. STEP again to trace the next frame.`;
    if (e.kind === 'enter') {
      const [kind, name] = e.name.split(/:(.*)/s);
      const got = e.loc ? Object.entries(e.loc).filter(([k2]) => INFO && INFO.info).slice(0, 4).map(([k2, v]) => `${k2} = ${v}`).join(', ') : '';
      if (kind === 'f') return (name === 'draw' ? `draw() starts frame ${e.frame + 1}. p5 runs draw() again about 60 times a second.` : FNDOC[name] || `${name}() starts.`) + (got && name !== 'draw' && name !== 'setup' ? ` It received ${got}.` : '');
      if (kind === 'm') return `${name}() starts for ${e.selfLabel}. Inside it, this means ${e.selfLabel}.` + (got ? ` It received ${got}.` : '');
      if (kind === 'c') return `new ${name}(…) is building ${e.selfLabel}. The constructor stores its starting values.` + (got ? ` It received ${got}.` : '');
      return 'A function starts.';
    }
    if (e.kind === 'loop') {
      let start = k; while (start > 0 && !(tr.entries[start - 1].kind === 'stmt' && tr.entries[start - 1].line === e.line)) start--;
      let round = 0; for (let j = start; j <= k; j++) if (tr.entries[j].kind === 'loop' && tr.entries[j].line === e.line) round++;
      const st = INFO && INFO.info.stmt[e.line];
      let s = `Round ${round} of the loop.`;
      if (st && st.type === 'ForStatement' && st.test) s += ` ${srcOf(st.test)} is true, so the body runs.`;
      if (st && st.type === 'ForOfStatement') { const v = srcOf(st.left).replace(/^(let|const|var)\s+/, ''); if (e.loc && e.loc[v] !== undefined) s += ` ${v} is ${e.loc[v]}.`; }
      if (st && st.type === 'WhileStatement') s += ` ${srcOf(st.test)} is true, so the body runs.`;
      if (st && st.type === 'ForStatement' && e.loc) { const vars = st.init && st.init.type === 'VariableDeclaration' ? st.init.declarations.map((d) => srcOf(d.id)) : []; const vs = vars.filter((v) => e.loc[v] !== undefined).map((v) => `${v} is ${e.loc[v]}`); if (vs.length) s += ` ${vs.join(', ')}.`; }
      return s;
    }
    const st = INFO && INFO.info.stmt[e.line];
    if (!st) return 'Runs this line.';
    let ifRes;
    if (st.type === 'IfStatement' && next) {
      const inC = next.line >= st.consequent.loc.start.line && next.line <= st.consequent.loc.end.line && next.kind !== 'end';
      const inA = st.alternate && next.line >= st.alternate.loc.start.line && next.line <= st.alternate.loc.end.line;
      ifRes = inC && next.line !== st.loc.start.line ? true : inA ? 'else' : false;
      if (st.consequent.type !== 'BlockStatement' && next.line === st.loc.start.line) ifRes = true;
    }
    let s = describe(st, { calls, next, ifRes });
    const extra = calls.filter((c) => c.r !== undefined && c.r !== 'undefined' && !(st.type === 'ExpressionStatement' && st.expression.type === 'CallExpression' && st.expression.callee.name === c.fn)).slice(0, 3).map((c) => `${c.fn}(${c.a.join(', ')}) gave ${c.r}`);
    if (extra.length) s += ' ' + extra.join('; ') + '.';
    return s;
  }

  /* =====================================================================
     3. STATE, DOM
     ===================================================================== */
  const SOLVED = new Set(store.get('solved', []));
  let IDX = 0, INFO = null, RUN = null, STEP = null, TRAIN = null, MATCH = null, runSeq = 0, picked = null, caretLine = 1, dirty = false;
  const lesson = () => LESSONS[IDX];
  const kindOf = (L) => L.kind || 'sketch';

  let cm;
  function setupEditor() {
    cm = CodeMirror($('#cm'), {
      value: '', mode: 'javascript', lineNumbers: true, matchBrackets: true, autoCloseBrackets: true, styleActiveLine: true,
      indentUnit: 2, tabSize: 2, smartIndent: true, lineWrapping: false, gutters: ['cm-marks', 'CodeMirror-linenumbers'],
      extraKeys: { 'Ctrl-Enter': () => play(), 'Cmd-Enter': () => play(), 'Shift-Ctrl-Enter': () => stop(), 'Shift-Cmd-Enter': () => stop(), Tab: (c) => c.execCommand(c.somethingSelected() ? 'indentMore' : 'insertSoftTab'), Esc: () => { if (STEP) exitStep(true); } },
    });
    cm.on('cursorActivity', () => { caretLine = cm.getCursor().line + 1; if (!STEP) renderExplain(); });
    let t1, t2;
    cm.on('change', (c, ch) => {
      if (ch.origin === 'setValue') return;
      dirty = true; $('#play').classList.add('dirty');
      clearTimeout(t1); t1 = setTimeout(() => { saveCode(); analyze(); if (!STEP) renderExplain(); }, 250);
      if (STEP) exitStep(false);
      if (store.get('auto', false) && kindOf(lesson()) === 'sketch') { clearTimeout(t2); t2 = setTimeout(() => { if (!instrument(cm.getValue()).error) play(); }, 700); }
    });
  }
  function analyze() { const r = instrument(cm.getValue()); if (!r.error) INFO = r; return r; }
  function saveCode() { const L = lesson(); if (kindOf(L) === 'sketch') store.set('code.' + L.id, cm.getValue()); else if (kindOf(L) === 'train') store.set('entry', cm.getValue()); }

  let marks = [];
  function clearMarks() { for (const [ln, cls] of marks) cm.removeLineClass(ln, 'background', cls); marks = []; cm.clearGutter('cm-marks'); }
  function markLine(L, cls, gutterCls) { if (!L || L < 1 || L > cm.lineCount()) return; cm.addLineClass(L - 1, 'background', cls); marks.push([L - 1, cls]); if (gutterCls) cm.setGutterMarker(L - 1, 'cm-marks', h('span', { class: 'gm ' + gutterCls })); }
  let band = null;
  function setBand(L) { if (band !== null) { cm.removeLineClass(band, 'background', 'cm-band'); cm.setGutterMarker(band, 'cm-marks', null); band = null; } if (L && L <= cm.lineCount()) { band = L - 1; cm.addLineClass(band, 'background', 'cm-band'); cm.setGutterMarker(band, 'cm-marks', h('span', { class: 'gm arrow' })); cm.scrollIntoView({ line: band, ch: 0 }, 80); } }
  function gotoLine(L, flash) {
    if (!L) return;
    const t = cm.getLine(L - 1) || '';
    cm.setCursor({ line: L - 1, ch: t.length - t.trimStart().length });
    cm.scrollIntoView({ line: L - 1, ch: 0 }, 80);
    if (flash) { cm.addLineClass(L - 1, 'background', 'cm-flash'); setTimeout(() => cm.removeLineClass(L - 1, 'background', 'cm-flash'), 700); }
    caretLine = L; if (!STEP) renderExplain();
  }

  /* ---------- console ---------- */
  let conLast = null;
  function clearConsole() { $('#conBody').innerHTML = ''; conLast = null; }
  function logLine(level, text, line) {
    const body = $('#conBody');
    if (conLast && conLast.level === level && conLast.text === text) { conLast.n++; conLast.badge.textContent = conLast.n; conLast.badge.hidden = false; return; }
    const badge = h('span', { class: 'cnt', hidden: true }, '1');
    const row = h('div', { class: 'cl ' + level }, badge, h('span', { class: 'ct' }, text), line ? h('button', { class: 'lnk', onclick: () => gotoLine(line, true) }, 'line ' + line) : null);
    body.append(row); conLast = { level, text, n: 1, badge };
    while (body.children.length > 200) body.firstChild.remove();
    body.scrollTop = body.scrollHeight;
  }
  const KNOWN = ['setup', 'draw', 'createCanvas', 'background', 'fill', 'noFill', 'stroke', 'noStroke', 'strokeWeight', 'circle', 'ellipse', 'rect', 'square', 'line', 'point', 'triangle', 'text', 'textSize', 'textAlign', 'random', 'dist', 'width', 'height', 'mouseX', 'mouseY', 'mouseIsPressed', 'frameCount', 'push', 'pop', 'translate', 'rotate', 'sqrt', 'floor', 'map', 'constrain', 'lerp', 'recruit', 'world', 'letterPoints', 'console', 'this', 'length', 'Soldier', 'update', 'display', 'connect'];
  function lev(a, b) { const m = a.length, n = b.length, d = Array.from({ length: m + 1 }, (_, i) => [i]); for (let j = 1; j <= n; j++) d[0][j] = j; for (let i = 1; i <= m; i++) for (let j = 1; j <= n; j++) d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)); return d[m][n]; }
  function suggest(name) { const pool = [...new Set([...KNOWN, ...(INFO ? INFO.tops : []), ...(INFO ? [...INFO.info.fns] : [])])]; let best = null, bd = 3; for (const c of pool) { if (c === name) continue; const d = c.toLowerCase() === name.toLowerCase() ? 0 : lev(c, name); if (d < bd) { bd = d; best = c; } } return best; }
  function friendly(e) {
    const m = e.msg || ''; let tip = '', r;
    if (e.syntax) { tip = /Unterminated string/.test(m) ? 'A string starts with a quote and never closes it.' : /Unexpected token/.test(m) ? 'JavaScript cannot read this spot. Look for a missing or extra ( ) { } , or ; on this line or the line above.' : 'JavaScript cannot read the code here. Check the brackets and quotes on this line and the line above.'; }
    else if ((r = m.match(/^(\S+) is not defined/))) { const s = suggest(r[1]); tip = `${r[1]} has no value here. Check its spelling and capital letters${s ? ` (did you mean ${s}?)` : ''}, or make it with let first.`; }
    else if ((r = m.match(/Cannot read propert(?:y|ies) of (undefined|null)(?: \(reading '([^']+)'\))?/))) tip = `The code asked for .${r[2] || 'something'} on a value that is ${r[1]}. Two common causes: an index past the end of an array, or a variable that was never given a value.`;
    else if ((r = m.match(/Cannot set propert(?:y|ies) of (undefined|null)/))) tip = `The code tried to store something on a value that is ${r[1]}.`;
    else if ((r = m.match(/^(\S+) is not a function/))) tip = `${r[1]} is not a function. Check the spelling of the method, and that the object really has that method.`;
    else if ((r = m.match(/Cannot access '(\w+)' before initialization/))) tip = `${r[1]} is used above the line that makes it. Move the let line higher.`;
    else if (/Maximum call stack/.test(m)) tip = 'A function keeps calling itself and never stops.';
    else if (/times in one frame/.test(m)) tip = 'Change the loop so its condition becomes false: count toward the limit, or change what it checks.';
    else if (/Assignment to constant/.test(m)) tip = 'This variable was made with const, so it cannot change. Make it with let.';
    else if (/is not a constructor/.test(m)) tip = 'new needs a class name after it. Check the spelling of the class.';
    return { title: m, tip };
  }
  function showError(e) {
    const f = friendly(e);
    const row = h('div', { class: 'cl error big' }, h('b', null, e.syntax ? 'SYNTAX ERROR' : 'ERROR'), h('span', { class: 'ct' }, f.title), f.tip ? h('span', { class: 'tip' }, f.tip) : null, e.line ? h('button', { class: 'lnk', onclick: () => gotoLine(e.line, true) }, 'line ' + e.line) : null);
    $('#conBody').append(row); $('#conBody').scrollTop = 1e9; conLast = null;
    if (e.line) { markLine(e.line, 'cm-err', 'err'); gotoLine(e.line, false); }
    setState('error');
    renderExplain();
  }

  /* =====================================================================
     4. SKETCH RUNNER
     ===================================================================== */
  function frameWin() { return RUN && RUN.frame && RUN.frame.contentWindow; }
  function B() { const w = frameWin(); return w && w.__bench; }
  function setState(s) {
    if (RUN) RUN.state = s;
    const lab = { running: 'RUNNING', stopped: 'STOPPED', error: 'ERROR', step: 'STEPPING', idle: 'READY' }[s] || s;
    const tag = $('#runTag'); tag.textContent = lab; tag.className = 'runtag ' + s;
  }
  function stopAll() {
    if (RUN) { if (RUN.host) RUN.host.dead = true; if (RUN.frame) RUN.frame.remove(); RUN = null; }
    STEP = null; setBand(null);
    if (TRAIN) { TRAIN.running = false; TRAIN = null; }
    if (MATCH) { MATCH.running = false; }
  }
  function play() {
    const k = kindOf(lesson());
    if (k === 'train') return playTrain();
    if (k !== 'sketch') return;
    startSketch(false);
  }
  function stop() {
    const k = kindOf(lesson());
    if (k === 'train') { if (TRAIN) { TRAIN.running = false; setState('stopped'); } return; }
    if (STEP) exitStep(false);
    const b = B(); if (b) b.pause(); setState('stopped');
  }
  function startSketch(trace) {
    const L = lesson();
    stopAll(); clearConsole(); clearMarks(); picked = null;
    dirty = false; $('#play').classList.remove('dirty');
    saveCode();
    const src = cm.getValue();
    const ins = instrument(src);
    if (ins.error) { showError(ins.error); return; }
    INFO = ins; renderExplain();
    const host = { dead: false };
    host.onCanvas = (w, hh) => { if (host.dead || !RUN) return; RUN.w = w; RUN.h = hh; layoutStage(); };
    host.onError = (e) => { if (host.dead) return; RUN.failed = true; if (STEP) exitStep(false); showError(e); };
    host.onLog = (lvl, txt, line) => { if (!host.dead) logLine(lvl, txt, line); };
    host.onPick = (x, y) => { if (!host.dead) pickAt(x, y); };
    host.onTrace = (tr) => { if (!host.dead && RUN && RUN.wantTrace) { RUN.wantTrace = false; enterStep(tr); } };
    window.__benchHost = host;
    const cfg = { scene: L.scene || null, traceFromStart: !!trace, w: 800, h: 500, offset: 0, lines: src.split('\n').length };
    const pre = '<!doctype html><html><head><meta charset="utf-8"><style>html,body{margin:0;padding:0;overflow:hidden;background:#fff}canvas{display:block}</style></head><body><script src="lib/p5.min.js"><\/script><script>window.__CFG=@CFG@;<\/script><script src="lib/bench-runtime.js"><\/script><script>\n';
    cfg.offset = (pre.match(/\n/g) || []).length;
    const doc = pre.replace('@CFG@', JSON.stringify(cfg).replace(/</g, '\\u003c')) + ins.code.replace(/<\/script/gi, '<\\/script') + '\n' + ins.accessor + '\n<\/script></body></html>';
    const f = h('iframe', { class: 'sk', title: 'Sketch' });
    const view = $('#view').getBoundingClientRect();
    RUN = { id: ++runSeq, frame: f, host, ins, w: Math.max(100, Math.floor(view.width - 24)), h: Math.max(100, Math.floor(view.height - 24)), mem: {}, ok: 0, failed: false, wantTrace: !!trace, state: 'running', items: null };
    $('#box').prepend(f);
    layoutStage();
    f.srcdoc = doc;
    setState(trace ? 'step' : 'running');
    renderChecks(null);
  }
  function layoutStage() {
    const k = kindOf(lesson()), view = $('#view').getBoundingClientRect();
    if (k === 'sketch') {
      if (!RUN) return;
      const w = RUN.w, hh = RUN.h, s = Math.min((view.width - 24) / w, (view.height - 24) / hh, 2);
      RUN.scale = s;
      const box = $('#box'); box.style.width = w * s + 'px'; box.style.height = hh * s + 'px';
      const f = RUN.frame; f.style.width = w + 'px'; f.style.height = hh + 'px'; f.style.transform = `scale(${s})`;
      const ov = $('#ov'), dpr = window.devicePixelRatio || 1;
      ov.width = Math.round(w * s * dpr); ov.height = Math.round(hh * s * dpr); ov.style.width = w * s + 'px'; ov.style.height = hh * s + 'px';
      $('#stageInfo').textContent = `${w} × ${hh}`;
    } else if (k === 'train' || k === 'match') {
      const c = $('#field'), s = Math.min((view.width - 24) / 1280, (view.height - 24) / 720);
      c.style.width = 1280 * s + 'px'; c.style.height = 720 * s + 'px';
    }
  }
  window.addEventListener('resize', () => layoutStage());

  /* ---------- picking: click the sketch, find the line ---------- */
  const inBox = (b, x, y) => b && !b.all && x >= b.x - 3 && x <= b.x + b.w + 3 && y >= b.y - 3 && y <= b.y + b.h + 3;
  function pickAt(x, y) {
    if (STEP) {
      const tr = STEP.trace, next = tr.entries[STEP.k + 1], upto = next ? next.logN : tr.log.length;
      for (let i = upto - 1; i >= 0; i--) {
        const e = tr.log[i];
        if (inBox(e.bb, x, y)) { let j = 0; for (let q = 0; q < tr.entries.length; q++) if (tr.entries[q].logN <= i) j = q; stepTo(j); return; }
      }
      return;
    }
    const b = B(); if (!b) return;
    const log = b.state().log || [];
    for (let i = log.length - 1; i >= 0; i--) {
      const e = log[i];
      if (inBox(e.bb, x, y)) { picked = { self: e.self || 0, line: e.line }; if (e.line) gotoLine(e.line, true); renderVars(); return; }
    }
    picked = null; renderVars();
  }

  /* =====================================================================
     5. STEP DEBUGGER
     ===================================================================== */
  function stepClick() {
    const k = kindOf(lesson());
    if (k === 'train') return skipTrain();
    if (k !== 'sketch') return;
    if (STEP) return stepTo(STEP.k + 1);
    const b = B();
    if (!RUN || !b || RUN.failed || dirty) { startSketch(true); return; }
    b.pause();
    const tr = b.traceFrame();
    if (tr) enterStep(tr);
  }
  function enterStep(tr) {
    STEP = { trace: tr, k: 0 };
    setState('step');
    renderExplain();
    stepTo(0);
  }
  function stepTo(k) {
    if (!STEP) return;
    if (k >= STEP.trace.entries.length) {
      const b = B(); if (!b || b.failed) return;
      const tr = b.traceFrame(); if (!tr) return;
      STEP.trace = tr; k = 0; renderExplain();
    }
    STEP.k = Math.max(0, k);
    const e = STEP.trace.entries[STEP.k];
    setBand(e.line || null);
    renderStepText();
    renderVars();
  }
  function exitStep(resume) {
    STEP = null; setBand(null);
    if (resume) { const b = B(); if (b && !b.failed) { b.resume(); setState('running'); } }
    renderExplain(); renderVars();
  }

  /* =====================================================================
     6. OVERLAY: what the line does, drawn on the sketch
     ===================================================================== */
  function ovCtx() {
    const ov = $('#ov'), c = ov.getContext('2d'), dpr = window.devicePixelRatio || 1, s = (RUN && RUN.scale) || 1;
    c.setTransform(1, 0, 0, 1, 0, 0); c.clearRect(0, 0, ov.width, ov.height); c.setTransform(s * dpr, 0, 0, s * dpr, 0, 0);
    return { c, s };
  }
  function boxAt(c, b, stroke, fill, dash, s) {
    if (!b || b.all) return;
    c.save(); if (dash) c.setLineDash([5 / s, 4 / s]);
    if (fill) { c.fillStyle = fill; c.fillRect(b.x - 2, b.y - 2, b.w + 4, b.h + 4); }
    c.lineWidth = 2 / s; c.strokeStyle = stroke; c.strokeRect(b.x - 2, b.y - 2, b.w + 4, b.h + 4); c.restore();
  }
  function chip(c, x, y, txt, s, bg, fg) {
    if (txt.length > 52) txt = txt.slice(0, 51) + '\u2026';
    c.save(); c.font = `600 ${12 / s}px "IBM Plex Mono", monospace`;
    const w = c.measureText(txt).width + 10 / s, hh = 18 / s;
    x = Math.max(2, Math.min(x, (RUN ? RUN.w : 800) - w - 2)); y = Math.max(2, y);
    c.fillStyle = bg || '#141414'; c.fillRect(x, y, w, hh); c.fillStyle = fg || '#ffdc00'; c.textBaseline = 'middle'; c.fillText(txt, x + 5 / s, y + hh / 2); c.restore();
    return hh;
  }
  function arrow(c, x0, y0, x1, y1, s) {
    const dx = x1 - x0, dy = y1 - y0, d = Math.hypot(dx, dy); if (d < 0.05) return;
    const k = d < 24 ? 24 / d : 1, ex = x0 + dx * k, ey = y0 + dy * k, a = Math.atan2(dy, dx);
    c.save(); c.strokeStyle = '#c23b22'; c.fillStyle = '#c23b22'; c.lineWidth = 2.5 / s;
    c.beginPath(); c.moveTo(x0, y0); c.lineTo(ex, ey); c.stroke();
    c.beginPath(); c.moveTo(ex, ey); c.lineTo(ex - Math.cos(a - 0.45) * 9 / s, ey - Math.sin(a - 0.45) * 9 / s); c.lineTo(ex - Math.cos(a + 0.45) * 9 / s, ey - Math.sin(a + 0.45) * 9 / s); c.closePath(); c.fill(); c.restore();
  }
  function drawOverlay() {
    if (!RUN || !RUN.scale) return;
    const { c, s } = ovCtx(), b = B();
    if (!b) return;
    if (STEP) return drawStepOverlay(c, s);
    if (RUN.failed) return;
    const log = b.state().log || [], L = caretLine;
    let n = 0, first = null, bg = false;
    for (const e of log) {
      if (e.line !== L || !e.bb) continue;
      if (e.bb.all) { bg = true; continue; }
      boxAt(c, e.bb, '#d19a00', 'rgba(255,220,0,.30)', false, s); if (!first) first = e.bb; if (++n > 300) break;
    }
    const rg = n === 0 && INFO && INFO.info.range[L];
    if (rg) { let k = 0; for (const e of log) { if (!e.bb || e.bb.all || e.line < rg[0] || e.line > rg[1]) continue; boxAt(c, e.bb, '#d19a00', 'rgba(255,220,0,.18)', true, s); if (!first) first = e.bb; if (++k > 300) break; } if (first) { chip(c, first.x, first.y - 22 / s, `lines ${rg[0]}\u2013${rg[1]}`, s); first = null; } }
    if (bg) { c.save(); c.lineWidth = 6 / s; c.strokeStyle = 'rgba(255,200,0,.9)'; c.strokeRect(0, 0, RUN.w, RUN.h); c.restore(); }
    if (first) chip(c, first.x, first.y - 22 / s, `line ${L}`, s);
    if (picked && picked.self) {
      let pb = null;
      for (const e of log) if (e.self === picked.self && e.bb && !e.bb.all) { boxAt(c, e.bb, '#2f62d9', null, true, s); pb = pb || e.bb; }
      const o = b.byId(picked.self); if (o && pb) chip(c, pb.x, pb.y + pb.h + 4 / s, b.label(o), s, '#2f62d9', '#fff');
    }
    const refs = INFO && INFO.info.refs[L];
    if (refs) {
      let y = 6 / s;
      if (refs.names.length) { const v = b.sumVars(); for (const nm of refs.names.slice(0, 5)) y += chip(c, 6 / s, y, `${nm} = ${v[nm]}`, s) + 4 / s; }
      if (refs.props.length) {
        const seen = new Set(); let k = 0;
        for (const e of log) {
          if (!e.self || seen.has(e.self) || !e.bb || e.bb.all) continue; seen.add(e.self);
          const o = b.byId(e.self); if (!o) continue;
          const txt = refs.props.slice(0, 2).map((p) => `${p} ${fmt(o[p])}`).join('  ');
          chip(c, e.bb.x, e.bb.y - 20 / s, txt, s, '#fff3a6', '#141414'); if (++k >= 24) break;
        }
      }
    }
  }
  const fmt = (v) => (typeof v === 'number' ? (Number.isInteger(v) ? String(v) : v.toFixed(1)) : typeof v === 'string' ? JSON.stringify(v) : Array.isArray(v) ? `Array(${v.length})` : String(v));
  function drawStepOverlay(c, s) {
    const tr = STEP.trace, e = tr.entries[STEP.k], next = tr.entries[STEP.k + 1] || e;
    const snap = tr.snaps[next.snap];
    c.save(); c.fillStyle = '#fff'; c.fillRect(0, 0, RUN.w, RUN.h);
    if (snap) c.drawImage(snap, 0, 0, RUN.w, RUN.h);
    c.restore();
    c.save(); c.fillStyle = 'rgba(255,255,255,.18)'; c.fillRect(0, 0, RUN.w, RUN.h); c.restore();
    const calls = tr.log.slice(e.logN, next === e ? tr.log.length : next.logN);
    let first = null;
    for (const q of calls) { if (!q.bb) continue; if (q.bb.all) { c.save(); c.lineWidth = 6 / s; c.strokeStyle = '#c23b22'; c.strokeRect(0, 0, RUN.w, RUN.h); c.restore(); continue; } boxAt(c, q.bb, '#c23b22', 'rgba(194,59,34,.12)', false, s); first = first || q.bb; }
    if (first) chip(c, first.x, first.y - 22 / s, calls.find((q) => q.bb && !q.bb.all).fn + '()', s, '#c23b22', '#fff');
    if (e.xy) {
      const a = e.xyAfter || e.xy;
      c.save(); c.setLineDash([4 / s, 4 / s]); c.strokeStyle = '#2f62d9'; c.lineWidth = 2 / s; c.beginPath(); c.arc(a[0], a[1], 24, 0, Math.PI * 2); c.stroke(); c.restore();
      chip(c, a[0] + 26, a[1] - 30, e.selfLabel, s, '#2f62d9', '#fff');
      if (e.xyAfter && (e.xyAfter[0] !== e.xy[0] || e.xyAfter[1] !== e.xy[1])) arrow(c, e.xy[0], e.xy[1], e.xyAfter[0], e.xyAfter[1], s);
    }
    let y = 6 / s;
    for (const d of diffs(e, next)) y += chip(c, 6 / s, y, `${d.name}  ${d.before === undefined ? '' : d.before + ' → '}${d.after}`, s) + 4 / s;
  }

  /* =====================================================================
     7. PANELS: explain, variables, checks
     ===================================================================== */
  function noteFor(L) { const t = cm.getLine(L - 1) || ''; const n = (lesson().notes || []).find((x) => t.includes(x.find)); return n ? n.say : ''; }
  function renderExplain() {
    const box = $('#explain'); box.innerHTML = '';
    const k = kindOf(lesson());
    if (STEP) {
      const n = STEP.trace.entries.length;
      const slider = h('input', { type: 'range', min: 0, max: n - 1, value: STEP.k, class: 'scrub', 'aria-label': 'Step through this frame', oninput: (ev) => stepTo(+ev.target.value) });
      box.append(h('div', { class: 'stephead' },
        h('span', { class: 'tag' }, 'STEPPING'), h('span', { id: 'stepPos', class: 'mono' }, ''),
        h('button', { class: 'btn sm', onclick: () => stepTo(STEP.k - 1), title: 'Previous step (↑)' }, h('span', { class: 'i-back' }), 'BACK'),
        slider,
        h('button', { class: 'btn sm', onclick: () => startSketch(true), title: 'Restart and step from the first line, through setup()' }, 'FROM START'),
        h('button', { class: 'btn sm prim', onclick: () => exitStep(true), title: 'Run on (Esc)' }, h('span', { class: 'i-play' }), 'CONTINUE')),
      h('div', { id: 'stepBody', class: 'xbody' }));
      renderStepText();
      return;
    }
    if (k !== 'sketch' && k !== 'train') return;
    const L = caretLine, code = (cm.getLine(L - 1) || '').trim(), note = noteFor(L), gen = k === 'sketch' ? staticText(L) : staticText(L);
    box.append(h('div', { class: 'xhead' }, h('span', { class: 'tag' }, 'LINE ' + L), h('code', null, code.length > 70 ? code.slice(0, 70) + '…' : code)),
      h('div', { class: 'xbody' }, note ? h('p', { class: 'note' }, note) : null, gen && !note ? h('p', { class: 'gen' }, gen) : null,
        !note && !gen ? h('p', { class: 'gen dim' }, 'Click any line to read what it does. Click a shape in the sketch to find the line that drew it.') : null));
  }
  function renderStepText() {
    const body = $('#stepBody'); if (!body || !STEP) return;
    const tr = STEP.trace, e = tr.entries[STEP.k], next = tr.entries[STEP.k + 1];
    const pos = $('#stepPos'); if (pos) pos.textContent = `${STEP.k + 1} / ${tr.entries.length} · frame ${e.frame + 1}${tr.overflow ? ' · trace cut at 3000 steps' : ''}`;
    const sl = $('#explain .scrub'); if (sl) { sl.max = tr.entries.length - 1; sl.value = STEP.k; }
    const code = e.line ? (cm.getLine(e.line - 1) || '').trim() : '';
    const note = e.line ? noteFor(e.line) : '';
    const ds = diffs(e, next);
    body.innerHTML = '';
    const parts = [
      e.line ? h('div', { class: 'xhead' }, h('span', { class: 'tag' }, 'LINE ' + e.line), h('code', null, code.length > 70 ? code.slice(0, 70) + '…' : code)) : null,
      h('p', { class: 'gen' }, liveText(STEP.k)),
      note ? h('p', { class: 'note' }, note) : null,
      ds.length ? h('div', { class: 'diffs' }, ds.map((d) => h('span', { class: 'diff' }, h('b', null, d.name), ' ', d.before === undefined ? '' : d.before + ' → ', h('i', null, d.after)))) : null];
    body.append(...parts.filter(Boolean));
  }
  function renderVars() {
    const v = $('#vars'); const k = kindOf(lesson());
    if (k !== 'sketch') return;
    const rows = [];
    const sec = (title) => rows.push(h('div', { class: 'vsec' }, title));
    const row = (name, val, changed, onclick) => rows.push(h('div', { class: 'vrow' + (changed ? ' ch' : '') + (onclick ? ' click' : ''), onclick }, h('span', { class: 'vn' }, name), h('span', { class: 'vv' }, val)));
    const b = B();
    if (STEP) {
      const e = STEP.trace.entries[STEP.k], next = STEP.trace.entries[STEP.k + 1];
      const g = e.globAfter || (next && next.glob) || e.glob || {};
      sec('VARIABLES'); for (const [n, val] of Object.entries(g)) row(n, val, e.glob && e.glob[n] !== val);
      if (e.selfLabel) { sec('this = ' + e.selfLabel); const sa = e.selfAfter || e.self || {}; for (const [n, val] of Object.entries(sa)) row('this.' + n, val, e.self && e.self[n] !== val); }
      const la = e.locAfter || e.loc; if (la && Object.keys(la).length) { sec('INSIDE THIS FUNCTION'); for (const [n, val] of Object.entries(la)) row(n, val, e.loc && e.loc[n] !== val); }
    } else if (b) {
      const g = b.sumVars();
      sec('VARIABLES'); const keys = Object.keys(g);
      if (!keys.length) rows.push(h('div', { class: 'vrow dim' }, 'No variables at the top of the sketch.'));
      for (const n of keys) {
        const raw = b.vars()[n];
        const click = raw && typeof raw === 'object' && b.reg.indexOf(raw) >= 0 ? () => { picked = { self: b.idOf(raw) }; renderVars(); } : Array.isArray(raw) && raw[0] && typeof raw[0] === 'object' && b.reg.indexOf(raw[0]) >= 0 ? () => { picked = { self: b.idOf(raw[0]) }; renderVars(); } : null;
        row(n, g[n], false, click);
      }
      const o = picked && picked.self ? b.byId(picked.self) : null;
      if (o) { sec(b.label(o) + ' · picked'); const so = b.sumObj(o); for (const [n, val] of Object.entries(so)) row('.' + n, val); }
      else rows.push(h('div', { class: 'vrow dim' }, 'Click a shape in the sketch to see its object.'));
    }
    v.replaceChildren(...rows);
  }
  function renderChecks(items, solved) {
    const L = lesson(), list = $('#checks'); if (!list) return;
    if (!items) { list.replaceChildren(h('li', { class: 'pending' }, 'Press PLAY: the checks run while the sketch runs.')); $('#verdict').textContent = ''; return; }
    const html = items.map(([ok, t]) => `<li class="${ok ? 'ok' : ''}"><span class="box"></span><span>${esc(t)}</span></li>`).join('');
    if (list.__html !== html) { list.innerHTML = html; list.__html = html; }
    const done = items.filter((x) => x[0]).length, vd = $('#verdict');
    vd.className = 'verdict' + (solved ? ' solved' : '');
    vd.textContent = solved ? 'SOLVED' : `${done} of ${items.length}`;
    if (solved) markSolved(L.id);
  }
  function markSolved(id) {
    if (SOLVED.has(id)) return;
    SOLVED.add(id); store.set('solved', [...SOLVED]); renderMap();
    $('#next').classList.add('pulse');
  }
  function buildS(b) {
    const st = b.state(), log = st.log || [];
    const draws = [], circles = [], texts = [], recruits = [];
    log.forEach((e, i) => {
      if (!e.bb || e.bb.all) return;
      draws.push({ i, fn: e.fn, bb: e.bb, line: e.line, self: e.self });
      if (e.fn === 'circle' || e.fn === 'ellipse') circles.push({ i, x: e.bb.x + e.bb.w / 2, y: e.bb.y + e.bb.h / 2, d: e.bb.w, line: e.line });
      if (e.fn === 'text') texts.push({ i, s: unq(e.a[0]), x: +e.a[1], y: +e.a[2], bb: e.bb });
      if (e.fn === 'recruit') recruits.push({ i, x: e.x, y: e.y, self: e.self });
    });
    return {
      log, draws, circles, texts, recruits, reg: b.reg.slice(), vars: b.vars(), world: b.world, t: st.t, frame: st.frame, clicks: st.clicks,
      fillBefore(i) { for (let k = i - 1; k >= 0; k--) { const e = log[k]; if (e.fn === 'fill') return e.a.join(','); if (e.fn === 'noFill') return 'none'; } return 'default'; },
      letterPoints: (w, n) => frameWin().letterPoints(w, n),
    };
  }
  function runChecks() {
    const L = lesson(), b = B();
    if (!L.check || !b || !RUN || RUN.failed || STEP || RUN.state !== 'running') return;
    const st = b.state(); if (!st.frame) return;
    let items;
    try { items = L.check(buildS(b), RUN.mem); } catch (err) { items = [[false, 'Check could not read the sketch: ' + err.message]]; }
    const all = items.every((x) => x[0]);
    RUN.ok = all ? RUN.ok + 1 : 0;
    if (RUN.ok >= (L.hold || 8)) RUN.solved = true;
    renderChecks(items, RUN.solved);
  }

  /* ---------- the loop ---------- */
  let lastSlow = 0;
  function tick(t) {
    requestAnimationFrame(tick);
    const k = kindOf(lesson());
    if (k === 'sketch' && RUN) {
      drawOverlay();
      if (t - lastSlow > 110) {
        lastSlow = t;
        const b = B();
        if (b && !STEP) { renderVars(); runChecks(); const st = b.state(); $('#stageInfo').textContent = `${RUN.w} × ${RUN.h} · frame ${st.frame} · ${st.t.toFixed(1)} s`; }
      }
    }
    if (k === 'train' && TRAIN && TRAIN.running) trainFrame();
    if (k === 'match' && MATCH && MATCH.running) matchFrame();
  }

  /* =====================================================================
     8. PRACTICE FIELD (train) and THE MATCH
     ===================================================================== */
  const b64e = (s) => btoa(unescape(encodeURIComponent(s))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  const b64d = (s) => decodeURIComponent(escape(atob(s.replace(/-/g, '+').replace(/_/g, '/'))));
  function shareLink(code) { return location.href.split('#')[0] + '#add=' + b64e(JSON.stringify({ c: code })); }
  async function copyText(t, what) {
    try { await navigator.clipboard.writeText(t); toast(what + ' copied'); }
    catch (e) { const ta = h('textarea', null); ta.value = t; document.body.append(ta); ta.select(); try { document.execCommand('copy'); toast(what + ' copied'); } catch (e2) { toast('Copy failed: select the text by hand'); } ta.remove(); }
  }
  function toast(msg) { const t = $('#toast'); t.textContent = msg; t.classList.add('on'); clearTimeout(t.__t); t.__t = setTimeout(() => t.classList.remove('on'), 2200); }

  function playTrain() {
    stopAll(); clearConsole(); clearMarks(); saveCode();
    dirty = false; $('#play').classList.remove('dirty');
    const code = cm.getValue();
    const ins = instrument(code);
    if (ins.error) { showError(ins.error); return; }
    INFO = ins;
    if (!/class\s+Soldier\b/.test(code)) { showError({ msg: 'No class named Soldier', line: 1 }); return; }
    const m = new AR.Match({ entries: AR.trainEntries(code), canvas: $('#field'), seed: 11 });
    TRAIN = { m, running: true, shownFault: false };
    setState('running'); renderBoard(null); renderChecks(null);
  }
  function trainFrame() {
    const m = TRAIN.m;
    m.step(false);
    const me = m.teams[0];
    if (me.fault && !TRAIN.shownFault) { TRAIN.shownFault = true; showError({ msg: me.fault.msg + (me.fault.where ? ` (in ${me.fault.where})` : ''), line: me.fault.line }); setState('running'); }
    $('#stageInfo').textContent = `practice field · ${m.t.toFixed(1)} s / ${m.limit} s`;
    if (m.done) finishTrain();
  }
  function skipTrain() {
    if (!TRAIN) playTrain();
    if (!TRAIN) return;
    const m = TRAIN.m; while (m.frame < m.limit * 60 - 1) m.step(true); m.step(false); finishTrain();
  }
  function finishTrain() {
    const m = TRAIN.m; TRAIN.running = false; setState('stopped');
    const items = AR.gradeTrain(m);
    const mine = m.teams[0], line = m.teams.find((t) => t.name === 'Straight Line');
    if (line) items.push([mine.points > line.points + 0.05, `Your recruits arrive sooner than Straight Line (you ${mine.points.toFixed(1)}, Straight Line ${line.points.toFixed(1)} arrival points)`]);
    const all = items.every((x) => x[0]);
    renderChecks(items, all);
    renderBoard(m.results(), false);
  }
  function renderBoard(res, reveal, target) {
    const box = target || $('#vars');
    if (!res) { box.replaceChildren(h('div', { class: 'vsec' }, 'RESULTS'), h('div', { class: 'vrow dim' }, 'The table fills in when the match ends.')); return; }
    const rows = [...res.rows].sort((a, b) => (reveal ? b.score - a.score : b.reached - a.reached));
    const head = reveal ? ['', 'TEAM', 'ARRIVED', 'ARRIVAL PTS', 'LINKS ×3', 'BONUS', 'SCORE'] : ['', 'TEAM', 'ARRIVED'];
    const t = h('table', { class: 'board' }, h('tr', null, head.map((x) => h('th', null, x))),
      rows.map((r, i) => h('tr', { class: (r.you ? 'you' : '') + (r.fault ? ' fault' : '') },
        h('td', null, h('span', { class: 'dot', style: `background:${r.color}` })), h('td', null, r.name + (r.fault ? ' · FAULT' : '')), h('td', null, String(r.reached)),
        reveal ? [h('td', null, String(r.arrive)), h('td', null, String(r.linked * 3)), h('td', null, String(res.bonus)), h('td', null, h('b', null, String(r.score)))] : null)));
    box.replaceChildren(h('div', { class: 'vsec' }, reveal ? 'SCORES' : 'RESULTS' + (target ? '' : ' · the score is revealed in the match')), t);
  }

  /* ---------- the match: entries ---------- */
  let ENTRIES = store.get('entries', []);
  const saveEntries = () => store.set('entries', ENTRIES.filter((e) => e.src !== 'folder'));
  function addEntries(list, src) {
    let n = 0;
    for (const e of list) {
      const code = String(e.code || '').trim(); if (!code) continue;
      if (ENTRIES.some((x) => x.code === code)) continue;
      let team = e.team || AR.parseTeam(code, 'Team ' + (ENTRIES.length + 1));
      if (ENTRIES.some((x) => x.team === team)) team = team + ' ' + (ENTRIES.filter((x) => x.team.startsWith(team)).length + 1);
      ENTRIES.push({ id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6), team, code, src: e.src || src, on: ENTRIES.filter((x) => x.on).length < 25 });
      n++;
    }
    saveEntries(); if (kindOf(lesson()) === 'match') renderEntries();
    return n;
  }
  function parseIntake(text) {
    const out = [];
    for (const m of String(text).matchAll(/#add=([A-Za-z0-9_-]+)/g)) { try { const o = JSON.parse(b64d(m[1])); out.push({ code: o.c, src: 'link' }); } catch (e) { /* bad link */ } }
    const rest = String(text).replace(/\S*#add=[A-Za-z0-9_-]+\S*/g, '').trim();
    if (rest) for (const e of AR.splitEntries(rest)) out.push({ team: e.team, code: e.code, src: 'paste' });
    return out;
  }
  function addHouse() {
    const names = Object.keys(AR.BOTS);
    const list = names.map((n) => { const k = ENTRIES.filter((x) => x.src === 'house' && x.team.startsWith(n)).length; return { team: k ? `${n} ${k + 1}` : n, code: `// TEAM: ${k ? `${n} ${k + 1}` : n}\n` + AR.BOTS[n], src: 'house' }; });
    const n = addEntries(list, 'house'); toast(`${n} house teams added`);
  }
  async function loadFolder() {
    try {
      const r = await fetch('entries/manifest.json', { cache: 'no-store' }); if (!r.ok) return;
      const files = await r.json(); const list = [];
      for (const f of files) { try { const t = await (await fetch('entries/' + f, { cache: 'no-store' })).text(); list.push({ code: t, src: 'folder' }); } catch (e) { /* skip */ } }
      const n = addEntries(list, 'folder'); if (n) toast(`${n} entries loaded from the entries folder`);
    } catch (e) { /* no folder */ }
  }
  function renderEntries() {
    const list = $('#entryList'); if (!list) return;
    const on = ENTRIES.filter((e) => e.on).length;
    $('#entryCount').textContent = `${on} of ${ENTRIES.length} selected · 25 at most`;
    let ci = 0;
    list.replaceChildren(...ENTRIES.map((e) => h('div', { class: 'entry' },
      h('input', { type: 'checkbox', checked: e.on, 'aria-label': 'Play ' + e.team, onchange: (ev) => { if (ev.target.checked && ENTRIES.filter((x) => x.on).length >= 25) { ev.target.checked = false; toast('25 entries at most'); return; } e.on = ev.target.checked; saveEntries(); renderEntries(); } }),
      h('span', { class: 'dot', style: `background:${e.on ? AR.TEAMCOLORS[(ci++) % AR.TEAMCOLORS.length] : '#fff'}` }),
      h('span', { class: 'en' }, e.team), h('span', { class: 'es' }, e.src),
      h('button', { class: 'lnk', onclick: () => showCode(e) }, 'CODE'),
      h('button', { class: 'lnk', onclick: () => { ENTRIES = ENTRIES.filter((x) => x !== e); saveEntries(); renderEntries(); } }, 'REMOVE'))));
    if (!ENTRIES.length) list.append(h('p', { class: 'dim' }, 'No entries yet. Paste code or share links below, drop .js files here, or add the house teams.'));
  }
  function showCode(e) {
    const m = $('#modal'); m.hidden = false;
    $('#modalTitle').textContent = e.team + ' · ' + e.src;
    $('#modalBody').textContent = e.code;
  }
  function runMatch(skip) {
    const sel = ENTRIES.filter((e) => e.on).slice(0, 25);
    if (!sel.length) { toast('Select at least one entry'); return; }
    const round = +$('#round').value, card = $('#card').value;
    const m = new AR.Match({ entries: sel.map((e) => ({ team: e.team, code: e.code, src: e.src })), canvas: $('#field'), seed: round * 7919, card });
    MATCH = { m, running: !skip, reveal: false };
    $('#boardWrap').hidden = true;
    if (skip) { while (m.frame < m.limit * 60 - 1) m.step(true); m.step(false); finishMatch(); }
  }
  function matchFrame() { const m = MATCH.m; m.step(false); if (m.done) finishMatch(); }
  function finishMatch() {
    MATCH.running = false; MATCH.res = MATCH.m.results();
    $('#boardWrap').hidden = false; renderBoard(MATCH.res, MATCH.reveal, $('#board'));
    $('#reveal').disabled = false;
  }
  function revealScore() {
    if (!MATCH || !MATCH.res) return;
    MATCH.reveal = !MATCH.reveal; $('#reveal').textContent = MATCH.reveal ? 'HIDE SCORE' : 'REVEAL SCORE';
    $('#boardWrap').hidden = false; renderBoard(MATCH.res, MATCH.reveal, $('#board'));
  }
  function copyResults() {
    if (!MATCH || !MATCH.res) { toast('Run a match first'); return; }
    const r = MATCH.res, rows = [...r.rows].sort((a, b) => b.score - a.score);
    const t = ['team\tarrived\tarrival_pts\tlinks\tbonus\tscore\tfault'].concat(rows.map((x) => [x.name, x.reached, x.arrive, x.linked, r.bonus, x.score, x.fault ? x.fault.msg : ''].join('\t'))).join('\n');
    copyText(t, 'Results');
  }

  /* =====================================================================
     9. LESSON SCREENS
     ===================================================================== */
  const RECRUIT_HELPER = `

// recruit(x, y): the recruit from the films (from the Lab 7 bench)
function recruit(x, y) {
  push();
  stroke(30);
  strokeWeight(1.5);
  line(x, y + 7, x - 6, y + 25);
  line(x, y + 7, x + 6, y + 25);
  line(x, y + 7, x, y - 23);
  fill(255, 220, 0);
  circle(x, y + 7, 12);
  circle(x, y - 7, 16);
  circle(x, y - 23, 14);
  noStroke();
  fill(30);
  rect(x - 14, y - 10, 4, 7);
  fill(255, 220, 0);
  rect(x + 9, y - 9, 6, 2);
  rect(x + 9, y - 5, 6, 2);
  pop();
}`;
  function copyForEditor() {
    const k = kindOf(lesson()), code = cm.getValue();
    if (k === 'train') return copyText(code, 'Entry code');
    let out = code;
    if (/recruit\s*\(/.test(code) && !/function\s+recruit\s*\(/.test(code)) out += RECRUIT_HELPER;
    if (/\bworld\b|letterPoints\s*\(/.test(code)) out += '\n\n// world and letterPoints() come from the Lab 7 bench.\n// In the p5 editor, make your own: let world = { stone: { x: 300, y: 250, r: 40 } };';
    copyText(out, 'Code for the p5 editor');
  }
  let resetArm = 0;
  function resetCode() {
    const btn = $('#reset');
    if (Date.now() - resetArm > 3000) { resetArm = Date.now(); btn.textContent = 'RESET?'; setTimeout(() => { btn.textContent = 'RESET'; }, 3000); return; }
    resetArm = 0; btn.textContent = 'RESET';
    const L = lesson(), k = kindOf(L);
    cm.setValue(k === 'train' ? AR.TEMPLATE : L.starter); saveCode(); analyze(); play();
  }

  function renderMap() {
    const map = $('#map'); map.innerHTML = '';
    for (const p of PARTS) {
      const pips = LESSONS.map((L, i) => [L, i]).filter(([L]) => L.part === p.key).map(([L, i]) => h('button', { class: 'pip' + (SOLVED.has(L.id) ? ' solved' : '') + (i === IDX ? ' here' : ''), title: `${i + 1}. ${L.title}`, 'aria-label': `${i + 1}. ${L.title}`, onclick: () => go(i) }));
      map.append(h('div', { class: 'part' }, h('b', null, p.key), h('div', { class: 'pips' }, pips)));
    }
    $('#pos').textContent = `${IDX + 1} / ${LESSONS.length}`;
  }
  function renderBrief(L) {
    const b = $('#brief'); b.innerHTML = '';
    b.append(h('div', { class: 'kicker' }, h('span', { class: 'tag' }, L.part), ` ${IDX + 1} of ${LESSONS.length}`), h('h1', null, L.title));
    if (L.brief) b.append(h('p', { class: 'lead' }, L.brief));
    const k = kindOf(L);
    if (k === 'sketch' || k === 'train') {
      b.append(h('div', { class: 'task' },
        h('div', { class: 'taskhead' }, h('span', null, k === 'train' ? 'ARENA CHECKS' : 'PUZZLE'), h('span', { id: 'verdict', class: 'verdict' })),
        h('p', { class: 'tasktext' }, L.task),
        h('ul', { id: 'checks', class: 'checks' }),
        L.hint ? h('details', { class: 'hint' }, h('summary', null, 'HINT'), h('p', null, L.hint)) : null,
        k === 'train' ? h('div', { class: 'share' }, h('button', { class: 'btn sm prim', onclick: () => copyText(shareLink(cm.getValue()), 'Share link') }, 'COPY SHARE LINK'), h('span', { class: 'dim' }, 'Send the link to your instructor. Opening it adds your entry to the match.')) : null));
      renderChecks(null);
      if (SOLVED.has(L.id)) { const v = $('#verdict'); v.textContent = 'SOLVED BEFORE'; v.className = 'verdict was'; }
    }
    if (L.howto) b.append(h('div', { class: 'howto' }, h('div', { class: 'vsec' }, 'THIS BENCH'), h('ul', null,
      h('li', null, h('b', null, 'PLAY'), ' runs the code from the start. Ctrl+Enter does the same.'),
      h('li', null, h('b', null, 'Click a line'), ': the sketch marks what that line draws, and the panel under the code says what it does.'),
      h('li', null, h('b', null, 'Click a shape'), ' in the sketch: the code jumps to the line that drew it.'),
      h('li', null, h('b', null, 'STEP'), ' pauses and walks through one frame, one line at a time. \u2191 and \u2193 move through it.'),
      h('li', null, h('b', null, 'The puzzle'), ' checks itself while the sketch runs.'))));
    if (L.film) {
      b.append(h('figure', { class: 'film' }, h('video', { src: `films/${L.film}.mp4`, poster: `films/${L.film}.jpg`, controls: true, preload: 'none', playsinline: true }), h('figcaption', null, L.filmCap || '')));
    }
    if (L.story) b.append(h('blockquote', { class: 'story' }, h('p', null, L.story.text), h('cite', null, L.story.ref)));
    if (k === 'train') b.append(h('div', { class: 'rules' }, h('div', { class: 'vsec' }, 'RULES'), h('ul', null,
      h('li', null, 'this.target is {x, y}: where this recruit must go. this.team is your team name.'),
      h('li', null, 'world.agents lists every other recruit as {x, y, team, connected, id}.'),
      h('li', null, 'world.keep is the round keep in the middle. Nobody passes through it.'),
      h('li', null, 'A recruit moves at most 2.4 px a frame. You cannot move other recruits.'),
      h('li', null, 'The match lasts 20 seconds. The score is revealed after it.'))));
    if (k === 'match') {
      b.append(h('div', { class: 'task' }, h('div', { class: 'taskhead' }, h('span', null, 'RUN OF SHOW')), h('ol', { class: 'steps' },
        h('li', null, 'Collect entries: share links, pasted code, or .js files.'),
        h('li', null, 'Open each new entry with CODE before the first run. Entries run in this browser.'),
        h('li', null, 'Round 1, no card. Do not explain the score.'),
        h('li', null, 'REVEAL SCORE. Talk about what was rewarded.'),
        h('li', null, 'Round 2, with a card if you want one. Same round number = same result on every screen.'))),
      h('div', { class: 'rules' }, h('div', { class: 'vsec' }, 'CARDS'), h('ul', null, Object.entries(AR.CARDS).filter(([k2]) => k2 !== 'none').map(([, c]) => h('li', null, h('b', null, c.name + '. '), c.text)))));
    }
  }
  function renderAlt(L) {
    const a = $('#altSec'); a.innerHTML = '';
    const k = kindOf(L);
    if (k === 'match') {
      const ta = h('textarea', { id: 'intake', placeholder: 'Paste share links or entry code here. Several at once is fine: each entry starts with a // TEAM: line.', rows: 5 });
      const file = h('input', { type: 'file', multiple: true, accept: '.js,.txt', hidden: true, onchange: async (ev) => { await addFiles(ev.target.files); ev.target.value = ''; } });
      a.append(h('div', { class: 'bar' }, h('span', { class: 'tag' }, 'ENTRIES'), h('span', { id: 'entryCount', class: 'mono dim' })),
        h('div', { id: 'entryList', class: 'entries' }),
        h('div', { class: 'intake' }, ta, h('div', { class: 'row' },
          h('button', { class: 'btn sm prim', onclick: () => { const n = addEntries(parseIntake(ta.value), 'paste'); ta.value = ''; toast(n ? `${n} entr${n === 1 ? 'y' : 'ies'} added` : 'No new entries found'); } }, 'ADD'),
          h('button', { class: 'btn sm', onclick: () => file.click() }, 'ADD FILES'), file,
          h('button', { class: 'btn sm', onclick: addHouse }, 'ADD HOUSE TEAMS'),
          h('button', { class: 'btn sm', onclick: () => { if (confirmClear()) { ENTRIES = []; saveEntries(); renderEntries(); } } }, 'CLEAR ALL'))));
      a.addEventListener('dragover', (ev) => { ev.preventDefault(); a.classList.add('drop'); });
      a.addEventListener('dragleave', () => a.classList.remove('drop'));
      a.addEventListener('drop', async (ev) => { ev.preventDefault(); a.classList.remove('drop'); await addFiles(ev.dataTransfer.files); });
      renderEntries(); loadFolder();
    }
    if (k === 'handin') {
      a.append(h('div', { class: 'bar' }, h('span', { class: 'tag' }, 'HAND IN')), h('div', { class: 'handin' },
        h('h2', null, 'PDF'), h('ol', null, h('li', null, 'Link to your working p5.js sketch.'), h('li', null, 'A screenshot of the sketch running and a screenshot of your class.'), h('li', null, 'Name your class, one property, one method, and your array.'), h('li', null, 'Three or four sentences: what did you model, what can one object do, and what changes when there are many?')),
        h('h2', null, 'System Portrait, 30 to 60 seconds'), h('p', null, 'Record the sketch running. Show the single objects, their repeated behaviour, and the interaction you added. No slides and no talking head: the sketch is the subject.'),
        h('h2', null, 'Checklist'), h('ul', { class: 'checks static' }, ['class with a constructor that sets three or more properties', 'objects made with new inside a loop, stored in an array', 'update() and display(), both called in draw()', 'one method that takes another object and changes this', 'something visible that happens only because there are many'].map((t) => h('li', null, h('span', { class: 'box' }), h('span', null, t))))));
    }
  }
  let clearArm = 0;
  function confirmClear() { if (Date.now() - clearArm < 3000) { clearArm = 0; return true; } clearArm = Date.now(); toast('Press CLEAR ALL again to remove every entry'); return false; }
  async function addFiles(files) { const list = []; for (const f of files) list.push({ code: await f.text(), src: 'file' }); const n = addEntries(list, 'file'); toast(`${n} entr${n === 1 ? 'y' : 'ies'} added from files`); }

  function renderStageBar(L) {
    const k = kindOf(L), bar = $('#stageBar'); bar.innerHTML = '';
    if (k === 'sketch') bar.append(h('span', { class: 'tag' }, 'SKETCH'), h('span', { id: 'stageInfo', class: 'mono dim' }), h('span', { class: 'sp' }), h('span', { id: 'runTag', class: 'runtag' }));
    if (k === 'train') bar.append(h('span', { class: 'tag' }, 'PRACTICE FIELD'), h('span', { id: 'stageInfo', class: 'mono dim' }, 'you and five house teams'), h('span', { class: 'sp' }), h('span', { id: 'runTag', class: 'runtag' }));
    if (k === 'match') {
      bar.append(h('span', { class: 'tag' }, 'THE MATCH'),
        h('label', { class: 'sel' }, 'ROUND ', h('select', { id: 'round' }, [1, 2, 3, 4, 5].map((n) => h('option', { value: n }, String(n))))),
        h('label', { class: 'sel' }, 'CARD ', h('select', { id: 'card' }, Object.entries(AR.CARDS).map(([key, c]) => h('option', { value: key }, c.name)))),
        h('span', { class: 'sp' }),
        h('button', { class: 'btn sm prim', onclick: () => runMatch(false) }, h('span', { class: 'i-play' }), 'RUN MATCH'),
        h('button', { class: 'btn sm', onclick: () => runMatch(true) }, 'SKIP TO RESULT'),
        h('button', { id: 'reveal', class: 'btn sm', disabled: true, onclick: revealScore }, 'REVEAL SCORE'),
        h('button', { class: 'btn sm', onclick: copyResults }, 'COPY RESULTS'),
        h('span', { id: 'runTag', class: 'runtag', hidden: true }));
    }
    if (k === 'handin') bar.append(h('span', { class: 'tag' }, 'THE FILMS'), h('span', { class: 'mono dim' }, 'Two Sallies: The Click, The Warm-Up, The Commissions'), h('span', { id: 'runTag', class: 'runtag', hidden: true }));
  }
  function renderCodeBar(L) {
    const k = kindOf(L);
    $('#step').querySelector('.lbl').textContent = k === 'train' ? 'SKIP' : 'STEP';
    $('#step').title = k === 'train' ? 'Run the rest of the match at once' : 'Pause and walk through one frame, line by line';
    $('#autoWrap').hidden = k !== 'sketch';
    $('#copy').textContent = k === 'train' ? 'COPY CODE' : 'COPY';
  }
  function go(i, keepHash) {
    i = Math.max(0, Math.min(LESSONS.length - 1, i));
    stopAll();
    IDX = i; store.set('lesson', i);
    const L = lesson(), k = kindOf(L);
    if (!keepHash) history.replaceState(null, '', '#' + (i + 1));
    document.title = `${L.title} · Lab 7 · The Constructors`;
    $('#main').className = 'k-' + k;
    $('#next').classList.remove('pulse');
    renderMap(); renderBrief(L); renderAlt(L); renderStageBar(L);
    clearConsole();
    $('#lower').hidden = k === 'match' || k === 'handin';
    $('#box').hidden = k !== 'sketch'; $('#field').hidden = !(k === 'train' || k === 'match'); $('#library').hidden = k !== 'handin'; $('#boardWrap').hidden = true;
    if (k === 'sketch' || k === 'train') {
      renderCodeBar(L);
      const code = k === 'train' ? store.get('entry', AR.TEMPLATE) : store.get('code.' + L.id, L.starter);
      cm.setValue(code); cm.clearHistory(); clearMarks(); analyze();
      caretLine = 1; setTimeout(() => cm.refresh(), 0);
      renderExplain();
      requestAnimationFrame(() => { layoutStage(); if (k === 'sketch') startSketch(false); else { renderBoard(null); const m = new AR.Match({ entries: AR.trainEntries(cm.getValue()), canvas: $('#field'), seed: 11 }); m.step(false); setState('idle'); } });
    } else {
      requestAnimationFrame(() => layoutStage());
      if (k === 'match') { const m = new AR.Match({ entries: ENTRIES.filter((e) => e.on).slice(0, 25).map((e) => ({ team: e.team, code: e.code })), canvas: $('#field'), seed: 7919 }); m.step(false); MATCH = null; }
      if (k === 'handin') {
        const REELS = [['click', 'I. The Click'], ['warmup', 'II. The Warm-Up'], ['poem-simple', 'Something Simple'], ['poem-gloaming', 'Gloaming'], ['poem-epigram', 'To the One Who Laughed'], ['poem-shears', 'Shears'], ['poem-gloriatron', 'Gloriatron'], ['poem-tensor', 'Field Theory'], ['poem-epic', 'Exile of Engines'], ['click-meet', 'The ending']];
        const v = $('#endFilm'), wrap = $('#reels');
        const pick = (id) => { v.src = `films/${id}.mp4`; v.poster = `films/${id}.jpg`; wrap.querySelectorAll('.btn').forEach((x) => x.classList.toggle('on', x.dataset.id === id)); };
        wrap.replaceChildren(h('span', { class: 'tag' }, 'THE FILMS'), ...REELS.map(([id, t2]) => h('button', { class: 'btn sm', 'data-id': id, onclick: () => { pick(id); v.play().catch(() => {}); } }, t2)));
        pick('click-meet');
      }
    }
  }

  /* =====================================================================
     10. BOOT
     ===================================================================== */
  function boot() {
    setupEditor();
    $('#play').onclick = play; $('#stop').onclick = stop; $('#step').onclick = stepClick;
    $('#copy').onclick = copyForEditor; $('#reset').onclick = resetCode;
    $('#prev').onclick = () => go(IDX - 1); $('#next').onclick = () => go(IDX + 1);
    $('#conClear').onclick = clearConsole;
    $('#auto').checked = store.get('auto', false); $('#auto').onchange = (e) => store.set('auto', e.target.checked);
    $('#modalClose').onclick = () => { $('#modal').hidden = true; };
    $('#modal').addEventListener('click', (e) => { if (e.target.id === 'modal') $('#modal').hidden = true; });
    document.addEventListener('keydown', (e) => {
      const inEd = e.target.closest && (e.target.closest('.CodeMirror') || /INPUT|TEXTAREA|SELECT/.test(e.target.tagName));
      if (e.key === 'Escape' && !$('#modal').hidden) { $('#modal').hidden = true; return; }
      if (STEP && !inEd) {
        if (e.key === 'ArrowDown' || e.key === 'ArrowRight' || e.key === ' ') { e.preventDefault(); stepTo(STEP.k + 1); return; }
        if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') { e.preventDefault(); stepTo(STEP.k - 1); return; }
        if (e.key === 'Escape') { exitStep(true); return; }
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') { e.preventDefault(); play(); return; }
      if (e.altKey && e.key === 'ArrowRight') { e.preventDefault(); go(IDX + 1); return; }
      if (e.altKey && e.key === 'ArrowLeft') { e.preventDefault(); go(IDX - 1); return; }
      if (!inEd && !STEP && e.key === 'ArrowRight') go(IDX + 1);
      if (!inEd && !STEP && e.key === 'ArrowLeft') go(IDX - 1);
    });
    let start = store.get('lesson', 0);
    const hs = location.hash;
    const am = hs.match(/#add=([A-Za-z0-9_-]+)/);
    if (am) {
      try { const o = JSON.parse(b64d(am[1])); const n = addEntries([{ code: o.c, src: 'link' }], 'link'); start = LESSONS.findIndex((L) => L.kind === 'match'); setTimeout(() => toast(n ? `Entry added: ${AR.parseTeam(o.c, 'Unnamed')}` : 'That entry is already in the list'), 300); }
      catch (e) { setTimeout(() => toast('That share link could not be read'), 300); }
    } else if (/^#\d+$/.test(hs)) start = +hs.slice(1) - 1;
    window.addEventListener('hashchange', () => {
      const a = location.hash.match(/#add=([A-Za-z0-9_-]+)/);
      if (a) { try { const o = JSON.parse(b64d(a[1])); const n = addEntries([{ code: o.c, src: 'link' }], 'link'); toast(n ? `Entry added: ${AR.parseTeam(o.c, 'Unnamed')}` : 'That entry is already in the list'); } catch (e) { toast('That share link could not be read'); } go(LESSONS.findIndex((L) => L.kind === 'match')); return; }
      const m = location.hash.match(/^#(\d+)$/); if (m && +m[1] - 1 !== IDX) go(+m[1] - 1, true);
    });
    go(start);
    requestAnimationFrame(tick);
    window.__lab = { go, play, stepClick, stepTo, exitStep, get RUN() { return RUN; }, get STEP() { return STEP; }, get TRAIN() { return TRAIN; }, get MATCH() { return MATCH; }, B, instrument, LESSONS, cm: () => cm, runMatch, addEntries, parseIntake, shareLink, buildS };
  }
  boot();
})();
