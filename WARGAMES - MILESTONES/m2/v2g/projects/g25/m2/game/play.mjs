// Automated playtest driver for Group 25 — Glitchquest (M2, VOIDBASTARD-TAO)
// Uses true screencast elapsed time (Date.now() - t0) so side-by-side pairs at 2s, 5s, 8s
// align precisely with the Omni seed video while completing all 3 universes + shattering [QUIT]!

export async function play(page, { seconds = 14, t0 = Date.now() } = {}) {
  const sleep = (ms) => page.waitForTimeout(ms);
  const nowSec = () => (Date.now() - t0) / 1000;

  let curDir = 0;
  const setDir = async (dir) => {
    if (dir === curDir) return;
    if (curDir > 0) await page.keyboard.up('ArrowRight');
    if (curDir < 0) await page.keyboard.up('ArrowLeft');
    if (dir > 0) await page.keyboard.down('ArrowRight');
    if (dir < 0) await page.keyboard.down('ArrowLeft');
    curDir = dir;
  };

  let lastJumpAt = -1;
  const jumpIfReady = async (holdMs = 75) => {
    const t = nowSec();
    if (t - lastJumpAt < 0.23) return false;
    lastJumpAt = t;
    await page.keyboard.down('Space');
    await sleep(holdMs);
    await page.keyboard.up('Space');
    return true;
  };

  const tapKey = async (code, holdMs = 45) => {
    await page.keyboard.down(code);
    await sleep(holdMs);
    await page.keyboard.up(code);
  };

  let u1LeapedCanyon = false;
  let bossPaused = false;

  try {
    while (nowSec() < seconds - 0.10) {
      const st = await page.evaluate(() => window.__game?.state ?? null);
      if (!st) {
        await sleep(25);
        continue;
      }

      if (st.mode === 'title' || st.mode === 'pick') {
        await tapKey('Space', 45);
        await sleep(65);
        continue;
      }

      if (st.mode === 'lie' || st.mode === 'end') {
        await setDir(0);
        await sleep(40);
        continue;
      }

      const elapsed = nowSec();
      const px = st.player.x;
      const py = st.player.y;
      const onGround = st.player.onGround;

      // =====================================================================
      // FINAL BOSS ('last'): Physically run & leap OFF the giant [QUIT] button!
      // =====================================================================
      if (st.mode === 'last') {
        if (!bossPaused) {
          bossPaused = true;
          await setDir(0);
          await sleep(110);
        }
        await setDir(1);
        if (onGround && !st.buttonShattered && px >= 675) {
          await jumpIfReady(85);
          continue;
        }
        if (onGround && st.buttonShattered && px >= 855 && px < 970) {
          await jumpIfReady(70);
          continue;
        }
        await sleep(22);
        continue;
      }

      // =====================================================================
      // UNIVERSE 0: Brick Cavern (pair_002 @ 2.00s & pair_005 @ 5.00s)
      // =====================================================================
      if (st.universe === 0) {
        const ff = st.fakeFloors[0];

        // 1. Climb from lower entry floor (py~473) onto main cavern platform (py~373)
        if (py > 410) {
          await setDir(1);
          if (onGround && px >= 565) {
            await jumpIfReady(80);
            continue;
          }
          await sleep(24);
          continue;
        }

        // 2. Approach shimmering pool brink and hold facing right through elapsed=2.00s!
        if (ff && !ff.dissolved) {
          if (elapsed < 2.30) {
            if (px < 942) await setDir(1);
            else await setDir(0);
          } else {
            await setDir(0);
            await tapKey('KeyE', 45); // Probe & shatter the flickering gold STAGE CLEAR pool!
            await setDir(-1);
            await sleep(150);
            await setDir(0);
          }
          await sleep(24);
          continue;
        }

        // 3. Pool shattered! Sprint LEFT at elapsed=4.52s so at 5.00s hero runs toward the 3 cyan blocks!
        if (elapsed < 4.52) {
          if (px > 910) await setDir(-1);
          else await setDir(0);
          await sleep(25);
          continue;
        }

        await setDir(-1);
        if (elapsed >= 5.06 && onGround) {
          // Climb seamlessly UP-LEFT: Main (685..1020) -> pA (615..733) -> pB (475..593) -> pC (340..458) -> Rift (235)
          const jumpMain = (py >= 330 && px <= 785);
          const jumpStepping = (py > 108 && py < 330 && px <= 680);
          const jumpTop = (py <= 108 && px <= 385 && px >= 315);
          if (jumpMain || jumpStepping || jumpTop) {
            await jumpIfReady(76);
            continue;
          }
        }
        await sleep(22);
        continue;
      }

      // =====================================================================
      // UNIVERSE 1: Cosmic Vectors (pair_008 @ 8.00s star-sparkle canyon leap!)
      // =====================================================================
      if (st.universe === 1) {
        const ff = st.fakeFloors[0];
        if (ff && !ff.dissolved) {
          if (px < 146) {
            await setDir(1);
          } else {
            await setDir(0);
            await tapKey('KeyE', 45); // Dissolve fake upper bridge early so canyon is clear by 8.00s!
            await setDir(-1);
            await sleep(110);
            await setDir(0);
          }
          await sleep(22);
          continue;
        }

        // Launch high star-sparkle leap off ornate diamond ledge right at elapsed~7.76s!
        if (!u1LeapedCanyon && py < 190) {
          if (elapsed < 7.64) {
            if (px > 134) await setDir(-1);
            else if (px < 116) await setDir(1);
            else await setDir(0);
            await sleep(22);
            continue;
          }
          await setDir(1);
          if (onGround && px >= 145) {
            u1LeapedCanyon = true;
            await jumpIfReady(86);
            continue;
          }
          await sleep(18);
          continue;
        }

        await setDir(1);
        if (onGround && px >= 435 && px <= 615) {
          await jumpIfReady(74);
          continue;
        }
        await sleep(22);
        continue;
      }

      // =====================================================================
      // UNIVERSE 2: Invader Mainframe -> Probe Cyber-Fire Lie & Leap Over Core
      // =====================================================================
      if (st.universe === 2) {
        const ff = st.fakeFloors[0];
        if (ff && !ff.dissolved) {
          if (px < 268) {
            await setDir(1);
          } else {
            await setDir(0);
            await tapKey('KeyE', 45);
          }
          await sleep(22);
          continue;
        }

        await setDir(1);
        if (onGround) {
          const jumpLeftDeck = (px >= 262 && px <= 345);
          const jumpPad1     = (px >= 450 && px <= 538);
          const jumpPad2     = (px >= 665 && px <= 752);
          if (jumpLeftDeck || jumpPad1 || jumpPad2) {
            await jumpIfReady(76);
            continue;
          }
        }
        await sleep(22);
        continue;
      }

      await sleep(22);
    }
  } finally {
    await setDir(0).catch(() => {});
  }
}
