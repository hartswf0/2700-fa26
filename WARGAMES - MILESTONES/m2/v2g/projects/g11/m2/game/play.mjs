// Automated M2 playtest scenario for Group 11: "Orpheus"
// Drives Orpheus & Eurydice continuously through all 5 subterranean bays (B5..B1)
// with zero modal interruptions—showcasing natural lateral steering, in-world golden
// AI Guide doorway seals, barrier spark feedback, resisting [B] in the silent junction,
// and crossing the radiant Surface threshold.
export async function play(page, { seconds, t0 }) {
  const k = page.keyboard;
  const getState = () => page.evaluate(() => window.__game?.state);
  const end = t0 + seconds * 1000 - 140;

  const init = await getState();
  if (init?.phase === 'title') {
    await k.press('Enter');
    await page.waitForTimeout(60);
  }

  await k.down('ArrowUp');
  let testedSealInB4 = false;

  while (Date.now() < end) {
    const s = await getState();
    if (!s) break;

    if (s.phase === 'room') {
      await k.down('ArrowUp');

      if (s.room === 1) {
        // Gentle curiosity toward the open left side before centering
        if (s.roomProgress > 0.22 && s.roomProgress < 0.44 && s.x > -0.52) {
          await k.down('ArrowLeft');
          await k.up('ArrowRight');
        } else if (s.roomProgress >= 0.44 && s.x < -0.22) {
          await k.up('ArrowLeft');
          await k.down('ArrowRight');
        } else {
          await k.up('ArrowLeft');
          await k.up('ArrowRight');
        }
      } else if (s.room === 2 && !testedSealInB4 && s.roomProgress >= 0.42 && s.roomProgress <= 0.64) {
        // Push briefly toward the right sealed doorway to spark the golden AI barrier in-world
        await k.down('ArrowRight');
        await k.up('ArrowLeft');
        if (s.roomProgress >= 0.60) testedSealInB4 = true;
      } else {
        await k.up('ArrowLeft');
        await k.up('ArrowRight');
      }
    } else {
      await k.up('ArrowUp');
      await k.up('ArrowLeft');
      await k.up('ArrowRight');
    }

    await page.waitForTimeout(45);
  }

  for (const key of ['ArrowUp', 'ArrowLeft', 'ArrowRight']) {
    await k.up(key).catch(() => {});
  }
}
