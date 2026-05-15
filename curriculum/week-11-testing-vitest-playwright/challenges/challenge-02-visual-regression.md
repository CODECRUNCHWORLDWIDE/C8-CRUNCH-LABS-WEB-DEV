# Challenge 2 — Visual regression with Playwright

> *Time budget: 90 minutes. Goal: add a visual-regression suite to the Week 10 SPA using Playwright's `toHaveScreenshot`. Handle the cross-platform-baseline question. Configure CI so the Linux baseline is the canonical one. By the end you should be able to add a screenshot diff for any page in your real codebase and know how to update the baseline when the change is intentional.*

## Background

The DOM-assertion approach to e2e testing catches structural and behavioral regressions. It cannot catch:

- A CSS bug that hides content behind a navbar.
- A color regression that makes the warning state look like the success state.
- A font-loading regression that renders a frame of unstyled text.
- A logo that quietly disappeared because the asset path is wrong.

For these, you need to compare the rendered pixels against a baseline. Playwright's `toHaveScreenshot` does this in 3 lines and ships in the box. The trade-off is the platform-baseline problem — screenshots are different on Linux, macOS, and Windows because the system fonts and the anti-aliasing differ — and the workflow for keeping the baseline current.

## What you build

A visual-regression suite for the Week 10 SPA with at least three screenshots:

1. **The unauthenticated home page** — the sign-in button, the marketing copy.
2. **The Keycloak login page** — the IdP's form (this catches IdP version drifts).
3. **The post-login profile page** — the user's name, the rendered claims.

And a CI workflow change so the visual tests run against the Linux baseline only.

## Step 1 — set up the visual-test project

In `playwright.config.ts`, add a separate project for visual tests:

```ts
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
      testIgnore: '**/*.visual.spec.ts',
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
      testIgnore: '**/*.visual.spec.ts',
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
      testIgnore: '**/*.visual.spec.ts',
    },
    {
      name: 'visual',
      use: { ...devices['Desktop Chrome'] },
      testMatch: '**/*.visual.spec.ts',
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
  },
})
```

The visual project runs only `*.visual.spec.ts` files, only on Chromium. The regular projects ignore those files.

Add to `package.json`:

```json
{
  "scripts": {
    "test:visual": "playwright test --project=visual",
    "test:visual:update": "playwright test --project=visual --update-snapshots"
  }
}
```

## Step 2 — write the home-page screenshot test

Create `tests/e2e/home.visual.spec.ts`:

```ts
import { test, expect } from '@playwright/test'

test.describe('visual: home page', () => {
  test('matches the unauthenticated home baseline', async ({ page }) => {
    await page.goto('/')

    // Wait for the page to settle.
    await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible()

    // Mask any dynamic regions (timestamps, animated elements).
    await expect(page).toHaveScreenshot('home-unauthenticated.png', {
      fullPage: true,
      maxDiffPixelRatio: 0.01,
    })
  })
})
```

First run:

```bash
npm run test:visual
```

Locally on macOS, this records `home.visual.spec.ts-snapshots/home-unauthenticated-visual-darwin.png`. You should see the test pass.

## Step 3 — write the Keycloak-login screenshot test

```ts
test('matches the keycloak login baseline', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: /sign in/i }).click()

  // We are now on the Keycloak page.
  await expect(
    page.getByRole('heading', { name: /sign in to your account/i }),
  ).toBeVisible()

  await expect(page).toHaveScreenshot('keycloak-login.png', {
    fullPage: true,
    maxDiffPixelRatio: 0.02, // Keycloak's font rendering is slightly variable.
  })
})
```

This screenshot catches Keycloak version drift. If you upgrade Keycloak and the login page changes, the test fails and forces a deliberate baseline update.

## Step 4 — write the profile-page screenshot test (with login fixture)

This one needs an authenticated session. Use a fixture from the mini-project's `fixtures.ts` (or write a quick one inline):

```ts
import { test, expect } from './fixtures'

test('matches the profile page baseline', async ({ loggedInPage }) => {
  await loggedInPage.goto('/profile')

  await expect(
    loggedInPage.getByRole('heading', { name: /profile/i }),
  ).toBeVisible()

  // Mask the JWT expiry timestamp, which changes every run.
  await expect(loggedInPage).toHaveScreenshot('profile.png', {
    fullPage: true,
    mask: [loggedInPage.getByTestId('jwt-expires-at')],
    maxDiffPixelRatio: 0.01,
  })
})
```

The `mask` option draws a magenta box over the matched elements before the comparison — the timestamp inside the mask is excluded from the diff. **This is the right answer to "the test fails because the timestamp changed."**

## Step 5 — configure the cross-platform baseline policy

Add to `.gitignore`:

```
tests/e2e/**/*-darwin.png
tests/e2e/**/*-win32.png
```

This keeps the macOS and Windows baselines out of git. Only the Linux baseline (named `*-linux.png`) is committed.

**Why?** The CI runner is Linux. The CI run is the source of truth for whether the visual is correct. Local-on-macOS baselines drift from the Linux baselines because of font rendering differences; if you commit both, you have to keep them both in sync, which is busy-work.

The honest workflow:

1. Locally, run the tests. They record a local-platform baseline.
2. Locally, verify the screenshots look right (open the PNG, eyeball it).
3. Commit the test (not the local baseline).
4. Push. CI runs, records the Linux baseline, **CI fails on the first run** because the Linux baseline did not exist.
5. Download the Linux baseline from the CI artifacts; commit it.
6. Push again. CI passes.

There is a less-fiddly version: run the tests inside a Linux Docker container locally. Playwright ships an official Docker image with the browser binaries pre-installed:

```bash
docker run --rm --network host \
  -v "$(pwd):/work" -w /work \
  mcr.microsoft.com/playwright:v1.40.0-jammy \
  npx playwright test --project=visual --update-snapshots
```

Now you generate the Linux baseline locally and commit it directly. This is the recommended approach for teams that care about visual regression.

## Step 6 — update the GitHub Actions workflow

In `.github/workflows/playwright.yml`, add the visual-test step:

```yaml
- name: Run visual regression
  run: npx playwright test --project=visual

- name: Upload visual diffs on failure
  if: failure()
  uses: actions/upload-artifact@v4
  with:
    name: visual-diffs
    path: test-results/**/visual-diff.png
    retention-days: 14
```

On a visual-test failure, the diff PNG (which shows the baseline, the actual, and the highlighted differences in three panels) is uploaded as an artifact. Download it from the failed CI run to see what changed.

## Step 7 — verify the workflow

Make a deliberate visual change — change a button's background color in the SPA. Push to a branch. Open the CI run. The visual test should fail; download the artifact; the diff PNG shows the changed pixels in red.

Decide: was this change intentional?

- **If yes**, regenerate the baseline: `docker run ... --update-snapshots`, commit, push. The next run passes.
- **If no**, fix the code. The next run passes.

This is the deliberate-review-of-visual-change workflow. Every visual change becomes a deliberate decision; no visual change ships unnoticed.

## Step 8 — answer these questions

1. The home-page screenshot catches a CSS regression. Name three categories of bug that the screenshot catches and a DOM-assertion test does not.
2. The Keycloak-login screenshot catches IdP drift. Is this a desirable test? What are the failure modes (false positives) of this test?
3. The `mask` option excludes regions from the diff. What is the alternative — and why is masking usually preferable to using a stable mock for the dynamic data?

## Grading rubric

| Criterion | Weight |
|-----------|--------|
| Three visual tests pass on a Linux baseline | 35% |
| Visual project is separate from the functional projects in `playwright.config.ts` | 15% |
| `.gitignore` excludes non-Linux platform baselines | 10% |
| Dynamic regions are masked appropriately | 15% |
| GitHub Actions workflow uploads diff artifacts on failure | 15% |
| Reflection answers are thoughtful | 10% |

## Reference

- Playwright — Visual comparisons: <https://playwright.dev/docs/test-snapshots>
- Playwright — Docker image: <https://playwright.dev/docs/docker>
- Playwright — Screenshot masking: <https://playwright.dev/docs/screenshots#mask>
- Storybook + Chromatic — for hosted visual regression at scale: <https://www.chromatic.com/> (mentioned as the next step when you outgrow built-in screenshot diff; not used in this challenge)
