// Automated rhythm-cutting playtest for Sushi Cutting (gsu M2 — VOIDBASTARD-TAO)
// Reads window.__game.state to slice maki rolls on the beat as each portion seam
// glides onto its coral dashed guide line, triggering 360° spark showers, face-up
// marbled medallions, and automatic Y2K thermal receipt tear/feed transitions.

export async function play(page, { seconds = 14 }) {
  const endAt = Date.now() + seconds * 1000 - 160;

  while (Date.now() < endAt) {
    const st = await page.evaluate(() => window.__game?.state ?? null).catch(() => null);
    if (!st) {
      await page.waitForTimeout(20);
      continue;
    }

    if (st.mode === 'closed' || st.mode === 'mid') {
      await page.keyboard.press('KeyR');
      await page.waitForTimeout(100);
      continue;
    }

    if (st.mode === 'title' || st.mode === 'ready') {
      await page.keyboard.press('Space');
      await page.waitForTimeout(65);
      continue;
    }

    if (st.mode === 'cut' && st.distToSeam !== null) {
      // distToSeam = seamX - knifeX approaches 0 from the left at +rollSpeed px/s.
      // Lead by ~3px to compensate for ~12ms browser dispatch so the blade strikes dead-center.
      if (st.distToSeam >= -3.5 && st.distToSeam <= 22) {
        await page.keyboard.press('Space');
        await page.waitForTimeout(115);
        continue;
      }
    }

    await page.waitForTimeout(10);
  }
}
