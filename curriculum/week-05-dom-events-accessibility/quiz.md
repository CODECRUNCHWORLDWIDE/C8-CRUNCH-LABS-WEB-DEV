# Week 5 — Quiz

Ten questions. Lecture notes closed. Aim for 9/10.

---

**Q1.** Which specification is the normative source for the structure of the DOM tree?

- A) The ECMAScript Language Specification (ECMA-262)
- B) The WHATWG DOM Living Standard
- C) The W3C HTML 5 Recommendation
- D) The W3C WAI-ARIA 1.2 Specification

---

**Q2.** What is the difference between `document.querySelectorAll('.item')` and `document.getElementsByClassName('item')`?

- A) Both return a live `HTMLCollection`.
- B) Both return a static `NodeList`.
- C) `querySelectorAll` returns a static `NodeList`; `getElementsByClassName` returns a live `HTMLCollection` that updates as the DOM changes.
- D) `querySelectorAll` is faster but cannot use CSS combinators.

---

**Q3.** You write `element.innerHTML = '<p>Hello, ' + userName + '</p>'` where `userName` comes from a URL parameter. What is the risk?

- A) The string concatenation is slow.
- B) The element's existing children are removed.
- C) Cross-site scripting (XSS): if `userName` contains `<script>` or `onerror=...`, that markup is parsed and executed.
- D) The page reflows.

---

**Q4.** Per the DOM Living Standard, in what order do the three phases of event propagation occur?

- A) Bubble, target, capture
- B) Capture, target, bubble
- C) Target, bubble, capture
- D) There is only one phase; "capture" and "bubble" are aliases.

---

**Q5.** Inside a `click` listener attached to a parent `<ul>`, you write `const button = event.target.closest('button')`. What does `closest('button')` return when the user clicks on plain text outside any `<button>`?

- A) `undefined`
- B) `null`
- C) The nearest `<button>` anywhere in the document
- D) The `<ul>` itself

---

**Q6.** Which CSS pseudo-class should drive a focus indicator that appears only after keyboard navigation, not after a mouse click?

- A) `:focus`
- B) `:focus-within`
- C) `:focus-visible`
- D) `:hover`

---

**Q7.** A `<div>` is given `tabindex="-1"`. Which statement is true?

- A) It is included in the natural tab order at position -1 (before everything).
- B) It is removed from the tab order, but `element.focus()` still works.
- C) It throws an error; `tabindex` cannot be negative.
- D) It is hidden from screen readers.

---

**Q8.** Per the five rules of ARIA, which is the **first** rule?

- A) All interactive ARIA controls must be keyboard accessible.
- B) Don't use ARIA if a native HTML element with the required behavior already exists.
- C) Every interactive element must have an accessible name.
- D) Don't change native semantics.

---

**Q9.** Which WCAG 2.2 Success Criterion requires a visible keyboard focus indicator on every interactive control?

- A) SC 1.4.3 — Contrast (Minimum)
- B) SC 2.1.1 — Keyboard
- C) SC 2.4.7 — Focus Visible
- D) SC 4.1.2 — Name, Role, Value

---

**Q10.** You register a listener with `target.addEventListener('click', handler, { signal: controller.signal })`. How do you remove it?

- A) `target.removeEventListener('click', handler)`
- B) `controller.abort()`
- C) `controller.removeAllListeners()`
- D) The listener cannot be removed once attached with a `signal`.

---

## Answer key

<details>
<summary>Click to reveal</summary>

1. **B** — The **WHATWG DOM Living Standard** is the normative source for the DOM. ECMA-262 specifies the language, not the DOM. HTML 5 is a stale W3C name for a snapshot of the HTML Living Standard; the WHATWG documents are the live source.
2. **C** — `querySelectorAll` returns a static `NodeList` (a snapshot, taken at call time). `getElementsByClassName` returns a live `HTMLCollection` (it reflects DOM state, and updates as nodes are added or removed). The difference is the source of the classic "iteration removes only half the elements" bug.
3. **C** — XSS. Per the HTML Living Standard, `innerHTML` invokes the HTML parser; any tags inside the string become real elements. If `userName` is user-influenced, you have just given the user the ability to execute JavaScript in your origin's trust context. Use `textContent` or `element.append(string)`.
4. **B** — Capture, target, bubble. Per DOM Living Standard §3.1. Events travel from `window` down to the target (capture), reach the target, then travel back up (bubble).
5. **B** — `null`. `closest(selector)` walks up from the element looking for a match; if no ancestor matches, it returns `null`. This is the reason for the early-exit `if (!button) return;` pattern in event delegation.
6. **C** — `:focus-visible`. The browser decides when a focus indicator is warranted (typically keyboard navigation, not mouse clicks); the CSS pseudo-class matches in exactly those situations. Per CSS Selectors Level 4.
7. **B** — `tabindex="-1"` removes the element from the natural tab order but allows programmatic `.focus()`. This is the right tool for individual options inside a managed widget (a listbox option, a menu item). Per HTML Living Standard §6.6.
8. **B** — *Don't use ARIA if a native HTML element with the required behavior already exists.* Per W3C "Using ARIA," rule 1. The native `<button>`, `<a href>`, `<select>`, `<dialog>`, and `<details>` cover most needs without any ARIA at all.
9. **C** — SC 2.4.7 (Focus Visible), Level AA. Per WCAG 2.2: any keyboard-operable user interface has a mode of operation where the keyboard focus indicator is visible.
10. **B** — `controller.abort()`. `AbortController` is the modern way to remove listeners; one controller can manage multiple listeners. Per the DOM Living Standard's `addEventListener` definition, calling `abort()` on the signal removes every listener registered with it.

</details>

If under 7, re-read [Lecture 1](./lecture-notes/01-the-dom-tree-and-querying.md) and [Lecture 2](./lecture-notes/02-events-delegation-and-focus.md). If 9 or above, you are ready for the [homework](./homework.md).
