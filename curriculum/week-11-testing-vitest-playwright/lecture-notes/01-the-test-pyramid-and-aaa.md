# Lecture 1 — The Test Pyramid, AAA, and What to Test

> *Before any line of test code, the orienting question is: what shape should the suite take, and how should each test be structured? This lecture answers both. The pyramid gives the macro shape; AAA gives the micro shape; the Kent C. Dodds and Martin Fowler canon gives the philosophy that ties the two together. By the end of this lecture you should be able to look at a frontend codebase you have never seen before and say, with reasons, where the suite is well-balanced, where it is upside-down, and what to write next.*

There is more bad testing advice on the internet than good testing advice. The bad advice usually comes from one of three sources: (1) a vendor whose business model depends on selling you a paid CI dashboard, (2) a tutorial author who has never maintained a test suite past month six, or (3) a manager who confused "100% coverage" with "100% safe to ship." This lecture pulls from the people who **have** maintained test suites past month six — the Martin Fowlers, the Kent C. Doddses, the Vitest and Playwright maintainers — and assembles their advice into a working mental model.

The model has three levels, and we will spend most of the lecture inside it:

1. **The pyramid.** How many tests of which kind do you want? Why does an inverted pyramid hurt? Why does the frontend pyramid put component tests in the middle?
2. **The AAA pattern.** What does a single well-shaped test look like? Why are tests that mix setup and assertion hard to maintain? What is the difference between one assertion and one logical assertion?
3. **What to test and what not to test.** Which behaviors deserve a test? Which assertions are dead weight? Which are negative-value — they cost more to maintain than they save?

If you finish the lecture and you remember exactly one thing, let it be Kent C. Dodds's three-sentence summary: **"Write tests. Not too many. Mostly integration."** Every other piece of advice in this lecture, including everything that follows about the pyramid and AAA, is downstream of those nine words.

---

## 1. The test pyramid

### Where it came from

The pyramid as a concept appeared in Mike Cohn's 2009 book *Succeeding with Agile*. Cohn was a backend Java consultant; his audience was teams that had built up large suites of end-to-end tests, watched the suite grow to 45-minute runtimes, and wanted a way to think about which tests to write less of and which to write more of. The picture he drew — a triangle, wide at the bottom, narrow at the top — was three lines of advice:

- **Many unit tests.** Fast, isolated, focused on one piece of logic. Run on every save.
- **Some integration tests.** Slower, exercise the interaction between modules. Run on every commit.
- **Few end-to-end tests.** Slowest, drive the system through its real interface. Run on every push.

The shape mattered for one reason only: **feedback speed times coverage equals confidence**. A test that takes 30 milliseconds and covers one function gives you instant feedback on a narrow slice; a test that takes 30 seconds and covers a full user journey gives you slow feedback on a wide slice. The mature suite has both, in the right ratio.

Martin Fowler's [TestPyramid bliki entry](https://martinfowler.com/bliki/TestPyramid.html) restated Cohn's argument in 2012, and Ham Vocke's [Practical Test Pyramid](https://martinfowler.com/articles/practical-test-pyramid.html) on martinfowler.com is the canonical long-form version. Read both.

### The frontend version

Cohn was writing about backend Java. The frontend translation is almost the same, with one substitution: the middle layer is **component tests**, not "integration tests" in the backend sense.

```
              /\
             /  \         end-to-end (Playwright)
            /    \        — a few dozen tests
           /------\       — drive a real browser
          /        \      — cover critical flows
         /          \     — 1-5s each
        /------------\
       /              \   component tests (Vitest + Testing Library)
      /                \  — a few hundred tests
     /                  \ — render real components in JSDOM
    /                    \— cover component behavior
   /----------------------\— 10-100ms each
  /                        \
 /     unit tests           \ pure functions, hooks, helpers
/   (Vitest, no React)       \ — a few thousand tests
\----------------------------/ — 1-10ms each
```

A typical mature SPA in 2026 has on the order of:

- **1,000–5,000 unit tests** for pure functions, custom hooks, utility libraries, and reducer logic. Each runs in 1–10 ms. The whole suite is sub-30-second.
- **200–500 component tests** for individual React components — does the button render, does it call the handler, does the form validate. Each runs in 10–100 ms. The whole suite is 30 seconds to 3 minutes.
- **20–80 end-to-end tests** for critical user flows — sign in, complete checkout, upload a file. Each runs in 1–5 seconds. The whole suite is 1–5 minutes, parallel across three browsers.

The total wall-clock for a CI run is around 5–10 minutes, which is what a working team can sustain on every push without resentment.

### The ice-cream cone — the anti-pattern

The most common failure mode is the **inverted pyramid** — sometimes called the [ice-cream cone](https://watirmelon.blog/testing-pyramids/). The team built no unit tests, a handful of component tests, and a large pile of end-to-end tests. The end-to-end tests are the only tests anyone trusts because they are the only ones that touch the real system; the unit tests, if they exist at all, have been ignored for so long that nobody knows whether they still pass.

```
\------------------------\
 \                        / e2e tests — many
  \                      /  (slow, flaky, hard to debug)
   \                    /
    \------------------/
     \                /    component tests — few
      \              /
       \------------/
        \          /       unit tests — almost none
         \--------/
```

The ice-cream cone has three predictable pathologies:

1. **The suite is slow.** A run is 45 minutes. The team starts merging without waiting for green.
2. **The suite is flaky.** End-to-end tests touch the network, the database, the browser timing, the auth provider — each of which can hiccup. Re-running a flake becomes a daily routine.
3. **Failures are hard to diagnose.** When a 30-step e2e test fails on step 17, the only signal is "something between step 1 and step 17 went wrong." A unit test that fails tells you exactly which function returned the wrong value.

Vincent Voyer's watirmelon.blog post lays out the related anti-patterns — the "cupcake" (top-heavy with manual QA), the "hourglass" (unit + e2e, no component), and the "two-scoop ice cream cone" (an investment that just keeps making the cone fatter). The diagnostic is always the same: **how long is the median feedback loop, and how confident is the team that a green run means it is safe to ship.**

### Why component tests are the unsung hero

The unit-test layer catches logic bugs in pure functions; the e2e layer catches integration bugs across the whole system. The middle — component tests — catches the bugs that live **inside a single component but require the React render lifecycle to surface**. Things like:

- The button is `disabled` until the form is valid; the test checks that typing into the email field enables the submit button.
- The error message renders **after** the failed submit, not before.
- The async loading spinner disappears when the data arrives.
- The component correctly passes props to its child without breaking the child's behavior.

A pure-function unit test cannot catch any of these — they all require a React render. A Playwright end-to-end test could catch them, but at a 50x slowdown and with worse failure messages. The component test sits exactly where it should sit.

A team with a healthy middle layer ships features without breaking each other's work. A team without one ends up writing e2e tests for things a component test could handle in 1/50th the time.

### The Google e2e essay

The Google Testing Blog post ["Just Say No to More End-to-End Tests"](https://testing.googleblog.com/2015/04/just-say-no-to-more-end-to-end-tests.html) is the internal-experience version of the pyramid argument. Google ran a 90% / 9% / 1% (unit / integration / e2e) split for years, found that even 1% of an end-to-end-heavy suite was too much, and walked away from the practice. Read it. The post predates the modern frontend stack, but the principle has not aged.

---

## 2. AAA — Arrange, Act, Assert

### The pattern

Every test, regardless of language or framework, should have three sections, in order:

```js
test('the search input filters the list', async () => {
  // ARRANGE — set up the world
  render(<ItemList items={SAMPLE_ITEMS} />)
  const searchInput = screen.getByRole('searchbox')

  // ACT — perform the single action under test
  await userEvent.type(searchInput, 'banana')

  // ASSERT — check the result
  expect(screen.getByText('Banana')).toBeInTheDocument()
  expect(screen.queryByText('Apple')).not.toBeInTheDocument()
})
```

The labels can be comments, blank lines, or implicit; what matters is the shape. The Arrange section sets up the world the test needs. The Act section performs the single action whose effect is under test. The Assert section checks the result.

The pattern's original write-up is on the [C2 wiki](https://wiki.c2.com/?ArrangeActAssert) and dates to the early 2000s. Roy Osherove's *The Art of Unit Testing* popularized it in the Java world. It is language-agnostic, framework-agnostic, and the cheapest readability investment a test author can make.

### Why it matters

Tests are read more often than they are written. The reader is usually you, six months from now, trying to diagnose a CI flake at 11pm. A test that mixes setup and assertion forces the reader to mentally separate "what is being established" from "what is being checked"; a test that follows AAA does the separation for them.

Contrast:

**Without AAA:**

```js
test('search filters', async () => {
  const items = [{ name: 'Apple' }, { name: 'Banana' }]
  const { getByRole, getByText, queryByText } = render(<ItemList items={items} />)
  await userEvent.type(getByRole('searchbox'), 'banana')
  expect(getByText('Banana')).toBeInTheDocument()
  const itemsAfter = [{ name: 'Apple' }, { name: 'Banana' }, { name: 'Cherry' }]
  // wait, where did this come from? why is it here?
})
```

**With AAA:**

```js
test('search filters the list to matching items', async () => {
  // Arrange
  const items = [{ name: 'Apple' }, { name: 'Banana' }]
  render(<ItemList items={items} />)

  // Act
  await userEvent.type(screen.getByRole('searchbox'), 'banana')

  // Assert
  expect(screen.getByText('Banana')).toBeInTheDocument()
  expect(screen.queryByText('Apple')).not.toBeInTheDocument()
})
```

The second test is six lines longer to set up but two minutes faster to read.

### One action per test

The Act section should contain **one** user action: one click, one keystroke sequence, one navigation. The temptation to test "log in, then navigate, then submit a form, then assert the toast" inside a single test is strong, especially when the setup for each step is tedious. **Resist it.** The resulting test is hard to name (what is it actually testing?), hard to debug (which step failed?), and slow (you re-do the setup for the next test). Split it into four tests, share the Arrange step with a fixture or a `beforeEach`, and let each test name describe exactly one behavior.

The exception is the end-to-end test. An e2e test legitimately walks through a sequence — "the user signs in, navigates to the profile, edits the name, and sees the change." The full sequence is the test, and the cost of splitting it would be paying the sign-in cost four times. For e2e, one **flow** per test is the right granularity; for unit and component tests, one **action** per test.

### One assertion per test (the spirit, not the letter)

"One assertion per test" is the advice you will read in older books. The strict reading — one `expect(...)` call per test — is too restrictive; nobody writes that way in practice. The right reading is **one logical assertion per test**, which can be:

```js
expect(user).toMatchObject({
  name: 'Ada',
  email: 'ada@example.com',
  isAdmin: false,
})
```

That is one logical assertion expressed as three field checks. Compare to:

```js
expect(user.name).toBe('Ada')
expect(user.email).toBe('ada@example.com')
expect(user.isAdmin).toBe(false)
```

Same content, three statements. Either is fine. What is **not** fine is asserting on unrelated facts in one test:

```js
// don't do this
test('the form works', () => {
  render(<Form />)
  // ... type in email
  expect(screen.getByText('Email saved')).toBeInTheDocument()
  // ... type in name
  expect(screen.getByText('Name saved')).toBeInTheDocument()
  // ... submit
  expect(screen.getByText('Submitted')).toBeInTheDocument()
})
```

That is three tests pretending to be one. Each new behavior gets a new test.

---

## 3. What to test, what not to test

### The four pillars (Khorikov)

Vladimir Khorikov's *Unit Testing: Principles, Practices, and Patterns* names four properties every good test has — and any test that scores poorly on one of them should be reconsidered:

1. **Protection against regressions.** Does this test catch a real bug when one is introduced? A test that always passes regardless of the code's behavior is dead weight.
2. **Resistance to refactoring.** Does this test stay green when the implementation changes but the behavior does not? A test that breaks every time you rename an internal variable is anti-refactoring.
3. **Fast feedback.** Does this test run in a unit-test-fast 1–10 ms, or does it cost a second? A test in the wrong tier of the pyramid is failing this pillar.
4. **Maintainability.** Is the test code itself simple enough to read in 30 seconds and modify with confidence?

The trade-off in practice is between pillars 1 and 2. A test that asserts on every detail of the implementation has high regression protection (it catches every change) but low refactor resistance (it breaks on every refactor). A test that asserts only on user-visible behavior has lower regression protection (it might miss a subtle internal bug) but high refactor resistance (it survives refactors that preserve behavior). **Testing Library and the modern frontend stack optimize for refactor resistance, knowingly trading a small amount of regression protection for it.** That is a defensible choice; the bug Testing Library accepts missing is "an internal helper function changed signature but the user-visible behavior is correct" — which is not actually a bug, it is a non-event.

### Kent C. Dodds's "Testing Implementation Details"

The canonical essay on what not to test is Kent C. Dodds's [Testing Implementation Details](https://kentcdodds.com/blog/testing-implementation-details). The two examples to remember:

**Implementation-detail test (anti-pattern):**

```js
test('the counter component uses useState', () => {
  const useStateSpy = vi.spyOn(React, 'useState')
  render(<Counter />)
  expect(useStateSpy).toHaveBeenCalledWith(0)
})
```

This test asserts that the component is implemented with `useState` initialized to `0`. The component could be implemented with `useReducer`, with a `useRef`, with a class component, or with an external state library — and the user experience would be identical. **The test breaks on any of those refactors even though the user-facing behavior is preserved.** It has no regression protection (it does not catch a real bug; the bug would be a behavior change, not an implementation change) and no refactor resistance. It is a pure liability.

**Behavior test (good pattern):**

```js
test('clicking the increment button increases the displayed count', async () => {
  render(<Counter />)
  expect(screen.getByText('Count: 0')).toBeInTheDocument()
  await userEvent.click(screen.getByRole('button', { name: /increment/i }))
  expect(screen.getByText('Count: 1')).toBeInTheDocument()
})
```

This test asserts that the user-visible count goes up when the user clicks. The implementation can be `useState`, `useReducer`, Redux, Zustand, or hand-rolled signals — the test passes for all of them, and fails only when the user-visible behavior actually breaks. It scores high on every Khorikov pillar.

The rule of thumb: **if the test would have to change when you refactor the implementation without changing behavior, the test is testing the wrong thing.**

### What to test

| Test it | Why |
|---------|-----|
| **Pure helper functions** | High value-per-test; cheap; if the helper has any branching, test the branches. |
| **Reducer / state transitions** | Same as helpers — pure functions over state. Test the transitions. |
| **Custom hooks** | Use `renderHook` from Testing Library; test the API the hook exposes, not the internals. |
| **Component behavior — input goes in, expected DOM comes out** | The component test sweet spot. |
| **Critical user flows end-to-end** | Sign in, submit a payment, post a message. The handful of paths users actually take. |
| **Bug regressions** | Every bug fix gets a test that fails on the buggy code and passes on the fix. |
| **Accessibility expectations** | `getByRole` queries double as accessibility assertions; the test fails if the accessible name disappears. |

### What not to test

| Don't test it | Why |
|---------------|-----|
| **Third-party libraries** | React, React Router, the OIDC library, the date library — they have their own test suites. Asserting on their behavior in your code clutters your suite and breaks on their upgrades. |
| **Implementation details** | `useState` calls, internal helper functions, props passed to inner components. See above. |
| **Trivial getters and pass-throughs** | A function whose body is `return props.x` does not need a test. |
| **Configuration objects** | `expect(config.timeout).toBe(5000)` is a tautology; the test is the source. |
| **Static rendering with no logic** | If a component is `<h1>Welcome</h1>`, the existence-of-the-rendered-string test costs more than it saves. |
| **Generated code** | Apollo's generated types, Prisma's generated client — covered by the generator's tests. |

The honest measure: **does this test add a check the team would have wanted in the absence of the test, or is it pure protocol?**

### The "Write tests. Not too many. Mostly integration." rule

Guillermo Rauch tweeted the phrase in 2016. Kent C. Dodds expanded it into [an essay](https://kentcdodds.com/blog/write-tests). The three clauses translate to:

- **"Write tests."** Don't ship untested code. The minimum viable suite is non-zero.
- **"Not too many."** Coverage is a hint; chasing 100% buys nothing past about 75–80%.
- **"Mostly integration."** Component tests (in the Testing Library sense — render the real component, do not mock children) are the sweet spot. Lots of unit tests for pure logic; many component tests for behavior; few end-to-end tests for critical paths.

The phrase "integration test" here means **component test** in the modern frontend vocabulary — a test that renders the real component with its real dependencies (router, context, child components) and exercises it. Not "integration test" in the backend sense (testing the interaction between database and service).

---

## 4. Code-as-a-test-author — concrete heuristics

### "Could a screen reader observe what this test is checking?"

If the test asserts on something a screen-reader user could perceive (the text on screen, the accessible name of a button, the focus position), the test is checking behavior. If the test asserts on something only a developer can see (internal state, the result of a particular function call, the order of effect runs), the test is checking implementation. **Prefer the former.**

### "Would this test still make sense if I rewrote the component from React to Vue?"

The thought experiment is artificial — you are not going to rewrite from React to Vue. But the question is useful: a test that survives the rewrite is testing behavior; a test that does not survive is testing implementation. Most Testing Library tests would survive; most Enzyme tests would not. Most Playwright tests would; most mocked-everything tests would not.

### "Will the AI that writes the next version of this code know to keep this test passing?"

A new heuristic for the AI-assisted-coding era. If your team uses an AI assistant to refactor code and the test breaks for a reason the AI cannot easily diagnose (an internal helper got renamed, a private function moved), the test is going to be deleted by the next refactor. Tests that assert on user-visible behavior survive both human and AI refactors; tests that assert on implementation do not.

### The "delete every test that has not failed in a year" heuristic

A controversial heuristic that some teams enforce: a test that has not caught a regression in 12 months is removed. The argument is that an always-green test is, by definition, dead weight — it contributes to the maintenance budget without contributing to the safety budget. The counter-argument is that some tests have a long expected mean-time-to-failure and exist for high-impact rare failures. The honest middle ground: **periodically audit the suite for tests nobody touches.** A test that has not been read or modified in two years and has never failed is probably not earning its keep.

---

## 5. The cost-of-ownership math

Every test you write has a cost across three dimensions:

1. **Write cost.** The 10–60 minutes you spend writing it.
2. **Maintenance cost.** The minutes (cumulative, over years) you spend updating it as the code around it changes. A brittle test costs you 5 minutes every refactor; a robust test costs you 0.
3. **Runtime cost.** The milliseconds-to-seconds it adds to every CI run. A 5-second e2e test, run 50 times a day across a team of 8 engineers, eats 2,000 seconds of cumulative wait time per day.

And one benefit:

1. **Bug-detection benefit.** The probability that this test catches a real regression before it ships, times the cost of catching that regression in production instead.

The intuition for **what to test** is the bug-detection benefit divided by the total cost. A unit test for a billing-calculation function has high benefit and low cost — write it. A component test for the login form has high benefit and medium cost — write it. A snapshot test of a 400-line component tree has low benefit (snapshots get rubber-stamped) and high maintenance cost (every styling change re-snapshots) — do not write it.

This is the math the rest of the week is downstream of. Vitest minimizes the runtime cost of the unit and component tiers. Playwright minimizes the runtime cost of the e2e tier (parallel workers, headless browsers). Testing Library minimizes the maintenance cost (refactor-resistant queries). MSW minimizes the maintenance cost of network-dependent tests (real components, fake network).

You are not adding test code for the sake of adding test code. You are adding test code where the cost-benefit math comes out positive — and **the math is positive way more often than untrained engineers think, and way less often than testing-evangelist tutorials claim.** The middle ground is the engineering judgement this week trains.

---

## 6. A position the lecture takes

Some of what you read this week will contradict things you read elsewhere. To be clear about where this lecture takes a position, here is the short list:

- **`getByRole` first, `getByTestId` last.** The Testing Library priority list is correct. If a test reaches for `getByTestId` first, the test is hiding an accessibility problem.
- **Do not mock React Router. Do not mock React. Do not mock children.** Render the real thing.
- **Mock the network at the boundary, with MSW, not by stubbing `fetch`.** The component, the hook, and the auth library all run for real.
- **Snapshot tests of large component trees are dead weight.** Snapshot tests of small, meaningful output are fine. Visual regression via Playwright's `toHaveScreenshot` is fine.
- **End-to-end tests are precious; do not write fifty of them.** Write the dozen critical flows. The component test layer handles everything else.
- **Coverage above 80% is usually counterproductive.** The last 20% of code is usually the edge cases and error paths that are hardest to write reliable tests for. Spend the budget on improving the tests you have, not on driving the number to 100.
- **Trace on every CI run.** Playwright's trace viewer is the single highest-leverage feature in any test runner; turn it on with `trace: 'on-first-retry'` on day one.

If your future team takes a different position, fine — these are defensible-but-not-universal opinions. The point is to have **a** position, defended by reasons, rather than to randomly assemble a test suite without a working philosophy.

---

## Up next

Lecture 2 takes the philosophy and turns it into running code. Vitest gets installed, configured, and pointed at a `vitest.config.ts`. Testing Library renders a real component. `userEvent` types into a real input. The priority list gets converted from words to a series of refactors of the same test. By the end of lecture 2 you will have written component tests; by the end of lecture 3, you will have written end-to-end tests; by the end of the mini-project, you will have a green CI badge for a test suite that follows the philosophy in this lecture.

---

## Quick-reference

- **The pyramid:** many unit tests at the base, fewer component tests in the middle, very few end-to-end tests at the top.
- **AAA:** Arrange, Act, Assert — three labeled sections in every test.
- **One action per test:** one click, one keystroke sequence, one navigation.
- **One logical assertion per test:** a `toMatchObject` with five fields is one logical assertion; three unrelated `toBe` calls is three tests pretending to be one.
- **Test behavior, not implementation.** If you would have to change the test when refactoring without changing behavior, the test is wrong.
- **Mostly integration.** Component tests are the sweet spot for ROI.
- **Coverage is a hint, not a goal.** Above 80% the marginal value drops sharply.

Read the Kent C. Dodds essay [Write tests. Not too many. Mostly integration.](https://kentcdodds.com/blog/write-tests) once a year for the next ten years. The advice does not age.
