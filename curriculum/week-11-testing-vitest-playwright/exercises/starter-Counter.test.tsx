// starter-Counter.test.tsx
//
// Exercise 2 — your starter test file for the Counter component.
//
// The first two tests are filled in to show the shape. You write the rest.
// You should end up with at least eight passing tests.
//
// Run: `npm test`

import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Counter } from './starter-Counter'

describe('Counter', () => {
  it('renders the initial count of zero', () => {
    // Arrange
    render(<Counter />)

    // Act — none

    // Assert
    expect(screen.getByRole('status')).toHaveTextContent(/count: 0/i)
  })

  it('renders the initial count from the `initial` prop', () => {
    // Arrange
    render(<Counter initial={42} />)

    // Assert
    expect(screen.getByRole('status')).toHaveTextContent(/count: 42/i)
  })

  // ---- TODO: increment / decrement / reset --------------------------------

  it('increments the count when the Increment button is clicked', async () => {
    // TODO
    // - Render with initial={5}.
    // - Click the Increment button.
    // - Assert the status now reads "Count: 6".
  })

  it('decrements the count when the Decrement button is clicked', async () => {
    // TODO
  })

  it('resets to the initial value when Reset is clicked after some changes', async () => {
    // TODO
    // - Render with initial={10}.
    // - Click Increment twice.
    // - Click Reset.
    // - Assert the status reads "Count: 10".
  })

  // ---- TODO: advanced mode + step size ------------------------------------

  it('hides the step-size input by default', () => {
    // TODO: Use screen.queryByLabelText(/step size/i) — it returns null when
    // not present (unlike getByLabelText which throws).
  })

  it('reveals the step-size input when advanced mode is enabled', async () => {
    // TODO
  })

  it('increments by the current step size when advanced mode is enabled', async () => {
    // TODO
    // - Render with initial={0}.
    // - Toggle advanced mode.
    // - Clear the step-size input and type "5".
    // - Click Increment.
    // - Assert the status reads "Count: 5".
  })

  // ---- TODO: accessibility ------------------------------------------------

  it('uses an aria-live region to announce count changes', () => {
    // TODO
    // - Render the component.
    // - Find the status region.
    // - Assert it has aria-live="polite".
  })
})

// ============================================================================
// Reflection — answer these in a comment block below before submitting.
// ============================================================================
//
// 1. The lecture says "do not mock React Router, do not mock children." Is
//    there anywhere in your test where you were tempted to mock something?
//    Why did you not?
//
// 2. The "step size 5, then increment" test has many lines of Arrange. Could
//    it be split into two tests? Should it?
//
// 3. If a designer renamed the "Increment" button to "Add" (one word, capital A),
//    which of your tests would still pass, and which would fail? Are the
//    failures appropriate? Why?
//
// Your answers:
//
//
//
//
