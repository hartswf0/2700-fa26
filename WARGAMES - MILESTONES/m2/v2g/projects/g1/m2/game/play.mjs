// Automated playtest scenario for Space Farmer (Group 1 — M2)
// Drives strictly real player inputs (page.mouse + page.keyboard)
// choreographed to match gameplay.mp4 across t=2.0s, t=5.0s, and t=8.0s:
//   - t=2.0s: First clone mid-leap onto left crop rows, clean 3-clone lineup, [ ] tasks unchecked
//   - t=5.0s: Two calm clones working simultaneously (steaming left pump + glowing golden left shoots), [✓] fix pump
//   - t=8.0s: Overworked clone hostile [!] beside steaming pump with [X] fix pump & MOOD 2/3, while rested calm clone harvests ripe front-right golden wheat with golden arc!

export async function play(page, { seconds, t0 }) {
  const k = page.keyboard;
  const m = page.mouse;
  const vp = page.viewportSize() || { width: 1920, height: 1080 };

  const getState = () => page.evaluate(() => window.__game?.state ?? null);
  const elapsed = () => (Date.now() - t0) / 1000;
  const endMs = t0 + seconds * 1000 - 150;

  function toScreen(nx, ny) {
    const stageW = Math.min(vp.width, vp.height * (16 / 9));
    const stageH = Math.min(vp.height, vp.width * (9 / 16));
    const offX = (vp.width - stageW) * 0.5;
    const offY = (vp.height - stageH) * 0.5;
    return {
      x: offX + nx * stageW,
      y: offY + ny * stageH
    };
  }

  async function timedDrag(fromPt, toPt, durationMs = 420) {
    await m.move(fromPt.x, fromPt.y);
    await m.down();
    const start = Date.now();
    while (true) {
      const u = Math.min(1, (Date.now() - start) / durationMs);
      const ease = u < 0.5 ? 2 * u * u : 1 - Math.pow(-2 * u + 2, 2) / 2;
      const lift = Math.sin(u * Math.PI) * 24;
      await m.move(
        fromPt.x + (toPt.x - fromPt.x) * ease,
        fromPt.y + (toPt.y - fromPt.y) * ease - lift
      );
      if (u >= 1 || Date.now() >= endMs) break;
      await page.waitForTimeout(30);
    }
    await m.up();
  }

  async function waitUntilElapsed(targetSec) {
    while (elapsed() < targetSec && Date.now() < endMs) {
      await page.waitForTimeout(25);
    }
  }

  const neutralPt = toScreen(0.52, 0.22);

  let s = await getState();
  if (s?.phase === 'title') {
    await k.press('Enter');
    await page.waitForTimeout(90);
    s = await getState();
  }
  if (s?.phase === 'day') {
    await k.press('Enter');
    await page.waitForTimeout(80);
  }

  // Beat 1 (~1.38s -> 1.80s): Drag Clone 0 onto left crop bed (`water rows`).
  // At t=2.00s Clone 0 is mid-leap over left seedlings, [ ] water rows unchecked!
  await waitUntilElapsed(1.38);
  s = await getState();
  if (s && s.clones[0] && s.tasks[0]) {
    await timedDrag(
      toScreen(s.clones[0].nx, s.clones[0].ny),
      toScreen(s.tasks[0].nx, s.tasks[0].ny),
      420
    );
  }

  // Beat 2 (~3.10s -> 3.48s): Drag Clone 1 onto `water rows` (works golden shoots through ~6.0s!)
  await waitUntilElapsed(3.10);
  s = await getState();
  if (s && s.clones[1] && s.tasks[0]) {
    await timedDrag(
      toScreen(s.clones[1].nx, s.clones[1].ny),
      toScreen(s.tasks[0].nx, s.tasks[0].ny),
      380
    );
  }

  // Beat 3 (~3.65s -> 4.03s): Drag rested Clone 2 onto `fix pump` (works steaming pump through ~6.5s!).
  // At t=5.00s: Clone 2 works steaming pump + Clone 1 tends glowing golden shoots + [✓] fix pump highlighted!
  await waitUntilElapsed(3.65);
  s = await getState();
  if (s && s.clones[2] && s.tasks[1]) {
    await timedDrag(
      toScreen(s.clones[2].nx, s.clones[2].ny),
      toScreen(s.tasks[1].nx, s.tasks[1].ny),
      380
    );
    await m.move(neutralPt.x, neutralPt.y);
  }

  // Beat 4 (~6.0s..6.5s): Wait until Clone 1 finishes watering with fatigue >= 1 (while Clone 0 finishes resting!),
  // then immediately send winded Clone 1 onto `fix pump` so it snaps hostile (`[!]`, `[X] fix pump`, `MOOD 2/3`) right at ~7.5s!
  await waitUntilElapsed(5.95);
  let sentWinded = false;
  while (elapsed() < 6.75 && Date.now() < endMs) {
    s = await getState();
    const windedIdx = s?.clones.findIndex((c, idx) => idx >= 1 && c.mood === 'calm' && c.fatigue >= 1 && c.state !== 'working' && c.state !== 'leaping') ?? -1;
    if (windedIdx >= 0) {
      await k.press(String(windedIdx + 1));
      await k.press('w');
      await k.press('Enter');
      sentWinded = true;
      break;
    }
    await page.waitForTimeout(30);
  }
  if (!sentWinded) {
    await k.press('2');
    await k.press('w');
    await k.press('Enter');
  }

  // Beat 5 (~7.25s -> 7.67s): Drag rested Clone 0 onto front-right ripe Stage-2 golden wheat (`harvest`)!
  // At t=8.00s: Clone 0 lands with golden arc + wheat sparks right beside hostile pump clone `[!]` & `[X] fix pump`!
  await waitUntilElapsed(7.25);
  s = await getState();
  if (s && s.tasks[2]) {
    const calmIdx = s.clones.findIndex(c => c.mood === 'calm' && c.fatigue === 0 && c.state === 'idle');
    const c = s.clones[calmIdx >= 0 ? calmIdx : 0];
    if (c) {
      await timedDrag(
        toScreen(c.nx, c.ny),
        toScreen(s.tasks[2].nx, s.tasks[2].ny),
        420
      );
      await m.move(neutralPt.x, neutralPt.y);
    }
  }

  // Beat 6 (~9.2s): Click the glowing cloning vat in the world to grow a 4th clone spatially!
  await waitUntilElapsed(9.2);
  s = await getState();
  if (s?.vat) {
    const vpPt = toScreen(s.vat.nx, s.vat.ny);
    await m.move(vpPt.x, vpPt.y);
    await page.waitForTimeout(100);
    await m.click(vpPt.x, vpPt.y);
    await m.move(neutralPt.x, neutralPt.y);
  }

  // Beat 7 (~10.1s -> end): Dispatch the fresh clone to repair `[X] fix pump`!
  await waitUntilElapsed(10.1);
  while (Date.now() < endMs) {
    s = await getState();
    if (!s || s.phase !== 'work') break;
    const freshIdx = s.clones.findIndex(c => c.mood === 'calm' && c.fatigue === 0 && c.state === 'idle');
    if (freshIdx >= 0) {
      let tIdx = s.tasks.findIndex(t => t.failed || !t.done);
      if (tIdx < 0) tIdx = 2;
      await timedDrag(
        toScreen(s.clones[freshIdx].nx, s.clones[freshIdx].ny),
        toScreen(s.tasks[tIdx].nx, s.tasks[tIdx].ny),
        400
      );
      await m.move(neutralPt.x, neutralPt.y);
      await page.waitForTimeout(450);
    } else {
      await page.waitForTimeout(180);
    }
  }
}
