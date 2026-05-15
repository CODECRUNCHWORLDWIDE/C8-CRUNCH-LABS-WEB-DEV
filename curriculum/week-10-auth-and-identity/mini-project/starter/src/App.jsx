// App.jsx — routes, navigation, and the protected-route wrapper.
//
// The four routes:
//   /              — public landing page with a Sign In button
//   /callback      — the OIDC redirect URI; handles the auth-code exchange
//   /profile       — protected; shows the authenticated user's claims
//   /silent-renew  — the iframe target for silent token renewal (served from public/)
//
// The flow:
//   User clicks Sign In on /  ->  redirected to Keycloak  ->  authenticates
//   ->  redirected back to /callback?code=...  ->  Callback exchanges the code
//   ->  navigate to /profile  ->  Profile shows the user's claims
//   ->  Sign Out  ->  Keycloak end_session_endpoint  ->  back to /

import { useEffect, useState } from 'react';
import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  useNavigate,
  useLocation,
} from 'react-router-dom';
import { userManager } from './auth';
import { fetchMe } from './api';

// ---------------------------------------------------------------------------
// Home — the public landing page
// ---------------------------------------------------------------------------

function Home() {
  return (
    <section>
      <h1>Crunch Auth (W10 Mini-Project)</h1>
      <p>
        This SPA authenticates against a local Keycloak instance using the OAuth 2.0
        authorization-code flow with PKCE (RFC 7636), per the OAuth 2.1 draft's
        recommendation for public clients.
      </p>
      <p>Click "Sign In" below, or visit "Profile" to be redirected automatically.</p>
      <button onClick={() => userManager.signinRedirect()}>Sign In</button>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Callback — handles the OIDC redirect after IdP authentication
// ---------------------------------------------------------------------------

function Callback() {
  const navigate = useNavigate();
  const [error, setError] = useState(null);

  useEffect(() => {
    // YOUR CODE
    //
    // 1. Call userManager.signinRedirectCallback().
    // 2. On success: read user.state?.returnTo (default '/profile')
    //    and navigate there with { replace: true }.
    // 3. On failure: setError(err.message).
    setError('Callback not implemented — fill in src/App.jsx');
  }, [navigate]);

  if (error) {
    return (
      <section>
        <h2>Sign-in failed</h2>
        <p style={{ color: 'crimson' }}>{error}</p>
        <p>
          <Link to="/">Return home</Link>
        </p>
      </section>
    );
  }

  return <p>Signing you in&hellip;</p>;
}

// ---------------------------------------------------------------------------
// ProtectedRoute — gates its children behind authentication
// ---------------------------------------------------------------------------

function ProtectedRoute({ children }) {
  const [user, setUser] = useState(undefined);
  const location = useLocation();

  useEffect(() => {
    // YOUR CODE
    //
    // 1. Call userManager.getUser().
    // 2. If the result is non-null and not expired, setUser(result).
    // 3. Otherwise call userManager.signinRedirect({
    //      state: { returnTo: location.pathname + location.search }
    //    }).
    //
    // The state.returnTo is what the Callback component uses to send you back
    // to the URL you originally requested.
  }, [location.pathname, location.search]);

  if (user === undefined) return <p>Checking authentication&hellip;</p>;
  return children;
}

// ---------------------------------------------------------------------------
// Profile — the protected page
// ---------------------------------------------------------------------------

function Profile() {
  const [user, setUser] = useState(null);
  const [apiResult, setApiResult] = useState(null);
  const [apiError, setApiError] = useState(null);

  useEffect(() => {
    userManager.getUser().then(setUser);
  }, []);

  async function callApi() {
    setApiError(null);
    try {
      const data = await fetchMe();
      setApiResult(data);
    } catch (err) {
      setApiError(err.message);
    }
  }

  if (!user) return <p>Loading&hellip;</p>;

  return (
    <section>
      <h1>Hello, {user.profile.preferred_username || user.profile.email}</h1>
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

      <h2>Call the protected API</h2>
      <button onClick={callApi}>GET /api/me (sends the Bearer token)</button>
      {apiError && <p style={{ color: 'crimson' }}>API error: {apiError}</p>}
      {apiResult && (
        <pre>{JSON.stringify(apiResult, null, 2)}</pre>
      )}

      <h2>Sign Out</h2>
      <p>
        Clicking below will redirect to Keycloak&rsquo;s <code>end_session_endpoint</code>,
        terminating the IdP session, before redirecting back here. Just clearing local
        state would leave the IdP session alive — see Lecture 3 §5.
      </p>
      <button onClick={() => userManager.signoutRedirect()}>Sign out</button>

      <details style={{ marginTop: '2rem' }}>
        <summary>Full ID token claims</summary>
        <pre>{JSON.stringify(user.profile, null, 2)}</pre>
      </details>

      <details>
        <summary>Raw access token (for inspection in jwt.io)</summary>
        <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
          {user.access_token}
        </pre>
      </details>
    </section>
  );
}

// ---------------------------------------------------------------------------
// App — wiring
// ---------------------------------------------------------------------------

export default function App() {
  return (
    <BrowserRouter>
      <nav>
        <Link to="/">Home</Link>
        <Link to="/profile">Profile</Link>
      </nav>
      <main>
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
