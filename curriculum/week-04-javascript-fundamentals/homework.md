# Week 4 Homework

Six problems, ~6 hours total. Commit each in your Week 4 repo under a `homework/` folder.

---

## Problem 1 — The console gauntlet (45 min)

Open <https://javascript30.com/> and pick any three of the thirty projects. They are short — 20 to 40 minutes each. All thirty are free, all vanilla JavaScript, no frameworks.

In `homework/01-js30.md`, note:

- Which three projects you chose, and a one-sentence summary of each.
- The single ECMAScript feature that earned its keep in each project (e.g., "I used `Array.prototype.reduce` to total the duration of all videos in `04 - Array Cardio Day 1`").
- One thing you wrote that you would refactor on a second pass.

**Acceptance.** A short file with three short answers. Screenshots optional but welcome.

---

## Problem 2 — Type-coercion table (45 min)

Build `homework/02-coercion/index.html` and `homework/02-coercion/script.js`. The page renders a table that demonstrates the JavaScript coercion rules. The rows are the eight value categories (`undefined`, `null`, a Boolean, a Number, a BigInt, a String, an Array, an Object); the columns are the four destination types (`Boolean`, `Number`, `String`, `JSON.stringify`).

For each cell, render the result. For instance:

| value | `Boolean(v)` | `Number(v)` | `String(v)` | `JSON.stringify(v)` |
|-------|---|---|---|---|
| `undefined` | `false` | `NaN` | `'undefined'` | `undefined` (no key!) |
| `null` | `false` | `0` | `'null'` | `'null'` |
| `""` | `false` | `0` | `''` | `'""'` |
| `"0"` | `true` | `0` | `'0'` | `'"0"'` |

Generate the table from JavaScript so that you cannot cheat with hand-typed answers. Run the page; the table fills in.

**Acceptance.**

- The table renders 8 rows × 4 columns = 32 cells, each filled in by JavaScript.
- The page passes the validator and axe DevTools cleanly.
- A `notes.md` (5–10 sentences) on which cell surprised you most and why. Cite an ECMA-262 section.

---

## Problem 3 — Refactor a `for` loop into a pipeline (1 h)

Take this `for`-loop-heavy function (or write your own equivalent, longer is fine):

```js
function summarize(items) {
  let totalPrice = 0;
  let cheapestName = null;
  let cheapestPrice = Infinity;
  const onSale = [];

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    if (item.inStock) {
      totalPrice = totalPrice + item.price;
      if (item.price < cheapestPrice) {
        cheapestPrice = item.price;
        cheapestName = item.name;
      }
      if (item.sale) {
        onSale.push(item.name);
      }
    }
  }

  return { totalPrice, cheapestName, onSale };
}
```

Rewrite it using `filter`, `map`, `reduce`, and `find` — no `for` loops, no `let` accumulators. The result is the same. Save both versions in `homework/03-pipeline/before.js` and `homework/03-pipeline/after.js`.

Write 20 sample items in `data.js` (use `export const items = [...]`), import them into both versions, and verify the outputs match.

**Acceptance.**

- The two versions produce **identical** outputs on the same sample data. Assert this in a `verify.js` that runs both and compares the results.
- The `after.js` version uses no `let`, no `for`, no `forEach` — only `filter`, `map`, `reduce`, `find`, and the destructured assignments around them.
- A `notes.md` lists one case where the `for`-loop version was easier to read, and one case where the pipeline version was.

---

## Problem 4 — Closures, on purpose (1 h)

Build `homework/04-closures/script.js` that defines and exports five small factory functions, each returning a closure:

1. **`makeCounter(start = 0, step = 1)`** — returns `{ value, increment, decrement, reset }`. `value` is a getter.
2. **`makeQueue()`** — returns `{ enqueue, dequeue, peek, size }`. FIFO. Internal storage is a closed-over array.
3. **`makeRange(min, max)`** — returns a function `nextRandom()` that yields a random integer in `[min, max]` each call. The min and max are closed over, not parameters.
4. **`makeIdGenerator(prefix)`** — returns a function `id()` that yields `prefix-001`, `prefix-002`, ... — the count is closed over.
5. **`makeOnce(fn)`** — returns a wrapper that calls `fn` exactly once; subsequent calls return the cached first result.

Write a small `verify.js` that exercises each factory with at least two distinct instances and asserts independence.

**Acceptance.**

- All five factories are pure (no global state).
- Each factory has at least one JSDoc-style comment explaining its public surface.
- `verify.js` asserts each factory works and that two instances of the same factory are independent.
- A `notes.md` lists one real-world use for each factory you would reach for in production.

---

## Problem 5 — Mini module library (1 h)

Build `homework/05-modules/`. The folder contains:

```
homework/05-modules/
├── index.html
├── main.js
└── lib/
    ├── array.js     ← unique, chunk, flatten, range
    ├── string.js    ← capitalize, slugify, truncate
    └── math.js      ← clamp, lerp, mod (positive)
```

Each `lib/*` module exports three or four named functions. Each function has a one-line JSDoc.

In `main.js`, import a handful and run a sanity check that logs the result of each to the console:

```js
import { unique, range } from './lib/array.js';
import { slugify } from './lib/string.js';
import { clamp } from './lib/math.js';

console.log(unique([1, 1, 2, 3, 3]));      // [1, 2, 3]
console.log(range(0, 5));                   // [0, 1, 2, 3, 4]
console.log(slugify('Hello, World!'));      // 'hello-world'
console.log(clamp(150, 0, 100));            // 100
```

**Acceptance.**

- The Network panel shows four JS requests: `main.js` + three `lib/*` modules.
- The page renders no JavaScript-driven UI; the console is the demo surface.
- The page passes the validator.
- A `notes.md` notes one function from this exercise that you wish the platform shipped as a built-in, and the closest existing alternative on `Array.prototype` or `String.prototype`.

---

## Problem 6 — Reflection (30 min)

Write `homework/06-reflection.md` (300–400 words) answering:

1. Which JavaScript concept from Week 4 changed your mental model the most — and why? Be specific (which lecture section, which spec citation).
2. Pick one ECMAScript primitive or method whose default behavior surprised you. Where will you reach for it next?
3. Name one decision you made this week that you would defend in a code review. Cite a spec section or a WCAG criterion.
4. What is one habit you will keep from Week 4, for the rest of your career? (Plausible candidates: "always wrap `JSON.parse` in `try`/`catch`"; "`const` by default, `let` when reassigning"; "no `==`, ever, except for `value == null`"; "split scripts into modules before they grow.")

---

## How to submit

- Create a folder `homework/` in your Week 4 repo.
- Save each problem's output with the filename suggested above.
- One commit per problem is ideal; one big commit at the end is acceptable.
- In your final commit message, link to the file(s) you spent the most time on.

## Grading guide

This homework is graded on completion, not perfection. You are practicing. The rubric:

| Problem | What "complete" means |
| ------- | --------------------- |
| 1 | Three JS30 projects done; short notes on each. |
| 2 | The 32-cell coercion table renders; surprises documented. |
| 3 | Two versions of `summarize` produce identical outputs; pipeline version uses no `for`/`let`. |
| 4 | Five working factory functions; `verify.js` asserts independence. |
| 5 | Four working modules; sanity check logs the expected outputs. |
| 6 | 300–400 word reflection answering all four questions. |

If you finish a problem and are uncertain whether it counts as "complete," ask in the cohort channel. Future-you reads better notes than nobody-you.

## Time budget

| Problem | Time |
| ------: | ---: |
| 1 | 45 min |
| 2 | 45 min |
| 3 | 1 h |
| 4 | 1 h |
| 5 | 1 h |
| 6 | 30 min |
| **Total** | **~5 h** |

When done, push your Week 4 repo and ship the [mini-project](./mini-project/README.md).
