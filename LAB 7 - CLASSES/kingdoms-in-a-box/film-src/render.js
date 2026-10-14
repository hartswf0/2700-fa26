// node render.js sheet <id> t1,t2,...   |   node render.js mp4 <id> [<id> ...]
const { chromium } = require('/opt/npm-tools/node_modules/playwright');
const { spawn } = require('child_process');
const fs = require('fs'), path = require('path');
const BASE = 'http://localhost:8765/LAB%207%20-%20CLASSES/kingdoms-in-a-box/film-src/film.html';
const OUT = path.resolve(__dirname, '..', 'films');
(async () => {
  const [mode, ...rest] = process.argv.slice(2);
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  const ids = mode === 'sheet' ? [rest[0]] : rest;
  for (const id of ids) {
    const page = await browser.newPage({ viewport: { width: 1300, height: 740 } });
    const errs = [];
    page.on('pageerror', (e) => errs.push(String(e)));
    page.on('console', (m) => { if (m.type() === 'error' && !/Failed to load resource/.test(m.text())) errs.push(m.text()); });
    await page.goto(BASE + '?w=' + id);
    await page.waitForFunction(() => window.__ready, null, { timeout: 30000 });
    const NF = await page.evaluate(() => window.__NF);
    const grab = async (f) => Buffer.from((await page.evaluate(async (f) => { await window.__render(f); return document.getElementById('film').toDataURL('image/jpeg', 0.92); }, f)).split(',')[1], 'base64');
    if (mode === 'sheet') {
      const times = rest[1].split(',').map(Number), want = new Set(times.map((t) => Math.round(t * 24)));
      const dir = path.join(__dirname, 'sheet'); fs.mkdirSync(dir, { recursive: true });
      const last = Math.max(...want);
      for (let f = 0; f <= last; f++) { const buf = await grab(f); if (want.has(f)) fs.writeFileSync(path.join(dir, `${id}-${String(f).padStart(5, '0')}.jpg`), buf); }
      console.log('sheet', id, [...want].length, errs.join(' | '));
    } else {
      const t0 = Date.now();
      const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', '24', '-c:v', 'mjpeg', '-i', '-', '-i', path.join(__dirname, 'audio', id + '.m4a'),
        '-map', '0:v', '-map', '1:a', '-c:a', 'copy', '-shortest', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '22', '-preset', 'medium', '-movflags', '+faststart', path.join(OUT, id + '.mp4')]);
      ff.stderr.on('data', (d) => process.stderr.write(d));
      let poster = null; const pf = await page.evaluate(() => { const T = window.__T; return 0; });
      for (let f = 0; f < NF; f++) {
        const buf = await grab(f);
        if (f === Math.round(NF * 0.55)) poster = buf;
        if (!ff.stdin.write(buf)) await new Promise((r) => ff.stdin.once('drain', r));
      }
      ff.stdin.end(); await new Promise((r) => ff.on('close', r));
      const fin = await page.evaluate(() => { try { const w = document.querySelector('iframe').contentWindow; return WORLD.check(w.__box.vars(), MEM, w.__box.state()).map((x) => (x[0] ? '+' : '-') + x[1]).join(' | '); } catch (e) { return 'n/a ' + e.message; } });
      console.log('   final:', fin);
      if (poster) fs.writeFileSync(path.join(OUT, id + '-full.jpg'), poster);
      console.log(id, 'frames', NF, 'sec', ((Date.now() - t0) / 1000).toFixed(0), errs.length ? 'ERR ' + errs.slice(0, 3).join(' | ') : '');
    }
    await page.close();
  }
  await browser.close();
})();
