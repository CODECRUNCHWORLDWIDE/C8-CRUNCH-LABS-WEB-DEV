# Exercise 1 — AAA and your first Vitest tests

> *Time budget: 2 hours. Goal: install Vitest, configure it, and write three Arrange-Act-Assert-shaped unit tests against pure helpers carried over from the Week 10 codebase. By the end you should be able to read the AAA structure inside any test in this repository and know whether it follows the pattern.*

## Pre-work

You should have already read:

- Lecture 1 — at least sections 2 (AAA) and 3 (what to test).
- Lecture 2 — at least sections 1 (install) and 2 (the first unit test).
- Kent C. Dodds — ["Write tests. Not too many. Mostly integration."](https://kentcdodds.com/blog/write-tests). Ten minutes.

If you have not read these, do that first. The rest of the exercise assumes you have.

## What you are going to build

A Vitest test file (`exercises/starter-helpers.test.ts`) that exercises three pure helper functions in `exercises/starter-helpers.ts`. Each test is in the AAA shape — three sections, in order, with explicit labels.

The three helpers under test:

1. **`isExpired(token, now)`** — returns `true` if the token's `exp` claim is in the past. Same helper from the Week 10 lecture.
2. **`formatRelativeTime(date, now)`** — returns a human-readable relative time ("3 minutes ago", "in 2 hours", "just now"). Pure function over a `Date` input.
3. **`pickClaims(payload, allowed)`** — returns a new object containing only the keys from `allowed` that exist on `payload`. Used to strip a JWT payload down to the claims the UI is allowed to display.

## Step 1 — install Vitest

In the directory where you are running this exercise (a fresh folder or a clone of the Week 10 mini-project — your choice), install:

```bash
npm install -D vitest @vitest/ui jsdom
```

Add to `package.json`:

```json
{
  "type": "module",
  "scripts": {
    "test": "vitest",
    "test:run": "vitest run",
    "test:ui": "vitest --ui"
  }
}
```

Create `vitest.config.ts`:

```ts
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
  },
})
```

Note: `environment: 'node'` is fine for this exercise — there are no React components yet. We will switch to `'jsdom'` in exercise 2.

Run `npx vitest --version`. You should see `1.x.x` or newer.

## Step 2 — read the starter helpers

Open `exercises/starter-helpers.ts` and read all three function bodies. Each helper has one or two non-trivial branches; your tests will pin those branches.

## Step 3 — write tests for `isExpired`

Open `exercises/starter-helpers.test.ts`. The file already has the imports and a `describe` block scaffolded for you; you write the `it` blocks.

Write **three** tests for `isExpired`:

1. **"returns true when exp is in the past"** — pass a token whose `exp` is well in the past (e.g. `exp: 1_000_000_000`, year 2001), and the current real `Date.now()`. Assert `true`.
2. **"returns false when exp is in the future"** — pass a token whose `exp` is well in the future (current time plus 600 seconds). Assert `false`.
3. **"returns false at exactly exp (uses strict less-than)"** — pass a token and a `now` that exactly matches `token.exp * 1000`. Assert `false`. (This pins the boundary; an off-by-one to `<=` would break this test.)

Each test should use the three-section AAA shape with **explicit comments** labeling each section. The lecture 1 example is the template.

Run `npm test`. Three tests should pass in under 100 ms.

## Step 4 — write tests for `formatRelativeTime`

The helper returns:

- `"just now"` for differences under 30 seconds in absolute value.
- `"in X seconds"` / `"X seconds ago"` for differences under 60 seconds.
- `"in X minutes"` / `"X minutes ago"` for differences under 3600 seconds.
- `"in X hours"` / `"X hours ago"` for everything larger.

Write **four** tests:

1. **"returns 'just now' for a 5-second difference"**
2. **"returns 'X seconds ago' for a 40-second past difference"**
3. **"returns 'in X minutes' for a 5-minute future difference"**
4. **"returns 'X hours ago' for a 3-hour past difference"**

Each test should be in AAA shape (you may drop the comment labels now that you have done it once; the structure should still be visible).

Run `npm test`. Seven tests total should pass.

## Step 5 — write tests for `pickClaims`

The helper is:

```ts
function pickClaims<T extends object>(payload: T, allowed: readonly (keyof T)[]): Partial<T>
```

It returns a new object with only the keys from `allowed` that exist on `payload`. Keys in `allowed` that are not in `payload` are skipped. Keys in `payload` that are not in `allowed` are dropped.

Write **three** tests:

1. **"returns only the allowed keys"** — `pickClaims({a: 1, b: 2, c: 3}, ['a', 'c'])` should return `{a: 1, c: 3}`.
2. **"skips allowed keys that do not exist on the payload"** — `pickClaims({a: 1}, ['a', 'b'])` should return `{a: 1}` (no `b` key in the result, not `b: undefined`).
3. **"does not mutate the original payload"** — verify with `expect(payload).toEqual({a: 1, b: 2, c: 3})` after the call.

The third test is interesting because it asserts on something the function does **not** do. Pinning a non-effect is valuable when the function's contract includes immutability.

Run `npm test`. **Ten** tests total should pass.

## Step 6 — open the Vitest UI

Run `npm run test:ui`. A browser tab opens at `http://localhost:51204/__vitest__/`. You should see:

- The test tree on the left, with all 10 tests checked off.
- The file view in the middle, with line-by-line execution.
- The console / errors panel on the right.

Click a test in the tree. You see the test code, the assertions, and the time it took. This is the development environment you want open while writing tests; the watch-and-re-run loop is sub-second.

## Step 7 — break a test deliberately

To convince yourself the tests would catch a real bug, change one line of `starter-helpers.ts`:

```ts
// Before
return token.exp * 1000 < now

// After
return token.exp * 1000 <= now
```

Run `npm test`. The "returns false at exactly exp" test should now fail. Read the failure message — it tells you which test, which line, what was expected, and what was received. Revert the change and confirm green again.

## Step 8 — answer these questions

In a comment at the bottom of `starter-helpers.test.ts`, answer:

1. Which of the 10 tests follows AAA most clearly? Why?
2. Which test would still pass if the helper's internal implementation were rewritten in a different style (e.g. using `Math.floor` instead of `Math.round`)? Which would fail?
3. The `pickClaims` "does not mutate" test asserts on the absence of an effect. What other helpers in your real code would benefit from a similar non-mutation test?

## Submission

Commit the changes:

```bash
git add package.json vitest.config.ts exercises/starter-helpers.test.ts
git commit -m "exercise 1: AAA and the first Vitest tests"
```

Move on to exercise 2 when this passes.

## What you should be able to do now

- Install Vitest in a fresh project.
- Write a test in the AAA shape.
- Read a Vitest failure message.
- Open the Vitest UI.
- Recognize when a test is testing the implementation vs. testing the behavior.

## Reference

- Vitest — Getting started: <https://vitest.dev/guide/>
- Kent C. Dodds — "Write tests. Not too many. Mostly integration.": <https://kentcdodds.com/blog/write-tests>
- C2 Wiki — Arrange, Act, Assert: <https://wiki.c2.com/?ArrangeActAssert>
