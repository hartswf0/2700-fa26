// Automated rhythm-cutting keyboard playtest for Sushi Cutting (gsu M2)
// Reads window.__game.state to time Space cuts right onto the coral guide lines,
// triggering HYPER COMBO sparks and serving finished plates to the true table (1..4).

export async function play(page, { seconds = 14 }) {
  const endAt = Date.now() + seconds * 1000 - 200;

  while (Date.now() < endAt) {
    const st = await page.evaluate(() => window.__game?.state ?? null).catch(() => null);
    if (!st) {
      await page.waitForTimeout(30);
      continue;
    }

    if (st.mode === 'title' || st.mode === 'closed' || st.mode === 'mid') {
      await page.keyboard.press('Enter');
      await page.waitForTimeout(120);
      continue;
    }

    if (st.mode === 'serve') {
      if (!st.serving && st.order) {
        // Brief beat to admire the fully portioned roll, then serve to the true hungry table!
        await page.waitForTimeout(160);
        await page.keyboard.press(String(st.order.table));
      }
      await page.waitForTimeout(60);
      continue;
    }

    if (st.mode === 'cut' && st.nextLineX !== null) {
      const diff = st.knifeX - st.nextLineX;
      // Account for ~18ms round-trip latency along knife travel direction:
      // when moving left (knifeDir < 0), press when knifeX is [0..18] px right of nextLineX (or [-12..18])
      const lead = st.knifeDir * 6;
      if (Math.abs(diff + lead) <= 16) {
        await page.keyboard.press('Space');
        await page.waitForTimeout(95);
        continue;
      }
    }

    await page.waitForTimeout(16);
  }
}
