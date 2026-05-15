# Week 10 — Quiz

> Ten multiple-choice questions. Answers and explanations at the bottom. Aim for 7 or above. If you score under 7, re-read the relevant lecture before moving on.

---

## Questions

**1.** Which OAuth 2.0 grant type does the OAuth 2.1 draft recommend for browser-based SPAs and mobile apps?

- A. Implicit Grant.
- B. Resource Owner Password Credentials Grant.
- C. Authorization Code Grant with PKCE.
- D. Client Credentials Grant.

**2.** What does the OpenID Connect `scope=openid` parameter cause the IdP to do?

- A. Issue an access token only — no ID token.
- B. Issue an ID Token alongside the access token.
- C. Skip user authentication entirely.
- D. Encrypt the access token.

**3.** In the PKCE flow, the `code_challenge` parameter sent in the authorization request is:

- A. The raw `code_verifier` (when `code_challenge_method=plain`).
- B. `BASE64URL(SHA256(code_verifier))` (when `code_challenge_method=S256`).
- C. An RSA signature of `code_verifier`.
- D. An HMAC of `code_verifier` keyed by the client secret.

**4.** A JSON Web Token consists of three base64url-encoded segments. The signature segment guarantees:

- A. That the payload is encrypted and unreadable to anyone but the recipient.
- B. That the payload has not been altered since the issuer signed it.
- C. That the token is short.
- D. That the token cannot be replayed.

**5.** Which of the following is the **historic** vulnerability mitigated by always specifying an `algorithms` allowlist on the verifier?

- A. SQL injection.
- B. Cross-site scripting (XSS).
- C. Algorithm confusion (HS256 / RS256 mix-up).
- D. Slowloris denial-of-service.

**6.** Which JWT claim is the **correct** stable foreign key to use when persisting a user to your database?

- A. `email`.
- B. `name`.
- C. `sub`.
- D. `preferred_username`.

**7.** Refresh-token rotation, as specified by RFC 9700 §4.14.2, requires that:

- A. The same refresh token may be used indefinitely.
- B. The authorization server issues a new refresh token on every refresh and invalidates the old one.
- C. Refresh tokens may only be used once per minute.
- D. The client must re-authenticate every time the access token expires.

**8.** Which of the following is **never** a safe value to put in a JWT claim?

- A. The user's stable ID.
- B. The user's email address.
- C. The user's plaintext password.
- D. The token's expiration timestamp.

**9.** When you decode a JWT in the browser console with `atob`, you can read the payload because:

- A. JWTs are encrypted with the user's session key, which is in `localStorage`.
- B. The payload segment is base64url-encoded JSON — encoded, but not encrypted.
- C. The browser has a hidden JWT-decoding API that bypasses encryption.
- D. The IdP includes a decryption key as the fourth segment.

**10.** Which logout step, if **omitted**, allows the next sign-in attempt to silently succeed without the user re-entering credentials?

- A. Clearing the SPA's in-memory access token.
- B. Clearing the SPA's `sessionStorage`.
- C. Redirecting to the IdP's `end_session_endpoint`.
- D. Calling `window.location.reload()`.

---

## Answer key

1. **C.** The OAuth 2.1 draft removes the Implicit and Password grants and recommends Authorization Code with PKCE as the single flow for browser-based and mobile clients. Reference: Lecture 1 §4 and §5; OAuth 2.1 draft at <https://datatracker.ietf.org/doc/draft-ietf-oauth-v2-1/>.

2. **B.** Including `openid` in the requested scopes is the trigger that turns an OAuth flow into an OIDC flow. The IdP issues an ID Token (a signed JWT describing the authenticated user) alongside the access token. Reference: Lecture 1 §6.1; OIDC Core 1.0 §3.1.

3. **B.** The `S256` method (recommended by RFC 7636 §4.2) computes `BASE64URL(SHA256(verifier))`. The `plain` method (A) is allowed by the spec but should not be used in 2026 — every modern client and IdP supports S256. Options C and D describe schemes that do not exist in PKCE. Reference: Lecture 2 §1.2.

4. **B.** A JWT's signature is a cryptographic integrity check, not an encryption mechanism. Anyone with the token can read the payload (the segments are base64url-encoded JSON, not encrypted). The signature only proves the payload has not been altered since the issuer signed it. Reference: Lecture 2 §2.1; RFC 7519 §3.

5. **C.** The HS256/RS256 algorithm-confusion attack used the issuer's RSA public key as the HMAC secret to forge tokens that some libraries would verify. Pinning the algorithm allowlist on the verifier — `algorithms: ['RS256']` — closes the attack. Reference: Lecture 2 §3.4; PortSwigger JWT labs.

6. **C.** The `sub` claim is the stable subject identifier — the user's ID at the IdP. Emails change. Usernames change. Names change. The `sub` is what you persist. Reference: Lecture 2 §2.3; OIDC Core 1.0 §5.1.

7. **B.** Rotation means every refresh issues a new refresh token and invalidates the old one. A stolen refresh token can be used at most once; the legitimate client's next refresh attempt with the old token reveals the breach. Reference: Lecture 3 §3; RFC 9700 §4.14.2.

8. **C.** JWTs are signed but not encrypted; anyone with the token reads every claim. Passwords, API keys, and session secrets must never be in a claim. Stable IDs (A), email addresses (B — though consider privacy), and expiration timestamps (D) are all safe and standard. Reference: Lecture 2 §2.6.

9. **B.** A JWT payload is base64url-encoded JSON. `atob` decodes base64; the URL-safe substitutions are simple character replacements. The protection is the signature, not opacity. Reference: Lecture 2 §2.1 and §5.

10. **C.** Clearing the SPA's local state only logs you out of the SPA. The IdP's session cookie is still valid. The next "Sign In" silently completes against the IdP's existing session. To fully sign out, you must redirect to `end_session_endpoint`, which terminates the IdP session. Reference: Lecture 3 §5.

---

## How to interpret your score

- **10/10** — Excellent. Move to the challenges and mini-project.
- **8–9/10** — Solid. Re-read the explanations for the questions you missed.
- **5–7/10** — Re-read the lecture corresponding to each wrong answer.
- **Under 5** — Re-read all three lectures from the start. The mini-project asks you to apply this vocabulary; do not push forward without it.
