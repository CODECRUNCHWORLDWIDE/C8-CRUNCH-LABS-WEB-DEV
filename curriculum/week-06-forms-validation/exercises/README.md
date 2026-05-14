# Week 6 — Exercises

Three short drills. Each takes 45–60 minutes. Do them in order; each one stacks on the last.

1. **[Exercise 1 — HTML5-only validation](./exercise-01-html5-only-validation.md)** — build a contact form with **zero JavaScript** using the HTML5 constraint attributes from Lecture 1. The browser's native bubble is your error UI; `:user-invalid` is your error styling. (~50 min)
2. **[Exercise 2 — JS validation layer](./exercise-02-js-validation-layer.md)** — take the same contact form, add a small JavaScript layer that reads `ValidityState`, suppresses the native bubble, and renders errors inline. (~55 min)
3. **[Exercise 3 — Error messaging and accessibility](./exercise-03-error-messaging-a11y.md)** — make every error announceable. Add `aria-invalid`, `aria-describedby`, an error summary with `role="alert"`, focus management, and screen-reader testing. (~60 min)

## Workflow

- Type your HTML, CSS, and JS by hand. Do not paste from the prompt. The attribute names — `required`, `minlength`, `autocomplete`, `aria-describedby`, `aria-invalid` — are short on purpose; typing them embeds them.
- Save each exercise next to its own `index.html` so you can open it directly. The exercises do not need ES modules; a plain `<script src="./script.js" defer></script>` is fine throughout.
- Right-click `index.html` in VS Code and choose **Open with Live Server**. Native validation works without an HTTP origin, but Live Server is the rhythm of the week.
- Open DevTools. The **Elements panel** lets you inspect `aria-invalid` and the live `class` attribute. The **Accessibility panel** (Firefox) shows you exactly what a screen reader will hear for each input.
- Test the keyboard. After each exercise, close your trackpad. Tab through every input. Try to submit with `Enter` from each field. If something does not work, the exercise is not done.

## Self-grading

After each exercise, ask yourself:

- Did every input get a `<label>` that the Firefox Accessibility panel reads as its name?
- Did every error appear in the right place at the right time?
- Did Tab reach every interactive control in source order, with a visible focus indicator at every stop?
- Did axe DevTools report zero serious or critical issues?

If yes to all four, move on. If no, re-read the part of the lecture you skipped.

## What "done" looks like

Each exercise ends with a working HTML + CSS + JS bundle you can show to someone. Commit them to your Week 6 repo. They are the building blocks of the mini-project — the form pattern, the error model, the announcement pattern. The mini-project assembles them; the exercises rehearse them.

You should also run each exercise through:

- **The validator.** <https://validator.w3.org/nu/> — zero errors.
- **axe DevTools.** Zero serious or critical issues.
- **The keyboard.** Tab, Enter, Escape — each does the right thing.
- **A screen reader.** Listen at least to Exercise 3 with VoiceOver, NVDA, or Orca. The whole point of the inline-error pattern is that the screen reader announces the error at the right moment; if it does not, the exercise is not done.

The four-part check is the rhythm of every form you ship from here forward.
