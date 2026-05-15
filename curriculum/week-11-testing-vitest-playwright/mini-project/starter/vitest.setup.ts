// vitest.setup.ts
//
// Runs once before each test file. Three responsibilities:
//   1. Register the Testing Library matchers (toBeInTheDocument, etc.).
//   2. Clean up the React Testing Library render container between tests.
//   3. Start / stop the MSW server so component tests can intercept fetch.

import '@testing-library/jest-dom/vitest'
import { afterAll, afterEach, beforeAll } from 'vitest'
import { cleanup } from '@testing-library/react'

// MSW server — used by component tests that fetch.
// Wrapped in a try/catch so unit tests (which run in 'node' environment without
// the mocks folder configured) do not blow up at import time.
let server: { listen: (opts?: unknown) => void; close: () => void; resetHandlers: () => void } | null = null

try {
  // Dynamic-style import so the file path resolution does not fail
  // when running unit tests in a Node environment.
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const mod = await import('./src/mocks/server.js')
  server = mod.server
} catch {
  // If src/mocks/server.js is not present (e.g. the student has not yet
  // written it), the test still runs — just without MSW.
}

beforeAll(() => {
  server?.listen({ onUnhandledRequest: 'error' })
})

afterEach(() => {
  cleanup()
  server?.resetHandlers()
})

afterAll(() => {
  server?.close()
})
