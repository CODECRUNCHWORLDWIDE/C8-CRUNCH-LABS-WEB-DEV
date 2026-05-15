// src/lib/tokens.js
//
// Pure helpers for JWT inspection. None of these verify a signature — that
// is done by the OIDC client library against the JWKS endpoint. These helpers
// are for UI-side decoding and presentation only.
//
// Tested in tests/unit/tokens.test.ts.

/**
 * Returns true when the token has expired relative to `now`.
 *
 * Token `exp` claim is in seconds since epoch (per RFC 7519); `now` is in ms.
 * Uses strict `<` so that a token whose `exp` exactly matches `now` is NOT
 * considered expired.
 */
export function isExpired(token, now = Date.now()) {
  return token.exp * 1000 < now
}

/**
 * Decodes a JWT into its parsed payload object.
 *
 * Does NOT verify the signature — for client-side display only. Throws if
 * the token does not have exactly three dot-separated segments or if the
 * payload segment is not valid base64url-encoded JSON.
 */
export function decodeJwt(token) {
  const segments = token.split('.')
  if (segments.length !== 3) {
    throw new Error(`Expected 3 segments, got ${segments.length}`)
  }
  const [, payload] = segments
  const padded = payload.padEnd(payload.length + ((4 - (payload.length % 4)) % 4), '=')
  const base64 = padded.replace(/-/g, '+').replace(/_/g, '/')
  let json
  try {
    json = atob(base64)
  } catch (err) {
    throw new Error('Invalid base64url payload', { cause: err })
  }
  try {
    return JSON.parse(json)
  } catch (err) {
    throw new Error('Payload is not valid JSON', { cause: err })
  }
}

/**
 * Formats a JWT's expiry as a human-readable string.
 *
 *   "expired"          when exp is strictly before now.
 *   "expires now"      when exp equals now (boundary).
 *   "in N minutes"     when exp is in the future, within an hour.
 *   "in N hours"       when exp is more than an hour ahead.
 */
export function formatExpiresIn(token, now = Date.now()) {
  const expMs = token.exp * 1000
  if (expMs < now) return 'expired'
  if (expMs === now) return 'expires now'

  const diffSec = Math.round((expMs - now) / 1000)
  if (diffSec < 3600) {
    const minutes = Math.max(1, Math.round(diffSec / 60))
    return `in ${minutes} minute${minutes === 1 ? '' : 's'}`
  }
  const hours = Math.round(diffSec / 3600)
  return `in ${hours} hour${hours === 1 ? '' : 's'}`
}
