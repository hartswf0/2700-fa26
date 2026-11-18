// Automated playtest choreography for Group 30: Household Companion (M2)
// Demonstrates:
//   1. Morning prompt & tactile Care Guide check (2.5D page-flip + spatial margin note at t ~ 2.0s)
//   2. Resisting an overwater AI trap ([SKIP WATER] when soil is saturated)
//   3. Swooping sculpted brass watering can + arc droplets on dry soil morning (t ~ 5.0s)
//   4. Warm morning -> noon -> golden-amber 18:00 dusk progression + thriving Stage-3 fern (t ~ 8.0s)
export async function play(page, { seconds, t0 }) {
  const k = page.keyboard;
  const state = () => page.evaluate(() => window.__game?.state);
  const elapsed = () => (Date.now() - t0) / 1000;
  const waitUntil = async (targetSec) => {
    const rem = targetSec * 1000 - (Date.now() - t0);
    if (rem > 15) await page.waitForTimeout(rem);
  };

  // Ensure READY if launched without ?autostart
  const s0 = await state();
  if (s0 && s0.phase === 'REST') {
    await k.press('Enter');
  }

  // Beat 1 (t = 0.0s -> 2.6s): Hover Care Guide button, check book at t = 1.32s so page-flip + margin note peak at t = 2.0s!
  await page.mouse.move(1545, 972, { steps: 10 });
  await waitUntil(1.32);
  await k.press('KeyC'); // Flips 2.5D Care Guide pages & reveals "Soil saturated — skip water"

  // Beat 2 (t = 2.65s): Resist the AI companion's overwatering trap!
  await waitUntil(2.65);
  await k.press('KeyS'); // Skips watering soaked roots safely

  // Step smoothly from Day 6 dusk into Day 7 morning at t = 3.75s
  await waitUntil(3.75);
  const sMid = await state();
  if (sMid && sMid.phase === 'CHANGED') {
    await k.press('Space');
  }

  // Beat 3 (t = 4.25s -> 6.50s): Day 7 soil is dry — hover [DO IT] & summon brass watering can so pour peaks across t = 5.0s!
  await page.mouse.move(1300, 972, { steps: 8 });
  await waitUntil(4.22);
  await k.press('Digit1'); // Brass watering can swoops in & pours shimmering arc droplets!

  // Beat 4 (t = 6.50s -> 8.35s): Hold golden-amber 18:00 dusk ("Fern looks happy! :)", orb sparkles, thriving fern) across t = 8.0s!
  await waitUntil(8.55);

  // Continue natural play loop for remaining seconds (checking book & resisting/following accurately)
  const end = t0 + seconds * 1000 - 250;
  while (Date.now() < end) {
    const s = await state();
    if (!s) break;
    if (s.phase === 'READY') {
      if (!s.checkedToday) {
        await page.mouse.move(1140, 625, { steps: 6 }); // Point spatially at Care Guide on table
        await k.press('KeyC');
        await page.waitForTimeout(1350);
      } else {
        if (s.adviceIsBad) {
          await k.press('KeyS');
        } else {
          await k.press('Digit1');
        }
        await page.waitForTimeout(1400);
      }
    } else {
      await page.waitForTimeout(250);
    }
  }
}
