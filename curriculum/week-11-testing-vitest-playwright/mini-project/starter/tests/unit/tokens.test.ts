// tests/unit/tokens.test.ts
//
// Unit tests for the pure helpers in src/lib/tokens.js.
//
// Runs in the `node` environment (configured via environmentMatchGlobs in
// vitest.config.ts) — no JSDOM, no DOM globals. Fast.
//
// These tests are the starter; write additional tests for `decodeJwt` and
// `formatExpiresIn` per the mini-project README.

import { describe, it, expect } from 'vitest'
import { isExpired, decodeJwt, formatExpiresIn } from '../../src/lib/tokens.js'

describe('isExpired', () => {
  it('returns true when exp is in the past', () => {
    // Arrange
    const token = { exp: 1_000_000_000 } // 2001-09-09
    const now = Date.now()

    // Act
    const result = isExpired(token, now)

    // Assert
    expect(result).toBe(true)
  })

  it('returns false when exp is in the future', () => {
    const tenMinutesFromNow = Math.floor(Date.now() / 1000) + 600
    expect(isExpired({ exp: tenMinutesFromNow })).toBe(false)
  })

  it('returns false at exactly exp (uses strict less-than)', () => {
    const exp = 2_000_000_000
    expect(isExpired({ exp }, exp * 1000)).toBe(false)
  })
})

describe('decodeJwt', () => {
  // A well-formed JWT for testing — payload is {"sub":"user-1","exp":2000000000}.
  // The signature segment is intentionally garbage; decodeJwt does NOT verify.
  const VALID_TOKEN =
    'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9' +
    '.eyJzdWIiOiJ1c2VyLTEiLCJleHAiOjIwMDAwMDAwMDB9' +
    '.fake-signature-not-verified-here'

  it('decodes the payload of a well-formed JWT', () => {
    // Arrange / Act
    const decoded = decodeJwt(VALID_TOKEN)

    // Assert
    expect(decoded).toMatchObject({ sub: 'user-1', exp: 2_000_000_000 })
  })

  it('throws on a token that does not have three segments', () => {
    expect(() => decodeJwt('not.a.valid.jwt.has.too.many.dots')).toThrow()
    expect(() => decodeJwt('only-one-segment')).toThrow()
    expect(() => decodeJwt('two.segments')).toThrow()
  })

  it('throws on a token whose payload is not valid base64url', () => {
    expect(() => decodeJwt('header.!!!not-base64!!!.signature')).toThrow()
  })
})

describe('formatExpiresIn', () => {
  it('returns "in N minutes" for tokens expiring soon', () => {
    const tenMinutesFromNowSec = Math.floor(Date.now() / 1000) + 600
    const result = formatExpiresIn({ exp: tenMinutesFromNowSec })
    expect(result).toMatch(/in \d+ minutes?/)
  })

  it('returns "expired" for tokens whose exp is in the past', () => {
    expect(formatExpiresIn({ exp: 1_000_000_000 })).toBe('expired')
  })

  it('returns "expires now" at exactly exp', () => {
    const exp = 2_000_000_000
    expect(formatExpiresIn({ exp }, exp * 1000)).toBe('expires now')
  })
})
