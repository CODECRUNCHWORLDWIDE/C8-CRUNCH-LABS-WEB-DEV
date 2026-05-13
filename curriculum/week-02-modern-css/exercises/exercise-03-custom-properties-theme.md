# Exercise 3 — Custom-properties theme

**Time:** ~50 minutes.

## Problem statement

Below is an ad-hoc stylesheet for a small marketing card. Every color, every space, every font-family is hard-coded. Refactor it into a token-driven theme using CSS custom properties, then add a `prefers-color-scheme: dark` override that flips the theme without duplicating a single rule.

## The ad-hoc CSS

Save this as `exercises/exercise-03/before.html`:

```html
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Card</title>
  <link rel="stylesheet" href="./before.css">
</head>
<body>
  <main>
    <article class="card">
      <h2 class="card__title">Build the browser, properly</h2>
      <p class="card__lede">A free, twelve-week frontend track that teaches the platform before the framework.</p>
      <p class="card__body">No bootcamp marketing, no recycled tutorials. Twelve weeks of hand-authored HTML, honest CSS, the JavaScript the platform ships, and the build tools that earn their keep.</p>
      <a class="card__link" href="#">Read the syllabus</a>
    </article>
  </main>
</body>
</html>
```

And `exercises/exercise-03/before.css`:

```css
*, *::before, *::after { box-sizing: border-box; }
body {
  margin: 0;
  background: #faf7f0;
  color: #1a1a1a;
  font-family: "Lora", Georgia, serif;
  font-size: 1rem;
  line-height: 1.6;
  padding: 2.5rem 1rem;
}
.card {
  max-width: 36rem;
  margin-inline: auto;
  background: #ffffff;
  border: 1px solid #d4cfc0;
  padding: 1.5rem;
  border-radius: 0.25rem;
}
.card__title {
  font-family: "EB Garamond", Georgia, serif;
  font-size: 1.75rem;
  margin: 0 0 1rem 0;
  color: #1a1a1a;
}
.card__lede {
  font-size: 1.125rem;
  color: #1a1a1a;
  margin: 0 0 1rem 0;
}
.card__body {
  color: #2a2a2a;
  margin: 0 0 1.5rem 0;
}
.card__link {
  color: #0369a1;
  text-decoration: underline;
}
.card__link:hover {
  color: #024377;
}
```

## Rewrite target

Create `exercises/exercise-03/after.html` (copy `before.html` and update the stylesheet link) and `exercises/exercise-03/after.css`.

## Acceptance criteria

- [ ] `after.css` declares a `:root` block with at minimum: `--ink`, `--parchment`, `--surface`, `--rule`, `--accent`, `--accent-hover`, `--font-display`, `--font-body`, `--type-base`, `--type-lede`, `--type-h2`, `--space-3`, `--space-4`, `--space-5`.
- [ ] Every color, font-family, font-size, and spacing value in the rest of the stylesheet reads from `var(--...)` — no raw hex, no raw rem outside the token block.
- [ ] The visual result of `after.html` matches `before.html` in light mode. (Open both side by side in two tabs.)
- [ ] A `@media (prefers-color-scheme: dark)` block overrides only the token values in `:root` — no per-component rule is duplicated.
- [ ] In dark mode, the card surface, body text, headings, and link color all flip to a coherent dark theme. Body text passes WCAG AA contrast against the dark surface.
- [ ] `--accent-hover` is derived from `--accent` using `color-mix()`, not hard-coded.
- [ ] The stylesheet's longest selector is `(0, 0, 1, 1)` or less — no nested descendants, no IDs.

## Hints

<details>
<summary>What tokens should I declare?</summary>

A starter set. Adjust as you go.

```css
:root {
  /* palette */
  --ink:        #1a1a1a;
  --parchment:  #faf7f0;
  --surface:    #ffffff;
  --rule:       #d4cfc0;
  --page-sky-deep: #0369a1;

  /* role tokens — what the palette is used for */
  --bg:           var(--parchment);
  --fg:           var(--ink);
  --card-bg:      var(--surface);
  --card-rule:    var(--rule);
  --accent:       var(--page-sky-deep);
  --accent-hover: color-mix(in oklch, var(--accent), black 25%);

  /* typography */
  --font-display: "EB Garamond", Georgia, serif;
  --font-body:    "Lora", Georgia, serif;
  --type-base:    1rem;
  --type-lede:    clamp(1.05rem, 1rem + 0.25vw, 1.2rem);
  --type-h2:      clamp(1.5rem, 1.2rem + 1.5vw, 2.25rem);

  /* space */
  --space-3: 1rem;
  --space-4: 1.5rem;
  --space-5: 2.5rem;
}
```

The split between **palette** (the literal colors) and **role** tokens (`--bg`, `--card-bg`, `--accent`) is the key move. Components read role tokens; role tokens read palette tokens. Dark mode overrides role tokens only.

</details>

<details>
<summary>What does the dark-mode block look like?</summary>

```css
@media (prefers-color-scheme: dark) {
  :root {
    --bg:        var(--ink);
    --fg:        #e8e4d8;
    --card-bg:   #242220;
    --card-rule: #3a3833;
    --accent:    #38bdf8;
    /* --accent-hover continues to derive from --accent via color-mix() */
  }
}
```

Four lines plus the recomputation. Every selector in the stylesheet that read `var(--bg)`, `var(--fg)`, `var(--card-bg)`, `var(--card-rule)`, or `var(--accent)` updates automatically.

</details>

<details>
<summary>How do I check contrast in dark mode?</summary>

Toggle your OS-level dark mode (or use DevTools' "Rendering" panel → "Emulate CSS media feature `prefers-color-scheme`" → `dark`). Then open the color picker on your card body text. The contrast readout reflects the dark surface. If body text fails 4.5:1, lighten `--fg` until it passes.

</details>

## Stretch

- Add a third theme variant — `:root[data-theme="high-contrast"] { --fg: #ffffff; --bg: #000000; ... }` — and toggle it manually by editing the `<html>` tag in DevTools. The same machinery works for an explicit user toggle (we will wire one up with JavaScript in Week 4).
- Add a `--ring` token (`color-mix(in oklch, var(--accent) 40%, transparent)`) and use it for `:focus-visible` outlines on the link: `outline: 3px solid var(--ring); outline-offset: 2px;`. The focus ring then adapts to whichever theme is active.
- Move the typography tokens into their own block, the space tokens into their own block, and the role tokens into their own block. Confirm the file reads top-to-bottom as: reset → palette → role tokens → typography tokens → space tokens → dark-mode overrides → component rules.

## Self-check

Diff `before.css` and `after.css` side by side. The `before.css` has nine hard-coded colors; the `after.css` should have **zero hard-coded colors below the token block**. Open both pages in light mode — they should be visually indistinguishable. Toggle to dark mode — `before.html` does not change; `after.html` flips coherently.

## Submission

Commit `exercises/exercise-03/before.html`, `exercises/exercise-03/before.css`, `exercises/exercise-03/after.html`, and `exercises/exercise-03/after.css` to your Week 2 repo. In your commit message, list the four role tokens your dark-mode block overrides.
