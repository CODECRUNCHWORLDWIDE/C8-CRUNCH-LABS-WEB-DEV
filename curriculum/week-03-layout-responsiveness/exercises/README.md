# Week 3 — Exercises

Three short drills. Each takes 45–60 minutes. Do them in order; each one introduces a layout primitive you will reuse in the mini-project.

1. **[Exercise 1 — Card grid](./exercise-01-card-grid.md)** — a responsive card grid with `repeat(auto-fit, minmax(...))` and no media query. (~50 min)
2. **[Exercise 2 — Holy-grail layout](./exercise-02-holy-grail-layout.md)** — header / nav / main / aside / footer with `grid-template-areas` and one breakpoint. (~60 min)
3. **[Exercise 3 — Fluid image gallery](./exercise-03-fluid-image-gallery.md)** — an accessible gallery with `srcset`, `sizes`, and aspect-ratio holding. (~50 min)

## Workflow

- Type your CSS by hand. Do not paste from the prompt. The Flexbox and Grid property names are short on purpose — typing them embeds them.
- Save your CSS as `styles.css` next to the HTML it styles. Link it with `<link rel="stylesheet" href="styles.css">` in `<head>`.
- Right-click your `index.html` in VS Code and choose **"Open with Live Server."**
- Open DevTools. Use the **Device toolbar** (`Cmd+Shift+M` / `Ctrl+Shift+M`) to resize the viewport. Drag slowly — watch where the layout breaks.
- Click the small "grid" or "flex" badge next to `display: grid` / `display: flex` in the Styles pane. The browser overlays the tracks and axes on the page. This is the layout inspector; it is the layout debugger you wish you had been using all year.

## Self-grading

After each exercise, ask yourself:

- Does the page reflow cleanly from 320 px to 1440 px in the device toolbar — no horizontal scroll, no clipped text, no orphan card?
- Tab through the page. Is every interactive element reachable, in the order the user sees them, with a visible focus ring?
- Did I reach for `@media` only when content needed it, or did I write a breakpoint by reflex?
- Could I explain to a peer in one sentence why I used Flexbox here and Grid there?

If yes to all four, move on. If no, re-read the part of the lecture you skipped.

## What "done" looks like

Each exercise ends with a working HTML + CSS pair you can show to someone. Commit them to your Week 3 repo. They will be useful to reference back to in Week 9 (animation) and Week 11 (accessibility audit), when you revisit the same layouts with sharper tools.
