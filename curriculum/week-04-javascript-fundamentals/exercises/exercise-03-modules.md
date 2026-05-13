# Exercise 3 — Modules

**Time:** ~50 minutes.

## Problem statement

Take the three closures from Exercise 2 — counter, debouncer, memoizer — and refactor them into three separate ES modules. The HTML loads a single entry-point module (`main.js`), which imports the three factories and wires them up. By the end you have a four-file layout you could grow into a real application, served with nothing but Live Server.

```text
exercises/exercise-03/
├── index.html
├── styles.css
├── main.js           ← entry point, type="module"
└── lib/
    ├── counter.js    ← exports makeCounter
    ├── debounce.js   ← exports debounce
    └── memoize.js    ← exports memoize
```

The page is the same demo as Exercise 2. The difference is that every line of JS that was in `script.js` now lives in one of four files, and the `<script>` tag is `<script type="module" src="./main.js"></script>`.

## Source content

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <title>Module Lab — Week 4 Exercise 3</title>
    <link rel="stylesheet" href="./styles.css">
  </head>
  <body>
    <main>
      <h1>Module Lab</h1>

      <section>
        <h2>Counter</h2>
        <button id="tick" type="button">tick (<span id="tickValue">0</span>)</button>
        <button id="reset" type="button">reset</button>
      </section>

      <section>
        <h2>Search (debounced 300 ms)</h2>
        <input id="search" type="search" placeholder="type here">
        <p>Last search fired: <output id="lastSearch">—</output></p>
      </section>

      <section>
        <h2>Memoized factorial</h2>
        <p><output id="memoOut">—</output></p>
      </section>
    </main>
    <script type="module" src="./main.js"></script>
  </body>
</html>
```

`lib/counter.js`:

```js
export function makeCounter() {
  let count = 0;
  return {
    increment() { count = count + 1; return count; },
    reset() { count = 0; },
    get value() { return count; }
  };
}
```

`lib/debounce.js`:

```js
export function debounce(fn, ms) {
  let timer = null;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  };
}
```

`lib/memoize.js`:

```js
export function memoize(fn) {
  const cache = new Map();
  let hits = 0;

  function memoized(key) {
    if (cache.has(key)) {
      hits = hits + 1;
      return cache.get(key);
    }
    const value = fn(key);
    cache.set(key, value);
    return value;
  }

  memoized.hits = () => hits;
  memoized.size = () => cache.size;
  return memoized;
}
```

`main.js`:

```js
import { makeCounter } from './lib/counter.js';
import { debounce } from './lib/debounce.js';
import { memoize } from './lib/memoize.js';

const counter = makeCounter();
const tickValue = document.getElementById('tickValue');

document.getElementById('tick').addEventListener('click', () => {
  counter.increment();
  tickValue.textContent = counter.value;
});

document.getElementById('reset').addEventListener('click', () => {
  counter.reset();
  tickValue.textContent = counter.value;
});

const onSearch = debounce((value) => {
  document.getElementById('lastSearch').textContent = value || '—';
}, 300);

document.getElementById('search').addEventListener('input', (event) => {
  onSearch(event.target.value);
});

const factorial = memoize((n) => n <= 1 ? 1 : n * factorial(n - 1));
document.getElementById('memoOut').textContent =
  `factorial(10) = ${factorial(10)} (cache size: ${factorial.size()})`;
```

## Acceptance criteria

- [ ] The four-file structure exists as shown.
- [ ] The HTML loads exactly one `<script>` tag, and that tag has `type="module"`.
- [ ] The page renders cleanly with Live Server (HTTP origin); modules must not be loaded from `file://`.
- [ ] All three demos work: the counter increments, the search debounces, the factorial computes.
- [ ] The DevTools **Network** panel shows four requests: `index.html`, `styles.css`, `main.js`, `lib/counter.js`, `lib/debounce.js`, `lib/memoize.js`. (Six total, of which four are JS.)
- [ ] None of the three `lib/` modules references `document` or any DOM API. They are pure JavaScript modules; the DOM wiring lives in `main.js`. (This is the **separation of concerns** that modules buy you.)
- [ ] Each library module's exported function has a one-line JSDoc comment above it explaining what it does. (No need for full type annotations; one line is the goal.)
- [ ] The page passes the W3C validator.
- [ ] The console shows no errors on load.

## Hints

<details>
<summary>Why do I need Live Server to load modules?</summary>

Per HTML Living Standard §4.12.1 and the Fetch standard, module scripts are fetched with CORS rules. The `file://` scheme has no origin in the spec sense, and the browser refuses to apply CORS to it; the result is that `<script type="module">` fails silently or with an error like:

> Access to script at 'file:///.../main.js' from origin 'null' has been blocked by CORS policy.

Live Server gives you an HTTP origin (typically `http://127.0.0.1:5500/`); modules load normally from there. Any local HTTP server would work — `python3 -m http.server`, Node's `npx serve`, anything. Live Server is the easiest because it also reloads on save.

</details>

<details>
<summary>Why do my imports need <code>./</code> and the <code>.js</code> extension?</summary>

Per HTML Living Standard, a module specifier in the browser must be a fully resolved URL, either absolute or relative. `./counter.js` is relative; `counter.js` is a **bare specifier** and the browser does not resolve it. Bare specifiers like `import x from 'lodash'` work in Node and in bundled code; they do not work in the browser without an **import map** (which we cover in Week 7).

The `.js` extension is required for the same reason — the browser does not guess. Node sometimes lets you omit the extension; browsers do not.

</details>

<details>
<summary>How is a module different from a classic script?</summary>

Five differences worth remembering, per Lecture 2 §6:

1. **Strict mode is automatic.** `'use strict'` is implicit; you cannot opt out.
2. **Deferred execution by default.** A module script behaves like `<script defer>`; it runs after the DOM has parsed, even without the attribute.
3. **One execution per URL.** Two `<script type="module" src="./main.js">` tags load the file once.
4. **CORS-checked.** Cross-origin modules need the `Access-Control-Allow-Origin` header. Same-origin modules (your Live Server) are fine.
5. **Top-level `this` is `undefined`**, not `window`.

The deferred execution is the one that surprises people most: you do not need to put module scripts at the end of `<body>`. They run after the DOM, regardless of where the tag sits.

</details>

<details>
<summary>What is the difference between named and default exports?</summary>

A **named export** is bound to a name in the module's exports:

```js
export function makeCounter() { ... }
// at the importer:
import { makeCounter } from './counter.js';
```

A **default export** is the module's "main" thing. There can be at most one per module:

```js
export default function makeCounter() { ... }
// at the importer:
import makeCounter from './counter.js';        // any name you choose
import Anything from './counter.js';            // also legal
```

Style guidance: **prefer named exports.** A module that named-exports forces every importer to use the same name, which makes refactoring easier; tooling autocompletes named exports, but cannot autocomplete default exports because the local name is up to the importer. Default exports are useful for single-purpose modules (one component, one function); for a utility module with several exports, named is the right choice.

</details>

## Stretch

- Add a fourth module, `lib/storage.js`, that exports `loadJSON(key, fallback)` and `saveJSON(key, value)` — the defensive `localStorage` helpers from Lecture 2 §7. Wire them in `main.js` so the counter persists across reloads. (You will reuse these in the mini-project.)
- Add an **index module**, `lib/index.js`, that re-exports everything: `export * from './counter.js'; export * from './debounce.js'; export * from './memoize.js';`. Change `main.js` to import from `./lib/index.js`. Notice how the public API of `lib/` is now declared in one place.
- Add a **dynamic import**: `const { memoize } = await import('./lib/memoize.js');`. Only load the memoizer when the user clicks the "memoize" button. Dynamic `import()` returns a Promise; we are skipping ahead to Week 8, but the syntax is worth seeing.
- Set a `debugger;` statement at the top of `main.js` and reload. The Sources panel pauses before any line of your code runs. Walk the call stack: who called your module? Answer: the host's module loader. The browser is itself a JavaScript program; you are now visible to it.

## Self-check

Open DevTools → Network. Reload. You should see six requests: `index.html`, `styles.css`, `main.js`, `lib/counter.js`, `lib/debounce.js`, `lib/memoize.js`. The four JS files are served with `Content-Type: text/javascript` (or `application/javascript`). The order they appear in is the **import graph** in topological order; `main.js` is parsed first, then its imports.

Try changing one line in `lib/counter.js` — say, make `increment` return `count * 2` instead of `count` (a bug). Save. Live Server reloads. The counter now ticks 2, 4, 6, 8 instead of 1, 2, 3, 4. The other modules did not need a re-write; only `counter.js` changed. This is the **isolation** that modules buy you.

Revert the change. Commit.

## Submission

Commit the seven files (HTML, CSS, `main.js`, three `lib/` modules; plus an optional `lib/index.js` if you did the stretch) to your Week 4 repo. In your commit message, note one place in your past code (or in code you have read) where the script could have been split into modules and was not — and what you would name each module.
