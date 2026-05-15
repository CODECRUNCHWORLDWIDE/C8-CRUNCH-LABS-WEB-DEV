# Week 10 Exercise Solutions

> The reference implementations of all three exercises. Do not read these until you have attempted the exercise yourself; the value of the exercise is in the attempt, and reading the solution first is the surest way to leave with nothing.

---

## Exercise 1 — JWT decoder

The full implementation of `starter-jwt-decode.ts`. Paste over the stubs.

### `splitToken`

```typescript
export function splitToken(token: string): {
  header: string;
  payload: string;
  signature: string;
} {
  const parts = token.split('.');
  if (parts.length !== 3) {
    throw new Error(`Not a JWT — expected 3 dot-separated parts, got ${parts.length}`);
  }
  const [header, payload, signature] = parts;
  if (!header || !payload || !signature) {
    throw new Error('JWT segments must be non-empty');
  }
  return { header, payload, signature };
}
```

### `base64UrlDecode`

Two equally good implementations. The Node-idiomatic version uses `Buffer`; the browser-portable version uses `atob`.

```typescript
// Node-idiomatic
export function base64UrlDecode(input: string): string {
  return Buffer.from(input, 'base64url').toString('utf8');
}

// Browser-portable (works in Node 20+ too because atob is global)
export function base64UrlDecode(input: string): string {
  const padded =
    input.replace(/-/g, '+').replace(/_/g, '/') +
    '==='.slice((input.length + 3) % 4);
  return decodeURIComponent(
    Array.prototype.map
      .call(atob(padded), (c: string) => {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      })
      .join(''),
  );
}
```

Either is correct. The `Buffer.from(..., 'base64url')` form is the one to ship in Node 20+ — it is in the standard library and handles padding for you.

### `decodeHeader` / `decodePayload`

```typescript
export function decodeHeader(token: string): JwtHeader {
  const { header } = splitToken(token);
  return JSON.parse(base64UrlDecode(header));
}

export function decodePayload(token: string): JwtPayload {
  const { payload } = splitToken(token);
  return JSON.parse(base64UrlDecode(payload));
}
```

### `verify`

```typescript
export async function verify(
  token: string,
  opts: VerifyOptions,
): Promise<JwtPayload> {
  const { payload } = await jwtVerify(token, JWKS, {
    issuer: opts.expectedIssuer,
    audience: opts.expectedAudience,
    algorithms: ['RS256'],
    clockTolerance: 5,
  });
  return payload as JwtPayload;
}
```

The `algorithms: ['RS256']` allowlist is the load-bearing line. Without it your verifier would honor the `alg` header in the token, which is the classic algorithm-confusion vulnerability (CVE-2015-9235 and many follow-ups).

### Bonus — `verifySignatureFromScratch`

```typescript
export async function verifySignatureFromScratch(
  token: string,
  jwk: JsonWebKey,
): Promise<boolean> {
  const { header, payload, signature } = splitToken(token);

  // 1. Build the signing input — the first two segments joined by '.',
  //    in their original base64url form (NOT decoded).
  const signingInput = new TextEncoder().encode(`${header}.${payload}`);

  // 2. Decode the signature from base64url to raw bytes.
  const sigBytes = Buffer.from(signature, 'base64url');

  // 3. Import the JWK as a verification key.
  const key = await crypto.subtle.importKey(
    'jwk',
    jwk,
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['verify'],
  );

  // 4. Verify.
  return crypto.subtle.verify('RSASSA-PKCS1-v1_5', key, sigBytes, signingInput);
}
```

This is ~25 lines and matches what `jose` does internally. The fact that you wrote it yourself means JWT verification is no longer mysterious.

### Common mistakes

1. **Not padding the base64.** `atob` in browsers may or may not require padding, depending on browser; safer to always pad.
2. **Treating the signature segment as text.** It is binary; decoding it as UTF-8 produces gibberish. The `verify` function never needs to decode it as text — it only compares bytes.
3. **Skipping `clockTolerance`.** Without it, an off-by-1-second clock skew between client and IdP rejects every token. Five seconds is a reasonable default.
4. **Not pinning `algorithms`.** This is the algorithm-confusion footgun. Pin it.

---

## Exercise 2 — PKCE by hand

The full `starter-pkce.ts`:

### `base64UrlEncode`

```typescript
export function base64UrlEncode(bytes: Uint8Array): string {
  // Node 20+ — Buffer.from(...).toString('base64url') does the encoding
  // and the URL-safe substitutions in one call.
  if (typeof Buffer !== 'undefined') {
    return Buffer.from(bytes).toString('base64url');
  }
  // Browser fallback
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
```

### `generateVerifier`

```typescript
export function generateVerifier(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return base64UrlEncode(bytes);
}
```

32 bytes is 256 bits — well above the entropy floor RFC 7636 §7.1 recommends. The base64url encoding of 32 bytes is 43 characters with no padding.

### `deriveChallenge`

```typescript
export async function deriveChallenge(verifier: string): Promise<string> {
  const data = new TextEncoder().encode(verifier);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return base64UrlEncode(new Uint8Array(hash));
}
```

A SHA-256 digest is 32 bytes; base64url-encoded that is 43 characters. So both `verifier` and `challenge` are 43-character base64url strings — the difference is that the verifier is random and the challenge is its SHA-256.

### Walking the rest of the exercise

The shell session in the exercise README is itself the solution. The two specific outcomes you should observe:

1. **Step 8 — rotation.** The new `refresh_token` from the refresh response is a different string from the old one. Print both, confirm.
2. **Step 9 — reuse detection.** Sending the old (rotated-out) refresh token returns `{"error":"invalid_grant","error_description":"Stale token"}`. This is RFC 9700 §4.14.2's "the authorization server SHOULD detect and react to refresh token reuse" working as specified.

If reuse detection does not trip in your test, check the realm's Tokens tab in the Keycloak admin console: "Revoke Refresh Token" must be ON and "Refresh Token Max Reuse" must be 0. Both are set in `starter-keycloak-realm.json` but a different realm or a customized realm may have these off.

### Common mistakes

1. **Forgetting to URL-encode the `redirect_uri` parameter.** Spaces, colons, and slashes all need encoding. Use `encodeURIComponent` or pass it through `URLSearchParams`.
2. **Re-using a `code`.** Authorization codes are single-use. If your first `curl` POST succeeded and you ran it again, the second always fails. Get a fresh code by re-running the authorize URL.
3. **A `code` that has expired.** Authorization codes are valid for ~60 seconds. If you copy-pasted slowly, get a new code.
4. **Mixing up the verifier and challenge.** The challenge goes in the `/authorize` URL; the verifier goes in the `/token` POST. They are not interchangeable.

---

## Exercise 3 — Protected route

The full reference component. Replace the stubs in `starter-protected-route.jsx` with these.

### `Callback`

```jsx
function Callback() {
  const navigate = useNavigate();
  const [error, setError] = useState(null);

  useEffect(() => {
    userManager
      .signinRedirectCallback()
      .then((user) => {
        const returnTo = user.state?.returnTo || '/profile';
        navigate(returnTo, { replace: true });
      })
      .catch((err) => {
        console.error('signinRedirectCallback failed:', err);
        setError(err.message);
      });
  }, [navigate]);

  if (error) return <p style={{ color: 'crimson' }}>Sign-in failed: {error}</p>;
  return <p>Signing you in&hellip;</p>;
}
```

Note `navigate(returnTo, { replace: true })`. The `replace: true` is important: it prevents the user from hitting the back button and landing on the `/callback?code=...` URL, which would error out on a re-load because the code has already been used.

### `ProtectedRoute`

```jsx
function ProtectedRoute({ children }) {
  const [user, setUser] = useState(undefined);
  const location = useLocation();

  useEffect(() => {
    let cancelled = false;
    userManager.getUser().then((u) => {
      if (cancelled) return;
      if (u && !u.expired) {
        setUser(u);
      } else {
        userManager.signinRedirect({
          state: { returnTo: location.pathname + location.search },
        });
      }
    });
    return () => { cancelled = true; };
  }, [location.pathname, location.search]);

  if (user === undefined) return <p>Checking authentication&hellip;</p>;
  return children;
}
```

The `cancelled` flag avoids a state-update warning if the component unmounts before `getUser()` resolves (which can happen if the user clicks elsewhere quickly).

### Silent renewal — the optional step

`public/silent-renew.html`:

```html
<!doctype html>
<html>
<head><title>Silent renew</title></head>
<body>
<script type="module">
  // Re-use the same config the main UserManager uses.
  // In a real project you would share the config object via an import;
  // here we keep the file standalone.
  import { UserManager, WebStorageStateStore } from 'https://esm.sh/oidc-client-ts';
  const um = new UserManager({
    authority: 'http://localhost:8080/realms/crunch',
    client_id: 'spa-client',
    redirect_uri: 'http://localhost:5173/callback',
    silent_redirect_uri: 'http://localhost:5173/silent-renew.html',
    response_type: 'code',
    scope: 'openid profile email',
    userStore: new WebStorageStateStore({ store: window.sessionStorage }),
  });
  um.signinSilentCallback().catch((e) => console.error('silent renew callback:', e));
</script>
</body>
</html>
```

Then uncomment the two relevant lines in `userManagerConfig`:

```javascript
automaticSilentRenew: true,
silent_redirect_uri: 'http://localhost:5173/silent-renew.html',
```

After 5 minutes (the access-token lifetime), open the Network tab. You should see a hidden iframe load `silent-renew.html`, which triggers a re-run of the auth-code flow against Keycloak's existing session, which returns fresh tokens.

### Common mistakes

1. **Forgetting to register the redirect URI** in Keycloak — `invalid_redirect_uri` is the error. The seed realm has `http://localhost:5173/callback` and `/silent-renew.html` registered; if you changed the SPA port, update the realm.
2. **Using `localStorage` instead of `sessionStorage`** for the user store, then being surprised when the session survives a browser close. The choice between them is a UX decision — `sessionStorage` is the safer default for this exercise.
3. **Logging out by just clearing local state.** This leaves the Keycloak session alive. The next "Sign In" silently completes without prompting for credentials. To fully sign out, you must hit `end_session_endpoint`; `userManager.signoutRedirect()` does this for you.
4. **Calling `getUser()` synchronously and treating `null` as a failure.** `getUser()` returns a Promise that resolves to `null` when not authenticated; the loading state matters. The starter handles this with the `user === undefined` "loading" check.

---

## Recap

After these three exercises you have:

1. Decoded and verified a JWT by hand, including the failure cases.
2. Walked the OAuth 2.0 authorization-code-with-PKCE flow against Keycloak with `curl`, including refresh-token rotation and reuse detection.
3. Built a React `<ProtectedRoute>` component that gates access by IdP authentication.

These are the building blocks of every SPA-auth library you will read for the rest of your career. The mini-project assembles them into one cohesive deliverable.
