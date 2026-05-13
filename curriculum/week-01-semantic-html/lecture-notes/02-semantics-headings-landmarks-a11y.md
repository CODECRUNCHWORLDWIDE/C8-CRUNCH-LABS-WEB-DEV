# Lecture 2 — Semantics, Headings, Landmarks, Accessibility

> **Outcome:** You can choose the right element for any piece of content on a page, build a heading hierarchy a screen reader can navigate, mark up forms and images correctly, and audit your work against WCAG 2.2 AA.

Lecture 1 ended with a claim: the same page can be valid in two different ways, and the version that uses the right elements is markedly better for at least three of the four audiences (sighted users, screen-reader users, search engines, downstream tools). This lecture is the catalog of the right elements.

## 1. The seven landmarks

The HTML Living Standard defines a small number of **sectioning elements** that double as **landmarks** — semantic regions of the page that screen readers expose for quick navigation. Memorize all seven.

| Element     | What it marks                                                              | Where on a page                          |
|-------------|---------------------------------------------------------------------------|------------------------------------------|
| `<header>`  | Introductory content for a page or section: logo, site title, masthead    | Top of the document, or top of a section |
| `<nav>`     | A major group of navigation links                                          | Site nav, in-page TOC, breadcrumbs       |
| `<main>`    | The dominant content of the document. **One per page, no exceptions.**     | The unique content of this URL           |
| `<article>` | A self-contained composition: a blog post, a news story, a comment, a card | Anywhere a piece could stand alone       |
| `<section>` | A thematic grouping of content, typically with a heading                   | A chapter of a long article, a region of a landing page |
| `<aside>`   | Content tangential to the surrounding content                              | Sidebars, pull quotes, author bios       |
| `<footer>`  | Closing content for a page or section: copyright, links, attribution       | Bottom of the document, or bottom of a section |

Three rules govern them:

1. **`<main>` is unique.** Exactly one `<main>` per page. It contains the content that makes this page different from every other page on the site.
2. **Landmarks can nest.** An `<article>` can have its own `<header>` and `<footer>`. A `<section>` inside an `<article>` is normal. A `<nav>` inside `<main>` is fine (a table of contents, for instance).
3. **Use them only when they fit.** A `<nav>` should wrap *navigation*. Don't wrap a single "back to top" link in `<nav>`. A `<footer>` should be closing content; a row of social links lives there happily, but a paragraph of body text does not.

A typical layout:

```html
<body>
  <header>
    <p>Code Crunch Club</p>
    <nav aria-label="Primary">
      <ul>
        <li><a href="/">Home</a></li>
        <li><a href="/tracks">Tracks</a></li>
        <li><a href="/about">About</a></li>
      </ul>
    </nav>
  </header>

  <main>
    <article>
      <header>
        <h1>Why semantics matter</h1>
        <p><time datetime="2026-05-13">May 13, 2026</time></p>
      </header>
      <p>Body of the article...</p>
      <footer>
        <p>Filed under HTML.</p>
      </footer>
    </article>
  </main>

  <footer>
    <p>&copy; 2026 Code Crunch.</p>
  </footer>
</body>
```

When you have two of the same landmark on one page (two `<nav>` regions, say), label them so the screen reader user can tell them apart: `<nav aria-label="Primary">` and `<nav aria-label="Footer">`.

---

## 2. Headings and the document outline

Headings (`<h1>` through `<h6>`) are the table of contents your page generates implicitly. Screen readers expose a "headings list" — like the outline pane in Word — and let users jump between them. So a well-formed heading hierarchy is, in practice, *the* navigation aid for non-sighted users.

Two rules:

1. **One `<h1>` per page**, almost always inside `<main>`. It describes what the page is.
2. **Don't skip levels going down.** After `<h1>`, you can have `<h2>`s. Under any `<h2>`, you can have `<h3>`s. You can never go from `<h1>` to `<h3>` skipping `<h2>`.

Coming back up is fine: after an `<h3>`, you can move to a new `<h2>`. That just starts the next sibling section.

Visualize the outline you want:

```
h1  Why semantics matter
  h2  The four audiences
    h3  Sighted users
    h3  Screen reader users
    h3  Search engines
    h3  Future maintainers
  h2  The seven landmarks
  h2  Self-check
```

The pages that read best — the Wikipedia articles, the MDN entries, the long-form Verge essays — have outlines like that. The pages that read worst are the ones where every heading is an `<h2>` because the designer thought `<h1>` was "too big" (a problem CSS solves, not HTML).

Pick the heading based on **meaning**, not appearance. We will style them in Week 2.

---

## 3. Lists

HTML has three list elements. Use the right one.

### `<ul>` — unordered list

For items where order is incidental. Navigation links, tag clouds, search results.

```html
<ul>
  <li>HTML</li>
  <li>CSS</li>
  <li>JavaScript</li>
</ul>
```

### `<ol>` — ordered list

For items where order matters. Steps in a recipe, a top-10, a numbered argument.

```html
<ol>
  <li>Install Node.js.</li>
  <li>Clone the repo.</li>
  <li>Run npm install.</li>
</ol>
```

You can start at a number other than 1 with `start="5"`, count down with `reversed`, and use Roman numerals with `type="I"`. Spec link: <https://html.spec.whatwg.org/multipage/grouping-content.html#the-ol-element>.

### `<dl>` — description list

For name/value or term/definition pairs. Underused; powerful.

```html
<dl>
  <dt>HTML</dt>
  <dd>The structure of the page.</dd>
  <dt>CSS</dt>
  <dd>The presentation of the page.</dd>
  <dt>JavaScript</dt>
  <dd>The behavior of the page.</dd>
</dl>
```

When you have name/value pairs, a `<dl>` is more semantic than a `<table>` and far more semantic than two columns of `<p>`s.

---

## 4. The text-level elements you actually need

A few inline elements come up in nearly every page. Use them for meaning.

| Element        | What it means                                                |
|----------------|--------------------------------------------------------------|
| `<a href="">`  | A hyperlink. Visit elsewhere. **Always** has an `href`.       |
| `<strong>`     | Strong importance. Renders bold by default; conveys meaning. |
| `<em>`         | Emphasis. Renders italic by default; conveys meaning.        |
| `<code>`       | A fragment of code: `<code>console.log(x)</code>`.            |
| `<time datetime="">` | A machine-readable date or time.                       |
| `<address>`    | Contact information for the nearest `<article>` or `<body>`. |
| `<abbr title="">` | An abbreviation with its expansion in the title.          |
| `<q>`          | A short inline quote. Browsers add the quote marks.          |
| `<blockquote>` | A longer block quote. Use `cite="URL"` to attribute.         |

A note on **`<strong>` vs `<b>`** and **`<em>` vs `<i>`**: the first of each pair carries *semantic weight* (the screen reader's voice changes); the second is presentational. Use `<strong>` and `<em>` unless you specifically want presentation without meaning (rare).

The `<time>` element is worth its own paragraph. It accepts a `datetime` attribute in ISO 8601 form, which lets tools (calendars, browsers, search) parse the date even when the visible text is freeform:

```html
<time datetime="2026-05-13">May 13, 2026</time>
<time datetime="2026-05-13T15:30:00">3:30 PM on Wednesday</time>
<time datetime="PT1H30M">an hour and a half</time>
```

---

## 5. Forms — the part most beginners get wrong

Forms are the single highest-leverage place to get semantics right. A correctly-marked-up form is keyboard-navigable, screen-reader-friendly, autofills sensibly, and ports to mobile cleanly — all without a line of CSS or JavaScript.

The skeleton:

```html
<form action="/subscribe" method="post">
  <fieldset>
    <legend>Subscribe to the newsletter</legend>

    <p>
      <label for="email">Email address</label>
      <input id="email" name="email" type="email" required autocomplete="email">
    </p>

    <p>
      <label for="frequency">How often?</label>
      <select id="frequency" name="frequency">
        <option value="weekly">Weekly</option>
        <option value="monthly">Monthly</option>
      </select>
    </p>

    <p>
      <button type="submit">Subscribe</button>
    </p>
  </fieldset>
</form>
```

Things to internalize:

### Every input has a `<label>`. No exceptions.

The label is connected to the input two ways: `<label for="email">` matches `<input id="email">`. Clicking the label focuses the input. Screen readers read the label when the user lands on the input. Without a label, the input is a black hole.

The alternative — wrapping: `<label>Email <input ...></label>` — also works and skips the `id`/`for` dance. Either is fine.

### `<fieldset>` and `<legend>` group related inputs.

A `<fieldset>` wraps a group; `<legend>` is its caption. Required for radio button groups (so the screen reader announces the group context) and useful for any logical group of fields.

### `type` is doing work.

| `type=`        | What you get                                                         |
|----------------|----------------------------------------------------------------------|
| `text`         | The default. A line of plain text.                                   |
| `email`        | Triggers email keyboard on mobile; the browser validates it is email.|
| `tel`          | Triggers numeric keyboard on mobile.                                 |
| `url`          | Triggers URL keyboard; validates a URL.                              |
| `number`       | Numeric input with up/down spinners.                                 |
| `date`         | A date picker.                                                       |
| `password`     | Hides input.                                                         |
| `search`       | Subtle styling and "clear" affordance.                               |
| `checkbox`     | A boolean.                                                           |
| `radio`        | One of N (use the same `name` for the group).                        |
| `submit`       | A submit button (prefer `<button>` for richer content).              |

### `required`, `min`, `max`, `pattern`, `minlength`, `maxlength`

HTML5 has built-in validation. `required` forces a non-empty value. `pattern` accepts a regex. `min` and `max` work on number/date inputs. When validation fails, the browser shows an inline error message **for free**.

```html
<input type="text" name="zip" pattern="\d{5}" required>
```

We will style these in Week 2 and JS-augment them in Week 6. Today, the rule is: lean on the built-in validation. Frameworks did not invent form validation; the browser did, in 2012.

### `autocomplete` is an accessibility feature

`autocomplete="email"`, `autocomplete="name"`, `autocomplete="postal-code"` — these tell the browser to offer the user's saved values. For users with motor impairments, autofill is the difference between a usable form and an unusable one. Use the [full list of autocomplete tokens](https://html.spec.whatwg.org/multipage/form-control-infrastructure.html#autofill).

### `<button type="submit">`, not `<div onclick>`.

A `<button>` is keyboard-focusable, Enter-activatable, Space-activatable, screen-reader-announced "button," exposed in the page's interactive-element list. A `<div>` with a click handler is none of those things and will fail an accessibility audit. The default `type` of a `<button>` inside a `<form>` is `submit`, but write it explicitly to avoid surprises.

---

## 6. Images and the alt attribute

The `alt` attribute on `<img>` is the one accessibility feature that most beginners get wrong, so we are going to be precise.

### The rule

Every `<img>` element **must have an `alt` attribute**. The W3C validator enforces this. There is no exception. What can vary is *what goes inside the alt*.

### Three cases

**Case 1 — Informative image.** The image carries content the user needs.

```html
<img src="chart.png" alt="A line chart showing site visits rising from 1,200 in January to 4,800 in April 2026.">
```

The alt text *replaces* the image for a user who cannot see it. Describe what the image *says*, not what it *looks like*.

**Case 2 — Decorative image.** The image is pure decoration; the page makes sense without it.

```html
<img src="curly-divider.svg" alt="">
```

An **empty alt** tells the screen reader to skip the image. Use this only when the image truly adds nothing for a non-sighted user. Decorative ornaments, mood photography behind a hero — these are the candidates.

**Important:** `alt=""` is different from omitting `alt`. Omitting `alt` is invalid HTML; some screen readers will then read the filename aloud, which is the worst of both worlds.

**Case 3 — Complex image (chart, diagram, map).** A short alt cannot describe it; the description belongs in the surrounding text.

```html
<figure>
  <img src="org-chart.png" alt="Org chart for the engineering team.">
  <figcaption>
    The engineering team is organized into four pods:
    Platform (led by Alice), Web (led by Ben), Mobile (led by Carla),
    and Data (led by Dev). Each pod has 6–8 engineers.
  </figcaption>
</figure>
```

The alt gives the gist; the caption (visible to everyone) gives the full content.

### How to write good alt text

- **Function over form.** Describe what the image *does* in the page, not what it *contains* pixel-by-pixel.
- **No "image of" or "picture of."** The screen reader already announces the element type.
- **Length: ~125 characters.** A sentence or two. If you need more, you need a `<figcaption>` or a body paragraph.
- **If the image is also a link, the alt is the link's accessible name.** That changes the rules — describe the destination, not the picture.
- **Read it back to yourself with the image hidden.** Does the sentence still tell you what the page is communicating?

---

## 7. ARIA — when HTML is not enough

ARIA (Accessible Rich Internet Applications) is an attribute set that adds accessibility metadata HTML alone cannot express. It is powerful, and it is dangerous: ARIA can *override* the semantics of the element it sits on. The first rule of ARIA is therefore the **No-ARIA rule**.

> **The first rule of ARIA: don't use ARIA.**
>
> If a native HTML element gives you the semantics you need, use it. Reach for ARIA only when no HTML element does the job.

The most common ARIA attributes you will actually need in Week 1:

| Attribute             | When to use                                                                    |
|-----------------------|--------------------------------------------------------------------------------|
| `aria-label="..."`    | Give an interactive element an accessible name when no visible label exists.   |
| `aria-labelledby="id"`| Point to existing text that should serve as the label.                         |
| `aria-describedby="id"`| Point to additional descriptive text.                                          |
| `aria-current="page"` | On the current page's link in a nav, so the screen reader announces "current." |
| `aria-hidden="true"`  | Hide a decorative element from assistive tech (an icon next to a labeled link).|

Two examples:

```html
<nav aria-label="Primary">...</nav>

<a href="/articles/why-semantics-matter" aria-current="page">Why semantics matter</a>
```

We will go deeper in Weeks 5 and 11. For Week 1, use ARIA only when you must.

---

## 8. WCAG 2.2 AA in one page

The Web Content Accessibility Guidelines (WCAG) 2.2 is the standard your future employers will audit your pages against. It's structured as **four principles** — Perceivable, Operable, Understandable, Robust (POUR) — each with success criteria at A, AA, and AAA conformance levels. **AA is the practical compliance target.**

The Week-1-relevant criteria, condensed:

| Criterion                       | What it asks                                                   |
|---------------------------------|----------------------------------------------------------------|
| **1.1.1 Non-text content (A)**  | Every image, icon, and chart has a text alternative.           |
| **1.3.1 Info and relationships (A)** | The structure conveyed visually is also conveyed in the markup (headings, lists, landmarks). |
| **1.3.5 Identify input purpose (AA)** | Use `autocomplete` on inputs that collect known user info.    |
| **2.1.1 Keyboard (A)**          | All functionality works with the keyboard alone.               |
| **2.4.1 Bypass blocks (A)**     | Provide a way to skip past repeated content (a "skip to main" link). |
| **2.4.2 Page titled (A)**       | Every page has a `<title>` that describes its purpose.         |
| **2.4.6 Headings and labels (AA)** | Headings and labels describe topic or purpose.               |
| **3.1.1 Language of page (A)**  | The `<html lang="...">` attribute is set correctly.            |
| **3.3.2 Labels or instructions (A)** | Every form input has a label.                             |
| **4.1.2 Name, role, value (A)** | Every interactive component exposes its name, role, and value to assistive tech (using semantic HTML covers most of this). |

If you ship semantic HTML with labels, alt text, a `<title>`, and the `lang` attribute, you have already cleared most of WCAG 2.2 AA. axe DevTools will catch the rest.

---

## 9. The "skip to main content" link

One small UX pattern, present on every accessible website, often missing from beginner sites:

```html
<body>
  <a class="skip-link" href="#main">Skip to main content</a>

  <header>...</header>

  <main id="main">
    ...
  </main>
</body>
```

For a keyboard-only user landing on a page with a long top nav, the skip link lets them bypass the nav with one tab + Enter. It is invisible to mouse users (CSS makes it visible on focus — Week 2). The HTML cost is two extra elements. The accessibility win is large.

We add it to the mini-project at the end of Week 1, sans CSS — it will be visible at the top of the page. That is fine for now. Week 2 styles it.

---

## 10. Self-check

Without re-reading:

1. Name the seven landmark elements.
2. How many `<h1>`s should a page have, and where should it live?
3. Why is `<button>` accessible by default but a clickable `<div>` is not?
4. Give one example each of an image where alt is descriptive, alt is empty, and alt should be combined with a `<figcaption>`.
5. What does `<html lang="en">` actually change in how a screen reader behaves?
6. What is the first rule of ARIA?

---

## Further reading

- **WHATWG HTML Living Standard — Sections**: <https://html.spec.whatwg.org/multipage/sections.html>
- **MDN — HTML landmarks**: <https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Structuring_content/Structuring_a_page_of_content>
- **W3C — WCAG 2.2 AA quick reference**: <https://www.w3.org/WAI/WCAG22/quickref/?levels=aa>
- **WebAIM — Alternative text**: <https://webaim.org/techniques/alttext/>
- **Inclusive Components — by Heydon Pickering**: <https://inclusive-components.design/>

Next: the [exercises](../exercises/README.md). Type, don't paste.
