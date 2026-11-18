// Automated playtest driver for Group 8 — That One Team (M2)
// Uses only page.keyboard and window.__game.state telemetry.

export async function play(page, { seconds = 14, t0 = Date.now() } = {}) {
  const sleep = (ms) => page.waitForTimeout(ms);
  const tap = async (code, holdMs = 44) => {
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

  let spikeCleared = false;
  let mouthChainDone = false;
  let monolithVaulted = false;

  try {
    while ((Date.now() - t0) / 1000 < seconds - 0.12) {
      const st = await page.evaluate(() => window.__game?.state ?? null);
      if (!st) {
        await sleep(25);
        continue;
      }

      if (st.mode === 'title') {
        await tap('Space', 50);
        await sleep(45);
        continue;
      }

      if (st.mode === 'reset' || st.mode === 'end') {
        await setSpace(false);
        await setRight(false);
        await sleep(45);
        continue;
      }

      if (st.mode === 'walk') {
        await setSpace(false);
        await setRight(true);
        await sleep(40);
        continue;
      }

      await setRight(true);
      const p = st.player;
      const ab = st.abilities;
      const px = p.x;
      const py = p.y;

      if (st.level === 0) {
        // 1) Hop corridor golden spikes (x=352..438) under low ceiling
        if (!spikeCleared && px >= 275 && px < 355 && p.onGround) {
          spikeCleared = true;
          await setSpace(false);
          await tap('Space', 46);
          await sleep(40);
          continue;
        }

        // 2) Corridor mouth burst (x >= 530 -> bursts out right at t=2.00s!)
        if (!mouthChainDone && px >= 530 && p.onGround) {
          mouthChainDone = true;
          await setSpace(false);
          await tap('Space', 58);
          await sleep(165);
          if (ab.double) {
            await tap('Space', 45);
          }
          await sleep(55);
          if (ab.dash) {
            await tap('ShiftLeft', 42);
          }
          if (ab.glide) {
            await sleep(90);
            await setSpace(true);
            await sleep(170);
            await setSpace(false);
          }
          continue;
        }

        // 3) Island hops across the purple cavern (Island A -> B -> D -> Violet Monolith)
        if (p.onGround && ((px >= 900 && px <= 970) || (px >= 1225 && px <= 1295))) {
          await setSpace(false);
          await tap('Space', 56);
          if (ab.glide) {
            await sleep(140);
            await setSpace(true);
            await sleep(110);
            await setSpace(false);
          }
          continue;
        }

        // 4) Leap from Island D (x=1385..1610) onto Towering Violet Monolith (x=1695)
        if (p.onGround && px >= 1545 && px <= 1620) {
          await setSpace(false);
          await tap('Space', 62);
          await sleep(50);
          continue;
        }

        // 5) Wall-Slide sparks on Violet Monolith -> Wall-Kick -> Double-Jump -> Golden Swirling Dash into Arch #1 at t=5.00s!
        if (ab.wall && p.onWall === 1 && !p.onGround && px >= 1635) {
          await sleep(85);
          await setSpace(false);
          await tap('Space', 52); // Wall-kick!
          await sleep(145);
          if (ab.double) {
            await tap('Space', 52); // Vault crest y=318!
          }
          await sleep(135);
          if (ab.dash) {
            await tap('ShiftLeft', 45); // Blazing golden dash straight into Arch #1 (x=2020)!
          }
          monolithVaulted = true;
          continue;
        }

        if (monolithVaulted && !p.onGround && px >= 1745 && px < 1950 && ab.dash && p.dashCooldown <= 0) {
          await tap('ShiftLeft', 42);
          await sleep(40);
          continue;
        }
      }

      // Reactive wall-kick if touching any right cliff
      if (ab.wall && p.onWall === 1 && !p.onGround) {
        await setSpace(false);
        await tap('Space', 48);
        await sleep(90);
        if (ab.double && !p.doubleUsed) {
          await tap('Space', 46);
        }
        if (ab.dash && p.dashCooldown <= 0) {
          await tap('ShiftLeft', 40);
        }
        continue;
      }

      // Platform right-edge leap + ability chain across Sectors 1, 2, 3
      let nearEdge = false;
      if (p.onGround) {
        for (const pl of st.platforms) {
          if (px + p.w > pl.x && px < pl.x + pl.w && Math.abs((py + p.h) - pl.y) < 14) {
            const distRight = (pl.x + pl.w) - (px + p.w);
            if (distRight < 68 && pl.x + pl.w < 3600) {
              nearEdge = true;
            }
            break;
          }
        }
      }

      if (p.onGround && nearEdge) {
        await setSpace(false);
        await tap('Space', 58);
        await sleep(80);
        if (ab.double) {
          await tap('Space', 48);
          await sleep(50);
        }
        if (ab.dash && p.dashCooldown <= 0) {
          await tap('ShiftLeft', 42);
        }
        continue;
      }

      // Fast dash chaining across Sectors 1..3 so Arch #4 (x=3780) is crossed cleanly before t=7.7s!
      if (st.level >= 1 && st.level <= 3 && ab.dash && p.dashCooldown <= 0 && px < st.exit.x - 35) {
        await tap('ShiftLeft', 40);
        await sleep(32);
        continue;
      }

      await sleep(24);
    }
  } finally {
    await setSpace(false).catch(() => {});
    await setRight(false).catch(() => {});
  }
}
