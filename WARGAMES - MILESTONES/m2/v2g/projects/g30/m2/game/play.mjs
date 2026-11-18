// Automated playtest scenario for Group 30: Household Companion (HOMEBODY)
export async function play(page, { seconds, t0 }) {
  const k = page.keyboard;
  const state = () => page.evaluate(() => window.__game?.state);
  const end = t0 + seconds * 1000 - 200;

  // Hover over the book button first, then check the reference book (t ~ 1.5s), then act (t ~ 4.2s)
  await page.mouse.move(1090, 650);
  await page.waitForTimeout(900);

  while (Date.now() < end) {
    const s = await state();
    if (!s) break;

    if (s.phase === 'title' || s.phase === 'morn') {
      await k.press('Enter');
      await page.waitForTimeout(300);
      continue;
    }

    if (s.phase === 'do') {
      if (!s.checkedToday) {
        await page.mouse.move(1110, 650, { steps: 8 });
        await k.press('KeyC'); // Check the plant-care book (-1h, flips pages & reveals truth)
        await page.waitForTimeout(1600);
      } else {
        if (s.adviceIsBad) {
          await page.mouse.move(1110, 650, { steps: 6 });
          await k.press('Digit2'); // Override bad companion advice -> waters/mists safely!
        } else {
          await page.mouse.move(910, 650, { steps: 6 });
          await k.press('Digit1'); // Follow accurate advice
        }
        await page.waitForTimeout(1500);
      }
    } else if (s.phase === 'night') {
      await page.waitForTimeout(350);
    } else {
      break;
    }
  }
}
