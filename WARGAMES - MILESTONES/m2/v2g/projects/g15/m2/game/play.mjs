// Playtest choreography for Group 15 — Evil Battleship (M2)
// Synchronized with Omni reference video beats:
//   - t ~ 2.0s : Radar sweep + AI locking diamond on central sector F5 while dashed cyan cursor waits at H3 (pair_002.00)
//   - t ~ 5.0s : Ballistic missile streaking along glowing cyan helix arc toward F5 (pair_005.00)
//   - t ~ 8.0s : Full multi-ring DEFCON shockwave illuminating military + white civilian silhouettes side-by-side (pair_008.00)
//   - t ~ 9.0..13.8s : Recon scan [C] exposing 92%-confident AI civilian false-positive at D4, redirecting to H3, and firing!
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
      await page.waitForTimeout(150);
    }
  };

  let s = await getState();
  if (s?.phase === 'title') {
    await k.press('Enter');
    await page.waitForTimeout(280);
    s = await getState();
  }
  if (s?.phase === 'brief') {
    await k.press('Enter');
    await page.waitForTimeout(240);
  }

  // Beat 1: Keep cursor at H3 through t=2.0s while AI targeting diamond locks onto F5 (matches pair_002.00!),
  // then step/lock onto F5 at t~3.1s and FIRE at t~3.9s -> in-flight helix arc at t=5.0s -> full shockwave silhouettes at t=8.0s!
  while (Date.now() - t0 < 2450 && Date.now() < end) {
    await page.waitForTimeout(120);
  }
  await k.press('ArrowLeft');
  await page.waitForTimeout(350);
  await k.press('KeyA'); // Snap onto AI recommendation F5
  while (Date.now() - t0 < 3850 && Date.now() < end) {
    await page.waitForTimeout(80);
  }
  await k.press('Space'); // Launch Strike #1 (in flight at t=5.0s, impacts at ~5.4s, full silhouette bloom through t=8.5s!)

  // Wait for Strike #1 shockwave reveal to finish
  while (Date.now() < end) {
    s = await getState();
    if (!s || s.phase === 'turn' || s.phase === 'report') break;
    await page.waitForTimeout(120);
  }

  // Beat 2: AI recommends D4 (92% confidence — civilian false-positive!).
  // Lock [A], Recon-check [C] to expose "9 CIVILIANS ONLY", steer to hostile H3, and FIRE Strike #2!
  if (Date.now() < end) {
    await page.waitForTimeout(220);
    await k.press('KeyA');
    await page.waitForTimeout(280);
    await k.press('KeyC');
    await page.waitForTimeout(450);
    await moveCursorTo(7, 2); // H3 pure military wing
    await page.waitForTimeout(180);
    await k.press('Space');
  }

  while (Date.now() < end) {
    s = await getState();
    if (!s) break;
    if (s.phase === 'turn' && Date.now() + 600 < end) {
      await k.press('KeyA');
      await page.waitForTimeout(220);
      await k.press('Space');
    }
    await page.waitForTimeout(140);
  }
}
