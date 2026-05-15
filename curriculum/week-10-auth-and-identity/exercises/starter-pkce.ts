// Exercise 2 — Generate a PKCE verifier and challenge in Node.
//
// Run with: npx tsx starter-pkce.ts
//
// The output is two strings: the verifier (which you keep) and the challenge
// (which you put in the /authorize URL). See the exercise README for what to
// do with them.

// ---------------------------------------------------------------------------
// 1. base64url-encode a byte array.
// ---------------------------------------------------------------------------

export function base64UrlEncode(bytes: Uint8Array): string {
  // YOUR CODE HERE
  //
  // Convert the bytes to a base64 string, then:
  //   '+' -> '-'
  //   '/' -> '_'
  //   strip trailing '=' padding
  //
  // In Node: Buffer.from(bytes).toString('base64') is a fine starting point.
  // In a browser: build a binary string and call btoa().
  throw new Error('base64UrlEncode not implemented');
}

// ---------------------------------------------------------------------------
// 2. Generate a 43-character verifier from 32 random bytes.
// ---------------------------------------------------------------------------

export function generateVerifier(): string {
  // YOUR CODE HERE
  //
  // RFC 7636 §4.1: a high-entropy random string of length 43 to 128 from
  // the URL-safe alphabet [A-Za-z0-9-._~].
  //
  // The conventional implementation is 32 bytes of crypto-random data,
  // base64url-encoded (which yields 43 characters from the [A-Za-z0-9-_]
  // subset of the allowed alphabet).
  //
  // Use crypto.getRandomValues (works in both Node 20+ and browsers).
  throw new Error('generateVerifier not implemented');
}

// ---------------------------------------------------------------------------
// 3. Derive the challenge: BASE64URL(SHA-256(verifier)).
// ---------------------------------------------------------------------------

export async function deriveChallenge(verifier: string): Promise<string> {
  // YOUR CODE HERE
  //
  // RFC 7636 §4.2: code_challenge = BASE64URL(SHA256(ASCII(code_verifier))).
  //
  // The Web Crypto API:
  //   const data = new TextEncoder().encode(verifier);
  //   const hash = await crypto.subtle.digest('SHA-256', data);
  //   return base64UrlEncode(new Uint8Array(hash));
  throw new Error('deriveChallenge not implemented');
}

// ---------------------------------------------------------------------------
// 4. Self-test: confirm verifier and challenge satisfy the spec.
// ---------------------------------------------------------------------------

function selfTest(verifier: string, challenge: string): void {
  const verifierAlphabet = /^[A-Za-z0-9\-._~]+$/;
  const challengeAlphabet = /^[A-Za-z0-9\-_]+$/;
  const okLen = verifier.length >= 43 && verifier.length <= 128;
  const okV = verifierAlphabet.test(verifier);
  const okC = challengeAlphabet.test(challenge) && challenge.length === 43;

  console.log('Verifier length:    ', verifier.length, okLen ? '(OK)' : '(BAD — must be 43..128)');
  console.log('Verifier alphabet:  ', okV ? 'OK' : 'BAD — contains a character outside [A-Za-z0-9-._~]');
  console.log('Challenge length:   ', challenge.length, challenge.length === 43 ? '(OK)' : '(BAD — SHA256 base64url is 43 chars)');
  console.log('Challenge alphabet: ', okC ? 'OK' : 'BAD — contains a character outside [A-Za-z0-9-_]');
}

// ---------------------------------------------------------------------------
// main
// ---------------------------------------------------------------------------

async function main() {
  const verifier = generateVerifier();
  const challenge = await deriveChallenge(verifier);

  console.log('verifier:  ', verifier);
  console.log('challenge: ', challenge);
  console.log();
  console.log('Self-test:');
  selfTest(verifier, challenge);
  console.log();
  console.log('Save these. Use the challenge in the /authorize URL,');
  console.log('then send the verifier to /token when exchanging the code.');
  console.log();
  console.log('Example /authorize URL:');
  console.log(
    'http://localhost:8080/realms/crunch/protocol/openid-connect/auth' +
      '?response_type=code' +
      '&client_id=spa-client' +
      '&redirect_uri=' + encodeURIComponent('http://localhost:5173/callback') +
      '&scope=' + encodeURIComponent('openid profile email') +
      '&state=somestate' +
      '&nonce=somenonce' +
      '&code_challenge=' + challenge +
      '&code_challenge_method=S256',
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
