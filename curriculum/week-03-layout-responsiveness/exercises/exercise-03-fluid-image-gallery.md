# Exercise 3 — A fluid image gallery

**Time:** ~50 minutes.

## Problem statement

Build a gallery section that displays nine photographs in a Grid. The images hold their aspect ratio, fill their cells, never cause horizontal scroll at any viewport from 320 to 1440 px, and serve appropriately-sized files via `srcset` and `sizes`. Every image has meaningful `alt` text (or empty `alt`, when the image is decorative). The gallery is keyboard-navigable, and clicking any image opens a larger view (you do not need to build the lightbox — but the anchor is in place for the JavaScript Week-7 will add).

```text
┌──────────────────────────────────────────────────┐
│ ●●●    https://example.test/                     │
├──────────────────────────────────────────────────┤
│                                                  │
│   ┌────┬────┬────┐                               │
│   │img │img │img │                               │
│   ├────┼────┼────┤                               │
│   │img │img │img │                               │
│   ├────┼────┼────┤                               │
│   │img │img │img │                               │
│   └────┴────┴────┘                               │
│                                                  │
└──────────────────────────────────────────────────┘
```

At 320 px the gallery is one column; at 600 px, two; at 900 px, three. (Tune to your taste; no fixed breakpoint required.)

## Source content

Create `exercises/exercise-03/index.html` and `exercises/exercise-03/styles.css`. Use the Lorem Picsum service for placeholder images, which supports query params for size:

```html
<a class="thumb" href="https://picsum.photos/seed/one/1600/1200">
  <img src="https://picsum.photos/seed/one/800/600"
       srcset="https://picsum.photos/seed/one/400/300 400w,
               https://picsum.photos/seed/one/800/600 800w,
               https://picsum.photos/seed/one/1200/900 1200w"
       sizes="(min-width: 60em) 33vw,
              (min-width: 36em) 50vw,
              100vw"
       width="800" height="600"
       alt="A meadow at dawn, photographed at a long exposure">
</a>
```

A note on `alt` text: real galleries describe the image's content. For an exercise with placeholder photos, write the alt text as if the photos were a real series — "a meadow at dawn," "a city skyline at dusk," etc. The point is the muscle memory of writing alt text; the placeholder is fine.

## Acceptance criteria

- [ ] `exercises/exercise-03/index.html` and `exercises/exercise-03/styles.css` exist; the stylesheet is linked.
- [ ] Nine images, each wrapped in an `<a>` pointing to a larger version.
- [ ] Every `<img>` has a real (meaningful, descriptive) `alt` attribute. None is empty unless the image is genuinely decorative.
- [ ] Every `<img>` has `width` and `height` attributes (the natural size of the `src`); CSS holds the aspect ratio.
- [ ] Every `<img>` has `srcset` with at least three sizes and a `sizes` attribute that describes how wide the image will render at each breakpoint.
- [ ] The gallery uses `display: grid` with `grid-template-columns: repeat(auto-fit, minmax(min(100%, 240px), 1fr))`.
- [ ] `gap` is at least `var(--space-3)`; images do not touch.
- [ ] `loading="lazy"` is set on every image **except** the first three (which are likely above the fold).
- [ ] The thumbnail anchor has a `:focus-visible` outline that is visible against any image.
- [ ] No horizontal scroll at 320 px; the grid wraps to one column.
- [ ] Page passes the validator and axe DevTools cleanly.
- [ ] In DevTools' Network panel, set the viewport to 320 px and reload. The image files actually fetched should be the smallest ones (`/400/300`), not the largest. (This is `srcset` doing its job; verify it.)

## Hints

<details>
<summary>How do I read <code>sizes</code>?</summary>

`sizes` is a list of media-query → width pairs, evaluated left-to-right. The first matching media query supplies the width. The browser combines `sizes` with `srcset` to pick the right file.

```html
sizes="(min-width: 60em) 33vw,
       (min-width: 36em) 50vw,
       100vw"
```

Read it as: "at viewports ≥ 60em, the image will render at 33% of viewport width; at viewports ≥ 36em, 50% of viewport width; otherwise, 100% of viewport width." The browser multiplies that by the device's DPR and picks the smallest file in `srcset` that meets the need.

If you get `sizes` wrong, the browser over- or under-fetches. The DevTools Network panel tells you which files were actually loaded.

</details>

<details>
<summary>Why <code>width</code> and <code>height</code> attributes on the <code>&lt;img&gt;</code>?</summary>

The browser uses them to compute an `aspect-ratio` before the image has loaded — so the space is reserved, and the page does not jump when the image arrives. This was one of the Core Web Vitals' biggest wins: pages with sized images have near-zero Cumulative Layout Shift. The attribute values are the **natural** size of the `src` (the file's actual width and height); CSS can override the rendered size with `width: 100%`.

If you also declare `aspect-ratio: 4 / 3` in CSS, the CSS value wins. Either approach works; the attributes are the lightest.

</details>

<details>
<summary>How do I write a meaningful focus ring for a thumbnail?</summary>

The anchor wraps the image. Put the ring on the anchor, with an offset, so it sits outside the image:

```css
.thumb {
  display: block;
  position: relative;
  border-radius: var(--radius-1);
}

.thumb:focus-visible {
  outline: 3px solid var(--accent-ring);
  outline-offset: 3px;
}
```

The `:focus-visible` selector triggers only on keyboard focus (not on mouse click), per the spec. Tab to the thumbnail; the ring appears. Click it; no ring. That is the intended behavior — sighted mouse users do not need a ring.

</details>

<details>
<summary>What about <code>&lt;picture&gt;</code> with <code>&lt;source&gt;</code>?</summary>

`<picture>` is for **art direction** — when you want to serve a *different cropped image* at different viewports. (A panoramic shot on desktop; a square crop on a phone.) `srcset` on `<img>` is for **resolution** — when you want the *same image* at a different size. For a gallery thumbnail, `srcset` is the right choice. Save `<picture>` for the lecture-2 stretch goal.

</details>

## Stretch

- Add a `<picture>` element for the **first** image (your "hero" thumbnail): one `<source media="(min-width: 60em)" srcset="...">` with a panoramic crop, one default `<source>` with a square crop. Watch the browser swap the file as you drag the viewport across the breakpoint.
- Make the gallery use the `subgrid` value for row alignment: `grid-template-rows: auto auto;` on the parent, `grid-row: span 2; display: grid; grid-template-rows: subgrid;` on each thumbnail. Each thumbnail's image row and caption row align to its neighbors. (Subgrid shipped in every browser in 2023; it is honest CSS.)
- Add a `prefers-reduced-motion` check around any image-hover transform (a `transform: scale(1.02)` is common). The transform belongs inside `@media (prefers-reduced-motion: no-preference)`; outside, the image stays still.
- In DevTools Network, throttle to "Slow 4G," reload, and watch the gallery load. The first three images (no `loading="lazy"`) arrive immediately; the rest only after you scroll. This is a real Core Web Vitals win that Week 10 will measure.

## Self-check

Open DevTools → Network. Filter by "Img." Reload the page at three viewport widths — 320 px, 600 px, and 1200 px. The files fetched should be different sizes: at 320 px, the 400 / 300 files; at 1200 px, the 800 / 600 or 1200 / 900 files. If they are not — if the browser is fetching the largest file at every viewport — your `sizes` is wrong.

Then tab through the gallery from the URL bar. Each thumbnail should focus in order. Every focus ring should be visible against the image. (If the ring is the same color as the image content, the offset rescues it — that is why `outline-offset` matters.)

## Submission

Commit `exercises/exercise-03/index.html` and `exercises/exercise-03/styles.css` to your Week 3 repo. In your commit message, note the largest image file (in KB) your page loads at a 320 px viewport, and the same number at a 1440 px viewport. If they are the same, you have a `srcset` bug to fix.
