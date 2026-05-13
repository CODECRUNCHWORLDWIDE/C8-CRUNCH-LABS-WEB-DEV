# Mini-Project — Make your Week-1 site fully responsive from 320 px to 1440 px

> Take the five-page personal site you shipped in Week 1 and styled in Week 2, and lay it out. One stylesheet, no frameworks, mobile-first, with Flexbox and Grid, container queries where they earn their keep, and a clean reflow from a 320 px phone to a 1440 px desktop on every page — keyboard-accessible, axe-clean, no horizontal scroll anywhere.

This is the synthesis of Week 3. You will lay out the bones you built in Week 1 and dressed in Week 2 — the same site you will animate in Week 9 and ship in Week 10. By the end of Week 3, your site reflows on a phone, a tablet, a laptop, and a wide desktop, with one stylesheet that you wrote by hand.

**Estimated time:** 7 hours, spread across Thursday–Saturday.

---

## What you will build

A laid-out version of the `crunch-web-portfolio-<yourhandle>` repository. Same five pages — `index.html`, `about.html`, `writing/index.html`, `writing/why-i-build-on-the-web.html`, `contact.html` — sharing the same hand-authored `styles.css` you wrote in Week 2, now extended with a layout layer. The site uses only the platform: Flexbox, Grid, `clamp()`, `min()` / `max()`, container queries, `prefers-color-scheme`. No Tailwind, no Bootstrap, no CSS-in-JS, no `@import` from a CDN beyond the same webfont link you had in Week 2.

---

## Acceptance criteria

- [ ] The Week 2 `styles.css` is extended (not replaced) — your Week-2 tokens, typography, and dark-mode block remain. New layout sections are added below them.
- [ ] Every page reflows cleanly at **320 px**, **540 px**, **768 px**, **1024 px**, **1280 px**, and **1440 px** in the Chrome device toolbar. No horizontal scrollbar at any width. (Verify each width; the bug you find at 540 px is the bug that shipped to half your audience.)
- [ ] The site is **mobile-first**: the default declaration is the small-screen case; larger viewports add `@media (min-width: ...)` blocks. There are **no** `@media (max-width: ...)` queries except where they genuinely simplify the rule.
- [ ] The site uses **at most three** viewport breakpoints across the entire stylesheet (a typical good answer is two — a tablet break around 36–40em and a desktop break around 60–72em). Each breakpoint is chosen by content, not device; the choice is documented in a comment.
- [ ] The site's **page-level layout** uses Grid (with `grid-template-areas` for the holy-grail-shaped pages, or `grid-template-columns: minmax(...) 1fr;` for the article pages).
- [ ] **Within each page**, components use Flexbox for one-dimensional arrangements (the masthead row, the nav list, the byline meta) and Grid for two-dimensional arrangements (the writing-index card grid).
- [ ] The writing-index card grid uses `repeat(auto-fit, minmax(min(100%, 280px), 1fr))` — no `@media` query needed.
- [ ] At least one component on the site uses a `@container` query for a layout decision (a card whose layout depends on its container width, for instance).
- [ ] At least one **fluid** value uses `clamp()` for spacing or layout sizing (not just type, which you already did in Week 2).
- [ ] Every image has `width` and `height` attributes; the article hero (if you have one) has a `<picture>` with art-directed sources for mobile and desktop.
- [ ] The "skip to main content" link is visually hidden by default and slides into view on `:focus`, on every page.
- [ ] Tab order at every viewport width matches DOM source order. Every interactive element has a visible `:focus-visible` outline (the rule you wrote in Week 2). The skip link is the first focusable element.
- [ ] At 200% browser zoom, every page is still usable — no clipped text, no overlapping elements, no horizontal scroll. (WCAG 2.2 SC 1.4.4 & 1.4.10.)
- [ ] Every page passes <https://validator.w3.org/nu/> with zero errors and zero warnings.
- [ ] Every page passes axe DevTools with zero critical and zero serious issues.
- [ ] No selector in `styles.css` exceeds specificity `(0, 0, 1, 1)` except the `:root` block and any reset selectors. The cascade discipline from Week 2 holds.
- [ ] The `README.md` is updated with: a "what changed this week" note, screenshots at three viewport widths, and a sentence on the layout decision you are proudest of.

---

## Suggested order of operations

### Phase 1 — Audit the Week-2 site (45 min)

Before writing any new CSS, open your Week-2 site in DevTools' device toolbar. Drag the viewport from 320 to 1440. Take notes — paper is fine — on every place the layout breaks. Common findings:

- The header is full-width nav on desktop but doesn't wrap on mobile; the nav items overflow.
- The writing-index page is a single column at every viewport; on a wide desktop, it looks lonely.
- The about page has a headshot and text that flow next to each other badly on a tablet.
- The contact form's labels and inputs sit awkwardly when stretched to 1200 px.

These are your layout to-do list. Save the file as `mini-project/audit-notes.md` in your repo. You will refer to it in Phase 6.

### Phase 2 — Page-level Grid (1 h)

Open `styles.css`. Add a layout section, below the typography section, beginning with the page-level Grid.

The pattern, mobile-first:

```css
/* Mobile: single column */
body {
  display: grid;
  grid-template-columns: 1fr;
  grid-template-areas:
    "header"
    "main"
    "footer";
  min-height: 100vh;
}

body > header { grid-area: header; }
body > main   { grid-area: main; }
body > footer { grid-area: footer; }

/* Tablet and up: same single column, but with comfortable margins. */
@media (min-width: 36em) {
  body {
    grid-template-columns: minmax(var(--space-4), 1fr) minmax(0, 65rem) minmax(var(--space-4), 1fr);
    grid-template-areas:
      ". header ."
      ". main   ."
      ". footer .";
  }
}
```

The article pages (`writing/why-i-build-on-the-web.html`) have a constrained main column with breathing room either side. The index pages may want a wider main for the card grid. Adjust the `grid-template-columns` per-page if you need; or set a wider page-grid on a body class.

### Phase 3 — Header and nav (1 h)

The masthead is a Flexbox row. The nav list inside is also a Flexbox row. Both wrap on narrow viewports.

```css
header {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-4) 0;
  border-bottom: 1px solid var(--rule);
}

header nav ul {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-4);
  list-style: none;
  margin: 0;
  padding: 0;
}
```

On a phone, the brand sits on its own line; the nav items wrap to a new row below. On a desktop, both fit on one line, with `space-between` pushing the brand left and the nav right.

The footer is the same pattern — Flexbox row, wrapped, with `gap`. Style it once and forget it.

### Phase 4 — The writing-index card grid (1 h)

This is the page that benefits most from Grid. The Week-2 version was a single column; the Week-3 version is `repeat(auto-fit, ...)`.

```css
.writing-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 280px), 1fr));
  gap: var(--space-4);
}

.writing-list > article {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  padding: var(--space-3);
  border: 1px solid var(--rule);
  border-radius: var(--radius-1);
}
```

The cards use Flexbox internally (a column flex of heading, date, summary) and Grid externally (the page-level grid of cards).

For the **container-query** requirement, set `container-type: inline-size` on each `<article>` in the card grid, and use `@container` to flip the card from a stacked layout to a horizontal one when the container exceeds, say, 420 px. On a desktop with three columns, the cards stay stacked (each card is ~320 px wide). When the same component lands in a sidebar on a single-card row, it flips to horizontal. The same HTML, two layouts.

### Phase 5 — The about and contact pages (1 h)

**About** typically has a headshot and biographical text. On mobile, the headshot is full-width above the text. On a tablet and up, they sit side-by-side via Grid:

```css
.bio {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--space-4);
}

@media (min-width: 36em) {
  .bio {
    grid-template-columns: minmax(180px, 240px) 1fr;
    align-items: start;
  }
}
```

**Contact** has a form with labels and inputs. On mobile, labels stack above inputs. On a wider viewport, you have a choice: keep labels above, or shift to a label-input pair using Grid. The mobile-first guidance is: keep labels above on every viewport, but limit the form's `max-width` so it does not stretch to 1400 px on a desktop. A `max-width: 40rem; margin-inline: auto;` on the `<form>` is honest.

### Phase 6 — The viewport audit (1 h)

For every page, in DevTools' device toolbar, run through the six widths: 320, 540, 768, 1024, 1280, 1440 px. At each width:

1. Is there a horizontal scrollbar? (There should not be.)
2. Are any elements clipped? (They should not be.)
3. Is the tab order still correct? (It should be.)
4. Are the focus rings visible against every background? (They should be.)

Cross off each page-and-width pair on a checklist. The 540 px column is where most pages first have to work; the 1024 px column is where most pages first have a comfortable two-column layout; the 320 px column is the WCAG minimum.

Then run axe DevTools on each page. Zero serious or critical issues. Fix what fails.

Then zoom your browser to 200% (Cmd+ four times in Chrome). Every page should still be readable and navigable, no horizontal scroll. Per WCAG 2.2 SC 1.4.4 (Resize text), the page must work at this zoom level without loss of content or function.

### Phase 7 — README and ship (30 min)

Update `README.md`. Add:

- A "what changed in Week 3" subsection — three sentences on the layout work.
- Three screenshots: 320 px, 768 px, 1280 px.
- One sentence on the layout decision you are proudest of.

Commit, push, share the live URL in the cohort channel.

---

## Suggested final tree

```
crunch-web-portfolio-<yourhandle>/
├── README.md
├── styles.css                 ← extended this week
├── index.html
├── about.html
├── contact.html
├── writing/
│   ├── index.html
│   └── why-i-build-on-the-web.html
└── images/
    ├── headshot.jpg
    └── headshot-2x.jpg
```

No `node_modules/`, no `package.json`, no build step. One stylesheet, hand-written.

---

## Stretch goals

- Add a **subgrid** to the writing-list card grid so the headlines, dates, and summaries align across cards. (`display: grid; grid-template-rows: subgrid;` on each card.) The cards become typographically aligned, the way magazine columns are.
- Add a `<picture>` element on the about page that **art-directs** the headshot — a tighter portrait crop for mobile, a wider crop with environmental context for desktop.
- Add a `:focus-within` rule on the form that highlights the entire `<fieldset>` containing the focused input. This is a small, useful affordance that does not require JavaScript.
- Use `aspect-ratio` and `object-fit: cover` to make every image on the site hold a consistent aspect ratio at every viewport. The page's Cumulative Layout Shift drops to zero.
- Add an explicit user toggle for "compact" vs "comfortable" spacing using a `<select>` and CSS custom-property overrides on a `[data-density]` attribute. (The JavaScript that wires the select to the attribute is one line; you can write it in Week 4 if you do not want JS yet.)

---

## Rubric

| Criterion | Weight | "Great" looks like |
|-----------|------:|--------------------|
| Mobile-first discipline | 20% | Default is the 320 px case; `@media (min-width: ...)` adds desktop; no `max-width` queries by reflex |
| Flexbox vs Grid choices | 15% | One-dimensional uses Flex; two-dimensional uses Grid; the reasons are obvious from reading the file |
| Reflow at 320 px | 15% | Every page renders with no horizontal scroll at 320 CSS px; checked by hand at six widths |
| Container queries | 10% | At least one component uses `@container`; the choice is defensible |
| Breakpoint discipline | 10% | At most three viewport breakpoints across the file; each is documented in a comment |
| Accessibility | 15% | Tab order matches DOM; focus rings visible; 200% zoom works; axe clean |
| Cascade discipline | 10% | No selector above `(0, 0, 1, 1)`; no `!important`; the cascade reads cleanly end-to-end |
| README & polish | 5% | A reader understands the layout intent without opening the CSS |

---

## Why this matters

A site whose layout works at every viewport, with one stylesheet, no JavaScript, no framework, and a clean accessibility audit, is a small thing — maybe 100 extra lines of layout CSS on top of Week 2's typography. It is also a remarkably durable thing. Every device that ships in the next five years will run on a viewport between 280 and 3000 CSS pixels wide. Your site already handles that, because the platform's layout engines handle it for you.

The deeper reason: the platform now ships everything a small site honestly needs for layout. Knowing this — and knowing it from having typed it yourself — is what separates a frontend developer from someone who installs CSS frameworks. The frameworks are not bad; they save time on large teams. But for a personal site, for a portfolio, for the kind of small page you will write every week of your career, raw CSS is faster to write and easier to read. C8 wants you to know this directly.

When a future employer asks "show me something you laid out," this site is the answer. The Week 3 version is the first version that looks like a website you would not be embarrassed to open on a phone.

---

## Submission

Commit. Push. Make the repo public if it is not already. Share the URL with the cohort channel. Your peers will open the page at 320 px, 768 px, and 1280 px, tab through it with the keyboard, zoom to 200%, and run it through axe. They will read your `styles.css` top to bottom and check that the Flexbox-vs-Grid choices are defensible and that no `@media` query was written by reflex.

Then read [Week 4 — JavaScript Fundamentals](../../week-04/) — and start adding the first JS to the pages you have now laid out.
