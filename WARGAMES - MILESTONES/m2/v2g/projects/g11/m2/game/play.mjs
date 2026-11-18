// Automated M2 playtest scenario for Group 11: "Orpheus"
// Drives Orpheus & Eurydice smoothly through all 5 subterranean rooms using only keyboard inputs,
// showcasing lateral corridor weaving, the golden AI Guide door seals, greyed-out choice prompts,
// resisting the urge to look back, and stepping into THE SURFACE archway.
export async function play(page, { seconds, t0 }) {
  const k = page.keyboard;
  const getState = () => page.evaluate(() => window.__game?.state);
  const end = t0 + seconds * 1000 - 150;

  const init = await getState();
  if (init?.phase === 'title') {
    await k.press('Enter');
    await page.waitForTimeout(80);
  }

  await k.down('ArrowUp');
  let choiceHandledRoom = -1;
  let choiceEnteredAt = 0;

  while (Date.now() < end) {
    const s = await getState();
    if (!s) break;

    if (s.phase === 'choose') {
      if (choiceHandledRoom !== s.room) {
        choiceHandledRoom = s.room;
        choiceEnteredAt = Date.now();
        await k.up('ArrowUp');
        await k.up('ArrowLeft');
        await k.up('ArrowRight');
      }
      // Pause ~420ms on Rooms 1, 2, and 5 so the Stanley-Parable Guide prompt & greyed options read clearly,
      // and confirm briskly on Rooms 3 & 4 so the continuous corridor walk matches the 10s Omni reference clip!
      const holdMs = (s.room === 1 || s.room === 2 || s.room === 5) ? 420 : 220;
      if (Date.now() - choiceEnteredAt >= holdMs) {
        if (s.room === 2 && Date.now() - choiceEnteredAt < holdMs + 140) {
          // Briefly test a greyed-out option in Room 2 to show Guide override feedback
          await k.press('ArrowRight');
          await page.waitForTimeout(90);
          await k.press('Enter');
          await page.waitForTimeout(120);
        }
        await k.press('Enter');
        await k.down('ArrowUp');
      }
    } else if (s.phase === 'room') {
      await k.down('ArrowUp');
      // Subtle purposeful corridor weave in early rooms while autonomy still permits steering
      const elapsed = (Date.now() - t0) / 1000;
      const wave = Math.sin(elapsed * 2.1);
      if (s.room <= 2 && wave > 0.55 && s.x < 0.22) {
        await k.down('ArrowRight');
        await k.up('ArrowLeft');
      } else if (s.room <= 2 && wave < -0.55 && s.x > -0.28) {
        await k.down('ArrowLeft');
        await k.up('ArrowRight');
      } else {
        await k.up('ArrowLeft');
        await k.up('ArrowRight');
      }
    } else if (s.phase === 'surface' || s.phase === 'end') {
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
