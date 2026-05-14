# Exercise Solutions — Week 7

> Reference solutions for the three weekly exercises. Read these **after** you have attempted each exercise yourself. The point of the exercises is the wrestling with each TODO; the solution is the safety net.

---

## Exercise 1 — Bootstrap a Vite App

### Reference answers to the reflection questions

**1. Why does Vite serve many small JavaScript files in dev but bundle them into one in production?**

In development, **dev-server speed matters most**. The browser supports native ES modules; serving each source file individually lets Vite transform only the files the browser actually requests. A project with 10,000 files starts in under a second because Vite only touches the modules the entry HTML asks for. In production, **runtime performance and caching matter most**. The browser does not benefit from many small files (per-request overhead, head-of-line blocking on HTTP/1, suboptimal compression), and inter-module optimization (tree shaking, dead-code elimination, asset inlining) is only possible when the bundler sees the whole graph at once. Rollup performs that bundling for production. Reference: Vite's "Why Vite" — <https://vitejs.dev/guide/why.html>.

**2. What is in `node_modules/.vite/deps/`? Why does that directory exist?**

It is Vite's **dependency pre-bundling cache**. On the first dev-server start, Vite walks your `package.json`, finds every npm dependency you import, and pre-bundles each into a single ESM file. This solves two problems: many npm packages still ship CommonJS (Vite converts them to ESM so the browser can load them), and many packages contain hundreds of small files that would be hundreds of HTTP requests in dev. The cache is invalidated when `package.json` or `package-lock.json` changes. Reference: <https://vitejs.dev/guide/dep-pre-bundling.html>.

**3. What is the difference between `public/` and `src/` for static assets?**

Files in `public/` are served at the URL root **unchanged**, with no fingerprinting. Use `public/` for: `robots.txt`, `favicon.ico`, social-media share images you want at a stable URL, fonts loaded by `<link>`, large media files that should not pass through the build. Files in `src/` are **part of the module graph**. Imported assets (`import logo from "./logo.svg"`) are fingerprinted, optimized, and inlined when small enough. Use `src/` for assets that belong to specific components.

**4. Why does the production build's CSS file have a hash in its name?**

For **cache-busting**. The hash is computed from the file's contents; when the contents change, the URL changes, so the browser fetches the new file. Servers can serve hashed files with `Cache-Control: public, max-age=31536000, immutable` (a year, immutable per RFC 8246) because if the content changes the URL changes anyway. The fingerprinting pattern is the cornerstone of modern web performance — it allows aggressive caching without the "users see old code" problem.

**5. Does HMR update `<title>` in `index.html` without a full reload?**

No. `index.html` is the entry point of the module graph; changes to it trigger a full page reload. HMR is for **JavaScript and CSS modules** in the graph (and for framework components via their HMR adapters). The reload is fast — usually under 100 ms — but it is a reload, not a hot swap. You can confirm this by watching the Console: a reload shows the "page reloaded" message; an HMR update shows `[vite] hot updated:`.

**6. What does `"type": "module"` change about how Node interprets the project?**

Without `"type": "module"` (the default), Node treats every `.js` file as CommonJS — `require`/`module.exports` work; `import`/`export` are syntax errors. With `"type": "module"`, Node treats every `.js` file as an ES module — `import`/`export` work; `require` does not (you would need a `.cjs` extension or `createRequire`). For Vite-built browser apps this distinction matters less (Vite's transformer handles either), but for the **tool config files** (`vite.config.js`, `astro.config.mjs`, `eslint.config.js`) it determines which syntax they can use. The `.mjs` extension always opts into ESM regardless of the `type` field.

---

## Exercise 2 — Build an Astro Landing Page

### Reference answers to the reflection questions

**1. What URL would `src/pages/blog/2026/may.astro` map to?**

`/blog/2026/may/` (with trailing slash, by default). Astro's file-based router treats the directory structure under `src/pages/` as the URL hierarchy.

**2. Why `dist/about/index.html` instead of `dist/about.html`?**

Astro defaults to **`trailingSlash: "ignore"`** with `build.format: "directory"` (one folder per route with an `index.html` inside). This format works correctly on every static host without per-host rewrite rules: `/about/`, `/about/index.html`, and `/about` all resolve to the same file. The alternative (`build.format: "file"`) produces `dist/about.html`, which some static hosts serve at `/about.html` but not `/about/`. The directory format is more portable. Reference: <https://docs.astro.build/en/reference/configuration-reference/#buildformat>.

**3. How does Astro scope component styles?**

At build time, Astro **hashes each `<style>` block's content** and rewrites both the CSS selectors and the markup. A rule like `h1 { color: red }` inside `Card.astro` becomes `h1.astro-7XK2QF { color: red }` (with the matching `class` attribute added to the `<h1>` elements in `Card.astro`'s markup). The hash is deterministic per-component, so two `<h1>` elements in two different components do not collide. Reference: <https://docs.astro.build/en/guides/styling/#scoped-styles>.

**4. If you renamed `BaseLayout.astro` to `SiteShell.astro`, what would break?**

The two `import BaseLayout from "../layouts/BaseLayout.astro"` lines in the pages would error at build time ("file not found"). The fix is mechanical: rename the file, then update each import. Astro's build catches every broken import; the dev server prints a clear error message.

**5. How small is a single-page payload, and why?**

A homepage that ships only HTML and inline CSS is roughly **2–5 KB gzipped** end-to-end. A default Next.js page, by contrast, ships React (~45 KB gzipped), its runtime, hydration metadata, and the route's JavaScript — usually 60–150 KB gzipped before you have added a single component. The difference is that Astro renders to static HTML at build time and ships zero JavaScript by default; Next.js renders to HTML *and* ships the same React tree as JavaScript for hydration.

**6. Could you reproduce this site without Astro? What would you lose?**

Yes — two hand-written HTML files would render the same browser output. You would lose: (a) the shared layout (`BaseLayout.astro`) — every page would need to duplicate the `<head>`, header, footer; (b) the reusable `Card` component — you would copy-paste the card markup; (c) the build-time tooling (Vite under the hood — HMR, the production build, asset fingerprinting); (d) the easy path to growing the site to dozens of pages without the duplication compounding.

The trade-off is honest: **for a 2-page site, Astro is overkill.** For a 10-page site, it is the right tool. The point of using it now is to learn the workflow at low complexity so the workflow is in place when complexity arrives.

---

## Exercise 3 — React Counter and List

### Reference completions for every TODO

```jsx
import { useEffect, useMemo, useState } from "react";

export function Counter({ initial = 0, storageKey = "counter", onChange }) {

  // TODO 1.1 — lazy initializer that reads localStorage with a safe fallback
  const [count, setCount] = useState(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw === null) return initial;
      const parsed = Number(raw);
      return Number.isFinite(parsed) ? parsed : initial;
    } catch {
      // localStorage can throw (private mode, quota, file://) — fall back gracefully
      return initial;
    }
  });

  // TODO 1.2 — persist + notify parent on every change
  useEffect(() => {
    try {
      localStorage.setItem(storageKey, String(count));
    } catch { /* ignore */ }
    if (typeof onChange === "function") onChange(count);
  }, [count, storageKey, onChange]);

  // TODO 1.3 — handlers using the functional updater form
  const increment = () => setCount((c) => c + 1);
  const decrement = () => setCount((c) => c - 1);
  const reset = () => setCount(initial);

  return (
    <section className="counter" aria-label="Counter">
      <p aria-live="polite" className="counter-value">
        Count: <strong>{count}</strong>
      </p>
      <div className="counter-controls" role="group" aria-label="Counter controls">
        <button type="button" onClick={decrement} aria-label="Decrease by 1">−1</button>
        <button type="button" onClick={increment} aria-label="Increase by 1">+1</button>
        <button type="button" onClick={reset} aria-label="Reset to initial value">Reset</button>
      </div>
    </section>
  );
}


export function FilteredList({ items, placeholder = "Search..." }) {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");

  // TODO 2.3 — debounce: setTimeout writes debouncedQuery; cleanup clears it
  useEffect(() => {
    const id = setTimeout(() => setDebouncedQuery(query), 200);
    return () => clearTimeout(id);
  }, [query]);

  // TODO 2.4 — memoized filter
  const filtered = useMemo(() => {
    const q = debouncedQuery.trim().toLowerCase();
    if (!q) return items;
    return items.filter((item) =>
      item.title.toLowerCase().includes(q) ||
      item.description.toLowerCase().includes(q)
    );
  }, [items, debouncedQuery]);

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
        <p className="empty" role="status">No matches for "{debouncedQuery}".</p>
      )}
    </section>
  );
}
```

### Reference answers to the reflection questions

**1. Why must Counter accept `storageKey` rather than `key`?**

React treats `key` as a **reserved prop** used internally for list reconciliation (telling React which child is which across re-renders). Passing `key` to a component does **not** pass it through to the function — React intercepts it. The React docs at <https://react.dev/learn/rendering-lists#why-does-react-need-keys> describe this rule. If you tried `<Counter key="my-counter" />`, the `key` would not arrive in `props.key`; you must use a different prop name.

**2. Why does the localStorage read live inside the useState initializer function?**

Two reasons:

- **Performance.** The initializer function only runs once, on mount. If you wrote `useState(localStorage.getItem(storageKey))`, the `localStorage.getItem` call would run on **every render**, even though its result is only used the first time. The function form is React's escape hatch from this.
- **Correctness when `storageKey` changes.** If the parent component passes a different `storageKey` to an existing `Counter` instance, the initializer does NOT re-run (state is preserved across re-renders). The lazy form makes "we only ever read storage at mount" explicit.

Reference: <https://react.dev/reference/react/useState#avoiding-recreating-the-initial-state>.

**3. Why debounce the query? What happens without it?**

Without debouncing, the filter runs on every keystroke. For a list of 5 items the cost is invisible; for a list of 50,000 items the cost is measurable, and the UI stutters. **Debouncing trades responsiveness for stability** — the user sees the filtered results 200 ms after they stop typing rather than on every character. The 200 ms threshold is a UX choice (research suggests 100–300 ms feels "immediate"); shorter feels twitchy, longer feels broken. Read the original Nielsen/Norman piece on UI response times for context: <https://www.nngroup.com/articles/response-times-3-important-limits/>.

**4. What is the dependency array of the debounce useEffect?**

`[query]`. The effect reads `query` from the component's scope, so `query` must be in the array. It does not read `setDebouncedQuery` from scope in a meaningful sense (React guarantees the setter is stable across renders), so the linter does not require it in the array. Other values used in the effect (`200`, the literal) are constants and not from scope; they do not need to be dependencies. Reference: <https://react.dev/learn/lifecycle-of-reactive-effects#what-an-effect-with-empty-dependencies-means>.

**5. Why `key={item.id}` instead of `key={i}` (the array index)?**

React uses the key to match items between renders. When the list reorders, items added or removed, React compares old-key-list with new-key-list and figures out which DOM nodes to keep, move, or destroy. **The array index changes when the list reorders** — every item past the change point gets a different index — so React thinks every item past the change point is a *different* item and rebuilds them all. A stable `item.id` lets React correctly recognize "this is the same item; just moved." The visible bug from index keys is most obvious with controlled `<input>`s inside list items: their state gets attached to the wrong item after a reorder. Reference: <https://react.dev/learn/rendering-lists#keeping-list-items-in-order-with-key>.

**6. Why `aria-live="polite"` and not `"assertive"`?**

A live region with `aria-live="polite"` waits until the screen reader is idle before announcing the change. `aria-live="assertive"` interrupts whatever the user is currently hearing. **Polite is the right default for non-urgent updates** like a counter or a result count; the announcement happens when the user is between actions. **Assertive should be reserved for urgent information** the user needs to hear immediately — error messages, time-sensitive alerts. Overusing assertive makes screen readers feel like they are shouting and degrades the experience. Reference: WAI-ARIA 1.2 — `aria-live` at <https://www.w3.org/TR/wai-aria-1.2/#aria-live>.

---

## How to verify the JSX file runs

The fastest path is to drop the components into the Vite + React project from Exercise 1 (or scaffold a fresh one with `npm create vite@latest -- --template react`):

```bash
npm create vite@latest react-test -- --template react
cd react-test
npm install
# Copy your completed exercise-03 contents into src/components/Example.jsx
# In src/App.jsx, replace the default content with:
#   import Example from "./components/Example.jsx";
#   export default function App() { return <Example />; }
npm run dev
```

The counter should increment, decrement, reset, persist on reload. The list should filter as you type, with a 200 ms delay before the filter applies.

If you see a React error in the console, read it carefully — React's error messages in dev are unusually informative and usually point at the file:line and what went wrong.
