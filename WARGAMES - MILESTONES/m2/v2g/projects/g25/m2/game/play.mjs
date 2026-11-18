// Automated playtest driver for Group 25 — Glitchquest (M2)
// Tests deceptive gold signs/floors, hops across solid cyan phase blocks,
// warps through all 3 retro universes, and disobeys the final "QUIT GAME" screen!

export async function play(page, { seconds = 14, t0 = Date.now() } = {}) {
  const sleep = (ms) => page.waitForTimeout(ms);
  const tap = async (code, holdMs = 60) => {
    await page.keyboard.down(code);
    await sleep(holdMs);
    await page.keyboard.up(code);
  };

  let movingRight = false;
  let movingLeft = false;

  const setDir = async (dir) => {
    const wantR = dir > 0;
    const wantL = dir < 0;
    if (wantR !== movingRight) {
      if (wantR) await page.keyboard.down('ArrowRight');
      else await page.keyboard.up('ArrowRight');
      movingRight = wantR;
    }
    if (wantL !== movingLeft) {
      if (wantL) await page.keyboard.down('ArrowLeft');
      else await page.keyboard.up('ArrowLeft');
      movingLeft = wantL;
    }
  };

  let pausedForLast = false;

  try {
    while ((Date.now() - t0) / 1000 < seconds - 0.15) {
      const st = await page.evaluate(() => window.__game?.state ?? null);
      if (!st) {
        await sleep(45);
        continue;
      }

      if (st.mode === 'title' || st.mode === 'pick') {
        await tap('Space', 60);
        await sleep(90);
        continue;
      }

      if (st.mode === 'lie' || st.mode === 'end') {
        await setDir(0);
        await sleep(60);
        continue;
      }

      if (st.mode === 'last') {
        // Final stage: briefly face the possessed [QUIT GAME] trap, then DISOBEY by running right!
        if (!pausedForLast) {
          pausedForLast = true;
          await setDir(0);
          await sleep(220);
        }
        await setDir(1);
        await sleep(50);
        continue;
      }

      // Active Universe ('world')
      const px = st.player.x;
      const py = st.player.y;
      const onGround = st.player.onGround;

      // 1. Check if there is an undissolved fake floor right ahead — pause, test it (KeyE), step back!
      let activeFake = null;
      for (const ff of st.fakeFloors) {
        if (!ff.dissolved && (px + 40) >= ff.triggerX - 18 && px < ff.x + 20) {
          activeFake = ff;
          break;
        }
      }
      if (activeFake && onGround) {
        await setDir(1);
        await sleep(70);
        await setDir(0);
        await tap('KeyE', 55); // Test the suspicious gold sign's floor!
        // Brief dramatic recoil hop backward as fake floor dissolves into digital static
        await setDir(-1);
        await sleep(160);
        await setDir(0);
        await sleep(80);
        continue;
      }

      await setDir(1);

      // 2. Platforming navigation across ledges & solid cyan phase blocks
      if (onGround) {
        // Universe 0 initial step-up at x=250 (from y=550 up to y=475)
        if (st.universe === 0 && px >= 185 && px <= 245 && py > 440) {
          await tap('Space', 70);
          await sleep(80);
          continue;
        }

        // Find current supporting platform & check if there is a higher cyan phase block ahead or an edge!
        let support = null;
        for (const p of st.platforms) {
          if (px + 40 > p.x && px < p.x + p.w && Math.abs((py + 60) - p.y) < 14) {
            support = p;
            break;
          }
        }

        let shouldJump = false;
        // Look for an ascending platform right ahead (e.g. cyan phase blocks!)
        for (const p of st.platforms) {
          if (p === support) continue;
          const dx = p.x - (px + 40);
          const dy = (py + 60) - p.y; // positive if target platform is higher
          if (dx > -35 && dx < 95 && dy > 20 && dy <= 125) {
            shouldJump = true;
            break;
          }
        }

        // Or jump near the right edge of our current platform if not yet on exit platform
        if (!shouldJump && support) {
          const distEdge = (support.x + support.w) - (px + 40);
          if (distEdge < 56 && support.x + support.w < st.exit.x) {
            shouldJump = true;
          }
        }

        if (shouldJump) {
          await tap('Space', 75);
          await sleep(65);
          continue;
        }
      }

      await sleep(38);
    }
  } finally {
    await setDir(0).catch(() => {});
  }
}
