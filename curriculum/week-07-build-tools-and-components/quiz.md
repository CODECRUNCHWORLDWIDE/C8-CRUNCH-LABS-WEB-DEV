# Week 7 — Quiz

> Ten multiple-choice questions. Answers and explanations at the bottom. Aim for 7 or above. If you score under 7, re-read the relevant lecture before moving on.

---

## Questions

**1.** In a Vite project, what is the role of `index.html`?

- A. It is a static asset served from `public/`, untouched by the build.
- B. It is the project's entry point; Vite reads it, finds `<script type="module">` tags, and walks the import graph from there.
- C. It is a template Vite copies into `dist/` after replacing placeholders.
- D. It is only used in production; in dev, Vite generates HTML on the fly.

**2.** Which of the following is **not** a module specifier category recognized by the browser's native ES module loader?

- A. Relative — `./helpers.js`
- B. Absolute — `/lib/helpers.js`
- C. Bare — `react`
- D. URL — `https://esm.sh/lit-html`

**3.** What does Hot Module Replacement (HMR) do?

- A. Recompiles the entire bundle and refreshes the page.
- B. Restarts the dev server when a file changes.
- C. Replaces individual modules in the running page without a full reload, preserving page state where possible.
- D. Minifies the production bundle.

**4.** In Astro, what does the frontmatter fence (`---`) at the top of an `.astro` file delimit?

- A. YAML metadata that Astro parses but never executes.
- B. JavaScript that runs in the browser when the page loads.
- C. JavaScript that runs at build time, on the Astro server; the result is interpolated into the template below.
- D. TypeScript-only declarations; the file errors if you put plain JavaScript there.

**5.** What does the `<slot />` element do inside an Astro layout?

- A. Reserves space for a CSS variable to be injected.
- B. Marks a position where child content passed to the component should be inserted.
- C. Tells Astro to render the component lazily.
- D. Is an Astro-specific alias for `<script>`.

**6.** Which `client:*` directive hydrates a component only when it scrolls into the viewport?

- A. `client:load`
- B. `client:idle`
- C. `client:visible`
- D. `client:lazy`

**7.** In React, a function component name must start with a capital letter because:

- A. The React linter enforces a style convention.
- B. JSX compiles lowercase tags into `jsx("string", ...)` (an HTML element) and capitalized tags into `jsx(Variable, ...)` (a reference to a JavaScript value); the capitalization is syntactically significant.
- C. React tracks components by their name string.
- D. It is a TypeScript requirement.

**8.** What is the correct way to update React state based on the previous value of that state?

- A. `setCount(count + 1)` — read `count`, add 1, set.
- B. `setCount(prev => prev + 1)` — pass an updater function.
- C. `count = count + 1` — mutate the state directly.
- D. `setCount(useState() + 1)` — call `useState` again.

**9.** The `useEffect` hook is most appropriately used for:

- A. Computing a derived value from props.
- B. Handling a button click.
- C. Synchronizing with an external system (a timer, a subscription, the DOM directly, the network).
- D. Replacing `setState` when state is complex.

**10.** Tree shaking — the bundler's elimination of unused exports — works reliably only when:

- A. The source is authored in CommonJS (`require`, `module.exports`).
- B. The source is authored in static ES module syntax (`import`, `export`), so the bundler can statically determine which exports are used.
- C. Every file is fewer than 100 lines.
- D. The bundler is webpack specifically.

---

## Answer key

1. **B.** Vite treats `index.html` as the entry point. The script tags inside it are the roots of the module graph; Vite walks them, resolves imports, and serves transformed source in dev / bundles them in production. This is unusual versus webpack (where the JavaScript entry is the root and the HTML is generated) and is documented at <https://vitejs.dev/guide/#index-html-and-project-root>.

2. **C.** Bare specifiers (`import "react"`) **cannot** be resolved by the browser's native module loader; there is no built-in package registry. They require either a bundler (which rewrites them at build time) or an import map (`<script type="importmap">`). The other three — relative, absolute, and URL — work natively. Reference: HTML Living Standard, module map algorithm.

3. **C.** HMR replaces individual modules in the running page without a full reload. State that lives in JavaScript variables (form input, scroll position, selected tab, React component state in many cases) is preserved across the update. The Vite HMR API is at <https://vitejs.dev/guide/api-hmr.html>.

4. **C.** The frontmatter runs at build time on the Astro server. Variables it declares are interpolated into the template via `{}` expressions. **None of the frontmatter ships to the browser** unless you explicitly add a `<script>` block in the template body.

5. **B.** `<slot />` is the canonical "child content goes here" element, mirroring the HTML Living Standard's `<slot>` semantics for Web Components. Astro borrowed the name and the meaning. Reference: <https://docs.astro.build/en/basics/astro-components/#slots>.

6. **C.** `client:visible` uses `IntersectionObserver` and hydrates when the component scrolls into view. `client:load` hydrates immediately on page load; `client:idle` hydrates on the next `requestIdleCallback`; `client:lazy` is not a real directive.

7. **B.** This is **syntactic**, not stylistic. The JSX transform compiles `<button>` into `jsx("button", ...)` (a string, treated as HTML) and `<Button>` into `jsx(Button, ...)` (a JavaScript variable reference, treated as a component function). A lowercase component name would compile to an HTML element name and silently render an unknown element. The capitalization is enforced by the language, not by the linter.

8. **B.** The functional updater form `setCount(prev => prev + 1)` receives the most recent state, even if multiple updates are queued. `setCount(count + 1)` uses whatever value `count` had at the time the handler was created, which may be stale if multiple updates run in a row. Reference: <https://react.dev/learn/queueing-a-series-of-state-updates>.

9. **C.** `useEffect` is for synchronizing with **external systems** — anything outside React's rendering loop. Derived values should be computed during render. Click handlers should live in the event handler. State-based logic that doesn't touch the outside world rarely needs `useEffect`. Read <https://react.dev/learn/you-might-not-need-an-effect> until the rule is reflexive.

10. **B.** Tree shaking requires **static analyzability**. ES module `import` and `export` statements are declarations the bundler can statically inspect: it can see what is imported and from where, what is exported and used, and what is exported but never used. CommonJS's `require()` is a dynamic function call; the bundler often cannot tell what would be returned without running the code. The combination of static ES syntax + side-effect-free exports lets Rollup (and esbuild, and webpack when configured) drop unused exports. Reference: <https://web.dev/articles/reduce-javascript-payloads-with-tree-shaking>.

---

## How to interpret your score

- **10/10** — Excellent. Move to the challenges and mini-project.
- **8–9/10** — Solid. Re-read the explanations for the questions you missed.
- **5–7/10** — Re-read the lecture corresponding to each wrong answer.
- **Under 5** — Re-read all three lectures from the start. The exercises require a working mental model; do not push forward without it.
