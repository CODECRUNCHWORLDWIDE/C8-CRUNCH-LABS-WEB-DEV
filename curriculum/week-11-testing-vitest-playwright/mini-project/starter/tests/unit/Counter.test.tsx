// tests/component/Counter.test.tsx
//
// Component tests for the Counter — the eight tests from exercise 2, carried
// forward as a known-good starter the student extends with Profile tests.

import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Counter } from '../../src/components/Counter'

describe('Counter', () => {
  it('renders the initial count of zero', () => {
    render(<Counter />)
    expect(screen.getByRole('status')).toHaveTextContent(/count: 0/i)
  })

  it('renders the initial count from the `initial` prop', () => {
    render(<Counter initial={42} />)
    expect(screen.getByRole('status')).toHaveTextContent(/count: 42/i)
  })

  it('increments the count when the Increment button is clicked', async () => {
    const user = userEvent.setup()
    render(<Counter initial={5} />)

    await user.click(screen.getByRole('button', { name: /^increment$/i }))

    expect(screen.getByRole('status')).toHaveTextContent(/count: 6/i)
  })

  it('decrements the count when the Decrement button is clicked', async () => {
    const user = userEvent.setup()
    render(<Counter initial={5} />)

    await user.click(screen.getByRole('button', { name: /^decrement$/i }))

    expect(screen.getByRole('status')).toHaveTextContent(/count: 4/i)
  })

  it('resets to the initial value when Reset is clicked', async () => {
    const user = userEvent.setup()
    render(<Counter initial={10} />)

    await user.click(screen.getByRole('button', { name: /^increment$/i }))
    await user.click(screen.getByRole('button', { name: /^increment$/i }))
    await user.click(screen.getByRole('button', { name: /^reset$/i }))

    expect(screen.getByRole('status')).toHaveTextContent(/count: 10/i)
  })

  it('hides the step-size input by default', () => {
    render(<Counter />)
    expect(screen.queryByLabelText(/step size/i)).not.toBeInTheDocument()
  })

  it('reveals the step-size input when advanced mode is enabled', async () => {
    const user = userEvent.setup()
    render(<Counter />)

    await user.click(screen.getByRole('button', { name: /show advanced mode/i }))

    expect(screen.getByLabelText(/step size/i)).toBeInTheDocument()
  })

  it('increments by the current step size when advanced mode is enabled', async () => {
    const user = userEvent.setup()
    render(<Counter initial={0} />)

    await user.click(screen.getByRole('button', { name: /show advanced mode/i }))
    const stepInput = screen.getByLabelText(/step size/i)
    await user.clear(stepInput)
    await user.type(stepInput, '5')

    await user.click(screen.getByRole('button', { name: /^increment$/i }))

    expect(screen.getByRole('status')).toHaveTextContent(/count: 5/i)
  })

  it('uses an aria-live region to announce count changes', () => {
    render(<Counter />)
    const status = screen.getByRole('status')
    expect(status).toHaveAttribute('aria-live', 'polite')
  })
})
