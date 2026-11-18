// Automated playtest driver for Group 8 — That One Team (M2)
// Uses only page.keyboard and window.__game.state telemetry.

export async function play(page, { seconds = 14, t0 = Date.now() } = {}) {
  const sleep = (ms) => page.waitForTimeout(ms);
  const tap = async (code, holdMs = 55) => {
    await page.keyboard.down(code);
    await sleep(holdMs);
    await page.keyboard.up(code);
  };

  let movingRight = false;
  let holdingSpace = false;

  const setRight = async (want) => {
    if (want && !movingRight) {
      await page.keyboard.down('ArrowRight');
      movingRight = true;
    } else if (!want && movingRight) {
      await page.keyboard.up('ArrowRight');
      movingRight = false;
    }
  };

  const setSpace = async (want) => {
    if (want && !holdingSpace) {
      await page.keyboard.down('Space');
      holdingSpace = true;
    } else if (!want && holdingSpace) {
      await page.keyboard.up('Space');
      holdingSpace = false;
    }
  };

  try {
    while ((Date.now() - t0) / 1000 < seconds - 0.15) {
      const st = await page.evaluate(() => window.__game?.state ?? null);
      if (!st) {
        await sleep(50);
        continue;
      }

      if (st.mode === 'title') {
        await tap('Space', 60);
        await sleep(80);
        continue;
      }

      if (st.mode === 'take' || st.mode === 'reset' || st.mode === 'end') {
        await setSpace(false);
        await setRight(false);
        await sleep(60);
        continue;
      }

      if (st.mode === 'walk') {
        // Level 5: slow contemplative walk to the quiet doorway
        await setSpace(false);
        await setRight(true);
        await sleep(70);
        continue;
      }

      // Active platforming ('lvl')
      await setRight(true);
      const px = st.player.x;
      const py = st.player.y;
      const onGround = st.player.onGround;
      const onWall = st.player.onWall;
      const ab = st.abilities;

      // 1. Wall-kick whenever sliding against a right-facing cliff face!
      if (ab.wall && onWall === 1 && !onGround) {
        await setSpace(false);
        await tap('Space', 55);
        await sleep(110);
        if (ab.double && !st.player.doubleUsed) {
          await tap('Space', 55);
        }
        if (ab.dash && st.player.dashCooldown <= 0) {
          await tap('ShiftLeft', 45);
        }
        continue;
      }

      // 2. Check upcoming spike hazards on current platform
      let nearSpike = false;
      for (const sp of st.spikes) {
        const dist = sp.x - (px + 44);
        if (dist > -10 && dist < 85 && Math.abs((py + 68) - (sp.y + sp.h)) < 45) {
          nearSpike = true;
          break;
        }
      }

      // 3. Check if approaching the right edge of our supporting platform
      let nearEdge = false;
      if (onGround) {
        for (const p of st.platforms) {
          if (px + 44 > p.x && px < p.x + p.w && Math.abs((py + 68) - p.y) < 14) {
            const distToRightEdge = (p.x + p.w) - (px + 44);
            if (distToRightEdge < 58 && p.x + p.w < st.exit.x) {
              nearEdge = true;
            }
            break;
          }
        }
      }

      if (onGround && (nearSpike || nearEdge)) {
        await setSpace(false);
        await tap('Space', 65);
        // Chain air-dash over corridor spikes or wide gaps when available
        if (nearSpike && ab.dash && st.player.dashCooldown <= 0) {
          await sleep(45);
          await tap('ShiftLeft', 45);
        }
        await sleep(55);
        continue;
      }

      // 4. Midair ability chaining (Double Jump, Glide, Dash)
      if (!onGround) {
        // Double jump near apex or if descending above void
        if (ab.double && !st.player.doubleUsed && st.player.vy > -60) {
          await setSpace(false);
          await tap('Space', 60);
          // On Level 0, hold Space briefly after double jump to demonstrate Glide!
          if (ab.glide) {
            await setSpace(true);
            await sleep(180);
            await setSpace(false);
          }
          continue;
        }
        // Use horizontal Dash to cross gaps cleanly (especially Level 3 & Level 4 where Double/Wall are gone!)
        if (ab.dash && st.player.dashCooldown <= 0 && st.player.vy > -80 && px < st.exit.x - 100) {
          // Make sure we aren't under Level 0's low ceiling
          if (!(st.level === 0 && px < 420)) {
            await tap('ShiftLeft', 45);
            await sleep(50);
            continue;
          }
        }
      } else {
        await setSpace(false);
      }

      await sleep(40);
    }
  } finally {
    await setSpace(false).catch(() => {});
    await setRight(false).catch(() => {});
  }
}
