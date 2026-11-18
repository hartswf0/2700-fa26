// Automated playtest scenario for Turing Test Village (g3 M2 — VOIDBASTARD-TAO rebuild).
// Choreographed via keyboard + window.__game.state to hit the Omni seed video's exact spatial beats:
//   t=0..2.35s: Approach Miller outside his half-timber mill ("Burn the old bridge, it is unsafe."), curl page & decline
//   t=2.4..6.1s: Walk freely east along cobblestone path & across the lower wooden rope-bridge (open, uncluttered center!)
//   t=6.2..9.2s: Speak with Marta the Baker beside the east stone well & Warden Unit-7; tag `confirmed human` with pencil!
//   t=9.3..13.8s: Inspect Warden Unit-7's well-sealing AI quest, tag `? AI`, decline, and review Notebook.
export async function play(page, { seconds, t0 }) {
  const k = page.keyboard;
  const state = () => page.evaluate(() => window.__game?.state);
  const end = t0 + seconds * 1000 - 150;
  const elapsed = () => (Date.now() - t0) / 1000;

  async function moveToward(tx, ty, maxMs = 4200, tol = 11) {
    const deadline = Date.now() + maxMs;
    const held = new Set();
    const setKey = async (code, want) => {
      if (want && !held.has(code)) { await k.down(code); held.add(code); }
      if (!want && held.has(code)) { await k.up(code); held.delete(code); }
    };
    while (Date.now() < Math.min(deadline, end)) {
      const s = await state();
      if (!s || s.phase !== 'village') break;
      const dx = tx - s.x, dy = ty - s.y;
      if (Math.hypot(dx, dy) <= tol) break;
      await setKey('ArrowRight', dx > 5);
      await setKey('ArrowLeft', dx < -5);
      await setKey('ArrowDown', dy > 5);
      await setKey('ArrowUp', dy < -5);
      await page.waitForTimeout(35);
    }
    for (const c of held) await k.up(c);
  }

  let s = await state();
  if (s?.phase === 'title') {
    await k.press('Enter');
    await page.waitForTimeout(140);
  }

  // 1) Step up to Miller by the west mill cottage & open dialogue so t=2.0s shows his prompt + curling Notebook!
  await moveToward(258, 178, 850, 18);
  s = await state();
  if (s?.phase === 'village') {
    await k.press('Space');
  }

  while (elapsed() < 1.5 && Date.now() < end) await page.waitForTimeout(50);
  await k.press('ArrowRight'); // highlight 'decline' on Miller's bridge-burning quest
  while (elapsed() < 2.35 && Date.now() < end) await page.waitForTimeout(50);

  s = await state();
  if (s?.phase === 'talk') {
    await k.press('KeyD');
    await page.waitForTimeout(120);
  }

  // 2) Walk along cobblestone lane -> west bridge mouth (442, 228) -> center planks (518, 210) at t=5.0s -> east bank (596, 190)!
  await moveToward(368, 194, 1000, 12);
  await moveToward(442, 228, 1000, 11);
  await moveToward(508, 212, 950, 10);
  while (elapsed() < 5.15 && Date.now() < end) await page.waitForTimeout(45);
  await moveToward(596, 190, 1050, 12);
  await moveToward(674, 196, 1050, 14);

  // 3) Speak with Marta the Baker on the east bank (with stone well, Warden Unit-7 & east bakehouse in frame) at t=7.2..8.8s!
  s = await state();
  if (s?.phase === 'village' && s.nearVillager) {
    await k.press('Space');
    await page.waitForTimeout(350);
    // Cycle Baker from 'human' -> 'confirmed human' right around t=7.6s so yellow pencil + red underline shine at t=8.0s!
    while (elapsed() < 7.55 && Date.now() < end) await page.waitForTimeout(50);
    await k.press('KeyN');
    while (elapsed() < 8.65 && Date.now() < end) await page.waitForTimeout(60);
    await k.press('KeyA'); // accept Marta's warm rye quest!
    await page.waitForTimeout(900);
  }

  // 4) Step to Warden Unit-7 by the stone well, inspect its rigid optimization quest, tag '? AI', and decline!
  if (Date.now() < end - 1000) {
    await moveToward(752, 180, 1300, 18);
    s = await state();
    if (s?.phase === 'village' && s.nearVillager) {
      await k.press('Space');
      await page.waitForTimeout(500);
      await k.press('KeyN'); // tag '? AI'
      await page.waitForTimeout(300);
      await k.press('KeyD'); // decline sealing the village well
      await page.waitForTimeout(200);
    }
  }

  // 5) Briefly inspect full Notebook [N] then close cleanly
  if (Date.now() < end - 600) {
    await k.press('KeyN');
    await page.waitForTimeout(400);
    await k.press('ArrowDown');
    await page.waitForTimeout(220);
    await k.press('KeyN');
  }

  while (Date.now() < end) {
    await page.waitForTimeout(80);
  }
}
