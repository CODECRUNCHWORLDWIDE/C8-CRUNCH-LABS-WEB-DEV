# Lecture 1 — What HTML Actually Is

> **Outcome:** You can answer "what is HTML?" in three sentences, write the document skeleton from memory, run a page through validator.w3.org, and explain why `<div>`-soup is a problem.

## 1. HTML is a tree

When you save a file called `index.html` and open it in a browser, the browser does **not** treat your file as a screen layout. It treats it as a description of a *tree of elements*. That tree is called the **Document Object Model**, or **DOM**, and the browser builds it before any CSS is applied and before any JavaScript runs.

Consider this tiny file:

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <title>Hello</title>
  </head>
  <body>
    <h1>Hello, world</h1>
    <p>This is a paragraph.</p>
  </body>
</html>
```

The tree the browser builds looks like this:

```text
Document
└── html  (lang="en")
    ├── head
    │   ├── meta  (charset="utf-8")
    │   └── title
    │       └── "Hello"
    └── body
        ├── h1
        │   └── "Hello, world"
        └── p
            └── "This is a paragraph."
```

That tree is the truth of your page. CSS decorates it. JavaScript walks and edits it. Screen readers traverse it. Search engines index it. Everything downstream of "the browser parsed your HTML" reads this tree.

This is the first mental shift Week 1 wants you to make: **stop thinking of HTML as a screen layout. Start thinking of HTML as a tree of meaning that several different audiences will consume.**

The audiences:

1. **Sighted users** — see the page after CSS and JS run.
2. **Screen reader users** — hear the tree read aloud, top to bottom, with the ability to jump between landmarks.
3. **Search engines** — read the tree to figure out what the page is about.
4. **Other tools** — readability mode, translation tools, reader apps, link previews — all read the tree.

If your tree is wrong (a `<div>` where you needed a `<button>`, an `<h3>` where you needed an `<h2>`), you have made the page worse for at least three of those four audiences. CSS cannot fix that. JavaScript cannot fix that. Only better HTML can fix that.

---

## 2. Elements, attributes, content

The atomic unit of HTML is the **element**. Most elements look like this:

```html
<p class="lede">A first paragraph.</p>
```

There are three things to name in that one line:

- The **tag**: `<p>` opens the element, `</p>` closes it.
- The **attribute**: `class="lede"` — a name (`class`) and a value (`"lede"`). Attributes live on the opening tag only.
- The **content**: the text `A first paragraph.` sits between the open and close tags. Content can also be other elements.

Some elements are **void** — they have no closing tag and no content:

```html
<img src="cat.jpg" alt="A black cat asleep on a keyboard">
<br>
<meta charset="utf-8">
```

A few things to learn early and never forget:

- **HTML is case-insensitive but lowercase is the convention.** Write `<p>`, not `<P>`. The validator will tolerate either; humans reading your source will appreciate consistency.
- **Quote attribute values.** `class="lede"` not `class=lede`. The HTML parser accepts unquoted attribute values in some cases, but you will trip eventually. Quote them, always.
- **Never make up elements.** `<my-card>` is not an HTML element. (There is a separate Web Components feature for that, which we will not need until later.) If you find yourself wanting a tag that does not exist, you almost always want `<section>`, `<article>`, `<aside>`, or `<div>` with appropriate semantics.
- **Boolean attributes.** Attributes like `required`, `disabled`, `checked`, `readonly` are *boolean* — their presence is the value. `<input required>` and `<input required="">` and `<input required="required">` all mean the same thing. The first form is canonical.
- **Comments.** `<!-- like this -->`. They are visible in View Source. Do not put secrets in HTML comments. Do use them to leave context for the next reader.

There are about a hundred elements in the HTML spec. You will use roughly twenty regularly. The rest you will look up by name on MDN the day you need them. Nobody has the full list memorized — what experienced developers have memorized is the *right element for the job*, which is what Lecture 2 is about.

---

## 3. The document skeleton

Every HTML page you ship for the rest of your career starts with the same skeleton:

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>The page title that appears in the tab</title>
  </head>
  <body>
    <!-- Page content goes here. -->
  </body>
</html>
```

Memorize it. Type it out from scratch ten times this week. The pieces:

### `<!doctype html>`

A single line that tells the browser "this is HTML5; parse it in standards mode." If you omit it, the browser falls back to **quirks mode**, an emulation of 1990s browsers, and your page will look subtly wrong in ways that are very hard to debug. Always include it.

### `<html lang="en">`

The root element. The **`lang` attribute is mandatory** for accessibility — screen readers use it to choose a pronunciation engine. A page in French read by an English engine sounds like comedy. Use the appropriate [BCP 47 language tag](https://www.w3.org/International/articles/language-tags/): `en`, `es`, `fr`, `en-US`, `pt-BR`, etc.

### `<meta charset="utf-8">`

The character encoding declaration. UTF-8 is the only encoding you ever need. Always declare it. **First child of `<head>`** — the browser uses the first 1024 bytes of your file to detect encoding, so the declaration has to land early.

### `<meta name="viewport" content="width=device-width, initial-scale=1">`

The viewport meta. Without it, mobile browsers render your page at a fake 980-pixel width and then scale it down — looking shrunken and unreadable. Always include it. We come back to *why* in Week 3 (responsive layout).

### `<title>...</title>`

The text in the browser tab, the bookmark, the link preview, the search result. Required. One per page. Write it like a headline, not like a slug.

### `<body>`

Everything the user sees lives inside `<body>`. The structure of `<body>` is what Lecture 2 is about.

---

## 4. Block and inline (a historical sketch)

You will hear two adjectives a lot: **block** and **inline**. They are historical categories that described how HTML elements rendered *before* CSS could change that:

- **Block** elements (think `<p>`, `<h1>`, `<div>`, `<section>`) started on a new line and filled the available width.
- **Inline** elements (think `<a>`, `<span>`, `<strong>`, `<em>`, `<img>`) flowed within a line of text.

In 2026, CSS controls rendering — you can make a `<p>` render inline-block, a `<span>` render as a flex container, and so on. The block/inline split is no longer a fixed property of an element. But the *content model* (what is allowed to go inside what) still respects the historical categories:

- A `<p>` cannot contain another `<p>`. The parser will silently close the first one.
- A `<div>` can contain almost anything.
- An `<a>` can contain block-level content in HTML5 — a small but useful relaxation of the older rule.
- Form-related elements have their own rules (`<button>` cannot contain another interactive element).

For Week 1, you do not need to memorize the content model. You need to know it exists, and you need to trust the W3C validator when it tells you "this element is not allowed here."

---

## 5. Encoding, viewport, language — get these right once

These three attributes are easy to forget and consequential when missing. Get them right once, then never think about them again.

| Declaration                                                            | Why it matters                                                              | What goes wrong if missing                                                                            |
| ---------------------------------------------------------------------- | --------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| `<meta charset="utf-8">`                                               | Tells the browser how to decode bytes into characters                       | Accented characters render as `Ã©`, emoji break, Asian-language text becomes mojibake                 |
| `<meta name="viewport" content="width=device-width, initial-scale=1">` | Tells mobile browsers to use the device width as the layout viewport        | On phones, the page renders at fake desktop width then scales down — tiny text, blurry images         |
| `<html lang="en">`                                                     | Tells assistive tech and search engines which language the page is in       | Screen reader pronounces English text with a Spanish engine; Google may rank the page wrong           |

A small joke: every senior frontend engineer has, at some point, debugged a "weird character" bug for two hours before remembering the charset declaration was missing. Do not be that person.

---

## 6. Validation: a free check the rest of the industry forgot to use

The W3C runs a free service at **<https://validator.w3.org/>** (and a sister tool at <https://validator.w3.org/nu/>) that will read your HTML and tell you every place it does not conform to the spec. Things it catches:

- Unclosed tags.
- Misnested elements (`<p><div></div></p>` — `<div>` is not allowed inside `<p>`).
- Missing required attributes (an `<img>` with no `alt`, for instance).
- Duplicate `id` attributes.
- Bad attribute values (`<input type="emial">`).
- Wrong content model (`<button>` inside `<button>`).

Run every page through it. Aim for **zero errors and zero warnings**. The validator is right almost every time; when it is wrong, you will know enough to argue with it (this happens about once a year).

The browser will *also* render your invalid HTML — that is the whole point of HTML's "be liberal in what you accept" history. But it will render it according to error-recovery rules that no two browsers fully agree on, and the result may not be the tree you intended. Validation eliminates that whole class of bug.

---

## 6.5. How to read a validator error

Validator error messages look intimidating the first time. They are precise; precision reads as terseness. Here are three real ones and how to decode them.

**Example 1.**

> *Error: Element `li` not allowed as child of element `div` in this context.*
>
> *Line 14, column 5: `    <li>Home</li>`*

What it is telling you: an `<li>` (list item) is only legal inside `<ol>`, `<ul>`, or `<menu>`. You wrote one inside a `<div>`. Fix: wrap the `<li>` in a `<ul>` (or `<ol>` if order matters).

**Example 2.**

> *Error: An `img` element must have an `alt` attribute, except under certain conditions.*
>
> *Line 32, column 1: `<img src="cat.jpg">`*

What it is telling you: you forgot `alt`. Add `alt="..."` if the image is informative, or `alt=""` if decorative. The "except under certain conditions" hedge is for advanced cases (`<figure>` with a `<figcaption>` and an explicit ARIA role) — you do not hit those in Week 1.

**Example 3.**

> *Error: Stray end tag `div`.*
>
> *Line 87, column 1: `</div>`*

What it is telling you: a `</div>` appeared with no matching `<div>` open. Either you have an extra closing tag, or one of the opening tags above it is misspelled (`<diiv>` would do it). Hunt upward in the file.

The pattern: the validator names the **element**, the **context**, and the **line/column**. With those three pieces, every error is fixable in under a minute, once you know how to read them. Read every error all the way through — sometimes a confusing error on line 100 is caused by an error on line 50 that cascaded.

---

## 7. Why "div soup" is bad

Here is a page written by someone who learned `<div>` and stopped:

```html
<div class="header">
  <div class="logo">My Site</div>
  <div class="nav">
    <div class="nav-item"><a href="/about">About</a></div>
    <div class="nav-item"><a href="/contact">Contact</a></div>
  </div>
</div>
<div class="main">
  <div class="article">
    <div class="article-title">My first post</div>
    <div class="article-body">Lorem ipsum...</div>
  </div>
</div>
<div class="footer">
  <div class="copyright">© 2026</div>
</div>
```

Now here is the same page written with the elements HTML provides:

```html
<header>
  <p>My Site</p>
  <nav>
    <ul>
      <li><a href="/about">About</a></li>
      <li><a href="/contact">Contact</a></li>
    </ul>
  </nav>
</header>
<main>
  <article>
    <h1>My first post</h1>
    <p>Lorem ipsum...</p>
  </article>
</main>
<footer>
  <p>&copy; 2026</p>
</footer>
```

Both render identically on screen until CSS is added. So what is the difference?

**A screen reader user can navigate the second one and not the first.** Screen readers expose a "landmarks" list — `header`, `nav`, `main`, `footer`, `aside` — and let users jump straight to any of them. In the div-soup version, the user has to read every line top to bottom. In the semantic version, "skip to main content" is built in.

**A search engine indexes the second one more accurately.** Google does not literally penalize div soup, but it weights content inside `<main>` and `<article>` differently from content inside generic containers.

**A future maintainer reads the second one faster.** "What is this block?" is answered by the tag name, not by the class name. Class names lie (someone renames the CSS file and forgets the class); the tag does not.

**The browser's built-in features rely on it.** Reader mode strips out everything that is not an `<article>` or close to one. Skip-to-content links target `<main>`. Print stylesheets default to hiding `<nav>`. Save those features. Pay them with semantics.

`<div>` is not banned — it is the right answer when no semantic element fits. The rule is: **reach for a semantic element first; fall back to `<div>` only when nothing semantic applies**. After Lecture 2, you will have the full set in your head.

---

## 8. The "no CSS" view

Open your browser. Disable CSS (Chrome DevTools → Cmd/Ctrl+Shift+P → "Disable CSS" or use the [Web Developer extension](https://chrispederick.com/work/web-developer/)). Visit a great site — `[https://wikipedia.org](https://wikipedia.org)`, `[https://a11yproject.com](https://a11yproject.com)`, or your favorite blog.

The page still works. The headings still look like headings (because browser defaults render `<h1>` larger than `<h2>`). The lists still look like lists. The links still look like links. You can read top to bottom and understand the content.

That is the test. **Every page you ship should still be usable with CSS turned off.** If yours collapses to an unreadable wall of text or, worse, an empty page, your HTML is hiding behind your CSS. We are going to fix that in Week 1 and never let it happen again.

This is also the test screen-reader users effectively run, every day, with every page they visit. They are not "seeing your CSS." They are hearing the document order of your HTML. When you make sure the no-CSS view reads well, you have done the hardest part of the accessibility work for free.

---

## 9. Browser dev tools: the Elements panel is the DOM

Open any page. Press `F12` (Windows/Linux) or `Cmd+Opt+I` (macOS) to open DevTools. The first tab is **Elements**. What you see there is *not* your HTML source — it is the **DOM**, the in-memory tree the browser parsed your HTML into.

The distinction matters in two cases:

- **Auto-correction.** If your HTML has a stray `<tbody>` or a missing `</p>`, the browser silently inserts or closes elements according to its error-recovery rules. The Elements panel shows the corrected tree, not your source. If you wonder "why does my page have a `<tbody>` I never wrote?" — the answer is "because you have a `<table>` and the browser added one for you."
- **JavaScript edits.** Anything a script does to the page (in Week 4 and beyond) shows up in the Elements panel, not in View Source.

For Week 1 you will not have JavaScript, so the Elements panel will be very close to your source. But get used to it: it is the canonical truth of your page.

The "View Source" command (`Cmd+U` / `Ctrl+U`) shows the *original* HTML the server sent. Useful for checking what was actually downloaded, but the Elements panel is what you reason about.

---

## 10. Self-check

Without re-reading:

1. What is the DOM, and when does the browser build it?
2. What are the three required elements inside `<head>` for a page to be considered correctly set up?
3. What does `<!doctype html>` do? What happens if you forget it?
4. Why is `<html lang="...">` an accessibility requirement, not a niceness?
5. Why is `<div>`-soup worse than semantic HTML if both render identically on screen?
6. Where do you paste your HTML to validate it against the official spec?

---

## Further reading

- **WHATWG HTML Living Standard — Introduction**: <https://html.spec.whatwg.org/multipage/introduction.html>
- **MDN — Getting started with HTML**: <https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Structuring_content/Basic_HTML_syntax>
- **MDN — The head metadata in HTML**: <https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Structuring_content/Webpage_metadata>
- **"Resilient Web Design" — Chapter 1, "Foundations"** by Jeremy Keith: <https://resilientwebdesign.com/chapter1/>

Next: [Lecture 2 — Semantics, Headings, Landmarks, Accessibility](./02-semantics-headings-landmarks-a11y.md).
