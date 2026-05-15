# Mini-project rubric

> *Total points: 100. Pass: 70. Distinction: 90. The rubric measures the things the lecture said mattered — pyramid shape, AAA discipline, accessible queries, network-boundary mocking, CI green with traceable failures.*

---

## Section A — Vitest configuration (10 points)

| Check | Points | Notes |
|-------|-------:|-------|
| `vitest.config.ts` exists with `environmentMatchGlobs` for unit/component split | 4 | The unit-vs-component split is the recommended pattern. |
| `vitest.setup.ts` registers `@testing-library/jest-dom/vitest` | 2 | The DOM matchers must work. |
| `vitest.setup.ts` registers `cleanup` in `afterEach` | 2 | Without this, tests leak state across the file. |
| Coverage configured with thresholds (any reasonable numbers) | 2 | The numbers can be calibrated; the point is the gate exists. |

## Section B — Unit tests (15 points)

| Check | Points | Notes |
|-------|-------:|-------|
| At least 10 unit tests for the helpers in `src/lib/` | 6 | Tokens helpers, claims helpers, format helpers. |
| Each test follows AAA shape (visible Arrange / Act / Assert) | 4 | Comments not required after the first few, but the shape must be there. |
| Boundary tests pin the off-by-one cases | 3 | Strict-less-than vs. less-than-or-equal, exactly-at-exp, exactly-30-seconds, etc. |
| Tests run in under 2 seconds total | 2 | The unit tier should be sub-second; 2 seconds is the upper bound. |

## Section C — Component tests (20 points)

| Check | Points | Notes |
|-------|-------:|-------|
| Counter test from exercise 2 carried over with 9+ tests | 5 | Direct copy is fine. |
| Profile test covers: signed-in render, signed-out render, expiry rendering, sign-out click | 6 | Each is one test minimum. |
| ProtectedRoute test covers: authenticated, unauthenticated, loading | 4 | One test per branch. |
| Tests use `getByRole` first, NOT `getByTestId` first | 3 | Inspect the test file. If `getByTestId` appears, it should have a comment justifying why. |
| MSW intercepts `fetch` in Profile tests (no direct `vi.fn` of `fetch`) | 2 | The boundary mock principle. |

## Section D — Playwright end-to-end (20 points)

| Check | Points | Notes |
|-------|-------:|-------|
| `playwright.config.ts` has chromium, firefox, webkit projects | 4 | Three browser projects. |
| `webServer` block starts Keycloak and Vite | 3 | Or the workflow's `Wait for Keycloak` step does it. |
| `fixtures.ts` provides a worker-scoped `loggedInPage` | 4 | Worker-scoped, not test-scoped. |
| At least 6 e2e tests covering home / sign-in / protected-route | 6 | Two each is fine. |
| `trace: 'on-first-retry'` is configured | 3 | Inspect playwright.config.ts. |

## Section E — Visual regression (10 points)

| Check | Points | Notes |
|-------|-------:|-------|
| Separate `visual` project in playwright.config.ts | 3 | Chromium only. |
| At least 2 visual tests with `toHaveScreenshot` | 3 | Home + Keycloak login is the minimum. |
| Non-Linux baselines are gitignored | 2 | `.gitignore` has `*-darwin.png` and `*-win32.png`. |
| Linux baselines are committed to the repo | 2 | Visible in the file tree. |

## Section F — CI workflow (15 points)

| Check | Points | Notes |
|-------|-------:|-------|
| `.github/workflows/test.yml` runs on push and PR | 2 | Both triggers. |
| Vitest job uses `actions/setup-node` with npm cache | 2 | The 5-vs-30-second install difference. |
| Playwright job installs browsers with `--with-deps` | 2 | The Linux system libs are needed. |
| Visual job exists and runs only Chromium | 2 | Or is integrated correctly. |
| Artifacts uploaded on failure: report, traces, diffs | 4 | Three separate `upload-artifact` steps with `if: always()` or `if: failure()`. |
| Jobs have sensible dependencies (e2e/visual depend on Vitest) | 3 | Fail fast on the cheap tier. |

## Section G — Documentation and submission (10 points)

| Check | Points | Notes |
|-------|-------:|-------|
| Fork's `README.md` explains the test suite | 3 | What it covers, how to run. |
| Fork's README has a "How to debug a CI failure" section | 2 | The trace-viewer workflow. |
| Submission PR description links to a green CI run | 2 | Proof of green. |
| Submission PR description links to a deliberately-failed run's trace | 2 | Proof of trace-debug-ability. |
| Conventional commit messages, sensible PR title | 1 | Quality-of-craft signal. |

---

## Common deductions

- **Using `data-testid` everywhere** — 3 points. The lecture spent a full section on this. If your tests sprinkle `data-testid` on the markup, points off.
- **`await new Promise(r => setTimeout(r, N))` in any test** — 2 points each. The async-wait anti-pattern. Use `findBy*` or `waitFor`.
- **Mocking React, the router, or child components** — 5 points. The boundary-mock principle is the lecture's strongest position.
- **`expect(...).toMatchSnapshot()` of a whole rendered component tree** — 3 points. Visual regression via Playwright is fine; component-tree snapshots are not.
- **No trace artifacts on CI failure** — 5 points. The single highest-leverage feature is not configured.
- **A test that does not actually assert anything** — 3 points each. The hardest deduction to give; sometimes a `render` with no `expect` slips in.

## Bonus credit (up to +10 points)

- **`@axe-core/playwright` integration** — +3 points. Run an automated accessibility scan on every e2e and fail on critical violations.
- **Test sharding configured** — +2 points. The matrix strategy that splits the Playwright suite across N parallel runners.
- **Coverage report uploaded to a third-party (codecov, coveralls) and badge in the README** — +2 points.
- **A Lighthouse CI check added** — +2 points. Reference to Week 9's performance budget.
- **A custom Playwright reporter that posts the run summary to a Slack/Discord webhook** — +1 point. Engineering polish.

## How submission is graded

A reviewer runs:

```bash
git clone <your-fork>
cd <fork>
npm ci
docker compose up -d
npm run test:run
npm run test:e2e
npm run test:visual
```

If all four commands succeed locally, sections A–E score full marks unless a closer read of the test files reveals issues (anti-patterns, missing tests). The reviewer then opens the linked CI run and checks the artifacts.

If `npm ci` fails, the submission is sent back; expectations are reproducible installs.
