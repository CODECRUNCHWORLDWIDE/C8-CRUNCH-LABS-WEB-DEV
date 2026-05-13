# Exercise 2 — The holy-grail layout

**Time:** ~60 minutes.

## Problem statement

Build the classic "holy grail" page layout: a header across the top, a nav on the left, a main column in the middle, an aside on the right, a footer across the bottom. On a phone, the layout collapses to a single column: header, then main, then nav, then aside, then footer. **Use `grid-template-areas` and one `@media` breakpoint.**

This is the layout that, in 2010, was hard enough to have its own name. We will build it in roughly 25 lines of CSS.

```text
At ≥ 920 px (desktop):

┌────────────────────────────────────────────────────┐
│ ●●●    https://example.test/                       │
├────────────────────────────────────────────────────┤
│ ┌────────────────────────────────────────────────┐ │
│ │              HEADER (spans all)                │ │
│ ├──────┬─────────────────────────────────┬───────┤ │
│ │      │                                 │       │ │
│ │ NAV  │            MAIN                 │ ASIDE │ │
│ │      │                                 │       │ │
│ ├──────┴─────────────────────────────────┴───────┤ │
│ │              FOOTER (spans all)                │ │
│ └────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────┘

At < 920 px (mobile):

┌──────────────────┐
│ ●●● ...test/     │
├──────────────────┤
│ HEADER           │
├──────────────────┤
│ MAIN             │
├──────────────────┤
│ NAV              │
├──────────────────┤
│ ASIDE            │
├──────────────────┤
│ FOOTER           │
└──────────────────┘
```

## Source content

Create `exercises/exercise-02/index.html` and `exercises/exercise-02/styles.css`. Use semantic landmarks — `<header>`, `<nav>`, `<main>`, `<aside>`, `<footer>` — as the direct children of a `<div class="page">` or, better, of `<body>`. The HTML is bare-bones; the layout is the point.

```html
<body>
  <header>
    <p class="brand">Code Crunch</p>
  </header>
  <nav aria-label="Section">
    <ul>
      <li><a href="#">Home</a></li>
      <li><a href="#">Posts</a></li>
      <li><a href="#">Tags</a></li>
    </ul>
  </nav>
  <main>
    <h1>An article headline</h1>
    <p>Body paragraphs of the article go here. Several of them, so the column has visible height.</p>
    <p>A second paragraph. A third. A fourth, with a <a href="#">link</a> in it.</p>
  </main>
  <aside aria-label="Related">
    <h2>Related</h2>
    <ul>
      <li><a href="#">A related piece</a></li>
      <li><a href="#">Another</a></li>
    </ul>
  </aside>
  <footer>
    <p>© 2025 Code Crunch.</p>
  </footer>
</body>
```

Notice that DOM order is **header, nav, main, aside, footer**. A screen-reader user navigating by source order will hear them in that order. On a phone, the visual order is also header → main → nav → aside → footer (we want the main content first on a phone, then the nav). Grid lets us rearrange the visual order without touching the DOM order.

## Acceptance criteria

- [ ] `exercises/exercise-02/index.html` and `exercises/exercise-02/styles.css` exist; the stylesheet is linked from `<head>`.
- [ ] The HTML uses semantic landmarks: `<header>`, `<nav>`, `<main>`, `<aside>`, `<footer>` — each one once.
- [ ] `<nav>` has an `aria-label`; `<aside>` has an `aria-label`.
- [ ] `<body>` (or a `.page` wrapper) uses `display: grid` with `grid-template-areas`, `grid-template-columns`, and `grid-template-rows`.
- [ ] At desktop width, the layout matches the diagram above: header full, nav-main-aside in a row, footer full.
- [ ] At mobile width, exactly one `@media (max-width: ...)` query (or one `@media (min-width: ...)` written mobile-first) flips the layout to a single column. The order of the column on mobile: header, main, nav, aside, footer.
- [ ] No CSS rule other than the container's `grid-template-areas` and `grid-template-columns` changes between the two viewports. The component rules (`nav { grid-area: nav; }`) are declared once.
- [ ] Tab order from the URL bar walks the DOM in source order — header link, nav links, main link, aside links, footer — at every viewport. (Use the keyboard to verify.)
- [ ] The page passes the validator and axe DevTools cleanly.
- [ ] The page renders with no horizontal scroll at 320 px and at 1440 px.

## Hints

<details>
<summary>Where do I declare <code>grid-template-areas</code>?</summary>

On the **container** — the element with `display: grid` on it. That is `<body>` if you grid the body directly, or `.page` if you wrap the children in a div.

```css
body {
  display: grid;
  grid-template-columns: 200px 1fr 240px;
  grid-template-rows: auto 1fr auto;
  grid-template-areas:
    "header header header"
    "nav    main   aside"
    "footer footer footer";
  min-height: 100vh;
  gap: var(--space-4);
}
```

The number of strings in `grid-template-areas` is the number of rows; the number of names per string is the number of columns. They must match `grid-template-columns` and `grid-template-rows`.

</details>

<details>
<summary>How do I assign each landmark to its area?</summary>

```css
body > header { grid-area: header; }
body > nav    { grid-area: nav; }
body > main   { grid-area: main; }
body > aside  { grid-area: aside; }
body > footer { grid-area: footer; }
```

A landmark in an area named `header` lands in whichever rectangle of the grid is labeled `header` in `grid-template-areas`. If the area name is not present in `grid-template-areas`, the item is auto-placed instead.

</details>

<details>
<summary>How do I write the mobile-first version?</summary>

The mobile-first form declares the single-column case as the default, then layers on the desktop layout inside `@media (min-width: ...)`:

```css
body {
  display: grid;
  grid-template-columns: 1fr;
  grid-template-areas:
    "header"
    "main"
    "nav"
    "aside"
    "footer";
  min-height: 100vh;
  gap: var(--space-3);
}

@media (min-width: 58em) {
  body {
    grid-template-columns: 200px 1fr 240px;
    grid-template-areas:
      "header header header"
      "nav    main   aside"
      "footer footer footer";
    gap: var(--space-4);
  }
}
```

The component rules — which area each landmark lives in — never change.

</details>

<details>
<summary>Why <code>aria-label</code> on the nav and the aside?</summary>

Per WAI-ARIA, when there is more than one `<nav>` (or more than one `<aside>`) on a page, each one needs a label so a screen reader can distinguish them. A page with a main nav and a footer nav uses `aria-label="Primary"` on one and `aria-label="Footer"` on the other. Even with one nav, an explicit label improves the experience: NVDA reads "Section, navigation, list with three items," not "navigation, list."

</details>

## Stretch

- Add a `nav` for breadcrumbs **inside** `<main>`, above the `<h1>`. The outer `<nav>` and the breadcrumb `<nav>` need different `aria-label`s. Watch the rotor in VoiceOver (or the landmarks list in NVDA) to see how the page outline now reads.
- Make the sidebar `<nav>` sticky on desktop: `position: sticky; top: var(--space-4); align-self: start;`. The nav stays in view as the main column scrolls. Skip this on mobile (it would push the main below the screen on a phone).
- Replace `grid-template-columns: 200px 1fr 240px` with `minmax(180px, 220px) minmax(0, 70ch) minmax(200px, 260px)`. The middle column now respects a 70ch reading measure; the side columns clamp between sensible minima and maxima.
- Add a "skip to main content" link as the first child of `<body>`. Style it so it is visually hidden until focused, then slides into view. (You wrote this in Week 2 — re-use the rule.) Tab from the URL bar; the skip link should appear, take you to `<main>`, and skip the nav.

## Self-check

Click into DevTools, then click the "grid" badge next to your container's `display: grid`. The browser overlays the named areas on the page. Each area shows its name. Drag the viewport across your `@media` breakpoint; watch the areas rearrange.

Then tab through the page from the URL bar at desktop width. The tab order: header link → nav links → main link → aside links → footer link. Drag the viewport to a phone width. Tab again. **The tab order should not change** — only the visual order did. This is the meaningful-sequence rule (WCAG 2.2 SC 1.3.2) in action: DOM order is preserved, only the visual layout shifts.

## Submission

Commit `exercises/exercise-02/index.html` and `exercises/exercise-02/styles.css` to your Week 3 repo. In your commit message, note the exact breakpoint (in `em`) at which your layout flips from one column to three, and one sentence on why you chose that value. (Hint: it is where the three-column layout starts to look comfortable, not where some device "begins.")
