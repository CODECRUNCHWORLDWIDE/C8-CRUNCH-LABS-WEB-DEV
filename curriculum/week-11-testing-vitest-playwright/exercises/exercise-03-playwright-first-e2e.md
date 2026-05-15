# Exercise 3 — Your first Playwright end-to-end test

> *Time budget: 1 hour. Goal: install Playwright, write a first end-to-end test against a running local app, capture a trace on a deliberately-failing test, and open the trace in the trace viewer. By the end you should be able to write a Playwright test, run it across three browsers, and debug a failure without re-running the test.*

## Pre-work

You have completed exercises 1 and 2.

You should have already read:

- Lecture 3 — at least sections 1 (install), 2 (the first test), 3 (locators), 6 (traces).
- Playwright — Writing tests: <https://playwright.dev/docs/writing-tests>.

You need:

- A local web server you can hit. Either: (a) the Week 10 SPA dev server running on `http://localhost:5173`, or (b) the standalone HTML page included in `starter-home.spec.ts` setup. We use (b) so the exercise has no Week 10 dependency.

## Step 0 — start a minimal local server

If you do not have the Week 10 SPA handy, run a static-file server against a one-file HTML test page. Create `index.html` at the project root:

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <title>Crunch Test Page</title>
  </head>
  <body>
    <header>
      <h1>Welcome to Crunch</h1>
      <nav aria-label="primary">
        <a href="#home">Home</a>
        <a href="#about">About</a>
      </nav>
    </header>
    <main>
      <p>This is the test target.</p>
      <button type="button" id="sign-in">Sign in</button>
      <div id="msg" role="status" aria-live="polite"></div>
    </main>
    <script>
      document.getElementById('sign-in').addEventListener('click', () => {
        document.getElementById('msg').textContent = 'You are signed in.'
      })
    </script>
  </body>
</html>
```

Serve it on port 5173 (matching the Vite default we use in `playwright.config.ts`):

```bash
npx http-server -p 5173 .
```

Open `http://localhost:5173/` in a browser and confirm the page loads.

## Step 1 — install Playwright

In a separate terminal, from the project root:

```bash
npm init playwright@latest
```

Answer:

- TypeScript
- Tests directory: `tests/e2e`
- GitHub Actions: yes
- Install browsers: yes

The installer downloads Chromium, Firefox, and WebKit. The download is ~300 MB; this is a one-time cost.

After install, you should have:

- `playwright.config.ts` at the project root
- `tests/e2e/example.spec.ts` (sample test against playwright.dev — we will not use this)
- `.github/workflows/playwright.yml`

## Step 2 — adjust the config

Open `playwright.config.ts`. Make sure `baseURL` is set to `http://localhost:5173`:

```ts
use: {
  baseURL: 'http://localhost:5173',
  trace: 'on-first-retry',
}
```

If the config has a `webServer` block pointing at a different command, either remove it (you are starting the server manually) or set it to `'npx http-server -p 5173 .'` with `reuseExistingServer: true`.

## Step 3 — write the first test

Create `tests/e2e/home.spec.ts` (or copy the contents of `starter-home.spec.ts`):

```ts
import { test, expect } from '@playwright/test'

test.describe('home page', () => {
  test('shows the welcome heading', async ({ page }) => {
    // Arrange
    await page.goto('/')

    // Act — none

    // Assert
    await expect(page).toHaveTitle(/Crunch/)
    await expect(page.getByRole('heading', { name: /welcome/i })).toBeVisible()
  })

  test('signing in updates the live region', async ({ page }) => {
    // Arrange
    await page.goto('/')

    // Act
    await page.getByRole('button', { name: /sign in/i }).click()

    // Assert
    await expect(page.getByRole('status')).toHaveText(/you are signed in/i)
  })
})
```

Two tests. AAA in each. Queries by role.

Run:

```bash
npx playwright test
```

Playwright runs both tests across Chromium, Firefox, and WebKit — 6 runs total. They should all pass in under 10 seconds.

## Step 4 — read the HTML report

```bash
npx playwright show-report
```

A browser opens to `http://localhost:9323` showing every test, every browser, every assertion, with the timing. Click into a test. You see the action timeline, the steps, and any screenshots.

## Step 5 — turn on tracing for every run

Temporarily change the trace config to record every run:

```ts
use: {
  baseURL: 'http://localhost:5173',
  trace: 'on',
}
```

Re-run:

```bash
npx playwright test
```

Now every run has a trace at `test-results/<file>-<test>-<browser>/trace.zip`.

Open one:

```bash
npx playwright show-trace test-results/home-home-page-shows-the-welcome-heading-chromium/trace.zip
```

The trace viewer opens in your browser. You see:

- The timeline of actions across the top.
- The DOM snapshot at each step in the middle.
- The action log on the right.
- The network / console panels at the bottom.

Click an action; the DOM shows the page state at that moment. Click another; the DOM updates. This is the killer feature.

## Step 6 — write a deliberately-failing test

Add to `home.spec.ts`:

```ts
test('deliberately fails to capture a trace', async ({ page }) => {
  await page.goto('/')

  // Wrong text on purpose
  await expect(page.getByRole('heading', { name: /goodbye/i })).toBeVisible()
})
```

The button has the name "Sign in", not "Goodbye"; the heading is "Welcome", not "Goodbye". Both assertions will fail.

Run:

```bash
npx playwright test --project=chromium home.spec.ts
```

The new test fails. Read the failure message — Playwright tells you it looked for a heading with the name `/goodbye/i` and did not find it, listing what headings it **did** find. The expected vs. actual is on screen.

Now open the trace:

```bash
npx playwright show-trace test-results/home-home-page-deliberately-fails-to-capture-a-trace-chromium/trace.zip
```

In the trace viewer, you see the moment the assertion failed. The DOM snapshot is the live HTML — you can right-click and inspect. The action log shows the assertion's timeout countdown. The before-and-after DOM is preserved.

**This is the debugging workflow.** Without re-running the test, you have a full reproduction of the failed state. Fix the assertion locally; rerun once to confirm.

## Step 7 — return the trace setting to on-first-retry

```ts
use: {
  baseURL: 'http://localhost:5173',
  trace: 'on-first-retry',
}
```

Tracing every run is wasteful in CI; tracing only on retry gives you the data exactly when you need it (after a flake), without the overhead.

## Step 8 — try the Playwright UI mode

```bash
npx playwright test --ui
```

A desktop app opens. The test tree on the left, the action timeline in the middle, the page rendering on the right. Click a test; watch it run. Hover over an action; the page jumps to that state. Click "Record" to record new actions; click "Pause" to pause mid-run.

The UI mode is the recommended development environment for Playwright tests. The watch loop is sub-second; the feedback is visual.

## Step 9 — try codegen

```bash
npx playwright codegen http://localhost:5173/
```

A browser window opens, plus an inspector window. Click the Sign in button. The inspector writes:

```ts
await page.getByRole('button', { name: 'Sign in' }).click()
```

Click anywhere else. The inspector writes more. When you are done, copy the code from the inspector into a `.spec.ts` file. **Clean up brittle selectors** — codegen sometimes generates CSS selectors like `div > main > button:nth-child(1)` when the markup is weak; replace those with role queries.

## Step 10 — answer these questions

In a comment at the bottom of `home.spec.ts`, answer:

1. The "shows the welcome heading" test asserts twice — once on the page title and once on the heading. Is this one logical assertion or two? Defend the choice.
2. The deliberately-failing test would have given you no information without the trace. Describe a scenario in your future career where the trace would save you 30 minutes.
3. The codegen output and a human-written test differ. Name one specific cleanup you would make to typical codegen output before committing.

## Submission

Commit:

```bash
git add playwright.config.ts tests/e2e/home.spec.ts .github/workflows/playwright.yml index.html
git commit -m "exercise 3: first Playwright e2e test"
```

## What you should be able to do now

- Install Playwright in a project.
- Configure `playwright.config.ts` with a baseURL and trace settings.
- Write a Playwright test using `page.getByRole` and web-first assertions.
- Run tests across three browsers.
- Open the HTML report.
- Open a trace and step through it.
- Use the UI mode for development.

## Reference

- Playwright — Writing tests: <https://playwright.dev/docs/writing-tests>
- Playwright — Locators: <https://playwright.dev/docs/locators>
- Playwright — Trace viewer: <https://playwright.dev/docs/trace-viewer>
- Playwright — UI mode: <https://playwright.dev/docs/test-ui-mode>
- Playwright — Codegen: <https://playwright.dev/docs/codegen>
