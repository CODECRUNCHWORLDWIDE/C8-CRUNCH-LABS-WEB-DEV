# Week 4 — JavaScript Fundamentals

> *Three weeks of HTML and CSS have given you a site that reads, breathes, and reflows. Nothing on it does anything yet. This week the page learns to think. By Sunday of Week 4 you will read and write modern JavaScript with confidence: you will know the eight types ECMAScript defines, the four falsy values you should memorize, the difference between `var`, `let`, and `const` in terms the spec actually uses, how scope works, what a closure is and where it shows up, and how to split a small program across ES modules — all without a framework, all running directly in the browser.*

Welcome back. Week 1 built the bones. Week 2 dressed them. Week 3 taught them to reflow. The site you have now is beautiful, accessible, and silent. This week the page learns to think.

JavaScript is the third language of the web. Brendan Eich wrote the first version in 10 days in May 1995. Netscape called it LiveScript for a week, then renamed it JavaScript to ride Java's marketing — a piece of trivia that has caused twenty-five years of needless confusion. The language was small, dynamic, and shipped in the browser. The standardization committee, **ECMA TC39**, took it over in 1996 and gave it a real specification — **ECMAScript** — which is what we read today when we want to know what the language actually does. JavaScript is the Mozilla-trademarked implementation name; ECMAScript is the language. Every modern browser, every Node version, every Bun and Deno binary implements ECMAScript.

This week we cover the parts of the spec you use every day: **types**, **control flow**, **functions**, **scope**, **closures**, and **modules**. We do not cover the DOM (that is Week 5), event handling (also Week 5), forms (Week 6), `fetch` (Week 8), or any framework (Week 7 onward). The goal is to make the language itself feel like a tool you understand — not a series of recipes from Stack Overflow.

By Sunday, your Week-3 site has a working to-do list on it, persisted to `localStorage`, written in modules you can read line-by-line, with zero frameworks and zero npm packages.

---

## Learning objectives

By the end of this week, you will be able to:

- **Name** the eight types defined by the ECMAScript Language Specification — `Undefined`, `Null`, `Boolean`, `String`, `Number`, `BigInt`, `Symbol`, `Object` — and know which one `typeof null` returns and why.
- **List** the seven falsy values without looking them up: `false`, `0`, `-0`, `0n`, `""`, `null`, `undefined`, `NaN` — and explain when each one bites.
- **Choose** between `==` and `===` in one sentence, and justify the choice from the spec's abstract equality algorithm.
- **Declare** variables with `let` and `const` and explain why `var` survives only for legacy reasons (the **temporal dead zone**, hoisting, and function-scope versus block-scope).
- **Write** a function in three forms — declaration, expression, arrow — and explain when each is right and what they do differently with `this`.
- **Identify** a closure when you see one and write one on purpose: a counter, a debouncer, a private cache, a module pattern.
- **Split** a small program across ES modules with `export` and `import`, served from a static `<script type="module">` tag — no build tool required.
- **Use** `Array.prototype.map`, `filter`, `reduce`, and `forEach` to transform a list without a `for` loop, and know when a `for` loop is still the right answer.
- **Persist** application state to `localStorage`, with a `JSON.stringify` / `JSON.parse` round-trip and a defensive check for storage being full or unavailable.
- **Defend** a JavaScript decision — `const` over `let`, `===` over `==`, an arrow function over a declaration — by citing the ECMAScript Language Specification (currently ECMA-262, 15th edition, June 2024).

---

## Prerequisites

You finished **Week 3 — Layout & Responsiveness**. Concretely:

- The `crunch-web-portfolio-<yourhandle>` repo on GitHub has a five-page site that reflows from 320 px to 1440 px.
- Every page passes <https://validator.w3.org/nu/> and axe DevTools cleanly.
- You can open DevTools, inspect a node, and trace any CSS property to the rule that set it.

If the Week-3 site is not done, go back. Week 4 adds JavaScript to the Week-3 site; there is nothing to add it to if you skipped Week 3.

You will also need to be comfortable opening the **browser console** (`Cmd+Option+J` on macOS, `Ctrl+Shift+J` on Windows / Linux). The console is the JavaScript REPL you will spend the most time in this week — more than any editor, more than any tutorial. Open it now. Type `1 + 1`. Press Enter. That is where this week happens.

## Topics covered

- The ECMAScript Language Specification — what it is, who maintains it, and why we cite it
- The eight types — `Undefined`, `Null`, `Boolean`, `String`, `Number`, `BigInt`, `Symbol`, `Object`
- Primitives versus objects — copy-by-value versus copy-by-reference
- `typeof` and its lies — `typeof null === 'object'` is a historical bug, not a feature
- The seven falsy values, the truthiness rule, and the abstract `ToBoolean` algorithm
- `==` (abstract equality) versus `===` (strict equality) versus `Object.is` — and which to reach for when
- `var`, `let`, `const` — function scope, block scope, the temporal dead zone, why `const` is your default
- Control flow — `if`, `else`, `else if`, `switch`, ternary, short-circuit evaluation
- Loops — `for`, `for...of`, `for...in`, `while`, and when each is the right answer
- Functions — declaration, expression, arrow — and how `this`, `arguments`, and `new` differ between them
- The call stack, the global execution context, and what "hoisting" actually means
- Scope chains, lexical scoping, and the closure pattern
- Higher-order functions — `map`, `filter`, `reduce`, `forEach`, `some`, `every`, `find`
- ES modules — `export`, `import`, `<script type="module">`, default versus named exports
- `localStorage` and `sessionStorage` — the synchronous key-value Web Storage API
- JSON — `JSON.stringify`, `JSON.parse`, what is and is not JSON-safe
- Strict mode — the legacy switch that you get for free in modules
- Debugging — `console.log` versus `debugger`, the Sources panel, breakpoints, watch expressions

## Tools you will need

| Tool                                | Role                                                | Cost |
| ----------------------------------- | --------------------------------------------------- | ---- |
| **VS Code**                         | Editor                                              | Free |
| **Live Server** (VS Code extension) | Required: ES modules need an HTTP origin, not `file://` | Free |
| **A current Chrome or Firefox**     | The JavaScript engine and the console               | Free |
| **DevTools — Console**              | Your REPL all week                                  | Free |
| **DevTools — Sources panel**        | Breakpoints, the call stack, scope inspection       | Free |
| **DevTools — Application panel**    | Watch `localStorage` change in real time            | Free |
| **axe DevTools** (browser extension)| Accessibility audits remain a weekly habit          | Free |

No Node, no npm, no bundler. ES modules ship in every browser; `localStorage` ships in every browser; the console is a REPL that has been there the entire time.

---

## Weekly schedule

The schedule below adds up to approximately **36 hours**. Treat it as a target. Closures take longer to internalize than the lectures suggest; budget the extra hours toward Wednesday and Thursday.

| Day       | Focus                                          | Lectures | Exercises | Challenges | Quiz/Read | Homework | Mini-Project | Self-Study | Daily Total |
|-----------|------------------------------------------------|---------:|----------:|-----------:|----------:|---------:|-------------:|-----------:|------------:|
| Monday    | Types, truthiness, equality                    |    3h    |    2h     |     0h     |    0.5h   |   1h     |     0h       |    0.5h    |     7h      |
| Tuesday   | Control flow, functions, the three forms       |    3h    |    2h     |     1h     |    0.5h   |   1h     |     0h       |    0h      |     7.5h    |
| Wednesday | Scope, closures, the lexical-environment model |    0h    |    2h     |     1h     |    0.5h   |   1h     |     1h       |    0.5h    |     6h      |
| Thursday  | Modules and `localStorage`                     |    0h    |    1h     |     1h     |    0.5h   |   1h     |     2h       |    0.5h    |     6h      |
| Friday    | Mini-project — build the to-do app             |    0h    |    1h     |     1h     |    0.5h   |   1h     |     2h       |    0.5h    |     6h      |
| Saturday  | Mini-project deep work                         |    0h    |    0h     |     0h     |    0h     |   1h     |     2h       |    0h      |     3h      |
| Sunday    | Quiz, polish, accessibility audit              |    0h    |    0h     |     0h     |    0.5h   |   0h     |     0h       |    0h      |     0.5h    |
| **Total** |                                                | **6h**   | **8h**    | **4h**     | **3h**    | **6h**   | **7h**       | **2h**     | **36h**     |

---

## How to navigate this week

| File | What is inside |
|------|----------------|
| [README.md](./README.md) | This overview |
| [resources.md](./resources.md) | The spec, MDN, "You Don't Know JS," the books we cite, the consoles |
| [lecture-notes/01-types-control-flow-functions.md](./lecture-notes/01-types-control-flow-functions.md) | The eight types, the seven falsy values, the three forms of a function, and how the call stack walks them |
| [lecture-notes/02-scope-closures-and-modules.md](./lecture-notes/02-scope-closures-and-modules.md) | Scope chains, the temporal dead zone, closures as a tool, ES modules end-to-end |
| [exercises/README.md](./exercises/README.md) | Index of exercises |
| [exercises/exercise-01-types-and-truthiness.md](./exercises/exercise-01-types-and-truthiness.md) | Console-driven drills on `typeof`, falsy values, and `===` versus `==` |
| [exercises/exercise-02-functions-and-closures.md](./exercises/exercise-02-functions-and-closures.md) | Write a counter, a debouncer, and a memoizer — three closures you will reuse for years |
| [exercises/exercise-03-modules.md](./exercises/exercise-03-modules.md) | Split a 50-line script into three ES modules with `export` and `import` |
| [challenges/README.md](./challenges/README.md) | Index of weekly challenges |
| [challenges/challenge-01-build-a-todo-app-no-framework.md](./challenges/challenge-01-build-a-todo-app-no-framework.md) | Build a full to-do app in one HTML file, one JS file, and the platform |
| [quiz.md](./quiz.md) | 10 multiple-choice questions |
| [homework.md](./homework.md) | Six practice problems for the week |
| [mini-project/README.md](./mini-project/README.md) | A vanilla-JS to-do list with `localStorage` persistence — no frameworks |

The recommended order:

1. Read both lectures (Monday–Tuesday).
2. Do the three exercises (Tuesday–Wednesday).
3. Take the quiz (Wednesday evening). If you score under 7, re-read.
4. Pick the challenge (Thursday).
5. Work through the homework problems alongside the mini-project (Thursday–Saturday).
6. Ship the mini-project (Saturday–Sunday).

---

## Stretch goals

If you finish early and want to push further, try any of these:

- Read **Chapter 6 — Types & Grammar** of *You Don't Know JS Yet* by Kyle Simpson, end-to-end. It is the best free explanation of the equality algorithm you will find.
  <https://github.com/getify/You-Dont-Know-JS>
- Read **Section 7 — Abstract Operations** of the ECMAScript Language Specification — at least `ToBoolean`, `ToNumber`, `ToString`, `ToPrimitive`. The spec reads like a legal document; the surprise is how much of your daily debugging it explains.
  <https://tc39.es/ecma262/#sec-abstract-operations>
- Open the console on a site you visit daily. Type `document.cookie`. Type `localStorage`. Type `window.performance.timing`. Spend ten minutes poking. The browser is not a black box.
- Read the ECMAScript proposal pipeline at <https://github.com/tc39/proposals>. Pick one Stage-3 proposal that you find interesting and read its README. Stage 3 means it will ship; you are seeing the language a year before the textbooks do.
- Watch **"What the heck is the event loop anyway?"** by Philip Roberts (JSConf EU 2014). You will not write async code until Week 8, but the model is worth seeing now.
  <https://www.youtube.com/watch?v=8aGhZQkoFbQ>

---

## What this week is NOT

A few things to set expectations:

- **Not a framework week.** No React, no Vue, no Svelte, no Lit, no Solid. We teach the language. Frameworks come in Week 7 when there is a reason to reach for one.
- **Not a TypeScript week.** TypeScript is a typed superset of JavaScript that compiles to JavaScript. You can not type a language you do not yet read. We cover TypeScript in C8's stretch material, not in the core 12-week curriculum.
- **Not a "every JS feature" week.** ECMAScript has 600 pages of spec. We cover the half-dozen sections you will use weekly; the rest are extensions of the same model.
- **Not a Node week.** Everything this week runs in the browser. Node will appear in Week 7 when we add a build tool that earns its keep.
- **Not an async week.** Promises, `async`/`await`, the event loop, `fetch` — all of that is Week 8. We have enough surface to cover with the synchronous half of the language.
- **Not a "stop using `var`" lecture series.** We will explain why `let` and `const` exist and how `var` differs; we will not moralize. Code you read in the wild still uses `var`; you should be able to read it.

---

## A word on the editorial voice

You will notice this week's lecture notes lean on the ECMAScript specification. That is on purpose. JavaScript is a language with a long memory and a slightly awkward family history; every "weird" behavior has a spec section that explains it. When the answer to "why does `[] == ![]` return `true`" is "because the abstract `ToPrimitive` algorithm in §7.1.1 returns the empty string, which `ToNumber` converts to zero, which equals `Number(![])` which is also zero" — that is the answer. We will not pretend the language is simpler than it is. We will give you the tools to read its actual definition.

You will also notice we cite **ECMA-262** rather than MDN for normative facts. MDN is excellent and we link to it everywhere; the spec is the source of truth when MDN and the browsers disagree (which is rare, but happens). Learning to read the spec is a frontend superpower. It will not take you long; the table of contents is your friend.

---

## Up next

Continue to [Week 5 — The DOM & Events](../week-05/) once you have shipped the to-do app, every assertion in the homework passes, and you have read both lectures end-to-end at least twice.

---

*If you find errors in this material, please open an issue or send a PR. Future learners will thank you.*
