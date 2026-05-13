# Lecture 2 — Grid, and When to Use Which

> **Outcome:** You can build a two-dimensional layout with `display: grid`, declare column tracks with `grid-template-columns` and the `fr` unit, place items by line number or by named area, build a fluid card grid with `repeat(auto-fit, minmax(...))` that needs no media query, choose between Flexbox and Grid in one sentence, write a single `@media` query that flips a layout from a one-column phone view to a multi-column desktop view, and reach for a container query when the layout depends on the component's size rather than the viewport.

## 1. Why a second layout engine

Flexbox handles one dimension at a time. Most page-level layouts have rows **and** columns that align to each other — a header that spans across a sidebar and a main column, a card grid where every card stays the same width regardless of how many fit per row, a magazine page where a pull quote spans two columns of body text. Those are two-dimensional. CSS Grid is the browser's two-dimensional layout engine, and it is, line for line, the most powerful layout system any GUI toolkit has ever shipped.

Grid was a long time coming. The spec started in 2011, drafted by a team led by Microsoft (the early IE prototype shipped years before any other browser had it). Firefox shipped Grid in 2017; Chrome the same week; Safari the next month. Subgrid landed in 2023. The whole thing — every browser, full spec, no polyfill required — is mature now. There is no reason to avoid Grid in 2024.

This lecture is the model. We will declare grids by tracks, place items by line numbers and by named areas, see the `auto-fit` / `minmax()` pair that builds a fluid grid with no media query, and end with the decision rule for Flexbox vs Grid.

---

## 2. The two ideas Grid is built on

> **A grid is defined by its tracks (columns and rows) and the lines between them. You place items into the grid by saying which lines they start and end on — or by giving the lines names and using those.**

Internalize that and Grid stops being a list of properties and becomes a small geometric vocabulary.

```text
       line 1   line 2   line 3   line 4
         │        │        │        │
         ▼        ▼        ▼        ▼
       ┌────────┬────────┬────────┐
row 1  │  A     │  B     │  C     │  ← row track
       ├────────┼────────┼────────┤
row 2  │  D     │  E     │  F     │  ← row track
       └────────┴────────┴────────┘
         ↑        ↑        ↑
       column   column   column
       track    track    track
```

Three columns, two rows. Four column lines (numbered left-to-right) and three row lines (numbered top-to-bottom). An item can occupy any rectangle defined by a pair of column lines and a pair of row lines. "From column line 1 to column line 3, row line 1 to row line 2" gives you a cell that spans two columns of row one.

A grid container — any element with `display: grid` — owns its tracks; its children, the grid items, place themselves into the tracks. As with Flexbox, the container has its properties and the children have theirs. Unlike Flexbox, the container has *many* more properties, because tracks are far more expressive than a main axis.

---

## 3. Declaring the tracks

The two core properties on the container are `grid-template-columns` and `grid-template-rows`. Each takes a list of track sizes.

```css
.three-col {
  display: grid;
  grid-template-columns: 200px 1fr 200px;
}
```

Three columns: 200 px, then a "fraction" track that takes the rest, then 200 px. Read it left-to-right; that is the visual order from line 1 to line 4.

### The `fr` unit

`fr` is a Grid-specific unit meaning "one fraction of available space." If you write `grid-template-columns: 1fr 2fr`, the first column gets one-third of the remaining width, the second gets two-thirds. Fractional units only consume **remaining** space, after fixed-size tracks have taken their share.

```css
.layout {
  display: grid;
  grid-template-columns: 240px 1fr;   /* sidebar 240px, main everything else */
}
```

This is the right way to size a sidebar. Not percentages (which do not account for the gutter), not `flex-basis: 240px` arithmetic, not `width: calc(100% - 240px)` on the main. Just `1fr`, which means "take what is left."

### `repeat()`

`repeat(N, track)` repeats a track N times. The two are equivalent:

```css
.card-grid    { grid-template-columns: 1fr 1fr 1fr 1fr; }
.card-grid    { grid-template-columns: repeat(4, 1fr); }
```

`repeat()` becomes essential the moment you reach for `auto-fit` and `auto-fill` (next section).

### `minmax(a, b)`

A track sized `minmax(a, b)` is at least `a` and at most `b`. `minmax(200px, 1fr)` means "200 px minimum, then take all remaining space."

```css
.layout {
  display: grid;
  grid-template-columns: minmax(240px, 320px) 1fr;
}
```

The sidebar is no smaller than 240 px and no larger than 320 px; the main takes whatever is left.

### The killer combo: `repeat(auto-fit, minmax(...))`

This is the single most-quoted Grid pattern, and it deserves the reputation:

```css
.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: var(--space-4);
}
```

What that says, in plain English: "build as many columns as fit in the container, where each column is at least 260 px and at most one-fraction-of-leftover-space. When the container narrows past 260 px per slot, drop a column."

On a 320 px phone, you get one column of cards. On a 600 px tablet, you get two. On a 1200 px laptop, you get four. With no `@media` query. The Grid algorithm does the math.

A note on `auto-fit` vs `auto-fill`:

- `auto-fit` collapses empty tracks. If you have three cards in a grid sized for four, the three cards expand to fill the full width.
- `auto-fill` keeps empty tracks. The three cards stay at 260 px each, with empty space on the right.

For card grids, `auto-fit` is almost always what you want. For form layouts where you want consistent alignment regardless of how many items are present, `auto-fill` is sometimes right.

---

## 4. Placing items by line number

By default, the grid auto-places items one after another, left-to-right, top-to-bottom, into whatever cells are available. For the card-grid case, that is exactly what you want — write the items, let the grid sort them.

When you want explicit placement, you set `grid-column` and `grid-row` on the item. Each takes a start and end line, separated by `/`.

```css
.featured {
  grid-column: 1 / 4;       /* span from line 1 to line 4 — three columns */
  grid-row: 1 / 2;
}
```

A shorthand: `span N` means "span N tracks from wherever this item starts."

```css
.hero {
  grid-column: 1 / -1;      /* line 1 to the last line — full width */
}

.callout {
  grid-column: span 2;      /* span 2 columns, wherever I auto-place */
}
```

`-1` is "the last line" — useful because it adapts when you change `grid-template-columns`. A `grid-column: 1 / -1` declaration stays correct as you add or remove columns.

---

## 5. Named areas — layout in ASCII art

The single most readable way to declare a page layout is **`grid-template-areas`**. You name regions of the grid in a string-of-strings, then assign each item to one of the named regions.

```css
.page {
  display: grid;
  grid-template-columns: 240px 1fr;
  grid-template-rows: auto 1fr auto;
  grid-template-areas:
    "header  header"
    "nav     main"
    "footer  footer";
  min-height: 100vh;
  gap: var(--space-4);
}

.page > header  { grid-area: header; }
.page > nav     { grid-area: nav; }
.page > main    { grid-area: main; }
.page > footer  { grid-area: footer; }
```

Read the `grid-template-areas` block out loud: "the header spans both columns; the nav is on the left, the main on the right; the footer spans both columns." Anyone reading your CSS sees the layout immediately. No line-number bookkeeping, no off-by-one errors. The layout is its own diagram.

To rearrange on a phone — the whole layout to a single column, nav after the main — you change only the areas, in a `@media` block:

```css
@media (max-width: 720px) {
  .page {
    grid-template-columns: 1fr;
    grid-template-areas:
      "header"
      "main"
      "nav"
      "footer";
  }
}
```

The component rules (`.page > nav { grid-area: nav; }`) are not duplicated. Each item knows which named area it lives in; the container reshuffles the areas.

This is, in eight lines, the layout that took three years and a JavaScript polyfill to ship in 2010. The pattern has a name in the industry — "the holy grail" — for historical reasons. The holy grail is now a homework problem.

```text
┌──────────────────────────────────────────────────┐
│ ●●●    https://example.test/                     │
├──────────────────────────────────────────────────┤
│                                                  │
│  ┌────────────────────────────────────────────┐  │
│  │           HEADER (spans both)              │  │
│  ├────────┬───────────────────────────────────┤  │
│  │        │                                   │  │
│  │ NAV    │           MAIN                    │  │
│  │        │                                   │  │
│  │        │                                   │  │
│  ├────────┴───────────────────────────────────┤  │
│  │           FOOTER (spans both)              │  │
│  └────────────────────────────────────────────┘  │
│                                                  │
└──────────────────────────────────────────────────┘
```

---

## 6. The mobile-first mindset

Before we go further on responsiveness, a short word on the authoring style C8 recommends and why.

**Mobile-first** means: write the small-screen case as the default, and layer on larger-viewport overrides with `@media (min-width: ...)`. The pattern looks like:

```css
.card-grid {
  display: grid;
  grid-template-columns: 1fr;       /* phone default */
  gap: var(--space-4);
}

@media (min-width: 640px) {
  .card-grid { grid-template-columns: repeat(2, 1fr); }
}

@media (min-width: 1024px) {
  .card-grid { grid-template-columns: repeat(3, 1fr); }
}
```

Compare to the **desktop-first** style — write the wide case as the default, layer on small-screen overrides with `@media (max-width: ...)`. Both work. Mobile-first is the recommended style for three reasons:

1. **The small-screen case is the harder case.** Phones are smaller, slower, and have less attention from designers. Writing the phone view first forces you to design for it; tacking on a phone override at the end almost always produces a degraded experience.
2. **The CSS reads in order of progressive enhancement.** Default rules first, then "if the viewport is wider, layer this on." That maps onto how the browser parses your stylesheet.
3. **Half the world's web traffic is mobile.** A stylesheet that prioritizes the small screen prioritizes half your users.

A note: mobile-first does not mean phone-only. It means **smallest-supported-viewport-first**. For a public web page, that is 320 CSS px (WCAG 2.2 SC 1.4.10 — Reflow). For an internal tool that only loads on desktops, you can choose 1024 px as the default. The principle is "design for the constraint, scale up."

For most of this course, the default is 320 px and the first `@media` you reach for is `@media (min-width: 640px)`.

---

## 7. Breakpoints — chosen by content, not device

A common beginner mistake is to write breakpoints by device class:

```css
/* The wrong way */
@media (min-width: 768px) { /* "tablet" */ }
@media (min-width: 1024px) { /* "laptop" */ }
@media (min-width: 1440px) { /* "desktop" */ }
```

This made sense in 2012, when there were three classes of device and they were predictable. In 2024, the device matrix runs from 280 px (folded phone) to 3000 px (ultrawide), and every value in between is a real screen someone uses. Tablets and small laptops overlap. Foldables exist. "Tablet" is not a width.

The right way: pick breakpoints **at the viewport widths where your layout actually breaks**. Drag your layout in the device toolbar; watch where lines wrap awkwardly, where a card grid leaves an orphan, where two-column copy becomes too narrow to read. Those are your breakpoints. They will not be 768 and 1024; they will be 540 and 920 and 1340, or whatever the content demands.

```css
/* The right way — breakpoints where content needs them */
@media (min-width: 38em) { /* the card grid wants two columns here */ }
@media (min-width: 58em) { /* the nav wants to ungroup here */ }
@media (min-width: 72em) { /* the article wants a sidebar here */ }
```

A second tip: **prefer `em` to `px` for `@media` widths**. A breakpoint in `em` scales with the user's font size — a low-vision user who has bumped font size from 16 to 24 px gets your phone layout at a wider viewport, because their reading is what determined the breakpoint, not the screen.

---

## 8. Container queries — when the component, not the viewport, decides

A `@media` query is keyed to the viewport. But most "responsive" decisions are not really about the viewport; they are about how much room a particular component has. A card in a sidebar may have 300 px to render in; the same card on a wide page may have 800 px. The viewport tells you neither.

Container queries fix this. They shipped in every browser in 2023.

The pattern:

```css
.card-container {
  container-type: inline-size;
  container-name: card;
}

.card {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--space-3);
}

@container card (min-width: 480px) {
  .card {
    grid-template-columns: 200px 1fr;   /* image on the left, body on the right */
  }
}
```

What this says: when the **container** named `card` is at least 480 px wide, switch the card from a stacked layout to a horizontal one. The viewport could be 320 px (phone) or 3000 px (ultrawide); what matters is whether *this card's container* has room for the horizontal layout.

That decoupling is the unlock. The same card component looks one way in the main column of a wide article and another way in a narrow sidebar of the same page, **with no JavaScript and no awareness of where it lives**. The component is genuinely portable.

When to reach for container queries vs `@media`:

- **`@media`** — for page-level layout decisions. "On a wide viewport, the page has a sidebar." This is about the viewport.
- **`@container`** — for component-level layout decisions. "When this card has room, it lays out horizontally." This is about the component.

A 2024 stylesheet typically has fewer `@media` queries than a 2014 stylesheet — replaced by `clamp()` for sizing and `@container` for component layout. The cases that remain are page-level, and there are only a handful of them.

---

## 9. The Flexbox vs Grid decision, in one rule

> **Flexbox is for layouts that are essentially a row or a column. Grid is for layouts where rows and columns relate.**

A small decision tree:

1. Is the layout a single row of items, or a single column? → Flexbox.
2. Is the layout a row that wraps, where each item is the same size? → Either works. Grid `auto-fit` is fewer lines.
3. Does the layout have multiple regions that span across rows and columns (a header above a sidebar-and-main)? → Grid.
4. Is the layout one component that arranges its children differently at different sizes? → Container query, on whichever of Flexbox or Grid suits the child arrangement.

A second rule of thumb: **build the page with Grid, build the components inside the page with Flexbox**. The page's overall structure — header, nav, main, aside, footer — is two-dimensional, so Grid. Within `<main>`, a card has an image, a heading, a paragraph, and a button row — that is essentially a column, so Flexbox. The two engines compose; you will use both on every nontrivial page.

A third, less important rule: **do not nest Grid containers inside Grid containers for one-dimensional sub-layouts**. Grid is excellent at two dimensions; nesting it for a button bar inside a card is more code than the same button bar in Flexbox. Use the right tool at each level.

---

## 10. A worked example — the card grid

Bringing it together. Build a card grid that:

- Is one column at 320 px.
- Wraps to two, three, or four columns as the viewport grows.
- Has no `@media` query.
- Has accessible focus on each card.
- Renders an image that holds its aspect ratio.

The HTML:

```html
<section class="card-grid">
  <article class="card">
    <a class="card-link" href="/posts/one">
      <img src="one.jpg" alt="" width="640" height="480">
      <h3>The first card</h3>
      <p>A short summary of the first card's content.</p>
    </a>
  </article>
  <article class="card"> ... </article>
  <article class="card"> ... </article>
</section>
```

The CSS:

```css
.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 280px), 1fr));
  gap: var(--space-4);
}

.card {
  background: var(--surface-bg);
  border: 1px solid var(--rule);
  border-radius: var(--radius-1);
  overflow: hidden;
}

.card img {
  width: 100%;
  aspect-ratio: 4 / 3;
  object-fit: cover;
  display: block;
}

.card-link {
  display: block;
  padding: var(--space-3);
  color: inherit;
  text-decoration: none;
}

.card-link:focus-visible {
  outline: 2px solid var(--accent-ring);
  outline-offset: 3px;
}
```

A small note on `minmax(min(100%, 280px), 1fr)` — the inner `min()` exists because, at very narrow viewports, the 280 px minimum would cause horizontal scroll. `min(100%, 280px)` means "the smaller of the container's full width or 280 px," so on a 320 px phone the column is allowed to drop below 280 px and the page stays scroll-free. This is a 2022-era refinement; before it, you needed a `@media (max-width: ...)` override to handle the phone case. Now one line of `min()` covers it.

```text
At 320 px viewport (1 column):

┌──────────────────┐
│ ●●● ...test/     │
├──────────────────┤
│ ┌──────────────┐ │
│ │  [image]     │ │
│ │  Card heading│ │
│ │  Summary...  │ │
│ └──────────────┘ │
│ ┌──────────────┐ │
│ │  [image]     │ │
│ │  Card heading│ │
│ │  Summary...  │ │
│ └──────────────┘ │
└──────────────────┘

At 1200 px viewport (4 columns):

┌────────────────────────────────────────────────────┐
│ ●●●    https://example.test/                       │
├────────────────────────────────────────────────────┤
│ ┌────┐  ┌────┐  ┌────┐  ┌────┐                     │
│ │img │  │img │  │img │  │img │                     │
│ │card│  │card│  │card│  │card│                     │
│ │ ...│  │ ...│  │ ...│  │ ...│                     │
│ └────┘  └────┘  └────┘  └────┘                     │
└────────────────────────────────────────────────────┘
```

Open the grid in DevTools and click the small "grid" badge that appears next to `display: grid`. The browser overlays the track lines. Resize the viewport. Watch the columns recompute as the available width changes. The browser is doing geometry; you are reading the result.

---

## 11. The accessibility check, integrated

Three things to verify on every Grid layout you build:

### 1. Reading order matches DOM order

Grid lets you place items anywhere on the grid, regardless of source order. That is power — and it is a way to make the visual order disagree with the screen-reader order. Per WCAG 2.2 SC 1.3.2 (Meaningful Sequence), they must match.

The rule: **let the DOM order match the order you want a screen reader to read**. Use `grid-area` placement only to lay out items in their natural order across the grid; do not use it to reverse the visual order from the source order.

If the natural visual order does not match the natural reading order, the right fix is to change the HTML, not the CSS.

### 2. Reflow at 320 CSS pixels

Per WCAG 2.2 SC 1.4.10, your content must reflow at 320 CSS px wide without horizontal scrolling. The combination of `repeat(auto-fit, minmax(min(100%, 280px), 1fr))` makes this easy for card grids. For other layouts — a wide table, a fixed-width hero — you will need a `@media (max-width: ...)` override or a `clamp()` on the width.

Open DevTools, choose "iPhone SE" in the device toolbar (or set the width to 320), and scroll. There should be no horizontal scrollbar, anywhere on any page.

### 3. Focus rings survive Grid gaps

Grid `gap` works the same way as Flex `gap` — it adds space between siblings without leaving a gap outside. Tab through your Grid layouts; every interactive element should have a visible focus ring that does not get clipped by a grid line or a neighbor's background.

A subtle one: a `:focus-visible` ring with `outline-offset: 3px` on an item that sits flush against a grid track line can extend into the gap. That is usually fine — the ring is visible — but if the gap is smaller than the offset, the ring will overlap a neighbor. Either grow the gap or shrink the offset.

---

## 12. Self-check

Without re-reading:

1. What is the `fr` unit, and what does `grid-template-columns: 1fr 2fr` do?
2. What does `grid-template-columns: repeat(auto-fit, minmax(280px, 1fr))` build?
3. Why is `minmax(min(100%, 280px), 1fr)` sometimes preferred over `minmax(280px, 1fr)`?
4. Write the `grid-template-areas` block for a header / sidebar / main / footer "holy grail" layout.
5. Mobile-first vs desktop-first — which does C8 recommend, and the three reasons.
6. When is a container query the right tool, and when is `@media` better?
7. The Flexbox vs Grid decision, in one sentence.

---

## Further reading

- **CSS-Tricks — A Complete Guide to CSS Grid**: <https://css-tricks.com/snippets/css/complete-guide-grid/>
- **MDN — Basic concepts of grid layout**: <https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_grid_layout/Basic_concepts_of_grid_layout>
- **CSS Grid Layout Module Level 2**: <https://www.w3.org/TR/css-grid-2/>
- **Ahmad Shadeed — Container Queries — A Quick Start**: <https://ishadeed.com/article/container-queries/>
- **WCAG 2.2 SC 1.4.10 — Reflow**: <https://www.w3.org/WAI/WCAG22/Understanding/reflow.html>
- **Grid Garden** (the game): <https://cssgridgarden.com/>

Next: the [exercises](../exercises/README.md), which apply both lectures to three real layouts.
