# Challenge 1 — Recreate a real news article in semantic HTML

**Time estimate:** ~120 minutes.

## Problem statement

Pick a real news article from a publication that takes editorial design seriously — The Verge, The Atlantic, ProPublica, The Guardian, BBC, NPR, Wikipedia, MDN, or any blog you admire. Recreate the **content** of that article as a single HTML page, using semantic HTML only, with **no CSS** and **no JavaScript**.

This challenge is about translation. Real publications use a lot of HTML structure under their CSS. You will see it for the first time by stripping the CSS away.

## Acceptance criteria

- [ ] You picked a real article and noted its URL in a comment at the top of your file.
- [ ] You did **not** copy the publication's HTML source. You wrote the markup yourself, looking at the rendered article.
- [ ] Your file is named `index.html` in a folder `challenges/challenge-01/`.
- [ ] The document skeleton is correct (doctype, `lang`, charset, viewport, title).
- [ ] The page uses, at minimum, `<header>`, `<nav>`, `<main>`, `<article>`, `<footer>`.
- [ ] The article's own `<header>` includes the headline as `<h1>`, the subhead (if any) as `<p>`, the byline, and the publish date as `<time datetime="...">`.
- [ ] Section subheadings inside the article use a consistent hierarchy (`<h2>` and below, no skipped levels).
- [ ] Any pull quotes use `<blockquote>` with a `cite` attribute pointing to the source.
- [ ] Any images use real `<img>` tags with descriptive `alt` text. Use a `<figure>` and `<figcaption>` when the image has a caption in the original.
- [ ] Any author bio or "related stories" sidebar lives in an `<aside>`.
- [ ] The page passes <https://validator.w3.org/nu/> with zero errors and zero warnings.
- [ ] The page passes axe DevTools with zero critical and zero serious issues.
- [ ] A `NOTES.md` in the same folder lists three semantic decisions you had to make and how you resolved each.

## Recommended source articles

Pick one you find interesting; the structure of any well-edited longform article will give you all the practice you need. Examples that have rich structure:

- A New York Times "The Daily" companion article.
- A Wikipedia article on a topic with multiple sections, references, and an infobox sidebar (the infobox is your `<aside>`).
- A long-form Verge or Polygon review (headline, subhead, sections, pull quotes, related links).
- The MDN page on any element you have learned this week. (Meta in a good way.)
- A BBC News article.

If the article is paywalled, pick a different one. Use a publication that publishes freely.

## Suggested order of operations

### Phase 1 — Read the article first (15 min)

Read the article through. Make a one-page outline by hand on paper or in a text editor:

- Headline
- Subhead
- Byline + date
- Section 1 heading, paragraphs, any image
- Section 2 heading, paragraphs
- Pull quote, sidebar
- Related stories
- Footer

This is the document outline. You will mark up against this outline.

### Phase 2 — Sketch the landmarks (10 min)

Open `index.html`. Type the document skeleton from memory. Then sketch the body in landmarks only, with HTML comments standing in for content:

```html
<body>
  <a href="#main">Skip to main content</a>
  <header>
    <!-- Publication logo, top-level nav -->
  </header>
  <main id="main">
    <article>
      <header>
        <!-- Headline, subhead, byline, publish date -->
      </header>
      <!-- Body sections -->
      <footer>
        <!-- Tags, share links -->
      </footer>
    </article>
    <aside>
      <!-- Related stories, sidebar -->
    </aside>
  </main>
  <footer>
    <!-- Site-wide footer -->
  </footer>
</body>
```

### Phase 3 — Fill in the content (60 min)

Replace the comments with real content from the article. Write the alt text for every image (do not skip — if the original has decorative images, give them `alt=""`).

### Phase 4 — Validate and audit (20 min)

Run the page through validator.w3.org and axe DevTools. Fix everything they complain about. Re-run.

### Phase 5 — Write `NOTES.md` (15 min)

Three sections:

- **The three hardest semantic decisions I made.** For instance: "Was the infobox an `<aside>` or a `<section>`?" Defend each call.
- **Where the original publication's HTML disagreed with mine** (open DevTools on the real article and skim — do they use `<article>`? Do they use `<h1>` correctly? Most major publications do; a few do not).
- **The most surprising thing I learned from doing this.**

## Stretch

- Pick a second article from a different publication, recreate it too, and compare the structures.
- View the source on the publication's site and try to identify three things they did better than your version, and three things you did better than theirs.
- Hand the file to a friend who has never written HTML and ask them to identify each landmark by reading your source. If they can, the markup is doing its job.

## Why this matters

Every week of C8 builds toward writing the markup behind real-looking sites. Real-looking sites are dense with structure. The fastest way to internalize that is to translate a piece you have read against the markup you have learned. After this challenge, you will start *seeing* the structure under every web page you visit — in the same way that learning a little carpentry changes how you see chairs.

## Submission

Commit `challenges/challenge-01/index.html` and `challenges/challenge-01/NOTES.md` to your Week 1 repo.
