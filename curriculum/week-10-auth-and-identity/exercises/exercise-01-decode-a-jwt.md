# Exercise 1 — Decode and Verify a JWT by Hand

> Decode a JSON Web Token into its three segments without using a library. Verify its signature using the `jose` package against a JWKS endpoint. Then tamper with one byte of the payload and watch verification fail. The point of doing this manually is that, after this exercise, every JWT debugging session you ever do will start with you knowing what the library is doing under the hood.

**Estimated time:** 60 minutes.
**Starter file:** [`starter-jwt-decode.ts`](./starter-jwt-decode.ts).

---

## What you will build

A small TypeScript module that:

1. Splits a JWT into its three base64url segments.
2. Decodes the header and payload to plain JavaScript objects, without any third-party library.
3. Pretty-prints the standard claims (`iss`, `sub`, `aud`, `exp`, `iat`, `nonce`).
4. Verifies the token's signature against a JWKS endpoint using the `jose` library, with the algorithm allowlist pinned.
5. Detects and reports each of: signature failure, expired token, audience mismatch, issuer mismatch, and a tampered payload.

You will run it from the command line (`node` after a `tsc` build, or use `tsx`).

---

## Prerequisites

- Node 20+ and npm 10+.
- Docker running (we need a Keycloak instance to issue you a real token).

If you do not yet have a running Keycloak from the mini-project, you can use this throwaway command to bring one up:

```bash
docker run --name kc-ex1 -p 8080:8080 \
  -e KEYCLOAK_ADMIN=admin -e KEYCLOAK_ADMIN_PASSWORD=admin \
  quay.io/keycloak/keycloak:25.0 start-dev
```

Wait 30 seconds, then open `http://localhost:8080/` and confirm you can log in to the admin console as `admin` / `admin`.

We will use the master realm's `admin-cli` client to grab a token; you do not need to set up a new realm for this exercise.

---

## Step 1 — Grab a real token

The admin-cli client of the master realm supports the password grant for the admin user; we use it here only to obtain a real token to dissect (this is the one situation where the deprecated password grant is harmless — we are interacting with our local IdP for educational purposes).

```bash
curl -X POST http://localhost:8080/realms/master/protocol/openid-connect/token \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=admin" \
  -d "password=admin" \
  -d "grant_type=password" \
  -d "client_id=admin-cli"
```

You will get back a JSON response with `access_token` and `refresh_token`. Copy the `access_token` value (a long string starting with `eyJ`) and save it to a file:

```bash
echo "PASTE_TOKEN_HERE" > /tmp/access_token.txt
```

You can also paste the token into <https://jwt.io/> in your browser to confirm it decodes properly. We will not use jwt.io's verifier; we are about to write our own.

---

## Step 2 — Open the starter

Open `starter-jwt-decode.ts`. The file has stubs for the functions you will implement and a `main()` that calls each. Read the file end to end before writing code.

---

## Step 3 — Implement `splitToken`

Given a token string `"a.b.c"`, return the three segments. Validate that there are exactly three parts.

```typescript
export function splitToken(token: string): { header: string; payload: string; signature: string } {
  // YOUR CODE
}
```

If the input does not have exactly three dot-separated parts, throw an `Error` with a useful message.

---

## Step 4 — Implement `base64UrlDecode`

Base64url is base64 with two character substitutions and no padding:

- `+` becomes `-`
- `/` becomes `_`
- Trailing `=` padding is stripped

Your decoder must reverse this: substitute `-` back to `+`, `_` back to `/`, re-pad to a multiple of 4 characters, then call `atob` (in Node, `Buffer.from(s, 'base64').toString('utf8')` or `atob` in modern Node 20).

```typescript
export function base64UrlDecode(input: string): string {
  // YOUR CODE
}
```

Test it manually: `base64UrlDecode('SGVsbG8')` should return `"Hello"`. (Note: no padding on the input.)

---

## Step 5 — Implement `decodeHeader` and `decodePayload`

These wrap `splitToken` + `base64UrlDecode` + `JSON.parse`:

```typescript
export function decodeHeader(token: string): JwtHeader {
  // YOUR CODE
}

export function decodePayload(token: string): JwtPayload {
  // YOUR CODE
}
```

The types are at the top of the starter file. Use them.

---

## Step 6 — Run it and inspect

```bash
npm install   # installs jose, typescript, tsx
npx tsx starter-jwt-decode.ts $(cat /tmp/access_token.txt)
```

You should see output like:

```
=== Header ===
{ alg: 'RS256', typ: 'JWT', kid: 'abc123' }

=== Payload (top-level claims) ===
iss: http://localhost:8080/realms/master
sub: a1b2c3d4-...
aud: master-realm
exp: 1735000000 (in 14m 53s)
iat: 1734999100
```

If you do not see this, your decoder has a bug. Walk back through Steps 3–5.

---

## Step 7 — Implement `verify`

Now the important part. Use the `jose` library to verify the signature against the issuer's JWKS:

```typescript
import { jwtVerify, createRemoteJWKSet } from 'jose';

const JWKS_URL = 'http://localhost:8080/realms/master/protocol/openid-connect/certs';
const JWKS = createRemoteJWKSet(new URL(JWKS_URL));

export async function verify(token: string, opts: VerifyOptions): Promise<JwtPayload> {
  const { payload } = await jwtVerify(token, JWKS, {
    issuer: opts.expectedIssuer,
    audience: opts.expectedAudience,
    algorithms: ['RS256'],
    clockTolerance: 5,
  });
  return payload as JwtPayload;
}
```

The `algorithms: ['RS256']` allowlist is **load-bearing**. Without it, your verifier would trust whatever `alg` the token claims, which is the classic algorithm-confusion vulnerability.

---

## Step 8 — Test the failure cases

Add to `main()` calls that exercise each error path:

1. **Expired token.** Wait 15 minutes (the default master-realm access-token lifetime) and re-run. The verifier should throw an error with `code: 'ERR_JWT_EXPIRED'` or message containing "exp".
2. **Wrong audience.** Pass `expectedAudience: 'some-other-client'`. The verifier should throw with message containing "audience".
3. **Wrong issuer.** Pass `expectedIssuer: 'http://localhost:8080/realms/somewhere-else'`. The verifier should throw with message containing "issuer".
4. **Tampered payload.** Take a valid token, split it, decode the payload, change one claim (e.g., flip `sub` to a different user ID), re-encode, re-assemble. The signature will no longer match. The verifier should throw with message containing "signature".

The starter has a helper `tamper(token, claim, newValue)` you can use for case 4.

---

## Step 9 — Read the `jose` source

This is the part of the exercise students most often skip. Do not skip it.

Open `node_modules/jose/dist/node/cjs/jwt/verify.js` (or `.../jwt/verify.cjs` depending on Node version) and read the `jwtVerify` function. It is about 80 lines. Read it.

You will see:

1. The call to `compactVerify` that parses the token and verifies the signature.
2. The claim checks in `validateClaimsSet` — `exp`, `nbf`, `iat`, `iss`, `aud`, `sub`.
3. The `requiredClaims` enforcement.

This is the library doing what you would do yourself, but with all the edge cases handled. After reading this, the library is no longer a black box.

---

## Step 10 — Stretch: implement verify yourself

For the truly committed: implement `verifySignature(token, jwk)` from scratch using `crypto.subtle.verify`. The high-level algorithm:

1. Split the token; take the signing input as `${headerB64}.${payloadB64}` (the first two segments joined, not decoded).
2. Decode the signature segment from base64url to raw bytes.
3. Import the JWK as a `CryptoKey` with `crypto.subtle.importKey`.
4. Verify with `crypto.subtle.verify('RSASSA-PKCS1-v1_5', key, signature, signingInput)`.

This is about 30 lines. It is exactly what `jose` does internally. After writing it you understand JWT verification at the cryptographic level.

The starter has the stub but no requirement to complete this step. It is bonus.

---

## How to know you are done

Run `npx tsx starter-jwt-decode.ts <token>` and confirm:

- The header and payload decode and pretty-print correctly.
- A valid token verifies cleanly.
- An expired token fails verification with a clear message.
- A token with the wrong audience fails verification with a clear message.
- A token with the wrong issuer fails verification with a clear message.
- A tampered token fails verification with a clear message.

The full reference solution is in `SOLUTIONS.md`. Try it yourself first; the solution will spoil the learning.

---

## What you learned

1. The JWT format is three base64url segments. You can decode the header and payload without any library; the protection is the signature, not obscurity of the payload.
2. Signature verification requires the issuer's public key, fetched from the JWKS endpoint, matched to the token's `kid`.
3. The algorithm allowlist is load-bearing — never trust the token's claimed algorithm.
4. The five claim checks — `iss`, `aud`, `exp`, `nbf`, `iat` — are what makes the verified token meaningfully trustworthy. Skipping any of them weakens the security guarantee.
5. The `jose` library is approachable source code, not a black box. You can read it.

---

## References

- RFC 7519 — JSON Web Token. <https://datatracker.ietf.org/doc/html/rfc7519>
- RFC 7518 §3 — JSON Web Algorithms (the registry of `alg` values). <https://datatracker.ietf.org/doc/html/rfc7518>
- `jose` library docs. <https://github.com/panva/jose>
- OWASP JSON Web Token Cheat Sheet. <https://cheatsheetseries.owasp.org/cheatsheets/JSON_Web_Token_for_Java_Cheat_Sheet.html>
- PortSwigger — JWT attacks lab series. <https://portswigger.net/web-security/jwt>
