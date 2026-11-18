// Playtest choreography for Group 16 — Channel 0 (M2)
// Synchronized with Omni reference video beats:
//   - t = 0.0..1.1s : Clean greyscale bedroom, CRT on CH 07 ("you can stop thinking now", f_001.jpg)
//   - t ~ 2.0s      : Remote click -> CH 01 staircase ("DO NOT LOOK BACK") + pink/black checker glitches around bezel (pair_002.00 / f_015.jpg)
//   - t ~ 5.0s      : Remote click -> CH 03 blinking watching eye ("IT IS WATCHING") + spreading magenta wall fractures (pair_005.00 / f_022.jpg)
//   - t ~ 6.2..13.5s: Accelerating remote flips across all 8 channels (face, corridor, woods, cracked door, CH 08 static "SYSTEM ERROR")
//                     as missing-texture checkers flood the room into SPILL & TAKEN OVER!
export async function play(page, { seconds, t0 }) {
  const k = page.keyboard;
  const getState = () => page.evaluate(() => window.__game?.state);
  const end = t0 + seconds * 1000 - 200;

  let s = await getState();
  if (s?.phase === 'title') {
    await k.press('Space');
    await page.waitForTimeout(300);
  }

  // Flip schedule (ms from t0): keeps active CRT horror action through t=8.0s and triggers TAKEN OVER near t=12.8s!
  const flipScheduleMs = [1150, 3850, 6150, 7150, 8250, 9350, 10300, 11150, 11950, 12650, 13250];
  let idx = 0;

  while (Date.now() < end && idx < flipScheduleMs.length) {
    const elapsed = Date.now() - t0;
    if (elapsed >= flipScheduleMs[idx]) {
      s = await getState();
      if (!s || s.phase === 'end') break;
      await k.press(idx % 3 === 2 ? 'ArrowUp' : 'Space');
      idx++;
    }
    await page.waitForTimeout(60);
  }

  while (Date.now() < end) {
    await page.waitForTimeout(120);
  }
}
