# Lecture 3 — Playwright, Fixtures, Traces, Visual Regression, and CI

> *Lectures 1 and 2 built the foundation and the middle of the test pyramid. This lecture climbs to the top: end-to-end tests in a real browser, against the real app, exercising the real user flow. Playwright is the tool; fixtures are the unit of reuse; traces are the debugging mechanism; visual regression with `toHaveScreenshot` catches the bugs the DOM assertions miss; GitHub Actions is the CI substrate. By the end you should be able to install Playwright, write a first e2e against your Week 10 SPA, share a logged-in session across tests with a fixture, capture a trace on a failed run, add a visual-regression check, and wire the whole thing into GitHub Actions so it runs on every push.*

End-to-end tests are the most expensive tests in your suite — they take seconds instead of milliseconds, they run a full browser process, they touch the network, the auth provider, and the rendered pixels — and the marginal value of the tenth e2e test is much lower than the value of the first. The Google Testing Blog post linked in lecture 1 ("Just Say No to More End-to-End Tests") is right: write **few** of them, and write them carefully. The half-dozen-to-three-dozen tests at the top of the pyramid cover your critical flows; everything else lives in the component tier.

Playwright is the tool because:

1. **It drives all three major engines** — Chromium (Chrome, Edge), Gecko (Firefox), and **WebKit** (Safari) — from a single Node process on any OS. You catch Safari bugs on a Linux CI runner without a Mac farm. Cypress drives only Chromium until you buy the Cypress Enterprise tier; Selenium drives all three but with much more ceremony.
2. **It auto-waits on every action.** `await page.getByRole('button').click()` does not need an explicit "wait for the button to be visible and enabled" — Playwright handles it. Flakes from "the button was not ready" disappear.
3. **The trace viewer is free and excellent.** Every action, every network request, every console message, every screenshot at every step, packaged into a `trace.zip` you open with `npx playwright show-trace`. CI flakes that used to require re-running the test become debuggable from the artifacts of the original run.
4. **Built-in parallelism, no paid dashboard.** Playwright runs tests across workers in parallel by default. Cypress's parallel mode requires the paid Cypress Cloud dashboard.
5. **License: Apache 2.0. Cost: zero.**

The mental model coming from a Cypress background: Playwright is similar in shape — a test runner, a page object, locator-based queries, command chaining — but the philosophy is closer to the Testing Library priority list. `page.getByRole(...)` is the first query you reach for; `page.locator('[data-test-id="..."]')` is the last. The auto-wait removes the need for `cy.wait` and `cy.contains` retry logic. The trace viewer is the killer feature.

---

## 1. Install and the first test

In the same repo as the Week 10 SPA:

```bash
npm init playwright@latest
```

The installer asks a few questions:

- **TypeScript or JavaScript?** TypeScript. The Playwright API is heavily typed; you want the autocomplete.
- **Where to put tests?** `tests/e2e`. Keep Playwright tests separate from Vitest tests — they run from different commands and would otherwise confuse the test discovery.
- **GitHub Actions workflow?** Yes. We will tune the workflow later; the scaffolded one is a good starting point.
- **Install browsers?** Yes. Playwright downloads Chromium, Firefox, and WebKit binaries (~300MB total). The download is one-time; subsequent installs are cached.

The installer creates:

- `playwright.config.ts` — the project config.
- `tests/e2e/example.spec.ts` — a sample test against playwright.dev.
- `.github/workflows/playwright.yml` — the CI workflow.
- `package.json` updates with `@playwright/test` as a dev dependency.

Read `playwright.config.ts`:

```ts
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox',  use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit',   use: { ...devices['Desktop Safari'] } },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
  },
})
```

Twelve config keys; each one matters:

- **`testDir`** — where the `.spec.ts` files live. Playwright recurses.
- **`fullyParallel: true`** — tests **within a single file** run in parallel (each in its own browser context). Without this, tests within a file run sequentially. Combined with the multiple workers, you get max parallelism.
- **`forbidOnly: !!process.env.CI`** — fails the CI run if anyone left a `test.only` in their commit. A near-zero-cost protection against the "I committed my debugging mode" mistake.
- **`retries: process.env.CI ? 2 : 0`** — locally, fail fast. In CI, retry twice before failing. Tests that pass on retry are flagged in the report as flakes; you fix them, you do not paper over them.
- **`workers: process.env.CI ? 1 : undefined`** — local: as many workers as the CPU has cores. CI: one worker, because a typical CI runner has 2 cores and the parallelism overhead is worse than the benefit. Tune this per-runner if you have bigger CI.
- **`reporter: 'html'`** — Playwright writes a self-contained HTML report to `playwright-report/`. Open it with `npx playwright show-report`. On CI, upload the folder as an artifact.
- **`use.baseURL`** — every `page.goto('/')` is relative to this. Change once when the dev port changes.
- **`use.trace: 'on-first-retry'`** — capture a full trace on the first retry of a failing test. `'on'` captures every test (large artifacts); `'retain-on-failure'` captures every test but only keeps failed ones. `'on-first-retry'` is the recommended balance.
- **`projects`** — one project per browser. Each test runs once per project. `npx playwright test --project=chromium` runs only the Chromium project.
- **`webServer`** — Playwright will run `npm run dev` and wait for `http://localhost:5173` to respond before starting tests. `reuseExistingServer: !process.env.CI` means "if you already have the dev server running locally, use it; on CI, always start fresh."

Two more package.json scripts:

```json
{
  "scripts": {
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:e2e:report": "playwright show-report"
  }
}
```

`npm run test:e2e:ui` opens the **Playwright UI mode** — a desktop app with the test tree on the left, the timeline of actions on the right, and a step-through debugger. It is the single best development environment for Playwright tests; the watch-and-re-run loop is sub-second.

---

## 2. The first test

The auto-generated `example.spec.ts` tests playwright.dev. Replace it with one that tests your app. Create `tests/e2e/home.spec.ts`:

```ts
import { test, expect } from '@playwright/test'

test('the home page loads and shows the sign-in button', async ({ page }) => {
  await page.goto('/')

  await expect(page).toHaveTitle(/Crunch/)
  await expect(page.getByRole('heading', { name: /welcome/i })).toBeVisible()
  await expect(page.getByRole('button', { name: /sign in/i })).toBeEnabled()
})

test('clicking the heading does nothing', async ({ page }) => {
  await page.goto('/')

  await page.getByRole('heading', { name: /welcome/i }).click()

  await expect(page).toHaveURL('/')
})
```

Two tests. Three things to notice:

1. **The query API is identical to Testing Library.** `page.getByRole(...)`, `page.getByLabel(...)`, `page.getByText(...)`. Same priority list. The transfer from a Testing Library mindset is direct.
2. **The assertion API uses `await expect(...)`** for **web-first assertions**. `expect(page.getByRole(...)).toBeVisible()` does not fail immediately — it retries for the default timeout (5 seconds) until the element is visible. **This is the auto-wait feature** and it is the main reason Playwright tests are stable.
3. **The `page` argument is a fixture.** Playwright's `test` function takes a callback whose first argument is a destructured fixture set. `page` is the default — a fresh browser page per test. We will define more fixtures in section 4.

Run the tests:

```bash
npm run test:e2e
```

Playwright starts the dev server, opens Chromium / Firefox / WebKit, runs both tests in all three browsers (six runs), and writes the report to `playwright-report/`. Open with `npx playwright show-report`.

---

## 3. Locators and the priority list, again

Playwright's [locator docs](https://playwright.dev/docs/locators) recommend the same priority order as Testing Library:

1. **`page.getByRole('button', { name: 'Sign in' })`** — the first reach.
2. **`page.getByLabel('Email')`** — for form fields.
3. **`page.getByPlaceholder('your@email.com')`** — placeholder fallback.
4. **`page.getByText('Welcome back')`** — for non-interactive content.
5. **`page.getByAltText('Profile photo')`** — images.
6. **`page.getByTitle('Settings')`** — rare.
7. **`page.getByTestId('user-card')`** — last resort.

The Playwright maintainers and the Testing Library maintainers explicitly aligned on this list. The reasons are the same: queries from the user's point of view double as accessibility checks, and the test survives DOM-structure refactors.

### The `test-id` opinion

Playwright lets you configure `testIdAttribute`:

```ts
use: { testIdAttribute: 'data-test' }
```

Resist the urge to set this **so you can sprinkle `data-test` attributes** through the markup. The lesson is the same as in Vitest: every `data-test` attribute is a tax, a piece of test-only metadata in production markup, and a missed opportunity to ship better accessible names. Use `getByRole` first; fall back only when nothing accessible exists.

### Web-first assertions — auto-retrying

The `expect(locator).toBeVisible()` form retries for up to 5 seconds. The full list of web-first assertions:

```ts
await expect(locator).toBeVisible()
await expect(locator).toBeHidden()
await expect(locator).toBeEnabled()
await expect(locator).toBeDisabled()
await expect(locator).toBeChecked()
await expect(locator).toBeFocused()
await expect(locator).toBeEmpty()
await expect(locator).toHaveText('exact')
await expect(locator).toContainText('substring')
await expect(locator).toHaveValue('input value')
await expect(locator).toHaveCount(3)
await expect(locator).toHaveAttribute('href', '/profile')
await expect(locator).toHaveCSS('color', 'rgb(0, 0, 0)')
await expect(page).toHaveURL(/\/profile$/)
await expect(page).toHaveTitle('Crunch')
```

Every one of these retries. **Never** write:

```ts
// ❌ never
await page.waitForTimeout(1000)
expect(await page.textContent('h1')).toBe('Welcome')

// ✓ instead
await expect(page.getByRole('heading', { level: 1 })).toHaveText('Welcome')
```

`waitForTimeout` is to Playwright what `sleep` is to a shell script — the wrong tool. The web-first assertions do the waiting; trust them.

---

## 4. Fixtures — the unit of reuse

Fixtures are Playwright's setup-and-teardown mechanism. The built-in `page` fixture is the most-used; you can define your own with `test.extend`.

A common need: a logged-in page. Without a fixture, every test that needs an authenticated user has to navigate to `/login`, fill in credentials, wait for the redirect — taking 5–10 seconds per test. With a worker-scoped fixture, you authenticate once per worker and inject the post-login `page` into each test.

Create `tests/e2e/fixtures.ts`:

```ts
import { test as base, expect } from '@playwright/test'
import path from 'node:path'

type AuthFixtures = {
  loggedInPage: import('@playwright/test').Page
}

export const test = base.extend<{}, AuthFixtures>({
  loggedInPage: [
    async ({ browser }, use) => {
      // This runs once per worker.
      const storageStatePath = path.join(
        __dirname,
        '..',
        '.playwright-auth',
        `${test.info().parallelIndex}.json`,
      )

      // Create a browser context, sign in, save storage state, inject page.
      const context = await browser.newContext()
      const page = await context.newPage()

      await page.goto('/')
      await page.getByRole('button', { name: /sign in/i }).click()
      // Keycloak login form
      await page.getByLabel(/username/i).fill('learner')
      await page.getByLabel(/password/i).fill('learner-pass')
      await page.getByRole('button', { name: /sign in/i }).click()
      // wait for the callback to land us back on the SPA
      await expect(page.getByRole('heading', { name: /profile/i })).toBeVisible()

      await context.storageState({ path: storageStatePath })

      await use(page)

      await context.close()
    },
    { scope: 'worker' },
  ],
})

export { expect }
```

Use it:

```ts
import { test, expect } from './fixtures'

test('the profile page shows the user name', async ({ loggedInPage }) => {
  await loggedInPage.goto('/profile')
  await expect(loggedInPage.getByRole('heading', { name: /ada lovelace/i })).toBeVisible()
})
```

Two things to notice:

1. **`{ scope: 'worker' }`** — the fixture's setup runs **once per worker**, and every test on that worker shares the same `loggedInPage`. With 4 workers and 50 tests, you sign in 4 times instead of 50.
2. **The fixture handles teardown.** After the `await use(page)`, control returns to the fixture for cleanup. `context.close()` releases the browser pages.

### The `storageState` shortcut

For sites that store auth in cookies or `localStorage`, Playwright's [storage state](https://playwright.dev/docs/auth) is even cleaner. Sign in once in a global setup, save the cookies and `localStorage` to a JSON file, then `use.storageState: 'auth.json'` in the config:

```ts
// global-setup.ts
import { chromium } from '@playwright/test'

async function globalSetup() {
  const browser = await chromium.launch()
  const page = await browser.newPage()
  await page.goto('http://localhost:5173/')
  await page.getByRole('button', { name: /sign in/i }).click()
  // ... full login flow ...
  await page.context().storageState({ path: 'tests/e2e/.auth/user.json' })
  await browser.close()
}

export default globalSetup
```

Then in `playwright.config.ts`:

```ts
import { defineConfig } from '@playwright/test'

export default defineConfig({
  globalSetup: './tests/e2e/global-setup.ts',
  use: {
    storageState: 'tests/e2e/.auth/user.json',
  },
})
```

Every test starts already authenticated. The downside is no per-worker isolation — every test shares the same storage state, so tests cannot independently mutate it. For SPAs this is usually fine; the auth state is read-only.

---

## 5. Parallel execution

Playwright runs:

- **Workers in parallel.** Each worker is an OS-level Node process with its own browser. The number of workers is the `workers` config option.
- **Files in parallel across workers.** Each worker grabs the next available file from the queue.
- **Tests in parallel within a file** only if `fullyParallel: true` is set. Each test runs in its own browser context within the same worker (cheap; ~50ms setup).

The mental model:

```
worker-1: file-A (tests 1, 2, 3) → file-D → ...
worker-2: file-B (tests 1, 2) → file-E → ...
worker-3: file-C (tests 1, 2, 3, 4) → file-F → ...
worker-4: file-G → ...
```

Within file-A, tests 1, 2, 3 run **simultaneously** if `fullyParallel: true`; otherwise sequentially.

### When to opt out

Some flows are inherently sequential — a test that creates an entity and a test that reads it. Mark the file:

```ts
test.describe.serial('account lifecycle', () => {
  test('creates an account', async () => { /* ... */ })
  test('logs into the new account', async () => { /* ... */ })
  test('deletes the account', async () => { /* ... */ })
})
```

`describe.serial` forces sequential execution within the block. Use sparingly — every sequential block reduces parallelism.

### Per-worker fixtures the right way

Worker-scoped fixtures (the `{ scope: 'worker' }` pattern from section 4) share state across tests on the same worker. If your test mutates state, you may break the next test on the same worker. The safe pattern is:

1. Worker-scoped fixture for **authentication** (read-only after setup).
2. Test-scoped fixtures for **data setup** (each test gets its own seed).

If a worker-scoped fixture caches a mutable record, document it loudly. The bug — "the second test on a worker breaks because the first test deleted the record" — is a Tuesday-morning hour-of-debugging mistake.

---

## 6. Traces — the killer feature

A trace records:

- Every action (`click`, `goto`, `fill`, `waitFor`).
- A DOM snapshot at every action — you can inspect the page at any point in the test.
- Every network request with full headers and body.
- Every `console.log`, `console.error`, and `console.warn` from the page.
- Screenshots at every action.
- The final source of the test, the line that ran, and any errors.

To enable tracing, in `playwright.config.ts`:

```ts
use: {
  trace: 'on-first-retry',
}
```

Options:

- **`'on'`** — every test, always. Large artifacts. Use locally for development.
- **`'off'`** — never. The default; you should change it.
- **`'retain-on-failure'`** — every test, keep only failed ones. Lower CI artifact size.
- **`'on-first-retry'`** — only the first retry. Best for CI; you get a trace exactly when you need it (after a flake), without the overhead of recording every passing test.

After a failed run:

```bash
npx playwright show-trace test-results/home-chromium/trace.zip
```

Opens the trace viewer in your browser. You see the timeline at the top, the DOM at each step in the middle, the action log on the right, network and console at the bottom. **Step through the timeline; the DOM updates live.** Find the action where the page is wrong; the trace tells you exactly which selector did not match, what was on the page instead, and what network request had not landed.

The trace viewer is the answer to the question "why did the test fail in CI but pass locally?" Open the trace from the CI artifact, reproduce the diagnosis in your browser, fix the bug without running the test again. It is the single highest-leverage feature in any modern test runner.

### Pruning trace artifacts in CI

Traces can be hundreds of megabytes per run. In `playwright.config.ts`:

```ts
use: {
  trace: 'on-first-retry',
  screenshot: 'only-on-failure',
  video: 'retain-on-failure',
}
```

This combination — trace on first retry, screenshot only on failure, video only retained on failure — keeps artifacts small while giving you everything you need to debug a real failure.

---

## 7. Visual regression with `toHaveScreenshot`

The DOM-assertion approach catches structural changes; it cannot catch:

- A CSS bug that hides content behind another element.
- A color regression that makes white text appear on a white background.
- A font-loading regression where the page renders for a frame in the wrong font.
- A logo that disappeared.

Visual regression — taking a screenshot of the rendered page and comparing pixel-by-pixel against a baseline — catches all of those. Playwright ships [`toHaveScreenshot`](https://playwright.dev/docs/test-snapshots) for this:

```ts
test('the profile page matches the baseline', async ({ loggedInPage }) => {
  await loggedInPage.goto('/profile')
  await expect(loggedInPage.getByRole('main')).toHaveScreenshot('profile.png', {
    maxDiffPixelRatio: 0.01,
  })
})
```

First run: Playwright records the baseline at `tests/e2e/home.spec.ts-snapshots/profile-chromium-linux.png` (or your platform). Subsequent runs: Playwright takes a new screenshot, compares pixel-by-pixel, and fails if the diff exceeds the threshold.

### The platform problem

Screenshots are platform-sensitive. A screenshot taken on macOS rendering a heading in San Francisco does not match a screenshot taken on Linux rendering the same heading in DejaVu Sans. Playwright stores baselines per-browser-per-platform — `profile-chromium-linux.png` is different from `profile-chromium-darwin.png`.

The canonical baseline is **the Linux one**, because that is what CI runs on. The recommended workflow:

1. Locally: write the test, run it once with `--update-snapshots` to record a local baseline. Verify visually.
2. Push to CI. The CI run records the Linux baseline.
3. Commit the Linux baseline (only) to the repo.
4. Locally, you ignore the macOS baseline (gitignore the macOS variant) and trust the Linux one. On a Mac with no Linux baseline, the test will record one on first run; do not commit it.

The `.gitignore` entry:

```
tests/e2e/**/*-darwin.png
tests/e2e/**/*-win32.png
```

The pragmatic alternative is to run the visual tests **only in CI**, by tagging them:

```ts
test('visual', async () => { /* ... */ })
```

```ts
// playwright.config.ts
projects: [
  {
    name: 'visual',
    use: { ...devices['Desktop Chrome'] },
    testMatch: '**/*.visual.spec.ts',
  },
]
```

And in CI, run `npx playwright test --project=visual`. Local engineers run the regular suite without the platform-mismatch worry.

### Updating a baseline

When the visual change is intentional (you redesigned the profile page):

```bash
npx playwright test --update-snapshots
```

Review the new screenshots before committing. **Never** run `--update-snapshots` blindly; the whole point of the test is that visual changes are reviewed.

### Threshold tuning

`maxDiffPixelRatio: 0.01` allows 1% of pixels to differ. The defaults are stricter; raise the threshold if anti-aliasing differences between CI runs produce false positives. The honest answer: 0% works for most pages if you control the rendering deterministically (web-font fallbacks aligned, dynamic content masked).

### Masking dynamic content

A page with a timestamp ("Last updated 14 minutes ago") will fail visual regression every run. Mask the dynamic regions:

```ts
await expect(page).toHaveScreenshot({
  mask: [page.getByTestId('timestamp')],
})
```

Or render-test with a fixed clock:

```ts
await page.clock.install({ time: new Date('2026-05-14T12:00:00Z') })
```

---

## 8. The codegen workflow

Playwright ships [`codegen`](https://playwright.dev/docs/codegen):

```bash
npx playwright codegen http://localhost:5173
```

Opens a browser plus an inspector window. **Click around in the browser; Playwright writes the test in the inspector.** Every action — click, type, navigate — becomes a line of test code. When you are done, copy the code into a `.spec.ts` file.

The codegen output is good for first drafts and bad for committed tests. The output uses `getByRole` and accessible queries when it can but falls back to brittle CSS selectors when the markup is weak. **Always clean up codegen output** before committing:

- Replace brittle selectors with `getByRole`.
- Remove redundant waits.
- Add meaningful test names and `describe` blocks.
- Add the assertions that codegen does not generate (codegen records actions, not assertions).

Treat codegen as the autocomplete of test writing, not as the test author.

---

## 9. GitHub Actions integration

The scaffolded `.github/workflows/playwright.yml`:

```yaml
name: Tests

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    timeout-minutes: 60
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run Vitest unit and component tests
        run: npm run test:run

      - name: Install Playwright browsers
        run: npx playwright install --with-deps

      - name: Run Playwright e2e tests
        run: npx playwright test

      - name: Upload Playwright report
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 14
```

Seven steps. Five things to notice:

1. **`actions/setup-node@v4` with `cache: 'npm'`** — caches `~/.npm`. First run is ~30 seconds for `npm ci`; subsequent runs are ~5 seconds.
2. **`npm run test:run` for Vitest before Playwright** — Vitest is faster; fail fast on cheap tests before paying for the e2e suite.
3. **`npx playwright install --with-deps`** — downloads the browser binaries and installs the system libraries Chromium / Firefox / WebKit need on Ubuntu. The `--with-deps` flag is the difference between "the browser starts" and "the browser starts on a CI runner."
4. **`if: always()` on the artifact upload** — even if the previous step failed, upload the report. Otherwise the report is lost on failure, which is exactly when you need it.
5. **Artifact retention 14 days** — the GitHub Actions default is 90 days. For Playwright reports, 14 is plenty and saves storage.

The CI matrix — running across multiple Node versions, multiple OSes — is optional. For a frontend SPA, Linux + Node 20 is usually enough; the test is about the app behavior, not the Node version.

### Sharding — for fast CI on big suites

When the e2e suite grows to hundreds of tests, a single runner takes 20+ minutes. Playwright supports [sharding](https://playwright.dev/docs/test-sharding):

```yaml
strategy:
  fail-fast: false
  matrix:
    shard: [1, 2, 3, 4]
steps:
  # ...
  - run: npx playwright test --shard=${{ matrix.shard }}/4
```

Four runners each take a quarter of the tests; total wall-clock drops 4x. The downside is more GitHub Actions minutes; for an OSS project on the free 2000-minutes/month tier, the math is generous. For a private repo paying per minute, balance the speed vs. cost.

---

## 10. Debugging a CI flake — the workflow

A test fails on CI. The workflow:

1. **Open the GitHub Actions run.** Find the "Upload Playwright report" step. Download the `playwright-report` artifact.
2. **Unzip locally.** Open `playwright-report/index.html` in a browser. The dashboard shows every test, every retry, and the failure reason.
3. **Click into the failed test.** The report links to the trace.
4. **Open the trace.** `npx playwright show-trace path/to/trace.zip`. Step through the timeline; find the action where the page is wrong.
5. **Reproduce locally if you can.** `npx playwright test path/to/file.spec.ts --headed --debug` opens the test in a real browser with the Playwright Inspector attached. Pause, inspect, fix.
6. **Add an assertion that would have caught the bug earlier.** Sometimes the flake is the test's fault (a missing `await`, a race between the click and the assertion); sometimes it is the app's fault (a real bug). Either way, the test should be tightened.

The key insight: **you do not re-run the failed CI job to debug.** You debug from the trace, push the fix, and trust the CI re-run. Re-running a flake to see if it passes is the anti-pattern.

---

## 11. A note on Cypress

If you have used Cypress, here is the diff:

- **Selectors:** Cypress uses jQuery-style selectors (`cy.get('.btn')`) by default; Playwright uses accessible-first locators. The Cypress Testing Library plugin closes the gap, but you have to install and use it.
- **Auto-wait:** Both auto-wait. Cypress retries `cy.contains`; Playwright's web-first assertions retry every assertion.
- **Browsers:** Cypress drives Chromium, Firefox, and (since 10.x) WebKit-experimental. Playwright drives all three with first-class support.
- **Parallelism:** Cypress requires the paid Cypress Cloud for parallel runs. Playwright is parallel by default.
- **Trace:** Cypress has the Cypress Cloud's Test Replay. Playwright has the open-source trace viewer. Both are good; the Playwright one is free.
- **Cost:** Cypress is free for OSS, paid for parallel. Playwright is free.

Pick Playwright for a greenfield project in 2026. If you inherit a Cypress suite, the migration is mechanical but real — budget a week. If you are job-hunting in 2026, Cypress experience still gets you in the door at many companies; Playwright experience is becoming the default.

---

## 12. The five anti-patterns in e2e

Lecture 2 had five anti-patterns for unit and component tests. Here are five for e2e:

### 1. `page.waitForTimeout(N)`

```ts
// ❌
await page.click('button')
await page.waitForTimeout(2000)
await expect(page.locator('.result')).toBeVisible()
```

The same flake source as in component tests. **Fix:** rely on web-first assertions. `toBeVisible()` retries automatically.

### 2. Logging in inside every test

```ts
// ❌
test('test 1', async ({ page }) => {
  await login(page)
  // ...
})
test('test 2', async ({ page }) => {
  await login(page)
  // ...
})
```

Pay the login cost N times instead of once. **Fix:** use a worker-scoped fixture or `storageState`.

### 3. Brittle selectors

```ts
// ❌
await page.locator('div > div > button:nth-child(2)').click()
```

Breaks on any structural refactor. **Fix:** `page.getByRole('button', { name: /save/i })`.

### 4. No trace in CI

```ts
// playwright.config.ts
use: { trace: 'off' }
```

The first CI flake is undebuggable. **Fix:** `trace: 'on-first-retry'`.

### 5. Sharing global state across tests

```ts
// ❌
const sharedData = {}
test('test 1', async ({ page }) => {
  sharedData.foo = await page.evaluate(() => window.foo)
})
test('test 2', async ({ page }) => {
  expect(sharedData.foo).toBe('bar') // depends on test 1 having run
})
```

Tests must run independently. The parallel runner will break this. **Fix:** every test sets up its own world.

---

## 13. What to test end-to-end

A short list, drawn from the lecture-1 principle "the few critical flows":

- **Sign in.** The full OAuth round-trip from the app to Keycloak and back, with a successful token exchange and the profile page loaded.
- **Sign out.** Click sign-out, verify the session is cleared and the home page returns.
- **The protected route, unauthenticated.** Navigate to `/profile` without signing in; verify the redirect to the IdP.
- **The protected route, authenticated.** Navigate to `/profile` after signing in; verify the page loads.
- **A primary action.** The single most important thing the app does. For a chat app, "send a message and see it appear." For a payments app, "make a payment and see the confirmation."
- **A primary failure mode.** The same primary action, but with the network returning a 500. Verify the error UI.
- **The 404.** Navigate to a non-existent route; verify the 404 page.

That is six to eight tests. Multiply by three browsers (Chromium, Firefox, WebKit) and you get 18–24 test executions, running in 2–5 minutes parallel. That is the budget for the top of the pyramid.

Anything beyond this list, ask: **could a component test cover it?** Usually the answer is yes.

---

## Up next

That is the full theory stack. The exercises take the next three lectures' worth of code into your hands; the mini-project ties the whole pyramid together against the Week 10 SPA. By Sunday, the suite is running, the CI is green, and you have a trace artifact from a deliberately-failed test as proof of concept.

---

## Quick-reference

- **Install:** `npm init playwright@latest`.
- **Config:** `playwright.config.ts` with `fullyParallel: true`, `trace: 'on-first-retry'`, three browser projects, the `webServer` block.
- **Locators:** `page.getByRole(...)` first, `page.getByTestId(...)` last. Same priority list as Testing Library.
- **Web-first assertions:** `await expect(locator).toBeVisible()` retries up to 5 seconds. Never `waitForTimeout`.
- **Fixtures:** `test.extend` defines reusable setup. `{ scope: 'worker' }` shares across tests on a worker. `storageState` shares auth across all workers.
- **Parallelism:** workers in parallel, files in parallel, tests in parallel within a file (with `fullyParallel`). `test.describe.serial` opts out where state must be sequential.
- **Traces:** `trace: 'on-first-retry'` captures the killer-feature debug artifact. `npx playwright show-trace trace.zip` opens it.
- **Visual regression:** `await expect(locator).toHaveScreenshot()`. Linux baseline is canonical; `.gitignore` other platforms. Mask dynamic regions.
- **CI:** GitHub Actions, `actions/setup-node` with npm cache, `npx playwright install --with-deps`, upload `playwright-report` artifact.
- **Six to eight e2e tests.** Critical flows only. Everything else is a component test.
