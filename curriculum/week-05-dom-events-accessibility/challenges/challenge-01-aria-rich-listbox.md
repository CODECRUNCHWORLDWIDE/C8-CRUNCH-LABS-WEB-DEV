# Challenge 1 — ARIA-rich listbox

**Time estimate:** ~140 minutes.

## Problem statement

Build a single-select listbox component, following the **WAI-ARIA Authoring Practices — Listbox** pattern end-to-end. The component is a self-contained replacement for `<select>` — same role in a form, same selection model — but styled to your visual specification. It is keyboard-navigable, screen-reader friendly, supports type-ahead, implements roving tabindex correctly, restores focus on close, and ships with a written keyboard contract you can hand a QA tester.

This is the **scoped-down rehearsal** for the mini-project. The mini-project is the same pattern wrapped in a button-trigger (a *combobox-like* shape — trigger collapsed by default, list opens on activate). The challenge is the listbox without the trigger: the listbox is always visible, the keyboard contract is exactly the Authoring Practices listbox spec, and you focus the listbox itself rather than a trigger.

```text
┌──────────────────────────────────────────────────┐
│ ●●●    http://localhost:5500/                    │
├──────────────────────────────────────────────────┤
│                                                  │
│   Pick a cuisine                                  │
│   ┌────────────────────────────────┐              │
│   │ ▸ Italian                      │              │
│   │   Japanese                     │              │
│   │   Thai                         │              │
│   │   Vietnamese                   │              │
│   │   Mexican                      │              │
│   └────────────────────────────────┘              │
│   Tab leaves. Enter (or Space) selects.           │
│                                                   │
└──────────────────────────────────────────────────┘
```

Reference: <https://www.w3.org/WAI/ARIA/apg/patterns/listbox/> and the example *Scrollable Listbox Example* on that page.

## Acceptance criteria

- [ ] Folder: `challenges/challenge-01/`, with `index.html`, `styles.css`, `listbox.js`, and `NOTES.md`.
- [ ] One `<script type="module" src="./listbox.js"></script>` tag.
- [ ] The listbox has `role="listbox"`, `aria-labelledby` pointing at a visible `<label>`, and `tabindex="0"`. The listbox itself is in the tab order; the options are not.
- [ ] Each option has `role="option"`, a unique id, and `tabindex="-1"`.
- [ ] **Selection** is conveyed by `aria-selected="true"` on the selected option; `aria-selected="false"` on the others. Exactly one option is selected at any time. A CSS rule styles the selected option visibly (≥ 3:1 contrast against the unselected background, per SC 1.4.11).
- [ ] **Active descendant**: the listbox has `aria-activedescendant` pointing at the id of the option that currently has visual focus (an outline or a background highlight). This is the **active-descendant pattern** from the Authoring Practices — an alternative to roving tabindex. Either implementation is acceptable; document which one you chose in NOTES.md.
- [ ] **Keyboard contract** (test each by closing your trackpad):
  - `Tab` reaches the listbox.
  - `ArrowDown` / `ArrowUp` move the active descendant; the visual focus updates; the announcement updates (the screen reader reads the new option).
  - `Home` / `End` move to the first / last option.
  - `Enter` or `Space` selects the active descendant (updates `aria-selected`).
  - `Tab` leaves the listbox to the next page element.
  - **Type-ahead**: typing a letter moves the active descendant to the next option whose name starts with that letter. Multi-character (`"se"` → "Settings") supported within a 500 ms window.
- [ ] **Focus indicator**: a visible `:focus-visible` outline on the listbox itself; a visible "active descendant" highlight on the active option. The two are distinct.
- [ ] **Mobile-first**: layout works at 320 px viewport. Each option is ≥ 24 × 24 CSS pixels (SC 2.5.8, Target Size Minimum).
- [ ] **axe DevTools**: zero serious or critical issues.
- [ ] **Validator**: zero errors.
- [ ] **NOTES.md**: a 200-word explanation of which Authoring Practices implementation choice you made (roving tabindex versus aria-activedescendant), the WCAG Success Criteria you tested against, and one design decision you would defend in a code review.

## Suggested order of operations

### Phase 1 — Markup (20 min)

Type the HTML by hand. Use the right roles and attributes from the outset; do not retrofit them. The base markup the Authoring Practices document for a single-select listbox is roughly:

```html
<label id="cuisine-label">Pick a cuisine</label>
<ul id="cuisine-listbox"
    role="listbox"
    aria-labelledby="cuisine-label"
    tabindex="0"
    aria-activedescendant="cuisine-italian">
  <li role="option" id="cuisine-italian"  aria-selected="true">Italian</li>
  <li role="option" id="cuisine-japanese" aria-selected="false">Japanese</li>
  <li role="option" id="cuisine-thai"     aria-selected="false">Thai</li>
  <li role="option" id="cuisine-viet"     aria-selected="false">Vietnamese</li>
  <li role="option" id="cuisine-mexican"  aria-selected="false">Mexican</li>
</ul>
```

Run the validator. Run axe. Both should pass with zero errors before any JavaScript runs.

### Phase 2 — The active-descendant model (30 min)

Hold a single piece of state in JavaScript: `activeId`. On any keyboard event, derive the new `activeId`, then update the listbox's `aria-activedescendant` attribute. Update a CSS class (`.is-active`) on the active option for visible highlight. Do **not** call `.focus()` on the options — the listbox itself keeps focus the entire time.

```js
function setActive(id) {
  activeId = id;
  listbox.setAttribute('aria-activedescendant', id);
  for (const opt of listbox.querySelectorAll('[role="option"]')) {
    opt.classList.toggle('is-active', opt.id === id);
  }
}
```

This is the active-descendant pattern. The alternative — roving tabindex — moves real focus among the options. Either is acceptable per the Authoring Practices; this challenge defaults to active-descendant because it composes more cleanly with the mini-project's trigger pattern.

### Phase 3 — Keyboard and type-ahead (30 min)

One `keydown` listener on the listbox. Route on `event.key`:

```js
listbox.addEventListener('keydown', (event) => {
  const options = Array.from(listbox.querySelectorAll('[role="option"]'));
  const currentIndex = options.findIndex(o => o.id === activeId);
  let nextIndex = currentIndex;

  switch (event.key) {
    case 'ArrowDown': nextIndex = Math.min(currentIndex + 1, options.length - 1); break;
    case 'ArrowUp':   nextIndex = Math.max(currentIndex - 1, 0);                  break;
    case 'Home':      nextIndex = 0;                                              break;
    case 'End':       nextIndex = options.length - 1;                             break;
    case 'Enter':
    case ' ':         selectActive(); event.preventDefault(); return;
    default:
      if (event.key.length === 1) { typeAhead(event.key); return; }
      return;
  }

  event.preventDefault();
  if (nextIndex !== currentIndex) setActive(options[nextIndex].id);
});
```

`event.preventDefault()` on the arrow keys, `Home`, and `End` is essential — without it, the browser will scroll the page.

`typeAhead(char)` appends to a buffer; if no key is pressed for 500 ms, the buffer clears. After each append, search for the first option whose visible text (case-insensitively) starts with the buffer; `setActive` to it.

### Phase 4 — Selection and announcement (15 min)

`selectActive()` updates `aria-selected` on every option (true for the active one, false for the rest), and re-styles the selected option (a distinct visual treatment from "active" — the active option is the one your arrow keys are on; the selected option is the one chosen). The two states can coexist on the same option.

Announce the change via a polite live region, or trust that `aria-selected` is enough (most screen readers announce a selection change on a focused listbox). Document which you chose in NOTES.md, and why.

### Phase 5 — Test (15 min)

The keyboard test, the screen-reader test, the axe test — all three. Then walk a peer through the listbox; ask them to use it without a mouse; watch where they get stuck. The stuck-points are the things to fix.

## What "done" looks like

You can navigate the listbox with the keyboard alone. VoiceOver or NVDA announces "Cuisine, listbox, 5 items" on focus, then announces each option as you arrow through. `Enter` selects; the change is announced. Tab leaves; the listbox stays selected. axe and the validator are clean.

This is the foundation of the mini-project. The mini-project wraps this listbox in a button trigger, but the listbox's keyboard model and ARIA pattern carry through unchanged.

## Stretch

If you finish early, implement the **multi-select** variant: `aria-multiselectable="true"` on the listbox, `Shift+ArrowDown` extends selection, `Ctrl+Space` toggles, `Ctrl+A` selects all. The Authoring Practices document the full contract.

Save the multi-select version in `challenges/challenge-01-stretch/`.
