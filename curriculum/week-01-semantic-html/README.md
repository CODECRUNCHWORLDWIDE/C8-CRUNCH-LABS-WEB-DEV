# Week 1 — Semantic HTML

> *Before you write a single line of CSS, the page has to mean something. Headings are headings. Lists are lists. A button is a button. That is the contract you sign with the browser, with the screen reader, with the search index, and with every future maintainer of this code.*

Welcome to C8. Week 1 is unusual: we will not write a single line of CSS, and we will not touch JavaScript. Most beginner web courses skip past HTML in an afternoon and rush you into colored buttons and animation. We are not doing that. By Sunday of Week 1 you will be able to **hand-author a 5-page website using only HTML**, pass the W3C validator on every page, pass the axe DevTools accessibility audit on every page, and explain — out loud, to a non-engineer — why each tag you chose is the right one.

HTML is the bones. CSS is the clothing. JavaScript is the choreography. If the bones are wrong, no amount of clothing will save the page. So Week 1 is bones.

---

## Learning objectives

By the end of this week, you will be able to:

- **Explain** what HTML is — a tree of elements, parsed by the browser into the DOM, before any script or style runs.
- **Write** a valid HTML5 document from a blank file: doctype, `<html lang>`, `<head>` with charset and viewport, `<body>` with semantic landmarks.
- **Choose** the correct element for the content you have — `article`, `section`, `nav`, `aside`, `header`, `main`, `footer` — not `div` by default.
- **Build** a heading hierarchy (`h1` through `h6`) that describes the document outline a screen reader will read.
- **Write** alt text that is useful, including the rare case where empty alt is the right answer.
- **Mark up** a form with labels, fieldsets, legends, required fields, and input types that earn their HTML5 keep.
- **Validate** every page against the W3C validator and **audit** every page with axe DevTools, fixing every error and every serious warning.
- **Defend** the choice of semantics in a code review — citing the WHATWG HTML Living Standard and WCAG 2.2 AA.

---

## Prerequisites

You finished **Week 0 — Setup**. Concretely:

- VS Code installed, with the Live Server extension.
- A terminal you can open and type into. You know `cd`, `ls`, `mkdir`.
- A GitHub account.
- A current Chrome or Firefox, with the axe DevTools browser extension installed.

If any of those are shaky, finish Week 0 first. We will not slow down.

## Topics covered

- HTML as a tree — the DOM before any scripting
- The doctype, the `<html>`/`<head>`/`<body>` skeleton
- Elements, attributes, content — and why the distinction matters
- Block vs inline (historical) and how display CSS replaces this in Week 2
- Character encoding (UTF-8, always), the viewport meta tag, the `lang` attribute
- Validation: validator.w3.org, what its messages mean, and how to fix them
- Why "div soup" is bad and why semantics are the cure
- Heading hierarchy and the document outline
- The seven landmark elements: `header`, `nav`, `main`, `article`, `section`, `aside`, `footer`
- Lists (`ul`, `ol`, `dl`), definitions, `time`, `address`
- Forms: `label`, `input`, `fieldset`, `legend`, `required`, key ARIA attributes
- Images: `alt` text — when descriptive, when empty, when complex needs a long description
- WCAG 2.2 AA, distilled to a single-page summary
- The "no CSS view" — every page must work with styling turned off
- Browser DevTools and the Elements panel: the DOM as the canonical truth of your page

## Tools you will need

| Tool                                 | Role                       | Cost |
| ------------------------------------ | -------------------------- | ---- |
| **VS Code**                          | Editor                     | Free |
| **Live Server** (VS Code extension)  | Auto-reload as you save    | Free |
| **A current Chrome or Firefox**      | Render + DevTools          | Free |
| **axe DevTools** (browser extension) | Accessibility audit        | Free |
| **validator.w3.org**                 | HTML conformance           | Free |
| **A GitHub account**                 | Where your work lives      | Free |

You will not install anything else this week. No Node.js, no build step, no package manager. Just a text editor, a browser, and the open web.

---

## Weekly schedule

The schedule below adds up to approximately **36 hours**. Treat it as a target. Some sections will click in 20 minutes, others will need 3 hours. That is fine.

| Day       | Focus                                          | Lectures | Exercises | Challenges | Quiz/Read | Homework | Mini-Project | Self-Study | Daily Total |
|-----------|------------------------------------------------|---------:|----------:|-----------:|----------:|---------:|-------------:|-----------:|------------:|
| Monday    | What HTML actually is; the document skeleton   |    2h    |    1.5h   |     0h     |    0.5h   |   1h     |     0h       |    0.5h    |     5.5h    |
| Tuesday   | Semantics, headings, landmarks                 |    2h    |    2h     |     1h     |    0.5h   |   1h     |     0h       |    0h      |     6.5h    |
| Wednesday | Lists, forms, images, accessibility            |    2h    |    2h     |     1h     |    0.5h   |   1h     |     0h       |    0.5h    |     7h      |
| Thursday  | Validation and accessibility audit             |    0h    |    1.5h   |     1h     |    0.5h   |   1h     |     2h       |    0.5h    |     6.5h    |
| Friday    | Mini-project pages: home, about, writing       |    0h    |    1h     |     1h     |    0.5h   |   1h     |     2h       |    0.5h    |     6h      |
| Saturday  | Mini-project deep work                         |    0h    |    0h     |     0h     |    0h     |   1h     |     3h       |    0h      |     4h      |
| Sunday    | Quiz, review, polish                           |    0h    |    0h     |     0h     |    0.5h   |   0h     |     0h       |    0h      |     0.5h    |
| **Total** |                                                | **6h**   | **8h**    | **4h**     | **3h**    | **6h**   | **7h**       | **2h**     | **36h**     |

---

## How to navigate this week

| File | What is inside |
|------|----------------|
| [README.md](./README.md) | This overview |
| [resources.md](./resources.md) | Curated readings, the HTML Living Standard, MDN, WCAG 2.2, axe DevTools |
| [lecture-notes/01-what-html-actually-is.md](./lecture-notes/01-what-html-actually-is.md) | HTML as a tree, the document skeleton, validation, why div soup is bad |
| [lecture-notes/02-semantics-headings-landmarks-a11y.md](./lecture-notes/02-semantics-headings-landmarks-a11y.md) | Landmarks, headings, lists, forms, images, accessibility |
| [exercises/README.md](./exercises/README.md) | Index of exercises |
| [exercises/exercise-01-build-a-real-page.md](./exercises/exercise-01-build-a-real-page.md) | Mark up an article page from a plain-text source |
| [exercises/exercise-02-fix-the-bad-html.md](./exercises/exercise-02-fix-the-bad-html.md) | Take a div-soup page and rewrite it semantically |
| [exercises/exercise-03-validate-and-audit.md](./exercises/exercise-03-validate-and-audit.md) | Run validator.w3.org and axe DevTools and fix every issue |
| [challenges/README.md](./challenges/README.md) | Index of weekly challenges |
| [challenges/challenge-01-recreate-a-real-page.md](./challenges/challenge-01-recreate-a-real-page.md) | HTML-only recreation of a real news article |
| [quiz.md](./quiz.md) | 10 multiple-choice questions |
| [homework.md](./homework.md) | Six practice problems for the week |
| [mini-project/README.md](./mini-project/README.md) | Full spec for the 5-page personal site, HTML only |

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

- Read the [WHATWG HTML Living Standard](https://html.spec.whatwg.org/multipage/) "Sections" chapter end-to-end. It is dense but it is the normative reference.
- Read the [WCAG 2.2 AA quick reference](https://www.w3.org/WAI/WCAG22/quickref/?currentsidebar=%23col_overview&levels=aaa). Pick three success criteria you do not understand. Write them up in your own words.
- Install [NVDA](https://www.nvaccess.org/download/) (Windows) or use the built-in **VoiceOver** (macOS, `Cmd + F5`). Navigate your mini-project with the screen reader only — no mouse, no eyes on the screen.
- Read the source of [a11yproject.com](https://www.a11yproject.com/) (View Source). Notice how few classes it uses and how much work the semantics do.
- Look at the page you visit most often. Open DevTools, disable CSS, and read it without styling. Note which sections still make sense and which collapse into nonsense. That is the semantic-correctness of the page, exposed.

---

## What this week is NOT

A few things to set expectations:

- **Not a CSS week.** No colors, no layout, no fonts. We hold the line. Week 2 starts CSS.
- **Not a JavaScript week.** No interactivity beyond what the browser provides for free (forms submit; links navigate). Week 4 starts JavaScript.
- **Not a "tour of every HTML tag" week.** HTML has over a hundred elements. We cover the twenty you will use 95% of the time. The rest you will pick up by reference, never by memorization.

---

## Up next

Continue to [Week 2 — Modern CSS](../week-02-modern-css/) once you have pushed your mini-project to GitHub and it passes both the W3C validator and axe DevTools clean.

---

*If you find errors in this material, please open an issue or send a PR. Future learners will thank you.*
