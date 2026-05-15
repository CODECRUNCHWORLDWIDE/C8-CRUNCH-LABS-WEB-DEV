// tests/e2e/sign-in.spec.ts
//
// End-to-end tests for the OIDC + PKCE sign-in flow against the local
// Keycloak realm.
//
// REQUIRES Keycloak to be running on localhost:8080 — see docker-compose.yml.

import { test, expect } from './fixtures'

test.describe('sign-in flow', () => {
  test('signs in via Keycloak and lands on the profile page', async ({ loggedInPage }) => {
    // The fixture has already driven the sign-in flow. Assert that the
    // landed-state is as expected.
    await expect(
      loggedInPage.getByRole('heading', { name: /profile/i }),
    ).toBeVisible()
    await expect(
      loggedInPage.getByRole('button', { name: /sign out/i }),
    ).toBeVisible()
  })

  test('displays the signed-in user name', async ({ loggedInPage }) => {
    await expect(loggedInPage.getByText(/learner/i).first()).toBeVisible()
  })

  test('sign-out returns to the unauthenticated home page', async ({ loggedInPage }) => {
    await loggedInPage.getByRole('button', { name: /sign out/i }).click()

    await expect(
      loggedInPage.getByRole('button', { name: /sign in/i }),
    ).toBeVisible()
    await expect(
      loggedInPage.getByRole('button', { name: /sign out/i }),
    ).toHaveCount(0)
  })
})
