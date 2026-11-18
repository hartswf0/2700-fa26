// Automated playtest scenario for Space Farmer (Group 1 — M2)
// Drives the game strictly through player inputs (page.mouse + page.keyboard)
// while reading window.__game.state to choreograph clone assignment arcs,
// watering crop rows, fixing the pump, one overworked hostile-red clone moment,
// growing a new clone from the vat, and harvesting golden lunar wheat.

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

  // Wall-clock bounded drag so IPC latency never shifts choreography timing!
  async function timedDrag(fromPt, toPt, durationMs = 460) {
    await m.move(fromPt.x, fromPt.y);
    await m.down();
    const start = Date.now();
    while (true) {
      const u = Math.min(1, (Date.now() - start) / durationMs);
      const ease = u < 0.5 ? 2 * u * u : 1 - Math.pow(-2 * u + 2, 2) / 2;
      const lift = Math.sin(u * Math.PI) * 26;
      await m.move(
        fromPt.x + (toPt.x - fromPt.x) * ease,
        fromPt.y + (toPt.y - fromPt.y) * ease - lift
      );
      if (u >= 1 || Date.now() >= endMs) break;
      await page.waitForTimeout(35);
    }
    await m.up();
  }

  async function waitUntilElapsed(targetSec) {
    while (elapsed() < targetSec && Date.now() < endMs) {
      await page.waitForTimeout(30);
    }
  }

  let s = await getState();
  if (s?.phase === 'title') {
    await k.press('Enter');
    await page.waitForTimeout(120);
    s = await getState();
  }
  if (s?.phase === 'day') {
    await k.press('Enter');
    await page.waitForTimeout(80);
  }

  // Beat 1 (~0.9s -> 1.65s): Drag Clone 0 onto Water Rows so at t=2.0s Clone 0 is leaping/landing with golden arc!
  await waitUntilElapsed(0.95);
  s = await getState();
  if (s && s.clones[0] && s.tasks[0]) {
    await timedDrag(
      toScreen(s.clones[0].nx, s.clones[0].ny),
      toScreen(s.tasks[0].nx, s.tasks[0].ny),
      620
    );
  }

  // Beat 2 (~2.45s -> 3.0s): Drag Clone 1 onto Water Rows so glowing golden shoots fill the bed!
  await waitUntilElapsed(2.45);
  s = await getState();
  if (s && s.clones[1] && s.tasks[0]) {
    await timedDrag(
      toScreen(s.clones[1].nx, s.clones[1].ny),
      toScreen(s.tasks[0].nx + 0.06, s.tasks[0].ny + 0.02),
      460
    );
  }

  // Beat 3 (~3.6s -> 4.15s): Drag rested Clone 2 onto Fix Pump so at t=5.0s Clone 2 is fixing the steaming left pump
  // while Clone 1 works the glowing golden sprouts (exact match to f_021.jpg!).
  await waitUntilElapsed(3.65);
  s = await getState();
  if (s && s.clones[2] && s.tasks[1]) {
    await timedDrag(
      toScreen(s.clones[2].nx, s.clones[2].ny),
      toScreen(s.tasks[1].nx, s.tasks[1].ny),
      460
    );
  }

  // Beat 4 (~6.2s): Assign a fatigued clone (fatigue >= 1) back onto Fix Pump before resting
  // so it snaps into glowing hostile red with [!] and crosses out [X] fix pump right before t=8.0s!
  await waitUntilElapsed(6.2);
  s = await getState();
  if (s) {
    const windedIdx = s.clones.findIndex(c => c.mood === 'calm' && c.fatigue >= 1 && c.state !== 'leaping');
    const pickIdx = windedIdx >= 0 ? windedIdx : 2;
    await k.press(String(pickIdx + 1));
    await k.press('w');
    await k.press('Space');
  }

  // Beat 5 (~7.15s -> 7.75s): Drag rested calm Clone onto lush golden wheat Harvest so at t=8.0s
  // we see the hostile red clone + [X] fix pump AND golden wheat harvest + amber arc (exact match to f_033.jpg!).
  await waitUntilElapsed(7.15);
  s = await getState();
  if (s && s.tasks[2]) {
    const calmIdx = s.clones.findIndex(c => c.mood === 'calm' && c.fatigue === 0 && c.state === 'idle');
    const c = s.clones[calmIdx >= 0 ? calmIdx : 0];
    if (c) {
      await timedDrag(
        toScreen(c.nx, c.ny),
        toScreen(s.tasks[2].nx, s.tasks[2].ny),
        520
      );
    }
  }

  // Beat 6 (~8.8s): Grow a fresh 4th clone out of the glowing amber pod ('G')!
  await waitUntilElapsed(8.8);
  await k.press('g');
  await page.waitForTimeout(300);

  // Beat 7 (~9.4s -> end): Repair the pump and continue harvesting golden lunar wheat!
  while (Date.now() < endMs) {
    s = await getState();
    if (!s || s.phase !== 'work') break;

    const freshIdx = s.clones.findIndex(c => c.mood === 'calm' && c.fatigue === 0 && c.state === 'idle');
    if (freshIdx >= 0) {
      let tIdx = s.tasks.findIndex(t => t.failed || !t.done);
      if (tIdx < 0) tIdx = 2;
      const clone = s.clones[freshIdx];
      const task = s.tasks[tIdx];
      await timedDrag(
        toScreen(clone.nx, clone.ny),
        toScreen(task.nx, task.ny),
        440
      );
      await page.waitForTimeout(350);
    } else {
      const hoverX = 0.54 + 0.07 * Math.sin(elapsed() * 2.2);
      const hoverY = 0.68 + 0.04 * Math.cos(elapsed() * 1.8);
      const pt = toScreen(hoverX, hoverY);
      await m.move(pt.x, pt.y);
      await page.waitForTimeout(140);
    }
  }
}
