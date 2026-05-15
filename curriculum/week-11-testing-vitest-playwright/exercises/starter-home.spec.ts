// starter-home.spec.ts
//
// Exercise 3 — your starter Playwright test file. Drop this in tests/e2e/ to
// pick it up automatically.
//
// Prerequisite: a local server is running on http://localhost:5173 serving
// the `index.html` from the exercise instructions. Either start it with
// `npx http-server -p 5173 .` or point the dev server at port 5173.
//
// Run: `npx playwright test`
//
// You should end up with three tests — two passing, one deliberately failing
// so you can practice opening the trace viewer.

import { test, expect } from '@playwright/test'

test.describe('home page', () => {
  test('shows the welcome heading', async ({ page }) => {
    // Arrange
    await page.goto('/')

    // Act — none

    // Assert
    await expect(page).toHaveTitle(/Crunch/)
    await expect(
      page.getByRole('heading', { name: /welcome/i, level: 1 }),
    ).toBeVisible()
  })

  test('signing in updates the live region', async ({ page }) => {
    // Arrange
    await page.goto('/')

    // Act
    await page.getByRole('button', { name: /sign in/i }).click()

    // Assert
    await expect(page.getByRole('status')).toHaveText(/you are signed in/i)
  })

  test('navigation links are reachable by role', async ({ page }) => {
    // TODO — write this one yourself.
    //
    // Goal: assert that the primary nav has links named "Home" and "About",
    //       both of which are visible.
    //
    // Hints:
    //   - The nav has aria-label="primary"; you can scope with
    //     page.getByRole('navigation', { name: 'primary' }).getByRole('link', ...)
    //   - There should be exactly two links inside that nav.
    //   - Use toHaveCount(2) on the locator to pin the count.
  })

  // ----- The deliberately-failing test ----------------------------------------
  //
  // Uncomment this test for step 6 of the exercise. Run it, watch it fail,
  // then open the trace viewer with `npx playwright show-trace`.
  //
  // After you have seen the trace, comment it back out (or `.skip` it) so the
  // suite stays green for submission.
  //
  // test('deliberately fails to capture a trace', async ({ page }) => {
  //   await page.goto('/')
  //   await expect(
  //     page.getByRole('heading', { name: /goodbye/i }),
  //   ).toBeVisible()
  // })
})

// ============================================================================
// Reflection — answer these in a comment block below before submitting.
// ============================================================================
//
// 1. The "shows the welcome heading" test asserts twice — once on the page
//    title and once on the heading. Is this one logical assertion or two?
//    Defend the choice.
//
// 2. The deliberately-failing test would have given you no information without
//    the trace. Describe a scenario in your future career where the trace
//    would save you 30 minutes.
//
// 3. The codegen output and a human-written test differ. Name one specific
//    cleanup you would make to typical codegen output before committing.
//
// Your answers:
//
//
//
//
