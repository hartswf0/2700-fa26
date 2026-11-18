// Playtest choreography for Group 18 — Capacity Crisis (M2)
// Reads window.__game.state and interacts via mouse & keyboard (`Space`, `1` SELL, `2` SAVE, `3` CAP).
export async function play(page, { seconds, t0 }) {
  const k = page.keyboard;
  const m = page.mouse;
  const getState = () => page.evaluate(() => window.__game?.state);
  const end = t0 + seconds * 1000 - 180;

  function toClient(s, lx, ly) {
    const r = s.viewportRect || { left: 0, top: 0, width: 1280, height: 720 };
    return [r.left + (lx / 1280) * r.width, r.top + (ly / 720) * r.height];
  }

  let s = await getState();
  if (s?.phase === 'title') {
    await k.press('Enter');
    await page.waitForTimeout(120);
  }

  let stepIdx = 0;
  while (Date.now() < end) {
    s = await getState();
    if (!s) break;
    const elapsed = (Date.now() - t0) / 1000;

    if (s.phase === 'morn') {
      // Hover & click next open isometric chip lot so chips visibly snap into the 4 pads!
      const openSlot = s.slots.find(sl => !sl.installed) || s.slots[stepIdx % s.slots.length];
      const [cx, cy] = toClient(s, openSlot.cx, openSlot.cy);
      await m.move(cx, cy, { steps: 6 });
      await page.waitForTimeout(220);

      // Install chips across Days 1-4; hold silicon if grid is critically strained late in week
      if (s.upgradesDone < 4 || s.loadRatio < 0.78) {
        await m.click(cx, cy);
      } else {
        await k.press('s');
      }
      stepIdx++;
      await page.waitForTimeout(180);
    } else if (s.phase === 'alloc') {
      await page.waitForTimeout(260); // Let afternoon peak & cable surges read clearly
      s = await getState();
      if (!s) break;

      // Days 1–2: SELL freed capacity to ignite Jevons' Paradox cable surges!
      // Days 3–6: alternate SAVE / SELL / CAP based on live grid strain so all 4 chip halls blaze at 85–96% load!
      if (s.loadRatio > 0.84) {
        await k.press('3'); // CAP -> hold right below blackout ceiling while town lights flicker!
      } else if (s.loadRatio > 0.72 && s.savedCount < 2) {
        await k.press('2'); // SAVE -> expand substation MW buffer
      } else {
        await k.press('1'); // SELL -> slash query price & triple golden cable surges!
      }
      await page.waitForTimeout(160);
    } else if (s.phase === 'day') {
      // Smoothly sweep architectural cursor across active chip halls while cables surge
      const activeSlot = s.slots[(Math.floor(elapsed * 1.4)) % s.slots.length];
      const [hx, hy] = toClient(
        s,
        activeSlot.cx + Math.sin(elapsed * 3.2) * 18,
        activeSlot.cy + Math.cos(elapsed * 2.5) * 10
      );
      await m.move(hx, hy, { steps: 3 });
      await page.waitForTimeout(90);
    } else if (s.phase === 'black' || s.phase === 'end') {
      // Hold report briefly; if reached early, restart so recording stays lively
      if (elapsed < seconds - 2.6) {
        await page.waitForTimeout(1100);
        await k.press('r');
      } else {
        await page.waitForTimeout(150);
      }
    } else {
      await page.waitForTimeout(80);
    }
  }
}
