// src/mocks/server.js
//
// MSW server for the Node/Vitest environment.
//
// Imported in vitest.setup.ts; started in beforeAll, reset in afterEach,
// closed in afterAll.

import { setupServer } from 'msw/node'
import { handlers } from './handlers.js'

export const server = setupServer(...handlers)
