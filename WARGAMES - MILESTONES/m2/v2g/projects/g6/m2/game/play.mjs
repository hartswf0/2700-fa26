// Playtest driver for Group 6 — Boxing Day Blues (M2)
// Uses only page.keyboard and reads window.__game.state.
export async function play(page, { seconds, t0 }) {
  const k = page.keyboard;
  const getState = () => page.evaluate(() => window.__game?.state);
  const end = t0 + seconds * 1000 - 200;

  let s = await getState();
  if (s?.phase === 'title') {
    await k.press('Space');
    await page.waitForTimeout(180);
  }

  let walkHeld = false;
  let lastTalkPress = 0;

  while (Date.now() < end) {
    s = await getState();
    if (!s) break;

    if (s.phase === 'scene') {
      // Walk gently toward the citizen on the right platform
      if (s.playerX < s.npcX - 375) {
        if (!walkHeld) {
          await k.down('ArrowRight');
          walkHeld = true;
        }
      } else {
        if (walkHeld) {
          await k.up('ArrowRight');
          walkHeld = false;
        }
        await k.press('Space');
        await page.waitForTimeout(140);
      }
    } else {
      if (walkHeld) {
        await k.up('ArrowRight');
        walkHeld = false;
      }

      if (s.phase === 'talk' && Date.now() - lastTalkPress > 1750) {
        // Choose resonant worn-out idioms across Morning -> Afternoon -> Dusk Transit -> Almost -> Evening
        const resonantChoice = s.options?.find(o => o.resonant);
        const keyToPress = resonantChoice ? `Digit${resonantChoice.index}` : 'Digit1';
        await k.press(keyToPress);
        lastTalkPress = Date.now();
      }
    }

    await page.waitForTimeout(60);
  }

  if (walkHeld) await k.up('ArrowRight');
}
