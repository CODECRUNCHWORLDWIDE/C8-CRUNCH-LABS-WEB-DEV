// src/mocks/handlers.js
//
// MSW request handlers. Each handler intercepts one URL pattern and returns a
// canned Response. Used by both Vitest component tests (via msw/node) and the
// browser dev server (via msw/browser) — though the dev server hookup is
// optional for this mini-project.
//
// Override a single handler per test with `server.use(...)`; see the example
// in tests/component/Profile.test.tsx.

import { http, HttpResponse } from 'msw'

const KEYCLOAK_BASE = 'http://localhost:8080'
const API_BASE = 'http://localhost:8081'

/**
 * The base set of handlers. Each test inherits these unless it overrides one
 * with `server.use(http.get(...))`.
 */
export const handlers = [
  // The discovery document — Keycloak serves the real one in e2e tests, but
  // component tests sometimes need it.
  http.get(
    `${KEYCLOAK_BASE}/realms/crunch/.well-known/openid-configuration`,
    () =>
      HttpResponse.json({
        issuer: `${KEYCLOAK_BASE}/realms/crunch`,
        authorization_endpoint: `${KEYCLOAK_BASE}/realms/crunch/protocol/openid-connect/auth`,
        token_endpoint: `${KEYCLOAK_BASE}/realms/crunch/protocol/openid-connect/token`,
        userinfo_endpoint: `${KEYCLOAK_BASE}/realms/crunch/protocol/openid-connect/userinfo`,
        end_session_endpoint: `${KEYCLOAK_BASE}/realms/crunch/protocol/openid-connect/logout`,
        jwks_uri: `${KEYCLOAK_BASE}/realms/crunch/protocol/openid-connect/certs`,
      }),
  ),

  // The protected profile endpoint.
  http.get(`${API_BASE}/api/profile`, () =>
    HttpResponse.json({
      sub: 'user-1',
      preferred_username: 'learner',
      name: 'Ada Lovelace',
      email: 'ada@example.com',
      email_verified: true,
    }),
  ),

  // A list-of-things endpoint used by the dashboard component.
  http.get(`${API_BASE}/api/things`, () =>
    HttpResponse.json({
      items: [
        { id: 'thing-1', label: 'Apple', count: 3 },
        { id: 'thing-2', label: 'Banana', count: 1 },
        { id: 'thing-3', label: 'Cherry', count: 5 },
      ],
    }),
  ),

  // A POST that creates a "thing." Returns 201 with the created entity.
  http.post(`${API_BASE}/api/things`, async ({ request }) => {
    const body = await request.json()
    if (!body?.label) {
      return HttpResponse.json({ error: 'label required' }, { status: 400 })
    }
    return HttpResponse.json(
      { id: 'thing-new', label: body.label, count: body.count ?? 0 },
      { status: 201 },
    )
  }),
]
