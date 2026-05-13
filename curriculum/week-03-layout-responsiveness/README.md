# Week 3 — Layout & Responsiveness

> *Last week the bones got dressed. This week they learn to move. Layout is the third pass the browser makes over your page — after the DOM is built and the cascade is resolved, the engine decides where each box goes on screen. By Sunday of Week 3 you will be able to reflow a five-page site cleanly from a 320 px phone to a 1440 px laptop using Flexbox, Grid, container queries, and `clamp()`-based spacing — with one stylesheet, no breakpoints written by reflex, and an accessibility check on every component.*

Welcome back. Week 1 built the bones, Week 2 dressed them in honest CSS. The Week-2 site reads beautifully — on a desktop. Open it on a phone and the paragraphs still flow, but the header collapses, the writing grid is a single column, the card grid is a single column too, and the layout has nothing to do with the layout you would design if you started from a phone. That is Week 3's problem.

Layout used to be hard. It was hard for a long time. The CSS that shipped in 1996 was not really a layout language — people used `<table>`s, then `float`, then JavaScript libraries. None of it was good. The browser ships two real layout engines now, and they are good. **Flexbox** handles one dimension at a time — a row of nav items, a column of cards, a button bar — and is the right answer when the layout is essentially linear. **Grid** handles two dimensions at once — a page with a header, a sidebar, a main column, and a footer — and is the right answer when rows and columns relate. Both are first-class browser features, both ship today, both are stable in every browser you will deploy to.

Then we layer on the responsiveness toolkit: **breakpoints** with `@media` for the rare cases that warrant them, **container queries** for components that should respond to their container rather than the viewport, **`min()` / `max()` / `clamp()`** for fluid sizing that often replaces breakpoints entirely, and the **mobile-first mindset** that keeps the small-screen case readable by default rather than as an afterthought.

By Sunday, your Week-2 site reflows on every viewport you can throw at it, and you have a stylesheet you understand line by line.

---

## Learning objectives

By the end of this week, you will be able to:

- **Choose** between Flexbox and Grid for a given layout in a single sentence — "this is one-dimensional" or "this is two-dimensional."
- **Build** a Flexbox row that wraps gracefully, with `gap` for spacing and `flex-wrap` for the small-screen case.
- **Build** a Grid that places named areas via `grid-template-areas`, and rearranges those areas at a breakpoint without duplicating component rules.
- **Use** `repeat(auto-fit, minmax(...))` to build a card grid that has no media query and yet wraps from one to four columns as the viewport grows.
- **Write** a `@media` breakpoint that flips a layout, and defend the pixel value you chose by what content does at that width — not by device class.
- **Decide** when a container query (`@container`) is the right tool, and write one that toggles a card from a vertical to a horizontal layout based on its own width.
- **Sketch** the mobile-first mindset in one paragraph — what you declare first, what you wrap in `@media (min-width: ...)`, and why.
- **Build** a fluid image gallery that fills the row, respects aspect ratio, and serves an `srcset` of correctly-sized files.
- **Audit** every layout for keyboard order, focus visibility, and the "zoom to 200%" test from WCAG 2.2.
- **Defend** your choice of layout engine in a code review, citing the CSS Grid Layout Module and the CSS Flexible Box Layout Module.

---

## Prerequisites

You finished **Week 2 — Modern CSS**. Concretely:

- The `crunch-web-portfolio-<yourhandle>` repo on GitHub has a hand-authored `styles.css` linked from every page.
- Every page passes <https://validator.w3.org/nu/> and axe DevTools cleanly, in both light and dark modes.
- You can open a page in DevTools and trace any property to the rule that set it.

If the Week-2 site is not done, go back. Week 3 lays out the Week-2 site — there is nothing to lay out yet if you skipped Week 2.

## Topics covered

- The display property — a quick re-grounding: `block`, `inline`, `inline-block`, then `flex` and `grid`
- The Flexbox mental model — the main axis, the cross axis, the four properties you set on the container, the four you set on the children
- `gap` as the spacing primitive that retired `margin` for layout in 2021
- Flex sizing — `flex-grow`, `flex-shrink`, `flex-basis` and the `flex` shorthand
- The Grid mental model — explicit tracks, implicit tracks, the line-number grammar, named areas
- `grid-template-columns` and the `fr` unit; `repeat()`; `minmax()`; `auto-fit` vs `auto-fill`
- `grid-template-areas` — declaring layout in ASCII art
- Choosing Flexbox vs Grid — one rule, with edge cases
- The mobile-first mindset and why it produces healthier stylesheets
- `@media` queries — `min-width` over `max-width`, breakpoints chosen by content not device
- Container queries — `@container`, container types, when they beat `@media`
- `min()`, `max()`, `clamp()` for fluid sizing — and the case where one of them replaces a breakpoint entirely
- Responsive images — `srcset`, `sizes`, `<picture>` for art direction, `loading="lazy"`
- Layout accessibility — keyboard order, the reading order spec, zoom to 200%, reflow at 320 px

## Tools you will need

| Tool                                | Role                                                | Cost |
| ----------------------------------- | --------------------------------------------------- | ---- |
| **VS Code**                         | Editor                                              | Free |
| **Live Server** (VS Code extension) | Auto-reload on save                                 | Free |
| **A current Chrome or Firefox**     | Render, DevTools, the device toolbar                | Free |
| **DevTools — Device toolbar**       | Resize to any viewport, simulate a phone or tablet  | Free |
| **DevTools — Grid & Flexbox inspectors** | Overlay the tracks and the axes on a real layout | Free |
| **axe DevTools** (browser extension)| Accessibility audits every week                     | Free |
| **validator.w3.org**                | Still required for the HTML you touched             | Free |

No Node, no build, no package manager. Just a text editor, a browser, and one CSS file per page.

---

## Weekly schedule

The schedule below adds up to approximately **36 hours**. Treat it as a target. Flexbox usually clicks faster than Grid; budget the extra hours toward Grid and container queries.

| Day       | Focus                                          | Lectures | Exercises | Challenges | Quiz/Read | Homework | Mini-Project | Self-Study | Daily Total |
|-----------|------------------------------------------------|---------:|----------:|-----------:|----------:|---------:|-------------:|-----------:|------------:|
| Monday    | Flexbox — the mental model and the daily uses  |    3h    |    2h     |     0h     |    0.5h   |   1h     |     0h       |    0.5h    |     7h      |
| Tuesday   | Grid — tracks, areas, and when to choose it    |    3h    |    2h     |     1h     |    0.5h   |   1h     |     0h       |    0h      |     7.5h    |
| Wednesday | Responsive — breakpoints, container queries    |    0h    |    2h     |     1h     |    0.5h   |   1h     |     1h       |    0.5h    |     6h      |
| Thursday  | Apply to the Week-2 site                       |    0h    |    1h     |     1h     |    0.5h   |   1h     |     2h       |    0.5h    |     6h      |
| Friday    | Mini-project — reflow to 320 px                |    0h    |    1h     |     1h     |    0.5h   |   1h     |     2h       |    0.5h    |     6h      |
| Saturday  | Mini-project deep work                         |    0h    |    0h     |     0h     |    0h     |   1h     |     2h       |    0h      |     3h      |
| Sunday    | Quiz, polish, viewport audit                   |    0h    |    0h     |     0h     |    0.5h   |   0h     |     0h       |    0h      |     0.5h    |
| **Total** |                                                | **6h**   | **8h**    | **4h**     | **3h**    | **6h**   | **7h**       | **2h**     | **36h**     |

---

## How to navigate this week

| File | What is inside |
|------|----------------|
| [README.md](./README.md) | This overview |
| [resources.md](./resources.md) | The CSS-Tricks complete guides, the specs, MDN, the layout inspectors |
| [lecture-notes/01-flexbox-mental-model.md](./lecture-notes/01-flexbox-mental-model.md) | Flexbox from the main axis outward; the eight properties you actually use |
| [lecture-notes/02-grid-and-when-to-use-which.md](./lecture-notes/02-grid-and-when-to-use-which.md) | Grid tracks, areas, and the Flexbox-vs-Grid decision |
| [exercises/README.md](./exercises/README.md) | Index of exercises |
| [exercises/exercise-01-card-grid.md](./exercises/exercise-01-card-grid.md) | A responsive card grid with `auto-fit, minmax(...)` and no media query |
| [exercises/exercise-02-holy-grail-layout.md](./exercises/exercise-02-holy-grail-layout.md) | The classic header / nav / main / aside / footer layout with `grid-template-areas` |
| [exercises/exercise-03-fluid-image-gallery.md](./exercises/exercise-03-fluid-image-gallery.md) | An accessible image gallery with `srcset`, `sizes`, and aspect ratio |
| [challenges/README.md](./challenges/README.md) | Index of weekly challenges |
| [challenges/challenge-01-recreate-a-news-homepage.md](./challenges/challenge-01-recreate-a-news-homepage.md) | Rebuild a news site's homepage at three viewport widths |
| [quiz.md](./quiz.md) | 10 multiple-choice questions |
| [homework.md](./homework.md) | Six practice problems for the week |
| [mini-project/README.md](./mini-project/README.md) | Make your Week-1 site fully responsive from 320 px to 1440 px |

The recommended order:

1. Read both lectures (Monday–Tuesday).
2. Do the three exercises (Tuesday–Wednesday).
3. Take the quiz (Wednesday evening). If you score under 7, re-read.
4. Pick a challenge (Thursday).
5. Work through the homework problems alongside the mini-project (Thursday–Saturday).
6. Ship the mini-project (Saturday–Sunday).

---

## Stretch goals

If you finish early and want to push further, try any of these:

- Read the [CSS Grid Layout Module Level 2 spec](https://www.w3.org/TR/css-grid-2/) end-to-end. It is dense but worth one careful pass; you will remember it the rest of your career.
- Read [Every Layout — The Stack, The Cluster, The Switcher](https://every-layout.dev/) and notice how each layout primitive is a few lines of CSS. Try to derive each one yourself before reading the explanation.
- Open the DevTools device toolbar (`Cmd+Shift+M` / `Ctrl+Shift+M`) on a site you visit daily. Drag the viewport from 320 px to 1440 px slowly. Watch where the layout snaps. Find a `@media` breakpoint that was clearly chosen by device, not by content; note what would have been better.
- Read [the CSS Containment spec section on container queries](https://www.w3.org/TR/css-contain-3/#container-queries). Container queries shipped in every browser in 2023; they are still under-used.
- Run [WebPageTest](https://www.webpagetest.org/) against your Week-2 site at a "Slow 4G" preset. Watch the layout stabilize. Note the Cumulative Layout Shift — Week 10 will care about this number.

---

## What this week is NOT

A few things to set expectations:

- **Not a JavaScript week.** Every layout this week is achievable with HTML and CSS only. If you find yourself reaching for JS to size a column or toggle a menu, stop — the platform almost always has an answer.
- **Not a framework week.** No Tailwind, no Bootstrap grid, no CSS-in-JS. Flexbox and Grid are first-class browser features. You will work in raw CSS so that when you do use a framework later, you can read its source.
- **Not a "tour of every layout pattern" week.** There are dozens of named layouts (the holy grail, the stack, the cluster, the switcher, the cover). We cover the half-dozen you will use weekly; the rest are recognizable extensions.
- **Not a media-query festival.** Most of what students reach for `@media` to fix is fixable with `clamp()`, `auto-fit`, or container queries. We do use `@media` — but only where it earns its keep.

---

## Up next

Continue to [Week 4 — JavaScript Fundamentals](../week-04/) once you have pushed your responsive site to GitHub and every page passes the W3C validator, axe DevTools, and the manual viewport audit from 320 px to 1440 px.

---

*If you find errors in this material, please open an issue or send a PR. Future learners will thank you.*
