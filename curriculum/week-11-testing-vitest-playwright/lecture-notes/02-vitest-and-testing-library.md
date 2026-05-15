# Lecture 2 — Vitest and Testing Library

> *Lecture 1 gave the philosophy. This lecture turns it into running code. Vitest is the test runner; Testing Library is the API for querying the rendered DOM the way the user does; `user-event` is the API for simulating real user interaction; `@testing-library/jest-dom` is the matcher library that gives you `toBeInTheDocument` and friends. By the end you should be able to install the stack, configure `vitest.config.ts`, write a first unit test, write a first component test, navigate the priority list of queries, and recognize the four or five anti-patterns that the rest of this lecture is dedicated to preventing.*

The frontend test-runner landscape converged hard between 2020 and 2026. Jest, which dominated the React ecosystem from 2017 to 2022, lost ground to **Vitest** for any project built on Vite — Vitest reuses the Vite transform pipeline, runs ESM and TypeScript without a separate Babel config, starts the watcher in milliseconds, and has an `--ui` mode that nobody who has used it goes back from. The Vitest API is intentionally Jest-compatible — `describe`, `it`/`test`, `expect`, `vi.fn`, `vi.mock` — so the migration from a Jest codebase is mostly a find-and-replace of `jest.fn` to `vi.fn` and `jest.mock` to `vi.mock`. If your future job uses Jest, the patterns in this lecture transfer.

The query and render API — `render`, `screen`, `getByRole`, `userEvent` — comes from the **Testing Library** family. Testing Library is a small, framework-agnostic core (`@testing-library/dom`) with adapters for React (`@testing-library/react`), Vue, Svelte, Angular, and others. The React adapter is what we use; the queries are identical across adapters. The library was created by Kent C. Dodds in 2018 as a reaction to Enzyme (the previous-generation React tester, which encouraged testing implementation details — `wrapper.state()`, `wrapper.instance()`, `wrapper.find('SomeComponent')`). Testing Library exposes none of that, on purpose. You query the rendered DOM, you assert on the rendered DOM, and that is the API surface. The narrow API is the point.

---

## 1. Install and configure

Start in the same project where the Week 10 SPA lives — Vite + React + JavaScript or TypeScript.

```bash
npm install -D vitest @vitest/ui jsdom
npm install -D @testing-library/react @testing-library/user-event @testing-library/jest-dom
npm install -D @vitest/coverage-v8
```

Six dev dependencies. The first three are the runner; the next three are the API; the last is the coverage provider.

Create `vitest.config.ts` at the project root:

```ts
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'node:url'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
    css: false,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'json-summary'],
      include: ['src/**/*.{ts,tsx,js,jsx}'],
      exclude: [
        'src/**/*.d.ts',
        'src/**/*.test.{ts,tsx}',
        'src/main.tsx',
        'src/vite-env.d.ts',
      ],
      thresholds: {
        statements: 70,
        branches: 60,
        functions: 70,
        lines: 70,
      },
    },
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
```

Six configuration options that matter:

- **`environment: 'jsdom'`** — JSDOM is a Node-side implementation of the DOM. Your React components render into it as if they were in a browser, but the test runs in Node. The trade-off vs. running in a real browser is speed (JSDOM is 10x faster) vs. fidelity (JSDOM does not implement every DOM feature; layout, getBoundingClientRect, and some media queries do not work). For 95% of component tests JSDOM is correct.
- **`globals: true`** — exposes `describe`, `it`, `expect`, `vi`, `beforeEach`, `afterEach` as globals so you do not have to import them in every file. Jest does the same by default; Vitest defaults to off and the override is explicit. Both styles are valid; the global style reads as Jest, the imported style is slightly more explicit.
- **`setupFiles`** — runs `vitest.setup.ts` before each test file. This is where you set up `@testing-library/jest-dom`, configure MSW, and run any global setup.
- **`css: false`** — Vitest can transform CSS for JSDOM, but for unit and component tests CSS rules do not run (JSDOM does not implement the cascade), so the transform is wasted work. Turning it off saves 100–300 ms on the first run.
- **`coverage.thresholds`** — fail the build if statement coverage drops below 70%, branch coverage below 60%, etc. These are conservative starting numbers. The position from Lecture 1 holds: thresholds are a hint, not a goal.
- **`alias['@']`** — same as your Vite alias. Use the same alias scheme in tests and in production code; do not let imports diverge.

Create `vitest.setup.ts`:

```ts
import '@testing-library/jest-dom/vitest'
import { afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'

// React Testing Library renders into a global container; clean it between tests.
afterEach(() => {
  cleanup()
})
```

The `@testing-library/jest-dom/vitest` import extends Vitest's `expect` with the DOM-aware matchers — `toBeInTheDocument`, `toBeVisible`, `toHaveTextContent`, `toHaveAttribute`, `toBeDisabled`, `toHaveValue`, `toBeChecked`, and a dozen more. The full list is at <https://github.com/testing-library/jest-dom>.

Add to `package.json`:

```json
{
  "scripts": {
    "test": "vitest",
    "test:run": "vitest run",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest run --coverage"
  }
}
```

Four scripts:

- `npm test` — watch mode. The default during active development.
- `npm run test:run` — single run, exit. The CI command.
- `npm run test:ui` — open the Vitest browser dashboard at `http://localhost:51204/__vitest__/`. The visual diff viewer and the test-tree filter live here.
- `npm run test:coverage` — single run with coverage report. Writes HTML to `coverage/`; open `coverage/index.html` in the browser.

That is the install. Twelve lines of dependencies, twenty lines of config, four npm scripts. From here, every test goes in a `.test.ts` or `.test.tsx` file next to the code it tests.

---

## 2. The first unit test

Take a pure helper from the Week 10 codebase — the JWT-expiry math:

```ts
// src/lib/tokens.ts
export function isExpired(token: { exp: number }, now = Date.now()): boolean {
  // `exp` is in seconds since epoch; Date.now() is in milliseconds.
  return token.exp * 1000 < now
}
```

The unit test:

```ts
// src/lib/tokens.test.ts
import { describe, it, expect } from 'vitest'
import { isExpired } from './tokens'

describe('isExpired', () => {
  it('returns true when exp is in the past', () => {
    // Arrange
    const token = { exp: 1_000_000_000 } // 2001-09-09, well in the past
    const now = Date.now() // current real time

    // Act
    const result = isExpired(token, now)

    // Assert
    expect(result).toBe(true)
  })

  it('returns false when exp is in the future', () => {
    const tenMinutesFromNow = Math.floor(Date.now() / 1000) + 600
    expect(isExpired({ exp: tenMinutesFromNow })).toBe(false)
  })

  it('returns false at exactly exp (uses strict less-than)', () => {
    const exp = 2_000_000_000
    expect(isExpired({ exp }, exp * 1000)).toBe(false)
  })
})
```

Three tests. Three AAA blocks. Three assertions, each tight on one fact. The test file lives next to `tokens.ts`; Vitest will pick it up automatically. Run `npm test` and you should see green in under 100 ms.

Three small things to notice:

1. **The `describe` block** is a label for the test report. It groups related tests; nest it only when you have a clear reason to.
2. **The first test uses explicit AAA comments**; the second and third compress because the structure is now obvious. Either is fine. Be consistent inside a file.
3. **The third test pins the boundary.** "Returns false at exactly `exp`" is the kind of off-by-one test that pays for itself the first time someone changes `<` to `<=` and breaks token-refresh logic.

---

## 3. The first component test

Take a small component:

```tsx
// src/components/Counter.tsx
import { useState } from 'react'

export function Counter({ initial = 0 }: { initial?: number }) {
  const [count, setCount] = useState(initial)
  return (
    <div>
      <p>Count: {count}</p>
      <button type="button" onClick={() => setCount(c => c + 1)}>
        Increment
      </button>
      <button type="button" onClick={() => setCount(c => c - 1)}>
        Decrement
      </button>
    </div>
  )
}
```

The component test:

```tsx
// src/components/Counter.test.tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Counter } from './Counter'

describe('Counter', () => {
  it('renders the initial count', () => {
    // Arrange
    render(<Counter initial={5} />)

    // Act — none

    // Assert
    expect(screen.getByText('Count: 5')).toBeInTheDocument()
  })

  it('increments when the Increment button is clicked', async () => {
    // Arrange
    const user = userEvent.setup()
    render(<Counter />)

    // Act
    await user.click(screen.getByRole('button', { name: /increment/i }))

    // Assert
    expect(screen.getByText('Count: 1')).toBeInTheDocument()
  })

  it('decrements when the Decrement button is clicked', async () => {
    const user = userEvent.setup()
    render(<Counter initial={5} />)

    await user.click(screen.getByRole('button', { name: /decrement/i }))

    expect(screen.getByText('Count: 4')).toBeInTheDocument()
  })

  it('does not share state between instances', async () => {
    const user = userEvent.setup()
    render(
      <div>
        <Counter />
        <Counter initial={10} />
      </div>,
    )

    const [firstIncrement] = screen.getAllByRole('button', { name: /increment/i })
    await user.click(firstIncrement)

    expect(screen.getByText('Count: 1')).toBeInTheDocument()
    expect(screen.getByText('Count: 10')).toBeInTheDocument()
  })
})
```

Four tests. Each follows AAA. Each performs **one** user action. Each asserts on **one** user-visible fact. The fourth test exercises a subtle property — component instances do not share state — which is exactly the kind of thing a unit test cannot catch and a component test can.

Three more things to notice:

1. **`render(<Counter />)`** mounts the component into a JSDOM container. Testing Library handles cleanup via the `cleanup()` we configured in `vitest.setup.ts`.
2. **`screen.getByRole('button', { name: /increment/i })`** queries the accessible tree. The element matches because `<button>` has the implicit role `button` and its accessible name (the text content) matches the case-insensitive regex `/increment/i`. The same query is what a screen reader would use to navigate.
3. **`userEvent.setup()`** returns a `user` object scoped to this test. The setup-once pattern is the modern recommendation; it cleans up after itself and is preferred over the global `userEvent.click(...)` style.

Run `npm test` and the four tests should pass in under 500 ms total. That is the speed budget for component tests — milliseconds, not seconds.

---

## 4. The Testing Library priority list

The most important table in this lecture. From <https://testing-library.com/docs/queries/about/#priority>:

| Priority | Query | When to use |
|----------|-------|-------------|
| 1 | `getByRole` | Any interactive element with a role. The first query you reach for. |
| 2 | `getByLabelText` | Form fields. The text in the associated `<label>`. |
| 3 | `getByPlaceholderText` | Form fields without an associated label (you should add one; this is fallback). |
| 4 | `getByText` | Non-interactive elements. Headings, paragraphs, divs. |
| 5 | `getByDisplayValue` | A form field with a specific current value. |
| 6 | `getByAltText` | Images. |
| 7 | `getByTitle` | Elements with a `title` attribute (rare; usually a sign the markup is weak). |
| 8 | `getByTestId` | Last resort. Adds a `data-testid` attribute the user does not see. |

The lecture's position, restated: **`getByTestId` is a code smell.** Every time you reach for it, the test could probably use a better query, and the markup probably has an accessibility gap. The Testing Library team did not put `getByTestId` last on the list by accident; they put it last because it bypasses the entire accessibility story.

### What "accessible name" means

`getByRole('button', { name: 'Sign in' })` matches a `<button>` whose **accessible name** is "Sign in". The accessible name is computed by the [WAI-ARIA accessible name algorithm](https://www.w3.org/TR/accname-1.1/), which roughly works like:

1. `aria-labelledby` — if set, the accessible name is the text of the referenced element.
2. `aria-label` — if set, the accessible name is the attribute value.
3. The element's text content — for `<button>`, `<a>`, `<h1>`–`<h6>`, this is usually the visible text.
4. Other element-specific rules — `alt` for `<img>`, the associated `<label>` for `<input>`.

If none of these produce a name, the element has **no accessible name** — a screen reader announces it as "button" with no further context, and `getByRole` cannot find it by name. **This is the accessibility bug your test will surface.** A button with no accessible name is a button no blind user can identify. Adding a `name` parameter to `getByRole` and watching the query fail catches the bug.

### The `findBy` / `queryBy` / `getBy` distinction

Each query has three variants:

- **`getBy*`** — throws an error if zero matches, throws if more than one match, returns the element. Synchronous. Use when the element should already be in the DOM.
- **`queryBy*`** — returns `null` if zero matches, throws if more than one match, returns the element if one. Synchronous. Use to assert that an element is **not** present (you cannot use `getBy*` for that — it throws).
- **`findBy*`** — async; retries the query until it finds the element or until a timeout (default 1 second). Use when waiting for the DOM to update — after a network response, after a `setTimeout`, after a state transition.

A typical mistake:

```ts
// ❌ wrong — the data has not arrived yet, getBy throws
render(<UserProfile id="42" />)
expect(screen.getByText('Ada Lovelace')).toBeInTheDocument()

// ✓ right — wait for the network round-trip
render(<UserProfile id="42" />)
expect(await screen.findByText('Ada Lovelace')).toBeInTheDocument()
```

The `findBy` variant is your async friend. Reach for it whenever the assertion depends on something that happens after the initial render.

### The `screen` vs. destructured-return debate

Both of these work:

```ts
const { getByRole } = render(<Counter />)
expect(getByRole('button', { name: /increment/i })).toBeInTheDocument()
```

```ts
render(<Counter />)
expect(screen.getByRole('button', { name: /increment/i })).toBeInTheDocument()
```

The Testing Library team [recommends](https://testing-library.com/docs/queries/about/#screen) the `screen` style. The reasons: (1) you do not have to keep updating the destructured list as you add queries, (2) `screen` always queries the whole document so there is no confusion about which subtree, (3) it reads slightly more naturally. We use `screen` throughout the week.

The exception is when you have rendered two components into the same document and need to scope a query to one. Use `within(container)`:

```ts
import { within } from '@testing-library/react'

render(
  <div>
    <UserCard data-testid="user-1" name="Ada" />
    <UserCard data-testid="user-2" name="Grace" />
  </div>,
)
const firstCard = screen.getByTestId('user-1')
expect(within(firstCard).getByText('Ada')).toBeInTheDocument()
```

(Yes, this one is a legitimate use of `data-testid` — scoping a query to one of two structurally-identical regions. The principle still holds: prefer not to need it.)

---

## 5. `userEvent` vs. `fireEvent`

Both libraries fire DOM events. The difference is fidelity.

`fireEvent.click(element)` fires a single `click` event. That is it. No `mousedown`, no `mouseup`, no `focus`, no `pointerdown`. The element does not get focus.

`userEvent.click(element)` fires the full sequence a real browser fires when a user clicks: `pointerdown`, `mousedown`, `focus` (if focusable), `pointerup`, `mouseup`, `click`. The element gets focus if it should. If the element is `disabled`, no event is fired (matching browser behavior).

**Always prefer `userEvent`.** The fidelity difference catches real bugs — keyboard-handler tests, focus-management tests, and any test of a component that depends on `:focus` or `:active` styling will pass with `fireEvent` and fail with `userEvent` for the wrong reasons.

The main `userEvent` APIs:

```ts
const user = userEvent.setup()

await user.click(element)
await user.dblClick(element)
await user.hover(element)
await user.unhover(element)
await user.tab() // press Tab, move focus
await user.tab({ shift: true }) // Shift+Tab
await user.keyboard('{Enter}')
await user.keyboard('Hello{Backspace}!')
await user.type(input, 'hello@example.com')
await user.clear(input)
await user.selectOptions(select, 'orange')
await user.upload(input, new File(['content'], 'file.txt'))
```

Every call returns a Promise. Always `await`. Forgetting the `await` is the single most common mistake — the test passes locally because the events have time to flush before the assertion, then flakes on CI when the timing is tighter.

---

## 6. What NOT to mock

This is where bad tutorials go wrong. The temptation, especially for engineers coming from a server-side mocking culture, is to mock everything that is not the unit under test. **Resist it.** The Testing Library philosophy and the Vitest team's recommendation align: mock only at the boundary, render the real component tree.

### Do not mock React

```ts
// ❌ never
vi.spyOn(React, 'useState')
```

There is no scenario where this assertion provides value. The implementation can be `useState`, `useReducer`, a third-party state library, or hand-rolled — and the user-visible behavior is what matters. The test that asserts on `useState` calls is a future refactor's enemy.

### Do not mock React Router

```ts
// ❌ never
vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}))
```

React Router is a library you depend on. Mocking it means your test does not exercise the integration between your component and the router. Instead, wrap the component in a real router for the test:

```tsx
// ✓ render in a real router
import { MemoryRouter, Routes, Route } from 'react-router-dom'

function renderWithRouter(ui: React.ReactElement, { initialPath = '/' } = {}) {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route path="/" element={ui} />
        <Route path="/profile" element={<div>Profile page</div>} />
      </Routes>
    </MemoryRouter>,
  )
}
```

The component navigates for real; the test asserts on the new page's content.

### Do not mock child components

```ts
// ❌ never
vi.mock('./Header', () => ({ Header: () => <div>mocked header</div> }))
```

Render the real child. If the child is expensive (a heavy chart, an iframe), reach for the boundary — extract the expensive part into a separately-tested unit. Mocking the child decouples the test from the integration the component actually depends on.

### Do not mock fetch with `vi.fn`

Tempting:

```ts
// ❌ fragile, brittle, leaks across tests
global.fetch = vi.fn().mockResolvedValue({
  ok: true,
  json: () => Promise.resolve({ name: 'Ada' }),
})
```

This works until the component starts using a different `fetch` shape (a different status code, a 404, a header check), at which point you are re-implementing the entire `fetch` API in `vi.fn`. **Use MSW instead** — it intercepts `fetch` at the network layer, returns a real Response object, and your component never knows the difference.

### What to mock

| Mock it | Why |
|---------|-----|
| **The network** (`fetch`, XHR) | The component does not control the network; faking it is at the boundary. |
| **Time** (`Date.now`, `setTimeout`) | Use `vi.useFakeTimers()` for deterministic time-based tests. |
| **Randomness** (`Math.random`, `crypto.randomUUID`) | Deterministic seeded inputs make assertions stable. |
| **Browser APIs JSDOM does not implement** | `IntersectionObserver`, `matchMedia`, `ResizeObserver` — stub them or polyfill. |
| **External SDKs you do not own** | Stripe, the OIDC library — at the boundary, not inside. |

And that is the list. Five categories. Everything else, render for real.

---

## 7. MSW — Mock Service Worker

[MSW](https://mswjs.io/) is the recommended way to mock the network in 2026. Install:

```bash
npm install -D msw
```

Define handlers in `src/mocks/handlers.ts`:

```ts
import { http, HttpResponse } from 'msw'

export const handlers = [
  http.get('http://localhost:8080/api/profile', () => {
    return HttpResponse.json({
      sub: 'user-123',
      name: 'Ada Lovelace',
      email: 'ada@example.com',
    })
  }),

  http.post('http://localhost:8080/api/messages', async ({ request }) => {
    const body = (await request.json()) as { text: string }
    if (!body.text) {
      return HttpResponse.json({ error: 'text required' }, { status: 400 })
    }
    return HttpResponse.json({ id: 'msg-1', text: body.text }, { status: 201 })
  }),
]
```

Wire MSW into Vitest in `src/mocks/server.ts`:

```ts
import { setupServer } from 'msw/node'
import { handlers } from './handlers'

export const server = setupServer(...handlers)
```

Add to `vitest.setup.ts`:

```ts
import { afterAll, afterEach, beforeAll } from 'vitest'
import { server } from './src/mocks/server'

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
afterEach(() => server.resetHandlers())
afterAll(() => server.close())
```

Three things to notice:

1. **`onUnhandledRequest: 'error'`** — if your component fires a `fetch` to a URL you did not define a handler for, the test fails with an explicit error. This is the catch-untouched-network-calls feature; turn it on.
2. **`server.resetHandlers()`** — between tests, any handlers added with `server.use(...)` (for one-test overrides) are discarded. The base handlers from `handlers.ts` stay in effect.
3. **`server.use(...)` for per-test overrides** — when you want one test to return a 500 from `/api/profile`:

   ```ts
   it('shows an error when the profile request fails', async () => {
     server.use(
       http.get('http://localhost:8080/api/profile', () =>
         HttpResponse.json({ error: 'oops' }, { status: 500 }),
       ),
     )
     render(<ProfilePage />)
     expect(await screen.findByText(/failed to load/i)).toBeInTheDocument()
   })
   ```

The component, the `fetch` call, and the response handling all run as written in production. Only the wire is faked. That is the boundary at which to mock.

---

## 8. Async testing — the common patterns

### Wait for an element to appear

```ts
render(<UserProfile id="42" />)
expect(await screen.findByText('Ada Lovelace')).toBeInTheDocument()
```

### Wait for an element to disappear

```ts
import { waitForElementToBeRemoved } from '@testing-library/react'

render(<UserProfile id="42" />)
await waitForElementToBeRemoved(() => screen.queryByText('Loading...'))
expect(screen.getByText('Ada Lovelace')).toBeInTheDocument()
```

### Custom wait

```ts
import { waitFor } from '@testing-library/react'

render(<DataFetcher />)
await waitFor(() => {
  expect(screen.getByText('Loaded')).toBeInTheDocument()
})
```

`waitFor` retries the callback until it does not throw, with a 1-second default timeout. Use it when you need to wait for **something** to be true rather than for a specific element to appear.

### What NOT to do for waits

```ts
// ❌ never
await new Promise(resolve => setTimeout(resolve, 500))
```

A `setTimeout` wait is the most common cause of flake in a frontend test suite. It is too long when the test is fast (wasted time) and too short when CI is slow (flake). Use `findBy*` or `waitFor` — both retry until the condition is met.

### Fake timers

When the component uses `setTimeout` or `setInterval` and you want to fast-forward:

```ts
import { vi } from 'vitest'

it('debounces the input', async () => {
  vi.useFakeTimers({ shouldAdvanceTime: true })
  // ... render, type ...
  vi.advanceTimersByTime(500)
  // ... assert
  vi.useRealTimers()
})
```

Use `vi.useFakeTimers` sparingly. It makes tests deterministic at the cost of complexity; many tests can be written without touching timers at all.

---

## 9. Snapshot tests — when they help, when they hurt

Vitest supports inline and file-based snapshots:

```ts
expect(renderResult).toMatchInlineSnapshot()
expect(renderResult).toMatchSnapshot()
```

The argument for snapshot tests is "diff catches accidental changes." The argument against is "the diff is too large to read, so engineers rubber-stamp the update and the test is dead weight."

**When snapshot tests help:**

- Small, semantically-meaningful outputs. A rendered Markdown string. A serialized state object. A list of generated route paths. The diff is human-readable.
- Pure-function output where the result has obvious structure.

**When snapshot tests hurt:**

- Whole rendered component trees. The diff is 400 lines. Nobody reads it.
- Generated HTML with class names. A styling change re-snapshots the whole tree, masking real diffs in the noise.
- Anything where the team's pattern is "the test failed; just update the snapshot." That is dead weight.

The rule of thumb: **if you would not write the snapshot output by hand, the snapshot is too big.**

For visual diffs of a rendered component, Playwright's `toHaveScreenshot` (lecture 3) is the right tool. For semantic structure checks, write explicit assertions on the parts that matter.

---

## 10. Custom hooks

Custom hooks are tested with `renderHook` from `@testing-library/react`:

```ts
import { renderHook, act } from '@testing-library/react'
import { useCounter } from './useCounter'

it('increments the count', () => {
  const { result } = renderHook(() => useCounter(0))

  expect(result.current.count).toBe(0)

  act(() => {
    result.current.increment()
  })

  expect(result.current.count).toBe(1)
})
```

Two notes:

1. **`act(() => { ... })`** wraps the state-updating call. React requires that state updates happen inside `act` so the render is flushed before the assertion; missing `act` produces a noisy warning. `userEvent` and Testing Library's `render` handle `act` for you in component tests; for direct `renderHook` calls, you handle it.
2. **The test asserts on `result.current` — the hook's public API, not its internals.** Same philosophy as components: test what the hook exposes, not how it implements it.

---

## 11. Coverage — what it tells you, what it does not

```bash
npm run test:coverage
```

Open `coverage/index.html`. The report colors lines green (executed), red (not executed), yellow (partially executed — a branch). The numbers at the top — statements, branches, functions, lines — are the four coverage metrics V8 emits.

**Coverage tells you:**

- Which lines have been executed at least once by a test. The complement — lines never executed — is genuinely unsafe; nothing has even pretended to check them.
- Which branches have been tested in both directions. A `if (foo)` that has only been tested with `foo=true` has untested behavior.

**Coverage does not tell you:**

- Whether the test actually asserts anything meaningful about the executed code.
- Whether the test would catch a bug.
- Whether the assertions are correct.

The Kent C. Dodds and Martin Fowler position holds: **chase 60–80% coverage, then stop**. The last 20% is usually the error-handling paths that are hardest to write reliable tests for, and the diminishing returns set in steeply. Spend the budget on making the tests you have higher-quality, not on driving the number to 100.

---

## 12. The five anti-patterns you will recognize on day one

This lecture's parting gift. Five patterns you will see in real codebases. Each one looks reasonable on first read. Each one is wrong. Names and brief explanations:

### 1. Asserting on internal state

```ts
// ❌
expect(component.state.count).toBe(1)
```

Tests an implementation detail. The state shape can change without affecting the user.

**Fix:** assert on the rendered DOM.

### 2. `getByTestId` first, accessible queries never

```ts
// ❌
const submit = screen.getByTestId('submit-button')
```

Bypasses the priority list. Hides an accessibility gap (the button has no accessible name).

**Fix:** `screen.getByRole('button', { name: /submit/i })`. If that fails, the markup is the problem.

### 3. `await new Promise(r => setTimeout(r, 500))`

```ts
// ❌
fireEvent.click(button)
await new Promise(r => setTimeout(r, 500))
expect(screen.getByText('Done')).toBeInTheDocument()
```

Flaky: too long when fast, too short when slow.

**Fix:** `findByText` or `waitFor`.

### 4. Mocking everything

```ts
// ❌
vi.mock('./api')
vi.mock('./auth')
vi.mock('./router')
vi.mock('./Header')
```

The "test" no longer exercises the integration; it exercises a Lego model of the integration.

**Fix:** mock only the network with MSW. Render everything else.

### 5. Snapshot tests of whole component trees

```ts
// ❌
expect(container).toMatchSnapshot()
// produces a 400-line snapshot nobody reads
```

The diff is rubber-stamped on every styling change.

**Fix:** assert on the parts that matter. For visual changes, Playwright's `toHaveScreenshot`.

---

## Up next

Lecture 3 climbs to the top of the pyramid — Playwright, end-to-end testing, fixtures, parallel workers, traces, visual regression, and GitHub Actions. The Vitest + Testing Library tier handles components; Playwright handles flows. Same philosophy, different scope, identical priority list.

---

## Quick-reference

- **Install:** `vitest @vitest/ui jsdom @testing-library/react @testing-library/user-event @testing-library/jest-dom @vitest/coverage-v8`.
- **Configure:** `vitest.config.ts` with `environment: 'jsdom'`, `globals: true`, `setupFiles`.
- **Setup file:** import `@testing-library/jest-dom/vitest`, set up MSW, register `cleanup` in `afterEach`.
- **Render:** `render(<Component />)`. Query with `screen.getByRole(...)`. Interact with `userEvent`.
- **Priority list:** `getByRole` > `getByLabelText` > `getByPlaceholderText` > `getByText` > `getByDisplayValue` > `getByAltText` > `getByTitle` > `getByTestId`.
- **Variants:** `getBy*` (throws on miss), `queryBy*` (null on miss), `findBy*` (async, retries).
- **`userEvent`** always over `fireEvent`. Always `await`.
- **Mock the network** with MSW. Do not mock React, the router, or child components.
- **Snapshots** for small meaningful output, not whole component trees.
- **Coverage:** 60–80%, then stop.
