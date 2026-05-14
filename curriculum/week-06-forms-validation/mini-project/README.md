# Mini-Project — A multi-step signup form with real-time validation and accessible error messaging

> Build a three-step signup form — a styled, accessible, multi-screen flow that collects ten fields, validates each step independently, surfaces every error inline plus in a top-of-form summary, autofills on first paint, manages focus on every transition, and submits a complete `FormData` to the console once every step passes. No framework. No build tool. No npm. The component is HTML, CSS, and three ES modules served by Live Server. The form passes the validator, passes axe DevTools, passes a deliberate VoiceOver / NVDA test, and ships with a written WCAG conformance statement against the seven Success Criteria in §3.3 (Input Assistance) plus 1.3.1, 1.3.5, and 4.1.2.

This is the synthesis of Week 6. You wrote a zero-JS form in Exercise 1. You added a validation layer in Exercise 2. You wired the accessibility model in Exercise 3. You ran the multi-step pattern in the challenge. The mini-project assembles all four into one shippable component.

**Estimated time:** 9 hours, spread across Friday–Sunday.

---

## What you will build

A signup form at `mini-project/index.html` in your Week 6 repo. The form collects ten fields across three steps, validates each step at Next time, focuses the new step's heading on every transition, displays inline errors after blur and clears them on input, surfaces a top-of-form error summary on submission failure, autofills the user's saved profile on first paint, and submits via `event.preventDefault()` + `new FormData(form)` to `console.log` (Week 8 wires the network).

The page uses the same typography tokens, color tokens, and dark-mode rule you wrote in Week 2. It is mobile-first (Week 3). The JavaScript splits across three small ES modules. No frameworks, no Tailwind, no bundler.

```text
┌──────────────────────────────────────────────────┐
│ ●●●    http://localhost:5500/mini-project/       │
├──────────────────────────────────────────────────┤
│                                                  │
│   Create your account  (Step 1 of 3)             │
│                                                  │
│   ●  1. Your details                             │
│   ◯  2. Account                                  │
│   ◯  3. Review and submit                        │
│                                                  │
│   Your details                                   │
│   ─────────────────────────                      │
│                                                  │
│   First name *                                   │
│   ┌──────────────────────────────────┐           │
│   │                                  │           │
│   └──────────────────────────────────┘           │
│                                                  │
│   Last name *                                    │
│   ┌──────────────────────────────────┐           │
│   │                                  │           │
│   └──────────────────────────────────┘           │
│                                                  │
│   Email address *                                │
│   ┌──────────────────────────────────┐           │
│   │                                  │           │
│   └──────────────────────────────────┘           │
│   We will send you a confirmation email.         │
│                                                  │
│   Phone number                                   │
│   ┌──────────────────────────────────┐           │
│   │                                  │           │
│   └──────────────────────────────────┘           │
│   Optional.                                      │
│                                                  │
│                          [ Next → ]              │
│                                                  │
└──────────────────────────────────────────────────┘
```

On step 2, the form collects the username, password, password confirmation, and date of birth. On step 3, every value entered so far is shown as a review summary, with "Edit" links to jump back to each step. The final submit lands on a thank-you message; the console shows the full `FormData`.

---

## Acceptance criteria

- [ ] The folder `mini-project/` exists at the top level of your Week 6 repo, with this final tree (or close):
  ```
  mini-project/
  ├── README.md
  ├── index.html
  ├── styles.css
  ├── main.js
  └── lib/
      ├── form-state.js   ← the state model + transitions
      ├── validation.js   ← getError + showError + clearError + summary
      └── focus.js        ← focus helpers (focusStepHeading, focusSummary, focusFirstError)
  ```
- [ ] One `<script type="module" src="./main.js"></script>` tag in `index.html`. No other JS files referenced.
- [ ] All HTML and CSS conform to your Week 2 / Week 3 work — typography tokens, color tokens, dark mode via `prefers-color-scheme`, focus-visible rule, mobile-first layout. The form should look like it belongs to your portfolio.

### Markup

- [ ] **Three steps**, each a `<fieldset>` with a `<legend>` that names the step. Only one step is visible at a time (`hidden` attribute on the others — never `display: none` from JS or CSS).
- [ ] **Step 1 — Your details:** four fields:
  - First name (`autocomplete="given-name"`, `required`, `minlength="1"`, `maxlength="50"`)
  - Last name (`autocomplete="family-name"`, `required`, `minlength="1"`, `maxlength="50"`)
  - Email address (`type="email"`, `autocomplete="email"`, `required`)
  - Phone number (`type="tel"`, `autocomplete="tel"`, optional, `pattern` for a permissive format)
- [ ] **Step 2 — Account:** four fields:
  - Username (`autocomplete="username"`, `required`, `pattern="[a-zA-Z0-9_]{3,20}"`, `title="3–20 letters, numbers, or underscores"`)
  - Password (`type="password"`, `autocomplete="new-password"`, `required`, `minlength="8"`)
  - Confirm password (`type="password"`, `autocomplete="new-password"`, `required`, validated by `setCustomValidity` against the password field)
  - Date of birth (`type="date"`, `autocomplete="bday"`, `required`, `max` set to 13 years before today via JS — must be at least 13 to register)
- [ ] **Step 3 — Review and submit:** a `<dl>` summary of every field entered (password masked), each row with an "Edit" button to jump back to the appropriate step. A "Marketing emails" checkbox (`name="marketing"`) and a "Terms accepted" checkbox (`name="terms"`, `required`) below the summary. A "Create account" submit button at the bottom.
- [ ] **Progress indicator** at the top of every step: an `<ol>` listing all three steps. The current step has `aria-current="step"`. Past steps are interactive (clicking them returns to that step); future steps are `disabled`.
- [ ] **Error summary** above the active step, with `role="alert"`, `tabindex="-1"`, and `hidden`. Populated on validation failure with one item per invalid field, anchored to each field's `id`.

### Behavior

- [ ] **State as the source of truth.** A single `state` object holds `{ step: 0, values: {}, visited: Set<number> }`. Every mutation goes through a single `setState(patch)` function that re-syncs the DOM. You do not maintain two parallel sources of truth.
- [ ] **Per-step validation.** Clicking "Next" validates only the current step's fields. If any are invalid, inline errors appear, the summary populates, focus moves to the summary; the user does *not* advance.
- [ ] **Per-field validation.** Every input validates on `blur` (showing an inline error if invalid). Every input clears its inline error on `input` once it becomes valid.
- [ ] **Cross-field validation.** The confirm-password field uses `setCustomValidity('Passwords do not match.')` when it diverges from the password field; clears with `setCustomValidity('')` when they match. Both fields' `input` listeners re-run the check.
- [ ] **Date-of-birth validation.** A custom check enforces `today - birth >= 13 years`. Use `setCustomValidity` with a message; the message is announced via the inline-error pattern.
- [ ] **Focus management.** Every step transition focuses the new step's `<h2>` (which has `tabindex="-1"`). Every failed validation focuses the error summary. Every successful submit focuses the thank-you `<h1>` (or an `<h2>` if the thank-you replaces only the form).
- [ ] **Edit-from-review.** On step 3, clicking "Edit" next to a row jumps back to that field's step, focuses that field, and keeps every other entered value.
- [ ] **State persistence within session.** If the user goes Back from step 3 to step 1, every value they entered on step 1 is still there. (Automatic if you use `hidden` rather than removing elements.)

### Accessibility

- [ ] **WCAG 2.2 SC 1.3.1 (Info and Relationships, Level A):** every field has a `<label>` programmatically associated. Verified in Firefox's Accessibility panel (every input's Name is non-empty).
- [ ] **WCAG 2.2 SC 1.3.5 (Identify Input Purpose, Level AA):** every input that collects user information has an `autocomplete` token from the HTML Living Standard list.
- [ ] **WCAG 2.2 SC 2.1.1 (Keyboard, Level A):** every interaction works with the keyboard alone. Close your trackpad; walk every flow.
- [ ] **WCAG 2.2 SC 2.4.3 (Focus Order, Level A):** focus moves in a logical sequence; on every step transition, focus moves to the new step's heading.
- [ ] **WCAG 2.2 SC 2.4.7 (Focus Visible, Level AA):** every interactive control has a visible focus indicator via `:focus-visible`.
- [ ] **WCAG 2.2 SC 3.3.1 (Error Identification, Level A):** every invalid field is identified via `aria-invalid="true"` and the inline error message; the summary names every invalid field with a link to it.
- [ ] **WCAG 2.2 SC 3.3.2 (Labels or Instructions, Level A):** every field with a constraint that is not obvious from the label has helper text (`aria-describedby` pointing at a `<p>` next to it). The phone field reads "Optional"; the email field reads "We will send you a confirmation email"; the password field reads "At least 8 characters."
- [ ] **WCAG 2.2 SC 3.3.3 (Error Suggestion, Level AA):** every error message says *what to fix*, not just that there is a problem. "Use at least 8 characters" passes; "Invalid" does not.
- [ ] **WCAG 2.2 SC 3.3.4 (Error Prevention, Level AA):** the review step on step 3 is the canonical pattern for this criterion — the user reviews every entered value before submission. Mark this requirement as satisfied in your README.
- [ ] **WCAG 2.2 SC 4.1.2 (Name, Role, Value, Level A):** every form control has a programmatically determinable name, role, and value. Verified in Firefox's Accessibility panel.
- [ ] **Screen-reader test.** Test with at least one of VoiceOver, NVDA, or Orca. Document the test in `mini-project/README.md`:
  - Which screen reader, which OS, which browser.
  - The exact phrases announced when (1) entering each step's heading, (2) reaching an invalid field, (3) the error summary appears, (4) the form submits successfully.
  - One thing the screen reader announced correctly. One thing you had to fix to make it announce correctly.

### Quality

- [ ] **Validator:** the page passes <https://validator.w3.org/nu/> with zero errors.
- [ ] **axe DevTools:** zero serious or critical issues on every step.
- [ ] **Lighthouse Accessibility:** score ≥ 95 on every step.
- [ ] **No frameworks, no bundler, no npm.** One HTML, one CSS, three JS files served by Live Server.
- [ ] **No `innerHTML`.** Every DOM mutation uses `createElement`, `append`, `textContent`, and `replaceChildren`.
- [ ] **README:** `mini-project/README.md` walks a reader through what the form does, how to run it, the screen-reader test you performed, the WCAG conformance statement (a table of the ten criteria above with a "satisfied by..." note for each), and **three design decisions you would defend in a code review**.

---

## Suggested order of operations

### Phase 1 — Plan the state model and the field schema (45 min)

Before any code, in `mini-project/README.md` write the **state schema** and the **field schema**:

```js
/**
 * @typedef {Object} SignupState
 * @property {number} step           // 0..2
 * @property {Object<string,string>} values   // accumulated form values
 * @property {Set<number>} visited   // steps the user has visited
 */

/**
 * @typedef {Object} FieldSchema
 * @property {string} name           // matches input.name
 * @property {string} label          // human-readable
 * @property {number} step           // which step (0..2)
 * @property {Object<string,*>} constraints   // { type, autocomplete, required, minlength, maxlength, pattern, ... }
 * @property {string} [hint]         // helper text, surfaced via aria-describedby
 * @property {function} [customValidate]    // (input, form) => string  // returns error message or ''
 */
```

The ten fields are listed under "Markup" above. Type the schema literally as a JavaScript object array. The schema is the source of truth for the form's structure; the HTML rendering follows from it. (Or, equivalently, type the HTML by hand and let the schema document what is there — either order works; pick one.)

Decide the focus model: focus the new step's heading on transition, focus the error summary on failed validation, focus the first invalid field after the summary is read (or rely on the summary's anchor links — document your choice).

Decide the validation timing: blur shows errors, input clears them, Next-button validates the step. Document the rule in the README.

This phase is intentionally non-code. Once the schema is settled, the modules write themselves.

### Phase 2 — Static markup (1 h)

Type the HTML by hand. Use the right roles and attributes from the outset; do not retrofit.

Structure:

```html
<main>
  <h1>Create your account</h1>
  <p id="step-context">Step <span data-step-current>1</span> of 3</p>

  <ol class="progress" aria-label="Signup progress">
    <li><button type="button" data-step="0" aria-current="step">Your details</button></li>
    <li><button type="button" data-step="1" disabled>Account</button></li>
    <li><button type="button" data-step="2" disabled>Review and submit</button></li>
  </ol>

  <div id="error-summary" role="alert" tabindex="-1" hidden>
    <h2 id="error-summary-heading">There is a problem</h2>
    <ul></ul>
  </div>

  <form id="signup" novalidate>
    <fieldset data-step="0">
      <legend><span class="step-heading" tabindex="-1" role="heading" aria-level="2">Your details</span></legend>

      <div class="field">
        <label for="given-name">First name <span aria-hidden="true">*</span></label>
        <input id="given-name" name="given-name" type="text"
               autocomplete="given-name" required minlength="1" maxlength="50"
               aria-describedby="given-name-error" aria-invalid="false">
        <p id="given-name-error" class="error-message" hidden></p>
      </div>

      <!-- last name, email, phone -->
    </fieldset>

    <fieldset data-step="1" hidden>
      <legend><span class="step-heading" tabindex="-1" role="heading" aria-level="2">Account</span></legend>
      <!-- username, password, confirm, dob -->
    </fieldset>

    <fieldset data-step="2" hidden>
      <legend><span class="step-heading" tabindex="-1" role="heading" aria-level="2">Review and submit</span></legend>
      <dl id="summary-list"></dl>
      <!-- marketing + terms checkboxes -->
    </fieldset>

    <div class="form-actions">
      <button type="button" data-action="back" hidden>Back</button>
      <button type="submit" data-action="next">Next</button>
    </div>
  </form>
</main>
```

The `<legend>` containing a `<span role="heading">` is a workaround for `<legend>`'s phrasing-only content model (per HTML Living Standard §4.10.15). Alternatives: a `<legend>` with the styling of an `<h2>` (the heading semantic is conveyed by the `<legend>` itself). Either is acceptable; document your choice in NOTES.

The form attribute `novalidate` is the gate. We will handle every constraint in JavaScript; the platform should not surface its own bubbles. We *still* keep the HTML5 constraint attributes — `ValidityState` reads them — but the native bubble UI is suppressed at the form level.

Run the validator. Run axe. Both should pass with zero errors before any JavaScript runs.

### Phase 3 — `lib/validation.js` (1 h 30 min)

Reuse the shape from Exercise 3:

```js
const messages = { /* every ValidityState flag */ };

export function getError(input) { /* read validity, return message */ }
export function showError(input) { /* set textContent, set aria-invalid */ }
export function clearError(input) { /* clear, set aria-invalid="false" */ }
export function showErrorSummary(invalidInputs) { /* populate, focus */ }
export function hideErrorSummary() { /* hide */ }
```

Add custom-rule plumbing: a `setCustomRule(input, predicate, message)` helper that wires an `input` listener calling `setCustomValidity`.

```js
export function setCustomRule(input, predicate, message) {
  const recheck = () => input.setCustomValidity(predicate(input) ? '' : message);
  input.addEventListener('input', recheck);
  return recheck;
}
```

### Phase 4 — `lib/focus.js` (20 min)

```js
export function focusStepHeading(stepIndex) { /* find h2 inside fieldset, .focus() */ }
export function focusErrorSummary() { /* .focus() the summary */ }
export function focusFirstError(invalidInputs) { /* invalidInputs[0].focus() */ }
```

Each function ~5 lines. The win is naming: `focusStepHeading(1)` reads clearly, and any future reader of `main.js` knows what the call does.

### Phase 5 — `lib/form-state.js` (1 h 30 min)

The state object + the transition functions:

```js
const state = {
  step: 0,
  values: {},
  visited: new Set([0]),
};

export function getState() { return state; }

export function goNext() { /* validate, capture, advance, render, focus */ }
export function goBack() { /* go back, render, focus */ }
export function goToStep(n) { /* allowed only if state.visited.has(n) */ }
```

The render function reads `state` and applies the DOM updates: which `<fieldset>` is visible, which step's progress button has `aria-current`, the Back button's visibility, the Next/Submit button's label, and (on step 2) the summary list contents.

### Phase 6 — `main.js` (45 min)

The page's entry point. Imports from the three lib modules, wires the form's listeners, and bootstraps the initial render:

```js
import { getState, goNext, goBack, goToStep, render } from './lib/form-state.js';
import { showError, clearError, hideErrorSummary, setCustomRule } from './lib/validation.js';
import { focusStepHeading } from './lib/focus.js';

const form = document.getElementById('signup');

// Field-level validation: blur shows errors, input clears them.
for (const input of form.querySelectorAll('input')) {
  input.addEventListener('blur', () => {
    if (!input.checkValidity()) showError(input);
  });
  input.addEventListener('input', () => {
    if (input.checkValidity()) clearError(input);
  });
  input.addEventListener('invalid', (e) => e.preventDefault());
}

// Cross-field rule: confirm-password matches password.
const password = form.elements['password'];
const confirm  = form.elements['confirm-password'];
setCustomRule(confirm, () => confirm.value === password.value, 'Passwords do not match.');
password.addEventListener('input', () => confirm.dispatchEvent(new Event('input')));

// Age rule: must be 13+.
const dob = form.elements['dob'];
setCustomRule(dob, () => {
  const birth = new Date(dob.value);
  const cutoff = new Date(); cutoff.setFullYear(cutoff.getFullYear() - 13);
  return !isNaN(birth) && birth <= cutoff;
}, 'You must be at least 13 years old.');

// Form navigation.
form.addEventListener('submit', (event) => {
  event.preventDefault();
  goNext();   // either advances to next step or submits if on step 2
});

form.addEventListener('click', (event) => {
  const back = event.target.closest('[data-action="back"]');
  if (back) goBack();

  const progress = event.target.closest('.progress button');
  if (progress && !progress.disabled) {
    goToStep(parseInt(progress.dataset.step, 10));
  }

  const edit = event.target.closest('[data-action="edit"]');
  if (edit) {
    goToStep(parseInt(edit.dataset.step, 10));
    document.getElementById(edit.dataset.target).focus();
  }
});

// Initial render.
render();
focusStepHeading(0);
```

The shape: every interaction routes through a small handler that calls a transition function exposed by `form-state.js`. The form's DOM is updated only by `render()`. Every focus call happens in the transition.

### Phase 7 — Styles (1 h 30 min)

Visual treatment of:

- The form container (a card with subtle shadow, matching the Week 2 tokens).
- The fieldset (no border, generous spacing, a clear heading hierarchy).
- The progress indicator (numbered items, the current one highlighted, past ones marked completed).
- The error summary (a red-tinted region with the GOV.UK-style red left border).
- Inline error messages (color + an icon — never color alone, per SC 1.4.1).
- The `:user-invalid` state on inputs (a red border + an error icon).
- The `:user-valid` state on inputs (a subtle green border).
- The `:focus-visible` outline on every interactive element.
- The mobile layout — every field at full width below 480px, sided-by-side at desktop.

The CSS should read on one screen at desktop typography.

### Phase 8 — Screen-reader test (45 min)

The test you cannot skip. Turn on VoiceOver (`Cmd+F5` on macOS), NVDA (free download for Windows), or Orca (`Alt+Super+S` on most Linux desktops).

Walk through every flow. Listen specifically for:

1. **Step 1 heading on initial load.** "Your details, heading, level 2."
2. **First name input.** "First name, edit text, required."
3. **First name invalid after blur.** "First name, edit text, required, invalid entry. This field is required."
4. **Submitting step 1 empty.** "There is a problem. First name: this field is required. Last name: this field is required. Email: this field is required."
5. **Step 2 heading after Next.** "Account, heading, level 2."
6. **Confirm-password mismatch.** "Confirm password, edit text, required, invalid entry. Passwords do not match."
7. **Step 3 review.** Each `<dt>` / `<dd>` pair is announced as label / value.
8. **Successful submit.** "Thank you. Your account has been created." (Or whatever your success message says.)

Most failures will be ARIA issues. The mini-project's screen-reader test is the one you spend the most time fixing; budget for it.

### Phase 9 — README + commit (30 min)

Write the README. The **three-design-decisions** section is the most important part of the document; spend on it. Include a WCAG conformance table:

| SC | Level | Satisfied by |
|----|-------|--------------|
| 1.3.1 Info and Relationships | A | Every input has a `<label for>` ... |
| 1.3.5 Identify Input Purpose | AA | Every input has an `autocomplete` token from §4.10.18.7 ... |
| 2.1.1 Keyboard | A | ... |
| 2.4.3 Focus Order | A | Focus moves to step heading on transition ... |
| 2.4.7 Focus Visible | AA | `:focus-visible` outline on every interactive control ... |
| 3.3.1 Error Identification | A | `aria-invalid="true"` + inline message + summary ... |
| 3.3.2 Labels or Instructions | A | Helper text on every constrained field ... |
| 3.3.3 Error Suggestion | AA | Every message says what to fix ... |
| 3.3.4 Error Prevention | AA | Step 3 review summary lets the user check before submit ... |
| 4.1.2 Name, Role, Value | A | Every control has a name, role, and value ... |

Run the validator, axe, and Lighthouse one more time. Commit. Push. Ship.

---

## Keyboard cheat sheet (paste this in your README)

| Key | When | Behavior |
|-----|------|----------|
| `Tab` | Anywhere | Move to the next focusable element in source order. |
| `Shift+Tab` | Anywhere | Move to the previous focusable element. |
| `Enter` | On Next button | Validate the current step; advance if valid. |
| `Enter` | On any input | Submit the form (which advances the step). |
| `Enter` | On a progress-step button | Jump to that step (if visited). |
| `Enter` | On an Edit link in the review summary | Jump back to that step and focus the field. |
| `Space` | On a checkbox | Toggle the checkbox. |

---

## What "done" looks like

The form walks a stranger through three steps with the keyboard alone. The screen reader announces every transition. Validation runs per step. The error summary catches every error on every failed Next. The Edit links from step 3 jump back cleanly. The final submit logs the full FormData to the console and replaces the form with a thank-you message. axe is clean. Lighthouse accessibility is at least 95 on every step. The page passes the validator. Your README defends three design decisions with citations to the HTML Living Standard or to WCAG by SC number.

When all of that is true, push to GitHub and tag the commit `v0.6.0`. Continue to [Week 7 — Tooling, Modules, and Web Components](../../week-07/).

---

## Stretch (any one of these earns "deep dive" credit)

- **Save and resume.** Persist `state.values` to `localStorage` on every input. On page load, if a saved state exists, offer the user a "Resume" button that re-populates the form. The Week 4 storage pattern transfers; the form is the new surface.
- **Async username availability.** When the user types a username, after a 400 ms debounce, "look up" availability against a hard-coded `Promise.resolve(value.includes('taken'))`. Show "Checking…" then "Available" or "Taken." Use a `role="status"` live region. Week 8 will replace the hard-coded check with a real fetch.
- **Password strength meter.** Add a visible meter below the password field showing strength (0–4) based on length, character classes, and a simple zxcvbn-style algorithm. The meter is an `<output>` element with `aria-live="polite"`. Hide via `aria-hidden` while the field is empty.
- **i18n.** Make every error message and helper text load from a `messages.en.json` file. Add `messages.es.json` with translated strings. Switch via a language selector at the top of the form. The `<html lang>` attribute updates accordingly.
- **Server-side echo.** Submit the form to `httpbin.org/post`. On success, render the returned JSON as a confirmation. Week 8 covers `fetch` properly; this stretch is the warm-up.

Save stretches in `mini-project-stretch/`, not in the main mini-project folder. The mini-project itself should be small and complete.

---

*If you find errors in this material, please open an issue or send a PR. Future learners will thank you.*
