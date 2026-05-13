# Lecture 2 — Scope, Closures, and Modules

> **Outcome:** You can read a piece of JavaScript and trace its scope chain by eye. You recognize a closure in any of its three or four common disguises — counter, debouncer, private cache, module pattern — and can write each on purpose. You split a small program across ES modules, load it with `<script type="module">`, and explain why modules have their own scope, strict mode, and CORS rules without prompting.

## 1. What scope actually is

Scope is the answer to one question: **given a name in my code, which binding does that name refer to?** When you write `x` in a function body, the engine has to figure out which `x` you meant — a parameter, a local declaration, an enclosing function's variable, or a global. The rule it follows is **scope**.

JavaScript is **lexically scoped**, per ECMA-262 §8 (Executable Code and Execution Contexts). "Lexical" means "according to where the code is written." Open a JS file in your editor; the scopes are the nested `{}` and `function` blocks you can see on the page. A name resolves to the innermost enclosing scope that declared it.

The alternative — **dynamic scoping** — would resolve names according to the **call stack** at runtime: `x` would mean whatever the caller's `x` is. Bash has dynamic scoping. JavaScript does not. The decision is set when you write the code, not when you run it.

```js
const x = 'outer';

function outer() {
  const x = 'inner';
  return inner();
}

function inner() {
  return x;             // 'outer' — lexical, not 'inner'
}

outer();                // 'outer'
```

`inner` is written next to the global `x`. It resolves `x` to the global `x`, regardless of who calls it. The fact that `outer` declared its own `x` is irrelevant — `inner` was not written inside `outer`, so `outer`'s scope is not in `inner`'s chain.

---

## 2. The four kinds of scope

Per ECMA-262 §9 (Environment Records), a JavaScript program has these scope kinds:

### Global scope

The outermost scope. In a browser, the global object is `window`. Anything declared with `var` at the top level becomes a property of `window`; anything declared with `let` or `const` at the top level does not (per §9.1.1.4). Both, however, are reachable as bare names from anywhere in the script.

A trap: **modules do not share the global scope.** A `<script type="module">` runs in module scope, not global scope. Top-level `let` and `const` in a module are private to that module. We will come back to this in §6.

### Function scope

Every function call creates a fresh scope. Parameters and local declarations belong to that scope. The function's scope ends when the function returns (or throws). Pre-2015 JavaScript had only function scope and global scope; everything else was a workaround.

### Block scope

Every `{}` — `if`, `for`, `while`, `try`, or a bare `{}` — creates a new scope for `let`, `const`, `class`, and function declarations in strict mode. `var` ignores block scope and binds to the enclosing function or global scope.

```js
{
  let blockOnly = 1;
  var leaksOut = 2;
}
console.log(leaksOut);   // 2
console.log(blockOnly);  // ReferenceError
```

### Module scope

A module — a file loaded with `import` or `<script type="module">` — has its own top-level scope. Top-level declarations are visible inside the module but not outside. To expose a binding, you `export` it. To use another module's binding, you `import` it.

---

## 3. Hoisting and the temporal dead zone

> **The single most-confusing topic for new readers of JavaScript: **declarations** are visible to their scope from the top, but **initializations** happen on the line where they appear. The gap between "the binding exists" and "the binding has a value" is what we call hoisting.**

Per §10.2.1.2 and §10.2.1.3, when JavaScript prepares to run a function or module body, it walks the body in a **pre-execution pass** and registers every declaration with its enclosing scope. Then it runs the body line by line.

For `function` declarations, the pre-execution pass also assigns the function value. The function is callable from the top of the scope:

```js
greet();   // 'hi' — works

function greet() {
  console.log('hi');
}
```

For `var`, the pre-execution pass registers the binding but initializes it to `undefined`. References before the line return `undefined`, not `ReferenceError`:

```js
console.log(x);   // undefined
var x = 5;
console.log(x);   // 5
```

For `let` and `const`, the pre-execution pass registers the binding but **does not initialize it**. References before the `let`/`const` line throw `ReferenceError`. The region between "the binding exists in scope" and "the line that gives it a value" is the **temporal dead zone**, the TDZ.

```js
console.log(y);   // ReferenceError: Cannot access 'y' before initialization
let y = 5;
```

The TDZ is a feature, not a bug. It makes `let` and `const` behave the way newcomers from other languages **expect** variables to behave — they exist from the line they are declared on, not before. The cost is that you must write declarations before references; the benefit is that bugs from forward references become loud errors instead of silent `undefined`s.

---

## 4. The scope chain

When the engine resolves a name, it walks the **scope chain**: the current function's scope, then its enclosing function's scope, then *that* one's enclosing scope, and so on up to the global scope. The first match wins; if no match is found, a `ReferenceError` is thrown.

```js
const a = 1;

function outer() {
  const b = 2;

  function middle() {
    const c = 3;

    function inner() {
      const d = 4;
      console.log(a, b, c, d);
    }

    inner();
  }

  middle();
}

outer();   // 1 2 3 4
```

`inner`'s scope chain, looking from inside out:

```text
   ┌─────────────────────────┐
   │ inner: { d: 4 }         │
   ├─────────────────────────┤
   │ middle: { c: 3 }        │
   ├─────────────────────────┤
   │ outer: { b: 2 }         │
   ├─────────────────────────┤
   │ <global>: { a: 1 }      │
   └─────────────────────────┘
```

`a` resolves four scopes up. The chain is **fixed at function creation**, not at function call. This is the lexical scoping rule from §1 of this lecture, restated mechanically.

---

## 5. Closures

> **A function in JavaScript closes over the variables it references from its enclosing scope. When the enclosing scope's frame pops, those variables stay alive as long as the function reference does. The combination — function + captured variables — is a closure.**

This is the most-feared topic of JavaScript, and the most over-mystified. Every function in JavaScript is technically a closure; we say "closure" specifically when the captured variables outlive their enclosing function call. That is the case where the pattern earns its name.

### The counter — the canonical example

```js
function makeCounter() {
  let count = 0;
  return function increment() {
    count = count + 1;
    return count;
  };
}

const counter = makeCounter();
counter();   // 1
counter();   // 2
counter();   // 3
```

`makeCounter` runs once and returns the inner `increment` function. By the time you call `counter()` for the first time, `makeCounter`'s stack frame has already popped — and yet `count` is still there. Why? Because `increment` references `count`, and the engine keeps `count` alive as long as `increment` is reachable. The combination of `increment` + the bound `count` is a closure.

You can prove this by making a second counter:

```js
const a = makeCounter();
const b = makeCounter();
a(); a(); a();   // 1, 2, 3
b();             // 1 — b has its own count
```

Two calls to `makeCounter` create two independent `count` variables, each captured by its own inner function. The closure is not magic; it is the lexical scope rule applied to a function that outlives its enclosing call.

### The debouncer — closure as a private timer

```js
function debounce(fn, ms) {
  let timer = null;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  };
}

const onSearch = debounce((query) => console.log('searching:', query), 300);
onSearch('a');
onSearch('ab');
onSearch('abc');   // only this one fires, 300 ms later
```

`debounce` returns a function. The returned function references `timer` and `fn` from `debounce`'s scope. Each call to `onSearch` updates `timer`; the captured `timer` outlives `debounce`'s frame. A debouncer is one of the half-dozen patterns you will reach for in production.

### The memoizer — closure as a private cache

```js
function memoize(fn) {
  const cache = new Map();
  return function (key) {
    if (cache.has(key)) return cache.get(key);
    const value = fn(key);
    cache.set(key, value);
    return value;
  };
}

const slowFib = (n) => n < 2 ? n : slowFib(n - 1) + slowFib(n - 2);
const fastFib = memoize(slowFib);
fastFib(40);   // computed once, cached for future calls
```

The `cache` is private to the returned function. No one outside `memoize` can read or write it. Closures are JavaScript's encapsulation primitive — they were the encapsulation primitive long before `class` and `#private` fields shipped.

### The module pattern — closure as a namespace

Before ES modules shipped, the standard way to give a script private state was the **IIFE module pattern** — an Immediately Invoked Function Expression that returns an object of public methods:

```js
const counter = (function () {
  let count = 0;
  return {
    increment() { count++; return count; },
    reset() { count = 0; },
    get value() { return count; }
  };
})();

counter.increment();   // 1
counter.value;         // 1
```

You will read this pattern in code from 2010–2015. We now use ES modules instead (next section). The mechanism is the same — a closure providing private state — but the syntax is built-in.

### When closures bite

Closures capture variables by **reference**, not by value. This catches everyone at least once:

```js
const handlers = [];
for (var i = 0; i < 3; i++) {
  handlers.push(() => console.log(i));
}
handlers.forEach(h => h());   // 3, 3, 3 — not 0, 1, 2
```

All three closures captured the **same** `i`. By the time the loop ended, `i` was `3`. Each closure sees `i = 3`.

The fix is to use `let`, which creates a new binding per iteration:

```js
const handlers = [];
for (let i = 0; i < 3; i++) {
  handlers.push(() => console.log(i));
}
handlers.forEach(h => h());   // 0, 1, 2
```

`let` in a `for` head is a special case in the spec (§14.7.4.7) — each iteration gets a fresh binding of `i`. Closures pick up the per-iteration binding. This is one of the strongest practical reasons to prefer `let` over `var`.

---

## 6. ES modules

Modules are how JavaScript files address each other. Pre-2015, browsers had no module system; every script ran in global scope, and dependency order was managed by `<script>` tag order or by a custom loader (RequireJS, AMD, CommonJS). ES2015 added the `import` and `export` statements, and from 2017 onward, every modern browser ships them natively.

### The two declarations

```js
// utils.js
export function add(a, b) { return a + b; }
export const PI = 3.14159;
export default function greet(name) { return `Hi, ${name}`; }
```

- **Named exports.** Any number per module. Imported by their exact name (or renamed): `import { add, PI } from './utils.js';`.
- **Default export.** At most one per module. Imported with any name: `import greet from './utils.js';`.

Mixing both is legal: `import greet, { add } from './utils.js';`.

### The static `import`

```js
// main.js
import { add, PI } from './utils.js';
import greet from './utils.js';
import * as utils from './utils.js';   // namespace import

console.log(add(1, 2));         // 3
console.log(greet('Ada'));      // 'Hi, Ada'
console.log(utils.PI);          // 3.14159
```

Imports are **static** — the engine reads them before running any code. You cannot wrap an `import` in an `if` or call it inside a function (use dynamic `import()` for that; we will see it in Week 7).

Imports are **hoisted** — they run before the rest of the module body. You can reference imported names anywhere in the file.

Imports are **read-only bindings**, not value copies. If `utils.js` mutates an exported variable, the importer sees the new value. (You should still treat imports as constants; mutating exports is a bad smell.)

### Loading a module in HTML

```html
<script type="module" src="./main.js"></script>
```

`<script type="module">` tells the browser this file is a module. Per HTML Living Standard §4.12.1, this changes several behaviors:

1. **Strict mode is automatic.** No need to write `'use strict'` at the top.
2. **Deferred by default.** Module scripts execute after the document has parsed, like a classic `<script defer>`. You do not need to put them at the bottom of `<body>`.
3. **CORS-checked.** A module fetched from a different origin must be served with a permissive CORS header. Local files (the `file://` scheme) are blocked entirely; you must serve modules from an HTTP origin. **This is why Live Server is required this week.**
4. **Top-level `this` is `undefined`.** Classic scripts have `this === window`; modules do not.
5. **One execution per URL.** A module loaded twice by import or by `<script>` runs once; subsequent imports return the cached module record.

### A worked example

A minimal three-file module set:

```html
<!-- index.html -->
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <title>Hello modules</title>
  </head>
  <body>
    <h1>Open the console.</h1>
    <script type="module" src="./main.js"></script>
  </body>
</html>
```

```js
// math.js
export function add(a, b) { return a + b; }
export function multiply(a, b) { return a * b; }
```

```js
// greet.js
export default function greet(name) { return `Hello, ${name}`; }
```

```js
// main.js
import { add, multiply } from './math.js';
import greet from './greet.js';

console.log(greet('Ada'));           // 'Hello, Ada'
console.log(add(2, 3));              // 5
console.log(multiply(4, 5));         // 20
```

Open `index.html` with Live Server. Open the console. Three log lines appear. The three modules loaded, in dependency order, with no bundler.

---

## 7. `localStorage` — the Web Storage API

`localStorage` is a synchronous, persistent, string-only key-value store available to every origin. Per the Web Storage Living Standard, it is the simplest persistence API the platform provides. We will use it in the mini-project to keep to-do items across page reloads.

### The API in five methods

```js
localStorage.setItem('key', 'value');     // write
localStorage.getItem('key');              // 'value' — or null if missing
localStorage.removeItem('key');           // delete
localStorage.clear();                     // delete everything for this origin
localStorage.length;                      // count of keys
localStorage.key(0);                      // the first key, by some implementation-defined order
```

Notes:

- **Strings only.** To store an object, serialize with `JSON.stringify` and parse with `JSON.parse` on read.
- **Synchronous.** Reads and writes block the main thread. This is fine for a to-do list; it is not fine for megabytes of data.
- **Per-origin.** `https://example.com` and `https://example.com:8080` are different origins. Storage is not shared.
- **About 5 MB per origin.** Implementation-defined; browsers ship 5–10 MB. Exceeding it throws `QuotaExceededError`.
- **Cleared when the user clears site data.** Not a database. Do not store anything you cannot reconstruct.
- **Synchronous across tabs.** A `storage` event fires on other tabs when a key changes (we will use this in Week 5).

### A defensive read-write pair

```js
const STORAGE_KEY = 'codecrunch.todos.v1';

function loadTodos() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === null) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.warn('Failed to load todos; resetting.', err);
    return [];
  }
}

function saveTodos(todos) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
  } catch (err) {
    console.warn('Failed to save todos; storage may be full.', err);
  }
}
```

Three habits to notice:

1. **Wrap reads in `try`/`catch`.** `JSON.parse` throws on malformed input; you cannot trust that what you stored is what you get back (a user may have edited it in DevTools, or another version of your app may have used a different shape).
2. **Validate the parsed shape.** `Array.isArray(parsed)` is a quick check; for richer shapes, a schema validator (or hand-rolled checks) is the next level up.
3. **Wrap writes in `try`/`catch`.** `QuotaExceededError` is real; private-browsing modes also reject `setItem` on some browsers.
4. **Namespace and version your key.** `codecrunch.todos.v1` makes it obvious where the data came from and gives you a path to migrate when the shape changes.

---

## 8. The accessibility check, integrated

Three things to verify on every piece of JavaScript you write this week, every time:

### 1. The page works without JavaScript

Open DevTools → Settings → Disable JavaScript. Reload the page. The static content should still read. Forms still submit (their default action is server-side; you will intercept it in JS in Week 6). Links still navigate. This is the **progressive enhancement** mindset; JavaScript adds capability, it does not gate basic use.

### 2. The page handles JavaScript errors gracefully

A single uncaught exception can leave your app in a broken state. Wrap `localStorage` calls in `try`/`catch`. Wrap `JSON.parse` in `try`/`catch`. When the catch fires, log it (`console.warn`) and continue with sensible defaults. We will add a real error-reporting pattern in Week 8; for this week, log and recover.

### 3. The DOM and the `localStorage` state agree

When your JavaScript reads from `localStorage` and writes to the DOM, the two must stay in sync. The pattern: keep an **in-memory model** as the source of truth; render from the model; persist the model after every change. We will write this pattern in the mini-project. Do not maintain two parallel sources of truth — one will drift.

---

## 9. Self-check

Without re-reading:

1. Define lexical scope in one sentence.
2. Name the four kinds of scope in JavaScript.
3. What is the temporal dead zone, and which declarations have one?
4. What is a closure? Give one practical use.
5. What does `<script type="module">` change about how a script behaves?
6. Name three things `localStorage` does not do.
7. Why does `for (var i = 0; ...)` produce the "captured value" bug, and how does `let` fix it?

---

## Further reading

- **ECMA-262 — §8 Executable Code and Execution Contexts**: <https://tc39.es/ecma262/#sec-executable-code-and-execution-contexts>
- **ECMA-262 — §16 ECMAScript Language: Scripts and Modules**: <https://tc39.es/ecma262/#sec-ecmascript-language-scripts-and-modules>
- **HTML Living Standard — Module scripts**: <https://html.spec.whatwg.org/multipage/webappapis.html#module-script>
- **HTML Living Standard — Web Storage**: <https://html.spec.whatwg.org/multipage/webstorage.html>
- **MDN — Closures**: <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Closures>
- **MDN — JavaScript modules**: <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules>
- **You Don't Know JS Yet — Scope & Closures**: <https://github.com/getify/You-Dont-Know-JS/tree/2nd-ed/scope-closures>

Next: do the exercises in [exercises/](../exercises/), take the [quiz](../quiz.md), pick the [challenge](../challenges/challenge-01-build-a-todo-app-no-framework.md), and ship the [mini-project](../mini-project/README.md).
