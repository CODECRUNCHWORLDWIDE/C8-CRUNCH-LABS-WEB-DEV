# Mini-Project Grading Rubric

> The rubric is graded on a 100-point scale. A 70 is a passing submission; a 90+ is what we expect from a student who internalized the week. Read the rubric before you start — it tells you what reviewers will look for.

---

## 1. The auth-code-with-PKCE flow (30 points)

The SPA signs the user in via OAuth 2.0 authorization-code-with-PKCE against the local Keycloak instance. We verify by stepping through your submission.

| Sub-criterion | Points |
|---------------|--------|
| Clicking "Sign In" redirects to Keycloak's `/authorize` endpoint with the correct query parameters: `response_type=code`, `client_id=spa-client`, `redirect_uri=http://localhost:5173/callback`, `scope=openid profile email`, `code_challenge=<43-char>`, `code_challenge_method=S256`, `state=<random>`, `nonce=<random>`. | 10 |
| After login, Keycloak redirects to `/callback?code=...&state=...`. The SPA validates the `state` against the one it stashed before the redirect. | 5 |
| The SPA POSTs to `/token` with `grant_type=authorization_code`, `code`, `redirect_uri`, `client_id`, and `code_verifier`. No `client_secret`. | 10 |
| The ID token is validated — `iss`, `aud`, `exp`, `nonce`, signature. The `oidc-client-ts` library does this; your config must pin the algorithms allowlist via the discovery document. | 5 |

---

## 2. Silent renewal (15 points)

The access token has a 5-minute lifetime in the seed realm. Before it expires, the SPA silently obtains a new access token without disrupting the user.

| Sub-criterion | Points |
|---------------|--------|
| `automaticSilentRenew: true` is set in the UserManager config. | 5 |
| The `silent-renew.html` page exists at `/silent-renew.html` and successfully invokes `signinSilentCallback`. | 5 |
| You can show (screenshot or DevTools Network log) a renewal happening ~4 minutes after sign-in, returning a fresh access token. | 5 |

---

## 3. Sign-out (10 points)

Sign-out terminates the IdP session, not just local state. Clicking "Sign In" again after a sign-out must prompt for credentials.

| Sub-criterion | Points |
|---------------|--------|
| Sign-out redirects to Keycloak's `end_session_endpoint` with `id_token_hint` and `post_logout_redirect_uri`. | 5 |
| After redirect-back, the SPA's local state is cleared (no `oidc.*` keys in `sessionStorage`). | 3 |
| The next "Sign In" click requires the user to re-enter credentials at Keycloak. | 2 |

---

## 4. The mock resource server (15 points)

`resource-server.js` accepts the access token, verifies it, and returns the verified claims.

| Sub-criterion | Points |
|---------------|--------|
| The server reads the `Authorization: Bearer <token>` header and rejects missing tokens with 401. | 3 |
| The server verifies the token against Keycloak's JWKS endpoint using `jose`. | 5 |
| The verification pins `algorithms: ['RS256']` (the algorithm-confusion mitigation). | 3 |
| The verification checks `iss` and `aud`. | 2 |
| The server responds with verified claims (not the raw token payload). | 2 |

---

## 5. README in the language of the specs (20 points)

Your top-level `README.md` describes the auth layer using the vocabulary of OAuth 2.0, OIDC, and the IETF security BCP.

| Sub-criterion | Points |
|---------------|--------|
| The README walks the eight HTTP messages of the flow, naming each (authorize, callback, token, userinfo, refresh, end-session, the API call, the silent-renew). | 5 |
| The README cites at least 5 spec sections by number: RFC 6749 §4.1, RFC 7519 §4.1, RFC 7636 §4.2, OIDC Core 1.0 §3.1, RFC 9700 §4.14. | 5 |
| The README cites at least one OWASP cheat sheet URL. | 2 |
| The README discusses token storage: where you put the access token (in memory), where you put the refresh token (sessionStorage, with a note that production would use the BFF pattern from RFC 9700 §6.2). | 5 |
| The README discusses the algorithm-confusion historic vulnerability and how your implementation avoids it. | 3 |

---

## 6. TOTP enrollment (10 points)

The seed realm requires TOTP for the user `alice` on first login. You complete the enrollment and submit a screenshot.

| Sub-criterion | Points |
|---------------|--------|
| Screenshot of the QR-code page. | 3 |
| Screenshot of the post-enrollment login (TOTP code prompt). | 3 |
| Screenshot of the profile route after successful 2-factor login. | 2 |
| README mentions RFC 6238 by number when describing what TOTP is. | 2 |

---

## Score interpretation

| Score | Meaning |
|-------|---------|
| 90+   | Excellent. You understand the flow, the trade-offs, and the specs. Ready for production engineering with code review. |
| 80–89 | Strong. Minor gaps in either the implementation or the documentation. |
| 70–79 | Passing. The flow works but the rationale is thin, or the rationale is good but the implementation has a rough edge. |
| 60–69 | Borderline. Re-do the parts that did not work and re-submit. |
| Under 60 | Re-watch the lectures and re-do at least one exercise from scratch before re-submitting. |

---

## Bonus credit (up to +10 points)

- **Implement Homework Problem 6** (role-based admin route) and demonstrate it.
- **Implement Challenge 1** (refresh-rotation demo) and include the report.
- **Implement Challenge 2** (JWKS cache) and use it in the resource server instead of the bare `jose` helper.
- **Implement the BFF pattern** — a small backend that owns the refresh token in an httpOnly cookie. This is non-trivial but well-documented in RFC 9700 §6.2 and is the production answer to token storage.
- **Replace `oidc-client-ts` with hand-written code.** About 200 lines covers the whole flow — verifier/challenge generation, redirect, callback parsing, token exchange, silent renew via fetch (no iframe), logout. The exercise of replacing the library teaches more than using it.

Submit bonus work as additional sections in the top-level README, with citations.

---

## Common ways to lose points

1. **Hard-coding the discovery-document URLs.** The library should fetch them. If your code has the `/protocol/openid-connect/auth` path written in, you have likely bypassed the library.
2. **Storing tokens in `localStorage` without comment.** This is acceptable for a learning context but you must note in the README that production should prefer in-memory + httpOnly cookie via a BFF.
3. **Skipping `state` or `nonce` validation.** The library does these by default but if you misconfigure or override them, you have weakened the protocol.
4. **A README that summarizes the lectures instead of describing your code.** The lectures already exist. The README should explain what YOUR auth layer does, in the lectures' vocabulary, with citations to the specs.
5. **Screenshots that show secrets.** Do not include screenshots of admin passwords, client secrets (the seed realm has none, but custom realms might), or `localStorage` contents that include full tokens. Truncate tokens in screenshots.

---

## Where to ask for help

- The exercises (1, 2, 3) and their solutions cover everything you need.
- Lecture 2 §4 walks every HTTP message of the flow.
- Lecture 3 §3 explains rotation; Lecture 3 §5 explains the two-phase logout.
- The Keycloak admin console (`http://localhost:8080/admin/`) is where you read the configuration directly — when in doubt, click around.
- The `oidc-client-ts` library is good source to read when the docs are unclear: `node_modules/oidc-client-ts/dist/esm/`.
