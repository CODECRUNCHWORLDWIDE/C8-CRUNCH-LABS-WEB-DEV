# Week 4 — Resources

Every resource here is **free** and **publicly accessible**.

## The two essential books

The "You Don't Know JS Yet" series by Kyle Simpson is the canonical free book on JavaScript. The second edition is in active revision; the first edition is also free on GitHub. Read at least the **Get Started** and **Scope & Closures** books this week. Both are short. Both are deeper than they look.

- **You Don't Know JS Yet (2nd Ed.) — Get Started** — Kyle Simpson. The lay of the language; a calmer alternative to a tutorial.
  <https://github.com/getify/You-Dont-Know-JS/tree/2nd-ed/get-started>
- **You Don't Know JS Yet (2nd Ed.) — Scope & Closures** — Kyle Simpson. The book that makes closures click for an entire generation.
  <https://github.com/getify/You-Dont-Know-JS/tree/2nd-ed/scope-closures>
- **You Don't Know JS Yet (2nd Ed.) — Objects & Classes** — Kyle Simpson. Read this once you have closures internalized; you will read it differently.
  <https://github.com/getify/You-Dont-Know-JS/tree/2nd-ed/objects-classes>

## Primary sources

- **ECMA-262 — ECMAScript Language Specification (15th edition, June 2024)** — the normative spec. Bookmark it. Read §6 (Types), §7 (Abstract Operations), §13 (Expressions), §14 (Statements), §15 (Functions and Classes) at least once this week.
  <https://tc39.es/ecma262/>
- **TC39 Proposals** — the language's roadmap. Each Stage-3 proposal will ship; reading them is reading the language one to two years ahead.
  <https://github.com/tc39/proposals>
- **HTML Living Standard — §8.1.3 Scripting** — defines how `<script>`, `<script type="module">`, and `defer` / `async` actually behave.
  <https://html.spec.whatwg.org/multipage/scripting.html>
- **Web Storage Living Standard** — the spec for `localStorage` and `sessionStorage`.
  <https://html.spec.whatwg.org/multipage/webstorage.html>

## MDN reference (the friendly index)

- **MDN — JavaScript Guide** — the canonical tutorial. The "Grammar and types," "Control flow and error handling," and "Functions" pages cover this week's material.
  <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide>
- **MDN — JavaScript Reference** — every method, every property, every operator. Searchable.
  <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference>
- **MDN — Equality comparisons and sameness** — the cleanest explanation of `==`, `===`, `Object.is`, and SameValueZero you will read.
  <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Equality_comparisons_and_sameness>
- **MDN — JavaScript modules** — `export`, `import`, `<script type="module">`, dynamic `import()`.
  <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules>
- **MDN — Closures** — start here for the working definition.
  <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Closures>
- **MDN — `Window.localStorage`** — the Web Storage entry point.
  <https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage>

## Types and equality

- **MDN — `typeof`** — and the historical `typeof null === 'object'` bug.
  <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/typeof>
- **2ality — Axel Rauschmayer** — Axel writes the clearest blog on JavaScript anywhere. The archives are essentially free office hours.
  <https://2ality.com/>
- **"What is `{} + []`?" by Gary Bernhardt** — the four-minute "Wat" talk that became famous in 2012. Watch it once; the spec citations in our lectures explain every line.
  <https://www.destroyallsoftware.com/talks/wat>

## Functions and scope

- **MDN — Functions** — the three forms, the call stack, default parameters.
  <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Functions>
- **MDN — Arrow function expressions** — what they do differently with `this`.
  <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/Arrow_functions>
- **MDN — `let`** — block scope and the temporal dead zone.
  <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/let>
- **MDN — `const`** — and the surprising fact that `const` does not freeze the value.
  <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/const>

## Modules

- **MDN — `import`** — the static `import` declaration.
  <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/import>
- **MDN — `export`** — named and default exports.
  <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/export>
- **v8.dev — JavaScript modules** — Google's V8 team explains how modules load.
  <https://v8.dev/features/modules>
- **html.spec.whatwg.org — Module scripts** — the normative definition of `<script type="module">`.
  <https://html.spec.whatwg.org/multipage/webappapis.html#module-script>

## Web Storage

- **MDN — Using the Web Storage API** — a friendly tutorial.
  <https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API/Using_the_Web_Storage_API>
- **MDN — `Storage.setItem`** — and the `QuotaExceededError` you should handle.
  <https://developer.mozilla.org/en-US/docs/Web/API/Storage/setItem>

## Free books and longer reads

- **"Eloquent JavaScript" (4th ed.) by Marijn Haverbeke** — read chapters 1–6 this week if you want a parallel pass. The whole book is free online.
  <https://eloquentjavascript.net/>
- **"JavaScript for impatient programmers" by Axel Rauschmayer** — the chapters on types and equality are the friendliest in print.
  <https://exploringjs.com/impatient-js/toc.html>
- **"Speaking JavaScript" by Axel Rauschmayer** — older but free, and the appendices are still the cleanest reference for ES5 quirks you read in legacy code.
  <https://exploringjs.com/es5/>

## Videos (free)

- **"What the heck is the event loop anyway?" by Philip Roberts (JSConf EU 2014)** — 26 minutes. The canonical visualization of the call stack and the task queue.
  <https://www.youtube.com/watch?v=8aGhZQkoFbQ>
- **"Wat" by Gary Bernhardt (CodeMash 2012)** — 4 minutes. Funny first, deep second.
  <https://www.destroyallsoftware.com/talks/wat>
- **"Function composition in JavaScript" by Anjana Vakil (JSUnconf 2016)** — closures put to work.
  <https://www.youtube.com/watch?v=92Pe681PpWA>

## Practice grounds

- **JavaScript30 by Wes Bos** — thirty short vanilla-JS projects, all free, all in the browser. Pick three to do this week alongside the homework.
  <https://javascript30.com/>
- **Exercism — JavaScript track** — free, mentor-supported, well-graded exercises.
  <https://exercism.org/tracks/javascript>
- **JSBin / CodePen / Playcode** — single-file playgrounds. Useful when you want a console without opening DevTools on a real page.
  <https://jsbin.com/> · <https://codepen.io/> · <https://playcode.io/>

## Tools you will use this week

- **VS Code** — your editor. The **ESLint** extension is useful but optional; we will configure it for real in Week 7. The **JavaScript and TypeScript Nightly** extension gives you the freshest IntelliSense if you want it.
- **Chrome / Firefox DevTools — Console** (`Cmd+Option+J` / `Ctrl+Shift+J`) — your REPL.
- **Chrome / Firefox DevTools — Sources panel** — set a `debugger` statement in your code; the panel pauses there with full scope inspection.
- **Chrome / Firefox DevTools — Application → Local Storage** — watch your keys appear and update as your code writes.
- **Live Server** (VS Code extension) — required for ES modules. The `file://` origin will refuse to load modules; an HTTP origin works fine.

## Glossary

| Term | One-line definition |
|------|---------------------|
| **ECMAScript** | The language spec, maintained by TC39 at ECMA International. "JavaScript" is Mozilla's trademark for an implementation. |
| **Primitive** | A value of type `Undefined`, `Null`, `Boolean`, `String`, `Number`, `BigInt`, or `Symbol`. Immutable; compared by value. |
| **Object** | A collection of properties. The eighth type; everything that is not a primitive. Compared by reference. |
| **Falsy** | A value that the abstract `ToBoolean` operation returns `false` for: `false`, `0`, `-0`, `0n`, `""`, `null`, `undefined`, `NaN`. |
| **Strict equality (`===`)** | Returns `true` only when the operands have the same type and the same value. The default. |
| **Abstract equality (`==`)** | Performs type coercion via `ToPrimitive`, `ToNumber`, `ToString` per §7.2.15. Avoid; prefer `===`. |
| **Hoisting** | The pre-execution phase in which function declarations and `var` bindings are added to their scope's environment record. |
| **Temporal dead zone** | The region of a `let` or `const` binding's scope before its declaration is evaluated; access throws `ReferenceError`. |
| **Lexical scope** | Scope determined by where code is written, not where it is called from. JavaScript is lexically scoped. |
| **Closure** | A function that references variables from a parent scope after that scope's frame has popped. Every function in JS is a closure; we use the word for the cases where it matters. |
| **Module** | A JavaScript file loaded via `<script type="module">` or `import`. Modules have their own scope, are strict mode by default, and are loaded with CORS rules. |
| **`localStorage`** | The synchronous key-value Web Storage API. Strings only. ~5 MB per origin. Survives reloads and tabs; cleared by the user or programmatically. |
