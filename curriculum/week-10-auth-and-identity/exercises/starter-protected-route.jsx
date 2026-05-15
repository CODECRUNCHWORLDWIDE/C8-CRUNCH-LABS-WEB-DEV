// Exercise 3 — A protected React Router route.
//
// Drop this into src/App.jsx of a fresh Vite React project. See the exercise
// README for the full setup, including `npm install react-router-dom oidc-client-ts`.
//
// The stubs below are the components you must implement. Read the README first.

import { useEffect, useState } from 'react';
import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  useNavigate,
  useLocation,
} from 'react-router-dom';
import { UserManager, WebStorageStateStore } from 'oidc-client-ts';

// ---------------------------------------------------------------------------
// 1. Configure the UserManager.
// ---------------------------------------------------------------------------

// The authority is the Keycloak realm URL. oidc-client-ts will fetch the
// discovery document from ${authority}/.well-known/openid-configuration.
const userManagerConfig = {
  authority: 'http://localhost:8080/realms/crunch',
  client_id: 'spa-client',
  redirect_uri: 'http://localhost:5173/callback',
  post_logout_redirect_uri: 'http://localhost:5173/',
  response_type: 'code',
  scope: 'openid profile email',
  loadUserInfo: true,
  // Learning-context: sessionStorage is OK here. Production: in-memory +
  // httpOnly cookie via a BFF backend (see RFC 9700 §6.2).
  userStore: new WebStorageStateStore({ store: window.sessionStorage }),
  stateStore: new WebStorageStateStore({ store: window.sessionStorage }),
  // Uncomment to enable silent renewal (see Step 10 of the exercise):
  // automaticSilentRenew: true,
  // silent_redirect_uri: 'http://localhost:5173/silent-renew.html',
};

export const userManager = new UserManager(userManagerConfig);

// ---------------------------------------------------------------------------
// 2. The Home route — public.
// ---------------------------------------------------------------------------

function Home() {
  return (
    <section>
      <h1>Welcome</h1>
      <p>This is the public landing page. Click "Profile" in the nav to access a protected route.</p>
      <button onClick={() => userManager.signinRedirect()}>Sign In</button>
    </section>
  );
}

// ---------------------------------------------------------------------------
// 3. The Callback route — handles the OIDC redirect after login.
// ---------------------------------------------------------------------------

function Callback() {
  const navigate = useNavigate();
  const [error, setError] = useState(null);

  useEffect(() => {
    // YOUR CODE HERE
    //
    // 1. Call userManager.signinRedirectCallback().
    // 2. On success: read user.state?.returnTo (default '/profile')
    //    and navigate there with { replace: true }.
    // 3. On failure: setError(err.message).
    //
    // Replace the placeholder below with the real implementation.
    setError('Callback not implemented');
  }, [navigate]);

  if (error) return <p style={{ color: 'crimson' }}>Sign-in failed: {error}</p>;
  return <p>Signing you in&hellip;</p>;
}

// ---------------------------------------------------------------------------
// 4. The ProtectedRoute wrapper — the core of this exercise.
// ---------------------------------------------------------------------------

function ProtectedRoute({ children }) {
  const [user, setUser] = useState(undefined);  // undefined = loading
  const location = useLocation();

  useEffect(() => {
    // YOUR CODE HERE
    //
    // 1. Call userManager.getUser().
    // 2. If the result is non-null and not expired, setUser(result).
    // 3. Otherwise, call userManager.signinRedirect({
    //      state: { returnTo: location.pathname + location.search }
    //    }).
    //
    // Hint: getUser() returns a Promise<User | null>. The User has a
    // .expired boolean.
  }, [location.pathname, location.search]);

  if (user === undefined) return <p>Checking authentication&hellip;</p>;
  return children;
}

// ---------------------------------------------------------------------------
// 5. The Profile route — protected.
// ---------------------------------------------------------------------------

function Profile() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    userManager.getUser().then(setUser);
  }, []);

  if (!user) return <p>Loading&hellip;</p>;

  return (
    <section>
      <h1>Hello, {user.profile.preferred_username}</h1>
      <dl>
        <dt>Subject (stable user ID at IdP):</dt>
        <dd><code>{user.profile.sub}</code></dd>
        <dt>Email:</dt>
        <dd>{user.profile.email}</dd>
        <dt>Email verified:</dt>
        <dd>{String(user.profile.email_verified)}</dd>
        <dt>Issued at:</dt>
        <dd>{new Date(user.profile.iat * 1000).toISOString()}</dd>
        <dt>Access token expires:</dt>
        <dd>{new Date(user.expires_at * 1000).toISOString()}</dd>
      </dl>
      <button onClick={() => userManager.signoutRedirect()}>Sign out</button>
      <details>
        <summary>Full ID token claims</summary>
        <pre>{JSON.stringify(user.profile, null, 2)}</pre>
      </details>
      <details>
        <summary>Raw access token</summary>
        <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
          {user.access_token}
        </pre>
      </details>
    </section>
  );
}

// ---------------------------------------------------------------------------
// 6. The router wiring.
// ---------------------------------------------------------------------------

export default function App() {
  return (
    <BrowserRouter>
      <nav style={{ padding: '1rem', borderBottom: '1px solid #ccc' }}>
        <Link to="/">Home</Link>
        {' | '}
        <Link to="/profile">Profile</Link>
      </nav>
      <main style={{ padding: '1rem' }}>
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
      </main>
    </BrowserRouter>
  );
}
