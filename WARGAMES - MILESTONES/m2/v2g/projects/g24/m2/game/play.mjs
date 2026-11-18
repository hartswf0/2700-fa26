// Playtest choreography for Group 24 — Memory Munitions (M2)
// Reads window.__game.state and uses keyboard (`ArrowRight`, `ArrowUp`, `Space` minigun, `KeyK` precision disable beam).
export async function play(page, { seconds, t0 }) {
  const k = page.keyboard;
  const getState = () => page.evaluate(() => window.__game?.state);
  const end = t0 + seconds * 1000 - 160;

  let s = await getState();
  if (s?.phase === 'title') {
    await k.press('Enter');
    await page.waitForTimeout(100);
  }

  let rightDown = false;
  let spaceDown = false;
  let beamDown = false;
  let lastJumpAt = 0;

  async function setKey(code, want, cur) {
    if (want && !cur) { await k.down(code); return true; }
    if (!want && cur) { await k.up(code); return false; }
    return cur;
  }

  while (Date.now() < end) {
    s = await getState();
    if (!s) break;

    if (s.phase === 'dead' || s.phase === 'album') {
      rightDown = await setKey('ArrowRight', false, rightDown);
      spaceDown = await setKey('Space', false, spaceDown);
      beamDown  = await setKey('KeyK', false, beamDown);
      if ((Date.now() - t0) / 1000 < seconds - 2.2) {
        await page.waitForTimeout(900);
        await k.press('r');
      } else {
        await page.waitForTimeout(120);
      }
      continue;
    }

    const p = s.player;
    const activeAhead = s.enemies
      .filter(e => e.state === 'active' && e.x > p.x - 20)
      .sort((a, b) => a.x - b.x);
    const target = activeAhead[0] || null;
    const dist = target ? (target.x - p.x) : 9999;

    // Jump over incoming enemy plasma bolts (or acrobatic Contra jump when engaging)
    const dangerBullet = s.incomingBullets?.find(
      b => (b.x > p.x && b.vx < 0 && b.x - p.x < 170 && Math.abs(b.y - (p.y - 115)) < 85)
    );
    if (p.grounded && Date.now() - lastJumpAt > 950 && (dangerBullet || (target && target.id === 0 && dist < 390 && dist > 260))) {
      await k.down('ArrowUp');
      await page.waitForTimeout(95);
      await k.up('ArrowUp');
      lastJumpAt = Date.now();
    }

    // Core contrast:
    // Even-ID robots (0, 2, 4...): unleash rapid neon MINIGUN (`Space`) -> shatters into slow-mo golden photo shards!
    // Odd-ID robots (1, 3, 5, 7): hold PRECISION DISABLE BEAM (`KeyK`) -> powers down intact & releases glowing memory photo!
    let wantRight = true;
    let wantSpace = false;
    let wantBeam = false;

    if (target && dist < 440) {
      const useDisable = (target.id % 2 === 1);
      if (useDisable) {
        // Hold steady range ~240..330px while channeling twin-helix disable beam
        wantRight = dist > 285;
        wantBeam = dist < 420;
      } else {
        // Run-and-gun minigun burst!
        wantRight = dist > 235;
        wantSpace = dist < 430;
      }
    }

    rightDown = await setKey('ArrowRight', wantRight, rightDown);
    spaceDown = await setKey('Space', wantSpace, spaceDown);
    beamDown  = await setKey('KeyK', wantBeam, beamDown);

    await page.waitForTimeout(55);
  }

  for (const key of ['ArrowRight', 'ArrowLeft', 'ArrowUp', 'Space', 'KeyK']) {
    await k.up(key).catch(() => {});
  }
}
