# Challenge 1 — Multi-step form with state

**Time estimate:** ~140 minutes.

## Problem statement

Build a three-step form that walks the user through three small fieldsets — "Your details," "Account," and "Confirm" — with Next / Back navigation between them. The form keeps its state in a single JavaScript object, validates each step independently, surfaces inline errors per the Exercise 3 pattern, and indicates progress with a visible list of steps marked by `aria-current="step"`. Focus moves to the new step's heading on every transition. The whole form is keyboard-navigable end-to-end.

This is the **scoped-down rehearsal** for the mini-project. The mini-project's three steps collect ten fields total, with custom validation and a real review step. The challenge's three steps collect five fields total — enough to exercise the state model, the focus dance, and the progress indicator without the per-field complexity of the mini-project.

```text
┌──────────────────────────────────────────────────┐
│ ●●●    http://localhost:5500/                    │
├──────────────────────────────────────────────────┤
│                                                  │
│   Sign up  (Step 2 of 3)                         │
│                                                  │
│   ◯ 1. Your details                              │
│   ● 2. Account              ← aria-current       │
│   ◯ 3. Confirm                                   │
│                                                  │
│   Account                                        │
│                                                  │
│   Username                                       │
│   ┌──────────────────────────────────┐           │
│   │ amelia                           │           │
│   └──────────────────────────────────┘           │
│                                                  │
│   Password                                       │
│   ┌──────────────────────────────────┐           │
│   │ ••••••••••                       │           │
│   └──────────────────────────────────┘           │
│                                                  │
│   [ Back ]                  [ Next ]             │
│                                                  │
└──────────────────────────────────────────────────┘
```

Reference: <https://design-system.service.gov.uk/patterns/gather-information/> (GOV.UK Design System's "service pattern" for multi-step forms).

## Acceptance criteria

- [ ] Folder: `challenges/challenge-01/`, with `index.html`, `styles.css`, `script.js`, and `NOTES.md`.
- [ ] One `<script src="./script.js" defer></script>` tag (modules optional; not required for the challenge).
- [ ] **Three steps**, each a `<fieldset>` with a `<legend>` that is also the step's heading. Only one step is visible at a time (use the `hidden` attribute; do not use `display: none` via CSS — keep the source of truth in the DOM).
- [ ] **Step 1 — Your details:** `given-name` and `family-name` inputs. Both required.
- [ ] **Step 2 — Account:** `username` and `new-password` inputs. Username is `[a-zA-Z0-9]{3,20}`, password is `minlength="8"`.
- [ ] **Step 3 — Confirm:** a read-only summary of every value entered so far, presented as a definition list (`<dl>`), plus a "Confirm and submit" button.
- [ ] **State model.** A single JS object holds: `{ step: 0, values: {} }`. Every transition mutates state, then re-renders.
- [ ] **Per-step validation.** Clicking "Next" validates the current step's fields only. Invalid fields show inline errors per the Exercise 3 pattern. The user does *not* advance until the current step is valid.
- [ ] **Per-step error summary.** When a step fails validation, an `role="alert"` summary appears with the list of errors and focus moves to it.
- [ ] **Focus management.** When the user clicks Next or Back, focus moves to the new step's heading (an `<h2>` with `tabindex="-1"`). The screen reader announces the step name on every transition. Per WCAG 2.2 SC 2.4.3.
- [ ] **Progress indicator.** Above the active step, an `<ol>` lists every step. The current step has `aria-current="step"` per WAI-ARIA 1.2 §6.6.13. Past steps are styled as completed (a check icon, or a different background). Future steps are styled as upcoming. The list is keyboard-navigable (each item is a `<button>` that, if clicked, jumps to that step *if the user has already validated it*).
- [ ] **Back button** is present on steps 2 and 3 (not on step 1). It does not validate (the user is leaving the step, not committing it). It simply moves to the previous step and refocuses the heading.
- [ ] **Next button** is present on steps 1 and 2. On step 3, the button reads "Confirm and submit."
- [ ] **Final submit** runs `event.preventDefault()`, reads `new FormData(form)` for every field (every step's fields are still in the DOM — they were only `hidden`), logs the entries, and replaces the form with a success message.
- [ ] **State persistence within a session.** If the user clicks Next from step 1 and then clicks Back, the values they entered on step 1 are still there. (This is automatic if you use `hidden` rather than removing/recreating elements.)
- [ ] **No `innerHTML` anywhere.** Use `textContent` and `append`.
- [ ] **axe DevTools**: zero serious or critical issues on every step.
- [ ] **Validator**: zero errors.
- [ ] **NOTES.md**: a 200-word explanation covering (a) why you chose `hidden` for step visibility (instead of removing elements), (b) the WCAG Success Criteria you tested against (cite by number), and (c) one design decision you would defend in a code review.

## Suggested order of operations

### Phase 1 — Markup (30 min)

Type the HTML by hand. Use the right structure from the outset; do not retrofit ARIA. The base markup:

```html
<main>
  <h1>Sign up</h1>
  <p class="progress-context" id="step-context">Step 1 of 3</p>

  <ol class="progress" aria-label="Signup progress">
    <li><button type="button" data-step="0" aria-current="step">Your details</button></li>
    <li><button type="button" data-step="1" disabled>Account</button></li>
    <li><button type="button" data-step="2" disabled>Confirm</button></li>
  </ol>

  <div id="error-summary" role="alert" tabindex="-1" hidden>
    <h2 id="error-summary-heading">There is a problem</h2>
    <ul></ul>
  </div>

  <form>
    <fieldset data-step="0">
      <legend><h2 tabindex="-1">Your details</h2></legend>
      <!-- given-name, family-name, with labels and error <p> elements -->
    </fieldset>

    <fieldset data-step="1" hidden>
      <legend><h2 tabindex="-1">Account</h2></legend>
      <!-- username, new-password -->
    </fieldset>

    <fieldset data-step="2" hidden>
      <legend><h2 tabindex="-1">Confirm</h2></legend>
      <dl id="summary-list"></dl>
    </fieldset>

    <div class="form-actions">
      <button type="button" data-action="back" hidden>Back</button>
      <button type="submit" data-action="next">Next</button>
    </div>
  </form>
</main>
```

Note `<legend>` containing an `<h2>` is non-standard per the HTML Living Standard's content model (legend's content model is "phrasing content"). The pragmatic shape: put the heading inside a `<span>` with role="heading" aria-level="2", or use a `<legend>` with the styling of an `<h2>`. Document your choice; both are acceptable for the challenge.

Run the validator. Fix any structural errors before writing JavaScript.

### Phase 2 — The state model (15 min)

```js
const state = {
  step: 0,
  values: {},
};

const STEPS = [
  { id: 0, label: 'Your details', fields: ['given-name', 'family-name'] },
  { id: 1, label: 'Account',      fields: ['username', 'new-password'] },
  { id: 2, label: 'Confirm',      fields: [] },
];
```

A `render()` function reads `state` and applies the DOM updates:

- Show the current step's `<fieldset>`; hide the others.
- Toggle the Back button's visibility (hidden on step 0).
- Update the Next button's label ("Next" on steps 0–1; "Confirm and submit" on step 2).
- Update each progress item's `aria-current` attribute.
- Update the "Step N of 3" context paragraph.
- On step 2, render the summary `<dl>` from `state.values`.

Every transition calls `render()`. There is no other place that mutates the DOM.

### Phase 3 — Navigation handlers (40 min)

Two handlers:

```js
form.addEventListener('submit', (event) => {
  event.preventDefault();
  if (state.step < STEPS.length - 1) {
    goNext();
  } else {
    submitForm();
  }
});

document.querySelector('[data-action="back"]').addEventListener('click', () => {
  goBack();
});
```

The `goNext()` function:

```js
function goNext() {
  const currentStep = STEPS[state.step];
  const fields = currentStep.fields.map(name => form.elements[name]);

  // 1. Validate every field in this step.
  const invalid = fields.filter(f => !f.checkValidity());
  if (invalid.length > 0) {
    for (const input of invalid) showError(input);
    showErrorSummary(invalid);
    return;
  }

  // 2. Capture the values into state.
  for (const field of fields) {
    state.values[field.name] = field.value;
  }

  // 3. Advance.
  state.step += 1;
  hideErrorSummary();
  render();
  focusStepHeading();
}

function goBack() {
  state.step -= 1;
  hideErrorSummary();
  render();
  focusStepHeading();
}

function focusStepHeading() {
  const heading = document.querySelector(`fieldset[data-step="${state.step}"] h2`);
  heading.focus();
}
```

The `focusStepHeading()` call is load-bearing. Without it, focus stays on the now-hidden Next button, and the screen reader is confused. With it, the screen reader announces the new step's heading the moment the user transitions.

### Phase 4 — The summary on step 3 (20 min)

On render, when `state.step === 2`, populate the summary:

```js
function renderSummary() {
  const dl = document.getElementById('summary-list');
  dl.replaceChildren();

  const labels = {
    'given-name': 'First name',
    'family-name': 'Last name',
    'username': 'Username',
    'new-password': 'Password',
  };

  for (const [name, value] of Object.entries(state.values)) {
    const dt = document.createElement('dt');
    dt.textContent = labels[name] || name;
    const dd = document.createElement('dd');
    dd.textContent = name === 'new-password' ? '•'.repeat(value.length) : value;
    dl.append(dt, dd);
  }
}
```

The password is masked in the summary — the user already typed it, no need to display it in plain text on a screen that may be shared. Add an "Edit" link next to each entry that, when clicked, jumps the user back to that field's step. The link can be a `<button type="button" data-step="0">Edit</button>` next to each `<dd>`.

### Phase 5 — Progress indicator interactions (15 min)

The three buttons in the `<ol>` start `disabled`. As the user completes each step, the corresponding step's button becomes enabled (a function of `state.step` and which steps the user has visited):

```js
function renderProgress() {
  for (const button of document.querySelectorAll('.progress button')) {
    const targetStep = parseInt(button.dataset.step, 10);
    button.disabled = targetStep > state.step;
    button.setAttribute('aria-current', targetStep === state.step ? 'step' : 'false');
  }
}
```

The user can click any past or current step's button to jump there. They cannot jump forward to an unvisited step (the button is disabled).

### Phase 6 — Test (20 min)

The keyboard test, the screen-reader test, the axe test — all three.

The keyboard walkthrough:
1. Tab through every form control on step 1. Each has a visible focus indicator.
2. Submit step 1 empty. Errors appear; summary appears; focus moves to summary.
3. Fix errors; advance. Focus moves to step 2's heading. Screen reader announces "Account."
4. Tab through step 2 fields. Submit. Advance to step 3. Confirm summary is correct.
5. Press Back. Step 2's fields are preserved.

The screen-reader walkthrough:
1. Listen to step 1's heading announcement.
2. Listen to the announcement after Next (should be "Account").
3. Listen to the error summary on a failed Next.
4. Listen to step 3's summary list.

## What "done" looks like

The form walks a user through three steps with the keyboard alone. Every transition is announced. Validation runs per step. The error summary catches all the errors on every failed Next. The progress indicator shows where the user is. The Back button preserves state. The Confirm step shows a clean summary. The final submit logs the form data to the console and replaces the form with a success message. axe is clean. The validator is clean. Your `NOTES.md` defends three design decisions with citations.

## Stretch

If you finish early:

- **URL-driven steps.** Encode the current step in the URL fragment (`#step-2`). When the user navigates Back or Forward in the browser, the form respects the URL. Use `history.pushState` for forward transitions; listen for `popstate` for back navigation.
- **Validation on every Back.** When the user clicks Back from a step they had previously completed, *do not* re-validate. When they Next-from a back-then-forward, *do* re-validate (the values may have changed). The pattern requires a small `visited` set inside `state`.
- **Skip steps.** Add a step that only appears under certain conditions (e.g., "Step 2.5: Company details" appears only if the user selected "Business account" on step 2). The state model grows to include conditional steps; the progress indicator updates accordingly.

Save stretches in `challenges/challenge-01-stretch/`.
