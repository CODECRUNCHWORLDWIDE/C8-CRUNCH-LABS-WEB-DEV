# Week 6 — Challenges

1. **[Challenge 1 — Multi-step form with state](./challenge-01-multi-step-form-with-state.md)** — build a three-step form with a clean state model, per-step validation, focus management on every transition, and a progress indicator with `aria-current="step"`. The scoped-down rehearsal for the mini-project. (~140 min)

Challenges are optional but transformational. Skip them and you will know form validation well. Do them and the multi-step pattern stops feeling like glue code between three screens and starts feeling like one form rendered across three views — which is what every multi-step form actually is.

## How challenges differ from exercises

- **Exercises** are small drills with a known answer. You can grade yourself by submitting the form once and watching the errors appear in the right place.
- **Challenges** are larger problems that require judgment. There is no single right answer — there are better and worse choices for state shape, for where to put the validation logic, for how to handle the back-button behavior in a multi-step form, and your reasoning is part of the work.
- **Mini-projects** are the largest synthesis. They take a full day or more and ship something you would put in your portfolio.

You can skip the challenge and still pass Week 6. But the challenge is where the state-management pattern stops feeling abstract and starts feeling like a vocabulary you reach for whenever a form crosses one screen. The mini-project takes the same shape; the challenge is the lower-stakes rehearsal.

## Workflow

- Block out a single 2-hour focused session.
- Disable distractions. Open the GOV.UK Design System "Multi-step forms" pattern, your editor, DevTools, and a screen reader.
- Treat it like a real brief: keyboard-only operation, screen-reader testing, axe-clean. The reviewer is the user who will navigate your portfolio's signup form with VoiceOver next year.
- Cite a WCAG Success Criterion in your `NOTES.md` for each accessibility decision you would defend in a code review. The number, not just "accessibility."
