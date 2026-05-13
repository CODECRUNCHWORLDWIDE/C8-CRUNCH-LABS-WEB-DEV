# Challenge 1 — Recreate a magazine spread in HTML and CSS

**Time estimate:** ~140 minutes.

## Problem statement

Pick a real magazine article from a publication that takes editorial typography seriously — The New Yorker, The Atlantic, The Verge, Pitchfork, The Pudding, Polygon, or any longform site you admire. Recreate the **content and typography** of that article as a single styled HTML page. Use only HTML and one CSS file. **No layout libraries; no JavaScript; no images** (or describe images textually with `alt` plus a `<figcaption>` — the typography is the point).

This challenge is about taking the typography lessons in Lecture 2 and exercising them on a long, real-world piece. By the end you will have one styled article page that holds together at every viewport width, in light and dark mode, and reads as well as anything that ships from a CMS.

## Acceptance criteria

- [ ] You picked a real article and noted its URL in a comment at the top of your stylesheet.
- [ ] You did **not** copy the publication's CSS. You wrote the stylesheet yourself, looking at the rendered article.
- [ ] Your folder is `challenges/challenge-01/`, with `index.html`, `styles.css`, and `NOTES.md`.
- [ ] The HTML markup uses last week's semantics correctly — `<article>` for the piece, `<header>` for the masthead, `<h1>` for the headline, `<time>` for the date, `<blockquote>` for pull quotes.
- [ ] The stylesheet opens with a `*, *::before, *::after { box-sizing: border-box; }` rule and a token-driven `:root` block.
- [ ] At minimum these tokens are declared: `--ink`, `--parchment`, `--rule`, `--accent`, `--font-display`, `--font-body`, `--type-base`, `--type-lede`, `--type-h1`, `--type-h2`, `--type-pull`, plus a space scale.
- [ ] Headings use `clamp()` for `font-size` and `text-wrap: balance`.
- [ ] Paragraphs cap at `max-width: 65ch` (or whatever measure your typography wants — defend the choice in `NOTES.md`).
- [ ] A pull quote uses a larger fluid size from a `--type-pull` token, with a hanging quotation mark via `::before { content: open-quote; }`.
- [ ] A `prefers-color-scheme: dark` block produces a coherent dark theme via token overrides only.
- [ ] Every text/background combination passes WCAG 2.2 AA (4.5:1 body, 3:1 large) — light **and** dark.
- [ ] No selector in the file exceeds specificity `(0, 0, 1, 1)` except your `:root` block.
- [ ] The page passes <https://validator.w3.org/nu/> and axe DevTools cleanly.

## Recommended source articles

Pick one whose typography you have admired. Examples with rich structure to work with:

- The Pudding — long-form essays with pull quotes and section breaks.
- The Atlantic — classic magazine type with drop caps, pull quotes, byline blocks.
- The Verge — large display headings, modular subheads.
- A New York Times "The Daily" companion article.
- A long-form Wikipedia article (the typography is plainer, but the structure is rich).
- A blog post from <https://aworkinglibrary.com/>, <https://maggieappleton.com/>, or <https://overreacted.io/> — small sites with deliberate typography.

If the article is paywalled, pick a different one. Use a publication that publishes freely.

## Suggested order of operations

### Phase 1 — Read and sketch (20 min)

Read the article through once for content. Then read it again with a pencil and paper, noting:

- The display headline's size and weight, and how it would scale on mobile.
- The body type — serif or sans? Length per line?
- Any pull quote — how big, where placed?
- The byline and date block — small, light, set apart from the body?
- Section subheadings — how do they relate visually to the body? To the headline?

Sketch a five-row outline on paper: headline / byline / lede / body / pull quote. That is your type scale.

### Phase 2 — Mark up the HTML (30 min)

Open `index.html`. Type the document skeleton from memory. Add the semantic markup — `<article>`, `<header>`, `<h1>`, `<time>`, body paragraphs, `<h2>` subheads, at least one `<blockquote>`, a `<footer>` for the article with tags or attribution.

```text
┌──────────────────────────────────────────────────┐
│ ●●●    https://example.test/article              │
├──────────────────────────────────────────────────┤
│                                                  │
│   <header>                                       │
│     <h1>Headline goes here</h1>                  │
│     <p class="byline">By Author, <time>...</time>│
│   </header>                                      │
│   <p class="lede">First paragraph...</p>         │
│   <p>Body paragraph...</p>                       │
│   <h2>A section</h2>                             │
│   <p>...</p>                                     │
│   <blockquote class="pull">...</blockquote>      │
│                                                  │
└──────────────────────────────────────────────────┘
```

Run validator.w3.org. Zero errors.

### Phase 3 — Tokens first, components second (40 min)

In `styles.css`, declare your tokens first. Pick the palette consciously — note the publication's choice in `NOTES.md` and decide whether you are matching it or diverging.

Then, *and only then*, write the component rules: `body`, `article`, `header`, `h1`, `h2`, `p`, `p.lede`, `.byline`, `blockquote.pull`. Each rule reads from tokens, never from raw values. Keep specificity flat.

### Phase 4 — Dark mode (15 min)

Add the `prefers-color-scheme: dark` block. Override only the token values. Toggle your OS theme; the page flips coherently. If any element looks wrong in dark mode, the bug is almost certainly that it bypassed a token somewhere — read your stylesheet top to bottom and replace the raw value.

### Phase 5 — Contrast audit (15 min)

Open DevTools. Click body text — read the contrast against background. Then click the byline (often lower-contrast). Then the pull quote. Then a link. Each pair must clear 4.5:1 (body) or 3:1 (large text and non-text UI). Tune the tokens until they do.

Run axe DevTools. Zero violations.

### Phase 6 — `NOTES.md` (20 min)

Three sections:

- **The three hardest typographic decisions I made.** For instance: "Did I match the publication's body size or pick a larger one?" Defend each call.
- **Where my version diverges from the publication's.** Open DevTools on the real article and skim its CSS. What did they do that you did not? Note one thing they did better, and one you did better.
- **One token I would tune if I had another hour.** Specificity matters: name the property, the current value, and the direction.

## Stretch

- Add a **drop cap** to the first paragraph of body text using `::first-letter`. Three to four lines tall, in the display family, the brand accent color.

  ```css
  .article-body > p:first-of-type::first-letter {
    font-family: var(--font-display);
    font-size: clamp(3rem, 4vw, 5rem);
    color: var(--accent);
    float: left;
    line-height: 0.85;
    margin-inline-end: 0.5rem;
  }
  ```

- Add a **reading-progress affordance** using a small CSS-only technique. Hint: a sticky-positioned bar at the top of `<main>` with `background: linear-gradient(...)`. We have not done sticky positioning yet; this is genuinely stretch.
- Add a `<figure>` for an image you describe textually in the `<figcaption>` — practice writing the caption typography (smaller size, lighter color, italic or not — defend the choice).

## Why this matters

Magazine sites do typography for a living. Their CSS is some of the most considered in the industry. Re-implementing one with the tools from Lecture 2 will teach you more about what `clamp()`, `text-wrap`, `color-mix()`, and token-driven theming are actually for than any tutorial. The result is a piece of typography you wrote, that you understand line by line, that you can defend in a code review.

After this challenge, you will start noticing typography on every web page you read.

## Submission

Commit `challenges/challenge-01/index.html`, `challenges/challenge-01/styles.css`, and `challenges/challenge-01/NOTES.md` to your Week 2 repo.
