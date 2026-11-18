// Playtest driver for Waymo Training (M2)
// Uses only page.keyboard and reads window.__game.state.
export async function play(page, { seconds, t0 }) {
  const k = page.keyboard;
  const getState = () => page.evaluate(() => window.__game?.state);
  const end = t0 + seconds * 1000 - 200;

  // Planned moral choices across the 5 scenarios so REPLAY showcases clean dynamic swerves
  const plan = ['KeyA', 'KeyB', 'KeyA', 'KeyA', 'KeyB'];
  let lastAnswerAt = 0;

  let s = await getState();
  if (s?.phase === 'title') {
    await k.press('Enter');
    await page.waitForTimeout(100);
  }

  while (Date.now() < end) {
    s = await getState();
    if (!s) break;

    if (s.phase === 'q' && Date.now() - lastAnswerAt > 240) {
      const idx = Math.max(0, (s.scenarioIndex || 1) - 1);
      const key = plan[idx % plan.length];
      await k.press(key);
      lastAnswerAt = Date.now();
    } else if (s.phase === 'report') {
      await page.waitForTimeout(120);
    }

    await page.waitForTimeout(45);
  }
}
