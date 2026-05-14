# Week 6 — Quiz

Ten questions. Lecture notes closed. Aim for 9/10.

---

**Q1.** Which specification is the normative source for the HTML form model and the Constraint Validation API?

- A) The ECMAScript Language Specification (ECMA-262)
- B) The WHATWG HTML Living Standard, §4.10
- C) The W3C WAI-ARIA 1.2 Specification
- D) MDN Web Docs

---

**Q2.** You write `<input type="email" placeholder="Email address" required>` and no `<label>`. What is the accessibility problem?

- A) The `required` attribute is invalid on `type="email"`.
- B) `placeholder` is not a programmatic label; the input has no accessible name, violating WCAG 2.2 SC 1.3.1 and SC 4.1.2.
- C) `type="email"` requires a `pattern` attribute too.
- D) The `placeholder` will not display correctly in dark mode.

---

**Q3.** Which `ValidityState` flag is set when a user types a value shorter than the `minlength` attribute *after* typing at least one character?

- A) `valueMissing`
- B) `tooShort`
- C) `patternMismatch`
- D) `rangeUnderflow`

---

**Q4.** What does `event.preventDefault()` inside an `invalid` event handler accomplish?

- A) It prevents the form from submitting.
- B) It clears the field's `customError` flag.
- C) It suppresses the browser's native validation bubble; the constraint is still violated but the platform leaves the UI to you.
- D) It re-runs `checkValidity()` after the handler returns.

---

**Q5.** Which CSS pseudo-class matches an invalid form field **only after the user has interacted with it**?

- A) `:invalid`
- B) `:user-invalid`
- C) `:required`
- D) `:focus-visible`

---

**Q6.** You want a screen reader to announce an error message the moment a field receives focus. Which ARIA attribute on the input is essential?

- A) `aria-label`
- B) `aria-hidden`
- C) `aria-describedby` (pointing at the error element) plus `aria-invalid="true"`
- D) `role="alert"`

---

**Q7.** A signup form's password field collects a new password. Which `autocomplete` token unlocks the browser's password-generation feature?

- A) `autocomplete="off"`
- B) `autocomplete="password"`
- C) `autocomplete="current-password"`
- D) `autocomplete="new-password"`

---

**Q8.** Per WCAG 2.2 Success Criterion 3.3.3 (Error Suggestion, Level AA), an error message must do what beyond identifying that a field is in error?

- A) Be in red text.
- B) Provide a suggestion for how to correct the error, when the suggestion is known.
- C) Include a link to the help page.
- D) Be displayed in a modal dialog.

---

**Q9.** You build an error summary at the top of the form with `role="alert"`, `tabindex="-1"`, and `hidden`. When the user submits an invalid form, you populate the summary and unhide it. What additional step is required so the screen reader announces it and the user can act on it?

- A) Set `aria-live="assertive"` (redundant — `role="alert"` already implies this).
- B) Call `.focus()` on the summary so focus moves to it.
- C) Add `aria-atomic="true"` (redundant — `role="alert"` already implies this).
- D) Add a `<title>` attribute to the summary.

---

**Q10.** The submit handler reads form data with `new FormData(form)`. For a `<select multiple>` or a checkbox group sharing a `name`, which method retrieves every value the field contributed?

- A) `formData.get(name)`
- B) `formData.getAll(name)`
- C) `formData.entries(name)`
- D) `formData[name]`

---

## Answer key

<details>
<summary>Click to reveal</summary>

1. **B** — The **WHATWG HTML Living Standard, §4.10 (Forms)** is the normative source for the form model, every form-associated element, the constraint attributes, the Constraint Validation API, and the submission algorithm. ECMA-262 defines the language; WAI-ARIA defines the accessibility vocabulary; MDN documents the spec but is not normative.
2. **B** — Per WCAG 2.2 SC 1.3.1 (Info and Relationships) and SC 4.1.2 (Name, Role, Value), every form control must have a programmatically determinable name. The `placeholder` attribute is not a label; it disappears the moment the user types, screen readers do not consistently announce it, and per WCAG 2.2 SC 3.3.2 the input needs a *label or instruction*, neither of which the placeholder provides. The fix is `<label for="email">Email</label>` next to the input.
3. **B** — `tooShort`. Per HTML Living Standard §4.10.5.5.7: the flag is set when the value is non-empty and shorter than `minLength` after the value has been edited by the user. Note the "after edited" qualifier — `tooShort` does not fire on first blur of an empty required field (that fires `valueMissing` instead).
4. **C** — Suppresses the native validation bubble. Per HTML Living Standard §4.10.21.4: "the user agent should report the problems with the constraints of that element to the user, *unless one of the event listeners for that event has cancelled the event*." The constraint is still violated and the form still refuses to submit; the platform just steps aside on the UI.
5. **B** — `:user-invalid`. Shipped in every browser since 2023. Per the CSS Selectors Level 4 specification: matches a form control that has been validated by the user and determined invalid since the last user interaction. The older `:invalid` selector matches on page load if `required` is set with no value — a UX anti-pattern. `:user-invalid` fixes that.
6. **C** — `aria-describedby` pointing at the inline error element, plus `aria-invalid="true"`. Per WAI-ARIA 1.2: `aria-describedby` makes the description part of the input's announcement at focus time; `aria-invalid="true"` triggers most screen readers to add "invalid entry" to the announcement. `aria-label` overrides the visible label (the wrong tool); `role="alert"` is for the error summary, not the field.
7. **D** — `autocomplete="new-password"`. Per HTML Living Standard §4.10.18.7 and per Safari / Chrome implementation: the browser only offers to generate a strong password when it sees `new-password`. `current-password` triggers the "fill saved password" flow instead. Mislabeling either breaks both flows. `autocomplete="password"` is not a valid token; `autocomplete="off"` is ignored by Chrome and Safari on password fields by design.
8. **B** — Provide a suggestion for how to correct the error, when the suggestion is known. Per WCAG 2.2 SC 3.3.3 (Error Suggestion, Level AA): the error must say what would fix it. "Use at least 8 characters" satisfies the criterion; "Invalid password" does not. The criterion explicitly applies "if suggestions for correction are known"; if no suggestion is possible (e.g., for a server-side rule whose reason cannot be revealed for security reasons), identifying the error is enough.
9. **B** — Call `.focus()` on the summary. `role="alert"` makes the new content announced, but the user's keyboard is still on the Send button (or wherever it was). Calling `summary.focus()` moves the keyboard to the summary so the user can immediately Tab into the form's error fields or activate the in-summary anchor links. Per WCAG 2.2 SC 2.4.3 (Focus Order). `tabindex="-1"` is what makes `.focus()` work on a non-focusable `<div>`.
10. **B** — `formData.getAll(name)`. Per the XMLHttpRequest standard's FormData definition: `get(name)` returns the first value; `getAll(name)` returns the array of every value submitted under that name. `entries()` is the iterable of every entry; `formData[name]` is not part of the interface. Use `getAll` for any field that can contribute multiple values: `<select multiple>`, a checkbox group sharing a `name`, a file input with `multiple`.

</details>

If under 7, re-read [Lecture 1](./lecture-notes/01-html5-form-semantics.md) and [Lecture 2](./lecture-notes/02-validation-error-messaging-autofill.md). If 9 or above, you are ready for the [homework](./homework.md).
