# Mini-project — A meaningful test suite for the Week 10 SPA

> *Time budget: 10–11 hours, Friday afternoon through Sunday morning. Goal: add a Vitest unit suite, a Vitest + Testing Library component suite, a Playwright end-to-end suite (across Chromium, Firefox, WebKit), a Playwright visual-regression suite, and a GitHub Actions workflow that runs all of it on every push. The starter is a copy of the Week 10 SPA's ending state. By Sunday the deliverable is the green CI badge on `main`, plus a debugging artifact from a deliberately-failed test as proof you can read a trace.*

## What you are shipping

A working test suite with this structure:

```
mini-project/starter/
├── src/                            ← the Week 10 SPA, unchanged
│   ├── App.jsx
│   ├── auth.js
│   ├── api.js
│   ├── lib/
│   │   ├── tokens.js               ← pure helpers, unit-tested
│   │   └── claims.js
│   ├── components/
│   │   ├── Counter.tsx
│   │   ├── Profile.tsx
│   │   └── ProtectedRoute.tsx      ← component-tested
│   └── mocks/                      ← MSW handlers for component tests
│       ├── server.js
│       └── handlers.js
├── tests/
│   ├── unit/                       ← Vitest, environment=node
│   │   ├── tokens.test.js
│   │   └── claims.test.js
│   ├── component/                  ← Vitest, environment=jsdom
│   │   ├── Counter.test.tsx
│   │   ├── Profile.test.tsx
│   │   └── ProtectedRoute.test.tsx
│   └── e2e/                        ← Playwright
│       ├── fixtures.ts             ← logged-in-page fixture
│       ├── home.spec.ts
│       ├── sign-in.spec.ts
│       ├── protected-route.spec.ts
│       └── home.visual.spec.ts     ← visual regression
├── playwright.config.ts
├── vitest.config.ts
├── vitest.setup.ts
├── docker-compose.yml              ← Keycloak (from Week 10)
├── .github/
│   └── workflows/
│       └── test.yml                ← Vitest + Playwright in CI
├── package.json
└── rubric.md
```

By the end you should be able to run:

- `npm test` — Vitest in watch mode.
- `npm run test:run` — Vitest single run.
- `npm run test:e2e` — Playwright across three browsers.
- `npm run test:visual` — visual regression.

And the CI workflow runs all of these on every push, with traces uploaded on failure.

## Prerequisites

- Week 10 mini-project complete, **or** the starter folder in this directory (a copy of the Week 10 ending state).
- Docker Desktop running (for Keycloak).
- A GitHub account with repo write access (for pushing to a personal repo and watching CI).

## Step 1 — copy the starter and verify the SPA still works

```bash
cp -r mini-project/starter ~/projects/c8-w11
cd ~/projects/c8-w11
npm install
docker compose up -d
npm run dev
```

Open `http://localhost:5173/`. Sign in with the seeded user (username: `learner`, password: `learner-pass`). Verify the profile page renders. Verify sign-out works. If any of this is broken, fix it before proceeding — your tests can only be as good as the app underneath.

## Step 2 — install the test tooling

```bash
npm install -D vitest @vitest/ui jsdom
npm install -D @testing-library/react @testing-library/user-event @testing-library/jest-dom
npm install -D @vitest/coverage-v8
npm install -D msw

npm init playwright@latest
# answer: TypeScript, tests/e2e, install browsers
```

## Step 3 — configure Vitest

Use the config from lecture 2. Three sections of tests:

- `tests/unit/**/*.test.{js,ts}` — pure helpers. Environment: `node`.
- `tests/component/**/*.test.{jsx,tsx}` — React components. Environment: `jsdom`.

The config:

```ts
// vitest.config.ts
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    coverage: {
      provider: 'v8',
      include: ['src/**/*.{js,ts,jsx,tsx}'],
      exclude: ['src/main.jsx', 'src/mocks/**'],
      reporter: ['text', 'html', 'json-summary'],
    },
    environmentMatchGlobs: [
      ['tests/unit/**', 'node'],
      ['tests/component/**', 'jsdom'],
    ],
  },
})
```

The `environmentMatchGlobs` option lets you mix environments in one config — unit tests run in Node (fast, no JSDOM overhead), component tests run in JSDOM. This is the recommended pattern.

## Step 4 — write the unit suite

Tests for `src/lib/tokens.js`:

- `isExpired(token, now)` — see exercise 1.
- `decodeJwt(token)` — splits on `.`, base64-decodes the payload segment. Tests: a well-formed token decodes correctly; a malformed token throws.
- `formatExpiresIn(token, now)` — returns a human string for "expires in 5 minutes." Tests: future expiry, past expiry, boundary at 0.

Tests for `src/lib/claims.js`:

- `pickClaims(payload, allowed)` — see exercise 1.
- `validateClaims(payload, expected)` — checks `iss`, `aud`, `exp` against expected values. Tests: all match (returns ok); wrong issuer (returns error); expired (returns error).

Target: 10–15 unit tests. Run time: under 1 second.

## Step 5 — write the component suite

Tests for `src/components/Counter.tsx` (carried over from exercise 2):

- All eight tests from exercise 2.

Tests for `src/components/Profile.tsx`:

- Renders the user's name from the auth context.
- Renders "Not signed in" when no user is present.
- Renders the JWT expiry as a relative time.
- Renders a "Sign out" button that triggers sign-out.

Tests for `src/components/ProtectedRoute.tsx`:

- Renders the children when the user is authenticated.
- Renders nothing and redirects when the user is unauthenticated.
- Renders a loading state while the auth context is initializing.

For these tests, you will wrap the component in a `MemoryRouter` and the auth context — render the real router, do not mock it. Use MSW to mock `/api/profile`.

Target: 15–25 component tests. Run time: 1–5 seconds.

## Step 6 — write the e2e suite

Tests in `tests/e2e/`:

1. **`home.spec.ts`**:
   - The home page loads and shows the sign-in button.
   - The home page does not show the user's name when not signed in.

2. **`sign-in.spec.ts`**:
   - The full sign-in flow: click sign-in, fill the Keycloak form, land on the profile page, see the user's name.
   - The sign-out flow: from the post-login state, click sign-out, return to the home page.

3. **`protected-route.spec.ts`**:
   - Navigating to `/profile` while unauthenticated redirects to Keycloak.
   - Navigating to `/profile` while authenticated renders the page.

4. **`home.visual.spec.ts`** (visual regression):
   - The home page matches the baseline.
   - The post-login profile page matches the baseline (with the JWT expiry masked).

Target: 6–8 e2e tests. Run time: 1–3 minutes across three browsers in parallel.

The `fixtures.ts` file provides a `loggedInPage` fixture (worker-scoped) so the sign-in cost is paid once per worker. See lecture 3 §4.

## Step 7 — configure Playwright

`playwright.config.ts`:

```ts
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [['html'], ['list']],
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] }, testIgnore: '**/*.visual.spec.ts' },
    { name: 'firefox',  use: { ...devices['Desktop Firefox'] }, testIgnore: '**/*.visual.spec.ts' },
    { name: 'webkit',   use: { ...devices['Desktop Safari'] },  testIgnore: '**/*.visual.spec.ts' },
    { name: 'visual',   use: { ...devices['Desktop Chrome'] },  testMatch: '**/*.visual.spec.ts' },
  ],
  webServer: [
    {
      command: 'docker compose up keycloak',
      url: 'http://localhost:8080/realms/crunch/.well-known/openid-configuration',
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
    },
    {
      command: 'npm run dev',
      url: 'http://localhost:5173',
      reuseExistingServer: !process.env.CI,
    },
  ],
})
```

Two `webServer` entries — Keycloak first (slow to start), Vite dev server second. Playwright waits for both URLs to respond before running tests.

## Step 8 — write the GitHub Actions workflow

`.github/workflows/test.yml`:

```yaml
name: Tests

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  unit-and-component:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'
      - run: npm ci
      - run: npm run test:run -- --coverage
      - uses: actions/upload-artifact@v4
        if: always()
        with:
          name: vitest-coverage
          path: coverage/
          retention-days: 14

  e2e:
    runs-on: ubuntu-latest
    needs: unit-and-component
    timeout-minutes: 30
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: docker compose up -d keycloak
      - name: Wait for Keycloak
        run: |
          for i in {1..60}; do
            if curl -sf http://localhost:8080/realms/crunch/.well-known/openid-configuration > /dev/null; then
              echo "Keycloak ready"
              exit 0
            fi
            sleep 2
          done
          echo "Keycloak failed to start"
          exit 1
      - run: npx playwright test --project=chromium --project=firefox --project=webkit
      - uses: actions/upload-artifact@v4
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 14

  visual:
    runs-on: ubuntu-latest
    needs: unit-and-component
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'
      - run: npm ci
      - run: npx playwright install --with-deps chromium
      - run: docker compose up -d keycloak
      - name: Wait for Keycloak
        run: |
          for i in {1..60}; do
            if curl -sf http://localhost:8080/realms/crunch/.well-known/openid-configuration > /dev/null; then exit 0; fi
            sleep 2
          done
          exit 1
      - run: npx playwright test --project=visual
      - uses: actions/upload-artifact@v4
        if: failure()
        with:
          name: visual-diffs
          path: test-results/
          retention-days: 14
```

Three jobs: Vitest, Playwright across three browsers, and the visual project (Chromium only). The e2e and visual jobs depend on Vitest passing — fail fast on the cheap tests.

## Step 9 — get the suite green

This is most of the time budget. Iterate:

- Run `npm test` locally; fix failures.
- Run `npm run test:e2e` locally; fix failures.
- Run `npm run test:visual` locally; record baselines.
- Push to your fork.
- Open the GitHub Actions tab; watch the first run fail (visual baselines do not exist on Linux yet).
- Download the Linux baselines from the failed visual-job artifacts; commit them.
- Push again; watch the run go green.

Expect 2–3 cycles to get to green the first time. Each cycle is 5–10 minutes of CI; use the time to read the homework problems.

## Step 10 — write the README for your fork

In your fork's `README.md` (not the starter's), write:

- One paragraph explaining what the test suite covers (unit, component, e2e, visual).
- A "How to run locally" section with `npm test`, `npm run test:e2e`, `npm run test:visual`.
- A "How to debug a CI failure" section explaining how to download the trace artifact and open it.
- One screenshot of the green CI badge.

This README is the artifact a future employer reads. Spend 30 minutes on it.

## Submission

1. Push your fork with all the test files, the workflow, and the README.
2. Open a PR in your own repo titled "Week 11 — testing mini-project."
3. In the PR description, link to the green CI run and to one deliberately-failed CI run's trace artifact.
4. Submit the PR URL in the assignment system.

## Rubric

See `starter/rubric.md`.

## What you should be able to do now

- Configure Vitest for a mixed unit + component suite with environment-per-glob.
- Configure Playwright for multi-browser + visual regression in separate projects.
- Use MSW to mock the network in component tests.
- Use a worker-scoped fixture to share authentication across e2e tests.
- Read a Playwright trace from a CI artifact.
- Wire all of it into GitHub Actions with caching and artifact upload.

## Reference

All the URLs from `resources.md` and the three lecture-notes files. The single most-useful bookmark for the mini-project is the Playwright [CI guide](https://playwright.dev/docs/ci-intro).
