// Exercise 1 — Decode and verify a JWT by hand.
//
// Run with: npx tsx starter-jwt-decode.ts <token>
//
// The token argument should be a real JWT from Keycloak. See the exercise
// README for how to obtain one. The stubs below are what you must implement;
// the main() function at the bottom exercises each.
//
// Dependencies (install once):
//   npm install jose
//   npm install -D tsx typescript

import { jwtVerify, createRemoteJWKSet, JWTPayload } from 'jose';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface JwtHeader {
  alg: string;
  typ?: string;
  kid?: string;
  [key: string]: unknown;
}

export interface JwtPayload extends JWTPayload {
  // Standard claims (RFC 7519 §4.1)
  iss?: string;
  sub?: string;
  aud?: string | string[];
  exp?: number;
  nbf?: number;
  iat?: number;
  jti?: string;
  // OIDC additions
  nonce?: string;
  azp?: string;
  email?: string;
  preferred_username?: string;
  [key: string]: unknown;
}

export interface VerifyOptions {
  expectedIssuer: string;
  expectedAudience: string;
}

// ---------------------------------------------------------------------------
// Configuration — adjust for your Keycloak instance
// ---------------------------------------------------------------------------

const KEYCLOAK_BASE = 'http://localhost:8080';
const REALM = 'master';   // change to 'crunch' if using the seed realm
const JWKS_URL = `${KEYCLOAK_BASE}/realms/${REALM}/protocol/openid-connect/certs`;
const EXPECTED_ISSUER = `${KEYCLOAK_BASE}/realms/${REALM}`;
const EXPECTED_AUDIENCE = 'account';   // Keycloak's master realm default audience

const JWKS = createRemoteJWKSet(new URL(JWKS_URL));

// ---------------------------------------------------------------------------
// 1. Split the token into its three segments.
// ---------------------------------------------------------------------------

export function splitToken(token: string): {
  header: string;
  payload: string;
  signature: string;
} {
  // YOUR CODE HERE
  // Split on '.', validate exactly 3 parts, return the trio.
  throw new Error('splitToken not implemented');
}

// ---------------------------------------------------------------------------
// 2. Decode a base64url string to UTF-8.
// ---------------------------------------------------------------------------

export function base64UrlDecode(input: string): string {
  // YOUR CODE HERE
  //
  // base64url is base64 with:
  //   '+' -> '-'
  //   '/' -> '_'
  //   no trailing '=' padding
  //
  // Reverse those, then decode (atob in modern Node 20, or
  // Buffer.from(s, 'base64').toString('utf8')).
  throw new Error('base64UrlDecode not implemented');
}

// ---------------------------------------------------------------------------
// 3. Decode header and payload to JS objects.
// ---------------------------------------------------------------------------

export function decodeHeader(token: string): JwtHeader {
  // YOUR CODE HERE
  // Compose: splitToken -> base64UrlDecode -> JSON.parse on .header.
  throw new Error('decodeHeader not implemented');
}

export function decodePayload(token: string): JwtPayload {
  // YOUR CODE HERE
  throw new Error('decodePayload not implemented');
}

// ---------------------------------------------------------------------------
// 4. Verify the signature and claims using jose.
// ---------------------------------------------------------------------------

export async function verify(
  token: string,
  opts: VerifyOptions,
): Promise<JwtPayload> {
  // YOUR CODE HERE
  // Call jwtVerify(token, JWKS, { issuer, audience, algorithms: ['RS256'], clockTolerance: 5 }).
  // Return the payload.
  throw new Error('verify not implemented');
}

// ---------------------------------------------------------------------------
// 5. Tamper helper — for testing the failure path.
// ---------------------------------------------------------------------------

export function tamper(token: string, claim: string, newValue: unknown): string {
  // Decode the payload, mutate the claim, re-encode. The signature will no
  // longer match because the encoded payload changed.
  const parts = token.split('.');
  if (parts.length !== 3) throw new Error('not a JWT');

  const payloadJson = base64UrlDecode(parts[1]);
  const payload = JSON.parse(payloadJson);
  payload[claim] = newValue;

  const newPayloadB64 = Buffer.from(JSON.stringify(payload))
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

  return `${parts[0]}.${newPayloadB64}.${parts[2]}`;
}

// ---------------------------------------------------------------------------
// Pretty-printing helpers
// ---------------------------------------------------------------------------

function fmtTime(unixTimestamp: number | undefined): string {
  if (typeof unixTimestamp !== 'number') return '<missing>';
  const dt = new Date(unixTimestamp * 1000);
  const now = Date.now();
  const deltaSec = Math.round((unixTimestamp * 1000 - now) / 1000);
  const rel = deltaSec >= 0 ? `in ${deltaSec}s` : `${-deltaSec}s ago`;
  return `${dt.toISOString()} (${rel})`;
}

function printPayload(payload: JwtPayload): void {
  console.log('iss:  ', payload.iss);
  console.log('sub:  ', payload.sub);
  console.log('aud:  ', payload.aud);
  console.log('exp:  ', fmtTime(payload.exp));
  console.log('iat:  ', fmtTime(payload.iat));
  if (payload.nonce) console.log('nonce:', payload.nonce);
  if (payload.preferred_username) console.log('user: ', payload.preferred_username);
}

// ---------------------------------------------------------------------------
// Stretch (optional) — implement verifySignature from scratch.
// ---------------------------------------------------------------------------

export async function verifySignatureFromScratch(
  token: string,
  publicKeyPem: string,
): Promise<boolean> {
  // BONUS — see Step 10 of the exercise. Use crypto.subtle.importKey to
  // import the PEM-encoded RSA public key, then crypto.subtle.verify
  // with 'RSASSA-PKCS1-v1_5' over the (header || '.' || payload) signing input.
  throw new Error('verifySignatureFromScratch not implemented (bonus)');
}

// ---------------------------------------------------------------------------
// main
// ---------------------------------------------------------------------------

async function main() {
  const token = process.argv[2];
  if (!token) {
    console.error('Usage: tsx starter-jwt-decode.ts <token>');
    process.exit(1);
  }

  console.log('=== Header ===');
  console.log(decodeHeader(token));
  console.log();

  console.log('=== Payload ===');
  const payload = decodePayload(token);
  printPayload(payload);
  console.log();

  console.log('=== Verification ===');
  try {
    const verified = await verify(token, {
      expectedIssuer: EXPECTED_ISSUER,
      expectedAudience: EXPECTED_AUDIENCE,
    });
    console.log('OK — token verified.');
    console.log('Subject:', verified.sub);
  } catch (err: any) {
    console.log('FAIL —', err.code || err.name, ':', err.message);
  }
  console.log();

  console.log('=== Tampered-payload test ===');
  try {
    const tampered = tamper(token, 'sub', 'attacker');
    await verify(tampered, {
      expectedIssuer: EXPECTED_ISSUER,
      expectedAudience: EXPECTED_AUDIENCE,
    });
    console.log('WARNING — tampered token verified (bug in your implementation)');
  } catch (err: any) {
    console.log('OK — tampered token rejected:', err.code || err.message);
  }
}

main().catch((err) => {
  console.error('Unhandled error:', err);
  process.exit(1);
});
