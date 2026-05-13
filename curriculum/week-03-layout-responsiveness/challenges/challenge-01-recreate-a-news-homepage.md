# Challenge 1 — Recreate a news homepage

**Time estimate:** ~140 minutes.

## Problem statement

Pick a real news site whose homepage you read regularly — The Guardian, The New York Times, the BBC, NPR, The Verge, Hacker News, The Atlantic, Bloomberg, Reuters, your local paper, Polygon, The Pudding. Recreate the **layout** of its homepage as a styled HTML page that reflows cleanly across three target viewport widths: **mobile (320 px)**, **tablet (768 px)**, and **desktop (1280 px)**. Use only HTML and one CSS file. **No images** (or describe images textually with `alt` plus a caption — the layout is the point). **No JavaScript**.

This challenge is about taking the Flexbox-and-Grid lessons in this week's lectures and exercising them on the kind of layout you read every day. By the end you will have one homepage page that holds together at every viewport, demonstrates a real editorial grid, and reads as well as anything that ships from a CMS.

## Acceptance criteria

- [ ] You picked a real news site and noted its URL in a comment at the top of your stylesheet.
- [ ] You did **not** copy the publication's CSS. You wrote the stylesheet yourself, looking at the rendered homepage.
- [ ] Your folder is `challenges/challenge-01/`, with `index.html`, `styles.css`, and `NOTES.md`.
- [ ] The HTML markup uses last week's semantics correctly — `<header>` for the masthead, `<nav>` with `aria-label` for each navigation region, `<main>` for the article grid, `<article>` for each story, `<aside>` for sidebars, `<footer>` for the page footer.
- [ ] The stylesheet opens with a `*, *::before, *::after { box-sizing: border-box; }` rule and a token-driven `:root` block.
- [ ] At minimum these tokens are declared: `--ink`, `--parchment`, `--rule`, `--accent`, `--font-display`, `--font-body`, `--type-base`, `--type-h1`, `--type-h2`, `--type-eyebrow`, plus a space scale of at least four values.
- [ ] The layout is built mobile-first. The 320 px case is the default declaration; the 768 px and 1280 px cases are layered on with `@media (min-width: ...)`.
- [ ] At least one Grid container declares `grid-template-areas` for the lead-story-and-supporting-stories block. At least one Grid uses `repeat(auto-fit, minmax(...))` for an article list.
- [ ] At least one Flexbox container handles a horizontal element — the masthead, the section nav, or a row of meta information.
- [ ] No selector in the file exceeds specificity `(0, 0, 1, 1)` except your `:root` block.
- [ ] The page renders with no horizontal scroll at 320, 768, and 1280 px (verify in DevTools' device toolbar).
- [ ] Tab order from the URL bar walks the DOM in source order. Every interactive element has a visible focus ring.
- [ ] The page passes <https://validator.w3.org/nu/> and axe DevTools cleanly.

## Recommended source homepages

Pick one whose layout you know well. Examples with rich structure:

- **The Guardian** (theguardian.com) — three-column desktop, masthead, kicker labels, image-heavy.
- **The New York Times** (nytimes.com) — five-zone editorial grid; the masthead and the "Top Stories" block are case studies.
- **NPR** (npr.org) — text-heavy, less imagery; good for the typography-first take.
- **The Verge** (theverge.com) — large headlines, modular cards, distinctive color blocks.
- **Hacker News** (news.ycombinator.com) — minimal layout, single column; the challenge is restraint.
- **The Atlantic** (theatlantic.com) — classic magazine grid; a lead story, then a wrap.

If the homepage you want is paywalled, view it in private/incognito mode (most paywalls allow a few articles). The homepage itself is rarely paywalled.

## Suggested order of operations

### Phase 1 — Capture the layout (20 min)

Open the homepage on a desktop. Take a screenshot. Resize the window to ~768 px and another screenshot. Resize to ~320 px and a third screenshot. Pin all three to your editor's split view.

Now, with paper and pencil, sketch the **layout** — not the typography, the layout. At desktop: how many columns? Where does the lead story sit? Where do supporting stories wrap? Where is the masthead, and how does it relate to the nav? At tablet: which columns merged? At mobile: which order do the stories appear in?

You should be able to describe each viewport in two sentences. If you cannot, look again.

### Phase 2 — Mark up the HTML (30 min)

Open `index.html`. Type the document skeleton from memory. Add the semantic markup — `<header>` for the masthead, `<nav aria-label="Primary">` for the main nav, `<main>` for the editorial content, and `<article>` for each story. Put the lead story first in DOM order; supporting stories follow in priority order.

```text
┌──────────────────────────────────────────────────┐
│ ●●●    https://example.test/news                 │
├──────────────────────────────────────────────────┤
│                                                  │
│   <header><h1>The Daily Paper</h1></header>      │
│   <nav aria-label="Primary"> ... </nav>          │
│   <main>                                         │
│     <article class="lead"> ... </article>        │
│     <article class="supporting"> ... </article>  │
│     <article class="supporting"> ... </article>  │
│     ...                                          │
│   </main>                                        │
│   <footer> ... </footer>                         │
│                                                  │
└──────────────────────────────────────────────────┘
```

Run validator.w3.org. Zero errors.

### Phase 3 — Tokens and mobile layout (30 min)

In `styles.css`, declare your tokens first. Pick a small palette that reads news — ink, parchment, one accent (or one for kickers and one for links — defend the choice in `NOTES.md`).

Then, *and only then*, write the **mobile-first** layout. The default declaration is the 320 px case. Every element stacks. The lead story is full width; supporting stories are full width below it. Headings use `clamp()` so they scale with the viewport even before the breakpoint kicks in.

Open `index.html` in Live Server. Drag the viewport to 320 px. The page should be a single readable column.

### Phase 4 — Tablet (768 px) breakpoint (20 min)

Add `@media (min-width: 48em)` (which is 768 px at the default font size). In this block, change the `grid-template-columns` so that supporting stories pair into two columns under the lead. The lead may stay full width or move to a 2/3 column; that is your call. Document the choice in `NOTES.md`.

### Phase 5 — Desktop (1280 px) breakpoint (20 min)

Add `@media (min-width: 78em)` (which is ~1248 px). In this block, the layout claims its desktop form — a multi-column grid with `grid-template-areas` for the lead and supporting stories. The masthead may pin to the top; the nav may sit as a horizontal row; an `<aside>` may appear on the right for "most read" or "sponsored."

### Phase 6 — Audit and `NOTES.md` (20 min)

Open the device toolbar. Drag the viewport from 320 to 1440. The layout should reflow continuously — no awkward gaps between breakpoints, no orphan card, no horizontal scrollbar.

Open axe DevTools. Zero serious or critical violations. In particular: every `<nav>` and `<aside>` has an `aria-label`; every link has a focus ring; every heading hierarchy is consistent.

In `NOTES.md`, write three sections:

- **The three hardest layout decisions I made.** For example: "I let the lead story span both columns on tablet rather than dropping it to one column. Here is why."
- **Where my version diverges from the publication's.** Open DevTools on the real homepage and skim its CSS. What did they do that you did not? Note one thing they did better, and one you did better.
- **One layout decision I would tune if I had another hour.** Name the property, the current value, and the direction you would change it.

## Stretch

- Add a **container query** to one of the supporting-story cards. When the card is at least 360 px wide, lay it horizontally (image-area on the left, body on the right). When it is narrower, stack. The same component now adapts to whichever grid cell it lands in.
- Add a **subgrid** to the story cards so the headline, byline, and meta line all align to a common baseline across columns. (`grid-template-rows: auto auto auto;` on the parent; `display: grid; grid-template-rows: subgrid;` on each card.)
- Add a `<picture>` element to the lead story with **art-directed** sources: a square crop for mobile, a 16:9 crop for desktop. Use `<source media="(min-width: 60em)">` to swap.
- Add a `prefers-color-scheme: dark` block (you wrote this in Week 2). The page flips coherently. Drag the viewport across the breakpoints in dark mode; both the colors and the layout should hold.

## Why this matters

News sites are some of the most-iterated layouts on the web. Their CSS handles a story grid that updates every minute, on every device. Re-implementing one with the tools from this week's lectures will teach you more about what Grid, Flexbox, `clamp()`, and `@media` are actually for than any tutorial. The result is a layout you wrote, that you understand line by line, that you can defend in a code review.

After this challenge, you will start noticing the layout grid behind every news site you read.

## Submission

Commit `challenges/challenge-01/index.html`, `challenges/challenge-01/styles.css`, and `challenges/challenge-01/NOTES.md` to your Week 3 repo.
