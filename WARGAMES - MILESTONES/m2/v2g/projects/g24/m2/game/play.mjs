// Playtest choreography for Group 24 — Memory Munitions (M2)
// Mirrors the Omni gameplay arc naturally via keyboard inputs (`ArrowRight`, `ArrowUp`, `Space` minigun, `KeyK` precision disable beam):
//   ~2.0s: Acrobatic Contra jump + rapid cyan minigun burst against Sentinel #0 while dodging magenta return bolts
//   ~5.0s: Golden sepia photo shards from Sentinel #0 drift across the neon floor as soldier advances on Sentinel #1
//   ~8.0s: Sentinel #1 kneels powered-down venting teal steam with the intact golden-framed Polaroid hovering between them!
export async function play(page, { seconds, t0 }) {
  const k = page.keyboard;
  const getState = () => page.evaluate(() => window.__game?.state);
  const end = t0 + seconds * 1000 - 140;

  let s = await getState();
  if (s?.phase === 'title') {
    await k.press('Enter');
    await page.waitForTimeout(60);
  }

  let rightDown = false;
  let spaceDown = false;
  let beamDown = false;
  let jumpedForZero = false;
  let lastDodgeJump = 0;

  async function setKey(code, want, cur) {
    if (want && !cur) { await k.down(code); return true; }
    if (!want && cur) { await k.up(code); return false; }
    return cur;
  }

  while (Date.now() < end) {
    const elapsed = (Date.now() - t0) / 1000;
    s = await getState();
    if (!s) break;

    if (s.phase === 'dead' || s.phase === 'album') {
      rightDown = await setKey('ArrowRight', false, rightDown);
      spaceDown = await setKey('Space', false, spaceDown);
      beamDown  = await setKey('KeyK', false, beamDown);
      if (elapsed < seconds - 2.0) {
        await page.waitForTimeout(700);
        await k.press('r');
      } else {
        await page.waitForTimeout(100);
      }
      continue;
    }

    const p = s.player;
    const activeAhead = s.enemies
      .filter(e => e.state === 'active' && e.x > p.x - 20)
      .sort((a, b) => a.x - b.x);
    const target = activeAhead[0] || null;
    const dist = target ? (target.x - p.x) : 9999;

    // Iconic mid-air Contra jump around t ~ 1.78s so t = 2.0s captures peak airborne minigun fire + incoming magenta bolts!
    if (!jumpedForZero && target && target.id === 0 && elapsed >= 1.76 && p.grounded) {
      jumpedForZero = true;
      lastDodgeJump = Date.now();
      await k.down('ArrowUp');
      await page.waitForTimeout(75);
      await k.up('ArrowUp');
    } else if (target && target.id >= 2 && p.grounded && Date.now() - lastDodgeJump > 1400) {
      const incoming = s.incomingBullets?.find(b => b.x > p.x && b.x - p.x < 190 && b.y > p.y - 260);
      if (incoming) {
        lastDodgeJump = Date.now();
        await k.down('ArrowUp');
        await page.waitForTimeout(75);
        await k.up('ArrowUp');
      }
    }

    let wantRight = true;
    let wantSpace = false;
    let wantBeam = false;

    if (target) {
      if (target.id === 0) {
        // Approach to ~540px, leap & unleash rapid neon minigun at t~1.72s so t=2.0s captures airborne duel before shatter at ~2.25s!
        wantRight = dist > 535;
        wantSpace = elapsed >= 1.72 && dist < 640;
      } else if (target.id === 1) {
        // Advance into the drifting golden photo shards, tap 2 warning shots right around t=4.95s..5.05s,
        // then lock the Precision Disable Beam (`KeyK`) from 5.15s so Sentinel #1 kneels intact releasing its glowing Polaroid!
        wantRight = dist > 515;
        if (elapsed >= 4.92 && elapsed < 5.06 && target.hp > 42 && dist < 640) {
          wantSpace = true;
        } else if (elapsed >= 5.10 && dist < 650) {
          wantBeam = true;
        }
      } else {
        // Hold beside the kneeling Sentinel #1 (~7.0s..8.45s) while the glowing sepia Polaroid + fireflies hover in frame!
        const admirePhoto = s.intactPickups?.some(m => m.memId === 1 && m.age < 1.85);
        if (admirePhoto) {
          wantRight = false;
        } else if (dist < 560) {
          const useDisable = (target.id % 2 === 1);
          wantRight = dist > 450;
          wantBeam = useDisable;
          wantSpace = !useDisable;
        }
      }
    }

    rightDown = await setKey('ArrowRight', wantRight, rightDown);
    spaceDown = await setKey('Space', wantSpace, spaceDown);
    beamDown  = await setKey('KeyK', wantBeam, beamDown);

    await page.waitForTimeout(45);
  }

  for (const key of ['ArrowRight', 'ArrowLeft', 'ArrowUp', 'Space', 'KeyK']) {
    await k.up(key).catch(() => {});
  }
}
