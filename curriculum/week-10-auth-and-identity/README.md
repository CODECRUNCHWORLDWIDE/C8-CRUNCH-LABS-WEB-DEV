# Week 10 — Authentication and Identity

> *Nine weeks in, you can ship a multi-route React SPA that loads fast and stays under the Core Web Vitals thresholds on a throttled connection. The architecture is sound and the page feels instant. This week we add the one capability every real application eventually needs: a way to know who the user is. We move from "the app works for everyone" to "the app works for **this** user, and only the parts they are allowed to see." You will learn the OAuth 2.1 authorization-code flow with PKCE — the IETF's recommended default for SPAs and mobile clients — read OpenID Connect as the identity layer that turns an OAuth access token into a verifiable user identity, dissect a JSON Web Token down to its three base64url segments, weigh the trade-offs between server sessions and stateless JWTs, rotate refresh tokens correctly, and stand up a local Keycloak realm to drive a working React login flow end-to-end. By Sunday you will be able to read an `Authorization: Bearer eyJ...` header and explain every field in the decoded payload, and you will know why **never to put a password, an API key, or a PII field into a JWT claim**.*

Welcome back. Through Week 9 you measured Largest Contentful Paint, Interaction to Next Paint, and Cumulative Layout Shift on a deliberately-slow page, applied the named fixes, and re-measured. The optimized page is fast. **It is also wide open** — there is no concept of a logged-in user, no protected route, no API call that requires proof of identity. That is fine for a portfolio page and unacceptable for anything that holds data on behalf of a person. This week is the missing piece.

Authentication ("who are you?") and authorization ("what are you allowed to do?") have decades of accumulated standards behind them, and the modern web has converged on a small set of recommendations that almost every framework, library, and identity provider follows. The convergence is the good news: you only have to learn the patterns once. The bad news is that the patterns have a vocabulary problem — OAuth, OIDC, PKCE, JWT, JWE, JWS, JWK, JWKS, refresh tokens, ID tokens, access tokens, authorization codes, opaque tokens, the implicit flow, the authorization-code flow, the client-credentials flow, the device-code flow — and most online tutorials use those terms interchangeably with the precision of a horoscope. The first two lectures fix that.

The four ideas that organize the week are:

1. **OAuth 2.1 is the modern default, and it is an authorization protocol — not an authentication protocol.** RFC 6749 (OAuth 2.0) defined four flows; the IETF's [OAuth 2.1 draft](https://datatracker.ietf.org/doc/draft-ietf-oauth-v2-1/) consolidates the field's accumulated security guidance and recommends exactly one flow for browser-based clients and mobile apps: **authorization code with PKCE**. The implicit flow is deprecated. The password grant is deprecated. The "client secret in a SPA" anti-pattern is forbidden. Learn the recommended flow; forget the rest, except to recognize them in legacy code.
2. **OpenID Connect (OIDC) sits on top of OAuth and turns the access-token dance into a way to verify identity.** OAuth alone gives you a token that lets you call an API. OIDC adds an **ID Token** — a signed JWT that the authorization server issues alongside the access token, whose claims describe the authenticated user (`sub`, `email`, `name`, `iat`, `exp`, `aud`, `iss`). When you read "OIDC compliant," translate it as "this provider issues a properly-signed ID token whose claims you can trust after you verify the signature against the JWKS endpoint."
3. **A JSON Web Token is three base64url-encoded segments separated by dots, and the signature is the only thing that makes it trustworthy.** A JWT is not encrypted by default — it is signed. Anyone with the token can read its claims. The protections are: (a) verify the signature against the issuer's public key from the JWKS endpoint, (b) check `exp`, `iat`, `nbf`, `aud`, and `iss` claims match what you expect, (c) never put a secret in a claim, (d) never put PII you would not want logged in a claim, (e) prefer RS256 or ES256 over HS256 for any token that crosses a trust boundary, (f) **never trust the `alg` header alone** — the historic `alg: none` and `alg: HS256` confusion attacks are why your library exposes an `allowedAlgorithms` option.
4. **Refresh tokens are how you avoid forcing the user to log in every five minutes, and rotation is how you limit the damage if one leaks.** Access tokens should be short-lived (5–15 minutes is the modern norm). Refresh tokens are longer-lived (hours to days) and should be **rotated on every use** — the authorization server returns a new refresh token and invalidates the old one, so a stolen refresh token can be used at most once before the legitimate client tries and triggers the breach detection. The pattern is in [OAuth 2.0 Security Best Current Practice (RFC 9700)](https://www.rfc-editor.org/rfc/rfc9700.html), and every modern provider supports it.

By Sunday, the deliverable is a **working React SPA that authenticates against a local Keycloak instance using the authorization-code-with-PKCE flow**, displays the user's ID token claims, calls a protected API with the access token, refreshes the access token using a rotating refresh token, and signs out cleanly. The mini-project's grading rubric is in the `mini-project/starter/rubric.md` file. The starter ships a Keycloak realm export so you do not spend Sunday morning clicking through the admin console.

---

## Learning objectives

By the end of this week, you will be able to:

- **Distinguish** authentication from authorization, and explain why OAuth 2.0 (RFC 6749) is an **authorization** framework and why OpenID Connect (OIDC Core 1.0) is the **authentication** layer built on top of it. Reference: <https://datatracker.ietf.org/doc/html/rfc6749> and <https://openid.net/specs/openid-connect-core-1_0.html>.
- **Read** the OAuth 2.1 draft's recommendation and recognize that **authorization code with PKCE** is the one flow you should reach for in a SPA or mobile app. Cite the draft at <https://datatracker.ietf.org/doc/draft-ietf-oauth-v2-1/>.
- **Walk through** the authorization-code-with-PKCE flow end to end — generate a `code_verifier` (a high-entropy random string, 43–128 characters), derive the `code_challenge` (`BASE64URL(SHA256(verifier))`), redirect the user to the authorization endpoint with `response_type=code` and `code_challenge_method=S256`, exchange the returned `code` plus the original `code_verifier` for tokens at the token endpoint, and validate the ID token. Reference: <https://datatracker.ietf.org/doc/html/rfc7636>.
- **Decode** a JWT by hand using `atob` on the first two segments (header, payload), and explain why you must **never** trust the decoded payload without verifying the signature. Reference: <https://datatracker.ietf.org/doc/html/rfc7519>.
- **Name** the standard JWT claims — `iss` (issuer), `sub` (subject — the user ID), `aud` (audience — your client), `exp` (expiration), `nbf` (not-before), `iat` (issued-at), `jti` (token ID), plus the OIDC additions `nonce`, `auth_time`, `at_hash`, `c_hash`, and the email/profile scope claims (`email`, `email_verified`, `name`, `given_name`, `family_name`, `picture`, `preferred_username`). Reference: <https://www.iana.org/assignments/jwt/jwt.xhtml>.
- **Reject** the anti-patterns that the OWASP Authentication Cheat Sheet calls out by name: passwords in JWT claims, API keys in JWT claims, tokens stored in `localStorage` for high-value sessions (httpOnly cookies are safer for refresh tokens), tokens with no expiration, tokens with `alg: none`, tokens accepted without `aud` validation. Reference: <https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html> and <https://cheatsheetseries.owasp.org/cheatsheets/JSON_Web_Token_for_Java_Cheat_Sheet.html>.
- **Compare** server-side sessions (a session cookie tied to a row in a `sessions` table on the server) with stateless JWTs (no server table, all state in the token), and state the three honest trade-offs: revocation latency, storage cost, and horizontal-scale cost. The lecture takes a position: **for most teams, server sessions are the simpler default; reach for JWTs when you have a distributed system that crosses service boundaries.**
- **Configure** an access-token lifetime of 5–15 minutes, a refresh-token lifetime of hours to days, and **refresh-token rotation** with reuse detection. Reference: <https://www.rfc-editor.org/rfc/rfc9700.html> §4.14.2.
- **Implement** PKCE in a React SPA using a thin library wrapper (we use `oidc-client-ts` in the mini-project) and recognize what each parameter of the authorization request and the token request maps to in the IETF spec.
- **Wire** a second factor (MFA) using TOTP per [RFC 6238](https://www.rfc-editor.org/rfc/rfc6238.html) — the algorithm is "HMAC-SHA1 over the current Unix-time-divided-by-30 window, take the lower 31 bits, mod 1,000,000, zero-pad to 6 digits." Keycloak ships TOTP support out of the box; the lecture walks the spec so you can read what is happening, not just check the box.
- **Survey** the managed identity providers — Auth0, Clerk, Supabase Auth, AWS Cognito, Azure AD B2C, Okta, Google Identity Platform — and recognize that they all implement the same OIDC contract. The week's primary stack is **Keycloak** because it is free, open-source, and runs in a single Docker container; the survey is so you can read a managed-provider's docs without surprise. Reference for Keycloak: <https://www.keycloak.org/docs/latest/server_admin/>.
- **Stand up** a local Keycloak realm with one client (the React SPA) and one user (yourself), import the supplied `realm-export.json`, and verify the OIDC discovery document at `http://localhost:8080/realms/crunch/.well-known/openid-configuration`.
- **Defend** your auth decisions in the language of the specs. "We use the authorization-code flow with PKCE per the OAuth 2.1 draft; we use rotating refresh tokens per RFC 9700 §4.14.2; we validate the ID token's `aud`, `iss`, `exp`, and `nonce` per OIDC Core 1.0 §3.1.3.7" reads like an engineer who has done this before; "we use JWTs and bearer tokens" does not.

---

## Prerequisites

You finished **Week 9 — Performance and Web Vitals**. Concretely:

- A working multi-route React SPA, deployed to a public URL, with a real-user `web-vitals` shipping pipeline.
- You can read a `vite.config.js`, run `npm run dev`, and edit a React functional component with hooks.
- You have **Docker Desktop** installed and running, or a working `docker` and `docker compose` on the command line. Keycloak's official image is `quay.io/keycloak/keycloak:25.0` as of this writing; check <https://www.keycloak.org/downloads> for the current pin.
- You have **Node.js 20+** and **npm 10+** installed.
- You are comfortable opening Chrome DevTools, reading the Network tab, and using the Application tab to inspect cookies and `localStorage`.

If Docker is not running, install Docker Desktop first (<https://docs.docker.com/desktop/>) and confirm `docker run hello-world` succeeds. The mini-project does not work without it.

---

## Topics covered

- **The vocabulary.** Authentication ("who are you?") vs. authorization ("what may you do?"). Identity provider (IdP) vs. relying party (RP) vs. resource server. Authorization server vs. resource server (often the same in small apps; separate at scale). Confidential clients vs. public clients (a SPA is a **public** client — it cannot keep a secret, so it must use PKCE). The Bearer-token model from [RFC 6750](https://datatracker.ietf.org/doc/html/rfc6750).
- **OAuth 2.0 (RFC 6749) — the original four grants.** Authorization Code (for server-side web apps that can keep a secret), Implicit (deprecated — tokens in the URL fragment, replaced by Auth Code + PKCE), Resource Owner Password Credentials (deprecated — the user types the password into your app, never do this), Client Credentials (for service-to-service, no user involved). The lecture walks all four for vocabulary recognition; only two remain recommended in 2026.
- **OAuth 2.1 — the consolidation.** The IETF draft folds in security best practices accumulated since 2012: PKCE required for all clients (not just public), Implicit Flow removed, Resource Owner Password grant removed, refresh-token rotation required for public clients, exact-string redirect-URI matching required. Reference: <https://datatracker.ietf.org/doc/draft-ietf-oauth-v2-1/>.
- **PKCE (RFC 7636) in detail.** Why it exists (to protect public clients from authorization-code interception on the redirect leg), what the verifier and challenge are (the verifier is a high-entropy random string, the challenge is `BASE64URL(SHA256(verifier))`), and why a malicious app on the same device that intercepts the redirect cannot complete the token exchange (it does not have the verifier). The math is one SHA-256 and one base64url encode; the security property is provable. Reference: <https://datatracker.ietf.org/doc/html/rfc7636>.
- **OpenID Connect Core 1.0 — the identity layer.** What the ID Token is (a JWT signed by the IdP whose claims describe the authenticated user), the `nonce` parameter and its role in mitigating replay, the UserInfo endpoint, the discovery document at `/.well-known/openid-configuration`, the standard scopes (`openid`, `profile`, `email`, `address`, `phone`, `offline_access`). Reference: <https://openid.net/specs/openid-connect-core-1_0.html>.
- **JSON Web Tokens (RFC 7519).** The three segments, the header (`alg`, `typ`, `kid`), the payload (the claims), the signature, base64url encoding (no padding, URL-safe alphabet). The `alg` family — `HS256` (HMAC, symmetric), `RS256` (RSA, asymmetric), `ES256` (ECDSA on P-256, asymmetric, the modern default for new systems), `none` (forbidden in production, removed from most libraries' default whitelist). Reference: <https://datatracker.ietf.org/doc/html/rfc7519> and <https://datatracker.ietf.org/doc/html/rfc7518> for the algorithm registry.
- **JWT validation.** Fetch the JWKS from `${iss}/.well-known/jwks.json` (or wherever the discovery document says), cache it for `cache-control: max-age` seconds, match the token's `kid` header to a key in the JWKS, verify the signature, then validate `iss`, `aud`, `exp`, `nbf`, `iat`, and `nonce`. Reject the token if any check fails. The library does most of this; you should know what it does.
- **What NOT to put in a JWT claim.** Passwords, API keys, session secrets, anything you would refuse to log to a file. JWTs are signed but not encrypted by default; anyone with the token can read every claim. Use JWE (RFC 7516) if you need encryption, but the better answer is usually "do not put that data in a claim — put a stable user ID in `sub` and look the data up server-side on demand."
- **JWT vs. server session trade-offs.** Server sessions: a `sessionid` cookie tied to a row in a database table; revocation is a single SQL update; horizontal scaling needs a shared session store (Redis is the usual answer). JWTs: stateless, no server lookup, revocation requires either a short expiry or a denylist (you just gave back the database lookup you were trying to avoid). The lecture takes a position: **server sessions are the simpler default for a single-team monolith; JWTs earn their place at service-mesh boundaries and at the edge.**
- **Refresh tokens and rotation.** Why access tokens are short (a leaked access token is dangerous for only minutes), why refresh tokens are longer (the user does not want to re-authenticate every 15 minutes), why rotation matters (a stolen refresh token can be used at most once before the legitimate client trips the reuse detector), how to store the refresh token (httpOnly + Secure + SameSite=Lax cookie is the modern answer; `localStorage` is acceptable for low-value sessions but loses the XSS-resistance argument).
- **PKCE in a SPA — the working code.** The `oidc-client-ts` library wraps the verifier generation, the redirect, the callback parsing, and the silent renew. You will read enough of its source to know what it is doing, then use it.
- **MFA and TOTP.** RFC 6238 — the algorithm is HMAC-SHA1 over `floor(unix_time / 30)`, take the lower 31 bits, mod 1,000,000, zero-pad. The lecture walks the algorithm so you can read it in a library. Keycloak's TOTP is the FreeOTP-compatible standard. Reference: <https://www.rfc-editor.org/rfc/rfc6238.html>.
- **Provider survey.** Auth0 (Okta-owned, generous free tier, excellent docs), Clerk (developer-experience-first, React-first, the "drop-in widget" school), Supabase (Postgres-backed, generous free tier, OIDC), AWS Cognito (in-AWS-ecosystem, cheaper at scale, less pleasant DX), Azure AD B2C (enterprise default, complex), Okta (enterprise default, expensive), Google Identity Platform (rebranded Firebase Auth, generous free tier). The lecture takes a position: **start with Keycloak self-hosted if you can run a container, with Clerk or Auth0 if you cannot, and add a managed provider when you outgrow your DIY setup.**
- **Self-hosted survey.** Keycloak (the JBoss/Red Hat heavyweight, OIDC + SAML + LDAP, the week's main tool), Authelia (lightweight, reverse-proxy-friendly, designed for homelab and small-team SSO), Authentik (the Keycloak alternative with a friendlier admin UI, OIDC + SAML, Python-based), Zitadel (Go-based, modern UI, generous license). All are free. References: <https://www.keycloak.org/>, <https://www.authelia.com/>, <https://goauthentik.io/>, <https://zitadel.com/>.

---

## Tools you will need

| Tool                             | Role                                                         | Cost |
| -------------------------------- | ------------------------------------------------------------ | ---- |
| **Docker Desktop** (or Docker + Compose) | Run Keycloak locally in one container                 | Free |
| **Keycloak 25+** (container)     | The local OpenID Provider for the mini-project               | Free |
| **Chrome** (current stable)      | DevTools' Network and Application panels                     | Free |
| **`oidc-client-ts`** (npm)       | A thin OIDC + PKCE wrapper for browser clients               | Free |
| **`jose`** (npm)                 | The JOSE library — JWT verification, JWKS fetching           | Free |
| **`jwt.io`**                     | The "decode a JWT in the browser" debug tool                 | Free |
| **`curl` or HTTPie**             | Hit the token endpoint by hand to confirm flows              | Free |
| **Vite**                         | The dev server from Week 7                                   | Free |
| **A TOTP app** (FreeOTP, Aegis, Authy, or Google Authenticator) | Scan the QR code for the MFA exercise | Free |

No paid services. No paid SaaS. The five spec documents — **RFC 6749 (OAuth 2.0), RFC 7519 (JWT), RFC 7636 (PKCE), RFC 9700 (OAuth 2.0 Security BCP), OpenID Connect Core 1.0** — plus the **OWASP Authentication Cheat Sheet** and the **Keycloak Server Admin Guide** are the canonical references for this week, and the lectures cite each by section number.

---

## Weekly schedule

The schedule below adds up to approximately **38 hours**. Treat it as a target. Lecture 2 (the OAuth and OIDC walk-through) is the densest read; budget Tuesday for it.

| Day       | Focus                                                        | Lectures | Exercises | Challenges | Quiz/Read | Homework | Mini-Project | Self-Study | Daily Total |
|-----------|--------------------------------------------------------------|---------:|----------:|-----------:|----------:|---------:|-------------:|-----------:|------------:|
| Monday    | Vocabulary, OAuth 2.0 grants, OAuth 2.1 consolidation         |    3h    |    1h     |     0h     |    0.5h   |   1h     |     0.5h     |    0.5h    |     6.5h    |
| Tuesday   | The auth-code-with-PKCE flow walked end-to-end                |    3h    |    2h     |     0h     |    0.5h   |   1h     |     0h       |    0.5h    |     7h      |
| Wednesday | JWT anatomy, claims, signing algs, what NOT to put in a token |    2h    |    2h     |     1h     |    0.5h   |   1h     |     1h       |    0h      |     7.5h    |
| Thursday  | Refresh-token rotation, MFA + TOTP, provider survey           |    2h    |    1h     |     1h     |    0.5h   |   1h     |     2h       |    0.5h    |     8h      |
| Friday    | Mini-project — wire Keycloak + React + PKCE                   |    0h    |    0h     |     0h     |    0.5h   |   1h     |     4h       |    0.5h    |     6h      |
| Saturday  | Mini-project — protected route, API call, refresh             |    0h    |    0h     |     0h     |    0h     |   1h     |     2h       |    0h      |     3h      |
| Sunday    | Quiz, polish, write the auth README, submit                   |    0h    |    0h     |     0h     |    0.5h   |   0h     |     1h       |    0.5h    |     2h      |
| **Total** |                                                              | **10h**  | **6h**    | **2h**     | **3h**    | **6h**   | **10.5h**    | **2.5h**   | **40h**     |

---

## How to navigate this week

| File | What is inside |
|------|----------------|
| [README.md](./README.md) | This overview |
| [resources.md](./resources.md) | RFCs, OWASP cheat sheets, Keycloak docs, OIDC spec, provider docs |
| [lecture-notes/01-oauth-oidc-and-the-vocabulary.md](./lecture-notes/01-oauth-oidc-and-the-vocabulary.md) | What OAuth 2.0 is, what OIDC adds, why OAuth 2.1 deprecated the implicit flow |
| [lecture-notes/02-pkce-jwt-and-the-auth-code-flow.md](./lecture-notes/02-pkce-jwt-and-the-auth-code-flow.md) | The PKCE flow walked step by step. JWT anatomy. Signature verification. |
| [lecture-notes/03-sessions-refresh-mfa-and-providers.md](./lecture-notes/03-sessions-refresh-mfa-and-providers.md) | Sessions vs. JWTs. Refresh rotation. TOTP. The provider landscape. |
| [exercises/exercise-01-decode-a-jwt.md](./exercises/exercise-01-decode-a-jwt.md) | Decode a JWT by hand with `atob`; verify the signature with `jose`; reject a tampered token |
| [exercises/exercise-02-pkce-by-hand.md](./exercises/exercise-02-pkce-by-hand.md) | Generate a verifier and challenge in the console; hit Keycloak's authorize and token endpoints with `curl` |
| [exercises/exercise-03-protected-route.md](./exercises/exercise-03-protected-route.md) | Wire a React Router protected route that redirects unauthenticated users to the IdP |
| [exercises/starter-jwt-decode.ts](./exercises/starter-jwt-decode.ts) | Starter file for exercise 1 |
| [exercises/starter-pkce.ts](./exercises/starter-pkce.ts) | Starter file for exercise 2 |
| [exercises/starter-protected-route.jsx](./exercises/starter-protected-route.jsx) | Starter file for exercise 3 |
| [exercises/starter-keycloak-realm.json](./exercises/starter-keycloak-realm.json) | Minimal Keycloak realm import used in exercises 2 and 3 |
| [exercises/SOLUTIONS.md](./exercises/SOLUTIONS.md) | Reference solutions with annotated explanations |
| [challenges/challenge-01-refresh-rotation.md](./challenges/challenge-01-refresh-rotation.md) | Implement refresh-token rotation and demonstrate reuse detection trips |
| [challenges/challenge-02-jwks-cache.md](./challenges/challenge-02-jwks-cache.md) | Cache the JWKS correctly; handle key rotation without restart |
| [quiz.md](./quiz.md) | 10 multiple-choice questions |
| [homework.md](./homework.md) | Six practice problems for the week |
| [mini-project/README.md](./mini-project/README.md) | The SPA-plus-Keycloak end-to-end build |
| [mini-project/starter/docker-compose.yml](./mini-project/starter/docker-compose.yml) | Keycloak container plus a dummy resource server |
| [mini-project/starter/keycloak/realm-export.json](./mini-project/starter/keycloak/realm-export.json) | The Keycloak realm import — one client, one user |
| [mini-project/starter/package.json](./mini-project/starter/package.json) | React + Vite + `oidc-client-ts` + `jose` |
| [mini-project/starter/vite.config.js](./mini-project/starter/vite.config.js) | Vite dev server on port 5173 with the callback URL configured |
| [mini-project/starter/index.html](./mini-project/starter/index.html) | The SPA shell |
| [mini-project/starter/src/main.jsx](./mini-project/starter/src/main.jsx) | React bootstrap |
| [mini-project/starter/src/App.jsx](./mini-project/starter/src/App.jsx) | Routes — `/`, `/callback`, `/profile`, `/silent-renew` |
| [mini-project/starter/src/auth.js](./mini-project/starter/src/auth.js) | The `UserManager` setup — the one file you spend the most time in |
| [mini-project/starter/src/api.js](./mini-project/starter/src/api.js) | Bearer-token fetch wrapper with automatic refresh |
| [mini-project/starter/rubric.md](./mini-project/starter/rubric.md) | The grading rubric |

The recommended order:

1. Read all three lectures (Monday–Thursday).
2. Do the three exercises (Monday–Wednesday).
3. Take the quiz (Wednesday evening). If you score under 7, re-read.
4. Pick one or both challenges (Thursday).
5. Work through the homework problems alongside the mini-project (Thursday–Saturday).
6. Ship the mini-project (Friday–Sunday).

---

## Stretch goals

If you finish early and want to push further, try any of these:

- Read **RFC 6749** (OAuth 2.0) end to end at <https://datatracker.ietf.org/doc/html/rfc6749>. The first ten pages set the entire vocabulary; the rest defines the four grants in full. Roughly 75 pages, but every section is short.
- Read **the OAuth 2.1 draft** at <https://datatracker.ietf.org/doc/draft-ietf-oauth-v2-1/>. The diff against 2.0 is the modern security guidance distilled.
- Read **RFC 7636 (PKCE)** at <https://datatracker.ietf.org/doc/html/rfc7636>. Short — about 22 pages — and the security-considerations section is required reading before you ship anything to production.
- Read **OpenID Connect Core 1.0** §3.1 (Authorization Code Flow) at <https://openid.net/specs/openid-connect-core-1_0.html#CodeFlowAuth>. The most-cited section of the spec; bookmark it.
- Read **RFC 9700 — OAuth 2.0 Security Best Current Practice** at <https://www.rfc-editor.org/rfc/rfc9700.html>. The IETF's distilled "we have learned these the hard way" document. §4.14 is refresh-token rotation; §4.10 is redirect-URI validation; §2.1 is the public-client model.
- Read **the OWASP Authentication Cheat Sheet** at <https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html> end to end.
- Read **the OWASP JSON Web Token Cheat Sheet** at <https://cheatsheetseries.owasp.org/cheatsheets/JSON_Web_Token_for_Java_Cheat_Sheet.html>. Despite the Java in the URL, the guidance is language-neutral.
- Read **Aaron Parecki — "OAuth 2.0 Simplified"** at <https://www.oauth.com/>. Aaron co-edits the OAuth 2.1 draft; the prose is the practitioner's view of the spec.
- Stand up a second realm in Keycloak and federate it to your first realm. The "identity broker" pattern is what powers single-sign-on across an enterprise.
- Swap the mini-project's `oidc-client-ts` for the raw `fetch` + `crypto.subtle` calls. You will write 60 lines of code and understand the library the rest of your career.

---

## What this week is NOT

A few things to set expectations:

- **Not a SAML week.** SAML 2.0 is the older XML-based identity standard that still runs much of enterprise SSO. It is mentioned in the provider survey because Keycloak and Okta both speak SAML, and Authentik does too — but the focus of the week is the OIDC/OAuth stack that has won the modern web.
- **Not a "build your own identity provider" week.** Implementing a production-grade OIDC server is months of work, not a week. We use Keycloak. Building one yourself is a year-long side project for very specific learning goals; do not ship one.
- **Not a passwords-and-hashing week.** Argon2id and bcrypt are mentioned in the OWASP cheat sheet citations, and the lecture nods at them, but the mechanics of password storage are scheduled for C14 (backend track).
- **Not a WebAuthn / passkeys week.** Passkeys are the modern phishing-resistant replacement for passwords + TOTP. They are real, they are excellent, and they get a full week in C13 (security track). This week covers them in the lecture's "where this is going" section.
- **Not an OPA / Cedar / authorization-policy week.** Once you know who the user is, **what they can do** is a separate problem (RBAC, ABAC, policy engines like Open Policy Agent and AWS Cedar). The mini-project enforces only a "logged-in users only" check; fine-grained policy is a future module.
- **Not a federation week.** SAML-to-OIDC bridging, multi-realm federation, and identity broker patterns get a week in C24 (enterprise track).

---

## A word on the editorial voice

Authentication writing online is split between two camps. The **library-tutorial camp** says "install this package, paste these five lines, you are done" without ever explaining what those lines do. You ship. You forget. You hit a real-world problem six months later — a token does not refresh, a callback URL gets rejected, a JWT validates locally but fails in production — and you cannot debug it because the library was a black box. The **spec-purist camp** sends you straight to RFC 6749 and walks every paragraph. You learn the protocol. You do not ship for three weeks because you are still on §4. **Both are right, partially.** The right depth for an engineer at the SPA layer is **the protocol from the client's point of view, the library from the source-reading point of view, the spec from the "what does this option actually do?" point of view, and the OWASP cheat sheet from the "what am I about to get wrong?" point of view.** That is the depth the lectures aim for, and the homework and challenges test.

You will also notice the lectures take a position on the **server-session vs. JWT debate.** The position is: **for a single-team monolith with one database, server sessions are the simpler default.** JWTs win at service-mesh boundaries, at the API gateway, and at the edge. They lose at "let me revoke this user now." If you find yourself building a JWT denylist, you have rebuilt server sessions with extra steps; that is fine, but be honest about it. The mini-project uses JWTs because the topic is JWTs, not because every app should use them.

---

## Up next

Continue to [Week 11 — Progressive Web Apps and Offline](../week-11-pwa-and-offline/) once you have shipped the mini-project, the React SPA logs in against Keycloak with PKCE, the protected route redirects unauthenticated users, the access token is refreshed silently before it expires, the refresh token rotates on every use, the sign-out clears the session both client-side and at the IdP, and your homework answers cite three or more RFC section numbers and at least one OWASP cheat sheet.

---

*If you find errors in this material, please open an issue or send a PR. Future learners will thank you.*
