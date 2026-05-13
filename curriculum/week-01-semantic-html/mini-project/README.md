# Mini-Project — A 5-page personal site, semantic HTML only

> Build a 5-page personal website. No CSS, no JavaScript. Pure semantic HTML. Every page passes W3C validation and axe DevTools clean.

This is the synthesis of Week 1. You will build the bones of a real personal site — the same site you will style in Week 2, lay out in Week 3, and animate-and-deploy in Week 9 and Week 10. By the end of Week 1, the site reads beautifully with no styling at all, because every page is structurally sound.

**Estimated time:** 7 hours, spread across Thursday–Saturday.

---

## What you will build

A static, multi-page personal site living in a new GitHub repository named `crunch-web-portfolio-<yourhandle>`. The site has five pages:

1. **Home (`index.html`)** — a one-screen introduction.
2. **About (`about.html`)** — a longer biography page.
3. **Writing (`writing/index.html`)** — an index of three short essays, each with a teaser.
4. **One essay (`writing/why-i-build-on-the-web.html`)** — a full essay as an `<article>`, with sections.
5. **Contact (`contact.html`)** — a contact form with at least four inputs.

All five pages share the same top nav and footer (you will hand-duplicate them; we do not have templates this week).

---

## Acceptance criteria

- [ ] A new public GitHub repo `crunch-web-portfolio-<yourhandle>`.
- [ ] The repo has at minimum these files:
  ```
  crunch-web-portfolio-<yourhandle>/
  ├── index.html
  ├── about.html
  ├── contact.html
  ├── writing/
  │   ├── index.html
  │   └── why-i-build-on-the-web.html
  └── README.md
  ```
- [ ] Every page opens with `<!doctype html>` and `<html lang="...">` (use the correct language tag for the language you write in).
- [ ] Every page has a `<head>` with charset, viewport, and a meaningful, page-specific `<title>`.
- [ ] Every page has a shared top `<header>` with the site title and a `<nav aria-label="Primary">` linking to the other four pages.
- [ ] The current page's nav link uses `aria-current="page"`.
- [ ] Every page has a single `<main id="main">` containing the page's unique content.
- [ ] Every page has a `<footer>` with copyright and at least one link (e.g. to your GitHub).
- [ ] Every page has a "skip to main content" link as the first thing in `<body>`, pointing to `#main`.
- [ ] The essay page uses an `<article>` with its own `<header>` (headline, byline, `<time datetime="...">`) and at least three `<section>` blocks with `<h2>` headings.
- [ ] The writing index uses a list of `<article>` cards, each with a heading, a teaser paragraph, and a link to the full essay.
- [ ] The contact form has at least four inputs: name, email, message (textarea), and one of your choice (subject dropdown, preferred-contact radios, etc). Each input has a `<label>`. Required inputs use `required`.
- [ ] Every page validates with zero errors and zero warnings on <https://validator.w3.org/nu/>.
- [ ] Every page passes axe DevTools with zero critical and zero serious issues.
- [ ] The `README.md` includes: setup (none — open in a browser), the page list with one-sentence descriptions, and a "what I would change with CSS" reflection paragraph.

---

## Suggested order of operations

### Phase 1 — Sketch the structure (45 min)

Before opening VS Code, take a piece of paper or a Markdown file and outline each page:

- **Home.** What is the one-screen pitch? A heading, a sentence or two, a "see my writing" link.
- **About.** Three paragraphs about who you are, what you build, what you are learning. Maybe an inline image with alt text.
- **Writing index.** Three essay cards. Pick the three titles now. You will write only one full essay; the other two stay as cards linking to `#`.
- **The full essay.** The argument has three sections; pick the section titles now.
- **Contact.** Which four inputs?

This sketch is your spec. You will refer back to it the whole week.

### Phase 2 — Build the shared chrome (1 h)

Create `index.html`. Type the document skeleton from memory. Build the `<header>` (site title, primary nav) and the `<footer>` once, carefully, with `aria-label` and `aria-current` correct. This shared chrome will be duplicated to all five pages.

Test: load `index.html` in Live Server. With no CSS, you should see the site title, a list of nav links, the heading "Home" or similar, and a footer line. Read it top to bottom and check that the order of information makes sense.

### Phase 3 — Duplicate to the other four pages (45 min)

Create `about.html`, `contact.html`, `writing/index.html`, `writing/why-i-build-on-the-web.html`. Copy the skeleton and the chrome into each. Update the `<title>`, the `<h1>`, and the `aria-current="page"` for each one.

This is tedious. Week 2 will not solve it (CSS does not deduplicate HTML). Week 7 will, when we introduce static-site tooling. Today, you duplicate by hand — partly because beginners need to feel where templating earns its keep.

### Phase 4 — Fill each page's content (3 h)

For each page, write the real content using the right elements:

- **About** — `<article>` (your bio is a self-contained piece), with sections if it gets long.
- **Writing index** — a `<section>` with `<h2>Recent writing</h2>` and a list of `<article>` cards. Each card has `<h3>` for the title, `<p>` for the teaser, `<time>` for the date, and a link to the full piece.
- **The essay** — a complete `<article>`. Header with `<h1>`, byline, `<time>`. Body with multiple `<section>` blocks (each with `<h2>`). At least one `<blockquote>`. At least one image with thoughtful alt text (or `alt=""` if decorative — pick consciously).
- **Contact form** — see the input list above. Use `<fieldset>`/`<legend>` if you have a radio group. Use `autocomplete` attributes for name/email/tel.

### Phase 5 — Validate and audit (45 min)

For every page:

1. Run it through <https://validator.w3.org/nu/>. Fix every error and every warning.
2. Run it through axe DevTools. Fix every critical and serious issue.
3. Disable CSS and tab through with the keyboard. Verify that focus order makes sense and the skip link works.

### Phase 6 — README and ship (30 min)

Write the `README.md`. Setup section: "This is a static site. Open `index.html` in any browser. There is no build step." Page list. The "what I would change with CSS" reflection.

Push to GitHub. Make the repo public. Share the URL.

---

## Suggested layout (your folder, after Phase 5)

```
crunch-web-portfolio-<yourhandle>/
├── README.md
├── index.html
├── about.html
├── contact.html
├── writing/
│   ├── index.html
│   └── why-i-build-on-the-web.html
└── images/
    └── headshot.jpg   (optional; if used, it has alt text)
```

No `style.css`, no `script.js`, no `node_modules/`. Week 1 is bones only.

---

## Stretch goals

- Add a `<dialog>` element somewhere to learn the modern modal primitive (it works without JavaScript using `open` attribute or the `showModal()` method — for Week 1, just use the `open` attribute).
- Add a `<details>` / `<summary>` to one page as a no-JS accordion.
- Add structured-data markup (`schema.org` via `<script type="application/ld+json">`) to the essay so Google can render a rich result. This is a stretch because the JSON inside the script tag is data, not behavior — no JavaScript executes.
- Use `<picture>` with `<source>` to provide multiple image formats. Pure HTML, no CSS.
- Read your finished site with VoiceOver (`Cmd+F5`) or NVDA. Find one thing to improve and improve it.

---

## Rubric

| Criterion | Weight | "Great" looks like |
|-----------|------:|--------------------|
| Skeleton correctness | 10% | Every page opens with the right doctype, lang, charset, viewport, and title; all from memory |
| Semantic structure | 25% | Every page uses landmarks correctly; `<main>` is unique; headings do not skip levels |
| Form quality | 15% | Every input labeled; types, `required`, `autocomplete` set; submit is a `<button>` |
| Image and alt text | 10% | Every `<img>` has thoughtful `alt`; decoratives use `alt=""`; complex images use `<figcaption>` |
| Validation | 15% | Every page passes validator.w3.org with zero errors and zero warnings |
| Accessibility | 15% | Every page passes axe DevTools with zero critical and zero serious; skip link works |
| README | 5% | A reader can understand the site without opening the files |
| Stretch | 5% | At least one stretch goal delivered |

---

## Why this matters

This site is yours for the next eleven weeks. You will style it in Week 2, lay it out in Week 3, add interactivity in Weeks 4–6, refactor it into a component-based codebase in Week 7, and deploy it in Week 10. Every later improvement assumes you got the bones right today. A site whose HTML is wrong cannot be styled into rightness — the wrong elements stay wrong forever.

When a future employer asks "show me something you built," this site is the answer. The Week 1 version, with no CSS, is *also* a fine answer — it tells the reader you understand the platform.

---

## Submission

Commit. Push. Make the repo public. Share the URL with the cohort channel. Your peers will scan your `index.html` for `<main>`, `<header>`, `<nav>`, `<footer>`. They will run your pages through the validator. They will tab through your contact form. The bones speak.

Then read [Week 2 — Modern CSS](../../week-02-modern-css/) — and start dressing the bones.
