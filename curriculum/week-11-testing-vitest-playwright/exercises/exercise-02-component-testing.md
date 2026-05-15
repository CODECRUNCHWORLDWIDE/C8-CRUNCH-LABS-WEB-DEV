# Exercise 2 — Component testing with Testing Library

> *Time budget: 2 hours. Goal: render a real React component, query its accessible tree, simulate real user interaction, and assert on what the user sees. By the end you should be able to write a component test that survives a refactor of the implementation as long as the rendered DOM stays the same.*

## Pre-work

You have completed exercise 1.

You should have already read:

- Lecture 2 — all sections.
- The Testing Library priority list: <https://testing-library.com/docs/queries/about/#priority>.
- Kent C. Dodds — ["Common mistakes with React Testing Library"](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library). Skim is fine; the section titles tell you the anti-patterns.

## What you are going to build

A component test file (`exercises/starter-Counter.test.tsx`) that exercises a real `Counter` React component. The component is in `exercises/starter-Counter.tsx`. You will:

1. Render the component into JSDOM.
2. Query it by role.
3. Simulate user clicks and keyboard.
4. Assert on the rendered DOM.
5. Refactor the test priority from `getByText` to `getByRole`, observing how the test reads.

## Step 1 — switch Vitest to JSDOM

In `vitest.config.ts`, change `environment` to `'jsdom'`:

```ts
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
  },
})
```

Install the React tooling:

```bash
npm install -D @testing-library/react @testing-library/user-event @testing-library/jest-dom
npm install -D @vitejs/plugin-react react react-dom
npm install -D @types/react @types/react-dom typescript
```

Add to `vitest.config.ts` the React plugin:

```ts
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
    css: false,
  },
})
```

Create `vitest.setup.ts`:

```ts
import '@testing-library/jest-dom/vitest'
import { afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'

afterEach(() => {
  cleanup()
})
```

Create a minimal `tsconfig.json` if you do not have one:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "jsx": "react-jsx",
    "esModuleInterop": true,
    "strict": true,
    "skipLibCheck": true,
    "types": ["vitest/globals", "@testing-library/jest-dom"]
  },
  "include": ["exercises/**/*", "vitest.config.ts", "vitest.setup.ts"]
}
```

Run `npm test`. The exercise 1 tests should still pass; nothing has changed for them.

## Step 2 — read the starter component

Open `exercises/starter-Counter.tsx`. The component is a controlled counter with three controls — increment, decrement, reset — and an "advanced mode" toggle that reveals a "step size" input. Read the full source before writing any test.

The full feature set:

- Initial count is `0` or whatever `initial` prop is passed.
- Clicking "Increment" adds 1 (or the current step size).
- Clicking "Decrement" subtracts 1 (or the current step size).
- Clicking "Reset" returns the count to `initial`.
- Clicking "Advanced mode" toggles the visibility of a step-size input.
- Typing into the step-size input updates the step.
- The count is announced via an `aria-live` region.

## Step 3 — write the first component test

Open `exercises/starter-Counter.test.tsx`. Write a test:

```tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Counter } from './starter-Counter'

describe('Counter', () => {
  it('renders the initial count of zero', () => {
    // Arrange
    render(<Counter />)

    // Act — none

    // Assert
    expect(screen.getByText('Count: 0')).toBeInTheDocument()
  })
})
```

Run `npm test`. The test should pass.

## Step 4 — refactor `getByText` to `getByRole`

The `getByText('Count: 0')` works, but it ties the test to the **exact** rendered string. If the designer changes the label to "Total: 0", the test breaks even though the behavior is unchanged.

The `Counter` component renders the count inside a `<p>` with an `aria-live="polite"` and `role="status"`. Refactor:

```tsx
expect(screen.getByRole('status')).toHaveTextContent(/count: 0/i)
```

Now the test asserts:

1. There is a live region (the `role="status"` element) — which is what a screen reader reads.
2. Its text contains "count: 0" case-insensitively.

A label change from "Count" to "Total" still breaks this test (the regex no longer matches), which is correct — that **is** a user-visible change. But a wrapper change from `<p>` to `<div role="status">` would break the `getByText` if the `<p>` had been queried by tag (it was not, in this case) but would not break the `getByRole('status')` query. The role-based query is more refactor-resistant.

## Step 5 — write tests for the increment / decrement / reset buttons

Write **three** tests, one per button:

1. **"increments the count when the Increment button is clicked"**
   - Render `<Counter initial={5} />`.
   - Click the Increment button via `userEvent.setup().click(...)`.
   - Assert the count is `6`.
2. **"decrements the count when the Decrement button is clicked"**
3. **"resets to the initial value when Reset is clicked after some changes"**
   - Render `<Counter initial={10} />`.
   - Click Increment twice.
   - Click Reset.
   - Assert the count is `10`.

Each test should query the buttons by role and name:

```tsx
screen.getByRole('button', { name: /increment/i })
```

Use `userEvent.setup()` once per test.

Run `npm test`. Four component tests should pass.

## Step 6 — write tests for the advanced-mode toggle

The advanced-mode toggle shows / hides the step-size input. Two tests:

1. **"hides the step-size input by default"** — render the component, assert the input is **not** in the document (use `queryByLabelText`, which returns null when missing, not `getByLabelText` which throws).
2. **"reveals the step-size input when Advanced mode is enabled"** — render, click the Advanced mode button, assert the input **is** in the document.

```tsx
expect(screen.queryByLabelText(/step size/i)).not.toBeInTheDocument()
```

After clicking the toggle:

```tsx
expect(screen.getByLabelText(/step size/i)).toBeInTheDocument()
```

Note the difference between `queryBy*` (used for absence assertions) and `getBy*` (used when the element should exist).

## Step 7 — write a test that combines the step size with increment

The interesting interaction: with advanced mode enabled and step size set to 5, clicking Increment adds 5, not 1.

Write the test:

1. Render `<Counter initial={0} />`.
2. Click Advanced mode.
3. Clear the step-size input and type `5`.
4. Click Increment.
5. Assert the count is `5`.

This is one **action** (the increment) preceded by setup steps. The AAA Arrange section includes the advanced-mode-and-step-size setup; the Act is the single increment click; the Assert is one fact.

Use `await user.clear(input)` followed by `await user.type(input, '5')`.

Run `npm test`. Seven component tests + exercise 1's ten unit tests should pass.

## Step 8 — write a test that asserts on accessibility

The count is in a `<p role="status" aria-live="polite">`. A screen reader announces changes to this region automatically. Write a test:

- **"the count is in a live region for screen reader announcements"**
- Render the component.
- Find the live region by role.
- Assert it has `aria-live="polite"`.

```tsx
const status = screen.getByRole('status')
expect(status).toHaveAttribute('aria-live', 'polite')
```

Now if a future refactor changes the markup to a `<div>` without `aria-live`, this test fails and surfaces the accessibility regression. The test doubles as an accessibility regression guard.

## Step 9 — break a test deliberately

To check the tests would catch a real bug, change one line of `starter-Counter.tsx`:

```tsx
// Before
<button onClick={() => setCount(c => c + step)}>Increment</button>

// After
<button onClick={() => setCount(c => c - step)}>Increment</button>
```

(The Increment button now decrements — a real bug.)

Run `npm test`. The increment test should fail. Read the message. Revert.

## Step 10 — answer these questions

In a comment at the bottom of `starter-Counter.test.tsx`, answer:

1. The lecture says "do not mock React Router, do not mock children." Is there anywhere in your test where you were tempted to mock something? Why did you not?
2. The "step size 5, then increment" test in step 7 has many lines of Arrange. Could it be split into two tests? Should it?
3. If a designer renamed the "Increment" button to "Add" (one word, capital A), which of your tests would still pass, and which would fail? Are the failures appropriate? Why?

## Submission

Commit:

```bash
git add vitest.config.ts vitest.setup.ts tsconfig.json package.json exercises/starter-Counter.test.tsx
git commit -m "exercise 2: component testing with Testing Library"
```

## What you should be able to do now

- Configure Vitest for component testing with JSDOM and React.
- Render a real component, query it with `screen.getByRole`, interact with `userEvent`.
- Choose between `getBy*`, `queryBy*`, and `findBy*` correctly.
- Write tests that double as accessibility regression guards.
- Read a Testing Library failure message and find the right query.

## Reference

- Testing Library — Guiding Principles: <https://testing-library.com/docs/guiding-principles/>
- Testing Library — Priority list: <https://testing-library.com/docs/queries/about/#priority>
- Kent C. Dodds — "Common mistakes with React Testing Library": <https://kentcdodds.com/blog/common-mistakes-with-react-testing-library>
- React Testing Library docs: <https://testing-library.com/docs/react-testing-library/intro/>
