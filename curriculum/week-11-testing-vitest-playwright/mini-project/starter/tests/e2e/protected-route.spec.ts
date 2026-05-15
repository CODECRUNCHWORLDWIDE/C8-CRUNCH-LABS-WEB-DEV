// tests/e2e/protected-route.spec.ts
//
// End-to-end tests for the protected-route behavior:
//   - Unauthenticated users navigating to /profile are redirected to Keycloak.
//   - Authenticated users navigating to /profile see the page.

import { test, expect } from '@playwright/test'
import { test as authTest } from './fixtures'

test.describe('protected route, unauthenticated', () => {
  test('redirects to Keycloak when /profile is accessed without auth', async ({ page }) => {
    await page.goto('/profile')

    // Keycloak's login page is on a different origin. The redirect should land
    // us on http://localhost:8080/realms/crunch/protocol/openid-connect/auth?...
    await expect(page).toHaveURL(/localhost:8080.*openid-connect\/auth/)
    await expect(
      page.getByRole('heading', { name: /sign in to your account/i }),
    ).toBeVisible()
  })
})

authTest.describe('protected route, authenticated', () => {
  authTest('renders the profile page', async ({ loggedInPage }) => {
    await loggedInPage.goto('/profile')

    await expect(
      loggedInPage.getByRole('heading', { name: /profile/i }),
    ).toBeVisible()
    // The decoded JWT claims should be on the page.
    await expect(loggedInPage.getByText(/learner/i).first()).toBeVisible()
  })

  authTest('shows the JWT expiry in a human-readable form', async ({ loggedInPage }) => {
    await loggedInPage.goto('/profile')

    // The expiry is rendered in a status region with role="timer" or text
    // matching "expires in" — both forms are acceptable.
    const expiryText = loggedInPage.getByText(/expires in \d+/i)
    await expect(expiryText).toBeVisible()
  })
})
