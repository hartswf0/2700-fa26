// Automated playtest scenario for g5 ("Drift" — M2)
// Drives purely via page.keyboard while reading window.__game.state:
//   - Browses wardrobe options across all 4 categories (HAIR, EYES, TOP, BOTTOM)
//   - Triggers all 3 escalating AI stylist pop-up tiers
//   - Accepts 3 AI suggestions ('KeyY') and keeps 1 original choice ('KeyK') -> 75% AI DRIFT
//   - Reveals the side-by-side ORIGINAL vs RESTYLED comparison screen for the climax!

export async function play(page, { seconds, t0 }) {
  const k = page.keyboard;
  const getState = () => page.evaluate(() => window.__game?.state);
  const end = t0 + seconds * 1000 - 150;

  const waitUntil = async (targetMs) => {
    const rem = targetMs - (Date.now() - t0);
    if (rem > 10) await page.waitForTimeout(rem);
  };

  const waitForPhase = async (wantedPhase, timeoutMs = 2500) => {
    const deadline = Date.now() + timeoutMs;
    while (Date.now() < deadline && Date.now() < end) {
      const s = await getState();
      if (s?.phase === wantedPhase) return s;
      await page.waitForTimeout(45);
    }
    return getState();
  };

  let s = await getState();
  if (s?.phase === 'title') {
    await k.press('Enter');
    await waitForPhase('category');
  }

  // Choreographed plan across the 4 categories (Accept 3, Keep 1 -> 75% AI Drift):
  //   0: HAIR   -> browse to option 2 (Midnight Shag), confirm, hold Level 1 nudge over t=2.0s, accept ('KeyY' -> Cyan Wave)
  //   1: EYES   -> browse to option 0 (Pixel Gaze), confirm, show Level 2 "23% more YOU!", accept ('KeyY' -> Spiked Shades)
  //   2: TOP    -> browse to option 0 (Blue Denim Jacket), confirm, hold Level 3 pushy modal over t=5.0s, refuse ('KeyK' -> keep mine!)
  //   3: BOTTOM -> browse to option 0 (Arcade Belt Slacks), confirm, show Level 3 MAX climax modal, accept ('KeyY' -> Cyber Heart Boots)
  const plan = [
    { browse: ['ArrowRight', 'ArrowRight'], confirmAt: 950, decideKey: 'KeyY', decideAt: 2250 },
    { browse: ['ArrowRight', 'ArrowLeft'], confirmAt: 3150, decideKey: 'KeyY', decideAt: 3850 },
    { browse: ['ArrowRight', 'ArrowRight', 'Digit1'], confirmAt: 4550, decideKey: 'KeyK', decideAt: 5450 },
    { browse: ['ArrowRight', 'Digit1'], confirmAt: 6150, decideKey: 'KeyY', decideAt: 6850 },
  ];

  for (let i = 0; i < plan.length && Date.now() < end; i++) {
    await waitForPhase('category');
    const step = plan[i];
    for (const key of step.browse) {
      if (Date.now() >= end) break;
      await k.press(key);
      await page.waitForTimeout(190);
    }
    await waitUntil(step.confirmAt);
    if ((await getState())?.phase === 'category') {
      await k.press('Enter');
    }
    await waitForPhase('suggestion');
    await waitUntil(step.decideAt);
    if ((await getState())?.phase === 'suggestion') {
      await k.press(step.decideKey);
    }
  }

  // Admire the dramatic side-by-side COMPARISON screen through t=8.0s..14.0s
  await waitForPhase('comparison', 3000);
  while (Date.now() < end) {
    await page.waitForTimeout(150);
  }
}
