# Exercise 1 — Query and Mutate

**Time:** ~50 minutes.

## Problem statement

Build a small "DOM Probe" page that walks you through the methods you read about in Lecture 1: querying, mutating, the four interfaces (attribute, property, class, inline style), and the `<template>` + clone pattern. The page renders a short list of items from a hard-coded array; a console-only "self-test" verifies that ten DOM operations did what they were supposed to do.

There are no events in this exercise. Lecture 2 introduces events; Exercise 2 puts them to work. Today is about reading and writing the tree.

```text
┌──────────────────────────────────────────────────┐
│ ●●●    http://localhost:5500/                    │
├──────────────────────────────────────────────────┤
│                                                  │
│   DOM Probe                                      │
│                                                  │
│   Open the console. Ten checks should pass.      │
│                                                  │
│   Movies                                         │
│   ──────────────────────────────────             │
│   ☐ Stalker — Andrei Tarkovsky (1979)            │
│   ☐ La Jetée — Chris Marker (1962)               │
│   ☑ Solaris — Andrei Tarkovsky (1972)            │
│                                                  │
│   3 items rendered                                │
│                                                  │
└──────────────────────────────────────────────────┘
```

## Source content

Create `exercises/exercise-01/index.html`, `exercises/exercise-01/styles.css`, and `exercises/exercise-01/script.js`. The HTML is a static skeleton with a `<template>` for a movie row.

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <title>DOM Probe — Week 5 Exercise 1</title>
    <link rel="stylesheet" href="./styles.css">
  </head>
  <body>
    <main>
      <h1>DOM Probe</h1>
      <p>Open the console (<kbd>Cmd</kbd>+<kbd>Opt</kbd>+<kbd>J</kbd> or <kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>J</kbd>). Ten checks should pass.</p>

      <section aria-labelledby="movies-heading">
        <h2 id="movies-heading">Movies</h2>
        <ul id="movie-list" data-empty="No movies yet"></ul>
        <p id="movie-count" aria-live="polite"></p>
      </section>

      <template id="movie-row">
        <li class="movie-row">
          <input type="checkbox" class="movie-watched">
          <span class="movie-title"></span>
          <span class="movie-meta"></span>
        </li>
      </template>
    </main>
    <script src="./script.js" defer></script>
  </body>
</html>
```

The hard-coded data, at the top of `script.js`:

```js
const movies = [
  { id: 'm1', title: 'Stalker',  director: 'Andrei Tarkovsky', year: 1979, watched: false },
  { id: 'm2', title: 'La Jetée', director: 'Chris Marker',     year: 1962, watched: false },
  { id: 'm3', title: 'Solaris',  director: 'Andrei Tarkovsky', year: 1972, watched: true  },
];
```

Then a small `assert` helper, the same shape as Week 4's:

```js
function assert(label, actual, expected) {
  const ok = Object.is(actual, expected);
  console.log(`${ok ? '✓' : '✗'} ${label}`);
  if (!ok) console.log('  expected:', expected, 'actual:', actual);
}
```

Your job is to implement `renderMovies(movies)` plus the ten assertions listed in the acceptance criteria below.

## Acceptance criteria

- [ ] `exercises/exercise-01/index.html`, `exercises/exercise-01/styles.css`, and `exercises/exercise-01/script.js` exist; the script is loaded with `defer`.
- [ ] The page passes <https://validator.w3.org/nu/> with zero errors.
- [ ] The page renders cleanly at 320 px viewport (your Week 3 muscle memory). No horizontal scroll.
- [ ] `renderMovies(movies)` uses **`template.content.cloneNode(true)`** and the modern `append` interface — no `innerHTML`, no string concatenation.
- [ ] The list is built off-document inside a `DocumentFragment`, then attached to `#movie-list` with **one** `replaceChildren` call.
- [ ] Each rendered `<li>` carries a `data-id` matching the movie's id.
- [ ] Each rendered checkbox's `checked` *property* (not attribute) reflects `movie.watched`.
- [ ] Watched movies get a `is-watched` class on their `<li>`; the CSS gives them a line-through and a dimmed color (with contrast ratio ≥ 4.5:1 against your background — WCAG 2.2 SC 1.4.3).
- [ ] The `#movie-count` paragraph updates to `"3 items rendered"` (or however many movies are passed in). It is inside a polite live region (`aria-live="polite"`).
- [ ] The ten console assertions, all logged with `✓`:
  1. `querySelector('#movie-list').children.length === 3`
  2. `querySelectorAll('.movie-row').length === 3`
  3. `querySelector('[data-id="m3"]').classList.contains('is-watched') === true`
  4. `querySelector('[data-id="m1"]').classList.contains('is-watched') === false`
  5. `querySelector('[data-id="m1"] input').checked === false`
  6. `querySelector('[data-id="m3"] input').checked === true`
  7. `querySelector('#movie-list').firstElementChild.dataset.id === 'm1'`
  8. `querySelector('#movie-list').lastElementChild.dataset.id === 'm3'`
  9. `querySelector('#movie-count').textContent === '3 items rendered'`
  10. After calling `renderMovies([])`, `querySelector('#movie-list').children.length === 0`
- [ ] No `var` declarations anywhere. `const` by default; `let` where you must reassign.
- [ ] The script logs a final line: `10 of 10 checks passed.`

## Hints

<details>
<summary>How do I clone the <code>&lt;template&gt;</code> content?</summary>

`template.content` is a `DocumentFragment` — the parsed children of your template, sitting off-document. You clone it with `cloneNode(true)` (deep clone) to get a fresh subtree each iteration.

```js
const template = document.getElementById('movie-row');
const fragment = template.content.cloneNode(true);
const li = fragment.querySelector('.movie-row');
fragment.querySelector('.movie-title').textContent = movie.title;
fragment.querySelector('.movie-meta').textContent = `— ${movie.director} (${movie.year})`;
fragment.querySelector('input').checked = movie.watched;
li.dataset.id = movie.id;
li.classList.toggle('is-watched', movie.watched);
```

The fragment is what you append to the parent `<ul>` or to an outer `DocumentFragment`. When you append it, its children move out and the fragment empties — no double-attachment.

</details>

<details>
<summary>Why am I told to set <code>checkbox.checked</code> rather than <code>setAttribute('checked', 'true')</code>?</summary>

Per the HTML Living Standard, the `checked` *attribute* sets the **initial** state of the checkbox (the value rendered in the HTML serialization). The `checked` *property* sets the **current** state (what the user sees and what the form submits). They drift apart whenever the user clicks the checkbox.

For programmatic rendering from your data model, the property is what matters. Setting `checkbox.checked = true` immediately reflects in the UI and survives subsequent user interaction. Setting the attribute alone may not visually update.

The same is true of `value` on `<input>`, `selected` on `<option>`, and `disabled` on most form controls: prefer the property.

Citation: HTML Living Standard, §4.10.5 (the `input` element) and §4.10.18 (Form control infrastructure).

</details>

<details>
<summary>Why use <code>replaceChildren</code> instead of clearing then appending?</summary>

`replaceChildren(...nodes)` is one DOM operation. The legacy alternative — `innerHTML = ''` followed by repeated `appendChild` calls — is several operations, plus an HTML parser invocation for the empty string. `replaceChildren()` with no arguments is also the cleanest way to empty an element.

Citation: DOM Living Standard, §4.2.6.

```js
list.replaceChildren(fragment);   // one operation, append the fragment's children
list.replaceChildren();           // one operation, empty the list
```

</details>

<details>
<summary>How do I get the assertion <code>querySelector('#movie-count').textContent === '3 items rendered'</code> to read its way through whitespace?</summary>

Set `textContent` to exactly the string the assertion expects:

```js
document.getElementById('movie-count').textContent = `${movies.length} items rendered`;
```

`textContent` reads the *concatenated text of all descendants of the element* (per DOM §4.4). If the element is `<p id="movie-count">3 items rendered</p>`, `textContent` is exactly the string between the tags. No HTML, no whitespace from indentation.

The polite live region (`aria-live="polite"`) means a screen reader announces the change without interrupting whatever the user is currently hearing. Per WAI-ARIA 1.2, §6.5.

</details>

<details>
<summary>What is the cleanest way to toggle a class based on a boolean?</summary>

`classList.toggle(name, force)` with the explicit second argument:

```js
li.classList.toggle('is-watched', movie.watched);
```

When `force` is `true`, the class is added if not present. When `false`, the class is removed if present. This is what you want whenever you are syncing a class to a boolean piece of state — far more reliable than `if (movie.watched) li.classList.add(...) else li.classList.remove(...)`.

</details>

## What "done" looks like

The page loads. Three movies render in a clean list. The third is line-through-styled and its checkbox is pre-checked. The console shows ten `✓` lines and a `10 of 10 checks passed.` summary. The validator is happy. axe DevTools is happy. The page reflows from 320 px to 1440 px without horizontal scroll.

If your assertions are all green and the page is clean, commit this folder to your Week 5 repo and move on to **Exercise 2 — Event Delegation**.

## Stretch

If you finish early:

- Add a **filter** select element (`<select id="filter">` with options "All / Watched / Unwatched") and re-render the list when the selection changes. You will need events; you have not done events yet. The exercise becomes a useful checkpoint between Lecture 1 and Lecture 2.
- Add a **counter** that announces "N of M watched" instead of just total. Update it inside `renderMovies` and verify it lands in the live region.
- Add a **sort** button that re-renders the movies by year. You will need to mutate the input array (or, better, render from a sorted *copy* and leave the source array alone).

Save any stretches in `exercises/exercise-01-stretch/` so the core exercise files stay clean.
