# Exercise 2 — JS validation layer

**Time:** ~55 minutes.

## Problem statement

Take the contact form from Exercise 1. Keep every HTML5 constraint attribute. Add a JavaScript layer that does three things:

1. **Reads `ValidityState`** for each field and produces a useful, human-readable error message.
2. **Suppresses the native validation bubble** (the platform's default error UI) and renders an inline error message in the field's own slot.
3. **Submits via `event.preventDefault()`** and reads the form's data with `new FormData(form)`. The data is logged to the console.

You do not yet add `aria-invalid`, `aria-describedby`, or any other accessibility wiring — that is Exercise 3. This exercise is about the mechanics of intercepting validation and the discipline of reading `ValidityState` rather than re-deriving every rule.

```text
┌──────────────────────────────────────────────────┐
│ ●●●    http://localhost:5500/                    │
├──────────────────────────────────────────────────┤
│                                                  │
│   Contact us                                     │
│                                                  │
│   Full name                                      │
│   ┌──────────────────────────────────┐           │
│   │ J                                │           │
│   └──────────────────────────────────┘           │
│   Use at least 2 characters.                     │
│                                                  │
│   Email address                                  │
│   ┌──────────────────────────────────┐           │
│   │ not-an-email                     │           │
│   └──────────────────────────────────┘           │
│   Enter a valid email address.                   │
│                                                  │
└──────────────────────────────────────────────────┘
```

## Source content

Copy the Exercise 1 files into `exercises/exercise-02/`. Add one new file: `exercises/exercise-02/script.js`. Link it from `<head>` with `defer`:

```html
<script src="./script.js" defer></script>
```

Modify the HTML: add a `<p class="error-message" hidden></p>` element after every input. Do not yet add `aria-describedby` to the inputs — that is Exercise 3.

```html
<div class="field">
  <label for="name">Full name</label>
  <input id="name" name="name" type="text" autocomplete="name" minlength="2" maxlength="100" required>
  <p class="error-message" hidden></p>
</div>
```

Repeat for `email`, the radio group (one error element after the last radio), and `message`.

Modify the form tag: keep the `action` attribute but the JavaScript will `preventDefault` on submit. You can leave `action` blank or pointing at `httpbin.org`; it does not matter, the submission never reaches the network.

## Acceptance criteria

- [ ] `exercises/exercise-02/index.html`, `exercises/exercise-02/styles.css`, and `exercises/exercise-02/script.js` exist; the script is loaded with `defer`.
- [ ] The page passes <https://validator.w3.org/nu/> with zero errors.
- [ ] **The native validation bubble is never shown.** When the user submits an invalid form, your inline messages appear; the platform's bubble does not.
- [ ] Every error message comes from a `getError(input)` function that reads `input.validity` and returns a string based on which flag is set.
- [ ] The `getError` function handles **every** `ValidityState` flag: `valueMissing`, `typeMismatch`, `patternMismatch`, `tooShort`, `tooLong`, `rangeUnderflow`, `rangeOverflow`, `stepMismatch`, `badInput`, `customError`.
- [ ] Errors appear **on blur** (when the user tabs away from a field) and **clear on input** (when the user types in a previously-invalid field that is now valid).
- [ ] On submit:
  - If the form is invalid, your inline errors appear; the form does **not** submit.
  - If the form is valid, `event.preventDefault()` runs, `new FormData(form)` reads the entries, the entries are logged with `console.log(Object.fromEntries(formData))`, and a success message replaces the form (or appears below it).
- [ ] The submit handler reads `event.submitter` and verifies that it is the "Send" button (defensive coding for forms with multiple submit buttons later).
- [ ] **No `innerHTML` anywhere.** Use `textContent` to set the error message text.
- [ ] No `var` declarations. `const` by default; `let` where you must reassign.
- [ ] The page renders cleanly at 320 px viewport. Errors do not cause horizontal scroll.

## JavaScript hints

The shape of the script:

```js
const form = document.querySelector('form');

const messages = {
  valueMissing: () => 'This field is required.',
  typeMismatch: (input) => {
    if (input.type === 'email') return 'Enter a valid email address.';
    if (input.type === 'url') return 'Enter a valid URL.';
    return 'Enter a valid value.';
  },
  patternMismatch: (input) => input.title || 'Please match the requested format.',
  tooShort: (input) => `Use at least ${input.minLength} characters.`,
  tooLong: (input) => `Use at most ${input.maxLength} characters.`,
  rangeUnderflow: (input) => `Enter ${input.min} or higher.`,
  rangeOverflow: (input) => `Enter ${input.max} or lower.`,
  stepMismatch: (input) => `Use a multiple of ${input.step}.`,
  badInput: () => 'Enter a value the field accepts.',
  customError: (input) => input.validationMessage,
};

function getError(input) {
  for (const key of Object.keys(messages)) {
    if (input.validity[key]) return messages[key](input);
  }
  return '';
}

function showError(input) {
  const field = input.closest('.field');
  const errorEl = field.querySelector('.error-message');
  errorEl.textContent = getError(input);
  errorEl.hidden = false;
}

function clearError(input) {
  const field = input.closest('.field');
  const errorEl = field.querySelector('.error-message');
  errorEl.textContent = '';
  errorEl.hidden = true;
}

for (const input of form.querySelectorAll('input, textarea')) {
  input.addEventListener('blur', () => {
    if (!input.checkValidity()) showError(input);
    else clearError(input);
  });
  input.addEventListener('input', () => {
    if (input.checkValidity()) clearError(input);
  });
  input.addEventListener('invalid', (event) => {
    event.preventDefault();   // suppress the native bubble
    showError(input);
  });
}

form.addEventListener('submit', (event) => {
  event.preventDefault();

  let allValid = true;
  for (const input of form.querySelectorAll('input, textarea')) {
    if (!input.checkValidity()) {
      showError(input);
      allValid = false;
    }
  }

  if (allValid) {
    const data = new FormData(form);
    console.log('Submitted:', Object.fromEntries(data));
    form.replaceWith(Object.assign(document.createElement('p'), {
      textContent: 'Thank you. Your message was sent.',
    }));
  }
});
```

You will adjust this shape for your own DOM. The function names — `getError`, `showError`, `clearError` — are the names you will hear in any senior-developer code review. Use them.

## What to test

Walk through each failure path with the keyboard only:

1. **Empty submit.** Tab to Send, press `Enter`. Every required field's inline error should appear. The native bubble should not appear.
2. **Bad email, then tab away.** The email field's inline error should read "Enter a valid email address." The bubble should not appear.
3. **Fix the bad email.** As you type a valid address, the error message should clear on input — not wait for blur.
4. **Short message.** Type "Hi." into the textarea, tab away. The message should read "Use at least 20 characters."
5. **Valid submit.** Fill everything correctly. Submit. The console should log `{ name: '...', email: '...', topic: '...', message: '...' }`. The form should be replaced with the thank-you paragraph.

Open the **Network panel** in DevTools. After a valid submission, you should see **no network request**. The form's `action` is intercepted by `event.preventDefault()`.

## Hints

<details>
<summary>Why does <code>event.preventDefault()</code> on the <code>invalid</code> event suppress the bubble?</summary>

Per HTML Living Standard §4.10.21.4: "When the `invalid` event is fired on a form control whose `willValidate` attribute is true, the user agent should report the problems with the constraints of that element to the user, unless one of the event listeners for that event has cancelled the event."

Calling `event.preventDefault()` "cancels the event" in the spec's terms; the browser refuses to show its native UI on cancelled events. The constraint is still violated; the platform just leaves the UI to you.

This is the canonical pattern for replacing the bubble with your own inline messages. Suppressing it once per field is correct; suppressing it on the form's `invalid` event does *not* work (the event does not bubble).

</details>

<details>
<summary>Why iterate <code>Object.keys(messages)</code> rather than checking each flag with an <code>if</code> chain?</summary>

Both work. The table approach has three advantages:

1. **Adding a new constraint is one line.** If a future ECMAScript or HTML version adds a new validity flag, you add a key to the `messages` object; the loop picks it up automatically.
2. **Translation is straightforward.** If you ever localize the form, you replace the `messages` object's English strings with localized ones (or load from a translation file). No code changes.
3. **The order of checks is explicit.** `Object.keys` returns keys in insertion order (per ECMAScript §10.7); you control the precedence of messages by where you place them in the literal.

The if-chain approach reads more linearly but mixes the data (which messages) with the logic (which order). The table approach separates them. Pick whichever your team prefers; the table is the slightly more senior pattern.

</details>

<details>
<summary>Why <code>input.closest('.field')</code> instead of <code>input.nextElementSibling</code>?</summary>

`closest` walks up the tree until it finds a match; `nextElementSibling` reads the next element at the same level. The two answer different questions:

- `closest('.field')` says: *find the wrapping field container, regardless of the input's exact position inside it.* If the markup grows (a helper icon, a description) the lookup still works.
- `nextElementSibling` says: *find the next element at this exact level.* If the markup grows (a helper icon between the input and the error), the lookup breaks.

Per the principle of "decouple structure from JavaScript," prefer `closest` plus a `.querySelector` on the result. The JavaScript reads the markup looking for a container, not for an exact sibling.

This is the same pattern you used in Week 5 for `event.target.closest('button')`. The discipline transfers.

</details>

<details>
<summary>How do I read every field's data once the form is valid?</summary>

```js
const data = new FormData(form);
console.log(Object.fromEntries(data));
```

`new FormData(form)` walks every form-associated element inside the form and produces an iterable of name/value pairs. `Object.fromEntries` converts that iterable into a plain object — easy to log, easy to send via `fetch` in Week 8.

For fields that contribute multiple values (a multi-select, a checkbox group sharing a name), use `data.getAll(name)` to get the array:

```js
const data = new FormData(form);
const interests = data.getAll('interests');   // ['music', 'film', 'books']
```

`Object.fromEntries` will only keep the last value for repeated keys; if you have multi-value fields, build the object by hand or convert each repeated entry to `getAll`.

</details>

<details>
<summary>The textarea's <code>tooShort</code> never fires until the user submits. Is that a bug?</summary>

Not a bug — a documented quirk of the `tooShort` flag. Per HTML Living Standard §4.10.5.5.7: "the `tooShort` flag is set if the value is non-empty and shorter than `minLength` *after the value has been edited by the user*." The flag specifically does *not* fire when the user has not yet typed.

In practice: `tooShort` will not light up on first blur of an empty field (the field would fail `valueMissing` instead). It lights up the moment the user types one character and tabs away with fewer than `minLength` characters total.

The same is true of `tooLong` (rarely seen because `maxLength` enforces the cap at typing time) and of `patternMismatch` on an empty value (an empty string passes a pattern; combine with `required` for "must match the pattern and be non-empty").

</details>

## What "done" looks like

The page loads. Every label is visible. Tab order matches source order. Every required field refuses to submit empty. Every error appears inline, no bubble. Errors clear as the user fixes them. The valid submission logs the form data to the console and replaces the form with a thank-you message. The Network panel shows no requests.

If every assertion above is green, commit this folder to your Week 6 repo and move on to **Exercise 3 — Error messaging and accessibility**. Exercise 3 takes this same form and makes every error announceable to a screen reader, plus adds the error-summary pattern.

## Stretch

If you finish early:

- Add a **password + confirm-password** pair to the form. Use `setCustomValidity('Passwords do not match.')` on the confirm field when the two diverge; clear with `setCustomValidity('')` when they match. Wire up both inputs to re-check on every keystroke.
- Add an **async availability check** for the username (if you have one) or the email. Debounce by 400 ms; show "Checking…" as helper text; call `setCustomValidity` based on a hard-coded `Promise.resolve` whose value is `true` if the email contains the substring "taken." This rehearses the Week 8 network pattern in a synchronous skeleton.
- Refactor the script into two ES modules: `validation.js` exports `getError`, `showError`, `clearError`; `main.js` imports them and wires the listeners. The split is the shape you will use in the mini-project.

Save stretches in `exercises/exercise-02-stretch/` so the core exercise stays clean.
