# Lecture 1 — HTML5 Form Semantics

> **Outcome:** You can read the **HTML Living Standard §4.10** the way you read a paragraph of CSS. You can pick the right `<input>` type for every piece of data, label every control programmatically, group related controls in a `<fieldset>` with a `<legend>`, configure the HTML5 constraint attributes the platform already enforces, and write `autocomplete` tokens that match the canonical list. By the end of this lecture you ship a contact form with **zero JavaScript** that still validates, still autofills, still labels every control to a screen reader, and still submits its data via the platform's submission algorithm.

## 1. What a form actually is

The **HTML form** is one of the oldest interactive surfaces on the web. The first `<form>` element shipped in **HTML 2.0 in November 1995** — the same year Brendan Eich wrote JavaScript in ten days. For three years, until DOM Level 1 in 1998, forms were the *only* interactive surface in HTML: the only way a user could send data back to a server was to fill a form and submit it. Thirty-plus years later, after rich client-side JavaScript, after AJAX, after single-page applications, after every framework that ever lived, the `<form>` element is still how most websites take input from most users.

Per the **HTML Living Standard §4.10**, a form is "a component of a web page that has form controls, such as text fields, buttons, checkboxes, range controls, or color pickers." The element exists for a reason that has nothing to do with styling: it is the **submission boundary**. When a form submits, the browser collects every form-associated element inside the form, serializes their names and values into either URL-encoded or multipart-encoded format, and dispatches a request to the URL in the form's `action` attribute. That algorithm — defined in §4.10.21.3 — is the same algorithm a browser has run since 1995. Every framework on top of HTML eventually boils down to either using that algorithm or replacing it.

The `<form>` element itself takes a handful of attributes that govern submission:

```html
<form
  action="/submit"
  method="post"
  enctype="multipart/form-data"
  autocomplete="on"
  novalidate>
  <!-- form controls -->
</form>
```

- **`action`** — the URL to submit to. Required for actual submissions; can be empty (which means "this URL") for forms processed entirely client-side.
- **`method`** — `get` (default — the data is appended as URL query parameters) or `post` (the data is in the request body). Use `post` for anything that mutates state or contains anything sensitive.
- **`enctype`** — how the body is encoded. `application/x-www-form-urlencoded` (default) is fine for text-only forms. `multipart/form-data` is required for `<input type="file">`. `text/plain` exists and you will never use it.
- **`autocomplete`** — `on` (default) or `off`. Almost always leave this attribute off the form and set it per-field; the per-field tokens give the browser the actionable hints.
- **`novalidate`** — if present, the browser will not run constraint validation when the form is submitted. We use this in JS-validation patterns; we leave it off when we want the platform's native validation to surface.

This week we will write `event.preventDefault()` on the form's `submit` event so the form does not navigate away — and we will read the data with `new FormData(form)` instead. The submission algorithm we are using is the *event* part; the *navigation* part is replaced by a `console.log`. Week 8 sends a real network request; for now, this is plenty.

---

## 2. The form-associated elements

> **Per HTML Living Standard §4.10.18, a "form-associated element" is one that participates in form submission. The list is short: `<input>`, `<select>`, `<textarea>`, `<button>`, `<output>`, `<object>`, `<fieldset>`, and any custom element that opts in via the ElementInternals API.**

You will reach for five of these regularly:

| Element | Purpose | Submittable? |
|---------|---------|--------------|
| `<input>` | Single-line text, numbers, dates, files, checkboxes, radios, buttons, hidden values — and a dozen more types | Usually yes |
| `<select>` | Single-line dropdown or multi-select | Yes |
| `<textarea>` | Multi-line text | Yes |
| `<button>` | A form action: submit, reset, or a plain button for JavaScript | `type="submit"` triggers submission |
| `<fieldset>` + `<legend>` | A group of controls with a group name | The fieldset itself is not submittable; its children are |

The other three — `<output>`, `<object>`, and form-associated custom elements — exist and are worth knowing about, but are not load-bearing for this week.

A form-associated element is **inside the form** if it is a descendant of the `<form>` element *or* if it has a `form` attribute pointing at the form's id. The second case lets you put a submit button outside the form's tree (rare, but real — useful when the page layout requires it):

```html
<form id="signup-form">
  <input name="email" type="email" required>
</form>

<button type="submit" form="signup-form">Sign up</button>
```

The button submits the form even though it is not a descendant. Per HTML Living Standard §4.10.18.6.

---

## 3. Every input type that ships

> **Per HTML Living Standard §4.10.5, there are twenty-two `type` values for `<input>`. You will use about ten regularly. Picking the right `type` is the single most important decision in any form: the browser uses it to render the right keyboard on mobile, to apply the right HTML5 validation, to enable the right autofill, and to expose the right role to assistive technology.**

The full table, alphabetically:

| `type` | Renders as | Validity flag on bad input |
|--------|-----------|---------------------------|
| `button` | A button (use `<button>` instead — same behavior, more flexible) | n/a |
| `checkbox` | A two-state checkbox | n/a |
| `color` | A color picker | `badInput` if rejected |
| `date` | A date picker (calendar widget in most browsers) | `badInput`, `rangeOverflow`, `rangeUnderflow` |
| `datetime-local` | Date + time picker | `badInput`, `rangeOverflow`, `rangeUnderflow` |
| `email` | A text input that requires an `@` | `typeMismatch` |
| `file` | A file picker | n/a |
| `hidden` | An invisible value to round-trip | n/a |
| `image` | A graphical submit button (legacy — avoid) | n/a |
| `month` | A month picker | `badInput`, `rangeOverflow`, `rangeUnderflow` |
| `number` | A numeric input with spinners | `badInput`, `stepMismatch`, `rangeOverflow`, `rangeUnderflow` |
| `password` | A text input that masks input | n/a |
| `radio` | A two-state radio in a group | n/a |
| `range` | A slider | `rangeOverflow`, `rangeUnderflow`, `stepMismatch` |
| `reset` | A button that resets the form (use sparingly — users almost never want this) | n/a |
| `search` | A text input styled like a search box (often with a clear-X) | n/a |
| `submit` | A submit button (use `<button>` instead) | n/a |
| `tel` | A text input that opens the phone keypad on mobile | n/a (no built-in format) |
| `text` | A single-line text input (default) | `tooShort`, `tooLong`, `patternMismatch` |
| `time` | A time picker | `badInput`, `rangeOverflow`, `rangeUnderflow` |
| `url` | A text input that requires a URL scheme | `typeMismatch` |
| `week` | A week-of-the-year picker | `badInput`, `rangeOverflow`, `rangeUnderflow` |

The four you will reach for most often: **`text`**, **`email`**, **`password`**, **`tel`**. The four that pay big accessibility and mobile-keyboard dividends: **`email`**, **`tel`**, **`url`**, **`number`** — all of them switch the soft keyboard to the right key set on touch devices, save the user a tap or two, and apply useful native validation.

### A note on `tel`

`type="tel"` does **not** apply a format constraint. It exists because phone numbers vary by country and the spec refuses to encode a single format. Use `type="tel"` to get the right mobile keyboard; use `pattern` or a JavaScript layer to enforce a format if you need one. The `inputmode="tel"` attribute is a softer hint that also opens the phone keypad without changing validation semantics.

### A note on `email`

`type="email"` requires *exactly one* `@` and some characters on either side. It does **not** validate that the address is reachable; it cannot — the only way to know is to send mail and wait for a reply. The spec's regex is intentionally lax (per §4.10.5.1.5): the browser accepts addresses the formal RFC 5322 grammar would reject, because most real email addresses violate RFC 5322 in some small way and rejecting them is worse than accepting them.

The `multiple` attribute on `type="email"` allows a comma-separated list of addresses. Useful for "send to multiple people."

### A note on `password`

`type="password"` masks the input; that is the entire functionality. It does **not** apply any minimum length constraint by default; you must add `minlength`, `maxlength`, or `pattern` for that. Set the `autocomplete` attribute carefully — `current-password` for login, `new-password` for signup. The difference matters: browsers offer to generate a strong password when they see `new-password`, and they fill the last-used password when they see `current-password`.

---

## 4. Labeling — five ways, one right answer

> **Per WCAG 2.2 SC 1.3.1 (Info and Relationships, Level A) and SC 4.1.2 (Name, Role, Value, Level A), every form control must have a programmatically determinable label. Per the WebAIM Million, empty form labels and missing form labels together account for about half of all detectable accessibility issues on the web. This section is the single most important page in the entire week.**

There are five ways to associate a label with a form control. Four of them are correct in some situation; one of them is never correct. We will work them in order of preference.

### Option 1 — `<label for>` (the default, preferred)

```html
<label for="email">Email address</label>
<input id="email" name="email" type="email" required>
```

The `<label>` element's `for` attribute points to the `id` of the input. This is the canonical association: the label appears visually adjacent to the input, the screen reader announces the label when the input receives focus, and clicking the label focuses the input. Use this every time the visual design allows it.

### Option 2 — Implicit labeling (wrapping)

```html
<label>
  Email address
  <input name="email" type="email" required>
</label>
```

When the `<input>` is a descendant of the `<label>`, the association is automatic; you can drop the `for`/`id` pair. The two forms behave identically. Some teams prefer the wrapped form (no id management); some prefer the explicit `for` form (the label and the input are siblings in the DOM, which is sometimes easier to style). Either is acceptable per the HTML Living Standard.

### Option 3 — `aria-labelledby` (when the label lives elsewhere)

```html
<h2 id="shipping-heading">Shipping address</h2>
<input
  type="text"
  name="street"
  aria-labelledby="shipping-heading street-label"
  placeholder="123 Main St">
<span id="street-label" hidden>Street address</span>
```

`aria-labelledby` accepts a space-separated list of element ids; the accessible name is composed of their text content in order. Use this when the visual design does not allow a `<label>` adjacent to the input — for example, when the heading of the section also serves as the input's label. Note: the elements referenced do not need to be visible (`hidden` works); they do need to exist in the DOM.

### Option 4 — `aria-label` (the last resort)

```html
<input type="search" name="q" aria-label="Search the site">
```

Use `aria-label` only when there is genuinely no visual label and adding one would harm the design. The classic case is a search input whose icon-only context makes the purpose obvious to a sighted user; the screen reader needs the explicit name. Use it sparingly. Per the W3C "Using ARIA" first rule: prefer native labeling.

### Option 5 — `placeholder` as label (NEVER)

```html
<!-- BUG: do not do this. -->
<input type="email" placeholder="Email address">
```

The `placeholder` attribute is *not* a label. The platform clears the placeholder as soon as the user starts typing, so the field's purpose disappears the moment the user might second-guess what they entered. Screen readers vary on whether they read the placeholder at all. WCAG 2.2 SC 3.3.2 requires labels or instructions; the placeholder is neither.

Use the placeholder for **examples of the format**, never for the label:

```html
<label for="phone">Phone number</label>
<input id="phone" name="phone" type="tel" placeholder="555-867-5309">
```

The placeholder shows the format; the `<label>` carries the name. This is the only legitimate use of `placeholder` in production.

### The decision tree

For every input you write, ask in this order:

1. Can I use `<label for>` or wrap-the-input? **Yes — use it.** This is the default.
2. Does the visible label live elsewhere on the page (a heading, a column header)? **Use `aria-labelledby` to point at it.**
3. Is there genuinely no visible label, and adding one would harm the design? **Use `aria-label`** with the text the user would have read.
4. Did I just put the label in the `placeholder` attribute? **Stop, undo, go back to step 1.**

You will hold this decision tree in your head for the rest of your career. Get it right now.

---

## 5. Grouping — `<fieldset>` and `<legend>`

> **Per HTML Living Standard §4.10.15, the `<fieldset>` element groups several form controls together; the `<legend>` element provides the group's name. The pair is essential for radio groups and for any multi-field address-style section.**

Take a radio group:

```html
<fieldset>
  <legend>Shipping speed</legend>

  <label>
    <input type="radio" name="shipping" value="standard" checked>
    Standard (5–7 days)
  </label>

  <label>
    <input type="radio" name="shipping" value="express" >
    Express (2–3 days, $10)
  </label>

  <label>
    <input type="radio" name="shipping" value="overnight">
    Overnight ($25)
  </label>
</fieldset>
```

The `<legend>` is the group name; the screen reader announces "Shipping speed, Standard, radio button, one of three" when the user reaches the first radio. Without the `<fieldset>` / `<legend>` pair, the screen reader would announce "Standard, radio button, one of three" — and the user has no idea what they are choosing the speed of.

The `<fieldset>` is also the right shape for an address section:

```html
<fieldset>
  <legend>Billing address</legend>

  <label for="billing-street">Street</label>
  <input id="billing-street" name="billing-street" autocomplete="street-address">

  <label for="billing-city">City</label>
  <input id="billing-city" name="billing-city" autocomplete="address-level2">

  <label for="billing-zip">ZIP</label>
  <input id="billing-zip" name="billing-zip" autocomplete="postal-code">
</fieldset>
```

The legend names the group; each label names its field; the autocomplete tokens tell the browser which slot of the user's saved address profile to fill into each.

A common mistake: omitting the `<fieldset>` because the visual design does not show a border. The fieldset's default border is *the only thing* most developers know about it; the styling is one line of CSS to remove (`fieldset { border: none; padding: 0; }`). The accessibility benefit is the entire point of the element, and that benefit is invisible in the visual layer. Per WCAG 2.2 SC 1.3.1, the grouping must be programmatically determinable; the fieldset is how.

---

## 6. The HTML5 constraint attributes

> **Per HTML Living Standard §4.10.18.4, eight attributes apply constraints to a form control. The browser enforces every one of them at submission time. You do not have to write any JavaScript to make them work.**

The eight, with the validity flag each one sets when violated:

| Attribute | Applies to | Sets flag |
|-----------|-----------|-----------|
| `required` | Any input that has a value | `valueMissing` |
| `type` (when `email`, `url`, `number`, `date`, etc.) | Typed inputs | `typeMismatch` |
| `pattern` | Text-shaped inputs | `patternMismatch` |
| `minlength` | Text-shaped inputs | `tooShort` |
| `maxlength` | Text-shaped inputs | `tooLong` |
| `min` | Number / date / time inputs | `rangeUnderflow` |
| `max` | Number / date / time inputs | `rangeOverflow` |
| `step` | Number / date / time inputs | `stepMismatch` |

A signup form's constraints, declarative:

```html
<label for="email">Email</label>
<input
  id="email"
  name="email"
  type="email"
  autocomplete="email"
  required>

<label for="username">Username (3–20 letters or numbers)</label>
<input
  id="username"
  name="username"
  type="text"
  pattern="[a-zA-Z0-9]{3,20}"
  autocomplete="username"
  required>

<label for="password">Password (at least 8 characters)</label>
<input
  id="password"
  name="password"
  type="password"
  minlength="8"
  autocomplete="new-password"
  required>

<label for="age">Age (13 or older)</label>
<input
  id="age"
  name="age"
  type="number"
  min="13"
  max="120"
  step="1"
  required>
```

Zero JavaScript. When the user clicks the submit button:

1. The browser runs `form.checkValidity()` internally.
2. For each invalid field, it fires an `invalid` event.
3. It surfaces the first invalid field's native validation bubble — a tiny popover with a default error message.
4. It refuses to submit until the form is valid.

This is the **default behavior of the platform**. It existed before React. It still works.

The native bubble is ugly and not localizable. We will replace it in Lecture 2 — but we will keep the constraint attributes, because they are read by `ValidityState`, by `:user-invalid` in CSS, and by every other layer of the validation stack. You always start with the HTML5 constraints; the JavaScript is the seasoning, not the meal.

### A note on `pattern`

The `pattern` attribute is a regex anchored to the entire value. The regex syntax is the JavaScript `RegExp` grammar without flags (no `/.../i` — you have to use `(?i)` style inside the pattern, which most browsers honor).

```html
<input pattern="[A-Z][a-z]+" title="Capitalized word">
```

Two important details, per HTML Living Standard §4.10.5.4:

1. The `title` attribute on a `pattern`-validated input is the error message the native bubble shows. Always include `title`. Without it, the bubble says only "Please match the requested format" — which tells the user nothing.
2. The empty string passes `pattern` validation. Combine with `required` to enforce both.

### A note on the `:user-invalid` pseudo-class

`:user-invalid` (shipped in every browser since 2023) matches an invalid field only **after the user has interacted with it**. This fixes a long-standing UX bug in earlier validation flows:

```css
/* OLD: every required field is red on page load (the user has not even started). */
input:invalid {
  border-color: red;
}

/* NEW: only invalid fields the user has already touched. */
input:user-invalid {
  border-color: red;
}
```

The `:user-invalid` rule is what you want for default error styling. The `:invalid` rule is what you want when you specifically need to style "this field would be rejected" before any interaction (rare).

---

## 7. The `autocomplete` attribute

> **Per HTML Living Standard §4.10.18.7, the `autocomplete` attribute tells the browser what kind of data each input collects. The browser uses it to (1) offer to fill the field from saved data and (2) save the value the user typed for next time. Per WCAG 2.2 SC 1.3.5 (Identify Input Purpose, Level AA), every input that collects user information must have its purpose programmatically determinable — and the spec specifies that the `autocomplete` token is how.**

The attribute takes a value from a closed list of tokens. The full list lives in HTML Living Standard §4.10.18.7.3. The most-used:

| Token | Field |
|-------|-------|
| `name` | Full name |
| `given-name` | First name |
| `family-name` | Last name |
| `email` | Email address |
| `username` | Username |
| `new-password` | New password (signup) |
| `current-password` | Current password (login) |
| `one-time-code` | A 2FA code |
| `tel` | Phone number |
| `street-address` | Street address (single line) |
| `address-line1`, `address-line2` | Address line 1 / 2 |
| `address-level1` | State / province |
| `address-level2` | City |
| `postal-code` | ZIP / postal code |
| `country-name` | Country |
| `cc-number` | Credit card number |
| `cc-exp` | Expiration date |
| `cc-csc` | CVV |
| `bday` | Date of birth |
| `organization` | Company / organization |

A correctly-tokened signup form:

```html
<label for="first">First name</label>
<input id="first" name="first" autocomplete="given-name">

<label for="last">Last name</label>
<input id="last" name="last" autocomplete="family-name">

<label for="email">Email</label>
<input id="email" name="email" type="email" autocomplete="email">

<label for="username">Username</label>
<input id="username" name="username" autocomplete="username">

<label for="password">Password</label>
<input id="password" name="password" type="password" autocomplete="new-password">
```

The browser sees these tokens and offers to fill them from the user's saved profile (or saved-password manager); after the user submits, the browser offers to save the new values for next time. Tokens are mandatory: without them, the browser cannot help.

### Two tokens that matter specifically

**`autocomplete="new-password"`** versus **`autocomplete="current-password"`**: the difference unlocks the password-generation feature in every modern browser. On `new-password`, Safari and Chrome offer a generated strong password; on `current-password`, they offer the password they have saved for this site. Mislabeling either breaks both flows.

**`autocomplete="one-time-code"`**: on mobile, iOS and Android can read a 2FA code out of an SMS and offer to fill it in the field. Required for any 6-digit verification flow on a mobile device. The cost of writing the token is one word; the UX benefit is enormous.

### When `autocomplete="off"` is the right answer

Rare cases:
- A password-confirmation field that you do not want the browser to save.
- A search input that you do not want the browser to add to its saved history.
- A one-time-use field that does not correspond to any persistent user data.

`autocomplete="off"` does *not* prevent the browser from saving the password (Chrome ignores `off` on password fields by design — security trumps preference). It is a hint, not a guarantee.

---

## 8. The submission algorithm

> **Per HTML Living Standard §4.10.21.3, when a form is submitted, the browser runs a precisely-specified algorithm: validate the form's constraints, gather the form's entries, encode them, and dispatch a request. The submission can be intercepted by listening for the `submit` event and calling `event.preventDefault()`.**

The simplest interception:

```html
<form id="signup">
  <!-- fields -->
  <button type="submit">Sign up</button>
</form>

<script>
  const form = document.getElementById('signup');
  form.addEventListener('submit', (event) => {
    event.preventDefault();  // do not navigate
    const data = new FormData(form);
    for (const [name, value] of data) {
      console.log(name, '=', value);
    }
  });
</script>
```

Three things to notice:

1. **`event.preventDefault()`** keeps the page from navigating. Without it, the browser issues the request defined by the form's `action` and the browser navigates to the response. With it, the page stays put and your handler runs instead.
2. **`new FormData(form)`** is the modern way to read every entry the form would have submitted. `FormData` is iterable: `for (const [key, value] of data)` walks every name/value pair the browser would have sent. Per the XMLHttpRequest standard, §6.
3. **The native validation still runs before your listener fires.** If any field is invalid, the browser shows its native bubble, the `submit` event does *not* fire, and your handler does not run. To suppress the native bubble, add `novalidate` to the `<form>` or call `event.preventDefault()` from an `invalid` event handler (which we will do in Lecture 2).

### `FormData` for entries with multiple values

A multi-select `<select>` or a set of `<input type="checkbox">` can contribute multiple values for the same name:

```js
const data = new FormData(form);
data.getAll('toppings');   // ['cheese', 'pepperoni', 'olives']
```

`data.get(name)` returns the first; `data.getAll(name)` returns the array of all. For checkboxes that should submit only when checked, the browser already omits unchecked checkboxes from the FormData; you do not need to filter.

### The `submitter` property

When a form has multiple submit buttons — Save, Save and continue, Save and add another — the `SubmitEvent` carries a `submitter` property pointing to the button that triggered the submission:

```js
form.addEventListener('submit', (event) => {
  event.preventDefault();
  if (event.submitter?.name === 'continue') {
    // ... save and go to next step
  } else {
    // ... save and stay
  }
});
```

This is per HTML Living Standard §4.10.21.3 step 6. Each submit button can carry its own `name`, `value`, `formaction`, `formmethod`, `formnovalidate`, and `formtarget`. The button that submits wins.

---

## 9. Putting it together — a complete zero-JS form

Pull every concept above into a single working example. This is the form you will build in Exercise 1. Every behavior — labeling, grouping, constraints, autofill, validation, submission — comes from HTML alone.

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Contact us</title>
</head>
<body>
  <main>
    <h1>Contact us</h1>

    <form action="/contact" method="post">
      <fieldset>
        <legend>Your details</legend>

        <label for="name">Full name</label>
        <input
          id="name"
          name="name"
          type="text"
          autocomplete="name"
          minlength="2"
          maxlength="100"
          required>

        <label for="email">Email address</label>
        <input
          id="email"
          name="email"
          type="email"
          autocomplete="email"
          required>
      </fieldset>

      <fieldset>
        <legend>How can we help?</legend>

        <label>
          <input type="radio" name="topic" value="billing" required>
          Billing
        </label>
        <label>
          <input type="radio" name="topic" value="technical">
          Technical
        </label>
        <label>
          <input type="radio" name="topic" value="other">
          Other
        </label>

        <label for="message">Message</label>
        <textarea
          id="message"
          name="message"
          minlength="20"
          maxlength="1000"
          required></textarea>
      </fieldset>

      <button type="submit">Send</button>
    </form>
  </main>
</body>
</html>
```

Type this. Try to submit it empty — the browser refuses. Type a bad email — the browser refuses. Type a 5-character message — the browser refuses with "Please lengthen this text to 20 characters or more." Every behavior here ships in the browser. No JavaScript file has been written.

That is the baseline this week starts from. Lecture 2 takes it further: we will style the error states with `:user-invalid`, replace the native bubble with our own inline error messages, and make every message announceable by a screen reader. But the constraint attributes — `required`, `minlength`, `type="email"` — stay; the JavaScript reads them, it does not replace them.

---

## 10. What we leave for Lecture 2

This lecture taught you the **markup half** of forms. We have not yet:

- Read the `ValidityState` object.
- Written a `setCustomValidity` call.
- Replaced the native validation bubble with our own UI.
- Associated an error message with a field via `aria-describedby`.
- Set `aria-invalid` on the field.
- Built an error summary at the top of the form.
- Validated a cross-field rule (e.g., "password confirmation matches").

Every one of those is the **JavaScript half** of forms — the layer that sits on top of the HTML5 constraint attributes, reads what they computed, and renders it as the inline UI the user needs. Lecture 2 picks up there. The mini-project assembles both halves.

Before Lecture 2, do **Exercise 1 — HTML5-only validation**. It is the zero-JavaScript form. Type every line. The point is to feel exactly what the platform gives you for free, so the JavaScript you add in Lecture 2 is the marginal extra — not a wholesale replacement.

---

## Lecture 1 summary

- The HTML form is the oldest interactive surface on the web; the `<form>` element is the submission boundary, defined by HTML Living Standard §4.10.
- Form-associated elements participate in submission: `<input>`, `<select>`, `<textarea>`, `<button>`, `<output>`, plus `<fieldset>` for grouping.
- Twenty-two `<input>` types ship in every browser. Picking the right one drives the mobile keyboard, the native validation, the autofill, and the accessibility role.
- Every form control needs a programmatically determinable label. `<label for>` is the default; `aria-labelledby` is for labels that live elsewhere; `aria-label` is the last resort; `placeholder` is *never* a label.
- Group related controls with `<fieldset>` and `<legend>`. Required for radio groups. The default border is removed in one line of CSS; the accessibility benefit is the entire point.
- Eight constraint attributes ship in HTML5: `required`, `type` (when typed), `pattern`, `minlength`, `maxlength`, `min`, `max`, `step`. Each sets a flag on the field's `ValidityState`.
- The `:user-invalid` pseudo-class (universal since 2023) matches invalid fields *after* the user has interacted — the right shape for default error styling.
- The `autocomplete` attribute uses tokens from a closed list in the HTML Living Standard. WCAG 2.2 SC 1.3.5 requires it for every input that collects user information. `new-password` versus `current-password` unlocks the browser's password-generation feature.
- The submission algorithm runs `event.preventDefault()` to keep the page; `new FormData(form)` to read every entry; `event.submitter` to know which submit button fired.
- A working contact form with zero JavaScript is roughly 30 lines of HTML. Every behavior is in the platform.

In Lecture 2, the form learns to **speak back** — to surface its errors inline, to associate each error with the field that produced it, and to announce every error to a screen reader the moment focus reaches the field.
