// tests/e2e/fixtures.ts
//
// Playwright fixtures for the mini-project's e2e suite.
//
// The `loggedInPage` fixture is worker-scoped — it signs in once per parallel
// worker against the local Keycloak realm and yields a page already in the
// post-authentication state. Tests that need an authenticated user destructure
// `loggedInPage` instead of `page` and skip the sign-in cost.
//
// Reference:
//   - Playwright fixtures: https://playwright.dev/docs/test-fixtures
//   - Playwright auth:     https://playwright.dev/docs/auth

import { test as base, expect, type Page } from '@playwright/test'

type AuthFixtures = {
  /**
   * A Page that is already signed in. Worker-scoped — runs the sign-in flow
   * once per worker. Cleans up the browser context when the worker tears down.
   */
  loggedInPage: Page
}

// The username and password are seeded by the Keycloak realm export in
// `keycloak/realm-export.json`. They are NOT secrets — they are local-only
// development credentials.
const USERNAME = 'learner'
const PASSWORD = 'learner-pass'

export const test = base.extend<{}, AuthFixtures>({
  loggedInPage: [
    async ({ browser }, use) => {
      const context = await browser.newContext()
      const page = await context.newPage()

      // Drive the SPA's sign-in button to the IdP.
      await page.goto('/')
      await page.getByRole('button', { name: /sign in/i }).click()

      // We are now on the Keycloak login page.
      await page.getByLabel(/username or email/i).fill(USERNAME)
      await page.getByLabel(/^password$/i).fill(PASSWORD)
      await page.getByRole('button', { name: /sign in/i }).click()

      // After the callback, the SPA renders the profile page.
      await expect(
        page.getByRole('heading', { name: /profile/i }),
      ).toBeVisible({ timeout: 15_000 })

      // Hand the authenticated page to every test on this worker.
      await use(page)

      // Tear down at worker end.
      await context.close()
    },
    { scope: 'worker' },
  ],
})

export { expect }
