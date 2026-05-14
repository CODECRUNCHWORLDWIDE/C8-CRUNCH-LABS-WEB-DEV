# Week 6 — Forms and Validation

> *Five weeks in, your portfolio renders cleanly from 320 px to 1440 px, a custom dropdown answers the keyboard the way the native one does, and a screen reader reads your component aloud without surprises. This week the page learns to **collect input**. By Sunday of Week 6 you will read and write the **HTML Living Standard's form sections** the way you read and write the DOM: the spec in one tab, the form in the other. You will pick the right `<input>` type for each piece of data, configure HTML5 constraint attributes the browser already enforces, layer a JavaScript validation pass on top for the rules HTML alone cannot express, and ship a multi-step signup form whose error messaging an assistive-technology user can hear, navigate, and recover from — per WCAG 2.2 Success Criterion 3.3.1 (Error Identification) and 3.3.3 (Error Suggestion).*

Welcome back. Week 5 gave you the listening page. The page answered when the user pressed a key; the dropdown remembered which option was selected; the focus ring landed where the WAI-ARIA Authoring Practices said it should. But the page still has nothing to *say back* — the user has not yet been asked for anything other than which cuisine they prefer. This week the page learns to collect.

The **HTML form** is the oldest interactive surface on the web. It predates JavaScript. The first `<form>` element shipped in **HTML 2.0 in 1995**, alongside `<input>`, `<select>`, and `<textarea>`. Thirty years later, the form is still the way most websites take input from most users: signup, login, checkout, search, comments, settings, support requests. The spec that defines it — the **HTML Living Standard, §4.10 Forms** — is one of the longest and most carefully-engineered sections of the platform. The reason is that forms are where users *commit*. A click on a button is reversible. A submitted form, for a great many sites, is not.

Forms are also where most accessibility audits go wrong. Per the **WebAIM Million** report — an annual automated scan of the top one million home pages — empty form labels and missing form labels together account for around **half of all detectable accessibility issues on the web**. The cause is not malice; it is that forms are treated as a styling problem (make the input look nice) rather than as an information-architecture problem (each control needs a name, a role, a value, and a way to convey errors). This week we fix that habit before it forms.

The **Constraint Validation API** — defined in the HTML Living Standard, §4.10.21 — is the platform's answer to the "is this input valid?" question. Every `<input>`, `<select>`, and `<textarea>` carries a `ValidityState` object the browser computes from your HTML5 constraint attributes (`required`, `type="email"`, `minlength`, `pattern`, `min`, `max`, `step`). You read the object; you call `setCustomValidity()` to register messages the platform owns; you display errors associated with each field via `aria-describedby` so a screen reader announces them at the right moment. The whole pattern is in the spec. We are going to follow the spec.

By Sunday, the same portfolio you have been growing for five weeks has a multi-step signup form attached: three steps, ten fields, real-time inline validation, accessible error summaries, autofill that works, server-style submission via the platform's `FormData` interface, and a keyboard contract that lets a user without a mouse complete the form end-to-end. The form looks like it belongs to your portfolio; it behaves like a form the platform built; it is roughly 200 lines of JavaScript and a stylesheet that reads on one screen.

---

## Learning objectives

By the end of this week, you will be able to:

- **Describe** the HTML form model as defined in the **HTML Living Standard §4.10**: the `<form>` element, its content categories (`category-form-associated`, `category-listed`, `category-submittable`, `category-resettable`, `category-autocapitalize-inheriting`), and the algorithm the browser runs when the form is submitted.
- **Choose** the right `<input>` type for every piece of data: `email`, `tel`, `url`, `number`, `date`, `time`, `password`, `search`, `color`, `range`, plus the long-form text controls (`<textarea>`) and the selection controls (`<select>`, `<input type="radio">`, `<input type="checkbox">`).
- **Label** every control programmatically — with `<label for>`, `aria-labelledby`, or `aria-label`, in that order of preference — so the accessibility tree carries a name for every interactive element. Per WCAG 2.2 SC 1.3.1 (Info and Relationships) and SC 4.1.2 (Name, Role, Value).
- **Configure** HTML5 constraint attributes — `required`, `minlength`, `maxlength`, `pattern`, `min`, `max`, `step`, `type` — and explain which `ValidityState` flag each one sets when the input is invalid.
- **Read** the `ValidityState` interface: `valueMissing`, `typeMismatch`, `patternMismatch`, `tooShort`, `tooLong`, `rangeUnderflow`, `rangeOverflow`, `stepMismatch`, `badInput`, `customError`. Understand which flag fires for which constraint and use the union (`valid` is true when every flag is false).
- **Layer** a JavaScript validation pass on top of HTML5. Express the rules HTML cannot — cross-field rules ("password confirmation must match"), async rules ("this email is already registered"), and complex regex rules ("the username must not contain reserved words") — using `setCustomValidity()` so the browser surfaces them through the same `ValidityState` interface.
- **Display** error messages inline, associated with each field via `aria-describedby` and `aria-invalid`, so the screen reader announces the message the moment focus reaches the field. Per the WAI-ARIA 1.2 specification and WCAG 2.2 SC 3.3.1 (Error Identification, Level A) and SC 3.3.3 (Error Suggestion, Level AA).
- **Manage** autofill: set the `autocomplete` attribute on every relevant input per the HTML Living Standard §4.10.18.7 (Autofill) so the browser can fill the field for the user. Understand the difference between *autocomplete tokens* (`given-name`, `family-name`, `email`, `tel`, `street-address`, etc.) and the on/off shorthand.
- **Submit** a form without writing a `fetch` call this week. Use `event.preventDefault()` to keep the page; read the entries with `new FormData(form)`; iterate with `for (const [key, value] of formData)`. Week 8 connects this to a real backend; today the receiver is a `console.log`.
- **Build** a multi-step form: state for the current step, validation that runs per step (not per submit), focus management when moving between steps (focus the heading of the new step), and a visible progress indicator with `aria-current="step"`.
- **Cite** WCAG 2.2 Success Criteria for any form-accessibility decision you defend: SC 1.3.1 (Info and Relationships), SC 1.3.5 (Identify Input Purpose), SC 3.3.1 (Error Identification), SC 3.3.2 (Labels or Instructions), SC 3.3.3 (Error Suggestion), SC 3.3.4 (Error Prevention — legal/financial/data), and SC 4.1.2 (Name, Role, Value).

---

## Prerequisites

You finished **Week 5 — The DOM, Events, and Accessibility**. Concretely:

- A working `crunch-web-portfolio-<yourhandle>` repo with a Week-5 accessible dropdown that passes the validator, passes axe DevTools, and was tested with a screen reader (VoiceOver, NVDA, or Orca).
- You can wire an event listener with the modern `{ once, passive, signal }` options object and tear it down via `AbortController`.
- You can delegate one listener to many descendants using `event.target.closest()` and a `data-action` attribute.
- You can manage focus deliberately: send it to a specific element after a state change, restore it after a modal closes, include or exclude elements from tab order with `tabindex`.
- You can cite at least three WCAG 2.2 Success Criteria by number (2.1.1 Keyboard, 2.4.7 Focus Visible, 4.1.2 Name Role Value) and explain what each requires.

If the Week-5 dropdown is not shipped, go back. Week 6 takes the same `addEventListener` + `closest` + focus-management muscle you built last week and points it at a new surface: the form. There is nothing to validate if you have not yet learned to listen.

You will also need to be comfortable opening the **Network panel** in DevTools — not because we fetch this week (we do not — that is Week 8), but because the platform submits a form by serializing its fields and issuing a request; watching that request happen in the Network panel makes the form's behavior concrete. Open the panel now, on any login page. Submit the form deliberately. Watch the request body. The DOM is one half of how a browser talks to a user; the form submission is the other half.

---

## Topics covered

- The HTML form model — `<form>`, its `action`, `method`, `enctype`, `novalidate`, `target`, and `autocomplete` attributes; the submission algorithm per HTML Living Standard §4.10.21.3
- Form-associated elements — `<input>`, `<select>`, `<textarea>`, `<button>`, `<output>`, `<fieldset>`, `<legend>`; the categories the spec assigns to each
- Every `<input>` type — `text`, `email`, `tel`, `url`, `password`, `number`, `range`, `date`, `time`, `datetime-local`, `month`, `week`, `color`, `search`, `file`, `hidden`, `checkbox`, `radio`, `submit`, `reset`, `image`, `button`
- Labeling — `<label for>`, implicit labeling by wrapping, `aria-labelledby`, `aria-label`; when each is right; why a placeholder is never a label
- Grouping — `<fieldset>` and `<legend>` for radio groups, checkbox groups, and address-style multi-field sections
- HTML5 constraint attributes — `required`, `minlength`, `maxlength`, `pattern`, `min`, `max`, `step`, and the `type` attribute's implicit constraints (`type="email"` requires an `@`; `type="url"` requires a scheme)
- The **Constraint Validation API** — `element.validity`, `element.checkValidity()`, `element.reportValidity()`, `form.checkValidity()`, `setCustomValidity()`, the `:valid` and `:invalid` CSS pseudo-classes, the `:user-valid` and `:user-invalid` pseudo-classes (new in 2023)
- The `ValidityState` interface — every flag, what triggers it, how to translate it to a human-readable error message
- The `invalid` event — fires on each invalid field when the form is submitted; non-bubbling by default; `event.preventDefault()` suppresses the native validation bubble
- Custom validation — when HTML5 is not enough, when to reach for JavaScript, when to keep the validation in the markup
- The accessibility model of errors — `aria-invalid`, `aria-describedby`, `aria-errormessage` (a newer alternative — discussion of when each is appropriate), the error summary pattern, live regions for async errors
- Autofill — the `autocomplete` attribute, the token list from the HTML Living Standard, why "off" is rarely the right answer, the `name` versus `autocomplete` distinction
- Form submission — `event.preventDefault()`, `new FormData(form)`, iterating entries, the `submitter` property on the `SubmitEvent`, multiple submit buttons
- Multi-step forms — state model, focus on step change, validation per step, progress indication with `aria-current="step"`
- WCAG 2.2 form criteria — SC 1.3.1, SC 1.3.5, SC 3.3.1, SC 3.3.2, SC 3.3.3, SC 3.3.4, SC 4.1.2 — each one cited by number

## Tools you will need

| Tool                                  | Role                                                | Cost |
| ------------------------------------- | --------------------------------------------------- | ---- |
| **VS Code**                           | Editor                                              | Free |
| **Live Server** (VS Code extension)   | Required: ES modules need an HTTP origin            | Free |
| **A current Chrome or Firefox**       | The form rendering engine and DevTools              | Free |
| **DevTools — Elements panel**         | Inspect `aria-invalid`, `aria-describedby`, the validity state | Free |
| **DevTools — Network panel**          | Watch the submission request and its `FormData` body | Free |
| **DevTools — Accessibility panel**    | Confirm every input has a programmatic name         | Free |
| **axe DevTools** (browser extension)  | Automated accessibility audits                      | Free |
| **VoiceOver** (macOS, built in)       | Test that error messages are announced              | Free |
| **NVDA** (Windows)                    | Test that error messages are announced              | Free |
| **The HTML Living Standard**          | The normative spec for every form attribute         | Free |

No backend this week. No `fetch`. No npm. The form, the validation, the autofill, the error model — all of it ships in every browser. The receiver of your submission is `console.log`. Week 8 wires the same form to a real network.

---

## Weekly schedule

The schedule below adds up to approximately **36 hours**. Treat it as a target. Error messaging and accessible inline errors take longer to internalize than the lectures suggest; budget extra hours toward Thursday and Friday.

| Day       | Focus                                          | Lectures | Exercises | Challenges | Quiz/Read | Homework | Mini-Project | Self-Study | Daily Total |
|-----------|------------------------------------------------|---------:|----------:|-----------:|----------:|---------:|-------------:|-----------:|------------:|
| Monday    | Form semantics, every input type, labeling     |    3h    |    2h     |     0h     |    0.5h   |   1h     |     0h       |    0.5h    |     7h      |
| Tuesday   | HTML5 constraints, the Constraint Validation API |  3h    |    2h     |     0h     |    0.5h   |   1h     |     0h       |    0h      |     6.5h    |
| Wednesday | JS validation layer, custom rules, async checks |   0h    |    2h     |     1h     |    0.5h   |   1h     |     1h       |    0.5h    |     6h      |
| Thursday  | Error messaging, ARIA, autofill, focus on errors |  0h    |    1h     |     1h     |    0.5h   |   1h     |     2h       |    0.5h    |     6h      |
| Friday    | Mini-project — build the multi-step form        |   0h    |    1h     |     0h     |    0.5h   |   1h     |     2h       |    0.5h    |     5h      |
| Saturday  | Mini-project deep work + screen-reader testing  |   0h    |    0h     |     0h     |    0h     |   1h     |     2h       |    0h      |     3h      |
| Sunday    | Quiz, polish, accessibility audit               |   0h    |    0h     |     0h     |    0.5h   |   0h     |     2h       |    0h      |     2.5h    |
| **Total** |                                                | **6h**   | **8h**    | **2h**     | **3h**    | **6h**   | **9h**       | **2h**     | **36h**     |

---

## How to navigate this week

| File | What is inside |
|------|----------------|
| [README.md](./README.md) | This overview |
| [resources.md](./resources.md) | The HTML Living Standard form sections, MDN's Constraint Validation API guide, WCAG 2.2, the WHATWG forms FAQ |
| [lecture-notes/01-html5-form-semantics.md](./lecture-notes/01-html5-form-semantics.md) | The `<form>` element, every input type, labeling correctly, grouping with `<fieldset>`, the `autocomplete` attribute, HTML5 constraint attributes |
| [lecture-notes/02-validation-error-messaging-autofill.md](./lecture-notes/02-validation-error-messaging-autofill.md) | The Constraint Validation API, `ValidityState`, the `invalid` event, custom validation in JS, inline error messaging with `aria-invalid` and `aria-describedby`, the error-summary pattern, autofill in depth |
| [exercises/README.md](./exercises/README.md) | Index of exercises |
| [exercises/exercise-01-html5-only-validation.md](./exercises/exercise-01-html5-only-validation.md) | Build a contact form with zero JavaScript — pure HTML5 constraint attributes, `:user-invalid` styling, the browser's native error bubble |
| [exercises/exercise-02-js-validation-layer.md](./exercises/exercise-02-js-validation-layer.md) | Add a JS validation layer on top of the HTML5 attributes. Suppress the native bubble; surface errors inline. |
| [exercises/exercise-03-error-messaging-a11y.md](./exercises/exercise-03-error-messaging-a11y.md) | Test every error message with VoiceOver or NVDA. Add an error summary. Make every error announceable. |
| [challenges/README.md](./challenges/README.md) | Index of weekly challenges |
| [challenges/challenge-01-multi-step-form-with-state.md](./challenges/challenge-01-multi-step-form-with-state.md) | Build a three-step form with a clean state model, per-step validation, focus management, and a progress indicator with `aria-current="step"` |
| [quiz.md](./quiz.md) | 10 multiple-choice questions |
| [homework.md](./homework.md) | Six practice problems for the week |
| [mini-project/README.md](./mini-project/README.md) | A multi-step signup form with real-time validation, accessible inline errors, autofill, and screen-reader-tested submission |

The recommended order:

1. Read both lectures (Monday–Tuesday).
2. Do the three exercises (Tuesday–Thursday).
3. Take the quiz (Wednesday evening). If you score under 7, re-read.
4. Pick the challenge (Wednesday–Thursday).
5. Work through the homework problems alongside the mini-project (Thursday–Saturday).
6. Ship the mini-project (Friday–Sunday).

---

## Stretch goals

If you finish early and want to push further, try any of these:

- Read the **HTML Living Standard §4.10 (Forms)** end-to-end. It is ~150 printed pages; the most useful sections are §4.10.5 (the `input` element), §4.10.18 (Form control infrastructure), and §4.10.21 (Constraints). Bookmark §4.10.18.7 (Autofill) — you will reach for it every form you write. <https://html.spec.whatwg.org/multipage/forms.html>
- Read the **WCAG 2.2 §3.3 (Input Assistance)** Success Criteria. Six criteria, each one a single-page Understanding document. The vocabulary you will use for the rest of your career when you talk about form errors. <https://www.w3.org/WAI/WCAG22/Understanding/input-assistance>
- Read **Adam Silver's "Form Design Patterns"** book (the chapters on validation and on multi-step forms are essential). The book reads as one long defense of "use the platform"; you will agree by the end. <https://www.smashingmagazine.com/printed-books/form-design-patterns/>
- Watch **"Building accessible forms" by Sara Soueidan**. Forty-five minutes; covers labels, errors, autofill, and a few patterns the spec does not. <https://www.smashingmagazine.com/2023/02/guide-accessible-form-validation/>
- Read **"Inclusive Inputs" by Heydon Pickering** — chapter from *Inclusive Components*. A single-page guide to every input type the platform ships, with the accessibility implications of each. <https://inclusive-components.design/>
- Audit a form you use every day with the keyboard and a screen reader. Take notes. The patterns that fail in real-world forms are the patterns you will be expected to *not* repeat in your own.

---

## What this week is NOT

A few things to set expectations:

- **Not a backend week.** No `fetch`, no server, no database, no authentication. The form's submission is a `console.log`. Week 8 connects forms to real network requests.
- **Not a CSS-frameworks week.** No Tailwind, no Bootstrap, no Bulma. We style with the same custom-property tokens you wrote in Week 2. The form should look like it belongs to your portfolio, not like a generic component library.
- **Not a forms-library week.** No Formik, no React Hook Form, no VeeValidate. Those exist because frameworks added complexity over the platform; the platform's form model is sufficient for nine out of ten use cases. Week 7 introduces components; even then, the form model below stays the same.
- **Not a form-builder week.** No drag-and-drop form constructor, no schema-driven generator. Real forms in real products are *designed*, not generated; the design judgment is the work.
- **Not a "validate everything client-side" lecture.** Client-side validation is a UX optimization. Per OWASP, server-side validation is the only validation you can trust for security. We validate client-side this week for the user's benefit; Week 8 covers the server-side equivalent for the system's safety.
- **Not a comprehensive accessibility course.** WCAG 2.2 AA has 50+ Success Criteria; this week we focus on the six in §3.3 (Input Assistance) plus the labeling criteria (1.3.1, 1.3.5, 4.1.2). Week 11 audits the full surface.

---

## A word on the editorial voice

You will notice this week's lecture notes treat **error messages as a first-class part of the design**, not as a final-checklist item. The phrasing of an error message, the placement of the message, the moment the message appears, and the way the message is conveyed to assistive technology are part of the form's specification — they are not the styling pass that happens last. An error message that says "Invalid" is no different from a button labeled "Click" or a screen reader announcement that says "Element": the form has a bug, even if every visual element renders.

You will also notice we lean on the **HTML Living Standard** rather than on MDN when we cite. MDN is excellent and we link to it everywhere; the WHATWG spec is the source of truth when implementations diverge — which, for forms, happens more than for the DOM (browsers historically differed on date-picker rendering, on `inputmode` precedence, on certain `pattern` behaviors). Learning to cite a section number is a frontend superpower: it lets you defend a decision in a code review the way a senior engineer does. "Per HTML Living Standard §4.10.21.3, the form's submission algorithm only runs after constraint validation succeeds" lands harder than "I'm pretty sure browsers do this."

A final note: this week's mini-project is the first **multi-step form** most people in this course will have ever shipped. Multi-step forms are a notoriously easy place to lose users — every step is an opportunity for confusion, error, and abandonment. We are going to build one that feels like one form rather than three, where the user always knows where they are, where every error is announceable, and where the keyboard can complete every step without ever touching the mouse. The form will be the first piece of your portfolio that asks a stranger for something — and the first piece that has to handle their answer with care.

---

## Up next

Continue to [Week 7 — Tooling, Modules, and Web Components](../week-07/) once you have shipped the multi-step form, every assertion in the homework passes, you have tested the mini-project with a screen reader, every error message has been heard aloud at least once, and you have read both lectures end-to-end at least twice.

---

*If you find errors in this material, please open an issue or send a PR. Future learners will thank you.*
