# Lecture 1 — The DOM Tree and Querying

> **Outcome:** You can describe the DOM as a tree of typed nodes, walk it in three directions, query it with the same CSS selectors you wrote in Week 2, mutate it without ever touching `innerHTML`, and pick the right interface — attribute, property, class, or inline style — for the change you want to make. By the end of this lecture you read a page's DOM the way you read a one-page HTML file: with no surprises.

## 1. What the DOM actually is

The **Document Object Model** is the browser's living representation of your HTML document, exposed to JavaScript as a tree of objects. When the browser parses `<h1>Hello</h1>`, it does not keep that text around as a string. It constructs an `HTMLHeadingElement` object, links it to its parent, attaches a `Text` node child holding the characters `"Hello"`, and pushes the result onto the tree rooted at `document`. The HTML you wrote is the *input*; the DOM is the *runtime data structure* every other web technology — CSS, JavaScript, the accessibility tree, the print stylesheet — reads from.

The DOM is not part of ECMAScript. Brendan Eich wrote JavaScript in 10 days in 1995; the DOM was specified separately, starting with **DOM Level 1** in 1998. The current normative spec is the **WHATWG DOM Living Standard**, a continually-updated document maintained by Apple, Google, Mozilla, and Microsoft engineers. The spec is at <https://dom.spec.whatwg.org/>. Bookmark it. We will cite section numbers throughout.

The DOM is implemented in C++ inside every browser. The JavaScript objects you touch — `document`, `element.children`, `event.target` — are thin wrappers around the C++ tree. This matters for one practical reason: every read and every write crosses a boundary. Reading `element.offsetWidth` forces the browser to lay out the page; writing `element.style.left = '10px'` invalidates that layout. We will return to this when we talk about performance.

JavaScript can access the DOM because the browser exposes a single global: **`window`**. On `window`, `document` lives, and on `document`, every node in the tree is reachable. Node, the JavaScript runtime, has neither `window` nor `document`. The DOM is a *browser* API; this is a *browser* week.

---

## 2. The tree

> **The single concept the rest of this week rests on: every HTML page is a tree, every member of the tree is a `Node`, and the root of the tree is `document`. Querying, mutating, eventing — all of it is operations on this tree.**

Take the smallest valid HTML page:

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <title>Demo</title>
  </head>
  <body>
    <h1>Hello, <em>world</em>!</h1>
  </body>
</html>
```

The DOM the browser builds:

```text
document
└── <html lang="en">
    ├── <head>
    │   └── <title>
    │       └── "Demo"
    └── <body>
        └── <h1>
            ├── "Hello, "
            ├── <em>
            │   └── "world"
            └── "!"
```

Every node is an instance of `Node` (or a subclass). The `Node` interface — defined in DOM §4.4 — gives every member of the tree the same shape: `parentNode`, `childNodes`, `firstChild`, `lastChild`, `nextSibling`, `previousSibling`. You can walk the entire document with those six properties and nothing else.

The most useful subclasses of `Node`:

| Subclass | What it is | `node.nodeType` constant |
|----------|-----------|--------------------------|
| `Element` | An HTML tag — `<h1>`, `<div>`, `<button>` | `1` (`Node.ELEMENT_NODE`) |
| `Text` | The literal text between or inside tags | `3` (`Node.TEXT_NODE`) |
| `Comment` | An HTML comment | `8` (`Node.COMMENT_NODE`) |
| `Document` | The root — `document` is the only instance | `9` (`Node.DOCUMENT_NODE`) |
| `DocumentFragment` | An off-tree container — used to batch insertions | `11` (`Node.DOCUMENT_FRAGMENT_NODE`) |

You can ask any node `node instanceof Element` to test the type at runtime. In practice you rarely need to: the methods that take elements expect elements, and TypeScript or JSDoc will keep you honest. But for the four exercises this week, knowing the type system exists is enough.

### Walking the tree

There are two parallel sets of walkers:

- **`Node`-level walkers** (include text and comment nodes):
  - `node.parentNode`
  - `node.childNodes` (a live `NodeList`)
  - `node.firstChild`, `node.lastChild`
  - `node.nextSibling`, `node.previousSibling`

- **`Element`-level walkers** (skip text and comment nodes — return only elements):
  - `element.parentElement`
  - `element.children` (a live `HTMLCollection`)
  - `element.firstElementChild`, `element.lastElementChild`
  - `element.nextElementSibling`, `element.previousElementSibling`

Which set you want depends on whether the whitespace and comments matter. In the HTML above, `<body>` has *one* child element (`<h1>`) and *three* child nodes (a whitespace text node, the `<h1>`, another whitespace text node). The text nodes are real; they just usually do not matter to your logic. Reach for the `element`-level walkers by default; reach for the `node`-level walkers when you are inspecting raw text or are doing surgery in a text-editor-style application.

---

## 3. Querying — five methods, two you will actually use

> **Per DOM §4.2.6, there are five ways to find nodes by selector. Two of them — `getElementById` and `querySelector` / `querySelectorAll` — are what you reach for in 2025. The other three exist for historical reasons; you should be able to read them in old code.**

### The five methods

```js
document.getElementById('main')                  // single Element or null
document.getElementsByClassName('item')          // live HTMLCollection
document.getElementsByTagName('a')               // live HTMLCollection
document.querySelector('.item.is-active')        // single Element or null
document.querySelectorAll('.item:not(.hidden)')  // static NodeList
```

Two distinctions to internalize:

**1. Singular versus plural.** `getElementById` and `querySelector` return one element or `null`. `getElementsByClassName`, `getElementsByTagName`, and `querySelectorAll` return a collection.

**2. Live versus static.** This is the one that bites.

- A **live `HTMLCollection`** (from `getElementsByClassName` / `getElementsByTagName`) reflects the current state of the DOM. If you remove a class while iterating, the collection shrinks under your feet.
- A **static `NodeList`** (from `querySelectorAll`) is a snapshot. Take it once; iterate it; do not expect it to update.

A subtle bug, classic enough to belong in a museum:

```js
// BUG: removes only every other element.
// As we remove the first, the second slides into index 0,
// which we skip when we go to index 1.
const items = document.getElementsByClassName('item');  // LIVE
for (let i = 0; i < items.length; i++) {
  items[i].remove();
}

// FIX: take a static snapshot first.
const items = document.querySelectorAll('.item');  // STATIC
for (const item of items) {
  item.remove();
}
```

The lesson: prefer `querySelectorAll`. It returns a `NodeList`, which is iterable with `for...of`, supports `.forEach`, and does not surprise you. Reach for `getElementsByClassName` only if you specifically need the live behavior — and in eight years of writing front-end code you may never need it.

### CSS selectors, exactly the ones from Week 2

`querySelector` and `querySelectorAll` take any valid CSS selector. The same selectors you wrote in Week 2 stylesheets. The browser uses the same selector engine; one piece of code, two interfaces.

```js
document.querySelector('main > article:first-of-type h2');
document.querySelector('button[data-action="delete"]');
document.querySelector('input:checked + label');
document.querySelector('li:not(.is-completed)');
document.querySelector('.card:has(img[alt=""])');   // :has() ships in every browser since 2023
```

The selector returns the *first* match in document order. If you want all matches, use `querySelectorAll`.

### Scoping the query

Every element is itself a query root:

```js
const card = document.querySelector('.card');
const title = card.querySelector('h2');   // search within `card` only
const links = card.querySelectorAll('a'); // every link inside this card
```

Scoping a query to a subtree is faster (the engine has fewer nodes to search) and safer (you won't accidentally pick up a matching element from elsewhere on the page). When you have a parent element in hand, always query from it, not from `document`.

### The `:scope` selector

Inside a scoped query, the pseudo-class `:scope` refers to the element you are querying from:

```js
const card = document.querySelector('.card');
const directLinks = card.querySelectorAll(':scope > a');
// Only direct children that are <a>, not <a> descendants.
```

Without `:scope`, the selector `'> a'` is invalid (CSS selectors cannot start with a combinator at the top level). With `:scope`, the selector works and reads cleanly.

---

## 4. Mutating the tree — the modern, post-jQuery method set

> **For ten years, every JavaScript codebase used `appendChild`, `insertBefore`, `removeChild`, and `parentNode.replaceChild` — a verbose, error-prone API inherited from DOM Level 1 in 1998. Per DOM §4.2.5 and §4.2.6, the modern interface is shorter, friendlier, and what you should be writing.**

### Creating nodes

```js
const li = document.createElement('li');
li.textContent = 'Read Lecture 2';
li.classList.add('todo-item');
```

`document.createElement(tagName)` returns a detached element — one that exists in memory but is not yet in the tree. It has no parent and renders nothing. Attach it to the tree to make it visible.

For text nodes:

```js
const text = document.createTextNode('Hello');
// Usually unnecessary — string arguments to .append create text nodes automatically.
```

For a subtree to be attached together:

```js
const fragment = document.createDocumentFragment();
fragment.append(li1, li2, li3);
list.append(fragment);  // one DOM mutation, three children attached.
```

A `DocumentFragment` is a lightweight container that, when appended, dissolves — its children move into the new parent. This is the right shape for "build off-document, attach in one go," which is faster than three separate `.append` calls because the browser lays out once instead of three times.

### Attaching nodes

The modern methods, all on `Element`:

| Method | What it does |
|--------|-------------|
| `parent.append(...nodes)` | Insert as last children. Accepts elements or strings (auto-wraps strings as text nodes). |
| `parent.prepend(...nodes)` | Insert as first children. |
| `target.before(...nodes)` | Insert as previous siblings of `target`. |
| `target.after(...nodes)` | Insert as next siblings of `target`. |
| `parent.replaceChildren(...nodes)` | Remove every existing child; insert these in their place. |
| `target.replaceWith(...nodes)` | Replace `target` with the given nodes. |

All six accept multiple arguments and accept strings. They are the modern interface. `appendChild`, `insertBefore`, and `replaceChild` are the legacy interface — readable, but unnecessarily verbose.

```js
// Legacy
ul.appendChild(li);
ul.insertBefore(li, ul.firstChild);
parent.replaceChild(newNode, oldNode);

// Modern
ul.append(li);
ul.prepend(li);
oldNode.replaceWith(newNode);
```

### Removing nodes

```js
element.remove();   // remove from the tree
ul.replaceChildren();   // remove every child (called with no arguments)
```

`element.remove()` shipped in every browser in 2017; you can use it without polyfills. `replaceChildren()` called with zero arguments is the cleanest "empty this element" — far better than `element.innerHTML = ''` (which incurs an HTML parse for the empty string) or the older `while (element.firstChild) element.removeChild(element.firstChild)` (which is loop-shaped).

### Cloning nodes

```js
const clone = original.cloneNode(false);  // shallow: element + attributes only
const deep  = original.cloneNode(true);   // deep: element + all descendants
```

`cloneNode(true)` is the shape for "create N copies of a `<template>` content," which is a Week 7 pattern when we discuss web components.

---

## 5. Why you should never reach for `innerHTML`

> **`element.innerHTML = '<p>Hello, ' + name + '</p>'` is the canonical security mistake of the web. We do not write that line in this course, ever.**

The `innerHTML` setter takes a string and asks the HTML parser to interpret it as markup. Any tags inside the string become real elements. Any `<script>` tags become real scripts. Any `<img onerror="...">` becomes a real attack vector.

If `name` came from a URL parameter, a form input, a JSON response — anywhere a user influenced it — you have just given that user the ability to execute JavaScript in the trust context of your origin. This is **cross-site scripting (XSS)**, and it is responsible for more security incidents on the web than any other class of bug.

The fix is to use the right method for the right job:

| What you want | Use | Why |
|---------------|-----|-----|
| Insert plain text | `element.textContent = '...'` or `element.append('...')` | Strings become text nodes; tags inside the string are not parsed |
| Insert one element | `parent.append(element)` | The element you constructed is the element that appears |
| Insert markup from a *trusted, hard-coded* source | `element.innerHTML = '...'` | Acceptable when the string is a literal in your code, not user-supplied |
| Insert markup from an *untrusted* source | The Sanitizer API or DOMPurify | The sanitizer strips dangerous tags and attributes |

We will use `textContent` and `append` for every example this week. If you find yourself reaching for `innerHTML`, stop and ask: am I including any data I did not write in this file? If yes, do not do this.

The Sanitizer API (`element.setHTML(...)`) is shipping but not yet universal at the time of writing; DOMPurify is the de-facto polyfill. Until 2026 most production code uses DOMPurify; after, expect `setHTML` to be standard.

---

## 6. The four interfaces to a single element

> **There are four ways to change what an element looks or behaves like: attribute, property, class, inline style. Picking the right one is one of the most-asked-about junior-engineer code-review topics. Each has a domain.**

Take a button:

```html
<button id="b" class="btn btn-primary" data-action="save" disabled>Save</button>
```

You can manipulate it in four ways:

### 1. Attribute (the HTML)

```js
b.setAttribute('data-action', 'submit');
b.getAttribute('data-action');                // "submit"
b.toggleAttribute('disabled');                // adds or removes
b.removeAttribute('disabled');
```

`setAttribute` / `getAttribute` operate on the *serialized HTML*. The value is always a string. You can read any attribute, including custom `data-*` attributes and `aria-*` attributes.

For `data-*` attributes specifically, the `dataset` shorthand exists:

```js
b.dataset.action = 'submit';   // sets data-action="submit"
b.dataset.action;              // "submit"
```

Use `dataset` for your own `data-*` attributes; use `setAttribute` for ARIA and other platform attributes.

### 2. Property (the JavaScript object)

```js
b.disabled = true;             // boolean, not a string
b.value = 'New value';         // on inputs
b.checked = false;             // on checkboxes
```

Many HTML attributes have a corresponding JavaScript *property* on the element object — but the type is often more useful than the attribute version (a boolean instead of a string, a number instead of a string). Properties live in JavaScript; attributes live in the HTML serialization. They are not always in sync.

The most common gotcha: a checked checkbox. The *attribute* `checked` is the initial state from the HTML. The *property* `checked` is the current state.

```js
const checkbox = document.querySelector('input[type=checkbox]');
checkbox.checked;                 // current state (boolean)
checkbox.getAttribute('checked'); // initial state from HTML ("" or null)
```

When you toggle a checkbox in the UI, the property updates but the attribute does not. When you submit the form, the property is what is sent.

### 3. Class (the CSS hook)

```js
b.classList.add('is-loading');
b.classList.remove('is-loading');
b.classList.toggle('is-loading');
b.classList.toggle('is-loading', isLoading);  // explicit add/remove
b.classList.replace('is-loading', 'is-error');
b.classList.contains('is-primary');
```

`classList` is the modern interface. The CSS classes you add and remove drive styling that lives in your stylesheet — exactly the separation of concerns we built in Week 2. **State that the CSS cares about should be a class.** A button that becomes "loading" should add `.is-loading`; the CSS styles `.is-loading` with a spinner. The JavaScript does not need to know what loading *looks* like.

### 4. Inline style (the escape hatch)

```js
b.style.setProperty('--btn-color', 'red');
b.style.left = '10px';
b.style.removeProperty('left');
```

`element.style` is the inline-style declaration block. Every property you set here is a CSS property; every property you read is the inline value (not the computed value — for that, use `getComputedStyle(element)`).

When to use inline styles, in decreasing order of legitimacy:

1. **Computed values that change per-instance** — like a `--position-x` derived from `event.clientX`.
2. **CSS custom properties used as a JS-to-CSS bridge** — set `element.style.setProperty('--progress', '0.7')`, let CSS use `var(--progress)` for everything visible.
3. Almost never anything else.

Avoid `element.style.color = 'red'` for state styling — use a class. Inline styles are higher specificity than your stylesheet, harder to override, and harder to reason about.

### The decision tree

When you need to change an element, ask in this order:

1. Is the change about how the element *looks*? **Use a class.** The styling lives in CSS.
2. Is the change about a *piece of state* the platform tracks (disabled, checked, value)? **Use the property.**
3. Is the change about *metadata* the HTML records (data-*, aria-*, src, href)? **Use the attribute.**
4. Is the change a *computed value per-instance* that CSS will read? **Use `style.setProperty` with a custom property.**

You will hold this decision tree in your head for the rest of your career. Get it right now.

---

## 7. Reading the layout — `getBoundingClientRect` and friends

> **Sometimes you need to know where an element is on screen — to position a tooltip, to check if a target is visible, to scroll something into view. The DOM exposes the geometry through a handful of read-only properties.**

```js
const rect = element.getBoundingClientRect();
// { x, y, top, right, bottom, left, width, height }
```

`getBoundingClientRect()` returns the element's size and position relative to the *viewport* (not the document). The values are in CSS pixels. Per CSSOM View Module §4.2.

Adjacent properties:

- `element.offsetWidth`, `element.offsetHeight` — the border-box size in CSS pixels.
- `element.clientWidth`, `element.clientHeight` — the padding-box size (no border, no scrollbar).
- `element.scrollWidth`, `element.scrollHeight` — the content size including overflow.
- `element.scrollTop`, `element.scrollLeft` — read/write the scroll position.

**Reading layout is expensive.** Each of these properties forces the browser to perform a layout pass if any pending style changes have been made. Inside a loop, that is a death-by-a-thousand-cuts performance problem called **layout thrashing**:

```js
// BAD: reads then writes then reads. Browser lays out N times.
for (const item of items) {
  item.style.left = item.offsetLeft + 10 + 'px';
}

// GOOD: read all positions first, then write all.
const lefts = items.map(item => item.offsetLeft);
items.forEach((item, i) => {
  item.style.left = lefts[i] + 10 + 'px';
});
```

The pattern: **batch reads, then batch writes.** The browser performs at most one layout for the whole batch.

`element.scrollIntoView({ behavior: 'smooth', block: 'center' })` is the modern way to bring an element into view; the `block: 'center'` option positions the element in the middle of the viewport, which is what users usually expect after a navigation.

---

## 8. `<template>`, `cloneNode`, and the fragment pattern

> **When you need to render the same shape ten or a hundred times, the platform gives you `<template>`: an inert HTML container whose content is parsed but not rendered until you clone it into the live tree.**

```html
<template id="todo-row">
  <li class="todo-row">
    <input type="checkbox">
    <span class="todo-text"></span>
    <button class="todo-delete" aria-label="Delete">×</button>
  </li>
</template>
```

In JavaScript:

```js
const template = document.getElementById('todo-row');
const clone = template.content.cloneNode(true);   // DocumentFragment
const li = clone.querySelector('.todo-row');
clone.querySelector('.todo-text').textContent = todo.text;
clone.querySelector('input').checked = todo.completed;
list.append(clone);
```

`template.content` is a `DocumentFragment` containing the parsed children. Cloning it (with `true` for deep) gives you a fresh subtree per iteration. When you append the fragment, its children move into the list and the fragment becomes empty.

The win: your row's HTML lives in HTML, not in a string concatenation in JavaScript. The browser parsed it once at page load; rendering each row is a cheap clone. You also avoid the `innerHTML` trap entirely.

For week 5, `<template>` is optional but recommended. You will reach for it again in Week 7 when we discuss web components.

---

## 9. Putting it together — a tiny rendered list

Take the data model from Week 4:

```js
const todos = [
  { id: 1, text: 'Read Lecture 2', completed: false },
  { id: 2, text: 'Type the eight types', completed: true },
  { id: 3, text: 'Memoize the factorial', completed: false },
];
```

Render it without `innerHTML`, without a framework, without anything you have not already met:

```js
function renderTodos(todos) {
  const list = document.getElementById('todo-list');
  const fragment = document.createDocumentFragment();

  for (const todo of todos) {
    const li = document.createElement('li');
    li.dataset.id = todo.id;
    li.classList.toggle('is-completed', todo.completed);

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = todo.completed;

    const span = document.createElement('span');
    span.textContent = todo.text;

    li.append(checkbox, ' ', span);
    fragment.append(li);
  }

  list.replaceChildren(fragment);
}

renderTodos(todos);
```

Twenty lines. Zero `innerHTML`. Zero strings concatenated. Every element constructed in JavaScript, then attached as a single mutation via the fragment. Re-rendering is idempotent: `replaceChildren` wipes and replaces in one operation.

This is the shape of every render-from-data function you will write for the rest of the course, and for several years of your career.

---

## 10. What we leave for Lecture 2

This lecture taught you how to find, build, and modify the tree. It did not teach you how to *react* to anything the user does. There are no click handlers in any code above. There is no keyboard support. There is no focus management. The page renders once and sits there.

Lecture 2 picks up where this lecture stops: `addEventListener`, the three phases of propagation, event delegation, the keyboard model, focus management, and the ARIA vocabulary that makes a custom widget legible to a screen reader. The mini-project asks you to put the two lectures together.

Before Lecture 2, do **Exercise 1 — Query and Mutate**. It is a 45-minute drill on the methods above. Type every line; do not paste. The function names — `append`, `replaceChildren`, `closest`, `classList` — are short on purpose. Typing them embeds them.

---

## Lecture 1 summary

- The DOM is the tree of `Node` objects the browser builds from your HTML, rooted at `document`. Per the WHATWG DOM Living Standard.
- Every node is an instance of `Node` or a subclass: `Element`, `Text`, `Document`, `Comment`, `DocumentFragment`.
- Walk the tree with `parentElement`, `children`, `firstElementChild`, `nextElementSibling` when you only care about elements. Drop the `Element` infix for `Node`-level walkers that include text and comment nodes.
- Query with `querySelector` and `querySelectorAll`. Prefer them to `getElementsByClassName` (live) and `getElementById` (still fine, often faster, but limited to `id`).
- `querySelectorAll` returns a static `NodeList`; `getElementsByClassName` returns a live `HTMLCollection`. The static snapshot saves you from one of the most-Googled bugs in the language.
- Mutate with `append`, `prepend`, `before`, `after`, `replaceChildren`, `replaceWith`, `remove`. Never with `appendChild` if you can help it.
- Never reach for `innerHTML` with untrusted data. Use `textContent` or `append` for strings; use `setHTML` (when shipped) or DOMPurify for trusted HTML.
- Pick the right interface: class for visual state, property for platform state (`disabled`, `checked`), attribute for HTML metadata (`data-*`, `aria-*`), inline style for per-instance computed values.
- Batch reads then writes when crossing the layout boundary; reading geometry forces a layout.
- Use `<template>` and `cloneNode(true)` when the same shape needs to render many times.
- Twenty lines of vanilla JavaScript can render a list from data, idempotently, with no `innerHTML`.

In Lecture 2, the page learns to listen.
