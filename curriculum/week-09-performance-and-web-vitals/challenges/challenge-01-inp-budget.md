# Challenge 1 — INP Under 200 ms

> Estimated time: 60–90 minutes.
> Difficulty: Moderate.
> Prerequisite: Exercise 3 finished (`web-vitals` is logging INP in your project).

---

## The brief

INP is the responsiveness vital. A page's INP is, roughly, the latency of its worst single interaction. "Good" INP is **under 200 ms at the 75th percentile**. This challenge asks you to take a deliberately-slow interaction — a search input that filters a large list synchronously on every keystroke — and bring INP **under 200 ms** without removing functionality. You will use three of the techniques from Lecture 3 §7 and measure the improvement after each.

The point is to feel the trade-offs between the named INP fixes. Some help a lot. Some have a cost. Some only help when combined.

---

## Setup

Create a small React playground or use your Week 8 Crunch Library project.

The starter component — drop this into `src/components/SlowSearch.jsx`:

```jsx
import { useMemo, useState } from "react";

// 10,000 fake items. Generated once at module load.
const ITEMS = Array.from({ length: 10000 }, (_, i) => ({
  id: i,
  title: `Item ${i} — ${Math.random().toString(36).slice(2, 10)}`,
  description: `Lorem ipsum dolor sit amet ${i} consectetur adipiscing elit ${Math.random().toString(36).slice(2, 14)}`,
}));

function expensiveFilter(items, query) {
  // Deliberately slow: a case-insensitive substring search over a large field,
  // plus a fake "ranking" step that scales O(n * query.length).
  const q = query.toLowerCase();
  return items
    .map((item) => {
      const hay = `${item.title} ${item.description}`.toLowerCase();
      let score = 0;
      for (let i = 0; i < hay.length - q.length; i++) {
        if (hay.slice(i, i + q.length) === q) score++;
      }
      return { ...item, score };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score);
}

export function SlowSearch() {
  const [query, setQuery] = useState("");
  const results = useMemo(() => (query ? expensiveFilter(ITEMS, query) : []), [query]);

  return (
    <section style={{ maxWidth: "60ch", margin: "2rem auto" }}>
      <h2>Slow search</h2>
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Type to search 10,000 items..."
        style={{ width: "100%", padding: "0.5rem", fontSize: "1rem" }}
      />
      <p>{results.length} matches</p>
      <ol style={{ maxHeight: "400px", overflow: "auto" }}>
        {results.map((r) => (
          <li key={r.id}>
            <strong>{r.title}</strong> — score {r.score}
          </li>
        ))}
      </ol>
    </section>
  );
}
```

Render it from your App. Run `npm run dev`. Verify the component works (slowly) by typing a few characters.

---

## Step 0 — Baseline INP

Confirm `web-vitals` is logging INP from Exercise 3. Open DevTools' Console. Throttle the CPU (DevTools → Performance Insights → settings → CPU: 4x slowdown).

Type the letter "a" into the search input. Wait for the console to log the INP. Repeat with "ab", "abc". The INP should report after the worst interaction so far.

Record:

| Run | INP (ms) | inputDelay | processingDuration | presentationDelay |
|-----|---------:|-----------:|-------------------:|------------------:|
| Baseline | | | | |

You should see INP well over 200 ms, with **processingDuration** dominating (the synchronous filter is the bottleneck).

---

## Step 1 — `useDeferredValue`

`useDeferredValue` tells React "this value can lag behind." The input updates immediately; the expensive list re-renders at a lower priority that can be interrupted by further input.

Refactor:

```jsx
import { useDeferredValue, useMemo, useState } from "react";

export function SlowSearch() {
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);
  const results = useMemo(
    () => (deferredQuery ? expensiveFilter(ITEMS, deferredQuery) : []),
    [deferredQuery]
  );

  const isStale = query !== deferredQuery;

  return (
    <section style={{ maxWidth: "60ch", margin: "2rem auto" }}>
      <h2>Slow search</h2>
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Type to search 10,000 items..."
        style={{ width: "100%", padding: "0.5rem", fontSize: "1rem" }}
      />
      <p style={{ opacity: isStale ? 0.4 : 1 }}>{results.length} matches</p>
      <ol style={{ maxHeight: "400px", overflow: "auto" }}>
        {results.map((r) => (
          <li key={r.id}>
            <strong>{r.title}</strong> — score {r.score}
          </li>
        ))}
      </ol>
    </section>
  );
}
```

The input field's `onChange` setter is now fast: it sets `query`, which is the value the input reflects. The expensive memo runs against `deferredQuery`, which React updates at a low priority. The user sees the input respond immediately; the list updates a moment later.

Re-measure. Type "a", "ab", "abc". Record:

| Run | INP (ms) | What changed? |
|-----|---------:|---------------|
| + useDeferredValue | | |

You should see INP drop sharply — typically from ~400 ms to ~50–100 ms. The expensive filter still runs; it just no longer blocks the input.

Write one sentence: what `useDeferredValue` does **not** help with (and where the time is still being spent).

Reference: <https://react.dev/reference/react/useDeferredValue>.

---

## Step 2 — Debounce the input

Even with `useDeferredValue`, the filter runs once per keystroke. For a fast-typing user, that's eight runs in two seconds. Debounce so the filter runs only after the user pauses.

Add a debounce. The simplest version:

```jsx
import { useDeferredValue, useEffect, useMemo, useState } from "react";

export function SlowSearch() {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");

  useEffect(() => {
    const id = setTimeout(() => setDebouncedQuery(query), 200);
    return () => clearTimeout(id);
  }, [query]);

  const deferredQuery = useDeferredValue(debouncedQuery);
  const results = useMemo(
    () => (deferredQuery ? expensiveFilter(ITEMS, deferredQuery) : []),
    [deferredQuery]
  );

  // ...same render as before
}
```

The 200 ms debounce coalesces keystrokes; the deferred value still keeps re-renders interruptible.

Re-measure:

| Run | INP (ms) | Filter runs per word typed |
|-----|---------:|---------------------------:|
| + debounce | | |

Write one sentence: what is the trade-off of a 200 ms debounce from the user's perspective?

---

## Step 3 — Virtualize the result list (if you have time)

The result list renders up to 10,000 `<li>` elements. That is a lot of DOM nodes; rendering and laying out all of them is slow even when the JavaScript is fast.

Install a virtualization library:

```bash
npm install @tanstack/react-virtual
```

Convert the result list to a virtualized one:

```jsx
import { useVirtualizer } from "@tanstack/react-virtual";
import { useRef } from "react";

function ResultList({ results }) {
  const parentRef = useRef(null);
  const rowVirtualizer = useVirtualizer({
    count: results.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 32,
    overscan: 5,
  });

  return (
    <div ref={parentRef} style={{ height: 400, overflow: "auto" }}>
      <ol
        style={{
          height: `${rowVirtualizer.getTotalSize()}px`,
          position: "relative",
          margin: 0,
          padding: 0,
        }}
      >
        {rowVirtualizer.getVirtualItems().map((virtualRow) => {
          const r = results[virtualRow.index];
          return (
            <li
              key={r.id}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                transform: `translateY(${virtualRow.start}px)`,
              }}
            >
              <strong>{r.title}</strong> — score {r.score}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
```

Now only ~12 list items are in the DOM at any time, regardless of the filter result count.

Re-measure:

| Run | INP (ms) | Notes |
|-----|---------:|-------|
| + virtualization | | |

Write one sentence: when would virtualization **not** help INP? (Hint: think about what dominates when the result list is small.)

---

## Step 4 — Write the report

A one-page report with three sections:

1. **The before/after table.** Four rows: baseline, +useDeferredValue, +debounce, +virtualization. INP for each. Note which interaction you measured.

2. **The diagnosis.** Looking at the baseline trace in Performance Insights, which phase dominated INP? `useDeferredValue` and `debounce` target different parts of the problem; explain the difference in two sentences.

3. **The recommendation.** If you were shipping this component to production, which combination of the three fixes would you ship? Why? Cite at least one web.dev or React docs URL.

---

## Done when

- [ ] All four runs are measured and recorded.
- [ ] INP after all three fixes is **under 200 ms** in your trace.
- [ ] The report's three sections are written.
- [ ] The recommendation cites at least one doc URL.

---

## Common pitfalls

**1. Measuring with no CPU throttle.** On a fast laptop with no throttle, the baseline INP may already be acceptable. Always throttle CPU to 4x for INP work.

**2. The debounce delays the debounce.** A debounce inside a `useEffect` (as above) is fine. A debounce inside the `onChange` handler that uses `setTimeout` to call `setQuery` directly will not work the same way — the input's controlled value can lag the user's keystrokes.

**3. The filter is still expensive.** Neither `useDeferredValue` nor `debounce` makes the filter faster. They make the filter's slowness invisible to the user. The fundamental fix for an O(n²) filter is to write an O(n) one (build an index, use a real search library like FlexSearch or Lunr). The Stretch goal explores this.

**4. Virtualization breaks accessibility.** A screen reader cannot read content that does not exist in the DOM. Virtualization is correct only when the content is genuinely incremental (a chat log, an infinite scroll). For a search-result list that should be fully readable, consider rendering more rows and only virtualizing if the list grows large in practice.

---

## Stretch (optional)

- Replace `expensiveFilter` with **a real search library** like FlexSearch (<https://github.com/nextapps-de/flexsearch>) or MiniSearch (<https://github.com/lucaong/minisearch>). Build the index once at module load. Re-measure. The filter should drop from hundreds of milliseconds to under one millisecond.
- Move the filter into a **Web Worker** (<https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Using_web_workers>). The main thread stays free; the worker does the work. Measure the round-trip cost vs. the filter cost.
- Try **`scheduler.yield()`** (<https://developer.chrome.com/blog/scheduler-yield>) to break up the filter into yieldable chunks. Compare with `useDeferredValue`.

---

## Reference

- React — `useDeferredValue`: <https://react.dev/reference/react/useDeferredValue>
- React — `useTransition`: <https://react.dev/reference/react/useTransition>
- web.dev — Optimize INP: <https://web.dev/articles/optimize-inp>
- web.dev — Long tasks: <https://web.dev/articles/long-tasks-devtools>
- TanStack Virtual: <https://tanstack.com/virtual/latest>
