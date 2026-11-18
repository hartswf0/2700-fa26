// Automated skillful stealth playtest for HIVE (g12 · M2)
// Uses keyboard movement + Space absorption to navigate behind facility walls,
// absorb crimson intelligence nodes across rooms, trigger golden human memory
// flashes, grow through all 3 creature sizes, and advance through sector doors.
export async function play(page, { seconds, t0 }) {
  const k = page.keyboard;
  const getState = () => page.evaluate(() => window.__game?.state);
  const end = t0 + seconds * 1000 - 120;

  const held = new Set();
  async function setKeys(want) {
    for (const code of ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight']) {
      const shouldHold = want.includes(code);
      if (shouldHold && !held.has(code)) {
        await k.down(code);
        held.add(code);
      } else if (!shouldHold && held.has(code)) {
        await k.up(code);
        held.delete(code);
      }
    }
  }

  const s0 = await getState();
  if (s0?.phase === 'title') {
    await k.press('Enter');
    await page.waitForTimeout(80);
  }

  // Room 0 tactical stealth route timed to dodge sweeping cones & showcase central memory bloom
  let r0Stage = 0;

  while (Date.now() < end) {
    const s = await getState();
    if (!s) break;
    const elapsed = (Date.now() - t0) / 1000;

    if (s.phase === 'caught') {
      await setKeys([]);
      await k.press('Space');
      await page.waitForTimeout(80);
      continue;
    }

    if (s.phase === 'exit' || s.phase === 'end') {
      await setKeys([]);
      await page.waitForTimeout(80);
      continue;
    }

    let tx = s.x, ty = s.y;

    if (s.room === 0) {
      const n0 = s.nodes[0]; // (237, 522)
      const n2 = s.nodes[2]; // (640, 522) center-lower node
      if (n0 && !n0.absorbed) {
        tx = n0.x; ty = n0.y;
        if (Math.hypot(s.x - n0.x, s.y - n0.y) < 46) await k.press('Space');
      } else if (!n2?.absorbed) {
        // Stalk smoothly behind central partition wall (t=2s..6.8s), then strike center node at ~7.1s
        if (r0Stage === 0) {
          tx = 475; ty = 468;
          if (Math.hypot(s.x - tx, s.y - ty) < 24) r0Stage = 1;
        } else if (r0Stage === 1) {
          tx = 642; ty = 335;
          if (Math.hypot(s.x - tx, s.y - ty) < 26) r0Stage = 2;
        } else if (r0Stage === 2) {
          tx = 492; ty = 318;
          if (Math.hypot(s.x - tx, s.y - ty) < 26 || elapsed > 5.4) r0Stage = 3;
        } else if (r0Stage === 3) {
          tx = 642; ty = 425;
          if (elapsed >= 6.55 && Math.hypot(s.x - tx, s.y - ty) < 34) r0Stage = 4;
        } else {
          tx = n2.x; ty = n2.y;
          if (Math.hypot(s.x - n2.x, s.y - n2.y) < 48) await k.press('Space');
        }
      } else if (s.doorOpen) {
        // Hold briefly inside golden ripple so silhouette bloom frames cleanly, then exit south
        if (elapsed < 8.45) {
          tx = 668; ty = 548;
        } else {
          tx = s.door.x; ty = s.door.y;
        }
      }
    } else if (s.room === 1) {
      const n0 = s.nodes[0]; // (1043, 522)
      if (n0 && !n0.absorbed) {
        tx = n0.x; ty = n0.y;
        if (Math.hypot(s.x - n0.x, s.y - n0.y) < 46) await k.press('Space');
      } else if (s.x > 900) {
        tx = 860; ty = 475;
      } else {
        tx = s.door.x; ty = s.door.y;
      }
    } else {
      const n0 = s.nodes[0]; // (237, 198)
      if (n0 && !n0.absorbed) {
        tx = n0.x; ty = n0.y;
        if (Math.hypot(s.x - n0.x, s.y - n0.y) < 46) await k.press('Space');
      } else if (s.x < 390) {
        tx = 430; ty = 245;
      } else {
        tx = s.door.x; ty = s.door.y;
      }
    }

    const dx = tx - s.x, dy = ty - s.y;
    const want = [];
    if (dx > 10) want.push('ArrowRight');
    else if (dx < -10) want.push('ArrowLeft');
    if (dy > 10) want.push('ArrowDown');
    else if (dy < -10) want.push('ArrowUp');

    if (want.length === 0) {
      want.push(Math.sin(elapsed * 5) > 0 ? 'ArrowRight' : 'ArrowLeft');
    }

    await setKeys(want);
    await page.waitForTimeout(45);
  }

  await setKeys([]);
}
