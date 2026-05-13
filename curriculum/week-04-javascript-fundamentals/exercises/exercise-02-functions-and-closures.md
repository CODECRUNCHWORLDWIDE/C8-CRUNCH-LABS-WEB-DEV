# Exercise 2 — Functions and closures

**Time:** ~60 minutes.

## Problem statement

Build three small factory functions, each of which returns a closure. You will end with a working **counter**, a working **debouncer**, and a working **memoizer** — three patterns you will reuse for years. The page hosts a tiny demo of each, but the core of the exercise lives in the console: type into the REPL, watch the closures behave, walk the scope chain in the Sources panel.

```text
┌──────────────────────────────────────────────────┐
│ ●●●    http://localhost:5500/                    │
├──────────────────────────────────────────────────┤
│                                                  │
│   Closure Lab                                    │
│                                                  │
│   Counter                                        │
│   ┌──────────┐  ┌──────────┐                     │
│   │ tick (3) │  │ reset    │                     │
│   └──────────┘  └──────────┘                     │
│                                                  │
│   Search (debounced 300 ms)                      │
│   ┌────────────────────────────────────┐         │
│   │ type here                          │         │
│   └────────────────────────────────────┘         │
│   Last search fired: "code"                      │
│                                                  │
│   Memoized factorial                             │
│   factorial(10) = 3628800 (cache hits: 5)        │
│                                                  │
└──────────────────────────────────────────────────┘
```

We are not writing event handlers yet — that is Week 5. The HTML can be a static skeleton with a `<button id="tick">tick</button>` and an `<input id="search">`; in the script you `document.getElementById(...).addEventListener(...)` as a single line. We are not yet **explaining** the DOM; we are using it to demonstrate closures.

## Source content

Create `exercises/exercise-02/index.html`, `exercises/exercise-02/styles.css`, and `exercises/exercise-02/script.js`. The HTML:

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <title>Closure Lab — Week 4 Exercise 2</title>
    <link rel="stylesheet" href="./styles.css">
  </head>
  <body>
    <main>
      <h1>Closure Lab</h1>

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
    <script src="./script.js"></script>
  </body>
</html>
```

In `script.js`, you write the three factories. Each is independently testable from the console.

## Acceptance criteria

- [ ] `exercises/exercise-02/index.html`, `exercises/exercise-02/styles.css`, and `exercises/exercise-02/script.js` exist.
- [ ] The script exports nothing (it is a classic script for this exercise; modules come in Exercise 3).
- [ ] **`makeCounter()`** returns an object with three methods: `increment()`, `reset()`, and `value` (a getter). Calling `increment()` increases the internal count by 1 and returns the new value.
- [ ] **`debounce(fn, ms)`** returns a function that, when called repeatedly within `ms` milliseconds, only fires `fn` once with the most recent arguments after the last call. Verify by typing into the search box: only the final keystroke after the 300 ms window should log.
- [ ] **`memoize(fn)`** returns a function that caches results by argument. Calling it twice with the same argument returns the cached value the second time; expose a `.cacheSize` or a `.hits` property to verify cache use.
- [ ] No `var` declarations. No global variables other than the three factory functions themselves.
- [ ] The page passes the W3C validator.
- [ ] The console shows no errors on load.

## Hints

<details>
<summary>How do I make the counter expose a getter?</summary>

A getter is a property defined with `get` in an object literal:

```js
function makeCounter() {
  let count = 0;
  return {
    increment() { count = count + 1; return count; },
    reset() { count = 0; },
    get value() { return count; }
  };
}

const c = makeCounter();
c.increment();   // 1
c.value;         // 1 — note: no ()
```

`c.value` looks like a property access, but it runs the getter. The variable `count` is captured in the closure; nothing outside `makeCounter` can write to it directly.

</details>

<details>
<summary>How does the debouncer keep its <code>timer</code> across calls?</summary>

The returned function is the closure; `timer` lives in `debounce`'s scope and is captured.

```js
function debounce(fn, ms) {
  let timer = null;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  };
}
```

Each time the returned function runs, it sees the **same** `timer` variable from the enclosing `debounce` call. `clearTimeout` is safe even if `timer` is `null` (per HTML Living Standard §8.7, `clearTimeout(null)` is a no-op).

Wire it up:

```js
const onSearch = debounce((value) => {
  document.getElementById('lastSearch').textContent = value;
}, 300);

document.getElementById('search').addEventListener('input', (event) => {
  onSearch(event.target.value);
});
```

Type fast in the search box. The `output` only updates once you pause typing for 300 ms.

</details>

<details>
<summary>How does the memoizer cache by argument?</summary>

A `Map` keyed by the argument is the right primitive — a `Map` accepts any value as a key (including objects), unlike a plain object which coerces keys to strings.

```js
function memoize(fn) {
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

const factorial = memoize((n) => n <= 1 ? 1 : n * factorial(n - 1));

factorial(10);    // 3628800, computed once
factorial(10);    // 3628800, from cache
factorial.hits(); // 1
```

A subtle point: the recursive call inside the original `fn` calls `factorial` (the memoized version), not itself directly. The first call computes `10 * 9 * 8 * ... * 1`; each intermediate result is cached, so a subsequent `factorial(9)` is a cache hit.

</details>

<details>
<summary>How do I walk a closure in DevTools?</summary>

Set a `debugger;` statement inside the returned function:

```js
function makeCounter() {
  let count = 0;
  return function increment() {
    debugger;
    count = count + 1;
    return count;
  };
}
```

Open Sources, click the counter button, and the page pauses on `debugger;`. In the **Scope** pane on the right, you see:

- `Local`: nothing (the function takes no arguments).
- `Closure (makeCounter)`: `{ count: 0 }`.
- `Global`: the page's globals.

This is the closure, visible in the inspector. Click "Step over" once; `count` becomes `1`. Click again, the function returns `1`. Click the counter button again — the function re-enters, the same closure scope is still there, `count` is still `1`.

The scope chain is not a metaphor.

</details>

## Stretch

- Add a `once(fn)` factory: returns a function that calls `fn` only the first time it is invoked; subsequent calls return the cached first result. Useful for one-time initialization.
- Add `throttle(fn, ms)`: similar to `debounce`, but fires the first call immediately and ignores subsequent calls for `ms` milliseconds. Useful for scroll handlers.
- Memoize on **multiple** arguments using a serialized key (`JSON.stringify(args)`) or a tree of nested `Map`s. Each approach has trade-offs; document them in a comment.
- Add a `prefers-reduced-motion` check to the search box (the `output` flashes when it updates by default). Inside `@media (prefers-reduced-motion: no-preference)`, declare the flash; outside, skip it.

## Self-check

Type the three factories into the console directly, one after the other:

```js
function makeCounter() { /* paste */ }
const c1 = makeCounter();
const c2 = makeCounter();
c1.increment(); c1.increment(); c1.increment();
c2.increment();
c1.value;   // 3
c2.value;   // 1
```

Two independent counters, two independent closures. If `c1.value` and `c2.value` are equal, your closure leaked — you probably used a shared variable above the factory body instead of a local one inside.

Now open the Sources panel and walk the scope of each, as in the hint above. You should see two distinct `Closure (makeCounter)` records, each with its own `count`.

## Submission

Commit `exercises/exercise-02/index.html`, `exercises/exercise-02/styles.css`, and `exercises/exercise-02/script.js` to your Week 4 repo. In your commit message, name one place in your past code (or in code you have read) where a debouncer or memoizer would have helped.
