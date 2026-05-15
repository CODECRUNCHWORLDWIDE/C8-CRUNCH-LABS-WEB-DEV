# Exercise 3 — A Protected React Route

> Wire a React Router route that requires authentication. Unauthenticated users are redirected to the IdP's authorize endpoint; after login they return to the originally-requested page. This is the smallest piece of UI authentication you can build correctly, and it is the pattern every SPA repeats once per protected area.

**Estimated time:** 75 minutes.
**Starter file:** [`starter-protected-route.jsx`](./starter-protected-route.jsx).
**Realm:** the same `crunch` realm from Exercise 2 — leave Keycloak running.

---

## What you will build

A small React + Vite SPA with three routes:

- `/` — public, shows a "Sign In" button.
- `/profile` — protected; shows the authenticated user's claims.
- `/callback` — the OIDC redirect URI; parses the auth-code response and stores tokens.

The starter has the routing skeleton, an `<App />` component with `BrowserRouter`, and a stub `<ProtectedRoute />` component you will implement. You will use `oidc-client-ts` for the auth library.

---

## Prerequisites

- Keycloak running with the `crunch` realm (from Exercise 2 — leave it running).
- Node 20+ and npm 10+.

---

## Step 1 — Bootstrap the project

In a new directory:

```bash
npm create vite@latest auth-exercise -- --template react
cd auth-exercise
npm install
npm install react-router-dom oidc-client-ts
```

Replace `src/App.jsx` with the contents of `starter-protected-route.jsx`. Replace `src/main.jsx` with the standard Vite bootstrap (no changes needed). Confirm the dev server runs:

```bash
npm run dev
```

The Vite default port is 5173. Open <http://localhost:5173/>. You should see the starter's home page with a "Sign In" button.

---

## Step 2 — Configure the `UserManager`

The `oidc-client-ts` library's central object is `UserManager`. Add a file `src/auth.js`:

```javascript
import { UserManager, WebStorageStateStore } from 'oidc-client-ts';

const config = {
  authority: 'http://localhost:8080/realms/crunch',
  client_id: 'spa-client',
  redirect_uri: 'http://localhost:5173/callback',
  post_logout_redirect_uri: 'http://localhost:5173/',
  response_type: 'code',
  scope: 'openid profile email',
  loadUserInfo: true,
  userStore: new WebStorageStateStore({ store: window.sessionStorage }),
  stateStore: new WebStorageStateStore({ store: window.sessionStorage }),
};

export const userManager = new UserManager(config);
```

A few things to notice:

- The `authority` is the realm URL. `oidc-client-ts` fetches the discovery document from `${authority}/.well-known/openid-configuration` automatically.
- `response_type: 'code'` selects the authorization-code flow. PKCE is enabled by default for public clients.
- `userStore` and `stateStore` use `sessionStorage`. This is the learning-context choice; production would prefer in-memory + httpOnly-cookie storage via a backend.

---

## Step 3 — Wire the callback route

Add a `<Callback />` component:

```jsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { userManager } from './auth';

export function Callback() {
  const navigate = useNavigate();
  const [error, setError] = useState(null);

  useEffect(() => {
    userManager.signinRedirectCallback()
      .then((user) => {
        navigate('/profile', { replace: true });
      })
      .catch((err) => {
        setError(err.message);
      });
  }, [navigate]);

  if (error) return <p>Sign-in failed: {error}</p>;
  return <p>Signing you in…</p>;
}
```

`signinRedirectCallback` reads the `code` and `state` from the URL, verifies `state` against what `oidc-client-ts` stashed before the redirect, POSTs to the token endpoint with `code_verifier`, validates the ID token, and stores the resulting user object in `sessionStorage`.

---

## Step 4 — Implement `<ProtectedRoute />`

The component the starter stubs:

```jsx
import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { userManager } from './auth';

export function ProtectedRoute({ children }) {
  const [user, setUser] = useState(undefined);  // undefined = loading
  const location = useLocation();

  useEffect(() => {
    userManager.getUser().then((u) => {
      if (u && !u.expired) {
        setUser(u);
      } else {
        userManager.signinRedirect({
          state: { returnTo: location.pathname + location.search },
        });
      }
    });
  }, [location.pathname, location.search]);

  if (user === undefined) return <p>Checking auth…</p>;
  return children;
}
```

Notes:

- `getUser()` returns the cached user object, or `null` if not signed in.
- We check `u.expired` because a stale session-storage entry might be present but expired; treat that as unauthenticated.
- `signinRedirect` initiates the flow. We pass `state: { returnTo: ... }` so the callback can navigate back to the originally-requested URL.
- The redirect navigates away; the `<p>Checking auth…</p>` fallback is never visible for long.

---

## Step 5 — Update the callback to honor `returnTo`

Tweak `<Callback />` to navigate back to `state.returnTo` if present:

```jsx
userManager.signinRedirectCallback()
  .then((user) => {
    const returnTo = user.state?.returnTo || '/profile';
    navigate(returnTo, { replace: true });
  })
  .catch((err) => { setError(err.message); });
```

Now if an unauthenticated user tries to visit `/profile/orders/42`, they are redirected to the IdP, log in, and are sent back to `/profile/orders/42` instead of the default `/profile`.

---

## Step 6 — The Profile route

```jsx
import { useEffect, useState } from 'react';
import { userManager } from './auth';

export function Profile() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    userManager.getUser().then(setUser);
  }, []);

  if (!user) return <p>Loading…</p>;

  return (
    <section>
      <h1>Hello, {user.profile.preferred_username}</h1>
      <p>Subject (stable user ID): <code>{user.profile.sub}</code></p>
      <p>Email: {user.profile.email}</p>
      <p>Issued at: {new Date(user.profile.iat * 1000).toISOString()}</p>
      <p>Access token expires: {new Date(user.expires_at * 1000).toISOString()}</p>
      <button onClick={() => userManager.signoutRedirect()}>Sign out</button>
      <details>
        <summary>Full ID token claims</summary>
        <pre>{JSON.stringify(user.profile, null, 2)}</pre>
      </details>
    </section>
  );
}
```

---

## Step 7 — Wire the routes

Your `<App />` should look like:

```jsx
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { Home } from './Home';
import { Profile } from './Profile';
import { Callback } from './Callback';
import { ProtectedRoute } from './ProtectedRoute';

export default function App() {
  return (
    <BrowserRouter>
      <nav>
        <Link to="/">Home</Link> | <Link to="/profile">Profile</Link>
      </nav>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/callback" element={<Callback />} />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
```

---

## Step 8 — Register the redirect URI in Keycloak

If you started with the seed realm from Exercise 2, the `spa-client` already has `http://localhost:5173/callback` registered. Confirm in the admin console: Clients → `spa-client` → Valid redirect URIs.

If you do not see it, add it. **Exact-string match is enforced** (per OAuth 2.1 §1.5); any mismatch yields an `invalid_redirect_uri` error.

---

## Step 9 — Test the flow

1. Open <http://localhost:5173/> in a private/incognito window (so you start unauthenticated).
2. Click "Profile" in the nav. You should be redirected to Keycloak.
3. Log in as `alice` / `alice-password`.
4. You should be redirected back to `/profile`, which displays your claims.
5. Click "Sign Out." You should be redirected to Keycloak's logout, which then redirects back to `/`.
6. Click "Profile" again. You should be sent back to Keycloak's login page — proof that logout cleared the IdP session, not just the local state.

---

## Step 10 — Add silent renewal

The access token expires in 5 minutes (the seed realm's setting). For a real app, you want this renewed silently before it expires so users do not get logged out mid-session.

`oidc-client-ts` supports this via `automaticSilentRenew`. Update the config:

```javascript
const config = {
  // ... previous fields ...
  automaticSilentRenew: true,
  silentRequestTimeoutInSeconds: 10,
};
```

The library uses a hidden iframe to repeat the auth-code flow without user interaction (an `id_token` from Keycloak's cookie session is sufficient). When the access token approaches expiration, the library renews; the next API call uses the new token.

For the iframe path to work, you need a `silent-renew.html` page that calls `userManager.signinSilentCallback()` and lives at a known URL. Add to the project:

`public/silent-renew.html`:

```html
<!doctype html>
<html><head><title>Silent renew</title></head>
<body>
<script type="module">
  import { UserManager } from 'https://esm.sh/oidc-client-ts';
  // The UserManager defaults are sufficient for the iframe callback
  new UserManager({}).signinSilentCallback().catch(console.error);
</script>
</body></html>
```

Set `silent_redirect_uri: 'http://localhost:5173/silent-renew.html'` in the config and register it in Keycloak.

For the exercise, getting silent renewal to work is optional. The reference solution shows the full setup.

---

## How to know you are done

You can:

- Visit `/profile` while unauthenticated and be redirected to Keycloak.
- Log in and be returned to `/profile`.
- See the ID token claims rendered.
- Sign out and have it terminate the Keycloak session, not just local state.
- (Bonus) Have the access token renew silently after 5 minutes.

Compare your code to `SOLUTIONS.md` once you have it working.

---

## What you learned

1. A protected route is a wrapper component that, on mount, checks for a valid user and either renders the children or initiates a sign-in redirect.
2. The "return to original URL after login" pattern uses the OIDC `state` parameter to round-trip the requested path through the IdP.
3. Logout is two-phase: clear local state, then redirect to the IdP's `end_session_endpoint`. Skipping the second phase leaves the IdP session alive.
4. Silent renewal lets the access token refresh without user interaction, via a hidden iframe that re-runs the auth-code flow against an existing IdP session.

---

## References

- React Router — `<Routes>` and protected routes. <https://reactrouter.com/>
- `oidc-client-ts` — `UserManager` API. <https://authts.github.io/oidc-client-ts/classes/UserManager.html>
- OIDC Core §3.1 — Authorization Code Flow. <https://openid.net/specs/openid-connect-core-1_0.html#CodeFlowAuth>
- OIDC Session Management 1.0 — Silent renewal. <https://openid.net/specs/openid-connect-session-1_0.html>
- Keycloak Securing Apps — OIDC. <https://www.keycloak.org/docs/latest/securing_apps/#_javascript_adapter>
