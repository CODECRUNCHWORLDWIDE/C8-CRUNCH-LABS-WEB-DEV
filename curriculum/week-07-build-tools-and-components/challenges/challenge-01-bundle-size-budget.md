# Challenge 1 — Bundle Size Budget

> Estimated time: 90–120 minutes. A working developer's habit. By the end you will be able to point at any production JavaScript bundle, name the three heaviest dependencies, and propose at least three cuts.

---

## Goal

Set a **bundle size budget** for a Vite + React project, audit the production build with `rollup-plugin-visualizer`, and produce a written analysis with three concrete proposals to bring the bundle within budget.

A "bundle budget" is the limit a team commits to for the JavaScript shipped per page. Common values:

- **Strict** — 50 KB gzipped per page (the Google Search team's internal target for many pages).
- **Standard** — 150 KB gzipped per page (a common "performance budget" baseline; appears in many web.dev articles).
- **Loose** — 300 KB gzipped per page (the limit beyond which Core Web Vitals start to suffer on low-end Android).

For this challenge: **50 KB gzipped**. You will deliberately exceed it, then propose cuts.

---

## Step 1 — Set up the project

Start from Exercise 1's Vite app (or scaffold a new one with React: `npm create vite@latest budget-tour -- --template react`). Install three "real" dependencies — the kind of thing you might reach for in an actual project.

```bash
npm install date-fns lodash-es chart.js
```

- **`date-fns`** — a modular date library; many components.
- **`lodash-es`** — utility functions; the ES-modules build of lodash.
- **`chart.js`** — a popular charting library; relatively large.

Now write code that imports liberally from each. Replace `src/main.jsx` (or `main.js`) with something like:

```javascript
import { format, formatDistance, parseISO } from "date-fns";
import _ from "lodash-es";
import { Chart, registerables } from "chart.js";

Chart.register(...registerables);

console.log(format(new Date(), "yyyy-MM-dd"));
console.log(formatDistance(new Date(), parseISO("2025-01-01")));
console.log(_.chunk([1, 2, 3, 4, 5, 6, 7, 8], 3));
console.log(_.debounce(() => {}, 300));

const canvas = document.createElement("canvas");
document.body.appendChild(canvas);
new Chart(canvas, {
  type: "bar",
  data: {
    labels: ["Mon", "Tue", "Wed"],
    datasets: [{ label: "Hours", data: [3, 5, 4] }]
  }
});
```

Save. Build for production: `npm run build`. Note the size in the build output. You should be **well over 50 KB gzipped**.

---

## Step 2 — Install the visualizer

```bash
npm install -D rollup-plugin-visualizer
```

Add it to `vite.config.js`:

```javascript
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { visualizer } from "rollup-plugin-visualizer";

export default defineConfig({
  plugins: [
    react(),
    visualizer({
      filename: "dist/stats.html",
      gzipSize: true,
      brotliSize: true,
      template: "treemap" // also try "sunburst" and "network"
    })
  ]
});
```

Rebuild: `npm run build`. Open `dist/stats.html` in your browser. You should see a treemap where each rectangle is a module, sized by its compressed contribution to the bundle.

The visualizer's docs at <https://github.com/btd/rollup-plugin-visualizer> describe every option. The `gzipSize` and `brotliSize` flags are essential — uncompressed sizes mislead, because the network ships compressed.

---

## Step 3 — Audit the treemap

In your notes, record:

1. The **total gzipped size** of all JavaScript in the build (sum of every `.js` chunk's gzip size).
2. The **top three largest modules** by gzipped size.
3. The percentage each of the three takes of the total bundle.

For the dependencies above, you should see roughly:

- **`chart.js`** — ~30–50 KB gzipped, depending on which adapters are bundled.
- **`date-fns`** — ~5–15 KB gzipped if tree-shaken; more if not.
- **`lodash-es`** — ~2–10 KB gzipped per used function (well tree-shaken).
- **`react` + `react-dom`** — ~45 KB gzipped, baseline for any React app.

Total comfortably over 100 KB gzipped — already over the 150 KB "standard" budget and far over the 50 KB "strict" budget.

---

## Step 4 — Propose three cuts

Now the work. Write **three concrete proposals** to bring the bundle under 50 KB gzipped. Each proposal must include:

- What you change (specific lines of code or specific dependencies).
- The **expected** size reduction.
- Any **user-facing trade-off** (lost features, different UX, slower for some users).

Examples of good proposals (don't copy these verbatim; use them as a model):

**Proposal A — Lazy-load Chart.js.**
The chart only renders when the user reaches the dashboard page. Move `import { Chart, registerables } from "chart.js"` from the top of `main.jsx` into a dynamic `import("chart.js")` inside the `useEffect` that mounts the chart. The chart library is no longer in the entry bundle; it loads only when the dashboard appears.
- Expected reduction: ~35 KB gzipped from the entry bundle.
- Trade-off: a small (~100 ms on a fast connection, ~500 ms on a slow one) delay before the chart appears the first time. Use a skeleton placeholder during the load.

**Proposal B — Replace `date-fns`'s `formatDistance` with a hand-written function.**
We only use `formatDistance` once, for a "posted 3 days ago" string. A 20-line hand-rolled function (cases for seconds, minutes, hours, days, weeks, months) covers our entire use case. Drop the dependency.
- Expected reduction: ~7 KB gzipped.
- Trade-off: the hand-rolled function does not localize. If we ship in multiple languages later, restore `date-fns` then.

**Proposal C — Import named functions from `lodash-es` instead of the default.**
Right now we `import _ from "lodash-es"` and call `_.chunk(...)` and `_.debounce(...)`. The default import is a namespace import that includes every function in `lodash-es`; if the tree shaker fails to eliminate the unused ones, all of lodash ships. Switch to named imports: `import { chunk, debounce } from "lodash-es"`. With named imports, Rollup only includes the two functions.
- Expected reduction: ~5 KB gzipped.
- Trade-off: none. The change is mechanical.

After Proposals A + B + C, the entry bundle should be roughly **React + ReactDOM + our app code** = 45 + 3 = **~48 KB gzipped**, just under the budget. The chart loads on demand.

---

## Step 5 — Verify

Apply your three proposals. Rebuild. Open the new `stats.html`. Confirm the entry bundle is under 50 KB gzipped.

If you exceed the budget after the cuts, propose a fourth. Continue until you hit the target.

---

## Deliverable

A **single document** (`bundle-budget-report.md` or similar) that contains:

1. The starting bundle size (gzipped) and the names + sizes of the three largest modules.
2. Your three (or more) proposals, each with: change, expected reduction, trade-off.
3. The final bundle size after applying every proposal.
4. A screenshot of the visualizer treemap before AND after.

A one-page report is the right length. **Be specific.** "Lazy-load the heavy thing" is not a proposal; "wrap the Chart import in a dynamic `import()` inside a `useEffect`" is.

---

## Reflection

Two questions for your notes.

**1.** The visualizer reports **gzipped size**. Why is gzipped size the metric that matters and not the parsed (raw) size? (Hint: think about what the browser actually fetches across the network versus what it does after the file arrives.)

**2.** Tree shaking — the bundler's elimination of unused exports — only works reliably when the source is authored in **static ES module syntax**. Why does `import _ from "lodash-es"` (the namespace import) defeat tree shaking, while `import { chunk } from "lodash-es"` (the named import) preserves it?

---

## Stretch (optional)

- Read **"The cost of JavaScript in 2023"** by Addy Osmani at <https://web.dev/articles/the-cost-of-javascript-in-2023>. The article makes the case for the 50 KB budget in concrete numbers.
- Visit <https://bundlephobia.com/> and look up `moment`, `date-fns`, `dayjs`, and `luxon` — the four major date libraries. Note their sizes. The right library is rarely the most popular one.
- Add a **size limit to CI**. The `size-limit` npm package (<https://github.com/ai/size-limit>) fails the build if the bundle exceeds a configured threshold. Add it; configure the limit at 50 KB; watch it fail until your proposals land.

---

## Done when

- [ ] You have run the visualizer and read the treemap.
- [ ] You have identified the three largest modules in your initial build.
- [ ] You have written three concrete cut proposals with sizes and trade-offs.
- [ ] You have applied the proposals and reduced the bundle below 50 KB gzipped.
- [ ] You have answered the two reflection questions in your notes.
