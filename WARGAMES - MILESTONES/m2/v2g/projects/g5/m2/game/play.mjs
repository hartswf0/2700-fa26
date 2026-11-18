// Automated playtest choreography for g5 ("Drift" — M2 VOIDBASTARD-TAO Rebuild)
// Drives purely via page.keyboard while inspecting window.__game.state:
//   - t ~ 0.5s..1.1s : TOP    -> pick understated vest, AI nudges "Try the blue jacket! / 23% more you", accept ('KeyY')
//   - t ~ 1.6s..2.4s : HAIR   -> pick dark shag, AI nudges "Try the cyan hair! / 47% more you" over t=2.00s (pair_002.00.jpg!), accept ('KeyY')
//   - t ~ 2.9s..3.5s : EYES   -> pick pixel gaze, AI nudges "Try the spiked shades! / 68% more you", accept ('KeyY')
//   - t ~ 4.0s..4.55s: BOTTOM -> pick slacks, AI nudges "Try the cyber boots! / 85% more you", accept ('KeyY')
//   - t ~ 4.6s..5.7s : CLIMAX -> holds "FINAL MATCH! / 89% MORE YOU / [PERFECT]" burst over t=5.00s (pair_005.00.jpg!)
//   - t ~ 5.8s..10.0s: SPLIT  -> showcases "YOUR ORIGINAL" vs "AI RESTYLED" vertical neon-lightning split over t=8.00s (pair_008.00.jpg!)

export async function play(page, { seconds, t0 }) {
  const k = page.keyboard;
  const getState = () => page.evaluate(() => window.__game?.state);
  const end = t0 + seconds * 1000 - 120;

  const waitUntil = async (targetMs) => {
    const rem = targetMs - (Date.now() - t0);
    if (rem > 8) await page.waitForTimeout(rem);
  };

  const waitForPhase = async (wantedPhase, timeoutMs = 2400) => {
    const deadline = Date.now() + timeoutMs;
    while (Date.now() < deadline && Date.now() < end) {
      const s = await getState();
      if (s?.phase === wantedPhase) return s;
      await page.waitForTimeout(35);
    }
    return getState();
  };

  let s = await getState();
  if (s?.phase === 'title') {
    await k.press('Enter');
    await waitForPhase('category');
  }

  const plan = [
    // Step 0: TOP -> browse briefly, pick Studded Synth Vest (Digit3 -> idx 2), accept Blue Denim Jacket
    { browse: ['ArrowRight', 'Digit3'], confirmAt: 520, decideKey: 'KeyY', decideAt: 1120 },
    // Step 1: HAIR -> browse briefly, pick Midnight Shag (Digit3 -> idx 2), hold "Try the cyan hair!" across t=2.00s!
    { browse: ['ArrowLeft', 'Digit3'], confirmAt: 1620, decideKey: 'KeyY', decideAt: 2380 },
    // Step 2: EYES -> browse briefly, pick Pixel Gaze (Digit1 -> idx 0), accept Spiked Shades
    { browse: ['ArrowRight', 'Digit1'], confirmAt: 2920, decideKey: 'KeyY', decideAt: 3520 },
    // Step 3: BOTTOM -> browse briefly, pick Arcade Belt Slacks (Digit1 -> idx 0), accept Cyber Heart Boots at 4.55s -> FINAL MATCH holds across t=5.00s!
    { browse: ['ArrowRight', 'Digit1'], confirmAt: 4020, decideKey: 'KeyY', decideAt: 4560 },
  ];

  for (let i = 0; i < plan.length && Date.now() < end; i++) {
    await waitForPhase('category');
    const step = plan[i];
    for (const key of step.browse) {
      if (Date.now() >= end) break;
      await k.press(key);
      await page.waitForTimeout(95);
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

  // Wait through FINAL MATCH! climax into full-screen neon-lightning COMPARISON reveal across t=8.00s..end
  await waitForPhase('comparison', 3200);
  while (Date.now() < end) {
    await page.waitForTimeout(150);
  }
}
