# Exercise 3 — Keyboard-Navigable Dropdown (the disclosure warm-up)

**Time:** ~60 minutes.

## Problem statement

Build the simpler cousin of the mini-project: a **disclosure-style dropdown** that opens a list of links. This is the **Menu Button** pattern from the WAI-ARIA Authoring Practices, scoped to its simplest form. A trigger button opens a list of `<a>` elements; clicking a link navigates (we leave the `href` to do its job); pressing `Escape` closes the menu without navigating; the keyboard can drive the entire interaction.

This is **not yet a `<select>` replacement** — it does not have a selection model, no `aria-selected`, no roving tabindex. That is the mini-project. This exercise is the disclosure-and-arrow-keys foundation everything else builds on.

```text
┌──────────────────────────────────────────────────┐
│ ●●●    http://localhost:5500/                    │
├──────────────────────────────────────────────────┤
│                                                  │
│   Open the Browse menu with Enter or Down.       │
│                                                  │
│   ┌──────────────┐                                │
│   │ Browse  ▾    │  ← aria-expanded toggles      │
│   └──────────────┘                                │
│   ┌──────────────┐                                │
│   │ • Home       │ ← focus moves here on open    │
│   │   Pricing    │                                │
│   │   Docs       │                                │
│   │   Blog       │                                │
│   └──────────────┘                                │
│                                                  │
│   Tab leaves the menu and continues to the page. │
│                                                  │
└──────────────────────────────────────────────────┘
```

## Source content

Create `exercises/exercise-03/index.html`, `exercises/exercise-03/styles.css`, and `exercises/exercise-03/script.js`.

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <title>Disclosure Menu — Week 5 Exercise 3</title>
    <link rel="stylesheet" href="./styles.css">
  </head>
  <body>
    <main>
      <h1>Disclosure Menu</h1>
      <p>Open the <strong>Browse</strong> menu with <kbd>Enter</kbd>, <kbd>Space</kbd>, or <kbd>ArrowDown</kbd>. Navigate with <kbd>ArrowDown</kbd> / <kbd>ArrowUp</kbd>. <kbd>Escape</kbd> closes. <kbd>Tab</kbd> leaves.</p>

      <div class="menu" id="browse-menu">
        <button id="browse-trigger"
                class="menu-trigger"
                aria-haspopup="menu"
                aria-expanded="false"
                aria-controls="browse-list">
          Browse <span aria-hidden="true">▾</span>
        </button>

        <ul id="browse-list"
            class="menu-list"
            role="menu"
            aria-labelledby="browse-trigger"
            hidden>
          <li role="none"><a role="menuitem" href="/"        tabindex="-1">Home</a></li>
          <li role="none"><a role="menuitem" href="/pricing" tabindex="-1">Pricing</a></li>
          <li role="none"><a role="menuitem" href="/docs"    tabindex="-1">Docs</a></li>
          <li role="none"><a role="menuitem" href="/blog"    tabindex="-1">Blog</a></li>
        </ul>
      </div>

      <p>This paragraph is after the menu. Tab from the open menu should land here, not return inside.</p>
    </main>

    <script src="./script.js" defer></script>
  </body>
</html>
```

A few markup notes worth understanding before you write a line of JavaScript:

- The `<ul>` has `role="menu"`. Its `<li>` children have `role="none"` (we are using `<li>` for layout only, not for semantics; the menu items are the `<a>` elements). The `<a>` children have `role="menuitem"`.
- Each `<a>` has `tabindex="-1"`. This removes them from the natural tab order; we move focus among them with the arrow keys instead. The pattern is **roving tabindex**: at any moment, exactly one menu item has `tabindex="0"` (the one with focus), the rest have `tabindex="-1"`. For the simple variant of this exercise, we leave everything at `-1` and use `.focus()` directly; for the mini-project, we will implement the full roving pattern.
- The trigger has `aria-haspopup="menu"`, `aria-expanded="false"`, and `aria-controls="browse-list"` — the three attributes the Authoring Practices require for a menu button.

## Acceptance criteria

- [ ] `exercises/exercise-03/index.html`, `exercises/exercise-03/styles.css`, `exercises/exercise-03/script.js` exist.
- [ ] The page passes <https://validator.w3.org/nu/> with zero errors.
- [ ] The page renders cleanly at 320 px viewport.
- [ ] The menu starts closed: `aria-expanded="false"` on the trigger, `hidden` on the `<ul>`.
- [ ] Clicking the trigger toggles `aria-expanded` and the `hidden` attribute on the list. When opening, focus moves to the first `<a>` in the list.
- [ ] Pressing `Enter`, `Space`, or `ArrowDown` on the focused trigger opens the menu and moves focus to the first item.
- [ ] Inside the open menu, `ArrowDown` moves focus to the next item; `ArrowUp` moves to the previous. Both wrap (Down past last → first; Up past first → last).
- [ ] `Home` moves focus to the first item. `End` moves focus to the last item.
- [ ] `Escape` closes the menu and returns focus to the trigger. The `<a>`'s `href` does **not** activate.
- [ ] Clicking outside the menu closes it (no focus change required).
- [ ] `Tab` while focus is inside the open menu: closes the menu and continues to the next tabbable element on the page (the `<p>` after the menu — but `<p>` is not tabbable, so focus goes to the address bar or the next browser chrome element; that is correct behavior).
- [ ] **One** `keydown` listener on the menu container is acceptable; **one** `click` listener on the container; **one** `click` listener on `document` for the outside-click close. No per-item listeners.
- [ ] **Visible focus indicator** on the trigger and on each menu item. Use `:focus-visible`. The focus indicator on the menu items must have contrast ≥ 3:1 against the menu background (WCAG 2.2 SC 1.4.11, Non-text Contrast).
- [ ] **axe DevTools:** zero serious or critical issues.

## Suggested order of operations

### Phase 1 — Toggle (15 min)

Wire up the trigger to toggle open/closed. The two state changes — `aria-expanded` on the trigger, `hidden` on the list — happen together, always. Capture both in one function:

```js
function setOpen(isOpen) {
  trigger.setAttribute('aria-expanded', String(isOpen));
  list.hidden = !isOpen;
  if (isOpen) {
    list.querySelector('[role="menuitem"]').focus();
  } else {
    trigger.focus();
  }
}
```

Attach `click` to the trigger; toggle the state. Move on.

### Phase 2 — Arrow keys (15 min)

Attach `keydown` to the menu container (the outer `<div class="menu">`, not the list — that way the trigger's keys and the list's keys can share one listener). Route on `event.key` and on whether the event originated from the trigger or from a menu item.

```js
menu.addEventListener('keydown', (event) => {
  const isOnTrigger = event.target === trigger;
  const isOnItem    = event.target.closest('[role="menuitem"]');

  if (isOnTrigger && (event.key === 'Enter' || event.key === ' ' || event.key === 'ArrowDown')) {
    event.preventDefault();
    setOpen(true);
    return;
  }

  if (isOnItem) {
    switch (event.key) {
      case 'ArrowDown': focusNext(); event.preventDefault(); break;
      case 'ArrowUp':   focusPrev(); event.preventDefault(); break;
      case 'Home':      focusFirst(); event.preventDefault(); break;
      case 'End':       focusLast();  event.preventDefault(); break;
      case 'Escape':    setOpen(false); event.preventDefault(); break;
    }
  }
});
```

`event.preventDefault()` on the arrow keys is essential — without it, the browser's default behavior (scrolling the page on `ArrowDown`) fires alongside your handler.

### Phase 3 — `focusNext` / `focusPrev` / `focusFirst` / `focusLast` (10 min)

The four helpers operate on the static `NodeList` of menu items. Each one moves focus to the next item (wrapping at the ends), the previous item, the first, or the last.

```js
function items() {
  return Array.from(list.querySelectorAll('[role="menuitem"]'));
}

function focusNext() {
  const all = items();
  const idx = all.indexOf(document.activeElement);
  const next = all[(idx + 1) % all.length];   // wrap
  next.focus();
}
```

The `% all.length` is the wrap. If the list ever changes at runtime, calling `items()` again gives you the current set — `querySelectorAll` returns a fresh static `NodeList` each call.

### Phase 4 — Outside click (10 min)

Attach `click` to `document`. If the click is outside the menu, close.

```js
document.addEventListener('click', (event) => {
  if (!menu.contains(event.target)) {
    setOpen(false);
  }
});
```

`Element.contains(node)` is the cleanest way to ask "is this node a descendant of that element?" — true if the node is the element itself or any descendant, false otherwise.

There is a subtle timing issue: when the user clicks the trigger to open the menu, the trigger click bubbles up to `document` *after* your trigger handler runs. If your `setOpen(true)` fires first and then the document handler fires and sees the trigger inside the menu (which it is) — fine, no close. But: be aware of the order. If you find yourself opening and immediately closing, swap the trigger's `click` for one attached during the capture phase, or use `event.stopPropagation()` on the trigger handler (with the usual reservations from Lecture 2 §2 about `stopPropagation`).

### Phase 5 — Tab closes (5 min)

When focus moves outside the menu via `Tab`, close. The cleanest way is a `focusout` listener on the menu container:

```js
menu.addEventListener('focusout', (event) => {
  if (!menu.contains(event.relatedTarget)) {
    setOpen(false);
  }
});
```

`event.relatedTarget` is the element receiving focus next. If it is not inside the menu, focus is leaving — close.

### Phase 6 — Test (5 min)

Close your trackpad. Try the menu with the keyboard only:

- `Tab` to the trigger. Focus ring visible.
- `Enter`. Menu opens. Focus on the first item.
- `ArrowDown` × 3. Focus on the last item. Focus ring visible on each step.
- `ArrowDown`. Focus wraps to the first.
- `Escape`. Menu closes. Focus on the trigger.
- `Tab`. Focus leaves the menu. Menu stays closed.

Then open the **Firefox Accessibility panel** (DevTools → Accessibility). With the menu open, the panel should show the list as `menu`, each link as `menuitem`, the trigger as `button` with `expanded: true` and `controls: browse-list`. The names should be the visible text.

Then turn on VoiceOver (`Cmd+F5` on macOS) or NVDA. Tab to the trigger. VoiceOver should announce: "Browse, menu pop-up button, collapsed." Press `Enter`. It should announce "Browse, menu pop-up button, expanded" plus "Home, menu item, one of four." Move with `ArrowDown`: each item announces by name and position.

If any of those announcements is wrong, the markup is the first place to look. ARIA is the second.

## Hints

<details>
<summary>What is the difference between <code>role="menu"</code> and <code>role="navigation"</code>?</summary>

`role="navigation"` (which the `<nav>` element implies) describes a region of the page that contains links. It is a **landmark**. Screen readers offer a "jump to navigation" command for it. There is no keyboard contract beyond "Tab through the links."

`role="menu"` is a **widget**. It implies an application-like menu — the kind you might see in a desktop app's menu bar — with the keyboard contract from the Authoring Practices: arrow keys for movement, `Enter` to activate, `Escape` to close. The items are not in the tab order; the menu is.

A site navigation (Home, Pricing, Docs, Blog) is *almost always* better as `<nav>` containing `<ul>` containing `<a>` — no `role="menu"`. The choice we made for this exercise is unusual — using `role="menu"` for a navigation menu is the pattern this exercise *teaches*, but the Authoring Practices specifically suggest avoiding it for simple site navigation. We use it here because the exercise is about the keyboard model.

For the mini-project, the pattern is `role="listbox"`, which is the right pattern for a selection menu (e.g., a cuisine picker, a status picker).

</details>

<details>
<summary>Why <code>role="none"</code> on the <code>&lt;li&gt;</code>?</summary>

The `<li>` is a list-item element. To a screen reader navigating an `<ul>`, each `<li>` adds the "list item N of M" announcement. Inside a `role="menu"`, that announcement is wrong — the screen reader should announce "menu item N of M" via the role on the `<a>`, not "list item." `role="none"` (formerly `role="presentation"`) tells the accessibility tree to skip the `<li>` entirely, treating the `<a>` as a direct child of the `<ul>`/`<menu>` for accessibility purposes.

Per WAI-ARIA 1.2, §5.4. The list visually still renders as a list; the accessibility tree treats it as a flat menu.

</details>

<details>
<summary>The trigger's <code>aria-expanded</code> updates, but the screen reader does not seem to re-announce. Why?</summary>

`aria-expanded` is a *state* attribute. Screen readers announce its value when the trigger is focused — they do not re-announce when it changes while you are not focused on it. The expected behavior in this exercise is:

- Trigger focused → screen reader announces "Browse, button, collapsed."
- User clicks/presses Enter → menu opens, focus moves to the first item.
- Screen reader announces "Home, menu item, 1 of 4." (Note: it does *not* announce the trigger's state change — that is expected.)
- User presses Escape → menu closes, focus returns to trigger.
- Screen reader announces "Browse, button, collapsed."

The state announcement happens when focus returns to the trigger, not when the state changes mid-flight. That is correct per the spec.

</details>

## What "done" looks like

The menu works with the keyboard, end-to-end. The Firefox Accessibility panel shows the right roles and states. VoiceOver or NVDA announces correctly. axe DevTools is clean. The page passes the validator.

If all of that is green, commit and move on to the **mini-project**. The mini-project is the listbox variant of this exercise — same skeleton, different ARIA contract, plus a selection model.

## Stretch

If you finish early:

- Add **type-ahead**: while the menu is open, typing a letter moves focus to the next item whose name starts with that letter. The Authoring Practices document the expected behavior for this. Use a short timer (300ms) to handle multi-character input ("se" → "Settings").
- Implement **roving tabindex** properly: the focused item has `tabindex="0"`; the others have `tabindex="-1"`. Update on every focus change. This is the pattern the mini-project requires.
- Swap the pattern to **Submenu**: one of the menu items opens a nested menu. The keyboard contract grows; the Authoring Practices have the full spec.

Save stretches in `exercises/exercise-03-stretch/`.
