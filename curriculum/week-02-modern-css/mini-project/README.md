# Mini-Project — Style your Week-1 personal site

> Take the five-page personal site you shipped in Week 1 and dress it. One stylesheet, no frameworks, custom-property tokens, fluid typography, dark mode, and a contrast audit clean at WCAG 2.2 AA on every page.

This is the synthesis of Week 2. You will style the bones you built last week — the same site you laid out in Week 3, animated in Week 9, and shipped in Week 10. By the end of Week 2, your site reads as a coherent piece of typography on a phone, on a laptop, in light mode, and in dark mode, on every page.

**Estimated time:** 7 hours, spread across Thursday–Saturday.

---

## What you will build

A styled version of the `crunch-web-portfolio-<yourhandle>` repository from Week 1. Same five pages — `index.html`, `about.html`, `writing/index.html`, `writing/why-i-build-on-the-web.html`, `contact.html` — now sharing a single hand-authored `styles.css`. The site uses only the platform: custom properties, `clamp()`, `color-mix()`, `prefers-color-scheme`. No Tailwind, no Bootstrap, no `@import` from a CDN beyond a webfont link.

---

## Acceptance criteria

- [ ] The Week 1 repo (`crunch-web-portfolio-<yourhandle>`) has a new file at the project root: `styles.css`.
- [ ] Every page links the same stylesheet from `<head>`:
  ```html
  <link rel="stylesheet" href="/styles.css">
  ```
  (Adjust the path if your pages live in a `writing/` subfolder — use a relative path that resolves from each file.)
- [ ] `styles.css` opens with a `*, *::before, *::after { box-sizing: border-box; }` rule.
- [ ] `styles.css` declares a `:root` token block including, at minimum:
  - **Palette:** `--ink`, `--parchment`, `--surface`, `--rule`, `--page-sky`, `--page-sky-deep`, `--page-sky-soft`.
  - **Role tokens:** `--bg`, `--fg`, `--surface-bg`, `--accent`, `--accent-hover`, `--accent-ring`.
  - **Typography:** `--font-display`, `--font-body`, `--font-system`, `--type-base`, `--type-small`, `--type-lede`, `--type-h1`, `--type-h2`, `--type-h3`.
  - **Space:** `--space-1` through `--space-6`.
  - **Radius:** at least one.
- [ ] Headings use `clamp()` for fluid `font-size`, `line-height: 1.2`, and `text-wrap: balance`.
- [ ] Paragraphs use `line-height: 1.6` and cap line length with `max-width: 65ch`.
- [ ] Links use `var(--accent)` for color; `:hover` derives its color via `color-mix()`.
- [ ] Every interactive element has a visible `:focus-visible` outline using `var(--accent-ring)`.
- [ ] The "skip to main content" link is visually hidden by default and slides into view on `:focus`.
- [ ] A `@media (prefers-color-scheme: dark)` block overrides the role tokens only — **no component rule is duplicated**.
- [ ] Every page passes WCAG 2.2 AA contrast (4.5:1 body, 3:1 large text and non-text UI) in **both** light and dark mode.
- [ ] Every page passes <https://validator.w3.org/nu/> with zero errors and zero warnings.
- [ ] Every page passes axe DevTools with zero critical and zero serious issues — including zero contrast violations.
- [ ] No selector in `styles.css` exceeds specificity `(0, 0, 1, 1)` except the `:root` block and any reset selectors.
- [ ] The `README.md` is updated with: a "what changed this week" note, a screenshot or two, and a sentence on the design decision you are proudest of.

---

## Suggested order of operations

### Phase 1 — Reset and tokens (45 min)

Create `styles.css` at the project root. The first thirty lines:

1. The `* { box-sizing: border-box; }` reset.
2. Sensible defaults for `body` (`margin: 0`), `img` (`max-width: 100%; display: block`), and `:focus-visible` (`outline: 2px solid var(--accent-ring); outline-offset: 2px`).
3. The `:root` token block: palette, role tokens, typography, space.

Do **not** touch any component rules yet. Read your stylesheet top to bottom — the file should feel like a design system spec, not a stylesheet. Open `index.html` in Live Server. The page should look identical to Week 1: black text on white. That is fine. Tokens declared but not yet consumed.

### Phase 2 — Typography (1.5 h)

Now consume the tokens. Style:

- `body` — read `background` from `--bg`, `color` from `--fg`, `font-family` from `--font-body`, `font-size` from `--type-base`, `line-height: 1.6`.
- `h1`, `h2`, `h3` — `font-family` from `--font-display`, the matching `--type-h*` token, `line-height: 1.2`, `text-wrap: balance`, top-and-bottom margin from the space scale.
- `p` — `max-width: 65ch`, sensible margin.
- `p.lede` (the first paragraph after the article header) — `--type-lede`.
- `a` — color from `--accent`; `:hover` from `color-mix(in oklch, var(--accent), black 25%)`.
- `time`, `.byline` — `--type-small`, a muted color (a `color-mix()` of `--fg` with the background tints down).
- `button`, `input`, `select`, `textarea` — `font-family: var(--font-system)`, sane padding, focus ring.

Open every page of the site. Each one should now read as a piece of typography. The layout is still browser-default flow; that is Week 3. Today is type.

### Phase 3 — Theme: surface and rule (1 h)

Style the structural pieces:

- The top `<header>` — `border-bottom: 1px solid var(--rule)`, generous padding-block, the nav list laid out horizontally with `display: flex; gap: var(--space-4); list-style: none; padding: 0;`.
- The bottom `<footer>` — similar, `border-top: 1px solid var(--rule)`, smaller type.
- Cards in the writing index (`article` inside the writing list) — `background: var(--surface-bg)`, padding, a subtle border or rule, a hover state that uses `color-mix()` to tint the background.
- The `<aside>` on the about page, if you have one — set apart with a left rule or background tint.
- The contact form — labels above inputs, comfortable padding, generous gap between fields, the submit `<button>` styled with `--accent` background and `--surface-bg` foreground (check contrast).

Limit yourself to the tokens. Every new color reaches for one of the role tokens or `color-mix()` over them. Resist adding tokens until you have a real reason; the test is "could I describe this token's role in one sentence?"

### Phase 4 — Dark mode (45 min)

Add the `@media (prefers-color-scheme: dark)` block right after the `:root` palette. Override only role tokens:

```css
@media (prefers-color-scheme: dark) {
  :root {
    --bg:           var(--ink);
    --fg:           #e8e4d8;
    --surface-bg:   #242220;
    --rule:         #3a3833;
    --accent:       #38bdf8;     /* lighter sky for dark surfaces */
    --accent-hover: color-mix(in oklch, var(--accent), white 15%);
    --accent-ring:  color-mix(in oklch, var(--accent) 40%, transparent);
  }
}
```

Toggle your OS dark mode. Walk through every page. The site flips. If anything looks wrong in dark mode, the bug is almost certainly that a rule bypassed a token somewhere — find it and convert it.

### Phase 5 — Audit (45 min)

For every page, in both light and dark mode:

1. Run it through <https://validator.w3.org/nu/>. Fix every error and every warning.
2. Run it through axe DevTools. Fix every critical and serious issue. The contrast violations are the ones you most often need to tune; trust the picker.
3. Tab through the page with the keyboard only. Every interactive element should have a visible focus ring. The skip link should slide in on first Tab and let you jump past the header.

### Phase 6 — README and ship (30 min)

Update `README.md`. Add:

- A "what changed in Week 2" subsection — three sentences.
- One screenshot of a page in light mode and one in dark mode.
- A sentence on the design decision you are proudest of.

Commit, push, share the live URL in the cohort channel.

---

## Suggested final tree

```
crunch-web-portfolio-<yourhandle>/
├── README.md
├── styles.css                 ← new this week
├── index.html
├── about.html
├── contact.html
├── writing/
│   ├── index.html
│   └── why-i-build-on-the-web.html
└── images/
    └── headshot.jpg
```

No `node_modules/`, no `package.json`, no Tailwind config. One stylesheet, hand-written.

---

## Stretch goals

- Add a `:focus-visible` ring that uses `outline-offset: 3px` and a semi-transparent `var(--accent-ring)`. The ring should be visible at the same intensity in both themes (because it derives from the active theme's `--accent`).
- Add an explicit user toggle for theme. **Important:** the toggle needs a tiny script (Week 4). You can write the CSS today — `:root[data-theme="dark"] { ... }` overrides — and leave the JS for next week. Note this clearly in the README.
- Add a `<picture>` element on the about page that swaps the headshot for an alternate based on `prefers-color-scheme` — a darker portrait for dark mode. No JavaScript needed.
- Use `@supports` to provide a graceful fallback for browsers that do not support `oklch()` — for the next three to five years, this is increasingly unnecessary, but doing it once is good practice.

---

## Rubric

| Criterion | Weight | "Great" looks like |
|-----------|------:|--------------------|
| Token system | 25% | Comprehensive role-token set; nothing hard-coded below the palette; `color-mix()` derives hover/ring |
| Typography | 20% | Fluid `clamp()` scale; consistent line-height; 65ch measure; `text-wrap: balance` on headings |
| Cascade discipline | 15% | No selector above `(0, 0, 1, 1)`; no `!important`; cascade is readable end-to-end |
| Dark mode | 15% | One `@media` block; no duplicated rules; every page reads cleanly in both themes |
| Contrast | 10% | Every text/background pair passes WCAG AA in light **and** dark |
| Accessibility | 10% | axe clean; visible focus rings; skip link functional |
| README & polish | 5% | A reader understands the design intent without opening the CSS |

---

## Why this matters

A site whose CSS is hand-written, token-driven, and accessibility-clean is a remarkably small thing — maybe 200 lines of CSS for a five-page site. It is also a remarkably durable thing. Week 3 adds layout; the tokens stay. Week 9 adds animation; the tokens stay. Week 10 ships; the tokens still stay. You will reuse this stylesheet, or something very close to it, on every personal site you build for the next decade.

The deeper reason: the platform now ships everything a small site honestly needs. Knowing this — and knowing it from having typed it yourself — is what separates a frontend developer from someone who installs frontend frameworks. C8 wants you to be the first one.

When a future employer asks "show me something you styled," this site is the answer. The Week 2 version is the first version that looks like a website.

---

## Submission

Commit. Push. Make the repo public if it is not already. Share the URL with the cohort channel. Your peers will open the page in light mode and dark mode, on a phone and on a laptop, and run it through axe. They will read your `styles.css` top to bottom and look for hard-coded colors below the palette. They will check that the cascade is flat.

Then read [Week 3 — Layout & Responsiveness](../../week-03/) — and start laying out the pages you just styled.
