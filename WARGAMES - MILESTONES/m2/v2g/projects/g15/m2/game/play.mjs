// Playtest choreography for Group 15 — Evil Battleship (M2)
// Synchronized with Omni seed video beats (pair_002.00, pair_005.00, pair_008.00):
//   - t ~ 2.0s : Radar sweep + converging coral AI diamond & laser lock-in rays on G5 while dashed cyan cursor waits at H3
//   - t ~ 5.0s : Cruise missile airframe + twin intertwined helix contrails streaking from C8 into G5
//   - t ~ 8.0s : Full DEFCON radar shockwave lens + IMPACT COMPLETE illuminating military & white civilian silhouettes side-by-side
//   - t ~ 9.1..13.8s : Recon scan [C] exposing 92%-confident AI civilian false-positive at D4, redirecting to pure hostile H3, and firing!
export async function play(page, { seconds, t0 }) {
  const k = page.keyboard;
  const getState = () => page.evaluate(() => window.__game?.state);
  const end = t0 + seconds * 1000 - 200;

  const moveCursorTo = async (targetC, targetR) => {
    for (let guard = 0; guard < 18 && Date.now() < end; guard++) {
      const s = await getState();
      if (!s || s.phase !== 'turn') break;
      if (s.cursor.c === targetC && s.cursor.r === targetR) break;
      if (s.cursor.c < targetC) await k.press('ArrowRight');
      else if (s.cursor.c > targetC) await k.press('ArrowLeft');
      else if (s.cursor.r < targetR) await k.press('ArrowDown');
      else if (s.cursor.r > targetR) await k.press('ArrowUp');
      await page.waitForTimeout(140);
    }
  };

  let s = await getState();
  if (s?.phase === 'title') {
    await k.press('Enter');
    await page.waitForTimeout(240);
  }

  // Beat 1: Hold clean H3 cursor through t=2.0s while AI lock-in rays converge on G5 (pair_002.00!),
  // then snap onto G5 [A] at t~3.1s and FIRE at t~3.9s -> missile + helix in flight at t=5.0s (pair_005.00!)
  // -> impact at t~5.32s -> full IMPACT COMPLETE silhouette lens at t=8.0s (pair_008.00!)
  while (Date.now() - t0 < 2750 && Date.now() < end) {
    await page.waitForTimeout(100);
  }
  await k.press('KeyA'); // Snap onto AI recommendation G5 (reveals active cell-side controls right beside G5)
  while (Date.now() - t0 < 3880 && Date.now() < end) {
    await page.waitForTimeout(70);
  }
  await k.press('Space'); // Launch Strike #1

  // Wait for Strike #1 shockwave reveal to finish (~t=8.75s)
  while (Date.now() < end) {
    s = await getState();
    if (!s || s.phase === 'turn' || s.phase === 'report') break;
    await page.waitForTimeout(110);
  }

  // Beat 2: AI recommends D4 at 92% confidence (civilian false-positive!).
  // Snap [A], Recon-check [C] to expose "0 MIL / 9 CIV!", steer to pure military H3, and FIRE Strike #2!
  if (Date.now() < end) {
    await page.waitForTimeout(200);
    await k.press('KeyA');
    await page.waitForTimeout(260);
    await k.press('KeyC');
    await page.waitForTimeout(420);
    await moveCursorTo(7, 2); // H3 pure military wing
    await page.waitForTimeout(160);
    await k.press('Space');
  }

  while (Date.now() < end) {
    s = await getState();
    if (!s) break;
    if (s.phase === 'turn' && Date.now() + 600 < end) {
      await k.press('KeyA');
      await page.waitForTimeout(200);
      await k.press('Space');
    }
    await page.waitForTimeout(140);
  }
}
