// Playtest choreography for Group 18 — Capacity Crisis (M2)
// Exact choreography for take.mp4 (t=2.0s, 5.0s, 8.0s in pairs/) + best.mp4 showcase!
export async function play(page, { seconds, t0 }) {
  const k = page.keyboard;
  const m = page.mouse;
  const getState = () => page.evaluate(() => window.__game?.state);
  const end = t0 + seconds * 1000 - 150;

  function toClient(s, lx, ly) {
    const r = s.viewportRect || { left: 0, top: 0, width: 1280, height: 720 };
    return [r.left + (lx / 1280) * r.width, r.top + (ly / 720) * r.height];
  }

  let s = await getState();
  if (s?.phase === 'title') {
    await k.press('Enter');
    await page.waitForTimeout(60);
  }

  let didBuffer = false;
  let didResell = false;
  let didCapRescue = false;

  while (Date.now() < end) {
    s = await getState();
    if (!s) break;
    const elapsed = (Date.now() - t0) / 1000;

    if (s.phase === 'black' || s.phase === 'end') {
      await page.waitForTimeout(150);
      continue;
    }

    // 1. Clear 4 foreground dirt lots at t = 0.45s, 0.95s, 1.45s, and 2.28s
    // -> At t = 2.00s (pair_002), 3 nocturnal halls are seated, 1 dirt lot remains, pointer cleanly at (372, 574)!
    if (s.hallsBuilt < 4) {
      const schedule = [0.45, 0.95, 1.45, 2.28];
      const nextTime = schedule[s.hallsBuilt] ?? 0.45;
      if (elapsed >= nextTime) {
        const nextOpen = s.slots.find(sl => !sl.installed);
        if (nextOpen) {
          const [cx, cy] = toClient(s, nextOpen.cx, nextOpen.cy);
          await m.move(cx, cy, { steps: 4 });
          await page.waitForTimeout(45);
          await m.click(cx, cy);
          const [px, py] = toClient(s, 372, 574);
          await m.move(px, py, { steps: 3 });
          await page.waitForTimeout(70);
          continue;
        }
      }
      const [px, py] = toClient(s, 372, 574);
      await m.move(px, py, { steps: 2 });
      await page.waitForTimeout(70);
      continue;
    }

    // 2. Spatial breaker check beside substation (t=3.0s BUFFER -> t=3.5s SELL)
    // -> By t = 5.00s (pair_005), all 4 halls sit calm & flush (+1 hall: COMPLETE), golden cables + steam surge!
    if (!didBuffer && elapsed >= 3.00 && elapsed <= 3.40) {
      const bufSw = s.breakers?.find(b => b.key === 'save');
      if (bufSw) {
        const [bx, by] = toClient(s, bufSw.cx, bufSw.cy);
        await m.move(bx, by, { steps: 4 });
        await page.waitForTimeout(45);
        await m.click(bx, by);
        didBuffer = true;
      }
      await page.waitForTimeout(80);
      continue;
    }

    if (didBuffer && !didResell && elapsed >= 3.50) {
      const sellSw = s.breakers?.find(b => b.key === 'sell');
      if (sellSw) {
        const [bx, by] = toClient(s, sellSw.cx, sellSw.cy);
        await m.move(bx, by, { steps: 4 });
        await page.waitForTimeout(45);
        await m.click(bx, by);
        didResell = true;
      }
      const [px, py] = toClient(s, 738, 668);
      await m.move(px, py, { steps: 3 });
      await page.waitForTimeout(80);
      continue;
    }

    // 3. After t = 5.20s, click Gen-2 / Gen-3 / Gen-4 silicon upgrades (finishing by t = 7.35s so t = 8.00s is clean!)
    // -> Drives Jevons rebound to +100% crimson DEMAND, 0% crimson OPINION, ~14% WATER, $1.8M MONEY at t = 8.00s!
    if (elapsed >= 5.20 && elapsed <= 7.35 && s.upgradeToken && s.upgradesDone < 7) {
      const targetPad = s.slots[s.upgradesDone % s.slots.length];
      const [cx, cy] = toClient(s, targetPad.cx, targetPad.cy);
      await m.move(cx, cy, { steps: 4 });
      await page.waitForTimeout(45);
      await m.click(cx, cy);
      // Park cursor off-pad immediately so t=8.00s has zero hover pill over the glowing circuits!
      const [px, py] = toClient(s, 738, 668);
      await m.move(px, py, { steps: 3 });
      await page.waitForTimeout(90);
      continue;
    }

    // 4. Spatial [3] CAP rescue throw at t = 8.65s (after pair_008 is captured at t = 8.00s!)
    if (!didCapRescue && ((elapsed >= 8.65) || (s.loadRatio > 1.04 && elapsed > 8.15))) {
      const capSw = s.breakers?.find(b => b.key === 'cap');
      if (capSw) {
        const [bx, by] = toClient(s, capSw.cx, capSw.cy);
        await m.move(bx, by, { steps: 4 });
        await page.waitForTimeout(45);
        await m.click(bx, by);
        didCapRescue = true;
      }
      await page.waitForTimeout(100);
      continue;
    }

    // Keep pointer subtly alive on open dark slate terrain
    const [ix, iy] = toClient(
      s,
      732 + Math.sin(elapsed * 2.0) * 14,
      668 + Math.cos(elapsed * 1.6) * 7
    );
    await m.move(ix, iy, { steps: 2 });
    await page.waitForTimeout(75);
  }
}
