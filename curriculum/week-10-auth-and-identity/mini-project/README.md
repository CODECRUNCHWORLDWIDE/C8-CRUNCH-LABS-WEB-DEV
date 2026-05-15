# Week 10 — Mini-Project: Crunch Auth, End to End

> The week's deliverable. You will assemble a React SPA that signs users in via the OAuth 2.0 authorization-code flow with PKCE against a local Keycloak instance, displays the authenticated user's ID-token claims, calls a protected API with a Bearer access token, refreshes the access token silently before it expires, rotates the refresh token on every use, and logs out cleanly. The starter folder contains the Keycloak `docker-compose.yml`, a seeded realm export, and a Vite-bootstrapped React project with stubs. By Sunday the entire flow works in a private browser window with one click on "Sign In."

---

## The brief

The `starter/` folder contains:

- A `docker-compose.yml` that brings up Keycloak 25 on port 8080 with the `crunch` realm pre-imported.
- A `keycloak/realm-export.json` describing one client (`spa-client`, public, PKCE required) and one user (`alice` / `alice-password`).
- A `package.json` listing React, Vite, `oidc-client-ts`, `jose`, and `react-router-dom`.
- A `vite.config.js` pinning the dev server to port 5173.
- An `index.html` Vite entry.
- A `src/` directory with stub files for the SPA — `main.jsx`, `App.jsx`, `auth.js`, `api.js`.
- A `rubric.md` with the grading criteria.

Your job is to fill the stubs and make the flow work. The expected behavior, in order:

1. User opens the SPA at `http://localhost:5173/`.
2. User clicks "Sign In."
3. Browser is redirected to Keycloak.
4. User logs in as `alice` / `alice-password`.
5. (On first login) Keycloak prompts the user to configure TOTP. User scans the QR code with FreeOTP / Aegis / Authy / Google Authenticator. User enters the current 6-digit code.
6. Keycloak redirects back to `http://localhost:5173/callback`.
7. The SPA exchanges the code at the token endpoint and stores the user.
8. The SPA navigates to `/profile`, which displays the ID-token claims.
9. The SPA fetches `http://localhost:3001/api/me` with `Authorization: Bearer <access_token>`. The mock resource server (a 50-line Express stub described in this README §4) returns the verified claims.
10. After 5 minutes (the realm's access-token lifespan), the SPA silently renews the access token. The user does not notice.
11. User clicks "Sign Out." Browser is redirected to Keycloak's `end_session_endpoint`, then back to `/`.
12. User clicks "Sign In" again. Keycloak prompts for credentials (proof that step 11 actually logged the user out at the IdP, not just locally).

---

## Setup

```bash
cd starter
docker compose up -d         # Keycloak on :8080
# Wait for it to be ready (about 30 seconds)
# Verify by hitting http://localhost:8080/

npm install                  # Vite + React + libraries
npm run dev                  # SPA on :5173
```

In a separate terminal, run the mock resource server (see §4):

```bash
node resource-server.js      # Express on :3001
```

Open `http://localhost:5173/` in a private/incognito browser window.

---

## What you will fill in

Each stub file has comments marking the sections to implement.

### `src/auth.js` — `UserManager` configuration

The single file you spend the most time in. Configure:

- `authority: 'http://localhost:8080/realms/crunch'`
- `client_id: 'spa-client'`
- `redirect_uri: 'http://localhost:5173/callback'`
- `post_logout_redirect_uri: 'http://localhost:5173/'`
- `response_type: 'code'`
- `scope: 'openid profile email'`
- `automaticSilentRenew: true`
- `silent_redirect_uri: 'http://localhost:5173/silent-renew.html'`

Plus the user-store and state-store configuration. Plus event handlers — `addAccessTokenExpiring`, `addUserSignedOut` — that log to the console so you can verify silent-renew is firing.

### `src/api.js` — the Bearer-token fetch wrapper

A small utility:

```javascript
import { userManager } from './auth';

export async function apiFetch(url, options = {}) {
  const user = await userManager.getUser();
  if (!user || user.expired) {
    throw new Error('Not authenticated');
  }
  const headers = {
    ...options.headers,
    Authorization: `Bearer ${user.access_token}`,
  };
  return fetch(url, { ...options, headers });
}
```

Test it on the `/api/me` route.

### `src/App.jsx` — routes and the protected wrapper

Three routes — `/`, `/callback`, `/profile`. The `<ProtectedRoute>` wrapper for `/profile`. The "Sign In" button on `/`. The "Sign Out" button on `/profile`.

Reuse the protected-route pattern from Exercise 3.

### `public/silent-renew.html` — the iframe target

Standalone HTML page that runs `userManager.signinSilentCallback()` inside a hidden iframe. The `oidc-client-ts` library uses this to silently renew the access token.

---

## The mock resource server

A 50-line Express server that verifies the Bearer token and echoes the verified claims. Create `starter/resource-server.js`:

```javascript
import express from 'express';
import cors from 'cors';
import { jwtVerify, createRemoteJWKSet } from 'jose';

const ISSUER = 'http://localhost:8080/realms/crunch';
const JWKS = createRemoteJWKSet(new URL(`${ISSUER}/protocol/openid-connect/certs`));

const app = express();
app.use(cors({ origin: 'http://localhost:5173' }));

app.get('/api/me', async (req, res) => {
  const auth = req.header('Authorization') || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'missing bearer' });

  try {
    const { payload } = await jwtVerify(token, JWKS, {
      issuer: ISSUER,
      audience: 'account',     // Keycloak's default access-token audience
      algorithms: ['RS256'],
      clockTolerance: 5,
    });
    res.json({
      sub: payload.sub,
      email: payload.email,
      preferred_username: payload.preferred_username,
      exp: payload.exp,
    });
  } catch (err) {
    res.status(401).json({ error: err.message });
  }
});

const port = 3001;
app.listen(port, () => console.log(`Resource server on :${port}`));
```

You will need to `npm install express cors jose` in the starter folder (or in a separate folder if you prefer to keep the SPA and the server in separate `node_modules`). The starter `package.json` already lists these.

---

## TOTP enrollment

The seed realm sets the `CONFIGURE_TOTP` required action for the user `alice`. On the first login, Keycloak prompts to scan a QR code. To complete enrollment:

1. Install a TOTP app on your phone: FreeOTP (open source, Red Hat-maintained), Aegis (open source, Android), or Google Authenticator / Authy (proprietary).
2. Scan the QR code displayed by Keycloak.
3. Enter the current 6-digit code.
4. Subsequent logins will require both the password and the current TOTP code.

If you want to **skip TOTP for development**, you can edit the realm export to remove the `CONFIGURE_TOTP` required action before importing, or delete it from the user in the admin console (Users → alice → Credentials → delete the OTP credential).

The rubric expects you to enable TOTP, demonstrate enrollment, and provide a screenshot of the QR-code page in your submission.

---

## What you submit

A folder structure:

```text
submission/
├── README.md          # Your top-level project README, see §below
├── starter/           # The whole starter directory, with your code
│   ├── docker-compose.yml
│   ├── keycloak/realm-export.json
│   ├── package.json
│   ├── vite.config.js
│   ├── index.html
│   ├── src/
│   │   ├── main.jsx
│   │   ├── App.jsx
│   │   ├── auth.js
│   │   ├── api.js
│   │   ├── Home.jsx
│   │   ├── Callback.jsx
│   │   ├── ProtectedRoute.jsx
│   │   └── Profile.jsx
│   ├── public/silent-renew.html
│   └── resource-server.js
└── screenshots/
    ├── 01-login.png           # The Keycloak login page
    ├── 02-totp-enrollment.png # The QR-code page
    ├── 03-profile.png         # Your profile route after login
    ├── 04-network.png         # DevTools Network tab showing the /token call
    ├── 05-silent-renew.png    # DevTools Network tab showing a silent renew
    └── 06-logout.png          # Keycloak's logout page during sign-out
```

Your top-level `README.md` should:

1. Describe the architecture in the language of the specs. ("The SPA acts as a public client; per OAuth 2.1 it uses the authorization-code grant with PKCE …")
2. Walk the flow with the eight HTTP messages, citing the spec sections.
3. Describe each fix or implementation decision (token storage, silent-renew config, audience selection) with a short rationale.
4. List the spec citations: RFC 6749 §4.1, RFC 7519 §4.1, RFC 7636 §4.2, OIDC Core 1.0 §3.1, RFC 9700 §4.14, and at least one OWASP cheat sheet URL.

A passing submission has all the screenshots, a working flow, and the citations in the README. A high-passing submission includes a paragraph in the README about token storage trade-offs (why you used `sessionStorage` here, why a production deployment would prefer the BFF pattern).

---

## Grading

See `starter/rubric.md` for the full rubric. The headline weights:

- Working auth-code-with-PKCE flow: 30%
- Working silent-renew: 15%
- Working sign-out (verifies at IdP, not just local): 10%
- Mock resource server verifies the access token correctly: 15%
- README describes the flow in spec-vocabulary with citations: 20%
- TOTP enrolled and screenshot: 10%

---

## Common pitfalls

1. **Redirect URI mismatch.** Keycloak enforces exact-string match on `redirect_uri`. If you change the SPA port or the callback path, update the realm export or the admin console.
2. **CORS errors on `/api/me`.** The resource server must allow `http://localhost:5173`. The example uses `cors({ origin: 'http://localhost:5173' })`.
3. **`invalid_grant: code not valid` on the second exchange.** Authorization codes are single-use. The most common cause is React's StrictMode double-rendering the callback effect; the second invocation tries to exchange a code that has already been used. Either disable StrictMode for the callback route, or use the `oidc-client-ts` library's de-duplication helpers.
4. **Silent renew fires every second.** The library's renewal threshold is by default 60 seconds before expiry. If your access tokens expire in 5 minutes, you should see one renew every ~4 minutes. If you see one every second, something is wrong with the callback handling.
5. **`aud` validation fails on `/api/me`.** Keycloak's default access-token audience is `account`, not the client ID. The resource server example accepts that audience; if you customize the realm's token mapper to set a different audience, update the verifier.

---

## What you learned by Sunday

By submitting this mini-project you will have:

- Walked the entire authorization-code-with-PKCE flow against a real OIDC provider.
- Verified an access token at a resource server using a JWKS endpoint and an algorithm allowlist.
- Implemented silent renewal with a hidden iframe.
- Implemented IdP-side logout, not just local-state clearing.
- Enrolled in TOTP and used it as a second factor.
- Read enough of `oidc-client-ts` to know what it does at each step.
- Written a README that describes your auth layer in the language of the IETF specs.

That is the working knowledge expected of a junior-to-mid engineer working on a SPA's authentication layer in 2026. Future weeks build on it.

---

## References

- RFC 6749 — OAuth 2.0. <https://datatracker.ietf.org/doc/html/rfc6749>
- RFC 7519 — JWT. <https://datatracker.ietf.org/doc/html/rfc7519>
- RFC 7636 — PKCE. <https://datatracker.ietf.org/doc/html/rfc7636>
- RFC 9700 — OAuth Security BCP. <https://www.rfc-editor.org/rfc/rfc9700.html>
- OIDC Core 1.0. <https://openid.net/specs/openid-connect-core-1_0.html>
- OWASP Authentication Cheat Sheet. <https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html>
- Keycloak Server Administration Guide. <https://www.keycloak.org/docs/latest/server_admin/>
- `oidc-client-ts`. <https://github.com/authts/oidc-client-ts>
