# Exercise 1 — A responsive card grid

**Time:** ~50 minutes.

## Problem statement

Build a section that displays six article cards in a grid. The grid is one column on a 320 px phone, two columns on a tablet, three columns on a laptop, and four columns on a wide desktop — **with no `@media` queries**. The Grid algorithm decides how many columns fit, based on a minimum card width you declare.

Each card has an image (with `alt` text and a held aspect ratio), a heading, a short paragraph, and a "Read more" link. The whole card is clickable. The card has a visible focus ring on keyboard navigation.

```text
┌──────────────────────────────────────────────────┐
│ ●●●    https://example.test/                     │
├──────────────────────────────────────────────────┤
│                                                  │
│   ┌────┐  ┌────┐  ┌────┐                         │
│   │img │  │img │  │img │                         │
│   │    │  │    │  │    │                         │
│   │The │  │A   │  │Six │                         │
│   │new │  │note│  │card│                         │
│   │CSS │  │on  │  │ing │                         │
│   └────┘  └────┘  └────┘                         │
│   ┌────┐  ┌────┐  ┌────┐                         │
│   │img │  │img │  │img │                         │
│   └────┘  └────┘  └────┘                         │
│                                                  │
└──────────────────────────────────────────────────┘
```

## Source content

Create `exercises/exercise-01/index.html` and `exercises/exercise-01/styles.css`. For images, use six placeholders from <https://picsum.photos/seed/picsum/640/480> (replace `picsum` with any seed string to vary the photo). The placeholders return real photographs; that is fine for an exercise.

Each card's HTML looks like:

```html
<article class="card">
  <a class="card-link" href="#">
    <img src="https://picsum.photos/seed/one/640/480"
         alt=""
         width="640" height="480"
         loading="lazy">
    <div class="card-body">
      <h3>The first card</h3>
      <p>A short summary of the first card's content. Two sentences at most.</p>
    </div>
  </a>
</article>
```

The decorative image gets `alt=""` because the heading and paragraph already convey the meaning; the image is illustrative. (Per WCAG 2.2, decorative images take empty alt.)

## Acceptance criteria

- [ ] `exercises/exercise-01/index.html` and `exercises/exercise-01/styles.css` exist; the stylesheet is linked from `<head>`.
- [ ] The stylesheet opens with a `*, *::before, *::after { box-sizing: border-box; }` rule and a small `:root` token block (`--rule`, `--surface-bg`, `--accent`, `--accent-ring`, `--space-3`, `--space-4`, `--radius-1`).
- [ ] `.card-grid` uses `display: grid` with `grid-template-columns: repeat(auto-fit, minmax(min(100%, 260px), 1fr))` and a `gap` from a token.
- [ ] No `@media` query is required for the card grid to wrap; the Grid algorithm handles it.
- [ ] Each card image has `width`, `height`, and `loading="lazy"` attributes; the CSS holds the `aspect-ratio` (4 / 3 is fine) and uses `object-fit: cover`.
- [ ] Each card has a `:focus-visible` outline using `var(--accent-ring)`.
- [ ] The whole card is clickable via a single anchor that wraps the image and the body.
- [ ] The page passes <https://validator.w3.org/nu/> with zero errors.
- [ ] The page passes axe DevTools with zero serious issues.
- [ ] In the Chrome device toolbar, set the viewport to 320, 540, 768, 1024, and 1440 px in turn. The grid wraps cleanly at every width.

## Hints

<details>
<summary>What does <code>minmax(min(100%, 260px), 1fr)</code> mean again?</summary>

The inner `min(100%, 260px)` is the floor of the minmax. It says: "the minimum column width is whichever is smaller, the container's full width or 260 px." On a 320 px phone, the container's full width is smaller than 260 px (after padding), so the column floor drops to the container's width — and you get one column, with no horizontal overflow.

The `1fr` ceiling means: "but no column should be wider than one fraction of the available space." Three cards on a 900 px container? Each column is 300 px.

Together: as many columns as fit, each at least the smaller of (container width, 260 px), each at most a fraction of leftover space.

</details>

<details>
<summary>How do I hold the image's aspect ratio?</summary>

Two declarations:

```css
.card img {
  width: 100%;
  aspect-ratio: 4 / 3;
  object-fit: cover;
  display: block;
}
```

`aspect-ratio: 4 / 3` reserves the space before the image loads — no layout shift when the image arrives. `object-fit: cover` crops the image to fill the box without distortion. The `width` and `height` attributes on the HTML are still useful — the browser uses them to compute the aspect ratio if the CSS does not set it.

</details>

<details>
<summary>The whole card needs to be clickable but I want the link to focus once, not three times. How?</summary>

Wrap the image and the body in a single `<a>`:

```html
<article class="card">
  <a class="card-link" href="/posts/one">
    <img src="..." alt="">
    <h3>...</h3>
    <p>...</p>
  </a>
</article>
```

There is exactly one focusable element per card — the anchor. Tabbing goes to one card, then the next. This is the modern pattern. (The "card wraps multiple links" pattern with a JS-injected hit zone existed for years; the platform now allows a block-level anchor cleanly.)

</details>

<details>
<summary>How do I get a focus ring on the whole card, not just the heading?</summary>

Put `:focus-visible` on the anchor, with a generous `outline-offset`:

```css
.card-link {
  display: block;
  color: inherit;
  text-decoration: none;
}

.card-link:focus-visible {
  outline: 2px solid var(--accent-ring);
  outline-offset: 3px;
  border-radius: var(--radius-1);
}
```

`display: block` ensures the anchor occupies the full card. `outline-offset: 3px` pushes the ring outside the card's border. Tab to the card; the whole card is outlined.

</details>

## Stretch

- Add a seventh and eighth card. Watch the grid keep working — the new cards drop into the existing pattern with no CSS changes.
- Change `auto-fit` to `auto-fill` and reload. Add only four cards. Notice that with `auto-fill`, the four cards stay at their minimum width, leaving empty tracks on the right; with `auto-fit`, the four cards expand to fill the row. Most card grids want `auto-fit`.
- Add a `@container` query: when each card's container is at least 360 px, lay the card horizontally — image on the left, body on the right. Set `container-type: inline-size` on `.card` and write the `@container` rule. The cards now reflow individually as the grid stretches them.
- Add a `prefers-reduced-motion` check around any hover transition you added (a `transform: translateY(-2px)` on `:hover`, say). Inside `@media (prefers-reduced-motion: no-preference)`, declare the transition; outside, skip it.

## Self-check

Open DevTools. Click the "grid" badge next to your `.card-grid`'s `display: grid` declaration. The page overlays the column tracks. Drag the viewport from 320 to 1440 px. The number of columns changes; the badge labels stay accurate.

Then tab through the page from the URL bar. The first Tab should land on the first card; the next, the second; and so on. No tab order surprises. Every card outline is visible.

## Submission

Commit `exercises/exercise-01/index.html` and `exercises/exercise-01/styles.css` to your Week 3 repo. In your commit message, note the smallest viewport width at which your grid still shows two columns. (It is whatever `2 * min-column-width + gap` works out to — useful to know explicitly.)
