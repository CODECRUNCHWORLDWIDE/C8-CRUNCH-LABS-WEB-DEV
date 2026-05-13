# Week 2 — Modern CSS

> *Now the bones get dressed. CSS is the language the browser uses to turn your tree of meaning into a typeset page. It is one of the most-misunderstood languages in the toolkit because most courses skip the rules and rush straight to the colors. We are not doing that. By Sunday of Week 2 you will be able to style a five-page personal site with custom properties, fluid type, a coherent color system, dark mode, and a heading hierarchy that holds together — using only the cascade, the box model, and the typography primitives the browser ships with.*

Welcome back. Week 1 left you with a five-page site that reads correctly with styling turned off. This week, you dress it. **No frameworks. No Bootstrap. No Tailwind. Not yet.** The point is to learn what CSS actually is — a declarative language for telling the browser how the DOM should render — before reaching for any layer that hides it from you.

CSS has three foundational ideas that everything else depends on: the **cascade** (how the browser resolves competing rules), **specificity** (which rule wins when more than one applies), and **inheritance** (which property values flow from a parent to its children automatically). If those three are wrong in your head, no amount of utility classes will save you. So Week 2 is foundations.

Then we layer on the parts of CSS that earn their keep: **custom properties** for a real design system, **`color-mix()`** and **`oklch()`** for predictable color math, **`clamp()`** for fluid type, **system font stacks** for performance and platform-native feel, and **`prefers-color-scheme`** for dark mode users who have been waiting since 2018.

By Sunday, your Week 1 site is styled and you have a CSS file you understand line by line.

---

## Learning objectives

By the end of this week, you will be able to:

- **Explain** the cascade in three sentences — origin, specificity, source order — and predict which rule wins for any given selector pair.
- **Calculate** specificity for any selector by hand (the four-tuple of inline, ID, class, element).
- **List** the half-dozen CSS properties that inherit by default, and the rule that decides the rest.
- **Diagram** the box model and explain why `box-sizing: border-box` is the only sane default.
- **Design** a token-driven theme using CSS custom properties — color, spacing, type scale — and refactor an ad-hoc stylesheet to use it.
- **Mix** colors predictably with `color-mix()`, and choose between `hsl()` and `oklch()` based on what you are trying to do.
- **Write** fluid typography with `clamp()` that scales from a 320 px phone to a 1440 px laptop without breakpoints.
- **Implement** dark mode with `prefers-color-scheme` and a single tier of custom-property overrides.
- **Audit** every page for color contrast (WCAG 2.2 AA — 4.5:1 for body text, 3:1 for large text) and fix what fails.
- **Defend** the choice not to install a CSS framework this week, in a sentence or two.

---

## Prerequisites

You finished **Week 1 — Semantic HTML**. Concretely:

- A `crunch-web-portfolio-<yourhandle>` repo on GitHub with the five-page site shipped.
- Every page in that repo passes validator.w3.org and axe DevTools clean.
- You can open the file in VS Code and Live Server and see it render.

If the Week 1 site is not done, go back. Week 2 styles the Week 1 site — there is nothing to style yet if you skipped Week 1.

## Topics covered

- The C in CSS — the cascade, in detail: origin, layer, specificity, source order, `!important`
- Selectors you will use 90 percent of the time — type, class, id, descendant, child, attribute, pseudo-class, pseudo-element
- Specificity calculated by hand, the inline-style override, the `!important` antipattern
- Inheritance — what inherits, what does not, and how `inherit` / `initial` / `unset` / `revert` work
- The box model: content, padding, border, margin, and the collapsing-margin gotcha
- `box-sizing: border-box` — declared once, applied everywhere
- CSS custom properties, the cascade as it applies to them, and why they are not Sass variables
- The `color-mix()` function — and how it replaces a sea of pre-computed hover/active shades
- `hsl()` and `oklch()` — picking the right color space for predictable lightness
- Fluid typography with `clamp()` — and why you almost never need a media query for type again
- System font stacks — the case for native fonts on platforms that ship native fonts
- Dark mode with `prefers-color-scheme: dark` and a single layer of overrides
- Color contrast at WCAG 2.2 AA, measured in DevTools

## Tools you will need

| Tool                                | Role                                    | Cost |
| ----------------------------------- | --------------------------------------- | ---- |
| **VS Code**                         | Editor                                  | Free |
| **Live Server** (VS Code extension) | Auto-reload on save                     | Free |
| **A current Chrome or Firefox**     | Render, DevTools, color picker          | Free |
| **DevTools — Computed panel**       | See which rule won and why              | Free |
| **DevTools — Color contrast picker**| Live WCAG 2.2 AA contrast readouts      | Free |
| **axe DevTools** (browser extension)| Re-run accessibility audits every week  | Free |
| **validator.w3.org**                | Still required for the HTML you touched | Free |

No Node, no build, no package manager. Just a text editor, a browser, and one CSS file per page.

---

## Weekly schedule

The schedule below adds up to approximately **36 hours**. Treat it as a target. Some sections will click in twenty minutes; the cascade may take three sittings.

| Day       | Focus                                          | Lectures | Exercises | Challenges | Quiz/Read | Homework | Mini-Project | Self-Study | Daily Total |
|-----------|------------------------------------------------|---------:|----------:|-----------:|----------:|---------:|-------------:|-----------:|------------:|
| Monday    | The cascade, specificity, inheritance          |    2h    |    1.5h   |     0h     |    0.5h   |   1h     |     0h       |    0.5h    |     5.5h    |
| Tuesday   | The box model; custom properties; color        |    2h    |    2h     |     1h     |    0.5h   |   1h     |     0h       |    0h      |     6.5h    |
| Wednesday | Fluid typography, system fonts, dark mode      |    2h    |    2h     |     1h     |    0.5h   |   1h     |     0h       |    0.5h    |     7h      |
| Thursday  | Apply CSS to the Week 1 site                   |    0h    |    1.5h   |     1h     |    0.5h   |   1h     |     2h       |    0.5h    |     6.5h    |
| Friday    | Mini-project — typography & color pass         |    0h    |    1h     |     1h     |    0.5h   |   1h     |     2h       |    0.5h    |     6h      |
| Saturday  | Mini-project deep work                         |    0h    |    0h     |     0h     |    0h     |   1h     |     3h       |    0h      |     4h      |
| Sunday    | Quiz, polish, contrast audit                   |    0h    |    0h     |     0h     |    0.5h   |   0h     |     0h       |    0h      |     0.5h    |
| **Total** |                                                | **6h**   | **8h**    | **4h**     | **3h**    | **6h**   | **7h**       | **2h**     | **36h**     |

---

## How to navigate this week

| File | What is inside |
|------|----------------|
| [README.md](./README.md) | This overview |
| [resources.md](./resources.md) | Curated readings, the CSS specs, MDN, the contrast tools |
| [lecture-notes/01-the-cascade-specificity-inheritance.md](./lecture-notes/01-the-cascade-specificity-inheritance.md) | The cascade, selectors, specificity, inheritance, the box model |
| [lecture-notes/02-custom-properties-color-typography.md](./lecture-notes/02-custom-properties-color-typography.md) | Custom properties, color spaces, fluid type, system fonts, dark mode |
| [exercises/README.md](./exercises/README.md) | Index of exercises |
| [exercises/exercise-01-style-week1-page.md](./exercises/exercise-01-style-week1-page.md) | Apply CSS to your Week 1 essay page |
| [exercises/exercise-02-fluid-typography.md](./exercises/exercise-02-fluid-typography.md) | Build a `clamp()`-based type scale |
| [exercises/exercise-03-custom-properties-theme.md](./exercises/exercise-03-custom-properties-theme.md) | Token-driven theme with a dark-mode override |
| [challenges/README.md](./challenges/README.md) | Index of weekly challenges |
| [challenges/challenge-01-recreate-a-magazine-spread.md](./challenges/challenge-01-recreate-a-magazine-spread.md) | Rebuild a magazine article's typography with no images |
| [quiz.md](./quiz.md) | 10 multiple-choice questions |
| [homework.md](./homework.md) | Six practice problems for the week |
| [mini-project/README.md](./mini-project/README.md) | Style your Week-1 personal site, no frameworks |

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

- Read the [CSS Cascade and Inheritance Level 5 spec](https://www.w3.org/TR/css-cascade-5/) end-to-end. It is shorter than you expect and answers questions you will have for years.
- Read [Smashing Magazine — Modern Fluid Typography](https://www.smashingmagazine.com/2022/01/modern-fluid-typography-css-clamp/). Then derive the formula on paper.
- Open the developer tools "Computed" panel on a real site and trace one property — say `color` on a paragraph — all the way back to the rule that set it.
- Pick one site you visit often. Open DevTools, find the dark-mode media query, and read it. Notice the structure: a small set of overrides, not a parallel stylesheet.
- Install the [Stylus](https://chromewebstore.google.com/detail/stylus/clngdbkpkpeebahjckkjfobafhncgmne) extension and inject a single line — `* { outline: 1px solid magenta; }` — onto your favorite site. Suddenly every container is visible. That is the box model, rendered.

---

## What this week is NOT

A few things to set expectations:

- **Not a layout week.** Flexbox and Grid are Week 3. Today, you style elements in their default flow. The pages will look reasonable on a phone and acceptable on a desktop; making them sing across viewports is next week.
- **Not a framework week.** No Tailwind, no Bootstrap, no PostCSS, no Sass. CSS shipped with everything we use this week — variables, nested rules, color-mix, container query units. Pre-processors are still fine tools; we want you to first see what the platform already gives you.
- **Not a "tour of every CSS property" week.** CSS has hundreds of properties. We cover the thirty you will use 95 percent of the time. The rest you will pick up by reference.

---

## Up next

Continue to [Week 3 — Layout & Responsiveness](../week-03/) once you have pushed your styled site to GitHub and every page passes the W3C validator, axe DevTools, and a manual contrast check at WCAG 2.2 AA.

---

*If you find errors in this material, please open an issue or send a PR. Future learners will thank you.*
