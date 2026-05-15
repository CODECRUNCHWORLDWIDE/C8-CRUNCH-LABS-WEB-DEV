# Challenge 1 — Demonstrate Refresh-Token Reuse Detection

> Build a small harness that exercises Keycloak's refresh-token rotation and reuse-detection behavior end to end. The deliverable is a script that produces a reproducible log: it acquires tokens via the auth-code flow with PKCE, performs three refreshes, deliberately reuses an old refresh token, observes the IdP's response, and writes the entire transcript to a markdown report. The point of the challenge is to prove — to your future self and to a reviewer — that you understand what RFC 9700 §4.14.2 mandates and that you can read the IdP's signal that the mandate is being enforced.

**Estimated time:** 90 minutes.
**Prerequisite:** Exercises 1 and 2 finished.

---

## The brief

You will build a Node script `refresh-rotation-demo.ts` that does the following, in order:

1. Acquires an initial token set (`access_token`, `id_token`, `refresh_token`) via the authorization-code-with-PKCE flow. Because we need the script to be non-interactive, you may use Keycloak's `direct-access-grants` capability for this **single bootstrap step** — this is a learning-context shortcut, not a production pattern. The realm export at the end of this file enables direct-access grants only for this demo.
2. Refreshes the access token three times, in sequence, logging:
   - The 10-character prefix of each `refresh_token` (so you can prove they are different strings without leaking the full values).
   - The expiration time of each access token (Unix timestamp + ISO).
   - The `exp` claim of each refresh token (decode the JWT).
3. **After the third refresh**, attempts to re-use the **first** refresh token (the one originally issued in step 1). Capture the error response.
4. **Then** attempts to use the **most recent** refresh token. Depending on the realm's reuse-detection policy, this will either succeed (Keycloak's default: revoke only the offending token) or fail with `invalid_grant: Session not active` (stricter realms revoke the entire family).
5. Writes a markdown report to `report.md` summarizing the entire transcript.

The grading is on the report. A perfect run with no report is worth less than a partial run with a clear report.

---

## Hints

- The token endpoint is `${authority}/protocol/openid-connect/token`. Use `application/x-www-form-urlencoded`. Library or `fetch` is your choice.
- `jose`'s `decodeJwt` (note: decode, not verify) is convenient for reading the `exp` claim from refresh tokens without re-doing signature verification. The refresh token's signature does not need verification by the client — only the IdP verifies it on the way in.
- The Keycloak error responses come back as JSON with `error` and `error_description` fields. Log both.
- Set the realm's access-token lifetime to 60 seconds for the demo, so you do not have to wait minutes between refreshes.

---

## Stretch — demonstrate cascade revocation

After the reuse-detection trip, attempt **another** authorization-code flow (a fresh login) and observe whether the user must re-enter credentials or whether Keycloak's session cookie still grants silent sign-in.

The expected behavior, per Keycloak's docs, is:

- "Refresh Token Max Reuse: 0" + "Revoke Refresh Token: ON" → the offending refresh token is invalidated; the user's session may continue depending on whether the IdP-level session was also revoked.

Document what you observe.

---

## What "done" looks like

Your `report.md` contains, in order:

```markdown
# Refresh-Token Rotation Demo Report

## Setup

- Keycloak: <version, e.g. 25.0.0>
- Realm: crunch
- Client: spa-client
- Access-token lifespan: 60 s
- Refresh-token max reuse: 0
- Revoke refresh token: on

## Step 1 — Bootstrap

- access_token (prefix): eyJhbGciO...
- id_token (prefix): eyJhbGciO...
- refresh_token (prefix): eyJhbGciO...
- refresh_token exp claim: 2026-05-14T11:34:21Z (in 30 minutes)

## Step 2 — Three refreshes

| Refresh # | Old prefix | New prefix | access_token exp | rotated? |
|-----------|------------|------------|------------------|----------|
| 1         | eyJhbGciO  | eyJhcGCiE  | 2026-05-14T11:05:21Z | yes |
| 2         | eyJhcGCiE  | eyJhcGCiX  | 2026-05-14T11:06:21Z | yes |
| 3         | eyJhcGCiX  | eyJhcGCiY  | 2026-05-14T11:07:21Z | yes |

## Step 3 — Reuse the original refresh token

Request:

  POST /token grant_type=refresh_token refresh_token=<first-refresh-token>

Response (HTTP 400):

  { "error": "invalid_grant", "error_description": "Stale token" }

## Step 4 — Use the most recent refresh token after the reuse trip

Request:

  POST /token grant_type=refresh_token refresh_token=<latest-refresh-token>

Response: [SUCCESS / FAIL — whichever you observed]

## Interpretation

[2-3 paragraphs explaining what you observed, why RFC 9700 §4.14.2 mandates
this behavior, and what you would change in production. Cite RFC 9700 by
section number. Cite the Keycloak admin guide for the configuration knobs.]
```

The interpretation paragraphs are the most important part of the report. A reviewer reads them to confirm you understand what you measured.

---

## Grading rubric

| Aspect | Weight |
|--------|--------|
| Script runs and produces output | 20% |
| All four steps executed and logged | 30% |
| Report follows the structure above | 20% |
| Interpretation cites RFC 9700 §4.14 by section | 15% |
| Interpretation distinguishes "token-level revocation" from "family-level revocation" | 15% |

A passing submission is the script plus a complete report. A high-passing submission also discusses the BFF pattern (RFC 9700 §6.2) as the production answer to the storage problem and explains why the demo's client-side refresh-token storage is acceptable for a learning context but not for production.

---

## References

- RFC 9700 §4.14 — Refresh Token Protection. <https://www.rfc-editor.org/rfc/rfc9700.html#section-4.14>
- RFC 6749 §6 — Refreshing an Access Token. <https://datatracker.ietf.org/doc/html/rfc6749#section-6>
- Keycloak Server Administration Guide — Refresh tokens. <https://www.keycloak.org/docs/latest/server_admin/#refresh-tokens>
- Auth0 — Refresh Token Rotation reference. <https://auth0.com/docs/secure/tokens/refresh-tokens/refresh-token-rotation>
- OAuth 2.0 Security BCP — Section 4.14.2 on automatic reuse detection. <https://www.rfc-editor.org/rfc/rfc9700.html#name-refresh-token-replay-detect>
