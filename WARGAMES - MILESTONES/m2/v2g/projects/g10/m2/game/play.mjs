// Automated M2 playtest scenario for Group 10: "Lab-Rat-ory"
// Navigates Subject 47 smoothly across all 4 escalating-resolution levels (8-bit Cage -> 16-bit Maze ->
// 32-bit Bench -> Full-Res Humans) using keyboard inputs, collecting keys, crouching under sweeping
// scientist hand shadows, unlocking the sparking door, and revealing STILL IN THE TEST.
export async function play(page, { seconds, t0 }) {
  const k = page.keyboard;
  const getState = () => page.evaluate(() => window.__game?.state);
  const end = t0 + seconds * 1000 - 150;

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
    await page.waitForTimeout(60);
  }

  let currentLevel = -1;
  let wpIdx = 0;

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
      wpIdx = 0;
      await page.waitForTimeout(80);
      continue;
    }

    if (s.level !== currentLevel) {
      currentLevel = s.level;
      wpIdx = 0;
    }

    const wps = s.waypoints || [];
    // First waypoint in every level is the key; once collected, advance through exit path waypoints
    if (s.hasKey && wpIdx === 0 && wps.length > 1) {
      wpIdx = 1;
    }
    const target = wps[Math.min(wpIdx, wps.length - 1)] || (s.hasKey ? s.exitPos : s.keyPos);
    const dx = target.x - s.x;
    const dy = target.y - s.y;
    const dist = Math.hypot(dx, dy);

    if (dist < 34 && wpIdx < wps.length - 1) {
      wpIdx++;
    }

    await setKey('ArrowRight', dx > 14);
    await setKey('ArrowLeft', dx < -14);
    await setKey('ArrowDown', dy > 14);
    await setKey('ArrowUp', dy < -14);

    // Sneak-crouch whenever passing near the looming scientist hand shadow!
    let nearHand = false;
    if (s.handPos) {
      const hd = Math.hypot(s.x - s.handPos.x, s.y - (s.handPos.y + 55));
      nearHand = hd < 145;
    }
    await setKey('ShiftLeft', nearHand);

    await page.waitForTimeout(35);
  }

  for (const c of [...held]) {
    await k.up(c).catch(() => {});
  }
}
