# Week 4 — Exercises

Three short drills. Each takes 45–60 minutes. Do them in order; each one introduces a JavaScript primitive you will reuse in the mini-project.

1. **[Exercise 1 — Types and truthiness](./exercise-01-types-and-truthiness.md)** — console-driven drills on `typeof`, the seven falsy values, and `===` versus `==`. (~50 min)
2. **[Exercise 2 — Functions and closures](./exercise-02-functions-and-closures.md)** — write a counter, a debouncer, and a memoizer. Three closures you will reuse for years. (~60 min)
3. **[Exercise 3 — Modules](./exercise-03-modules.md)** — split a 50-line script into three ES modules, served with Live Server. (~50 min)

## Workflow

- Type your JavaScript by hand. Do not paste from the prompt. The function-and-closure pattern names are short on purpose — typing them embeds them.
- Save your code as `script.js` or as the module names the exercise suggests, next to the `index.html` it loads from. Link it with `<script type="module" src="./main.js"></script>`.
- Right-click your `index.html` in VS Code and choose **"Open with Live Server."** ES modules will not load from `file://`; the HTTP origin is required.
- Open DevTools. Use the **Console panel** as your REPL. Set a `debugger;` statement inside any function; the **Sources panel** pauses there with the live scope chain.
- For the localStorage portions (mini-project), open **DevTools → Application → Local Storage** and watch your keys appear in real time as your code writes.

## Self-grading

After each exercise, ask yourself:

- Did every value I wrote behave the way the lecture predicted, or did I get a surprise? If a surprise, what was the spec section that explained it?
- Can I explain the difference between `==` and `===` to a friend without looking at the notes?
- Can I write a closure on purpose, not by accident — and explain which variables the closure captures?
- Did my modules load? Did the Network panel show all three files served?

If yes to all four, move on. If no, re-read the part of the lecture you skipped.

## What "done" looks like

Each exercise ends with a working HTML + JS pair you can show to someone. Commit them to your Week 4 repo. They will be useful to reference back to in Week 5 (the DOM) and Week 8 (`fetch` and async), when you revisit the same patterns with sharper tools.
