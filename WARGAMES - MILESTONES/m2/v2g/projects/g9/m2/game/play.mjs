// Automated skillful playtest for Company Builder (g9 · M2)
// Rapidly clicks to bend paperclips by hand, buys the 6 AI automation upgrades
// as output scales, draining colour to greyscale until no human buttons remain.
export async function play(page, { seconds, t0 }) {
  const k = page.keyboard;
  const getState = () => page.evaluate(() => window.__game?.state);
  const end = t0 + seconds * 1000 - 120;

  const s0 = await getState();
  if (s0?.phase === 'title') {
    await k.press('Enter');
    await page.waitForTimeout(80);
  }

  // Pace upgrade purchases smoothly across 0.7s..7.6s so every stage is clearly showcased
  const minBuyElapsedMs = [650, 1750, 3200, 4650, 6200, 7550];

  while (Date.now() < end) {
    const s = await getState();
    if (!s) break;
    const elapsed = Date.now() - t0;

    if (s.phase === 'make' || s.phase === 'auto') {
      let boughtSomething = false;
      for (let i = 0; i < s.upgrades.length; i++) {
        const u = s.upgrades[i];
        if (!u.bought && u.affordable && elapsed >= minBuyElapsedMs[i]) {
          await k.press(`Digit${u.index}`);
          boughtSomething = true;
          await page.waitForTimeout(95);
          break;
        }
      }
      if (!boughtSomething && s.buttonsLeft > 0) {
        await k.press('Space');
      }
    }

    await page.waitForTimeout(55);
  }
}
