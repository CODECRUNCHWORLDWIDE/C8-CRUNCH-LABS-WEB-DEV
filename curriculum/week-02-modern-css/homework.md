# Week 2 Homework

Six problems, ~6 hours total. Commit each in your Week 2 repo under a `homework/` folder.

---

## Problem 1 — Specificity by hand (45 min)

Open `homework/01-specificity.md`. For each selector below, write its four-tuple specificity, then sort the list from lowest to highest specificity. Where two selectors tie, note that they tie.

```
1.  *
2.  p
3.  .lede
4.  p.lede
5.  #main
6.  #main p
7.  #main .lede
8.  a:hover
9.  nav ul li a
10. input[type="email"]:focus
11. article > header h1
12. body
13. ::first-line
14. p::first-line
15. style="color: red;"   (inline, on a paragraph)
```

**Acceptance.** Each entry has its tuple. The list is ordered. Ties are explicit. You did not look at the lecture notes while computing.

---

## Problem 2 — Inheritance prediction (30 min)

Open `homework/02-inheritance.md`. For each of the following CSS properties, predict whether it inherits from a parent to its children. Then check each prediction against MDN (the "Inherited?" row at the top of each property page).

```
color
background-color
font-family
font-size
font-weight
line-height
margin
padding
border
text-align
visibility
opacity
cursor
display
width
```

**Acceptance.** A two-column table: property, your prediction (yes/no). A third column with MDN's answer. A short note (2–3 sentences) on which predictions you got wrong and why.

---

## Problem 3 — The box model in DevTools (45 min)

Build `homework/03-box-model/index.html` and a stylesheet. The page contains:

- An `<article class="card">` with a heading and three paragraphs.
- A `<button>` after the article.

Style the card with `width: 320px`, `padding: 1.5rem`, `border: 2px solid var(--rule)`, and `margin: 2rem auto`. Style the button with `padding: 0.5rem 1rem`, `border: 1px solid var(--accent)`, and `margin-top: 1rem`.

Now: open DevTools, click the card, and look at the **box-model diagram** at the bottom of the Computed pane. Screenshot it. Do the same for the button. Save both screenshots in `homework/03-box-model/`.

**Acceptance.**

- `homework/03-box-model/index.html` and `styles.css` exist.
- Two screenshots: `card-box-model.png` and `button-box-model.png`.
- A short `notes.md` (4–6 sentences) explaining what the four concentric rectangles in the diagram represent, and noting whether you used `box-sizing: border-box` (you should have).

---

## Problem 4 — Build a token-driven utility set (1 h)

Build `homework/04-tokens/styles.css` containing **only** a `:root` block with at least these tokens, plus a `@media (prefers-color-scheme: dark)` block overriding the role tokens:

- **Palette:** `--ink`, `--parchment`, `--surface`, `--rule`, `--page-sky`, `--page-sky-deep`, `--page-sky-soft`.
- **Role tokens:** `--bg`, `--fg`, `--surface-bg`, `--surface-fg`, `--accent`, `--accent-hover`, `--accent-ring`.
- **Typography:** `--font-display`, `--font-body`, `--font-system`, `--type-base`, `--type-small`, `--type-lede`, `--type-h1`, `--type-h2`, `--type-h3`. Headings use `clamp()`.
- **Space:** `--space-1` through `--space-6`.
- **Radius:** `--radius-1`, `--radius-2`.
- **Shadow:** `--shadow-1` (a single soft shadow).

`--accent-hover` and `--accent-ring` must be derived from `--accent` using `color-mix()` — not hard-coded.

Also build `homework/04-tokens/index.html` that imports the stylesheet and renders a small "design tokens" page: one swatch per palette color, one row per type token (showing the actual size), one column per space token (a colored rectangle of that width). Use only HTML and the tokens.

**Acceptance.**

- Every value below the palette is derived (via `var()` or `color-mix()`); no hard-coded hex in the role-tokens block.
- The page is readable in both light and dark mode; toggle your OS theme to confirm.
- axe DevTools reports zero serious or critical issues.

---

## Problem 5 — Refactor a stylesheet for specificity (45 min)

In `homework/05-refactor/`, take this gnarly CSS and refactor it. Save the original as `before.css` and your refactored version as `after.css`. The HTML stays the same — invent a small page that exercises the selectors.

```css
#app .header .nav ul li a.active { color: #0369a1; }
#app .header .nav ul li a:hover  { color: #024377; }
body div.content #post .post-body p.lede { font-size: 1.2rem; }
body div.content #post .post-body p      { color: #1a1a1a; }
body div.content #post .post-body p a    { color: #0369a1; }
.btn.primary.large-button.shadow-md.rounded { background: #0ea5e9; padding: 1rem 1.5rem; }
.btn.primary.large-button.shadow-md.rounded:hover { background: #0369a1; }
```

**Acceptance.**

- `after.css` produces the same rendered result as `before.css`.
- No selector in `after.css` exceeds specificity `(0, 0, 1, 1)`.
- All hard-coded colors and sizes have moved into a `:root` token block.
- A `notes.md` lists the three highest-specificity selectors you removed and what you replaced each with.

---

## Problem 6 — Reflection (30 min)

Write `homework/06-reflection.md` (300–400 words) answering:

1. Which lecture point changed your mental model the most this week — and why?
2. Pick one CSS property whose default behavior surprised you this week. Where will you reach for it next?
3. Name one token from your Problem 4 set that you expect to reuse on every project from now on, and one you suspect will be project-specific.
4. What is one accessibility or contrast habit you will keep from Week 2, for the rest of your career?

---

## How to submit

- Create a folder `homework/` in your Week 2 repo.
- Save each problem's output with the filename suggested above.
- One commit per problem is ideal; one big commit at the end is acceptable.
- In your final commit message, link to the file(s) you spent the most time on.

## Grading guide

This homework is graded on completion, not perfection. You are practicing. The rubric:

| Problem | What "complete" means |
| ------- | --------------------- |
| 1 | Tuples computed by hand; list sorted; ties marked. |
| 2 | Table with prediction, MDN's answer, and a 2–3 sentence reflection. |
| 3 | HTML + CSS + two box-model screenshots + a notes file. |
| 4 | Token file passes WCAG AA in both themes; no hard-coded values below the palette. |
| 5 | Refactored CSS produces the same result with flat specificity. |
| 6 | 300–400 word reflection answering all four questions. |

If you finish a problem and are uncertain whether it counts as "complete," ask in the cohort channel. Future-you reads better notes than nobody-you.

## Time budget

| Problem | Time |
| ------: | ---: |
| 1 | 45 min |
| 2 | 30 min |
| 3 | 45 min |
| 4 | 1 h |
| 5 | 45 min |
| 6 | 30 min |
| **Total** | **~4 h 15 min** |

When done, push your Week 2 repo and start the [mini-project](./mini-project/README.md).
