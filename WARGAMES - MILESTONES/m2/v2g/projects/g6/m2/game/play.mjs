// Playtest driver for Group 6 — Boxing Day Blues (M2, VOIDBASTARD-TAO)
// Films a poetic 14s continuous take across citizens & transit stops:
// - t~2.0s: mid-stride approach across snowy twilight platform (clean open world)
// - t~2.4s..3.2s: spatial floating speech-glyph pills bloom beside waiting citizen
// - t~5.0s: rising peach & violet speech-bubbles nearly harmonize as sleek train glides behind
// - t~8.0s: chord gently detunes & bubbles dissolve into snow wisps as silhouettes bow slightly
// - t~8.4s..14.0s: walk onward through Afternoon -> Dusk -> Evening stops ("Boxing Day blues")
export async function play(page, { seconds, t0 }) {
  const k = page.keyboard;
  const getState = () => page.evaluate(() => window.__game?.state);
  const end = t0 + seconds * 1000 - 180;

  let walkHeld = false;
  let pillShownSince = null;
  let lastChoiceAt = 0;

  const holdRight = async (want) => {
    if (want && !walkHeld) {
      await k.down('ArrowRight');
      walkHeld = true;
    } else if (!want && walkHeld) {
      await k.up('ArrowRight');
      walkHeld = false;
    }
  };

  while (Date.now() < end) {
    const s = await getState();
    if (!s) break;
    const elapsed = (Date.now() - t0) / 1000;

    if (s.phase === 'rest') {
      await k.press('Space');
      await page.waitForTimeout(80);
      continue;
    }

    if (s.phase === 'ready') {
      if (!s.pillsVisible) {
        pillShownSince = null;
        await holdRight(true);
      } else {
        // Stop comfortably at x ~ 435 (matching study/f_014.jpg staging) so spatial pills breathe
        if (s.stopIndex === 0 && s.playerX < 432) {
          await holdRight(true);
        } else {
          await holdRight(false);
          if (pillShownSince === null) pillShownSince = elapsed;
          // On Stop 0, let spatial pills bloom visibly until ~2.95s so t=5.0s hits peak harmony
          // and t=8.0s hits snow dissolution; on Stops 1..3, respond fluidly after a natural beat
          const dwell = s.stopIndex === 0 ? 0.95 : 0.35;
          if (elapsed - pillShownSince >= dwell && Date.now() - lastChoiceAt > 750) {
            const resonant = s.options?.find((o) => o.resonant);
            const key = resonant ? `Digit${resonant.index}` : 'Digit1';
            await k.press(key);
            lastChoiceAt = Date.now();
            pillShownSince = null;
          }
        }
      }
    } else if (s.phase === 'working') {
      await holdRight(false);
    } else if (s.phase === 'changed') {
      // On Stop 0, linger still through t=8.0s so pair_008 captures the detuned snow dissolution,
      // then walk onward rightward down the platform through Afternoon, Dusk, and Evening!
      if (s.stopIndex === 0 && elapsed < 8.35) {
        await holdRight(false);
      } else {
        await holdRight(true);
      }
    } else {
      await holdRight(false);
    }

    await page.waitForTimeout(50);
  }

  await holdRight(false);
}
