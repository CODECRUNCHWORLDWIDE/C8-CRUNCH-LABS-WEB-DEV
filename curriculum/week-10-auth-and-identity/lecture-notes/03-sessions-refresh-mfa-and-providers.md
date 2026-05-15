# Lecture 3 — Sessions vs. JWTs, Refresh Rotation, MFA, and the Provider Landscape

> *In which we close the loop. Sessions and JWTs are sibling solutions to the same problem; the choice between them is an honest engineering trade-off, not a fashion decision. Refresh tokens let users stay logged in without weakening short access-token lifetimes — but only if you rotate them and detect reuse. MFA via TOTP is a 30-line algorithm you should be able to describe. The provider landscape splits into managed (Auth0, Clerk, Supabase, Cognito, Okta) and self-hosted (Keycloak, Authelia, Authentik, Zitadel); both implement the same OIDC contract, and your choice is operational, not protocol-level. By the end of this lecture you will know which knobs to turn for the mini-project and which knobs to leave alone.*

---

## 1. Sessions vs. JWTs — the trade-off

This is the one debate in modern web auth that does not have a single right answer. Both server sessions and stateless JWTs are correct designs for the right problem; choosing between them is an architecture decision worth thinking about clearly.

### 1.1 The classical server-session model

For decades, the standard pattern was:

1. The user logs in (HTTP POST of username and password).
2. The server verifies the password, creates a row in a `sessions` table with a random `session_id` and a `user_id`, and sets a cookie:

```
Set-Cookie: sessionid=8c3f2a1b9d0e...; HttpOnly; Secure; SameSite=Lax; Path=/
```

3. The browser sends the cookie on every subsequent request.
4. The server reads the cookie, looks up `sessions.session_id`, finds the row, knows who the user is.
5. To log out, the server deletes the row. The next request finds nothing and is unauthenticated.

This is the architecture behind Django's `django.contrib.sessions`, Rails' `cookie_store`, Express's `express-session`, ASP.NET Core's `Microsoft.AspNetCore.Authentication.Cookies`, and a thousand custom implementations.

The good:

- **Revocation is instant.** Delete the row, the session ends on the next request.
- **The cookie value is meaningless** — it is an opaque identifier. There is nothing in it for an attacker to learn even if they capture it.
- **Implementations are mature, well-debugged, and built into every framework.**
- **`HttpOnly` cookies are not readable from JavaScript**, which makes them resistant to XSS-driven session theft.

The not-so-good:

- **Every authenticated request requires a database (or Redis) lookup.** At 10,000 requests per second this adds up.
- **Horizontal scaling needs a shared session store**, typically Redis. You cannot just stand up more app servers behind a load balancer if each one has its own in-memory session table.
- **Cross-domain or cross-service is awkward.** Cookies are scoped to a domain; service A on `a.example.com` and service B on `b.example.com` need careful configuration to share session state.

### 1.2 The stateless JWT model

The newer pattern:

1. The user logs in (OAuth flow, password, or whatever).
2. The server issues a JWT containing `sub`, `email`, `exp`, signed with the server's key.
3. The client stores the JWT (in memory, `localStorage`, or a cookie) and sends it on every request as `Authorization: Bearer <token>`.
4. On each request, the server verifies the JWT's signature and reads the claims. **No database lookup.**
5. To log out: just stop sending the token from the client. The server has nothing to delete.

The good:

- **No per-request database lookup.** Verification is a constant-time crypto operation.
- **Scales horizontally without a shared session store.** Any server with the public key can verify.
- **Crosses service boundaries cleanly.** Service A and service B can both verify the same token; they share only the public key, not a database.

The not-so-good:

- **Revocation is hard.** The token is valid until `exp`. To revoke before expiry you need either a very short `exp` (which forces refresh) or a denylist (which is a database lookup — at which point you have re-invented sessions).
- **Tokens leak information.** The payload is base64-encoded JSON; anyone with the token can read every claim. PII in claims is exposed.
- **Token size matters.** A JWT with many claims can exceed cookie or header limits.
- **Storage in the browser is delicate.** `localStorage` is readable from JavaScript and therefore vulnerable to XSS. `httpOnly` cookies are XSS-resistant but require CSRF protection. There is no "safe" choice; only trade-offs.

### 1.3 The honest decision matrix

A single-team monolith with one Postgres? **Sessions are fine and probably simpler.** You will write less code, have fewer security gotchas, and lose nothing meaningful.

A microservices architecture where service A authenticates and service B serves data? **JWTs are the right answer.** A shared session store between services creates coupling and a single point of failure.

A mobile app that talks to an API? **JWTs (specifically, OAuth access tokens, often as JWTs).** Cookies are awkward in mobile contexts.

A public API consumed by third-party apps? **OAuth (which uses JWTs as a common token format).** This is what OAuth was designed for.

A SPA talking only to its own backend? **Either works.** Modern frameworks (Next.js, Remix) increasingly recommend sessions with httpOnly cookies as the safer default. Pure SPA + REST API setups often end up with JWTs because the SPA is decoupled from the API.

**The position this lecture takes:** start with whichever your framework defaults to. Switch only when the trade-off matrix tells you to. Do not adopt JWTs because Hacker News told you to; do not refuse them because your senior engineer was burned by them in 2017.

The mini-project uses JWTs because the topic is JWTs. In a real "I am building a startup" decision, sessions would be just as defensible.

### 1.4 The hybrid pattern (and why most apps end up here)

In practice, most production apps end up with a **hybrid**:

- **An OIDC flow at the front door** issues an access token (JWT) and a refresh token.
- **The SPA exchanges the refresh token for short-lived access tokens** as needed.
- **The backend stores the refresh token in a server-side `sessions` table** keyed to an httpOnly cookie, so the SPA does not have to store the refresh token in browser storage.
- **The backend issues short JWT access tokens to the SPA** as needed for API calls.

This is sometimes called the "BFF" (Backend For Frontend) pattern. The SPA gets the convenience of JWTs for API calls; the backend gets the safety of server-side session storage for the long-lived secret. It is more code to write but easier to secure than either pure pattern, and the OAuth 2.0 BCP (RFC 9700 §6.2) names it as the recommended pattern for browser-based clients.

The mini-project does **not** implement the BFF pattern — we keep the refresh token client-side for clarity. In a production deployment you would put a backend in front.

---

## 2. Token storage in the browser

A short interlude, because where you put the tokens matters.

### 2.1 The options

| Storage location | XSS-readable | CSRF-vulnerable | Survives reload | Survives close |
|------------------|--------------|------------------|------------------|------------------|
| `localStorage`   | Yes           | No                | Yes               | Yes               |
| `sessionStorage` | Yes           | No                | Yes               | No                |
| In-memory (JS variable) | No (technically) | No        | No                | No                |
| Cookie (not httpOnly) | Yes      | Yes               | Yes               | Yes               |
| Cookie (httpOnly, Secure, SameSite=Lax) | No | Mitigated by SameSite | Yes | Yes |

### 2.2 The recommendation

For SPAs:

- **Access tokens — in memory.** They are short-lived (5–15 min). Losing them on reload is fine; the SPA can silently refresh.
- **Refresh tokens — httpOnly cookie set by a backend.** The most secure option, requires a backend, mitigated for CSRF by `SameSite=Lax` (or `Strict` if you do not need cross-site navigation flows).
- **If you have no backend — `sessionStorage` is acceptable** for low-value sessions. The argument is: XSS in your SPA already gives the attacker code execution in your origin, which is worse than them having your refresh token. But you have lost defense in depth.

The mini-project, for clarity, uses `sessionStorage`. The README documents this as a learning-context choice, not a production recommendation, and references the OWASP cheat sheet for the production answer.

### 2.3 The XSS perspective

Any of these storage options is irrelevant if your app is vulnerable to XSS. **A successful XSS gives the attacker full control of your origin** — they can read every token, intercept every fetch, and impersonate the user indefinitely. The defense is the same one C13 (security track) covers in depth: Content Security Policy, input sanitization, React's default JSX escaping, and **never** putting user input into `dangerouslySetInnerHTML`.

This week we treat XSS as Out of Scope. The week's threat model is "attacker on the network, attacker who steals tokens from logs, attacker who tries algorithm-confusion attacks." Defending against attackers who have already executed JavaScript on your origin is the next layer.

---

## 3. Refresh tokens and rotation

Access tokens are short-lived because they are exposed — they ride along on every API request, they end up in logs and traces, they are seen by every server they touch. A leaked access token is dangerous for only as long as it is valid; 5–15 minutes is the modern norm.

Refresh tokens are longer-lived because they are rarely transmitted — only when the access token needs refreshing. Hours to days is typical. But a leaked refresh token is dangerous for its full lifetime. The mitigation is **rotation**.

### 3.1 What rotation means

Every time the client uses a refresh token, the authorization server:

1. Verifies the refresh token is still valid (not expired, not revoked, not already used).
2. Issues a new access token AND a new refresh token.
3. **Marks the old refresh token as used.**

The next request the client makes uses the new refresh token. The old one is dead.

### 3.2 Reuse detection

Now the security property: suppose an attacker has stolen the refresh token. There are two cases:

- **The attacker uses it first.** The attacker gets a new access token. The next time the legitimate client tries, it presents an old refresh token. The authorization server sees a token marked "already used" and trips the alarm.
- **The legitimate client uses it first.** The attacker's request fails — they have an old, already-used refresh token. The authorization server sees an old-token use attempt and trips the alarm.

The point of rotation is that **at most one party** gets the new tokens, and the other party's failed attempt is the breach signal.

What does "trip the alarm" mean in practice? The authorization server **revokes the entire token family** — every refresh token derived from the original — and forces re-authentication. This is the behavior RFC 9700 §4.14.2 specifies and Keycloak implements by default when "Revoke Refresh Token" and "Refresh Token Max Reuse: 0" are set.

### 3.3 Keycloak configuration

For the mini-project, the Keycloak realm export sets:

- **Access Token Lifespan:** 900 (15 minutes).
- **Refresh Token Max Reuse:** 0 (each refresh token can be used exactly once).
- **Revoke Refresh Token:** ON.
- **SSO Session Idle:** 1800 (30 minutes of inactivity ends the session).
- **SSO Session Max:** 36000 (10 hours absolute lifetime).

You can read these in the `realm-export.json` file or in the Keycloak admin console under Realm Settings → Tokens.

### 3.4 The challenge

Challenge 1 asks you to demonstrate refresh-token reuse detection in action: capture two valid tokens in the same family, use the older one second, and observe the cascade revocation. The starter code logs every token exchange to make this visible.

---

## 4. MFA and TOTP (RFC 6238)

Multi-factor authentication is the second-factor check after the password. The pattern is "something you know" (the password) plus "something you have" (the device with the TOTP secret). The Time-based One-Time Password algorithm is what authenticator apps implement; you should be able to describe it.

### 4.1 The algorithm

RFC 6238 §4:

```
TOTP(K) = HOTP(K, T)
T = floor((current_unix_time - T0) / X)
T0 = 0 (default)
X = 30 (default, seconds)

HOTP(K, T) per RFC 4226:
  HS = HMAC-SHA1(K, T_bytes)         (20 bytes)
  offset = HS[19] & 0x0F             (the low 4 bits of the last byte)
  P = HS[offset..offset+3]            (4 bytes starting at offset)
  P = P & 0x7FFFFFFF                  (drop the sign bit; 31 bits)
  return (P mod 10^d)                 (d = 6 typically; 6 digits)
```

In words: HMAC-SHA1 the 30-second time window with the user's shared secret, look at the low 4 bits of the last byte for an offset, extract 4 bytes at that offset, mask the sign bit, take modulo 1,000,000, zero-pad. You get a 6-digit number that changes every 30 seconds.

### 4.2 The TOTP secret

The shared secret is a base32-encoded random string. When the user enrolls in MFA, the provider:

1. Generates a random secret (160 bits is standard).
2. Encodes it in base32 (Google Authenticator's expected format).
3. Displays a QR code containing a `otpauth://` URL:

```
otpauth://totp/Crunch:alice?secret=JBSWY3DPEHPK3PXP&issuer=Crunch&algorithm=SHA1&digits=6&period=30
```

The user scans the QR code with their authenticator app. The app extracts the secret and starts generating codes. The user types the current code back to the provider to prove the secret was correctly received.

### 4.3 Verification

When the user enters a TOTP code at login:

1. The server computes `TOTP(secret, current_time)`, `TOTP(secret, current_time - 30s)`, and `TOTP(secret, current_time + 30s)` — three windows to account for clock skew between server and authenticator.
2. The server compares each to the user-entered code in constant time (to prevent timing attacks).
3. If any matches, the second factor is verified.

The server should also record that this code has been used and reject re-use within the same window — TOTP is one-time per window.

### 4.4 Keycloak's TOTP

Keycloak's TOTP is standards-compliant out of the box. To enable it for a user:

1. In the admin console: Realm → Authentication → Required Actions → enable "Configure OTP."
2. For a specific user: Users → select user → Required user actions → add "Configure OTP."
3. The user, on next login, is prompted to scan a QR code.

The mini-project's realm export enables this by default for the seed user. Exercise 3 walks you through it.

### 4.5 What TOTP does not defend against

TOTP is a real but limited mitigation. It does not stop:

- **Phishing.** A phishing site that asks for password + TOTP can immediately replay both to the real site. The 30-second window is enough.
- **Real-time AITM (adversary-in-the-middle).** Tools like Evilginx2 proxy the entire login flow and capture session cookies. TOTP is no defense.
- **SIM-swap attacks on SMS-based "MFA."** Which is why SMS is not real MFA. Use a TOTP app, a hardware key, or a passkey.

The future-proof answer is **passkeys** (WebAuthn) — phishing-resistant by design. C13 (security track) covers them. For W10, TOTP is the practical middle ground that every major provider supports.

---

## 5. Logout — harder than it looks

You will be tempted to "log out" by just deleting the access token. This is wrong, or at least insufficient. The user is still authenticated at the IdP; the next sign-in will silently succeed because the IdP's session cookie is still valid.

Correct logout has two parts:

1. **Clear the SPA's local state.** Drop the in-memory access token, clear any session/local storage tokens.
2. **End the IdP session.** Redirect the browser to the IdP's `end_session_endpoint`:

```
GET http://localhost:8080/realms/crunch/protocol/openid-connect/logout
  ?id_token_hint=<the-id-token>
  &post_logout_redirect_uri=http://localhost:5173/
```

The IdP terminates the SSO session, clears its cookie, and redirects back. Now the next sign-in will actually require the user to authenticate.

This is the **Front-Channel Logout** pattern. There is also Back-Channel Logout (server-to-server notifications) for multi-RP SSO scenarios; covered briefly in the resources and in C24.

---

## 6. The provider landscape — what to reach for

This week we use **Keycloak** because it is free, OIDC-compliant, and runs in a single Docker container. Production deployments often choose differently; here is a brief survey of what is out there, so you can read each provider's docs without surprise.

### 6.1 Self-hosted (free, open source)

**Keycloak.** <https://www.keycloak.org/>. The JBoss/Red Hat heavyweight. OIDC + SAML + LDAP + OAuth + user federation. Java-based, ships as a container, runs on every cloud. Best for: organizations that already run JVM services, anyone who needs SAML alongside OIDC.

**Authentik.** <https://goauthentik.io/>. The friendlier-UI Keycloak alternative. Python-based, full OIDC + SAML + LDAP. Newer (2020s), actively developed, smaller community than Keycloak but growing. Best for: teams who want Keycloak's feature set without Keycloak's admin UX.

**Authelia.** <https://www.authelia.com/>. Lightweight, designed for reverse-proxy auth (Traefik, Nginx, Caddy). Best for: homelab single-sign-on, small-team internal tools. Not a full OAuth/OIDC provider — focused on forward-auth.

**Zitadel.** <https://zitadel.com/>. Go-based, multi-tenant from day one, modern admin UI. Free self-hosted, paid hosted SaaS. Best for: new builds that want a modern alternative to Keycloak.

**ORY Hydra + Kratos.** <https://www.ory.sh/>. Headless OAuth/OIDC server (Hydra) paired with an identity/login service (Kratos). You bring your own login UI. Best for: teams that want fine-grained control of the UX.

### 6.2 Managed (free tiers available)

**Auth0.** <https://auth0.com/>. Okta-owned. Generous free tier (7,500 active users). The most-recommended "just use a managed provider" choice. Excellent docs.

**Clerk.** <https://clerk.com/>. React-first developer experience. Drop-in `<SignIn />` widget. Free tier suitable for student projects. The friendliest DX in the space.

**Supabase Auth.** <https://supabase.com/auth>. Postgres-backed, OIDC + magic links + social. Free tier generous. Best if you are already using Supabase as your database.

**AWS Cognito.** <https://aws.amazon.com/cognito/>. Cheapest at scale. Less pleasant DX. Best if your stack already lives in AWS.

**Azure AD B2C / Entra External ID.** <https://learn.microsoft.com/en-us/azure/active-directory-b2c/>. The Microsoft answer. Enterprise default; complex.

**Okta.** <https://www.okta.com/>. Enterprise default for SAML + OIDC. Expensive at scale. Owns Auth0.

**Google Identity Platform / Firebase Auth.** <https://cloud.google.com/identity-platform>. Generous free tier. Tightly integrated with the Google ecosystem.

### 6.3 The decision

For a student project or a hobby app: **start with Keycloak self-hosted**. It is free, you learn the protocol, you can read every config in the admin console. If you cannot or will not run a container: **Clerk** for React-heavy projects, **Auth0** for everything else. If your stack is already on AWS or GCP, the in-ecosystem provider is the path of least resistance.

The recommendation **after** the project takes off and you have real users: stay with whatever got you to first traction. Migrating identity providers is painful but doable (every OIDC provider speaks the same protocol; you re-export users by `sub`). Premature optimization here is just as wasteful as premature optimization anywhere else.

---

## 7. Putting the mini-project in context

The mini-project pulls every concept together:

1. **Keycloak runs in Docker.** The `docker-compose.yml` brings up Keycloak on `localhost:8080` with the `crunch` realm imported.
2. **The React SPA uses `oidc-client-ts`.** The library handles PKCE, the redirect, the callback parsing, silent renew, and logout. The lectures explain what it is doing.
3. **The auth-code-with-PKCE flow** is the only flow used. The SPA is a public client; no client secret anywhere.
4. **The ID token is verified** with `jose` against Keycloak's JWKS. The verification pins `algorithms: ['RS256']`, validates `iss`, `aud`, `exp`, and `nonce`.
5. **The access token rides on API calls** to a mock resource server. The mock server logs the bearer header.
6. **The refresh token rotates on every use.** The starter code logs the rotation visibly.
7. **TOTP is enabled** in the seed realm. The README walks through scanning the QR code at first login.
8. **Logout** redirects to the IdP's `end_session_endpoint` and clears local state.

The rubric is graded on the audit-report pattern from W9: did you understand each piece, can you explain each piece, did you write the README that describes the architecture in the language of the specs?

---

## 8. Where this lecture ends

You now have the full protocol vocabulary, the PKCE math, the JWT format, the verification algorithm, the session-vs-JWT trade-off, the refresh-rotation mechanism, the TOTP algorithm, and a map of the provider landscape. The exercises walk you through doing each by hand. The challenges push you to demonstrate the security properties. The mini-project ties it all together.

If you read only one further document this week, read **RFC 9700** (OAuth Security Best Current Practice) end to end. It is the IETF's distilled "we have learned these the hard way" reference, and it is the most actionable single document in the field.

---

## 9. References

- RFC 9700 — OAuth 2.0 Security Best Current Practice. <https://www.rfc-editor.org/rfc/rfc9700.html>
- RFC 6238 — TOTP. <https://www.rfc-editor.org/rfc/rfc6238.html>
- RFC 4226 — HOTP. <https://www.rfc-editor.org/rfc/rfc4226.html>
- OWASP Session Management Cheat Sheet. <https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html>
- OWASP Authentication Cheat Sheet. <https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html>
- Auth0 — Refresh Token Rotation. <https://auth0.com/docs/secure/tokens/refresh-tokens/refresh-token-rotation>
- Keycloak Admin Guide — Token configuration. <https://www.keycloak.org/docs/latest/server_admin/#sso-protocols>
- OIDC Front-Channel Logout. <https://openid.net/specs/openid-connect-frontchannel-1_0.html>
- OIDC Back-Channel Logout. <https://openid.net/specs/openid-connect-backchannel-1_0.html>
- W3C WebAuthn Level 2. <https://www.w3.org/TR/webauthn-2/>
- FIDO Alliance Passkeys. <https://fidoalliance.org/passkeys/>
