# Lecture 2 — Events, Delegation, and Focus

> **Outcome:** You can wire up a listener with `addEventListener` and its modern `options` object, explain the three phases of event propagation, delegate one listener to handle many descendants, manage focus the way the platform expects, support every interaction with the keyboard alone, and use ARIA roles and properties to make a custom widget legible to a screen reader. By the end of this lecture you can defend every accessibility decision in your mini-project with a citation to either the DOM Living Standard, the ARIA Authoring Practices, or a WCAG 2.2 Success Criterion.

## 1. What an event is

Per the **UI Events Specification** and the **DOM Living Standard §3**, an **event** is an `Event` object dispatched on an `EventTarget`. Every element, every document, every window is an `EventTarget`; every user action — a click, a key press, a scroll, a focus change — produces an `Event` object that travels through the tree and triggers any listeners registered along its path.

A listener is registered with `addEventListener`:

```js
target.addEventListener(type, listener, options);
```

- **`target`** — any `EventTarget`. Almost always an `Element`, occasionally `document` or `window`.
- **`type`** — a string: `"click"`, `"keydown"`, `"focus"`, `"submit"`, plus several hundred others defined by various specs.
- **`listener`** — a function that receives the `Event` object as its single argument.
- **`options`** — an object: `{ capture, once, passive, signal }`. We will return to all four.

A trivial example:

```js
const button = document.querySelector('button');
button.addEventListener('click', (event) => {
  console.log('Clicked!', event);
});
```

That is the entire registration. The browser is now wired to call your function every time the user clicks the button. The listener stays attached for the lifetime of the page or until you remove it.

### The two old patterns to avoid

Two older ways to attach a listener still appear in code in the wild. You should be able to read them, but you should not write them:

```html
<!-- HTML attribute — inline handler -->
<button onclick="doSomething()">Save</button>
```

```js
// JavaScript property — overwrites any previous handler
button.onclick = () => console.log('Clicked');
button.onclick = () => console.log('Also clicked');  // The first is gone.
```

Both have the same fatal limitation: **only one listener per event type per element.** Setting `onclick` a second time replaces the first; there is no way to attach two independent handlers.

`addEventListener` does not have that limit. Each call adds an independent listener; they all fire, in the order they were registered, every time the event happens. This is the only pattern we use.

---

## 2. The three phases of propagation

> **Per DOM §3.1, an event travels in three phases: capture, target, bubble. Understanding this diagram is one of the most useful five minutes you will spend this year.**

Suppose a `<button>` is nested inside a `<form>` inside the `<body>`. The user clicks the button. The event takes a round trip:

```text
window
  ↓ capture
document
  ↓ capture
<html>
  ↓ capture
<body>
  ↓ capture
<form>
  ↓ capture
<button>  ← target phase
  ↑ bubble
<form>
  ↑ bubble
<body>
  ↑ bubble
<html>
  ↑ bubble
document
  ↑ bubble
window
```

The event:

1. Starts at `window` and travels **down** the tree toward the target (the **capture phase**).
2. Reaches the target (the **target phase**).
3. Travels **up** the tree back to `window` (the **bubble phase**).

At each step, the browser checks for listeners on that node and fires them. **By default, `addEventListener` attaches in the bubble phase.** To attach in the capture phase, pass `{ capture: true }`:

```js
form.addEventListener('click', handler, { capture: true });
```

In 95% of code, you want the default (bubble). Capture is occasionally useful when you need to intercept an event before it reaches a child — for example, to prevent a focus change inside a modal trap.

### `event.target` versus `event.currentTarget`

- **`event.target`** — the deepest element the event happened on (the actual `<button>`).
- **`event.currentTarget`** — the element the *currently-firing listener* is attached to.

They differ only when the listener is attached to an ancestor:

```js
form.addEventListener('click', (event) => {
  console.log('target:', event.target);             // <button> the user clicked
  console.log('currentTarget:', event.currentTarget); // <form> we attached to
});
```

This distinction is the foundation of **event delegation**. We are about to use it.

### `stopPropagation` and `preventDefault` — different things

Two methods on every `Event`, often confused:

- **`event.preventDefault()`** — tell the browser *not* to do the default platform behavior for this event. Examples: stop a form from submitting, stop a link from navigating, stop a checkbox from toggling.
- **`event.stopPropagation()`** — stop the event from continuing to ancestors. The event still completes its current phase on its current node; it just does not propagate further.

You use `preventDefault` constantly. You use `stopPropagation` rarely — and you should be suspicious every time you reach for it, because it makes the event tree harder to debug for everyone downstream.

```js
form.addEventListener('submit', (event) => {
  event.preventDefault();   // Don't reload the page.
  // ... do your AJAX submit instead.
});

link.addEventListener('click', (event) => {
  if (shouldHandleInJS) {
    event.preventDefault();  // Don't navigate.
    routeInternally(link.href);
  }
});
```

---

## 3. The `options` object — the parts you will actually use

`addEventListener` accepts a third argument: an `options` object. Each of its four properties solves a real problem.

### `once`

```js
button.addEventListener('click', handler, { once: true });
```

The listener is automatically removed after firing once. No more `removeEventListener` boilerplate for "do this on the first click." Useful for onboarding, for one-time event handling, for cleanup-once patterns.

### `passive`

```js
window.addEventListener('scroll', handler, { passive: true });
```

A passive listener promises not to call `event.preventDefault()`. The browser, knowing this, can scroll without waiting for your handler to finish. Critical for scroll and touchmove performance: a single non-passive scroll listener can drop your scroll framerate by 60%.

The default for `scroll`, `wheel`, `touchstart`, `touchmove` in modern browsers is already `passive: true` when attached to `window` or `document`. Explicit is still good; it documents intent.

### `signal`

```js
const controller = new AbortController();
button.addEventListener('click', handler, { signal: controller.signal });

// Later:
controller.abort();   // Removes the listener.
```

`AbortController` is the modern way to clean up listeners — useful when you would otherwise need to keep a reference to the handler function so you could pass it to `removeEventListener`. With `signal`, you can register a dozen listeners against one controller and remove them all at once with `controller.abort()`.

```js
// The clean-up pattern for a widget that mounts and unmounts:
function mountWidget() {
  const controller = new AbortController();
  const { signal } = controller;

  button.addEventListener('click', onClick, { signal });
  input.addEventListener('input', onInput, { signal });
  document.addEventListener('keydown', onKey, { signal });

  return () => controller.abort();
}

const unmount = mountWidget();
// Later, on unmount:
unmount();
```

### `capture`

Covered above. Pass `true` (or `{ capture: true }`) to attach in the capture phase.

---

## 4. Event delegation — one listener for many children

> **The Week 4 to-do list has N items, each with a delete button. Attaching N `click` listeners works, but it is wasteful and fragile (every new item needs its own listener). One listener on the parent, plus `event.target.closest()`, handles all N — and every future item — for free.**

The pattern:

```js
const list = document.querySelector('#todo-list');

list.addEventListener('click', (event) => {
  const deleteButton = event.target.closest('.todo-delete');
  if (!deleteButton) return;

  const row = deleteButton.closest('.todo-row');
  const id = row.dataset.id;
  deleteTodo(id);
});
```

The flow:

1. The user clicks anywhere inside the list — a `<span>`, an `<input>`, a `<button>`.
2. The event bubbles up to `#todo-list`, where the listener fires.
3. `event.target.closest('.todo-delete')` walks up from the clicked element looking for a delete button. If the click was somewhere else (the text, the checkbox), `.closest` returns `null` and we early-exit.
4. If it returns a button, we find the row, read the id, and delete.

This pattern has three wins:

1. **Memory.** One listener instead of N.
2. **Dynamic children.** A new `<li>` added later works without re-wiring.
3. **Readability.** One place to look for "what happens when something in the list is clicked."

`closest(selector)` is the right tool here. It starts at the element and walks up the tree until a parent matches the selector or it reaches the root. Without it, you would write awkward `event.target.parentElement.parentElement` chains, which break the moment the HTML changes.

### Multiple actions, one listener

When a list has several kinds of interaction, route on a `data-action` attribute:

```html
<li class="todo-row" data-id="42">
  <button data-action="toggle">Toggle</button>
  <button data-action="edit">Edit</button>
  <button data-action="delete">Delete</button>
</li>
```

```js
list.addEventListener('click', (event) => {
  const button = event.target.closest('[data-action]');
  if (!button) return;

  const row = button.closest('.todo-row');
  const id = row.dataset.id;

  switch (button.dataset.action) {
    case 'toggle': toggleTodo(id); break;
    case 'edit':   editTodo(id);   break;
    case 'delete': deleteTodo(id); break;
  }
});
```

One listener, three behaviors, fully extensible. Adding a "duplicate" action means adding one HTML button and one `case`. The wiring is trivial.

---

## 5. The focus model

> **Focus is what the keyboard is. Per the HTML Living Standard §6.6, only a small set of elements receive focus by default: links with `href`, form controls, contenteditable elements, and any element with a non-negative `tabindex`. The order they receive focus in is the document order. The mini-project depends on you understanding this fully.**

### Who receives focus, by default

Without any `tabindex`, the following elements are focusable:

- `<a>` with an `href` attribute
- `<button>`, `<input>`, `<select>`, `<textarea>` — when not disabled
- `<details>` (the summary, specifically)
- `<iframe>`
- `<audio>` and `<video>` with `controls`
- Anything with `contenteditable=""`

That is the complete list. A `<div>` is not focusable. A `<span>` is not focusable. A `<li>` is not focusable. If you build a custom widget out of these, the keyboard cannot reach it.

### `tabindex` — the three values that matter

| Value | Meaning |
|-------|---------|
| `tabindex="0"` | Include in the natural tab order. The element is reachable by `Tab`. |
| `tabindex="-1"` | Remove from the tab order. The element can still be focused programmatically via `.focus()`. |
| `tabindex="5"` (any positive) | Insert at position 5 in a global, page-wide tab order. **Do not use this.** |

The positive `tabindex` is a foot-gun. It creates a global ordering that interacts unpredictably with the rest of the page. Reserve it for nothing.

The `0` and `-1` patterns are the two you use:

- **`tabindex="0"`** when you have made a non-focusable element interactive — e.g., a `<div role="button">`. The element joins the tab order in DOM position.
- **`tabindex="-1"`** when an element is *inside* a managed widget and should be focusable by JavaScript but not by `Tab`. The canonical example: each option in a listbox. The listbox itself is in the tab order; the options are reached by arrow keys, with `roving tabindex` (we will see this in the mini-project).

### `:focus` versus `:focus-visible`

In CSS:

- `:focus` matches whenever the element has focus, including after a mouse click.
- `:focus-visible` matches only when the browser decides a focus indicator is warranted — typically after keyboard navigation, not after a click.

```css
button:focus { outline: none; }                       /* never do this alone */
button:focus-visible { outline: 2px solid var(--page-sky); outline-offset: 2px; }
```

The mouse user clicks a button and does not need a focus ring (they can see what they clicked). The keyboard user navigates with `Tab` and absolutely needs one. `:focus-visible` is how the platform tells you which situation you are in.

**Removing the focus ring with `outline: none` and never replacing it is a WCAG 2.2 SC 2.4.7 violation.** Every interactive element must show a visible focus state when keyboard focus is on it. This is non-negotiable. The mini-project rubric will reject any submission that hides the focus ring without replacing it.

### Programmatic focus

```js
element.focus();          // Move focus to this element. Triggers a focus event.
element.focus({ preventScroll: true });   // Focus without scrolling into view.
element.blur();           // Remove focus from this element.
document.activeElement;   // The element that currently has focus.
```

The single most useful pattern: **after closing a modal, return focus to the element that opened it.** Otherwise the keyboard user is dumped back at the top of the page.

```js
function openModal() {
  const lastFocused = document.activeElement;
  showModal();
  modal.querySelector('h2').focus();   // Focus the title or the close button.

  modal.addEventListener('close', () => {
    lastFocused.focus();    // Return.
  }, { once: true });
}
```

Focus management is the most common accessibility failure in custom widgets. We will return to it in every component for the rest of the course.

---

## 6. The keyboard model

> **Per the UI Events Specification, three event types fire when a key is pressed: `keydown`, `keypress`, `keyup`. `keypress` is deprecated. You use `keydown`. The `event.key` property tells you which key.**

```js
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') closeModal();
});
```

Common `event.key` values:

| Key | `event.key` value |
|-----|-------------------|
| Letter | `"a"`, `"b"`, ... (lowercase by default; uppercase if Shift is held) |
| Digit  | `"0"`, `"1"`, ... |
| Arrow keys | `"ArrowUp"`, `"ArrowDown"`, `"ArrowLeft"`, `"ArrowRight"` |
| Enter | `"Enter"` |
| Space | `" "` (a literal space) |
| Escape | `"Escape"` |
| Tab | `"Tab"` |
| Home / End | `"Home"`, `"End"` |
| Page Up / Down | `"PageUp"`, `"PageDown"` |
| Backspace | `"Backspace"` |
| Delete | `"Delete"` |

There is also `event.code`, which is the *physical* key on the keyboard (e.g., `"KeyA"`, `"Digit1"`, `"ArrowDown"`). Use `event.key` for character meaning ("the user pressed A"); use `event.code` only for game-like input where the physical key position matters.

Modifier keys are exposed as booleans: `event.shiftKey`, `event.ctrlKey`, `event.metaKey`, `event.altKey`.

### The keyboard contract for common widgets

The **WAI-ARIA Authoring Practices** document, for every widget pattern, the keys the user expects. For a few common ones:

| Widget | Key | Behavior |
|--------|-----|----------|
| **Button** | `Space` or `Enter` | Activate |
| **Link** | `Enter` | Activate |
| **Disclosure** (collapsible) | `Enter` or `Space` | Toggle open/closed |
| **Menu Button** | `Enter`, `Space`, `ArrowDown` | Open the menu and focus the first item |
| **Menu Item** | `Enter` | Activate the item |
| **Menu** | `Escape` | Close the menu, return focus to the trigger |
| **Menu** | `ArrowDown` / `ArrowUp` | Next / previous item |
| **Menu** | `Home` / `End` | First / last item |
| **Listbox option** | `Space` | Select / toggle |
| **Listbox** | `ArrowDown` / `ArrowUp` | Move focus among options |

When you build a custom widget, you implement this contract. The mini-project's dropdown follows the **Listbox** pattern. Memorize the keys above; the rubric tests them.

---

## 7. ARIA — the bare minimum, used carefully

> **ARIA — Accessible Rich Internet Applications — is a W3C specification that adds three things to HTML: roles, states, and properties. The five rules of ARIA, in order: 1) Don't use ARIA if a native HTML element will do. 2) Don't change native semantics. 3) Every interactive ARIA control is keyboard-accessible. 4) Don't apply `role="presentation"` or `aria-hidden="true"` to focusable elements. 5) Every interactive element has an accessible name.**

ARIA is a power tool. It is also one of the most-misused parts of the platform. The single statistic worth remembering: WebAIM's annual survey of the top one million home pages, 2024 edition, found that **pages with no ARIA had fewer accessibility errors on average than pages with ARIA.** Not because ARIA is broken — because ARIA used incorrectly is worse than ARIA omitted.

### The three categories

- **Roles** describe what an element *is*: `role="button"`, `role="menu"`, `role="listbox"`, `role="alert"`, `role="dialog"`.
- **States** describe what it currently *is*: `aria-expanded="true"`, `aria-selected="false"`, `aria-checked="true"`, `aria-pressed="false"`.
- **Properties** describe what it *means* or *refers to*: `aria-label`, `aria-labelledby`, `aria-describedby`, `aria-controls`, `aria-haspopup`.

Each ARIA attribute lives on a single element and is read by the accessibility tree. Screen readers consume the tree and announce the result.

### When you do not need ARIA

The whole point of rule 1: most of the time, HTML already says what you need. The native `<button>` already has `role="button"` implicitly. The native `<input type="checkbox">` already has `aria-checked` (kind of — it has the `checked` property, which the browser translates into the accessibility tree). The native `<a href>` already has the link role, an accessible name (its text content), and keyboard activation by `Enter`.

If you can build the feature with `<button>`, `<input>`, `<select>`, `<details>` / `<summary>`, `<dialog>`, or `<a>`, do that. The platform did the work for you, including the bits that vary by screen reader.

ARIA is for when the platform genuinely lacks an element. There is no native combobox with a custom dropdown list (`<select>` exists but cannot be styled at the option level). There is no native autocomplete. There is no native tabset. For those, ARIA is the tool.

### When you do need ARIA — the mini-project's pattern

The mini-project is an accessible custom dropdown. The native `<select>` element is the right answer in 80% of cases — but it cannot be styled at the option level, and stakeholders sometimes need design freedom. So we build one. The ARIA pattern is **Listbox**, per the Authoring Practices.

The markup, roughly:

```html
<label id="cuisine-label">Cuisine</label>
<button id="cuisine-trigger"
        aria-haspopup="listbox"
        aria-expanded="false"
        aria-labelledby="cuisine-label cuisine-trigger">
  Italian
</button>
<ul id="cuisine-list"
    role="listbox"
    aria-labelledby="cuisine-label"
    tabindex="-1"
    hidden>
  <li role="option" id="cuisine-italian" aria-selected="true"  tabindex="-1">Italian</li>
  <li role="option" id="cuisine-thai"    aria-selected="false" tabindex="-1">Thai</li>
  <li role="option" id="cuisine-japan"   aria-selected="false" tabindex="-1">Japanese</li>
</ul>
```

The contract:

- The trigger button has `aria-haspopup="listbox"` (it opens a listbox) and `aria-expanded` (the listbox is open or closed).
- The list has `role="listbox"`. Its children have `role="option"`.
- Selection state is `aria-selected`, one per option.
- The currently-active option has `aria-activedescendant` on the listbox — pointing at the option's id (the **roving tabindex** alternative; either is acceptable, both are documented in the Authoring Practices).
- `aria-labelledby` ties each piece to its visible label, satisfying SC 4.1.2 (Name, Role, Value).

The keyboard contract for this widget, per the Authoring Practices:

| Key | When | Behavior |
|-----|------|----------|
| `Enter`, `Space`, `ArrowDown` | Focus on the trigger | Open the list, focus the active option |
| `ArrowDown` / `ArrowUp` | Inside the list | Move active option |
| `Home` / `End` | Inside the list | First / last option |
| `Enter`, `Space` | Inside the list, on an option | Select, close, return focus to trigger |
| `Escape` | Inside the list | Close without selecting, return focus to trigger |
| `Tab` | Inside the list | Close (selecting the active option), continue to next form control |

You implement that. Every key. Every focus restoration. The mini-project rubric tests each row.

---

## 8. WCAG 2.2 — the Success Criteria most relevant to this week

> **Per W3C, WCAG 2.2 is the current normative version. Conformance level AA is the practical industry target. Below are the Success Criteria most relevant to interactive components. Memorize the numbers; cite them in code reviews.**

| SC | Level | Title | What it requires |
|----|-------|-------|------------------|
| **2.1.1** | A | Keyboard | All functionality is operable through a keyboard interface |
| **2.1.2** | A | No Keyboard Trap | The keyboard can leave any element by standard means (no trapped focus) |
| **2.4.3** | A | Focus Order | The focus order preserves meaning and operability |
| **2.4.7** | AA | Focus Visible | A keyboard focus indicator is visible |
| **2.4.11** | AA *(new in 2.2)* | Focus Not Obscured (Minimum) | The focused element is not entirely obscured by author-created content |
| **2.5.8** | AA *(new in 2.2)* | Target Size (Minimum) | Targets are at least 24×24 CSS pixels |
| **4.1.2** | A | Name, Role, Value | Every UI component has a programmatically determinable name, role, and value |
| **1.4.3** | AA | Contrast (Minimum) | Text has a contrast ratio of at least 4.5:1 (3:1 for large text) |
| **1.4.11** | AA | Non-text Contrast | UI components and graphical objects have a contrast ratio of at least 3:1 |

The mini-project rubric explicitly tests **2.1.1**, **2.1.2**, **2.4.7**, **4.1.2**, and **1.4.11**. The challenge tests additionally **2.4.11** and **2.5.8**. These are the criteria you will cite in code reviews for the rest of your career.

---

## 9. Testing — the part nobody skips

> **You cannot ship an accessible component without testing it. Automated tools catch about 30% of issues. The other 70% require keyboard testing and screen-reader testing. Both are free. Both are this week.**

### The keyboard test

Unplug your mouse, or simply close your trackpad, and try to use your component.

- Can you reach every interactive element with `Tab`?
- Is there a visible focus indicator at every stop?
- Can you activate the primary action with `Enter` or `Space`?
- Can you reach every option in your dropdown with arrow keys?
- Can you close your modal with `Escape`?
- After closing, did focus return to where it started?

If any answer is "no," the component is not ready.

### The screen-reader test

Turn on VoiceOver (`Cmd+F5` on macOS), NVDA (free download on Windows), or Orca (built into most Linux desktops). Navigate to your component without looking at the screen.

- Was the component's role announced ("button", "list", "popup")?
- Was its name announced (the visible label)?
- Was its state announced ("expanded", "collapsed", "selected")?
- Were state changes announced when you operated it?

The accessibility tree is what the screen reader sees. If the tree is wrong, the screen reader is wrong. The Firefox Accessibility panel renders the tree visually; you can open it side-by-side with the Elements panel and see exactly what your component announces.

### The axe test

Install the **axe DevTools** extension in Chrome or Firefox. Open the component; run the audit. Aim for zero serious or critical issues. Axe will find the violations a machine can find — missing alt text, missing labels, low contrast, focusable elements with no accessible name. Pair it with the keyboard and screen-reader tests; do not rely on it alone.

---

## 10. Putting it together — the smallest accessible disclosure

The simplest pattern in the Authoring Practices — and the one you will build before the mini-project — is **Disclosure**: a button that toggles a region's visibility.

```html
<button id="trigger"
        aria-expanded="false"
        aria-controls="panel">
  Show details
</button>
<div id="panel" hidden>
  <p>The details go here.</p>
</div>
```

```js
const trigger = document.getElementById('trigger');
const panel   = document.getElementById('panel');

trigger.addEventListener('click', () => {
  const isOpen = trigger.getAttribute('aria-expanded') === 'true';
  trigger.setAttribute('aria-expanded', String(!isOpen));
  panel.hidden = isOpen;   // open became closed; closed became open
});
```

Twelve lines. Fully accessible. The button announces its expanded state to a screen reader; `Tab` reaches it; `Space` and `Enter` activate it (because `<button>` already implements the keyboard contract for a button); the panel hides via the `hidden` attribute, which removes it from both the DOM render and the accessibility tree.

The native `<details>` / `<summary>` element does all of this without JavaScript. Per rule 1 of ARIA: prefer the native. The example above is what to do when, for whatever reason, you cannot use `<details>` — perhaps because you need to control the open state from elsewhere, or because the visual design will not let `<summary>` be the trigger. For most cases, `<details>` is correct.

---

## 11. What comes next

This week the page learned to listen. It listened with `addEventListener`. It listened in the right phase (`bubble`). It listened on the right element (often a parent, via delegation). It listened with the right cleanup (`signal`). And it announced what it heard to every user — keyboard users, screen-reader users, touch users, mouse users — using the same set of patterns the platform documents.

Next week the page learns to ask. Forms, validation, error messaging, autofill: how the user types and how we respond. The DOM and event mechanisms you learned this week are the substrate; forms are where they earn their keep.

Before Week 6, do **Exercise 2 (event delegation)**, **Exercise 3 (keyboard-navigable dropdown)**, the **challenge**, and the **mini-project**. The mini-project is non-negotiable. It is the first widget in your portfolio that a screen-reader user can drive end-to-end. That matters.

---

## Lecture 2 summary

- An event is an `Event` object dispatched on an `EventTarget`. Per the UI Events Specification.
- `addEventListener(type, listener, options)` is the only attachment pattern you write. `onclick` and HTML `onclick=` attributes are read-only territory.
- Events travel in three phases: capture (window → target), target, bubble (target → window). `addEventListener` defaults to bubble.
- `event.target` is where the event originated; `event.currentTarget` is the element your listener is attached to.
- `event.preventDefault()` stops the platform default; `event.stopPropagation()` stops propagation. They are not the same.
- The `options` object: `once` for one-shot, `passive` for scroll performance, `signal` (with `AbortController`) for cleanup, `capture` for capture-phase attachment.
- **Event delegation** is one listener on a parent, dispatched with `event.target.closest(selector)`. Use it whenever a list has many items.
- The keyboard model: only certain elements are focusable by default. `tabindex="0"` includes; `tabindex="-1"` excludes from tab order but allows `.focus()`. Never use positive `tabindex`.
- `:focus-visible` is the right CSS pseudo-class for focus indicators. WCAG 2.2 SC 2.4.7 requires a visible focus indicator on every interactive control.
- Programmatic focus is part of accessibility. After closing a modal, return focus to the trigger.
- `event.key` is the character meaning; `event.code` is the physical key. Use `event.key`.
- ARIA roles, states, and properties describe what HTML alone cannot. Use sparingly. The five rules of ARIA, in order, decide every ARIA question.
- Always cite WCAG by Success Criterion number. The numbers above are the ones you will use most often.
- Test with the keyboard. Test with a screen reader. Run axe. All three. Always.

The mini-project: an accessible custom dropdown. ARIA listbox pattern. Full keyboard navigation. Screen-reader tested. Validator-clean. The first widget in your portfolio that a screen-reader user can drive end-to-end.

Build it well.
