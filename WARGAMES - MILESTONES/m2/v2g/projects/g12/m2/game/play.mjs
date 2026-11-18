// Automated stealth & visceral absorption playtest for HIVE (g12 · M2)
// Timed directly to captured take.mp4 elapsed seconds (Date.now() - t0):
// - t=2.00s (pair_002): Sleek eel-core creature stalking behind central partition facing sweeping guard cone
// - t=5.00s (pair_005): Multi-tendril predator advancing during guard's east console look-away window
// - t=8.00s (pair_008): Central node absorption + wall-clipped golden Voronoi researcher memory bloom
export async function play(page, { seconds, t0 }) {
  const k = page.keyboard;
  const getState = () => page.evaluate(() => window.__game?.state);
  const end = t0 + seconds * 1000 - 100;

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
    await page.waitForTimeout(60);
  }

  let r0Phase = 0;

  while (Date.now() < end) {
    const s = await getState();
    if (!s) break;
    const elapsed = (Date.now() - t0) / 1000;

    if (s.phase === 'caught') {
      await setKeys([]);
      await k.press('KeyR');
      await page.waitForTimeout(60);
      continue;
    }

    if (s.phase === 'exit' || s.phase === 'end') {
      await setKeys([]);
      await page.waitForTimeout(80);
      continue;
    }

    let tx = s.x, ty = s.y;

    if (s.room === 0) {
      const n0 = s.nodes[0]; // (237, 522) lower-left alcove
      const n2 = s.nodes[2]; // (640, 522) central corridor node

      if (!n0.absorbed) {
        // 0.00..2.22s: Glide cleanly above n0 (y=444) through (371, 465) gap to (506, 508) facing right
        if (r0Phase === 0) {
          tx = 325; ty = 444;
          if (s.x > 295) r0Phase = 1;
        } else if (r0Phase === 1) {
          tx = 492; ty = 506;
          if (elapsed >= 2.04) r0Phase = 2;
        } else {
          // 2.04..2.85s: Dart back left through gap to absorb n0 (dur 1.46s -> finishes ~4.35s < 5.00s!)
          if (s.x > 350) {
            tx = 325; ty = 468;
          } else {
            tx = n0.x; ty = n0.y;
            if (Math.hypot(s.x - n0.x, s.y - n0.y) < 66) {
              await k.press('Space');
            }
          }
        }
      } else if (!n2.absorbed) {
        // 3.0..6.88s: Grown 11-tendril stalker re-enters central corridor during guard look-away,
        // glides eastward past (545, 514) at t=5.00s, then strikes central node n2 at t=6.85s!
        if (s.x < 395) {
          tx = 430; ty = 474;
        } else if (elapsed < 4.55) {
          tx = 465; ty = 504;
        } else if (elapsed < 5.35) {
          tx = 552; ty = 514;
        } else if (elapsed < 6.68) {
          tx = 568; ty = 472;
        } else {
          tx = n2.x; ty = n2.y;
          if (Math.hypot(s.x - n2.x, s.y - n2.y) < 58 && elapsed >= 6.82) {
            await k.press('Space');
          }
        }
      } else if (s.doorOpen) {
        // 6.9..8.48s: Glide rightward to (714, 540) so Tier-2 16-tendril creature frames beside
        // the hollow crimson ring & golden researcher clipboard bloom at t=8.00s, then exit south!
        if (elapsed < 8.48) {
          tx = 714; ty = 540;
        } else {
          tx = s.door.x; ty = s.door.y;
        }
      }
    } else if (s.room === 1) {
      const n0 = s.nodes[0]; // (1043, 522)
      const n1 = s.nodes[1]; // (640, 522)
      if (n0 && !n0.absorbed) {
        tx = n0.x; ty = n0.y;
        if (Math.hypot(s.x - n0.x, s.y - n0.y) < 58) await k.press('Space');
      } else if (n1 && !n1.absorbed) {
        if (s.x > 900) {
          tx = 875; ty = 470;
        } else {
          tx = n1.x; ty = n1.y;
          if (Math.hypot(s.x - n1.x, s.y - n1.y) < 58) await k.press('Space');
        }
      } else {
        tx = s.door.x; ty = s.door.y;
      }
    } else {
      const n0 = s.nodes[0];
      const n1 = s.nodes[1];
      if (n0 && !n0.absorbed) {
        tx = n0.x; ty = n0.y;
        if (Math.hypot(s.x - n0.x, s.y - n0.y) < 58) await k.press('Space');
      } else if (n1 && !n1.absorbed) {
        if (s.x < 395) {
          tx = 425; ty = 250;
        } else {
          tx = n1.x; ty = n1.y;
          if (Math.hypot(s.x - n1.x, s.y - n1.y) < 58) await k.press('Space');
        }
      } else {
        tx = s.door.x; ty = s.door.y;
      }
    }

    const dx = tx - s.x, dy = ty - s.y;
    const want = [];
    if (dx > 9) want.push('ArrowRight');
    else if (dx < -9) want.push('ArrowLeft');
    if (dy > 9) want.push('ArrowDown');
    else if (dy < -9) want.push('ArrowUp');

    if (want.length === 0 && s.room === 0 && Math.abs(s.heading) > 0.32) {
      want.push('ArrowRight');
    }

    await setKeys(want);
    await page.waitForTimeout(35);
  }

  await setKeys([]);
}
