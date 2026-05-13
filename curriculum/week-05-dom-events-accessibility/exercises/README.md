# Week 5 — Exercises

Three short drills. Each takes 45–60 minutes. Do them in order; each one introduces a DOM primitive you will reuse in the mini-project.

1. **[Exercise 1 — Query and mutate](./exercise-01-query-and-mutate.md)** — drills on `querySelector`, `querySelectorAll`, `append`, `replaceChildren`, `classList`, and the four interfaces to a single element. No events yet. (~50 min)
2. **[Exercise 2 — Event delegation](./exercise-02-event-delegation.md)** — turn ten per-item listeners into one delegated listener; measure the difference; route on `data-action`. (~50 min)
3. **[Exercise 3 — Keyboard-navigable dropdown](./exercise-03-keyboard-navigable-dropdown.md)** — build the warm-up disclosure-style dropdown: a button + a list of links, fully keyboard-driven. The shape you extend in the mini-project. (~60 min)

## Workflow

- Type your JavaScript by hand. Do not paste from the prompt. The method names — `querySelector`, `append`, `closest`, `setAttribute` — are short on purpose; typing them embeds them.
- Save each exercise next to its own `index.html` so you can open it directly. Link your script with `<script type="module" src="./main.js"></script>` when the exercise requires modules; a plain `<script src="./script.js" defer></script>` is fine when it does not.
- Right-click `index.html` in VS Code and choose **Open with Live Server**. ES modules need an HTTP origin; non-module scripts work either way, but Live Server is what you will reach for all week.
- Open DevTools. The **Elements panel** is your most-used view this week — keep it open. The **Console** is still where you experiment. The **Accessibility panel** (Firefox) shows you the accessibility tree your screen reader sees.
- Test the keyboard. After each exercise, close your trackpad. Try the page with `Tab`, `Enter`, `Space`, the arrow keys, and `Escape`. If something does not work, the exercise is not done.

## Self-grading

After each exercise, ask yourself:

- Did every element I queried get found? If not, was the selector wrong, or was my script running before the DOM was ready?
- Did my `event.target.closest()` calls return the elements I expected? Or did I get `null` from a click I did not anticipate?
- Did `Tab` reach every interactive element I built? Was there a visible focus indicator at every stop?
- Did axe DevTools report zero serious or critical issues?

If yes to all four, move on. If no, re-read the part of the lecture you skipped.

## What "done" looks like

Each exercise ends with a working HTML + CSS + JS bundle you can show to someone. Commit them to your Week 5 repo. They will be useful to reference back to in Week 6 (forms — the same event patterns), Week 7 (components — the same mutation patterns), and Week 11 (the accessibility audit — the same WCAG criteria).

You should also run each exercise through:

- **The validator.** <https://validator.w3.org/nu/> — zero errors.
- **axe DevTools.** Zero serious or critical issues.
- **The keyboard.** Tab, arrow keys, Enter, Space, Escape — each does the right thing.

The three-part check is the rhythm of every component you ship from here forward.
