# Challenge 1 — Build a to-do app, no framework

**Time estimate:** ~140 minutes.

## Problem statement

Build a working to-do application in **one HTML file, one CSS file, and one JavaScript module file**. No frameworks. No build tools. No CDN script tags except the same webfonts you used in Week 2. The user can add items, mark items complete, delete items, and clear all completed items. The list persists to `localStorage` so it survives reloads. The page reflows cleanly from 320 px to 1440 px (your Week 3 muscle memory). Every interactive control has a visible focus ring, the list is keyboard-navigable, and axe DevTools is clean.

This is the **scoped-down** version of this week's mini-project. The mini-project asks for filters, a counter, full keyboard editing, accessible-by-screen-reader behavior, and a thorough README. The challenge asks for the core data flow only: add, toggle, delete, persist. The challenge is a way to feel the shape of the app before you spend Saturday polishing it.

```text
┌──────────────────────────────────────────────────┐
│ ●●●    http://localhost:5500/                    │
├──────────────────────────────────────────────────┤
│                                                  │
│   My To-Dos                                      │
│                                                  │
│   ┌──────────────────────────────┐  ┌──────┐    │
│   │ What needs doing?            │  │ Add  │    │
│   └──────────────────────────────┘  └──────┘    │
│                                                  │
│   ☐ Read Lecture 2                                │
│   ☑ Type the eight types into the console        │
│   ☐ Memoize the factorial                         │
│   ☐ Ship the mini-project                         │
│                                                  │
│   3 of 4 remaining                                │
│   [ Clear completed ]                             │
│                                                  │
└──────────────────────────────────────────────────┘
```

## Acceptance criteria

- [ ] Folder is `challenges/challenge-01/` with `index.html`, `styles.css`, `app.js`, and a `NOTES.md`.
- [ ] One `<script type="module" src="./app.js"></script>` tag. No other JS files.
- [ ] **Add**: typing in the input and pressing Enter (or clicking "Add") creates a new item at the bottom of the list.
- [ ] **Toggle**: clicking a checkbox toggles the item's completed state. Completed items have a visible style (line-through, dimmed color, or both).
- [ ] **Delete**: clicking the per-item delete button removes that item.
- [ ] **Clear completed**: clicking "Clear completed" removes every completed item at once.
- [ ] **Persistence**: closing the tab and reopening the page restores every item in its previous state. Use `localStorage` with a namespaced key (e.g., `codecrunch.todos.v1`).
- [ ] **Defensive storage**: `JSON.parse` and `JSON.stringify` are both wrapped in `try`/`catch`. A broken or missing key is handled by falling back to an empty list.
- [ ] **State as the source of truth**: an in-memory `todos` array is the canonical state; the DOM is rendered from it after every change. You do not maintain two parallel sources of truth.
- [ ] **Mobile-first**: the layout works at 320 px wide with no horizontal scroll, then expands to a comfortable max-width on a desktop (`max-width: 40rem; margin-inline: auto;` is fine).
- [ ] **Accessibility**: every interactive control has a visible `:focus-visible` outline; the empty-list state announces itself ("No to-dos yet — add one above" inside a `<p>`); the page passes axe DevTools with zero serious or critical issues.
- [ ] **Validator**: the page passes <https://validator.w3.org/nu/> with zero errors.

## Suggested order of operations

### Phase 1 — Markup (20 min)

Type the HTML by hand. Use the right semantics:

```html
<main>
  <h1>My To-Dos</h1>

  <form id="addForm">
    <label for="newItem">New to-do</label>
    <input id="newItem" name="newItem" type="text" required autocomplete="off">
    <button type="submit">Add</button>
  </form>

  <ul id="todoList" aria-live="polite"></ul>

  <p id="remaining" aria-live="polite"></p>
  <button id="clearCompleted" type="button">Clear completed</button>
</main>
```

The `aria-live="polite"` regions announce updates to screen-reader users without stealing focus. The `<form>` wrapping the input lets Enter submit; you intercept the submit event in JS so the page does not reload.

Run validator.w3.org. Zero errors.

### Phase 2 — The data model (15 min)

In `app.js`, define the shape of an item:

```js
/**
 * @typedef {Object} Todo
 * @property {string} id
 * @property {string} text
 * @property {boolean} completed
 * @property {number} createdAt
 */
```

A unique `id` per item is essential for the delete-this-one and toggle-this-one operations. `crypto.randomUUID()` (per the WebCrypto spec) gives you a UUID v4 string with no dependencies.

```js
let todos = loadTodos();   // array of Todo
```

`loadTodos` and `saveTodos` are the defensive pair from Lecture 2 §7. Write them now; you will call them throughout.

### Phase 3 — Render (20 min)

Write a `render()` function that reads the in-memory `todos` array and rebuilds the `<ul>`:

```js
function render() {
  const list = document.getElementById('todoList');
  list.replaceChildren();   // clear

  if (todos.length === 0) {
    const empty = document.createElement('p');
    empty.textContent = 'No to-dos yet — add one above.';
    list.appendChild(empty);
    return;
  }

  todos.forEach(todo => {
    const li = document.createElement('li');
    // build a checkbox, a label, a delete button; append to li
    list.appendChild(li);
  });

  const remaining = todos.filter(t => !t.completed).length;
  document.getElementById('remaining').textContent =
    `${remaining} of ${todos.length} remaining`;
}
```

`replaceChildren()` (per DOM Living Standard) is the cleanest way to clear a node — one call, no manual `while (list.firstChild)` loop. It works in every browser.

### Phase 4 — Add, toggle, delete (30 min)

Wire the three operations:

```js
function addTodo(text) {
  const trimmed = text.trim();
  if (trimmed === '') return;
  todos.push({
    id: crypto.randomUUID(),
    text: trimmed,
    completed: false,
    createdAt: Date.now()
  });
  saveTodos(todos);
  render();
}

function toggleTodo(id) {
  todos = todos.map(t =>
    t.id === id ? { ...t, completed: !t.completed } : t
  );
  saveTodos(todos);
  render();
}

function deleteTodo(id) {
  todos = todos.filter(t => t.id !== id);
  saveTodos(todos);
  render();
}

function clearCompleted() {
  todos = todos.filter(t => !t.completed);
  saveTodos(todos);
  render();
}
```

Notice the pattern: every mutation produces a **new** `todos` array via `map` or `filter`, then calls `saveTodos` then `render`. The in-memory state, the storage, and the DOM all update in the same function. No drift.

### Phase 5 — Event listeners (20 min)

Wire the form, the clear-completed button, and the per-item checkboxes / delete buttons. The per-item handlers are the only tricky part — because items render and re-render, attaching listeners on each render means re-attaching. The cleanest pattern is **event delegation** on the `<ul>`:

```js
document.getElementById('todoList').addEventListener('click', (event) => {
  const itemEl = event.target.closest('[data-id]');
  if (!itemEl) return;
  const id = itemEl.dataset.id;

  if (event.target.matches('input[type="checkbox"]')) {
    toggleTodo(id);
  } else if (event.target.matches('.delete')) {
    deleteTodo(id);
  }
});
```

Event delegation listens on the parent; the parent persists across renders. We cover delegation in detail in Week 5 — for this challenge, the snippet above will do.

### Phase 6 — Persistence sanity check (15 min)

Open DevTools → Application → Local Storage → your origin. You should see the `codecrunch.todos.v1` key with a JSON-serialized array as its value. Add items; the value updates. Toggle items; the value updates. Refresh the page; the items are restored.

Now break it on purpose. In the Application panel, edit the value to be malformed JSON (`{bad`). Refresh. Your `loadTodos` should `console.warn` and start with an empty list — not throw to the console and leave a blank page. If it throws, your `try`/`catch` is missing or in the wrong place.

### Phase 7 — Accessibility & polish (20 min)

Run axe DevTools. Fix any serious or critical issue. The most common findings:

- The checkbox has no accessible label. Wrap the checkbox in a `<label>` that contains the to-do text.
- The delete button has only an icon (`×`). Add `aria-label="Delete: <todo text>"` or visually hide text via the `.sr-only` pattern.
- The empty-list message is not announced. Move it inside `aria-live="polite"`.

Tab through the page. The order should be: input, Add, first item's checkbox, first item's delete button, second item's checkbox, second item's delete button, ..., Clear completed.

### Phase 8 — `NOTES.md` (10 min)

Write `NOTES.md` (200–300 words) covering:

- **The hardest debugging moment.** What broke; how you found the cause; what the fix was. Be specific.
- **One JavaScript pattern from the lectures you used in earnest.** Closure, defensive storage, immutable update — name it and where in `app.js` it lives.
- **One thing you would change if you had another hour.** A real, concrete change.

## Stretch

- Add a **filter row** ("All / Active / Completed") that toggles which items render. Hold the current filter in a `let` at the top of the module; toggle it from the UI.
- Add **double-click to edit**: double-clicking an item's text turns it into an editable input. Enter saves; Escape cancels. (This is where the mini-project goes; you may want to wait until Saturday.)
- Add a **`storage` event listener** on `window`. Open the page in two tabs of the same origin. Add an item in one; the other updates immediately. The Web Storage spec defines this event for cross-tab synchronization; it is free if you handle it.
- Add a **prefers-reduced-motion** check around any list-shuffle animation you added. Inside `@media (prefers-reduced-motion: no-preference)`, declare the transition; outside, skip it.

## Why this matters

A to-do app is the canonical demo for a reason: it has the four operations of every interactive app — **create, read, update, delete** — in their smallest form. CRUD plus persistence in 80 lines of JavaScript is the foundation of every form, every list, every dashboard you will build for the rest of your career. The fact that the platform supplies `localStorage`, `JSON`, `Map`, event listeners, and `crypto.randomUUID` for free — with no install, no build, no npm — is the lesson C8 wants you to feel directly.

When a future employer asks "show me a small thing you built without a framework," this app is the answer.

## Submission

Commit `challenges/challenge-01/index.html`, `challenges/challenge-01/styles.css`, `challenges/challenge-01/app.js`, and `challenges/challenge-01/NOTES.md` to your Week 4 repo.

Then start the [mini-project](../mini-project/README.md) — which is this app, polished, with filters, full accessibility, and a README a stranger could follow.
