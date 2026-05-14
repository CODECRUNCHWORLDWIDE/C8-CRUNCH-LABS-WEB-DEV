# Exercise 1 — HTML5-only validation

**Time:** ~50 minutes.

## Problem statement

Build a contact form using **only HTML and CSS** — no JavaScript whatsoever. Every constraint comes from an HTML5 attribute; every error message comes from the platform's native validation bubble; every visual error style comes from the `:user-invalid` pseudo-class. The form submits via the platform's default submission algorithm; you do not write `event.preventDefault()` anywhere.

The point: feel exactly what the platform gives you for free. The next two exercises layer JavaScript on top. Until you know what the platform provides, you cannot know what your JavaScript is actually adding.

```text
┌──────────────────────────────────────────────────┐
│ ●●●    http://localhost:5500/                    │
├──────────────────────────────────────────────────┤
│                                                  │
│   Contact us                                     │
│                                                  │
│   Your details                                   │
│   Full name                                      │
│   ┌──────────────────────────────────┐           │
│   │                                  │           │
│   └──────────────────────────────────┘           │
│   Email address                                  │
│   ┌──────────────────────────────────┐           │
│   │                                  │           │
│   └──────────────────────────────────┘           │
│                                                  │
│   How can we help?                               │
│   ◯ Billing  ◯ Technical  ◯ Other                │
│                                                  │
│   Message                                        │
│   ┌──────────────────────────────────┐           │
│   │                                  │           │
│   │                                  │           │
│   └──────────────────────────────────┘           │
│                                                  │
│   [ Send ]                                       │
│                                                  │
└──────────────────────────────────────────────────┘
```

## Source content

Create `exercises/exercise-01/index.html` and `exercises/exercise-01/styles.css`. No JavaScript file.

The HTML skeleton:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Contact us — Week 6 Exercise 1</title>
  <link rel="stylesheet" href="./styles.css">
</head>
<body>
  <main>
    <h1>Contact us</h1>

    <form action="https://httpbin.org/post" method="post">
      <fieldset>
        <legend>Your details</legend>

        <div class="field">
          <label for="name">Full name</label>
          <input
            id="name"
            name="name"
            type="text"
            autocomplete="name"
            minlength="2"
            maxlength="100"
            required>
        </div>

        <div class="field">
          <label for="email">Email address</label>
          <input
            id="email"
            name="email"
            type="email"
            autocomplete="email"
            required>
        </div>
      </fieldset>

      <fieldset>
        <legend>How can we help?</legend>

        <label><input type="radio" name="topic" value="billing" required> Billing</label>
        <label><input type="radio" name="topic" value="technical"> Technical</label>
        <label><input type="radio" name="topic" value="other"> Other</label>

        <div class="field">
          <label for="message">Message</label>
          <textarea
            id="message"
            name="message"
            minlength="20"
            maxlength="1000"
            required></textarea>
        </div>
      </fieldset>

      <button type="submit">Send</button>
    </form>
  </main>
</body>
</html>
```

The form's `action` points at `httpbin.org/post` — a free service that echoes any submission back as JSON. After you submit a valid form, you will land on a JSON response page that shows exactly what the browser sent. Open the Network panel before you submit; you will see the request in the network log.

## Acceptance criteria

- [ ] `exercises/exercise-01/index.html` and `exercises/exercise-01/styles.css` exist.
- [ ] **Zero JavaScript files** in the exercise folder. No `<script>` tags.
- [ ] The page passes <https://validator.w3.org/nu/> with zero errors.
- [ ] Every input has a programmatically associated `<label>` (use the Firefox Accessibility panel to confirm; each input's "Name" property must be non-empty).
- [ ] The two `<fieldset>` elements have a `<legend>`. The radio group is inside its own fieldset with the question text as the legend.
- [ ] Every input that collects user information has an `autocomplete` token from the HTML Living Standard list (`name`, `email`).
- [ ] The "Full name" input has `minlength="2"`, `maxlength="100"`, and `required`.
- [ ] The "Email address" input has `type="email"` and `required`. (Type a bad email; the platform refuses to submit.)
- [ ] The radio group has `required` on the first option only (a quirk per HTML Living Standard §4.10.5.1.13: `required` on any radio in a group requires the group).
- [ ] The `<textarea>` has `minlength="20"`, `maxlength="1000"`, and `required`.
- [ ] The page renders cleanly at 320 px viewport. No horizontal scroll.
- [ ] Every text input has a visible focus indicator (the platform's default is fine; if you remove it, you must replace it). Per WCAG 2.2 SC 2.4.7.
- [ ] `:user-invalid` styling is applied: invalid inputs (after the user has tabbed away from them) show a red border and an icon (or any other visible error treatment). Per the CSS Selectors Level 4 specification.
- [ ] `:user-valid` styling is applied: valid inputs the user has touched show a subtle "ok" treatment (e.g., a green border or a check icon). The treatment is distinguishable from the unmodified state.
- [ ] axe DevTools reports zero serious or critical issues.
- [ ] The form submits successfully when filled in correctly: clicking "Send" lands on the httpbin.org JSON echo, with the form's data visible in the JSON's `form` property.

## CSS hints

The two pseudo-class rules you need:

```css
input:user-invalid,
textarea:user-invalid {
  border-color: hsl(0 70% 50%);
  background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" ...');
  background-repeat: no-repeat;
  background-position: right 0.5rem center;
  padding-right: 2.5rem;
}

input:user-valid,
textarea:user-valid {
  border-color: hsl(140 60% 35%);
}
```

Use SVG data URIs for the error and check icons, or skip them and just style the border. Either treatment satisfies the criterion as long as the visible difference is clear. Per WCAG 2.2 SC 1.4.1 (Use of Color), the error indication cannot rely on color alone — the border style change (solid → dashed) or the icon presence is enough.

The `<fieldset>` default border is removed in one line:

```css
fieldset {
  border: 0;
  padding: 0;
  margin: 0;
}
```

The `<legend>` styles as a heading — give it the typography of an `<h2>` for visual weight.

## What to test

After you build it, exercise the following flows with the keyboard alone (no mouse):

1. **Empty submit.** Tab to "Send," press `Enter`. The platform should focus the first invalid field and show its native bubble with a default message ("Please fill out this field.").
2. **Bad email.** Type `not-an-email` into the email field, tab away. The platform should refuse to submit with "Please include an '@' in the email address."
3. **Short message.** Type "Hi." into the textarea, tab away, try to submit. The platform should refuse with "Please lengthen this text to 20 characters or more."
4. **Valid submission.** Fill the form correctly. Submit. You should land on the httpbin.org JSON echo with your form data visible.
5. **Autofill check.** If you have a saved profile in your browser's autofill settings, the "Full name" and "Email" fields should be offered as autofill suggestions. (If you do not have a saved profile, ignore this step; the `autocomplete` attribute is still required for the criterion.)

If every flow works, the exercise is done.

## Hints

<details>
<summary>Why does the radio group only require <code>required</code> on the first radio?</summary>

Per HTML Living Standard §4.10.5.1.13: "If the `required` attribute is specified on any of the radio buttons in the group, the user is required to select one of the radio buttons." A single `required` on any one radio in the group is enough; redundant `required` attributes on the rest do not cause an error but are not necessary.

Most teams put `required` on the first radio only. Some teams put it on every radio in the group as a documentation convention. Either is acceptable.

</details>

<details>
<summary>What happens if I leave the <code>autocomplete</code> attribute off the form?</summary>

The browser falls back to a heuristic that tries to identify the field by its `name` attribute and surrounding labels. The heuristic is unreliable: Chrome and Safari occasionally disagree about whether `name="email"` is the email field; Firefox is less aggressive about offering autofill without an explicit token.

Per WCAG 2.2 SC 1.3.5 (Identify Input Purpose, Level AA), every input that collects user information must have a programmatically determinable purpose. The `autocomplete` attribute is the spec-blessed way to satisfy that criterion. Skipping it is a WCAG violation, even if the heuristic happens to work in your browser today.

</details>

<details>
<summary>The validator says my <code>&lt;label&gt;</code> wrapping a radio is wrong. What gives?</summary>

It is probably not the label that the validator dislikes — it is something else inside the `<fieldset>`. Wrapping a radio in a `<label>` is correct per HTML Living Standard §4.10.4:

```html
<label><input type="radio" name="topic" value="billing" required> Billing</label>
```

The validator reports per-line; read the line number it points at. Common nearby mistakes: a stray `<br>` inside a label, a `for` attribute pointing at a non-existent id, a `<fieldset>` without a `<legend>` directly inside it.

</details>

<details>
<summary>Why does <code>:user-invalid</code> not match anything on page load?</summary>

Because the user has not interacted with the field yet. Per the CSS Selectors Level 4 specification: `:user-invalid` matches a form control "that has been validated by the user and that has been determined to be invalid since the last user interaction."

This is the entire reason `:user-invalid` exists — to *not* match on page load. Compare with `:invalid`, which matches the moment the page renders if the input has `required` and no value. The older selector created the "red form on page load" anti-pattern; `:user-invalid` fixes it.

To test your `:user-invalid` styling, type something into a required field, then delete it, then tab away. The field will turn red after the blur.

</details>

<details>
<summary>What is <code>httpbin.org</code> and is it safe to send my email there?</summary>

`httpbin.org` is a free, open-source request-and-response service maintained by Postman. It echoes any request you send to it back as JSON, with no logging beyond standard server logs, no storage of submission data, and no third-party tracking.

For this exercise, the form submits real data to a real URL — but only the data you type, which for an exercise should be `Test User`, `test@example.com`, and a short test message. Do not type your real password or credit-card number into any exercise form; the value is unencrypted before TLS and visible in network logs.

A local alternative is to submit the form to `action=""` (which submits to the same URL — your `index.html`). The browser reloads the page with the form's data appended as URL parameters. You will see them in the address bar. This works without `httpbin.org` but provides no JSON receipt.

</details>

## What "done" looks like

The page loads. Three labels are visible. Every input has the right type. Tab order matches source order. Required fields refuse to submit empty. The email field refuses to submit with bad text. The radio group refuses to submit unselected. The textarea refuses to submit short. When the form is fully valid, clicking Send leaves the page and lands on a JSON echo. The console is silent — there is no JavaScript on this page.

If every assertion above is green, commit this folder to your Week 6 repo and move on to **Exercise 2 — JS validation layer**.

## Stretch

If you finish early:

- Add a **`<datalist>`** for the message field to suggest common subjects. The pattern is `<input list="suggestions">` with `<datalist id="suggestions"><option>` children. Native autocomplete UI; no JavaScript.
- Add the **`inputmode`** attribute to a hypothetical phone-number field. Try `inputmode="tel"`, `inputmode="email"`, `inputmode="numeric"` on a touch device. The soft keyboard changes for each.
- Add a **`pattern`** to the name field requiring at least one space (a first + last name). Use the `title` attribute to set the native error message. Per HTML Living Standard §4.10.5.4: `pattern="\S+ \S+.*"` with `title="Please enter your first and last name."`

Save stretches in `exercises/exercise-01-stretch/` so the core exercise stays clean.
