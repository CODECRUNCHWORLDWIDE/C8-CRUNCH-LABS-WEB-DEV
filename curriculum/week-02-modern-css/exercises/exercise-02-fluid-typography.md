# Exercise 2 — Fluid typography

**Time:** ~50 minutes.

## Problem statement

Build a small static page that demonstrates a complete `clamp()`-based type scale — five sizes, each scaling continuously between a defined minimum and maximum. Resize the window from 320 px to 1440 px and watch the type breathe. No breakpoints; no media queries for `font-size`.

## Source content

Create `exercises/exercise-02/index.html` with this markup:

```html
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Fluid type scale</title>
  <link rel="stylesheet" href="./styles.css">
</head>
<body>
  <main>
    <h1>The display heading</h1>
    <h2>A section heading</h2>
    <h3>A subsection heading</h3>
    <p class="lede">A lede paragraph. The first paragraph after a heading often deserves a slightly larger size to invite the reader in.</p>
    <p>A regular body paragraph. Most of your prose lives at this size. Read it at 320 px, at 800 px, and at 1440 px. Notice that the size never jumps — it scales smoothly with the viewport.</p>
    <p class="small">A small note, for captions, metadata, and footnotes.</p>
  </main>
</body>
</html>
```

Create `exercises/exercise-02/styles.css` and build a fluid type scale.

## Acceptance criteria

- [ ] `styles.css` declares custom properties `--type-small`, `--type-base`, `--type-lede`, `--type-h3`, `--type-h2`, `--type-h1`, each using `clamp()`.
- [ ] No media query in the file changes any `font-size`. (`prefers-color-scheme` is fine; viewport-based `min-width` queries are not.)
- [ ] At 320 px viewport width, every size renders at or above its `clamp()` minimum.
- [ ] At 1440 px viewport width, every size renders at or below its `clamp()` maximum.
- [ ] In between, every size scales continuously — no visible "snap" at any width.
- [ ] `h1`, `h2`, `h3` use a display family; body uses a body family. (Pick any two.)
- [ ] All headings declare `line-height: 1.2` and `text-wrap: balance`.
- [ ] All paragraphs declare `line-height: 1.6` and `max-width: 65ch`.
- [ ] The page passes axe DevTools with zero contrast violations.

## Suggested scale

A starting point — feel free to tune. Type the values; do not paste.

```css
:root {
  --type-small: clamp(0.875rem, 0.85rem + 0.1vw, 0.95rem);
  --type-base:  1rem;
  --type-lede:  clamp(1.05rem, 1rem + 0.25vw, 1.2rem);
  --type-h3:    clamp(1.15rem, 1.05rem + 0.4vw, 1.4rem);
  --type-h2:    clamp(1.5rem, 1.2rem + 1.5vw, 2.25rem);
  --type-h1:    clamp(2rem, 1.4rem + 3vw, 3.5rem);
}
```

## Hints

<details>
<summary>How do I pick the min, preferred, and max?</summary>

A workable formula:

- **Min** — the size you would set at 320 px wide (a small phone). Body text 16 px (1 rem) is the floor.
- **Max** — the size you would set at 1440 px wide (a laptop). Display headings can reach 3–4 rem; body stays small.
- **Preferred** — a linear function of viewport width that smoothly bridges the two: `Xrem + Yvw`. Where `X` is a constant chunk and `Y` is the rate at which the size grows with the viewport.

A quick check: plug 320 px and 1440 px into your preferred expression. The math:

```
size_at_320px  = X rem + Y * (320 / 100) px  = X rem + 3.2Y px
size_at_1440px = X rem + Y * (1440 / 100) px = X rem + 14.4Y px
```

You want `size_at_320px ≤ min` (so the clamp catches at the small end) and `size_at_1440px ≤ max` (so the heading scales meaningfully on the way up). If the math is unfriendly, the [Utopia calculator](https://utopia.fyi/) will emit a scale for you — but type the values yourself once before reaching for the tool.

</details>

<details>
<summary>How do I test continuous scaling without dragging the window?</summary>

Open DevTools' **Device Toolbar** (`Cmd+Shift+M` / `Ctrl+Shift+M`). At the top is a "Responsive" device with a draggable width slider. Drag from 320 px upward and watch the heading sizes. At each `clamp()`'s breakpoint, the size will gradually shift; there should be no visible snap unless you cross a hardcoded media query (you have none).

</details>

<details>
<summary>My headings are wrapping awkwardly at narrow widths.</summary>

`text-wrap: balance` distributes the words across lines instead of letting the last line orphan a single word:

```css
h1, h2, h3 {
  text-wrap: balance;
}
```

For paragraphs, use `text-wrap: pretty` (where supported) — same idea, optimized for prose rather than headings.

</details>

## Stretch

- Add a "ruler" at the top of the page that prints the current viewport width using a CSS-only trick:

  ```css
  body::before {
    content: "viewport: " counter(vw) "px";
    counter-reset: vw var(--current-vw);
  }
  ```

  (This requires a tiny `style="--current-vw: ..."` to be set, since CSS cannot read viewport width as a counter. The point of the exercise is *seeing the scale change*; the ruler is a reading aid.)
- Pair the `clamp()`-based type scale with a `clamp()`-based **space scale**: `--space-3: clamp(0.875rem, 0.5rem + 0.5vw, 1.25rem);` and so on. Spacing should breathe with type.
- Add a dark-mode override and confirm that the type scale is independent of the color tokens (it should be).

## Self-check

At 320 px wide, your `h1` should be roughly **32 px**. At 1440 px wide, it should be roughly **56 px** (3.5 rem). Body should be exactly **16 px** at every width (the base is not fluid in our scale). If you see body text changing size with the viewport, you have a stray `vw` somewhere — remove it.

## Submission

Commit `exercises/exercise-02/index.html` and `exercises/exercise-02/styles.css` to your Week 2 repo. In your commit message, name the rendered `h1` size at 320 px and at 1440 px from your devtools (round to the nearest pixel).
