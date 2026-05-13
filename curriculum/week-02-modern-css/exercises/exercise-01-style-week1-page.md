# Exercise 1 — Style your Week 1 essay page

**Time:** ~60 minutes.

## Problem statement

Take the essay page you wrote for Week 1 — `writing/why-i-build-on-the-web.html` from the Week 1 mini-project, or the Exercise 1 article page if the mini-project is not in front of you. Add a single `styles.css` file that produces a readable, typeset, accessible result. No frameworks. No reset library. Honest CSS only.

## Source content

Copy your Week 1 HTML into `exercises/exercise-01/index.html`. Do not modify the markup yet — the point is that good HTML can be styled cleanly. If your Week 1 markup is shaky (you ended up with a `<div>` where an `<article>` belonged), fix that *first*; the CSS will not save you.

Create `exercises/exercise-01/styles.css` and link it from `<head>`:

```html
<link rel="stylesheet" href="./styles.css">
```

## Acceptance criteria

- [ ] A single `styles.css` exists at `exercises/exercise-01/styles.css` and is linked from the HTML.
- [ ] The file opens with a `*, *::before, *::after { box-sizing: border-box; }` rule.
- [ ] `:root` declares at least these custom properties: `--ink`, `--parchment`, `--rule`, `--page-sky`, `--page-sky-deep`, `--font-display`, `--font-body`, `--type-base`, `--type-h1`, `--type-h2`, `--space-3`, `--space-4`.
- [ ] `body` reads `background` from `--parchment` (or a token derived from it) and `color` from `--ink`.
- [ ] Headings (`h1`, `h2`, `h3`) use a display family — your choice; EB Garamond is the C8 default.
- [ ] Body text uses a body family — your choice; Lora is the C8 default.
- [ ] Paragraphs cap their line length at `max-width: 65ch`.
- [ ] Links use `--page-sky-deep` for `color` (passes WCAG AA on parchment).
- [ ] No selector in the file exceeds specificity `(0, 0, 1, 1)` except your `:root` token block.
- [ ] The page still passes <https://validator.w3.org/nu/> (you did not break the HTML).
- [ ] The page passes axe DevTools with zero serious issues — in particular, **no color-contrast violations**.

## Hints

<details>
<summary>How do I load EB Garamond and Lora?</summary>

In `<head>`, before your stylesheet link:

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet"
      href="https://fonts.googleapis.com/css2?family=EB+Garamond:wght@400;600&family=Lora:wght@400;600&display=swap">
```

Then in your stylesheet:

```css
:root {
  --font-display: "EB Garamond", Georgia, serif;
  --font-body:    "Lora", Georgia, serif;
}
```

The fallback (`Georgia, serif`) renders while the webfont loads, then swaps. The two fonts are visually compatible enough that the swap is not jarring.

</details>

<details>
<summary>How do I check contrast inside DevTools?</summary>

Open DevTools → Elements panel → click any text element → in the Styles pane, click the color swatch next to `color`. The picker opens with a **contrast ratio** readout against the computed background, and an AA/AAA badge. If it reads "Aa" with a checkmark, body text passes; large text needs only 3:1.

If the picker says "Background unknown," you have a transparent ancestor — set a `background` on `<body>` or the containing block first.

</details>

<details>
<summary>The page is full-width and reads like a wall of text. What do I add?</summary>

A wrapper around `<main>`, or a `max-width` on `main` itself:

```css
main {
  max-width: 70ch;
  margin-inline: auto;
  padding-inline: var(--space-4);
}
```

`max-width: 70ch` keeps lines readable. `margin-inline: auto` centers the column. `padding-inline` ensures the text does not touch the screen edge on phones.

</details>

<details>
<summary>How do I style the "skip to main content" link so it is invisible until focused?</summary>

```css
.skip-link {
  position: absolute;
  left: var(--space-3);
  top: -3rem;
  background: var(--ink);
  color: var(--parchment);
  padding: var(--space-2) var(--space-3);
  z-index: 1000;
  transition: top 0.15s ease;
}

.skip-link:focus {
  top: var(--space-3);
}
```

The link sits off-screen by default; tabbing into it slides it into view. A keyboard user sees and can activate it; a mouse user never knows it is there.

</details>

## Stretch

- Add a `@media (prefers-color-scheme: dark)` block that overrides four tokens (`--bg`, `--fg`, `--rule`, `--accent`) and produces a dark theme without duplicating any rule. Toggle your OS theme; the page flips.
- Style the byline so the publication date is in a smaller, lighter weight than the author's name, using a single selector that targets `<time>` inside the article header.
- Add a `:focus-visible` outline that respects the brand accent: `outline: 2px solid var(--page-sky); outline-offset: 2px;`. Re-tab through the page; every focusable element should be visibly outlined.
- Open the page in Chrome's "device toolbar" (`Cmd+Shift+M` / `Ctrl+Shift+M`) at 320 px wide. The text should still read; no horizontal scroll. If it does scroll, find the element wider than the viewport and fix it.

## Self-check

Open DevTools, click your `<h1>`, and switch to the Computed tab. Trace `font-family` — it should resolve to your `--font-display` stack. Trace `color` — it should resolve to `--fg` or `--ink`. Trace `font-size` — it should show a number like `48px` at desktop width, dropping to something near `32px` if you resize the window to 320 px.

If any of those traces returns a value you did not declare, your custom-property chain is broken somewhere. Read the Styles pane (rules in cascade order) and find the override.

## Submission

Commit `exercises/exercise-01/index.html` and `exercises/exercise-01/styles.css` to your Week 2 repo. In your commit message, name the contrast ratio of body text against background on your page (the picker reports this; round to one decimal).
