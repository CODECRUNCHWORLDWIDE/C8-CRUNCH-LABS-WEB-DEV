# Challenge 2 — Build a Correct JWKS Cache

> The JSON Web Key Set fetched from the IdP is the public material your service uses to verify every incoming token. Fetching it on every request would obliterate your latency and load up the IdP; caching it forever would break when the IdP rotates keys. This challenge asks you to implement a JWKS cache that does what production caches do — TTL-based caching with a fall-back fresh fetch on a kid-miss — and prove it works correctly under a simulated key rotation. The deliverable is a small Node module plus a test script that demonstrates each behavior.

**Estimated time:** 90 minutes.
**Prerequisite:** Exercise 1 finished. Familiarity with Node's `fetch`.

---

## The brief

You will implement a module `jwks-cache.ts` exporting a single class:

```typescript
export class JwksCache {
  constructor(jwksUrl: string, options?: JwksCacheOptions) { /* ... */ }
  async getKey(kid: string): Promise<JWK | null> { /* ... */ }
  // For testing:
  get stats(): { hits: number; misses: number; fetches: number; refetches: number } { /* ... */ }
}
```

The class must:

1. **Cache the JWKS response in memory.** The default TTL is read from the response's `cache-control: max-age` header (typical Keycloak default: 60 seconds), with a fallback of 600 seconds if the header is absent.
2. **Serve `getKey(kid)` from the cache** if the cache is fresh and the `kid` is present.
3. **Re-fetch on a kid miss.** If the requested `kid` is not in the cached JWKS, fetch a fresh JWKS once and search again. This is the key-rotation case: the IdP added a new key, started signing with it, and our cache is stale.
4. **Coalesce concurrent fetches.** If five requests hit `getKey('new-kid')` at the same time and trigger a cache miss, only **one** HTTP fetch should happen; the other four should await the result of the first.
5. **Apply an exponential-backoff retry** on fetch failure (up to 3 attempts, starting at 100 ms delay, doubling each time). After 3 failures, throw — do not silently fail.
6. **Track stats** for testing — `hits`, `misses` (kid present, cache fresh), `fetches` (initial fetch or TTL-expired refetch), `refetches` (kid-miss-triggered refetch).

---

## Why this is harder than it looks

The first three behaviors are straightforward. The remaining three are where production code fails:

- **Concurrent-fetch coalescing.** A naive implementation does five fetches because each of five concurrent callers sees an empty cache and starts its own. The fix is to store the in-flight Promise itself in the cache so concurrent callers await the same Promise.
- **Backoff with retry.** When the IdP is having a bad minute, retrying immediately makes the problem worse. Exponential backoff smooths the load while giving the IdP time to recover. Without retry, a single failed fetch leaves your service unable to verify tokens until the next inbound request triggers another fetch.
- **Re-fetch policy on kid miss.** A naive policy refetches on every miss — letting an attacker DoS your IdP by sending tokens with random `kid` values. The fix is to rate-limit kid-miss refetches: at most one per second, or one per cache TTL period, depending on how strict you want to be.

---

## Suggested approach

```typescript
interface JwksCacheOptions {
  fallbackTtlSec?: number;        // default 600
  fetchRateLimitMs?: number;       // min interval between kid-miss refetches, default 1000
  maxRetries?: number;             // default 3
  retryBaseMs?: number;            // default 100
}

interface JwksDocument {
  keys: JWK[];
}

interface CacheEntry {
  doc: JwksDocument;
  fetchedAt: number;
  expiresAt: number;
}

export class JwksCache {
  private cache: CacheEntry | null = null;
  private inflight: Promise<JwksDocument> | null = null;
  private lastKidMissRefetchAt = 0;
  // ... stats counters ...
}
```

The interesting methods:

```typescript
private async fetchOnce(): Promise<JwksDocument> {
  // If a fetch is already in flight, return the in-flight Promise.
  if (this.inflight) return this.inflight;

  // Otherwise, start a new fetch with retry logic.
  this.inflight = this.fetchWithRetry().finally(() => {
    this.inflight = null;
  });
  return this.inflight;
}

private async fetchWithRetry(): Promise<JwksDocument> {
  let delay = this.opts.retryBaseMs;
  for (let attempt = 0; attempt < this.opts.maxRetries; attempt++) {
    try {
      const res = await fetch(this.jwksUrl);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const doc = await res.json();
      // Parse cache-control for max-age
      const ttl = parseCacheControlMaxAge(res.headers.get('cache-control'))
        ?? this.opts.fallbackTtlSec;
      this.cache = {
        doc,
        fetchedAt: Date.now(),
        expiresAt: Date.now() + ttl * 1000,
      };
      this.fetches++;
      return doc;
    } catch (err) {
      if (attempt === this.opts.maxRetries - 1) throw err;
      await sleep(delay);
      delay *= 2;
    }
  }
  throw new Error('unreachable');
}

async getKey(kid: string): Promise<JWK | null> {
  // 1. If cache is fresh and has the kid, return it.
  if (this.cache && Date.now() < this.cache.expiresAt) {
    const found = this.cache.doc.keys.find((k) => k.kid === kid);
    if (found) { this.hits++; return found; }
    this.misses++;
    // 2. Kid not in fresh cache — possibly a rotation.
    //    Rate-limit kid-miss refetches.
    const now = Date.now();
    if (now - this.lastKidMissRefetchAt < this.opts.fetchRateLimitMs) {
      return null;
    }
    this.lastKidMissRefetchAt = now;
    this.refetches++;
    const fresh = await this.fetchOnce();
    return fresh.keys.find((k) => k.kid === kid) ?? null;
  }
  // 3. Cache stale or absent — do an initial fetch.
  const doc = await this.fetchOnce();
  return doc.keys.find((k) => k.kid === kid) ?? null;
}
```

This is the rough shape. Fill in the details, test it, refine.

---

## Test script

Write a separate `test-jwks-cache.ts` that demonstrates each behavior. Suggested tests:

1. **Hit.** Pre-load the cache, ask for a known kid, assert `hits === 1, fetches === 0`.
2. **Initial miss.** Empty cache, ask for a known kid, assert `fetches === 1, hits === 0, refetches === 0`.
3. **TTL expiry.** Pre-load with a 1-second TTL, wait 2 seconds, ask, assert a new `fetches`.
4. **Kid miss refetch.** Pre-load with keys `['key-1']`, ask for `'key-2'`, assert `refetches === 1` and either the new key is returned or `null` is returned (depending on whether your mock IdP rotated).
5. **Coalesce.** Five concurrent `getKey('new-kid')` calls; assert exactly one fetch happened (`fetches + refetches`).
6. **Rate-limit on kid-miss DoS.** Ten `getKey('random-kid-' + i)` in quick succession; assert at most one refetch in any 1-second window.
7. **Retry on transient failure.** Stub `fetch` to fail twice then succeed; assert eventual success after ~300 ms (100 + 200).
8. **Hard failure after max retries.** Stub `fetch` to fail consistently; assert the `getKey` call rejects after the third attempt.

Use Node's `--test` runner or `vitest`. Either is fine.

---

## What "done" looks like

A working `jwks-cache.ts` plus `test-jwks-cache.ts` that passes all eight tests, plus a `notes.md` (one page) explaining:

- The trade-off between aggressive kid-miss refetching (resilient to rotation, but DoSable) and conservative refetching (DoS-resistant but slow to pick up new keys).
- Why coalescing matters at production load.
- One real-world scenario where each rate-limit value would be wrong: 1 ms is too low (no rate limiting), 1 minute is too high (rotation is slow to detect).

---

## Grading rubric

| Aspect | Weight |
|--------|--------|
| `getKey` returns the correct key for the cache-fresh case | 15% |
| TTL expiry triggers a refetch | 15% |
| Kid-miss triggers a single refetch | 15% |
| Concurrent fetches are coalesced | 15% |
| Retry-with-backoff on transient failure | 15% |
| Hard failure after max retries | 10% |
| `notes.md` covers the three trade-offs | 15% |

---

## Stretch goals

- Persist the cache to disk (in `/tmp/jwks-cache.json`) so a service restart does not require an initial fetch.
- Support multiple JWKS URLs (multi-issuer apps).
- Emit metrics — number of cache hits, fetches, refetches, failures — to a `Prometheus`-compatible counter set.
- Add an LRU bound on the number of keys cached (useful when keys are rotated but old ones remain valid for a grace period).

---

## References

- RFC 7517 — JSON Web Key. <https://datatracker.ietf.org/doc/html/rfc7517>
- RFC 7517 §4.5 — The `kid` (Key ID) parameter. <https://datatracker.ietf.org/doc/html/rfc7517#section-4.5>
- OpenID Connect Core §10 — Signing and Encryption Keys. <https://openid.net/specs/openid-connect-core-1_0.html#SigEnc>
- `jose` library — `createRemoteJWKSet` source. <https://github.com/panva/jose/blob/main/src/jwks/remote.ts>
- Auth0 — JWKS endpoint best practices. <https://auth0.com/docs/secure/tokens/json-web-tokens/json-web-key-set>
- Cloudflare — How we cache JWKS at the edge (blog post). <https://blog.cloudflare.com/>
