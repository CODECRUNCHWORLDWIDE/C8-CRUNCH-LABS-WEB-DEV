# Exercise 2 — Fix the bad HTML

**Time:** ~50 minutes.

## Problem statement

Below is a real-looking page written by someone who knows `<div>` and not much else. Rewrite it semantically. Same content, same intent, but using the right elements throughout. Then validate, then audit.

## The bad HTML

Save this as `exercises/exercise-02/before.html`:

```html
<!doctype html>
<html>
<head>
<title>my blog</title>
</head>
<body>
<div class="header">
  <div class="logo">jordan park</div>
  <div class="links">
    <div class="link"><a href="/">home</a></div>
    <div class="link"><a href="/about">about</a></div>
    <div class="link"><a href="/posts">posts</a></div>
  </div>
</div>

<div class="content">
  <div class="post">
    <div class="post-title">Why I Switched Editors</div>
    <div class="post-meta">posted on 5/13/2026 by jordan</div>
    <div class="post-body">
      <div>I used VS Code for four years and last week I switched to Helix.</div>
      <div>Here are the three things that changed my mind.</div>
      <div class="subheading">1. Modal editing</div>
      <div>Once you learn it, you stop reaching for the mouse.</div>
      <div class="subheading">2. Tree-sitter built in</div>
      <div>Syntax highlighting is fast and the picker is good.</div>
      <div class="subheading">3. No plugin churn</div>
      <div>Everything ships with the editor.</div>
    </div>
  </div>

  <div class="comments">
    <div class="comments-title">Replies</div>
    <div class="comment">
      <div class="comment-author">alex</div>
      <div class="comment-body">i tried helix and bounced. neovim won me.</div>
    </div>
    <div class="comment">
      <div class="comment-author">sam</div>
      <div class="comment-body">have you tried zed? it's good now.</div>
    </div>
  </div>
</div>

<div class="sidebar">
  <div class="sidebar-title">About me</div>
  <div>Jordan Park, software engineer in Miami. <span class="email" onclick="alert('mailto')">jordan@example.test</span></div>
</div>

<div class="footer">
  <div>(c) 2026 jordan park. <span class="link"><a href="/feed.xml">rss</a></span></div>
</div>

<img src="cat.jpg">
</body>
</html>
```

## Acceptance criteria

Rewrite the page as `exercises/exercise-02/after.html`. It must:

- [ ] Open with `<!doctype html>` and use `<html lang="en">`.
- [ ] Include `<meta charset="utf-8">` and a viewport meta in `<head>`.
- [ ] Have a `<title>` more useful than "my blog" — something like "Why I Switched Editors — Jordan Park".
- [ ] Use `<header>`, `<nav>`, `<main>`, `<article>`, `<section>`, `<aside>`, `<footer>` where they fit.
- [ ] Use `<h1>` for the post title, `<h2>` or `<h3>` for the three numbered subheadings, in a consistent hierarchy that does not skip levels.
- [ ] Use `<time datetime="2026-05-13">` for the post date.
- [ ] Replace the `<div class="link">` wrappers around nav links with an `<ul>` of `<li>` of `<a>`.
- [ ] Replace the comments block with a list of comments, each as its own `<article>` (a comment is a self-contained composition).
- [ ] Replace the email `<span>` with an `<a href="mailto:...">`. Remove the `onclick`.
- [ ] Replace `<img src="cat.jpg">` with either: (a) an `<img>` with descriptive `alt` text if the cat is informative, or (b) `<img alt="">` if the cat is decoration. Decide which and defend it in a comment in the HTML.
- [ ] Pass <https://validator.w3.org/nu/> with zero errors.
- [ ] Pass axe DevTools with zero "serious" or "critical" issues.

## Hints

<details>
<summary>How do I decide if a comment is an `<article>`?</summary>

The HTML Living Standard explicitly lists "a user-submitted comment" as an example of an `<article>`. It is self-contained content that could stand alone. The whole list of comments can be a `<section>` with its own heading.

</details>

<details>
<summary>Where does "About me" go?</summary>

It is tangential content alongside the main post — that is the textbook definition of `<aside>`. Inside `<aside>`, you can have an `<h2>` heading ("About me"), a paragraph, and an `<address>` with the email.

</details>

<details>
<summary>What heading level for "Replies"?</summary>

`<h2>`. It is a sibling section to the post body, one level below the post title (`<h1>`). Then each comment can use `<h3>` for its author, or skip the heading and rely on the `<article>` boundary plus a paragraph.

</details>

<details>
<summary>What do I do about the inline `onclick`?</summary>

Delete it. Replace the `<span>` with an `<a href="mailto:jordan@example.test">jordan@example.test</a>`. A mailto link is the correct platform feature for "click this to email me." `onclick` is not.

</details>

## Stretch

- Add `aria-label="Primary"` to the top `<nav>` so it has a clear name.
- Add `aria-current="page"` to whichever nav link represents the current page.
- Add a `<figure>` and `<figcaption>` around the cat photo if you decide the cat is informative.
- Add a "skip to main content" link as the first thing in `<body>`.

## Self-check

Open both `before.html` and `after.html` in your browser side by side. They should look almost identical (with no CSS, the differences are subtle — landmark elements may have slight default spacing). Now open the **Elements** panel in DevTools on both. The `after.html` tree should be visibly cleaner.

Now disable CSS and tab through the page with the keyboard. Notice how `<a>` and `<button>` (and your `mailto:` link) are focusable. The `<span class="email" onclick=...>` from the bad version was not focusable and not keyboard-activatable — that is one of the bugs you just fixed.

## Submission

Commit both `before.html` and `after.html` to your Week 1 repo. In your commit message, list the three biggest semantic changes you made and one accessibility bug you fixed.
