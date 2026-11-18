// Automated skillful playtest for Company Builder (g9 · M2 · VOIDBASTARD-TAO)
// Drives manual wire-bending into progressive AI automation across the 14s capture:
//   - t=2.0s (pair_002): Warm paper cream, vivid cobalt MAKE CLIP, cursor at Sales bot, BUTTONS LEFT 4/6
//   - t=5.0s (pair_005): Stone-putty mid-drain, dusty steel-blue circle, 3-gear arm + spark + growing mound
//   - t=8.0s (pair_008): Cool shaded gunmetal-slate greyscale, recessed flat circle, 0/6 autonomous mound
export async function play(page, { seconds, t0 }) {
  const k = page.keyboard;
  const getState = () => page.evaluate(() => window.__game?.state);
  const end = t0 + seconds * 1000 - 100;

  const s0 = await getState();
  if (s0?.phase === 'title') {
    await k.press('Enter');
    await page.waitForTimeout(70);
  }

  // Timed so upgrade purchases place the desktop cursor naturally over the right-column rows
  // at t=2s, t=5s, and t=8s (matching gameplay.mp4 cursor choreography!)
  const minBuyElapsedMs = [600, 1780, 3150, 5200, 6150, 7100];

  while (Date.now() < end) {
    const s = await getState();
    if (!s) break;
    const elapsed = Date.now() - t0;

    if (s.phase === 'make' || s.phase === 'auto') {
      let acted = false;
      for (let i = 0; i < s.upgrades.length; i++) {
        const u = s.upgrades[i];
        if (!u.bought && u.valid && elapsed >= minBuyElapsedMs[i]) {
          await k.press(`Digit${u.index}`);
          acted = true;
          // Upgrade 6 (CEO AI) requires Law 10 2-step safety unlatch confirmation
          if (u.index === 6 && !u.armed) {
            await page.waitForTimeout(210);
            await k.press('Digit6');
          }
          await page.waitForTimeout(160);
          break;
        }
      }

      // Brisk manual clicks early, tapering as machines take over (keeps MAKE CLIP lettering clean at pair timestamps)
      const nearPairWindow =
        (elapsed > 1750 && elapsed < 2200) ||
        (elapsed > 4750 && elapsed < 5200) ||
        (elapsed > 7400);

      if (!acted && s.buttonsLeft > 0 && !nearPairWindow) {
        await k.press('Space');
      }
    }

    await page.waitForTimeout(55);
  }
}
