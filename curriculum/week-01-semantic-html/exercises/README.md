# Week 1 — Exercises

Three short drills. Each takes 30–60 minutes. Do them in order; each one builds on the last.

1. **[Exercise 1 — Build a real page](./exercise-01-build-a-real-page.md)** — mark up an article from a plain-text source. (~50 min)
2. **[Exercise 2 — Fix the bad HTML](./exercise-02-fix-the-bad-html.md)** — take a page of div soup and rewrite it semantically. (~50 min)
3. **[Exercise 3 — Validate and audit](./exercise-03-validate-and-audit.md)** — run validator.w3.org and axe DevTools on a real page; fix every issue. (~40 min)

## Workflow

- Type your HTML by hand. Do not paste from the prompt. The muscle memory matters.
- Save your file as `index.html` in a folder called `exercise-01/` (or `02`, `03`).
- Right-click the file in VS Code and choose **"Open with Live Server"** to view it in the browser as you work.
- Open Chrome DevTools (`F12` or `Cmd+Opt+I`). Look at the **Elements** panel. The tree there is the DOM the browser built from your file.

## Self-grading

After each exercise, ask yourself:

- Could I run this through validator.w3.org and see zero errors?
- Could I run this through axe DevTools and see zero serious issues?
- Could I explain — out loud, to a beginner — why I chose each landmark and each heading level?

If yes to all three, move on. If no, re-read the lecture material that covered it.

## What "done" looks like

Each exercise ends with a small, complete artifact you can show to someone: a working HTML page, a validation screenshot, or a short notes file. Keep them in a `week-01/` folder of your Week 1 repo. They will be useful to look back at in Week 11 when you do the full accessibility audit on your finished site — the same checks, at a more demanding bar.
