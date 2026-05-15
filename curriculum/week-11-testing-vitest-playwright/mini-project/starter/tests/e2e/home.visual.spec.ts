// tests/e2e/home.visual.spec.ts
//
// Visual regression suite. Runs only in the `visual` project (Chromium only,
// Linux baseline canonical). See playwright.config.ts.
//
// Baseline workflow:
//   1. First local run records a platform-local baseline. Inspect it visually.
//   2. The non-Linux baselines are gitignored; only the Linux baseline is
//      committed.
//   3. Generate the Linux baseline either by running CI and downloading the
//      artifact, or by running locally inside the Playwright Docker image.
//
// To update intentionally:
//   $ npm run test:visual:update
//   $ # inspect the new screenshots, commit them.

import { test, expect } from '@playwright/test'

test.describe('visual: home page', () => {
  test('matches the unauthenticated home baseline', async ({ page }) => {
    await page.goto('/')

    // Wait for the page to settle — every dynamic element must be in its final
    // state before the screenshot is taken.
    await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible()
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()

    // Reduce motion to stop any CSS animations that would jitter the diff.
    await page.emulateMedia({ reducedMotion: 'reduce' })

    await expect(page).toHaveScreenshot('home-unauthenticated.png', {
      fullPage: true,
      maxDiffPixelRatio: 0.01,
    })
  })
})

test.describe('visual: keycloak login page', () => {
  test('matches the Keycloak login baseline', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: /sign in/i }).click()

    // We are on Keycloak now.
    await expect(
      page.getByRole('heading', { name: /sign in to your account/i }),
    ).toBeVisible()

    await page.emulateMedia({ reducedMotion: 'reduce' })

    await expect(page).toHaveScreenshot('keycloak-login.png', {
      fullPage: true,
      // Keycloak's font rendering jitters slightly across runs; allow 2%.
      maxDiffPixelRatio: 0.02,
    })
  })
})
