# Lecture 1 — OAuth, OpenID Connect, and the Vocabulary You Need

> *In which we settle the vocabulary. Authentication is not authorization. OAuth is an authorization framework, not an authentication protocol — which is why OpenID Connect had to be invented to sit on top of it. There are four OAuth 2.0 grant types in RFC 6749, two of which you should never use, and the OAuth 2.1 draft consolidates the field around one: authorization code with PKCE for public clients. By the end of this lecture you will be able to read a sentence like "we use the auth-code flow with PKCE against an OIDC-compliant IdP that issues short-lived RS256-signed access tokens" and know exactly what each clause is asserting.*

---

## 1. The two questions, in order

Almost every web application that holds data on behalf of a user needs answers to two questions, in this order:

1. **Who are you?** (Authentication, or **authn**.) The user types an email and a password, or scans a face, or taps a passkey, or clicks "Continue with Google." Whatever the mechanism, the result is the same: at the end of the interaction, the server has a verified opinion about which user is sitting at the other end of the connection.
2. **What are you allowed to do?** (Authorization, or **authz**.) Given that we know the user is `user_4827`, may they read the document `doc_991`? May they delete it? May they invite others to edit it? Authorization is about policy — RBAC ("admins can delete"), ABAC ("the document owner can delete"), or something more fine-grained — and it is enforced on every request, not just at login time.

These are different problems with different solutions. **Conflating them is the single most common confusion in the field.** OAuth was designed to solve a specific authorization problem. OpenID Connect was designed to solve the authentication problem, using OAuth's machinery. JWTs are a token format that both protocols use. None of these is "the way you do login"; they are pieces that fit together to do login plus API access.

The week is organized around teaching you to keep these straight.

---

## 2. A short history (because the names are confusing)

The history matters because the vocabulary is laden with it. Skip this if you are in a hurry, but the names will not make sense without it.

### 2.1 Before OAuth — the "give us your password" problem

In the mid-2000s, third-party apps that wanted to integrate with Twitter, Yahoo Mail, Facebook, or Google routinely asked the user to **paste their password** into the third-party app's form. The third-party app would then log in as the user, screen-scrape the data, and call it a feature.

This was, by every measure, a security disaster. The third party had your password (in plaintext, on their server). The third party had your **full account** — not just permission to read your contacts but permission to delete your account. There was no way to revoke access short of changing your password, which broke every other third-party integration at the same time.

The industry's response was OAuth.

### 2.2 OAuth 1.0 (2007–2010)

OAuth 1.0 (RFC 5849, December 2007) was the first formalization of the "delegated authorization" pattern. The user grants a third-party app a **token** scoped to a specific set of permissions on a specific provider. The third-party app uses the token instead of the password. The user can revoke the token without affecting their password or other integrations.

The design worked but the cryptography was painful — every request had to be signed with HMAC-SHA1 over a canonicalized string of parameters. Implementations diverged. Library quality varied.

### 2.3 OAuth 2.0 (RFC 6749, October 2012)

OAuth 2.0 simplified the signing problem by leaning on HTTPS as the transport security: tokens are sent as Bearer tokens in the `Authorization` header, signed by no one, protected by TLS only. This was a deliberate trade-off — the protocol became dramatically easier to implement at the cost of some defense-in-depth.

RFC 6749 defines **four grant types** — four different ways for a client to obtain an access token:

1. **Authorization Code Grant** (§4.1). The recommended grant for server-side web applications. The user is redirected to the authorization server, logs in, is redirected back with an authorization code, and the server-side app exchanges the code (plus its client secret) for tokens. The user's password never touches the client.
2. **Implicit Grant** (§4.2). A simpler variant for browser-based "JavaScript" apps that cannot keep a secret. The authorization server returns the access token directly in the URL fragment after redirect. **Now deprecated**, replaced by Authorization Code + PKCE.
3. **Resource Owner Password Credentials Grant** (§4.3). The user types their password into the client, which exchanges it directly with the authorization server. This is "OAuth, but with the original anti-pattern preserved as a fallback." **Now deprecated**, except in narrow legacy migration scenarios.
4. **Client Credentials Grant** (§4.4). For machine-to-machine communication where there is no user involved — a backend service calling another backend service's API. Still recommended and widely used.

The numbering you will see — "the auth-code flow," "the implicit flow," "the password flow," "the client-credentials flow" — refers to these four. Two are deprecated. One is for backends only. The remaining one is the auth-code flow, and that is the flow this course teaches.

### 2.4 OAuth 2.0 was not for authentication

OAuth 2.0 is an **authorization** framework — it gives a third party permission to call an API on the user's behalf. It does not, by itself, tell the third party **who the user is**. The access token says "the bearer of this token may call these APIs"; it does not say "this token was issued for user_4827."

Early implementations papered over this by calling a "user info" API after obtaining the access token. The third party would call `/me`, get back `{ "id": "4827", "email": "alice@example.com" }`, and treat that as authentication. This worked, but the contract was per-provider — Twitter's `/me` looked different from Facebook's `/me`, which looked different from Google's `/me`. There was no standard.

This was the gap OpenID Connect was invented to fill.

### 2.5 OpenID Connect 1.0 (2014)

OpenID Connect (OIDC) Core 1.0 was published by the OpenID Foundation in February 2014. It is a thin **identity layer on top of OAuth 2.0**. The core additions:

- A standard scope, `openid`, that the client requests in the authorization request. Including this scope tells the authorization server "in addition to the access token, please issue me an **ID token**."
- An **ID Token** — a JSON Web Token (RFC 7519) signed by the IdP, whose claims describe the authenticated user. The ID token is the answer to "who is the user?" in a standard, verifiable format.
- A standard `/userinfo` endpoint that returns claims about the user.
- A discovery document at `/.well-known/openid-configuration` that lists every endpoint, every supported scope, every supported signing algorithm. This is what makes one OIDC provider drop-in replaceable with another.
- A `nonce` parameter to defend against ID-token replay attacks.

After OIDC, the third party no longer has to call a custom `/me` endpoint to figure out who the user is — it reads the ID token's `sub` (subject) claim, which is the user's stable identifier at the IdP. Read in this light, **OIDC is what makes OAuth 2.0 actually useful for login**, and the two protocols are almost always deployed together.

The vocabulary you will see in real-world architectures:

- **OAuth alone** — "give me a token to call API X." Used when the client is not your code (a third party) and the user is granting them limited permission.
- **OIDC alone** — almost never, in practice. OIDC builds on OAuth, so you get OAuth tokens too.
- **OAuth + OIDC** — the modern default. You authenticate the user (OIDC) and you obtain a token to call your own backend (OAuth). The single redirect handles both.

### 2.6 OAuth 2.1 (draft, ongoing)

The IETF's [OAuth 2.1 draft](https://datatracker.ietf.org/doc/draft-ietf-oauth-v2-1/) is a consolidation of a decade of accumulated security guidance. It does not introduce new mechanisms; it **removes the dangerous ones and tightens the rules**. The notable changes from 2.0:

- **PKCE is required for all clients**, including confidential clients. (In 2.0 it was required only for public clients.)
- **The Implicit Grant is removed.**
- **The Resource Owner Password Credentials Grant is removed.**
- **Refresh-token rotation is required for public clients.**
- **Redirect URIs must be matched exactly** as strings, with no wildcard or substring matching.
- **Bearer tokens may not appear in the query string.**

OAuth 2.1 is a draft; some providers already comply with it, others lag behind. You should treat its rules as your defaults regardless of the spec's status: every one of them codifies a hard-won security lesson.

---

## 3. The protocol roles

Four roles appear in every diagram, with no shorthand to confuse you (these are the names in the spec):

| Role | Definition | Example in our mini-project |
|------|-----------|-----------------------------|
| **Resource Owner** | The human user who owns the protected data | You |
| **Client** | The application that wants to access the resource | The React SPA running in your browser |
| **Authorization Server** (often called **Identity Provider** or **IdP** when OIDC is involved) | The server that authenticates the resource owner and issues tokens | Keycloak running on `localhost:8080` |
| **Resource Server** | The server that hosts the protected data and accepts access tokens | The Express API running on `localhost:3001` (in W11 — in W10 the resource server is mocked) |

In small applications the authorization server and the resource server are often the same machine — you call `/login` and `/api/posts` on the same domain. As applications grow, separating them becomes valuable: one identity provider can serve many resource servers, and the security review of the identity provider can happen once for all of them.

There is one more distinction you must internalize:

- **Confidential clients** are clients that can keep a secret — a server-side web app whose source is not visible to users, with a `client_secret` stored in environment variables.
- **Public clients** are clients that cannot keep a secret — a SPA whose JavaScript is downloaded by every visitor, a mobile app whose binary can be decompiled. Anything you bake into the bundle is a public string.

**A SPA is a public client. It cannot use a client secret. This is why PKCE exists.** We will cover PKCE in lecture 2; for now, hold the distinction.

---

## 4. The OAuth 2.0 grants, walked

We will walk all four grant types because you will see references to all four in real code and documentation, and you must be able to recognize each one. Three of the four are now deprecated or specialized; the auth-code flow is the one you implement.

### 4.1 Authorization Code Grant (recommended)

The canonical OAuth 2.0 flow. The full sequence:

```
1. User visits the client (the SPA).
2. The client redirects the user's browser to:
   GET https://idp.example.com/authorize
     ?response_type=code
     &client_id=spa-client
     &redirect_uri=https://spa.example.com/callback
     &scope=openid profile email
     &state=<csrf-defense-random-string>
3. The IdP shows the user a login page (or a "you are already logged in" auto-redirect).
4. The user authenticates with the IdP (password, MFA, passkey, etc).
5. The IdP redirects the user's browser back to:
   GET https://spa.example.com/callback
     ?code=<authorization-code>
     &state=<the-same-state-from-step-2>
6. The client (server-side or, with PKCE, the SPA) POSTs to:
   POST https://idp.example.com/token
     grant_type=authorization_code
     code=<the-code-from-step-5>
     redirect_uri=https://spa.example.com/callback
     client_id=spa-client
     code_verifier=<the-PKCE-verifier>   (if PKCE)
     client_secret=<the-client-secret>   (if confidential client)
7. The IdP responds with:
   {
     "access_token": "...",
     "id_token": "...",         (if OIDC)
     "refresh_token": "...",
     "token_type": "Bearer",
     "expires_in": 900
   }
8. The client stores the tokens and uses the access token to call APIs:
   GET https://api.example.com/me
   Authorization: Bearer <access_token>
```

Two things that look incidental are critical:

- **The `state` parameter** is your defense against cross-site request forgery on the redirect leg. The client generates a random string, stashes it in `sessionStorage` before the redirect, and verifies it matches when the callback arrives. If a malicious site tricks the user's browser into hitting the callback URL with an attacker-chosen `code`, the `state` mismatch is the trip wire.
- **The `code` is single-use.** The IdP records that this code has been exchanged and rejects any second exchange attempt. The window between step 5 and step 6 is short — seconds.

This is the flow the mini-project implements. Everything else in the week is layered on top of it.

### 4.2 Implicit Grant (deprecated)

The implicit flow was the original answer for browser-based JavaScript apps that could not keep a client secret. Instead of returning a code in step 5 and exchanging it in step 6, the IdP returned the access token directly in the URL **fragment**:

```
GET https://spa.example.com/callback#access_token=...&token_type=Bearer&expires_in=900
```

The URL fragment is not sent in the `Referer` header and is not sent to the server in the redirect — so the access token "stays in the browser." The flow was simpler than auth-code but had three problems that ultimately killed it:

1. **The access token appeared in browser history.** Anyone with access to the device's history (a colleague at a shared workstation, a forensic tool) could read it.
2. **The flow could not safely deliver a refresh token.** Without refresh, the user had to re-authenticate at the IdP every time the access token expired.
3. **There was no proof that the client receiving the token was the one that started the flow.** A malicious app that hijacked the redirect could take the token and use it.

PKCE (covered in lecture 2) solved problem 3 for the auth-code flow, and the OAuth Security BCP (RFC 9700 §2.1.2) consequently recommends **never using the implicit flow**. OAuth 2.1 removes it from the spec entirely.

You will still see code that uses it in tutorials older than 2020. Recognize it and rewrite it.

### 4.3 Resource Owner Password Credentials Grant (deprecated)

The user types their password into the client, which sends it to the IdP's token endpoint:

```
POST https://idp.example.com/token
grant_type=password
username=alice@example.com
password=plaintext-password
client_id=app
```

This is the original anti-pattern preserved as an OAuth grant. The client sees the password. The benefits of OAuth — the user not handing over their password — are abandoned. The grant was included for legacy migration use cases and **the OAuth 2.1 draft removes it entirely**.

There is exactly one situation where this grant is sometimes used today: a first-party mobile app whose login flow does not redirect to a browser. Even then, the modern answer is the auth-code flow with PKCE in a system browser (Chrome Custom Tabs on Android, SFAuthenticationSession on iOS), not the password grant.

If you see the password grant in code you maintain, replace it.

### 4.4 Client Credentials Grant (still used)

Used for **machine-to-machine** communication where there is no user. Two backend services talk to each other:

```
POST https://idp.example.com/token
grant_type=client_credentials
client_id=service-A
client_secret=<secret>
scope=read:posts
```

The IdP returns an access token scoped to whatever permissions service A has been granted. No user, no ID token, no refresh token (the service just requests a new access token when it expires).

This is a confidential-client flow. SPAs do not use it. Backend services do, and the W11+ backend track covers it in depth.

### 4.5 The other grants (for completeness)

- **Refresh Token Grant** (§6 of RFC 6749). Used to obtain a new access token when the current one expires, without forcing the user to re-authenticate.
- **Device Authorization Grant** (RFC 8628). For TVs and CLI tools — the device shows a code, the user types it into a browser on their phone, the device polls the IdP until the user has completed login.
- **JWT Bearer Token Grant** (RFC 7523). A JWT signed by a trusted party serves as the credential to obtain an access token. Used in some enterprise SSO scenarios.

You will encounter these but they are not the focus of the week.

---

## 5. The OAuth 2.1 consolidation — what changed

Read this as the modern security defaults, codified.

### 5.1 PKCE is now mandatory

In OAuth 2.0, PKCE was originally specified (RFC 7636, 2015) as an **optional** extension to defend public clients against authorization-code interception. The OAuth 2.1 draft **requires PKCE for all clients**, including confidential clients. The reasoning is straightforward: PKCE is cheap and there is no scenario where adding it makes things worse.

In practice this means: every authorization request sends `code_challenge` and `code_challenge_method=S256`; every token request sends `code_verifier`. The library handles this for you; you should know it is happening.

### 5.2 No more tokens in URL fragments

The implicit grant put access tokens in URL fragments. OAuth 2.1 removes the grant. The principle generalizes: **bearer tokens belong in `Authorization` headers, not in URLs**.

### 5.3 Exact-string redirect URI matching

OAuth 2.0 allowed the redirect URI to be partially matched against the registered URI — a registered `https://app.example.com/callback` might match an incoming `https://app.example.com/callback?utm_source=foo`. This created subtle vulnerabilities. **OAuth 2.1 requires an exact string match** between the registered URI and the incoming `redirect_uri` parameter.

In Keycloak's admin console, you register the exact callback URL. No wildcards, no patterns. If your dev callback is `http://localhost:5173/callback` and your prod is `https://app.example.com/callback`, you register both, exactly.

### 5.4 Refresh-token rotation for public clients

A leaked access token is short-lived; a leaked refresh token is not. The mitigation is **rotation**: every refresh request returns a new refresh token and invalidates the old one. If an attacker uses a stolen refresh token first, the legitimate client's later use will fail — and the IdP can detect the conflict and **revoke the entire session**. We cover this in lecture 3 §3.

### 5.5 No password grant, no implicit grant

Already covered above. Both are removed.

---

## 6. OpenID Connect — the identity layer

OIDC is, in its simplest description, "OAuth 2.0 with the addition of a signed ID token that describes the user."

### 6.1 What `scope=openid` does

The client includes `openid` in the `scope` parameter of the authorization request:

```
GET /authorize?response_type=code&scope=openid profile email...
```

The `openid` scope is the trigger. When the IdP sees it, it knows this is an OIDC flow and the token response will include an `id_token` alongside the `access_token`:

```json
{
  "access_token": "eyJhbGciOiJSUzI1NiIs...",
  "id_token": "eyJhbGciOiJSUzI1NiIs...",
  "token_type": "Bearer",
  "expires_in": 900
}
```

Other common OIDC scopes:

- `profile` — adds claims like `name`, `family_name`, `given_name`, `picture`, `locale`.
- `email` — adds `email` and `email_verified` claims.
- `address` — adds an `address` claim with structured subfields.
- `phone` — adds `phone_number` and `phone_number_verified`.
- `offline_access` — requests a refresh token (some providers issue refresh tokens by default; this scope makes it explicit).

The full list and meaning is in OIDC Core 1.0 §5.4.

### 6.2 The ID token, briefly

Lecture 2 walks the ID token byte by byte. For now, the structure: it is a JWT signed by the IdP, whose claims include at minimum:

- `iss` — the IdP's issuer URL.
- `sub` — the user's stable ID at the IdP. **Use this as the foreign key in your database**, not the email.
- `aud` — your `client_id`. If `aud` does not match your client, **reject the token**.
- `exp` — Unix timestamp of expiration. The ID token is short-lived; the access and refresh tokens have separate lifetimes.
- `iat` — Unix timestamp the token was issued.
- `nonce` — the nonce you sent in the authorization request. **It must match**, or reject the token.

Plus, depending on requested scopes, the profile/email claims listed above.

### 6.3 The discovery document

Every OIDC-compliant provider exposes a discovery document at:

```
GET https://idp.example.com/.well-known/openid-configuration
```

The document is JSON and lists every endpoint, scope, signing algorithm, and capability the provider supports. For Keycloak running locally on our mini-project, it lives at `http://localhost:8080/realms/crunch/.well-known/openid-configuration`. A trimmed example:

```json
{
  "issuer": "http://localhost:8080/realms/crunch",
  "authorization_endpoint": "http://localhost:8080/realms/crunch/protocol/openid-connect/auth",
  "token_endpoint": "http://localhost:8080/realms/crunch/protocol/openid-connect/token",
  "userinfo_endpoint": "http://localhost:8080/realms/crunch/protocol/openid-connect/userinfo",
  "jwks_uri": "http://localhost:8080/realms/crunch/protocol/openid-connect/certs",
  "end_session_endpoint": "http://localhost:8080/realms/crunch/protocol/openid-connect/logout",
  "response_types_supported": ["code", "id_token", "code id_token", "..."],
  "subject_types_supported": ["public", "pairwise"],
  "id_token_signing_alg_values_supported": ["RS256", "ES256", "..."],
  "scopes_supported": ["openid", "profile", "email", "..."],
  "code_challenge_methods_supported": ["plain", "S256"]
}
```

**The discovery document is what makes OIDC providers swappable.** Your client library reads the discovery URL once, caches the endpoints, and never hard-codes a path. Moving from Keycloak to Auth0 to Okta is, at the client-config layer, a one-line change to the discovery URL.

### 6.4 The nonce parameter

The `nonce` is the OIDC-specific equivalent of `state`, but it lives in the ID token. The flow:

1. The client generates a random `nonce`, stashes it in `sessionStorage`.
2. The client sends `nonce=<value>` in the authorization request.
3. The IdP includes the nonce as a claim in the ID token.
4. The client verifies that the ID token's `nonce` claim matches the stashed value, and that the value was used exactly once.

The defense is against **ID token replay** — an attacker who captures an ID token in transit (somehow, despite TLS) cannot reuse it on a fresh login attempt because the nonce would not match.

OIDC Core §3.1.3.7 enumerates the seven things you must verify about an ID token:

1. `iss` matches the expected issuer.
2. `aud` contains your `client_id`.
3. If `aud` is an array with multiple values, `azp` (authorized party) is present and equals your `client_id`.
4. The signature verifies against a key in the JWKS, using one of the algorithms the discovery document lists.
5. `exp` is in the future (with optional clock skew).
6. `iat` is recent (you decide what "recent" means; an hour is typical).
7. `nonce` matches the value you sent.

Every library does these by default; you should know it is doing them and you should know how to read its log output when one of them fails.

---

## 7. Putting it together — the canonical SPA architecture

Here is the architecture the mini-project implements, in one diagram (described in prose because diagrams in markdown are noisy):

- **The user** opens the SPA in a browser.
- **The SPA** is a React app, served as static HTML/JS/CSS from a CDN or static host. It is a **public client**.
- **The SPA** uses the `oidc-client-ts` library, configured with the Keycloak discovery URL, the client ID `spa-client`, and the redirect URI `http://localhost:5173/callback`.
- **The user** clicks "Sign In." The SPA generates a PKCE verifier and challenge, stashes them in `sessionStorage`, and redirects the browser to Keycloak's authorize endpoint with `response_type=code&code_challenge=<challenge>&code_challenge_method=S256&scope=openid profile email&state=<random>&nonce=<random>`.
- **Keycloak** shows the login page. The user enters their username and password. (Optionally: a TOTP code. See lecture 3.)
- **Keycloak** redirects back to `http://localhost:5173/callback?code=<code>&state=<state>`.
- **The SPA's callback handler** verifies `state`, POSTs `code` plus `code_verifier` to the token endpoint, receives an `access_token`, `id_token`, and `refresh_token`. It verifies the ID token's signature, `iss`, `aud`, `exp`, and `nonce`.
- **The SPA** stores the access token in memory (not `localStorage`, for XSS reasons we discuss in lecture 3) and the refresh token in an httpOnly cookie set by an auth proxy, or — for the mini-project's simpler setup — in `sessionStorage` with the caveat that this is acceptable for low-value sessions only.
- **The SPA** calls the resource server's API with `Authorization: Bearer <access_token>`. The resource server verifies the access token's signature and claims against the same JWKS.
- **When the access token expires**, the SPA silently uses the refresh token to obtain a new pair (access and refresh). The old refresh token is invalidated by Keycloak.
- **When the user clicks "Sign Out,"** the SPA redirects to Keycloak's `end_session_endpoint`, which terminates the Keycloak session and redirects back to the SPA.

That is the entire dance. The library hides almost all of it; the lectures, exercises, and challenges this week make sure you can describe and debug every step.

---

## 8. Where this lecture ends

Lecture 2 walks the PKCE math, decodes a JWT segment by segment, and shows what happens when the signature does not verify. Lecture 3 covers refresh-token rotation, the JWT-vs-session decision, MFA via TOTP, and surveys the provider landscape so you know what to reach for when you outgrow Keycloak.

For the exercises and homework attached to this lecture, the test is **vocabulary recognition**. Can you read a Keycloak admin-console screen and label each field? Can you read a token-response JSON and explain what each key is? Can you read RFC 6749 §4.1 and walk the diagram?

---

## 9. References

- RFC 6749 — OAuth 2.0 Authorization Framework. <https://datatracker.ietf.org/doc/html/rfc6749>
- RFC 6750 — Bearer Token Usage. <https://datatracker.ietf.org/doc/html/rfc6750>
- OAuth 2.1 (draft). <https://datatracker.ietf.org/doc/draft-ietf-oauth-v2-1/>
- OpenID Connect Core 1.0. <https://openid.net/specs/openid-connect-core-1_0.html>
- OpenID Connect Discovery 1.0. <https://openid.net/specs/openid-connect-discovery-1_0.html>
- RFC 9700 — OAuth 2.0 Security Best Current Practice. <https://www.rfc-editor.org/rfc/rfc9700.html>
- OAuth.com — Aaron Parecki's plain-English walk-through. <https://www.oauth.com/>
- Keycloak Server Administration Guide. <https://www.keycloak.org/docs/latest/server_admin/>
- OWASP Authentication Cheat Sheet. <https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html>
