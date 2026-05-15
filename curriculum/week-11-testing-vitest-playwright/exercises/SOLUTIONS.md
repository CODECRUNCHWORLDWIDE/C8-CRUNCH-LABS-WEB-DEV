# Exercise solutions

> *Reference solutions for the three exercises. Read after you have tried each. Each solution is annotated with the editorial choices the canonical version makes.*

---

## Exercise 1 — Solutions

### `isExpired` — all three tests

```ts
describe('isExpired', () => {
  it('returns true when exp is in the past', () => {
    // Arrange
    const token = { exp: 1_000_000_000 } // 2001-09-09
    const now = Date.now()

    // Act
    const result = isExpired(token, now)

    // Assert
    expect(result).toBe(true)
  })

  it('returns false when exp is in the future', () => {
    // Arrange
    const tenMinutesFromNow = Math.floor(Date.now() / 1000) + 600
    const token = { exp: tenMinutesFromNow }

    // Act
    const result = isExpired(token)

    // Assert
    expect(result).toBe(false)
  })

  it('returns false at exactly exp (uses strict less-than)', () => {
    // Arrange
    const exp = 2_000_000_000 // a fixed future-ish timestamp
    const token = { exp }
    const exactlyNow = exp * 1000

    // Act
    const result = isExpired(token, exactlyNow)

    // Assert
    expect(result).toBe(false)
  })
})
```

**Editorial notes:**

- The first test uses the real `Date.now()`. This is fine because we know `1_000_000_000` is in the past for any plausible "now" — the test is not flaky.
- The third test pins the boundary. If a future engineer "simplifies" the operator from `<` to `<=`, this test breaks immediately. That is regression protection earning its keep.

### `formatRelativeTime` — all four tests

```ts
describe('formatRelativeTime', () => {
  it("returns 'just now' for a 5-second difference", () => {
    const now = new Date('2026-05-14T12:00:00Z')
    const fiveSecondsAgo = new Date('2026-05-14T11:59:55Z')
    expect(formatRelativeTime(fiveSecondsAgo, now)).toBe('just now')
  })

  it("returns 'X seconds ago' for a 40-second past difference", () => {
    const now = new Date('2026-05-14T12:00:00Z')
    const fortyAgo = new Date('2026-05-14T11:59:20Z')
    expect(formatRelativeTime(fortyAgo, now)).toBe('40 seconds ago')
  })

  it("returns 'in X minutes' for a 5-minute future difference", () => {
    const now = new Date('2026-05-14T12:00:00Z')
    const fiveAhead = new Date('2026-05-14T12:05:00Z')
    expect(formatRelativeTime(fiveAhead, now)).toBe('in 5 minutes')
  })

  it("returns 'X hours ago' for a 3-hour past difference", () => {
    const now = new Date('2026-05-14T12:00:00Z')
    const threeAgo = new Date('2026-05-14T09:00:00Z')
    expect(formatRelativeTime(threeAgo, now)).toBe('3 hours ago')
  })
})
```

**Editorial notes:**

- Every test passes a fixed `now`, not the real `new Date()`. Time-dependent tests should never depend on the wall clock — they fail mysteriously when the test runs across a minute boundary. A fixed reference is deterministic.
- The values were chosen to land cleanly inside each band, away from boundaries. A separate test would pin the boundaries (29 vs. 30 seconds, 59 vs. 60 seconds); this set covers the bands.

### `pickClaims` — all three tests

```ts
describe('pickClaims', () => {
  it('returns only the allowed keys', () => {
    const payload = { a: 1, b: 2, c: 3 }
    const result = pickClaims(payload, ['a', 'c'])
    expect(result).toEqual({ a: 1, c: 3 })
  })

  it('skips allowed keys that do not exist on the payload', () => {
    const payload = { a: 1 } as { a: number; b?: number }
    const result = pickClaims(payload, ['a', 'b'])
    expect(result).toEqual({ a: 1 })
    expect(result).not.toHaveProperty('b')
  })

  it('does not mutate the original payload', () => {
    const payload = { a: 1, b: 2, c: 3 }
    pickClaims(payload, ['a'])
    expect(payload).toEqual({ a: 1, b: 2, c: 3 })
  })
})
```

**Editorial notes:**

- The second test uses `not.toHaveProperty('b')` — this is stricter than `toEqual({ a: 1 })`. The latter would still pass if the implementation produced `{ a: 1, b: undefined }`, because `toEqual` treats `undefined` properties as missing. The `not.toHaveProperty` assertion is the bit-tight check.
- The third test calls the function and then asserts on the **untouched** input. If a future change makes the function mutate, this test catches it.

### Reflection answers (sample)

1. **AAA most clearly:** the first `isExpired` test, with explicit `// Arrange`, `// Act`, `// Assert` comments. The other tests follow the structure but compress the labels because the readers (us) know the pattern.
2. **Refactor-survivable vs. brittle:** the behavior tests (every test here) all survive an internal implementation rewrite. None of them assert on intermediate variables or which-function-was-called.
3. **Non-mutation tests elsewhere:** any pure functional helper benefits — `deepClone`, `sortBy`, `merge`. Anywhere the contract says "returns a fresh object, does not mutate," a non-mutation test pins the contract.

---

## Exercise 2 — Solutions

```tsx
describe('Counter', () => {
  it('renders the initial count of zero', () => {
    render(<Counter />)
    expect(screen.getByRole('status')).toHaveTextContent(/count: 0/i)
  })

  it('renders the initial count from the `initial` prop', () => {
    render(<Counter initial={42} />)
    expect(screen.getByRole('status')).toHaveTextContent(/count: 42/i)
  })

  it('increments the count when the Increment button is clicked', async () => {
    const user = userEvent.setup()
    render(<Counter initial={5} />)

    await user.click(screen.getByRole('button', { name: /^increment$/i }))

    expect(screen.getByRole('status')).toHaveTextContent(/count: 6/i)
  })

  it('decrements the count when the Decrement button is clicked', async () => {
    const user = userEvent.setup()
    render(<Counter initial={5} />)

    await user.click(screen.getByRole('button', { name: /^decrement$/i }))

    expect(screen.getByRole('status')).toHaveTextContent(/count: 4/i)
  })

  it('resets to the initial value when Reset is clicked after some changes', async () => {
    const user = userEvent.setup()
    render(<Counter initial={10} />)

    await user.click(screen.getByRole('button', { name: /^increment$/i }))
    await user.click(screen.getByRole('button', { name: /^increment$/i }))
    await user.click(screen.getByRole('button', { name: /^reset$/i }))

    expect(screen.getByRole('status')).toHaveTextContent(/count: 10/i)
  })

  it('hides the step-size input by default', () => {
    render(<Counter />)
    expect(screen.queryByLabelText(/step size/i)).not.toBeInTheDocument()
  })

  it('reveals the step-size input when advanced mode is enabled', async () => {
    const user = userEvent.setup()
    render(<Counter />)

    await user.click(
      screen.getByRole('button', { name: /show advanced mode/i }),
    )

    expect(screen.getByLabelText(/step size/i)).toBeInTheDocument()
  })

  it('increments by the current step size when advanced mode is enabled', async () => {
    const user = userEvent.setup()
    render(<Counter initial={0} />)

    await user.click(
      screen.getByRole('button', { name: /show advanced mode/i }),
    )
    const stepInput = screen.getByLabelText(/step size/i)
    await user.clear(stepInput)
    await user.type(stepInput, '5')

    await user.click(screen.getByRole('button', { name: /^increment$/i }))

    expect(screen.getByRole('status')).toHaveTextContent(/count: 5/i)
  })

  it('uses an aria-live region to announce count changes', () => {
    render(<Counter />)
    const status = screen.getByRole('status')
    expect(status).toHaveAttribute('aria-live', 'polite')
  })
})
```

**Editorial notes:**

- The Increment / Decrement buttons are matched with `^increment$` / `^decrement$` regex anchors. Without anchors, `/increment/i` would match both "Increment" and "Show advanced mode" (which contains the substring "ce" — actually no, but in real apps with multiple buttons containing the same word, the anchored match is the careful choice).
- The advanced-mode button text changes between "Show advanced mode" and "Hide advanced mode." The test queries the show form because that is the initial state. A follow-up test could click the button twice and assert the visible text flips back.
- The step-size test in step 7 has many Arrange steps. The lecture's AAA discussion allows this — multiple setup steps preceding one action and one assertion is still AAA. The temptation to split into multiple tests would dilute "one action under test."

### Reflection answers (sample)

1. **Mock temptations:** none in this exercise — the component is self-contained. In a real codebase the temptation would be the router, child components, the auth context. The lecture's answer: render them for real.
2. **Splittable test:** "increments by step 5" could split into "step size input updates the step" and "increment uses the current step." The combined version is more efficient and reads as one story; the split version is more granular but tests the same machinery twice. Either is defensible.
3. **Rename "Increment" to "Add":** every test that queries `/increment/i` fails. The failure is appropriate — "Add" is a user-facing change and the suite correctly catches it. The test names should also be updated to match.

---

## Exercise 3 — Solutions

### The third test (navigation links)

```ts
test('navigation links are reachable by role', async ({ page }) => {
  // Arrange
  await page.goto('/')

  // Assert
  const primaryNav = page.getByRole('navigation', { name: 'primary' })
  await expect(primaryNav.getByRole('link')).toHaveCount(2)
  await expect(primaryNav.getByRole('link', { name: 'Home' })).toBeVisible()
  await expect(primaryNav.getByRole('link', { name: 'About' })).toBeVisible()
})
```

**Editorial notes:**

- The `getByRole('navigation', { name: 'primary' })` scopes all subsequent queries to inside that nav. If there are multiple navs (a header nav and a footer nav), this is the correct way to disambiguate.
- The `toHaveCount(2)` assertion pins the count. If a future change adds a third link, this test fails — which is correct, because adding a link to the primary nav is a user-facing change worth a deliberate review.
- All three assertions are AAA's Assert section. The Act is empty (just navigation); the Arrange is the `page.goto`. This is a legitimate "smoke test" shape — no user action, just verify the page renders as expected.

### Reflection answers (sample)

1. **One logical assertion or two?** Two logical assertions about the same artifact (the home page renders correctly). Both are tightly related — the page title and the heading are both ways of identifying "this is the home page." Combining them is fine. Splitting them is also fine; pick a house style.
2. **Future career trace scenario:** a Tuesday 3 AM page from the CI bot — a Playwright test that has been green for six months fails on a release branch. Locally everything works. Without the trace, you spend 30 minutes re-running the test in different configurations. With the trace, you open it, see that the page rendered with a 502 from a backend service that intermittently fails on Tuesday at 3 AM during the cache warmup window, file a ticket against the backend team, and go back to bed.
3. **Codegen cleanup:** codegen often produces locators like `page.locator('div').filter({ hasText: 'Sign in' }).nth(2).getByRole('button')`. Replace with `page.getByRole('button', { name: /sign in/i })`. The cleaned-up version reads like behavior; the codegen output reads like markup-archaeology.

---

## A note on tests you "should not need"

Each of these exercises asks you to write tests that pin behaviors most engineers consider obvious. "Of course `isExpired` returns true for an expired token." "Of course the increment button increments." The reason to write the obvious tests is the same as the reason to write the obvious comment in code: **the obvious thing is what breaks first** when someone makes a "minor" change without thinking through the implications. The boundary test (third `isExpired` test) is the obvious one that earns its keep.

The skill the week is building is the **judgement** of which tests to keep and which to delete. Some obvious tests are dead weight (testing that React renders); some are gold (boundary checks, non-mutation contracts). The way to develop the judgement is to write some of each, deploy them, watch which ones catch real bugs over six months, and prune the rest. The exercises here are the first round of that process.
