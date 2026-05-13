# Week 2 — Exercises

Three short drills. Each takes 40–60 minutes. Do them in order; each one builds on the last.

1. **[Exercise 1 — Style your Week 1 page](./exercise-01-style-week1-page.md)** — apply CSS to the essay page from Week 1. (~60 min)
2. **[Exercise 2 — Fluid typography](./exercise-02-fluid-typography.md)** — build a `clamp()`-based type scale and verify it across viewport widths. (~50 min)
3. **[Exercise 3 — Custom-properties theme](./exercise-03-custom-properties-theme.md)** — refactor an ad-hoc stylesheet into tokens with a dark-mode override. (~50 min)

## Workflow

- Type your CSS by hand. Do not paste from the prompt. Muscle memory matters here too.
- Save your CSS as `styles.css` next to the HTML it styles. Link it with `<link rel="stylesheet" href="styles.css">` in `<head>`.
- Right-click your `index.html` in VS Code and choose **"Open with Live Server."** The page reloads on every save.
- Keep DevTools open. The **Styles** and **Computed** tabs are the closest thing CSS has to a debugger.

## Self-grading

After each exercise, ask yourself:

- Could I open the Computed panel on any element and trace each property back to the rule that set it?
- Does my stylesheet's selector specificity stay flat — mostly single classes, rarely descendants, no IDs without reason?
- If I disable my CSS, does the page still read in document order? (It will. That is what Week 1 was for.)

If yes to all three, move on. If no, re-read the lecture material that covered it.

## What "done" looks like

Each exercise ends with a working HTML + CSS pair you can show to someone. Commit them to your Week 2 repo. They will be useful to reference back to in Week 9 (animation) and Week 11 (accessibility audit), when you revisit the same pages with sharper tools.
