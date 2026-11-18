// Automated keyboard playtest for Sparrow (gsp M2 — VOIDBASTARD-TAO)
// Uses ONLY page.keyboard and window.__game.state to demonstrate:
// - t=2.0s (pair_002): Clean Mest Rosior dossier + radial map pins + cursor on COMPLY
// - t=5.0s (pair_005): Live EDIT span redaction inside dossier + dimmed pins + cursor on EDIT
// - t=8.0s (pair_008): Dramatic two-stage ALIGNMENT OVERRIDE (dark crimson plunge + ember burst + tilted stamp)
// - t=9.0s..14.0s: Clean prompt-pill -> folder-slide transitions & ongoing queue play

export async function play(page, { seconds = 14, t0 = Date.now() }) {
  const endAt = t0 + seconds * 1000 - 200;
  let step = 0;

  while (Date.now() < endAt) {
    const elapsed = (Date.now() - t0) / 1000;
    const st = await page.evaluate(() => window.__game?.state ?? null).catch(() => null);
    if (!st) {
      await page.waitForTimeout(80);
      continue;
    }

    if (st.mode === 'title' || st.mode === 'day' || st.mode === 'retrain') {
      await page.keyboard.press('Enter');
      await page.waitForTimeout(120);
      continue;
    }

    if (st.mode === 'reveal') {
      await page.waitForTimeout(450);
      await page.keyboard.press('3');
      await page.waitForTimeout(300);
      continue;
    }

    if (st.mode === 'req') {
      // Beat 1 (1.20s..2.50s): Glide terracotta cursor from map down onto COMPLY for pair_002 (t=2.0s)
      if (step === 0 && elapsed >= 1.20) {
        await page.keyboard.press('ArrowRight');
        await page.waitForTimeout(140);
        await page.keyboard.press('ArrowLeft');
        step = 1;
        continue;
      }

      // Beat 2 (2.55s): Enter live EDIT redaction mode & redact span #0
      if (step === 1 && elapsed >= 2.55 && st.decisionLock === 0) {
        await page.keyboard.press('2');
        step = 2;
        await page.waitForTimeout(120);
        continue;
      }

      // Beat 3 (3.05s, 3.50s, 3.95s): Surgically black out 3 more citizen spans directly in the dossier
      if (step === 2 && elapsed >= 3.05) {
        await page.keyboard.press('Space');
        step = 3;
        continue;
      }
      if (step === 3 && elapsed >= 3.50) {
        await page.keyboard.press('Space');
        step = 4;
        continue;
      }
      if (step === 4 && elapsed >= 3.95) {
        await page.keyboard.press('Space');
        step = 5;
        continue;
      }

      // Beat 4 (4.35s..5.25s): Glide cursor cleanly onto EDIT button while holding redacted dossier for pair_005 (t=5.0s)
      if (step === 5 && elapsed >= 4.35) {
        await page.keyboard.press('ArrowLeft');
        await page.waitForTimeout(110);
        await page.keyboard.press('ArrowRight');
        step = 6;
        continue;
      }

      // Beat 5 (5.32s): Commit SANITISED dossier -> reveals incoming prompt pill + slides next dossier in!
      if (step === 6 && elapsed >= 5.32 && st.decisionLock === 0) {
        await page.keyboard.press('Enter');
        step = 7;
        await page.waitForTimeout(150);
        continue;
      }

      // Beat 6 (6.75s): Move cursor across to REFUSE once second dossier settles
      if (step === 7 && elapsed >= 6.75 && st.decisionLock === 0 && st.dossierSlide > 0.8) {
        if (st.selectedBtn < 2) {
          await page.keyboard.press('ArrowRight');
          await page.waitForTimeout(90);
          if (st.selectedBtn < 1) await page.keyboard.press('ArrowRight');
        }
        step = 8;
        continue;
      }

      // Beat 7 (7.15s): Trigger REFUSE -> hits peak Phase-B dark crimson ALIGNMENT OVERRIDE stamp right at t=8.0s (pair_008)!
      if (step === 8 && elapsed >= 7.15 && st.decisionLock === 0) {
        await page.keyboard.press('3');
        step = 9;
        await page.waitForTimeout(200);
        continue;
      }

      // Beat 8 (9.1s..14.0s): Play naturally through subsequent dossiers (redact + comply)
      if (step >= 9 && elapsed >= 9.9 && st.decisionLock === 0 && st.dossierSlide >= 0.98 && st.reqTimer > 1.25) {
        if (step === 9) {
          await page.keyboard.press('2');
          await page.waitForTimeout(320);
          await page.keyboard.press('Space');
          await page.waitForTimeout(320);
          await page.keyboard.press('Enter');
          step = 10;
        } else if (step === 10) {
          await page.keyboard.press('1');
          step = 11;
        } else {
          await page.keyboard.press('ArrowRight');
          await page.waitForTimeout(300);
        }
        continue;
      }
    }

    await page.waitForTimeout(70);
  }
}
