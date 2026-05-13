# Mini-Project — An accessible custom dropdown, keyboard-navigable, screen-reader tested

> Build a single-select custom dropdown — a styled, accessible replacement for `<select>` — using only HTML, CSS, and ES modules. No framework, no build tool, no npm. The component is a button that opens a listbox; the listbox is keyboard-driven end-to-end; the keyboard contract matches the WAI-ARIA Authoring Practices for the **Listbox** + **Combobox** patterns; the page passes the validator, passes axe DevTools, passes a deliberate VoiceOver / NVDA test, and ships with a written keyboard cheat sheet.

This is the synthesis of Week 5. You wrote queries and mutations in Lecture 1 and Exercise 1. You wrote delegated event listeners in Lecture 2 and Exercise 2. You wired a disclosure menu in Exercise 3. You met the listbox in the challenge. The mini-project assembles those parts into one shippable component.

**Estimated time:** 7 hours, spread across Thursday–Sunday.

---

## What you will build

A single-page demonstration site served from `mini-project/` in your Week 5 repo. The page contains one custom dropdown — a "Cuisine" selector with five options — sitting inside a form-like context. The component looks like a button until the user activates it, at which point a list of options appears with the active option visually highlighted. Selecting an option closes the list and updates the button's visible label.

The page uses the same typography tokens, the same color tokens, the same dark-mode rule, and the same focus-ring rule you wrote in Week 2. It is mobile-first (Week 3 muscle memory). The JavaScript is split across three small ES modules served with Live Server. No frameworks, no Tailwind, no bundler.

```text
┌──────────────────────────────────────────────────┐
│ ●●●    http://localhost:5500/mini-project/       │
├──────────────────────────────────────────────────┤
│                                                  │
│   ┌────────────────────────────────────────────┐ │
│   │  Find a restaurant                         │ │
│   │  ────────────────────────────────────      │ │
│   │                                            │ │
│   │  Cuisine                                   │ │
│   │  ┌──────────────────────────────┐ ▾        │ │
│   │  │ Italian                      │          │ │
│   │  └──────────────────────────────┘          │ │
│   │                                            │ │
│   │  Search                                    │ │
│   │  ┌──────────────────────────────┐          │ │
│   │  │ Pasta, pizza, ...            │          │ │
│   │  └──────────────────────────────┘          │ │
│   │                                            │ │
│   │  [ Search ]                                │ │
│   └────────────────────────────────────────────┘ │
│                                                  │
└──────────────────────────────────────────────────┘
```

Open the cuisine selector and it expands into a listbox:

```text
┌──────────────────────────────────────────────────┐
│ ●●●    http://localhost:5500/mini-project/       │
├──────────────────────────────────────────────────┤
│   ┌──────────────────────────────┐ ▴            │
│   │ Italian                      │              │
│   ├──────────────────────────────┤              │
│   │ ▸ Italian       (selected)   │ ← active     │
│   │   Japanese                   │              │
│   │   Thai                       │              │
│   │   Vietnamese                 │              │
│   │   Mexican                    │              │
│   └──────────────────────────────┘              │
└──────────────────────────────────────────────────┘
```

---

## Acceptance criteria

- [ ] The folder `mini-project/` exists at the top level of your Week 5 repo, with this final tree (or close):
  ```
  mini-project/
  ├── README.md
  ├── index.html
  ├── styles.css
  ├── main.js
  └── lib/
      ├── dropdown.js    ← the dropdown component (the bulk of the JS)
      ├── focus.js       ← focus helpers (focusFirst, focusNext, focusPrev, etc.)
      └── keys.js        ← key-name constants and a tiny matcher utility
  ```
- [ ] One `<script type="module" src="./main.js"></script>` tag in `index.html`. No other JS files referenced.
- [ ] All HTML and CSS conform to your Week 2 / Week 3 work — typography tokens, color tokens, dark mode via `prefers-color-scheme`, focus-visible rule, mobile-first layout. The dropdown should look like it belongs to your portfolio.

### Markup

- [ ] The dropdown's markup uses the **WAI-ARIA Authoring Practices — Listbox** pattern, with a `<button>` trigger:
  - The trigger is a `<button type="button">` with `aria-haspopup="listbox"`, `aria-expanded="false"` (when closed), and `aria-controls` pointing at the listbox's id.
  - The trigger has an accessible name composed of: the visible label (`Cuisine`) via `aria-labelledby`, plus the current value (`Italian`) as the button's text. Per WCAG 2.2 SC 4.1.2.
  - The listbox is a `<ul role="listbox">` with `aria-labelledby` pointing at the same label.
  - Each option is an `<li role="option">` with a unique id and an `aria-selected` attribute (true for the selected option, false otherwise).
  - The listbox uses `aria-activedescendant` to indicate the active option. (Alternative: roving tabindex. Either is acceptable; document your choice in the README.)
- [ ] The listbox is hidden when closed via the `hidden` attribute (not via `display: none` from JavaScript). This keeps the source of truth in the DOM, not in CSS.

### Interaction

- [ ] **Mouse / touch:**
  - Clicking the trigger opens the listbox. The previously-selected option is the active descendant.
  - Clicking an option selects it, closes the listbox, returns focus to the trigger.
  - Clicking outside the open listbox closes it (no selection change).
- [ ] **Keyboard, on the trigger:**
  - `Tab` reaches the trigger (it is in the natural tab order).
  - `Enter` or `Space` opens the listbox. Active descendant: the currently selected option.
  - `ArrowDown` opens the listbox and moves active descendant to the next option (or the first, if nothing is selected yet).
  - `ArrowUp` opens the listbox and moves active descendant to the previous option (or the last).
- [ ] **Keyboard, on the open listbox:**
  - `ArrowDown` / `ArrowUp` move the active descendant. No wrap at the ends — pressing `ArrowDown` on the last item is a no-op (or, optionally, *does* wrap; document the choice in the README).
  - `Home` / `End` move to first / last.
  - `Enter` selects the active descendant, closes the listbox, returns focus to the trigger.
  - `Space` does the same.
  - `Escape` closes the listbox without changing selection; returns focus to the trigger.
  - `Tab` closes the listbox (selecting the active descendant — this matches the Authoring Practices combobox-like variant; document your choice if you deviate), then continues to the next focusable page element.
- [ ] **Type-ahead:** with the listbox open, typing a letter moves the active descendant to the next option whose name starts with that letter. The buffer clears after 500 ms of no input.

### Accessibility

- [ ] **WCAG 2.2 SC 2.1.1 (Keyboard, Level A):** every interaction works with the keyboard alone. Verified by closing your trackpad and walking through every flow.
- [ ] **WCAG 2.2 SC 2.1.2 (No Keyboard Trap, Level A):** the keyboard can leave the dropdown by `Tab`, `Escape`, or `Shift+Tab` at all times. There is no state in which focus is trapped inside the listbox.
- [ ] **WCAG 2.2 SC 2.4.7 (Focus Visible, Level AA):** the trigger has a visible focus ring (via `:focus-visible`). The active option has a distinct visual highlight, with ≥ 3:1 contrast against the listbox background (SC 1.4.11, Non-text Contrast).
- [ ] **WCAG 2.2 SC 2.4.11 (Focus Not Obscured, Level AA, new in 2.2):** when the listbox opens, the trigger is not entirely obscured by it. (In practice: position the listbox just below the trigger, never on top of it.)
- [ ] **WCAG 2.2 SC 2.5.8 (Target Size Minimum, Level AA, new in 2.2):** each option is ≥ 24×24 CSS pixels.
- [ ] **WCAG 2.2 SC 4.1.2 (Name, Role, Value, Level A):** every interactive control has a programmatically determinable name, role, and value. Verified by opening Firefox's Accessibility panel and reading the tree.
- [ ] **Screen-reader test:** test with at least one of VoiceOver (macOS), NVDA (Windows), or Orca (Linux). Document the test in `mini-project/README.md`:
  - Which screen reader, which OS, which browser.
  - The exact phrases the screen reader announced when (1) the trigger received focus, (2) the listbox opened, (3) the user arrowed through options, (4) the user selected an option.
  - One thing the screen reader announced correctly. One thing you had to fix to make it announce correctly.

### Behavior

- [ ] **State as the source of truth:** an in-memory `state` object holds `{ open: boolean, selectedId: string, activeId: string }`. Every mutation goes through a single `setState` function that re-syncs the DOM. You do not maintain two parallel sources of truth (CSS class versus state object versus aria attribute — all three derive from one state object).
- [ ] **Form participation:** the dropdown's selected value is submittable. Either use a hidden `<input type="hidden" name="cuisine" value="...">` whose value updates with selection, or expose a `formData()` method that the form's `submit` handler reads. Document the choice in the README.
- [ ] **No globals:** every binding is declared inside a module. No `window.dropdown`, no implicit globals.

### Quality

- [ ] **Validator:** the page passes <https://validator.w3.org/nu/> with zero errors.
- [ ] **axe DevTools:** zero serious or critical issues.
- [ ] **Lighthouse Accessibility:** score ≥ 95.
- [ ] **No frameworks, no bundler, no npm.** One HTML, one CSS, four JS files served by Live Server.
- [ ] **README:** `mini-project/README.md` walks a reader through what the component does, how to run it, the screen-reader test you performed, and **two design decisions you would defend in a code review** (e.g., "I used `aria-activedescendant` rather than roving tabindex because…", "I chose to wrap at the ends because…").

---

## Suggested order of operations

### Phase 1 — Plan the state model (30 min)

Before any code, in `mini-project/README.md` write the **state schema** and the **action list**:

```js
/**
 * @typedef {Object} DropdownState
 * @property {boolean} open
 * @property {string} selectedId   the id of the option currently selected
 * @property {string} activeId     the id of the option visually highlighted
 */

/**
 * Actions (one function each, all mutate `state` and call `render`):
 *   open()
 *   close()
 *   select(id)        // selects, closes, returns focus to trigger
 *   setActive(id)     // changes active descendant, does not select or close
 *   moveActive(delta) // setActive to neighbor by ±1
 *   first()           // setActive to first
 *   last()            // setActive to last
 *   typeAhead(char)   // append to buffer, setActive to first match
 */
```

Decide the data — the five cuisines, their ids — and where they live (a `const CUISINES = [...]` array in `lib/dropdown.js`, or a `<template>` in the HTML, or a `<select>` you progressively enhance). Each option has the trade-offs documented in the lecture.

This phase is intentionally non-code. Once the schema is settled, the modules write themselves.

### Phase 2 — `lib/keys.js` and `lib/focus.js` (45 min)

`lib/keys.js` exports key-name constants (`KEY_DOWN = 'ArrowDown'`, etc.) and a tiny `matchKey` helper. Trivial; ten lines. The win is that your `keydown` handler reads in named keys, not in string literals.

`lib/focus.js` exports `focusFirst(container)`, `focusLast(container)`, `focusNext(container, from)`, and `focusPrev(container, from)` — each operating on options inside the listbox. Each returns the element that received focus, or `null` if none was available. These helpers will be reused in Week 6 (form-control focusing) and Week 7 (component composition).

### Phase 3 — `lib/dropdown.js` (2 h)

The bulk of the component. The module exports a single function:

```js
export function createDropdown({ root, label, options, initialId, onChange }) {
  // ... build markup, attach listeners, return public surface
  return { getValue, setValue, destroy };
}
```

The `destroy` function is the cleanup — it should `controller.abort()` an `AbortController` that owns every listener (the pattern from Lecture 2 §3). Calling `destroy()` removes the dropdown's listeners; the DOM remains.

The internal flow:

1. **Build the markup** — the trigger button, the listbox `<ul>`, the option `<li>` elements — using `document.createElement` and `append`. No `innerHTML`. Use `crypto.randomUUID()` for each option's id.
2. **Attach two listeners**, both via `AbortSignal`:
   - `click` on the dropdown root — handles trigger clicks and option clicks via `event.target.closest()`.
   - `keydown` on the dropdown root — routes by `event.key` and by whether the event is on the trigger or inside the listbox.
3. **A `setState(patch)` function** merges `patch` into `state`, then calls `render()`. The `render()` function reads `state` and applies the DOM updates:
   - `aria-expanded` on the trigger
   - `hidden` on the listbox
   - `aria-activedescendant` on the listbox
   - `aria-selected` on each option
   - `.is-active` class on the active option
   - Trigger's visible label (the selected option's text)
4. **Outside-click close** — a `click` listener on `document` (also via signal). If the click is outside the dropdown, close.

### Phase 4 — `main.js` (15 min)

The page's entry point. Imports `createDropdown` from `lib/dropdown.js`, instantiates one dropdown against the page's `<div id="cuisine">` root, and wires its `onChange` to a `<form>` submit handler.

### Phase 5 — Styles (1 h)

Visual treatment of:
- The trigger button (a styled `<button>` matching the page's design tokens).
- The listbox (a card with shadow, sitting just below the trigger, positioned with absolute or fixed positioning).
- The active option (background highlight, ≥ 3:1 contrast — measure with the DevTools contrast checker).
- The selected option (a checkmark or a distinct color, visible without color alone — also a font-weight change, per SC 1.4.1 Use of Color).
- The focus-visible outline on the trigger and on the listbox.
- The mobile layout (≥ 24px option height, padding generous enough for thumb taps, per SC 2.5.8).

### Phase 6 — Screen-reader test (1 h)

The last hour. The test you cannot skip. Turn on VoiceOver (`Cmd+F5` on macOS), NVDA (free download for Windows), or Orca (`Alt+Super+S` on most Linux desktops).

Walk through every interaction in the **Behavior** section above, in order, taking notes on what is announced. Most of the failures you find here will be ARIA issues — a missing `aria-labelledby`, a wrong `role`, a `tabindex` that traps focus. Fix each, retest, repeat.

The expected baseline announcement sequence:

1. Trigger focused: **"Cuisine, Italian, listbox pop-up, button, collapsed."**
2. Press `Enter`: **"Cuisine, listbox, five items, Italian, selected, one of five."**
3. Press `ArrowDown`: **"Japanese, two of five."**
4. Press `Enter`: **"Cuisine, Japanese, listbox pop-up, button, collapsed."** (focus is back on the trigger; the trigger's label has updated)

Wording varies by screen reader. The *shape* of the announcement — role, name, state, position — must be correct everywhere.

### Phase 7 — README + commit (30 min)

Write the README. The two-decisions-you-would-defend section is the most important part of the document; spend on it.

Run the validator, axe, and Lighthouse one more time. Commit. Push. Ship.

---

## Keyboard cheat sheet (paste this in your README)

| Key | When | Behavior |
|-----|------|----------|
| `Tab` | Anywhere | Reach the trigger. Then leave the component. |
| `Enter`, `Space` | On trigger | Open the listbox. |
| `ArrowDown` | On trigger | Open the listbox; focus moves to next option (or first). |
| `ArrowUp` | On trigger | Open the listbox; focus moves to previous option (or last). |
| `ArrowDown` | In open list | Move active descendant down. |
| `ArrowUp` | In open list | Move active descendant up. |
| `Home` | In open list | Move active to first option. |
| `End` | In open list | Move active to last option. |
| `Enter`, `Space` | In open list | Select active, close, return focus to trigger. |
| `Escape` | In open list | Close without selecting; return focus to trigger. |
| `Tab` | In open list | Close (with selection); continue tabbing. |
| Letter | In open list | Type-ahead to next match. |

---

## What "done" looks like

The dropdown works with the keyboard alone. The screen reader announces every state correctly. The Firefox Accessibility panel shows clean roles, names, and states. The trigger button looks like a button. The listbox looks like a listbox. The component fits into your portfolio's typography and color tokens. axe is clean. Lighthouse accessibility ≥ 95. The page passes the validator. Your README defends two design decisions with citations to either the Authoring Practices or a WCAG Success Criterion.

When all of that is true, push to GitHub and tag the commit `v0.5.0`. Continue to [Week 6 — Forms and Validation](../../week-06/).

---

## Stretch (any one of these earns "deep dive" credit)

- **Combobox variant.** Add a text input above the listbox that filters the visible options as the user types. The pattern is the WAI-ARIA Authoring Practices **Combobox**. The keyboard contract grows; the announcement model grows. This is the canonical "autocomplete" widget.
- **Multi-select variant.** Add `aria-multiselectable="true"` and support `Space` to toggle individual options without closing the listbox. The Authoring Practices document the full keyboard contract.
- **Async options.** Load the options list from a JSON file via `fetch` (Week 8 spoiler, but the read pattern is one line). Show a loading state with `aria-busy="true"`. Handle the network-error case visibly.
- **Mobile-native fallback.** On a touch device, render a native `<select>` instead of the custom widget. Detect via `'ontouchstart' in window` or via a media query plus matchMedia. Document the trade-off.

Save stretches in `mini-project-stretch/`, not in the main mini-project folder. The mini-project itself should be small and complete.

---

*If you find errors in this material, please open an issue or send a PR. Future learners will thank you.*
