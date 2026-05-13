# Week 5 — The DOM, Events, and Accessibility

> *Four weeks in, your portfolio reflows from 320 px to 1440 px, the to-do list from Week 4 persists across reloads, and the JavaScript you wrote in Lecture 1 of last week is now a tool you reach for without flinching. This week the page learns to listen. By Sunday of Week 5 you will read and write the **Document Object Model** the way you read and write JavaScript: with the spec in one tab and DevTools in the other. You will query, mutate, and observe a tree of nodes; you will wire up events that delegate cleanly, handle focus the way the platform expects, and ship a custom dropdown that a blind user can drive end-to-end with the keyboard.*

Welcome back. Week 4 gave you the language. The console answered when you spoke to it; the to-do list remembered you across reloads. But the page itself — the one with your name, your projects, your typography from Week 2 — is still a static document that ignores everything you type at it. This week the page learns to listen.

The **Document Object Model** is the bridge. It is the spec that lets a JavaScript program look at the HTML the browser parsed and reach back into it: to add a node, remove one, watch a click happen, hand the keyboard to a focusable element, and announce a change to a screen reader. The DOM is not part of ECMAScript; it is a separate family of specifications maintained by the **WHATWG** and the **W3C**. The two we care about this week are the **DOM Living Standard** (the shape of the tree and the events that travel through it) and the **Accessible Rich Internet Applications** specification — **WAI-ARIA 1.2** — which gives us a vocabulary for the parts of the platform HTML alone cannot describe.

This week is the meeting point of three weeks of work. The HTML you wrote in Week 1 is the tree you query. The CSS you wrote in Week 2 is what your mutations restyle when you toggle a class. The JavaScript you wrote in Week 4 is the language that picks up the phone when a user clicks. Add one more ingredient — the **W3C Web Content Accessibility Guidelines 2.2 AA** — and the components you build start to behave the way working software is supposed to behave: for everyone, from a touchscreen, from a screen reader, from a keyboard alone.

By Sunday, your Week-3 site has an accessible custom dropdown menu on it, keyboard-navigable end-to-end, screen-reader-tested with VoiceOver or NVDA, axe-clean, and validator-clean. The dropdown looks like the platform native; it behaves like the platform native; it ships in 120 lines of HTML, CSS, and JavaScript you can read aloud.

---

## Learning objectives

By the end of this week, you will be able to:

- **Describe** the DOM as a tree of `Node` objects rooted at `document`, and name the four most common node types — `Element`, `Text`, `Document`, `DocumentFragment` — and what each is used for.
- **Query** the tree with `getElementById`, `querySelector`, and `querySelectorAll`, and explain why a static `NodeList` (from `querySelectorAll`) is preferable to a live `HTMLCollection` (from `getElementsByClassName`) in 95% of cases.
- **Mutate** the tree with `createElement`, `append`, `prepend`, `before`, `after`, `replaceChildren`, and `remove` — the modern, post-jQuery method set — and explain why you should never reach for `innerHTML` with untrusted strings.
- **Read and write** attributes (`getAttribute`, `setAttribute`, `toggleAttribute`), properties (`element.value`, `element.checked`), classes (`classList.add`, `classList.toggle`), and inline styles (`element.style.setProperty`), and know which of those four is the right interface for the job.
- **Wire up** a listener with `addEventListener`, with the modern `options` object (`once`, `passive`, `signal`), and explain the three phases of event propagation — capture, target, bubble — using the diagram from DOM §3.1.
- **Delegate** events. Attach one listener to a parent and use `event.target` plus `closest()` to dispatch correctly, even as children are added and removed.
- **Manage focus** as a feature: send focus to the right element after a route change, restore it correctly after a modal closes, build a custom widget that participates in tab order via `tabindex="0"`, and remove a non-interactive element from tab order via `tabindex="-1"`.
- **Apply** the **WAI-ARIA Authoring Practices** for the pattern you ship: roles, properties, and the keyboard interactions a screen-reader user will expect.
- **Test** a component with the keyboard alone (no mouse), with axe DevTools, and with at least one screen reader (VoiceOver on macOS, NVDA on Windows, Orca on Linux — all free).
- **Cite** WCAG 2.2 AA for any accessibility decision you defend: which Success Criterion the decision satisfies and at what conformance level.

---

## Prerequisites

You finished **Week 4 — JavaScript Fundamentals**. Concretely:

- A working `crunch-web-portfolio-<yourhandle>` repo with a Week-4 to-do list that persists to `localStorage`, splits across three ES modules, and reads under 200 lines end-to-end.
- You can write a closure on purpose, identify one when you see one, and explain which variables it captured.
- You can split a small program across `<script type="module">` files, served from Live Server.
- You can open DevTools, set a `debugger;` statement, and watch the call stack and scope chain in the Sources panel.

If the Week-4 to-do list is not done, go back. Week 5 takes that codebase and asks: how do we make every interaction on it accessible, keyboard-navigable, and screen-reader friendly? There is nothing to make accessible if there is nothing yet.

You will also need to be comfortable opening the **Elements panel** in DevTools. Open it now, on any page. Right-click an element on this README and choose "Inspect." The panel that opens is your most-used view this week — more than the Console, more than the Sources panel. The Elements panel is the DOM made visible.

---

## Topics covered

- The Document Object Model — what it is, who maintains it (WHATWG), how it relates to but is distinct from ECMAScript
- The DOM Living Standard — `Node`, `Element`, `Document`, `DocumentFragment`, `Text`, `Comment`
- The node tree — parents, children, siblings, the depth-first traversal order
- Querying — `getElementById`, `getElementsByClassName`, `getElementsByTagName`, `querySelector`, `querySelectorAll`
- Static `NodeList` versus live `HTMLCollection` — and the bug that lives in the difference
- Mutating the tree — `createElement`, `cloneNode`, `append`, `prepend`, `before`, `after`, `replaceChildren`, `replaceWith`, `remove`
- The four ways to change a node — attribute, property, class, inline style — and when each is right
- Reading the layout — `getBoundingClientRect`, `offsetWidth`, `clientHeight`, `scrollIntoView`
- The `innerHTML` trap — XSS, sanitization, and the `textContent` / `DOMParser` / `Sanitizer API` alternatives
- The event system — `addEventListener`, the `options` object, `removeEventListener`, `AbortController` and `signal`
- The three phases of propagation — capture, target, bubble — and `stopPropagation` versus `preventDefault`
- Event delegation — one listener on a parent, `event.target` plus `closest()` to dispatch
- The focus model — `:focus`, `:focus-visible`, `tabindex`, focus order, focus restoration
- The `keydown` / `keyup` / `keypress` family, and why `keypress` is deprecated
- Pointer events versus mouse events versus touch events — the unified Pointer Events spec
- ARIA — roles, states, properties; the five rules of ARIA; when not to use ARIA
- The WAI-ARIA Authoring Practices — common patterns (button, disclosure, listbox, combobox) and the keyboard contracts they document
- WCAG 2.2 AA — the practical conformance level: contrast, focus indicators, target size, keyboard operation
- Screen readers — VoiceOver, NVDA, Orca — what they announce, what they skip, how to test with each

## Tools you will need

| Tool                                  | Role                                                | Cost |
| ------------------------------------- | --------------------------------------------------- | ---- |
| **VS Code**                           | Editor                                              | Free |
| **Live Server** (VS Code extension)   | Required: ES modules need an HTTP origin            | Free |
| **A current Chrome or Firefox**       | The DOM engine and the Elements panel               | Free |
| **DevTools — Elements panel**         | The DOM made visible; inspect, edit, watch          | Free |
| **DevTools — Console panel**          | Your REPL for `document.querySelector` experiments  | Free |
| **DevTools — Accessibility panel**    | The accessibility tree (Firefox is best-in-class)   | Free |
| **axe DevTools** (browser extension)  | Automated accessibility audits                      | Free |
| **VoiceOver** (macOS, built in)       | The default screen reader on Apple platforms        | Free |
| **NVDA** (Windows)                    | The reference open-source screen reader             | Free |
| **Orca** (Linux)                      | The reference screen reader on the free desktop     | Free |

No Node, no npm, no bundler. The DOM, the event system, and `addEventListener` ship in every browser. The screen readers are free. The specs are free. The Elements panel has been there the entire time.

---

## Weekly schedule

The schedule below adds up to approximately **36 hours**. Treat it as a target. Focus management and keyboard interaction patterns take longer to internalize than the lectures suggest; budget extra hours toward Wednesday and Thursday.

| Day       | Focus                                          | Lectures | Exercises | Challenges | Quiz/Read | Homework | Mini-Project | Self-Study | Daily Total |
|-----------|------------------------------------------------|---------:|----------:|-----------:|----------:|---------:|-------------:|-----------:|------------:|
| Monday    | The tree, querying, mutating                   |    3h    |    2h     |     0h     |    0.5h   |   1h     |     0h       |    0.5h    |     7h      |
| Tuesday   | Events, delegation, the focus model            |    3h    |    2h     |     1h     |    0.5h   |   1h     |     0h       |    0h      |     7.5h    |
| Wednesday | Keyboard interaction and `:focus-visible`      |    0h    |    2h     |     1h     |    0.5h   |   1h     |     1h       |    0.5h    |     6h      |
| Thursday  | ARIA, the Authoring Practices, screen readers  |    0h    |    1h     |     1h     |    0.5h   |   1h     |     2h       |    0.5h    |     6h      |
| Friday    | Mini-project — build the dropdown              |    0h    |    1h     |     1h     |    0.5h   |   1h     |     2h       |    0.5h    |     6h      |
| Saturday  | Mini-project deep work + screen-reader testing |    0h    |    0h     |     0h     |    0h     |   1h     |     2h       |    0h      |     3h      |
| Sunday    | Quiz, polish, accessibility audit              |    0h    |    0h     |     0h     |    0.5h   |   0h     |     0h       |    0h      |     0.5h    |
| **Total** |                                                | **6h**   | **8h**    | **4h**     | **3h**    | **6h**   | **7h**       | **2h**     | **36h**     |

---

## How to navigate this week

| File | What is inside |
|------|----------------|
| [README.md](./README.md) | This overview |
| [resources.md](./resources.md) | MDN, the DOM Living Standard, WCAG 2.2, the ARIA Authoring Practices, screen-reader manuals |
| [lecture-notes/01-the-dom-tree-and-querying.md](./lecture-notes/01-the-dom-tree-and-querying.md) | The tree, the four common node types, querying with CSS selectors, mutating without `innerHTML`, the four interfaces (attribute, property, class, style) |
| [lecture-notes/02-events-delegation-and-focus.md](./lecture-notes/02-events-delegation-and-focus.md) | `addEventListener`, the three phases, delegation, focus management, the keyboard model, ARIA basics, the Authoring Practices |
| [exercises/README.md](./exercises/README.md) | Index of exercises |
| [exercises/exercise-01-query-and-mutate.md](./exercises/exercise-01-query-and-mutate.md) | Drills on querying and mutating a small page; no events yet |
| [exercises/exercise-02-event-delegation.md](./exercises/exercise-02-event-delegation.md) | Turn ten per-item listeners into one delegated listener; measure the difference |
| [exercises/exercise-03-keyboard-navigable-dropdown.md](./exercises/exercise-03-keyboard-navigable-dropdown.md) | Build the warm-up dropdown: a disclosure button + a list of links, keyboard-driven |
| [challenges/README.md](./challenges/README.md) | Index of weekly challenges |
| [challenges/challenge-01-aria-rich-listbox.md](./challenges/challenge-01-aria-rich-listbox.md) | Build an ARIA listbox following the Authoring Practices end-to-end |
| [quiz.md](./quiz.md) | 10 multiple-choice questions |
| [homework.md](./homework.md) | Six practice problems for the week |
| [mini-project/README.md](./mini-project/README.md) | An accessible custom dropdown with full keyboard navigation + screen-reader testing |

The recommended order:

1. Read both lectures (Monday–Tuesday).
2. Do the three exercises (Tuesday–Wednesday).
3. Take the quiz (Wednesday evening). If you score under 7, re-read.
4. Pick the challenge (Thursday).
5. Work through the homework problems alongside the mini-project (Thursday–Saturday).
6. Ship the mini-project (Saturday–Sunday).

---

## Stretch goals

If you finish early and want to push further, try any of these:

- Read the **WAI-ARIA Authoring Practices** end-to-end. It is a single document of around 80 patterns, each with the keyboard contract a user expects. Start with **Disclosure**, **Menu Button**, **Listbox**, **Combobox**, **Tabs**, and **Dialog**. <https://www.w3.org/WAI/ARIA/apg/patterns/>
- Read **WCAG 2.2** end-to-end — it is shorter than it looks once you skim past the A criteria. The 2.2 additions (focus appearance, dragging movements, target size, consistent help) are the ones most often missed. <https://www.w3.org/TR/WCAG22/>
- Watch **"How A Blind Developer Uses Visual Studio Code" by Saqib Shaikh** (Microsoft). Twenty minutes that change how you think about tab order forever. <https://www.youtube.com/watch?v=ZflFTKsHpXA>
- Open any popular site you use daily. Turn on VoiceOver (`Cmd+F5` on macOS) and try to use it without looking at the screen. You will discover failures you would not believe a shipped product could have. Take notes.
- Read **"Inclusive Components" by Heydon Pickering** — the free web version. Each chapter is an accessible component, end-to-end, with the reasoning. <https://inclusive-components.design/>
- Read the **WHATWG DOM Living Standard**, §3 (Events) and §4 (Nodes) — not all of it, just those two sections. The spec is friendlier than you expect. <https://dom.spec.whatwg.org/>

---

## What this week is NOT

A few things to set expectations:

- **Not a framework week.** No React, no Vue, no Svelte, no Lit, no Solid. We teach the platform. Frameworks come in Week 7 when there is a reason to reach for one.
- **Not a forms week.** Forms, validation, and autofill are Week 6. We touch `<input>` and `<button>` because we cannot avoid them; we do not cover form validation, error messaging, or constraint validation API.
- **Not an `async`/`await` week.** Every example this week is synchronous. `fetch`, Promises, and async patterns are Week 8.
- **Not a CSS-animations week.** Transitions, keyframes, and `prefers-reduced-motion` are Week 9. We will use CSS for focus rings and visible state changes; we will not animate.
- **Not a "use ARIA everywhere" lecture.** ARIA is a power tool. The first rule of ARIA is *don't use ARIA when a native HTML element will do.* We will be conservative; we will reach for ARIA when the platform genuinely lacks an element.
- **Not a comprehensive accessibility course.** WCAG 2.2 AA has 50+ Success Criteria. We focus on the ones that matter for interactive components: keyboard operation, focus visibility, name/role/value, color contrast. Week 11 audits the full surface.

---

## A word on the editorial voice

You will notice this week's lecture notes treat accessibility as a **feature**, not as a final-checklist item. That is on purpose. The keyboard model is part of how a component works, not something added after the visuals are done. The accessibility tree is a parallel rendering of your page that screen readers consume; making it correct is the same kind of work as making the visual rendering correct. Both happen up front, both happen continuously, and both are testable.

You will also notice we cite the **DOM Living Standard** and **WCAG** rather than MDN for normative claims. MDN is excellent and we link to it everywhere; the WHATWG and W3C specs are the source of truth when implementations diverge (which is rare, but happens — particularly with ARIA, where browsers and screen readers occasionally disagree). Learning to cite a Success Criterion by number is a frontend superpower: it lets you defend a decision in a code review the way a senior engineer does. "We need a visible focus indicator on every interactive control, per WCAG 2.2 AA Success Criterion 2.4.7" lands harder than "we should probably have focus rings, I think."

A final note: this week's mini-project is the first interaction-heavy component most people in this course will have ever shipped. Custom dropdowns are notorious for accessibility failures — they are easy to make look like the native control and very hard to make behave like one. We are going to build one that does both. It will be the first piece of your portfolio that a screen-reader user can use without friction. That is not a small thing.

---

## Up next

Continue to [Week 6 — Forms and Validation](../week-06/) once you have shipped the dropdown, every assertion in the homework passes, you have tested the mini-project with VoiceOver or NVDA, and you have read both lectures end-to-end at least twice.

---

*If you find errors in this material, please open an issue or send a PR. Future learners will thank you.*
