# Challenge 2 — Astro with a React Island

> Estimated time: 90–120 minutes. The challenge that closes the loop: an Astro page that ships zero JavaScript by default, plus one React island that only hydrates when it scrolls into view, with the hydration verified in DevTools.

---

## Goal

Build an Astro page that contains:

1. A region of **static content** (HTML rendered at build time; ships zero JavaScript).
2. A **React-powered interactive island** that uses `client:visible` to hydrate only when it enters the viewport.

Verify in the browser's DevTools that the React JavaScript is **not** loaded on the initial page request, and **is** loaded the moment the island scrolls into view.

---

## Step 1 — Add the React integration to your Astro project

Start from the Astro project from Exercise 2 (or scaffold a new one). Add the React integration:

```bash
npx astro add react
```

This command does three things:

1. Installs `@astrojs/react`, `react`, and `react-dom`.
2. Adds `react()` to the `integrations` array in `astro.config.mjs`.
3. Updates `tsconfig.json` with React-appropriate JSX settings.

Confirm the resulting `astro.config.mjs`:

```javascript
import { defineConfig } from "astro/config";
import react from "@astrojs/react";

export default defineConfig({
  integrations: [react()]
});
```

---

## Step 2 — Bring in your `FilteredList` from Exercise 3

Save your completed `exercise-03-react-counter-and-list.jsx` (with every TODO filled) into `src/components/`. Rename it to `FilteredList.jsx` and keep only the `FilteredList` component (drop the `Counter`, drop the `Example` default export — we'll only embed the list here):

```jsx
// src/components/FilteredList.jsx
import { useEffect, useMemo, useState } from "react";

export default function FilteredList({ items, placeholder = "Search..." }) {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");

  useEffect(() => {
    const id = setTimeout(() => setDebouncedQuery(query), 200);
    return () => clearTimeout(id);
  }, [query]);

  const filtered = useMemo(() => {
    const q = debouncedQuery.trim().toLowerCase();
    if (!q) return items;
    return items.filter((item) =>
      item.title.toLowerCase().includes(q) ||
      item.description.toLowerCase().includes(q)
    );
  }, [items, debouncedQuery]);

  return (
    <section className="filtered-list" aria-labelledby="fl-heading">
      <h3 id="fl-heading">Searchable list</h3>
      <label htmlFor="fl-input">{placeholder}</label>
      <input
        id="fl-input"
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

---

## Step 3 — Build a page with mostly static content, plus the island near the bottom

Create `src/pages/explore.astro` (or add to an existing page) with a structure where the React island lives below the fold:

```astro
---
// src/pages/explore.astro
import BaseLayout from "../layouts/BaseLayout.astro";
import FilteredList from "../components/FilteredList.jsx";

const articles = [
  { id: "vite", title: "Why Vite", description: "Native ESM in dev, Rollup in prod. Less config." },
  { id: "astro", title: "Astro Islands", description: "Ship zero JS by default; hydrate per island." },
  { id: "react", title: "React Hooks", description: "useState and useEffect are usually enough." },
  { id: "esm", title: "ECMAScript Modules", description: "The spec underneath all of it." },
  { id: "rollup", title: "Tree Shaking with Rollup", description: "Static imports enable dead-code elimination." },
  { id: "esbuild", title: "esbuild", description: "Why Vite is fast in dev." },
  { id: "mdx", title: "MDX", description: "Markdown with JSX expressions." },
];
---

<BaseLayout title="Explore — Crunch Portfolio" description="Demos and notes.">
  <h1>Explore</h1>

  <!-- Static section 1: pure HTML at build time. Ships zero JS. -->
  <section class="lede">
    <p>
      This page is built with Astro and ships almost no JavaScript.
      The text below is static HTML, rendered once at deploy time and
      cached aggressively by the CDN.
    </p>
    <p>
      Scroll down to find a small interactive widget — a React-powered
      filtered list. That widget is an <em>island</em>. The React runtime
      and the widget's code only load when the widget enters your viewport.
    </p>
  </section>

  <!-- Filler content to force the island below the fold. -->
  <section class="filler">
    <h2>A few notes on this page</h2>
    <p>This page demonstrates the islands architecture in concrete terms.</p>
    <p>Open the browser's DevTools (the Network tab) and refresh. Sort by Type → JS. Notice how few JavaScript files have loaded so far.</p>
    <p>The static text you are reading is plain HTML. No build script ran in your browser to render it. The HTML arrived from the server, and the browser painted it.</p>
    <p>Now keep scrolling.</p>
    <p style="height: 80vh; display: flex; align-items: center; justify-content: center; border: 1px dashed #ccc; color: #6b7280;">
      Keep scrolling — the island is just below.
    </p>
  </section>

  <!-- The island. client:visible: hydrate when it enters the viewport. -->
  <section class="island-wrapper">
    <h2>An interactive island</h2>
    <p>Filter the list below. The filter is debounced 200ms.</p>
    <FilteredList items={articles} placeholder="Filter articles..." client:visible />
  </section>

  <!-- Trailing static content. -->
  <section class="trailer">
    <p>That widget — and only that widget — shipped JavaScript. The rest of this page is HTML and CSS.</p>
  </section>
</BaseLayout>
```

Save. Run `npm run dev` and navigate to `/explore/`. Confirm the page renders correctly.

---

## Step 4 — Verify in DevTools that hydration is deferred

Open Chrome DevTools (or Firefox DevTools). Open the **Network** panel. Filter by **JS**. Reload `/explore/`.

You should see:

- **Several small JS files** from Astro's runtime — these are Astro's island loader (the script that watches `IntersectionObserver` for `client:visible` and triggers hydration). The total is small (~1–2 KB gzipped).
- **No React, no ReactDOM, no `FilteredList.jsx`** yet.

Now **scroll down** until the FilteredList island enters the viewport.

At the moment it crosses into view, you should see new network requests appear:

- **`react-dom.[hash].js`** (~40 KB gzipped)
- **`react.[hash].js`** (small)
- **`FilteredList.[hash].js`** (small)
- **`client.[hash].js`** (the React hydration entry; small)

The order and exact filenames depend on Astro's chunking, but the pattern is the same: **no React on the wire until the island appears.**

Take a screenshot of the Network panel showing both moments (the initial page load with no React, and the post-scroll moment with React loaded).

---

## Step 5 — Compare with `client:load`

Change the directive on `<FilteredList ... client:visible />` to `<FilteredList ... client:load />`. Rebuild (or just save; dev server reloads).

Refresh the page. **The React bundle now loads immediately**, before you scroll. That is what `client:load` does: hydrate the island as soon as the page loads, regardless of where it appears.

When is each right?

- **`client:load`** — interactivity must work the moment the page is interactive. Above-the-fold widgets, primary calls-to-action, anything the user is likely to interact with in the first second.
- **`client:visible`** — interactivity is fine to be delayed until the user actually approaches the widget. Below-the-fold widgets, supplementary controls, anything the user may or may not reach.
- **`client:idle`** — interactivity is desired but not urgent; load when the main thread has spare cycles.

Choose deliberately. Each directive has a real performance cost; `client:load` pulls JS to the critical path; `client:visible` defers it.

---

## Step 6 — Inspect the production build

Stop the dev server. Run `npm run build`. Open `dist/_astro/` and look at the JavaScript files.

You should see:

- An **`astro-island.[hash].js`** — Astro's small per-page island loader.
- A **`react-vendor.[hash].js`** or similarly named chunk — React + ReactDOM (~45 KB gzipped).
- A **`FilteredList.[hash].js`** — the component's own code (~2 KB).
- A **`client.[hash].js`** — the React rendering entry.

The HTML file `dist/explore/index.html` should contain the static markup of the page **plus** a server-rendered snapshot of the `FilteredList` component (with `query = ""`, all items visible). Search the HTML for `<input type="search"` — you should find one, fully rendered.

---

## Reflection questions

**1.** What is the user-facing difference between an island that uses `client:visible` and one that uses `client:load`? Describe a scenario where `client:visible` would be the wrong choice.

**2.** When the React island is server-rendered (Astro's default), the initial HTML already contains the rendered output of the component. What happens if the server-rendered HTML and the client-rendered HTML differ? (Hint: search for "hydration mismatch" in the React docs.)

**3.** The Astro docs recommend using `client:only="react"` for components that depend on browser-only APIs (`window`, `localStorage`, `navigator`) in their initial render. What is the practical difference between `client:only` and `client:load`?

**4.** Each React island ships React + ReactDOM (~45 KB). If you have three islands on the same page, does the bundle ship React three times? (Spoiler: no — explain why.)

---

## Stretch (optional)

- Add a **second island** on the same page that uses `client:idle`. Compare the two hydration directives in DevTools.
- Add **`@astrojs/sitemap`** integration. Rebuild and inspect the generated `sitemap-0.xml`. Notice that the `/explore/` route is included even though it contains a React island — sitemap generation runs over the file-based routes, not the rendered output.
- Read **Astro's "Sharing State Between Islands"** docs at <https://docs.astro.build/en/recipes/sharing-state-islands/>. The pattern uses Nano Stores. Implement a small example where two islands on the same page share a counter.

---

## Done when

- [ ] You have an Astro page with a `client:visible` React island below the fold.
- [ ] You have verified in DevTools that React only loads when the island appears.
- [ ] You have switched the directive to `client:load` and observed the difference.
- [ ] You have inspected the production build's HTML and JS chunks.
- [ ] You have answered the four reflection questions in your notes.
