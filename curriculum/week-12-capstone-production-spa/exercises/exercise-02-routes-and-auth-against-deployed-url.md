# Exercise 02 — Routes and Auth Against the Deployed URL

> *The Wednesday-and-Thursday exercise. Implement the four routes from your project brief and wire OAuth 2.1 + PKCE against a real IdP, tested against the deployed URL. Cap: 6 hours over two days.*

## Goal

By the end of this exercise:

1. The deployed SPA has four working routes from your project brief.
2. The header, navigation, and footer are consistent across routes.
3. The skip-link and the per-route `<h1>` are in place.
4. OAuth 2.1 + PKCE round-trips against a real IdP (Auth0 free tier, GitHub OAuth, or Keycloak).
5. The IdP redirect URI is configured for both `localhost:5173` and `your-spa.vercel.app`.
6. The `/profile` route shows real claims from the ID token (name, email, picture).
7. Logout works and clears the session.
8. The full flow works **on the deployed URL**, not just on localhost.

## Why two days for this

The route plumbing is straightforward — half a day. The IdP integration is where everything that can go wrong does go wrong: the redirect URI mismatch, the CORS error on the token endpoint, the silent CSP block of the IdP origin, the missing audience parameter. Reserve a full day for the auth wiring; if you finish early, you have a buffer for Friday.

## Prerequisites

- Exercise 01 complete — deploy working, headers shipped.
- A free Auth0 account (or GitHub OAuth App, or Keycloak instance).
- The W10 lecture notes open in a tab for reference.

## Part A — The four routes (3 hours, Wednesday)

### Step A1 — Install React Router

```bash
npm i react-router-dom
```

### Step A2 — Define the route module

Create `src/router.tsx`:

```tsx
import { createBrowserRouter } from "react-router-dom";
import { RootLayout } from "./components/RootLayout";
import { Home } from "./routes/Home";
import { List } from "./routes/List";
import { AddItem } from "./routes/AddItem";
import { Profile } from "./routes/Profile";
import { NotFound } from "./routes/NotFound";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    errorElement: <NotFound />,
    children: [
      { index: true, element: <Home /> },
      { path: "list", element: <List /> },
      { path: "add", element: <AddItem /> },
      { path: "profile", element: <Profile /> },
    ],
  },
]);
```

### Step A3 — Implement the `RootLayout`

Create `src/components/RootLayout.tsx`:

```tsx
import { NavLink, Outlet } from "react-router-dom";

export function RootLayout() {
  return (
    <>
      <a className="skip-link" href="#main">Skip to main content</a>
      <header>
        <div className="brand">
          <h1 className="visually-hidden">Readlist</h1>
          <NavLink to="/" className="brand-link">Readlist</NavLink>
        </div>
        <nav aria-label="Primary">
          <ul>
            <li><NavLink to="/list">Reading list</NavLink></li>
            <li><NavLink to="/add">Add</NavLink></li>
            <li><NavLink to="/profile">Profile</NavLink></li>
          </ul>
        </nav>
      </header>
      <main id="main">
        <Outlet />
      </main>
      <footer>
        <small>Built for the C8 capstone. <a href="https://github.com/your-handle/your-repo">Source</a>.</small>
      </footer>
    </>
  );
}
```

Replace "Readlist" with your project name.

### Step A4 — Implement each route

Each route file follows the same skeleton — one `<h1>`, a first paragraph, route-specific content:

```tsx
// src/routes/Home.tsx
import { useEffect } from "react";

export function Home() {
  useEffect(() => { document.title = "Readlist — home"; }, []);
  return (
    <>
      <h1>Welcome to Readlist</h1>
      <p>A personal reading queue. Save articles, tag them, mark them read, search them later.</p>
      <p>Sign in to start.</p>
    </>
  );
}
```

Repeat for `List.tsx`, `AddItem.tsx`, `Profile.tsx`, `NotFound.tsx`. Each `useEffect` sets a unique `<title>` per route (the SEO check looks for this).

### Step A5 — Mount the router

Replace the contents of `src/main.tsx`:

```tsx
import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { router } from "./router";
import "./styles/global.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
```

### Step A6 — Style the layout

Create `src/styles/global.css` with the minimum CSS to make the layout pass an accessibility scan:

```css
:root {
  --color-bg: #ffffff;
  --color-text: #111111;
  --color-link: #0552d3;
  --color-focus: #ffbf00;
  --space-1: 0.25rem;
  --space-2: 0.5rem;
  --space-3: 1rem;
  --space-4: 1.5rem;
  --space-5: 2rem;
  --max-width: 70ch;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  color-scheme: light dark;
}

* { box-sizing: border-box; }

body { margin: 0; background: var(--color-bg); color: var(--color-text); }

a { color: var(--color-link); }

a:focus-visible,
button:focus-visible,
input:focus-visible,
[tabindex]:focus-visible {
  outline: 3px solid var(--color-focus);
  outline-offset: 2px;
}

.skip-link {
  position: absolute;
  left: -9999px;
}
.skip-link:focus {
  position: static;
  display: inline-block;
  padding: var(--space-2) var(--space-3);
  background: var(--color-focus);
  color: var(--color-text);
}

.visually-hidden {
  position: absolute;
  width: 1px; height: 1px;
  padding: 0; margin: -1px;
  overflow: hidden; clip: rect(0,0,0,0);
  white-space: nowrap; border: 0;
}

header, main, footer {
  max-width: var(--max-width);
  margin: 0 auto;
  padding: var(--space-3);
}

header { display: flex; align-items: center; justify-content: space-between; }
nav ul { display: flex; gap: var(--space-3); list-style: none; padding: 0; margin: 0; }

h1 { margin-top: 0; }

@media (max-width: 600px) {
  header { flex-direction: column; gap: var(--space-2); }
}
```

### Step A7 — Deploy and verify each route

```bash
git add -A
git commit -m "feat: four routes, navigation, and base styles"
git push origin main
```

Wait for Vercel to redeploy. Visit each of `/`, `/list`, `/add`, `/profile`, and `/some-bad-path` on the **deployed URL**. Confirm each renders, each has a unique `<h1>`, and the navigation is visible on every route.

## Part B — OAuth 2.1 + PKCE against Auth0 (3 hours, Thursday)

This walks through Auth0. If you picked GitHub OAuth or Keycloak, swap the SDK but the structure is identical.

### Step B1 — Register the application on Auth0

1. Sign up at <https://auth0.com> (free tier; no credit card).
2. Dashboard → Applications → Create Application.
3. Name: `My C8 Capstone`. Type: **Single Page Application**. Click Create.
4. Go to Settings.
5. **Allowed Callback URLs** — add **both**:
   - `http://localhost:5173/callback`
   - `https://your-spa.vercel.app/callback`
6. **Allowed Logout URLs** — add **both**:
   - `http://localhost:5173`
   - `https://your-spa.vercel.app`
7. **Allowed Web Origins** — add both URLs (no path).
8. Save.
9. Copy the **Domain** and the **Client ID** — you will need them next.

### Step B2 — Set environment variables

Create `.env.example` in the repo:

```
VITE_AUTH0_DOMAIN=your-tenant.auth0.com
VITE_AUTH0_CLIENT_ID=your-client-id
VITE_AUTH0_CALLBACK=http://localhost:5173/callback
```

Copy to `.env` (which is gitignored) and fill in your real values.

In the Vercel dashboard → Project → Settings → Environment Variables:

| Name                       | Production value                        | Preview/Development     |
| -------------------------- | --------------------------------------- | ----------------------- |
| `VITE_AUTH0_DOMAIN`        | `your-tenant.auth0.com`                 | same                    |
| `VITE_AUTH0_CLIENT_ID`     | `your-client-id`                        | same                    |
| `VITE_AUTH0_CALLBACK`      | `https://your-spa.vercel.app/callback`  | `http://localhost:5173/callback` |

Save. Trigger a redeploy from the Deployments tab.

### Step B3 — Install the SDK

```bash
npm i @auth0/auth0-react
```

### Step B4 — Wrap the app in the provider

Update `src/main.tsx`:

```tsx
import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { Auth0Provider } from "@auth0/auth0-react";
import { router } from "./router";
import "./styles/global.css";

const domain = import.meta.env.VITE_AUTH0_DOMAIN;
const clientId = import.meta.env.VITE_AUTH0_CLIENT_ID;
const callback = import.meta.env.VITE_AUTH0_CALLBACK;

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Auth0Provider
      domain={domain}
      clientId={clientId}
      authorizationParams={{
        redirect_uri: callback,
      }}
      cacheLocation="memory"
      useRefreshTokens={true}
    >
      <RouterProvider router={router} />
    </Auth0Provider>
  </React.StrictMode>
);
```

`cacheLocation: "memory"` is the SDK's safest token storage — refresh tokens are in memory; the access token is fetched on demand. The trade-off is that a hard refresh requires re-authentication; the win is no XSS-exposed tokens in `localStorage`.

### Step B5 — Add a sign-in button

Update the `RootLayout` to include a sign-in button when unauthenticated and a sign-out button when authenticated:

```tsx
import { useAuth0 } from "@auth0/auth0-react";

export function RootLayout() {
  const { isAuthenticated, loginWithRedirect, logout, user } = useAuth0();

  return (
    <>
      <a className="skip-link" href="#main">Skip to main content</a>
      <header>
        {/* brand and nav as before */}
        <div className="auth">
          {isAuthenticated ? (
            <>
              <span>Hi, {user?.name}</span>
              <button type="button" onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}>
                Sign out
              </button>
            </>
          ) : (
            <button type="button" onClick={() => loginWithRedirect()}>
              Sign in
            </button>
          )}
        </div>
      </header>
      <main id="main">
        <Outlet />
      </main>
      <footer>
        <small>Built for the C8 capstone.</small>
      </footer>
    </>
  );
}
```

### Step B6 — Protect the `/profile` route

The profile route needs to render the user's claims. Replace `src/routes/Profile.tsx`:

```tsx
import { useEffect } from "react";
import { useAuth0, withAuthenticationRequired } from "@auth0/auth0-react";

function ProfileImpl() {
  const { user } = useAuth0();
  useEffect(() => { document.title = "Readlist — profile"; }, []);

  if (!user) return <p>Loading profile…</p>;

  return (
    <>
      <h1>Profile</h1>
      <dl>
        <dt>Name</dt>          <dd>{user.name}</dd>
        <dt>Email</dt>         <dd>{user.email}</dd>
        <dt>Email verified</dt><dd>{user.email_verified ? "Yes" : "No"}</dd>
        <dt>Provider</dt>      <dd>{user.sub?.split("|")[0]}</dd>
      </dl>
    </>
  );
}

export const Profile = withAuthenticationRequired(ProfileImpl, {
  onRedirecting: () => <p>Redirecting to sign in…</p>,
});
```

`withAuthenticationRequired` is the SDK's route guard. Any visitor who is not authenticated is redirected to the IdP login, then back to `/profile` after a successful login.

### Step B7 — Update the CSP

The CSP from Exercise 01 has `connect-src 'self'`. Auth0 needs `connect-src` to include your Auth0 domain. Update `vercel.json`:

```json
{
  "key": "Content-Security-Policy-Report-Only",
  "value": "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; font-src 'self'; img-src 'self' data: https:; connect-src 'self' https://your-tenant.auth0.com; frame-ancestors 'none'; base-uri 'self'; form-action 'self';"
}
```

Replace `your-tenant.auth0.com` with your actual Auth0 domain. Commit and redeploy.

### Step B8 — Test end-to-end on the deployed URL

1. Open `https://your-spa.vercel.app/` in an incognito browser.
2. Click "Sign in."
3. Auth0's hosted login page appears.
4. Sign in with email + password (or Google, or GitHub — whichever connections you enabled on the Auth0 dashboard).
5. You are redirected back to `your-spa.vercel.app/callback?code=...&state=...`.
6. The SDK exchanges the code for tokens (using PKCE) at the token endpoint.
7. The header re-renders showing your name.
8. Navigate to `/profile`. Confirm the claims display correctly.
9. Click "Sign out." Confirm the session is cleared and the header shows "Sign in" again.

**If the login fails at any step**, open the browser DevTools Network tab and look for the failing request. The most common failure modes:

- **Callback URL mismatch** — the Auth0 dashboard's allowlist does not include `your-spa.vercel.app/callback` exactly. Fix on the dashboard, save, retry.
- **CSP block** — the browser Console shows "Refused to connect to ... because it violates ... connect-src". Add the Auth0 domain to the CSP and redeploy.
- **CORS error on the token endpoint** — make sure "Allowed Web Origins" on the Auth0 dashboard includes `https://your-spa.vercel.app`.

### Step B9 — Commit and document

```bash
git add -A
git commit -m "feat: Auth0 OAuth 2.1 + PKCE wired against deployed URL"
git push origin main
```

Update the README's "Stack" section to mention Auth0 with one line on why you picked it.

## Acceptance criteria

This exercise is complete when:

- [ ] All four routes load on the deployed URL.
- [ ] Each route has a unique `<h1>` and a unique `<title>`.
- [ ] Refresh on `/profile` or `/list` does not 404.
- [ ] Mobile viewport (320px wide) renders correctly with no horizontal scroll.
- [ ] The skip-link is the first focusable element when the user presses Tab.
- [ ] Sign-in round-trips against the IdP and the post-login profile shows real claims.
- [ ] Sign-out clears the session.
- [ ] All of the above works on the **deployed URL**, not just on localhost.

## Time budget

- Part A — 3 hours (Wednesday).
- Part B — 3 hours (Thursday).

If you go over by an hour on either side, that is normal — the IdP integration eats time disproportionately. If you go over by 3 hours on auth, swap to GitHub OAuth (the device flow is much simpler) and document the swap in the README.

## What to do next

Friday's work — performance and accessibility — picks up from here. The four-route auth-protected app becomes a 90+ Lighthouse score.
