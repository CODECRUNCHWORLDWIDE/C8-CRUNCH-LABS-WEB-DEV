// src/components/Counter.tsx
//
// Same Counter component from exercise 2, shipped as part of the SPA so the
// component test can be carried forward into the mini-project.

import { useState } from 'react'

type CounterProps = {
  initial?: number
}

export function Counter({ initial = 0 }: CounterProps) {
  const [count, setCount] = useState(initial)
  const [step, setStep] = useState(1)
  const [advanced, setAdvanced] = useState(false)

  return (
    <section aria-labelledby="counter-heading">
      <h2 id="counter-heading">Counter</h2>

      <p role="status" aria-live="polite">
        Count: {count}
      </p>

      <div>
        <button type="button" onClick={() => setCount(c => c + step)}>
          Increment
        </button>
        <button type="button" onClick={() => setCount(c => c - step)}>
          Decrement
        </button>
        <button type="button" onClick={() => setCount(initial)}>
          Reset
        </button>
      </div>

      <button
        type="button"
        aria-expanded={advanced}
        onClick={() => setAdvanced(a => !a)}
      >
        {advanced ? 'Hide advanced mode' : 'Show advanced mode'}
      </button>

      {advanced && (
        <label htmlFor="step-size-input">
          Step size
          <input
            id="step-size-input"
            type="number"
            min={1}
            value={step}
            onChange={e => setStep(Number(e.target.value) || 1)}
          />
        </label>
      )}
    </section>
  )
}
