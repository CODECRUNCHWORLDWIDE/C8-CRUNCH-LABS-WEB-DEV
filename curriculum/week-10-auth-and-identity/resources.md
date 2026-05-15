# Week 10 — Resources

> The curated reference list for authentication and identity on the web. The first section, **Required reading**, is the small stack of specs and cheat sheets the lectures cite by name; the rest is depth and breadth. Every link here is free and stable.

---

## Required reading

These are the documents the lectures, exercises, challenges, and mini-project cite directly. If you read only six things this week, read these six.

1. **RFC 6749 — The OAuth 2.0 Authorization Framework.** <https://datatracker.ietf.org/doc/html/rfc6749>. The base spec. §1.2 walks the protocol roles (resource owner, client, resource server, authorization server). §1.3 enumerates the four grant types. §4 defines each grant type in detail. §10 is security considerations. About 75 pages; read §1, §3, §4.1 (authorization code grant), §10. Skip §4.2 (implicit) on first pass — it is deprecated.
2. **RFC 7519 — JSON Web Token (JWT).** <https://datatracker.ietf.org/doc/html/rfc7519>. The token format. §3 walks the JWT structure (three base64url segments). §4 enumerates the registered claims (`iss`, `sub`, `aud`, `exp`, `nbf`, `iat`, `jti`). §10 is security considerations. About 30 pages; read end to end at least once.
3. **RFC 7636 — Proof Key for Code Exchange.** <https://datatracker.ietf.org/doc/html/rfc7636>. The PKCE extension that makes the authorization-code flow safe for public clients. §4 has the protocol details — verifier generation, challenge derivation, the `S256` method. §7 is security considerations. About 22 pages; read all of it.
4. **OpenID Connect Core 1.0.** <https://openid.net/specs/openid-connect-core-1_0.html>. The identity layer on top of OAuth. §2 defines the ID Token. §3.1 walks the Authorization Code Flow with all the OIDC-specific parameters (`nonce`, `response_type=code`, scope `openid`). §5 is standard claims. §15 is the discovery document.
5. **RFC 9700 — OAuth 2.0 Security Best Current Practice.** <https://www.rfc-editor.org/rfc/rfc9700.html>. The IETF's distilled "we have learned these the hard way" document. §2.1 is the public-client model. §4.10 is redirect-URI validation. §4.14 is refresh-token rotation. §4.16 is token storage. Required reading before you ship to production.
6. **OWASP Authentication Cheat Sheet.** <https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html>. The practitioner's anti-pattern list. Read the "User IDs," "Password Strength," "Multi-Factor Authentication," and "Session Management" sections. The "JSON Web Token for Java" cheat sheet at <https://cheatsheetseries.owasp.org/cheatsheets/JSON_Web_Token_for_Java_Cheat_Sheet.html> is language-neutral despite the title and is the JWT-specific companion.

---

## OAuth and OIDC — supplementary specs

The IETF and OpenID Foundation have published a long tail of specs around the core OAuth 2.0 framework. You do not need to read these top to bottom; bookmark them for when a specific situation arises.

- **OAuth 2.1 draft.** <https://datatracker.ietf.org/doc/draft-ietf-oauth-v2-1/>. The consolidation of OAuth 2.0 + accumulated security guidance. Read the introduction (§1) for the "what changed and why" summary. The full draft folds in PKCE, refresh-token rotation, removal of the implicit and password grants, and exact-string redirect-URI matching.
- **RFC 6750 — The OAuth 2.0 Authorization Framework: Bearer Token Usage.** <https://datatracker.ietf.org/doc/html/rfc6750>. The `Authorization: Bearer <token>` header convention. Short — about 18 pages.
- **RFC 7515 — JSON Web Signature (JWS).** <https://datatracker.ietf.org/doc/html/rfc7515>. The signature layer underneath JWT. JWT is a JWS with a JSON payload of claims. §3 is the compact serialization, which is what you see when you read a JWT.
- **RFC 7516 — JSON Web Encryption (JWE).** <https://datatracker.ietf.org/doc/html/rfc7516>. If you actually need an encrypted (not just signed) token. Most people do not.
- **RFC 7517 — JSON Web Key (JWK).** <https://datatracker.ietf.org/doc/html/rfc7517>. The JSON representation of a cryptographic key. The JWKS endpoint returns a JSON document conforming to this spec.
- **RFC 7518 — JSON Web Algorithms (JWA).** <https://datatracker.ietf.org/doc/html/rfc7518>. The list of permitted `alg` values: `HS256`, `RS256`, `ES256`, `PS256`, `none`. Bookmark §3 (table of algorithms) and §3.1 (alg registry).
- **RFC 7591 — OAuth 2.0 Dynamic Client Registration Protocol.** <https://datatracker.ietf.org/doc/html/rfc7591>. How a client registers itself with the authorization server automatically.
- **RFC 7662 — OAuth 2.0 Token Introspection.** <https://datatracker.ietf.org/doc/html/rfc7662>. The `/introspect` endpoint — let the resource server ask the authorization server "is this opaque token still valid?" Useful when you do not want to use JWTs for access tokens.
- **RFC 8414 — OAuth 2.0 Authorization Server Metadata.** <https://datatracker.ietf.org/doc/html/rfc8414>. The OAuth equivalent of the OIDC discovery document.
- **RFC 8628 — OAuth 2.0 Device Authorization Grant.** <https://datatracker.ietf.org/doc/html/rfc8628>. The flow used by smart TVs, CLI tools, and other input-constrained devices.
- **RFC 9068 — JSON Web Token (JWT) Profile for OAuth 2.0 Access Tokens.** <https://datatracker.ietf.org/doc/html/rfc9068>. When the access token is itself a JWT, this is the profile it should follow.
- **RFC 9449 — OAuth 2.0 Demonstrating Proof of Possession (DPoP).** <https://datatracker.ietf.org/doc/html/rfc9449>. A binding mechanism so that a stolen access token cannot be replayed from a different client. The future of high-value tokens.
- **OIDC Discovery 1.0.** <https://openid.net/specs/openid-connect-discovery-1_0.html>. The full spec for the `/.well-known/openid-configuration` document.
- **OIDC Front-Channel Logout 1.0.** <https://openid.net/specs/openid-connect-frontchannel-1_0.html>. How to log out of an SSO session across multiple relying parties.
- **OIDC Back-Channel Logout 1.0.** <https://openid.net/specs/openid-connect-backchannel-1_0.html>. The server-to-server logout signal.

---

## TOTP and MFA

- **RFC 6238 — TOTP: Time-Based One-Time Password Algorithm.** <https://www.rfc-editor.org/rfc/rfc6238.html>. The 6-digit code your authenticator app produces every 30 seconds. About 16 pages; read §4 for the algorithm and §5 for the reference implementation.
- **RFC 4226 — HOTP: An HMAC-Based One-Time Password Algorithm.** <https://www.rfc-editor.org/rfc/rfc4226.html>. The counter-based predecessor TOTP is built on.
- **WebAuthn Level 2.** <https://www.w3.org/TR/webauthn-2/>. The browser API behind passkeys. Long, but §1 is a readable overview. We cover this in C13.
- **FIDO Alliance — Passkeys overview.** <https://fidoalliance.org/passkeys/>. The marketing-but-still-technical introduction.

---

## OWASP — the practitioner's cheat sheets

The OWASP Cheat Sheet Series is the single best free reference for the security side of every web feature. Bookmark the index at <https://cheatsheetseries.owasp.org/>.

- **Authentication Cheat Sheet.** <https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html>.
- **JSON Web Token Cheat Sheet for Java.** <https://cheatsheetseries.owasp.org/cheatsheets/JSON_Web_Token_for_Java_Cheat_Sheet.html>. Language-neutral guidance despite the title.
- **Session Management Cheat Sheet.** <https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html>. Read alongside the auth cheat sheet; sessions and tokens are sibling problems.
- **Password Storage Cheat Sheet.** <https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html>. Argon2id, bcrypt, scrypt — the modern defaults.
- **Cross-Site Request Forgery Prevention Cheat Sheet.** <https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html>. The companion problem to session cookies.
- **OAuth 2.0 Protocol Cheatsheet** (community-maintained, not yet in the official series): <https://owasp.org/www-chapter-london/assets/slides/OWASP-OAuth2.pdf>.

---

## Keycloak

The week's primary self-hosted provider. Documentation is comprehensive and free.

- **Server Administration Guide.** <https://www.keycloak.org/docs/latest/server_admin/>. The book-length admin reference. Read the "Realms" and "Clients" sections first.
- **Server Developer Guide.** <https://www.keycloak.org/docs/latest/server_development/>. SPI extensions, custom authenticators, themes. You will not need this in W10 but bookmark it.
- **Securing Applications and Services Guide.** <https://www.keycloak.org/docs/latest/securing_apps/>. The client-integration guide. The "OpenID Connect" chapter is exactly the protocol the SPA mini-project uses.
- **Keycloak on GitHub.** <https://github.com/keycloak/keycloak>. The source. The Java is approachable; the JavaScript-adapter source under `/js/` is short and worth reading.
- **Getting Started — Docker.** <https://www.keycloak.org/getting-started/getting-started-docker>. The five-minute quickstart the mini-project's `docker-compose.yml` is adapted from.
- **Keycloak Quickstarts** (sample apps in many languages): <https://github.com/keycloak/keycloak-quickstarts>.

---

## Other self-hosted OIDC providers (free, open-source)

For when Keycloak is more than you need or when you want a second opinion.

- **Authelia.** <https://www.authelia.com/>. Lightweight Go-based authentication server, designed to sit behind a reverse proxy (Traefik, Nginx, Caddy). Excellent for homelabs and small-team SSO. Limited OAuth — geared toward forward-auth.
- **Authentik.** <https://goauthentik.io/>. Python-based, friendlier UI than Keycloak, full OIDC + SAML support. The "Keycloak you might actually enjoy administering." Active development.
- **Zitadel.** <https://zitadel.com/>. Go-based, multi-tenant by design, modern admin UI, generous open-source license. Hosted SaaS available; self-hosted is free.
- **ORY Hydra.** <https://www.ory.sh/hydra/>. Pure OAuth 2.0 + OIDC server in Go. Headless — pair with ORY Kratos for the identity-and-login UI. Modular and very compliant with the specs.
- **GlAuth.** <https://glauth.github.io/>. Lightweight LDAP server, often paired with Authelia. Mentioned here for completeness; not OIDC.
- **Casdoor.** <https://casdoor.org/>. Newer entrant, OIDC + CAS + SAML, friendly UI.

---

## Managed identity providers (survey)

For when running a Docker container is more than you want to take on. All have free tiers usable for student projects.

- **Auth0** (Okta-owned). <https://auth0.com/>. Generous free tier (7,500 active users). Excellent documentation at <https://auth0.com/docs>. The widely-recommended "start here" for managed OIDC.
- **Clerk.** <https://clerk.com/>. React-first developer experience, drop-in `<SignIn />` widget. Free tier suitable for student work. Documentation at <https://clerk.com/docs>.
- **Supabase Auth.** <https://supabase.com/auth>. Postgres-backed, OIDC plus magic links plus social logins. Free tier generous. Documentation at <https://supabase.com/docs/guides/auth>.
- **AWS Cognito.** <https://aws.amazon.com/cognito/>. Lowest cost at scale, less pleasant DX. Documentation at <https://docs.aws.amazon.com/cognito/>.
- **Azure AD B2C** (now Entra External ID). <https://learn.microsoft.com/en-us/azure/active-directory-b2c/>. Enterprise default, complex.
- **Okta** (the parent of Auth0). <https://www.okta.com/>. Enterprise-grade, expensive, the SAML-and-OIDC pillar of corporate SSO.
- **Google Identity Platform** (the rebranded Firebase Auth). <https://cloud.google.com/identity-platform>. Generous free tier, OIDC + social logins.
- **FusionAuth.** <https://fusionauth.io/>. The interesting hybrid — free self-hosted edition, paid hosted edition, full OIDC. Worth considering for the dual deployment model.

---

## Books

Authentication is a topic where books help. Two recommendations:

- **"OAuth 2 in Action" — Justin Richer and Antonio Sanso.** Manning, 2017. Co-authored by an editor of OAuth 2.1. The clearest book-length treatment of the flows and their security properties. Used copies are inexpensive.
- **"API Security in Action" — Neil Madden.** Manning, 2020. Broader than OAuth — covers TLS, rate limiting, OAuth, OpenID, macaroons, and capabilities. The single best modern reference for API auth.

---

## Blogs and long-form articles

- **Aaron Parecki — "OAuth 2.0 Simplified."** <https://www.oauth.com/>. Free book, also published as a paperback. Aaron co-edits OAuth 2.1; the writing is the practitioner's view of the spec. Start at <https://www.oauth.com/oauth2-servers/single-page-apps/> for the SPA-specific guidance.
- **Aaron Parecki — "OAuth: When to use which flow?"** <https://aaronparecki.com/oauth-2-simplified/>. A one-page decision tree.
- **the0xacid — "An Illustrated Guide to OAuth and OpenID Connect."** Posted on the Okta blog: <https://developer.okta.com/blog/2019/10/21/illustrated-guide-to-oauth-and-oidc>. Diagrams that are actually worth printing out.
- **Auth0 — "JWT Handbook."** <https://auth0.com/resources/ebooks/jwt-handbook>. Free PDF. Excellent on signature mechanics.
- **Auth0 — "Refresh Token Rotation."** <https://auth0.com/docs/secure/tokens/refresh-tokens/refresh-token-rotation>. The single best practical walk-through of the rotation pattern.
- **PortSwigger Web Security Academy — JWT attacks.** <https://portswigger.net/web-security/jwt>. Hands-on labs for the historic JWT attacks (`alg: none`, algorithm confusion, weak HS256 keys). The labs are free; do at least the first three.
- **Curity — "Token Best Practices."** <https://curity.io/resources/learn/token-best-practices/>. Vendor-authored but spec-faithful.
- **Pragmatic Web Security — "The State of JWTs."** <https://pragmaticwebsecurity.com/articles/apisecurity/state-of-jwts.html>. The "should we even use JWTs?" debate, summarized fairly.

---

## React + OIDC libraries

- **`oidc-client-ts`.** <https://github.com/authts/oidc-client-ts>. The community fork of the deprecated `oidc-client` library. The mini-project uses this. Source is approachable; read `UserManager.ts` and `SigninRequest.ts`.
- **`react-oidc-context`.** <https://github.com/authts/react-oidc-context>. The React-bindings layer on top of `oidc-client-ts`. Provides `<AuthProvider>` and `useAuth()`.
- **`jose`.** <https://github.com/panva/jose>. Filip Skokan's JOSE library — JWT, JWS, JWE, JWK in one package. The de-facto Node/Browser standard. We use it for verification in the exercises.
- **`jsrsasign`.** <https://github.com/kjur/jsrsasign>. Older alternative to `jose`; mentioned for completeness.
- **`@auth0/auth0-react`.** <https://github.com/auth0/auth0-react>. The Auth0-specific React SDK. Worth reading even if you do not use Auth0 — it is a clean reference implementation of the patterns.
- **`@clerk/clerk-react`.** <https://github.com/clerk/javascript>. The Clerk React SDK. Optimized for developer experience; the drop-in widget approach.

---

## Debuggers and test tools

- **jwt.io.** <https://jwt.io/>. Paste a JWT, see the decoded header and payload, verify against a key. The "what does this token contain?" tool you will use every day for the rest of your career.
- **token.dev.** <https://token.dev/>. A JWT debugger that does not log tokens to a server. Privacy-friendlier alternative to jwt.io.
- **OpenID Connect Playground.** <https://openidconnect.net/>. Step through a full auth-code flow against a public test IdP.
- **OAuth 2.0 Playground (Google).** <https://developers.google.com/oauthplayground/>. Walk the flow against Google's IdP with all the parameters visible.
- **`httptap`** or **`mitmproxy`.** <https://mitmproxy.org/>. When you need to actually see the network calls a library is making. Free, scriptable.
- **PortSwigger — JWT Editor (Burp extension).** Useful when you start doing real security testing.

---

## Videos and courses (free)

- **OktaDev — "OAuth and OIDC in Plain English."** <https://www.youtube.com/watch?v=996OiexHze0>. 60 minutes, by Nate Barbettini of Okta. The single best video introduction to the protocols. Watch on 1.25x.
- **DevSecCon — "The Hardest Part of OAuth: Picking the Right Flow."** Free conference talks at <https://www.devseccon.com/>.
- **Pluralsight — "OAuth 2.0 and OpenID Connect."** Free with a library card at many public libraries. The Scott Brady course is the most-recommended paid video, often free via a library.
- **Frontend Masters — "JWT, OAuth, and OpenID Connect."** Free trial covers it; otherwise priced. Optional.

---

## Where the field is going

For the curious, the next-gen specs and patterns:

- **OAuth 2.0 DPoP** (RFC 9449). <https://datatracker.ietf.org/doc/html/rfc9449>. Sender-constrained tokens — a stolen access token cannot be replayed because it is bound to a key the client proves possession of.
- **FAPI 2.0** (Financial-grade API). <https://openid.net/specs/fapi-2_0-baseline.html>. The high-security profile of OAuth used by Open Banking. Strict, but the patterns are leaking into general-purpose security.
- **Verifiable Credentials and DIDs** (W3C). <https://www.w3.org/TR/vc-data-model-2.0/>. The "decentralized identity" research direction. Long path to production but worth watching.
- **Passkeys / WebAuthn Level 3.** <https://www.w3.org/TR/webauthn-3/>. The phishing-resistant replacement for passwords. Already production-ready for many sites; will replace TOTP for most users this decade.

---

*That is the canonical list. Bookmark RFC 6749, RFC 7519, RFC 7636, and the OWASP Authentication Cheat Sheet at minimum; everything else is depth on demand.*
