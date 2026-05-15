# Week 11 — Frontend Testing with Vitest and Playwright

> *Ten weeks in, you can ship a multi-route React SPA, optimize it against the Core Web Vitals thresholds, and authenticate the user against a local Keycloak realm with OAuth 2.1 + PKCE. The code works on your laptop. The question this week answers is: how do you keep it working when six other people merge to the same `main` branch, when a refactor moves three files, and when the CI pipeline runs at 02:13 on a Tuesday morning and emails you about a broken deploy? The answer is a test suite — not the bloated, fragile, "1,200 tests and we still ship bugs" kind, but the focused, behavior-first, fast-feedback kind that Kent C. Dodds, the Testing Library maintainers, and the Vitest and Playwright teams have spent years documenting. You will learn the **test pyramid** for web apps (many unit tests, fewer component tests, fewer still end-to-end tests), the **AAA pattern** (Arrange / Act / Assert), the **getByRole-over-getByTestId** philosophy, and how to wire Vitest for unit and component tests, Playwright for browser-driven end-to-end tests across Chromium / Firefox / WebKit, and a single GitHub Actions workflow that runs the whole thing on every push. By Sunday you will be able to look at a React component and write a test that survives a refactor — not one that breaks every time a div becomes a section.*

Welcome back. The Week 10 SPA logs in against Keycloak, stores rotated tokens, and renders a profile page from ID-token claims. The flow works. **You confirmed it works by clicking around in the browser** — which is exactly the verification strategy that does not scale past one engineer. When the second contributor merges a route change, no one re-clicks every flow. When the dependabot bot bumps `react-router-dom`, no one re-clicks every flow. When you yourself come back to the code in three months, you do not re-click every flow. The flows break silently until a user reports it. The test suite is how you stop relying on manual click-testing and start trusting the green CI badge.

There is, however, an industry full of **bad testing advice**, and the bad advice has done real damage to working teams. The two patterns to unlearn first are (1) "**mock everything**" — surround the unit under test with stubbed dependencies until the test no longer touches reality, which produces tests that pass while the real code is broken — and (2) "**`getByTestId` everywhere**" — sprinkle `data-testid` attributes through the markup so tests have a stable hook, which produces tests that pass while the screen-reader experience silently breaks. Kent C. Dodds spent five years writing essays explaining why both patterns are wrong; the [Testing Library philosophy](https://testing-library.com/docs/guiding-principles/) distills the lesson into one sentence: *"The more your tests resemble the way your software is used, the more confidence they can give you."* Your tests should query the DOM the way a screen reader queries it — by accessible role and accessible name — and your components should ship the accessible markup that makes those queries work. The two efforts reinforce each other.

The five ideas that organize the week are:

1. **The test pyramid is real and the ratios matter.** Mike Cohn's original [test pyramid](https://martinfowler.com/articles/practical-test-pyramid.html) — lots of unit tests at the base, fewer integration tests in the middle, very few end-to-end tests at the top — was written for backend Java code in 2009, but the shape transfers to frontend with one adjustment: the middle layer is **component tests** (a real React component rendered into JSDOM and queried with Testing Library), not "integration tests" in the backend sense. Unit tests run in milliseconds, component tests run in tens of milliseconds, Playwright e2e tests run in seconds — and an e2e test that costs five seconds to run is worth fifty unit tests that each cost a hundred milliseconds, but only if it covers behavior that unit tests cannot. The pyramid is the heuristic for how to distribute your testing budget.
2. **AAA — Arrange, Act, Assert.** Every test should have three sections, in order, and ideally one assertion per test (or a few tightly-related ones). The Arrange section sets up the world — render the component, seed the database, log in the user. The Act section performs the one action under test — click a button, dispatch an event, fire a request. The Assert section checks the result — the DOM contains the expected text, the network was called, the URL changed. A test that mixes the three phases is hard to read and harder to maintain; a test that follows AAA reads like a paragraph.
3. **Do not mock what you do not have to mock.** The unit-test culture inherited from server-side Java taught a generation of frontend engineers to mock React, mock `fetch`, mock `useState`, and mock the router. The result was test files longer than the code they tested and a false sense of safety. The modern answer — endorsed by the Testing Library team, by Vitest, and by the React core team — is **render the real component, mock only the network boundary, and let everything else run for real**. Use [MSW (Mock Service Worker)](https://mswjs.io/) to intercept `fetch` calls at the network layer; do not mock React Router; do not mock React itself. The test runs JSDOM-fast and exercises the same code paths the user does.
4. **`getByRole` beats `getByTestId` beats `getByText`, in that order.** Testing Library's query API is intentionally ordered: prefer queries an assistive technology would use (`getByRole`, `getByLabelText`, `getByPlaceholderText`), fall back to `getByText` when the element has no role, and reach for `getByTestId` only when nothing accessible is available. Each `data-testid` attribute is a tax — it pollutes the markup, it makes the test brittle to renaming, and it lets you ship a component that fails accessibility audits because the test never noticed. Kent C. Dodds's [essay on this](https://kentcdodds.com/blog/making-your-ui-tests-resilient-to-change) is the canonical reference; the [Testing Library priority list](https://testing-library.com/docs/queries/about/#priority) is the rule book.
5. **Playwright is the modern end-to-end choice and it ships fixtures, traces, and screenshots in the box.** Cypress was the previous generation's answer; Playwright is the one Microsoft funds, the one that drives WebKit (the only way to test Safari without a Mac farm), the one with `npx playwright codegen` for recording flows, and the one whose [trace viewer](https://playwright.dev/docs/trace-viewer) gives you a full step-by-step replay of a failed test including network logs and console errors. The license is Apache 2.0 and the cost is zero. The week's e2e stack is Playwright; if you have used Cypress before, the mental model transfers, but the API is different and the trace-on-failure feature alone justifies the switch.

By Sunday, the deliverable is a **test suite for the Week 10 SPA** — Vitest unit tests for the pure helpers (token expiry math, claim validation), Vitest + Testing Library component tests for the profile and login screens, Playwright e2e tests that drive the full Keycloak-and-back flow, a visual-regression check on the profile page using [`expect(page).toHaveScreenshot()`](https://playwright.dev/docs/test-snapshots), and a GitHub Actions workflow that runs all of it on every push and uploads the Playwright trace on failure. The rubric is in `mini-project/starter/rubric.md`.

---

## Learning objectives

By the end of this week, you will be able to:

- **Articulate** the test pyramid for a frontend codebase — unit tests at the base, component tests in the middle, end-to-end tests at the apex — and explain why a 100% unit-tested codebase with no e2e tests is still a codebase that can ship broken user flows. Reference: <https://martinfowler.com/articles/practical-test-pyramid.html>.
- **Write** an AAA-structured test — Arrange, Act, Assert, in three labeled blocks — and recognize when a test you read is mixing the phases. Reference: <https://wiki.c2.com/?ArrangeActAssert>.
- **Install** and configure **Vitest** as the test runner for a Vite project — `vitest.config.ts` with the `jsdom` environment, `globals: true` for the Jest-style describe/it/expect, and the `setupFiles` hook that loads `@testing-library/jest-dom` so that `toBeInTheDocument()` works. Reference: <https://vitest.dev/guide/>.
- **Render** a React component in a Vitest test using `@testing-library/react`'s `render`, query its accessible tree with `screen.getByRole`, simulate user interaction with `@testing-library/user-event`, and assert on the result. Reference: <https://testing-library.com/docs/react-testing-library/intro/>.
- **State** the Testing Library priority list — `getByRole` > `getByLabelText` > `getByPlaceholderText` > `getByText` > `getByDisplayValue` > `getByAltText` > `getByTitle` > `getByTestId` — and refactor a test that reaches for `getByTestId` first into one that uses an accessible query. Reference: <https://testing-library.com/docs/queries/about/#priority>.
- **Defend** the "do not mock the implementation" principle in your own words, citing Kent C. Dodds's essay <https://kentcdodds.com/blog/testing-implementation-details>. Recognize tests that assert on `useState` calls, `useEffect` calls, or props passed to internal components as anti-patterns.
- **Use** [Mock Service Worker (MSW)](https://mswjs.io/) to intercept `fetch` calls in tests at the network layer, so the component renders against a controlled API response without the component itself knowing it is in a test. Reference: <https://mswjs.io/docs/getting-started>.
- **Install** and configure **Playwright** for end-to-end testing — `playwright.config.ts` with the three browser projects (`chromium`, `firefox`, `webkit`), the `baseURL` pointing at the dev server, the `webServer` block that auto-starts Vite, and `trace: 'on-first-retry'` so traces are captured on flakes. Reference: <https://playwright.dev/docs/intro>.
- **Write** a Playwright test that navigates a real browser through a real flow — open the page, click a button, wait for navigation, assert on text — using `page.goto`, `page.getByRole`, `await expect(...).toHaveText`, and the auto-waiting that Playwright applies to every action. Reference: <https://playwright.dev/docs/writing-tests>.
- **Use** Playwright [fixtures](https://playwright.dev/docs/test-fixtures) to share setup across tests — a `loggedInPage` fixture that authenticates once per worker and returns a page already in the post-login state — and explain why this beats both "log in inside every test" (slow) and "log in once globally" (worker isolation breaks).
- **Capture** and read a [Playwright trace](https://playwright.dev/docs/trace-viewer) when a CI run fails — open the `trace.zip` in `npx playwright show-trace`, step through the actions, inspect the DOM at each step, and find the failing selector — without re-running the test locally.
- **Write** a [visual regression test](https://playwright.dev/docs/test-snapshots) with `await expect(page).toHaveScreenshot()` — Playwright takes a screenshot, compares it pixel-by-pixel against a stored baseline, and fails the test if the diff exceeds the threshold. Update the baseline with `--update-snapshots` when the visual change is intentional.
- **Configure** a GitHub Actions workflow that installs dependencies, runs Vitest, runs Playwright across three browsers, and uploads the Playwright HTML report and trace as a CI artifact on failure. Reference: <https://playwright.dev/docs/ci-intro>.
- **Recognize** the common test-suite anti-patterns — `expect.assertions(0)`-by-accident, `await sleep(2000)`, `cy.wait(500)`, `jest.useFakeTimers()` in every file, snapshot tests of entire component trees — and rewrite them into deterministic, fast-feedback tests.
- **Decide** what to test and what not to test. The line: test behavior the user can observe; do not test that `useState` was called; do not test third-party libraries; do not test trivial getters. Reference: Kent C. Dodds, "Write tests. Not too many. Mostly integration." <https://kentcdodds.com/blog/write-tests>.

---

## Prerequisites

You finished **Week 10 — Authentication and Identity**. Concretely:

- A working React SPA that authenticates against Keycloak via OIDC + PKCE.
- You can edit a `vite.config.js`, install npm packages, and run `npm run dev`.
- Node.js 20+ and npm 10+ on the path.
- Docker Desktop installed (the Playwright tests run against a Keycloak container started by the same `docker-compose.yml` from Week 10).
- A working `gh` CLI signed in to your GitHub account, if you plan to push the mini-project to a personal repo and watch the CI run.

If you did not complete Week 10, the starter code in `mini-project/starter/` is a copy of the Week 10 ending state — you can begin from there.

---

## Topics covered

- **The test pyramid (and the inverted "ice cream cone" anti-pattern).** Cohn's pyramid, Fowler's restatement, and Vincent Voyer's "ice cream cone" critique. Why an inverted pyramid — lots of e2e, no unit — is the most expensive and slowest-to-give-feedback shape. Why the modern frontend pyramid puts component tests in the middle. Reference: <https://martinfowler.com/articles/practical-test-pyramid.html>.
- **AAA — Arrange, Act, Assert.** The three-phase test layout. Why "one assertion per test" is a guideline, not a law (a single `expect(...).toMatchObject(...)` with five fields is one assertion in spirit). How AAA reads as code. Reference: <https://wiki.c2.com/?ArrangeActAssert> and Roy Osherove's *The Art of Unit Testing*.
- **Vitest — the Vite-native runner.** Why it replaced Jest as the default for Vite projects (zero-config, ESM-native, watch-mode in milliseconds, same `expect` API). How it shares Vite's transform pipeline so TypeScript and JSX "just work" without a second config. How `vitest --ui` opens a browser dashboard with the test tree, the diff viewer, and the coverage map. Reference: <https://vitest.dev/guide/>.
- **JSDOM vs. happy-dom vs. a real browser.** The three environments Vitest can run a component test in. JSDOM is the historical default and the most-compatible. happy-dom is faster but less complete. A real browser via [`@vitest/browser`](https://vitest.dev/guide/browser/) is the newest option — runs your component test against Chromium directly. Pick JSDOM for this week.
- **Testing Library — the philosophy.** "The more your tests resemble the way your software is used, the more confidence they can give you." The priority list. The query variants — `getBy*` (throws if missing), `queryBy*` (returns null if missing), `findBy*` (async, retries until found). The `userEvent` library — types one character at a time, fires focus/blur events, simulates the real browser. Reference: <https://testing-library.com/docs/guiding-principles/>.
- **`getByRole` and the ARIA role list.** Every interactive HTML element has an implicit role (`<button>` is `button`, `<a>` is `link`, `<input type="checkbox">` is `checkbox`, `<h1>` is `heading` with level 1). `getByRole('button', { name: 'Sign in' })` matches the button whose accessible name is "Sign in" — and crucially **fails** if the markup has no accessible name, which catches the accessibility bug at test time. Reference: <https://www.w3.org/TR/wai-aria-1.2/#role_definitions>.
- **What to mock, what NOT to mock.** Mock the network. Do not mock React. Do not mock React Router. Do not mock your own component's children — render them. Do not mock `useState` or `useReducer`. Do not assert that a particular function was called inside the implementation — assert on what the user sees on screen. Reference: <https://kentcdodds.com/blog/testing-implementation-details>.
- **MSW — Mock Service Worker.** Intercept `fetch` and XHR at the network layer with handlers like `http.get('/api/profile', () => HttpResponse.json({ name: 'Ada' }))`. The component, the hook, and the auth library all run for real; only the network is faked. Works in both Vitest (Node mode) and Playwright (browser mode). Reference: <https://mswjs.io/docs/getting-started>.
- **Component testing in Vitest.** `render(<App />)` returns a handle; `screen.getByRole('heading', { name: 'Profile' })` queries it; `await userEvent.click(screen.getByRole('button', { name: /sign in/i }))` simulates a click; `await screen.findByText('Welcome, Ada')` waits for the async update. The `findBy*` family is the answer to "the data does not load synchronously" — Testing Library retries with a 1-second default timeout.
- **Snapshot tests — when they help and when they hurt.** A snapshot test renders a component, serializes the result, and stores it in a `__snapshots__` file. When the output changes, the test fails until you re-snapshot. They help when the output is small and meaningful (the rendered Markdown, the serialized state object). They hurt when the output is a 400-line component tree that anyone with a styling change has to re-snapshot, at which point nobody reads the diff and the snapshot becomes a rubber stamp. Reference: <https://vitest.dev/guide/snapshot.html>.
- **Playwright — the browser-automation default in 2026.** Apache 2.0, Microsoft-funded, multi-browser including WebKit (Safari's engine), auto-waiting on every action, codegen for recording flows, trace viewer for post-mortem debugging. Why it beat Cypress on technical merit (browser parallelism, no test-runner lock-in, WebKit support, trace viewer). Reference: <https://playwright.dev/>.
- **Playwright fixtures.** The `test.extend` API lets you define typed fixtures — setup-and-teardown blocks that get injected into each test that asks for them. The `loggedInPage` fixture is the canonical example — authenticate once per worker, store the storage state, and inject a `page` already in the post-login state into each test. Reference: <https://playwright.dev/docs/test-fixtures>.
- **Parallel test execution.** Playwright runs tests across multiple workers in parallel by default; each worker is an isolated browser context. Tests inside a single file run sequentially unless marked `test.describe.parallel(...)`. The trade-off is throughput vs. shared state — fixtures with `scope: 'worker'` initialize once per worker, fixtures with the default `scope: 'test'` initialize once per test. Reference: <https://playwright.dev/docs/test-parallel>.
- **Trace on failure.** Playwright's `trace: 'on-first-retry'` config captures every action, every network request, every console message, every screenshot, and packages them into a `trace.zip` you can open in `npx playwright show-trace`. The trace is the single most-useful CI feature in any modern test runner — you debug a CI flake without re-running it. Reference: <https://playwright.dev/docs/trace-viewer>.
- **Visual regression with `toHaveScreenshot`.** Playwright's built-in screenshot diff. First run records the baseline; subsequent runs compare pixel-by-pixel and fail if the difference exceeds `maxDiffPixelRatio` (default 0%). The baseline is stored per-browser-per-platform in a folder next to the test; CI matches local only if both run on the same OS. The Linux baseline is the canonical CI baseline. Reference: <https://playwright.dev/docs/test-snapshots>.
- **GitHub Actions for test CI.** A single workflow file at `.github/workflows/test.yml` runs Vitest and Playwright on every push and pull request. Cache the npm install. Run `npx playwright install --with-deps` to fetch the browser binaries. Upload the `playwright-report/` folder and any `test-results/` traces as artifacts so a failed run is debuggable from the Actions tab. Reference: <https://playwright.dev/docs/ci-intro>.
- **The cost-of-ownership question.** Tests are code; the test suite has a maintenance budget; a brittle test costs more than it saves. The mature engineer's question is not "how many tests do we have" but "how many of these tests are still earning their keep this quarter." Reference: Kent C. Dodds, "How to know what to test" <https://kentcdodds.com/blog/how-to-know-what-to-test>.

---

## Tools you will need

| Tool                                    | Role                                                                | Cost |
| --------------------------------------- | ------------------------------------------------------------------- | ---- |
| **Node.js 20+**                         | The test runners both run on Node                                   | Free |
| **Vite 5+**                             | Carried forward from Week 7                                         | Free |
| **Vitest 1+**                           | The unit and component test runner                                  | Free |
| **`@testing-library/react`**            | Render React components, query the accessible tree                  | Free |
| **`@testing-library/user-event`**       | Simulate real user interaction (typing, clicking, focus events)     | Free |
| **`@testing-library/jest-dom`**         | The `toBeInTheDocument`, `toHaveAttribute` matchers                 | Free |
| **`@vitest/coverage-v8`**               | Coverage report via V8's built-in coverage hooks                    | Free |
| **`msw` 2+**                            | Mock Service Worker for `fetch` interception                        | Free |
| **`@playwright/test` 1.40+**            | End-to-end runner, browser binaries, trace viewer, screenshot diff  | Free |
| **Docker Desktop**                      | Run Keycloak (carried over from Week 10)                            | Free |
| **GitHub account + Actions minutes**    | 2,000 free minutes per month on public repos                        | Free |

No paid SaaS. Every link in `resources.md` resolves to a free document.

---

## Weekly schedule

The schedule below adds up to approximately **38 hours**. Treat it as a target. Wednesday's component-testing block is the densest; budget the morning for it.

| Day       | Focus                                                                | Lectures | Exercises | Challenges | Quiz/Read | Homework | Mini-Project | Self-Study | Daily Total |
|-----------|----------------------------------------------------------------------|---------:|----------:|-----------:|----------:|---------:|-------------:|-----------:|------------:|
| Monday    | Pyramid, AAA, Vitest install, first unit tests                       |    2h    |    2h     |     0h     |    0.5h   |   1h     |     0.5h     |    0.5h    |     6.5h    |
| Tuesday   | Testing Library philosophy, accessible queries, component tests      |    3h    |    2h     |     0h     |    0.5h   |   1h     |     1h       |    0.5h    |     8h      |
| Wednesday | MSW, what to mock, async testing, coverage                           |    2h    |    2h     |     1h     |    0.5h   |   1h     |     1h       |    0h      |     7.5h    |
| Thursday  | Playwright install, first e2e, fixtures, parallel, traces            |    2h    |    1h     |     1h     |    0.5h   |   1h     |     2h       |    0.5h    |     8h      |
| Friday    | Visual regression, CI on GitHub Actions, mini-project                |    1h    |    0h     |     0h     |    0.5h   |   1h     |     3h       |    0.5h    |     6h      |
| Saturday  | Mini-project — finish suite, get CI green                            |    0h    |    0h     |     0h     |    0h     |   0h     |     3h       |    0h      |     3h      |
| Sunday    | Quiz, write the testing README, submit                               |    0h    |    0h     |     0h     |    0.5h   |   0h     |     0.5h     |    0h      |     1h      |
| **Total** |                                                                      | **10h**  | **7h**    | **2h**     | **3h**    | **5h**   | **11h**      | **2h**     | **40h**     |

---

## How to navigate this week

| File | What is inside |
|------|----------------|
| [README.md](./README.md) | This overview |
| [resources.md](./resources.md) | Vitest, Playwright, Testing Library, MSW docs; Kent C. Dodds essays; GitHub Actions docs |
| [lecture-notes/01-the-test-pyramid-and-aaa.md](./lecture-notes/01-the-test-pyramid-and-aaa.md) | The pyramid, the ice-cream-cone anti-pattern, AAA, what to test and what not to test |
| [lecture-notes/02-vitest-and-testing-library.md](./lecture-notes/02-vitest-and-testing-library.md) | Vitest config, JSDOM, render/screen/userEvent, the priority list, what NOT to mock |
| [lecture-notes/03-playwright-fixtures-traces-and-ci.md](./lecture-notes/03-playwright-fixtures-traces-and-ci.md) | Playwright config, fixtures, parallel workers, traces, visual regression, GitHub Actions |
| [exercises/exercise-01-aaa-and-first-vitest.md](./exercises/exercise-01-aaa-and-first-vitest.md) | Install Vitest, write three AAA-shaped unit tests for pure helpers |
| [exercises/exercise-02-component-testing.md](./exercises/exercise-02-component-testing.md) | Render a real component, query by role, simulate user-event, assert on the screen |
| [exercises/exercise-03-playwright-first-e2e.md](./exercises/exercise-03-playwright-first-e2e.md) | Install Playwright, write a first e2e, capture a trace, read it in the trace viewer |
| [exercises/starter-helpers.ts](./exercises/starter-helpers.ts) | Pure helper functions to unit-test in exercise 1 |
| [exercises/starter-helpers.test.ts](./exercises/starter-helpers.test.ts) | Test stub for exercise 1 |
| [exercises/starter-Counter.tsx](./exercises/starter-Counter.tsx) | The component under test in exercise 2 |
| [exercises/starter-Counter.test.tsx](./exercises/starter-Counter.test.tsx) | Test stub for exercise 2 |
| [exercises/starter-home.spec.ts](./exercises/starter-home.spec.ts) | Test stub for exercise 3 |
| [exercises/SOLUTIONS.md](./exercises/SOLUTIONS.md) | Reference solutions with annotations |
| [challenges/challenge-01-msw-and-async-component.md](./challenges/challenge-01-msw-and-async-component.md) | Use MSW to test a component that fetches data; cover loading, success, and error |
| [challenges/challenge-02-visual-regression.md](./challenges/challenge-02-visual-regression.md) | Add a Playwright visual-regression suite, handle the Linux-vs-macOS baseline question |
| [quiz.md](./quiz.md) | Twelve multiple-choice questions |
| [homework.md](./homework.md) | Six practice problems |
| [mini-project/README.md](./mini-project/README.md) | The full test suite for the W10 SPA |
| [mini-project/starter/](./mini-project/starter/) | Vitest config, Playwright config, sample tests, GitHub Actions workflow, rubric |

The recommended order:

1. Read all three lectures (Monday–Thursday morning).
2. Do the three exercises in order — exercise 1 establishes Vitest, exercise 2 builds on it for components, exercise 3 introduces Playwright.
3. Take the quiz on Wednesday evening; re-read any lecture you score weakly on.
4. Pick one or both challenges (Wednesday–Thursday).
5. Work the homework problems alongside the mini-project (Thursday–Saturday).
6. Ship the mini-project — the W10 SPA with a green CI badge — by Sunday.

---

## Stretch goals

If you finish early and want to push further, try any of these:

- Read the **Vitest "API reference"** at <https://vitest.dev/api/> end to end. Skim mode is fine; the goal is to know what is in the box.
- Read the **Playwright "Best Practices" guide** at <https://playwright.dev/docs/best-practices>. The advice on web-first assertions and locator stability is the difference between a flaky suite and a green one.
- Read **Kent C. Dodds — "Common mistakes with React Testing Library"** at <https://kentcdodds.com/blog/common-mistakes-with-react-testing-library>. Twelve specific patterns that look reasonable and are wrong.
- Read **Kent C. Dodds — "Write tests. Not too many. Mostly integration."** at <https://kentcdodds.com/blog/write-tests>. The foundational essay that shaped the modern Testing Library philosophy.
- Read **Martin Fowler — "TestPyramid"** at <https://martinfowler.com/bliki/TestPyramid.html>. The original short version of the article.
- Read **Vincent Voyer — "Why ice-cream cone testing is bad"** at <https://watirmelon.blog/testing-pyramids/>. The visual taxonomy of test anti-patterns.
- Install the **Playwright VS Code extension** at <https://playwright.dev/docs/getting-started-vscode> and try the "Record new test" and "Show trace viewer" actions on the mini-project.
- Switch one of the mini-project's component tests from JSDOM to **`@vitest/browser`** (real Chromium) and report what changed. Reference: <https://vitest.dev/guide/browser/>.
- Add a **`@axe-core/playwright`** scan to the mini-project and fail the build on critical accessibility violations. Reference: <https://github.com/dequelabs/axe-core-npm/tree/develop/packages/playwright>.
- Add **coverage gates** — fail the build if statement coverage drops below 70%. Reference: <https://vitest.dev/guide/coverage.html>.

---

## What this week is NOT

- **Not a TDD evangelism week.** Test-driven development is a workflow, not a religion. Some engineers write tests first; some write tests after; both ship working software. The week teaches the test artifact, not the workflow. Read Kent Beck's *Test-Driven Development By Example* if you want the workflow framing; that book is excellent and out of scope.
- **Not a 100% coverage week.** Coverage is a hint, not a goal. A 95%-coverage codebase can still ship broken user flows; a 60%-coverage codebase with the right tests on the critical paths can ship reliably. The mini-project asks for meaningful tests on the critical flows, not a coverage number.
- **Not a Cypress week.** Cypress is the previous-generation incumbent in the e2e space. It is still a fine tool. Playwright wins on three technical axes that matter to a team — multi-browser including WebKit, parallel workers without a paid dashboard, and the trace viewer — so the week teaches Playwright. If your future employer uses Cypress, the mental model carries over.
- **Not a "snapshot every component" week.** Snapshot tests get one section of the Vitest lecture, with the cautions, and that is it. Visual regression with Playwright's `toHaveScreenshot` is in; component-tree snapshot rubber-stamping is out.
- **Not a load-testing or perf-testing week.** k6, Artillery, and Lighthouse-CI are tools you will need eventually; performance budgeting was the Week 9 lecture. This week's tools target functional correctness, not load behavior.
- **Not a contract-testing or Pact week.** Consumer-driven contract testing is a real and useful technique for microservice teams; it is also a separate stack (Pact, Spring Cloud Contract) and a separate week. Mentioned in the lecture's "where this is going" section, not built.
- **Not an "AI generates your tests" week.** The model can scaffold; it cannot decide what is worth testing. The week teaches the judgement; the tooling layer is generic and changes every six months.

---

## A word on the editorial voice

There is a kind of testing writing online — usually attached to a paid course or a vendor whitepaper — that sells testing as a moral virtue. "Write more tests! Coverage of 100%! Test everything!" The result is a generation of engineers who write tests that **look like** the implementation, fail when the implementation changes for any reason, and never catch a real bug. The codebase fills up with tests that are dead weight, the test suite slows the build to a crawl, and the team eventually starts skipping the suite, marking flakes as `.skip`, and shipping anyway. Bad testing is worse than no testing because it gives a false sense of safety.

The position this week takes is the position of the Testing Library team, Kent C. Dodds, Martin Fowler, and the Playwright maintainers — **fewer, better tests, written from the user's point of view, run in CI, debugged via traces.** The lecture cites each of these voices directly; the homework asks you to read at least one essay from each. By Friday, you should be able to look at a test file and say not just "this passes" but "this test will tell us if the user-facing behavior breaks, and it will not tell us if the user-facing behavior is unchanged" — and that is the bar.

The other voice you will hear in the lecture is the **trace-driven debugging voice**. A test suite without trace artifacts is one where every CI flake becomes a re-run lottery. A test suite with traces gives the on-call engineer a full replay of the failed run, including the network and the DOM at every step. Playwright ships this for free; turn it on in CI on day one. The mini-project does.

---

## Up next

Continue to [Week 12 — Progressive Web Apps and Offline](../week-12-pwa-and-offline/) once you have shipped the mini-project, the test suite runs locally with `npm test`, the Playwright suite passes across all three browsers with `npx playwright test`, the GitHub Actions workflow shows a green check on `main`, the visual-regression baseline is committed to the repo, and the trace viewer opens on a deliberately-failed test so you have proof you know how to debug a CI flake without re-running it.

---

*If you find errors in this material, please open an issue or send a PR. Future learners will thank you.*
