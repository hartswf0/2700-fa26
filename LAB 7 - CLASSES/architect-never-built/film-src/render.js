// node render.js sheet t1,t2,...   |   node render.js mp4
const { chromium } = require('/opt/npm-tools/node_modules/playwright');
const { spawn } = require('child_process');
const fs = require('fs'), path = require('path');
const BASE = 'http://localhost:8765/LAB%207%20-%20CLASSES/architect-never-built/film-src/film.html';
const OUT = path.resolve(__dirname, '..');
(async () => {
  const [mode, list] = process.argv.slice(2);
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  const page = await browser.newPage({ viewport: { width: 1300, height: 740 } });
  const errs = [];
  page.on('pageerror', (e) => errs.push(String(e)));
  page.on('console', (m) => { if (m.type() === 'error') errs.push(m.text()); });
  await page.goto(BASE);
  await page.waitForFunction(() => window.__ready, null, { timeout: 30000 });
  const NF = await page.evaluate(() => window.__NF);
  const POSTER = Math.round(24 * (await page.evaluate(() => { const w = window.__T.shots.find((s) => s.shot === 'wall'); return w.t0 + w.lines[3].t1 + 1.0; })));
  const grab = async (f) => Buffer.from((await page.evaluate(async (f) => { await window.__render(f); return document.getElementById('film').toDataURL('image/jpeg', 0.92); }, f)).split(',')[1], 'base64');
  if (mode === 'sheet') {
    const dir = path.join(__dirname, 'sheet', process.env.SD || 'x'); fs.mkdirSync(dir, { recursive: true });
    const T = await page.evaluate(() => window.__T);
    const abs = (s) => { if (!s.includes(':')) return Number(s); const [n, lt] = s.split(':'); return T.shots.find((x) => x.shot === n).t0 + Number(lt); };
    for (const t of list.split(',').map(abs)) { const f = Math.round(t * 24); fs.writeFileSync(path.join(dir, `s-${String(f).padStart(5, '0')}.jpg`), await grab(f)); }
    console.log('sheet done', errs.join(' | '));
  } else {
    const t0 = Date.now();
    const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', '24', '-c:v', 'mjpeg', '-i', '-', '-i', path.join(__dirname, 'audio', 'an.m4a'),
      '-map', '0:v', '-map', '1:a', '-c:a', 'copy', '-shortest', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '33', '-preset', 'medium', '-g', '48', '-keyint_min', '24', '-movflags', '+faststart', process.env.OUTF || path.join(OUT, 'architect-never-built.mp4')]);
    ff.stderr.on('data', (d) => process.stderr.write(d));
    const F0 = +(process.env.F0 || 0), F1 = +(process.env.F1 || NF);
    for (let f = F0; f < F1; f++) {
      const buf = await grab(f);
      if (f === POSTER) fs.writeFileSync(path.join(OUT, 'architect-never-built.jpg'), buf);
      if (!ff.stdin.write(buf)) await new Promise((r) => ff.stdin.once('drain', r));
    }
    ff.stdin.end(); await new Promise((r) => ff.on('close', r));
    console.log('frames', NF, 'sec', ((Date.now() - t0) / 1000).toFixed(0), errs.length ? 'ERR ' + errs.slice(0, 3).join(' | ') : '');
  }
  await browser.close();
})();
