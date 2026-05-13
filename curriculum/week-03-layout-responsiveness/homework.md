# Week 3 Homework

Six problems, ~6 hours total. Commit each in your Week 3 repo under a `homework/` folder.

---

## Problem 1 — Flexbox Froggy & Grid Garden (45 min)

Open <https://flexboxfroggy.com/> and play all 24 levels. Then open <https://cssgridgarden.com/> and play all 28 levels. Both are free, browser-based, and take 20–30 minutes each once you have the lectures fresh.

In `homework/01-games.md`, note:

- Which Flexbox level was hardest, and what the unlock was.
- Which Grid level was hardest, and what the unlock was.
- One property in each game whose default value surprised you.

**Acceptance.** A short file with three short answers. (Screenshots of the completion screens are nice but not required.)

---

## Problem 2 — Build five layout primitives (1.5 h)

Build a single page, `homework/02-primitives/index.html` and `homework/02-primitives/styles.css`, that demonstrates each of the five "Every Layout" primitives. Each primitive sits in its own labeled `<section>` and uses only HTML and the CSS layout module that fits.

The five primitives:

1. **The Stack** — a column of items with consistent vertical spacing. Use `display: flex; flex-direction: column; gap: var(--space-3);`.
2. **The Cluster** — a row of items that wrap to multiple rows when there is not enough room, each row left-aligned, each item separated by `gap`.
3. **The Sidebar** — a two-column layout where one column has a fixed width and the other claims the rest. Use Grid with `grid-template-columns: 240px 1fr;`.
4. **The Switcher** — a horizontal row of items that switches to a vertical column when the container narrows below a threshold. Use `flex-wrap` with a `flex-basis: calc(40rem - 100%)` trick (see Every Layout for the technique).
5. **The Cover** — a section that fills the viewport, with a centered headline and an optional bottom-aligned footer. Use `display: flex; flex-direction: column; min-height: 100vh; justify-content: center;`.

**Acceptance.**

- All five primitives are visible on one page, each labeled with a `<h2>`.
- Each primitive uses **only** the layout properties the technique calls for; no unrelated CSS.
- The page passes the validator and axe DevTools cleanly.
- A short `notes.md` (5–10 sentences) on which primitive surprised you and which you expect to reuse most often.

---

## Problem 3 — A holy-grail layout with one breakpoint (1 h)

This problem mirrors the holy-grail exercise but with stricter constraints. Build `homework/03-holy-grail/`:

- `<header>`, `<nav>`, `<main>`, `<aside>`, `<footer>` as direct children of `<body>`.
- One `grid-template-areas` declaration for the desktop layout (header full, nav-main-aside row, footer full).
- One `@media (max-width: ...)` (or one `@media (min-width: ...)` if you write mobile-first — your choice) flips the layout to a single column on phones.
- The mobile column order: header, main, nav, aside, footer.
- The aside is sticky on desktop (`position: sticky; top: var(--space-4); align-self: start;`), and **not** sticky on mobile.

**Acceptance.**

- The two viewports render as described.
- No CSS rule other than the container's `grid-template-areas` and `grid-template-columns` changes between the viewports.
- A `notes.md` lists the breakpoint value you chose (in `em`), and the content reason you chose it (not "tablet"; what does the layout do at that width that justifies the change).

---

## Problem 4 — Container-query card (1 h)

Build `homework/04-container-card/`. The page has a Grid of three cards in different widths:

- The first card sits in a column 240 px wide.
- The second sits in a column 360 px wide.
- The third sits in a column 600 px wide.

Each card is the **same component** — same HTML, same class. A container query rearranges the card based on its container's width:

- **Below 320 px**: stacked. Image on top, body below.
- **320–479 px**: stacked, slightly larger headline.
- **480 px and up**: horizontal. Image on the left, body on the right.

Use `container-type: inline-size; container-name: card;` on the card, and an `@container card (min-width: ...)` block for each variant.

**Acceptance.**

- The three cards on the page show **three different layouts** despite having identical HTML and identical class names.
- No JavaScript, no per-card class overrides.
- `notes.md` notes one real-world component you would build this way, and a sentence on why container queries are better than viewport queries for that case.

---

## Problem 5 — Responsive images audit (1 h)

In `homework/05-images/`, build a page with three images at three contexts:

1. A **hero** image, full-width, with art-directed `<picture>` sources — a 16:9 crop for desktop, a 4:5 crop for mobile.
2. A **content** image inside a `<figure>` with caption, sized to the article column (`max-width: 65ch`), with `srcset` at three resolutions.
3. A **thumbnail** image in a grid (`repeat(auto-fit, minmax(180px, 1fr))`), with `loading="lazy"`, `srcset`, and `sizes`.

Use Lorem Picsum or any free placeholder service. Every image has meaningful (or empty, for decorative) `alt` text.

**Acceptance.**

- The page renders cleanly at 320, 768, and 1280 px.
- DevTools Network panel shows the correct image file fetched for each viewport.
- Every image has `width` and `height` attributes (the natural size of the `src`).
- The page's Cumulative Layout Shift, as measured by the Lighthouse DevTools panel, is **under 0.1**.
- A `notes.md` notes the file size fetched for each image at 320 vs 1280, and the percentage savings of `srcset` over serving the largest file.

---

## Problem 6 — Reflection (30 min)

Write `homework/06-reflection.md` (300–400 words) answering:

1. Which layout primitive (Stack, Cluster, Sidebar, Switcher, Cover, or one from the lectures) changed your mental model the most this week — and why?
2. Pick one CSS property whose default behavior surprised you. Where will you reach for it next?
3. Name one layout decision you made this week that you would defend in a code review. Cite a spec or a WCAG criterion.
4. What is one accessibility habit you will keep from Week 3, for the rest of your career?

---

## How to submit

- Create a folder `homework/` in your Week 3 repo.
- Save each problem's output with the filename suggested above.
- One commit per problem is ideal; one big commit at the end is acceptable.
- In your final commit message, link to the file(s) you spent the most time on.

## Grading guide

This homework is graded on completion, not perfection. You are practicing. The rubric:

| Problem | What "complete" means |
| ------- | --------------------- |
| 1 | Three short answers in `01-games.md`; the games are actually completed. |
| 2 | All five primitives on one page; each uses the right CSS module. |
| 3 | Holy-grail layout works at both viewports; one breakpoint; sticky aside on desktop. |
| 4 | Three card variants, same HTML; container query handles all three. |
| 5 | Images sized, `srcset` working, CLS < 0.1; notes capture savings. |
| 6 | 300–400 word reflection answering all four questions. |

If you finish a problem and are uncertain whether it counts as "complete," ask in the cohort channel. Future-you reads better notes than nobody-you.

## Time budget

| Problem | Time |
| ------: | ---: |
| 1 | 45 min |
| 2 | 1.5 h |
| 3 | 1 h |
| 4 | 1 h |
| 5 | 1 h |
| 6 | 30 min |
| **Total** | **~5 h 45 min** |

When done, push your Week 3 repo and start the [mini-project](./mini-project/README.md).
