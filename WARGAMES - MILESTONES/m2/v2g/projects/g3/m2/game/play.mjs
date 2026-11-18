// Automated playtest scenario for Turing Test Village (g3 M2).
// Choreographed using keyboard + window.__game.state:
//   t=0..2.4s : Talk to Bram the Miller ("Burn the old bridge, it is unsafe."), inspect & decline AI quest
//   t=2.5..6.8s: Walk east along cobblestone path & across the wooden bridge over the river, flipping Notebook
//   t=6.9..10.5s: Talk to Marta the Baker on the east bank, confirm human in Notebook, accept her quest
//   t=10.6..13.8s: Inspect Warden Unit-7 by the stone well, tag as confirmed AI in Notebook, decline its quest
export async function play(page, { seconds, t0 }) {
  const k = page.keyboard;
  const state = () => page.evaluate(() => window.__game?.state);
  const end = t0 + seconds * 1000 - 150;
  const elapsed = () => (Date.now() - t0) / 1000;

  async function moveToward(tx, ty, maxMs = 4500, tol = 34) {
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
      await setKey('ArrowRight', dx > 14);
      await setKey('ArrowLeft', dx < -14);
      await setKey('ArrowDown', dy > 14);
      await setKey('ArrowUp', dy < -14);
      await page.waitForTimeout(45);
    }
    for (const c of held) await k.up(c);
  }

  let s = await state();
  if (s?.phase === 'title') {
    await k.press('Enter');
    await page.waitForTimeout(180);
  }

  // 1) Open Miller's dialogue right away so t=2.0s shows Miller's bridge-burning prompt + Notebook!
  s = await state();
  if (s?.phase === 'village' && s.nearVillager === 'miller') {
    await k.press('Space');
  } else {
    await moveToward(515, 330, 900, 45);
    await k.press('Space');
  }

  // Hold Miller's quest prompt through t=2.3s, highlighting decline cleanly
  while (elapsed() < 1.6 && Date.now() < end) await page.waitForTimeout(80);
  await k.press('ArrowRight'); // highlight 'decline'
  while (elapsed() < 2.45 && Date.now() < end) await page.waitForTimeout(70);

  // Decline Miller's destructive bridge-burning quest
  s = await state();
  if (s?.phase === 'talk') {
    await k.press('KeyD');
    await page.waitForTimeout(160);
  }

  // 2) Walk east along the cobblestone path onto and across the lower wooden bridge (t=3..6.5s)
  await moveToward(835, 348, 1600, 32);
  await moveToward(980, 415, 1100, 30);
  await moveToward(1215, 348, 1600, 32);
  await moveToward(1365, 368, 1400, 36);

  // 3) Talk to Marta the Baker on the east bank & tag her 'confirmed human' in Notebook (t=7.2..9.6s)
  s = await state();
  if (s?.phase === 'village' && s.nearVillager) {
    await k.press('Space');
    await page.waitForTimeout(550);
    // Tag Baker -> 'confirmed human' with red underline & page flip!
    await k.press('KeyN');
    while (elapsed() < 8.6 && Date.now() < end) await page.waitForTimeout(80);
    await k.press('KeyA'); // accept Marta's helpful human quest!
    await page.waitForTimeout(1050);
  }

  // 4) Approach Warden Unit-7 beside the stone well, inspect its rigid AI quest, open Notebook & tag!
  if (Date.now() < end - 1200) {
    await moveToward(1510, 345, 1500, 44);
    s = await state();
    if (s?.phase === 'village' && s.nearVillager) {
      await k.press('Space');
      await page.waitForTimeout(650);
      await k.press('KeyN'); // tag '? AI'
      await page.waitForTimeout(350);
      await k.press('KeyD'); // decline sealing the village well!
      await page.waitForTimeout(250);
    }
  }

  // 5) Toggle full detective Notebook view briefly to review all 6 villagers, then close
  if (Date.now() < end - 700) {
    await k.press('KeyN');
    await page.waitForTimeout(450);
    await k.press('ArrowDown');
    await page.waitForTimeout(280);
    await k.press('KeyN');
  }

  while (Date.now() < end) {
    await page.waitForTimeout(80);
  }
}
