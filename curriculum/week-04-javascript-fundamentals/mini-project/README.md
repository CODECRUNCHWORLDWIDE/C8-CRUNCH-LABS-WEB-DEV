# Mini-Project — A vanilla-JS to-do list with `localStorage` persistence

> Build a working to-do application using only HTML, CSS, and ES modules — no framework, no build tool, no npm. The user can add, edit, toggle, and delete items, filter by status, persist across reloads, sync across tabs, and use the app entirely from the keyboard. The code lives in three small modules, totals under 200 lines, and reads like a paragraph. The page is mobile-first, axe-clean, and validator-clean.

This is the synthesis of Week 4. You have written closures, modules, and `localStorage` helpers in the exercises and the challenge; the mini-project asks you to assemble them into a small product. By the end of Week 4, your to-do list is good enough to use daily — and small enough that every line earns its keep.

**Estimated time:** 7 hours, spread across Thursday–Saturday.

---

## What you will build

A single-page to-do application served from `mini-project/` in your Week 4 repo. The page uses the same typography tokens, the same color tokens, the same dark-mode rule, and the same focus-ring rule you wrote in Week 2. It is mobile-first (your Week 3 muscle memory). The JavaScript lives in three ES modules, one entry point, served with Live Server. No frameworks, no Tailwind, no bundler.

```text
┌──────────────────────────────────────────────────┐
│ ●●●    http://localhost:5500/mini-project/       │
├──────────────────────────────────────────────────┤
│                                                  │
│   ┌────────────────────────────────────────────┐ │
│   │ Code Crunch — To-do                        │ │
│   │ ──────────────────────────────────────     │ │
│   │ What needs doing?                          │ │
│   │ ┌──────────────────────────────┐ ┌────────┐│ │
│   │ │                              │ │  Add   ││ │
│   │ └──────────────────────────────┘ └────────┘│ │
│   │                                            │ │
│   │ All · Active · Completed                   │ │
│   │                                            │ │
│   │ ☐ Read Lecture 2                            │ │
│   │ ☐ Type the eight types into the console    │ │
│   │ ☑ Memoize the factorial                    │ │
│   │ ☐ Ship the mini-project                    │ │
│   │                                            │ │
│   │ 3 of 4 remaining       [ Clear completed ] │ │
│   └────────────────────────────────────────────┘ │
│                                                  │
└──────────────────────────────────────────────────┘
```

---

## Acceptance criteria

- [ ] The folder `mini-project/` exists at the top level of your Week 4 repo, with this final tree (or close):
  ```
  mini-project/
  ├── README.md
  ├── index.html
  ├── styles.css
  ├── main.js
  └── lib/
      ├── todos.js       ← the data model (pure JS, no DOM)
      ├── storage.js     ← localStorage read/write with try/catch
      └── render.js      ← DOM rendering, all in one file
  ```
- [ ] One `<script type="module" src="./main.js"></script>` tag in `index.html`. No other JS files referenced.
- [ ] All HTML and CSS conform to your Week 2 / Week 3 work — typography tokens, color tokens, dark mode via `prefers-color-scheme`, focus-visible rule, mobile-first layout. The to-do page should look like it belongs to your portfolio.
- [ ] **Add:** typing in the input and pressing Enter (or clicking "Add") creates an item at the bottom of the list.
- [ ] **Edit:** double-clicking an item's text (or pressing Enter while the item is focused) turns the text into an editable input. Enter saves; Escape cancels and restores the prior text.
- [ ] **Toggle:** clicking the checkbox toggles `completed`. Completed items have a visible style (line-through and a dimmed color, both with sufficient contrast).
- [ ] **Delete:** clicking the per-item delete button removes that item, with a confirm step (`confirm("Delete '<text>'?")`) for items that have been completed for more than a minute (to prevent accidental loss).
- [ ] **Filter:** three buttons — All, Active, Completed — change which items render. The active filter is visually distinguished and is announced as the current filter via `aria-current="true"`.
- [ ] **Clear completed:** removes every completed item, with a confirm step.
- [ ] **Counter:** the page shows "N of M remaining" where N is the count of non-completed items and M is the total. Both update on every mutation.
- [ ] **Persistence:** state is stored in `localStorage` under the key `codecrunch.todos.v1`. The page restores state on reload.
- [ ] **Cross-tab sync:** opening the page in two tabs of the same origin keeps both in sync — changes in one tab appear in the other within a few hundred milliseconds, via the `storage` event.
- [ ] **Defensive storage:** all `JSON.parse` and `localStorage.setItem` calls are wrapped in `try`/`catch`. A `console.warn` records any failure; the app falls back to an empty list (parse failure) or skips the write (write failure).
- [ ] **Keyboard-complete:** every operation is reachable by keyboard. Tab order matches DOM order. `Enter` adds an item from the input; `Space` toggles a focused checkbox; `Delete` or `Backspace` on a focused item deletes it (with the same confirm step). The skip-link from Week 3 still works.
- [ ] **Accessibility:** axe DevTools reports zero serious or critical issues. The list uses `<ul>` and `<li>`; the counter is in a live region (`aria-live="polite"`); the filter buttons announce their current state.
- [ ] **Validator:** the page passes <https://validator.w3.org/nu/> with zero errors.
- [ ] **No globals:** every binding in your scripts is either declared inside a module or attached to a single module-scope variable. No `window.todos`, no implicit globals.
- [ ] **No frameworks, no bundler, no npm.** One HTML, one CSS, four JS files served by Live Server.
- [ ] **README**: `mini-project/README.md` walks a reader through what the app does, how to run it (Live Server), and one decision you would defend in a review.

---

## Suggested order of operations

### Phase 1 — Plan the data model (30 min)

Before any code, in `mini-project/README.md` write the **schema** of a to-do item:

```js
/**
 * @typedef {Object} Todo
 * @property {string} id            UUID v4
 * @property {string} text          1..200 characters, trimmed
 * @property {boolean} completed
 * @property {number} createdAt     Date.now() at creation
 * @property {number} completedAt   Date.now() when toggled to completed; 0 otherwise
 */
```

Decide the **filter** model too: a single `currentFilter` variable in `'all' | 'active' | 'completed'`. The filter is application state, but it does **not** persist to `localStorage` — every page load starts on "All." (You can change this; document the choice in the README.)

This phase is intentionally non-code. Once the schema is settled, the modules write themselves.

### Phase 2 — `lib/storage.js` (45 min)

The smallest, most testable module. Two functions:

```js
const STORAGE_KEY = 'codecrunch.todos.v1';

export function loadTodos() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === null) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter(isValidTodo) : [];
  } catch (err) {
    console.warn('[storage] load failed; resetting to empty list.', err);
    return [];
  }
}

export function saveTodos(todos) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
  } catch (err) {
    console.warn('[storage] save failed; storage may be full or unavailable.', err);
  }
}

function isValidTodo(t) {
  return t
    && typeof t === 'object'
    && typeof t.id === 'string'
    && typeof t.text === 'string'
    && typeof t.completed === 'boolean'
    && typeof t.createdAt === 'number';
}
```

Three habits to notice:

1. **A namespaced, versioned key.** When the shape changes in a year, you bump to `v2` and write a migration.
2. **A shape check, not just a JSON parse.** The contents of `localStorage` may have been edited by a user, a different version of your app, or an extension. Drop invalid items silently.
3. **Log and recover.** Never let a storage error leave the app blank.

Test this module from the console before wiring it up:

```js
import { loadTodos, saveTodos } from './lib/storage.js';
saveTodos([{ id: 'a', text: 'x', completed: false, createdAt: Date.now() }]);
loadTodos();   // returns the saved list
```

### Phase 3 — `lib/todos.js` (1 h)

The pure data model. No DOM. All operations are **immutable**: they return a **new** array, they do not mutate the input.

```js
/**
 * Create a new todo. Trims text; rejects empty.
 * Returns null when the trimmed text is empty.
 */
export function createTodo(text) {
  const trimmed = text.trim();
  if (trimmed.length === 0) return null;
  return {
    id: crypto.randomUUID(),
    text: trimmed.slice(0, 200),
    completed: false,
    createdAt: Date.now(),
    completedAt: 0
  };
}

export function addTodo(todos, text) {
  const todo = createTodo(text);
  return todo === null ? todos : [...todos, todo];
}

export function toggleTodo(todos, id) {
  return todos.map(t =>
    t.id === id
      ? { ...t, completed: !t.completed, completedAt: t.completed ? 0 : Date.now() }
      : t
  );
}

export function updateText(todos, id, newText) {
  const trimmed = newText.trim();
  if (trimmed.length === 0) return todos;
  return todos.map(t => t.id === id ? { ...t, text: trimmed.slice(0, 200) } : t);
}

export function deleteTodo(todos, id) {
  return todos.filter(t => t.id !== id);
}

export function clearCompleted(todos) {
  return todos.filter(t => !t.completed);
}

export function filterTodos(todos, filter) {
  if (filter === 'active') return todos.filter(t => !t.completed);
  if (filter === 'completed') return todos.filter(t => t.completed);
  return todos;
}

export function countRemaining(todos) {
  return todos.filter(t => !t.completed).length;
}
```

Notice: every function takes `todos` as the first argument and returns a new array. This is the **immutable update pattern**. It makes the state easy to reason about, it makes undo possible (the previous state is still in scope), and it pairs with how React, Redux, and most modern state libraries work. You will see the pattern again in Week 7.

You can verify this module in the console without rendering anything:

```js
import * as todos from './lib/todos.js';
let list = [];
list = todos.addTodo(list, 'Read Lecture 2');
list = todos.addTodo(list, 'Type into the console');
list = todos.toggleTodo(list, list[0].id);
todos.countRemaining(list);   // 1
todos.filterTodos(list, 'completed');   // [{ id: ..., completed: true, ... }]
```

### Phase 4 — `lib/render.js` (1.5 h)

The rendering module. One exported function — `render(state, handlers)` — that reads the state and produces the DOM. The `handlers` object is a small set of callbacks the render module fires when the user does something (the entry point in `main.js` provides them; render does not know about state mutation).

```js
export function render(state, handlers) {
  const list = document.getElementById('todoList');
  list.replaceChildren();

  const visible = filterTodos(state.todos, state.filter);

  if (visible.length === 0) {
    const empty = document.createElement('p');
    empty.className = 'empty';
    empty.textContent = state.todos.length === 0
      ? 'No to-dos yet — add one above.'
      : `No ${state.filter} items.`;
    list.appendChild(empty);
  } else {
    visible.forEach(todo => list.appendChild(renderItem(todo, handlers)));
  }

  document.getElementById('remaining').textContent =
    `${countRemaining(state.todos)} of ${state.todos.length} remaining`;

  document.querySelectorAll('[data-filter]').forEach(button => {
    const isCurrent = button.dataset.filter === state.filter;
    button.setAttribute('aria-current', isCurrent ? 'true' : 'false');
  });
}

function renderItem(todo, handlers) {
  const li = document.createElement('li');
  li.dataset.id = todo.id;
  li.className = todo.completed ? 'done' : '';

  // checkbox
  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.checked = todo.completed;
  checkbox.id = `cb-${todo.id}`;
  checkbox.addEventListener('change', () => handlers.onToggle(todo.id));

  // label
  const label = document.createElement('label');
  label.setAttribute('for', checkbox.id);
  label.textContent = todo.text;
  label.addEventListener('dblclick', () => handlers.onEdit(todo.id));

  // delete
  const del = document.createElement('button');
  del.type = 'button';
  del.className = 'delete';
  del.setAttribute('aria-label', `Delete: ${todo.text}`);
  del.textContent = '×';
  del.addEventListener('click', () => handlers.onDelete(todo.id));

  li.append(checkbox, label, del);
  return li;
}
```

The render module is the only one that touches the DOM. The `lib/todos.js` module knows nothing about the DOM; it could be tested in Node tomorrow with zero changes (we will do this in Week 7). This is the **separation of concerns** modules buy you.

### Phase 5 — `main.js` (1 h)

The entry point. Wires up everything: the data model, the storage, the render, and the event listeners on the input, the filter buttons, the clear-completed button, the `storage` event.

```js
import * as model from './lib/todos.js';
import { loadTodos, saveTodos } from './lib/storage.js';
import { render } from './lib/render.js';

let state = {
  todos: loadTodos(),
  filter: 'all'
};

function setState(next) {
  state = next;
  saveTodos(state.todos);
  render(state, handlers);
}

const handlers = {
  onToggle(id) {
    setState({ ...state, todos: model.toggleTodo(state.todos, id) });
  },
  onDelete(id) {
    const todo = state.todos.find(t => t.id === id);
    if (!todo) return;
    if (todo.completed && Date.now() - todo.completedAt > 60000) {
      if (!confirm(`Delete '${todo.text}'?`)) return;
    }
    setState({ ...state, todos: model.deleteTodo(state.todos, id) });
  },
  onEdit(id) {
    const todo = state.todos.find(t => t.id === id);
    if (!todo) return;
    const next = prompt('Edit to-do', todo.text);
    if (next === null) return;
    setState({ ...state, todos: model.updateText(state.todos, id, next) });
  }
};

document.getElementById('addForm').addEventListener('submit', (event) => {
  event.preventDefault();
  const input = document.getElementById('newItem');
  setState({ ...state, todos: model.addTodo(state.todos, input.value) });
  input.value = '';
  input.focus();
});

document.querySelectorAll('[data-filter]').forEach(button => {
  button.addEventListener('click', () => {
    setState({ ...state, filter: button.dataset.filter });
  });
});

document.getElementById('clearCompleted').addEventListener('click', () => {
  if (state.todos.some(t => t.completed)
      && !confirm('Clear all completed items?')) return;
  setState({ ...state, todos: model.clearCompleted(state.todos) });
});

// Cross-tab sync, per Web Storage Living Standard §9.5.
window.addEventListener('storage', (event) => {
  if (event.key !== 'codecrunch.todos.v1') return;
  state = { ...state, todos: loadTodos() };
  render(state, handlers);
});

render(state, handlers);
```

The `setState` function is the single place state changes happen. Every mutation flows through it. This makes the app debuggable: set a breakpoint in `setState` and you see every change in order.

For the edit interaction, the prompt-based version above is the minimum viable thing; the better version is an inline editable input (the acceptance criterion mentions Enter / Escape). The inline version uses `contenteditable` or an injected `<input>`; we cover the patterns properly in Week 5. The mini-project accepts either approach — write the one you can ship.

### Phase 6 — Accessibility audit (1 h)

Run axe DevTools. Fix every serious or critical issue. Common findings on a first build:

- The checkbox is missing a programmatic label. (Fix: wrap text in a `<label for="cb-id">`.)
- The delete button has no accessible name. (Fix: `aria-label="Delete: <text>"`.)
- The filter buttons do not announce their current state. (Fix: `aria-current="true"` on the active filter; the render module sets this.)
- The counter does not announce updates. (Fix: `<p id="remaining" aria-live="polite">`.)
- The empty-list message is not announced. (Fix: put it inside the `aria-live` region.)

Tab through the page. The order should be: skip link, input, Add, filter (All), filter (Active), filter (Completed), first item's checkbox, first item's delete, ..., Clear completed.

Zoom to 200%. The layout should still hold; no horizontal scroll; no clipped text. Per WCAG 2.2 SC 1.4.4 and SC 1.4.10.

### Phase 7 — README and ship (30 min)

Write `mini-project/README.md`:

- A two-line summary of what the app does.
- A one-line "how to run" — `Open with Live Server; the app loads at http://127.0.0.1:5500/mini-project/`.
- A "schema" section with the `Todo` shape.
- A "module layout" section that names each of the four JS files and what it owns. (One sentence each.)
- One decision you would defend in a code review, with a spec or WCAG citation.

Commit. Push. Open the live URL in the cohort channel.

---

## Stretch goals

- **Drag-and-drop reorder.** Use the HTML Drag and Drop API (per HTML Living Standard §6.10) to let users reorder items. Persist the order in the array; render reads the order directly.
- **Undo / redo.** Keep an array of past `state.todos` snapshots; `Ctrl+Z` pops the most recent. Closures make the bookkeeping trivial; you have a "history" closure scoped to the module.
- **Export / import.** Add buttons that download the current list as a JSON file and upload one to replace it. Use `URL.createObjectURL` and `Blob`; both ship in every browser.
- **A second filter dimension.** Tags on items; click a tag to filter to it. The model already supports it (`text` can carry `#tag` substrings); the render module just needs a tag-extractor and a tag list.
- **Tests.** Add a `tests/` folder with hand-rolled assertions for every function in `lib/todos.js`. (We add a real test runner in Week 7.) Each function is pure — they are the easiest functions in the app to test.

---

## Rubric

| Criterion | Weight | "Great" looks like |
|-----------|------:|--------------------|
| Modules and separation | 20% | Four JS files; `lib/todos.js` touches no DOM; `lib/storage.js` is defensive; `lib/render.js` is the only DOM-toucher |
| Immutable updates | 15% | Every mutation returns a new array; no `.push` or `.splice` on the state |
| `localStorage` discipline | 15% | Namespaced key; versioned; `try`/`catch` on both read and write; cross-tab `storage` event handled |
| Accessibility | 20% | Keyboard-complete; axe-clean; ARIA roles where they earn their keep; counter in a live region |
| Validator-clean & cascade-clean | 10% | Validator passes; no specificity above `(0, 0, 1, 1)` |
| Code economy | 10% | The four JS files total under 200 lines; no dead code; no commented-out code |
| README & polish | 10% | A reader understands the app and the model without opening the JS |

---

## Why this matters

A to-do app is the canonical demo for the same reason "Hello, World" is the canonical first program: it is small enough to fit on a page, and it touches every building block at least once. CRUD (create, read, update, delete), persistence, validation, filtering, and accessibility — in one tiny app you have used every primitive of every interactive web app you will ever build.

The fact that you can ship this with no framework, no build tool, and no npm — using `localStorage`, `crypto.randomUUID`, `JSON.stringify`, `addEventListener`, and the spread operator, all defined in ECMA-262 and the HTML Living Standard — is the lesson this week wants you to feel. Frameworks save time on large applications. For a small one, raw JS is faster to write, easier to read, and faster to load.

When a future employer asks "show me something you built without a framework," this app is the answer. The Week 4 version is the first version where the page on your portfolio site does something when you click it.

---

## Submission

Commit. Push. Make the repo public if it is not already. Share the URL in the cohort channel. Your peers will open the page, use the keyboard only, fill the list, refresh, open it in a second tab, edit something, watch it sync, run axe DevTools, and read your `lib/` modules top-to-bottom. They will check that no global state leaked, no `var` survives, no DOM call lives in `lib/todos.js`, and no `JSON.parse` is bare-handed.

Then read [Week 5 — The DOM & Events](../../week-05/) — and start replacing the prompts and confirms with real, accessible inline interactions.
