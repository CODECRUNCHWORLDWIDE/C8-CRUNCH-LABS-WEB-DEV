/*
 * Exercise 3 — React Counter and List
 *
 * Estimated time: 60–90 minutes.
 *
 * Goal:
 *   Complete the two React components below by filling in every `TODO`
 *   marker. The components are designed to be embedded as islands in an
 *   Astro page later this week, but they are valid stand-alone React
 *   components — you can also render them in a vanilla Vite + React app
 *   to verify they work.
 *
 * How to verify:
 *   The compiled JSX is syntactically valid JavaScript. To check the JSX
 *   syntax outside React itself, you can:
 *     - Open the file in VS Code with a JSX-aware extension (ESLint with
 *       eslint-plugin-react) and ensure the file shows no syntax errors.
 *     - Or, in a Vite + React project, copy the components into
 *       src/components/, import them into src/App.jsx, and run
 *       `npm run dev` — if React renders without throwing, the JSX parses.
 *
 *   When you finish, every TODO should be replaced with working code.
 *   The reference SOLUTIONS.md walks through every replacement.
 */

import { useEffect, useMemo, useState } from "react";

/* ------------------------------------------------------------------ *
 * Component 1 — Counter                                              *
 *                                                                    *
 * A simple counter that:                                             *
 *   - starts at the `initial` prop (default 0)                       *
 *   - has +1 and -1 buttons                                          *
 *   - has a "reset" button that returns to `initial`                 *
 *   - persists the count to localStorage under `key` (a prop)        *
 *   - reads the persisted value at mount, falling back to `initial`  *
 *   - emits an `onChange(newCount)` callback when the count changes  *
 *                                                                    *
 * Props:                                                             *
 *   initial    — number (default 0)                                  *
 *   key        — string (default "counter")                          *
 *   onChange   — function (newCount) => void  (optional)             *
 *                                                                    *
 * Note: React reserves `key` as a special prop for list items, so    *
 * we will accept it under a different name. Call it `storageKey`.    *
 * ------------------------------------------------------------------ */

export function Counter({ initial = 0, storageKey = "counter", onChange }) {
  // TODO 1.1: Declare a `count` state with `useState`. The initializer
  // function should read the persisted value from localStorage under
  // `storageKey`, and fall back to `initial` if nothing is persisted
  // or if the persisted value cannot be parsed as a number.
  //
  // Hint: useState accepts a function for lazy initialization, so the
  // localStorage read only runs once on mount, not on every render.
  //
  // Reference: https://react.dev/reference/react/useState#avoiding-recreating-the-initial-state
  //
  // Example shape:
  //   const [count, setCount] = useState(() => {
  //     /* read from localStorage; parse; validate; return number */
  //   });

  const [count, setCount] = useState(initial); // <-- replace `initial` with the lazy initializer

  // TODO 1.2: Add a `useEffect` that runs whenever `count` or `storageKey`
  // changes. Write the current `count` to localStorage under `storageKey`.
  // Also call `onChange(count)` if it was provided.
  //
  // Reference: https://react.dev/reference/react/useEffect
  //
  // The dependency array should include every value from the component
  // scope that the effect reads. ESLint's `react-hooks/exhaustive-deps`
  // rule will flag missing dependencies; trust it.

  // useEffect(() => { ... }, [/* deps */]);

  // TODO 1.3: Write three handlers — increment, decrement, reset.
  // Use the functional updater form of setCount (c => c + 1) so the
  // handlers work correctly when called rapidly. Reset returns to
  // `initial`, not to zero (so the prop is honored).

  const increment = () => {}; // <-- TODO
  const decrement = () => {}; // <-- TODO
  const reset = () => {};     // <-- TODO

  // The JSX below is complete. It uses the four pieces above:
  // `count` (state), `increment`, `decrement`, `reset` (handlers).

  return (
    <section className="counter" aria-label="Counter">
      <p aria-live="polite" className="counter-value">
        Count: <strong>{count}</strong>
      </p>
      <div className="counter-controls" role="group" aria-label="Counter controls">
        <button type="button" onClick={decrement} aria-label="Decrease by 1">
          −1
        </button>
        <button type="button" onClick={increment} aria-label="Increase by 1">
          +1
        </button>
        <button type="button" onClick={reset} aria-label="Reset to initial value">
          Reset
        </button>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ *
 * Component 2 — FilteredList                                         *
 *                                                                    *
 * A list of items with a search box that filters in real time.       *
 * The filter is debounced — the list does not refilter until 200ms   *
 * after the last keystroke.                                          *
 *                                                                    *
 * Props:                                                             *
 *   items       — array of { id, title, description } objects        *
 *   placeholder — string (default "Search...")                       *
 *                                                                    *
 * Behavior:                                                          *
 *   - Empty query → show all items.                                  *
 *   - Non-empty query → show items whose title or description        *
 *     case-insensitively contains the query (after trim).            *
 *   - Show the count of visible items above the list.                *
 *   - Show a "No matches for 'q'" message when filtered is empty.    *
 *   - Each <li> must have a stable `key` (use item.id).              *
 * ------------------------------------------------------------------ */

export function FilteredList({ items, placeholder = "Search..." }) {
  // TODO 2.1: Declare a `query` state initialized to "".

  const [query, setQuery] = useState(""); // (this one is provided)

  // TODO 2.2: Declare a `debouncedQuery` state initialized to "".

  const [debouncedQuery, setDebouncedQuery] = useState(""); // <-- replace if needed

  // TODO 2.3: Add a useEffect that, whenever `query` changes, schedules
  // a setTimeout that sets `debouncedQuery` to the current `query` 200ms
  // later. Return a cleanup function that clears the timeout — this is
  // what makes the debounce work: every new keystroke cancels the
  // previous pending update.
  //
  // Reference: https://react.dev/learn/synchronizing-with-effects
  //
  // useEffect(() => {
  //   const id = setTimeout(/* ... */, 200);
  //   return () => /* clear it */;
  // }, [query]);

  // TODO 2.4: Compute the filtered list with `useMemo`. Trim and
  // lowercase the debouncedQuery; if empty, return `items` unchanged;
  // otherwise filter by case-insensitive substring match against the
  // item's title OR description.
  //
  // The dependency array should be [items, debouncedQuery].
  //
  // Reference: https://react.dev/reference/react/useMemo

  const filtered = items; // <-- replace with useMemo(...)

  // The JSX below is complete.

  return (
    <section className="filtered-list" aria-labelledby="filtered-list-heading">
      <h3 id="filtered-list-heading">Searchable list</h3>

      <label htmlFor="filtered-list-input">{placeholder}</label>
      <input
        id="filtered-list-input"
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        autoComplete="off"
        placeholder={placeholder}
      />

      <p className="result-count" aria-live="polite">
        {filtered.length} result{filtered.length === 1 ? "" : "s"}
      </p>

      <ul role="list" className="results">
        {filtered.map((item) => (
          <li key={item.id} className="result">
            <h4>{item.title}</h4>
            <p>{item.description}</p>
          </li>
        ))}
      </ul>

      {filtered.length === 0 && debouncedQuery && (
        <p className="empty" role="status">
          No matches for "{debouncedQuery}".
        </p>
      )}
    </section>
  );
}

/* ------------------------------------------------------------------ *
 * Example usage (a parent component that demonstrates both)          *
 *                                                                    *
 * Once you have completed every TODO above, this exported component  *
 * should render a working counter and a working filtered list.       *
 *                                                                    *
 * In an Astro page, you would render it as:                          *
 *                                                                    *
 *   import Example from "../components/example.jsx";                 *
 *   <Example client:visible />                                       *
 *                                                                    *
 * In a Vite + React app, you would render it from main.jsx:          *
 *                                                                    *
 *   import { createRoot } from "react-dom/client";                   *
 *   import Example from "./example.jsx";                             *
 *   createRoot(document.getElementById("root")).render(<Example />); *
 * ------------------------------------------------------------------ */

const SAMPLE_ITEMS = [
  { id: "todo", title: "Todo app", description: "Persistent todos in localStorage." },
  { id: "weather", title: "Weather dashboard", description: "Three-city weather with async/await." },
  { id: "form", title: "Multi-step signup form", description: "Accessible inline errors." },
  { id: "counter", title: "Counter island", description: "This very component." },
  { id: "portfolio", title: "Astro portfolio", description: "Four pages, one React island." },
];

export default function Example() {
  return (
    <main className="example">
      <h2>Counter</h2>
      <Counter initial={0} storageKey="example-counter" />

      <h2>Filtered List</h2>
      <FilteredList items={SAMPLE_ITEMS} placeholder="Search projects..." />
    </main>
  );
}

/* ------------------------------------------------------------------ *
 * Reflection questions                                               *
 *                                                                    *
 * Write your answers in notes. The SOLUTIONS.md file has reference   *
 * answers; check yours against it after attempting.                  *
 *                                                                    *
 *   1. Why must Counter accept `storageKey` rather than `key`?       *
 *                                                                    *
 *   2. Why does the localStorage read live inside the useState       *
 *      initializer function rather than at the top of the function?  *
 *                                                                    *
 *   3. Why does the FilteredList debounce the query? What happens    *
 *      to the user experience if it does not?                        *
 *                                                                    *
 *   4. What is the dependency array of the debounce useEffect, and   *
 *      why does it have exactly that value?                          *
 *                                                                    *
 *   5. Why is `filtered.map((item) => <li key={item.id}>...)` better *
 *      than `filtered.map((item, i) => <li key={i}>...)`?            *
 *                                                                    *
 *   6. The `<p aria-live="polite">` in Counter announces the count   *
 *      to screen readers when it changes. Look up `aria-live` in the *
 *      WAI-ARIA spec. Why "polite" and not "assertive"?              *
 * ------------------------------------------------------------------ */
