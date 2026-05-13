# Week 1 Homework

Six problems, ~6 hours total. Commit each in your Week 1 repo under a `homework/` folder.

---

## Problem 1 — The document skeleton, from memory (30 min)

Open a fresh file. **Without looking at the lecture notes**, type out a complete HTML5 document skeleton with everything a real page needs in `<head>`: doctype, root element with language, charset, viewport meta, and title. Save it as `homework/01-skeleton.html`.

**Acceptance.** The page passes <https://validator.w3.org/nu/> with zero errors and zero warnings when fed a `<body>` containing just one `<h1>` and one `<p>`. The first four lines of the file match the canonical skeleton without you having looked.

---

## Problem 2 — Landmark inventory (45 min)

Visit three real websites and screenshot or sketch the layout of each. Pick three sites with different layouts:

- A news site (e.g. `[https://www.bbc.com](https://www.bbc.com)`).
- A documentation site (e.g. `[https://developer.mozilla.org](https://developer.mozilla.org)`).
- A personal blog or portfolio (your choice).

For each site, write down which **landmark element** you would use for each major region: `<header>`, `<nav>`, `<main>`, `<aside>`, `<footer>`. Where the same landmark appears more than once, decide what `aria-label` you would give each instance.

**Acceptance.** A file `homework/02-landmarks.md` contains:

- Three site URLs.
- For each, a table with columns: *Region* (a description), *Element*, *aria-label if needed*.
- A short concluding paragraph (3–5 sentences) on patterns you noticed across the three sites.

---

## Problem 3 — Heading hierarchy from a real article (45 min)

Pick a longform article you have read recently (Wikipedia, a longform blog post, a magazine essay). Open it in your browser. Open DevTools, **disable CSS** (Chrome: Cmd/Ctrl+Shift+P → "Disable CSS"). The page becomes a wall of headings, paragraphs, lists, and images.

Now sketch the heading outline: `h1`, `h2`s, `h3`s under each `h2`, etc. You should be able to read the outline alone and reconstruct what the article is about.

**Acceptance.** A file `homework/03-outline.md` contains:

- The article URL.
- The heading outline as a nested bullet list (using `-` and indentation).
- A one-paragraph reflection on whether the outline alone communicates the article's argument. (For well-edited publications, the answer is usually yes; for poorly-edited ones, no.)

---

## Problem 4 — Mark up a form (1 h)

Build a contact form as a standalone HTML page at `homework/04-contact-form.html`. The form must collect:

- Full name (required, autocomplete).
- Email (required, type `email`, autocomplete).
- Reason for contact (a `<select>` with three options: General inquiry, Bug report, Speaking request).
- Preferred contact method (a group of radio buttons: Email, Phone, No follow-up). Use `<fieldset>` and `<legend>`.
- Phone number (optional, type `tel`, autocomplete).
- Message (a `<textarea>`, required, minlength 20).
- A submit button.

**Acceptance.**

- Every input has a `<label>` (either wrapping or `for`/`id`-paired).
- Required fields use the `required` attribute.
- The `<select>` has a leading "Choose one" option with empty value, and the `required` attribute on the `<select>`.
- The radio button group is inside a `<fieldset>` with a `<legend>`.
- The submit button is `<button type="submit">`, not `<input>` or `<div>`.
- The page validates with zero errors and zero warnings on validator.w3.org.
- axe DevTools reports zero serious or critical issues.

Add a short comment at the top of the file naming the WCAG criterion each design choice addresses.

---

## Problem 5 — Rewrite a sample of div-soup (1 h)

In `homework/05-rewrite/`, take Exercise 2's `before.html` (or write your own div-soup page from scratch — ~30 lines of `<div>`s representing a small product card with image, title, price, and "buy" button). Save the original as `before.html` and your semantic rewrite as `after.html`.

**Acceptance.**

- `before.html` is preserved unchanged.
- `after.html` uses semantic elements throughout — `<article>` for the card, `<button>` for the buy action, real `<img>` with alt, `<h2>` or `<h3>` for the product title.
- `after.html` validates with zero errors and zero warnings.
- A `notes.md` in the same folder lists the three biggest semantic changes you made.

---

## Problem 6 — Reflection (30 min)

Write `homework/06-reflection.md` (300–400 words) answering:

1. What did you most expect to know about HTML that turned out to be wrong?
2. Which lecture point changed your mental model the most?
3. Pick one element you had never used before this week. Where will you use it next?
4. What is one accessibility habit you will keep from Week 1, for the rest of your career?

---

## How to submit

- Create a folder `homework/` in your Week 1 repo.
- Save each problem's output with the filename suggested above.
- One commit per problem is ideal; one big commit at the end is acceptable.
- In your final commit message, link to the file(s) you spent the most time on.

## Grading guide

This homework is graded on completion, not perfection. You are practicing. The rubric:

| Problem | What "complete" means |
| ------- | --------------------- |
| 1 | Skeleton typed from memory; validates clean. |
| 2 | Three sites, landmark table for each, conclusion paragraph. |
| 3 | Outline of a real article in bullet form; reflection paragraph. |
| 4 | Form passes validator and axe DevTools; every input labeled. |
| 5 | `before.html` and `after.html` both present; `notes.md` lists three changes. |
| 6 | 300–400 word reflection answering all four questions. |

If you finish a problem and are uncertain whether it counts as "complete," ask in the cohort channel. Future-you reads better notes than nobody-you.

## Time budget

| Problem | Time |
| ------: | ---: |
| 1 | 30 min |
| 2 | 45 min |
| 3 | 45 min |
| 4 | 1 h |
| 5 | 1 h |
| 6 | 30 min |
| **Total** | **~4 h 30 min** |

When done, push your Week 1 repo and start the [mini-project](./mini-project/README.md).
