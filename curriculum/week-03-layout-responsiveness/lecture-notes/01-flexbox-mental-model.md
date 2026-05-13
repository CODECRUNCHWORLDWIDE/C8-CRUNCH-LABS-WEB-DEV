# Lecture 1 — The Flexbox Mental Model

> **Outcome:** You can explain Flexbox in terms of a main axis and a cross axis, set the four properties on a flex container that decide how its children behave, set the four properties on the children that override the container, build a navigation bar and a card row that wrap gracefully on a phone, and reach for `gap` instead of `margin` for spacing between siblings.

## 1. What layout actually is

Layout is the third pass the browser makes over your page. The first pass parses HTML into the DOM. The second pass — the cascade — resolves which CSS rules apply to which nodes. The third pass — **layout**, sometimes called **reflow** — decides where each box goes on screen.

Before Flexbox shipped (in every browser, finally, around 2014), the browser's only native layout modes were the ones inherited from print: **block flow** (one box on top of the next), **inline flow** (text flowing into lines), and the table model (rows and cells). Anything more interesting — a row of buttons aligned to the right of a header, three cards in a row that wrap to one column on a phone, a footer pinned to the bottom of the viewport — required `float`, negative margins, percentage widths that did not quite add up, and a heroic JavaScript fallback for IE.

Flexbox is the browser's answer. It is a **one-dimensional layout engine**: it arranges items along a single axis, either horizontally (a row) or vertically (a column), with rules for how the items size, align, wrap, and space themselves. One declaration — `display: flex` — turns the element into a flex container; from then on, the children play by Flexbox rules.

This lecture is about the mental model. We will set up a flex container, see the eight properties that do 95 percent of the daily work, and end with three patterns you will write every week for the rest of your career.

---

## 2. The main axis and the cross axis

> **The single concept Flexbox is built around: every flex container has a main axis (the direction items are laid out along) and a cross axis (perpendicular to the main axis). Every property is named relative to those two axes, not to "horizontal" or "vertical."**

Internalize that and Flexbox stops being a list of properties to memorize and becomes a small geometry problem.

```text
flex-direction: row;  (the default)

   ┌──── main axis ────►
   │
cross  ┌────┐  ┌────┐  ┌────┐
axis   │ A  │  │ B  │  │ C  │
   │   └────┘  └────┘  └────┘
   ▼
```

```text
flex-direction: column;

   main axis  ┌────┐
       │      │ A  │
       │      └────┘
       │      ┌────┐
       │      │ B  │
       ▼      └────┘
       cross axis
       ────────►
```

A flex container with `flex-direction: row` (the default) lays its children out left-to-right along the main axis. The main axis is horizontal; the cross axis is vertical. A flex container with `flex-direction: column` lays its children out top-to-bottom; the main axis is now vertical, the cross axis is now horizontal.

Two more values exist — `row-reverse` and `column-reverse` — which flip the direction along the same axis. They are honest features; they also rearrange tab order in ways that surprise users. Use them sparingly, and never to "fix" a visual problem you should fix in your HTML.

A note on writing modes: the spec uses **start** and **end** rather than **left** and **right** so that the same Flexbox CSS works on a right-to-left page (Arabic, Hebrew) without modification. When you read MDN and see "main-start" instead of "left," that is why. For an English-language site, `start` is the left and `end` is the right.

---

## 3. The four properties you set on the container

The flex container — the element with `display: flex` on it — owns four properties. These four decide how all its children will behave.

### `flex-direction`

The axis. `row` (default), `column`, `row-reverse`, `column-reverse`.

```css
.nav {
  display: flex;
  flex-direction: row;          /* items in a row; the default */
}

.sidebar {
  display: flex;
  flex-direction: column;       /* items stacked vertically */
}
```

### `flex-wrap`

What happens when the items do not fit on one main-axis line. `nowrap` (default — items shrink to fit, even past their content), `wrap` (overflow items move to a new line), `wrap-reverse` (same, but new lines stack in reverse cross-axis order).

```css
.card-row {
  display: flex;
  flex-wrap: wrap;              /* cards drop to a new row on a phone */
}
```

`flex-wrap: wrap` is, in practice, what you want on every flex row of cards or items. The default `nowrap` makes items shrink past the point of readability — three cards on a phone become three squashed columns. With `wrap`, they fall to two rows, then three, as the viewport narrows.

### `justify-content`

How items are distributed along the **main axis** when there is leftover space. The five values you will reach for:

- `flex-start` (default) — items packed at the start of the line.
- `flex-end` — items packed at the end.
- `center` — items centered on the line.
- `space-between` — first item at the start, last at the end, equal space between siblings. The right answer for a header with a logo on the left and a nav on the right.
- `space-around` — equal space around every item, including before the first and after the last.

```css
.header-row {
  display: flex;
  justify-content: space-between;   /* logo left, nav right */
  align-items: center;
}
```

### `align-items`

How items are aligned along the **cross axis**. The four values you will reach for:

- `stretch` (default) — items stretch to fill the cross axis. A row of cards with `align-items: stretch` all have the same height, regardless of content.
- `flex-start` — items aligned to the start of the cross axis.
- `flex-end` — items aligned to the end.
- `center` — items centered on the cross axis. This is "vertical centering in CSS," which used to be a meme. Now it is one line.

```css
.modal {
  display: flex;
  justify-content: center;          /* horizontal center */
  align-items: center;              /* vertical center */
  min-height: 100vh;
}
```

That is the entire surface area of vertical centering in 2024. One declaration on the parent. No `position: absolute`, no negative-margin tricks, no `vertical-align`. Flexbox solved it.

### `gap`

A fifth property worth treating as one of the core four: `gap` sets spacing **between** siblings, replacing the old `margin-right: var(--space-3); &:last-child { margin-right: 0; }` ritual.

```css
.nav ul {
  display: flex;
  gap: var(--space-4);              /* even spacing between nav items */
  list-style: none;
  padding: 0;
}
```

`gap` shipped for Flexbox in every browser by the end of 2021. Before that you reached for margins; you no longer have to. `gap` accepts a single length (same gap on both axes) or two lengths (`row-gap column-gap`). It does not add space outside the container — only between children. Use it.

---

## 4. The four properties you set on the children

A flex child — any direct child of the flex container — has its own four properties that override or extend the container's defaults.

### `order`

A number that overrides the source order of the item for layout purposes. Default is `0`; lower numbers come first, higher numbers come last. Negative numbers are allowed.

```css
.sale-badge {
  order: -1;        /* show first regardless of source order */
}
```

A warning: `order` changes only the visual order. The **DOM order** (and therefore tab order, screen-reader reading order, find-in-page order) is unchanged. Per WAI-ARIA Authoring Practices, when visual order and DOM order disagree, keyboard users get a confusing experience. Use `order` rarely, and only when the meaning of the content does not depend on which item comes first.

### `flex-grow`

A number — the share of leftover main-axis space this item will claim. Default is `0` (do not grow). A value of `1` means "claim an equal share of any leftover space"; `2` means "claim twice as much as a sibling with `1`."

```css
.search-bar {
  flex-grow: 1;     /* take all the leftover space in the header */
}
```

### `flex-shrink`

A number — how much this item should shrink when there is not enough space. Default is `1` (shrink proportionally with siblings). A value of `0` means "do not shrink, even if I overflow."

```css
.logo {
  flex-shrink: 0;   /* the logo never gets squashed */
}
```

### `flex-basis`

The item's main-axis size before grow or shrink is applied. Default is `auto` (use the content's intrinsic size). You can give it a length (`200px`, `25%`) or `0` to make grow/shrink the only sizing input.

The `flex` shorthand combines all three:

```css
.card {
  flex: 1 1 200px;    /* grow 1, shrink 1, basis 200px */
}
```

In practice, you will almost always write one of three shorthand values:

- `flex: 1` — equivalent to `flex: 1 1 0`. Each item grows from a zero basis and shares space equally.
- `flex: 1 1 auto` — each item starts from its content size and shares leftover space equally.
- `flex: 0 0 auto` — fixed size; no grow, no shrink. Useful for the logo in a header.

### `align-self`

Overrides the container's `align-items` for one specific child.

```css
.callout {
  align-self: center;   /* center this one item, regardless of siblings */
}
```

---

## 5. A worked example — a responsive header

Let us build a site header with a logo on the left, a nav on the right, and a graceful collapse to a single column on a phone.

```html
<header class="site-header">
  <a class="brand" href="/">Code Crunch</a>
  <nav>
    <ul class="nav-list">
      <li><a href="/about">About</a></li>
      <li><a href="/writing">Writing</a></li>
      <li><a href="/contact">Contact</a></li>
    </ul>
  </nav>
</header>
```

```css
.site-header {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-4);
  border-bottom: 1px solid var(--rule);
}

.nav-list {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-4);
  list-style: none;
  margin: 0;
  padding: 0;
}
```

At desktop width, the result is a single row: brand on the left, nav on the right.

```text
┌──────────────────────────────────────────────────┐
│ ●●●    https://example.test/                     │
├──────────────────────────────────────────────────┤
│                                                  │
│   Code Crunch              About  Writing  Contact│
│   ──────────────────────────────────────────────  │
│                                                  │
└──────────────────────────────────────────────────┘
```

At phone width (around 380 px), `flex-wrap: wrap` kicks in and the brand drops above the nav. The `gap` keeps the rows from touching.

```text
┌──────────────────┐
│ ●●● ...test/     │
├──────────────────┤
│                  │
│ Code Crunch      │
│                  │
│ About  Writing   │
│ Contact          │
│ ──────────────── │
│                  │
└──────────────────┘
```

Notice what this does **not** require: no `@media` query, no JS hamburger button, no width math. The cascade and the wrap behavior do the work. (A hamburger menu may be the right answer for a site with twelve nav items; for a site with three, the wrap is honest and accessible.)

An accessibility check, before moving on:

- The DOM order is brand-then-nav, which is also the visual order in both the wrapped and unwrapped case. A screen-reader user hears the same thing as a sighted user. Good.
- Tabbing from outside the header lands on the brand link first, then each nav link in turn. Good.
- The nav items have visible focus rings inherited from your global `:focus-visible` rule. (You set one in Week 2.) Good.

If you opened this header in axe DevTools right now, it would pass.

---

## 6. The `gap` revolution

A short historical note worth keeping. Before `gap` shipped for Flexbox, every spaced row of items was written like this:

```css
/* The old way, do not copy */
.nav-list li {
  margin-right: 1.5rem;
}
.nav-list li:last-child {
  margin-right: 0;
}
```

Two rules, one of them a `:last-child` override. Every stylesheet in the world contained variants of this pattern. The `gap` property collapses it to one declaration on the parent:

```css
.nav-list {
  display: flex;
  gap: 1.5rem;
}
```

`gap` does not add space outside the container; only between siblings. It works on row and column flexboxes. It also works on Grid (we will see this Tuesday) with the same syntax. The mental model is: **`padding` is space inside an element; `margin` is space around an element; `gap` is space between siblings of a flex or grid container**.

A reasonable rule of thumb: if you find yourself reaching for `margin` to space siblings inside a flex container, you almost certainly want `gap` instead. The exception is when the children themselves have rhythmic margins (a stack of paragraphs in a typography flow); in that case, `margin` is still right.

---

## 7. Flex direction for vertical layouts — the centered page

Flexbox is not just for rows. A column flex container is the cleanest way to build a page that vertically centers its content or pins a footer to the viewport.

```css
body {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

main {
  flex: 1;              /* take all leftover vertical space */
}
```

That is a "sticky footer" layout. `<body>` is a column-flex container the full viewport height. `<main>` claims any leftover space, pushing `<footer>` to the bottom. No `position: absolute`, no `margin-top: auto` on the footer (though that works too — and is honest CSS).

A second pattern: a hero section whose content is vertically centered.

```css
.hero {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: 70vh;
  text-align: center;
}
```

On the **column** axis, `justify-content` controls vertical placement (because the main axis is vertical) and `align-items` controls horizontal placement (the cross axis). Read the property names relative to the axes, not relative to the screen, and the behavior follows.

---

## 8. When Flexbox is the wrong answer

Flexbox is one-dimensional. It is the right answer when your layout is a row or a column. It is the wrong answer — or, more honestly, the harder answer — when your layout has rows **and** columns that need to relate to each other.

A clear example: a page with a header across the top, a sidebar on the left, a main column on the right, and a footer across the bottom. The header and footer want to span both the sidebar's column and the main column's column. The sidebar and main are in a row together. This is two-dimensional. You **can** build it with nested Flexbox (a column flex on `<body>`, a row flex on a middle `<div>`) — but you will fight `flex-basis` math to keep the sidebar from collapsing, and the moment you want to rearrange on mobile you will rewrite the whole thing.

Grid handles this layout in eight lines of CSS. We will build it Tuesday.

The decision rule, in one sentence: **if I can describe my layout as "a row" or "a column," Flexbox; if I have to describe it as "rows and columns that align," Grid**.

There is a more nuanced rule for "card grids" that wrap — those are genuinely one-dimensional (a row that wraps), so Flexbox can do them; but Grid's `repeat(auto-fit, minmax(...))` does them with less code and no `flex-basis` arithmetic. We will see that Tuesday too.

---

## 9. The accessibility check, integrated

Three things to verify on every Flexbox layout you build, every time:

### 1. DOM order matches visual order

Your screen reader, your keyboard tab order, and your "view source" all walk the DOM in source order. If you used `order`, `row-reverse`, or `column-reverse` to flip the visual order, you have made the visual order disagree with the DOM order — and keyboard users will tab in an order that does not match what they see. Per WCAG 2.2 SC 1.3.2 (Meaningful Sequence), this is a failure.

The fix: change the source order in HTML, not the visual order in CSS. CSS reordering exists; it is a last resort, not a first.

### 2. Focus rings survive the layout

When the flex container has a `gap`, the children may sit closer together than a focus ring's `outline-offset` expects. Tab through your layout; if any focus ring is clipped by a sibling's border or background, increase the `outline-offset` or the `gap`. Better: write the focus rule once on `:focus-visible` with an `outline-offset` of 2 or 3 px, and treat any clipping as a bug.

### 3. The 200% zoom test

Per WCAG 2.2 SC 1.4.4 (Resize text) and SC 1.4.10 (Reflow), the page must remain usable when zoomed to 200% and at a viewport of 320 CSS pixels. Open Chrome, set zoom to 200% (`Cmd +` four times), and tab through. Every interactive element should still be reachable. No horizontal scroll. No text clipped. Your flex layouts will mostly pass this test by default — but the headers and nav bars where you set fixed widths will not. Check.

---

## 10. Self-check

Without re-reading:

1. Name the two axes of a flex container, and which property changes which axis is the main one.
2. What does `gap` do that `margin-right` does not?
3. Why does `align-items: center` solve "vertical centering" with one declaration on the parent?
4. Write the shorthand for "grow if there is space, shrink if there is not, base size 200 px."
5. When is the `order` property the wrong tool, and what is the right alternative?
6. The decision rule between Flexbox and Grid, in one sentence.

---

## Further reading

- **CSS-Tricks — A Complete Guide to Flexbox**: <https://css-tricks.com/snippets/css/a-guide-to-flexbox/>
- **MDN — Basic concepts of flexbox**: <https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_flexible_box_layout/Basic_concepts_of_flexbox>
- **CSS Flexible Box Layout Module Level 1**: <https://www.w3.org/TR/css-flexbox-1/>
- **WCAG 2.2 SC 1.3.2 — Meaningful Sequence**: <https://www.w3.org/WAI/WCAG22/Understanding/meaningful-sequence.html>
- **Flexbox Froggy** (the game): <https://flexboxfroggy.com/>

Next: [Lecture 2 — Grid and When to Use Which](./02-grid-and-when-to-use-which.md).
