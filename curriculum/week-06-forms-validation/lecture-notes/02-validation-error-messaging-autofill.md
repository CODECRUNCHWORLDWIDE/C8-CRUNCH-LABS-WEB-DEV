# Lecture 2 — Validation, Error Messaging, and Autofill

> **Outcome:** You can read the **Constraint Validation API** as defined by HTML Living Standard §4.10.21 and integrate it with your own inline error UI. You can write a `setCustomValidity` call that surfaces a cross-field rule. You can associate every error message with the field that produced it via `aria-describedby` and `aria-invalid`, build a top-of-form error summary the GOV.UK Design System would approve of, and prove every error is announced by a screen reader — all without breaking the native autofill, the platform's submission algorithm, or the constraint attributes you wrote in Lecture 1. By the end of this lecture, every Success Criterion in WCAG 2.2 §3.3 (Input Assistance) is a checklist item you can run against your own form, and you can cite each by number.

## 1. The Constraint Validation API in one paragraph

Per the **HTML Living Standard §4.10.21**, every form-associated element carries a `ValidityState` object on a `validity` property. That object exposes ten boolean flags — `valueMissing`, `typeMismatch`, `patternMismatch`, `tooShort`, `tooLong`, `rangeUnderflow`, `rangeOverflow`, `stepMismatch`, `badInput`, `customError` — plus a derived `valid` flag (true when all ten are false). Each flag is driven by an HTML5 constraint attribute (`required`, `type`, `pattern`, `minlength`, etc.) you wrote in Lecture 1, or — for `customError` — by a call to `setCustomValidity` you write in JavaScript.

The interface for working with that state, in five methods:

```js
input.validity                    // the ValidityState object
input.validity.valid              // true if every flag is false
input.checkValidity()             // runs constraints; fires `invalid` event on failure
input.reportValidity()            // checkValidity + shows native bubble
input.setCustomValidity(message)  // adds a custom error (or clears with '')
input.validationMessage           // the message the bubble would have shown
```

Plus the form-level shortcuts:

```js
form.checkValidity()    // true iff every field validates
form.reportValidity()   // checkValidity + bubble on first invalid
```

This is the entire API. Everything else this lecture covers is *plumbing* — how to wire these calls to the inline UI a sighted user sees and to the announcements a screen reader needs.

---

## 2. Reading `ValidityState`

Each flag in `ValidityState` corresponds to a specific failure mode. Knowing the mapping lets you generate a useful error message instead of a generic one.

```js
function getErrorMessage(input) {
  const v = input.validity;

  if (v.valueMissing) return `${input.labels[0].textContent} is required.`;
  if (v.typeMismatch && input.type === 'email') return 'Enter a valid email address.';
  if (v.typeMismatch && input.type === 'url')   return 'Enter a valid URL.';
  if (v.patternMismatch) return input.title || 'Please match the requested format.';
  if (v.tooShort) return `Use at least ${input.minLength} characters.`;
  if (v.tooLong)  return `Use at most ${input.maxLength} characters.`;
  if (v.rangeUnderflow) return `Enter a number ${input.min} or higher.`;
  if (v.rangeOverflow)  return `Enter a number ${input.max} or lower.`;
  if (v.stepMismatch)   return `Use a multiple of ${input.step}.`;
  if (v.badInput)       return 'Enter a value the field accepts.';
  if (v.customError)    return input.validationMessage;

  return '';
}
```

Three things to notice:

1. **The function reads from the input's own attributes.** `input.minLength`, `input.maxLength`, `input.min`, `input.max`, `input.step`, `input.title` — these are JavaScript properties exposed by the input element interface (per HTML Living Standard §4.10.5.5). You do not duplicate the values in your script.
2. **`input.labels`** is a `NodeList` of every `<label>` associated with this input. Per HTML Living Standard §4.10.4. We pull the first label's text content to construct a personalized error.
3. **The order of checks matters.** `customError` should be last — a custom error you set should take precedence over a default message only when no other constraint fails. Some teams prefer a different order; document your choice.

The function above maps the platform's vocabulary (the validity flag) into the user's vocabulary (a sentence). This is the **translation step** every form's JavaScript layer performs. The mini-project will reuse this exact shape.

---

## 3. The `invalid` event

> **Per HTML Living Standard §4.10.21.4, every form control fires an `invalid` event when its `ValidityState.valid` is false at the moment of `checkValidity` or form submission. The event does *not* bubble by default; you listen for it on each input, or you delegate using the `capture: true` option.**

Listening on each input:

```js
for (const input of form.querySelectorAll('input, select, textarea')) {
  input.addEventListener('invalid', (event) => {
    event.preventDefault();   // suppress the native bubble
    showError(input);
  });
}
```

Listening once with capture (the delegated pattern from Week 5):

```js
form.addEventListener('invalid', (event) => {
  event.preventDefault();
  showError(event.target);
}, { capture: true });
```

The capture pattern is shorter and survives dynamic additions to the form. Per DOM §3.1, listeners attached with `{ capture: true }` fire during the capture phase as the event travels down from the form to the target. Since `invalid` does not bubble, capture is the only way to catch it from a parent listener.

The `event.preventDefault()` call inside the handler **suppresses the native validation bubble**. That is the gate: without it, the browser shows its own UI on top of yours. With it, the browser fires the event and steps aside, leaving you to render the error wherever you want.

### Why preventDefault on `invalid`, not on `submit`

There are two reasonable places to suppress the native bubble:

1. On the `invalid` event of each field — surgical, lets the platform's submission algorithm continue running, your custom UI shows.
2. On the form by setting `novalidate` — wholesale, the platform's validation does not run at all, you re-implement everything in JavaScript.

Option 1 is correct in 95% of cases. Option 2 is the right shape only when you genuinely cannot accept the platform's constraint set — for example, if the form must work in an iframe whose host page disagrees with the platform's `type="email"` regex. We use option 1 for the mini-project.

---

## 4. Custom validation with `setCustomValidity`

> **HTML5's constraint attributes cannot express two important rule classes: cross-field rules ("password confirmation matches password") and async rules ("this email is already registered"). The platform's escape hatch is `setCustomValidity`: register an error message on the field; the field's `ValidityState.customError` flag goes true; the field is now considered invalid for every subsequent `checkValidity` call.**

A cross-field rule, in three lines:

```js
function validatePasswordConfirmation() {
  if (passwordInput.value !== confirmInput.value) {
    confirmInput.setCustomValidity('Passwords do not match.');
  } else {
    confirmInput.setCustomValidity('');   // clear the custom error
  }
}

confirmInput.addEventListener('input', validatePasswordConfirmation);
passwordInput.addEventListener('input', validatePasswordConfirmation);
```

The first call registers a non-empty error message; the field's `customError` flag is now true, and `confirmInput.validity.valid` is false. The second call (with an empty string) clears the custom error, and the field's validity is recomputed from the remaining constraints.

Important: `setCustomValidity('')` does **not** clear all errors — it clears only the *custom* error. The other nine flags (driven by HTML5 constraints) are still computed by the platform.

Two patterns to internalize:

### The "check on every input" pattern

```js
const rule = (input, predicate, message) => {
  input.addEventListener('input', () => {
    input.setCustomValidity(predicate(input) ? '' : message);
  });
};

rule(usernameInput,
  (i) => !/admin|root|moderator/.test(i.value),
  'Username may not contain admin, root, or moderator.');
```

Runs the predicate on every keystroke. The error appears the moment the user types a forbidden substring, and disappears the moment they delete it. The cost: validation runs on every keystroke. For a single regex check that is free; for an async network call, see the next pattern.

### The "debounced async check" pattern

```js
let debounce;
emailInput.addEventListener('input', () => {
  emailInput.setCustomValidity('');   // optimistic: clear while typing
  clearTimeout(debounce);
  debounce = setTimeout(async () => {
    const taken = await isEmailTaken(emailInput.value);
    if (taken) emailInput.setCustomValidity('This email is already registered.');
  }, 400);
});
```

The optimistic clear means the field is *not* invalid while the user is typing — only after a 400 ms pause does the check run. This avoids two failure modes: (a) flickering errors as the user types, and (b) hammering the server with one request per keystroke. For Week 6 the `isEmailTaken` function returns a hard-coded `Promise.resolve(false)`; Week 8 wires it to a real backend.

---

## 5. The inline error UI

> **The native validation bubble is unstyled, dismisses on the next interaction, and disappears entirely on touch screens. The pattern every modern form uses instead: place an error message inline, immediately after the field, associated with the field via `aria-describedby` and `aria-invalid`.**

The markup, per the W3C WAI Tutorials on form errors:

```html
<div class="field">
  <label for="email">Email</label>
  <input
    id="email"
    name="email"
    type="email"
    autocomplete="email"
    aria-describedby="email-error"
    aria-invalid="false"
    required>
  <p id="email-error" class="error-message" hidden></p>
</div>
```

Three attributes carry the accessibility contract:

- **`aria-describedby="email-error"`** — links the input to the error element. The screen reader, when focus reaches the input, will announce the input's name (from `<label>`) plus the input's description (from the linked element's text content). Per WAI-ARIA 1.2 §6.6.4.
- **`aria-invalid="false"`** initially; **`aria-invalid="true"`** when invalid. The screen reader announces "invalid entry" when this is true. Per WAI-ARIA 1.2 §6.6.7.
- **`hidden`** on the error element when there is no error. The screen reader skips hidden elements; the description is effectively empty. When we set the error text and remove `hidden`, the description becomes audible.

The JavaScript that sets these:

```js
function showError(input, message) {
  const errorEl = document.getElementById(input.getAttribute('aria-describedby'));
  if (!errorEl) return;

  errorEl.textContent = message;
  errorEl.hidden = false;
  input.setAttribute('aria-invalid', 'true');
}

function clearError(input) {
  const errorEl = document.getElementById(input.getAttribute('aria-describedby'));
  if (!errorEl) return;

  errorEl.textContent = '';
  errorEl.hidden = true;
  input.setAttribute('aria-invalid', 'false');
}
```

Twenty lines of JavaScript, end-to-end. Every error is now visible to a sighted user and audible to a screen-reader user — at the moment focus reaches the field, with no extra announcement, no special prompt, no live region.

### When to show, when to clear

A common UX question: do you show the error on every keystroke, or only on blur?

The **research-backed answer**, per NN/g and Adam Silver's writing on inline validation: show the error **on blur** for the first time, but **clear it on input** as the user fixes it. The flow:

1. The user types something invalid.
2. They tab away from the field. The error appears.
3. They return to the field and start typing. The error clears.
4. They tab away again. If still invalid, the error re-appears.

The pattern minimizes the "everything is red as I type" anxiety while still flagging mistakes promptly.

The handlers:

```js
const handleBlur = (input) => () => {
  if (!input.checkValidity()) {
    showError(input, getErrorMessage(input));
  }
};

const handleInput = (input) => () => {
  if (input.validity.customError) {
    // run any custom-rule re-check; if now valid, clear
    revalidateCustom(input);
  }
  if (input.checkValidity()) {
    clearError(input);
  }
};

for (const input of form.querySelectorAll('input, select, textarea')) {
  input.addEventListener('blur', handleBlur(input));
  input.addEventListener('input', handleInput(input));
}
```

The submit handler validates one more time (in case the user never blurred a field) and renders any remaining errors.

---

## 6. The error-summary pattern

> **Per the GOV.UK Design System and WCAG 2.2 SC 3.3.1 (Error Identification, Level A), an error summary at the top of the form lists every error with anchor links to each invalid field. The pattern is the canonical fallback for complex forms: a screen reader user activates the summary, jumps to each error in order, fixes each, re-submits.**

The summary markup:

```html
<div
  id="error-summary"
  class="error-summary"
  role="alert"
  aria-labelledby="error-summary-heading"
  tabindex="-1"
  hidden>
  <h2 id="error-summary-heading">There is a problem</h2>
  <ul></ul>
</div>
```

Three attributes carry the contract:

- **`role="alert"`** — per WAI-ARIA 1.2 §5.3.4.1, screen readers announce the alert's content as soon as it becomes visible. We move from `hidden` to visible; the screen reader speaks the heading and the list immediately.
- **`aria-labelledby="error-summary-heading"`** — the summary's accessible name is "There is a problem."
- **`tabindex="-1"`** — the summary is not in the natural tab order, but we can `.focus()` it programmatically. We call `summary.focus()` after we render the errors, so the screen reader announces the alert and the user's keyboard is parked at the top of the form.

The JavaScript that populates it:

```js
function showErrorSummary(form) {
  const summary = document.getElementById('error-summary');
  const list = summary.querySelector('ul');
  list.replaceChildren();

  const invalid = form.querySelectorAll(':invalid');
  for (const input of invalid) {
    const li = document.createElement('li');
    const link = document.createElement('a');
    link.href = `#${input.id}`;
    link.textContent = `${input.labels[0].textContent}: ${getErrorMessage(input)}`;
    li.append(link);
    list.append(li);
  }

  summary.hidden = false;
  summary.focus();
}

function hideErrorSummary() {
  const summary = document.getElementById('error-summary');
  summary.hidden = true;
}
```

The submit handler calls `showErrorSummary` when the form is invalid; the next successful submit calls `hideErrorSummary`. The `<a href="#field-id">` link, on click, focuses the field — because every browser already implements anchor links that focus the target element.

### Why the summary plus the inline errors

The two work together. The inline errors are for the user who is moving through the form linearly with the keyboard or mouse — they see the error the moment they leave the field. The summary is for the user who *just submitted* and needs to know what to fix. The summary tells them "there are three errors, here are the labels"; the inline errors tell them, when they reach each field, exactly what is wrong.

Per WCAG 2.2 SC 3.3.1, the field in error must be **identified** (the summary names it; the inline error appears next to it) and the **error must be described** (the inline message and the summary entry both contain the description). One UI satisfies the criterion; both together is the canonical pattern.

---

## 7. `aria-describedby` versus `aria-errormessage`

> **The WAI-ARIA 1.2 specification introduces `aria-errormessage` as an alternative to `aria-describedby` specifically for error messages. As of 2026, browser and screen-reader support for `aria-errormessage` is incomplete; the pragmatic recommendation is to keep using `aria-describedby` with `aria-invalid="true"`.**

The newer pattern:

```html
<input
  id="email"
  type="email"
  aria-invalid="true"
  aria-errormessage="email-error">
<p id="email-error">Enter a valid email address.</p>
```

The intent: separate "this is the field's description" (`describedby`) from "this is the field's error" (`errormessage`). A screen reader can then announce the description always and the error only when `aria-invalid="true"`.

In practice, per Adrian Roselli's writing and ongoing browser-implementation bugs, `aria-errormessage` is announced inconsistently across NVDA, JAWS, and VoiceOver. The conservative pattern — and the one this course recommends through 2026 — is:

```html
<input
  id="email"
  type="email"
  aria-invalid="false"
  aria-describedby="email-hint email-error">
<p id="email-hint">We will never share your address.</p>
<p id="email-error" hidden></p>
```

The input is described by both the hint and (when present) the error. We toggle `aria-invalid` and the error's `hidden` attribute together. Every screen reader announces this pattern correctly.

We will revisit `aria-errormessage` when browser support catches up. For Week 6, prefer `aria-describedby`.

---

## 8. Live regions for async errors

> **Per WAI-ARIA 1.2 §6.5, a live region is an element with `aria-live="polite"` or `aria-live="assertive"` whose content updates are announced to assistive technology even when the user's focus is elsewhere. For async validation results that arrive after the user has tabbed away, live regions are the right tool.**

The pattern:

```html
<p id="status" role="status" aria-live="polite"></p>
```

The `role="status"` value is per WAI-ARIA 1.2 §5.3.4.20 — equivalent to `aria-live="polite"` plus `aria-atomic="true"` plus a few other defaults. Use `role="status"` for the polite case; `role="alert"` for the assertive case.

After an async check completes:

```js
async function checkEmail(value) {
  const status = document.getElementById('status');
  status.textContent = 'Checking…';

  const taken = await isEmailTaken(value);
  if (taken) {
    status.textContent = `${value} is already registered.`;
    emailInput.setCustomValidity('This email is already registered.');
  } else {
    status.textContent = `${value} is available.`;
    emailInput.setCustomValidity('');
  }
}
```

The screen reader announces "Checking…" politely (it waits for whatever it is currently reading to finish, then says the new text). When the result arrives, it announces the result the same way. The user gets the feedback even if they have already moved on to the next field.

For Week 6 we lean on live regions sparingly — most validation is synchronous. The pattern is here because it composes cleanly with `setCustomValidity` and you will reach for it in Week 8 when we add real network checks.

---

## 9. Multi-step forms — the state model

> **A multi-step form is one form rendered across several "steps," with the user moving between steps via Next / Back buttons. The pattern is the standard shape for any form longer than a few fields. Per the GOV.UK Design System service pattern, multi-step forms outperform single-page forms when the form is longer than about ten fields.**

The state model lives in JavaScript:

```js
const state = {
  step: 0,
  values: {},     // accumulated FormData as the user moves
  errors: {},     // per-field error messages
};
```

Each step is a `<fieldset>` inside the form; only one fieldset is visible at a time. Moving to the next step:

1. Validate every field in the current step (`fieldset.querySelectorAll(...)`, then `input.checkValidity()` on each).
2. If any are invalid, render the inline errors plus the error summary; *do not advance*.
3. If all are valid, copy the current step's `FormData` entries into `state.values`, hide the current step, show the next, and **focus the next step's heading**.

Step 3's focus management is the load-bearing detail. Per WCAG 2.2 SC 2.4.3 (Focus Order), the focus moves in a sequence that preserves meaning. Moving the focus to the new step's heading (a `<h2>` with `tabindex="-1"`) tells the screen reader "the user is now on a new section"; without it, the focus stays on the Next button — which is now hidden — and the screen reader is confused.

```js
function goToStep(n) {
  steps[state.step].hidden = true;
  state.step = n;
  steps[state.step].hidden = false;

  const heading = steps[state.step].querySelector('h2');
  heading.focus();
}
```

The progress indicator carries `aria-current="step"` on the current step:

```html
<ol aria-label="Signup progress">
  <li><a href="#step-1">Your details</a></li>
  <li><a href="#step-2" aria-current="step">Account</a></li>
  <li><a href="#step-3">Confirm</a></li>
</ol>
```

Per WAI-ARIA 1.2 §6.6.13, `aria-current="step"` is the canonical value for "you are here" in a multi-step process. The screen reader announces "current step" when reading the list.

The challenge for this week — `challenge-01-multi-step-form-with-state.md` — walks through this pattern end-to-end.

---

## 10. The accessibility decision tree

Every form-accessibility decision this week reduces to one of seven WCAG 2.2 Success Criteria:

| Criterion | Level | What you ship for it |
|-----------|-------|---------------------|
| SC 1.3.1 Info and Relationships | A | Every input has a `<label>` (or `aria-labelledby`); related controls grouped in `<fieldset>` with `<legend>` |
| SC 1.3.5 Identify Input Purpose | AA | Every input collecting user information has an `autocomplete` token |
| SC 3.3.1 Error Identification | A | Invalid fields are identified (the summary names them, `aria-invalid="true"` flags them); errors are described in text |
| SC 3.3.2 Labels or Instructions | A | The label is visible and programmatically associated; helper text (`aria-describedby`) explains anything ambiguous |
| SC 3.3.3 Error Suggestion | AA | Each error message explains *how to fix* the problem (not just "invalid"; specifically "use at least 8 characters") |
| SC 3.3.4 Error Prevention | AA | For legal/financial/data forms, the submission is reversible, checked, or confirmable (a "review your answers" step) |
| SC 4.1.2 Name, Role, Value | A | Every form control has a programmatically determinable name, role, and value (confirmed in Firefox's Accessibility panel) |

When you finish the mini-project, run down this table. If you can cite the markup or JS for every line, your form passes the relevant WCAG checks. If you cannot, you have an audit to do.

---

## 11. Putting it together — the inline-validation flow

A complete inline-validation handler, end-to-end, ~50 lines of JS:

```js
const form = document.getElementById('signup-form');

const messages = {
  valueMissing:  (input) => `${input.labels[0].textContent} is required.`,
  typeMismatch:  (input) => input.type === 'email' ? 'Enter a valid email address.' : 'Enter a valid value.',
  patternMismatch: (input) => input.title || 'Please match the requested format.',
  tooShort:      (input) => `Use at least ${input.minLength} characters.`,
  tooLong:       (input) => `Use at most ${input.maxLength} characters.`,
  rangeUnderflow: (input) => `Enter ${input.min} or higher.`,
  rangeOverflow:  (input) => `Enter ${input.max} or lower.`,
  stepMismatch:   (input) => `Use a multiple of ${input.step}.`,
  badInput:       () => 'Enter a value the field accepts.',
  customError:    (input) => input.validationMessage,
};

function getError(input) {
  for (const key of Object.keys(messages)) {
    if (input.validity[key]) return messages[key](input);
  }
  return '';
}

function showError(input) {
  const errorId = input.getAttribute('aria-describedby').split(' ').find(id => id.endsWith('-error'));
  const errorEl = document.getElementById(errorId);
  errorEl.textContent = getError(input);
  errorEl.hidden = false;
  input.setAttribute('aria-invalid', 'true');
}

function clearError(input) {
  const errorId = input.getAttribute('aria-describedby').split(' ').find(id => id.endsWith('-error'));
  const errorEl = document.getElementById(errorId);
  errorEl.textContent = '';
  errorEl.hidden = true;
  input.setAttribute('aria-invalid', 'false');
}

for (const input of form.querySelectorAll('input, select, textarea')) {
  input.addEventListener('blur', () => {
    if (!input.checkValidity()) showError(input);
  });
  input.addEventListener('input', () => {
    if (input.checkValidity()) clearError(input);
  });
  input.addEventListener('invalid', (e) => e.preventDefault());
}

form.addEventListener('submit', (event) => {
  event.preventDefault();
  let allValid = true;
  for (const input of form.querySelectorAll('input, select, textarea')) {
    if (!input.checkValidity()) {
      showError(input);
      allValid = false;
    }
  }
  if (allValid) {
    const data = new FormData(form);
    console.log('Submitted:', Object.fromEntries(data));
  }
});
```

Fifty lines. Three handlers per input. One handler on the form. Every constraint comes from the HTML5 attributes; every error message comes from the message table; every announcement comes from `aria-invalid` and `aria-describedby`. The native bubble is suppressed; the inline UI is yours.

Type this. Run it. Test it with VoiceOver or NVDA. Verify the announcement at each field. Verify the summary's `role="alert"` is heard when the form is submitted invalid. Verify autocomplete still works (it should — we did not touch the input's `autocomplete` attribute).

This is the shape of every form validation pass you will write for the rest of your career.

---

## 12. What we leave for Week 8

This lecture taught you the **client-side** validation pass. Two things are still missing:

1. **The network half.** The submission is `console.log`. Week 8 covers `fetch`, async submission, the loading state, the success state, the network-error state, and the server-validation-failed state.
2. **The security half.** Client-side validation is a UX optimization. The browser can be bypassed (cURL, devtools, a malicious extension); every constraint you wrote here can be circumvented by an attacker. Per OWASP, server-side validation is the only validation that is *security*. Week 8 will cover the equivalent server-side patterns.

Until then: the form you ship this week is well-behaved for legitimate users. That is enough. Trustworthy submission is a Week 8 concern.

Before working the mini-project, do **Exercise 2 — JS validation layer** and **Exercise 3 — Error messaging and accessibility**. The two exercises walk you through the inline-validation handler above in two passes: first the mechanics (Exercise 2), then the accessibility polish (Exercise 3). The mini-project assumes you have done both.

---

## Lecture 2 summary

- The **Constraint Validation API** (HTML Living Standard §4.10.21) exposes a `ValidityState` object on every form control. Ten boolean flags; one derived `valid` flag.
- `checkValidity()` runs constraints and fires `invalid` events on failed fields; `reportValidity()` adds the native bubble; `setCustomValidity(message)` registers a custom error (clear with `''`).
- The `invalid` event does not bubble; listen on each input, or use `{ capture: true }` from the form.
- Calling `event.preventDefault()` inside the `invalid` handler suppresses the native bubble. We keep the platform's submission algorithm but replace the platform's UI.
- Custom validation comes in two shapes: synchronous on every `input` event (regex, cross-field), and debounced async on every `input` (network checks). Both end with a `setCustomValidity(message)` call.
- Inline errors are associated with their fields via `aria-describedby` (the linked element holds the error text) plus `aria-invalid="true"` (set when invalid). The error element starts `hidden`; we toggle it and the input's `aria-invalid` together.
- Show errors on blur; clear them on input. The pattern minimizes "everything is red as I type" while still flagging mistakes promptly.
- The error-summary pattern (GOV.UK Design System) is a `role="alert"` region at the top of the form, listing every invalid field with anchor links. Focus it on submit; the alert is announced; the user navigates to each error in order.
- Prefer `aria-describedby` to `aria-errormessage` in 2026 — browser support for the latter is incomplete.
- Live regions (`aria-live="polite"` or `role="status"`) announce async validation results to assistive technology.
- Multi-step forms hold state in JS, validate per-step (not per-submit), move focus to the next step's heading after every transition, and indicate progress with `aria-current="step"`.
- Every form-accessibility decision maps to one of seven WCAG 2.2 Success Criteria: 1.3.1, 1.3.5, 3.3.1, 3.3.2, 3.3.3, 3.3.4, 4.1.2.
- Fifty lines of JavaScript and zero `innerHTML` is enough for a complete inline-validation pass on a real-world form.

In the mini-project, the form learns to **walk a user through three steps** — collecting their details, validating each step's fields, returning focus on every transition, and submitting a complete `FormData` to the console once every step passes.
