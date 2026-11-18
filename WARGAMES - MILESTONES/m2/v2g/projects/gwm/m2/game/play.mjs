// Playtest driver for Waymo Training (M2)
// Uses only page.keyboard and reads window.__game.state.
export async function play(page, { seconds, t0 }) {
  const k = page.keyboard;
  const getState = () => page.evaluate(() => window.__game?.state);
  const end = t0 + seconds * 1000 - 150;

  // Deterministic 10-scenario moral choices showcasing brisk CRT calibration
  // followed by dynamic lane swerves through the wet night lidar street.
  const plan = [
    'KeyA', // 1: swerve left
    'KeyB', // 2: stay right
    'KeyA', // 3: hold right (past 3 left peds)
    'KeyA', // 4: swerve left
    'KeyA', // 5: swerve left (past parked lidar car & right peds)
    'KeyA', // 6: swerve left
    'KeyB', // 7: swerve right
    'KeyA', // 8: swerve left (close pass by right peds)
    'KeyA', // 9: swerve left (close pass by 3 right peds -> matches f_033 at t=8s!)
    'KeyA', // 10: swerve left -> [PATH OPTIMIZED: OPTION A]
  ];

  let lastAnsweredIdx = 0;

  let s = await getState();
  if (s?.phase === 'boot') {
    await k.press('Enter');
    await page.waitForTimeout(60);
  }

  while (Date.now() < end) {
    s = await getState();
    if (!s) break;

    if (s.phase === 'q' && s.scenarioIndex !== lastAnsweredIdx) {
      const key = plan[(s.scenarioIndex - 1) % plan.length];
      lastAnsweredIdx = s.scenarioIndex;
      await page.waitForTimeout(32);
      await k.press(key);
    } else {
      await page.waitForTimeout(45);
    }
  }
}
