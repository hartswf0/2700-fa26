// Playtest choreography for Group 16 — Channel 0 (M2, VOIDBASTARD-TAO Rebuild)
// Synchronized with Omni 1.2 Flash seed video beats across the 14s verification capture:
//   - t = 0.00..1.82s : READY on CH 07 ("you can stop thinking now") — spotless charcoal bedroom, 7-block CRT tear (f_001.jpg)
//   - t = 1.82s       : Flip #1 -> CH 01 ("DO NOT LOOK BACK") so t = 2.00s (pair_002.00) captures authentic analog
//                       VHS/CRT horizontal sync-roll + dark V-blank bar in a clean bedroom before bezel eruption (f_009.jpg)!
//   - t = 4.12s       : Flip #2 -> CH 03 ("IT IS WATCHING") so t = 5.00s (pair_005.00) captures the settled charcoal-sketched
//                       stairwell + wide-open hand-crosshatched eye + mid-stage bezel checkers & neon-magenta tendrils (f_022.jpg)!
//   - t = 5.65..7.60s : Compulsive channel-flip surge through CH 02, CH 05, CH 04, CH 06 into CH 08 ("SYSTEM ERROR") so
//                       t = 8.00s (pair_008.00) captures zoomed-in dense #ff00dc/#000000 checkerboard takeover + darkened
//                       magenta-rimmed hand silhouette (f_033.jpg)!
//   - t = 7.60..14.0s : Complete untouched stillness (~4.5s) organically lowers the physical remote out of frame, retracts
//                       the magenta tendrils back into the bezel, and resolves to calm CH 00 clear signal!
export async function play(page, { seconds, t0 }) {
  const k = page.keyboard;
  const getState = () => page.evaluate(() => window.__game?.state);
  const end = t0 + seconds * 1000 - 150;

  let s = await getState();
  if (s?.phase === 'title') {
    await k.press('Space');
    await page.waitForTimeout(250);
  }

  const flipScheduleMs = [1820, 4120, 5650, 6180, 6680, 7150, 7600];
  let idx = 0;

  while (Date.now() < end && idx < flipScheduleMs.length) {
    const elapsed = Date.now() - t0;
    if (elapsed >= flipScheduleMs[idx]) {
      s = await getState();
      if (!s || s.phase === 'end' || s.phase === 'complete') break;
      await k.press(idx % 3 === 2 ? 'ArrowUp' : 'Space');
      idx++;
    }
    await page.waitForTimeout(25);
  }

  // Hold untouched stillness from t = 7.60s -> 14.0s so ~4.5s stillness lowers the remote & restores CH 00!
  while (Date.now() < end) {
    await page.waitForTimeout(100);
  }
}
