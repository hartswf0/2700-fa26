// node render.js sheet t1,t2,...   |   node render.js mp4
const { chromium } = require('/opt/npm-tools/node_modules/playwright');
const { spawn } = require('child_process');
const fs = require('fs'), path = require('path');
const BASE = 'http://localhost:8765/LAB%207%20-%20CLASSES/seventh-sally/film-src/film.html';
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
  const grab = async (f) => Buffer.from((await page.evaluate(async (f) => { await window.__render(f); return document.getElementById('film').toDataURL('image/jpeg', 0.92); }, f)).split(',')[1], 'base64');
  if (mode === 'sheet') {
    const dir = path.join(__dirname, 'sheet'); fs.mkdirSync(dir, { recursive: true });
    for (const t of list.split(',').map(Number)) { const f = Math.round(t * 24); fs.writeFileSync(path.join(dir, `s-${String(f).padStart(5, '0')}.jpg`), await grab(f)); }
    console.log('sheet done', errs.join(' | '));
  } else {
    const t0 = Date.now();
    const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', '24', '-c:v', 'mjpeg', '-i', '-', '-i', path.join(__dirname, 'audio', 'sally.m4a'),
      '-map', '0:v', '-map', '1:a', '-c:a', 'copy', '-shortest', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '25', '-preset', 'medium', '-movflags', '+faststart', path.join(OUT, 'seventh-sally.mp4')]);
    ff.stderr.on('data', (d) => process.stderr.write(d));
    for (let f = 0; f < NF; f++) {
      const buf = await grab(f);
      if (f === Math.round(24 * 2.5)) fs.writeFileSync(path.join(OUT, 'seventh-sally.jpg'), buf);
      if (!ff.stdin.write(buf)) await new Promise((r) => ff.stdin.once('drain', r));
    }
    ff.stdin.end(); await new Promise((r) => ff.on('close', r));
    console.log('frames', NF, 'sec', ((Date.now() - t0) / 1000).toFixed(0), errs.length ? 'ERR ' + errs.slice(0, 3).join(' | ') : '');
  }
  await browser.close();
})();
