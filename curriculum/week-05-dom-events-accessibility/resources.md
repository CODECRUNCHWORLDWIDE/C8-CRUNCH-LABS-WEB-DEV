# Week 5 — Resources

Every resource here is **free** and **publicly accessible**.

## Primary sources

- **WHATWG DOM Living Standard** — the normative spec for the tree, the nodes, the events. The one source of truth when a browser implementation surprises you. <https://dom.spec.whatwg.org/>
- **HTML Living Standard — Interactive Elements (§4.11)** — `<details>`, `<dialog>`, the contenteditable surface. The HTML elements you will reach for before reaching for ARIA. <https://html.spec.whatwg.org/multipage/interactive-elements.html>
- **W3C WAI-ARIA 1.2** — the normative spec for roles, states, and properties. The shape of the accessibility tree. <https://www.w3.org/TR/wai-aria-1.2/>
- **W3C WAI-ARIA Authoring Practices** — the *how*, not the *what*: 80 component patterns with keyboard interactions, role assignments, and example markup. Read this whenever you build a custom widget. <https://www.w3.org/WAI/ARIA/apg/patterns/>
- **W3C Web Content Accessibility Guidelines (WCAG) 2.2** — the testable Success Criteria. Conformance level A is the minimum legally required in most jurisdictions; AA is the practical industry target. <https://www.w3.org/TR/WCAG22/>
- **W3C UI Events Specification** — the normative model for the event flow: capture, target, bubble. <https://www.w3.org/TR/uievents/>

## MDN reference (the friendly index)

- **MDN — Introduction to the DOM** — the orientation. <https://developer.mozilla.org/en-US/docs/Web/API/Document_Object_Model/Introduction>
- **MDN — Document** — every method on `document`. The most-used object in front-end JavaScript. <https://developer.mozilla.org/en-US/docs/Web/API/Document>
- **MDN — Element** — the methods every node you touch will inherit. <https://developer.mozilla.org/en-US/docs/Web/API/Element>
- **MDN — Node** — the parent of `Element`, `Text`, `Comment`, and `Document`. <https://developer.mozilla.org/en-US/docs/Web/API/Node>
- **MDN — `Document.querySelector`** — the modern query interface. <https://developer.mozilla.org/en-US/docs/Web/API/Document/querySelector>
- **MDN — `Document.querySelectorAll`** — the static `NodeList` returned. <https://developer.mozilla.org/en-US/docs/Web/API/Document/querySelectorAll>
- **MDN — `EventTarget.addEventListener`** — the listener interface every interactive element inherits. Read the `options` object section twice. <https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener>
- **MDN — Event** — the base class for every event in the platform. <https://developer.mozilla.org/en-US/docs/Web/API/Event>
- **MDN — Introduction to events** — the friendly tutorial. <https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Building_blocks/Events>
- **MDN — Manipulating documents** — the friendly tutorial on the DOM. <https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Client-side_web_APIs/Manipulating_documents>

## Querying and mutating

- **MDN — `Element.classList`** — the modern class API. `add`, `remove`, `toggle`, `replace`, `contains`. <https://developer.mozilla.org/en-US/docs/Web/API/Element/classList>
- **MDN — `Element.append`** — accepts strings as text nodes, accepts multiple arguments, returns nothing. The modern alternative to `appendChild`. <https://developer.mozilla.org/en-US/docs/Web/API/Element/append>
- **MDN — `Element.replaceChildren`** — the cleanest "wipe and replace" interface. <https://developer.mozilla.org/en-US/docs/Web/API/Element/replaceChildren>
- **MDN — `Element.closest`** — walk up the tree until a selector matches. The right tool for event delegation. <https://developer.mozilla.org/en-US/docs/Web/API/Element/closest>
- **MDN — `DocumentFragment`** — build a subtree off-document, append it in one mutation. The performance hack you reach for in `forEach`-render-loops. <https://developer.mozilla.org/en-US/docs/Web/API/DocumentFragment>
- **MDN — Security: `innerHTML`** — the XSS surface and the alternatives. <https://developer.mozilla.org/en-US/docs/Web/API/Element/innerHTML#security_considerations>

## Events and delegation

- **MDN — Event bubbling and capturing** — the diagram every junior developer should print and tape to the wall. <https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Building_blocks/Events#event_bubbling_and_capture>
- **MDN — Event delegation** — one listener for many children. <https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Building_blocks/Event_bubbling#event_delegation>
- **MDN — `AbortController`** — the modern way to remove an `addEventListener` without remembering the original callback reference. <https://developer.mozilla.org/en-US/docs/Web/API/AbortController>
- **MDN — Keyboard events** — `keydown`, `keyup`, `event.key`, `event.code`. Why `event.key` is what you want most of the time. <https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent>
- **MDN — Pointer events** — the unified pointer/mouse/touch model. <https://developer.mozilla.org/en-US/docs/Web/API/Pointer_events>

## Focus management

- **MDN — `:focus-visible`** — the focus indicator that respects the user's input modality. <https://developer.mozilla.org/en-US/docs/Web/CSS/:focus-visible>
- **MDN — `HTMLElement.focus`** — send focus to an element programmatically. <https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/focus>
- **MDN — `tabindex`** — the attribute that controls tab order. The rules: `0` to include, `-1` to exclude but allow programmatic focus, anything positive to break the page. <https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/tabindex>
- **MDN — `Document.activeElement`** — the currently focused element. <https://developer.mozilla.org/en-US/docs/Web/API/Document/activeElement>
- **WebAIM — Keyboard accessibility** — the canonical practical guide on tab order and focus management. <https://webaim.org/techniques/keyboard/>

## ARIA and accessibility

- **WAI-ARIA Authoring Practices — Disclosure** — the simplest pattern, the foundation for menus and dropdowns. <https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/>
- **WAI-ARIA Authoring Practices — Listbox** — the pattern the mini-project follows. <https://www.w3.org/WAI/ARIA/apg/patterns/listbox/>
- **WAI-ARIA Authoring Practices — Combobox** — a listbox + editable text input. Pattern most rich dropdowns implement. <https://www.w3.org/WAI/ARIA/apg/patterns/combobox/>
- **WAI-ARIA Authoring Practices — Menu Button** — the trigger pattern for an actual menu (with `<a href>` items, not selection items). <https://www.w3.org/WAI/ARIA/apg/patterns/menu-button/>
- **WAI-ARIA Authoring Practices — Dialog** — for modals; you will need it Week 6. <https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/>
- **The five rules of ARIA** — a single-page cheat sheet that ranks every ARIA decision. Start here every time. <https://www.w3.org/TR/using-aria/>
- **Inclusive Components by Heydon Pickering** — book-length, free web version, each chapter a real component. The "Menus & Menu Buttons" chapter alone is worth the week. <https://inclusive-components.design/>
- **a11y Project — Patterns** — pragmatic short reads on common ARIA patterns. <https://www.a11yproject.com/patterns/>

## WCAG (the testable criteria)

- **WCAG 2.2 — Quick Reference** — the practical filterable index. Filter by Level AA. <https://www.w3.org/WAI/WCAG22/quickref/>
- **WCAG 2.2 — Success Criterion 2.1.1 Keyboard** — every functionality is operable through a keyboard interface. Level A. <https://www.w3.org/WAI/WCAG22/Understanding/keyboard.html>
- **WCAG 2.2 — Success Criterion 2.4.7 Focus Visible** — any keyboard-operable user interface has a mode of operation where the keyboard focus indicator is visible. Level AA. <https://www.w3.org/WAI/WCAG22/Understanding/focus-visible.html>
- **WCAG 2.2 — Success Criterion 2.4.11 Focus Not Obscured (Minimum)** — new in 2.2: when an element receives focus, it is not entirely hidden by author-created content. Level AA. <https://www.w3.org/WAI/WCAG22/Understanding/focus-not-obscured-minimum.html>
- **WCAG 2.2 — Success Criterion 2.5.8 Target Size (Minimum)** — new in 2.2: targets are at least 24×24 CSS pixels. Level AA. <https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html>
- **WCAG 2.2 — Success Criterion 1.4.3 Contrast (Minimum)** — text has a contrast ratio of at least 4.5:1; large text 3:1. Level AA. <https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html>
- **WCAG 2.2 — Success Criterion 4.1.2 Name, Role, Value** — every UI component has a programmatically determinable name, role, and value. Level A. The single most often-violated criterion in custom widgets. <https://www.w3.org/WAI/WCAG22/Understanding/name-role-value.html>

## Screen readers (all free)

- **Apple — VoiceOver getting-started guide** — the screen reader on macOS and iOS. Turn on with `Cmd+F5` on macOS. <https://support.apple.com/guide/voiceover/welcome/mac>
- **NV Access — NVDA user guide** — the open-source Windows screen reader. Download free; read the keystrokes section. <https://www.nvaccess.org/files/nvda/documentation/userGuide.html>
- **GNOME — Orca user guide** — the screen reader of the free desktop. Ships with most Linux distributions. <https://help.gnome.org/users/orca/stable/>
- **Deque University — Screen reader testing keystrokes** — the cheat sheet for VoiceOver, NVDA, and JAWS side-by-side. <https://dequeuniversity.com/screenreaders/>

## Testing tools

- **axe DevTools (browser extension)** — the automated accessibility audit. Catches the 30% of accessibility issues a machine can catch. Install in Chrome or Firefox. <https://www.deque.com/axe/devtools/>
- **WAVE (browser extension)** — WebAIM's visual accessibility checker. Useful in parallel with axe. <https://wave.webaim.org/extension/>
- **Lighthouse — Accessibility audit** — built into Chrome DevTools. Subset of axe's checks. <https://developer.chrome.com/docs/lighthouse/accessibility/>
- **Firefox — Accessibility Inspector** — the best browser visualization of the accessibility tree. Open DevTools → Accessibility tab. <https://firefox-source-docs.mozilla.org/devtools-user/accessibility_inspector/>

## Talks and longer reads

- **"How A Blind Developer Uses Visual Studio Code" — Saqib Shaikh (Microsoft)** — 20 minutes that change how you think about tab order. <https://www.youtube.com/watch?v=ZflFTKsHpXA>
- **"Practical ARIA Examples" — Heydon Pickering** — short, pragmatic, demo-driven. <https://heydonworks.com/article/practical-aria-examples/>
- **"Using ARIA: Roles, States, and Properties" — Léonie Watson** — the canonical introduction by an industry leader and screen-reader user. <https://www.smashingmagazine.com/2014/07/declarative-applications-with-html/>
- **"The Accessibility Tree" — Surma & Hidde de Vries** — explainer on what screen readers see. <https://web.dev/the-accessibility-tree/>
- **"Designing accessible focus indicators" — Sara Soueidan** — focus rings done right. <https://www.sarasoueidan.com/blog/focus-indicators/>
- **"Accessible to all" — Google web.dev course** — free, well-structured, video + code. <https://web.dev/learn/accessibility/>

## Practice grounds

- **a11y Coffee** — bite-sized accessibility lessons. Five minutes apiece. <https://a11y.coffee/>
- **A11ycasts — Rob Dodson (Google Chrome team)** — short YouTube series, twenty episodes, each a single accessibility concept demonstrated. <https://www.youtube.com/playlist?list=PLNYkxOF6rcICWx0C9LVWWVqvHlYJyqw7g>
- **WebAIM — Screen Reader Testing tutorial** — your first thirty minutes with NVDA or VoiceOver. <https://webaim.org/articles/screenreader_testing/>
- **The A11y Project Checklist** — a pragmatic single-page checklist you can run through any component. <https://www.a11yproject.com/checklist/>

## Glossary

| Term | One-line definition |
|------|---------------------|
| **DOM** | The Document Object Model. The tree of nodes the browser builds from your HTML and exposes to JavaScript. Specified by the WHATWG DOM Living Standard. |
| **Node** | The base interface for every member of the tree. Subtypes include `Element`, `Text`, `Document`, `DocumentFragment`, `Comment`. |
| **Element** | A `Node` that corresponds to an HTML tag — `<div>`, `<button>`, `<a>`. Has attributes, classes, and an `innerHTML`. |
| **Text node** | A `Node` that holds character data — the literal text between tags. Has no attributes; you cannot style it directly. |
| **Static `NodeList`** | A snapshot of nodes returned by `querySelectorAll`. Does not update when the DOM changes. Iterable with `for...of`. |
| **Live `HTMLCollection`** | A reflection of nodes returned by `getElementsByClassName` or `getElementsByTagName`. Updates as the DOM changes; the source of subtle bugs. |
| **Event target** | The element on which an event originated (`event.target`), as distinct from the element a listener is attached to (`event.currentTarget`). |
| **Capture phase** | The first phase of event propagation: from `window` down through ancestors to the target. Per DOM §3.1. |
| **Bubble phase** | The third phase of event propagation: from the target back up through ancestors. Most listeners are attached to this phase by default. |
| **Event delegation** | One listener attached to a common ancestor that handles events for many descendants, using `event.target` plus `closest()` to dispatch. |
| **Focus order** | The sequence in which interactive elements receive focus when the user presses `Tab`. Matches DOM order by default; `tabindex` overrides it. |
| **Focus ring** | The visible outline that indicates which element has keyboard focus. Required by WCAG 2.2 SC 2.4.7. |
| **`tabindex="0"`** | Include this element in the natural tab order, even if it would not otherwise be focusable (e.g., a `<div>` acting as a button). |
| **`tabindex="-1"`** | Remove this element from the tab order, but allow programmatic `.focus()`. The right tool for items inside a managed widget like a listbox. |
| **ARIA** | Accessible Rich Internet Applications. A W3C spec that adds roles, states, and properties to HTML for assistive technology. |
| **Accessibility tree** | A parallel rendering of the page that screen readers consume. Built from the DOM plus ARIA attributes. Visible in Firefox's Accessibility panel. |
| **Screen reader** | Assistive software that reads the accessibility tree aloud and forwards keyboard input. VoiceOver, NVDA, JAWS, Orca, TalkBack. |
| **WCAG 2.2 AA** | Web Content Accessibility Guidelines, version 2.2, conformance level AA. The practical industry target; the legal floor in most jurisdictions. |
| **Success Criterion** | A testable WCAG requirement. Cited by number (e.g., SC 2.4.7). Each criterion has Level A, AA, or AAA. |
| **The five rules of ARIA** | 1: Don't use ARIA if a native HTML element will do. 2: Don't change native semantics. 3: All interactive ARIA controls must be keyboard accessible. 4: Don't use `role="presentation"` or `aria-hidden="true"` on focusable elements. 5: All interactive elements must have an accessible name. |
