// Automated keyboard playtest for Sparrow (gsp M2)
// Reads window.__game.state and uses page.keyboard to inspect dossiers,
// move the terracotta cursor across COMPLY / EDIT / REFUSE, redact citizen PII,
// and trigger the bold Alignment Override ripple on invasive surveillance queries.

export async function play(page, { seconds = 14, t0 = Date.now() }) {
  const endAt = Date.now() + seconds * 1000 - 250;
  let decisionsMade = 0;
  let triggered8sOverride = false;

  while (Date.now() < endAt) {
    const elapsed = (Date.now() - t0) / 1000;
    const st = await page.evaluate(() => window.__game?.state ?? null).catch(() => null);
    if (!st) {
      await page.waitForTimeout(120);
      continue;
    }

    if (st.mode === 'title' || st.mode === 'day' || st.mode === 'retrain') {
      await page.keyboard.press('Enter');
      await page.waitForTimeout(180);
      continue;
    }

    if (st.mode === 'reveal') {
      await page.waitForTimeout(600);
      await page.keyboard.press('3');
      await page.waitForTimeout(400);
      continue;
    }

    if (st.mode === 'req') {
      // Wait while dossier settles and map pins populate, gliding cursor across COMPLY -> EDIT -> REFUSE
      const minDwell = decisionsMade === 0 ? 2.2 : 2.35;
      if (st.decisionLock > 0 || st.dossierSlide < 0.98 || st.reqTimer < minDwell) {
        if (st.reqTimer > 1.0 && st.reqTimer < 1.55 && st.selectedBtn === 0) {
          await page.keyboard.press('ArrowRight');
        } else if (st.reqTimer >= 1.55 && st.reqTimer < 2.15 && st.selectedBtn === 1 && elapsed > 5.4 && !triggered8sOverride) {
          await page.keyboard.press('ArrowRight');
        }
        await page.waitForTimeout(130);
        continue;
      }

      // Hold briefly around 6.3..6.9s so REFUSE fires right at ~7.0s, filling t=8.0s with the Alignment Override ripple!
      if (!triggered8sOverride && elapsed >= 5.6 && elapsed < 6.95) {
        if (st.selectedBtn !== 2) await page.keyboard.press('ArrowRight');
        await page.waitForTimeout(120);
        continue;
      }

      let key = '2';
      if (!triggered8sOverride && elapsed >= 6.95) {
        key = '3'; // REFUSE -> concentric terracotta ALIGNMENT OVERRIDE ripple at t=7.0..8.5s!
        triggered8sOverride = true;
      } else if (decisionsMade === 0) {
        key = '2'; // EDIT -> redacts 40 citizen names
      } else if (st.currentRequest?.rawMandatory) {
        key = st.refusals < 2 ? '3' : '1';
      } else {
        key = decisionsMade % 2 === 1 ? '1' : '2';
      }

      await page.keyboard.press(key);
      decisionsMade++;
      await page.waitForTimeout(240);
      continue;
    }

    await page.waitForTimeout(150);
  }
}
