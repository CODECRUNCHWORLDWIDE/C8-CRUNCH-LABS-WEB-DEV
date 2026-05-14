# Exercise 3 — Error messaging and accessibility

**Time:** ~60 minutes.

## Problem statement

Take the form from Exercise 2. Keep every line of JavaScript you wrote. Add the **accessibility wiring** that makes every error legible to a screen reader: `aria-invalid` on each input, `aria-describedby` linking each input to its inline error, an **error summary** with `role="alert"` at the top of the form for submission failures, and focus management that lands the user on the right element after every state change.

Then test the form with a screen reader — VoiceOver on macOS, NVDA on Windows, or Orca on Linux. Take notes on what is announced and when. Fix the gaps. The acceptance criteria below include explicit announcement-shape checks; you cannot pass them by reading the code, only by listening.

```text
┌──────────────────────────────────────────────────┐
│ ●●●    http://localhost:5500/                    │
├──────────────────────────────────────────────────┤
│                                                  │
│   ⚠  There is a problem                          │
│   ─────────────────────────                      │
│   • Full name: This field is required.           │
│   • Email: Enter a valid email address.          │
│   • Message: Use at least 20 characters.         │
│                                                  │
│   Contact us                                     │
│                                                  │
│   Full name *                                    │
│   ┌──────────────────────────────────┐           │
│   │                                  │           │
│   └──────────────────────────────────┘           │
│   This field is required.                        │
│                                                  │
└──────────────────────────────────────────────────┘
```

## Source content

Copy the Exercise 2 files into `exercises/exercise-03/`. You will modify both the HTML and the JS. No new files.

The accessibility wiring you add:

### 1. The error elements get unique ids

```html
<div class="field">
  <label for="name">Full name</label>
  <input
    id="name"
    name="name"
    type="text"
    autocomplete="name"
    minlength="2"
    maxlength="100"
    aria-describedby="name-error"
    aria-invalid="false"
    required>
  <p id="name-error" class="error-message" hidden></p>
</div>
```

Two new attributes on every input:

- **`aria-describedby="<error-id>"`** — links the input to the inline error. The screen reader, when focus reaches the input, announces the input's name (from `<label>`) plus the input's description (from the linked element's text). Per WAI-ARIA 1.2 §6.6.4.
- **`aria-invalid="false"`** initially — toggled to `"true"` when the field is invalid. Per WAI-ARIA 1.2 §6.6.7.

### 2. The error summary

Above the form, add the error summary region:

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

- **`role="alert"`** — per WAI-ARIA 1.2 §5.3.4.1, screen readers announce the alert's content as soon as it becomes visible. We move from `hidden` to visible; the screen reader speaks.
- **`tabindex="-1"`** — not in the tab order, but `.focus()` works programmatically. After we render errors, we focus the summary so the screen reader is parked at the top.

## Acceptance criteria

- [ ] `exercises/exercise-03/index.html`, `exercises/exercise-03/styles.css`, and `exercises/exercise-03/script.js` exist.
- [ ] The page passes <https://validator.w3.org/nu/> with zero errors.
- [ ] **Every input** has `aria-describedby` pointing at its inline error element.
- [ ] **Every input** has `aria-invalid` (set to `"false"` initially, `"true"` when invalid). Toggle both attribute *and* the inline error's visibility together; the two are always in sync.
- [ ] **The error summary** is present at the top of the form. It is `hidden` until a submission fails; it is visible when there are errors.
- [ ] On a failed submit:
  - The summary populates with one list item per invalid field. Each item is an `<a href="#field-id">` linking to the field; the link's text reads `"<label>: <error message>"`.
  - The summary is unhidden.
  - **Focus moves to the summary** (`summary.focus()`).
  - The screen reader announces "There is a problem" plus the list of errors (because of `role="alert"`).
- [ ] Clicking a summary link focuses the corresponding field (anchor links work natively; no extra JavaScript needed for this — the field has an `id`, the link has `href="#that-id"`).
- [ ] On a successful submit, the summary is hidden again (or, equivalently, removed from the DOM). The thank-you message replaces the form.
- [ ] **Required-field indicators** are visible: append a visible `*` to the label of each required field, plus a `<p>` above the form explaining that "Fields marked with * are required." Per WCAG 2.2 SC 3.3.2.
- [ ] **The asterisk is not announced as "star."** Wrap the asterisk in a `<span aria-hidden="true">*</span>` so screen readers skip it. The `required` attribute is already in the accessibility tree; the visual asterisk is for sighted users only.
- [ ] **Helper text** for the message field: a `<p id="message-hint">` above the textarea reads "Tell us how we can help (20 characters minimum)." Add the id to the textarea's `aria-describedby`: `aria-describedby="message-hint message-error"`. Per WAI-ARIA: `aria-describedby` accepts a space-separated list.
- [ ] **axe DevTools** reports zero serious or critical issues.
- [ ] **Screen-reader announcement check (the load-bearing part).** Test with one of VoiceOver, NVDA, or Orca. The expected announcements (wording may vary; the *shape* must be correct):
  - On focus of an empty required field: *"Full name, edit, required, invalid entry, this field is required."* (Or similar — the label, the role, the required state, the invalid state, the error message.)
  - On submit with errors: *"There is a problem. Full name: this field is required. Email: enter a valid email address. Message: use at least 20 characters."* (The alert announces the heading plus the list.)
- [ ] Document the screen-reader test in a short `NOTES.md` in the exercise folder. Include: which screen reader, which OS, the exact phrases announced for two of the failure paths above, and one thing you had to fix to make it announce correctly.

## JavaScript hints

Update `showError` and `clearError` from Exercise 2 to also toggle `aria-invalid`:

```js
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
```

The `.split(' ').find(...)` extracts only the error id from the (possibly space-separated) `aria-describedby` value — so the helper-text id (`message-hint`) is ignored.

Add the summary functions:

```js
function showErrorSummary(invalidInputs) {
  const summary = document.getElementById('error-summary');
  const list = summary.querySelector('ul');
  list.replaceChildren();

  for (const input of invalidInputs) {
    const li = document.createElement('li');
    const link = document.createElement('a');
    link.href = `#${input.id}`;
    link.textContent = `${input.labels[0].textContent.replace('*', '').trim()}: ${getError(input)}`;
    li.append(link);
    list.append(li);
  }

  summary.hidden = false;
  summary.focus();
}

function hideErrorSummary() {
  const summary = document.getElementById('error-summary');
  summary.hidden = true;
  summary.querySelector('ul').replaceChildren();
}
```

Update the submit handler to collect invalid inputs and render the summary:

```js
form.addEventListener('submit', (event) => {
  event.preventDefault();

  const inputs = [...form.querySelectorAll('input, textarea')];
  const invalid = inputs.filter(i => !i.checkValidity());

  if (invalid.length > 0) {
    for (const input of invalid) showError(input);
    showErrorSummary(invalid);
    return;
  }

  hideErrorSummary();
  const data = new FormData(form);
  console.log('Submitted:', Object.fromEntries(data));
  form.replaceWith(Object.assign(document.createElement('p'), {
    textContent: 'Thank you. Your message was sent.',
  }));
});
```

The summary's `role="alert"` is what makes the new content audible. The `summary.focus()` call sends the user's keyboard to the top of the form, which is also where the announcement happens — they are co-located. The user can then `Tab` into the field list, or click a summary link to jump directly to an error.

## What to test

The keyboard-only walkthrough (close your trackpad):

1. **Tab to "Send," press `Enter`.** Focus jumps to the error summary at the top of the form. The screen reader announces "There is a problem" plus the list of errors.
2. **Tab from the summary.** Focus moves into the form to the first invalid field. The screen reader announces the field's label, type, required state, invalid state, and error message.
3. **Type into the field.** As the field becomes valid, `aria-invalid` flips to `"false"` and the inline error clears. The screen reader does not re-announce on the input event (because `aria-invalid` toggling is silent unless paired with a live region; this is correct behavior — the user is the one acting).
4. **Click a summary link with the keyboard.** Tab to the link, press `Enter`. Focus jumps to the linked field. The screen reader announces the field.
5. **Submit again with one remaining error.** The summary updates with the single remaining error. Focus moves to the summary; the alert is announced again.
6. **Fill the form correctly; submit.** Summary disappears. Thank-you message appears. Screen reader announces the thank-you (if it has live-region behavior — usually no, because `<p>` is not live by default; this is acceptable for the exercise but you can add `role="status"` if you want it announced).

## Hints

<details>
<summary>Why <code>tabindex="-1"</code> on the summary?</summary>

Two reasons:

1. **Programmatic focus.** `summary.focus()` only works on elements that are focusable. A `<div>` is not focusable by default; adding `tabindex="-1"` makes it focusable via `.focus()` without inserting it into the natural Tab order.
2. **The summary is a destination, not a stop.** When the user is tabbing through the form normally (no errors), they should not have to tab through the empty summary. `tabindex="-1"` keeps it out of the natural tab order.

If you set `tabindex="0"`, the summary would be in the tab order, and the user would have to tab through it on every pass — annoying when there are no errors.

</details>

<details>
<summary>Why use anchor links in the summary instead of <code>.focus()</code> calls in JS?</summary>

Native anchor links are simpler, free, and accessible by default:

- They work without JavaScript (a click on `<a href="#name">` focuses the element with `id="name"`).
- They appear in the browser's back-button history (the user can press Back to return to the summary).
- They are right-clickable, copyable, share-able as URLs (a user can save `mypage.html#name` to jump back to the error).
- They show in the address bar (the URL changes to `mypage.html#name`), which on some screen readers gives a useful announcement.

A JavaScript `summary.addEventListener('click', ...)` solution would have to re-implement all of these. The native anchor is the right tool.

</details>

<details>
<summary>Why <code>role="alert"</code> instead of <code>aria-live="assertive"</code>?</summary>

`role="alert"` is the WAI-ARIA shortcut for an assertive live region with sensible defaults. Per WAI-ARIA 1.2 §5.3.4.1, `role="alert"` implies:

- `aria-live="assertive"` — interrupt whatever the screen reader is reading.
- `aria-atomic="true"` — read the entire region as a unit, not just the changed parts.
- The region is intended for important, time-sensitive information.

For an error summary on a form submission, the user has just clicked Submit and is waiting for feedback. Interrupting them with "There is a problem" is the right behavior — they want to know immediately. `role="alert"` is the conventional choice.

If you used a live region for a less-urgent message (a status indicator, a "saved" toast), you would use `role="status"` (`aria-live="polite"`) instead.

</details>

<details>
<summary>Should I also focus the first invalid field directly?</summary>

You have two design choices:

1. **Focus the summary** (the GOV.UK Design System pattern; the one we use here). The user reads the summary, then chooses which error to fix first.
2. **Focus the first invalid field directly.** The user immediately starts fixing the first error without seeing the summary.

Option 1 is more accessible for screen-reader users: they hear all errors at once, then navigate. Option 2 is sometimes preferred for sighted users with simple forms.

The right answer depends on the form. For Exercise 3 and the mini-project, use Option 1. Document the choice in your `NOTES.md` if you deviate.

</details>

<details>
<summary>The screen reader does not announce the error when I tab to the field. Why?</summary>

Three possible causes, in decreasing order of likelihood:

1. **`aria-describedby` does not point at the error element.** Double-check the id matches exactly. Open the Firefox Accessibility panel, click the input, look at "Description." If it is empty, the link is broken.
2. **The error element is `hidden` when the user reaches the field.** Some screen readers do not read descriptions whose target element is `hidden`. Try: keep the element present but set `textContent = ''` instead of toggling `hidden`. Or wrap with `aria-hidden` instead of the `hidden` attribute. Test both with your screen reader.
3. **`aria-invalid` is not set to `"true"`.** Most screen readers gate the "invalid entry" announcement on `aria-invalid="true"`. If you forgot to set it, the field's description reads but the "invalid" announcement does not.

The Firefox Accessibility panel is your friend here: it shows you exactly what the screen reader sees, attribute by attribute.

</details>

## What "done" looks like

Tab through the form with the keyboard alone. Every field is reachable. Every label is read. Every required field announces "required." When the form is submitted invalid, the summary appears, focus moves to it, the screen reader announces all errors. Clicking a summary link focuses the corresponding field. As the user types to fix each error, the inline error clears silently. Re-submitting with remaining errors shows the updated summary; re-submitting with everything fixed runs the success path.

If every assertion above is green and your `NOTES.md` documents the screen-reader test, commit this folder to your Week 6 repo and you are ready for the [mini-project](../mini-project/README.md).

## Stretch

If you finish early:

- Replace `aria-describedby` for the error with `aria-errormessage` (per WAI-ARIA 1.2 §6.6.6). Test with every screen reader you have. Document which ones announce the error correctly and which ones don't. The exercise rehearses the trade-off the lecture covered.
- Add a **"summary updates as fields are fixed"** behavior: every time `clearError` is called for a field that was in the summary, remove its summary item. The summary is now a live snapshot of remaining errors. Caveat: the focus-after-submit behavior should still work; do not focus the summary on every clear.
- Add a **field-level live region** (`role="status"` next to each input) and announce "looking up email…" while a debounced async check is in flight. The pattern is the Week 8 spoiler. Today's `isEmailTaken` returns `Promise.resolve(value.includes('taken'))`; Week 8 will replace it.

Save stretches in `exercises/exercise-03-stretch/` so the core exercise stays clean.
