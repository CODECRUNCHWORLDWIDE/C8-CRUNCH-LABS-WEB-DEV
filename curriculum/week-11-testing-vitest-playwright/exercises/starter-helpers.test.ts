// starter-helpers.test.ts
//
// Exercise 1 — your starter test file. Fill in the bodies of each `it` block
// with an Arrange / Act / Assert structure. The first test is filled in to
// show the shape; the rest are stubs.
//
// Run: `npm test`
//
// You should end up with 10 passing tests when you complete the exercise.

import { describe, it, expect } from 'vitest'
import {
  isExpired,
  formatRelativeTime,
  pickClaims,
} from './starter-helpers'

describe('isExpired', () => {
  it('returns true when exp is in the past', () => {
    // Arrange — set up the world.
    const token = { exp: 1_000_000_000 } // 2001-09-09, well in the past
    const now = Date.now() // current real time

    // Act — perform the single action under test.
    const result = isExpired(token, now)

    // Assert — check the result.
    expect(result).toBe(true)
  })

  it('returns false when exp is in the future', () => {
    // TODO: arrange a token whose exp is 10 minutes from now.
    // TODO: act — call isExpired with the default `now`.
    // TODO: assert the result is false.
  })

  it('returns false at exactly exp (uses strict less-than)', () => {
    // TODO: arrange a token with a known exp, and pass `now` as exactly
    //       token.exp * 1000.
    // TODO: act.
    // TODO: assert the result is false (because of `<`, not `<=`).
  })
})

describe('formatRelativeTime', () => {
  it("returns 'just now' for a 5-second difference", () => {
    // TODO
  })

  it("returns 'X seconds ago' for a 40-second past difference", () => {
    // TODO
  })

  it("returns 'in X minutes' for a 5-minute future difference", () => {
    // TODO
  })

  it("returns 'X hours ago' for a 3-hour past difference", () => {
    // TODO
  })
})

describe('pickClaims', () => {
  it('returns only the allowed keys', () => {
    // TODO: pickClaims({a:1, b:2, c:3}, ['a', 'c']) should return {a:1, c:3}.
  })

  it('skips allowed keys that do not exist on the payload', () => {
    // TODO: pickClaims({a:1}, ['a', 'b']) should return {a:1} — no `b` key.
    // Hint: `expect(result).not.toHaveProperty('b')` pins this.
  })

  it('does not mutate the original payload', () => {
    // TODO: arrange a payload, call pickClaims, assert the original is unchanged.
  })
})

// ============================================================================
// Reflection — answer these in a comment block below before submitting.
// ============================================================================
//
// 1. Which of the 10 tests follows AAA most clearly? Why?
//
// 2. Which test would still pass if the helper's internal implementation were
//    rewritten in a different style (e.g. using Math.floor instead of
//    Math.round)? Which would fail?
//
// 3. The `pickClaims` "does not mutate" test asserts on the absence of an
//    effect. What other helpers in your real code would benefit from a
//    similar non-mutation test?
//
// Your answers:
//
//
//
//
