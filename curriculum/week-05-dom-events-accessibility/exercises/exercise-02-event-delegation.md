# Exercise 2 — Event Delegation

**Time:** ~50 minutes.

## Problem statement

Build a small "ten-row to-do" page. First, wire it up the naive way: one `click` listener per delete button, one per checkbox, one per edit button. Three listeners per row, ten rows — thirty listeners. The Sources panel can show you they are all attached. Then refactor: one listener on the parent `<ul>`, routing on a `data-action` attribute. From thirty listeners to one. The page does exactly the same thing.

The point is not "delegation is faster" (though it is). The point is that **delegation works for items that do not exist yet** — items the user adds at runtime — and the naive approach does not.

```text
┌──────────────────────────────────────────────────┐
│ ●●●    http://localhost:5500/                    │
├──────────────────────────────────────────────────┤
│                                                  │
│   Delegated To-Dos                                │
│                                                  │
│   ☐ Read Lecture 2          [ Edit ]   [ × ]      │
│   ☐ Memoize the factorial   [ Edit ]   [ × ]      │
│   ☑ Type the eight types    [ Edit ]   [ × ]      │
│   ...                                             │
│                                                  │
│   ┌──────────────────────────────┐  ┌──────┐    │
│   │ What needs doing?            │  │ Add  │    │
│   └──────────────────────────────┘  └──────┘    │
│                                                  │
└──────────────────────────────────────────────────┘
```

## Source content

Create `exercises/exercise-02/index.html`, `exercises/exercise-02/styles.css`, and `exercises/exercise-02/script.js`. The HTML for a row will be cloned from a `<template>`, the same shape as Exercise 1.

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <title>Delegated To-Dos — Week 5 Exercise 2</title>
    <link rel="stylesheet" href="./styles.css">
  </head>
  <body>
    <main>
      <h1>Delegated To-Dos</h1>

      <ul id="todo-list" aria-live="polite"></ul>

      <form id="add-form">
        <label for="new-item">New item</label>
        <input id="new-item" name="new-item" type="text" autocomplete="off" required>
        <button type="submit">Add</button>
      </form>
    </main>

    <template id="todo-row">
      <li class="todo-row" data-id="">
        <input type="checkbox" class="todo-check" data-action="toggle">
        <span class="todo-text"></span>
        <button type="button" class="todo-edit"   data-action="edit"   aria-label="Edit"  >Edit</button>
        <button type="button" class="todo-delete" data-action="delete" aria-label="Delete">×</button>
      </li>
    </template>

    <script src="./script.js" defer></script>
  </body>
</html>
```

Hard-code the initial ten items at the top of `script.js`:

```js
let todos = [
  { id: '01', text: 'Read Lecture 2',           completed: false },
  { id: '02', text: 'Memoize the factorial',    completed: false },
  { id: '03', text: 'Type the eight types',     completed: true  },
  { id: '04', text: 'Watch Wat',                completed: true  },
  { id: '05', text: 'Open DevTools sources',    completed: false },
  { id: '06', text: 'Write a closure',          completed: false },
  { id: '07', text: 'Read DOM §3',              completed: false },
  { id: '08', text: 'Run axe on the page',      completed: false },
  { id: '09', text: 'Test with VoiceOver',      completed: false },
  { id: '10', text: 'Ship the dropdown',        completed: false },
];
```

## Acceptance criteria

- [ ] `exercises/exercise-02/index.html`, `exercises/exercise-02/styles.css`, and `exercises/exercise-02/script.js` exist.
- [ ] The page passes <https://validator.w3.org/nu/> with zero errors.
- [ ] The page renders cleanly at 320 px viewport.
- [ ] On load, ten rows render from the `todos` array. The render path uses the `<template>` clone pattern from Exercise 1.
- [ ] **Exactly one** `click` listener is attached to the `<ul>`. **Exactly one** `submit` listener is attached to the `<form>`. **Exactly one** `keydown` listener is attached to the `<ul>` (for the keyboard tests below). No per-row listeners.
- [ ] You can verify the listener count by opening **DevTools → Elements panel → click the `<ul>` → Event Listeners side panel.** Exactly one `click` listener is shown, attached at the `<ul>`, not at any child.
- [ ] **Click the checkbox** → the row's `completed` flips. The class `is-completed` toggles on the `<li>`. The change is announced (the list is a polite live region).
- [ ] **Click "Edit"** → the text becomes an `<input>` with the current value. Pressing `Enter` saves; pressing `Escape` cancels and restores the prior text. Both reach the DOM by re-rendering.
- [ ] **Click "×"** → that row is removed from the `todos` array; the list re-renders.
- [ ] **Submit the form** (Enter in the input or click "Add") → a new row is created, with a fresh id (`crypto.randomUUID()`), appended to the end of the list. The new row is **immediately interactive** — its checkbox, edit, and delete all work without any per-row listener being attached. This is the delegation payoff.
- [ ] **Keyboard:** every interactive element is reachable by `Tab`. The "Add" button submits the form. `Enter` while focused on a list item's text does nothing; `Edit` is a button — clicking it enters edit mode.
- [ ] **Focus restoration:** after deleting a row, focus moves to the next row's delete button (or, if the deleted row was the last, to the previous row's delete button, or, if the list is empty, to the new-item input).
- [ ] **axe DevTools:** zero serious or critical issues.
- [ ] **Visible focus indicator** on every interactive control. Define a `:focus-visible` rule in your CSS.
- [ ] The `event.target.closest('[data-action]')` pattern from Lecture 2 §4 is used for all three click behaviors. The listener is fewer than 20 lines.

## Suggested order of operations

### Phase 1 — Render (15 min)

Replicate the Exercise 1 render path: a `renderTodos(todos)` function that clones the template, fills it in, and uses `replaceChildren` to swap the list contents. The `<li>`'s `data-id` carries the id; the `<input>`'s `checked` property reflects `completed`; a class `is-completed` lights up when completed.

### Phase 2 — One click listener for three actions (15 min)

Attach a single `click` listener to the `<ul>`. Use `event.target.closest('[data-action]')` to find the actor (a button or a checkbox). Use `event.target.closest('.todo-row')` to find the row. Read `data-action`; switch on it.

```js
list.addEventListener('click', (event) => {
  const actor = event.target.closest('[data-action]');
  if (!actor) return;
  const row = actor.closest('.todo-row');
  const id = row.dataset.id;
  const todo = todos.find(t => t.id === id);

  switch (actor.dataset.action) {
    case 'toggle': todo.completed = actor.checked; renderTodos(todos); break;
    case 'edit':   startEdit(row, todo); break;
    case 'delete': todos = todos.filter(t => t.id !== id); renderTodos(todos); break;
  }
});
```

The toggle case has a subtle bug if you read `actor.checked` *after* re-rendering (the new checkbox is a different DOM node). The pattern above reads the value first, then re-renders. The pattern is a good thing to internalize.

### Phase 3 — Add form (10 min)

Attach a `submit` listener to the form. Call `event.preventDefault()` (so the page does not reload). Read the input value, trim, validate (non-empty). Push a new todo with `crypto.randomUUID()`. Re-render. Clear the input.

```js
form.addEventListener('submit', (event) => {
  event.preventDefault();
  const text = input.value.trim();
  if (!text) return;
  todos.push({ id: crypto.randomUUID(), text, completed: false });
  input.value = '';
  renderTodos(todos);
  input.focus();  // return focus to the input for fast successive adds
});
```

The `input.focus()` at the end is small but matters: after submitting, the keyboard user expects focus to return to the input so they can keep adding. This is **focus management**, the topic of Lecture 2 §5.

### Phase 4 — Edit mode (10 min)

`startEdit(row, todo)` swaps the `<span class="todo-text">` for an `<input type="text">` with the current value. The input listens for `Enter` (save) and `Escape` (cancel). Both call `renderTodos(todos)` at the end, restoring the row to read mode.

To keep this delegated, you can attach the `keydown` listener to the `<ul>` (delegation works for keydown the same way it works for click — the event bubbles). Or you can attach it directly to the input, since it is created inside the same function and is a one-shot listener (`{ once: true }`).

For this exercise, attach the `keydown` listener to the `<ul>` and route the same way as the click listener. The acceptance criterion specifies "exactly one keydown listener at the list level."

## Hints

<details>
<summary>How do I "find the actor" if the user clicks the text inside a button rather than the button itself?</summary>

`event.target` is the deepest element the click happened on — for a click on a button's text, that is the text node's parent (likely the button itself, or a `<span>` inside it). `closest('[data-action]')` walks up from there until it finds an ancestor with a `data-action` attribute. That is the button.

If the click did not happen inside any actor (e.g., on the row text), `closest` returns `null`. The `if (!actor) return;` early-exit is essential.

</details>

<details>
<summary>How do I keep the listener count to exactly one?</summary>

Attach the listener to the `<ul>` once, on initial setup. Never attach inside `renderTodos`. The re-render replaces the children of the `<ul>`, but the `<ul>` itself is the same node throughout the page's lifetime, and its listeners persist.

If you find yourself writing `addEventListener` inside a render function, you are doing it wrong. The whole point of delegation is the one-time attachment to a stable parent.

</details>

<details>
<summary>After deleting, how do I send focus to the right place?</summary>

Before re-rendering, capture the position of the row about to be removed (e.g., its index in `todos`). After re-rendering, look up the row that should now receive focus (the row at the same index, or the previous index if the deleted row was last). Call `.focus()` on its delete button.

```js
case 'delete': {
  const index = todos.findIndex(t => t.id === id);
  todos = todos.filter(t => t.id !== id);
  renderTodos(todos);
  const next = list.children[Math.min(index, list.children.length - 1)];
  if (next) next.querySelector('[data-action="delete"]').focus();
  else input.focus();
  break;
}
```

This is mildly fiddly. It is also exactly the work that distinguishes "accessible" from "looks accessible." Per WCAG 2.2 SC 2.4.3 (Focus Order), the focus order preserves meaning and operability — after deletion, the natural next stop is the row that took the deleted row's place.

</details>

<details>
<summary>How can I tell, in DevTools, that I really do have only one listener?</summary>

In Chrome DevTools:

1. Open the Elements panel.
2. Click the `<ul id="todo-list">` element.
3. In the right-side panel, click the **Event Listeners** tab.
4. Expand `click`. You should see exactly one entry, with `useCapture: false` and the source location pointing at your `script.js`.

If you see entries on child `<button>` elements, those are individual listeners — not what you want. Remove them.

In Firefox, the equivalent is the **bolt icon** next to elements in the Inspector that have listeners attached. Click the icon to see the listener list.

</details>

## What "done" looks like

Ten rows on load. Adding rows works. Toggle / Edit / Delete all work. Adding a row, then immediately deleting that row, works (the new row was never explicitly wired up — delegation handled it). The DevTools Event Listeners panel shows exactly one `click` and one `keydown` on the `<ul>`, and one `submit` on the `<form>`. Tab order is sensible. Focus restoration works after delete. axe DevTools is clean. The page passes the validator.

If all of that is green, commit and move on to **Exercise 3 — Keyboard-Navigable Dropdown**.

## Stretch

If you finish early:

- Add a **drag-to-reorder** affordance. The native HTML5 drag-and-drop API works; the **Pointer Events** spec is friendlier. Either way, the event delegation pattern still holds — one `pointerdown` listener on the `<ul>`, route on the source row.
- Add a **persistence** layer using the same `localStorage` defensive helpers you wrote in Week 4. Re-load the page; the list survives.
- Add a **filter** (All / Active / Completed) with `aria-current="true"` on the active filter. This is one step closer to the mini-project.

Save stretches in `exercises/exercise-02-stretch/`.
