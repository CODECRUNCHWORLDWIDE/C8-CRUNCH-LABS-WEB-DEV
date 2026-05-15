# Exercise 2 — PKCE by Hand With `curl`

> Walk the entire OAuth 2.0 authorization-code-with-PKCE flow against a local Keycloak using nothing but `curl`, a clipboard, and a browser. By the end you will know what every parameter of every request does, you will have a real access token and refresh token in your shell, and you will have completed a refresh-token rotation. This is the exercise that makes the `oidc-client-ts` library transparent.

**Estimated time:** 75 minutes.
**Starter file:** [`starter-pkce.ts`](./starter-pkce.ts) — for generating verifier/challenge in Node.
**Starter realm:** [`starter-keycloak-realm.json`](./starter-keycloak-realm.json) — import this into Keycloak before starting.

---

## What you will do

1. Start Keycloak and import the seed realm.
2. Generate a PKCE verifier and challenge in Node.
3. Construct the `/authorize` URL by hand and open it in a browser.
4. Log in, capture the authorization code from the redirect.
5. Exchange the code at the `/token` endpoint with `curl`.
6. Inspect the access token, ID token, and refresh token.
7. Use the access token to call the `/userinfo` endpoint.
8. Refresh — and observe rotation.
9. Reuse an old refresh token — and observe the cascade revocation.

---

## Prerequisites

- Docker running.
- Node 20+.
- `curl` and `jq` available on your `PATH` (`brew install jq` or your package manager's equivalent).
- A browser.

---

## Step 1 — Start Keycloak with the seed realm

From this exercise directory:

```bash
docker run --name kc-ex2 -p 8080:8080 \
  -e KEYCLOAK_ADMIN=admin -e KEYCLOAK_ADMIN_PASSWORD=admin \
  -v "$(pwd)/starter-keycloak-realm.json:/opt/keycloak/data/import/realm.json" \
  quay.io/keycloak/keycloak:25.0 start-dev --import-realm
```

Wait 60 seconds. Open `http://localhost:8080/`. You should see the Keycloak welcome page. Go to the admin console, log in as `admin` / `admin`, and confirm that a realm called `crunch` exists alongside `master`.

The seed realm has:

- One client: `spa-client` (public, with PKCE required).
- One user: `alice` / `alice-password`.
- Access-token lifetime 5 minutes (short for this exercise).
- Refresh-token rotation enabled.

---

## Step 2 — Generate a PKCE verifier and challenge

Open `starter-pkce.ts`. The starter has stubs for the two functions you will implement:

```typescript
function base64UrlEncode(bytes: Uint8Array): string {
  // YOUR CODE
}

function generateVerifier(): string {
  // YOUR CODE - return a 43-character base64url string from 32 random bytes
}

async function deriveChallenge(verifier: string): Promise<string> {
  // YOUR CODE - return BASE64URL(SHA256(verifier))
}
```

Use `crypto.getRandomValues` for the entropy and `crypto.subtle.digest('SHA-256', ...)` for the hash. The `main()` function prints both values:

```bash
npx tsx starter-pkce.ts
```

Expected output:

```
verifier:   xR-W7QzkP8GnsQbXLOPm5cF7vH3iD2yEeP3-zRMaL4f
challenge:  hxR-i9NM2EmH8tEbgczO3-AlV67otsAVOykMC-K7lr0
```

(Your values will differ — they are randomly generated.) **Save both values.** You will use the challenge in the URL and the verifier in the token exchange.

```bash
# In your shell:
VERIFIER='paste-verifier-here'
CHALLENGE='paste-challenge-here'
STATE='somestaterandomstring1234'
NONCE='somenoncerandomstring5678'
```

---

## Step 3 — Construct the `/authorize` URL

Build the URL by substituting your values:

```bash
AUTHORIZE_URL="http://localhost:8080/realms/crunch/protocol/openid-connect/auth"
AUTHORIZE_URL+="?response_type=code"
AUTHORIZE_URL+="&client_id=spa-client"
AUTHORIZE_URL+="&redirect_uri=http%3A%2F%2Flocalhost%3A5173%2Fcallback"
AUTHORIZE_URL+="&scope=openid+profile+email"
AUTHORIZE_URL+="&state=${STATE}"
AUTHORIZE_URL+="&nonce=${NONCE}"
AUTHORIZE_URL+="&code_challenge=${CHALLENGE}"
AUTHORIZE_URL+="&code_challenge_method=S256"
echo "$AUTHORIZE_URL"
```

Copy the printed URL. Paste it into your browser.

---

## Step 4 — Log in and capture the code

Your browser shows the Keycloak login page. Enter `alice` / `alice-password` and submit. The browser is redirected to:

```
http://localhost:5173/callback?code=ABC123...&state=somestaterandomstring1234
```

This URL **does not load** — there is nothing listening on port 5173 right now. That is fine; we only need the URL.

- **Verify the state matches** what you generated. If it does not, the IdP or some intermediate altered it — stop and investigate.
- **Copy the `code` value** from the URL.

```bash
CODE='paste-code-here'
```

---

## Step 5 — Exchange the code at the `/token` endpoint

```bash
TOKEN_RESPONSE=$(curl -s -X POST \
  http://localhost:8080/realms/crunch/protocol/openid-connect/token \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=authorization_code" \
  -d "code=${CODE}" \
  -d "redirect_uri=http://localhost:5173/callback" \
  -d "client_id=spa-client" \
  -d "code_verifier=${VERIFIER}")

echo "$TOKEN_RESPONSE" | jq .
```

You should see a JSON response with `access_token`, `id_token`, `refresh_token`, and metadata. If you instead see an error like `invalid_grant`, the most likely cause is:

- Verifier does not match challenge — re-derive the challenge from your verifier and confirm equality.
- The code has already been used (codes are single-use; if you ran the exchange twice, the second fails).
- The code has expired (codes are valid for ~60 seconds).

Save each token:

```bash
ACCESS_TOKEN=$(echo "$TOKEN_RESPONSE" | jq -r '.access_token')
ID_TOKEN=$(echo "$TOKEN_RESPONSE" | jq -r '.id_token')
REFRESH_TOKEN=$(echo "$TOKEN_RESPONSE" | jq -r '.refresh_token')
```

---

## Step 6 — Inspect the tokens

Decode the ID token's payload:

```bash
echo "$ID_TOKEN" | cut -d'.' -f2 | base64 -d 2>/dev/null | jq .
```

(Some `base64` implementations complain about missing padding; the `2>/dev/null` suppresses the warning. If yours fails outright, use `node -e "console.log(Buffer.from(process.argv[1], 'base64url').toString())" "$(echo $ID_TOKEN | cut -d'.' -f2)"`.)

You should see claims including:

- `iss: "http://localhost:8080/realms/crunch"`
- `sub: "<alice's UUID>"`
- `aud: "spa-client"`
- `exp: <unix time>` — should be ~5 minutes in the future.
- `nonce: "somenoncerandomstring5678"` — must match what you sent.
- `preferred_username: "alice"`
- `email: "alice@example.com"`

If `nonce` does not match, **the token would be rejected by a proper client**. Real OIDC libraries enforce this.

Decode the access token similarly. The access token in Keycloak is also a JWT; some other IdPs use opaque access tokens.

---

## Step 7 — Call `/userinfo`

```bash
curl -s http://localhost:8080/realms/crunch/protocol/openid-connect/userinfo \
  -H "Authorization: Bearer ${ACCESS_TOKEN}" | jq .
```

Expected:

```json
{
  "sub": "<alice's UUID>",
  "email_verified": false,
  "preferred_username": "alice",
  "email": "alice@example.com"
}
```

You have authenticated and made an authenticated API call. The Bearer token worked. The IdP recognized you.

---

## Step 8 — Refresh

The access token expires in 5 minutes. To get a new one, POST the refresh token:

```bash
REFRESH_RESPONSE=$(curl -s -X POST \
  http://localhost:8080/realms/crunch/protocol/openid-connect/token \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=refresh_token" \
  -d "refresh_token=${REFRESH_TOKEN}" \
  -d "client_id=spa-client")

echo "$REFRESH_RESPONSE" | jq .
```

You get a new `access_token`, a new `id_token`, AND a new `refresh_token`. The old `REFRESH_TOKEN` value is now invalid.

```bash
OLD_REFRESH_TOKEN=$REFRESH_TOKEN
ACCESS_TOKEN=$(echo "$REFRESH_RESPONSE" | jq -r '.access_token')
ID_TOKEN=$(echo "$REFRESH_RESPONSE" | jq -r '.id_token')
REFRESH_TOKEN=$(echo "$REFRESH_RESPONSE" | jq -r '.refresh_token')
```

Verify the rotation: the new refresh token is a different string than the old one.

```bash
[ "$OLD_REFRESH_TOKEN" != "$REFRESH_TOKEN" ] && echo "rotated" || echo "NOT rotated"
```

---

## Step 9 — Demonstrate reuse detection

Use the **old** refresh token (the one we just rotated out of). It should be rejected:

```bash
curl -s -X POST \
  http://localhost:8080/realms/crunch/protocol/openid-connect/token \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=refresh_token" \
  -d "refresh_token=${OLD_REFRESH_TOKEN}" \
  -d "client_id=spa-client" | jq .
```

Expected response:

```json
{
  "error": "invalid_grant",
  "error_description": "Stale token"
}
```

This is reuse detection working as designed. In production, Keycloak would also **revoke the current valid refresh token** for this session, forcing the user to re-authenticate. (You can confirm this by trying the new `REFRESH_TOKEN` after the reuse attempt — depending on the realm's reuse-detection policy, it may also be revoked.)

The seed realm has reuse detection ON. The mini-project leans on this. RFC 9700 §4.14.2 specifies the behavior.

---

## Step 10 — Tear down

```bash
docker stop kc-ex2
docker rm kc-ex2
```

If you are continuing to Exercise 3 or the mini-project, leave Keycloak running.

---

## What you learned

1. The PKCE math — verifier, challenge, S256 — is one SHA-256 and one base64url encode.
2. The authorization request is a URL with seven required parameters; you can build it by hand.
3. The token exchange is a single `curl` POST; you can debug it by hand.
4. The access token is a Bearer token; the resource server reads it from the `Authorization` header.
5. Refresh-token rotation issues a new refresh token on every use and invalidates the old one.
6. Reuse detection makes a stolen-and-rotated refresh token useless after the first replay.

You should now be able to read `oidc-client-ts`'s source and see each of these steps in the library code.

---

## References

- RFC 7636 — PKCE. <https://datatracker.ietf.org/doc/html/rfc7636>
- RFC 6749 §4.1 — Authorization Code Grant. <https://datatracker.ietf.org/doc/html/rfc6749#section-4.1>
- RFC 6749 §6 — Refreshing an Access Token. <https://datatracker.ietf.org/doc/html/rfc6749#section-6>
- RFC 9700 §4.14 — Refresh Token Protection. <https://www.rfc-editor.org/rfc/rfc9700.html#section-4.14>
- OpenID Connect Core 1.0 §3.1 — Authorization Code Flow. <https://openid.net/specs/openid-connect-core-1_0.html#CodeFlowAuth>
- Keycloak Server Admin Guide — Tokens. <https://www.keycloak.org/docs/latest/server_admin/#con-sso-protocols_server_administration_guide>
