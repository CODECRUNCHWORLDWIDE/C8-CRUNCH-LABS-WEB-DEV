# Week 6 Homework

Six problems, ~6 hours total. Commit each in your Week 6 repo under a `homework/` folder.

---

## Problem 1 — The input-type tour (45 min)

Build `homework/01-input-types/index.html` — a single page showcasing **every `<input>` type that ships in 2026**. For each type:

- A correctly-labeled control.
- A short note (`<p>`) describing what the type renders as on desktop and on mobile.
- An `autocomplete` token if one is applicable.
- A representative HTML5 constraint (`required`, `min`, `max`, `pattern`, etc.).

You must cover at least: `text`, `email`, `password`, `tel`, `url`, `search`, `number`, `range`, `date`, `time`, `datetime-local`, `month`, `week`, `color`, `file`, `hidden`, `checkbox`, `radio`. The button-shaped types (`submit`, `reset`, `button`, `image`) need not appear, but include one `<button type="submit">` at the bottom to make the form submittable.

Open the page on a real mobile device (or via DevTools' device emulation). For each type, observe what soft keyboard appears. Add a short note to each field describing the keyboard you saw.

**Acceptance.** A single HTML page passing <https://validator.w3.org/nu/> with zero errors, with every input correctly labeled, every applicable autocomplete token present, and a representative constraint per field.

---

## Problem 2 — The labeling refactor (45 min)

Find a real form in the wild — a signup form, a contact form, a checkout form — and audit its labeling. Open the Firefox Accessibility panel; for each input on the form, record:

- The input's `Name` property (what a screen reader will announce).
- Whether the name comes from `<label>`, `aria-labelledby`, `aria-label`, or — failing all three — the `placeholder`.
- Whether the visible UI matches the programmatic name.

In `homework/02-labeling-audit.md`:

- The form's URL and the date.
- A short table: input description / name source / programmatic name / one-line verdict.
- Three failures you found (or one, if the form is well-built). For each, cite the WCAG Success Criterion violated (1.3.1, 3.3.2, or 4.1.2).
- A short paragraph on how you would fix each failure with the minimum change to the markup.

**Acceptance.** A short report with one form audited, the table populated, and at least one failure identified and fixed-in-principle. The point is to internalize what real-world form labeling looks like — and how often it goes wrong.

---

## Problem 3 — The `setCustomValidity` deep dive (1 h)

Build `homework/03-custom-validation/index.html` and `script.js` — a single form with five fields, each demonstrating a different custom-validation rule:

1. **Cross-field rule.** Password + confirm-password. The confirm field shows "Passwords do not match" until the two values are equal.
2. **Forbidden-substring rule.** A username that may not contain `admin`, `root`, or `moderator`. Implement with a regex test inside `setCustomValidity`.
3. **Multi-step regex rule.** An email that must end in your school's domain (e.g., `@codecrunch.club`). Implement as a regex `setCustomValidity` *plus* the native `type="email"` constraint.
4. **Date range rule.** A "date of birth" field that requires the user to be at least 13 years old. Computed against `new Date()` on every input.
5. **Async availability rule.** A username field that calls a hard-coded `Promise.resolve(value.includes('taken'))` to simulate a server-side uniqueness check. Debounce by 400 ms; show "Checking…" as helper text via a `role="status"` element.

In a `notes.md`:

- Confirm each field's `validity.customError` flag fires correctly when its rule is violated.
- Note one rule that would be easier to express in HTML5 (with a `pattern`) than in JavaScript.
- Note one rule that *cannot* be expressed in HTML5 at all (you need JS).

**Acceptance.** A working form. Each of the five rules demonstrably activates and clears. The notes file answers all three points.

---

## Problem 4 — The screen-reader form pass (1 h)

Turn on a screen reader. On macOS: `Cmd+F5` for VoiceOver. On Windows: download **NVDA** (free) from <https://www.nvaccess.org/>. On Linux: turn on **Orca** (`Alt+Super+S`).

Read the Deque University cheat sheet on form-control announcements first: <https://dequeuniversity.com/screenreaders/>. Note the differences between "browse mode" (reading content) and "forms mode" (interacting with controls). Most screen readers switch automatically; learn the keystroke that toggles them.

Then, with the screen reader running, navigate to **Exercise 3's** completed form. Close your eyes (or cover the screen). Try to:

1. Read the form's heading and instructions.
2. Tab to each field. Listen for the label, type, required state.
3. Submit empty. Listen to the error summary announcement.
4. Tab to the first error. Listen to the field-level announcement.
5. Fix every error. Listen for any announcement on input.
6. Submit successfully. Listen for the success message.

In `homework/04-screen-reader-form.md`:

- Which screen reader, which OS, which browser.
- The exact phrases announced at each of the six points above. Use direct quotes.
- One announcement you expected but did not hear.
- One announcement you heard but had to interpret.
- A short reflection: what would you change about the form's markup to make the experience smoother?

**Acceptance.** A short report. The point is to feel the rhythm of a screen-reader form pass once, so that when you build the mini-project you have a memory of what each markup decision sounds like.

---

## Problem 5 — The autofill round-trip (1 h)

Build `homework/05-autofill/index.html` — a contact form with name, email, phone, street address, city, postal code, and country fields. Every input must have an `autocomplete` token from the canonical list. The form has no JavaScript; it submits to `httpbin.org/post`.

Open Chrome's autofill settings (`chrome://settings/addresses`) and confirm you have a saved profile. (If you do not have one, create one with fake data — name, email, address.) Then:

1. Open your form. Confirm that Chrome offers to fill the fields from your saved profile.
2. Click "Fill" and confirm every field is correctly populated.
3. Submit the form. Confirm the httpbin response shows the submitted values.
4. Open the form fresh (clear the values). Confirm the autofill suggestion appears again.

Repeat on Firefox (its autofill is enabled by default but does not always offer for every field). Repeat on Safari if you have a Mac.

In `notes.md`:

- A table of every input on your form, with the `autocomplete` token used and whether each of Chrome / Firefox / Safari offered to fill it.
- One token where the browsers disagreed (if any).
- A short paragraph on whether the form would pass WCAG 2.2 SC 1.3.5 (Identify Input Purpose) — every field has its purpose programmatically determinable.

**Acceptance.** The form works as described. The notes table is complete. The WCAG paragraph answers the question with a citation.

---

## Problem 6 — Reflection (30 min)

Write `homework/06-reflection.md` (300–400 words) answering:

1. Which form or validation concept from Week 6 changed your mental model the most — and why? Be specific (which lecture section, which spec citation).
2. Pick one HTML attribute or one Constraint Validation API method whose intended behavior surprised you. Where will you reach for it next?
3. Name one decision you made this week that you would defend in a code review. Cite a spec section or a WCAG 2.2 Success Criterion by number.
4. What is one habit you will keep from Week 6, for the rest of your career? Plausible candidates: "every input gets a `<label>` before any styling"; "`autocomplete` is not optional"; "the error message says what to fix, not just that there is a problem"; "the platform validates; my JavaScript reads the result."

---

## How to submit

- Create a folder `homework/` in your Week 6 repo.
- Save each problem's output with the filename suggested above.
- One commit per problem is ideal; one big commit at the end is acceptable.
- In your final commit message, link to the file(s) you spent the most time on.

## Grading guide

This homework is graded on completion, not perfection. The rubric:

| Problem | What "complete" means |
| ------- | --------------------- |
| 1 | Every input type covered with a labeled control, an autocomplete token (where applicable), and a soft-keyboard observation. |
| 2 | One real form audited; the table populated; at least one failure cited against WCAG. |
| 3 | Five custom-validation rules working; the notes answer all three points. |
| 4 | One screen reader used; the six announcements captured as direct quotes; the reflection answers the smoothness question. |
| 5 | One contact form with every autocomplete token correct; the cross-browser autofill table complete; the WCAG paragraph cites SC 1.3.5. |
| 6 | 300–400 word reflection answering all four questions. |

If you finish a problem and are uncertain whether it counts as "complete," ask in the cohort channel. Future-you reads better notes than nobody-you.

## Time budget

| Problem | Time |
| ------: | ---: |
| 1 | 45 min |
| 2 | 45 min |
| 3 | 1 h |
| 4 | 1 h |
| 5 | 1 h |
| 6 | 30 min |
| **Total** | **~5 h** |

When done, push your Week 6 repo and ship the [mini-project](./mini-project/README.md).
