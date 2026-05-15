// tests/e2e/home.spec.ts
//
// End-to-end tests for the unauthenticated home page. These tests do NOT
// require Keycloak to be running; they exercise only the SPA shell.

import { test, expect } from '@playwright/test'

test.describe('home page', () => {
  test('shows the welcome heading and the sign-in button', async ({ page }) => {
    // Arrange
    await page.goto('/')

    // Assert
    await expect(page).toHaveTitle(/Crunch/)
    await expect(
      page.getByRole('heading', { name: /welcome/i, level: 1 }),
    ).toBeVisible()
    await expect(
      page.getByRole('button', { name: /sign in/i }),
    ).toBeEnabled()
  })

  test('does not show user name when unauthenticated', async ({ page }) => {
    await page.goto('/')

    // The post-login content should not be present.
    await expect(
      page.getByRole('heading', { name: /profile/i }),
    ).toHaveCount(0)
    await expect(
      page.getByRole('button', { name: /sign out/i }),
    ).toHaveCount(0)
  })

  test('the primary navigation exposes the expected links', async ({ page }) => {
    await page.goto('/')

    const nav = page.getByRole('navigation', { name: /primary/i })
    await expect(nav.getByRole('link')).toHaveCount(2)
    await expect(nav.getByRole('link', { name: /home/i })).toBeVisible()
    await expect(nav.getByRole('link', { name: /about/i })).toBeVisible()
  })
})
