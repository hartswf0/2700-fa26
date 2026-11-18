// Automated M2 showcase playtest for Group 10: "Lab-Rat-ory" (VOIDBASTARD-TAO rebuild)
// Drives Subject 47 across all 4 escalating resolutions (256p -> 480p -> 960p -> 1280p),
// performing tactile Space dash-scurry bursts between workbench cover props, crouching past
// the sweeping scientist hand cast shadow, sparking open the hinged surgical steel door into
// warm golden-amber light, and unveiling the 1280p Full-Resolution Cage twist.
export async function play(page, { seconds, t0 }) {
  const k = page.keyboard;
  const getState = () => page.evaluate(() => window.__game?.state);
  const end = t0 + seconds * 1000 - 140;

  const held = new Set();
  async function setKey(code, wantDown) {
    if (wantDown && !held.has(code)) {
      held.add(code);
      await k.down(code);
    } else if (!wantDown && held.has(code)) {
      held.delete(code);
      await k.up(code);
    }
  }

  const init = await getState();
  if (init?.phase === 'title') {
    await k.press('Enter');
    await page.waitForTimeout(50);
  }

  let currentLevel = -1;
  let wpIdx = 0;
  let lastDashTime = 0;

  while (Date.now() < end) {
    const s = await getState();
    if (!s) break;

    if (s.phase === 'end' || s.unlocking) {
      for (const c of [...held]) await setKey(c, false);
      await page.waitForTimeout(60);
      continue;
    }

    if (s.phase === 'caught') {
      for (const c of [...held]) await setKey(c, false);
      await k.press('KeyR');
      wpIdx = 0;
      await page.waitForTimeout(60);
      continue;
    }

    if (s.level !== currentLevel) {
      currentLevel = s.level;
      wpIdx = 0;
    }

    const wps = s.waypoints || [];
    if (s.hasKey && wpIdx === 0 && wps.length > 1) {
      wpIdx = 1;
    }

    const wp = wps[Math.min(wpIdx, wps.length - 1)] || (s.hasKey ? s.exitPos : s.keyPos);
    const dx = wp.x - s.x;
    const dy = wp.y - s.y;
    const dist = Math.hypot(dx, dy);

    if (dist < 32 && wpIdx < wps.length - 1) {
      wpIdx++;
    }

    await setKey('ArrowRight', dx > 12);
    await setKey('ArrowLeft', dx < -12);
    await setKey('ArrowDown', dy > 12);
    await setKey('ArrowUp', dy < -12);

    // Execute responsive Space dash-scurry bursts on straightaways between cover props
    const now = Date.now();
    if (wp.dash && dist > 85 && now - lastDashTime > 780) {
      lastDashTime = now;
      await k.press('Space');
    }

    // Low-profile stalk when skirting near the sweeping scientist hand shadow outside cover
    let nearHand = false;
    if (s.handPos && !s.inCover) {
      const hd = Math.hypot(s.x - s.handPos.x, s.y - (s.handPos.y + 54));
      nearHand = hd < 195 && s.handPos.depth > 0.45;
    }
    await setKey('ShiftLeft', nearHand);

    await page.waitForTimeout(30);
  }

  for (const c of [...held]) {
    await k.up(c).catch(() => {});
  }
}
