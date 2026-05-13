# Week 3 — Quiz

Ten questions. Lecture notes closed. Aim for 9/10.

---

**Q1.** Which property on a flex container changes which axis is the **main** axis?

- A) `justify-content`
- B) `align-items`
- C) `flex-direction`
- D) `flex-wrap`

---

**Q2.** A flex container has `display: flex; justify-content: space-between; align-items: center;` and contains a logo and a nav. What is the visual result?

- A) Logo and nav are stacked vertically, centered.
- B) Logo and nav are in a row; the logo is on the left, the nav on the right; both are vertically centered.
- C) Logo and nav are in a row, both pushed to the left.
- D) Logo and nav are centered on the line, with equal space around each.

---

**Q3.** Which `grid-template-columns` declaration builds a grid that fits as many 260 px (minimum) columns as the container allows, with each column growing to fill leftover space — and no horizontal scroll on a 320 px viewport?

- A) `repeat(4, 260px)`
- B) `repeat(auto-fit, 260px)`
- C) `repeat(auto-fit, minmax(260px, 1fr))`
- D) `repeat(auto-fit, minmax(min(100%, 260px), 1fr))`

---

**Q4.** In a `grid-template-areas` block, what does the period (`.`) character do?

- A) It separates row strings.
- B) It declares an empty cell that no item occupies.
- C) It is a shorthand for `auto`.
- D) It is required at the end of each row.

---

**Q5.** Which rule best describes when to reach for Grid instead of Flexbox?

- A) Use Grid when the layout has nested components.
- B) Use Grid when the layout has rows **and** columns that need to align to each other.
- C) Use Grid for any layout with three or more items.
- D) Grid and Flexbox are interchangeable; pick whichever you prefer.

---

**Q6.** Which media query is the **mobile-first** way to declare "at viewports of 720 CSS pixels and wider, the grid becomes three columns"?

- A) `@media (max-width: 720px) { ... }`
- B) `@media (min-width: 720px) { ... }`
- C) `@media screen and (width = 720px) { ... }`
- D) `@media (orientation: landscape) { ... }`

---

**Q7.** A `<nav>` is laid out with `display: flex; flex-direction: row-reverse;`. Three nav items are in source order: Home, About, Contact. What is the result, and what is the accessibility concern?

- A) Visual: Home, About, Contact. No concern.
- B) Visual: Contact, About, Home. Tab order is also reversed — no concern.
- C) Visual: Contact, About, Home. Tab order is **still** Home, About, Contact — the visual and DOM order disagree, which can confuse keyboard users.
- D) The nav fails to render; `row-reverse` is invalid on a `<nav>`.

---

**Q8.** A container query is the right tool when:

- A) You want the same component to lay out differently based on its **container's** width, not the viewport.
- B) You want a layout that responds to the viewport but ignores the user's font size.
- C) You want to nest media queries inside other media queries.
- D) Container queries are an experimental feature and should be avoided in production.

---

**Q9.** Which WCAG 2.2 success criterion requires that content reflow at 320 CSS pixels wide without horizontal scrolling?

- A) SC 1.3.2 — Meaningful Sequence
- B) SC 1.4.3 — Contrast (Minimum)
- C) SC 1.4.10 — Reflow
- D) SC 2.4.3 — Focus Order

---

**Q10.** On an `<img>` element, the `sizes` attribute tells the browser:

- A) The maximum file size the image is allowed to be.
- B) How wide the image will render at each viewport breakpoint, so the browser can pick the right file from `srcset`.
- C) The image's natural pixel dimensions.
- D) Which CSS media queries to apply to the image.

---

## Answer key

<details>
<summary>Click to reveal</summary>

1. **C** — `flex-direction` decides whether the main axis is horizontal (`row`, the default) or vertical (`column`). `justify-content` and `align-items` operate **on** those axes — they do not choose which axis is which.
2. **B** — `justify-content: space-between` pushes the first item to the start of the main axis (left) and the last to the end (right); `align-items: center` centers both on the cross axis (vertically). This is the canonical site-header layout.
3. **D** — `repeat(auto-fit, minmax(min(100%, 260px), 1fr))`. The inner `min(100%, 260px)` ensures the minimum column width can drop below 260 px when the container itself is narrower — preventing horizontal scroll on a 320 px phone.
4. **B** — A period in `grid-template-areas` declares an empty cell, useful when you want a gap in the grid that no item occupies.
5. **B** — Grid for two-dimensional layouts (rows and columns that relate); Flexbox for one-dimensional layouts (a row or a column). Item count is not the relevant criterion.
6. **B** — Mobile-first declares the small case as default and layers on the desktop case with `@media (min-width: ...)`. `max-width` is the desktop-first style.
7. **C** — `row-reverse` reorders the **visual** layout but not the DOM. Tab order, screen-reader order, and find-in-page all walk the DOM. Per WCAG 2.2 SC 1.3.2, the visual order and DOM order should match.
8. **A** — Container queries (`@container`) key on the size of an ancestor element with `container-type: inline-size`, not the viewport. They are stable in every browser since 2023.
9. **C** — SC 1.4.10 (Reflow) is the criterion. It requires content to reflow at 320 CSS pixels without horizontal scroll for two-dimensional content (with exceptions for inherently two-dimensional content like maps and complex data tables).
10. **B** — `sizes` is a list of media-query → width pairs that tells the browser the **rendered** size of the image at each breakpoint. Combined with `srcset`, the browser picks the smallest file that meets the need.

</details>

If under 7, re-read [Lecture 1](./lecture-notes/01-flexbox-mental-model.md) and [Lecture 2](./lecture-notes/02-grid-and-when-to-use-which.md). If 9 or above, you are ready for the [homework](./homework.md).
