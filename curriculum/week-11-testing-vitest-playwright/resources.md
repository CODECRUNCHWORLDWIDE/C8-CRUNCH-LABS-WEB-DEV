# Week 11 — Resources

A curated reading list for frontend testing. Every link is free. The first three sections are the canon — Vitest, Playwright, Testing Library — and you should bookmark all of them. The middle sections add philosophical depth from Kent C. Dodds, Martin Fowler, and the Testing Library maintainers. The final sections are the spec and tooling references you will reach for when something specific breaks.

---

## Official documentation — read first

### Vitest

- **Vitest — Getting started.** <https://vitest.dev/guide/> — the install, the `vitest.config.ts`, the watch mode, the UI dashboard. Read top to bottom. Twenty minutes.
- **Vitest — API reference.** <https://vitest.dev/api/> — `describe`, `it`, `expect`, `vi.fn`, `vi.spyOn`, `vi.mock`, `beforeEach`, `afterEach`, `vi.useFakeTimers`. Scan, then return when you need a specific API.
- **Vitest — Configuration reference.** <https://vitest.dev/config/> — every option in `vitest.config.ts`. The ones you will use: `environment`, `globals`, `setupFiles`, `coverage`, `pool`, `testTimeout`.
- **Vitest — Coverage.** <https://vitest.dev/guide/coverage.html> — the V8-backed coverage provider, the `include`/`exclude` config, the HTML reporter, the threshold gates.
- **Vitest — Snapshot.** <https://vitest.dev/guide/snapshot.html> — when snapshot tests help, when they hurt, the `--update-snapshots` flag.
- **Vitest — Mocking.** <https://vitest.dev/guide/mocking.html> — `vi.mock` for module mocks, `vi.fn` for function mocks, the rules around hoisting. Read this before you reach for any of it; most of the time you should not.
- **Vitest — Browser mode.** <https://vitest.dev/guide/browser/> — the newest option for running component tests against a real Chromium instead of JSDOM. Stretch goal; not required this week.

### Playwright

- **Playwright — Introduction.** <https://playwright.dev/docs/intro> — the install (`npm init playwright@latest`), the first test, the test runner. Twenty minutes.
- **Playwright — Writing tests.** <https://playwright.dev/docs/writing-tests> — locators, actions, assertions, web-first assertions. The single most important page for daily test authoring.
- **Playwright — Locators.** <https://playwright.dev/docs/locators> — `page.getByRole`, `page.getByLabel`, `page.getByText`, the priority list. Same philosophy as Testing Library; same priority list; same lesson.
- **Playwright — Fixtures.** <https://playwright.dev/docs/test-fixtures> — `test.extend`, fixture scopes (`test` vs. `worker`), auto-fixtures.
- **Playwright — Parallelism.** <https://playwright.dev/docs/test-parallel> — workers, `fullyParallel`, sharding, `test.describe.serial`.
- **Playwright — Trace viewer.** <https://playwright.dev/docs/trace-viewer> — `trace: 'on-first-retry'`, `npx playwright show-trace`, what the trace records.
- **Playwright — Visual comparisons.** <https://playwright.dev/docs/test-snapshots> — `toHaveScreenshot`, `toMatchSnapshot`, the per-platform baseline question.
- **Playwright — CI.** <https://playwright.dev/docs/ci-intro> — GitHub Actions, the `playwright-report` artifact, the `--browser` matrix.
- **Playwright — Best Practices.** <https://playwright.dev/docs/best-practices> — the maintainers' own list of things to do and things to avoid. Required reading before shipping a suite.
- **Playwright — Codegen.** <https://playwright.dev/docs/codegen> — record a flow in the browser and have Playwright write the test for you. Useful for first drafts; do not commit codegen output without cleaning it up.
- **Playwright VS Code extension.** <https://playwright.dev/docs/getting-started-vscode> — record, debug, and step-through tests in the editor.

### Testing Library

- **Testing Library — Guiding Principles.** <https://testing-library.com/docs/guiding-principles/> — the one-page manifesto. *"The more your tests resemble the way your software is used, the more confidence they can give you."*
- **Testing Library — Queries: about.** <https://testing-library.com/docs/queries/about/> — the query API, the `getBy*` / `queryBy*` / `findBy*` distinction, the priority list.
- **Testing Library — Priority list.** <https://testing-library.com/docs/queries/about/#priority> — the canonical ordering. Print it out.
- **React Testing Library — Intro.** <https://testing-library.com/docs/react-testing-library/intro/> — the React adapter, `render`, `screen`, `rerender`.
- **`user-event` — Introduction.** <https://testing-library.com/docs/user-event/intro/> — why `userEvent` is preferred over `fireEvent` (it simulates the real browser's event sequence: pointer down, focus, key down, input, key up, click).
- **`@testing-library/jest-dom` — matchers.** <https://github.com/testing-library/jest-dom> — `toBeInTheDocument`, `toHaveTextContent`, `toHaveAttribute`, `toBeDisabled`, the full list.

### MSW (Mock Service Worker)

- **MSW — Getting started.** <https://mswjs.io/docs/getting-started> — the install, the Node setup for Vitest, the browser setup for Playwright.
- **MSW — Request handlers.** <https://mswjs.io/docs/concepts/request-handler/> — `http.get`, `http.post`, `HttpResponse.json`, error responses.
- **MSW — Best practices.** <https://mswjs.io/docs/best-practices/structuring-handlers> — keep handlers in one place, override per-test for edge cases.
- **MSW v2 migration notes.** <https://mswjs.io/docs/migrations/1.x-to-2.x/> — if you are reading older tutorials, MSW v2 changed the import path from `msw` to `msw/node` and `msw/browser` and the API from `rest.get` to `http.get`.

---

## The Kent C. Dodds canon

Kent C. Dodds maintains Testing Library, wrote the most influential essays in the modern frontend testing space, and gives the philosophy a voice. These five essays are the foundation:

- **"Write tests. Not too many. Mostly integration."** <https://kentcdodds.com/blog/write-tests> — the foundational essay. Frontend translation of Guillermo Rauch's tweet. Three paragraphs that reshaped a generation of test suites.
- **"Testing Implementation Details"** <https://kentcdodds.com/blog/testing-implementation-details> — the case against mocking React internals, asserting on `setState` calls, and the rest of the implementation-coupling family. Required reading.
- **"Common mistakes with React Testing Library"** <https://kentcdodds.com/blog/common-mistakes-with-react-testing-library> — twelve specific patterns. Each one looks reasonable. Each one is wrong. Most engineers do at least six of them on their first suite.
- **"Making your UI tests resilient to change"** <https://kentcdodds.com/blog/making-your-ui-tests-resilient-to-change> — the priority list, justified. Why `getByRole` beats `getByTestId` beats brittle string selectors.
- **"How to know what to test"** <https://kentcdodds.com/blog/how-to-know-what-to-test> — the heuristic for what deserves a test and what does not. The lecture borrows from this.

Other Kent C. Dodds essays worth a coffee break:

- **"AHA Testing"** <https://kentcdodds.com/blog/aha-testing> — Avoid Hasty Abstraction. Why three duplicated tests are usually better than one DRY one.
- **"Avoid Nesting when you're Testing"** <https://kentcdodds.com/blog/avoid-nesting-when-youre-testing> — flat test files beat deep `describe` trees.
- **"Test Isolation with React"** <https://kentcdodds.com/blog/test-isolation-with-react> — why each test should set up and tear down its own world.

---

## The test-pyramid canon

- **Mike Cohn — *Succeeding with Agile*, 2009.** The book where the pyramid first appeared. Pages 312–314. (No free link; the relevant figure is reproduced in every essay below.)
- **Martin Fowler — "TestPyramid"** <https://martinfowler.com/bliki/TestPyramid.html> — Fowler's short summary.
- **Martin Fowler — "The Practical Test Pyramid"** by Ham Vocke. <https://martinfowler.com/articles/practical-test-pyramid.html> — the long form. The essay every backend engineer reads; the principles transfer to frontend with the "component test" substitution.
- **Watirmelon — "Testing pyramids and ice-cream cones"** <https://watirmelon.blog/testing-pyramids/> — the visual taxonomy of test anti-patterns. The "cupcake," the "hourglass," the "ice-cream cone."
- **Google Testing Blog — "Just Say No to More End-to-End Tests"** <https://testing.googleblog.com/2015/04/just-say-no-to-more-end-to-end-tests.html> — Google's internal experience report. The shape of the suite at scale.

---

## AAA and the unit-test fundamentals

- **C2 Wiki — "Arrange, Act, Assert"** <https://wiki.c2.com/?ArrangeActAssert> — the original definition. Two paragraphs.
- **Roy Osherove — *The Art of Unit Testing*, 3rd ed.** Manning. (Not free; the AAA pattern is unattributed but Osherove's book is where it entered the broader testing literature.)
- **Khorikov — *Unit Testing: Principles, Practices, and Patterns*.** Manning. (Not free; the four-pillar framework — Protection against regressions, Resistance to refactoring, Fast feedback, Maintainability — is the right lens for choosing what to test.)
- **Martin Fowler — "TestDouble"** <https://martinfowler.com/bliki/TestDouble.html> — the taxonomy: dummy, stub, spy, mock, fake. Names matter; mixing them up confuses code review.
- **Martin Fowler — "Mocks Aren't Stubs"** <https://martinfowler.com/articles/mocksArentStubs.html> — the long article. The "classicist vs. mockist" distinction. Modern Testing Library is the classicist camp.

---

## Accessibility and `getByRole`

- **WAI-ARIA 1.2 — Roles definitions.** <https://www.w3.org/TR/wai-aria-1.2/#role_definitions> — the complete list of ARIA roles. The list you query against with `getByRole`.
- **MDN — ARIA roles.** <https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Roles> — the same list, with usage examples.
- **MDN — Accessibility tree.** <https://developer.mozilla.org/en-US/docs/Glossary/Accessibility_tree> — what a screen reader sees. The same tree `getByRole` traverses.
- **Sara Soueidan — "Accessible names and descriptions"** <https://www.sarasoueidan.com/blog/accessible-notifications-with-aria-live-regions-part-1/> — how the accessible name of an element is computed. The same algorithm that decides what `getByRole(_, { name: ... })` matches.
- **WebAIM — "Using ARIA"** <https://webaim.org/techniques/aria/> — the practitioner's guide.
- **`@axe-core/playwright`** <https://github.com/dequelabs/axe-core-npm/tree/develop/packages/playwright> — the accessibility linter as a Playwright plugin. Add it to the mini-project as a stretch goal.

---

## CI and GitHub Actions

- **GitHub Actions — Quickstart.** <https://docs.github.com/en/actions/quickstart> — the basics.
- **GitHub Actions — Workflow syntax.** <https://docs.github.com/en/actions/reference/workflow-syntax-for-github-actions> — the full reference.
- **GitHub Actions — Caching dependencies.** <https://docs.github.com/en/actions/using-workflows/caching-dependencies-to-speed-up-workflows> — caching `~/.npm` cuts a 30-second install to 5 seconds.
- **Playwright on CI.** <https://playwright.dev/docs/ci> — the matrix, the artifact upload, the report.
- **`actions/upload-artifact`.** <https://github.com/actions/upload-artifact> — how to keep the Playwright report from a failed run.
- **`actions/setup-node`.** <https://github.com/actions/setup-node> — the standard Node setup action with built-in npm cache.

---

## Snapshot and visual regression — the cautions

- **Vitest — Snapshot.** <https://vitest.dev/guide/snapshot.html> — the docs and the warnings.
- **Justin Searls — "Don't Mock Anything"** <https://blog.testdouble.com/posts/2018-03-21-why-dont-mock-anything/> — the most extreme version of the no-mock argument. Worth reading even if you do not fully agree.
- **Joel Hooks — "Why I avoid snapshot testing"** <https://joelhooks.com/why-i-avoid-snapshot-testing> — the practitioner's case against the pattern.
- **Playwright — Screenshots.** <https://playwright.dev/docs/screenshots> — the API beneath `toHaveScreenshot`.
- **Chromatic** (paid) <https://www.chromatic.com/> — the hosted visual-regression service for Storybook. Not used this week (paid); mentioned because if you outgrow Playwright's built-in screenshot diff, this is the next step.
- **Percy** (paid, BrowserStack) <https://percy.io/> — the same category as Chromatic. Same caveat.

---

## The browser engines

- **Chromium.** <https://www.chromium.org/> — Chrome, Edge, Opera, Brave. The market-share leader.
- **Gecko.** <https://firefox-source-docs.mozilla.org/> — Firefox.
- **WebKit.** <https://webkit.org/> — Safari (iOS and macOS). The reason Playwright matters — it is the only mainstream Node-based e2e runner that drives WebKit on Linux, which lets your CI catch Safari-only bugs without a Mac farm.

---

## Adjacent tools — know they exist

- **Cypress.** <https://www.cypress.io/> — the previous-generation incumbent. Free for OSS; the paid dashboard for parallel runs is the historical pain point. Still a fine tool. The mental model carries over from Playwright.
- **WebdriverIO.** <https://webdriver.io/> — older, Selenium-derived, mature. Used in enterprise. Not the default for new projects in 2026.
- **Selenium WebDriver.** <https://www.selenium.dev/> — the W3C standard. Underpins many test stacks. Heavier and slower than Playwright; the standard endures because of cross-language support (Java, Python, Ruby, JS).
- **Puppeteer.** <https://pptr.dev/> — Google's Chromium-only automation library. Lighter than Playwright; lower-level. Playwright was originally a Microsoft fork of Puppeteer; the Playwright team is the same team that wrote Puppeteer at Google.
- **Storybook.** <https://storybook.js.org/> — component playground and visual-test platform. Pairs naturally with this week's stack. Not built this week; a candidate for a later module.
- **Mocha + Chai + Sinon.** <https://mochajs.org/> — the previous-generation Node test stack. Vitest replaced this for Vite projects; Mocha is still maintained and still fine for non-Vite codebases.
- **Jest.** <https://jestjs.io/> — Facebook's runner. The previous default. Vitest's API is intentionally Jest-compatible so the migration is mostly find-and-replace. If your future job uses Jest, the lecture transfers.
- **Pact.** <https://docs.pact.io/> — consumer-driven contract testing. The "make sure the frontend and backend agree on the API shape" tool. Out of scope this week; mentioned for completeness.
- **k6.** <https://k6.io/> — load testing. Different problem space; you will need it eventually.
- **Lighthouse CI.** <https://github.com/GoogleChrome/lighthouse-ci> — performance budgets in CI. Pairs with Week 9.

---

## Books — for the road ahead

(Most are not free; the chapters most relevant to this week are documented in the URLs above.)

- **Kent Beck — *Test-Driven Development By Example*.** Addison-Wesley. The book that popularized TDD. Read once in your career.
- **Roy Osherove — *The Art of Unit Testing*, 3rd ed.** Manning. The pragmatic unit-test bible.
- **Vladimir Khorikov — *Unit Testing: Principles, Practices, and Patterns*.** Manning. The four-pillar framework. Written for backend C# but the framework is language-agnostic.
- **Lisa Crispin & Janet Gregory — *Agile Testing*.** Addison-Wesley. The whole-team-view-of-quality book.

---

## Stack Overflow tag pages — when something specific breaks

- **`[vitest]`** <https://stackoverflow.com/questions/tagged/vitest>
- **`[playwright]`** <https://stackoverflow.com/questions/tagged/playwright>
- **`[react-testing-library]`** <https://stackoverflow.com/questions/tagged/react-testing-library>
- **`[testing-library]`** <https://stackoverflow.com/questions/tagged/testing-library>
- **`[msw]`** <https://stackoverflow.com/questions/tagged/msw>

---

## Free hosted sandboxes

- **StackBlitz Vitest starter.** <https://stackblitz.com/edit/vitejs-vite-vitest-starter> — boot a Vite + Vitest project in the browser, no install.
- **Playwright Try It Online.** <https://try.playwright.dev/> — write and run a Playwright test in the browser against a hosted Chromium.

---

## The spec documents

The web platform features the tests target are specified in:

- **HTML Living Standard.** <https://html.spec.whatwg.org/> — the source of truth for what `<button>`, `<input>`, `<dialog>`, and friends do.
- **WAI-ARIA 1.2.** <https://www.w3.org/TR/wai-aria-1.2/> — the role and accessible-name algorithm.
- **WebDriver BiDi.** <https://w3c.github.io/webdriver-bidi/> — the next-generation browser-automation protocol. Playwright is one of the early adopters.
- **DOM Standard.** <https://dom.spec.whatwg.org/> — the event model `userEvent` simulates.

---

## What to do when you get stuck

1. **Read the error message.** Vitest and Playwright both have excellent error messages; they tell you what they queried, what they found, what they expected. The first instinct should be to read the full message, not to immediately Google.
2. **Open the Playwright trace.** `npx playwright show-trace test-results/.../trace.zip`. The trace is the source of truth for what happened.
3. **Check the Testing Library priority list.** If a query is fragile, the priority list usually says "you should be using a different query."
4. **Search the GitHub issues**, not Stack Overflow. The Vitest and Playwright maintainers respond quickly and the answers are usually authoritative.
5. **Reach for `screen.debug()`** (Testing Library) or `await page.pause()` (Playwright). Both pause the test and show you the current DOM. They are the equivalent of `console.log` for tests.

---

*Bookmark the first six links — the Vitest guide, the Playwright intro, the Testing Library guiding principles, the Testing Library priority list, the MSW getting-started, and the Kent C. Dodds "Write tests. Not too many. Mostly integration." essay. Those six tabs are open in every productive frontend engineer's browser when they sit down to write a test suite in 2026.*
