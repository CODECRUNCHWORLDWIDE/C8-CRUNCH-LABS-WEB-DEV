# Exercise 1 — Types and truthiness

**Time:** ~50 minutes.

## Problem statement

Build a small "Type Probe" page that walks the user through the eight ECMAScript types and the seven falsy values, with a console-driven self-quiz. The page renders a list of values; for each value, you log a one-line description that includes its `typeof`, its truthiness, its `JSON.stringify` representation, and its strict-equality result against a comparison value. Then you write twelve assertions and watch them pass in the console.

```text
┌──────────────────────────────────────────────────┐
│ ●●●    http://localhost:5500/                    │
├──────────────────────────────────────────────────┤
│                                                  │
│   Type Probe                                     │
│                                                  │
│   Open the console. Twelve checks should pass.   │
│                                                  │
│   ✓ typeof undefined is "undefined"              │
│   ✓ typeof null is "object" (historical)         │
│   ✓ Boolean("") is false                         │
│   ✓ Boolean("0") is true                         │
│   ✓ Boolean([]) is true                          │
│   ✓ 0 === -0 is true                             │
│   ✓ Object.is(0, -0) is false                    │
│   ✓ NaN === NaN is false                         │
│   ✓ Number.isNaN(NaN) is true                    │
│   ✓ null == undefined is true                    │
│   ✓ null === undefined is false                  │
│   ✓ [] == false is true                          │
│                                                  │
└──────────────────────────────────────────────────┘
```

## Source content

Create `exercises/exercise-01/index.html` and `exercises/exercise-01/script.js`. The HTML is a static page with a heading, a one-line instruction, and a `<script src="./script.js"></script>` tag.

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <title>Type Probe — Week 4 Exercise 1</title>
    <link rel="stylesheet" href="./styles.css">
  </head>
  <body>
    <main>
      <h1>Type Probe</h1>
      <p>Open the console (<kbd>Cmd</kbd>+<kbd>Opt</kbd>+<kbd>J</kbd> or <kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>J</kbd>). Twelve checks should pass.</p>
    </main>
    <script src="./script.js"></script>
  </body>
</html>
```

In `script.js`, declare a small `assert` helper that logs a checkmark when the assertion is true and a cross when false:

```js
function assert(label, actual, expected) {
  const ok = Object.is(actual, expected);
  console.log(`${ok ? '✓' : '✗'} ${label}`);
  if (!ok) console.log('  expected:', expected, 'actual:', actual);
}
```

Then write the twelve assertions listed in the diagram above. Some you can pull straight from Lecture 1; others require you to look up `Object.is` and `Number.isNaN`. Each assertion is one line.

## Acceptance criteria

- [ ] `exercises/exercise-01/index.html`, `exercises/exercise-01/styles.css`, and `exercises/exercise-01/script.js` exist; the script is linked from `<body>`.
- [ ] The page renders cleanly at 320 px viewport with no horizontal scroll. (Week 3 muscle memory; do not lose it.)
- [ ] The page passes <https://validator.w3.org/nu/> with zero errors.
- [ ] Opening the page logs **twelve** lines to the console, all starting with `✓`.
- [ ] No assertion uses `==`; use `===` and `Object.is` only. (`null == undefined` is the **value** being asserted, not the assertion mechanism.)
- [ ] Your `assert` helper uses `Object.is`, not `===` — so it can compare `NaN` to `NaN` correctly.
- [ ] The script logs a final summary: `12 of 12 checks passed.`
- [ ] No `var` declarations anywhere. `const` by default; `let` where you must reassign.

## Hints

<details>
<summary>How do I assert that <code>NaN === NaN</code> is false using a helper that compares actual to expected?</summary>

Your assertion is "the value of `NaN === NaN` equals `false`":

```js
assert('NaN === NaN is false', NaN === NaN, false);
```

The `actual` argument is `NaN === NaN`, which evaluates to `false`. The `expected` is `false`. `Object.is(false, false)` is `true`, so the assertion logs `✓`.

The reason your helper uses `Object.is` and not `===` is for the cases where you want to **compare two `NaN` values directly** — for instance, `assert('Number.NaN is NaN', Number.NaN, NaN)`. With `===`, the comparison would always fail. `Object.is(NaN, NaN)` is `true`.

</details>

<details>
<summary>What does <code>Object.is</code> do that <code>===</code> does not?</summary>

Per ECMA-262 §7.2.10 (the `SameValue` algorithm), `Object.is` differs from `===` in exactly two cases:

- `Object.is(NaN, NaN)` is `true`. `NaN === NaN` is `false`.
- `Object.is(+0, -0)` is `false`. `+0 === -0` is `true`.

For every other pair of values, the two operators return the same result. `Object.is` is the right tool when you want a "are these the same value at the bit level" check; `===` is the right tool for everyday equality.

</details>

<details>
<summary>How do I distinguish <code>null</code> from a real object using <code>typeof</code>?</summary>

You cannot. `typeof null === 'object'` is the historical bug from Lecture 1. The pattern is to check for `null` first, then for object-ness:

```js
function isPlainObject(value) {
  return value !== null && typeof value === 'object';
}
```

Or, if you want to exclude arrays:

```js
function isPlainObject(value) {
  return value !== null
    && typeof value === 'object'
    && !Array.isArray(value);
}
```

</details>

<details>
<summary>How can I see <code>typeof</code> in action for every value at once?</summary>

A small loop is a good console drill:

```js
const samples = [
  undefined,
  null,
  true,
  'hello',
  42,
  42n,
  Symbol('s'),
  {},
  [],
  function () {},
];

samples.forEach(v => console.log(typeof v, '\t', v));
```

This prints all eight typeofs (plus the `'function'` quirk for callable objects). Run it in the console; it is two lines and worth the muscle memory.

</details>

## Stretch

- Add a thirteenth assertion that surprises you. Try `assert('[1,2,3] === [1,2,3]', [1,2,3] === [1,2,3], false)`. Two array literals are two distinct references; they are not equal under `===`. Now write an `arraysEqual(a, b)` helper that does what you mean.
- Add a fourteenth assertion using the `??` nullish-coalescing operator: `assert('0 ?? 5 is 0', 0 ?? 5, 0)`. Contrast with `0 || 5` (which is `5`).
- Build a `typeOfDeep(value)` function that returns `'null'` for `null`, `'array'` for arrays, `'function'` for functions, and the result of `typeof` otherwise. Add tests for each branch.
- Add a `prefers-reduced-motion` check around any CSS transition you added to the assertion list (a fade-in for new console lines, say). The CSS goes in `styles.css`; the JS does not need to know.

## Self-check

Open DevTools. Run the page. The console shows twelve check marks and the summary line. Now open the **Sources panel**, set a breakpoint inside your `assert` function on the line that compares `actual` to `expected`, and reload. Step through. Watch each assertion pause; inspect the local variables in the scope pane on the right.

If you have never used the Sources panel before, this is the right moment. Every future bug you hit this year will be debugged from here.

## Submission

Commit `exercises/exercise-01/index.html`, `exercises/exercise-01/styles.css`, and `exercises/exercise-01/script.js` to your Week 4 repo. In your commit message, note one assertion whose result surprised you the first time you wrote it. The list of surprises is a useful artifact; revisit it in Week 12.
