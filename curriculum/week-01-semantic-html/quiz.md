# Week 1 — Quiz

Ten questions. Lecture notes closed. Aim for 9/10.

---

**Q1.** Which line tells the browser to parse your file as HTML5 in standards mode?

- A) `<html5>`
- B) `<!doctype html>`
- C) `<meta http-equiv="standards-mode">`
- D) `<?xml version="1.0"?>`

---

**Q2.** How many `<main>` elements should a single HTML page contain?

- A) Zero.
- B) Exactly one.
- C) One per `<section>`.
- D) As many as the page has logical content blocks.

---

**Q3.** Which of the following is the correct way to mark up an image that is purely decorative?

- A) Omit the `alt` attribute entirely.
- B) `alt="decorative image"`.
- C) `alt=""`.
- D) `role="decoration"`.

---

**Q4.** A page has an `<h1>`, then an `<h2>`, then an `<h4>`. Which WCAG-relevant rule does this break?

- A) "There must be exactly one `<h1>` per page."
- B) "Heading levels must not skip steps going down."
- C) "Every heading must contain at least 10 characters."
- D) "Headings must be wrapped in a `<section>`."

---

**Q5.** Which element is the right choice to wrap a self-contained, distributable piece of content like a blog post or a user comment?

- A) `<div>`
- B) `<section>`
- C) `<article>`
- D) `<main>`

---

**Q6.** What is the **first rule of ARIA**?

- A) Always add `role` attributes to every element.
- B) Don't use ARIA — prefer native HTML elements when they provide the semantics you need.
- C) Use `aria-hidden="true"` on every decorative element.
- D) ARIA attributes override any conflicting HTML attribute.

---

**Q7.** Where in the document does the `<meta charset="utf-8">` declaration need to appear?

- A) In the first 1024 bytes of the file, ideally as the first child of `<head>`.
- B) Anywhere in `<head>`.
- C) Anywhere in the document.
- D) Inside `<body>`, before the first text node.

---

**Q8.** Which attribute on `<html>` is required for accessibility and tells screen readers which pronunciation engine to use?

- A) `dir`
- B) `xmlns`
- C) `lang`
- D) `accesskey`

---

**Q9.** A form contains an `<input type="email">` with no `<label>`. axe DevTools flags it. Which WCAG success criterion does it fail?

- A) 1.1.1 Non-text content
- B) 2.1.1 Keyboard
- C) 3.3.2 Labels or instructions
- D) 4.1.1 Parsing

---

**Q10.** You want a clickable element that submits a form. Which is the correct choice?

- A) `<div onclick="submit()">Submit</div>`
- B) `<span role="button" tabindex="0">Submit</span>`
- C) `<button type="submit">Submit</button>`
- D) `<a href="#" onclick="submit()">Submit</a>`

---

## Answer key

<details>
<summary>Click to reveal</summary>

1. **B** — `<!doctype html>` is the HTML5 doctype. Without it, browsers fall back to quirks mode.
2. **B** — Exactly one. `<main>` marks the document's primary content; there can be only one per page.
3. **C** — `alt=""` (empty alt) tells assistive tech to skip the image. Omitting `alt` is *invalid HTML*, and a non-empty placeholder like "decorative image" is read aloud and adds noise.
4. **B** — Heading levels must not skip going down. `<h1>` → `<h2>` → `<h4>` skips `<h3>` and breaks the document outline. WCAG 1.3.1 (Info and Relationships) and 2.4.6 (Headings and Labels) both apply.
5. **C** — `<article>` is for self-contained compositions: blog posts, news stories, user comments, product cards. The HTML Living Standard explicitly lists comments as an `<article>` example.
6. **B** — The "no-ARIA" rule. Native HTML elements come with the correct semantics baked in; ARIA should only fill gaps the platform cannot.
7. **A** — Inside the first 1024 bytes, ideally as the first child of `<head>`. The browser uses those bytes to detect encoding before parsing the rest of the document.
8. **C** — `lang`. Screen readers use it to choose a pronunciation engine; search engines use it for language-aware indexing.
9. **C** — 3.3.2 Labels or instructions. Every form input must have an associated label (or `aria-label` / `aria-labelledby`).
10. **C** — `<button type="submit">`. It is keyboard-focusable, Enter- and Space-activatable, exposed to assistive tech as a button, and submits the surrounding form. None of the other options is keyboard-accessible by default.

</details>

If under 7, re-read [Lecture 1](./lecture-notes/01-what-html-actually-is.md) and [Lecture 2](./lecture-notes/02-semantics-headings-landmarks-a11y.md). If 9 or above, you are ready for the [homework](./homework.md).
