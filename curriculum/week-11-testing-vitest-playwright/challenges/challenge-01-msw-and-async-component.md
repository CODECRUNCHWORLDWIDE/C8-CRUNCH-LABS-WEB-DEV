# Challenge 1 — Test an async component with MSW

> *Time budget: 60–90 minutes. Goal: write component tests for a component that fetches data on mount. Cover loading, success, and error states. Use MSW to intercept the network at the boundary; do not stub `fetch` directly. By the end you should be able to test any async component in your real codebase using the same pattern.*

## Background

Most real components in a working SPA are async — they fetch on mount, they fetch on prop change, they fetch in response to user action. Testing them with `vi.fn().mockResolvedValue(...)` stubs of `fetch` works for trivial cases and breaks at the first complication: the component starts using a header you forgot to mock, a status code you did not handle, a JSON shape you did not anticipate. **MSW handles this by mocking at the network layer** — your component sees a real Response object, your code runs unchanged from production, and the only fake is the wire.

This challenge gives you a small async component and asks you to write the three tests every async component needs: loading, success, and error.

## The component

The component you are testing is:

```tsx
// src/components/UserCard.tsx
import { useEffect, useState } from 'react'

type User = { id: string; name: string; email: string }

type Status =
  | { kind: 'loading' }
  | { kind: 'success'; user: User }
  | { kind: 'error'; message: string }

export function UserCard({ userId }: { userId: string }) {
  const [status, setStatus] = useState<Status>({ kind: 'loading' })

  useEffect(() => {
    let cancelled = false
    setStatus({ kind: 'loading' })

    fetch(`/api/users/${userId}`)
      .then(async res => {
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`)
        }
        return (await res.json()) as User
      })
      .then(user => {
        if (!cancelled) setStatus({ kind: 'success', user })
      })
      .catch(err => {
        if (!cancelled) {
          setStatus({ kind: 'error', message: err.message ?? 'unknown error' })
        }
      })

    return () => {
      cancelled = true
    }
  }, [userId])

  if (status.kind === 'loading') {
    return <p role="status">Loading...</p>
  }
  if (status.kind === 'error') {
    return <p role="alert">Failed to load user: {status.message}</p>
  }
  return (
    <article aria-label="user card">
      <h2>{status.user.name}</h2>
      <p>{status.user.email}</p>
    </article>
  )
}
```

Three observable states: loading, success, error. Each renders different markup. The query selectors:

- Loading: `screen.getByRole('status')` with text "Loading...".
- Error: `screen.getByRole('alert')` with text containing "Failed to load user".
- Success: `screen.getByRole('article', { name: /user card/i })` with the name and email inside.

## What you build

A test file `UserCard.test.tsx` with **at least four** tests:

1. **Shows "Loading..." on mount before the fetch resolves.**
2. **Shows the user name and email on a successful response.**
3. **Shows an error alert on a 500 response.**
4. **Shows an error alert on a 404 response with a different message.**

And one stretch test:

5. **Cancels the in-flight request when the component unmounts** (the test asserts no state update happens after unmount — observable indirectly by the absence of a console error from React about state updates on unmounted components).

## Step 1 — install MSW

```bash
npm install -D msw
```

## Step 2 — set up the MSW server

Create `src/mocks/server.ts`:

```ts
import { setupServer } from 'msw/node'
import { http, HttpResponse } from 'msw'

export const handlers = [
  http.get('/api/users/:id', ({ params }) => {
    return HttpResponse.json({
      id: params.id,
      name: 'Ada Lovelace',
      email: 'ada@example.com',
    })
  }),
]

export const server = setupServer(...handlers)
```

In `vitest.setup.ts`:

```ts
import { beforeAll, afterEach, afterAll } from 'vitest'
import { server } from './src/mocks/server'

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
afterEach(() => server.resetHandlers())
afterAll(() => server.close())
```

The base handler returns a successful Ada Lovelace. Per-test, you can override.

## Step 3 — write the loading test

The trick: `getByRole('status')` must run **before** the promise resolves. Since `useEffect` fires synchronously on the first render, the state is already `'loading'` on the first paint. Render and immediately assert:

```tsx
it('shows loading state on mount', () => {
  render(<UserCard userId="u1" />)
  expect(screen.getByRole('status')).toHaveTextContent(/loading/i)
})
```

This is the only test in the file that does not need `async` — the loading state is the initial state, no waiting required.

## Step 4 — write the success test

```tsx
it('shows the user name and email after a successful fetch', async () => {
  render(<UserCard userId="u1" />)

  expect(
    await screen.findByRole('article', { name: /user card/i }),
  ).toBeInTheDocument()
  expect(screen.getByRole('heading', { name: 'Ada Lovelace' })).toBeInTheDocument()
  expect(screen.getByText('ada@example.com')).toBeInTheDocument()
})
```

`findBy*` waits for the article to appear (up to 1 second by default).

## Step 5 — write the error tests

For the 500:

```tsx
it('shows an error alert on a 500 response', async () => {
  server.use(
    http.get('/api/users/:id', () =>
      HttpResponse.json({ message: 'boom' }, { status: 500 }),
    ),
  )

  render(<UserCard userId="u1" />)

  expect(
    await screen.findByRole('alert'),
  ).toHaveTextContent(/failed to load user.*500/i)
})
```

For the 404 — override with a 404, repeat. The two error tests differ only in the status code; you might be tempted to write one parameterized test with `it.each(...)`. That is fine in principle but for two cases, two explicit tests read cleaner.

## Step 6 — write the cancellation test

The component sets `cancelled = true` in the effect cleanup. The test:

```tsx
it('does not update state after unmount', async () => {
  // Make the network slow so we can unmount before it resolves.
  server.use(
    http.get('/api/users/:id', async () => {
      await new Promise(r => setTimeout(r, 100))
      return HttpResponse.json({ id: 'u1', name: 'Ada', email: 'a@b.c' })
    }),
  )

  const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})

  const { unmount } = render(<UserCard userId="u1" />)
  unmount()

  await new Promise(r => setTimeout(r, 200))

  expect(consoleError).not.toHaveBeenCalledWith(
    expect.stringMatching(/state update.*unmounted/i),
  )
  consoleError.mockRestore()
})
```

This is the one test where mocking `console.error` is justified — the test is asserting on the absence of a specific console warning.

## Step 7 — answer these questions

1. The success test asserts on **three** things — the article role, the heading text, the email text. Is this one logical assertion or three?
2. What would happen to your tests if the component started using `axios` instead of `fetch`? Would MSW still intercept?
3. The `onUnhandledRequest: 'error'` setting causes the test to fail if the component fires a request to a URL you did not handle. Why is this a desirable default?

## Grading rubric

| Criterion | Weight |
|-----------|--------|
| All four required tests pass | 40% |
| Tests use `findBy*` for async assertions, not `setTimeout` | 15% |
| MSW handlers are clean — base handler in `server.ts`, per-test overrides via `server.use` | 15% |
| `getByRole` is the first reach — no unnecessary `getByTestId` | 10% |
| AAA structure visible in every test | 10% |
| Reflection answers are thoughtful | 10% |

## Reference

- MSW — Getting started: <https://mswjs.io/docs/getting-started>
- MSW — Best practices: <https://mswjs.io/docs/best-practices/structuring-handlers>
- Testing Library — async methods: <https://testing-library.com/docs/dom-testing-library/api-async/>
- Kent C. Dodds — "Stop mocking fetch": <https://kentcdodds.com/blog/stop-mocking-fetch>
