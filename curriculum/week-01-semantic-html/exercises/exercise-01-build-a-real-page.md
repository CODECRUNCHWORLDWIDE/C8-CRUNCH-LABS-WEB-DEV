# Exercise 1 — Build a real page

**Time:** ~50 minutes.

## Problem statement

Below is the plain-text content of a short article. Mark it up as a complete, valid HTML5 page. No CSS, no JavaScript. Pure semantic HTML.

## Source content

```
Why Semantics Matter
A short essay
By Jordan Park, May 13, 2026

When you write a page using only <div> elements, the browser still renders
it. The page works. So why do experienced developers insist on using <article>,
<section>, <nav>, and friends?

The reasons divide into three categories.

Reason 1: Accessibility
Screen readers expose semantic regions to their users as navigation landmarks.
A blind user can jump to "main content" in one keystroke if you used a <main>
element. They cannot if you used <div class="main">.

Reason 2: Maintainability
Six months from now, a colleague will read your code. The tag <article> tells
them "this is a self-contained piece of content." The string class="article"
tells them only that whoever wrote the CSS chose that class name. Tags are
contracts; classes are conventions.

Reason 3: Future tools
Reader-mode browsers, translation tools, and search engines all read semantic
HTML and treat it preferentially. Your page becomes more useful in contexts
you did not anticipate.

In a future essay, I'll cover the seven landmark elements in detail. For
now, the recommendation is simple: when an HTML element fits, use it. Fall
back to <div> only when nothing semantic applies.

Filed under: HTML, accessibility, web standards.

Contact the author at jordan@example.test.
```

## Acceptance criteria

- [ ] The file is named `index.html` and saved in `exercises/exercise-01/`.
- [ ] It opens with `<!doctype html>` and uses `<html lang="en">`.
- [ ] `<head>` contains a `<meta charset>`, a viewport `<meta>`, and a meaningful `<title>`.
- [ ] The article body is wrapped in an `<article>` element inside `<main>`.
- [ ] The article has its own `<header>` containing the title, subtitle, and byline.
- [ ] The byline date uses `<time datetime="2026-05-13">`.
- [ ] The three reasons use a heading hierarchy that does not skip levels.
- [ ] The "Filed under" line uses a list (your choice of `<ul>` or a paragraph with comma-separated `<a>` links — defend your choice).
- [ ] The contact email is wrapped in `<address>` with an `<a href="mailto:...">`.
- [ ] You ran the page through <https://validator.w3.org/nu/> and it passes with zero errors and zero warnings.
- [ ] The page is readable end-to-end with CSS disabled (it will be — there is no CSS).

## Hints

<details>
<summary>What heading level should the article title be?</summary>

`<h1>`. There is one main content block on the page, and the title of that block is the page's `<h1>`. Inside the `<article>`'s `<header>`, the title gets `<h1>`, the subtitle gets `<p>` (it is not a heading; it is a tagline), and the byline gets `<p>`.

</details>

<details>
<summary>What level should "Reason 1", "Reason 2", "Reason 3" be?</summary>

`<h2>`. They are direct children of the article — one level below the `<h1>`.

</details>

<details>
<summary>How do I mark up the byline date?</summary>

```html
<p>By Jordan Park, <time datetime="2026-05-13">May 13, 2026</time></p>
```

The `datetime` attribute is the machine-readable form. The visible text can be any format you like.

</details>

<details>
<summary>How do I mark up the contact line?</summary>

```html
<address>Contact the author at <a href="mailto:jordan@example.test">jordan@example.test</a>.</address>
```

`<address>` is for the contact info of the nearest `<article>` or `<body>`. Inside an article, it is the contact for the article's author.

</details>

## Stretch

- Add a "skip to main content" link as the first thing in `<body>`. It will be visible at the top of the page until we add CSS in Week 2. That is fine.
- Add a `<nav>` block with three placeholder links at the top of the page.
- Wrap the "Filed under" line in a `<footer>` element inside the `<article>`. Note that `<footer>` is allowed inside `<article>`.

## Self-check

Read the page top to bottom with CSS off. Does the heading hierarchy make sense? Could you describe the outline of the page out loud, without looking? If you have access to a screen reader (VoiceOver: `Cmd+F5`; NVDA: free download), turn it on and listen to the page read aloud. Notice how the landmarks announce themselves.

## Submission

Commit `exercises/exercise-01/index.html` to your Week 1 repo. In your commit message, note any judgment calls you made (for example, why you chose `<ul>` over comma-separated links for "Filed under").
